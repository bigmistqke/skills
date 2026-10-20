// Stage 3b: statements where Haiku recovered one version (current words or the Opus ideal) and not the other.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const back = join(new URL('.', import.meta.url).pathname, '..', 'back');
const rows = JSON.parse(readFileSync(join(back, 'rows.json'), 'utf8'));
const c = Object.fromEntries(JSON.parse(readFileSync(join(back, '..', 'corpus.json'), 'utf8')).map(x => [x.id, x]));
const items = Object.fromEntries(JSON.parse(readFileSync(join(back, 'items.json'), 'utf8')).map(i => [i.key, i]));
const g = {};
for (const r of rows) if (r.tier === 'h') (g[r.id] ??= {})[r.src] = r;
let md = '';
for (const [id, v] of Object.entries(g)) {
  if (!v.cur || !v.o) continue;
  const x = v.cur.verdict, y = v.o.verdict;
  if (x === 'malformed' || y === 'malformed' || (x === 'same') === (y === 'same')) continue;
  const dir = x === 'same' ? 'HURT (current read right, ideal read wrong)' : 'HELPED (ideal read right, current read wrong)';
  md += `## ${id} — ${dir}\n\nOriginal formula:\n\`\`\`alloy\n${c[id].formula.trim()}\n\`\`\`\n\nCurrent words:\n\`\`\`text\n${c[id].statement}\n\`\`\`\nHaiku read it as (${x}): \`${(v.cur.alloy || '').replace(/\n/g, ' ')}\`\n\nIdeal prose:\n\`\`\`text\n${items[`${id}-o`].text}\n\`\`\`\nHaiku read it as (${y}): \`${(v.o.alloy || '').replace(/\n/g, ' ')}\`\n\n`;
}
writeFileSync(join(back, 'flips.md'), md);
