# Reading English back into Alloy

Each sentence below was written from an Alloy 6 formula. Write, for each one, the Alloy 6 formula that the sentence says. The formula must be exactly what the sentence says: no more, no less.

`vocab.txt` in this folder holds the vocabulary. The `key: positive | negative` lines are the readings: `{1}` and `{2}` are the things a word is said of, so `on: {1} is on {2}` means the sentence "x is on y" is the formula `y in x.on` (or `x->y in on`). `noun X: words` gives the noun of a signature. The lines after the readings are the Alloy declarations (sigs, fields, preds and funs).

Notes:
- A name such as `cleanup_1` is a variable over cleanups, and "the cleanup" is the one variable over cleanups that the sentence introduced. Name your variables as you like.
- Use only the vocabulary's names. Write one closed formula per sentence, with every variable bound by a quantifier.

Write your answers to `answers-K.json` in this folder, where K is your batch number, as a JSON array: [{"id": "...", "alloy": "...", "hard": 1-5}]. `hard` is how hard the sentence was to read: 1 is easy, 5 is very hard. Read only `vocab.txt`, `brief.md` and your own batch file. Do not read any other file.
