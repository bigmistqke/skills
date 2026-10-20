// Build a timeline probe for the wordings of until and since: each reader judges, for one wording of each formula,
// whether the sentence holds on six timelines. The truth comes from the Alloy meaning, computed here.
import { writeFileSync } from 'node:fs';
const dir = new URL('.', import.meta.url).pathname;
const cap = s => s[0].toUpperCase() + s.slice(1);
const pairs = {
  U1: ['until', 'code has registered the cleanup', 'pulse has disposed the owner'],
  U2: ['until', 'the cleanup has not run', 'code has registered the cleanup'],
  U3: ['until', 'the cleanup is on the owner', 'the dispose of the owner has been stopped'],
  S1: ['since', 'code has registered the cleanup', 'pulse has disposed the owner'],
  S2: ['since', 'the cleanup has not run', 'code has registered the cleanup'],
  S3: ['since', 'the cleanup is on the owner', 'the dispose of the owner has been stopped'],
};
const words = {
  until: {
    V0: (a, b) => `All of these hold:\n  - now or at a later moment, the following holds:\n      ${b}\n  - at every moment from now until the first such moment, not including it, the following holds:\n      ${a}.`,
    V1: (a, b) => `${cap(a)} until ${b}.`,
    V2: (a, b) => `${cap(b)} now or at a later moment, and until the first such moment, ${a}.`,
    V3: (a, b) => `${cap(b)} now or at a later moment, and up to the first such moment, but not necessarily at it, ${a}.`,
  },
  since: {
    V0: (a, b) => `All of these hold:\n  - now or at an earlier moment, the following holds:\n      ${b}\n  - at every moment after the last such moment, up to and including now, the following holds:\n      ${a}.`,
    V1: (a, b) => `${cap(a)} ever since ${b}.`,
    V2: (a, b) => `${cap(b)} now or at an earlier moment, and ever since the last such moment, ${a}.`,
    V3: (a, b) => `${cap(b)} now or at an earlier moment, and at every moment after the last such moment, up to and including now, ${a}.`,
  },
};
// [A, B] at moments 0..4.
const T = (a, b) => a.split('').map((x, i) => [x === '1', b[i] === '1']);
const timelines = {
  until: { // now is moment 0; every moment after 4 is like moment 4
    never: T('11111', '00000'), now: T('00000', '10000'.replace(/./g, (c, i) => (i === 0 ? '1' : '0'))), atEnd: T('11000', '00100'),
    after: T('11000', '00100'), first: T('10011', '01010'), broken: T('10111', '00100'),
  },
  since: { // now is moment 4; moment 0 is the first moment
    never: T('11111', '00000'), now: T('00000', '00001'), atEnd: T('00011', '00100'),
    before: T('00111', '00100'), last: T('11011', '01010'), broken: T('11101', '01000'),
  },
};
timelines.until.atEnd = T('11011', '00100'); // A fails only at the end moment
timelines.until.after = T('11100', '00100'); // A fails only after the end
const holds = (op, tl) => {
  if (op === 'until') { for (let j = 0; j < 5; j++) { if (tl[j][1]) return tl.slice(0, j).every(m => m[0]); } return false; }
  for (let j = 4; j >= 0; j--) { if (tl[j][1]) return tl.slice(j + 1).every(m => m[0]); } return false;
};
const yn = x => (x ? 'yes' : 'no');
const variants = ['V0', 'V1', 'V2', 'V3'];
const ids = Object.keys(pairs);
const truth = [];
for (let r = 0; r < 8; r++) {
  let md = `# Batch ${r}\n\n`;
  const qs = [];
  ids.forEach((id, f) => {
    const [op, a, b] = pairs[id];
    const v = variants[(f + r) % 4];
    md += `## Sentence ${id}\n\n${op === 'until' ? 'Now is moment 0. Every moment after moment 4 is like moment 4, forever.' : 'Now is moment 4. Moment 0 is the first moment there is.'}\n\n> ${words[op][v](a, b).replace(/\n/g, '\n> ')}\n\n`;
    for (const [name, tl] of Object.entries(timelines[op])) {
      const q = `${id}-${name}`;
      md += `**${q}**\n\n| moment | ${a} | ${b} |\n|---|---|---|\n${tl.map((m, i) => `| ${i} | ${yn(m[0])} | ${yn(m[1])} |`).join('\n')}\n\n`;
      qs.push(q);
      truth.push({ reader: r, q, id, op, variant: v, timeline: name, truth: holds(op, tl) });
    }
  });
  writeFileSync(`${dir}batch-${r}.md`, md);
}
writeFileSync(`${dir}truth.json`, JSON.stringify(truth, null, 1));
writeFileSync(`${dir}brief.md`, `# Does the sentence hold?

Your batch file has six sentences. Under each sentence are six timelines, each named in bold (such as **U1-never**). A timeline lists, moment by moment, which of two facts are true. A fact can be true at one moment, false at the next, and true again later, exactly as the table says, even where its words ("has run", "has disposed") sound like they could not change back.

For each timeline, say whether the sentence is true of it, now (the moment the sentence's heading names). Read the sentence exactly as written: it says no more and no less than its words.

Write your answers to \`answers-K.json\` in this folder, where K is your batch number, as a JSON array: [{"q": "U1-never", "holds": true, "why": "a few words"}], one entry per timeline (36 in all). Then add one entry per sentence: {"q": "U1-hard", "hard": 1-5}, where 1 is easy to read and 5 is very hard. Read only \`brief.md\` and your own batch file. Do not read any other file.
`);
console.log(truth.length, 'questions;', truth.filter(t => t.truth).length, 'true');
