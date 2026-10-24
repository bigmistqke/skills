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
noun Unit: [unit]
Unit: {1} is a [unit] | {1} is not a [unit]
noun Axiom: [axiom]
Axiom: {1} is an [axiom] | {1} is not an [axiom]
noun Fact: [fact]
Fact: {1} is a [fact] | {1} is not a [fact]
noun Spec: [spec]
Spec: {1} is a [spec] | {1} is not a [spec]
noun Exception: [exception]
Exception: {1} is an [exception] | {1} is not an [exception]
noun Bug: [bug]
Bug: {1} is a [bug] | {1} is not a [bug]
noun Conflict: [conflict]
Conflict: {1} is a [conflict] | {1} is not a [conflict]
noun Thread: [thread]
Thread: {1} is a [thread] | {1} is not a [thread]
noun Term: [term]
Term: {1} is a [term] | {1} is not a [term]
Sit.rel: {1} [sits in] {2} | {1} does not [sit in] {2}
Derive.rel: {1} [derives from] {2} | {1} does not [derive from] {2}
cites: {1} [cites] {2} | {1} does not [cite] {2}
noun Thing: [thing]
Finding: [checker](#term-checker) reports a [finding] for {1} | [checker](#term-checker) reports no [finding] for {1}
Freelancing: [checker](#term-checker) reports a [freelancing] for {1} | [checker](#term-checker) reports no [freelancing] for {1}
Misnesting: [checker](#term-checker) reports a [misnesting] for {1} | [checker](#term-checker) reports no [misnesting] for {1}
unfounded: {1} is [unfounded] | {1} is not [unfounded]
miscited: {1} is [miscited] | {1} is not [miscited]
Depend.rel: {1} [depends on] {2} | {1} does not [depend on] {2}
circular: {1} is [circular] | {1} is not [circular]
Cycle: [checker](#term-checker) reports a [cycle] for {1} | [checker](#term-checker) reports no [cycle] for {1}
Untracking: [checker](#term-checker) reports an [untracking] for {1} | [checker](#term-checker) reports no [untracking] for {1}
Mistracking: [checker](#term-checker) reports a [mistracking] for {1} | [checker](#term-checker) reports no [mistracking] for {1}
OutdatedTracking: [checker](#term-checker) reports an [outdated tracking] for {1} | [checker](#term-checker) reports no [outdated tracking] for {1}
Unpairing: [checker](#term-checker) reports an [unpairing] for {1} | [checker](#term-checker) reports no [unpairing] for {1}
Unpinning: [checker](#term-checker) reports an [unpinning] for {1} | [checker](#term-checker) reports no [unpinning] for {1}
UnexplainedFailure: [checker](#term-checker) reports an [unexplained failure] for {1} | [checker](#term-checker) reports no [unexplained failure] for {1}
Untesting: [checker](#term-checker) reports an [untesting] for {1} | [checker](#term-checker) reports no [untesting] for {1}
Rotting: [checker](#term-checker) reports a [rotting] for {1} | [checker](#term-checker) reports no [rotting] for {1}
Uncitation: [checker](#term-checker) reports an [uncitation] for {1} | [checker](#term-checker) reports no [uncitation] for {1}
Misaiming: [checker](#term-checker) reports a [misaiming] for {1} | [checker](#term-checker) reports no [misaiming] for {1}
Overreach: [checker](#term-checker) reports an [overreach] for {1} | [checker](#term-checker) reports no [overreach] for {1}
Orphaning: [checker](#term-checker) reports an [orphaning] for {1} | [checker](#term-checker) reports no [orphaning] for {1}
Misanchoring: [checker](#term-checker) reports a [misanchoring] for {1} | [checker](#term-checker) reports no [misanchoring] for {1}
Misindexing: [checker](#term-checker) reports a [misindexing] for {1} | [checker](#term-checker) reports no [misindexing] for {1}
Mislocation: [checker](#term-checker) reports a [mislocation] for {1} | [checker](#term-checker) reports no [mislocation] for {1}
noun Claim: [claim]
Claim: {1} is a [claim] | {1} is not a [claim]
refined: {1} is [refined] | {1} is not [refined]
unguarded: {1} is [unguarded] | {1} is not [unguarded]
adrift: {1} is [adrift] | {1} is not [adrift]
noun Test: [test]
Test: {1} is a [test] | {1} is not a [test]
Declared: [project](#term-project) [declares] {1} | [project](#term-project) does not [declare] {1}
noun Pointer: [pointer]
Pointer: {1} is a [pointer] | {1} is not a [pointer]
noun Target: [target]
Target: {1} is a [target] | {1} is not a [target]
noun Section: [section]
Section: {1} is a [section] | {1} is not a [section]
File: {1} is a [file] | {1} is not a [file]
used: {1} is [used] | {1} is not [used]
noun Trailer: [trailer]
Trailer: {1} is a [trailer] | {1} is not a [trailer]
Repeat.rel: {1} [repeats] {2} | {1} does not [repeat] {2}
Follow.rel: {1} [follows] {2} | {1} does not [follow] {2}
noun Document: [document]
Document: {1} is a [document] | {1} is not a [document]
noun Index: [index]
Index: {1} is an [index] | {1} is not an [index]
Hold.units: {1} [holds] {2} | {1} does not [hold] {2}
Hold.indexes: {1} [holds] {2} | {1} does not [hold] {2}
Hold.symbols: {1} [holds] {2} | {1} does not [hold] {2}
Match.rel: {1} [matches] {2} | {1} does not [match] {2}
noun Site: [site]
Site: {1} is a [site] | {1} is not a [site]
noun Source: [source]
Source: {1} is a [source] | {1} is not a [source]
noun Tag: [tag]
Tag: {1} is a [tag] | {1} is not a [tag]
Carry.rel: {1} [carries] {2} | {1} does not [carry] {2}
noun PlainTest: [plain test]
PlainTest: {1} is a [plain test] | {1} is not a [plain test]
noun ExpectedFailure: [expected failure]
ExpectedFailure: {1} is an [expected failure] | {1} is not an [expected failure]
checks: {1} [checks] {2} | {1} does not [check] {2}
noun Issue: [issue]
Issue: {1} is an [issue] | {1} is not an [issue]
noun Tracker: [tracker]
Tracker: [project](#term-project) has a [tracker] | [project](#term-project) has no [tracker]
Known: [tracker] knows {1} | [tracker] does not know {1}
Closed: [tracker] has closed {1} | [tracker] has not closed {1}
Name.issue: {1} [names] {2} | {1} does not [name] {2}
Name.between: {1} [names] {2} | {1} does not [name] {2}
Name.tag: {1} [names] {2} | {1} does not [name] {2}
Name.pointer: {1} [names] {2} | {1} does not [name] {2}
Name.site: {1} [names] {2} | {1} does not [name] {2}
tested: {1} is [tested] | {1} is not [tested]
paired: {1} is [paired] | {1} is not [paired]
hidden: {1} is [hidden] | {1} is not [hidden]
misleading: {1} is [misleading] | {1} is not [misleading]
noun Plugin: [plugin]
noun Installed: [installed plugin]
Installed: the project has installed {1} | the project has not installed {1}
noun Missing: [missing plugin]
Missing: the project lacks {1} | the project does not lack {1}
Unfound: [checker](#term-checker) reports that the project lacks {1} | [checker](#term-checker) does not report that the project lacks {1}
noun Command: [command]
Core: the [checker](#term-checker) has {1} of its own | the [checker](#term-checker) does not have {1} of its own
Unknown: [checker](#term-checker) reports {1} as an unknown [command] | [checker](#term-checker) does not report {1} as an unknown [command]
Add.rel: {1} adds {2} | {1} does not add {2}
noun Block: [block]
noun Frontmatter: [frontmatter]
Frontmatter: {1} is a [frontmatter] | {1} is not a [frontmatter]
noun Listing: [listing frontmatter]
Listing: {1} has a plugins key | {1} has no plugins key
noun Refused: [refused frontmatter]
Refused: the [checker](#term-checker) cannot read {1} | the [checker](#term-checker) can read {1}
Unreadable: [checker](#term-checker) reports that {1} has a [frontmatter] it cannot read | [checker](#term-checker) does not report that {1} has a [frontmatter] it cannot read
Head.rel: {1} starts with {2} | {1} does not start with {2}
Bare.rel: {1} is {2} without its [frontmatter] | {1} is not {2} without its [frontmatter]
noun Entry: [entry]
Item.rel: {1} holds {2} | {1} does not hold {2}
Spell.rel: {1} spells {2} | {1} does not spell {2}
lists: {1} [lists] {2} | {1} does not [list] {2}
noun Misquoted: [misquoted frontmatter]
Misquoted: {1} has the [flaw] of an entry that starts with an at sign outside quotes | {1} does not have the [flaw] of an entry that starts with an at sign outside quotes
noun Foreign: [foreign frontmatter]
Foreign: {1} has the [flaw] of a key that neither the [checker](#term-checker) nor a [plugin](#term-plugin) that {1} lists defines | {1} does not have the [flaw] of a key that neither the [checker](#term-checker) nor a [plugin](#term-plugin) that {1} lists defines
noun Unclosed: [unclosed frontmatter]
Unclosed: {1} has the [flaw] of a list that is not closed | {1} does not have the [flaw] of a list that is not closed
noun Unterminated: [unterminated frontmatter]
Unterminated: {1} has the [flaw] of a string that is not closed | {1} does not have the [flaw] of a string that is not closed
noun Doubled: [doubled frontmatter]
Doubled: {1} has the [flaw] of a key that appears twice | {1} does not have the [flaw] of a key that appears twice
noun Dangling: [dangling frontmatter]
Dangling: {1} has the [flaw] of a path that names no document | {1} does not have the [flaw] of a path that names no document
noun Looping: [circular frontmatter]
Looping: {1} has the [flaw] of an extension that leads back to its own document | {1} does not have the [flaw] of an extension that leads back to its own document
Extend.rel: {1} [extends] {2} | {1} does not [extend] {2}
Context.rel: {2} is [context] for {1} | {2} is not [context] for {1}
noun Stray: [stray frontmatter]
Stray: {1} has the [flaw](#term-flaw) of a setting in a document that is not the entry document | {1} does not have the [flaw](#term-flaw) of a setting in a document that is not the entry document
noun Runner: [runner]
Runner: [project](#term-project) has a [runner] | [project](#term-project) has no [runner]
applies: {1} [applies] to {2} | {1} does not [apply] to {2}
noun Run: [run]
Exits0: {1} exits with code 0 | {1} does not exit with code 0
Exits1: {1} exits with code 1 | {1} does not exit with code 1
Exits2: {1} exits with code 2 | {1} does not exit with code 2
noun Given: [given document]
Given: the command line of a [run](#term-run) names {1} | the command line of no [run](#term-run) names {1}
Ask.rel: {1} asks for {2} | {1} does not ask for {2}
stopped: [checker](#term-checker) stops {1} itself | [checker](#term-checker) does not stop {1} itself
Return.code0: {1} gets code 0 from {2} | {1} does not get code 0 from {2}
Return.code1: {1} gets code 1 from {2} | {1} does not get code 1 from {2}
Return.code2: {1} gets code 2 from {2} | {1} does not get code 2 from {2}
Over.rel: [checker](#term-checker) runs {1} over {2} | [checker](#term-checker) does not run {1} over {2}
calls: {1} [calls] {2} | {1} does not [call] {2}
available: {1} is [available] | {1} is not [available]
noun Fence: [fence]
Languaged: {1} names a language | {1} names no language
VocabularyWord: the second word of {1} is vocabulary | the second word of {1} is not vocabulary
BoundsWord: the second word of {1} is bounds | the second word of {1} is not bounds
ScenarioWord: the second word of {1} is scenario | the second word of {1} is not scenario
NoSecondWord: {1} has no second word that names a role | {1} has a second word that names a role
VocabularyBlock: {1} has the role of vocabulary | {1} does not have the role of vocabulary
BoundsBlock: {1} has the role of bounds | {1} does not have the role of bounds
ScenarioBlock: {1} has the role of scenario | {1} does not have the role of scenario
UnitBlock: {1} has the role of the formula of its unit | {1} does not have the role of the formula of its unit
Within.rel: {1} lies in the own text of {2} | {1} does not lie in the own text of {2}
Blocks.rel: [checker](#term-checker) reads {2} as a block of {1} | [checker](#term-checker) does not read {2} as a block of {1}
noun GenerateCommand: [generate command]
noun CheckCommand: [check command]
noun LogicCommand: [logic command]
LogicCommand: {1} is the [command] `logic` | {1} is not the [command] `logic`
GenerateCommand: {1} is the [command] `generate` | {1} is not the [command] `generate`
CheckCommand: {1} is the [command] `check` | {1} is not the [command] `check`
Logical: {1} holds a formula | {1} holds no formula
Generated: the [statement] of {1} sits between the markers of a generated region | the [statement] of {1} does not sit between the markers of a generated region
Differs: the [statement] of {1} differs from what its formula says | the [statement] of {1} does not differ from what its formula says
Wordless: the formula of {1} names a word that has no reading | the formula of {1} names no word that has no reading
Twofold: {1} holds more than one formula | {1} does not hold more than one formula
Faulted: the verbalizer fails on the formula of {1} with a fault of its own | the verbalizer does not fail on the formula of {1} with a fault of its own
Unsayable: the formula of {1} cannot be said in words | the formula of {1} can be said in words
Current: the [statement] of {1} is current | the [statement] of {1} is not current
Misread: the [statement] of {1} reads back as more or other than its formula | the [statement] of {1} reads back as its formula alone
Stale: the [statement] of {1} is stale | the [statement] of {1} is not stale
Unwritten: the [statement] of {1} is unwritten | the [statement] of {1} is not unwritten
Handwritten: the [statement] of {1} is handwritten | the [statement] of {1} is not handwritten
Reported: [checker](../canon/CANON.md#term-checker) reports the [statement] of {1} | [checker](../canon/CANON.md#term-checker) does not report the [statement] of {1}
Rewritten: [checker](../canon/CANON.md#term-checker) writes the [statement] of {1} when it generates | [checker](../canon/CANON.md#term-checker) does not write the [statement] of {1} when it generates
Explained: [checker](../canon/CANON.md#term-checker) says why the formula of {1} cannot be said | [checker](../canon/CANON.md#term-checker) does not say why the formula of {1} cannot be said
Worded: {1} keeps readings | {1} keeps no readings
Stated: {1} has a [statement](../canon/CANON.md#term-statement) | {1} has no [statement](../canon/CANON.md#term-statement)
noun Word: [word]
noun Signature: signature
Signature: {1} is a signature | {1} is not a signature
Field: {1} is a field of a signature | {1} is not a field of a signature
Predicate: {1} is a predicate | {1} is not a predicate
Undeclared: {1} is said by a reading and declared by nothing | {1} is said by no reading or is declared
Misplaced: {1} is declared in a unit that is not a term | {1} is not declared in a unit that is not a term
Apart: the reading of {1} is in another unit than its declaration | the reading of {1} is in the unit of its declaration
Unused: no claim, definition or fact uses {1} | a claim, a definition or a fact uses {1}
Flagged: [checker](../canon/CANON.md#term-checker) reports the [word] {1} | [checker](../canon/CANON.md#term-checker) does not report the [word] {1}
Introduce.rel: {1} declares {2} | {1} does not declare {2}
Voice.rel: a reading in {1} says {2} | no reading in {1} says {2}
Rely.rel: a claim, a definition or a fact of {1} uses {2} | no claim, definition or fact of {1} uses {2}
noun Scenario: [scenario]
Possible: {1} is a [scenario] that can happen while every held unit holds | {1} is not a [scenario] that can happen while every held unit holds
Impossible: {1} is a [scenario] that cannot happen while every held unit holds | {1} is not a [scenario] that cannot happen while every held unit holds
Raised: [checker](../canon/CANON.md#term-checker) reports that {1} cannot happen | [checker](../canon/CANON.md#term-checker) does not report that {1} cannot happen
Probe.rel: the author asks about leaving out {2} for {1} | the author does not ask about leaving out {2} for {1}
Frees.rel: leaving out {1} lets {2} happen | leaving out {1} does not let {2} happen
Blame.rel: [checker](../canon/CANON.md#term-checker) names {2} in its report of {1} | [checker](../canon/CANON.md#term-checker) does not name {2} in its report of {1}
noun Search: [search]
Trial: {1} leaves one unit out | {1} leaves no unit out
First: {1} is asked before any scenario is known to be impossible | {1} is not asked before any scenario is known to be impossible
Afterwards: {1} is asked after the first [search] is answered | {1} is not asked after the first [search] is answered
BareFormula: {1} holds a formula with no keyword | {1} holds no formula without a keyword
Held: the analyzer is asked to hold the formula of {1} | the analyzer is not asked to hold the formula of {1}
Contradicting: {1} is held with units that cannot all hold | {1} is held with units that can all hold
Named: [checker](../canon/CANON.md#term-checker) names {1} in its report of a contradiction | [checker](../canon/CANON.md#term-checker) does not name {1} in its report of a contradiction
Checked: the project lists {1} among the documents it checks | the project does not list {1} among the documents it checks
Pose.units: {1} requires {2} to hold | {1} does not require {2} to hold
Pose.scenario: {1} requires {2} to happen | {1} does not require {2} to happen
Leave.rel: {1} leaves out {2} | {1} does not leave out {2}
Share.rel: {1} shares a word with {2} | {1} shares no word with {2}
Chain.rel: {1} is linked to {2} through shared words | {1} is not linked to {2} through shared words
Together.rel: the analyzer is asked about {1} together with {2} | the analyzer is asked about {1} apart from {2}
Utter.rel: a block of {1} names {2} outside its declaration | no block of {1} names {2} outside its declaration
Picture.rel: a scenario of {1} names {2} | no scenario of {1} names {2}
Expose.rel: [checker](../canon/CANON.md#term-checker) reports the formula of {1} as lone on {2} | [checker](../canon/CANON.md#term-checker) does not report the formula of {1} as lone on {2}
Unchallenged: no other formula can contradict the formula of {1} | another formula can contradict the formula of {1}
loneOn: the formula of {1} is [lone](#term-lone-formula) on {2} | the formula of {1} is not lone on {2}
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

abstract sig Unit extends Thing {}

sig Axiom extends Unit {}

sig Fact extends Unit {}

sig Spec extends Claim {}

sig Exception extends Claim {}

sig Bug extends Claim {}

sig Conflict extends Unit {}

sig Thread extends Unit {}

sig Term extends Unit {}

one sig Sit { rel: Unit -> Unit }

one sig Derive { rel: Unit -> Unit }

pred cites[u, v: Unit] { u->v in Sit.rel or u->v in Derive.rel }

abstract sig Thing {}
sig Finding in Thing {}
fact finding_kinds { Finding = Freelancing + Misnesting + Untracking + Mistracking + OutdatedTracking + Unpairing + Unpinning + UnexplainedFailure + Untesting + Rotting + Uncitation + Misaiming + Overreach + Orphaning + Misanchoring + Misindexing + Mislocation + Cycle }

sig Freelancing in Finding {}

sig Misnesting in Finding {}

pred unfounded[u: Unit] {
  (u in Spec and (no a: Axiom | cites[u, a]) and (no s: Spec | cites[u, s]))
  or (u in Exception and (no s: Spec | cites[u, s]))
  or (u in Exception and (no f: Fact | cites[u, f]))
  or (u in Bug and (no s: Spec | cites[u, s]))
}

pred miscited[u: Unit] {
  (u in Axiom and (some v: Unit | cites[u, v] and v not in Axiom))
  or (u in Fact and (some v: Unit | cites[u, v]))
  or (u in Spec and (some v: Unit | cites[u, v] and v not in Axiom and v not in Spec and v not in Fact))
  or (u in Exception and (some v: Unit | cites[u, v] and v not in Spec and v not in Fact))
  or (u in Bug and (some v: Unit | cites[u, v] and v not in Spec))
  or (u in Conflict and (some v: Unit | cites[u, v]))
  or (u in Thread and (some v: Unit | cites[u, v]))
  or (u in Term and (some v: Unit | cites[u, v]))
}

one sig Depend { rel: Unit -> Unit }
fact depend_closure { Depend.rel = ^(Sit.rel + Derive.rel) }

pred circular[u: Unit] { some v: Unit | cites[u, v] and v->u in Depend.rel }

sig Cycle in Finding {}

sig Untracking in Finding {}

sig Mistracking in Finding {}

sig OutdatedTracking in Finding {}

sig Unpairing in Finding {}

sig Unpinning in Finding {}

sig UnexplainedFailure in Finding {}

sig Untesting in Finding {}

sig Rotting in Finding {}

sig Uncitation in Finding {}

sig Misaiming in Finding {}

sig Overreach in Finding {}

sig Orphaning in Finding {}

sig Misanchoring in Finding {}

sig Misindexing in Finding {}

sig Mislocation in Finding {}

abstract sig Claim extends Unit {}

pred refined[c: Claim] { (some s: Spec | s->c in Sit.rel) or (some e: Exception | e->c in Sit.rel) }

pred unguarded[c: Claim] { not refined[c] and not tested[c] }

pred adrift[t: Test] {
  (t in Declared and (no g: Tag | t->g in Carry.rel))
  or (t in Declared and (some u: Unit | checks[t, u] and u not in Claim))
  or (some c: Claim | checks[t, c] and refined[c])
}

abstract sig Test extends Thing {}

sig Declared in Test {}

abstract sig Pointer extends Thing {}

sig Target in Unit + Section + File {}
fact target_kinds { Target = Unit + Section + File }

sig Section {}

sig File {}

pred used[u: Unit] {
  (some v: Unit | v != u and cites[v, u])
  or (some p: Pointer | p->u in Name.pointer)
  or (some g: Tag | g->u in Name.tag)
}

sig Trailer {}

one sig Repeat { rel: Unit -> Unit }
fact repeats_another { no iden & Repeat.rel }

one sig Follow { rel: Trailer -> Unit }

sig Document extends Thing {}

sig Index {}

one sig Hold { units: Document -> Unit, indexes: Document -> Index, symbols: Source -> Site }

one sig Match { rel: Index -> Document }

sig Site {}

sig Source {}

sig Tag extends Thing {}

one sig Carry { rel: Test -> Tag }

sig PlainTest extends Test {}

sig ExpectedFailure extends Test {}

pred checks[t: Test, u: Unit] { some g: Tag | t->g in Carry.rel and g->u in Name.tag }

sig Issue {}

lone sig Tracker {}
sig Known, Closed in Issue {}
fact issues_are_the_trackers { no Tracker implies no Issue }

one sig Name {
  issue: (Bug + Conflict) -> Issue,
  between: Conflict -> Unit,
  tag: Tag -> Unit,
  pointer: Pointer -> Target,
  site: Claim -> Site
}

pred tested[u: Unit] {
  (some t: Test | checks[t, u])
  or (u in Spec and (some t: Test, b: Bug | checks[t, b] and cites[b, u]))
}

pred paired[c: Conflict] { some a, b: Unit | a != b and c->a in Name.between and c->b in Name.between }

pred hidden[x: Unit] {
  (x in Bug and ((some Tracker and (no i: Issue | x->i in Name.issue)) or (some i: Issue | x->i in Name.issue and i not in Known) or (some i: Issue | x->i in Name.issue and i in Closed) or (some Runner and not tested[x])))
  or (x in Conflict and ((some Tracker and (no i: Issue | x->i in Name.issue)) or (some i: Issue | x->i in Name.issue and i not in Known) or (some i: Issue | x->i in Name.issue and i in Closed) or not paired[x]))
}

pred misleading[t: Test] {
  (t in ExpectedFailure and (no b: Bug | checks[t, b]) and (no e: Exception | checks[t, e]))
  or (t in PlainTest and (some b: Bug | checks[t, b]))
}

sig Plugin {}
sig Installed, Missing, Unfound in Plugin {}
fact plugin_kinds { Plugin = Installed + Missing and no Installed & Missing }

sig Command {}
sig Core, Unknown in Command {}
one sig Add { rel: Plugin -> Command }

sig Block {}
sig Frontmatter in Block {}
sig Listing, Refused in Frontmatter {}
sig Unreadable in Document {}
one sig Head { rel: Document -> Frontmatter }
one sig Bare { rel: Document -> Document }

sig Entry {}
one sig Item { rel: Frontmatter -> Entry }
one sig Spell { rel: Entry -> Plugin }

pred lists[f: Frontmatter, p: Plugin] { some e: Entry | f->e in Item.rel and e->p in Spell.rel }

sig Misquoted, Foreign, Unclosed, Unterminated, Doubled, Dangling, Looping in Frontmatter {}

one sig Extend { rel: Document -> Document }
one sig Context { rel: Document -> Document }
fact context_is_another { no iden & Context.rel }

sig Stray in Frontmatter {}

sig Runner {}
fact tests_are_the_runners { no Runner implies no Test }

pred applies[p: Plugin, d: Document] { some f: Listing | d->f in Head.rel and lists[f, p] }

sig Run {}
sig Exits0, Exits1, Exits2 in Run {}
fact one_code { Run = Exits0 + Exits1 + Exits2 and no Exits0 & Exits1 and no Exits0 & Exits2 and no Exits1 & Exits2 }
sig Given in Document {}
one sig Ask { rel: Run -> Command }
fact one_command { all r: Run | one r.(Ask.rel) }
one sig Return { code0: Run -> Plugin, code1: Run -> Plugin, code2: Run -> Plugin }
fact one_code_per_plugin { no Return.code0 & Return.code1 and no Return.code0 & Return.code2 and no Return.code1 & Return.code2 }
pred stopped[r: Run] { (some f: Frontmatter, p: Missing | lists[f, p]) or (some d: Document | d in Unreadable) or (some c: Command | r->c in Ask.rel and not available[c]) }
one sig Over { rel: Plugin -> Document }

pred calls[r: Run, p: Plugin] {
  (some c: Command | r->c in Ask.rel and p->c in Add.rel)
  and (some d: Document | applies[p, d])
}

pred available[c: Command] {
  c in Core
  or (some p: Installed, d: Document | applies[p, d] and p->c in Add.rel)
}

sig Fence {}
sig Languaged, VocabularyWord, BoundsWord, ScenarioWord, VocabularyBlock, BoundsBlock, ScenarioBlock, UnitBlock, NoSecondWord in Fence {}
fact one_role { no VocabularyWord & BoundsWord and no VocabularyWord & ScenarioWord and no BoundsWord & ScenarioWord and NoSecondWord = Fence - VocabularyWord - BoundsWord - ScenarioWord and no VocabularyBlock & BoundsBlock and no VocabularyBlock & ScenarioBlock and no VocabularyBlock & UnitBlock and no BoundsBlock & ScenarioBlock and no BoundsBlock & UnitBlock and no ScenarioBlock & UnitBlock }
one sig Within { rel: Fence -> Unit }
one sig Blocks { rel: Unit -> Fence }

one sig GenerateCommand, CheckCommand, LogicCommand in Command {}

sig Logical, Generated, Differs, Unsayable, Wordless, Twofold, Faulted, Current, Stale, Unwritten, Handwritten, Reported, Rewritten, Explained, Misread in Unit {}
sig Worded in Document {}
sig Stated in Unit {}

sig Word {}
sig Signature, Field, Predicate, Undeclared, Misplaced, Apart, Unused, Flagged in Word {}
fact word_kinds { Word = Signature + Field + Predicate }
one sig Introduce { rel: Unit -> Word }
one sig Voice { rel: Unit -> Word }
one sig Rely { rel: Unit -> Word }

sig Scenario {}
sig Possible, Impossible, Raised in Scenario {}
fact possible { Possible = Scenario - Impossible }
one sig Probe { rel: Scenario -> Unit }
one sig Frees { rel: Unit -> Scenario }
one sig Blame { rel: Scenario -> Unit }

sig Search {}
sig Trial, First, Afterwards in Search {}
fact order { Search = First + Afterwards and no First & Afterwards }
sig BareFormula, Held, Contradicting, Named in Unit {}
one sig Pose { units: Search -> Unit, scenario: Search -> Scenario }
one sig Leave { rel: Search -> Unit }
sig Checked in Document {}

one sig Share { rel: Unit -> Unit }
one sig Chain { rel: Unit -> Unit }
one sig Together { rel: Unit -> Unit }
fact linked { Chain.rel = ^(Share.rel + ~(Share.rel)) }

one sig Utter { rel: Unit -> Word }
one sig Picture { rel: Unit -> Word }
one sig Expose { rel: Unit -> Word }
sig Unchallenged in Unit {}
pred loneOn[u: Unit, w: Word] { u->w in Rely.rel and (no v: Unit | v != u and v->w in Utter.rel) and (no v: Unit | v->w in Picture.rel) }
```
