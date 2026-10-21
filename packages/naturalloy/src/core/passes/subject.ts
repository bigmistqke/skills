/**
 * Two things said of a variable alone. A "there is" whose conditions all have the variable as their subject is said with
 * the noun and a relative clause: "there is a unit that is a spec", "no unit is a spec", and, for many or long
 * conditions, bullets after "there is a unit that:". A set equal to a variable is said as that variable and no other:
 * "the cleanup is on owner_1 and is on no other owner".
 */
import type { Clause, Sentence, Term, Var } from '../ir.ts';
import { type Context, everywhere } from '../pass.ts';
import { holdsRelative, holdsTime, INLINE_ITEMS, INLINE_LENGTH, seen } from '../words.ts';
import { absorbed, mentions, termsOf } from './phrases.ts';

const isVar = (term: Term, v: Var): boolean => term.t === 'var' && term.v.id === v.id;

/** Whether a clause says the variable once, as its subject: its reading's words begin with the variable's slot. */
function subjectOnce(c: Sentence, v: Var, context: Context): c is Clause {
  if (c.t !== 'reading' && c.t !== 'isA') return false;
  const terms = termsOf(c);
  const at = terms.findIndex(term => isVar(term, v));
  if (at === -1 || terms.filter(term => isVar(term, v)).length !== 1 || terms.some(term => term.t === 'np' && mentions(term, v))) return false;
  if (c.t === 'isA') return true;
  const reading = context.readings.atoms.get(c.key);
  const words = (c.negative ? reading?.negative : reading?.positive)?.trim();
  return words !== undefined && words.startsWith(`{${at + 1}}`) && words.split(`{${at + 1}}`).length === 2;
}

/**
 * "there is a unit that is a spec and is an axiom", "no unit is a spec", "there is no unit that …", and bullets after
 * "there is a unit that:" where the conditions are more than a sentence holds. "There is" keeps "a" from reading as
 * "every". Under "no", several conditions keep "there is no", so that "no" covers all of them, and a condition that says
 * "no" itself stays in full: "no claim takes no lane" is a double negative.
 */
export const thereIsAThat = everywhere('there-is-a-that', 'spec-a-quantifier-about-its-variable-alone-is-said-with-there-is-and-that', (s, context) => {
  if (s.t !== 'quant' || (s.q !== 'some' && s.q !== 'no') || s.subject !== undefined) return undefined;
  const [v, ...later] = s.vars as [Var, ...Var[]];
  if (!context.readings.nouns.has(v.type)) return undefined;
  // Variables after the first are said inside its conditions as noun phrases: "no cleanup is on an owner".
  let body: Sentence = s.body;
  for (const w of [...later].reverse()) {
    const inner = absorbed('some', w, body, context);
    if (inner === undefined) return undefined;
    body = inner;
  }
  const parts = body.t === 'and' ? body.items : [body];
  if (!parts.every(p => subjectOnce(p, v, context))) return undefined;
  const words = parts.map(p => context.words(p));
  if (words.some(w => w === undefined)) return undefined;
  if (s.q === 'no' && words.some(w => /\bno\b/.test(seen(w as string)))) return undefined;
  const sentence: Sentence = { ...s, vars: [v], body, subject: 'sentence' };
  const said = context.words(sentence);
  const fits = parts.length <= INLINE_ITEMS && said !== undefined && seen(said).length <= INLINE_LENGTH && !words.slice(0, -1).some(w => holdsTime(w as string) || holdsRelative(w as string));
  if (fits) return sentence;
  return s.q === 'some' && parts.length > 1 ? { ...s, vars: [v], body, subject: 'list' } : undefined;
});

/**
 * `s = x`, said member by member as "for every m: m in s exactly when m and x are the same", said as x in s and no
 * other member in it: "the cleanup is on owner_1 and is on no other owner". Only where being in `s` is one plain clause:
 * inside a noun phrase, "no other" would cover less than the claim.
 */
export const xAndNoOther = everywhere('x-and-no-other', 'spec-a-set-equal-to-a-variable-is-said-as-the-variable-and-no-other', (s, context) => {
  if (s.t !== 'quant' || s.q !== 'all' || s.vars.length !== 1 || s.body.t !== 'iff') return undefined;
  const v = s.vars[0] as Var;
  const [member, same] = s.body.r.t === 'same' ? [s.body.l, s.body.r] : [s.body.r, s.body.l];
  if (same.t !== 'same' || same.negative) return undefined;
  const value = isVar(same.l, v) ? same.r : isVar(same.r, v) ? same.l : undefined;
  if (value === undefined || value.t === 'np' || mentions(value, v)) return undefined;
  const next = member.t === 'moment' && member.op === 'after';
  const clause = next ? member.body : member;
  if (clause.t !== 'reading' || clause.args.filter(term => isVar(term, v)).length !== 1 || clause.args.some(term => term.t === 'np')) return undefined;
  const words = context.words(clause);
  if (words === undefined || holdsTime(words) || /[,:]|\b(?:and|or)\b/.test(seen(words)) || holdsRelative(words)) return undefined;
  const one: Clause = { ...clause, args: clause.args.map(term => (isVar(term, v) ? value : term)) };
  const none: Clause = { ...clause, args: clause.args.map(term => (isVar(term, v) ? { t: 'np', det: 'no', v, other: value } : term)) };
  const both: Sentence = { t: 'and', items: [one, none], inline: true };
  return next ? { t: 'moment', op: 'after', body: both, inline: true } : both;
});
