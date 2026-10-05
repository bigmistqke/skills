# skills

Claude Code plugins by [bigmistqke](https://github.com/bigmistqke).

## Install

```
/plugin marketplace add bigmistqke/skills
/plugin install canon@bigmistqke
```

Or copy a skill directory from `plugins/<plugin>/skills/` into a project's `.claude/skills/`.

## Plugins

### canon

A project keeps its theory — how the program meets the world it serves, in the sense of Peter Naur's [Programming as Theory Building](https://gwern.net/doc/cs/algorithm/1985-naur.pdf) — in a `CANON.md` of axioms, facts, specs and exceptions. Tests cite the units, the code expresses them, and a checker reports every claim, test or link that goes stale.

- `canon`: the protocol for working in a project with a `CANON.md`, and the checker (`cli.ts`, `lint.ts`).
- `grill-with-canon`: settle a design question the canon does not decide by interviewing the owner of the design, and write each answer into the canon.

The checker runs under Node 22.18 or later with no dependencies. A project points a script at it and declares its scope in `package.json`; [`checker.md`](plugins/canon/skills/canon/checker.md) has the details. Copying the `canon` skill into `.claude/skills/canon/` gives that script a stable path. `canon lint` also needs the unified and retext packages this repository lists as dev dependencies.

## Development

```
pnpm install
pnpm test
```

## License

MIT
