/**
 * The fenced blocks of a canon document. This file tests the checker's own
 * tooling, not a project's canon, so it carries no `@canon` tag.
 */
import { describe, expect, it } from 'vitest';
import { readBlocks } from './blocks.ts';

const DOC = `# Canon

## @term cluster

> A cluster is a group of units.

\`\`\`alloy vocabulary
sig Owner {}
\`\`\`

\`\`\`alloy bounds
for 3
\`\`\`

### @spec a-leaf

> A leaf says one thing.

\`\`\`alloy
always some Owner
\`\`\`

\`\`\`
no language, so prose
\`\`\`

#### @spec nested

> A nested unit.

\`\`\`smt
(assert true)
\`\`\`
`;

describe('the blocks of a document', () => {
  const blocks = readBlocks(DOC);

  it('reads each fenced block of a language, with the unit that holds it, its language and its role', () => {
    expect(blocks.map(b => [b.unit, b.lang, b.role])).toEqual([
      ['term-cluster', 'alloy', 'vocabulary'],
      ['term-cluster', 'alloy', 'bounds'],
      ['spec-a-leaf', 'alloy', 'unit'],
      ['spec-nested', 'smt', 'unit'],
    ]);
  });

  it('keeps the block\'s body apart from its fences, and says where in the document it starts', () => {
    expect(blocks[0].body).toBe('sig Owner {}\n');
    expect(blocks.map(b => DOC.slice(b.at, b.at + b.body.length))).toEqual(blocks.map(b => b.body));
  });

  it('gives a nested unit\'s block to the nested unit alone', () => {
    expect(blocks.filter(b => b.unit === 'spec-a-leaf')).toHaveLength(1);
  });
});
