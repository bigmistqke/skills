/**
 * A stand-in for Java and the Alloy analyzer, for the tests of how run-alloy
 * runs the analyzer: which programs it asks, with what, and how many at once. It
 * answers every run with an instance, writes the text of that instance, and logs
 * each call, so a test can count the processes that a caller started.
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** The text the stand-in writes as the instance of every run. */
export const INSTANCE = 'the instance the stand-in found\n';

export interface FakeAnalyzer {
  /** The path to give as Java. */
  java: string;
  /** The path to give as the analyzer's jar. */
  jar: string;
  /** The runs it was asked to solve so far, each as the arguments it got before its file. */
  calls: () => string[][];
  /** The most processes that ran at once so far. */
  most: () => number;
}

/**
 * Write a stand-in into `dir`: a Java that says it is of the major version
 * `major`, and that fails every run when `fail` is set. Each run takes `ms`
 * milliseconds, so that runs that overlap can be seen.
 */
export function fakeAnalyzer(dir: string, { major = 21, fail = false, ms = 0, name = 'java' }: { major?: number; fail?: boolean; ms?: number; name?: string } = {}): FakeAnalyzer {
  mkdirSync(dir, { recursive: true });
  const log = join(dir, `${name}.log`);
  const java = join(dir, name);
  const jar = join(dir, 'alloy.jar');
  if (!existsSync(jar)) writeFileSync(jar, 'the analyzer, version one');
  writeFileSync(
    java,
    `#!${process.execPath}
const { appendFileSync, mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const args = process.argv.slice(2);
if (args.includes('-version')) {
  process.stderr.write('openjdk version "${major}.0.2" 2024-01-16\\n');
  process.exit(0);
}
const log = ${JSON.stringify(log)};
appendFileSync(log, 'start ' + JSON.stringify(args.slice(0, -1)) + '\\n');
const end = () => appendFileSync(log, 'end\\n');
${
  fail
    ? `process.stderr.write('Exception in thread "main" java.lang.OutOfMemoryError\\n'); end(); process.exit(1);`
    : `const file = args.at(-1);
const out = args[args.indexOf('-o') + 1];
const name = /^run\\s+(\\w+)/m.exec(readFileSync(file, 'utf8'))[1];
setTimeout(() => {
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'receipt.json'), JSON.stringify({ commands: { [name]: { solution: [{}] } } }));
  writeFileSync(join(out, name + '-solution-0.txt'), ${JSON.stringify(INSTANCE)});
  end();
}, ${ms});`
}
`
  );
  chmodSync(java, 0o755);
  const lines = (): string[] => (existsSync(log) ? readFileSync(log, 'utf8').split('\n').filter(Boolean) : []);
  return {
    java,
    jar,
    calls: () => lines().filter(l => l.startsWith('start ')).map(l => JSON.parse(l.slice(6)) as string[]),
    most: () => {
      let now = 0;
      let most = 0;
      for (const line of lines()) {
        now += line.startsWith('start ') ? 1 : -1;
        most = Math.max(most, now);
      }
      return most;
    }
  };
}
