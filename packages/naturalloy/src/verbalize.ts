/**
 * Say an Alloy formula in words, the same words every time. The formula is
 * read by `alloy-parse.ts`, and what each name stands for comes from a table of
 * readings kept next to the vocabulary. Nothing is guessed:
 * a construct or a name with no reading is an error, so a rendering never says
 * more or less than the formula does.
 */
import { type Decl, type Node, parseFormula } from './alloy-parse.ts';

/** How one thing is said, with `{1}`, `{2}` for the variables it is about. */
interface Reading {
  positive: string;
  negative?: string;
  /** Where a word in brackets that names no link of its own links to: the place that holds the line, as an href. */
  target?: string;
}

/** A predicate of the vocabulary: its parameters and the text of its body. */
interface Definition {
  params: string[];
  body: string;
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
}

/** A field of a signature, from the signature to the type it points at. Its owner is unknown when one declaration declares it for several signatures. */
interface Field {
  owner?: string;
  type: string;
  /** Whether it can hold more than one value: declared `set` or `some`, and not `one` or `lone`. */
  many: boolean;
}

/**
 * The predicates a vocabulary defines: `pred name[a: T, b, c: U] { body }`.
 * The body is kept as text, and is read only if a call needs it.
 */
export function parseDefinitions(vocabulary: string): Map<string, Definition> {
  const definitions = new Map<string, Definition>();
  for (const m of vocabulary.matchAll(/\bpred\s+(\w+)\s*(?:\[([^\]]*)\])?\s*\{/g)) {
    let depth = 1;
    let end = (m.index ?? 0) + m[0].length;
    while (end < vocabulary.length && depth > 0) {
      depth += vocabulary[end] === '{' ? 1 : vocabulary[end] === '}' ? -1 : 0;
      end++;
    }
    if (depth !== 0) throw new Error(`the predicate "${m[1]}" has no closing brace`);
    const groups = parameterGroups(m[2] ?? '');
    const body = vocabulary.slice((m.index ?? 0) + m[0].length, end - 1);
    const different = differences(groups).map(([a, b]) => `${a} != ${b}`);
    definitions.set(m[1] as string, { params: groups.flatMap(g => g.names), body: different.length === 0 ? body : `${different.join(' and ')} and (${body})` });
  }
  return definitions;
}

/**
 * The fields that the signatures of a vocabulary declare, with the type each
 * points at. A field of more than one column, or one that two declarations
 * declare, is left out: it has no one type.
 */
export function parseFields(vocabulary: string): Map<string, Field> {
  const fields = new Map<string, Field>();
  const untyped = new Set<string>();
  for (const m of vocabulary.matchAll(/\bsig\s+([\w\s,]+?)\s*(?:(?:extends|in)\s+[\w\s+]+?)?\s*\{/g)) {
    const sigs = (m[1] as string).split(',').map(name => name.trim());
    let depth = 1;
    let end = (m.index ?? 0) + m[0].length;
    while (end < vocabulary.length && depth > 0) {
      depth += vocabulary[end] === '{' ? 1 : vocabulary[end] === '}' ? -1 : 0;
      end++;
    }
    const body = vocabulary.slice((m.index ?? 0) + m[0].length, end - 1);
    // `a, b: T` declares both: a name with no colon waits for the type of the next part.
    let waiting: string[] = [];
    for (const part of body.split(',')) {
      const bare = /^\s*(?:var\s+)?(\w+)\s*$/.exec(part);
      if (bare) {
        waiting.push(bare[1] as string);
        continue;
      }
      const named = /^\s*(?:var\s+)?(\w+)\s*:/.exec(part);
      if (named === null) continue;
      const typed = /:\s*(?:disj\s+)?(?:(one|lone|some|set)\s+)?(\w+)\s*$/.exec(part);
      for (const name of [...waiting, named[1] as string]) {
        if (fields.has(name) || typed === null) untyped.add(name);
        fields.set(name, { owner: sigs.length === 1 ? sigs[0] : undefined, type: typed?.[2] ?? '', many: typed?.[1] === 'set' || typed?.[1] === 'some' });
      }
      waiting = [];
    }
  }
  for (const name of untyped) fields.delete(name);
  return fields;
}

/** The readings with the definitions and the fields of a vocabulary, so that a predicate with no reading of its own can be said by its body. */
export const withDefinitions = (readings: Readings, vocabulary: string): Readings => ({
  ...readings,
  definitions: parseDefinitions(vocabulary),
  fields: parseFields(vocabulary),
  variables: new Set([...vocabulary.matchAll(/\bvar\s+(?:(?:abstract|one|lone|some)\s+)*sig\s+([\w\s,]+?)\s*(?:extends\b|in\b|\{|=)/g)].flatMap(m => (m[1] as string).split(',').map(name => name.trim())))
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
  const readings: Readings = { nouns: new Map(), nounTargets: new Map(), articles: new Map(), atoms: new Map(), definitions: new Map(), fields: new Map(), variables: new Set() };
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
    const atom = /^([\w.']+)\s*:\s*(.+)$/.exec(line);
    if (!atom) throw new Error(`cannot read the line of readings: ${line}`);
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
  if (/[[\]]/.test(line.replace(BRACKETED, ''))) throw new Error(`a bracket in the line of readings has no partner: ${line}`);
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
const TIME_PHRASE = /^(?:now or at|now and at|at every|at the next|right after|there is a moment before|up to and including|back to and including)\b/;

/** The most that is said in a sentence, and not in a list, and how long it may be. */
const INLINE_ITEMS = 3;
const INLINE_LENGTH = 110;

/** What a clause with a primed name is said with, the words of `after`: "at the next moment, c has run". */
const NEXT = 'at the next moment, ';

const ALL = 'all of these hold:';
const ANY = 'at least one of these holds:';

/** What a formula becomes before it is laid out: a clause, a list that ends in a colon, or a rule. */
type Doc =
  | string
  | { kind: 'list'; intro: string; items: Doc[] }
  | { kind: 'block'; intro: string; body: Doc }
  | { kind: 'rule'; when: Doc; then: Doc };

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
    case 'quant':
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

/** The name a node stands for: a variable, a set, a field. */
function nameOf(node: Node, what: string): string {
  if (node.t !== 'name') throw new Error(`${what} must be a name`);
  return node.name;
}

/** A doc said as untrue. Only a clause, or a list of them, can be. */
function untrue(doc: Doc): Doc {
  if (typeof doc === 'string') return `it is not the case that ${doc}`;
  if (doc.kind === 'list') return { ...doc, intro: `it is not the case that ${doc.intro}` };
  throw new Error('a definition that is a rule or has a "for every" cannot be said as untrue; give it a reading');
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

  constructor(readings: Readings, bound: Map<string, string> = new Map(), chain: string[] = [], used: Set<string> = new Set(), level = 0) {
    this.readings = readings;
    this.bound = bound;
    this.chain = chain;
    this.used = used;
    this.level = level;
  }

  /** A variable of the formula: inside the body of a predicate, its parameter stands for the argument. */
  private variable(node: Node, what: string): string {
    const name = nameOf(node, what);
    if (!this.isVariable(name)) throw new Error(`"${name}" is a set or a field, where a variable must be`);
    return this.bound.get(name) ?? name;
  }

  /** Whether a name stands for one thing: a variable, and not a set, a signature or a field of the vocabulary. */
  private isVariable(name: string): boolean {
    return this.bound.has(name) || !(this.readings.atoms.has(name) || this.readings.nouns.has(name) || this.readings.fields.has(name));
  }

  /** The expression without its prime, and whether it had one: `Ran'`, `c.on'` and `(c.on)'` are each one name primed. */
  private unprimed(node: Node): { e: Node; primed: boolean } {
    const found =
      node.t === 'prime'
        ? { e: node.e, primed: true }
        : node.t === 'join' && node.r.t === 'prime'
          ? { e: { ...node, r: node.r.e }, primed: true }
          : node.t === 'join' && node.l.t === 'prime'
            ? { e: { ...node, l: node.l.e }, primed: true }
            : { e: node, primed: false };
    // `Sig.rel` read as a relation of its own: the prime moves `Sig` as well, and its reading names `Sig` as it is now.
    const { e } = found;
    if (found.primed && e.t === 'join' && e.l.t === 'name' && e.r.t === 'name' && this.readings.atoms.has(`${e.l.name}.${e.r.name}`) && this.readings.variables.has(e.l.name)) {
      throw new Error(`"${e.l.name}" is a var sig, so a prime on "${e.l.name}.${e.r.name}" moves it too`);
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
  private navigation(node: Node): { field: string; from: Node; forward: boolean; type: string } | undefined {
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

  /** A call, said by the reading the table gives it, or else by the body of the predicate. */
  private call(node: Extract<Node, { t: 'call' }>, negative: boolean): Doc {
    const args = node.args.map(a => this.variable(a, 'an argument'));
    if (this.readings.atoms.has(node.name)) return this.say(node.name, args, negative);
    const definition = this.readings.definitions.get(node.name);
    if (definition === undefined) throw new Error(`no reading for "${node.name}"`);
    if (this.chain.includes(node.name)) throw new Error(`"${node.name}" is defined in terms of itself; give it a reading`);
    if (definition.params.length !== args.length) throw new Error(`"${node.name}" takes ${definition.params.length} arguments, not ${args.length}`);
    for (const arg of args) this.used.add(arg);
    const inside = new Verbalizer(this.readings, new Map(definition.params.map((p, i) => [p, args[i] as string])), [...this.chain, node.name], this.used);
    let doc: Doc;
    try {
      doc = inside.doc(parseFormula(definition.body));
    } catch (error) {
      throw new Error(`no reading for "${node.name}", and its body cannot be said: ${(error as Error).message}`);
    }
    return negative ? untrue(doc) : doc;
  }

  private say(key: string, slots: string[], negative: boolean): string {
    const reading = this.readings.atoms.get(key);
    if (!reading) throw new Error(`no reading for "${key}"`);
    const words = negative ? reading.negative : reading.positive;
    if (words === undefined) throw new Error(`no negative reading for "${key}"`);
    const said = mark(words, reading.target).replace(/\{(\d+)\}/g, (_, n: string) => {
      const slot = slots[Number(n) - 1];
      if (slot === undefined) throw new Error(`the reading of "${key}" uses {${n}}, which the formula does not give`);
      return `${VARIABLE}${slot}${VARIABLE}`;
    });
    const missing = slots.findIndex((_, i) => !words.includes(`{${i + 1}}`));
    if (missing !== -1) throw new Error(`the reading of "${key}" leaves out {${missing + 1}}, which the formula gives`);
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
    if (written === undefined) throw new Error(`no noun for "${typeName}"`);
    const noun = unbracketed(written).trim();
    const base = noun.replace(/\s+/g, '_');
    let n = 1;
    while (this.used.has(`${base}_${n}`)) n++;
    const name = `${base}_${n}`;
    this.used.add(name);
    const target = this.readings.nounTargets.get(typeName);
    return { name, shown: target === undefined ? name : `${LINK}${target}${LINK}${name}${LINK}`, article: this.written(type) ?? articleFor(noun) };
  }

  /** A comparison, as the atoms it stands for: a union on the left or a difference on the right is spelled out. */
  private comparison(node: Extract<Node, { t: 'cmp' }>, negative: boolean): Doc {
    const { op, l, r } = node;
    const flip = negative !== (op === 'not in' || op === '!=');
    if (op === 'in' || op === 'not in') {
      if (l.t === 'union') {
        const parts = [l.l, l.r].map(side => this.comparison({ ...node, l: side }, negative));
        return { kind: 'list', intro: negative ? ANY : ALL, items: parts.flatMap(p => this.spliced(p, negative ? ANY : ALL)) };
      }
      if (r.t === 'diff') {
        if (op !== 'in') throw new Error('"not in" before a difference is not supported');
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
      const slots = l.t === 'arrow' ? [this.variable(l.l, 'a side of "->"'), this.variable(l.r, 'a side of "->"')] : [this.variable(l, 'the left of "in"')];
      const key = r.t === 'join' ? `${nameOf(r.l, 'a relation')}.${nameOf(r.r, 'a relation')}` : r.t === 'prime' ? `${nameOf(r.e, 'a primed set')}'` : nameOf(r, 'the right of "in"');
      return this.say(key, slots, flip);
    }
    // a = b, and a != b, between two variables
    if (l.t === 'name' && r.t === 'name') {
      return `${VARIABLE}${this.variable(l, 'the left of "="')}${VARIABLE} and ${VARIABLE}${this.variable(r, 'the right of "="')}${VARIABLE} are ${flip ? 'different' : 'the same'}`;
    }
    const [left, right] = [this.unprimed(l), this.unprimed(r)];
    if (left.e.t === 'join' && right.e.t === 'join') return this.sameMembers(left, right, flip);
    // x.f = y, in either order, and x.f' = y at the next moment
    const [side, value] = left.e.t === 'join' ? [left, r] : right.e.t === 'join' ? [right, l] : [undefined, undefined];
    if (side === undefined || side.e.t !== 'join') throw new Error('"=" is supported only as "x.field = y"');
    const field = this.readings.fields.get(nameOf(side.e.r, 'a field'));
    if (field === undefined) throw new Error(`the vocabulary does not declare the field "${nameOf(side.e.r, 'a field')}", so "=" cannot tell whether it holds one value`);
    if (field.many) return this.equalsOne(side, value as Node, flip);
    const said = this.say(nameOf(side.e.r, 'a field'), [this.variable(side.e.l, 'the owner of a field'), this.variable(value as Node, 'the value of a field')], flip);
    return side.primed ? NEXT + said : said;
  }

  /**
   * `y.f = x` for a field of many values, said member by member: "for every
   * owner_1: c is on owner_1 exactly when owner_1 and o are the same".
   */
  private equalsOne(side: { e: Node; primed: boolean }, value: Node, different: boolean): Doc {
    if (different) throw new Error('"!=" between a field of many values and a variable is not supported');
    const nav = this.navigation(side.e);
    if (nav === undefined) throw new Error('the side of "=" must be a variable and a field');
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
    if (different) throw new Error('two values are compared only with "=", which the checker says member by member');
    const [l, r] = [this.navigation(left.e), this.navigation(right.e)];
    if (l === undefined || r === undefined) throw new Error('the sides of "=" must each be a variable and a field');
    if (l.type !== r.type) throw new Error(`the sides of "=" reach different types, "${l.type}" and "${r.type}"`);
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

  /** A formula said as a negation: only what has a reading of its own can be negated. */
  private negation(node: Node): Doc {
    switch (node.t) {
      case 'not':
        return this.doc(node.f);
      case 'cmp':
        return this.comparison(node, true);
      case 'call':
        return this.call(node, true);
      case 'name':
        return this.call({ t: 'call', name: node.name, args: [] }, true);
      case 'mult':
        return this.mult(node, true);
      default:
        throw new Error(`"not" is supported only before a comparison or a call, not before a ${node.t}`);
    }
  }

  private mult(node: Extract<Node, { t: 'mult' }>, negative: boolean): Doc {
    if (node.q !== 'some' && node.q !== 'no') throw new Error(`"${node.q}" before a set is not supported`);
    const none = (node.q === 'no') !== negative;
    if (this.readPrimed(node.e)) return this.say(`${nameOf((node.e as Extract<Node, { t: 'prime' }>).e, 'a primed set')}'`, [], none);
    const { e, primed } = this.unprimed(node.e);
    if (primed) return prefix(NEXT, this.mult({ ...node, e }, negative));
    const nav = this.navigation(e);
    if (nav === undefined) return this.say(nameOf(e, 'a set'), [], none);
    // no y.f: no member of the type of the field is in y.f
    const x: Node = { t: 'name', name: '\u0000' };
    return this.quantified({ t: 'quant', q: none ? 'no' : 'some', decls: [{ names: ['\u0000'], type: { t: 'name', name: nav.type } }], body: { t: 'cmp', op: 'in', l: x, r: e } });
  }

  /**
   * A quantifier with plain declarations: `disj` becomes the condition that
   * the variables are different, and a difference as a type the condition that
   * the variable is not in what is taken away. A "for every" puts the
   * conditions in front of its rule, a "there is" beside its body.
   */
  private plain(node: Extract<Node, { t: 'quant' }>): Extract<Node, { t: 'quant' }> {
    const conditions: Node[] = [];
    const decls = node.decls.map(({ names, type, disj }): Decl => {
      let base = type;
      while (base.t === 'diff') {
        const out = base.r;
        for (const name of names) {
          const x: Node = { t: 'name', name };
          conditions.push(out.t === 'name' && this.isVariable(out.name) ? { t: 'cmp', op: '!=', l: x, r: out } : { t: 'cmp', op: 'not in', l: x, r: out });
        }
        base = base.l;
      }
      if (disj) names.forEach((a, i) => names.slice(i + 1).forEach(b => conditions.push({ t: 'cmp', op: '!=', l: { t: 'name', name: a }, r: { t: 'name', name: b } })));
      return { names, type: base };
    });
    if (conditions.length === 0) return node;
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
        : node.q === 'no'
          ? `there is no ${vars.length === 1 ? '' : 'combination of '}${each.join(' and ')} such that`
          : (() => {
              throw new Error(`"${node.q}" as a quantifier is not supported`);
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

  /** A node that says one fact in one clause, so that it can stand beside others in a sentence. */
  private clause(node: Node): string | undefined {
    const text = (doc: Doc): string | undefined => (typeof doc === 'string' ? doc : undefined);
    // Two values compared, or a field of many values compared with a variable, are said member by member, which is never one clause; trying would take the name of the member.
    const values = (n: Extract<Node, { t: 'cmp' }>): boolean => {
      if (n.op !== '=' && n.op !== '!=') return false;
      const [l, r] = [this.unprimed(n.l).e, this.unprimed(n.r).e];
      const many = (side: Node): boolean => side.t === 'join' && side.r.t === 'name' && this.readings.fields.get(side.r.name)?.many === true;
      return (l.t === 'join' && r.t === 'join') || many(l) || many(r);
    };
    const plainCmp = (n: Extract<Node, { t: 'cmp' }>): boolean => n.l.t !== 'union' && n.r.t !== 'diff' && !values(n);
    switch (node.t) {
      case 'cmp':
        return plainCmp(node) ? text(this.comparison(node, false)) : undefined;
      case 'call':
        return this.readings.atoms.has(node.name) ? text(this.call(node, false)) : undefined;
      case 'mult':
        return text(this.mult(node, false));
      case 'not':
        if (node.f.t === 'cmp') return plainCmp(node.f) ? text(this.comparison(node.f, true)) : undefined;
        if (node.f.t === 'call') return this.readings.atoms.has(node.f.name) ? text(this.call(node.f, true)) : undefined;
        return undefined;
      case 'quant':
        return this.absorbed(node);
      default:
        return undefined;
    }
  }

  /** The items of an "and" or an "or" as one sentence, when there are few, they are short and flat, and none holds a comma. */
  private inline(items: Node[], word: 'and' | 'or'): string | undefined {
    if (items.length > INLINE_ITEMS) return undefined;
    const said: string[] = [];
    for (const item of items) {
      const clause = this.clause(item);
      // A comma inside an item makes a list of three read as a list of more.
      if (clause === undefined || (clause.includes(',') && items.length > 2)) return undefined;
      said.push(clause);
    }
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
    try {
      if (decl.names.length === 1) return this.absorb(node.q, decl.names[0] as string, decl.type, node.body);
      if (decl.names.length === 2 && node.q === 'some') return this.absorbPair(decl.names as [string, string], decl.type, node.body);
      return undefined;
    } catch {
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
    let other: string | undefined;
    const rest: Node[] = [];
    for (const part of parts) {
      if (part.t === 'cmp' && part.op === '!=' && part.l.t === 'name' && part.r.t === 'name' && (part.l.name === x || part.r.name === x)) {
        other = part.l.name === x ? part.r.name : part.l.name;
      } else rest.push(part);
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
      const shown = this.variable({ t: 'name', name: other }, 'the other variable');
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
    const byCases = vars.length === 1 ? this.cases(head, vars[0]!.name, body) : undefined;
    const said = byCases ?? this.doc(body);
    let sentence: Doc;
    if (byCases !== undefined) sentence = byCases;
    else if (typeof said === 'string') sentence = `${head} exactly when ${said}`;
    else if (isList(said)) sentence = { ...said, intro: `${head} exactly when ${said.intro}` };
    else throw new Error(`the definition of "${name}" is a rule or has a "for every", which has no words after "exactly when"`);
    if (params.length === 0) return sentence;
    return { kind: 'block', intro: `for ${vars.map(v => `every ${v.shown}`).join(' and ')}:`, body: sentence };
  }

  doc(node: Node): Doc {
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
      case 'and': {
        const inline = this.inline(node.items, 'and');
        if (inline !== undefined) return inline;
        return { kind: 'list', intro: ALL, items: this.items(node.items, item => item.t === 'quant' && item.q === 'all').flatMap(item => this.spliced(item, ALL)) };
      }
      case 'or': {
        const inline = this.inline(node.items, 'or');
        if (inline !== undefined) return inline;
        return { kind: 'list', intro: ANY, items: this.items(node.items, () => true).flatMap(item => this.spliced(item, ANY)) };
      }
      case 'implies':
        return { kind: 'rule', when: this.doc(node.l), then: this.doc(node.r) };
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
        if (sides.some(holdsBinary)) throw new Error(`"${node.op}" with a side that holds "until", "since", "releases", "triggered" or ";" reads in more than one way`);
        const [l, r] = [this.doc(node.l), this.doc(node.r)];
        if (typeof l !== 'string' || typeof r !== 'string') throw new Error(`"${node.op}" is supported only between two clauses`);
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
        throw new Error(`a ${node.t} cannot stand as a statement`);
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
    if (i === 0 || subject === undefined || before === undefined || subjectOf(before) !== subject) return clause;
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
  return [
    `when ${when[0]}${when.length === 1 && then.length === 1 ? `, ${TIME_PHRASE.test(then[0] as string) ? 'then ' : ''}${then[0]}` : ''}`,
    ...(when.length === 1 && then.length === 1 ? [] : [...when.slice(1), `then ${then[0]}`, ...then.slice(1).map(line => `     ${line}`)])
  ];
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
  if (when.length === 1 && then.length === 1) return [`when ${when[0]}, ${TIME_PHRASE.test(then[0] as string) ? 'then ' : ''}${then[0]}`];
  return [`when ${when[0]}${when.length === 1 ? ',' : ''}`, ...when.slice(1), '', `then ${then[0]}`, ...then.slice(1)];
}

/**
 * The words for the formula in `source`, as lines of text, or as markdown with links. `self` is the href of the
 * place the words are for, which they never link to. Throws an Error that names what cannot be said.
 */
export function verbalize(source: string, readings: Readings, layout: 'text' | 'markdown' = 'text', self?: string): string {
  return finish(new Verbalizer(readings).doc(parseFormula(source)), layout, self);
}

const DEFINITION = /^\s*pred\s+(\w+)\s*(?:\[([^\]]*)\])?\s*\{([\s\S]*)\}\s*$/;

/** Whether the text is a definition, `pred name[params] { body }`, and not a formula. */
export const isDefinition = (source: string): boolean => /^\s*pred\b/.test(source);

/** The parameters of a definition, `disj a, b: T, c: U`, in groups that share a type; a group marked `disj` stands for different things. */
function parameterGroups(text: string): { names: string[]; type?: string; disj: boolean }[] {
  const groups: { names: string[]; type?: string; disj: boolean }[] = [];
  let pending: { names: string[]; disj: boolean } = { names: [], disj: false };
  for (const part of text.split(',').map(p => p.trim()).filter(p => p !== '')) {
    const [rawNames, type] = part.includes(':') ? part.split(':').map(p => p.trim()) : [part, undefined];
    const disj = /^disj\s+/.test(rawNames as string);
    pending = { names: [...pending.names, (rawNames as string).replace(/^disj\s+/, '')], disj: pending.disj || disj };
    if (type !== undefined) {
      groups.push({ ...pending, type });
      pending = { names: [], disj: false };
    }
  }
  if (pending.names.length > 0) groups.push(pending);
  return groups;
}

/** The pairs of parameters that `disj` says are different. */
const differences = (groups: { names: string[]; disj: boolean }[]): [string, string][] =>
  groups.filter(g => g.disj).flatMap(g => g.names.flatMap((a, i) => g.names.slice(i + 1).map((b): [string, string] => [a, b])));

/** The parameters of a definition, `a, b: T, c: U`, each with its type. */
function parameters(text: string): { name: string; type: string }[] {
  const groups = parameterGroups(text);
  const untyped = groups.find(g => g.type === undefined);
  if (untyped !== undefined) throw new Error(`the parameter "${untyped.names[0]}" has no type`);
  return groups.flatMap(g => g.names.map(name => ({ name, type: g.type as string })));
}

/**
 * The words for a definition, `pred name[params] { body }`: what the predicate
 * names, exactly when its body holds. Throws an Error that names what cannot be said.
 */
export function verbalizeDefinition(source: string, readings: Readings, layout: 'text' | 'markdown' = 'text', self?: string): string {
  const m = DEFINITION.exec(source);
  if (!m) throw new Error('a definition is written `pred name[parameters] { formula }`');
  const body = parseFormula(m[3] as string);
  const different: Node[] = differences(parameterGroups(m[2] ?? '')).map(([a, b]) => ({ t: 'cmp', op: '!=', l: { t: 'name', name: a }, r: { t: 'name', name: b } }));
  const all: Node = different.length === 0 ? body : { t: 'and', items: [...different, ...(body.t === 'and' ? body.items : [body])] };
  const doc = new Verbalizer(readings).definition(m[1] as string, parameters(m[2] ?? ''), all);
  return finish(doc, layout, self);
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
