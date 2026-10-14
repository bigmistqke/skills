/**
 * The documents a canon document extends. Its frontmatter lists their paths,
 * each read from the folder of the document that lists it, as a link in the
 * document would be. An extended document is context: its units and its words
 * are read with the document, and it is checked where it lives. A path that
 * names no document, or an extension that leads back to a document already on
 * the way, is refused, so that a canon the checker cannot read in full does not
 * pass as one it has read.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { readFrontmatter } from './frontmatter.ts';

/** The documents a document lists, as absolute paths. Throws when a path names no document. */
export function extendedBy(file: string, root: string): string[] {
  const paths = readFrontmatter(readFileSync(file, 'utf8'), true)?.extends ?? [];
  return paths.map(path => {
    const target = resolve(dirname(file), path);
    if (!existsSync(target)) throw new Error(`${relative(root, file)}: the path "${path}" names no document`);
    return target;
  });
}

/**
 * Every document a document extends, directly and through the documents they
 * extend, nearest first and each once. Throws when a path names no document,
 * and when an extension leads back to a document on the way to it.
 */
export function contextOf(file: string, root: string): string[] {
  const found: string[] = [];
  const walk = (current: string, trail: string[]): void => {
    for (const next of extendedBy(current, root)) {
      if (trail.includes(next)) {
        throw new Error(`the extension leads back: ${[...trail, next].map(path => relative(root, path)).join(' → ')}`);
      }
      if (!found.includes(next)) found.push(next);
      walk(next, [...trail, next]);
    }
  };
  walk(file, [file]);
  return found;
}
