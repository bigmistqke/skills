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
import { checkWords } from './words.ts';

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), '..');
const CANON = readFileSync(join(PACKAGE, 'CANON.md'), 'utf8');

describe('the canon of the checker', () => {
  const units = readUnits(CANON);
  const kinds = (kind: string): number => units.filter(u => u.kind === kind).length;

  it('has the units it had in the controlled English it was written in', () => {
    // The conversion lost no unit: the canon only grows from the 122 units it began with.
    expect(units.length).toBeGreaterThanOrEqual(122);
    const [terms, axioms, specs, bugs] = [kinds('term'), kinds('axiom'), kinds('spec'), kinds('bug')];
    expect([terms >= 73, axioms >= 3, specs >= 40, bugs >= 6]).toEqual([true, true, true, true]);
  });

  it('has the statement of every claim and every defined word written from its predicate', () => {
    const all = states(CANON);
    expect(all.filter(s => s.kind !== 'current')).toEqual([]);
    // the 3 axioms and 40 specs it began with, and the 13 terms that define a word
    expect(all.length).toBeGreaterThanOrEqual(56);
    expect(write(CANON)).toEqual({ src: CANON, written: [] });
  });

  it('links the words of every statement to the terms that say them, and never a statement to its own unit', () => {
    const statements = new Map(units.map(u => [u.id, u.statement ?? '']));
    expect(statements.get('term-unfounded')).toContain('[cites](#term-cite)');
    expect(statements.get('term-unfounded')).toContain('[spec](#term-spec)');
    expect(statements.get('spec-a-spec-cites-an-axiom-or-a-spec')).toContain('[checker](#term-checker) reports a [freelancing](#term-freelancing)');
    // the statements of units; a scenario has a statement of its own, which no unit holds
    const generated = states(CANON).map(s => s.unit).filter(id => statements.has(id));
    for (const id of generated) expect(statements.get(id)).not.toContain(`(#${id})`);
    // every link of a statement leads to a term that the document declares
    const terms = new Set(units.filter(u => u.kind === 'term').map(u => u.id));
    for (const id of generated) for (const [, target] of (statements.get(id) ?? '').matchAll(/\]\(#([\w-]+)\)/g)) expect(terms.has(target as string)).toBe(true);
  });

  it('keeps the bugs as prose, since a bug states what the code does wrong, which the specs forbid', () => {
    const logic = new Set(readBlocks(CANON).filter(b => b.lang === 'alloy' && b.role === 'unit').map(b => b.unit));
    for (const bug of units.filter(u => u.kind === 'bug')) expect(logic.has(bug.id)).toBe(false);
  });

  it('gives every name a claim uses words, and every word a body or a declaration', () => {
    expect(readingsOf(CANON)).toBeDefined();
    expect(checkWords(CANON)).toEqual([]);
  });

  it('passes the check of the checker', () => {
    const run = spawnSync(process.execPath, [join(PACKAGE, 'src', 'cli.ts'), 'check', '--offline'], { cwd: PACKAGE, encoding: 'utf8' });
    expect(run.stdout).toMatch(/^units: \d+$/m);
    expect(run.stdout).toMatch(/^clean$/m);
    expect(run.status).toBe(0);
  });
});
