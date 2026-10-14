/**
 * The Alloy backend, on the lifetimes fixture. It needs an Alloy jar and a Java
 * 17 or later: set CANON_ALLOY_JAR, and CANON_JAVA when `java` is older.
 * This file tests the checker's own tooling, not a project's canon, so it carries no `@canon` tag.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { alloyProgram, checkAlloy, predicateName } from './alloy.ts';
import { LIFETIMES, withScenario } from './alloy.support.ts';

describe('the program of a document', () => {
  const { program, units } = alloyProgram(LIFETIMES);

  it('names a predicate after each unit that holds a bare formula, and leaves the bounds out of the program', () => {
    expect(units).toContain('spec-a-disposed-owner-cannot-be-entered');
    expect(program).toContain(`pred ${predicateName('spec-a-disposed-owner-cannot-be-entered')} {`);
    expect(program).not.toMatch(/^for 3 but/m);
  });

  it('leaves a unit that holds only definitions out of the claims, and keeps its definitions in the model', () => {
    const src = `# Canon

## @term orphan

\`\`\`alloy
sig Node {}
pred orphan[n: Node] { no m: Node | m != n }
\`\`\`

## @axiom a-node-exists

\`\`\`alloy
some Node
\`\`\`
`;
    const { program, units } = alloyProgram(src);
    expect(units).toEqual(['axiom-a-node-exists']);
    expect(program).toContain('pred orphan[n: Node]');
    expect(program).not.toContain('term_orphan');
  });

  it('asks first only whether the scenarios can happen, and leaves the units out afterwards', () => {
    const asked = alloyProgram(LIFETIMES, 'check').program;
    expect(asked).toMatch(/^run consistent \{/m);
    expect(asked).toMatch(/^run scenario_1_term_teardown_model_with_all \{/m);
    expect(asked).not.toContain('_without_');
    const blame = alloyProgram(LIFETIMES, 'blame', { scenarios: ['scenario_1_term_teardown_model'], leave: ['spec-dispose-runs-once'] }).program;
    expect(blame).not.toMatch(/^run consistent/m);
    expect(blame.match(/^run .*_without_/gm)).toHaveLength(1);
  });

  it('leaves out only the units asked about, for each scenario by the unit that holds it', () => {
    const blame = alloyProgram(LIFETIMES, 'blame', { leave: { 'term-teardown-model': ['spec-dispose-runs-once', 'spec-a-disposed-owner-cannot-be-entered'] } }).program;
    expect(blame.match(/^run .*_without_/gm)).toHaveLength(2);
  });

  it('runs the units with each scenario, and without each unit', () => {
    expect(program).toContain(`run scenario_1_term_teardown_model_without_${predicateName('spec-dispose-runs-once')} {`);
    expect(program).toMatch(/^run consistent \{.*\} for 3 but 1\.\.8 steps$/m);
  });
});

describe.skipIf(!process.env.CANON_ALLOY_JAR)('the check', () => {
  // The analyzer is run to completion, which blocks this thread. The test runner answers its messages only when the event loop turns, so let it turn between tests.
  afterEach(() => new Promise(resolve => setTimeout(resolve, 0)));

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
});
