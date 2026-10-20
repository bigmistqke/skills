// Gather every back-translation, check it with the analyzer, and tabulate: prose source × translator tier.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
const dir = new URL('.', import.meta.url).pathname;
const items = Object.fromEntries(JSON.parse(readFileSync(dir + 'items.json', 'utf8')).map(i => [i.key, i]));
const answers = [];
for (const f of readdirSync(dir).filter(f => /^answers-[hso]\d+\.json$/.test(f))) {
  const tier = f[8];
  for (const a of JSON.parse(readFileSync(dir + f, 'utf8'))) if (items[a.key]) answers.push({ ...a, tier, id: items[a.key].id, src: items[a.key].src });
}
// The analyzer runs once per distinct (statement, formula); earlier verdicts are kept.
const norm = t => (t ?? '').replace(/\s+/g, ' ').trim();
const sig = a => `${a.id}|${norm(a.alloy)}`;
const cache = existsSync(dir + 'verdicts.json') ? JSON.parse(readFileSync(dir + 'verdicts.json', 'utf8')) : {};
const todo = [...new Map(answers.filter(a => !cache[sig(a)]).map(a => [sig(a), a])).values()];
console.log(`${answers.length} answers, ${todo.length} distinct to check`);
if (todo.length > 0) {
  writeFileSync(dir + 'todo.json', JSON.stringify(todo.map(a => ({ id: a.id, alloy: a.alloy }))));
  execFileSync('node', [dir + '../equiv.mjs', dir + 'todo.json', dir + 'todo-verdicts.json'], { stdio: 'inherit' });
  const v = JSON.parse(readFileSync(dir + 'todo-verdicts.json', 'utf8'));
  todo.forEach((a, i) => (cache[sig(a)] = v[i]));
  writeFileSync(dir + 'verdicts.json', JSON.stringify(cache, null, 1));
}
const rows = answers.map(a => ({ ...a, verdict: cache[sig(a)]?.verdict, error: cache[sig(a)]?.error }));
writeFileSync(dir + 'rows.json', JSON.stringify(rows, null, 1));
const tiers = ['h', 's', 'o'], srcs = ['cur', 'o', 's', 'h'];
const name = { cur: 'current words', o: 'Opus ideal', s: 'Sonnet ideal', h: 'Haiku ideal', }, tname = { h: 'Haiku', s: 'Sonnet', o: 'Opus' };
console.log('same / checked (malformed)   translators →', tiers.map(t => tname[t]).join(' | '));
for (const s of srcs) {
  const cells = tiers.map(t => {
    const r = rows.filter(x => x.src === s && x.tier === t && x.verdict !== 'skipped');
    const ok = r.filter(x => x.verdict === 'same').length, bad = r.filter(x => x.verdict === 'malformed').length;
    return `${ok}/${r.length - bad} (${bad})`;
  });
  console.log(name[s].padEnd(16), cells.join(' | '));
}
