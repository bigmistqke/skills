/**
 * How the checker says a world that the analyzer found: its steps, the names
 * of its things, and the sentences of its tuples. The traces are in the text
 * the analyzer writes for a run that found an instance.
 */
import { describe, expect, it } from 'vitest';
import { parseReadings } from '@bigmistqke/naturalloy';
import { sayWorld } from '../../src/world.ts';

/** A state of a trace, as the analyzer writes it: its lines after the built-in sets. */
const state = (n: number, lines: string[], loop = false): string =>
  [
    `------State ${n}${loop ? ' (loop)' : ''}-------`,
    'univ={Lane$0, Claim$0, Claim$1, -1, 0}',
    'Int={-1, 0}',
    'seq/Int={0}',
    'String={}',
    'none={}',
    ...lines
  ].join('\n');

/** A trace of the states; the state marked `loop` is the one the trace loops back to. */
const trace = (...states: string[]): string => ['---Trace---', ...states].join('\n');

const READINGS = parseReadings(
  [
    'noun Lane: a [lane]',
    'noun Claim: a claim',
    'noun AppMotion: an app motion',
    'claim: {1} holds {2} | {1} does not hold {2}',
    'Ended: {1} has ended | {1} has not ended',
    'Teardown: the globe is torn down | the globe is not torn down',
    'Probe.rel: the author asks about {2} for {1} | the author does not ask about {2} for {1}'
  ].join('\n'),
  'term-lane'
);

/** The signatures of the traces; the ones declared with `in` hold things named after another signature. */
const MODEL = `sig Lane { var claim: set Claim }
sig Claim {}
var sig Ended in Claim {}
sig AppMotion in Claim {}
var lone sig Teardown {}
abstract sig Engine {}
lone sig AtOnce extends Engine {}
var sig Live {}
one sig Probe { rel: Claim -> Lane }
sig Desk { busy: Claim -> Lane }`;

const SCENARIO = 'scenario_1_spec_a_claim_ends';

/** A trace of two steps: claim_1 ends, and lane_1 takes claim_2 in its place. */
const ENDING = trace(
  state(0, ['this/Lane={Lane$0}', 'this/Lane<:claim={Lane$0->Claim$0}', 'this/Claim={Claim$0, Claim$1}', 'this/Ended={}', `skolem $${SCENARIO}_c={Claim$0}`]),
  state(1, ['this/Lane={Lane$0}', 'this/Lane<:claim={Lane$0->Claim$1}', 'this/Claim={Claim$0, Claim$1}', 'this/Ended={Claim$0}', `skolem $${SCENARIO}_c={Claim$0}`], true)
);

describe('the steps of a world', () => {
  /**
   * @canon spec-the-first-step-says-everything-else-that-is-true
   */
  it('says every true tuple at the first step that is not true at every step', () => {
    const lines = sayWorld(ENDING, MODEL, READINGS, SCENARIO);
    expect(lines.slice(lines.indexOf('step 0:'), lines.indexOf('step 1:'))).toEqual(['step 0:', '  lane_1 holds claim_1']);
  });

  /**
   * @canon spec-the-first-step-says-everything-else-that-is-true
   */
  it('says that nothing else is true at a first step whose every tuple holds throughout', () => {
    const same = ['this/Lane={Lane$0}', 'this/Lane<:claim={Lane$0->Claim$0}', 'this/Claim={Claim$0}'];
    const lines = sayWorld(trace(state(0, same), state(1, same, true)), MODEL, READINGS, SCENARIO);
    expect(lines).toEqual(['throughout:', '  lane_1 holds claim_1', 'step 0:', '  nothing else is true', 'step 1:', '  nothing changes', 'then back to step 1']);
  });

  /**
   * @canon spec-a-tuple-true-at-every-step-is-said-under-throughout
   */
  it('says a tuple that is true at every step once, under throughout, before the first step', () => {
    const text = trace(
      state(0, ['this/Lane={Lane$0}', 'this/Lane<:claim={Lane$0->Claim$1}', 'this/Claim={Claim$0, Claim$1}', 'this/Ended={}', `skolem $${SCENARIO}_c={Claim$0}`]),
      state(1, ['this/Lane={Lane$0}', 'this/Lane<:claim={Lane$0->Claim$1}', 'this/Claim={Claim$0, Claim$1}', 'this/Ended={Claim$0}', `skolem $${SCENARIO}_c={Claim$0}`], true)
    );
    const lines = sayWorld(text, MODEL, READINGS, SCENARIO);
    expect(lines).toEqual(['c is claim_1', 'throughout:', '  lane_1 holds claim_2', 'step 0:', '  nothing else is true', 'step 1:', '  + claim_1 has ended', 'then back to step 1']);
  });

  /**
   * @canon spec-the-first-step-says-everything-else-that-is-true
   */
  it('reads a trace whose lines end in a carriage return and a line feed', () => {
    const lines = sayWorld(ENDING.replace(/\n/g, '\r\n'), MODEL, READINGS, SCENARIO);
    expect(lines.slice(0, 3)).toEqual(['c is claim_1', 'step 0:', '  lane_1 holds claim_1']);
  });

  /**
   * @canon spec-a-later-step-says-only-what-changed
   */
  it('says at a later step what became true and what became false, and nothing that stayed', () => {
    const lines = sayWorld(ENDING, MODEL, READINGS, SCENARIO);
    const step1 = lines.slice(lines.indexOf('step 1:') + 1, lines.findIndex(l => l.startsWith('then')));
    expect(step1.sort()).toEqual(['  + claim_1 has ended', '  + lane_1 holds claim_2', '  - lane_1 holds claim_1'].sort());
  });

  /**
   * @canon spec-a-later-step-says-only-what-changed
   */
  it('says that nothing changes at a step that is the same as the one before', () => {
    const same = ['this/Lane={Lane$0}', 'this/Lane<:claim={Lane$0->Claim$0}', 'this/Claim={Claim$0}'];
    const lines = sayWorld(trace(state(0, same), state(1, same, true)), MODEL, READINGS, SCENARIO);
    expect(lines).toContain('  nothing changes');
  });

  /**
   * @canon spec-a-world-says-the-step-its-trace-loops-back-to
   */
  it('ends with the step the trace loops back to', () => {
    const lines = sayWorld(ENDING, MODEL, READINGS, SCENARIO);
    expect(lines.at(-1)).toBe('then back to step 1');
  });

  /**
   * @canon spec-a-world-says-which-thing-each-variable-of-the-scenario-is
   */
  it('opens with the thing each variable of the scenario stands for, and leaves out the variables of other predicates', () => {
    const text = ENDING.replace('this/Ended={}', 'this/Ended={}\nskolem $other_d={Claim$1}');
    const lines = sayWorld(text, MODEL, READINGS, SCENARIO);
    expect(lines.slice(0, 2)).toEqual(['c is claim_1', 'step 0:']);
  });
});

describe('the names of things', () => {
  /**
   * @canon spec-a-thing-of-a-signature-with-a-noun-is-named-after-the-noun-without-its-brackets
   */
  it('names a thing after the noun of its signature and its number from 1, without the brackets of a term', () => {
    const lines = sayWorld(ENDING, MODEL, READINGS, SCENARIO);
    expect(lines).toContain('  lane_1 holds claim_1');
  });

  /**
   * @canon spec-a-thing-of-a-signature-with-no-noun-keeps-the-name-the-analyzer-gives-it
   */
  it('keeps the analyzer name of a thing whose signature has no noun', () => {
    const readings = parseReadings('claim: {1} holds {2} | {1} does not hold {2}');
    const lines = sayWorld(ENDING, MODEL, readings, SCENARIO);
    expect(lines).toContain('  Lane$0 holds Claim$0');
  });
});

describe('the sentences of tuples', () => {
  /**
   * @canon spec-a-thing-of-a-set-is-said-with-the-reading-of-the-set
   */
  it('says a thing of a set with the reading of the set', () => {
    expect(sayWorld(ENDING, MODEL, READINGS, SCENARIO)).toContain('  + claim_1 has ended');
  });

  /**
   * @canon spec-a-tuple-of-a-field-is-said-with-the-reading-of-the-field
   */
  it('says a tuple of a field with the first thing in {1} and the next in {2}', () => {
    expect(sayWorld(ENDING, MODEL, READINGS, SCENARIO)).toContain('  lane_1 holds claim_1');
  });

  /**
   * @canon spec-a-tuple-of-a-field-of-a-one-signature-is-said-without-the-thing-of-that-signature
   */
  it('leaves out the thing of a one signature when the reading has a place fewer than the tuple', () => {
    const text = trace(state(0, ['this/Claim={Claim$0}', 'this/Lane={Lane$0}', 'this/Probe={Probe$0}', 'this/Probe<:rel={Probe$0->Claim$0->Lane$0}'], true));
    expect(sayWorld(text, MODEL, READINGS, SCENARIO)).toContain('  the author asks about lane_1 for claim_1');
  });

  /**
   * @canon spec-a-tuple-of-a-field-of-a-one-signature-is-said-without-the-thing-of-that-signature
   */
  it('keeps the first thing of a field of a signature that is not one, whatever places its reading has', () => {
    const readings = parseReadings('noun Desk: desk\nnoun Claim: claim\nbusy: {1} is busy with {2} | {1} is not busy with {2}');
    const text = trace(state(0, ['this/Claim={Claim$0}', 'this/Lane={Lane$0}', 'this/Desk={Desk$0}', 'this/Desk<:busy={Desk$0->Claim$0->Lane$0}'], true));
    expect(sayWorld(text, MODEL, readings, SCENARIO)).toContain('  desk_1 is busy with claim_1');
  });

  /**
   * @canon spec-a-set-whose-reading-has-no-variable-is-said-once-when-it-has-a-thing
   */
  it('says a set whose reading has no variable once when it has a thing, and not when it is empty', () => {
    const text = trace(state(0, ['this/Teardown={}']), state(1, ['this/Teardown={Teardown$0}'], true));
    const lines = sayWorld(text, MODEL, READINGS, SCENARIO);
    expect(lines).toEqual(['step 0:', '  nothing is true', 'step 1:', '  + the globe is torn down', 'then back to step 1']);
  });

  /**
   * @canon spec-a-thing-of-a-set-with-a-noun-and-no-reading-is-said-as-that-noun
   */
  it('says a thing of a set with a noun and no reading as one of that noun', () => {
    const text = trace(state(0, ['this/Claim={Claim$0}', 'this/AppMotion={Claim$0}'], true));
    expect(sayWorld(text, MODEL, READINGS, SCENARIO)).toContain('  claim_1 is an app motion');
  });

  /**
   * @canon spec-a-thing-that-another-sentence-names-is-not-said-to-exist
   */
  it('says nothing more of a thing that another sentence names, at any step', () => {
    const text = trace(
      state(0, ['this/Lane={Lane$0}', 'this/Lane<:claim={}', 'this/Claim={Claim$0}']),
      state(1, ['this/Lane={Lane$0}', 'this/Lane<:claim={Lane$0->Claim$0}', 'this/Claim={Claim$0}'], true)
    );
    const lines = sayWorld(text, MODEL, READINGS, SCENARIO);
    expect(lines.filter(line => line.includes('exists'))).toEqual([]);
  });

  /**
   * @canon spec-a-thing-that-no-sentence-names-is-said-to-exist
   */
  it('says that a thing no sentence names exists, once, under its own signature', () => {
    const text = trace(state(0, ['this/Engine={AtOnce$0}', 'this/AtOnce={AtOnce$0}', 'this/Claim={Claim$0}'], true));
    expect(sayWorld(text, MODEL, READINGS, SCENARIO)).toEqual(['throughout:', '  AtOnce$0 exists', '  claim_1 exists', 'step 0:', '  nothing else is true', 'then back to step 0']);
  });

  /**
   * @canon spec-a-thing-of-a-var-signature-is-said-to-exist-at-each-step-it-is-in
   */
  it('says that a thing of a var signature exists at each step that holds it', () => {
    const text = trace(state(0, ['this/Live={}']), state(1, ['this/Live={Live$0}']), state(2, ['this/Live={}'], true));
    expect(sayWorld(text, MODEL, READINGS, SCENARIO)).toEqual(['step 0:', '  nothing is true', 'step 1:', '  + Live$0 exists', 'step 2:', '  - Live$0 exists', 'then back to step 2']);
  });

  /**
   * @canon spec-a-word-with-no-reading-is-said-with-its-alloy-name
   */
  it('says a set and a field with no reading and no noun in Alloy', () => {
    const lines = sayWorld(ENDING, MODEL, undefined, SCENARIO);
    expect(lines).toContain('  Lane.claim: Lane$0 -> Claim$0');
    expect(lines).toContain('  + Ended: Claim$0');
  });
});
