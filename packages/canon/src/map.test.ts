/**
 * The map of a unit. This file tests the checker's own tooling, not a project's
 * canon, so it carries no `@canon` tag.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkMaps, reviewMaps } from './map.ts';

const doc = (map: string, statement = 'A leaf holds when a node runs. It ends later.'): string => `# Canon

## @axiom a-root

> A root.

### @spec a-leaf

> ${statement}

\`\`\`alloy
always (run[n] implies eventually end[n])
\`\`\`

${map}
`;

const MAP = '```map\n"a node runs" -> run[n]\n"It ends later" -> eventually end[n]\n```';
const kinds = (src: string): string[] => checkMaps(src).map(f => f.kind);

describe('the map of a unit', () => {
  it('asks for a map when a unit has a predicate and none', () => {
    expect(kinds(doc(''))).toEqual(['unmapped']);
  });

  it('reads a fragment that is not in the statement, a part that is not in the predicate, and a line it cannot read', () => {
    const src = doc('```map\n"a node stops" -> run[n]\n"It ends later" -> end[m]\nnot a line\n```');
    expect(checkMaps(src).map(f => [f.kind, f.message])).toEqual([
      ['malformed', 'a map line is not "words" -> part: not a line'],
      ['fragment', '"a node stops" is not in the statement'],
      ['target', '`end[m]` is not in the predicate'],
      ['uncovered', 'no map line covers: A leaf holds when a node runs.'],
      ['unreviewed', expect.stringMatching(/^the map is not marked reviewed \(reviewed=[0-9a-f]{12}\)$/)],
    ]);
  });

  it('names a sentence of the statement that no line covers', () => {
    const findings = checkMaps(doc('```map\n"a node runs" -> run[n]\n```'));
    expect(findings.map(f => f.message)).toContain('no map line covers: It ends later.');
  });

  it('is current once reviewed, and stale when the statement, the predicate or the map changes', () => {
    const reviewed = reviewMaps(doc(MAP), ['spec-a-leaf']).src;
    expect(reviewed).toMatch(/^```map reviewed=[0-9a-f]{12}$/m);
    expect(checkMaps(reviewed)).toEqual([]);
    expect(kinds(reviewed.replace('It ends later.', 'It ends later on.').replace('"It ends later"', '"It ends later on"'))).toEqual(['stale']);
    expect(kinds(reviewed.replace('eventually end[n])\n', 'eventually end[n]) and true\n'))).toEqual(['stale']);
    expect(kinds(reviewed.replace('"a node runs" -> run[n]', '"a node runs" -> run[n] '))).toEqual([]);
  });

  it('leaves the other words of the info string alone, and reports a unit it cannot review', () => {
    const { src, missing } = reviewMaps(doc(MAP), ['spec-a-leaf', 'spec-gone']);
    expect(missing).toEqual(['spec-gone']);
    expect(reviewMaps(src, ['spec-a-leaf']).src).toBe(src);
  });
});

describe('the lifetimes fixture', () => {
  it('has a current map for each of its specs', () => {
    expect(checkMaps(readFileSync(new URL('../fixtures/lifetimes/CANON.md', import.meta.url), 'utf8'))).toEqual([]);
  });
});
