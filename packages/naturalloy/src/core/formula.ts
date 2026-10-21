/**
 * Alloy formulas as the lowering handles them: read from their source, named in a refusal as a reader writes them, and
 * with a value put in the place of a name.
 */
import { AlloyParseError, type Node, parseFormula, print } from '@bigmistqke/parse-alloy';
import { Refusal, unqualified } from '../readings.ts';

/** What a refusal says of an arrow with multiplicities. */
export const MULTIPLIED = 'says how many each side relates, and no reading says that';

/** What a reader calls each construct, for a refusal to name it. */
export const CONSTRUCTS: Record<Node['t'], string> = {
  name: 'name', number: 'number', string: 'string', true: 'true formula', prime: 'primed expression', transpose: 'transpose', closure: 'closure', rclosure: 'reflexive closure',
  join: 'navigation', call: 'call', box: 'box join', arrow: 'arrow', domain: 'domain restriction', range: 'range restriction', inter: 'intersection', override: 'override',
  union: 'union', diff: 'difference', arith: 'integer operation', card: 'count', cast: 'cast to an integer', cmp: 'comparison', mult: 'multiplicity', not: 'negation', and: 'conjunction',
  or: 'disjunction', implies: 'rule', ite: 'rule with an else', iff: 'equivalence', unary: 'temporal operator', binary: 'temporal operator', quant: 'quantifier', let: 'let', comprehension: 'set comprehension'
};

export function nameOf(node: Node, what: string): string {
  if (node.t !== 'name') throw new Refusal(`${what} must be a name, not a ${CONSTRUCTS[node.t]}`);
  return node.name;
}

/** An expression as a reader writes it, for a refusal to name: `c.(on + reached)`. */
export function shown(e: Node): string {
  let text = print(e);
  for (let before = ''; before !== text; ) [before, text] = [text, text.replace(/\(([\w.']+)\)/g, '$1')];
  return /^\((.*)\)$/.test(text) && balancedParens(text.slice(1, -1)) ? text.slice(1, -1) : text;
}

function balancedParens(text: string): boolean {
  let depth = 0;
  for (const c of text) if ((depth += c === '(' ? 1 : c === ')' ? -1 : 0) < 0) return false;
  return depth === 0;
}

/** The names of the predicates and functions a formula calls. */
export function callsIn(node: unknown, found = new Set<string>()): Set<string> {
  if (Array.isArray(node)) for (const n of node) callsIn(n, found);
  else if (node !== null && typeof node === 'object') {
    const o = node as Record<string, unknown>;
    if (o.t === 'call') found.add(o.name as string);
    for (const [key, value] of Object.entries(o)) if (key !== 'span') callsIn(value, found);
  }
  return found;
}

/** The names an expression uses. */
function namesIn(node: unknown, found = new Set<string>()): Set<string> {
  if (Array.isArray(node)) for (const n of node) namesIn(n, found);
  else if (node !== null && typeof node === 'object') {
    const o = node as Record<string, unknown>;
    if (o.t === 'name') found.add(o.name as string);
    else for (const [key, value] of Object.entries(o)) if (key !== 'span') namesIn(value, found);
  }
  return found;
}

/**
 * A formula with `value` in the place of the name `name`, for `of`: the `let` or the parameter that names it. A
 * quantifier or a `let` that declares the name again hides it from there on; one that declares a name the value uses,
 * where the name is put, would capture it, and is refused.
 */
export function substitute(node: Node, name: string, value: Node, of: string): Node {
  const refusal = (captured: string): Error => new Refusal(`the body of ${of} declares "${captured}", which its value names`);
  const free = namesIn(value);
  const walk = (n: unknown): unknown => {
    if (Array.isArray(n)) return n.map(walk);
    if (n === null || typeof n !== 'object') return n;
    const o = n as Node;
    if (o.t === 'name') return o.name === name ? value : o;
    if (o.t === 'quant' || o.t === 'comprehension') {
      const declared = o.decls.flatMap(d => d.names);
      const decls = o.decls.map(d => ({ ...d, type: walk(d.type) as Node }));
      if (declared.includes(name)) return { ...o, decls };
      const captured = declared.find(x => free.has(x));
      if (captured !== undefined && namesIn(o.body).has(name)) throw refusal(captured);
      return { ...o, decls, body: walk(o.body) as Node };
    }
    if (o.t === 'let') {
      const binds = o.binds.map(b => ({ ...b, value: walk(b.value) as Node }));
      if (o.binds.some(b => b.name === name)) return { ...o, binds };
      const captured = o.binds.find(b => free.has(b.name));
      if (captured !== undefined && namesIn(o.body).has(name)) throw refusal(captured.name);
      return { ...o, binds, body: walk(o.body) as Node };
    }
    return Object.fromEntries(Object.entries(o).map(([key, v]) => [key, key === 'span' ? v : walk(v)]));
  };
  return walk(node) as Node;
}

/** The body of a `let` with each value in the place of its name. */
export function expanded(node: Extract<Node, { t: 'let' }>): Node {
  return node.binds.reduceRight((body, bind) => substitute(body, bind.name, bind.value, `the "let" of "${bind.name}"`), node.body);
}

/** Whether a formula holds `until`, `since`, `releases`, `triggered` or `;` anywhere in it. */
export function holdsBinary(node: Node): boolean {
  switch (node.t) {
    case 'binary':
      return true;
    case 'not':
    case 'unary':
      return holdsBinary(node.f);
    case 'and':
    case 'or':
      return node.items.some(holdsBinary);
    case 'implies':
    case 'iff':
      return holdsBinary(node.l) || holdsBinary(node.r);
    case 'ite':
      return holdsBinary(node.c) || holdsBinary(node.a) || holdsBinary(node.b);
    case 'quant':
    case 'let':
      return holdsBinary(node.body);
    default:
      return false;
  }
}

/** A formula as the lowering reads it: parsed, with the names of this module plain. */
export function read(source: string): Node {
  try {
    return unqualified(parseFormula(source));
  } catch (error) {
    if (error instanceof AlloyParseError) throw new Refusal(error.message);
    throw error;
  }
}
