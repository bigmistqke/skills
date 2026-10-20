Vocabulary file: canon.vocab.md

## s000  (term-cite)

Claim (the unit's name, as a sentence): **cite**

Rationale: Nesting and the "Derives from:" line are the two ways a unit says what it follows from. A unit [sits in](#term-sit) or [derives from](#term-derive) what it cites. A [link](#term-link) in the body is neither.

Formula:
```alloy
pred cites[u, v: Unit] { u->v in Sit.rel or u->v in Derive.rel }
```

What the formula says, exactly:
```text
For every unit_1 and every unit_2:

unit_1 cites unit_2 exactly when unit_1 sits in unit_2 or derives from unit_2.
```

## s001  (term-unfounded)

Claim (the unit's name, as a sentence): **unfounded**

Rationale: A unit that lacks a citation its kind owes: what it follows from.

Formula:
```alloy
pred unfounded[u: Unit] {
  (u in Spec and (no a: Axiom | cites[u, a]) and (no s: Spec | cites[u, s]))
  or (u in Exception and (no s: Spec | cites[u, s]))
  or (u in Exception and (no f: Fact | cites[u, f]))
  or (u in Bug and (no s: Spec | cites[u, s]))
}
```

What the formula says, exactly:
```text
For every unit:

the unit is unfounded exactly when the unit is one of these:
- a spec that cites no axiom and cites no spec
- an exception that cites no spec or cites no fact
- a bug that cites no spec
```

## s002  (term-miscited)

Claim (the unit's name, as a sentence): **miscited**

Rationale: A unit that cites a kind of unit it may not cite. A conflict names the units it sets against each other on a line of its own, which is no citation.

Formula:
```alloy
pred miscited[u: Unit] {
  (u in Axiom and (some v: Unit | cites[u, v] and v not in Axiom))
  or (u in Fact and (some v: Unit | cites[u, v]))
  or (u in Spec and (some v: Unit | cites[u, v] and v not in Axiom and v not in Spec and v not in Fact))
  or (u in Exception and (some v: Unit | cites[u, v] and v not in Spec and v not in Fact))
  or (u in Bug and (some v: Unit | cites[u, v] and v not in Spec))
  or (u in Conflict and (some v: Unit | cites[u, v]))
  or (u in Term and (some v: Unit | cites[u, v]))
}
```

What the formula says, exactly:
```text
For every unit_1:

unit_1 is miscited exactly when unit_1 is one of these:
- an axiom that cites a unit that is not an axiom
- a fact that cites a unit
- a spec that cites a unit that is not an axiom, a spec or a fact
- an exception that cites a unit that is not a spec or a fact
- a bug that cites a unit that is not a spec
- a conflict that cites a unit
- a term that cites a unit
```

## s003  (term-circular)

Claim (the unit's name, as a sentence): **circular**

Rationale: A unit that follows from itself: it cites a unit that [depends](#term-depend) on it, and that unit may be the unit itself. A unit that cites itself is a loop of one, and a unit whose citations lead back to it is a longer loop.

Formula:
```alloy
pred circular[u: Unit] { some v: Unit | cites[u, v] and v->u in Depend.rel }
```

What the formula says, exactly:
```text
For every unit_1:

unit_1 is circular exactly when unit_1 cites a unit that depends on unit_1.
```

## s004  (term-refined)

Claim (the unit's name, as a sentence): **refined**

Rationale: A bug that sits in a spec marks where the code breaks the spec. It refines nothing, so a spec that holds only bugs is a leaf.

Formula:
```alloy
pred refined[c: Claim] { (some s: Spec | s->c in Sit.rel) or (some e: Exception | e->c in Sit.rel) }
```

What the formula says, exactly:
```text
For every claim:

the claim is refined exactly when a spec sits in the claim or an exception sits in the claim.
```

## s005  (term-unguarded)

Claim (the unit's name, as a sentence): **unguarded**

Rationale: A leaf that no test checks: the code can stop doing what it says, and no test fails.

Formula:
```alloy
pred unguarded[c: Claim] { not refined[c] and not tested[c] }
```

What the formula says, exactly:
```text
For every claim:

the claim is unguarded exactly when the claim is not refined and is not tested.
```

## s006  (term-adrift)

Claim (the unit's name, as a sentence): **adrift**

Rationale: A test whose tags do not say which leaf it checks.

Formula:
```alloy
pred adrift[t: Test] {
  (t in Declared and (no g: Tag | t->g in Carry.rel))
  or (t in Declared and (some u: Unit | checks[t, u] and u not in Claim))
  or (some c: Claim | checks[t, c] and refined[c])
}
```

What the formula says, exactly:
```text
For every test:

the test is adrift exactly when at least one of these holds:
- project declares the test and the test carries no tag
- project declares the test and the test checks a unit that is not a claim
- the test checks a claim that is refined
```

## s007  (term-used)

Claim (the unit's name, as a sentence): **used**

Rationale: A unit that nothing uses can stop being true, and nothing that relies on it notices, because nothing does.

Formula:
```alloy
pred used[u: Unit] {
  (some v: Unit | v != u and v->u in Sit.rel)
  or (some p: Pointer | p->u in Name.pointer)
  or (some g: Tag | g->u in Name.tag)
}
```

What the formula says, exactly:
```text
For every unit_1:

unit_1 is used exactly when another unit sits in unit_1, a pointer names unit_1 or a tag names unit_1.
```

## s008  (term-check)

Claim (the unit's name, as a sentence): **check**

Rationale: A test checks the units its tags name. That is no citation: [citing](#term-cite) is what one unit does to another.

Formula:
```alloy
pred checks[t: Test, u: Unit] { some g: Tag | t->g in Carry.rel and g->u in Name.tag }
```

What the formula says, exactly:
```text
For every test and every unit:

the test checks the unit exactly when the test carries a tag that names the unit.
```

## s009  (term-tested)

Claim (the unit's name, as a sentence): **tested**

Rationale: A test of a bug asserts what the spec the bug breaks claims, so it tests that spec too. A plain test that checks a bug still makes the bug tested: the checker reports the test instead, as [misleading](#term-misleading).

Formula:
```alloy
pred tested[u: Unit] {
  (some t: Test | checks[t, u])
  or (u in Spec and (some t: Test, b: Bug | checks[t, b] and b->u in Sit.rel))
}
```

What the formula says, exactly:
```text
For every unit:

the unit is tested exactly when at least one of these holds:
- a test checks the unit
- the unit is a spec and a test checks a bug that sits in the unit
```

## s010  (term-paired)

Claim (the unit's name, as a sentence): **paired**

Rationale: A conflict needs two sides.

Formula:
```alloy
pred paired[c: Conflict] { some a, b: Unit | a != b and c->a in Name.between and c->b in Name.between }
```

What the formula says, exactly:
```text
For every conflict:

the conflict is paired exactly when the conflict names a unit and names another unit.
```

## s011  (term-hidden)

Claim (the unit's name, as a sentence): **hidden**

Rationale: A known defect out of sight: no open issue tracks it, no test checks it, or a conflict that does not say which units it sets against each other. A project with no [tracker](#term-tracker) owes no issue, and a project with no [runner](#term-runner) owes no test.

Formula:
```alloy
pred hidden[x: Unit] {
  (x in Bug and ((some Tracker and (no i: Issue | x->i in Name.issue)) or (some i: Issue | x->i in Name.issue and i not in Known) or (some i: Issue | x->i in Name.issue and i in Closed) or (some Runner and not tested[x])))
  or (x in Conflict and ((some Tracker and (no i: Issue | x->i in Name.issue)) or (some i: Issue | x->i in Name.issue and i not in Known) or (some i: Issue | x->i in Name.issue and i in Closed) or not paired[x]))
}
```

What the formula says, exactly:
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

## s012  (term-misleading)

Claim (the unit's name, as a sentence): **misleading**

Rationale: A test whose outcome says nothing true about a defect: an expected failure that names no defect, or a test that passes while the bug it checks is there.

Formula:
```alloy
pred misleading[t: Test] {
  (t in ExpectedFailure and (no b: Bug | checks[t, b]) and (no e: Exception | checks[t, e]))
  or (t in PlainTest and (some b: Bug | checks[t, b]))
}
```

What the formula says, exactly:
```text
For every test_1:

test_1 is misleading exactly when test_1 is one of these:
- an expected failure that checks no bug and checks no exception
- a plain test that checks a bug
```

## s013  (term-list)

Claim (the unit's name, as a sentence): **list**

Formula:
```alloy
pred lists[f: Frontmatter, p: Plugin] { some e: Entry | f->e in Item.rel and e->p in Spell.rel }
```

What the formula says, exactly:
```text
For every frontmatter and every plugin:

the frontmatter lists the plugin exactly when the frontmatter holds an entry that spells the plugin.
```

## s014  (term-apply)

Claim (the unit's name, as a sentence): **apply**

Formula:
```alloy
pred applies[p: Plugin, d: Document] { some f: Listing | d->f in Head.rel and lists[f, p] }
```

What the formula says, exactly:
```text
For every plugin and every document:

the plugin applies to the document exactly when the document starts with a listing frontmatter that lists the plugin.
```

## s015  (term-call)

Claim (the unit's name, as a sentence): **call**

Formula:
```alloy
pred calls[r: Run, p: Plugin] {
  (some c: Command | r->c in Ask.rel and p->c in Add.rel)
  and (some d: Document | applies[p, d])
}
```

What the formula says, exactly:
```text
For every run and every plugin:

the run calls the plugin exactly when all of these hold:
- the run asks for a command that the plugin adds
- the plugin applies to a document
```

## s016  (term-availability)

Claim (the unit's name, as a sentence): **availability**

Formula:
```alloy
pred available[c: Command] {
  c in Core
  or (some p: Installed, d: Document | applies[p, d] and p->c in Add.rel)
}
```

What the formula says, exactly:
```text
For every command_1:

command_1 is available exactly when at least one of these holds:
- command_1 is a command that the checker has of its own
- there are installed_plugin_1 and document_1 such that installed_plugin_1 applies to document_1 and adds command_1
```

## s017  (axiom-every-claim-says-what-it-follows-from)

Claim (the unit's name, as a sentence): **every claim says what it follows from**

Rationale: A claim that cannot say why it holds gives the next reader no reason to keep it, or to change it with care. So a canon passes the check only when every claim [cites](#term-cite) what it follows from, and only what its kind may follow from. A unit that does not is [unfounded](#term-unfounded) or [miscited](#term-miscited), and the checker reports a [finding](#term-finding) for it. A claim that follows from itself says no more than that it holds. A unit that is [circular](#term-circular) has a finding as well.

Formula:
```alloy
(all u: Unit | unfounded[u] implies u in Finding)
and (all u: Unit | miscited[u] implies u in Finding)
and (all u: Unit | circular[u] implies u in Finding)
```

What the formula says, exactly:
```text
All of these hold:
- for every unit:

  when the unit is unfounded, checker reports a finding for the unit
- for every unit:

  when the unit is miscited, checker reports a finding for the unit
- for every unit:

  when the unit is circular, checker reports a finding for the unit.
```

## s018  (spec-an-unfounded-unit-is-freelancing)

Claim (the unit's name, as a sentence): **an unfounded unit is freelancing**

Refines: "every claim says what it follows from"

Rationale: This follows because a [freelancing](#term-freelancing) is the finding for a claim that cites nothing it follows from.

Formula:
```alloy
all u: Unit | unfounded[u] implies u in Freelancing
```

What the formula says, exactly:
```text
For every unit:

when the unit is unfounded, checker reports a freelancing for the unit.
```

## s019  (spec-a-spec-cites-an-axiom-or-a-spec)

Claim (the unit's name, as a sentence): **a spec cites an axiom or a spec**

Refines: "every claim says what it follows from" → "an unfounded unit is freelancing"

Formula:
```alloy
all s: Spec | ((no a: Axiom | cites[s, a]) and (no t: Spec | cites[s, t])) implies s in Freelancing
```

What the formula says, exactly:
```text
For every spec_1:

when spec_1 cites no axiom and cites no spec, checker reports a freelancing for spec_1.
```

## s020  (spec-an-exception-cites-a-spec)

Claim (the unit's name, as a sentence): **an exception cites a spec**

Refines: "every claim says what it follows from" → "an unfounded unit is freelancing"

Formula:
```alloy
all e: Exception | (no s: Spec | cites[e, s]) implies e in Freelancing
```

What the formula says, exactly:
```text
For every exception:

when the exception cites no spec, checker reports a freelancing for the exception.
```

## s021  (spec-an-exception-cites-a-fact)

Claim (the unit's name, as a sentence): **an exception cites a fact**

Refines: "every claim says what it follows from" → "an unfounded unit is freelancing"

Formula:
```alloy
all e: Exception | (no f: Fact | cites[e, f]) implies e in Freelancing
```

What the formula says, exactly:
```text
For every exception:

when the exception cites no fact, checker reports a freelancing for the exception.
```

## s022  (spec-a-bug-cites-a-spec)

Claim (the unit's name, as a sentence): **a bug cites a spec**

Refines: "every claim says what it follows from" → "an unfounded unit is freelancing"

Formula:
```alloy
all b: Bug | (no s: Spec | cites[b, s]) implies b in Freelancing
```

What the formula says, exactly:
```text
For every bug:

when the bug cites no spec, checker reports a freelancing for the bug.
```

## s023  (spec-a-miscited-unit-is-misnested)

Claim (the unit's name, as a sentence): **a miscited unit is misnested**

Refines: "every claim says what it follows from"

Rationale: This follows because a [misnesting](#term-misnesting) is the finding for a unit that cites a kind it may not cite.

Formula:
```alloy
all u: Unit | miscited[u] implies u in Misnesting
```

What the formula says, exactly:
```text
For every unit:

when the unit is miscited, checker reports a misnesting for the unit.
```

## s024  (spec-an-axiom-cites-only-axioms)

Claim (the unit's name, as a sentence): **an axiom cites only axioms**

Refines: "every claim says what it follows from" → "a miscited unit is misnested"

Formula:
```alloy
all a: Axiom | (some u: Unit | cites[a, u] and u not in Axiom) implies a in Misnesting
```

What the formula says, exactly:
```text
For every axiom_1:

when axiom_1 cites a unit that is not an axiom, checker reports a misnesting for axiom_1.
```

## s025  (spec-a-fact-cites-nothing)

Claim (the unit's name, as a sentence): **a fact cites nothing**

Refines: "every claim says what it follows from" → "a miscited unit is misnested"

Formula:
```alloy
all f: Fact | (some u: Unit | cites[f, u]) implies f in Misnesting
```

What the formula says, exactly:
```text
For every fact:

when the fact cites a unit, checker reports a misnesting for the fact.
```

## s026  (spec-a-spec-cites-only-axioms-specs-and-facts)

Claim (the unit's name, as a sentence): **a spec cites only axioms specs and facts**

Refines: "every claim says what it follows from" → "a miscited unit is misnested"

Formula:
```alloy
all s: Spec | (some u: Unit | cites[s, u] and u not in Axiom and u not in Spec and u not in Fact) implies s in Misnesting
```

What the formula says, exactly:
```text
For every spec_1:

when the following holds:

spec_1 cites a unit that is not an axiom, a spec or a fact

then checker reports a misnesting for spec_1.
```

## s027  (spec-an-exception-cites-only-specs-and-facts)

Claim (the unit's name, as a sentence): **an exception cites only specs and facts**

Refines: "every claim says what it follows from" → "a miscited unit is misnested"

Formula:
```alloy
all e: Exception | (some u: Unit | cites[e, u] and u not in Spec and u not in Fact) implies e in Misnesting
```

What the formula says, exactly:
```text
For every exception:

when the exception cites a unit that is not a spec or a fact, checker reports a misnesting for the exception.
```

## s028  (spec-a-bug-cites-only-specs)

Claim (the unit's name, as a sentence): **a bug cites only specs**

Refines: "every claim says what it follows from" → "a miscited unit is misnested"

Formula:
```alloy
all b: Bug | (some u: Unit | cites[b, u] and u not in Spec) implies b in Misnesting
```

What the formula says, exactly:
```text
For every bug:

when the bug cites a unit that is not a spec, checker reports a misnesting for the bug.
```

## s029  (spec-a-conflict-cites-nothing)

Claim (the unit's name, as a sentence): **a conflict cites nothing**

Refines: "every claim says what it follows from" → "a miscited unit is misnested"

Formula:
```alloy
all c: Conflict | (some u: Unit | cites[c, u]) implies c in Misnesting
```

What the formula says, exactly:
```text
For every conflict:

when the conflict cites a unit, checker reports a misnesting for the conflict.
```

## s030  (spec-a-term-cites-nothing)

Claim (the unit's name, as a sentence): **a term cites nothing**

Refines: "every claim says what it follows from" → "a miscited unit is misnested"

Formula:
```alloy
all t: Term | (some u: Unit | cites[t, u]) implies t in Misnesting
```

What the formula says, exactly:
```text
For every term:

when the term cites a unit, checker reports a misnesting for the term.
```

## s031  (spec-a-unit-does-not-depend-on-itself)

Claim (the unit's name, as a sentence): **a unit does not depend on itself**

Refines: "every claim says what it follows from"

Rationale: This follows because a unit that [depends](#term-depend) on itself names no ground it stands on, and a [cycle](#term-cycle) is its finding.

Formula:
```alloy
all u: Unit | circular[u] implies u in Cycle
```

What the formula says, exactly:
```text
For every unit:

when the unit is circular, checker reports a cycle for the unit.
```

## s032  (axiom-a-known-defect-stays-in-sight)

Claim (the unit's name, as a sentence): **a known defect stays in sight**

Rationale: A defect the canon knows of must stay where the next reader sees it, until it is fixed or the owner of the design rules on it. A bug or a conflict out of sight is [hidden](#term-hidden), and a [test](#term-test) whose outcome says nothing true about a defect is [misleading](#term-misleading). The checker reports a [finding](#term-finding) for each.

Formula:
```alloy
(all b: Bug | hidden[b] implies b in Finding)
and (all c: Conflict | hidden[c] implies c in Finding)
and (all t: Test | misleading[t] implies t in Finding)
```

What the formula says, exactly:
```text
All of these hold:
- for every bug:

  when the bug is hidden, checker reports a finding for the bug
- for every conflict:

  when the conflict is hidden, checker reports a finding for the conflict
- for every test:

  when the test is misleading, checker reports a finding for the test.
```

## s033  (spec-a-hidden-bug-is-reported)

Claim (the unit's name, as a sentence): **a hidden bug is reported**

Refines: "a known defect stays in sight"

Rationale: This follows because each way a bug is hidden has a finding of its own. A bug that [names](#term-name) no [issue](#term-issue) has an [untracking](#term-untracking), and one that names an issue the [tracker](#term-tracker) does not know has a [mistracking](#term-mistracking). One that names an issue the tracker has closed has an [outdated tracking](#term-outdated-tracking), and one that is not [tested](#term-tested) has an [untesting](#term-untesting).

Formula:
```alloy
all b: Bug | hidden[b] implies b in Finding
```

What the formula says, exactly:
```text
For every bug:

when the bug is hidden, checker reports a finding for the bug.
```

## s034  (spec-a-bug-names-an-issue)

Claim (the unit's name, as a sentence): **a bug names an issue**

Refines: "a known defect stays in sight" → "a hidden bug is reported"

Formula:
```alloy
all b: Bug | (some Tracker and (no i: Issue | b->i in Name.issue)) implies b in Untracking
```

What the formula says, exactly:
```text
For every bug:

when project has a tracker and the bug names no issue, checker reports an untracking for the bug.
```

## s035  (spec-a-bug-names-an-issue-the-tracker-knows)

Claim (the unit's name, as a sentence): **a bug names an issue the tracker knows**

Refines: "a known defect stays in sight" → "a hidden bug is reported"

Formula:
```alloy
all b: Bug | (some i: Issue | b->i in Name.issue and i not in Known) implies b in Mistracking
```

What the formula says, exactly:
```text
For every bug:

when the bug names an issue that tracker does not know, checker reports a mistracking for the bug.
```
