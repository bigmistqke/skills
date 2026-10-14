/**
 * The Alloy backend of the logic layer: the vocabulary and the predicates of a
 * document's `alloy` blocks, checked together by the Alloy analyzer. It answers
 * one question — can all the units hold at once, within the bounds — and, when
 * they cannot, which units a repair has to touch.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { join } from 'node:path';
import { readBlocks, type Block } from './blocks.ts';
import { readUnits } from './units.ts';
import { declaredIn } from './words.ts';

export interface AlloyOptions {
  /** A Java 17 or later; `CANON_JAVA`, or `java`. */
  java?: string;
  /** The Alloy distribution jar; `CANON_ALLOY_JAR`. */
  jar?: string;
  /**
   * The units, by id, to try leaving out when a scenario cannot happen; every
   * unit by default. A check that already knows which unit it expects can ask
   * about that one alone: if leaving it out lets the scenario happen, nothing
   * else was keeping it from happening. A map gives the units for each scenario,
   * by the id of the unit that holds the scenario.
   */
  leave?: string[] | Record<string, string[]>;
  /** The text of the documents the document extends: their claims join the model, and what only they hold is left to them. */
  context?: string[];
}

/** Which runs a program holds: the units together and each scenario with them, the units left out one by one, or both. */
export type Runs = 'check' | 'blame' | 'all';

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

/** The blocks of a document that the Alloy backend reads. */
const alloyBlocks = (src: string): Block[] => readBlocks(src, readUnits(src)).filter(b => b.lang === 'alloy');

/** The scope a document asks for, or the default one. */
const boundsOf = (blocks: Block[]): string => blocks.find(b => b.role === 'bounds')?.body.trim() ?? DEFAULT_BOUNDS;

type Only = { scenarios?: string[]; leave?: string[] | Record<string, string[]> };
type Program = { program: string; model: string; commands: string[]; units: string[]; scenarios: { name: string; unit: string }[] };

/**
 * The Alloy file of some blocks: their vocabulary, each unit's predicate, and
 * for each scenario a run of the units together with it, and a run for each
 * unit left out. With no scenario the units are run on their own, which only
 * finds units that contradict each other in every trace.
 */
function build(blocks: Block[], bounds: string, runs: Runs, only?: Only): Program {
  // A unit that holds only definitions, such as a term that defines a predicate, is part of the model and not a claim to hold.
  const units = [...new Set(blocks.filter(b => b.role === 'unit' && !PARAGRAPH.test(b.body)).map(b => b.unit))];
  const names = units.map(predicateName);
  const scenarios = blocks
    .filter(b => b.role === 'scenario')
    .map((block, i, all) => ({ block, name: scenarioName(block.unit, all.slice(0, i).filter(o => o.unit === block.unit).length + 1) }));
  const all = (extra: string[], leaving?: number): string =>
    [...names.filter((_, j) => j !== leaving), ...extra].join(' and ') || 'some none';
  const together = runs === 'blame' ? [] : [`run consistent { ${all([])} } ${bounds}`, ...scenarios.map(({ name }) => `run ${name}_with_all { ${all([name])} } ${bounds}`)];
  const blamed = scenarios
    .filter(({ name }) => only?.scenarios === undefined || only.scenarios.includes(name))
    .flatMap(({ name, block }) => {
      const leave = Array.isArray(only?.leave) ? only.leave : only?.leave?.[block.unit];
      return names.flatMap((unit, i) =>
        runs === 'check' || (leave !== undefined && !leave.includes(units[i] as string)) ? [] : [`run ${name}_without_${unit} { ${all([name], i)} } ${bounds}`]
      );
    });
  const commands = [...together, ...blamed];
  const parts = blocks.filter(b => b.role !== 'bounds' && b.role !== 'scenario').map(paragraphs);
  const stated = scenarios.map(({ block, name }) => `pred ${name} {\n${block.body}}\n`);
  const model = [...parts, ...stated].join('\n');
  return { program: [model, ...commands].join('\n'), model, commands, units, scenarios: scenarios.map(({ name, block }) => ({ name, unit: block.unit })) };
}

/** The Alloy file of a document, with every unit in one model. */
export function alloyProgram(src: string, runs: Runs = 'all', only?: Only, context: string[] = []): Program {
  const blocks = [...context.flatMap(alloyBlocks), ...alloyBlocks(src)];
  return build(blocks, boundsOf([...alloyBlocks(src), ...context.flatMap(alloyBlocks)]), runs, only);
}

/** The identifiers of a block, outside its comments. */
const mentions = (body: string): Set<string> =>
  new Set(body.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(?:--|\/\/)[^\n]*/g, ' ').match(/[A-Za-z_]\w*/g) ?? []);

/**
 * The groups of blocks that share a word: a block joins the blocks that declare
 * a signature, a field or a predicate it mentions. Units in different groups
 * talk about different things, so no group can contradict another, and each
 * can be asked about alone. A group with no unit to hold and no scenario is
 * left out.
 */
export function groups(src: string, context: string[] = []): Block[][] {
  const own = new Set(alloyBlocks(src));
  const blocks = [...context.flatMap(alloyBlocks), ...own].filter(b => b.role !== 'bounds');
  const parent = blocks.map((_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) i = parent[i] = parent[parent[i] as number] as number;
    return i;
  };
  const declarers = new Map<string, number[]>();
  blocks.forEach((block, i) => {
    if (block.role === 'scenario') return;
    for (const { name } of declaredIn(block.body)) {
      const word = name.split('.')[0] as string;
      declarers.set(word, [...(declarers.get(word) ?? []), i]);
    }
  });
  blocks.forEach((block, i) => {
    for (const name of mentions(block.body)) for (const j of declarers.get(name) ?? []) parent[find(i)] = find(j);
  });
  const byRoot = new Map<number, Block[]>();
  blocks.forEach((block, i) => byRoot.set(find(i), [...(byRoot.get(find(i)) ?? []), block]));
  // A group that holds nothing of the document is left to the document that holds it, which is checked where it lives.
  return [...byRoot.values()].filter(group => group.some(b => own.has(b)) && group.some(b => b.role === 'scenario' || (b.role === 'unit' && !PARAGRAPH.test(b.body))));
}

/** The scope of a group: the scope asked for, without the sizes of signatures the group does not declare. */
function boundsFor(bounds: string, blocks: Block[]): string {
  const m = /^for\s+(\d+)(?:\s+but\s+([\s\S]*))?$/.exec(bounds);
  if (m === null) return bounds;
  const sigs = new Set(blocks.flatMap(b => declaredIn(b.body)).filter(w => w.kind === 'signature').map(w => w.name));
  const kept = (m[2] ?? '').split(',').map(item => item.trim()).filter(item => item !== '' && (/\bsteps?$/.test(item) || sigs.has(item.split(/\s+/).at(-1) as string)));
  return `for ${m[1]}${kept.length > 0 ? ` but ${kept.join(', ')}` : ''}`;
}

/** Whether each run of the receipt found an instance: a run with no solution has none within its bounds. */
const solved = (receipt: string): Map<string, boolean> =>
  new Map(
    Object.entries((JSON.parse(receipt) as { commands: Record<string, { solution?: unknown[] }> }).commands).map(([name, run]) => [
      name,
      (run.solution?.length ?? 0) > 0,
    ]),
  );

/** Run the analyzer over a model and one of its runs, and say whether the run found an instance. */
function solveOne(model: string, command: string, java: string, jar: string): Promise<{ found: Map<string, boolean> } | { error: string }> {
  return new Promise(resolve => {
    const dir = mkdtempSync(join(tmpdir(), 'canon-alloy-'));
    const done = (result: { found: Map<string, boolean> } | { error: string }): void => {
      rmSync(dir, { recursive: true, force: true });
      resolve(result);
    };
    const file = join(dir, 'model.als');
    writeFileSync(file, `${model}\n${command}\n`);
    // One collector thread for each process: several processes run at once, and a collector with a thread for every core makes them wait for each other.
    const child = spawn(java, ['-XX:+UseSerialGC', '-jar', jar, 'exec', '-f', '-o', join(dir, 'out'), '-t', 'text', file]);
    let log = '';
    child.stdout.on('data', chunk => (log += chunk));
    child.stderr.on('data', chunk => (log += chunk));
    child.on('error', error => done({ error: error.message }));
    child.on('close', () => {
      try {
        done({ found: solved(readFileSync(join(dir, 'out', 'receipt.json'), 'utf8')) });
      } catch {
        done({ error: log.trim() || 'the Alloy analyzer wrote no receipt' });
      }
    });
  });
}

/** Run the tasks, no more than `limit` at a time, and give their results in order. */
async function pool<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await (tasks[i] as () => Promise<T>)();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

/** Ask the analyzer about the runs of several programs at once, each run in a process of its own; whether each run of each program found an instance, or the first error. */
async function solveAll(programs: Program[], java: string, jar: string): Promise<Map<string, boolean>[] | { error: string }> {
  const tasks = programs.flatMap((p, i) => p.commands.map(command => () => solveOne(p.model, command, java, jar).then(result => ({ i, result }))));
  // As many processes as there are processors, unless `CANON_ALLOY_JOBS` says fewer: a test runner that asks about several documents at once should not start them all.
  const answers = await pool(tasks, Number(process.env.CANON_ALLOY_JOBS) || availableParallelism());
  const found: Map<string, boolean>[] = programs.map(() => new Map());
  for (const { i, result } of answers) {
    if ('error' in result) return { error: result.error };
    for (const [name, yes] of result.found) (found[i] as Map<string, boolean>).set(name, yes);
  }
  return found;
}

/**
 * Whether every scenario can happen while all the units hold. The units that
 * share no word are asked about apart, since they cannot contradict each other.
 * For each group the analyzer is asked first only that, with one run for the
 * units and one for each scenario; the runs that leave a unit out, to say which
 * units a repair has to touch, are made afterwards, and only for the scenarios
 * that cannot happen. Each run is made by a process of its own, several at a time.
 */
export async function checkAlloy(src: string, options: AlloyOptions = {}): Promise<AlloyResult> {
  const java = options.java ?? process.env.CANON_JAVA ?? 'java';
  const jar = options.jar ?? process.env.CANON_ALLOY_JAR;
  if (!jar) return { ok: false, error: 'no Alloy jar: pass `jar`, or set CANON_ALLOY_JAR' };
  const context = options.context ?? [];
  const bounds = boundsOf([...alloyBlocks(src), ...context.flatMap(alloyBlocks)]);
  const parts = groups(src, context).map(group => ({ group, scope: boundsFor(bounds, group) }));
  const asked = parts.map(({ group, scope }) => build(group, scope, 'check'));
  const first = await solveAll(asked, java, jar);
  if ('error' in first) return { ok: false, error: first.error };
  const units = asked.flatMap(a => a.units);
  const scenarios = asked.reduce((sum, a) => sum + a.scenarios.length, 0);
  const failures: ScenarioFailure[] = [];
  const blamed: { index: number; cannot: { name: string; unit: string }[] }[] = [];
  asked.forEach((a, index) => {
    const found = first[index] as Map<string, boolean>;
    if (!found.get('consistent')) {
      failures.push({ scenario: 'consistent', conflict: a.units });
      return;
    }
    const cannot = a.scenarios.filter(({ name }) => !found.get(`${name}_with_all`));
    if (cannot.length > 0) blamed.push({ index, cannot });
  });
  const second = await solveAll(
    blamed.map(({ index, cannot }) => build((parts[index] as (typeof parts)[number]).group, (parts[index] as (typeof parts)[number]).scope, 'blame', { scenarios: cannot.map(c => c.name), leave: options.leave })),
    java,
    jar
  );
  if ('error' in second) return { ok: false, error: second.error };
  blamed.forEach(({ index, cannot }, k) => {
    const found = second[k] as Map<string, boolean>;
    // A unit whose removal lets the scenario happen is in every conflict: the repair has to touch one of them.
    for (const { name, unit } of cannot) {
      failures.push({ scenario: name, unit, conflict: (asked[index] as Program).units.filter(other => found.get(`${name}_without_${predicateName(other)}`)) });
    }
  });
  return failures.length === 0 ? { ok: true, units, scenarios } : { ok: false, units, scenarios, failures };
}
