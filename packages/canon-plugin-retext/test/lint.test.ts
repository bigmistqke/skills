/**
 * The prose checks, run through the plugin the way the checker runs it.
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { plugin } from '../src/index.ts';

const DIRS: string[] = [];
afterEach(() => {
  for (const dir of DIRS.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A sentence of 30 words, which the check reports. */
const LONG = `${Array.from({ length: 29 }, () => 'word').join(' ')} end.`;

/** Run the lint command over `text` as the only document of a project; the exit code. */
async function lint(text: string, silence = true): Promise<number> {
  const root = mkdtempSync(join(tmpdir(), 'canon-lint-'));
  DIRS.push(root);
  writeFileSync(join(root, 'CANON.md'), text);
  const log = console.log;
  if (silence) console.log = () => {};
  try {
    return await plugin.commands.lint!({ args: [], root, documents: ['CANON.md'], config: undefined, options: {} });
  } finally {
    console.log = log;
  }
}

describe('the lint command', () => {
  it('reports a sentence over 25 words', async () => {
    expect(await lint(`# Canon\n\n${LONG}\n`)).toBe(1);
  });

  it('passes a document whose sentences are short', async () => {
    expect(await lint('# Canon\n\nA program means one thing.\n')).toBe(0);
  });

  it('passes a document that names the request of a change', async () => {
    expect(await lint('# Canon\n\nThe request sets the scope of a change.\n')).toBe(0);
  });
});
