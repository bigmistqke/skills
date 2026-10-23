/**
 * The Alloy backend of the logic layer: the vocabulary and the predicates of a
 * document's `alloy` blocks, checked together by the Alloy analyzer. It answers
 * one question — can all the units hold at once, within the bounds — and, when
 * they cannot, which units a repair has to touch.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { availableParallelism, tmpdir, totalmem } from 'node:os';
import { join } from 'node:path';
import { readBlocks, type Block } from '@bigmistqke/canon/blocks';
import { readUnits } from '@bigmistqke/canon/units';
import { declaredIn, PARAGRAPHS, strip } from './words.ts';

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
  /** The names of the scenario predicates whose world to keep, for the scenarios that can happen. */
  show?: string[];
  /** The folder that keeps the analyzer's answers from one run for the next; none is kept or read without it. */
  cache?: string;
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

/**
 * A world in which a scenario happens while every held unit holds: the
 * analyzer's text of its trace, and the model it is a world of. A scenario that
 * can happen has no trace when the analyzer wrote none.
 */
export interface World {
  scenario: string;
  trace?: string;
  model: string;
}

export type AlloyResult =
  | { ok: true; units: string[]; scenarios: number; worlds: World[] }
  | { ok: false; units: string[]; scenarios: number; failures: ScenarioFailure[]; worlds: World[] }
  | { ok: false; error: string };

/** The default scope, when no `alloy bounds` block gives one. */
const DEFAULT_BOUNDS = 'for 3 but 1..8 steps';

/** The Alloy name of a unit's predicate: its id, with underscores for hyphens. */
export const predicateName = (unit: string): string => unit.replace(/-/g, '_');

/** A unit's block as Alloy paragraphs: a bare formula becomes the predicate named after the unit. */
function paragraphs(block: Block): string {
  return PARAGRAPHS.test(block.body) ? block.body : `pred ${predicateName(block.unit)} {\n${block.body}}\n`;
}

/** The name of the predicate that states a scenario: the unit that holds it, and its place among that unit's scenarios. */
const scenarioName = (unit: string, nth: number): string => `scenario_${nth}_${predicateName(unit)}`;

/** The name of each scenario among the blocks, by its place among the scenarios of its unit; the same place its statement goes by. */
const scenarioNames = (blocks: Block[]): Map<Block, string> =>
  new Map(
    blocks
      .filter(b => b.role === 'scenario')
      .map((block, i, all) => [block, scenarioName(block.unit, all.slice(0, i).filter(o => o.unit === block.unit).length + 1)])
  );

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
 * finds units that contradict each other in every trace. Each scenario goes
 * by its name in `named`, so a group's scenarios keep the names of their document.
 */
function build(blocks: Block[], bounds: string, runs: Runs, only?: Only, named: Map<Block, string> = scenarioNames(blocks)): Program {
  // A unit that holds only definitions, such as a term that defines a predicate, is part of the model and not a claim to hold.
  const units = [...new Set(blocks.filter(b => b.role === 'unit' && !PARAGRAPHS.test(b.body)).map(b => b.unit))];
  const names = units.map(predicateName);
  const scenarios = blocks.filter(b => b.role === 'scenario').map(block => ({ block, name: named.get(block) as string }));
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
const mentions = (body: string): Set<string> => new Set(strip(body).match(/[A-Za-z_]\w*/g) ?? []);

/** The blocks that a document is checked with, those of the documents it extends first; which of them are its own; and the name of each scenario. */
function blocksOf(src: string, context: string[]): { blocks: Block[]; own: Set<Block>; named: Map<Block, string> } {
  const own = alloyBlocks(src);
  const blocks = [...context.flatMap(alloyBlocks), ...own];
  return { blocks, own: new Set(own), named: scenarioNames(blocks) };
}

/**
 * The groups of blocks that share a word: a block joins the blocks that declare
 * a signature, a field or a predicate it mentions. Units in different groups
 * talk about different things, so no group can contradict another, and each
 * can be asked about alone. A group with no unit to hold and no scenario is
 * left out.
 */
export function groups(src: string, context: string[] = []): Block[][] {
  return groupsOf(blocksOf(src, context));
}

/** The groups of the blocks of a document, as `groups` says. */
function groupsOf({ blocks: all, own }: { blocks: Block[]; own: Set<Block> }): Block[][] {
  const blocks = all.filter(b => b.role !== 'bounds');
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
  return [...byRoot.values()].filter(group => group.some(b => own.has(b)) && group.some(b => b.role === 'scenario' || (b.role === 'unit' && !PARAGRAPHS.test(b.body))));
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

type Solved = { found: Map<string, boolean>; traces: Map<string, string> };

/** The name of a run: `run <name> { … }`. */
const runName = (command: string): string => /^run\s+(\w+)/.exec(command)?.[1] ?? '';

/** The largest heap of each analyzer process, in gigabytes. */
const HEAP_GB = 1;

/**
 * The options of Java for each analyzer process. One collector thread: several
 * processes run at once, and a collector with a thread for every core makes them
 * wait for each other. A heap with a limit, so that the processes that memory
 * holds can be counted.
 *
 * @canon spec-each-analyzer-process-takes-a-heap-of-at-most-one-gigabyte
 */
const JAVA_OPTIONS = ['-XX:+UseSerialGC', `-Xmx${HEAP_GB}g`];

/** The options of the analyzer's `exec`, besides the folder it writes to and the file it reads. */
const EXEC_OPTIONS = ['exec', '-f', '-t', 'text'];

/** What a machine has for the analyzer: its processors, and its memory in bytes. */
export interface Machine {
  processors: number;
  memory: number;
}

/**
 * How many analyzer processes run at once: `CANON_ALLOY_JOBS` when it holds a
 * number above zero; otherwise no more than the machine has processors, no more
 * than half of its memory holds at the largest heap of each, and at least one.
 *
 * @canon spec-the-analyzer-runs-no-more-processes-at-once-than-the-machine-holds
 */
export function jobs(env: Record<string, string | undefined> = process.env, machine: Machine = { processors: availableParallelism(), memory: totalmem() }): number {
  const asked = Math.floor(Number(env.CANON_ALLOY_JOBS));
  if (asked >= 1) return asked;
  return Math.max(1, Math.min(machine.processors, Math.floor(machine.memory / 2 / (HEAP_GB * 2 ** 30))));
}

/** The major version of each Java, by its path, as it says it with `-version`; none when it does not say. */
const majors = new Map<string, number | undefined>();

function javaMajor(java: string): number | undefined {
  if (!majors.has(java)) {
    const said = spawnSync(java, ['-version'], { encoding: 'utf8' });
    // `openjdk version "21.0.2"`, or `java version "1.8.0_391"` before Java 9.
    const m = /version "(\d+)(?:\.(\d+))?/.exec(`${said.stderr ?? ''}${said.stdout ?? ''}`);
    majors.set(java, m === null ? undefined : Number(m[1] === '1' ? m[2] : m[1]));
  }
  return majors.get(java);
}

/** The hash of each jar's content, by its path, with the size and the time of change it was read at. */
const jars = new Map<string, { stamp: string; hash: string }>();

function jarHash(jar: string): string | undefined {
  try {
    const { size, mtimeMs } = statSync(jar);
    const stamp = `${size}:${mtimeMs}`;
    const known = jars.get(jar);
    if (known?.stamp === stamp) return known.hash;
    const hash = createHash('sha256').update(readFileSync(jar)).digest('hex');
    jars.set(jar, { stamp, hash });
    return hash;
  } catch {
    return undefined;
  }
}

/**
 * The key of a search's answer: the program the analyzer reads, the content of
 * its jar, its options and the major version of Java. Nothing else decides the
 * answer. None when the jar cannot be read or the Java does not say its version:
 * such a search keeps no answer.
 *
 * @canon spec-a-search-whose-program-and-analyzer-are-unchanged-keeps-its-earlier-answer
 */
function answerKey(program: string, java: string, jar: string, keep: boolean): string | undefined {
  const hash = jarHash(jar);
  const major = javaMajor(java);
  if (hash === undefined || major === undefined) return undefined;
  return createHash('sha256')
    .update(JSON.stringify({ program, jar: hash, options: [...JAVA_OPTIONS, ...EXEC_OPTIONS, keep ? 'keep' : 'no-keep'], java: major }))
    .digest('hex');
}

/** An answer as it is kept: whether each run found an instance, and the text of each instance that was kept. */
interface Kept {
  found: Record<string, boolean>;
  traces: Record<string, string>;
}

/** How long a kept answer that no run uses stays: thirty days. */
const KEPT_FOR_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Remove each kept answer that no run used in the time a kept answer stays. A
 * file's time of change is the last time a run used it.
 *
 * @canon spec-the-kept-answers-are-only-those-used-in-the-last-thirty-days
 */
function sweep(cache: string, now = Date.now()): void {
  let names: string[];
  try {
    names = readdirSync(cache);
  } catch {
    return;
  }
  for (const name of names) {
    if (!/^[0-9a-f]{64}\.json/.test(name)) continue;
    const file = join(cache, name);
    try {
      if (now - statSync(file).mtimeMs > KEPT_FOR_MS) rmSync(file, { force: true });
    } catch {
      // Another run removed it first.
    }
  }
}

/** The answer kept in `file`, or none when there is none or it cannot be read; one that is read counts as used now. */
function readKept(file: string): Solved | undefined {
  let kept: Kept;
  try {
    kept = JSON.parse(readFileSync(file, 'utf8')) as Kept;
  } catch {
    return undefined;
  }
  try {
    const now = new Date();
    utimesSync(file, now, now);
  } catch {
    // A folder that cannot be written still answers; its answers only age.
  }
  return { found: new Map(Object.entries(kept.found)), traces: new Map(Object.entries(kept.traces)) };
}

/** Keep an answer in `file`. Several processes may write at once, so each writes a file of its own and moves it in place. A cache that cannot be written only costs time. */
function writeKept(file: string, { found, traces }: Solved): void {
  const kept: Kept = { found: Object.fromEntries(found), traces: Object.fromEntries(traces) };
  const part = `${file}.${process.pid}.${Math.random().toString(36).slice(2)}`;
  try {
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(part, JSON.stringify(kept));
    renameSync(part, file);
  } catch {
    rmSync(part, { force: true });
  }
}

/** Where the analyzer is, and the folder that keeps its answers, if any. */
interface Analyzer {
  java: string;
  jar: string;
  cache?: string;
}

/**
 * Answer one run of a model: the answer kept for it, or else the analyzer's,
 * which is then kept. An error is never kept: it says nothing about the model.
 */
async function solveOne(model: string, command: string, analyzer: Analyzer, keep = false): Promise<Solved | { error: string }> {
  const program = `${model}\n${command}\n`;
  const key = analyzer.cache === undefined ? undefined : answerKey(program, analyzer.java, analyzer.jar, keep);
  const file = key === undefined ? undefined : join(analyzer.cache as string, `${key}.json`);
  const kept = file === undefined ? undefined : readKept(file);
  if (kept !== undefined) return kept;
  const answer = await analyze(program, command, analyzer, keep);
  if (file !== undefined && !('error' in answer)) writeKept(file, answer);
  return answer;
}

/**
 * Run the analyzer over a program that holds one run, and say whether the run
 * found an instance; with `keep`, the analyzer's text of the instance it found.
 */
function analyze(program: string, command: string, { java, jar }: Analyzer, keep: boolean): Promise<Solved | { error: string }> {
  return new Promise(resolve => {
    const dir = mkdtempSync(join(tmpdir(), 'canon-alloy-'));
    const done = (result: Solved | { error: string }): void => {
      rmSync(dir, { recursive: true, force: true });
      resolve(result);
    };
    const file = join(dir, 'model.als');
    writeFileSync(file, program);
    const child = spawn(java, [...JAVA_OPTIONS, '-jar', jar, ...EXEC_OPTIONS, '-o', join(dir, 'out'), file]);
    let log = '';
    child.stdout.on('data', chunk => (log += chunk));
    child.stderr.on('data', chunk => (log += chunk));
    child.on('error', error => done({ error: error.message }));
    child.on('close', () => {
      try {
        const found = solved(readFileSync(join(dir, 'out', 'receipt.json'), 'utf8'));
        const traces = new Map<string, string>();
        const name = runName(command);
        // The text of an instance holds what the receipt leaves out: the signatures declared with `in`, and the step the trace loops back to.
        const trace = join(dir, 'out', `${name}-solution-0.txt`);
        if (keep && found.get(name) && existsSync(trace)) traces.set(name, readFileSync(trace, 'utf8'));
        done({ found, traces });
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

/**
 * Ask the analyzer about the runs of several programs at once, each run in a
 * process of its own; whether each run of each program found an instance, or
 * the first error. The runs named in `keep` keep the text of their instance.
 */
async function solveAll(programs: Program[], analyzer: Analyzer, keep: Set<string> = new Set()): Promise<{ found: Map<string, boolean>[]; traces: Map<string, string>[] } | { error: string }> {
  const tasks = programs.flatMap((p, i) => p.commands.map(command => () => solveOne(p.model, command, analyzer, keep.has(runName(command))).then(result => ({ i, result }))));
  const answers = await pool(tasks, jobs());
  const found: Map<string, boolean>[] = programs.map(() => new Map());
  const traces: Map<string, string>[] = programs.map(() => new Map());
  for (const { i, result } of answers) {
    if ('error' in result) return { error: result.error };
    for (const [name, yes] of result.found) (found[i] as Map<string, boolean>).set(name, yes);
    for (const [name, text] of result.traces) (traces[i] as Map<string, string>).set(name, text);
  }
  return { found, traces };
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
  const analyzer: Analyzer = { java, jar, cache: options.cache };
  const context = options.context ?? [];
  const bounds = boundsOf([...alloyBlocks(src), ...context.flatMap(alloyBlocks)]);
  const document = blocksOf(src, context);
  const parts = groupsOf(document).map(group => ({ group, scope: boundsFor(bounds, group) }));
  const asked = parts.map(({ group, scope }) => build(group, scope, 'check', undefined, document.named));
  // Only the document's own scenarios are shown: one of a document it extends is shown where that document is checked.
  const ownNames = new Set([...document.named].filter(([block]) => document.own.has(block)).map(([, name]) => name));
  const shown = new Set((options.show ?? []).filter(name => ownNames.has(name)));
  const first = await solveAll(asked, analyzer, new Set([...shown].map(name => `${name}_with_all`)));
  if ('error' in first) return { ok: false, error: first.error };
  const worlds: World[] = asked.flatMap((a, index) =>
    a.scenarios
      .filter(({ name }) => shown.has(name) && first.found[index]?.get(`${name}_with_all`))
      .map(({ name }) => ({ scenario: name, trace: first.traces[index]?.get(`${name}_with_all`), model: a.model }))
  );
  const units = asked.flatMap(a => a.units);
  const scenarios = asked.reduce((sum, a) => sum + a.scenarios.length, 0);
  const failures: ScenarioFailure[] = [];
  const blamed: { index: number; cannot: { name: string; unit: string }[] }[] = [];
  asked.forEach((a, index) => {
    const found = first.found[index] as Map<string, boolean>;
    if (!found.get('consistent')) {
      failures.push({ scenario: 'consistent', conflict: a.units });
      return;
    }
    const cannot = a.scenarios.filter(({ name }) => !found.get(`${name}_with_all`));
    if (cannot.length > 0) blamed.push({ index, cannot });
  });
  const second = await solveAll(
    blamed.map(({ index, cannot }) =>
      build((parts[index] as (typeof parts)[number]).group, (parts[index] as (typeof parts)[number]).scope, 'blame', { scenarios: cannot.map(c => c.name), leave: options.leave }, document.named)
    ),
    analyzer
  );
  if ('error' in second) return { ok: false, error: second.error };
  blamed.forEach(({ index, cannot }, k) => {
    const found = second.found[k] as Map<string, boolean>;
    // A unit whose removal lets the scenario happen is in every conflict: the repair has to touch one of them.
    for (const { name, unit } of cannot) {
      failures.push({ scenario: name, unit, conflict: (asked[index] as Program).units.filter(other => found.get(`${name}_without_${predicateName(other)}`)) });
    }
  });
  if (analyzer.cache !== undefined) sweep(analyzer.cache);
  return failures.length === 0 ? { ok: true, units, scenarios, worlds } : { ok: false, units, scenarios, failures, worlds };
}
