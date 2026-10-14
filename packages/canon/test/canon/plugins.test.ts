/**
 * Which plugins apply to which documents, and how a plugin the project has
 * installed is found. Each case builds a small project in a temporary directory
 * and runs the command line over it.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const CLI = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'cli.ts');

const DIRS: string[] = [];
afterEach(() => {
  for (const dir of DIRS.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A sentence of 30 words, which the language check reports. */
const LONG = `${Array.from({ length: 29 }, () => 'word').join(' ')} end.`;

const LINT = '@bigmistqke/canon/lint';

const doc = (frontmatter: string | undefined, body = ''): string =>
  `${frontmatter === undefined ? '' : `---\n${frontmatter}\n---\n`}# Canon\n\n${body}\n`;

/** A project of the given documents, with the command run over it; returns what it printed and its exit code. */
function project(documents: Record<string, string>, args: string[], extra: Record<string, string> = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'canon-plugins-'));
  DIRS.push(dir);
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ canon: { documents: Object.keys(documents) } }));
  for (const [name, text] of Object.entries({ ...documents, ...extra })) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), text);
  }
  const run = spawnSync(process.execPath, [CLI, ...args], { cwd: dir, encoding: 'utf8' });
  return { out: `${run.stdout}${run.stderr}`, code: run.status };
}

describe('the documents a plugin inside this package applies to', () => {
  /**
   * @canon spec-a-document-with-no-plugins-list-gets-the-plugins-inside-the-package
   */
  it('applies every plugin inside this package to a document with no frontmatter', () => {
    const { out, code } = project({ 'A.md': doc(undefined, LONG) }, ['lint']);
    expect(out).toContain('A.md');
    expect(out).toContain('sentence-length');
    expect(code).toBe(1);
  });

  /**
   * @canon spec-a-document-with-no-plugins-list-gets-the-plugins-inside-the-package
   * @canon spec-a-plugin-a-document-does-not-list-does-not-run-over-it
   */
  it('applies the plugins a document names and no others', () => {
    const { out, code } = project(
      { 'A.md': doc('plugins: ["canon-a"]', LONG), 'B.md': doc(undefined, LONG) },
      ['lint'],
      adder('canon-a', 'lint', 'a linted', 0)
    );
    expect(out).toContain('B.md');
    expect(out).toContain('a linted');
    expect(out).not.toContain('A.md');
    expect(code).toBe(1);
  });

  /**
   * @canon spec-an-empty-list-asks-for-no-plugin
   * @canon spec-an-available-command-is-not-reported-as-unknown
   * @canon spec-a-run-with-no-finding-succeeds
   */
  it('applies no plugin to a document that names an empty list, and still has the commands', () => {
    const { out, code } = project({ 'A.md': doc('plugins: []', LONG) }, ['lint']);
    expect(out).not.toContain('unknown command');
    expect(code).toBe(0);
  });

  /**
   * @canon spec-a-plugin-a-document-lists-runs-over-it
   */
  it('applies a plugin to a document that names it', () => {
    const { out, code } = project({ 'A.md': doc(`plugins: ["${LINT}"]`, LONG) }, ['lint']);
    expect(out).toContain('A.md');
    expect(code).toBe(1);
  });

  /**
   * @canon spec-a-missing-plugin-is-reported
   * @canon spec-a-missing-plugin-stops-the-run
   * @canon spec-the-report-of-a-missing-plugin-offers-the-plugins-inside
   */
  it('does not take a bare word for a plugin', () => {
    const { out, code } = project({ 'A.md': doc('plugins: ["lint"]', LONG) }, ['fake']);
    expect(out).toContain('the plugin "lint" is not installed in this project');
    expect(out).toContain(LINT);
    expect(code).toBe(2);
  });

  /**
   * @canon spec-a-document-named-on-the-command-line-is-checked-whatever-its-frontmatter-says
   */
  it('checks a file named on the command line whatever its frontmatter says', () => {
    const { out, code } = project({ 'A.md': doc('plugins: []', LONG) }, ['lint', 'A.md']);
    expect(out).toContain('sentence-length');
    expect(code).toBe(1);
  });
});

describe('a plugin the project has installed', () => {
  const PLUGIN = {
    'node_modules/canon-fake/package.json': JSON.stringify({ name: 'canon-fake', version: '1.0.0', main: 'index.js' }),
    'node_modules/canon-fake/index.js': `exports.plugin = {
  name: 'fake',
  config: 'fake',
  commands: { fake(context) {
    console.log(JSON.stringify({ args: context.args, documents: context.documents, config: context.config }));
    return 0;
  } },
};`
  };

  /**
   * @canon spec-a-plugin-a-document-lists-runs-over-it
   * @canon spec-a-plugin-a-document-does-not-list-does-not-run-over-it
   */
  it('adds its command, over the documents that name it', () => {
    const { out, code } = project(
      { 'A.md': doc('plugins: ["canon-fake"]'), 'B.md': doc(undefined) },
      ['fake', 'one'],
      PLUGIN
    );
    expect(JSON.parse(out.trim())).toEqual({ args: ['one'], documents: ['A.md'] });
    expect(code).toBe(0);
  });

  /**
   * @canon spec-a-missing-plugin-is-reported
   * @canon spec-a-missing-plugin-stops-the-run
   */
  it('says so when a document names a plugin the project does not have', () => {
    const { out, code } = project({ 'A.md': doc('plugins: ["canon-missing"]') }, ['fake']);
    expect(out).toContain('the plugin "canon-missing" is not installed in this project');
    expect(code).toBe(2);
  });

  /**
   * @canon spec-a-missing-plugin-stops-the-run
   * @canon spec-the-report-of-a-missing-plugin-offers-the-plugins-inside
   */
  it('stops a command of this package when a document names a plugin that does not exist', () => {
    const { out, code } = project({ 'A.md': doc('plugins: ["@bigmistqke/canon/logic"]') }, ['logic']);
    expect(out).toContain('the plugin "@bigmistqke/canon/logic" is not installed in this project');
    expect(out).toContain(LINT);
    expect(code).toBe(2);
  });

  /**
   * @canon spec-a-command-that-is-not-available-is-reported-as-unknown
   * @canon spec-a-command-that-is-not-available-stops-the-run
   */
  it('says a command is unknown when no plugin adds it', () => {
    const { out, code } = project({ 'A.md': doc(undefined) }, ['fake']);
    expect(out).toContain('unknown command "fake"');
    expect(code).toBe(2);
  });

  /**
   * @canon spec-a-document-with-a-refused-frontmatter-is-reported
   * @canon spec-a-report-of-an-unreadable-frontmatter-stops-the-run
   * @canon spec-the-refusal-of-a-misquoted-entry-says-to-write-it-in-quotes
   */
  it('says what is wrong with a frontmatter it cannot read', () => {
    const { out, code } = project({ 'A.md': doc('plugins: [@x/y]') }, ['lint']);
    expect(out).toContain('A.md: frontmatter:');
    expect(out).toContain('must be in quotes');
    expect(code).toBe(2);
  });
});

/** A package that adds `command`, which prints `says` and returns `code`. */
const adder = (name: string, command: string, says: string, code: number): Record<string, string> => ({
  [`node_modules/${name}/package.json`]: JSON.stringify({ name, version: '1.0.0', main: 'index.js' }),
  [`node_modules/${name}/index.js`]: `exports.plugin = { name: '${name}', commands: { '${command}': () => { console.log('${says}'); return ${code}; } } };`
});

describe('the same command from several plugins', () => {
  const both = { ...adder('canon-a', 'fake', 'a ran', 0), ...adder('canon-b', 'fake', 'b ran', 1) };

  /**
   * @canon spec-every-plugin-a-run-calls-runs
   * @canon spec-a-finding-fails-the-run
   */
  it('runs every plugin that adds it, and exits with the worst code', () => {
    const { out, code } = project({ 'A.md': doc('plugins: ["canon-a", "canon-b"]') }, ['fake'], both);
    expect(out).toContain('a ran');
    expect(out).toContain('b ran');
    expect(code).toBe(1);
  });

  /**
   * @canon spec-a-plugin-that-could-not-run-stops-the-run
   */
  it('puts a check that could not run above a finding', () => {
    const three = { ...both, ...adder('canon-c', 'fake', 'c ran', 2) };
    const { code } = project({ 'A.md': doc('plugins: ["canon-a", "canon-b", "canon-c"]') }, ['fake'], three);
    expect(code).toBe(2);
  });

  /**
   * @canon spec-every-plugin-a-run-calls-runs
   */
  it('runs a plugin that adds to lint next to the prose check', () => {
    const { out, code } = project(
      { 'A.md': doc(`plugins: ["${LINT}", "canon-a"]`, LONG) },
      ['lint'],
      adder('canon-a', 'lint', 'a linted', 0)
    );
    expect(out).toContain('sentence-length');
    expect(out).toContain('a linted');
    expect(code).toBe(1);
  });
});

describe('check over a document with frontmatter', () => {
  const body = `<!-- toc:begin — generated by \`canon generate\`; edits are overwritten -->\n<!-- toc:end -->\n\n## @axiom a-program-means-one-thing\n\n> A program means one thing.\n`;

  /** Generate, then check, a project of one document; the document as generate left it, and what check printed. */
  function checked(text: string) {
    const dir = mkdtempSync(join(tmpdir(), 'canon-plugins-'));
    DIRS.push(dir);
    mkdirSync(join(dir, 'test', 'canon'), { recursive: true });
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ canon: { documents: ['CANON.md'], suites: 'test/canon', sources: ['test'], command: 'canon' } })
    );
    writeFileSync(join(dir, 'CANON.md'), text);
    spawnSync(process.execPath, [CLI, 'generate'], { cwd: dir });
    const run = spawnSync(process.execPath, [CLI, 'check'], { cwd: dir, encoding: 'utf8' });
    // The first line names the temporary directory.
    return { document: readFileSync(join(dir, 'CANON.md'), 'utf8'), out: run.stdout.split('\n').slice(1).join('\n'), code: run.status };
  }

  /**
   * @canon spec-a-frontmatter-changes-no-finding
   * @canon spec-generate-keeps-the-frontmatter-of-a-document
   */
  it('reports what it reports without the frontmatter, and leaves the frontmatter as it was', () => {
    const frontmatter = `---\nplugins: ["${LINT}"]\n---\n`;
    const without = checked(`# Canon\n\n${body}`);
    const withIt = checked(`${frontmatter}# Canon\n\n${body}`);
    expect(withIt.out).toBe(without.out);
    expect(withIt.code).toBe(without.code);
    expect(withIt.document.startsWith(frontmatter)).toBe(true);
    expect(withIt.document.slice(frontmatter.length)).toBe(without.document);
  });
});
