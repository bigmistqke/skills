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

## s171  (canon-plugin-alloy · spec-a-signature-that-a-scenario-names-keeps-a-formula-from-being-reported)

Formula:

```alloy
all u: Unit, v: Unit, w: Word | v->w in Picture.rel implies u->w not in Expose.rel
```

Current words:

```text
For every unit_1 and every unit_2 and every word:

when a scenario of unit_2 names the word, checker does not report the formula of unit_1 as lone on the word.
```

## s158  (canon-plugin-alloy · spec-units-that-cannot-all-hold-are-named)

Formula:

```alloy
all u: Unit | u in Contradicting implies u in Named
```

Current words:

```text
For every unit_1:

when unit_1 is held with units that cannot all hold, checker names unit_1 in its report of a contradiction.
```

## s165  (canon-plugin-alloy · axiom-a-formula-can-be-held-against-the-other-formulas)

Formula:

```alloy
(all u: Unit | (u in Logical and u not in Term and u in Unchallenged) implies (some w: Signature | u->w in Expose.rel)) and (all u: Unit, w: Word | u->w in Expose.rel implies u in Unchallenged)
```

Current words:

```text
All of these hold:
- for every unit:

  when all of these hold:
  - the unit holds a formula
  - the unit is not a term
  - no other formula can contradict the formula of the unit

  then checker reports the formula of the unit as lone on a signature
- for every unit and every word:

  when checker reports the formula of the unit as lone on the word, no other formula can contradict the formula of the unit.
```

## s195  (naturalloy · spec-a-quantifier-whose-variable-would-be-said-twice-is-said-in-full)

Formula:

```alloy
all f: Quantifier | f in VariableTwice implies f in InFull
```

Current words:

```text
For every quantifier_1:

when quantifier_1 is a quantifier whose reading says the variable twice, verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s120  (canon-plugin-alloy · spec-a-statement-that-a-person-wrote-is-handwritten)

Formula:

```alloy
all u: Unit | (u in Logical and u in Stated and u not in Generated and u not in Unsayable) implies u in Handwritten
```

Current words:

```text
For every unit:

when all of these hold:
- the unit holds a formula
- the unit has a statement
- the statement of the unit does not sit between the markers of a generated region
- the formula of the unit can be said in words

then the statement of the unit is handwritten.
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

## s088  (canon · spec-a-path-that-names-no-document-is-refused)

Formula:

```alloy
all f: Dangling | f in Refused
```

Current words:

```text
For every dangling frontmatter:

the dangling frontmatter is a frontmatter that the checker cannot read.
```

## s137  (canon-plugin-alloy · spec-a-word-declared-outside-a-term-is-misplaced)

Formula:

```alloy
all u: Unit, w: Word | (u->w in Introduce.rel and u not in Term) implies w in Misplaced
```

Current words:

```text
For every unit_1 and every word_1:

when unit_1 declares word_1 and is not a term, word_1 is a word declared in a unit that is not a term.
```

## s215  (naturalloy · scenario-3-term-quantifier)

Formula:

```alloy
some f: Quantifier | f in VariableOnce and f in ConditionAside
```

Current words:

```text
It must be possible that:

There is a quantifier_1 such that all of these hold:
- quantifier_1 is a quantifier whose variable the sentence says once
- quantifier_1 is a quantifier whose condition is not about its variable
```

## s194  (naturalloy · spec-what-else-is-true-of-the-variable-is-a-relative-clause)

Formula:

```alloy
all f: Quantifier | (f in VariableWithCondition and fits[f]) implies f in RelativeClause
```

Current words:

```text
For every quantifier_1:

when quantifier_1 is a quantifier whose variable has a further condition and fits a noun phrase, verbalizer says quantifier_1 with a relative clause, such as "a unit that is a spec".
```

## s218  (naturalloy · scenario-2-term-definition-passage)

Formula:

```alloy
some f: Definition | f in OneKind and f in NotAboutSubject
```

Current words:

```text
It must be possible that:

There is a definition_1 such that all of these hold:
- definition_1 is a definition whose alternatives are of one kind
- definition_1 is a definition with an alternative that says something about another unit
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

## s192  (naturalloy · spec-a-variable-said-once-takes-the-place-of-its-quantifier-as-a-noun-phrase)

Formula:

```alloy
all f: Quantifier | (f in VariableOnce and fits[f]) implies f in AsNounPhrase
```

Current words:

```text
For every quantifier_1:

when quantifier_1 is a quantifier whose variable the sentence says once and fits a noun phrase, verbalizer says quantifier_1 as a noun phrase in the place of the variable, such as "sits in no unit".
```

## s225  (naturalloy · scenario-6-term-series)

Formula:

```alloy
some f: Series | f in OneLineRule and f in TimeFirst
```

Current words:

```text
It must be possible that:

There is a list such that the list is a rule whose two sides are each one clause and is a rule whose first side begins with a time phrase.
```

## s169  (canon-plugin-alloy · spec-a-formula-is-reported-only-on-a-signature-it-is-lone-on)

Formula:

```alloy
all u: Unit, w: Word | u->w in Expose.rel implies (u in Logical and u not in Term and w in Signature and loneOn[u, w])
```

Current words:

```text
For every unit and every word:

when checker reports the formula of the unit as lone on the word,

then all of these hold:
- the unit holds a formula
- the unit is not a term
- the word is a signature
- the formula of the unit is lone on the word
```

## s229  (canon-plugin-alloy-fixtures-lifetimes · spec-a-disposed-owner-cannot-be-entered)

Formula:

```alloy
always all o: Owner | (enter[o] and o in Disposed) implies some Throwing'
```

Current words:

```text
Now and at every later moment, for every owner:

when a call enters the owner and pulse has disposed the owner, then right after, a call is throwing.
```

## s175  (canon-plugin-alloy · spec-a-document-that-keeps-no-readings-has-no-formula-reported-as-lone)

Formula:

```alloy
all d: Document, u: Unit, w: Word | (d not in Worded and d->u in Hold.units) implies u->w not in Expose.rel
```

Current words:

```text
For every document and every unit and every word:

when the document keeps no readings and holds the unit, checker does not report the formula of the unit as lone on the word.
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

## s031  (canon · spec-a-unit-does-not-depend-on-itself)

Formula:

```alloy
all u: Unit | circular[u] implies u in Cycle
```

Current words:

```text
For every unit:

when the unit is circular, checker reports a cycle for the unit.
```

## s069  (canon · spec-a-claim-a-declared-test-checks-is-not-untested)

Formula:

```alloy
all c: Claim | (some t: Test | t in Declared and checks[t, c]) implies c not in Untesting
```

Current words:

```text
For every claim:

when a test that project declares checks the claim, checker reports no untesting for the claim.
```

## s075  (canon · spec-a-document-gets-the-plugins-it-asks-for)

Formula:

```alloy
all p: Plugin, d: Document | (applies[p, d] implies p->d in Over.rel) and ((d not in Given and p->d in Over.rel) implies applies[p, d])
```

Current words:

```text
For every plugin and every document:

all of these hold:
- when the plugin applies to the document, checker runs the plugin over the document
- when the command line of a run does not name the document and checker runs the plugin over the document, the plugin applies to the document
```

## s059  (canon · spec-a-site-is-held-by-a-source)

Formula:

```alloy
all c: Claim | (some s: Site | c->s in Name.site and (no r: Source | r->s in Hold.symbols)) implies c in Mislocation
```

Current words:

```text
For every claim:

when the claim names a site that no source holds, checker reports a mislocation for the claim.
```

## s189  (naturalloy · spec-a-definition-by-cases-is-said-as-it-stands-when-an-alternative-does-not-begin-with-its-kind)

Formula:

```alloy
all f: Definition | f in NoKindFirst implies f in AsItStands
```

Current words:

```text
For every definition_1:

when definition_1 is a definition with an alternative that does not begin with its kind, verbalizer says definition_1 as a list of the alternatives as they stand.
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

## s090  (canon · spec-a-setting-outside-the-entry-document-is-refused)

Formula:

```alloy
all f: Stray | f in Refused
```

Current words:

```text
For every stray frontmatter:

the stray frontmatter is a frontmatter that the checker cannot read.
```

## s105  (canon · spec-a-run-with-no-finding-succeeds)

Formula:

```alloy
all r: Run | (no p: Plugin | r->p in Return.code1 or r->p in Return.code2) implies r in Exits0
```

Current words:

```text
For every run:

when there is no plugin such that the run gets code 1 from the plugin or gets code 2 from the plugin, the run exits with code 0.
```

## s003  (canon · term-circular)

Formula:

```alloy
pred circular[u: Unit] { some v: Unit | cites[u, v] and v->u in Depend.rel }
```

Current words:

```text
For every unit_1:

unit_1 is circular exactly when unit_1 cites a unit that depends on unit_1.
```

## s020  (canon · spec-an-exception-cites-a-spec)

Formula:

```alloy
all e: Exception | (no s: Spec | cites[e, s]) implies e in Freelancing
```

Current words:

```text
For every exception:

when the exception cites no spec, checker reports a freelancing for the exception.
```

## s072  (canon · spec-a-project-with-no-runner-reports-no-untesting)

Formula:

```alloy
all u: Unit | no Runner implies u not in Untesting
```

Current words:

```text
For every unit:

when project has no runner, checker reports no untesting for the unit.
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

## s010  (canon · term-paired)

Formula:

```alloy
pred paired[c: Conflict] { some a, b: Unit | a != b and c->a in Name.between and c->b in Name.between }
```

Current words:

```text
For every conflict:

the conflict is paired exactly when the conflict names a unit and names another unit.
```

## s052  (canon · spec-a-test-checks-only-leaves)

Formula:

```alloy
all t: Test | (some c: Claim | checks[t, c] and refined[c]) implies t in Overreach
```

Current words:

```text
For every test:

when the test checks a claim that is refined, checker reports an overreach for the test.
```

## s140  (canon-plugin-alloy · spec-a-word-declared-in-a-term-said-beside-it-and-used-is-not-reported)

Formula:

```alloy
all u: Term, w: Word | (u->w in Introduce.rel and u->w in Voice.rel and (some v: Unit | v->w in Rely.rel)) implies (w not in Undeclared and w not in Misplaced and w not in Apart and w not in Unused and w not in Flagged)
```

Current words:

```text
For every term_1 and every word_1:

when all of these hold:
- term_1 declares word_1
- a reading in term_1 says word_1
- there is a unit_1 such that a claim, a definition or a fact of unit_1 uses word_1

then all of these hold:
- word_1 is not a word that a reading says and nothing declares
- word_1 is not a word declared in a unit that is not a term
- word_1 is not a word whose reading is in another unit than its declaration
- word_1 is not a word that no claim, definition or fact uses
- checker does not report the word word_1
```

## s197  (naturalloy · spec-no-with-another-is-said-in-full)

Formula:

```alloy
all f: Quantifier | f in NoWithAnother implies f in InFull
```

Current words:

```text
For every quantifier_1:

when quantifier_1 is a quantifier that says no variable differs from another and holds a condition, verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s226  (canon-plugin-alloy-fixtures-lifetimes · spec-disposing-an-owner-runs-its-cleanups)

Formula:

```alloy
always all o: Owner, c: Cleanup |
  (dispose[o] and c in Registered and c.on = o and c not in Ran) implies eventually c in Ran
```

Current words:

```text
Now and at every later moment, for every owner and every cleanup:

when all of these hold:
- pulse disposes the owner
- code has registered the cleanup
- the cleanup is on the owner
- the cleanup has not run

then now or at a later moment, the cleanup has run.
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

## s213  (naturalloy · scenario-1-term-quantifier)

Formula:

```alloy
some f: Quantifier | f in VariableOnce and f in NoWithAnother
```

Current words:

```text
It must be possible that:

There is a quantifier_1 such that all of these hold:
- quantifier_1 is a quantifier whose variable the sentence says once
- quantifier_1 is a quantifier that says no variable differs from another and holds a condition
```

## s228  (canon-plugin-alloy-fixtures-lifetimes · spec-owner-cleanups-run-newest-first-and-in-isolation)

Formula:

```alloy
(always all o: Owner, c, d: Cleanup |
  (dispose[o] and c + d in Registered - Ran and c.on = o and d.on = o and c->d in Clock.older)
  implies ((not runNow[c]) until runNow[d]))
and
(always all o: Owner, c: Failing |
  (runNow[c] and c.on = o and o in Disposed) implies always o not in Stopped)
```

Current words:

```text
All of these hold:
- now and at every later moment, for every owner_1 and every cleanup_1 and every cleanup_2:

  when all of these hold:
  - pulse disposes owner_1
  - code has registered cleanup_1
  - cleanup_1 has not run
  - code has registered cleanup_2
  - cleanup_2 has not run
  - cleanup_1 is on owner_1
  - cleanup_2 is on owner_1
  - code registered cleanup_1 before cleanup_2

  then all of these hold:
  - now or at a later moment, the following holds:

    cleanup_2 runs
  - at every moment from now until the first such moment, not including it, the following holds:

    cleanup_1 does not run
- now and at every later moment, for every owner_2 and every failing cleanup:

  when the failing cleanup runs, is on owner_2 and pulse has disposed owner_2, then now and at every later moment, the dispose of owner_2 has not been stopped.
```
