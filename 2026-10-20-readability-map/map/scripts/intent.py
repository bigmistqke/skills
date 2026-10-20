# Stage 4: each unit's intent (its name as a sentence, what it refines, its rationale) beside its formula, in batches for the auditors.
# Run from the study folder with the repository at REPO (default: the checkout this branch sits in).
import json, os, re, sys
here = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
repo = os.environ.get('REPO', os.path.join(here, '..', '..'))
paths = {'canon': 'packages/canon/CANON.md', 'canon-plugin-alloy': 'packages/canon-plugin-alloy/CANON.md', 'naturalloy': 'packages/naturalloy/CANON.md', 'canon-plugin-alloy-fixtures-lifetimes': 'packages/canon-plugin-alloy/fixtures/lifetimes/CANON.md'}
src = {d: open(os.path.join(repo, p)).read() for d, p in paths.items()}
corpus = json.load(open(os.path.join(here, 'corpus.json')))
parents = {}
for d, s in src.items():
    toc = s[s.find('<!-- toc:begin'):s.find('<!-- toc:end')]
    stack = []
    for l in toc.split('\n'):
        m = re.match(r'^( *)- \[`@(\w+) ([^`]+)`\]', l)
        if not m: continue
        depth = len(m.group(1)) // 2
        stack = stack[:depth]
        parents[(d, m.group(2) + '-' + m.group(3))] = list(stack)
        stack.append(m.group(2) + '-' + m.group(3))
out = []
for x in corpus:
    if x['unit'].startswith('scenario-') or x['doc'] not in src: continue
    s = src[x['doc']]
    kind, slug = x['unit'].split('-', 1)
    m = re.search(r'^#+ @' + kind + r' ' + re.escape(slug) + r'\s*$', s, re.M)
    if not m: continue
    rest = s[m.end():]
    nxt = re.search(r'^#+ @', rest, re.M)
    body = rest[:nxt.start()] if nxt else rest
    body = re.sub(r'<!-- statement-[^>]*:begin[\s\S]*?:end -->', '', body)
    body = re.sub(r'```[\s\S]*?```', '', body)
    prose = ' '.join(l.strip() for l in body.split('\n') if l.strip() and not l.startswith('>') and not l.startswith('<!--'))
    out.append({'id': x['id'], 'doc': x['doc'], 'unit': x['unit'], 'claim': slug.replace('-', ' '), 'rationale': prose[:1200], 'formula': x['formula'],
                'parents': [u.split('-', 1)[1].replace('-', ' ') for u in parents.get((x['doc'], x['unit']), [])]})
json.dump(out, open(os.path.join(here, 'intent.json'), 'w'), indent=1)
by = {x['id']: x for x in corpus}
n = 0
for d in dict.fromkeys(x['doc'] for x in out):
    xs = [x for x in out if x['doc'] == d]
    for k in range(0, len(xs), 36):
        parts = []
        for x in xs[k:k + 36]:
            ref = ('\nRefines: ' + ' → '.join('"' + p + '"' for p in x['parents']) + '\n') if x['parents'] else ''
            rat = ('\nRationale: ' + x['rationale'] + '\n') if x['rationale'] else ''
            parts.append(f"## {x['id']}  ({x['unit']})\n\nClaim (the unit's name, as a sentence): **{x['claim']}**\n{ref}{rat}\nFormula:\n```alloy\n{x['formula'].strip()}\n```\n\nWhat the formula says, exactly:\n```text\n{by[x['id']]['statement']}\n```\n")
        open(os.path.join(here, 'intent', f'batch-{n}.md'), 'w').write(f'Vocabulary file: {d}.vocab.md\n\n' + '\n'.join(parts))
        n += 1
