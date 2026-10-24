/**
 * How many analyzer processes run-alloy runs at once, and how much memory each
 * may take. The count is worked out from the machine, so most cases give it a
 * machine; the processes themselves are a stand-in for the analyzer.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { jobs, run } from '../../src/index.ts';
import { fakeAnalyzer } from './analyzer.ts';

const GB = 2 ** 30;
const DIRS: string[] = [];
afterEach(() => {
  for (const dir of DIRS.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const scratch = (): string => {
  const dir = mkdtempSync(join(tmpdir(), 'run-alloy-jobs-'));
  DIRS.push(dir);
  return dir;
};

/** Run the program `run <name> {}` on the stand-in, and give whether it answered. */
const runOne = (analyzer: { java: string; jar: string }, name: string) =>
  run(analyzer, { text: `sig A {}\nrun ${name} {}\n` }, ['exec', '-f', '-t', 'text'], () => true);

describe('the number of analyzer processes at once', () => {
  /**
   * @canon spec-the-analyzer-runs-no-more-processes-at-once-than-the-machine-has-processors
   */
  it('is no more than the machine has processors', () => {
    expect(jobs({}, { processors: 2, memory: 64 * GB })).toBe(2);
  });

  /**
   * @canon spec-the-analyzer-runs-no-more-processes-at-once-than-half-the-memory-holds
   */
  it('is no more than half of the memory holds at a gigabyte of heap each', () => {
    expect(jobs({}, { processors: 16, memory: 8 * GB })).toBe(4);
    expect(jobs({}, { processors: 4, memory: 16 * GB })).toBe(4);
  });

  /**
   * @canon spec-the-analyzer-runs-at-least-one-process
   */
  it('is one on a machine whose memory holds none', () => {
    expect(jobs({}, { processors: 4, memory: 1 * GB })).toBe(1);
  });

  /**
   * @canon spec-canon-alloy-jobs-sets-how-many-processes-run-at-once
   */
  it('is what CANON_ALLOY_JOBS says, more or fewer than the machine holds', () => {
    expect(jobs({ CANON_ALLOY_JOBS: '12' }, { processors: 2, memory: 4 * GB })).toBe(12);
    expect(jobs({ CANON_ALLOY_JOBS: '1' }, { processors: 16, memory: 64 * GB })).toBe(1);
    expect(jobs({ CANON_ALLOY_JOBS: '0' }, { processors: 2, memory: 64 * GB })).toBe(2);
  });

  /**
   * @canon spec-canon-alloy-jobs-sets-how-many-processes-run-at-once
   */
  it('keeps the processes that a caller starts at once to the number CANON_ALLOY_JOBS says', async () => {
    const analyzer = fakeAnalyzer(scratch(), { ms: 300 });
    const before = process.env.CANON_ALLOY_JOBS;
    process.env.CANON_ALLOY_JOBS = '2';
    try {
      expect(await Promise.all(['a', 'b', 'c', 'd', 'e'].map(name => runOne(analyzer, name)))).toEqual([true, true, true, true, true]);
    } finally {
      if (before === undefined) delete process.env.CANON_ALLOY_JOBS;
      else process.env.CANON_ALLOY_JOBS = before;
    }
    expect(analyzer.calls()).toHaveLength(5);
    expect(analyzer.most()).toBe(2);
  });

  /**
   * @canon spec-each-analyzer-process-takes-a-heap-of-at-most-one-gigabyte
   */
  it('each runs with a heap of at most a gigabyte', async () => {
    const analyzer = fakeAnalyzer(scratch());
    await runOne(analyzer, 'a');
    expect(analyzer.calls()).toHaveLength(1);
    for (const args of analyzer.calls()) expect(args).toContain('-Xmx1g');
  });
});
