/**
 * What the vocabulary declares, asked the same way by the lowering and by the parser: the signature a type stands under,
 * whether a thing of one type can be a thing of another, the types of what a reading takes, and how its words relate to
 * the formula.
 */
import type { Readings } from '../readings.ts';

/** The names Alloy gives its own sets, which are never variables. */
const BUILTIN = new Set(['none', 'univ', 'iden', 'Int', 'String', 'steps', 'seq/Int', 'next', 'min', 'max']);

/** "a failing cleanup": the article before the noun, by the sound of its first word. */
export function articleFor(phrase: string): string {
  if (/^(?:uni|use|usu|uti|eu|one|once)/i.test(phrase)) return 'a ';
  return /^[aeiou]/i.test(phrase) ? 'an ' : 'a ';
}

export class Vocabulary {
  readonly readings: Readings;

  constructor(readings: Readings) {
    this.readings = readings;
  }

  /** Whether the vocabulary or Alloy declares a name as a set, a signature, a field or a reading: then it is not a variable. */
  declares(name: string): boolean {
    const r = this.readings;
    return BUILTIN.has(name) || r.atoms.has(name) || r.nouns.has(name) || r.fields.has(name) || r.relations?.has(name) === true || r.holders.has(name);
  }

  /** A type as a reader names it in a refusal: "an owner", or the type itself where it has no noun. */
  named(type: string): string {
    const words = this.readings.nouns.get(type);
    if (words === undefined) return `"${type}"`;
    const plain = words.replace(/\[([^\]]+)\](?:\([^)]*\))?/g, '$1');
    const article = this.readings.articles.get(type);
    return `${article === undefined ? articleFor(plain) : `${article} `}${plain}`;
  }

  /** The signature that stands on its own above a type. */
  top(type: string): string | undefined {
    if (type === 'String' || type === 'Int' || type === 'univ') return type;
    if (type === 'seq/Int') return 'Int';
    for (let at = type; ; ) {
      const holder = this.readings.holders.get(at);
      if (holder === undefined) return undefined;
      if (holder === at) return at;
      at = holder;
    }
  }

  /** The signature with a noun that a set is a set of. */
  kind(name: string): string {
    let at = name;
    for (let holder = this.readings.holders.get(at); !this.readings.nouns.has(at) && holder !== undefined && holder !== at; holder = this.readings.holders.get(at)) at = holder;
    return at;
  }

  /** The types each thing a reading takes may be, in the order of its slots, as the vocabulary declares them. */
  slotTypes(key: string): (string[] | undefined)[] | undefined {
    const bare = key.replace(/'$/, '');
    if (bare.includes('.')) return this.readings.columns?.get(bare);
    const field = this.readings.fields.get(bare);
    if (field !== undefined) return [field.owner === undefined ? undefined : [field.owner], [field.type]];
    const relation = this.readings.relations?.get(bare);
    if (relation !== undefined) return [[relation.owner], ...relation.columns.map(c => [c])];
    if (this.readings.holders.has(bare)) return [[bare]];
    return this.readings.definitions.get(bare)?.types?.map(t => (t === undefined ? undefined : [t]));
  }

  /** The signatures a signature is declared in, itself first. */
  above(type: string): string[] {
    const out = [type];
    for (let at = this.readings.holders.get(type); at !== undefined && !out.includes(at); at = this.readings.holders.get(at)) out.push(at);
    return out;
  }

  /**
   * Whether a thing of one type can be a thing of the other, as Alloy has it: one is declared in the other, or they
   * share a signature that one of them reaches through a signature declared `in`, which may share members with any.
   */
  overlap(a: string, b: string): boolean {
    if (a === b || a === 'univ' || b === 'univ') return true;
    // A signature with no one signature above it, such as one declared in a union, may share members with any.
    if (!this.readings.holders.has(a) || !this.readings.holders.has(b)) return true;
    const [up, other] = [this.above(a), this.above(b)];
    if (up.includes(b) || other.includes(a)) return true;
    const common = up.find(t => other.includes(t));
    if (common === undefined) return false;
    const below = (chain: string[]): string[] => chain.slice(0, chain.indexOf(common));
    return [...below(up), ...below(other)].some(t => this.readings.subsets?.has(t) === true);
  }

  fits(a: string | undefined, b: string[] | undefined): boolean {
    return a === undefined || b === undefined || b.some(t => this.overlap(a, t));
  }

  /** How a reading's words relate to the formula, by what the vocabulary declares its key to be. */
  form(key: string): 'in' | 'call' | 'fun' {
    if (this.readings.functions.has(key)) return 'fun';
    if (this.readings.definitions.has(key) || this.readings.macros.has(key)) return 'call';
    if (this.readings.fields.has(key) || this.readings.holders.has(key.replace(/'$/, '')) || key.includes('.') || this.readings.relations?.has(key) === true) return 'in';
    // A name the vocabulary does not declare, of another module: a signature or a set by its capital, a predicate otherwise.
    return /^[A-Z]/.test(key.split('/').at(-1) as string) ? 'in' : 'call';
  }
}
