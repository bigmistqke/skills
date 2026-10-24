// The reader packets: one per version, each holding every statement claim-first changes (in that version's words) and
// the same controls, under opaque ids, shuffled. The key that maps opaque ids back sits outside the reader folders.
// Usage: node packets.mjs   (reads build/statements.json; writes readers/A, readers/B, key/key.json, key/corpus.json)
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const root = join(new URL('.', import.meta.url).pathname, '..');
const st = JSON.parse(readFileSync(join(root, 'build', 'statements.json'), 'utf8'));

// A seeded generator, so the packets come out the same on every run.
let seed = 20261024;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const targets = st.filter(s => s.changed);
// Controls: rules said on one line ("When X, Y."), five per canon, three of them with a first side joined by "and".
const controls = [];
for (const doc of ['canon', 'canon-plugin-alloy', 'naturalloy']) {
  const c = st.filter(s => s.doc === doc && !s.changed && !s.definition && !s.scenario && s.lineRules === 1 && s.rules === 1);
  const firstSide = s => /when (.*?), /.exec(s.claimFirst)?.[1] ?? '';
  const joined = c.filter(s => / and /.test(firstSide(s))), plain = c.filter(s => !/ and /.test(firstSide(s)));
  const spread = (xs, n) => Array.from({ length: Math.min(n, xs.length) }, (_, k) => xs[Math.floor((k + 0.5) * xs.length / Math.min(n, xs.length))]);
  controls.push(...spread(joined, 3), ...spread(plain, 5 - Math.min(3, joined.length)));
}
const corpus = [...targets.map(s => ({ ...s, role: 'target' })), ...controls.map(s => ({ ...s, role: 'control' }))];
mkdirSync(join(root, 'key'), { recursive: true });
writeFileSync(join(root, 'key', 'corpus.json'), JSON.stringify(corpus.map(s => ({
  id: s.id, doc: s.doc, role: s.role, formula: s.formula, irMeaning: s.irMeaning, claimFirst: s.claimFirst, oldOrder: s.oldOrder, misreadings: s.misreadings
})), null, 1));

const brief = readFileSync(join(root, 'scripts', 'brief.md'), 'utf8');
const versions = { A: 'claimFirst', B: 'oldOrder' };
const key = {};
for (const [packet, field] of Object.entries(versions)) {
  const dir = join(root, 'readers', packet);
  mkdirSync(dir, { recursive: true });
  const order = shuffle(corpus);
  // Opaque ids: a letter that is the same in both packets would let ids be matched, so each packet draws its own numbers.
  const numbers = shuffle(order.map((_, i) => i + 1));
  key[packet] = { version: field === 'claimFirst' ? 'claim-first' : 'old-order', items: {} };
  const entries = order.map((s, i) => {
    const qid = `${packet.toLowerCase()}${String(100 + numbers[i])}`;
    key[packet].items[qid] = { id: s.id, doc: s.doc, role: s.role };
    return `## ${qid}  (vocabulary: ${s.doc}.vocab.md)\n\n\`\`\`text\n${s[field]}\n\`\`\`\n`;
  });
  const docs = [...new Set(order.map(s => s.doc))];
  writeFileSync(join(dir, 'batch.md'), `Vocabulary files for this batch: ${docs.map(d => `${d}.vocab.md`).join(', ')}\n\n${entries.join('\n')}`);
  writeFileSync(join(dir, 'brief.md'), brief);
  for (const d of docs) copyFileSync(join(root, 'build', `${d}.vocab.md`), join(dir, `${d}.vocab.md`));
}
writeFileSync(join(root, 'key', 'key.json'), JSON.stringify(key, null, 1));
console.log(`targets ${targets.length}, controls ${controls.length}`);
for (const c of controls) console.log('  control', c.doc, c.id);
