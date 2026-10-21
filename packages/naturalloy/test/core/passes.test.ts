/**
 * The passes, asked of the analyzer: wherever a pass of the IR changes the IR of a formula of the sweep, the IR before
 * and after it hold in the same worlds, for every value of the variables the formula leaves free.
 */
import { describe, expect, it } from 'vitest';
import { context, lower } from '../../src/core/index.ts';
import { meaning, type Sentence } from '../../src/core/ir.ts';
import { optimize, type Trace } from '../../src/core/pass.ts';
import { PASSES } from '../../src/core/passes/index.ts';
import { parseReadings, withDefinitions } from '../../src/readings.ts';
import { isDefinition } from '../../src/core/index.ts';
import { JAR, verdicts } from '../analyzer.ts';
import { READINGS, SWEEP, VOCABULARY } from '../canon/sweep.ts';

const SCOPE = 'for 3 but 3 Int, 1..3 steps';
const STRINGS = '("a" + "b" + "c")';
const FREE: Record<string, string> = { c: 'Cleanup', d: 'Cleanup', o: 'Owner', p: 'Owner', s: 'String', t: 'String', x: 'Int', y: 'Int' };

interface Change {
  pass: string;
  formula: string;
  check: string;
}

/** Each change a pass of the IR makes to a formula of the sweep, as the claim that it means the same. */
export function changes(): Change[] {
  const readings = withDefinitions(parseReadings(READINGS), VOCABULARY);
  const out = new Map<string, Change>();
  for (const { formula } of SWEEP) {
    if (isDefinition(formula) || (formula.includes('/') && !/this\/|fun\//.test(formula))) continue;
    let ir: Sentence;
    try {
      ir = lower(formula, readings);
    } catch {
      continue;
    }
    const trace: Trace = [];
    optimize(ir, PASSES, context(readings), new Set(), trace);
    const free = Object.keys(FREE).filter(name => new RegExp(`\\b${name}\\b`).test(formula));
    let before = ir;
    for (const { pass, after } of trace) {
      if (after !== before) {
        const claim = `(${meaning(before)}) <=> (${meaning(after)})`;
        const check = free.length === 0 ? claim : `all ${free.map(name => `${name}: ${FREE[name]}`).join(', ')} | ${claim}`;
        if (!out.has(check)) out.set(check, { pass, formula, check });
      }
      before = after;
    }
  }
  return [...out.values()];
}

describe('the passes over the sweep', () => {
  /**
   * @canon spec-a-rewrite-means-what-the-formula-it-replaces-means
   */
  it.skipIf(JAR === undefined)('change no formula into one that means something else, as the analyzer finds', async () => {
    const all = changes();
    expect(all.length).toBeGreaterThan(0);
    const module = (scope: string) => (batch: Change[]) => [VOCABULARY, ...batch.map((c, i) => `check check_${i} { some ${STRINGS} implies (${c.check}) } ${scope}`)].join('\n');
    const results = await verdicts(all, module(SCOPE));
    const failed = results.filter(r => r.verdict.includes('NullPointerException')).map(r => r.item);
    const again = failed.length === 0 ? [] : await verdicts(failed, module(SCOPE.replace('1..3 steps', '1..4 steps')));
    const final = [...results.filter(r => !r.verdict.includes('NullPointerException')), ...again];
    expect(final).toHaveLength(all.length);
    expect(final.filter(r => r.verdict !== 'UNSAT').map(r => ({ pass: r.item.pass, formula: r.item.formula, verdict: r.verdict }))).toEqual([]);
  }, 3_600_000);
});
