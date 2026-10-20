Vocabulary file: naturalloy.vocab.md

## s181  (term-fit)

Claim (the unit's name, as a sentence): **fit**

Formula:
```alloy
pred fits[f: Quantifier] { f not in VariableTwice and f not in NothingToAttach and f not in NoWithAnother and f not in ConditionAside and f not in TimedCondition }
```

What the formula says, exactly:
```text
For every quantifier_1:

quantifier_1 fits a noun phrase exactly when all of these hold:
- quantifier_1 is not a quantifier whose reading says the variable twice
- quantifier_1 is not a quantifier with no fact for its variable beside another thing
- quantifier_1 is not a quantifier that says no variable differs from another and holds a condition
- quantifier_1 is not a quantifier whose condition is not about its variable
- quantifier_1 is not a quantifier with several conditions, one of which begins with a time phrase
```

## s182  (term-by-kind)

Claim (the unit's name, as a sentence): **by kind**

Formula:
```alloy
pred byKind[d: Definition] { d not in NoKindFirst and d not in AmbiguousAnd and d not in NotAboutSubject }
```

What the formula says, exactly:
```text
For every definition_1:

definition_1 can be said kind by kind exactly when all of these hold:
- definition_1 is not a definition with an alternative that does not begin with its kind
- definition_1 is not a definition with a run of and beside another alternative of its kind
- definition_1 is not a definition with an alternative that says something about another unit
```

## s183  (term-sentenceable)

Claim (the unit's name, as a sentence): **sentenceable**

Formula:
```alloy
pred sentenceable[f: Series] { f in Few and f not in NotClause and (f not in CommaItem or f not in MoreThanTwo) and f not in TooLong and f not in TimeBeforeLast and f not in RelativeBeforeLast }
```

What the formula says, exactly:
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

## s184  (spec-a-rule-of-two-clauses-is-said-on-one-line)

Claim (the unit's name, as a sentence): **a rule of two clauses is said on one line**

Refines: "a formula is said without loss"

Rationale: This follows because a short rule is clearest as one sentence, "when this, that".

Formula:
```alloy
all f: Series | (f in OneLineRule and f not in TimeFirst) implies f in OneLine
```

What the formula says, exactly:
```text
For every list:

when all of these hold:
- the list is a rule whose two sides are each one clause
- the list is not a rule whose first side begins with a time phrase

then verbalizer says the list on one line, as "when" the first side, the second side.
```

## s185  (spec-a-definition-by-cases-is-said-as-a-noun-phrase-for-each-kind)

Claim (the unit's name, as a sentence): **a definition by cases is said as a noun phrase for each kind**

Refines: "a formula is said without loss"

Rationale: This follows because a reader takes in "a spec that cites no axiom" faster than a sentence about a unit that is a spec. The phrase says the same in fewer words.

Formula:
```alloy
all f: Definition | (f in GuardedByKind and byKind[f]) implies f in PhrasePerKind
```

What the formula says, exactly:
```text
For every definition_1:

when all of these hold:
- definition_1 is a definition whose alternatives each begin with the kind of the subject
- definition_1 can be said kind by kind

then verbalizer says definition_1 as a list with a noun phrase for each kind, such as "a spec that cites no axiom".
```

## s186  (spec-the-alternatives-of-one-kind-are-put-together-with-or)

Claim (the unit's name, as a sentence): **the alternatives of one kind are put together with or**

Refines: "a formula is said without loss"

Rationale: This follows because two alternatives for one kind are two ways to be that kind, and one phrase says so.

Formula:
```alloy
all f: Definition | (f in SameKindTwice and byKind[f]) implies f in JoinedWithOr
```

What the formula says, exactly:
```text
For every definition_1:

when definition_1 is a definition with two alternatives for one kind and can be said kind by kind, verbalizer says definition_1 as one noun phrase for that kind, with the alternatives joined by or.
```

## s187  (spec-the-options-of-an-or-inside-a-kind-are-one-coordination)

Claim (the unit's name, as a sentence): **the options of an or inside a kind are one coordination**

Refines: "a formula is said without loss"

Rationale: This follows because options in one kind read as one run of "names, names or is".

Formula:
```alloy
all f: Definition | (f in OrInsideKind and byKind[f]) implies f in OneCoordination
```

What the formula says, exactly:
```text
For every definition_1:

when definition_1 is a definition with an or inside one kind and can be said kind by kind, verbalizer says definition_1 as one run of clauses joined by commas and or.
```

## s188  (spec-a-definition-with-one-kind-is-one-sentence)

Claim (the unit's name, as a sentence): **a definition with one kind is one sentence**

Refines: "a formula is said without loss"

Rationale: This follows because a list of one line is no list.

Formula:
```alloy
all f: Definition | (f in OneKind and byKind[f]) implies f in OneSentenceKind
```

What the formula says, exactly:
```text
For every definition_1:

when definition_1 is a definition whose alternatives are of one kind and can be said kind by kind, verbalizer says definition_1 as one sentence.
```

## s189  (spec-a-definition-by-cases-is-said-as-it-stands-when-an-alternative-does-not-begin-with-its-kind)

Claim (the unit's name, as a sentence): **a definition by cases is said as it stands when an alternative does not begin with its kind**

Refines: "a formula is said without loss"

Rationale: This follows because a phrase for a kind needs the kind first, and an alternative without it would lose what it says.

Formula:
```alloy
all f: Definition | f in NoKindFirst implies f in AsItStands
```

What the formula says, exactly:
```text
For every definition_1:

when definition_1 is a definition with an alternative that does not begin with its kind, verbalizer says definition_1 as a list of the alternatives as they stand.
```

## s190  (spec-a-definition-by-cases-is-said-as-it-stands-when-a-run-of-and-would-read-two-ways)

Claim (the unit's name, as a sentence): **a definition by cases is said as it stands when a run of and would read two ways**

Refines: "a formula is said without loss"

Rationale: This follows because a run of and beside another alternative of its kind could join to either, and the reader should not guess.

Formula:
```alloy
all f: Definition | f in AmbiguousAnd implies f in AsItStands
```

What the formula says, exactly:
```text
For every definition_1:

when definition_1 is a definition with a run of and beside another alternative of its kind, verbalizer says definition_1 as a list of the alternatives as they stand.
```

## s191  (spec-a-definition-by-cases-is-said-as-it-stands-when-an-alternative-is-not-about-its-subject)

Claim (the unit's name, as a sentence): **a definition by cases is said as it stands when an alternative is not about its subject**

Refines: "a formula is said without loss"

Rationale: This follows because a phrase for a kind is about the subject, and an alternative about something else would get the wrong words.

Formula:
```alloy
all f: Definition | f in NotAboutSubject implies f in AsItStands
```

What the formula says, exactly:
```text
For every definition_1:

when definition_1 is a definition with an alternative that says something about another unit, verbalizer says definition_1 as a list of the alternatives as they stand.
```

## s192  (spec-a-variable-said-once-takes-the-place-of-its-quantifier-as-a-noun-phrase)

Claim (the unit's name, as a sentence): **a variable said once takes the place of its quantifier as a noun phrase**

Refines: "a formula is said without loss"

Rationale: This follows because "sits in no unit" is one phrase. Spelled out with a numbered name, it takes twice the words.

Formula:
```alloy
all f: Quantifier | (f in VariableOnce and fits[f]) implies f in AsNounPhrase
```

What the formula says, exactly:
```text
For every quantifier_1:

when quantifier_1 is a quantifier whose variable the sentence says once and fits a noun phrase, verbalizer says quantifier_1 as a noun phrase in the place of the variable, such as "sits in no unit".
```

## s193  (spec-a-noun-phrase-can-be-the-subject-of-a-sentence)

Claim (the unit's name, as a sentence): **a noun phrase can be the subject of a sentence**

Refines: "a formula is said without loss"

Rationale: This follows because the thing the sentence is about may be the variable.

Formula:
```alloy
all f: Quantifier | (f in VariableSubject and fits[f]) implies f in AsSubjectPhrase
```

What the formula says, exactly:
```text
For every quantifier_1:

when quantifier_1 is a quantifier whose variable is the subject of the sentence and fits a noun phrase, verbalizer says quantifier_1 with the noun phrase as the subject, such as "a tag names unit_1".
```

## s194  (spec-what-else-is-true-of-the-variable-is-a-relative-clause)

Claim (the unit's name, as a sentence): **what else is true of the variable is a relative clause**

Refines: "a formula is said without loss"

Rationale: This follows because a condition on the variable is a part of the phrase that names it.

Formula:
```alloy
all f: Quantifier | (f in VariableWithCondition and fits[f]) implies f in RelativeClause
```

What the formula says, exactly:
```text
For every quantifier_1:

when quantifier_1 is a quantifier whose variable has a further condition and fits a noun phrase, verbalizer says quantifier_1 with a relative clause, such as "a unit that is a spec".
```

## s195  (spec-a-quantifier-whose-variable-would-be-said-twice-is-said-in-full)

Claim (the unit's name, as a sentence): **a quantifier whose variable would be said twice is said in full**

Refines: "a formula is said without loss"

Rationale: This follows because a phrase that says the variable in two places would hide that it is one thing.

Formula:
```alloy
all f: Quantifier | f in VariableTwice implies f in InFull
```

What the formula says, exactly:
```text
For every quantifier_1:

when quantifier_1 is a quantifier whose reading says the variable twice, verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s196  (spec-a-quantifier-with-nothing-to-attach-to-is-said-in-full)

Claim (the unit's name, as a sentence): **a quantifier with nothing to attach to is said in full**

Refines: "a formula is said without loss"

Rationale: This follows because a phrase needs a place in the sentence, and a variable beside nothing else has none.

Formula:
```alloy
all f: Quantifier | f in NothingToAttach implies f in InFull
```

What the formula says, exactly:
```text
For every quantifier_1:

when quantifier_1 is a quantifier with no fact for its variable beside another thing, verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s197  (spec-no-with-another-is-said-in-full)

Claim (the unit's name, as a sentence): **no with another is said in full**

Refines: "a formula is said without loss"

Rationale: This follows because "no" with "another" in one phrase would mean something else than the logic says, so the verbalizer spells it out.

Formula:
```alloy
all f: Quantifier | f in NoWithAnother implies f in InFull
```

What the formula says, exactly:
```text
For every quantifier_1:

when quantifier_1 is a quantifier that says no variable differs from another and holds a condition, verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s198  (spec-a-quantifier-with-a-time-phrase-in-one-of-several-conditions-is-said-in-full)

Claim (the unit's name, as a sentence): **a quantifier with a time phrase in one of several conditions is said in full**

Refines: "a formula is said without loss"

Rationale: This follows because a time phrase in a noun phrase would cover the other conditions too, where the formula has it cover one.

Formula:
```alloy
all f: Quantifier | f in TimedCondition implies f in InFull
```

What the formula says, exactly:
```text
For every quantifier_1:

when the following holds:

quantifier_1 is a quantifier with several conditions, one of which begins with a time phrase

then verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s199  (spec-a-condition-that-is-not-about-the-variable-is-said-in-full)

Claim (the unit's name, as a sentence): **a condition that is not about the variable is said in full**

Refines: "a formula is said without loss"

Rationale: This follows because the phrase would put the condition in the wrong place.

Formula:
```alloy
all f: Quantifier | f in ConditionAside implies f in InFull
```

What the formula says, exactly:
```text
For every quantifier_1:

when quantifier_1 is a quantifier whose condition is not about its variable, verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s200  (spec-three-clauses-or-fewer-are-said-in-a-sentence)

Claim (the unit's name, as a sentence): **three clauses or fewer are said in a sentence**

Refines: "a formula is said without loss"

Rationale: This follows because a short list in a sentence is easier to read than bullets.

Formula:
```alloy
all f: Series | sentenceable[f] implies f in AsSentence
```

What the formula says, exactly:
```text
For every list:

when the list can be put in a sentence, verbalizer says the list in a sentence.
```

## s201  (spec-a-longer-list-or-a-list-with-a-comma-is-bullets)

Claim (the unit's name, as a sentence): **a longer list or a list with a comma is bullets**

Refines: "a formula is said without loss"

Rationale: This follows because a sentence of many conditions loses the reader, and so does one with commas or items of more than a clause.

Formula:
```alloy
all f: Series | (f in Items and not sentenceable[f]) implies f in AsBullets
```

What the formula says, exactly:
```text
For every list:

when the list is a run of clauses joined by and or by or and cannot be put in a sentence, verbalizer says the list as bullets.
```

## s202  (spec-a-list-of-more-than-three-clauses-is-bullets)

Claim (the unit's name, as a sentence): **a list of more than three clauses is bullets**

Refines: "a formula is said without loss" → "a longer list or a list with a comma is bullets"

Rationale: This follows because a sentence of four conditions loses the reader.

Formula:
```alloy
all f: Series | f in Many implies f in AsBullets
```

What the formula says, exactly:
```text
For every list:

when the list has more than three clauses, verbalizer says the list as bullets.
```

## s203  (spec-a-list-with-a-comma-in-an-item-and-more-than-two-clauses-is-bullets)

Claim (the unit's name, as a sentence): **a list with a comma in an item and more than two clauses is bullets**

Refines: "a formula is said without loss" → "a longer list or a list with a comma is bullets"

Rationale: This follows because a comma inside an item makes a list of three read as a list of more.

Formula:
```alloy
all f: Series | (f in CommaItem and f in MoreThanTwo) implies f in AsBullets
```

What the formula says, exactly:
```text
For every list:

when all of these hold:
- the list has an item that holds a comma
- the list has more than two clauses

then verbalizer says the list as bullets.
```

## s204  (spec-a-list-too-long-for-a-line-is-bullets)

Claim (the unit's name, as a sentence): **a list too long for a line is bullets**

Refines: "a formula is said without loss" → "a longer list or a list with a comma is bullets"

Rationale: This follows because a sentence that runs past a line is hard to take in at once.

Formula:
```alloy
all f: Series | f in TooLong implies f in AsBullets
```

What the formula says, exactly:
```text
For every list:

when the list is longer than a line when it is put in a sentence, verbalizer says the list as bullets.
```

## s205  (spec-a-list-with-a-time-phrase-before-its-last-clause-is-bullets)

Claim (the unit's name, as a sentence): **a list with a time phrase before its last clause is bullets**

Refines: "a formula is said without loss" → "a longer list or a list with a comma is bullets"

Rationale: This follows because a time phrase at the start of a sentence reads as covering each clause after it. The formula has it cover one.

Formula:
```alloy
all f: Series | f in TimeBeforeLast implies f in AsBullets
```

What the formula says, exactly:
```text
For every list:

when the list has a clause before its last that begins with a time phrase, verbalizer says the list as bullets.
```

## s206  (spec-a-list-with-a-relative-clause-before-its-last-clause-is-bullets)

Claim (the unit's name, as a sentence): **a list with a relative clause before its last clause is bullets**

Refines: "a formula is said without loss" → "a longer list or a list with a comma is bullets"

Rationale: This follows because a relative clause can run on over the clauses after it. "An owner that pulse has disposed and code has registered c" reads so. The formula ends it with its own clause.

Formula:
```alloy
all f: Series | f in RelativeBeforeLast implies f in AsBullets
```

What the formula says, exactly:
```text
For every list:

when the list has a clause before its last with a relative clause in it, verbalizer says the list as bullets.
```

## s207  (spec-an-item-that-is-more-than-a-clause-makes-the-list-bullets)

Claim (the unit's name, as a sentence): **an item that is more than a clause makes the list bullets**

Refines: "a formula is said without loss" → "a longer list or a list with a comma is bullets"

Rationale: This follows because an item with a quantifier or a list of its own cannot stand in a sentence beside others.

Formula:
```alloy
all f: Series | f in NotClause implies f in AsBullets
```

What the formula says, exactly:
```text
For every list:

when the list has an item that is more than one clause, verbalizer says the list as bullets.
```

## s208  (spec-an-and-inside-an-or-is-kept-apart)

Claim (the unit's name, as a sentence): **an and inside an or is kept apart**

Refines: "a formula is said without loss"

Rationale: This follows because a sentence "a and b or c" has two meanings, and the statement must have one.

Formula:
```alloy
all f: Series | f in AndInOr implies f in KeepsAndApart
```

What the formula says, exactly:
```text
For every list_1:

when list_1 is a list of alternatives where one alternative holds an and, verbalizer says list_1 as bullets that cannot be read two ways.
```

## s209  (spec-a-rule-keeps-its-then-before-a-time-phrase)

Claim (the unit's name, as a sentence): **a rule keeps its then before a time phrase**

Refines: "a formula is said without loss"

Rationale: This follows because "when this, then now or at a later moment, that" reads better than two commas in a row.

Formula:
```alloy
all f: Series | (f in OneLineRule and f not in TimeFirst and f in TimeSecond) implies f in KeepsThen
```

What the formula says, exactly:
```text
For every list:

when all of these hold:
- the list is a rule whose two sides are each one clause
- the list is not a rule whose first side begins with a time phrase
- the list is a rule whose second side begins with a time phrase

then verbalizer says the list with "then" before the time phrase.
```

## s210  (spec-a-rule-drops-its-then-before-anything-else)

Claim (the unit's name, as a sentence): **a rule drops its then before anything else**

Refines: "a formula is said without loss"

Rationale: This follows because a "then" after every "when" fills the one-line sentence with words that add nothing.

Formula:
```alloy
all f: Series | (f in OneLineRule and f not in TimeFirst and f not in TimeSecond) implies f in DropsThen
```

What the formula says, exactly:
```text
For every list:

when all of these hold:
- the list is a rule whose two sides are each one clause
- the list is not a rule whose first side begins with a time phrase
- the list is not a rule whose second side begins with a time phrase

then verbalizer says the list without "then".
```

## s211  (spec-a-rule-whose-first-side-begins-with-a-time-phrase-puts-its-then-on-a-line-of-its-own)

Claim (the unit's name, as a sentence): **a rule whose first side begins with a time phrase puts its then on a line of its own**

Refines: "a formula is said without loss"

Rationale: This follows because on one line, the reader would have to guess whether the time phrase covers the second side too.

Formula:
```alloy
all f: Series | f in TimeFirst implies f in ThenOwnLine
```

What the formula says, exactly:
```text
For every list:

when the list is a rule whose first side begins with a time phrase, verbalizer says the list with "then" at the start of the second side, on a line of its own.
```

## s212  (spec-a-rule-with-a-list-for-a-side-puts-its-then-on-a-line-of-its-own)

Claim (the unit's name, as a sentence): **a rule with a list for a side puts its then on a line of its own**

Refines: "a formula is said without loss"

Rationale: This follows because a rule whose side is a list cannot fit on a line, and "then" tells the reader where the second side starts.

Formula:
```alloy
all f: Series | (f in Rule and f not in OneLineRule) implies f in ThenOwnLine
```

What the formula says, exactly:
```text
For every list:

when the list is a rule with a first side and a second and is not a rule whose two sides are each one clause, verbalizer says the list with "then" at the start of the second side, on a line of its own.
```
