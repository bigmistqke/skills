# @bigmistqke/canon-plugin-retext

The prose checks for [`@bigmistqke/canon`](../canon): passive voice, wordy phrases, repeated words, wrong indefinite articles, sentences over 25 words and paragraphs over 5 sentences. The sentence limit follows ASD-STE100, Simplified Technical English.

```bash
pnpm add -D @bigmistqke/canon @bigmistqke/canon-plugin-retext
```

A document names the plugin in its frontmatter:

```md
---
plugins: ["@bigmistqke/canon-plugin-retext"]
---
# Canon
```

It adds the command `canon lint`, which runs over the documents that name the plugin. Files named on the command line are checked whatever their frontmatter says: `canon lint docs/notes.md`. The text a tool generated between its markers is not read.
