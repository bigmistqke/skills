---
name: research-with-canon
description: Answer one stated question about the world a system runs in, such as how a platform, a specification or a library behaves at a boundary, from a source or a probe, and write the answer as a fact of the project's canon (CANON.md). Use when a unit of the canon has to claim a result that no fact backs, when a reviewer re-checks a fact that a canon diff adds, when a fact may have stopped holding, or when writing the facts of an existing project. Works with the canon skill, which takes the fact and does the design.
---

# Research with canon

This skill builds the facts of a canon: what the world the system runs in does, whatever the project wants. A researcher answers one stated question, from a source or a probe, and ends when the answer is a fact. The canon skill, beside this one, defines the units and does the design that rests on the facts.

## 1. When to use it

1. A unit of the canon has to claim a result that no fact backs.
2. A reviewer checks a fact that a canon diff adds.
3. A fact may have stopped holding, such as after a platform or a library changed its version.
4. Someone writes the canon of an existing project, and the code works around something of the platform.

## 2. The question

1. Research answers one question at a time. State the question before you start, such as "what does `Math.round` return for −0.5?".
2. Stop when the question has an answer. Turn what you notice beyond it into a new question, and hand it back.
3. The researcher sees the question, not the design. Do not ask what the design needs the answer to be. Give research an agent of its own when one is available.
4. A question about what the project wants is not research. It asks for a value, and the owner of the design decides it through the grill-with-canon skill.

## 3. Sources

1. Answer from a source. A source is one of these:
   1. A section of a specification, with a link to its version or date and the passage that answers the question, quoted.
   2. The code of a library at a version.
   3. A probe that a later session can run again ([section 5](#5-probes)).
2. Read a specification or a library with the tools that exist for it. Use an existing library for anything you do not measure, such as reading a specification or parsing a probe's output.
3. An argument is not a source. Where no source answers the question, probe.

## 4. What a fact may claim

1. A fact claims only what its source shows. State where it was observed: the platform and its version, the engine or driver, the hardware, the engine's state, and the inputs. "On macOS 14, a volume formatted as APFS with the default options treats `Readme.md` and `README.md` as one file" is a fact. "macOS treats file names that differ only in case as one file" claims every volume format from one.
2. Where a source leaves a result undefined, or leaves it to the implementation, that is the fact. Write it as such: "ECMAScript leaves the order that `Array.prototype.sort` gives to the implementation when the comparator is not consistent."
3. Name the source in the body of the fact. That is the link and the quoted passage, the library and its version, or the path of the probe.
4. State the question the fact answers in its body.

## 5. Probes

1. A probe is an experiment that answers one question about the platform: what does it do at this boundary? Isolate one thing.
2. Make the probe reproducible: committed, with the versions and the environment it ran in.
3. A probe must be able to show its fact wrong:
   1. It measures the platform alone, never through the project's own code.
   2. It varies every input that its fact speaks of, not only sizes: shapes, signs, odd and even, and the degenerate cases.
   3. It tells apart every result its fact asserts. A field set to zero is not a field never written.
   4. It records the errors the platform reports.
   5. It shows that it reached what it measures, and that the platform did not skip the work.
4. Give a probe a time limit, so that a probe that hangs does not hold the machine.
5. Some engines decide by heuristics, such as a JIT compiler. A fact about one holds only in the state it was measured in: the tier, the warm-up, the process. Run its probe again where the product runs, such as under the test runner.
6. Keep the probe, so that a later session can run it again and tell whether the fact still holds.

## 6. Reviewing a fact

1. Run the probe again that the fact names, and check that its result is the one the fact states.
2. Check that the quoted passage says what the fact claims, at the version the fact names.
3. Check that the fact claims no more than where it was observed.
4. A fact that fails one of these checks blocks the canon diff that adds it. Report what you found, and what the fact may claim instead.

## 7. Hand back

1. End when the question has an answer written as a fact, or when no source and no probe can answer it. Then say so, and say what the question would need.
2. Return the fact, its source or its probe, and the questions you noticed beyond it. When the fact shows that the platform cannot give a result the question asked about, say so plainly.
3. Hand the work to the canon skill. It places the fact, and decides what the specs claim from it.
