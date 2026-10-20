# Vocabulary

## Readings

Each line `word: positive | negative` gives the English of a word; {1}, {2} are its arguments in order.

```text


noun Quantifier: [quantifier]
VariableOnce: {1} is a quantifier whose variable the sentence says once | {1} is not a quantifier whose variable the sentence says once
AsNounPhrase: [verbalizer](#term-verbalizer) says {1} as a noun phrase in the place of the variable, such as "sits in no unit" | [verbalizer](#term-verbalizer) does not say {1} as a noun phrase in the place of the variable, such as "sits in no unit"
VariableSubject: {1} is a quantifier whose variable is the subject of the sentence | {1} is not a quantifier whose variable is the subject of the sentence
AsSubjectPhrase: [verbalizer](#term-verbalizer) says {1} with the noun phrase as the subject, such as "a tag names unit_1" | [verbalizer](#term-verbalizer) does not say {1} with the noun phrase as the subject, such as "a tag names unit_1"
VariableWithCondition: {1} is a quantifier whose variable has a further condition | {1} is not a quantifier whose variable has a further condition
RelativeClause: [verbalizer](#term-verbalizer) says {1} with a relative clause, such as "a unit that is a spec" | [verbalizer](#term-verbalizer) does not say {1} with a relative clause, such as "a unit that is a spec"
OneNegation: [verbalizer](#term-verbalizer) says {1} with one negation that lists the kinds | [verbalizer](#term-verbalizer) does not say {1} with one negation that lists the kinds
SaysAnother: [verbalizer](#term-verbalizer) says {1} with "another" before the noun | [verbalizer](#term-verbalizer) does not say {1} with "another" before the noun
NestsPhrases: [verbalizer](#term-verbalizer) says {1} as nested phrases, such as "a test checks a bug that sits in unit_1" | [verbalizer](#term-verbalizer) does not say {1} as nested phrases, such as "a test checks a bug that sits in unit_1"
VariableTwice: {1} is a quantifier whose reading says the variable twice | {1} is not a quantifier whose reading says the variable twice
NothingToAttach: {1} is a quantifier with no fact for its variable beside another thing | {1} is not a quantifier with no fact for its variable beside another thing
NoWithAnother: {1} is a quantifier that says no variable differs from another and holds a condition | {1} is not a quantifier that says no variable differs from another and holds a condition
ConditionAside: {1} is a quantifier whose condition is not about its variable | {1} is not a quantifier whose condition is not about its variable
TimedCondition: {1} is a quantifier with several conditions, one of which begins with a time phrase | {1} is not a quantifier with several conditions, one of which begins with a time phrase
InFull: [verbalizer](#term-verbalizer) says {1} in full, with "there is" and the numbered name | [verbalizer](#term-verbalizer) does not say {1} in full, with "there is" and the numbered name
fits: {1} [fits] a noun phrase | {1} does not [fit] a noun phrase

noun Definition: [definition]
GuardedByKind: {1} is a definition whose alternatives each begin with the kind of the subject | {1} is not a definition whose alternatives each begin with the kind of the subject
PhrasePerKind: [verbalizer](#term-verbalizer) says {1} as a list with a noun phrase for each kind, such as "a spec that cites no axiom" | [verbalizer](#term-verbalizer) does not say {1} as a list with a noun phrase for each kind, such as "a spec that cites no axiom"
SameKindTwice: {1} is a definition with two alternatives for one kind | {1} is not a definition with two alternatives for one kind
JoinedWithOr: [verbalizer](#term-verbalizer) says {1} as one noun phrase for that kind, with the alternatives joined by or | [verbalizer](#term-verbalizer) does not say {1} as one noun phrase for that kind, with the alternatives joined by or
OrInsideKind: {1} is a definition with an or inside one kind | {1} is not a definition with an or inside one kind
OneCoordination: [verbalizer](#term-verbalizer) says {1} as one run of clauses joined by commas and or | [verbalizer](#term-verbalizer) does not say {1} as one run of clauses joined by commas and or
OneKind: {1} is a definition whose alternatives are of one kind | {1} is not a definition whose alternatives are of one kind
OneSentenceKind: [verbalizer](#term-verbalizer) says {1} as one sentence | [verbalizer](#term-verbalizer) does not say {1} as one sentence
NoKindFirst: {1} is a definition with an alternative that does not begin with its kind | {1} is not a definition with an alternative that does not begin with its kind
AmbiguousAnd: {1} is a definition with a run of and beside another alternative of its kind | {1} is not a definition with a run of and beside another alternative of its kind
NotAboutSubject: {1} is a definition with an alternative that says something about another unit | {1} is not a definition with an alternative that says something about another unit
AsItStands: [verbalizer](#term-verbalizer) says {1} as a list of the alternatives as they stand | [verbalizer](#term-verbalizer) does not say {1} as a list of the alternatives as they stand
byKind: {1} can be said [kind by kind] | {1} cannot be said [kind by kind]

noun Series: [list]
Items: {1} is a run of clauses joined by and or by or | {1} is not a run of clauses joined by and or by or
Rule: {1} is a rule with a first side and a second | {1} is not a rule with a first side and a second
Few: {1} has three clauses or fewer | {1} has more than three clauses
Many: {1} has more than three clauses | {1} has three clauses or fewer
MoreThanTwo: {1} has more than two clauses | {1} has two clauses or fewer
NotClause: {1} has an item that is more than one clause | {1} has only items that are one clause
CommaItem: {1} has an item that holds a comma | {1} has no item that holds a comma
TooLong: {1} is longer than a line when it is put in a sentence | {1} fits a line when it is put in a sentence
TimeBeforeLast: {1} has a clause before its last that begins with a time phrase | {1} has no clause before its last that begins with a time phrase
RelativeBeforeLast: {1} has a clause before its last with a relative clause in it | {1} has no clause before its last with a relative clause in it
AndInOr: {1} is a list of alternatives where one alternative holds an and | {1} is not a list of alternatives where one alternative holds an and
AsSentence: [verbalizer](#term-verbalizer) says {1} in a sentence | [verbalizer](#term-verbalizer) does not say {1} in a sentence
AsBullets: [verbalizer](#term-verbalizer) says {1} as bullets | [verbalizer](#term-verbalizer) does not say {1} as bullets
KeepsAndApart: [verbalizer](#term-verbalizer) says {1} as bullets that cannot be read two ways | [verbalizer](#term-verbalizer) does not say {1} as bullets that cannot be read two ways
SharedSubject: {1} has clauses that begin with the same subject | {1} has no clauses that begin with the same subject
PairInList: {1} has a clause about a pair of variables | {1} has no clause about a pair of variables
OneLineRule: {1} is a rule whose two sides are each one clause | {1} is not a rule whose two sides are each one clause
TimeFirst: {1} is a rule whose first side begins with a time phrase | {1} is not a rule whose first side begins with a time phrase
TimeSecond: {1} is a rule whose second side begins with a time phrase | {1} is not a rule whose second side begins with a time phrase
OneLine: [verbalizer](#term-verbalizer) says {1} on one line, as "when" the first side, the second side | [verbalizer](#term-verbalizer) does not say {1} on one line, as "when" the first side, the second side
KeepsThen: [verbalizer](#term-verbalizer) says {1} with "then" before the time phrase | [verbalizer](#term-verbalizer) does not say {1} with "then" before the time phrase
DropsThen: [verbalizer](#term-verbalizer) says {1} without "then" | [verbalizer](#term-verbalizer) does not say {1} without "then"
ThenOwnLine: [verbalizer](#term-verbalizer) says {1} with "then" at the start of the second side, on a line of its own | [verbalizer](#term-verbalizer) does not say {1} with "then" at the start of the second side, on a line of its own
sentenceable: {1} can be put in a [sentence] | {1} cannot be put in a [sentence]

```

## Declarations and definitions (Alloy 6)

```alloy




sig Quantifier {}
sig VariableOnce, AsNounPhrase, VariableSubject, AsSubjectPhrase, VariableWithCondition, RelativeClause in Quantifier {}
sig OneNegation, SaysAnother, NestsPhrases in Quantifier {}
sig VariableTwice, NothingToAttach, NoWithAnother, ConditionAside, TimedCondition, InFull in Quantifier {}
fact quantifier_wordings { no AsNounPhrase & InFull and AsSubjectPhrase + RelativeClause + OneNegation + SaysAnother + NestsPhrases in AsNounPhrase and no VariableOnce & VariableTwice }

pred fits[f: Quantifier] { f not in VariableTwice and f not in NothingToAttach and f not in NoWithAnother and f not in ConditionAside and f not in TimedCondition }



sig Definition {}
sig GuardedByKind, PhrasePerKind, SameKindTwice, JoinedWithOr, OrInsideKind, OneCoordination in Definition {}
sig OneKind, OneSentenceKind, NoKindFirst, AmbiguousAnd, NotAboutSubject, AsItStands in Definition {}
fact case_wordings { no PhrasePerKind & AsItStands and JoinedWithOr + OneCoordination + OneSentenceKind in PhrasePerKind and no GuardedByKind & NoKindFirst }

pred byKind[d: Definition] { d not in NoKindFirst and d not in AmbiguousAnd and d not in NotAboutSubject }



sig Series {}
sig Items, Rule, Few, Many, MoreThanTwo, NotClause, CommaItem, TooLong, AndInOr, TimeBeforeLast, RelativeBeforeLast in Series {}
sig AsSentence, AsBullets, KeepsAndApart, SharedSubject, PairInList in Series {}
sig OneLineRule, TimeFirst, TimeSecond, OneLine, KeepsThen, DropsThen, ThenOwnLine in Series {}
fact series_wordings { no Items & Rule and Items = Few + Many and no Few & Many and Many in MoreThanTwo and AndInOr in NotClause and no AsSentence & AsBullets and KeepsAndApart in AsBullets and (Few + Many + NotClause + CommaItem + TooLong + TimeBeforeLast + RelativeBeforeLast + SharedSubject + PairInList) in Items and (OneLineRule + TimeFirst + TimeSecond) in Rule and no KeepsThen & DropsThen and no OneLine & ThenOwnLine and (KeepsThen + DropsThen) in OneLine and ThenOwnLine in Rule }

pred sentenceable[f: Series] { f in Few and f not in NotClause and (f not in CommaItem or f not in MoreThanTwo) and f not in TooLong and f not in TimeBeforeLast and f not in RelativeBeforeLast }


```
