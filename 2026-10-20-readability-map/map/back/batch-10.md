Vocabulary files for this batch: canon.vocab.md, canon-plugin-alloy.vocab.md, naturalloy.vocab.md, canon-plugin-alloy-fixtures-lifetimes.vocab.md

## s024-h  (vocabulary: canon.vocab.md)

```text
An axiom that cites a non-axiom is reported as misnesting.
```

## s025-s  (vocabulary: canon.vocab.md)

```text
For every fact: if it cites a unit, checker reports a misnesting for it.
```

## s026-o  (vocabulary: canon.vocab.md)

```text
When a spec cites a unit that is neither an axiom, a spec nor a fact, checker reports a misnesting for the citing spec.
```

## s027-cur  (vocabulary: canon.vocab.md)

```text
For every exception:

when the exception cites a unit that is not a spec or a fact, checker reports a misnesting for the exception.
```

## s037-s  (vocabulary: canon.vocab.md)

```text
For every bug: if the project has a runner and it is not tested, checker reports an untesting for it.
```

## s038-o  (vocabulary: canon.vocab.md)

```text
The checker reports a finding for every hidden conflict.
```

## s039-cur  (vocabulary: canon.vocab.md)

```text
For every conflict:

when project has a tracker and the conflict names no issue, checker reports an untracking for the conflict.
```

## s049-s  (vocabulary: canon.vocab.md)

```text
When a test is adrift, checker reports a finding for it.
```

## s050-o  (vocabulary: canon.vocab.md)

```text
When the project declares a test that carries no tag, checker reports an uncitation for the test.
```

## s051-cur  (vocabulary: canon.vocab.md)

```text
For every test:

when project declares the test and the test checks a unit that is not a claim, checker reports a misaiming for the test.
```

## s060-h  (vocabulary: canon.vocab.md)

```text
A document that extends another is context for it. Context is transitive through extension.
```

## s061-s  (vocabulary: canon.vocab.md)

```text
When a fence names a language and lies in the own text of a unit, checker reads it as a block of that unit.
```

## s062-o  (vocabulary: canon.vocab.md)

```text
Checker reads a fence that names no language as a block of no unit.
```

## s063-cur  (vocabulary: canon.vocab.md)

```text
For every fence:

when the second word of the fence is vocabulary, the fence has the role of vocabulary.
```

## s073-s  (vocabulary: canon.vocab.md)

```text
When the project has no tracker, checker reports no untracking for any unit.
```

## s074-o  (vocabulary: canon.vocab.md)

```text
A run exits with code 2 when any of these holds:
- some frontmatter lists a missing plugin
- checker reports that some document has a frontmatter it cannot read
- the run asks for a command that is not available
- the run gets code 2 from a plugin
```

## s075-cur  (vocabulary: canon.vocab.md)

```text
For every plugin and every document:

all of these hold:
- when the plugin applies to the document, checker runs the plugin over the document
- when the command line of a run does not name the document and checker runs the plugin over the document, the plugin applies to the document
```

## s085-s  (vocabulary: canon.vocab.md)

```text
Every unclosed frontmatter is a frontmatter that the checker cannot read.
```

## s086-o  (vocabulary: canon.vocab.md)

```text
Every unterminated frontmatter is a frontmatter that the checker cannot read.
```

## s087-cur  (vocabulary: canon.vocab.md)

```text
For every doubled frontmatter:

the doubled frontmatter is a frontmatter that the checker cannot read.
```

## s097-s  (vocabulary: canon.vocab.md)

```text
For every run and command: when the run asks for the command and the command is not available, checker reports it as an unknown command and the run exits with code 2.
```

## s098-o  (vocabulary: canon.vocab.md)

```text
When a run asks for a command that is not available, checker reports the command as an unknown command.
```

## s099-cur  (vocabulary: canon.vocab.md)

```text
For every run and every command:

when the run asks for the command and the command is not available, the run exits with code 2.
```

## s108-h  (vocabulary: canon.vocab.md)

```text
When two documents differ only in frontmatter, they either both have findings or neither does.
```

## s109-s  (vocabulary: canon.vocab.md)

```text
It must be possible to have an axiom, a spec that sits in it, a declared test that carries a tag naming the spec, and a document holding the axiom, the spec and an index, with the index matching the document, while checker reports no finding for anything.
```

## s110-o  (vocabulary: canon.vocab.md)

```text
It must be possible that a bug names an issue the tracker knows and has not closed, an expected failure checks that bug, and the checker reports no finding for the bug or for the expected failure.
```

## s111-cur  (vocabulary: canon.vocab.md)

```text
It must be possible that:

There are conflict_1 and issue_1 and unit_1 and unit_2 such that all of these hold:
- unit_1 and unit_2 are different
- conflict_1 names issue_1
- tracker knows issue_1
- tracker has not closed issue_1
- conflict_1 names unit_1
- conflict_1 names unit_2
- checker reports no finding for conflict_1
```

## s121-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit's formula names a word with no reading, or the unit holds more than one formula, its formula cannot be said in words.
```

## s122-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When the formula of a unit names a word that has no reading, that formula cannot be said in words.
```

## s123-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when the unit holds more than one formula, the formula of the unit cannot be said in words.
```

## s133-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a run asks for the check command and checker reports a unit's statement, the run does not exit with code 0.
```

## s134-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a run asks for a generate command, checker reports every handwritten statement of a unit, and if there is one, the run does not exit with code 0.
```

## s135-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run and every generate command and every unit:

when the run asks for the generate command and the formula of the unit cannot be said in words, checker says why the formula of the unit cannot be said and the run does not exit with code 0.
```

## s144-h  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A word that is undeclared, misplaced, apart, or unused is flagged.
```

## s145-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every two documents and every unit: when the project checks the first document but not the second, the second is context for the first, and the second holds the unit, then checker does not write the statement of the unit when it generates.
```

## s146-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
If a reading in a unit of a document says a word, and a document that is context for that document holds a unit that declares the word, then the word is not a word that a reading says and nothing declares.
```

## s147-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
All of these hold:
- for every unit_1:

  when unit_1 is held with units that cannot all hold, checker names unit_1 in its report of a contradiction
- for every scenario_1:

  when scenario_1 is a scenario that cannot happen while every held unit holds, checker reports that scenario_1 cannot happen.
```

## s156-h  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For each impossible scenario, each unit whose removal frees it is named in the scenario's report.
```

## s157-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every scenario and unit: if checker names the unit in its report of the scenario, leaving the unit out lets the scenario happen.
```

## s158-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
The checker names every unit that is held with units that cannot all hold in its report of a contradiction.
```

## s159-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1 and every unit_2:

when all of these hold:
- unit_1 is held with units that cannot all hold
- the analyzer is asked about unit_1 together with unit_2

then checker names unit_2 in its report of a contradiction.
```

## s169-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When checker reports a unit's formula as lone on a word, the unit holds a formula and is not a term, the word is a signature, and the formula is lone on it.
```

## s170-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
Checker does not report the formula of a unit as lone on a word that a block of some other unit names outside its declaration.
```

## s171-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1 and every unit_2 and every word:

when a scenario of unit_2 names the word, checker does not report the formula of unit_1 as lone on the word.
```

## s184-s  (vocabulary: naturalloy.vocab.md)

```text
When a list is a rule whose two sides are each one clause, and its first side does not begin with a time phrase, verbalizer says it on one line, as "when" the first side, the second side.
```

## s185-o  (vocabulary: naturalloy.vocab.md)

```text
When the alternatives of a definition each begin with the kind of the subject and the definition can be said kind by kind, verbalizer says it as a list with a noun phrase for each kind, such as "a spec that cites no axiom".
```

## s186-cur  (vocabulary: naturalloy.vocab.md)

```text
For every definition_1:

when definition_1 is a definition with two alternatives for one kind and can be said kind by kind, verbalizer says definition_1 as one noun phrase for that kind, with the alternatives joined by or.
```

## s196-s  (vocabulary: naturalloy.vocab.md)

```text
When a quantifier has no fact for its variable beside another thing, verbalizer says it in full, with "there is" and the numbered name.
```

## s197-o  (vocabulary: naturalloy.vocab.md)

```text
When a quantifier says no variable differs from another and holds a condition, the verbalizer says it in full, with "there is" and the numbered name.
```

## s198-cur  (vocabulary: naturalloy.vocab.md)

```text
For every quantifier_1:

when the following holds:

quantifier_1 is a quantifier with several conditions, one of which begins with a time phrase

then verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s207-h  (vocabulary: naturalloy.vocab.md)

```text
A list with an item that is more than one clause is said as bullets.
```

## s208-s  (vocabulary: naturalloy.vocab.md)

```text
For every list: when one alternative in a list of alternatives holds an and, verbalizer says the list as bullets that cannot be read two ways.
```

## s209-o  (vocabulary: naturalloy.vocab.md)

```text
When a list is a rule whose two sides are each one clause, and its second side begins with a time phrase but its first side does not, the verbalizer says it with "then" before the time phrase.
```

## s210-cur  (vocabulary: naturalloy.vocab.md)

```text
For every list:

when all of these hold:
- the list is a rule whose two sides are each one clause
- the list is not a rule whose first side begins with a time phrase
- the list is not a rule whose second side begins with a time phrase

then verbalizer says the list without "then".
```

## s220-s  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that: there is a list with three clauses or fewer, more than two clauses, and an item that holds a comma.
```

## s221-o  (vocabulary: naturalloy.vocab.md)

```text
A list can have three clauses or fewer and still be longer than a line when it is put in a sentence.
```

## s222-cur  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that:

There is a list such that all of these hold:
- the list has clauses that begin with the same subject
- the list has more than three clauses
```

## s232-s  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
It must be possible that there are owner_1, owner_2, and failing_cleanup_1 such that owner_2 is the nearest error handler or boundary above owner_1, and pulse eventually disposes owner_1 while failing_cleanup_1 is on it; then failing_cleanup_1 eventually runs; and then its error eventually reaches owner_2.
```
