Vocabulary files for this batch: canon.vocab.md, canon-plugin-alloy.vocab.md, naturalloy.vocab.md, canon-plugin-alloy-fixtures-lifetimes.vocab.md

## s023-h  (vocabulary: canon.vocab.md)

```text
A miscited unit is reported as misnesting.
```

## s024-s  (vocabulary: canon.vocab.md)

```text
When an axiom cites a unit that is not an axiom, checker reports a misnesting for the axiom.
```

## s025-o  (vocabulary: canon.vocab.md)

```text
Checker reports a misnesting for every fact that cites a unit.
```

## s026-cur  (vocabulary: canon.vocab.md)

```text
For every spec_1:

when the following holds:

spec_1 cites a unit that is not an axiom, a spec or a fact

then checker reports a misnesting for spec_1.
```

## s036-s  (vocabulary: canon.vocab.md)

```text
When a bug names an issue that tracker has closed, checker reports an outdated tracking for it.
```

## s037-o  (vocabulary: canon.vocab.md)

```text
When the project has a runner, checker reports an untesting for every bug that is not tested.
```

## s038-cur  (vocabulary: canon.vocab.md)

```text
For every conflict:

when the conflict is hidden, checker reports a finding for the conflict.
```

## s048-s  (vocabulary: canon.vocab.md)

```text
When a tag names no unit, checker reports a rotting for it.
```

## s049-o  (vocabulary: canon.vocab.md)

```text
Checker reports a finding for every adrift test.
```

## s050-cur  (vocabulary: canon.vocab.md)

```text
For every test:

when project declares the test and the test carries no tag, checker reports an uncitation for the test.
```

## s060-s  (vocabulary: canon.vocab.md)

```text
When document_1 extends document_2, document_2 is context for document_1, and so is anything that is context for document_2.
```

## s061-o  (vocabulary: canon.vocab.md)

```text
Checker reads a fence that names a language as a block of the unit in whose own text it lies.
```

## s062-cur  (vocabulary: canon.vocab.md)

```text
For every fence_1:

when fence_1 is a fence that names no language, checker reads fence_1 as a block of no unit.
```

## s072-s  (vocabulary: canon.vocab.md)

```text
When the project has no runner, checker reports no untesting for any unit.
```

## s073-o  (vocabulary: canon.vocab.md)

```text
When the project has no tracker, the checker reports no untracking for any unit.
```

## s074-cur  (vocabulary: canon.vocab.md)

```text
For every run:

when at least one of these holds:
- there are frontmatter_1 and missing_plugin_1 such that frontmatter_1 lists missing_plugin_1
- there is a document such that checker reports that the document has a frontmatter it cannot read
- the run asks for a command that is not available
- the run gets code 2 from a plugin

then the run exits with code 2.
```

## s084-s  (vocabulary: canon.vocab.md)

```text
Every foreign frontmatter is a frontmatter that the checker cannot read.
```

## s085-o  (vocabulary: canon.vocab.md)

```text
Every unclosed frontmatter is a frontmatter that the checker cannot read.
```

## s086-cur  (vocabulary: canon.vocab.md)

```text
For every unterminated frontmatter:

the unterminated frontmatter is a frontmatter that the checker cannot read.
```

## s096-s  (vocabulary: canon.vocab.md)

```text
When a frontmatter lists a missing plugin, every run exits with code 2.
```

## s097-o  (vocabulary: canon.vocab.md)

```text
When a run asks for a command that is not available, the checker reports it as an unknown command and the run exits with code 2.
```

## s098-cur  (vocabulary: canon.vocab.md)

```text
For every run and every command_1:

when the run asks for command_1 and command_1 is not available, checker reports command_1 as an unknown command.
```

## s108-s  (vocabulary: canon.vocab.md)

```text
For every document_1 and document_2: when document_1 is document_2 without its frontmatter, checker reports a finding for one exactly when it reports one for the other.
```

## s109-o  (vocabulary: canon.vocab.md)

```text
It must be possible that checker reports no finding for anything while a document holds an axiom, a spec that sits in that axiom, and an index that matches the document, and the project declares a test that carries a tag naming that spec.
```

## s110-cur  (vocabulary: canon.vocab.md)

```text
It must be possible that:

There are bug_1 and expected_failure_1 and issue_1 such that all of these hold:
- bug_1 names issue_1
- tracker knows issue_1
- tracker has not closed issue_1
- expected_failure_1 checks bug_1
- checker reports no finding for bug_1
- checker reports no finding for expected_failure_1
```

## s119-h  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A generated statement whose formula would say exactly the same and whose formula can be said in words is current.
```

## s120-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit holds a formula, has a statement, that statement does not sit between the markers of a generated region, and the formula can be said in words, the statement is handwritten.
```

## s121-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
The formula of a unit cannot be said in words when it names a word that has no reading, or when the unit holds more than one formula.
```

## s122-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

when the formula of the unit names a word that has no reading, the formula of the unit cannot be said in words.
```

## s132-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit's statement is current, checker does not report it.
```

## s133-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a run asks for a check command and checker reports the statement of some unit, the run does not exit with code 0.
```

## s134-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run and every generate command and every unit:

when the run asks for the generate command and the statement of the unit is handwritten, checker reports the statement of the unit and the run does not exit with code 0.
```

## s144-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every word: checker reports it when it is one of these:
- a word that a reading says and nothing declares
- a word declared in a unit that is not a term
- a word whose reading is in another unit than its declaration
- a word that no claim, definition or fact uses
```

## s145-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When it generates, checker does not write the statement of a unit held by a document that the project does not list among the documents it checks, if that document is context for one the project does list.
```

## s146-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document_1 and every document_2 and every unit_1 and every unit_2 and every word_1:

when all of these hold:
- document_2 is context for document_1
- document_1 holds unit_1
- a reading in unit_1 says word_1
- document_2 holds unit_2
- unit_2 declares word_1

then word_1 is not a word that a reading says and nothing declares.
```

## s155-h  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A scenario that can happen is not reported as impossible.
```

## s156-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When checker reports that a scenario cannot happen, and leaving out a unit would let it happen, checker names that unit in its report of the scenario.
```

## s157-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When checker names a unit in its report of a scenario, leaving out that unit lets the scenario happen.
```

## s158-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1:

when unit_1 is held with units that cannot all hold, checker names unit_1 in its report of a contradiction.
```

## s167-h  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A formula that is lone on a signature and is held by a non-term unit is reported as lone on the signature.
```

## s168-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit and word: if checker reports the formula of the unit as lone on the word, no other formula can contradict it.
```

## s169-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
The checker reports a unit's formula as lone on a word only when the unit holds a formula and is not a term, the word is a signature, and the formula is lone on it.
```

## s170-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1 and every unit_2 and every word:

when all of these hold:
- unit_2 and unit_1 are different
- a block of unit_2 names the word outside its declaration

then checker does not report the formula of unit_1 as lone on the word.
```

## s180-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
It must be possible for a unit that holds a formula and whose claim, definition, or fact uses a signature, for the checker not to report that formula as lone on the signature.
```

## s184-o  (vocabulary: naturalloy.vocab.md)

```text
When a list is a rule whose two sides are each one clause and whose first side does not begin with a time phrase, verbalizer says it on one line, as "when <first side>, <second side>".
```

## s185-cur  (vocabulary: naturalloy.vocab.md)

```text
For every definition_1:

when all of these hold:
- definition_1 is a definition whose alternatives each begin with the kind of the subject
- definition_1 can be said kind by kind

then verbalizer says definition_1 as a list with a noun phrase for each kind, such as "a spec that cites no axiom".
```

## s195-s  (vocabulary: naturalloy.vocab.md)

```text
When a quantifier's reading says its variable twice, verbalizer says it in full, with "there is" and the numbered name.
```

## s196-o  (vocabulary: naturalloy.vocab.md)

```text
Verbalizer says a quantifier with no fact for its variable beside another thing in full, with "there is" and the numbered name.
```

## s197-cur  (vocabulary: naturalloy.vocab.md)

```text
For every quantifier_1:

when quantifier_1 is a quantifier that says no variable differs from another and holds a condition, verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s206-h  (vocabulary: naturalloy.vocab.md)

```text
A list with a relative clause before its last clause is said as bullets.
```

## s207-s  (vocabulary: naturalloy.vocab.md)

```text
When a list has an item that is more than one clause, verbalizer says it as bullets.
```

## s208-o  (vocabulary: naturalloy.vocab.md)

```text
When a list of alternatives has an alternative that holds an and, verbalizer says it as bullets that cannot be read two ways.
```

## s209-cur  (vocabulary: naturalloy.vocab.md)

```text
For every list:

when all of these hold:
- the list is a rule whose two sides are each one clause
- the list is not a rule whose first side begins with a time phrase
- the list is a rule whose second side begins with a time phrase

then verbalizer says the list with "then" before the time phrase.
```

## s219-s  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a definition to have an or inside one kind, with an alternative that does not begin with its kind.
```

## s220-o  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a list to have more than two clauses but three or fewer, and an item that holds a comma.
```

## s221-cur  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that:

There is a list such that the list has three clauses or fewer and is longer than a line when it is put in a sentence.
```

## s231-s  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
Always, both of these hold:
- for every owner and failing cleanup: when the cleanup runs on a disposed owner, the dispose of that owner has not thrown, now or at any later moment
- for every owner, its nearest error handler or boundary, and every failing cleanup: when the cleanup runs on the disposed owner, the cleanup's error has reached that handler, now or at some later moment.
```

## s232-o  (vocabulary: canon-plugin-alloy-fixtures-lifetimes.vocab.md)

```text
It must be possible that an owner has another owner H as the nearest error handler or boundary above it, and that, now or later, pulse disposes the owner while a failing cleanup is on it, then at that moment or later the cleanup runs, and at that moment or later its error has reached H.
```
