Vocabulary files for this batch: canon.vocab.md, canon-plugin-alloy.vocab.md, naturalloy.vocab.md

## s017-o  (vocabulary: canon.vocab.md)

```text
The checker reports a finding for every unit that is unfounded, miscited or circular.
```

## s018-cur  (vocabulary: canon.vocab.md)

```text
For every unit:

when the unit is unfounded, checker reports a freelancing for the unit.
```

## s028-s  (vocabulary: canon.vocab.md)

```text
When a bug cites a unit that is not a spec, checker reports a misnesting for the bug.
```

## s029-o  (vocabulary: canon.vocab.md)

```text
When a conflict cites a unit, checker reports a misnesting for the conflict.
```

## s030-cur  (vocabulary: canon.vocab.md)

```text
For every term:

when the term cites a unit, checker reports a misnesting for the term.
```

## s040-s  (vocabulary: canon.vocab.md)

```text
When a conflict names an issue that tracker does not know, checker reports a mistracking for it.
```

## s041-o  (vocabulary: canon.vocab.md)

```text
Checker reports an outdated tracking for every conflict that names an issue the tracker has closed.
```

## s042-cur  (vocabulary: canon.vocab.md)

```text
For every conflict:

when the conflict is not paired, checker reports an unpairing for the conflict.
```

## s052-s  (vocabulary: canon.vocab.md)

```text
When a test checks a claim that is refined, checker reports an overreach for the test.
```

## s053-o  (vocabulary: canon.vocab.md)

```text
When a pointer names no target, checker reports a rotting for the pointer.
```

## s054-cur  (vocabulary: canon.vocab.md)

```text
For every unit_1:

when unit_1 repeats a unit, checker reports a rotting for unit_1.
```

## s064-s  (vocabulary: canon.vocab.md)

```text
A fence whose second word is bounds has the role of bounds.
```

## s065-o  (vocabulary: canon.vocab.md)

```text
A fence whose second word is scenario has the role of scenario.
```

## s066-cur  (vocabulary: canon.vocab.md)

```text
For every fence:

when the fence has no second word that names a role, the fence has the role of the formula of its unit.
```

## s076-s  (vocabulary: canon.vocab.md)

```text
For every document: when it starts with no listing frontmatter and the command line of a run does not name it, checker runs no plugin over it.
```

## s077-o  (vocabulary: canon.vocab.md)

```text
When a document starts with a listing frontmatter that lists a plugin, checker runs the plugin over the document.
```

## s078-cur  (vocabulary: canon.vocab.md)

```text
For every plugin and every document and every listing frontmatter:

when all of these hold:
- the document starts with the listing frontmatter
- the listing frontmatter does not list the plugin
- the command line of a run does not name the document

then checker does not run the plugin over the document.
```

## s088-s  (vocabulary: canon.vocab.md)

```text
Checker cannot read a dangling frontmatter.
```

## s089-o  (vocabulary: canon.vocab.md)

```text
The checker cannot read a circular frontmatter.
```

## s090-cur  (vocabulary: canon.vocab.md)

```text
For every stray frontmatter:

the stray frontmatter is a frontmatter that the checker cannot read.
```

## s099-h  (vocabulary: canon.vocab.md)

```text
When a run asks for a command that is not available, the run exits with code 2.
```

## s100-s  (vocabulary: canon.vocab.md)

```text
When a command is available, checker does not report it as unknown.
```

## s101-o  (vocabulary: canon.vocab.md)

```text
When a run calls a plugin, the run gets code 0, 1 or 2 from the plugin.
```

## s102-cur  (vocabulary: canon.vocab.md)

```text
For every run:

all of these hold:
- when the run gets code 2 from a plugin, the run exits with code 2
- when the run gets code 1 from a plugin and gets code 2 from no plugin, the run exits with code 1
```

## s112-s  (vocabulary: canon.vocab.md)

```text
It must be possible for a document to extend a second document that extends a third, different from the first, with the third being context for the first.
```

## s113-o  (vocabulary: canon.vocab.md)

```text
It must be possible that a document starts with a listing frontmatter that lists an installed plugin, checker runs the plugin over the document, and a run calls the plugin, gets code 1 from it, and exits with code 1.
```

## s114-cur  (vocabulary: canon.vocab.md)

```text
It must be possible that:

There are run_1 and document_1 and refused_frontmatter_1 such that all of these hold:
- document_1 starts with refused_frontmatter_1
- checker reports that document_1 has a frontmatter it cannot read
- run_1 exits with code 2
```

## s124-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When the formula of a unit cannot be said in words, checker says why.
```

## s125-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a run asks for `generate` or `check` and the verbalizer fails on the formula of any unit with a fault of its own, the run does not exit with code 0, and checker does not say why that formula cannot be said.
```

## s126-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:

all of these hold:
- when checker writes the statement of the unit when it generates, the statement of the unit is unwritten or the statement of the unit is stale
- when the statement of the unit is unwritten or the statement of the unit is stale, checker writes the statement of the unit when it generates
```

## s136-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When some unit's reading says a word, and no unit declares it, then it is a word that a reading says and nothing declares.
```

## s137-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit that is not a term declares a word, that word counts as a word declared in a unit that is not a term.
```

## s138-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1 and every word_1:

when all of these hold:
- a reading in unit_1 says word_1
- a unit declares word_1
- unit_1 does not declare word_1

then word_1 is a word whose reading is in another unit than its declaration.
```

## s148-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit holds a formula with no keyword, the analyzer is asked to hold that formula.
```

## s149-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
Every search asked before any scenario is known to be impossible leaves no unit out.
```

## s150-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every search_1 and every scenario_1:

when search_1 leaves one unit out and requires scenario_1 to happen,

then all of these hold:
- scenario_1 is a scenario that cannot happen while every held unit holds
- search_1 is asked after the first search is answered
```

## s160-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When one unit shares a word with another, the analyzer is asked about them together.
```

## s161-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When the analyzer is asked about one unit together with another, the first is linked to the second through shared words.
```

## s162-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run and every logic command:

when all of these hold:
- the run asks for the logic command
- there is no scenario such that checker reports that the scenario cannot happen
- there is no unit_1 such that unit_1 is held with units that cannot all hold

then the run exits with code 0.
```

## s172-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document_1, document_2, unit_1, unit_2 and word: if document_2 is context for document_1, document_1 holds unit_1, document_2 holds unit_2, and a block of unit_2 names the word outside its declaration, then checker does not report the formula of unit_1 as lone on the word.
```

## s173-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
The checker never reports the formula of a unit as lone on a word that is not a signature.
```

## s174-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every term and every word:

checker does not report the formula of the term as lone on the word.
```

## s187-s  (vocabulary: naturalloy.vocab.md)

```text
When a definition has an or inside one kind and can be said kind by kind, the verbalizer says it as one run of clauses joined by commas and or.
```

## s188-o  (vocabulary: naturalloy.vocab.md)

```text
Verbalizer says a definition as one sentence when its alternatives are of one kind and it can be said kind by kind.
```

## s189-cur  (vocabulary: naturalloy.vocab.md)

```text
For every definition_1:

when definition_1 is a definition with an alternative that does not begin with its kind, verbalizer says definition_1 as a list of the alternatives as they stand.
```

## s198-h  (vocabulary: naturalloy.vocab.md)

```text
A quantifier with multiple conditions where one begins with a time phrase is said in full, with "there is" and the numbered name.
```

## s199-s  (vocabulary: naturalloy.vocab.md)

```text
When a quantifier's condition is not about its variable, the verbalizer says it in full, with "there is" and the numbered name.
```

## s200-o  (vocabulary: naturalloy.vocab.md)

```text
The verbalizer says every list that can be put in a sentence in a sentence.
```

## s201-cur  (vocabulary: naturalloy.vocab.md)

```text
For every list:

when the list is a run of clauses joined by and or by or and cannot be put in a sentence, verbalizer says the list as bullets.
```

## s211-s  (vocabulary: naturalloy.vocab.md)

```text
When a list is a rule whose first side begins with a time phrase, the verbalizer says it with "then" at the start of the second side, on a line of its own.
```

## s212-o  (vocabulary: naturalloy.vocab.md)

```text
When a list is a rule with a first side and a second, but not a rule whose two sides are each one clause, verbalizer says it with "then" at the start of the second side, on a line of its own.
```

## s213-cur  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that:

There is a quantifier_1 such that all of these hold:
- quantifier_1 is a quantifier whose variable the sentence says once
- quantifier_1 is a quantifier that says no variable differs from another and holds a condition
```

## s223-s  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a list to have a clause about a pair of variables and an item that is more than one clause.
```

## s224-o  (vocabulary: naturalloy.vocab.md)

```text
A list can be a rule whose second side begins with a time phrase without being a rule whose two sides are each one clause.
```

## s225-cur  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that:

There is a list such that the list is a rule whose two sides are each one clause and is a rule whose first side begins with a time phrase.
```
