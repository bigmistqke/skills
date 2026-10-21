/**
 * The parser: the words of the printer back to the sentence IR. Each construct the printer says has one form, so the
 * words are a controlled language, and the parser reads them by the same rules a reader holds. It returns every reading
 * it finds. One reading, meaning what the printed IR means, proves the printer said it without loss; two that mean
 * different things show that the words can be read two ways.
 *
 * It reads the text layout. A statement is first read back into the layout the printer made of it: lists, blocks and
 * rules. Then each part is read as a sentence.
 */
import type { Readings } from '../readings.ts';
import { unbracketed } from '../readings.ts';
import type { Clause, Compared, Moment, NounPhrase, Num, Sentence, Term, Var } from './ir.ts';

/** What a statement was laid out as: a line, a list, a block, or a rule. */
type Doc = string | { kind: 'list'; intro: string; items: Doc[] } | { kind: 'block'; intro: string; body: Doc } | { kind: 'rule'; lead: string; when: Doc; then: Doc; otherwise?: Doc };

interface Line {
  indent: number;
  text: string;
}

/** The layout of lines: the first line opens a rule, a list, a block, or is all there is. */
function layout(lines: Line[]): Doc[] {
  const [first, ...rest] = lines;
  if (first === undefined) return [];
  const base = first.indent;
  const lead = /^(when|from now on, whenever) /.exec(first.text)?.[1];
  const thenAt = rest.findIndex(line => line.indent === base && line.text.startsWith('then '));
  if (lead !== undefined && thenAt !== -1) {
    const otherwiseAt = rest.findIndex(line => line.indent === base && line.text.startsWith('otherwise '));
    const whenLines = [{ indent: base, text: first.text.slice(lead.length + 1) }, ...rest.slice(0, thenAt)];
    const thenEnd = otherwiseAt === -1 ? rest.length : otherwiseAt;
    const then = rest[thenAt] as Line;
    const thenLines = [{ indent: base, text: then.text.slice('then '.length) }, ...rest.slice(thenAt + 1, thenEnd).map(line => ({ indent: line.indent - 5, text: line.text }))];
    const otherwiseLines =
      otherwiseAt === -1 ? undefined : [{ indent: base, text: (rest[otherwiseAt] as Line).text.slice('otherwise '.length) }, ...rest.slice(otherwiseAt + 1).map(line => ({ indent: line.indent - 10, text: line.text }))];
    const out: Doc[] = [];
    for (const when of layout(whenLines))
      for (const thenDoc of layout(thenLines)) {
        if (otherwiseLines === undefined) out.push({ kind: 'rule', lead, when, then: thenDoc });
        else for (const otherwise of layout(otherwiseLines)) out.push({ kind: 'rule', lead, when, then: thenDoc, otherwise });
      }
    return out;
  }
  if (rest.length === 0) return [first.text];
  if (!first.text.endsWith(':')) return [];
  const intro = first.text.slice(0, -1);
  const below = rest[0] as Line;
  if (below.indent === base + 2 && below.text.startsWith('- ')) {
    // Each item opens at a bullet at the indent below the intro, and goes on with the lines below it.
    const starts = rest.flatMap((line, i) => (line.indent === base + 2 && line.text.startsWith('- ') ? [i] : []));
    const items = starts.map((start, k) => [{ indent: base + 4, text: (rest[start] as Line).text.slice(2) }, ...rest.slice(start + 1, starts[k + 1] ?? rest.length)]);
    let all: Doc[][] = [[]];
    for (const item of items) all = all.flatMap(done => layout(item).map(doc => [...done, doc]));
    return all.map(docs => ({ kind: 'list', intro, items: docs }));
  }
  return layout(rest).map(body => ({ kind: 'block', intro, body }));
}

/** The lines of a statement, without its capital and its period. */
function linesOf(text: string): Line[] {
  const lines = text.split('\n').map(line => ({ indent: line.length - line.trimStart().length, text: line.trim() }));
  const first = lines[0] as Line;
  first.text = first.text.replace(/^([A-Z])/, c => c.toLowerCase());
  const last = lines[lines.length - 1] as Line;
  last.text = last.text.replace(/\.$/, '');
  return lines;
}

const MOMENTS: [string, Moment][] = [
  ['from now on', 'always'],
  ['now or later', 'eventually'],
  ['at the next moment', 'after'],
  ['there is a moment just before, and at it', 'before'],
  ['now or earlier', 'once'],
  ['now and at every earlier moment', 'historically']
];

/** What the names of a statement stand for, as a reader meets them. */
type Scope = ReadonlyMap<string, Term>;

/** Every way to split words at a separator, as a reader could. */
function splits(words: string, separator: string): [string, string][] {
  const out: [string, string][] = [];
  for (let at = words.indexOf(separator); at !== -1; at = words.indexOf(separator, at + 1)) out.push([words.slice(0, at), words.slice(at + separator.length)]);
  return out;
}

const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const WRAP = "in integers that wrap around at the analyzer's bit width, ";
/** The words of each operator of a comparison of numbers, the longest first, so that "is not less than" is not read as "less than". */
const COMPARED: [string, Compared][] = [
  ['is not less than', '!<'], ['is not greater than', '!>'], ['is not at most', '!=<'], ['is not at least', '!>='], ['is not equal to', '!='],
  ['is less than', '<'], ['is greater than', '>'], ['is at most', '=<'], ['is at least', '>='], ['is equal to', '=']
];

/** The numbers the words name after "where": number_1, number_2, each with every reading of its words. */
type Defs = ReadonlyMap<string, Num[]>;

/** Noun phrases "another" and "no other" whose other thing is the term the clause before says in the same place. */
const PENDING = new WeakSet<object>();
/** For such a phrase, the thing of its kind a quantifier introduced last, which it differs from when nothing nearer is named. */
const FALLBACK = new WeakMap<object, Term>();

/** A reading with each "another" or "no other" that differs from nothing differing from the thing its quantifier introduced last. */
function settled(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(settled);
  if (node === null || typeof node !== 'object') return node;
  const o = node as Record<string, unknown>;
  const fallback = o.t === 'np' && PENDING.has(o) && o.other === undefined ? FALLBACK.get(o) : undefined;
  const out = Object.fromEntries(Object.entries(o).map(([k, v]) => [k, settled(v)]));
  if (fallback !== undefined) return { ...out, other: fallback };
  if (PENDING.has(o)) PENDING.add(out);
  return out;
}

/** Whether a reading holds "another" or "no other" that differs from nothing. */
function unresolved(node: unknown): boolean {
  if (Array.isArray(node)) return node.some(unresolved);
  if (node === null || typeof node !== 'object') return false;
  const o = node as Record<string, unknown>;
  if (o.t === 'np' && PENDING.has(o) && o.other === undefined) return true;
  return Object.values(o).some(unresolved);
}

export class Parser {
  private readonly readings: Readings;
  /** The type of each noun, by its words. */
  private readonly types = new Map<string, string>();
  /** Each reading's words as a pattern with a group for each slot. */
  private readonly templates: { key: string; negative: boolean; pattern: RegExp; slots: number[] }[] = [];
  private ids = 0;
  /** The names the formula leaves free, which the words say as they are. */
  private readonly free: ReadonlySet<string>;

  constructor(readings: Readings, free: Iterable<string> = []) {
    this.readings = readings;
    this.free = new Set(free);
    for (const [type, words] of readings.nouns) this.types.set(unbracketed(words).trim(), type);
    for (const [key, reading] of readings.atoms)
      for (const [negative, words] of [[false, reading.positive], [true, reading.negative]] as [boolean, string | undefined][]) {
        if (words === undefined) continue;
        const plain = unbracketed(words);
        const slots = [...plain.matchAll(/\{(\d+)\}/g)].map(m => Number(m[1]));
        const pattern = new RegExp(`^${plain.split(/\{\d+\}/).map(escape).join('(.+?)')}$`);
        this.templates.push({ key, negative, pattern, slots });
      }
  }

  /** Every IR the words of a statement can be read as. */
  statement(text: string): Sentence[] {
    // "another" or "no other" with nothing before it of its kind has no reading.
    return layout(linesOf(text))
      .flatMap(doc => this.doc(doc, new Map()))
      .map(s => settled(s) as Sentence)
      .filter(s => !unresolved(s));
  }

  private fresh(type: string): Var {
    return { id: `p${++this.ids}`, type };
  }

  // ---- names and terms ----

  /** The variables an intro names, "cleanup_1", "every owner_2", "the unit": each with its type, new in scope. */
  private named(name: string): { name: string; v: Var } | undefined {
    const stem = name.replace(/_\d+$/, '').replace(/_/g, ' ');
    const type = this.types.get(stem);
    return type === undefined ? undefined : { name, v: this.fresh(type) };
  }

  /** What a term says: a variable in scope, "the noun" of one, a string, a free name, or a noun phrase. */
  private terms(words: string, scope: Scope): Term[] {
    const out: Term[] = [];
    const inScope = scope.get(words) ?? (words.startsWith('the ') ? scope.get(words.slice(4).replace(/ /g, '_')) : undefined);
    if (inScope !== undefined) out.push(inScope);
    if (/^"[^"]*"$/.test(words)) out.push({ t: 'string', value: words.slice(1, -1) });
    // A free variable: a name of the formula, which no quantifier of the words introduced.
    if (this.free.has(words) && !scope.has(words)) out.push({ t: 'free', name: words });
    out.push(...this.phrases(words, scope));
    return out;
  }

  /** A noun phrase: "a unit", "no owner that pulse has disposed", "another unit", "a text other than "a"". */
  private phrases(words: string, scope: Scope): NounPhrase[] {
    const out: NounPhrase[] = [];
    const m = /^(no other|another|an|a|no) (.+)$/.exec(words);
    if (m === null) return out;
    const [, det, rest] = m as unknown as [string, string, string];
    for (const [noun, type] of this.types) {
      if (rest !== noun && !rest.startsWith(`${noun} `)) continue;
      const after = rest.slice(noun.length).trim();
      const v = this.fresh(type);
      const others: (Term | undefined)[] = [undefined];
      let relativeWords = after;
      const other = /^other than (.+?)(?: (that .+))?$/.exec(after);
      if (other !== null) {
        others.splice(0, 1, ...this.terms(other[1] as string, scope));
        relativeWords = other[2] ?? '';
      }
      const relatives: (Sentence | undefined)[] = relativeWords === '' ? [undefined] : relativeWords.startsWith('that ') ? this.relative(relativeWords.slice(5), v, scope) : [];
      for (const otherTerm of others)
        for (const relative of relatives) {
          const np: NounPhrase = { t: 'np', det: det === 'no' || det === 'no other' ? 'no' : 'a', v };
          if (relative !== undefined) np.relative = relative;
          // "another unit" and "no other owner" differ from a thing of their kind the sentence already names: the pass gives
          // them the variable they differ from, which a reader finds as the one thing of the kind in play.
          if (det === 'another' || det === 'no other') {
            // It differs from the thing of its kind the words named last: in its clause, in the clause before, or where a
            // quantifier introduced it.
            const pending = { ...np };
            PENDING.add(pending);
            const kin = [...scope.values()].filter(term => term.t === 'var' && term.v.type === type).at(-1);
            if (kin !== undefined) FALLBACK.set(pending, kin);
            out.push(pending);
            continue;
          }
          if (otherTerm !== undefined) np.other = otherTerm;
          out.push(np);
        }
    }
    return out;
  }

  /** The words after "that": conditions with the variable as their subject, joined by "and", or one with it at its end. */
  private relative(words: string, v: Var, scope: Scope): Sentence[] {
    const hole = '\u0003';
    const inner = new Map([...scope, [hole, { t: 'var', v } as Term]]);
    const out: Sentence[] = [];
    // "that is not a spec, an axiom or a fact": one negation over each kind.
    const negations = /^is not (.+)$/.exec(words);
    const subjects: string[][] = [];
    for (const parts of this.series(words, 'and')) subjects.push(parts.map(part => `${hole} ${part}`));
    if (negations !== null) for (const parts of this.series(negations[1] as string, 'or')) subjects.push(parts.map(part => `${hole} is not ${part}`));
    for (const parts of subjects) {
      let all: Sentence[][] = [[]];
      for (const part of parts) all = all.flatMap(done => this.clauses(part, inner).map(c => [...done, c]));
      for (const said of all) out.push(said.length === 1 ? (said[0] as Sentence) : { t: 'and', items: said });
    }
    // "an issue that tracker does not know": the variable at the end.
    out.push(...this.clauses(`${words} ${hole}`, inner));
    return out;
  }

  /** Every way to read words as a series of two or three parts, "a, b and c" or "a and b". */
  private series(words: string, word: 'and' | 'or'): string[][] {
    const out: string[][] = [[words]];
    for (const [a, b] of splits(words, ` ${word} `)) {
      out.push([a, b]);
      for (const [x, y] of splits(a, ', ')) out.push([x, y, b]);
    }
    return out;
  }

  /** A clause: a reading with a term in each slot, or one of the printer's own. */
  clauses(words: string, scope: Scope, elided = false): Clause[] {
    const out: Clause[] = [];
    for (const template of this.templates) {
      const m = template.pattern.exec(words);
      if (m === null) continue;
      // Each slot, as the order of the reading's slots puts it.
      const filled = new Map<number, string>();
      template.slots.forEach((slot, i) => filled.set(slot, m[i + 1] as string));
      const arity = Math.max(0, ...template.slots);
      let all: Term[][] = [[]];
      for (let slot = 1; slot <= arity; slot++) all = all.flatMap(done => this.terms(filled.get(slot) as string, scope).map(term => [...done, term]));
      const form = arity === 0 ? 'some' : this.form(template.key);
      for (const args of all) {
        // "another unit" in a clause that names a unit before it differs from that unit.
        const resolved = args.map((arg, k) => {
          if (arg.t !== 'np' || !PENDING.has(arg)) return arg;
          // A subject the words leave out is not named before it.
          const before = (elided ? args.slice(1, k) : args.slice(0, k)).reverse().find(b => b.t === 'var' && b.v.type === arg.v.type);
          return before === undefined ? arg : { ...arg, other: before };
        });
        out.push({ t: 'reading', key: template.key, form, args: resolved, negative: template.negative });
      }
    }
    const same = /^(.+) and (.+) are (the same|different)$/.exec(words);
    if (same !== null)
      for (const l of this.terms(same[1] as string, scope)) for (const r of this.terms(same[2] as string, scope)) out.push({ t: 'same', l, r, negative: same[3] === 'different' });
    const isA = /^(.+) is (not )?(?:an?) (.+)$/.exec(words);
    if (isA !== null) {
      const type = this.types.get(isA[3] as string);
      if (type !== undefined && !this.readings.atoms.has(type)) for (const x of this.terms(isA[1] as string, scope)) out.push({ t: 'isA', x, type, negative: isA[2] !== undefined });
    }
    const next = /^(.+) is (not )?the integer after (.+) without wrapping around$/.exec(words);
    if (next !== null) for (const y of this.terms(next[1] as string, scope)) for (const x of this.terms(next[3] as string, scope)) out.push({ t: 'next', x, y, negative: next[2] !== undefined });
    // "owner_1 reaches owner_2 in one or more steps, where a step from owner_3 to owner_4 is that owner_4 is the parent of owner_3".
    const reach = /^(.+?) (reaches|does not reach) (.+?) in (one|zero) or more steps, where a step from (\S+) to (\S+) is that (.+)$/.exec(words);
    if (reach !== null) {
      const [p, q] = [this.named(reach[5] as string), this.named(reach[6] as string)];
      if (p !== undefined && q !== undefined) {
        const inner = new Map([...scope, [p.name, { t: 'var', v: p.v } as Term], [q.name, { t: 'var', v: q.v } as Term]]);
        for (const from of this.terms(reach[1] as string, scope))
          for (const to of this.terms(reach[3] as string, scope))
            for (const step of this.sentence(reach[7] as string, inner))
              out.push({ t: 'reach', from, to, reflexive: reach[4] === 'zero', p: p.v, q: q.v, step, relation: { t: 'name', name: 'step' }, negative: reach[2] !== 'reaches' });
      }
    }
    out.push(...this.compare(words, scope, new Map()));
    return out;
  }

  /** "in integers that wrap around at the analyzer's bit width, a is less than b", with the numbers named after "where". */
  private compare(words: string, scope: Scope, defs: Defs): Clause[] {
    if (!words.startsWith(WRAP)) return [];
    const out: Clause[] = [];
    const rest = words.slice(WRAP.length);
    for (const [phrase, op] of COMPARED)
      for (const [a, b] of splits(rest, ` ${phrase} `)) {
        // A shorter phrase inside a longer one, "less than" in "not less than", is the longer one's.
        if (COMPARED.some(([longer]) => longer !== phrase && longer.endsWith(phrase) && a.endsWith(` ${longer.slice(0, -phrase.length).trim()}`))) continue;
        for (const l of this.numbers(a, scope, defs)) for (const r of this.numbers(b, scope, defs)) out.push({ t: 'compare', op, l, r });
      }
    return out;
  }

  /** The readings of the words of a number. */
  private numbers(words: string, scope: Scope, defs: Defs): Num[] {
    const out: Num[] = [];
    if (/^-?\d+$/.test(words)) out.push({ t: 'literal', value: Number(words) });
    if (words === 'the least integer') out.push({ t: 'least' });
    if (words === 'the greatest integer') out.push({ t: 'greatest' });
    out.push(...(defs.get(words) ?? []));
    for (const x of this.terms(words, scope)) if (x.t !== 'np') out.push({ t: 'term', x });
    for (const [word, op] of [['plus', 'plus'], ['minus', 'minus'], ['times', 'times']] as const)
      for (const [a, b] of splits(words, ` ${word} `)) for (const l of this.numbers(a, scope, defs)) for (const r of this.numbers(b, scope, defs)) out.push({ t: 'arith', op, l, r });
    out.push(...this.defined(words, scope, defs, undefined));
    return out;
  }

  /** What a number named after "where" is: a count, a sum, a division or a remainder; `body` is its condition set apart. */
  private defined(words: string, scope: Scope, defs: Defs, body: Doc | undefined): Num[] {
    const out: Num[] = [];
    const conditions = (cond: string | undefined, inner: Scope): Sentence[] => (body !== undefined ? this.doc(body, inner) : cond === undefined ? [] : this.sentence(cond, inner));
    const values = /^the number of (?:values of (\S+)|combinations of (.+?)) such that(?: (.+))?$/.exec(words);
    if (values !== null) {
      const vars = this.introduced(values[1] !== undefined ? [values[1]] : (values[2] as string).split(' and '));
      if (vars !== undefined) {
        const inner = new Map([...scope, ...vars.map(({ name, v }): [string, Term] => [name, { t: 'var', v }])]);
        for (const cond of conditions(values[3], inner)) out.push({ t: 'count', vars: vars.map(x => x.v), cond });
      }
    }
    const sum = /^the sum of the values of (\S+) such that(?: (.+))?$/.exec(words);
    if (sum !== null) {
      const v = this.named(sum[1] as string);
      if (v !== undefined) for (const cond of conditions(sum[2], new Map([...scope, [v.name, { t: 'var', v: v.v } as Term]]))) out.push({ t: 'sumOf', v: v.v, cond });
    }
    const over = /^the sum, over every (.+?), of (.+)$/.exec(words);
    if (over !== null) {
      const vars = this.introduced((over[1] as string).split(' and every '));
      if (vars !== undefined) {
        const inner = new Map([...scope, ...vars.map(({ name, v }): [string, Term] => [name, { t: 'var', v }])]);
        for (const n of this.numbers(over[2] as string, inner, defs)) out.push({ t: 'sumOver', vars: vars.map(x => x.v), body: n });
      }
    }
    const div = /^(.+) divided by (.+), rounded toward zero; when (.+) is 0, it is -1, 0 or 1 as (.+) is positive, zero or negative$/.exec(words);
    if (div !== null && div[2] === div[3] && div[1] === div[4]) for (const l of this.numbers(div[1] as string, scope, defs)) for (const r of this.numbers(div[2] as string, scope, defs)) out.push({ t: 'arith', op: 'div', l, r });
    const rem = /^the remainder of (.+) divided by (.+), with the sign of (.+); when (.+) is 0, it is (.+)$/.exec(words);
    if (rem !== null && rem[1] === rem[3] && rem[2] === rem[4]) for (const l of this.numbers(rem[1] as string, scope, defs)) for (const r of this.numbers(rem[2] as string, scope, defs)) out.push({ t: 'arith', op: 'rem', l, r });
    return out;
  }

  /** The numbers a "where" names: "number_1 is …", each a line or a block. */
  private where(items: Doc[], scope: Scope): Defs[] {
    let all: Map<string, Num[]>[] = [new Map()];
    for (const item of items) {
      const [line, body] = typeof item === 'string' ? [item, undefined] : item.kind === 'block' ? [item.intro, item.body] : [undefined, undefined];
      const m = line === undefined ? null : /^(number_\d+) is (.+)$/.exec(line);
      if (m === null) return [];
      all = all.map(defs => new Map([...defs, [m[1] as string, this.defined(m[2] as string, scope, defs, body).concat(body === undefined ? this.numbers(m[2] as string, scope, defs) : [])]]));
    }
    return all;
  }

  /** How a reading's words relate to the formula, by what the vocabulary declares its key to be. */
  private form(key: string): 'in' | 'call' | 'fun' {
    if (this.readings.functions.has(key)) return 'fun';
    if (this.readings.definitions.has(key) || this.readings.macros.has(key)) return 'call';
    if (this.readings.fields.has(key) || this.readings.holders.has(key.replace(/'$/, '')) || key.includes('.') || this.readings.relations?.has(key) === true) return 'in';
    // A name the vocabulary does not declare, of another module: a signature or a set by its capital, a predicate otherwise.
    return /^[A-Z]/.test(key.split('/').at(-1) as string) ? 'in' : 'call';
  }

  // ---- sentences ----

  /** A line: a rule, a time phrase over words, an equivalence, a quantifier, a series of clauses, or a clause. */
  sentence(words: string, scope: Scope): Sentence[] {
    const out: Sentence[] = [...this.clauses(words, scope)];
    // A comparison with one number named after "where".
    for (const [head, def] of splits(words, ', where ')) for (const defs of this.where([def], scope)) out.push(...this.compare(head, scope, defs));
    // "when a, b" and "when a, then b", with "; otherwise, c".
    for (const lead of ['when ', 'from now on, whenever '] as const) {
      if (!words.startsWith(lead)) continue;
      const body = words.slice(lead.length);
      const [main, otherwiseWords] = body.includes('; otherwise, ') ? (splits(body, '; otherwise, ').at(-1) as [string, string]) : [body, undefined];
      for (const [when, rest] of splits(main, ', ')) {
        const then = rest.startsWith('then ') ? rest.slice(5) : rest;
        for (const w of this.sentence(when, scope))
          for (const t of this.sentence(then, scope)) {
            const rules: Sentence[] =
              otherwiseWords === undefined ? [{ t: 'rule', when: w, then: t }] : this.sentence(otherwiseWords, scope).map(o => ({ t: 'rule', when: w, then: t, otherwise: o }) as Sentence);
            for (const rule of rules) out.push(lead === 'when ' ? rule : { t: 'moment', op: 'always', body: rule });
          }
      }
    }
    for (const [phrase, op] of MOMENTS) if (words.startsWith(`${phrase}, `)) for (const body of this.sentence(words.slice(phrase.length + 2), scope)) out.push({ t: 'moment', op, body });
    // "b now or later, and until then, a"; "b now or earlier, and at every moment after the last such moment, up to and including now, a".
    for (const [b, a] of splits(words, ' now or later, and until then, ')) for (const bs of this.sentence(b, scope)) for (const as of this.sentence(a, scope)) out.push({ t: 'until', a: as, b: bs });
    for (const [b, a] of splits(words, ' now or earlier, and at every moment after the last such moment, up to and including now, '))
      for (const bs of this.sentence(b, scope)) for (const as of this.sentence(a, scope)) out.push({ t: 'since', a: as, b: bs });
    for (const [l, r] of splits(words, ' exactly when ')) {
      const next = /^(.+) at the next moment$/.exec(l);
      const now = /^(.+) now$/.exec(r);
      for (const ls of this.sentence(l, scope)) for (const rs of this.sentence(r, scope)) out.push({ t: 'iff', l: ls, r: rs });
      if (next !== null) for (const ls of this.sentence(next[1] as string, scope)) for (const rs of this.sentence(now?.[1] ?? r, scope)) out.push({ t: 'iff', l: { t: 'moment', op: 'after', body: ls }, r: rs });
    }
    if (words.startsWith('it is not the case that ')) for (const body of this.sentence(words.slice('it is not the case that '.length), scope)) out.push({ t: 'not', body });
    out.push(...this.quantifier(words, scope));
    // "a, and at the next moment, b".
    for (const [a, b] of splits(words, ', and ')) if (b.startsWith('at the next moment, ')) for (const as of this.sentence(a, scope)) for (const bs of this.sentence(b, scope)) out.push({ t: 'and', items: [as, bs] });
    out.push(...this.coordination(words, scope));
    return out;
  }

  /** "a, b and c" and "a or b": clauses, each said in full or without the subject it shares with the one before. */
  private coordination(words: string, scope: Scope): Sentence[] {
    const out: Sentence[] = [];
    for (const word of ['and', 'or'] as const)
      for (const parts of this.series(words, word).filter(p => p.length > 1)) {
        let all: Sentence[][] = [[]];
        for (const [i, part] of parts.entries()) {
          all = all.flatMap(done => {
            const said: Sentence[] = this.clauses(part, scope).filter(c => this.clauseLike(c));
            // A time phrase covers the rest of its sentence: only the last clause of a series can begin with one.
            const timed = i === parts.length - 1 && i > 0 ? MOMENTS.find(([phrase]) => phrase === 'at the next moment' && part.startsWith(`${phrase}, `)) : undefined;
            if (timed !== undefined) said.push(...this.clauses(part.slice('at the next moment, '.length), scope).map(c => ({ t: 'moment', op: 'after', body: c }) as Sentence));
            // Without its subject: the subject of the clause before it.
            const before = done[i - 1];
            const subject = before === undefined ? undefined : this.subjectWords(parts[i - 1] as string, scope);
            if (subject !== undefined) said.push(...this.clauses(`${subject} ${part}`, scope, true));
            return said.map(s => [...done, s]);
          });
        }
        for (const items of all) {
          // "the cleanup is on owner_1 and is on no other owner": the other is what the clause before says in that place.
          // "unit_1 names a unit and names another unit": the pair of two things of one kind that differ.
          if (word === 'and' && items.length === 2) {
            const [first, second] = items as [Sentence, Sentence];
            if (first.t === 'reading' && second.t === 'reading') {
              const k = second.args.findIndex(arg => arg.t === 'np' && PENDING.has(arg) && arg.det === 'a');
              const one = first.args[k];
              if (k !== -1 && one?.t === 'np' && one.det === 'a' && one.v.type === (second.args[k] as NounPhrase).v.type) {
                const another = { ...(second.args[k] as NounPhrase), other: { t: 'var', v: one.v } as Term };
                out.push({ t: 'pair', first, second: { ...second, args: second.args.map((arg, i) => (i === k ? another : arg)) } });
                continue;
              }
            }
          }
          const fixed = items.map((item, i) => {
            if (item.t !== 'reading' || i === 0) return item;
            const before = items[i - 1] as Sentence;
            if (before.t !== 'reading' || before.key !== item.key) return item;
            // "no other" differs from what the clause before says in its place, where that is a thing and not a phrase.
            const args = item.args.map((arg, k) => (arg.t === 'np' && PENDING.has(arg) && arg.other === undefined && (before.args[k] as Term).t !== 'np' ? { ...arg, other: before.args[k] as Term } : arg));
            return { ...item, args };
          });
          if (JSON.stringify(fixed).includes('"det"') && fixed.some(item => item.t === 'reading' && item.args.some(arg => arg.t === 'np' && PENDING.has(arg)))) continue;
          out.push({ t: word, items: fixed });
        }
      }
    return out;
  }

  private clauseLike(s: Sentence): boolean {
    return s.t === 'reading' || s.t === 'same' || s.t === 'isA' || s.t === 'next';
  }

  /** The words of the subject a clause begins with: what fills the first slot of its reading, where its words begin with that slot. */
  private subjectWords(words: string, scope: Scope): string | undefined {
    for (const template of this.templates) {
      const m = template.pattern.exec(words);
      if (m === null || !template.pattern.source.startsWith('^(.+?)')) continue;
      if (this.terms(m[1] as string, scope).length > 0) return m[1] as string;
    }
    return /^(.+?) (?:is|are) /.exec(words)?.[1];
  }

  /** "there is a unit_1 such that …", "there is no combination of …", "there is a unit that …", "no unit …", "for some …". */
  private quantifier(words: string, scope: Scope): Sentence[] {
    const out: Sentence[] = [];
    const heads: [RegExp, 'some' | 'no' | 'one' | 'lone'][] = [
      [/^there (?:is an?|are) (.+?) such that (.+)$/, 'some'],
      [/^there is no (?:combination of )?(.+?) such that (.+)$/, 'no'],
      [/^there is exactly one (?:combination of )?(.+?) such that (.+)$/, 'one'],
      [/^there is at most one (?:combination of )?(.+?) such that (.+)$/, 'lone']
    ];
    for (const [pattern, q] of heads) {
      const m = pattern.exec(words);
      if (m === null) continue;
      const vars = this.introduced((m[1] as string).split(' and '));
      if (vars === undefined) continue;
      const inner = new Map([...scope, ...vars.map(({ name, v }): [string, Term] => [name, { t: 'var', v }])]);
      for (const body of this.sentence(m[2] as string, inner)) out.push({ t: 'quant', q, vars: vars.map(x => x.v), body });
    }
    // "there is an owner", "there is no owner": the noun alone.
    const bare = /^there is (an?|no|exactly one|at most one) (.+)$/.exec(words);
    if (bare !== null) {
      const type = this.types.get(bare[2] as string);
      const q = { a: 'some', an: 'some', no: 'no', 'exactly one': 'one', 'at most one': 'lone' }[bare[1] as string] as 'some';
      if (type !== undefined) out.push({ t: 'quant', q, vars: [this.fresh(type)], body: { t: 'and', items: [] } });
    }
    // "there is a unit that is a spec", "there is no unit that …", "no unit is a spec".
    const subject = /^there is (an?|no) (.+?) that (.+)$/.exec(words) ?? /^(no) (.+?) (.+)$/.exec(words);
    if (subject !== null) {
      const type = this.types.get(subject[2] as string);
      if (type !== undefined) {
        const v = this.fresh(type);
        const q = subject[1] === 'no' ? 'no' : 'some';
        const rest = subject[3] as string;
        for (const body of this.relative(rest, v, scope)) out.push({ t: 'quant', q, vars: [v], body });
      }
    }
    return out;
  }

  /** The variables a quantifier introduces, by the names the words give them. */
  private introduced(names: string[]): { name: string; v: Var }[] | undefined {
    const out = names.map(name => this.named(name.replace(/^(?:every|some) /, '').trim()));
    return out.some(x => x === undefined) ? undefined : (out as { name: string; v: Var }[]);
  }

  // ---- the layout ----

  private doc(doc: Doc, scope: Scope): Sentence[] {
    if (typeof doc === 'string') return this.sentence(doc, scope);
    if (doc.kind === 'rule') {
      const out: Sentence[] = [];
      for (const when of this.doc(doc.when, scope))
        for (const then of this.doc(doc.then, scope)) {
          const rules: Sentence[] = doc.otherwise === undefined ? [{ t: 'rule', when, then }] : this.doc(doc.otherwise, scope).map(o => ({ t: 'rule', when, then, otherwise: o }) as Sentence);
          for (const rule of rules) out.push(doc.lead === 'when' ? rule : { t: 'moment', op: 'always', body: rule });
        }
      return out;
    }
    return this.intro(doc.intro, doc, scope);
  }

  /** The intro of a list or a block, with what it opens. */
  private intro(intro: string, doc: Exclude<Doc, string | { kind: 'rule' }>, scope: Scope): Sentence[] {
    const out: Sentence[] = [];
    const items = (inner: Scope): Sentence[][] => {
      if (doc.kind !== 'list') return this.doc(doc.body, inner).map(s => [s]);
      let all: Sentence[][] = [[]];
      for (const item of doc.items) all = all.flatMap(done => this.doc(item, inner).map(s => [...done, s]));
      return all;
    };
    const one = (inner: Scope): Sentence[] => items(inner).flatMap(list => (list.length === 1 ? [list[0] as Sentence] : []));
    if (doc.kind === 'list') {
      const lists: [string, (xs: Sentence[]) => Sentence | undefined][] = [
        ['all of these hold', xs => ({ t: 'and', items: xs })],
        ['at least one of these holds', xs => ({ t: 'or', items: xs })],
        ['both or neither of these hold', xs => (xs.length === 2 ? { t: 'iff', l: xs[0] as Sentence, r: xs[1] as Sentence } : undefined)],
        ['exactly one of these holds', xs => (xs.length === 2 ? { t: 'not', body: { t: 'iff', l: xs[0] as Sentence, r: xs[1] as Sentence } } : undefined)]
      ];
      for (const [words, make] of lists) if (intro === words) for (const xs of items(scope)) {
        const made = make(xs);
        if (made !== undefined) out.push(made);
      }
      // `until` and `since` with their sides set apart, each below the words that place it in time.
      const parts: [string, string, 'until' | 'since'][] = [
        ['now or later, the following holds', 'at every moment from now until the first such moment, not including it, the following holds', 'until'],
        ['now or earlier, the following holds', 'at every moment after the last such moment, up to and including now, the following holds', 'since']
      ];
      const [first, second] = doc.items;
      for (const [b, a, op] of parts)
        if (intro === 'all of these hold' && doc.items.length === 2 && typeof first === 'object' && first.kind === 'block' && first.intro === b && typeof second === 'object' && second.kind === 'block' && second.intro === a)
          for (const bs of this.doc(first.body, scope)) for (const as of this.doc(second.body, scope)) out.push({ t: op, a: as, b: bs });
    }
    if (doc.kind === 'block') {
      if (intro === 'the following holds' || intro === 'it is not the case that') for (const body of one(scope)) out.push(intro === 'the following holds' ? body : { t: 'not', body });
      for (const [phrase, op] of MOMENTS) if (intro === phrase) for (const body of one(scope)) out.push({ t: 'moment', op, body });
    }
    // A comparison with the numbers it names below "where:".
    if (doc.kind === 'list' && intro.endsWith(', where')) for (const defs of this.where(doc.items, scope)) out.push(...this.compare(intro.slice(0, -', where'.length), scope, defs));
    // An intro after a time phrase: "from now on, for every cleanup:".
    for (const [phrase, op] of MOMENTS) if (intro.startsWith(`${phrase}, `)) for (const body of this.intro(intro.slice(phrase.length + 2), doc, scope)) out.push({ t: 'moment', op, body });
    if (intro.startsWith('it is not the case that ')) for (const body of this.intro(intro.slice('it is not the case that '.length), doc, scope)) out.push({ t: 'not', body });
    // "for every cleanup_1, every owner_1 and every owner_2:" and "for some …".
    const forAll = /^for (every|some) (.+)$/.exec(intro);
    if (forAll !== null) {
      const names = (forAll[2] as string).split(/, | and /);
      const vars = this.introduced(names);
      if (vars !== undefined) {
        const inner = new Map([...scope, ...vars.map(({ name, v }): [string, Term] => [name, { t: 'var', v }])]);
        for (const body of one(inner)) out.push({ t: 'quant', q: forAll[1] === 'every' ? 'all' : 'some', vars: vars.map(x => x.v), body });
      }
    }
    // "there is a cleanup_1 such that all of these hold:", "there is a unit that:".
    const head = /^(there (?:is an?|are|is no|is no combination of|is exactly one|is at most one|is exactly one combination of|is at most one combination of) .+? such that)(?: (.+))?$/.exec(intro);
    if (head !== null) {
      const words = head[1] as string;
      const q: 'some' | 'no' | 'one' | 'lone' = /is no /.test(words) ? 'no' : /exactly one/.test(words) ? 'one' : /at most one/.test(words) ? 'lone' : 'some';
      const names = words.replace(/^there (?:is an?|are|is no|is exactly one|is at most one) (?:combination of )?/, '').replace(/ such that$/, '');
      const vars = this.introduced(names.split(' and '));
      if (vars !== undefined) {
        const inner = new Map([...scope, ...vars.map(({ name, v }): [string, Term] => [name, { t: 'var', v }])]);
        const bodies = head[2] === undefined ? one(inner) : this.intro(head[2], doc, inner);
        for (const body of bodies) out.push({ t: 'quant', q, vars: vars.map(x => x.v), body });
      }
    }
    const subjectList = /^there is an? (.+) that$/.exec(intro);
    if (subjectList !== null && doc.kind === 'list') {
      const type = this.types.get(subjectList[1] as string);
      if (type !== undefined) {
        const v = this.fresh(type);
        const hole = '\u0003';
        const inner = new Map([...scope, [hole, { t: 'var', v } as Term]]);
        let all: Sentence[][] = [[]];
        for (const item of doc.items) all = all.flatMap(done => (typeof item === 'string' ? this.clauses(`${hole} ${item}`, inner) : []).map(c => [...done, c as Sentence]));
        for (const xs of all) out.push({ t: 'quant', q: 'some', vars: [v], body: { t: 'and', items: xs } });
      }
    }
    return out;
  }
}

/** The IR with nested lists of one kind made one, as the printer says them. */
function flat(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(flat);
  if (node === null || typeof node !== 'object') return node;
  const o = Object.fromEntries(Object.entries(node).map(([k, v]) => [k, flat(v)])) as Record<string, unknown>;
  if ((o.t === 'and' || o.t === 'or') && Array.isArray(o.items)) o.items = (o.items as Record<string, unknown>[]).flatMap(i => (i.t === o.t ? (i.items as unknown[]) : [i]));
  return o;
}

/** A meaning with its variables named in the order they appear, and no brackets around a single membership. */
export function canonical(meaning: string): string {
  const seen = new Map<string, string>();
  return meaning.replace(/\((v_\w+(?:->v_\w+)? (?:in|not in) [^()]+?)\)/g, '$1').replace(/\bv_\w+/g, v => {
    if (!seen.has(v)) seen.set(v, `x${seen.size}`);
    return seen.get(v) as string;
  });
}

/** What the words of a statement mean, read back by the reading rules: one canonical meaning for each reading. */
export function readBack(words: string, readings: Readings, free: Iterable<string> = [], meaning: (s: Sentence) => string): string[] {
  return [...new Set(new Parser(readings, free).statement(words).map(s => canonical(meaning(flat(s) as Sentence))))];
}

/** The canonical meaning of an IR, as `readBack` gives it. */
export function meant(s: Sentence, meaning: (s: Sentence) => string): string {
  return canonical(meaning(flat(s) as Sentence));
}
