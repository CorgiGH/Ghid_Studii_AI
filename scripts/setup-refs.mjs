import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve('proxy/.env') });

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { sendPdfWithPrompt, sendTextPrompt } from './gemini.mjs';

const args = process.argv.slice(2);
const subject = args[0];
const descriptionPdf = args[1];

if (!subject || !descriptionPdf) {
  console.error('Usage: node setup-refs.mjs <subject-slug> <course-description.pdf>');
  process.exit(1);
}

const refsDir = resolve(`src/content/${subject}/refs`);
const sourcesPath = resolve(refsDir, 'sources.json');

async function main() {
  mkdirSync(refsDir, { recursive: true });

  // Step 1: Extract bibliography from course description PDF
  console.log('── Extracting bibliography references ──');
  const extractPrompt = `Extract ALL bibliography/references from this course description PDF.
Output valid JSON only:
{
  "courseDescription": "${descriptionPdf}",
  "sources": [
    {
      "id": "short-kebab-id",
      "title": "Full title of the source",
      "author": "Author name(s)",
      "type": "textbook|paper|online|slides|other",
      "isbn": "ISBN if mentioned, null otherwise",
      "url": "URL if mentioned, null otherwise"
    }
  ]
}
List every reference mentioned, even if informal.`;

  const rawResponse = await sendPdfWithPrompt(descriptionPdf, extractPrompt);
  let jsonStr = rawResponse.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  }

  let bibliography;
  try {
    bibliography = JSON.parse(jsonStr);
  } catch (e) {
    writeFileSync(resolve(refsDir, 'extract-raw.txt'), rawResponse);
    throw new Error(`Invalid JSON from bibliography extraction. Raw saved to refs/extract-raw.txt`);
  }

  console.log(`  Found ${bibliography.sources.length} reference(s):`);
  for (const src of bibliography.sources) {
    console.log(`    - ${src.title} (${src.author})`);
  }

  // Step 2: For each source, search online and determine availability
  console.log('\n── Searching for sources online ──');
  for (const src of bibliography.sources) {
    console.log(`\n  Searching: ${src.title} by ${src.author}...`);

    const searchPrompt = `I need to find the full text or a detailed summary of this academic source:
Title: ${src.title}
Author: ${src.author}
Type: ${src.type}
${src.isbn ? `ISBN: ${src.isbn}` : ''}
${src.url ? `URL: ${src.url}` : ''}

Search for this source. If you can access the full content, provide it as detailed markdown.
If you can only find a summary, table of contents, or partial content, provide what you can.
If you cannot find it at all, say "NOT_FOUND".

Start your response with one of:
FULL_TEXT:
SUMMARY:
PARTIAL:
NOT_FOUND:

Then provide the content.`;

    const searchResult = await sendTextPrompt(searchPrompt);
    const firstLine = searchResult.split('\n')[0].trim();

    if (firstLine.startsWith('NOT_FOUND')) {
      console.log(`    ❌ Not found online`);
      src.file = null;
      src.format = null;
      src.available = false;
    } else {
      const content = searchResult.substring(searchResult.indexOf('\n') + 1).trim();
      const tokenEstimate = Math.ceil(content.length / 4);
      const isSummary = firstLine.startsWith('SUMMARY') || firstLine.startsWith('PARTIAL') || tokenEstimate > 30000;

      const filename = `${src.id}${isSummary ? '.summary' : ''}.md`;
      writeFileSync(resolve(refsDir, filename), content);

      src.file = filename;
      src.format = isSummary ? 'summary' : 'full';
      src.available = true;
      console.log(`    ✅ Saved as ${filename} (~${tokenEstimate} tokens, ${src.format})`);
    }
  }

  // Save sources.json
  writeFileSync(sourcesPath, JSON.stringify(bibliography, null, 2));
  console.log(`\n✅ Bibliography setup complete: ${sourcesPath}`);
  console.log(`   ${bibliography.sources.filter(s => s.available).length}/${bibliography.sources.length} sources available`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
