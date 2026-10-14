/**
 * The runners whose calls the checker reads as tests, and the vocabulary of a
 * project: the union of the runners its setting `runners` lists, or of every
 * preset when it lists none.
 */

/** A runner's calls, the modifiers that keep a call a test, and those that also mark it to fail. */
export interface Runner {
  calls: string[];
  modifiers: string[];
  fails: string[];
}

/** One preset for each runner the canon states a fact about. */
export const PRESETS: Record<string, Runner> = {
  vitest: {
    calls: ['it', 'test'],
    modifiers: ['concurrent', 'sequential', 'only', 'skip', 'todo', 'each', 'for', 'skipIf', 'runIf'],
    fails: ['fails']
  },
  jest: {
    calls: ['it', 'test', 'fit', 'xit', 'xtest'],
    modifiers: ['only', 'skip', 'todo', 'each', 'concurrent'],
    fails: ['failing']
  },
  playwright: {
    calls: ['test'],
    modifiers: ['only', 'skip', 'fixme'],
    fails: ['fail']
  },
  node: {
    calls: ['it', 'test'],
    modifiers: ['only', 'skip', 'todo'],
    fails: []
  }
};

/** What the checker reads as a test in a project. */
export interface Vocabulary {
  calls: Set<string>;
  modifiers: Set<string>;
  fails: Set<string>;
  /** The calls whose every test is an expected failure: functions marked `@runner fails`. */
  failCalls: Set<string>;
}

const KEYS = ['calls', 'modifiers', 'fails'] as const;

const isStrings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string');

/**
 * The vocabulary of the setting `runners`, or of every preset when it is
 * undefined. Throws an Error that says what is wrong with an entry: a name
 * that is no preset, or a map with a key other than `calls`, `modifiers` and
 * `fails`, or one whose value is not a list of strings.
 */
export function vocabularyOf(runners: unknown): Vocabulary {
  const entries: unknown[] = runners === undefined ? Object.keys(PRESETS) : Array.isArray(runners) ? runners : [runners];
  const vocabulary: Vocabulary = { calls: new Set(), modifiers: new Set(), fails: new Set(), failCalls: new Set() };
  for (const entry of entries) {
    let runner: Runner;
    if (typeof entry === 'string') {
      const preset = PRESETS[entry];
      if (preset === undefined) {
        throw new Error(`the runner "${entry}" is no preset; the presets are ${Object.keys(PRESETS).map(k => `"${k}"`).join(', ')}`);
      }
      runner = preset;
    } else if (typeof entry === 'object' && entry !== null && !Array.isArray(entry)) {
      for (const [key, value] of Object.entries(entry)) {
        if (!(KEYS as readonly string[]).includes(key)) {
          throw new Error(`a runner written as a map has the key "${key}"; its keys are "calls", "modifiers" and "fails"`);
        }
        if (!isStrings(value)) throw new Error(`the key "${key}" of a runner takes a list of strings`);
      }
      const map = entry as Partial<Runner>;
      runner = { calls: map.calls ?? [], modifiers: map.modifiers ?? [], fails: map.fails ?? [] };
    } else {
      throw new Error('a runner is the name of a preset or a map of calls, modifiers and fails');
    }
    for (const key of KEYS) for (const name of runner[key]) vocabulary[key].add(name);
  }
  return vocabulary;
}
