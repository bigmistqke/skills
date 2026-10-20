Vocabulary file: canon.vocab.md

## s108  (spec-a-frontmatter-changes-no-finding)

Claim (the unit's name, as a sentence): **a frontmatter changes no finding**

Refines: "the check can be taken at its word" → "a check the project asked for is never dropped silently" → "a frontmatter changes nothing but the plugins of its document"

Rationale: This follows because the checks read the document and not its block.

Formula:
```alloy
all d, e: Document | d->e in Bare.rel implies ((e in Finding implies d in Finding) and (d in Finding implies e in Finding))
```

What the formula says, exactly:
```text
For every document_1 and every document_2:

when document_1 is document_2 without its frontmatter,

then all of these hold:
- when checker reports a finding for document_2, checker reports a finding for document_1
- when checker reports a finding for document_1, checker reports a finding for document_2
```
