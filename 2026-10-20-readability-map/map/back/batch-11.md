Vocabulary files for this batch: canon.vocab.md, canon-plugin-alloy.vocab.md, naturalloy.vocab.md

## s026-s  (vocabulary: canon.vocab.md)

```text
When a spec cites a unit that is not an axiom, a spec, or a fact, checker reports a misnesting for the spec.
```

## s027-o  (vocabulary: canon.vocab.md)

```text
Checker reports a misnesting for every exception that cites a unit that is neither a spec nor a fact.
```

## s028-cur  (vocabulary: canon.vocab.md)

```text
For every bug:

when the bug cites a unit that is not a spec, checker reports a misnesting for the bug.
```

## s038-s  (vocabulary: canon.vocab.md)

```text
When a conflict is hidden, checker reports a finding for it.
```

## s039-o  (vocabulary: canon.vocab.md)

```text
When the project has a tracker, checker reports an untracking for every conflict that names no issue.
```

## s040-cur  (vocabulary: canon.vocab.md)

```text
For every conflict:

when the conflict names an issue that tracker does not know, checker reports a mistracking for the conflict.
```

## s050-s  (vocabulary: canon.vocab.md)

```text
When a declared test carries no tag, checker reports an uncitation for the test.
```

## s051-o  (vocabulary: canon.vocab.md)

```text
Checker reports a misaiming for every test the project declares that checks a unit that is not a claim.
```

## s052-cur  (vocabulary: canon.vocab.md)

```text
For every test:

when the test checks a claim that is refined, checker reports an overreach for the test.
```

## s062-s  (vocabulary: canon.vocab.md)

```text
When a fence names no language, checker reads it as a block of no unit.
```

## s063-o  (vocabulary: canon.vocab.md)

```text
A fence whose second word is vocabulary has the role of vocabulary.
```

## s064-cur  (vocabulary: canon.vocab.md)

```text
For every fence:

when the second word of the fence is bounds, the fence has the role of bounds.
```

## s074-s  (vocabulary: canon.vocab.md)

```text
A run exits with code 2 when any of these hold: a frontmatter lists a missing plugin, checker reports that a document has a frontmatter it cannot read, the run asks for a command that is not available, or the run gets code 2 from a plugin.
```

## s075-o  (vocabulary: canon.vocab.md)

```text
The checker runs every plugin over every document it applies to, and runs a plugin over a document it does not apply to only when the command line of a run names that document.
```

## s076-cur  (vocabulary: canon.vocab.md)

```text
For every plugin and every document:

when the document starts with no listing frontmatter and the command line of a run does not name the document, checker does not run the plugin over the document.
```

## s086-s  (vocabulary: canon.vocab.md)

```text
Every unterminated frontmatter is a frontmatter that the checker cannot read.
```

## s087-o  (vocabulary: canon.vocab.md)

```text
The checker cannot read a doubled frontmatter.
```

## s088-cur  (vocabulary: canon.vocab.md)

```text
For every dangling frontmatter:

the dangling frontmatter is a frontmatter that the checker cannot read.
```

## s097-h  (vocabulary: canon.vocab.md)

```text
When a run asks for an unavailable command, that command is reported as unknown and the run exits with code 2.
```

## s098-s  (vocabulary: canon.vocab.md)

```text
When a run asks for a command that is not available, checker reports it as an unknown command.
```

## s099-o  (vocabulary: canon.vocab.md)

```text
When a run asks for a command that is not available, the run exits with code 2.
```

## s100-cur  (vocabulary: canon.vocab.md)

```text
For every command_1:

when command_1 is available, checker does not report command_1 as an unknown command.
```

## s110-s  (vocabulary: canon.vocab.md)

```text
It must be possible for a bug that names an issue the tracker knows but has not closed, and that an expected failure checks, for the checker to report no finding for either the bug or the expected failure.
```

## s111-o  (vocabulary: canon.vocab.md)

```text
It must be possible that a conflict names two different units and an issue that tracker knows and has not closed, and checker reports no finding for the conflict.
```

## s112-cur  (vocabulary: canon.vocab.md)

```text
It must be possible that:

There are document_1 and document_2 and document_3 such that all of these hold:
- document_1 and document_3 are different
- document_1 extends document_2
- document_2 extends document_3
- document_3 is context for document_1
```

## s122-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit: when its formula names a word that has no reading, that formula cannot be said in words.
```

## s123-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit holds more than one formula, its formula cannot be said in words.
```

## s124-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when the formula of the unit cannot be said in words, checker says why the formula of the unit cannot be said.
```

## s134-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a run asks for the generate command while a unit's statement is handwritten, checker reports that statement, and the run does not exit with code 0.
```

## s135-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a run asks for a generate command, the checker says why the formula of each unit that cannot be said in words cannot be said, and if there is such a unit, the run does not exit with code 0.
```

## s136-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every word_1:

when all of these hold:
- there is a unit_1 such that a reading in unit_1 says word_1
- no unit declares word_1

then word_1 is a word that a reading says and nothing declares.
```

## s146-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document_1, document_2, unit_1, unit_2 and word_1: if document_2 is context for document_1, document_1 holds unit_1, a reading in unit_1 says word_1, document_2 holds unit_2, and unit_2 declares word_1, then word_1 is not a word that a reading says and nothing declares.
```

## s147-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
The checker names every unit that is held with units that cannot all hold in its report of a contradiction, and for every scenario that cannot happen while every held unit holds, it reports that the scenario cannot happen.
```

## s148-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when the unit holds a formula with no keyword, the analyzer is asked to hold the formula of the unit.
```

## s158-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit is held with units that cannot all hold, checker names it in its report of a contradiction.
```

## s159-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit is held with units that cannot all hold, checker names in its report of a contradiction every unit that the analyzer is asked about together with it.
```

## s160-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1 and every unit_2:

when unit_1 shares a word with unit_2, the analyzer is asked about unit_1 together with unit_2.
```

## s170-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every two different units and every word: when a block of the second unit names the word outside its declaration, checker does not report the formula of the first unit as lone on that word.
```

## s171-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a scenario of any unit names a word, the checker reports no unit's formula as lone on that word.
```

## s172-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document_1 and every document_2 and every unit_1 and every unit_2 and every word:

when all of these hold:
- document_2 is context for document_1
- document_1 holds unit_1
- document_2 holds unit_2
- a block of unit_2 names the word outside its declaration

then checker does not report the formula of unit_1 as lone on the word.
```

## s185-s  (vocabulary: naturalloy.vocab.md)

```text
When a definition's alternatives each begin with the kind of the subject, and it can be said kind by kind, verbalizer says it as a list with a noun phrase for each kind, such as "a spec that cites no axiom".
```

## s186-o  (vocabulary: naturalloy.vocab.md)

```text
When a definition has two alternatives for one kind and can be said kind by kind, verbalizer says it as one noun phrase for that kind, with the alternatives joined by or.
```

## s187-cur  (vocabulary: naturalloy.vocab.md)

```text
For every definition_1:

when definition_1 is a definition with an or inside one kind and can be said kind by kind, verbalizer says definition_1 as one run of clauses joined by commas and or.
```

## s197-s  (vocabulary: naturalloy.vocab.md)

```text
When a quantifier says no variable differs from another and holds a condition, verbalizer says it in full, with "there is" and the numbered name.
```

## s198-o  (vocabulary: naturalloy.vocab.md)

```text
The verbalizer says in full, with "there is" and the numbered name, every quantifier with several conditions one of which begins with a time phrase.
```

## s199-cur  (vocabulary: naturalloy.vocab.md)

```text
For every quantifier_1:

when quantifier_1 is a quantifier whose condition is not about its variable, verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s209-s  (vocabulary: naturalloy.vocab.md)

```text
For every list: when it is a rule whose two sides are each one clause, whose first side does not begin with a time phrase, and whose second side does, the verbalizer says it with "then" before the time phrase.
```

## s210-o  (vocabulary: naturalloy.vocab.md)

```text
When a list is a rule whose two sides are each one clause and neither side begins with a time phrase, verbalizer says the list without "then".
```

## s211-cur  (vocabulary: naturalloy.vocab.md)

```text
For every list:

when the list is a rule whose first side begins with a time phrase, verbalizer says the list with "then" at the start of the second side, on a line of its own.
```

## s221-s  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a list to have three clauses or fewer and still be longer than a line when put in a sentence.
```

## s222-o  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a list to have more than three clauses and to have clauses that begin with the same subject.
```

## s223-cur  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that:

There is a list such that the list has a clause about a pair of variables and has an item that is more than one clause.
```
