/**
 * The commands that read the canon for a reader: `show`, `find`, and `tree`
 * with a unit.
 */
import { describe, expect, it } from 'vitest';
import { canon, generated, run } from './project.ts';

/** The tag a test cites a unit with, spelled apart so the checker does not read this file's templates as citations. */
const TAG = ['@', 'canon'].join('');

const DOCUMENT = canon(`
### @spec a-parent

> A parent says one thing for every target.

#### @spec a-leaf

> A leaf says one thing on a target.

Prose about the leaf.

#### @spec a-sibling

> A sibling says another thing.

## @axiom another-root

> Another root holds.

### @spec a-follower

> A follower says what the leaf says, later.

Derives from: [\`@spec a-leaf\`](#spec-a-leaf)

## Terms

### @term target

> A target is where a program runs.
`);

const TESTS = `/**
 * ${TAG} spec-a-leaf
 */
it('checks the leaf', () => {});

/**
 * ${TAG} spec-a-leaf
 */
it('checks the leaf again', () => {});

/**
 * ${TAG} spec-a-sibling
 */
it('checks the sibling', () => {});

/**
 * ${TAG} spec-a-follower
 */
it('checks the follower', () => {});
`;

/** The lines of `out` under the line `title`, up to the first line that is not indented. */
function section(out: string, title: string): string[] {
  const lines = out.split('\n');
  const at = lines.indexOf(title);
  if (at === -1) return [];
  const under: string[] = [];
  for (const line of lines.slice(at + 1)) {
    if (!line.startsWith('  ')) break;
    under.push(line.trim());
  }
  return under;
}

/** The line where `heading` starts in the document as the run reads it, with its index generated. */
const lineOf = (() => {
  const lines = generated(DOCUMENT).split('\n');
  return (heading: string): number => lines.indexOf(heading) + 1;
})();

describe('show', () => {
  const show = (...names: string[]) => run(['show', ...names], DOCUMENT, TESTS);

  /**
   * @canon spec-show-prints-the-own-text-of-a-unit-with-where-it-starts
   */
  it('prints the heading and the own text of a unit after where it starts', () => {
    const { stdout, status } = show('spec-a-parent');
    expect(status).toBe(0);
    expect(stdout.split('\n')[0]).toBe(`CANON.md:${lineOf('### @spec a-parent')}  spec-a-parent`);
    expect(stdout).toContain('### @spec a-parent\n\n> A parent says one thing for every target.');
    expect(stdout).not.toContain('Prose about the leaf.');
  });

  /**
   * @canon spec-show-lists-the-units-a-unit-sits-in-up-to-its-root
   */
  it('lists the units a unit sits in, up to its root', () => {
    expect(section(show('spec-a-leaf').stdout, 'Sits in:')).toEqual([
      `CANON.md:${lineOf('### @spec a-parent')}  spec-a-parent — A parent says one thing for every target.`,
      `CANON.md:${lineOf('## @axiom a-program-means-one-thing')}  axiom-a-program-means-one-thing — A program means one thing.`
    ]);
    expect(section(show('axiom-another-root').stdout, 'Sits in:')).toEqual(['none']);
  });

  /**
   * @canon spec-show-lists-the-units-a-unit-derives-from-on-its-derives-from-line
   */
  it('lists the units the "Derives from:" line of a unit names', () => {
    expect(section(show('spec-a-follower').stdout, 'Derives from:')).toEqual([
      `CANON.md:${lineOf('#### @spec a-leaf')}  spec-a-leaf — A leaf says one thing on a target.`
    ]);
  });

  /**
   * @canon spec-show-lists-the-units-that-sit-in-a-unit
   */
  it('lists the units that sit in a unit, each with its tests', () => {
    expect(section(show('spec-a-parent').stdout, 'Sitting in it:')).toEqual([
      `CANON.md:${lineOf('#### @spec a-leaf')}  spec-a-leaf  2 tests — A leaf says one thing on a target.`,
      `CANON.md:${lineOf('#### @spec a-sibling')}  spec-a-sibling  1 test — A sibling says another thing.`
    ]);
  });

  /**
   * @canon spec-show-lists-the-units-that-derive-from-a-unit-on-their-derives-from-line
   */
  it('lists the units whose "Derives from:" line names a unit', () => {
    expect(section(show('spec-a-leaf').stdout, 'Deriving from it:')).toEqual([
      `CANON.md:${lineOf('### @spec a-follower')}  spec-a-follower — A follower says what the leaf says, later.`
    ]);
  });

  /**
   * @canon spec-show-lists-the-tests-that-check-a-unit
   */
  it('lists each test that checks a unit by its file, line and title', () => {
    expect(section(show('spec-a-leaf').stdout, 'Tested by:')).toEqual([
      'test/canon/a.test.ts:4  checks the leaf',
      'test/canon/a.test.ts:9  checks the leaf again'
    ]);
    expect(section(show('spec-a-parent').stdout, 'Tested by:')).toEqual(['none']);
  });

  /**
   * @canon spec-show-reads-an-id-as-the-heading-or-the-tree-writes-it
   */
  it('reads a unit as its id, as its kind and stem after an @, or in words', () => {
    const header = `CANON.md:${lineOf('#### @spec a-leaf')}  spec-a-leaf`;
    for (const names of [['spec-a-leaf'], ['@spec a-leaf'], ['@spec', 'a-leaf'], ['@spec A leaf']]) {
      expect(show(...names).stdout.split('\n')[0]).toBe(header);
    }
  });

  /**
   * @canon spec-show-of-a-name-that-names-no-unit-fails-the-run
   */
  it('says so, and exits with code 2, when a name names no unit', () => {
    const { stdout, stderr, status } = show('spec-a-leaf', 'spec-no-such-thing');
    expect(status).toBe(2);
    expect(stderr).toContain('"spec-no-such-thing" names no unit');
    expect(stdout.split('\n')[0]).toBe(`CANON.md:${lineOf('#### @spec a-leaf')}  spec-a-leaf`);
  });
});

describe('find', () => {
  const find = (...args: string[]) => run(['find', ...args], DOCUMENT, TESTS).stdout.trim().split('\n').filter(Boolean);

  /**
   * @canon spec-find-matches-a-word-in-the-id-or-the-own-text-whatever-its-case
   */
  it('matches a word in the id or the own text, in capitals or not', () => {
    expect(find('FOLLOWER')).toEqual([`CANON.md:${lineOf('### @spec a-follower')}  spec-a-follower — A follower says what the leaf says, later.`]);
    expect(find('prose')).toEqual([`CANON.md:${lineOf('#### @spec a-leaf')}  spec-a-leaf — A leaf says one thing on a target.`]);
  });

  /**
   * @canon spec-find-lists-a-unit-only-when-it-holds-every-word
   */
  it('leaves out a unit that holds some of the words and not every one', () => {
    expect(find('says', 'thing').map(line => line.split('  ')[1]?.split(' ')[0])).toEqual(['spec-a-parent', 'spec-a-leaf', 'spec-a-sibling']);
    expect(find('says', 'another').map(line => line.split('  ')[1]?.split(' ')[0])).toEqual(['spec-a-sibling']);
  });

  /**
   * @canon spec-find-with-a-kind-lists-only-units-of-that-kind
   */
  it('lists only the units of the kind on its command line', () => {
    const ids = (lines: string[]) => lines.map(line => line.split('  ')[1]?.split(' ')[0]);
    expect(ids(find('target'))).toEqual(['spec-a-parent', 'spec-a-leaf', 'term-target']);
    expect(ids(find('target', '--kind', 'term'))).toEqual(['term-target']);
  });
});

describe('tree of a unit', () => {
  /**
   * @canon spec-tree-of-a-unit-draws-the-tree-from-that-unit-down
   */
  it('draws the unit and the units that sit in it, and nothing else', () => {
    const { stdout, status } = run(['tree', 'spec-a-parent'], DOCUMENT, TESTS);
    expect(status).toBe(0);
    expect(stdout).toContain('@spec A parent');
    expect(stdout).toContain('@spec A leaf');
    expect(stdout).toContain('@spec A sibling');
    expect(stdout).not.toContain('@axiom');
    expect(stdout).not.toContain('@spec A follower');
    expect(stdout).not.toContain('@term');
  });
});
