/**
 * The formulas of a document that keeps readings that are lone on a signature:
 * they use a signature that no other unit and no scenario names, so nothing can
 * contradict them.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkLoneFormulas } from '../../src/words.ts';
import { CLI, install, named } from './cli.ts';

/** The tag of a spec, spelled apart so the checker does not read this file's templates as citations. */
const SPEC = ['@', 'spec'].join('');

const DIRS: string[] = [];
afterEach(() => {
  for (const dir of DIRS.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A term that declares a node, two sets of nodes and the words `extra` adds, then the units of `units`. */
const doc = (parts: { node?: string; reading?: string; units?: string } = {}): string => `# Canon

## @term node

\`\`\`alloy vocabulary
${parts.node ?? 'sig Node {}\nsig Done, Told in Node {}'}
\`\`\`

\`\`\`readings
${parts.reading ?? 'noun Node: node\nDone: {1} is done | {1} is not done\nTold: {1} is told | {1} is not told'}
\`\`\`
${parts.units ?? ''}`;

/** A spec whose formula is `formula`, and the blocks of `more` after it. */
const spec = (stem: string, formula: string, more = ''): string => `
## ${SPEC} ${stem}

\`\`\`alloy
${formula}
\`\`\`
${more}`;

/** Two specs: one ties `Done` to every node, the other says what is done is told, and names `Told` alone. */
const LONE = spec('every-node-is-done', 'all n: Node | n in Done') + spec('a-done-node-is-told', 'all n: Done | n in Told');

describe('a formula that is lone on a signature', () => {
  /**
   * @canon spec-a-formula-that-is-lone-on-a-signature-is-reported
   */
  it('is reported, with the signature', () => {
    expect(checkLoneFormulas(doc({ units: LONE }))).toEqual([
      { unit: 'spec-a-done-node-is-told', kind: 'lone', message: 'rests on the signature "Told", which no other unit and no scenario names, so no other formula can contradict it' }
    ]);
  });

  /**
   * @canon spec-a-signature-that-another-unit-names-keeps-a-formula-from-being-reported
   */
  it('is not reported when another claim names the signature', () => {
    expect(checkLoneFormulas(doc({ units: LONE + spec('a-told-node-is-done', 'all n: Told | n in Done') }))).toEqual([]);
  });

  /**
   * @canon spec-a-signature-that-another-unit-names-keeps-a-formula-from-being-reported
   */
  it('is not reported when a fact, the type of a field or a parent signature in a term names the signature', () => {
    const viaFact = doc({ node: 'sig Node {}\nsig Done, Told in Node {}\nfact told { some Told }', units: LONE });
    const viaField = doc({ node: 'sig Node {}\nsig Done, Told in Node {}\none sig Ask { rel: Node -> Told }', units: LONE });
    const viaParent = doc({ node: 'sig Node {}\nsig Done, Told in Node {}\nsig Loud in Told {}', units: LONE });
    for (const src of [viaFact, viaField, viaParent]) expect(checkLoneFormulas(src)).toEqual([]);
  });

  /**
   * @canon spec-a-signature-that-another-unit-names-keeps-a-formula-from-being-reported
   */
  it('is reported when the signature is named only in its own declaration', () => {
    const src = doc({ node: 'sig Node {}\nsig Done in Node {}\nsig Told in Node { by: lone Node }', units: LONE });
    expect(checkLoneFormulas(src).map(f => f.unit)).toEqual(['spec-a-done-node-is-told']);
  });

  /**
   * @canon spec-a-signature-that-a-scenario-names-keeps-a-formula-from-being-reported
   */
  it('is not reported when a scenario names the signature, even in the unit of the formula', () => {
    const src = doc({ units: spec('every-node-is-done', 'all n: Node | n in Done') + spec('a-done-node-is-told', 'all n: Done | n in Told', '\n```alloy scenario\nsome n: Node | n not in Told\n```\n') });
    expect(checkLoneFormulas(src)).toEqual([]);
  });

  /**
   * @canon spec-a-signature-that-an-extended-document-names-keeps-a-formula-from-being-reported
   */
  it('is not reported when a document it extends names the signature', () => {
    const declares = doc();
    const names = doc({ units: spec('a-told-node-is-done', 'all n: Told | n in Done') });
    const src = `# Canon\n\n## @term here\n\n\`\`\`readings\nnoun Node: node\n\`\`\`\n${LONE}`;
    expect(checkLoneFormulas(src, [declares]).map(f => f.unit)).toEqual(['spec-a-done-node-is-told']);
    expect(checkLoneFormulas(src, [names])).toEqual([]);
  });

  /**
   * @canon spec-a-formula-is-not-reported-on-a-field-or-a-predicate
   */
  it('is not reported on a field or a predicate that only it names', () => {
    const src = doc({
      node: 'sig Node { next: lone Node }\nsig Done in Node {}\npred quiet[n: Node] { n in Done }',
      reading: 'noun Node: node\nnext: {2} follows {1} | {2} does not follow {1}\nDone: {1} is done | {1} is not done\nquiet: {1} is quiet | {1} is not quiet',
      units: spec('every-node-is-done', 'all n: Node | n in Done') + spec('a-quiet-node-has-a-next', 'all n: Node | quiet[n] implies some n.next')
    });
    expect(checkLoneFormulas(src)).toEqual([]);
  });

  /**
   * @canon spec-a-term-is-not-reported-as-lone
   */
  it('is not looked for in a term', () => {
    const src = doc({ units: '\n## @term quiet\n\n```alloy\npred quiet[n: Node] { n in Told }\n```\n' });
    expect(checkLoneFormulas(src)).toEqual([]);
  });

  /**
   * @canon spec-a-document-that-keeps-no-readings-has-no-formula-reported-as-lone
   */
  it('is not looked for in a document that keeps no readings', () => {
    expect(checkLoneFormulas(doc({ reading: '', units: LONE }).replace(/```readings\n\n```\n/, ''))).toEqual([]);
  });
});

describe('where the lone check falls short', () => {
  /**
   * A signature that extends the same parent as another is disjoint from it,
   * so a formula that puts every done node in it can be contradicted.
   *
   * @canon bug-a-signature-that-its-declaration-constrains-is-reported
   */
  it.fails('does not report a formula whose signature its declaration constrains', () => {
    const src = doc({ node: 'sig Node {}\nsig Done extends Node {}\nsig Told extends Node {}', units: LONE });
    expect(checkLoneFormulas(src)).toEqual([]);
  });

  /**
   * @canon exception-a-formula-whose-other-words-can-be-contradicted-is-reported
   */
  it('reports a formula that is lone on a signature even when its other words leave it open', () => {
    const src = doc({ units: spec('every-node-is-done', 'all n: Node | n in Done') + spec('some-told-and-none-done', 'some Told and no Done') });
    expect(checkLoneFormulas(src).map(f => f.unit)).toEqual(['spec-some-told-and-none-done']);
  });

  /**
   * @canon exception-a-signature-that-something-names-without-constraining-it-keeps-a-formula-from-being-reported
   */
  it('does not report a formula whose signature only a predicate that nothing calls names', () => {
    const src = doc({ node: 'sig Node {}\nsig Done, Told in Node {}\npred quiet[n: Node] { n in Told }', units: LONE });
    expect(checkLoneFormulas(src)).toEqual([]);
  });
});

describe('the command line', () => {
  /**
   * @canon spec-a-lone-formula-fails-check
   * @canon spec-the-lone-check-reads-text-only
   */
  it('reports a lone formula in the findings of check, and fails', () => {
    const dir = mkdtempSync(join(tmpdir(), 'canon-lone-'));
    DIRS.push(dir);
    mkdirSync(join(dir, 'test', 'canon'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ canon: { documents: ['CANON.md'], suites: 'test/canon', sources: ['test'], command: 'canon' } }));
    install(dir);
    writeFileSync(join(dir, 'CANON.md'), named(doc({ units: LONE })));
    // No analyzer and no Java: the check reads text only.
    const env = { ...process.env, CANON_ALLOY_JAR: '', CANON_JAVA: '/nonexistent/java' };
    spawnSync(process.execPath, [CLI, 'generate'], { cwd: dir, env });
    const run = spawnSync(process.execPath, [CLI, 'check'], { cwd: dir, encoding: 'utf8', env });
    expect(run.stdout).toContain('CANON.md: spec-a-done-node-is-told: lone: rests on the signature "Told"');
    expect(run.status).toBe(1);
  });
});
