/**
 * How many analyzer processes `alloy:logic` runs at once, and how much memory
 * each may take. The count is worked out from the machine, so these cases give
 * it a machine; the processes themselves are a stand-in for the analyzer.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkAlloy, jobs } from '../../src/alloy.ts';
import { fakeAnalyzer } from './analyzer.ts';

const GB = 2 ** 30;
const DIRS: string[] = [];
afterEach(() => {
  for (const dir of DIRS.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** The tag, spelled apart so the checker does not read this file's templates as citations. */
const AXIOM = ['@', 'axiom'].join('');

/** Three units that share no word, so the analyzer is asked three searches. */
const THREE = ['apple', 'pear', 'plum']
  .map(fruit => `## ${AXIOM} a-${fruit}-exists\n\n\`\`\`alloy\nsome ${fruit[0]?.toUpperCase()}${fruit.slice(1)}\n\`\`\`\n\n\`\`\`alloy vocabulary\nsig ${fruit[0]?.toUpperCase()}${fruit.slice(1)} {}\n\`\`\`\n`)
  .join('\n');

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
  it('keeps the runs to the number CANON_ALLOY_JOBS says', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'canon-jobs-'));
    DIRS.push(dir);
    const analyzer = fakeAnalyzer(dir, { ms: 300 });
    const before = process.env.CANON_ALLOY_JOBS;
    process.env.CANON_ALLOY_JOBS = '1';
    try {
      const result = await checkAlloy(THREE, { java: analyzer.java, jar: analyzer.jar });
      expect(result).toMatchObject({ ok: true });
    } finally {
      process.env.CANON_ALLOY_JOBS = before;
    }
    expect(analyzer.calls()).toHaveLength(3);
    expect(analyzer.most()).toBe(1);
  });

  /**
   * @canon spec-each-analyzer-process-takes-a-heap-of-at-most-one-gigabyte
   */
  it('each runs with a heap of at most a gigabyte', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'canon-jobs-'));
    DIRS.push(dir);
    const analyzer = fakeAnalyzer(dir);
    await checkAlloy(THREE, { java: analyzer.java, jar: analyzer.jar });
    expect(analyzer.calls().length).toBeGreaterThan(0);
    for (const args of analyzer.calls()) expect(args).toContain('-Xmx1g');
  });
});
