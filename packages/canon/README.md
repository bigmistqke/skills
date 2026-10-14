# @bigmistqke/canon

The checker for a project's canon: the derivation links between `CANON.md`, the tests that cite it and the code it names. The protocol it serves is the [`canon` skill](https://github.com/bigmistqke/skills/tree/main/skills/canon).

```bash
pnpm add -D @bigmistqke/canon
```

```json
{
  "canon": { "documents": ["CANON.md"], "suites": "test/canon", "sources": ["src", "test"] }
}
```

`canon --help` lists the commands and every finding `check` reports. Needs Node 22 or later.

## The logic layer

A unit can hold fenced blocks next to its statement. `canon logic` hands the `alloy` blocks of the documents to the [Alloy analyzer](https://github.com/AlloyTools/org.alloytools.alloy) and asks whether each scenario can happen while every unit holds. When one cannot, it names the units a repair has to touch.

````md
```alloy vocabulary   the signatures, relations and events the units share
```alloy bounds       the scope of the search, `for 3 but 1..8 steps` by default
```alloy scenario     a situation the units must allow, on any unit
```alloy              the unit's own predicate; a bare formula is named after the unit
````

A unit with a predicate also holds a `map` block, whose lines say which words of the statement became which part of the predicate. A person reads it against both and marks it reviewed:

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
