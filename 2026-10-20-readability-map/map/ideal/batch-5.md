## s146  (canon-plugin-alloy · spec-a-word-declared-in-an-extended-document-is-declared)

Formula:

```alloy
all d: Document, e: Document, u: Unit, v: Unit, w: Word | (d->e in Context.rel and d->u in Hold.units and u->w in Voice.rel and e->v in Hold.units and v->w in Introduce.rel) implies w not in Undeclared
```

Current words:

```text
For every document_1 and every document_2 and every unit_1 and every unit_2 and every word_1:

when all of these hold:
- document_2 is context for document_1
- document_1 holds unit_1
- a reading in unit_1 says word_1
- document_2 holds unit_2
- unit_2 declares word_1

then word_1 is not a word that a reading says and nothing declares.
```

## s182  (naturalloy · term-by-kind)

Formula:

```alloy
pred byKind[d: Definition] { d not in NoKindFirst and d not in AmbiguousAnd and d not in NotAboutSubject }
```

Current words:

```text
For every definition_1:

definition_1 can be said kind by kind exactly when all of these hold:
- definition_1 is not a definition with an alternative that does not begin with its kind
- definition_1 is not a definition with a run of and beside another alternative of its kind
- definition_1 is not a definition with an alternative that says something about another unit
```

## s205  (naturalloy · spec-a-list-with-a-time-phrase-before-its-last-clause-is-bullets)

Formula:

```alloy
all f: Series | f in TimeBeforeLast implies f in AsBullets
```

Current words:

```text
For every list:

when the list has a clause before its last that begins with a time phrase, verbalizer says the list as bullets.
```

## s138  (canon-plugin-alloy · spec-a-reading-apart-from-the-declaration-it-says-is-apart)

Formula:

```alloy
all u: Unit, w: Word | (u->w in Voice.rel and (some v: Unit | v->w in Introduce.rel) and u->w not in Introduce.rel) implies w in Apart
```

Current words:

```text
For every unit_1 and every word_1:

when all of these hold:
- a reading in unit_1 says word_1
- a unit declares word_1
- unit_1 does not declare word_1

then word_1 is a word whose reading is in another unit than its declaration.
```

## s005  (canon · term-unguarded)

Formula:

```alloy
pred unguarded[c: Claim] { not refined[c] and not tested[c] }
```

Current words:

```text
For every claim:

the claim is unguarded exactly when the claim is not refined and is not tested.
```

## s208  (naturalloy · spec-an-and-inside-an-or-is-kept-apart)

Formula:

```alloy
all f: Series | f in AndInOr implies f in KeepsAndApart
```

Current words:

```text
For every list_1:

when list_1 is a list of alternatives where one alternative holds an and, verbalizer says list_1 as bullets that cannot be read two ways.
```

## s033  (canon · spec-a-hidden-bug-is-reported)

Formula:

```alloy
all b: Bug | hidden[b] implies b in Finding
```

Current words:

```text
For every bug:

when the bug is hidden, checker reports a finding for the bug.
```

## s217  (naturalloy · scenario-1-term-definition-passage)

Formula:

```alloy
some f: Definition | f in SameKindTwice and f in AmbiguousAnd
```

Current words:

```text
It must be possible that:

There is a definition_1 such that all of these hold:
- definition_1 is a definition with two alternatives for one kind
- definition_1 is a definition with a run of and beside another alternative of its kind
```

## s168  (canon-plugin-alloy · spec-a-formula-is-reported-only-when-no-other-formula-can-contradict-it)

Formula:

```alloy
all u: Unit, w: Word | u->w in Expose.rel implies u in Unchallenged
```

Current words:

```text
For every unit and every word:

when checker reports the formula of the unit as lone on the word, no other formula can contradict the formula of the unit.
```

## s188  (naturalloy · spec-a-definition-with-one-kind-is-one-sentence)

Formula:

```alloy
all f: Definition | (f in OneKind and byKind[f]) implies f in OneSentenceKind
```

Current words:

```text
For every definition_1:

when definition_1 is a definition whose alternatives are of one kind and can be said kind by kind, verbalizer says definition_1 as one sentence.
```

## s009  (canon · term-tested)

Formula:

```alloy
pred tested[u: Unit] {
  (some t: Test | checks[t, u])
  or (u in Spec and (some t: Test, b: Bug | checks[t, b] and b->u in Sit.rel))
}
```

Current words:

```text
For every unit:

the unit is tested exactly when at least one of these holds:
- a test checks the unit
- the unit is a spec and a test checks a bug that sits in the unit
```

## s018  (canon · spec-an-unfounded-unit-is-freelancing)

Formula:

```alloy
all u: Unit | unfounded[u] implies u in Freelancing
```

Current words:

```text
For every unit:

when the unit is unfounded, checker reports a freelancing for the unit.
```

## s016  (canon · term-availability)

Formula:

```alloy
pred available[c: Command] {
  c in Core
  or (some p: Installed, d: Document | applies[p, d] and p->c in Add.rel)
}
```

Current words:

```text
For every command_1:

command_1 is available exactly when at least one of these holds:
- command_1 is a command that the checker has of its own
- there are installed_plugin_1 and document_1 such that installed_plugin_1 applies to document_1 and adds command_1
```

## s127  (canon-plugin-alloy · spec-generate-writes-the-statement-of-a-stale-unit-again)

Formula:

```alloy
all u: Unit | u in Stale implies u in Rewritten
```

Current words:

```text
For every unit:

when the statement of the unit is stale, checker writes the statement of the unit when it generates.
```

## s172  (canon-plugin-alloy · spec-a-signature-that-an-extended-document-names-keeps-a-formula-from-being-reported)

Formula:

```alloy
all d: Document, e: Document, u: Unit, v: Unit, w: Word | (d->e in Context.rel and d->u in Hold.units and e->v in Hold.units and v->w in Utter.rel) implies u->w not in Expose.rel
```

Current words:

```text
For every document_1 and every document_2 and every unit_1 and every unit_2 and every word:

when all of these hold:
- document_2 is context for document_1
- document_1 holds unit_1
- document_2 holds unit_2
- a block of unit_2 names the word outside its declaration

then checker does not report the formula of unit_1 as lone on the word.
```

## s203  (naturalloy · spec-a-list-with-a-comma-in-an-item-and-more-than-two-clauses-is-bullets)

Formula:

```alloy
all f: Series | (f in CommaItem and f in MoreThanTwo) implies f in AsBullets
```

Current words:

```text
For every list:

when all of these hold:
- the list has an item that holds a comma
- the list has more than two clauses

then verbalizer says the list as bullets.
```

## s157  (canon-plugin-alloy · spec-the-report-of-a-scenario-names-no-other-unit)

Formula:

```alloy
all c: Scenario, u: Unit | c->u in Blame.rel implies u->c in Frees.rel
```

Current words:

```text
For every scenario and every unit:

when checker names the unit in its report of the scenario, leaving out the unit lets the scenario happen.
```

## s045  (canon · spec-a-plain-test-does-not-check-a-bug)

Formula:

```alloy
all t: PlainTest | (some b: Bug | checks[t, b]) implies t in Unpinning
```

Current words:

```text
For every plain test:

when the plain test checks a bug, checker reports an unpinning for the plain test.
```

## s025  (canon · spec-a-fact-cites-nothing)

Formula:

```alloy
all f: Fact | (some u: Unit | cites[f, u]) implies f in Misnesting
```

Current words:

```text
For every fact:

when the fact cites a unit, checker reports a misnesting for the fact.
```

## s042  (canon · spec-a-conflict-names-two-units)

Formula:

```alloy
all c: Conflict | not paired[c] implies c in Unpairing
```

Current words:

```text
For every conflict:

when the conflict is not paired, checker reports an unpairing for the conflict.
```

## s177  (canon-plugin-alloy · scenario-1-axiom-a-statement-says-what-its-logic-says)

Formula:

```alloy
some u: Unit, d: Document | d in Worded and d->u in Hold.units and u in Logical and u in Current and u not in Reported
```

Current words:

```text
It must be possible that:

There are unit_1 and document_1 such that all of these hold:
- document_1 keeps readings
- document_1 holds unit_1
- unit_1 holds a formula
- the statement of unit_1 is current
- checker does not report the statement of unit_1
```

## s057  (canon · spec-a-document-holds-an-index)

Formula:

```alloy
all d: Document | ((some u: Unit | d->u in Hold.units) and (no i: Index | d->i in Hold.indexes)) implies d in Misindexing
```

Current words:

```text
For every document:

when the document holds a unit and holds no index, checker reports a misindexing for the document.
```

## s220  (naturalloy · scenario-1-term-series)

Formula:

```alloy
some f: Series | f in Few and f in CommaItem and f in MoreThanTwo
```

Current words:

```text
It must be possible that:

There is a list such that all of these hold:
- the list has three clauses or fewer
- the list has an item that holds a comma
- the list has more than two clauses
```

## s004  (canon · term-refined)

Formula:

```alloy
pred refined[c: Claim] { (some s: Spec | s->c in Sit.rel) or (some e: Exception | e->c in Sit.rel) }
```

Current words:

```text
For every claim:

the claim is refined exactly when a spec sits in the claim or an exception sits in the claim.
```

## s012  (canon · term-misleading)

Formula:

```alloy
pred misleading[t: Test] {
  (t in ExpectedFailure and (no b: Bug | checks[t, b]) and (no e: Exception | checks[t, e]))
  or (t in PlainTest and (some b: Bug | checks[t, b]))
}
```

Current words:

```text
For every test_1:

test_1 is misleading exactly when test_1 is one of these:
- an expected failure that checks no bug and checks no exception
- a plain test that checks a bug
```

## s022  (canon · spec-a-bug-cites-a-spec)

Formula:

```alloy
all b: Bug | (no s: Spec | cites[b, s]) implies b in Freelancing
```

Current words:

```text
For every bug:

when the bug cites no spec, checker reports a freelancing for the bug.
```

## s122  (canon-plugin-alloy · spec-a-formula-with-a-word-that-has-no-reading-is-unsayable)

Formula:

```alloy
all u: Unit | u in Wordless implies u in Unsayable
```

Current words:

```text
For every unit:

when the formula of the unit names a word that has no reading, the formula of the unit cannot be said in words.
```

## s144  (canon-plugin-alloy · spec-check-reports-a-word-that-is-not-in-order)

Formula:

```alloy
all w: Word | (w in Undeclared or w in Misplaced or w in Apart or w in Unused) implies w in Flagged
```

Current words:

```text
For every word_1:

when at least one of these holds:
- word_1 is a word that a reading says and nothing declares
- word_1 is a word declared in a unit that is not a term
- word_1 is a word whose reading is in another unit than its declaration
- word_1 is a word that no claim, definition or fact uses

then checker reports the word word_1.
```

## s013  (canon · term-list)

Formula:

```alloy
pred lists[f: Frontmatter, p: Plugin] { some e: Entry | f->e in Item.rel and e->p in Spell.rel }
```

Current words:

```text
For every frontmatter and every plugin:

the frontmatter lists the plugin exactly when the frontmatter holds an entry that spells the plugin.
```

## s037  (canon · spec-a-bug-is-tested)

Formula:

```alloy
all b: Bug | (some Runner and not tested[b]) implies b in Untesting
```

Current words:

```text
For every bug:

when project has a runner and the bug is not tested, checker reports an untesting for the bug.
```

## s055  (canon · spec-a-unit-is-used)

Formula:

```alloy
all u: Unit | (not used[u] and u not in Conflict) implies u in Orphaning
```

Current words:

```text
For every unit:

when the unit is not used and is not a conflict, checker reports an orphaning for the unit.
```

## s143  (canon-plugin-alloy · spec-check-reports-nothing-about-a-word-that-is-in-order)

Formula:

```alloy
all w: Word | (w not in Undeclared and w not in Misplaced and w not in Apart and w not in Unused) implies w not in Flagged
```

Current words:

```text
For every word_1:

when all of these hold:
- word_1 is not a word that a reading says and nothing declares
- word_1 is not a word declared in a unit that is not a term
- word_1 is not a word whose reading is in another unit than its declaration
- word_1 is not a word that no claim, definition or fact uses

then checker does not report the word word_1.
```

## s201  (naturalloy · spec-a-longer-list-or-a-list-with-a-comma-is-bullets)

Formula:

```alloy
all f: Series | (f in Items and not sentenceable[f]) implies f in AsBullets
```

Current words:

```text
For every list:

when the list is a run of clauses joined by and or by or and cannot be put in a sentence, verbalizer says the list as bullets.
```

## s206  (naturalloy · spec-a-list-with-a-relative-clause-before-its-last-clause-is-bullets)

Formula:

```alloy
all f: Series | f in RelativeBeforeLast implies f in AsBullets
```

Current words:

```text
For every list:

when the list has a clause before its last with a relative clause in it, verbalizer says the list as bullets.
```

## s032  (canon · axiom-a-known-defect-stays-in-sight)

Formula:

```alloy
(all b: Bug | hidden[b] implies b in Finding)
and (all c: Conflict | hidden[c] implies c in Finding)
and (all t: Test | misleading[t] implies t in Finding)
```

Current words:

```text
All of these hold:
- for every bug:

  when the bug is hidden, checker reports a finding for the bug
- for every conflict:

  when the conflict is hidden, checker reports a finding for the conflict
- for every test:

  when the test is misleading, checker reports a finding for the test.
```

## s159  (canon-plugin-alloy · spec-the-report-of-a-contradiction-names-all-the-units-of-the-group)

Formula:

```alloy
all u: Unit, v: Unit | (u in Contradicting and u->v in Together.rel) implies v in Named
```

Current words:

```text
For every unit_1 and every unit_2:

when all of these hold:
- unit_1 is held with units that cannot all hold
- the analyzer is asked about unit_1 together with unit_2

then checker names unit_2 in its report of a contradiction.
```

## s058  (canon · spec-an-index-matches-its-document)

Formula:

```alloy
all d: Document | (some i: Index | d->i in Hold.indexes and i->d not in Match.rel) implies d in Misindexing
```

Current words:

```text
For every document:

when the document holds an index that does not match the document, checker reports a misindexing for the document.
```

## s056  (canon · spec-a-heading-ends-with-its-id)

Formula:

```alloy
all u: Unit | (some t: Trailer | t->u in Follow.rel) implies u in Misanchoring
```

Current words:

```text
For every unit:

when a trailer follows the unit, checker reports a misanchoring for the unit.
```
