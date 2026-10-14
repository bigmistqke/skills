/**
 * `canon logic`: the logic layer of the documents, checked. A document with
 * fenced blocks of a language is handed to that language's backend, and what
 * the backend finds is reported in the units' own words.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { alloyProgram, checkAlloy, type AlloyOptions } from './alloy.ts';
import { checkMaps, reviewMaps } from './map.ts';
import type { Plugin } from './plugin.ts';

/** Check each document's maps and alloy blocks; the exit code: 0 when the maps are current and every scenario can happen, 1 when not, 2 when a check could not run. */
export function logic(documents: string[], root: string, options: AlloyOptions): number {
  let code = 0;
  let checked = 0;
  for (const doc of documents) {
    const file = resolve(root, doc);
    if (!existsSync(file)) {
      console.error(`canon: no such document "${doc}"`);
      return 2;
    }
    const src = readFileSync(file, 'utf8');
    if (alloyProgram(src).units.length === 0) continue;
    checked++;
    // The maps are read before the solver runs: they need no Java, and a stale one says the predicate is not what the prose says.
    const maps = checkMaps(src);
    if (maps.length > 0) code = 1;
    for (const finding of maps) console.log(`${doc}: ${finding.unit}: ${finding.kind}: ${finding.message}`);
    const result = checkAlloy(src, options);
    if ('error' in result) {
      console.error(`canon: ${doc}: the Alloy analyzer did not run\n${result.error}`);
      return 2;
    }
    const count = (n: number, noun: string): string => `${n} ${noun}${n === 1 ? '' : 's'}`;
    console.log(`${doc}: ${count(result.units.length, 'unit')}, ${count(result.scenarios, 'scenario')}`);
    for (const failure of result.ok ? [] : result.failures) {
      code = 1;
      console.log(
        failure.unit === undefined
          ? '  the units contradict each other in every trace within the bounds'
          : `  the scenario of ${failure.unit} cannot happen while every unit holds`
      );
      if (failure.unit !== undefined) {
        console.log(`    one of these has to change: ${failure.conflict.join(', ') || 'no single unit (several together)'}`);
      }
    }
  }
  if (checked === 0) console.log('no alloy blocks in the documents');
  return code;
}

/** Mark the named units' maps reviewed, as they now stand, in each document that holds them; the exit code: 0, or 2 when a unit has no map. */
export function review(documents: string[], root: string, units: string[]): number {
  let left = units;
  for (const doc of documents) {
    const file = resolve(root, doc);
    if (!existsSync(file)) continue;
    const { src, missing } = reviewMaps(readFileSync(file, 'utf8'), units);
    const done = units.filter(id => !missing.includes(id));
    if (done.length > 0) {
      writeFileSync(file, src);
      for (const id of done) console.log(`${doc}: ${id}: reviewed`);
    }
    left = left.filter(id => missing.includes(id));
  }
  for (const id of left) console.error(`canon: ${id} has no map and predicate in the documents`);
  return left.length === 0 ? 0 : 2;
}

/** The `logic` field of the scope: where the Alloy analyzer is. Paths are relative to the project root. */
interface LogicConfig {
  alloy?: { jar?: string; java?: string };
}

export const plugin: Plugin = {
  name: 'alloy',
  config: 'logic',
  commands: {
    logic: ({ args, root, documents, config, options }) => {
      const documentsToRead = args.length > 0 ? args : documents;
      if (options.review !== undefined) return review(documentsToRead, root, options.review as string[]);
      const alloy = (config as LogicConfig | undefined)?.alloy;
      return logic(documentsToRead, root, {
        jar: alloy?.jar === undefined ? undefined : resolve(root, alloy.jar),
        java: alloy?.java === undefined ? undefined : resolve(root, alloy.java)
      });
    }
  }
};
