/**
 * The Alloy backend, on the lifetimes fixture. It needs an Alloy jar and a Java
 * 17 or later: set CANON_ALLOY_JAR, and CANON_JAVA when `java` is older.
 * This file tests the checker's own tooling, not a project's canon, so it carries no `@canon` tag.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { alloyProgram, checkAlloy, predicateName } from './alloy.ts';

const LIFETIMES = readFileSync(new URL('../fixtures/lifetimes/CANON.md', import.meta.url), 'utf8');
const WITHOUT_CONFLICT = LIFETIMES.replace(/### @spec a-throwing-owner-cleanup-is-reported[\s\S]*$/, '');

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
  it('allows the scenario when the reported-failure spec is left out', { timeout: 60_000 }, () => {
    expect(checkAlloy(WITHOUT_CONFLICT)).toMatchObject({ ok: true });
  });

  it('names the two specs that keep the scenario from happening, and no other', { timeout: 60_000 }, () => {
    const result = checkAlloy(LIFETIMES);
    expect(result).toMatchObject({ ok: false });
    expect('failures' in result && result.failures.map(f => [f.unit, f.conflict.sort()])).toEqual([
      ['term-teardown-model', ['spec-a-disposed-owner-cannot-be-entered', 'spec-a-throwing-owner-cleanup-is-reported']],
    ]);
  });

  it('shows that dispose-runs-once is the one spec that keeps a second disposal from running a cleanup', { timeout: 60_000 }, () => {
    const src = LIFETIMES.replace('```alloy bounds', '```alloy scenario\neventually some c: Cleanup, o: Owner | runByCall[c, o]\n```\n\n```alloy bounds');
    const result = checkAlloy(src);
    expect('failures' in result && result.failures.map(f => f.conflict)).toContainEqual(['spec-dispose-runs-once']);
  });
});
