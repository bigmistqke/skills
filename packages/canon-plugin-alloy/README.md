# @bigmistqke/canon-plugin-alloy

The Alloy plugin for [`@bigmistqke/canon`](../canon): the logic of a canon said in words, and checked by the [Alloy analyzer](https://github.com/AlloyTools/org.alloytools.alloy). It writes the statement of each unit from its formula, so that the statement cannot say what the logic does not, and it asks whether the claims of a canon contradict each other.

```bash
pnpm add -D @bigmistqke/canon @bigmistqke/canon-plugin-alloy
```

A document names the plugin in its frontmatter:

```md
---
plugins: ["@bigmistqke/canon-plugin-alloy"]
---
# Canon
```

It adds the command `logic`, writes the statements when you run `canon generate`, and reports the statements and the words that are not in order when you run `canon check`. A canon that extends another (`extends: ["../canon/CANON.md"]` in its frontmatter) says its statements with the readings of the other canon, and its model holds the claims of the other.

## Statements said from predicates

A document that keeps a `readings` block has the statement of each unit with an Alloy predicate written from that predicate, in the same words every time, so the statement cannot say anything the predicate does not. `canon generate` writes it between two markers below the unit's heading, and `canon check` reports it when it is missing or stale. No language model is involved.

````md
```readings
noun Owner: owner
Ran: {1} has run | {1} has not run
dispose: pulse disposes {1} | pulse does not dispose {1}
```
````

A statement reads as sentences where it can. A "there is" or "there is no" over a variable that is said once becomes a noun phrase in its place: `spec_1 cites no axiom`, `unit_1 names an issue that tracker does not know`, `another unit sits in unit_1`, `a test checks a bug that sits in unit_1`; what else is true of the variable becomes a relative clause. Up to three short clauses stand in one sentence, a subject that two clauses share is said once, and a rule that fits on a line says "when …, …". A definition whose alternatives each begin by saying what kind of thing it is about is said by cases, one noun phrase to a kind: `unit_1 is unfounded exactly when unit_1 is one of these:` a spec that cites no axiom and cites no spec, an exception that cites no spec or cites no fact, a bug that cites no spec. Anything that does not fit these is said in full, with "there is … such that" and lists.

A variable is named after its noun and the number it is, `unit_1`, `unit_2`, `spec_1`, whatever the formula called it, so the name says what the variable is wherever it is read; the names are numbered again in each statement. A word in brackets names a term and links to it, so that a statement points at the definitions it relies on: `Freelancing: checker reports a [freelancing] for {1} | …`, `noun Unit: [unit]`, where the first variable of the type links to the term. It links to the unit that holds the line, or to the unit it points at, `[checker](#term-checker)`. Only the first mention of a term in a statement is a link, a statement never links to its own unit, and the text layout has no links.

A line gives the positive and the negative reading of a set, a field, a relation or an event of the vocabulary, with `{1}`, `{2}` for the variables it is about, and `noun Name: words` gives the noun of a signature. A predicate of the vocabulary that has no line is said by its own body, with the arguments in place of its parameters. A name, a negation or a construct with no words is reported, never skipped, and a variable that is already in use gets a numbered name (`c2`) so that two different ones never read as one. [`fixtures/lifetimes/CANON.md`](fixtures/lifetimes/CANON.md) is an example: its readings, its predicates, and the statements said from them.

`canon check` also checks the words of such a document, with no Java. The terms are where the words are named, so the declaration of a word and the readings that say it belong in its term. It reports a reading of a word that nothing declares (`undeclared`), a declaration that is not in a term (`misplaced`), a reading in another unit than the declaration it says (`apart`), and a word that no claim, definition or fact uses (`unused`).

A scenario, a block that says a situation must be possible, is said the same way, just above its block, under the words "It must be possible that:", so that a reader sees a possibility claim and not a rule. Its statement goes by the place of the scenario among the scenarios of its unit, `scenario-1-term-checker`, and `check` reports it when it is missing, stale or cannot be said.

A document that extends another (`extends` in its frontmatter) says its statements with the readings of the extended document too, and a word of the extended document links to that document, `[unit](../canon/CANON.md#term-unit)`. The words the extended document declares count as declared in the words check. `generate` writes statements only in the documents the project checks, never in the ones they extend.

The statement is the plugin's to write: `generate` never overwrites one that a person wrote, and says so; delete it to let it be generated. A unit whose statement is generated needs no `map` block. A document without a `readings` block is left as it is.

## The logic layer

A unit can hold fenced blocks next to its statement. `canon logic` hands the `alloy` blocks of the documents to the [Alloy analyzer](https://github.com/AlloyTools/org.alloytools.alloy) and asks whether each scenario can happen while every unit holds. When one cannot, it names the units a repair has to touch.

The claims of the documents a document extends join its model, so a claim of the document that contradicts one of theirs is found, and the report names both. A group of units that holds no block of the checked document is left to the document that holds it. The analyzer is started once for each run, as many at a time as the machine has processors; `CANON_ALLOY_JOBS` sets another number.

````md
```alloy vocabulary   the signatures, relations and events the units share
```alloy bounds       the scope of the search, `for 3 but 1..8 steps` by default
```alloy scenario     a situation the units must allow, on any unit
```alloy              the unit's own predicate; a bare formula is named after the unit
````

A unit whose statement a person wrote and that has a predicate also holds a `map` block, whose lines say which words of the statement became which part of the predicate. A unit with a generated statement needs none. A person reads it against both and marks it reviewed:

````md
```map reviewed=3d2900e5d6b6
"each cleanup that code has registered on the owner" -> c in Registered and c.on = o
"did not run" -> c not in Ran
```
````

`canon logic` reports a map that is missing or malformed, a fragment that is not in the statement, a part that is not in the predicate, and a sentence of the statement that no line covers. It also reports a map that is unreviewed, or stale: the mark is a hash of the statement, the predicate and the map, so a change to any of them needs a new review. `canon logic --review <unit>` writes the mark, as the reviewer's word that the map is right. These checks read text only and need no Java.

The logic checks need the analyzer's jar and a Java 17 or later, which `canon` does not install:

```json
{
  "canon": { "logic": { "alloy": { "jar": "tools/alloy.jar", "java": "/opt/homebrew/opt/openjdk@21/bin/java" } } }
}
```

`CANON_ALLOY_JAR` and `CANON_JAVA` give the same paths. The result holds only within the bounds. See [`fixtures/lifetimes/CANON.md`](fixtures/lifetimes/CANON.md).
