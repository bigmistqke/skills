/**
 * The models that the jar of the Alloy analyzer holds, read straight from the
 * jar, and the analyzer run on a model. The tests that use them need the jar:
 * set CANON_ALLOY_JAR, and CANON_JAVA when `java` is older than 17.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { inflateRawSync } from 'node:zlib';

export const JAR = process.env.CANON_ALLOY_JAR;
const JAVA = process.env.CANON_JAVA ?? 'java';
/** How many analyzers run at once: `CANON_ALLOY_JOBS`, or half the processors, which leaves room for the other suites of the workspace. */
const JOBS = Number(process.env.CANON_ALLOY_JOBS) || Math.max(1, Math.floor(availableParallelism() / 2));

/** The `.als` files of a zip, by their path in it, read from its central directory. */
export function modelsOf(jar: string): Map<string, string> {
  const zip = readFileSync(jar);
  let end = zip.length - 22;
  while (end >= 0 && zip.readUInt32LE(end) !== 0x06054b50) end--;
  if (end < 0) throw new Error(`${jar} is not a zip`);
  const count = zip.readUInt16LE(end + 10);
  let at = zip.readUInt32LE(end + 16);
  const models = new Map<string, string>();
  for (let i = 0; i < count; i++) {
    const method = zip.readUInt16LE(at + 10);
    const size = zip.readUInt32LE(at + 20);
    const nameLength = zip.readUInt16LE(at + 28);
    const extraLength = zip.readUInt16LE(at + 30);
    const commentLength = zip.readUInt16LE(at + 32);
    const local = zip.readUInt32LE(at + 42);
    const name = zip.toString('utf8', at + 46, at + 46 + nameLength);
    if (name.endsWith('.als')) {
      const data = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
      const raw = zip.subarray(data, data + size);
      models.set(name, (method === 0 ? raw : inflateRawSync(raw)).toString('utf8'));
    }
    at += 46 + nameLength + extraLength + commentLength;
  }
  return models;
}

/**
 * Run the analyzer on each of a set of modules, written into one folder with
 * the paths they had in the jar, so that an `open` of a module beside them finds
 * it. The output of each, `JOBS` at a time.
 */
export async function runAll(models: Map<string, string>, modules: { path: string; source: string }[]): Promise<Map<string, string>> {
  const dir = mkdtempSync(join(tmpdir(), 'parse-alloy-'));
  try {
    for (const [path, source] of models) writeFile(join(dir, path), source);
    for (const { path, source } of modules) writeFile(join(dir, path), source);
    const results = new Map<string, string>();
    const queue = [...modules];
    const worker = async (): Promise<void> => {
      for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
        const { path } = next;
        results.set(path, await run(join(dir, path), dir));
      }
    };
    await Promise.all(Array.from({ length: JOBS }, worker));
    return results;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function writeFile(path: string, source: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, source);
}

/** The analyzer on one file. It runs in `dir`, where it leaves a receipt of each run, which goes with the folder. */
function run(file: string, dir: string): Promise<string> {
  return new Promise(resolve => {
    const child = spawn(JAVA, ['-jar', JAR as string, 'exec', '-f', '-c', '*', file], { cwd: dir });
    let out = '';
    child.stdout.on('data', chunk => (out += chunk));
    child.stderr.on('data', chunk => (out += chunk));
    child.on('close', () => resolve(out));
  });
}
