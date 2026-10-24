# Turn English back into Alloy

Each entry in `batch.md` is an English statement from a software specification. Write, for each one, the Alloy 6 formula that the statement says: exactly what the words say, no more and no less. Where the words leave something open, write the reading you think the author meant, and say so in `doubt`.

The vocabulary file named under each entry (in this folder) gives:
- the readings: each line `word: positive | negative` gives the English of a word of the model, so `cites: {1} [cites] {2}` means "x cites y" is `x->y in cites` (or `y in x.cites`). `noun X: …` is the noun of a signature. Square brackets and links only mark terms; ignore them.
- the Alloy declarations and definitions: use only these names. A definition (`pred p[x: T]`) can be called as `p[x]`.

Alloy 6 notes: `always`, `eventually`, `after`, `until`, `once`, `historically`, `before`, `since` are linear-time operators, evaluated at "now". `a until b`: b now or later, and a at every moment from now up to, not including, the first moment b holds. `a since b`: b now or earlier, and a at every moment after the last such moment, up to and including now. A statement that begins "It must be possible that:" is the formula after it.

Write one closed formula per entry (every variable bound by a quantifier), on one line.

Write your answers to `answers-K.json` in this folder (K is in your instructions), as a JSON array, one object per entry:
[{"id": "a123", "alloy": "…", "doubt": ""}]
Read only `brief.md`, `batch.md` and the vocabulary files it names. Do not read any other file.
