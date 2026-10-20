Vocabulary files for this batch: canon.vocab.md, canon-plugin-alloy.vocab.md, naturalloy.vocab.md

## s017-cur  (vocabulary: canon.vocab.md)

```text
All of these hold:
- for every unit:

  when the unit is unfounded, checker reports a finding for the unit
- for every unit:

  when the unit is miscited, checker reports a finding for the unit
- for every unit:

  when the unit is circular, checker reports a finding for the unit.
```

## s027-s  (vocabulary: canon.vocab.md)

```text
When an exception cites a unit that is not a spec or a fact, checker reports a misnesting for it.
```

## s028-o  (vocabulary: canon.vocab.md)

```text
The checker reports a misnesting for every bug that cites a unit that is not a spec.
```

## s029-cur  (vocabulary: canon.vocab.md)

```text
For every conflict:

when the conflict cites a unit, checker reports a misnesting for the conflict.
```

## s039-s  (vocabulary: canon.vocab.md)

```text
When project has a tracker and a conflict names no issue, checker reports an untracking for it.
```

## s040-o  (vocabulary: canon.vocab.md)

```text
Checker reports a mistracking for every conflict that names an issue the tracker does not know.
```

## s041-cur  (vocabulary: canon.vocab.md)

```text
For every conflict:

when the conflict names an issue that tracker has closed, checker reports an outdated tracking for the conflict.
```

## s051-s  (vocabulary: canon.vocab.md)

```text
When a declared test checks a unit that is not a claim, checker reports a misaiming for it.
```

## s052-o  (vocabulary: canon.vocab.md)

```text
The checker reports an overreach for every test that checks a refined claim.
```

## s053-cur  (vocabulary: canon.vocab.md)

```text
For every pointer:

when the pointer names no target, checker reports a rotting for the pointer.
```

## s063-s  (vocabulary: canon.vocab.md)

```text
When a fence's second word is vocabulary, it has the role of vocabulary.
```

## s064-o  (vocabulary: canon.vocab.md)

```text
A fence whose second word is bounds has the role of bounds.
```

## s065-cur  (vocabulary: canon.vocab.md)

```text
For every fence:

when the second word of the fence is scenario, the fence has the role of scenario.
```

## s075-s  (vocabulary: canon.vocab.md)

```text
Both of these hold:
- When a plugin applies to a document, checker runs the plugin over the document.
- When the command line of a run does not name the document and checker runs the plugin over it, the plugin applies to the document.
```

## s076-o  (vocabulary: canon.vocab.md)

```text
When a document starts with no listing frontmatter and the command line of a run does not name it, the checker runs no plugin over it.
```

## s077-cur  (vocabulary: canon.vocab.md)

```text
For every plugin and every document and every listing frontmatter:

when the document starts with the listing frontmatter and the listing frontmatter lists the plugin, checker runs the plugin over the document.
```

## s087-s  (vocabulary: canon.vocab.md)

```text
A doubled frontmatter is a frontmatter checker cannot read.
```

## s088-o  (vocabulary: canon.vocab.md)

```text
The checker cannot read a dangling frontmatter.
```

## s089-cur  (vocabulary: canon.vocab.md)

```text
For every circular frontmatter:

the circular frontmatter is a frontmatter that the checker cannot read.
```

## s099-s  (vocabulary: canon.vocab.md)

```text
When a run asks for a command that is not available, that run exits with code 2.
```

## s100-o  (vocabulary: canon.vocab.md)

```text
Checker does not report an available command as an unknown command.
```

## s101-cur  (vocabulary: canon.vocab.md)

```text
For every run and every plugin:

when the run calls the plugin,

then the following holds:

the run gets code 0 from the plugin, gets code 1 from the plugin or gets code 2 from the plugin.
```

## s111-s  (vocabulary: canon.vocab.md)

```text
It must be possible for a conflict to name two different units and an issue that the tracker knows but has not closed, with checker reporting no finding for that conflict.
```

## s112-o  (vocabulary: canon.vocab.md)

```text
There can be three documents A, B and C, with C different from A, where A extends B, B extends C, and C is context for A.
```

## s113-cur  (vocabulary: canon.vocab.md)

```text
It must be possible that:

There are run_1 and installed_plugin_1 and document_1 and listing_frontmatter_1 such that all of these hold:
- document_1 starts with listing_frontmatter_1
- listing_frontmatter_1 lists installed_plugin_1
- checker runs installed_plugin_1 over document_1
- run_1 calls installed_plugin_1
- run_1 gets code 1 from installed_plugin_1
- run_1 exits with code 1
```

## s123-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit holds more than one formula, the formula of the unit cannot be said in words.
```

## s124-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When the formula of a unit cannot be said in words, checker says why.
```

## s125-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run and every command_1 and every unit:

when all of these hold:
- the run asks for command_1
- command_1 is the command `generate` or is the command `check`
- the verbalizer fails on the formula of the unit with a fault of its own

then checker does not say why the formula of the unit cannot be said and the run does not exit with code 0.
```

## s135-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run that asks for the generate command and every unit whose formula cannot be said in words: checker says why it cannot be said, and the run does not exit with code 0.
```

## s136-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a reading in some unit says a word and no unit declares it, the word is a word that a reading says and nothing declares.
```

## s137-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1 and every word_1:

when unit_1 declares word_1 and is not a term, word_1 is a word declared in a unit that is not a term.
```

## s147-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
All of these hold:
- when a unit is held with units that cannot all hold, checker names it in its report of a contradiction
- when a scenario cannot happen while every held unit holds, checker reports that it cannot happen.
```

## s148-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a unit holds a formula with no keyword, the analyzer is asked to hold that formula.
```

## s149-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every search:

when the search is asked before any scenario is known to be impossible, the search leaves no unit out.
```

## s159-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1 and unit_2: if unit_1 is held with units that cannot all hold, and the analyzer is asked about unit_1 together with unit_2, then checker names unit_2 in its report of a contradiction.
```

## s160-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When one unit shares a word with another, the analyzer is asked about the first together with the second.
```

## s161-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1 and every unit_2:

when the analyzer is asked about unit_1 together with unit_2, unit_1 is linked to unit_2 through shared words.
```

## s171-s  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a scenario of a unit names a word, checker does not report the formula of any unit as lone on that word.
```

## s172-o  (vocabulary: canon-plugin-alloy.vocab.md)

```text
If a document that is context for another document holds a unit with a block that names a word outside its declaration, checker does not report the formula of any unit of the other document as lone on that word.
```

## s173-cur  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit and every word:

when the word is not a signature, checker does not report the formula of the unit as lone on the word.
```

## s186-s  (vocabulary: naturalloy.vocab.md)

```text
When a definition has two alternatives for one kind and can be said kind by kind, verbalizer says it as one noun phrase for that kind, with the alternatives joined by or.
```

## s187-o  (vocabulary: naturalloy.vocab.md)

```text
When a definition with an or inside one kind can be said kind by kind, the verbalizer says it as one run of clauses joined by commas and "or".
```

## s188-cur  (vocabulary: naturalloy.vocab.md)

```text
For every definition_1:

when definition_1 is a definition whose alternatives are of one kind and can be said kind by kind, verbalizer says definition_1 as one sentence.
```

## s198-s  (vocabulary: naturalloy.vocab.md)

```text
When a quantifier has several conditions, one of which begins with a time phrase, the verbalizer says it in full, with "there is" and the numbered name.
```

## s199-o  (vocabulary: naturalloy.vocab.md)

```text
The verbalizer says in full, with "there is" and the numbered name, every quantifier whose condition is not about its variable.
```

## s200-cur  (vocabulary: naturalloy.vocab.md)

```text
For every list:

when the list can be put in a sentence, verbalizer says the list in a sentence.
```

## s210-s  (vocabulary: naturalloy.vocab.md)

```text
When a list is a rule whose two sides are each one clause, and neither side begins with a time phrase, verbalizer says the list without "then".
```

## s211-o  (vocabulary: naturalloy.vocab.md)

```text
When a list is a rule whose first side begins with a time phrase, the verbalizer says it with "then" on a line of its own at the start of the second side.
```

## s212-cur  (vocabulary: naturalloy.vocab.md)

```text
For every list:

when the list is a rule with a first side and a second and is not a rule whose two sides are each one clause, verbalizer says the list with "then" at the start of the second side, on a line of its own.
```

## s222-s  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a list to have more than three clauses, all beginning with the same subject.
```

## s223-o  (vocabulary: naturalloy.vocab.md)

```text
It must be possible for a list to have both a clause about a pair of variables and an item that is more than one clause.
```

## s224-cur  (vocabulary: naturalloy.vocab.md)

```text
It must be possible that:

There is a list such that all of these hold:
- the list is a rule whose second side begins with a time phrase
- the list is not a rule whose two sides are each one clause
```
