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
