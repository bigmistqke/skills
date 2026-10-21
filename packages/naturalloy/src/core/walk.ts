/**
 * The parts of the IR, walked in order: each sentence, clause, term and number below a node, the node first. A noun
 * phrase's conditions, a closure's step, a number's condition and a pair's clauses are walked too.
 */
import type { Num, Sentence, Term, Var } from './ir.ts';

export type Part = { sentence: Sentence } | { term: Term } | { num: Num };

/** Each part below a sentence, the sentence first, in the order a reader meets them. */
export function* parts(s: Sentence): Generator<Part> {
  yield { sentence: s };
  switch (s.t) {
    case 'reading':
      for (const arg of s.args) yield* termParts(arg);
      return;
    case 'same':
      yield* termParts(s.l);
      yield* termParts(s.r);
      return;
    case 'isA':
      yield* termParts(s.x);
      return;
    case 'next':
      yield* termParts(s.x);
      yield* termParts(s.y);
      return;
    case 'reach':
      yield* termParts(s.from);
      yield* termParts(s.to);
      yield* parts(s.step);
      return;
    case 'compare':
      yield* numParts(s.l);
      yield* numParts(s.r);
      return;
    case 'and':
    case 'or':
      for (const item of s.items) yield* parts(item);
      return;
    case 'not':
    case 'moment':
    case 'quant':
    case 'define':
      if (s.t === 'define') yield* parts(s.head);
      yield* parts(s.body);
      return;
    case 'rule':
      yield* parts(s.when);
      yield* parts(s.then);
      if (s.otherwise !== undefined) yield* parts(s.otherwise);
      return;
    case 'iff':
      yield* parts(s.l);
      yield* parts(s.r);
      return;
    case 'until':
    case 'since':
      yield* parts(s.b);
      yield* parts(s.a);
      return;
    case 'pair':
      yield* parts(s.first);
      yield* parts(s.second);
      return;
  }
}

function* termParts(x: Term): Generator<Part> {
  yield { term: x };
  if (x.t !== 'np') return;
  if (x.other !== undefined) yield* termParts(x.other);
  if (x.relative !== undefined) yield* parts(x.relative);
}

function* numParts(n: Num): Generator<Part> {
  yield { num: n };
  switch (n.t) {
    case 'term':
      yield* termParts(n.x);
      return;
    case 'count':
    case 'sumOf':
      yield* parts(n.cond);
      return;
    case 'sumOver':
      yield* numParts(n.body);
      return;
    case 'arith':
      yield* numParts(n.l);
      yield* numParts(n.r);
      return;
    default:
      return;
  }
}

/** The terms below a sentence. */
export function* termsBelow(s: Sentence): Generator<Term> {
  for (const part of parts(s)) if ('term' in part) yield part.term;
}

/** The sentences below a sentence, itself first. */
export function* sentencesBelow(s: Sentence): Generator<Sentence> {
  for (const part of parts(s)) if ('sentence' in part) yield part.sentence;
}

const isTerm = (x: Sentence | Term): x is Term => x.t === 'var' || x.t === 'free' || x.t === 'string' || x.t === 'np';

/** Whether a sentence or a term speaks of the variable anywhere: as a term, or as the variable of a noun phrase. */
export function mentions(x: Sentence | Term, v: Var): boolean {
  for (const part of isTerm(x) ? termParts(x) : parts(x)) if ('term' in part && (part.term.t === 'var' || part.term.t === 'np') && part.term.v.id === v.id) return true;
  return false;
}

/** Whether a sentence holds a noun phrase anywhere. */
export const holdsPhrase = (s: Sentence): boolean => [...termsBelow(s)].some(x => x.t === 'np');

/** The names of the variables a sentence leaves free. */
export const freeNames = (s: Sentence): Set<string> => new Set([...termsBelow(s)].flatMap(x => (x.t === 'free' ? [x.name] : [])));
