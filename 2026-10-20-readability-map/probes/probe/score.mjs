// Score the readers' back-translations: each answer is checked against the formula the words came from, with the
// Alloy analyzer, in a scope of 3 atoms, 3-bit integers and up to 4 steps. UNSAT means the reader got the formula.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = new URL('.', import.meta.url).pathname;
const jar = join(dir, '..', '..', 'alloy.jar');
const items = Object.fromEntries(JSON.parse(readFileSync(join(dir, 'items.json'), 'utf8')).map(x => [x.id, x]));
const vocab = readFileSync(join(dir, '..', 'vocabulary.als'), 'utf8');
const work = mkdtempSync(join(tmpdir(), 'probe-'));
const rows = [];
for (let k = 0; k < 4; k++) {
  const file = join(dir, `answers-${k}.json`);
  if (!existsSync(file)) continue;
  const variants = Object.fromEntries(JSON.parse(readFileSync(join(dir, `batch-${k}.json`), 'utf8')).map(b => [b.id, b.variant]));
  for (const a of JSON.parse(readFileSync(file, 'utf8'))) {
    const item = items[a.id];
    if (!item) continue;
    const als = join(work, `k${k}-${a.id}.als`);
    writeFileSync(als, `${vocab}\ncheck same { some ("a" + "b" + "c") implies ((${item.formula}) <=> (${a.alloy})) } for 3 but 3 Int, 1..4 steps\n`);
    const out = spawnSync('java', ['-jar', jar, 'exec', '-f', '-c', '*', als], { cwd: work, encoding: 'utf8' });
    const text = `${out.stdout}${out.stderr}`;
    const verdict = /check same.*\bUNSAT\b/.test(text) ? 'right' : /check same.*\bSAT\b/.test(text) ? 'wrong' : 'malformed';
    rows.push({ reader: k, id: a.id, pattern: item.pattern, variant: variants[a.id], verdict, hard: a.hard, alloy: a.alloy });
  }
}
writeFileSync(join(dir, 'scores.json'), JSON.stringify(rows, null, 1));
const groups = {};
for (const r of rows) {
  const g = (groups[`${r.pattern} ${r.variant}`] ??= { n: 0, right: 0, wrong: 0, malformed: 0, hard: 0 });
  g.n++;
  g[r.verdict]++;
  g.hard += Number(r.hard) || 0;
}
for (const [k, g] of Object.entries(groups).sort()) console.log(k.padEnd(10), `right ${g.right}/${g.n}`, `wrong ${g.wrong}`, `malformed ${g.malformed}`, `hard ${(g.hard / g.n).toFixed(2)}`);
for (const r of rows.filter(r => r.verdict !== 'right')) console.log(`  ${r.reader} ${r.id} ${r.variant} ${r.verdict}: ${r.alloy}`);
