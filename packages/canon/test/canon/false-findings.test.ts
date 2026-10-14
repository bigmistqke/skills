/**
 * What the checker does not report: a finding for what breaks no rule of the
 * canon, such as an untesting for a claim that a test checks.
 */
import { describe, expect, it } from 'vitest';
import { canon, check, tagged } from './project.ts';

const LEAF = `
### @spec a-leaf-says-one-thing

> A leaf says one thing.
`;

/** The leaf, and a bug under it. */
const BUG = `${LEAF}
#### @bug the-leaf-breaks

> The code does another thing.

Issue: #1
`;

/** A module that builds one test per case of a table, the way a suite of cases is written, and tags the test it builds. */
const MATRIX = `export function matrix(cases: string[]): void {
  for (const name of cases) {
    /**
     * ${['@', 'canon'].join('')} spec-a-leaf-says-one-thing
     */
    test(\`checks \${name}\`, () => {});
  }
}
`;

describe('a tested claim', () => {
  /**
   * @canon spec-a-claim-a-declared-test-checks-is-not-untested
   */
  it('reports no untesting for a leaf a declared test checks', () => {
    expect(check(canon(LEAF), tagged('spec-a-leaf-says-one-thing'))['untested']).toBeUndefined();
  });

  /**
   * @canon spec-a-claim-an-undeclared-test-checks-is-not-untested
   */
  it('reports no untesting for a leaf a test in an undeclared suite checks', () => {
    const files = { 'test/other/a.test.ts': tagged('spec-a-leaf-says-one-thing') };
    expect(check(canon(LEAF), '', { files })['untested']).toBeUndefined();
  });

  /**
   * @canon spec-a-claim-an-undeclared-test-checks-is-not-untested
   */
  it('reports no untesting for a leaf a test that a module of the sources builds checks', () => {
    const files = { 'test/matrix.ts': MATRIX };
    expect(check(canon(LEAF), '', { files })['untested']).toBeUndefined();
  });

  /**
   * @canon spec-a-spec-whose-bug-a-test-checks-is-not-untested
   */
  it('reports no untesting for a spec whose bug a test checks', () => {
    expect(check(canon(BUG), tagged('bug-the-leaf-breaks', 'it.fails'))['untested']).toBeUndefined();
  });
});
