## s007  (canon · term-used)

Formula:

```alloy
pred used[u: Unit] {
  (some v: Unit | v != u and v->u in Sit.rel)
  or (some p: Pointer | p->u in Name.pointer)
  or (some g: Tag | g->u in Name.tag)
}
```

Current words:

```text
For every unit_1:

unit_1 is used exactly when another unit sits in unit_1, a pointer names unit_1 or a tag names unit_1.
```

## s070  (canon · spec-a-claim-an-undeclared-test-checks-is-not-untested)

Formula:

```alloy
all c: Claim | (some t: Test | t not in Declared and checks[t, c]) implies c not in Untesting
```

Current words:

```text
For every claim:

when a test that project does not declare checks the claim, checker reports no untesting for the claim.
```

## s142  (canon-plugin-alloy · spec-a-flagged-word-fails-check)

Formula:

```alloy
all r: Run, c: CheckCommand, w: Word | (r->c in Ask.rel and w in Flagged) implies r not in Exits0
```

Current words:

```text
For every run and every check command and every word_1:

when the run asks for the check command and checker reports the word word_1, the run does not exit with code 0.
```

## s029  (canon · spec-a-conflict-cites-nothing)

Formula:

```alloy
all c: Conflict | (some u: Unit | cites[c, u]) implies c in Misnesting
```

Current words:

```text
For every conflict:

when the conflict cites a unit, checker reports a misnesting for the conflict.
```

## s065  (canon · spec-a-block-whose-second-word-is-scenario-has-the-role-of-scenario)

Formula:

```alloy
all f: Fence | f in ScenarioWord implies f in ScenarioBlock
```

Current words:

```text
For every fence:

when the second word of the fence is scenario, the fence has the role of scenario.
```

## s046  (canon · axiom-a-canon-cannot-go-out-of-date-unnoticed)

Formula:

```alloy
(all c: Claim | (some Runner and unguarded[c]) implies c in Finding)
and (all g: Tag | (no u: Unit | g->u in Name.tag) implies g in Finding)
and (all t: Test | adrift[t] implies t in Finding)
and (all p: Pointer | (no x: Target | p->x in Name.pointer) implies p in Finding)
and (all u: Unit | (not used[u] and u not in Conflict) implies u in Finding)
and (all u: Unit | (some t: Trailer | t->u in Follow.rel) implies u in Finding)
and (all d: Document | ((some u: Unit | d->u in Hold.units) and (no i: Index | d->i in Hold.indexes)) implies d in Finding)
and (all d: Document | (some i: Index | d->i in Hold.indexes and i->d not in Match.rel) implies d in Finding)
and (all c: Claim | (some s: Site | c->s in Name.site and (no r: Source | r->s in Hold.symbols)) implies c in Finding)
and (all u: Unit | (some v: Unit | u->v in Repeat.rel) implies u in Finding)
```

Current words:

```text
All of these hold:
- for every claim:

  when project has a runner and the claim is unguarded, checker reports a finding for the claim
- for every tag:

  when the tag names no unit, checker reports a finding for the tag
- for every test:

  when the test is adrift, checker reports a finding for the test
- for every pointer:

  when the pointer names no target, checker reports a finding for the pointer
- for every unit_1:

  when unit_1 is not used and is not a conflict, checker reports a finding for unit_1
- for every unit_1:

  when a trailer follows unit_1, checker reports a finding for unit_1
- for every document:

  when the document holds a unit and holds no index, checker reports a finding for the document
- for every document:

  when the document holds an index that does not match the document, checker reports a finding for the document
- for every claim:

  when the claim names a site that no source holds, checker reports a finding for the claim
- for every unit_1:

  when unit_1 repeats a unit, checker reports a finding for unit_1.
```

## s044  (canon · spec-an-expected-failure-checks-a-bug-or-an-exception)

Formula:

```alloy
all x: ExpectedFailure | ((no b: Bug | checks[x, b]) and (no e: Exception | checks[x, e])) implies x in UnexplainedFailure
```

Current words:

```text
For every expected failure:

when the expected failure checks no bug and checks no exception, checker reports an unexplained failure for the expected failure.
```

## s035  (canon · spec-a-bug-names-an-issue-the-tracker-knows)

Formula:

```alloy
all b: Bug | (some i: Issue | b->i in Name.issue and i not in Known) implies b in Mistracking
```

Current words:

```text
For every bug:

when the bug names an issue that tracker does not know, checker reports a mistracking for the bug.
```

## s098  (canon · spec-a-command-that-is-not-available-is-reported-as-unknown)

Formula:

```alloy
all r: Run, c: Command | (r->c in Ask.rel and not available[c]) implies c in Unknown
```

Current words:

```text
For every run and every command_1:

when the run asks for command_1 and command_1 is not available, checker reports command_1 as an unknown command.
```

## s107  (canon · spec-a-frontmatter-leaves-the-units-of-its-document-as-they-were)

Formula:

```alloy
all d, e: Document | d->e in Bare.rel implies (all u: Unit | (e->u in Hold.units implies d->u in Hold.units) and (d->u in Hold.units implies e->u in Hold.units))
```

Current words:

```text
For every document_1 and every document_2:

when document_1 is document_2 without its frontmatter,

then for every unit:

all of these hold:
- when document_2 holds the unit, document_1 holds the unit
- when document_1 holds the unit, document_2 holds the unit
```

## s014  (canon · term-apply)

Formula:

```alloy
pred applies[p: Plugin, d: Document] { some f: Listing | d->f in Head.rel and lists[f, p] }
```

Current words:

```text
For every plugin and every document:

the plugin applies to the document exactly when the document starts with a listing frontmatter that lists the plugin.
```

## s111  (canon · scenario-3-term-checker)

Formula:

```alloy
some c: Conflict, i: Issue, u, v: Unit | u != v and c->i in Name.issue and i in Known and i not in Closed and c->u in Name.between and c->v in Name.between and c not in Finding
```

Current words:

```text
It must be possible that:

There are conflict_1 and issue_1 and unit_1 and unit_2 such that all of these hold:
- unit_1 and unit_2 are different
- conflict_1 names issue_1
- tracker knows issue_1
- tracker has not closed issue_1
- conflict_1 names unit_1
- conflict_1 names unit_2
- checker reports no finding for conflict_1
```

## s099  (canon · spec-a-command-that-is-not-available-stops-the-run)

Formula:

```alloy
all r: Run, c: Command | (r->c in Ask.rel and not available[c]) implies r in Exits2
```

Current words:

```text
For every run and every command:

when the run asks for the command and the command is not available, the run exits with code 2.
```

## s094  (canon · spec-a-plugin-the-project-lacks-fails-the-run)

Formula:

```alloy
all r: Run, f: Frontmatter, p: Missing | lists[f, p] implies (p in Unfound and r in Exits2)
```

Current words:

```text
For every run and every frontmatter and every missing plugin:

when the frontmatter lists the missing plugin,

then all of these hold:
- checker reports that the project lacks the missing plugin
- the run exits with code 2
```

## s080  (canon · spec-a-document-named-on-the-command-line-is-checked-whatever-its-frontmatter-says)

Formula:

```alloy
all r: Run, p: Plugin, d: Given | calls[r, p] implies p->d in Over.rel
```

Current words:

```text
For every run_1 and every plugin and every given document:

when run_1 calls the plugin, checker runs the plugin over the given document.
```

## s077  (canon · spec-a-plugin-a-document-lists-runs-over-it)

Formula:

```alloy
all p: Plugin, d: Document, f: Listing | (d->f in Head.rel and lists[f, p]) implies p->d in Over.rel
```

Current words:

```text
For every plugin and every document and every listing frontmatter:

when the document starts with the listing frontmatter and the listing frontmatter lists the plugin, checker runs the plugin over the document.
```

## s054  (canon · spec-a-unit-is-declared-once)

Formula:

```alloy
all u: Unit | (some v: Unit | u->v in Repeat.rel) implies u in Rotting
```

Current words:

```text
For every unit_1:

when unit_1 repeats a unit, checker reports a rotting for unit_1.
```

## s015  (canon · term-call)

Formula:

```alloy
pred calls[r: Run, p: Plugin] {
  (some c: Command | r->c in Ask.rel and p->c in Add.rel)
  and (some d: Document | applies[p, d])
}
```

Current words:

```text
For every run and every plugin:

the run calls the plugin exactly when all of these hold:
- the run asks for a command that the plugin adds
- the plugin applies to a document
```

## s060  (canon · spec-a-document-is-context-for-the-documents-that-extend-it-and-for-theirs)

Formula:

```alloy
all d: Document, e: Document, g: Document | (d->e in Extend.rel implies d->e in Context.rel) and ((d->e in Extend.rel and e->g in Context.rel) implies d->g in Context.rel)
```

Current words:

```text
For every document_1 and every document_2 and every document_3:

all of these hold:
- when document_1 extends document_2, document_2 is context for document_1
- when document_1 extends document_2 and document_3 is context for document_2, document_3 is context for document_1
```

## s064  (canon · spec-a-block-whose-second-word-is-bounds-has-the-role-of-bounds)

Formula:

```alloy
all f: Fence | f in BoundsWord implies f in BoundsBlock
```

Current words:

```text
For every fence:

when the second word of the fence is bounds, the fence has the role of bounds.
```

## s101  (canon · spec-every-plugin-a-run-calls-runs)

Formula:

```alloy
all r: Run, p: Plugin | calls[r, p] implies (r->p in Return.code0 or r->p in Return.code1 or r->p in Return.code2)
```

Current words:

```text
For every run and every plugin:

when the run calls the plugin,

then the following holds:

the run gets code 0 from the plugin, gets code 1 from the plugin or gets code 2 from the plugin.
```

## s096  (canon · spec-a-missing-plugin-stops-the-run)

Formula:

```alloy
all r: Run, f: Frontmatter, p: Missing | lists[f, p] implies r in Exits2
```

Current words:

```text
For every run and every frontmatter and every missing plugin:

when the frontmatter lists the missing plugin, the run exits with code 2.
```

## s050  (canon · spec-a-declared-test-carries-a-tag)

Formula:

```alloy
all t: Test | (t in Declared and (no g: Tag | t->g in Carry.rel)) implies t in Uncitation
```

Current words:

```text
For every test:

when project declares the test and the test carries no tag, checker reports an uncitation for the test.
```

## s000  (canon · term-cite)

Formula:

```alloy
pred cites[u, v: Unit] { u->v in Sit.rel or u->v in Derive.rel }
```

Current words:

```text
For every unit_1 and every unit_2:

unit_1 cites unit_2 exactly when unit_1 sits in unit_2 or derives from unit_2.
```

## s024  (canon · spec-an-axiom-cites-only-axioms)

Formula:

```alloy
all a: Axiom | (some u: Unit | cites[a, u] and u not in Axiom) implies a in Misnesting
```

Current words:

```text
For every axiom_1:

when axiom_1 cites a unit that is not an axiom, checker reports a misnesting for axiom_1.
```

## s079  (canon · spec-an-empty-list-asks-for-no-plugin)

Formula:

```alloy
all p: Plugin, d: Document, f: Listing | (d->f in Head.rel and (no e: Entry | f->e in Item.rel) and d not in Given) implies p->d not in Over.rel
```

Current words:

```text
For every plugin and every document and every listing frontmatter:

when all of these hold:
- the document starts with the listing frontmatter
- the listing frontmatter holds no entry
- the command line of a run does not name the document

then checker does not run the plugin over the document.
```

## s026  (canon · spec-a-spec-cites-only-axioms-specs-and-facts)

Formula:

```alloy
all s: Spec | (some u: Unit | cites[s, u] and u not in Axiom and u not in Spec and u not in Fact) implies s in Misnesting
```

Current words:

```text
For every spec_1:

when the following holds:

spec_1 cites a unit that is not an axiom, a spec or a fact

then checker reports a misnesting for spec_1.
```

## s066  (canon · spec-a-block-with-no-role-word-is-the-formula-of-its-unit)

Formula:

```alloy
all f: Fence | f in NoSecondWord implies f in UnitBlock
```

Current words:

```text
For every fence:

when the fence has no second word that names a role, the fence has the role of the formula of its unit.
```

## s062  (canon · spec-a-fence-with-no-language-is-prose)

Formula:

```alloy
all f: Fence | f not in Languaged implies (no u: Unit | u->f in Blocks.rel)
```

Current words:

```text
For every fence_1:

when fence_1 is a fence that names no language, checker reads fence_1 as a block of no unit.
```

## s053  (canon · spec-a-pointer-names-a-target)

Formula:

```alloy
all p: Pointer | (no x: Target | p->x in Name.pointer) implies p in Rotting
```

Current words:

```text
For every pointer:

when the pointer names no target, checker reports a rotting for the pointer.
```

## s103  (canon · spec-a-plugin-that-could-not-run-stops-the-run)

Formula:

```alloy
all r: Run | (some p: Plugin | r->p in Return.code2) implies r in Exits2
```

Current words:

```text
For every run:

when the run gets code 2 from a plugin, the run exits with code 2.
```

## s091  (canon · spec-a-refused-frontmatter-fails-the-run)

Formula:

```alloy
all r: Run, d: Document, f: Refused | d->f in Head.rel implies (d in Unreadable and r in Exits2)
```

Current words:

```text
For every run and every document and every refused frontmatter:

when the document starts with the refused frontmatter,

then all of these hold:
- checker reports that the document has a frontmatter it cannot read
- the run exits with code 2
```

## s006  (canon · term-adrift)

Formula:

```alloy
pred adrift[t: Test] {
  (t in Declared and (no g: Tag | t->g in Carry.rel))
  or (t in Declared and (some u: Unit | checks[t, u] and u not in Claim))
  or (some c: Claim | checks[t, c] and refined[c])
}
```

Current words:

```text
For every test:

the test is adrift exactly when at least one of these holds:
- project declares the test and the test carries no tag
- project declares the test and the test checks a unit that is not a claim
- the test checks a claim that is refined
```

## s116  (canon-plugin-alloy · spec-a-document-that-keeps-no-readings-is-left-as-it-is)

Formula:

```alloy
all d: Document, u: Unit | (d->u in Hold.units and d not in Worded) implies (u not in Rewritten and u not in Reported)
```

Current words:

```text
For every document and every unit:

when the document holds the unit and keeps no readings,

then all of these hold:
- checker does not write the statement of the unit when it generates
- checker does not report the statement of the unit
```

## s093  (canon · spec-a-report-of-an-unreadable-frontmatter-stops-the-run)

Formula:

```alloy
all r: Run | (some d: Document | d in Unreadable) implies r in Exits2
```

Current words:

```text
For every run:

when there is a document such that checker reports that the document has a frontmatter it cannot read, the run exits with code 2.
```

## s071  (canon · spec-a-spec-whose-bug-a-test-checks-is-not-untested)

Formula:

```alloy
all s: Spec | (some t: Test, b: Bug | checks[t, b] and b->s in Sit.rel) implies s not in Untesting
```

Current words:

```text
For every spec:

when a test checks a bug that sits in the spec, checker reports no untesting for the spec.
```

## s082  (canon · spec-a-flawed-frontmatter-is-refused)

Formula:

```alloy
all f: Frontmatter | (f in Misquoted or f in Foreign or f in Unclosed or f in Unterminated or f in Doubled or f in Dangling or f in Looping or f in Stray) implies f in Refused
```

Current words:

```text
For every frontmatter_1:

when at least one of these holds:
- frontmatter_1 has the flaw of an entry that starts with an at sign outside quotes
- frontmatter_1 has the flaw of a key that neither the checker nor a plugin that frontmatter_1 lists defines
- frontmatter_1 has the flaw of a list that is not closed
- frontmatter_1 has the flaw of a string that is not closed
- frontmatter_1 has the flaw of a key that appears twice
- frontmatter_1 has the flaw of a path that names no document
- frontmatter_1 has the flaw of an extension that leads back to its own document
- frontmatter_1 has the flaw of a setting in a document that is not the entry document

then frontmatter_1 is a frontmatter that the checker cannot read.
```

## s115  (canon-plugin-alloy · axiom-a-statement-says-what-its-logic-says)

Formula:

```alloy
all d: Document, u: Unit | (d in Worded and d->u in Hold.units and u in Logical and u not in Current) implies u in Reported
```

Current words:

```text
For every document and every unit:

when all of these hold:
- the document keeps readings
- the document holds the unit
- the unit holds a formula
- the statement of the unit is not current

then checker reports the statement of the unit.
```

## s100  (canon · spec-an-available-command-is-not-reported-as-unknown)

Formula:

```alloy
all c: Command | available[c] implies c not in Unknown
```

Current words:

```text
For every command_1:

when command_1 is available, checker does not report command_1 as an unknown command.
```
