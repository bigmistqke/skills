## s035 (canon)

Formula:
```alloy
all b: Bug | (some i: Issue | b->i in Name.issue and i not in Known) implies b in Mistracking
```

Words:
```text
For every bug:

when the bug names an issue that tracker does not know, checker reports a mistracking for the bug.
```

## s135 (canon-plugin-alloy)

Formula:
```alloy
all r: Run, c: GenerateCommand, u: Unit | (r->c in Ask.rel and u in Unsayable) implies (u in Explained and r not in Exits0)
```

Words:
```text
For every run and every generate command and every unit:

when the run asks for the generate command and the formula of the unit cannot be said in words, checker says why the formula of the unit cannot be said and the run does not exit with code 0.
```

## s011 (canon)

Formula:
```alloy
pred hidden[x: Unit] {
  (x in Bug and ((some Tracker and (no i: Issue | x->i in Name.issue)) or (some i: Issue | x->i in Name.issue and i not in Known) or (some i: Issue | x->i in Name.issue and i in Closed) or (some Runner and not tested[x])))
  or (x in Conflict and ((some Tracker and (no i: Issue | x->i in Name.issue)) or (some i: Issue | x->i in Name.issue and i not in Known) or (some i: Issue | x->i in Name.issue and i in Closed) or not paired[x]))
}
```

Words:
```text
For every unit:

the unit is hidden exactly when at least one of these holds:
- all of these hold:
  - the unit is a bug
  - at least one of these holds:
    - project has a tracker and the unit names no issue
    - the unit names an issue that tracker does not know
    - the unit names an issue that tracker has closed
    - project has a runner and the unit is not tested
- all of these hold:
  - the unit is a conflict
  - at least one of these holds:
    - project has a tracker and the unit names no issue
    - the unit names an issue that tracker does not know
    - the unit names an issue that tracker has closed
    - the unit is not paired
```

## s040 (canon)

Formula:
```alloy
all c: Conflict | (some i: Issue | c->i in Name.issue and i not in Known) implies c in Mistracking
```

Words:
```text
For every conflict:

when the conflict names an issue that tracker does not know, checker reports a mistracking for the conflict.
```

## s074 (canon)

Formula:
```alloy
all r: Run | ((some f: Frontmatter, p: Missing | lists[f, p]) or (some d: Document | d in Unreadable) or (some c: Command | r->c in Ask.rel and not available[c]) or (some p: Plugin | r->p in Return.code2)) implies r in Exits2
```

Words:
```text
For every run:

when at least one of these holds:
- there are frontmatter_1 and missing_plugin_1 such that frontmatter_1 lists missing_plugin_1
- there is a document such that checker reports that the document has a frontmatter it cannot read
- the run asks for a command that is not available
- the run gets code 2 from a plugin

then the run exits with code 2.
```

## s085 (canon)

Formula:
```alloy
all f: Unclosed | f in Refused
```

Words:
```text
For every unclosed frontmatter:

the unclosed frontmatter is a frontmatter that the checker cannot read.
```

## s030 (canon)

Formula:
```alloy
all t: Term | (some u: Unit | cites[t, u]) implies t in Misnesting
```

Words:
```text
For every term:

when the term cites a unit, checker reports a misnesting for the term.
```

## s028 (canon)

Formula:
```alloy
all b: Bug | (some u: Unit | cites[b, u] and u not in Spec) implies b in Misnesting
```

Words:
```text
For every bug:

when the bug cites a unit that is not a spec, checker reports a misnesting for the bug.
```

## s059 (canon)

Formula:
```alloy
all c: Claim | (some s: Site | c->s in Name.site and (no r: Source | r->s in Hold.symbols)) implies c in Mislocation
```

Words:
```text
For every claim:

when the claim names a site that no source holds, checker reports a mislocation for the claim.
```

## s001 (canon)

Formula:
```alloy
pred unfounded[u: Unit] {
  (u in Spec and (no a: Axiom | cites[u, a]) and (no s: Spec | cites[u, s]))
  or (u in Exception and (no s: Spec | cites[u, s]))
  or (u in Exception and (no f: Fact | cites[u, f]))
  or (u in Bug and (no s: Spec | cites[u, s]))
}
```

Words:
```text
For every unit:

the unit is unfounded exactly when the unit is one of these:
- a spec that cites no axiom and cites no spec
- an exception that cites no spec or cites no fact
- a bug that cites no spec
```

## s073 (canon)

Formula:
```alloy
all u: Unit | no Tracker implies u not in Untracking
```

Words:
```text
For every unit:

when project has no tracker, checker reports no untracking for the unit.
```

## s022 (canon)

Formula:
```alloy
all b: Bug | (no s: Spec | cites[b, s]) implies b in Freelancing
```

Words:
```text
For every bug:

when the bug cites no spec, checker reports a freelancing for the bug.
```

## s008 (canon)

Formula:
```alloy
pred checks[t: Test, u: Unit] { some g: Tag | t->g in Carry.rel and g->u in Name.tag }
```

Words:
```text
For every test and every unit:

the test checks the unit exactly when the test carries a tag that names the unit.
```

## s041 (canon)

Formula:
```alloy
all c: Conflict | (some i: Issue | c->i in Name.issue and i in Closed) implies c in OutdatedTracking
```

Words:
```text
For every conflict:

when the conflict names an issue that tracker has closed, checker reports an outdated tracking for the conflict.
```

## s132 (canon-plugin-alloy)

Formula:
```alloy
all u: Unit | u in Current implies u not in Reported
```

Words:
```text
For every unit:

when the statement of the unit is current, checker does not report the statement of the unit.
```

## s049 (canon)

Formula:
```alloy
all t: Test | adrift[t] implies t in Finding
```

Words:
```text
For every test:

when the test is adrift, checker reports a finding for the test.
```

## s149 (canon-plugin-alloy)

Formula:
```alloy
all s: Search | s in First implies s not in Trial
```

Words:
```text
For every search:

when the search is asked before any scenario is known to be impossible, the search leaves no unit out.
```

## s036 (canon)

Formula:
```alloy
all b: Bug | (some i: Issue | b->i in Name.issue and i in Closed) implies b in OutdatedTracking
```

Words:
```text
For every bug:

when the bug names an issue that tracker has closed, checker reports an outdated tracking for the bug.
```

## s095 (canon)

Formula:
```alloy
all f: Frontmatter, p: Missing | lists[f, p] implies p in Unfound
```

Words:
```text
For every frontmatter and every missing plugin:

when the frontmatter lists the missing plugin, checker reports that the project lacks the missing plugin.
```

## s099 (canon)

Formula:
```alloy
all r: Run, c: Command | (r->c in Ask.rel and not available[c]) implies r in Exits2
```

Words:
```text
For every run and every command:

when the run asks for the command and the command is not available, the run exits with code 2.
```

## s103 (canon)

Formula:
```alloy
all r: Run | (some p: Plugin | r->p in Return.code2) implies r in Exits2
```

Words:
```text
For every run:

when the run gets code 2 from a plugin, the run exits with code 2.
```

## s174 (canon-plugin-alloy)

Formula:
```alloy
all u: Term, w: Word | u->w not in Expose.rel
```

Words:
```text
For every term and every word:

checker does not report the formula of the term as lone on the word.
```

## s134 (canon-plugin-alloy)

Formula:
```alloy
all r: Run, c: GenerateCommand, u: Unit | (r->c in Ask.rel and u in Handwritten) implies (u in Reported and r not in Exits0)
```

Words:
```text
For every run and every generate command and every unit:

when the run asks for the generate command and the statement of the unit is handwritten, checker reports the statement of the unit and the run does not exit with code 0.
```

## s047 (canon)

Formula:
```alloy
all c: Claim | (some Runner and unguarded[c]) implies c in Untesting
```

Words:
```text
For every claim:

when project has a runner and the claim is unguarded, checker reports an untesting for the claim.
```

## s117 (canon-plugin-alloy)

Formula:
```alloy
all u: Unit | (u in Logical and u not in Stated and u not in Unsayable) implies u in Unwritten
```

Words:
```text
For every unit:

when all of these hold:
- the unit holds a formula
- the unit has no statement
- the formula of the unit can be said in words

then the statement of the unit is unwritten.
```

## s211 (naturalloy)

Formula:
```alloy
all f: Series | f in TimeFirst implies f in ThenOwnLine
```

Words:
```text
For every list:

when the list is a rule whose first side begins with a time phrase, verbalizer says the list with "then" at the start of the second side, on a line of its own.
```

## s121 (canon-plugin-alloy)

Formula:
```alloy
all u: Unit | (u in Wordless or u in Twofold) implies u in Unsayable
```

Words:
```text
For every unit:

when at least one of these holds:
- the formula of the unit names a word that has no reading
- the unit holds more than one formula

then the formula of the unit cannot be said in words.
```

## s119 (canon-plugin-alloy)

Formula:
```alloy
all u: Unit | (u in Generated and u not in Differs and u not in Unsayable) implies u in Current
```

Words:
```text
For every unit:

when all of these hold:
- the statement of the unit sits between the markers of a generated region
- the statement of the unit does not differ from what its formula says
- the formula of the unit can be said in words

then the statement of the unit is current.
```

## s004 (canon)

Formula:
```alloy
pred refined[c: Claim] { (some s: Spec | s->c in Sit.rel) or (some e: Exception | e->c in Sit.rel) }
```

Words:
```text
For every claim:

the claim is refined exactly when a spec sits in the claim or an exception sits in the claim.
```

## s209 (naturalloy)

Formula:
```alloy
all f: Series | (f in OneLineRule and f not in TimeFirst and f in TimeSecond) implies f in KeepsThen
```

Words:
```text
For every list:

when all of these hold:
- the list is a rule whose two sides are each one clause
- the list is not a rule whose first side begins with a time phrase
- the list is a rule whose second side begins with a time phrase

then verbalizer says the list with "then" before the time phrase.
```

## s088 (canon)

Formula:
```alloy
all f: Dangling | f in Refused
```

Words:
```text
For every dangling frontmatter:

the dangling frontmatter is a frontmatter that the checker cannot read.
```

## s089 (canon)

Formula:
```alloy
all f: Looping | f in Refused
```

Words:
```text
For every circular frontmatter:

the circular frontmatter is a frontmatter that the checker cannot read.
```

## s064 (canon)

Formula:
```alloy
all f: Fence | f in BoundsWord implies f in BoundsBlock
```

Words:
```text
For every fence:

when the second word of the fence is bounds, the fence has the role of bounds.
```

## s090 (canon)

Formula:
```alloy
all f: Stray | f in Refused
```

Words:
```text
For every stray frontmatter:

the stray frontmatter is a frontmatter that the checker cannot read.
```

## s029 (canon)

Formula:
```alloy
all c: Conflict | (some u: Unit | cites[c, u]) implies c in Misnesting
```

Words:
```text
For every conflict:

when the conflict cites a unit, checker reports a misnesting for the conflict.
```

## s021 (canon)

Formula:
```alloy
all e: Exception | (no f: Fact | cites[e, f]) implies e in Freelancing
```

Words:
```text
For every exception:

when the exception cites no fact, checker reports a freelancing for the exception.
```

## s148 (canon-plugin-alloy)

Formula:
```alloy
all u: Unit | u in BareFormula implies u in Held
```

Words:
```text
For every unit:

when the unit holds a formula with no keyword, the analyzer is asked to hold the formula of the unit.
```

## s044 (canon)

Formula:
```alloy
all x: ExpectedFailure | ((no b: Bug | checks[x, b]) and (no e: Exception | checks[x, e])) implies x in UnexplainedFailure
```

Words:
```text
For every expected failure:

when the expected failure checks no bug and checks no exception, checker reports an unexplained failure for the expected failure.
```

## s037 (canon)

Formula:
```alloy
all b: Bug | (some Runner and not tested[b]) implies b in Untesting
```

Words:
```text
For every bug:

when project has a runner and the bug is not tested, checker reports an untesting for the bug.
```

## s076 (canon)

Formula:
```alloy
all p: Plugin, d: Document | ((no f: Listing | d->f in Head.rel) and d not in Given) implies p->d not in Over.rel
```

Words:
```text
For every plugin and every document:

when the document starts with no listing frontmatter and the command line of a run does not name the document, checker does not run the plugin over the document.
```
