/**
 * The graph command over small projects: the Mermaid text it prints, and the
 * SVG it prints with `--svg`.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { render } from 'pele';
import { afterEach, describe, expect, it } from 'vitest';
import { plugin } from '../../src/index.ts';

const AXIOM = ['@', 'axiom'].join('');
const SPEC = ['@', 'spec'].join('');
const FACT = ['@', 'fact'].join('');
const EXCEPTION = ['@', 'exception'].join('');
const BUG = ['@', 'bug'].join('');
const TERM = ['@', 'term'].join('');
const CONFLICT = ['@', 'conflict'].join('');

const DIRS: string[] = [];
afterEach(() => {
  for (const dir of DIRS.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** What a run printed on standard output, and the code the plugin gave it. */
interface Run {
  out: string;
  code: number;
}

/** Write `files` into a fresh project, and run the graph command over `documents`, or over every file. */
async function graph(files: Record<string, string>, options: { svg?: boolean; documents?: string[] } = {}): Promise<Run> {
  const root = mkdtempSync(join(tmpdir(), 'canon-graph-'));
  DIRS.push(root);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  const documents = options.documents ?? Object.keys(files);
  const chunks: string[] = [];
  const write = process.stdout.write.bind(process.stdout);
  process.stdout.write = ((chunk: string | Uint8Array) => {
    chunks.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8'));
    return true;
  }) as typeof process.stdout.write;
  try {
    const code = await plugin.commands.graph!({
      args: [],
      root,
      documents,
      config: undefined,
      options: options.svg ? { svg: true } : {}
    });
    return { out: chunks.join(''), code };
  } finally {
    process.stdout.write = write;
  }
}

/** A node of the Mermaid text: its label and its class. */
interface Node {
  label: string;
  className: string | undefined;
}

/** An edge of the Mermaid text, between the labels of its nodes. */
interface Edge {
  from: string;
  to: string;
  line: 'solid' | 'dotted';
}

/** The nodes, edges and class definitions of the Mermaid text the command prints. */
function parse(text: string): { header: string; nodes: Node[]; edges: Edge[]; classes: Map<string, string> } {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
  const byId = new Map<string, Node>();
  const pending: [string, string, Edge['line']][] = [];
  const classes = new Map<string, string>();
  for (const line of lines.slice(1)) {
    const node = /^([\w-]+)\["([^"]*)"\](?::::([\w-]+))?$/.exec(line);
    const edge = /^([\w-]+)\s*(-->|-\.->)\s*([\w-]+)$/.exec(line);
    const classDef = /^classDef\s+([\w-]+)\s+(.+)$/.exec(line);
    if (node) byId.set(node[1], { label: node[2], className: node[3] });
    else if (edge) pending.push([edge[1], edge[3], edge[2] === '-->' ? 'solid' : 'dotted']);
    else if (classDef) classes.set(classDef[1], classDef[2]);
    else throw new Error(`a line the test cannot read: ${line}`);
  }
  const label = (id: string): string => {
    const node = byId.get(id);
    if (node === undefined) throw new Error(`an edge names an undeclared node: ${id}`);
    return node.label;
  };
  const edges = pending.map(([from, to, line]) => ({ from: label(from), to: label(to), line }));
  return { header: lines[0], nodes: [...byId.values()], edges, classes };
}

/** The labels of the nodes. */
const labels = (text: string): string[] => parse(text).nodes.map(node => node.label);

/** The edges, as `from -> to`. */
const arrows = (text: string): string[] => parse(text).edges.map(edge => `${edge.from} -> ${edge.to}`);

/** The fill a node of `label` takes from its class. */
function fillOf(text: string, label: string): string {
  const { nodes, classes } = parse(text);
  const node = nodes.find(n => n.label === label);
  if (node?.className === undefined) throw new Error(`no class on ${label}`);
  const fill = /(?:^|,)fill:([^,]+)/.exec(classes.get(node.className) ?? '');
  if (fill === null) throw new Error(`no fill for the class of ${label}`);
  return fill[1];
}

/** One unit of each kind that the graph draws, with a term and a conflict beside them. */
const EVERY_KIND = `# Canon

## Terms

### ${TERM} word

> A word is a word.

## ${AXIOM} root

> A value.

#### ${SPEC} claim

> A claim.

##### ${EXCEPTION} pinch

> Where a fact pinches.

Derives from: [\`fact-ground\`](#fact-ground)

##### ${BUG} defect

> A known defect.

## ${FACT} ground

> How the platform is.

## Conflicts

### ${CONFLICT} clash

> Two units disagree.

Between: [\`spec-claim\`](#spec-claim), [\`axiom-root\`](#axiom-root)
`;

/** An axiom with a spec two levels deep, a spec with two further parents, and a link in a body. */
const NESTED = `# Canon

## ${AXIOM} root

> A value.

#### ${SPEC} middle

> A claim.

##### ${SPEC} leaf

> One case of it.

#### ${SPEC} other

> Another claim.

#### ${SPEC} joined

> A claim that follows from two.

Derives from: [\`spec-middle\`](#spec-middle), [\`spec-other\`](#spec-other)

This follows because of [\`spec-leaf\`](#spec-leaf), which it only mentions.
`;

/** Two documents in two folders, one deriving from the other and from a third that is not drawn. */
const BASE = `# Base

## ${AXIOM} base-root

> A value of the base.
`;

const USER = `# User

## ${AXIOM} user-root

> A value of the user.

#### ${SPEC} borrowed

> A claim that follows from the base.

Derives from: [\`axiom-base-root\`](../base/CANON.md#axiom-base-root), [\`axiom-elsewhere\`](../elsewhere/CANON.md#axiom-elsewhere)

#### ${SPEC} borrowed-too

> Another claim that follows from the same outside unit.

Derives from: [\`axiom-elsewhere\`](../elsewhere/CANON.md#axiom-elsewhere)
`;

const ELSEWHERE = `# Elsewhere

## ${AXIOM} elsewhere

> A value nobody draws.

#### ${SPEC} hidden

> A claim of a document that is not drawn.
`;

describe('the output of the graph command', () => {
  /** @canon spec-the-graph-is-printed-as-mermaid-text */
  it('prints a Mermaid flowchart and gives code 0', async () => {
    const run = await graph({ 'CANON.md': NESTED });
    expect(run.code).toBe(0);
    expect(run.out.startsWith('flowchart ')).toBe(true);
    expect(() => render(run.out)).not.toThrow();
    expect(render(run.out).type).toBe('flowchart');
  });

  /** @canon spec-the-graph-is-printed-as-svg-with-the-svg-option */
  it('prints with --svg what Pele renders from the Mermaid text, with only the style and the background added', async () => {
    const text = (await graph({ 'CANON.md': NESTED })).out;
    const run = await graph({ 'CANON.md': NESTED }, { svg: true });
    expect(run.code).toBe(0);
    const added = /^(<svg[^>]*>)(<style>[\s\S]*?<\/style><rect [^>]*\/>)/.exec(run.out);
    expect(added).not.toBeNull();
    expect(run.out.replace(added![2], '')).toBe(render(text).svg);
  });
});

describe('the nodes of the graph', () => {
  /** @canon spec-the-graph-draws-each-drawn-unit-of-a-document-once */
  it('draws each unit of one document once, labelled with its id', async () => {
    const drawn = labels((await graph({ 'CANON.md': NESTED })).out);
    expect(drawn.sort()).toEqual(['axiom-root', 'spec-joined', 'spec-leaf', 'spec-middle', 'spec-other']);
  });

  /** @canon spec-the-graph-draws-the-units-of-several-drawn-documents-in-one-graph */
  it('draws the units of several documents in one graph', async () => {
    const run = await graph({ 'base/CANON.md': BASE, 'user/CANON.md': USER });
    expect(run.out.match(/^flowchart /gm)).toHaveLength(1);
    expect(labels(run.out)).toEqual(expect.arrayContaining(['axiom-base-root', 'axiom-user-root', 'spec-borrowed', 'spec-borrowed-too']));
  });

  /** @canon spec-the-graph-draws-no-term */
  it('draws no term', async () => {
    const drawn = labels((await graph({ 'CANON.md': EVERY_KIND })).out);
    expect(drawn).toContain('spec-claim');
    expect(drawn).not.toContain('term-word');
  });

  /** @canon spec-the-graph-draws-no-conflict */
  it('draws no conflict', async () => {
    const drawn = labels((await graph({ 'CANON.md': EVERY_KIND })).out);
    expect(drawn).toContain('spec-claim');
    expect(drawn).not.toContain('conflict-clash');
  });
});

describe('the direction of the graph', () => {
  /** @canon spec-the-graph-runs-from-left-to-right */
  it('declares a flowchart from left to right', async () => {
    expect(parse((await graph({ 'CANON.md': NESTED })).out).header).toBe('flowchart LR');
  });
});

describe('the edges of the graph', () => {
  /** @canon spec-a-unit-has-an-edge-from-the-unit-it-sits-in */
  it('draws an edge from the unit a unit sits in, and not from the units above it', async () => {
    const edges = arrows((await graph({ 'CANON.md': NESTED })).out);
    expect(edges).toContain('axiom-root -> spec-middle');
    expect(edges).toContain('spec-middle -> spec-leaf');
    expect(edges).not.toContain('axiom-root -> spec-leaf');
  });

  /** @canon spec-a-unit-has-an-edge-from-each-unit-it-derives-from */
  it('draws an edge from each unit on a "Derives from:" line', async () => {
    const edges = arrows((await graph({ 'CANON.md': NESTED })).out);
    expect(edges).toContain('spec-middle -> spec-joined');
    expect(edges).toContain('spec-other -> spec-joined');
  });

  /** @canon spec-a-derivation-from-another-drawn-document-is-an-edge */
  it('draws an edge from a unit of another drawn document', async () => {
    const run = await graph({ 'base/CANON.md': BASE, 'user/CANON.md': USER });
    expect(arrows(run.out)).toContain('axiom-base-root -> spec-borrowed');
    expect(labels(run.out).filter(label => label === 'axiom-base-root')).toHaveLength(1);
  });

  /** @canon spec-a-derivation-to-an-outside-unit-ends-at-a-node-that-names-it */
  it('ends a derivation from an outside unit at one node that names it, with no edge into it', async () => {
    const run = await graph(
      { 'base/CANON.md': BASE, 'user/CANON.md': USER, 'elsewhere/CANON.md': ELSEWHERE },
      { documents: ['base/CANON.md', 'user/CANON.md'] }
    );
    const drawn = labels(run.out);
    const edges = arrows(run.out);
    expect(drawn.filter(label => label === 'axiom-elsewhere')).toHaveLength(1);
    expect(drawn).not.toContain('spec-hidden');
    expect(edges).toContain('axiom-elsewhere -> spec-borrowed');
    expect(edges).toContain('axiom-elsewhere -> spec-borrowed-too');
    expect(edges.filter(edge => edge.endsWith('-> axiom-elsewhere'))).toEqual([]);
  });

  /** @canon spec-a-link-in-the-body-draws-no-edge */
  it('draws no edge for a link in the body', async () => {
    const edges = arrows((await graph({ 'CANON.md': NESTED })).out);
    expect(edges).toContain('spec-other -> spec-joined');
    expect(edges.filter(edge => edge.startsWith('spec-leaf ->'))).toEqual([]);
  });

  /** @canon spec-an-edge-from-the-unit-a-unit-sits-in-is-solid */
  it('draws the edge of nesting solid', async () => {
    const { edges } = parse((await graph({ 'CANON.md': NESTED })).out);
    expect(edges.find(edge => edge.from === 'spec-middle' && edge.to === 'spec-leaf')?.line).toBe('solid');
  });

  /** @canon spec-an-edge-from-a-unit-it-derives-from-is-dotted */
  it('draws the edge of a "Derives from:" line dotted', async () => {
    const { edges } = parse((await graph({ 'CANON.md': NESTED })).out);
    expect(edges.find(edge => edge.from === 'spec-other' && edge.to === 'spec-joined')?.line).toBe('dotted');
  });
});

describe('the fills of the kinds', () => {
  const KINDS = ['axiom-root', 'fact-ground', 'spec-claim', 'exception-pinch', 'bug-defect'];

  /** The fill of the unit of one kind, and the fills of the other four. */
  async function fills(label: string): Promise<{ own: string; others: string[] }> {
    const text = (await graph({ 'CANON.md': EVERY_KIND })).out;
    return { own: fillOf(text, label), others: KINDS.filter(other => other !== label).map(other => fillOf(text, other)) };
  }

  /** @canon spec-an-axiom-has-a-fill-of-its-own */
  it('gives an axiom a fill of its own', async () => {
    const { own, others } = await fills('axiom-root');
    expect(others).not.toContain(own);
  });

  /** @canon spec-a-fact-has-a-fill-of-its-own */
  it('gives a fact a fill of its own', async () => {
    const { own, others } = await fills('fact-ground');
    expect(others).not.toContain(own);
  });

  /** @canon spec-a-spec-has-a-fill-of-its-own */
  it('gives a spec a fill of its own', async () => {
    const { own, others } = await fills('spec-claim');
    expect(others).not.toContain(own);
  });

  /** @canon spec-an-exception-has-a-fill-of-its-own */
  it('gives an exception a fill of its own', async () => {
    const { own, others } = await fills('exception-pinch');
    expect(others).not.toContain(own);
  });

  /** @canon spec-a-bug-has-a-fill-of-its-own */
  it('gives a bug a fill of its own', async () => {
    const { own, others } = await fills('bug-defect');
    expect(others).not.toContain(own);
  });
});

describe('the colours of the SVG', () => {
  const VARIABLES = ['--pele-bg', '--pele-fg', '--pele-muted', '--pele-line', '--pele-surface', '--pele-surface-alt', '--pele-border', '--pele-accent'];

  /** The declarations of the rule on `svg` in the style the SVG holds: outside the media query, or inside it. */
  async function declarations(dark: boolean): Promise<Map<string, string>> {
    const svg = (await graph({ 'CANON.md': NESTED }, { svg: true })).out;
    const style = /<style>([\s\S]*?)<\/style>/.exec(svg)?.[1] ?? '';
    const media = /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{([\s\S]*)\}\s*$/.exec(style);
    const scope = dark ? (media?.[1] ?? '') : media ? style.slice(0, media.index) : style;
    const rule = /(?:^|\})\s*svg\s*\{([^}]*)\}/.exec(scope)?.[1] ?? '';
    return new Map(
      rule
        .split(';')
        .map(part => part.split(':').map(side => side.trim()))
        .filter(([name, value]) => name && value)
        .map(([name, value]) => [name, value])
    );
  }

  /** @canon spec-the-svg-sets-the-pele-colours-for-a-light-scheme */
  it('sets each Pele colour on the root, outside any media query', async () => {
    const light = await declarations(false);
    for (const name of VARIABLES) expect(light.get(name), name).toMatch(/^#[0-9a-f]{6}$/i);
  });

  /** @canon spec-the-svg-sets-the-pele-colours-for-a-dark-scheme */
  it('sets each Pele colour on the root for a dark scheme, to another colour than the light one', async () => {
    const light = await declarations(false);
    const dark = await declarations(true);
    for (const name of VARIABLES) {
      expect(dark.get(name), name).toMatch(/^#[0-9a-f]{6}$/i);
      expect(dark.get(name), name).not.toBe(light.get(name));
    }
  });

  /** @canon spec-the-svg-fills-its-background */
  it('draws first a rectangle over the whole drawing in the background colour', async () => {
    const svg = (await graph({ 'CANON.md': NESTED }, { svg: true })).out;
    const [, , , width, height] = /viewBox="(\S+) (\S+) (\S+) (\S+)"/.exec(svg) ?? [];
    const first = /<\/style>(<[a-z]+[^>]*>)/.exec(svg)?.[1] ?? '';
    expect(first).toMatch(/^<rect /);
    expect(first).toContain('x="0"');
    expect(first).toContain('y="0"');
    expect(first).toContain(`width="${width}"`);
    expect(first).toContain(`height="${height}"`);
    expect(first).toMatch(/fill="var\(--(?:pele-bg|_bg)\b/);
  });

  /** @canon spec-a-kind-sets-the-colour-of-its-labels-with-its-fill */
  it('gives the class of each kind a label colour beside its fill', async () => {
    const { nodes, classes } = parse((await graph({ 'CANON.md': EVERY_KIND })).out);
    expect(nodes.map(node => node.label).sort()).toEqual(['axiom-root', 'bug-defect', 'exception-pinch', 'fact-ground', 'spec-claim']);
    for (const node of nodes) {
      expect(classes.get(node.className ?? ''), node.label).toMatch(/(?:^|,)color:#[0-9a-f]{6}/i);
    }
  });
});

describe('the same documents', () => {
  /** @canon spec-the-same-documents-give-the-same-mermaid-text */
  it('give the same Mermaid text twice', async () => {
    const files = { 'base/CANON.md': BASE, 'user/CANON.md': USER, 'CANON.md': EVERY_KIND };
    const first = (await graph(files)).out;
    expect(labels(first)).toContain('spec-borrowed');
    expect((await graph(files)).out).toBe(first);
  });

  /** @canon spec-the-same-documents-give-the-same-svg */
  it('give the same SVG twice', async () => {
    const files = { 'base/CANON.md': BASE, 'user/CANON.md': USER, 'CANON.md': EVERY_KIND };
    const first = (await graph(files, { svg: true })).out;
    expect(first).toContain('spec-borrowed');
    expect((await graph(files, { svg: true })).out).toBe(first);
  });
});
