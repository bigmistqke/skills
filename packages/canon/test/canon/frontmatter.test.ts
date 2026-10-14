/**
 * The part of YAML the frontmatter of a canon document may use: the key
 * `plugins`, with a list of strings.
 */
import { describe, expect, it } from 'vitest';
import { readFrontmatter } from '../../src/frontmatter.ts';
import { maskFences, readUnits } from '../../src/units.ts';

const doc = (block: string): string => `---\n${block}\n---\n# Canon\n`;

describe('readFrontmatter', () => {
  /**
   * @canon spec-only-a-block-at-the-top-is-a-frontmatter
   */
  it('finds no frontmatter in a document that starts with a heading', () => {
    expect(readFrontmatter('# Canon\n')).toBeUndefined();
  });

  /**
   * @canon spec-only-a-block-at-the-top-is-a-frontmatter
   */
  it('finds no frontmatter in a block that does not start the document', () => {
    expect(readFrontmatter('# Canon\n\n---\nplugins: [lint]\n---\n')).toBeUndefined();
  });

  /**
   * @canon spec-an-inline-list-holds-the-entries-between-its-brackets
   */
  it('reads an inline list of quoted and plain strings', () => {
    expect(readFrontmatter(doc('plugins: ["@bigmistqke/canon-forge", lint, \'logic\']'))).toEqual({
      plugins: ['@bigmistqke/canon-forge', 'lint', 'logic']
    });
  });

  /**
   * @canon spec-a-dashed-list-holds-the-entries-after-its-dashes
   */
  it('reads a list written as lines that start with a dash', () => {
    expect(readFrontmatter(doc('plugins:\n  - "@bigmistqke/canon-forge"\n  - lint'))).toEqual({
      plugins: ['@bigmistqke/canon-forge', 'lint']
    });
  });

  /**
   * @canon spec-an-inline-list-holds-the-entries-between-its-brackets
   * @canon spec-an-empty-list-asks-for-no-plugin
   */
  it('reads an empty list as a document that names no plugin', () => {
    expect(readFrontmatter(doc('plugins: []'))).toEqual({ plugins: [] });
  });

  /**
   * @canon spec-a-frontmatter-with-no-plugins-key-holds-no-entry
   */
  it('reads a block with no keys', () => {
    expect(readFrontmatter(doc('# nothing here yet'))).toEqual({});
  });

  /**
   * @canon spec-a-comma-inside-quotes-ends-no-entry
   */
  it('keeps a comma inside quotes in one string', () => {
    expect(readFrontmatter(doc('plugins: ["a,b", c]'))).toEqual({ plugins: ['a,b', 'c'] });
  });

  /**
   * @canon spec-a-misquoted-entry-is-refused
   * @canon spec-the-refusal-of-a-misquoted-entry-says-to-write-it-in-quotes
   */
  it('refuses an unquoted name that starts with an at sign, and says to quote it', () => {
    expect(() => readFrontmatter(doc('plugins: [@bigmistqke/canon-forge]'))).toThrow(/must be in quotes.*Write "@bigmistqke\/canon-forge"/);
  });

  /**
   * @canon spec-a-key-the-checker-does-not-know-is-refused
   */
  it('refuses a key it does not know, so a misspelled key cannot drop a check', () => {
    expect(() => readFrontmatter(doc('plugin: [lint]'))).toThrow(/unknown key "plugin"/);
  });

  /**
   * @canon spec-a-list-that-is-not-closed-is-refused
   */
  it('refuses a list that is not closed', () => {
    expect(() => readFrontmatter(doc('plugins: [lint'))).toThrow(/no closing/);
  });

  /**
   * @canon spec-a-string-that-is-not-closed-is-refused
   */
  it('refuses a string that is not closed', () => {
    expect(() => readFrontmatter(doc('plugins: ["lint]'))).toThrow();
  });

  /**
   * @canon spec-a-key-written-twice-is-refused
   */
  it('refuses the key twice', () => {
    expect(() => readFrontmatter(doc('plugins: [a]\nplugins: [b]'))).toThrow(/twice/);
  });
});

describe('units in a document with frontmatter', () => {
  const src = '---\n# a comment\nplugins: ["lint"]\n---\n# Canon\n\n## @spec a-claim\n\n> A claim.\n';

  /**
   * @canon spec-a-frontmatter-leaves-the-units-of-its-document-as-they-were
   */
  it('does not read a comment of the frontmatter as a heading', () => {
    expect(maskFences(src).slice(0, src.indexOf('# Canon')).trim()).toBe('');
  });

  /**
   * @canon spec-a-frontmatter-leaves-the-units-of-its-document-as-they-were
   */
  it('keeps the offsets of everything after it', () => {
    expect(maskFences(src).length).toBe(src.length);
    expect(readUnits(src).map(unit => unit.id)).toEqual(['spec-a-claim']);
  });
});
