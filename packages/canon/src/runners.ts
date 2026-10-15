/**
 * The runners whose calls the checker reads as tests: the ones the setting
 * `runners` lists, or every preset and the runner markers when it is not set.
 */

/**
 * A runner: its calls, the modifiers that keep a call a test, those that also
 * mark it to fail, the packages a module imports its calls from, the call
 * those packages export as their default, and whether it provides its calls
 * as globals.
 */
export interface Runner {
  calls: string[];
  modifiers: string[];
  fails: string[];
  from: string[];
  default?: string;
  globals: boolean;
}

/** One preset for each runner the canon states a fact about. */
export const PRESETS: Record<string, Runner> = {
  vitest: {
    calls: ['it', 'test'],
    modifiers: ['concurrent', 'sequential', 'only', 'skip', 'todo', 'each', 'for', 'skipIf', 'runIf'],
    fails: ['fails'],
    from: ['vitest'],
    globals: true
  },
  jest: {
    calls: ['it', 'test', 'fit', 'xit', 'xtest'],
    modifiers: ['only', 'skip', 'todo', 'each', 'concurrent'],
    fails: ['failing'],
    from: ['@jest/globals'],
    globals: true
  },
  playwright: {
    calls: ['test'],
    modifiers: ['only', 'skip', 'fixme'],
    fails: ['fail'],
    from: ['@playwright/test', 'playwright/test'],
    default: 'test',
    globals: false
  },
  node: {
    calls: ['it', 'test'],
    modifiers: ['only', 'skip', 'todo'],
    fails: [],
    from: ['node:test'],
    default: 'test',
    globals: false
  }
};

/** The entry of the setting `runners` that picks the runner markers: the functions a JSDoc line `@runner` marks. */
export const MARKER = '@runner';

const LISTS = ['calls', 'modifiers', 'fails', 'from'] as const;
const KEYS = [...LISTS, 'globals'] as const;

const isStrings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string');

/**
 * The runners of the setting `runners`, or every preset when it is undefined.
 * Throws an Error that says what is wrong with an entry: a name that is no
 * preset, or a map with a key it does not know, or a value of the wrong kind.
 */
export function runnersOf(setting: unknown): Runner[] {
  const entries: unknown[] = setting === undefined ? Object.keys(PRESETS) : Array.isArray(setting) ? setting : [setting];
  return entries.filter(entry => entry !== MARKER).map(entry => {
    if (typeof entry === 'string') {
      const preset = PRESETS[entry];
      if (preset === undefined) {
        throw new Error(`the runner "${entry}" is no preset; the presets are ${Object.keys(PRESETS).map(k => `"${k}"`).join(', ')}, and "${MARKER}" picks the runner markers`);
      }
      return preset;
    }
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new Error('a runner is the name of a preset or a map of calls, modifiers, fails, from and globals');
    }
    for (const [key, value] of Object.entries(entry)) {
      if (!(KEYS as readonly string[]).includes(key)) {
        throw new Error(`a runner written as a map has the key "${key}"; its keys are ${KEYS.map(k => `"${k}"`).join(', ')}`);
      }
      if (key === 'globals' ? typeof value !== 'boolean' && value !== 'true' && value !== 'false' : !isStrings(value)) {
        throw new Error(`the key "${key}" of a runner takes ${key === 'globals' ? 'true or false' : 'a list of strings'}`);
      }
    }
    const map = entry as Partial<Record<(typeof LISTS)[number], string[]>> & { globals?: boolean | string };
    return {
      calls: map.calls ?? [],
      modifiers: map.modifiers ?? [],
      fails: map.fails ?? [],
      from: map.from ?? [],
      globals: map.globals === true || map.globals === 'true'
    };
  });
}

/** Whether the setting `runners` picks the runner markers: it lists `"@runner"`, or is not set. */
export function marksOf(setting: unknown): boolean {
  return setting === undefined || (Array.isArray(setting) && setting.includes(MARKER));
}
