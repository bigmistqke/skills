/**
 * The lowering, asked of the analyzer: for each formula of the sweep that has words, what its IR means holds exactly
 * when the formula does, for every value of the variables it leaves free, in a scope of three atoms of each signature,
 * integers of three bits and up to three steps.
 */
import { parseFormula } from '@bigmistqke/parse-alloy';
import { describe, expect, it } from 'vitest';
import { lower } from '../../src/core/index.ts';
import { meaning } from '../../src/core/ir.ts';
import { parseReadings, withDefinitions } from '../../src/readings.ts';
import { isDefinition } from '../../src/core/index.ts';
import { JAR, verdicts } from '../analyzer.ts';
import { READINGS, SWEEP, VOCABULARY } from '../canon/sweep.ts';

const SCOPE = 'for 3 but 3 Int, 1..3 steps';
/** Three strings, named in each check so that String holds them. */
const STRINGS = '("a" + "b" + "c")';
/** The type of each variable the formulas of the sweep leave free. */
const FREE: Record<string, string> = { c: 'Cleanup', d: 'Cleanup', o: 'Owner', p: 'Owner', s: 'String', t: 'String', x: 'Int', y: 'Int' };

interface Claim {
  formula: string;
  check: string;
}

/** Each formula of the sweep the lowering says, with the claim that its IR means what it does. */
function claims(): Claim[] {
  const readings = withDefinitions(parseReadings(READINGS), VOCABULARY);
  const out: Claim[] = [];
  for (const { formula } of SWEEP) {
    if (isDefinition(formula)) continue;
    let said: string;
    try {
      said = meaning(lower(formula, readings));
    } catch {
      continue;
    }
    const free = Object.keys(FREE).filter(name => new RegExp(`\\b${name}\\b`).test(formula));
    // A name of another module is not in this one, where the analyzer would look for it.
    if (formula.includes('/') && !/this\/|fun\//.test(formula)) continue;
    parseFormula(said);
    const claim = `(${formula}) <=> (${said})`;
    out.push({ formula, check: free.length === 0 ? claim : `all ${free.map(name => `${name}: ${FREE[name]}`).join(', ')} | ${claim}` });
  }
  return out;
}

describe('the meaning of the IR of each formula of the sweep', () => {
  it('parses as Alloy', () => {
    expect(claims().length).toBeGreaterThan(1500);
  }, 120_000);

  /**
   * @canon spec-a-rewrite-means-what-the-formula-it-replaces-means
   */
  it.skipIf(JAR === undefined)('holds exactly when the formula does, as the analyzer finds', async () => {
    const all = claims();
    const module = (scope: string) => (batch: Claim[]) => [VOCABULARY, ...batch.map((c, i) => `check check_${i} { some ${STRINGS} implies (${c.check}) } ${scope}`)].join('\n');
    const results = await verdicts(all, module(SCOPE));
    expect(results).toHaveLength(all.length);
    // The analyzer's temporal solver fails on a few checks at three steps with a NullPointerException of its own; at
    // four steps, which covers every world of three, it answers.
    const failed = results.filter(r => r.verdict.includes('NullPointerException')).map(r => r.item);
    const again = failed.length === 0 ? [] : await verdicts(failed, module(SCOPE.replace('1..3 steps', '1..4 steps')));
    const final = [...results.filter(r => !r.verdict.includes('NullPointerException')), ...again];
    expect(final.filter(r => r.verdict !== 'UNSAT').map(r => ({ formula: r.item.formula, verdict: r.verdict }))).toEqual([]);
  }, 3_600_000);
});
