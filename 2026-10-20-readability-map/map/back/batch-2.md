Vocabulary files for this batch: canon.vocab.md, canon-plugin-alloy.vocab.md, naturalloy.vocab.md, canon-plugin-alloy-fixtures-lifetimes.vocab.md

## s017-s  (vocabulary: canon.vocab.md)

```text
For every unit: when it is unfounded, miscited, or circular, checker reports a finding for it.
```

## s018-o  (vocabulary: canon.vocab.md)

```text
Checker reports a freelancing for every unfounded unit.
```

## s019-cur  (vocabulary: canon.vocab.md)

```text
For every spec_1:

when spec_1 cites no axiom and cites no spec, checker reports a freelancing for spec_1.
```

## s028-h  (vocabulary: canon.vocab.md)

```text
A bug that cites a non-spec is reported as misnesting.
```

## s029-s  (vocabulary: canon.vocab.md)

```text
When a conflict cites a unit, checker reports a misnesting for the conflict.
```

## s030-o  (vocabulary: canon.vocab.md)

```text
Checker reports a misnesting for every term that cites a unit.
```

## s031-cur  (vocabulary: canon.vocab.md)

```text
For every unit:

when the unit is circular, checker reports a cycle for the unit.
```

## s040-h  (vocabulary: canon.vocab.md)

```text
A conflict that names an issue the tracker does not know is reported as mistracking.
```

## s041-s  (vocabulary: canon.vocab.md)

```text
When a conflict names an issue that tracker has closed, checker reports an outdated tracking for it.
```

## s042-o  (vocabulary: canon.vocab.md)

```text
Checker reports an unpairing for every conflict that is not paired.
```

## s043-cur  (vocabulary: canon.vocab.md)

```text
For every test:

when the test is misleading, checker reports a finding for the test.
```

## s053-s  (vocabulary: canon.vocab.md)

```text
When a pointer names no target, checker reports a rotting for the pointer.
```

## s054-o  (vocabulary: canon.vocab.md)

```text
When a unit repeats a unit, checker reports a rotting for the repeating unit.
```

## s055-cur  (vocabulary: canon.vocab.md)

```text
For every unit:

when the unit is not used and is not a conflict, checker reports an orphaning for the unit.
```

## s065-s  (vocabulary: canon.vocab.md)

```text
A fence whose second word is scenario has the role of scenario.
```

## s066-o  (vocabulary: canon.vocab.md)

```text
A fence with no second word that names a role has the role of the formula of its unit.
```

## s067-cur  (vocabulary: canon.vocab.md)

```text
For every fence and every unit_1:

when the fence lies in the own text of unit_1, checker reads the fence as a block of no unit that sits in unit_1.
```

## s077-s  (vocabulary: canon.vocab.md)

```text
When a document starts with a listing frontmatter that lists a plugin, checker runs the plugin over the document.
```

## s078-o  (vocabulary: canon.vocab.md)

```text
Checker does not run a plugin over a document that starts with a listing frontmatter that does not list the plugin, unless the command line of a run names the document.
```

## s079-cur  (vocabulary: canon.vocab.md)

```text
For every plugin and every document and every listing frontmatter:

when all of these hold:
- the document starts with the listing frontmatter
- the listing frontmatter holds no entry
- the command line of a run does not name the document

then checker does not run the plugin over the document.
```

## s089-s  (vocabulary: canon.vocab.md)

```text
A circular frontmatter is a frontmatter checker cannot read.
```

## s090-o  (vocabulary: canon.vocab.md)

```text
The checker cannot read a stray frontmatter.
```

## s091-cur  (vocabulary: canon.vocab.md)

```text
For every run and every document and every refused frontmatter:

when the document starts with the refused frontmatter,

then all of these hold:
- checker reports that the document has a frontmatter it cannot read
- the run exits with code 2
```

## s101-s  (vocabulary: canon.vocab.md)

```text
When a run calls a plugin, the run gets code 0, code 1 or code 2 from the plugin.
```

## s102-o  (vocabulary: canon.vocab.md)

```text
A run that gets code 2 from any plugin exits with code 2, and a run that gets code 1 from some plugin and code 2 from none exits with code 1.
```

## s103-cur  (vocabulary: canon.vocab.md)

```text
For every run:

when the run gets code 2 from a plugin, the run exits with code 2.
```

## s113-s  (vocabulary: canon.vocab.md)

```text
It must be possible for a run to call an installed plugin that checker runs over a document whose frontmatter lists that plugin, get code 1 back from it, and itself exit with code 1.
```

## s114-o  (vocabulary: canon.vocab.md)

```text
It must be possible that a document starts with a refused frontmatter, the checker reports that the document has a frontmatter it cannot read, and some run exits with code 2.
```

## s115-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document and every unit:

when all of these hold:
- the document keeps readings
- the document holds the unit
- the unit holds a formula
- the statement of the unit is not current

then checker reports the statement of the unit.
```

## s125-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run, command, and unit: when the run asks for the `generate` or `check` command and the verbalizer fails on the formula of the unit with a fault of its own, then checker does not say why the formula of the unit cannot be said, and the run does not exit with code 0.
```

## s126-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When it generates, checker writes the statement of a unit exactly when that statement is unwritten or stale.
```

## s127-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when the statement of the unit is stale, checker writes the statement of the unit when it generates.
```

## s137-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit that is not a term declares a word, that word is indeed one declared by a unit that is not a term.
```

## s138-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
If a reading in a unit says a word that is declared, but not by that unit, then the word is a word whose reading is in another unit than its declaration.
```

## s139-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every word_1:

when all of these hold:
- a unit declares word_1
- there is no unit_1 such that a claim, a definition or a fact of unit_1 uses word_1

then word_1 is a word that no claim, definition or fact uses.
```

## s148-h  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A unit holding a formula with no keyword asks the analyzer to hold the formula.
```

## s149-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
Every search that is asked before any scenario is known to be impossible leaves no unit out.
```

## s150-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A search that leaves one unit out and requires a scenario to happen is asked after the first search is answered, and that scenario cannot happen while every held unit holds.
```

## s151-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every search and every scenario and every unit_1:

when the search leaves one unit out, requires the scenario to happen and leaves out unit_1,

then all of these hold:
- the analyzer is asked to hold the formula of unit_1
- the search does not require unit_1 to hold
- for every unit_2:

  when all of these hold:
  - the analyzer is asked to hold the formula of unit_2
  - unit_2 and unit_1 are different

  then the search requires unit_2 to hold.
```

## s160-h  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When units share a word, the analyzer is asked about them together.
```

## s161-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When the analyzer is asked about one unit together with another, the first is linked to the second through shared words.
```

## s162-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A run that asks for a logic command exits with code 0 when the checker reports no scenario as one that cannot happen and no unit is held with units that cannot all hold.
```

## s163-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run and every logic command:

when all of these hold:
- the run asks for the logic command
- at least one of these holds:
  - there is a scenario such that checker reports that the scenario cannot happen
  - there is a unit_1 such that unit_1 is held with units that cannot all hold

then the run does not exit with code 0.
```

## s173-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit and every word that is not a signature, checker does not report the unit's formula as lone on the word.
```

## s174-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
The checker never reports the formula of a term as lone on any word.
```

## s175-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document and every unit and every word:

when the document keeps no readings and holds the unit, checker does not report the formula of the unit as lone on the word.
```

## s188-s  (vocabulary: naturalloy.vocab.md)

```text
For every definition: if its alternatives are of one kind and it can be said kind by kind, verbalizer says it as one sentence.
```

## s189-o  (vocabulary: naturalloy.vocab.md)

```text
When a definition has an alternative that does not begin with its kind, the verbalizer says the definition as a list of the alternatives as they stand.
```

## s190-cur  (vocabulary: naturalloy.vocab.md)

```text
For every definition_1:

when definition_1 is a definition with a run of and beside another alternative of its kind, verbalizer says definition_1 as a list of the alternatives as they stand.
```

## s200-s  (vocabulary: naturalloy.vocab.md)

```text
When a list can be put in a sentence, the verbalizer says it in a sentence.
```

## s201-o  (vocabulary: naturalloy.vocab.md)

```text
Verbalizer says a list as bullets when it is a run of clauses joined by and or by or that cannot be put in a sentence.
```

## s202-cur  (vocabulary: naturalloy.vocab.md)

```text
For every list:

when the list has more than three clauses, verbalizer says the list as bullets.
```

## s212-s  (vocabulary: naturalloy.vocab.md)

```text
When a list is a rule with a first side and a second, but not one whose two sides are each one clause, verbalizer puts "then" at the start of the second side, on a line of its own.
```

## s213-o  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a quantifier whose variable the sentence says once also to say no variable differs from another and hold a condition.
```

## s214-cur  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that:

There is a quantifier_1 such that all of these hold:
- quantifier_1 is a quantifier whose variable is the subject of the sentence
- quantifier_1 is a quantifier whose reading says the variable twice
```

## s223-h  (vocabulary: naturalloy.vocab.md)

```text
There exists a list with a clause about a pair of variables and an item that is more than one clause.
```

## s224-s  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a list to be a rule whose second side begins with a time phrase, without being a rule whose two sides are each one clause.
```

## s225-o  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a list to be a rule whose two sides are each one clause and whose first side begins with a time phrase.
```

## s226-cur  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
Now and at every later moment, for every owner and every cleanup:

when all of these hold:
- pulse disposes the owner
- code has registered the cleanup
- the cleanup is on the owner
- the cleanup has not run

then now or at a later moment, the cleanup has run.
```
