// Stage 3a: the cases where a strong translator brought an ideal back as a different formula, for the loss classifier.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const back = join(new URL('.', import.meta.url).pathname, '..', 'back');
const rows = JSON.parse(readFileSync(join(back, 'rows.json'), 'utf8'));
const c = Object.fromEntries(JSON.parse(readFileSync(join(back, '..', 'corpus.json'), 'utf8')).map(x => [x.id, x]));
const items = Object.fromEntries(JSON.parse(readFileSync(join(back, 'items.json'), 'utf8')).map(i => [i.key, i]));
const name = { o: 'Opus', s: 'Sonnet', h: 'Haiku' };
const g = {};
for (const r of rows) (g[`${r.id}|${r.src}`] ??= {})[r.tier] = r;
const cases = [];
for (const [k, v] of Object.entries(g)) {
  const [id, src] = k.split('|');
  if (src === 'cur') continue;
  const strong = ['s', 'o'].filter(t => v[t]?.verdict === 'differs').length;
  if (strong > 0) cases.push({ id, src, strong });
}
cases.sort((a, b) => b.strong - a.strong);
let md = '';
for (const x of cases) {
  const s = c[x.id];
  md += `## ${x.id}-${x.src}  (${s.doc} · ${s.unit}) — ideal by ${name[x.src]}; ${x.strong} of 2 strong translators differ\n\nOriginal formula:\n\`\`\`alloy\n${s.formula.trim()}\n\`\`\`\n\nCurrent words (lossless):\n\`\`\`text\n${s.statement}\n\`\`\`\n\nIdeal prose:\n\`\`\`text\n${items[`${x.id}-${x.src}`].text}\n\`\`\`\n\nBack-translations of the ideal (analyzer verdict against the original):\n`;
  for (const t of ['s', 'o', 'h']) { const r = g[`${x.id}|${x.src}`][t]; if (r) md += `- ${name[t]} (${r.verdict}): \`${(r.alloy || '').replace(/\n/g, ' ')}\`${r.doubt ? ` — doubt: ${r.doubt}` : ''}\n`; }
  md += '\n';
}
writeFileSync(join(back, 'cases.md'), md);
