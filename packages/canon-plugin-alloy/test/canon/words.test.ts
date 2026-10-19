/**
 * The words of a document that keeps readings: what it declares, where, what
 * says it, and what uses it.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkWords, declared } from '../../src/words.ts';
import { CLI, install, named } from './cli.ts';

/** The tag of an axiom, spelled apart so the checker does not read this file's templates as citations. */
const AXIOM = ['@', 'axiom'].join('');

const DIRS: string[] = [];
afterEach(() => {
  for (const dir of DIRS.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A document of two terms and a spec. The term for the node declares what is given; `extra` is added to the end. */
const doc = (parts: { node?: string; reading?: string; spec?: string; extra?: string } = {}): string => `# Canon

## @term node

\`\`\`alloy vocabulary
${parts.node ?? 'sig Node { next: lone Node }\nvar sig Done in Node {}'}
\`\`\`

\`\`\`readings
${parts.reading ?? 'noun Node: node\nnext: {2} follows {1} | {2} does not follow {1}\nDone: {1} is done | {1} is not done'}
\`\`\`

## ${AXIOM} every-node-is-done

\`\`\`alloy
${parts.spec ?? 'always all n: Node | n in Done or no n.next'}
\`\`\`
${parts.extra ?? ''}`;

const kinds = (src: string): string[] => checkWords(src).map(f => f.kind);

describe('the words a document declares', () => {
  /**
   * @canon spec-a-signature-a-field-and-a-predicate-are-declared-words
   */
  it('are the signatures, their fields, and the predicates', () => {
    const src = doc({
      node: 'abstract sig Thing {}\nsig Node extends Thing { next: lone Node, var seen: set Node, a, b: Node }\none sig Holder { rel: Node -> Node }\nsig P, Q in Node {}\npred ok[n: Node] { n in P }\nfact f { some Node }'
    });
    expect(declared(src).map(w => `${w.kind} ${w.name}`)).toEqual([
      'signature Thing', 'signature Node', 'field Node.next', 'field Node.seen', 'field Node.a', 'field Node.b',
      'signature Holder', 'field Holder.rel', 'signature P', 'signature Q', 'predicate ok'
    ]);
  });

  /**
   * @canon spec-a-signature-a-field-and-a-predicate-are-declared-words
   */
  it('declares a signature whole when its name ends in the letters of a keyword', () => {
    const src = doc({ node: 'sig Node {}\nsig Plain, Domain in Node {}\nsig Index extends Node {}' });
    expect(declared(src).map(w => w.name)).toEqual(['Node', 'Plain', 'Domain', 'Index']);
  });

  /**
   * @canon spec-a-declaration-in-a-comment-declares-nothing
   */
  it('are found in the unit that holds them, and not in a comment', () => {
    const src = doc({ node: 'sig Node {} -- sig Hidden {}\n// sig Hidden2 {}\n/* sig Hidden3 {} */' });
    expect(declared(src).map(w => [w.name, w.unit])).toEqual([['Node', 'term-node']]);
  });
});

describe('the words of a document', () => {
  /**
   * @canon spec-a-word-declared-in-a-term-said-beside-it-and-used-is-not-reported
   * @canon spec-check-reports-nothing-about-a-word-that-is-in-order
   */
  it('are clean when each is declared in a term, said beside its declaration, and used', () => {
    expect(checkWords(doc())).toEqual([]);
  });

  /**
   * @canon spec-a-document-that-keeps-no-readings-has-no-word-reported
   */
  it('are left alone in a document that keeps no readings', () => {
    expect(checkWords(doc({ reading: '' }))).toEqual([]);
    expect(checkWords('# Canon\n\n## @term x\n\n```alloy vocabulary\nsig Unused {}\n```\n')).toEqual([]);
  });

  /**
   * @canon spec-a-word-that-a-reading-says-and-nothing-declares-is-undeclared
   */
  it('are undeclared when a reading or a noun says something the document does not declare', () => {
    expect(checkWords(doc({ reading: 'noun Node: node\nnoun Ghost: ghost\nnext: {2} follows {1} | {2} does not follow {1}\nDone: {1} is done | {1} is not done\nPhantom: {1} is a phantom | {1} is not a phantom' }))).toEqual([
      { unit: 'term-node', kind: 'undeclared', message: 'the noun "Ghost" says a word that nothing in the document declares' },
      { unit: 'term-node', kind: 'undeclared', message: 'the reading "Phantom" says a word that nothing in the document declares' }
    ]);
  });

  /**
   * @canon spec-a-reading-is-keyed-by-a-field-alone-or-with-its-signature-or-as-a-primed-set
   */
  it('are keyed by a field either bare or with its signature, and by a primed set', () => {
    const src = doc({ node: 'sig Node { next: lone Node }\nvar sig Done in Node {}', reading: 'noun Node: node\nNode.next: {2} follows {1} | {2} does not follow {1}\nDone\': {1} is done next | {1} is not done next\nDone: {1} is done | {1} is not done', spec: "always all n: Node | n in Done' or no n.next" });
    expect(checkWords(src)).toEqual([]);
  });

  /**
   * @canon spec-a-word-declared-outside-a-term-is-misplaced
   */
  it('are misplaced when a declaration is in a unit that is not a term', () => {
    const src = doc({ extra: '\n```alloy vocabulary\nsig Stray {}\n```\n', spec: 'always all n: Node | n in Done or no n.next' }).replace(`## ${AXIOM} every-node-is-done\n`, `## ${AXIOM} every-node-is-done\n\n\`\`\`alloy vocabulary\npred late[n: Node] { n in Done }\n\`\`\`\n`);
    expect(kinds(src)).toContain('misplaced');
    expect(checkWords(src).filter(f => f.kind === 'misplaced').map(f => f.unit)).toEqual(['axiom-every-node-is-done', 'axiom-every-node-is-done']);
  });

  /**
   * @canon spec-a-reading-apart-from-the-declaration-it-says-is-apart
   */
  it('are apart when a reading is in another unit than its declaration', () => {
    const src = doc({ reading: 'noun Node: node\nnext: {2} follows {1} | {2} does not follow {1}' }).concat('\n## @term done\n\n```readings\nDone: {1} is done | {1} is not done\n```\n');
    expect(checkWords(src)).toEqual([{ unit: 'term-done', kind: 'apart', message: '"Done" is declared in term-node, so its reading belongs there' }]);
  });

  /**
   * @canon spec-a-declared-word-that-no-claim-uses-is-unused
   */
  it('are unused when no claim, definition or fact uses them', () => {
    const src = doc({ node: 'sig Node { next: lone Node }\nvar sig Done in Node {}\nsig Lonely {}\npred idle[n: Node] { some n }', reading: 'noun Node: node\nnext: {2} follows {1} | {2} does not follow {1}\nDone: {1} is done | {1} is not done' });
    expect(checkWords(src).map(f => `${f.kind} ${f.message}`)).toEqual([
      'unused declares "Lonely", which no claim, definition or fact uses',
      'unused declares "idle", which no claim, definition or fact uses'
    ]);
  });

  /**
   * @canon spec-a-word-that-a-fact-a-parent-signature-or-a-predicate-names-is-used
   */
  it('are used when a fact or a parent signature or another predicate names them', () => {
    const src = doc({
      node: 'sig Node { next: lone Node }\nvar sig Done in Node {}\nsig Leaf extends Node {}\npred ok[n: Node] { n in Done }\nfact f { all n: Leaf | ok[n] }',
      spec: 'always all n: Node | n in Done or no n.next'
    });
    expect(checkWords(src).filter(f => f.kind === 'unused')).toEqual([]);
  });

  /**
   * @canon spec-a-field-that-another-signature-shares-is-used-only-through-its-own-signature
   */
  it('count a field as used only through its own signature when another signature has a field of that name', () => {
    const src = doc({ node: 'sig Node { rel: lone Node }\none sig Other { rel: Node -> Node }\nvar sig Done in Node {}', reading: 'noun Node: node\nOther.rel: {1} is before {2} | {1} is not before {2}\nNode.rel: {2} follows {1} | {2} does not follow {1}\nDone: {1} is done | {1} is not done', spec: 'always all n: Node | n in Done or n->n in Other.rel' });
    expect(checkWords(src).map(f => f.message)).toEqual(['declares "Node.rel", which no claim, definition or fact uses']);
  });

  /**
   * @canon spec-a-field-named-after-a-dot-is-used
   */
  it('count a field as used when a formula names it after a dot', () => {
    expect(checkWords(doc({ spec: 'always all n: Node | n in Done or no n.next' }))).toEqual([]);
  });

  /**
   * @canon spec-a-field-named-before-a-dot-is-used
   */
  it('count a field as used when a formula names it before a dot', () => {
    expect(checkWords(doc({ spec: 'always all n: Node | n in Done or no next.n' }))).toEqual([]);
  });

  /**
   * @canon spec-a-field-named-on-its-own-is-used
   */
  it('count a field as used when a formula names it on its own', () => {
    expect(checkWords(doc({ spec: 'always all n, m: Node | n->m in next implies m in Done' }))).toEqual([]);
    expect(checkWords(doc({ spec: 'always all n: Node | n in Done', extra: '\n```alloy\nfact f { next in Node -> Node }\n```\n' }))).toEqual([]);
  });

  /**
   * The lanes of a globe: two fields are used only as `l->g in ended` by the
   * claims, and on their own by a fact of the vocabulary.
   *
   * @canon spec-a-field-named-on-its-own-is-used
   */
  it('count the fields of a lane as used when the claims and a fact name them on their own', () => {
    const src = `# Canon

## @term lane

\`\`\`alloy vocabulary
sig Holder {}
sig Lane { var holder: set Holder, var ended: set Holder, var started: set Holder }
fact an_edge_names_the_holder_it_brackets { always (ended in holder and started in holder') }
\`\`\`

\`\`\`readings
noun Holder: holder
noun Lane: lane
holder: {2} holds {1} | {2} does not hold {1}
ended: {1} reports the end of {2} | {1} does not report the end of {2}
started: {1} reports the start of {2} | {1} does not report the start of {2}
\`\`\`

## ${AXIOM} an-end-and-a-start-come-together

\`\`\`alloy
always all l: Lane | (some g: Holder | l->g in ended) implies (some h: Holder | l->h in started)
\`\`\`
`;
    expect(checkWords(src)).toEqual([]);
  });

  /**
   * @canon spec-a-field-that-only-its-declaration-names-is-unused
   */
  it('count a field as unused when only the declaration of its signature names it', () => {
    const src = doc({ node: 'sig Node { next: lone Node, idle, spare: set Node }\nvar sig Done in Node {}' });
    expect(checkWords(src).map(f => f.message)).toEqual([
      'declares "Node.idle", which no claim, definition or fact uses',
      'declares "Node.spare", which no claim, definition or fact uses'
    ]);
  });
});

describe('the command line', () => {
  /** A project of one document; what `check` printed and its code. */
  function check(document: string) {
    const dir = mkdtempSync(join(tmpdir(), 'canon-words-'));
    DIRS.push(dir);
    mkdirSync(join(dir, 'test', 'canon'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ canon: { documents: ['CANON.md'], suites: 'test/canon', sources: ['test'], command: 'canon' } }));
    install(dir);
    writeFileSync(join(dir, 'CANON.md'), named(document));
    spawnSync(process.execPath, [CLI, 'generate'], { cwd: dir });
    const run = spawnSync(process.execPath, [CLI, 'check'], { cwd: dir, encoding: 'utf8' });
    return { out: run.stdout, code: run.status };
  }

  /**
   * @canon spec-check-reports-a-word-that-is-not-in-order
   * @canon spec-a-flagged-word-fails-check
   */
  it('reports an unused word and a reading of nothing, in the findings of check', () => {
    const { out, code } = check(doc({ node: 'sig Node { next: lone Node }\nvar sig Done in Node {}\nsig Lonely {}', reading: 'noun Node: node\nnext: {2} follows {1} | {2} does not follow {1}\nDone: {1} is done | {1} is not done\nGhost: {1} is a ghost | {1} is not a ghost' }));
    expect(out).toContain('CANON.md: term-node: undeclared: the reading "Ghost" says a word that nothing in the document declares');
    expect(out).toContain('CANON.md: term-node: unused: declares "Lonely", which no claim, definition or fact uses');
    expect(code).toBe(1);
  });

  /**
   * @canon spec-check-reports-nothing-about-a-word-that-is-in-order
   */
  it('says nothing about a document whose words are in order', () => {
    expect(check(doc()).out).not.toMatch(/undeclared|misplaced|apart|unused/);
  });
});
