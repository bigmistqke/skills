/**
 * Which spec of the lifetimes example alone keeps out what it is written to keep
 * out. It needs an Alloy jar and a Java 17 or later: set CANON_ALLOY_JAR, and
 * CANON_JAVA when `java` is older. This file is apart from the others so that the
 * test runner can run it beside them. It tests the checker's own tooling, not a
 * project's canon, so it carries no `@canon` tag.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { alone, answers } from './alloy.support.ts';

describe.skipIf(!process.env.CANON_ALLOY_JAR)('the check', () => {
  // The analyzer is run to completion, which blocks this thread. The test runner answers its messages only when the event loop turns, so let it turn between tests.
  afterEach(() => new Promise(resolve => setTimeout(resolve, 0)));

  it('shows that each of the first three specs alone keeps out what it is written to keep out', { timeout: 120_000 }, () => {
    expect(
      answers([
        ['disposing-an-owner-runs-its-cleanups', 'some o: Owner, c: Cleanup | eventually (dispose[o] and c.on = o and c not in Ran and always c not in Ran)'],
        ['dispose-runs-once', 'eventually some c: Cleanup, o: Owner | runByCall[c, o]'],
        ['owner-cleanups-run-newest-first-and-in-isolation', 'some o: Owner, c, d: Cleanup | eventually (dispose[o] and c.on = o and d.on = o and c->d in Clock.older and c not in Ran and d not in Ran and eventually (runNow[c] and d not in Ran))']
      ])
    ).toEqual(Object.fromEntries(['disposing-an-owner-runs-its-cleanups', 'dispose-runs-once', 'owner-cleanups-run-newest-first-and-in-isolation'].map(alone)));
  });

  it('shows that each of the halves that say "nothing throws", "in isolation" and "newest first" alone keeps out what it is written to keep out', { timeout: 120_000 }, () => {
    expect(
      answers([
        ['dispose-runs-once', 'eventually some o: Owner | throwByCall[o]'],
        ['owner-cleanups-run-newest-first-and-in-isolation', 'some o: Owner, c: Failing | eventually (dispose[o] and c.on = o and eventually (runNow[c] and eventually o in Stopped))'],
        ['an-owner-disposes-its-sub-owners-before-its-own-cleanups', 'some o, j, k: Owner | j->k in Birth.order and j.parent = o and k.parent = o and eventually (dispose[o] and j not in Disposed and k not in Disposed and eventually (dispose[j] and k not in Disposed))']
      ])
    ).toEqual(Object.fromEntries(['dispose-runs-once', 'owner-cleanups-run-newest-first-and-in-isolation', 'an-owner-disposes-its-sub-owners-before-its-own-cleanups'].map(alone)));
  });

  it('shows that the spec on entering a disposed owner and the spec on sub-owners keep out what they are written to, and that pulse may run a cleanup of an owner it disposed', { timeout: 120_000 }, () => {
    expect(
      answers([
        ['a-disposed-owner-cannot-be-entered', "eventually some o: Owner | enter[o] and o in Disposed and no Throwing'"],
        ['an-owner-disposes-its-sub-owners-before-its-own-cleanups', 'some o, k: Owner, c: Cleanup | k.parent = o and eventually (dispose[o] and c.on = o and c not in Ran and k not in Disposed and eventually (runNow[c] and k not in Disposed))'],
        // nothing keeps this from happening, so it is not listed
        ['disposing-an-owner-runs-its-cleanups', 'some o: Owner, c: Cleanup | eventually (dispose[o] and c.on = o and c not in Ran and eventually runIt[c])']
      ])
    ).toEqual(Object.fromEntries(['a-disposed-owner-cannot-be-entered', 'an-owner-disposes-its-sub-owners-before-its-own-cleanups'].map(alone)));
  });
});
