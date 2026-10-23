# @bigmistqke/canon-plugin-pele

The Pele plugin for [`@bigmistqke/canon`](../canon): the derivations of a canon drawn as a graph. Each axiom, fact, spec, exception and bug is a node, in a colour of its own kind. An edge leads from each unit to the units that follow from it. It is solid from the unit a unit sits in, and dotted from a unit on its "Derives from:" line. The graph draws no term, no conflict and no thread, since no derivation reaches them.

```bash
pnpm add -D @bigmistqke/canon @bigmistqke/canon-plugin-pele
```

A document names the plugin in its frontmatter:

```md
---
plugins: ["@bigmistqke/canon-plugin-pele"]
---
# Canon
```

`canon pele:graph` (or `canon graph` while no other plugin has a command of that name) prints the graph of the documents that name the plugin as a Mermaid flowchart. `canon pele:graph --svg` prints the SVG that [Pele](https://github.com/obsidianmd/pele) renders from it instead. The SVG carries its own colours for a light and a dark page. It stays readable where a page shows it as an image, as GitHub shows a committed one.

```bash
pnpm canon pele:graph --svg > GRAPH.svg
```

A unit that a drawn document derives from, in a document the plugin does not run over, ends at a node that names it.

[`CANON.md`](CANON.md) states what the plugin does, and why.
