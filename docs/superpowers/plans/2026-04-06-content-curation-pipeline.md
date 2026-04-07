# Content Curation Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an on-demand content curation pipeline that takes professor PDFs + bibliography, uses Gemini for extraction and Claude for quality generation, and outputs draft JSX course files with review flags.

**Architecture:** A Node script (`scripts/curate.mjs`) handles Gemini API calls for PDF extraction and cross-referencing (stages 1-2). A Claude Code skill (`/curate`) orchestrates the full pipeline — calling the script for Gemini stages, then running Haiku/Opus agents for diagram triage, draft generation, and self-review (stages 3-5). Checkpoint/resume via `.curate/` folders with `status.json`.

**Tech Stack:** Node.js (ESM), `@google/generative-ai` SDK, Claude Code skills, Haiku/Opus subagents.

---

### Task 1: Project Setup — scripts directory, dependencies, gitignore

**Files:**
- Create: `scripts/package.json`
- Create: `scripts/curate.mjs` (skeleton only)
- Modify: `.gitignore`

- [ ] **Step 1: Create scripts/package.json**

```bash
ls "C:/Users/User/Desktop/SO/os-study-guide/"
```

Verify `scripts/` does not exist yet, then create:

```json
{
  "name": "study-guide-scripts",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "curate": "node curate.mjs"
  },
  "dependencies": {
    "@google/generative-ai": "^0.24.0",
    "dotenv": "^17.4.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide/scripts" && npm install
```

Expected: `node_modules/` created, `package-lock.json` generated.

- [ ] **Step 3: Create curate.mjs skeleton**

Create `scripts/curate.mjs` with the CLI argument parser and checkpoint/resume core. This is the orchestrator shell — stages are added in later tasks.

```js
import 'dotenv/config';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, basename, dirname } from 'path';

// ── CLI Argument Parsing ──

const args = process.argv.slice(2);

if (args[0] === 'status') {
  showStatus();
  process.exit(0);
}

const pdfPath = args.find(a => !a.startsWith('--'));
if (!pdfPath) {
  console.error('Usage: node curate.mjs <pdf-path> [--subject <slug>] [--type <course|lab|seminar|test>] [--redo]');
  process.exit(1);
}

const flags = {
  subject: getFlagValue('--subject'),
  type: getFlagValue('--type'),
  redo: args.includes('--redo'),
};

// ── Auto-Detection ──

function detectSubject(filePath) {
  if (flags.subject) return flags.subject;
  const match = filePath.match(/src\/content\/([^/]+)\//);
  if (match) return match[1];
  console.error('Cannot detect subject from path. Use --subject <slug>');
  process.exit(1);
}

function detectType(filePath) {
  if (flags.type) return flags.type;
  if (/\/courses?\//i.test(filePath) || /course/i.test(basename(filePath))) return 'course';
  if (/\/labs?\//i.test(filePath) || /lab/i.test(basename(filePath))) return 'lab';
  if (/\/seminars?\//i.test(filePath) || /seminar/i.test(basename(filePath))) return 'seminar';
  if (/\/tests?\//i.test(filePath) || /test/i.test(basename(filePath))) return 'test';
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
  const { readdirSync } = await import('fs');
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

// ── Stage Stubs (implemented in later tasks) ──

async function runStage1(pdfPath) {
  throw new Error('Stage 1 not yet implemented');
}

async function runStage2() {
  throw new Error('Stage 2 not yet implemented');
}

async function runStage2_5() {
  throw new Error('Stage 2.5 not yet implemented');
}

main().catch(err => {
  console.error('❌ Pipeline error:', err.message);
  process.exit(1);
});
```

- [ ] **Step 4: Add .curate/ to .gitignore**

Append to `.gitignore`:

```
# Content curation pipeline intermediate files
**/.curate/
```

- [ ] **Step 5: Commit**

```bash
git add scripts/package.json scripts/package-lock.json scripts/curate.mjs .gitignore
git commit -m "feat: scaffold content curation pipeline — CLI skeleton with checkpoint/resume"
```

---

### Task 2: Gemini API Client Module

**Files:**
- Create: `scripts/gemini.mjs`

- [ ] **Step 1: Create the Gemini client wrapper**

This module handles Gemini API initialization and provides helper functions for the pipeline stages.

```js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const GEMINI_MODEL = 'gemini-2.5-flash';

let genAI = null;

function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not set. Add it to proxy/.env');
      process.exit(1);
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export function getModel() {
  return getClient().getGenerativeModel({ model: GEMINI_MODEL });
}

export async function sendPdfWithPrompt(pdfPath, promptText) {
  const model = getModel();
  const pdfBuffer = readFileSync(resolve(pdfPath));
  const pdfBase64 = pdfBuffer.toString('base64');

  const result = await model.generateContent([
    { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
    { text: promptText },
  ]);

  return result.response.text();
}

export async function sendTextPrompt(promptText) {
  const model = getModel();
  const result = await model.generateContent(promptText);
  return result.response.text();
}

export function loadPromptTemplate(templateName) {
  const templatePath = resolve('scripts/prompts', templateName);
  return readFileSync(templatePath, 'utf-8');
}
```

- [ ] **Step 2: Add GEMINI_API_KEY to proxy/.env**

Append to `proxy/.env` (the user will fill in the actual key):

```
# Gemini API key for content curation pipeline
GEMINI_API_KEY=your-key-here
```

- [ ] **Step 3: Update dotenv path in curate.mjs**

Replace the `dotenv/config` import at the top of `scripts/curate.mjs` to load from the proxy `.env`:

```js
import dotenv from 'dotenv';
dotenv.config({ path: resolve('proxy/.env') });
```

Remove the existing `import 'dotenv/config';` line.

- [ ] **Step 4: Verify Gemini client loads**

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide/scripts" && node -e "import('./gemini.mjs').then(m => { m.getModel(); console.log('✅ Gemini client OK'); }).catch(e => console.error('❌', e.message))"
```

Expected: Either "✅ Gemini client OK" (if key is set) or "❌ GEMINI_API_KEY not set" (if placeholder). Both confirm the module loads.

- [ ] **Step 5: Commit**

```bash
git add scripts/gemini.mjs
git commit -m "feat: add Gemini API client wrapper for curation pipeline"
```

---

### Task 3: Prompt Templates

**Files:**
- Create: `scripts/prompts/extract-course.md`
- Create: `scripts/prompts/extract-lab.md`
- Create: `scripts/prompts/extract-seminar.md`
- Create: `scripts/prompts/extract-test.md`
- Create: `scripts/prompts/crossref.md`

- [ ] **Step 1: Create stage 1 prompt — course extraction**

Create `scripts/prompts/extract-course.md`:

````markdown
You are extracting structured content from a university course PDF. Output valid JSON only.

Extract the following structure:

```json
{
  "metadata": {
    "title": "Course title as written in the PDF",
    "courseNumber": null,
    "professor": "Professor name if mentioned",
    "source": "Full source attribution string"
  },
  "sections": [
    {
      "number": 1,
      "title": "Section title",
      "content": [
        {
          "type": "paragraph",
          "text": "Full paragraph text preserving all technical terms, formulas, and notation exactly as written"
        },
        {
          "type": "definition",
          "term": "Term being defined",
          "text": "Definition text"
        },
        {
          "type": "code",
          "language": "c",
          "code": "Exact code as in PDF, preserving formatting"
        },
        {
          "type": "formula",
          "text": "Mathematical formula using Unicode notation"
        },
        {
          "type": "table",
          "headers": ["Col1", "Col2"],
          "rows": [["val1", "val2"]]
        },
        {
          "type": "list",
          "ordered": false,
          "items": ["item1", "item2"]
        },
        {
          "type": "diagram",
          "description": "Detailed description of the visual diagram",
          "diagramType": "tree|flowchart|table|graph|other",
          "canBeReproducedAsSVG": true
        },
        {
          "type": "warning",
          "text": "Important note, caveat, or common mistake"
        }
      ]
    }
  ],
  "diagrams": [
    {
      "index": 0,
      "page": 3,
      "description": "Detailed description of what the diagram shows",
      "diagramType": "tree|flowchart|table|graph|other",
      "textContent": "Any text labels within the diagram",
      "canBeReproducedAsSVG": true
    }
  ]
}
```

CRITICAL RULES:
1. PRESERVE the professor's exact notation, variable names, indexing conventions, and terminology. Do NOT normalize to textbook standards.
2. Preserve ALL content — do not summarize or skip sections. Every paragraph, every code block, every formula.
3. Use Unicode for math: ∈, ∀, ∃, ∧, ∨, ⟹, ≤, ≥, ≠, Σ, ℕ, ℤ, ←, →, ∞, ⌊, ⌋
4. For code blocks, preserve exact formatting including indentation.
5. For diagrams you cannot extract as text, describe them in detail so they can be reproduced.
6. Mark each diagram with whether it can reasonably be reproduced as an SVG.
7. Output ONLY valid JSON. No markdown wrapping, no explanation text.
````

- [ ] **Step 2: Create stage 1 prompt — lab extraction**

Create `scripts/prompts/extract-lab.md`:

````markdown
You are extracting structured content from a university lab exercise sheet. Output valid JSON only.

Extract the following structure:

```json
{
  "metadata": {
    "title": "Lab title",
    "weekNumber": null,
    "topic": "Main topic",
    "source": "Full source attribution"
  },
  "exercises": [
    {
      "number": 1,
      "title": "Exercise title or first sentence",
      "statement": "Full problem statement preserving exact wording",
      "hints": ["Any hints provided"],
      "solution": {
        "explanation": "Solution explanation text if provided",
        "code": "Solution code if provided, exact formatting preserved",
        "language": "c|bash|text"
      },
      "diagrams": []
    }
  ],
  "diagrams": []
}
```

CRITICAL RULES:
1. PRESERVE the professor's exact wording, variable names, and conventions.
2. Extract ALL exercises — do not skip any.
3. If an exercise has sub-parts (a, b, c), include them as separate items in the exercise's content.
4. Preserve code formatting exactly.
5. Output ONLY valid JSON.
````

- [ ] **Step 3: Create stage 1 prompt — seminar extraction**

Create `scripts/prompts/extract-seminar.md`:

````markdown
You are extracting structured content from a university seminar exercise sheet. Output valid JSON only.

Extract the following structure:

```json
{
  "metadata": {
    "title": "Seminar title",
    "weekNumber": null,
    "topic": "Main topic",
    "source": "Full source attribution"
  },
  "problems": [
    {
      "number": 1,
      "title": "Problem title",
      "statement": "Full problem statement",
      "type": "formalization|algorithm|proof|conceptual|mixed",
      "parts": [
        {
          "label": "a",
          "question": "Sub-question text",
          "answer": "Expected answer if provided",
          "code": "Algorithm/pseudocode if provided"
        }
      ],
      "diagrams": []
    }
  ],
  "diagrams": []
}
```

CRITICAL RULES:
1. PRESERVE exact notation, especially I/O formalizations and algorithm pseudocode.
2. Extract ALL problems and sub-parts.
3. Classify each problem's type accurately.
4. For algorithms, preserve the exact pseudocode format from the PDF.
5. Output ONLY valid JSON.
````

- [ ] **Step 4: Create stage 1 prompt — test extraction**

Create `scripts/prompts/extract-test.md`:

````markdown
You are extracting structured content from a university exam/test PDF. Output valid JSON only.

Extract the following structure:

```json
{
  "metadata": {
    "title": "Test title as written",
    "type": "partial|exam",
    "year": 2026,
    "variant": "A|B|null",
    "series": "Seria I|Seria II|null",
    "duration": "Duration as written",
    "totalPoints": 0
  },
  "problems": [
    {
      "number": 1,
      "points": 10,
      "title": "Problem title/topic",
      "statement": "Full problem statement text",
      "parts": [
        {
          "label": "a",
          "points": 3,
          "question": "Sub-question text exactly as written",
          "answer": "Solution if provided, null otherwise",
          "code": "Algorithm/code if provided, null otherwise"
        }
      ]
    }
  ]
}
```

CRITICAL RULES:
1. PRESERVE the professor's exact notation, indexing, and terminology.
2. Extract ALL problems and ALL sub-parts with their point values.
3. Keep all text in the original language (usually Romanian).
4. For code/algorithms, preserve exact formatting.
5. Sum of all problem points should equal totalPoints.
6. Output ONLY valid JSON.
````

- [ ] **Step 5: Create stage 2 prompt — bibliography cross-reference**

Create `scripts/prompts/crossref.md`:

````markdown
You are cross-referencing extracted course content against bibliography sources. You will receive:
1. The extracted course content (JSON)
2. One or more bibliography source texts (markdown)

For each section in the extracted content, check:
- Does the content accurately reflect what the bibliography source says?
- Are there any deviations from standard notation/approach? (Flag these but DO NOT correct them — the professor's version is authoritative)
- Are there claims that cannot be verified against the provided sources?

Output valid JSON only:

```json
{
  "annotations": [
    {
      "sectionIndex": 0,
      "contentIndex": 2,
      "type": "verified|deviation|unverified|missing",
      "severity": "info|warning|error",
      "message": "Description of the finding",
      "professorVersion": "What the professor says (if deviation)",
      "standardVersion": "What the standard source says (if deviation)",
      "sourceId": "Which bibliography source this relates to"
    }
  ],
  "summary": {
    "totalChecked": 42,
    "verified": 35,
    "deviations": 3,
    "unverified": 4,
    "missing": 0
  }
}
```

CRITICAL RULES:
1. The professor's version is AUTHORITATIVE. Flag deviations but never suggest "correcting" them.
2. "missing" means content that the source covers but the extracted course does not include.
3. Be specific in messages — include page numbers, section names, exact terms.
4. Output ONLY valid JSON.
````

- [ ] **Step 6: Commit**

```bash
git add scripts/prompts/
git commit -m "feat: add Gemini prompt templates for all content types and cross-referencing"
```

---

### Task 4: Stage 1 — PDF Extraction Implementation

**Files:**
- Modify: `scripts/curate.mjs` — implement `runStage1()`

- [ ] **Step 1: Implement runStage1 in curate.mjs**

Replace the `runStage1` stub in `scripts/curate.mjs`:

```js
import { sendPdfWithPrompt, loadPromptTemplate } from './gemini.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

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
    // Save raw response for debugging
    writeFileSync(resolve(curateDir, 'stage1-raw-response.txt'), rawResponse);
    throw new Error(`Gemini returned invalid JSON. Raw response saved to stage1-raw-response.txt. Error: ${e.message}`);
  }

  // Save extraction
  writeFileSync(resolve(curateDir, 'stage1-extraction.json'), JSON.stringify(extraction, null, 2));

  // Log stats
  const sectionCount = extraction.sections?.length || extraction.exercises?.length || extraction.problems?.length || 0;
  const diagramCount = extraction.diagrams?.length || 0;
  console.log(`  Extracted: ${sectionCount} sections, ${diagramCount} diagrams`);
}
```

- [ ] **Step 2: Add the import at top of curate.mjs**

Add near the top of the file, after the dotenv import:

```js
import { sendPdfWithPrompt, sendTextPrompt, loadPromptTemplate } from './gemini.mjs';
```

Remove the duplicate `import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';` if one exists after adding these — the fs imports should appear once.

- [ ] **Step 3: Test stage 1 with a real PDF**

Pick an existing OS course PDF. If one is available at a known path:

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide" && node scripts/curate.mjs src/content/os/courses/some-test.pdf --type course --subject os
```

Expected: Either creates `src/content/os/.curate/<name>/stage1-extraction.json` and stops at stage 2, or fails with "GEMINI_API_KEY not set" if key isn't configured yet. Both confirm stage 1 code works.

- [ ] **Step 4: Commit**

```bash
git add scripts/curate.mjs
git commit -m "feat: implement stage 1 — PDF extraction via Gemini"
```

---

### Task 5: Stage 2 — Bibliography Cross-Reference Implementation

**Files:**
- Modify: `scripts/curate.mjs` — implement `runStage2()`

- [ ] **Step 1: Implement runStage2 in curate.mjs**

Replace the `runStage2` stub:

```js
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
    writeFileSync(resolve(curateDir, 'stage2-raw-response.txt'), rawResponse);
    throw new Error(`Cross-reference returned invalid JSON. Saved to stage2-raw-response.txt. Error: ${e.message}`);
  }

  writeFileSync(resolve(curateDir, 'stage2-crossref.json'), JSON.stringify(crossref, null, 2));
  console.log(`  Results: ${crossref.summary.verified} verified, ${crossref.summary.deviations} deviations, ${crossref.summary.unverified} unverified`);
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/curate.mjs
git commit -m "feat: implement stage 2 — bibliography cross-reference via Gemini"
```

---

### Task 6: Stage 2.5 — Diff Against Existing (--redo)

**Files:**
- Modify: `scripts/curate.mjs` — implement `runStage2_5()`

- [ ] **Step 1: Implement runStage2_5 in curate.mjs**

Replace the `runStage2_5` stub:

```js
async function runStage2_5() {
  const extraction = JSON.parse(readFileSync(resolve(curateDir, 'stage1-extraction.json'), 'utf-8'));

  // Find existing JSX file for this course
  const contentDir = resolve(`src/content/${subject}`);
  const typeDir = contentType === 'course' ? 'courses' : contentType === 'lab' ? 'labs' : contentType === 'seminar' ? 'seminars' : 'test';
  const { readdirSync } = await import('fs');
  const existingFiles = readdirSync(resolve(contentDir, typeDir)).filter(f => f.endsWith('.jsx'));

  if (existingFiles.length === 0) {
    console.log('  No existing files found. Treating as new content.');
    writeFileSync(resolve(curateDir, 'stage2.5-diff.json'), JSON.stringify({ isNew: true, decisions: [] }, null, 2));
    return;
  }

  // Read existing JSX content
  // For now, we ask user which file to compare against, or take the most likely match
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
    writeFileSync(resolve(curateDir, 'stage2.5-raw-response.txt'), rawResponse);
    throw new Error(`Diff returned invalid JSON. Saved to stage2.5-raw-response.txt. Error: ${e.message}`);
  }

  writeFileSync(resolve(curateDir, 'stage2.5-diff.json'), JSON.stringify(diff, null, 2));
  console.log(`  Decisions: ${diff.summary.keep} keep, ${diff.summary.rewrite} rewrite, ${diff.summary.new} new`);
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/curate.mjs
git commit -m "feat: implement stage 2.5 — diff against existing content for --redo"
```

---

### Task 7: Fix curate.mjs — top-level imports and showStatus async

**Files:**
- Modify: `scripts/curate.mjs`

The skeleton from Task 1 has a few issues to clean up now that all stages are implemented: `showStatus` uses `await import()` but isn't async in the call context, and imports need consolidation.

- [ ] **Step 1: Fix showStatus to be a proper async function**

The `showStatus` function uses `await import('fs')` but is called synchronously. Fix by making it async and awaiting it:

Replace:
```js
if (args[0] === 'status') {
  showStatus();
  process.exit(0);
}
```

With:
```js
if (args[0] === 'status') {
  await showStatus();
  process.exit(0);
}
```

But this requires top-level await, which ESM supports. Also fix `showStatus` to use the already-imported `readdirSync`:

In `showStatus`, replace `const { readdirSync } = await import('fs');` with just using the `readdirSync` from the top-level `fs` import. Add `readdirSync` to the existing `fs` import at the top:

```js
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
```

- [ ] **Step 2: Wrap top-level CLI parsing in an async IIFE or use top-level await**

Since ESM supports top-level await and the `status` command needs it, wrap the early-exit in an async context. The simplest fix: the file already calls `main()` at the bottom which is async, so move the status check inside `main()` before the pipeline runs:

```js
async function main() {
  if (args[0] === 'status') {
    showStatus();
    process.exit(0);
  }

  // ... rest of main
}
```

And remove the top-level `if (args[0] === 'status')` block.

- [ ] **Step 3: Commit**

```bash
git add scripts/curate.mjs
git commit -m "fix: clean up imports and async handling in curate.mjs"
```

---

### Task 8: Claude Code Skill — `/curate`

**Files:**
- Create: `~/.claude/skills/curate/skill.md`

- [ ] **Step 1: Create the curate skill**

Create `C:/Users/User/.claude/skills/curate/skill.md`:

````markdown
---
name: curate
description: Use when curating course material from PDFs into interactive study guide content. Triggers on /curate command, requests to process lecture PDFs, or converting raw materials into course/lab/seminar/test pages.
---

# Content Curation Pipeline

On-demand pipeline that converts professor PDFs into draft JSX content with review flags.

## When to Use

- User runs `/curate <path>`
- User asks to process/convert a PDF into course content
- User asks to redo/refine an existing course

## Command Syntax

```
/curate <pdf-path> [--redo]
/curate status
```

Subject and content type are auto-detected from the file path. The `--redo` flag compares against existing content and preserves correct sections.

## Pipeline Overview

Stages 1-2 run via Gemini (Node script). Stages 3-5 run here via Claude agents.

| Stage | Engine | Purpose |
|-------|--------|---------|
| 1. PDF Extraction | Gemini (script) | Extract structured content from PDF |
| 2. Bibliography Cross-Ref | Gemini (script) | Verify against cached bibliography sources |
| 2.5. Diff Existing | Gemini (script) | Compare with current JSX (--redo only) |
| 3. Diagram Triage | Haiku (agent) | Decide SVG vs image for each diagram |
| 4. Draft Generation | Opus (agent) | Generate JSX following skill conventions |
| 5. Self-Review | Opus (agent) | Review draft against source, add flags |

## Execution Steps

### Step 1: Run Gemini stages

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide" && node scripts/curate.mjs <pdf-path> [--redo]
```

Check output. If it fails, debug and re-run. If it succeeds, proceed to step 2.

### Step 2: Load stage outputs

Read the `.curate/` directory for this pipeline:
- `stage1-extraction.json` — extracted content
- `stage2-crossref.json` — bibliography annotations
- `stage2.5-diff.json` — existing content diff (if --redo)
- `status.json` — pipeline state

### Step 3: Diagram Triage (Haiku agent)

For each diagram in `stage1-extraction.json`:
1. Check if a matching SVG exists in `src/content/<subject>/diagrams/`
2. Decide: reuse existing SVG / create new SVG / keep as extracted image
3. If keeping as image, save to `src/content/<subject>/media/`
4. Write decisions to `.curate/<name>/stage3-diagrams.json`
5. Update `status.json` to `lastCompleted: 3`

Use a Haiku agent for this — it's a classification task, not generation.

### Step 4: Draft Generation (Opus — this is you)

Consume all stage outputs and generate the draft JSX file. Follow the appropriate skill:
- **course** → `adding-course` skill conventions
- **lab** → `adding-lab-exercises` skill conventions
- **seminar** → `creating-seminar-evaluations` skill conventions
- **test** → `creating-pa-tests` or `creating-os-tests` skill conventions

**Critical rules for generation:**
- Use `t('English', 'Romanian')` for all text — translate accurately
- Section IDs must be descriptive: `course_N-topic` not `course_N-0`
- Preserve professor's exact conventions (flagged deviations from stage 2)
- Embed `{/* ⚠️ UNVERIFIED: description */}` for unverified content
- Embed `{/* ⚠️ DEVIATION: professor uses X, standard is Y */}` for flagged deviations
- For `--redo`: keep sections marked "keep" in the diff, rewrite "rewrite" sections, add "new" sections
- Count `<Section>` components accurately for `sectionCount`

Write output to `.curate/<name>/stage4-draft.jsx` and `.curate/<name>/stage4-review-notes.md`.
Update `status.json` to `lastCompleted: 4`.

### Step 5: Self-Review (Opus — this is you)

Re-read the source PDF and compare against the draft:
- Missing sections?
- Wrong section ordering?
- Lost content from the extraction?
- Broken code blocks or formatting?
- Flag count accurate?

Update the draft and write to `.curate/<name>/stage5-draft.jsx` and `.curate/<name>/stage5-review-notes.md`.

Also generate `.curate/<name>/index-snippet.js` — the exact code to paste into the subject's `index.js`:

```js
// Paste this into the courses/seminars/labs/tests array in src/content/<subject>/index.js
{
  id: '<generated-id>',
  title: { en: '<English title>', ro: '<Romanian title>' },
  shortTitle: { en: '<short en>', ro: '<short ro>' },
  sectionCount: <N>,
  sections: [
    // ... generated section entries
  ],
  component: lazy(() => import('./<type>/<Filename>.jsx'))
},
```

Update `status.json` to `lastCompleted: 5`.

### Step 6: Print next steps

After stage 5, always print:

```
✅ Pipeline complete — N flags to review

Next steps:
  1. Read review notes:  .curate/<name>/stage5-review-notes.md
  2. Preview in browser:  npm run dev → navigate to the course
  3. Edit draft if needed: .curate/<name>/stage5-draft.jsx
  4. Move to final location: <type>/<Filename>.jsx
  5. Register in index.js — paste snippet from .curate/<name>/index-snippet.js
  6. Commit and push
```
````

- [ ] **Step 2: Commit**

```bash
git add "C:/Users/User/.claude/skills/curate/skill.md"
git commit -m "feat: add /curate skill for content curation pipeline orchestration"
```

---

### Task 9: Bibliography Setup Tooling

**Files:**
- Create: `scripts/setup-refs.mjs`

This is a one-time helper script to set up the bibliography for a subject: extract references from the course description PDF, search for sources online, download and convert them.

- [ ] **Step 1: Create setup-refs.mjs**

```js
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
```

- [ ] **Step 2: Add setup-refs script to scripts/package.json**

Add to the `scripts` section:

```json
"setup-refs": "node setup-refs.mjs"
```

- [ ] **Step 3: Commit**

```bash
git add scripts/setup-refs.mjs scripts/package.json
git commit -m "feat: add bibliography setup script — extracts refs from course description PDF and searches online"
```

---

### Task 10: End-to-End Test Run

**Files:** None created — this is a verification task.

- [ ] **Step 1: Verify the full pipeline structure**

```bash
ls -la "C:/Users/User/Desktop/SO/os-study-guide/scripts/"
ls -la "C:/Users/User/Desktop/SO/os-study-guide/scripts/prompts/"
cat "C:/Users/User/.claude/skills/curate/skill.md" | head -5
```

Expected: All files present — `curate.mjs`, `gemini.mjs`, `setup-refs.mjs`, `prompts/` with 5 template files, skill exists.

- [ ] **Step 2: Verify curate.mjs CLI parsing**

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide" && node scripts/curate.mjs 2>&1 | head -3
```

Expected: Usage error message (no arguments provided).

```bash
node scripts/curate.mjs status
```

Expected: "No active pipelines." (no `.curate/` dirs exist yet).

- [ ] **Step 3: Verify .gitignore**

```bash
grep -n "curate" "C:/Users/User/Desktop/SO/os-study-guide/.gitignore"
```

Expected: Shows the `**/.curate/` line.

- [ ] **Step 4: Test with a real PDF (when Gemini API key is set)**

Once the user has configured `GEMINI_API_KEY` in `proxy/.env`:

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide" && node scripts/curate.mjs src/content/os/labs/lab2_raw.html --type lab --subject os
```

This tests the full Gemini pipeline on an existing raw file. After stages 1-2 complete, run `/curate` in Claude Code to finish stages 3-5.

- [ ] **Step 5: Final commit**

```bash
git add -A && git status
git commit -m "feat: content curation pipeline v1 complete"
```

---

## File Map Summary

```
scripts/
├── package.json            ← Task 1
├── curate.mjs              ← Tasks 1, 4, 5, 6, 7
├── gemini.mjs              ← Task 2
├── setup-refs.mjs          ← Task 9
└── prompts/
    ├── extract-course.md   ← Task 3
    ├── extract-lab.md      ← Task 3
    ├── extract-seminar.md  ← Task 3
    ├── extract-test.md     ← Task 3
    └── crossref.md         ← Task 3

~/.claude/skills/curate/
└── skill.md                ← Task 8

Modified:
├── .gitignore              ← Task 1
└── proxy/.env              ← Task 2
```

## Execution Order

Tasks 1-7 are sequential (each builds on the previous). Tasks 8 and 9 are independent of each other but depend on Task 2 (Gemini client). Task 10 depends on all previous tasks.

```
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 10
                                                          ↗
                   Task 2 → Task 8 ──────────────────────╯
                   Task 2 → Task 9 ──────────────────────╯
```
