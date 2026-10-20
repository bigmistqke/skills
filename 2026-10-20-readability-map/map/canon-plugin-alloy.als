abstract sig Unit extends Thing {}

sig Axiom extends Unit {}

sig Fact extends Unit {}

sig Spec extends Claim {}

sig Exception extends Claim {}

sig Bug extends Claim {}

sig Conflict extends Unit {}

sig Term extends Unit {}

pred term_statement {
}

one sig Sit { rel: Unit -> Unit }

one sig Derive { rel: Unit -> Unit }

pred cites[u, v: Unit] { u->v in Sit.rel or u->v in Derive.rel }

abstract sig Thing {}
sig Finding in Thing {}
fact finding_kinds { Finding = Freelancing + Misnesting + Untracking + Mistracking + OutdatedTracking + Unpairing + Unpinning + UnexplainedFailure + Untesting + Rotting + Uncitation + Misaiming + Overreach + Orphaning + Misanchoring + Misindexing + Mislocation + Cycle }

sig Freelancing in Finding {}

sig Misnesting in Finding {}

pred unfounded[u: Unit] {
  (u in Spec and (no a: Axiom | cites[u, a]) and (no s: Spec | cites[u, s]))
  or (u in Exception and (no s: Spec | cites[u, s]))
  or (u in Exception and (no f: Fact | cites[u, f]))
  or (u in Bug and (no s: Spec | cites[u, s]))
}

pred miscited[u: Unit] {
  (u in Axiom and (some v: Unit | cites[u, v] and v not in Axiom))
  or (u in Fact and (some v: Unit | cites[u, v]))
  or (u in Spec and (some v: Unit | cites[u, v] and v not in Axiom and v not in Spec and v not in Fact))
  or (u in Exception and (some v: Unit | cites[u, v] and v not in Spec and v not in Fact))
  or (u in Bug and (some v: Unit | cites[u, v] and v not in Spec))
  or (u in Conflict and (some v: Unit | cites[u, v]))
  or (u in Term and (some v: Unit | cites[u, v]))
}

one sig Depend { rel: Unit -> Unit }
fact depend_closure { Depend.rel = ^(Sit.rel + Derive.rel) }

pred circular[u: Unit] { some v: Unit | cites[u, v] and v->u in Depend.rel }

sig Cycle in Finding {}

sig Untracking in Finding {}

sig Mistracking in Finding {}

sig OutdatedTracking in Finding {}

sig Unpairing in Finding {}

sig Unpinning in Finding {}

sig UnexplainedFailure in Finding {}

sig Untesting in Finding {}

sig Rotting in Finding {}

sig Uncitation in Finding {}

sig Misaiming in Finding {}

sig Overreach in Finding {}

sig Orphaning in Finding {}

sig Misanchoring in Finding {}

sig Misindexing in Finding {}

sig Mislocation in Finding {}

abstract sig Claim extends Unit {}

pred refined[c: Claim] { (some s: Spec | s->c in Sit.rel) or (some e: Exception | e->c in Sit.rel) }

pred unguarded[c: Claim] { not refined[c] and not tested[c] }

pred adrift[t: Test] {
  (t in Declared and (no g: Tag | t->g in Carry.rel))
  or (t in Declared and (some u: Unit | checks[t, u] and u not in Claim))
  or (some c: Claim | checks[t, c] and refined[c])
}

abstract sig Test extends Thing {}

sig Declared in Test {}

abstract sig Pointer extends Thing {}

sig Target in Unit + Section + File {}
fact target_kinds { Target = Unit + Section + File }

sig Section {}

sig File {}

pred used[u: Unit] {
  (some v: Unit | v != u and v->u in Sit.rel)
  or (some p: Pointer | p->u in Name.pointer)
  or (some g: Tag | g->u in Name.tag)
}

sig Trailer {}

one sig Repeat { rel: Unit -> Unit }

one sig Follow { rel: Trailer -> Unit }

sig Document extends Thing {}

sig Index {}

one sig Hold { units: Document -> Unit, indexes: Document -> Index, symbols: Source -> Site }

one sig Match { rel: Index -> Document }

sig Site {}

sig Source {}

sig Tag extends Thing {}

one sig Carry { rel: Test -> Tag }

sig PlainTest extends Test {}

sig ExpectedFailure extends Test {}

pred checks[t: Test, u: Unit] { some g: Tag | t->g in Carry.rel and g->u in Name.tag }

sig Issue {}

lone sig Tracker {}
sig Known, Closed in Issue {}
fact issues_are_the_trackers { no Tracker implies no Issue }

one sig Name {
  issue: (Bug + Conflict) -> Issue,
  between: Conflict -> Unit,
  tag: Tag -> Unit,
  pointer: Pointer -> Target,
  site: Claim -> Site
}

pred tested[u: Unit] {
  (some t: Test | checks[t, u])
  or (u in Spec and (some t: Test, b: Bug | checks[t, b] and b->u in Sit.rel))
}

pred paired[c: Conflict] { some a, b: Unit | a != b and c->a in Name.between and c->b in Name.between }

pred hidden[x: Unit] {
  (x in Bug and ((some Tracker and (no i: Issue | x->i in Name.issue)) or (some i: Issue | x->i in Name.issue and i not in Known) or (some i: Issue | x->i in Name.issue and i in Closed) or (some Runner and not tested[x])))
  or (x in Conflict and ((some Tracker and (no i: Issue | x->i in Name.issue)) or (some i: Issue | x->i in Name.issue and i not in Known) or (some i: Issue | x->i in Name.issue and i in Closed) or not paired[x]))
}

pred misleading[t: Test] {
  (t in ExpectedFailure and (no b: Bug | checks[t, b]) and (no e: Exception | checks[t, e]))
  or (t in PlainTest and (some b: Bug | checks[t, b]))
}

sig Plugin {}
sig Installed, Missing, Unfound in Plugin {}
fact plugin_kinds { Plugin = Installed + Missing and no Installed & Missing }

sig Command {}
sig Core, Unknown in Command {}
one sig Add { rel: Plugin -> Command }

sig Block {}
sig Frontmatter in Block {}
sig Listing, Refused in Frontmatter {}
sig Unreadable in Document {}
one sig Head { rel: Document -> Frontmatter }
one sig Bare { rel: Document -> Document }

sig Entry {}
one sig Item { rel: Frontmatter -> Entry }
one sig Spell { rel: Entry -> Plugin }

pred lists[f: Frontmatter, p: Plugin] { some e: Entry | f->e in Item.rel and e->p in Spell.rel }

sig Misquoted, Foreign, Unclosed, Unterminated, Doubled, Dangling, Looping in Frontmatter {}

one sig Extend { rel: Document -> Document }
one sig Context { rel: Document -> Document }

sig Stray in Frontmatter {}

sig Runner {}
fact tests_are_the_runners { no Runner implies no Test }

pred applies[p: Plugin, d: Document] { some f: Listing | d->f in Head.rel and lists[f, p] }

sig Run {}
sig Exits0, Exits1, Exits2 in Run {}
fact one_code { Run = Exits0 + Exits1 + Exits2 and no Exits0 & Exits1 and no Exits0 & Exits2 and no Exits1 & Exits2 }
sig Given in Document {}
one sig Ask { rel: Run -> Command }
one sig Return { code0: Run -> Plugin, code1: Run -> Plugin, code2: Run -> Plugin }
one sig Over { rel: Plugin -> Document }

pred calls[r: Run, p: Plugin] {
  (some c: Command | r->c in Ask.rel and p->c in Add.rel)
  and (some d: Document | applies[p, d])
}

pred available[c: Command] {
  c in Core
  or (some p: Installed, d: Document | applies[p, d] and p->c in Add.rel)
}

pred term_heading {
}

pred term_extent {
}

pred term_own_text {
}

sig Fence {}
sig Languaged, VocabularyWord, BoundsWord, ScenarioWord, VocabularyBlock, BoundsBlock, ScenarioBlock, UnitBlock, NoSecondWord in Fence {}
fact one_role { no VocabularyWord & BoundsWord and no VocabularyWord & ScenarioWord and no BoundsWord & ScenarioWord and NoSecondWord = Fence - VocabularyWord - BoundsWord - ScenarioWord and no VocabularyBlock & BoundsBlock and no VocabularyBlock & ScenarioBlock and no VocabularyBlock & UnitBlock and no BoundsBlock & ScenarioBlock and no BoundsBlock & UnitBlock and no ScenarioBlock & UnitBlock }
one sig Within { rel: Fence -> Unit }
one sig Blocks { rel: Unit -> Fence }

pred axiom_every_claim_says_what_it_follows_from {
(all u: Unit | unfounded[u] implies u in Finding)
and (all u: Unit | miscited[u] implies u in Finding)
and (all u: Unit | circular[u] implies u in Finding)
}

pred spec_an_unfounded_unit_is_freelancing {
all u: Unit | unfounded[u] implies u in Freelancing
}

pred spec_a_spec_cites_an_axiom_or_a_spec {
all s: Spec | ((no a: Axiom | cites[s, a]) and (no t: Spec | cites[s, t])) implies s in Freelancing
}

pred spec_an_exception_cites_a_spec {
all e: Exception | (no s: Spec | cites[e, s]) implies e in Freelancing
}

pred spec_an_exception_cites_a_fact {
all e: Exception | (no f: Fact | cites[e, f]) implies e in Freelancing
}

pred spec_a_bug_cites_a_spec {
all b: Bug | (no s: Spec | cites[b, s]) implies b in Freelancing
}

pred spec_a_miscited_unit_is_misnested {
all u: Unit | miscited[u] implies u in Misnesting
}

pred spec_an_axiom_cites_only_axioms {
all a: Axiom | (some u: Unit | cites[a, u] and u not in Axiom) implies a in Misnesting
}

pred spec_a_fact_cites_nothing {
all f: Fact | (some u: Unit | cites[f, u]) implies f in Misnesting
}

pred spec_a_spec_cites_only_axioms_specs_and_facts {
all s: Spec | (some u: Unit | cites[s, u] and u not in Axiom and u not in Spec and u not in Fact) implies s in Misnesting
}

pred spec_an_exception_cites_only_specs_and_facts {
all e: Exception | (some u: Unit | cites[e, u] and u not in Spec and u not in Fact) implies e in Misnesting
}

pred spec_a_bug_cites_only_specs {
all b: Bug | (some u: Unit | cites[b, u] and u not in Spec) implies b in Misnesting
}

pred spec_a_conflict_cites_nothing {
all c: Conflict | (some u: Unit | cites[c, u]) implies c in Misnesting
}

pred spec_a_term_cites_nothing {
all t: Term | (some u: Unit | cites[t, u]) implies t in Misnesting
}

pred spec_a_unit_does_not_depend_on_itself {
all u: Unit | circular[u] implies u in Cycle
}

pred axiom_a_known_defect_stays_in_sight {
(all b: Bug | hidden[b] implies b in Finding)
and (all c: Conflict | hidden[c] implies c in Finding)
and (all t: Test | misleading[t] implies t in Finding)
}

pred spec_a_hidden_bug_is_reported {
all b: Bug | hidden[b] implies b in Finding
}

pred spec_a_bug_names_an_issue {
all b: Bug | (some Tracker and (no i: Issue | b->i in Name.issue)) implies b in Untracking
}

pred spec_a_bug_names_an_issue_the_tracker_knows {
all b: Bug | (some i: Issue | b->i in Name.issue and i not in Known) implies b in Mistracking
}

pred spec_a_bug_names_an_open_issue {
all b: Bug | (some i: Issue | b->i in Name.issue and i in Closed) implies b in OutdatedTracking
}

pred spec_a_bug_is_tested {
all b: Bug | (some Runner and not tested[b]) implies b in Untesting
}

pred spec_a_hidden_conflict_is_reported {
all c: Conflict | hidden[c] implies c in Finding
}

pred spec_a_conflict_names_an_issue {
all c: Conflict | (some Tracker and (no i: Issue | c->i in Name.issue)) implies c in Untracking
}

pred spec_a_conflict_names_an_issue_the_tracker_knows {
all c: Conflict | (some i: Issue | c->i in Name.issue and i not in Known) implies c in Mistracking
}

pred spec_a_conflict_names_an_open_issue {
all c: Conflict | (some i: Issue | c->i in Name.issue and i in Closed) implies c in OutdatedTracking
}

pred spec_a_conflict_names_two_units {
all c: Conflict | not paired[c] implies c in Unpairing
}

pred spec_a_misleading_test_is_reported {
all t: Test | misleading[t] implies t in Finding
}

pred spec_an_expected_failure_checks_a_bug_or_an_exception {
all x: ExpectedFailure | ((no b: Bug | checks[x, b]) and (no e: Exception | checks[x, e])) implies x in UnexplainedFailure
}

pred spec_a_plain_test_does_not_check_a_bug {
all t: PlainTest | (some b: Bug | checks[t, b]) implies t in Unpinning
}

pred axiom_a_canon_cannot_go_out_of_date_unnoticed {
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
}

pred spec_an_unguarded_claim_is_untested {
all c: Claim | (some Runner and unguarded[c]) implies c in Untesting
}

pred spec_a_tag_names_a_unit {
all g: Tag | (no u: Unit | g->u in Name.tag) implies g in Rotting
}

pred spec_an_adrift_test_is_reported {
all t: Test | adrift[t] implies t in Finding
}

pred spec_a_declared_test_carries_a_tag {
all t: Test | (t in Declared and (no g: Tag | t->g in Carry.rel)) implies t in Uncitation
}

pred spec_a_declared_test_checks_only_claims {
all t: Test | (t in Declared and (some u: Unit | checks[t, u] and u not in Claim)) implies t in Misaiming
}

pred spec_a_test_checks_only_leaves {
all t: Test | (some c: Claim | checks[t, c] and refined[c]) implies t in Overreach
}

pred spec_a_pointer_names_a_target {
all p: Pointer | (no x: Target | p->x in Name.pointer) implies p in Rotting
}

pred spec_a_unit_is_declared_once {
all u: Unit | (some v: Unit | u->v in Repeat.rel) implies u in Rotting
}

pred spec_a_unit_is_used {
all u: Unit | (not used[u] and u not in Conflict) implies u in Orphaning
}

pred spec_a_heading_ends_with_its_id {
all u: Unit | (some t: Trailer | t->u in Follow.rel) implies u in Misanchoring
}

pred spec_a_document_holds_an_index {
all d: Document | ((some u: Unit | d->u in Hold.units) and (no i: Index | d->i in Hold.indexes)) implies d in Misindexing
}

pred spec_an_index_matches_its_document {
all d: Document | (some i: Index | d->i in Hold.indexes and i->d not in Match.rel) implies d in Misindexing
}

pred spec_a_site_is_held_by_a_source {
all c: Claim | (some s: Site | c->s in Name.site and (no r: Source | r->s in Hold.symbols)) implies c in Mislocation
}

pred spec_a_document_is_context_for_the_documents_that_extend_it_and_for_theirs {
all d: Document, e: Document, g: Document | (d->e in Extend.rel implies d->e in Context.rel) and ((d->e in Extend.rel and e->g in Context.rel) implies d->g in Context.rel)
}

pred spec_a_fenced_block_with_a_language_belongs_to_the_unit_whose_own_text_holds_it {
all f: Fence, u: Unit | (f in Languaged and f->u in Within.rel) implies u->f in Blocks.rel
}

pred spec_a_fence_with_no_language_is_prose {
all f: Fence | f not in Languaged implies (no u: Unit | u->f in Blocks.rel)
}

pred spec_a_block_whose_second_word_is_vocabulary_has_the_role_of_vocabulary {
all f: Fence | f in VocabularyWord implies f in VocabularyBlock
}

pred spec_a_block_whose_second_word_is_bounds_has_the_role_of_bounds {
all f: Fence | f in BoundsWord implies f in BoundsBlock
}

pred spec_a_block_whose_second_word_is_scenario_has_the_role_of_scenario {
all f: Fence | f in ScenarioWord implies f in ScenarioBlock
}

pred spec_a_block_with_no_role_word_is_the_formula_of_its_unit {
all f: Fence | f in NoSecondWord implies f in UnitBlock
}

pred spec_a_nested_units_block_is_its_own {
all f: Fence, u: Unit | f->u in Within.rel implies (no v: Unit | v->u in Sit.rel and v->f in Blocks.rel)
}

pred spec_a_tested_claim_is_not_untested {
all c: Claim | tested[c] implies c not in Untesting
}

pred spec_a_claim_a_declared_test_checks_is_not_untested {
all c: Claim | (some t: Test | t in Declared and checks[t, c]) implies c not in Untesting
}

pred spec_a_claim_an_undeclared_test_checks_is_not_untested {
all c: Claim | (some t: Test | t not in Declared and checks[t, c]) implies c not in Untesting
}

pred spec_a_spec_whose_bug_a_test_checks_is_not_untested {
all s: Spec | (some t: Test, b: Bug | checks[t, b] and b->s in Sit.rel) implies s not in Untesting
}

pred spec_a_project_with_no_runner_reports_no_untesting {
all u: Unit | no Runner implies u not in Untesting
}

pred spec_a_project_with_no_tracker_reports_no_untracking {
all u: Unit | no Tracker implies u not in Untracking
}

pred axiom_a_check_the_project_asked_for_is_never_dropped_silently {
all r: Run | ((some f: Frontmatter, p: Missing | lists[f, p]) or (some d: Document | d in Unreadable) or (some c: Command | r->c in Ask.rel and not available[c]) or (some p: Plugin | r->p in Return.code2)) implies r in Exits2
}

pred spec_a_document_gets_the_plugins_it_asks_for {
all p: Plugin, d: Document | (applies[p, d] implies p->d in Over.rel) and ((d not in Given and p->d in Over.rel) implies applies[p, d])
}

pred spec_a_document_with_no_plugins_list_asks_for_no_plugin {
all p: Plugin, d: Document | ((no f: Listing | d->f in Head.rel) and d not in Given) implies p->d not in Over.rel
}

pred spec_a_plugin_a_document_lists_runs_over_it {
all p: Plugin, d: Document, f: Listing | (d->f in Head.rel and lists[f, p]) implies p->d in Over.rel
}

pred spec_a_plugin_a_document_does_not_list_does_not_run_over_it {
all p: Plugin, d: Document, f: Listing | (d->f in Head.rel and not lists[f, p] and d not in Given) implies p->d not in Over.rel
}

pred spec_an_empty_list_asks_for_no_plugin {
all p: Plugin, d: Document, f: Listing | (d->f in Head.rel and (no e: Entry | f->e in Item.rel) and d not in Given) implies p->d not in Over.rel
}

pred spec_a_document_named_on_the_command_line_is_checked_whatever_its_frontmatter_says {
all r: Run, p: Plugin, d: Given | calls[r, p] implies p->d in Over.rel
}

pred spec_a_frontmatter_with_no_plugins_key_holds_no_entry {
all f: Frontmatter | f not in Listing implies (no e: Entry | f->e in Item.rel)
}

pred spec_a_flawed_frontmatter_is_refused {
all f: Frontmatter | (f in Misquoted or f in Foreign or f in Unclosed or f in Unterminated or f in Doubled or f in Dangling or f in Looping or f in Stray) implies f in Refused
}

pred spec_a_misquoted_entry_is_refused {
all f: Misquoted | f in Refused
}

pred spec_a_key_the_checker_does_not_know_is_refused {
all f: Foreign | f in Refused
}

pred spec_a_list_that_is_not_closed_is_refused {
all f: Unclosed | f in Refused
}

pred spec_a_string_that_is_not_closed_is_refused {
all f: Unterminated | f in Refused
}

pred spec_a_key_written_twice_is_refused {
all f: Doubled | f in Refused
}

pred spec_a_path_that_names_no_document_is_refused {
all f: Dangling | f in Refused
}

pred spec_an_extension_that_leads_back_is_refused {
all f: Looping | f in Refused
}

pred spec_a_setting_outside_the_entry_document_is_refused {
all f: Stray | f in Refused
}

pred spec_a_refused_frontmatter_fails_the_run {
all r: Run, d: Document, f: Refused | d->f in Head.rel implies (d in Unreadable and r in Exits2)
}

pred spec_a_document_with_a_refused_frontmatter_is_reported {
all d: Document, f: Refused | d->f in Head.rel implies d in Unreadable
}

pred spec_a_report_of_an_unreadable_frontmatter_stops_the_run {
all r: Run | (some d: Document | d in Unreadable) implies r in Exits2
}

pred spec_a_plugin_the_project_lacks_fails_the_run {
all r: Run, f: Frontmatter, p: Missing | lists[f, p] implies (p in Unfound and r in Exits2)
}

pred spec_a_missing_plugin_is_reported {
all f: Frontmatter, p: Missing | lists[f, p] implies p in Unfound
}

pred spec_a_missing_plugin_stops_the_run {
all r: Run, f: Frontmatter, p: Missing | lists[f, p] implies r in Exits2
}

pred spec_an_unknown_command_fails_the_run {
all r: Run, c: Command | (r->c in Ask.rel and not available[c]) implies (c in Unknown and r in Exits2)
}

pred spec_a_command_that_is_not_available_is_reported_as_unknown {
all r: Run, c: Command | (r->c in Ask.rel and not available[c]) implies c in Unknown
}

pred spec_a_command_that_is_not_available_stops_the_run {
all r: Run, c: Command | (r->c in Ask.rel and not available[c]) implies r in Exits2
}

pred spec_an_available_command_is_not_reported_as_unknown {
all c: Command | available[c] implies c not in Unknown
}

pred spec_every_plugin_a_run_calls_runs {
all r: Run, p: Plugin | calls[r, p] implies (r->p in Return.code0 or r->p in Return.code1 or r->p in Return.code2)
}

pred spec_a_run_exits_with_the_worst_code_of_its_plugins {
all r: Run | ((some p: Plugin | r->p in Return.code2) implies r in Exits2) and (((some p: Plugin | r->p in Return.code1) and (no p: Plugin | r->p in Return.code2)) implies r in Exits1)
}

pred spec_a_plugin_that_could_not_run_stops_the_run {
all r: Run | (some p: Plugin | r->p in Return.code2) implies r in Exits2
}

pred spec_a_finding_fails_the_run {
all r: Run | ((some p: Plugin | r->p in Return.code1) and (no p: Plugin | r->p in Return.code2)) implies r in Exits1
}

pred spec_a_run_with_no_finding_succeeds {
all r: Run | (no p: Plugin | r->p in Return.code1 or r->p in Return.code2) implies r in Exits0
}

pred spec_a_frontmatter_changes_nothing_but_the_plugins_of_its_document {
all d, e: Document | d->e in Bare.rel implies ((all u: Unit | (e->u in Hold.units implies d->u in Hold.units) and (d->u in Hold.units implies e->u in Hold.units)) and (e in Finding implies d in Finding) and (d in Finding implies e in Finding))
}

pred spec_a_frontmatter_leaves_the_units_of_its_document_as_they_were {
all d, e: Document | d->e in Bare.rel implies (all u: Unit | (e->u in Hold.units implies d->u in Hold.units) and (d->u in Hold.units implies e->u in Hold.units))
}

pred spec_a_frontmatter_changes_no_finding {
all d, e: Document | d->e in Bare.rel implies ((e in Finding implies d in Finding) and (d in Finding implies e in Finding))
}

pred term_formula {
}

pred term_quantified_formula {
}

sig Quantifier {}
sig VariableOnce, AsNounPhrase, VariableSubject, AsSubjectPhrase, VariableWithCondition, RelativeClause in Quantifier {}
sig OneNegation, SaysAnother, NestsPhrases in Quantifier {}
sig VariableTwice, NothingToAttach, NoWithAnother, ConditionAside, TimedCondition, InFull in Quantifier {}
fact quantifier_wordings { no AsNounPhrase & InFull and AsSubjectPhrase + RelativeClause + OneNegation + SaysAnother + NestsPhrases in AsNounPhrase and no VariableOnce & VariableTwice }

pred fits[f: Quantifier] { f not in VariableTwice and f not in NothingToAttach and f not in NoWithAnother and f not in ConditionAside and f not in TimedCondition }

pred term_predicate_call {
}

sig Definition {}
sig GuardedByKind, PhrasePerKind, SameKindTwice, JoinedWithOr, OrInsideKind, OneCoordination in Definition {}
sig OneKind, OneSentenceKind, NoKindFirst, AmbiguousAnd, NotAboutSubject, AsItStands in Definition {}
fact case_wordings { no PhrasePerKind & AsItStands and JoinedWithOr + OneCoordination + OneSentenceKind in PhrasePerKind and no GuardedByKind & NoKindFirst }

pred byKind[d: Definition] { d not in NoKindFirst and d not in AmbiguousAnd and d not in NotAboutSubject }

pred term_linked_formula {
}

sig Series {}
sig Items, Rule, Few, Many, MoreThanTwo, NotClause, CommaItem, TooLong, AndInOr, TimeBeforeLast, RelativeBeforeLast in Series {}
sig AsSentence, AsBullets, KeepsAndApart, SharedSubject, PairInList in Series {}
sig OneLineRule, TimeFirst, TimeSecond, OneLine, KeepsThen, DropsThen, ThenOwnLine in Series {}
fact series_wordings { no Items & Rule and Items = Few + Many and no Few & Many and Many in MoreThanTwo and AndInOr in NotClause and no AsSentence & AsBullets and KeepsAndApart in AsBullets and (Few + Many + NotClause + CommaItem + TooLong + TimeBeforeLast + RelativeBeforeLast + SharedSubject + PairInList) in Items and (OneLineRule + TimeFirst + TimeSecond) in Rule and no KeepsThen & DropsThen and no OneLine & ThenOwnLine and (KeepsThen + DropsThen) in OneLine and ThenOwnLine in Rule }

pred sentenceable[f: Series] { f in Few and f not in NotClause and (f not in CommaItem or f not in MoreThanTwo) and f not in TooLong and f not in TimeBeforeLast and f not in RelativeBeforeLast }

pred term_line {
}

pred spec_a_rule_of_two_clauses_is_said_on_one_line {
all f: Series | (f in OneLineRule and f not in TimeFirst) implies f in OneLine
}

pred spec_a_definition_by_cases_is_said_as_a_noun_phrase_for_each_kind {
all f: Definition | (f in GuardedByKind and byKind[f]) implies f in PhrasePerKind
}

pred spec_the_alternatives_of_one_kind_are_put_together_with_or {
all f: Definition | (f in SameKindTwice and byKind[f]) implies f in JoinedWithOr
}

pred spec_the_options_of_an_or_inside_a_kind_are_one_coordination {
all f: Definition | (f in OrInsideKind and byKind[f]) implies f in OneCoordination
}

pred spec_a_definition_with_one_kind_is_one_sentence {
all f: Definition | (f in OneKind and byKind[f]) implies f in OneSentenceKind
}

pred spec_a_definition_by_cases_is_said_as_it_stands_when_an_alternative_does_not_begin_with_its_kind {
all f: Definition | f in NoKindFirst implies f in AsItStands
}

pred spec_a_definition_by_cases_is_said_as_it_stands_when_a_run_of_and_would_read_two_ways {
all f: Definition | f in AmbiguousAnd implies f in AsItStands
}

pred spec_a_definition_by_cases_is_said_as_it_stands_when_an_alternative_is_not_about_its_subject {
all f: Definition | f in NotAboutSubject implies f in AsItStands
}

pred spec_a_variable_said_once_takes_the_place_of_its_quantifier_as_a_noun_phrase {
all f: Quantifier | (f in VariableOnce and fits[f]) implies f in AsNounPhrase
}

pred spec_a_noun_phrase_can_be_the_subject_of_a_sentence {
all f: Quantifier | (f in VariableSubject and fits[f]) implies f in AsSubjectPhrase
}

pred spec_what_else_is_true_of_the_variable_is_a_relative_clause {
all f: Quantifier | (f in VariableWithCondition and fits[f]) implies f in RelativeClause
}

pred spec_a_quantifier_whose_variable_would_be_said_twice_is_said_in_full {
all f: Quantifier | f in VariableTwice implies f in InFull
}

pred spec_a_quantifier_with_nothing_to_attach_to_is_said_in_full {
all f: Quantifier | f in NothingToAttach implies f in InFull
}

pred spec_no_with_another_is_said_in_full {
all f: Quantifier | f in NoWithAnother implies f in InFull
}

pred spec_a_quantifier_with_a_time_phrase_in_one_of_several_conditions_is_said_in_full {
all f: Quantifier | f in TimedCondition implies f in InFull
}

pred spec_a_condition_that_is_not_about_the_variable_is_said_in_full {
all f: Quantifier | f in ConditionAside implies f in InFull
}

pred spec_three_clauses_or_fewer_are_said_in_a_sentence {
all f: Series | sentenceable[f] implies f in AsSentence
}

pred spec_a_longer_list_or_a_list_with_a_comma_is_bullets {
all f: Series | (f in Items and not sentenceable[f]) implies f in AsBullets
}

pred spec_a_list_of_more_than_three_clauses_is_bullets {
all f: Series | f in Many implies f in AsBullets
}

pred spec_a_list_with_a_comma_in_an_item_and_more_than_two_clauses_is_bullets {
all f: Series | (f in CommaItem and f in MoreThanTwo) implies f in AsBullets
}

pred spec_a_list_too_long_for_a_line_is_bullets {
all f: Series | f in TooLong implies f in AsBullets
}

pred spec_a_list_with_a_time_phrase_before_its_last_clause_is_bullets {
all f: Series | f in TimeBeforeLast implies f in AsBullets
}

pred spec_a_list_with_a_relative_clause_before_its_last_clause_is_bullets {
all f: Series | f in RelativeBeforeLast implies f in AsBullets
}

pred spec_an_item_that_is_more_than_a_clause_makes_the_list_bullets {
all f: Series | f in NotClause implies f in AsBullets
}

pred spec_an_and_inside_an_or_is_kept_apart {
all f: Series | f in AndInOr implies f in KeepsAndApart
}

pred spec_a_rule_keeps_its_then_before_a_time_phrase {
all f: Series | (f in OneLineRule and f not in TimeFirst and f in TimeSecond) implies f in KeepsThen
}

pred spec_a_rule_drops_its_then_before_anything_else {
all f: Series | (f in OneLineRule and f not in TimeFirst and f not in TimeSecond) implies f in DropsThen
}

pred spec_a_rule_whose_first_side_begins_with_a_time_phrase_puts_its_then_on_a_line_of_its_own {
all f: Series | f in TimeFirst implies f in ThenOwnLine
}

pred spec_a_rule_with_a_list_for_a_side_puts_its_then_on_a_line_of_its_own {
all f: Series | (f in Rule and f not in OneLineRule) implies f in ThenOwnLine
}

one sig GenerateCommand, CheckCommand, LogicCommand in Command {}

sig Logical, Generated, Differs, Unsayable, Wordless, Twofold, Faulted, Current, Stale, Unwritten, Handwritten, Reported, Rewritten, Explained in Unit {}
sig Worded in Document {}
sig Stated in Unit {}

sig Word {}
sig Signature, Field, Predicate, Undeclared, Misplaced, Apart, Unused, Flagged in Word {}
fact word_kinds { Word = Signature + Field + Predicate }
one sig Introduce { rel: Unit -> Word }
one sig Voice { rel: Unit -> Word }
one sig Rely { rel: Unit -> Word }

sig Scenario {}
sig Possible, Impossible, Raised in Scenario {}
fact possible { Possible = Scenario - Impossible }
one sig Probe { rel: Scenario -> Unit }
one sig Frees { rel: Unit -> Scenario }
one sig Blame { rel: Scenario -> Unit }

sig Search {}
sig Trial, First, Afterwards in Search {}
fact order { Search = First + Afterwards and no First & Afterwards }
sig BareFormula, Held, Contradicting, Named in Unit {}
one sig Pose { units: Search -> Unit, scenario: Search -> Scenario }
one sig Leave { rel: Search -> Unit }
sig Checked in Document {}

one sig Share { rel: Unit -> Unit }
one sig Chain { rel: Unit -> Unit }
one sig Together { rel: Unit -> Unit }
fact linked { Chain.rel = ^(Share.rel + ~(Share.rel)) }

one sig Utter { rel: Unit -> Word }
one sig Picture { rel: Unit -> Word }
one sig Expose { rel: Unit -> Word }
sig Unchallenged in Unit {}
pred loneOn[u: Unit, w: Word] { u->w in Rely.rel and (no v: Unit | v != u and v->w in Utter.rel) and (no v: Unit | v->w in Picture.rel) }

pred axiom_a_statement_says_what_its_logic_says {
all d: Document, u: Unit | (d in Worded and d->u in Hold.units and u in Logical and u not in Current) implies u in Reported
}

pred spec_a_document_that_keeps_no_readings_is_left_as_it_is {
all d: Document, u: Unit | (d->u in Hold.units and d not in Worded) implies (u not in Rewritten and u not in Reported)
}

pred spec_a_unit_with_a_formula_and_no_statement_is_unwritten {
all u: Unit | (u in Logical and u not in Stated and u not in Unsayable) implies u in Unwritten
}

pred spec_a_generated_statement_that_differs_from_its_formula_is_stale {
all u: Unit | (u in Logical and u in Generated and u in Differs and u not in Unsayable) implies u in Stale
}

pred spec_a_generated_statement_that_its_formula_would_say_again_is_current {
all u: Unit | (u in Generated and u not in Differs and u not in Unsayable) implies u in Current
}

pred spec_a_statement_that_a_person_wrote_is_handwritten {
all u: Unit | (u in Logical and u in Stated and u not in Generated and u not in Unsayable) implies u in Handwritten
}

pred spec_a_formula_that_the_readings_cannot_say_is_unsayable {
all u: Unit | (u in Wordless or u in Twofold) implies u in Unsayable
}

pred spec_a_formula_with_a_word_that_has_no_reading_is_unsayable {
all u: Unit | u in Wordless implies u in Unsayable
}

pred spec_a_unit_with_two_formulas_is_unsayable {
all u: Unit | u in Twofold implies u in Unsayable
}

pred spec_the_report_of_an_unsayable_formula_says_why {
all u: Unit | u in Unsayable implies u in Explained
}

pred spec_a_fault_of_the_verbalizer_fails_the_run_and_is_not_explained_as_unsayable {
all r: Run, c: Command, u: Unit | (r->c in Ask.rel and (c in GenerateCommand or c in CheckCommand) and u in Faulted) implies (u not in Explained and r not in Exits0)
}

pred spec_generate_writes_what_is_not_current_and_nothing_else {
all u: Unit | (u in Rewritten implies (u in Unwritten or u in Stale)) and ((u in Unwritten or u in Stale) implies u in Rewritten)
}

pred spec_generate_writes_the_statement_of_a_stale_unit_again {
all u: Unit | u in Stale implies u in Rewritten
}

pred spec_generate_leaves_a_current_statement_as_it_is {
all u: Unit | u in Current implies u not in Rewritten
}

pred spec_generate_never_overwrites_a_handwritten_statement {
all u: Unit | u in Handwritten implies u not in Rewritten
}

pred spec_generate_leaves_an_unsayable_unit_as_it_is {
all u: Unit | u in Unsayable implies u not in Rewritten
}

pred spec_check_reports_a_statement_that_is_not_current {
all d: Document, u: Unit | (d in Worded and d->u in Hold.units and u in Logical and u not in Current) implies u in Reported
}

pred spec_check_does_not_report_a_current_statement {
all u: Unit | u in Current implies u not in Reported
}

pred spec_a_report_of_a_statement_fails_check {
all r: Run, c: CheckCommand, u: Unit | (r->c in Ask.rel and u in Reported) implies r not in Exits0
}

pred spec_generate_fails_on_a_handwritten_statement_and_says_so {
all r: Run, c: GenerateCommand, u: Unit | (r->c in Ask.rel and u in Handwritten) implies (u in Reported and r not in Exits0)
}

pred spec_generate_fails_on_an_unsayable_formula_and_says_why {
all r: Run, c: GenerateCommand, u: Unit | (r->c in Ask.rel and u in Unsayable) implies (u in Explained and r not in Exits0)
}

pred spec_a_word_that_a_reading_says_and_nothing_declares_is_undeclared {
all w: Word | ((some u: Unit | u->w in Voice.rel) and (no u: Unit | u->w in Introduce.rel)) implies w in Undeclared
}

pred spec_a_word_declared_outside_a_term_is_misplaced {
all u: Unit, w: Word | (u->w in Introduce.rel and u not in Term) implies w in Misplaced
}

pred spec_a_reading_apart_from_the_declaration_it_says_is_apart {
all u: Unit, w: Word | (u->w in Voice.rel and (some v: Unit | v->w in Introduce.rel) and u->w not in Introduce.rel) implies w in Apart
}

pred spec_a_declared_word_that_no_claim_uses_is_unused {
all w: Word | ((some u: Unit | u->w in Introduce.rel) and (no u: Unit | u->w in Rely.rel)) implies w in Unused
}

pred spec_a_word_declared_in_a_term_said_beside_it_and_used_is_not_reported {
all u: Term, w: Word | (u->w in Introduce.rel and u->w in Voice.rel and (some v: Unit | v->w in Rely.rel)) implies (w not in Undeclared and w not in Misplaced and w not in Apart and w not in Unused and w not in Flagged)
}

pred spec_a_document_that_keeps_no_readings_has_no_word_reported {
all d: Document, u: Unit, w: Word | (d not in Worded and d->u in Hold.units and u->w in Introduce.rel) implies (w not in Undeclared and w not in Misplaced and w not in Apart and w not in Unused and w not in Flagged)
}

pred spec_a_flagged_word_fails_check {
all r: Run, c: CheckCommand, w: Word | (r->c in Ask.rel and w in Flagged) implies r not in Exits0
}

pred spec_check_reports_nothing_about_a_word_that_is_in_order {
all w: Word | (w not in Undeclared and w not in Misplaced and w not in Apart and w not in Unused) implies w not in Flagged
}

pred spec_check_reports_a_word_that_is_not_in_order {
all w: Word | (w in Undeclared or w in Misplaced or w in Apart or w in Unused) implies w in Flagged
}

pred spec_generate_writes_no_statement_for_a_unit_of_an_extended_document {
all d: Document, e: Document, u: Unit | (d in Checked and e not in Checked and d->e in Context.rel and e->u in Hold.units) implies u not in Rewritten
}

pred spec_a_word_declared_in_an_extended_document_is_declared {
all d: Document, e: Document, u: Unit, v: Unit, w: Word | (d->e in Context.rel and d->u in Hold.units and u->w in Voice.rel and e->v in Hold.units and v->w in Introduce.rel) implies w not in Undeclared
}

pred axiom_the_claims_of_a_canon_never_contradict_each_other {
(all u: Unit | u in Contradicting implies u in Named) and (all c: Scenario | c in Impossible implies c in Raised)
}

pred spec_a_formula_with_no_keyword_is_a_claim_to_hold {
all u: Unit | u in BareFormula implies u in Held
}

pred spec_the_first_searches_leave_no_unit_out {
all s: Search | s in First implies s not in Trial
}

pred spec_a_trial_is_made_only_for_a_scenario_that_cannot_happen {
all s: Search, c: Scenario | (s in Trial and s->c in Pose.scenario) implies (c in Impossible and s in Afterwards)
}

pred spec_a_trial_leaves_out_one_held_unit_and_keeps_the_rest {
all s: Search, c: Scenario, u: Unit | (s in Trial and s->c in Pose.scenario and s->u in Leave.rel) implies (u in Held and s->u not in Pose.units and (all v: Unit | (v in Held and v != u) implies s->v in Pose.units))
}

pred spec_a_trial_is_made_for_each_held_unit_of_a_scenario_that_cannot_happen {
all c: Scenario, u: Unit | (c in Impossible and u in Held and (no v: Unit | c->v in Probe.rel)) implies (some s: Search | s in Trial and s->c in Pose.scenario and s->u in Leave.rel)
}

pred spec_a_trial_leaves_out_only_the_units_the_author_asks_about {
all s: Search, c: Scenario, u: Unit | (s in Trial and s->c in Pose.scenario and s->u in Leave.rel and (some v: Unit | c->v in Probe.rel)) implies c->u in Probe.rel
}

pred spec_a_scenario_that_cannot_happen_while_every_unit_holds_is_reported {
all c: Scenario | c in Impossible implies c in Raised
}

pred spec_a_scenario_that_can_happen_is_not_reported {
all c: Scenario | c in Possible implies c not in Raised
}

pred spec_the_report_of_a_scenario_names_each_unit_whose_removal_lets_it_happen {
all c: Scenario, u: Unit | (c in Raised and u->c in Frees.rel) implies c->u in Blame.rel
}

pred spec_the_report_of_a_scenario_names_no_other_unit {
all c: Scenario, u: Unit | c->u in Blame.rel implies u->c in Frees.rel
}

pred spec_units_that_cannot_all_hold_are_named {
all u: Unit | u in Contradicting implies u in Named
}

pred spec_the_report_of_a_contradiction_names_all_the_units_of_the_group {
all u: Unit, v: Unit | (u in Contradicting and u->v in Together.rel) implies v in Named
}

pred spec_units_that_share_a_word_are_asked_about_together {
all u: Unit, v: Unit | u->v in Share.rel implies u->v in Together.rel
}

pred spec_units_that_share_no_word_are_asked_about_apart {
all u: Unit, v: Unit | u->v in Together.rel implies u->v in Chain.rel
}

pred spec_logic_succeeds_when_nothing_is_reported {
all r: Run, c: LogicCommand | (r->c in Ask.rel and (no x: Scenario | x in Raised) and (no u: Unit | u in Contradicting)) implies r in Exits0
}

pred spec_a_reported_scenario_or_contradiction_fails_logic {
all r: Run, c: LogicCommand | (r->c in Ask.rel and ((some x: Scenario | x in Raised) or (some u: Unit | u in Contradicting))) implies r not in Exits0
}

pred spec_the_claims_of_an_extended_document_join_the_model {
all d: Document, e: Document, u: Unit | (d in Checked and d->e in Context.rel and e->u in Hold.units and u in BareFormula) implies u in Held
}

pred axiom_a_formula_can_be_held_against_the_other_formulas {
(all u: Unit | (u in Logical and u not in Term and u in Unchallenged) implies (some w: Signature | u->w in Expose.rel)) and (all u: Unit, w: Word | u->w in Expose.rel implies u in Unchallenged)
}

pred spec_a_formula_that_no_other_formula_can_contradict_is_reported {
all u: Unit | (u in Logical and u not in Term and u in Unchallenged) implies (some w: Signature | u->w in Expose.rel)
}

pred spec_a_formula_that_is_lone_on_a_signature_is_reported {
all u: Unit, w: Signature | (u in Logical and u not in Term and loneOn[u, w]) implies u->w in Expose.rel
}

pred spec_a_formula_is_reported_only_when_no_other_formula_can_contradict_it {
all u: Unit, w: Word | u->w in Expose.rel implies u in Unchallenged
}

pred spec_a_formula_is_reported_only_on_a_signature_it_is_lone_on {
all u: Unit, w: Word | u->w in Expose.rel implies (u in Logical and u not in Term and w in Signature and loneOn[u, w])
}

pred spec_a_signature_that_another_unit_names_keeps_a_formula_from_being_reported {
all u: Unit, v: Unit, w: Word | (v != u and v->w in Utter.rel) implies u->w not in Expose.rel
}

pred spec_a_signature_that_a_scenario_names_keeps_a_formula_from_being_reported {
all u: Unit, v: Unit, w: Word | v->w in Picture.rel implies u->w not in Expose.rel
}

pred spec_a_signature_that_an_extended_document_names_keeps_a_formula_from_being_reported {
all d: Document, e: Document, u: Unit, v: Unit, w: Word | (d->e in Context.rel and d->u in Hold.units and e->v in Hold.units and v->w in Utter.rel) implies u->w not in Expose.rel
}

pred spec_a_formula_is_not_reported_on_a_field_or_a_predicate {
all u: Unit, w: Word | w not in Signature implies u->w not in Expose.rel
}

pred spec_a_term_is_not_reported_as_lone {
all u: Term, w: Word | u->w not in Expose.rel
}

pred spec_a_document_that_keeps_no_readings_has_no_formula_reported_as_lone {
all d: Document, u: Unit, w: Word | (d not in Worded and d->u in Hold.units) implies u->w not in Expose.rel
}

pred spec_a_lone_formula_fails_check {
all r: Run, c: CheckCommand, u: Unit, w: Word | (r->c in Ask.rel and u->w in Expose.rel) implies r not in Exits0
}

pred scenario_1_term_checker {
some a: Axiom, s: Spec, t: Test, g: Tag, d: Document, i: Index | s->a in Sit.rel and t in Declared and t->g in Carry.rel and g->s in Name.tag and d->a in Hold.units and d->s in Hold.units and d->i in Hold.indexes and i->d in Match.rel and (all f: Thing | f not in Finding)
}

pred scenario_2_term_checker {
some b: Bug, x: ExpectedFailure, i: Issue | b->i in Name.issue and i in Known and i not in Closed and checks[x, b] and b not in Finding and x not in Finding
}

pred scenario_3_term_checker {
some c: Conflict, i: Issue, u, v: Unit | u != v and c->i in Name.issue and i in Known and i not in Closed and c->u in Name.between and c->v in Name.between and c not in Finding
}

pred scenario_1_spec_a_document_is_context_for_the_documents_that_extend_it_and_for_theirs {
some d, e, g: Document | d != g and d->e in Extend.rel and e->g in Extend.rel and d->g in Context.rel
}

pred scenario_1_axiom_a_check_the_project_asked_for_is_never_dropped_silently {
some r: Run, p: Installed, d: Document, f: Listing | d->f in Head.rel and lists[f, p] and p->d in Over.rel and calls[r, p] and r->p in Return.code1 and r in Exits1
}

pred scenario_2_axiom_a_check_the_project_asked_for_is_never_dropped_silently {
some r: Run, d: Document, f: Refused | d->f in Head.rel and d in Unreadable and r in Exits2
}

pred scenario_1_term_quantifier {
some f: Quantifier | f in VariableOnce and f in NoWithAnother
}

pred scenario_2_term_quantifier {
some f: Quantifier | f in VariableSubject and f in VariableTwice
}

pred scenario_3_term_quantifier {
some f: Quantifier | f in VariableOnce and f in ConditionAside
}

pred scenario_4_term_quantifier {
some f: Quantifier | f in VariableWithCondition and f in NothingToAttach
}

pred scenario_1_term_definition_passage {
some f: Definition | f in SameKindTwice and f in AmbiguousAnd
}

pred scenario_2_term_definition_passage {
some f: Definition | f in OneKind and f in NotAboutSubject
}

pred scenario_3_term_definition_passage {
some f: Definition | f in OrInsideKind and f in NoKindFirst
}

pred scenario_1_term_series {
some f: Series | f in Few and f in CommaItem and f in MoreThanTwo
}

pred scenario_2_term_series {
some f: Series | f in Few and f in TooLong
}

pred scenario_3_term_series {
some f: Series | f in SharedSubject and f in Many
}

pred scenario_4_term_series {
some f: Series | f in PairInList and f in NotClause
}

pred scenario_5_term_series {
some f: Series | f in TimeSecond and f not in OneLineRule
}

pred scenario_6_term_series {
some f: Series | f in OneLineRule and f in TimeFirst
}

pred scenario_1_axiom_a_statement_says_what_its_logic_says {
some u: Unit, d: Document | d in Worded and d->u in Hold.units and u in Logical and u in Current and u not in Reported
}

pred scenario_1_spec_a_fault_of_the_verbalizer_fails_the_run_and_is_not_explained_as_unsayable {
some u: Unit | u in Faulted
}

pred scenario_1_axiom_the_claims_of_a_canon_never_contradict_each_other {
some c: Scenario, u: Unit | c in Impossible and c in Raised and u->c in Frees.rel and c->u in Blame.rel
}

pred scenario_1_axiom_a_formula_can_be_held_against_the_other_formulas {
some u: Unit, w: Signature | u in Logical and u->w in Rely.rel and u->w not in Expose.rel
}
