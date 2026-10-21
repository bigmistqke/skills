/**
 * A negation said in the words of what it negates: "it is not the case that" moved inward, through each "and", "or",
 * rule, quantifier and time phrase that has a dual, down to clauses said with their negative words. `not (a and b)` is
 * `not a or not b`, `not all x | f` is `some x | not f`, `not always f` is `eventually not f`, and a clause takes the
 * negative words of its reading.
 */
import type { Clause, Sentence } from '../ir.ts';
import { type Context, everywhere } from '../pass.ts';

const OPPOSITE = { '<': '!<', '>': '!>', '=<': '!=<', '>=': '!>=', '=': '!=', '!<': '<', '!>': '>', '!=<': '=<', '!>=': '>=', '!=': '=' } as const;
const DUAL = { always: 'eventually', eventually: 'always', historically: 'once', once: 'historically', after: 'after' } as const;

/** The sentence that `not s` equals with the negation moved all the way in, or undefined where it cannot move. */
export function negated(s: Sentence, context: Context): Sentence | undefined {
  const not = (x: Sentence): Sentence => negated(x, context) ?? { t: 'not', body: x };
  switch (s.t) {
    case 'reading':
      // A reading says its negation only where the table gives it negative words.
      return context.readings.atoms.get(s.key)?.[s.negative ? 'positive' : 'negative'] === undefined ? undefined : { ...s, negative: !s.negative };
    case 'same':
    case 'isA':
    case 'reach':
    case 'next':
      return { ...s, negative: !s.negative } as Clause;
    case 'compare':
      return { ...s, op: OPPOSITE[s.op] };
    case 'not':
      return s.body;
    case 'and':
      return { t: 'or', items: s.items.map(not) };
    case 'or':
      return { t: 'and', items: s.items.map(not) };
    case 'rule':
      return s.otherwise === undefined ? { t: 'and', items: [s.when, not(s.then)] } : { t: 'rule', when: s.when, then: not(s.then), otherwise: not(s.otherwise) };
    case 'quant':
      if (s.q === 'all') return { ...s, q: 'some', body: not(s.body) };
      if (s.q === 'some') return { ...s, q: 'no' };
      if (s.q === 'no') return { ...s, q: 'some' };
      return undefined;
    case 'moment':
      return s.op === 'before' ? undefined : { t: 'moment', op: DUAL[s.op], body: not(s.body) };
    default:
      return undefined;
  }
}

export const negationInward = everywhere('negation-inward', 'spec-not-before-a-compound-is-said-with-the-not-moved-inward', (s, context) =>
  s.t === 'not' && s.untrue !== true && s.whole !== true ? negated(s.body, context) : undefined
);

/** `not (a iff b)` said as exactly one of the two holding. */
export const exactlyOne = everywhere('exactly-one', 'spec-not-before-an-equivalence-is-said-as-exactly-one-of-its-sides', s =>
  s.t === 'not' && s.body.t === 'iff' && s.exactlyOne !== true ? { ...s, exactlyOne: true } : undefined
);
