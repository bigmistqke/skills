# Why did the ideal prose come back as a different formula?

`cases.md` has the cases where an ideal rewrite of a lossless statement was turned back into Alloy and the analyzer found the result is NOT equivalent to the original formula. The vocabulary files (`*.vocab.md` in this folder) give the readings and declarations.

For each case decide:
1. `cause`: one of
   - `prose-loss`: the ideal prose itself says something different from the formula (or leaves it open), so a careful reader could not recover the formula;
   - `translator`: the prose says the formula exactly, and the translator(s) erred;
   - `both`: the prose is ambiguous or slightly off AND a translator erred on top of it.
2. `what`: one sentence: the precise difference between the original formula and what the prose says (e.g. "the prose quantifies over every plugin, the formula over some plugin"; "drops the condition that the document is not the entry document").
3. `kind`: a short kebab-case label for the kind of loss, reusing labels across cases where the same thing happens (e.g. `scope-of-every`, `implication-turned-equivalence`, `dropped-condition`, `some-vs-every`, `time-edge`, `pronoun-reference`, `implicit-subject`, `negation-scope`, `collective-vs-distributive`).
4. `collapse`: the move the ideal writer made that caused it, in a few words (e.g. "folded two rules into one 'every … that …'", "said 'it' for two nouns").
5. `fix`: the smallest change to the ideal prose that would make it exact, keeping it natural.

Write `cases-verdicts.json` in this folder: a JSON array [{"case": "s091-o", "cause": "…", "what": "…", "kind": "…", "collapse": "…", "fix": "…"}], one per case. Check each claim against the formula yourself; do not trust the translations. Read only `cases-brief.md`, `cases.md` and the vocabulary files.
