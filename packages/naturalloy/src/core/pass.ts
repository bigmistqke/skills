/**
 * A pass: one named change to how a statement is said, made wherever it applies. A pass of the IR changes the IR and
 * never what it means: for every statement it touches, the analyzer can be asked whether the IR before and after it
 * hold in the same worlds. A pass of the printer sets an option of the printer, which changes words and never the IR.
 * Each pass names the spec in naturalloy's canon that states it.
 *
 * The pipeline runs the passes in order, each over the IR the one before left. With every pass off, the printer says
 * the IR as lowered: the literal reading, `-O0`.
 */
import type { Readings } from '../readings.ts';
import type { Sentence } from './ir.ts';

/** What the printer can be asked to do beyond laying out the IR. */
export interface PrintOptions {
  /** Leave the number off a variable that is the only one of its noun, where the noun says nothing else: "the unit". */
  dropLoneNumbers: boolean;
}

/** What a pass of the IR may consult. */
export interface Context {
  readings: Readings;
  /** The words of a part of the IR, as the printer would lay it out with the passes so far, for a pass that weighs its length. */
  words(s: Sentence): string | undefined;
}

export type Pass =
  | {
      /** A short name, which `WORDINGS.md`, the dumps and a switch use: `there-is-a-that`. */
      name: string;
      /** The @spec of the canon that states what the pass does. */
      spec: string;
      /** The IR with the change made wherever it applies, or the same object where it applies nowhere. */
      run(s: Sentence, context: Context): Sentence;
    }
  | { name: string; spec: string; print: Partial<PrintOptions> };

/** What a run of the pipeline saw: the IR after each pass of the IR, by its name. */
export type Trace = { pass: string; after: Sentence }[];

/** The passes in order, over the lowered IR, leaving out those `off` names: the IR, and the options for the printer. */
export function optimize(s: Sentence, passes: readonly Pass[], context: Context, off: ReadonlySet<string> = new Set(), trace?: Trace): { ir: Sentence; print: PrintOptions } {
  let at = s;
  const print: PrintOptions = { dropLoneNumbers: false };
  for (const pass of passes) {
    if (off.has(pass.name)) continue;
    if ('print' in pass) Object.assign(print, pass.print);
    else {
      at = pass.run(at, context);
      trace?.push({ pass: pass.name, after: at });
    }
  }
  return { ir: at, print };
}

/** Each child sentence of a node, rebuilt with `f`, and the same node where no child changes. */
export function children(s: Sentence, f: (child: Sentence) => Sentence): Sentence {
  switch (s.t) {
    case 'and':
    case 'or': {
      const items = s.items.map(f);
      return items.every((item, i) => item === s.items[i]) ? s : { ...s, items };
    }
    case 'not':
    case 'moment':
    case 'quant':
    case 'define': {
      const body = f(s.body);
      return body === s.body ? s : ({ ...s, body } as Sentence);
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

/** A pass of the IR that rewrites each node where `at` gives a new one, from the leaves up. */
export function everywhere(name: string, spec: string, at: (s: Sentence, context: Context) => Sentence | undefined): Pass {
  const run = (s: Sentence, context: Context): Sentence => {
    const inner = children(s, child => run(child, context));
    return at(inner, context) ?? inner;
  };
  return { name, spec, run };
}
