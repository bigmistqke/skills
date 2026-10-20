// Scratch: dump each generated statement with its formula, the readings and the model, for the readability map.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { readBlocks } from '@bigmistqke/canon/blocks';
import { readUnits } from '@bigmistqke/canon/units';
import { contextOf } from '@bigmistqke/canon/extends';
import { alloyProgram, predicateName } from './alloy.ts';
import { states, type Context } from './statements.ts';
const out = process.argv[2] as string;
const root = resolve('..', '..');
const docs = ['packages/canon/CANON.md', 'packages/canon-plugin-alloy/CANON.md', 'packages/naturalloy/CANON.md', 'packages/parse-alloy/CANON.md', 'packages/canon-plugin-pele/CANON.md', 'packages/canon-plugin-alloy/fixtures/lifetimes/CANON.md'];
const corpus: unknown[] = [];
for (const doc of docs) {
  const file = resolve(root, doc);
  const src = readFileSync(file, 'utf8');
  const context: Context[] = contextOf(file, root).map(other => ({ path: relative(dirname(file), other).split('\\').join('/'), src: readFileSync(other, 'utf8') }));
  const blocks = readBlocks(src, readUnits(src)).filter(b => b.lang === 'alloy');
  const program = alloyProgram(src, 'check', undefined, context.map(c => c.src));
  const name = doc.replace(/^packages\//, '').replace(/\/CANON\.md$/, '').replace(/\//g, '-');
  writeFileSync(`${out}/${name}.als`, program.model);
  writeFileSync(`${out}/${name}.bounds`, (program.commands[0] ?? '').replace(/^run consistent \{[^]*?\} /, ''));
  const counted = new Map<string, number>();
  const bodies = new Map<string, string>();
  for (const b of blocks) {
    if (b.role === 'unit') bodies.set(b.unit, b.body);
    if (b.role === 'scenario') { const n = (counted.get(b.unit) ?? 0) + 1; counted.set(b.unit, n); bodies.set(`scenario-${n}-${b.unit}`, b.body); }
  }
  for (const s of states(src, context)) {
    if (s.kind === 'unsayable' || s.quote === undefined) continue;
    corpus.push({ doc: name, unit: s.unit, pred: predicateName(s.unit), formula: bodies.get(s.unit), statement: s.quote.split('\n').map(l => l.replace(/^> ?/, '')).join('\n').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') });
  }
}
writeFileSync(`${out}/corpus.json`, JSON.stringify(corpus, null, 1));
console.log(corpus.length);
