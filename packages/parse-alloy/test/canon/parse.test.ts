/**
 * The parser: Alloy read as the Alloy analyzer reads it.
 */
import { describe, expect, it } from 'vitest';
import { parseFormula } from '../../src/parse.ts';

describe('formulas', () => {
  /**
   * @canon spec-a-quantifier-takes-everything-after-its-bar
   * @canon spec-a-temporal-operator-takes-the-formula-next-to-it
   */
  it('lets a quantifier take everything after its bar, and a temporal operator take the formula next to it', () => {
    expect(parseFormula('always all o: Owner | o in Disposed implies eventually o in Ran')).toMatchObject({
      t: 'unary',
      op: 'always',
      f: {
        t: 'quant',
        q: 'all',
        body: { t: 'implies', l: { t: 'cmp', op: 'in' }, r: { t: 'unary', op: 'eventually', f: { t: 'cmp', op: 'in' } } }
      }
    });
  });

  /**
   * @canon spec-a-semicolon-takes-everything-after-it
   */
  it('binds ";" looser than every connective, and groups it to the right', () => {
    expect(parseFormula('a in A or b in B ; c in C implies d in D ; e in E')).toMatchObject({
      t: 'binary',
      op: ';',
      l: { t: 'or' },
      r: { t: 'binary', op: ';', l: { t: 'implies' }, r: { t: 'cmp' } }
    });
    expect(parseFormula('c in Ran or all d: Cleanup | d in Ran ; c in Registered')).toMatchObject({
      t: 'or',
      items: [{ t: 'cmp' }, { t: 'binary', op: ';', l: { t: 'quant', body: { t: 'cmp' } }, r: { t: 'cmp' } }]
    });
  });

  /**
   * @canon spec-disj-before-the-variables-of-a-quantifier-is-read
   */
  it('reads "disj" as a mark on the declaration it stands before', () => {
    expect(parseFormula('all disj c, d: Cleanup, o: Owner | c in Ran')).toMatchObject({
      t: 'quant',
      decls: [{ names: ['c', 'd'], disj: true }, { names: ['o'] }]
    });
  });

  /**
   * @canon spec-and-binds-tighter-than-implies
   * @canon spec-a-chain-of-and-is-one-list
   */
  it('binds "and" tighter than "implies", and keeps a chain of "and" in one list', () => {
    expect(parseFormula('a in A and b in B and c in C implies d in D')).toMatchObject({
      t: 'implies',
      l: { t: 'and', items: [{ t: 'cmp' }, { t: 'cmp' }, { t: 'cmp' }] }
    });
  });

  /**
   * @canon spec-not-in-a-join-a-prime-and-a-call-are-read
   */
  it('reads "not in", a join, a prime and a call', () => {
    expect(parseFormula("o not in World.disposed'")).toMatchObject({
      t: 'cmp',
      op: 'not in',
      r: { t: 'join', r: { t: 'prime' } }
    });
    expect(parseFormula('runByCall[c, o]')).toMatchObject({ t: 'call', name: 'runByCall', args: [{ name: 'c' }, { name: 'o' }] });
  });

  /**
   * @canon spec-some-of-a-set-is-a-multiplicity
   * @canon spec-some-with-a-declaration-is-a-quantifier
   */
  it('reads "some Throwing\'" as a multiplicity and "some c: Cleanup | …" as a quantifier', () => {
    expect(parseFormula("some Throwing'")).toMatchObject({ t: 'mult', q: 'some' });
    expect(parseFormula('some c, d: Cleanup | c in Ran')).toMatchObject({ t: 'quant', decls: [{ names: ['c', 'd'] }] });
  });

  /**
   * @canon spec-a-formula-the-parser-cannot-read-is-refused-and-the-refusal-names-what-it-cannot-read
   */
  it('names what it cannot read', () => {
    expect(() => parseFormula('let x = y | x in Ran')).toThrow(/"let" is not supported/);
    expect(() => parseFormula('c in Ran )')).toThrow(/cannot read the formula after/);
    expect(() => parseFormula('c in Ran @')).toThrow(/cannot read "@"/);
    expect(() => parseFormula('all c: Cleanup {')).toThrow();
  });
});
