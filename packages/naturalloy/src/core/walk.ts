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

/** A sentence with each term below it given by `f`, a noun phrase's own conditions and other thing first. */
export function mapTerms<S extends Sentence>(s: S, f: (x: Term) => Term): S {
  const term = (x: Term): Term => {
    if (x.t !== 'np') return f(x);
    const np = { ...x };
    if (x.other !== undefined) np.other = term(x.other);
    if (x.relative !== undefined) np.relative = mapTerms(x.relative, f);
    return f(np);
  };
  const sentence = (y: Sentence): Sentence => mapTerms(y, f);
  const num = (n: Num): Num => {
    switch (n.t) {
      case 'term':
        return { ...n, x: term(n.x) };
      case 'count':
      case 'sumOf':
        return { ...n, cond: sentence(n.cond) };
      case 'sumOver':
        return { ...n, body: num(n.body) };
      case 'arith':
        return { ...n, l: num(n.l), r: num(n.r) };
      default:
        return n;
    }
  };
  const out = ((): Sentence => {
    switch (s.t) {
      case 'reading':
        return { ...s, args: s.args.map(term) };
      case 'same':
        return { ...s, l: term(s.l), r: term(s.r) };
      case 'isA':
        return { ...s, x: term(s.x) };
      case 'next':
        return { ...s, x: term(s.x), y: term(s.y) };
      case 'reach':
        return { ...s, from: term(s.from), to: term(s.to), step: sentence(s.step) };
      case 'compare':
        return { ...s, l: num(s.l), r: num(s.r) };
      case 'and':
      case 'or':
        return { ...s, items: s.items.map(sentence) };
      case 'not':
      case 'moment':
      case 'quant':
        return { ...s, body: sentence(s.body) };
      case 'define':
        return { ...s, head: mapTerms(s.head, f), body: sentence(s.body) };
      case 'rule':
        return s.otherwise === undefined ? { ...s, when: sentence(s.when), then: sentence(s.then) } : { ...s, when: sentence(s.when), then: sentence(s.then), otherwise: sentence(s.otherwise) };
      case 'iff':
        return { ...s, l: sentence(s.l), r: sentence(s.r) };
      case 'until':
      case 'since':
        return { ...s, a: sentence(s.a), b: sentence(s.b) };
      case 'pair':
        return { ...s, first: mapTerms(s.first, f), second: mapTerms(s.second, f) };
    }
  })();
  return out as S;
}
