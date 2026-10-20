# Does the formula say what the author meant?

Each entry in your batch file is one unit of a specification: its claim (the unit's name read as a sentence), what it refines, the author's rationale, and the Alloy 6 formula that is meant to state it, with an exact English reading of the formula. The vocabulary file named at the top gives the readings and declarations.

Formulas written by hand often carry slips. Look for them, for each entry:
- a variable bound around the whole claim but used in only part of it, so the claim only binds when such a thing exists;
- two variables of one type that may be the same thing where the claim means two different things ("another"), or the reverse;
- an implication where an equivalence was meant, or the reverse; a direction of a relation swapped;
- a condition missing or extra; `some` where `every` was meant, or the reverse; `lone`/`one` slips;
- a negation in the wrong scope; a time operator anchored at the wrong moment;
- a claim that holds vacuously (its condition can never hold given the declarations).

Judge only against the claim, the refinement chain and the rationale. A formula that is narrower or broader than the claim on purpose, as the rationale explains, is fine. Do not flag a formula for merely being one of several reasonable readings: flag it when a careful author, reading the exact English, would say "that is not what I meant".

For each entry write:
- `verdict`: `fits` or `suspect`;
- for `suspect`: `intended`: the Alloy formula you believe the author meant (one line, same vocabulary, closed); `slip`: a kebab-case label for the kind of slip; `why`: one or two sentences, with a concrete situation where the two formulas disagree.

Write `answers-K.json` in this folder (K is in your instructions): [{"id": "s040", "verdict": "fits"}, {"id": "s091", "verdict": "suspect", "intended": "…", "slip": "…", "why": "…"}], one per entry. Read only `brief.md`, your batch file and the vocabulary file it names.
