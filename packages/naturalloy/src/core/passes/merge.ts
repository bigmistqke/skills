/** A "for every" right inside another is one "for every" with it: for every x, for every y, is for every x and every y. */
import { everywhere } from '../pass.ts';

export const forEveryTogether = everywhere('for-every-together', 'spec-a-for-every-right-inside-a-for-every-is-one-for-every', s =>
  s.t === 'quant' && s.q === 'all' && s.body.t === 'quant' && s.body.q === 'all' ? { t: 'quant', q: 'all', vars: [...s.vars, ...s.body.vars], body: s.body.body } : undefined
);
