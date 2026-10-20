## s222  (naturalloy · scenario-3-term-series)

Formula:

```alloy
some f: Series | f in SharedSubject and f in Many
```

Current words:

```text
It must be possible that:

There is a list such that all of these hold:
- the list has clauses that begin with the same subject
- the list has more than three clauses
```

## s210  (naturalloy · spec-a-rule-drops-its-then-before-anything-else)

Formula:

```alloy
all f: Series | (f in OneLineRule and f not in TimeFirst and f not in TimeSecond) implies f in DropsThen
```

Current words:

```text
For every list:

when all of these hold:
- the list is a rule whose two sides are each one clause
- the list is not a rule whose first side begins with a time phrase
- the list is not a rule whose second side begins with a time phrase

then verbalizer says the list without "then".
```

## s124  (canon-plugin-alloy · spec-the-report-of-an-unsayable-formula-says-why)

Formula:

```alloy
all u: Unit | u in Unsayable implies u in Explained
```

Current words:

```text
For every unit:

when the formula of the unit cannot be said in words, checker says why the formula of the unit cannot be said.
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

## s230  (canon-plugin-alloy-fixtures-lifetimes · spec-an-owner-disposes-its-sub-owners-before-its-own-cleanups)

Formula:

```alloy
(always all o, k: Owner, c: Cleanup |
  (dispose[o] and k.parent = o and k not in Disposed and c in Registered - Ran and c.on = o)
  implies ((not runNow[c]) until dispose[k]))
and
(always all o, j, k: Owner |
  (dispose[o] and j.parent = o and k.parent = o and j->k in Birth.order and j not in Disposed and k not in Disposed)
  implies ((not dispose[j]) until dispose[k]))
```

Current words:

```text
All of these hold:
- now and at every later moment, for every owner_1 and every owner_2 and every cleanup:

  when all of these hold:
  - pulse disposes owner_1
  - owner_1 is the parent of owner_2
  - pulse has not disposed owner_2
  - code has registered the cleanup
  - the cleanup has not run
  - the cleanup is on owner_1

  then all of these hold:
  - now or at a later moment, the following holds:

    pulse disposes owner_2
  - at every moment from now until the first such moment, not including it, the following holds:

    the cleanup does not run
- now and at every later moment, for every owner_3 and every owner_4 and every owner_5:

  when all of these hold:
  - pulse disposes owner_3
  - owner_3 is the parent of owner_4
  - owner_3 is the parent of owner_5
  - owner_4 was created before owner_5
  - pulse has not disposed owner_4
  - pulse has not disposed owner_5

  then all of these hold:
  - now or at a later moment, the following holds:

    pulse disposes owner_5
  - at every moment from now until the first such moment, not including it, the following holds:

    pulse does not dispose owner_4.
```

## s196  (naturalloy · spec-a-quantifier-with-nothing-to-attach-to-is-said-in-full)

Formula:

```alloy
all f: Quantifier | f in NothingToAttach implies f in InFull
```

Current words:

```text
For every quantifier_1:

when quantifier_1 is a quantifier with no fact for its variable beside another thing, verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s125  (canon-plugin-alloy · spec-a-fault-of-the-verbalizer-fails-the-run-and-is-not-explained-as-unsayable)

Formula:

```alloy
all r: Run, c: Command, u: Unit | (r->c in Ask.rel and (c in GenerateCommand or c in CheckCommand) and u in Faulted) implies (u not in Explained and r not in Exits0)
```

Current words:

```text
For every run and every command_1 and every unit:

when all of these hold:
- the run asks for command_1
- command_1 is the command `generate` or is the command `check`
- the verbalizer fails on the formula of the unit with a fault of its own

then checker does not say why the formula of the unit cannot be said and the run does not exit with code 0.
```

## s118  (canon-plugin-alloy · spec-a-generated-statement-that-differs-from-its-formula-is-stale)

Formula:

```alloy
all u: Unit | (u in Logical and u in Generated and u in Differs and u not in Unsayable) implies u in Stale
```

Current words:

```text
For every unit:

when all of these hold:
- the unit holds a formula
- the statement of the unit sits between the markers of a generated region
- the statement of the unit differs from what its formula says
- the formula of the unit can be said in words

then the statement of the unit is stale.
```

## s214  (naturalloy · scenario-2-term-quantifier)

Formula:

```alloy
some f: Quantifier | f in VariableSubject and f in VariableTwice
```

Current words:

```text
It must be possible that:

There is a quantifier_1 such that all of these hold:
- quantifier_1 is a quantifier whose variable is the subject of the sentence
- quantifier_1 is a quantifier whose reading says the variable twice
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

## s184  (naturalloy · spec-a-rule-of-two-clauses-is-said-on-one-line)

Formula:

```alloy
all f: Series | (f in OneLineRule and f not in TimeFirst) implies f in OneLine
```

Current words:

```text
For every list:

when all of these hold:
- the list is a rule whose two sides are each one clause
- the list is not a rule whose first side begins with a time phrase

then verbalizer says the list on one line, as "when" the first side, the second side.
```

## s191  (naturalloy · spec-a-definition-by-cases-is-said-as-it-stands-when-an-alternative-is-not-about-its-subject)

Formula:

```alloy
all f: Definition | f in NotAboutSubject implies f in AsItStands
```

Current words:

```text
For every definition_1:

when definition_1 is a definition with an alternative that says something about another unit, verbalizer says definition_1 as a list of the alternatives as they stand.
```

## s221  (naturalloy · scenario-2-term-series)

Formula:

```alloy
some f: Series | f in Few and f in TooLong
```

Current words:

```text
It must be possible that:

There is a list such that the list has three clauses or fewer and is longer than a line when it is put in a sentence.
```

## s145  (canon-plugin-alloy · spec-generate-writes-no-statement-for-a-unit-of-an-extended-document)

Formula:

```alloy
all d: Document, e: Document, u: Unit | (d in Checked and e not in Checked and d->e in Context.rel and e->u in Hold.units) implies u not in Rewritten
```

Current words:

```text
For every document_1 and every document_2 and every unit:

when all of these hold:
- the project lists document_1 among the documents it checks
- the project does not list document_2 among the documents it checks
- document_2 is context for document_1
- document_2 holds the unit

then checker does not write the statement of the unit when it generates.
```

## s179  (canon-plugin-alloy · scenario-1-axiom-the-claims-of-a-canon-never-contradict-each-other)

Formula:

```alloy
some c: Scenario, u: Unit | c in Impossible and c in Raised and u->c in Frees.rel and c->u in Blame.rel
```

Current words:

```text
It must be possible that:

There are scenario_1 and unit_1 such that all of these hold:
- scenario_1 is a scenario that cannot happen while every held unit holds
- checker reports that scenario_1 cannot happen
- leaving out unit_1 lets scenario_1 happen
- checker names unit_1 in its report of scenario_1
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

## s170  (canon-plugin-alloy · spec-a-signature-that-another-unit-names-keeps-a-formula-from-being-reported)

Formula:

```alloy
all u: Unit, v: Unit, w: Word | (v != u and v->w in Utter.rel) implies u->w not in Expose.rel
```

Current words:

```text
For every unit_1 and every unit_2 and every word:

when all of these hold:
- unit_2 and unit_1 are different
- a block of unit_2 names the word outside its declaration

then checker does not report the formula of unit_1 as lone on the word.
```

## s185  (naturalloy · spec-a-definition-by-cases-is-said-as-a-noun-phrase-for-each-kind)

Formula:

```alloy
all f: Definition | (f in GuardedByKind and byKind[f]) implies f in PhrasePerKind
```

Current words:

```text
For every definition_1:

when all of these hold:
- definition_1 is a definition whose alternatives each begin with the kind of the subject
- definition_1 can be said kind by kind

then verbalizer says definition_1 as a list with a noun phrase for each kind, such as "a spec that cites no axiom".
```

## s176  (canon-plugin-alloy · spec-a-lone-formula-fails-check)

Formula:

```alloy
all r: Run, c: CheckCommand, u: Unit, w: Word | (r->c in Ask.rel and u->w in Expose.rel) implies r not in Exits0
```

Current words:

```text
For every run and every check command and every unit and every word:

when the run asks for the check command and checker reports the formula of the unit as lone on the word, the run does not exit with code 0.
```

## s186  (naturalloy · spec-the-alternatives-of-one-kind-are-put-together-with-or)

Formula:

```alloy
all f: Definition | (f in SameKindTwice and byKind[f]) implies f in JoinedWithOr
```

Current words:

```text
For every definition_1:

when definition_1 is a definition with two alternatives for one kind and can be said kind by kind, verbalizer says definition_1 as one noun phrase for that kind, with the alternatives joined by or.
```

## s132  (canon-plugin-alloy · spec-check-does-not-report-a-current-statement)

Formula:

```alloy
all u: Unit | u in Current implies u not in Reported
```

Current words:

```text
For every unit:

when the statement of the unit is current, checker does not report the statement of the unit.
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

## s154  (canon-plugin-alloy · spec-a-scenario-that-cannot-happen-while-every-unit-holds-is-reported)

Formula:

```alloy
all c: Scenario | c in Impossible implies c in Raised
```

Current words:

```text
For every scenario_1:

when scenario_1 is a scenario that cannot happen while every held unit holds, checker reports that scenario_1 cannot happen.
```

## s232  (canon-plugin-alloy-fixtures-lifetimes · scenario-1-term-teardown-model)

Formula:

```alloy
some o, h: Owner, c: Failing | o.handler = h and eventually (dispose[o] and c.on = o and eventually (runNow[c] and eventually c.reached = h))
```

Current words:

```text
It must be possible that:

There are owner_1 and owner_2 and failing_cleanup_1 such that all of these hold:
- owner_2 is the nearest error handler or boundary above owner_1
- now or at a later moment, all of these hold:
  - pulse disposes owner_1
  - failing_cleanup_1 is on owner_1
  - now or at a later moment, all of these hold:
    - failing_cleanup_1 runs
    - now or at a later moment, the error of failing_cleanup_1 has reached owner_2
```

## s123  (canon-plugin-alloy · spec-a-unit-with-two-formulas-is-unsayable)

Formula:

```alloy
all u: Unit | u in Twofold implies u in Unsayable
```

Current words:

```text
For every unit:

when the unit holds more than one formula, the formula of the unit cannot be said in words.
```

## s202  (naturalloy · spec-a-list-of-more-than-three-clauses-is-bullets)

Formula:

```alloy
all f: Series | f in Many implies f in AsBullets
```

Current words:

```text
For every list:

when the list has more than three clauses, verbalizer says the list as bullets.
```

## s204  (naturalloy · spec-a-list-too-long-for-a-line-is-bullets)

Formula:

```alloy
all f: Series | f in TooLong implies f in AsBullets
```

Current words:

```text
For every list:

when the list is longer than a line when it is put in a sentence, verbalizer says the list as bullets.
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

## s130  (canon-plugin-alloy · spec-generate-leaves-an-unsayable-unit-as-it-is)

Formula:

```alloy
all u: Unit | u in Unsayable implies u not in Rewritten
```

Current words:

```text
For every unit:

when the formula of the unit cannot be said in words, checker does not write the statement of the unit when it generates.
```

## s181  (naturalloy · term-fit)

Formula:

```alloy
pred fits[f: Quantifier] { f not in VariableTwice and f not in NothingToAttach and f not in NoWithAnother and f not in ConditionAside and f not in TimedCondition }
```

Current words:

```text
For every quantifier_1:

quantifier_1 fits a noun phrase exactly when all of these hold:
- quantifier_1 is not a quantifier whose reading says the variable twice
- quantifier_1 is not a quantifier with no fact for its variable beside another thing
- quantifier_1 is not a quantifier that says no variable differs from another and holds a condition
- quantifier_1 is not a quantifier whose condition is not about its variable
- quantifier_1 is not a quantifier with several conditions, one of which begins with a time phrase
```

## s112  (canon · scenario-1-spec-a-document-is-context-for-the-documents-that-extend-it-and-for-theirs)

Formula:

```alloy
some d, e, g: Document | d != g and d->e in Extend.rel and e->g in Extend.rel and d->g in Context.rel
```

Current words:

```text
It must be possible that:

There are document_1 and document_2 and document_3 such that all of these hold:
- document_1 and document_3 are different
- document_1 extends document_2
- document_2 extends document_3
- document_3 is context for document_1
```

## s113  (canon · scenario-1-axiom-a-check-the-project-asked-for-is-never-dropped-silently)

Formula:

```alloy
some r: Run, p: Installed, d: Document, f: Listing | d->f in Head.rel and lists[f, p] and p->d in Over.rel and calls[r, p] and r->p in Return.code1 and r in Exits1
```

Current words:

```text
It must be possible that:

There are run_1 and installed_plugin_1 and document_1 and listing_frontmatter_1 such that all of these hold:
- document_1 starts with listing_frontmatter_1
- listing_frontmatter_1 lists installed_plugin_1
- checker runs installed_plugin_1 over document_1
- run_1 calls installed_plugin_1
- run_1 gets code 1 from installed_plugin_1
- run_1 exits with code 1
```

## s166  (canon-plugin-alloy · spec-a-formula-that-no-other-formula-can-contradict-is-reported)

Formula:

```alloy
all u: Unit | (u in Logical and u not in Term and u in Unchallenged) implies (some w: Signature | u->w in Expose.rel)
```

Current words:

```text
For every unit:

when all of these hold:
- the unit holds a formula
- the unit is not a term
- no other formula can contradict the formula of the unit

then checker reports the formula of the unit as lone on a signature.
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

## s128  (canon-plugin-alloy · spec-generate-leaves-a-current-statement-as-it-is)

Formula:

```alloy
all u: Unit | u in Current implies u not in Rewritten
```

Current words:

```text
For every unit:

when the statement of the unit is current, checker does not write the statement of the unit when it generates.
```

## s136  (canon-plugin-alloy · spec-a-word-that-a-reading-says-and-nothing-declares-is-undeclared)

Formula:

```alloy
all w: Word | ((some u: Unit | u->w in Voice.rel) and (no u: Unit | u->w in Introduce.rel)) implies w in Undeclared
```

Current words:

```text
For every word_1:

when all of these hold:
- there is a unit_1 such that a reading in unit_1 says word_1
- no unit declares word_1

then word_1 is a word that a reading says and nothing declares.
```

## s021  (canon · spec-an-exception-cites-a-fact)

Formula:

```alloy
all e: Exception | (no f: Fact | cites[e, f]) implies e in Freelancing
```

Current words:

```text
For every exception:

when the exception cites no fact, checker reports a freelancing for the exception.
```

## s036  (canon · spec-a-bug-names-an-open-issue)

Formula:

```alloy
all b: Bug | (some i: Issue | b->i in Name.issue and i in Closed) implies b in OutdatedTracking
```

Current words:

```text
For every bug:

when the bug names an issue that tracker has closed, checker reports an outdated tracking for the bug.
```

## s224  (naturalloy · scenario-5-term-series)

Formula:

```alloy
some f: Series | f in TimeSecond and f not in OneLineRule
```

Current words:

```text
It must be possible that:

There is a list such that all of these hold:
- the list is a rule whose second side begins with a time phrase
- the list is not a rule whose two sides are each one clause
```
