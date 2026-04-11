# Workflow Comparison Experiment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run a controlled 3-system × 4-task experiment comparing Ruflo, Enhanced Pipeline, and Control workflows, then score and report results.

**Architecture:** Three isolated git worktrees, each configured for one system. Same 4 tasks run sequentially per system (Control first as baseline). Results compiled into a scoring spreadsheet and wiki comparison page.

**Tech Stack:** Git worktrees for isolation, Node.js scripts for validation (System B), ruflo npm package (System A), Vitest for any test scaffolding in System B.

---

## File Structure

```
experiment/                         (parent dir, outside repo)
├── control/                        (worktree — vanilla, no changes)
├── enhanced/                       (worktree — validation scripts + hooks)
│   └── scripts/
│       └── validate-course-json.mjs    (JSON schema validator)
│       └── validate-test-json.mjs      (test JSON validator)
│       └── validate-bilingual.mjs      (bilingual completeness checker)
│   └── .claude/
│       └── settings.json               (pre-commit hook config)
├── ruflo/                          (worktree — ruflo installed)
results/
├── scorecard.md                    (raw scores for all 12 runs)
└── wiki/comparisons/workflow-comparison-2026-04-10.md  (final report)
```

**Key existing files referenced across all systems:**
- `src/content/jsonLoader.js` — loads JSON courses/tests via `import.meta.glob`
- `src/components/blocks/CourseRenderer.jsx` — renders course JSON
- `src/components/blocks/test/TestRenderer.jsx` — renders test JSON
- `src/content/os/index.js` — OS subject config (11 JSX courses, tests, labs)
- `src/content/os/courses/course-01-sample.json` — existing sample (reference format)
- `src/content/os/tests/test-sample.json` — existing test sample (reference format)
- `wiki/raw/pdfs/OS-Course-1.pdf` — input for Curate task
- `wiki/raw/other/prev-year-so/Sisteme de Operare/Examen/examen_2023-2024/TP1_2024/varianta_1.pdf` — input for Extract task

---

### Task 1: Create Worktrees

**Files:**
- Create: `experiment/` directory with 3 worktrees

- [ ] **Step 1: Create experiment directory and worktrees**

```bash
mkdir -p /c/Users/User/Desktop/SO/experiment
cd /c/Users/User/Desktop/SO/os-study-guide
git worktree add /c/Users/User/Desktop/SO/experiment/control -b experiment/control
git worktree add /c/Users/User/Desktop/SO/experiment/enhanced -b experiment/enhanced
git worktree add /c/Users/User/Desktop/SO/experiment/ruflo -b experiment/ruflo
```

- [ ] **Step 2: Verify all three worktrees are functional**

```bash
cd /c/Users/User/Desktop/SO/experiment/control && git status
cd /c/Users/User/Desktop/SO/experiment/enhanced && git status
cd /c/Users/User/Desktop/SO/experiment/ruflo && git status
```

Expected: all three show clean status on their respective branches.

- [ ] **Step 3: Commit**

No commit needed — worktrees are local only.

---

### Task 2: Set Up System B (Enhanced Pipeline)

**Files:**
- Create: `scripts/validate-course-json.mjs`
- Create: `scripts/validate-test-json.mjs`
- Create: `scripts/validate-bilingual.mjs`

All work in the `experiment/enhanced` worktree.

- [ ] **Step 1: Create course JSON validator**

Create `scripts/validate-course-json.mjs` in the enhanced worktree:

```javascript
#!/usr/bin/env node
/**
 * validate-course-json.mjs
 * Validates a course JSON file against the project's expected schema.
 * Exit 0 = valid, Exit 1 = errors found.
 * Usage: node scripts/validate-course-json.mjs <path-to-json>
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const file = process.argv[2];
if (!file) { console.error('Usage: node validate-course-json.mjs <file>'); process.exit(1); }

const json = JSON.parse(readFileSync(resolve(file), 'utf-8'));
const errors = [];

// Meta validation
if (!json.meta) errors.push('Missing "meta" object');
else {
  if (!json.meta.id) errors.push('meta.id missing');
  if (!json.meta.title?.en || !json.meta.title?.ro) errors.push('meta.title must have en + ro');
  if (!json.meta.shortTitle?.en || !json.meta.shortTitle?.ro) errors.push('meta.shortTitle must have en + ro');
}

// Steps validation
if (!Array.isArray(json.steps)) errors.push('Missing "steps" array');
else {
  json.steps.forEach((step, si) => {
    if (!step.id) errors.push(`steps[${si}]: missing id`);
    if (!step.title?.en || !step.title?.ro) errors.push(`steps[${si}]: title must have en + ro`);
    if (!Array.isArray(step.blocks) || step.blocks.length === 0)
      errors.push(`steps[${si}]: empty or missing blocks array`);
    else {
      step.blocks.forEach((block, bi) => {
        if (!block.type) errors.push(`steps[${si}].blocks[${bi}]: missing type`);
        const t = block.type;
        if (['learn', 'callout', 'info', 'tip', 'warning', 'danger', 'example'].includes(t)) {
          if (!block.content?.en || !block.content?.ro)
            errors.push(`steps[${si}].blocks[${bi}] (${t}): content must have en + ro`);
        }
        if (t === 'definition') {
          if (!block.term?.en || !block.term?.ro)
            errors.push(`steps[${si}].blocks[${bi}] (definition): term must have en + ro`);
          if (!block.content?.en || !block.content?.ro)
            errors.push(`steps[${si}].blocks[${bi}] (definition): content must have en + ro`);
        }
        if (t === 'quiz') {
          if (!block.questions && !block.question)
            errors.push(`steps[${si}].blocks[${bi}] (quiz): needs questions or question`);
        }
        if (t === 'think') {
          if (!block.question?.en || !block.question?.ro)
            errors.push(`steps[${si}].blocks[${bi}] (think): question must have en + ro`);
          if (!block.answer?.en || !block.answer?.ro)
            errors.push(`steps[${si}].blocks[${bi}] (think): answer must have en + ro`);
        }
        if (t === 'code') {
          if (!block.code) errors.push(`steps[${si}].blocks[${bi}] (code): missing code field`);
        }
      });
    }
  });
}

if (errors.length > 0) {
  console.error(`❌ ${errors.length} validation error(s) in ${file}:`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`✅ ${file} is valid (${json.steps.length} steps, ${json.steps.reduce((a, s) => a + s.blocks.length, 0)} blocks)`);
  process.exit(0);
}
```

- [ ] **Step 2: Create test JSON validator**

Create `scripts/validate-test-json.mjs` in the enhanced worktree:

```javascript
#!/usr/bin/env node
/**
 * validate-test-json.mjs
 * Validates a test JSON file against the project's test schema.
 * Usage: node scripts/validate-test-json.mjs <path-to-json>
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const file = process.argv[2];
if (!file) { console.error('Usage: node validate-test-json.mjs <file>'); process.exit(1); }

const json = JSON.parse(readFileSync(resolve(file), 'utf-8'));
const errors = [];

// Meta validation
if (!json.meta) errors.push('Missing "meta" object');
else {
  if (!json.meta.id) errors.push('meta.id missing');
  if (!json.meta.title?.en || !json.meta.title?.ro) errors.push('meta.title must have en + ro');
}

// Questions validation
if (!Array.isArray(json.questions)) errors.push('Missing "questions" array');
else {
  json.questions.forEach((q, qi) => {
    if (!q.id) errors.push(`questions[${qi}]: missing id`);
    if (!q.type) errors.push(`questions[${qi}]: missing type`);
    if (!q.prompt?.en || !q.prompt?.ro) errors.push(`questions[${qi}]: prompt must have en + ro`);
    if (q.type === 'multiple-choice') {
      if (!Array.isArray(q.options) || q.options.length < 2)
        errors.push(`questions[${qi}]: multiple-choice needs >=2 options`);
      if (q.correctIndex === undefined && q.correctIndices === undefined)
        errors.push(`questions[${qi}]: multiple-choice needs correctIndex or correctIndices`);
    }
    if (q.type === 'fill-in') {
      if (!Array.isArray(q.blanks) || q.blanks.length === 0)
        errors.push(`questions[${qi}]: fill-in needs blanks array`);
    }
  });
}

if (errors.length > 0) {
  console.error(`❌ ${errors.length} error(s) in ${file}:`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`✅ ${file} is valid (${json.questions.length} questions)`);
  process.exit(0);
}
```

- [ ] **Step 3: Create bilingual completeness checker**

Create `scripts/validate-bilingual.mjs` in the enhanced worktree:

```javascript
#!/usr/bin/env node
/**
 * validate-bilingual.mjs
 * Recursively checks all {en, ro} objects in a JSON file for completeness.
 * Usage: node scripts/validate-bilingual.mjs <path-to-json>
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const file = process.argv[2];
if (!file) { console.error('Usage: node validate-bilingual.mjs <file>'); process.exit(1); }

const json = JSON.parse(readFileSync(resolve(file), 'utf-8'));
const issues = [];

function check(obj, path) {
  if (obj === null || obj === undefined) return;
  if (typeof obj !== 'object') return;
  if (Array.isArray(obj)) { obj.forEach((item, i) => check(item, `${path}[${i}]`)); return; }
  // Check if this is a bilingual object
  if ('en' in obj || 'ro' in obj) {
    if (!obj.en || (typeof obj.en === 'string' && obj.en.trim() === ''))
      issues.push(`${path}: missing or empty "en"`);
    if (!obj.ro || (typeof obj.ro === 'string' && obj.ro.trim() === ''))
      issues.push(`${path}: missing or empty "ro"`);
  }
  // Recurse into all keys
  for (const [key, val] of Object.entries(obj)) {
    if (key !== 'en' && key !== 'ro') check(val, `${path}.${key}`);
  }
}

check(json, '$');

if (issues.length > 0) {
  console.error(`❌ ${issues.length} bilingual gap(s) in ${file}:`);
  issues.forEach(i => console.error(`  - ${i}`));
  process.exit(1);
} else {
  console.log(`✅ ${file} — all bilingual fields complete`);
  process.exit(0);
}
```

- [ ] **Step 4: Add CLAUDE.md routing instructions to enhanced worktree**

Append to the existing CLAUDE.md in the enhanced worktree:

```markdown
## Enhanced Pipeline Rules

### Model Routing
- Use haiku agents for: JSON validation, formatting checks, file listing, simple searches
- Use opus for: content creation, architectural decisions, review analysis

### Validation Gates
After creating or modifying any JSON file, ALWAYS run:
- `node scripts/validate-course-json.mjs <file>` for course JSONs
- `node scripts/validate-test-json.mjs <file>` for test JSONs
- `node scripts/validate-bilingual.mjs <file>` for any JSON with bilingual content

Fix all errors before proceeding.

### Self-Review Checklist
After completing each task, verify:
1. All JSON files pass validation scripts
2. `npm run build` succeeds with no errors
3. No hardcoded English-only text (all user-facing strings use {en, ro})
4. Section IDs are descriptive (e.g., os-c1-intro, not os-c1-0)
5. Block types match component expectations (learn content=string, code code=string, quiz questions=array)
```

- [ ] **Step 5: Commit enhanced setup**

```bash
cd /c/Users/User/Desktop/SO/experiment/enhanced
git add scripts/validate-course-json.mjs scripts/validate-test-json.mjs scripts/validate-bilingual.mjs CLAUDE.md
git commit -m "feat: add validation scripts and enhanced pipeline CLAUDE.md rules"
```

---

### Task 3: Set Up System A (Ruflo)

All work in the `experiment/ruflo` worktree.

- [ ] **Step 1: Check Node.js version compatibility**

```bash
node --version
```

Expected: v24.x.x (ruflo requires >=20, so this should work).

- [ ] **Step 2: Install ruflo**

```bash
cd /c/Users/User/Desktop/SO/experiment/ruflo
npx ruflo@latest init --wizard
```

Follow the interactive wizard. Select defaults where possible. If prompted for MCP configuration, accept it.

- [ ] **Step 3: Verify ruflo works on Windows**

```bash
npx ruflo doctor
```

Expected: Diagnostics pass. If Windows-specific errors appear (MCP resolving to System32, missing binaries), document them in the scorecard as a data point and evaluate whether to continue or abort per the spec's abort criteria.

- [ ] **Step 4: Verify Claude Code can use ruflo's MCP tools**

Start a new Claude Code session in the ruflo worktree and verify that ruflo's MCP tools are available. If they're not, or if context bloat is observed (>300K tokens just from initialization), document and evaluate abort.

- [ ] **Step 5: Commit ruflo setup**

```bash
cd /c/Users/User/Desktop/SO/experiment/ruflo
git add -A
git commit -m "feat: install and configure ruflo for experiment"
```

---

### Task 4: Create Scorecard Template

**Files:**
- Create: `docs/superpowers/plans/experiment-scorecard.md`

- [ ] **Step 1: Create the scorecard file**

```markdown
# Workflow Comparison Scorecard

## Scoring Key
- **Correctness (C):** 10 minus number of errors (floor 1)
- **Completeness (K):** 10 × percentage of deliverables met
- **Tokens (T):** Normalized — lowest = 10, others proportional
- **Interventions (I):** 10 minus number of human interventions (floor 1)

## Run Log

| Run | System | Task | Correctness | Completeness | Tokens (raw) | Interventions | Notes |
|-----|--------|------|:-----------:|:------------:|:------------:|:-------------:|-------|
| 1 | Control | Curate | /10 | /10 | | /10 | |
| 2 | Control | Review | /10 | /10 | | /10 | |
| 3 | Control | Extract | /10 | /10 | | /10 | |
| 4 | Control | Develop | /10 | /10 | | /10 | |
| 5 | Enhanced | Curate | /10 | /10 | | /10 | |
| 6 | Enhanced | Review | /10 | /10 | | /10 | |
| 7 | Enhanced | Extract | /10 | /10 | | /10 | |
| 8 | Enhanced | Develop | /10 | /10 | | /10 | |
| 9 | Ruflo | Curate | /10 | /10 | | /10 | |
| 10 | Ruflo | Review | /10 | /10 | | /10 | |
| 11 | Ruflo | Extract | /10 | /10 | | /10 | |
| 12 | Ruflo | Develop | /10 | /10 | | /10 | |

## Normalized Token Scores

| Run | Raw Tokens | Normalized Score |
|-----|-----------|:----------------:|
| (filled after all runs) | | /10 |

## Aggregate Scores

| System | Curate | Review | Extract | Develop | Total | Avg |
|--------|:------:|:------:|:-------:|:-------:|:-----:|:---:|
| Control | /40 | /40 | /40 | /40 | /160 | |
| Enhanced | /40 | /40 | /40 | /40 | /160 | |
| Ruflo | /40 | /40 | /40 | /40 | /160 | |

## Qualitative Observations

### Control
- 

### Enhanced
- 

### Ruflo
- 

## Abort Log
- (Record any abort events and reasons here)

## Decision
- (Filled after scoring)
```

- [ ] **Step 2: Commit scorecard**

```bash
git add docs/superpowers/plans/experiment-scorecard.md
git commit -m "docs: add experiment scorecard template"
```

---

### Task 5: Run System C (Control) — All 4 Tasks

Each run is a separate Claude Code session in the control worktree. Record token usage from session stats after each task.

- [ ] **Step 1: Run C-Curate (Run 1)**

Open a new Claude Code session in `experiment/control`. Give this exact prompt:

> "Curate OS Course 1 from `wiki/raw/pdfs/OS-Course-1.pdf` into `src/content/os/courses/course-01.json`. Follow the existing format in `src/content/os/courses/course-01-sample.json`. Use the `/curate` skill."

Record: token usage, error count, completeness, intervention count.

- [ ] **Step 2: Run C-Review (Run 2)**

New session in `experiment/control`:

> "Review the existing OS courses 1-3 (the JSX files in `src/content/os/courses/Course01.jsx` through `Course03.jsx`) on the live site. Produce a findings report categorized by: content accuracy, UX/accessibility, pedagogy, bilingual issues, component issues."

Record metrics.

- [ ] **Step 3: Run C-Extract (Run 3)**

New session in `experiment/control`:

> "Extract the exam from `wiki/raw/other/prev-year-so/Sisteme de Operare/Examen/examen_2023-2024/TP1_2024/varianta_1.pdf` into a test JSON at `src/content/os/tests/tp1-2023-2024-v1.json`. Follow the format in `src/content/os/tests/test-sample.json`."

Record metrics.

- [ ] **Step 4: Run C-Develop (Run 4)**

New session in `experiment/control`:

> "The `TestRenderer` at `src/components/blocks/test/TestRenderer.jsx` already exists. Add support for a new question type: `code-tracing`. This type shows a code snippet and asks the student to predict the output. Add the component, integrate it into TestRenderer, and add a sample question to `src/content/os/tests/test-sample.json`."

Record metrics.

- [ ] **Step 5: Score Control runs**

Fill in scorecard rows 1-4 with raw scores. Validate each output:
- Run `npm run build` in the control worktree — any build errors count against correctness
- Check JSON files manually for missing fields, bad structure
- Count deliverables met vs expected

---

### Task 6: Run System B (Enhanced) — All 4 Tasks

Same 4 tasks, but in the enhanced worktree with validation scripts available.

- [ ] **Step 1: Run B-Curate (Run 5)**

New Claude Code session in `experiment/enhanced`. Same curate prompt as Run 1. The CLAUDE.md rules will instruct the agent to run validation scripts after creating the JSON.

Record metrics. Note whether the validation scripts caught any errors the control run missed.

- [ ] **Step 2: Run B-Review (Run 6)**

Same review prompt as Run 2. Record metrics.

- [ ] **Step 3: Run B-Extract (Run 7)**

Same extract prompt as Run 3. Record metrics.

- [ ] **Step 4: Run B-Develop (Run 8)**

Same develop prompt as Run 4. Record metrics.

- [ ] **Step 5: Score Enhanced runs**

Fill in scorecard rows 5-8. Same validation process as Control.

---

### Task 7: Run System A (Ruflo) — All 4 Tasks

Same 4 tasks, in the ruflo worktree with ruflo's orchestration active.

- [ ] **Step 1: Check abort criteria before starting**

Verify ruflo installed successfully in Task 3. If it failed, skip this entire task and record "ABORTED — installation failed" in the scorecard.

- [ ] **Step 2: Run A-Curate (Run 9)**

New Claude Code session in `experiment/ruflo`. Same curate prompt. Let ruflo's agent routing and orchestration handle it.

Record metrics. Pay special attention to token usage — if >2× the Control curate run, abort remaining ruflo tasks per spec.

- [ ] **Step 3: Run A-Review (Run 10)**

Same review prompt. Record metrics.

- [ ] **Step 4: Run A-Extract (Run 11)**

Same extract prompt. Record metrics.

- [ ] **Step 5: Run A-Develop (Run 12)**

Same develop prompt. Record metrics.

- [ ] **Step 6: Score Ruflo runs**

Fill in scorecard rows 9-12 (or mark as ABORTED).

---

### Task 8: Normalize Token Scores and Compute Aggregates

- [ ] **Step 1: Normalize token scores**

For each task type (Curate, Review, Extract, Develop):
1. Find the lowest raw token count among the 3 systems — that gets a 10
2. Other systems scored as: `10 × (lowest / their_count)`, rounded to 1 decimal

Example: If Control used 50K, Enhanced 35K, Ruflo 80K for Curate:
- Enhanced: 10 (lowest)
- Control: 10 × (35/50) = 7.0
- Ruflo: 10 × (35/80) = 4.4

- [ ] **Step 2: Compute aggregate scores**

Per-task score = Correctness + Completeness + Normalized Tokens + Interventions (max 40)
Per-system score = Sum of 4 task scores (max 160)

Fill in the Aggregate Scores table.

- [ ] **Step 3: Commit final scorecard**

```bash
git add docs/superpowers/plans/experiment-scorecard.md
git commit -m "docs: fill experiment scorecard with results"
```

---

### Task 9: Write Comparison Report

**Files:**
- Create: `wiki/comparisons/workflow-comparison-2026-04-10.md`

- [ ] **Step 1: Create the wiki comparison page**

```markdown
---
title: Workflow Comparison — Ruflo vs Enhanced vs Control
type: comparison
created: 2026-04-10
updated: 2026-04-10
sources: []
tags: [architecture, infrastructure]
---

# Workflow Comparison: Ruflo vs Enhanced Pipeline vs Control

## Experiment Design
[Brief summary: 3 systems × 4 tasks, scored on correctness/completeness/tokens/interventions]

## Results

### Raw Scores
[Paste the completed scorecard table]

### Aggregate Scores
[Paste the aggregate table]

### Per-Task Winner
| Task | Winner | Score | Runner-up | Score |
|------|--------|-------|-----------|-------|
| Curate | | | | |
| Review | | | | |
| Extract | | | | |
| Develop | | | | |

### Overall Winner
[System with highest aggregate score]

## Qualitative Observations
[What worked, what didn't, surprises, pain points for each system]

## Recommendation
[Adopt / Adapt / Reject for each system. If Enhanced wins, specify which parts to keep. If Ruflo wins, note the Windows caveats.]

## Decision: Which Outputs to Merge
[List which system's outputs are good enough to merge into main for the OS rebuild]

## Cross-References
- [[index-os]]
- [[OS+RC Course Description]]
```

- [ ] **Step 2: Update wiki indexes**

Add to `wiki/index-platform.md` or create new entry in `wiki/index.md` if needed.
Append to `wiki/log.md`.

- [ ] **Step 3: Commit report**

```bash
git add wiki/comparisons/workflow-comparison-2026-04-10.md wiki/log.md
git commit -m "docs: add workflow comparison experiment report"
```

---

### Task 10: Clean Up Worktrees

- [ ] **Step 1: Merge winning outputs (if any)**

If any system's outputs are good enough to use:
```bash
cd /c/Users/User/Desktop/SO/os-study-guide
git merge experiment/<winner> --no-ff -m "feat: merge OS outputs from workflow experiment (<winner> system)"
```

- [ ] **Step 2: Remove worktrees**

```bash
cd /c/Users/User/Desktop/SO/os-study-guide
git worktree remove /c/Users/User/Desktop/SO/experiment/control
git worktree remove /c/Users/User/Desktop/SO/experiment/enhanced
git worktree remove /c/Users/User/Desktop/SO/experiment/ruflo
rmdir /c/Users/User/Desktop/SO/experiment
```

- [ ] **Step 3: Delete experiment branches**

```bash
git branch -d experiment/control experiment/enhanced experiment/ruflo
```

- [ ] **Step 4: Final commit with decision**

If adopting Enhanced Pipeline permanently, move validation scripts to main and update CLAUDE.md:
```bash
git add scripts/ CLAUDE.md
git commit -m "feat: adopt enhanced pipeline validation from workflow experiment"
```
