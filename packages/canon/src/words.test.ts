/**
 * The words of a document that keeps readings: what it declares, where, what
 * says it, and what uses it. This file tests the checker's own tooling, not a
 * project's canon, so it carries no `@canon` tag.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { checkWords, declared } from './words.ts';

const CLI = join(dirname(fileURLToPath(import.meta.url)), 'cli.ts');
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

## @axiom every-node-is-done

\`\`\`alloy
${parts.spec ?? 'always all n: Node | n in Done or no n.next'}
\`\`\`
${parts.extra ?? ''}`;

const kinds = (src: string): string[] => checkWords(src).map(f => f.kind);

describe('the words a document declares', () => {
  it('are the signatures, their fields, and the predicates', () => {
    const src = doc({
      node: 'abstract sig Thing {}\nsig Node extends Thing { next: lone Node, var seen: set Node, a, b: Node }\none sig Holder { rel: Node -> Node }\nsig P, Q in Node {}\npred ok[n: Node] { n in P }\nfact f { some Node }'
    });
    expect(declared(src).map(w => `${w.kind} ${w.name}`)).toEqual([
      'signature Thing', 'signature Node', 'field Node.next', 'field Node.seen', 'field Node.a', 'field Node.b',
      'signature Holder', 'field Holder.rel', 'signature P', 'signature Q', 'predicate ok'
    ]);
  });

  it('are found in the unit that holds them, and not in a comment', () => {
    const src = doc({ node: 'sig Node {} -- sig Hidden {}\n// sig Hidden2 {}\n/* sig Hidden3 {} */' });
    expect(declared(src).map(w => [w.name, w.unit])).toEqual([['Node', 'term-node']]);
  });
});

describe('the words of a document', () => {
  it('are clean when each is declared in a term, said beside its declaration, and used', () => {
    expect(checkWords(doc())).toEqual([]);
  });

  it('are left alone in a document that keeps no readings', () => {
    expect(checkWords(doc({ reading: '' }))).toEqual([]);
    expect(checkWords('# Canon\n\n## @term x\n\n```alloy vocabulary\nsig Unused {}\n```\n')).toEqual([]);
  });

  it('are undeclared when a reading or a noun says something the document does not declare', () => {
    expect(checkWords(doc({ reading: 'noun Node: node\nnoun Ghost: ghost\nnext: {2} follows {1} | {2} does not follow {1}\nDone: {1} is done | {1} is not done\nPhantom: {1} is a phantom | {1} is not a phantom' }))).toEqual([
      { unit: 'term-node', kind: 'undeclared', message: 'the noun "Ghost" says a word that nothing in the document declares' },
      { unit: 'term-node', kind: 'undeclared', message: 'the reading "Phantom" says a word that nothing in the document declares' }
    ]);
  });

  it('are keyed by a field either bare or with its signature, and by a primed set', () => {
    const src = doc({ node: 'sig Node { next: lone Node }\nvar sig Done in Node {}', reading: 'noun Node: node\nNode.next: {2} follows {1} | {2} does not follow {1}\nDone\': {1} is done next | {1} is not done next\nDone: {1} is done | {1} is not done', spec: "always all n: Node | n in Done' or no n.next" });
    expect(checkWords(src)).toEqual([]);
  });

  it('are misplaced when a declaration is in a unit that is not a term', () => {
    const src = doc({ extra: '\n```alloy vocabulary\nsig Stray {}\n```\n', spec: 'always all n: Node | n in Done or no n.next' }).replace('## @axiom every-node-is-done\n', '## @axiom every-node-is-done\n\n```alloy vocabulary\npred late[n: Node] { n in Done }\n```\n');
    expect(kinds(src)).toContain('misplaced');
    expect(checkWords(src).filter(f => f.kind === 'misplaced').map(f => f.unit)).toEqual(['axiom-every-node-is-done', 'axiom-every-node-is-done']);
  });

  it('are apart when a reading is in another unit than its declaration', () => {
    const src = doc({ reading: 'noun Node: node\nnext: {2} follows {1} | {2} does not follow {1}' }).concat('\n## @term done\n\n```readings\nDone: {1} is done | {1} is not done\n```\n');
    expect(checkWords(src)).toEqual([{ unit: 'term-done', kind: 'apart', message: '"Done" is declared in term-node, so its reading belongs there' }]);
  });

  it('are unused when no claim, definition or fact uses them', () => {
    const src = doc({ node: 'sig Node { next: lone Node }\nvar sig Done in Node {}\nsig Lonely {}\npred idle[n: Node] { some n }', reading: 'noun Node: node\nnext: {2} follows {1} | {2} does not follow {1}\nDone: {1} is done | {1} is not done' });
    expect(checkWords(src).map(f => `${f.kind} ${f.message}`)).toEqual([
      'unused declares "Lonely", which no claim, definition or fact uses',
      'unused declares "idle", which no claim, definition or fact uses'
    ]);
  });

  it('are used when a fact or a parent signature or another predicate names them', () => {
    const src = doc({
      node: 'sig Node { next: lone Node }\nvar sig Done in Node {}\nsig Leaf extends Node {}\npred ok[n: Node] { n in Done }\nfact f { all n: Leaf | ok[n] }',
      spec: 'always all n: Node | n in Done or no n.next'
    });
    expect(checkWords(src).filter(f => f.kind === 'unused')).toEqual([]);
  });

  it('count a field as used only through its own signature when another signature has a field of that name', () => {
    const src = doc({ node: 'sig Node { rel: lone Node }\none sig Other { rel: Node -> Node }\nvar sig Done in Node {}', reading: 'noun Node: node\nOther.rel: {1} is before {2} | {1} is not before {2}\nNode.rel: {2} follows {1} | {2} does not follow {1}\nDone: {1} is done | {1} is not done', spec: 'always all n: Node | n in Done or n->n in Other.rel' });
    expect(checkWords(src).map(f => f.message)).toEqual(['declares "Node.rel", which no claim, definition or fact uses']);
  });
});

describe('the command line', () => {
  /** A project of one document; what `check` printed and its code. */
  function check(document: string) {
    const dir = mkdtempSync(join(tmpdir(), 'canon-words-'));
    DIRS.push(dir);
    mkdirSync(join(dir, 'test', 'canon'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ canon: { documents: ['CANON.md'], suites: 'test/canon', sources: ['test'], command: 'canon' } }));
    writeFileSync(join(dir, 'CANON.md'), document);
    spawnSync(process.execPath, [CLI, 'generate'], { cwd: dir });
    const run = spawnSync(process.execPath, [CLI, 'check'], { cwd: dir, encoding: 'utf8' });
    return { out: run.stdout };
  }

  it('reports an unused word and a reading of nothing, in the findings of check', () => {
    const { out } = check(doc({ node: 'sig Node { next: lone Node }\nvar sig Done in Node {}\nsig Lonely {}', reading: 'noun Node: node\nnext: {2} follows {1} | {2} does not follow {1}\nDone: {1} is done | {1} is not done\nGhost: {1} is a ghost | {1} is not a ghost' }));
    expect(out).toContain('CANON.md: term-node: undeclared: the reading "Ghost" says a word that nothing in the document declares');
    expect(out).toContain('CANON.md: term-node: unused: declares "Lonely", which no claim, definition or fact uses');
  });

  it('says nothing about a document whose words are in order', () => {
    expect(check(doc()).out).not.toMatch(/undeclared|misplaced|apart|unused/);
  });
});
