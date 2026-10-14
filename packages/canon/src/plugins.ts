/**
 * Which plugins a project has, and which documents each applies to.
 *
 * A document names its plugins in its frontmatter, each by the name of the
 * package that holds it. A document with no `plugins` key names none. A plugin
 * is a package installed in the project; it is found from the project root and
 * nowhere else, so a document can choose among what the project already
 * depends on and cannot make the tool fetch or run anything new.
 */
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { contextOf } from './extends.ts';
import { readFrontmatter } from './frontmatter.ts';
import type { Command, Plugin } from './plugin.ts';

/** The plugins a document applies: the ones it names. */
function pluginsOf(document: string, root: string): string[] {
  const file = join(root, document);
  if (!existsSync(file)) return [];
  try {
    const frontmatter = readFrontmatter(readFileSync(file, 'utf8'), true);
    contextOf(file, root);
    return frontmatter?.plugins ?? [];
  } catch (error) {
    throw new Error(`${document}: frontmatter: ${(error as Error).message}`);
  }
}

/**
 * The keys that the plugins a document names define, each by the field its
 * plugin's `config` names. A plugin that cannot be loaded defines none here;
 * the run reports it where it loads the plugins.
 */
export async function configKeysOf(document: string, root: string): Promise<string[]> {
  const keys: string[] = [];
  for (const name of pluginsOf(document, root)) {
    try {
      const { config } = await loadInstalled(name, root);
      if (config !== undefined) keys.push(config);
    } catch {
      // Reported by the run that loads it.
    }
  }
  return keys;
}

/** The documents a plugin applies to: those that name it. */
export function documentsFor(plugin: string, documents: string[], root: string): string[] {
  return documents.filter(document => pluginsOf(document, root).includes(plugin));
}

/** The plugins documents name. */
function installedPlugins(documents: string[], root: string): string[] {
  return [...new Set(documents.flatMap(document => pluginsOf(document, root)))];
}

const isPlugin = (value: unknown): value is Plugin => {
  const plugin = value as Plugin | undefined;
  return (
    typeof plugin === 'object' &&
    plugin !== null &&
    typeof plugin.name === 'string' &&
    typeof plugin.commands === 'object' &&
    plugin.commands !== null &&
    Object.values(plugin.commands).every(command => command === undefined || typeof command === 'function')
  );
};

/** The path of the package a name refers to, found from the project root. Throws when the project does not have it. */
function resolveInstalled(name: string, root: string): string {
  try {
    return createRequire(join(root, 'package.json')).resolve(name);
  } catch {
    throw new Error(
      `the plugin "${name}" is not installed in this project. A document can only name a package that is a dependency of the project.`
    );
  }
}

/**
 * Load a plugin installed in the project. The package is found from the
 * project root through its default entry, and exports a `plugin`.
 */
export async function loadInstalled(name: string, root: string): Promise<Plugin> {
  const path = resolveInstalled(name, root);
  const module = (await import(pathToFileURL(path).href)) as { plugin?: unknown; default?: { plugin?: unknown } };
  const plugin = module.plugin ?? module.default?.plugin;
  if (!isPlugin(plugin)) throw new Error(`the package "${name}" does not export a plugin: it needs a \`plugin\` export with a name and an object of commands`);
  return plugin;
}

/** A command a plugin adds, with the plugin and the name the documents use for it. */
export interface Found {
  /** What a document writes in `plugins` to apply it. */
  specifier: string;
  plugin: Plugin;
  run: Command;
}

/** Every plugin the documents name that adds `command`. Empty when there is none. */
export async function findCommands(command: string, documents: string[], root: string): Promise<Found[]> {
  // A name that matches nothing must not pass for a plugin that is switched off: it would drop its checks without a word.
  const names = installedPlugins(documents, root);
  for (const name of names) resolveInstalled(name, root);
  const found: Found[] = [];
  for (const specifier of names) {
    const plugin = await loadInstalled(specifier, root);
    const run = plugin.commands[command];
    if (run !== undefined) found.push({ specifier, plugin, run });
  }
  return found;
}
