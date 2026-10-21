/** The region of each pass in the canon says what the pass does as it now stands. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FILE, withRegions } from './wordings.ts';

describe('the regions of the passes in the canon', () => {
  it('are what the passes and the sweep make of them', () => {
    const canon = readFileSync(FILE, 'utf8');
    expect(canon).toBe(withRegions(canon));
  }, 600_000);
});
