# Strict judge: do these words say exactly what the formula says?

Each entry gives an Alloy 6 formula and the words a verbalizer generated for it. The vocabulary files (`*.vocab.md` here) give the readings. A variable alone of its noun is now written "the unit" instead of "unit_1".

For each entry, look for a counter-instance: a situation where a careful reader of the words would judge the claim true and the formula false, or the reverse. Pay special attention to "the <noun>": could it refer to anything other than the one variable the quantifier introduced (another thing of that noun named elsewhere in the words, a thing from an earlier clause)? Do not flag style.

Write `verdicts.json` here: [{"id": "s012", "verdict": "lossless" | "lossy", "counter": "for lossy: the situation and the two readings"}]. Read only `brief.md`, `batch.md` and the vocabulary files.
