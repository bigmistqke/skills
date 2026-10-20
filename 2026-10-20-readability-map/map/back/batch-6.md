Vocabulary files for this batch: canon.vocab.md, canon-plugin-alloy.vocab.md, naturalloy.vocab.md, canon-plugin-alloy-fixtures-lifetimes.vocab.md

## s021-s  (vocabulary: canon.vocab.md)

```text
When an exception cites no fact, checker reports a freelancing for it.
```

## s022-o  (vocabulary: canon.vocab.md)

```text
Checker reports a freelancing for every bug that cites no spec.
```

## s023-cur  (vocabulary: canon.vocab.md)

```text
For every unit:

when the unit is miscited, checker reports a misnesting for the unit.
```

## s033-s  (vocabulary: canon.vocab.md)

```text
For every bug: when the bug is hidden, checker reports a finding for the bug.
```

## s034-o  (vocabulary: canon.vocab.md)

```text
When the project has a tracker, checker reports an untracking for every bug that names no issue.
```

## s035-cur  (vocabulary: canon.vocab.md)

```text
For every bug:

when the bug names an issue that tracker does not know, checker reports a mistracking for the bug.
```

## s044-h  (vocabulary: canon.vocab.md)

```text
An expected failure that checks neither a bug nor an exception is reported as unexplained.
```

## s045-s  (vocabulary: canon.vocab.md)

```text
For every plain test: if it checks a bug, checker reports an unpinning for it.
```

## s046-o  (vocabulary: canon.vocab.md)

```text
Checker reports a finding for:
- every unguarded claim, when the project has a runner
- every tag that names no unit
- every adrift test
- every pointer that names no target
- every unit that is neither used nor a conflict
- every unit that a trailer follows
- every document that holds a unit but no index
- every document that holds an index that does not match the document
- every claim that names a site no source holds
- every unit that repeats a unit
```

## s047-cur  (vocabulary: canon.vocab.md)

```text
For every claim:

when project has a runner and the claim is unguarded, checker reports an untesting for the claim.
```

## s057-s  (vocabulary: canon.vocab.md)

```text
For every document: if it holds a unit but holds no index, checker reports a misindexing for it.
```

## s058-o  (vocabulary: canon.vocab.md)

```text
Checker reports a misindexing for every document that holds an index that does not match it.
```

## s059-cur  (vocabulary: canon.vocab.md)

```text
For every claim:

when the claim names a site that no source holds, checker reports a mislocation for the claim.
```

## s069-s  (vocabulary: canon.vocab.md)

```text
When a test that project declares checks a claim, checker reports no untesting for it.
```

## s070-o  (vocabulary: canon.vocab.md)

```text
When a test the project does not declare checks a claim, checker reports no untesting for that claim.
```

## s071-cur  (vocabulary: canon.vocab.md)

```text
For every spec:

when a test checks a bug that sits in the spec, checker reports no untesting for the spec.
```

## s081-s  (vocabulary: canon.vocab.md)

```text
When a frontmatter is not one with a plugins key, it holds no entry.
```

## s082-o  (vocabulary: canon.vocab.md)

```text
A frontmatter with any of these flaws is a frontmatter that the checker cannot read:
- an entry that starts with an at sign outside quotes
- a key that neither the checker nor a plugin the frontmatter lists defines
- a list that is not closed
- a string that is not closed
- a key that appears twice
- a path that names no document
- an extension that leads back to its own document
- a setting in a document that is not the entry document
```

## s083-cur  (vocabulary: canon.vocab.md)

```text
For every misquoted frontmatter:

the misquoted frontmatter is a frontmatter that the checker cannot read.
```

## s093-s  (vocabulary: canon.vocab.md)

```text
When checker reports that some document has a frontmatter it cannot read, every run exits with code 2.
```

## s094-o  (vocabulary: canon.vocab.md)

```text
When any frontmatter lists a missing plugin, checker reports that the project lacks that plugin, and every run exits with code 2.
```

## s095-cur  (vocabulary: canon.vocab.md)

```text
For every frontmatter and every missing plugin:

when the frontmatter lists the missing plugin, checker reports that the project lacks the missing plugin.
```

## s104-h  (vocabulary: canon.vocab.md)

```text
A run that gets code 1 from a plugin but not code 2 from any plugin exits with code 1.
```

## s105-s  (vocabulary: canon.vocab.md)

```text
When no plugin gives a run code 1 or code 2, the run exits with code 0.
```

## s106-o  (vocabulary: canon.vocab.md)

```text
When a document is another document without its frontmatter, the two hold exactly the same units, and the checker reports a finding for one exactly when it reports a finding for the other.
```

## s107-cur  (vocabulary: canon.vocab.md)

```text
For every document_1 and every document_2:

when document_1 is document_2 without its frontmatter,

then for every unit:

all of these hold:
- when document_2 holds the unit, document_1 holds the unit
- when document_1 holds the unit, document_2 holds the unit
```

## s117-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit: when it holds a formula, has no statement, and its formula can be said in words, the statement is unwritten.
```

## s118-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
The statement of a unit is stale when the unit holds a formula that can be said in words, the statement sits between the markers of a generated region, and it differs from what its formula says.
```

## s119-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when all of these hold:
- the statement of the unit sits between the markers of a generated region
- the statement of the unit does not differ from what its formula says
- the formula of the unit can be said in words

then the statement of the unit is current.
```

## s129-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit's statement is handwritten, checker does not write that statement when it generates.
```

## s130-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When the formula of a unit cannot be said in words, checker does not write the unit's statement when it generates.
```

## s131-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document and every unit:

when all of these hold:
- the document keeps readings
- the document holds the unit
- the unit holds a formula
- the statement of the unit is not current

then checker reports the statement of the unit.
```

## s141-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document, unit, and word: when the document keeps no readings, holds the unit, and the unit declares the word, then none of these hold:
- a reading says the word and nothing declares it
- the word is declared in a unit that is not a term
- the word's reading is in another unit than its declaration
- no claim, definition or fact uses the word
- checker reports the word
```

## s142-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a run asks for a check command while checker reports any word at all, the run does not exit with code 0.
```

## s143-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every word_1:

when all of these hold:
- word_1 is not a word that a reading says and nothing declares
- word_1 is not a word declared in a unit that is not a term
- word_1 is not a word whose reading is in another unit than its declaration
- word_1 is not a word that no claim, definition or fact uses

then checker does not report the word word_1.
```

## s152-h  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For an impossible scenario with held units and no author probes, each held unit requires a trial search that makes the scenario possible.
```

## s153-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a search that leaves one unit out requires a scenario to happen and leaves out a unit, and the author already asks about leaving some unit out for that scenario, the author also asks about leaving this unit out for it.
```

## s154-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a scenario cannot happen while every held unit holds, checker reports that it cannot happen.
```

## s155-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every scenario_1:

when scenario_1 is a scenario that can happen while every held unit holds, checker does not report that scenario_1 cannot happen.
```

## s165-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
Both of these hold:
- When a unit holds a formula, is not a term, and no other formula can contradict its formula, checker reports its formula as lone on some signature.
- When checker reports a unit's formula as lone on a word, no other formula can contradict the formula of the unit.
```

## s166-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit that is not a term holds a formula that no other formula can contradict, checker reports that formula as lone on some signature.
```

## s167-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit and every signature:

when all of these hold:
- the unit holds a formula
- the unit is not a term
- the formula of the unit is lone on the signature

then checker reports the formula of the unit as lone on the signature.
```

## s177-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
It must be possible that: there is a unit and a document such that the document keeps readings and holds the unit, the unit holds a formula, its statement is current, and checker does not report it.
```

## s178-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
It must be possible that the verbalizer fails on the formula of some unit with a fault of its own.
```

## s179-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
It must be possible that:

There are scenario_1 and unit_1 such that all of these hold:
- scenario_1 is a scenario that cannot happen while every held unit holds
- checker reports that scenario_1 cannot happen
- leaving out unit_1 lets scenario_1 happen
- checker names unit_1 in its report of scenario_1
```

## s192-s  (vocabulary: naturalloy.vocab.md)

```text
When a quantifier's variable the sentence says once and the quantifier fits a noun phrase, verbalizer says it as a noun phrase in place of the variable, such as "sits in no unit".
```

## s193-o  (vocabulary: naturalloy.vocab.md)

```text
When a quantifier fits a noun phrase and its variable is the subject of the sentence, the verbalizer says it with the noun phrase as the subject, such as "a tag names unit_1".
```

## s194-cur  (vocabulary: naturalloy.vocab.md)

```text
For every quantifier_1:

when quantifier_1 is a quantifier whose variable has a further condition and fits a noun phrase, verbalizer says quantifier_1 with a relative clause, such as "a unit that is a spec".
```

## s203-h  (vocabulary: naturalloy.vocab.md)

```text
A list with an item containing a comma and more than two clauses is said as bullets.
```

## s204-s  (vocabulary: naturalloy.vocab.md)

```text
When a list is longer than a line once put in a sentence, verbalizer says it as bullets.
```

## s205-o  (vocabulary: naturalloy.vocab.md)

```text
When a list has a clause before its last that begins with a time phrase, verbalizer says it as bullets.
```

## s206-cur  (vocabulary: naturalloy.vocab.md)

```text
For every list:

when the list has a clause before its last with a relative clause in it, verbalizer says the list as bullets.
```

## s216-s  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a quantifier whose variable has a further condition to also have no fact for its variable beside another thing.
```

## s217-o  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for one definition both to have two alternatives for one kind and to have a run of and beside another alternative of its kind.
```

## s218-cur  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that:

There is a definition_1 such that all of these hold:
- definition_1 is a definition whose alternatives are of one kind
- definition_1 is a definition with an alternative that says something about another unit
```

## s227-h  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
Cleanup never runs on behalf of a call after pulse has disposed an owner, and disposal never throws.
```

## s228-s  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
Both of these hold:
- Now and at every later moment, when pulse disposes an owner, and two cleanups are registered on it, neither having run, one registered before the other, the later-registered cleanup runs now or at a later moment, and until it does, the earlier-registered cleanup does not run.
- Now and at every later moment, when a failing cleanup runs on an owner that pulse has disposed, the owner's dispose is not stopped, now or at any later moment.
```

## s229-o  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
From now on, whenever a call enters an owner that pulse has disposed, a call is throwing right after.
```

## s230-cur  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
All of these hold:
- now and at every later moment, for every owner_1 and every owner_2 and every cleanup:

  when all of these hold:
  - pulse disposes owner_1
  - owner_1 is the parent of owner_2
  - pulse has not disposed owner_2
  - code has registered the cleanup
  - the cleanup has not run
  - the cleanup is on owner_1

  then all of these hold:
  - now or at a later moment, the following holds:

    pulse disposes owner_2
  - at every moment from now until the first such moment, not including it, the following holds:

    the cleanup does not run
- now and at every later moment, for every owner_3 and every owner_4 and every owner_5:

  when all of these hold:
  - pulse disposes owner_3
  - owner_3 is the parent of owner_4
  - owner_3 is the parent of owner_5
  - owner_4 was created before owner_5
  - pulse has not disposed owner_4
  - pulse has not disposed owner_5

  then all of these hold:
  - now or at a later moment, the following holds:

    pulse disposes owner_5
  - at every moment from now until the first such moment, not including it, the following holds:

    pulse does not dispose owner_4.
```
