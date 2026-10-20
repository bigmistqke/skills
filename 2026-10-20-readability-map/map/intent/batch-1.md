Vocabulary file: canon.vocab.md

## s036  (spec-a-bug-names-an-open-issue)

Claim (the unit's name, as a sentence): **a bug names an open issue**

Refines: "a known defect stays in sight" → "a hidden bug is reported"

Formula:
```alloy
all b: Bug | (some i: Issue | b->i in Name.issue and i in Closed) implies b in OutdatedTracking
```

What the formula says, exactly:
```text
For every bug:

when the bug names an issue that tracker has closed, checker reports an outdated tracking for the bug.
```

## s037  (spec-a-bug-is-tested)

Claim (the unit's name, as a sentence): **a bug is tested**

Refines: "a known defect stays in sight" → "a hidden bug is reported"

Formula:
```alloy
all b: Bug | (some Runner and not tested[b]) implies b in Untesting
```

What the formula says, exactly:
```text
For every bug:

when project has a runner and the bug is not tested, checker reports an untesting for the bug.
```

## s038  (spec-a-hidden-conflict-is-reported)

Claim (the unit's name, as a sentence): **a hidden conflict is reported**

Refines: "a known defect stays in sight"

Rationale: This follows because each way a conflict is hidden has a finding of its own: the same three as a bug's for its issue, and an [unpairing](#term-unpairing) when it is not [paired](#term-paired).

Formula:
```alloy
all c: Conflict | hidden[c] implies c in Finding
```

What the formula says, exactly:
```text
For every conflict:

when the conflict is hidden, checker reports a finding for the conflict.
```

## s039  (spec-a-conflict-names-an-issue)

Claim (the unit's name, as a sentence): **a conflict names an issue**

Refines: "a known defect stays in sight" → "a hidden conflict is reported"

Formula:
```alloy
all c: Conflict | (some Tracker and (no i: Issue | c->i in Name.issue)) implies c in Untracking
```

What the formula says, exactly:
```text
For every conflict:

when project has a tracker and the conflict names no issue, checker reports an untracking for the conflict.
```

## s040  (spec-a-conflict-names-an-issue-the-tracker-knows)

Claim (the unit's name, as a sentence): **a conflict names an issue the tracker knows**

Refines: "a known defect stays in sight" → "a hidden conflict is reported"

Formula:
```alloy
all c: Conflict | (some i: Issue | c->i in Name.issue and i not in Known) implies c in Mistracking
```

What the formula says, exactly:
```text
For every conflict:

when the conflict names an issue that tracker does not know, checker reports a mistracking for the conflict.
```

## s041  (spec-a-conflict-names-an-open-issue)

Claim (the unit's name, as a sentence): **a conflict names an open issue**

Refines: "a known defect stays in sight" → "a hidden conflict is reported"

Formula:
```alloy
all c: Conflict | (some i: Issue | c->i in Name.issue and i in Closed) implies c in OutdatedTracking
```

What the formula says, exactly:
```text
For every conflict:

when the conflict names an issue that tracker has closed, checker reports an outdated tracking for the conflict.
```

## s042  (spec-a-conflict-names-two-units)

Claim (the unit's name, as a sentence): **a conflict names two units**

Refines: "a known defect stays in sight" → "a hidden conflict is reported"

Formula:
```alloy
all c: Conflict | not paired[c] implies c in Unpairing
```

What the formula says, exactly:
```text
For every conflict:

when the conflict is not paired, checker reports an unpairing for the conflict.
```

## s043  (spec-a-misleading-test-is-reported)

Claim (the unit's name, as a sentence): **a misleading test is reported**

Refines: "a known defect stays in sight"

Rationale: This follows because each way a test is misleading has a finding of its own. An [expected failure](#term-expected-failure) that [checks](#term-check) no bug and no exception has an [unexplained failure](#term-unexplained-failure), and a [plain test](#term-plain-test) that checks a bug has an [unpinning](#term-unpinning).

Formula:
```alloy
all t: Test | misleading[t] implies t in Finding
```

What the formula says, exactly:
```text
For every test:

when the test is misleading, checker reports a finding for the test.
```

## s044  (spec-an-expected-failure-checks-a-bug-or-an-exception)

Claim (the unit's name, as a sentence): **an expected failure checks a bug or an exception**

Refines: "a known defect stays in sight" → "a misleading test is reported"

Formula:
```alloy
all x: ExpectedFailure | ((no b: Bug | checks[x, b]) and (no e: Exception | checks[x, e])) implies x in UnexplainedFailure
```

What the formula says, exactly:
```text
For every expected failure:

when the expected failure checks no bug and checks no exception, checker reports an unexplained failure for the expected failure.
```

## s045  (spec-a-plain-test-does-not-check-a-bug)

Claim (the unit's name, as a sentence): **a plain test does not check a bug**

Refines: "a known defect stays in sight" → "a misleading test is reported"

Formula:
```alloy
all t: PlainTest | (some b: Bug | checks[t, b]) implies t in Unpinning
```

What the formula says, exactly:
```text
For every plain test:

when the plain test checks a bug, checker reports an unpinning for the plain test.
```

## s046  (axiom-a-canon-cannot-go-out-of-date-unnoticed)

Claim (the unit's name, as a sentence): **a canon cannot go out of date unnoticed**

Refines: "the check can be taken at its word"

Rationale: This narrows taking the check at its word to a clean check: when the checker reports nothing, the canon has not gone out of date. Documentation goes out of date because nothing checks it. A canon goes out of date unnoticed when a claim no test checks stops holding, or when a test stops saying which claim it checks. It goes out of date as well when a link no longer leads where it says. So every leaf claim is [tested](#term-tested), and every [test](#term-test) [checks](#term-check) a leaf through its [tags](#term-tag). A claim that is not is [unguarded](#term-unguarded), and a test that does not is [adrift](#term-adrift). A project with no [runner](#term-runner) has no tests, and holds its canon to itself alone: it owes no test. So too every [pointer](#term-pointer), [index](#term-index) and [site](#term-site) leads where it says, and every id names one unit.

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

What the formula says, exactly:
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

## s047  (spec-an-unguarded-claim-is-untested)

Claim (the unit's name, as a sentence): **an unguarded claim is untested**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because an [untesting](#term-untesting) is the finding for a leaf that no test checks.

Formula:
```alloy
all c: Claim | (some Runner and unguarded[c]) implies c in Untesting
```

What the formula says, exactly:
```text
For every claim:

when project has a runner and the claim is unguarded, checker reports an untesting for the claim.
```

## s048  (spec-a-tag-names-a-unit)

Claim (the unit's name, as a sentence): **a tag names a unit**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because a tag that names no unit checks nothing, and a [rotting](#term-rotting) is its finding. A tag rots when the unit it names is renamed or removed.

Formula:
```alloy
all g: Tag | (no u: Unit | g->u in Name.tag) implies g in Rotting
```

What the formula says, exactly:
```text
For every tag:

when the tag names no unit, checker reports a rotting for the tag.
```

## s049  (spec-an-adrift-test-is-reported)

Claim (the unit's name, as a sentence): **an adrift test is reported**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because each way a test is adrift has a finding of its own. A test that [project](#term-project) [declares](#term-declare) has an [uncitation](#term-uncitation) when it [carries](#term-carry) no tag. It has a [misaiming](#term-misaiming) when it checks a unit that is no [claim](#term-claim). A test that checks a [refined](#term-refined) claim has an [overreach](#term-overreach).

Formula:
```alloy
all t: Test | adrift[t] implies t in Finding
```

What the formula says, exactly:
```text
For every test:

when the test is adrift, checker reports a finding for the test.
```

## s050  (spec-a-declared-test-carries-a-tag)

Claim (the unit's name, as a sentence): **a declared test carries a tag**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed" → "an adrift test is reported"

Formula:
```alloy
all t: Test | (t in Declared and (no g: Tag | t->g in Carry.rel)) implies t in Uncitation
```

What the formula says, exactly:
```text
For every test:

when project declares the test and the test carries no tag, checker reports an uncitation for the test.
```

## s051  (spec-a-declared-test-checks-only-claims)

Claim (the unit's name, as a sentence): **a declared test checks only claims**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed" → "an adrift test is reported"

Formula:
```alloy
all t: Test | (t in Declared and (some u: Unit | checks[t, u] and u not in Claim)) implies t in Misaiming
```

What the formula says, exactly:
```text
For every test:

when project declares the test and the test checks a unit that is not a claim, checker reports a misaiming for the test.
```

## s052  (spec-a-test-checks-only-leaves)

Claim (the unit's name, as a sentence): **a test checks only leaves**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed" → "an adrift test is reported"

Formula:
```alloy
all t: Test | (some c: Claim | checks[t, c] and refined[c]) implies t in Overreach
```

What the formula says, exactly:
```text
For every test:

when the test checks a claim that is refined, checker reports an overreach for the test.
```

## s053  (spec-a-pointer-names-a-target)

Claim (the unit's name, as a sentence): **a pointer names a target**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because a pointer that names no [target](#term-target) leads nowhere, and a [rotting](#term-rotting) is its finding. A pointer rots when the file or the unit it names is renamed or removed.

Formula:
```alloy
all p: Pointer | (no x: Target | p->x in Name.pointer) implies p in Rotting
```

What the formula says, exactly:
```text
For every pointer:

when the pointer names no target, checker reports a rotting for the pointer.
```

## s054  (spec-a-unit-is-declared-once)

Claim (the unit's name, as a sentence): **a unit is declared once**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because a unit that [repeats](#term-repeat) another shares its id, so no pointer or tag can say which of the two it names.

Formula:
```alloy
all u: Unit | (some v: Unit | u->v in Repeat.rel) implies u in Rotting
```

What the formula says, exactly:
```text
For every unit_1:

when unit_1 repeats a unit, checker reports a rotting for unit_1.
```

## s055  (spec-a-unit-is-used)

Claim (the unit's name, as a sentence): **a unit is used**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because a unit nothing [uses](#term-used) can go out of date, and nothing that relies on it notices. An [orphaning](#term-orphaning) is its finding. A conflict is no part of the theory, only a record of where it fails, so nothing uses it.

Formula:
```alloy
all u: Unit | (not used[u] and u not in Conflict) implies u in Orphaning
```

What the formula says, exactly:
```text
For every unit:

when the unit is not used and is not a conflict, checker reports an orphaning for the unit.
```

## s056  (spec-a-heading-ends-with-its-id)

Claim (the unit's name, as a sentence): **a heading ends with its id**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because a [trailer](#term-trailer) changes the anchor the page renders, so a pointer to the unit's id leads nowhere on the page. A [misanchoring](#term-misanchoring) is its finding.

Formula:
```alloy
all u: Unit | (some t: Trailer | t->u in Follow.rel) implies u in Misanchoring
```

What the formula says, exactly:
```text
For every unit:

when a trailer follows the unit, checker reports a misanchoring for the unit.
```

## s057  (spec-a-document-holds-an-index)

Claim (the unit's name, as a sentence): **a document holds an index**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because a [document](#term-document) with units and no [index](#term-index) has no generated list to check, and a [misindexing](#term-misindexing) is its finding.

Formula:
```alloy
all d: Document | ((some u: Unit | d->u in Hold.units) and (no i: Index | d->i in Hold.indexes)) implies d in Misindexing
```

What the formula says, exactly:
```text
For every document:

when the document holds a unit and holds no index, checker reports a misindexing for the document.
```

## s058  (spec-an-index-matches-its-document)

Claim (the unit's name, as a sentence): **an index matches its document**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because an index that does not [match](#term-match) its document lists units or statements that are no longer there.

Formula:
```alloy
all d: Document | (some i: Index | d->i in Hold.indexes and i->d not in Match.rel) implies d in Misindexing
```

What the formula says, exactly:
```text
For every document:

when the document holds an index that does not match the document, checker reports a misindexing for the document.
```

## s059  (spec-a-site-is-held-by-a-source)

Claim (the unit's name, as a sentence): **a site is held by a source**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because a [site](#term-site) that no [source](#term-source) [holds](#term-hold) was renamed or removed, and a [mislocation](#term-mislocation) is its finding.

Formula:
```alloy
all c: Claim | (some s: Site | c->s in Name.site and (no r: Source | r->s in Hold.symbols)) implies c in Mislocation
```

What the formula says, exactly:
```text
For every claim:

when the claim names a site that no source holds, checker reports a mislocation for the claim.
```

## s060  (spec-a-document-is-context-for-the-documents-that-extend-it-and-for-theirs)

Claim (the unit's name, as a sentence): **a document is context for the documents that extend it and for theirs**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because a document that extends another takes in what that one takes in, and the author does not list it again.

Formula:
```alloy
all d: Document, e: Document, g: Document | (d->e in Extend.rel implies d->e in Context.rel) and ((d->e in Extend.rel and e->g in Context.rel) implies d->g in Context.rel)
```

What the formula says, exactly:
```text
For every document_1 and every document_2 and every document_3:

all of these hold:
- when document_1 extends document_2, document_2 is context for document_1
- when document_1 extends document_2 and document_3 is context for document_2, document_3 is context for document_1
```

## s061  (spec-a-fenced-block-with-a-language-belongs-to-the-unit-whose-own-text-holds-it)

Claim (the unit's name, as a sentence): **a fenced block with a language belongs to the unit whose own text holds it**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because the logic of a unit is what its own text holds. The statement of the unit says that logic and no other.

Formula:
```alloy
all f: Fence, u: Unit | (f in Languaged and f->u in Within.rel) implies u->f in Blocks.rel
```

What the formula says, exactly:
```text
For every fence_1 and every unit:

when all of these hold:
- fence_1 is a fence that names a language
- fence_1 lies in the own text of the unit

then checker reads fence_1 as a block of the unit.
```

## s062  (spec-a-fence-with-no-language-is-prose)

Claim (the unit's name, as a sentence): **a fence with no language is prose**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because a fence with no language shows text, and no backend can check it.

Formula:
```alloy
all f: Fence | f not in Languaged implies (no u: Unit | u->f in Blocks.rel)
```

What the formula says, exactly:
```text
For every fence_1:

when fence_1 is a fence that names no language, checker reads fence_1 as a block of no unit.
```

## s063  (spec-a-block-whose-second-word-is-vocabulary-has-the-role-of-vocabulary)

Claim (the unit's name, as a sentence): **a block whose second word is vocabulary has the role of vocabulary**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because the author states what a block is for in the second word, and the checker reads no other sign.

Formula:
```alloy
all f: Fence | f in VocabularyWord implies f in VocabularyBlock
```

What the formula says, exactly:
```text
For every fence:

when the second word of the fence is vocabulary, the fence has the role of vocabulary.
```

## s064  (spec-a-block-whose-second-word-is-bounds-has-the-role-of-bounds)

Claim (the unit's name, as a sentence): **a block whose second word is bounds has the role of bounds**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because the second word is the one sign of the role.

Formula:
```alloy
all f: Fence | f in BoundsWord implies f in BoundsBlock
```

What the formula says, exactly:
```text
For every fence:

when the second word of the fence is bounds, the fence has the role of bounds.
```

## s065  (spec-a-block-whose-second-word-is-scenario-has-the-role-of-scenario)

Claim (the unit's name, as a sentence): **a block whose second word is scenario has the role of scenario**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because the second word is the one sign of the role.

Formula:
```alloy
all f: Fence | f in ScenarioWord implies f in ScenarioBlock
```

What the formula says, exactly:
```text
For every fence:

when the second word of the fence is scenario, the fence has the role of scenario.
```

## s066  (spec-a-block-with-no-role-word-is-the-formula-of-its-unit)

Claim (the unit's name, as a sentence): **a block with no role word is the formula of its unit**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because most blocks are the formula of the unit, and the author need not write a word for the common case.

Formula:
```alloy
all f: Fence | f in NoSecondWord implies f in UnitBlock
```

What the formula says, exactly:
```text
For every fence:

when the fence has no second word that names a role, the fence has the role of the formula of its unit.
```

## s067  (spec-a-nested-units-block-is-its-own)

Claim (the unit's name, as a sentence): **a nested units block is its own**

Refines: "the check can be taken at its word" → "a canon cannot go out of date unnoticed"

Rationale: This follows because a unit nested in another says its own logic. The unit above does not say it.

Formula:
```alloy
all f: Fence, u: Unit | f->u in Within.rel implies (no v: Unit | v->u in Sit.rel and v->f in Blocks.rel)
```

What the formula says, exactly:
```text
For every fence and every unit_1:

when the fence lies in the own text of unit_1, checker reads the fence as a block of no unit that sits in unit_1.
```

## s068  (spec-a-tested-claim-is-not-untested)

Claim (the unit's name, as a sentence): **a tested claim is not untested**

Refines: "the check can be taken at its word" → "a finding is never false"

Rationale: This follows because an [untesting](#term-untesting) says that no test checks a claim, and for a [tested](#term-tested) claim that is false.

Formula:
```alloy
all c: Claim | tested[c] implies c not in Untesting
```

What the formula says, exactly:
```text
For every claim:

when the claim is tested, checker reports no untesting for the claim.
```

## s069  (spec-a-claim-a-declared-test-checks-is-not-untested)

Claim (the unit's name, as a sentence): **a claim a declared test checks is not untested**

Refines: "the check can be taken at its word" → "a finding is never false" → "a tested claim is not untested"

Rationale: This follows because a test that the project [declares](#term-declare) checks the units its tags name.

Formula:
```alloy
all c: Claim | (some t: Test | t in Declared and checks[t, c]) implies c not in Untesting
```

What the formula says, exactly:
```text
For every claim:

when a test that project declares checks the claim, checker reports no untesting for the claim.
```

## s070  (spec-a-claim-an-undeclared-test-checks-is-not-untested)

Claim (the unit's name, as a sentence): **a claim an undeclared test checks is not untested**

Refines: "the check can be taken at its word" → "a finding is never false" → "a tested claim is not untested"

Rationale: This follows because a test checks the units its tags name, in whatever file of the sources it sits. That file can be a suite the project does not declare. It can also be a module that builds tests from a table of cases, which a suite then runs. The tags of such a test are as true as the tags of a test in a declared suite.

Formula:
```alloy
all c: Claim | (some t: Test | t not in Declared and checks[t, c]) implies c not in Untesting
```

What the formula says, exactly:
```text
For every claim:

when a test that project does not declare checks the claim, checker reports no untesting for the claim.
```

## s071  (spec-a-spec-whose-bug-a-test-checks-is-not-untested)

Claim (the unit's name, as a sentence): **a spec whose bug a test checks is not untested**

Refines: "the check can be taken at its word" → "a finding is never false" → "a tested claim is not untested"

Rationale: This follows because a test of a [bug](#term-bug) asserts what the spec the bug sits in claims.

Formula:
```alloy
all s: Spec | (some t: Test, b: Bug | checks[t, b] and b->s in Sit.rel) implies s not in Untesting
```

What the formula says, exactly:
```text
For every spec:

when a test checks a bug that sits in the spec, checker reports no untesting for the spec.
```
