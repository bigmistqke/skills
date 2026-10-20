## s039 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all c: Conflict | (some Tracker and (no i: Issue | c->i in Name.issue)) implies c in Untracking
```

Current words:
```text
For every conflict:

when project has a tracker and the conflict names no issue, checker reports an untracking for the conflict.
```
Haiku read it as (differs): `all c: Conflict | ((some Tracker and (no i: Issue | c->i in Name.issue)) or (some i: Issue | c->i in Name.issue and i not in Known)) implies c in Untracking`

Ideal prose:
```text
When the project has a tracker, checker reports an untracking for every conflict that names no issue.
```
Haiku read it as (same): `(some Tracker) implies (all c: Conflict | (no i: Issue | c->i in Name.issue) implies c in Untracking)`

## s075 — HELPED (ideal read right, current read wrong)

Original formula:
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
Haiku read it as (differs): `all p: Plugin, d: Document | (applies[p, d] iff ((some c: Command | (some r: Run | r->c in Ask.rel) and c not in Given) and applies[p, d]))`

Ideal prose:
```text
The checker runs every plugin over every document it applies to, and runs a plugin over a document it does not apply to only when the command line of a run names that document.
```
Haiku read it as (same): `(all p: Plugin, d: Document | applies[p, d] implies p->d in Over.rel) and (all p: Plugin, d: Document | (p->d in Over.rel and not applies[p, d]) implies d in Given)`

## s076 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all p: Plugin, d: Document | ((no f: Listing | d->f in Head.rel) and d not in Given) implies p->d not in Over.rel
```

Current words:
```text
For every plugin and every document:

when the document starts with no listing frontmatter and the command line of a run does not name the document, checker does not run the plugin over the document.
```
Haiku read it as (same): `all p: Plugin, d: Document | ((no f: Listing | d->f in Head.rel) and (d not in Given)) implies p->d not in Over.rel`

Ideal prose:
```text
When a document starts with no listing frontmatter and the command line of a run does not name it, the checker runs no plugin over it.
```
Haiku read it as (differs): `all d: Document, r: Run | (no f: Listing | d->f in Head.rel) and (d not in Given) implies (no p: Plugin | p->d in Over.rel)`

## s111 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
some c: Conflict, i: Issue, u, v: Unit | u != v and c->i in Name.issue and i in Known and i not in Closed and c->u in Name.between and c->v in Name.between and c not in Finding
```

Current words:
```text
It must be possible that:

There are conflict_1 and issue_1 and unit_1 and unit_2 such that all of these hold:
- unit_1 and unit_2 are different
- conflict_1 names issue_1
- tracker knows issue_1
- tracker has not closed issue_1
- conflict_1 names unit_1
- conflict_1 names unit_2
- checker reports no finding for conflict_1
```
Haiku read it as (differs): `some unit_1, unit_2: Unit, conflict_1: Conflict, issue_1: Issue | (unit_1 != unit_2 and conflict_1->issue_1 in Name.issue and issue_1 in Known and issue_1 not in Closed and conflict_1->unit_1 in Name.between and conflict_1->unit_2 in Name.between and no Finding)`

Ideal prose:
```text
It must be possible that a conflict names two different units and an issue that tracker knows and has not closed, and checker reports no finding for the conflict.
```
Haiku read it as (same): `some c: Conflict, u1: Unit, u2: Unit, i: Issue | u1 != u2 and c->u1 in Name.between and c->u2 in Name.between and c->i in Name.issue and i in Known and i not in Closed and c not in Finding`

## s113 — HELPED (ideal read right, current read wrong)

Original formula:
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
Haiku read it as (differs): `some r: Run, p: Plugin, d: Document, f: Listing | (d->f in Head.rel) and (lists[f, p]) and (p->d in Over.rel) and (calls[r, p]) and (r->p in Return.code1) and (r in Exits1)`

Ideal prose:
```text
It must be possible that a document starts with a listing frontmatter that lists an installed plugin, checker runs the plugin over the document, and a run calls the plugin, gets code 1 from it, and exits with code 1.
```
Haiku read it as (same): `some d: Document, l: Listing, p: Plugin, r: Run | d->l in Head.rel and lists[l, p] and p in Installed and p->d in Over.rel and calls[r, p] and r->p in Return.code1 and r in Exits1`

## s135 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all r: Run, c: GenerateCommand, u: Unit | (r->c in Ask.rel and u in Unsayable) implies (u in Explained and r not in Exits0)
```

Current words:
```text
For every run and every generate command and every unit:

when the run asks for the generate command and the formula of the unit cannot be said in words, checker says why the formula of the unit cannot be said and the run does not exit with code 0.
```
Haiku read it as (differs): `all r: Run, g: GenerateCommand, u: Unit | (r->g in Ask.rel and u in Unsayable and u in Explained) implies r not in Exits0`

Ideal prose:
```text
When a run asks for a generate command, the checker says why the formula of each unit that cannot be said in words cannot be said, and if there is such a unit, the run does not exit with code 0.
```
Haiku read it as (same): `all r: Run | r->GenerateCommand in Ask.rel implies ((all u: Unit | u in Unsayable implies u in Explained) and ((some u: Unit | u in Unsayable) implies r not in Exits0))`

## s147 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
(all u: Unit | u in Contradicting implies u in Named) and (all c: Scenario | c in Impossible implies c in Raised)
```

Current words:
```text
All of these hold:
- for every unit_1:

  when unit_1 is held with units that cannot all hold, checker names unit_1 in its report of a contradiction
- for every scenario_1:

  when scenario_1 is a scenario that cannot happen while every held unit holds, checker reports that scenario_1 cannot happen.
```
Haiku read it as (differs): `all u: Unit | u in Contradicting implies u in Named and all s: Scenario | s in Impossible implies s in Raised`

Ideal prose:
```text
The checker names every unit that is held with units that cannot all hold in its report of a contradiction, and for every scenario that cannot happen while every held unit holds, it reports that the scenario cannot happen.
```
Haiku read it as (same): `(all u: Unit | u in Contradicting implies u in Named) and (all s: Scenario | s in Impossible implies s in Raised)`

## s149 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all s: Search | s in First implies s not in Trial
```

Current words:
```text
For every search:

when the search is asked before any scenario is known to be impossible, the search leaves no unit out.
```
Haiku read it as (differs): `all s: Search | s in First implies (no u: Unit | s->u in Leave.rel)`

Ideal prose:
```text
Every search asked before any scenario is known to be impossible leaves no unit out.
```
Haiku read it as (same): `all s: Search | s in First implies s not in Trial`

## s160 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all u: Unit, v: Unit | u->v in Share.rel implies u->v in Together.rel
```

Current words:
```text
For every unit_1 and every unit_2:

when unit_1 shares a word with unit_2, the analyzer is asked about unit_1 together with unit_2.
```
Haiku read it as (same): `all u1: Unit, u2: Unit | u1->u2 in Share.rel implies u1->u2 in Together.rel`

Ideal prose:
```text
When one unit shares a word with another, the analyzer is asked about the first together with the second.
```
Haiku read it as (differs): `all u1, u2: Unit | ((u1->u2 in Share.rel) or (u2->u1 in Share.rel)) implies ((u1->u2 in Together.rel) or (u2->u1 in Together.rel))`

## s173 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all u: Unit, w: Word | w not in Signature implies u->w not in Expose.rel
```

Current words:
```text
For every unit and every word:

when the word is not a signature, checker does not report the formula of the unit as lone on the word.
```
Haiku read it as (same): `all u: Unit, w: Word | (w not in Signature) implies (u->w not in Expose.rel)`

Ideal prose:
```text
The checker never reports the formula of a unit as lone on a word that is not a signature.
```
Haiku read it as (differs): `all u: Unit, w: Word | w not in Signature implies not loneOn[u, w]`

## s078 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all p: Plugin, d: Document, f: Listing | (d->f in Head.rel and not lists[f, p] and d not in Given) implies p->d not in Over.rel
```

Current words:
```text
For every plugin and every document and every listing frontmatter:

when all of these hold:
- the document starts with the listing frontmatter
- the listing frontmatter does not list the plugin
- the command line of a run does not name the document

then checker does not run the plugin over the document.
```
Haiku read it as (same): `all p: Plugin, d: Document, l: Listing | d->l in Head.rel and not lists[l, p] and d not in Given implies not (p->d in Over.rel)`

Ideal prose:
```text
Checker does not run a plugin over a document that starts with a listing frontmatter that does not list the plugin, unless the command line of a run names the document.
```
Haiku read it as (differs): `all d: Document, p: Plugin | ((some l: Listing | d->l in Head.rel and not lists[l, p]) and (no r: Run | d in Given)) implies not (p->d in Over.rel)`

## s138 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all u: Unit, w: Word | (u->w in Voice.rel and (some v: Unit | v->w in Introduce.rel) and u->w not in Introduce.rel) implies w in Apart
```

Current words:
```text
For every unit_1 and every word_1:

when all of these hold:
- a reading in unit_1 says word_1
- a unit declares word_1
- unit_1 does not declare word_1

then word_1 is a word whose reading is in another unit than its declaration.
```
Haiku read it as (same): `all u1: Unit, w: Word | (u1->w in Voice.rel and (some u2: Unit | u2->w in Introduce.rel) and u1->w not in Introduce.rel) implies w in Apart`

Ideal prose:
```text
If a reading in a unit says a word that is declared, but not by that unit, then the word is a word whose reading is in another unit than its declaration.
```
Haiku read it as (differs): `all u: Unit, w: Word | (some v: Unit | u->w in Voice.rel and v->w in Introduce.rel and v != u) implies w in Apart`

## s174 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all u: Term, w: Word | u->w not in Expose.rel
```

Current words:
```text
For every term and every word:

checker does not report the formula of the term as lone on the word.
```
Haiku read it as (differs): `all t: Term, w: Word | not loneOn[t, w]`

Ideal prose:
```text
The checker never reports the formula of a term as lone on any word.
```
Haiku read it as (same): `all t: Term, w: Word | not (t->w in Expose.rel)`

## s098 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all r: Run, c: Command | (r->c in Ask.rel and not available[c]) implies c in Unknown
```

Current words:
```text
For every run and every command_1:

when the run asks for command_1 and command_1 is not available, checker reports command_1 as an unknown command.
```
Haiku read it as (same): `all r: Run, c: Command | (r->c in Ask.rel and not available[c]) => c in Unknown`

Ideal prose:
```text
When a run asks for a command that is not available, checker reports the command as an unknown command.
```
Haiku read it as (differs): `all r: Run, c: Command | (r->c in Ask.rel and not available[c]) implies r in Unknown`

## s108 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all d, e: Document | d->e in Bare.rel implies ((e in Finding implies d in Finding) and (d in Finding implies e in Finding))
```

Current words:
```text
For every document_1 and every document_2:

when document_1 is document_2 without its frontmatter,

then all of these hold:
- when checker reports a finding for document_2, checker reports a finding for document_1
- when checker reports a finding for document_1, checker reports a finding for document_2
```
Haiku read it as (same): `all d1: Document | all d2: Document | (d1->d2 in Bare.rel) => ((d2 in Finding => d1 in Finding) and (d1 in Finding => d2 in Finding))`

Ideal prose:
```text
When a document is another document without its frontmatter, the checker reports a finding for one exactly when it reports a finding for the other.
```
Haiku read it as (differs): `all d1, d2: Document | d1->d2 in Bare.rel implies (Finding & Hold.units[d1]) = (Finding & Hold.units[d2])`

## s110 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
some b: Bug, x: ExpectedFailure, i: Issue | b->i in Name.issue and i in Known and i not in Closed and checks[x, b] and b not in Finding and x not in Finding
```

Current words:
```text
It must be possible that:

There are bug_1 and expected_failure_1 and issue_1 such that all of these hold:
- bug_1 names issue_1
- tracker knows issue_1
- tracker has not closed issue_1
- expected_failure_1 checks bug_1
- checker reports no finding for bug_1
- checker reports no finding for expected_failure_1
```
Haiku read it as (same): `some b: Bug, e: ExpectedFailure, i: Issue | (b->i in Name.issue and i in Known and i not in Closed and checks[e, b] and b not in Finding and e not in Finding)`

Ideal prose:
```text
It must be possible that a bug names an issue the tracker knows and has not closed, an expected failure checks that bug, and the checker reports no finding for the bug or for the expected failure.
```
Haiku read it as (differs): `some b: Bug, e: Test, i: Issue | (b->i in Name.issue and i in Known and i not in Closed and e in ExpectedFailure and checks[e, b] and no Finding)`

## s122 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all u: Unit | u in Wordless implies u in Unsayable
```

Current words:
```text
For every unit:

when the formula of the unit names a word that has no reading, the formula of the unit cannot be said in words.
```
Haiku read it as (same): `all u: Unit | u in Wordless => u in Unsayable`

Ideal prose:
```text
When the formula of a unit names a word that has no reading, that formula cannot be said in words.
```
Haiku read it as (differs): `all u: Unit | (u in Wordless and u in Stated) implies u in Unsayable`

## s134 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all r: Run, c: GenerateCommand, u: Unit | (r->c in Ask.rel and u in Handwritten) implies (u in Reported and r not in Exits0)
```

Current words:
```text
For every run and every generate command and every unit:

when the run asks for the generate command and the statement of the unit is handwritten, checker reports the statement of the unit and the run does not exit with code 0.
```
Haiku read it as (same): `all r: Run, u: Unit | (r->GenerateCommand in Ask.rel and u in Handwritten) => (u in Reported and r not in Exits0)`

Ideal prose:
```text
When a run asks for a generate command, checker reports every handwritten statement of a unit, and if there is one, the run does not exit with code 0.
```
Haiku read it as (differs): `all r: Run | (r in GenerateCommand and some u: Unit | u in Handwritten and u in Reported) implies r not in Exits0`

## s144 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all w: Word | (w in Undeclared or w in Misplaced or w in Apart or w in Unused) implies w in Flagged
```

Current words:
```text
For every word_1:

when at least one of these holds:
- word_1 is a word that a reading says and nothing declares
- word_1 is a word declared in a unit that is not a term
- word_1 is a word whose reading is in another unit than its declaration
- word_1 is a word that no claim, definition or fact uses

then checker reports the word word_1.
```
Haiku read it as (differs): `all w: Word | ((some u: Unit | u->w in Voice.rel and (no u2: Unit | u2->w in Introduce.rel)) or (some u: Unit | u->w in Introduce.rel and u not in Term) or (some u1, u2: Unit | u1->w in Voice.rel and u2->w in Introduce.rel and u1 != u2) or (no u: Unit | u->w in Rely.rel)) => w in Flagged`

Ideal prose:
```text
Checker reports a word when any of these holds:
- a reading says it and nothing declares it
- it is declared in a unit that is not a term
- its reading is in another unit than its declaration
- no claim, definition or fact uses it
```
Haiku read it as (same): `all w: Word | ((w in Undeclared) or (w in Misplaced) or (w in Apart) or (w in Unused)) implies w in Flagged`

## s197 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all f: Quantifier | f in NoWithAnother implies f in InFull
```

Current words:
```text
For every quantifier_1:

when quantifier_1 is a quantifier that says no variable differs from another and holds a condition, verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```
Haiku read it as (differs): `all q: Quantifier | (q in NoWithAnother and q in VariableWithCondition) => q in InFull`

Ideal prose:
```text
When a quantifier says no variable differs from another and holds a condition, the verbalizer says it in full, with "there is" and the numbered name.
```
Haiku read it as (same): `all q: Quantifier | q in NoWithAnother implies q in InFull`

## s019 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all s: Spec | ((no a: Axiom | cites[s, a]) and (no t: Spec | cites[s, t])) implies s in Freelancing
```

Current words:
```text
For every spec_1:

when spec_1 cites no axiom and cites no spec, checker reports a freelancing for spec_1.
```
Haiku read it as (same): `all spec_1: Spec | ((no a: Axiom | cites[spec_1, a]) and (no s: Spec | cites[spec_1, s])) implies spec_1 in Freelancing`

Ideal prose:
```text
Checker reports a freelancing for every spec that cites neither an axiom nor a spec.
```
Haiku read it as (differs): `all s: Spec | (no a: Axiom | cites[s, a]) and (no sp: Spec | cites[s, sp]) implies (some Freelancing)`

## s031 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all u: Unit | circular[u] implies u in Cycle
```

Current words:
```text
For every unit:

when the unit is circular, checker reports a cycle for the unit.
```
Haiku read it as (same): `all u: Unit | circular[u] implies u in Cycle`

Ideal prose:
```text
The checker reports a cycle for every circular unit.
```
Haiku read it as (differs): `all u: Unit | circular[u] implies (some Cycle)`

## s043 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all t: Test | misleading[t] implies t in Finding
```

Current words:
```text
For every test:

when the test is misleading, checker reports a finding for the test.
```
Haiku read it as (same): `all t: Test | misleading[t] implies t in Finding`

Ideal prose:
```text
Checker reports a finding for every misleading test.
```
Haiku read it as (differs): `all t: Test | misleading[t] implies (some Finding)`

## s055 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all u: Unit | (not used[u] and u not in Conflict) implies u in Orphaning
```

Current words:
```text
For every unit:

when the unit is not used and is not a conflict, checker reports an orphaning for the unit.
```
Haiku read it as (same): `all u: Unit | (not used[u] and u not in Conflict) implies u in Orphaning`

Ideal prose:
```text
Checker reports an orphaning for every unit that is not used and is not a conflict.
```
Haiku read it as (differs): `all u: Unit | (not used[u] and u not in Conflict) implies (some Orphaning)`

## s067 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all f: Fence, u: Unit | f->u in Within.rel implies (no v: Unit | v->u in Sit.rel and v->f in Blocks.rel)
```

Current words:
```text
For every fence and every unit_1:

when the fence lies in the own text of unit_1, checker reads the fence as a block of no unit that sits in unit_1.
```
Haiku read it as (differs): `all f: Fence, u1: Unit | f->u1 in Within.rel implies u1->f in Blocks.rel`

Ideal prose:
```text
Checker never reads a fence that lies in a unit's own text as a block of a unit that sits in that unit.
```
Haiku read it as (same): `all f: Fence, u1, u2: Unit | (f->u1 in Within.rel and u2->u1 in Sit.rel) implies not (u2->f in Blocks.rel)`

## s079 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all p: Plugin, d: Document, f: Listing | (d->f in Head.rel and (no e: Entry | f->e in Item.rel) and d not in Given) implies p->d not in Over.rel
```

Current words:
```text
For every plugin and every document and every listing frontmatter:

when all of these hold:
- the document starts with the listing frontmatter
- the listing frontmatter holds no entry
- the command line of a run does not name the document

then checker does not run the plugin over the document.
```
Haiku read it as (differs): `all p: Plugin, d: Document, l: Listing | (d->l in Head.rel and (no e: Entry | l->e in Item.rel) and (no r: Run | d in Given)) implies not (p->d in Over.rel)`

Ideal prose:
```text
When a document starts with a listing frontmatter that holds no entry, and the command line of a run does not name the document, checker runs no plugin over the document.
```
Haiku read it as (same): `all d: Document, lf: Listing | (d->lf in Head.rel and (no e: Entry | lf->e in Item.rel) and d not in Given) implies (no p: Plugin | p->d in Over.rel)`

## s091 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all r: Run, d: Document, f: Refused | d->f in Head.rel implies (d in Unreadable and r in Exits2)
```

Current words:
```text
For every run and every document and every refused frontmatter:

when the document starts with the refused frontmatter,

then all of these hold:
- checker reports that the document has a frontmatter it cannot read
- the run exits with code 2
```
Haiku read it as (same): `all r: Run, d: Document, f: Refused | d->f in Head.rel implies (d in Unreadable and r in Exits2)`

Ideal prose:
```text
When a document starts with a refused frontmatter, checker reports that the document has a frontmatter it cannot read, and every run exits with code 2.
```
Haiku read it as (differs): `all d: Document, rf: Refused | (d->rf in Head.rel) implies ((d in Unreadable) and (all r: Run | r in Exits2))`

## s163 — HURT (current read right, ideal read wrong)

Original formula:
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
Haiku read it as (same): `all r: Run, lc: LogicCommand | (r->lc in Ask.rel and ((some sc: Scenario | sc in Raised) or (some u1: Unit | u1 in Contradicting))) implies r not in Exits0`

Ideal prose:
```text
A run that asks for a logic command does not exit with code 0 if the checker reports that some scenario cannot happen, or if some unit is held with units that cannot all hold.
```
Haiku read it as (differs): `all r: Run | ((r->LogicCommand in Ask.rel) and ((some sc: Scenario | sc in Impossible) or (some u: Unit | u in Contradicting))) implies (r not in Exits0)`

## s020 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all e: Exception | (no s: Spec | cites[e, s]) implies e in Freelancing
```

Current words:
```text
For every exception:

when the exception cites no spec, checker reports a freelancing for the exception.
```
Haiku read it as (differs): `all e: Exception | (no s: Spec | cites[e, s]) implies (some Freelancing)`

Ideal prose:
```text
The checker reports a freelancing for every exception that cites no spec.
```
Haiku read it as (same): `all e: Exception | (no s: Spec | cites[e, s]) implies e in Freelancing`

## s032 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
(all b: Bug | hidden[b] implies b in Finding)
and (all c: Conflict | hidden[c] implies c in Finding)
and (all t: Test | misleading[t] implies t in Finding)
```

Current words:
```text
All of these hold:
- for every bug:

  when the bug is hidden, checker reports a finding for the bug
- for every conflict:

  when the conflict is hidden, checker reports a finding for the conflict
- for every test:

  when the test is misleading, checker reports a finding for the test.
```
Haiku read it as (differs): `(all b: Bug | hidden[b] implies (some Finding)) and (all c: Conflict | hidden[c] implies (some Finding)) and (all t: Test | misleading[t] implies (some Finding))`

Ideal prose:
```text
Checker reports a finding for every hidden bug, every hidden conflict and every misleading test.
```
Haiku read it as (same): `(all b: Bug | hidden[b] implies b in Finding) and (all c: Conflict | hidden[c] implies c in Finding) and (all t: Test | misleading[t] implies t in Finding)`

## s044 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all x: ExpectedFailure | ((no b: Bug | checks[x, b]) and (no e: Exception | checks[x, e])) implies x in UnexplainedFailure
```

Current words:
```text
For every expected failure:

when the expected failure checks no bug and checks no exception, checker reports an unexplained failure for the expected failure.
```
Haiku read it as (differs): `all ef: ExpectedFailure | (no b: Bug | checks[ef, b]) and (no e: Exception | checks[ef, e]) implies (some UnexplainedFailure)`

Ideal prose:
```text
When an expected failure checks neither a bug nor an exception, checker reports an unexplained failure for it.
```
Haiku read it as (same): `all ef: ExpectedFailure | ((no b: Bug | checks[ef, b]) and (no e: Exception | checks[ef, e])) implies ef in UnexplainedFailure`

## s056 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all u: Unit | (some t: Trailer | t->u in Follow.rel) implies u in Misanchoring
```

Current words:
```text
For every unit:

when a trailer follows the unit, checker reports a misanchoring for the unit.
```
Haiku read it as (differs): `all u: Unit, t: Trailer | t->u in Follow.rel implies (some Misanchoring)`

Ideal prose:
```text
Checker reports a misanchoring for every unit that a trailer follows.
```
Haiku read it as (same): `all u: Unit | (some t: Trailer | t->u in Follow.rel) implies u in Misanchoring`

## s068 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all c: Claim | tested[c] implies c not in Untesting
```

Current words:
```text
For every claim:

when the claim is tested, checker reports no untesting for the claim.
```
Haiku read it as (differs): `all c: Claim | tested[c] implies (no Untesting)`

Ideal prose:
```text
Checker reports no untesting for a tested claim.
```
Haiku read it as (same): `all c: Claim | tested[c] implies c not in Untesting`

## s164 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all d: Document, e: Document, u: Unit | (d in Checked and d->e in Context.rel and e->u in Hold.units and u in BareFormula) implies u in Held
```

Current words:
```text
For every document_1 and every document_2 and every unit:

when all of these hold:
- the project lists document_1 among the documents it checks
- document_2 is context for document_1
- document_2 holds the unit
- the unit holds a formula with no keyword

then the analyzer is asked to hold the formula of the unit.
```
Haiku read it as (differs): `all d1, d2: Document, u: Unit | ((d1 in Checked) and (d2->d1 in Context.rel) and (d2->u in Hold.units) and (u in BareFormula)) implies (u in Held)`

Ideal prose:
```text
For every document the project lists among the documents it checks, the analyzer is asked to hold the formula of each unit that a document of its context holds, when that unit holds a formula with no keyword.
```
Haiku read it as (same): `all d: Document, u: Unit | ((d in Checked) and (some d2: Document | d->d2 in Context.rel and d2->u in Hold.units) and (u in BareFormula)) implies (u in Held)`

## s227 — HURT (current read right, ideal read wrong)

Original formula:
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
Haiku read it as (same): `always ((no c: Cleanup, o: Owner | (runByCall[c, o] and c in Registered and c.on = o and c not in Ran)) and (no o: Owner | throwByCall[o]))`

Ideal prose:
```text
At no moment does a call in which code disposes an owner after pulse disposed it either throw or run a cleanup that code has registered on the owner and that has not run.
```
Haiku read it as (differs): `always not (some o: Owner, c: Cleanup | (throwByCall[o] or runByCall[c, o]) and o in Disposed and c.on = o and c in Registered and c not in Ran)`

## s081 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all f: Frontmatter | f not in Listing implies (no e: Entry | f->e in Item.rel)
```

Current words:
```text
For every frontmatter_1:

when frontmatter_1 is not a frontmatter with a plugins key, frontmatter_1 holds no entry.
```
Haiku read it as (same): `all f: Frontmatter | (f not in Listing) implies (no e: Entry | f->e in Item.rel)`

Ideal prose:
```text
A frontmatter without a plugins key holds no entry.
```
Haiku read it as (differs): `all f: Listing | (no e: Entry | e in Item.rel[f]) implies (no e2: Entry | e2 in Item.rel[f])`

## s117 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all u: Unit | (u in Logical and u not in Stated and u not in Unsayable) implies u in Unwritten
```

Current words:
```text
For every unit:

when all of these hold:
- the unit holds a formula
- the unit has no statement
- the formula of the unit can be said in words

then the statement of the unit is unwritten.
```
Haiku read it as (same): `all u: Unit | ((u in Logical) and (u not in Stated) and (u not in Unsayable)) implies u in Unwritten`

Ideal prose:
```text
When a unit holds a formula that can be said in words but has no statement, the statement of the unit is unwritten.
```
Haiku read it as (differs): `all u: Unit | ((u in Logical) and not (u in Stated)) implies (u in Unwritten)`

## s165 — HURT (current read right, ideal read wrong)

Original formula:
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
Haiku read it as (same): `(all u: Unit | ((u in Logical) and (u not in Term) and (u in Unchallenged)) implies (some w: Word | u->w in Expose.rel and w in Signature)) and (all u: Unit, w: Word | (u->w in Expose.rel) implies (u in Unchallenged))`

Ideal prose:
```text
The checker reports a unit's formula as lone on a word only if no other formula can contradict that formula. Conversely, when a unit that is not a term holds a formula that no other formula can contradict, the checker reports that formula as lone on some signature.
```
Haiku read it as (differs): `all u: Unit | ((not (u in Term)) and (u in Unchallenged)) iff (some w: Word | loneOn[u, w])`

## s192 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all f: Quantifier | (f in VariableOnce and fits[f]) implies f in AsNounPhrase
```

Current words:
```text
For every quantifier_1:

when quantifier_1 is a quantifier whose variable the sentence says once and fits a noun phrase, verbalizer says quantifier_1 as a noun phrase in the place of the variable, such as "sits in no unit".
```
Haiku read it as (same): `all q: Quantifier | ((q in VariableOnce) and fits[q]) implies (q in AsNounPhrase)`

Ideal prose:
```text
When the sentence says a quantifier's variable once and the quantifier fits a noun phrase, the verbalizer says the quantifier as a noun phrase in the place of the variable, such as "sits in no unit".
```
Haiku read it as (differs): `some q: Quantifier | (q in VariableOnce) and (q in AsNounPhrase)`

## s082 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all f: Frontmatter | (f in Misquoted or f in Foreign or f in Unclosed or f in Unterminated or f in Doubled or f in Dangling or f in Looping or f in Stray) implies f in Refused
```

Current words:
```text
For every frontmatter_1:

when at least one of these holds:
- frontmatter_1 has the flaw of an entry that starts with an at sign outside quotes
- frontmatter_1 has the flaw of a key that neither the checker nor a plugin that frontmatter_1 lists defines
- frontmatter_1 has the flaw of a list that is not closed
- frontmatter_1 has the flaw of a string that is not closed
- frontmatter_1 has the flaw of a key that appears twice
- frontmatter_1 has the flaw of a path that names no document
- frontmatter_1 has the flaw of an extension that leads back to its own document
- frontmatter_1 has the flaw of a setting in a document that is not the entry document

then frontmatter_1 is a frontmatter that the checker cannot read.
```
Haiku read it as (same): `all f: Frontmatter | ((f in Misquoted) or (f in Foreign) or (f in Unclosed) or (f in Unterminated) or (f in Doubled) or (f in Dangling) or (f in Looping) or (f in Stray)) implies (f in Refused)`

Ideal prose:
```text
A frontmatter with any of these flaws is a frontmatter that the checker cannot read:
- an entry that starts with an at sign outside quotes
- a key that neither the checker nor a plugin the frontmatter lists defines
- a list that is not closed
- a string that is not closed
- a key that appears twice
- a path that names no document
- an extension that leads back to its own document
- a setting in a document that is not the entry document
```
Haiku read it as (differs): `all f: Frontmatter | ((some e: Entry | f->e in Item.rel and e in Misquoted) or (some k: Entry | f->k in Item.rel and k in Foreign) or (f in Unclosed) or (f in Unterminated) or (some k: Entry | f->k in Item.rel and k in Doubled) or (some p: Entry | f->p in Item.rel and p in Dangling) or (some ex: Entry | f->ex in Item.rel and ex in Looping) or (some s: Entry | f->s in Item.rel and s in Stray)) implies (f in Refused)`

## s094 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all r: Run, f: Frontmatter, p: Missing | lists[f, p] implies (p in Unfound and r in Exits2)
```

Current words:
```text
For every run and every frontmatter and every missing plugin:

when the frontmatter lists the missing plugin,

then all of these hold:
- checker reports that the project lacks the missing plugin
- the run exits with code 2
```
Haiku read it as (same): `all r: Run, f: Frontmatter, m: Missing | lists[f, m] implies ((some x: Unfound | m in Unfound) and (r in Exits2))`

Ideal prose:
```text
When any frontmatter lists a missing plugin, checker reports that the project lacks that plugin, and every run exits with code 2.
```
Haiku read it as (differs): `(some f: Frontmatter, p: Missing | lists[f, p]) implies ((some r: Run | r in Exits2) and (all p2: Missing | p2 in Unfound))`

## s106 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all d, e: Document | d->e in Bare.rel implies ((all u: Unit | (e->u in Hold.units implies d->u in Hold.units) and (d->u in Hold.units implies e->u in Hold.units)) and (e in Finding implies d in Finding) and (d in Finding implies e in Finding))
```

Current words:
```text
For every document_1 and every document_2:

when document_1 is document_2 without its frontmatter,

then all of these hold:
- for every unit:

  all of these hold:
  - when document_2 holds the unit, document_1 holds the unit
  - when document_1 holds the unit, document_2 holds the unit
- when checker reports a finding for document_2, checker reports a finding for document_1
- when checker reports a finding for document_1, checker reports a finding for document_2
```
Haiku read it as (same): `all d1, d2: Document | (d1->d2 in Bare.rel) implies ((all u: Unit | (u in Hold.units[d2] iff u in Hold.units[d1])) and ((some x: Finding | d2 in Finding) iff (some x: Finding | d1 in Finding)))`

Ideal prose:
```text
When a document is another document without its frontmatter, the two hold exactly the same units, and the checker reports a finding for one exactly when it reports a finding for the other.
```
Haiku read it as (differs): `all d1, d2: Document | (d1->d2 in Bare.rel) implies ((all u: Unit | d2->u in Hold.units iff d1->u in Hold.units))`

## s154 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all c: Scenario | c in Impossible implies c in Raised
```

Current words:
```text
For every scenario_1:

when scenario_1 is a scenario that cannot happen while every held unit holds, checker reports that scenario_1 cannot happen.
```
Haiku read it as (same): `all sc: Scenario | (not (sc in Possible)) implies (sc in Raised)`

Ideal prose:
```text
When a scenario cannot happen while every held unit holds, checker reports that it cannot happen.
```
Haiku read it as (differs): `all sc: Scenario | (sc in Impossible and (all u: Unit | u in Held)) implies (sc in Raised)`

## s217 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
some f: Definition | f in SameKindTwice and f in AmbiguousAnd
```

Current words:
```text
It must be possible that:

There is a definition_1 such that all of these hold:
- definition_1 is a definition with two alternatives for one kind
- definition_1 is a definition with a run of and beside another alternative of its kind
```
Haiku read it as (same): `some d: Definition | (d in SameKindTwice) and (d in AmbiguousAnd)`

Ideal prose:
```text
It must be possible for one definition both to have two alternatives for one kind and to have a run of and beside another alternative of its kind.
```
Haiku read it as (differs): `some d: Definition | (d in OneKind and d in SameKindTwice and d in AmbiguousAnd)`

## s023 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all u: Unit | miscited[u] implies u in Misnesting
```

Current words:
```text
For every unit:

when the unit is miscited, checker reports a misnesting for the unit.
```
Haiku read it as (differs): `all u: Unit | miscited[u] implies (some Misnesting)`

Ideal prose:
```text
Checker reports a misnesting for every miscited unit.
```
Haiku read it as (same): `all u: Unit | miscited[u] => u in Misnesting`

## s035 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all b: Bug | (some i: Issue | b->i in Name.issue and i not in Known) implies b in Mistracking
```

Current words:
```text
For every bug:

when the bug names an issue that tracker does not know, checker reports a mistracking for the bug.
```
Haiku read it as (differs): `all b: Bug | (some i: Issue | b->i in Name.issue and i not in Known) implies (some Mistracking)`

Ideal prose:
```text
When a bug names an issue that tracker does not know, checker reports a mistracking for the bug.
```
Haiku read it as (same): `all b: Bug | (some i: Issue | b->i in Name.issue and i not in Known) => b in Mistracking`

## s047 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all c: Claim | (some Runner and unguarded[c]) implies c in Untesting
```

Current words:
```text
For every claim:

when project has a runner and the claim is unguarded, checker reports an untesting for the claim.
```
Haiku read it as (differs): `(some Runner) implies (all c: Claim | (not refined[c] and not tested[c]) implies (some Untesting))`

Ideal prose:
```text
When the project has a runner, the checker reports an untesting for every unguarded claim.
```
Haiku read it as (same): `(some Runner) => (all c: Claim | unguarded[c] => c in Untesting)`

## s059 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all c: Claim | (some s: Site | c->s in Name.site and (no r: Source | r->s in Hold.symbols)) implies c in Mislocation
```

Current words:
```text
For every claim:

when the claim names a site that no source holds, checker reports a mislocation for the claim.
```
Haiku read it as (differs): `all cl: Claim | (some s: Site | cl->s in Name.site and no src: Source | src->s in Hold.symbols) implies (some Mislocation)`

Ideal prose:
```text
The checker reports a mislocation for every claim that names a site no source holds.
```
Haiku read it as (same): `all c: Claim | (some s: Site | c->s in Name.site and (no src: Source | src->s in Hold.symbols)) => c in Mislocation`

## s071 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all s: Spec | (some t: Test, b: Bug | checks[t, b] and b->s in Sit.rel) implies s not in Untesting
```

Current words:
```text
For every spec:

when a test checks a bug that sits in the spec, checker reports no untesting for the spec.
```
Haiku read it as (differs): `all sp: Spec | (some t: Test, b: Bug | checks[t, b] and b->sp in Sit.rel) implies no Untesting`

Ideal prose:
```text
When a test checks a bug that sits in a spec, checker reports no untesting for the spec.
```
Haiku read it as (same): `all s: Spec | (some t: Test | some b: Bug | checks[t, b] and b->s in Sit.rel) => s not in Untesting`

## s119 — HURT (current read right, ideal read wrong)

Original formula:
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
Haiku read it as (same): `all u: Unit | ((u in Generated and not (u in Differs) and not (u in Unsayable)) implies (u in Current))`

Ideal prose:
```text
A statement that sits between the markers of a generated region is current when its unit's formula can be said in words and the statement does not differ from what that formula says.
```
Haiku read it as (differs): `all u: Unit | u in Generated => (u in Current iff (u not in Unsayable and u not in Differs))`

## s143 — HURT (current read right, ideal read wrong)

Original formula:
```alloy
all w: Word | (w not in Undeclared and w not in Misplaced and w not in Apart and w not in Unused) implies w not in Flagged
```

Current words:
```text
For every word_1:

when all of these hold:
- word_1 is not a word that a reading says and nothing declares
- word_1 is not a word declared in a unit that is not a term
- word_1 is not a word whose reading is in another unit than its declaration
- word_1 is not a word that no claim, definition or fact uses

then checker does not report the word word_1.
```
Haiku read it as (same): `all w: Word | ((not (w in Undeclared) and not (w in Misplaced) and not (w in Apart) and not (w in Unused)) implies (not (w in Flagged)))`

Ideal prose:
```text
Checker does not report a word when none of these holds:
- a reading says it and nothing declares it
- it is declared in a unit that is not a term
- its reading is in another unit than its declaration
- no claim, definition or fact uses it
```
Haiku read it as (differs): `all w: Word | ((all u: Unit | u->w not in Voice.rel or (some u2: Unit | u2->w in Introduce.rel)) and (all u: Unit | u->w not in Introduce.rel or u in Term) and (all u1, u2: Unit | u1->w not in Voice.rel or u2->w not in Introduce.rel or u1 = u2) and (some u: Unit | u->w in Rely.rel)) => w not in Flagged`

## s155 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
all c: Scenario | c in Possible implies c not in Raised
```

Current words:
```text
For every scenario_1:

when scenario_1 is a scenario that can happen while every held unit holds, checker does not report that scenario_1 cannot happen.
```
Haiku read it as (differs): `all sc: Scenario | (sc in Possible and (all u: Unit | u in Held)) implies (sc not in Raised)`

Ideal prose:
```text
The checker does not report that a scenario cannot happen when it can happen while every held unit holds.
```
Haiku read it as (same): `all s: Scenario | s in Possible => s not in Raised`

## s120 — HURT (current read right, ideal read wrong)

Original formula:
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
Haiku read it as (same): `all u: Unit | ((u in Logical and u in Stated and u not in Generated and u not in Unsayable) => u in Handwritten)`

Ideal prose:
```text
A unit's statement is handwritten when the unit holds a formula that can be said in words and its statement does not sit between the markers of a generated region.
```
Haiku read it as (differs): `all u: Unit | (u in Logical and u not in Unsayable and u not in Generated) implies u in Handwritten`

## s180 — HELPED (ideal read right, current read wrong)

Original formula:
```alloy
some u: Unit, w: Signature | u in Logical and u->w in Rely.rel and u->w not in Expose.rel
```

Current words:
```text
It must be possible that:

There are unit_1 and signature_1 such that all of these hold:
- unit_1 holds a formula
- a claim, a definition or a fact of unit_1 uses signature_1
- checker does not report the formula of unit_1 as lone on signature_1
```
Haiku read it as (differs): `some u: Unit | some w: Word | u in Logical and u->w in Rely.rel and u->w not in Expose.rel`

Ideal prose:
```text
It must be possible that a unit holds a formula, a claim, a definition or a fact of the unit uses a signature, and the checker does not report the formula of the unit as lone on that signature.
```
Haiku read it as (same): `some u: Unit, w: Word | (u in Logical and u->w in Rely.rel and w in Signature and u->w not in Expose.rel)`

