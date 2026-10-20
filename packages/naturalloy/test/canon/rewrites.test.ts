/**
 * The rewrites of the verbalizer, asked of the Alloy analyzer: each formula the verbalizer says in place of another must
 * hold exactly when the other does. For each formula of the sweep, every rewrite is a check of `from <=> to`, for every
 * value of the variables it leaves free, in a scope of three atoms of each signature, integers of three bits and up to
 * three steps. The test needs the jar of the analyzer: set CANON_ALLOY_JAR, and CANON_JAVA when `java` is older than 17.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { join } from 'node:path';
import { type Node, parseFormula, parseModule, print } from '@bigmistqke/parse-alloy';
import { describe, expect, it } from 'vitest';
import { isDefinition, parseReadings, rewrites, verbalize, verbalizeDefinition, withDefinitions } from '../../src/verbalize.ts';
import { READINGS, SWEEP, VOCABULARY } from './sweep.ts';

const JAR = process.env.CANON_ALLOY_JAR;
const JAVA = process.env.CANON_JAVA ?? 'java';
const JOBS = Number(process.env.CANON_ALLOY_JOBS) || Math.max(1, Math.floor(availableParallelism() / 2));
const SCOPE = 'for 3 but 3 Int, 1..3 steps';

/** The type of a variable of the sweep that a formula leaves free, by its name. */
const FREE: Record<string, string> = { c: 'Cleanup', d: 'Cleanup', o: 'Owner', p: 'Owner', s: 'String', t: 'String', x: 'Int', y: 'Int' };

/** A rewrite with the variables it leaves free and their types. */
interface Pair {
  what: string;
  check: string;
}

/**
 * A formula as Alloy text, with the members the verbalizer names `m_1`, `m_2`, …, and the hole that stands for a variable
 * it tries as a noun phrase named `hole`.
 */
const text = (node: Node): string => print(holes(node)).replace(/\u0000(\d+)/g, 'm_$1');

/** The hole the verbalizer puts in place of a variable it tries as a noun phrase: one character below a space, one for each level. */
const HOLE = /^[\u0003-\u001f]$/;
const holeName = (name: string): string => `hole_${name.charCodeAt(0)}`;

function holes(node: Node): Node {
  const walk = (n: unknown): unknown => {
    if (Array.isArray(n)) return n.map(walk);
    if (n === null || typeof n !== 'object') return n;
    const o = n as Record<string, unknown>;
    if (o.t === 'name' && typeof o.name === 'string' && HOLE.test(o.name)) return { ...o, name: holeName(o.name) };
    return Object.fromEntries(Object.entries(o).map(([key, v]) => [key, key === 'span' ? v : walk(v)]));
  };
  return walk(node) as Node;
}

/** Each node of a tree, and each declaration in it with the text of its type. */
function walk(node: unknown, visit: (n: Record<string, unknown>) => void): void {
  if (Array.isArray(node)) for (const n of node) walk(n, visit);
  else if (node !== null && typeof node === 'object') {
    visit(node as Record<string, unknown>);
    for (const [key, value] of Object.entries(node)) if (key !== 'span') walk(value, visit);
  }
}

/** The type of each name a tree declares: `all x: Owner | …` declares `x` an owner. */
function declared(node: unknown, into: Map<string, string>): void {
  walk(node, n => {
    for (const decl of (n.decls as { names: string[]; type: Node }[] | undefined) ?? []) for (const name of decl.names) into.set(name.replace(/\u0000(\d+)/, 'm_$1'), text(decl.type));
  });
}

/** The names a tree uses. */
function names(node: unknown): Set<string> {
  const found = new Set<string>();
  walk(node, n => {
    if (n.t === 'name' && typeof n.name === 'string') found.add(HOLE.test(n.name) ? holeName(n.name) : n.name.replace(/\u0000(\d+)/, 'm_$1'));
  });
  return found;
}

/** The rewrites the verbalizer makes in saying each formula of the sweep, each as a check. */
function pairs(): Pair[] {
  const readings = withDefinitions(parseReadings(READINGS), VOCABULARY);
  // The words name a variable by its noun and number, `cleanup_1`; a body said for a call takes such names for its parameters.
  const nouns = new Map([...readings.nouns].map(([type, words]) => [words.replace(/[[\]]/g, '').replace(/^an? /, '').replace(/\s+/g, '_'), type]));
  const worded = (name: string): string | undefined => nouns.get(name.replace(/_\d+$/, ''));
  // The names the vocabulary declares at the top: its signatures, their fields, and its predicates, functions and macros.
  const vocabulary = new Set<string>(
    parseModule(VOCABULARY).paragraphs.flatMap(p => (p.t === 'sig' ? [...p.names, ...p.fields.flatMap(f => f.names)] : 'name' in p ? [p.name] : []))
  );
  const found = new Map<string, Pair>();
  for (const { what, formula } of SWEEP) {
    const recorded: [Node, Node][] = [];
    rewrites.record = (from, to) => recorded.push([from, to]);
    let said = true;
    try {
      if (isDefinition(formula)) verbalizeDefinition(formula, readings);
      else verbalize(formula, readings);
    } catch {
      // A refusal says nothing, so its rewrites reach no words; the sweep pins that it ends.
      said = false;
    } finally {
      rewrites.record = undefined;
    }
    if (!said || recorded.length === 0) continue;
    const types = new Map<string, string>(Object.entries(FREE));
    declared(isDefinition(formula) ? parseModule(formula) : parseFormula(formula), types);
    for (const [from, to] of recorded) declared([from, to], types);
    for (const [from, to] of recorded) {
      const used = names([from, to]);
      // A name of another module is not in this one, where the analyzer would look for it.
      if ([...used].some(name => name.includes('/'))) continue;
      const free = [...used].filter(name => !vocabulary.has(name) && !/^[A-Z]/.test(name) && (name.startsWith('hole_') || types.has(name) || worded(name) !== undefined));
      // A variable whose type names another, `x: c.on`, is declared after it.
      // A hole stands for any one value, so it ranges over everything.
      const typeOf = (name: string): string => (name.startsWith('hole_') ? 'univ' : (types.get(name) ?? worded(name))) as string;
      free.sort((a, b) => Number(free.some(f => new RegExp(`\\b${f}\\b`).test(typeOf(a)))) - Number(free.some(f => new RegExp(`\\b${f}\\b`).test(typeOf(b)))));
      const decls = free.map(name => `${name}: ${typeOf(name)}`).join(', ');
      const claim = `(${text(from)}) <=> (${text(to)})`;
      const check = decls === '' ? claim : `all ${decls} | ${claim}`;
      if (!found.has(check)) found.set(check, { what: `${what}: ${text(from)} as ${text(to)}`, check });
    }
  }
  return [...found.values()];
}

/** The analyzer on one module: for each check, whether it finds a counterexample, in the order of the checks. */
function analyze(dir: string, name: string, module: string): Promise<string> {
  const file = join(dir, `${name}.als`);
  writeFileSync(file, module);
  return new Promise(resolve => {
    const child = spawn(JAVA, ['-jar', JAR as string, 'exec', '-f', '-c', '*', file], { cwd: dir });
    let out = '';
    child.stdout.on('data', chunk => (out += chunk));
    child.stderr.on('data', chunk => (out += chunk));
    child.on('close', () => resolve(out));
  });
}

/** Each pair with the analyzer's verdict: `UNSAT` when no counterexample exists, `SAT` when one does, or what went wrong. */
async function verdicts(all: Pair[]): Promise<{ pair: Pair; verdict: string }[]> {
  const dir = mkdtempSync(join(tmpdir(), 'naturalloy-rewrites-'));
  try {
    const module = (batch: Pair[]): string => [VOCABULARY, ...batch.map((pair, i) => `check rewrite_${i} { ${pair.check} } ${SCOPE}`)].join('\n');
    const results: { pair: Pair; verdict: string }[] = [];
    // A batch that does not compile is asked again one pair at a time, so that one pair the analyzer rejects names itself.
    const run = async (batch: Pair[], name: string): Promise<void> => {
      const out = await analyze(dir, name, module(batch));
      const lines = [...out.matchAll(/^\d+\. check rewrite_(\d+)\s.*?\s(UNSAT|SAT)\s*$/gm)];
      if (lines.length === batch.length) {
        for (const [, i, verdict] of lines) results.push({ pair: batch[Number(i)] as Pair, verdict: verdict as string });
      } else if (batch.length > 1) {
        for (const [i, pair] of batch.entries()) await run([pair], `${name}_${i}`);
      } else results.push({ pair: batch[0] as Pair, verdict: out.trim().split('\n').slice(0, 4).join(' ') });
    };
    const batches: Pair[][] = [];
    for (let i = 0; i < all.length; i += 40) batches.push(all.slice(i, i + 40));
    const queue = [...batches.entries()];
    const worker = async (): Promise<void> => {
      for (let next = queue.shift(); next !== undefined; next = queue.shift()) await run(next[1], `batch_${next[0]}`);
    };
    await Promise.all(Array.from({ length: JOBS }, worker));
    return results;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe.skipIf(JAR === undefined)('the rewrites of the sweep, asked of the analyzer', () => {
  /**
   * @canon spec-a-rewrite-means-what-the-formula-it-replaces-means
   */
  it('finds no world in which a rewrite and the formula it replaces differ', async () => {
    const all = pairs();
    expect(all.length).toBeGreaterThan(0);
    const results = await verdicts(all);
    expect(results).toHaveLength(all.length);
    expect(results.filter(r => r.verdict !== 'UNSAT').map(r => ({ what: r.pair.what, verdict: r.verdict }))).toEqual([]);
  }, 1_800_000);
});
