import { existsSync, readFileSync } from 'node:fs';
const dir = new URL('.', import.meta.url).pathname;
const truth = JSON.parse(readFileSync(dir + 'truth.json', 'utf8'));
const g = {}, t = {}, hard = {}, misses = [];
for (let r = 0; r < 8; r++) {
  const f = `${dir}answers-${r}.json`; if (!existsSync(f)) continue;
  const ans = Object.fromEntries(JSON.parse(readFileSync(f, 'utf8')).map(a => [a.q, a]));
  for (const x of truth.filter(x => x.reader === r)) {
    const a = ans[x.q]; const k = `${x.op} ${x.variant}`;
    (g[k] ??= { n: 0, ok: 0 }).n++; const ok = a && a.holds === x.truth; if (ok) g[k].ok++;
    const kt = `${x.op} ${x.variant} ${x.timeline}`; (t[kt] ??= { n: 0, ok: 0 }).n++; if (ok) t[kt].ok++;
    if (!ok) misses.push(`${r} ${x.q} ${x.variant} truth=${x.truth} said=${a?.holds}: ${a?.why ?? ''}`);
    const h = ans[`${x.id}-hard`]; if (h && x.timeline === 'never') (hard[k] ??= []).push(h.hard);
  }
}
for (const [k, v] of Object.entries(g).sort()) console.log(k.padEnd(10), `${v.ok}/${v.n}`, 'hard', (hard[k] ?? []).join(','));
console.log('\nby timeline (wrong only):');
for (const [k, v] of Object.entries(t).sort()) if (v.ok < v.n) console.log(' ', k.padEnd(22), `${v.ok}/${v.n}`);
console.log('\n' + misses.join('\n'));
