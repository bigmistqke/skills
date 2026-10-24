# The checker

How to install, configure and run the canon checker. [`SKILL.md`](SKILL.md) holds the protocol, and `pnpm canon --help` is the manual of the tool.

## 1. Install and scope

The checker is the npm package `@bigmistqke/canon`. Install it as a dev dependency:

```bash
pnpm add -D @bigmistqke/canon @bigmistqke/canon-plugin-retext
```

The package `@bigmistqke/canon-plugin-retext` adds the command `retext:lint`. A project that does not check its prose can leave it out. `@bigmistqke/canon-plugin-alloy` adds `alloy:logic` and the generated statements.

Then declare the scope in the frontmatter of the entry document: the nearest `CANON.md`, from the folder where you run the command upwards. The project needs no script, because `pnpm canon` runs the package's own command:

```yaml
---
plugins: ["@bigmistqke/canon-plugin-retext"]
documents: [OTHER.md]
suites: test/canon
sources: [src, test]
references: []
command: pnpm canon
tracker: {kind: github, repo: owner/name}
runners: ["@runner", vitest]
---
```

The frontmatter reads a small part of YAML. A value is a string, a list such as `[a, b]`, or a map such as `{a: b}`. A list can also be lines that start with a dash. Every key is optional.

The entry document is the nearest `CANON.md` whose frontmatter holds a setting. Paths start from the folder of that document. A setting in any other document that the project checks is refused. A project can also keep its settings in the `canon` field of `package.json`. The checker reads that field while no document holds a setting.

- `documents`: the siblings of the entry document that are checked with it. The entry document is always checked. Default none.
- `suites`: the declared suite directory. Every test in it must cite a unit. Default `test/canon`. Keep it flat: a suite answers to a claim, not to a module.
- `sources`: the trees the checker reads for other citations and for the places specs name. Default `["src", "test"]`. A tagged test in any file here checks its units. That includes a test that a module builds from a table of cases. Only a test in `suites` must carry a tag.

  A `@canon` tag or a link in any other comment here is a reference. It must name a unit, but it tests nothing and keeps no unit used. A mention such as `CANON.md#spec-x` outside a link is always a rotting.
- `references`: prose documents whose links must resolve but credit no unit. Default none.
- A document that builds on another lists its path under `extends` in its frontmatter, such as `extends: ["../canon/CANON.md"]`. The other document is context: the checker reads its units and checks it where it lives. A path that names no document is refused.
- `command`: how the project runs the checker, for the advice in findings.
- `tracker`: the issue tracker the bugs and conflicts name their issues in. Default none. [Section 3](#3-issues) has the fields.
- `runners`: the test libraries whose calls are tests. A name picks a preset: `vitest`, `jest`, `playwright` or `node`. A map such as `{calls: [specify], modifiers: [only], fails: [failing], from: [mocha], globals: true}` describes a library with no preset. A call counts only when its name comes from the library: imported from a package under `from`, or a global when the map sets `globals`. The entry `"@runner"`, in quotes, picks the helpers that a JSDoc line `@runner` marks; a marker in a project whose list leaves it out stops the run. Default every preset and `"@runner"`. With `runners: []` the project has no tests: the checker holds the canon to itself, and no claim owes a test.
- A plugin may define a key of its own, such as `logic: {alloy: {jar: tools/alloy.jar}}`. The checker accepts it once the document lists the plugin, and refuses any other key it does not know.

## 2. Commands

```bash
pnpm canon check              # every finding; exits 1 on a finding
pnpm canon generate           # rewrite the generated regions
pnpm canon tree               # the terms, then the facts, then the derivation tree of the axioms
pnpm canon tree -v            # the same, with each unit's statement
pnpm canon tree --gaps        # only the branches that lead to an untested claim
pnpm canon tree --suspect 3   # specs with no nested specs and three or more tests
pnpm canon tree spec-a-stem   # one unit and what sits in it; name more units for more trees
pnpm canon show spec-a-stem   # a unit, what it follows from, what follows from it, and its tests
pnpm canon show spec-a-stem --statement   # only its statement, as it reads; --body for the rest of its own text
pnpm canon find word word     # the units whose id or own text holds every word; exits 1 when none does
pnpm canon find word --kind spec --kind exception   # the same, for these kinds of unit
pnpm canon find word --in statement   # only where the statement holds the word: id, statement, body or all
pnpm canon find --kind fact   # no word: every unit of the kind
pnpm canon find word --ids | pnpm canon show - --statement   # --ids prints ids alone; - reads names from standard input
pnpm canon retext:lint        # language checks on the prose of the documents
pnpm canon alloy:logic        # whether the formulas of the units can all hold together
pnpm canon alloy:intent spec-a-stem            # the intent of a unit with a formula
pnpm canon alloy:intent spec-a-stem --write    # put standard input in place of that intent
pnpm canon alloy:readings     # every reading: where it is, its unit, its key and its words
pnpm canon alloy:readings Key --write "{1} runs | {1} does not run"   # reword one reading in place
pnpm canon log                # commits that change the implementation without naming a unit
pnpm canon rename spec-a-leaf a-single-leaf            # give a unit a new stem, and move every name of it
pnpm canon rename spec-a-leaf a-single-leaf --dry-run  # print each line it would change, and change nothing
```

The examples use `pnpm canon`, the command this project declares in its scope.

1. `pnpm canon --help` lists every finding `check` reports.
2. `check` fails when a generated region is stale. To fix it, run `generate`. The generated regions are the index of each document and the kinds table in [`writing-units.md`](writing-units.md).
3. Add the `toc:begin` and `toc:end` markers to each new canon document, once.
4. `retext:lint` comes from `@bigmistqke/canon-plugin-retext`, which a document names under `plugins`. It reports passive voice, wordy phrases, repeated words, wrong articles, sentences over 25 words and paragraphs over 5 sentences. Its sentence limit follows ASD-STE100, Simplified Technical English.
5. `pele:graph` comes from `@bigmistqke/canon-plugin-pele`. It prints the derivations of the documents as a Mermaid flowchart, or with `--svg` as an SVG that Pele renders.
6. Read a unit with `show`, and find it with `find`, not with a search of the document. A search finds the heading of a unit. It misses the units above it, the units that derive from it and the tests that check it. The commands `show` and `tree` take a unit as its id, as `@spec a-stem`, or in words as the tree writes it.
7. Join the reading commands in a pipeline instead of a search. With `--ids`, `find`, `show` and `tree` print one id on each line and nothing else. The commands `show`, `tree` and `alloy:intent` take `-` in place of units. It reads their names from standard input, one on each line. The command `find` exits as `grep` does: 0 when it lists a unit, 1 when it lists none, and 2 on bad usage.
8. The checker needs Node 22 or later.

### Renaming a unit

`rename <id> <stem>` gives the unit with the id a new stem. It keeps the kind: `rename spec-a-leaf a-single-leaf` leaves a spec, with the id `spec-a-single-leaf`. To change the kind, move the unit by hand: a new kind owes other parents. The command moves every name of the unit to the new id:

- The heading of the unit.
- Each pointer to it, in its own document, in the other documents and in the references. This covers the "Derives from:" and "Between:" lines and the index.
- Each `@canon` tag that names it, in a comment of a suite or a source, or in a reference. Text in a string is no tag, and it stays.
- Each link to it in a comment of a suite or a source, whose path leads from that file to its document.
- Each code span whose whole text is the id, such as the text of a link on a "Derives from:" line.
- The markers of each generated region named after the unit, such as `statement-spec-a-leaf` and `statement-scenario-1-spec-a-leaf`, which the Alloy plugin writes.

Then it writes the generated regions, as `generate` does. A rename of a clean project leaves it clean.

1. It changes only the names of the unit. A longer id that starts with the old one stays, and so does a pointer with the same fragment into another document.
2. A rename that cannot hold exits with code 2 and changes no file. It refuses an old id that names no unit, a new id that is in use, and a new stem that is not a stem. A stem is words of lowercase letters and digits, joined by single hyphens.
3. A unit of an extended document belongs to another project, so `rename` refuses it. Rename it in that project. A document of another project that points into this one is outside the scope, and its own check reports the pointers that rot.
4. `--dry-run` prints the file and the number of each line it would change, with the line before and after, and changes no file.
5. The Alloy plugin names the predicate of a unit after its id, with underscores for hyphens, and a scenario after the unit that holds it. Nothing stores those names, so they follow the rename.
6. A reviewed map is different: it holds a hash of the statement, the predicate and the map. When a statement that a person wrote links to the renamed unit, its text changes, and `alloy:logic` reports the map stale. Read it again and mark it with `alloy:logic --review`. The rename does not mark a review that nobody made.

## 3. Issues

A bug or a conflict names its issue on a line of its own, such as `Issue: #49`, when the scope has a `tracker`. With no `tracker`, the project has no issues, and a bug or a conflict owes no issue line. With one, `check` asks the tracker about every issue they name. A bug or a conflict then cannot name an issue that does not exist, a PR or a closed issue. A thread owes no issue, and `check` does not ask about an issue it names.

```yaml
tracker: {kind: github, repo: owner/name}
tracker: {kind: gitlab, project: group/subgroup/project, host: gitlab.example.com}
```

- `kind`: `github` or `gitlab`.
- `repo`: GitHub only. The repository as `owner/name`.
- `project`: GitLab only. The path `group/subgroup/project`, or the numeric id.
- `host`: the host of a self-hosted GitHub Enterprise or GitLab, with or without `https://`. The default is `github.com` or `gitlab.com`.
- `tokenEnv`: the environment variable that holds the token. The default is `GITHUB_TOKEN` or `GITLAB_TOKEN`. The checker takes the token from the environment only, never from the project.

1. A bare `#49` is an issue of the configured tracker. A URL names its own: `https://github.com/owner/name/issues/49`, or `https://gitlab.example.com/group/project/-/issues/49`.
2. A public project needs no token. GitHub allows 60 anonymous calls an hour, so the checker reads many issues in pages of a hundred. It makes one call for each hundred issue numbers, whatever the number of issues the bugs name. A missing issue of a public project is `missing-issue`.
3. A private project needs a token. On GitHub it needs the `repo` scope, or read access to Issues for a fine-grained token. On GitLab it needs `read_api`. A tracker answers a private project as if the issue were absent, so a call that fails for want of a token is `unreachable-tracker`, never `missing-issue`. A spent rate limit is `unreachable-tracker` too, and a token lifts it.
4. `missing-issue` is an issue the tracker does not hold, or a number that belongs to a PR.
5. `closed-issue` is a bug or a conflict that names a closed issue. Either the fix or the ruling landed and the unit goes, or the issue was closed too soon.
6. `unreachable-tracker` is a tracker that could not be asked. It is reported once for each project, not once for each bug.
7. `check --offline` skips the lookup and needs no network. Every other finding is still reported.

## 4. Plugins

A plugin adds commands to the checker. A document names the plugins it asks for under `plugins` in its frontmatter, each by its package, and the project installs each one. A document with no `plugins` key asks for none. A command that no listed plugin adds exits with code 2 as unknown.

A plugin adds each command of its own under the name of its package: `@bigmistqke/canon-plugin-<name>` adds `<name>:<command>`. The bare name `<command>` runs it too, while no other listed plugin has a command of that name. When two do, the bare name exits with code 2 and names the prefixed commands. A plugin's part of `check` and `generate` runs under those commands, with no prefix.

- `@bigmistqke/canon-plugin-retext` adds `retext:lint`.
- `@bigmistqke/canon-plugin-pele` adds `pele:graph`.
- `@bigmistqke/canon-plugin-alloy` adds `alloy:logic`, `alloy:intent` and `alloy:readings`, and adds to `generate` and `check`. It writes the statements of units from their formulas and reports the stale ones. It reports a unit with a formula and no intent too. [Writing units](writing-units.md#12-units-with-logic) says how to write such units. `alloy:logic` needs Java 17 or later and the jar of the Alloy analyzer:

```yaml
---
plugins: ["@bigmistqke/canon-plugin-retext", "@bigmistqke/canon-plugin-alloy"]
logic: {alloy: {jar: tools/alloy.jar, java: /opt/homebrew/opt/openjdk@21/bin/java}}
---
```

`CANON_ALLOY_JAR` and `CANON_JAVA` give the same paths, and a path in the frontmatter wins. `canon alloy:logic --review <unit>` marks a map reviewed, for a unit whose statement a person wrote in a document that keeps no readings.

`canon alloy:logic --show <scenario>` prints a world in which a scenario happens, step by step, in the readings of the document. A scenario that can happen shows only that the model allows it, so read its world when the result looks too easy.
