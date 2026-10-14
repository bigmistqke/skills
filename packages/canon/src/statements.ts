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
import { readBlocks } from './blocks.ts';
import { beginMarker, regionAt, replaceRegion } from './regions.ts';
import { readUnits } from './units.ts';
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

/** The readings a document keeps, with the definitions of its vocabulary; undefined when it keeps none. */
export function readingsOf(src: string): Readings | undefined {
  const blocks = readBlocks(src);
  const table = blocks.filter(b => b.lang === 'readings');
  if (table.length === 0) return undefined;
  // The predicates a document defines, in its vocabulary and in the units that define them.
  const model = blocks.filter(b => b.lang === 'alloy' && b.role !== 'bounds' && b.role !== 'scenario');
  return withDefinitions(parseReadings(table.map(b => b.body).join('\n')), model.map(b => b.body).join('\n'));
}

const quote = (words: string): string =>
  words
    .split('\n')
    .map(line => (line === '' ? '>' : `> ${line}`))
    .join('\n');

/** What each statement of a document is, in document order; empty for a document with no readings. */
export function states(src: string): StatementState[] {
  let readings: Readings | undefined;
  try {
    readings = readingsOf(src);
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
      words = quote(isDefinition(body) ? verbalizeDefinition(body, readings, 'markdown') : verbalize(body, readings, 'markdown'));
    } catch (error) {
      found.push({ unit: unit.id, kind: 'unsayable', message: (error as Error).message });
      continue;
    }
    const region = regionName(unit.id);
    const at = regionAt(src, region, endMarker(region));
    if (at !== undefined) found.push({ unit: unit.id, kind: src.slice(at.body, at.to) === `\n${words}\n` ? 'current' : 'stale', quote: words });
    else found.push({ unit: unit.id, kind: unit.statement === undefined ? 'missing' : 'handwritten', quote: words });
  }
  return found;
}

/**
 * The document with the stale statements rewritten and the missing ones
 * written below their headings, and the units that changed.
 */
export function write(src: string): { src: string; written: string[] } {
  const todo = states(src).filter(s => s.quote !== undefined && (s.kind === 'stale' || s.kind === 'missing'));
  let text = src;
  for (const { unit, kind, quote: words } of todo) {
    if (kind !== 'stale') continue;
    const region = regionName(unit);
    text = replaceRegion(text, region, endMarker(region), words as string) ?? text;
  }
  // The missing ones go in from the last heading to the first, so that no insertion moves one still to come.
  const missing = todo.filter(s => s.kind === 'missing');
  const starts = new Map(readUnits(text).map(u => [u.id, u.start]));
  for (const { unit, quote: words } of [...missing].sort((a, b) => (starts.get(b.unit) ?? 0) - (starts.get(a.unit) ?? 0))) {
    const start = starts.get(unit);
    if (start === undefined) continue;
    const eol = text.indexOf('\n', start);
    const at = eol === -1 ? text.length : eol + 1;
    const region = regionName(unit);
    text = `${text.slice(0, at)}\n${beginMarker(region)}\n${words}\n${endMarker(region)}\n${text.slice(at)}`;
  }
  return { src: text, written: todo.map(s => s.unit) };
}
