/**
 * A world that the analyzer found, said in the readings of a document: the
 * trace of a run, read from the text the analyzer writes for it, as its steps,
 * each with the tuples that hold at it.
 */
import { articleFor, unbracketed, type Readings } from './verbalize.ts';

/** One state of a trace: the tuples of each set and field, by Alloy name, and the things the variables of skolemized predicates stand for. */
interface State {
  words: { name: string; field?: { holder: string; field: string }; tuples: string[][] }[];
  skolems: Map<string, string[][]>;
}

/** The sets the analyzer writes into every state, which no document declares. */
const BUILT_IN = new Set(['univ', 'Int', 'seq/Int', 'String', 'none']);

/** The tuples of a value as the analyzer writes it: `{A$0->B$1, A$1->B$0}`. */
const tuplesOf = (value: string): string[][] =>
  value
    .replace(/^\{|\}$/g, '')
    .split(',')
    .map(tuple => tuple.trim())
    .filter(tuple => tuple !== '')
    .map(tuple => tuple.split('->'));

/** The states of a trace in the analyzer's text, and the state it loops back to. */
function parseTrace(text: string): { states: State[]; loop: number } {
  const states: State[] = [];
  let loop = 0;
  for (const line of text.split('\n')) {
    const head = /^-+State (\d+)( \(loop\))?-+$/.exec(line);
    if (head) {
      if (head[2] !== undefined) loop = Number(head[1]);
      states.push({ words: [], skolems: new Map() });
      continue;
    }
    const state = states.at(-1);
    if (state === undefined) continue;
    const skolem = /^skolem \$(\S+)=(\{.*\})$/.exec(line);
    if (skolem) {
      state.skolems.set(skolem[1] as string, tuplesOf(skolem[2] as string));
      continue;
    }
    const word = /^this\/(\w+)(?:<:(\w+))?=(\{.*\})$/.exec(line);
    if (word === null || BUILT_IN.has(word[1] as string)) continue;
    const [, holder, field, value] = word as unknown as [string, string, string | undefined, string];
    state.words.push(field === undefined ? { name: holder, tuples: tuplesOf(value) } : { name: `${holder}.${field}`, field: { holder, field }, tuples: tuplesOf(value) });
  }
  return { states, loop };
}

/**
 * The signatures a model declares inside another with `in`, such as `Ended` in
 * `var sig Ended in Claim`. Their things carry the name of another signature;
 * the things of every other signature carry its own name, or the name of a
 * signature that extends it.
 */
const subsetsOf = (model: string): Set<string> =>
  new Set(
    [...model.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(?:--|\/\/)[^\n]*/g, ' ').matchAll(/\bsig\s+([\w\s,]+?)\s+in\b/g)].flatMap(m =>
      (m[1] as string).split(',').map(name => name.trim())
    )
  );

/** The name of a thing: its noun and its number from 1, `claim_1` for `Claim$0`, or the analyzer's name when its signature has no noun. */
function nameOf(thing: string, readings: Readings | undefined): string {
  const m = /^(\w+)\$(\d+)$/.exec(thing);
  const noun = m === null ? undefined : readings?.nouns.get(m[1] as string);
  if (m === null || noun === undefined) return thing;
  return `${unbracketed(noun).trim().replace(/\s+/g, '_')}_${Number(m[2]) + 1}`;
}

/** The highest place a reading has a variable for, `{2}` is 2; 0 when it has none. */
const places = (words: string): number => Math.max(0, ...[...words.matchAll(/\{(\d+)\}/g)].map(m => Number(m[1])));

/** The sentences that a state holds, in the order of its words, each once. */
function sentences(state: State, readings: Readings | undefined, subsets: Set<string>): string[] {
  const said = new Set<string>();
  for (const word of state.words) {
    const reading = readings?.atoms.get(word.name) ?? (word.field === undefined ? undefined : readings?.atoms.get(word.field.field));
    const name = (thing: string): string => nameOf(thing, readings);
    if (reading !== undefined) {
      const words = unbracketed(reading.positive);
      for (const tuple of word.tuples) {
        // A field of a `one` signature is a relation the signature only holds: its reading has no place for the signature's thing.
        const things = places(words) < tuple.length ? tuple.slice(1) : tuple;
        said.add(words.replace(/\{(\d+)\}/g, (_, n: string) => name(things[Number(n) - 1] ?? '?')));
      }
      continue;
    }
    if (word.field !== undefined) {
      for (const tuple of word.tuples) said.add(`${word.name}: ${tuple.map(name).join(' -> ')}`);
      continue;
    }
    // A signature whose things carry its name, or the name of a signature that extends it, is said by the names of its things.
    if (!subsets.has(word.name)) continue;
    const noun = readings?.nouns.get(word.name);
    for (const [thing] of word.tuples) {
      if (noun === undefined) {
        said.add(`${word.name}: ${name(thing as string)}`);
        continue;
      }
      const plain = unbracketed(noun).trim();
      said.add(`${name(thing as string)} is ${readings?.articles.get(word.name) ?? articleFor(plain).trim()} ${plain}`);
    }
  }
  return [...said];
}

/**
 * A world in lines: first the thing each variable of the scenario stands for,
 * then each step, the first with every sentence that is true at it and each
 * later one with what became true (`+`) and false (`-`), then the step the
 * trace loops back to. `model` is the Alloy of the run, and `scenario` the
 * name of the scenario's predicate.
 */
export function sayWorld(text: string, model: string, readings: Readings | undefined, scenario: string): string[] {
  const { states, loop } = parseTrace(text);
  const subsets = subsetsOf(model);
  const out: string[] = [];
  for (const [skolem, tuples] of states[0]?.skolems ?? []) {
    if (!skolem.startsWith(`${scenario}_`)) continue;
    out.push(`${skolem.slice(scenario.length + 1)} is ${tuples.map(t => t.map(thing => nameOf(thing, readings)).join(' -> ')).join(', ')}`);
  }
  let before: string[] | undefined;
  states.forEach((state, i) => {
    const now = sentences(state, readings, subsets);
    out.push(`step ${i}:`);
    if (before === undefined) {
      out.push(...(now.length === 0 ? ['nothing is true'] : now).map(s => `  ${s}`));
    } else {
      const was = new Set(before);
      const is = new Set(now);
      const changes = [...now.filter(s => !was.has(s)).map(s => `+ ${s}`), ...before.filter(s => !is.has(s)).map(s => `- ${s}`)];
      out.push(...(changes.length === 0 ? ['nothing changes'] : changes).map(s => `  ${s}`));
    }
    before = now;
  });
  out.push(`then back to step ${loop}`);
  return out;
}
