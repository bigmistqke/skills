/**
 * A parser for the part of Alloy 6 that the formulas of a canon's units use:
 * quantifiers, the connectives, the temporal operators, comparisons of
 * relations, joins, primed relations and calls of predicates. Anything outside
 * it is an error that names the word, so a formula the verbalizer cannot read
 * is never read wrongly. The Alloy analyzer still checks the same text; this
 * reads it only to say it in words.
 */

export type Quantifier = 'all' | 'some' | 'no' | 'one' | 'lone';
export type UnaryTemporal = 'always' | 'eventually' | 'after' | 'before' | 'once' | 'historically';
export type BinaryTemporal = 'until' | 'releases' | 'since' | 'triggered' | ';';

export type Node =
  | { t: 'name'; name: string }
  | { t: 'prime'; e: Node }
  | { t: 'join'; l: Node; r: Node }
  | { t: 'arrow'; l: Node; r: Node }
  | { t: 'union'; l: Node; r: Node }
  | { t: 'diff'; l: Node; r: Node }
  | { t: 'inter'; l: Node; r: Node }
  | { t: 'call'; name: string; args: Node[] }
  | { t: 'cmp'; op: 'in' | 'not in' | '=' | '!='; l: Node; r: Node }
  | { t: 'mult'; q: Quantifier; e: Node }
  | { t: 'not'; f: Node }
  | { t: 'and'; items: Node[] }
  | { t: 'or'; items: Node[] }
  | { t: 'implies'; l: Node; r: Node }
  | { t: 'iff'; l: Node; r: Node }
  | { t: 'unary'; op: UnaryTemporal; f: Node }
  | { t: 'binary'; op: BinaryTemporal; l: Node; r: Node }
  | { t: 'quant'; q: Quantifier; decls: { names: string[]; type: Node }[]; body: Node };

const WORDS = new Set([
  'all', 'some', 'no', 'one', 'lone', 'always', 'eventually', 'after', 'before', 'once', 'historically',
  'until', 'releases', 'since', 'triggered', 'and', 'or', 'not', 'implies', 'iff', 'in', 'disj', 'let', 'else'
]);
const SYMBOLS = ['<=>', '=>', '&&', '||', '!=', '->', '(', ')', '[', ']', '{', '}', ',', ':', ';', '|', '.', '+', '-', '&', "'", '=', '!'];
const UNARY: readonly string[] = ['always', 'eventually', 'after', 'before', 'once', 'historically'];
const BINARY: readonly string[] = ['until', 'releases', 'since', 'triggered'];
const QUANTIFIERS: readonly string[] = ['all', 'some', 'no', 'one', 'lone'];

interface Token {
  /** The word, the symbol, or the identifier. */
  text: string;
  kind: 'word' | 'symbol' | 'name';
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const rest = src.slice(i);
    const space = /^\s+/.exec(rest);
    if (space) {
      i += space[0].length;
      continue;
    }
    if (rest.startsWith('--') || rest.startsWith('//')) {
      i += rest.indexOf('\n') === -1 ? rest.length : rest.indexOf('\n');
      continue;
    }
    const symbol = SYMBOLS.find(s => rest.startsWith(s));
    if (symbol) {
      tokens.push({ text: symbol, kind: 'symbol' });
      i += symbol.length;
      continue;
    }
    const word = /^[A-Za-z_][A-Za-z0-9_$]*/.exec(rest);
    if (!word) throw new Error(`cannot read "${rest.slice(0, 12).split('\n')[0]}"`);
    tokens.push({ text: word[0], kind: WORDS.has(word[0]) ? 'word' : 'name' });
    i += word[0].length;
  }
  return tokens;
}

class Parser {
  private at = 0;
  private readonly tokens: Token[];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(ahead = 0): Token | undefined {
    return this.tokens[this.at + ahead];
  }

  private is(text: string, ahead = 0): boolean {
    const token = this.peek(ahead);
    return token !== undefined && token.kind !== 'name' && token.text === text;
  }

  private take(text?: string): Token {
    const token = this.tokens[this.at];
    if (token === undefined) throw new Error(`the formula ends where ${text === undefined ? 'more' : `"${text}"`} was expected`);
    if (text !== undefined && !(token.kind !== 'name' && token.text === text)) throw new Error(`expected "${text}", found "${token.text}"`);
    this.at++;
    return token;
  }

  done(): boolean {
    return this.at >= this.tokens.length;
  }

  rest(): string {
    return this.tokens.slice(this.at).map(t => t.text).join(' ');
  }

  // Formulas, from the loosest operator to the tightest.

  formula(): Node {
    return this.sequence();
  }

  /** `a ; b`, which the analyzer binds looser than every connective and groups to the right. */
  private sequence(): Node {
    const l = this.or();
    if (!this.is(';')) return l;
    this.take();
    return { t: 'binary', op: ';', l, r: this.sequence() };
  }

  private or(): Node {
    const items = [this.iff()];
    while (this.is('or') || this.is('||')) {
      this.take();
      items.push(this.iff());
    }
    return items.length === 1 ? (items[0] as Node) : { t: 'or', items: items.flatMap(i => (i.t === 'or' ? i.items : [i])) };
  }

  private iff(): Node {
    let l = this.implies();
    while (this.is('iff') || this.is('<=>')) {
      this.take();
      l = { t: 'iff', l, r: this.implies() };
    }
    return l;
  }

  private implies(): Node {
    const l = this.and();
    if (this.is('implies') || this.is('=>')) {
      this.take();
      if (this.is('else')) throw new Error('"else" after "implies" is not supported');
      return { t: 'implies', l, r: this.implies() };
    }
    return l;
  }

  private and(): Node {
    const items = [this.temporal()];
    while (this.is('and') || this.is('&&')) {
      this.take();
      items.push(this.temporal());
    }
    return items.length === 1 ? (items[0] as Node) : { t: 'and', items: items.flatMap(i => (i.t === 'and' ? i.items : [i])) };
  }

  private temporal(): Node {
    let l = this.unary();
    while (this.peek() && BINARY.includes(this.peek()!.text) && this.peek()!.kind === 'word') {
      const op = this.take().text as BinaryTemporal;
      l = { t: 'binary', op, l, r: this.unary() };
    }
    return l;
  }

  private unary(): Node {
    const token = this.peek();
    if (token?.kind === 'word' || (token?.kind === 'symbol' && token.text === '!')) {
      if (token.text === 'not' || token.text === '!') {
        this.take();
        return { t: 'not', f: this.unary() };
      }
      if (UNARY.includes(token.text)) {
        this.take();
        return { t: 'unary', op: token.text as UnaryTemporal, f: this.unary() };
      }
      if (QUANTIFIERS.includes(token.text)) return this.quantified();
      if (token.text === 'disj' || token.text === 'let') throw new Error(`"${token.text}" is not supported`);
    }
    return this.comparison();
  }

  /** `all x: T, y, z: U | body`, or `some E` when no declaration follows. */
  private quantified(): Node {
    const q = this.take().text as Quantifier;
    if (!this.declaration()) return { t: 'mult', q, e: this.expression() };
    const decls: { names: string[]; type: Node }[] = [];
    do {
      const names = [this.take().text];
      while (this.is(',')) {
        this.take();
        names.push(this.take().text);
      }
      this.take(':');
      decls.push({ names, type: this.expression() });
    } while (this.is(',') && this.take());
    if (this.is('{')) throw new Error('a block after a quantifier is not supported; write "| formula"');
    this.take('|');
    return { t: 'quant', q, decls, body: this.formula() };
  }

  /** Whether the tokens ahead are names separated by commas and then a colon. */
  private declaration(): boolean {
    let ahead = 0;
    while (this.peek(ahead)?.kind === 'name') {
      ahead++;
      if (this.is(':', ahead)) return true;
      if (!this.is(',', ahead)) return false;
      ahead++;
    }
    return false;
  }

  private comparison(): Node {
    const l = this.expression();
    if (this.is('not') && this.is('in', 1)) {
      this.take();
      this.take();
      return { t: 'cmp', op: 'not in', l, r: this.expression() };
    }
    if (this.is('in')) {
      this.take();
      return { t: 'cmp', op: 'in', l, r: this.expression() };
    }
    if (this.is('=') || this.is('!=')) {
      const op = this.take().text as '=' | '!=';
      return { t: 'cmp', op, l, r: this.expression() };
    }
    return l;
  }

  // Expressions: union and difference, intersection, arrow, join, then the postfix forms.

  expression(): Node {
    let l = this.intersection();
    while (this.is('+') || this.is('-')) {
      const op = this.take().text;
      l = { t: op === '+' ? 'union' : 'diff', l, r: this.intersection() };
    }
    return l;
  }

  private intersection(): Node {
    let l = this.arrow();
    while (this.is('&')) {
      this.take();
      l = { t: 'inter', l, r: this.arrow() };
    }
    return l;
  }

  private arrow(): Node {
    let l = this.join();
    while (this.is('->')) {
      this.take();
      l = { t: 'arrow', l, r: this.join() };
    }
    return l;
  }

  private join(): Node {
    let l = this.postfix();
    while (this.is('.')) {
      this.take();
      l = { t: 'join', l, r: this.postfix() };
    }
    return l;
  }

  private postfix(): Node {
    let e = this.primary();
    for (;;) {
      if (this.is("'")) {
        this.take();
        e = { t: 'prime', e };
      } else if (this.is('[')) {
        if (e.t !== 'name') throw new Error('only a name can be called with "[ ]"');
        this.take();
        const args = [this.expression()];
        while (this.is(',')) {
          this.take();
          args.push(this.expression());
        }
        this.take(']');
        e = { t: 'call', name: e.name, args };
      } else return e;
    }
  }

  private primary(): Node {
    const token = this.take();
    if (token.kind === 'name') return { t: 'name', name: token.text };
    if (token.kind === 'symbol' && token.text === '(') {
      const inner = this.formula();
      this.take(')');
      return inner;
    }
    throw new Error(`cannot read "${token.text}" here`);
  }
}

/** The formula in `src`, or an Error that names what cannot be read. */
export function parseFormula(src: string): Node {
  const parser = new Parser(tokenize(src));
  const node = parser.formula();
  if (!parser.done()) throw new Error(`cannot read the formula after "${parser.rest().split(' ').slice(0, 4).join(' ')}"`);
  return node;
}
