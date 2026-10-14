/**
 * The statements of a document's units, said from their predicates. This file
 * tests the checker's own tooling, not a project's canon, so it carries no
 * `@canon` tag.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { afterEach, describe, expect, it } from 'vitest';
import { checkMaps } from './map.ts';
import { isGenerated, regionName, states, write } from './statements.ts';
import { readUnits } from './units.ts';

const CLI = join(dirname(fileURLToPath(import.meta.url)), 'cli.ts');

const DIRS: string[] = [];
afterEach(() => {
  for (const dir of DIRS.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const READINGS = '```readings\nnoun Node: node\nStarted: {1} has started | {1} has not started\nDone: {1} is done | {1} is not done\n```';

/** A document of one unit with a predicate; its statement is `statement` when given. */
const doc = (predicate = 'always all n: Node | n in Started implies eventually n in Done', statement = '', readings = READINGS): string => `# Canon

## @axiom a-root

> A root.

\`\`\`alloy vocabulary
sig Node {}
var sig Started, Done in Node {}
\`\`\`

${readings}

### @spec a-leaf

${statement}\`\`\`alloy
${predicate}
\`\`\`
`;

const REGION = regionName('spec-a-leaf');

describe('the states of the statements', () => {
  it('has none for a document that keeps no readings', () => {
    expect(states(doc(undefined, '', ''))).toEqual([]);
    expect(write(doc(undefined, '', '')).written).toEqual([]);
  });

  it('calls a unit with a predicate and no statement missing', () => {
    expect(states(doc())).toMatchObject([{ unit: 'spec-a-leaf', kind: 'missing' }]);
  });

  it('writes the statement below the heading, between markers, and then finds it current', () => {
    const { src, written } = write(doc());
    expect(written).toEqual(['spec-a-leaf']);
    expect(src).toContain(`### @spec a-leaf\n\n<!-- ${REGION}:begin`);
    expect(src).toContain(`<!-- ${REGION}:end -->\n\n\`\`\`alloy`);
    expect(states(src)).toMatchObject([{ kind: 'current' }]);
    expect(write(src)).toEqual({ src, written: [] });
  });

  it('says the statement as the unit reads it, in words from the readings', () => {
    const { src } = write(doc());
    const [unit] = readUnits(src).filter(u => u.id === 'spec-a-leaf');
    expect(unit?.statement).toContain('At every moment, for every node_1:');
    expect(unit?.statement).toContain('when node_1 has started, then now or at a later moment, node_1 is done.');
  });

  it('finds a statement stale when its predicate changes, and writes it again', () => {
    const { src } = write(doc());
    const changed = src.replace('implies eventually n in Done', 'implies n in Done');
    expect(states(changed)).toMatchObject([{ kind: 'stale' }]);
    const again = write(changed);
    expect(again.written).toEqual(['spec-a-leaf']);
    expect(again.src).toContain('when node_1 has started, node_1 is done.');
    expect(states(again.src)).toMatchObject([{ kind: 'current' }]);
  });

  it('overwrites an edit made inside the markers', () => {
    const { src } = write(doc());
    const edited = src.replace('> At every moment', '> Sometimes');
    expect(states(edited)).toMatchObject([{ kind: 'stale' }]);
  });

  it('never overwrites a statement that a person wrote', () => {
    const handwritten = doc(undefined, '> A node that has started is done.\n\n');
    expect(states(handwritten)).toMatchObject([{ kind: 'handwritten' }]);
    expect(write(handwritten)).toEqual({ src: handwritten, written: [] });
  });

  it('says why a predicate cannot be said, and leaves the document alone', () => {
    const odd = doc('always all n: Node | n in Mystery implies eventually n in Done');
    expect(states(odd)).toMatchObject([{ kind: 'unsayable', message: 'no reading for "Mystery"' }]);
    expect(write(odd).written).toEqual([]);
  });

  it('says why a unit with two predicates cannot be said', () => {
    const one = doc();
    const end = one.lastIndexOf('```\n');
    const two = `${one.slice(0, end)}\`\`\`\n\n\`\`\`alloy\nalways all n: Node | n in Done\n\`\`\`\n`;
    expect(states(two)).toMatchObject([{ kind: 'unsayable', message: expect.stringContaining('more than one predicate') }]);
  });

  it('writes every missing statement of a document without moving the others', () => {
    const second = '\n### @spec b-leaf\n\n```alloy\nalways all n: Node | n in Done\n```\n';
    const { src, written } = write(doc() + second);
    expect(written.sort()).toEqual(['spec-a-leaf', 'spec-b-leaf']);
    expect(src.indexOf('### @spec a-leaf')).toBeLessThan(src.indexOf(`${regionName('spec-a-leaf')}:begin`));
    expect(src.indexOf(`${regionName('spec-a-leaf')}:end`)).toBeLessThan(src.indexOf('### @spec b-leaf'));
    expect(states(src).map(s => s.kind)).toEqual(['current', 'current']);
  });

  it('writes a quote that Markdown reads as paragraphs and a bulleted list', () => {
    const { src } = write(doc('always all n: Node | n in Started and n not in Done and n in Started and n not in Done implies eventually n in Done'));
    const quote = src.split('\n').filter(l => l.startsWith('>')).slice(1).join('\n');
    const tree = unified().use(remarkParse).parse(quote) as { children: { type: string; children: { type: string }[] }[] };
    const inner = tree.children[0]?.children.map(n => n.type);
    expect(inner).toEqual(['paragraph', 'paragraph', 'list', 'paragraph']);
  });
});

describe('the words of a statement', () => {
  const linked = `# Canon

## @term node

> A node is a node.

\`\`\`alloy vocabulary
sig Node {}
var sig Started, Done in Node {}
\`\`\`

\`\`\`readings
noun Node: [node]
Started: {1} has [started] | {1} has not [started]
\`\`\`

## @term done

\`\`\`alloy
pred finished[n: Node] { n in Done and n in Started }
\`\`\`

\`\`\`alloy vocabulary
\`\`\`

\`\`\`readings
Done: {1} is [done] | {1} is not [done]
finished: {1} is [finished] | {1} is not [finished]
\`\`\`

## @axiom a-node-finishes

\`\`\`alloy
always all n: Node | n in Started implies eventually finished[n]
\`\`\`
`;

  it('link to the terms that say them, the first time each is mentioned', () => {
    const { src } = write(linked);
    const unit = readUnits(src).find(u => u.id === 'axiom-a-node-finishes');
    expect(unit?.statement).toContain('for every [node_1](#term-node)');
    // "started" is said by the term for the node, which the statement has already linked: a term is linked once
    expect(unit?.statement).toContain('node_1 has started');
    expect(unit?.statement).not.toContain('[started]');
    expect(unit?.statement).toContain('[finished](#term-done)');
  });

  it('never link a statement to its own unit', () => {
    const { src } = write(linked);
    const unit = readUnits(src).find(u => u.id === 'term-done');
    expect(unit?.statement).toContain('[node_1](#term-node)');
    expect(unit?.statement).not.toContain('(#term-done)');
  });
});

describe('a unit whose statement is generated', () => {
  it('is known as generated, and needs no map', () => {
    const plain = doc();
    expect(checkMaps(plain).map(f => f.kind)).toEqual(['unmapped']);
    const { src } = write(plain);
    expect(isGenerated(src, 'spec-a-leaf')).toBe(true);
    expect(checkMaps(src)).toEqual([]);
  });
});

/** A project of one document; runs the command line over it and returns what it printed, its code and the document. */
function project(document: string, ...commands: string[][]) {
  const dir = mkdtempSync(join(tmpdir(), 'canon-statements-'));
  DIRS.push(dir);
  mkdirSync(join(dir, 'test', 'canon'), { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ canon: { documents: ['CANON.md'], suites: 'test/canon', sources: ['test'], command: 'canon' } }));
  writeFileSync(join(dir, 'CANON.md'), document);
  const runs = commands.map(args => {
    const run = spawnSync(process.execPath, [CLI, ...args], { cwd: dir, encoding: 'utf8' });
    return { out: `${run.stdout}${run.stderr}`, code: run.status };
  });
  return { runs, document: readFileSync(join(dir, 'CANON.md'), 'utf8'), dir };
}

describe('the command line', () => {
  it('generates the statements, and check then finds them current', () => {
    const { runs, document } = project(doc(), ['generate'], ['check'], ['generate']);
    expect(runs[0]?.out).toContain('wrote the statement of spec-a-leaf in CANON.md');
    expect(runs[0]?.code).toBe(0);
    expect(runs[1]?.out).not.toContain('spec-a-leaf: ');
    expect(runs[2]?.out).not.toContain('wrote the statement');
    expect(document).toContain(`${REGION}:begin`);
  });

  it('reports a statement that is missing or stale as a finding of check, before the summary', () => {
    const { runs } = project(doc(), ['check']);
    expect(runs[0]?.out).toContain('CANON.md: spec-a-leaf: missing:');
    expect(runs[0]?.out.indexOf('missing:')).toBeLessThan(runs[0]?.out.indexOf('finding') ?? 0);
    expect(runs[0]?.code).toBe(1);
  });

  it('stops generate on a statement that a person wrote, and says so', () => {
    const { runs, document } = project(doc(undefined, '> A node that has started is done.\n\n'), ['generate']);
    expect(runs[0]?.out).toContain('spec-a-leaf: handwritten: has a statement of its own');
    expect(runs[0]?.code).toBe(1);
    expect(document).toContain('> A node that has started is done.');
  });

  it('leaves a document alone that does not name the plugin', () => {
    const { runs, document } = project(`---\nplugins: ["@bigmistqke/canon/lint"]\n---\n${doc()}`, ['generate'], ['check']);
    expect(runs[0]?.out).not.toContain('wrote the statement');
    expect(runs[1]?.out).not.toContain('spec-a-leaf: ');
    expect(document).not.toContain(':begin');
  });

  it('is not read by the prose check', () => {
    const long = doc('always all n: Node | n in Started and n not in Done and n in Started and n not in Done implies eventually n in Done');
    const { runs } = project(long, ['generate'], ['lint']);
    expect(runs[1]?.out).not.toContain('sentence-length');
    expect(runs[1]?.code).toBe(0);
  });
});
