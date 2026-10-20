# What helps and what hurts a weak reader?

`flips.md` holds statements that a weak reader (a small model) turned back into Alloy twice: once from the current, machine-like but exact words, and once from an ideal rewrite. In each case it got one version right and the other wrong (the analyzer decided "same" or "differs" against the original formula). HURT means the rewrite made it worse; HELPED means the rewrite made it better.

For each case:
1. `error`: one sentence naming the reader's mistake in the version it got wrong (e.g. "read 'every unit that is P or Q' as P and Q"; "dropped the 'and the document holds the unit' condition").
2. `feature`: which feature of the wording it read wrongly: a short kebab-case label, reused across cases (e.g. `long-bullet-list`, `nested-lists`, `numbered-variables`, `relative-clause-chain`, `pronoun-it`, `merged-rules`, `consequent-first`, `every-that`, `one-line-density`, `time-phrase`, `negation`).
3. `lesson`: a few words: what the generator should do or avoid for weak readers.

Write `flips-verdicts.json` in this folder: [{"id": "s012", "dir": "HURT|HELPED", "error": "…", "feature": "…", "lesson": "…"}]. Check against the formula yourself. Read only `flips-brief.md` and `flips.md`.
