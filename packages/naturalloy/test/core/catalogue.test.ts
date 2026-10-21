/** The passes, each named and each stating where in the canon of naturalloy its spec stands. */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PASSES } from '../../src/core/passes/index.ts';

const CANON = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'CANON.md'), 'utf8');

describe('the passes', () => {
  it('each have a name of their own and a spec the canon holds', () => {
    expect(new Set(PASSES.map(p => p.name)).size).toBe(PASSES.length);
    expect(PASSES.filter(p => !CANON.includes(`@spec ${p.spec.replace(/^spec-/, '')}\n`))).toEqual([]);
  });
});
