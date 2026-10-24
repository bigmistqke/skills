// Compare the text-layout claim-first words with the statements as they stand in each CANON.md (links stripped).
import { readFileSync } from 'node:fs';
const st = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const P = '/Users/bigmistqke/Documents/GitHub/skills/packages';
let ok = 0, bad = 0;
for (const s of st.filter(s => s.changed)) {
  const src = readFileSync(`${P}/${s.doc}/CANON.md`, 'utf8');
  const m = new RegExp(`<!-- statement-${s.id}:begin[^\\n]*\\n([^]*?)\\n<!-- statement-${s.id}:end`).exec(src);
  if (!m) { console.log('NO REGION', s.id); bad++; continue; }
  const text = m[1].split('\n').map(l => l.replace(/^> ?/, '')).join('\n').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  const norm = t => t.replace(/\s+/g, ' ').trim();
  if (norm(text) === norm(s.claimFirst)) ok++; else { bad++; console.log('DIFF', s.id, '\n--canon:\n' + text + '\n--text:\n' + s.claimFirst); }
}
console.log({ ok, bad });
