/**
 * The canon of the checker, asked of the Alloy analyzer: the claims hold
 * together, and each situation the canon says must be possible is. It needs an
 * Alloy jar and a Java 17 or later: set CANON_ALLOY_JAR, and CANON_JAVA when
 * `java` is older. This file tests the checker's own tooling, not a project's
 * canon, so it carries no `@canon` tag.
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { alloyProgram, checkAlloy } from './alloy.ts';

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), '..');
const CANON = readFileSync(new URL('../CANON.md', import.meta.url), 'utf8');

describe.skipIf(!process.env.CANON_ALLOY_JAR)('the canon of the checker', () => {
  // The analyzer is run to completion, which blocks this thread. The test runner answers its messages only when the event loop turns, so let it turn between tests.
  afterEach(() => new Promise(resolve => setTimeout(resolve, 0)));

  // The whole canon takes longer to solve than the test runner waits for an answer from a blocked worker, so it is solved in a process of its own, which leaves this thread free.
  it('holds together: the claims can all be true, with a clean canon, a bug kept in sight and a conflict kept in sight', { timeout: 300_000 }, async () => {
    expect(alloyProgram(CANON).units.length).toBeGreaterThanOrEqual(43);
    expect(alloyProgram(CANON).scenarios.length).toBeGreaterThanOrEqual(3);
    const run = await new Promise<{ out: string; code: number | null }>(resolve => {
      const child = spawn(process.execPath, [join(PACKAGE, 'src', 'cli.ts'), 'logic'], { cwd: PACKAGE });
      let out = '';
      child.stdout.on('data', chunk => (out += chunk));
      child.stderr.on('data', chunk => (out += chunk));
      child.on('close', code => resolve({ out, code }));
    });
    expect(run.out).toMatch(/^CANON\.md: \d+ units, \d+ scenarios$/m);
    expect(run.code).toBe(0);
  });

  it('reports a unit that follows from itself, by one spec alone, whether it cites itself or a loop leads back to it', { timeout: 120_000 }, async () => {
    const scenario = 'some u: Unit | (u->u in Derive.rel or u->u in Sit.rel or u->u in Depend.rel) and u not in Cycle';
    const only = CANON.replace(/```alloy scenario\n[\s\S]*?```\n/g, '').replace('```alloy bounds\nfor 6\n```', `\`\`\`alloy bounds\nfor 6\n\`\`\`\n\n\`\`\`alloy scenario\n${scenario}\n\`\`\``);
    const result = await checkAlloy(only, { leave: ['spec-a-unit-does-not-depend-on-itself'] });
    expect(result).toMatchObject({ ok: false });
    expect('failures' in result && result.failures.map(f => f.conflict)).toEqual([['spec-a-unit-does-not-depend-on-itself']]);
  });

  it('forbids what it says it forbids: a test that checks a refined claim is an overreach, by one spec alone', { timeout: 120_000 }, async () => {
    const scenario = 'some t: Test, c: Claim | checks[t, c] and refined[c] and t not in Overreach';
    const only = CANON.replace(/```alloy scenario\n[\s\S]*?```\n/g, '').replace('```alloy bounds\nfor 6\n```', `\`\`\`alloy bounds\nfor 6\n\`\`\`\n\n\`\`\`alloy scenario\n${scenario}\n\`\`\``);
    const result = await checkAlloy(only, { leave: ['spec-a-test-checks-only-leaves'] });
    expect(result).toMatchObject({ ok: false });
    expect('failures' in result && result.failures.map(f => f.conflict)).toEqual([['spec-a-test-checks-only-leaves']]);
  });
});
