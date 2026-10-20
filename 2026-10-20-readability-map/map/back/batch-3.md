Vocabulary files for this batch: canon.vocab.md, canon-plugin-alloy.vocab.md, naturalloy.vocab.md, canon-plugin-alloy-fixtures-lifetimes.vocab.md

## s018-s  (vocabulary: canon.vocab.md)

```text
For every unit: if it is unfounded, checker reports a freelancing for it.
```

## s019-o  (vocabulary: canon.vocab.md)

```text
Checker reports a freelancing for every spec that cites neither an axiom nor a spec.
```

## s020-cur  (vocabulary: canon.vocab.md)

```text
For every exception:

when the exception cites no spec, checker reports a freelancing for the exception.
```

## s030-s  (vocabulary: canon.vocab.md)

```text
When a term cites a unit, checker reports a misnesting for it.
```

## s031-o  (vocabulary: canon.vocab.md)

```text
The checker reports a cycle for every circular unit.
```

## s032-cur  (vocabulary: canon.vocab.md)

```text
All of these hold:
- for every bug:

  when the bug is hidden, checker reports a finding for the bug
- for every conflict:

  when the conflict is hidden, checker reports a finding for the conflict
- for every test:

  when the test is misleading, checker reports a finding for the test.
```

## s042-s  (vocabulary: canon.vocab.md)

```text
For every conflict: if it is not paired, checker reports an unpairing for it.
```

## s043-o  (vocabulary: canon.vocab.md)

```text
Checker reports a finding for every misleading test.
```

## s044-cur  (vocabulary: canon.vocab.md)

```text
For every expected failure:

when the expected failure checks no bug and checks no exception, checker reports an unexplained failure for the expected failure.
```

## s054-s  (vocabulary: canon.vocab.md)

```text
When a unit repeats another, checker reports a rotting for the repeating unit.
```

## s055-o  (vocabulary: canon.vocab.md)

```text
Checker reports an orphaning for every unit that is not used and is not a conflict.
```

## s056-cur  (vocabulary: canon.vocab.md)

```text
For every unit:

when a trailer follows the unit, checker reports a misanchoring for the unit.
```

## s066-s  (vocabulary: canon.vocab.md)

```text
A fence with no second word naming a role has the role of the formula of its unit.
```

## s067-o  (vocabulary: canon.vocab.md)

```text
Checker never reads a fence that lies in a unit's own text as a block of a unit that sits in that unit.
```

## s068-cur  (vocabulary: canon.vocab.md)

```text
For every claim:

when the claim is tested, checker reports no untesting for the claim.
```

## s078-s  (vocabulary: canon.vocab.md)

```text
When a document starts with a listing frontmatter that does not list a plugin, and the command line of a run does not name the document, checker does not run the plugin over it.
```

## s079-o  (vocabulary: canon.vocab.md)

```text
When a document starts with a listing frontmatter that holds no entry, and the command line of a run does not name the document, checker runs no plugin over the document.
```

## s080-cur  (vocabulary: canon.vocab.md)

```text
For every run_1 and every plugin and every given document:

when run_1 calls the plugin, checker runs the plugin over the given document.
```

## s090-s  (vocabulary: canon.vocab.md)

```text
Checker cannot read a stray frontmatter.
```

## s091-o  (vocabulary: canon.vocab.md)

```text
When a document starts with a refused frontmatter, checker reports that the document has a frontmatter it cannot read, and every run exits with code 2.
```

## s092-cur  (vocabulary: canon.vocab.md)

```text
For every document and every refused frontmatter:

when the document starts with the refused frontmatter, checker reports that the document has a frontmatter it cannot read.
```

## s102-s  (vocabulary: canon.vocab.md)

```text
For every run: when some plugin returns code 2, the run exits with code 2; when some plugin returns code 1 and no plugin returns code 2, the run exits with code 1.
```

## s103-o  (vocabulary: canon.vocab.md)

```text
When a run gets code 2 from any plugin, the run exits with code 2.
```

## s104-cur  (vocabulary: canon.vocab.md)

```text
For every run:

when the run gets code 1 from a plugin and gets code 2 from no plugin, the run exits with code 1.
```

## s114-s  (vocabulary: canon.vocab.md)

```text
It must be possible for a document to start with a refused frontmatter, for the checker to report that the document has a frontmatter it cannot read, and for some run to exit with code 2.
```

## s115-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a document keeps readings and holds a unit that holds a formula and whose statement is not current, checker reports the statement of the unit.
```

## s116-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document and every unit:

when the document holds the unit and keeps no readings,

then all of these hold:
- checker does not write the statement of the unit when it generates
- checker does not report the statement of the unit
```

## s126-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit, checker writes the unit's statement when it generates exactly when the statement is unwritten or stale.
```

## s127-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When the statement of a unit is stale, checker writes that statement when it generates.
```

## s128-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when the statement of the unit is current, checker does not write the statement of the unit when it generates.
```

## s138-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1 and word_1: if a reading in unit_1 says word_1, some unit declares word_1, and unit_1 does not declare word_1, then word_1 is a word whose reading is in another unit than its declaration.
```

## s139-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A word that some unit declares but that no claim, definition or fact of any unit uses is a word that no claim, definition or fact uses.
```

## s140-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every term_1 and every word_1:

when all of these hold:
- term_1 declares word_1
- a reading in term_1 says word_1
- there is a unit_1 such that a claim, a definition or a fact of unit_1 uses word_1

then all of these hold:
- word_1 is not a word that a reading says and nothing declares
- word_1 is not a word declared in a unit that is not a term
- word_1 is not a word whose reading is in another unit than its declaration
- word_1 is not a word that no claim, definition or fact uses
- checker does not report the word word_1
```

## s149-h  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A search asked before any scenario is known impossible leaves no unit out.
```

## s150-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a search that leaves one unit out requires a scenario to happen, that scenario cannot happen while every held unit holds, and the search is asked after the first search is answered.
```

## s151-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a search leaves one unit out and requires some scenario to happen, then for each unit it leaves out:
- the analyzer is asked to hold that unit's formula
- the search does not require that unit to hold
- the search requires every other unit whose formula the analyzer is asked to hold to hold
```

## s152-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every scenario_1 and every unit_1:

when all of these hold:
- scenario_1 is a scenario that cannot happen while every held unit holds
- the analyzer is asked to hold the formula of unit_1
- there is no unit_2 such that the author asks about leaving out unit_2 for scenario_1

then a search that leaves one unit out and leaves out unit_1 requires scenario_1 to happen.
```

## s162-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run that asks for a logic command: when checker reports no scenario as unable to happen and no unit as held with units that cannot all hold, the run exits with code 0.
```

## s163-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A run that asks for a logic command does not exit with code 0 if the checker reports that some scenario cannot happen, or if some unit is held with units that cannot all hold.
```

## s164-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document_1 and every document_2 and every unit:

when all of these hold:
- the project lists document_1 among the documents it checks
- document_2 is context for document_1
- document_2 holds the unit
- the unit holds a formula with no keyword

then the analyzer is asked to hold the formula of the unit.
```

## s174-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every term and word, checker does not report the term's formula as lone on the word.
```

## s175-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a document keeps no readings, the checker reports no formula of a unit it holds as lone on any word.
```

## s176-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run and every check command and every unit and every word:

when the run asks for the check command and checker reports the formula of the unit as lone on the word, the run does not exit with code 0.
```

## s188-h  (vocabulary: naturalloy.vocab.md)

```text
A definition whose alternatives are all of one kind and can be said kind by kind is said as one sentence.
```

## s189-s  (vocabulary: naturalloy.vocab.md)

```text
When a definition has an alternative that does not begin with its kind, verbalizer says it as a list of the alternatives as they stand.
```

## s190-o  (vocabulary: naturalloy.vocab.md)

```text
When a definition has a run of and beside another alternative of its kind, verbalizer says it as a list of the alternatives as they stand.
```

## s191-cur  (vocabulary: naturalloy.vocab.md)

```text
For every definition_1:

when definition_1 is a definition with an alternative that says something about another unit, verbalizer says definition_1 as a list of the alternatives as they stand.
```

## s201-s  (vocabulary: naturalloy.vocab.md)

```text
For every list: if it is a run of clauses joined by and or by or, and cannot be put in a sentence, verbalizer says it as bullets.
```

## s202-o  (vocabulary: naturalloy.vocab.md)

```text
Verbalizer says a list of more than three clauses as bullets.
```

## s203-cur  (vocabulary: naturalloy.vocab.md)

```text
For every list:

when all of these hold:
- the list has an item that holds a comma
- the list has more than two clauses

then verbalizer says the list as bullets.
```

## s212-h  (vocabulary: naturalloy.vocab.md)

```text
A rule that is not on one line has its "then" on a line of its own.
```

## s213-s  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a quantifier whose variable the sentence says once to also say that no variable differs from another and to hold a condition.
```

## s214-o  (vocabulary: naturalloy.vocab.md)

```text
There can be a quantifier whose variable is the subject of the sentence and whose reading says the variable twice.
```

## s215-cur  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that:

There is a quantifier_1 such that all of these hold:
- quantifier_1 is a quantifier whose variable the sentence says once
- quantifier_1 is a quantifier whose condition is not about its variable
```

## s225-s  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a list to be a rule whose two sides are each one clause and whose first side begins with a time phrase.
```

## s226-o  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
Whenever pulse disposes an owner, every cleanup on that owner that code has registered and that has not run has run, then or at some later moment.
```

## s227-cur  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
All of these hold:
- now and at every later moment, there is no combination of cleanup_1 and owner_1 such that code disposes owner_1 after pulse disposed it, and that call runs cleanup_1, a cleanup that code has registered on owner_1 and that has not run
- now and at every later moment, there is no owner_2 such that code disposes owner_2 after pulse disposed it, and that call throws
```
