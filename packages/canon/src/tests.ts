/**
 * The tests and the comments of a TypeScript file, read from its syntax.
 *
 * A test is a call that a runner of the project declares a test with: one of
 * its calls, with any of its modifiers between, such as `it.fails('title', fn)`,
 * `it.each(table)('title', fn)` or `` it.each`table`('title', fn) ``, and a
 * function after the first argument. Text that only looks like one, inside a
 * string or a comment, is no test: the parser sees it for what it is.
 *
 * A function whose JSDoc holds the runner marker `@runner`, or `@runner fails`,
 * is a call of a runner as well: a call of it is a test, an expected failure
 * with `fails`, and a call in its body is none.
 */
import { Parser, type Comment } from 'acorn';
import { tsPlugin } from '@sveltejs/acorn-typescript';
import type { Vocabulary } from './runners.ts';

/** One test: its JSDoc, its title, the modifiers on its call, and where its call starts. */
export interface TestBlock {
  /** The text of the JSDoc right above the test, between `/**` and `*\/`; empty when it has none. */
  doc: string;
  /** Where the JSDoc starts and ends, when the test has one. */
  span?: [number, number];
  /** The title, or the source text of the first argument when the title is no literal, as in `test(row.name, fn)`. */
  title: string;
  modifiers: string[];
  /** Whether the test is an expected failure: through a failure modifier, or a call of a function marked `@runner fails`. */
  fails: boolean;
  at: number;
}

/** A function a runner marker marks: its name, whether its calls are expected failures, and where the marker is. */
export interface Marker {
  name: string;
  fails: boolean;
  at: number;
}

/** A comment: its text, without the marks that open and close it, and where it starts and ends. */
export interface SourceComment {
  value: string;
  start: number;
  end: number;
}

/** A parsed file: its comments, the functions it marks, and the markers the checker cannot read. */
export interface Syntax {
  src: string;
  program: Node;
  comments: SourceComment[];
  jsdocs: SourceComment[];
  markers: Marker[];
  /** Each marker that has a word other than `fails`, or is above no function, with what is wrong. */
  problems: { at: number; message: string }[];
  /** The functions the markers mark, whose bodies hold no test. */
  marked: Set<unknown>;
}

const TS = Parser.extend(tsPlugin() as never);
const TSX = Parser.extend(tsPlugin({ jsx: true }) as never);

/** A node of the syntax tree, as far as this module reads it. */
export interface Node {
  type: string;
  start: number;
  end: number;
  [key: string]: unknown;
}

const isNode = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && typeof (value as Node).type === 'string';

/**
 * The modifiers of a callee that declares a test, or undefined when it does not:
 * when it starts with no call of a runner, starts with a name the module
 * declares itself, or goes through a member that no runner names.
 */
function modifiersOf(callee: Node, vocabulary: Vocabulary, own: Set<string>): string[] | undefined {
  switch (callee.type) {
    case 'Identifier': {
      const name = callee.name as string;
      const call = vocabulary.calls.has(name) || vocabulary.failCalls.has(name);
      return call && !own.has(name) ? [] : undefined;
    }
    case 'MemberExpression': {
      const property = callee.property as Node;
      if (callee.computed || property.type !== 'Identifier') return undefined;
      const name = property.name as string;
      if (!vocabulary.modifiers.has(name) && !vocabulary.fails.has(name)) return undefined;
      const modifiers = modifiersOf(callee.object as Node, vocabulary, own);
      return modifiers && [...modifiers, name];
    }
    case 'CallExpression':
      return modifiersOf(callee.callee as Node, vocabulary, own);
    case 'TaggedTemplateExpression':
      return modifiersOf(callee.tag as Node, vocabulary, own);
    default:
      return undefined;
  }
}

/** Whether a call has a body: a function, or a name that may hold one, after its first argument. */
const hasBody = (args: Node[]): boolean =>
  args.slice(1).some(a => a.type === 'ArrowFunctionExpression' || a.type === 'FunctionExpression' || a.type === 'Identifier');

/** The names a module declares itself, in a declaration or as a parameter; an import declares none. */
function ownNames(program: Node): Set<string> {
  const names = new Set<string>();
  const add = (node: unknown): void => {
    if (isNode(node) && node.type === 'Identifier') names.add(node.name as string);
  };
  const visit = (node: Node): void => {
    if (node.type === 'VariableDeclarator') add(node.id);
    if (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') add(node.id);
    if (Array.isArray(node.params)) for (const param of node.params) add(param);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const item of value) if (isNode(item)) visit(item);
      } else if (isNode(value)) {
        visit(value);
      }
    }
  };
  visit(program);
  return names;
}

/** The title of a test, from its first argument. */
function titleOf(argument: Node, src: string): string {
  if (argument.type === 'Literal' && typeof argument.value === 'string') return argument.value;
  if (argument.type === 'TemplateLiteral') return src.slice(argument.start + 1, argument.end - 1);
  return src.slice(argument.start, argument.end);
}

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

/**
 * The function a statement declares, with its name: `function f`,
 * `const f = () => …`, `const f = function () {…}`, or an alias such as
 * `const f = it`, exported or not, at any depth.
 */
function declaredFunction(statement: Node): { name: string; fn: Node } | undefined {
  const exported = statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration';
  const node = exported && isNode(statement.declaration) ? statement.declaration : statement;
  if (node.type === 'FunctionDeclaration' && isNode(node.id)) return { name: node.id.name as string, fn: node };
  if (node.type === 'VariableDeclaration') {
    const [declarator] = node.declarations as Node[];
    const init = declarator?.init;
    const callable = ['ArrowFunctionExpression', 'FunctionExpression', 'Identifier', 'MemberExpression'];
    if (isNode(declarator?.id) && declarator.id.type === 'Identifier' && isNode(init) && callable.includes(init.type)) {
      return { name: declarator.id.name as string, fn: init };
    }
  }
  return undefined;
}

/** Every statement of a program, at any depth, by where it starts. */
function statementsOf(program: Node): Map<number, Node> {
  const statements = new Map<number, Node>();
  const visit = (node: Node): void => {
    if (/Declaration$|Statement$/.test(node.type) && !statements.has(node.start)) statements.set(node.start, node);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const item of value) if (isNode(item)) visit(item);
      } else if (isNode(value)) {
        visit(value);
      }
    }
  };
  for (const statement of program.body as Node[]) visit(statement);
  return statements;
}

/** The runner markers of a file: each must be `@runner` or `@runner fails`, right above a function's declaration. */
function readMarkers(syntax: Syntax): void {
  const statements = statementsOf(syntax.program);
  for (const jsdoc of syntax.jsdocs) {
    // A marker is a block tag: `@runner` opens a line of the JSDoc, so prose that names it is none.
    for (const m of jsdoc.value.matchAll(/^[ \t]*\*?[ \t]*(@runner)\b([^\n]*)$/gm)) {
      const at = jsdoc.start + 2 + (m.index ?? 0) + m[0].indexOf('@runner');
      const word = (m[2] as string).replace(/\*\/?$/, '').trim();
      if (word !== '' && word !== 'fails') {
        syntax.problems.push({ at, message: `the runner marker "@runner ${word}" takes no word but "fails"` });
        continue;
      }
      let next = jsdoc.end;
      while (/\s/.test(syntax.src[next] ?? '')) next++;
      const statement = statements.get(next);
      const declared = statement && declaredFunction(statement);
      if (declared === undefined) {
        syntax.problems.push({ at, message: 'the runner marker is above no function' });
        continue;
      }
      syntax.markers.push({ name: declared.name, fails: word === 'fails', at });
      syntax.marked.add(declared.fn);
    }
  }
}

/**
 * Parse `src` as TypeScript, with JSX when `jsx` is set, and read its runner
 * markers. Throws a `SyntaxError` when it does not parse.
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
  const syntax: Syntax = { src, program, comments, jsdocs, markers: [], problems: [], marked: new Set() };
  readMarkers(syntax);
  return syntax;
}

/** The tests of a parsed file that the runners of `vocabulary` declare. */
export function testsOf(syntax: Syntax, vocabulary: Vocabulary): TestBlock[] {
  const { src, program, marked } = syntax;
  const own = ownNames(program);
  // A function the module marks is a runner's call, not a name of its own.
  for (const { name } of syntax.markers) own.delete(name);
  const tests: TestBlock[] = [];
  const visit = (node: Node): void => {
    // The test is declared where a marked function is called, not in its body.
    if (marked.has(node)) return;
    if (node.type === 'CallExpression') {
      const args = node.arguments as Node[];
      const modifiers = modifiersOf(node.callee as Node, vocabulary, own);
      if (modifiers && hasBody(args)) {
        const jsdoc = jsdocAbove(syntax, node.start);
        tests.push({
          doc: jsdoc ? jsdoc.value.slice(1) : '',
          span: jsdoc && [jsdoc.start, jsdoc.end],
          title: titleOf(args[0] as Node, src),
          modifiers,
          fails: modifiers.some(m => vocabulary.fails.has(m)) || vocabulary.failCalls.has(rootOf(node.callee as Node)),
          at: node.start
        });
        // The callee is the test's own chain, as in `it.each(table)`, and a
        // call in its body is no test: the runners refuse a test declared there.
        return;
      }
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const item of value) if (isNode(item)) visit(item);
      } else if (isNode(value)) {
        visit(value);
      }
    }
  };
  visit(program);
  return tests;
}

/** The name a callee starts with, as `it` in `it.each(table)`. */
function rootOf(callee: Node): string {
  if (callee.type === 'Identifier') return callee.name as string;
  if (callee.type === 'MemberExpression') return rootOf(callee.object as Node);
  if (callee.type === 'CallExpression') return rootOf(callee.callee as Node);
  if (callee.type === 'TaggedTemplateExpression') return rootOf(callee.tag as Node);
  return '';
}
