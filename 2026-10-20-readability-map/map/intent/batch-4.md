Vocabulary file: canon-plugin-alloy.vocab.md

## s115  (axiom-a-statement-says-what-its-logic-says)

Claim (the unit's name, as a sentence): **a statement says what its logic says**

Rationale: A reader of the canon learns what a unit claims from its statement. If a person writes the statement apart from the logic, the two drift, and the reader learns what the logic does not hold. So the checker says the statement of a unit that holds a formula from that formula, in the same words each time, with [naturalloy](../naturalloy/CANON.md#axiom-a-formula-is-said-without-loss). It reports a statement that is not what the formula says. The words of the statements are the words of the logic. A reading of a word that nothing declares, or a word declared out of place, would let a statement say what the logic does not.

Formula:
```alloy
all d: Document, u: Unit | (d in Worded and d->u in Hold.units and u in Logical and u not in Current) implies u in Reported
```

What the formula says, exactly:
```text
For every document and every unit:

when all of these hold:
- the document keeps readings
- the document holds the unit
- the unit holds a formula
- the statement of the unit is not current

then checker reports the statement of the unit.
```

## s116  (spec-a-document-that-keeps-no-readings-is-left-as-it-is)

Claim (the unit's name, as a sentence): **a document that keeps no readings is left as it is**

Refines: "a statement says what its logic says"

Rationale: This follows because without readings the checker has no words to say a formula in, and the statement of a person stays what it is.

Formula:
```alloy
all d: Document, u: Unit | (d->u in Hold.units and d not in Worded) implies (u not in Rewritten and u not in Reported)
```

What the formula says, exactly:
```text
For every document and every unit:

when the document holds the unit and keeps no readings,

then all of these hold:
- checker does not write the statement of the unit when it generates
- checker does not report the statement of the unit
```

## s117  (spec-a-unit-with-a-formula-and-no-statement-is-unwritten)

Claim (the unit's name, as a sentence): **a unit with a formula and no statement is unwritten**

Refines: "a statement says what its logic says"

Rationale: This follows because a reader finds nothing under the heading, and the checker can say what the formula says.

Formula:
```alloy
all u: Unit | (u in Logical and u not in Stated and u not in Unsayable) implies u in Unwritten
```

What the formula says, exactly:
```text
For every unit:

when all of these hold:
- the unit holds a formula
- the unit has no statement
- the formula of the unit can be said in words

then the statement of the unit is unwritten.
```

## s118  (spec-a-generated-statement-that-differs-from-its-formula-is-stale)

Claim (the unit's name, as a sentence): **a generated statement that differs from its formula is stale**

Refines: "a statement says what its logic says"

Rationale: This follows because the markers claim that the region is what the formula says. An edited region, or one whose formula changed, no longer is.

Formula:
```alloy
all u: Unit | (u in Logical and u in Generated and u in Differs and u not in Unsayable) implies u in Stale
```

What the formula says, exactly:
```text
For every unit:

when all of these hold:
- the unit holds a formula
- the statement of the unit sits between the markers of a generated region
- the statement of the unit differs from what its formula says
- the formula of the unit can be said in words

then the statement of the unit is stale.
```

## s119  (spec-a-generated-statement-that-its-formula-would-say-again-is-current)

Claim (the unit's name, as a sentence): **a generated statement that its formula would say again is current**

Refines: "a statement says what its logic says"

Rationale: This follows because a statement that is what the formula says has nothing to report.

Formula:
```alloy
all u: Unit | (u in Generated and u not in Differs and u not in Unsayable) implies u in Current
```

What the formula says, exactly:
```text
For every unit:

when all of these hold:
- the statement of the unit sits between the markers of a generated region
- the statement of the unit does not differ from what its formula says
- the formula of the unit can be said in words

then the statement of the unit is current.
```

## s120  (spec-a-statement-that-a-person-wrote-is-handwritten)

Claim (the unit's name, as a sentence): **a statement that a person wrote is handwritten**

Refines: "a statement says what its logic says"

Rationale: This follows because a person's statement may say more or less than the formula, and only the person can say that the two agree.

Formula:
```alloy
all u: Unit | (u in Logical and u in Stated and u not in Generated and u not in Unsayable) implies u in Handwritten
```

What the formula says, exactly:
```text
For every unit:

when all of these hold:
- the unit holds a formula
- the unit has a statement
- the statement of the unit does not sit between the markers of a generated region
- the formula of the unit can be said in words

then the statement of the unit is handwritten.
```

## s121  (spec-a-formula-that-the-readings-cannot-say-is-unsayable)

Claim (the unit's name, as a sentence): **a formula that the readings cannot say is unsayable**

Refines: "a statement says what its logic says"

Rationale: This follows because the checker says only what the readings let it say, and would otherwise make words up.

Formula:
```alloy
all u: Unit | (u in Wordless or u in Twofold) implies u in Unsayable
```

What the formula says, exactly:
```text
For every unit:

when at least one of these holds:
- the formula of the unit names a word that has no reading
- the unit holds more than one formula

then the formula of the unit cannot be said in words.
```

## s122  (spec-a-formula-with-a-word-that-has-no-reading-is-unsayable)

Claim (the unit's name, as a sentence): **a formula with a word that has no reading is unsayable**

Refines: "a statement says what its logic says" → "a formula that the readings cannot say is unsayable"

Rationale: This follows because the checker has no words to use for a word without a reading.

Formula:
```alloy
all u: Unit | u in Wordless implies u in Unsayable
```

What the formula says, exactly:
```text
For every unit:

when the formula of the unit names a word that has no reading, the formula of the unit cannot be said in words.
```

## s123  (spec-a-unit-with-two-formulas-is-unsayable)

Claim (the unit's name, as a sentence): **a unit with two formulas is unsayable**

Refines: "a statement says what its logic says" → "a formula that the readings cannot say is unsayable"

Rationale: This follows because a statement says one formula, and the checker cannot tell which one.

Formula:
```alloy
all u: Unit | u in Twofold implies u in Unsayable
```

What the formula says, exactly:
```text
For every unit:

when the unit holds more than one formula, the formula of the unit cannot be said in words.
```

## s124  (spec-the-report-of-an-unsayable-formula-says-why)

Claim (the unit's name, as a sentence): **the report of an unsayable formula says why**

Refines: "a statement says what its logic says" → "a formula that the readings cannot say is unsayable"

Rationale: This follows because the author can mend only what the checker names.

Formula:
```alloy
all u: Unit | u in Unsayable implies u in Explained
```

What the formula says, exactly:
```text
For every unit:

when the formula of the unit cannot be said in words, checker says why the formula of the unit cannot be said.
```

## s125  (spec-a-fault-of-the-verbalizer-fails-the-run-and-is-not-explained-as-unsayable)

Claim (the unit's name, as a sentence): **a fault of the verbalizer fails the run and is not explained as unsayable**

Refines: "a statement says what its logic says"

Rationale: This follows because a report that a formula has no words sends the author to the formula or its readings. A fault needs a change to the verbalizer instead. Reported that way, a fault would hide a formula that has words, and the fault with it, so the checker fails instead. A fault is a mistake of the verbalizer, and the verbalizer has had them, so a run must be able to meet one.

Formula:
```alloy
all r: Run, c: Command, u: Unit | (r->c in Ask.rel and (c in GenerateCommand or c in CheckCommand) and u in Faulted) implies (u not in Explained and r not in Exits0)
```

What the formula says, exactly:
```text
For every run and every command_1 and every unit:

when all of these hold:
- the run asks for command_1
- command_1 is the command `generate` or is the command `check`
- the verbalizer fails on the formula of the unit with a fault of its own

then checker does not say why the formula of the unit cannot be said and the run does not exit with code 0.
```

## s126  (spec-generate-writes-what-is-not-current-and-nothing-else)

Claim (the unit's name, as a sentence): **generate writes what is not current and nothing else**

Refines: "a statement says what its logic says"

Rationale: This follows because a statement is the checker's to write until a person writes it, and what is current needs no writing.

Formula:
```alloy
all u: Unit | (u in Rewritten implies (u in Unwritten or u in Stale)) and ((u in Unwritten or u in Stale) implies u in Rewritten)
```

What the formula says, exactly:
```text
For every unit:

all of these hold:
- when checker writes the statement of the unit when it generates, the statement of the unit is unwritten or the statement of the unit is stale
- when the statement of the unit is unwritten or the statement of the unit is stale, checker writes the statement of the unit when it generates
```

## s127  (spec-generate-writes-the-statement-of-a-stale-unit-again)

Claim (the unit's name, as a sentence): **generate writes the statement of a stale unit again**

Refines: "a statement says what its logic says" → "generate writes what is not current and nothing else"

Rationale: This follows because a stale statement is the checker's own region, and it says what the formula does not.

Formula:
```alloy
all u: Unit | u in Stale implies u in Rewritten
```

What the formula says, exactly:
```text
For every unit:

when the statement of the unit is stale, checker writes the statement of the unit when it generates.
```

## s128  (spec-generate-leaves-a-current-statement-as-it-is)

Claim (the unit's name, as a sentence): **generate leaves a current statement as it is**

Refines: "a statement says what its logic says" → "generate writes what is not current and nothing else"

Rationale: This follows because writing what is already there changes nothing, and a second run must leave the document alone.

Formula:
```alloy
all u: Unit | u in Current implies u not in Rewritten
```

What the formula says, exactly:
```text
For every unit:

when the statement of the unit is current, checker does not write the statement of the unit when it generates.
```

## s129  (spec-generate-never-overwrites-a-handwritten-statement)

Claim (the unit's name, as a sentence): **generate never overwrites a handwritten statement**

Refines: "a statement says what its logic says" → "generate writes what is not current and nothing else"

Rationale: This follows because the words of a person are not the checker's to replace. The person deletes the statement to let the checker write it.

Formula:
```alloy
all u: Unit | u in Handwritten implies u not in Rewritten
```

What the formula says, exactly:
```text
For every unit:

when the statement of the unit is handwritten, checker does not write the statement of the unit when it generates.
```

## s130  (spec-generate-leaves-an-unsayable-unit-as-it-is)

Claim (the unit's name, as a sentence): **generate leaves an unsayable unit as it is**

Refines: "a statement says what its logic says" → "generate writes what is not current and nothing else"

Rationale: This follows because the checker has no statement to write, and a half statement would be worse than none.

Formula:
```alloy
all u: Unit | u in Unsayable implies u not in Rewritten
```

What the formula says, exactly:
```text
For every unit:

when the formula of the unit cannot be said in words, checker does not write the statement of the unit when it generates.
```

## s131  (spec-check-reports-a-statement-that-is-not-current)

Claim (the unit's name, as a sentence): **check reports a statement that is not current**

Refines: "a statement says what its logic says"

Rationale: This follows because a statement that is not current may say what the formula does not.

Formula:
```alloy
all d: Document, u: Unit | (d in Worded and d->u in Hold.units and u in Logical and u not in Current) implies u in Reported
```

What the formula says, exactly:
```text
For every document and every unit:

when all of these hold:
- the document keeps readings
- the document holds the unit
- the unit holds a formula
- the statement of the unit is not current

then checker reports the statement of the unit.
```

## s132  (spec-check-does-not-report-a-current-statement)

Claim (the unit's name, as a sentence): **check does not report a current statement**

Refines: "a statement says what its logic says"

Rationale: This follows because a statement that says what the formula says has nothing to report, and a report that cries wolf is not read.

Formula:
```alloy
all u: Unit | u in Current implies u not in Reported
```

What the formula says, exactly:
```text
For every unit:

when the statement of the unit is current, checker does not report the statement of the unit.
```

## s133  (spec-a-report-of-a-statement-fails-check)

Claim (the unit's name, as a sentence): **a report of a statement fails check**

Refines: "a statement says what its logic says"

Rationale: This follows because a statement that is not current is a canon that may be out of date, and the check must not succeed.

Formula:
```alloy
all r: Run, c: CheckCommand, u: Unit | (r->c in Ask.rel and u in Reported) implies r not in Exits0
```

What the formula says, exactly:
```text
For every run and every check command and every unit:

when the run asks for the check command and checker reports the statement of the unit, the run does not exit with code 0.
```

## s134  (spec-generate-fails-on-a-handwritten-statement-and-says-so)

Claim (the unit's name, as a sentence): **generate fails on a handwritten statement and says so**

Refines: "a statement says what its logic says"

Rationale: This follows because the checker cannot write that statement, and the author must know it left the statement.

Formula:
```alloy
all r: Run, c: GenerateCommand, u: Unit | (r->c in Ask.rel and u in Handwritten) implies (u in Reported and r not in Exits0)
```

What the formula says, exactly:
```text
For every run and every generate command and every unit:

when the run asks for the generate command and the statement of the unit is handwritten, checker reports the statement of the unit and the run does not exit with code 0.
```

## s135  (spec-generate-fails-on-an-unsayable-formula-and-says-why)

Claim (the unit's name, as a sentence): **generate fails on an unsayable formula and says why**

Refines: "a statement says what its logic says"

Rationale: This follows because the checker cannot write that statement either, and the author can mend only what the checker names.

Formula:
```alloy
all r: Run, c: GenerateCommand, u: Unit | (r->c in Ask.rel and u in Unsayable) implies (u in Explained and r not in Exits0)
```

What the formula says, exactly:
```text
For every run and every generate command and every unit:

when the run asks for the generate command and the formula of the unit cannot be said in words, checker says why the formula of the unit cannot be said and the run does not exit with code 0.
```

## s136  (spec-a-word-that-a-reading-says-and-nothing-declares-is-undeclared)

Claim (the unit's name, as a sentence): **a word that a reading says and nothing declares is undeclared**

Refines: "a statement says what its logic says"

Rationale: This follows because a reading of nothing says what the logic does not hold.

Formula:
```alloy
all w: Word | ((some u: Unit | u->w in Voice.rel) and (no u: Unit | u->w in Introduce.rel)) implies w in Undeclared
```

What the formula says, exactly:
```text
For every word_1:

when all of these hold:
- there is a unit_1 such that a reading in unit_1 says word_1
- no unit declares word_1

then word_1 is a word that a reading says and nothing declares.
```

## s137  (spec-a-word-declared-outside-a-term-is-misplaced)

Claim (the unit's name, as a sentence): **a word declared outside a term is misplaced**

Refines: "a statement says what its logic says"

Rationale: This follows because a reader looks for a word in the term that names it, with its reading beside it.

Formula:
```alloy
all u: Unit, w: Word | (u->w in Introduce.rel and u not in Term) implies w in Misplaced
```

What the formula says, exactly:
```text
For every unit_1 and every word_1:

when unit_1 declares word_1 and is not a term, word_1 is a word declared in a unit that is not a term.
```

## s138  (spec-a-reading-apart-from-the-declaration-it-says-is-apart)

Claim (the unit's name, as a sentence): **a reading apart from the declaration it says is apart**

Refines: "a statement says what its logic says"

Rationale: This follows because a reading and its declaration are one thing, and a reader finds them together.

Formula:
```alloy
all u: Unit, w: Word | (u->w in Voice.rel and (some v: Unit | v->w in Introduce.rel) and u->w not in Introduce.rel) implies w in Apart
```

What the formula says, exactly:
```text
For every unit_1 and every word_1:

when all of these hold:
- a reading in unit_1 says word_1
- a unit declares word_1
- unit_1 does not declare word_1

then word_1 is a word whose reading is in another unit than its declaration.
```

## s139  (spec-a-declared-word-that-no-claim-uses-is-unused)

Claim (the unit's name, as a sentence): **a declared word that no claim uses is unused**

Refines: "a statement says what its logic says"

Rationale: This follows because a word that nothing relies on is a part of the model that no claim holds, and the statements never say it.

Formula:
```alloy
all w: Word | ((some u: Unit | u->w in Introduce.rel) and (no u: Unit | u->w in Rely.rel)) implies w in Unused
```

What the formula says, exactly:
```text
For every word_1:

when all of these hold:
- a unit declares word_1
- there is no unit_1 such that a claim, a definition or a fact of unit_1 uses word_1

then word_1 is a word that no claim, definition or fact uses.
```

## s140  (spec-a-word-declared-in-a-term-said-beside-it-and-used-is-not-reported)

Claim (the unit's name, as a sentence): **a word declared in a term said beside it and used is not reported**

Refines: "a statement says what its logic says"

Rationale: This follows because such a word is where it belongs, and nothing needs a report.

Formula:
```alloy
all u: Term, w: Word | (u->w in Introduce.rel and u->w in Voice.rel and (some v: Unit | v->w in Rely.rel)) implies (w not in Undeclared and w not in Misplaced and w not in Apart and w not in Unused and w not in Flagged)
```

What the formula says, exactly:
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

## s141  (spec-a-document-that-keeps-no-readings-has-no-word-reported)

Claim (the unit's name, as a sentence): **a document that keeps no readings has no word reported**

Refines: "a statement says what its logic says"

Rationale: This follows because the checker says words only in a document that has readings.

Formula:
```alloy
all d: Document, u: Unit, w: Word | (d not in Worded and d->u in Hold.units and u->w in Introduce.rel) implies (w not in Undeclared and w not in Misplaced and w not in Apart and w not in Unused and w not in Flagged)
```

What the formula says, exactly:
```text
For every document and every unit_1 and every word_1:

when the document keeps no readings, holds unit_1 and unit_1 declares word_1,

then all of these hold:
- word_1 is not a word that a reading says and nothing declares
- word_1 is not a word declared in a unit that is not a term
- word_1 is not a word whose reading is in another unit than its declaration
- word_1 is not a word that no claim, definition or fact uses
- checker does not report the word word_1
```

## s142  (spec-a-flagged-word-fails-check)

Claim (the unit's name, as a sentence): **a flagged word fails check**

Refines: "a statement says what its logic says"

Rationale: This follows because a word out of order means a statement that may drift from the logic, and the check must not succeed.

Formula:
```alloy
all r: Run, c: CheckCommand, w: Word | (r->c in Ask.rel and w in Flagged) implies r not in Exits0
```

What the formula says, exactly:
```text
For every run and every check command and every word_1:

when the run asks for the check command and checker reports the word word_1, the run does not exit with code 0.
```

## s143  (spec-check-reports-nothing-about-a-word-that-is-in-order)

Claim (the unit's name, as a sentence): **check reports nothing about a word that is in order**

Refines: "a statement says what its logic says"

Rationale: This follows because a report that cries wolf is not read.

Formula:
```alloy
all w: Word | (w not in Undeclared and w not in Misplaced and w not in Apart and w not in Unused) implies w not in Flagged
```

What the formula says, exactly:
```text
For every word_1:

when all of these hold:
- word_1 is not a word that a reading says and nothing declares
- word_1 is not a word declared in a unit that is not a term
- word_1 is not a word whose reading is in another unit than its declaration
- word_1 is not a word that no claim, definition or fact uses

then checker does not report the word word_1.
```

## s144  (spec-check-reports-a-word-that-is-not-in-order)

Claim (the unit's name, as a sentence): **check reports a word that is not in order**

Refines: "a statement says what its logic says"

Rationale: This follows because a statement says only the words its readings give. A reading with no declaration, or a declaration out of place, lets a statement say what the logic does not hold.

Formula:
```alloy
all w: Word | (w in Undeclared or w in Misplaced or w in Apart or w in Unused) implies w in Flagged
```

What the formula says, exactly:
```text
For every word_1:

when at least one of these holds:
- word_1 is a word that a reading says and nothing declares
- word_1 is a word declared in a unit that is not a term
- word_1 is a word whose reading is in another unit than its declaration
- word_1 is a word that no claim, definition or fact uses

then checker reports the word word_1.
```

## s145  (spec-generate-writes-no-statement-for-a-unit-of-an-extended-document)

Claim (the unit's name, as a sentence): **generate writes no statement for a unit of an extended document**

Refines: "a statement says what its logic says"

Rationale: This follows because the extended document is the author's elsewhere, and is checked and generated where it lives.

Formula:
```alloy
all d: Document, e: Document, u: Unit | (d in Checked and e not in Checked and d->e in Context.rel and e->u in Hold.units) implies u not in Rewritten
```

What the formula says, exactly:
```text
For every document_1 and every document_2 and every unit:

when all of these hold:
- the project lists document_1 among the documents it checks
- the project does not list document_2 among the documents it checks
- document_2 is context for document_1
- document_2 holds the unit

then checker does not write the statement of the unit when it generates.
```

## s146  (spec-a-word-declared-in-an-extended-document-is-declared)

Claim (the unit's name, as a sentence): **a word declared in an extended document is declared**

Refines: "a statement says what its logic says"

Rationale: This follows because the checker reads the extended document with the document, so its words are the document's words.

Formula:
```alloy
all d: Document, e: Document, u: Unit, v: Unit, w: Word | (d->e in Context.rel and d->u in Hold.units and u->w in Voice.rel and e->v in Hold.units and v->w in Introduce.rel) implies w not in Undeclared
```

What the formula says, exactly:
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

## s147  (axiom-the-claims-of-a-canon-never-contradict-each-other)

Claim (the unit's name, as a sentence): **the claims of a canon never contradict each other**

Rationale: Every claim of a canon says how the project is, and the claims are about one project. If two of them cannot both hold, the canon says nothing. A reader cannot follow both, and a change that obeys one breaks the other. The same goes for a situation that the canon says must be possible and that one of its claims rules out. So the checker asks the analyzer two things. Can the claims hold together? Can each scenario happen? It names the units that a repair has to touch.

Formula:
```alloy
(all u: Unit | u in Contradicting implies u in Named) and (all c: Scenario | c in Impossible implies c in Raised)
```

What the formula says, exactly:
```text
All of these hold:
- for every unit_1:

  when unit_1 is held with units that cannot all hold, checker names unit_1 in its report of a contradiction
- for every scenario_1:

  when scenario_1 is a scenario that cannot happen while every held unit holds, checker reports that scenario_1 cannot happen.
```

## s148  (spec-a-formula-with-no-keyword-is-a-claim-to-hold)

Claim (the unit's name, as a sentence): **a formula with no keyword is a claim to hold**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because a unit that states a bare formula states a claim, and the analyzer must hold the claim to find a contradiction.

Formula:
```alloy
all u: Unit | u in BareFormula implies u in Held
```

What the formula says, exactly:
```text
For every unit:

when the unit holds a formula with no keyword, the analyzer is asked to hold the formula of the unit.
```

## s149  (spec-the-first-searches-leave-no-unit-out)

Claim (the unit's name, as a sentence): **the first searches leave no unit out**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because the author learns first whether the canon holds together, and the searches that leave a unit out cost much more.

Formula:
```alloy
all s: Search | s in First implies s not in Trial
```

What the formula says, exactly:
```text
For every search:

when the search is asked before any scenario is known to be impossible, the search leaves no unit out.
```

## s150  (spec-a-trial-is-made-only-for-a-scenario-that-cannot-happen)

Claim (the unit's name, as a sentence): **a trial is made only for a scenario that cannot happen**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because a scenario that can happen has nothing to repair.

Formula:
```alloy
all s: Search, c: Scenario | (s in Trial and s->c in Pose.scenario) implies (c in Impossible and s in Afterwards)
```

What the formula says, exactly:
```text
For every search_1 and every scenario_1:

when search_1 leaves one unit out and requires scenario_1 to happen,

then all of these hold:
- scenario_1 is a scenario that cannot happen while every held unit holds
- search_1 is asked after the first search is answered
```
