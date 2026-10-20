## s216  (naturalloy · scenario-4-term-quantifier)

Formula:

```alloy
some f: Quantifier | f in VariableWithCondition and f in NothingToAttach
```

Current words:

```text
It must be possible that:

There is a quantifier_1 such that all of these hold:
- quantifier_1 is a quantifier whose variable has a further condition
- quantifier_1 is a quantifier with no fact for its variable beside another thing
```

## s187  (naturalloy · spec-the-options-of-an-or-inside-a-kind-are-one-coordination)

Formula:

```alloy
all f: Definition | (f in OrInsideKind and byKind[f]) implies f in OneCoordination
```

Current words:

```text
For every definition_1:

when definition_1 is a definition with an or inside one kind and can be said kind by kind, verbalizer says definition_1 as one run of clauses joined by commas and or.
```

## s114  (canon · scenario-2-axiom-a-check-the-project-asked-for-is-never-dropped-silently)

Formula:

```alloy
some r: Run, d: Document, f: Refused | d->f in Head.rel and d in Unreadable and r in Exits2
```

Current words:

```text
It must be possible that:

There are run_1 and document_1 and refused_frontmatter_1 such that all of these hold:
- document_1 starts with refused_frontmatter_1
- checker reports that document_1 has a frontmatter it cannot read
- run_1 exits with code 2
```

## s141  (canon-plugin-alloy · spec-a-document-that-keeps-no-readings-has-no-word-reported)

Formula:

```alloy
all d: Document, u: Unit, w: Word | (d not in Worded and d->u in Hold.units and u->w in Introduce.rel) implies (w not in Undeclared and w not in Misplaced and w not in Apart and w not in Unused and w not in Flagged)
```

Current words:

```text
For every document and every unit_1 and every word_1:

when the document keeps no readings, holds unit_1 and unit_1 declares word_1,

then all of these hold:
- word_1 is not a word that a reading says and nothing declares
- word_1 is not a word declared in a unit that is not a term
- word_1 is not a word whose reading is in another unit than its declaration
- word_1 is not a word that no claim, definition or fact uses
- checker does not report the word word_1
```

## s017  (canon · axiom-every-claim-says-what-it-follows-from)

Formula:

```alloy
(all u: Unit | unfounded[u] implies u in Finding)
and (all u: Unit | miscited[u] implies u in Finding)
and (all u: Unit | circular[u] implies u in Finding)
```

Current words:

```text
All of these hold:
- for every unit:

  when the unit is unfounded, checker reports a finding for the unit
- for every unit:

  when the unit is miscited, checker reports a finding for the unit
- for every unit:

  when the unit is circular, checker reports a finding for the unit.
```

## s110  (canon · scenario-2-term-checker)

Formula:

```alloy
some b: Bug, x: ExpectedFailure, i: Issue | b->i in Name.issue and i in Known and i not in Closed and checks[x, b] and b not in Finding and x not in Finding
```

Current words:

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

## s139  (canon-plugin-alloy · spec-a-declared-word-that-no-claim-uses-is-unused)

Formula:

```alloy
all w: Word | ((some u: Unit | u->w in Introduce.rel) and (no u: Unit | u->w in Rely.rel)) implies w in Unused
```

Current words:

```text
For every word_1:

when all of these hold:
- a unit declares word_1
- there is no unit_1 such that a claim, a definition or a fact of unit_1 uses word_1

then word_1 is a word that no claim, definition or fact uses.
```

## s173  (canon-plugin-alloy · spec-a-formula-is-not-reported-on-a-field-or-a-predicate)

Formula:

```alloy
all u: Unit, w: Word | w not in Signature implies u->w not in Expose.rel
```

Current words:

```text
For every unit and every word:

when the word is not a signature, checker does not report the formula of the unit as lone on the word.
```

## s085  (canon · spec-a-list-that-is-not-closed-is-refused)

Formula:

```alloy
all f: Unclosed | f in Refused
```

Current words:

```text
For every unclosed frontmatter:

the unclosed frontmatter is a frontmatter that the checker cannot read.
```

## s047  (canon · spec-an-unguarded-claim-is-untested)

Formula:

```alloy
all c: Claim | (some Runner and unguarded[c]) implies c in Untesting
```

Current words:

```text
For every claim:

when project has a runner and the claim is unguarded, checker reports an untesting for the claim.
```

## s178  (canon-plugin-alloy · scenario-1-spec-a-fault-of-the-verbalizer-fails-the-run-and-is-not-explained-as-unsayable)

Formula:

```alloy
some u: Unit | u in Faulted
```

Current words:

```text
It must be possible that:

There is a unit such that the verbalizer fails on the formula of the unit with a fault of its own.
```

## s209  (naturalloy · spec-a-rule-keeps-its-then-before-a-time-phrase)

Formula:

```alloy
all f: Series | (f in OneLineRule and f not in TimeFirst and f in TimeSecond) implies f in KeepsThen
```

Current words:

```text
For every list:

when all of these hold:
- the list is a rule whose two sides are each one clause
- the list is not a rule whose first side begins with a time phrase
- the list is a rule whose second side begins with a time phrase

then verbalizer says the list with "then" before the time phrase.
```

## s106  (canon · spec-a-frontmatter-changes-nothing-but-the-plugins-of-its-document)

Formula:

```alloy
all d, e: Document | d->e in Bare.rel implies ((all u: Unit | (e->u in Hold.units implies d->u in Hold.units) and (d->u in Hold.units implies e->u in Hold.units)) and (e in Finding implies d in Finding) and (d in Finding implies e in Finding))
```

Current words:

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

## s073  (canon · spec-a-project-with-no-tracker-reports-no-untracking)

Formula:

```alloy
all u: Unit | no Tracker implies u not in Untracking
```

Current words:

```text
For every unit:

when project has no tracker, checker reports no untracking for the unit.
```

## s147  (canon-plugin-alloy · axiom-the-claims-of-a-canon-never-contradict-each-other)

Formula:

```alloy
(all u: Unit | u in Contradicting implies u in Named) and (all c: Scenario | c in Impossible implies c in Raised)
```

Current words:

```text
All of these hold:
- for every unit_1:

  when unit_1 is held with units that cannot all hold, checker names unit_1 in its report of a contradiction
- for every scenario_1:

  when scenario_1 is a scenario that cannot happen while every held unit holds, checker reports that scenario_1 cannot happen.
```

## s095  (canon · spec-a-missing-plugin-is-reported)

Formula:

```alloy
all f: Frontmatter, p: Missing | lists[f, p] implies p in Unfound
```

Current words:

```text
For every frontmatter and every missing plugin:

when the frontmatter lists the missing plugin, checker reports that the project lacks the missing plugin.
```

## s076  (canon · spec-a-document-with-no-plugins-list-asks-for-no-plugin)

Formula:

```alloy
all p: Plugin, d: Document | ((no f: Listing | d->f in Head.rel) and d not in Given) implies p->d not in Over.rel
```

Current words:

```text
For every plugin and every document:

when the document starts with no listing frontmatter and the command line of a run does not name the document, checker does not run the plugin over the document.
```

## s211  (naturalloy · spec-a-rule-whose-first-side-begins-with-a-time-phrase-puts-its-then-on-a-line-of-its-own)

Formula:

```alloy
all f: Series | f in TimeFirst implies f in ThenOwnLine
```

Current words:

```text
For every list:

when the list is a rule whose first side begins with a time phrase, verbalizer says the list with "then" at the start of the second side, on a line of its own.
```

## s198  (naturalloy · spec-a-quantifier-with-a-time-phrase-in-one-of-several-conditions-is-said-in-full)

Formula:

```alloy
all f: Quantifier | f in TimedCondition implies f in InFull
```

Current words:

```text
For every quantifier_1:

when the following holds:

quantifier_1 is a quantifier with several conditions, one of which begins with a time phrase

then verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s131  (canon-plugin-alloy · spec-check-reports-a-statement-that-is-not-current)

Formula:

```alloy
all d: Document, u: Unit | (d in Worded and d->u in Hold.units and u in Logical and u not in Current) implies u in Reported
```

Current words:

```text
For every document and every unit:

when all of these hold:
- the document keeps readings
- the document holds the unit
- the unit holds a formula
- the statement of the unit is not current

then checker reports the statement of the unit.
```

## s083  (canon · spec-a-misquoted-entry-is-refused)

Formula:

```alloy
all f: Misquoted | f in Refused
```

Current words:

```text
For every misquoted frontmatter:

the misquoted frontmatter is a frontmatter that the checker cannot read.
```

## s180  (canon-plugin-alloy · scenario-1-axiom-a-formula-can-be-held-against-the-other-formulas)

Formula:

```alloy
some u: Unit, w: Signature | u in Logical and u->w in Rely.rel and u->w not in Expose.rel
```

Current words:

```text
It must be possible that:

There are unit_1 and signature_1 such that all of these hold:
- unit_1 holds a formula
- a claim, a definition or a fact of unit_1 uses signature_1
- checker does not report the formula of unit_1 as lone on signature_1
```

## s162  (canon-plugin-alloy · spec-logic-succeeds-when-nothing-is-reported)

Formula:

```alloy
all r: Run, c: LogicCommand | (r->c in Ask.rel and (no x: Scenario | x in Raised) and (no u: Unit | u in Contradicting)) implies r in Exits0
```

Current words:

```text
For every run and every logic command:

when all of these hold:
- the run asks for the logic command
- there is no scenario such that checker reports that the scenario cannot happen
- there is no unit_1 such that unit_1 is held with units that cannot all hold

then the run exits with code 0.
```

## s117  (canon-plugin-alloy · spec-a-unit-with-a-formula-and-no-statement-is-unwritten)

Formula:

```alloy
all u: Unit | (u in Logical and u not in Stated and u not in Unsayable) implies u in Unwritten
```

Current words:

```text
For every unit:

when all of these hold:
- the unit holds a formula
- the unit has no statement
- the formula of the unit can be said in words

then the statement of the unit is unwritten.
```

## s097  (canon · spec-an-unknown-command-fails-the-run)

Formula:

```alloy
all r: Run, c: Command | (r->c in Ask.rel and not available[c]) implies (c in Unknown and r in Exits2)
```

Current words:

```text
For every run and every command_1:

when the run asks for command_1 and command_1 is not available, checker reports command_1 as an unknown command and the run exits with code 2.
```

## s086  (canon · spec-a-string-that-is-not-closed-is-refused)

Formula:

```alloy
all f: Unterminated | f in Refused
```

Current words:

```text
For every unterminated frontmatter:

the unterminated frontmatter is a frontmatter that the checker cannot read.
```

## s193  (naturalloy · spec-a-noun-phrase-can-be-the-subject-of-a-sentence)

Formula:

```alloy
all f: Quantifier | (f in VariableSubject and fits[f]) implies f in AsSubjectPhrase
```

Current words:

```text
For every quantifier_1:

when quantifier_1 is a quantifier whose variable is the subject of the sentence and fits a noun phrase, verbalizer says quantifier_1 with the noun phrase as the subject, such as "a tag names unit_1".
```

## s135  (canon-plugin-alloy · spec-generate-fails-on-an-unsayable-formula-and-says-why)

Formula:

```alloy
all r: Run, c: GenerateCommand, u: Unit | (r->c in Ask.rel and u in Unsayable) implies (u in Explained and r not in Exits0)
```

Current words:

```text
For every run and every generate command and every unit:

when the run asks for the generate command and the formula of the unit cannot be said in words, checker says why the formula of the unit cannot be said and the run does not exit with code 0.
```

## s219  (naturalloy · scenario-3-term-definition-passage)

Formula:

```alloy
some f: Definition | f in OrInsideKind and f in NoKindFirst
```

Current words:

```text
It must be possible that:

There is a definition_1 such that all of these hold:
- definition_1 is a definition with an or inside one kind
- definition_1 is a definition with an alternative that does not begin with its kind
```

## s231  (canon-plugin-alloy-fixtures-lifetimes · spec-a-throwing-owner-cleanup-is-reported)

Formula:

```alloy
(always all o: Owner, c: Failing |
  (runNow[c] and c.on = o and o in Disposed) implies always o not in Threw)
and
(always all o, h: Owner, c: Failing |
  (runNow[c] and c.on = o and o in Disposed and o.handler = h) implies eventually c.reached = h)
```

Current words:

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

## s108  (canon · spec-a-frontmatter-changes-no-finding)

Formula:

```alloy
all d, e: Document | d->e in Bare.rel implies ((e in Finding implies d in Finding) and (d in Finding implies e in Finding))
```

Current words:

```text
For every document_1 and every document_2:

when document_1 is document_2 without its frontmatter,

then all of these hold:
- when checker reports a finding for document_2, checker reports a finding for document_1
- when checker reports a finding for document_1, checker reports a finding for document_2
```

## s084  (canon · spec-a-key-the-checker-does-not-know-is-refused)

Formula:

```alloy
all f: Foreign | f in Refused
```

Current words:

```text
For every foreign frontmatter:

the foreign frontmatter is a frontmatter that the checker cannot read.
```

## s092  (canon · spec-a-document-with-a-refused-frontmatter-is-reported)

Formula:

```alloy
all d: Document, f: Refused | d->f in Head.rel implies d in Unreadable
```

Current words:

```text
For every document and every refused frontmatter:

when the document starts with the refused frontmatter, checker reports that the document has a frontmatter it cannot read.
```

## s199  (naturalloy · spec-a-condition-that-is-not-about-the-variable-is-said-in-full)

Formula:

```alloy
all f: Quantifier | f in ConditionAside implies f in InFull
```

Current words:

```text
For every quantifier_1:

when quantifier_1 is a quantifier whose condition is not about its variable, verbalizer says quantifier_1 in full, with "there is" and the numbered name.
```

## s102  (canon · spec-a-run-exits-with-the-worst-code-of-its-plugins)

Formula:

```alloy
all r: Run | ((some p: Plugin | r->p in Return.code2) implies r in Exits2) and (((some p: Plugin | r->p in Return.code1) and (no p: Plugin | r->p in Return.code2)) implies r in Exits1)
```

Current words:

```text
For every run:

all of these hold:
- when the run gets code 2 from a plugin, the run exits with code 2
- when the run gets code 1 from a plugin and gets code 2 from no plugin, the run exits with code 1
```

## s038  (canon · spec-a-hidden-conflict-is-reported)

Formula:

```alloy
all c: Conflict | hidden[c] implies c in Finding
```

Current words:

```text
For every conflict:

when the conflict is hidden, checker reports a finding for the conflict.
```

## s155  (canon-plugin-alloy · spec-a-scenario-that-can-happen-is-not-reported)

Formula:

```alloy
all c: Scenario | c in Possible implies c not in Raised
```

Current words:

```text
For every scenario_1:

when scenario_1 is a scenario that can happen while every held unit holds, checker does not report that scenario_1 cannot happen.
```

## s200  (naturalloy · spec-three-clauses-or-fewer-are-said-in-a-sentence)

Formula:

```alloy
all f: Series | sentenceable[f] implies f in AsSentence
```

Current words:

```text
For every list:

when the list can be put in a sentence, verbalizer says the list in a sentence.
```

## s174  (canon-plugin-alloy · spec-a-term-is-not-reported-as-lone)

Formula:

```alloy
all u: Term, w: Word | u->w not in Expose.rel
```

Current words:

```text
For every term and every word:

checker does not report the formula of the term as lone on the word.
```
