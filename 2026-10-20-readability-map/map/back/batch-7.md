Vocabulary files for this batch: canon.vocab.md, canon-plugin-alloy.vocab.md, naturalloy.vocab.md, canon-plugin-alloy-fixtures-lifetimes.vocab.md

## s022-s  (vocabulary: canon.vocab.md)

```text
For every bug: if it cites no spec, checker reports a freelancing for it.
```

## s023-o  (vocabulary: canon.vocab.md)

```text
Checker reports a misnesting for every miscited unit.
```

## s024-cur  (vocabulary: canon.vocab.md)

```text
For every axiom_1:

when axiom_1 cites a unit that is not an axiom, checker reports a misnesting for axiom_1.
```

## s034-s  (vocabulary: canon.vocab.md)

```text
When project has a tracker and a bug names no issue, checker reports an untracking for it.
```

## s035-o  (vocabulary: canon.vocab.md)

```text
When a bug names an issue that tracker does not know, checker reports a mistracking for the bug.
```

## s036-cur  (vocabulary: canon.vocab.md)

```text
For every bug:

when the bug names an issue that tracker has closed, checker reports an outdated tracking for the bug.
```

## s046-s  (vocabulary: canon.vocab.md)

```text
All of these hold:
- when the project has a runner and a claim is unguarded, checker reports a finding for the claim
- when a tag names no unit, checker reports a finding for the tag
- when a test is adrift, checker reports a finding for the test
- when a pointer names no target, checker reports a finding for the pointer
- when a unit is not used and is not a conflict, checker reports a finding for the unit
- when a trailer follows a unit, checker reports a finding for the unit
- when a document holds a unit but holds no index, checker reports a finding for the document
- when a document holds an index that does not match it, checker reports a finding for the document
- when a claim names a site that no source holds, checker reports a finding for the claim
- when a unit repeats another, checker reports a finding for the repeating unit
```

## s047-o  (vocabulary: canon.vocab.md)

```text
When the project has a runner, the checker reports an untesting for every unguarded claim.
```

## s048-cur  (vocabulary: canon.vocab.md)

```text
For every tag:

when the tag names no unit, checker reports a rotting for the tag.
```

## s057-h  (vocabulary: canon.vocab.md)

```text
A document that holds units but no index is reported as misindexed.
```

## s058-s  (vocabulary: canon.vocab.md)

```text
For every document: if it holds an index that does not match it, checker reports a misindexing for it.
```

## s059-o  (vocabulary: canon.vocab.md)

```text
The checker reports a mislocation for every claim that names a site no source holds.
```

## s060-cur  (vocabulary: canon.vocab.md)

```text
For every document_1 and every document_2 and every document_3:

all of these hold:
- when document_1 extends document_2, document_2 is context for document_1
- when document_1 extends document_2 and document_3 is context for document_2, document_3 is context for document_1
```

## s070-s  (vocabulary: canon.vocab.md)

```text
When an undeclared test checks a claim, checker reports no untesting for that claim.
```

## s071-o  (vocabulary: canon.vocab.md)

```text
When a test checks a bug that sits in a spec, checker reports no untesting for the spec.
```

## s072-cur  (vocabulary: canon.vocab.md)

```text
For every unit:

when project has no runner, checker reports no untesting for the unit.
```

## s082-s  (vocabulary: canon.vocab.md)

```text
When a frontmatter has any of these flaws, checker refuses it:
- an entry that starts with an at sign outside quotes
- a key that neither the checker nor a plugin it lists defines
- a list that is not closed
- a string that is not closed
- a key that appears twice
- a path that names no document
- an extension that leads back to its own document
- a setting in a document that is not the entry document
```

## s083-o  (vocabulary: canon.vocab.md)

```text
Every misquoted frontmatter is a frontmatter that the checker cannot read.
```

## s084-cur  (vocabulary: canon.vocab.md)

```text
For every foreign frontmatter:

the foreign frontmatter is a frontmatter that the checker cannot read.
```

## s094-s  (vocabulary: canon.vocab.md)

```text
When a frontmatter lists a missing plugin, checker reports that the project lacks it, and every run exits with code 2.
```

## s095-o  (vocabulary: canon.vocab.md)

```text
When a frontmatter lists a missing plugin, the checker reports that the project lacks that plugin.
```

## s096-cur  (vocabulary: canon.vocab.md)

```text
For every run and every frontmatter and every missing plugin:

when the frontmatter lists the missing plugin, the run exits with code 2.
```

## s106-s  (vocabulary: canon.vocab.md)

```text
For every document_1 and document_2: when document_1 is document_2 without its frontmatter, the two hold exactly the same units, and checker reports a finding for one exactly when it reports one for the other.
```

## s107-o  (vocabulary: canon.vocab.md)

```text
When document_1 is document_2 without its frontmatter, the two documents hold exactly the same units.
```

## s108-cur  (vocabulary: canon.vocab.md)

```text
For every document_1 and every document_2:

when document_1 is document_2 without its frontmatter,

then all of these hold:
- when checker reports a finding for document_2, checker reports a finding for document_1
- when checker reports a finding for document_1, checker reports a finding for document_2
```

## s118-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit holds a formula that can be said in words, its statement sits between the markers of a generated region, and that statement differs from what the formula says, then the statement is stale.
```

## s119-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A statement that sits between the markers of a generated region is current when its unit's formula can be said in words and the statement does not differ from what that formula says.
```

## s120-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when all of these hold:
- the unit holds a formula
- the unit has a statement
- the statement of the unit does not sit between the markers of a generated region
- the formula of the unit can be said in words

then the statement of the unit is handwritten.
```

## s130-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When the formula of a unit cannot be said in words, checker does not write its statement when it generates.
```

## s131-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a document keeps readings, the checker reports the statement of every unit it holds that holds a formula and whose statement is not current.
```

## s132-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when the statement of the unit is current, checker does not report the statement of the unit.
```

## s142-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a run asks for the check command and checker reports a word, that run does not exit with code 0.
```

## s143-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
Checker does not report a word when none of these holds:
- a reading says it and nothing declares it
- it is declared in a unit that is not a term
- its reading is in another unit than its declaration
- no claim, definition or fact uses it
```

## s144-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every word_1:

when at least one of these holds:
- word_1 is a word that a reading says and nothing declares
- word_1 is a word declared in a unit that is not a term
- word_1 is a word whose reading is in another unit than its declaration
- word_1 is a word that no claim, definition or fact uses

then checker reports the word word_1.
```

## s154-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a scenario cannot happen while every held unit holds, checker reports that it cannot happen.
```

## s155-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
The checker does not report that a scenario cannot happen when it can happen while every held unit holds.
```

## s156-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every scenario and every unit:

when all of these hold:
- checker reports that the scenario cannot happen
- leaving out the unit lets the scenario happen

then checker names the unit in its report of the scenario.
```

## s166-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit holds a formula, is not a term, and no other formula can contradict its formula, then checker reports its formula as lone on some signature.
```

## s167-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit that is not a term holds a formula that is lone on a signature, the checker reports that formula as lone on that signature.
```

## s168-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit and every word:

when checker reports the formula of the unit as lone on the word, no other formula can contradict the formula of the unit.
```

## s178-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
It must be possible for the verbalizer to fail on the formula of some unit with a fault of its own.
```

## s179-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
There can be a scenario that cannot happen while every held unit holds, that checker reports cannot happen, and whose report names a unit whose leaving out lets the scenario happen.
```

## s180-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
It must be possible that:

There are unit_1 and signature_1 such that all of these hold:
- unit_1 holds a formula
- a claim, a definition or a fact of unit_1 uses signature_1
- checker does not report the formula of unit_1 as lone on signature_1
```

## s193-s  (vocabulary: naturalloy.vocab.md)

```text
For every quantifier: when its variable is the subject of the sentence and fits a noun phrase, the verbalizer says it with the noun phrase as the subject, such as "a tag names unit_1".
```

## s194-o  (vocabulary: naturalloy.vocab.md)

```text
When a quantifier's variable has a further condition and the quantifier fits a noun phrase, the verbalizer says it with a relative clause, such as "a unit that is a spec".
```

## s195-cur  (vocabulary: naturalloy.vocab.md)

```text
For every quantifier_1:

when quantifier_1 is a quantifier whose reading says the variable twice, verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s205-s  (vocabulary: naturalloy.vocab.md)

```text
For every list: if a clause before its last begins with a time phrase, verbalizer says the list as bullets.
```

## s206-o  (vocabulary: naturalloy.vocab.md)

```text
When a list has a clause before its last with a relative clause in it, verbalizer says it as bullets.
```

## s207-cur  (vocabulary: naturalloy.vocab.md)

```text
For every list:

when the list has an item that is more than one clause, verbalizer says the list as bullets.
```

## s216-h  (vocabulary: naturalloy.vocab.md)

```text
There exists a quantifier whose variable has a condition and has nothing else to attach.
```

## s217-s  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that: some definition has two alternatives for one kind and a run of and beside another alternative of its kind.
```

## s218-o  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a definition to have alternatives all of one kind and also an alternative that says something about another unit.
```

## s219-cur  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that:

There is a definition_1 such that all of these hold:
- definition_1 is a definition with an or inside one kind
- definition_1 is a definition with an alternative that does not begin with its kind
```

## s229-s  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
Now and at every later moment, when a call enters an owner that pulse has disposed, a call is throwing right after.
```

## s230-o  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
At every moment, whenever pulse disposes an owner:
- for each owner it is the parent of that pulse has not disposed, pulse disposes that owner now or later, and before then no cleanup that code has registered on the parent and that has not run runs;
- for any two owners it is the parent of that pulse has not disposed, pulse disposes the one created later now or later, and does not dispose the one created earlier before then.
```

## s231-cur  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
All of these hold:
- now and at every later moment, for every owner_1 and every failing_cleanup_1:

  when failing_cleanup_1 runs, is on owner_1 and pulse has disposed owner_1, then now and at every later moment, the dispose of owner_1 has not thrown
- now and at every later moment, for every owner_2 and every owner_3 and every failing_cleanup_2:

  when all of these hold:
  - failing_cleanup_2 runs
  - failing_cleanup_2 is on owner_2
  - pulse has disposed owner_2
  - owner_3 is the nearest error handler or boundary above owner_2

  then now or at a later moment, the error of failing_cleanup_2 has reached owner_3.
```
