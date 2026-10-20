/**
 * Say an Alloy formula in words, the same words every time. The formula is
 * read by `@bigmistqke/parse-alloy`, and what each name stands for comes from a table of
 * readings kept next to the vocabulary. Nothing is guessed:
 * a construct or a name with no reading is an error, so a rendering never says
 * more or less than the formula does.
 */
import { AlloyParseError, type Decl, type Node, parseFormula, parseModule, print } from '@bigmistqke/parse-alloy';

/**
 * What naturalloy throws when a formula cannot be said without loss: the message names what cannot be said. Anything else
 * it throws is a fault of naturalloy, never a reason the formula has no words.
 */
export class Refusal extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Refusal';
  }
}

/** Whether an error is a refusal, also when it comes from another copy of naturalloy. */
export const isRefusal = (error: unknown): error is Refusal => error instanceof Error && error.name === 'Refusal';

/** An error rethrown unless it is a refusal. */
function asRefusal(error: unknown): Refusal {
  if (!isRefusal(error)) throw error;
  return error;
}

/** How one thing is said, with `{1}`, `{2}` for the variables it is about. */
interface Reading {
  positive: string;
  negative?: string;
  /** Where a word in brackets that names no link of its own links to: the place that holds the line, as an href. */
  target?: string;
}

/** A predicate of the vocabulary: its parameters and its body, which says that the parameters marked `disj` are different. */
export interface Definition {
  params: string[];
  body: Node;
}

/** A function of the vocabulary: its parameters, the type of its value, and the expression that is its value. */
export interface Function {
  params: string[];
  result: Node;
  body: Node;
}

export interface Readings {
  /** The noun for a signature: `Owner` is "owner". */
  nouns: Map<string, string>;
  /** Where a variable of the type links to where it is introduced, as an href: the place that holds a noun with a word in brackets, or the link the bracket names. */
  nounTargets: Map<string, string>;
  /** The article of a noun that was written with one, `noun Hour: an hour`: the default goes by the sound of the word, and a noun can say otherwise. */
  articles: Map<string, string>;
  /** The reading of a set, a field, a relation or a predicate, by its name. */
  atoms: Map<string, Reading>;
  /**
   * The predicates of the vocabulary. A call of one that has no reading of its
   * own is said by its body, with the arguments in place of the parameters.
   */
  definitions: Map<string, Definition>;
  /** The fields the vocabulary declares, each with the signature that declares it and the type it points at: `on` is from `Cleanup` to `Owner`. */
  fields: Map<string, Field>;
  /** The signatures the vocabulary declares `var`, whose members change from one moment to the next. */
  variables: Set<string>;
  /** The signature that holds each signature of the vocabulary: the one it is declared `in` or `extends`, or itself when it stands on its own. One declared in several has none. */
  holders: Map<string, string>;
  /** The functions of the vocabulary. A call of one that has no reading of its own is said by its body. */
  functions: Map<string, Function>;
  /** The macros of the vocabulary, `let m[x] = …`, whose calls are said by their bodies. */
  macros: Map<string, Definition>;
}

/** A field of a signature, from the signature to the type it points at. Its owner is unknown when one declaration declares it for several signatures. */
interface Field {
  owner?: string;
  type: string;
  /** Whether it can hold more than one value: declared `set` or `some`, and not `one` or `lone`. */
  many: boolean;
  /** Whether it holds exactly one value: declared `one`, or with no multiplicity. */
  exact: boolean;
}

/** The predicates of a module: `pred name[a: T, disj b, c: U] { body }`, read by the parser. A receiver's predicate is left out. */
export function parseDefinitions(vocabulary: string): Map<string, Definition> {
  const definitions = new Map<string, Definition>();
  for (const p of parseModule(vocabulary).paragraphs) {
    if (p.t !== 'pred') continue;
    const params = paramsOf(p);
    definitions.set(p.name, { params: params.flatMap(d => d.names), body: unqualified(withDifferences(params, p.body)) });
  }
  return definitions;
}

/** The parameters of a predicate or a function: a predicate of a signature, `pred T.p[…]`, takes `this` of that signature first. */
function paramsOf(p: { receiver?: string; params?: Decl[] }): Decl[] {
  return [...(p.receiver === undefined ? [] : [{ names: ['this'], type: { t: 'name', name: p.receiver } } as Decl]), ...(p.params ?? [])];
}

/** The functions of a module: `fun name[a: T]: U { e }`, with `this` first for a function of a signature. */
export function parseFunctions(vocabulary: string): Map<string, Function> {
  const functions = new Map<string, Function>();
  for (const p of parseModule(vocabulary).paragraphs) if (p.t === 'fun') functions.set(p.name, { params: paramsOf(p).flatMap(d => d.names), result: unqualified(p.result), body: unqualified(p.body) });
  return functions;
}

/** The macros of a module: `let name[a, b] = …` and `let name[a, b] { … }`. */
export function parseMacros(vocabulary: string): Map<string, Definition> {
  const macros = new Map<string, Definition>();
  for (const p of parseModule(vocabulary).paragraphs) if (p.t === 'macro') macros.set(p.name, { params: p.params ?? [], body: unqualified(p.body) });
  return macros;
}

/** A body with the condition that the parameters of each declaration marked `disj` are different. */
function withDifferences(params: Decl[], body: Node): Node {
  const different: Node[] = params
    .filter(d => d.disj || d.disjType)
    .flatMap(d => d.names.flatMap((a, i) => d.names.slice(i + 1).map((b): Node => ({ t: 'cmp', op: '!=', l: { t: 'name', name: a }, r: { t: 'name', name: b } }))));
  return different.length === 0 ? body : { t: 'and', items: [...different, ...(body.t === 'and' ? body.items : [body])] };
}

/**
 * The fields that the signatures of a module declare, with the type each
 * points at. A field of more than one column, a field defined by an
 * expression, and one that two declarations declare are left out: none has one type.
 */
export function parseFields(vocabulary: string): Map<string, Field> {
  const fields = new Map<string, Field>();
  const untyped = new Set<string>();
  for (const sig of parseModule(vocabulary).paragraphs) {
    if (sig.t !== 'sig') continue;
    for (const decl of sig.fields) {
      const type = decl.defined ? undefined : decl.type.t === 'name' ? { name: decl.type.name, q: 'one' } : decl.type.t === 'mult' && decl.type.e.t === 'name' ? { name: decl.type.e.name, q: decl.type.q } : undefined;
      for (const name of decl.names) {
        if (fields.has(name) || type === undefined) untyped.add(name);
        fields.set(name, { owner: sig.names.length === 1 ? sig.names[0] : undefined, type: type?.name ?? '', many: type?.q === 'set' || type?.q === 'some', exact: type?.q === 'one' });
      }
    }
  }
  for (const name of untyped) fields.delete(name);
  return fields;
}

/** The signatures a module declares `var`. */
export function parseVariables(vocabulary: string): Set<string> {
  return new Set(parseModule(vocabulary).paragraphs.flatMap(p => (p.t === 'sig' && p.var ? p.names : [])));
}

/** The signature that holds each signature of a module: `Emitting` in `var sig Emitting in Edge` is held by `Edge`, and `Edge` in `sig Edge {}` by itself. */
export function parseHolders(vocabulary: string): Map<string, string> {
  const holders = new Map<string, string>();
  for (const p of parseModule(vocabulary).paragraphs) {
    if (p.t !== 'sig') continue;
    const holder = p.parent === undefined ? undefined : p.parent.kind !== '=' && p.parent.names.length === 1 ? p.parent.names[0] : null;
    if (holder === null) continue;
    for (const name of p.names) holders.set(name, holder ?? name);
  }
  return holders;
}

/**
 * The readings with what a module declares: its predicates, so that one with
 * no reading of its own can be said by its body, its fields and its `var`
 * signatures, and the signature that holds each signature. Throws an AlloyParseError when the vocabulary is not Alloy.
 */
export const withDefinitions = (readings: Readings, vocabulary: string): Readings => ({
  ...readings,
  definitions: parseDefinitions(vocabulary),
  fields: parseFields(vocabulary),
  variables: parseVariables(vocabulary),
  holders: parseHolders(vocabulary),
  functions: parseFunctions(vocabulary),
  macros: parseMacros(vocabulary)
});

/**
 * Read a table of readings, held at `target`, an href. A word in brackets names
 * a term and links to `target`, `[freelancing]`, or to the href it names,
 * `[checker](#term-checker)`. A line is `noun Name: words`, which
 * may start with the article the noun takes (`noun Hour: an hour`), or
 * `key: positive | negative` for an atom, whose key is the name of a set
 * (`Ran`), a field (`on`), a relation (`Clock.older`), a primed set (`Throwing'`)
 * or a predicate (`dispose`). Blank lines and lines that start with `#` are skipped.
 * A table held in another document has `base`, the path to that document: a
 * link in it to an anchor of its own document, `(#term-checker)`, goes through the path.
 */
export function parseReadings(text: string, target?: string, base?: string): Readings {
  const readings: Readings = { nouns: new Map([['Int', 'integer'], ['seq/Int', 'sequence index']]), nounTargets: new Map(), articles: new Map(), atoms: new Map(), definitions: new Map(), fields: new Map(), variables: new Set(), holders: new Map(), functions: new Map(), macros: new Map() };
  for (const raw of text.split('\n')) {
    const line = (base === undefined ? raw : raw.replace(/\]\(#([^)\s]+)\)/g, `](${base}#$1)`)).trim();
    if (line === '' || line.startsWith('#')) continue;
    const noun = /^noun\s+(\w+)\s*:\s*(.+)$/.exec(line);
    if (noun) {
      const written = /^(an?)\s+(.+)$/.exec((noun[2] as string).trim());
      readings.nouns.set(noun[1] as string, written ? (written[2] as string) : (noun[2] as string).trim());
      if (written) readings.articles.set(noun[1] as string, written[1] as string);
      // The variables of the type link to its term only where the author marked the noun.
      const marked = /\[([^\]]+)\](?:\(([^)\s]*#[^)\s]+)\))?/.exec(noun[2] as string);
      const to = marked === null ? undefined : (marked[2] ?? target);
      if (to !== undefined) readings.nounTargets.set(noun[1] as string, to);
      balanced(line);
      continue;
    }
    const atom = /^([\w.'/]+)\s*:\s*(.+)$/.exec(line);
    if (!atom) throw new Refusal(`cannot read the line of readings: ${line}`);
    const [positive, negative] = (atom[2] as string).split('|').map(part => part.trim());
    readings.atoms.set(atom[1] as string, { positive: positive as string, negative, target });
    balanced(line);
  }
  return readings;
}

/** Marks a word that names a term, and so links: the mark, the href, the mark, the word, the mark. */
const LINK = '\u0002';
const LINK_MARK = /\u0002([^\u0002]*)\u0002([^\u0002]*)\u0002/g;

/** A word in brackets, with the href it links to when it names one. */
const BRACKETED = /\[([^\]]+)\](?:\(([^)\s]*#[^)\s]+)\))?/g;

/** Words of a reading or a noun without the brackets and the links of their terms: `[checker](#term-checker)` is "checker". */
export const unbracketed = (words: string): string => words.replace(BRACKETED, (_, word: string) => word);

function balanced(line: string): void {
  if (/[[\]]/.test(line.replace(BRACKETED, ''))) throw new Refusal(`a bracket in the line of readings has no partner: ${line}`);
}

/** The words of a reading, where each word in brackets is marked as the name of a term: it links to the href it names, or else to the place that holds the reading. */
function mark(words: string, target: string | undefined): string {
  return words.replace(BRACKETED, (_, word: string, href: string | undefined) => {
    const to = href ?? target;
    return to === undefined ? word : `${LINK}${to}${LINK}${word}${LINK}`;
  });
}

/** The words without the marks of their links. */
const plain = (words: string): string => words.replace(LINK_MARK, (_, __, word: string) => word);

/**
 * Resolve the marks of links, in the order a reader meets them. Only the first
 * mention of a term is a link, and nothing links to `self`, the href of the
 * place the words are for; the text layout has no links.
 */
function resolveLinks(text: string, links: boolean, self: string | undefined): string {
  const seen = new Set<string>(self === undefined ? [] : [self]);
  return text.replace(LINK_MARK, (_, target: string, word: string) => {
    if (!links || seen.has(target)) return word;
    seen.add(target);
    return `[${word}](${target})`;
  });
}

/** Marks a variable in the words, so that a sentence is never started with a capital in place of the variable's own letter. */
const VARIABLE = '\u0001';

/**
 * A variable stood in for while a clause is tried: the clause is said once with
 * the hole in place of the variable, and the hole is then filled with a noun
 * phrase if the variable turns out to be said once.
 */
const holeOf = (level: number): string => String.fromCharCode(3 + level);
const slotOf = (level: number): string => `${VARIABLE}${holeOf(level)}${VARIABLE}`;

/** What a consequent that starts with a time phrase needs "then" before: "when A, then now or at a later moment, B". */
const TIME_PHRASE = /^(?:now or at|now and at|at every|at the next|right after|there is a moment before|up to and including|back to and including|in integers that wrap)\b/;

/** Whether a clause begins with a time phrase, which covers what follows it in the sentence. */
const timed = (clause: string): boolean => TIME_PHRASE.test(clause.replace(LINK_MARK, (_, __, word: string) => word).replaceAll(VARIABLE, ''));

/** The most that is said in a sentence, and not in a list, and how long it may be. */
const INLINE_ITEMS = 3;
const INLINE_LENGTH = 110;

/** What a clause with a primed name is said with, the words of `after`: "at the next moment, c has run". */
const NEXT = 'at the next moment, ';

const ALL = 'all of these hold:';
const ANY = 'at least one of these holds:';
const BOTH = 'both or neither of these hold:';
const ONE = 'exactly one of these holds:';
const UNTRUE = 'it is not the case that:';
const ALWAYS = 'this formula says nothing: it always holds, so it claims nothing';
const NEVER = 'this formula says nothing: it never holds, so it claims what cannot be';
/** A formula that never holds, as `x in none` is: the negation of the empty block. */
const FALSE: Node = { t: 'not', f: { t: 'true' } };
/** The names Alloy gives its own sets, which are never variables. */
const BUILTIN = new Set(['none', 'univ', 'iden', 'Int', 'String', 'steps', 'seq/Int', 'next', 'min', 'max']);

/** What a comparison of integers says, by its operator. */
const COMPARED: Record<string, string> = {
  '<': 'is less than', '>': 'is greater than', '=<': 'is at most', '>=': 'is at least', '=': 'is equal to',
  '!<': 'is not less than', '!>': 'is not greater than', '!=<': 'is not at most', '!>=': 'is not at least', '!=': 'is not equal to'
};
/** The negation of each operator of a comparison of integers. */
const NEGATED: Record<string, string> = { '<': '!<', '>': '!>', '=<': '!=<', '>=': '!>=', '=': '!=', '!<': '<', '!>': '>', '!=<': '=<', '!>=': '>=', '!=': '=' };
/** The words of a comparison of integers, which say that they wrap. */
const WRAP = "in integers that wrap around at the analyzer's bit width, ";
const MULTIPLIED = 'says how many each side relates, and no reading says that';

/** What a formula becomes before it is laid out: a clause, a list that ends in a colon, or a rule. */
type Doc =
  | string
  | { kind: 'list'; intro: string; items: Doc[] }
  | { kind: 'block'; intro: string; body: Doc }
  | { kind: 'rule'; when: Doc; then: Doc; otherwise?: Doc };

const isList = (doc: Doc): doc is Extract<Doc, { kind: 'list' }> => typeof doc !== 'string' && doc.kind === 'list';

/** Whether a formula holds `until`, `since`, `releases`, `triggered` or `;` anywhere in it. */
function holdsBinary(node: Node): boolean {
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

/** Put words in front of a doc, on its first line. */
function prefix(words: string, doc: Doc): Doc {
  if (typeof doc === 'string') return words + doc;
  if (doc.kind === 'rule') return { kind: 'block', intro: words.replace(/,\s*$/, ':'), body: doc };
  return { ...doc, intro: words + doc.intro };
}

/** What a reader calls each construct of an expression or a formula, for a refusal to name it. */
const CONSTRUCTS: Record<Node['t'], string> = {
  name: 'name', number: 'number', string: 'string', true: 'true formula', prime: 'primed expression', transpose: 'transpose', closure: 'closure', rclosure: 'reflexive closure',
  join: 'navigation', call: 'call', box: 'box join', arrow: 'arrow', domain: 'domain restriction', range: 'range restriction', inter: 'intersection', override: 'override',
  union: 'union', diff: 'difference', arith: 'integer operation', card: 'count', cast: 'cast to an integer', cmp: 'comparison', mult: 'multiplicity', not: 'negation', and: 'conjunction',
  or: 'disjunction', implies: 'rule', ite: 'rule with an else', iff: 'equivalence', unary: 'temporal operator', binary: 'temporal operator', quant: 'quantifier', let: 'let', comprehension: 'set comprehension'
};

/** The name a node stands for: a variable, a set, a field. */
function nameOf(node: Node, what: string): string {
  if (node.t !== 'name') throw new Refusal(`${what} must be a name, not a ${CONSTRUCTS[node.t]}`);
  return node.name;
}

/** The operator a `not` before a comparison of two values makes: `not x = y` is `x != y`, and `not x in y` is `x not in y`. */
const NEGATED_MEMBERSHIP: Record<string, string> = { '=': '!=', in: 'not in' };

/**
 * What a condition says the variable `x` differs from, when that is all it
 * says: `x != y`, `not x = y`, and for a string, which is one atom, `x not in
 * "a"` and `not x in "a"`. Undefined for any other condition.
 */
function differsFrom(part: Node, x: string): Node | undefined {
  const [op, l, r] = part.t === 'cmp' ? [part.op, part.l, part.r] : part.t === 'not' && part.f.t === 'cmp' ? [NEGATED_MEMBERSHIP[part.f.op], part.f.l, part.f.r] : [undefined, undefined, undefined];
  if (l === undefined || r === undefined) return undefined;
  const value = (n: Node): boolean => n.t === 'name' || n.t === 'string';
  const isX = (n: Node): boolean => n.t === 'name' && n.name === x;
  if (op === '!=' && value(l) && value(r) && (isX(l) || isX(r))) return isX(l) ? r : l;
  if (op === 'not in' && isX(l) && r.t === 'string') return r;
  return undefined;
}

/** A doc said as untrue. Only a clause, or a list of them, can be. */
function untrue(doc: Doc): Doc {
  if (typeof doc === 'string') return `it is not the case that ${doc}`;
  if (doc.kind === 'list') return { ...doc, intro: `it is not the case that ${doc.intro}` };
  throw new Refusal('a definition that is a rule or has a "for every" cannot be said as untrue; give it a reading');
}

/** A name for a member that the words introduce, which no formula can use: each is said by its noun and number. */
let members = 0;
const member = (): Node => ({ t: 'name', name: `\u0000${++members}` });

/** An expression as a reader writes it, for a refusal to name: `c.(on + reached)`. */
function shown(e: Node): string {
  let text = print(e);
  for (let before = ''; before !== text; ) [before, text] = [text, text.replace(/\(([\w.']+)\)/g, '$1')];
  return /^\((.*)\)$/.test(text) && balancedParens(text.slice(1, -1)) ? text.slice(1, -1) : text;
}

function balancedParens(text: string): boolean {
  let depth = 0;
  for (const c of text) if ((depth += c === '(' ? 1 : c === ')' ? -1 : 0) < 0) return false;
  return depth === 0;
}

/** A formula with the names of this module as plain names: `this/Ran` and `@Ran` are `Ran`, and `fun/min`, `fun/max` and `fun/next` are `min`, `max` and `next`. */
function unqualified(node: Node): Node {
  const walk = (n: unknown): unknown => {
    if (Array.isArray(n)) return n.map(walk);
    if (n === null || typeof n !== 'object') return n;
    const o = { ...(n as Record<string, unknown>) };
    if ((o.t === 'name' || o.t === 'call') && typeof o.name === 'string') o.name = o.name.replace(/^@/, '').replace(/^this\//, '').replace(/^fun\/(min|max|next)$/, '$1');
    for (const [key, value] of Object.entries(o)) if (key !== 'span' && key !== 'name') o[key] = walk(value);
    return o;
  };
  return walk(node) as Node;
}

/** How many formulas deep a formula may be said, across the verbalizers of the calls in it, before it counts as never ending. */
const SAYING_DEPTH = 1000;
let sayingDepth = 0;

/** A formula as the verbalizer reads it: parsed, with the names of this module plain. */
const read = (source: string): Node => {
  try {
    return unqualified(parseFormula(source));
  } catch (error) {
    if (error instanceof AlloyParseError) throw new Refusal(error.message);
    throw error;
  }
};

/** The names of the predicates and functions a formula calls. */
function callsIn(node: unknown, found = new Set<string>()): Set<string> {
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
 * A formula with `value` in the place of the name `name`, for `of`: the `let` or the parameter that names it.
 * A quantifier or a `let` that declares the name again hides it from there on;
 * one that declares a name the value uses, where the name is put, would
 * capture it, and is refused.
 */
function substitute(node: Node, name: string, value: Node, of: string): Node {
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

/** The body of a `let` with each value in the place of its name: `let a = e, b = f | g` is `let a = e | let b = f | g`. */
function expanded(node: Extract<Node, { t: 'let' }>): Node {
  return node.binds.reduceRight((body, bind) => substitute(body, bind.name, bind.value, `the "let" of "${bind.name}"`), node.body);
}

/**
 * The formula that `not node` equals with the `not` moved one step inward,
 * where there is one: `not (a and b)` is `not a or not b`, `not all x | f` is
 * `some x | not f`, `not always f` is `eventually not f`. Undefined for a formula
 * whose negation has no such form: `one`, `lone`, `before` and the binary temporal operators.
 */
function inward(node: Node): Node | undefined {
  const not = (f: Node): Node => ({ t: 'not', f });
  switch (node.t) {
    case 'and':
      return { t: 'or', items: node.items.map(not) };
    case 'or':
      return { t: 'and', items: node.items.map(not) };
    case 'implies':
      return { t: 'and', items: [node.l, not(node.r)] };
    case 'ite':
      return { ...node, a: not(node.a), b: not(node.b) };
    case 'quant': {
      const dual: Partial<Record<string, Node>> = { some: { ...node, q: 'no' }, no: { ...node, q: 'some' }, all: { ...node, q: 'some', body: not(node.body) } };
      return dual[node.q];
    }
    case 'unary': {
      const dual: Partial<Record<string, string>> = { always: 'eventually', eventually: 'always', historically: 'once', once: 'historically', after: 'after' };
      const op = dual[node.op];
      return op === undefined ? undefined : ({ ...node, op, f: not(node.f) } as Node);
    }
    default:
      return undefined;
  }
}

class Verbalizer {
  private readonly readings: Readings;
  /** The arguments of the call being said, by the parameter they stand in for. */
  private readonly bound: Map<string, string>;
  /** The predicates being said by their bodies, innermost last. */
  private readonly chain: string[];
  /**
   * The names of the variables used so far in the whole rendering. A quantifier
   * that would reuse one gets a numbered name instead, so that two variables
   * that are different never look like one in the words.
   */
  private readonly used: Set<string>;
  /** How many variables are being tried for a noun phrase around this one: each has a hole of its own. */
  private readonly level: number;
  /** The formulas being said, outermost first, as written: one that comes back while it is being said would never end. */
  private readonly saying = new Set<string>();

  constructor(readings: Readings, bound: Map<string, string> = new Map(), chain: string[] = [], used: Set<string> = new Set(), level = 0) {
    this.readings = readings;
    this.bound = bound;
    this.chain = chain;
    this.used = used;
    this.level = level;
  }

  /** A variable of the formula: inside the body of a predicate, its parameter stands for the argument. */
  private variable(node: Node, what: string): string {
    if (node.t === 'string') return JSON.stringify(node.value);
    const name = nameOf(node, what);
    if (name === 'this' && !this.bound.has(name)) throw new Refusal('Alloy does not read "this" outside a predicate or a function of a signature');
    if (!this.isVariable(name)) throw new Refusal(`"${name}" is a set or a field, where a variable must be`);
    return this.bound.get(name) ?? name;
  }

  /** Whether a name stands for one thing: a variable, and not a set, a signature or a field of the vocabulary. */
  private isVariable(name: string): boolean {
    return this.bound.has(name) || !(BUILTIN.has(name) || this.readings.atoms.has(name) || this.readings.nouns.has(name) || this.readings.fields.has(name) || this.readings.holders.has(name));
  }

  /** Whether a node is one thing a reading can take in a slot: a variable or a string. */
  private isValue(node: Node): boolean {
    return (node.t === 'name' && this.isVariable(node.name)) || node.t === 'string';
  }

  /** The expression without its prime, and whether it had one: `Ran'`, `c.on'` and `(c.on)'` are each one name primed. */
  private unprimed(node: Node): { e: Node; primed: boolean } {
    // A side of a navigation without its prime, through a transpose: `~(on')` is `(~on)'`.
    const side = (n: Node): Node | undefined => (n.t === 'prime' ? n.e : n.t === 'transpose' && n.e.t === 'prime' ? { t: 'transpose', e: n.e.e } : undefined);
    const [r, l] = node.t === 'join' ? [side(node.r), side(node.l)] : [undefined, undefined];
    const found =
      node.t === 'prime'
        ? { e: node.e, primed: true }
        : node.t === 'join' && r !== undefined
          ? { e: { ...node, r }, primed: true }
          : node.t === 'join' && l !== undefined
            ? { e: { ...node, l }, primed: true }
            : { e: node, primed: false };
    // `Sig.rel` read as a relation of its own: the prime moves `Sig` as well, and its reading names `Sig` as it is now.
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

  /**
   * A navigation `y.f` or `f.y` of a variable `y` and a field `f`: the field,
   * the variable, and the type of what the navigation reaches. Undefined for a
   * join that the readings say as a relation of its own, as `Clock.older`.
   */
  private navigation(join: Node): { field: string; from: Node; forward: boolean; type: string } | undefined {
    // `y.~f` is `f.y`, and `~f.y` is `y.f`, for a variable `y`, which is one thing.
    const node: Node =
      join.t !== 'join' ? join
      : join.r.t === 'transpose' && join.l.t === 'name' && this.isVariable(join.l.name) ? { t: 'join', l: join.r.e, r: join.l }
      : join.l.t === 'transpose' && join.r.t === 'name' && this.isVariable(join.r.name) ? { t: 'join', l: join.r, r: join.l.e }
      : join;
    if (node.t !== 'join' || node.l.t !== 'name' || node.r.t !== 'name') return undefined;
    if (this.readings.atoms.has(`${node.l.name}.${node.r.name}`)) return undefined;
    const { l, r } = node;
    const forward = this.readings.fields.get(r.name);
    if (this.isVariable(l.name) && forward !== undefined) return { field: r.name, from: l, forward: true, type: forward.type };
    const backward = this.readings.fields.get(l.name);
    if (this.isVariable(r.name) && backward?.owner !== undefined) return { field: l.name, from: r, forward: false, type: backward.owner };
    return undefined;
  }

  /** `x in y.f` and `x in f.y`, with the reading of the field: `y` in its first slot and `x` in its second, or `x` and `y`. */
  private member(x: Node, nav: { field: string; from: Node; forward: boolean }, negative: boolean): string {
    const [one, other] = [this.variable(x, 'the left of "in"'), this.variable(nav.from, 'the variable of a navigation')];
    return this.say(nav.field, nav.forward ? [other, one] : [one, other], negative);
  }

  /**
   * A call, said by the reading the table gives it, or else by the body of the
   * predicate. An argument that is an expression is put in place in the body;
   * a reading takes it only when it holds one value, through the member in it.
   */
  private call(node: Extract<Node, { t: 'call' }>, negative: boolean): Doc {
    const apart = this.disjoint(node);
    if (apart !== undefined) return negative ? this.negation(apart) : this.doc(apart);
    const given = node.args.map(a => this.shape(a));
    const isVariable = (a: Node): boolean => this.isValue(a);
    if (this.readings.atoms.has(node.name)) {
      const through = this.throughMember(node, negative);
      return through === undefined ? this.say(node.name, given.map(a => this.variable(a, 'an argument')), negative) : this.doc(through);
    }
    const definition = this.readings.definitions.get(node.name) ?? this.readings.macros.get(node.name);
    if (definition === undefined) throw new Refusal(`no reading for "${node.name}"`);
    if (this.chain.includes(node.name)) throw new Refusal(`"${node.name}" is defined in terms of itself; give it a reading`);
    if (definition.params.length !== given.length) throw new Refusal(`"${node.name}" takes ${definition.params.length} arguments, not ${given.length}`);
    // A variable stands in for its parameter; an expression is put in its place, with the names of this scope.
    const bound = new Map<string, string>();
    let body = definition.body;
    definition.params.forEach((param, i) => {
      const arg = given[i] as Node;
      if (isVariable(arg)) bound.set(param, this.variable(arg, 'an argument'));
      else body = substitute(body, param, this.resolved(arg), `"${node.name}", for its parameter "${param}",`);
    });
    for (const arg of bound.values()) this.used.add(arg);
    const inside = new Verbalizer(this.readings, bound, [...this.chain, node.name], this.used);
    let doc: Doc;
    try {
      doc = inside.doc(body);
    } catch (error) {
      throw new Refusal(`no reading for "${node.name}", and its body cannot be said: ${asRefusal(error).message}`);
    }
    return negative ? untrue(doc) : doc;
  }

  private say(key: string, slots: string[], negative: boolean): string {
    const reading = this.readings.atoms.get(key);
    if (!reading) throw new Refusal(`no reading for "${key}"`);
    const words = negative ? reading.negative : reading.positive;
    if (words === undefined) throw new Refusal(`no negative reading for "${key}"`);
    const said = mark(words, reading.target).replace(/\{(\d+)\}/g, (_, n: string) => {
      const slot = slots[Number(n) - 1];
      if (slot === undefined) throw new Refusal(`the reading of "${key}" uses {${n}}, which the formula does not give`);
      return `${VARIABLE}${slot}${VARIABLE}`;
    });
    const missing = slots.findIndex((_, i) => !words.includes(`{${i + 1}}`));
    if (missing !== -1) throw new Refusal(`the reading of "${key}" leaves out {${missing + 1}}, which the formula gives`);
    return said;
  }

  /** The article a noun was written with, with the space that follows it. */
  private written(type: Node): string | undefined {
    const article = this.readings.articles.get(nameOf(type, 'the type of a quantified variable'));
    return article === undefined ? undefined : `${article} `;
  }

  /**
   * A new variable of the type, named after its noun and the number it is: the
   * first unit is unit_1 and the next is unit_2. The name says what the variable
   * is wherever it is read, whatever the formula called it. Where it is
   * introduced it links to the term for the type.
   */
  private fresh(type: Node): { name: string; shown: string; article: string } {
    const typeName = nameOf(type, 'the type of a quantified variable');
    const written = this.readings.nouns.get(typeName);
    if (written === undefined) throw new Refusal(`no noun for "${typeName}"`);
    const noun = unbracketed(written).trim();
    const base = noun.replace(/\s+/g, '_');
    let n = 1;
    while (this.used.has(`${base}_${n}`)) n++;
    const name = `${base}_${n}`;
    this.used.add(name);
    const target = this.readings.nounTargets.get(typeName);
    return { name, shown: target === undefined ? name : `${LINK}${target}${LINK}${name}${LINK}`, article: this.written(type) ?? articleFor(noun) };
  }

  /** `disj[a, b, …]`, the predicate Alloy gives, as the formula it means: no two arguments share a member. Undefined for any other call. */
  private disjoint(node: Extract<Node, { t: 'call' }>): Node | undefined {
    if (node.name !== 'disj' || this.readings.atoms.has('disj') || this.readings.definitions.has('disj')) return undefined;
    const pairs = node.args.flatMap((a, i) =>
      node.args.slice(i + 1).map((b): Node => (this.isValue(this.shape(a)) && this.isValue(this.shape(b)) ? { t: 'cmp', op: '!=', l: a, r: b } : { t: 'mult', q: 'no', e: { t: 'inter', l: a, r: b } }))
    );
    return pairs.length === 1 ? (pairs[0] as Node) : { t: 'and', items: pairs };
  }

  /**
   * A call with a reading and an argument that is an expression, as the formula
   * it is said through: the one member of the argument, in its place, "c belongs
   * to an owner that pulse disposes". Undefined when every argument is a variable.
   */
  private throughMember(node: Extract<Node, { t: 'call' }>, negative: boolean): Node | undefined {
    const given = node.args.map(a => this.shape(a));
    const at = given.findIndex(a => !this.isValue(a));
    if (at === -1) return undefined;
    const arg = given[at] as Node;
    const type = this.columns(arg);
    if (!this.exact(arg) || type?.length !== 1 || type[0] === '') throw new Refusal(`the reading of "${node.name}" takes one thing, and "${shown(arg)}" can hold none or several`);
    const m = member();
    const call: Node = { t: 'call', name: node.name, args: given.map((a, i) => (i === at ? m : a)) };
    return { t: 'quant', q: 'some', decls: [{ names: [nameOf(m, '')], type: { t: 'name', name: type[0] as string } }], body: { t: 'and', items: [this.inside([m], arg), negative ? { t: 'not', f: call } : call] } };
  }

  /** An expression with each variable of this scope named as the words name it, so that it means the same in the body of a call. */
  private resolved(e: Node): Node {
    const walk = (n: unknown): unknown => {
      if (Array.isArray(n)) return n.map(walk);
      if (n === null || typeof n !== 'object') return n;
      const o = n as Node;
      if (o.t === 'name') return this.bound.has(o.name) ? { t: 'name', name: this.bound.get(o.name) } : o;
      return Object.fromEntries(Object.entries(o).map(([key, v]) => [key, key === 'span' ? v : walk(v)]));
    };
    return walk(e) as Node;
  }

  /**
   * An expression as Alloy reads it: a box join of a field, `on[c]`, is the join
   * `c.on`; a call of a function, `f[c]` or `c.f`, keeps its name where it has
   * a reading and every argument is a variable, and is its body otherwise.
   */
  private shape(given: Node): Node {
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
      return this.shape(fn.params.reduce((body, param, i) => substitute(body, param, this.resolved(e.args[i] as Node), `"${e.name}", for its parameter "${param}",`), fn.body));
    }
    return e;
  }

  /** An expression without the `none` that changes nothing: `a + none` is `a`, `a - none` is `a`, and `a & none`, `none - a` and `none.f` are `none`. */
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

  /** A call of a function that its reading says: it has one, and every argument is a variable. */
  private readFunction(e: Node): boolean {
    return e.t === 'call' && this.readings.functions.has(e.name) && this.readings.atoms.has(e.name) && e.args.every(a => a.t === 'name' && this.isVariable(a.name));
  }

  /** A join with a predicate, `x.p` or `x.p[y]`, as the call it is: `p[x]`, `p[x, y]`. */
  private asCall(node: Node): Extract<Node, { t: 'call' }> | undefined {
    const predicate = (n: Node): n is Extract<Node, { t: 'name' }> =>
      n.t === 'name' && (this.readings.definitions.has(n.name) || this.readings.macros.has(n.name) || (this.readings.atoms.has(n.name) && !this.readings.fields.has(n.name) && !this.readings.holders.has(n.name)));
    if (node.t === 'join' && predicate(node.r)) return { t: 'call', name: node.r.name, args: [node.l] };
    if (node.t === 'box' && node.e.t === 'join' && predicate(node.e.r)) return { t: 'call', name: node.e.r.name, args: [node.e.l, ...node.args] };
    return undefined;
  }

  /** The signature with a noun that a set is a set of: the nearest one that holds it, or the set itself. */
  private kind(name: string): string {
    let at = name;
    for (let holder = this.readings.holders.get(at); !this.readings.nouns.has(at) && holder !== undefined && holder !== at; holder = this.readings.holders.get(at)) at = holder;
    return at;
  }

  /**
   * The types of the columns of an expression, as the vocabulary declares them:
   * `c.on` holds owners, `on` pairs of a cleanup and an owner. A variable is one
   * column, written '', whose type the words do not need. Undefined where the
   * vocabulary does not tell.
   */
  private columns(node: Node): string[] | undefined {
    const e = this.shape(node);
    switch (e.t) {
      case 'name': {
        if (e.name === 'iden') return ['univ', 'univ'];
        if (e.name === 'next') return ['Int', 'Int'];
        if (e.name === 'univ') return ['univ'];
        if (this.isVariable(e.name)) return [''];
        const field = this.readings.fields.get(e.name);
        if (field !== undefined) return field.owner === undefined ? undefined : [field.owner, field.type];
        return this.readings.holders.has(e.name) ? [this.kind(e.name)] : undefined;
      }
      case 'prime':
        return this.columns(e.e);
      case 'transpose': {
        const c = this.columns(e.e);
        return c?.length === 2 ? [c[1] as string, c[0] as string] : undefined;
      }
      case 'union': {
        const [a, b] = [this.columns(e.l), this.columns(e.r)];
        return a !== undefined && b !== undefined && a.join() === b.join() ? a : undefined;
      }
      case 'inter':
        return this.columns(e.l) ?? this.columns(e.r);
      case 'diff':
        return this.columns(e.l);
      case 'join': {
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
      case 'override': {
        const [a, b] = [this.columns(e.l), this.columns(e.r)];
        return a !== undefined && b !== undefined && a.join() === b.join() ? a : undefined;
      }
      case 'domain':
        return this.columns(e.r);
      case 'range':
      case 'closure':
        return this.columns(e.t === 'range' ? e.l : e.e);
      case 'comprehension': {
        const types = e.decls.flatMap(d => d.names.map(() => this.columns(d.type)));
        return types.every(t => t?.length === 1 && t[0] !== '') ? types.map(t => (t as string[])[0] as string) : undefined;
      }
      case 'call': {
        const result = this.readings.functions.get(e.name)?.result;
        const type = result?.t === 'mult' ? result.e : result;
        return type?.t === 'name' ? [this.kind(type.name)] : undefined;
      }
      default:
        return undefined;
    }
  }

  /** Whether the declarations make an expression one value: a variable, or a navigation of `one` fields from one. */
  private exact(e: Node): boolean {
    if (e.t === 'name' || e.t === 'string') return this.isValue(e);
    return e.t === 'join' && e.r.t === 'name' && this.readings.fields.get(e.r.name)?.exact === true && this.exact(e.l);
  }

  /** Whether an expression names a variable. */
  private ofVariable(e: Node): boolean {
    return [...namesIn(e)].some(name => this.isVariable(name) && !this.readings.definitions.has(name));
  }

  /** A join that the readings say as a relation of its own, as `Clock.older`. */
  private relation(e: Node): boolean {
    return e.t === 'join' && e.l.t === 'name' && e.r.t === 'name' && this.readings.atoms.has(`${e.l.name}.${e.r.name}`);
  }

  /** Whether `x in e` is said by a reading as it stands: `e` is a set, a primed name, a navigation of a variable or a relation of its own. */
  private direct(e: Node): boolean {
    if (e.t === 'name') return e.name !== 'iden';
    if (this.readFunction(e) || e.t === 'closure' || e.t === 'rclosure') return true;
    if (e.t === 'prime') return this.direct(e.e);
    if (e.t !== 'join') return false;
    const { e: bare } = this.unprimed(e);
    return this.navigation(bare) !== undefined || this.relation(bare);
  }

  /**
   * That a variable, or a pair of them, is in an expression, as a formula of
   * memberships the readings say: a union is "or", an intersection "and", a
   * navigation of an expression a pair in it, and a chain of navigations goes
   * through a member of the type between.
   */
  private inside(xs: Node[], node: Node): Node {
    const e = this.shape(node);
    const tuple = xs.slice(1).reduce((l: Node, r): Node => ({ t: 'arrow', l, r }), xs[0] as Node);
    const base: Node = { t: 'cmp', op: 'in', l: tuple, r: e };
    switch (e.t) {
      case 'union':
        return { t: 'or', items: [this.inside(xs, e.l), this.inside(xs, e.r)] };
      case 'inter':
        return { t: 'and', items: [this.inside(xs, e.l), this.inside(xs, e.r)] };
      case 'diff':
        return { t: 'and', items: [this.inside(xs, e.l), { t: 'not', f: this.inside(xs, e.r) }] };
      case 'prime':
        return e.e.t === 'name' ? base : { t: 'unary', op: 'after', f: this.inside(xs, e.e) };
      case 'transpose':
        return xs.length === 2 ? this.inside([xs[1] as Node, xs[0] as Node], e.e) : base;
      case 'override':
        // r ++ s: the pairs of s, and those of r whose first member s relates to nothing; a set's override is its union.
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
        const k = this.columns(e.l)?.length;
        return k === undefined || k >= xs.length ? base : { t: 'and', items: [this.inside(xs.slice(0, k), e.l), this.inside(xs.slice(k), e.r)] };
      }
      case 'join': {
        if (this.direct(e)) return base;
        const { l, r } = e;
        if (l.t === 'name' && this.isVariable(l.name)) return this.inside([l, ...xs], r);
        if (r.t === 'name' && this.isVariable(r.name)) return this.inside([...xs, r], l);
        const left = this.columns(l);
        const type = left?.[left.length - 1];
        if (left === undefined || type === undefined || type === '') return base;
        const k = left.length - 1;
        const m = member();
        // From a signature, the member is of the signature: "a cleanup is on o".
        const signature = l.t === 'name' && this.readings.holders.has(l.name);
        const body: Node = signature ? this.inside([m, ...xs.slice(k)], r) : { t: 'and', items: [this.inside([...xs.slice(0, k), m], l), this.inside([m, ...xs.slice(k)], r)] };
        return { t: 'quant', q: 'some', decls: [{ names: [nameOf(m, '')], type: signature ? l : { t: 'name', name: type } }], body };
      }
      default:
        return base;
    }
  }

  /** A refusal for an expression whose types the vocabulary does not tell, which names the construct that has no words, if it holds one. */
  private untyped(e: Node): Error {
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

  /** The one type of the members of an expression, or a refusal that names it. */
  private typeOf(...sides: Node[]): string {
    for (const side of sides) {
      const c = this.columns(side);
      if (c?.length === 1 && c[0] !== '') return c[0] as string;
    }
    throw this.untyped(sides[0] as Node);
  }

  /** Whether an expression is a number: a literal, a count, a sum, a cast, an operation of integers, `min` or `max`. */
  private integer(e: Node): boolean {
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

  /** Whether a comparison compares integers: by its operator, or by `=` or `!=` with a number on a side. */
  private comparesIntegers(node: Extract<Node, { t: 'cmp' }>): boolean {
    if (node.op in COMPARED && node.op !== '=' && node.op !== '!=') return true;
    return (node.op === '=' || node.op === '!=') && (this.integer(node.l) || this.integer(node.r));
  }

  /**
   * A comparison of integers, said in integers that wrap: "in integers that wrap
   * around at the analyzer's bit width, number_1 is greater than 2, where
   * number_1 is the number of values of owner_1 such that c is on owner_1".
   */
  private integers(node: Extract<Node, { t: 'cmp' }>, negative: boolean): Doc {
    const { l, r } = node;
    if (node.op === '=' || node.op === '!=') {
      const [number, other] = this.integer(l) ? [l, r] : [r, l];
      if (!this.integer(other) && !this.isValue(other)) throw new Refusal(`"${node.op}" between the set "${shown(other)}" and the number "${shown(number)}" compares sets, which the words would have to say with the wrap of the number`);
    }
    const defs: string[] = [];
    const [a, b] = [this.number(l, defs).words, this.number(r, defs).words];
    const op = negative ? (NEGATED[node.op] as string) : node.op;
    const main = `${WRAP}${a} ${COMPARED[op]} ${b}`;
    if (defs.length === 0) return main;
    if (defs.length === 1) return `${main}, where ${defs[0]}`;
    return { kind: 'list', intro: `${main}, where:`, items: defs };
  }

  /** A new name for a number that the words define after "where": number_1, number_2. */
  private numberName(): string {
    let n = 1;
    while (this.used.has(`number_${n}`)) n++;
    this.used.add(`number_${n}`);
    return `number_${n}`;
  }

  /**
   * The words of a number. A count, a sum or a division is named, and its
   * words go to `defs`, which a comparison says after "where". Inside a sum,
   * `defs` is undefined: a part there names the variable of the sum, so it is
   * said in place, and only as the last words of the sum.
   */
  private number(given: Node, defs: string[] | undefined): { words: string; open: boolean } {
    const e = this.shape(given);
    const named = (words: string, open: boolean): { words: string; open: boolean } => {
      if (defs === undefined) return { words, open };
      const name = this.numberName();
      defs.push(`${name} is ${words}`);
      return { words: name, open: false };
    };
    const closed = (part: { words: string; open: boolean }): string => {
      if (part.open) throw new Refusal(`"${shown(given)}" holds a count or a sum before other words, which would read two ways`);
      return part.words;
    };
    switch (e.t) {
      case 'number':
        return { words: String(e.value), open: false };
      case 'name':
        if (e.name === 'min' || e.name === 'max') return { words: e.name === 'min' ? 'the least integer' : 'the greatest integer', open: false };
        if (this.isValue(e)) return { words: `${VARIABLE}${this.variable(e, 'a number')}${VARIABLE}`, open: false };
        return named(this.summed(e), true);
      case 'card':
        return named(this.countOf(e.e), true);
      case 'cast':
        if (this.isValue(e.e)) return { words: `${VARIABLE}${this.variable(e.e, 'a number')}${VARIABLE}`, open: false };
        return named(this.summed(e.e), true);
      case 'quant': {
        if (e.q !== 'sum') break;
        const scope = new Map(this.bound);
        const vars = e.decls.flatMap(({ names, type }) =>
          names.map(name => {
            const variable = this.fresh(this.plainType(type));
            scope.set(name, variable.name);
            return variable;
          })
        );
        const body = new Verbalizer(this.readings, scope, this.chain, this.used, this.level).number(e.body, undefined);
        return named(`the sum, over every ${vars.map(v => v.shown).join(' and every ')}, of ${body.words}`, true);
      }
      case 'arith':
      case 'call':
      case 'box': {
        const [op, args] =
          e.t === 'arith' ? [e.op, [e.l, e.r]] : e.t === 'call' ? [e.name, e.args] : [nameOf((e.e as Extract<Node, { t: 'join' }>).r, ''), [(e.e as Extract<Node, { t: 'join' }>).l, ...e.args]];
        if (op === '<<' || op === '>>' || op === '>>>') throw new Refusal(`"${op}" shifts by the lowest bits of the amount, which the words do not say`);
        if (args.length !== 2) throw new Refusal(`"${op}" takes two numbers, not ${args.length}`);
        const [x, y] = [closed(this.number(args[0] as Node, defs)), this.number(args[1] as Node, defs)];
        const words: Record<string, string> = { add: 'plus', plus: 'plus', sub: 'minus', minus: 'minus', mul: 'times' };
        if (words[op] !== undefined) return { words: `${x} ${words[op]} ${y.words}`, open: y.open };
        if (defs === undefined) throw new Refusal(`"${shown(given)}" divides inside a sum, which the words would have to say in the middle of it`);
        const z = closed(y);
        if (op === 'div' || op === 'divide') return named(`${x} divided by ${z}, rounded toward zero; when ${z} is 0, it is -1, 0 or 1 as ${x} is positive, zero or negative`, false);
        if (op === 'rem') return named(`the remainder of ${x} divided by ${z}, with the sign of ${x}; when ${z} is 0, it is ${x}`, false);
        throw new Refusal(`"${op}" has no words`);
      }
      default:
        break;
    }
    // A set of integers where a number belongs: the sum of its members.
    return named(this.summed(e), true);
  }

  /** The type of a declaration as one name, the way `plain()` reads it. */
  private plainType(type: Node): Node {
    const node = this.plain({ t: 'quant', q: 'some', decls: [{ names: ['\u0000type'], type }], body: { t: 'true' } });
    return (node.decls[0] as Decl).type;
  }

  /** `#e`: "the number of values of owner_1 such that c is on owner_1". */
  private countOf(e: Node): string {
    const types = this.columns(e);
    if (types === undefined || types.includes('')) throw this.untyped(e);
    const vars = types.map(type => this.fresh({ t: 'name', name: type }));
    const ms = vars.map((_, i): Node => ({ t: 'name', name: `\u0000count${i}` }));
    const condition = this.within(vars, ms, e);
    return vars.length === 1 ? `the number of values of ${(vars[0] as { shown: string }).shown} such that ${condition}` : `the number of combinations of ${vars.map(v => v.shown).join(' and ')} such that ${condition}`;
  }

  /** A set of integers where a number belongs: "the sum of the values of integer_1 such that c counts integer_1". */
  private summed(e: Node): string {
    const types = this.columns(e);
    if (types?.length !== 1 || this.kind(types[0] as string) !== 'Int') throw new Refusal(`"${shown(e)}" is not a number or a set of integers`);
    const value = this.fresh({ t: 'name', name: 'Int' });
    return `the sum of the values of ${value.shown} such that ${this.within([value], [{ t: 'name', name: '\u0000count0' }], e)}`;
  }

  /** That members, named by `vars`, are in an expression, as one clause or a run of them. */
  private within(vars: { name: string }[], ms: Node[], e: Node): string {
    const scope = new Map([...this.bound, ...ms.map((m, i): [string, string] => [nameOf(m, ''), (vars[i] as { name: string }).name])]);
    const said = new Verbalizer(this.readings, scope, this.chain, this.used, this.level).doc(this.inside(ms, e));
    if (typeof said !== 'string') throw new Refusal(`what "${shown(e)}" holds is more than a sentence, so its count has no words`);
    return said;
  }

  /** `e in s` for an expression `e` of a variable, member by member: for every member of `e`, it is in `s`. */
  private subset(l: Node, r: Node): Node {
    if (!this.ofVariable(l)) throw new Refusal(`"${shown(l)}" is a set or a field, where a variable must be`);
    const types = this.columns(l);
    if (types === undefined || types.includes('')) throw this.untyped(l);
    const ms = types.map(() => member());
    return { t: 'quant', q: 'all', decls: ms.map((m, i) => ({ names: [nameOf(m, '')], type: { t: 'name', name: types[i] as string } })), body: { t: 'implies', l: this.inside(ms, l), r: this.inside(ms, r) } };
  }

  /**
   * `x->y in ^r` and `x->y in *r`: "x reaches y in one or more steps", or zero or
   * more, where a step is said with the reading of `r`, over its own two members.
   */
  private reach(pair: Extract<Node, { t: 'arrow' }>, closure: Extract<Node, { t: 'closure' | 'rclosure' }>, negative: boolean): string {
    const [from, to] = [this.variable(pair.l, 'a side of "->"'), this.variable(pair.r, 'a side of "->"')];
    const types = this.columns(closure.e);
    if (types?.length !== 2 || types.includes('')) throw this.untyped(closure.e);
    const [p, q] = [this.fresh({ t: 'name', name: types[0] as string }), this.fresh({ t: 'name', name: types[1] as string })];
    const step = new Verbalizer(this.readings, new Map([...this.bound, ['\u0000from', p.name], ['\u0000to', q.name]]), this.chain, this.used, this.level).doc(
      this.inside([{ t: 'name', name: '\u0000from' }, { t: 'name', name: '\u0000to' }], closure.e)
    );
    if (typeof step !== 'string') throw new Refusal(`a step of "${shown(closure)}" is more than one clause`);
    const steps = closure.t === 'closure' ? 'one or more' : 'zero or more';
    return `${VARIABLE}${from}${VARIABLE} ${negative ? 'does not reach' : 'reaches'} ${VARIABLE}${to}${VARIABLE} in ${steps} steps, where a step from ${p.shown} to ${q.shown} is that ${step}`;
  }

  /** `a = b` member by member: for every member of their type, it is in `a` exactly when it is in `b`. */
  private equalMembers(l: Node, r: Node): Node {
    if (!this.ofVariable(l) && !this.ofVariable(r)) throw new Refusal(`"${shown(l)}" is a set or a field, where a variable must be`);
    const m = member();
    // A side that is a variable is the one member: `=` takes a name with no reading for a variable.
    const of = (side: Node): Node => (side.t === 'name' && this.isVariable(side.name) ? { t: 'cmp', op: '=', l: m, r: side } : this.inside([m], side));
    return { t: 'quant', q: 'all', decls: [{ names: [nameOf(m, '')], type: { t: 'name', name: this.typeOf(l, r) } }], body: { t: 'iff', l: of(l), r: of(r) } };
  }

  /**
   * The formula a comparison is said as, when it is said through members of
   * the types of its expressions and not by a reading as it stands; undefined
   * when a reading says it. A negation is a `not` before the formula.
   */
  private lowered(node: Extract<Node, { t: 'cmp' }>, negative: boolean): Node | undefined {
    const { op } = node;
    if (this.comparesIntegers(node)) return undefined;
    if ((op === 'in' || op === 'not in') && this.integer(node.l)) throw this.untyped(node.l);
    const [l, r] = [this.shape(node.l), this.shape(node.r)];
    const flip = negative !== (op === 'not in' || op === '!=');
    const not = (f: Node): Node => (flip ? { t: 'not', f } : f);
    const none = (n: Node): boolean => n.t === 'name' && n.name === 'none';
    // e = none and e in none: no e.
    if (op !== 'in' && op !== 'not in' && (none(l) || none(r))) return { t: 'mult', q: flip ? 'some' : 'no', e: none(l) ? r : l };
    if ((op === 'in' || op === 'not in') && none(r) && !(l.t === 'name' && this.isVariable(l.name)) && l.t !== 'arrow') return { t: 'mult', q: flip ? 'some' : 'no', e: l };
    if ((op === 'in' || op === 'not in') && none(r)) return not(FALSE);
    if (op === 'in' || op === 'not in') {
      if (l.t === 'arrow' && l.lm === undefined && l.rm === undefined && r.t === 'transpose') return this.lowered({ ...node, l: { t: 'arrow', l: l.r, r: l.l }, r: r.e }, negative);
      if (l.t === 'union' || r.t === 'diff') return undefined;
      if ((l.t !== 'name' && l.t !== 'arrow' && l.t !== 'string') || (l.t === 'arrow' && !(this.isValue(l.l) && this.isValue(l.r)))) return not(this.subset(l, r));
      // x in "a": a string is one atom, so to be in it is to be it.
      if (r.t === 'string' && this.isValue(l)) return not({ t: 'cmp', op: '=', l, r });
      if (this.direct(r) || this.signature(r)) return undefined;
      // With nothing to spell out, `inside` gives back `l in r`, which would lower to itself again: it is said as it stands, or refused.
      const spelled = this.inside(l.t === 'arrow' ? [l.l, l.r] : [l], r);
      return spelled.t === 'cmp' && spelled.op === 'in' && JSON.stringify(spelled.r) === JSON.stringify(r) ? undefined : not(spelled);
    }
    if ((l.t === 'name' || l.t === 'string') && (r.t === 'name' || r.t === 'string')) return undefined;
    const [left, right] = [this.unprimed(l), this.unprimed(r)];
    const isVariable = (n: Node): boolean => this.isValue(n);
    if (this.forward(left) && this.forward(right)) return flip ? not(this.equalMembers(l, r)) : undefined;
    const side = this.forward(left) && isVariable(r) ? left : this.forward(right) && isVariable(l) ? right : undefined;
    if (side === undefined || side.e.t !== 'join') return not(this.equalMembers(l, r));
    return (this.readings.fields.get(nameOf(side.e.r, 'a field')) as Field).many && flip ? not(this.equalMembers(l, r)) : undefined;
  }

  /** Whether a side of `=` is a navigation `y.f` of a variable and a field, read forward. */
  private forward(side: { e: Node }): boolean {
    return side.e.t === 'join' && this.navigation(side.e)?.forward === true && side.e.r.t === 'name';
  }

  /** A comparison, as the atoms it stands for: a union on the left or a difference on the right is spelled out. */
  private comparison(node: Extract<Node, { t: 'cmp' }>, negative: boolean): Doc {
    if (this.comparesIntegers(node)) return this.integers(node, negative);
    const formula = this.lowered(node, negative);
    if (formula !== undefined) return this.doc(formula);
    const { op } = node;
    const [l, r] = [this.shape(node.l), this.shape(node.r)];
    const flip = negative !== (op === 'not in' || op === '!=');
    if (op === 'in' || op === 'not in') {
      // x->y in ~r: y->x in r
      if (l.t === 'arrow' && l.lm === undefined && l.rm === undefined && r.t === 'transpose') return this.comparison({ ...node, l: { t: 'arrow', l: l.r, r: l.l }, r: r.e }, negative);
      if (l.t === 'union') {
        // a + b not in s: not every member is in s, so at least one is not.
        if (op !== 'in') return this.comparison({ ...node, op: 'in' }, !negative);
        const parts = [l.l, l.r].map(side => this.comparison({ ...node, l: side }, negative));
        return { kind: 'list', intro: negative ? ANY : ALL, items: parts.flatMap(p => this.spliced(p, negative ? ANY : ALL)) };
      }
      if (r.t === 'diff') {
        if (op !== 'in') return this.comparison({ ...node, op: 'in' }, !negative);
        const parts = [
          this.comparison({ ...node, op: 'in', r: r.l }, negative),
          this.comparison({ ...node, op: 'not in', r: r.r }, negative)
        ];
        return { kind: 'list', intro: negative ? ANY : ALL, items: parts.flatMap(p => this.spliced(p, negative ? ANY : ALL)) };
      }
      if (!this.readPrimed(r)) {
        const { e, primed } = this.unprimed(r);
        if (primed) return prefix(NEXT, this.comparison({ ...node, r: e }, negative));
        const nav = this.navigation(r);
        if (nav !== undefined && l.t !== 'arrow') return this.member(l, nav, flip);
      }
      if (this.signature(r) && l.t === 'name') return this.isA(l, r as Extract<Node, { t: 'name' }>, flip);
      if ((r.t === 'closure' || r.t === 'rclosure') && l.t === 'arrow') return this.reach(l, r, flip);
      if (r.t === 'name' && r.name === 'next' && l.t === 'arrow') return `${VARIABLE}${this.variable(l.r, 'a side of "->"')}${VARIABLE} is ${flip ? 'not ' : ''}the integer after ${VARIABLE}${this.variable(l.l, 'a side of "->"')}${VARIABLE}`;
      // y in f[x]: the reading of the function, with its arguments and then the member.
      if (r.t === 'call' && this.readFunction(r)) return this.say(r.name, [...r.args.map(a => this.variable(a, 'an argument')), this.variable(l, 'the left of "in"')], flip);
      const slots = l.t === 'arrow' ? [this.variable(l.l, 'a side of "->"'), this.variable(l.r, 'a side of "->"')] : [this.variable(l, 'the left of "in"')];
      const key = r.t === 'join' ? `${nameOf(r.l, 'a relation')}.${nameOf(r.r, 'a relation')}` : r.t === 'prime' ? `${nameOf(r.e, 'a primed set')}'` : nameOf(r, 'the right of "in"');
      return this.say(key, slots, flip);
    }
    // a = b, and a != b, between two variables
    if ((l.t === 'name' || l.t === 'string') && (r.t === 'name' || r.t === 'string')) {
      return `${VARIABLE}${this.variable(l, 'the left of "="')}${VARIABLE} and ${VARIABLE}${this.variable(r, 'the right of "="')}${VARIABLE} are ${flip ? 'different' : 'the same'}`;
    }
    const [left, right] = [this.unprimed(l), this.unprimed(r)];
    if (this.forward(left) && this.forward(right)) return this.sameMembers(left, right, false);
    // x.f = y, in either order, and x.f' = y at the next moment
    const [side, value] = this.forward(left) ? [left, r] : [right, l];
    if (side.e.t !== 'join') throw new Refusal('"=" needs a navigation on one side');
    const field = this.readings.fields.get(nameOf(side.e.r, 'a field')) as Field;
    if (field.many) return this.equalsOne(side, value, false);
    const said = this.say(nameOf(side.e.r, 'a field'), [this.variable(side.e.l, 'the owner of a field'), this.variable(value, 'the value of a field')], flip);
    return side.primed ? NEXT + said : said;
  }

  /** A signature with a noun and no reading of its own: to be in it is to be one of its kind. */
  private signature(e: Node): boolean {
    return e.t === 'name' && !this.readings.atoms.has(e.name) && this.readings.nouns.has(e.name);
  }

  /** `x in S` for a signature with no reading: "c is a cleanup". */
  private isA(x: Node, type: Extract<Node, { t: 'name' }>, negative: boolean): string {
    const written = this.readings.nouns.get(type.name) as string;
    const article = this.written(type) ?? articleFor(unbracketed(written).trim());
    return `${VARIABLE}${this.variable(x, 'the left of "in"')}${VARIABLE} is ${negative ? 'not ' : ''}${article}${mark(written, this.readings.nounTargets.get(type.name))}`;
  }

  /**
   * `y.f = x` for a field of many values, said member by member: "for every
   * owner_1: c is on owner_1 exactly when owner_1 and o are the same".
   */
  private equalsOne(side: { e: Node; primed: boolean }, value: Node, different: boolean): Doc {
    if (different) throw new Refusal('"!=" between a field of many values and a variable is not supported');
    const nav = this.navigation(side.e);
    if (nav === undefined) throw new Refusal('the side of "=" must be a variable and a field');
    const member = this.fresh({ t: 'name', name: nav.type });
    const inside = new Verbalizer(this.readings, new Map([...this.bound, ['\u0000', member.name]]), this.chain, this.used);
    const x: Node = { t: 'name', name: '\u0000' };
    const time = side.primed ? ' at the next moment' : '';
    return { kind: 'block', intro: `for every ${member.shown}:`, body: `${inside.member(x, nav, false)}${time} exactly when ${inside.comparison({ t: 'cmp', op: '=', l: x, r: value }, false)}` };
  }

  /**
   * `y.f = z.g`, said member by member over the type of the field: "for every
   * owner_1: c is on owner_1 exactly when d is on owner_1". A side that is
   * primed is said at the next moment, and the other now.
   */
  private sameMembers(left: { e: Node; primed: boolean }, right: { e: Node; primed: boolean }, different: boolean): Doc {
    if (different) throw new Refusal('two values are compared only with "=", which the checker says member by member');
    const [l, r] = [this.navigation(left.e), this.navigation(right.e)];
    if (l === undefined || r === undefined) throw new Refusal('the sides of "=" must each be a variable and a field');
    if (l.type !== r.type) throw new Refusal(`the sides of "=" reach different types, "${l.type}" and "${r.type}"`);
    const member = this.fresh({ t: 'name', name: l.type });
    const scope = new Map([...this.bound, ['\u0000', member.name]]);
    const inside = new Verbalizer(this.readings, scope, this.chain, this.used);
    const x: Node = { t: 'name', name: '\u0000' };
    const time = (primed: boolean): string => (left.primed || right.primed ? (primed ? ' at the next moment' : ' now') : '');
    return {
      kind: 'block',
      intro: `for every ${member.shown}:`,
      body: `${inside.member(x, l, false)}${time(left.primed)} exactly when ${inside.member(x, r, false)}${time(right.primed)}`
    };
  }

  /**
   * A formula that is a side of a rule, of a binary temporal operator or of a
   * definition. An equivalence there is said as both or neither, so that its
   * "exactly when" cannot take the whole sentence for a side.
   */
  private side(node: Node): Doc {
    return node.t === 'iff' ? { kind: 'list', intro: BOTH, items: [this.doc(node.l), this.doc(node.r)] } : this.doc(node);
  }

  /**
   * `until`, `since`, `releases`, `triggered` or `;` with a side of more than a
   * clause, each side set apart below the words that place it in time. Releases
   * and triggered are said as the alternatives they mean: `a releases b` is
   * `always b or (b until (a and b))`, and `a ; b` is `a and after b`.
   */
  private setApart(node: Extract<Node, { t: 'binary' }>): Doc {
    const { l: a, r: b } = node;
    const part = (intro: string, side: Node): Doc => ({ kind: 'block', intro, body: this.side(side) });
    switch (node.op) {
      case 'until':
        return { kind: 'list', intro: ALL, items: [part('now or at a later moment, the following holds:', b), part('at every moment before the first such moment, the following holds:', a)] };
      case 'since':
        return { kind: 'list', intro: ALL, items: [part('now or at an earlier moment, the following holds:', b), part('at every moment after the last such moment, the following holds:', a)] };
      case 'releases':
        return this.doc({ t: 'or', items: [{ t: 'unary', op: 'always', f: b }, { t: 'binary', op: 'until', l: b, r: { t: 'and', items: [a, b] } }] });
      case 'triggered':
        return this.doc({ t: 'or', items: [{ t: 'unary', op: 'historically', f: b }, { t: 'binary', op: 'since', l: b, r: { t: 'and', items: [a, b] } }] });
      case ';':
        return this.doc({ t: 'and', items: [a, { t: 'unary', op: 'after', f: b }] });
    }
  }

  /** A formula said as a negation: only what has a reading of its own can be negated. */
  private negation(node: Node): Doc {
    switch (node.t) {
      case 'not':
        return this.doc(node.f);
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
      case 'iff':
        return { kind: 'list', intro: ONE, items: [this.doc(node.l), this.doc(node.r)] };
      case 'let':
        return this.negation(expanded(node));
      case 'join':
      case 'box': {
        const call = this.asCall(node);
        if (call === undefined) throw new Refusal(`a ${CONSTRUCTS[node.t]} cannot stand as a statement`);
        return this.call(call, true);
      }
      default: {
        const moved = inward(node);
        return moved !== undefined ? this.doc(moved) : { kind: 'block', intro: UNTRUE, body: this.doc(node) };
      }
    }
  }

  private mult(node: Extract<Node, { t: 'mult' }>, negative: boolean): Doc {
    if (node.q === 'set' || node.q === 'seq') throw new Refusal(`"${node.q}" before an expression is not a formula; Alloy reads it only in a declaration`);
    const given = this.shape(node.e);
    if ((given.t === 'name' && given.name === 'none') || given.t === 'rclosure') return this.doc(this.counted(node, negative) as Node);
    if (node.q === 'some' || node.q === 'no') {
      const none = (node.q === 'no') !== negative;
      if (this.readPrimed(given)) return this.say(`${nameOf((given as Extract<Node, { t: 'prime' }>).e, 'a primed set')}'`, [], none);
      const { e, primed } = this.unprimed(given);
      if (primed) return prefix(NEXT, this.mult({ ...node, e }, negative));
      const nav = this.navigation(e);
      const x: Node = { t: 'name', name: '\u0000' };
      // no y.f: no member of the type of the field is in y.f
      if (nav !== undefined) return this.quantified({ t: 'quant', q: none ? 'no' : 'some', decls: [{ names: ['\u0000'], type: { t: 'name', name: nav.type } }], body: { t: 'cmp', op: 'in', l: x, r: e } });
      if (e.t === 'name' && !this.readings.fields.has(e.name) && !this.isVariable(e.name)) {
        if (!this.readings.atoms.get(e.name)?.positive.includes('{1}')) return this.say(e.name, [], none);
        return this.membersOf(e.name, none);
      }
    }
    return this.doc(this.counted(node, negative) as Node);
  }

  /**
   * `some`, `no`, `one` or `lone` of an expression that is not a set or a
   * navigation of a variable, as the formula it is said through: the quantifier
   * over the members of the types of its columns. Undefined for a set or a navigation.
   */
  private counted(node: Extract<Node, { t: 'mult' }>, negative: boolean): Node | undefined {
    const given = this.shape(node.e);
    if (this.integer(given)) throw this.untyped(given);
    if (given.t === 'name' && given.name === 'none') {
      const holds = (node.q === 'no' || node.q === 'lone') !== negative;
      return holds ? { t: 'true' } : FALSE;
    }
    if (given.t === 'rclosure') throw new Refusal(`"${shown(given)}" holds every member of every type, Int included, which no noun names`);
    if (node.q === 'some' || node.q === 'no') {
      if (this.readPrimed(given)) return undefined;
      const { e, primed } = this.unprimed(given);
      if (primed) {
        const f = this.counted({ ...node, e }, negative);
        return f === undefined ? undefined : { t: 'unary', op: 'after', f };
      }
      if (this.navigation(e) !== undefined || (e.t === 'name' && !this.readings.fields.has(e.name) && !this.isVariable(e.name))) return undefined;
    }
    const types = this.columns(given);
    if (types === undefined || types.includes('')) throw this.untyped(node.e);
    const ms = types.map(() => member());
    const q = node.q === 'one' || node.q === 'lone' ? node.q : (node.q === 'no') !== negative ? 'no' : 'some';
    const f: Node = { t: 'quant', q, decls: ms.map((m, i) => ({ names: [nameOf(m, '')], type: { t: 'name', name: types[i] as string } })), body: this.inside(ms, given) };
    return negative && (q === 'one' || q === 'lone') ? { t: 'not', f } : f;
  }

  /**
   * `some S` and `no S` of a set whose reading takes a variable: `some` or `no`
   * of the signature that holds `S`, in the place of the variable, "an edge is
   * being delivered". A reading that says its variable twice is said in full.
   */
  private membersOf(set: string, none: boolean): Doc {
    const holder = this.readings.holders.get(set);
    if (holder === undefined) throw new Refusal(`no one signature holds "${set}", so "some" or "no" of it has no noun`);
    const written = this.readings.nouns.get(holder);
    const reading = (this.readings.atoms.get(set) as Reading).positive;
    if (written === undefined || reading.split('{1}').length !== 2) {
      const x: Node = { t: 'name', name: '\u0000' };
      return this.quantified({ t: 'quant', q: none ? 'no' : 'some', decls: [{ names: ['\u0000'], type: { t: 'name', name: holder } }], body: { t: 'cmp', op: 'in', l: x, r: { t: 'name', name: set } } });
    }
    const noun = mark(written, this.readings.nounTargets.get(holder));
    const phrase = none ? `no ${noun}` : `${this.written({ t: 'name', name: holder }) ?? articleFor(unbracketed(written).trim())}${noun}`;
    return this.say(set, [holeOf(this.level)], false).replace(slotOf(this.level), phrase);
  }

  /**
   * A quantifier with plain declarations: `disj` becomes the condition that
   * the variables are different, a difference as a type the condition that
   * the variable is not in what is taken away, and a set with no noun as a type
   * the condition that the variable is in it. A "for every" puts the
   * conditions in front of its rule, a "there is" beside its body.
   */
  private plain(node: Extract<Node, { t: 'quant' }>): Extract<Node, { t: 'quant' }> {
    const conditions: Node[] = [];
    const decls = node.decls.map(({ names, type, disj, disjType, private: hidden }): Decl => {
      if (hidden) throw new Refusal(`Alloy does not read "private" before the variable "${names[0]}"`);
      // `one T` is what `T` means; any other multiplicity, or an arrow, makes the variable a set of things.
      let base = type.t === 'mult' && type.q === 'one' ? type.e : type;
      if (base.t === 'mult' || base.t === 'arrow') throw new Refusal(`"${names[0]}" can hold none or several things, and a reading says something of one thing`);
      while (base.t === 'diff') {
        const out = base.r;
        for (const name of names) {
          const x: Node = { t: 'name', name };
          conditions.push(out.t === 'name' && this.isVariable(out.name) ? { t: 'cmp', op: '!=', l: x, r: out } : { t: 'cmp', op: 'not in', l: x, r: out });
        }
        base = base.l;
      }
      // A set with no noun: the signature that holds it, and the condition that the variable is in the set.
      // An expression: the type of its members, and the condition that the variable is in it.
      if (base.t !== 'name') {
        const type = this.typeOf(base);
        for (const name of names) conditions.push({ t: 'cmp', op: 'in', l: { t: 'name', name }, r: base });
        base = { t: 'name', name: type };
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

  private quantified(quant: Extract<Node, { t: 'quant' }>): Doc {
    const node = this.plain(quant);
    const absorbed = this.absorbed(node);
    if (absorbed !== undefined) return absorbed;
    const scope = new Map(this.bound);
    const vars = node.decls.flatMap(({ names, type }) =>
      names.map(name => {
        const variable = this.fresh(type);
        scope.set(name, variable.name);
        return variable;
      })
    );
    const body = new Verbalizer(this.readings, scope, this.chain, this.used).doc(node.body);
    if (node.q === 'all') {
      return { kind: 'block', intro: `for ${vars.map(v => `every ${v.shown}`).join(' and ')}:`, body };
    }
    const each = vars.map(v => v.shown);
    const head =
      node.q === 'some'
        ? `there ${vars.length === 1 ? 'is' : 'are'} ${vars.length === 1 ? (vars[0] as { article: string }).article : ''}${each.join(' and ')} such that`
        : node.q === 'no' || node.q === 'one' || node.q === 'lone'
          ? `there is ${{ no: 'no', one: 'exactly one', lone: 'at most one' }[node.q]} ${vars.length === 1 ? '' : 'combination of '}${each.join(' and ')} such that`
          : (() => {
              throw new Refusal(`"${node.q}" as a quantifier is not supported`);
            })();
    if (typeof body === 'string') return `${head} ${body}`;
    if (isList(body)) return { ...body, intro: `${head} ${body.intro}` };
    return { kind: 'block', intro: `${head}:`, body };
  }

  /**
   * The items of a list, said one by one, where `independent` says of an item
   * that it stands on its own: each of those may use the names of variables
   * that another uses, and the names stay taken for what comes after the list.
   * The alternatives of an "at least one of these holds" all stand on their own,
   * and so does a "for every" among the items of an "all of these hold", which
   * is a statement of its own; a "there is" among them is a joint condition, and
   * the variables of two of those must not read as one.
   */
  private items(items: Node[], independent: (item: Node) => boolean): Doc[] {
    const before = [...this.used];
    const introduced = new Set<string>();
    const docs = items.map(item => {
      if (!independent(item)) return this.doc(item);
      this.used.clear();
      for (const name of before) this.used.add(name);
      const doc = this.doc(item);
      for (const name of this.used) introduced.add(name);
      return doc;
    });
    this.used.clear();
    for (const name of [...before, ...introduced]) this.used.add(name);
    return docs;
  }

  /** The items of a list with the given intro, or the doc itself: a list inside a list of the same kind says nothing more. */
  private spliced(doc: Doc, intro: string): Doc[] {
    return isList(doc) && doc.intro === intro ? doc.items : [doc];
  }

  /**
   * Words tried and maybe left unused: when they are, the names they took are
   * free again, so that the words said in their place number from where they would.
   */
  private attempt<T>(words: () => T | undefined): T | undefined {
    const before = [...this.used];
    const said = words();
    if (said === undefined) {
      this.used.clear();
      for (const name of before) this.used.add(name);
    }
    return said;
  }

  /** A node that says one fact in one clause, so that it can stand beside others in a sentence. */
  private clause(node: Node): string | undefined {
    return this.attempt(() => this.clauseOf(node));
  }

  private clauseOf(node: Node): string | undefined {
    const text = (doc: Doc): string | undefined => (typeof doc === 'string' ? doc : undefined);
    // Two values compared, or a field of many values compared with a variable, are said member by member, which is never one clause; trying would take the name of the member.
    const values = (n: Extract<Node, { t: 'cmp' }>): boolean => {
      if (n.op !== '=' && n.op !== '!=') return false;
      const [l, r] = [this.unprimed(n.l).e, this.unprimed(n.r).e];
      const many = (side: Node): boolean => side.t === 'join' && side.r.t === 'name' && this.readings.fields.get(side.r.name)?.many === true;
      return (l.t === 'join' && r.t === 'join') || many(l) || many(r);
    };
    // A closure is said with a comma and its own "where", which a sentence of several clauses would read two ways.
    const reaches = (n: Extract<Node, { t: 'cmp' }>): boolean => n.r.t === 'closure' || n.r.t === 'rclosure' || (n.r.t === 'join' && [n.r.l.t, n.r.r.t].some(t => t === 'closure' || t === 'rclosure'));
    const plainCmp = (n: Extract<Node, { t: 'cmp' }>): boolean => n.l.t !== 'union' && n.r.t !== 'diff' && !values(n) && !reaches(n);
    // A comparison said through members is a clause only where its formula is one: a noun phrase, and never a list.
    const lowered = (n: Extract<Node, { t: 'cmp' }>, negative: boolean): string | undefined => {
      if (this.comparesIntegers(n)) return undefined;
      const f = this.lowered(n, negative);
      return f === undefined ? (plainCmp(n) ? text(this.comparison(n, negative)) : undefined) : this.clause(f);
    };
    // A call with a reading is a clause; one said through the member of an argument is one where its formula is.
    const said = (n: Extract<Node, { t: 'call' }>, negative: boolean): string | undefined => {
      const apart = this.disjoint(n);
      if (apart !== undefined) return this.clause(negative ? { t: 'not', f: apart } : apart);
      if (!this.readings.atoms.has(n.name)) return undefined;
      const f = this.throughMember(n, negative);
      return f === undefined ? text(this.call(n, negative)) : this.clause(f);
    };
    switch (node.t) {
      case 'cmp':
        return lowered(node, false);
      case 'call':
        return said(node, false);
      case 'mult': {
        if (node.q === 'set' || node.q === 'seq') return undefined;
        const f = this.counted(node, false);
        return f === undefined ? text(this.mult(node, false)) : this.clause(f);
      }
      case 'not':
        if (node.f.t === 'cmp') return lowered(node.f, true);
        if (node.f.t === 'call') return said(node.f, true);
        if (node.f.t === 'quant' && (node.f.q === 'some' || node.f.q === 'no')) return this.clause(inward(node.f) as Node);
        if (node.f.t === 'let') return this.clause({ t: 'not', f: expanded(node.f) });
        return undefined;
      case 'quant':
        return this.absorbed(node);
      case 'let':
        return this.clause(expanded(node));
      case 'join':
      case 'box': {
        const call = this.asCall(node);
        return call === undefined ? undefined : this.clause(call);
      }
      default:
        return undefined;
    }
  }

  /** The items of an "and" or an "or" as one sentence, when there are few, they are short and flat, and none holds a comma. */
  private inline(items: Node[], word: 'and' | 'or'): string | undefined {
    return this.attempt(() => this.sentence(items, word));
  }

  private sentence(items: Node[], word: 'and' | 'or'): string | undefined {
    if (items.length > INLINE_ITEMS) return undefined;
    const said: string[] = [];
    for (const item of items) {
      const clause = this.clause(item);
      // A comma inside an item makes a list of three read as a list of more.
      if (clause === undefined || (clause.includes(',') && items.length > 2)) return undefined;
      said.push(clause);
    }
    // A time phrase at the start of a clause would read as covering the clauses after it.
    if (said.slice(0, -1).some(timed)) return undefined;
    const clauses = shareSubject(said);
    const text = clauses.length === 2 ? `${clauses[0]} ${word} ${clauses[1]}` : `${clauses.slice(0, -1).join(', ')} ${word} ${clauses[clauses.length - 1]}`;
    return plain(text).replaceAll(VARIABLE, '').length <= INLINE_LENGTH ? text : undefined;
  }

  /**
   * A "there is" or "there is no" over one variable that is said once, as a noun
   * phrase in the place of that variable: "spec_1 cites no axiom" and not "there
   * is no axiom_1 such that spec_1 cites axiom_1". The other conditions on the
   * variable become a relative clause, "an issue that tracker does not know",
   * and a comparison with another variable becomes "another unit". Undefined
   * when it does not fit, and the quantifier is said in full.
   */
  private absorbed(quant: Extract<Node, { t: 'quant' }>): string | undefined {
    const node = this.plain(quant);
    if (node.q !== 'some' && node.q !== 'no') return undefined;
    if (node.decls.length > 1) {
      // Variables of different kinds are said one inside the other: "a test checks a bug that sits in unit_1".
      const [first, ...later] = node.decls as { names: string[]; type: Node }[];
      return this.absorbed({ ...node, decls: [first as { names: string[]; type: Node }], body: { t: 'quant', q: 'some', decls: later, body: node.body } });
    }
    const decl = node.decls[0] as { names: string[]; type: Node };
    // A body that negates a compound is said with the "not" moved inward, which may give the conditions a phrase needs.
    let body = node.body;
    for (let moved = body.t === 'not' ? inward(body.f) : undefined; moved !== undefined; moved = body.t === 'not' ? inward(body.f) : undefined) body = moved;
    try {
      if (decl.names.length === 1) return this.absorb(node.q, decl.names[0] as string, decl.type, body);
      if (decl.names.length === 2 && node.q === 'some') return this.absorbPair(decl.names as [string, string], decl.type, body);
      return undefined;
    } catch (error) {
      asRefusal(error);
      return undefined;
    }
  }

  /** "there are unit a and unit b such that a is not b, c names a and c names b" as "c names a unit and another unit". */
  private absorbPair([a, b]: [string, string], type: Node, body: Node): string | undefined {
    const parts = body.t === 'and' ? body.items : [body];
    const differ = parts.findIndex(p => p.t === 'cmp' && p.op === '!=' && p.l.t === 'name' && p.r.t === 'name' && new Set([p.l.name, p.r.name]).size === 2 && [p.l.name, p.r.name].includes(a) && [p.l.name, p.r.name].includes(b));
    if (differ === -1) return undefined;
    const mentions = (n: Node, v: string): boolean => JSON.stringify(n).includes(`"name":"${v}"`);
    const rest = parts.filter((_, i) => i !== differ);
    const ofA = rest.filter(p => mentions(p, a) && !mentions(p, b));
    const ofB = rest.filter(p => mentions(p, b) && !mentions(p, a));
    if (ofA.length === 0 || ofB.length === 0 || ofA.length + ofB.length !== rest.length) return undefined;
    const all = (items: Node[]): Node => (items.length === 1 ? (items[0] as Node) : { t: 'and', items });
    const first = this.absorb('some', a, type, all(ofA));
    const second = this.absorb('some', b, type, all(ofB), true);
    if (first === undefined || second === undefined) return undefined;
    return shareSubject([first, second]).join(' and ');
  }

  private absorb(q: 'some' | 'no', x: string, type: Node, body: Node, another = false): string | undefined {
    const typeName = nameOf(type, 'the type of a quantified variable');
    const written = this.readings.nouns.get(typeName);
    if (written === undefined) return undefined;
    const parts = body.t === 'and' ? body.items : [body];
    let other: Node | undefined;
    const rest: Node[] = [];
    for (const part of parts) {
      const differs = other === undefined ? differsFrom(part, x) : undefined;
      if (differs !== undefined) other = differs;
      else rest.push(part);
    }
    if (rest.length === 0 || (other !== undefined && q === 'no')) return undefined;
    if (another) other = undefined;

    // Say each condition with a hole in place of the variable. One of them is about the variable and something else; the rest are about the variable alone.
    const hole = slotOf(this.level);
    const probe = new Verbalizer(this.readings, new Map([...this.bound, [x, holeOf(this.level)]]), this.chain, this.used, this.level + 1);
    const said: string[] = [];
    for (const part of rest) {
      const clause = probe.clause(part);
      if (clause === undefined || clause.split(hole).length !== 2) return undefined;
      said.push(clause);
    }
    // A time phrase in the phrase would cover the other conditions too.
    if (said.length > 1 && said.some(timed)) return undefined;
    // The main clause puts the variable beside something else, and preferably at the end: "test_1 carries a tag". The others say more of the variable.
    const others = (s: string): boolean => (s.match(/\u0001[^\u0001]*\u0001/g) ?? []).length >= 2;
    const at = said.findIndex(s => others(s) && s.endsWith(hole));
    const index = at !== -1 ? at : said.findIndex(s => others(s) && s.startsWith(hole));
    if (index === -1) return undefined;
    const main = said[index] as string;
    const relative = said.filter((_, i) => i !== index);

    let suffix = '';
    if (relative.length > 0) {
      const asSubject = relative.filter(s => s.startsWith(hole));
      if (asSubject.length === relative.length) {
        const rests = asSubject.map(s => s.slice(hole.length));
        // "x and y are different" has the variable in a subject of two, which a relative clause cannot take.
        if (rests.some(r => /^ (?:and|or)\b/.test(r))) return undefined;
        const negations = rests.every(r => r.startsWith(' is not '));
        suffix = ` that${negations ? ' is not ' : ' '}${coordinate(rests.map(r => (negations ? r.slice(' is not '.length) : r.trim())), negations ? 'or' : 'and')}`;
      } else if (relative.length === 1 && (relative[0] as string).endsWith(hole)) {
        suffix = ` that ${(relative[0] as string).slice(0, -hole.length).trim()}`;
      } else return undefined;
    }

    const noun = mark(written, this.readings.nounTargets.get(typeName));
    const nounText = unbracketed(written).trim();
    const article = this.written(type) ?? articleFor(nounText);
    let phrase: string;
    if (q === 'no') phrase = `no ${noun}${suffix}`;
    else if (another) phrase = `another ${noun}${suffix}`;
    else if (other === undefined) phrase = `${article}${noun}${suffix}`;
    else {
      const shown = this.variable(other, 'the other variable');
      phrase = new RegExp(`^${nounText.replace(/\s+/g, '_')}_\\d+$`).test(shown) ? `another ${noun}${suffix}` : `${article}${noun} other than ${VARIABLE}${shown}${VARIABLE}${suffix}`;
    }
    return main.replace(hole, phrase);
  }

  /**
   * A definition by cases: its body is an "or" of alternatives, or one, that each begin
   * by saying what kind of thing the parameter is. The alternatives are grouped
   * by kind and said as noun phrases, one to a case: "unit_1 is unfounded exactly
   * when unit_1 is one of these: a spec that cites no axiom and cites no spec; an
   * exception that cites no spec or cites no fact". Undefined when the body is
   * not of that shape, and it is said as it stands.
   */
  private cases(head: string, name: string, body: Node): Doc | undefined {
    const subject = `${VARIABLE}${name}${VARIABLE}`;
    /** What a clause says of the subject, without the subject: "cites no axiom". */
    const predicate = (clause: string | undefined): string | undefined => {
      if (clause === undefined || !clause.startsWith(`${subject} `)) return undefined;
      const rest = clause.slice(subject.length + 1);
      return /^(?:and|or)\b/.test(rest) ? undefined : rest;
    };
    const groups = new Map<string, { how: 'and' | 'or'; says: string[] }[]>();
    for (const alternative of body.t === 'or' ? body.items : [body]) {
      const parts = alternative.t === 'and' ? alternative.items : [alternative];
      if (parts.length < 2) return undefined;
      const guard = this.clause(parts[0] as Node);
      const kind = guard?.startsWith(`${subject} is a`) ? guard.slice(subject.length + 4) : undefined;
      if (kind === undefined || !/^an? /.test(kind)) return undefined;
      const rest = parts.slice(1);
      let said: { how: 'and' | 'or'; says: string[] };
      if (rest.length === 1 && (rest[0] as Node).t === 'or') {
        const options = ((rest[0] as Extract<Node, { t: 'or' }>).items).map(item => predicate(this.clause(item)));
        if (options.some(option => option === undefined)) return undefined;
        said = { how: 'or', says: options as string[] };
      } else {
        const conditions = rest.map(item => predicate(this.clause(item)));
        if (conditions.some(condition => condition === undefined)) return undefined;
        said = { how: 'and', says: conditions as string[] };
      }
      groups.set(kind, [...(groups.get(kind) ?? []), said]);
    }
    const cases: string[] = [];
    for (const [kind, alternatives] of groups) {
      // Several alternatives of one kind are "or"; one that is itself a run of "and" would be read two ways beside another.
      if (alternatives.length > 1 && alternatives.some(a => a.how === 'and' && a.says.length > 1)) return undefined;
      const says = alternatives.length === 1 ? (alternatives[0] as { how: 'and' | 'or'; says: string[] }) : { how: 'or' as const, says: alternatives.flatMap(a => a.says) };
      if (says.says.some(s => s.includes(',')) && says.says.length > 2) return undefined;
      cases.push(`${kind} that ${coordinate(says.says, says.how)}`);
    }
    if (cases.length === 1) return `${head} exactly when ${subject} is ${cases[0]}`;
    return { kind: 'list', intro: `${head} exactly when ${subject} is one of these:`, items: cases };
  }

  /**
   * A definition, said as "<what it names> exactly when <its body>", for every
   * value of its parameters. The words for what it names are its reading in the
   * table; its meaning is only its body.
   */
  definition(name: string, params: { name: string; type: string }[], body: Node): Doc {
    const vars = params.map(param => {
      const variable = this.fresh({ t: 'name', name: param.type });
      this.bound.set(param.name, variable.name);
      return variable;
    });
    const head = this.say(name, vars.map(v => v.name), false);
    return this.defined(head, vars, body);
  }

  /** What a definition names, "exactly when" its body holds, for every value of its parameters: said by cases where it fits, and set apart where the body is a rule. */
  private defined(head: string, vars: { name: string; shown: string }[], body: Node): Doc {
    const byCases = vars.length === 1 ? this.cases(head, vars[0]!.name, body) : undefined;
    let sentence: Doc;
    if (byCases !== undefined) sentence = byCases;
    else if (this.holdsAlways(body)) sentence = head;
    else {
      const said = this.side(body);
      if (typeof said === 'string') sentence = `${head} exactly when ${said}`;
      else if (isList(said)) sentence = { ...said, intro: `${head} exactly when ${said.intro}` };
      else sentence = { kind: 'block', intro: `${head} exactly when the following holds:`, body: said };
    }
    if (vars.length === 0) return sentence;
    return { kind: 'block', intro: `for ${vars.map(v => `every ${v.shown}`).join(' and ')}:`, body: sentence };
  }

  /**
   * A function, said as its value holding a member "exactly when" its body
   * does, for every value of its parameters and every member of the type of its value.
   */
  fn(name: string, params: { name: string; type: string }[], result: string, body: Node): Doc {
    const vars = params.map(param => {
      const variable = this.fresh({ t: 'name', name: param.type });
      this.bound.set(param.name, variable.name);
      return variable;
    });
    const value = this.fresh({ t: 'name', name: result });
    const m: Node = { t: 'name', name: '\u0000value' };
    this.bound.set('\u0000value', value.name);
    const head = this.say(name, [...vars.map(v => v.name), value.name], false);
    return this.defined(head, [...vars, value], this.inside([m], body));
  }

  /** Whether a formula never holds: the negation of one that always does, an `and` with one, an `or` of them, or a comparison or multiplicity that `none` makes so. */
  private holdsNever(node: Node): boolean {
    if (node.t === 'not') return this.holdsAlways(node.f);
    if (node.t === 'and') return node.items.some(item => this.holdsNever(item));
    if (node.t === 'or') return node.items.every(item => this.holdsNever(item));
    const f = this.constant(node);
    return f !== undefined && f !== node && this.holdsNever(f);
  }

  /** The formula a comparison or a multiplicity with `none` comes to, when it is one that always or never holds; undefined otherwise. */
  private constant(node: Node): Node | undefined {
    try {
      const f = node.t === 'cmp' ? this.lowered(node, false) : node.t === 'mult' && node.q !== 'set' && node.q !== 'seq' ? this.counted(node, false) : undefined;
      return f !== undefined && (f.t === 'true' || (f.t === 'not' && f.f.t === 'true') || (f.t === 'not' && f.f.t === 'not' && f.f.f.t === 'true')) ? f : undefined;
    } catch (error) {
      asRefusal(error);
      return undefined;
    }
  }

  /** Whether a formula always holds: an empty block, a call of a predicate with an empty body, or an `and` of such. */
  private holdsAlways(node: Node, seen: Set<string> = new Set()): boolean {
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

  /**
   * The words for a formula. A formula is said by saying its parts, and a part that is rewritten is said as the
   * formula it is rewritten to; a rewrite that comes back to a formula still being said would never end, so it is
   * a fault of naturalloy, and so is a formula said through more than SAYING_DEPTH formulas at once.
   */
  doc(node: Node): Doc {
    const key = print(node);
    if (this.saying.has(key)) throw new Error(`naturalloy rewrote "${key}" back to itself while saying it`);
    if (sayingDepth >= SAYING_DEPTH) throw new Error(`naturalloy said "${key}" through more than ${SAYING_DEPTH} formulas at once`);
    this.saying.add(key);
    sayingDepth++;
    try {
      return this.said(node);
    } finally {
      this.saying.delete(key);
      sayingDepth--;
    }
  }

  private said(node: Node): Doc {
    switch (node.t) {
      case 'name':
        // A predicate with no parameters is written as its bare name.
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
      case 'and': {
        if (node.items.some(item => this.holdsNever(item))) throw new Refusal(NEVER);
        const items = node.items.filter(item => !this.holdsAlways(item));
        if (items.length === 0) throw new Refusal(ALWAYS);
        if (items.length === 1) return this.doc(items[0] as Node);
        node = { ...node, items };
        const inline = this.inline(node.items, 'and');
        if (inline !== undefined) return inline;
        return { kind: 'list', intro: ALL, items: this.items(node.items, item => item.t === 'quant' && item.q === 'all').flatMap(item => this.spliced(item, ALL)) };
      }
      case 'or': {
        if (node.items.some(item => this.holdsAlways(item))) throw new Refusal(ALWAYS);
        const items = node.items.filter(item => !this.holdsNever(item));
        if (items.length === 0) throw new Refusal(NEVER);
        if (items.length === 1) return this.doc(items[0] as Node);
        node = { ...node, items };
        const inline = this.inline(node.items, 'or');
        if (inline !== undefined) return inline;
        return { kind: 'list', intro: ANY, items: this.items(node.items, () => true).flatMap(item => this.spliced(item, ANY)) };
      }
      case 'implies':
        return { kind: 'rule', when: this.side(node.l), then: this.side(node.r) };
      case 'ite':
        return { kind: 'rule', when: this.side(node.c), then: this.side(node.a), otherwise: this.side(node.b) };
      case 'iff': {
        const [l, r] = [this.clause(node.l), this.clause(node.r)];
        if (l !== undefined && r !== undefined && !timed(l)) return `${l} exactly when ${r}`;
        return { kind: 'list', intro: BOTH, items: [this.doc(node.l), this.doc(node.r)] };
      }
      case 'let':
        return this.doc(expanded(node));
      case 'join':
      case 'box': {
        const call = this.asCall(node);
        if (call === undefined) throw new Refusal(`a ${CONSTRUCTS[node.t]} cannot stand as a statement`);
        return this.call(call, false);
      }
      case 'quant':
        return this.quantified(node);
      case 'unary': {
        const words: Record<string, string> = {
          always: 'now and at every later moment, ',
          eventually: 'now or at a later moment, ',
          after: 'at the next moment, ',
          before: 'there is a moment before, and at it, ',
          once: 'now or at an earlier moment, ',
          historically: 'now and at every earlier moment, '
        };
        return prefix(words[node.op], this.doc(node.f));
      }
      case 'binary': {
        // A chain of `;` reads in order; any other nesting of these clauses with commas reads in more than one way.
        const sides = node.op === ';' && node.r.t === 'binary' && node.r.op === ';' ? [node.l] : [node.l, node.r];
        if (sides.some(holdsBinary)) throw new Refusal(`"${node.op}" with a side that holds "until", "since", "releases", "triggered" or ";" reads in more than one way`);
        const [l, r] = [this.side(node.l), this.side(node.r)];
        if (typeof l !== 'string' || typeof r !== 'string') return this.setApart(node);
        switch (node.op) {
          case 'until':
            return `at every moment before the first moment where ${r}, ${l}, and ${r} now or at a later moment`;
          case 'since':
            return `at every moment after the last moment where ${r}, ${l}, and ${r} now or at an earlier moment`;
          case 'releases':
            return `up to and including the first moment where ${l}, if one comes, ${r}`;
          case 'triggered':
            return `back to and including the last moment where ${l}, if there was one, ${r}`;
          case ';':
            return `${l}, and at the next moment, ${r}`;
        }
      }
      default:
        throw new Refusal(`a ${node.t} cannot stand as a statement`);
    }
  }
}

/**
 * A clause that begins with the variable the clause before it begins with says
 * it once: "test_1 is an expected failure, checks no bug and checks no
 * exception". Not when the variable is the first of a pair, as in "unit_1 and
 * unit_2 are different".
 */
function shareSubject(clauses: string[]): string[] {
  const subjectOf = (clause: string): string | undefined => /^\u0001[^\u0001]*\u0001/.exec(clause)?.[0];
  return clauses.map((clause, i) => {
    const subject = subjectOf(clause);
    const before = clauses[i - 1];
    // After a relative clause, a clause without its subject would read as more of it.
    if (i === 0 || subject === undefined || before === undefined || subjectOf(before) !== subject || /\bthat\b/.test(plain(before))) return clause;
    const rest = clause.slice(subject.length + 1);
    const pairLike = (c: string): boolean => /^(?:and|or)\b/.test(c.slice(subject.length + 1));
    return pairLike(clause) || pairLike(before) ? clause : rest;
  });
}

/** "a, b and c": the words of a coordination, with the word before the last. */
function coordinate(words: string[], word: 'and' | 'or'): string {
  if (words.length === 1) return words[0] as string;
  return `${words.slice(0, -1).join(', ')} ${word} ${words[words.length - 1]}`;
}

/** "a failing cleanup c": the article before the first word of the noun, by the sound of the word: "a unit", "an owner". */
export function articleFor(phrase: string): string {
  if (/^(?:uni|use|usu|uti|eu|one|once)/i.test(phrase)) return 'a ';
  return /^[aeiou]/i.test(phrase) ? 'an ' : 'a ';
}

/** A doc as lines, with its lists bulleted and its blocks indented. */
function lines(doc: Doc): string[] {
  if (typeof doc === 'string') return [doc];
  if (doc.kind === 'list') {
    const items = doc.items.flatMap(item => {
      const [first = '', ...rest] = lines(item);
      return [`- ${first}`, ...rest.map(line => `  ${line}`)];
    });
    return [doc.intro, ...items.map(line => `  ${line}`)];
  }
  if (doc.kind === 'block') return [doc.intro, ...lines(doc.body).map(line => `  ${line}`)];
  const when = lines(doc.when);
  const then = lines(doc.then);
  const otherwise = doc.otherwise === undefined ? undefined : lines(doc.otherwise);
  if (when.length === 1 && then.length === 1 && (otherwise === undefined || otherwise.length === 1) && !timed(when[0] as string)) return [oneLine(when, then, otherwise)];
  return [
    `when ${when[0]}`,
    ...when.slice(1),
    `then ${then[0]}`,
    ...then.slice(1).map(line => `     ${line}`),
    ...(otherwise === undefined ? [] : [`otherwise ${otherwise[0]}`, ...otherwise.slice(1).map(line => `          ${line}`)])
  ];
}

/** A rule of one-line sides on one line: "when a, b", or "when a, b; otherwise, c". */
function oneLine(when: string[], then: string[], otherwise: string[] | undefined): string {
  return `when ${when[0]}, ${TIME_PHRASE.test(then[0] as string) ? 'then ' : ''}${then[0]}${otherwise === undefined ? '' : `; otherwise, ${otherwise[0]}`}`;
}

/**
 * A doc as lines of Markdown, where a person reads it rendered. Indentation
 * does not survive there, so the structure is carried by blank lines between
 * paragraphs and by lists: a list sits under the line that introduces it, a
 * block continues after a blank line, and the lines inside a list item are
 * indented to stay inside it. Every list is a collection with no order, so its
 * items are bullets; a sequence would be numbered.
 */
function markdownLines(doc: Doc): string[] {
  if (typeof doc === 'string') return [doc];
  if (doc.kind === 'list') {
    const items = doc.items.flatMap(item => {
      const [first = '', ...rest] = markdownLines(item);
      return [`- ${first}`, ...rest.map(line => (line === '' ? '' : `  ${line}`))];
    });
    return [doc.intro, ...items];
  }
  if (doc.kind === 'block') return [doc.intro, '', ...markdownLines(doc.body)];
  const when = markdownLines(doc.when);
  const then = markdownLines(doc.then);
  const otherwise = doc.otherwise === undefined ? undefined : markdownLines(doc.otherwise);
  if (when.length === 1 && then.length === 1 && (otherwise === undefined || otherwise.length === 1) && !timed(when[0] as string)) return [oneLine(when, then, otherwise)];
  return [
    `when ${when[0]}${when.length === 1 ? ',' : ''}`,
    ...when.slice(1),
    '',
    `then ${then[0]}`,
    ...then.slice(1),
    ...(otherwise === undefined ? [] : ['', `otherwise ${otherwise[0]}`, ...otherwise.slice(1)])
  ];
}

/**
 * The words for the formula in `source`, as lines of text, or as markdown with links. `self` is the href of the
 * place the words are for, which they never link to. Throws an Error that names what cannot be said.
 */
export function verbalize(source: string, readings: Readings, layout: 'text' | 'markdown' = 'text', self?: string): string {
  return finish(new Verbalizer(readings).doc(read(source)), layout, self);
}

/** Whether the text is a definition, `pred name[params] { body }`, and not a formula. */
export const isDefinition = (source: string): boolean => /^\s*(?:private\s+)?(?:pred|fun)\b/.test(source) || /^\s*let\s+[\w']+\s*\[/.test(source);

/**
 * The words for a definition, `pred name[params] { body }`: what the predicate
 * names, exactly when its body holds. Throws an Error that names what cannot be said.
 */
export function verbalizeDefinition(source: string, readings: Readings, layout: 'text' | 'markdown' = 'text', self?: string): string {
  const written = 'a definition is written `pred name[parameters] { formula }` or `fun name[parameters]: type { expression }`';
  if (!isDefinition(source)) throw new Refusal(written);
  const paragraphs = parseModule(source).paragraphs;
  const p = paragraphs[0];
  if (paragraphs.length !== 1 || p === undefined) throw new Refusal(written);
  if (p.t === 'macro') throw new Refusal('a parameter of a macro has no type, so a macro has no words "for every" value of it');
  if (p.t !== 'pred' && p.t !== 'fun') throw new Refusal(written);
  const decls = paramsOf(p);
  const params = decls.flatMap(d => d.names.map(name => ({ name, type: typeName(d.type, `the parameter "${name}"`) })));
  const untyped = params.find(param => param.type === '');
  if (untyped !== undefined) throw new Refusal(`the parameter "${untyped.name}" has no type that is a name`);
  const verbalizer = new Verbalizer(readings);
  if (p.t === 'pred') return finish(verbalizer.definition(p.name, params, unqualified(withDifferences(decls, p.body))), layout, self);
  const result = p.result.t === 'mult' ? p.result.e : p.result;
  if (result.t !== 'name') throw new Refusal(`the value of "${p.name}" has no type that is a name`);
  return finish(verbalizer.fn(p.name, params, result.name, unqualified(p.body)), layout, self);
}

/** The name of the type of a parameter, or '' when it is not a name: `one T` is `T`, and a parameter of several things is refused. */
function typeName(type: Node, what: string): string {
  const base = type.t === 'mult' && type.q === 'one' ? type.e : type;
  if (base.t === 'mult' || base.t === 'arrow') throw new Refusal(`${what} can hold none or several things, and a definition is said for every one thing`);
  return base.t === 'name' ? base.name : '';
}

/** A doc as text: laid out, with a capital where the sentence starts with its own words and a period where it ends. */
function finish(doc: Doc, layout: 'text' | 'markdown', self: string | undefined): string {
  const raw = layout === 'markdown' ? markdownLines(doc) : lines(doc);
  const out = resolveLinks(raw.join('\n'), layout === 'markdown', self).split('\n');
  if (!(out[0] as string).startsWith(VARIABLE)) out[0] = (out[0] as string).replace(/^(\[?)(.)/, (_, bracket: string, c: string) => bracket + c.toUpperCase());
  const last = out.length - 1;
  // A period closes a clause; a line that is an item of a list, or introduces one, is not the end of the sentence.
  if (!/(:|^\s*- .*)$/.test(out[last] as string)) out[last] = `${out[last]}.`;
  return out.join('\n').replaceAll(VARIABLE, '');
}
