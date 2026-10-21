/** The passes, in the order they run. */
import type { Pass } from '../pass.ts';
import { clausesInASentence, exactlyWhen, ruleOnOneLine, timePhraseInFront } from './layout.ts';
import { forEveryTogether } from './merge.ts';
import { negationInward } from './negate.ts';
import { nounPhrases } from './phrases.ts';

export const PASSES: readonly Pass[] = [
  negationInward,
  forEveryTogether,
  nounPhrases,
  timePhraseInFront,
  clausesInASentence,
  exactlyWhen,
  ruleOnOneLine,
  { name: 'lone-numbers-dropped', spec: 'spec-a-variable-alone-of-its-noun-is-named-the-noun', print: { dropLoneNumbers: true } }];
