/**
 * The words of a document that keeps readings: what its Alloy blocks declare,
 * where, and what says them. A word is a signature, a field of a signature that
 * holds a relation, or a predicate. The terms of a document are the places that
 * name its words, so a word belongs in the term that names it, with the readings
 * that say it, and a word that nothing uses is a model element no claim relies
 * on. These checks read text only and need no solver.
 */
import { readBlocks } from '@bigmistqke/canon/blocks';
import { readUnits } from '@bigmistqke/canon/units';

export type WordKind = 'signature' | 'field' | 'predicate';

export interface Word {
  /** `Freelancing`, `Sit.rel` for the field `rel` of the signature `Sit`, or `cites`. */
  name: string;
  kind: WordKind;
  /** The unit that holds the declaration. */
  unit: string;
}

export type WordFindingKind = 'undeclared' | 'misplaced' | 'apart' | 'unused';

export interface WordFinding {
  unit: string;
  kind: WordFindingKind;
  message: string;
}

const strip = (text: string): string => text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(?:--|\/\/)[^\n]*/g, ' ');

/** The text between the brace at `open` and its closing brace, and where the closing brace is. */
function braced(text: string, open: number): { body: string; end: number } {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return { body: text.slice(open + 1, i), end: i };
  }
  return { body: text.slice(open + 1), end: text.length };
}

/** The names a field declaration list gives: `a: T, b, c: U` gives a, b and c, split at the commas outside any bracket. */
function fieldNames(body: string): string[] {
  const names: string[] = [];
  let depth = 0;
  let segment = '';
  const flush = (): void => {
    const colon = segment.indexOf(':');
    const head = colon === -1 ? segment : segment.slice(0, colon);
    for (const name of head.replace(/\bvar\b/g, ' ').split(',')) if (/^\s*\w+\s*$/.test(name)) names.push(name.trim());
    segment = '';
  };
  for (const ch of body) {
    if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) {
      // a name with no type yet belongs to the declaration that follows it, `a, b: T`
      if (segment.includes(':')) flush();
      else segment += ch;
    } else segment += ch;
  }
  flush();
  return names;
}

/** The words that the text of one model block declares, outside its comments. */
export function declaredIn(body: string): { name: string; kind: WordKind }[] {
  const found: { name: string; kind: WordKind }[] = [];
  const text = strip(body);
  for (const m of text.matchAll(/\bsig\s+([\w\s,]+?)(?:\s+(?:extends|in)\s+[\w\s+]+?)?\s*\{/g)) {
    const { body: fields } = braced(text, (m.index ?? 0) + m[0].length - 1);
    const names = (m[1] as string).split(',').map(n => n.trim());
    for (const name of names) found.push({ name, kind: 'signature' });
    if (names.length === 1) for (const field of fieldNames(fields)) found.push({ name: `${names[0]}.${field}`, kind: 'field' });
  }
  for (const m of text.matchAll(/\bpred\s+(\w+)/g)) found.push({ name: m[1] as string, kind: 'predicate' });
  return found;
}

/** The words that the model blocks of a document declare, each with the unit that holds it. */
export function declared(src: string): Word[] {
  const found: Word[] = [];
  for (const block of readBlocks(src, readUnits(src))) {
    if (block.lang !== 'alloy' || block.role === 'bounds' || block.role === 'scenario') continue;
    for (const word of declaredIn(block.body)) found.push({ ...word, unit: block.unit });
  }
  return found;
}

/** What a unit's model blocks and formulas say, apart from the names they declare: where a word is used. */
function usedText(src: string): string {
  return readBlocks(src, readUnits(src))
    .filter(b => b.lang === 'alloy' && b.role !== 'bounds' && b.role !== 'scenario')
    .map(b => strip(b.body))
    .join('\n');
}

/** The declared field a key names: `Sit.rel`, or just the field, `on`, as the sentence for `x.on = y` is keyed. */
function fieldOf(words: Word[], key: string): Word[] {
  return words.filter(w => w.kind === 'field' && (w.name === key || w.name.endsWith(`.${key}`)));
}

/** The key of a reading line, `Sit.rel`, `Throwing'` or `cites`, and each noun, with the unit that holds it. */
function readingKeys(src: string): { key: string; unit: string; noun: boolean }[] {
  const keys: { key: string; unit: string; noun: boolean }[] = [];
  for (const block of readBlocks(src, readUnits(src))) {
    if (block.lang !== 'readings') continue;
    for (const raw of block.body.split('\n')) {
      const line = raw.trim();
      if (line === '' || line.startsWith('#')) continue;
      const noun = /^noun\s+(\w+)\s*:/.exec(line);
      if (noun) {
        keys.push({ key: noun[1] as string, unit: block.unit, noun: true });
        continue;
      }
      const atom = /^([\w.']+)\s*:/.exec(line);
      if (atom) keys.push({ key: (atom[1] as string).replace(/'$/, ''), unit: block.unit, noun: false });
    }
  }
  return keys;
}

/**
 * The findings about the words of a document, in document order: a reading for
 * a word nothing declares, a declaration that is not in a term, a reading apart
 * from the declaration it says, and a word that no claim, definition or fact
 * uses. A document with no readings is left alone.
 */
export function checkWords(src: string, context: string[] = []): WordFinding[] {
  const keys = readingKeys(src);
  if (keys.length === 0) return [];
  const kinds = new Map(readUnits(src).map(u => [u.id, u.kind]));
  const words = declared(src);
  // The words of the documents it extends are declared there, and are the document's words as well.
  const inherited = context.flatMap(declared);
  const byName = new Map(words.map(w => [w.name, w]));
  const found: WordFinding[] = [];

  for (const { key, unit, noun } of keys) {
    const candidates = byName.has(key) ? [byName.get(key) as Word] : fieldOf(words, key);
    if (candidates.length === 0 && (inherited.some(w => w.name === key) || fieldOf(inherited, key).length > 0)) continue;
    if (candidates.length === 0) {
      found.push({ unit, kind: 'undeclared', message: `${noun ? 'the noun' : 'the reading'} "${key}" says a word that nothing in the document declares` });
    } else if (!candidates.some(w => w.unit === unit)) {
      found.push({ unit, kind: 'apart', message: `"${key}" is declared in ${(candidates[0] as Word).unit}, so its ${noun ? 'noun' : 'reading'} belongs there` });
    }
  }

  for (const word of words) {
    if (kinds.get(word.unit) !== 'term') {
      found.push({ unit: word.unit, kind: 'misplaced', message: `declares the ${word.kind} "${word.name}", which belongs in the term that names it` });
    }
  }

  const text = usedText(src);
  for (const word of words) {
    const uses = word.kind === 'field' ? usesOfField(text, words, word) : (text.match(new RegExp(`\\b${word.name}\\b`, 'g')) ?? []).length - declarations(words, word);
    if (uses <= 0) found.push({ unit: word.unit, kind: 'unused', message: `declares "${word.name}", which no claim, definition or fact uses` });
  }
  return found;
}

/** How many times a signature or a predicate is named in the declarations of words of that name: once each. */
const declarations = (words: Word[], word: Word): number => words.filter(w => w.name === word.name && w.kind !== 'field').length;

/**
 * How many times a field is used: written `Holder.field`, or, when no other
 * signature has a field of that name, written after any value, `x.field`.
 */
function usesOfField(text: string, words: Word[], word: Word): number {
  const [holder, field] = word.name.split('.') as [string, string];
  const shared = words.filter(w => w.kind === 'field' && w.name.endsWith(`.${field}`)).length > 1;
  const pattern = shared ? new RegExp(`\\b${holder}\\s*\\.\\s*${field}\\b`, 'g') : new RegExp(`\\.\\s*${field}\\b`, 'g');
  return (text.match(pattern) ?? []).length;
}
