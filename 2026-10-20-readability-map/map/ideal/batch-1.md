## s061  (canon · spec-a-fenced-block-with-a-language-belongs-to-the-unit-whose-own-text-holds-it)

Formula:

```alloy
all f: Fence, u: Unit | (f in Languaged and f->u in Within.rel) implies u->f in Blocks.rel
```

Current words:

```text
For every fence_1 and every unit:

when all of these hold:
- fence_1 is a fence that names a language
- fence_1 lies in the own text of the unit

then checker reads fence_1 as a block of the unit.
```

## s074  (canon · axiom-a-check-the-project-asked-for-is-never-dropped-silently)

Formula:

```alloy
all r: Run | ((some f: Frontmatter, p: Missing | lists[f, p]) or (some d: Document | d in Unreadable) or (some c: Command | r->c in Ask.rel and not available[c]) or (some p: Plugin | r->p in Return.code2)) implies r in Exits2
```

Current words:

```text
For every run:

when at least one of these holds:
- there are frontmatter_1 and missing_plugin_1 such that frontmatter_1 lists missing_plugin_1
- there is a document such that checker reports that the document has a frontmatter it cannot read
- the run asks for a command that is not available
- the run gets code 2 from a plugin

then the run exits with code 2.
```

## s051  (canon · spec-a-declared-test-checks-only-claims)

Formula:

```alloy
all t: Test | (t in Declared and (some u: Unit | checks[t, u] and u not in Claim)) implies t in Misaiming
```

Current words:

```text
For every test:

when project declares the test and the test checks a unit that is not a claim, checker reports a misaiming for the test.
```

## s023  (canon · spec-a-miscited-unit-is-misnested)

Formula:

```alloy
all u: Unit | miscited[u] implies u in Misnesting
```

Current words:

```text
For every unit:

when the unit is miscited, checker reports a misnesting for the unit.
```

## s011  (canon · term-hidden)

Formula:

```alloy
pred hidden[x: Unit] {
  (x in Bug and ((some Tracker and (no i: Issue | x->i in Name.issue)) or (some i: Issue | x->i in Name.issue and i not in Known) or (some i: Issue | x->i in Name.issue and i in Closed) or (some Runner and not tested[x])))
  or (x in Conflict and ((some Tracker and (no i: Issue | x->i in Name.issue)) or (some i: Issue | x->i in Name.issue and i not in Known) or (some i: Issue | x->i in Name.issue and i in Closed) or not paired[x]))
}
```

Current words:

```text
For every unit:

the unit is hidden exactly when at least one of these holds:
- all of these hold:
  - the unit is a bug
  - at least one of these holds:
    - project has a tracker and the unit names no issue
    - the unit names an issue that tracker does not know
    - the unit names an issue that tracker has closed
    - project has a runner and the unit is not tested
- all of these hold:
  - the unit is a conflict
  - at least one of these holds:
    - project has a tracker and the unit names no issue
    - the unit names an issue that tracker does not know
    - the unit names an issue that tracker has closed
    - the unit is not paired
```

## s089  (canon · spec-an-extension-that-leads-back-is-refused)

Formula:

```alloy
all f: Looping | f in Refused
```

Current words:

```text
For every circular frontmatter:

the circular frontmatter is a frontmatter that the checker cannot read.
```

## s087  (canon · spec-a-key-written-twice-is-refused)

Formula:

```alloy
all f: Doubled | f in Refused
```

Current words:

```text
For every doubled frontmatter:

the doubled frontmatter is a frontmatter that the checker cannot read.
```

## s049  (canon · spec-an-adrift-test-is-reported)

Formula:

```alloy
all t: Test | adrift[t] implies t in Finding
```

Current words:

```text
For every test:

when the test is adrift, checker reports a finding for the test.
```

## s067  (canon · spec-a-nested-units-block-is-its-own)

Formula:

```alloy
all f: Fence, u: Unit | f->u in Within.rel implies (no v: Unit | v->u in Sit.rel and v->f in Blocks.rel)
```

Current words:

```text
For every fence and every unit_1:

when the fence lies in the own text of unit_1, checker reads the fence as a block of no unit that sits in unit_1.
```

## s104  (canon · spec-a-finding-fails-the-run)

Formula:

```alloy
all r: Run | ((some p: Plugin | r->p in Return.code1) and (no p: Plugin | r->p in Return.code2)) implies r in Exits1
```

Current words:

```text
For every run:

when the run gets code 1 from a plugin and gets code 2 from no plugin, the run exits with code 1.
```

## s019  (canon · spec-a-spec-cites-an-axiom-or-a-spec)

Formula:

```alloy
all s: Spec | ((no a: Axiom | cites[s, a]) and (no t: Spec | cites[s, t])) implies s in Freelancing
```

Current words:

```text
For every spec_1:

when spec_1 cites no axiom and cites no spec, checker reports a freelancing for spec_1.
```

## s048  (canon · spec-a-tag-names-a-unit)

Formula:

```alloy
all g: Tag | (no u: Unit | g->u in Name.tag) implies g in Rotting
```

Current words:

```text
For every tag:

when the tag names no unit, checker reports a rotting for the tag.
```

## s039  (canon · spec-a-conflict-names-an-issue)

Formula:

```alloy
all c: Conflict | (some Tracker and (no i: Issue | c->i in Name.issue)) implies c in Untracking
```

Current words:

```text
For every conflict:

when project has a tracker and the conflict names no issue, checker reports an untracking for the conflict.
```

## s081  (canon · spec-a-frontmatter-with-no-plugins-key-holds-no-entry)

Formula:

```alloy
all f: Frontmatter | f not in Listing implies (no e: Entry | f->e in Item.rel)
```

Current words:

```text
For every frontmatter_1:

when frontmatter_1 is not a frontmatter with a plugins key, frontmatter_1 holds no entry.
```

## s109  (canon · scenario-1-term-checker)

Formula:

```alloy
some a: Axiom, s: Spec, t: Test, g: Tag, d: Document, i: Index | s->a in Sit.rel and t in Declared and t->g in Carry.rel and g->s in Name.tag and d->a in Hold.units and d->s in Hold.units and d->i in Hold.indexes and i->d in Match.rel and (all f: Thing | f not in Finding)
```

Current words:

```text
It must be possible that:

There are axiom_1 and spec_1 and test_1 and tag_1 and document_1 and index_1 such that all of these hold:
- spec_1 sits in axiom_1
- project declares test_1
- test_1 carries tag_1
- tag_1 names spec_1
- document_1 holds axiom_1
- document_1 holds spec_1
- document_1 holds index_1
- index_1 matches document_1
- for every thing:

  checker reports no finding for the thing.
```

## s001  (canon · term-unfounded)

Formula:

```alloy
pred unfounded[u: Unit] {
  (u in Spec and (no a: Axiom | cites[u, a]) and (no s: Spec | cites[u, s]))
  or (u in Exception and (no s: Spec | cites[u, s]))
  or (u in Exception and (no f: Fact | cites[u, f]))
  or (u in Bug and (no s: Spec | cites[u, s]))
}
```

Current words:

```text
For every unit:

the unit is unfounded exactly when the unit is one of these:
- a spec that cites no axiom and cites no spec
- an exception that cites no spec or cites no fact
- a bug that cites no spec
```

## s063  (canon · spec-a-block-whose-second-word-is-vocabulary-has-the-role-of-vocabulary)

Formula:

```alloy
all f: Fence | f in VocabularyWord implies f in VocabularyBlock
```

Current words:

```text
For every fence:

when the second word of the fence is vocabulary, the fence has the role of vocabulary.
```

## s027  (canon · spec-an-exception-cites-only-specs-and-facts)

Formula:

```alloy
all e: Exception | (some u: Unit | cites[e, u] and u not in Spec and u not in Fact) implies e in Misnesting
```

Current words:

```text
For every exception:

when the exception cites a unit that is not a spec or a fact, checker reports a misnesting for the exception.
```

## s008  (canon · term-check)

Formula:

```alloy
pred checks[t: Test, u: Unit] { some g: Tag | t->g in Carry.rel and g->u in Name.tag }
```

Current words:

```text
For every test and every unit:

the test checks the unit exactly when the test carries a tag that names the unit.
```

## s002  (canon · term-miscited)

Formula:

```alloy
pred miscited[u: Unit] {
  (u in Axiom and (some v: Unit | cites[u, v] and v not in Axiom))
  or (u in Fact and (some v: Unit | cites[u, v]))
  or (u in Spec and (some v: Unit | cites[u, v] and v not in Axiom and v not in Spec and v not in Fact))
  or (u in Exception and (some v: Unit | cites[u, v] and v not in Spec and v not in Fact))
  or (u in Bug and (some v: Unit | cites[u, v] and v not in Spec))
  or (u in Conflict and (some v: Unit | cites[u, v]))
  or (u in Term and (some v: Unit | cites[u, v]))
}
```

Current words:

```text
For every unit_1:

unit_1 is miscited exactly when unit_1 is one of these:
- an axiom that cites a unit that is not an axiom
- a fact that cites a unit
- a spec that cites a unit that is not an axiom, a spec or a fact
- an exception that cites a unit that is not a spec or a fact
- a bug that cites a unit that is not a spec
- a conflict that cites a unit
- a term that cites a unit
```

## s068  (canon · spec-a-tested-claim-is-not-untested)

Formula:

```alloy
all c: Claim | tested[c] implies c not in Untesting
```

Current words:

```text
For every claim:

when the claim is tested, checker reports no untesting for the claim.
```

## s030  (canon · spec-a-term-cites-nothing)

Formula:

```alloy
all t: Term | (some u: Unit | cites[t, u]) implies t in Misnesting
```

Current words:

```text
For every term:

when the term cites a unit, checker reports a misnesting for the term.
```

## s078  (canon · spec-a-plugin-a-document-does-not-list-does-not-run-over-it)

Formula:

```alloy
all p: Plugin, d: Document, f: Listing | (d->f in Head.rel and not lists[f, p] and d not in Given) implies p->d not in Over.rel
```

Current words:

```text
For every plugin and every document and every listing frontmatter:

when all of these hold:
- the document starts with the listing frontmatter
- the listing frontmatter does not list the plugin
- the command line of a run does not name the document

then checker does not run the plugin over the document.
```

## s041  (canon · spec-a-conflict-names-an-open-issue)

Formula:

```alloy
all c: Conflict | (some i: Issue | c->i in Name.issue and i in Closed) implies c in OutdatedTracking
```

Current words:

```text
For every conflict:

when the conflict names an issue that tracker has closed, checker reports an outdated tracking for the conflict.
```

## s153  (canon-plugin-alloy · spec-a-trial-leaves-out-only-the-units-the-author-asks-about)

Formula:

```alloy
all s: Search, c: Scenario, u: Unit | (s in Trial and s->c in Pose.scenario and s->u in Leave.rel and (some v: Unit | c->v in Probe.rel)) implies c->u in Probe.rel
```

Current words:

```text
For every search and every scenario and every unit_1:

when all of these hold:
- the search leaves one unit out
- the search requires the scenario to happen
- the search leaves out unit_1
- there is a unit_2 such that the author asks about leaving out unit_2 for the scenario

then the author asks about leaving out unit_1 for the scenario.
```

## s183  (naturalloy · term-sentenceable)

Formula:

```alloy
pred sentenceable[f: Series] { f in Few and f not in NotClause and (f not in CommaItem or f not in MoreThanTwo) and f not in TooLong and f not in TimeBeforeLast and f not in RelativeBeforeLast }
```

Current words:

```text
For every list:

the list can be put in a sentence exactly when all of these hold:
- the list has three clauses or fewer
- the list has only items that are one clause
- at least one of these holds:
  - the list has no item that holds a comma
  - the list has two clauses or fewer
- the list fits a line when it is put in a sentence
- the list has no clause before its last that begins with a time phrase
- the list has no clause before its last with a relative clause in it
```

## s043  (canon · spec-a-misleading-test-is-reported)

Formula:

```alloy
all t: Test | misleading[t] implies t in Finding
```

Current words:

```text
For every test:

when the test is misleading, checker reports a finding for the test.
```

## s040  (canon · spec-a-conflict-names-an-issue-the-tracker-knows)

Formula:

```alloy
all c: Conflict | (some i: Issue | c->i in Name.issue and i not in Known) implies c in Mistracking
```

Current words:

```text
For every conflict:

when the conflict names an issue that tracker does not know, checker reports a mistracking for the conflict.
```

## s134  (canon-plugin-alloy · spec-generate-fails-on-a-handwritten-statement-and-says-so)

Formula:

```alloy
all r: Run, c: GenerateCommand, u: Unit | (r->c in Ask.rel and u in Handwritten) implies (u in Reported and r not in Exits0)
```

Current words:

```text
For every run and every generate command and every unit:

when the run asks for the generate command and the statement of the unit is handwritten, checker reports the statement of the unit and the run does not exit with code 0.
```

## s034  (canon · spec-a-bug-names-an-issue)

Formula:

```alloy
all b: Bug | (some Tracker and (no i: Issue | b->i in Name.issue)) implies b in Untracking
```

Current words:

```text
For every bug:

when project has a tracker and the bug names no issue, checker reports an untracking for the bug.
```

## s129  (canon-plugin-alloy · spec-generate-never-overwrites-a-handwritten-statement)

Formula:

```alloy
all u: Unit | u in Handwritten implies u not in Rewritten
```

Current words:

```text
For every unit:

when the statement of the unit is handwritten, checker does not write the statement of the unit when it generates.
```

## s164  (canon-plugin-alloy · spec-the-claims-of-an-extended-document-join-the-model)

Formula:

```alloy
all d: Document, e: Document, u: Unit | (d in Checked and d->e in Context.rel and e->u in Hold.units and u in BareFormula) implies u in Held
```

Current words:

```text
For every document_1 and every document_2 and every unit:

when all of these hold:
- the project lists document_1 among the documents it checks
- document_2 is context for document_1
- document_2 holds the unit
- the unit holds a formula with no keyword

then the analyzer is asked to hold the formula of the unit.
```

## s121  (canon-plugin-alloy · spec-a-formula-that-the-readings-cannot-say-is-unsayable)

Formula:

```alloy
all u: Unit | (u in Wordless or u in Twofold) implies u in Unsayable
```

Current words:

```text
For every unit:

when at least one of these holds:
- the formula of the unit names a word that has no reading
- the unit holds more than one formula

then the formula of the unit cannot be said in words.
```

## s160  (canon-plugin-alloy · spec-units-that-share-a-word-are-asked-about-together)

Formula:

```alloy
all u: Unit, v: Unit | u->v in Share.rel implies u->v in Together.rel
```

Current words:

```text
For every unit_1 and every unit_2:

when unit_1 shares a word with unit_2, the analyzer is asked about unit_1 together with unit_2.
```

## s151  (canon-plugin-alloy · spec-a-trial-leaves-out-one-held-unit-and-keeps-the-rest)

Formula:

```alloy
all s: Search, c: Scenario, u: Unit | (s in Trial and s->c in Pose.scenario and s->u in Leave.rel) implies (u in Held and s->u not in Pose.units and (all v: Unit | (v in Held and v != u) implies s->v in Pose.units))
```

Current words:

```text
For every search and every scenario and every unit_1:

when the search leaves one unit out, requires the scenario to happen and leaves out unit_1,

then all of these hold:
- the analyzer is asked to hold the formula of unit_1
- the search does not require unit_1 to hold
- for every unit_2:

  when all of these hold:
  - the analyzer is asked to hold the formula of unit_2
  - unit_2 and unit_1 are different

  then the search requires unit_2 to hold.
```

## s161  (canon-plugin-alloy · spec-units-that-share-no-word-are-asked-about-apart)

Formula:

```alloy
all u: Unit, v: Unit | u->v in Together.rel implies u->v in Chain.rel
```

Current words:

```text
For every unit_1 and every unit_2:

when the analyzer is asked about unit_1 together with unit_2, unit_1 is linked to unit_2 through shared words.
```

## s133  (canon-plugin-alloy · spec-a-report-of-a-statement-fails-check)

Formula:

```alloy
all r: Run, c: CheckCommand, u: Unit | (r->c in Ask.rel and u in Reported) implies r not in Exits0
```

Current words:

```text
For every run and every check command and every unit:

when the run asks for the check command and checker reports the statement of the unit, the run does not exit with code 0.
```

## s150  (canon-plugin-alloy · spec-a-trial-is-made-only-for-a-scenario-that-cannot-happen)

Formula:

```alloy
all s: Search, c: Scenario | (s in Trial and s->c in Pose.scenario) implies (c in Impossible and s in Afterwards)
```

Current words:

```text
For every search_1 and every scenario_1:

when search_1 leaves one unit out and requires scenario_1 to happen,

then all of these hold:
- scenario_1 is a scenario that cannot happen while every held unit holds
- search_1 is asked after the first search is answered
```

## s126  (canon-plugin-alloy · spec-generate-writes-what-is-not-current-and-nothing-else)

Formula:

```alloy
all u: Unit | (u in Rewritten implies (u in Unwritten or u in Stale)) and ((u in Unwritten or u in Stale) implies u in Rewritten)
```

Current words:

```text
For every unit:

all of these hold:
- when checker writes the statement of the unit when it generates, the statement of the unit is unwritten or the statement of the unit is stale
- when the statement of the unit is unwritten or the statement of the unit is stale, checker writes the statement of the unit when it generates
```
