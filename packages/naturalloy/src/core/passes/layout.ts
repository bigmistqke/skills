/**
 * Passes of layout: each leaves a hint on a node that the printer follows, and changes no meaning. A hint is left only
 * where the words the node would be said with in a sentence cannot be read two ways: where a time phrase, a relative
 * clause or a comma would not run over the words that follow it.
 */
import type { Sentence } from '../ir.ts';
import { children, type Context, everywhere, type Pass } from '../pass.ts';
import { holdsOwnComma, holdsRelative, holdsTime, INLINE_ITEMS, INLINE_LENGTH, seen, timed, VARIABLE } from '../words.ts';

/** A clause with a variable or a string in each place: one reading, said as it stands. */
const plainClause = (s: Sentence): boolean =>
  (s.t === 'reading' || s.t === 'same' || s.t === 'isA' || s.t === 'next') &&
  (s.t === 'reading' ? s.args : s.t === 'same' ? [s.l, s.r] : s.t === 'isA' ? [s.x] : [s.x, s.y]).every(term => term.t !== 'np');

/** A clause of one reading or a comparison of values, whatever stands in its places. */
const anyClause = (s: Sentence): boolean => s.t === 'reading' || s.t === 'same' || s.t === 'isA' || s.t === 'next';

/** What can stand beside other clauses in a sentence: a clause, or one at the next moment. */
const clauseLike = (s: Sentence): boolean => anyClause(s) || (s.t === 'moment' && s.op === 'after' && s.inline === true && anyClause(s.body));

/** The words of a node as one line, or undefined where they are more. */
const line = (s: Sentence, context: Context): string | undefined => context.words(s);

/** An "and" or an "or" of a few short clauses, said as one sentence: "a, b and c". Not right below a time phrase, which on one line could read as covering its first clause alone. */
export const clausesInASentence: Pass = {
  name: 'clauses-in-a-sentence',
  spec: 'spec-three-clauses-or-fewer-are-said-in-a-sentence',
  run(top, context) {
    // Below a time phrase an "and" or an "or" stays a list.
    const walk = (s: Sentence, belowTime: boolean): Sentence => {
      const inner = children(s, child => walk(child, s.t === 'moment'));
      if (inner.t === 'and' && inner.sequence === true) return inSentence(inner, context) ?? inner;
      return belowTime ? inner : (inSentence(inner, context) ?? inner);
    };
    return walk(top, false);
  }
};

function inSentence(s: Sentence, context: Context): Sentence | undefined {
  // "a, and at the next moment, b": a sequence of two plain clauses.
  if (s.t === 'and' && s.sequence === true && s.inline !== true) {
    const [a, b] = s.items as [Sentence, Sentence];
    return plainClause(a) && b.t === 'moment' && b.op === 'after' && plainClause(b.body) ? { ...s, inline: true } : undefined;
  }
  if ((s.t !== 'and' && s.t !== 'or') || s.inline === true || s.spelled === true || s.items.length > INLINE_ITEMS || !s.items.every(clauseLike)) return undefined;
  const said = s.items.map(item => line(item, context));
  if (said.some(words => words === undefined)) return undefined;
  const words = said as string[];
  // A comma inside an item makes a list of three read as a list of more.
  if (s.items.length > 2 && words.some(w => seen(w).includes(','))) return undefined;
  // A time phrase at the start of a clause would cover the clauses after it, and a relative clause would run over them.
  if (words.slice(0, -1).some(w => timed(w) || holdsRelative(w))) return undefined;
  // "o and p are the same" has an "and" of its own, which among others would not show where it ends.
  if (words.some(w => w.includes(`${VARIABLE} and ${VARIABLE}`))) return undefined;
  const hinted: Sentence = { ...s, inline: true };
  const whole = line(hinted, context);
  return whole !== undefined && seen(whole).length <= INLINE_LENGTH ? hinted : undefined;
}

/** A time phrase in front of the words it covers: "at the next moment, c has run", "now and at every later moment, for every cleanup:". */
export const timePhraseInFront = everywhere('time-phrase-in-front', 'spec-a-time-phrase-before-words-that-hold-a-time-phrase-sets-them-apart', (s, context) => {
  if (s.t !== 'moment' || s.inline === true) return undefined;
  // A sequence is said "a, and at the next moment, b": it holds a time phrase of its own.
  if (s.body.t === 'and' && s.body.sequence === true) return undefined;
  const words = line(s.body, context);
  // Two time phrases in a row would read as one moment.
  if (words !== undefined) return holdsTime(words) ? undefined : { ...s, inline: true };
  // A list or a block takes the phrase on the line that opens it, when that line holds no time phrase of its own; a rule keeps it above.
  const opening = context.opening(s.body);
  return opening !== undefined && 'intro' in opening && !holdsTime(opening.intro) ? { ...s, inline: true } : undefined;
});

/** A rule of one-line sides on one line: "when a, b", and "when a, b; otherwise, c". */
export const ruleOnOneLine = everywhere('rule-on-one-line', 'spec-a-rule-of-two-clauses-is-said-on-one-line', (s, context) => {
  if (s.t !== 'rule' || s.oneLine === true) return undefined;
  // A side that is itself a rule is set apart, so the rule cannot be one line.
  if (s.when.t === 'rule' || s.then.t === 'rule' || s.otherwise?.t === 'rule') return undefined;
  const [when, then, otherwise] = [line(s.when, context), line(s.then, context), s.otherwise === undefined ? undefined : line(s.otherwise, context)];
  if (when === undefined || then === undefined || (s.otherwise !== undefined && otherwise === undefined)) return undefined;
  // A time phrase in the first side would reach over the second.
  if (holdsTime(when)) return undefined;
  // On one line, a comma in either side with no "then" between them would read as where the second side starts.
  if (!timed(then) && (holdsOwnComma(then, context.readings) || seen(when).includes(','))) return undefined;
  // A series in a side, "a, and at the next moment, b", could end before its last clause and leave it outside the rule.
  const series = (words: string): boolean => /, (?:and|or) /.test(seen(words).replace(/there is a moment (?:just )?before, and at it, /g, ''));
  if (series(then) || (otherwise !== undefined && (series(otherwise) || holdsTime(then)))) return undefined;
  return { ...s, oneLine: true };
});

/**
 * "a exactly when b", where the first side is a plain clause, whose end the words show; and "a at the next moment
 * exactly when b now". Not as a side of a rule, a time phrase or a definition, where "exactly when" could take the
 * whole sentence for a side: there it is "both or neither".
 */
export const exactlyWhen: Pass = {
  name: 'exactly-when',
  spec: 'spec-an-equivalence-of-two-clauses-is-said-with-exactly-when',
  run(top, context) {
    const walk = (s: Sentence, aSide: boolean): Sentence => {
      const isSide = s.t === 'rule' || s.t === 'moment' || s.t === 'until' || s.t === 'since' || s.t === 'define';
      const inner = children(s, child => walk(child, isSide));
      return aSide ? inner : (equivalence(inner, context) ?? inner);
    };
    return walk(top, false);
  }
};

function equivalence(s: Sentence, context: Context): Sentence | undefined {
  if (s.t !== 'iff' || s.inline === true) return undefined;
  if (plainClause(s.l) && clauseLike(s.r)) {
    const [l, r] = [line(s.l, context), line(s.r, context)];
    if (l !== undefined && r !== undefined && !holdsTime(l) && !seen(l).includes(',') && !holdsRelative(l)) return { ...s, inline: true };
  }
  // "a at the next moment exactly when b now": each time phrase ends its own clause, so neither can reach the other.
  const next = (x: Sentence): boolean => x.t === 'moment' && x.op === 'after' && plainClause(x.body);
  if ((next(s.l) && plainClause(s.r)) || (next(s.r) && plainClause(s.l))) {
    // A "same" clause is the last words and its "and" joins its pair; any other "and" or "or" could read two ways.
    const bare = (x: Sentence): boolean => {
      const inner = x.t === 'moment' ? x.body : x;
      const words = line(inner, context);
      return words !== undefined && !holdsTime(words) && !holdsRelative(words) && !seen(words).includes(',') && (inner.t === 'same' ? x === s.r : !/\band\b|\bor\b/.test(seen(words)));
    };
    if (bare(s.l) && bare(s.r)) return { ...s, inline: true, nextAndNow: true };
  }
  return undefined;
}
