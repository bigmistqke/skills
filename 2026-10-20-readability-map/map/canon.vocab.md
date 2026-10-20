# Vocabulary

## Readings

Each line `word: positive | negative` gives the English of a word; {1}, {2} are its arguments in order.

```text
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
Installed: {1} is a [plugin] that the project has installed | {1} is not a [plugin] that the project has installed
noun Missing: [missing plugin]
Missing: {1} is a [plugin] that the project lacks | {1} is not a [plugin] that the project lacks
Unfound: [checker](#term-checker) reports that the project lacks {1} | [checker](#term-checker) does not report that the project lacks {1}
noun Command: [command]
Core: {1} is a [command] that the [checker](#term-checker) has of its own | {1} is not a [command] that the [checker](#term-checker) has of its own
Unknown: [checker](#term-checker) reports {1} as an unknown [command] | [checker](#term-checker) does not report {1} as an unknown [command]
Add.rel: {1} adds {2} | {1} does not add {2}
noun Block: [block]
noun Frontmatter: [frontmatter]
Frontmatter: {1} is a [frontmatter] | {1} is not a [frontmatter]
noun Listing: [listing frontmatter]
Listing: {1} is a [frontmatter] with a plugins key | {1} is not a [frontmatter] with a plugins key
noun Refused: [refused frontmatter]
Refused: {1} is a [frontmatter] that the [checker](#term-checker) cannot read | {1} is not a [frontmatter] that the [checker](#term-checker) cannot read
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
Given: the command line of a [run](#term-run) names {1} | the command line of a [run](#term-run) does not name {1}
Ask.rel: {1} asks for {2} | {1} does not ask for {2}
Return.code0: {1} gets code 0 from {2} | {1} does not get code 0 from {2}
Return.code1: {1} gets code 1 from {2} | {1} does not get code 1 from {2}
Return.code2: {1} gets code 2 from {2} | {1} does not get code 2 from {2}
Over.rel: [checker](#term-checker) runs {1} over {2} | [checker](#term-checker) does not run {1} over {2}
calls: {1} [calls] {2} | {1} does not [call] {2}
available: {1} is [available] | {1} is not [available]



noun Fence: [fence]
Languaged: {1} is a [fence] that names a language | {1} is a [fence] that names no language
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
```

## Declarations and definitions (Alloy 6)

```alloy
abstract sig Unit extends Thing {}

sig Axiom extends Unit {}

sig Fact extends Unit {}

sig Spec extends Claim {}

sig Exception extends Claim {}

sig Bug extends Claim {}

sig Conflict extends Unit {}

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
  (some v: Unit | v != u and v->u in Sit.rel)
  or (some p: Pointer | p->u in Name.pointer)
  or (some g: Tag | g->u in Name.tag)
}

sig Trailer {}

one sig Repeat { rel: Unit -> Unit }

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
  or (u in Spec and (some t: Test, b: Bug | checks[t, b] and b->u in Sit.rel))
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

sig Stray in Frontmatter {}

sig Runner {}
fact tests_are_the_runners { no Runner implies no Test }

pred applies[p: Plugin, d: Document] { some f: Listing | d->f in Head.rel and lists[f, p] }

sig Run {}
sig Exits0, Exits1, Exits2 in Run {}
fact one_code { Run = Exits0 + Exits1 + Exits2 and no Exits0 & Exits1 and no Exits0 & Exits2 and no Exits1 & Exits2 }
sig Given in Document {}
one sig Ask { rel: Run -> Command }
one sig Return { code0: Run -> Plugin, code1: Run -> Plugin, code2: Run -> Plugin }
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
```
