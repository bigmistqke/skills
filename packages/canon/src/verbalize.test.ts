/**
 * The verbalizer: the Alloy formulas of a unit, said in words by a table of
 * readings. This file tests the checker's own tooling, not a project's canon, so
 * it carries no `@canon` tag.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseFormula } from './alloy-parse.ts';
import { readBlocks } from './blocks.ts';
import { readingsOf, states, write } from './statements.ts';
import { isDefinition, parseDefinitions, parseReadings, type Readings, verbalize, verbalizeDefinition, withDefinitions } from './verbalize.ts';

const FIXTURE = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'lifetimes');
const read = (name: string): string => readFileSync(join(FIXTURE, name), 'utf8');

const READINGS = readingsOf(read('CANON.md')) as Readings;
const say = (formula: string, readings = READINGS): string => verbalize(formula, readings);

describe('the units of the lifetimes fixture', () => {
  const src = read('CANON.md');
  const blocks = readBlocks(src).filter(b => b.lang === 'alloy' && (b.role === 'unit' || b.role === 'scenario'));

  it('has the statement of all six specs written from their predicates, as the document has them', () => {
    expect(states(src).map(s => s.kind)).toEqual(Array(6).fill('current'));
    expect(write(src)).toEqual({ src, written: [] });
  });

  it('says all seven formulas, the scenario included, without leaving anything out', () => {
    expect(blocks).toHaveLength(7);
    for (const block of blocks) {
      const words = say(block.body);
      expect(words.length).toBeGreaterThan(0);
      expect(words).not.toMatch(/\{\d\}|\u0001/);
    }
  });

  it('says both sentences of the reported-failure spec, as pulse states them', () => {
    // Pulse: "An error that an owner's cleanup throws during its dispose reaches the nearest error handler or boundary above that owner. The dispose does not throw."
    expect(src).toContain('>   then at every moment, the dispose of o has not thrown');
    expect(src).toContain('>   - h is the nearest error handler or boundary above o2');
    expect(src).toContain('>   then now or at a later moment, the error of c2 has reached h.');
  });

  it('says them the same way every time', () => {
    const all = (): string[] => blocks.map(b => say(b.body, READINGS));
    expect(all()).toEqual(all());
  });
});

describe('the parser', () => {
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

  it('binds "and" tighter than "implies", and keeps a chain of "and" in one list', () => {
    expect(parseFormula('a in A and b in B and c in C implies d in D')).toMatchObject({
      t: 'implies',
      l: { t: 'and', items: [{ t: 'cmp' }, { t: 'cmp' }, { t: 'cmp' }] }
    });
  });

  it('reads "not in", a join, a prime and a call', () => {
    expect(parseFormula("o not in World.disposed'")).toMatchObject({
      t: 'cmp',
      op: 'not in',
      r: { t: 'join', r: { t: 'prime' } }
    });
    expect(parseFormula('runByCall[c, o]')).toMatchObject({ t: 'call', name: 'runByCall', args: [{ name: 'c' }, { name: 'o' }] });
  });

  it('reads "some Throwing\'" as a multiplicity and "some c: Cleanup | …" as a quantifier', () => {
    expect(parseFormula("some Throwing'")).toMatchObject({ t: 'mult', q: 'some' });
    expect(parseFormula('some c, d: Cleanup | c in Ran')).toMatchObject({ t: 'quant', decls: [{ names: ['c', 'd'] }] });
  });

  it('names what it cannot read', () => {
    expect(() => parseFormula('let x = y | x in Ran')).toThrow(/"let" is not supported/);
    expect(() => parseFormula('c in Ran )')).toThrow(/cannot read the formula after/);
    expect(() => parseFormula('c in Ran @')).toThrow(/cannot read "@"/);
    expect(() => parseFormula('all c: Cleanup {')).toThrow();
  });
});

describe('the words', () => {
  it('says a quantifier with the noun of its type, repeated for each variable', () => {
    expect(say('all o: Owner, k: Owner, c: Cleanup | c in Ran')).toBe(
      'For every owner o and every owner k and every cleanup c:\n  c has run.'
    );
  });

  it('says "some" and "no" with an article, or as a combination of several', () => {
    expect(say('some c: Failing | c in Ran')).toBe('There is a failing cleanup c such that c has run.');
    expect(say('some o: Owner | o in Disposed')).toBe('There is an owner o such that pulse has disposed o.');
    expect(say('no c: Cleanup, o: Owner | c.on = o')).toBe('There is no combination of cleanup c and owner o such that c is on o.');
  });

  it('says a negation with the negative reading of the thing negated', () => {
    expect(say('not c in Ran')).toBe('c has not run.');
    expect(say('c not in Ran')).toBe('c has not run.');
    expect(say('not dispose[o]')).toBe('Pulse does not dispose o.');
    expect(say("no Throwing'")).toBe('Right after, no call is throwing.');
  });

  it('spells out a union on the left and a difference on the right', () => {
    expect(say('c + d in Registered - Ran')).toBe(
      'All of these hold:\n  - code has registered c\n  - c has not run\n  - code has registered d\n  - d has not run'
    );
    expect(say('not (c + d in Ran)')).toBe('At least one of these holds:\n  - c has not run\n  - d has not run');
  });

  it('writes a rule on one line when both sides are one clause', () => {
    expect(say('dispose[o] implies c in Ran')).toBe('When pulse disposes o, then c has run.');
  });

  it('starts a sentence with a capital only where the sentence starts with its own words', () => {
    expect(say('c in Ran')).toBe('c has run.');
    expect(say('eventually c in Ran')).toBe('Now or at a later moment, c has run.');
  });

  it('says the temporal operators', () => {
    expect(say('eventually c in Ran')).toBe('Now or at a later moment, c has run.');
    expect(say('after c in Ran')).toBe('At the next moment, c has run.');
    expect(say('(not runNow[c]) until runNow[d]')).toBe(
      'At every moment before the first moment where d runs, c does not run, and d runs now or at a later moment.'
    );
  });
});

describe('a predicate with no reading of its own', () => {
  const defined = (vocabulary: string, readings = 'noun Cleanup: cleanup\nRan: {1} has run | {1} has not run\nRegistered: code has registered {1} | code has not registered {1}') =>
    withDefinitions(parseReadings(readings), vocabulary);

  it('is said by its body, with the arguments where the parameters were', () => {
    const readings = defined('pred pending[x: Cleanup] { x in Registered and x not in Ran }');
    expect(say('pending[d]', readings)).toBe('All of these hold:\n  - code has registered d\n  - d has not run');
  });

  it('is said as untrue when it is negated', () => {
    const readings = defined('pred pending[x: Cleanup] { x in Registered and x not in Ran }');
    expect(say('not pending[d]', readings)).toBe('It is not the case that all of these hold:\n  - code has registered d\n  - d has not run');
  });

  it('gives a quantified variable a numbered name when its name is already in use', () => {
    const readings = defined('pred has_pending { some c: Cleanup | c in Registered and c not in Ran }');
    expect(say('some c: Cleanup | has_pending and c in Ran', readings)).toBe(
      [
        'There is a cleanup c such that all of these hold:',
        '  - there is a cleanup c2 such that all of these hold:',
        '      - code has registered c2',
        '      - c2 has not run',
        '  - c has run'
      ].join('\n')
    );
  });

  it('gives the variable of a call a numbered name, so the arguments of the call are never captured', () => {
    const readings = defined('pred registered_other[x: Cleanup] { some c: Cleanup | c in Registered and x in Registered }');
    expect(say('registered_other[c]', readings)).toContain('a cleanup c2 such that');
  });

  it('lets the alternatives of a list reuse a name, and keeps it taken for what follows', () => {
    const readings = defined('pred p { (some c: Cleanup | c in Ran) or (some c: Cleanup | c in Registered) }');
    expect(say('some c: Cleanup | p and c in Ran', readings)).toContain('- there is a cleanup c2 such that c2 has run\n      - there is a cleanup c2 such that code has registered c2');
    expect(say('(some c: Cleanup | c in Ran) or (some c: Cleanup | c in Registered)', readings)).toBe(
      ['At least one of these holds:', '  - there is a cleanup c such that c has run', '  - there is a cleanup c such that code has registered c'].join('\n')
    );
    expect(say('((some c: Cleanup | c in Ran) or (some c: Cleanup | c in Registered)) and (some c: Cleanup | c in Ran)', readings)).toContain('there is a cleanup c2 such that c2 has run');
  });

  it('lets the statements of a list each use the same names, and keeps joint conditions apart', () => {
    const readings = parseReadings('noun Cleanup: cleanup\nRan: {1} has run | {1} has not run\nRegistered: code has registered {1} | code has not registered {1}');
    expect(say('(all c: Cleanup | c in Ran) and (all c: Cleanup | c in Registered)', readings)).toBe(
      ['All of these hold:', '  - for every cleanup c:', '      c has run', '  - for every cleanup c:', '      code has registered c.'].join('\n')
    );
    expect(say('(some c: Cleanup | c in Ran) and (some c: Cleanup | c in Registered)', readings)).toContain('there is a cleanup c2 such that code has registered c2');
  });

  it('says "a unit" and "an owner", by the sound of the word', () => {
    const readings = parseReadings('noun Unit: unit\nnoun Owner: owner\nRan: {1} has run | {1} has not run');
    expect(say('some u: Unit | u in Ran', readings)).toBe('There is a unit u such that u has run.');
    expect(say('some o: Owner | o in Ran', readings)).toBe('There is an owner o such that o has run.');
  });

  it('takes the article a noun is written with, when the sound of the word is not enough', () => {
    const readings = parseReadings('noun Hour: an hour\nnoun Unit: a unit\nnoun Owner: owner\nRan: {1} has run | {1} has not run');
    expect(say('some h: Hour | h in Ran', readings)).toBe('There is an hour h such that h has run.');
    expect(say('all h: Hour | h in Ran', readings)).toBe('For every hour h:\n  h has run.');
    expect(say('some o: Owner | o in Ran', readings)).toBe('There is an owner o such that o has run.');
  });

  it('prefers the reading the table gives over the body', () => {
    const readings = defined('pred pending[x: Cleanup] { x in Registered }', 'noun Cleanup: cleanup\npending: {1} is waiting | {1} is not waiting');
    expect(say('pending[d]', readings)).toBe('d is waiting.');
  });

  it('is refused when its body cannot be said, and the error says to give it a reading', () => {
    const readings = defined("pred step[x: Cleanup] { Ran' = Ran + x }");
    expect(() => say('step[d]', readings)).toThrow(/no reading for "step", and its body cannot be said/);
    expect(() => say('step[d]', defined('pred step[x: Cleanup] { x in Ran  x in Registered }'))).toThrow(/no reading for "step"/);
  });

  it('is refused when it is defined in terms of itself, or called with the wrong number of arguments', () => {
    expect(() => say('loop[d]', defined('pred loop[x: Cleanup] { loop[x] }'))).toThrow('defined in terms of itself');
    expect(() => say('pending[d, d]', defined('pred pending[x: Cleanup] { x in Registered }'))).toThrow('takes 1 arguments, not 2');
  });

  it('reads a vocabulary for its predicates, their parameters and their bodies', () => {
    const definitions = parseDefinitions('sig A {}\npred p[a, b: A, c: A] { a in B  and { x } }\npred q { y in Z }');
    expect([...definitions.keys()]).toEqual(['p', 'q']);
    expect(definitions.get('p')?.params).toEqual(['a', 'b', 'c']);
    expect(definitions.get('q')?.params).toEqual([]);
    expect(definitions.get('p')?.body.trim()).toBe('a in B  and { x }');
  });
});

describe('a definition', () => {
  const readings = parseReadings(
    ['noun Unit: unit', 'noun Spec: spec', 'Spec: {1} is a spec | {1} is not a spec', 'Sits.rel: {1} sits in {2} | {1} does not sit in {2}', 'orphan: {1} is an orphan | {1} is not an orphan', 'pair: {1} and {2} are a pair | {1} and {2} are not a pair'].join('\n')
  );

  it('is recognized by its keyword', () => {
    expect(isDefinition('pred orphan[u: Unit] { u in Spec }')).toBe(true);
    expect(isDefinition('all u: Unit | u in Spec')).toBe(false);
  });

  it('says what it names exactly when its body holds, for every value of its parameters', () => {
    expect(verbalizeDefinition('pred orphan[u: Unit] { u in Spec and no v: Unit | u->v in Sits.rel }', readings)).toBe(
      ['For every unit u:', '  u is an orphan exactly when all of these hold:', '    - u is a spec', '    - there is no unit v such that u sits in v'].join('\n')
    );
  });

  it('says a body of one clause on one line', () => {
    expect(verbalizeDefinition('pred orphan[u: Unit] { u in Spec }', readings)).toBe('For every unit u:\n  u is an orphan exactly when u is a spec.');
  });

  it('says each parameter of several, with the noun of its type', () => {
    expect(verbalizeDefinition('pred pair[a, b: Unit] { a->b in Sits.rel }', readings)).toBe(
      'For every unit a and every unit b:\n  a and b are a pair exactly when a sits in b.'
    );
  });

  it('is said in Markdown the way a formula is', () => {
    expect(verbalizeDefinition('pred orphan[u: Unit] { u in Spec or u in Spec }', readings, 'markdown')).toBe(
      ['For every unit u:', '', 'u is an orphan exactly when at least one of these holds:', '- u is a spec', '- u is a spec'].join('\n')
    );
  });

  it('needs the words for what it names, and says which are missing', () => {
    expect(() => verbalizeDefinition('pred mystery[u: Unit] { u in Spec }', readings)).toThrow('no reading for "mystery"');
  });

  it('refuses text that is not a definition, a parameter with no type, and a body that is a rule', () => {
    expect(() => verbalizeDefinition('u in Spec', readings)).toThrow('a definition is written');
    expect(() => verbalizeDefinition('pred orphan[u] { u in Spec }', readings)).toThrow('has no type');
    expect(() => verbalizeDefinition('pred orphan[u: Unit] { u in Spec implies u in Spec }', readings)).toThrow('no words after "exactly when"');
  });
});

describe('two variables', () => {
  it('are said to be different or the same', () => {
    expect(say('a != b')).toBe('a and b are different.');
    expect(say('not a != b')).toBe('a and b are the same.');
    expect(say('a = b')).toBe('a and b are the same.');
  });
});

describe('a word that names a term', () => {
  const readings = parseReadings(
    ['noun Unit: [unit]', 'noun Owner: an [owner]', 'Ran: {1} has [run] | {1} has not [run]', 'Done: {1} is [done] | {1} is not [done]', 'Told: [checker](#term-checker) tells {1} | [checker](#term-checker) tells no one', 'Alarm: [alarm] rings for {1} | no [alarm] rings for {1}'].join('\n'),
    'term-x'
  );
  const markdown = (source: string, self?: string): string => verbalize(source, readings, 'markdown', self);

  it('links to the unit that holds the reading, in the Markdown layout', () => {
    expect(markdown('a in Ran')).toBe('a has [run](#term-x).');
  });

  it('is plain in the text layout, which has no links', () => {
    expect(verbalize('a in Ran', readings)).toBe('a has run.');
  });

  it('links only the first mention of a term, in the order a reader meets it', () => {
    expect(markdown('a in Ran and b in Ran and c in Done')).toBe(
      ['All of these hold:', '- a has [run](#term-x)', '- b has run', '- c is done'].join('\n')
    );
  });

  it('is never a link to the unit the sentence is in', () => {
    expect(markdown('a in Ran', 'term-x')).toBe('a has run.');
    expect(markdown('a in Ran and b in Told', 'term-x')).toContain('[checker](#term-checker) tells b');
  });

  it('links to the unit it points at when it says one', () => {
    expect(markdown('a in Told')).toBe('[Checker](#term-checker) tells a.');
  });

  it('links the nouns of a quantifier, and picks the article by the word and not the brackets', () => {
    expect(markdown('some o: Owner | o in Ran')).toBe('There is an [owner](#term-x) o such that o has run.');
    expect(markdown('all u: Unit | u in Done')).toBe('For every [unit](#term-x) u:\n\nu is done.');
  });

  it('starts a sentence with a capital on the word and not on the bracket', () => {
    expect(markdown('a in Alarm')).toBe('[Alarm](#term-x) rings for a.');
    expect(verbalize('a in Alarm', readings)).toBe('Alarm rings for a.');
  });

  it('is only a word where the reading is held by no unit', () => {
    const loose = parseReadings('Ran: {1} has [run] | {1} has not [run]');
    expect(verbalize('a in Ran', loose, 'markdown')).toBe('a has run.');
  });

  it('is refused when a bracket has no partner', () => {
    expect(() => parseReadings('Ran: {1} has [run | {1} has not run')).toThrow('a bracket in the line of readings has no partner');
    expect(() => parseReadings('noun Unit: unit]')).toThrow('has no partner');
  });
});

describe('what it refuses', () => {
  it('says which name has no reading', () => {
    expect(() => say('frobnicate[o]')).toThrow('no reading for "frobnicate"');
  });

  it('says which reading has no negative form', () => {
    const readings = parseReadings('Ran: {1} has run');
    expect(() => say('c not in Ran', readings)).toThrow('no negative reading for "Ran"');
  });

  it('says which noun is missing', () => {
    expect(() => say('all x: Mystery | x in Ran')).toThrow('no noun for "Mystery"');
  });

  it('says when a reading uses a variable the formula does not give', () => {
    const readings = parseReadings('on: {1} is on {3}');
    expect(() => say('c.on = o', readings)).toThrow('uses {3}');
  });

  it('refuses a construct it has no words for, rather than leaving it out', () => {
    expect(() => say('before c in Ran')).toThrow('"before" is not supported');
    expect(() => say('one c: Cleanup | c in Ran')).toThrow('"one" as a quantifier is not supported');
    expect(() => say('not eventually c in Ran')).toThrow('"not" is supported only before a comparison or a call');
    expect(() => say('c in Ran releases d in Ran')).toThrow('"releases" is not supported');
  });

  it('refuses a line of readings it cannot read', () => {
    expect(() => parseReadings('this is not a reading')).toThrow('cannot read the line of readings');
  });
});
