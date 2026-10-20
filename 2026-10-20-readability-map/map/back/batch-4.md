Vocabulary files for this batch: canon.vocab.md, canon-plugin-alloy.vocab.md, naturalloy.vocab.md, canon-plugin-alloy-fixtures-lifetimes.vocab.md

## s019-s  (vocabulary: canon.vocab.md)

```text
When a spec cites no axiom and no spec, checker reports a freelancing for it.
```

## s020-o  (vocabulary: canon.vocab.md)

```text
The checker reports a freelancing for every exception that cites no spec.
```

## s021-cur  (vocabulary: canon.vocab.md)

```text
For every exception:

when the exception cites no fact, checker reports a freelancing for the exception.
```

## s030-h  (vocabulary: canon.vocab.md)

```text
A term that cites a unit is reported as misnesting.
```

## s031-s  (vocabulary: canon.vocab.md)

```text
When a unit is circular, checker reports a cycle for it.
```

## s032-o  (vocabulary: canon.vocab.md)

```text
Checker reports a finding for every hidden bug, every hidden conflict and every misleading test.
```

## s033-cur  (vocabulary: canon.vocab.md)

```text
For every bug:

when the bug is hidden, checker reports a finding for the bug.
```

## s043-s  (vocabulary: canon.vocab.md)

```text
When a test is misleading, checker reports a finding for it.
```

## s044-o  (vocabulary: canon.vocab.md)

```text
When an expected failure checks neither a bug nor an exception, checker reports an unexplained failure for it.
```

## s045-cur  (vocabulary: canon.vocab.md)

```text
For every plain test:

when the plain test checks a bug, checker reports an unpinning for the plain test.
```

## s055-s  (vocabulary: canon.vocab.md)

```text
For every unit: if it is not used and not a conflict, checker reports an orphaning for it.
```

## s056-o  (vocabulary: canon.vocab.md)

```text
Checker reports a misanchoring for every unit that a trailer follows.
```

## s057-cur  (vocabulary: canon.vocab.md)

```text
For every document:

when the document holds a unit and holds no index, checker reports a misindexing for the document.
```

## s067-s  (vocabulary: canon.vocab.md)

```text
When a fence lies in the own text of a unit, checker reads it as a block of no unit that sits in that unit.
```

## s068-o  (vocabulary: canon.vocab.md)

```text
Checker reports no untesting for a tested claim.
```

## s069-cur  (vocabulary: canon.vocab.md)

```text
For every claim:

when a test that project declares checks the claim, checker reports no untesting for the claim.
```

## s079-s  (vocabulary: canon.vocab.md)

```text
When a document starts with a listing frontmatter that holds no entry, and no run names the document on its command line, checker does not run any plugin over the document.
```

## s080-o  (vocabulary: canon.vocab.md)

```text
When a run calls a plugin, checker runs the plugin over every given document.
```

## s081-cur  (vocabulary: canon.vocab.md)

```text
For every frontmatter_1:

when frontmatter_1 is not a frontmatter with a plugins key, frontmatter_1 holds no entry.
```

## s091-s  (vocabulary: canon.vocab.md)

```text
When a document starts with a refused frontmatter, checker reports that the document has a frontmatter it cannot read, and every run exits with code 2.
```

## s092-o  (vocabulary: canon.vocab.md)

```text
When a document starts with a refused frontmatter, the checker reports that the document has a frontmatter it cannot read.
```

## s093-cur  (vocabulary: canon.vocab.md)

```text
For every run:

when there is a document such that checker reports that the document has a frontmatter it cannot read, the run exits with code 2.
```

## s103-s  (vocabulary: canon.vocab.md)

```text
When a run gets code 2 from a plugin, the run exits with code 2.
```

## s104-o  (vocabulary: canon.vocab.md)

```text
A run exits with code 1 when it gets code 1 from some plugin and code 2 from none.
```

## s105-cur  (vocabulary: canon.vocab.md)

```text
For every run:

when there is no plugin such that the run gets code 1 from the plugin or gets code 2 from the plugin, the run exits with code 0.
```

## s115-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a document that keeps readings holds a unit that holds a formula whose statement is not current, checker reports that statement.
```

## s116-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit that a document keeping no readings holds, checker does not write the statement of the unit when it generates, and does not report that statement.
```

## s117-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when all of these hold:
- the unit holds a formula
- the unit has no statement
- the formula of the unit can be said in words

then the statement of the unit is unwritten.
```

## s127-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit: when its statement is stale, checker writes it when it generates.
```

## s128-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When the statement of a unit is current, checker does not write it when it generates.
```

## s129-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when the statement of the unit is handwritten, checker does not write the statement of the unit when it generates.
```

## s138-h  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A word used in one unit but declared in another is apart.
```

## s139-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every word: when a unit declares it and no unit's claim, definition, or fact uses it, then it is a word that no claim, definition or fact uses.
```

## s140-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
Suppose a term declares a word, a reading in that term says the word, and a claim, a definition or a fact of some unit uses it. Then the checker does not report the word, and the word is none of these:
- a word that a reading says and nothing declares
- a word declared in a unit that is not a term
- a word whose reading is in another unit than its declaration
- a word that no claim, definition or fact uses
```

## s141-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document and every unit_1 and every word_1:

when the document keeps no readings, holds unit_1 and unit_1 declares word_1,

then all of these hold:
- word_1 is not a word that a reading says and nothing declares
- word_1 is not a word declared in a unit that is not a term
- word_1 is not a word whose reading is in another unit than its declaration
- word_1 is not a word that no claim, definition or fact uses
- checker does not report the word word_1
```

## s151-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a search that leaves one unit out requires a scenario to happen and leaves out a unit, then: the analyzer is asked to hold that unit's formula, the search does not require the unit itself to hold, and the search requires every other unit the analyzer is asked to hold to hold too.
```

## s152-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
Take a scenario that cannot happen while every held unit holds, and for which the author asks about leaving out no unit. For each unit whose formula the analyzer is asked to hold, some search that leaves one unit out leaves out that unit and requires the scenario to happen.
```

## s153-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every search and every scenario and every unit_1:

when all of these hold:
- the search leaves one unit out
- the search requires the scenario to happen
- the search leaves out unit_1
- there is a unit_2 such that the author asks about leaving out unit_2 for the scenario

then the author asks about leaving out unit_1 for the scenario.
```

## s163-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a run asks for a logic command, and either checker reports that some scenario cannot happen or some unit is held with units that cannot all hold, the run does not exit with code 0.
```

## s164-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document the project lists among the documents it checks, the analyzer is asked to hold the formula of each unit that a document of its context holds, when that unit holds a formula with no keyword.
```

## s165-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
All of these hold:
- for every unit:

  when all of these hold:
  - the unit holds a formula
  - the unit is not a term
  - no other formula can contradict the formula of the unit

  then checker reports the formula of the unit as lone on a signature
- for every unit and every word:

  when checker reports the formula of the unit as lone on the word, no other formula can contradict the formula of the unit.
```

## s175-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a document keeps no readings and holds a unit, checker does not report that unit's formula as lone on any word.
```

## s176-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A run that asks for a check command does not exit with code 0 if checker reports the formula of any unit as lone on any word.
```

## s177-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
It must be possible that:

There are unit_1 and document_1 such that all of these hold:
- document_1 keeps readings
- document_1 holds unit_1
- unit_1 holds a formula
- the statement of unit_1 is current
- checker does not report the statement of unit_1
```

## s190-s  (vocabulary: naturalloy.vocab.md)

```text
When a definition has a run of and beside another alternative of its kind, verbalizer says it as a list of the alternatives as they stand.
```

## s191-o  (vocabulary: naturalloy.vocab.md)

```text
When a definition has an alternative that says something about another unit, verbalizer says it as a list of the alternatives as they stand.
```

## s192-cur  (vocabulary: naturalloy.vocab.md)

```text
For every quantifier_1:

when quantifier_1 is a quantifier whose variable the sentence says once and fits a noun phrase, verbalizer says quantifier_1 as a noun phrase in the place of the variable, such as "sits in no unit".
```

## s202-s  (vocabulary: naturalloy.vocab.md)

```text
When a list has more than three clauses, verbalizer says it as bullets.
```

## s203-o  (vocabulary: naturalloy.vocab.md)

```text
Verbalizer says a list as bullets when it has more than two clauses and an item that holds a comma.
```

## s204-cur  (vocabulary: naturalloy.vocab.md)

```text
For every list:

when the list is longer than a line when it is put in a sentence, verbalizer says the list as bullets.
```

## s214-s  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a quantifier's variable to be the subject of the sentence while its reading says the variable twice.
```

## s215-o  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a quantifier both to have its variable said once by the sentence and to have a condition that is not about its variable.
```

## s216-cur  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that:

There is a quantifier_1 such that all of these hold:
- quantifier_1 is a quantifier whose variable has a further condition
- quantifier_1 is a quantifier with no fact for its variable beside another thing
```

## s226-s  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
Now and at every later moment, when pulse disposes an owner, code has registered a cleanup on it that has not run, the cleanup runs now or later.
```

## s227-o  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
At no moment does a call in which code disposes an owner after pulse disposed it either throw or run a cleanup that code has registered on the owner and that has not run.
```

## s228-cur  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
All of these hold:
- now and at every later moment, for every owner_1 and every cleanup_1 and every cleanup_2:

  when all of these hold:
  - pulse disposes owner_1
  - code has registered cleanup_1
  - cleanup_1 has not run
  - code has registered cleanup_2
  - cleanup_2 has not run
  - cleanup_1 is on owner_1
  - cleanup_2 is on owner_1
  - code registered cleanup_1 before cleanup_2

  then all of these hold:
  - now or at a later moment, the following holds:

    cleanup_2 runs
  - at every moment from now until the first such moment, not including it, the following holds:

    cleanup_1 does not run
- now and at every later moment, for every owner_2 and every failing cleanup:

  when the failing cleanup runs, is on owner_2 and pulse has disposed owner_2, then now and at every later moment, the dispose of owner_2 has not been stopped.
```
