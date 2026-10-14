/**
 * The tests and the comments of a TypeScript file, read from its syntax.
 *
 * A test is a call that a runner declares a test with: one of its calls, with
 * any of its modifiers between, such as `it.fails('title', fn)`,
 * `it.each(table)('title', fn)` or `` it.each`table`('title', fn) ``, and a
 * function after the first argument. Text that only looks like one, inside a
 * string or a comment, is no test: the parser sees it for what it is.
 *
 * A call is a runner's only when its name leads to the runner: imported from
 * one of the runner's packages, or a global where the runner provides globals.
 * A declaration whose JSDoc holds the runner marker `@runner`, or
 * `@runner fails`, is a runner as well, where a call's name leads to it: in
 * the scope of the call, or through relative imports and re-exports.
 */
import { Parser, type Comment } from 'acorn';
import { tsPlugin } from '@sveltejs/acorn-typescript';
import { analyze, type Scope } from 'periscopic';
import type { Runner } from './runners.ts';

/** One test: its JSDoc, its title, whether it is an expected failure, and where its call starts. */
export interface TestBlock {
  /** The text of the JSDoc right above the test, between `/**` and `*\/`; empty when it has none. */
  doc: string;
  /** Where the JSDoc starts and ends, when the test has one. */
  span?: [number, number];
  /** The title, or the source text of the first argument when the title is no literal, as in `test(row.name, fn)`. */
  title: string;
  /** Whether the test is an expected failure: through a failure modifier, or a call of a declaration marked `@runner fails`. */
  fails: boolean;
  at: number;
}

/** A comment: its text, without the marks that open and close it, and where it starts and ends. */
export interface SourceComment {
  value: string;
  start: number;
  end: number;
}

/** A node of the syntax tree, as far as this module reads it. */
export interface Node {
  type: string;
  start: number;
  end: number;
  [key: string]: unknown;
}

/** What an exported name of a module leads to: a marked declaration, an import to follow, or nothing. */
export type Export =
  | { kind: 'marked'; fails: boolean }
  | { kind: 'import'; source: string; imported: string }
  | { kind: 'none' };

/** What a module exports, as far as finding a marked declaration needs: each name, and the modules `export *` passes on. */
export interface Exports {
  names: Map<string, Export>;
  stars: string[];
}

/** A parsed file. */
export interface Syntax {
  src: string;
  program: Node;
  comments: SourceComment[];
  jsdocs: SourceComment[];
  /** The declarations its runner markers mark, with whether their calls are expected failures. */
  marked: Map<Node, boolean>;
  /** The values of the marked declarations, which hold no test. */
  bodies: Set<Node>;
  /** Each marker that has a word other than `fails`, or is above no declaration, with what is wrong. */
  problems: { at: number; message: string }[];
  scopes: { map: WeakMap<object, Scope>; scope: Scope };
  /** The module each import specifier imports from. */
  sources: Map<Node, string>;
  exports: Exports;
}

/** What a call's name leads to: the runners whose modifiers it takes, and whether it is a marked declaration. */
export interface Resolution {
  runners: Runner[];
  /** Set when the name leads to a marked declaration: whether its calls are expected failures. */
  marked?: boolean;
  /** The members of the call after the one it names, which must be modifiers: all of them, unless the name is a namespace. */
  members: string[];
}

/** The file a relative import resolves to from `file`, with what it exports; undefined when it resolves to no file the checker reads. */
export type ImportLookup = (file: string, source: string) => { file: string; exports: Exports } | undefined;

const TS = Parser.extend(tsPlugin() as never);
const TSX = Parser.extend(tsPlugin({ jsx: true }) as never);

const isNode = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && typeof (value as Node).type === 'string';

/** Each node a node holds. */
function children(node: Node): Node[] {
  const found: Node[] = [];
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const item of value) if (isNode(item)) found.push(item);
    } else if (isNode(value)) {
      found.push(value);
    }
  }
  return found;
}

const nameOf = (node: Node): string => (node.type === 'Identifier' ? (node.name as string) : String(node.value));

/** The name an import specifier imports: `default` for a default import, `*` for a namespace. */
const importedName = (specifier: Node): string =>
  specifier.type === 'ImportDefaultSpecifier'
    ? 'default'
    : specifier.type === 'ImportNamespaceSpecifier'
      ? '*'
      : nameOf(specifier.imported as Node);

/** The JSDoc that ends right above `start`, with only white space between: the last that ends before it, by a binary search. */
function jsdocAbove(syntax: Syntax, start: number): SourceComment | undefined {
  const { jsdocs, src } = syntax;
  let low = 0;
  let high = jsdocs.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if ((jsdocs[mid] as SourceComment).end <= start) low = mid + 1;
    else high = mid;
  }
  const found = jsdocs[low - 1];
  return found && /^\s*$/.test(src.slice(found.end, start)) ? found : undefined;
}

/** The declaration a statement makes, unwrapped from an `export`, with the name it declares: a function, an overload of one, or a name with a value. */
function declarationOf(statement: Node): { node: Node; name: string } | undefined {
  const exported = statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration';
  const node = exported && isNode(statement.declaration) ? statement.declaration : statement;
  if ((node.type === 'FunctionDeclaration' || node.type === 'TSDeclareFunction') && isNode(node.id)) {
    return { node, name: node.id.name as string };
  }
  if (node.type === 'VariableDeclaration') {
    const [declarator] = node.declarations as Node[];
    if (isNode(declarator?.id) && declarator.id.type === 'Identifier' && isNode(declarator.init)) {
      return { node, name: declarator.id.name as string };
    }
  }
  return undefined;
}

/**
 * Each line of a JSDoc that is a runner marker, with its word and where it is.
 * A marker is a block tag, so it opens its line; a line in an `@example`
 * section or a fenced block shows code to a reader and is none.
 */
function markerLines(jsdoc: SourceComment): { word: string; at: number }[] {
  const found: { word: string; at: number }[] = [];
  let example = false;
  let fenced = false;
  let offset = jsdoc.start + 2;
  for (const raw of jsdoc.value.split('\n')) {
    const line = raw.replace(/^[ \t]*\*?[ \t]*/, '');
    if (line.startsWith('```')) fenced = !fenced;
    // A marker does not end an example: it is the code the example shows.
    else if (!fenced && line.startsWith('@') && !/^@runner\b/.test(line)) example = /^@example\b/.test(line);
    const marker = /^@runner\b(.*)$/.exec(line);
    if (marker && !fenced && !example) {
      found.push({ word: (marker[1] as string).replace(/\*\/?\s*$/, '').trim(), at: offset + raw.indexOf('@runner') });
    }
    offset += raw.length + 1;
  }
  return found;
}

/** The statements of a program at any depth, by where they start. */
function statementsOf(program: Node): Map<number, Node> {
  const statements = new Map<number, Node>();
  const visit = (node: Node): void => {
    if (/Declaration$|Statement$/.test(node.type) && !statements.has(node.start)) statements.set(node.start, node);
    for (const child of children(node)) visit(child);
  };
  visit(program);
  return statements;
}

/** Mark a declaration, and keep its value out of the search for tests. */
function mark(syntax: Syntax, node: Node, fails: boolean): void {
  syntax.marked.set(node, fails);
  if (node.type === 'FunctionDeclaration') syntax.bodies.add(node);
  else for (const declarator of node.declarations as Node[]) if (isNode(declarator.init)) syntax.bodies.add(declarator.init);
}

/** The runner markers of a file: each must be `@runner` or `@runner fails`, right above a declaration of a name with a value. */
function readMarkers(syntax: Syntax): void {
  if (!syntax.jsdocs.some(jsdoc => jsdoc.value.includes('@runner'))) return;
  const statements = statementsOf(syntax.program);
  const overloads: { name: string; fails: boolean }[] = [];
  for (const jsdoc of syntax.jsdocs) {
    for (const { word, at } of markerLines(jsdoc)) {
      if (word !== '' && word !== 'fails') {
        syntax.problems.push({ at, message: `the runner marker "@runner ${word}" takes no word but "fails"` });
        continue;
      }
      let next = jsdoc.end;
      while (/\s/.test(syntax.src[next] ?? '')) next++;
      const statement = statements.get(next);
      const declared = statement && declarationOf(statement);
      if (declared === undefined) {
        syntax.problems.push({ at, message: 'the runner marker is above no declaration of a name with a value' });
        continue;
      }
      // An overload has no body: the marker marks the function it declares.
      if (declared.node.type === 'TSDeclareFunction') overloads.push({ name: declared.name, fails: word === 'fails' });
      else mark(syntax, declared.node, word === 'fails');
    }
  }
  for (const { name, fails } of overloads) {
    for (const statement of statements.values()) {
      const declared = declarationOf(statement);
      if (declared?.node.type === 'FunctionDeclaration' && declared.name === name) mark(syntax, declared.node, fails);
    }
  }
}

/** The module each import specifier names, and what the module exports. */
function readModule(syntax: Syntax): void {
  const { names, stars } = syntax.exports;
  const top = syntax.scopes.scope;
  for (const statement of syntax.program.body as Node[]) {
    if (statement.type !== 'ImportDeclaration') continue;
    for (const specifier of statement.specifiers as Node[]) {
      syntax.sources.set(specifier, (statement.source as Node).value as string);
      // periscopic 4 declares default and named imports, but no namespace.
      if (specifier.type === 'ImportNamespaceSpecifier') top.declarations.set((specifier.local as Node).name as string, specifier as never);
    }
  }
  /** What a name of the module's top scope leads to. */
  const local = (name: string): Export => {
    const declaration = top.declarations.get(name) as Node | undefined;
    if (declaration === undefined) return { kind: 'none' };
    const fails = syntax.marked.get(declaration);
    if (fails !== undefined) return { kind: 'marked', fails };
    const source = syntax.sources.get(declaration);
    return source === undefined ? { kind: 'none' } : { kind: 'import', source, imported: importedName(declaration) };
  };
  const declared = (node: Node): Export => {
    const fails = syntax.marked.get(node);
    return fails === undefined ? { kind: 'none' } : { kind: 'marked', fails };
  };
  for (const statement of syntax.program.body as Node[]) {
    if (statement.type === 'ExportAllDeclaration' && statement.exported == null) {
      stars.push((statement.source as Node).value as string);
    } else if (statement.type === 'ExportNamedDeclaration') {
      const own = isNode(statement.declaration) ? declarationOf(statement) : undefined;
      if (own) names.set(own.name, declared(own.node));
      for (const specifier of (statement.specifiers as Node[] | undefined) ?? []) {
        const inner = nameOf(specifier.local as Node);
        names.set(
          nameOf(specifier.exported as Node),
          isNode(statement.source) ? { kind: 'import', source: statement.source.value as string, imported: inner } : local(inner)
        );
      }
    } else if (statement.type === 'ExportDefaultDeclaration' && isNode(statement.declaration)) {
      const inner = statement.declaration;
      if (inner.type === 'Identifier') names.set('default', local(inner.name as string));
      else if (inner.type === 'FunctionDeclaration') names.set('default', declared(inner));
    }
  }
}

/**
 * Parse `src` as TypeScript, with JSX when `jsx` is set, and read its runner
 * markers, imports and exports. Throws a `SyntaxError` when it does not parse.
 */
export function parseSource(src: string, jsx: boolean): Syntax {
  const raw: Comment[] = [];
  const program = (jsx ? TSX : TS).parse(src, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    onComment: raw
  }) as unknown as Node;
  const comments = raw.map(({ value, start, end }) => ({ value, start, end }));
  const jsdocs = comments.filter((c, i) => raw[i]?.type === 'Block' && c.value.startsWith('*'));
  const { map, scope } = analyze(program as never);
  const syntax: Syntax = {
    src,
    program,
    comments,
    jsdocs,
    marked: new Map(),
    bodies: new Set(),
    problems: [],
    scopes: { map: map as WeakMap<object, Scope>, scope },
    sources: new Map(),
    exports: { names: new Map(), stars: [] }
  };
  readMarkers(syntax);
  readModule(syntax);
  return syntax;
}

/** The identifier a callee starts with, as `it` in `it.each(table)`, and the members between. */
function chainOf(callee: Node): { root: Node; members: string[] } | undefined {
  switch (callee.type) {
    case 'Identifier':
      return { root: callee, members: [] };
    case 'MemberExpression': {
      const property = callee.property as Node;
      if (callee.computed || property.type !== 'Identifier') return undefined;
      const chain = chainOf(callee.object as Node);
      return chain && { root: chain.root, members: [...chain.members, property.name as string] };
    }
    case 'CallExpression':
      return chainOf(callee.callee as Node);
    case 'TaggedTemplateExpression':
      return chainOf(callee.tag as Node);
    default:
      return undefined;
  }
}

/** Whether a call has a body: a function, or a name that may hold one, after its first argument. */
const hasBody = (args: Node[]): boolean =>
  args.slice(1).some(a => a.type === 'ArrowFunctionExpression' || a.type === 'FunctionExpression' || a.type === 'Identifier');

/** The title of a test, from its first argument. */
function titleOf(argument: Node, src: string): string {
  if (argument.type === 'Literal' && typeof argument.value === 'string') return argument.value;
  if (argument.type === 'TemplateLiteral') return src.slice(argument.start + 1, argument.end - 1);
  return src.slice(argument.start, argument.end);
}

/** What an imported name leads to: a runner of the package, by a call or its default, or a marked declaration that a relative path exports. */
function resolveImport(
  file: string,
  source: string,
  imported: string,
  runners: Runner[],
  lookup: ImportLookup,
  seen: Set<string>
): Omit<Resolution, 'members'> | undefined {
  const from = runners.filter(
    r => r.from.includes(source) && (imported === 'default' ? r.default !== undefined : r.calls.includes(imported))
  );
  if (from.length > 0) return { runners: from };
  if (!source.startsWith('.')) return undefined;
  const found = lookup(file, source);
  if (found === undefined || seen.has(`${found.file}\0${imported}`)) return undefined;
  seen.add(`${found.file}\0${imported}`);
  const target = found.exports.names.get(imported);
  if (target?.kind === 'marked') return { runners, marked: target.fails };
  if (target?.kind === 'import') return resolveImport(found.file, target.source, target.imported, runners, lookup, seen);
  if (target !== undefined) return undefined;
  for (const star of found.exports.stars) {
    const through = resolveImport(found.file, star, imported, runners, lookup, seen);
    if (through !== undefined) return through;
  }
  return undefined;
}

/**
 * What a call's chain leads to in a module: the runners whose package the
 * module imports its name from, a marked declaration it is or imports, or the
 * runners that provide it as a global. The name of a namespace leads through
 * its first member.
 */
function resolveName(
  syntax: Syntax,
  file: string,
  chain: { root: Node; members: string[] },
  scope: Scope,
  runners: Runner[],
  lookup: ImportLookup
): Resolution | undefined {
  const name = chain.root.name as string;
  const { members } = chain;
  const owner = scope.find_owner(name);
  if (owner === null) {
    const global = runners.filter(r => r.globals && r.calls.includes(name));
    return global.length > 0 ? { runners: global, members } : undefined;
  }
  const declaration = owner.declarations.get(name) as Node | undefined;
  if (declaration === undefined) return undefined;
  const source = syntax.sources.get(declaration);
  if (source !== undefined) {
    const imported = importedName(declaration);
    const [first, ...rest] = members;
    if (imported === '*') {
      const found = first === undefined ? undefined : resolveImport(file, source, first, runners, lookup, new Set());
      return found && { ...found, members: rest };
    }
    const found = resolveImport(file, source, imported, runners, lookup, new Set());
    return found && { ...found, members };
  }
  // A parameter's declaration is its function: the name must be the function's own.
  if (declaration.type === 'FunctionDeclaration' && nameOf(declaration.id as Node) !== name) return undefined;
  const fails = syntax.marked.get(declaration);
  return fails === undefined ? undefined : { runners, marked: fails, members };
}

/**
 * The tests of a parsed file. A call is a test when its name leads to a runner
 * of `runners`, every member between is a modifier of that runner, a function
 * follows its first argument, and it sits inside no other test and no marked
 * declaration.
 */
export function testsOf(syntax: Syntax, file: string, runners: Runner[], lookup: ImportLookup): TestBlock[] {
  const { src, program, bodies, scopes } = syntax;
  const tests: TestBlock[] = [];
  const visit = (node: Node, scope: Scope): void => {
    // The test is declared where a marked declaration is called, not in its value.
    if (bodies.has(node)) return;
    const inner = scopes.map.get(node) ?? scope;
    if (node.type === 'CallExpression') {
      const args = node.arguments as Node[];
      const chain = chainOf(node.callee as Node);
      const resolution =
        chain && hasBody(args) ? resolveName(syntax, file, chain, scope, runners, lookup) : undefined;
      if (resolution) {
        const modifiers = new Set(resolution.runners.flatMap(r => r.modifiers));
        const failing = new Set(resolution.runners.flatMap(r => r.fails));
        if (resolution.members.every(m => modifiers.has(m) || failing.has(m))) {
          const jsdoc = jsdocAbove(syntax, node.start);
          tests.push({
            doc: jsdoc ? jsdoc.value.slice(1) : '',
            span: jsdoc && [jsdoc.start, jsdoc.end],
            title: titleOf(args[0] as Node, src),
            fails: resolution.marked === true || resolution.members.some(m => failing.has(m)),
            at: node.start
          });
          // The callee is the test's own chain, as in `it.each(table)`, and a
          // call in its body is no test: the runners refuse a test declared there.
          return;
        }
      }
    }
    for (const child of children(node)) visit(child, inner);
  };
  visit(program, scopes.scope);
  return tests;
}
