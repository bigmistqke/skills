# Vocabulary

## Readings

Each line `word: positive | negative` gives the English of a word; {1}, {2} are its arguments in order.

```text
noun Quantifier: [quantifier]
VariableOnce: the sentence says the variable of {1} once | the sentence does not say the variable of {1} once
AsNounPhrase: [verbalizer](#term-verbalizer) says {1} as a noun phrase in the place of the variable, such as "sits in no unit" | [verbalizer](#term-verbalizer) does not say {1} as a noun phrase in the place of the variable, such as "sits in no unit"
VariableSubject: the variable of {1} is the subject of the sentence | the variable of {1} is not the subject of the sentence
AsSubjectPhrase: [verbalizer](#term-verbalizer) says {1} with the noun phrase as the subject, such as "a tag names unit_1" | [verbalizer](#term-verbalizer) does not say {1} with the noun phrase as the subject, such as "a tag names unit_1"
VariableWithCondition: the variable of {1} has a further condition | the variable of {1} has no further condition
RelativeClause: [verbalizer](#term-verbalizer) says {1} with a relative clause, such as "a unit that is a spec" | [verbalizer](#term-verbalizer) does not say {1} with a relative clause, such as "a unit that is a spec"
OneNegation: [verbalizer](#term-verbalizer) says {1} with one negation that lists the kinds | [verbalizer](#term-verbalizer) does not say {1} with one negation that lists the kinds
SaysAnother: [verbalizer](#term-verbalizer) says {1} with "another" before the noun | [verbalizer](#term-verbalizer) does not say {1} with "another" before the noun
NestsPhrases: [verbalizer](#term-verbalizer) says {1} as nested phrases, such as "a test checks a bug that sits in unit_1" | [verbalizer](#term-verbalizer) does not say {1} as nested phrases, such as "a test checks a bug that sits in unit_1"
VariableTwice: the reading of {1} says the variable twice | the reading of {1} does not say the variable twice
NothingToAttach: {1} has no fact for its variable beside another thing | {1} has a fact for its variable beside another thing
NoWithAnother: {1} says no variable differs from another and holds a condition | {1} does not both say that no variable differs from another and hold a condition
ConditionAside: the condition of {1} is not about its variable | the condition of {1} is about its variable
TimedCondition: {1} has several conditions, one of which begins with a time phrase | {1} does not have several conditions, one of which begins with a time phrase
InFull: [verbalizer](#term-verbalizer) says {1} in full, with "there is" and the numbered name | [verbalizer](#term-verbalizer) does not say {1} in full, with "there is" and the numbered name
ThereIsThat: [verbalizer](#term-verbalizer) says {1} as "there is" with its noun and a relative clause, such as "there is a unit that is a spec", or under "no" with one condition, such as "no unit is a spec" | [verbalizer](#term-verbalizer) does not say {1} as "there is" with its noun and a relative clause, such as "there is a unit that is a spec", or under "no" with one condition, such as "no unit is a spec"
ThereIsThatList: [verbalizer](#term-verbalizer) says {1} as "there is" with its noun and "that", and its conditions as bullets below it without their subject | [verbalizer](#term-verbalizer) does not say {1} as "there is" with its noun and "that", and its conditions as bullets below it without their subject
UnderNo: {1} is under "no" | {1} is not under "no"
LongConditions: {1} has more than three conditions, or conditions longer than a line | {1} has three conditions or fewer that fit a line
NoUnderNo: {1} is under "no" with a condition that says "no" | {1} is not under "no" with a condition that says "no"
fits: {1} [fits] a noun phrase | {1} does not [fit] a noun phrase
noun Definition: [definition]
GuardedByKind: the alternatives of {1} each begin with the kind of the subject | the alternatives of {1} do not each begin with the kind of the subject
PhrasePerKind: [verbalizer](#term-verbalizer) says {1} as a list with a noun phrase for each kind, such as "a spec that cites no axiom" | [verbalizer](#term-verbalizer) does not say {1} as a list with a noun phrase for each kind, such as "a spec that cites no axiom"
SameKindTwice: {1} has two alternatives for one kind | {1} does not have two alternatives for one kind
JoinedWithOr: [verbalizer](#term-verbalizer) says {1} as one noun phrase for that kind, with the alternatives joined by or | [verbalizer](#term-verbalizer) does not say {1} as one noun phrase for that kind, with the alternatives joined by or
OrInsideKind: {1} has an or inside one kind | {1} has no or inside one kind
OneCoordination: [verbalizer](#term-verbalizer) says {1} as one run of clauses joined by commas and or | [verbalizer](#term-verbalizer) does not say {1} as one run of clauses joined by commas and or
OneKind: the alternatives of {1} are of one kind | the alternatives of {1} are not of one kind
OneSentenceKind: [verbalizer](#term-verbalizer) says {1} as one sentence | [verbalizer](#term-verbalizer) does not say {1} as one sentence
NoKindFirst: {1} has an alternative that does not begin with its kind | {1} has no alternative that does not begin with its kind
AmbiguousAnd: {1} has a run of "and" beside another alternative of its kind | {1} has no run of "and" beside another alternative of its kind
NotAboutSubject: {1} has an alternative that says something about another unit | {1} has no alternative that says something about another unit
KindsShareAMember: {1} has two kinds that can share a member | {1} does not have two kinds that can share a member
AsItStands: [verbalizer](#term-verbalizer) says {1} as a list of the alternatives as they stand | [verbalizer](#term-verbalizer) does not say {1} as a list of the alternatives as they stand
byKind: {1} can be said [kind by kind] | {1} cannot be said [kind by kind]
noun Series: [list]
Items: {1} is a run of clauses joined by and or by or | {1} is not a run of clauses joined by and or by or
Rule: {1} is a rule with a first side and a second | {1} is not a rule with a first side and a second
Few: {1} has three clauses or fewer | {1} does not have three clauses or fewer
Many: {1} has more than three clauses | {1} does not have more than three clauses
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
SharedNegatives: {1} is a run of negative clauses about one subject that share their verb, each before a noun phrase of its own | {1} is not a run of negative clauses about one subject that share their verb, each before a noun phrase of its own
SaysNoneOfThese: [verbalizer](#term-verbalizer) says the subject and the verb that the clauses of {1} share once, before "none of these" | [verbalizer](#term-verbalizer) does not say the subject and the verb that the clauses of {1} share once, before "none of these"
OneLineRule: {1} is a rule whose two sides are each one clause | {1} is not a rule whose two sides are each one clause
TimeFirst: {1} is a rule whose first side begins with a time phrase | {1} is not a rule whose first side begins with a time phrase
TimeSecond: {1} is a rule whose second side begins with a time phrase | {1} is not a rule whose second side begins with a time phrase
OneLine: [verbalizer](#term-verbalizer) says {1} on one line, as "when" the first side, the second side | [verbalizer](#term-verbalizer) does not say {1} on one line, as "when" the first side, the second side
KeepsThen: [verbalizer](#term-verbalizer) says {1} with "then" before the time phrase | [verbalizer](#term-verbalizer) does not say {1} with "then" before the time phrase
DropsThen: [verbalizer](#term-verbalizer) says {1} without "then" | [verbalizer](#term-verbalizer) does not say {1} without "then"
ThenOwnLine: [verbalizer](#term-verbalizer) says {1} with "then" at the start of the second side, on a line of its own | [verbalizer](#term-verbalizer) does not say {1} with "then" at the start of the second side, on a line of its own
ListFirstSide: {1} is a rule whose first side is a run of clauses said as bullets | {1} is not a rule whose first side is a run of clauses said as bullets
PlainSecondSide: {1} is a rule whose second side is one line with no time phrase, relative clause, comma or "when" | {1} is not a rule whose second side is one line with no time phrase, relative clause, comma or "when"
Otherwise: {1} is a rule with an "otherwise" | {1} is not a rule with an "otherwise"
SecondSideFirst: [verbalizer](#term-verbalizer) says the second side of {1} before its first side | [verbalizer](#term-verbalizer) does not say the second side of {1} before its first side
sentenceable: {1} can be put in a [sentence] | {1} cannot be put in a [sentence]
noun Pass: [pass]
ahead: {1} runs before {2} | {1} does not run before {2}
OfIR: {1} changes the IR | {1} does not change the IR
OfPrinter: {1} changes the options of the printer | {1} does not change the options of the printer
NegationInward: {1} moves a negation inward | {1} does not move a negation inward
AnotherOfAKind: {1} says two things of a kind as one and another | {1} does not say two things of a kind as one and another
NounPhrases: {1} says a quantifier as a noun phrase | {1} does not say a quantifier as a noun phrase
ThereIsAThat: {1} says a quantifier of its variable alone as "there is a … that" | {1} does not say a quantifier of its variable alone as "there is a … that"
XAndNoOther: {1} says a set equal to a variable as that variable and no other | {1} does not say a set equal to a variable as that variable and no other
ForEveryTogether: {1} makes nested quantifiers of "for every" one | {1} does not make nested quantifiers of "for every" one
UntilInASentence: {1} says until and since of two clauses as one sentence | {1} does not say until and since of two clauses as one sentence
TimePhraseInFront: {1} puts a time phrase in front of the words it covers | {1} does not put a time phrase in front of the words it covers
ClausesInASentence: {1} says a few clauses as one sentence | {1} does not say a few clauses as one sentence
NoneOfThese: {1} says the subject and the verb that negative clauses share once, before "none of these" | {1} does not say the subject and the verb that negative clauses share once, before "none of these"
RuleOnOneLine: {1} says a rule on one line | {1} does not say a rule on one line
FromNowOnWhenever: {1} says a rule at every later moment as "from now on, whenever" | {1} does not say a rule at every later moment as "from now on, whenever"
ClaimFirst: {1} says the second side of a rule before its first side | {1} does not say the second side of a rule before its first side
```

## Declarations and definitions (Alloy 6)

```alloy
sig Quantifier {}
sig VariableOnce, AsNounPhrase, VariableSubject, AsSubjectPhrase, VariableWithCondition, RelativeClause in Quantifier {}
sig OneNegation, SaysAnother, NestsPhrases in Quantifier {}
sig VariableTwice, NothingToAttach, NoWithAnother, ConditionAside, TimedCondition, InFull in Quantifier {}
sig ThereIsThat, ThereIsThatList, LongConditions, NoUnderNo, UnderNo in Quantifier {}
fact quantifier_wordings { no AsNounPhrase & InFull and no ThereIsThat & InFull and no ThereIsThatList & InFull and no ThereIsThat & ThereIsThatList and AsSubjectPhrase + RelativeClause + OneNegation + SaysAnother + NestsPhrases in AsNounPhrase and no VariableOnce & VariableTwice }

pred fits[f: Quantifier] { f not in VariableTwice and f not in NothingToAttach and f not in NoWithAnother and f not in ConditionAside and f not in TimedCondition }

sig Definition {}
sig GuardedByKind, PhrasePerKind, SameKindTwice, JoinedWithOr, OrInsideKind, OneCoordination in Definition {}
sig OneKind, OneSentenceKind, NoKindFirst, AmbiguousAnd, NotAboutSubject, KindsShareAMember, AsItStands in Definition {}
fact case_wordings { no PhrasePerKind & AsItStands and JoinedWithOr + OneCoordination + OneSentenceKind in PhrasePerKind and no GuardedByKind & NoKindFirst }

pred byKind[d: Definition] { d not in NoKindFirst and d not in AmbiguousAnd and d not in NotAboutSubject and d not in KindsShareAMember }

sig Series {}
sig Items, Rule, Few, Many, MoreThanTwo, NotClause, CommaItem, TooLong, AndInOr, TimeBeforeLast, RelativeBeforeLast in Series {}
sig AsSentence, AsBullets, KeepsAndApart, SharedSubject, PairInList, SharedNegatives, SaysNoneOfThese in Series {}
sig OneLineRule, TimeFirst, TimeSecond, OneLine, KeepsThen, DropsThen, ThenOwnLine in Series {}
sig ListFirstSide, PlainSecondSide, Otherwise, SecondSideFirst in Series {}
fact series_wordings { no Items & Rule and Items = Few + Many and no Few & Many and Many in MoreThanTwo and AndInOr in NotClause and no AsSentence & AsBullets and KeepsAndApart in AsBullets and (Few + Many + NotClause + CommaItem + TooLong + TimeBeforeLast + RelativeBeforeLast + SharedSubject + PairInList) in Items and (OneLineRule + TimeFirst + TimeSecond) in Rule and no KeepsThen & DropsThen and no OneLine & ThenOwnLine and (KeepsThen + DropsThen) in OneLine and ThenOwnLine in Rule and SharedNegatives in Items and SaysNoneOfThese in AsBullets and (ListFirstSide + PlainSecondSide + Otherwise + SecondSideFirst) in Rule and no ListFirstSide & OneLineRule and no SecondSideFirst & (OneLine + ThenOwnLine) }

pred sentenceable[f: Series] { f in Few and f not in NotClause and (f not in CommaItem or f not in MoreThanTwo) and f not in TooLong and f not in TimeBeforeLast and f not in RelativeBeforeLast }

sig Pass { ahead: set Pass }
sig OfIR, OfPrinter in Pass {}
sig NegationInward, AnotherOfAKind, NounPhrases, ThereIsAThat, XAndNoOther, ForEveryTogether, UntilInASentence, TimePhraseInFront, ClausesInASentence, NoneOfThese, RuleOnOneLine, FromNowOnWhenever, ClaimFirst in Pass {}
fact passes {
  Pass = OfIR + OfPrinter and no OfIR & OfPrinter
  NegationInward + AnotherOfAKind + NounPhrases + ThereIsAThat + XAndNoOther + ForEveryTogether + UntilInASentence + TimePhraseInFront + ClausesInASentence + NoneOfThese + RuleOnOneLine + FromNowOnWhenever + ClaimFirst in OfIR
}
```
