/**
 * The Alloy backend of the logic layer: the vocabulary and the predicates of a
 * document's `alloy` blocks, checked together by the Alloy analyzer. It answers
 * one question — can all the units hold at once, within the bounds — and, when
 * they cannot, which units a repair has to touch.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readBlocks, type Block } from './blocks.ts';
import { readUnits } from './units.ts';

export interface AlloyOptions {
  /** A Java 17 or later; `CANON_JAVA`, or `java`. */
  java?: string;
  /** The Alloy distribution jar; `CANON_ALLOY_JAR`. */
  jar?: string;
}

/** A scenario the units do not allow, and the units a repair has to touch for it to be allowed. */
export interface ScenarioFailure {
  /** The predicate that states the scenario, or `consistent` when the units contradict each other with none. */
  scenario: string;
  /** The unit that holds the scenario; none for `consistent`. */
  unit?: string;
  conflict: string[];
}

export type AlloyResult =
  | { ok: true; units: string[]; scenarios: number }
  | { ok: false; units: string[]; scenarios: number; failures: ScenarioFailure[] }
  | { ok: false; error: string };

/** The default scope, when no `alloy bounds` block gives one. */
const DEFAULT_BOUNDS = 'for 3 but 1..8 steps';
const PARAGRAPH = /^\s*(?:(?:var|one|lone|some|abstract)\s+)*(?:sig|pred|fun|fact|assert|enum|open|run|check)\b/;

/** The Alloy name of a unit's predicate: its id, with underscores for hyphens. */
export const predicateName = (unit: string): string => unit.replace(/-/g, '_');

/** A unit's block as Alloy paragraphs: a bare formula becomes the predicate named after the unit. */
function paragraphs(block: Block): string {
  return PARAGRAPH.test(block.body) ? block.body : `pred ${predicateName(block.unit)} {\n${block.body}}\n`;
}

/** The name of the predicate that states a scenario: the unit that holds it, and its place among that unit's scenarios. */
const scenarioName = (unit: string, nth: number): string => `scenario_${nth}_${predicateName(unit)}`;

/**
 * The Alloy file of a document: its vocabulary, each unit's predicate, and for
 * each scenario a run of the units together with it, and a run for each unit
 * left out. With no scenario the units are run on their own, which only finds
 * units that contradict each other in every trace.
 */
export function alloyProgram(src: string): { program: string; units: string[]; scenarios: { name: string; unit: string }[] } {
  const blocks = readBlocks(src, readUnits(src)).filter(b => b.lang === 'alloy');
  const bounds = blocks.find(b => b.role === 'bounds')?.body.trim() ?? DEFAULT_BOUNDS;
  const units = [...new Set(blocks.filter(b => b.role === 'unit').map(b => b.unit))];
  const names = units.map(predicateName);
  const scenarios = blocks
    .filter(b => b.role === 'scenario')
    .map((block, i, all) => ({ block, name: scenarioName(block.unit, all.slice(0, i).filter(o => o.unit === block.unit).length + 1) }));
  const all = (extra: string[], leaving?: number): string =>
    [...names.filter((_, j) => j !== leaving), ...extra].join(' and ') || 'some none';
  const runs = [
    `run consistent { ${all([])} } ${bounds}`,
    ...scenarios.flatMap(({ name }) => [
      `run ${name}_with_all { ${all([name])} } ${bounds}`,
      ...names.map((unit, i) => `run ${name}_without_${unit} { ${all([name], i)} } ${bounds}`),
    ]),
  ];
  const parts = blocks.filter(b => b.role !== 'bounds' && b.role !== 'scenario').map(paragraphs);
  const stated = scenarios.map(({ block, name }) => `pred ${name} {\n${block.body}}\n`);
  return { program: [...parts, ...stated, ...runs].join('\n'), units, scenarios: scenarios.map(({ name, block }) => ({ name, unit: block.unit })) };
}

/** Whether each run of the receipt found an instance: a run with no solution has none within its bounds. */
const solved = (receipt: string): Map<string, boolean> =>
  new Map(
    Object.entries((JSON.parse(receipt) as { commands: Record<string, { solution?: unknown[] }> }).commands).map(([name, run]) => [
      name,
      (run.solution?.length ?? 0) > 0,
    ]),
  );

export function checkAlloy(src: string, options: AlloyOptions = {}): AlloyResult {
  const java = options.java ?? process.env.CANON_JAVA ?? 'java';
  const jar = options.jar ?? process.env.CANON_ALLOY_JAR;
  if (!jar) return { ok: false, error: 'no Alloy jar: pass `jar`, or set CANON_ALLOY_JAR' };
  const { program, units, scenarios: stated } = alloyProgram(src);
  const scenarios = stated.length;
  const dir = mkdtempSync(join(tmpdir(), 'canon-alloy-'));
  try {
    const file = join(dir, 'model.als');
    writeFileSync(file, program);
    const ran = spawnSync(java, ['-jar', jar, 'exec', '-f', '-o', join(dir, 'out'), '-t', 'text', file], { encoding: 'utf8' });
    if (ran.error) return { ok: false, error: ran.error.message };
    let found: Map<string, boolean>;
    try {
      found = solved(readFileSync(join(dir, 'out', 'receipt.json'), 'utf8'));
    } catch {
      return { ok: false, error: `${ran.stdout}${ran.stderr}`.trim() || 'the Alloy analyzer wrote no receipt' };
    }
    if (!found.get('consistent')) return { ok: false, units, scenarios, failures: [{ scenario: 'consistent', conflict: units }] };
    // A unit whose removal lets the scenario happen is in every conflict: the repair has to touch one of them.
    const failures = stated
      .filter(({ name }) => !found.get(`${name}_with_all`))
      .map(({ name, unit }) => ({ scenario: name, unit, conflict: units.filter(unit => found.get(`${name}_without_${predicateName(unit)}`)) }));
    return failures.length === 0 ? { ok: true, units, scenarios } : { ok: false, units, scenarios, failures };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
