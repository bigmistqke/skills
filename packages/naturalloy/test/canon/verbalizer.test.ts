/**
 * The verbalizer: Alloy formulas said in words by a table of readings.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { isDefinition, parseDefinitions, parseReadings, verbalize, verbalizeDefinition, withDefinitions } from '../../src/verbalize.ts';

const FIXTURE = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'fixtures', 'lifetimes');
const read = (name: string): string => readFileSync(join(FIXTURE, name), 'utf8');

/** The readings and the vocabulary of the lifetimes example. */
const READINGS = withDefinitions(parseReadings(read('readings.txt')), read('vocabulary.als'));
const say = (formula: string, readings = READINGS): string => verbalize(formula, readings);

/** Sets of things, each held by a signature, or not by one. */
const SETS = withDefinitions(
  parseReadings(
    [
      'noun Edge: an [edge]', 'noun Hour: an hour', 'noun Alarm: alarm',
      'Emitting: {1} is being delivered | {1} is not being delivered', 'Ringing: {1} is ringing | {1} is not ringing',
      'Alarm: {1} rings | {1} does not ring', 'Looped: {1} is sent back to {1} | {1} is not sent back to {1}',
      'Loose: {1} is loose | {1} is not loose', 'Unknown: {1} is unknown | {1} is not unknown', 'next: {2} follows {1} | {2} does not follow {1}'
    ].join('\n'),
    '#term-edge'
  ),
  'sig Edge { next: lone Edge } sig Hour {} sig Alarm {} var lone sig Emitting in Edge {} var sig Ringing extends Hour {} sig Looped in Edge {} sig Loose in Edge + Hour {}'
);

describe('the formulas of the lifetimes example', () => {
  const formulas = read('formulas.als').split(/\n\s*\n/).filter(block => !block.startsWith('--'));

  /**
   * @canon spec-a-formula-is-said-in-full
   */
  it('says all seven formulas, the scenario included, without leaving anything out', () => {
    expect(formulas).toHaveLength(7);
    for (const formula of formulas) {
      const words = say(formula);
      expect(words.length).toBeGreaterThan(0);
      expect(words).not.toMatch(/\{\d\}|\u0001/);
    }
  });

  /**
   * @canon spec-a-formula-is-said-the-same-way-every-time
   */
  it('says them the same way every time', () => {
    const all = (): string[] => formulas.map(formula => say(formula));
    expect(all()).toEqual(all());
  });
});

describe('the words', () => {
  /**
   * @canon spec-a-quantifier-is-said-with-the-noun-of-its-type-for-each-variable
   */
  it('says a quantifier with the noun of its type, repeated for each variable', () => {
    expect(say('all o: Owner, k: Owner, c: Cleanup | c in Ran')).toBe(
      'For every owner_1 and every owner_2 and every cleanup_1:\n  cleanup_1 has run.'
    );
  });

  /**
   * @canon spec-a-variable-is-named-after-its-noun-and-its-number
   */
  it('names a variable after its noun and the number it is, whatever the formula called it', () => {
    const readings = parseReadings('noun Unit: unit\nnoun Spec: spec\nnoun ExpectedFailure: expected failure\nRan: {1} has run | {1} has not run');
    expect(say('all x, y: Unit, z: Spec | x in Ran', readings)).toBe('For every unit_1 and every unit_2 and every spec_1:\n  unit_1 has run.');
    expect(say('all u: Unit | all u2: Unit | u in Ran', readings)).toBe('For every unit_1:\n  for every unit_2:\n    unit_1 has run.');
    expect(say('some e: ExpectedFailure | e in Ran', readings)).toBe('There is an expected_failure_1 such that expected_failure_1 has run.');
  });

  /**
   * @canon spec-a-variable-is-named-the-same-however-the-formula-names-it
   */
  it('names a variable the same however the formula named it', () => {
    const readings = parseReadings('noun Unit: unit\nRan: {1} has run | {1} has not run');
    expect(say('all u: Unit | u in Ran', readings)).toBe(say('all whatever: Unit | whatever in Ran', readings));
  });

  /**
   * @canon spec-some-is-said-with-an-article-chosen-by-the-sound-of-the-noun
   * @canon spec-no-over-several-variables-is-said-as-no-combination
   */
  it('says "some" and "no" with an article, or as a combination of several', () => {
    expect(say('some c: Failing | c in Ran')).toBe('There is a failing_cleanup_1 such that failing_cleanup_1 has run.');
    expect(say('some o: Owner | o in Disposed')).toBe('There is an owner_1 such that pulse has disposed owner_1.');
    expect(say('no c: Cleanup, o: Owner | c.on = o')).toBe('There is no combination of cleanup_1 and owner_1 such that cleanup_1 is on owner_1.');
  });

  /**
   * @canon spec-a-negation-is-said-with-the-negative-reading-of-what-it-negates
   */
  it('says a negation with the negative reading of the thing negated', () => {
    expect(say('not c in Ran')).toBe('c has not run.');
    expect(say('c not in Ran')).toBe('c has not run.');
    expect(say('not dispose[o]')).toBe('Pulse does not dispose o.');
    expect(say("no Throwing'")).toBe('Right after, no call is throwing.');
  });

  /**
   * @canon spec-a-union-on-the-left-is-spelled-out
   * @canon spec-a-difference-on-the-right-is-spelled-out
   */
  it('spells out a union on the left and a difference on the right', () => {
    expect(say('c + d in Registered - Ran')).toBe(
      'All of these hold:\n  - code has registered c\n  - c has not run\n  - code has registered d\n  - d has not run'
    );
    expect(say('not (c + d in Ran)')).toBe('At least one of these holds:\n  - c has not run\n  - d has not run');
  });

  /**
   * @canon spec-a-disj-quantifier-is-said-with-its-variables-different
   */
  it('says a "disj" quantifier with the condition that its variables are different', () => {
    expect(say('all disj c, d: Cleanup | c in Ran implies d in Ran')).toBe(
      'For every cleanup_1 and every cleanup_2:\n  when cleanup_1 and cleanup_2 are different and cleanup_1 has run, cleanup_2 has run.'
    );
    expect(say('all disj c, d: Cleanup | d in Ran')).toBe('For every cleanup_1 and every cleanup_2:\n  when cleanup_1 and cleanup_2 are different, cleanup_2 has run.');
    expect(say('some disj c, d: Cleanup | c in Ran and d in Ran')).toBe('There are cleanup_1 and cleanup_2 such that cleanup_1 and cleanup_2 are different, cleanup_1 has run and cleanup_2 has run.');
  });

  /**
   * @canon spec-a-difference-as-the-type-of-a-quantifier-is-said-as-a-condition
   */
  it('says a difference as the type of a quantifier as a condition on the variable', () => {
    expect(say('all c: Cleanup - d | c in Ran')).toBe('For every cleanup_1:\n  when cleanup_1 and d are different, cleanup_1 has run.');
    expect(say('all c: Cleanup - Ran | c in Registered')).toBe('For every cleanup_1:\n  when cleanup_1 has not run, code has registered cleanup_1.');
  });

  /**
   * @canon spec-a-set-with-no-noun-as-the-type-of-a-quantifier-is-said-as-a-condition
   */
  it('says a set with no noun as the type of a quantifier as a condition on a variable of the signature that holds it', () => {
    expect(say('all e: Emitting | e in Looped', SETS)).toBe('For every edge_1:\n  when edge_1 is being delivered, edge_1 is sent back to edge_1.');
    expect(say('all e: Emitting | e in Looped implies e in Loose', SETS)).toBe('For every edge_1:\n  when edge_1 is being delivered and is sent back to edge_1, edge_1 is loose.');
    expect(say('some e: Emitting | d in e.next', SETS)).toBe('d follows an edge that is being delivered.');
    expect(say('no e: Emitting | d in e.next', SETS)).toBe('d follows no edge that is being delivered.');
    expect(say('some e: Emitting | e in Looped', SETS)).toBe('There is an edge_1 such that edge_1 is being delivered and is sent back to edge_1.');
    expect(say('all h: Ringing | h in Alarm', SETS)).toBe('For every hour_1:\n  when hour_1 is ringing, hour_1 rings.');
    expect(() => say('all e: Loose | e in Looped', SETS)).toThrow('no noun for "Loose"');
  });

  /**
   * @canon spec-membership-in-a-navigation-is-said-with-the-reading-of-its-field
   */
  it('says membership in a navigation with the reading of its field', () => {
    expect(say('o in c.on')).toBe('c is on o.');
    expect(say('c in on.o')).toBe('c is on o.');
    expect(say('o not in c.on')).toBe('c is not on o.');
  });

  /**
   * @canon spec-no-or-some-of-a-navigation-is-said-as-a-noun-phrase-of-the-type-of-the-field
   */
  it('says no or some of a navigation as a noun phrase of the type of the field', () => {
    expect(say('no c.on')).toBe('c is on no owner.');
    expect(say('some c.on')).toBe('c is on an owner.');
    expect(say('some on.o')).toBe('A cleanup is on o.');
    expect(say('not no c.on')).toBe('c is on an owner.');
  });

  /**
   * @canon spec-a-transpose-in-a-navigation-is-said-as-the-navigation-the-other-way
   */
  it('says a navigation of a transpose as the navigation the other way', () => {
    expect(say('c in o.(~on)')).toBe('c is on o.');
    expect(say('o in (~on).c')).toBe('c is on o.');
    expect(say('c not in o.(~on)')).toBe('c is not on o.');
    expect(say('no o.(~on)')).toBe('No cleanup is on o.');
    expect(say("c in o.(~on)'")).toBe('At the next moment, c is on o.');
    expect(say("c in o.(~(on'))")).toBe('At the next moment, c is on o.');
  });

  /**
   * @canon spec-a-pair-in-a-transpose-is-said-the-other-way-round
   */
  it('says a pair in a transpose the other way round', () => {
    expect(say('o->c in ~on')).toBe('c is on o.');
    expect(say('d->c in ~(Clock.older)')).toBe('Code registered c before d.');
    expect(say('d->c not in ~(Clock.older)')).toBe('Code did not register c before d.');
  });

  /**
   * @canon spec-a-set-whose-reading-says-its-variable-once-is-said-with-a-noun-phrase-in-its-place
   */
  it('says some or no of a set whose reading says its variable once with a noun phrase of the signature that holds it', () => {
    expect(say('some Emitting', SETS)).toBe('An edge is being delivered.');
    expect(say('no Emitting', SETS)).toBe('No edge is being delivered.');
    expect(say('not some Emitting', SETS)).toBe('No edge is being delivered.');
    expect(say('not no Emitting', SETS)).toBe('An edge is being delivered.');
    expect(say("some Emitting'", SETS)).toBe('At the next moment, an edge is being delivered.');
    expect(say('some Ringing', SETS)).toBe('An hour is ringing.');
    expect(say('some Alarm', SETS)).toBe('An alarm rings.');
    expect(say('some Emitting and some Alarm', SETS)).toBe('An edge is being delivered and an alarm rings.');
    expect(verbalize('some Emitting', SETS, 'markdown')).toBe('An [edge](#term-edge) is being delivered.');
  });

  /**
   * @canon spec-a-set-whose-reading-says-its-variable-twice-is-said-in-full
   */
  it('says some or no of a set whose reading says its variable twice in full', () => {
    expect(say('some Looped', SETS)).toBe('There is an edge_1 such that edge_1 is sent back to edge_1.');
    expect(say('no Looped', SETS)).toBe('There is no edge_1 such that edge_1 is sent back to edge_1.');
  });

  /**
   * @canon spec-a-set-with-no-one-signature-that-holds-it-is-refused
   */
  it('refuses some or no of a set that no one signature holds', () => {
    expect(() => say('some Loose', SETS)).toThrow('no one signature holds "Loose"');
    expect(() => say('no Unknown', SETS)).toThrow('no one signature holds "Unknown"');
  });

  /**
   * @canon spec-a-primed-name-with-no-reading-of-its-own-is-said-at-the-next-moment
   */
  it('says a clause with one primed name as the clause at the next moment', () => {
    expect(say("c in Ran'")).toBe('At the next moment, c has run.');
    expect(say("c not in Ran'")).toBe('At the next moment, c has not run.');
    expect(say("o in c.on'")).toBe('At the next moment, c is on o.');
    expect(say("no c.on'")).toBe('At the next moment, c is on no owner.');
    expect(say("no Throwing'")).toBe('Right after, no call is throwing.');
  });

  /**
   * @canon spec-a-set-where-a-variable-belongs-is-refused
   */
  it('refuses a set or a field where a reading takes a variable', () => {
    expect(() => say("Ran in Ran'")).toThrow('"Ran" is a set or a field, where a variable must be');
    expect(() => say('on in Registered')).toThrow('"on" is a set or a field, where a variable must be');
  });

  /**
   * @canon spec-a-field-of-one-value-equal-to-a-variable-is-said-with-its-reading
   */
  it('says a field of at most one value that equals a variable with the reading of the field', () => {
    expect(say('c.on = o')).toBe('c is on o.');
    expect(say('o = c.on')).toBe('c is on o.');
    expect(say('c.on != o')).toBe('c is not on o.');
  });

  /**
   * @canon spec-a-field-of-many-values-equal-to-a-variable-is-said-member-by-member
   */
  it('says a field of many values that equals a variable member by member', () => {
    const many = withDefinitions(parseReadings('noun Owner: owner\non: {1} is on {2} | {1} is not on {2}'), 'sig Owner {} sig Cleanup { var on: set Owner }');
    expect(say('c.on = o', many)).toBe('For every owner_1:\n  c is on owner_1 exactly when owner_1 and o are the same.');
    expect(say('o = c.on', many)).toBe('For every owner_1:\n  c is on owner_1 exactly when owner_1 and o are the same.');
    expect(say("c.on' = o", many)).toBe('For every owner_1:\n  c is on owner_1 at the next moment exactly when owner_1 and o are the same.');
    const beside = say('(c.on = o and c in Ran) implies c in Registered', withDefinitions(parseReadings('noun Owner: owner\non: {1} is on {2} | {1} is not on {2}\nRan: {1} has run | {1} has not run\nRegistered: code has registered {1} | code has not registered {1}'), 'sig Owner {} sig Cleanup { var on: set Owner }'));
    expect(beside).toContain('for every owner_1:');
    expect(beside).not.toContain('owner_2');
    expect(() => say('c.on != o', many)).toThrow('"!=" between a field of many values and a variable is not supported');
  });

  /**
   * @canon spec-two-values-that-are-equal-are-said-member-by-member
   */
  it('says two values that are equal member by member, over the type of the field', () => {
    expect(say('c.on = d.on')).toBe('For every owner_1:\n  c is on owner_1 exactly when d is on owner_1.');
    expect(say("c.on' = c.on")).toBe('For every owner_1:\n  c is on owner_1 at the next moment exactly when c is on owner_1 now.');
    const beside = say('(c.on = d.on and c in Ran) implies c in Registered');
    expect(beside).toContain('for every owner_1:');
    expect(beside).not.toContain('owner_2');
    expect(() => say('c.on != d.on')).toThrow('two values are compared only with "="');
  });

  /**
   * @canon spec-a-rule-of-two-clauses-is-said-on-one-line
   */
  it('writes a rule on one line when both sides are one clause', () => {
    expect(say('dispose[o] implies c in Ran')).toBe('When pulse disposes o, c has run.');
  });

  /**
   * @canon spec-a-sentence-starts-with-a-capital-only-where-it-starts-with-its-own-words
   */
  it('starts a sentence with a capital only where the sentence starts with its own words', () => {
    expect(say('c in Ran')).toBe('c has run.');
    expect(say('eventually c in Ran')).toBe('Now or at a later moment, c has run.');
  });

  /**
   * @canon spec-eventually-is-said-as-now-or-at-a-later-moment
   * @canon spec-after-is-said-as-at-the-next-moment
   * @canon spec-until-is-said-as-at-every-moment-before-the-first-moment-where
   */
  it('says the temporal operators', () => {
    expect(say('eventually c in Ran')).toBe('Now or at a later moment, c has run.');
    expect(say('after c in Ran')).toBe('At the next moment, c has run.');
    expect(say('(not runNow[c]) until runNow[d]')).toBe(
      'At every moment before the first moment where d runs, c does not run, and d runs now or at a later moment.'
    );
  });

  /**
   * @canon spec-always-is-said-as-now-and-at-every-later-moment
   * @canon spec-before-is-said-as-there-is-a-moment-before-and-at-it
   * @canon spec-once-is-said-as-now-or-at-an-earlier-moment
   * @canon spec-historically-is-said-as-now-and-at-every-earlier-moment
   */
  it('says always and the past operators of one formula', () => {
    expect(say('always c in Ran')).toBe('Now and at every later moment, c has run.');
    expect(say('before c in Ran')).toBe('There is a moment before, and at it, c has run.');
    expect(say('once c in Ran')).toBe('Now or at an earlier moment, c has run.');
    expect(say('historically c in Ran')).toBe('Now and at every earlier moment, c has run.');
  });

  /**
   * @canon spec-since-is-said-as-at-every-moment-after-the-last-moment-where
   * @canon spec-releases-is-said-as-up-to-and-including-the-first-moment-where-if-one-comes
   * @canon spec-triggered-is-said-as-back-to-and-including-the-last-moment-where-if-there-was-one
   * @canon spec-a-sequence-is-said-as-and-at-the-next-moment
   */
  it('says since, releases, triggered and the semicolon', () => {
    expect(say('(not runNow[c]) since runNow[d]')).toBe(
      'At every moment after the last moment where d runs, c does not run, and d runs now or at an earlier moment.'
    );
    expect(say('runNow[d] releases (not runNow[c])')).toBe('Up to and including the first moment where d runs, if one comes, c does not run.');
    expect(say('runNow[d] triggered (not runNow[c])')).toBe('Back to and including the last moment where d runs, if there was one, c does not run.');
    expect(say('runNow[c] ; runNow[d]')).toBe('c runs, and at the next moment, d runs.');
  });
});

describe('a predicate with no reading of its own', () => {
  const defined = (vocabulary: string, readings = 'noun Cleanup: cleanup\nRan: {1} has run | {1} has not run\nRegistered: code has registered {1} | code has not registered {1}') =>
    withDefinitions(parseReadings(readings), vocabulary);

  /**
   * @canon spec-a-predicate-with-no-reading-is-said-by-its-body
   */
  it('is said by its body, with the arguments where the parameters were', () => {
    const readings = defined('pred pending[x: Cleanup] { x in Registered and x not in Ran }');
    expect(say('pending[d]', readings)).toBe('Code has registered d and d has not run.');
  });

  /**
   * @canon spec-a-negated-predicate-with-no-reading-is-said-as-untrue
   */
  it('is said as untrue when it is negated', () => {
    const readings = defined('pred pending[x: Cleanup] { x in Registered and x not in Ran }');
    expect(say('not pending[d]', readings)).toBe('It is not the case that code has registered d and d has not run.');
  });

  /**
   * @canon spec-a-call-of-a-predicate-gives-its-variables-numbers-that-are-free
   */
  it('gives a quantified variable a numbered name when its name is already in use', () => {
    const readings = defined('pred has_pending { some c: Cleanup | c in Registered and c not in Ran }');
    expect(say('some c: Cleanup | has_pending and c in Ran', readings)).toBe(
      [
        'There is a cleanup_1 such that all of these hold:',
        '  - there is a cleanup_2 such that code has registered cleanup_2 and cleanup_2 has not run',
        '  - cleanup_1 has run'
      ].join('\n')
    );
  });

  /**
   * @canon spec-a-variable-of-a-body-never-takes-the-name-of-an-argument
   */
  it('never gives a variable the name of an argument of the call, even when the argument has a name of the same kind', () => {
    const readings = defined('pred registered_other[x: Cleanup] { some c: Cleanup | c in Registered and x in Registered }');
    expect(say('registered_other[cleanup_1]', readings)).toContain('a cleanup_2 such that');
  });

  /**
   * @canon spec-the-alternatives-of-a-list-reuse-a-name-and-keep-it-taken-for-what-follows
   */
  it('lets the alternatives of a list reuse a name, and keeps it taken for what follows', () => {
    const readings = defined('pred p { (some c: Cleanup | c in Ran) or (some c: Cleanup | c in Registered) }');
    expect(say('some c: Cleanup | p and c in Ran', readings)).toContain('- there is a cleanup_2 such that cleanup_2 has run\n      - there is a cleanup_2 such that code has registered cleanup_2');
    expect(say('(some c: Cleanup | c in Ran) or (some c: Cleanup | c in Registered)', readings)).toBe(
      ['At least one of these holds:', '  - there is a cleanup_1 such that cleanup_1 has run', '  - there is a cleanup_1 such that code has registered cleanup_1'].join('\n')
    );
    expect(say('((some c: Cleanup | c in Ran) or (some c: Cleanup | c in Registered)) and (some c: Cleanup | c in Ran)', readings)).toContain('there is a cleanup_2 such that cleanup_2 has run');
  });

  /**
   * @canon spec-the-statements-of-a-list-each-use-the-same-names
   * @canon spec-conditions-that-hold-together-keep-their-names-apart
   */
  it('lets the statements of a list each use the same names, and keeps joint conditions apart', () => {
    const readings = parseReadings('noun Cleanup: cleanup\nRan: {1} has run | {1} has not run\nRegistered: code has registered {1} | code has not registered {1}');
    expect(say('(all c: Cleanup | c in Ran) and (all c: Cleanup | c in Registered)', readings)).toBe(
      ['All of these hold:', '  - for every cleanup_1:', '      cleanup_1 has run', '  - for every cleanup_1:', '      code has registered cleanup_1.'].join('\n')
    );
    expect(say('(some c: Cleanup | c in Ran) and (some c: Cleanup | c in Registered)', readings)).toContain('there is a cleanup_2 such that code has registered cleanup_2');
  });

  /**
   * @canon spec-some-is-said-with-an-article-chosen-by-the-sound-of-the-noun
   */
  it('says "a unit" and "an owner", by the sound of the word', () => {
    const readings = parseReadings('noun Unit: unit\nnoun Owner: owner\nRan: {1} has run | {1} has not run');
    expect(say('some u: Unit | u in Ran', readings)).toBe('There is a unit_1 such that unit_1 has run.');
    expect(say('some o: Owner | o in Ran', readings)).toBe('There is an owner_1 such that owner_1 has run.');
  });

  /**
   * @canon spec-an-article-the-noun-is-written-with-wins-over-its-sound
   */
  it('takes the article a noun is written with, when the sound of the word is not enough', () => {
    const readings = parseReadings('noun Hour: an hour\nnoun Unit: a unit\nnoun Owner: owner\nRan: {1} has run | {1} has not run');
    expect(say('some h: Hour | h in Ran', readings)).toBe('There is an hour_1 such that hour_1 has run.');
    expect(say('all h: Hour | h in Ran', readings)).toBe('For every hour_1:\n  hour_1 has run.');
    expect(say('some o: Owner | o in Ran', readings)).toBe('There is an owner_1 such that owner_1 has run.');
  });

  /**
   * @canon spec-the-reading-of-the-table-wins-over-the-body
   */
  it('prefers the reading the table gives over the body', () => {
    const readings = defined('pred pending[x: Cleanup] { x in Registered }', 'noun Cleanup: cleanup\npending: {1} is waiting | {1} is not waiting');
    expect(say('pending[d]', readings)).toBe('d is waiting.');
  });

  /**
   * @canon spec-a-predicate-whose-body-cannot-be-said-is-refused-with-advice-to-give-it-a-reading
   */
  it('is refused when its body cannot be said, and the error says to give it a reading', () => {
    const readings = defined("pred step[x: Cleanup] { Ran' = Ran + x }");
    expect(() => say('step[d]', readings)).toThrow(/no reading for "step", and its body cannot be said/);
    expect(() => say('step[d]', defined('pred step[x: Cleanup] { x in Ran  x.^on in Registered }'))).toThrow(/no reading for "step"/);
  });

  /**
   * @canon spec-a-predicate-defined-in-terms-of-itself-is-refused
   * @canon spec-a-call-with-the-wrong-number-of-arguments-is-refused
   */
  it('is refused when it is defined in terms of itself, or called with the wrong number of arguments', () => {
    expect(() => say('loop[d]', defined('pred loop[x: Cleanup] { loop[x] }'))).toThrow('defined in terms of itself');
    expect(() => say('pending[d, d]', defined('pred pending[x: Cleanup] { x in Registered }'))).toThrow('takes 1 arguments, not 2');
  });

  /**
   * @canon spec-the-checker-reads-the-predicates-a-vocabulary-declares
   */
  it('reads a vocabulary for its predicates, their parameters and their bodies', () => {
    const definitions = parseDefinitions('sig A {}\npred p[a, b: A, c: A] { a in B  and { x } }\npred q { y in Z }');
    expect([...definitions.keys()]).toEqual(['p', 'q']);
    expect(definitions.get('p')?.params).toEqual(['a', 'b', 'c']);
    expect(definitions.get('q')?.params).toEqual([]);
    expect(definitions.get('p')?.body).toMatchObject({ t: 'and', items: [{ t: 'cmp', op: 'in' }, { t: 'name', name: 'x' }] });
  });
});

describe('a definition', () => {
  const readings = parseReadings(
    ['noun Unit: unit', 'noun Spec: spec', 'Spec: {1} is a spec | {1} is not a spec', 'Sits.rel: {1} sits in {2} | {1} does not sit in {2}', 'orphan: {1} is an orphan | {1} is not an orphan', 'pair: {1} and {2} are a pair | {1} and {2} are not a pair'].join('\n')
  );

  /**
   * @canon spec-a-passage-that-starts-with-pred-is-a-definition
   */
  it('is recognized by its keyword', () => {
    expect(isDefinition('pred orphan[u: Unit] { u in Spec }')).toBe(true);
    expect(isDefinition('all u: Unit | u in Spec')).toBe(false);
  });

  /**
   * @canon spec-a-definition-says-what-it-names-exactly-when-its-body-holds-for-every-parameter
   */
  it('says what it names exactly when its body holds, for every value of its parameters', () => {
    expect(verbalizeDefinition('pred orphan[u: Unit] { u in Spec and no v: Unit | u->v in Sits.rel }', readings)).toBe(
      ['For every unit_1:', '  unit_1 is an orphan exactly when unit_1 is a spec that sits in no unit.'].join('\n')
    );
  });

  /**
   * @canon spec-a-definition-that-marks-its-variables-disj-is-said-with-them-different
   */
  it('says a definition with disj variables, and a call of it by its body, with the variables different', () => {
    const vocabulary = 'sig Cleanup {} var sig Ran in Cleanup {} pred pair[disj c, d: Cleanup] { c in Ran } pred both[disj c, d: Cleanup] { c in Ran }';
    const readings = withDefinitions(parseReadings('noun Cleanup: cleanup\nRan: {1} has run | {1} has not run\npair: {1} pairs with {2} | {1} does not pair with {2}'), vocabulary);
    expect(verbalizeDefinition('pred pair[disj c, d: Cleanup] { c in Ran }', readings)).toBe(
      'For every cleanup_1 and every cleanup_2:\n  cleanup_1 pairs with cleanup_2 exactly when cleanup_1 and cleanup_2 are different and cleanup_1 has run.'
    );
    expect(say('both[a, b]', readings)).toBe('a and b are different and a has run.');
  });

  /**
   * @canon spec-a-definition-with-a-body-of-one-clause-is-said-on-one-line
   */
  it('says a body of one clause on one line', () => {
    expect(verbalizeDefinition('pred orphan[u: Unit] { u in Spec }', readings)).toBe('For every unit_1:\n  unit_1 is an orphan exactly when unit_1 is a spec.');
  });

  /**
   * @canon spec-a-definition-says-each-parameter-with-the-noun-of-its-type
   */
  it('says each parameter of several, with the noun of its type', () => {
    expect(verbalizeDefinition('pred pair[a, b: Unit] { a->b in Sits.rel }', readings)).toBe(
      'For every unit_1 and every unit_2:\n  unit_1 and unit_2 are a pair exactly when unit_1 sits in unit_2.'
    );
  });

  /**
   * @canon spec-a-definition-is-said-in-markdown-the-way-a-formula-is
   */
  it('is said in Markdown the way a formula is', () => {
    expect(verbalizeDefinition('pred orphan[u: Unit] { u in Spec or u in Spec }', readings, 'markdown')).toBe(
      ['For every unit_1:', '', 'unit_1 is an orphan exactly when unit_1 is a spec or is a spec.'].join('\n')
    );
  });

  /**
   * @canon spec-a-definition-of-a-word-with-no-reading-is-refused
   */
  it('needs the words for what it names, and says which are missing', () => {
    expect(() => verbalizeDefinition('pred mystery[u: Unit] { u in Spec }', readings)).toThrow('no reading for "mystery"');
  });

  /**
   * @canon spec-text-that-is-not-a-definition-is-refused
   * @canon spec-a-parameter-with-no-type-is-refused
   * @canon spec-a-definition-whose-body-is-a-rule-is-refused
   */
  it('refuses text that is not a definition, a parameter with no type, and a body that is a rule', () => {
    expect(() => verbalizeDefinition('u in Spec', readings)).toThrow('a definition is written');
    expect(() => verbalizeDefinition('pred orphan[u] { u in Spec }', readings)).toThrow('expected ":", found "]"');
    expect(() => verbalizeDefinition('pred orphan[u: Unit] { u in Spec implies u in Spec }', readings)).toThrow('no words after "exactly when"');
  });
});

describe('a definition by cases', () => {
  const readings = parseReadings(
    [
      'noun Unit: unit', 'noun Issue: issue',
      'Spec: {1} is a spec | {1} is not a spec', 'Bug: {1} is a bug | {1} is not a bug', 'Axiom: {1} is an axiom | {1} is not an axiom',
      'Cite.rel: {1} cites {2} | {1} does not cite {2}', 'Name.rel: {1} names {2} | {1} does not name {2}', 'Known: tracker knows {1} | tracker does not know {1}',
      'Tested: {1} is tested | {1} is not tested',
      'unfounded: {1} is unfounded | {1} is not unfounded', 'hidden: {1} is hidden | {1} is not hidden', 'odd: {1} is odd | {1} is not odd'
    ].join('\n')
  );
  const define = (body: string, name = 'unfounded'): string => verbalizeDefinition(`pred ${name}[u: Unit] { ${body} }`, readings).split('\n').slice(1).join('\n').trim();

  /**
   * @canon spec-a-definition-by-cases-is-said-as-a-noun-phrase-for-each-kind
   */
  it('is said as a noun phrase for each kind: "a spec that cites no axiom and cites no spec"', () => {
    expect(define('(u in Spec and (no a: Unit | u->a in Cite.rel) and u not in Bug) or (u in Bug and (no s: Unit | u->s in Cite.rel))')).toBe(
      ['unit_1 is unfounded exactly when unit_1 is one of these:', '    - a spec that cites no unit and is not a bug', '    - a bug that cites no unit'].join('\n')
    );
  });

  /**
   * @canon spec-the-alternatives-of-one-kind-are-put-together-with-or
   */
  it('puts the alternatives of one kind together with "or"', () => {
    expect(define('(u in Spec and (no a: Unit | u->a in Cite.rel)) or (u in Spec and u not in Bug) or (u in Bug and (no s: Unit | u->s in Cite.rel))')).toBe(
      ['unit_1 is unfounded exactly when unit_1 is one of these:', '    - a spec that cites no unit or is not a bug', '    - a bug that cites no unit'].join('\n')
    );
  });

  /**
   * @canon spec-the-options-of-an-or-inside-a-kind-are-one-coordination
   */
  it('says the options of an "or" inside a kind as one coordination', () => {
    expect(define('(u in Bug and ((no i: Issue | u->i in Name.rel) or (some i: Issue | u->i in Name.rel and i not in Known) or u not in Tested))', 'hidden')).toBe(
      'unit_1 is hidden exactly when unit_1 is a bug that names no issue, names an issue that tracker does not know or is not tested.'
    );
  });

  /**
   * @canon spec-a-definition-with-one-kind-is-one-sentence
   */
  it('is one sentence when there is one kind', () => {
    expect(define('u in Spec and (no a: Unit | u->a in Cite.rel)')).toBe('unit_1 is unfounded exactly when unit_1 is a spec that cites no unit.');
  });

  /**
   * @canon spec-a-definition-by-cases-is-said-as-it-stands-when-an-alternative-does-not-begin-with-its-kind
   */
  it('is said as it stands when an alternative does not begin with its kind', () => {
    expect(define('(u in Spec and u not in Bug) or u not in Axiom').split('\n')[0]).toBe('unit_1 is unfounded exactly when at least one of these holds:');
    expect(define('(u in Spec) or (u in Bug and u not in Spec)').split('\n')[0]).toBe('unit_1 is unfounded exactly when at least one of these holds:');
  });

  /**
   * @canon spec-a-definition-by-cases-is-said-as-it-stands-when-a-run-of-and-would-read-two-ways
   */
  it('is said as it stands when a run of "and" would be read two ways beside another alternative of its kind', () => {
    expect(define('(u in Spec and u not in Bug and u not in Axiom) or (u in Spec and (no a: Unit | u->a in Cite.rel)) or (u in Bug and u not in Spec)').split('\n')[0]).toBe(
      'unit_1 is unfounded exactly when at least one of these holds:'
    );
  });

  /**
   * @canon spec-a-definition-by-cases-is-said-as-it-stands-when-an-alternative-is-not-about-its-subject
   */
  it('is said as it stands when what an alternative says is not about its subject', () => {
    expect(define('(u in Spec and (some a: Unit | a->u in Cite.rel and a in Spec)) or (u in Bug and u not in Spec)').split('\n')[0]).toBe(
      'unit_1 is unfounded exactly when at least one of these holds:'
    );
  });
});

describe('two variables', () => {
  /**
   * @canon spec-two-variables-are-said-to-be-different-or-the-same
   */
  it('are said to be different or the same', () => {
    expect(say('a != b')).toBe('a and b are different.');
    expect(say('not a != b')).toBe('a and b are the same.');
    expect(say('a = b')).toBe('a and b are the same.');
  });
});

describe('a word that names a term', () => {
  const readings = parseReadings(
    ['noun Unit: [unit]', 'noun Owner: an [owner]', 'Ran: {1} has [run] | {1} has not [run]', 'Done: {1} is [done] | {1} is not [done]', 'Told: [checker](#term-checker) tells {1} | [checker](#term-checker) tells no one', 'Alarm: [alarm] rings for {1} | no [alarm] rings for {1}'].join('\n'),
    '#term-x'
  );
  const markdown = (source: string, self?: string): string => verbalize(source, readings, 'markdown', self);

  /**
   * @canon spec-a-word-that-names-a-term-links-to-the-unit-that-holds-its-reading-in-markdown
   */
  it('links to the unit that holds the reading, in the Markdown layout', () => {
    expect(markdown('a in Ran')).toBe('a has [run](#term-x).');
  });

  /**
   * @canon spec-a-word-that-names-a-term-is-plain-in-the-text-layout
   */
  it('is plain in the text layout, which has no links', () => {
    expect(verbalize('a in Ran', readings)).toBe('a has run.');
  });

  /**
   * @canon spec-only-the-first-mention-of-a-term-links
   */
  it('links only the first mention of a term, in the order a reader meets it', () => {
    expect(markdown('a in Ran and b in Ran and c in Done')).toBe(
'a has [run](#term-x), b has run and c is done.'
    );
  });

  /**
   * @canon spec-a-word-never-links-to-the-unit-its-sentence-is-in
   */
  it('is never a link to the unit the sentence is in', () => {
    expect(markdown('a in Ran', '#term-x')).toBe('a has run.');
    expect(markdown('a in Ran and b in Told', '#term-x')).toContain('[checker](#term-checker) tells b');
  });

  /**
   * @canon spec-a-reading-that-points-at-a-unit-links-to-it
   */
  it('links to the unit it points at when it says one', () => {
    expect(markdown('a in Told')).toBe('[Checker](#term-checker) tells a.');
  });

  /**
   * @canon spec-a-link-in-a-table-held-in-another-document-goes-through-its-path
   */
  it('goes through the path of the document that holds a reading, for a link in it to an anchor of that document', () => {
    const other = parseReadings('Told: [checker](#term-checker) tells {1} | [checker](#term-checker) tells no one', 'canon/CANON.md#term-x', 'canon/CANON.md');
    expect(verbalize('a in Told', other, 'markdown')).toBe('[Checker](canon/CANON.md#term-checker) tells a.');
  });

  /**
   * @canon spec-a-reading-that-points-at-a-unit-links-to-it
   */
  it('links to a unit of another document by its whole target, when the reading points at one', () => {
    const other = parseReadings('Told: [checker](../canon/CANON.md#term-checker) tells {1} | [checker](../canon/CANON.md#term-checker) tells no one', '#term-x');
    expect(verbalize('a in Told', other, 'markdown')).toBe('[Checker](../canon/CANON.md#term-checker) tells a.');
  });

  /**
   * @canon spec-the-nouns-of-a-quantifier-link-and-the-article-follows-the-word
   */
  it('links the nouns of a quantifier, and picks the article by the word and not the brackets', () => {
    expect(markdown('some o: Owner | o in Ran')).toBe('There is an [owner_1](#term-x) such that owner_1 has run.');
    expect(markdown('all u: Unit | u in Done')).toBe('For every [unit_1](#term-x):\n\nunit_1 is done.');
  });

  /**
   * @canon spec-a-sentence-starts-with-a-capital-on-the-word-and-not-on-the-bracket
   */
  it('starts a sentence with a capital on the word and not on the bracket', () => {
    expect(markdown('a in Alarm')).toBe('[Alarm](#term-x) rings for a.');
    expect(verbalize('a in Alarm', readings)).toBe('Alarm rings for a.');
  });

  /**
   * @canon spec-a-reading-held-by-no-unit-has-plain-words
   */
  it('is only a word where the reading is held by no unit', () => {
    const loose = parseReadings('Ran: {1} has [run] | {1} has not [run]');
    expect(verbalize('a in Ran', loose, 'markdown')).toBe('a has run.');
  });

  /**
   * @canon spec-a-bracket-with-no-partner-is-refused
   */
  it('is refused when a bracket has no partner', () => {
    expect(() => parseReadings('Ran: {1} has [run | {1} has not run')).toThrow('a bracket in the line of readings has no partner');
    expect(() => parseReadings('noun Unit: unit]')).toThrow('has no partner');
  });
});

describe('a quantifier said as a noun phrase', () => {
  const readings = parseReadings(
    [
      'noun Unit: unit', 'noun Test: test', 'noun Bug: bug', 'noun Issue: issue', 'noun Tag: tag',
      'Spec: {1} is a spec | {1} is not a spec', 'Axiom: {1} is an axiom | {1} is not an axiom', 'Fact: {1} is a fact | {1} is not a fact',
      'Sit.rel: {1} sits in {2} | {1} does not sit in {2}', 'Check.rel: {1} checks {2} | {1} does not check {2}',
      'Name.rel: {1} names {2} | {1} does not name {2}', 'Twice.rel: {1} sits in {2} and in {2} | {1} does not sit in {2}',
      'Known: tracker knows {1} | tracker does not know {1}'
    ].join('\n')
  );
  const said = (formula: string): string => verbalize(`all u: Unit | ${formula}`, readings).split('\n').slice(1).join('\n').trim();

  /**
   * @canon spec-a-variable-said-once-takes-the-place-of-its-quantifier-as-a-noun-phrase
   */
  it('takes the place of the variable when the variable is said once: "sits in no unit"', () => {
    expect(said('no v: Unit | u->v in Sit.rel')).toBe('unit_1 sits in no unit.');
    expect(said('some v: Unit | u->v in Sit.rel')).toBe('unit_1 sits in a unit.');
  });

  /**
   * @canon spec-a-noun-phrase-can-be-the-subject-of-a-sentence
   */
  it('can be the subject: "a tag names unit_1"', () => {
    expect(said('some p: Tag | p->u in Name.rel')).toBe('a tag names unit_1.');
    expect(said('no p: Tag | p->u in Name.rel')).toBe('no tag names unit_1.');
  });

  /**
   * @canon spec-what-else-is-true-of-the-variable-is-a-relative-clause
   */
  it('says what else is true of the variable in a relative clause', () => {
    expect(said('some v: Unit | u->v in Sit.rel and v in Spec')).toBe('unit_1 sits in a unit that is a spec.');
    expect(said('some v: Unit | u->v in Sit.rel and v not in Spec')).toBe('unit_1 sits in a unit that is not a spec.');
    expect(said('some i: Issue | u->i in Name.rel and i not in Known')).toBe('unit_1 names an issue that tracker does not know.');
    expect(said('some v: Unit | u->v in Sit.rel and v->u in Sit.rel')).toBe('unit_1 sits in a unit that sits in unit_1.');
  });

  /**
   * @canon spec-several-negations-of-a-variable-are-one-negation
   */
  it('puts several negations in one: "that is not an axiom, a spec or a fact"', () => {
    expect(said('some v: Unit | u->v in Sit.rel and v not in Axiom and v not in Spec and v not in Fact')).toBe(
      'unit_1 sits in a unit that is not an axiom, a spec or a fact.'
    );
  });

  /**
   * @canon spec-a-variable-that-must-differ-from-another-of-its-kind-is-said-as-another
   */
  it('says "another" for a variable that must not be the other one of its kind', () => {
    expect(said('some v: Unit | v != u and v->u in Sit.rel')).toBe('another unit sits in unit_1.');
    expect(said('some a, b: Unit | a != b and u->a in Name.rel and u->b in Name.rel')).toBe('unit_1 names a unit and names another unit.');
  });

  /**
   * @canon spec-variables-of-different-kinds-nest-as-phrases
   */
  it('nests when the variables are of different kinds: "a test checks a bug that sits in unit_1"', () => {
    expect(said('some t: Test, b: Bug | t->b in Check.rel and b->u in Sit.rel')).toBe('a test checks a bug that sits in unit_1.');
  });

  /**
   * @canon spec-a-quantifier-whose-variable-would-be-said-twice-is-said-in-full
   * @canon spec-a-quantifier-with-nothing-to-attach-to-is-said-in-full
   * @canon spec-no-with-another-is-said-in-full
   * @canon spec-a-condition-that-is-not-about-the-variable-is-said-in-full
   */
  it('is said in full when it does not fit', () => {
    // no fact for the variable beside another thing
    expect(said('some v: Unit | v in Spec')).toBe('there is a unit_2 such that unit_2 is a spec.');
    // a reading that says the variable twice
    expect(said('some v: Unit | u->v in Twice.rel')).toBe('there is a unit_2 such that unit_1 sits in unit_2 and in unit_2.');
    // "no" with "another" says something else than "another"
    expect(said('no v: Unit | v != u and v->u in Sit.rel')).toBe('there is no unit_2 such that unit_2 and unit_1 are different and unit_2 sits in unit_1.');
    // a condition that is not about the variable
    expect(said('some v: Unit | u->v in Sit.rel and u in Spec')).toBe('there is a unit_2 such that unit_1 sits in unit_2 and is a spec.');
  });
});

describe('the items of a list said in a sentence', () => {
  const readings = parseReadings(
    ['noun Unit: unit', 'Spec: {1} is a spec | {1} is not a spec', 'Axiom: {1} is an axiom | {1} is not an axiom', 'Fact: {1} is a fact | {1} is not a fact', 'Sit.rel: {1} sits in {2} | {1} does not sit in {2}', 'Alarm: [alarm] rings for {1} | no [alarm] rings for {1}'].join('\n'),
    '#term-x'
  );
  const said = (formula: string): string => verbalize(`all u: Unit | ${formula}`, readings).split('\n').slice(1).join('\n').trim();

  /**
   * @canon spec-three-clauses-or-fewer-are-said-in-a-sentence
   */
  it('are put in a sentence when there are three or fewer, and none is more than a clause', () => {
    expect(said('u in Spec and u in Axiom')).toBe('unit_1 is a spec and is an axiom.');
    expect(said('u in Spec or u in Axiom or u in Fact')).toBe('unit_1 is a spec, is an axiom or is a fact.');
  });

  /**
   * @canon spec-a-list-of-more-than-three-clauses-is-bullets
   * @canon spec-a-list-with-a-comma-in-an-item-and-more-than-two-clauses-is-bullets
   */
  it('are a list when there are more, or when one holds a comma and there are more than two', () => {
    expect(said('u in Spec and u in Axiom and u in Fact and u not in Spec').split('\n')[0]).toBe('all of these hold:');
    expect(said('u in Spec and u in Axiom and (some v: Unit | u->v in Sit.rel and v not in Spec and v not in Axiom and v not in Fact)').split('\n')[0]).toBe('all of these hold:');
  });

  /**
   * @canon spec-a-list-too-long-for-a-line-is-bullets
   */
  it('are a list when the sentence would run past a line', () => {
    const long = parseReadings(['noun Unit: unit', 'Long: {1} is a unit with a name that is long enough to be a trouble for the line | {1} is not that'].join('\n'));
    expect(verbalize('all u: Unit | u in Long and u in Long and u in Long', long).split('\n')[1]).toBe('  all of these hold:');
  });

  /**
   * @canon spec-a-list-with-a-time-phrase-before-its-last-clause-is-bullets
   */
  it('are a list when a clause before the last begins with a time phrase', () => {
    expect(say("c in Ran' and d in Ran", READINGS)).toBe('All of these hold:\n  - at the next moment, c has run\n  - d has run');
    expect(say("c in Ran' or d in Ran", READINGS)).toBe('At least one of these holds:\n  - at the next moment, c has run\n  - d has run');
    expect(say("d in Ran and c in Ran'", READINGS)).toBe('d has run and at the next moment, c has run.');
  });

  /**
   * @canon spec-an-item-that-is-more-than-a-clause-makes-the-list-bullets
   */
  it('are a list when an item is more than one clause', () => {
    expect(said('u in Spec and (all v: Unit | u->v in Sit.rel) and u in Axiom').split('\n')[0]).toBe('all of these hold:');
  });

  /**
   * @canon spec-a-rule-with-a-list-for-a-side-puts-its-then-on-a-line-of-its-own
   */
  it('put the "then" of a rule on a line of its own when a side is a list, whatever follows it', () => {
    const rule = said('(u in Spec and u in Axiom and u in Fact and u not in Spec) implies u in Axiom');
    expect(rule.split('\n')[0]).toBe('when all of these hold:');
    expect(rule.split('\n').at(-1)?.trim()).toBe('then unit_1 is an axiom.');
    expect(said('(u in Spec and u in Axiom and u in Fact and u not in Spec) implies eventually u in Axiom').split('\n').at(-1)?.trim()).toBe('then now or at a later moment, unit_1 is an axiom.');
  });

  /**
   * @canon spec-an-and-inside-an-or-is-kept-apart
   */
  it('keep an "and" inside an "or" apart, so that the sentence cannot be read two ways', () => {
    expect(said('(u in Spec and u in Axiom) or u in Fact')).toBe('at least one of these holds:\n    - unit_1 is a spec and is an axiom\n    - unit_1 is a fact');
  });

  /**
   * @canon spec-a-subject-is-said-once-when-clauses-begin-with-it
   */
  it('say a subject once, when clauses beside each other begin with it', () => {
    expect(said('u in Spec and (no v: Unit | u->v in Sit.rel)')).toBe('unit_1 is a spec and sits in no unit.');
  });

  /**
   * @canon spec-a-pair-of-variables-is-said-as-it-is-and-not-as-a-subject
   */
  it('say a pair of variables as it is, and not as a subject', () => {
    expect(said('all v: Unit | (u != v and u in Spec) implies v in Spec')).toContain('when unit_1 and unit_2 are different and unit_1 is a spec, unit_2 is a spec');
  });

  /**
   * @canon spec-a-rule-keeps-its-then-before-a-time-phrase
   * @canon spec-a-rule-drops-its-then-before-anything-else
   */
  it('keep the "then" of a rule when what follows is a time phrase, and drop it otherwise', () => {
    expect(said('u in Spec implies eventually u in Axiom')).toBe('when unit_1 is a spec, then now or at a later moment, unit_1 is an axiom.');
    expect(said('u in Spec implies after u in Axiom')).toBe('when unit_1 is a spec, then at the next moment, unit_1 is an axiom.');
    expect(said('u in Spec implies once u in Axiom')).toBe('when unit_1 is a spec, then now or at an earlier moment, unit_1 is an axiom.');
    expect(said('u in Spec implies before u in Axiom')).toBe('when unit_1 is a spec, then there is a moment before, and at it, unit_1 is an axiom.');
    expect(said('u in Spec implies u in Axiom')).toBe('when unit_1 is a spec, unit_1 is an axiom.');
  });
});

describe('connectives, quantifiers and let', () => {
  /**
   * @canon spec-an-equivalence-of-two-clauses-is-said-with-exactly-when
   */
  it('says an equivalence of two clauses with "exactly when"', () => {
    expect(say('c in Ran iff d in Ran')).toBe('c has run exactly when d has run.');
    expect(say('c in Ran <=> d not in Ran')).toBe('c has run exactly when d has not run.');
  });

  /**
   * @canon spec-an-equivalence-of-more-than-clauses-is-said-as-both-or-neither
   */
  it('says an equivalence with a side of more than one clause as both or neither', () => {
    expect(say('(c in Ran and d in Ran) iff c in Registered')).toBe('Both or neither of these hold:\n  - c has run and d has run\n  - code has registered c');
    expect(say('c in Ran iff eventually d in Ran')).toBe('Both or neither of these hold:\n  - c has run\n  - now or at a later moment, d has run');
  });

  /**
   * @canon spec-an-equivalence-that-is-a-side-of-a-rule-is-said-as-both-or-neither
   */
  it('says an equivalence that is a side of a rule, a temporal operator or a definition as both or neither', () => {
    expect(say('c in Registered implies (c in Ran iff d in Ran)')).toBe('When code has registered c\nthen both or neither of these hold:\n       - c has run\n       - d has run');
    expect(() => say('(c in Ran iff d in Ran) until d in Registered')).toThrow('"until" is supported only between two clauses');
    const readings = withDefinitions(parseReadings('noun Cleanup: cleanup\nRan: {1} has run | {1} has not run\nsame: {1} goes with {2} | {1} does not go with {2}'), 'sig Cleanup {}');
    expect(verbalizeDefinition('pred same[c, d: Cleanup] { c in Ran iff d in Ran }', readings)).toBe(
      'For every cleanup_1 and every cleanup_2:\n  cleanup_1 goes with cleanup_2 exactly when both or neither of these hold:\n    - cleanup_1 has run\n    - cleanup_2 has run'
    );
  });

  /**
   * @canon spec-an-equivalence-whose-first-side-begins-with-a-time-phrase-is-said-as-both-or-neither
   */
  it('says an equivalence whose first side begins with a time phrase as both or neither', () => {
    expect(say("c in Ran' iff d in Ran")).toBe('Both or neither of these hold:\n  - at the next moment, c has run\n  - d has run');
    expect(say("d in Ran iff c in Ran'")).toBe('d has run exactly when at the next moment, c has run.');
  });

  /**
   * @canon spec-an-else-is-said-as-otherwise
   */
  it('says an else as "otherwise"', () => {
    expect(say('c in Ran implies d in Ran else d in Registered')).toBe('When c has run, d has run; otherwise, code has registered d.');
    expect(say('(c in Ran and d in Ran and c in Registered and d in Registered) implies d in Disposed else c in Disposed')).toBe(
      ['When all of these hold:', '  - c has run', '  - d has run', '  - code has registered c', '  - code has registered d', 'then pulse has disposed d', 'otherwise pulse has disposed c.'].join('\n')
    );
  });

  /**
   * @canon spec-one-as-a-quantifier-is-said-as-exactly-one
   */
  it('says "one" as exactly one', () => {
    expect(say('one c: Cleanup | c in Ran')).toBe('There is exactly one cleanup_1 such that cleanup_1 has run.');
    expect(say('one c: Cleanup, o: Owner | c.on = o')).toBe('There is exactly one combination of cleanup_1 and owner_1 such that cleanup_1 is on owner_1.');
  });

  /**
   * @canon spec-lone-as-a-quantifier-is-said-as-at-most-one
   */
  it('says "lone" as at most one', () => {
    expect(say('lone c: Cleanup | c in Ran')).toBe('There is at most one cleanup_1 such that cleanup_1 has run.');
    expect(say('lone c: Cleanup, o: Owner | c.on = o')).toBe('There is at most one combination of cleanup_1 and owner_1 such that cleanup_1 is on owner_1.');
  });

  /**
   * @canon spec-a-block-as-the-body-of-a-quantifier-is-said-as-its-formulas-together
   */
  it('says a block as the body of a quantifier as its formulas together', () => {
    expect(say('all c: Cleanup { c in Ran c in Registered }')).toBe('For every cleanup_1:\n  cleanup_1 has run and code has registered cleanup_1.');
  });

  /**
   * @canon spec-not-before-an-and-is-said-as-at-least-one-negation
   */
  it('says not before an and as at least one negation', () => {
    expect(say('not (c in Ran and d in Ran)')).toBe('c has not run or d has not run.');
  });

  /**
   * @canon spec-not-before-an-or-is-said-as-every-negation
   */
  it('says not before an or as every negation', () => {
    expect(say('not (c in Ran or d in Ran)')).toBe('c has not run and d has not run.');
  });

  /**
   * @canon spec-not-before-a-rule-is-said-as-its-condition-and-the-negation-of-its-consequence
   */
  it('says not before a rule as its condition and the negation of its consequence', () => {
    expect(say('not (c in Ran implies d in Ran)')).toBe('c has run and d has not run.');
  });

  /**
   * @canon spec-not-before-an-equivalence-is-said-as-exactly-one-of-its-sides
   */
  it('says not before an equivalence as exactly one of its sides', () => {
    expect(say('not (c in Ran iff d in Ran)')).toBe('Exactly one of these holds:\n  - c has run\n  - d has run');
  });

  /**
   * @canon spec-not-before-an-else-is-said-as-the-rule-with-each-side-negated
   */
  it('says not before an else as the rule with each side negated', () => {
    expect(say('not (c in Ran implies d in Ran else d in Registered)')).toBe('When c has run, d has not run; otherwise, code has not registered d.');
  });

  /**
   * @canon spec-not-before-some-or-no-is-said-as-the-other
   */
  it('says not before some or no as the other', () => {
    expect(say('not some c: Cleanup | c in Ran')).toBe('There is no cleanup_1 such that cleanup_1 has run.');
    expect(say('not no c: Cleanup | c in Ran')).toBe('There is a cleanup_1 such that cleanup_1 has run.');
  });

  /**
   * @canon spec-not-before-all-is-said-as-some-with-the-body-negated
   */
  it('says not before all as some with the body negated', () => {
    expect(say('not all c: Cleanup | c in Ran')).toBe('There is a cleanup_1 such that cleanup_1 has not run.');
    expect(say('not all c: Cleanup - Ran | c in Registered')).toBe('There is a cleanup_1 such that cleanup_1 has not run and code has not registered cleanup_1.');
  });

  /**
   * @canon spec-not-before-always-or-eventually-is-said-as-the-other-with-the-formula-negated
   */
  it('says not before always or eventually as the other with the formula negated', () => {
    expect(say('not eventually c in Ran')).toBe('Now and at every later moment, c has not run.');
    expect(say('not always c in Ran')).toBe('Now or at a later moment, c has not run.');
  });

  /**
   * @canon spec-not-before-historically-or-once-is-said-as-the-other-with-the-formula-negated
   */
  it('says not before historically or once as the other with the formula negated', () => {
    expect(say('not once c in Ran')).toBe('Now and at every earlier moment, c has not run.');
    expect(say('not historically c in Ran')).toBe('Now or at an earlier moment, c has not run.');
  });

  /**
   * @canon spec-not-before-after-is-said-as-after-with-the-formula-negated
   */
  it('says not before after as after with the formula negated', () => {
    expect(say('not after c in Ran')).toBe('At the next moment, c has not run.');
  });

  /**
   * @canon spec-a-not-with-no-formula-to-move-into-is-said-as-it-is-not-the-case-that
   */
  it('says a not with no formula to move into as "it is not the case that", with the formula set apart', () => {
    expect(say('not one c: Cleanup | c in Ran')).toBe('It is not the case that:\n  there is exactly one cleanup_1 such that cleanup_1 has run.');
    expect(say('not lone c: Cleanup | c in Ran')).toBe('It is not the case that:\n  there is at most one cleanup_1 such that cleanup_1 has run.');
    expect(say('not before c in Ran')).toBe('It is not the case that:\n  there is a moment before, and at it, c has run.');
    expect(say('not (runNow[d] releases runNow[c])')).toBe('It is not the case that:\n  up to and including the first moment where d runs, if one comes, c runs.');
  });

  /**
   * @canon spec-a-let-is-said-with-its-value-in-the-place-of-its-name
   */
  it('says a let with its value in the place of its name', () => {
    expect(say('let x = c | x in Ran')).toBe('c has run.');
    expect(say('let x = c.on | no x')).toBe('c is on no owner.');
    expect(say('let x = c, y = x | y in Ran')).toBe('c has run.');
    expect(say('not let x = c | x in Ran')).toBe('c has not run.');
    expect(say('let x = c | some x: Cleanup | x in Ran')).toBe('There is a cleanup_1 such that cleanup_1 has run.');
  });

  /**
   * @canon spec-a-let-whose-value-a-quantifier-of-its-body-would-capture-is-refused
   */
  it('refuses a let whose value a quantifier of its body would capture', () => {
    expect(() => say('let x = c | some c: Cleanup | c in x.on')).toThrow('the body of the "let" of "x" declares "c", which its value names');
  });

  /**
   * @canon spec-the-spellings-of-not-in-and-not-equal-are-said-alike
   */
  it('says the spellings of not in and not equal alike', () => {
    for (const formula of ['c !in Ran', 'c ! in Ran', 'c not in Ran']) expect(say(formula)).toBe('c has not run.');
    for (const formula of ['c not = d', 'c ! = d', 'c != d']) expect(say(formula)).toBe('c and d are different.');
  });

  /**
   * @canon spec-text-that-alloy-does-not-read-is-refused
   */
  it('refuses text that Alloy does not read, such as ==', () => {
    expect(() => say('c == d')).toThrow('cannot read "=" here');
  });
});

describe('what it refuses', () => {
  /**
   * @canon spec-a-name-with-no-reading-is-refused-and-named
   */
  it('says which name has no reading', () => {
    expect(() => say('frobnicate[o]')).toThrow('no reading for "frobnicate"');
  });

  /**
   * @canon spec-a-reading-with-no-negative-form-is-refused-and-named
   */
  it('says which reading has no negative form', () => {
    const readings = parseReadings('Ran: {1} has run');
    expect(() => say('c not in Ran', readings)).toThrow('no negative reading for "Ran"');
  });

  /**
   * @canon spec-a-type-with-no-noun-is-refused-and-named
   */
  it('says which noun is missing', () => {
    expect(() => say('all x: Mystery | x in Ran')).toThrow('no noun for "Mystery"');
  });

  /**
   * @canon spec-a-reading-that-uses-a-slot-the-formula-does-not-give-is-refused
   */
  it('says when a reading uses a variable the formula does not give', () => {
    const readings = parseReadings('on: {1} is on {3}');
    expect(() => say('c->o in on', readings)).toThrow('uses {3}');
  });

  /**
   * @canon spec-a-reading-that-leaves-out-a-slot-the-formula-gives-is-refused
   */
  it('refuses a reading that leaves out a place the formula fills', () => {
    expect(() => say('dispose[c, d]')).toThrow('the reading of "dispose" leaves out {2}');
    expect(() => say('c->d in Ran')).toThrow('the reading of "Ran" leaves out {2}');
    expect(() => verbalizeDefinition('pred dispose[c, d: Cleanup] { c in Ran }', READINGS)).toThrow('the reading of "dispose" leaves out {2}');
  });

  /**
   * @canon spec-a-binary-temporal-operator-inside-a-side-of-another-is-refused
   */
  it('refuses a binary temporal operator inside a side of another, but reads a chain of ";"', () => {
    expect(() => say('c in Ran until (d in Ran until c in Registered)')).toThrow('reads in more than one way');
    expect(() => say('(c in Ran since d in Ran) until c in Registered')).toThrow('reads in more than one way');
    expect(() => say('(c in Ran until d in Ran) ; c in Registered')).toThrow('reads in more than one way');
    expect(say('c in Ran ; d in Ran ; c in Registered')).toBe('c has run, and at the next moment, d has run, and at the next moment, code has registered c.');
  });

  /**
   * @canon spec-a-primed-relation-of-a-variable-signature-is-refused
   */
  it('refuses a prime on a relation of a var sig, and says one of a sig that does not change', () => {
    const queue = withDefinitions(parseReadings('Queue.older: code queued {1} before {2} | code did not queue {1} before {2}'), 'sig Cleanup {} var sig Queue { older: Cleanup -> Cleanup }');
    expect(() => say("c->d in Queue.older'", queue)).toThrow('"Queue" is a var sig');
    expect(() => say("c->d in (Queue.older)'", queue)).toThrow('"Queue" is a var sig');
    expect(say("c->d in Clock.older'")).toBe('At the next moment, code registered c before d.');
  });

  /**
   * @canon spec-a-construct-the-words-do-not-cover-is-refused
   */
  it('refuses a construct it has no words for, rather than leaving it out', () => {
    expect(() => say('some ^on')).toThrow('a set must be a name, not a closure');
    expect(() => say('(all c: Cleanup | c in Ran) releases d in Ran')).toThrow('"releases" is supported only between two clauses');
    expect(() => say('some ~on')).toThrow('a set must be a name, not a transpose');
  });

  /**
   * @canon spec-a-line-of-readings-that-cannot-be-read-is-refused
   */
  it('refuses a line of readings it cannot read', () => {
    expect(() => parseReadings('this is not a reading')).toThrow('cannot read the line of readings');
  });
});
