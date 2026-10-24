// Sanity answers for the scorer: the formulas themselves in both packets (all must be equivalent), the IR said back as
// Alloy (must be equivalent; it is what the misreadings are built from), and each claim-first formula with one
// `implies` at a time swapped to `iff` (the swap of the claim-first rule must be flagged two-way).
// Usage: node scripts/sanity.mjs   then   node scripts/score.mjs --out sanity/scores sanity/A/*.json sanity/B/*.json
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const root = join(new URL('.', import.meta.url).pathname, '..');
const key = JSON.parse(readFileSync(join(root, 'key', 'key.json'), 'utf8'));
const corpus = Object.fromEntries(JSON.parse(readFileSync(join(root, 'key', 'corpus.json'), 'utf8')).map(x => [x.id, x]));
const oneLine = f => f.replace(/\s+/g, ' ').trim();
const OP = /\bimplies\b|(?<![<=])=>/g;
for (const packet of Object.keys(key)) {
  const dir = join(root, 'sanity', packet);
  mkdirSync(dir, { recursive: true });
  const items = Object.entries(key[packet].items);
  writeFileSync(join(dir, 'answers-self.json'), JSON.stringify(items.map(([qid, it]) => ({ id: qid, alloy: oneLine(corpus[it.id].formula) })), null, 1));
  writeFileSync(join(dir, 'answers-ir.json'), JSON.stringify(items.map(([qid, it]) => ({ id: qid, alloy: corpus[it.id].irMeaning })), null, 1));
  if (key[packet].version !== 'claim-first') continue;
  const swaps = [];
  for (const [qid, it] of items) {
    if (it.role !== 'target') continue;
    const f = oneLine(corpus[it.id].formula);
    const at = [...f.matchAll(OP)];
    if (at.length === 0) swaps.push({ id: qid, alloy: corpus[it.id].misreadings[0].twoWay, doubt: 'no implies in the formula: the two-way misreading from the IR' });
    at.forEach((m, k) => swaps.push({ id: qid, alloy: f.slice(0, m.index) + (m[0] === '=>' ? '<=>' : 'iff') + f.slice(m.index + m[0].length), doubt: `implies number ${k + 1} of ${at.length} swapped to iff` }));
  }
  writeFileSync(join(dir, 'answers-iffswap.json'), JSON.stringify(swaps, null, 1));
}
console.log('written', join(root, 'sanity'));
