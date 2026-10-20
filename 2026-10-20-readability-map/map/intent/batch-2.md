Vocabulary file: canon.vocab.md

## s072  (spec-a-project-with-no-runner-reports-no-untesting)

Claim (the unit's name, as a sentence): **a project with no runner reports no untesting**

Refines: "the check can be taken at its word" → "a finding is never false"

Rationale: This follows because a test is a call that a [runner](#term-runner) declares, so a project with no runner has no tests. An [untesting](#term-untesting) there would ask for a test that the project has chosen not to have.

Formula:
```alloy
all u: Unit | no Runner implies u not in Untesting
```

What the formula says, exactly:
```text
For every unit:

when project has no runner, checker reports no untesting for the unit.
```

## s073  (spec-a-project-with-no-tracker-reports-no-untracking)

Claim (the unit's name, as a sentence): **a project with no tracker reports no untracking**

Refines: "the check can be taken at its word" → "a finding is never false"

Rationale: This follows because an [issue](#term-issue) is an entry of the [tracker](#term-tracker). A project with no tracker has no issue that a bug or a conflict could name. An [untracking](#term-untracking) there would ask for an issue line that names nothing, which an author could only meet with a number that tracks no work.

Formula:
```alloy
all u: Unit | no Tracker implies u not in Untracking
```

What the formula says, exactly:
```text
For every unit:

when project has no tracker, checker reports no untracking for the unit.
```

## s074  (axiom-a-check-the-project-asked-for-is-never-dropped-silently)

Claim (the unit's name, as a sentence): **a check the project asked for is never dropped silently**

Refines: "the check can be taken at its word"

Rationale: This narrows taking the check at its word to the checks the project asks for: a check that did not run never passes for clean. A project asks for its checks in its documents: the plugins a document names, and the command it runs. A check that the project asks for either runs, or the author hears that it could not. Otherwise a mistake as small as a misspelled key turns a check off, and the author trusts a canon that nothing has checked. So a [run](#term-run) that asks for what the checker cannot deliver exits with code 2. Code 2 stands above a finding and above success. Four things ask for too much. One is a [plugin](#term-plugin) the project lacks. Another is a [frontmatter](#term-frontmatter) the checker cannot read. The others are a [command](#term-command) that nothing adds, and a plugin that could not run.

Formula:
```alloy
all r: Run | ((some f: Frontmatter, p: Missing | lists[f, p]) or (some d: Document | d in Unreadable) or (some c: Command | r->c in Ask.rel and not available[c]) or (some p: Plugin | r->p in Return.code2)) implies r in Exits2
```

What the formula says, exactly:
```text
For every run:

when at least one of these holds:
- there are frontmatter_1 and missing_plugin_1 such that frontmatter_1 lists missing_plugin_1
- there is a document such that checker reports that the document has a frontmatter it cannot read
- the run asks for a command that is not available
- the run gets code 2 from a plugin

then the run exits with code 2.
```

## s075  (spec-a-document-gets-the-plugins-it-asks-for)

Claim (the unit's name, as a sentence): **a document gets the plugins it asks for**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently"

Rationale: This follows because the plugins a document names are the checks it asks for. It gets those and no others. A plugin it did not ask for adds no finding, and one it asked for is not left out. A document that names none asks for none.

Formula:
```alloy
all p: Plugin, d: Document | (applies[p, d] implies p->d in Over.rel) and ((d not in Given and p->d in Over.rel) implies applies[p, d])
```

What the formula says, exactly:
```text
For every plugin and every document:

all of these hold:
- when the plugin applies to the document, checker runs the plugin over the document
- when the command line of a run does not name the document and checker runs the plugin over the document, the plugin applies to the document
```

## s076  (spec-a-document-with-no-plugins-list-asks-for-no-plugin)

Claim (the unit's name, as a sentence): **a document with no plugins list asks for no plugin**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a document gets the plugins it asks for"

Rationale: This follows because such a document names no plugin, so it asks for no check.

Formula:
```alloy
all p: Plugin, d: Document | ((no f: Listing | d->f in Head.rel) and d not in Given) implies p->d not in Over.rel
```

What the formula says, exactly:
```text
For every plugin and every document:

when the document starts with no listing frontmatter and the command line of a run does not name the document, checker does not run the plugin over the document.
```

## s077  (spec-a-plugin-a-document-lists-runs-over-it)

Claim (the unit's name, as a sentence): **a plugin a document lists runs over it**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a document gets the plugins it asks for"

Rationale: This follows because a plugin that is listed is asked for.

Formula:
```alloy
all p: Plugin, d: Document, f: Listing | (d->f in Head.rel and lists[f, p]) implies p->d in Over.rel
```

What the formula says, exactly:
```text
For every plugin and every document and every listing frontmatter:

when the document starts with the listing frontmatter and the listing frontmatter lists the plugin, checker runs the plugin over the document.
```

## s078  (spec-a-plugin-a-document-does-not-list-does-not-run-over-it)

Claim (the unit's name, as a sentence): **a plugin a document does not list does not run over it**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a document gets the plugins it asks for"

Rationale: This follows because a list is the whole of what the document asks for.

Formula:
```alloy
all p: Plugin, d: Document, f: Listing | (d->f in Head.rel and not lists[f, p] and d not in Given) implies p->d not in Over.rel
```

What the formula says, exactly:
```text
For every plugin and every document and every listing frontmatter:

when all of these hold:
- the document starts with the listing frontmatter
- the listing frontmatter does not list the plugin
- the command line of a run does not name the document

then checker does not run the plugin over the document.
```

## s079  (spec-an-empty-list-asks-for-no-plugin)

Claim (the unit's name, as a sentence): **an empty list asks for no plugin**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a document gets the plugins it asks for"

Rationale: This follows because an empty list is an answer: the document asks for no plugin, and the commands of the checker are still there.

Formula:
```alloy
all p: Plugin, d: Document, f: Listing | (d->f in Head.rel and (no e: Entry | f->e in Item.rel) and d not in Given) implies p->d not in Over.rel
```

What the formula says, exactly:
```text
For every plugin and every document and every listing frontmatter:

when all of these hold:
- the document starts with the listing frontmatter
- the listing frontmatter holds no entry
- the command line of a run does not name the document

then checker does not run the plugin over the document.
```

## s080  (spec-a-document-named-on-the-command-line-is-checked-whatever-its-frontmatter-says)

Claim (the unit's name, as a sentence): **a document named on the command line is checked whatever its frontmatter says**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a document gets the plugins it asks for"

Rationale: This follows because naming a file on the command line asks for the check of that file.

Formula:
```alloy
all r: Run, p: Plugin, d: Given | calls[r, p] implies p->d in Over.rel
```

What the formula says, exactly:
```text
For every run_1 and every plugin and every given document:

when run_1 calls the plugin, checker runs the plugin over the given document.
```

## s081  (spec-a-frontmatter-with-no-plugins-key-holds-no-entry)

Claim (the unit's name, as a sentence): **a frontmatter with no plugins key holds no entry**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a frontmatter lists what is written in it"

Rationale: This follows because a block with no key asks for nothing, and so the document names no plugin.

Formula:
```alloy
all f: Frontmatter | f not in Listing implies (no e: Entry | f->e in Item.rel)
```

What the formula says, exactly:
```text
For every frontmatter_1:

when frontmatter_1 is not a frontmatter with a plugins key, frontmatter_1 holds no entry.
```

## s082  (spec-a-flawed-frontmatter-is-refused)

Claim (the unit's name, as a sentence): **a flawed frontmatter is refused**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently"

Rationale: This follows because the checker reads a small part of YAML and nothing else. A block it misreads would drop a check without a word, so it refuses a block with a flaw.

Formula:
```alloy
all f: Frontmatter | (f in Misquoted or f in Foreign or f in Unclosed or f in Unterminated or f in Doubled or f in Dangling or f in Looping or f in Stray) implies f in Refused
```

What the formula says, exactly:
```text
For every frontmatter_1:

when at least one of these holds:
- frontmatter_1 has the flaw of an entry that starts with an at sign outside quotes
- frontmatter_1 has the flaw of a key that neither the checker nor a plugin that frontmatter_1 lists defines
- frontmatter_1 has the flaw of a list that is not closed
- frontmatter_1 has the flaw of a string that is not closed
- frontmatter_1 has the flaw of a key that appears twice
- frontmatter_1 has the flaw of a path that names no document
- frontmatter_1 has the flaw of an extension that leads back to its own document
- frontmatter_1 has the flaw of a setting in a document that is not the entry document

then frontmatter_1 is a frontmatter that the checker cannot read.
```

## s083  (spec-a-misquoted-entry-is-refused)

Claim (the unit's name, as a sentence): **a misquoted entry is refused**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a flawed frontmatter is refused"

Rationale: This follows because YAML does not read an unquoted entry with an at sign as a package name, and the author meant the package.

Formula:
```alloy
all f: Misquoted | f in Refused
```

What the formula says, exactly:
```text
For every misquoted frontmatter:

the misquoted frontmatter is a frontmatter that the checker cannot read.
```

## s084  (spec-a-key-the-checker-does-not-know-is-refused)

Claim (the unit's name, as a sentence): **a key the checker does not know is refused**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a flawed frontmatter is refused"

Rationale: This follows because a misspelled key would otherwise drop a setting or a list of plugins without a word. The checker accepts a key that a plugin defines once the document lists that plugin.

Formula:
```alloy
all f: Foreign | f in Refused
```

What the formula says, exactly:
```text
For every foreign frontmatter:

the foreign frontmatter is a frontmatter that the checker cannot read.
```

## s085  (spec-a-list-that-is-not-closed-is-refused)

Claim (the unit's name, as a sentence): **a list that is not closed is refused**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a flawed frontmatter is refused"

Rationale: This follows because the end of the list is unknown, and so is what it names.

Formula:
```alloy
all f: Unclosed | f in Refused
```

What the formula says, exactly:
```text
For every unclosed frontmatter:

the unclosed frontmatter is a frontmatter that the checker cannot read.
```

## s086  (spec-a-string-that-is-not-closed-is-refused)

Claim (the unit's name, as a sentence): **a string that is not closed is refused**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a flawed frontmatter is refused"

Rationale: This follows because the end of the string is unknown, and so is the plugin it names.

Formula:
```alloy
all f: Unterminated | f in Refused
```

What the formula says, exactly:
```text
For every unterminated frontmatter:

the unterminated frontmatter is a frontmatter that the checker cannot read.
```

## s087  (spec-a-key-written-twice-is-refused)

Claim (the unit's name, as a sentence): **a key written twice is refused**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a flawed frontmatter is refused"

Rationale: This follows because the two lists may differ, and the checker cannot tell which one the author meant.

Formula:
```alloy
all f: Doubled | f in Refused
```

What the formula says, exactly:
```text
For every doubled frontmatter:

the doubled frontmatter is a frontmatter that the checker cannot read.
```

## s088  (spec-a-path-that-names-no-document-is-refused)

Claim (the unit's name, as a sentence): **a path that names no document is refused**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a flawed frontmatter is refused"

Rationale: This follows because a document that is not there cannot be context, and the author would read a canon that has less than it names.

Formula:
```alloy
all f: Dangling | f in Refused
```

What the formula says, exactly:
```text
For every dangling frontmatter:

the dangling frontmatter is a frontmatter that the checker cannot read.
```

## s089  (spec-an-extension-that-leads-back-is-refused)

Claim (the unit's name, as a sentence): **an extension that leads back is refused**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a flawed frontmatter is refused"

Rationale: This follows because a document that is its own context has no first reading, and the checker would have to choose where to start.

Formula:
```alloy
all f: Looping | f in Refused
```

What the formula says, exactly:
```text
For every circular frontmatter:

the circular frontmatter is a frontmatter that the checker cannot read.
```

## s090  (spec-a-setting-outside-the-entry-document-is-refused)

Claim (the unit's name, as a sentence): **a setting outside the entry document is refused**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a flawed frontmatter is refused"

Rationale: This follows because the settings of a project come from its entry document alone. Another document that the project checks would ignore the setting without a word. The author would then trust a check that the project never asked for.

Formula:
```alloy
all f: Stray | f in Refused
```

What the formula says, exactly:
```text
For every stray frontmatter:

the stray frontmatter is a frontmatter that the checker cannot read.
```

## s091  (spec-a-refused-frontmatter-fails-the-run)

Claim (the unit's name, as a sentence): **a refused frontmatter fails the run**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently"

Rationale: This follows because a refused frontmatter asks for checks that the checker cannot name, so the run must say it could not run them.

Formula:
```alloy
all r: Run, d: Document, f: Refused | d->f in Head.rel implies (d in Unreadable and r in Exits2)
```

What the formula says, exactly:
```text
For every run and every document and every refused frontmatter:

when the document starts with the refused frontmatter,

then all of these hold:
- checker reports that the document has a frontmatter it cannot read
- the run exits with code 2
```

## s092  (spec-a-document-with-a-refused-frontmatter-is-reported)

Claim (the unit's name, as a sentence): **a document with a refused frontmatter is reported**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a refused frontmatter fails the run"

Rationale: This follows because the author must find the document that holds the flaw.

Formula:
```alloy
all d: Document, f: Refused | d->f in Head.rel implies d in Unreadable
```

What the formula says, exactly:
```text
For every document and every refused frontmatter:

when the document starts with the refused frontmatter, checker reports that the document has a frontmatter it cannot read.
```

## s093  (spec-a-report-of-an-unreadable-frontmatter-stops-the-run)

Claim (the unit's name, as a sentence): **a report of an unreadable frontmatter stops the run**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a refused frontmatter fails the run"

Rationale: This follows because a check the author asked for cannot run when the checker cannot tell which one it is.

Formula:
```alloy
all r: Run | (some d: Document | d in Unreadable) implies r in Exits2
```

What the formula says, exactly:
```text
For every run:

when there is a document such that checker reports that the document has a frontmatter it cannot read, the run exits with code 2.
```

## s094  (spec-a-plugin-the-project-lacks-fails-the-run)

Claim (the unit's name, as a sentence): **a plugin the project lacks fails the run**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently"

Rationale: This follows because a name that stands for no package is a check that cannot run. A document may name only what the project already has, because the checker fetches and runs nothing new.

Formula:
```alloy
all r: Run, f: Frontmatter, p: Missing | lists[f, p] implies (p in Unfound and r in Exits2)
```

What the formula says, exactly:
```text
For every run and every frontmatter and every missing plugin:

when the frontmatter lists the missing plugin,

then all of these hold:
- checker reports that the project lacks the missing plugin
- the run exits with code 2
```

## s095  (spec-a-missing-plugin-is-reported)

Claim (the unit's name, as a sentence): **a missing plugin is reported**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a plugin the project lacks fails the run"

Rationale: This follows because the author must see which name stands for no package.

Formula:
```alloy
all f: Frontmatter, p: Missing | lists[f, p] implies p in Unfound
```

What the formula says, exactly:
```text
For every frontmatter and every missing plugin:

when the frontmatter lists the missing plugin, checker reports that the project lacks the missing plugin.
```

## s096  (spec-a-missing-plugin-stops-the-run)

Claim (the unit's name, as a sentence): **a missing plugin stops the run**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a plugin the project lacks fails the run"

Rationale: This follows because a check the author asked for did not run.

Formula:
```alloy
all r: Run, f: Frontmatter, p: Missing | lists[f, p] implies r in Exits2
```

What the formula says, exactly:
```text
For every run and every frontmatter and every missing plugin:

when the frontmatter lists the missing plugin, the run exits with code 2.
```

## s097  (spec-an-unknown-command-fails-the-run)

Claim (the unit's name, as a sentence): **an unknown command fails the run**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently"

Rationale: This follows because a command that nothing adds is a job that cannot run. The author must hear so, and not get a success.

Formula:
```alloy
all r: Run, c: Command | (r->c in Ask.rel and not available[c]) implies (c in Unknown and r in Exits2)
```

What the formula says, exactly:
```text
For every run and every command_1:

when the run asks for command_1 and command_1 is not available, checker reports command_1 as an unknown command and the run exits with code 2.
```

## s098  (spec-a-command-that-is-not-available-is-reported-as-unknown)

Claim (the unit's name, as a sentence): **a command that is not available is reported as unknown**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "an unknown command fails the run"

Rationale: This follows because the author must see that the word was not understood.

Formula:
```alloy
all r: Run, c: Command | (r->c in Ask.rel and not available[c]) implies c in Unknown
```

What the formula says, exactly:
```text
For every run and every command_1:

when the run asks for command_1 and command_1 is not available, checker reports command_1 as an unknown command.
```

## s099  (spec-a-command-that-is-not-available-stops-the-run)

Claim (the unit's name, as a sentence): **a command that is not available stops the run**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "an unknown command fails the run"

Rationale: This follows because the job the author asked for did not run.

Formula:
```alloy
all r: Run, c: Command | (r->c in Ask.rel and not available[c]) implies r in Exits2
```

What the formula says, exactly:
```text
For every run and every command:

when the run asks for the command and the command is not available, the run exits with code 2.
```

## s100  (spec-an-available-command-is-not-reported-as-unknown)

Claim (the unit's name, as a sentence): **an available command is not reported as unknown**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "an unknown command fails the run"

Rationale: This follows because a command of the package is there for a document that asks for no plugin too.

Formula:
```alloy
all c: Command | available[c] implies c not in Unknown
```

What the formula says, exactly:
```text
For every command_1:

when command_1 is available, checker does not report command_1 as an unknown command.
```

## s101  (spec-every-plugin-a-run-calls-runs)

Claim (the unit's name, as a sentence): **every plugin a run calls runs**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently"

Rationale: This follows because a check that the project asks for and that does not run is dropped. All the plugins that add one command run, and none stands in for another.

Formula:
```alloy
all r: Run, p: Plugin | calls[r, p] implies (r->p in Return.code0 or r->p in Return.code1 or r->p in Return.code2)
```

What the formula says, exactly:
```text
For every run and every plugin:

when the run calls the plugin,

then the following holds:

the run gets code 0 from the plugin, gets code 1 from the plugin or gets code 2 from the plugin.
```

## s102  (spec-a-run-exits-with-the-worst-code-of-its-plugins)

Claim (the unit's name, as a sentence): **a run exits with the worst code of its plugins**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently"

Rationale: This follows because the exit code is how a script learns what happened. A success must not hide a finding, and a finding must not hide a check that could not run.

Formula:
```alloy
all r: Run | ((some p: Plugin | r->p in Return.code2) implies r in Exits2) and (((some p: Plugin | r->p in Return.code1) and (no p: Plugin | r->p in Return.code2)) implies r in Exits1)
```

What the formula says, exactly:
```text
For every run:

all of these hold:
- when the run gets code 2 from a plugin, the run exits with code 2
- when the run gets code 1 from a plugin and gets code 2 from no plugin, the run exits with code 1
```

## s103  (spec-a-plugin-that-could-not-run-stops-the-run)

Claim (the unit's name, as a sentence): **a plugin that could not run stops the run**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a run exits with the worst code of its plugins"

Rationale: This follows because code 2 stands above every other code.

Formula:
```alloy
all r: Run | (some p: Plugin | r->p in Return.code2) implies r in Exits2
```

What the formula says, exactly:
```text
For every run:

when the run gets code 2 from a plugin, the run exits with code 2.
```

## s104  (spec-a-finding-fails-the-run)

Claim (the unit's name, as a sentence): **a finding fails the run**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a run exits with the worst code of its plugins"

Rationale: This follows because code 1 stands above success.

Formula:
```alloy
all r: Run | ((some p: Plugin | r->p in Return.code1) and (no p: Plugin | r->p in Return.code2)) implies r in Exits1
```

What the formula says, exactly:
```text
For every run:

when the run gets code 1 from a plugin and gets code 2 from no plugin, the run exits with code 1.
```

## s105  (spec-a-run-with-no-finding-succeeds)

Claim (the unit's name, as a sentence): **a run with no finding succeeds**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a run exits with the worst code of its plugins"

Rationale: This follows because a run that finds nothing wrong and could not fail to run has nothing to report.

Formula:
```alloy
all r: Run | (no p: Plugin | r->p in Return.code1 or r->p in Return.code2) implies r in Exits0
```

What the formula says, exactly:
```text
For every run:

when there is no plugin such that the run gets code 1 from the plugin or gets code 2 from the plugin, the run exits with code 0.
```

## s106  (spec-a-frontmatter-changes-nothing-but-the-plugins-of-its-document)

Claim (the unit's name, as a sentence): **a frontmatter changes nothing but the plugins of its document**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently"

Rationale: This follows because the block at the top asks for plugins and for nothing else: the document is what it was without it.

Formula:
```alloy
all d, e: Document | d->e in Bare.rel implies ((all u: Unit | (e->u in Hold.units implies d->u in Hold.units) and (d->u in Hold.units implies e->u in Hold.units)) and (e in Finding implies d in Finding) and (d in Finding implies e in Finding))
```

What the formula says, exactly:
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

## s107  (spec-a-frontmatter-leaves-the-units-of-its-document-as-they-were)

Claim (the unit's name, as a sentence): **a frontmatter leaves the units of its document as they were**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a frontmatter changes nothing but the plugins of its document"

Rationale: This follows because a comment in the block is no heading, and the text after it stays where it was.

Formula:
```alloy
all d, e: Document | d->e in Bare.rel implies (all u: Unit | (e->u in Hold.units implies d->u in Hold.units) and (d->u in Hold.units implies e->u in Hold.units))
```

What the formula says, exactly:
```text
For every document_1 and every document_2:

when document_1 is document_2 without its frontmatter,

then for every unit:

all of these hold:
- when document_2 holds the unit, document_1 holds the unit
- when document_1 holds the unit, document_2 holds the unit
```
