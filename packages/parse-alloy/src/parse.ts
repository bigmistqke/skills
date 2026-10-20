/**
 * A parser for Alloy 6, which reads Alloy exactly as the Alloy analyzer 6.2.0
 * (`794226d`) reads it. The tokens follow `Alloy.lex` and the token filter
 * `CompFilter.java`; the productions and their grouping follow `Alloy.cup`.
 * Anything it cannot read that way is an AlloyParseError with the place and
 * the reason, never a partial tree.
 */

/** A place in the source: offsets from the start, the end not included. */
export interface Span {
  start: number;
  end: number;
}

export type Quantifier = 'all' | 'some' | 'no' | 'one' | 'lone' | 'sum';
export type Multiplicity = 'some' | 'no' | 'one' | 'lone' | 'set' | 'seq';
export type ArrowMultiplicity = 'some' | 'one' | 'lone' | 'set';
export type UnaryTemporal = 'always' | 'eventually' | 'after' | 'before' | 'once' | 'historically';
export type BinaryTemporal = 'until' | 'releases' | 'since' | 'triggered' | ';';
export type Comparison = 'in' | 'not in' | '=' | '!=' | '<' | '>' | '=<' | '>=' | '!<' | '!>' | '!=<' | '!>=';
export type Arithmetic = 'add' | 'sub' | 'mul' | 'div' | 'rem' | '<<' | '>>' | '>>>';

/**
 * A formula or an expression, which share one grammar in Alloy. A name stays
 * unresolved: it may be a variable, a signature, a field, a predicate or a
 * function, and `p[x]` (`call`) may be a call or a box join. Telling them apart
 * needs types, which the consumer has.
 */
export type Node = (
  | { t: 'name'; name: string }
  | { t: 'number'; value: number }
  | { t: 'string'; value: string }
  | { t: 'true' }
  | { t: 'prime'; e: Node }
  | { t: 'transpose'; e: Node }
  | { t: 'closure'; e: Node }
  | { t: 'rclosure'; e: Node }
  | { t: 'join'; l: Node; r: Node }
  | { t: 'call'; name: string; args: Node[] }
  | { t: 'box'; e: Node; args: Node[] }
  | { t: 'arrow'; l: Node; r: Node; lm?: ArrowMultiplicity; rm?: ArrowMultiplicity }
  | { t: 'domain'; l: Node; r: Node }
  | { t: 'range'; l: Node; r: Node }
  | { t: 'inter'; l: Node; r: Node }
  | { t: 'override'; l: Node; r: Node }
  | { t: 'union'; l: Node; r: Node }
  | { t: 'diff'; l: Node; r: Node }
  | { t: 'arith'; op: Arithmetic; l: Node; r: Node }
  | { t: 'card'; e: Node }
  | { t: 'cast'; e: Node }
  | { t: 'cmp'; op: Comparison; l: Node; r: Node }
  | { t: 'mult'; q: Multiplicity; e: Node }
  | { t: 'not'; f: Node }
  | { t: 'and'; items: Node[] }
  | { t: 'or'; items: Node[] }
  | { t: 'implies'; l: Node; r: Node }
  | { t: 'ite'; c: Node; a: Node; b: Node }
  | { t: 'iff'; l: Node; r: Node }
  | { t: 'unary'; op: UnaryTemporal; f: Node }
  | { t: 'binary'; op: BinaryTemporal; l: Node; r: Node }
  | { t: 'quant'; q: Quantifier; decls: Decl[]; body: Node }
  | { t: 'let'; binds: { name: string; value: Node }[]; body: Node }
  | { t: 'comprehension'; decls: Decl[]; body: Node }
) & { span?: Span };

/** The variables of one declaration and their type; `disj` before the names says that they stand for different things. */
export interface Decl {
  names: string[];
  type: Node;
  disj?: boolean;
  /** `disj` after the colon, `x: disj T`. */
  disjType?: boolean;
  var?: boolean;
  private?: boolean;
  /** A field defined as equal to an expression, `f = e`, and not of a type. */
  defined?: boolean;
  span?: Span;
}

export interface Sig {
  t: 'sig';
  names: string[];
  abstract?: boolean;
  var?: boolean;
  private?: boolean;
  mult?: 'one' | 'lone' | 'some';
  /** `extends S`, `in A + B`, or `= A + B`. */
  parent?: { kind: 'extends' | 'in' | '='; names: string[] };
  fields: Decl[];
  /** The block after the fields, a fact about each member. */
  fact?: Node;
  span: Span;
}

export interface Pred {
  t: 'pred';
  name: string;
  receiver?: string;
  params?: Decl[];
  body: Node;
  private?: boolean;
  span: Span;
}

export interface Fun {
  t: 'fun';
  name: string;
  receiver?: string;
  params?: Decl[];
  result: Node;
  body: Node;
  private?: boolean;
  span: Span;
}

export interface Fact {
  t: 'fact';
  name?: string;
  body: Node;
  span: Span;
}

export interface Assert {
  t: 'assert';
  name?: string;
  body: Node;
  span: Span;
}

export interface Enum {
  t: 'enum';
  name: string;
  members: string[];
  private?: boolean;
  span: Span;
}

export interface Macro {
  t: 'macro';
  name: string;
  params?: string[];
  body: Node;
  private?: boolean;
  span: Span;
}

export interface Command {
  t: 'command';
  kind: 'run' | 'check';
  label?: string;
  /** The predicate or assertion it names, or else its own block. */
  target?: string;
  body?: Node;
  /** The scope as written, `for 3 but 1..8 steps`, which this parser does not take apart. */
  scope?: string;
  expect?: number;
  /** A command chained after this one with `=>`. */
  then?: Command;
  span: Span;
}

export type Paragraph = Sig | Pred | Fun | Fact | Assert | Enum | Macro | Command;

export interface Open {
  name: string;
  args: string[];
  alias?: string;
  private?: boolean;
  span: Span;
}

export interface Module {
  t: 'module';
  name?: string;
  params?: string[];
  opens: Open[];
  paragraphs: Paragraph[];
  /** The comments of the source, which are not in the tree. */
  comments: Span[];
}

/** Why a text is not Alloy as the analyzer reads it: what was expected, and where. */
export class AlloyParseError extends Error {
  readonly span: Span;
  readonly line: number;
  readonly column: number;

  constructor(message: string, source: string, span: Span) {
    const { line, column } = position(source, span.start);
    super(message);
    this.name = 'AlloyParseError';
    this.span = span;
    this.line = line;
    this.column = column;
  }
}

/** The line and column, from 1, of an offset in a source. */
export function position(source: string, offset: number): { line: number; column: number } {
  const before = source.slice(0, offset).split('\n');
  return { line: before.length, column: (before.at(-1) as string).length + 1 };
}

// Tokens, as `Alloy.lex` reads them and `CompFilter.java` merges them.

type Kind = 'word' | 'symbol' | 'name' | 'number' | 'string' | 'end';

interface Token {
  /** A keyword or symbol as it reads; the merged forms read `not in`, `!=`, `->` and so on. */
  text: string;
  kind: Kind;
  span: Span;
  /** A quantifier keyword that the filter found to start a declaration (`ALL2`, `SOME2` …). */
  binds?: boolean;
  /** The multiplicities of a merged arrow, `some->lone`. */
  lm?: ArrowMultiplicity;
  rm?: ArrowMultiplicity;
  value?: number | string;
}

const KEYWORDS = new Set([
  'abstract', 'all', 'and', 'as', 'assert', 'but', 'check', 'disj', 'disjoint', 'else', 'enum', 'exactly', 'expect', 'extends', 'fact', 'for', 'fun',
  'iden', 'iff', 'implies', 'in', 'Int', 'int', 'let', 'lone', 'module', 'none', 'not', 'no', 'one', 'open', 'or', 'pred', 'private', 'run', 'seq',
  'set', 'sig', 'some', 'String', 'sum', 'this', 'univ', 'var', 'always', 'after', 'eventually', 'historically', 'before', 'once', 'releases',
  'until', 'since', 'triggered', 'steps'
]);

const SYMBOLS = [
  '<=>', '>>>', '=>', '&&', '||', '++', '->', '::', ':>', '<=', '<:', '<<', '=<', '>>', '>=',
  '!', '#', '&', '(', ')', '*', '+', ',', '-', '.', '/', ':', '<', '=', '>', '@', '[', ']', '^', '{', '|', '}', '~', ';', "'", '‘', '’'
];

/** The words of the lexer that read as another: `&&` is `and`, `::` is `.`, a typographic prime is `'`. */
const SAME: Record<string, string> = { '&&': 'and', '||': 'or', '!': 'not', '=>': 'implies', '<=>': 'iff', '::': '.', '<=': '=<', disjoint: 'disj', '‘': "'", '’': "'" };

const ARROW_MULTS: readonly string[] = ['one', 'lone', 'some', 'set'];
const QUANTIFIERS: readonly string[] = ['all', 'no', 'some', 'lone', 'one', 'sum'];

function lex(source: string): { tokens: Token[]; comments: Span[] } {
  const tokens: Token[] = [];
  const comments: Span[] = [];
  let i = 0;
  const fail = (message: string, at: number, length = 1): never => {
    throw new AlloyParseError(message, source, { start: at, end: at + length });
  };
  while (i < source.length) {
    const rest = source.slice(i);
    const space = /^\s+/.exec(rest);
    if (space) {
      i += space[0].length;
      continue;
    }
    if (rest.startsWith('/*')) {
      const end = source.indexOf('*/', i + 2);
      if (end === -1) fail('a comment "/*" is not closed', i, 2);
      comments.push({ start: i, end: end + 2 });
      i = end + 2;
      continue;
    }
    if (rest.startsWith('--') || rest.startsWith('//')) {
      const end = source.indexOf('\n', i);
      const to = end === -1 ? source.length : end;
      comments.push({ start: i, end: to });
      i = to;
      continue;
    }
    const string = /^"(?:[^\\"]|\\.)*"/.exec(rest);
    if (string) {
      tokens.push({ text: string[0], kind: 'string', span: { start: i, end: i + string[0].length }, value: JSON.parse(string[0]) as string });
      i += string[0].length;
      continue;
    }
    if (rest.startsWith('"')) fail('a string is missing its closing " character', i);
    const number = /^(?:0x[_0-9A-Fa-f]+|0b[01_]+|[0-9][0-9_]*)(?![$\w"])/.exec(rest);
    if (number) {
      const text = number[0].replaceAll('_', '');
      const value = text.startsWith('0x') ? parseInt(text.slice(2), 16) : text.startsWith('0b') ? parseInt(text.slice(2), 2) : parseInt(text, 10);
      tokens.push({ text: number[0], kind: 'number', span: { start: i, end: i + number[0].length }, value });
      i += number[0].length;
      continue;
    }
    if (/^[0-9]/.test(rest)) fail('a name cannot start with a number', i);
    const word = /^[A-Za-z_$][\w$"]*/.exec(rest);
    if (word) {
      const text = SAME[word[0]] ?? word[0];
      tokens.push({ text, kind: KEYWORDS.has(word[0]) ? 'word' : 'name', span: { start: i, end: i + word[0].length } });
      i += word[0].length;
      continue;
    }
    const symbol = SYMBOLS.find(s => rest.startsWith(s));
    if (symbol) {
      tokens.push({ text: SAME[symbol] ?? symbol, kind: 'symbol', span: { start: i, end: i + symbol.length } });
      i += symbol.length;
      continue;
    }
    fail(`cannot read "${rest[0]}"`, i);
  }
  tokens.push({ text: '', kind: 'end', span: { start: source.length, end: source.length } });
  return { tokens: filter(tokens), comments };
}

const keyword = (token: Token | undefined, text: string): boolean => token !== undefined && token.kind !== 'name' && token.kind !== 'string' && token.text === text;

/** The merges of `CompFilter.java`, in its order: negated comparisons, the arrows with multiplicities, negative numbers, then the quantifiers that start a declaration. */
function filter(input: Token[]): Token[] {
  const merged: Token[] = [];
  const join = (a: Token, b: Token, text: string, extra: Partial<Token> = {}): Token => ({ ...a, ...extra, text, kind: 'symbol', span: { start: a.span.start, end: b.span.end } });
  for (let i = 0; i < input.length; i++) {
    const x = input[i] as Token;
    const y = input[i + 1];
    const z = input[i + 2];
    if (keyword(x, 'not') && y !== undefined && y.kind !== 'name' && ['in', '=', '<', '=<', '>', '>='].includes(y.text)) {
      merged.push(join(x, y, y.text === 'in' ? 'not in' : y.text === '=' ? '!=' : `!${y.text}`));
      i++;
      continue;
    }
    if (keyword(x, 'pred') && keyword(y, '/') && z?.kind === 'name' && z.text === 'totalOrder') {
      merged.push({ ...join(x, z, 'pred/totalOrder'), kind: 'name' });
      i += 2;
      continue;
    }
    if (keyword(x, 'fun') && keyword(y, '/') && z?.kind === 'name' && ['add', 'sub', 'mul', 'div', 'rem', 'min', 'max', 'next'].includes(z.text)) {
      merged.push({ ...join(x, z, `fun/${z.text}`), kind: ['min', 'max', 'next'].includes(z.text) ? 'name' : 'symbol' });
      i += 2;
      continue;
    }
    if (ARROW_MULTS.includes(x.text) && x.kind === 'word' && keyword(y, '->')) {
      const right = z !== undefined && z.kind === 'word' && ARROW_MULTS.includes(z.text) ? z : undefined;
      const lm = x.text === 'set' ? undefined : (x.text as ArrowMultiplicity);
      const rm = right === undefined || right.text === 'set' ? undefined : (right.text as ArrowMultiplicity);
      merged.push(join(x, right ?? (y as Token), '->', { lm, rm }));
      i += right === undefined ? 1 : 2;
      continue;
    }
    if (keyword(x, '->') && x.kind === 'symbol' && y !== undefined && y.kind === 'word' && ARROW_MULTS.includes(y.text)) {
      merged.push(join(x, y, '->', { rm: y.text === 'set' ? undefined : (y.text as ArrowMultiplicity) }));
      i++;
      continue;
    }
    merged.push(x);
  }
  // `- 3` is the number -3, unless it follows something that ends an operand.
  const ends = new Set([')', ']', '}', 'disj', 'int', 'sum', 'iden', 'this', 'univ', 'Int', 'none']);
  const numbered: Token[] = [];
  for (let i = 0; i < merged.length; i++) {
    const x = merged[i] as Token;
    const last = numbered.at(-1);
    const after = last !== undefined && (last.kind === 'name' || last.kind === 'number' || last.kind === 'string' || ends.has(last.text));
    const y = merged[i + 1];
    if (!after && keyword(x, '-') && y?.kind === 'number') {
      numbered.push({ ...y, text: `-${y.text}`, value: -(y.value as number), span: { start: x.span.start, end: y.span.end } });
      i++;
      continue;
    }
    numbered.push(x);
  }
  // A quantifier keyword starts a declaration when names and a colon follow, unless it comes right after a colon or `disj`.
  for (let i = 0; i < numbered.length; i++) {
    const a = numbered[i] as Token;
    const last = numbered[i - 1];
    if (a.kind !== 'word' || !QUANTIFIERS.includes(a.text) || keyword(last, ':') || keyword(last, 'disj')) continue;
    let j = i + 1;
    if (keyword(numbered[j], 'private')) j++;
    if (keyword(numbered[j], 'disj')) j++;
    while (numbered[j]?.kind === 'name') {
      j++;
      if (keyword(numbered[j], ',')) j++;
      else {
        if (keyword(numbered[j], ':')) a.binds = true;
        break;
      }
    }
  }
  return numbered;
}

// The parser, from the loosest production to the tightest.

class Parser {
  private at = 0;
  /** The nodes that parentheses or a block enclose, which an `else` may follow even when they are a quantifier or an `implies`. */
  private readonly closed = new WeakSet<Node>();

  constructor(
    private readonly tokens: Token[],
    private readonly source: string
  ) {}

  private peek(ahead = 0): Token {
    return (this.tokens[this.at + ahead] ?? this.tokens.at(-1)) as Token;
  }

  private is(text: string, ahead = 0): boolean {
    return keyword(this.peek(ahead), text);
  }

  private fail(message: string, token = this.peek()): never {
    throw new AlloyParseError(message, this.source, token.span);
  }

  private found(token = this.peek()): string {
    return token.kind === 'end' ? 'the end' : `"${token.text}"`;
  }

  private take(text?: string): Token {
    const token = this.peek();
    if (token.kind === 'end') this.fail(`the text ends where ${text === undefined ? 'more' : `"${text}"`} was expected`);
    if (text !== undefined && !keyword(token, text)) this.fail(`expected "${text}", found ${this.found(token)}`);
    this.at++;
    return token;
  }

  private name(): string {
    const token = this.peek();
    if (token.kind !== 'name') this.fail(`expected a name, found ${this.found(token)}`);
    this.at++;
    let name = token.text;
    while (this.is('/') && this.peek(1).kind === 'name') {
      this.at++;
      name += `/${this.take().text}`;
    }
    return name;
  }

  done(): boolean {
    return this.peek().kind === 'end';
  }

  end(): void {
    if (!this.done()) this.fail(`cannot read the text from ${this.found()} on`);
  }

  private spanned<N extends object>(start: number, node: N): N & { span: Span } {
    const last = this.tokens[this.at - 1] as Token;
    return { ...node, span: { start, end: last.span.end } };
  }

  /** Whether a `Bind` starts here: a quantifier with a declaration, or `let`. */
  private atBind(): boolean {
    return this.peek().binds === true || this.is('let');
  }

  /** The right side of a binary operator: a `Bind`, which takes everything after it, or the next production. */
  private right(next: () => Node): Node {
    return this.atBind() ? this.bind() : next();
  }

  // Expr ::= ExprNoSeq | ExprNoSeq ; Expr
  formula(): Node {
    const start = this.peek().span.start;
    const l = this.noSeq();
    if (!this.is(';')) return l;
    this.take();
    return this.spanned(start, { t: 'binary' as const, op: ';' as const, l, r: this.formula() });
  }

  // ExprNoSeq ::= OrExpr | Bind
  private noSeq(): Node {
    return this.atBind() ? this.bind() : this.or();
  }

  private bind(): Node {
    const start = this.peek().span.start;
    if (this.is('let')) {
      this.take();
      const binds: { name: string; value: Node }[] = [];
      do {
        const name = this.name();
        if (name.includes('/') || name.includes('@')) this.fail(`a variable of "let" cannot be named "${name}"`);
        this.take('=');
        binds.push({ name, value: this.formula() });
      } while (this.is(',') && this.take());
      return this.spanned(start, { t: 'let' as const, binds, body: this.barOrBlock() });
    }
    const q = this.take().text as Quantifier;
    const decls = this.decls(true);
    return this.spanned(start, { t: 'quant' as const, q, decls, body: this.barOrBlock() });
  }

  /** `| formula`, or a block. The body after a bar ends at a `;`, which the caller reads. */
  private barOrBlock(): Node {
    if (this.is('{')) return this.block();
    if (!this.is('|')) this.fail(`expected "|" or "{" after the declarations, found ${this.found()}`);
    this.take();
    return this.noSeq();
  }

  /** `{ formula formula … }`, the formulas of a block taken together; `{}` is true. */
  block(): Node {
    const start = this.take('{').span.start;
    if (this.is('}')) {
      this.take();
      return this.spanned(start, { t: 'true' as const });
    }
    const items: Node[] = [];
    while (!this.is('}')) {
      if (this.done()) this.fail('a block "{" is not closed');
      items.push(this.formula());
    }
    this.take('}');
    const node = items.length === 1 ? (items[0] as Node) : this.spanned(start, { t: 'and' as const, items });
    this.closed.add(node);
    return node;
  }

  /** Declarations: `disj a, b: T, c: set U`. A quantifier's are `Declp`, the parameters of a definition `Decls`, which may be empty. */
  decls(atLeastOne: boolean, closing?: string): Decl[] {
    const decls: Decl[] = [];
    if (!atLeastOne && closing !== undefined && this.is(closing)) return decls;
    do {
      while (!atLeastOne && this.is(',')) this.take();
      if (closing !== undefined && this.is(closing)) break;
      decls.push(this.decl());
    } while (this.is(',') && this.take());
    return decls;
  }

  private decl(defined = false): Decl {
    const start = this.peek().span.start;
    const flags: { var?: boolean; private?: boolean; disj?: boolean } = {};
    if (this.is('var')) {
      this.take();
      flags.var = true;
    }
    if (this.is('private')) {
      this.take();
      flags.private = true;
    }
    if (this.is('disj')) {
      this.take();
      flags.disj = true;
    }
    const names = [this.name()];
    while (this.is(',')) {
      this.take();
      names.push(this.name());
    }
    if (defined && this.is('=')) {
      if (flags.disj) this.fail('defined fields cannot be disjoint');
      this.take();
      return { names, type: this.formula(), ...flags, defined: true, span: { start, end: (this.tokens[this.at - 1] as Token).span.end } };
    }
    this.take(':');
    let disjType = false;
    if (this.is('disj')) {
      this.take();
      disjType = true;
    }
    const type = this.formula();
    return { names, type, ...flags, ...(disjType ? { disjType } : {}), span: { start, end: (this.tokens[this.at - 1] as Token).span.end } };
  }

  // OrExpr ::= OrExpr or EquivExpr | OrExpr or Bind
  private or(): Node {
    const start = this.peek().span.start;
    const items = [this.iff()];
    while (this.is('or')) {
      this.take();
      if (this.atBind()) {
        items.push(this.bind());
        break;
      }
      items.push(this.iff());
    }
    if (items.length === 1) return items[0] as Node;
    return this.spanned(start, { t: 'or' as const, items: items.flatMap(i => (i.t === 'or' ? i.items : [i])) });
  }

  private iff(): Node {
    const start = this.peek().span.start;
    let l = this.implies();
    while (this.is('iff')) {
      this.take();
      if (this.atBind()) return this.spanned(start, { t: 'iff' as const, l, r: this.bind() });
      l = this.spanned(start, { t: 'iff' as const, l, r: this.implies() });
    }
    return l;
  }

  /** `a implies b`, grouped to the right, and `a implies b else c`, whose `else` belongs to the nearest `implies`. */
  private implies(): Node {
    const start = this.peek().span.start;
    const c = this.and();
    if (!this.is('implies')) return c;
    this.take();
    if (this.atBind()) return this.spanned(start, { t: 'implies' as const, l: c, r: this.bind() });
    const a = this.implies();
    if (!this.is('else')) return this.spanned(start, { t: 'implies' as const, l: c, r: a });
    if ((a.t === 'implies' || a.t === 'quant' || a.t === 'let') && !this.closed.has(a)) this.fail('the formula before "else" must not be an open "implies" or a quantifier');
    this.take();
    const b = this.atBind() ? this.bind() : this.implies();
    return this.spanned(start, { t: 'ite' as const, c, a, b });
  }

  private and(): Node {
    const start = this.peek().span.start;
    const items = [this.temporal()];
    while (this.is('and')) {
      this.take();
      if (this.atBind()) {
        items.push(this.bind());
        break;
      }
      items.push(this.temporal());
    }
    if (items.length === 1) return items[0] as Node;
    return this.spanned(start, { t: 'and' as const, items: items.flatMap(i => (i.t === 'and' ? i.items : [i])) });
  }

  // TempBinary: until, since, releases, triggered, grouped to the left.
  private temporal(): Node {
    const start = this.peek().span.start;
    let l = this.unary();
    while (['until', 'since', 'releases', 'triggered'].some(op => this.is(op))) {
      const op = this.take().text as BinaryTemporal;
      if (this.atBind()) return this.spanned(start, { t: 'binary' as const, op, l, r: this.bind() });
      l = this.spanned(start, { t: 'binary' as const, op, l, r: this.unary() });
    }
    return l;
  }

  // UnaryExpr: not and the unary temporal operators, before a Bind or another unary.
  private unary(): Node {
    const start = this.peek().span.start;
    if (this.is('not')) {
      this.take();
      return this.spanned(start, { t: 'not' as const, f: this.right(() => this.unary()) });
    }
    for (const op of ['always', 'eventually', 'after', 'before', 'once', 'historically'] as const) {
      if (this.is(op)) {
        this.take();
        return this.spanned(start, { t: 'unary' as const, op, f: this.right(() => this.unary()) });
      }
    }
    return this.compare();
  }

  // CompareExpr: a multiplicity before it, then comparisons grouped to the left.
  private compare(): Node {
    const start = this.peek().span.start;
    let l: Node;
    const token = this.peek();
    if (token.kind === 'word' && !token.binds && ['no', 'some', 'lone', 'one', 'set', 'seq'].includes(token.text) && !(token.text === 'seq' && this.is('/', 1))) {
      this.take();
      l = this.spanned(start, { t: 'mult' as const, q: token.text as Multiplicity, e: this.right(() => this.shift()) });
    } else l = this.shift();
    const ops: readonly string[] = ['in', 'not in', '=', '!=', '<', '>', '=<', '>=', '!<', '!>', '!=<', '!>='];
    while (ops.some(op => this.is(op))) {
      const op = this.take().text as Comparison;
      if (this.atBind()) return this.spanned(start, { t: 'cmp' as const, op, l, r: this.bind() });
      l = this.spanned(start, { t: 'cmp' as const, op, l, r: this.shift() });
    }
    return l;
  }

  private leftChain(ops: Record<string, (l: Node, r: Node) => Node>, next: () => Node): Node {
    const start = this.peek().span.start;
    let l = next();
    for (;;) {
      const op = Object.keys(ops).find(o => this.is(o));
      if (op === undefined) return l;
      this.take();
      const make = ops[op] as (l: Node, r: Node) => Node;
      if (this.atBind()) return this.spanned(start, make(l, this.bind()));
      l = this.spanned(start, make(l, next()));
    }
  }

  private shift(): Node {
    return this.leftChain(
      { '<<': (l, r) => ({ t: 'arith', op: '<<', l, r }), '>>>': (l, r) => ({ t: 'arith', op: '>>>', l, r }), '>>': (l, r) => ({ t: 'arith', op: '>>', l, r }) },
      () => this.unionDiff()
    );
  }

  private unionDiff(): Node {
    return this.leftChain(
      {
        '+': (l, r) => ({ t: 'union', l, r }),
        '-': (l, r) => ({ t: 'diff', l, r }),
        'fun/add': (l, r) => ({ t: 'arith', op: 'add', l, r }),
        'fun/sub': (l, r) => ({ t: 'arith', op: 'sub', l, r })
      },
      () => this.mul()
    );
  }

  private mul(): Node {
    return this.leftChain(
      { 'fun/mul': (l, r) => ({ t: 'arith', op: 'mul', l, r }), 'fun/div': (l, r) => ({ t: 'arith', op: 'div', l, r }), 'fun/rem': (l, r) => ({ t: 'arith', op: 'rem', l, r }) },
      () => this.numUnop()
    );
  }

  // NumUnopExpr: # e, sum e, int e
  private numUnop(): Node {
    const start = this.peek().span.start;
    if (this.is('#')) {
      this.take();
      return this.spanned(start, { t: 'card' as const, e: this.right(() => this.numUnop()) });
    }
    if ((this.is('sum') || this.is('int')) && !this.peek().binds && !this.is('[', 1)) {
      this.take();
      return this.spanned(start, { t: 'cast' as const, e: this.right(() => this.numUnop()) });
    }
    return this.override();
  }

  private override(): Node {
    return this.leftChain({ '++': (l, r) => ({ t: 'override', l, r }) }, () => this.intersect());
  }

  private intersect(): Node {
    return this.leftChain({ '&': (l, r) => ({ t: 'inter', l, r }) }, () => this.relation());
  }

  // RelationExpr: arrows, grouped to the right.
  private relation(): Node {
    const start = this.peek().span.start;
    const l = this.domain();
    if (!this.is('->')) return l;
    const arrow = this.take();
    const r = this.atBind() ? this.bind() : this.relation();
    return this.spanned(start, { t: 'arrow' as const, l, r, ...(arrow.lm ? { lm: arrow.lm } : {}), ...(arrow.rm ? { rm: arrow.rm } : {}) });
  }

  private domain(): Node {
    return this.leftChain({ '<:': (l, r) => ({ t: 'domain', l, r }) }, () => this.range());
  }

  private range(): Node {
    return this.leftChain({ ':>': (l, r) => ({ t: 'range', l, r }) }, () => this.dotBracket());
  }

  /** Joins and boxes, read left to right: `a.b[c].d` is `((a.b)[c]).d`. */
  private dotBracket(): Node {
    const start = this.peek().span.start;
    let e = this.unop();
    for (;;) {
      if (this.is('[')) {
        this.take();
        const args = this.exprs(']');
        this.take(']');
        e = this.spanned(start, e.t === 'name' ? { t: 'call' as const, name: e.name, args } : { t: 'box' as const, e, args });
      } else if (this.is('.')) {
        this.take();
        if (this.is('int') || this.is('sum')) {
          this.take();
          e = this.spanned(start, { t: 'cast' as const, e });
        } else if (this.is('disj')) {
          this.take();
          e = this.spanned(start, { t: 'join' as const, l: e, r: { t: 'name' as const, name: 'disj' } });
        } else if (this.atBind()) {
          return this.spanned(start, { t: 'join' as const, l: e, r: this.bind() });
        } else e = this.spanned(start, { t: 'join' as const, l: e, r: this.unop() });
      } else return e;
    }
  }

  private exprs(closing: string): Node[] {
    const args: Node[] = [];
    if (this.is(closing)) return args;
    args.push(this.formula());
    while (this.is(',')) {
      this.take();
      args.push(this.formula());
    }
    return args;
  }

  // UnopExpr: ~ ^ * bind tighter than a prime, as the precedence of `Alloy.cup` decides: `~a'` is `(~a)'`.
  private unop(): Node {
    const start = this.peek().span.start;
    return this.primes(start, this.prefixed());
  }

  /** `~`, `^` and `*` before an operand, which takes no prime of its own when an operator stands before it. */
  private prefixed(): Node {
    const start = this.peek().span.start;
    const make: Record<string, 'transpose' | 'closure' | 'rclosure'> = { '~': 'transpose', '^': 'closure', '*': 'rclosure' };
    const op = Object.keys(make).find(o => this.is(o));
    if (op === undefined) return this.base();
    this.take();
    const e = this.atBind() ? this.bind() : this.prefixed();
    return this.spanned(start, { t: make[op] as 'transpose', e });
  }

  private primes(start: number, e: Node): Node {
    let node = e;
    while (this.is("'")) {
      this.take();
      node = this.spanned(start, { t: 'prime' as const, e: node });
    }
    return node;
  }

  private base(): Node {
    const token = this.peek();
    const start = token.span.start;
    if (token.kind === 'number') {
      this.take();
      return this.spanned(start, { t: 'number' as const, value: token.value as number });
    }
    if (token.kind === 'string') {
      this.take();
      return this.spanned(start, { t: 'string' as const, value: token.value as string });
    }
    if (this.is('(')) {
      this.take();
      const inner = this.formula();
      this.take(')');
      this.closed.add(inner);
      return inner;
    }
    if (this.is('{')) {
      // `{ x: T | … }` is a comprehension; any other `{` is a block.
      if (this.declarationAhead(1)) {
        this.take();
        const decls = this.decls(true);
        let body: Node = { t: 'true' };
        if (!this.is('}')) body = this.barOrBlock();
        this.take('}');
        return this.spanned(start, { t: 'comprehension' as const, decls, body });
      }
      return this.block();
    }
    if (this.is('@')) {
      this.take();
      return this.spanned(start, { t: 'name' as const, name: `@${this.name()}` });
    }
    for (const word of ['iden', 'univ', 'none', 'Int', 'String', 'steps']) {
      if (this.is(word)) {
        this.take();
        return this.spanned(start, { t: 'name' as const, name: word });
      }
    }
    if (this.is('this')) {
      this.take();
      if (this.is('/') && this.peek(1).kind === 'name') {
        this.take();
        return this.spanned(start, { t: 'name' as const, name: `this/${this.name()}` });
      }
      return this.spanned(start, { t: 'name' as const, name: 'this' });
    }
    if (this.is('seq') && this.is('/', 1)) {
      this.take();
      this.take();
      if (this.is('Int')) {
        this.take();
        return this.spanned(start, { t: 'name' as const, name: 'seq/Int' });
      }
      return this.spanned(start, { t: 'name' as const, name: `seq/${this.name()}` });
    }
    if (this.is('disj') && this.is('[', 1)) {
      this.take();
      this.take('[');
      const args = this.exprs(']');
      this.take(']');
      return this.spanned(start, { t: 'call' as const, name: 'disj', args });
    }
    if ((this.is('int') || this.is('sum')) && this.is('[', 1)) {
      const keyword = this.take().text;
      this.take('[');
      const args = this.exprs(']');
      this.take(']');
      return this.spanned(start, { t: 'cast' as const, e: args.length === 1 ? (args[0] as Node) : this.fail(`"${keyword}[…]" takes one expression`) });
    }
    if (token.kind === 'name') return this.spanned(start, { t: 'name' as const, name: this.name() });
    this.fail(`cannot read ${this.found(token)} here`, token);
  }

  /** Whether names and a colon start at `ahead`, as a declaration does. */
  private declarationAhead(ahead: number): boolean {
    let i = ahead;
    if (this.is('var', i)) i++;
    if (this.is('private', i)) i++;
    if (this.is('disj', i)) i++;
    while (this.peek(i).kind === 'name') {
      i++;
      if (this.is(':', i)) return true;
      if (!this.is(',', i)) return false;
      i++;
    }
    return false;
  }

  // Paragraphs.

  module(comments: Span[]): Module {
    const result: Module = { t: 'module', opens: [], paragraphs: [], comments };
    while (!this.done()) {
      const start = this.peek().span.start;
      if (this.is('module')) {
        this.take();
        result.name = this.name();
        if (this.is('[')) {
          this.take();
          const params: string[] = [];
          do {
            if (this.is('exactly')) this.take();
            params.push(this.name());
          } while (this.is(',') && this.take());
          this.take(']');
          result.params = params;
        }
        continue;
      }
      const isPrivate = this.is('private') && !this.is('sig', 1) && (this.is('open', 1) || this.is('enum', 1) || this.is('pred', 1) || this.is('fun', 1) || this.is('let', 1));
      if (isPrivate) this.take();
      if (this.is('open')) {
        this.take();
        const name = this.name();
        const args: string[] = [];
        if (this.is('[')) {
          this.take();
          if (!this.is(']')) {
            do args.push(this.sigRef());
            while (this.is(',') && this.take());
          }
          this.take(']');
        }
        let alias: string | undefined;
        if (this.is('as')) {
          this.take();
          alias = this.name();
        }
        result.opens.push(this.spanned(start, { name, args, ...(alias ? { alias } : {}), ...(isPrivate ? { private: true } : {}) }));
        continue;
      }
      result.paragraphs.push(this.paragraph(start, isPrivate));
    }
    return result;
  }

  private sigRef(): string {
    for (const word of ['univ', 'String', 'steps', 'Int', 'none']) {
      if (this.is(word)) {
        this.take();
        return word;
      }
    }
    if (this.is('seq') && this.is('/', 1)) {
      this.take();
      this.take();
      this.take('Int');
      return 'seq/Int';
    }
    if (this.is('this') && this.is('/', 1)) {
      this.take();
      this.take();
      return `this/${this.name()}`;
    }
    return this.name();
  }

  private paragraph(start: number, isPrivate: boolean): Paragraph {
    const vis = isPrivate ? { private: true } : {};
    if (this.is('enum')) {
      this.take();
      const name = this.name();
      this.take('{');
      const members: string[] = [];
      if (!this.is('}')) {
        do members.push(this.name());
        while (this.is(',') && this.take());
      }
      this.take('}');
      return this.spanned(start, { t: 'enum' as const, name, members, ...vis });
    }
    if (this.is('fact') || this.is('assert')) {
      const t = this.take().text as 'fact' | 'assert';
      let name: string | undefined;
      if (this.peek().kind === 'name') name = this.name();
      else if (this.peek().kind === 'string') name = this.take().value as string;
      const body = this.block();
      return this.spanned(start, { t, ...(name !== undefined ? { name } : {}), body });
    }
    if (this.is('pred') || this.is('fun')) {
      const t = this.take().text as 'pred' | 'fun';
      let receiver: string | undefined;
      let name = this.sigRef();
      if (this.is('.')) {
        this.take();
        receiver = name;
        name = this.name();
      }
      let params: Decl[] | undefined;
      if (this.is('[') || this.is('(')) {
        const closing = this.take().text === '[' ? ']' : ')';
        params = this.decls(false, closing);
        this.take(closing);
      }
      const extra = { ...(receiver ? { receiver } : {}), ...(params ? { params } : {}), ...vis };
      if (t === 'fun') {
        this.take(':');
        const result = this.formula();
        return this.spanned(start, { t, name, ...extra, result, body: this.block() });
      }
      return this.spanned(start, { t, name, ...extra, body: this.block() });
    }
    if (this.is('let')) {
      this.take();
      const name = this.name();
      let params: string[] | undefined;
      if (this.is('[') || this.is('(')) {
        const closing = this.take().text === '[' ? ']' : ')';
        params = [];
        if (!this.is(closing)) {
          do params.push(this.name());
          while (this.is(',') && this.take());
        }
        this.take(closing);
      }
      let body: Node;
      if (this.is('=')) {
        this.take();
        body = this.formula();
      } else body = this.block();
      return this.spanned(start, { t: 'macro' as const, name, ...(params ? { params } : {}), body, ...vis });
    }
    if (this.is('run') || this.is('check') || (this.peek().kind === 'name' && this.is(':', 1) && (this.is('run', 2) || this.is('check', 2)))) return this.command(start);
    return this.sig(start);
  }

  private command(start: number): Command {
    let label: string | undefined;
    if (this.peek().kind === 'name') {
      label = this.name();
      this.take(':');
    }
    const kind = this.take().text as 'run' | 'check';
    let target: string | undefined;
    let body: Node | undefined;
    if (this.peek().kind === 'name') {
      const first = this.name();
      if (this.peek().kind === 'name' && label === undefined) {
        label = first;
        target = this.name();
      } else if (this.is('{') && label === undefined) {
        label = first;
        body = this.block();
      } else target = first;
    } else body = this.block();
    let scope: string | undefined;
    if (this.is('for')) {
      const from = this.peek().span.start;
      this.take();
      while (!this.done() && !this.is('expect') && !this.is('implies') && !this.startsParagraph()) this.take();
      scope = this.source.slice(from, (this.tokens[this.at - 1] as Token).span.end);
    }
    let expect: number | undefined;
    if (this.is('expect')) {
      this.take();
      const n = this.take();
      if (n.kind !== 'number') this.fail('expected a number after "expect"', n);
      expect = n.value as number;
    }
    const command: Command = this.spanned(start, { t: 'command' as const, kind, ...(label ? { label } : {}), ...(target ? { target } : {}), ...(body ? { body } : {}), ...(scope ? { scope } : {}), ...(expect !== undefined ? { expect } : {}) });
    if (this.is('implies')) {
      this.take();
      command.then = this.command(this.peek().span.start);
    }
    return command;
  }

  private startsParagraph(): boolean {
    const t = this.peek();
    if (t.kind === 'word' && ['sig', 'abstract', 'var', 'private', 'fact', 'assert', 'pred', 'fun', 'enum', 'open', 'module', 'run', 'check', 'let'].includes(t.text)) return true;
    if (t.kind === 'word' && ['one', 'lone', 'some'].includes(t.text)) return true;
    return t.kind === 'name' && this.is(':', 1) && (this.is('run', 2) || this.is('check', 2));
  }

  private sig(start: number): Sig {
    const quals: { abstract?: boolean; var?: boolean; private?: boolean; mult?: 'one' | 'lone' | 'some' } = {};
    while (!this.is('sig')) {
      const token = this.peek();
      if (token.kind !== 'word') this.fail(`expected a paragraph, found ${this.found(token)}`);
      const q = token.text;
      if (q === 'abstract' || q === 'var' || q === 'private') {
        if (quals[q]) this.fail(`the same qualifier cannot be given twice for one sig`);
        quals[q] = true;
      } else if (q === 'one' || q === 'lone' || q === 'some') {
        if (quals.mult) this.fail(`the same qualifier cannot be given twice for one sig`);
        quals.mult = q;
      } else this.fail(`expected a paragraph, found ${this.found(token)}`);
      this.take();
    }
    this.take('sig');
    const names = [this.name()];
    while (this.is(',')) {
      this.take();
      names.push(this.name());
    }
    let parent: Sig['parent'];
    if (this.is('extends')) {
      this.take();
      parent = { kind: 'extends', names: [this.sigRef()] };
    } else if (this.is('in') || this.is('=')) {
      const kind = this.take().text as 'in' | '=';
      const parents = [this.sigRef()];
      while (this.is('+')) {
        this.take();
        parents.push(this.sigRef());
      }
      parent = { kind, names: parents };
    }
    this.take('{');
    const fields: Decl[] = [];
    while (!this.is('}')) {
      if (this.is(',')) {
        this.take();
        continue;
      }
      fields.push(this.decl(true));
      if (!this.is('}')) this.take(',');
    }
    this.take('}');
    const fact = this.is('{') ? this.block() : undefined;
    return this.spanned(start, { t: 'sig' as const, names, ...quals, ...(parent ? { parent } : {}), fields, ...(fact ? { fact } : {}) });
  }
}

/** A whole module: `module`, `open`, and its paragraphs. A vocabulary block is a module too. */
export function parseModule(source: string): Module {
  const { tokens, comments } = lex(source);
  const parser = new Parser(tokens, source);
  const module = parser.module(comments);
  parser.end();
  return module;
}

/** One formula, as a unit of a canon holds it. */
export function parseFormula(source: string): Node {
  const { tokens } = lex(source);
  const parser = new Parser(tokens, source);
  const node = parser.formula();
  parser.end();
  return node;
}

/** One expression, such as the type of a field; Alloy reads it with the grammar of a formula. */
export const parseExpression = parseFormula;
