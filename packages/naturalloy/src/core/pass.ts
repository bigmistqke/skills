/**
 * A pass: one named change to the IR, made wherever it applies. A pass changes how a statement is said, or the shape
 * it is said in, and never what it means: the analyzer can be asked, for every statement it touches, whether the IR
 * before and after it hold in the same worlds. Each pass names the spec in naturalloy's canon that states it.
 *
 * The pipeline runs the passes in order, each over the IR the one before left. With every pass off, the printer says
 * the IR as lowered: the literal reading, `-O0`.
 */
import type { Sentence } from './ir.ts';

export interface Pass {
  /** A short name, which `WORDINGS.md`, the dumps and a switch use: `there-is-a-that`. */
  name: string;
  /** The @spec of the canon that states what the pass does. */
  spec: string;
  /** The IR with the change made wherever it applies, or the same object where it applies nowhere. */
  run(s: Sentence): Sentence;
}

/** What a run of the pipeline saw: the IR after each pass, by its name, for a dump. */
export type Trace = { pass: string; after: Sentence }[];

/** The passes in order, over the lowered IR, leaving out those `off` names; `trace`, if given, gets the IR after each. */
export function optimize(s: Sentence, passes: readonly Pass[], off: ReadonlySet<string> = new Set(), trace?: Trace): Sentence {
  let at = s;
  for (const pass of passes) {
    if (off.has(pass.name)) continue;
    at = pass.run(at);
    trace?.push({ pass: pass.name, after: at });
  }
  return at;
}

/** Each child sentence of a node, rebuilt with `f`: a pass that applies anywhere walks the IR with it, bottom up. */
export function children(s: Sentence, f: (child: Sentence) => Sentence): Sentence {
  switch (s.t) {
    case 'and':
    case 'or': {
      const items = s.items.map(f);
      return items.every((item, i) => item === s.items[i]) ? s : { ...s, items };
    }
    case 'not':
    case 'moment':
    case 'quant': {
      const body = f(s.body);
      return body === s.body ? s : { ...s, body };
    }
    case 'define': {
      const body = f(s.body);
      return body === s.body ? s : { ...s, body };
    }
    case 'rule': {
      const [when, then, otherwise] = [f(s.when), f(s.then), s.otherwise === undefined ? undefined : f(s.otherwise)];
      return when === s.when && then === s.then && otherwise === s.otherwise ? s : { ...s, when, then, ...(otherwise === undefined ? {} : { otherwise }) };
    }
    case 'iff': {
      const [l, r] = [f(s.l), f(s.r)];
      return l === s.l && r === s.r ? s : { ...s, l, r };
    }
    case 'until':
    case 'since': {
      const [a, b] = [f(s.a), f(s.b)];
      return a === s.a && b === s.b ? s : { ...s, a, b };
    }
    default:
      return s;
  }
}

/** A pass that rewrites each node where `at` gives a new one, from the leaves up. */
export function everywhere(name: string, spec: string, at: (s: Sentence) => Sentence | undefined): Pass {
  const walk = (s: Sentence): Sentence => {
    const inner = children(s, walk);
    return at(inner) ?? inner;
  };
  return { name, spec, run: walk };
}
