/**
 * The seam between the core of canon and the checks that bring packages of
 * their own. The core depends on nothing outside Node. A plugin adds to the
 * commands of the command line, and the core hands each one the scope it runs
 * in.
 */

/** What the core tells a command about the project it runs in. */
export interface PluginContext {
  /** The words after the command on the command line. */
  args: string[];
  /** The project root: the directory whose `package.json` carries the `canon` field. */
  root: string;
  /** The canon documents the plugin applies to, relative to the root. */
  documents: string[];
  /** The plugin's own field of the `canon` field, as written; undefined when the plugin names no field or the scope has none. */
  config: unknown;
  /** The options given on the command line, as `parseArgs` read them. */
  options: Record<string, string | boolean | (string | boolean)[] | undefined>;
}

/** Run a command; the exit code: 0 when everything holds, 1 when there is a finding, 2 when a check could not run. */
export type Command = (context: PluginContext) => number | Promise<number>;

/**
 * The commands a plugin adds, by name. `generate` and `check` add to the core
 * commands of those names, and the same one from several plugins runs them
 * all. Any other name is a command of the plugin's own, which a run asks for
 * as `<prefix>:<name>`, the prefix being the name of the plugin's package
 * without its scope and without `canon-plugin-`, or by the bare name while no
 * other plugin has a command of that name.
 */
export interface Commands {
  /** Writes what the plugin generates into its documents. Runs before the core writes its own regions, so the core sees the result. */
  generate?: Command;
  /** Reports what is wrong that the core cannot see. Runs as part of `canon check`, after the core's own findings. */
  check?: Command;
  [name: string]: Command | undefined;
}

export interface Plugin {
  name: string;
  /** The field of the `canon` field in `package.json` that holds this plugin's options. */
  config?: string;
  commands: Commands;
}
