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

## s149  (canon-plugin-alloy · spec-the-first-searches-leave-no-unit-out)

Formula:

```alloy
all s: Search | s in First implies s not in Trial
```

Current words:

```text
For every search:

when the search is asked before any scenario is known to be impossible, the search leaves no unit out.
```

## s119  (canon-plugin-alloy · spec-a-generated-statement-that-its-formula-would-say-again-is-current)

Formula:

```alloy
all u: Unit | (u in Generated and u not in Differs and u not in Unsayable) implies u in Current
```

Current words:

```text
For every unit:

when all of these hold:
- the statement of the unit sits between the markers of a generated region
- the statement of the unit does not differ from what its formula says
- the formula of the unit can be said in words

then the statement of the unit is current.
```

## s167  (canon-plugin-alloy · spec-a-formula-that-is-lone-on-a-signature-is-reported)

Formula:

```alloy
all u: Unit, w: Signature | (u in Logical and u not in Term and loneOn[u, w]) implies u->w in Expose.rel
```

Current words:

```text
For every unit and every signature:

when all of these hold:
- the unit holds a formula
- the unit is not a term
- the formula of the unit is lone on the signature

then checker reports the formula of the unit as lone on the signature.
```

## s223  (naturalloy · scenario-4-term-series)

Formula:

```alloy
some f: Series | f in PairInList and f in NotClause
```

Current words:

```text
It must be possible that:

There is a list such that the list has a clause about a pair of variables and has an item that is more than one clause.
```

## s148  (canon-plugin-alloy · spec-a-formula-with-no-keyword-is-a-claim-to-hold)

Formula:

```alloy
all u: Unit | u in BareFormula implies u in Held
```

Current words:

```text
For every unit:

when the unit holds a formula with no keyword, the analyzer is asked to hold the formula of the unit.
```

## s028  (canon · spec-a-bug-cites-only-specs)

Formula:

```alloy
all b: Bug | (some u: Unit | cites[b, u] and u not in Spec) implies b in Misnesting
```

Current words:

```text
For every bug:

when the bug cites a unit that is not a spec, checker reports a misnesting for the bug.
```

## s163  (canon-plugin-alloy · spec-a-reported-scenario-or-contradiction-fails-logic)

Formula:

```alloy
all r: Run, c: LogicCommand | (r->c in Ask.rel and ((some x: Scenario | x in Raised) or (some u: Unit | u in Contradicting))) implies r not in Exits0
```

Current words:

```text
For every run and every logic command:

when all of these hold:
- the run asks for the logic command
- at least one of these holds:
  - there is a scenario such that checker reports that the scenario cannot happen
  - there is a unit_1 such that unit_1 is held with units that cannot all hold

then the run does not exit with code 0.
```

## s152  (canon-plugin-alloy · spec-a-trial-is-made-for-each-held-unit-of-a-scenario-that-cannot-happen)

Formula:

```alloy
all c: Scenario, u: Unit | (c in Impossible and u in Held and (no v: Unit | c->v in Probe.rel)) implies (some s: Search | s in Trial and s->c in Pose.scenario and s->u in Leave.rel)
```

Current words:

```text
For every scenario_1 and every unit_1:

when all of these hold:
- scenario_1 is a scenario that cannot happen while every held unit holds
- the analyzer is asked to hold the formula of unit_1
- there is no unit_2 such that the author asks about leaving out unit_2 for scenario_1

then a search that leaves one unit out and leaves out unit_1 requires scenario_1 to happen.
```

## s212  (naturalloy · spec-a-rule-with-a-list-for-a-side-puts-its-then-on-a-line-of-its-own)

Formula:

```alloy
all f: Series | (f in Rule and f not in OneLineRule) implies f in ThenOwnLine
```

Current words:

```text
For every list:

when the list is a rule with a first side and a second and is not a rule whose two sides are each one clause, verbalizer says the list with "then" at the start of the second side, on a line of its own.
```

## s207  (naturalloy · spec-an-item-that-is-more-than-a-clause-makes-the-list-bullets)

Formula:

```alloy
all f: Series | f in NotClause implies f in AsBullets
```

Current words:

```text
For every list:

when the list has an item that is more than one clause, verbalizer says the list as bullets.
```

## s227  (canon-plugin-alloy-fixtures-lifetimes · spec-dispose-runs-once)

Formula:

```alloy
(always no c: Cleanup, o: Owner | runByCall[c, o])
and
(always no o: Owner | throwByCall[o])
```

Current words:

```text
All of these hold:
- now and at every later moment, there is no combination of cleanup_1 and owner_1 such that code disposes owner_1 after pulse disposed it, and that call runs cleanup_1, a cleanup that code has registered on owner_1 and that has not run
- now and at every later moment, there is no owner_2 such that code disposes owner_2 after pulse disposed it, and that call throws
```

## s190  (naturalloy · spec-a-definition-by-cases-is-said-as-it-stands-when-a-run-of-and-would-read-two-ways)

Formula:

```alloy
all f: Definition | f in AmbiguousAnd implies f in AsItStands
```

Current words:

```text
For every definition_1:

when definition_1 is a definition with a run of and beside another alternative of its kind, verbalizer says definition_1 as a list of the alternatives as they stand.
```

## s156  (canon-plugin-alloy · spec-the-report-of-a-scenario-names-each-unit-whose-removal-lets-it-happen)

Formula:

```alloy
all c: Scenario, u: Unit | (c in Raised and u->c in Frees.rel) implies c->u in Blame.rel
```

Current words:

```text
For every scenario and every unit:

when all of these hold:
- checker reports that the scenario cannot happen
- leaving out the unit lets the scenario happen

then checker names the unit in its report of the scenario.
```

## s216  (naturalloy · scenario-4-term-quantifier)

Formula:

```alloy
some f: Quantifier | f in VariableWithCondition and f in NothingToAttach
```

Current words:

```text
It must be possible that:

There is a quantifier_1 such that all of these hold:
- quantifier_1 is a quantifier whose variable has a further condition
- quantifier_1 is a quantifier with no fact for its variable beside another thing
```

## s139  (canon-plugin-alloy · spec-a-declared-word-that-no-claim-uses-is-unused)

Formula:

```alloy
all w: Word | ((some u: Unit | u->w in Introduce.rel) and (no u: Unit | u->w in Rely.rel)) implies w in Unused
```

Current words:

```text
For every word_1:

when all of these hold:
- a unit declares word_1
- there is no unit_1 such that a claim, a definition or a fact of unit_1 uses word_1

then word_1 is a word that no claim, definition or fact uses.
```

## s106  (canon · spec-a-frontmatter-changes-nothing-but-the-plugins-of-its-document)

Formula:

```alloy
all d, e: Document | d->e in Bare.rel implies ((all u: Unit | (e->u in Hold.units implies d->u in Hold.units) and (d->u in Hold.units implies e->u in Hold.units)) and (e in Finding implies d in Finding) and (d in Finding implies e in Finding))
```

Current words:

```text
For every document_1 and every document_2:

when document_1 is document_2 without its frontmatter,

then all of these hold:
- for every unit:

  all of these hold:
  - when document_2 holds the unit, document_1 holds the unit
  - when document_1 holds the unit, document_2 holds the unit
- when checker reports a finding for document_2, checker reports a finding for document_1
- when checker reports a finding for document_1, checker reports a finding for document_2
```

## s198  (naturalloy · spec-a-quantifier-with-a-time-phrase-in-one-of-several-conditions-is-said-in-full)

Formula:

```alloy
all f: Quantifier | f in TimedCondition implies f in InFull
```

Current words:

```text
For every quantifier_1:

when the following holds:

quantifier_1 is a quantifier with several conditions, one of which begins with a time phrase

then verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s097  (canon · spec-an-unknown-command-fails-the-run)

Formula:

```alloy
all r: Run, c: Command | (r->c in Ask.rel and not available[c]) implies (c in Unknown and r in Exits2)
```

Current words:

```text
For every run and every command_1:

when the run asks for command_1 and command_1 is not available, checker reports command_1 as an unknown command and the run exits with code 2.
```

## s108  (canon · spec-a-frontmatter-changes-no-finding)

Formula:

```alloy
all d, e: Document | d->e in Bare.rel implies ((e in Finding implies d in Finding) and (d in Finding implies e in Finding))
```

Current words:

```text
For every document_1 and every document_2:

when document_1 is document_2 without its frontmatter,

then all of these hold:
- when checker reports a finding for document_2, checker reports a finding for document_1
- when checker reports a finding for document_1, checker reports a finding for document_2
```

## s155  (canon-plugin-alloy · spec-a-scenario-that-can-happen-is-not-reported)

Formula:

```alloy
all c: Scenario | c in Possible implies c not in Raised
```

Current words:

```text
For every scenario_1:

when scenario_1 is a scenario that can happen while every held unit holds, checker does not report that scenario_1 cannot happen.
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
