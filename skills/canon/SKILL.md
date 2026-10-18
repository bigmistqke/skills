---
name: canon
description: The methodology that governs all work on a project with a CANON.md — the document of axioms, facts, specs and exceptions that is the project itself, which the code and tests express and a checker holds closed. Load at the start of every session and before any work in such a project. Use it for every choice that decides what the system does, or why; before changing an area of the code (read the theory that covers it first); when adding or changing behaviour (place it against the specs it resembles, derive it from an axiom, survey the units and boundaries it reaches, and have the canon diff reviewed before writing code); when opening a pull request or acting on review findings; when fixing a bug (trace it up to the missing spec, axiom or fact before touching code); when writing a test; when editing CANON.md; before ending a session (write every decision of value or behaviour back into the canon); when running the canon checker; and when writing the canon of an existing project that has none. For a design question the canon does not decide, use the grill-with-canon skill. For a question about the world the system runs in, use the research-with-canon skill.
---

# Canon

## Terms

- Theory: the knowledge, held by the people who build a program, of how the program meets the world it serves. Peter Naur names it in [Programming as Theory Building](https://gwern.net/doc/cs/algorithm/1985-naur.pdf). Whoever holds the theory can do three things:
  1. Explain how each part of the program matches some affair of the world of the people using it.
  2. Explain why each part is the way it is, and what it would cost to make it otherwise.
  3. Respond to a proposed change by working out how it fits what is already there, instead of patching the place where the change lands.

  Naur argues that the program text cannot carry the theory. He calls a program dead when its builders have left: it still runs, but nobody can change it well. The canon is a best effort to write the theory down. With every change, the project works towards the theory.

  The canon works in both directions, and the protocol below spells out each one. Downwards, the theory decides the tests and the code ([section 3](#3-adding-or-changing-behaviour)). Upwards, the code tests the theory ([section 4](#4-fixing-a-defect)): you trace a defect up to the spec, axiom or fact that is missing. A more exact theory may also call for a stronger structure of the canon ([structure](writing-units.md#10-structure)).
- Canon: the documents, `CANON.md` by default, that state the theory as units, linked into a derivation graph that tests cite and a checker holds closed.
- Unit: one entry of the canon, with a kind, a stem and a statement. [The kinds](writing-units.md#1-kinds) lists them.
- Derivation: the edge from a unit to the unit it follows from, by nesting or on a `Derives from:` line. Together, the derivations answer the second of the three things above: why each part is the way it is.
- Flow: how directly the units follow from their parents. In a strong flow, few axioms and facts force many specs, and each "This follows because" sentence is short.
- Owner of the design: the person who decides the project's values. You propose, and the owner judges.
- Session: one run of work by an agent, which starts without the theory and must rebuild it from the canon.
- Scope: what the project takes on and what it leaves out, stated as scope units ([the kinds](writing-units.md#1-kinds)). A change has a scope too: the claims its request needs, within the scope of the project. The request is the issue, or what the owner of the design asked for. The units a change adds, changes or retires claim no more than the request needs. Only the owner widens a scope, of the project or of a change ([section 3](#3-adding-or-changing-behaviour), step 3).
- Researcher: the role that builds the facts. A researcher answers one stated question about the world the system runs in, from a source or a probe. The answer is a fact, and the research-with-canon skill describes the work. A researcher does not design. Give research an agent of its own when one is available, so that the design cannot bend the fact.
- Reviewer: the role that checks the canon diff and the code against the axioms and facts that exist. A reviewer runs again the probes that the facts name, and writes no new probe. A boundary that no fact answers is a question for a researcher.
- Canon diff: the edits a change makes to the canon documents.
- Declared units: the units a change adds, changes or retires. Its pull request names them, and they fit its scope.
- Mechanism: what happens inside a part to make its claims hold, such as a guard, a conversion, a special case or a release. It is your choice, held by the test that notices its break.

## Protocol

This protocol governs all work on the project. Follow it in every session, for every change and every choice.

`CANON.md` is the project. It states what the system does and why, as claims that tests cite. The code and the tests express the canon and follow from it. The canon is not documentation of the code.

The canon is a map, not the territory. It states what the project wants each part to take in, give back and do to its surroundings, and why. A part is the whole system, a module or one function, and the tests show that each part does what the canon wants. What happens inside a part is not claimed, and what the canon does not claim is not promised. A want with no claim, or a claim with no test, is a gap; a map that tries to hold the territory becomes the program.

Every session starts without the theory. It does not know why the code is the way it is, and the code cannot tell it. The canon holds the theory. Each session rebuilds the theory from the canon, works under it, and writes back what it decided. The canon is how the project keeps its knowledge from one session to the next.

Documentation goes out of date because nothing checks it. The canon cannot go out of date without the checker failing. Every spec and exception has a test, and the checker reports every claim, test or link that goes stale.

This file holds what every session needs. Two files beside it hold the rest:

- [`writing-units.md`](writing-units.md): how to write, place and test units. Read it before you add, change or move a unit.
- [`checker.md`](checker.md): how to install, configure and run the checker.

## 1. Authority

1. The canon outranks every other source of intent: the code, the tests, the README, glossaries, decision records, memory, and your own assumptions.
2. Only the owner of the design decides values. Ask whenever the canon does not decide a question. Ask what the system must do and what it may cost, not how the code does it. A mechanism is your choice under the canon. Do not ask the owner to approve one, and do not treat an approval as a ruling.
3. Ask one question at a time, and give your recommended answer with it. If the code or the canon can answer a question, read them instead of asking. When the answer depends on what the platform gives, research the platform first, and bring the facts with the question.
4. The owner changes the project through the canon too. When the owner asks for something the canon forbids, or something the scope of the project leaves out, do not carry it out. Name the conflict and the units involved. The owner changes the canon first.
5. When the code contradicts the canon, the code has a defect. Follow [section 4](#4-fixing-a-defect).
6. When a test asserts something other than the spec it cites, the spec decides. Correct the test, unless the owner rules that the spec is wrong.
7. When two units contradict each other, the canon is wrong. Ask the owner which one holds. If the ruling waits, record the contradiction as a conflict, as [writing units](writing-units.md#11-conflicts) describes.
8. Change the project in one order: the canon first, then the tests, then the code. This holds when the owner confirms a change, and when you correct a canon that is wrong. A defect is the one case that starts with a test: the test it breaks, as [section 4](#4-fixing-a-defect) describes.
9. No change enters the project unless the canon accounts for it.

## 2. The session

1. If no `CANON.md` has settings in its frontmatter and `package.json` has no `canon` field, the project has no checker yet. Ask the owner before you set it up as [`checker.md`](checker.md) describes.
2. At the start, read the root axioms, the scopes and the facts. Then read every unit that covers the area of your task.
3. Use the canon for every choice that decides what the system does, or why. How the code meets a claim is a mechanism: your choice, held by the test that notices its break.
4. When you face a choice, find the units that decide it. Choose the option they force, and cite them in your reasoning. An earlier ruling forces a new case only when the reason the ruling gives covers that case; a likeness to the ruling is not enough. The code shows what the system does, and decides nothing.
5. When a scope leaves a question out, the project does not answer it. Say so, and do not ask the owner.
6. When the units do not decide a choice, the canon lacks a value or a spec. Settle it with the owner of the design through the grill-with-canon skill, which writes the answer into the canon. While the ruling waits, write the part of the choice that the units force. Record the rest as an open choice, as [writing units](writing-units.md#5-facts-exceptions-and-bugs) describes, and work on from there.
7. Before you change code, answer three questions from the units that cover it. They are the three things that whoever holds the [theory](#terms) can do:
   1. What does this code match in the world of the people using the system?
   2. Why is each part the way it is? The derivation lines answer this.
   3. How does the requested change fit what is already there?

   If the canon lacks a claim you need, write the unit. If an answer needs a judgement the canon cannot give, ask the owner of the design.
8. Before the session ends, write into the canon every decision of value or of behaviour you made. A mechanism needs no unit.
9. Write each unit for a reader who has none of your context. That reader is the next session.
10. End the session with `pnpm canon check` clean and `pnpm canon log` clean. If a document lists the Alloy plugin, end it with `pnpm canon logic` clean too. If a document lists the retext plugin, run `pnpm canon lint` on the text you wrote, and fix its findings.

## 3. Adding or changing behaviour

1. Name the existing specs that the new behaviour most resembles, and say whether the change extends or refines them. If it does neither, the change is a patch. Ask the owner of the design before you continue.
2. Name the axiom the behaviour follows from and the facts it relies on. If no axiom yields the behaviour, an axiom is missing. Stop, and ask the owner.
3. Claim no more than the request needs. That is the [scope](#terms) of the change.
   1. Before you design a [mechanism](#terms), state the simplest change that meets the request. Design beyond it only where a unit forces you to.
   2. A claim beyond the request widens the scope of the change. Widening a spec from one input kind to every kind is one example. Widening it from the platforms the issue names to every platform is another.
   3. Only the owner widens a scope, of the change or of the project. Ask, and name the widening in the question. Then say so in the canon diff.
   4. An answer of the owner can widen the scope without saying so. When one does, name that effect to the owner before you work under it.
4. Survey what the change meets, within its scope. Write down what you found, and how you found it:
   1. The units cited by the tests of the code the change touches, and the units that use the same words as the change. Note the words you searched for.
   2. The documents that describe what the change touches.
   3. The members of each set that a declared unit claims something of, such as every option, input kind, target or entry point. List them from a source: a type, a registry, a schema, the exports, a specification. A list written from memory misses members.
   4. The boundaries of what the declared units claim: zero, empty and missing inputs, the extremes of each type, ties, and what the platform leaves undefined.

   Claim a result at a boundary only where the request or an axiom wants one. A boundary nothing wants needs no text, and the canon promises nothing there. A boundary whose result a declared unit claims gets a test in step 7.

   Before a unit claims a result that depends on what the platform gives, put the question to a [researcher](#terms), as [section 5](#5-exploring) describes. The claim waits for the fact. An argument is not a fact. When the facts show that the platform cannot give the result, do not design a mechanism to make the claim hold anyway. Bring the facts to the owner, with a proposed scope or exception, and ask whether the project takes the case on.

   Propose what you notice beyond the scope of the change as an issue, as [section 7](#7-pull-requests-and-reviews) describes.
5. Deduce the specs from the axiom and the facts, with a leaf for each case.
6. Before you write any code, have someone who did not write the canon diff review it: the owner of the design, or a fresh [reviewer](#terms). The reviewer checks each new fact, as the research-with-canon skill describes: runs its probe again, and checks that its quote says what it claims. The reviewer checks each new unit against the units from step 4. A finding blocks the canon diff only when it shows one of these:
   1. A declared unit contradicts another unit or a fact.
   2. A declared unit claims a result that no fact backs.
   3. A declared unit cannot be tested.
   4. A new fact claims more than its source shows.

   Answer the second kind by leaving the result open, or by putting its question to a researcher. Other findings go on to the implementation, or are proposed as issues. When no finding blocks, the review of the canon diff ends.
7. Write the tests, and see them fail. Choose inputs that a plausible wrong implementation gets wrong. A test of "non-zero is true" uses 2 and −2, where a bitwise and a logical reading differ, not 1.
8. Write the code. It expresses the declared units, and nothing more.
9. Break each mechanism the code adds, and see a test that cites its unit fail for that reason. Then restore the mechanism. A mechanism whose break no test notices is untested, whatever the coverage says.
10. Go through the documents from step 4. Each is changed, or unchanged for a reason you can state in one sentence.

## 4. Fixing a defect

1. Do not change the code first. Write the test that the defect breaks, and see it fail.
2. Find the spec that covers the situation. If none does, a spec is missing or states too much. Find the axiom or fact that decides the spec. If no axiom does, one is missing: ask the owner of the design. If a fact is missing, put its question to a [researcher](#terms).
3. The request of a defect is its failing case. List the other members of the set it belongs to, from a source, as step 4 of [section 3](#3-adding-or-changing-behaviour) describes. Name in the canon diff the ones that share the defect's cause. Fixing them too widens the [scope](#terms) of the change, so ask the owner, with your recommendation. If the owner agrees, fix them with it as one design; if not, propose them as issues, as [section 7](#7-pull-requests-and-reviews) describes.
4. Write what is missing from the top down: axiom or fact, then spec. Make the test from step 1 cite the spec.
5. If the fix waits, record the defect instead: a bug inside the spec, and the test from step 1 marked to fail, citing the bug. [Writing units](writing-units.md#5-facts-exceptions-and-bugs) has the rules.
6. Fix the code. If a bug recorded the defect, remove it, and make its test pass and cite the spec.
7. Never narrow a spec of the main branch so that the defect falls outside it. A defect points up, at a gap in the canon, and never down, at the claim it breaks. Only the owner of the design can rule that a claim was wrong. A unit that your own change adds may still claim less, as [writing units](writing-units.md#2-units) describes.
8. Pointing up can show that a leaf spec states one case of a wider claim. Name that claim in the canon diff. Restating the spec as the wider claim, a parent with one leaf for each case, widens the scope of the change. Ask the owner, in the same question as step 3. The defect's test cites the leaf of its case.

## 5. Exploring

1. Explore outside the implementation: in a prototype, a scratch directory or a separate branch.
2. An experiment makes no claim and commits the project to nothing. The canon does not govern it.
3. A result enters the project only through the canon, in the order of [section 1](#1-authority).
4. When the result of an experiment is in the canon, remove the experiment, or keep it only as a record of the exploration.
5. A fact comes from research, which the research-with-canon skill describes. Put one stated question to a [researcher](#terms), and take back the fact it writes.
6. A fact enters the canon with the change that asked its question. A fact that answers no question of the change stays out of it.
7. Commit the facts and their probes apart from the specs and the code, at the start of the branch when you can. They can then be reviewed on their own.
8. When each answer about the platform raises new questions, the world a change meets is still unknown. Stop the change, and say so to the owner. Explore by the rules above, committing the project to nothing. When the facts are in, the owner sets the scopes and the axioms they call for, and a new change starts from them.

## 6. Commits

1. In the message of every commit that changes the implementation, name the ids of the units that the commit serves or changes.
2. Name units by id, such as `spec-a-write-is-visible-before-its-flush`. A commit that retires a unit names it too.
3. `pnpm canon log` lists the commits that change the implementation without naming a unit. With no range, it checks the commits not yet pushed.

## 7. Pull requests and reviews

1. The description of a pull request names its [declared units](#terms). A spec the change widens is one of them.
2. Verify a finding before you act on it: reproduce it, or find it in the code. Pass on a finding that you have not verified as unverified.
3. Fix a finding against a declared unit in the same change. Such a finding says that the code does not express the unit, that no test checks it, or that the unit itself is wrong. When the change adds or widens that unit, first ask whether the request needs the claim the finding breaks. If it does not, claim less, as [writing units](writing-units.md#2-units) allows: narrow the unit, leave the result open, or write the exception a fact forces. Add a mechanism only for a claim the request needs.
4. Do not fix any other finding in this change, even one in the same area. Each fix adds code, and so widens the area. Propose it as an issue instead. An issue is visible to others, so file the ones the owner of the design agrees to. Fix a cleanup in the same change only when it is small, and touches only code the change already touches.
5. Propose a verified defect outside the scope of the change as an issue. When the owner agrees, and a spec of the main branch covers the defect, record it in this change. Write a bug inside that spec that names the issue, and a test marked to fail. When no spec covers it, the issue is the record until a change takes it on.
6. Fix a finding in the canon by editing a statement. Change a unit's kind or its place only when an edit cannot fix the finding. Each such change gives the unit a new parent and new siblings, which the next review has to check again.
7. Review the diff of each fix round before you push it. A fix round that adds a mechanism also breaks it, as step 9 of [section 3](#3-adding-or-changing-behaviour) describes. A fix round does not open the survey again. A mechanism replaced a second time is a sign that the claim it serves is wider than the request. Check that claim against the [scope](#terms) of the change and the facts: a claim the platform cannot give is a scope question for the owner.
8. A reviewer of code breaks it the way a plausible wrong implementation would, and checks that a test notices. Such a break widens a guard, or handles a case for only some members of a set.
9. Merge only when these all hold, and do not call the change ready to merge before they do:
   1. Every declared unit holds, and a test checks each of its leaves. No bug sits in a unit that the change adds or widens.
   2. Every mechanism the change adds has a test that notices when it breaks.
   3. The suite shows no regression against the main branch.
   4. Every correctness bug that a review found in the diff is fixed.

## 8. Writing the canon of an existing project

A project with code and tests but no canon gets its canon written backwards. The work starts from the tests, the code and the documents, and goes up to the theory. Follow the steps in order. Steps 3 to 6 settle the givens, and steps 5 and 6 settle them with the owner of the design. Step 7 repeats for each area of the code.

1. Work on a branch of its own.
2. Set up the checker as [`checker.md`](checker.md) describes, and create `CANON.md` with its index markers.
3. Study the project before you write a unit. Read the code, the tests, the documents, the issues, the commit history and any notes that record a decision. Look for five things:
   1. The values that recur across decisions, and the choice each one settled.
   2. The facts of the platform that the code works around.
   3. The words of the project's language.
   4. The places where the code, the tests and the documents disagree.
   5. What the project takes on and leaves out: the README, the issues closed as out of scope, and any stated non-goals.
4. Write the terms and the facts. Check each fact against its source: a specification, the code of a library, or a reproduction.
5. List the values as proposed axioms, and what the project leaves out as proposed scopes, in an open-questions section of `CANON.md`. Give each one its evidence and the choice it decides. A proposal is not an axiom: only the owner of the design decides values.
6. Settle the proposed axioms and scopes with the owner, one at a time, through the grill-with-canon skill. Write each axiom the moment the owner settles it, with a first spec and the tests that cite it.
7. Go through the tests area by area. For each area:
   1. Read the body of every test, not only its title.
   2. Group the tests by the claim they check. A claim that several tests check is one spec.
   3. Place each spec under the axiom that forces it, and nest a leaf for each case. Write the facts it relies on.
   4. Tag each test with the leaf it checks, as [writing units](writing-units.md#8-tests) describes. A test that checks a parent's basic case needs a leaf for that case.
   5. Run the tests and `pnpm canon check`, and `pnpm canon lint` and `pnpm canon logic` when the documents list their plugins. Commit the area on its own.
8. State what the tests and the documents show the project wants, as the code holds it now. Behaviour that nothing wants is not promised, and needs no unit. Where the code does not hold an axiom, tell a departure from a defect. This holds only while you write the canon of a project that has none. A change to a project with a canon starts from the canon, as [section 3](#3-adding-or-changing-behaviour) describes, and the code follows it.
   1. A departure the code makes on purpose is an exception. Write the fact that forces it. If the fact is how a library the project follows behaves, state that behaviour as the fact.
   2. A departure the owner has not ruled on is an exception too, and its question goes in an issue. When the owner rules, change the canon.
   3. A defect is a claim the code breaks. Write the spec as the axiom forces it, and a bug inside it that names the defect's issue. Pin the bug with a test marked to fail, and leave the fix to [the defect procedure](#4-fixing-a-defect).
9. Turn every gap you find into an issue: a defect, a unit with no test, a question the owner left open. Reproduce a defect before you open its issue. Link each issue from the open-questions section, and remove the entry when the issue closes.
10. The canon is complete when every test cites a leaf and `pnpm canon check` is clean. Every leaf then has a test on every target it claims. Until then, the findings of the check are the work that remains.
