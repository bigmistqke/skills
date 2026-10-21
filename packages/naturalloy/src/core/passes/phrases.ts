/**
 * A "there is" or "there is no" over one variable that is said once, as a noun phrase in the place of that variable:
 * "spec_1 cites no axiom" and not "there is no axiom_1 such that spec_1 cites axiom_1". The other conditions on the
 * variable become a relative clause, "an issue that tracker does not know", and a difference from another variable of
 * its kind becomes "another unit". A quantifier of several variables is one inside the other: "a test checks a bug
 * that sits in unit_1".
 */
import type { Clause, NounPhrase, Sentence, Term, Var } from '../ir.ts';
import { type Context, everywhere } from '../pass.ts';
import { timed } from '../words.ts';

/** The terms of a clause, in the order of its slots. */
export function termsOf(c: Clause): Term[] {
  switch (c.t) {
    case 'reading':
      return c.args;
    case 'same':
      return [c.l, c.r];
    case 'isA':
      return [c.x];
    case 'next':
      return [c.x, c.y];
    default:
      return [];
  }
}

const isVar = (term: Term, v: Var): boolean => term.t === 'var' && term.v.id === v.id;

/** Whether a sentence names the variable anywhere: as a term, or inside a noun phrase's conditions. */
export function mentions(s: Sentence | Term | undefined, v: Var): boolean {
  if (s === undefined) return false;
  return JSON.stringify(s).includes(`"id":"${v.id}"`);
}

/** The words of a reading of a clause, with its slots: where in them the variable's slot stands. */
function template(c: Clause, context: Context): string | undefined {
  switch (c.t) {
    case 'reading': {
      const reading = context.readings.atoms.get(c.key);
      return reading === undefined ? undefined : c.negative ? reading.negative : reading.positive;
    }
    case 'same':
      return '{1} and {2} are the same';
    case 'isA':
      return '{1} is a kind';
    case 'next':
      return '{2} is the integer after {1} without wrapping around';
    default:
      return undefined;
  }
}

/** Where the variable stands in a clause that says it once: at its start, at its end, or inside. Undefined where the clause does not say it once. */
function place(c: Clause, v: Var, context: Context): 'start' | 'end' | 'inside' | undefined {
  const terms = termsOf(c);
  const at = terms.findIndex(term => isVar(term, v));
  if (at === -1 || terms.filter(term => isVar(term, v)).length !== 1 || terms.some(term => term.t === 'np' && mentions(term, v))) return undefined;
  const words = template(c, context)?.trim();
  if (words === undefined || words.split(`{${at + 1}}`).length !== 2) return undefined;
  return words.startsWith(`{${at + 1}}`) ? 'start' : words.endsWith(`{${at + 1}}`) ? 'end' : 'inside';
}

/** A clause that can carry the noun phrase: a reading, a comparison of two values or a kind, with no noun phrase that speaks of the variable. */
function clause(s: Sentence): s is Clause {
  return s.t === 'reading' || s.t === 'same' || s.t === 'isA' || s.t === 'next';
}

/** What a condition says the variable differs from, when that is all it says. */
function differsFrom(s: Sentence, v: Var): Term | undefined {
  if (s.t !== 'same' || !s.negative) return undefined;
  if (isVar(s.l, v) && (s.r.t === 'var' || s.r.t === 'free' || s.r.t === 'string')) return s.r;
  if (isVar(s.r, v) && (s.l.t === 'var' || s.l.t === 'free' || s.l.t === 'string')) return s.l;
  return undefined;
}

/** The clause with the noun phrase in the place of the variable. */
function put(c: Clause, v: Var, np: NounPhrase): Clause {
  const put_ = (term: Term): Term => (isVar(term, v) ? np : term);
  switch (c.t) {
    case 'reading':
      return { ...c, args: c.args.map(put_) };
    case 'same':
      return { ...c, l: put_(c.l), r: put_(c.r) };
    case 'isA':
      return { ...c, x: put_(c.x) };
    case 'next':
      return { ...c, x: put_(c.x), y: put_(c.y) };
    default:
      return c;
  }
}

/** The quantifier said as a clause with a noun phrase, or undefined where it does not fit. */
export function absorbed(q: 'some' | 'no', v: Var, body: Sentence, context: Context): Clause | undefined {
  if (!context.readings.nouns.has(v.type)) return undefined;
  const parts = body.t === 'and' ? body.items : [body];
  let other: Term | undefined;
  const rest: Sentence[] = [];
  for (const part of parts) {
    const differs = other === undefined ? differsFrom(part, v) : undefined;
    if (differs !== undefined) other = differs;
    else rest.push(part);
  }
  // "no other" hints that the variable is in the set, which the logic does not say.
  if (rest.length === 0 || (other !== undefined && q === 'no')) return undefined;
  if (!rest.every(clause)) return undefined;
  const clauses = rest as Clause[];
  const places = clauses.map(c => place(c, v, context));
  if (places.some(p => p === undefined)) return undefined;
  // A time phrase in the phrase would cover the other conditions too.
  if (rest.length > 1 && rest.some(c => timed(context.words(c) ?? ''))) return undefined;
  // The main clause puts the variable beside a variable, a string or a name of its own, at its end where it can:
  // "test_1 carries a tag". Beside only another noun phrase, "a cleanup is on an owner" would read as said of every cleanup.
  const beside = (i: number): boolean => termsOf(clauses[i] as Clause).filter(term => term.t !== 'np').length >= 2;
  let main = rest.findIndex((_, i) => beside(i) && places[i] === 'end');
  if (main === -1) main = rest.findIndex((_, i) => beside(i) && places[i] === 'start');
  if (main === -1) return undefined;
  const relative = clauses.filter((_, i) => i !== main);
  // The others say more of the variable: each as its subject, or one with it at its end, "an issue that tracker does not know".
  if (relative.length > 0) {
    const asSubject = relative.every(c => places[clauses.indexOf(c)] === 'start');
    const asObject = relative.length === 1 && places[clauses.indexOf(relative[0] as Clause)] === 'end';
    if (!asSubject && !asObject) return undefined;
    // "x and y are different" has the variable in a subject of two, which a relative clause cannot take.
    if (relative.some(c => c.t === 'same')) return undefined;
  }
  const np: NounPhrase = {
    t: 'np',
    det: q === 'no' ? 'no' : 'a',
    v,
    ...(relative.length === 0 ? {} : { relative: relative.length === 1 ? (relative[0] as Sentence) : { t: 'and', items: relative } }),
    ...(other === undefined ? {} : { other })
  };
  return put(clauses[main] as Clause, v, np);
}

export const nounPhrases = everywhere('noun-phrases', 'spec-a-quantifier-said-once-is-a-noun-phrase', (s, context) => {
  if (s.t !== 'quant' || (s.q !== 'some' && s.q !== 'no')) return undefined;
  // Variables of different kinds are said one inside the other: the last innermost, under "some", then the first.
  const [first, ...later] = s.vars as [Var, ...Var[]];
  let body: Sentence = s.body;
  for (const v of [...later].reverse()) {
    const inner = absorbed('some', v, body, context);
    if (inner === undefined) return undefined;
    body = inner;
  }
  return absorbed(s.q, first, body, context);
});
