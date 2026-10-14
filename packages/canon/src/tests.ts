/**
 * The tests and the comments of a TypeScript file, read from its syntax.
 *
 * A test is a call of `it` or `test`, with any modifiers between, such as
 * `it.fails('title', fn)`, `it.each(table)('title', fn)` or
 * `` it.each`table`('title', fn) ``. Text that only looks like one, inside a
 * string or a comment, is no test: the parser sees it for what it is.
 */
import { Parser, type Comment } from 'acorn';
import { tsPlugin } from '@sveltejs/acorn-typescript';

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

/** The modifiers of a callee that calls `it` or `test`, or undefined when it calls something else. */
function modifiersOf(callee: Node): string[] | undefined {
  switch (callee.type) {
    case 'Identifier':
      return callee.name === 'it' || callee.name === 'test' ? [] : undefined;
    case 'MemberExpression': {
      const property = callee.property as Node;
      if (callee.computed || property.type !== 'Identifier') return undefined;
      const modifiers = modifiersOf(callee.object as Node);
      return modifiers && [...modifiers, property.name as string];
    }
    case 'CallExpression':
      return modifiersOf(callee.callee as Node);
    case 'TaggedTemplateExpression':
      return modifiersOf(callee.tag as Node);
    default:
      return undefined;
  }
}

/** The title of a test, from its first argument. */
function titleOf(argument: Node, src: string): string {
  if (argument.type === 'Literal' && typeof argument.value === 'string') return argument.value;
  if (argument.type === 'TemplateLiteral') return src.slice(argument.start + 1, argument.end - 1);
  return src.slice(argument.start, argument.end);
}

/**
 * Parse `src` as TypeScript, with JSX when `jsx` is set. Throws a `SyntaxError`
 * when it does not parse.
 */
export function parseSource(src: string, jsx: boolean): ParsedSource {
  const raw: Comment[] = [];
  const program = (jsx ? TSX : TS).parse(src, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    onComment: raw
  }) as unknown as Node;
  const comments = raw.map(({ value, start, end }) => ({ value, start, end }));
  const jsdocs = comments.filter((c, i) => raw[i]?.type === 'Block' && c.value.startsWith('*'));

  /** The JSDoc that ends right above `start`, with only white space between. */
  const jsdocAbove = (start: number): SourceComment | undefined => {
    let found: SourceComment | undefined;
    for (const c of jsdocs) {
      if (c.end > start) break;
      found = c;
    }
    return found && /^\s*$/.test(src.slice(found.end, start)) ? found : undefined;
  };

  const tests: TestBlock[] = [];
  const visit = (node: Node): void => {
    if (node.type === 'CallExpression') {
      const args = node.arguments as Node[];
      const modifiers = modifiersOf(node.callee as Node);
      if (modifiers && args.length > 0) {
        const jsdoc = jsdocAbove(node.start);
        tests.push({
          doc: jsdoc ? jsdoc.value.slice(1) : '',
          span: jsdoc && [jsdoc.start, jsdoc.end],
          title: titleOf(args[0] as Node, src),
          modifiers,
          at: node.start
        });
        // The callee is the test's own chain, as in `it.each(table)`: no test of its own.
        for (const arg of args) visit(arg);
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
