// Stage 2: every prose version of every claim (current words and each writer's ideal), spread over twelve batches so
// that no batch holds two versions of one statement. Definitions are left out: the analyzer cannot compare them here.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const map = join(new URL('.', import.meta.url).pathname, '..');
const c = JSON.parse(readFileSync(join(map, 'corpus.json'), 'utf8'));
const ideal = {};
for (const f of readdirSync(join(map, 'ideal')).filter(f => /^answers-.*\.json$/.test(f))) {
  const src = f.slice(8, 9);
  for (const a of JSON.parse(readFileSync(join(map, 'ideal', f), 'utf8'))) (ideal[a.id] ??= {})[src] = a;
}
const sources = ['cur', 'o', 's', 'h'];
const items = [];
for (const x of c) {
  if (/^\s*(pred|fun)\s/.test(x.formula)) continue;
  const texts = { cur: x.statement, o: ideal[x.id]?.o?.ideal, s: ideal[x.id]?.s?.ideal, h: ideal[x.id]?.h?.ideal };
  for (const k of sources) if (texts[k]) items.push({ key: `${x.id}-${k}`, id: x.id, src: k, doc: x.doc, text: texts[k] });
}
const B = 12, batches = Array.from({ length: B }, () => []);
const byId = {};
for (const i of items) (byId[i.id] ??= []).push(i);
let cursor = 0;
for (const id of Object.keys(byId)) { byId[id].forEach((it, k) => batches[(cursor + k) % B].push(it)); cursor += 1; }
batches.forEach((b, n) => {
  const docs = [...new Set(b.map(i => i.doc))];
  writeFileSync(join(map, 'back', `batch-${n}.md`), `Vocabulary files for this batch: ${docs.map(d => `${d}.vocab.md`).join(', ')}\n\n` + b.map(i => `## ${i.key}  (vocabulary: ${i.doc}.vocab.md)\n\n\`\`\`text\n${i.text}\n\`\`\`\n`).join('\n'));
});
writeFileSync(join(map, 'back', 'items.json'), JSON.stringify(items, null, 1));
