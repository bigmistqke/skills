# Claim-first probe: is "X when all of these hold" misread as "exactly when"?

October 2026, after naturalloy's `claim-first` pass (PR #84). The readability map (`2026-10-20-readability-map`) found that weak readers take "X is P when Q" for a rule that only goes one way as "exactly when". `claim-first` now says a rule whose first side is bullets with its second side first: "Pulse has disposed p when all of these hold: …" instead of "When all of these hold: … then pulse has disposed p." This probe asks whether the claim-first statements are misread more often than the same statements in the old order.

## Method

1. **Corpus** (`build/statements.json`, `key/corpus.json`). Every generated statement of the canons of canon, canon-plugin-alloy and naturalloy (252), said in text layout with every pass and again with `claim-first` off, using the readings the Alloy plugin builds for each document (`readingsOf`, with the documents it extends as context). The pass changes 42 of them: these are the targets, and the two versions differ only in order. As controls, 15 rules said on one line ("When a bug cites no spec, checker reports a freelancing for the bug."), five per canon and three of each five with a first side joined by "and". `claim-first` leaves the controls unchanged. Built by `scripts/corpus.ts` and `scripts/packets.mjs` on branch `naturalloy/intents` at b0c8d82, with naturalloy changes not yet committed in the working tree (later merged in #87); the claim-first pass itself is as merged in #84.
2. **Model and vocabulary** (`build/*.als`, `*.bounds`, `*.vocab.md`). Each canon's whole Alloy model and bounds (`for 6`), and the vocabulary in the map's form: readings, declarations and definitions, never a claim. These are regenerated for the current canons.
3. **Packets** (`readers/A`, `readers/B`). A holds the claim-first words and B the old-order words. Each holds all 57 statements under opaque ids, shuffled independently. `brief.md` is the map's back-translation brief (`map/back/brief.md`), with the answer key renamed `id`. Which packet is which version, and what each id stands for, is only in `key/key.json`.
4. **Scoring** (`scripts/score.mjs`, adapted from the map's `equiv.mjs`). Each answer is checked as `(formula) <=> (answer)` in the canon's model and bounds, with glucose. A miss is checked again against two misreadings of the rule the statement is about: two-way (the rule as `iff`) and converse (the rule read the other way round). Both are built from naturalloy's IR, with the rule node swapped, and said back as Alloy by `meaning`. For a target, the rule is the claim-first rule. For a control, it is the one-line rule. Verdicts are cached in `<out>/verdicts-cache.json`.
5. **Sanity** (`sanity/`, `scripts/sanity.mjs`). These answer files check the scorer, not readers:
   - The formulas themselves: 57/57 equivalent in both packets.
   - The IR said back as Alloy: 57/57 equivalent in both packets.
   - Each claim-first formula with one `implies` at a time swapped to `iff`: 47 swaps across the 42 targets. Every target has exactly one swap flagged two-way, and that swap is at its claim-first rule. The 5 swaps of a target's other `implies` are not flagged. The 6 pass-order formulas of naturalloy have no `implies`, because their condition is in the signature types, so for those the swap is the IR's two-way formula.

## Running readers

Give each reader one packet folder (copy `readers/A` or `readers/B`) and tell it its K. It reads `brief.md`, `batch.md` and the vocabulary files, and writes `answers-K.json` next to them. Map readers so that no reader sees both versions. Use several readers per packet and per model tier: the map found the effect in Haiku.

## Scoring

    node scripts/score.mjs                      # every readers/*/answers-*.json, into scores/
    node scripts/score.mjs --out DIR [--packet A|B] FILE ...

It prints equivalent/n per version and per reader, split into targets and controls, with counts of two-way and converse misreads. `scores/report.txt` lists each miss with its statement, formula, answer, the reader's doubt, and its kind. Allow time for canon-plugin-alloy: a chunk of 25 checks there takes 15 to 27 minutes, while canon and naturalloy take seconds. The sanity run took about 50 minutes.

Paths: `REPO` (repository checkout, for `corpus.ts`), `JAVA` (openjdk 21) and `ALLOY_JAR` (Alloy 6.2.0) are read from the environment, with the author's machine as the default.

## Readers

Six readers, three per packet, each seeing only its own packet: two Haiku (`h1`, `h2`) and one Sonnet (`s1`). Their answers are `readers/A/answers-*.json` and `readers/B/answers-*.json`; each holds 57 answers. One Sonnet reader (B/s1) touched a file outside its folder (`/tmp/dummy`, through a stray shell command); it read no other packet.

## Findings

**Claim-first statements are misread as definitions; the old order is not.**

| Reader | Claim-first (packet A), targets | Old order (packet B), targets |
|---|---|---|
| Haiku h1 | 40/42, 0 two-way | 42/42 |
| Haiku h2 | 33/42, **7 two-way** | 41/42 |
| Sonnet s1 | 42/42 | 41/42 |
| All | 115/126 (91%), 7 two-way | 124/126 (98%), 0 two-way |

The controls, which `claim-first` leaves unchanged, score alike in both packets: 45/45 and 44/45. Every two-way misread is a claim-first target, and no old-order answer is one. All seven come from one of the two Haiku readers; the other Haiku reader and Sonnet read both orders correctly.

**Why.** "X when …" is also the shape of a definition ("a number is even when it is divisible by two"), which goes both ways. A claim first, followed by a list of conditions, reads as the complete list of when X holds. One reader said so in its doubt, for `spec-a-flawed-frontmatter-is-refused` ("The checker cannot read a frontmatter when at least one of these holds: …"): *"Read as a definition (iff), since the entry describes when the checker cannot read a frontmatter."* The old order, "When …, then X", reads as a rule, and no reader took it for a definition. This confirms, for `claim-first`, the readability map's finding that weak readers take "X is P when Q" for a one-way rule as "exactly when".

**Which statements.** The seven are rules of canon-plugin-alloy's canon whose claim is a property of the rule's own subject, the shape of a definition: a statement is current, stale, unwritten or handwritten; a formula cannot be said in words; a word is undeclared; a frontmatter cannot be read. `scores/report.txt` lists each with its formula, answer and doubt.

**Limits.** One weak reader carries the effect, on 7 of 42 statements, and three readers per packet is a small sample. The direction matches the earlier study and the reason the reader gave.

**Consequence.** Revert `claim-first`, or give its "when" a one-way word ("X if …") and probe that variant the same way before keeping it.
