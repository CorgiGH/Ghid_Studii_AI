import dotenv from 'dotenv';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from 'fs';
import { resolve, basename, dirname } from 'path';
import { sendPdfWithPrompt, sendTextPrompt, loadPromptTemplate } from './gemini.mjs';

dotenv.config({ path: resolve('proxy/.env') });

// ── JSON Repair ──
// Gemini sometimes returns malformed JSON: bare compound numbers (3.1.1) or truncated output

function repairJSON(str) {
  let repaired = str;
  let warnings = [];

  // Fix bare compound numbers like 3.1.1
  const numFixed = repaired.replace(/:\s*(\d+(?:\.\d+){2,})\b/g, ': "$1"');
  if (numFixed !== repaired) {
    repaired = numFixed;
    warnings.push('bare compound numbers');
  }

  // Try parsing as-is first
  try { JSON.parse(repaired); return { json: repaired, warnings }; } catch {}

  // Fix truncated JSON: close open strings, arrays, objects
  let fixed = repaired;
  // If inside an unterminated string, close it
  const lastQuote = fixed.lastIndexOf('"');
  const afterQuote = fixed.slice(lastQuote + 1);
  if (lastQuote > 0 && !afterQuote.includes('"') && (afterQuote.match(/\n/g) || []).length < 3) {
    fixed = fixed.slice(0, lastQuote + 1);
    // Trim trailing incomplete key-value
    fixed = fixed.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"]*$/, '');
    if (!fixed.endsWith('"')) fixed += '"';
  }
  // Count unmatched brackets and close them
  let braces = 0, brackets = 0;
  let inStr = false;
  for (let i = 0; i < fixed.length; i++) {
    const ch = fixed[i];
    if (ch === '"' && (i === 0 || fixed[i-1] !== '\\')) { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '[') brackets++;
    else if (ch === ']') brackets--;
  }
  // Remove trailing comma before closing
  fixed = fixed.replace(/,\s*$/, '');
  fixed += ']'.repeat(Math.max(0, brackets)) + '}'.repeat(Math.max(0, braces));

  try {
    JSON.parse(fixed);
    warnings.push('truncated output');
    return { json: fixed, warnings };
  } catch {
    return { json: null, warnings };
  }
}

// ── CLI Argument Parsing ──

const args = process.argv.slice(2);

if (args[0] === 'status') {
  showStatus();
  process.exit(0);
}

let pdfPath = args.find(a => !a.startsWith('--'));
if (!pdfPath) {
  console.error('Usage: node curate.mjs <pdf-path> [--subject <slug>] [--type <course|lab|seminar|test>] [--desc <course-description.pdf>] [--redo]');
  process.exit(1);
}
// Resolve short paths like "pa/info/lecture1.pdf" against src/content/
if (!existsSync(pdfPath)) {
  const candidate = resolve('src/content', pdfPath.replace(/\\/g, '/'));
  if (existsSync(candidate)) pdfPath = candidate;
}

const flags = {
  subject: getFlagValue('--subject'),
  type: getFlagValue('--type'),
  desc: getFlagValue('--desc'),
  redo: args.includes('--redo'),
};

// ── Auto-Detection ──

function detectSubject(filePath) {
  if (flags.subject) return flags.subject;
  const normalized = filePath.replace(/\\/g, '/');
  const match = normalized.match(/src\/content\/([^/]+)\//);
  if (match) return match[1];
  // Try resolving short paths like "pa/info/lecture1.pdf" against src/content/
  const candidate = resolve('src/content', normalized);
  if (existsSync(candidate)) {
    const m2 = candidate.replace(/\\/g, '/').match(/src\/content\/([^/]+)\//);
    if (m2) return m2[1];
  }
  console.error('Cannot detect subject from path. Use --subject <slug>');
  process.exit(1);
}

function detectType(filePath) {
  if (flags.type) return flags.type;
  const normalized = filePath.replace(/\\/g, '/');
  if (/\/courses?\//i.test(normalized) || /\/info\//i.test(normalized) || /course|lecture/i.test(basename(filePath))) return 'course';
  if (/\/labs?\//i.test(normalized) || /lab/i.test(basename(filePath))) return 'lab';
  if (/\/seminars?\//i.test(normalized) || /seminar/i.test(basename(filePath))) return 'seminar';
  if (/\/tests?\//i.test(normalized) || /test/i.test(basename(filePath))) return 'test';
  console.error('Cannot detect content type from path. Use --type <course|lab|seminar|test>');
  process.exit(1);
}

const subject = detectSubject(pdfPath);
const contentType = detectType(pdfPath);
const pdfName = basename(pdfPath, '.pdf').replace(/_raw$/, '').replace(/\.html$/, '');

// ── Checkpoint/Resume ──

const curateDir = resolve(`src/content/${subject}/.curate/${pdfName}`);
const statusPath = resolve(curateDir, 'status.json');

function ensureCurateDir() {
  mkdirSync(curateDir, { recursive: true });
}

function readStatus() {
  if (!existsSync(statusPath)) return { lastCompleted: 0, type: contentType, subject };
  return JSON.parse(readFileSync(statusPath, 'utf-8'));
}

function writeStatus(stage) {
  ensureCurateDir();
  writeFileSync(statusPath, JSON.stringify({ lastCompleted: stage, type: contentType, subject }, null, 2));
}

function stageOutputExists(filename) {
  return existsSync(resolve(curateDir, filename));
}

// ── Status Command ──

function showStatus() {
  const contentDir = resolve('src/content');
  const subjects = readdirSync(contentDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let found = false;
  for (const subj of subjects) {
    const curatePath = resolve(contentDir, subj, '.curate');
    if (!existsSync(curatePath)) continue;
    const pipelines = readdirSync(curatePath, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const p of pipelines) {
      const sPath = resolve(curatePath, p.name, 'status.json');
      if (existsSync(sPath)) {
        const s = JSON.parse(readFileSync(sPath, 'utf-8'));
        console.log(`  ${subj}/${p.name}: stage ${s.lastCompleted}/5 (${s.type})`);
        found = true;
      }
    }
  }
  if (!found) console.log('  No active pipelines.');
}

// ── Helpers ──

function getFlagValue(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

// ── Main Pipeline ──

async function main() {
  const status = readStatus();
  console.log(`\n📄 Curating: ${pdfPath}`);
  console.log(`   Subject: ${subject} | Type: ${contentType} | Redo: ${flags.redo}`);
  console.log(`   Output: ${curateDir}`);
  console.log(`   Resuming from stage: ${status.lastCompleted}\n`);

  ensureCurateDir();

  // ── Bibliography Setup (runs once per subject) ──
  await ensureBibliography();

  if (status.lastCompleted < 1) {
    console.log('── Stage 1: PDF Extraction (Gemini) ──');
    await runStage1(pdfPath);
    writeStatus(1);
    console.log('✅ Stage 1 complete\n');
  } else {
    console.log('⏭️  Stage 1: skipped (cached)\n');
  }

  if (status.lastCompleted < 2) {
    console.log('── Stage 2: Bibliography Cross-Reference (Gemini) ──');
    await runStage2();
    writeStatus(2);
    console.log('✅ Stage 2 complete\n');
  } else {
    console.log('⏭️  Stage 2: skipped (cached)\n');
  }

  if (flags.redo && status.lastCompleted < 2.5) {
    console.log('── Stage 2.5: Diff Against Existing (Gemini) ──');
    await runStage2_5();
    writeStatus(2.5);
    console.log('✅ Stage 2.5 complete\n');
  }

  // Stages 3-5 are handled by Claude Code skill (Haiku/Opus agents)
  // Script outputs JSON for those stages to consume
  console.log('── Gemini stages complete ──');
  console.log('Run /curate in Claude Code to continue with stages 3-5.\n');
}

// ── Bibliography Setup ──

async function ensureBibliography() {
  const refsDir = resolve(`src/content/${subject}/refs`);
  const sourcesPath = resolve(refsDir, 'sources.json');

  // Already set up — nothing to do
  if (existsSync(sourcesPath)) {
    const sources = JSON.parse(readFileSync(sourcesPath, 'utf-8'));
    const available = sources.sources.filter(s => s.available).length;
    console.log(`📚 Bibliography: ${available}/${sources.sources.length} sources available (refs/sources.json exists)\n`);
    return;
  }

  // Need course description PDF to set up bibliography
  if (!flags.desc) {
    console.log('📚 No bibliography found. To set up, re-run with:');
    console.log(`   node curate.mjs <pdf> --desc <course-description.pdf> ...\n`);
    console.log('   Continuing without bibliography (content will be UNVERIFIED).\n');
    return;
  }

  const descPdf = resolve(flags.desc);
  if (!existsSync(descPdf)) {
    console.error(`❌ Course description PDF not found: ${descPdf}`);
    process.exit(1);
  }

  console.log('── Bibliography Setup (first run) ──');
  mkdirSync(refsDir, { recursive: true });

  // Copy the course description PDF into refs/
  const descFilename = basename(descPdf);
  const descDest = resolve(refsDir, descFilename);
  if (!existsSync(descDest)) {
    copyFileSync(descPdf, descDest);
    console.log(`  Copied course description → refs/${descFilename}`);
  }

  // Extract bibliography references from the PDF
  console.log('  Extracting bibliography references...');
  const extractPrompt = `Extract ALL bibliography/references from this course description PDF.
Output valid JSON only:
{
  "courseDescription": "${descFilename}",
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

  const rawResponse = await sendPdfWithPrompt(descPdf, extractPrompt);
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

  // Search for each source online
  console.log('\n  Searching for sources online...');
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
      console.log(`    ❌ Not found`);
      src.file = null;
      src.format = 'not_found';
      src.available = false;
      src.searchedAt = new Date().toISOString();
    } else {
      const content = searchResult.substring(searchResult.indexOf('\n') + 1).trim();
      const tokenEstimate = Math.ceil(content.length / 4);
      const isPartial = firstLine.startsWith('SUMMARY') || firstLine.startsWith('PARTIAL') || tokenEstimate > 30000;
      const format = firstLine.startsWith('PARTIAL') ? 'partial' : isPartial ? 'summary' : 'full';

      const filename = `${src.id}${format !== 'full' ? '.' + format : ''}.md`;
      writeFileSync(resolve(refsDir, filename), content);

      src.file = filename;
      src.format = format;
      src.available = true;
      src.searchedAt = new Date().toISOString();
      console.log(`    ✅ Saved as ${filename} (~${tokenEstimate} tokens, ${format})`);
    }
  }

  // Save sources.json
  writeFileSync(sourcesPath, JSON.stringify(bibliography, null, 2));
  const available = bibliography.sources.filter(s => s.available).length;
  console.log(`\n✅ Bibliography setup complete: ${available}/${bibliography.sources.length} sources available\n`);
}

// ── Pipeline Stages ──

async function runStage1(pdfPath) {
  const promptFile = `extract-${contentType}.md`;
  const prompt = loadPromptTemplate(promptFile);

  console.log(`  Sending PDF to Gemini (${promptFile})...`);
  const rawResponse = await sendPdfWithPrompt(pdfPath, prompt);

  // Parse JSON from response (strip markdown code fence if present)
  let jsonStr = rawResponse.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  }

  let extraction;
  try {
    extraction = JSON.parse(jsonStr);
  } catch (e) {
    const { json: repaired, warnings } = repairJSON(jsonStr);
    if (repaired) {
      extraction = JSON.parse(repaired);
      console.log(`  ⚠ Repaired malformed JSON (${warnings.join(', ')})`);
    } else {
      writeFileSync(resolve(curateDir, 'stage1-raw-response.txt'), rawResponse);
      throw new Error(`Gemini returned invalid JSON. Raw response saved to stage1-raw-response.txt. Error: ${e.message}`);
    }
  }

  // Save extraction
  writeFileSync(resolve(curateDir, 'stage1-extraction.json'), JSON.stringify(extraction, null, 2));

  // Log stats
  const sectionCount = extraction.sections?.length || extraction.exercises?.length || extraction.problems?.length || 0;
  const diagramCount = extraction.diagrams?.length || 0;
  console.log(`  Extracted: ${sectionCount} sections, ${diagramCount} diagrams`);
}

async function runStage2() {
  const refsDir = resolve(`src/content/${subject}/refs`);
  const sourcesPath = resolve(refsDir, 'sources.json');

  // Load extraction from stage 1
  const extraction = JSON.parse(readFileSync(resolve(curateDir, 'stage1-extraction.json'), 'utf-8'));

  // Check if bibliography exists
  if (!existsSync(sourcesPath)) {
    console.log('  No bibliography found (refs/sources.json missing). Skipping cross-reference.');
    console.log('  All content will be flagged as ⚠️ UNVERIFIED.');
    const emptyResult = {
      annotations: [],
      summary: { totalChecked: 0, verified: 0, deviations: 0, unverified: 0, missing: 0 },
      noBibliography: true,
    };
    writeFileSync(resolve(curateDir, 'stage2-crossref.json'), JSON.stringify(emptyResult, null, 2));
    return;
  }

  const sourcesIndex = JSON.parse(readFileSync(sourcesPath, 'utf-8'));
  const prompt = loadPromptTemplate('crossref.md');

  // Load available source texts
  let sourcesContext = '';
  for (const src of sourcesIndex.sources) {
    if (!src.available || !src.file) continue;
    const srcPath = resolve(refsDir, src.file);
    if (existsSync(srcPath)) {
      const content = readFileSync(srcPath, 'utf-8');
      sourcesContext += `\n\n--- SOURCE: ${src.title} (${src.author}) ---\n${content}`;
    }
  }

  if (!sourcesContext) {
    console.log('  Bibliography exists but no source files are available. Skipping.');
    const emptyResult = {
      annotations: [],
      summary: { totalChecked: 0, verified: 0, deviations: 0, unverified: 0, missing: 0 },
      noSourceFiles: true,
    };
    writeFileSync(resolve(curateDir, 'stage2-crossref.json'), JSON.stringify(emptyResult, null, 2));
    return;
  }

  const fullPrompt = `${prompt}\n\n--- EXTRACTED CONTENT ---\n${JSON.stringify(extraction, null, 2)}\n\n--- BIBLIOGRAPHY SOURCES ---\n${sourcesContext}`;

  console.log(`  Cross-referencing against ${sourcesIndex.sources.filter(s => s.available).length} source(s)...`);
  const rawResponse = await sendTextPrompt(fullPrompt);

  let jsonStr = rawResponse.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  }

  let crossref;
  try {
    crossref = JSON.parse(jsonStr);
  } catch (e) {
    const { json: repaired, warnings } = repairJSON(jsonStr);
    if (repaired) {
      crossref = JSON.parse(repaired);
      console.log(`  ⚠ Repaired malformed JSON (${warnings.join(', ')})`);
    } else {
      writeFileSync(resolve(curateDir, 'stage2-raw-response.txt'), rawResponse);
      throw new Error(`Cross-reference returned invalid JSON. Saved to stage2-raw-response.txt. Error: ${e.message}`);
    }
  }

  writeFileSync(resolve(curateDir, 'stage2-crossref.json'), JSON.stringify(crossref, null, 2));
  console.log(`  Results: ${crossref.summary.verified} verified, ${crossref.summary.deviations} deviations, ${crossref.summary.unverified} unverified`);
}

async function runStage2_5() {
  const extraction = JSON.parse(readFileSync(resolve(curateDir, 'stage1-extraction.json'), 'utf-8'));

  // Find existing JSX file for this course
  const contentDir = resolve(`src/content/${subject}`);
  const typeDir = contentType === 'course' ? 'courses' : contentType === 'lab' ? 'labs' : contentType === 'seminar' ? 'seminars' : 'test';
  const existingFiles = readdirSync(resolve(contentDir, typeDir)).filter(f => f.endsWith('.jsx'));

  if (existingFiles.length === 0) {
    console.log('  No existing files found. Treating as new content.');
    writeFileSync(resolve(curateDir, 'stage2.5-diff.json'), JSON.stringify({ isNew: true, decisions: [] }, null, 2));
    return;
  }

  // Read existing JSX content
  console.log(`  Found existing files: ${existingFiles.join(', ')}`);

  // Simple heuristic: match by number in filename
  const numberMatch = pdfName.match(/(\d+)/);
  const targetFile = numberMatch
    ? existingFiles.find(f => f.includes(numberMatch[1].padStart(2, '0')))
    : existingFiles[0];

  if (!targetFile) {
    console.log('  Could not match to an existing file. Treating as new content.');
    writeFileSync(resolve(curateDir, 'stage2.5-diff.json'), JSON.stringify({ isNew: true, decisions: [] }, null, 2));
    return;
  }

  const existingContent = readFileSync(resolve(contentDir, typeDir, targetFile), 'utf-8');

  const prompt = `You are comparing extracted PDF content against an existing JSX course file to decide what needs updating.

EXTRACTED CONTENT (from PDF):
${JSON.stringify(extraction, null, 2)}

EXISTING JSX FILE (${targetFile}):
${existingContent}

For each section in the extracted content, decide:
- "keep" — the existing JSX covers this section accurately
- "rewrite" — the existing JSX is missing content, has errors, or is incomplete
- "new" — this section doesn't exist in the current JSX at all

Output valid JSON only:
{
  "existingFile": "${targetFile}",
  "decisions": [
    {
      "sectionIndex": 0,
      "sectionTitle": "Section title",
      "decision": "keep|rewrite|new",
      "reason": "Brief explanation"
    }
  ],
  "summary": { "keep": 5, "rewrite": 2, "new": 1 }
}`;

  console.log(`  Comparing against ${targetFile}...`);
  const rawResponse = await sendTextPrompt(prompt);

  let jsonStr = rawResponse.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  }

  let diff;
  try {
    diff = JSON.parse(jsonStr);
  } catch (e) {
    const { json: repaired, warnings } = repairJSON(jsonStr);
    if (repaired) {
      diff = JSON.parse(repaired);
      console.log(`  ⚠ Repaired malformed JSON (${warnings.join(', ')})`);
    } else {
      writeFileSync(resolve(curateDir, 'stage2.5-raw-response.txt'), rawResponse);
      throw new Error(`Diff returned invalid JSON. Saved to stage2.5-raw-response.txt. Error: ${e.message}`);
    }
  }

  writeFileSync(resolve(curateDir, 'stage2.5-diff.json'), JSON.stringify(diff, null, 2));
  console.log(`  Decisions: ${diff.summary.keep} keep, ${diff.summary.rewrite} rewrite, ${diff.summary.new} new`);
}

main().catch(err => {
  console.error('❌ Pipeline error:', err.message);
  process.exit(1);
});
