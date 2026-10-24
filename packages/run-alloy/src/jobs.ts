import { availableParallelism, totalmem } from 'node:os';

/** The largest heap of each analyzer process, in gigabytes. */
export const HEAP_GB = 1;

/**
 * The options of Java for each analyzer process. One collector thread: several
 * processes run at once, and a collector with a thread for every core makes them
 * wait for each other. A heap with a limit, so that the processes that memory
 * holds can be counted.
 *
 * @canon spec-each-analyzer-process-takes-a-heap-of-at-most-one-gigabyte
 */
export const JAVA_OPTIONS: readonly string[] = ['-XX:+UseSerialGC', `-Xmx${HEAP_GB}g`];

/** What a machine has for the analyzer: its processors, and its memory in bytes. */
export interface Machine {
  processors: number;
  memory: number;
}

/**
 * How many analyzer processes run at once: `CANON_ALLOY_JOBS` when it holds a
 * number above zero; otherwise no more than the machine has processors, no more
 * than half of its memory holds at the largest heap of each, and at least one.
 *
 * @canon spec-the-analyzer-runs-no-more-processes-at-once-than-the-machine-holds
 */
export function jobs(env: Record<string, string | undefined> = process.env, machine: Machine = { processors: availableParallelism(), memory: totalmem() }): number {
  const asked = Math.floor(Number(env.CANON_ALLOY_JOBS));
  if (asked >= 1) return asked;
  return Math.max(1, Math.min(machine.processors, Math.floor(machine.memory / 2 / (HEAP_GB * 2 ** 30))));
}

/** The processes of this Node process that run now, and the callers that wait for one to end. */
let running = 0;
const waiting: (() => void)[] = [];

/**
 * Wait for a place among the processes that run at once, and give a function
 * that gives it back. The number is read again at each start, so that a change
 * to `CANON_ALLOY_JOBS` holds from the next process on.
 */
export async function slot(): Promise<() => void> {
  while (running >= jobs()) await new Promise<void>(resolve => waiting.push(resolve));
  running++;
  let given = false;
  return () => {
    if (given) return;
    given = true;
    running--;
    waiting.shift()?.();
  };
}
