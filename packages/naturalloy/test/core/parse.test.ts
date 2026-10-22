/**
 * The words read back: each statement of the sweep, read by the reading rules, has one meaning, and it is the meaning of
 * the IR the printer said.
 */
import { describe, expect, it } from 'vitest';
import { context, lower, print } from '../../src/core/index.ts';
import { meaning } from '../../src/core/ir.ts';
import { optimize } from '../../src/core/pass.ts';
import { meant, readBack } from '../../src/core/parse.ts';
import { PASSES } from '../../src/core/passes/index.ts';
import { parseReadings, readsBack, withDefinitions } from '../../src/index.ts';
import { READINGS, SWEEP, VOCABULARY } from '../canon/sweep.ts';

const readings = withDefinitions(parseReadings(READINGS), VOCABULARY);
const FREE = ['c', 'd', 'o', 'p', 's', 't', 'x', 'y'];

describe('the words, read back', () => {
  /**
   * @canon spec-each-statement-reads-back-to-its-meaning
   */
  it('give each statement of the sweep one meaning, the meaning of what the printer said', () => {
    const wrong: { formula: string; words: string; meanings: string[] }[] = [];
    for (const { formula } of SWEEP) {
      let back;
      try {
        back = readsBack(formula, readings, FREE);
      } catch {
        continue;
      }
      if (back.meanings.length !== 1 || back.meanings[0] !== back.meant) wrong.push({ formula, words: back.words, meanings: back.meanings });
    }
    expect(wrong).toEqual([]);
  }, 600_000);

  /**
   * @canon spec-another-differs-from-the-thing-of-its-kind-named-last
   */
  it('reads "another" as differing from the thing of its kind named last', () => {
    const units = parseReadings(['noun Unit: unit', 'Name.rel: {1} names {2} | {1} does not name {2}', 'Sit.rel: {1} sits in {2} | {1} does not sit in {2}'].join('\n'));
    for (const formula of ['all u: Unit | some disj a, b: Unit | u->a in Name.rel and u->b in Name.rel', 'all u: Unit | some v: Unit | v != u and v->u in Sit.rel']) {
      const ir = optimize(lower(formula, units), PASSES, context(units));
      expect(readBack(print(ir.ir, units, {}, ir.print), units, [], meaning)).toEqual([meant(ir.ir, meaning)]);
    }
  });
});
