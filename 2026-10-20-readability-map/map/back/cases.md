## s060-h  (canon · spec-a-document-is-context-for-the-documents-that-extend-it-and-for-theirs) — ideal by Haiku; 2 of 2 strong translators differ

Original formula:
```alloy
all d: Document, e: Document, g: Document | (d->e in Extend.rel implies d->e in Context.rel) and ((d->e in Extend.rel and e->g in Context.rel) implies d->g in Context.rel)
```

Current words (lossless):
```text
For every document_1 and every document_2 and every document_3:

all of these hold:
- when document_1 extends document_2, document_2 is context for document_1
- when document_1 extends document_2 and document_3 is context for document_2, document_3 is context for document_1
```

Ideal prose:
```text
A document that extends another is context for it. Context is transitive through extension.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `(all d1, d2: Document | d1->d2 in Extend.rel implies d2->d1 in Context.rel) and (all a, b, c: Document | (a->b in Extend.rel and b->c in Extend.rel) implies c->a in Context.rel)` — doubt: Read 'is context for it' literally (the extending document is context for the one it extends), and read 'transitive through extension' as: extending through a two-step chain of extends also makes the outer document context for the far end. Direction and exact scope of the transitivity clause are my best guess.
- Opus (differs): `(all a, b: Document | a->b in Extend.rel implies b->a in Context.rel) and (all a, b, c: Document | (a->b in Extend.rel and b->c in Extend.rel) implies c->a in Context.rel)` — doubt: Read literally: the extending document is context for the one it extends (Context.rel x->y means y is context for x). One might expect the reverse direction (the extended document is context for the extender). 'Transitive through extension' read as: along a chain of extensions, the first document is context for the last.
- Haiku (malformed): `all d1: Document | (some d2: Document | d1->d2 in Extend.rel) implies d2->d1 in Context.rel and all d3: Document | (d2->d3 in Context.rel and d3->d1 in Extend.rel) implies d2->d1 in Context.rel` — doubt: Context is transitive through extension.

## s156-h  (canon-plugin-alloy · spec-the-report-of-a-scenario-names-each-unit-whose-removal-lets-it-happen) — ideal by Haiku; 2 of 2 strong translators differ

Original formula:
```alloy
all c: Scenario, u: Unit | (c in Raised and u->c in Frees.rel) implies c->u in Blame.rel
```

Current words (lossless):
```text
For every scenario and every unit:

when all of these hold:
- checker reports that the scenario cannot happen
- leaving out the unit lets the scenario happen

then checker names the unit in its report of the scenario.
```

Ideal prose:
```text
For each impossible scenario, each unit whose removal frees it is named in the scenario's report.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all s: Impossible, u: Unit | u->s in Frees.rel implies s->u in Blame.rel`
- Opus (differs): `all s: Impossible, u: Unit | u->s in Frees.rel implies s->u in Blame.rel`
- Haiku (malformed): `all s: Scenario | s in Impossible implies (all u: Unit | u->s in Frees.rel implies u in Blame.rel)` — doubt: Each unit freeing impossible scenario is named in report.

## s159-o  (canon-plugin-alloy · spec-the-report-of-a-contradiction-names-all-the-units-of-the-group) — ideal by Opus; 2 of 2 strong translators differ

Original formula:
```alloy
all u: Unit, v: Unit | (u in Contradicting and u->v in Together.rel) implies v in Named
```

Current words (lossless):
```text
For every unit_1 and every unit_2:

when all of these hold:
- unit_1 is held with units that cannot all hold
- the analyzer is asked about unit_1 together with unit_2

then checker names unit_2 in its report of a contradiction.
```

Ideal prose:
```text
When a unit is held with units that cannot all hold, checker names in its report of a contradiction every unit that the analyzer is asked about together with it.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all u: Unit | u in Contradicting implies (all v: Unit | v->u in Together.rel implies v in Named)`
- Opus (differs): `all u: Unit | u in Contradicting implies (all v: Unit | v->u in Together.rel implies v in Named)` — doubt: 'every unit that the analyzer is asked about together with it' read as 'asked about v together with u' (v->u); the other direction u->v is possible if Together is meant symmetric.
- Haiku (malformed): `all u: Unit | u in Contradicting implies (all u': Unit | u'->u in Together.rel implies u' in Named)`

## s054-s  (canon · spec-a-unit-is-declared-once) — ideal by Sonnet; 2 of 2 strong translators differ

Original formula:
```alloy
all u: Unit | (some v: Unit | u->v in Repeat.rel) implies u in Rotting
```

Current words (lossless):
```text
For every unit_1:

when unit_1 repeats a unit, checker reports a rotting for unit_1.
```

Ideal prose:
```text
When a unit repeats another, checker reports a rotting for the repeating unit.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all u: Unit | (some v: Unit | v != u and u->v in Repeat.rel) implies u in Rotting`
- Opus (differs): `all u, v: Unit | (u != v and u->v in Repeat.rel) implies u in Rotting` — doubt: 'another' read as u != v.
- Haiku (differs): `all u1, u2: Unit | u1->u2 in Repeat.rel implies (some Rotting)`

## s091-o  (canon · spec-a-refused-frontmatter-fails-the-run) — ideal by Opus; 2 of 2 strong translators differ

Original formula:
```alloy
all r: Run, d: Document, f: Refused | d->f in Head.rel implies (d in Unreadable and r in Exits2)
```

Current words (lossless):
```text
For every run and every document and every refused frontmatter:

when the document starts with the refused frontmatter,

then all of these hold:
- checker reports that the document has a frontmatter it cannot read
- the run exits with code 2
```

Ideal prose:
```text
When a document starts with a refused frontmatter, checker reports that the document has a frontmatter it cannot read, and every run exits with code 2.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all d: Document, f: Refused | d->f in Head.rel implies (d in Unreadable and (all r: Run | r in Exits2))`
- Opus (differs): `all d: Document, f: Refused | d->f in Head.rel implies (d in Unreadable and (all r: Run | r in Exits2))` — doubt: 'every run exits with code 2' read inside the when-clause.
- Haiku (differs): `all d: Document, rf: Refused | (d->rf in Head.rel) implies ((d in Unreadable) and (all r: Run | r in Exits2))`

## s212-h  (naturalloy · spec-a-rule-with-a-list-for-a-side-puts-its-then-on-a-line-of-its-own) — ideal by Haiku; 2 of 2 strong translators differ

Original formula:
```alloy
all f: Series | (f in Rule and f not in OneLineRule) implies f in ThenOwnLine
```

Current words (lossless):
```text
For every list:

when the list is a rule with a first side and a second and is not a rule whose two sides are each one clause, verbalizer says the list with "then" at the start of the second side, on a line of its own.
```

Ideal prose:
```text
A rule that is not on one line has its "then" on a line of its own.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all r: Series | (r in Rule and r not in OneLine) implies r in ThenOwnLine` — doubt: "is not on one line" is read as "not in OneLine" (the verbalizer's one-line rendering), not as the input property OneLineRule.
- Opus (differs): `all l: Series | (l in Rule and l not in OneLine) implies l in ThenOwnLine`
- Haiku (same): `all s: Series | (s in Rule and s not in OneLineRule) implies (s in ThenOwnLine)`

## s091-s  (canon · spec-a-refused-frontmatter-fails-the-run) — ideal by Sonnet; 2 of 2 strong translators differ

Original formula:
```alloy
all r: Run, d: Document, f: Refused | d->f in Head.rel implies (d in Unreadable and r in Exits2)
```

Current words (lossless):
```text
For every run and every document and every refused frontmatter:

when the document starts with the refused frontmatter,

then all of these hold:
- checker reports that the document has a frontmatter it cannot read
- the run exits with code 2
```

Ideal prose:
```text
When a document starts with a refused frontmatter, checker reports that the document has a frontmatter it cannot read, and every run exits with code 2.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all d: Document | (some f: Refused | d->f in Head.rel) implies (d in Unreadable and (all r: Run | r in Exits2))`
- Opus (differs): `all d: Document | (some f: Refused | d->f in Head.rel) implies (d in Unreadable and (all r: Run | r in Exits2))`
- Haiku (differs): `all d: Document | (some f: Refused | d->f in Head.rel) implies ((d in Unreadable) and (all r: Run | r in Exits2))`

## s138-h  (canon-plugin-alloy · spec-a-reading-apart-from-the-declaration-it-says-is-apart) — ideal by Haiku; 2 of 2 strong translators differ

Original formula:
```alloy
all u: Unit, w: Word | (u->w in Voice.rel and (some v: Unit | v->w in Introduce.rel) and u->w not in Introduce.rel) implies w in Apart
```

Current words (lossless):
```text
For every unit_1 and every word_1:

when all of these hold:
- a reading in unit_1 says word_1
- a unit declares word_1
- unit_1 does not declare word_1

then word_1 is a word whose reading is in another unit than its declaration.
```

Ideal prose:
```text
A word used in one unit but declared in another is apart.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all w: Word | (some u1: Unit, u2: Unit | u1 != u2 and u1->w in Voice.rel and u2->w in Introduce.rel) implies w in Apart` — doubt: 'used' could echo Rely.rel's wording ('a claim, a definition or a fact of {1} uses {2}'), but Apart's own reading ('whose reading is in another unit than its declaration') is defined via Voice.rel, so I took 'used in one unit' to mean 'voiced/read in that unit' and used Voice.rel.
- Opus (differs): `all w: Word | (some u, v: Unit | u != v and u->w in Rely.rel and v->w in Introduce.rel) implies w in Apart` — doubt: 'used in one unit' read as Rely (a claim, definition or fact of the unit uses it); generic 'a word' as every word. Apart's reading speaks of the reading's unit, not the using unit, so the statement may not match the author's intent.
- Haiku (differs): `all w: Word | (some u1, u2: Unit | u1 != u2 and u1->w in Rely.rel and u2->w in Introduce.rel) implies w in Apart`

## s164-s  (canon-plugin-alloy · spec-the-claims-of-an-extended-document-join-the-model) — ideal by Sonnet; 2 of 2 strong translators differ

Original formula:
```alloy
all d: Document, e: Document, u: Unit | (d in Checked and d->e in Context.rel and e->u in Hold.units and u in BareFormula) implies u in Held
```

Current words (lossless):
```text
For every document_1 and every document_2 and every unit:

when all of these hold:
- the project lists document_1 among the documents it checks
- document_2 is context for document_1
- document_2 holds the unit
- the unit holds a formula with no keyword

then the analyzer is asked to hold the formula of the unit.
```

Ideal prose:
```text
When project lists a document among those it checks, and another document that is context for it holds a unit whose formula has no keyword, the analyzer is asked to hold that unit's formula.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all d1: Document, d2: Document, u: Unit | (d1 in Checked and d2 != d1 and d1->d2 in Context.rel and d2->u in Hold.units and u in BareFormula) implies u in Held`
- Opus (differs): `all d, e: Document, u: Unit | (d in Checked and e != d and d->e in Context.rel and e->u in Hold.units and u in BareFormula) implies u in Held`
- Haiku (malformed): `all d: Document | ((d in Checked) and (some d2: Document | d->d2 in Context.rel and (some u: Unit | u in Hold.units[d2] and u in BareFormula))) implies (u in Held)`

## s094-o  (canon · spec-a-plugin-the-project-lacks-fails-the-run) — ideal by Opus; 2 of 2 strong translators differ

Original formula:
```alloy
all r: Run, f: Frontmatter, p: Missing | lists[f, p] implies (p in Unfound and r in Exits2)
```

Current words (lossless):
```text
For every run and every frontmatter and every missing plugin:

when the frontmatter lists the missing plugin,

then all of these hold:
- checker reports that the project lacks the missing plugin
- the run exits with code 2
```

Ideal prose:
```text
When any frontmatter lists a missing plugin, checker reports that the project lacks that plugin, and every run exits with code 2.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all f: Frontmatter, p: Missing | lists[f, p] implies (p in Unfound and (all r: Run | r in Exits2))` — doubt: Read "that plugin" as bound to the same (frontmatter, plugin) pair that satisfies the antecedent.
- Opus (differs): `all f: Frontmatter, p: Missing | lists[f, p] implies (p in Unfound and (all r: Run | r in Exits2))`
- Haiku (differs): `(some f: Frontmatter, p: Missing | lists[f, p]) implies ((some r: Run | r in Exits2) and (all p2: Missing | p2 in Unfound))` — doubt: Interpretation: missing plugin causes exit code 2 and is marked as unfound

## s094-s  (canon · spec-a-plugin-the-project-lacks-fails-the-run) — ideal by Sonnet; 2 of 2 strong translators differ

Original formula:
```alloy
all r: Run, f: Frontmatter, p: Missing | lists[f, p] implies (p in Unfound and r in Exits2)
```

Current words (lossless):
```text
For every run and every frontmatter and every missing plugin:

when the frontmatter lists the missing plugin,

then all of these hold:
- checker reports that the project lacks the missing plugin
- the run exits with code 2
```

Ideal prose:
```text
When a frontmatter lists a missing plugin, checker reports that the project lacks it, and every run exits with code 2.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all f: Frontmatter, p: Missing | lists[f, p] implies (p in Unfound and (all r: Run | r in Exits2))` — doubt: Read "every run exits with code 2" as holding under the same antecedent (the frontmatter listing the missing plugin), not as an unconditional law about all runs.
- Opus (differs): `all f: Frontmatter, p: Missing | lists[f, p] implies (p in Unfound and (all r: Run | r in Exits2))`
- Haiku (differs): `(some f: Frontmatter | some p: Plugin | lists[f, p] and p in Missing) => ((all f: Frontmatter | all p: Plugin | (lists[f, p] and p in Missing) => p in Unfound) and (all r: Run | r in Exits2))`

## s230-o  (canon-plugin-alloy-fixtures-lifetimes · spec-an-owner-disposes-its-sub-owners-before-its-own-cleanups) — ideal by Opus; 2 of 2 strong translators differ

Original formula:
```alloy
(always all o, k: Owner, c: Cleanup |
  (dispose[o] and k.parent = o and k not in Disposed and c in Registered - Ran and c.on = o)
  implies ((not runNow[c]) until dispose[k]))
and
(always all o, j, k: Owner |
  (dispose[o] and j.parent = o and k.parent = o and j->k in Birth.order and j not in Disposed and k not in Disposed)
  implies ((not dispose[j]) until dispose[k]))
```

Current words (lossless):
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

Ideal prose:
```text
At every moment, whenever pulse disposes an owner:
- for each owner it is the parent of that pulse has not disposed, pulse disposes that owner now or later, and before then no cleanup that code has registered on the parent and that has not run runs;
- for any two owners it is the parent of that pulse has not disposed, pulse disposes the one created later now or later, and does not dispose the one created earlier before then.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `always (all o: Owner | dispose[o] implies ((all c: Owner | (c->o in parent and c not in Disposed) implies ((no cl: Cleanup | cl->o in on and cl in Registered and cl not in Ran and runNow[cl]) until dispose[c])) and (all a, b: Owner | (a->o in parent and b->o in parent and a != b and a not in Disposed and b not in Disposed and a->b in Birth.order) implies ((not dispose[a]) until dispose[b]))))` — doubt: "The one created later/earlier" is read via Birth.order, which (being a strict order over siblings) picks out exactly one of each pair of distinct owners sharing a parent as earlier.
- Opus (differs): `always (all p: Owner | dispose[p] implies ((all c: Owner | (p in c.parent and c not in Disposed) implies ((no x: Cleanup | x in Registered and p in x.on and x not in Ran and runNow[x]) until dispose[c])) and (all a, b: Owner | (p in a.parent and p in b.parent and a not in Disposed and b not in Disposed and a->b in Birth.order) implies ((not dispose[a]) until dispose[b]))))` — doubt: 'it is the parent of' refers to the disposed owner p; 'has not disposed' is evaluated at the moment p is disposed; the cleanup conditions (registered on p, not run) are evaluated at each moment before c is disposed.
- Haiku (malformed): `always (all p: Owner | p in Disposed => (all o: Owner | (o->p in Extend.rel and o not in Disposed) => (eventually o in Disposed and (until o in Disposed, (all c: Cleanup | (c->o in Carry.rel and c not in Ran) => c not in Ran')))))` — doubt: Complex temporal formula; simplified interpretation of complex nested conditions

## s120-o  (canon-plugin-alloy · spec-a-statement-that-a-person-wrote-is-handwritten) — ideal by Opus; 2 of 2 strong translators differ

Original formula:
```alloy
all u: Unit | (u in Logical and u in Stated and u not in Generated and u not in Unsayable) implies u in Handwritten
```

Current words (lossless):
```text
For every unit:

when all of these hold:
- the unit holds a formula
- the unit has a statement
- the statement of the unit does not sit between the markers of a generated region
- the formula of the unit can be said in words

then the statement of the unit is handwritten.
```

Ideal prose:
```text
A unit's statement is handwritten when the unit holds a formula that can be said in words and its statement does not sit between the markers of a generated region.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all u: Unit | (u in Logical and u not in Unsayable and u not in Generated) implies u in Handwritten`
- Opus (differs): `all u: Unit | (u in Logical and u not in Unsayable and u not in Generated) implies u in Handwritten`
- Haiku (differs): `all u: Unit | (u in Logical and u not in Unsayable and u not in Generated) implies u in Handwritten`

## s160-o  (canon-plugin-alloy · spec-units-that-share-a-word-are-asked-about-together) — ideal by Opus; 1 of 2 strong translators differ

Original formula:
```alloy
all u: Unit, v: Unit | u->v in Share.rel implies u->v in Together.rel
```

Current words (lossless):
```text
For every unit_1 and every unit_2:

when unit_1 shares a word with unit_2, the analyzer is asked about unit_1 together with unit_2.
```

Ideal prose:
```text
When one unit shares a word with another, the analyzer is asked about the first together with the second.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (same): `all u1, u2: Unit | u1->u2 in Share.rel implies u1->u2 in Together.rel`
- Opus (differs): `all u1, u2: Unit | (u1 != u2 and u1->u2 in Share.rel) implies u1->u2 in Together.rel` — doubt: 'another' read as a distinct unit (u1 != u2); without it the formula would also cover a unit sharing a word with itself.
- Haiku (differs): `all u1, u2: Unit | ((u1->u2 in Share.rel) or (u2->u1 in Share.rel)) implies ((u1->u2 in Together.rel) or (u2->u1 in Together.rel))`

## s172-o  (canon-plugin-alloy · spec-a-signature-that-an-extended-document-names-keeps-a-formula-from-being-reported) — ideal by Opus; 1 of 2 strong translators differ

Original formula:
```alloy
all d: Document, e: Document, u: Unit, v: Unit, w: Word | (d->e in Context.rel and d->u in Hold.units and e->v in Hold.units and v->w in Utter.rel) implies u->w not in Expose.rel
```

Current words (lossless):
```text
For every document_1 and every document_2 and every unit_1 and every unit_2 and every word:

when all of these hold:
- document_2 is context for document_1
- document_1 holds unit_1
- document_2 holds unit_2
- a block of unit_2 names the word outside its declaration

then checker does not report the formula of unit_1 as lone on the word.
```

Ideal prose:
```text
If a document that is context for another document holds a unit with a block that names a word outside its declaration, checker does not report the formula of any unit of the other document as lone on that word.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (same): `all d1, d2: Document, u: Unit, w: Word | (d2->d1 in Context.rel and d1->u in Hold.units and u->w in Utter.rel) implies (no v: Unit | d2->v in Hold.units and v->w in Expose.rel)` — doubt: d1 is 'a document that is context for' d2, so (per Context.rel's reversed reading) d2->d1 in Context.rel; 'the other document' is read as d2, whose units are checked for lone-ness.
- Opus (differs): `all d1, d2: Document, u: Unit, w: Word | (d1 != d2 and d2->d1 in Context.rel and d1->u in Hold.units and u->w in Utter.rel) implies (no v: Unit | d2->v in Hold.units and v->w in Expose.rel)` — doubt: 'another document' read as distinct (d1 != d2).
- Haiku (differs): `all d1, d2: Document, u1: Unit, w: Word | ((d1->d2 in Context.rel) and (d1->u1 in Hold.units) and (u1->w in Utter.rel)) implies (all u2: Unit | (d2->u2 in Hold.units) implies (u2->w not in Expose.rel))`

## s160-s  (canon-plugin-alloy · spec-units-that-share-a-word-are-asked-about-together) — ideal by Sonnet; 1 of 2 strong translators differ

Original formula:
```alloy
all u: Unit, v: Unit | u->v in Share.rel implies u->v in Together.rel
```

Current words (lossless):
```text
For every unit_1 and every unit_2:

when unit_1 shares a word with unit_2, the analyzer is asked about unit_1 together with unit_2.
```

Ideal prose:
```text
When one unit shares a word with another, the analyzer is asked about them together.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (same): `all u, v: Unit | u->v in Share.rel implies u->v in Together.rel`
- Opus (differs): `all u, v: Unit | (u != v and u->v in Share.rel) implies u->v in Together.rel` — doubt: 'another' read as a different unit; without it the u != v guard drops.
- Haiku (same): `all u1, u2: Unit | u1->u2 in Share.rel implies u1->u2 in Together.rel`

## s161-o  (canon-plugin-alloy · spec-units-that-share-no-word-are-asked-about-apart) — ideal by Opus; 1 of 2 strong translators differ

Original formula:
```alloy
all u: Unit, v: Unit | u->v in Together.rel implies u->v in Chain.rel
```

Current words (lossless):
```text
For every unit_1 and every unit_2:

when the analyzer is asked about unit_1 together with unit_2, unit_1 is linked to unit_2 through shared words.
```

Ideal prose:
```text
When the analyzer is asked about one unit together with another, the first is linked to the second through shared words.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (same): `all u, v: Unit | u->v in Together.rel implies u->v in Chain.rel`
- Opus (differs): `all u, v: Unit | (u != v and u->v in Together.rel) implies u->v in Chain.rel` — doubt: 'another' read as a different unit; without it the u != v guard drops.
- Haiku (same): `all u1, u2: Unit | u1->u2 in Together.rel implies u1->u2 in Chain.rel`

## s108-h  (canon · spec-a-frontmatter-changes-no-finding) — ideal by Haiku; 1 of 2 strong translators differ

Original formula:
```alloy
all d, e: Document | d->e in Bare.rel implies ((e in Finding implies d in Finding) and (d in Finding implies e in Finding))
```

Current words (lossless):
```text
For every document_1 and every document_2:

when document_1 is document_2 without its frontmatter,

then all of these hold:
- when checker reports a finding for document_2, checker reports a finding for document_1
- when checker reports a finding for document_1, checker reports a finding for document_2
```

Ideal prose:
```text
When two documents differ only in frontmatter, they either both have findings or neither does.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (same): `all d1, d2: Document | (d1->d2 in Bare.rel or d2->d1 in Bare.rel) implies (d1 in Finding iff d2 in Finding)` — doubt: Bare.rel only gives one document as another with its frontmatter stripped; read 'differ only in frontmatter' as either direction of that relation holding between the two documents.
- Opus (differs): `all a, c: Document | (a != c and (some b: Document | b->a in Bare.rel and b->c in Bare.rel)) implies (a in Finding iff c in Finding)` — doubt: 'Differ only in frontmatter' read as: the same document is each of them without its frontmatter.
- Haiku (malformed): `all d1: Document | (all d2: Document | (d1->Head.rel = d2->Head.rel) implies ((some Finding | true) iff (some f: Finding | true)))` — doubt: Docs differing only in frontmatter have same finding presence.

## s113-s  (canon · scenario-1-axiom-a-check-the-project-asked-for-is-never-dropped-silently) — ideal by Sonnet; 1 of 2 strong translators differ

Original formula:
```alloy
some r: Run, p: Installed, d: Document, f: Listing | d->f in Head.rel and lists[f, p] and p->d in Over.rel and calls[r, p] and r->p in Return.code1 and r in Exits1
```

Current words (lossless):
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

Ideal prose:
```text
It must be possible for a run to call an installed plugin that checker runs over a document whose frontmatter lists that plugin, get code 1 back from it, and itself exit with code 1.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (same): `some r: Run, p: Installed, d: Document | calls[r, p] and p->d in Over.rel and applies[p, d] and r->p in Return.code1 and r in Exits1`
- Opus (differs): `some r: Run, p: Installed, d: Document, f: Frontmatter | calls[r, p] and p->d in Over.rel and d->f in Head.rel and lists[f, p] and r->p in Return.code1 and r in Exits1` — doubt: 'whose frontmatter' read as a frontmatter the document starts with
- Haiku (differs): `some r: Run, p: Installed, d: Document | calls[r, p] and p->d in Over.rel and r->p in Return.code1 and r in Exits1`

## s152-s  (canon-plugin-alloy · spec-a-trial-is-made-for-each-held-unit-of-a-scenario-that-cannot-happen) — ideal by Sonnet; 1 of 2 strong translators differ

Original formula:
```alloy
all c: Scenario, u: Unit | (c in Impossible and u in Held and (no v: Unit | c->v in Probe.rel)) implies (some s: Search | s in Trial and s->c in Pose.scenario and s->u in Leave.rel)
```

Current words (lossless):
```text
For every scenario_1 and every unit_1:

when all of these hold:
- scenario_1 is a scenario that cannot happen while every held unit holds
- the analyzer is asked to hold the formula of unit_1
- there is no unit_2 such that the author asks about leaving out unit_2 for scenario_1

then a search that leaves one unit out and leaves out unit_1 requires scenario_1 to happen.
```

Ideal prose:
```text
For every scenario and every unit: when the scenario cannot happen while every held unit holds, the analyzer is asked to hold the formula of the unit, and the author has not asked about leaving out any unit for the scenario, then some search that leaves out only this unit requires the scenario to happen.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (same): `all sc: Scenario, u: Unit | (sc in Impossible and u in Held and (no u2: Unit | sc->u2 in Probe.rel)) implies (some s: Search | s in Trial and s->u in Leave.rel and s->sc in Pose.scenario)` — doubt: 'Leaves out only this unit' is captured by s being a Trial (leaves exactly one unit out) together with s->u in Leave.rel pinning that unit to be u, rather than a separately spelled-out uniqueness clause.
- Opus (differs): `all s: Scenario, u: Unit | (s in Impossible and u in Held and (no v: Unit | s->v in Probe.rel)) implies (some x: Search | x->u in Leave.rel and (all v: Unit | x->v in Leave.rel implies v = u) and x->s in Pose.scenario)` — doubt: 'leaves out only this unit' written as: leaves out u and no other unit (not via Trial).
- Haiku (malformed): `all sc: Scenario, u: Unit | ((not (sc in Possible)) and (u in Hold.units) and (no x: Unit | sc->x in Probe.rel)) implies (some s: Search | (s in Trial) and u in Leave.rel[s] and (s in Pose.scenario and sc in Pose.scenario[s]))` — doubt: Complex temporal scenario logic; incomplete model access.

## s046-s  (canon · axiom-a-canon-cannot-go-out-of-date-unnoticed) — ideal by Sonnet; 1 of 2 strong translators differ

Original formula:
```alloy
(all c: Claim | (some Runner and unguarded[c]) implies c in Finding)
and (all g: Tag | (no u: Unit | g->u in Name.tag) implies g in Finding)
and (all t: Test | adrift[t] implies t in Finding)
and (all p: Pointer | (no x: Target | p->x in Name.pointer) implies p in Finding)
and (all u: Unit | (not used[u] and u not in Conflict) implies u in Finding)
and (all u: Unit | (some t: Trailer | t->u in Follow.rel) implies u in Finding)
and (all d: Document | ((some u: Unit | d->u in Hold.units) and (no i: Index | d->i in Hold.indexes)) implies d in Finding)
and (all d: Document | (some i: Index | d->i in Hold.indexes and i->d not in Match.rel) implies d in Finding)
and (all c: Claim | (some s: Site | c->s in Name.site and (no r: Source | r->s in Hold.symbols)) implies c in Finding)
and (all u: Unit | (some v: Unit | u->v in Repeat.rel) implies u in Finding)
```

Current words (lossless):
```text
All of these hold:
- for every claim:

  when project has a runner and the claim is unguarded, checker reports a finding for the claim
- for every tag:

  when the tag names no unit, checker reports a finding for the tag
- for every test:

  when the test is adrift, checker reports a finding for the test
- for every pointer:

  when the pointer names no target, checker reports a finding for the pointer
- for every unit_1:

  when unit_1 is not used and is not a conflict, checker reports a finding for unit_1
- for every unit_1:

  when a trailer follows unit_1, checker reports a finding for unit_1
- for every document:

  when the document holds a unit and holds no index, checker reports a finding for the document
- for every document:

  when the document holds an index that does not match the document, checker reports a finding for the document
- for every claim:

  when the claim names a site that no source holds, checker reports a finding for the claim
- for every unit_1:

  when unit_1 repeats a unit, checker reports a finding for unit_1.
```

Ideal prose:
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

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (same): `(all c: Claim | (some Runner and unguarded[c]) implies c in Finding) and (all g: Tag | (no u: Unit | g->u in Name.tag) implies g in Finding) and (all t: Test | adrift[t] implies t in Finding) and (all p: Pointer | (no x: Target | p->x in Name.pointer) implies p in Finding) and (all u: Unit | (not used[u] and u not in Conflict) implies u in Finding) and (all tr: Trailer, u: Unit | tr->u in Follow.rel implies u in Finding) and (all d: Document | ((some u: Unit | d->u in Hold.units) and (no i: Index | d->i in Hold.indexes)) implies d in Finding) and (all d: Document | (some i: Index | d->i in Hold.indexes and i->d not in Match.rel) implies d in Finding) and (all c: Claim | (some s: Site | c->s in Name.site and (no src: Source | src->s in Hold.symbols)) implies c in Finding) and (all u, v: Unit | u->v in Repeat.rel implies u in Finding)` — doubt: Ten rules joined by "and", each read with "reports a finding for X" as X in Finding.
- Opus (differs): `(all c: Claim | (some Runner and unguarded[c]) implies c in Finding) and (all g: Tag | (no u: Unit | g->u in Name.tag) implies g in Finding) and (all t: Test | adrift[t] implies t in Finding) and (all p: Pointer | (no x: Target | p->x in Name.pointer) implies p in Finding) and (all u: Unit | (not used[u] and u not in Conflict) implies u in Finding) and (all r: Trailer, u: Unit | r->u in Follow.rel implies u in Finding) and (all d: Document | ((some u: Unit | d->u in Hold.units) and (no i: Index | d->i in Hold.indexes)) implies d in Finding) and (all d: Document | (some i: Index | d->i in Hold.indexes and i->d not in Match.rel) implies d in Finding) and (all c: Claim | (some s: Site | c->s in Name.site and (no o: Source | o->s in Hold.symbols)) implies c in Finding) and (all u, v: Unit | (u != v and u->v in Repeat.rel) implies u in Finding)` — doubt: 'repeats another' read as repeating a different unit (u != v).
- Haiku (differs): `((some Runner) => (all c: Claim | unguarded[c] => c in Finding)) and (all g: Tag | (no u: Unit | g->u in Name.tag) => g in Finding) and (all t: Test | adrift[t] => t in Finding) and (all p: Pointer | (no target: Target | p->target in Name.pointer) => p in Finding) and (all u: Unit | (not used[u] and u not in Conflict) => u in Finding) and (all u: Unit | (some t: Trailer | t->u in Follow.rel) => u in Finding) and (all d: Document | ((some u: Unit | d->u in Hold.units) and (no idx: Index | d->idx in Hold.indexes)) => d in Finding) and (all d: Document | (some idx: Index | d->idx in Hold.indexes and idx->d not in Match.rel) => d in Finding) and (all c: Claim | (some s: Site | c->s in Name.site and (no src: Source | src->s in Hold.symbols)) => c in Finding) and (all u: Unit | (some u2: Unit | u != u2 and u->u2 in Repeat.rel) => u in Finding)`

## s167-o  (canon-plugin-alloy · spec-a-formula-that-is-lone-on-a-signature-is-reported) — ideal by Opus; 1 of 2 strong translators differ

Original formula:
```alloy
all u: Unit, w: Signature | (u in Logical and u not in Term and loneOn[u, w]) implies u->w in Expose.rel
```

Current words (lossless):
```text
For every unit and every signature:

when all of these hold:
- the unit holds a formula
- the unit is not a term
- the formula of the unit is lone on the signature

then checker reports the formula of the unit as lone on the signature.
```

Ideal prose:
```text
When a unit that is not a term holds a formula that is lone on a signature, the checker reports that formula as lone on that signature.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all u: Unit, s: Signature | (u not in Term and loneOn[u, s]) implies u->s in Expose.rel`
- Opus (same): `all u: Unit, w: Signature | (u not in Term and u in Logical and loneOn[u, w]) implies u->w in Expose.rel`
- Haiku (differs): `all u: Unit | all w: Word | (u not in Term and u in Logical and loneOn[u, w]) => u->w in Expose.rel`

## s060-o  (canon · spec-a-document-is-context-for-the-documents-that-extend-it-and-for-theirs) — ideal by Opus; 1 of 2 strong translators differ

Original formula:
```alloy
all d: Document, e: Document, g: Document | (d->e in Extend.rel implies d->e in Context.rel) and ((d->e in Extend.rel and e->g in Context.rel) implies d->g in Context.rel)
```

Current words (lossless):
```text
For every document_1 and every document_2 and every document_3:

all of these hold:
- when document_1 extends document_2, document_2 is context for document_1
- when document_1 extends document_2 and document_3 is context for document_2, document_3 is context for document_1
```

Ideal prose:
```text
When a document extends another, the other is context for it, and so is every document that is context for the other.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all d1, d2: Document | d1->d2 in Extend.rel implies (d2->d1 in Context.rel and (all d3: Document | d3->d2 in Context.rel implies d3->d1 in Context.rel))` — doubt: Read as an implication from extends to context (not a full recursive definition of Context.rel), since the sentence only says what holds when a document extends another.
- Opus (same): `all d, e: Document | d->e in Extend.rel implies (d->e in Context.rel and (all f: Document | e->f in Context.rel implies d->f in Context.rel))`
- Haiku (differs): `all d1, d2: Document | d1->d2 in Extend.rel implies (d2->d1 in Context.rel and all d3: Document | d3->d2 in Context.rel implies d3->d1 in Context.rel)`

## s145-o  (canon-plugin-alloy · spec-generate-writes-no-statement-for-a-unit-of-an-extended-document) — ideal by Opus; 1 of 2 strong translators differ

Original formula:
```alloy
all d: Document, e: Document, u: Unit | (d in Checked and e not in Checked and d->e in Context.rel and e->u in Hold.units) implies u not in Rewritten
```

Current words (lossless):
```text
For every document_1 and every document_2 and every unit:

when all of these hold:
- the project lists document_1 among the documents it checks
- the project does not list document_2 among the documents it checks
- document_2 is context for document_1
- document_2 holds the unit

then checker does not write the statement of the unit when it generates.
```

Ideal prose:
```text
When it generates, checker does not write the statement of a unit held by a document that the project does not list among the documents it checks, if that document is context for one the project does list.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all d: Document, d2: Document, u: Unit | (d not in Checked and d->u in Hold.units and d2 in Checked and d->d2 in Context.rel) implies u not in Rewritten` — doubt: "When it generates, checker does not write..." folded into not Rewritten, since that reading already says "when it generates" on both its positive and negative sides.
- Opus (same): `all d: Document, u: Unit | (d->u in Hold.units and d not in Checked and (some e: Checked | e->d in Context.rel)) implies u not in Rewritten`
- Haiku (differs): `all u: Unit, d1: Document | (d1->u in Hold.units and d1 not in Checked and (some d2: Document | d2 in Checked and d1->d2 in Context.rel)) => u not in Rewritten`

## s167-h  (canon-plugin-alloy · spec-a-formula-that-is-lone-on-a-signature-is-reported) — ideal by Haiku; 1 of 2 strong translators differ

Original formula:
```alloy
all u: Unit, w: Signature | (u in Logical and u not in Term and loneOn[u, w]) implies u->w in Expose.rel
```

Current words (lossless):
```text
For every unit and every signature:

when all of these hold:
- the unit holds a formula
- the unit is not a term
- the formula of the unit is lone on the signature

then checker reports the formula of the unit as lone on the signature.
```

Ideal prose:
```text
A formula that is lone on a signature and is held by a non-term unit is reported as lone on the signature.
```

Back-translations of the ideal (analyzer verdict against the original):
- Sonnet (differs): `all u: Unit, w: Signature | (u not in Term and loneOn[u, w]) implies u->w in Expose.rel`
- Opus (same): `all u: Unit, w: Signature | (loneOn[u, w] and u in Logical and u not in Term) implies u->w in Expose.rel` — doubt: 'a formula held by a non-term unit' read as the unit holds a formula (Logical) and is not a term.
- Haiku (differs): `all u: Unit, w: Word | (loneOn[u, w] and u not in Term) => u->w in Expose.rel`

