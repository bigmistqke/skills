# The checker

How to install, configure and run the canon checker. [`SKILL.md`](SKILL.md) holds the protocol, and `pnpm canon --help` is the manual of the tool.

## 1. Install and scope

The checker is the npm package `@bigmistqke/canon`. Install it as a dev dependency:

```bash
pnpm add -D @bigmistqke/canon
```

Then declare the scope in the frontmatter of the entry document, the `CANON.md` where you run the command or the nearest one above it. `pnpm canon` runs the package's `canon` command, so the project needs no script for it:

```yaml
---
documents: [OTHER.md]
suites: test/canon
sources: [src, test]
references: []
command: pnpm canon
tracker: {kind: github, repo: owner/name}
---
```

The frontmatter reads a small part of YAML: a string, a list written as `[a, b]` or as lines that start with a dash, and a map written between braces. Every key is optional. The entry document is the nearest `CANON.md` whose frontmatter holds a setting. Paths start from the folder of that document. A setting in any other document that the project checks is refused. A project that has not moved its settings can keep them in the `canon` field of `package.json`, which serves while no document holds a setting.

- `documents`: the siblings of the entry document that are checked with it. The entry document is always checked. Default none.
- `suites`: the declared suite directory. Every test in it must cite a unit. Default `test/canon`. Keep it flat: a suite answers to a claim, not to a module.
- `sources`: the trees the checker reads for other citations and for the places specs name. Default `["src", "test"]`.
- `references`: prose documents whose links must resolve but credit no unit. Default none.
- A document that builds on another lists its path under `extends` in its frontmatter, such as `extends: ["../canon/CANON.md"]`. The other document is context: the checker reads its units and checks it where it lives. A path that names no document is refused.
- `command`: how the project runs the checker, for the advice in findings.
- `tracker`: the issue tracker the bugs and conflicts name their issues in. Default none. [Section 3](#3-issues) has the fields.
- A plugin may define a key of its own, such as `logic: {alloy: {jar: tools/alloy.jar}}`. The checker accepts it once the document lists the plugin, and refuses any other key it does not know.

## 2. Commands

```bash
pnpm canon check              # every finding; exits 1 on a finding
pnpm canon generate           # rewrite the generated regions
pnpm canon tree               # the terms, then the facts, then the derivation tree of the axioms
pnpm canon tree -v            # the same, with each unit's statement
pnpm canon tree --gaps        # only the branches that lead to an untested claim
pnpm canon tree --suspect 3   # specs with no nested specs and three or more tests
pnpm canon lint               # language checks on the prose of the documents
pnpm canon log                # commits that change the implementation without naming a unit
```

The examples use `pnpm canon`, the command this project declares in its scope.

1. `pnpm canon --help` lists every finding `check` reports.
2. `check` fails when a generated region is stale. To fix it, run `generate`. The generated regions are the index of each document and the kinds table in [`writing-units.md`](writing-units.md).
3. Add the `toc:begin` and `toc:end` markers to each new canon document, once.
4. `lint` reports passive voice, wordy phrases, repeated words, wrong articles, sentences over 25 words and paragraphs over 5 sentences. Its sentence limit follows ASD-STE100, Simplified Technical English.
5. The checker needs Node 22 or later.

## 3. Issues

A bug or a conflict names its issue on a line of its own, such as `Issue: #49`. With no `tracker` in the scope, `check` accepts any `#49` or issue URL. With one, `check` asks the tracker about every issue they name. A bug or a conflict then cannot name an issue that does not exist, a PR or a closed issue.

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
