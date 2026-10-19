/**
 * A world that the analyzer found, said in the readings of a document: the
 * trace of a run, read from the text the analyzer writes for it, as its steps,
 * each with the tuples that hold at it.
 */
import { articleFor, unbracketed, type Readings } from './verbalize.ts';
import { signaturesIn } from './words.ts';

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
  for (const line of text.split(/\r?\n/)) {
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

/** What the model declares of a signature: `var`, `one`, and whether it sits inside another with `in`. */
type Signature = { var: boolean; one: boolean; subset: boolean };

/** The name of a thing: its noun and its number from 1, `claim_1` for `Claim$0`, or the analyzer's name when its signature has no noun. */
function nameOf(thing: string, readings: Readings | undefined): string {
  const m = /^(\w+)\$(\d+)$/.exec(thing);
  const noun = m === null ? undefined : readings?.nouns.get(m[1] as string);
  if (m === null || noun === undefined) return thing;
  return `${unbracketed(noun).trim().replace(/\s+/g, '_')}_${Number(m[2]) + 1}`;
}

/** The highest place a reading has a variable for, `{2}` is 2; 0 when it has none. */
const places = (words: string): number => Math.max(0, ...[...words.matchAll(/\{(\d+)\}/g)].map(m => Number(m[1])));

/**
 * The sentences that a state holds, in the order of its words, each once, and
 * the things they name. A thing of a signature with no reading that sits in no
 * other is said to exist when its signature is `var`, or when no sentence of
 * the world names it: `named` is what the world names, once it is known.
 */
function sentences(state: State, readings: Readings | undefined, signatures: Map<string, Signature>, named?: Set<string>): { said: string[]; names: Set<string> } {
  const said = new Set<string>();
  const names = new Set<string>();
  for (const word of state.words) {
    const reading = readings?.atoms.get(word.name) ?? (word.field === undefined ? undefined : readings?.atoms.get(word.field.field));
    const name = (thing: string): string => {
      names.add(thing);
      return nameOf(thing, readings);
    };
    if (reading !== undefined) {
      const words = unbracketed(reading.positive);
      for (const tuple of word.tuples) {
        // A field of a `one` signature is a relation the signature only holds: its reading may have no place for the signature's thing.
        const things = word.field !== undefined && signatures.get(word.field.holder)?.one && places(words) < tuple.length ? tuple.slice(1) : tuple;
        said.add(words.replace(/\{(\d+)\}/g, (_, n: string) => name(things[Number(n) - 1] ?? '?')));
      }
      continue;
    }
    if (word.field !== undefined) {
      for (const tuple of word.tuples) said.add(`${word.name}: ${tuple.map(name).join(' -> ')}`);
      continue;
    }
    const signature = signatures.get(word.name);
    if (!signature?.subset) {
      // Its own things carry its name; those of a signature that extends it are said under that signature.
      for (const [thing] of word.tuples) {
        if (named === undefined || !(thing as string).startsWith(`${word.name}$`)) continue;
        if (signature?.var || !named.has(thing as string)) said.add(`${nameOf(thing as string, readings)} exists`);
      }
      continue;
    }
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
  return { said: [...said], names };
}

/**
 * A world in lines: first the thing each variable of the scenario stands for,
 * then under `throughout:` what is true at every step, then each step, the
 * first with every other sentence that is true at it and each
 * later one with what became true (`+`) and false (`-`), then the step the
 * trace loops back to. `model` is the Alloy of the run, and `scenario` the
 * name of the scenario's predicate.
 */
export function sayWorld(text: string, model: string, readings: Readings | undefined, scenario: string): string[] {
  const { states, loop } = parseTrace(text);
  const signatures = new Map(signaturesIn(model).map(({ name, ...rest }) => [name, rest]));
  const named = new Set(states.flatMap(state => [...sentences(state, readings, signatures).names]));
  const out: string[] = [];
  for (const [skolem, tuples] of states[0]?.skolems ?? []) {
    if (!skolem.startsWith(`${scenario}_`)) continue;
    out.push(`${skolem.slice(scenario.length + 1)} is ${tuples.map(t => t.map(thing => nameOf(thing, readings)).join(' -> ')).join(', ')}`);
  }
  const said = states.map(state => sentences(state, readings, signatures, named).said);
  // What holds at every step is the setting of the world, said once before its story.
  const throughout = (said[0] ?? []).filter(s => said.every(step => step.includes(s)));
  if (throughout.length > 0) out.push('throughout:', ...throughout.map(s => `  ${s}`));
  let before: string[] | undefined;
  said.forEach((now, i) => {
    out.push(`step ${i}:`);
    if (before === undefined) {
      const rest = now.filter(s => !throughout.includes(s));
      out.push(...(rest.length > 0 ? rest : [throughout.length > 0 ? 'nothing else is true' : 'nothing is true']).map(s => `  ${s}`));
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
