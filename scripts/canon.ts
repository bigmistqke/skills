/**
 * The canon checker of this repository, run from the directory `pnpm -w canon` was called in, so that it reads the
 * canon of the package there: `cd packages/naturalloy && pnpm -w canon show <unit>`.
 */
if (process.env.INIT_CWD !== undefined) process.chdir(process.env.INIT_CWD);
await import('../packages/canon/src/cli.ts');
