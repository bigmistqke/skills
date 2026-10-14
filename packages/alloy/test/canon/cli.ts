/**
 * What the tests that run the command line of the checker share: where it is,
 * how a small project gets the plugin, and the frontmatter that names it. The
 * plugin is a package the project has installed, so each project links it.
 */
import { mkdirSync, symlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** This package. */
export const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** The package of the checker, which the plugin extends. */
export const CORE = dirname(createRequire(import.meta.url).resolve('@bigmistqke/canon/package.json'));

/** The command line of the checker, as it is built. */
export const CLI = join(CORE, 'dist', 'cli.js');

/** The frontmatter that names the plugin. */
export const NAMES_PLUGIN = '---\nplugins: ["@bigmistqke/canon-alloy"]\n---\n';

/** A document that names the plugin, unless its frontmatter names plugins already. */
export const named = (document: string): string => (document.startsWith('---') ? document : NAMES_PLUGIN + document);

/** Link the plugin into a project, as a dependency of the project would be. */
export function install(dir: string): void {
  mkdirSync(join(dir, 'node_modules', '@bigmistqke'), { recursive: true });
  symlinkSync(PACKAGE, join(dir, 'node_modules', '@bigmistqke', 'canon-alloy'), 'dir');
}
