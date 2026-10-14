/**
 * Which calls the checker reads as tests: only a call that a runner of the
 * project declares a test with. A hook, a fixture, a call with no body, a call
 * inside a test, and a call of a name the module declares itself are none.
 */
import { describe, expect, it } from 'vitest';
import { canon, check, tagged } from './project.ts';

const LEAF = `
### @spec a-leaf-says-one-thing

> A leaf says one thing.
`;

/** A declared suite: one tagged test, and `rest` after it. */
const suite = (rest: string): string => `${tagged('spec-a-leaf-says-one-thing')}${rest}`;

describe('a call that declares no test', () => {
  /**
   * @canon spec-a-member-no-runner-names-is-no-test
   */
  it('reports no uncitation for a hook or a fixture', () => {
    const rest = `test.beforeEach(() => {});\nconst fixtures = test.extend({ page: async ({}, use) => use(1) });\ntest.describe('a group', () => {});\n`;
    expect(check(canon(LEAF), suite(rest))['uncited']).toBeUndefined();
  });

  /**
   * @canon spec-a-call-with-no-body-is-no-test
   */
  it('reports no uncitation for a call with no function after its first argument', () => {
    const rest = `it.todo('later');\ntest.skip(process.env.CI !== undefined, 'not on CI');\n`;
    expect(check(canon(LEAF), suite(rest))['uncited']).toBeUndefined();
  });

  /**
   * @canon spec-a-call-inside-a-test-is-no-test
   */
  it('reports no uncitation for a call inside the body of a test', () => {
    const tag = ['@', 'canon'].join('');
    const tests = `/**\n * ${tag} spec-a-leaf-says-one-thing\n */\nit('checks one thing', () => {\n  it('looks like a test', () => {});\n});\n`;
    expect(check(canon(LEAF), tests)['uncited']).toBeUndefined();
  });

  /**
   * @canon spec-a-name-the-module-declares-is-no-runner
   */
  it('reports no uncitation for a call of a name the module declares itself', () => {
    const rest = `function test(label: string, run: () => void): void {}\ntest('a check of its own', () => {});\n`;
    expect(check(canon(LEAF), suite(rest))['uncited']).toBeUndefined();
  });
});

describe('the setting runners', () => {
  /**
   * @canon spec-a-runner-set-in-the-settings-replaces-the-presets
   */
  it('reads no test through a modifier of a runner the project does not list', () => {
    const rest = `test.fail('fails on purpose', () => {});\n`;
    expect(check(canon(LEAF), suite(rest), { settings: { runners: ['vitest'] } })['uncited']).toBeUndefined();
    expect(check(canon(LEAF), suite(rest), { settings: { runners: ['playwright'] } })['uncited']).toBe(1);
  });

  /**
   * @canon spec-a-runner-written-as-a-map-adds-its-calls
   */
  it('reads a call that a runner written as a map lists as a test', () => {
    const rest = `specify('a check in the style of mocha', () => {});\n`;
    const settings = { runners: ['vitest', { calls: ['specify'], modifiers: ['only'], fails: [] }] };
    expect(check(canon(LEAF), suite(rest), { settings })['uncited']).toBe(1);
  });

  /**
   * @canon spec-a-failure-modifier-of-a-runner-marks-an-expected-failure
   */
  it('reads a test marked with the failure modifier of a runner as an expected failure', () => {
    const tests = tagged('spec-a-leaf-says-one-thing', 'test.failing');
    expect(check(canon(LEAF), tests, { settings: { runners: ['jest'] } })['fails-without-bug']).toBe(1);
  });
});
