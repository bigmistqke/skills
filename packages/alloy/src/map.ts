/**
 * The map of a unit: which words of its statement became which parts of its
 * predicate, written as lines of `"words" -> part`. A person reads the map
 * against the prose and the predicate and marks it reviewed; the mark is a hash
 * of all three, so a change to any of them makes the map stale until it is read
 * again. The check reads text only, and needs no solver.
 */
import { createHash } from 'node:crypto';
import { readBlocks, type Block } from '@bigmistqke/canon/blocks';
import { isGenerated } from './statements.ts';
import { readUnits } from '@bigmistqke/canon/units';

export type MapFindingKind = 'unmapped' | 'orphan' | 'malformed' | 'fragment' | 'target' | 'uncovered' | 'unreviewed' | 'stale';

export interface MapFinding {
  unit: string;
  kind: MapFindingKind;
  message: string;
}

const LINE = /^"([^"]+)"\s*->\s*(\S.*)$/;
const squash = (text: string): string => text.replace(/\s+/g, ' ').trim();

/** The hash a review attests: the statement, the predicate and the map, with their whitespace squashed. */
export function mapHash(statement: string, predicate: string, map: string): string {
  return createHash('sha256').update([statement, predicate, map].map(squash).join('\n')).digest('hex').slice(0, 12);
}

interface Mapped {
  unit: string;
  statement: string;
  predicate: Block[];
  map: Block[];
}

/** Each unit that holds a predicate or a map, with its statement and both kinds of block. */
function mapped(src: string): Mapped[] {
  const units = readUnits(src);
  const blocks = readBlocks(src, units);
  return units
    .map(unit => ({
      unit: unit.id,
      statement: unit.statement ?? '',
      predicate: blocks.filter(b => b.unit === unit.id && b.lang === 'alloy' && b.role === 'unit'),
      map: blocks.filter(b => b.unit === unit.id && b.lang === 'map')
    }))
    // A statement said from its predicate needs no map from the one to the other.
    .filter(m => (m.predicate.length > 0 || m.map.length > 0) && !(m.map.length === 0 && isGenerated(src, m.unit)));
}

const joined = (blocks: Block[]): string => blocks.map(b => b.body).join('\n');

/** The map lines of a body: the fragment and the part it names. */
function lines(body: string): { pairs: [string, string][]; bad: string[] } {
  const pairs: [string, string][] = [];
  const bad: string[] = [];
  for (const line of body.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.startsWith('#'))) {
    const m = LINE.exec(line);
    if (m) pairs.push([m[1], m[2].trim()]);
    else bad.push(line);
  }
  return { pairs, bad };
}

export function checkMaps(src: string): MapFinding[] {
  const found: MapFinding[] = [];
  for (const { unit, statement, predicate, map } of mapped(src)) {
    const add = (kind: MapFindingKind, message: string): number => found.push({ unit, kind, message });
    if (map.length === 0) {
      add('unmapped', 'has a predicate and no map from its statement to it');
      continue;
    }
    if (predicate.length === 0) {
      add('orphan', 'has a map and no predicate to map to');
      continue;
    }
    const text = squash(statement);
    const code = squash(joined(predicate));
    const { pairs, bad } = lines(joined(map));
    for (const line of bad) add('malformed', `a map line is not "words" -> part: ${line}`);
    for (const [fragment, target] of pairs) {
      if (!text.includes(squash(fragment))) add('fragment', `"${fragment}" is not in the statement`);
      if (!code.includes(squash(target))) add('target', `\`${target}\` is not in the predicate`);
    }
    for (const sentence of text.split(/(?<=\.)\s+/)) {
      if (!pairs.some(([fragment]) => sentence.includes(squash(fragment)))) add('uncovered', `no map line covers: ${sentence}`);
    }
    const hash = mapHash(statement, joined(predicate), joined(map));
    const reviewed = map.map(b => b.attrs.reviewed).find(r => r !== undefined);
    if (reviewed === undefined) add('unreviewed', `the map is not marked reviewed (reviewed=${hash})`);
    else if (reviewed !== hash) add('stale', 'the statement, the predicate or the map changed since the map was reviewed');
  }
  return found;
}

/** The document with each named unit's map marked reviewed as it now stands; the units named that have no map are returned too. */
export function reviewMaps(src: string, units: string[]): { src: string; missing: string[] } {
  const all = mapped(src);
  const missing = units.filter(id => !all.some(m => m.unit === id && m.map.length > 0 && m.predicate.length > 0));
  const edits = all
    .filter(m => units.includes(m.unit) && m.map.length > 0 && m.predicate.length > 0)
    .map(m => {
      const block = m.map[0];
      const hash = mapHash(m.statement, joined(m.predicate), joined(m.map));
      const rest = block.info.text.trim().split(/\s+/).filter(w => w !== 'map' && !w.startsWith('reviewed='));
      return { at: block.info.at, length: block.info.text.length, text: ['map', ...rest, `reviewed=${hash}`].join(' ') };
    })
    .sort((a, b) => b.at - a.at);
  return { src: edits.reduce((out, e) => out.slice(0, e.at) + e.text + out.slice(e.at + e.length), src), missing };
}
