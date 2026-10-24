Vocabulary files for this batch: canon-plugin-alloy.vocab.md, naturalloy.vocab.md, canon.vocab.md

## a149  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1 and every word:
  when unit_1 declares the word and is not a term, the word is declared in a unit that is not a term.
```

## a139  (vocabulary: canon-plugin-alloy.vocab.md)

```text
All of these hold:
  - checker reports the formula of a unit as lone on a signature when all of these hold:
      - the unit holds a formula
      - the unit is not a term
      - no other formula can contradict the formula of the unit
  - for every unit and every word:
      when checker reports the formula of the unit as lone on the word, no other formula can contradict the formula of the unit.
```

## a115  (vocabulary: naturalloy.vocab.md)

```text
For every pass_1 and every pass_2:
  when pass_1 puts a time phrase in front of the words it covers and pass_2 says a few clauses as one sentence, pass_1 runs before pass_2.
```

## a101  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every word_1:
  checker reports the word word_1 when at least one of these holds:
    - word_1 is said by a reading and declared by nothing
    - word_1 is declared in a unit that is not a term
    - the reading of word_1 is in another unit than its declaration
    - no claim, definition or fact uses word_1
```

## a122  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document_1, every document_2, every unit_1, every unit_2 and every word:
  checker does not report the formula of unit_1 as lone on the word when all of these hold:
    - document_2 is context for document_1
    - document_1 holds unit_1
    - document_2 holds unit_2
    - a block of unit_2 names the word outside its declaration
```

## a112  (vocabulary: naturalloy.vocab.md)

```text
Verbalizer says the second side of a list before its first side when all of these hold:
  - the list is a rule whose first side is a run of clauses said as bullets
  - the list is a rule whose second side is one line with no time phrase, relative clause, comma or "when"
  - the list is not a rule with an "otherwise"
```

## a157  (vocabulary: canon.vocab.md)

```text
For every plugin, every document and every listing frontmatter:
  when the document starts with the listing frontmatter and the listing frontmatter lists the plugin, checker runs the plugin over the document.
```

## a134  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When the statement of a unit is current, checker does not write the statement of the unit when it generates.
```

## a102  (vocabulary: naturalloy.vocab.md)

```text
Verbalizer says a list as bullets when all of these hold:
  - the list has an item that holds a comma
  - the list has more than two clauses
```

## a111  (vocabulary: canon.vocab.md)

```text
The checker cannot read a frontmatter when at least one of these holds:
  - the frontmatter has the flaw of an entry that starts with an at sign outside quotes
  - the frontmatter has the flaw of a key that neither the checker nor a plugin that the frontmatter lists defines
  - the frontmatter has the flaw of a list that is not closed
  - the frontmatter has the flaw of a string that is not closed
  - the frontmatter has the flaw of a key that appears twice
  - the frontmatter has the flaw of a path that names no document
  - the frontmatter has the flaw of an extension that leads back to its own document
  - the frontmatter has the flaw of a setting in a document that is not the entry document
```

## a146  (vocabulary: canon.vocab.md)

```text
For every fence and every unit:
  when the fence names a language and lies in the own text of the unit, checker reads the fence as a block of the unit.
```

## a105  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1 and every unit_2:
  checker names unit_2 in its report of a contradiction when all of these hold:
    - unit_1 is held with units that cannot all hold
    - the analyzer is asked about unit_1 together with unit_2
```

## a156  (vocabulary: canon-plugin-alloy.vocab.md)

```text
When a search leaves one unit out
then there is exactly one unit_1 such that all of these hold:
       - the search leaves out unit_1
       - the analyzer is asked to hold the formula of unit_1
       - the search does not require unit_1 to hold
       - for every unit_2:
           the search requires unit_2 to hold when all of these hold:
             - the analyzer is asked to hold the formula of unit_2
             - unit_2 and unit_1 are different
```

## a126  (vocabulary: canon.vocab.md)

```text
For every plugin, every document and every listing frontmatter:
  checker does not run the plugin over the document when all of these hold:
    - the document starts with the listing frontmatter
    - the listing frontmatter does not list the plugin
    - the command line of no run names the document
```

## a123  (vocabulary: canon.vocab.md)

```text
For every plugin, every document and every listing frontmatter:
  checker does not run the plugin over the document when all of these hold:
    - the document starts with the listing frontmatter
    - the listing frontmatter holds no entry
    - the command line of no run names the document
```

## a110  (vocabulary: canon-plugin-alloy.vocab.md)

```text
All of these hold:
  - when the verbalizer fails on the formula of a unit with a fault of its own, checker does not say why the formula of the unit cannot be said
  - for every run, every command_1 and every unit:
      the run does not exit with code 0 when all of these hold:
        - the run asks for command_1
        - command_1 is the command `generate` or is the command `check`
        - the verbalizer fails on the formula of the unit with a fault of its own
```

## a108  (vocabulary: naturalloy.vocab.md)

```text
When a definition has an alternative that says something about another unit, verbalizer says the definition as a list of the alternatives as they stand.
```

## a140  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit:
  all of these hold:
    - the statement of the unit is current when all of these hold:
        - the unit holds a formula
        - the statement of the unit sits between the markers of a generated region
        - the statement of the unit does not differ from what its formula says
        - the formula of the unit can be said in words
        - the statement of the unit reads back as its formula alone
    - when the unit holds no formula, the statement of the unit is not current
```

## a155  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run and every logic command:
  the run exits with code 0 when all of these hold:
    - the run asks for the logic command
    - there is no scenario such that checker reports that the scenario cannot happen
    - no unit is held with units that cannot all hold
```

## a117  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document and every unit:
  checker reports the statement of the unit when all of these hold:
    - the document keeps readings
    - the document holds the unit
    - the unit holds a formula
    - the statement of the unit is not current
```

## a136  (vocabulary: naturalloy.vocab.md)

```text
For every pass_1 and every pass_2:
  pass_1 runs before pass_2 when all of these hold:
    - pass_1 says until and since of two clauses as one sentence
    - pass_2 puts a time phrase in front of the words it covers
```

## a147  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run, every generate command and every unit:
  when the run asks for the generate command and the statement of the unit is handwritten, checker reports the statement of the unit and the run does not exit with code 0.
```

## a143  (vocabulary: canon.vocab.md)

```text
For every run:
  all of these hold:
    - when the run gets code 2 from a plugin, the run exits with code 2
    - the run exits with code 1 when all of these hold:
        - the run gets code 1 from a plugin
        - the run gets code 2 from no plugin
        - checker does not stop the run itself
```

## a135  (vocabulary: naturalloy.vocab.md)

```text
Verbalizer says a list without "then" when all of these hold:
  - the list is a rule whose two sides are each one clause
  - the list is not a rule whose first side begins with a time phrase
  - the list is not a rule whose second side begins with a time phrase
```

## a109  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1 and every unit_2:
  when unit_1 shares a word with unit_2, the analyzer is asked about unit_1 together with unit_2.
```

## a144  (vocabulary: canon.vocab.md)

```text
A run exits with code 2 when at least one of these holds:
  - there is a frontmatter that lists a missing plugin
  - there is a document such that checker reports that the document has a frontmatter it cannot read
  - the run asks for a command that is not available
  - the run gets code 2 from a plugin
```

## a153  (vocabulary: canon.vocab.md)

```text
For every run and every command_1:
  when the run asks for command_1 and command_1 is not available, checker reports command_1 as an unknown command.
```

## a103  (vocabulary: naturalloy.vocab.md)

```text
Verbalizer says a list with "then" before the time phrase when all of these hold:
  - the list is a rule whose two sides are each one clause
  - the list is not a rule whose first side begins with a time phrase
  - the list is a rule whose second side begins with a time phrase
```

## a121  (vocabulary: canon.vocab.md)

```text
A run exits with code 1 when all of these hold:
  - the run gets code 1 from a plugin
  - the run gets code 2 from no plugin
  - checker does not stop the run itself
```

## a107  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every word_1:
  checker does not report the word word_1 when all of these hold:
    - word_1 is said by no reading or is declared
    - word_1 is not declared in a unit that is not a term
    - the reading of word_1 is in the unit of its declaration
    - a claim, a definition or a fact uses word_1
```

## a150  (vocabulary: naturalloy.vocab.md)

```text
When a list is longer than a line when it is put in a sentence, verbalizer says the list as bullets.
```

## a138  (vocabulary: naturalloy.vocab.md)

```text
For every pass_1 and every pass_2:
  pass_1 runs before pass_2 when all of these hold:
    - pass_1 says a set equal to a variable as that variable and no other
    - pass_2 makes nested quantifiers of "for every" one
```

## a141  (vocabulary: canon.vocab.md)

```text
When project has a tracker and a bug names no issue, checker reports an untracking for the bug.
```

## a127  (vocabulary: canon-plugin-alloy.vocab.md)

```text
The statement of a unit is handwritten when all of these hold:
  - the unit holds a formula
  - the unit has a statement
  - the statement of the unit does not sit between the markers of a generated region
  - the formula of the unit can be said in words
```

## a133  (vocabulary: canon.vocab.md)

```text
When a fence names a language and has no second word that names a role, the fence has the role of the formula of its unit.
```

## a104  (vocabulary: canon-plugin-alloy.vocab.md)

```text
The formula of a unit cannot be said in words when at least one of these holds:
  - the formula of the unit names a word that has no reading
  - the unit holds more than one formula
```

## a152  (vocabulary: naturalloy.vocab.md)

```text
For every pass_1 and every pass_2:
  pass_1 runs before pass_2 when all of these hold:
    - pass_1 says a rule at every later moment as "from now on, whenever"
    - pass_2 says the second side of a rule before its first side
```

## a124  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document_1, every document_2 and every unit:
  the analyzer is asked to hold the formula of the unit when all of these hold:
    - the project lists document_1 among the documents it checks
    - document_2 is context for document_1
    - document_2 holds the unit
    - the unit holds a formula with no keyword
```

## a114  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document_1, every document_2, every unit_1, every unit_2 and every word:
  the word is said by no reading or is declared when all of these hold:
    - document_2 is context for document_1
    - document_1 holds unit_1
    - a reading in unit_1 says the word
    - document_2 holds unit_2
    - unit_2 declares the word
```

## a151  (vocabulary: canon-plugin-alloy.vocab.md)

```text
The statement of a unit is unwritten when all of these hold:
  - the unit holds a formula
  - the unit has no statement
  - the formula of the unit can be said in words
```

## a154  (vocabulary: canon.vocab.md)

```text
A run exits with code 0 when all of these hold:
  - there is no plugin such that the run gets code 1 from the plugin or gets code 2 from the plugin
  - checker does not stop the run itself
```

## a145  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every run and every logic command:
  the run does not exit with code 0 when all of these hold:
    - the run asks for the logic command
    - at least one of these holds:
        - there is a scenario such that checker reports that the scenario cannot happen
        - there is a unit that is held with units that cannot all hold
```

## a113  (vocabulary: naturalloy.vocab.md)

```text
For every pass_1 and every pass_2:
  when pass_1 moves a negation inward and pass_2 says a quantifier as a noun phrase, pass_1 runs before pass_2.
```

## a128  (vocabulary: naturalloy.vocab.md)

```text
For every pass_1 and every pass_2:
  when pass_1 says a few clauses as one sentence and pass_2 says the second side of a rule before its first side, pass_1 runs before pass_2.
```

## a148  (vocabulary: naturalloy.vocab.md)

```text
For every pass_1 and every pass_2:
  pass_1 runs before pass_2 when all of these hold:
    - pass_1 says a few clauses as one sentence
    - pass_2 says the subject and the verb that negative clauses share once, before "none of these"
```

## a119  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every scenario and every unit:
  checker names the unit in its report of the scenario when all of these hold:
    - checker reports that the scenario cannot happen
    - leaving out the unit lets the scenario happen
```

## a118  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1, every unit_2 and every word:
  checker does not report the formula of unit_1 as lone on the word when all of these hold:
    - unit_2 and unit_1 are different
    - a block of unit_2 names the word outside its declaration
```

## a132  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document, every unit and every word:
  when the document keeps no readings and holds the unit, checker does not report the formula of the unit as lone on the word.
```

## a106  (vocabulary: canon-plugin-alloy.vocab.md)

```text
A word is said by a reading and declared by nothing when all of these hold:
  - there is a unit_1 such that a reading in unit_1 says the word
  - no unit declares the word
```

## a116  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit and every signature:
  checker reports the formula of the unit as lone on the signature when all of these hold:
    - the unit holds a formula
    - the unit is not a term
    - the formula of the unit is lone on the signature
```

## a125  (vocabulary: canon-plugin-alloy.vocab.md)

```text
The statement of a unit is stale when all of these hold:
  - the unit holds a formula
  - the statement of the unit sits between the markers of a generated region
  - the statement of the unit differs from what its formula says
  - the formula of the unit can be said in words
```

## a142  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every search, every scenario and every unit_1:
  the author asks about leaving out unit_1 for the scenario when all of these hold:
    - the search leaves one unit out
    - the search requires the scenario to happen
    - the search leaves out unit_1
    - there is a unit_2 such that the author asks about leaving out unit_2 for the scenario
```

## a120  (vocabulary: naturalloy.vocab.md)

```text
For every pass_1 and every pass_2:
  pass_1 runs before pass_2 when all of these hold:
    - pass_1 says a quantifier as a noun phrase
    - pass_2 says a quantifier of its variable alone as "there is a … that"
```

## a129  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every unit_1 and every word:
  the reading of the word is in another unit than its declaration when all of these hold:
    - a reading in unit_1 says the word
    - a unit declares the word
    - unit_1 does not declare the word
```

## a130  (vocabulary: canon-plugin-alloy.vocab.md)

```text
For every document and every unit:
  checker reports the statement of the unit when all of these hold:
    - the document keeps readings
    - the document holds the unit
    - the unit holds a formula
    - the statement of the unit is not current
```

## a137  (vocabulary: canon.vocab.md)

```text
Checker reports an orphaning for a unit when all of these hold:
  - the unit is not used
  - the unit is not a conflict
  - the unit is not a thread
```

## a131  (vocabulary: canon-plugin-alloy.vocab.md)

```text
Checker reports the formula of a unit as lone on a signature when all of these hold:
  - the unit holds a formula
  - the unit is not a term
  - no other formula can contradict the formula of the unit
```
