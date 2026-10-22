/**
 * `canon graph`: the derivations of the canon documents as a Mermaid
 * flowchart, or with `--svg` as the SVG that Pele renders from it.
 */
import { readFileSync } from 'node:fs';
import { render } from 'pele';
import { readUnits } from '@bigmistqke/canon/units';
import type { Plugin } from '@bigmistqke/canon/plugin';

/** The kinds that no derivation reaches, and that the graph leaves out. */
const UNDRAWN = new Set(['term', 'conflict', 'thread']);

/** The fill, border and label colour of each kind, and of a unit no drawn document holds. */
const CLASSES: Record<string, string> = {
  axiom: 'fill:#e9d8fd,stroke:#7c3aed,color:#1f2328',
  fact: 'fill:#d3eafd,stroke:#2b78c2,color:#1f2328',
  spec: 'fill:#f2f4f7,stroke:#8c959f,color:#1f2328',
  exception: 'fill:#fff1c2,stroke:#b08800,color:#1f2328',
  bug: 'fill:#ffd8d3,stroke:#cf222e,color:#1f2328',
  outside: 'fill:#ffffff,stroke:#8c959f,stroke-dasharray:3 3,color:#59636e'
};

/** The Pele colours for a light page and for a dark one, after GitHub's own. */
const LIGHT = {
  bg: '#ffffff',
  fg: '#1f2328',
  muted: '#59636e',
  line: '#59636e',
  surface: '#f6f8fa',
  'surface-alt': '#eaeef2',
  border: '#d1d9e0',
  accent: '#0969da'
};
const DARK = {
  bg: '#0d1117',
  fg: '#f0f6fc',
  muted: '#9198a1',
  line: '#9198a1',
  surface: '#151b23',
  'surface-alt': '#212830',
  border: '#3d444d',
  accent: '#4493f8'
};

/** A link on a "Derives from:" line: the id after its `#`. */
const DERIVES = /^Derives from: (.*)$/m;
const LINK = /\]\([^)#]*#([^)\s]+)\)/g;

/** The ids a unit's "Derives from:" line names, in order. */
function derivedFrom(own: string): string[] {
  const line = DERIVES.exec(own)?.[1] ?? '';
  return [...line.matchAll(LINK)].map(match => match[1]);
}

/** The Mermaid text of the derivations between the units of `files`, read in order. */
export function graphOf(files: string[]): string {
  const units = files.flatMap(file => readUnits(readFileSync(file, 'utf8'))).filter(unit => !UNDRAWN.has(unit.kind));
  const nodes = new Map(units.map((unit, i) => [unit.id, `n${i}`]));
  const outside = new Map<string, string>();
  const lines = ['flowchart LR'];
  for (const unit of units) lines.push(`  ${nodes.get(unit.id)}["${unit.id}"]:::${unit.kind}`);
  const edges: string[] = [];
  for (const unit of units) {
    const to = nodes.get(unit.id)!;
    if (unit.parent !== undefined && nodes.has(unit.parent)) edges.push(`  ${nodes.get(unit.parent)} --> ${to}`);
    for (const id of derivedFrom(unit.own)) {
      let from = nodes.get(id) ?? outside.get(id);
      if (from === undefined) {
        from = `x${outside.size}`;
        outside.set(id, from);
        lines.push(`  ${from}["${id}"]:::outside`);
      }
      edges.push(`  ${from} -.-> ${to}`);
    }
  }
  lines.push(...edges);
  for (const [name, style] of Object.entries(CLASSES)) lines.push(`  classDef ${name} ${style}`);
  return lines.join('\n') + '\n';
}

/** The declarations that set each Pele colour of `scheme`. */
const colours = (scheme: Record<string, string>): string =>
  Object.entries(scheme)
    .map(([name, value]) => `--pele-${name}:${value}`)
    .join(';');

/** The SVG that Pele renders from `text`, with its own colours for a light and a dark page, and a background. */
export function svgOf(text: string): string {
  const { svg } = render(text);
  const open = /^<svg[^>]*>/.exec(svg)![0];
  const [, , , width, height] = /viewBox="(\S+) (\S+) (\S+) (\S+)"/.exec(open)!;
  const style = `<style>svg{${colours(LIGHT)}}@media (prefers-color-scheme: dark){svg{${colours(DARK)}}}</style>`;
  const background = `<rect x="0" y="0" width="${width}" height="${height}" fill="var(--_bg)"/>`;
  return open + style + background + svg.slice(open.length);
}

export const plugin: Plugin = {
  name: 'pele',
  commands: {
    graph: ({ root, documents, options }) => {
      const text = graphOf(documents.map(doc => `${root}/${doc}`));
      process.stdout.write(options.svg === true ? svgOf(text) : text);
      return 0;
    }
  }
};
