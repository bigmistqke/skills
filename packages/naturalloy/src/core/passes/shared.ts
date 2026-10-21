/**
 * Negative clauses about one subject that share its verb, each going on with a noun phrase of its own, said once before
 * "none of these": "the definition has none of these:", and the noun phrases as bullets, in place of "the definition
 * has no …" on every bullet.
 */
import type { Clause, Sentence } from '../ir.ts';
import { everywhere, type Pass } from '../pass.ts';
import { Vocabulary } from '../vocabulary.ts';

export const noneOfThese: Pass = everywhere('none-of-these', 'spec-negative-clauses-that-share-their-words-are-said-once-before-none-of-these', (s, context) => {
  if (s.t !== 'and' || s.form !== undefined || s.items.length < 2) return undefined;
  const items = s.items;
  if (!items.every((item): item is Extract<Clause, { t: 'reading' }> => item.t === 'reading' && item.negative)) return undefined;
  // One subject: the same variable in the first slot of every clause.
  const subjects = items.map(item => item.args[0]);
  const first = subjects[0];
  if (first?.t !== 'var' || !subjects.every(x => x?.t === 'var' && x.v.id === first.v.id)) return undefined;
  return new Vocabulary(context.readings).shared(items.map(item => item.key)) === undefined ? undefined : { ...s, form: 'none-of' };
});
