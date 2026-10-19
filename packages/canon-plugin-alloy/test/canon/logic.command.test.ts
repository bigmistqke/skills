/**
 * The `logic` command over a small project: what it prints and the code it
 * exits with. It needs an Alloy jar and a Java 17 or later: set CANON_ALLOY_JAR,
 * and CANON_JAVA when `java` is older.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { CLI, install, named } from './cli.ts';

const AXIOM = ['@', 'axiom'].join('');
const DIRS: string[] = [];
afterEach(() => {
  for (const dir of DIRS.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** Two axioms about apples and pears, with `extra` added to the end. */
const doc = (extra = ''): string => `# Canon

## @term apple

\`\`\`alloy bounds
for 3
\`\`\`

\`\`\`alloy vocabulary
sig Apple {}
sig Ripe in Apple {}
\`\`\`

\`\`\`readings
noun Apple: apple
Ripe: {1} is ripe | {1} is not ripe
\`\`\`

## @term pear

\`\`\`alloy vocabulary
sig Pear {}
sig Sweet in Pear {}
\`\`\`

\`\`\`readings
noun Pear: pear
Sweet: {1} is sweet | {1} is not sweet
\`\`\`

## ${AXIOM} an-apple-is-ripe

\`\`\`alloy
all a: Apple | a in Ripe
\`\`\`

## ${AXIOM} a-pear-is-sweet

\`\`\`alloy
all p: Pear | p in Sweet
\`\`\`
${extra}`;

/** A project of the document, whose statements `generate` writes; what `logic` printed and its code, with the analyzer where the environment has it, or without. */
function logic(document: string, withAnalyzer = true) {
  const dir = mkdtempSync(join(tmpdir(), 'canon-logic-'));
  DIRS.push(dir);
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ canon: { documents: ['CANON.md'], suites: 'test/canon', sources: ['test'], command: 'canon' } }));
  install(dir);
  writeFileSync(join(dir, 'CANON.md'), named(document));
  spawnSync(process.execPath, [CLI, 'generate'], { cwd: dir });
  const env = withAnalyzer ? process.env : { ...process.env, CANON_ALLOY_JAR: '' };
  const run = spawnSync(process.execPath, [CLI, 'logic'], { cwd: dir, encoding: 'utf8', env });
  return { out: run.stdout, err: run.stderr, code: run.status };
}

describe.skipIf(!process.env.CANON_ALLOY_JAR)('the logic command', () => {
  afterEach(() => new Promise(resolve => setTimeout(resolve, 0)));

  /**
   * @canon spec-logic-succeeds-when-nothing-is-reported
   */
  it('succeeds for a canon whose units hold together, and says how many it checked', { timeout: 600_000 }, () => {
    const { out, code } = logic(doc());
    expect(out).toContain('CANON.md: 2 units, 0 scenarios');
    expect(code).toBe(0);
  });

  /**
   * @canon spec-a-reported-scenario-or-contradiction-fails-logic
   * @canon spec-a-scenario-that-cannot-happen-while-every-unit-holds-is-reported
   */
  it('fails when a scenario cannot happen, and names the unit that holds it and the units to change', { timeout: 600_000 }, () => {
    const { out, code } = logic(doc('\n```alloy scenario\nsome a: Apple | a not in Ripe\n```\n'));
    expect(out).toContain('the scenario of axiom-a-pear-is-sweet cannot happen while every unit holds');
    expect(code).toBe(1);
  });

  /**
   * @canon spec-a-reported-scenario-or-contradiction-fails-logic
   * @canon spec-units-that-cannot-all-hold-are-named
   */
  it('fails when the units contradict each other, and names them', { timeout: 600_000 }, () => {
    const { out, code } = logic(doc('\n## @axiom an-apple-is-unripe\n\n```alloy\nsome a: Apple | a not in Ripe\n```\n'.replace('@axiom', AXIOM)));
    expect(out).toContain('the units contradict each other in every trace within the bounds');
    expect(out).toContain('axiom-an-apple-is-ripe');
    expect(out).toContain('axiom-an-apple-is-unripe');
    expect(out).not.toContain('axiom-a-pear-is-sweet');
    expect(code).toBe(1);
  });
});

describe('the logic command without the analyzer', () => {
  /**
   * @canon spec-logic-stops-when-the-analyzer-cannot-run
   */
  it('stops with code 2 and says that the analyzer did not run', () => {
    const { err, code } = logic(doc(), false);
    expect(err).toContain('the Alloy analyzer did not run');
    expect(code).toBe(2);
  });
});
