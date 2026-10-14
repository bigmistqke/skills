/**
 * The tests and the comments of a TypeScript file, read from its syntax.
 *
 * A test is a call that a runner of the project declares a test with: one of
 * its calls, with any of its modifiers between, such as `it.fails('title', fn)`,
 * `it.each(table)('title', fn)` or `` it.each`table`('title', fn) ``, and a
 * function after the first argument. Text that only looks like one, inside a
 * string or a comment, is no test: the parser sees it for what it is.
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
  at: number;
}

/** A comment: its text, without the marks that open and close it, and where it starts and ends. */
export interface SourceComment {
  value: string;
  start: number;
  end: number;
}

export interface ParsedSource {
  tests: TestBlock[];
  comments: SourceComment[];
}

const TS = Parser.extend(tsPlugin() as never);
const TSX = Parser.extend(tsPlugin({ jsx: true }) as never);

/** A node of the syntax tree, as far as this module reads it. */
interface Node {
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
      return vocabulary.calls.has(name) && !own.has(name) ? [] : undefined;
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

/**
 * Parse `src` as TypeScript, with JSX when `jsx` is set, and read the tests
 * that the runners of `vocabulary` declare. Throws a `SyntaxError` when it does
 * not parse.
 */
export function parseSource(src: string, jsx: boolean, vocabulary: Vocabulary): ParsedSource {
  const raw: Comment[] = [];
  const program = (jsx ? TSX : TS).parse(src, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    onComment: raw
  }) as unknown as Node;
  const comments = raw.map(({ value, start, end }) => ({ value, start, end }));
  const jsdocs = comments.filter((c, i) => raw[i]?.type === 'Block' && c.value.startsWith('*'));

  /** The JSDoc that ends right above `start`, with only white space between: the last that ends before it, by a binary search. */
  const jsdocAbove = (start: number): SourceComment | undefined => {
    let low = 0;
    let high = jsdocs.length;
    while (low < high) {
      const mid = (low + high) >> 1;
      if ((jsdocs[mid] as SourceComment).end <= start) low = mid + 1;
      else high = mid;
    }
    const found = jsdocs[low - 1];
    return found && /^\s*$/.test(src.slice(found.end, start)) ? found : undefined;
  };

  const own = ownNames(program);
  const tests: TestBlock[] = [];
  const visit = (node: Node): void => {
    if (node.type === 'CallExpression') {
      const args = node.arguments as Node[];
      const modifiers = modifiersOf(node.callee as Node, vocabulary, own);
      if (modifiers && hasBody(args)) {
        const jsdoc = jsdocAbove(node.start);
        tests.push({
          doc: jsdoc ? jsdoc.value.slice(1) : '',
          span: jsdoc && [jsdoc.start, jsdoc.end],
          title: titleOf(args[0] as Node, src),
          modifiers,
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
  return { tests, comments };
}
