// Every generated statement of the three canons, said in text layout with every pass and with `claim-first` off,
// the canon's model and bounds, and the vocabulary a reader may see. Run from anywhere: node corpus.ts <outdir>
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
const REPO = process.env.REPO ?? '/Users/bigmistqke/Documents/GitHub/skills'; // a checkout of the skills repository
const P = `${REPO}/packages`;
const { readBlocks } = await import(`${P}/canon/src/blocks.ts`);
const { readUnits } = await import(`${P}/canon/src/units.ts`);
const { contextOf } = await import(`${P}/canon/src/extends.ts`);
const { readingsOf } = await import(`${P}/canon-plugin-alloy/src/statements.ts`);
const { alloyProgram, predicateName } = await import(`${P}/canon-plugin-alloy/src/alloy.ts`);
const { say, sayDefinition, isDefinition } = await import(`${P}/naturalloy/src/core/index.ts`);
const { PASSES } = await import(`${P}/naturalloy/src/core/passes/index.ts`);
const { lower, context: ctxOf } = await import(`${P}/naturalloy/src/core/index.ts`);
const { optimize, children } = await import(`${P}/naturalloy/src/core/pass.ts`);
const { meaning } = await import(`${P}/naturalloy/src/core/ir.ts`);

// The rules of the IR that `pick` selects, outside a "whenever" (where a rule is part of the time phrase), in order.
function rulesOf(s: any, pick: (r: any) => boolean): any[] {
  const found: any[] = [];
  const walk = (x: any, whenever: boolean) => {
    if (!whenever && x.t === 'rule' && x.otherwise === undefined && pick(x)) found.push(x);
    children(x, (c: any) => (walk(c, x.t === 'moment' && x.form === 'whenever'), c));
  };
  walk(s, false);
  return found;
}
// The IR with one rule node replaced.
function replaced(s: any, target: any, by: any): any {
  if (s === target) return by;
  return children(s, (c: any) => replaced(c, target, by));
}
// The misreadings of a rule: read two-way ("exactly when"), and read the other way round.
function misreadings(ir: any, rules: any[]) {
  return rules.map((r: any) => ({
    twoWay: meaning(replaced(ir, r, { t: 'iff', l: r.when, r: r.then })),
    converse: meaning(replaced(ir, r, { t: 'rule', when: r.then, then: r.when }))
  }));
}

const out = resolve(process.argv[2] ?? '.');
mkdirSync(out, { recursive: true });
const docs = ['canon', 'canon-plugin-alloy', 'naturalloy'];
const all: unknown[] = [];
const OFF = new Set(['claim-first']);
for (const name of docs) {
  const file = `${P}/${name}/CANON.md`;
  const src = readFileSync(file, 'utf8');
  const ctxFiles: string[] = contextOf(file, REPO);
  const context = ctxFiles.map(other => ({ path: relative(dirname(file), other).split('\\').join('/'), src: readFileSync(other, 'utf8') }));
  const readings = readingsOf(src, context);
  const program = alloyProgram(src, 'check', undefined, context.map(c => c.src));
  writeFileSync(`${out}/${name}.als`, program.model);
  writeFileSync(`${out}/${name}.bounds`, (program.commands[0] ?? '').replace(/^run consistent \{[^]*?\} /, ''));
  // Vocabulary, as the 2026-10-20 study gave it: readings, declarations and definitions, never a claim.
  const vreadings: string[] = [], decls: string[] = [];
  for (const f of [...[...ctxFiles].reverse(), file]) {
    const s = readFileSync(f, 'utf8');
    for (const b of readBlocks(s, readUnits(s))) {
      if (b.lang === 'readings') vreadings.push(b.body.trim());
      else if (b.lang === 'alloy' && (b.role === 'vocabulary' || (b.role === 'unit' && /^\s*(pred|fun)\s/.test(b.body)))) decls.push(b.body.trim());
    }
  }
  writeFileSync(`${out}/${name}.vocab.md`, `# Vocabulary\n\n## Readings\n\nEach line \`word: positive | negative\` gives the English of a word; {1}, {2} are its arguments in order.\n\n\`\`\`text\n${vreadings.join('\n')}\n\`\`\`\n\n## Declarations and definitions (Alloy 6)\n\n\`\`\`alloy\n${decls.join('\n\n')}\n\`\`\`\n`);
  // Statements: each unit's one formula, and each scenario.
  const units = readUnits(src);
  const blocks = readBlocks(src, units).filter((b: any) => b.lang === 'alloy');
  const items: { key: string; unit: string; body: string; scenario: boolean }[] = [];
  for (const u of units) {
    const preds = blocks.filter((b: any) => b.unit === u.id && b.role === 'unit');
    if (preds.length === 1) items.push({ key: u.id, unit: u.id, body: preds[0].body, scenario: false });
  }
  const counted = new Map<string, number>();
  for (const b of blocks.filter((b: any) => b.role === 'scenario')) {
    const n = (counted.get(b.unit) ?? 0) + 1;
    counted.set(b.unit, n);
    items.push({ key: `scenario-${n}-${b.unit}`, unit: b.unit, body: b.body, scenario: true });
  }
  const words = (body: string, off: Set<string>) => {
    try {
      return isDefinition(body) ? sayDefinition(body, readings, { layout: 'text', passes: PASSES, off }) : say(body, readings, { layout: 'text', passes: PASSES, off });
    } catch (e) {
      return undefined;
    }
  };
  for (const it of items) {
    const now = words(it.body, new Set());
    if (now === undefined) continue;
    const old = words(it.body, OFF)!;
    const pre = it.scenario ? 'It must be possible that:\n\n' : '';
    const changed = now !== old;
    let ir: any, rules: any[] = [], lineRules: any[] = [], allRules: any[] = [];
    if (!isDefinition(it.body)) {
      ir = optimize(lower(it.body, readings), PASSES, ctxOf(readings)).ir;
      rules = rulesOf(ir, r => r.form === 'claim-first');
      lineRules = rulesOf(ir, r => r.form === 'line');
      allRules = rulesOf(ir, () => true);
    }
    all.push({
      id: it.key, doc: name, unit: it.unit, pred: predicateName(it.unit), definition: isDefinition(it.body), scenario: it.scenario,
      formula: it.body.trim(), claimFirst: pre + now, oldOrder: pre + old, changed,
      // The IR said back as Alloy, which must mean the formula; and the misreadings of each rule the probe is about.
      irMeaning: ir ? meaning(ir) : undefined,
      claimFirstRules: rules.length, lineRules: lineRules.length, rules: allRules.length,
      misreadings: ir ? misreadings(ir, changed ? rules : lineRules) : []
    });
  }
}
writeFileSync(`${out}/statements.json`, JSON.stringify(all, null, 1));
const c = all.filter((x: any) => x.changed);
console.log('statements', all.length, 'changed by claim-first', c.length);
for (const x of c as any[]) console.log(' ', x.doc, x.id, x.definition ? '(definition)' : '');
