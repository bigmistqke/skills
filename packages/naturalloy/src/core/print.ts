/**
 * The printer: the sentence IR as words. Each construct has one way it is said, and a hint a pass left on a node picks
 * between the ways that construct allows. With no hints, every construct is laid out in full: each list as bullets,
 * each rule on lines of its own, each time phrase above what it covers. That is the literal reading, `-O0`.
 *
 * The printer names the variables: each by the noun of its type and the next number free for that noun, in the order
 * a reader meets them. The items of a list that stand on their own may each use the same names.
 */
import { type Readings, LINK, LINK_MARK, mark, plain, Refusal, resolveLinks, unbracketed } from '../readings.ts';
import type { Clause, Num, Sentence, Term, Var } from './ir.ts';
import type { PrintOptions } from './pass.ts';

import { coordinate, holdsTime, shareSubject, timed, VARIABLE } from './words.ts';

const ALL = 'all of these hold:';
const ANY = 'at least one of these holds:';
const BOTH = 'both or neither of these hold:';
const UNTRUE = 'it is not the case that:';
const APART = 'the following holds:';
const WRAP = "in integers that wrap around at the analyzer's bit width, ";

const COMPARED: Record<string, string> = { '<': 'is less than', '>': 'is greater than', '=<': 'is at most', '>=': 'is at least', '=': 'is equal to', '!=': 'is not equal to' };

const MOMENT: Record<string, string> = {
  always: 'now and at every later moment',
  eventually: 'now or at a later moment',
  after: 'at the next moment',
  before: 'there is a moment before, and at it',
  once: 'now or at an earlier moment',
  historically: 'now and at every earlier moment'
};

/** What a sentence becomes before it is laid out: a clause, a list that ends in a colon, a block, or a rule. */
export type Doc = string | { kind: 'list'; intro: string; items: Doc[] } | { kind: 'block'; intro: string; body: Doc } | { kind: 'rule'; when: Doc; then: Doc; otherwise?: Doc };

const isList = (doc: Doc): doc is Extract<Doc, { kind: 'list' }> => typeof doc !== 'string' && doc.kind === 'list';

/** "a failing cleanup": the article before the noun, by the sound of its first word. */
export function articleFor(phrase: string): string {
  if (/^(?:uni|use|usu|uti|eu|one|once)/i.test(phrase)) return 'a ';
  return /^[aeiou]/i.test(phrase) ? 'an ' : 'a ';
}

export class Printer {
  /** The names taken so far in the whole rendering. */
  private readonly used = new Set<string>();
  /** The name each variable was given where it was introduced. */
  private readonly names = new Map<string, string>();

  private readonly readings: Readings;
  /** Whether a variable said before it is introduced is named where it is said: for measuring a part on its own. */
  private readonly lenient: boolean;

  constructor(readings: Readings, lenient = false) {
    this.readings = readings;
    this.lenient = lenient;
  }

  // ---- names ----

  private nounOf(type: string): string {
    const written = this.readings.nouns.get(type);
    if (written === undefined) throw new Refusal(`no noun for "${type}"`);
    return written;
  }

  private article(type: string): string {
    const written = this.readings.articles.get(type);
    return written === undefined ? articleFor(unbracketed(this.nounOf(type)).trim()) : `${written} `;
  }

  /** The noun of a type, with its words in brackets marked as links. */
  private noun(type: string): string {
    return mark(this.nounOf(type), this.readings.nounTargets.get(type));
  }

  /** A new name for a variable where it is introduced, linked to the term of its type: unit_1, then unit_2. */
  private introduce(v: Var): string {
    const base = unbracketed(this.nounOf(v.type)).trim().replace(/\s+/g, '_');
    let n = 1;
    while (this.used.has(`${base}_${n}`)) n++;
    const name = `${base}_${n}`;
    this.used.add(name);
    this.names.set(v.id, name);
    const target = this.readings.nounTargets.get(v.type);
    return target === undefined ? name : `${LINK}${target}${LINK}${name}${LINK}`;
  }

  private nameOf(v: Var): string {
    const name = this.names.get(v.id) ?? (this.lenient ? (this.introduce(v), this.names.get(v.id)) : undefined);
    if (name === undefined) throw new Error(`naturalloy printed the variable ${v.id} before it introduced it`);
    return name;
  }

  /** Items that each stand on their own, said with the names free before them, and with every name any of them took kept taken after. */
  private independent<T>(items: T[], say: (item: T) => Doc): Doc[] {
    const before = [...this.used];
    const introduced = new Set<string>();
    const docs = items.map(item => {
      this.used.clear();
      for (const name of before) this.used.add(name);
      const doc = say(item);
      for (const name of this.used) introduced.add(name);
      return doc;
    });
    this.used.clear();
    for (const name of [...before, ...introduced]) this.used.add(name);
    return docs;
  }

  // ---- clauses ----

  private term(x: Term): string {
    switch (x.t) {
      case 'var':
        return `${VARIABLE}${this.nameOf(x.v)}${VARIABLE}`;
      case 'free':
        return `${VARIABLE}${x.name}${VARIABLE}`;
      case 'string':
        return `${VARIABLE}${JSON.stringify(x.value)}${VARIABLE}`;
      case 'np':
        return this.phrase(x);
    }
  }

  /** A noun phrase: "no owner", "an issue that tracker does not know", "another unit", "a text other than "a"". */
  private phrase(np: Extract<Term, { t: 'np' }>): string {
    const noun = this.noun(np.v.type);
    const hole = `${VARIABLE}\u0003${VARIABLE}`;
    let suffix = '';
    if (np.relative !== undefined) {
      // The conditions are said with a hole in the place of the variable, which the relative clause then leaves out.
      const before = this.names.get(np.v.id);
      this.names.set(np.v.id, '\u0003');
      const parts = (np.relative.t === 'and' ? np.relative.items : [np.relative]).map(part => this.sentence(part) as string);
      if (before === undefined) this.names.delete(np.v.id);
      else this.names.set(np.v.id, before);
      if (parts.every(part => part.startsWith(hole))) {
        const rests = parts.map(part => part.slice(hole.length).trim());
        const negations = rests.every(rest => rest.startsWith('is not '));
        suffix = ` that ${negations ? 'is not ' : ''}${coordinate(negations ? rests.map(rest => rest.slice('is not '.length)) : rests, negations ? 'or' : 'and')}`;
      } else suffix = ` that ${(parts[0] as string).slice(0, -hole.length).trim()}`;
    }
    if (np.det === 'no') return `no ${noun}${suffix}`;
    if (np.other === undefined) return `${this.article(np.v.type)}${noun}${suffix}`;
    if (np.other.t === 'var' && np.other.v.type === np.v.type) return `another ${noun}${suffix}`;
    return `${this.article(np.v.type)}${noun} other than ${this.term(np.other)}${suffix}`;
  }

  /** A reading with a term in each slot. */
  private say(key: string, slots: string[], negative: boolean): string {
    const reading = this.readings.atoms.get(key);
    if (!reading) throw new Refusal(`no reading for "${key}"`);
    const words = negative ? reading.negative : reading.positive;
    if (words === undefined) throw new Refusal(`no negative reading for "${key}"`);
    return mark(words, reading.target).replace(/\{(\d+)\}/g, (_, n: string) => slots[Number(n) - 1] as string);
  }

  private clause(c: Clause): Doc {
    switch (c.t) {
      case 'reading':
        return this.say(c.key, c.args.map(a => this.term(a)), c.negative);
      case 'same':
        return `${this.term(c.l)} and ${this.term(c.r)} are ${c.negative ? 'different' : 'the same'}`;
      case 'isA':
        return `${this.term(c.x)} is ${c.negative ? 'not ' : ''}${this.article(c.type)}${this.noun(c.type)}`;
      case 'reach': {
        const [from, to] = [this.term(c.from), this.term(c.to)];
        const [p, q] = [this.introduce(c.p), this.introduce(c.q)];
        const step = this.sentence(c.step);
        if (typeof step !== 'string') throw new Refusal('a step of a closure is more than one clause');
        return `${from} ${c.negative ? 'does not reach' : 'reaches'} ${to} in ${c.reflexive ? 'zero' : 'one'} or more steps, where a step from ${p} to ${q} is that ${step}`;
      }
      case 'next':
        return `${this.term(c.y)} is ${c.negative ? 'not ' : ''}the integer after ${this.term(c.x)} without wrapping around`;
      case 'compare': {
        const defs: Doc[] = [];
        const [a, b] = [this.number(c.l, defs).words, this.number(c.r, defs).words];
        const main = `${WRAP}${a} ${COMPARED[c.op]} ${b}`;
        if (defs.length === 0) return main;
        if (defs.length === 1 && typeof defs[0] === 'string') return `${main}, where ${defs[0]}`;
        return { kind: 'list', intro: `${main}, where:`, items: defs };
      }
    }
  }

  /** A new name for a number the words define after "where": number_1, number_2. */
  private numberName(): string {
    let n = 1;
    while (this.used.has(`number_${n}`)) n++;
    this.used.add(`number_${n}`);
    return `number_${n}`;
  }

  /**
   * The words of a number. A count, a sum or a division is named, and its words go to `defs`, said after "where".
   * Inside a sum, `defs` is undefined: a part there names the variable of the sum, so it is said in place.
   */
  private number(n: Num, defs: Doc[] | undefined): { words: string; open: boolean } {
    const named = (words: string, open: boolean, body?: Doc): { words: string; open: boolean } => {
      if (defs === undefined) {
        if (body !== undefined) throw new Refusal('what a count or a sum takes in is more than a sentence');
        return { words, open };
      }
      const name = this.numberName();
      defs.push(body === undefined ? `${name} is ${words}` : { kind: 'block', intro: `${name} is ${words}:`, body });
      return { words: name, open: false };
    };
    const closed = (part: { words: string; open: boolean }): string => {
      if (part.open) throw new Refusal('a count or a sum stands before other words, which would read two ways');
      return part.words;
    };

    switch (n.t) {
      case 'literal':
        return { words: String(n.value), open: false };
      case 'least':
        return { words: 'the least integer', open: false };
      case 'greatest':
        return { words: 'the greatest integer', open: false };
      case 'term':
        return { words: this.term(n.x), open: false };
      case 'count': {
        const shown = n.vars.map(v => this.introduce(v));
        const of = shown.length === 1 ? `the number of values of ${shown[0]}` : `the number of combinations of ${shown.join(' and ')}`;
        const cond = this.sentence(n.cond);
        return typeof cond === 'string' ? named(`${of} such that ${cond}`, true) : named(`${of} such that`, true, cond);
      }
      case 'sumOf': {
        const shown = this.introduce(n.v);
        const cond = this.sentence(n.cond);
        return typeof cond === 'string' ? named(`the sum of the values of ${shown} such that ${cond}`, true) : named(`the sum of the values of ${shown} such that`, true, cond);
      }
      case 'sumOver': {
        const shown = n.vars.map(v => this.introduce(v));
        const body = this.number(n.body, undefined);
        return named(`the sum, over every ${shown.join(' and every ')}, of ${body.words}`, true);
      }
      case 'arith': {
        const x = closed(this.number(n.l, defs));
        const y = this.number(n.r, defs);
        if (n.op === 'plus' || n.op === 'minus' || n.op === 'times') return { words: `${x} ${n.op} ${y.words}`, open: y.open };
        const z = closed(y);
        if (n.op === 'div') return named(`${x} divided by ${z}, rounded toward zero; when ${z} is 0, it is -1, 0 or 1 as ${x} is positive, zero or negative`, false);
        return named(`the remainder of ${x} divided by ${z}, with the sign of ${x}; when ${z} is 0, it is ${x}`, false);
      }
    }
  }

  // ---- sentences ----

  /** A part set apart below the words that place it. */
  private apart(intro: string, body: Doc): Doc {
    return { kind: 'block', intro, body };
  }

  /** The items of a list with the given intro, or the doc itself: a list inside a list of the same kind says nothing more. */
  private spliced(doc: Doc, intro: string): Doc[] {
    return isList(doc) && doc.intro === intro ? doc.items : [doc];
  }

  sentence(s: Sentence): Doc {
    switch (s.t) {
      case 'reading':
      case 'same':
      case 'isA':
      case 'reach':
      case 'next':
      case 'compare':
        return this.clause(s);
      case 'and':
      case 'or': {
        const docs = s.t === 'and' ? s.items.map(item => this.sentence(item)) : this.independent(s.items, i => this.sentence(i));
        if (s.inline === true) return coordinate(shareSubject(docs as string[]), s.t);
        return { kind: 'list', intro: s.t === 'and' ? ALL : ANY, items: docs.flatMap(d => this.spliced(d, s.t === 'and' ? ALL : ANY)) };
      }
      case 'not':
        return this.apart(UNTRUE, this.sentence(s.body));
      case 'rule': {
        const side = (x: Sentence): Doc => {
          const doc = this.sentence(x);
          return typeof doc !== 'string' && doc.kind === 'rule' ? this.apart(APART, doc) : doc;
        };
        const [when, then] = [side(s.when), side(s.then)];
        const otherwise = s.otherwise === undefined ? undefined : side(s.otherwise);
        // A time phrase in the first side would reach over the second: the first side is set apart below "when".
        if (s.oneLine !== true && typeof when === 'string' && holdsTime(when)) {
          const apartWhen = this.apart(APART, when);
          return otherwise === undefined ? { kind: 'rule', when: apartWhen, then } : { kind: 'rule', when: apartWhen, then, otherwise };
        }
        // On one line: "when a, b", with "then" before a second side that begins with a time phrase.
        if (s.oneLine === true) return `when ${when as string}, ${timed(then as string) ? 'then ' : ''}${then as string}${otherwise === undefined ? '' : `; otherwise, ${otherwise as string}`}`;
        return otherwise === undefined ? { kind: 'rule', when, then } : { kind: 'rule', when, then, otherwise };
      }
      case 'iff': {
        if (s.nextAndNow === true) {
          // Each side's time phrase at its own end: "a at the next moment exactly when b now".
          const at = (x: Sentence): string => (x.t === 'moment' ? `${this.sentence(x.body) as string} at the next moment` : `${this.sentence(x) as string} now`);
          return `${at(s.l)} exactly when ${at(s.r)}`;
        }
        const [l, r] = [this.sentence(s.l), this.sentence(s.r)];
        return s.inline === true ? `${l as string} exactly when ${r as string}` : { kind: 'list', intro: BOTH, items: [l, r] };
      }
      case 'quant':
        return this.quantified(s);
      case 'moment': {
        const body = this.sentence(s.body);
        if (s.inline !== true) return this.apart(`${MOMENT[s.op]}:`, body);
        // In front of the words it covers: "at the next moment, c has run", or of the line that opens them.
        if (typeof body === 'string') return `${MOMENT[s.op]}, ${body}`;
        if (body.kind === 'rule') throw new Error('naturalloy put a time phrase in front of a rule');
        return { ...body, intro: `${MOMENT[s.op]}, ${body.intro}` };
      }
      case 'until':
      case 'since': {
        const [first, second] =
          s.t === 'until'
            ? ['now or at a later moment, the following holds:', 'at every moment from now until the first such moment, not including it, the following holds:']
            : ['now or at an earlier moment, the following holds:', 'at every moment after the last such moment, up to and including now, the following holds:'];
        return { kind: 'list', intro: ALL, items: [this.apart(first, this.sentence(s.b)), this.apart(second, this.sentence(s.a))] };
      }
      case 'define':
        return this.defined(s);
    }
  }

  private quantified(s: Extract<Sentence, { t: 'quant' }>): Doc {
    const shown = s.vars.map(v => this.introduce(v));
    const empty = s.body.t === 'and' && s.body.items.length === 0;
    if (s.q === 'all') {
      if (empty) throw new Refusal('this formula says nothing: it always holds, so it claims nothing');
      return this.apart(`for ${shown.map(name => `every ${name}`).join(' and ')}:`, this.sentence(s.body));
    }
    const one = s.vars.length === 1;
    const count = { some: '', no: 'no ', one: 'exactly one ', lone: 'at most one ' }[s.q];
    const article = s.q === 'some' ? (one ? this.article((s.vars[0] as Var).type) : '') : count;
    const combination = !one && s.q !== 'some' ? 'combination of ' : '';
    const head = `there ${s.q === 'some' && !one ? 'are' : 'is'} ${article}${combination}${shown.join(' and ')}`;
    if (empty) {
      if (!one) throw new Error('naturalloy has no words for several things with no condition');
      // "there is an owner": the noun alone, in place of the name, where nothing more is said of it.
      return `there is ${s.q === 'some' ? this.article((s.vars[0] as Var).type) : count}${this.noun((s.vars[0] as Var).type)}`;
    }
    const body = this.sentence(s.body);
    if (typeof body === 'string') return `${head} such that ${body}`;
    if (isList(body)) return { ...body, intro: `${head} such that ${body.intro}` };
    return this.apart(`${head} such that:`, body);
  }

  private defined(s: Extract<Sentence, { t: 'define' }>): Doc {
    const shown = s.params.map(v => this.introduce(v));
    const head = this.clause(s.head) as string;
    const empty = s.body.t === 'and' && s.body.items.length === 0;
    let sentence: Doc;
    if (empty) sentence = head;
    else {
      const body = s.body.t === 'iff' ? ({ kind: 'list', intro: BOTH, items: [this.sentence(s.body.l), this.sentence(s.body.r)] } as Doc) : this.sentence(s.body);
      if (typeof body === 'string') sentence = `${head} exactly when ${body}`;
      else if (isList(body)) sentence = { ...body, intro: `${head} exactly when ${body.intro}` };
      else sentence = this.apart(`${head} exactly when the following holds:`, body);
    }
    return shown.length === 0 ? sentence : this.apart(`for ${shown.map(name => `every ${name}`).join(' and ')}:`, sentence);
  }
}

// ---- layout ----

/** A doc as lines, with its lists bulleted, its blocks indented, and each rule on lines of its own. */
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
  const [when, then] = [lines(doc.when), lines(doc.then)];
  const otherwise = doc.otherwise === undefined ? undefined : lines(doc.otherwise);
  return [
    `when ${when[0]}`,
    ...when.slice(1),
    `then ${then[0]}`,
    ...then.slice(1).map(line => `     ${line}`),
    ...(otherwise === undefined ? [] : [`otherwise ${otherwise[0]}`, ...otherwise.slice(1).map(line => `          ${line}`)])
  ];
}

/** A doc as lines of Markdown: blank lines and lists carry the structure that indentation carries in text. */
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
  const [when, then] = [markdownLines(doc.when), markdownLines(doc.then)];
  const otherwise = doc.otherwise === undefined ? undefined : markdownLines(doc.otherwise);
  return [
    `when ${when[0]}${when.length === 1 ? ',' : ''}`,
    ...when.slice(1),
    '',
    `then ${then[0]}`,
    ...then.slice(1),
    ...(otherwise === undefined ? [] : ['', `otherwise ${otherwise[0]}`, ...otherwise.slice(1)])
  ];
}

/** A doc as text: laid out, with a capital where the sentence starts with its own words and a period where it ends. */
export function finish(doc: Doc, layout: 'text' | 'markdown', self: string | undefined, options: PrintOptions = { dropLoneNumbers: false }): string {
  const raw = layout === 'markdown' ? markdownLines(doc) : lines(doc);
  const out = resolveLinks(raw.join('\n'), layout === 'markdown', self).split('\n');
  if (!(out[0] as string).startsWith(VARIABLE)) out[0] = (out[0] as string).replace(/^(\[?)(.)/, (_, bracket: string, c: string) => bracket + c.toUpperCase());
  const last = out.length - 1;
  if (!/(:|^\s*- .*)$/.test(out[last] as string)) out[last] = `${out[last]}.`;
  const text = out.join('\n').replaceAll(VARIABLE, '');
  return options.dropLoneNumbers ? unnumbered(text) : text;
}

/**
 * The words with the number left off a variable that is the only one of its noun, where the noun says nothing else in
 * them: "for every unit: when the unit is circular". Where the noun appears elsewhere, "the unit" could mean that, so the
 * number stays; so does a number of the words' own, `number_1`.
 */
function unnumbered(text: string): string {
  const name = /\b([a-z][a-z_]*?)_(\d+)\b/g;
  const byNoun = new Map<string, Set<string>>();
  for (const [whole, stem] of text.matchAll(name)) if (stem !== 'number') byNoun.set(stem as string, (byNoun.get(stem as string) ?? new Set()).add(whole));
  // A link's target, such as (#term-unit), is not a word the reader sees.
  const elsewhere = text.replace(/\]\([^)]*\)/g, ']').replace(name, ' ');
  let out = text;
  for (const [stem, names] of byNoun) {
    const noun = stem.replace(/_/g, ' ');
    if (names.size !== 1 || new RegExp(`\\b${noun}(?:s|es)?\\b`, 'i').test(elsewhere)) continue;
    const variable = [...names][0] as string;
    // Only a variable that a quantifier introduces, "every unit_1" or "a unit_1": one that "values of" or "a step from"
    // introduces stands for each of many, which "the unit" would say as one.
    const first = text.indexOf(variable);
    if (!/\b(?:every|an?|no|exactly one|at most one|some) \[?$/.test(text.slice(0, first))) continue;
    const counted = '(\\b(?:every|an?|no|exactly one|at most one|some) )';
    out = out
      .replace(new RegExp(`${counted}\\[${variable}\\]`, 'g'), `$1[${noun}]`)
      .replace(new RegExp(`\\[${variable}\\]`, 'g'), `the [${noun}]`)
      .replace(new RegExp(`${counted}${variable}\\b`, 'g'), `$1${noun}`)
      .replace(new RegExp(`\\b${variable}\\b`, 'g'), `the ${noun}`);
  }
  return out.replace(/^(> )?the /, (_, quote: string | undefined) => `${quote ?? ''}The `);
}

/** The words without the marks of variables and links. */
export const seen = (words: string): string => plain(words).replaceAll(VARIABLE, '');
export { LINK_MARK };
