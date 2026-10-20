/**
 * A sweep of the verbalizer: each kind of expression through each position an expression takes, each kind of formula
 * through each position a formula takes, and strings and numbers where they stand. Every formula it makes must end with
 * words or a refusal; the words are judged for loss apart from this test.
 */
import { describe, expect, it } from 'vitest';
import { isDefinition, isRefusal, parseReadings, verbalize, verbalizeDefinition, withDefinitions } from '../../src/verbalize.ts';
import { READINGS, SWEEP, VOCABULARY } from './sweep.ts';

const readings = withDefinitions(parseReadings(READINGS), VOCABULARY);

/** How saying a formula ended: in words, in a refusal, or in a fault, with what it gave. */
function said(formula: string): { ended: 'words' | 'refusal' | 'fault'; text: string } {
  try {
    return { ended: 'words', text: isDefinition(formula) ? verbalizeDefinition(formula, readings) : verbalize(formula, readings) };
  } catch (error) {
    return { ended: isRefusal(error) ? 'refusal' : 'fault', text: String(error) };
  }
}

describe('the sweep', () => {
  /**
   * @canon spec-saying-a-formula-ends
   * @canon spec-a-refusal-is-told-apart-from-a-fault
   */
  it('ends on every formula with words or a refusal', () => {
    const faults = SWEEP.map(({ what, formula }) => ({ what, formula, ...said(formula) })).filter(cell => cell.ended === 'fault');
    expect(faults).toEqual([]);
  });

  /**
   * @canon spec-a-formula-is-said-in-full
   */
  it('leaves no slot of a reading in the words', () => {
    const open = SWEEP.map(({ what, formula }) => ({ what, formula, ...said(formula) })).filter(cell => cell.ended === 'words' && /\{\d\}|\u0001/.test(cell.text));
    expect(open).toEqual([]);
  });
});
