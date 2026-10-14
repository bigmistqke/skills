/**
 * The frontmatter of a canon document: a block between two lines of `---` at
 * the very top. It names the plugins whose checks apply to the document:
 *
 *     ---
 *     plugins: ["@bigmistqke/canon-forge"]
 *     ---
 *
 * The core depends on nothing outside Node, so this reads a small part of
 * YAML and nothing else: the key `plugins`, whose value is a list of strings,
 * written inline (`[a, "b"]`) or as lines that start with a dash. Everything
 * it accepts is also valid YAML, so other tools can read the same block.
 */

/** The block at the top of a document, with its closing line. */
export const FRONTMATTER = /^---[ \t]*\r?\n(?:[\s\S]*?\r?\n)?---[ \t]*(?:\r?\n|$)/;

export interface Frontmatter {
  /** The plugins the document names; undefined when it has no `plugins` key. */
  plugins?: string[];
}

/** A plain YAML scalar cannot start with these, and the `@` is the one a package name starts with. */
const RESERVED_START = /^[@`%!&*|>'"[\]{},#?:-]/;

/** One scalar: double quoted, single quoted, or plain. */
function scalar(raw: string): string {
  const text = raw.trim();
  if (text === '') throw new Error('an empty entry in the list of plugins');
  if (text.startsWith('"')) {
    if (text.length < 2 || !text.endsWith('"')) throw new Error(`the string ${text} has no closing quote`);
    return text.slice(1, -1).replace(/\\(["\\])/g, '$1');
  }
  if (text.startsWith("'")) {
    if (text.length < 2 || !text.endsWith("'")) throw new Error(`the string ${text} has no closing quote`);
    return text.slice(1, -1).replace(/''/g, "'");
  }
  if (RESERVED_START.test(text)) {
    throw new Error(`${text} must be in quotes: a plain YAML value cannot start with "${text[0]}". Write "${text}".`);
  }
  if (/[:#,[\]{}]/.test(text) || /\s/.test(text)) throw new Error(`${text} must be in quotes`);
  return text;
}

/** The entries of `[a, "b"]`. Commas inside quotes belong to the string. */
function inlineList(raw: string): string[] {
  const body = raw.trim();
  if (!body.startsWith('[') || !body.endsWith(']')) throw new Error('the list of plugins has no closing "]"');
  const inner = body.slice(1, -1);
  const items: string[] = [];
  let current = '';
  let quote: string | undefined;
  for (const ch of inner) {
    if (quote !== undefined) {
      if (ch === quote) quote = undefined;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ',') {
      items.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  if (quote !== undefined) throw new Error('a quote in the list of plugins is never closed');
  if (current.trim() !== '' || items.length > 0) items.push(current);
  return items.map(scalar);
}

/**
 * Read the frontmatter of a document. Returns undefined when the document has
 * none. Throws an Error that says what is wrong when the block is not in the
 * accepted part of YAML; a key the tool does not know is an error too, so a
 * misspelled `plugin` cannot silently drop a check.
 */
export function readFrontmatter(src: string): Frontmatter | undefined {
  const block = FRONTMATTER.exec(src);
  if (block === null) return undefined;
  // The matched text is the opening line, the body, the closing line, and the newline after it, if any.
  const lines = block[0].split(/\r?\n/);
  lines.shift();
  if (lines.at(-1) === '') lines.pop();
  lines.pop();
  const result: Frontmatter = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] as string;
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    const key = /^([A-Za-z][\w-]*):[ \t]*(.*)$/.exec(line);
    if (key === null) throw new Error(`cannot read the line "${line.trim()}"`);
    if (key[1] !== 'plugins') throw new Error(`unknown key "${key[1]}"; the only key is "plugins"`);
    if (result.plugins !== undefined) throw new Error('the key "plugins" appears twice');
    const rest = (key[2] as string).replace(/[ \t]+#.*$/, '');
    if (rest !== '') {
      result.plugins = inlineList(rest);
      continue;
    }
    const items: string[] = [];
    while (i + 1 < lines.length && /^[ \t]*-([ \t]|$)/.test(lines[i + 1] as string)) {
      i++;
      items.push(scalar((lines[i] as string).replace(/^[ \t]*-[ \t]*/, '').replace(/[ \t]+#.*$/, '')));
    }
    result.plugins = items;
  }
  return result;
}
