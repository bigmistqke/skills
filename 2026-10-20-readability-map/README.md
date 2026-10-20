# Readability map: how lossy is ideal prose, and for whom?

October 2026, during the naturalloy readability pass (issue #29). The published review page is `pages/round4.html`. Rounds 2 and 3 are beside it.

## Question

naturalloy's words are lossless but read like a machine wrote them. If we start from the prose a careful author would write and work back to what the generator can say, how much meaning do those ideals lose, and which wordings help or hurt readers of different strength?

## Method

1. **Corpus.** 233 generated statements from the canons of canon, canon-plugin-alloy, naturalloy and the lifetimes fixture, each with its formula and the canon's whole Alloy model (`map/corpus.json`, `map/*.als`, `map/*.bounds`). Built by `map/scripts/corpus.ts`, on the pattern A branch, after the link-target fix.
2. **Ideals.** Opus and Sonnet each rewrote all 233 as ideal prose, and Haiku rewrote 39. They worked from the brief only, with no catalogue of collapses (`map/ideal/`).
3. **Back-translation.** Haiku, Sonnet and Opus each turned every version back into Alloy: the current words and every ideal, 676 texts and 2,027 formulas in all. They saw only the prose and a vocabulary file, never the formula. No batch held two versions of one statement (`map/back/`).
4. **Analyzer.** `map/equiv.mjs` checks `original <=> answer` in each canon's model, at the canon's own bounds, with glucose. It checked 1,038 distinct (statement, formula) pairs. Checked against themselves, all 213 originals came out the same. The 20 definitions are left to judges.
5. **Classification.** Opus classified the 25 cases where a strong translator brought an ideal back differently (`back/cases-verdicts.json`). Sonnet classified the 54 flips of the weak reader (`back/flips-verdicts.json`).
6. **Intent audit.** Opus and Sonnet audited all 209 units on their own, against each unit's name, what it refines and its rationale. They wrote the formula they thought was meant, and the analyzer confirmed each one parses and differs (`map/intent/`).
7. **Probes** (`probes/`). Probes 1 and 2 had readers turn sentences back into Alloy, comparing pattern A and one-line `until`. Probe 3 instead asked whether a sentence holds on given timelines, to test the `until`/`since` ladder.

## Findings

- **The ideal is nearly lossless.** The current words come back 424 times in 426 for Sonnet and Opus. The ideals are 26–31% shorter and come back 96–98% of the time. 22 of the 505 ideals lost meaning.
- **Six kinds of loss**, each a rule for the generator:
  - "another" said without `!=` in the formula (7)
  - a reading's words swapped for a near-synonym (5)
  - a relative clause that flips an argument (3)
  - a variable moved past a part of the claim that does not use it (4)
  - a condition dropped or presupposed (2)
  - a condition not fixed at its moment (1)
- **Weak readers:** Haiku recovers about 4 in 5 of either version, so shorter is not easier.
  - Helps: "reports X for every unit that is P" (+10/−5) and dropping numbered names (+4).
  - Hurts: "it" or "the other" when two things of a kind are in play, "any" in a condition, and "X is P when Q" for a rule that only goes one way.
- **Formula slips found in the canons:**
  - s067: `Sit.rel` points the wrong way.
  - s007: "used" ignores "derives from".
  - s091, s094, s125, s151: a variable is bound around a claim that only partly uses it.
  - Six statements say "another" with no `u != v`.
  - s102: the exit-code-0 case is missing.
  - s119: the condition that the unit holds a formula is missing.
  - The pattern A judge found one more, s076: the negative reading of `Given` ("does not name") reads as "some run does not" where the formula means "no run does".
- **`until`/`since` (probe 3):**
  - For `until`, R2 is as accurate as the two-part form (34/36 each) and is rated easier.
  - "Ever since" reads as including its start, so it is out.
  - For `since`, R2 keeps the explicit "after the last such moment, up to and including now" (30/36 against 32/36).

## Rerunning

- Put the Alloy 6.2.0 jar at `alloy.jar` in this folder. It is not committed.
- `map/scripts/corpus.ts` and `vocab.ts` import the plugin's own modules. Copy them into `packages/canon-plugin-alloy/src/`, then run `node src/corpus.ts <out>` and `node src/vocab.ts <out>` from that package.
- `ideal-batches.mjs`, `back-batches.mjs`, `cases.mjs`, `flips.mjs` and `intent.py` write the batches. Each stage's `brief.md` is the exact prompt its agents got.
- `back/analyze.mjs` checks every back-translation and prints the matrix. It caches verdicts in `back/verdicts.json`.
- Use this corpus as the benchmark for every collapse that ships. A strong reader must keep recovering every formula, and Haiku's recovery is the score to raise.
