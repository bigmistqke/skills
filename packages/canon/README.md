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

The command `lint` comes from a plugin inside the package, and `logic` from [`@bigmistqke/canon-alloy`](../alloy), so the rest of `canon` depends on nothing outside Node: `lint` brings the packages that read prose, and `logic` needs a Java and the Alloy analyzer. A document chooses its plugins in its frontmatter, a block between two lines of `---` at the very top, and names each by the package that holds it:

```md
---
plugins: ["@bigmistqke/canon/lint", "@bigmistqke/canon-alloy"]
---
# Canon
```

A document with no `plugins` key gets the plugins inside `canon`, which is `lint`. A document that names plugins gets those and no others, and `plugins: []` names none. A plugin's commands run over the documents that name it; a file named on the command line is always run. The command of a plugin inside `canon` exists whatever the documents name.

Any other name is a package too. It is looked up from the project root, so it has to be a dependency of the project: a document can choose among the packages the project already has and cannot make `canon` fetch or run anything new. (The one inside `canon` is the exception: a package can name itself, so it resolves to the running copy.) The package exports a `plugin`, described by the types in `@bigmistqke/canon/plugin`:

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

The frontmatter reads a small part of YAML, all of it valid YAML: the keys `plugins` and `extends`, with a list of strings, inline (`["a", "b"]`) or as lines that start with a dash. A name that starts with `@` must be quoted. Any other key is an error, so a misspelled key cannot silently drop a check.

`extends` lists the paths of the documents this document extends, each read from the folder of the document that lists it, as a link in the document would be:

```md
---
extends: ["../canon/CANON.md"]
---
```

An extended document is context. Its units and its words are read with the document, and it is checked where it lives, so its units owe nothing in the document that extends it. A document extends what the documents it extends extend. An id that both declare is reported, because a pointer or a tag cannot say which of the two units it names. A path that names no document, and an extension that leads back to a document on the way, are refused with exit code 2. `check` and `generate` run what the plugins add to them, and read the frontmatter only to know which plugins apply.

## The logic layer

A canon can keep its claims as logic. [`@bigmistqke/canon-alloy`](../alloy) is the plugin that says them in words, one statement under each unit, and that asks the Alloy analyzer whether the claims of a canon can all be true. Install it and name it in the frontmatter of the documents that use it. A canon can extend another canon, `extends: ["../canon/CANON.md"]`, to use its words and its claims.
