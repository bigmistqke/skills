/**
 * What the checker does when the verbalizer fails with a fault of its own, and not with a refusal.
 */
import { describe, expect, it, vi } from 'vitest';
import { states, write } from '../../src/statements.ts';

/** A formula the verbalizer below fails on with a fault, as a loop that never ends would. */
const FAULTY = 'always all n: Node | n in Faulty';

vi.mock('@bigmistqke/naturalloy', async original => {
  const actual = await original<typeof import('@bigmistqke/naturalloy')>();
  return {
    ...actual,
    verbalize: (source: string, ...rest: Parameters<typeof actual.verbalize> extends [string, ...infer R] ? R : never) => {
      if (source.trim() === FAULTY) throw new RangeError('Maximum call stack size exceeded');
      return actual.verbalize(source, ...rest);
    }
  };
});

/** The tag of an axiom, spelled apart so the checker does not read this file's templates as citations. */
const AXIOM = ['@', 'axiom'].join('');

/** A document of one unit with a predicate. */
const doc = (predicate: string): string => `# Canon

## ${AXIOM} a-root

> A root.

\`\`\`alloy vocabulary
sig Node {}
var sig Started, Faulty, Done in Node {}
\`\`\`

\`\`\`readings
noun Node: node
Started: {1} has started | {1} has not started
Faulty: {1} is faulty | {1} is not faulty
Done: {1} is done | {1} is not done
\`\`\`

### @spec a-leaf

\`\`\`alloy
${predicate}
\`\`\`
`;

describe('a fault of the verbalizer', () => {
  /**
   * @canon spec-a-fault-of-the-verbalizer-fails-the-run-and-is-not-explained-as-unsayable
   */
  it('is thrown on, not reported as a formula that cannot be said', () => {
    expect(() => states(doc(FAULTY))).toThrow(RangeError);
    expect(() => write(doc(FAULTY))).toThrow(RangeError);
  });

  /**
   * @canon spec-a-fault-of-the-verbalizer-fails-the-run-and-is-not-explained-as-unsayable
   */
  it('leaves a refusal reported as a formula that cannot be said', () => {
    expect(states(doc('always all n: Node | n in Mystery'))).toMatchObject([{ kind: 'unsayable', message: 'no reading for "Mystery"' }]);
  });
});
