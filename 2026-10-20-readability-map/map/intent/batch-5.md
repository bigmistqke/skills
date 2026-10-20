Vocabulary file: canon-plugin-alloy.vocab.md

## s151  (spec-a-trial-leaves-out-one-held-unit-and-keeps-the-rest)

Claim (the unit's name, as a sentence): **a trial leaves out one held unit and keeps the rest**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because the unit whose removal lets the scenario happen is one that a repair has to touch.

Formula:
```alloy
all s: Search, c: Scenario, u: Unit | (s in Trial and s->c in Pose.scenario and s->u in Leave.rel) implies (u in Held and s->u not in Pose.units and (all v: Unit | (v in Held and v != u) implies s->v in Pose.units))
```

What the formula says, exactly:
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

## s152  (spec-a-trial-is-made-for-each-held-unit-of-a-scenario-that-cannot-happen)

Claim (the unit's name, as a sentence): **a trial is made for each held unit of a scenario that cannot happen**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because any held unit may be the one that rules the scenario out. The author cannot tell without the search.

Formula:
```alloy
all c: Scenario, u: Unit | (c in Impossible and u in Held and (no v: Unit | c->v in Probe.rel)) implies (some s: Search | s in Trial and s->c in Pose.scenario and s->u in Leave.rel)
```

What the formula says, exactly:
```text
For every scenario_1 and every unit_1:

when all of these hold:
- scenario_1 is a scenario that cannot happen while every held unit holds
- the analyzer is asked to hold the formula of unit_1
- there is no unit_2 such that the author asks about leaving out unit_2 for scenario_1

then a search that leaves one unit out and leaves out unit_1 requires scenario_1 to happen.
```

## s153  (spec-a-trial-leaves-out-only-the-units-the-author-asks-about)

Claim (the unit's name, as a sentence): **a trial leaves out only the units the author asks about**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because an author who knows which unit keeps a scenario out needs one search and not one for every unit.

Formula:
```alloy
all s: Search, c: Scenario, u: Unit | (s in Trial and s->c in Pose.scenario and s->u in Leave.rel and (some v: Unit | c->v in Probe.rel)) implies c->u in Probe.rel
```

What the formula says, exactly:
```text
For every search and every scenario and every unit_1:

when all of these hold:
- the search leaves one unit out
- the search requires the scenario to happen
- the search leaves out unit_1
- there is a unit_2 such that the author asks about leaving out unit_2 for the scenario

then the author asks about leaving out unit_1 for the scenario.
```

## s154  (spec-a-scenario-that-cannot-happen-while-every-unit-holds-is-reported)

Claim (the unit's name, as a sentence): **a scenario that cannot happen while every unit holds is reported**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because a canon that rules out what it says must be possible has failed.

Formula:
```alloy
all c: Scenario | c in Impossible implies c in Raised
```

What the formula says, exactly:
```text
For every scenario_1:

when scenario_1 is a scenario that cannot happen while every held unit holds, checker reports that scenario_1 cannot happen.
```

## s155  (spec-a-scenario-that-can-happen-is-not-reported)

Claim (the unit's name, as a sentence): **a scenario that can happen is not reported**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because a report that cries wolf is not read.

Formula:
```alloy
all c: Scenario | c in Possible implies c not in Raised
```

What the formula says, exactly:
```text
For every scenario_1:

when scenario_1 is a scenario that can happen while every held unit holds, checker does not report that scenario_1 cannot happen.
```

## s156  (spec-the-report-of-a-scenario-names-each-unit-whose-removal-lets-it-happen)

Claim (the unit's name, as a sentence): **the report of a scenario names each unit whose removal lets it happen**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because such a unit is in every conflict, so one of them has to change.

Formula:
```alloy
all c: Scenario, u: Unit | (c in Raised and u->c in Frees.rel) implies c->u in Blame.rel
```

What the formula says, exactly:
```text
For every scenario and every unit:

when all of these hold:
- checker reports that the scenario cannot happen
- leaving out the unit lets the scenario happen

then checker names the unit in its report of the scenario.
```

## s157  (spec-the-report-of-a-scenario-names-no-other-unit)

Claim (the unit's name, as a sentence): **the report of a scenario names no other unit**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because a unit whose removal changes nothing is not what keeps the scenario out. Naming it would send the author to the wrong place.

Formula:
```alloy
all c: Scenario, u: Unit | c->u in Blame.rel implies u->c in Frees.rel
```

What the formula says, exactly:
```text
For every scenario and every unit:

when checker names the unit in its report of the scenario, leaving out the unit lets the scenario happen.
```

## s158  (spec-units-that-cannot-all-hold-are-named)

Claim (the unit's name, as a sentence): **units that cannot all hold are named**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because the author must find the units that contradict each other.

Formula:
```alloy
all u: Unit | u in Contradicting implies u in Named
```

What the formula says, exactly:
```text
For every unit_1:

when unit_1 is held with units that cannot all hold, checker names unit_1 in its report of a contradiction.
```

## s159  (spec-the-report-of-a-contradiction-names-all-the-units-of-the-group)

Claim (the unit's name, as a sentence): **the report of a contradiction names all the units of the group**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because the analyzer knows that the group cannot hold, and does not know which of its units is wrong.

Formula:
```alloy
all u: Unit, v: Unit | (u in Contradicting and u->v in Together.rel) implies v in Named
```

What the formula says, exactly:
```text
For every unit_1 and every unit_2:

when all of these hold:
- unit_1 is held with units that cannot all hold
- the analyzer is asked about unit_1 together with unit_2

then checker names unit_2 in its report of a contradiction.
```

## s160  (spec-units-that-share-a-word-are-asked-about-together)

Claim (the unit's name, as a sentence): **units that share a word are asked about together**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because units that talk about the same thing may contradict each other. They form a [group](#term-group).

Formula:
```alloy
all u: Unit, v: Unit | u->v in Share.rel implies u->v in Together.rel
```

What the formula says, exactly:
```text
For every unit_1 and every unit_2:

when unit_1 shares a word with unit_2, the analyzer is asked about unit_1 together with unit_2.
```

## s161  (spec-units-that-share-no-word-are-asked-about-apart)

Claim (the unit's name, as a sentence): **units that share no word are asked about apart**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because units about different things cannot contradict each other, and asking about them apart gives the same answer in less time.

Formula:
```alloy
all u: Unit, v: Unit | u->v in Together.rel implies u->v in Chain.rel
```

What the formula says, exactly:
```text
For every unit_1 and every unit_2:

when the analyzer is asked about unit_1 together with unit_2, unit_1 is linked to unit_2 through shared words.
```

## s162  (spec-logic-succeeds-when-nothing-is-reported)

Claim (the unit's name, as a sentence): **logic succeeds when nothing is reported**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because a canon that holds together has nothing to fix.

Formula:
```alloy
all r: Run, c: LogicCommand | (r->c in Ask.rel and (no x: Scenario | x in Raised) and (no u: Unit | u in Contradicting)) implies r in Exits0
```

What the formula says, exactly:
```text
For every run and every logic command:

when all of these hold:
- the run asks for the logic command
- there is no scenario such that checker reports that the scenario cannot happen
- there is no unit_1 such that unit_1 is held with units that cannot all hold

then the run exits with code 0.
```

## s163  (spec-a-reported-scenario-or-contradiction-fails-logic)

Claim (the unit's name, as a sentence): **a reported scenario or contradiction fails logic**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because a canon that contradicts itself must not pass.

Formula:
```alloy
all r: Run, c: LogicCommand | (r->c in Ask.rel and ((some x: Scenario | x in Raised) or (some u: Unit | u in Contradicting))) implies r not in Exits0
```

What the formula says, exactly:
```text
For every run and every logic command:

when all of these hold:
- the run asks for the logic command
- at least one of these holds:
  - there is a scenario such that checker reports that the scenario cannot happen
  - there is a unit_1 such that unit_1 is held with units that cannot all hold

then the run does not exit with code 0.
```

## s164  (spec-the-claims-of-an-extended-document-join-the-model)

Claim (the unit's name, as a sentence): **the claims of an extended document join the model**

Refines: "the claims of a canon never contradict each other"

Rationale: This follows because two claims that contradict each other make a contradiction in the canon, wherever the two sit.

Formula:
```alloy
all d: Document, e: Document, u: Unit | (d in Checked and d->e in Context.rel and e->u in Hold.units and u in BareFormula) implies u in Held
```

What the formula says, exactly:
```text
For every document_1 and every document_2 and every unit:

when all of these hold:
- the project lists document_1 among the documents it checks
- document_2 is context for document_1
- document_2 holds the unit
- the unit holds a formula with no keyword

then the analyzer is asked to hold the formula of the unit.
```

## s165  (axiom-a-formula-can-be-held-against-the-other-formulas)

Claim (the unit's name, as a sentence): **a formula can be held against the other formulas**

Rationale: A reader takes a unit with a formula as checked. The analyzer holds its formula against the other formulas, and would find a contradiction between them. That holds only when something else in the model speaks of the words the formula uses. A formula that no other formula can contradict holds whatever the rest of the canon says. It looks checked and is not, and the reader trusts a claim that nothing has checked. So the checker reports a formula that no other formula can contradict, and only such a formula. It finds one by the signatures it is [lone](#term-lone-formula) on. The author can tie the signature to the rest of the model, with a definition, a fact or a scenario that names it. Or the author can take the formula away and write the statement of the unit by hand, so that the unit no longer looks checked. Then its test guards it.

Formula:
```alloy
(all u: Unit | (u in Logical and u not in Term and u in Unchallenged) implies (some w: Signature | u->w in Expose.rel)) and (all u: Unit, w: Word | u->w in Expose.rel implies u in Unchallenged)
```

What the formula says, exactly:
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

## s166  (spec-a-formula-that-no-other-formula-can-contradict-is-reported)

Claim (the unit's name, as a sentence): **a formula that no other formula can contradict is reported**

Refines: "a formula can be held against the other formulas"

Rationale: This follows because the report is what keeps such a formula from looking checked.

Formula:
```alloy
all u: Unit | (u in Logical and u not in Term and u in Unchallenged) implies (some w: Signature | u->w in Expose.rel)
```

What the formula says, exactly:
```text
For every unit:

when all of these hold:
- the unit holds a formula
- the unit is not a term
- no other formula can contradict the formula of the unit

then checker reports the formula of the unit as lone on a signature.
```

## s167  (spec-a-formula-that-is-lone-on-a-signature-is-reported)

Claim (the unit's name, as a sentence): **a formula that is lone on a signature is reported**

Refines: "a formula can be held against the other formulas" → "a formula that no other formula can contradict is reported"

Rationale: This follows because nothing else in the model speaks of a signature that the formula is lone on. The report names the signature, so the author knows what to tie to the model.

Formula:
```alloy
all u: Unit, w: Signature | (u in Logical and u not in Term and loneOn[u, w]) implies u->w in Expose.rel
```

What the formula says, exactly:
```text
For every unit and every signature:

when all of these hold:
- the unit holds a formula
- the unit is not a term
- the formula of the unit is lone on the signature

then checker reports the formula of the unit as lone on the signature.
```

## s168  (spec-a-formula-is-reported-only-when-no-other-formula-can-contradict-it)

Claim (the unit's name, as a sentence): **a formula is reported only when no other formula can contradict it**

Refines: "a formula can be held against the other formulas"

Rationale: This follows because a report that cries wolf is not read.

Formula:
```alloy
all u: Unit, w: Word | u->w in Expose.rel implies u in Unchallenged
```

What the formula says, exactly:
```text
For every unit and every word:

when checker reports the formula of the unit as lone on the word, no other formula can contradict the formula of the unit.
```

## s169  (spec-a-formula-is-reported-only-on-a-signature-it-is-lone-on)

Claim (the unit's name, as a sentence): **a formula is reported only on a signature it is lone on**

Refines: "a formula can be held against the other formulas" → "a formula is reported only when no other formula can contradict it"

Rationale: This follows because the check knows a formula that no other formula can contradict only by a signature it is lone on.

Formula:
```alloy
all u: Unit, w: Word | u->w in Expose.rel implies (u in Logical and u not in Term and w in Signature and loneOn[u, w])
```

What the formula says, exactly:
```text
For every unit and every word:

when checker reports the formula of the unit as lone on the word,

then all of these hold:
- the unit holds a formula
- the unit is not a term
- the word is a signature
- the formula of the unit is lone on the word
```

## s170  (spec-a-signature-that-another-unit-names-keeps-a-formula-from-being-reported)

Claim (the unit's name, as a sentence): **a signature that another unit names keeps a formula from being reported**

Refines: "a formula can be held against the other formulas" → "a formula is reported only when no other formula can contradict it" → "a formula is reported only on a signature it is lone on"

Rationale: This follows because the other unit constrains the signature, so it can contradict the formula.

Formula:
```alloy
all u: Unit, v: Unit, w: Word | (v != u and v->w in Utter.rel) implies u->w not in Expose.rel
```

What the formula says, exactly:
```text
For every unit_1 and every unit_2 and every word:

when all of these hold:
- unit_2 and unit_1 are different
- a block of unit_2 names the word outside its declaration

then checker does not report the formula of unit_1 as lone on the word.
```

## s171  (spec-a-signature-that-a-scenario-names-keeps-a-formula-from-being-reported)

Claim (the unit's name, as a sentence): **a signature that a scenario names keeps a formula from being reported**

Refines: "a formula can be held against the other formulas" → "a formula is reported only when no other formula can contradict it" → "a formula is reported only on a signature it is lone on"

Rationale: This follows because the analyzer reports a scenario that the formula rules out. So the scenario holds the formula against something, even in the unit of the formula.

Formula:
```alloy
all u: Unit, v: Unit, w: Word | v->w in Picture.rel implies u->w not in Expose.rel
```

What the formula says, exactly:
```text
For every unit_1 and every unit_2 and every word:

when a scenario of unit_2 names the word, checker does not report the formula of unit_1 as lone on the word.
```

## s172  (spec-a-signature-that-an-extended-document-names-keeps-a-formula-from-being-reported)

Claim (the unit's name, as a sentence): **a signature that an extended document names keeps a formula from being reported**

Refines: "a formula can be held against the other formulas" → "a formula is reported only when no other formula can contradict it" → "a formula is reported only on a signature it is lone on"

Rationale: This follows because the claims of an extended document join the model, so they can contradict the formula.

Formula:
```alloy
all d: Document, e: Document, u: Unit, v: Unit, w: Word | (d->e in Context.rel and d->u in Hold.units and e->v in Hold.units and v->w in Utter.rel) implies u->w not in Expose.rel
```

What the formula says, exactly:
```text
For every document_1 and every document_2 and every unit_1 and every unit_2 and every word:

when all of these hold:
- document_2 is context for document_1
- document_1 holds unit_1
- document_2 holds unit_2
- a block of unit_2 names the word outside its declaration

then checker does not report the formula of unit_1 as lone on the word.
```

## s173  (spec-a-formula-is-not-reported-on-a-field-or-a-predicate)

Claim (the unit's name, as a sentence): **a formula is not reported on a field or a predicate**

Refines: "a formula can be held against the other formulas" → "a formula is reported only when no other formula can contradict it" → "a formula is reported only on a signature it is lone on"

Rationale: This follows because a predicate has a body that ties it to the other words. The check leaves fields out for now. It reads a field by its name, and two signatures can give a field the same name.

Formula:
```alloy
all u: Unit, w: Word | w not in Signature implies u->w not in Expose.rel
```

What the formula says, exactly:
```text
For every unit and every word:

when the word is not a signature, checker does not report the formula of the unit as lone on the word.
```

## s174  (spec-a-term-is-not-reported-as-lone)

Claim (the unit's name, as a sentence): **a term is not reported as lone**

Refines: "a formula can be held against the other formulas" → "a formula is reported only when no other formula can contradict it" → "a formula is reported only on a signature it is lone on"

Rationale: This follows because a term gives a word its meaning and claims nothing.

Formula:
```alloy
all u: Term, w: Word | u->w not in Expose.rel
```

What the formula says, exactly:
```text
For every term and every word:

checker does not report the formula of the term as lone on the word.
```

## s175  (spec-a-document-that-keeps-no-readings-has-no-formula-reported-as-lone)

Claim (the unit's name, as a sentence): **a document that keeps no readings has no formula reported as lone**

Refines: "a formula can be held against the other formulas" → "a formula is reported only when no other formula can contradict it" → "a formula is reported only on a signature it is lone on"

Rationale: This follows because the check of lone formulas is part of the check of words, which reads only a document that keeps readings.

Formula:
```alloy
all d: Document, u: Unit, w: Word | (d not in Worded and d->u in Hold.units) implies u->w not in Expose.rel
```

What the formula says, exactly:
```text
For every document and every unit and every word:

when the document keeps no readings and holds the unit, checker does not report the formula of the unit as lone on the word.
```

## s176  (spec-a-lone-formula-fails-check)

Claim (the unit's name, as a sentence): **a lone formula fails check**

Refines: "a formula can be held against the other formulas"

Rationale: This follows because a formula that looks checked and is not must not let the check succeed.

Formula:
```alloy
all r: Run, c: CheckCommand, u: Unit, w: Word | (r->c in Ask.rel and u->w in Expose.rel) implies r not in Exits0
```

What the formula says, exactly:
```text
For every run and every check command and every unit and every word:

when the run asks for the check command and checker reports the formula of the unit as lone on the word, the run does not exit with code 0.
```
