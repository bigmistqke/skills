/**
 * The type of a plugin: what an editor offers and what the compiler refuses.
 * These checks are about the shape of the checker's own interface, not about
 * behaviour a project's canon states, so this file carries no `@canon` tag.
 */
import { describe, expect, it } from 'vitest';
import type { Plugin } from './plugin.ts';

describe('the type of a plugin', () => {
  it('offers the known commands and accepts others', () => {
    const plugin: Plugin = {
      name: 'example',
      commands: {
        lint: () => 0,
        explain: ({ args }) => args.length
      }
    };
    expect(Object.keys(plugin.commands)).toEqual(['lint', 'explain']);
  });

  it('refuses a known command that is not a function, and an unknown one that is not either', () => {
    // @ts-expect-error a command is a function
    const known: Plugin = { name: 'x', commands: { lint: 'no' } };
    // @ts-expect-error a command is a function
    const other: Plugin = { name: 'x', commands: { explain: 1 } };
    expect([known, other]).toHaveLength(2);
  });
});
