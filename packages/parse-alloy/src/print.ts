/**
 * A tree written back as Alloy. Every group is in parentheses, so the text
 * shows the grouping the parser read, and the analyzer reads it the same way
 * whatever the precedence of its operators.
 */
import type { Decl, Node } from './parse.ts';

const COMPARISON: Record<string, string> = { 'not in': '!in' };
const ARITHMETIC: Record<string, string> = { add: 'fun/add', sub: 'fun/sub', mul: 'fun/mul', div: 'fun/div', rem: 'fun/rem' };

/** A declaration: `disj a, b: set T`. */
export function printDecl(decl: Decl): string {
  const head = `${decl.var ? 'var ' : ''}${decl.private ? 'private ' : ''}${decl.disj ? 'disj ' : ''}${decl.names.join(', ')}`;
  if (decl.defined) return `${head} = ${print(decl.type)}`;
  // A multiplicity of the type stays outside the parentheses, where a declaration expects it.
  const type = decl.type.t === 'mult' ? `${decl.type.q} ${print(decl.type.e)}` : print(decl.type);
  return `${head}: ${decl.disjType ? 'disj ' : ''}${type}`;
}

/** The formula or expression of a tree, with every group in parentheses. */
export function print(node: Node): string {
  const p = print;
  switch (node.t) {
    case 'name':
      return node.name;
    case 'number':
      return node.value < 0 ? `(${node.value})` : String(node.value);
    case 'string':
      return JSON.stringify(node.value);
    case 'true':
      return '{}';
    case 'prime':
      return `(${p(node.e)})'`;
    case 'transpose':
      return `(~${p(node.e)})`;
    case 'closure':
      return `(^${p(node.e)})`;
    case 'rclosure':
      return `(*${p(node.e)})`;
    case 'join':
      return `(${p(node.l)}.${p(node.r)})`;
    case 'call':
      return `(${node.name}[${node.args.map(p).join(', ')}])`;
    case 'box':
      return `(${p(node.e)}[${node.args.map(p).join(', ')}])`;
    case 'arrow':
      return `(${p(node.l)} ${node.lm ?? ''}->${node.rm ?? ''} ${p(node.r)})`;
    case 'domain':
      return `(${p(node.l)} <: ${p(node.r)})`;
    case 'range':
      return `(${p(node.l)} :> ${p(node.r)})`;
    case 'inter':
      return `(${p(node.l)} & ${p(node.r)})`;
    case 'override':
      return `(${p(node.l)} ++ ${p(node.r)})`;
    case 'union':
      return `(${p(node.l)} + ${p(node.r)})`;
    case 'diff':
      return `(${p(node.l)} - ${p(node.r)})`;
    case 'arith':
      return `(${p(node.l)} ${ARITHMETIC[node.op] ?? node.op} ${p(node.r)})`;
    case 'card':
      return `(#${p(node.e)})`;
    case 'cast':
      return `int[${p(node.e)}]`;
    case 'cmp':
      return `(${p(node.l)} ${COMPARISON[node.op] ?? node.op} ${p(node.r)})`;
    case 'mult':
      return `(${node.q} ${p(node.e)})`;
    case 'not':
      return `(!${p(node.f)})`;
    case 'and':
      return `(${node.items.map(p).join(' && ')})`;
    case 'or':
      return `(${node.items.map(p).join(' || ')})`;
    case 'implies':
      return `(${p(node.l)} => ${p(node.r)})`;
    case 'ite':
      return `(${p(node.c)} => ${p(node.a)} else ${p(node.b)})`;
    case 'iff':
      return `(${p(node.l)} <=> ${p(node.r)})`;
    case 'unary':
      return `(${node.op} ${p(node.f)})`;
    case 'binary':
      return `(${p(node.l)} ${node.op} ${p(node.r)})`;
    case 'quant':
      return `(${node.q} ${node.decls.map(printDecl).join(', ')} | ${p(node.body)})`;
    case 'let':
      return `(let ${node.binds.map(b => `${b.name} = ${p(b.value)}`).join(', ')} | ${p(node.body)})`;
    case 'comprehension':
      return `{${node.decls.map(printDecl).join(', ')} | ${p(node.body)}}`;
  }
}
