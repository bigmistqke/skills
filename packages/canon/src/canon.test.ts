/**
 * The canon of the checker, written in Alloy: its statements are what its
 * predicates and definitions say, and the checker passes it. This file tests
 * the checker's own tooling, not a project's canon, so it carries no `@canon` tag.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { readBlocks } from './blocks.ts';
import { readingsOf, states, write } from './statements.ts';
import { readUnits } from './units.ts';

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), '..');
const CANON = readFileSync(join(PACKAGE, 'CANON.md'), 'utf8');

describe('the canon of the checker', () => {
  const units = readUnits(CANON);
  const kinds = (kind: string): number => units.filter(u => u.kind === kind).length;

  it('has the units it had in the controlled English it was written in', () => {
    expect(units).toHaveLength(122);
    expect([kinds('term'), kinds('axiom'), kinds('spec'), kinds('bug')]).toEqual([73, 3, 40, 6]);
  });

  it('has the statement of every claim and every defined word written from its predicate', () => {
    const all = states(CANON);
    expect(all.filter(s => s.kind !== 'current')).toEqual([]);
    // 3 axioms and 40 specs, and the 13 terms that define a word
    expect(all).toHaveLength(56);
    expect(write(CANON)).toEqual({ src: CANON, written: [] });
  });

  it('keeps the bugs as prose, since a bug states what the code does wrong, which the specs forbid', () => {
    const logic = new Set(readBlocks(CANON).filter(b => b.lang === 'alloy' && b.role === 'unit').map(b => b.unit));
    for (const bug of units.filter(u => u.kind === 'bug')) expect(logic.has(bug.id)).toBe(false);
  });

  it('gives every name a claim uses words, and every word a body or a declaration', () => {
    const readings = readingsOf(CANON);
    expect(readings?.atoms.size).toBe(80);
    expect(readings?.nouns.size).toBe(21);
    expect(readings?.definitions.size).toBe(13);
  });

  it('passes the check of the checker', () => {
    const run = spawnSync(process.execPath, [join(PACKAGE, 'src', 'cli.ts'), 'check', '--offline'], { cwd: PACKAGE, encoding: 'utf8' });
    expect(run.stdout).toMatch(/^units: 122$/m);
    expect(run.stdout).toMatch(/^clean$/m);
    expect(run.status).toBe(0);
  });
});
