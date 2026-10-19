/**
 * What the reported-failure spec of the lifetimes example alone keeps out. It
 * needs an Alloy jar and a Java 17 or later: set CANON_ALLOY_JAR, and CANON_JAVA
 * when `java` is older. This file is apart from the others so that the test
 * runner can run it beside them. It tests the checker's own tooling, not a
 * project's canon, so it carries no `@canon` tag.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { REPORTED, REPORTED_STEM, answers, failing } from './alloy.support.ts';

describe.skipIf(!process.env.CANON_ALLOY_JAR)('the check', () => {
  // The analyzer is run to completion, which blocks this thread. The test runner answers its messages only when the event loop turns, so let it turn between tests.
  afterEach(() => new Promise(resolve => setTimeout(resolve, 0)));

  it('shows that the reported-failure spec alone keeps a failing cleanup of a disposed owner from making a dispose throw, from going unreported and from reaching the wrong handler', { timeout: 600_000 }, async () => {
    expect(
      await answers([
        ['dispose-runs-once', failing('eventually o in Threw'), REPORTED_STEM],
        ['a-disposed-owner-cannot-be-entered', failing('always no c.reached'), REPORTED_STEM],
        ['disposing-an-owner-runs-its-cleanups', failing('eventually (some g: Owner | c.reached = g and g != h)'), REPORTED_STEM]
      ])
    ).toEqual({
      'spec-dispose-runs-once': [REPORTED],
      'spec-a-disposed-owner-cannot-be-entered': [REPORTED],
      'spec-disposing-an-owner-runs-its-cleanups': [REPORTED]
    });
  });

  it('shows that the reported-failure spec alone keeps a dispose from throwing when no handler is above the owner, and allows the error to reach the nearest handler', { timeout: 600_000 }, async () => {
    expect(
      await answers([
        [REPORTED_STEM, 'some o: Owner, c: Failing | no o.handler and eventually (dispose[o] and c.on = o and eventually (runNow[c] and eventually o in Threw))'],
        // nothing keeps this from happening, so it is not listed
        ['owner-cleanups-run-newest-first-and-in-isolation', failing('eventually c.reached = h')]
      ])
    ).toEqual({ [REPORTED]: [REPORTED] });
  });
});
