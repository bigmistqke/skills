/**
 * Passes of time: a rule that holds from now on, read "from now on, whenever", and `until` and `since` of two plain
 * clauses, read as one sentence each.
 */
import type { Sentence } from '../ir.ts';
import { type Context, everywhere, type Pass } from '../pass.ts';
import { holdsRelative, holdsTime, seen } from '../words.ts';

/** Whether a sentence names a moment of its own, other than the next one: "now", "a moment before", "until". */
function anchored(s: Sentence): boolean {
  if (s.t === 'moment' && s.op === 'after') return anchored(s.body);
  if (s.t === 'moment' || s.t === 'until' || s.t === 'since') return true;
  return JSON.stringify(s).match(/"t":"(?:moment|until|since)"/) !== null && !onlyNext(s);
}

/** Whether every moment a sentence names is the next one. */
function onlyNext(s: Sentence): boolean {
  const ops = [...JSON.stringify(s).matchAll(/"t":"(moment|until|since)"(?:,"op":"(\w+)")?/g)];
  return ops.every(m => m[1] === 'moment' && m[2] === 'after');
}

/** Whether a signature has the same members at every moment: the vocabulary declares it, and not `var`. */
const constant = (type: string, context: Context): boolean => context.readings.holders.has(type) && !context.readings.variables.has(type);

/**
 * `always` over "for every" of signatures that never change is "for every" of `always`: the same things exist at every
 * moment, so the two orders mean the same. Moved only where the rule inside then reads "from now on, whenever".
 */
export const alwaysInsideForEvery = everywhere('always-inside-for-every', 'spec-a-rule-at-every-later-moment-is-said-from-now-on-whenever', (s, context) => {
  if (s.t !== 'moment' || s.op !== 'always') return undefined;
  const chain: Extract<Sentence, { t: 'quant' }>[] = [];
  let inner: Sentence = s.body;
  while (inner.t === 'quant' && inner.q === 'all') {
    chain.push(inner);
    inner = inner.body;
  }
  if (chain.length === 0 || inner.t !== 'rule' || inner.otherwise !== undefined || anchored(inner)) return undefined;
  if (!chain.every(q => q.vars.every(v => constant(v.type, context)))) return undefined;
  return chain.reduceRight<Sentence>((body, q) => ({ ...q, body }), { t: 'moment', op: 'always', body: inner });
});

/** A rule at every moment from now, "from now on, whenever" its condition: the moments it covers start now. */
export const fromNowOnWhenever: Pass = {
  ...everywhere('from-now-on-whenever', 'spec-a-rule-at-every-later-moment-is-said-from-now-on-whenever', s =>
  s.t === 'moment' && s.op === 'always' && s.form === undefined && s.body.t === 'rule' && s.body.otherwise === undefined && !anchored(s.body) ? { ...s, form: 'whenever' } : undefined
),
  evidence: {
    readers: ['Two passes of a strict judge (Opus) found 98 of 102 sampled statements lossless; the 4 failures came from the old "a moment before", now "a moment just before".', 'On a canon of 41 rules, a judge rated 25 as reading as well as the handwritten claim, against none before.'],
    rejected: ['"whenever" over a rule that says "now" or a moment before: its "now" would count from each moment "whenever" picks.']
  }
};

/** A clause of one reading with a variable in each place: no time phrase, comma, relative clause or noun phrase. */
function single(s: Sentence, context: Context): boolean {
  if ((s.t !== 'reading' && s.t !== 'same' && s.t !== 'isA' && s.t !== 'next') || JSON.stringify(s).includes('"t":"np"')) return false;
  const words = context.words(s);
  return words !== undefined && !holdsTime(words) && !seen(words).includes(',') && !holdsRelative(words);
}

/** `until` and `since` of two plain clauses, said as one sentence: "b now or later, and until then, a". */
export const untilInASentence: Pass = {
  ...everywhere('until-in-a-sentence', 'spec-until-of-two-plain-clauses-is-one-sentence', (s, context) =>
  (s.t === 'until' || s.t === 'since') && s.form === undefined && single(s.a, context) && single(s.b, context) ? { ...s, form: 'sentence' } : undefined
),
  evidence: {
    readers: ['On 8 timelines built to catch each misreading, 5 of 5 readers (Opus, Sonnet, three haiku) read "until then" right; "first" is not needed, since any moment of b gives the same truth.'],
    rejected: [
      '"up to the first such moment, but not necessarily at it": lossless, and longer than it needs to be.',
      '"ever since", "since then" and "after that" for since: each misread by a haiku reader, as counting the moment of b itself or as its first moment; since needs the last.'
    ]
  }
};
