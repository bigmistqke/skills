/** The passes, in the order they run. */
import type { Pass } from '../pass.ts';
import { forEveryTogether } from './merge.ts';
import { negationInward } from './negate.ts';

export const PASSES: readonly Pass[] = [negationInward, forEveryTogether, { name: 'lone-numbers-dropped', spec: 'spec-a-variable-alone-of-its-noun-is-named-the-noun', print: { dropLoneNumbers: true } }];
