/**
 * The fenced blocks a canon document keeps in its units: the logic layer next
 * to the prose. A block is read by the unit that holds it and tagged by its
 * language, so a backend gets the blocks of its own language and canon never
 * reads what is inside one.
 */
import { readUnits, type Unit } from './units.ts';

/** How a block is used: the cluster's shared words, its search bounds, a situation the units must allow, or the unit's own predicate. */
export type BlockRole = 'vocabulary' | 'bounds' | 'scenario' | 'unit';

export interface Block {
  /** The unit that holds the block. */
  unit: string;
  /** The first word of the info string: `alloy`, `smt`, `map`. */
  lang: string;
  /** The second word of the info string, `unit` when there is none. */
  role: BlockRole;
  body: string;
  /** The byte offset of the block's body in the document. */
  at: number;
  /** The `key=value` words of the info string, as `reviewed=…` on a map. */
  attrs: Record<string, string>;
  /** The info string as written after the fence, and its byte offset: what a rewrite replaces. */
  info: { text: string; at: number };
}

const ROLES: readonly string[] = ['vocabulary', 'bounds', 'scenario'];
const FENCE = /^(```+|~~~+)([^\n]*)\n([\s\S]*?)^\1[ \t]*$/gm;

/** Where a unit's own text sits in the document: after its heading line, before its first nested heading. */
function ownRange(src: string, unit: Unit): [number, number] {
  const eol = src.indexOf('\n', unit.start);
  const from = eol === -1 ? src.length : eol + 1;
  return [from, from + unit.own.length];
}

/**
 * Every fenced block with a language in the unit's own text, in document order.
 * A fence with no language is prose, and a unit's nested units hold their own.
 */
export function readBlocks(src: string, units: Unit[] = readUnits(src)): Block[] {
  const blocks: Block[] = [];
  for (const unit of units) {
    const [from, to] = ownRange(src, unit);
    const own = src.slice(from, to);
    for (const m of own.matchAll(FENCE)) {
      const [lang = '', ...words] = m[2].trim().split(/\s+/);
      if (lang === '') continue;
      const role = ROLES.includes(words[0]) ? (words[0] as BlockRole) : 'unit';
      const attrs = Object.fromEntries(words.filter(w => w.includes('=')).map(w => [w.slice(0, w.indexOf('=')), w.slice(w.indexOf('=') + 1)]));
      const body = m[3];
      const start = from + (m.index ?? 0);
      blocks.push({
        unit: unit.id,
        lang,
        role,
        body,
        at: start + m[0].indexOf(body, m[1].length),
        attrs,
        info: { text: m[2], at: start + m[1].length }
      });
    }
  }
  return blocks;
}
