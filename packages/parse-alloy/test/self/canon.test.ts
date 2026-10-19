/**
 * The canon of parse-alloy: the checker passes it. This file tests the
 * package's own canon, not a claim of it, so it carries no `@canon` tag.
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLI = join(dirname(createRequire(import.meta.url).resolve('@bigmistqke/canon/package.json')), 'dist', 'cli.js');

describe('the canon of parse-alloy', () => {
  it('passes the check of the checker', () => {
    const run = spawnSync(process.execPath, [CLI, 'check', '--offline'], { cwd: PACKAGE, encoding: 'utf8' });
    expect(run.stdout).toMatch(/^clean$/m);
    expect(run.status).toBe(0);
  });
});
