# @bigmistqke/parse-alloy

A parser for Alloy 6 in TypeScript: Alloy as a string in, a typed syntax tree out, grouped exactly as the [Alloy analyzer](https://github.com/AlloyTools/org.alloytools.alloy) groups it. It refuses, with the place and the reason, anything it cannot read that way. No dependencies, synchronous, no Node APIs.

```bash
pnpm add @bigmistqke/parse-alloy
```

```ts
import { parseFormula } from '@bigmistqke/parse-alloy';

parseFormula('all c: Cleanup | c in Ran implies eventually c in Done');
// { t: 'quant', q: 'all', decls: [{ names: ['c'], type: { t: 'name', name: 'Cleanup' } }],
//   body: { t: 'implies', l: { t: 'cmp', op: 'in', … }, r: { t: 'unary', op: 'eventually', … } } }
```

It follows the syntax of the Alloy analyzer 6.2.0 (`794226d`): `Alloy.cup`, `Alloy.lex` and `CompFilter.java`. It reads part of that syntax today; [issue #34](https://github.com/bigmistqke/skills/issues/34) is the plan for the rest. [naturalloy](../naturalloy) builds on it to say formulas in English.

parse-alloy has its own [canon](CANON.md): the claims of how it reads Alloy, each with a test that cites it.
