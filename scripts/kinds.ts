/**
 * Writes the kinds table of `skills/canon/writing-units.md` from the checker's
 * own ruleset. With `--check`, writes nothing and exits 1 when the table is
 * stale.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { KINDS_END, kindsTable } from '../packages/canon/src/kinds.ts';
import { replaceRegion } from '../packages/canon/src/regions.ts';

const FILE = new URL('../skills/canon/writing-units.md', import.meta.url);

const src = readFileSync(FILE, 'utf8');
const next = replaceRegion(src, 'kinds', KINDS_END, kindsTable());
if (next === undefined) {
  console.error('writing-units.md: no kinds region');
  process.exit(1);
}
if (next === src) {
  process.exit(0);
}
if (process.argv.includes('--check')) {
  console.error('writing-units.md: the kinds table is stale — run `pnpm generate`');
  process.exit(1);
}
writeFileSync(FILE, next);
