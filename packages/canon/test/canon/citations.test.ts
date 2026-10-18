/**
 * What a unit cites, and what the checker reports when a unit cites too
 * little or a kind it may not.
 */
import { describe, expect, it } from 'vitest';
import { canon, check } from './project.ts';

const SPEC = `
### @spec a-leaf-says-one-thing

> A leaf says one thing.
`;

const SCOPE = `
## @scope the-project-leaves-the-platform-out

> The project leaves the platform out.
`;

const FACT = `
## @fact the-platform-is-one-way

> The platform is one way.
`;

describe('a unit that cites too little', () => {
  /**
   * @canon spec-a-spec-cites-an-axiom-or-a-spec
   */
  it('reports a freelancing for a spec that sits in nothing and derives from nothing', () => {
    expect(check(canon(`${FACT}
## @spec a-spec-alone

> A spec alone.
`)).freelancing).toBe(1);
  });

  /**
   * @canon spec-an-exception-cites-a-spec
   */
  it('reports a freelancing for an exception that cites no spec', () => {
    expect(check(canon(`${FACT}
## @exception an-exception-alone

> An exception alone.

Derives from: [\`fact-the-platform-is-one-way\`](#fact-the-platform-is-one-way)
`)).freelancing).toBe(1);
  });

  /**
   * @canon spec-an-exception-cites-a-fact
   */
  it('reports a freelancing for an exception that cites no fact', () => {
    expect(check(canon(`${SPEC}
#### @exception the-leaf-bends

> The leaf bends.
`)).freelancing).toBe(1);
  });

  /**
   * @canon spec-a-bug-cites-a-spec
   */
  it('reports a freelancing for a bug that cites no spec', () => {
    expect(check(canon(`
## @bug a-bug-alone

> A bug alone.

Issue: #7
`)).freelancing).toBe(1);
  });

  /**
   * @canon bug-a-link-in-the-body-counts-as-a-citation
   */
  it.fails('reports a freelancing for a spec whose body only links to an axiom', () => {
    expect(check(canon(`
## @spec a-spec-that-mentions-an-axiom

> A spec that mentions an axiom.

It comes from [\`axiom-a-program-means-one-thing\`](#axiom-a-program-means-one-thing).
`)).freelancing).toBe(1);
  });
});

describe('a unit that cites a kind it may not', () => {
  /**
   * @canon spec-an-axiom-cites-only-axioms-and-scopes
   */
  it('reports a misnesting for an axiom that sits in a spec', () => {
    expect(check(canon(`${SPEC}
#### @axiom a-value-under-a-spec

> A value under a spec.
`)).misnested).toBe(1);
  });

  /**
   * @canon spec-an-axiom-cites-only-axioms-and-scopes
   */
  it('reports no misnesting for an axiom that sits in a scope', () => {
    expect(check(canon(`${SCOPE}
### @axiom a-value-under-a-scope

> A value under a scope.
`)).misnested).toBeUndefined();
  });

  /**
   * @canon spec-a-scope-cites-nothing
   */
  it('reports a misnesting for a scope that sits in an axiom', () => {
    expect(check(canon(`
### @scope a-scope-under-an-axiom

> The project takes on a scope under an axiom.
`)).misnested).toBe(1);
  });

  /**
   * @canon spec-a-fact-cites-nothing
   */
  it('reports a misnesting for a fact that sits in an axiom', () => {
    expect(check(canon(`
### @fact a-fact-under-an-axiom

> A fact under an axiom.
`)).misnested).toBe(1);
  });

  /**
   * @canon spec-a-spec-cites-only-axioms-specs-facts-and-scopes
   */
  it('reports a misnesting for a spec that sits in a term', () => {
    expect(check(canon(`
## Terms

### @term word

> A word is a word.

#### @spec a-spec-under-a-term

> A spec under a term.
`)).misnested).toBe(1);
  });

  /**
   * @canon spec-a-spec-cites-only-axioms-specs-facts-and-scopes
   */
  it('reports no misnesting for a spec that sits in a scope', () => {
    expect(check(canon(`${SCOPE}
### @spec a-spec-under-a-scope

> A spec under a scope.
`)).misnested).toBeUndefined();
  });

  /**
   * @canon spec-an-exception-cites-only-specs-facts-and-scopes
   */
  it('reports a misnesting for an exception that sits in an axiom', () => {
    expect(check(canon(`
### @exception an-exception-under-an-axiom

> An exception under an axiom.
`)).misnested).toBe(1);
  });

  /**
   * @canon spec-an-exception-cites-only-specs-facts-and-scopes
   */
  it('reports no misnesting for an exception that sits in a scope', () => {
    expect(check(canon(`${SCOPE}
### @exception an-exception-under-a-scope

> An exception under a scope.
`)).misnested).toBeUndefined();
  });

  /**
   * @canon spec-a-bug-cites-only-specs
   */
  it('reports a misnesting for a bug that sits in an axiom', () => {
    expect(check(canon(`
### @bug a-bug-under-an-axiom

> A bug under an axiom.

Issue: #7
`)).misnested).toBe(1);
  });

  /**
   * @canon spec-a-conflict-cites-nothing
   */
  it('reports a misnesting for a conflict that sits in a spec', () => {
    expect(check(canon(`${SPEC}
#### @conflict a-conflict-under-a-spec

> A conflict under a spec.

Issue: #9
`)).misnested).toBe(1);
  });

  /**
   * @canon spec-a-term-cites-nothing
   */
  it('reports a misnesting for a term that sits in an axiom', () => {
    expect(check(canon(`
### @term a-term-under-an-axiom

> A term under an axiom is a word.
`)).misnested).toBe(1);
  });

  /**
   * @canon bug-a-derives-from-line-is-not-checked-for-its-kind
   */
  it.fails('reports a misnesting for a fact whose "Derives from:" line names a spec', () => {
    expect(check(canon(`${SPEC}${FACT}
Derives from: [\`spec-a-leaf-says-one-thing\`](#spec-a-leaf-says-one-thing)
`)).misnested).toBe(1);
  });

  /**
   * @canon bug-a-derives-from-line-is-not-checked-for-its-kind
   */
  it.fails('reports a misnesting for a scope whose "Derives from:" line names a spec', () => {
    expect(check(canon(`${SPEC}${SCOPE}
Derives from: [\`spec-a-leaf-says-one-thing\`](#spec-a-leaf-says-one-thing)
`)).misnested).toBe(1);
  });
});

describe('a unit that follows from itself', () => {
  /**
   * @canon spec-a-unit-does-not-depend-on-itself
   */
  it('reports a cycle for a spec that derives from itself', () => {
    expect(check(canon(`
### @spec the-lone-leaf

> The lone leaf.

Derives from: [\`spec-the-lone-leaf\`](#spec-the-lone-leaf)
`)).cycle).toBe(1);
  });

  /**
   * @canon spec-a-unit-does-not-depend-on-itself
   */
  it('reports a cycle for two specs that each derive from the other', () => {
    expect(check(canon(`
### @spec the-first-leaf

> The first leaf.

Derives from: [\`spec-the-second-leaf\`](#spec-the-second-leaf)

### @spec the-second-leaf

> The second leaf.

Derives from: [\`spec-the-first-leaf\`](#spec-the-first-leaf)
`)).cycle).toBe(1);
  });
});
