# @bigmistqke/naturalloy

Alloy formulas said in English, from a table of readings, without loss. naturalloy says a formula only in words that say what it says and nothing else, and it refuses a formula it cannot say that way. It never guesses, and no language model is involved: the same formula and the same readings give the same words every time.

```bash
pnpm add @bigmistqke/naturalloy
```

```ts
import { parseReadings, verbalize, withDefinitions } from '@bigmistqke/naturalloy';

const readings = withDefinitions(
  parseReadings(`
noun Owner: an [owner]
noun Cleanup: cleanup
Ran: {1} has run | {1} has not run
on: {1} is on {2} | {1} is not on {2}
dispose: pulse disposes {1} | pulse does not dispose {1}
`, '#term-owner'),
  'sig Owner {} sig Cleanup { var on: lone Owner } var sig Ran in Cleanup {} pred dispose[o: Owner] { some o }'
);

verbalize('always all o: Owner, c: Cleanup | (dispose[o] and c.on = o) implies eventually c in Ran', readings);
// Now and at every later moment, for every owner_1 and every cleanup_1:
//   when pulse disposes owner_1 and cleanup_1 is on owner_1, then now or at a later moment, cleanup_1 has run.
```

The [canon plugin for Alloy](../canon-plugin-alloy) uses naturalloy to write the statement of each unit of a canon from its formula.

## Readings

A table of readings says each name a formula uses. A line `key: positive | negative` gives the words for a set, a field, a relation (`Clock.older`), a primed set (`Throwing'`) or a predicate, with `{1}`, `{2}` for the variables it is about. A line `noun Name: words` gives the noun of a signature, with the article it takes when the sound of the word would choose the wrong one (`noun Hour: an hour`). Blank lines and lines that start with `#` are skipped.

`withDefinitions(readings, vocabulary)` adds what the vocabulary declares: the predicates, so that a predicate with no line of its own is said by its body, and the fields and `var` signatures, whose types and changes some constructs need.

## How a formula reads

A formula reads as sentences where it can. A "there is" or "there is no" over a variable that is said once becomes a noun phrase in its place: `spec_1 cites no axiom`, `unit_1 names an issue that tracker does not know`, `another unit sits in unit_1`, `a test checks a bug that sits in unit_1`; what else is true of the variable becomes a relative clause. Up to three short clauses stand in one sentence, a subject that two clauses share is said once, and a rule that fits on a line says "when …, …". A definition whose alternatives each begin by saying what kind of thing it is about is said by cases, one noun phrase to a kind. Anything that does not fit these is said in full, with "there is … such that" and lists.

A variable is named after its noun and the number it is, `unit_1`, `unit_2`, `spec_1`, whatever the formula called it, so the name says what the variable is wherever it is read; the names are numbered again in each statement.

The temporal operators read as moments: `always` is "now and at every later moment", `eventually` "now or at a later moment", `after` "at the next moment", `before` "there is a moment before, and at it", `once` "now or at an earlier moment", `historically` "now and at every earlier moment". `until`, `since`, `releases`, `triggered` and `;` read as one clause each. A primed set or field with no line of its own reads "at the next moment, …" when it is the one changing part of its clause.

A field after a variable, `y.f`, is said with the reading of the field. Two values compared, or a field of many values compared with a variable, are said member by member, over the type the field declares.

Whatever cannot be said without loss is refused with the reason, never skipped: a name with no reading, a reading that leaves out a variable the formula gives, a set where a reading takes a variable, a construct with no words. [Issue #29](https://github.com/bigmistqke/skills/issues/29) lists, production by production of Alloy's grammar, what is said and what is not yet.

## Links

`verbalize(formula, readings, 'markdown', self)` writes links; the text layout has none. A word in brackets in a reading names a term and links to it: `[freelancing]` links to the place that holds the table, the href given to `parseReadings`, and `[checker](#term-checker)` links to the href it names. Only the first mention of a term is a link, and nothing links to `self`, the href of the place the words are for. A table held in another document is read with `base`, the path to that document, so that its links to anchors of its own (`#term-unit`) go through the path.

## Canon

naturalloy has its own [canon](CANON.md): the claims of how it reads and says a formula, each with a test that cites it.
