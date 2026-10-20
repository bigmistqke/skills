// Scratch: the vocabulary a translator may see for each canon: readings, declarations and definitions, never a claim.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readBlocks } from '@bigmistqke/canon/blocks';
import { readUnits } from '@bigmistqke/canon/units';
import { contextOf } from '@bigmistqke/canon/extends';
const out = process.argv[2] as string;
const root = resolve('..', '..');
const docs = ['packages/canon/CANON.md', 'packages/canon-plugin-alloy/CANON.md', 'packages/naturalloy/CANON.md', 'packages/canon-plugin-alloy/fixtures/lifetimes/CANON.md'];
for (const doc of docs) {
  const file = resolve(root, doc);
  const files = [...contextOf(file, root).reverse(), file];
  const readings: string[] = [], decls: string[] = [];
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    for (const b of readBlocks(src, readUnits(src))) {
      if (b.lang === 'readings') readings.push(b.body.trim());
      else if (b.lang === 'alloy' && (b.role === 'vocabulary' || (b.role === 'unit' && /^\s*(pred|fun)\s/.test(b.body)))) decls.push(b.body.trim());
    }
  }
  const name = doc.replace(/^packages\//, '').replace(/\/CANON\.md$/, '').replace(/\//g, '-');
  writeFileSync(`${out}/${name}.vocab.md`, `# Vocabulary\n\n## Readings\n\nEach line \`word: positive | negative\` gives the English of a word; {1}, {2} are its arguments in order.\n\n\`\`\`text\n${readings.join('\n')}\n\`\`\`\n\n## Declarations and definitions (Alloy 6)\n\n\`\`\`alloy\n${decls.join('\n\n')}\n\`\`\`\n`);
  console.log(name, readings.length, decls.length);
}
