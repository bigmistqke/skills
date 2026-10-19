/**
 * The models that the jar of the Alloy analyzer holds: the parser reads every
 * one, and groups every body of them as the analyzer does. These need the
 * jar, and are skipped without it.
 */
import { describe, expect, it } from 'vitest';
import { parseModule, type Decl, type Module, type Node } from '../../src/parse.ts';
import { print, printDecl } from '../../src/print.ts';
import { JAR, modelsOf, runAll } from './jar.ts';

/**
 * The integer library, which the analyzer opens into every module: checked as
 * a module of its own, each of its names would be there twice.
 */
const OPENED_EVERYWHERE = 'models/util/integer.als';

describe.skipIf(!JAR)('the models of the analyzer', () => {
  const models = JAR ? modelsOf(JAR) : new Map<string, string>();

  /**
   * @canon spec-every-model-the-analyzer-ships-is-read
   */
  it('reads every model the jar holds', () => {
    expect(models.size).toBeGreaterThanOrEqual(90);
    const refused = [...models].flatMap(([path, source]) => {
      try {
        parseModule(source);
        return [];
      } catch (error) {
        return [`${path}: ${(error as Error).message}`];
      }
    });
    expect(refused).toEqual([]);
  });

  /**
   * @canon spec-every-formula-is-grouped-as-the-analyzer-groups-it
   */
  it('groups every body of every model as the analyzer does', { timeout: 900_000 }, async () => {
    let targets = [...models].filter(([path]) => path !== OPENED_EVERYWHERE).flatMap(([path, source]) => {
      const module = parseModule(source);
      return module.params === undefined ? bodiesOf(path, source, module) : [];
    });
    let checked = 0;
    const wrong: string[] = [];
    /** The models whose own facts the analyzer cannot translate, so that it can check nothing in them. */
    const beyond = new Set<string>();
    // A check the analyzer cannot decide, because it quantifies over relations on both sides of `<=>`, is checked in its parts.
    for (let round = 0; targets.length > 0 && round < 8; round++) {
      const byModel = Map.groupBy(targets, t => t.path);
      const modules = [...byModel].map(([path, list]) => {
        const name = path.slice(path.lastIndexOf('/') + 1);
        const checks = list.map((t, i) => `check grouped_${i} { ${claimOf(t)} } for 3`);
        if (round === 0) checks.push('check grouped_nothing { no none } for 3');
        return { path: path.replace(name, `grouped_${name}`), source: withoutCommands(list[0]!.source, list[0]!.module) + '\n' + checks.join('\n') + '\n', list, model: path };
      });
      const results = await runAll(models, modules);
      const next: Target[] = [];
      for (const { path, list, model } of modules) {
        const out = results.get(path) ?? '';
        if (round === 0 && !/check grouped_nothing\s.*\bUNSAT\b/.test(out)) {
          beyond.add(model);
          continue;
        }
        list.forEach((target, i) => {
          const line = out.split('\n').find(l => new RegExp(`check grouped_${i}\\s`).test(l));
          // A part with nothing to group, a name or a number, prints as it is written.
          if ((line !== undefined && /\bUNSAT\b/.test(line)) || !/[()]/.test(print(target.node))) checked++;
          else if (line !== undefined && /could not be skolemized/.test(out.slice(out.indexOf(line), out.indexOf(line) + 400)) && partsOf(target).length > 0) next.push(...partsOf(target));
          else wrong.push(`${path}: ${claimOf(target)}\n${line ?? 'not run'}`);
        });
      }
      targets = next;
    }
    expect(targets).toEqual([]);
    expect(wrong).toEqual([]);
    // Both fail with their own commands too: "requires higher-order quantification that could not be skolemized".
    expect([...beyond].sort()).toEqual(['models/examples/algorithms/s_ringlead.als', 'models/examples/case_studies/ins.als']);
    console.log(`${checked} parts grouped as the analyzer groups them`);
    expect(checked).toBeGreaterThanOrEqual(630);
  });
});

/** The source without its commands, so that only the checks below run. */
function withoutCommands(source: string, module: Module): string {
  let text = source;
  for (const p of module.paragraphs.filter(p => p.t === 'command').sort((a, b) => b.span.start - a.span.start)) text = text.slice(0, p.span.start) + text.slice(p.span.end);
  return text;
}

/** A part of a model to check: a formula or an expression, under the declarations of the quantifiers around it. */
interface Target {
  path: string;
  source: string;
  module: Module;
  prefix: Decl[];
  node: Node;
  expression: boolean;
  /** Inside a temporal operator, where the part must agree at every moment, and not only at the first. */
  everyMoment?: boolean;
}

/** The body of every fact, assertion, predicate and function, under the parameters of its predicate or function. */
function bodiesOf(path: string, source: string, module: Module): Target[] {
  const targets: Target[] = [];
  for (const p of module.paragraphs) {
    // A receiver's body speaks of `this`, which a check cannot bind.
    if ((p.t === 'pred' || p.t === 'fun') && p.receiver !== undefined) continue;
    if (p.t === 'fact' || p.t === 'assert' || p.t === 'pred' || p.t === 'fun') {
      targets.push({ path, source, module, prefix: p.t === 'pred' || p.t === 'fun' ? (p.params ?? []) : [], node: p.body, expression: p.t === 'fun' });
    }
  }
  return targets;
}

/** The claim that a part as written is the part printed with every group in parentheses. */
function claimOf(t: Target): string {
  const written = t.source.slice(t.node.span?.start, t.node.span?.end);
  const same = t.expression ? `(${written}) = ${print(t.node)}` : `(${written}) <=> ${print(t.node)}`;
  const claim = t.prefix.length > 0 ? `all ${t.prefix.map(printDecl).join(', ')} | ${same}` : same;
  return t.everyMoment ? `always (${claim})` : claim;
}

/** The parts of a formula that decide it: the body of a quantifier under its declarations, the operands of a connective. */
function partsOf(t: Target): Target[] {
  const part = (node: Node, prefix = t.prefix, expression = false, everyMoment = t.everyMoment): Target => ({ ...t, node, prefix, expression, everyMoment });
  const n = t.node;
  switch (n.t) {
    case 'quant':
      return n.q === 'sum' ? [] : [part(n.body, [...t.prefix, ...n.decls])];
    case 'and':
    case 'or':
      return n.items.map(i => part(i));
    case 'not':
      return [part(n.f)];
    case 'unary':
      return [part(n.f, t.prefix, false, true)];
    case 'implies':
    case 'iff':
      return [part(n.l), part(n.r)];
    case 'binary':
      return [part(n.l, t.prefix, false, true), part(n.r, t.prefix, false, true)];
    case 'ite':
      return [part(n.c), part(n.a, t.prefix, t.expression), part(n.b, t.prefix, t.expression)];
    // A call or a box has nothing to group but its arguments; the body it calls is checked where it is defined.
    case 'call':
      return n.args.map(a => part(a, t.prefix, true));
    case 'box':
      return [part(n.e, t.prefix, true), ...n.args.map(a => part(a, t.prefix, true))];
    default:
      return [];
  }
}
