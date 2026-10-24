// Score readers' answers: each answer is checked against the statement's formula with the Alloy analyzer, as
// `check { (formula) <=> (answer) } <bounds>` in the canon's own model (adapted from the 2026-10-20 study's equiv.mjs).
// A miss is checked again against the misreadings of the rule the statement is about: the rule read two-way
// ("exactly when", `implies` taken as `iff`) and the rule read the other way round (converse).
//
// Usage: node scripts/score.mjs [--out DIR] [--packet A|B] answers.json ...
//   The packet of a file is the name of its folder (readers/A/answers-x.json is packet A) unless --packet comes before it.
//   With no files, it scores every readers/*/answers-*.json. Writes DIR/scores.json and DIR/report.txt (default DIR: scores/).
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
const root = join(new URL('.', import.meta.url).pathname, '..');
const JAVA = process.env.JAVA ?? '/opt/homebrew/opt/openjdk@21/bin/java';
const JAR = process.env.ALLOY_JAR ?? '/Users/bigmistqke/Documents/GitHub/skills/tools/alloy.jar';

const args = process.argv.slice(2);
let out = join(root, 'scores'), packetFlag;
const files = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out') out = resolve(args[++i]);
  else if (args[i] === '--packet') packetFlag = args[++i];
  else files.push({ file: resolve(args[i]), packet: packetFlag });
}
if (files.length === 0)
  for (const p of readdirSync(join(root, 'readers')))
    for (const f of readdirSync(join(root, 'readers', p)).filter(f => /^answers-.*\.json$/.test(f))) files.push({ file: join(root, 'readers', p, f), packet: p });
mkdirSync(out, { recursive: true });

const key = JSON.parse(readFileSync(join(root, 'key', 'key.json'), 'utf8'));
const corpus = Object.fromEntries(JSON.parse(readFileSync(join(root, 'key', 'corpus.json'), 'utf8')).map(x => [x.id, x]));
const model = doc => readFileSync(join(root, 'build', `${doc}.als`), 'utf8');
const bounds = doc => readFileSync(join(root, 'build', `${doc}.bounds`), 'utf8').trim();
const oneLine = f => f.replace(/\s+/g, ' ').trim();

// The rows: one per answer.
const rows = [];
for (const { file, packet: given } of files) {
  const packet = given ?? basename(dirname(file));
  if (!key[packet]) throw new Error(`${file}: no packet "${packet}" in key/key.json`);
  const reader = `${packet}/${basename(file).replace(/^answers-/, '').replace(/\.json$/, '')}`;
  for (const a of JSON.parse(readFileSync(file, 'utf8'))) {
    const item = key[packet].items[a.id];
    if (!item) { console.error(`${reader}: unknown id ${a.id}`); continue; }
    const x = corpus[item.id];
    rows.push({ reader, packet, version: key[packet].version, qid: a.id, id: item.id, doc: item.doc, role: item.role,
      statement: x[key[packet].version === 'claim-first' ? 'claimFirst' : 'oldOrder'], formula: oneLine(x.formula), answer: oneLine(a.alloy ?? ''), doubt: a.doubt ?? '' });
  }
}

// The analyzer, over many checks at once: one run per chunk of one canon; a chunk that does not compile is split.
const cacheFile = join(out, 'verdicts-cache.json');
const cache = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : {};
const cacheKey = (doc, l, r) => `${doc}\u0000${l}\u0000${r}`;
const work = mkdtempSync(join(out, 'work-'));
const java = (file, cwd) => new Promise(done => {
  const p = spawn(JAVA, ['-jar', JAR, 'exec', '-f', '-s', 'glucose', '-c', '*', file], { cwd });
  let text = '';
  p.stdout.on('data', d => (text += d));
  p.stderr.on('data', d => (text += d));
  const timer = setTimeout(() => { text += '\nTIMEOUT'; p.kill(); }, 1800000);
  p.on('close', () => { clearTimeout(timer); done(text); });
});
async function chunk(doc, pairs) {
  const cwd = mkdtempSync(join(work, 'q-'));
  const file = join(cwd, 'q.als');
  writeFileSync(file, `${model(doc)}\n${pairs.map((p, i) => `check q${i} { (${p.l}) <=> (${p.r}) } ${bounds(doc)}`).join('\n')}\n`);
  const text = await java(file, cwd);
  const found = new Map();
  for (const m of text.matchAll(/check q(\d+)\s.*?\b(UNSAT|SAT)\b/g)) found.set(Number(m[1]), m[2] === 'UNSAT' ? 'same' : 'differs');
  if (found.size === pairs.length) return pairs.map((p, i) => ({ p, verdict: found.get(i) }));
  if (found.size > 0) {
    const rest = pairs.filter((_, i) => !found.has(i));
    return [...[...found].map(([i, verdict]) => ({ p: pairs[i], verdict })), ...(await chunk(doc, rest))];
  }
  if (pairs.length === 1) {
    if (/TIMEOUT/.test(text)) return [{ p: pairs[0], verdict: 'timeout' }];
    const error = text.split('\n').filter(l => /rror|yntax|Type|cannot|ambiguous/i.test(l)).slice(0, 2).join(' ').slice(0, 400);
    return [{ p: pairs[0], verdict: 'malformed', error }];
  }
  const half = Math.ceil(pairs.length / 2);
  return [...(await chunk(doc, pairs.slice(0, half))), ...(await chunk(doc, pairs.slice(half)))];
}
async function decide(pairs) {
  const todo = new Map();
  for (const p of pairs) if (!cache[cacheKey(p.doc, p.l, p.r)]) todo.set(cacheKey(p.doc, p.l, p.r), p);
  const byDoc = {};
  for (const p of todo.values()) (byDoc[p.doc] ??= []).push(p);
  const jobs = [];
  for (const [doc, ps] of Object.entries(byDoc)) for (let k = 0; k < ps.length; k += 25) jobs.push([doc, ps.slice(k, k + 25)]);
  let next = 0, done = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < jobs.length) {
      const [doc, ps] = jobs[next++];
      const t0 = Date.now();
      for (const r of await chunk(doc, ps)) cache[cacheKey(r.p.doc, r.p.l, r.p.r)] = { verdict: r.verdict, ...(r.error ? { error: r.error } : {}) };
      writeFileSync(cacheFile, JSON.stringify(cache));
      console.error(`chunk ${++done}/${jobs.length} (${doc}, ${ps.length} checks, ${Math.round((Date.now() - t0) / 1000)}s)`);
    }
  }));
  return p => cache[cacheKey(p.doc, p.l, p.r)];
}

// Stage 1: each answer against its formula.
const empty = r => r.answer === '';
let look = await decide(rows.filter(r => !empty(r)).map(r => ({ doc: r.doc, l: r.formula, r: r.answer })));
for (const r of rows) {
  const v = empty(r) ? { verdict: 'empty' } : look({ doc: r.doc, l: r.formula, r: r.answer });
  r.verdict = v.verdict;
  if (v.error) r.error = v.error;
}
// Stage 2: each miss against the misreadings of the statement's rule.
const misses = rows.filter(r => r.verdict === 'differs');
const pairs = misses.flatMap(r => corpus[r.id].misreadings.flatMap(m => [{ doc: r.doc, l: m.twoWay, r: r.answer }, { doc: r.doc, l: m.converse, r: r.answer }]));
look = await decide(pairs);
for (const r of misses) {
  const ms = corpus[r.id].misreadings;
  r.twoWay = ms.some(m => look({ doc: r.doc, l: m.twoWay, r: r.answer })?.verdict === 'same');
  r.converse = ms.some(m => look({ doc: r.doc, l: m.converse, r: r.answer })?.verdict === 'same');
}
writeFileSync(join(out, 'scores.json'), JSON.stringify(rows, null, 1));

// The report.
const lines = [];
const tally = rs => {
  const n = rs.length, same = rs.filter(r => r.verdict === 'same').length;
  const tw = rs.filter(r => r.twoWay).length, cv = rs.filter(r => r.converse).length;
  const bad = rs.filter(r => r.verdict !== 'same' && r.verdict !== 'differs').length;
  return `${same}/${n} equivalent (${n ? Math.round((100 * same) / n) : 0}%), ${tw} two-way, ${cv} converse, ${bad} malformed/empty/timeout`;
};
const group = (rs, f) => { const g = {}; for (const r of rs) (g[f(r)] ??= []).push(r); return Object.entries(g).sort(); };
lines.push('== Per version');
for (const [v, rs] of group(rows, r => r.version)) {
  lines.push(`${v}`);
  for (const [role, rr] of group(rs, r => r.role)) lines.push(`  ${role.padEnd(8)} ${tally(rr)}`);
}
lines.push('', '== Per reader');
for (const [reader, rs] of group(rows, r => `${r.reader} (${r.version})`)) {
  lines.push(reader);
  for (const [role, rr] of group(rs, r => r.role)) lines.push(`  ${role.padEnd(8)} ${tally(rr)}`);
}
lines.push('', '== Misses');
for (const r of rows.filter(r => r.verdict !== 'same')) {
  const kind = r.verdict !== 'differs' ? r.verdict : r.twoWay ? 'TWO-WAY (one-way rule read as exactly when)' : r.converse ? 'CONVERSE (rule read the other way round)' : 'other';
  lines.push(`--- ${r.reader} ${r.qid} = ${r.id} [${r.role}, ${r.version}] ${kind}`);
  lines.push(r.statement.split('\n').map(l => `    | ${l}`).join('\n'));
  lines.push(`    formula: ${r.formula}`, `    answer:  ${r.answer}`);
  if (r.doubt) lines.push(`    doubt:   ${r.doubt}`);
  if (r.error) lines.push(`    error:   ${r.error}`);
}
writeFileSync(join(out, 'report.txt'), `${lines.join('\n')}\n`);
console.log(lines.slice(0, lines.indexOf('== Misses')).join('\n'));
console.log(`(misses and statements: ${join(out, 'report.txt')})`);
