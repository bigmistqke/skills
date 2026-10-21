/**
 * What the words of a part show a reader, for a pass that weighs whether a part can stand in a sentence beside others:
 * a time phrase covers what follows it, a relative clause runs over what follows it, and a comma can read as where a
 * sentence turns.
 */
import { plain, type Readings, unbracketed } from '../readings.ts';

/** Marks a variable in the words, so that a sentence is never started with a capital in place of the variable's own letter. */
export const VARIABLE = '\u0001';

/** The words as a reader sees them, without the marks of variables and links. */
export const seen = (words: string): string => plain(words).replaceAll(VARIABLE, '');

/** The time phrases the printer says, at the start of the words they cover. */
export const TIME_PHRASE = /^(?:from now on|now or later|now or earlier|now or at|now and at|at every|at the next|right after|there is a moment (?:just )?before|up to and including|back to and including|in integers that wrap)\b/;
const TIME_ANYWHERE = new RegExp(TIME_PHRASE.source.replace('^', '\\b'));

/** Whether words begin with a time phrase. */
export const timed = (words: string): boolean => TIME_PHRASE.test(seen(words));

/** Whether words hold a time phrase anywhere. */
export const holdsTime = (words: string): boolean => TIME_ANYWHERE.test(seen(words));

/** Whether words hold a relative clause or a "where", which would run over words that follow them. */
export const holdsRelative = (words: string): boolean => /\b(?:that|where)\b/.test(plain(words));

const COMMA_READINGS = new WeakMap<Readings, RegExp[]>();

/** Whether words hold a comma of their own, outside the words of their readings: a comma inside a reading is the author's. */
export function holdsOwnComma(words: string, readings: Readings): boolean {
  let patterns = COMMA_READINGS.get(readings);
  if (patterns === undefined) {
    const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    patterns = [...readings.atoms.values()]
      .flatMap(reading => [reading.positive, reading.negative])
      .filter((text): text is string => text !== undefined && unbracketed(text).includes(','))
      .map(text => new RegExp(escape(unbracketed(text)).replace(/\\\{\d\\\}/g, '.+?'), 'g'));
    COMMA_READINGS.set(readings, patterns);
  }
  return patterns.reduce((text, pattern) => text.replace(pattern, '…'), seen(words)).includes(',');
}

/** The most that is said in a sentence, and not in a list, and how long it may be. */
export const INLINE_ITEMS = 3;
export const INLINE_LENGTH = 110;

/**
 * A clause that begins with the variable the clause before it begins with says it once: "test_1 is an expected failure,
 * checks no bug and checks no exception". Not when the variable is the first of a pair, as in "unit_1 and unit_2 are
 * different", nor after a clause with a relative clause, which the one without its subject would read as more of.
 */
export function shareSubject(clauses: string[]): string[] {
  const subjectOf = (clause: string): string | undefined => /^\u0001[^\u0001]*\u0001/.exec(clause)?.[0];
  return clauses.map((clause, i) => {
    const subject = subjectOf(clause);
    const before = clauses[i - 1];
    if (i === 0 || subject === undefined || before === undefined || subjectOf(before) !== subject || /\bthat\b/.test(plain(before))) return clause;
    const rest = clause.slice(subject.length + 1);
    const pairLike = (c: string): boolean => /^(?:and|or)\b/.test(c.slice(subject.length + 1));
    return pairLike(clause) || pairLike(before) ? clause : rest;
  });
}

/** "a, b and c". */
export function coordinate(words: string[], word: 'and' | 'or'): string {
  if (words.length === 1) return words[0] as string;
  return `${words.slice(0, -1).join(', ')} ${word} ${words[words.length - 1]}`;
}
