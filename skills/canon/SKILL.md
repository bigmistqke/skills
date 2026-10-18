---
name: canon
description: The methodology that governs all work on a project with a CANON.md — the document of axioms, facts, specs and exceptions that is the project itself, which the code and tests express and a checker holds closed. Load at the start of every session and before any work in such a project. Use it for every choice made in the system, internal ones included; before changing an area of the code (read the theory that covers it first); when adding or changing behaviour (place it against the specs it resembles, derive it from an axiom, survey the units and boundaries it reaches, and have the canon diff reviewed before writing code); when opening a pull request or acting on review findings; when fixing a bug (trace it up to the missing spec, axiom or fact before touching code); when writing a test; when editing CANON.md; before ending a session (write every decision back into the canon); when running the canon checker; and when writing the canon of an existing project that has none. For a design question the canon does not decide, use the grill-with-canon skill.
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

## Protocol

This protocol governs all work on the project. Follow it in every session, for every change and every choice.

`CANON.md` is the project. It states what the system does and why, as claims that tests cite. The code and the tests express the canon and follow from it. The canon is not documentation of the code.

Every session starts without the theory. It does not know why the code is the way it is, and the code cannot tell it. The canon holds the theory. Each session rebuilds the theory from the canon, works under it, and writes back what it decided. The canon is how the project keeps its knowledge from one session to the next.

Documentation goes out of date because nothing checks it. The canon cannot go out of date without the checker failing. Every spec and exception has a test, and the checker reports every claim, test or link that goes stale.

This file holds what every session needs. Two files beside it hold the rest:

- [`writing-units.md`](writing-units.md): how to write, place and test units. Read it before you add, change or move a unit.
- [`checker.md`](checker.md): how to install, configure and run the checker.

## 1. Authority

1. The canon outranks every other source of intent: the code, the tests, the README, glossaries, decision records, memory, and your own assumptions.
2. Only the owner of the design decides values. Ask whenever the canon does not decide a question.
3. Ask one question at a time, and give your recommended answer with it. If the code or the canon can answer a question, read them instead of asking.
4. The owner changes the project through the canon too. When the owner asks for something the canon forbids, do not carry it out. Name the conflict and the units involved.
5. When the code contradicts the canon, the code has a defect. Follow [section 4](#4-fixing-a-defect).
6. When a test asserts something other than the spec it cites, the spec decides. Correct the test, unless the owner rules that the spec is wrong.
7. When two units contradict each other, the canon is wrong. Ask the owner which one holds. If the ruling waits, record the contradiction as a conflict, as [writing units](writing-units.md#11-conflicts) describes.
8. Change the project in one order: the canon first, then the tests, then the code. This holds when the owner confirms a change, and when you correct a canon that is wrong.
9. No change enters the project unless the canon accounts for it.

## 2. The session

1. If no `CANON.md` has settings in its frontmatter and `package.json` has no `canon` field, the project has no checker yet. Ask the owner before you set it up as [`checker.md`](checker.md) describes.
2. At the start, read the root axioms and the facts. Then read every unit that covers the area of your task.
3. Use the canon for every choice you make in the system, internal ones included. An internal choice needs the canon most, because nothing outside the system checks it.
4. When you face a choice, find the units that decide it. Choose the option they force, and cite them in your reasoning. An earlier ruling forces a new case only when the reason the ruling gives covers that case; a likeness to the ruling is not enough. The code shows what the system does, and decides nothing.
5. When the units do not decide a choice, the canon lacks a value or a spec. Settle it with the owner of the design through the grill-with-canon skill, which writes the answer into the canon. While the ruling waits, write the part of the choice that the units force. Record the rest as an open choice, as [writing units](writing-units.md#5-facts-exceptions-and-bugs) describes, and work on from there.
6. Before you change code, answer three questions from the units that cover it. They are the three things that whoever holds the [theory](#terms) can do:
   1. What does this code match in the world of the people using the system?
   2. Why is each part the way it is? The derivation lines answer this.
   3. How does the requested change fit what is already there?

   If the canon lacks a claim you need, write the unit. If an answer needs a judgement the canon cannot give, ask the owner of the design.
7. Before the session ends, write every decision you made into the canon. The next session knows only what the canon holds.
8. Write each unit for a reader who has none of your context. That reader is the next session.
9. End the session with `pnpm canon check` clean and `pnpm canon log` clean. If a document lists the Alloy plugin, end it with `pnpm canon logic` clean too. If a document lists the retext plugin, run `pnpm canon lint` on the text you wrote, and fix its findings.

## 3. Adding or changing behaviour

1. Name the existing specs that the new behaviour most resembles.
2. Say whether the change extends or refines them.
3. If it does neither, the change is a patch. Ask the owner of the design before you continue.
4. Name the axiom the behaviour follows from and the facts it relies on.
5. If no axiom yields the behaviour, stop. An axiom is missing. Ask the owner of the design.
6. Survey before you design. Steps 7 to 11 say how.
7. Find every unit the change can reach, beyond the specs you named first. The new behaviour has to fit each of them. A unit it collides with is a line missing from the canon diff. Collect three sets, and write down how you found them:
   1. The units cited by the tests of the code the change touches.
   2. The units that claim something of the same outputs or words as the change, wherever they sit in the canon. Search the canon for those words, and note the words you searched for.
   3. The documents that describe what the change touches.
8. A change may claim something of every member of a set, such as every option, input kind, target or entry point. List those members from a source: a type, a registry, a schema, the exports, a specification. A list written from memory misses members, and each missed member turns up in a later review.
9. List the boundaries the change meets:
   1. Zero, empty and missing inputs.
   2. The extremes of each type.
   3. Ties, where an input sits exactly between two outcomes.
   4. What the platform leaves undefined, or leaves to the implementation.
10. Answer each boundary from a fact. An argument is not an answer until a fact backs it. Where no fact answers a boundary, probe, as [section 5](#5-exploring) describes, and write the result as a fact. [Writing units](writing-units.md#5-facts-exceptions-and-bugs) says how to scope it.
11. The survey ends when three things hold:
    1. Every unit from step 7 has been checked.
    2. Every set from step 8 has been listed.
    3. Every boundary from step 9 has a fact, a spec, or a spec that leaves the result open on purpose.

    These lists are finite, so the survey ends. Turn what you notice beyond them into an issue.
12. Claim no more than the change needs. Widening an existing spec, such as from one input kind to every input kind, widens the scope of the change. Say so in the canon diff, so that the owner of the design sees it. Before you split a claim into leaves, count the leaves and the targets each needs a test on. Give the count in the canon diff.
13. Deduce the specs from the axiom and the facts, with a leaf for each case.
14. Before you write any code, have someone who did not write the canon diff review it: the owner of the design, or a fresh reviewer. The reviewer runs again the probes that the new facts name, and probes what still looks unanswered. The reviewer checks each new unit against the units from step 7. A finding blocks the canon diff only when it shows one of these:
    1. A declared unit contradicts another unit or a fact.
    2. A declared unit needs a fact that it does not rest on.
    3. A declared unit cannot be tested.

    Other findings go on to the implementation, or into an issue. When no finding blocks, the review of the canon diff ends.
15. Write the tests, and see them fail. Choose inputs that a plausible wrong implementation gets wrong. A test of "non-zero is true" uses 2 and −2, where a bitwise and a logical reading differ, not 1.
16. Write the code. It expresses the specs, and nothing more.
17. Break each mechanism the code adds, such as a guard, a conversion, a special case or a release. See a test that cites its unit fail for that reason, then restore the mechanism. A mechanism whose break no test notices is untested, whatever the coverage says.
18. Go through the code sites and documents from step 7. Each is changed, or unchanged for a reason you can state in one sentence.

Tests cannot tell an extension from a patch, because many implementations pass the same tests. Only the canon can.

## 4. Fixing a defect

1. Do not change the code first.
2. Write the test that the defect breaks, and see it fail.
3. Find the spec that covers the situation. If none does, a spec is missing or states too much.
4. Find the axiom or fact that decides the spec. If none does, one is missing. Ask the owner of the design.
5. Do not stop at that spec. A defect at one boundary often shows that the canon has no theory of that boundary at all. Survey, as steps 7 to 11 of [section 3](#3-adding-or-changing-behaviour) describe. Fix what the survey finds as one design, not one case at a time.
6. Write what is missing from the top down: axiom or fact, then spec. Make the test from step 2 cite the spec.
7. If the fix waits, record the defect instead. Write a bug inside the spec, name its issue when the project has a tracker, and mark the test from step 2 to fail, citing the bug. [Writing units](writing-units.md#5-facts-exceptions-and-bugs) has the rules.
8. Fix the code. If a bug recorded the defect, remove it, and make its test pass and cite the spec.
9. Never narrow a spec so that the defect falls outside it. A defect points up, at a gap in the canon, and never down, at the claim it breaks. Only the owner of the design can rule that a claim was wrong.
10. Pointing up can mean generalising a spec. The defect may show that a leaf spec stated one case of a wider claim. Then restate that spec as the wider claim, which makes it a parent. Under it, write one leaf spec for each case it covers, the defect's case included. The defect's test cites that leaf.

## 5. Exploring

1. Explore outside the implementation: in a prototype, a scratch directory or a separate branch.
2. An experiment makes no claim and commits the project to nothing. The canon does not govern it.
3. A result enters the project only through the canon, in the order of [section 1](#1-authority).
4. When the result of an experiment is in the canon, remove the experiment, or keep it only as a record of the exploration.
5. A probe is an experiment that answers one question about the platform: what does it do at this boundary? Isolate one thing, and make the probe reproducible: committed, with the versions and the environment it ran in.
6. A probe must be able to show its fact wrong:
   1. It measures the platform alone, never through the project's own code.
   2. It varies every input that its fact speaks of, not only sizes: shapes, signs, odd and even, and the degenerate cases.
   3. It tells apart every result its fact asserts. A field set to zero is not a field never written.
   4. It records the errors the platform reports.
   5. It shows that it reached what it measures, and that the platform did not skip the work.
7. Some engines decide by heuristics, such as a JIT compiler. A fact about one holds only in the state it was measured in: the tier, the warm-up, the process. Run its probe again where the product runs, such as under the test runner.
8. The result of a probe enters the canon as a fact, scoped to what the probe measured. Keep the probe so that a later session can run it again, and name it in the body of the fact. That session can then tell whether the fact still holds.

## 6. Commits

1. In the message of every commit that changes the implementation, name the ids of the units that the commit serves or changes.
2. Name units by id, such as `spec-a-write-is-visible-before-its-flush`. A commit that retires a unit names it too.
3. `pnpm canon log` lists the commits that change the implementation without naming a unit. With no range, it checks the commits not yet pushed.

## 7. Pull requests and reviews

1. The description of a pull request names the units the change adds, changes or retires. Those units are its scope. A spec the change widens is one of them.
2. Verify a finding before you act on it: reproduce it, or find it in the code. Pass on a finding that you have not verified as unverified.
3. Sort each verified finding:
   1. Fix a finding against a declared unit in the same change. Such a finding says that the code does not express the unit, that no test checks it, or that the unit itself is wrong.
   2. Turn any other finding into an issue, even one in the same area. Each fix adds code, and so widens the area. Fixing everything nearby never ends. A defect you find on the main branch goes the same way.
   3. Fix a cleanup in the same change only when it is small, and touches only code the change already touches. File any other cleanup as an issue, or drop it.
   4. An issue is visible to others. List the issues you propose, and file them when the owner of the design agrees.
4. Fix a finding in the canon by editing a statement. Change a unit's kind or its place only when an edit cannot fix the finding. Each such change gives the unit a new parent and new siblings, which the next review has to check again.
5. A fix round that only edits is new code. Review its diff for correctness before you push it, and after the first full review, review only the diff of each such round.
6. A fix round that adds or replaces a mechanism is a new design, even when the finding that asked for it is small. Survey the part it changes, as steps 7 to 11 of [section 3](#3-adding-or-changing-behaviour) describe. Then give the result a full review, not a review of its diff.
7. A reviewer of code breaks it the way a plausible wrong implementation would, and checks that a test notices. Such a break widens a guard, or handles a case for only some members of a set.
8. Merge when these hold:
   1. Every declared unit holds, and a test checks each of its leaves.
   2. Every mechanism the change adds has a test that notices when it breaks.
   3. The suite shows no regression against the main branch.
   4. Every correctness bug that a review found in the diff is fixed.

## 8. Writing the canon of an existing project

A project with code and tests but no canon gets its canon written backwards. The work starts from the tests, the code and the documents, and goes up to the theory. Follow the steps in order. Steps 3 to 6 settle the givens with the owner of the design. Step 7 repeats for each area of the code.

1. Work on a branch of its own.
2. Set up the checker as [`checker.md`](checker.md) describes, and create `CANON.md` with its index markers.
3. Study the project before you write a unit. Read the code, the tests, the documents, the issues, the commit history and any notes that record a decision. Look for four things:
   1. The values that recur across decisions, and the choice each one settled.
   2. The facts of the platform that the code works around.
   3. The words of the project's language.
   4. The places where the code, the tests and the documents disagree.
4. Write the terms and the facts. Check each fact against its source: a specification, the code of a library, or a reproduction.
5. List the values as proposed axioms in an open-questions section of `CANON.md`. Give each one its evidence and the choice it decides. A proposal is not an axiom: only the owner of the design decides values.
6. Settle the proposed axioms with the owner, one at a time, through the grill-with-canon skill. Write each axiom the moment the owner settles it, with a first spec and the tests that cite it.
7. Go through the tests area by area. For each area:
   1. Read the body of every test, not only its title.
   2. Group the tests by the claim they check. A claim that several tests check is one spec.
   3. Place each spec under the axiom that forces it, and nest a leaf for each case. Write the facts it relies on.
   4. Tag each test with the leaf it checks, as [writing units](writing-units.md#8-tests) describes. A test that checks a parent's basic case needs a leaf for that case.
   5. Run the tests and `pnpm canon check`, and `pnpm canon lint` and `pnpm canon logic` when the documents list their plugins. Commit the area on its own.
8. State the code as it behaves now. Where it does not hold an axiom, tell a departure from a defect. This holds only while you write the canon of a project that has none. A change to a project with a canon starts from the canon, as [section 3](#3-adding-or-changing-behaviour) describes, and the code follows it.
   1. A departure the code makes on purpose is an exception. Write the fact that forces it. If the fact is how a library the project follows behaves, state that behaviour as the fact.
   2. A departure the owner has not ruled on is an exception too, and its question goes in an issue. When the owner rules, change the canon.
   3. A defect is a claim the code breaks. Write the spec as the axiom forces it, and a bug inside it that names the defect's issue. Pin the bug with a test marked to fail, and leave the fix to [the defect procedure](#4-fixing-a-defect).
9. Turn every gap you find into an issue: a defect, a unit with no test, a question the owner left open. Reproduce a defect before you open its issue. Link each issue from the open-questions section, and remove the entry when the issue closes.
10. The canon is complete when every test cites a leaf and `pnpm canon check` is clean. Every leaf then has a test on every target it claims. Until then, the findings of the check are the work that remains.
