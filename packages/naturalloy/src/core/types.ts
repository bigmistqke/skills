/**
 * The types of Alloy expressions, as the vocabulary declares them, inside the names a formula binds: what a name stands
 * for, what kinds of things an expression holds, how many, and whether two can be compared as Alloy compares them.
 */
import type { Node } from '@bigmistqke/parse-alloy';
import type { Term } from './ir.ts';
import { type Definition, type Readings, Refusal } from '../readings.ts';
import { CONSTRUCTS, callsIn, MULTIPLIED, shown, substitute } from './formula.ts';
import type { Vocabulary } from './vocabulary.ts';
import { COMPARED } from './constructs.ts';

export class Types {
  private readonly vocabulary: Vocabulary;
  private readonly readings: Readings;
  /** What each name the formula declares stands for. */
  private readonly bound: ReadonlyMap<string, Term>;

  constructor(vocabulary: Vocabulary, bound: ReadonlyMap<string, Term>) {
    this.vocabulary = vocabulary;
    this.readings = vocabulary.readings;
    this.bound = bound;
  }

  /** Whether a name stands for one thing: a variable, and not a set, a signature or a field of the vocabulary. */
  isVariable(name: string): boolean {
    return this.bound.has(name) || !this.vocabulary.declares(name);
  }

  /** The type a quantifier declares a variable of; undefined for a free one. */
  boundType(name: string): string | undefined {
    const term = this.bound.get(name);
    return term?.t === 'var' ? term.v.type : term?.t === 'string' ? 'String' : undefined;
  }

  /** An expression as Alloy reads it: a box join of a field is a join, and a function without a reading is its body. */
  shape(given: Node): Node {
    const e = this.withoutNone(given);
    if (e.t === 'name' && e.name === 'steps') throw new Refusal('Alloy reads "steps" only in a scope, and not in a formula');
    const field = (n: Node): boolean => n.t === 'name' && this.readings.fields.has(n.name) && !this.readings.definitions.has(n.name);
    const valued = (name: string): boolean => this.readings.functions.has(name) || this.readings.macros.has(name);
    if (e.t === 'call' && e.args.length === 1 && field({ t: 'name', name: e.name })) return { t: 'join', l: e.args[0] as Node, r: { t: 'name', name: e.name } };
    if (e.t === 'box' && e.args.length === 1 && field(e.e)) return { t: 'join', l: e.args[0] as Node, r: e.e };
    if (e.t === 'join' && e.r.t === 'name' && valued(e.r.name)) return this.shape({ t: 'call', name: e.r.name, args: [e.l] });
    if (e.t === 'box' && e.e.t === 'join' && e.e.r.t === 'name' && valued(e.e.r.name)) return this.shape({ t: 'call', name: e.e.r.name, args: [e.e.l, ...e.args] });
    if (e.t === 'call' && valued(e.name) && !this.readFunction(e)) {
      const fn = (this.readings.functions.get(e.name) ?? this.readings.macros.get(e.name)) as Definition;
      if (fn.params.length !== e.args.length) throw new Refusal(`"${e.name}" takes ${fn.params.length} arguments, not ${e.args.length}`);
      if (callsIn(fn.body).has(e.name)) throw new Refusal(`"${e.name}" is defined in terms of itself; give it a reading`);
      return this.shape(fn.params.reduce((body, param, i) => substitute(body, param, e.args[i] as Node, `"${e.name}", for its parameter "${param}",`), fn.body));
    }
    return e;
  }

  private withoutNone(e: Node): Node {
    const none = (n: Node): boolean => n.t === 'name' && n.name === 'none';
    switch (e.t) {
      case 'union':
        return none(e.l) ? this.withoutNone(e.r) : none(e.r) ? this.withoutNone(e.l) : e;
      case 'diff':
        return none(e.r) ? this.withoutNone(e.l) : none(e.l) ? e.l : e;
      case 'inter':
      case 'join':
      case 'arrow':
        return none(e.l) ? e.l : none(e.r) ? e.r : e;
      case 'prime':
      case 'transpose':
        return none(e.e) ? e.e : e;
      default:
        return e;
    }
  }

  readFunction(e: Node): boolean {
    return e.t === 'call' && this.readings.functions.has(e.name) && this.readings.atoms.has(e.name) && e.args.every(a => a.t === 'name' && this.isVariable(a.name));
  }

  /** The types of the columns of an expression, as the vocabulary declares them. A variable of no known type is ''. */
  columns(node: Node): string[] | undefined {
    const e = this.shape(node);
    switch (e.t) {
      case 'name': {
        if (e.name === 'iden') return ['univ', 'univ'];
        if (e.name === 'next') return ['Int', 'Int'];
        if (e.name === 'univ') return ['univ'];
        if (this.isVariable(e.name)) return [this.boundType(e.name) ?? ''];
        const field = this.readings.fields.get(e.name);
        if (field !== undefined) return field.owner === undefined ? undefined : [field.owner, field.type];
        const relation = this.readings.relations?.get(e.name);
        if (relation !== undefined) return [relation.owner, ...relation.columns];
        return this.readings.holders.has(e.name) ? [this.vocabulary.kind(e.name)] : undefined;
      }
      case 'prime':
        return this.columns(e.e);
      case 'transpose': {
        const c = this.columns(e.e);
        return c?.length === 2 ? [c[1] as string, c[0] as string] : undefined;
      }
      case 'union':
      case 'override':
        return this.merged(this.columns(e.l), this.columns(e.r));
      case 'inter':
        return this.columns(e.l) ?? this.columns(e.r);
      case 'diff':
        return this.columns(e.l);
      case 'join': {
        if (e.r.t === 'rclosure') {
          const [from, step] = [this.columns(e.l), this.columns(e.r.e)];
          if (from?.length === 1 && step?.length === 2 && step[0] === step[1] && (from[0] === '' || from[0] === step[0])) return [step[0] as string];
        }
        const [a, b] = [this.columns(e.l), this.columns(e.r)];
        if (a === undefined || b === undefined) return undefined;
        const c = [...a.slice(0, -1), ...b.slice(1)];
        return c.length > 0 ? c : undefined;
      }
      case 'arrow': {
        if (e.lm !== undefined || e.rm !== undefined) throw new Refusal(`"${shown(e)}" ${MULTIPLIED}`);
        const [a, b] = [this.columns(e.l), this.columns(e.r)];
        return a === undefined || b === undefined ? undefined : [...a, ...b];
      }
      case 'domain':
        return this.columns(e.r);
      case 'range':
      case 'closure':
        return this.columns(e.t === 'range' ? e.l : e.e);
      case 'ite': {
        const [a, b] = [this.columns(e.a), this.columns(e.b)];
        return a !== undefined && b !== undefined && a.join() === b.join() ? a : undefined;
      }
      case 'comprehension': {
        const types = e.decls.flatMap(d => d.names.map(() => this.columns(d.type)));
        return types.every(t => t?.length === 1 && t[0] !== '') ? types.map(t => (t as string[])[0] as string) : undefined;
      }
      case 'call': {
        const result = this.readings.functions.get(e.name)?.result;
        const type = result?.t === 'mult' ? result.e : result;
        return type?.t === 'name' ? [this.vocabulary.kind(type.name)] : undefined;
      }
      default:
        return undefined;
    }
  }

  private merged(a: string[] | undefined, b: string[] | undefined): string[] | undefined {
    if (a === undefined || b === undefined || a.length !== b.length) return undefined;
    const types = a.map((type, i) => (type === '' ? (b[i] as string) : b[i] === '' || b[i] === type ? type : undefined));
    return types.every(type => type !== undefined) ? (types as string[]) : undefined;
  }

  exact(e: Node): boolean {
    return this.howMany(e) === 'one';
  }

  howMany(e: Node): 'one' | 'lone' | 'any' {
    const shaped = this.shape(e);
    switch (shaped.t) {
      case 'string':
      case 'number':
        return 'one';
      case 'name':
        if (shaped.name === 'none') return 'lone';
        return this.isVariable(shaped.name) ? 'one' : 'any';
      case 'prime':
        return this.howMany(shaped.e);
      case 'join': {
        const field = shaped.r.t === 'name' ? this.readings.fields.get(shaped.r.name) : undefined;
        if (field === undefined) return 'any';
        const from = this.howMany(shaped.l);
        if (from === 'one' && field.exact) return 'one';
        return from !== 'any' && !field.many ? 'lone' : 'any';
      }
      case 'inter':
      case 'diff':
        return this.howMany(shaped.l) === 'any' && (shaped.t === 'diff' || this.howMany(shaped.r) === 'any') ? 'any' : 'lone';
      default:
        return 'any';
    }
  }

  typeOf(...sides: Node[]): string {
    for (const side of sides) {
      const c = this.columns(side);
      if (c?.length === 1 && c[0] !== '') return c[0] as string;
    }
    throw this.untyped(sides[0] as Node);
  }

  untyped(e: Node): Error {
    const words = new Set(['name', 'prime', 'transpose', 'join', 'union', 'inter', 'diff', 'arrow', 'call', 'box', 'closure', 'rclosure', 'override', 'domain', 'range', 'comprehension']);
    if (this.integer(e)) return new Refusal(`"${shown(e)}" is a number outside an integer comparison`);
    const odd = (n: Node): Node | undefined => {
      if (!words.has(n.t)) return n;
      for (const child of Object.values(n)) {
        const inner = child !== null && typeof child === 'object' && 't' in child ? odd(child as Node) : undefined;
        if (inner !== undefined) return inner;
      }
      return undefined;
    };
    const found = odd(e);
    return new Refusal(found === undefined ? `the vocabulary does not tell what kind of thing "${shown(e)}" holds` : `"${shown(e)}" holds a ${CONSTRUCTS[found.t]}, which has no words`);
  }

  integer(e: Node): boolean {
    const operation = (name: string): boolean => ['plus', 'minus', 'mul', 'div', 'rem'].includes(name) && !this.readings.definitions.has(name) && !this.readings.functions.has(name);
    switch (e.t) {
      case 'number':
      case 'card':
      case 'cast':
      case 'arith':
        return true;
      case 'quant':
        return e.q === 'sum';
      case 'name':
        return e.name === 'min' || e.name === 'max';
      case 'call':
        return operation(e.name);
      case 'box':
        return e.e.t === 'join' && e.e.r.t === 'name' && operation(e.e.r.name);
      default:
        return false;
    }
  }

  comparesIntegers(node: Extract<Node, { t: 'cmp' }>): boolean {
    if (Object.hasOwn(COMPARED, node.op) && node.op !== '=' && node.op !== '!=') return true;
    return (node.op === '=' || node.op === '!=') && (this.integer(node.l) || this.integer(node.r));
  }

  comparable(l: Node, r: Node): void {
    const of = (side: Node): string[] | undefined => (side.t === 'string' ? ['String'] : this.columns(side));
    const [a, b] = [of(l), of(r)];
    if (a === undefined || b === undefined) return;
    if (a.length !== b.length) throw new Refusal(`"${shown(l)}" and "${shown(r)}" hold tuples of ${a.length} and ${b.length} things, which Alloy does not compare`);
    a.forEach((type, i) => {
      const other = b[i] as string;
      if (type === '' || other === '') return;
      const [x, y] = [this.vocabulary.top(type), this.vocabulary.top(other)];
      if (x !== undefined && y !== undefined && x !== y && x !== 'univ' && y !== 'univ') throw new Refusal(`"${shown(l)}" and "${shown(r)}" hold things of types that share no member, which Alloy does not compare`);
    });
  }

  /** Refuses a call with an argument whose type shares no member with the type of its parameter, as Alloy does. */
  typed(name: string, given: Node[]): void {
    const definition = this.readings.definitions.get(name);
    given.forEach((arg, i) => {
      const param = definition?.types?.[i];
      const columns = arg.t === 'string' ? ['String'] : this.columns(arg);
      if (param === undefined || columns?.length !== 1 || columns[0] === '') return;
      const [a, b] = [this.vocabulary.top(columns[0] as string), this.vocabulary.top(param)];
      if (a === undefined || b === undefined || a === b || a === 'univ' || b === 'univ') return;
      const shown_ = arg.t === 'string' ? shown(arg) : `"${shown(arg)}"`;
      throw new Refusal(`"${name}" takes ${this.vocabulary.named(b)} for "${definition?.params[i]}", and ${shown_} is ${this.vocabulary.named(a)}`);
    });
  }
}
