/**
 * The statements of a document's units, said from their predicates. A document
 * that keeps a table of readings in a `readings` block has the statement of
 * each unit with an Alloy predicate written between two markers, from that
 * predicate, so the statement cannot say anything the predicate does not.
 * A document without a `readings` block is left as it is.
 *
 * `states` says what each statement is, `write` makes the stale and missing
 * ones current, and neither touches a statement a person wrote: the person
 * deletes it to let it be generated.
 */
import { readBlocks, type Block } from '@bigmistqke/canon/blocks';
import { beginMarker, regionAt, replaceRegion } from '@bigmistqke/canon/regions';
import { readUnits } from '@bigmistqke/canon/units';
import { isDefinition, parseReadings, verbalize, verbalizeDefinition, withDefinitions, type Readings } from './verbalize.ts';

/** The name of the region that holds the generated statement of a unit. */
export const regionName = (unit: string): string => `statement-${unit}`;
const endMarker = (region: string): string => `<!-- ${region}:end -->`;

/** Whether the statement of the unit sits between the markers of a generated region. */
export const isGenerated = (src: string, unit: string): boolean => regionAt(src, regionName(unit), endMarker(regionName(unit))) !== undefined;

/**
 * The statement is as the predicate says, or is not; `handwritten` is a
 * statement that a person wrote, which is never overwritten; `unsayable` is a
 * predicate the words cannot say, with the reason.
 */
export type StatementKind = 'current' | 'stale' | 'missing' | 'handwritten' | 'unsayable';

export interface StatementState {
  unit: string;
  kind: StatementKind;
  /** For `unsayable`, what cannot be said. */
  message?: string;
  /** For the others, the statement as the predicate says it, as a blockquote. */
  quote?: string;
}

/** A document that a document extends: where it is from the folder of the document, and its text. */
export interface Context {
  path: string;
  src: string;
}

/**
 * The readings a document keeps, with the definitions of its vocabulary, and
 * those of the documents it extends, whose words link to the document that
 * holds them; undefined when neither keeps any. The nearer a document, the
 * more its readings count, and the document's own count most.
 */
export function readingsOf(src: string, context: Context[] = []): Readings | undefined {
  const own = readBlocks(src);
  const documents = [...[...context].reverse().map(c => ({ path: c.path, blocks: readBlocks(c.src) })), { path: undefined, blocks: own }];
  if (!documents.some(d => d.blocks.some(b => b.lang === 'readings'))) return undefined;
  // The predicates a document defines, in its vocabulary and in the units that define them.
  const model = documents.flatMap(d => d.blocks).filter(b => b.lang === 'alloy' && b.role !== 'bounds' && b.role !== 'scenario');
  // Each block is read for the unit that holds it, so that a word in brackets links to the term that says it.
  const merged = parseReadings('');
  for (const { path, blocks } of documents) {
    for (const block of blocks.filter(b => b.lang === 'readings')) {
      const part = parseReadings(block.body, path === undefined ? block.unit : `${path}#${block.unit}`, path);
      for (const [key, value] of part.nouns) merged.nouns.set(key, value);
      for (const [key, value] of part.nounUnits) merged.nounUnits.set(key, value);
      for (const [key, value] of part.articles) merged.articles.set(key, value);
      for (const [key, value] of part.atoms) merged.atoms.set(key, value);
    }
  }
  return withDefinitions(merged, model.map(b => b.body).join('\n'));
}

const quote = (words: string): string =>
  words
    .split('\n')
    .map(line => (line === '' ? '>' : `> ${line}`))
    .join('\n');

/** What each statement of a document is, in document order; empty for a document with no readings. */
export function states(src: string, context: Context[] = []): StatementState[] {
  let readings: Readings | undefined;
  try {
    readings = readingsOf(src, context);
  } catch (error) {
    return [{ unit: '(readings)', kind: 'unsayable', message: (error as Error).message }];
  }
  if (readings === undefined) return [];
  const units = readUnits(src);
  const blocks = readBlocks(src, units);
  const found: StatementState[] = [];
  for (const unit of units) {
    const predicates = blocks.filter(b => b.unit === unit.id && b.lang === 'alloy' && b.role === 'unit');
    if (predicates.length === 0) continue;
    if (predicates.length > 1) {
      found.push({ unit: unit.id, kind: 'unsayable', message: 'has more than one predicate; a statement says one' });
      continue;
    }
    let words: string;
    try {
      const { body } = predicates[0] as { body: string };
      words = quote(isDefinition(body) ? verbalizeDefinition(body, readings, 'markdown', unit.id) : verbalize(body, readings, 'markdown', unit.id));
    } catch (error) {
      found.push({ unit: unit.id, kind: 'unsayable', message: (error as Error).message });
      continue;
    }
    const region = regionName(unit.id);
    const at = regionAt(src, region, endMarker(region));
    if (at !== undefined) found.push({ unit: unit.id, kind: src.slice(at.body, at.to) === `\n${words}\n` ? 'current' : 'stale', quote: words });
    else found.push({ unit: unit.id, kind: statedByAPerson(unit.own, unit.id) ? 'handwritten' : 'missing', quote: words });
  }
  for (const { key, unit, body } of scenarios(src, blocks)) {
    let words: string;
    try {
      words = quote(`It must be possible that:\n\n${verbalize(body, readings, 'markdown', unit)}`);
    } catch (error) {
      found.push({ unit: key, kind: 'unsayable', message: (error as Error).message });
      continue;
    }
    const region = regionName(key);
    const at = regionAt(src, region, endMarker(region));
    if (at === undefined) found.push({ unit: key, kind: 'missing', quote: words });
    else found.push({ unit: key, kind: src.slice(at.body, at.to) === `\n${words}\n` ? 'current' : 'stale', quote: words });
  }
  return found;
}

/**
 * Whether the unit's own text holds a quote that a person wrote. The
 * generated statement of a scenario is a quote too, but it says what must be
 * possible, and is not the statement of the unit.
 */
function statedByAPerson(own: string, unit: string): boolean {
  const scenario = new RegExp(`<!-- statement-scenario-\\d+-${unit}:begin[^]*?<!-- statement-scenario-\\d+-${unit}:end -->`, 'g');
  return own.replace(scenario, '').split('\n').some(line => line.startsWith('>') && line.slice(1).trim() !== '');
}

/** The scenarios of a document, each with the key its statement goes by: its place among the scenarios of its unit, and the unit. */
function scenarios(src: string, blocks = readBlocks(src, readUnits(src))): { key: string; unit: string; body: string; block: Block }[] {
  const counted = new Map<string, number>();
  return blocks
    .filter(b => b.lang === 'alloy' && b.role === 'scenario')
    .map(block => {
      const nth = (counted.get(block.unit) ?? 0) + 1;
      counted.set(block.unit, nth);
      return { key: `scenario-${nth}-${block.unit}`, unit: block.unit, body: block.body, block };
    });
}

/**
 * The document with the stale statements rewritten and the missing ones
 * written below their headings, and the units that changed.
 */
export function write(src: string, context: Context[] = []): { src: string; written: string[] } {
  const todo = states(src, context).filter(s => s.quote !== undefined && (s.kind === 'stale' || s.kind === 'missing'));
  let text = src;
  for (const { unit, kind, quote: words } of todo) {
    if (kind !== 'stale') continue;
    const region = regionName(unit);
    text = replaceRegion(text, region, endMarker(region), words as string) ?? text;
  }
  // The missing ones go in from the last place to the first, so that no insertion moves one still to come: a unit's below its heading, and a scenario's just above its block.
  const starts = new Map(readUnits(text).map(u => [u.id, u.start]));
  const fences = new Map(scenarios(text).map(({ key, block }) => [key, text.lastIndexOf('\n', block.info.at - 1) + 1]));
  const inserts = todo
    .filter(s => s.kind === 'missing')
    .flatMap(({ unit, quote: words }) => {
      const region = regionName(unit);
      const fence = fences.get(unit);
      if (fence !== undefined) return [{ at: fence, text: `${beginMarker(region)}\n${words}\n${endMarker(region)}\n\n` }];
      const start = starts.get(unit);
      if (start === undefined) return [];
      const eol = text.indexOf('\n', start);
      return [{ at: eol === -1 ? text.length : eol + 1, text: `\n${beginMarker(region)}\n${words}\n${endMarker(region)}\n` }];
    })
    .sort((a, b) => b.at - a.at);
  for (const { at, text: inserted } of inserts) text = `${text.slice(0, at)}${inserted}${text.slice(at)}`;
  return { src: text, written: todo.map(s => s.unit) };
}
