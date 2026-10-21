/**
 * Lowering: an Alloy formula as the sentence IR, said as literally as the readings allow. A construct with no reading
 * of its own is said through the members of the types of its expressions, as `main`'s verbalizer did: a union is "or",
 * a navigation of an expression goes through a member of the type between, two sets are equal member by member. No
 * choice of wording is made here; the passes make those.
 *
 * What the IR means is checked against the formula it was lowered from: `meaning(lower(f))` holds exactly when `f` does.
 */
import { type Decl, type Node, print } from '@bigmistqke/parse-alloy';
import type { Clause, Compared, Form, Moment, Num, Sentence, Term, Var } from './ir.ts';
import { asRefusal, type Field, type Readings, Refusal } from '../readings.ts';
import { CONSTRUCTS, expanded, holdsBinary, MULTIPLIED, nameOf, shown, substitute } from './formula.ts';
import { Types } from './types.ts';
import type { Vocabulary } from './vocabulary.ts';

/** What a formula that says nothing is refused with. */
export const ALWAYS = 'this formula says nothing: it always holds, so it claims nothing';
export const NEVER = 'this formula says nothing: it never holds, so it claims what cannot be';
/** A formula that never holds, as `x in none` is: the negation of the empty block. */
const FALSE: Node = { t: 'not', f: { t: 'true' } };
const NEGATED_OP: Record<string, Compared> = { '<': '!<', '>': '!>', '=<': '!=<', '>=': '!>=', '=': '!=', '!<': '<', '!>': '>', '!=<': '=<', '!>=': '>=', '!=': '=' };

/** The ids of the variables of one rendering, so that no two are one. */
export class Ids {
  private n = 0;
  next(): string {
    return String(++this.n);
  }
}

/** How many formulas deep a formula may be lowered before it counts as never ending. */
const DEPTH = 1000;

export class Lower {
  /** What each name the formula declares stands for: a variable of the words, a free variable, a string. */
  private readonly bound: Map<string, Term>;
  /** The predicates being said by their bodies, innermost last. */
  private readonly chain: string[];
  /** Formulas being lowered, outermost first: one that comes back while it is lowered would never end. */
  private readonly lowering: Set<string>;
  private readonly depth: { n: number };

  private readonly readings: Readings;
  private readonly ids: Ids;
  private readonly vocabulary: Vocabulary;
  private readonly types: Types;

  constructor(vocabulary: Vocabulary, ids: Ids = new Ids(), bound: Map<string, Term> = new Map(), chain: string[] = [], lowering: Set<string> = new Set(), depth: { n: number } = { n: 0 }) {
    this.vocabulary = vocabulary;
    this.readings = this.vocabulary.readings;
    this.ids = ids;
    this.bound = bound;
    this.types = new Types(this.vocabulary, bound);
    this.chain = chain;
    this.lowering = lowering;
    this.depth = depth;
  }

  /** The lowering inside a scope with more names bound. */
  private within(more: Iterable<[string, Term]>, chain = this.chain): Lower {
    return new Lower(this.vocabulary, this.ids, new Map([...this.bound, ...more]), chain, this.lowering, this.depth);
  }

  /** A new variable of a type with a noun. */
  private fresh(type: string): Var {
    if (!this.readings.nouns.has(type)) throw new Refusal(`no noun for "${type}"`);
    return { id: this.ids.next(), type };
  }

  /** A name for a member the lowering introduces, which no formula can use. */
  private member(): Node {
    return { t: 'name', name: `\u0000m${this.ids.next()}` };
  }

  // ---- what a name stands for ----

  /** Whether a node is one thing a reading can take in a slot: a variable or a string. */
  private isValue(node: Node): boolean {
    return (node.t === 'name' && this.types.isVariable(node.name)) || node.t === 'string';
  }

  /** The term a variable or a string stands for. */
  private term(node: Node, what: string): Term {
    if (node.t === 'string') return { t: 'string', value: node.value };
    const name = nameOf(node, what);
    if (name === 'this' && !this.bound.has(name)) throw new Refusal('Alloy does not read "this" outside a predicate or a function of a signature');
    if (!this.types.isVariable(name)) throw new Refusal(`"${name}" is a set or a field, where a variable must be`);
    return this.bound.get(name) ?? { t: 'free', name };
  }

  /** The expression without its prime, and whether it had one. */
  private unprimed(node: Node): { e: Node; primed: boolean } {
    const side = (n: Node): Node | undefined => (n.t === 'prime' ? n.e : n.t === 'transpose' && n.e.t === 'prime' ? { t: 'transpose', e: n.e.e } : undefined);
    const [r, l] = node.t === 'join' ? [side(node.r), side(node.l)] : [undefined, undefined];
    const found =
      node.t === 'prime' ? { e: node.e, primed: true }
      : node.t === 'join' && r !== undefined ? { e: { ...node, r }, primed: true }
      : node.t === 'join' && l !== undefined ? { e: { ...node, l }, primed: true }
      : { e: node, primed: false };
    const { e } = found;
    if (found.primed && e.t === 'join' && e.l.t === 'name' && e.r.t === 'name' && this.readings.atoms.has(`${e.l.name}.${e.r.name}`) && this.readings.variables.has(e.l.name)) {
      throw new Refusal(`"${e.l.name}" is a var sig, so a prime on "${e.l.name}.${e.r.name}" moves it too`);
    }
    return found;
  }

  /** A primed name that the readings give a line of its own, as `Throwing'`. */
  private readPrimed(node: Node): boolean {
    return node.t === 'prime' && node.e.t === 'name' && this.readings.atoms.has(`${node.e.name}'`);
  }

  /** A navigation `y.f` or `f.y` of a variable `y` and a field `f`. Undefined for a join the readings say as a relation of its own. */
  private navigation(join: Node): { field: string; from: Node; forward: boolean; type: string } | undefined {
    const node: Node =
      join.t !== 'join' ? join
      : join.r.t === 'transpose' && join.l.t === 'name' && this.types.isVariable(join.l.name) ? { t: 'join', l: join.r.e, r: join.l }
      : join.l.t === 'transpose' && join.r.t === 'name' && this.types.isVariable(join.r.name) ? { t: 'join', l: join.r, r: join.l.e }
      : join;
    if (node.t !== 'join' || node.l.t !== 'name' || node.r.t !== 'name') return undefined;
    if (this.readings.atoms.has(`${node.l.name}.${node.r.name}`)) return undefined;
    const { l, r } = node;
    const forward = this.readings.fields.get(r.name);
    if (this.types.isVariable(l.name) && forward !== undefined) return { field: r.name, from: l, forward: true, type: forward.type };
    const backward = this.readings.fields.get(l.name);
    if (this.types.isVariable(r.name) && backward?.owner !== undefined) return { field: l.name, from: r, forward: false, type: backward.owner };
    return undefined;
  }

  /** A reading of a key, with a term in each slot. */
  private reading(key: string, form: Form, args: Term[], negative: boolean): Clause {
    const reading = this.readings.atoms.get(key);
    if (!reading) throw new Refusal(`no reading for "${key}"`);
    const words = negative ? reading.negative : reading.positive;
    if (words === undefined) throw new Refusal(`no negative reading for "${key}"`);
    for (const n of words.matchAll(/\{(\d+)\}/g)) if (args[Number(n[1]) - 1] === undefined) throw new Refusal(`the reading of "${key}" uses {${n[1]}}, which the formula does not give`);
    const missing = args.findIndex((_, i) => !words.includes(`{${i + 1}}`));
    if (missing !== -1) throw new Refusal(`the reading of "${key}" leaves out {${missing + 1}}, which the formula gives`);
    return { t: 'reading', key, form, args, negative };
  }

  /** `x in y.f`, with the reading of the field. */
  private member_(x: Node, nav: { field: string; from: Node; forward: boolean }, negative: boolean): Clause {
    const [one, other] = [this.term(x, 'the left of "in"'), this.term(nav.from, 'the variable of a navigation')];
    return this.reading(nav.field, 'in', nav.forward ? [other, one] : [one, other], negative);
  }

  // ---- calls ----

  private call(node: Extract<Node, { t: 'call' }>, negative: boolean): Sentence {
    const apart = this.disjoint(node);
    if (apart !== undefined) return negative ? this.negation(apart) : this.sentence(apart);
    const given = node.args.map(a => this.types.shape(a));
    this.types.typed(node.name, given);
    if (this.readings.atoms.has(node.name)) {
      const through = this.throughMember(node, negative);
      return through === undefined ? this.reading(node.name, 'call', given.map(a => this.term(a, 'an argument')), negative) : this.sentence(through);
    }
    const definition = this.readings.definitions.get(node.name) ?? this.readings.macros.get(node.name);
    if (definition === undefined) throw new Refusal(`no reading for "${node.name}"`);
    if (this.chain.includes(node.name)) throw new Refusal(`"${node.name}" is defined in terms of itself; give it a reading`);
    if (definition.params.length !== given.length) throw new Refusal(`"${node.name}" takes ${definition.params.length} arguments, not ${given.length}`);
    // An expression argument is put in the place of its parameter, with each name of this scope renamed to an alias the
    // body cannot declare, so that a parameter of the body never captures it.
    const aliases = new Map<string, Term>();
    const resolved = (e: Node): Node => {
      const walk = (n: unknown): unknown => {
        if (Array.isArray(n)) return n.map(walk);
        if (n === null || typeof n !== 'object') return n;
        const o = n as Node;
        if (o.t === 'name' && this.bound.has(o.name)) {
          const alias = `\u0000a${o.name}`;
          aliases.set(alias, this.bound.get(o.name) as Term);
          return { t: 'name', name: alias };
        }
        return Object.fromEntries(Object.entries(o).map(([key, v]) => [key, key === 'span' ? v : walk(v)]));
      };
      return walk(e) as Node;
    };
    const params = new Map<string, Term>();
    let body = definition.body;
    definition.params.forEach((param, i) => {
      const arg = given[i] as Node;
      if (this.isValue(arg)) params.set(param, this.term(arg, 'an argument'));
      else body = substitute(body, param, resolved(arg), `"${node.name}", for its parameter "${param}",`);
    });
    // The body sees the names of this scope only through aliases: its own names are its parameters and what it declares.
    const inside = new Lower(this.vocabulary, this.ids, new Map([...aliases, ...params]), [...this.chain, node.name], this.lowering, this.depth);
    let said: Sentence;
    try {
      said = inside.sentence(body);
    } catch (error) {
      throw new Refusal(`no reading for "${node.name}", and its body cannot be said: ${asRefusal(error).message}`);
    }
    // A predicate with no reading of its own is negated as a whole: its body is what it means, and it has no negative words.
    return negative ? { t: 'not', body: said, form: 'untrue' } : said;
  }

  /** `disj[a, b, …]` as the formula it means. */
  private disjoint(node: Extract<Node, { t: 'call' }>): Node | undefined {
    if (node.name !== 'disj' || this.readings.atoms.has('disj') || this.readings.definitions.has('disj')) return undefined;
    const pairs = node.args.flatMap((a, i) =>
      node.args.slice(i + 1).map((b): Node => (this.isValue(this.types.shape(a)) && this.isValue(this.types.shape(b)) ? { t: 'cmp', op: '!=', l: a, r: b } : { t: 'mult', q: 'no', e: { t: 'inter', l: a, r: b } }))
    );
    return pairs.length === 1 ? (pairs[0] as Node) : { t: 'and', items: pairs };
  }

  /** A call with a reading and an argument that is an expression, as the formula it is said through: the one member of the argument. */
  private throughMember(node: Extract<Node, { t: 'call' }>, negative: boolean): Node | undefined {
    const given = node.args.map(a => this.types.shape(a));
    const at = given.findIndex(a => !this.isValue(a));
    if (at === -1) return undefined;
    const arg = given[at] as Node;
    const type = this.types.columns(arg);
    if (!this.types.exact(arg) || type?.length !== 1 || type[0] === '') throw new Refusal(`the reading of "${node.name}" takes one thing, and "${shown(arg)}" can hold none or several`);
    const m = this.member();
    const call: Node = { t: 'call', name: node.name, args: given.map((a, i) => (i === at ? m : a)) };
    return { t: 'quant', q: 'some', decls: [{ names: [nameOf(m, '')], type: { t: 'name', name: type[0] as string } }], body: { t: 'and', items: [this.inside([m], arg), negative ? { t: 'not', f: call } : call] } };
  }

  /** A join with a predicate, `x.p` or `x.p[y]`, as the call it is. */
  private asCall(node: Node): Extract<Node, { t: 'call' }> | undefined {
    const predicate = (n: Node): n is Extract<Node, { t: 'name' }> =>
      n.t === 'name' && (this.readings.definitions.has(n.name) || this.readings.macros.has(n.name) || (this.readings.atoms.has(n.name) && !this.readings.fields.has(n.name) && !this.readings.holders.has(n.name)));
    if (node.t === 'join' && predicate(node.r)) return { t: 'call', name: node.r.name, args: [node.l] };
    if (node.t === 'box' && node.e.t === 'join' && predicate(node.e.r)) return { t: 'call', name: node.e.r.name, args: [node.e.l, ...node.args] };
    return undefined;
  }

  private relation(e: Node): boolean {
    return e.t === 'join' && e.l.t === 'name' && e.r.t === 'name' && this.readings.atoms.has(`${e.l.name}.${e.r.name}`);
  }

  private direct(e: Node): boolean {
    if (e.t === 'name') return e.name !== 'iden';
    if (this.types.readFunction(e) || e.t === 'closure' || e.t === 'rclosure') return true;
    if (e.t === 'prime') return this.direct(e.e);
    if (e.t !== 'join') return false;
    const { e: bare } = this.unprimed(e);
    return this.navigation(bare) !== undefined || this.relation(bare);
  }

  /** That a variable, or a tuple of them, is in an expression, as a formula of memberships the readings say. */
  private inside(xs: Node[], node: Node): Node {
    const e = this.types.shape(node);
    const tuple = xs.slice(1).reduce((l: Node, r): Node => ({ t: 'arrow', l, r }), xs[0] as Node);
    const base: Node = { t: 'cmp', op: 'in', l: tuple, r: e };
    switch (e.t) {
      case 'union':
        return { t: 'or', items: [this.inside(xs, e.l), this.inside(xs, e.r)] };
      case 'ite':
        return { t: 'ite', c: e.c, a: this.inside(xs, e.a), b: this.inside(xs, e.b) };
      case 'inter':
        return { t: 'and', items: [this.inside(xs, e.l), this.inside(xs, e.r)] };
      case 'diff':
        return { t: 'and', items: [this.inside(xs, e.l), { t: 'not', f: this.inside(xs, e.r) }] };
      case 'prime':
        return e.e.t === 'name' ? base : { t: 'unary', op: 'after', f: this.inside(xs, e.e) };
      case 'transpose':
        return xs.length === 2 ? this.inside([xs[1] as Node, xs[0] as Node], e.e) : base;
      case 'override':
        return xs.length === 1
          ? { t: 'or', items: [this.inside(xs, e.l), this.inside(xs, e.r)] }
          : { t: 'or', items: [this.inside(xs, e.r), { t: 'and', items: [this.inside(xs, e.l), { t: 'mult', q: 'no', e: { t: 'join', l: xs[0] as Node, r: e.r } }] }] };
      case 'domain':
        return { t: 'and', items: [this.inside(xs.slice(0, 1), e.l), this.inside(xs, e.r)] };
      case 'range':
        return { t: 'and', items: [this.inside(xs, e.l), this.inside(xs.slice(-1), e.r)] };
      case 'comprehension': {
        const names = e.decls.flatMap(d => d.names.map(name => ({ name, type: d.type })));
        if (names.length !== xs.length) return base;
        const body = names.reduce((f, { name }, i) => substitute(f, name, xs[i] as Node, 'the set comprehension'), e.body);
        return { t: 'and', items: [...names.map(({ type }, i) => this.inside([xs[i] as Node], type)), body] };
      }
      case 'name':
        if (e.name === 'none') return FALSE;
        if (e.name === 'iden' && xs.length === 2) return { t: 'cmp', op: '=', l: xs[0] as Node, r: xs[1] as Node };
        return base;
      case 'arrow': {
        if (e.lm !== undefined || e.rm !== undefined) throw new Refusal(`"${shown(e)}" ${MULTIPLIED}`);
        const k = this.types.columns(e.l)?.length;
        return k === undefined || k >= xs.length ? base : { t: 'and', items: [this.inside(xs.slice(0, k), e.l), this.inside(xs.slice(k), e.r)] };
      }
      case 'join': {
        if (this.direct(e)) return base;
        const { l, r } = e;
        if (l.t === 'name' && this.types.isVariable(l.name)) return this.inside([l, ...xs], r);
        if (r.t === 'name' && this.types.isVariable(r.name)) return this.inside([...xs, r], l);
        const left = this.types.columns(l);
        const type = left?.[left.length - 1];
        if (left === undefined || type === undefined || type === '') return base;
        const k = left.length - 1;
        const m = this.member();
        const signature = l.t === 'name' && this.readings.holders.has(l.name);
        const body: Node = signature ? this.inside([m, ...xs.slice(k)], r) : { t: 'and', items: [this.inside([...xs.slice(0, k), m], l), this.inside([m, ...xs.slice(k)], r)] };
        return { t: 'quant', q: 'some', decls: [{ names: [nameOf(m, '')], type: signature ? l : { t: 'name', name: type } }], body };
      }
      default:
        return base;
    }
  }

  // ---- numbers ----

  /** A comparison of integers. */
  private integers(node: Extract<Node, { t: 'cmp' }>, negative: boolean): Clause {
    const { l, r } = node;
    if (node.op === '=' || node.op === '!=') {
      const [number, other] = this.types.integer(l) ? [l, r] : [r, l];
      if (!this.types.integer(other) && !this.isValue(other)) throw new Refusal(`"${node.op}" between the set "${shown(other)}" and the number "${shown(number)}" compares sets, which the words would have to say with the wrap of the number`);
    }
    const op = node.op as Compared;
    return { t: 'compare', op: negative ? (NEGATED_OP[op] as Compared) : op, l: this.number(l, false), r: this.number(r, false) };
  }

  /** The words of a number. Inside a sum, a division would have to be said in the middle of it, and is refused. */
  private number(given: Node, inSum: boolean): Num {
    const e = this.types.shape(given);
    switch (e.t) {
      case 'number':
        return { t: 'literal', value: e.value };
      case 'name':
        if (e.name === 'min') return { t: 'least' };
        if (e.name === 'max') return { t: 'greatest' };
        if (this.isValue(e)) return { t: 'term', x: this.term(e, 'a number') };
        return this.summed(e);
      case 'card':
        if (this.types.shape(e.e).t === 'name' && (this.types.shape(e.e) as { name: string }).name === 'none') return { t: 'literal', value: 0 };
        return this.countOf(e.e);
      case 'cast':
        if (this.isValue(e.e)) return { t: 'term', x: this.term(e.e, 'a number') };
        return this.summed(e.e);
      case 'quant': {
        if (e.q !== 'sum') break;
        const vars: Var[] = [];
        const more: [string, Term][] = [];
        for (const { names, type } of e.decls)
          for (const name of names) {
            const v = this.fresh(this.plainType(type));
            vars.push(v);
            more.push([name, { t: 'var', v }]);
          }
        return { t: 'sumOver', vars, body: this.within(more).number(e.body, true) };
      }
      case 'arith':
      case 'call':
      case 'box': {
        const [op, args] =
          e.t === 'arith' ? [e.op, [e.l, e.r]] : e.t === 'call' ? [e.name, e.args] : [nameOf((e.e as Extract<Node, { t: 'join' }>).r, ''), [(e.e as Extract<Node, { t: 'join' }>).l, ...e.args]];
        if (op === '<<' || op === '>>' || op === '>>>') throw new Refusal(`"${op}" shifts by the lowest bits of the amount, which the words do not say`);
        if (args.length !== 2) throw new Refusal(`"${op}" takes two numbers, not ${args.length}`);
        const [x, y] = [this.number(args[0] as Node, inSum), this.number(args[1] as Node, inSum)];
        const words: Record<string, 'plus' | 'minus' | 'times'> = { add: 'plus', plus: 'plus', sub: 'minus', minus: 'minus', mul: 'times' };
        if (words[op] !== undefined) return { t: 'arith', op: words[op] as 'plus', l: x, r: y };
        if (inSum) throw new Refusal(`"${shown(given)}" divides inside a sum, which the words would have to say in the middle of it`);
        if (op === 'div' || op === 'divide') return { t: 'arith', op: 'div', l: x, r: y };
        if (op === 'rem') return { t: 'arith', op: 'rem', l: x, r: y };
        throw new Refusal(`"${op}" has no words`);
      }
      default:
        break;
    }
    return this.summed(e);
  }

  /** The type of a declaration as one name, the way `plain` reads it. */
  private plainType(type: Node): string {
    const node = this.plain({ t: 'quant', q: 'some', decls: [{ names: ['\u0000type'], type }], body: { t: 'true' } });
    return nameOf((node.decls[0] as Decl).type, 'the type of a quantified variable');
  }

  /** `#e`: the number of values, or combinations, in it. */
  private countOf(e: Node): Num {
    const types = this.types.columns(e);
    if (types === undefined || types.includes('')) throw this.types.untyped(e);
    const vars = types.map(type => this.fresh(type));
    const ms = vars.map((): Node => this.member());
    const cond = this.within(ms.map((m, i): [string, Term] => [nameOf(m, ''), { t: 'var', v: vars[i] as Var }])).sentence(this.inside(ms, e));
    return { t: 'count', vars, cond };
  }

  /** A set of integers where a number belongs: the sum of its members. */
  private summed(e: Node): Num {
    const types = this.types.columns(e);
    if (types?.length !== 1 || this.vocabulary.kind(types[0] as string) !== 'Int') throw new Refusal(`"${shown(e)}" is not a number or a set of integers`);
    const v = this.fresh('Int');
    const m = this.member();
    return { t: 'sumOf', v, cond: this.within([[nameOf(m, ''), { t: 'var', v }]]).sentence(this.inside([m], e)) };
  }

  // ---- comparisons ----

  /** `e in s` member by member. */
  private subset(l: Node, r: Node): Node {
    this.types.comparable(l, r);
    const types = this.types.columns(l);
    if (types === undefined || types.includes('')) throw this.types.untyped(l);
    const ms = types.map(() => this.member());
    return { t: 'quant', q: 'all', decls: ms.map((m, i) => ({ names: [nameOf(m, '')], type: { t: 'name', name: types[i] as string } })), body: { t: 'implies', l: this.inside(ms, l), r: this.inside(ms, r) } };
  }

  /** `x->y in ^r` and `x->y in *r`. */
  private reach(pair: Extract<Node, { t: 'arrow' }>, closure: Extract<Node, { t: 'closure' | 'rclosure' }>, negative: boolean): Clause {
    const [from, to] = [this.term(pair.l, 'a side of "->"'), this.term(pair.r, 'a side of "->"')];
    const types = this.types.columns(closure.e);
    if (types?.length !== 2 || types.includes('')) throw this.types.untyped(closure.e);
    const [p, q] = [this.fresh(types[0] as string), this.fresh(types[1] as string)];
    const [mp, mq] = [this.member(), this.member()];
    const step = this.within([
      [nameOf(mp, ''), { t: 'var', v: p }],
      [nameOf(mq, ''), { t: 'var', v: q }]
    ]).sentence(this.inside([mp, mq], closure.e));
    return { t: 'reach', from, to, reflexive: closure.t === 'rclosure', p, q, step, relation: closure.e, negative };
  }

  /** `a = b` member by member. */
  private equalMembers(l: Node, r: Node): Node {
    this.types.comparable(l, r);
    for (const side of [l, r]) if (!this.isValue(side) && this.types.columns(side) === undefined) throw this.types.untyped(side);
    const columns = [this.types.columns(l), this.types.columns(r)].find(c => c !== undefined && c.length > 1 && !c.includes(''));
    if (columns !== undefined) {
      const ms = columns.map(() => this.member());
      return { t: 'quant', q: 'all', decls: ms.map((m, i) => ({ names: [nameOf(m, '')], type: { t: 'name', name: columns[i] as string } })), body: { t: 'iff', l: this.inside(ms, l), r: this.inside(ms, r) } };
    }
    const m = this.member();
    const of = (side: Node): Node => (side.t === 'name' && this.types.isVariable(side.name) ? { t: 'cmp', op: '=', l: m, r: side } : this.inside([m], side));
    const wide = [l, r].some(side => this.types.columns(side)?.[0] === 'univ') ? 'univ' : this.types.typeOf(l, r);
    return { t: 'quant', q: 'all', decls: [{ names: [nameOf(m, '')], type: { t: 'name', name: wide } }], body: { t: 'iff', l: of(l), r: of(r) } };
  }

  /** The formula a comparison is said through, when no reading says it as it stands; undefined when one does. */
  private lowered(node: Extract<Node, { t: 'cmp' }>, negative: boolean): Node | undefined {
    const { op } = node;
    if (this.types.comparesIntegers(node)) return undefined;
    if ((op === 'in' || op === 'not in') && this.types.integer(node.l)) throw this.types.untyped(node.l);
    const [l, r] = [this.types.shape(node.l), this.types.shape(node.r)];
    const flip = negative !== (op === 'not in' || op === '!=');
    const not = (f: Node): Node => (flip ? { t: 'not', f } : f);
    const none = (n: Node): boolean => n.t === 'name' && n.name === 'none';
    if (op !== 'in' && op !== 'not in' && (none(l) || none(r))) return { t: 'mult', q: flip ? 'some' : 'no', e: none(l) ? r : l };
    if ((op === 'in' || op === 'not in') && none(r) && !(l.t === 'name' && this.types.isVariable(l.name)) && l.t !== 'arrow') return { t: 'mult', q: flip ? 'some' : 'no', e: l };
    if ((op === 'in' || op === 'not in') && none(r)) return not(FALSE);
    const builtin = (n: Node): string | undefined => (n.t === 'string' ? 'String' : n.t === 'name' && this.bound.has(n.name) ? this.types.boundType(n.name) : undefined);
    if ((op === 'in' || op === 'not in') && (none(l) || (r.t === 'name' && (r.name === 'String' || r.name === 'Int') && builtin(l) === r.name))) return not({ t: 'true' });
    if (op === 'in' || op === 'not in') {
      if (l.t === 'arrow' && l.lm === undefined && l.rm === undefined && r.t === 'transpose') return this.lowered({ ...node, l: { t: 'arrow', l: l.r, r: l.l }, r: r.e }, negative);
      if (l.t === 'union' || r.t === 'diff') return undefined;
      if (this.types.integer(r) && l.t === 'name' && this.types.boundType(l.name) === 'Int') return not({ t: 'cmp', op: '=', l, r });
      if (r.t === 'string' && this.types.exact(l)) return not({ t: 'cmp', op: '=', l, r });
      if (r.t === 'name' && this.bound.has(r.name) && l.t !== 'arrow') return not(this.types.exact(l) ? { t: 'cmp', op: '=', l, r } : this.subset(l, r));
      if ((l.t !== 'name' && l.t !== 'arrow' && l.t !== 'string') || (l.t === 'name' && !this.isValue(l)) || (l.t === 'arrow' && !(this.isValue(l.l) && this.isValue(l.r)))) return not(this.subset(l, r));
      if (this.direct(r) || this.signature(r)) return undefined;
      const spelled = this.inside(l.t === 'arrow' ? [l.l, l.r] : [l], r);
      return spelled.t === 'cmp' && spelled.op === 'in' && JSON.stringify(spelled.r) === JSON.stringify(r) ? undefined : not(spelled);
    }
    if (this.isValue(l) && this.isValue(r)) return undefined;
    const [left, right] = [this.unprimed(l), this.unprimed(r)];
    if (this.forward(left) && this.forward(right)) return flip ? not(this.equalMembers(l, r)) : undefined;
    const side = this.forward(left) && this.isValue(r) ? left : this.forward(right) && this.isValue(l) ? right : undefined;
    if (side === undefined || side.e.t !== 'join') return not(this.equalMembers(l, r));
    return (this.readings.fields.get(nameOf(side.e.r, 'a field')) as Field).many && flip ? not(this.equalMembers(l, r)) : undefined;
  }

  private forward(side: { e: Node }): boolean {
    return side.e.t === 'join' && this.navigation(side.e)?.forward === true && side.e.r.t === 'name';
  }

  private signature(e: Node): boolean {
    return e.t === 'name' && !this.readings.atoms.has(e.name) && this.readings.nouns.has(e.name);
  }

  private comparison(node: Extract<Node, { t: 'cmp' }>, negative: boolean): Sentence {
    if (this.types.comparesIntegers(node)) return this.integers(node, negative);
    const formula = this.lowered(node, negative);
    if (formula !== undefined) return this.sentence(formula);
    const { op } = node;
    const [l, r] = [this.types.shape(node.l), this.types.shape(node.r)];
    const flip = negative !== (op === 'not in' || op === '!=');
    if (op === 'in' || op === 'not in') {
      if (l.t === 'arrow' && l.lm === undefined && l.rm === undefined && r.t === 'transpose') return this.comparison({ ...node, l: { t: 'arrow', l: l.r, r: l.l }, r: r.e }, negative);
      if (l.t === 'union') {
        // a + b not in s: not every member is in s, so at least one is not.
        if (op !== 'in') return this.comparison({ ...node, op: 'in' }, !negative);
        const parts = [l.l, l.r].map(side => this.comparison({ ...node, l: side }, negative));
        return { t: negative ? 'or' : 'and', items: parts, form: 'list' };
      }
      if (r.t === 'diff') {
        if (op !== 'in') return this.comparison({ ...node, op: 'in' }, !negative);
        const parts = [this.comparison({ ...node, op: 'in', r: r.l }, negative), this.comparison({ ...node, op: 'not in', r: r.r }, negative)];
        return { t: negative ? 'or' : 'and', items: parts, form: 'list' };
      }
      if (!this.readPrimed(r)) {
        const { e, primed } = this.unprimed(r);
        if (primed) return { t: 'moment', op: 'after', body: this.comparison({ ...node, r: e }, negative) };
        const nav = this.navigation(r);
        if (nav !== undefined && l.t !== 'arrow') return this.member_(l, nav, flip);
      }
      if (this.signature(r) && l.t === 'name') return { t: 'isA', x: this.term(l, 'the left of "in"'), type: (r as Extract<Node, { t: 'name' }>).name, negative: flip };
      if ((r.t === 'closure' || r.t === 'rclosure') && l.t === 'arrow') return this.reach(l, r, flip);
      if (r.t === 'name' && r.name === 'next' && l.t === 'arrow') return { t: 'next', x: this.term(l.l, 'a side of "->"'), y: this.term(l.r, 'a side of "->"'), negative: flip };
      if (r.t === 'call' && this.types.readFunction(r)) return this.reading(r.name, 'fun', [...r.args.map(a => this.term(a, 'an argument')), this.term(l, 'the left of "in"')], flip);
      const slots = l.t === 'arrow' ? [this.term(l.l, 'a side of "->"'), this.term(l.r, 'a side of "->"')] : [this.term(l, 'the left of "in"')];
      const key = r.t === 'join' ? `${nameOf(r.l, 'a relation')}.${nameOf(r.r, 'a relation')}` : r.t === 'prime' ? `${nameOf(r.e, 'a primed set')}'` : nameOf(r, 'the right of "in"');
      return this.reading(key, 'in', slots, flip);
    }
    if ((l.t === 'name' || l.t === 'string') && (r.t === 'name' || r.t === 'string')) return { t: 'same', l: this.term(l, 'the left of "="'), r: this.term(r, 'the right of "="'), negative: flip };
    const [left, right] = [this.unprimed(l), this.unprimed(r)];
    if (this.forward(left) && this.forward(right)) return this.sameMembers(left, right);
    const [side, value] = this.forward(left) ? [left, r] : [right, l];
    if (side.e.t !== 'join') throw new Refusal('"=" needs a navigation on one side');
    const field = this.readings.fields.get(nameOf(side.e.r, 'a field')) as Field;
    if (field.many) return this.equalsOne(side, value);
    const said = this.reading(nameOf(side.e.r, 'a field'), 'in', [this.term(side.e.l, 'the owner of a field'), this.term(value, 'the value of a field')], flip);
    return side.primed ? { t: 'moment', op: 'after', body: said } : said;
  }

  /** `y.f = x` for a field of many values, member by member. */
  private equalsOne(side: { e: Node; primed: boolean }, value: Node): Sentence {
    const nav = this.navigation(side.e);
    if (nav === undefined) throw new Refusal('the side of "=" must be a variable and a field');
    const v = this.fresh(nav.type);
    const x: Term = { t: 'var', v };
    const inside = this.within([['\u0000', x]]);
    const member = inside.member_({ t: 'name', name: '\u0000' }, nav, false);
    const same: Clause = { t: 'same', l: x, r: this.term(value, 'the value of a field'), negative: false };
    return { t: 'quant', q: 'all', vars: [v], body: { t: 'iff', l: side.primed ? { t: 'moment', op: 'after', body: member } : member, r: same } };
  }

  /** `y.f = z.g`, member by member over the type of the field. */
  private sameMembers(left: { e: Node; primed: boolean }, right: { e: Node; primed: boolean }): Sentence {
    const [l, r] = [this.navigation(left.e), this.navigation(right.e)];
    if (l === undefined || r === undefined) throw new Refusal('the sides of "=" must each be a variable and a field');
    if (l.type !== r.type) throw new Refusal(`the sides of "=" reach different types, "${l.type}" and "${r.type}"`);
    const v = this.fresh(l.type);
    const inside = this.within([['\u0000', { t: 'var', v }]]);
    const x: Node = { t: 'name', name: '\u0000' };
    const at = (primed: boolean, s: Sentence): Sentence => (primed ? { t: 'moment', op: 'after', body: s } : s);
    return { t: 'quant', q: 'all', vars: [v], body: { t: 'iff', l: at(left.primed, inside.member_(x, l, false)), r: at(right.primed, inside.member_(x, r, false)) } };
  }

  // ---- multiplicities ----

  private mult(node: Extract<Node, { t: 'mult' }>, negative: boolean): Sentence {
    if (node.q === 'set' || node.q === 'seq') throw new Refusal(`"${node.q}" before an expression is not a formula; Alloy reads it only in a declaration`);
    const given = this.types.shape(node.e);
    if (this.types.integer(given)) throw this.types.untyped(given);
    if ((given.t === 'name' && given.name === 'none') || given.t === 'rclosure') return this.sentence(this.counted(node, negative) as Node);
    // some, no, one and lone of a signature with a noun and no reading: "there is an owner", which the noun says in full.
    if (given.t === 'name' && this.readings.nouns.has(given.name) && !this.readings.atoms.has(given.name)) {
      const q = node.q === 'some' || node.q === 'no' ? ((node.q === 'no') !== negative ? 'no' : 'some') : node.q;
      const said: Sentence = { t: 'quant', q: q as 'some', vars: [this.fresh(given.name)], body: { t: 'and', items: [] } };
      return negative && (q === 'one' || q === 'lone') ? { t: 'not', body: said } : said;
    }
    if (node.q === 'some' || node.q === 'no') {
      const none = (node.q === 'no') !== negative;
      if (this.readPrimed(given)) return this.reading(`${nameOf((given as Extract<Node, { t: 'prime' }>).e, 'a primed set')}'`, 'some', [], none);
      const { e, primed } = this.unprimed(given);
      if (primed) return { t: 'moment', op: 'after', body: this.mult({ ...node, e }, negative) };
      // no y.f: no member of the type of the field is in y.f
      const nav = this.navigation(e);
      if (nav !== undefined) {
        const v = this.fresh(nav.type);
        return { t: 'quant', q: none ? 'no' : 'some', vars: [v], body: this.within([['\u0000', { t: 'var', v }]]).member_({ t: 'name', name: '\u0000' }, nav, false) };
      }
      const signature = e.t === 'name' && this.readings.nouns.has(e.name) && !this.readings.atoms.has(e.name);
      if (e.t === 'name' && !signature && !this.readings.fields.has(e.name) && !this.types.isVariable(e.name) && !this.readings.atoms.get(e.name)?.positive.includes('{1}')) {
        return this.reading(e.name, 'some', [], none);
      }
      // some S and no S of a set whose reading takes its member: the member of the signature that holds S.
      const holder = e.t === 'name' && !signature ? this.readings.holders.get(e.name) : undefined;
      if (e.t === 'name' && !signature && this.readings.atoms.has(e.name) && !this.readings.fields.has(e.name) && !this.types.isVariable(e.name) && holder === undefined) {
        throw new Refusal(`no one signature holds "${e.name}", so "some" or "no" of it has no noun`);
      }
      if (e.t === 'name' && holder !== undefined && this.readings.nouns.has(holder) && !this.readings.fields.has(e.name) && !this.types.isVariable(e.name)) {
        const v = this.fresh(holder);
        return { t: 'quant', q: none ? 'no' : 'some', vars: [v], body: this.reading(e.name, 'in', [{ t: 'var', v }], false), origin: 'set' };
      }
    }
    return this.sentence(this.counted(node, negative) as Node);
  }

  /** `some`, `no`, `one` or `lone` of an expression, as the quantifier over the members of the types of its columns. */
  private counted(node: Extract<Node, { t: 'mult' }>, negative: boolean): Node | undefined {
    const given = this.types.shape(node.e);
    if (this.types.integer(given)) throw this.types.untyped(given);
    if (given.t === 'name' && given.name === 'none') return (node.q === 'no' || node.q === 'lone') !== negative ? { t: 'true' } : FALSE;
    if (given.t === 'rclosure') throw new Refusal(`"${shown(given)}" holds every member of every type, Int included, which no noun names`);
    if (this.types.exact(given)) return (node.q === 'no') !== negative ? FALSE : { t: 'true' };
    if (node.q === 'some' || node.q === 'no') {
      if (this.readPrimed(given)) return undefined;
      const { e, primed } = this.unprimed(given);
      if (primed) {
        const f = this.counted({ ...node, e }, negative);
        return f === undefined ? undefined : { t: 'unary', op: 'after', f };
      }
    }
    const types = this.types.columns(given);
    if (types === undefined || types.includes('')) throw this.types.untyped(node.e);
    const ms = types.map(() => this.member());
    const q = node.q === 'one' || node.q === 'lone' ? node.q : (node.q === 'no') !== negative ? 'no' : 'some';
    const f: Node = { t: 'quant', q, decls: ms.map((m, i) => ({ names: [nameOf(m, '')], type: { t: 'name', name: types[i] as string } })), body: this.inside(ms, given) };
    return negative && (q === 'one' || q === 'lone') ? { t: 'not', f } : f;
  }

  // ---- quantifiers ----

  /** A quantifier with plain declarations: `disj`, a difference as a type, and a set with no noun become conditions. */
  private plain(node: Extract<Node, { t: 'quant' }>): Extract<Node, { t: 'quant' }> {
    const conditions: Node[] = [];
    const decls = node.decls.map(({ names, type, disj, disjType, private: hidden }): Decl => {
      if (hidden) throw new Refusal(`Alloy does not read "private" before the variable "${names[0]}"`);
      let base = type.t === 'mult' && type.q === 'one' ? type.e : type;
      if (base.t === 'mult' || base.t === 'arrow') throw new Refusal(`"${names[0]}" can hold none or several things, and a reading says something of one thing`);
      while (base.t === 'diff') {
        const out = base.r;
        for (const name of names) {
          const x: Node = { t: 'name', name };
          conditions.push(out.t === 'name' && this.types.isVariable(out.name) ? { t: 'cmp', op: '!=', l: x, r: out } : { t: 'cmp', op: 'not in', l: x, r: out });
        }
        base = base.l;
      }
      if (base.t !== 'name') {
        const type_ = this.types.typeOf(base);
        for (const name of names) conditions.push({ t: 'cmp', op: 'in', l: { t: 'name', name }, r: base });
        base = { t: 'name', name: type_ };
      }
      while (base.t === 'name' && !this.readings.nouns.has(base.name)) {
        const holder = this.readings.holders.get(base.name);
        if (holder === undefined || holder === base.name) break;
        for (const name of names) conditions.push({ t: 'cmp', op: 'in', l: { t: 'name', name }, r: base });
        base = { t: 'name', name: holder };
      }
      if (disj || disjType) names.forEach((a, i) => names.slice(i + 1).forEach(b => conditions.push({ t: 'cmp', op: '!=', l: { t: 'name', name: a }, r: { t: 'name', name: b } })));
      return { names, type: base };
    });
    if (conditions.length === 0) return { ...node, decls };
    const and = (items: Node[]): Node => (items.length === 1 ? (items[0] as Node) : { t: 'and', items: items.flatMap(i => (i.t === 'and' ? i.items : [i])) });
    const { body } = node;
    if (node.q !== 'all') return { ...node, decls, body: and([...conditions, body]) };
    return { ...node, decls, body: body.t === 'implies' ? { t: 'implies', l: and([...conditions, body.l]), r: body.r } : { t: 'implies', l: and(conditions), r: body } };
  }

  private quantified(quant: Extract<Node, { t: 'quant' }>): Sentence {
    const split = this.overEach(quant) ?? this.overOne(quant);
    if (split !== undefined) return this.sentence(split);
    const node = this.plain(quant);
    if (node.q === 'sum') throw new Refusal('"sum" as a quantifier is not supported');
    const vars: Var[] = [];
    const more: [string, Term][] = [];
    for (const { names, type } of node.decls)
      for (const name of names) {
        const v = this.fresh(nameOf(type, 'the type of a quantified variable'));
        vars.push(v);
        more.push([name, { t: 'var', v }]);
      }
    return { t: 'quant', q: node.q as 'all', vars, body: this.within(more).sentence(node.body) };
  }

  /** A quantifier over `none` or over a variable, as the formula it comes to. */
  private overOne(node: Extract<Node, { t: 'quant' }>): Node | undefined {
    const [decl, ...rest] = node.decls;
    if (decl === undefined || decl.names.length !== 1) return undefined;
    const type = this.types.shape(decl.type);
    if (type.t !== 'name') return undefined;
    if (type.name === 'none') return ['all', 'no', 'lone'].includes(node.q) ? { t: 'true' } : FALSE;
    if (!this.bound.has(type.name)) return undefined;
    const body = substitute(node.body, decl.names[0] as string, type, `the variable "${decl.names[0]}" of a quantifier`);
    if (node.q === 'lone') return { t: 'true' };
    if (rest.length > 0) return node.q === 'all' || node.q === 'some' ? { ...node, decls: rest, body } : undefined;
    return node.q === 'no' ? { t: 'not', f: body } : body;
  }

  /** A quantifier over a union of signatures that no one type holds, as the same quantifier over each. */
  private overEach(node: Extract<Node, { t: 'quant' }>): Node | undefined {
    if (node.q !== 'all' && node.q !== 'some' && node.q !== 'no') return undefined;
    const at = node.decls.findIndex(d => d.names.length === 1 && this.types.shape(d.type).t === 'union' && this.types.columns(d.type) === undefined);
    if (at === -1) return undefined;
    const decl = node.decls[at] as Extract<Node, { t: 'quant' }>['decls'][number];
    const union = this.types.shape(decl.type) as Extract<Node, { t: 'union' }>;
    const over = (type: Node): Node => ({ ...node, decls: node.decls.map((d, i) => (i === at ? { ...d, type } : d)) });
    return { t: node.q === 'some' ? 'or' : 'and', items: [over(union.l), over(union.r)] };
  }

  // ---- what always or never holds ----

  private holdsNever(node: Node): boolean {
    if (node.t === 'not') return this.holdsAlways(node.f);
    if (node.t === 'and') return node.items.some(item => this.holdsNever(item));
    if (node.t === 'or') return node.items.every(item => this.holdsNever(item));
    const f = this.constant(node);
    return f !== undefined && f !== node && this.holdsNever(f);
  }

  private constant(node: Node): Node | undefined {
    try {
      const f = node.t === 'cmp' ? this.lowered(node, false) : node.t === 'mult' && node.q !== 'set' && node.q !== 'seq' ? this.counted(node, false) : undefined;
      return f !== undefined && (f.t === 'true' || (f.t === 'not' && f.f.t === 'true') || (f.t === 'not' && f.f.t === 'not' && f.f.f.t === 'true')) ? f : undefined;
    } catch (error) {
      asRefusal(error);
      return undefined;
    }
  }

  holdsAlways(node: Node, seen: Set<string> = new Set()): boolean {
    if (node.t === 'true') return true;
    if (node.t === 'not') return this.holdsNever(node.f);
    const f = this.constant(node);
    if (f !== undefined) return this.holdsAlways(f, seen);
    if (node.t === 'and') return node.items.every(item => this.holdsAlways(item, seen));
    if (node.t === 'or') return node.items.some(item => this.holdsAlways(item, seen));
    const call = node.t === 'call' ? node : node.t === 'name' ? { name: node.name } : this.asCall(node);
    if (call === undefined || this.readings.atoms.has(call.name) || seen.has(call.name)) return false;
    const definition = this.readings.definitions.get(call.name) ?? this.readings.macros.get(call.name);
    return definition !== undefined && this.holdsAlways(definition.body, new Set([...seen, call.name]));
  }

  // ---- formulas ----

  /** A formula as the IR. */
  sentence(node: Node): Sentence {
    const key = print(node);
    if (this.lowering.has(key)) throw new Error(`naturalloy rewrote "${key}" back to itself while lowering it`);
    if (this.depth.n >= DEPTH) throw new Error(`naturalloy lowered "${key}" through more than ${DEPTH} formulas at once`);
    this.lowering.add(key);
    this.depth.n++;
    try {
      return this.lowered_(node);
    } finally {
      this.lowering.delete(key);
      this.depth.n--;
    }
  }

  private lowered_(node: Node): Sentence {
    switch (node.t) {
      case 'name':
        return this.call({ t: 'call', name: node.name, args: [] }, false);
      case 'cmp':
        return this.comparison(node, false);
      case 'call':
        return this.call(node, false);
      case 'mult':
        return this.mult(node, false);
      case 'not':
        return this.negation(node.f);
      case 'true':
        throw new Refusal(ALWAYS);
      case 'and':
      case 'or':
        return this.junction(node);
      case 'implies':
        return { t: 'rule', when: this.sentence(node.l), then: this.sentence(node.r) };
      case 'ite':
        return { t: 'rule', when: this.sentence(node.c), then: this.sentence(node.a), otherwise: this.sentence(node.b) };
      case 'iff':
        return { t: 'iff', l: this.sentence(node.l), r: this.sentence(node.r) };
      case 'let':
        return this.sentence(expanded(node));
      case 'join':
      case 'box': {
        const call = this.asCall(node);
        if (call === undefined) throw new Refusal(`a ${CONSTRUCTS[node.t]} cannot stand as a statement`);
        return this.call(call, false);
      }
      case 'quant':
        return this.quantified(node);
      case 'unary':
        return { t: 'moment', op: node.op as Moment, body: this.sentence(node.f) };
      case 'binary': {
        const sides = node.op === ';' && node.r.t === 'binary' && node.r.op === ';' ? [node.l] : [node.l, node.r];
        if (sides.some(holdsBinary)) throw new Refusal(`"${node.op}" with a side that holds "until", "since", "releases", "triggered" or ";" reads in more than one way`);
        const { l: a, r: b } = node;
        switch (node.op) {
          case 'until':
          case 'since':
            return { t: node.op, a: this.sentence(a), b: this.sentence(b) };
          case 'releases':
            return this.sentence({ t: 'or', items: [{ t: 'unary', op: 'always', f: b }, { t: 'binary', op: 'until', l: b, r: { t: 'and', items: [a, b] } }] });
          case 'triggered':
            return this.sentence({ t: 'or', items: [{ t: 'unary', op: 'historically', f: b }, { t: 'binary', op: 'since', l: b, r: { t: 'and', items: [a, b] } }] });
          case ';': {
            const said = this.sentence({ t: 'and', items: [a, { t: 'unary', op: 'after', f: b }] });
            return said.t === 'and' ? { ...said, form: 'sequence' } : said;
          }
        }
        break;
      }
      default:
        throw new Refusal(`a ${node.t} cannot stand as a statement`);
    }
    throw new Refusal(`a ${print(node)} cannot stand as a statement`);
  }

  private junction(node: Extract<Node, { t: 'and' | 'or' }>): Sentence {
    const and = node.t === 'and';
    if (node.items.some(item => (and ? this.holdsNever(item) : this.holdsAlways(item)))) throw new Refusal(and ? NEVER : ALWAYS);
    const items = node.items.filter(item => !(and ? this.holdsAlways(item) : this.holdsNever(item)));
    if (items.length === 0) throw new Refusal(and ? ALWAYS : NEVER);
    if (items.length === 1) return this.sentence(items[0] as Node);
    return { t: node.t, items: items.map(item => this.sentence(item)) };
  }

  /** A formula said as a negation: a reading takes its negative words, and anything else stands under "not". */
  private negation(node: Node): Sentence {
    switch (node.t) {
      case 'not':
        return this.sentence(node.f);
      case 'true':
        throw new Refusal(NEVER);
      case 'cmp':
        return this.comparison(node, true);
      case 'call':
        return this.call(node, true);
      case 'name':
        return this.call({ t: 'call', name: node.name, args: [] }, true);
      case 'mult':
        return this.mult(node, true);
      case 'let':
        return this.negation(expanded(node));
      case 'join':
      case 'box': {
        const call = this.asCall(node);
        if (call === undefined) throw new Refusal(`a ${CONSTRUCTS[node.t]} cannot stand as a statement`);
        return this.call(call, true);
      }
      // A binary temporal operator has no dual to move into: it is negated whole.
      case 'binary':
        return { t: 'not', body: this.sentence(node), form: 'whole' };
      default:
        return { t: 'not', body: this.sentence(node) };
    }
  }

  // ---- definitions ----

  /** What a predicate names, exactly when its body holds, for every value of its parameters. */
  definition(name: string, params: { name: string; type: string }[], body: Node): Sentence {
    const vars = params.map(param => this.fresh(param.type));
    const inside = this.within(params.map((param, i): [string, Term] => [param.name, { t: 'var', v: vars[i] as Var }]));
    const head = this.reading(name, 'call', vars.map(v => ({ t: 'var', v }) as Term), false);
    return { t: 'define', head, params: vars, body: inside.holdsAlways(body) ? { t: 'and', items: [] } : inside.sentence(body) };
  }

  /** What a function's value holds, exactly when its body does, for every value of its parameters and every member of the type of its value. */
  fn(name: string, params: { name: string; type: string }[], result: string, body: Node): Sentence {
    const vars = params.map(param => this.fresh(param.type));
    const value = this.fresh(result);
    const m: Node = { t: 'name', name: '\u0000value' };
    const inside = this.within([...params.map((param, i): [string, Term] => [param.name, { t: 'var', v: vars[i] as Var }]), ['\u0000value', { t: 'var', v: value }]]);
    const head = this.reading(name, 'fun', [...vars, value].map(v => ({ t: 'var', v }) as Term), false);
    return { t: 'define', head, params: [...vars, value], body: inside.holdsAlways(inside.inside([m], body)) ? { t: 'and', items: [] } : inside.sentence(inside.inside([m], body)) };
  }
}
