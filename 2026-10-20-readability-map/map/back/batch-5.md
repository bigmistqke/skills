Vocabulary files for this batch: canon.vocab.md, canon-plugin-alloy.vocab.md, naturalloy.vocab.md, canon-plugin-alloy-fixtures-lifetimes.vocab.md

## s020-s  (vocabulary: canon.vocab.md)

```text
When an exception cites no spec, checker reports a freelancing for it.
```

## s021-o  (vocabulary: canon.vocab.md)

```text
When an exception cites no fact, checker reports a freelancing for it.
```

## s022-cur  (vocabulary: canon.vocab.md)

```text
For every bug:

when the bug cites no spec, checker reports a freelancing for the bug.
```

## s032-s  (vocabulary: canon.vocab.md)

```text
All of these hold:
- checker reports a finding for every hidden bug
- checker reports a finding for every hidden conflict
- checker reports a finding for every misleading test
```

## s033-o  (vocabulary: canon.vocab.md)

```text
Checker reports a finding for every hidden bug.
```

## s034-cur  (vocabulary: canon.vocab.md)

```text
For every bug:

when project has a tracker and the bug names no issue, checker reports an untracking for the bug.
```

## s044-s  (vocabulary: canon.vocab.md)

```text
When an expected failure checks no bug and no exception, checker reports an unexplained failure for the expected failure.
```

## s045-o  (vocabulary: canon.vocab.md)

```text
Checker reports an unpinning for every plain test that checks a bug.
```

## s046-cur  (vocabulary: canon.vocab.md)

```text
All of these hold:
- for every claim:

  when project has a runner and the claim is unguarded, checker reports a finding for the claim
- for every tag:

  when the tag names no unit, checker reports a finding for the tag
- for every test:

  when the test is adrift, checker reports a finding for the test
- for every pointer:

  when the pointer names no target, checker reports a finding for the pointer
- for every unit_1:

  when unit_1 is not used and is not a conflict, checker reports a finding for unit_1
- for every unit_1:

  when a trailer follows unit_1, checker reports a finding for unit_1
- for every document:

  when the document holds a unit and holds no index, checker reports a finding for the document
- for every document:

  when the document holds an index that does not match the document, checker reports a finding for the document
- for every claim:

  when the claim names a site that no source holds, checker reports a finding for the claim
- for every unit_1:

  when unit_1 repeats a unit, checker reports a finding for unit_1.
```

## s056-s  (vocabulary: canon.vocab.md)

```text
For every unit: if a trailer follows it, checker reports a misanchoring for it.
```

## s057-o  (vocabulary: canon.vocab.md)

```text
Checker reports a misindexing for every document that holds a unit but no index.
```

## s058-cur  (vocabulary: canon.vocab.md)

```text
For every document:

when the document holds an index that does not match the document, checker reports a misindexing for the document.
```

## s068-s  (vocabulary: canon.vocab.md)

```text
When a claim is tested, checker reports no untesting for it.
```

## s069-o  (vocabulary: canon.vocab.md)

```text
The checker reports no untesting for a claim that some test the project declares checks.
```

## s070-cur  (vocabulary: canon.vocab.md)

```text
For every claim:

when a test that project does not declare checks the claim, checker reports no untesting for the claim.
```

## s080-s  (vocabulary: canon.vocab.md)

```text
When a run calls a plugin, checker runs that plugin over every given document.
```

## s081-o  (vocabulary: canon.vocab.md)

```text
A frontmatter without a plugins key holds no entry.
```

## s082-cur  (vocabulary: canon.vocab.md)

```text
For every frontmatter_1:

when at least one of these holds:
- frontmatter_1 has the flaw of an entry that starts with an at sign outside quotes
- frontmatter_1 has the flaw of a key that neither the checker nor a plugin that frontmatter_1 lists defines
- frontmatter_1 has the flaw of a list that is not closed
- frontmatter_1 has the flaw of a string that is not closed
- frontmatter_1 has the flaw of a key that appears twice
- frontmatter_1 has the flaw of a path that names no document
- frontmatter_1 has the flaw of an extension that leads back to its own document
- frontmatter_1 has the flaw of a setting in a document that is not the entry document

then frontmatter_1 is a frontmatter that the checker cannot read.
```

## s092-s  (vocabulary: canon.vocab.md)

```text
When a document starts with a refused frontmatter, checker reports that the document has a frontmatter it cannot read.
```

## s093-o  (vocabulary: canon.vocab.md)

```text
When checker reports that some document has a frontmatter it cannot read, every run exits with code 2.
```

## s094-cur  (vocabulary: canon.vocab.md)

```text
For every run and every frontmatter and every missing plugin:

when the frontmatter lists the missing plugin,

then all of these hold:
- checker reports that the project lacks the missing plugin
- the run exits with code 2
```

## s103-h  (vocabulary: canon.vocab.md)

```text
When a run gets code 2 from a plugin, the run exits with code 2.
```

## s104-s  (vocabulary: canon.vocab.md)

```text
When a run gets code 1 from some plugin but code 2 from none, it exits with code 1.
```

## s105-o  (vocabulary: canon.vocab.md)

```text
A run exits with code 0 when it gets neither code 1 nor code 2 from any plugin.
```

## s106-cur  (vocabulary: canon.vocab.md)

```text
For every document_1 and every document_2:

when document_1 is document_2 without its frontmatter,

then all of these hold:
- for every unit:

  all of these hold:
  - when document_2 holds the unit, document_1 holds the unit
  - when document_1 holds the unit, document_2 holds the unit
- when checker reports a finding for document_2, checker reports a finding for document_1
- when checker reports a finding for document_1, checker reports a finding for document_2
```

## s116-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a document holds a unit but keeps no readings, checker neither writes the unit's statement when it generates nor reports it.
```

## s117-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit holds a formula that can be said in words but has no statement, the statement of the unit is unwritten.
```

## s118-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when all of these hold:
- the unit holds a formula
- the statement of the unit sits between the markers of a generated region
- the statement of the unit differs from what its formula says
- the formula of the unit can be said in words

then the statement of the unit is stale.
```

## s128-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit's statement is current, checker does not write it when it generates.
```

## s129-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When it generates, checker never writes a handwritten statement of a unit.
```

## s130-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when the formula of the unit cannot be said in words, checker does not write the statement of the unit when it generates.
```

## s139-h  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A declared word that no claim, definition, or fact uses is unused.
```

## s140-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every term and every word: when the term declares the word, a reading in the term says the word, and some unit's claim, definition or fact uses it, then all of these hold:
- it is not a word that a reading says and nothing declares
- it is not a word declared in a unit that is not a term
- it is not a word whose reading is in another unit than its declaration
- it is not a word that no claim, definition or fact uses
- checker does not report it
```

## s141-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a document keeps no readings, no word declared by a unit it holds is reported by the checker, and none is:
- a word that a reading says and nothing declares
- a word declared in a unit that is not a term
- a word whose reading is in another unit than its declaration
- a word that no claim, definition or fact uses
```

## s142-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run and every check command and every word_1:

when the run asks for the check command and checker reports the word word_1, the run does not exit with code 0.
```

## s152-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every scenario and every unit: when the scenario cannot happen while every held unit holds, the analyzer is asked to hold the formula of the unit, and the author has not asked about leaving out any unit for the scenario, then some search that leaves out only this unit requires the scenario to happen.
```

## s153-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
If the author asks about leaving out any unit for a scenario that a search leaving one unit out requires to happen, the author also asks about leaving out, for that scenario, every unit the search leaves out.
```

## s154-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every scenario_1:

when scenario_1 is a scenario that cannot happen while every held unit holds, checker reports that scenario_1 cannot happen.
```

## s163-h  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a logic command is asked and either a scenario is reported impossible or a unit is held with others that cannot all hold, the run does not exit with code 0.
```

## s164-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When project lists a document among those it checks, and another document that is context for it holds a unit whose formula has no keyword, the analyzer is asked to hold that unit's formula.
```

## s165-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
The checker reports a unit's formula as lone on a word only if no other formula can contradict that formula. Conversely, when a unit that is not a term holds a formula that no other formula can contradict, the checker reports that formula as lone on some signature.
```

## s166-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when all of these hold:
- the unit holds a formula
- the unit is not a term
- no other formula can contradict the formula of the unit

then checker reports the formula of the unit as lone on a signature.
```

## s176-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run, check command, unit, and word: when the run asks for the check command and checker reports the formula of the unit as lone on the word, the run does not exit with code 0.
```

## s177-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
It must be possible for a document that keeps readings to hold a unit that holds a formula, whose statement is current, and whose statement checker does not report.
```

## s178-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
It must be possible that:

There is a unit such that the verbalizer fails on the formula of the unit with a fault of its own.
```

## s190-h  (vocabulary: naturalloy.vocab.md)

```text
A definition with "and" beside another alternative is said as its alternatives stand.
```

## s191-s  (vocabulary: naturalloy.vocab.md)

```text
When a definition has an alternative that says something about another unit, verbalizer says it as a list of the alternatives as they stand.
```

## s192-o  (vocabulary: naturalloy.vocab.md)

```text
When the sentence says a quantifier's variable once and the quantifier fits a noun phrase, the verbalizer says the quantifier as a noun phrase in the place of the variable, such as "sits in no unit".
```

## s193-cur  (vocabulary: naturalloy.vocab.md)

```text
For every quantifier_1:

when quantifier_1 is a quantifier whose variable is the subject of the sentence and fits a noun phrase, verbalizer says quantifier_1 with the noun phrase as the subject, such as "a tag names unit_1".
```

## s203-s  (vocabulary: naturalloy.vocab.md)

```text
For every list: if it has an item that holds a comma and has more than two clauses, verbalizer says it as bullets.
```

## s204-o  (vocabulary: naturalloy.vocab.md)

```text
Verbalizer says a list as bullets when it is longer than a line when put in a sentence.
```

## s205-cur  (vocabulary: naturalloy.vocab.md)

```text
For every list:

when the list has a clause before its last that begins with a time phrase, verbalizer says the list as bullets.
```

## s215-s  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a quantifier's variable to be said once by the sentence while its condition is not about that variable.
```

## s216-o  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a quantifier whose variable has a further condition to also be a quantifier with no fact for its variable beside another thing.
```

## s217-cur  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that:

There is a definition_1 such that all of these hold:
- definition_1 is a definition with two alternatives for one kind
- definition_1 is a definition with a run of and beside another alternative of its kind
```

## s227-s  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
Now and at every later moment: when code disposes an owner that pulse has already disposed, that call does not run any cleanup that is registered on the owner and has not run, and that call does not throw.
```

## s228-o  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
Whenever pulse disposes an owner, take any two cleanups on that owner that code has registered and that have not run: the one code registered later runs, then or later, and the earlier one does not run before that.

Whenever a failing cleanup on an owner that pulse has disposed runs, the dispose of that owner is never stopped, then or afterwards.
```

## s229-cur  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
Now and at every later moment, for every owner:

when a call enters the owner and pulse has disposed the owner, then right after, a call is throwing.
```
