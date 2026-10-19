/**
 * The parser: Alloy read as the Alloy analyzer reads it.
 */
import { describe, expect, it } from 'vitest';
import { AlloyParseError, parseFormula, parseModule } from '../../src/parse.ts';
import { print } from '../../src/print.ts';

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
    // The analyzer reads `a or all x: T | p ; q` as `(a or all x: T | p) ; q`, and likewise after `and` and `implies`.
    expect(parseFormula('c in Ran or all d: Cleanup | d in Ran ; c in Registered')).toMatchObject({
      t: 'binary',
      op: ';',
      l: { t: 'or', items: [{ t: 'cmp' }, { t: 'quant', body: { t: 'cmp' } }] },
      r: { t: 'cmp' }
    });
    expect(parseFormula('all d: Cleanup | d in Ran ; c in Registered')).toMatchObject({ t: 'binary', op: ';', l: { t: 'quant' }, r: { t: 'cmp' } });
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
    expect(() => parseFormula('c in Ran )')).toThrow(/cannot read the text from "\)" on/);
    expect(() => parseFormula('c in Ran @')).toThrow(/cannot read the text from "@" on/);
    expect(() => parseFormula('c in Ran §')).toThrow(/cannot read "§"/);
    expect(() => parseFormula('(c in Ran')).toThrow(/the text ends where "\)" was expected/);
    expect(() => parseFormula('all c: Cleanup {')).toThrow();
  });
});

/** A formula written back with every group in parentheses. */
const grouped = (source: string): string => print(parseFormula(source));

describe('the token filter', () => {
  /**
   * @canon spec-a-quantifier-keyword-starts-a-declaration-only-before-names-and-a-colon
   */
  it('reads a quantifier keyword as a quantifier only before names and a colon', () => {
    expect(parseFormula('no x: A | x in B')).toMatchObject({ t: 'quant', q: 'no' });
    expect(parseFormula('no x')).toMatchObject({ t: 'mult', q: 'no' });
    expect(parseFormula('sum x: A | x')).toMatchObject({ t: 'quant', q: 'sum' });
    expect(parseFormula('some x: one A | x in B')).toMatchObject({ t: 'quant', decls: [{ type: { t: 'mult', q: 'one' } }] });
  });

  /**
   * @canon spec-not-before-a-comparison-is-one-operator
   */
  it('joins not or ! with the comparison right after it, whatever stands between them', () => {
    expect(grouped('a not in b')).toBe('(a !in b)');
    expect(grouped('a ! = b')).toBe('(a != b)');
    expect(grouped('a not /* why */ < b')).toBe('(a !< b)');
    expect(grouped('not a in b')).toBe('(!(a in b))');
  });

  /**
   * @canon spec-a-multiplicity-beside-an-arrow-belongs-to-the-arrow
   */
  it('reads a multiplicity right before or after an arrow as part of the arrow', () => {
    expect(parseFormula('A some -> lone B')).toMatchObject({ t: 'arrow', lm: 'some', rm: 'lone' });
    expect(parseFormula('A ->one B')).toMatchObject({ t: 'arrow', rm: 'one' });
    expect(parseFormula('A set -> set B')).toEqual(expect.objectContaining({ t: 'arrow' }));
    expect(parseFormula('A set -> set B')).not.toHaveProperty('lm');
  });

  /**
   * @canon spec-a-minus-before-a-number-is-a-negative-number-unless-it-follows-an-operand
   */
  it('reads a minus right before a number as a negative number, unless it follows an operand', () => {
    expect(parseFormula('x = - 1')).toMatchObject({ r: { t: 'number', value: -1 } });
    expect(parseFormula('a - 1')).toMatchObject({ t: 'diff', r: { t: 'number', value: 1 } });
    expect(parseFormula('(a) - 1')).toMatchObject({ t: 'diff' });
  });
});

describe('the grammar', () => {
  /**
   * @canon spec-a-quantifier-on-the-right-of-an-operator-takes-everything-after-it
   */
  it('lets a quantifier or a let on the right of an operator take everything after it', () => {
    expect(grouped('a + all x: A | x in B')).toBe('(a + (all x: A | (x in B)))');
    expect(grouped('a in b and some x: A | x in B or c')).toBe('((a in b) && (some x: A | ((x in B) || c)))');
    expect(grouped('x.(let y = a | y)')).toBe('(x.(let y = a | y))');
  });

  /**
   * @canon spec-an-else-belongs-to-the-nearest-implies
   */
  it('gives an else to the nearest implies, and refuses one after an open implies or quantifier', () => {
    expect(grouped('a implies b implies c else d')).toBe('(a => (b => c else d))');
    expect(grouped('a => b else c => d else e')).toBe('(a => b else (c => d else e))');
    expect(grouped('a => (all x: A | x in B) else c')).toBe('(a => (all x: A | (x in B)) else c)');
    expect(() => parseFormula('a => all x: A | x in B else c')).toThrow(AlloyParseError);
  });

  /**
   * @canon spec-joins-and-boxes-are-read-left-to-right
   */
  it('reads a run of joins and boxes from left to right', () => {
    expect(grouped('a.b[c].d')).toBe('(((a.b)[c]).d)');
    expect(grouped('f[x].g')).toBe('((f[x]).g)');
  });

  /**
   * @canon spec-arrows-group-to-the-right
   */
  it('groups a run of arrows from the right', () => {
    expect(grouped('a -> b -> c')).toBe('(a -> (b -> c))');
  });

  /**
   * @canon spec-a-prefix-operator-binds-tighter-than-a-prime
   */
  it('binds ~, ^ and * tighter than a prime', () => {
    expect(grouped("~a'")).toBe("((~a))'");
    expect(grouped("a.^b'")).toBe("(a.((^b))')");
  });

  /**
   * @canon spec-a-name-stays-unresolved
   */
  it('leaves names as written, and reads a name with brackets as a call', () => {
    expect(parseFormula('this/A')).toMatchObject({ t: 'name', name: 'this/A' });
    expect(parseFormula('util/ordering/next')).toMatchObject({ t: 'name', name: 'util/ordering/next' });
    expect(parseFormula('on[c]')).toMatchObject({ t: 'call', name: 'on', args: [{ t: 'name', name: 'c' }] });
    expect(parseFormula('(a.b)[c]')).toMatchObject({ t: 'box' });
  });
});

describe('a module', () => {
  /**
   * @canon spec-a-module-is-read-as-its-header-its-opens-and-its-paragraphs
   */
  it('reads the header, the opens and every kind of paragraph', () => {
    const module = parseModule(`module m[exactly T]
open util/ordering[State] as so
abstract sig A { f: set B, var g: lone A, h = f } { some f }
one sig C, D extends A {}
var sig E in A + B {}
sig B {}
enum Color { Red, Green }
fact named { all a: A | a.f in B }
fact { no E }
assert safe { no C & D }
pred p[x: A, disj y, z: B] { x.f in y }
pred A.q { some this.f }
fun r[x: A]: set B { x.f }
let twice[x] = x.f.f
run p for 3 but 1..8 steps expect 1
check safe for 4
c: run { some A } for 2
-- a comment
/* another */`);
    expect(module).toMatchObject({ name: 'm', params: ['T'], opens: [{ name: 'util/ordering', args: ['State'], alias: 'so' }] });
    expect(module.paragraphs.map(p => p.t)).toEqual(['sig', 'sig', 'sig', 'sig', 'enum', 'fact', 'fact', 'assert', 'pred', 'pred', 'fun', 'macro', 'command', 'command', 'command']);
    expect(module.paragraphs[0]).toMatchObject({ names: ['A'], abstract: true, fields: [{ names: ['f'] }, { names: ['g'], var: true }, { names: ['h'], defined: true }], fact: { t: 'mult' } });
    expect(module.paragraphs[1]).toMatchObject({ names: ['C', 'D'], mult: 'one', parent: { kind: 'extends', names: ['A'] } });
    expect(module.paragraphs[2]).toMatchObject({ var: true, parent: { kind: 'in', names: ['A', 'B'] } });
    expect(module.paragraphs[8]).toMatchObject({ t: 'pred', name: 'p', params: [{ names: ['x'] }, { names: ['y', 'z'], disj: true }] });
    expect(module.paragraphs[9]).toMatchObject({ t: 'pred', receiver: 'A', name: 'q' });
    expect(module.paragraphs[12]).toMatchObject({ t: 'command', kind: 'run', target: 'p', scope: 'for 3 but 1..8 steps', expect: 1 });
    expect(module.paragraphs[14]).toMatchObject({ t: 'command', label: 'c', body: { t: 'mult' } });
    expect(module.comments).toHaveLength(2);
  });
});

describe('printing', () => {
  /**
   * @canon spec-print-writes-every-group-in-parentheses
   */
  it('writes every group in parentheses, and reads what it writes as the same tree', () => {
    for (const source of ['a or b and c iff d', 'always a until b', "~a'.b[c] in d -> e", 'all disj x, y: set A | x in y.^r ; c', 'let x = a | {y: A | y in x}', '#a + 1 = 2 implies b else c']) {
      const once = grouped(source);
      expect(grouped(once)).toBe(once);
    }
    expect(grouped('a or b and c iff d')).toBe('(a || ((b && c) <=> d))');
  });
});

describe('a refusal', () => {
  /**
   * @canon spec-a-refusal-names-its-line-and-column
   */
  it('holds the span, the line and the column, and says what it expected', () => {
    try {
      parseModule('sig A {}\nfact { all x: A x in A }');
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(AlloyParseError);
      expect(error).toMatchObject({ line: 2, column: 17, message: 'expected "|" or "{" after the declarations, found "x"' });
      expect((error as AlloyParseError).span).toEqual({ start: 25, end: 26 });
    }
  });
});
