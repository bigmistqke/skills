Vocabulary files for this batch: canon.vocab.md, canon-plugin-alloy.vocab.md, naturalloy.vocab.md, canon-plugin-alloy-fixtures-lifetimes.vocab.md

## s023-s  (vocabulary: canon.vocab.md)

```text
When a unit is miscited, checker reports a misnesting for it.
```

## s024-o  (vocabulary: canon.vocab.md)

```text
When an axiom cites a unit that is not an axiom, checker reports a misnesting for the citing axiom.
```

## s025-cur  (vocabulary: canon.vocab.md)

```text
For every fact:

when the fact cites a unit, checker reports a misnesting for the fact.
```

## s035-s  (vocabulary: canon.vocab.md)

```text
When a bug names an issue the tracker does not know, checker reports a mistracking for the bug.
```

## s036-o  (vocabulary: canon.vocab.md)

```text
When a bug names an issue that tracker has closed, checker reports an outdated tracking for the bug.
```

## s037-cur  (vocabulary: canon.vocab.md)

```text
For every bug:

when project has a runner and the bug is not tested, checker reports an untesting for the bug.
```

## s047-s  (vocabulary: canon.vocab.md)

```text
When the project has a runner, checker reports an untesting for every unguarded claim.
```

## s048-o  (vocabulary: canon.vocab.md)

```text
Checker reports a rotting for every tag that names no unit.
```

## s049-cur  (vocabulary: canon.vocab.md)

```text
For every test:

when the test is adrift, checker reports a finding for the test.
```

## s059-s  (vocabulary: canon.vocab.md)

```text
When a claim names a site that no source holds, checker reports a mislocation for the claim.
```

## s060-o  (vocabulary: canon.vocab.md)

```text
When a document extends another, the other is context for it, and so is every document that is context for the other.
```

## s061-cur  (vocabulary: canon.vocab.md)

```text
For every fence_1 and every unit:

when all of these hold:
- fence_1 is a fence that names a language
- fence_1 lies in the own text of the unit

then checker reads fence_1 as a block of the unit.
```

## s071-s  (vocabulary: canon.vocab.md)

```text
When a test checks a bug that sits in a spec, checker reports no untesting for that spec.
```

## s072-o  (vocabulary: canon.vocab.md)

```text
When the project has no runner, the checker reports no untesting for any unit.
```

## s073-cur  (vocabulary: canon.vocab.md)

```text
For every unit:

when project has no tracker, checker reports no untracking for the unit.
```

## s082-h  (vocabulary: canon.vocab.md)

```text
A frontmatter with any of these flaws is refused: an entry starting with @ outside quotes, an undefined key, an unclosed list, an unclosed string, a duplicated key, a dangling path, a looping extension, or a misplaced setting.
```

## s083-s  (vocabulary: canon.vocab.md)

```text
Every misquoted frontmatter is a frontmatter that the checker cannot read.
```

## s084-o  (vocabulary: canon.vocab.md)

```text
Every foreign frontmatter is a frontmatter that the checker cannot read.
```

## s085-cur  (vocabulary: canon.vocab.md)

```text
For every unclosed frontmatter:

the unclosed frontmatter is a frontmatter that the checker cannot read.
```

## s095-s  (vocabulary: canon.vocab.md)

```text
When a frontmatter lists a missing plugin, checker reports that the project lacks it.
```

## s096-o  (vocabulary: canon.vocab.md)

```text
When any frontmatter lists a missing plugin, every run exits with code 2.
```

## s097-cur  (vocabulary: canon.vocab.md)

```text
For every run and every command_1:

when the run asks for command_1 and command_1 is not available, checker reports command_1 as an unknown command and the run exits with code 2.
```

## s106-h  (vocabulary: canon.vocab.md)

```text
When two documents differ only in frontmatter, they hold the same units and their finding status matches.
```

## s107-s  (vocabulary: canon.vocab.md)

```text
When one document is another without its frontmatter, the two hold exactly the same units.
```

## s108-o  (vocabulary: canon.vocab.md)

```text
When a document is another document without its frontmatter, the checker reports a finding for one exactly when it reports a finding for the other.
```

## s109-cur  (vocabulary: canon.vocab.md)

```text
It must be possible that:

There are axiom_1 and spec_1 and test_1 and tag_1 and document_1 and index_1 such that all of these hold:
- spec_1 sits in axiom_1
- project declares test_1
- test_1 carries tag_1
- tag_1 names spec_1
- document_1 holds axiom_1
- document_1 holds spec_1
- document_1 holds index_1
- index_1 matches document_1
- for every thing:

  checker reports no finding for the thing.
```

## s119-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit's statement sits between the markers of a generated region, does not differ from what its formula says, and its formula can be said in words, the statement is current.
```

## s120-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A unit's statement is handwritten when the unit holds a formula that can be said in words and its statement does not sit between the markers of a generated region.
```

## s121-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when at least one of these holds:
- the formula of the unit names a word that has no reading
- the unit holds more than one formula

then the formula of the unit cannot be said in words.
```

## s131-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document and unit: when the document keeps readings, holds the unit, the unit holds a formula, and its statement is not current, checker reports the unit's statement.
```

## s132-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When the statement of a unit is current, checker does not report it.
```

## s133-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run and every check command and every unit:

when the run asks for the check command and checker reports the statement of the unit, the run does not exit with code 0.
```

## s143-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every word: checker does not report it when it is none of these:
- a word that a reading says and nothing declares
- a word declared in a unit that is not a term
- a word whose reading is in another unit than its declaration
- a word that no claim, definition or fact uses
```

## s144-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
Checker reports a word when any of these holds:
- a reading says it and nothing declares it
- it is declared in a unit that is not a term
- its reading is in another unit than its declaration
- no claim, definition or fact uses it
```

## s145-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document_1 and every document_2 and every unit:

when all of these hold:
- the project lists document_1 among the documents it checks
- the project does not list document_2 among the documents it checks
- document_2 is context for document_1
- document_2 holds the unit

then checker does not write the statement of the unit when it generates.
```

## s155-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a scenario can happen while every held unit holds, checker does not report that it cannot happen.
```

## s156-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When checker reports that a scenario cannot happen, its report names each unit whose leaving out lets the scenario happen.
```

## s157-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every scenario and every unit:

when checker names the unit in its report of the scenario, leaving out the unit lets the scenario happen.
```

## s167-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit holds a formula, is not a term, and its formula is lone on a signature, checker reports the formula as lone on that signature.
```

## s168-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When checker reports the formula of a unit as lone on some word, no other formula can contradict that formula.
```

## s169-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit and every word:

when checker reports the formula of the unit as lone on the word,

then all of these hold:
- the unit holds a formula
- the unit is not a term
- the word is a signature
- the formula of the unit is lone on the word
```

## s179-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
It must be possible for a scenario that cannot happen while every held unit holds to be reported by checker as impossible, with a unit named in that report whose removal lets the scenario happen.
```

## s180-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
It must be possible that a unit holds a formula, a claim, a definition or a fact of the unit uses a signature, and the checker does not report the formula of the unit as lone on that signature.
```

## s184-cur  (vocabulary: naturalloy.vocab.md)

```text
For every list:

when all of these hold:
- the list is a rule whose two sides are each one clause
- the list is not a rule whose first side begins with a time phrase

then verbalizer says the list on one line, as "when" the first side, the second side.
```

## s194-s  (vocabulary: naturalloy.vocab.md)

```text
When a quantifier's variable has a further condition and the quantifier fits a noun phrase, verbalizer says it with a relative clause, such as "a unit that is a spec".
```

## s195-o  (vocabulary: naturalloy.vocab.md)

```text
When a quantifier's reading says the variable twice, the verbalizer says the quantifier in full, with "there is" and the numbered name.
```

## s196-cur  (vocabulary: naturalloy.vocab.md)

```text
For every quantifier_1:

when quantifier_1 is a quantifier with no fact for its variable beside another thing, verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s206-s  (vocabulary: naturalloy.vocab.md)

```text
For every list: if a clause before its last has a relative clause in it, verbalizer says it as bullets.
```

## s207-o  (vocabulary: naturalloy.vocab.md)

```text
When an item of a list is more than one clause, verbalizer says the list as bullets.
```

## s208-cur  (vocabulary: naturalloy.vocab.md)

```text
For every list_1:

when list_1 is a list of alternatives where one alternative holds an and, verbalizer says list_1 as bullets that cannot be read two ways.
```

## s218-s  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a definition to have alternatives of one kind and an alternative that says something about another unit.
```

## s219-o  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a definition with an or inside one kind to have an alternative that does not begin with its kind.
```

## s220-cur  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that:

There is a list such that all of these hold:
- the list has three clauses or fewer
- the list has an item that holds a comma
- the list has more than two clauses
```

## s230-s  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
All of these hold:
- Now and at every later moment, for every owner_1, owner_2, and cleanup: when pulse disposes owner_1, owner_1 is the parent of owner_2, pulse has not disposed owner_2, code has registered the cleanup, the cleanup has not run, and the cleanup is on owner_1, then the cleanup does not run until pulse disposes owner_2.
- Now and at every later moment, for every owner_3, owner_4, and owner_5: when pulse disposes owner_3, owner_3 is the parent of owner_4 and of owner_5, owner_4 was created before owner_5, and pulse has not disposed owner_4 or owner_5, then pulse does not dispose owner_4 until it disposes owner_5.
```

## s231-o  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
At every moment, when a failing cleanup runs on an owner that pulse has disposed:
- from then on, the dispose of the owner never throws
- then or later, the error of the cleanup reaches the nearest error handler or boundary above the owner, if the owner has one
```

## s232-cur  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
It must be possible that:

There are owner_1 and owner_2 and failing_cleanup_1 such that all of these hold:
- owner_2 is the nearest error handler or boundary above owner_1
- now or at a later moment, all of these hold:
  - pulse disposes owner_1
  - failing_cleanup_1 is on owner_1
  - now or at a later moment, all of these hold:
    - failing_cleanup_1 runs
    - now or at a later moment, the error of failing_cleanup_1 has reached owner_2
```
