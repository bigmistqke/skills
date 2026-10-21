/** `WORDINGS.md` says what the passes do as they now stand. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FILE, wordings } from './wordings.ts';

describe('WORDINGS.md', () => {
  it('is what the passes and the sweep make of it', () => {
    expect(readFileSync(FILE, 'utf8')).toBe(wordings());
  }, 600_000);
});
