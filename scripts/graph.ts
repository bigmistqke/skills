/**
 * Writes `GRAPH.svg` beside the `CANON.md` of each package: the derivations of
 * that canon, drawn by the Pele plugin. With `--check`, writes nothing and
 * exits 1 when a graph is stale or missing.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { graphOf, svgOf } from '../packages/canon-plugin-pele/src/graph.ts';

const PACKAGES = new URL('../packages/', import.meta.url);
const check = process.argv.includes('--check');

let stale = 0;
for (const name of readdirSync(PACKAGES).sort()) {
  const canon = new URL(`${name}/CANON.md`, PACKAGES);
  if (!existsSync(canon)) continue;
  const file = new URL(`${name}/GRAPH.svg`, PACKAGES);
  const next = svgOf(graphOf([canon.pathname]));
  if (existsSync(file) && readFileSync(file, 'utf8') === next) continue;
  if (check) {
    console.error(`packages/${name}/GRAPH.svg: the graph is stale — run \`pnpm graph\``);
    stale++;
  } else {
    writeFileSync(file, next);
  }
}
process.exit(stale === 0 ? 0 : 1);
