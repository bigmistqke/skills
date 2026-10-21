/** The order of the passes: each runs after the passes whose shapes it reads, as the canon says. */
import { describe, expect, it } from 'vitest';
import { PASSES } from '../../src/core/passes/index.ts';

/** Where a pass stands in the pipeline. */
const at = (name: string): number => {
  const index = PASSES.findIndex(pass => pass.name === name);
  if (index === -1) throw new Error(`no pass "${name}"`);
  return index;
};

describe('the order of the passes', () => {
  /**
   * @canon spec-a-negation-moves-inward-before-noun-phrases-are-said
   */
  it('moves a negation inward before it says noun phrases', () => {
    expect(at('negation-inward')).toBeLessThan(at('noun-phrases'));
  });

  /**
   * @canon spec-two-things-of-a-kind-are-paired-before-noun-phrases-are-said
   */
  it('pairs two things of a kind before it says noun phrases', () => {
    expect(at('another-of-a-kind')).toBeLessThan(at('noun-phrases'));
  });

  /**
   * @canon spec-noun-phrases-are-said-before-there-is-a-that
   */
  it('says noun phrases before "there is a … that"', () => {
    expect(at('noun-phrases')).toBeLessThan(at('there-is-a-that'));
  });

  /**
   * @canon spec-a-set-equal-to-a-variable-is-said-before-quantifiers-of-for-every-become-one
   */
  it('says a set equal to a variable before quantifiers of "for every" become one', () => {
    expect(at('x-and-no-other')).toBeLessThan(at('for-every-together'));
  });

  /**
   * @canon spec-until-is-said-in-a-sentence-before-a-time-phrase-goes-in-front
   */
  it('says until in a sentence before a time phrase goes in front', () => {
    expect(at('until-in-a-sentence')).toBeLessThan(at('time-phrase-in-front'));
  });

  /**
   * @canon spec-a-time-phrase-goes-in-front-before-clauses-become-a-sentence
   */
  it('puts a time phrase in front before clauses become a sentence', () => {
    expect(at('time-phrase-in-front')).toBeLessThan(at('clauses-in-a-sentence'));
  });

  /**
   * @canon spec-clauses-become-a-sentence-before-a-rule-goes-on-one-line
   */
  it('makes clauses a sentence before a rule goes on one line', () => {
    expect(at('clauses-in-a-sentence')).toBeLessThan(at('rule-on-one-line'));
  });
});
