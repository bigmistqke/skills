// Stage 1: number the corpus and write the ideal-prose batches (six of ~39, shuffled) and the Haiku subset (every sixth, 39).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const map = join(new URL('.', import.meta.url).pathname, '..');
const c = JSON.parse(readFileSync(join(map, 'corpus.json'), 'utf8'));
c.forEach((x, i) => (x.id = 's' + String(i).padStart(3, '0')));
writeFileSync(join(map, 'corpus.json'), JSON.stringify(c, null, 1));
let seed = 7;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const order = c.map(x => x.id).sort(() => rnd() - 0.5);
const B = 6, per = Math.ceil(order.length / B);
const byId = Object.fromEntries(c.map(x => [x.id, x]));
const render = ids => ids.map(id => { const x = byId[id]; return `## ${id}  (${x.doc} · ${x.unit})\n\nFormula:\n\n\`\`\`alloy\n${x.formula.trim()}\n\`\`\`\n\nCurrent words:\n\n\`\`\`text\n${x.statement}\n\`\`\`\n`; }).join('\n');
mkdirSync(join(map, 'ideal'), { recursive: true });
for (let b = 0; b < B; b++) writeFileSync(join(map, 'ideal', `batch-${b}.md`), render(order.slice(b * per, (b + 1) * per)));
writeFileSync(join(map, 'ideal', 'batch-h.md'), render(order.filter((_, i) => i % 6 === 0).slice(0, 40)));
writeFileSync(join(map, 'ideal', 'order.json'), JSON.stringify(order));
