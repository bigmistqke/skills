// Check, with the analyzer, whether each answer means what its statement's formula means, in the canon's own model.
// Input: a JSON array [{id, alloy}]; output, in the same order: [{id, verdict: same|differs|malformed|skipped, error?}].
// Many checks share one analyzer run per canon; a chunk that does not compile is split until the culprit runs alone.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const dir = new URL('.', import.meta.url).pathname;
const jar = join(dir, '..', 'alloy.jar');
const corpus = Object.fromEntries(JSON.parse(readFileSync(join(dir, 'corpus.json'), 'utf8')).map(x => [x.id, x]));
const [input, output] = process.argv.slice(2);
const answers = JSON.parse(readFileSync(input, 'utf8'));
const work = mkdtempSync(join(tmpdir(), 'equiv-'));
const models = {}, bounds = {};
const modelOf = doc => (models[doc] ??= readFileSync(join(dir, `${doc}.als`), 'utf8'));
const boundsOf = doc => (bounds[doc] ??= readFileSync(join(dir, `${doc}.bounds`), 'utf8').trim());

const java = (file, cwd) => new Promise(done => {
  const p = spawn('java', ['-jar', jar, 'exec', '-f', '-s', 'glucose', '-c', '*', file], { cwd });
  let text = '';
  p.stdout.on('data', d => (text += d));
  p.stderr.on('data', d => (text += d));
  const timer = setTimeout(() => { text += '\nTIMEOUT'; p.kill(); }, 1800000);
  p.on('close', () => { clearTimeout(timer); done(text); });
});

// Run one chunk of indexes (all of one canon); returns a map index → verdict.
async function chunk(doc, idx) {
  const cwd = mkdtempSync(join(work, 'q-'));
  const file = join(cwd, 'q.als');
  const checks = idx.map(i => `check q${i} { (${corpus[answers[i].id].formula.trim()}) <=> (${answers[i].alloy}) } ${boundsOf(doc)}`);
  writeFileSync(file, `${modelOf(doc)}\n${checks.join('\n')}\n`);
  const text = await java(file, cwd);
  const found = new Map();
  for (const m of text.matchAll(/check q(\d+)\s.*?\b(UNSAT|SAT)\b/g)) found.set(Number(m[1]), m[2] === 'UNSAT' ? 'same' : 'differs');
  if (found.size === idx.length) return idx.map(i => ({ i, verdict: found.get(i) }));
  // Solved checks keep their verdict; only the rest run again.
  if (found.size > 0) {
    const rest = idx.filter(i => !found.has(i));
    return [...[...found].map(([i, verdict]) => ({ i, verdict })), ...(await chunk(doc, rest))];
  }
  if (idx.length === 1) {
    if (/TIMEOUT/.test(text)) return [{ i: idx[0], verdict: 'timeout' }];
    const error = text.split('\n').filter(l => /rror|yntax|Type|cannot|ambiguous/i.test(l)).slice(0, 2).join(' ').slice(0, 400);
    return [{ i: idx[0], verdict: 'malformed', error }];
  }
  const half = Math.ceil(idx.length / 2);
  return [...(await chunk(doc, idx.slice(0, half))), ...(await chunk(doc, idx.slice(half)))];
}

const verdicts = answers.map(a => {
  const x = corpus[a.id];
  return !x || /^\s*(pred|fun)\s/.test(x.formula) || !a.alloy ? { id: a.id, verdict: 'skipped' } : undefined;
});
const byDoc = {};
answers.forEach((a, i) => { if (!verdicts[i]) (byDoc[corpus[a.id].doc] ??= []).push(i); });
const jobs = [];
for (const [doc, idx] of Object.entries(byDoc)) for (let k = 0; k < idx.length; k += 25) jobs.push([doc, idx.slice(k, k + 25)]);
let next = 0, done = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < jobs.length) {
    const [doc, idx] = jobs[next++];
    const t0 = Date.now();
    for (const r of await chunk(doc, idx)) verdicts[r.i] = { id: answers[r.i].id, verdict: r.verdict, ...(r.error ? { error: r.error } : {}) };
    console.error(`chunks ${++done}/${jobs.length} (${doc}, ${idx.length} checks, ${Math.round((Date.now() - t0) / 1000)}s)`);
  }
}));
writeFileSync(output, JSON.stringify(verdicts, null, 1));
const n = {};
for (const v of verdicts) n[v.verdict] = (n[v.verdict] ?? 0) + 1;
console.log(n);
