/**
 * The Alloy analyzer, asked many checks at once. The tests need its jar: set CANON_ALLOY_JAR, and CANON_JAVA when
 * `java` is older than 17. A verdict is kept by the module of its one check and the jar that gave it, so a run after a
 * change asks the analyzer only what changed; CANON_ALLOY_CACHE=0 asks it everything.
 */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const JAR = process.env.CANON_ALLOY_JAR;
const JAVA = process.env.CANON_JAVA ?? 'java';
const JOBS = Number(process.env.CANON_ALLOY_JOBS) || Math.max(1, Math.floor(availableParallelism() / 2));

/** The analyzer on one module: what it prints. */
export function analyze(dir: string, name: string, module: string): Promise<string> {
  const file = join(dir, `${name}.als`);
  writeFileSync(file, module);
  return new Promise(resolve => {
    const child = spawn(JAVA, ['-jar', JAR as string, 'exec', '-f', '-c', '*', file], { cwd: dir });
    let out = '';
    child.stdout.on('data', chunk => (out += chunk));
    child.stderr.on('data', chunk => (out += chunk));
    child.on('close', () => resolve(out));
  });
}

const CACHE = join(dirname(fileURLToPath(import.meta.url)), '../node_modules/.cache/naturalloy/verdicts.json');

/** The verdicts kept from earlier runs, by the key of their check. */
function kept(): Record<string, string> {
  if (process.env.CANON_ALLOY_CACHE === '0' || !existsSync(CACHE)) return {};
  try {
    return JSON.parse(readFileSync(CACHE, 'utf8')) as Record<string, string>;
  } catch {
    return {};
  }
}

function keep(verdicts: Record<string, string>): void {
  if (process.env.CANON_ALLOY_CACHE === '0') return;
  // Two test files may keep verdicts at once: each adds its own to what is there.
  mkdirSync(dirname(CACHE), { recursive: true });
  writeFileSync(CACHE, JSON.stringify({ ...kept(), ...verdicts }));
}

/** The key of a check: the module that holds it alone, and the jar that judges it. */
function keyOf(module: string): string {
  const jar = statSync(JAR as string);
  return createHash('sha256').update(`${JAR}\0${jar.size}\0${jar.mtimeMs}\0${module}`).digest('hex');
}

/**
 * Each check with the analyzer's verdict: `UNSAT` when no counterexample exists, `SAT` when one does, or what went
 * wrong. `module` writes the module for a batch of claims, each as `check check_<i> { … }`. A batch that does not
 * compile is asked again one check at a time, so that one the analyzer rejects names itself.
 */
export async function verdicts<T>(given: T[], module: (batch: T[]) => string, size = 40): Promise<{ item: T; verdict: string }[]> {
  const before = kept();
  const keys = new Map(given.map(item => [item, keyOf(module([item]))]));
  const results: { item: T; verdict: string }[] = [];
  const all: T[] = [];
  for (const item of given) {
    const verdict = before[keys.get(item) as string];
    if (verdict === undefined) all.push(item);
    else results.push({ item, verdict });
  }
  if (all.length === 0) return results;
  const dir = mkdtempSync(join(tmpdir(), 'naturalloy-checks-'));
  try {
    const run = async (batch: T[], name: string): Promise<void> => {
      const out = await analyze(dir, name, module(batch));
      const lines = [...out.matchAll(/^\d+\. check check_(\d+)\s.*?\s(UNSAT|SAT)\s*$/gm)];
      if (lines.length === batch.length) {
        for (const [, i, verdict] of lines) results.push({ item: batch[Number(i)] as T, verdict: verdict as string });
      } else if (batch.length > 1) {
        for (const [i, item] of batch.entries()) await run([item], `${name}_${i}`);
      } else results.push({ item: batch[0] as T, verdict: out.trim().split('\n').slice(0, 4).join(' ') });
    };
    const batches: T[][] = [];
    for (let i = 0; i < all.length; i += size) batches.push(all.slice(i, i + size));
    const queue = [...batches.entries()];
    const worker = async (): Promise<void> => {
      for (let next = queue.shift(); next !== undefined; next = queue.shift()) await run(next[1], `batch_${next[0]}`);
    };
    await Promise.all(Array.from({ length: JOBS }, worker));
    // Only a verdict is kept: what went wrong is asked again.
    keep(Object.fromEntries(results.filter(r => r.verdict === 'UNSAT' || r.verdict === 'SAT').map(r => [keys.get(r.item) as string, r.verdict])));
    return results;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
