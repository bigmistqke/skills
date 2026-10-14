/**
 * The Alloy backend, on the lifetimes fixture. It needs an Alloy jar and a Java
 * 17 or later: set CANON_ALLOY_JAR, and CANON_JAVA when `java` is older.
 * This file tests the checker's own tooling, not a project's canon, so it carries no `@canon` tag.
 */
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { alloyProgram, checkAlloy, predicateName } from './alloy.ts';

const LIFETIMES = readFileSync(new URL('../fixtures/lifetimes/CANON.md', import.meta.url), 'utf8');

/** The document with a scenario added to the unit with this stem; a scenario may sit on any unit. */
const withScenario = (src: string, stem: string, scenario: string): string =>
  src.replace(`### @spec ${stem}\n`, `### @spec ${stem}\n\n\`\`\`alloy scenario\n${scenario}\n\`\`\`\n`);

/** What a failing cleanup of a disposed owner does, written as a scenario: it runs while its owner is disposed, and then `after` happens. */
const failing = (after: string): string =>
  `some o, h: Owner, c: Failing | o.handler = h and eventually (dispose[o] and c.on = o and eventually (runNow[c] and ${after}))`;

describe('the program of a document', () => {
  const { program, units } = alloyProgram(LIFETIMES);

  it('names a predicate after each unit that holds a bare formula, and leaves the bounds out of the program', () => {
    expect(units).toContain('spec-a-disposed-owner-cannot-be-entered');
    expect(program).toContain(`pred ${predicateName('spec-a-disposed-owner-cannot-be-entered')} {`);
    expect(program).not.toMatch(/^for 3 but/m);
  });

  it('runs the units with each scenario, and without each unit', () => {
    expect(program).toContain(`run scenario_1_term_teardown_model_without_${predicateName('spec-dispose-runs-once')} {`);
    expect(program).toMatch(/^run consistent \{.*\} for 3 but 1\.\.8 steps$/m);
  });
});

describe.skipIf(!process.env.CANON_ALLOY_JAR)('the check', () => {
  // The analyzer is run to completion, which blocks this thread. The test runner answers its messages only when the event loop turns, so let it turn between tests.
  afterEach(() => new Promise(resolve => setTimeout(resolve, 0)));

  const REPORTED_STEM = 'a-throwing-owner-cleanup-is-reported';
  const REPORTED = `spec-${REPORTED_STEM}`;

  it('allows the scenario of the example: a failing cleanup runs while its owner is disposed, and its error reaches the nearest handler', { timeout: 120_000 }, () => {
    expect(checkAlloy(LIFETIMES)).toMatchObject({ ok: true });
  });

  it('names the two specs that keep a scenario from happening when a spec contradicts another', { timeout: 120_000 }, () => {
    const contradicting = `${LIFETIMES}
### @spec a-disposed-owner-can-be-entered

\`\`\`alloy
always all o: Owner | (enter[o] and o in Disposed) implies no Throwing'
\`\`\`
`;
    const result = checkAlloy(withScenario(contradicting, 'a-disposed-owner-can-be-entered', 'eventually some o: Owner | enter[o] and o in Disposed'));
    expect(result).toMatchObject({ ok: false });
    expect('failures' in result && result.failures.map(f => f.conflict.sort())).toEqual([
      ['spec-a-disposed-owner-can-be-entered', 'spec-a-disposed-owner-cannot-be-entered']
    ]);
  });

  // One scenario on each of several units, so that one run of the analyzer answers for all of them, and the unit that holds a scenario says which it was.
  // The scenarios are split into runs of three: the analyzer blocks while it works, and a long block starves the test runner.
  const answers = (scenarios: [stem: string, scenario: string][]): unknown => {
    // None of the scenarios takes more than five events, and fewer steps make the analyzer prove that something cannot happen much sooner.
    const shorter = LIFETIMES.replace('for 3 but 1..8 steps', 'for 3 but 1..6 steps');
    const result = checkAlloy(scenarios.reduce((src, [stem, scenario]) => withScenario(src, stem, scenario), shorter));
    expect(result).toMatchObject({ ok: false });
    return 'failures' in result && Object.fromEntries(result.failures.map(f => [f.unit, f.conflict]));
  };
  const ALONE = (stem: string): [string, string[]] => [`spec-${stem}`, [`spec-${stem}`]];

  it('shows that each of the first three specs alone keeps out what it is written to keep out', { timeout: 120_000 }, () => {
    expect(
      answers([
        ['disposing-an-owner-runs-its-cleanups', 'some o: Owner, c: Cleanup | eventually (dispose[o] and c.on = o and c not in Ran and always c not in Ran)'],
        ['dispose-runs-once', 'eventually some c: Cleanup, o: Owner | runByCall[c, o]'],
        ['owner-cleanups-run-newest-first-and-in-isolation', 'some o: Owner, c, d: Cleanup | eventually (dispose[o] and c.on = o and d.on = o and c->d in Clock.older and c not in Ran and d not in Ran and eventually (runNow[c] and d not in Ran))']
      ])
    ).toEqual(Object.fromEntries(['disposing-an-owner-runs-its-cleanups', 'dispose-runs-once', 'owner-cleanups-run-newest-first-and-in-isolation'].map(ALONE)));
  });

  it('shows that each of the halves that say "nothing throws", "in isolation" and "newest first" alone keeps out what it is written to keep out', { timeout: 120_000 }, () => {
    expect(
      answers([
        ['dispose-runs-once', 'eventually some o: Owner | throwByCall[o]'],
        ['owner-cleanups-run-newest-first-and-in-isolation', 'some o: Owner, c: Failing | eventually (dispose[o] and c.on = o and eventually (runNow[c] and eventually o in Stopped))'],
        ['an-owner-disposes-its-sub-owners-before-its-own-cleanups', 'some o, j, k: Owner | j->k in Birth.order and j.parent = o and k.parent = o and eventually (dispose[o] and j not in Disposed and k not in Disposed and eventually (dispose[j] and k not in Disposed))']
      ])
    ).toEqual(Object.fromEntries(['dispose-runs-once', 'owner-cleanups-run-newest-first-and-in-isolation', 'an-owner-disposes-its-sub-owners-before-its-own-cleanups'].map(ALONE)));
  });

  it('shows that the spec on entering a disposed owner and the spec on sub-owners keep out what they are written to, and that pulse may run a cleanup of an owner it disposed', { timeout: 120_000 }, () => {
    expect(
      answers([
        ['a-disposed-owner-cannot-be-entered', "eventually some o: Owner | enter[o] and o in Disposed and no Throwing'"],
        ['an-owner-disposes-its-sub-owners-before-its-own-cleanups', 'some o, k: Owner, c: Cleanup | k.parent = o and eventually (dispose[o] and c.on = o and c not in Ran and k not in Disposed and eventually (runNow[c] and k not in Disposed))'],
        // nothing keeps this from happening, so it is not listed
        ['disposing-an-owner-runs-its-cleanups', 'some o: Owner, c: Cleanup | eventually (dispose[o] and c.on = o and c not in Ran and eventually runIt[c])']
      ])
    ).toEqual(Object.fromEntries(['a-disposed-owner-cannot-be-entered', 'an-owner-disposes-its-sub-owners-before-its-own-cleanups'].map(ALONE)));
  });

  it('shows that the reported-failure spec alone keeps a failing cleanup of a disposed owner from making a dispose throw, from going unreported and from reaching the wrong handler', { timeout: 120_000 }, () => {
    expect(
      answers([
        ['dispose-runs-once', failing('eventually o in Threw')],
        ['a-disposed-owner-cannot-be-entered', failing('always no c.reached')],
        ['disposing-an-owner-runs-its-cleanups', failing('eventually (some g: Owner | c.reached = g and g != h)')]
      ])
    ).toEqual({
      'spec-dispose-runs-once': [REPORTED],
      'spec-a-disposed-owner-cannot-be-entered': [REPORTED],
      'spec-disposing-an-owner-runs-its-cleanups': [REPORTED]
    });
  });

  it('shows that the reported-failure spec alone keeps a dispose from throwing when no handler is above the owner, and allows the error to reach the nearest handler', { timeout: 120_000 }, () => {
    expect(
      answers([
        [REPORTED_STEM, 'some o: Owner, c: Failing | no o.handler and eventually (dispose[o] and c.on = o and eventually (runNow[c] and eventually o in Threw))'],
        // nothing keeps this from happening, so it is not listed
        ['owner-cleanups-run-newest-first-and-in-isolation', failing('eventually c.reached = h')]
      ])
    ).toEqual({ [REPORTED]: [REPORTED] });
  });
});
