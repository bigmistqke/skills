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

/** The commands the core runs itself; a plugin adds to `check` and `generate` among them, and every other command of a plugin is its own. */
export const CORE_COMMANDS: ReadonlySet<string> = new Set(['check', 'generate', 'tree', 'show', 'find', 'log', 'rename']);

/**
 * The prefix of a plugin's own commands: the name of its package, without its
 * scope and without `canon-plugin-` in front. It comes from the package, so a
 * plugin cannot choose another's and stand in for its checks.
 */
export function prefixOf(specifier: string): string {
  const name = specifier.startsWith('@') ? specifier.slice(specifier.indexOf('/') + 1) : specifier;
  return name.startsWith('canon-plugin-') ? name.slice('canon-plugin-'.length) : name;
}

/** Every plugin the documents name, loaded. A name that names no installed package stops the run. */
async function loadAll(documents: string[], root: string): Promise<{ specifier: string; plugin: Plugin }[]> {
  // A name that matches nothing must not pass for a plugin that is switched off: it would drop its checks without a word.
  const names = installedPlugins(documents, root);
  for (const name of names) resolveInstalled(name, root);
  const loaded: { specifier: string; plugin: Plugin }[] = [];
  for (const specifier of names) loaded.push({ specifier, plugin: await loadInstalled(specifier, root) });
  return loaded;
}

/** Every plugin the documents name that adds to the core command `command`, such as `check`. Empty when there is none. */
export async function findCommands(command: string, documents: string[], root: string): Promise<Found[]> {
  const found: Found[] = [];
  for (const { specifier, plugin } of await loadAll(documents, root)) {
    const run = plugin.commands[command];
    if (run !== undefined) found.push({ specifier, plugin, run });
  }
  return found;
}

/**
 * The plugin commands a name on the command line asks for. A prefixed name,
 * `<prefix>:<command>`, asks for the command of each plugin with that prefix. A
 * bare name asks for the one prefixed name that has it; `names` lists every
 * prefixed name that has it, and `found` is empty when there is more than one.
 */
export async function findNamed(name: string, documents: string[], root: string): Promise<{ found: Found[]; names: string[] }> {
  const own = (await loadAll(documents, root)).flatMap(({ specifier, plugin }) =>
    Object.entries(plugin.commands)
      .filter((entry): entry is [string, Command] => entry[1] !== undefined && !CORE_COMMANDS.has(entry[0]))
      .map(([command, run]) => ({ specifier, plugin, run, command, prefixed: `${prefixOf(specifier)}:${command}` }))
  );
  const colon = name.indexOf(':');
  const matching = own.filter(c => (colon === -1 ? c.command === name : c.prefixed === name));
  const names = [...new Set(matching.map(c => c.prefixed))];
  if (names.length > 1) return { found: [], names };
  return { found: matching.map(({ specifier, plugin, run }) => ({ specifier, plugin, run })), names };
}
