/**
 * The rules a reader holds to read the words: each pinned by the words it describes, and for noun phrases by what the
 * IR of those words means in Alloy.
 */
import { describe, expect, it } from 'vitest';
import { context, lower } from '../../src/core/index.ts';
import { meaning } from '../../src/core/ir.ts';
import { optimize } from '../../src/core/pass.ts';
import { PASSES } from '../../src/core/passes/index.ts';
import { parseReadings, verbalize, withDefinitions } from '../../src/index.ts';
import { READINGS, VOCABULARY } from './sweep.ts';

const readings = withDefinitions(parseReadings(READINGS), VOCABULARY);
const say = (formula: string): string => verbalize(formula, readings);
/** What the words of a formula mean, as the IR the passes leave says in Alloy. */
const means = (formula: string): string => meaning(optimize(lower(formula, readings), PASSES, context(readings)).ir);

describe('the rules of reading', () => {
  /**
   * @canon spec-a-noun-phrase-covers-the-clause-it-stands-in
   */
  it('lets a noun phrase cover the clause it stands in', () => {
    expect(say('no o: Owner | o in c.on')).toBe('c is on no owner.');
    expect(means('no o: Owner | o in c.on')).toBe('(no v_1: Owner | c->v_1 in on)');
    expect(say('all c, d: Cleanup | some c.on and some d.on')).toBe('For every cleanup_1 and every cleanup_2:\n  cleanup_1 is on an owner and cleanup_2 is on an owner.');
  });

  /**
   * @canon spec-the-first-noun-phrase-of-a-clause-covers-the-next
   */
  it('lets the first noun phrase of a clause cover the next', () => {
    expect(say('no c: Cleanup | some o: Owner | o in c.on')).toBe('No cleanup is on an owner.');
    expect(means('no c: Cleanup | some o: Owner | o in c.on')).toBe('(no v_1: Cleanup | (some v_2: Owner | v_1->v_2 in on))');
  });

  /**
   * @canon spec-a-relative-clause-says-more-of-the-noun-it-follows
   */
  it('lets a relative clause say more of the noun it follows, and stand last', () => {
    expect(say('some o: Owner | o in c.on and o in Disposed')).toBe('c is on an owner that pulse has disposed.');
    expect(means('some o: Owner | o in c.on and o in Disposed')).toBe('(some v_1: Owner | (v_1 in Disposed) and (c->v_1 in on))');
  });

  /**
   * @canon spec-the-noun-alone-names-the-one-thing-of-its-kind
   */
  it('names the one thing of its kind by its noun, and two of a kind by their numbers', () => {
    expect(say('all c: Cleanup | c in Ran')).toBe('For every cleanup:\n  the cleanup has run.');
    expect(say('all c, d: Cleanup | c in Ran implies d in Ran')).toBe('For every cleanup_1 and every cleanup_2:\n  when cleanup_1 has run, cleanup_2 has run.');
  });

  /**
   * @canon spec-now-is-the-moment-a-statement-is-read-at
   */
  it('reads "now" below a time phrase at each moment the phrase picks', () => {
    expect(say('always (c in Ran implies eventually o in Disposed)')).toBe('From now on:\n  when c has run, then now or later, pulse has disposed o.');
  });

  /**
   * @canon spec-a-time-phrase-covers-the-rest-of-its-sentence
   */
  it('lets a time phrase cover the rest of its sentence, or the lines below its colon', () => {
    expect(say('always (c in Ran implies after c in Registered)')).toBe('From now on, whenever c has run, then at the next moment, code has registered c.');
    expect(say('after (c in Ran and c in Registered)')).toBe('At the next moment, all of these hold:\n  - c has run\n  - code has registered c');
  });

  /**
   * @canon spec-until-then-stops-before-its-moment
   */
  it('says until of two clauses as "until then"', () => {
    expect(say('c in Registered until o in Disposed')).toBe('Pulse has disposed o now or later, and until then, code has registered c.');
  });

  /**
   * @canon spec-the-bullets-below-a-colon-are-the-parts-of-its-line
   */
  it('says the parts of a line as bullets below its colon', () => {
    expect(say('c in Ran and c in Registered and o in Disposed and o in Stopped')).toBe(
      'All of these hold:\n  - c has run\n  - code has registered c\n  - pulse has disposed o\n  - the dispose of o has been stopped'
    );
  });

  /**
   * @canon spec-a-sentence-joins-its-clauses-with-and-or-with-or-never-both
   */
  it('never joins clauses with "and" and "or" in one sentence', () => {
    expect(say('c in Ran or (c in Registered and o in Disposed)')).toBe('At least one of these holds:\n  - c has run\n  - code has registered c and pulse has disposed o');
  });

  /**
   * @canon spec-exactly-when-goes-both-ways-and-when-goes-one
   */
  it('says an equivalence with "exactly when" and a rule with "when"', () => {
    expect(say('c in Ran iff o in Disposed')).toBe('c has run exactly when pulse has disposed o.');
    expect(say('c in Ran implies o in Disposed')).toBe('When c has run, pulse has disposed o.');
  });
});
