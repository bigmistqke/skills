#!/usr/bin/env node
/**
 * `canon lint` — language checks on the prose of the canon documents.
 * Reports passive voice, wordy phrasing, repeated
 * words, wrong indefinite articles, and sentences and paragraphs longer than
 * the limits below.
 *
 * A plugin of the checker: a document names it in its frontmatter, as
 * `plugins: ["@bigmistqke/canon-plugin-retext"]`, and `canon lint` runs over the
 * documents that name it, or over the files named on the command line.
 */
import { readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import type { Root as MdastRoot } from 'mdast'
import type { Paragraph, Root as NlcstRoot, Sentence } from 'nlcst'
import remarkParse from 'remark-parse'
import remarkRetext from 'remark-retext'
import retextEnglish from 'retext-english'
import retextIndefiniteArticle from 'retext-indefinite-article'
import retextPassive from 'retext-passive'
import retextRepeatedWords from 'retext-repeated-words'
import retextSimplify from 'retext-simplify'
import { type Processor, unified } from 'unified'
import { visit } from 'unist-util-visit'
import { VFile } from 'vfile'
import { reporter } from 'vfile-reporter'
import type { Plugin } from '@bigmistqke/canon/plugin'

/**
 * The longest sentence allowed, in words. ASD-STE100, Simplified Technical
 * English, allows 25 words in a descriptive sentence.
 */
const MAX_WORDS = 25

/** The most sentences allowed in one paragraph. */
const MAX_SENTENCES = 5

/**
 * Words `retext-simplify` would replace that name parts of the system, of
 * JavaScript or of the canon method, so a plainer word would change the
 * meaning. A request is what sets the scope of a change.
 */
const VOCABULARY = ['component', 'effect', 'function', 'interface', 'option', 'render', 'request', 'type']

/**
 * Blank out what is not prose written by hand, keeping every offset so the
 * positions reported still point into the file: HTML comments, the regions
 * `canon generate` writes, and table rows.
 */
function blankGenerated(src: string): string {
  const blank = (m: string): string => m.replace(/[^\n]/g, ' ')
  return src
    .replace(/<!--[ \t]*([\w-]+):begin\b[\s\S]*?<!-- \1:end -->/g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    // A table's cells are not sentences. Without the GFM extension the parser
    // reads a table as one long paragraph, so its rows are blanked instead.
    .replace(/^\|.*$/gm, blank)
}

/** Drop headings: a unit heading is an identifier, not a sentence. */
function remarkDropHeadings() {
  return (tree: MdastRoot) => {
    tree.children = tree.children.filter((node) => node.type !== 'heading')
  }
}

/** Report sentences and paragraphs longer than the limits. */
function retextLength() {
  return (tree: NlcstRoot, file: VFile) => {
    visit(tree, 'SentenceNode', (sentence: Sentence) => {
      const words = sentence.children.filter((node) => node.type === 'WordNode').length
      if (words > MAX_WORDS) {
        const message = file.message(
          `Sentence has ${words} words, more than ${MAX_WORDS}`,
          { place: sentence.position, ruleId: 'sentence-length', source: 'canon-plugin-retext' },
        )
        message.fatal = false
      }
    })
    visit(tree, 'ParagraphNode', (paragraph: Paragraph) => {
      const sentences = paragraph.children.filter((node) => node.type === 'SentenceNode').length
      if (sentences > MAX_SENTENCES) {
        file.message(`Paragraph has ${sentences} sentences, more than ${MAX_SENTENCES}`, {
          place: paragraph.position,
          ruleId: 'paragraph-length',
          source: 'canon-plugin-retext',
        })
      }
    })
  }
}

const processor = unified()
  .use(remarkParse)
  .use(remarkDropHeadings)
  .use(
    remarkRetext,
    unified()
      .use(retextEnglish)
      .use(retextPassive)
      .use(retextSimplify, { ignore: [...VOCABULARY, 'it is'] })
      .use(retextRepeatedWords)
      .use(retextIndefiniteArticle)
      .use(retextLength) as unknown as Processor<NlcstRoot>,
  )

/** Lint the documents at `targets`, reported relative to `root`. Prints the findings and returns how many there were. */
async function lintFiles(targets: string[], root: string): Promise<number> {
  const files: VFile[] = []
  for (const path of targets) {
    const file = new VFile({ path: relative(root, path), value: blankGenerated(readFileSync(path, 'utf8')) })
    await processor.run(processor.parse(file), file)
    files.push(file)
  }

  console.log(reporter(files, { quiet: true }))
  return files.reduce((n, f) => n + f.messages.length, 0)
}

export const plugin: Plugin = {
  name: 'lint',
  commands: {
    // Files named on the command line are linted whatever their frontmatter says; with none, the documents that apply it.
    lint: async ({ args, root, documents }) => {
      const targets = args.length > 0 ? args.map((f) => resolve(f)) : documents.map((d) => join(root, d))
      return (await lintFiles(targets, args.length > 0 ? process.cwd() : root)) === 0 ? 0 : 1
    },
  },
}
