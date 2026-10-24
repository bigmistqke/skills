import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { JAVA_OPTIONS, slot } from './jobs.ts';

/** Where the analyzer is: the Java that runs it, and its jar. */
export interface Analyzer {
  /** A Java 17 or later. */
  java: string;
  /** The Alloy distribution jar. */
  jar: string;
}

/** The analyzer that `CANON_JAVA` and `CANON_ALLOY_JAR` name, with `java` when no Java is named; none without a jar. */
export function analyzerOf(env: Record<string, string | undefined> = process.env): Analyzer | undefined {
  return env.CANON_ALLOY_JAR ? { java: env.CANON_JAVA || 'java', jar: env.CANON_ALLOY_JAR } : undefined;
}

/** What the analyzer reads for one process: a module, and the files beside it that the module may open. */
export interface Program {
  /** The text of the module. */
  text: string;
  /** The path of the module in the folder the analyzer runs in; `model.als` by default. */
  path?: string;
  /** The other files of that folder, by their path in it, such as the modules that the module opens. */
  beside?: Record<string, string>;
}

/** One process of the analyzer, ended: what it printed, the folder it wrote into, and how it exited. */
export interface Ran {
  /** Its standard output and standard error, in the order it wrote them. */
  output: string;
  /** The folder the analyzer wrote into, which holds its `receipt.json` and the text of each instance it found. */
  out: string;
  /** Its exit code; none when a signal ended it. */
  code: number | null;
}

/** A process that gave no answer: what it said, or why it did not start. */
export interface Failure {
  error: string;
}

/** Whether a result is a failure. */
export const failed = (result: unknown): result is Failure => typeof result === 'object' && result !== null && 'error' in result;

/**
 * Run the analyzer on a program, with `args` before the folder it writes into
 * and the file it reads, such as `['exec', '-f', '-c', '*']`, and give what
 * `read` makes of the ended process. The process waits for a place among those
 * that run at once. A process that wrote no receipt did not answer: its output
 * is the failure, and `read` is not asked.
 *
 * @canon spec-an-analyzer-that-did-not-answer-keeps-no-answer
 */
export async function run<T>(analyzer: Analyzer, program: Program, args: readonly string[], read: (ran: Ran) => T | Failure): Promise<T | Failure> {
  const give = await slot();
  const dir = mkdtempSync(join(tmpdir(), 'run-alloy-'));
  try {
    for (const [path, text] of Object.entries(program.beside ?? {})) write(join(dir, path), text);
    const file = join(dir, program.path ?? 'model.als');
    write(file, program.text);
    const out = join(dir, 'out');
    const ended = await new Promise<{ output: string; code: number | null } | Failure>(resolve => {
      const child = spawn(analyzer.java, [...JAVA_OPTIONS, '-jar', analyzer.jar, ...args, '-o', out, file], { cwd: dir });
      let output = '';
      child.stdout.on('data', chunk => (output += chunk));
      child.stderr.on('data', chunk => (output += chunk));
      child.on('error', error => resolve({ error: error.message }));
      child.on('close', code => resolve({ output, code }));
    });
    give();
    if (failed(ended)) return ended;
    if (!existsSync(join(out, 'receipt.json'))) return { error: ended.output.trim() || 'the Alloy analyzer wrote no receipt' };
    return read({ ...ended, out });
  } finally {
    give();
    rmSync(dir, { recursive: true, force: true });
  }
}

function write(path: string, text: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}
