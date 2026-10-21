/**
 * The sentence IR: what the words of a formula say, as structure and not as text. Every node has a meaning in Alloy,
 * which `meaning` writes out, so that a pass that changes the IR can be asked of the analyzer: the IR before and after
 * it must hold in the same worlds. The words a node is printed with are the printer's, and only the printer's choices
 * are left to readers.
 *
 * A node may carry hints for the printer, such as `inline`. A hint changes how a node is laid out and never what it
 * means, so `meaning` ignores it.
 */
import { type Node, parseFormula } from '@bigmistqke/parse-alloy';

/** A variable the words introduce. Its name is the printer's: the noun of its type and a number, or the noun alone. */
export interface Var {
  /** Unique within one rendering; never shown. */
  id: string;
  /** The signature it ranges over, which has a noun. */
  type: string;
}

/** One thing a clause is about. */
export type Term =
  | { t: 'var'; v: Var }
  /** A variable the formula leaves free, said by the name the formula gives it. */
  | { t: 'free'; name: string }
  | { t: 'string'; value: string }
  /**
   * A noun phrase: a quantifier said in the place of its variable, "a unit", "no unit that is a spec", "another unit".
   * It takes the narrowest scope there is: the clause it stands in, inside the noun phrases before it in that clause.
   */
  | NounPhrase;

export interface NounPhrase {
  t: 'np';
  det: 'a' | 'no';
  v: Var;
  /** What else holds of the variable: "that is a spec". */
  relative?: Sentence;
  /** A variable or a string the variable differs from: "another unit", "a text other than "a"". */
  other?: Term;
}

/** How a reading's words relate to the formula: `x in S`, `x->y in r`, `p[x, y]`, `y in f[x]`, or `some S` for a reading with no slot. */
export type Form = 'in' | 'call' | 'fun' | 'some';

/** A clause: one fact, said by a reading or by words of the printer's own. */
export type Clause =
  /** A reading of the table, with a term in each slot. `key` is the name it is read under: `Ran`, `on`, `Clock.older`, `Ran'`. */
  | { t: 'reading'; key: string; form: Form; args: Term[]; negative: boolean }
  /** "x and y are the same", "are different". */
  | { t: 'same'; l: Term; r: Term; negative: boolean }
  /** "x is a cleanup", for a signature with a noun and no reading. */
  | { t: 'isA'; x: Term; type: string; negative: boolean }
  /** "x reaches y in one or more steps", where a step from `p` to `q` is `step`. `relation` is the expression closed over. */
  | { t: 'reach'; from: Term; to: Term; reflexive: boolean; p: Var; q: Var; step: Sentence; relation: Node; negative: boolean }
  /** "y is the integer after x without wrapping around". */
  | { t: 'next'; x: Term; y: Term; negative: boolean }
  /** A comparison of numbers in integers that wrap. */
  | { t: 'compare'; op: '<' | '>' | '=<' | '>=' | '=' | '!='; l: Num; r: Num };

/** A number, as the words say it. */
export type Num =
  | { t: 'literal'; value: number }
  | { t: 'term'; x: Term }
  | { t: 'least' }
  | { t: 'greatest' }
  /** "the number of values of v such that cond", or of combinations. */
  | { t: 'count'; vars: Var[]; cond: Sentence }
  /** "the sum of the values of v such that cond": the members of a set of integers. */
  | { t: 'sumOf'; v: Var; cond: Sentence }
  /** "the sum, over every v, of body". */
  | { t: 'sumOver'; vars: Var[]; body: Num }
  | { t: 'arith'; op: 'plus' | 'minus' | 'times' | 'div' | 'rem'; l: Num; r: Num };

export type Quantifier = 'all' | 'some' | 'no' | 'one' | 'lone';
export type Moment = 'always' | 'eventually' | 'after' | 'before' | 'once' | 'historically';

/** A statement made of clauses. */
export type Sentence =
  | Clause
  | { t: 'and'; items: Sentence[]; inline?: boolean }
  | { t: 'or'; items: Sentence[]; inline?: boolean }
  | { t: 'not'; body: Sentence }
  | { t: 'rule'; when: Sentence; then: Sentence; otherwise?: Sentence; oneLine?: boolean; whenever?: boolean }
  | { t: 'iff'; l: Sentence; r: Sentence; inline?: boolean; nextAndNow?: boolean }
  | { t: 'quant'; q: Quantifier; vars: Var[]; body: Sentence }
  | { t: 'moment'; op: Moment; body: Sentence; inline?: boolean }
  | { t: 'until' | 'since'; a: Sentence; b: Sentence }
  /** What a definition names, exactly when its body holds, for every value of its parameters. */
  | { t: 'define'; head: Clause; params: Var[]; body: Sentence };

/** The Alloy a node means, as text. */
export function meaning(s: Sentence): string {
  return new Meaning().sentence(s);
}

/** Whether a formula of the IR parses as Alloy: a fault of naturalloy, never of the formula, when it does not. */
export function parses(s: Sentence): Node {
  return parseFormula(meaning(s));
}

class Meaning {
  /** The Alloy name of each variable: its id, with only the characters a name takes. */
  private name(v: Var): string {
    return `v_${v.id.replace(/[^\w]/g, '_')}`;
  }

  private decl(vars: Var[]): string {
    return vars.map(v => `${this.name(v)}: ${v.type}`).join(', ');
  }

  /** A term in its place, and the quantifiers its noun phrase puts around the clause, outermost first. */
  private term(x: Term, around: ((inner: string) => string)[]): string {
    switch (x.t) {
      case 'var':
        return this.name(x.v);
      case 'free':
        return x.name;
      case 'string':
        return JSON.stringify(x.value);
      case 'np': {
        const name = this.name(x.v);
        const conditions = [
          ...(x.other === undefined ? [] : [`${name} != ${this.term(x.other, around)}`]),
          ...(x.relative === undefined ? [] : [`(${this.sentence(x.relative)})`])
        ];
        around.push(inner => {
          const body = [...conditions, `(${inner})`].join(' and ');
          return x.det === 'no' ? `(no ${name}: ${x.v.type} | ${body})` : `(some ${name}: ${x.v.type} | ${body})`;
        });
        return name;
      }
    }
  }

  /** A clause with its noun phrases' quantifiers around it, the first phrase outermost. */
  private clause(c: Clause): string {
    const around: ((inner: string) => string)[] = [];
    const core = this.core(c, around);
    return around.reduceRight((inner, wrap) => wrap(inner), core);
  }

  private core(c: Clause, around: ((inner: string) => string)[]): string {
    const not = (negative: boolean, f: string): string => (negative ? `not (${f})` : f);
    switch (c.t) {
      case 'reading': {
        const args = c.args.map(a => this.term(a, around));
        const key = c.key;
        switch (c.form) {
          case 'in':
            return not(c.negative, `${args.join('->')} in ${key}`);
          case 'call':
            return not(c.negative, `${key}[${args.join(', ')}]`);
          case 'fun':
            return not(c.negative, `${args[args.length - 1]} in ${key}[${args.slice(0, -1).join(', ')}]`);
          case 'some':
            return not(c.negative, `some ${key}`);
        }
        break;
      }
      case 'same':
        return `${this.term(c.l, around)} ${c.negative ? '!=' : '='} ${this.term(c.r, around)}`;
      case 'isA':
        return `${this.term(c.x, around)} ${c.negative ? 'not in' : 'in'} ${c.type}`;
      case 'reach': {
        const [from, to] = [this.term(c.from, around), this.term(c.to, around)];
        return not(c.negative, `${from}->${to} in ${c.reflexive ? '*' : '^'}{${this.decl([c.p, c.q])} | ${this.sentence(c.step)}}`);
      }
      case 'next':
        return not(c.negative, `${this.term(c.x, around)}->${this.term(c.y, around)} in next`);
      case 'compare':
        return `${this.num(c.l)} ${c.op} ${this.num(c.r)}`;
    }
  }

  private num(n: Num): string {
    switch (n.t) {
      case 'literal':
        return String(n.value);
      case 'term':
        return this.term(n.x, []);
      case 'least':
        return 'min';
      case 'greatest':
        return 'max';
      case 'count':
        return `#{${this.decl(n.vars)} | ${this.sentence(n.cond)}}`;
      case 'sumOf':
        return `(sum s_: {${this.decl([n.v])} | ${this.sentence(n.cond)}} | s_)`;
      case 'sumOver':
        return `(sum ${this.decl(n.vars)} | ${this.num(n.body)})`;
      case 'arith': {
        const op = { plus: 'plus', minus: 'minus', times: 'mul', div: 'div', rem: 'rem' }[n.op];
        return `${op}[${this.num(n.l)}, ${this.num(n.r)}]`;
      }
    }
  }

  sentence(s: Sentence): string {
    switch (s.t) {
      case 'reading':
      case 'same':
      case 'isA':
      case 'reach':
      case 'next':
      case 'compare':
        return this.clause(s);
      // No item holds always, and no alternative never does.
      case 'and':
        return s.items.length === 0 ? 'no none' : s.items.map(i => `(${this.sentence(i)})`).join(' and ');
      case 'or':
        return s.items.length === 0 ? 'some none' : s.items.map(i => `(${this.sentence(i)})`).join(' or ');
      case 'not':
        return `not (${this.sentence(s.body)})`;
      case 'rule': {
        const rule = `(${this.sentence(s.when)}) implies (${this.sentence(s.then)})`;
        return s.otherwise === undefined ? rule : `${rule} else (${this.sentence(s.otherwise)})`;
      }
      case 'iff':
        return `(${this.sentence(s.l)}) iff (${this.sentence(s.r)})`;
      case 'quant':
        return `(${s.q} ${this.decl(s.vars)} | ${this.sentence(s.body)})`;
      case 'moment':
        return `${s.op} (${this.sentence(s.body)})`;
      case 'until':
      case 'since':
        return `(${this.sentence(s.a)}) ${s.t} (${this.sentence(s.b)})`;
      case 'define': {
        const claim = `(${this.clause(s.head)}) iff (${this.sentence(s.body)})`;
        return s.params.length === 0 ? claim : `(all ${this.decl(s.params)} | ${claim})`;
      }
    }
  }
}
