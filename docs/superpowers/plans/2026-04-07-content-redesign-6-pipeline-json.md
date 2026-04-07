# Pipeline JSON Output — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the curate pipeline (stages 3-5) to output JSON block courses instead of JSX, with the pipeline autonomously deciding content structure, block types, learning rhythm, and lecture overlay placement.

**Architecture:** The Gemini extraction stages (1-2.5) stay unchanged — they output intermediate JSON that stage 4 consumes. Stage 3 (diagram triage) gets a minor output format update. Stage 4 (draft generation) is completely rewritten: instead of generating JSX using Section/Box/Toggle components, it generates course JSON following the block schema with steps, typed blocks, and lecture overlay. Stage 5 (self-review) is updated to review JSON output and generate a JSON-format index snippet. The curate skill file (`~/.claude/skills/curate/skill.md`) is the primary file being modified — it contains all stage 3-5 instructions that Claude follows during curation.

**Tech Stack:** Markdown skill files, JSON schema, existing block component registry (16 block types)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `~/.claude/skills/curate/skill.md` | **Rewrite** | Main pipeline orchestration — stages 3-5 instructions |
| `~/.claude/skills/adding-course/skill.md` | **Update** | Add JSON course conventions section (pipeline references this) |
| `~/.claude/skills/creating-os-tests/skill.md` | **Update** | Add JSON test conventions section |
| `~/.claude/skills/creating-pa-tests/skill.md` | **Update** | Add JSON test conventions section |
| `~/.claude/skills/adding-lab-exercises/skill.md` | **Update** | Add JSON lab conventions section |
| `~/.claude/skills/creating-seminar-evaluations/skill.md` | **Update** | Add JSON seminar conventions section |

**No application code changes.** All block components, renderers, and infrastructure from Plans 1-5 are already built. This plan only updates the skill files that instruct Claude how to generate content.

---

### Task 1: Update the Course Content Skill with JSON Conventions

The curate pipeline stage 4 references the adding-course skill for content conventions. Currently it only documents JSX patterns. Add a JSON section so the pipeline knows the target format.

**Files:**
- Modify: `~/.claude/skills/adding-course/skill.md`

- [ ] **Step 1: Read the current skill file**

Read `~/.claude/skills/adding-course/skill.md` to confirm current contents match what we expect (JSX-only conventions).

- [ ] **Step 2: Add JSON course conventions section**

Add the following section after the existing JSX content, before the "Verify" section. This documents the JSON block format that the pipeline will generate:

```markdown
## JSON Course Format (Pipeline Output)

When the curate pipeline generates courses, it outputs JSON files — not JSX. The pipeline decides all content structure autonomously.

### File Location

`src/content/<slug>/courses/course-<NN>.json` (zero-padded: 01, 02, ..., 11)

### Schema

```json
{
  "meta": {
    "id": "<slug>-c<N>",
    "title": { "en": "Course N: Full Title", "ro": "Cursul N: Titlu Complet" },
    "shortTitle": { "en": "CN: Short", "ro": "CN: Scurt" },
    "source": { "en": "Prof. X — Lecture N slides", "ro": "Prof. X — Curs N" }
  },
  "steps": [
    {
      "id": "<slug>-c<N>-<descriptive>",
      "title": { "en": "Step Title", "ro": "Titlu Pas" },
      "group": "optional-group-label",
      "blocks": [
        { "type": "learn", "content": { "en": "...", "ro": "..." } },
        { "type": "definition", "term": { "en": "...", "ro": "..." }, "content": { "en": "...", "ro": "..." } },
        ...
      ]
    }
  ]
}
```

### Available Block Types and Props

| Type | Required Props | Optional Props |
|------|---------------|----------------|
| `learn` | `content: {en, ro}` | — |
| `definition` | `term: {en, ro}`, `content: {en, ro}` | — |
| `think` | `question: {en, ro}`, `answer: {en, ro}` | — |
| `quiz` | `questions: [{question:{en,ro}, options:[{text:{en,ro}, correct:bool}], explanation?:{en,ro}}]` | — |
| `code` | `content: string` | `language: string` |
| `callout` | `content: {en, ro}` | `variant: 'tip'\|'warning'\|'trap'\|'info'` |
| `table` | `headers: [string\|{en,ro}]`, `rows: [[string\|{en,ro}]]` | — |
| `list` | `items: [string\|{en,ro}]` | `ordered: bool` |
| `image` | `src: string` | `alt: string`, `caption: string` |
| `diagram` | `variant: string`, `data: object` | — |
| `lecture` | `note: {en, ro}` | `slides: string`, `crossRef: string` |
| `lecture-video` | `url: string`, `title: string` | `duration: string`, `relevance: string` |
| `lecture-exam` | `note: {en, ro}` | `frequency: number`, `years: [string]` |
| `animation` | `variant: string` | — |
| `code-challenge` | `variant: string` | — |
| `terminal` | — | — |

### Step ID Convention

IDs must be **descriptive**, not numeric. Format: `<slug>-c<N>-<keyword>`

- `os-c1-intro`, `os-c4-posix`, `pa-c2-greedy`
- Last step should be a self-test quiz: `<slug>-c<N>-quiz`

### Group Labels

Steps can optionally have a `group` for visual clustering in the progress strip:
- `"fundamentals"`, `"scheduling"`, `"assessment"`, etc.
- Steps with the same group are visually clustered
- If omitted, steps are ungrouped

### Bilingual Rules

- All visible text uses `{en, ro}` objects
- Code blocks (`code` type) use plain strings — code stays in English
- Math notation is language-neutral (Unicode: ∈, ∀, ≤, ≥, etc.)

### Registration in index.js

JSON courses use `src` instead of `component`:

```js
{
  id: '<slug>-c<N>',
  title: { en: 'Course N: Title', ro: 'Cursul N: Titlu' },
  shortTitle: { en: 'CN: Short', ro: 'CN: Scurt' },
  sectionCount: <NUMBER_OF_STEPS>,
  metaId: '<slug>-c<N>',
  src: '<slug>/courses/course-<NN>.json'
},
```

**Critical**: `sectionCount` must match the number of steps in the JSON. `metaId` must match `meta.id` in the JSON.
```

- [ ] **Step 3: Commit**

```bash
git add ~/.claude/skills/adding-course/skill.md
git commit -m "docs: add JSON course conventions to adding-course skill"
```

---

### Task 2: Update Test Content Skills with JSON Conventions

Both OS and PA test skills need JSON test schema documentation for the pipeline.

**Files:**
- Modify: `~/.claude/skills/creating-os-tests/skill.md`
- Modify: `~/.claude/skills/creating-pa-tests/skill.md`

- [ ] **Step 1: Add JSON test section to OS tests skill**

Add the following section to `~/.claude/skills/creating-os-tests/skill.md` after the existing JSX content:

```markdown
## JSON Test Format (Pipeline Output)

When the curate pipeline processes test PDFs, it outputs JSON — not JSX.

### File Location

`src/content/os/tests/test-<name>.json`

### Schema

```json
{
  "meta": {
    "id": "os-test-<name>",
    "title": { "en": "Test: Description", "ro": "Test: Descriere" },
    "year": 2025,
    "type": "partial|exam|practice",
    "duration": 90,
    "totalPoints": 100
  },
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice|open-ended|code-writing|diagram|fill-in",
      "points": 10,
      "prompt": { "en": "Question text", "ro": "Text intrebare" },
      "relatedSteps": ["os-c1-intro"]
    }
  ]
}
```

### Question Type Props

| Type | Additional Props |
|------|-----------------|
| `multiple-choice` | `options: [{text:{en,ro}}]`, `correctIndex: number`, `explanation: {en,ro}` |
| `open-ended` | `rubric: {en,ro}` |
| `code-writing` | `language: string`, `testCases: [{input,expected}]`, `rubric: {en,ro}` |
| `diagram` | `rubric: {en,ro}` |
| `fill-in` | `blanks: [{id, accept: [string]}]` |

### Registration in index.js

```js
{
  id: 'os-test-<name>',
  title: { en: 'Test: Title', ro: 'Test: Titlu' },
  shortTitle: { en: 'Short', ro: 'Scurt' },
  src: 'os/tests/test-<name>.json'
},
```
```

- [ ] **Step 2: Add JSON test section to PA tests skill**

Add equivalent section to `~/.claude/skills/creating-pa-tests/skill.md`. Same schema but with PA-specific conventions:

```markdown
## JSON Test Format (Pipeline Output)

When the curate pipeline processes test PDFs, it outputs JSON following the test block schema.

### File Location

`src/content/pa/tests/test-<type>-<year>-<variant>.json`

### Schema

Same as the general test JSON schema (see creating-os-tests skill). PA-specific notes:

- `type` is usually `"partial"` (midterm) or `"exam"` (final)
- `relatedSteps` reference PA step IDs: `pa-c1-def`, `pa-c2-greedy`, etc.
- Algorithm pseudocode questions use `code-writing` type with `language: "pseudocode"`
- I/O formalization questions use `open-ended` type with a rubric describing expected format
- Keep Romanian text in prompts (original language) — only `meta.title` is bilingual

### Registration in index.js

```js
{
  id: 'pa-test-<type>-<year>-<variant>',
  title: { en: 'Partial 2025 — Variant A', ro: 'Partial 2025 — Varianta A' },
  shortTitle: { en: 'P25-A', ro: 'P25-A' },
  src: 'pa/tests/test-partial-2025-a.json'
},
```

### Migration Note

The old `testData.js` + `TestRenderer.jsx` + `PATests.jsx` system is replaced by individual JSON test files rendered by the shared `src/components/blocks/test/TestRenderer.jsx` from Plan 4. Existing tests in `testData.js` should be converted to individual JSON files.
```

- [ ] **Step 3: Commit**

```bash
git add ~/.claude/skills/creating-os-tests/skill.md ~/.claude/skills/creating-pa-tests/skill.md
git commit -m "docs: add JSON test conventions to OS and PA test skills"
```

---

### Task 3: Update Lab and Seminar Skills with JSON Conventions

Labs and seminars use the same JSON course schema (steps + blocks) but with content-type-specific conventions.

**Files:**
- Modify: `~/.claude/skills/adding-lab-exercises/skill.md`
- Modify: `~/.claude/skills/creating-seminar-evaluations/skill.md`

- [ ] **Step 1: Add JSON section to lab exercises skill**

Add to `~/.claude/skills/adding-lab-exercises/skill.md`:

```markdown
## JSON Lab Format (Pipeline Output)

Labs use the same JSON step/block schema as courses. Each exercise becomes a step.

### File Location

`src/content/<slug>/labs/lab-<NN>.json`

### Schema

```json
{
  "meta": {
    "id": "<slug>-l<N>",
    "title": { "en": "Week N: Topic (Exercises)", "ro": "Săptămâna N: Temă (Exerciții)" },
    "shortTitle": { "en": "WN: Short", "ro": "SN: Scurt" },
    "source": { "en": "Lab N — Topic, UAIC 2026", "ro": "Laborator N — Temă, UAIC 2026" }
  },
  "steps": [
    {
      "id": "<slug>-l<N>-ex<M>",
      "title": { "en": "Exercise M: Title", "ro": "Exercițiul M: Titlu" },
      "blocks": [
        { "type": "callout", "variant": "info", "content": { "en": "Problem statement...", "ro": "Enunț..." } },
        { "type": "think", "question": { "en": "Show solution", "ro": "Arată soluția" }, "answer": { "en": "Explanation + code", "ro": "Explicație + cod" } },
        { "type": "code", "language": "c", "content": "solution code here" }
      ]
    }
  ]
}
```

### Exercise Patterns

- **Command/Script exercises**: `callout` (statement) → `think` (solution reveal) → `code` (solution)
- **C Programming exercises**: `callout` (statement) → `code` (solution) → `callout variant=tip` (key concept)
- **Conceptual exercises**: `callout` (statement) → `think` (answer)

### Registration in index.js

```js
{
  id: '<slug>-l<N>',
  title: { en: 'Week N: Topic', ro: 'Săptămâna N: Temă' },
  shortTitle: { en: 'WN: Short', ro: 'SN: Scurt' },
  sectionCount: <NUMBER_OF_STEPS>,
  metaId: '<slug>-l<N>',
  src: '<slug>/labs/lab-<NN>.json'
},
```
```

- [ ] **Step 2: Add JSON section to seminar evaluations skill**

Add to `~/.claude/skills/creating-seminar-evaluations/skill.md`:

```markdown
## JSON Seminar Format (Pipeline Output)

Seminars use the same JSON step/block schema. Each problem becomes a step.

### File Location

`src/content/<slug>/seminars/seminar-<NN>.json`

### Schema

```json
{
  "meta": {
    "id": "<slug>-s<N>",
    "title": { "en": "Week N: Topic", "ro": "Săptămâna N: Temă" },
    "shortTitle": { "en": "WN: Short", "ro": "SN: Scurt" },
    "source": { "en": "Seminar N — Topic, UAIC 2026", "ro": "Seminar N — Temă, UAIC 2026" }
  },
  "steps": [
    {
      "id": "<slug>-s<N>-p<M>",
      "title": { "en": "Problem M: Title", "ro": "Problema M: Titlu" },
      "blocks": [
        { "type": "callout", "variant": "info", "content": { "en": "Problem statement...", "ro": "Enunț..." } },
        { "type": "quiz", "questions": [...] },
        { "type": "think", "question": { "en": "Show algorithm", "ro": "Arată algoritmul" }, "answer": { "en": "Algorithm + pseudocode", "ro": "Algoritm + pseudocod" } },
        { "type": "code", "language": "pseudocode", "content": "Algorithm Name(params)\n  ..." }
      ]
    }
  ]
}
```

### Seminar Patterns

- **Formalization problems**: `callout` (statement) → `quiz` (I/O formalization MCQ) → `think` (algorithm reveal)
- **Algorithm problems**: `callout` (statement) → `quiz` (concept MCQ) → `code` (pseudocode) → `callout variant=tip` (complexity)
- **Multi-part problems**: Single step with multiple `quiz` blocks separated by sub-part headings in `learn` blocks

### Registration in index.js

```js
{
  id: '<slug>-s<N>',
  title: { en: 'Week N: Topic', ro: 'Săptămâna N: Temă' },
  shortTitle: { en: 'WN: Short', ro: 'SN: Scurt' },
  sectionCount: <NUMBER_OF_STEPS>,
  metaId: '<slug>-s<N>',
  src: '<slug>/seminars/seminar-<NN>.json'
},
```
```

- [ ] **Step 3: Commit**

```bash
git add ~/.claude/skills/adding-lab-exercises/skill.md ~/.claude/skills/creating-seminar-evaluations/skill.md
git commit -m "docs: add JSON conventions to lab and seminar skills"
```

---

### Task 4: Rewrite the Curate Skill — Pipeline Overview and Stages 1-3

The curate skill (`~/.claude/skills/curate/skill.md`) is the master orchestration file. This task rewrites the header, pipeline overview, and stages 1-3. Task 5 handles stages 4-5 (the big changes).

**Files:**
- Modify: `~/.claude/skills/curate/skill.md`

- [ ] **Step 1: Read the current skill file**

Read `~/.claude/skills/curate/skill.md` to confirm current contents.

- [ ] **Step 2: Rewrite the skill file — top section through stage 3**

Replace the entire file with the new version. This step covers everything from the top through stage 3. The content for stages 4-5 will be added in Task 5.

Write the following to `~/.claude/skills/curate/skill.md`:

```markdown
# Content Curation Pipeline

On-demand pipeline that converts professor PDFs into JSON block content with review flags. One command does everything — Gemini extraction + Claude generation. The pipeline autonomously decides content structure, block types, learning rhythm, and lecture overlay placement.

## When to Use

- User runs `/curate <path>`
- User asks to process/convert a PDF into course content
- User asks to redo/refine an existing course

## Command Syntax

```
/curate <pdf-path> [--redo] [--desc <course-description.pdf>]
/curate status
```

- Subject and content type are auto-detected from the file path
- `--redo` compares against existing content and preserves correct sections
- `--desc <pdf>` sets up bibliography for the subject (first time only)

## Pipeline Overview

| Stage | Engine | Input | Output |
|-------|--------|-------|--------|
| 1. PDF Extraction | Gemini (script) | PDF | `stage1-extraction.json` |
| 2. Bibliography Cross-Ref | Gemini (script) | Extraction + refs | `stage2-crossref.json` |
| 2.5. Diff Existing | Gemini (script) | Extraction + existing JSON/JSX | `stage2.5-diff.json` (--redo only) |
| 3. Diagram Triage | Haiku (agent) | Extraction diagrams | `stage3-diagrams.json` |
| 4. Draft Generation | Opus (this is you) | All stage outputs | `stage4-draft.json` + `stage4-review-notes.md` |
| 5. Self-Review | Opus (this is you) | Draft + source PDF | `stage5-draft.json` + `stage5-review-notes.md` + `index-snippet.js` |

## Execution — All-in-One

### Step 1: Run Gemini stages (1-2) via Node script

Run this automatically — do NOT ask the user to run it manually:

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide" && node scripts/curate.mjs <pdf-path> [--redo] [--desc <course-description.pdf>]
```

- Replace `<pdf-path>` with the actual path from the user's command
- If `--redo` was specified, include it
- If `--desc` was specified, include it with the description PDF path
- If the script fails, debug and retry before proceeding
- If `status` was the argument, run `node scripts/curate.mjs status` and print the result

### Step 2: Load stage outputs

After the script succeeds, read the `.curate/` directory for this pipeline:

```
src/content/<subject>/.curate/<name>/
```

Read these files:
- `stage1-extraction.json` — extracted content
- `stage2-crossref.json` — bibliography annotations
- `stage2.5-diff.json` — existing content diff (if --redo)
- `status.json` — pipeline state

### Step 3: Diagram Triage (Haiku agent)

For each diagram in `stage1-extraction.json`:
1. Check if a matching SVG exists in `src/content/<subject>/diagrams/`
2. Decide: reuse existing SVG / create new SVG / keep as extracted image
3. If keeping as image, save to `src/content/<subject>/media/`
4. Write decisions to `.curate/<name>/stage3-diagrams.json`:

```json
{
  "decisions": [
    {
      "diagramIndex": 0,
      "description": "Process state diagram",
      "decision": "create-svg|reuse-existing|keep-image",
      "existingPath": "diagrams/process-states.svg",
      "notes": "Can be reproduced as SVG with 5 states and transitions"
    }
  ]
}
```

5. Update `status.json` to `lastCompleted: 3`

Use a Haiku agent for this — it's a classification task, not generation.
```

**Do not close the file yet** — Task 5 will append stages 4-5.

- [ ] **Step 3: Commit**

```bash
git add ~/.claude/skills/curate/skill.md
git commit -m "docs: rewrite curate skill — overview and stages 1-3 for JSON output"
```

---

### Task 5: Rewrite the Curate Skill — Stage 4 (Draft Generation)

This is the core change. Stage 4 no longer generates JSX — it generates JSON course/test files. The pipeline autonomously decides content structure: how to decompose professor sections into learning steps, which block types to use, where to place think/quiz pauses, and what lecture overlay content to add.

**Files:**
- Modify: `~/.claude/skills/curate/skill.md` (append after stage 3)

- [ ] **Step 1: Append Stage 4 to the curate skill**

Add the following after the Stage 3 section in `~/.claude/skills/curate/skill.md`:

````markdown
### Step 4: Draft Generation (Opus — this is you)

Consume all stage outputs and generate the draft JSON file. This is where you make all content design decisions.

**Output format depends on content type:**
- **course** → Course JSON (steps + blocks) — see `adding-course` skill, "JSON Course Format" section
- **lab** → Course JSON (steps + blocks) — see `adding-lab-exercises` skill, "JSON Lab Format" section
- **seminar** → Course JSON (steps + blocks) — see `creating-seminar-evaluations` skill, "JSON Seminar Format" section
- **test** → Test JSON (questions) — see `creating-os-tests` or `creating-pa-tests` skill, "JSON Test Format" section

#### Content Design Decisions (Courses Only)

You are the content designer. The stage 1 extraction gives you raw professor content organized by their original sections. Your job is to **restructure this into an effective learning flow**. You decide:

**1. Step decomposition:** Break professor sections into digestible steps. One professor section might become 2-4 steps. Each step should take 2-5 minutes to read. A step should cover ONE focused concept.

**2. Block type selection:** For each piece of content, choose the best block type:

| Content | Block Type | When to Use |
|---------|-----------|-------------|
| Core explanations | `learn` | Main teaching content — the "tutorial" voice. Use markdown for emphasis, lists, inline code. |
| Key terms | `definition` | Named concepts the student must know. Term + explanation. |
| Important code | `code` | Shell commands, C programs, config files. Must be real, runnable code. |
| "Stop and think" | `think` | Pause before revealing an insight. Use after introducing a concept, before explaining why it matters. |
| Knowledge checks | `quiz` | Multiple choice with 3-5 options. Place after every 2-3 learn blocks. Distractors must test real misunderstandings. |
| Tips/warnings | `callout` | `tip` for best practices, `warning` for gotchas, `trap` for common mistakes, `info` for context. |
| Data grids | `table` | Comparisons, reference tables, command listings. |
| Enumerations | `list` | When order matters (steps) use ordered. Otherwise unordered. |
| Visual structures | `diagram` | State machines, trees, flowcharts, memory layouts. Only when the concept is inherently visual. |
| Slide references | `lecture` | Which professor slides cover this step. Always include when source PDF has slide numbers. |
| Video resources | `lecture-video` | YouTube links that explain the concept well. Search for relevant videos when a concept would benefit from visual/animated explanation. |
| Exam emphasis | `lecture-exam` | Flag topics that appear frequently in exams. Use data from stage 2 cross-ref if test PDFs were available. |

**3. Learning rhythm:** Follow this pattern within each step, adapting as needed:

```
learn → (definition)* → (code|diagram)? → think → (quiz)?
```

- Start with a `learn` block that introduces the concept
- Follow with `definition` blocks for any new terms
- Add `code` or `diagram` blocks for concrete examples
- Insert a `think` block to prompt reflection
- End key sections with a `quiz` for active recall
- The last step of every course must be a self-test quiz step (`<slug>-c<N>-quiz`) with 5-10 quiz questions covering the whole course

**4. Lecture overlay placement:** Lecture blocks (`lecture`, `lecture-video`, `lecture-exam`) go at the END of the step they relate to, after all tutorial content. They are hidden by default (toggle controlled by the UI). Place them in the step whose content they annotate.

**5. Translation:** Every text field must have both `en` and `ro`. Translate accurately — not word-for-word, but natural in both languages. Code stays in English. Math notation is language-neutral.

#### Content Design Decisions (Labs)

Each exercise becomes a step. Within each step:
1. `callout variant="info"` — problem statement
2. `learn` — brief context if needed
3. `think` — solution reveal (question = "Show solution", answer = explanation)
4. `code` — solution code

#### Content Design Decisions (Seminars)

Each problem becomes a step. Within each step:
1. `callout variant="info"` — problem statement
2. `quiz` — formalization/concept MCQ with good distractors
3. `think` — algorithm reveal
4. `code language="pseudocode"` — pseudocode solution
5. `callout variant="tip"` — complexity analysis

For multi-part problems: use multiple `quiz` blocks with `learn` blocks as sub-part headers.

#### Content Design Decisions (Tests)

Map each problem to a question entry:
- Written/explanation problems → `open-ended`
- Multiple choice → `multiple-choice`
- Code/algorithm problems → `code-writing`
- Diagram/drawing problems → `diagram`
- Fill-in-the-blank → `fill-in`

Generate rubrics from the course content. Map `relatedSteps` by matching question topics to course step IDs.

#### Quality Rules

1. **PRESERVE the professor's exact conventions** — notation, variable names, indexing. Flag deviations from stage 2 cross-ref as comments in review notes, NOT in the JSON.
2. **No content loss** — every piece of extracted content must appear in the output. If a paragraph doesn't fit any block type, use `learn`.
3. **UNVERIFIED flags** — if stage 2 flagged content as unverified, add a comment in `stage4-review-notes.md`: `⚠️ UNVERIFIED: step <id>, block <index> — <description>`. Do NOT put flags in the JSON itself.
4. **DEVIATION flags** — if stage 2 flagged deviations, add to review notes: `⚠️ DEVIATION: step <id>, block <index> — professor uses X, standard is Y`. The professor's version stays in the JSON.
5. **For `--redo`**: respect the diff from stage 2.5. Sections marked "keep" should be preserved as-is (convert to JSON if currently JSX). "rewrite" sections get regenerated. "new" sections are added.
6. **Step count**: aim for 5-15 steps per course. More for dense courses, fewer for light ones.
7. **Diagram blocks**: reference diagram decisions from stage 3. If decision was "create-svg", use `{ "type": "diagram", "variant": "<diagramType>", "data": {...} }`. If "keep-image", use `{ "type": "image", "src": "<path>", "alt": "...", "caption": "..." }`.

#### Output

Write output to `.curate/<name>/stage4-draft.json`.
Write review notes to `.curate/<name>/stage4-review-notes.md` (flags, decisions made, anything the user should review).
Update `status.json` to `lastCompleted: 4`.
````

- [ ] **Step 2: Commit**

```bash
git add ~/.claude/skills/curate/skill.md
git commit -m "docs: add stage 4 JSON draft generation to curate skill"
```

---

### Task 6: Rewrite the Curate Skill — Stage 5 (Self-Review) and Next Steps

Stage 5 reviews the JSON draft and generates the index snippet. Then prints next steps for the user.

**Files:**
- Modify: `~/.claude/skills/curate/skill.md` (append after stage 4)

- [ ] **Step 1: Append Stage 5 and next steps to the curate skill**

Add the following after Stage 4 in `~/.claude/skills/curate/skill.md`:

````markdown
### Step 5: Self-Review (Opus — this is you)

Re-read the source PDF (or stage 1 extraction if PDF not accessible) and compare against the draft JSON:

**Checklist:**
1. **Missing content?** Every section from stage 1 extraction must be covered by at least one step.
2. **Step flow?** Steps should follow a logical teaching order, not just the PDF order. Reorder if the professor's order is pedagogically suboptimal.
3. **Block type appropriateness?** Are `think` blocks genuinely thought-provoking? Are `quiz` distractors testing real misunderstandings? Are `definition` blocks for actual terms (not just paragraphs)?
4. **Translation quality?** Both `en` and `ro` must be natural, not machine-translated-sounding.
5. **ID consistency?** All step IDs follow `<slug>-c<N>-<descriptive>` convention. No duplicates.
6. **JSON validity?** Parse the draft to verify it's valid JSON.
7. **Lecture overlay?** If source PDF had slide numbers, are `lecture` blocks present? If test PDFs were available (stage 2), are `lecture-exam` blocks placed?
8. **Self-test quiz?** Last step must be a comprehensive quiz covering the whole course.
9. **Flag review?** All UNVERIFIED and DEVIATION flags from stage 4 review notes are still accurate.

Fix any issues directly in the draft. Write the corrected version to `.curate/<name>/stage5-draft.json`.
Write updated review notes to `.curate/<name>/stage5-review-notes.md`.

Generate `.curate/<name>/manifest.json` — block inventory for post-generation editing:

```json
{
  "steps": [
    {
      "stepId": "os-c1-intro",
      "stepTitle": "What is Linux?",
      "blocks": [
        { "index": 0, "type": "learn", "complexity": "simple", "confidence": "high" },
        { "index": 1, "type": "definition", "complexity": "simple", "confidence": "high", "keyProps": ["term", "content"] },
        { "index": 2, "type": "diagram", "complexity": "complex", "confidence": "medium", "keyProps": ["variant", "data"], "notes": "Process state machine — verify transitions" },
        { "index": 3, "type": "think", "complexity": "simple", "confidence": "high" },
        { "index": 4, "type": "lecture-exam", "complexity": "simple", "confidence": "medium", "keyProps": ["frequency", "years"], "notes": "Frequency calculated from 4 available tests" }
      ]
    }
  ]
}
```

- `complexity`: `simple` (text only), `medium` (structured data like tables/quizzes), `complex` (diagrams, animations, interactive)
- `confidence`: `high` (clear source material), `medium` (interpretation required), `low` (guessed or inferred)
- `keyProps`: for medium/complex blocks, lists the props that control behavior — editing these fixes issues without regenerating
- `notes`: optional human-readable note about what to review

Purpose: makes post-generation fixes surgical. To fix a broken diagram, find it in the manifest, check its `keyProps`, edit those props in the JSON.

Also generate `.curate/<name>/index-snippet.js` — the exact code to paste into the subject's `index.js`:

**For courses/labs/seminars (JSON src):**
```js
// Paste this into the courses/labs/seminars array in src/content/<subject>/index.js
{
  id: '<generated-id>',
  title: { en: '<English title>', ro: '<Romanian title>' },
  shortTitle: { en: '<short en>', ro: '<short ro>' },
  sectionCount: <NUMBER_OF_STEPS>,
  metaId: '<meta.id from JSON>',
  src: '<subject>/<type>/filename.json'
},
```

**For tests (JSON src):**
```js
// Paste this into the tests array in src/content/<subject>/index.js
{
  id: '<generated-id>',
  title: { en: '<English title>', ro: '<Romanian title>' },
  shortTitle: { en: '<short en>', ro: '<short ro>' },
  src: '<subject>/tests/filename.json'
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
  3. Edit draft if needed: .curate/<name>/stage5-draft.json
  4. Move to final location: <type>/filename.json
  5. Register in index.js — paste snippet from .curate/<name>/index-snippet.js
  6. Commit and push
```
````

- [ ] **Step 2: Verify the complete skill file**

Read back `~/.claude/skills/curate/skill.md` and verify:
- All 6 steps are present (1: run script, 2: load outputs, 3: diagram triage, 4: draft generation, 5: self-review, 6: next steps)
- No references to JSX output remain
- Stage 4 content design rules are complete
- Stage 5 index snippet uses `src` not `component`

- [ ] **Step 3: Commit**

```bash
git add ~/.claude/skills/curate/skill.md
git commit -m "docs: add stage 5 self-review and complete curate skill rewrite for JSON"
```

---

### Task 7: Update Stage 2.5 Diff to Handle JSON Existing Files

The Gemini stage 2.5 diff currently only compares against existing JSX. After migration starts, existing files may be JSON. Update the script to handle both.

**Files:**
- Modify: `scripts/curate.mjs` (the `runStage2_5` function, lines ~464-545)

- [ ] **Step 1: Read the current runStage2_5 function**

Read `scripts/curate.mjs` lines 464-545 to confirm current implementation.

- [ ] **Step 2: Update runStage2_5 to handle JSON files**

Replace the `runStage2_5` function. Key changes:
- Look for both `.jsx` and `.json` files in the type directory
- When comparing against JSON, send the JSON structure (not raw JSX) to Gemini
- Adjust the prompt to understand both formats

```js
async function runStage2_5() {
  const extraction = JSON.parse(readFileSync(resolve(curateDir, 'stage1-extraction.json'), 'utf-8'));

  // Find existing file for this course (JSX or JSON)
  const contentDir = resolve(`src/content/${subject}`);
  const typeDir = contentType === 'course' ? 'courses' : contentType === 'lab' ? 'labs' : contentType === 'seminar' ? 'seminars' : 'test';
  const typeDirPath = resolve(contentDir, typeDir);
  
  if (!existsSync(typeDirPath)) {
    console.log('  No existing content directory found. Treating as new content.');
    writeFileSync(resolve(curateDir, 'stage2.5-diff.json'), JSON.stringify({ isNew: true, decisions: [] }, null, 2));
    return;
  }

  const existingFiles = readdirSync(typeDirPath).filter(f => f.endsWith('.jsx') || f.endsWith('.json'));

  if (existingFiles.length === 0) {
    console.log('  No existing files found. Treating as new content.');
    writeFileSync(resolve(curateDir, 'stage2.5-diff.json'), JSON.stringify({ isNew: true, decisions: [] }, null, 2));
    return;
  }

  // Match by number in filename
  console.log(`  Found existing files: ${existingFiles.join(', ')}`);
  const numberMatch = pdfName.match(/(\d+)/);
  const targetFile = numberMatch
    ? existingFiles.find(f => f.includes(numberMatch[1].padStart(2, '0')))
    : existingFiles[0];

  if (!targetFile) {
    console.log('  Could not match to an existing file. Treating as new content.');
    writeFileSync(resolve(curateDir, 'stage2.5-diff.json'), JSON.stringify({ isNew: true, decisions: [] }, null, 2));
    return;
  }

  const existingContent = readFileSync(resolve(typeDirPath, targetFile), 'utf-8');
  const isJSON = targetFile.endsWith('.json');

  const prompt = `You are comparing extracted PDF content against an existing ${isJSON ? 'JSON course' : 'JSX course'} file to decide what needs updating.

EXTRACTED CONTENT (from PDF):
${JSON.stringify(extraction, null, 2)}

EXISTING ${isJSON ? 'JSON' : 'JSX'} FILE (${targetFile}):
${existingContent}

For each section in the extracted content, decide:
- "keep" — the existing file covers this section accurately
- "rewrite" — the existing file is missing content, has errors, or is incomplete
- "new" — this section doesn't exist in the current file at all

${isJSON ? 'For JSON files, compare against the steps and their blocks. A section maps to one or more steps.' : 'For JSX files, compare against the Section components and their content.'}

Output valid JSON only:
{
  "existingFile": "${targetFile}",
  "existingFormat": "${isJSON ? 'json' : 'jsx'}",
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
```

- [ ] **Step 3: Verify the script still runs**

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide" && node scripts/curate.mjs status
```

Expected: prints current pipeline statuses without errors.

- [ ] **Step 4: Commit**

```bash
git add scripts/curate.mjs
git commit -m "fix: stage 2.5 diff handles both JSON and JSX existing files"
```

---

### Task 8: Smoke Test — Dry Run the Updated Pipeline

Verify the complete updated pipeline works end-to-end by checking that the skill file is coherent, all referenced schemas match the block registry, and the instructions produce valid output.

**Files:**
- Read-only verification of all modified files

- [ ] **Step 1: Verify curate skill is complete and coherent**

Read `~/.claude/skills/curate/skill.md` end-to-end. Check:
- [ ] All 6 steps present
- [ ] No JSX references remain in output instructions
- [ ] Stage 4 block type table matches the registry in `src/components/blocks/registry.js`
- [ ] Stage 5 index snippet format matches what `SubjectPage.jsx` expects

- [ ] **Step 2: Verify content skills have JSON sections**

Read each skill and confirm JSON section exists:
- [ ] `~/.claude/skills/adding-course/skill.md` — has "JSON Course Format" section
- [ ] `~/.claude/skills/creating-os-tests/skill.md` — has "JSON Test Format" section
- [ ] `~/.claude/skills/creating-pa-tests/skill.md` — has "JSON Test Format" section
- [ ] `~/.claude/skills/adding-lab-exercises/skill.md` — has "JSON Lab Format" section
- [ ] `~/.claude/skills/creating-seminar-evaluations/skill.md` — has "JSON Seminar Format" section

- [ ] **Step 3: Verify block type table matches registry**

Cross-reference the block types listed in the curate skill's stage 4 against the actual registry:

Registry (`src/components/blocks/registry.js`):
```
learn, definition, think, quiz, code, callout, table, list, image, diagram,
lecture, lecture-video, lecture-exam, animation, code-challenge, terminal
```

Curate skill stage 4 table must list exactly these 16 types with correct props matching each component's actual interface.

- [ ] **Step 4: Verify sample JSON matches schema described in skills**

Read `src/content/os/courses/course-01-sample.json` and `src/content/os/tests/test-sample.json`. Confirm they match the schemas documented in the updated skills.

- [ ] **Step 5: Build check**

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide" && npm run build
```

Expected: clean build (no code was changed, only skill docs and one script function).

- [ ] **Step 6: Commit and push**

```bash
git add -A
git commit -m "feat: complete pipeline JSON update — curate skill + content skills + stage 2.5"
git push origin content-redesign
```
