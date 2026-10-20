/**
 * A sweep of the verbalizer: each kind of expression through each position an expression takes, each kind of formula
 * through each position a formula takes, and strings and numbers where they stand. Every formula it makes must end with
 * words or a refusal; the words are judged for loss apart from this test.
 */
import { describe, expect, it } from 'vitest';
import { isDefinition, isRefusal, parseReadings, verbalize, verbalizeDefinition, withDefinitions } from '../../src/verbalize.ts';

const READINGS = `
noun Owner: owner
noun Cleanup: cleanup
noun String: text
noun univ: thing
Registered: code has registered {1} | code has not registered {1}
Ran: {1} has run | {1} has not run
Disposed: pulse has disposed {1} | pulse has not disposed {1}
Stopped: the dispose of {1} has been stopped | the dispose of {1} has not been stopped
on: {1} is on {2} | {1} is not on {2}
at: {1} waits at {2} | {1} does not wait at {2}
home: {2} is the home of {1} | {2} is not the home of {1}
parent: {2} is the parent of {1} | {2} is not the parent of {1}
name: {1} is named {2} | {1} is not named {2}
tags: {1} is tagged {2} | {1} is not tagged {2}
n: {1} counts {2} | {1} does not count {2}
size: {1} has size {2} | {1} does not have size {2}
gone: {1} is gone | {1} is not gone
owners: {2} owns {1} | {2} does not own {1}
m/Gone: {1} is gone in m | {1} is not gone in m
`;
const VOCABULARY = `
sig Owner { parent: lone Owner }
sig Cleanup { var on: set Owner, at: lone Owner, home: one Owner, name: one String, tags: set String, n: set Int, size: one Int }
var sig Registered, Ran in Cleanup {}
var sig Disposed, Stopped in Owner {}
pred gone[o: Owner] { o in Disposed }
pred gone2[o: Owner] { o in Disposed and o not in Stopped }
fun owners[c: Cleanup]: Owner { c.on }
fun owners2[c: Cleanup]: Owner { c.on + c.at }
let twice[x] = x in Disposed
`;

/** Sets of owners, each written with o, p (Owner) and c (Cleanup) free in it. */
const OWNER_SETS: [string, string][] = [
  ['a variable', 'p'],
  ['a signature', 'Owner'],
  ['a set', 'Disposed'],
  ['a primed set', "Disposed'"],
  ['a navigation of a `one` field', 'c.home'],
  ['a navigation of a `lone` field', 'c.at'],
  ['a navigation of a `set` field', 'c.on'],
  ['a primed navigation', "c.on'"],
  ['a navigation of a primed field', "c.(on')"],
  ['a chain of navigations', 'c.on.parent'],
  ['a navigation over an expression', 'c.(on + at)'],
  ['a navigation from a signature', 'Cleanup.on'],
  ['a box join', 'on[c]'],
  ['a navigation of a transpose', 'p.~parent'],
  ['a navigation of a closure', 'p.^parent'],
  ['a navigation of a reflexive closure', 'p.*parent'],
  ['a union', 'Disposed + Stopped'],
  ['an intersection', 'Disposed & Stopped'],
  ['a difference', 'Owner - Disposed'],
  ['a navigation of a domain restriction', 'c.(Ran <: on)'],
  ['a navigation of a range restriction', 'c.(on :> Disposed)'],
  ['a navigation of an override', 'c.(on ++ (Cleanup -> p))'],
  ['a set comprehension', '{ x: Owner | x in Disposed }'],
  ['`none`', 'none'],
  ['`univ`', 'univ'],
  ['a call of a `fun` with a reading', 'owners[c]'],
  ['a call of a `fun` with no reading', 'owners2[c]'],
  ['a primed expression', "(Disposed + Stopped)'"],
  ['`this/Name`', 'this/Disposed'],
  ['`@Name`', '@Disposed'],
  ['a name of another module', 'm/Gone'],
  ['`if … then … else` of sets', '(p in Disposed implies Disposed else Stopped)'],
];

/** The positions a set of owners takes, with E for the set; o, p: Owner and c: Cleanup are bound. */
const SET_POSITIONS: [string, string][] = [
  ['`o in E`', 'o in E'],
  ['`o not in E`', 'o not in E'],
  ['`not o in E`', 'not o in E'],
  ['`E in Disposed`', 'E in Disposed'],
  ['`E in o`', 'E in o'],
  ['`o = E`', 'o = E'],
  ['`E = o`', 'E = o'],
  ['`o != E`', 'o != E'],
  ['`E = Stopped`', 'E = Stopped'],
  ['`some E`', 'some E'],
  ['`no E`', 'no E'],
  ['`one E`', 'one E'],
  ['`lone E`', 'lone E'],
  ['the type of `all`', 'all x: E | x in Stopped'],
  ['the type of `some`', 'some x: E | x in Stopped'],
  ['an argument of a predicate with a reading', 'gone[E]'],
  ['an argument of a predicate said by its body', 'gone2[E]'],
  ['an argument of `disj`', 'disj[E, Stopped]'],
  ['a count', '#(E) > 1'],
  ['under `always`', 'always o in E'],
  ['primed as a whole', "o in (E)'"],
  ['in a pair on the left of `in`', 'c->o in Cleanup -> E'],
];

/** Formulas, with c: Cleanup and o: Owner free in them. */
const FORMULAS: [string, string][] = [
  ['a membership', 'c in Ran'],
  ['a navigation compared', 'c.at = o'],
  ['a call with a reading', 'gone[o]'],
  ['a call said by its body', 'gone2[o]'],
  ['a call of a macro', 'twice[o]'],
  ['`some` of a navigation', 'some c.on'],
  ['`no` of a navigation', 'no c.on'],
  ['an integer comparison', '#c.on > 1'],
  ['`and`', '(c in Ran and o in Disposed)'],
  ['`or`', '(c in Ran or o in Disposed)'],
  ['`implies`', '(c in Ran implies o in Disposed)'],
  ['`iff`', '(c in Ran iff o in Disposed)'],
  ['`implies … else …`', '(c in Ran implies o in Disposed else o in Stopped)'],
  ['`not` of a compound', 'not (c in Ran and o in Disposed)'],
  ['`all`', '(all x: Owner | x in c.on implies x in Disposed)'],
  ['`some`', '(some x: Owner | x in c.on and x in Disposed)'],
  ['`no`', '(no x: Owner | x in c.on and x in Disposed)'],
  ['`one`', '(one x: Owner | x in c.on)'],
  ['`lone`', '(lone x: Owner | x in c.on)'],
  ['`let`', '(let s = c.on | s in Disposed)'],
  ['a block', '{ c in Ran o in Disposed }'],
  ['`always`', '(always c in Ran)'],
  ['`eventually`', '(eventually c in Ran)'],
  ['`after`', '(after c in Ran)'],
  ['`before`', '(before c in Ran)'],
  ['`once`', '(once c in Ran)'],
  ['`historically`', '(historically c in Ran)'],
  ['`until`', '(c in Ran until o in Disposed)'],
  ['`since`', '(c in Ran since o in Disposed)'],
  ['`releases`', '(c in Ran releases o in Disposed)'],
  ['`triggered`', '(c in Ran triggered o in Disposed)'],
  ['`;`', '(c in Ran ; o in Disposed)'],
];

/** The positions a formula takes, with F for the formula; G and H are other formulas. */
const FORMULA_POSITIONS: [string, string][] = [
  ['alone', 'F'],
  ['under `not`', 'not F'],
  ['the first side of `and`', 'F and c in Registered'],
  ['the last side of `and`', 'c in Registered and F'],
  ['a side of `or`', 'c in Registered or F'],
  ['the condition of `implies`', 'F implies c in Registered'],
  ['the consequence of `implies`', 'c in Registered implies F'],
  ['a side of `iff`', 'c in Registered iff F'],
  ['the `else` of `implies … else …`', 'c in Registered implies o in Stopped else F'],
  ['under `always`', 'always F'],
  ['under `after`', 'after F'],
  ['the left of `until`', 'F until c in Registered'],
  ['the right of `until`', 'c in Registered until F'],
  ['the left of `;`', 'F ; c in Registered'],
  ['the body of `all`', 'all d: Cleanup | d in Ran implies F'],
  ['the body of `some`', 'some d: Cleanup | d in Ran and F'],
  ['the body of `let`', 'let s = c.on | o in s and F'],
  ['a line of a block', '{ c in Registered\n F }'],
  ['the body of a predicate', 'pred q[c: Cleanup, o: Owner] { F }'],
];

/** Strings and the positions they take; c: Cleanup and s: String are bound. */
const STRINGS: [string, string][] = [
  ['`one` field = string', 'c.name = "a"'],
  ['string = `one` field', '"a" = c.name'],
  ['`one` field != string', 'c.name != "a"'],
  ['string in `set` field', '"a" in c.tags'],
  ['string not in `set` field', '"a" not in c.tags'],
  ['variable in string', 's in "a"'],
  ['variable not in string', 's not in "a"'],
  ['`not` variable in string', 'not s in "a"'],
  ['`one` field in string', 'c.name in "a"'],
  ['`set` field in string', 'c.tags in "a"'],
  ['`set` field not in string', 'c.tags not in "a"'],
  ['`set` field = string', 'c.tags = "a"'],
  ['variable in a union of strings', 's in "a" + "b"'],
  ['string in string', '"a" in "b"'],
  ['variable = string', 's = "a"'],
  ['string as a call argument', 'gone["a"]'],
  ['`some` of a string', 'some "a"'],
  ['string in `String`', '"a" in String'],
  ['`disj` of a field and a string', 'disj[c.tags, "a"]'],
  ['a quantifier over `String`', 'some t: String | c.name = t'],
];

/** Numbers and the positions they take; c: Cleanup, x, y: Int are bound. */
const NUMBERS: [string, string][] = [
  ['an `Int` variable', 'x'],
  ['a number', '3'],
  ['a negative number', '-3'],
  ['a hexadecimal number', '0x1F'],
  ['a binary number', '0b101'],
  ['`min`', 'min'],
  ['`max`', 'max'],
  ['`fun/min`', 'fun/min'],
  ['`fun/max`', 'fun/max'],
  ['`#` of a navigation', '#c.on'],
  ['`#` of a set', '#Ran'],
  ['`#` of a relation', '#on'],
  ['a `one` `Int` field', 'c.size'],
  ['`sum` of a `set` `Int` field', 'sum c.n'],
  ['`int` of a field', 'int c.n'],
  ['`int[…]`', 'int[c.n]'],
  ['`sum[…]`', 'sum[c.n]'],
  ['`….int`', 'c.n.int'],
  ['`….sum`', 'c.n.sum'],
  ['`sum x: T | …`', '(sum d: Cleanup | #d.on)'],
  ['`plus[…]`', 'plus[x, 1]'],
  ['`minus[…]`', 'minus[x, 1]'],
  ['`mul[…]`', 'mul[x, 2]'],
  ['`div[…]`', 'div[x, 2]'],
  ['`rem[…]`', 'rem[x, 2]'],
  ['`fun/add`', 'x fun/add 1'],
  ['`fun/sub`', 'x fun/sub 1'],
  ['`fun/mul`', 'x fun/mul 2'],
  ['`fun/div`', 'x fun/div 2'],
  ['`fun/rem`', 'x fun/rem 2'],
  ['`x.plus[…]`', 'x.plus[1]'],
  ['a shift `<<`', '(x << 1)'],
  ['a shift `>>`', '(x >> 1)'],
  ['a shift `>>>`', '(x >>> 1)'],
  ['`next` of a variable', 'x.next'],
  ['`fun/next` of a variable', 'x.fun/next'],
];
const NUMBER_POSITIONS: [string, string][] = [
  ['the left of `<`', 'N < y'],
  ['the right of `>`', 'y > N'],
  ['the left of `=<`', 'N =< y'],
  ['the left of `>=`', 'N >= y'],
  ['the left of `=`', 'N = y'],
  ['the left of `!=`', 'N != y'],
  ['the left of `!<`', 'N !< y'],
  ['the left of `not >`', 'N not > y'],
  ['under `not`', 'not N < y'],
  ['as `y in N`', 'y in N'],
  ['as `some N`', 'some N'],
];

/** Every formula of the sweep, with where it comes from. */
const SWEEP: { what: string; formula: string }[] = [
  ...OWNER_SETS.flatMap(([kind, e]) => SET_POSITIONS.map(([position, shape]) => ({ what: `${kind}, ${position}`, formula: `all c: Cleanup, o, p: Owner | ${shape.replaceAll('E', e)}` }))),
  ...FORMULAS.flatMap(([kind, f]) =>
    FORMULA_POSITIONS.map(([position, shape]) => {
      const body = shape.replace('F', f);
      return { what: `${kind}, ${position}`, formula: body.startsWith('pred') ? body : `all c: Cleanup, o, p: Owner | ${body}` };
    })
  ),
  ...STRINGS.map(([kind, f]) => ({ what: kind, formula: `all c: Cleanup, s: String | ${f}` })),
  ...NUMBERS.flatMap(([kind, n]) => NUMBER_POSITIONS.map(([position, shape]) => ({ what: `${kind}, ${position}`, formula: `all c: Cleanup, x, y: Int | ${shape.replace('N', n)}` })))
];

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
