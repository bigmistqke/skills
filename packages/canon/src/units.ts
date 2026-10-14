/**
 * The units of a canon document, as the checker reads them: each heading that
 * declares one, its kind and stem, the unit it sits in, its statement, its own
 * text and its site. Whatever else reads a canon reads it through this, so a
 * unit is one thing everywhere.
 */

import { FRONTMATTER } from './frontmatter.ts';

/**
 * Blank out the frontmatter, fenced-code bodies and the generated index, keeping every byte
 * offset and every newline.
 *
 * The index has to go: it links every unit in the document, so leaving it
 * readable makes `dead` vacuous — every unit is cited by the table of contents
 * that was generated FROM it. A generated link is not evidence that anything
 * derives from a unit, which is the only thing `dead` is asking.
 */
export const maskFences = (src: string): string =>
  src
    .replace(FRONTMATTER, m => m.replace(/[^\n]/g, ' '))
    .replace(/^(```+|~~~+)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, m =>
      m.replace(/[^\n]/g, ' ')
    )
    .replace(/<!--[ \t]*toc:begin\b[^>]*-->[\s\S]*?<!-- toc:end -->/g, m =>
      m.replace(/[^\n]/g, ' ')
    );

/**
 * A unit heading: `### @spec <stem> — <prose>`, whose id is `spec-<stem>`. The
 * stem is declared rather than slugged from the prose, so the sentence after the
 * em dash can be reworded without breaking a citation.
 */
export const UNIT_HEADING = /^(#{1,6})[ \t]+@([a-z]+)[ \t]+(\S+)[ \t]*$/gm;
/** Any heading, including a plain section one — it ends the unit above it. */
const ANY_HEADING = /^(#{1,6})[ \t]+/gm;
/**
 * A spec's site — the one place in the code that does what it states, on a
 * line of its own in the body. The statement stays the claim alone, so a tree
 * shows what the system does rather than where.
 */
const SITE = /^Site: (.+)$/m;

export interface Unit {
  /** `spec-<stem>`: the kind and the stem, joined. */
  id: string;
  /** The word after the `@`: `axiom`, `spec`, `term`, … */
  kind: string;
  stem: string;
  /** The heading's depth, and the byte range of the unit, up to the next heading of its depth or above. */
  level: number;
  start: number;
  end: number;
  /** The unit it sits in, found by extent: a plain section heading between the two breaks the relation. */
  parent?: string;
  /**
   * The unit's statement: the blockquote opening its own text, its lines
   * joined by a space. Declared by the line prefix rather than inferred from
   * emphasis, so marking a term inside it changes nothing about what is read.
   */
  statement?: string;
  /** The unit's own text, before its first nested heading. */
  own: string;
  /** The place in the code its "Site:" line names. */
  site?: string;
}

/** The statement a unit's own text opens with: its first blockquote, joined. */
function statementOf(own: string): string | undefined {
  const lines = own.split('\n');
  const first = lines.findIndex(line => line.startsWith('>'));
  if (first === -1) return undefined;
  const quote: string[] = [];
  for (const line of lines.slice(first)) {
    if (!line.startsWith('>')) break;
    quote.push(line.replace(/^>[ \t]?/, ''));
  }
  const text = quote.join(' ').replace(/\s+/g, ' ').trim();
  return text === '' ? undefined : text;
}

/** Every unit a canon document declares, in document order. */
export function readUnits(src: string): Unit[] {
  const md = maskFences(src);
  const levels = [...md.matchAll(ANY_HEADING)].map(m => ({ level: m[1].length, at: m.index ?? 0 }));
  const units: Unit[] = [];
  for (const m of md.matchAll(UNIT_HEADING)) {
    const start = m.index ?? 0;
    const level = m[1].length;
    // A plain section heading closes the unit above it: it is not a unit, but
    // it is not part of one either.
    const next = levels.find(h => h.at > start && h.level <= level);
    units.push({ id: `${m[2]}-${m[3]}`, kind: m[2], stem: m[3], level, start, end: next ? next.at : md.length, own: '' });
  }
  // Nesting IS the derivation link, so each unit records the unit it sits
  // inside. A plain section heading between the two breaks the relation, which
  // is why the enclosing unit is found by extent rather than by heading depth.
  for (const unit of units) {
    unit.parent = units
      .filter(u => u !== unit && unit.start > u.start && unit.start < u.end)
      .sort((a, b) => b.start - a.start)[0]?.id;
  }
  for (const unit of units) {
    const body = md.slice(unit.start, unit.end).split('\n').slice(1).join('\n');
    // Only the unit's own text, before its first nested heading, holds its statement and names its site.
    unit.own = body.split(/^#{1,6}[ \t]/m)[0];
    unit.statement = statementOf(unit.own);
    unit.site = SITE.exec(unit.own)?.[1]?.trim();
  }
  return units;
}
