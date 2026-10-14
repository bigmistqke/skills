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

## Plugins

The commands `lint` and `logic` come from plugins, so the rest of `canon` depends on nothing outside Node: `lint` brings the packages that read prose, and `logic` needs a Java and the Alloy analyzer. A document chooses its plugins in its frontmatter, a block between two lines of `---` at the very top, and names each by the package that holds it:

```md
---
plugins: ["@bigmistqke/canon/lint", "@bigmistqke/canon/alloy"]
---
# Canon
```

A document with no `plugins` key gets those two, as every document did before. A document that names plugins gets those and no others, and `plugins: []` names none. A plugin's commands run over the documents that name it; a file named on the command line is always run. The commands of the two plugins inside `canon` exist whatever the documents name.

Any other name is a package too. It is looked up from the project root, so it has to be a dependency of the project: a document can choose among the packages the project already has and cannot make `canon` fetch or run anything new. (The two inside `canon` are the exception: a package can name itself, so they resolve to the running copy.) The package exports a `plugin`, described by the types in `@bigmistqke/canon/plugin`:

```ts
import type { Plugin } from '@bigmistqke/canon/plugin';

export const plugin: Plugin = {
  name: 'example',
  commands: {
    lint: ({ documents }) => 0, // adds to `canon lint`
    explain: ({ args }) => 0 // a command of its own: `canon explain`
  }
};
```

A command gets the arguments, the project root, the documents that name the plugin and the plugin's own options, and returns an exit code: 0 when everything holds, 1 when there is a finding, 2 when a check could not run. The same command from several plugins runs them all, and the exit code is the highest. Its entry has to be reachable by `require`, through `main` or an `exports` entry with a `default` condition.

The frontmatter reads a small part of YAML, all of it valid YAML: the key `plugins`, with a list of strings, inline (`["a", "b"]`) or as lines that start with a dash. A name that starts with `@` must be quoted. Any other key is an error, so a misspelled key cannot silently drop a check. `check` and `generate` run what the plugins add to them, and read the frontmatter only to know which plugins apply.

## Statements said from predicates

A document that keeps a `readings` block has the statement of each unit with an Alloy predicate written from that predicate, in the same words every time, so the statement cannot say anything the predicate does not. `canon generate` writes it between two markers below the unit's heading, and `canon check` reports it when it is missing or stale. No language model is involved.

````md
```readings
noun Owner: owner
Ran: {1} has run | {1} has not run
dispose: pulse disposes {1} | pulse does not dispose {1}
```
````

A word in brackets names a term and links to it, so that a statement points at the definitions it relies on: `Freelancing: checker reports a [freelancing] for {1} | …`, `noun Unit: [unit]`. It links to the unit that holds the line, or to the unit it points at, `[checker](#term-checker)`. Only the first mention of a term in a statement is a link, a statement never links to its own unit, and the text layout has no links.

A line gives the positive and the negative reading of a set, a field, a relation or an event of the vocabulary, with `{1}`, `{2}` for the variables it is about, and `noun Name: words` gives the noun of a signature. A predicate of the vocabulary that has no line is said by its own body, with the arguments in place of its parameters. A name, a negation or a construct with no words is reported, never skipped, and a variable that is already in use gets a numbered name (`c2`) so that two different ones never read as one. [`fixtures/lifetimes/CANON.md`](fixtures/lifetimes/CANON.md) is an example: its readings, its predicates, and the statements said from them.

`canon check` also checks the words of such a document, with no Java. The terms are where the words are named, so the declaration of a word and the readings that say it belong in its term. It reports a reading of a word that nothing declares (`undeclared`), a declaration that is not in a term (`misplaced`), a reading in another unit than the declaration it says (`apart`), and a word that no claim, definition or fact uses (`unused`).

The statement is the plugin's to write: `generate` never overwrites one that a person wrote, and says so; delete it to let it be generated. A unit whose statement is generated needs no `map` block. A document without a `readings` block is left as it is.

## The logic layer

A unit can hold fenced blocks next to its statement. `canon logic` hands the `alloy` blocks of the documents to the [Alloy analyzer](https://github.com/AlloyTools/org.alloytools.alloy) and asks whether each scenario can happen while every unit holds. When one cannot, it names the units a repair has to touch.

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
