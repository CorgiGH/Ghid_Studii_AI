# Review Pipeline + Workflow System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-agent review pipeline (`/review-site`), a workflow router (`/help-me`), and document all skills in the wiki.

**Architecture:** Bottom-up: skill entity wiki pages → Workflow Playbook → `/help-me` skill → screenshot script → Review Playbook → `/review-site` skill → curate skill update. Wiki pages provide the knowledge base; skills provide the user-facing interface.

**Tech Stack:** Markdown (wiki pages), Superpowers skills (markdown skill files), Puppeteer (screenshots), Gemini API (visual review).

**Spec:** `docs/superpowers/specs/2026-04-09-review-pipeline-design.md`

---

### Task 1: Skill Entity Wiki Pages (14 pages)

**Files:**
- Create: `wiki/entities/skill-curate.md`
- Create: `wiki/entities/skill-adding-course.md`
- Create: `wiki/entities/skill-adding-subject.md`
- Create: `wiki/entities/skill-adding-lab-exercises.md`
- Create: `wiki/entities/skill-creating-seminar-evaluations.md`
- Create: `wiki/entities/skill-creating-pa-tests.md`
- Create: `wiki/entities/skill-creating-os-tests.md`
- Create: `wiki/entities/skill-review-site.md`
- Create: `wiki/entities/skill-help-me.md`
- Create: `wiki/entities/skill-commit.md`
- Create: `wiki/entities/skill-commit-push-pr.md`
- Create: `wiki/entities/skill-clean-gone.md`
- Create: `wiki/entities/skill-code-review.md`
- Create: `wiki/entities/skill-frontend-design.md`

Each skill entity page documents what the skill does, when to use it, what you need, and how it works. Read the actual skill file before writing each entity page to get accurate details.

- [ ] **Step 1: Read each skill file to gather accurate info**

Read the following skill files to extract: purpose, trigger conditions, parameters, and key steps:
- `~/.claude/skills/curate/skill.md`
- `~/.claude/skills/adding-course/skill.md`
- `~/.claude/skills/adding-subject/skill.md`
- `~/.claude/skills/adding-lab-exercises/skill.md`
- `~/.claude/skills/creating-seminar-evaluations/skill.md`
- `~/.claude/skills/creating-pa-tests/skill.md`
- `~/.claude/skills/creating-os-tests/skill.md`

For plugin skills (commit, commit-push-pr, clean_gone, code-review, frontend-design), check:
- `~/.claude/plugins/cache/claude-plugins-official/superpowers/` for superpowers skills
- `~/.claude/plugins/cache/claude-plugins-official/commit-commands/` for commit skills
- `~/.claude/plugins/cache/claude-plugins-official/code-review/` for code-review
- `~/.claude/plugins/cache/claude-plugins-official/frontend-design/` for frontend-design

Use `ls` and `find` to locate exact paths if the above don't match.

- [ ] **Step 2: Create skill-curate.md**

```markdown
---
title: Skill — Curate
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — Curate

**Invoke:** `/curate <subject> <source-pdf>`
**Purpose:** Convert lecture PDFs into interactive JSON course content using a 6-stage pipeline with Gemini extraction and evidence-based pedagogy.

## When to Use
- Converting a lecture PDF into a study guide course
- Re-curating existing JSX courses into JSON format
- Processing any raw educational material into interactive content

## What You Need
- A PDF file in `src/content/<subject>/source/`
- The subject slug (e.g., `oop`, `pa`, `os`)
- Course number to assign

## What It Does
1. **Extract:** Runs Gemini to extract structured content from PDF
2. **Discover:** Finds related resources (videos, tests, bibliography)
3. **Triage:** Evaluates diagrams for inclusion via Haiku agent
4. **Draft:** Generates JSON course following pedagogy rules (5-phase learning rhythm)
5. **Review:** Self-reviews for quality, validates JSON
6. **Deploy:** Moves to final location, updates index.js, builds, commits, pushes

## Example
```
/curate oop src/content/oop/source/website/Course-7.pdf
```
Produces `src/content/oop/courses/course-07.json` with interactive blocks, quizzes, and code exercises.

## See Also
[[Skill — Adding Course]], [[Workflow Playbook]], [[Pedagogy Playbook]]
```

- [ ] **Step 3: Create skill-adding-course.md**

```markdown
---
title: Skill — Adding Course
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — Adding Course

**Invoke:** `/adding-course`
**Purpose:** Add a new course/lecture to an existing subject in the study guide. Handles boilerplate, registration, and section ID conventions.

## When to Use
- Adding a new Course N to an existing subject
- User provides lecture material or asks to add a course

## What You Need
- The subject slug and course number
- Lecture content (PDF, notes, or direct instructions)

## What It Does
1. Creates the course file (JSX or JSON depending on subject format)
2. Sets up Section components with proper IDs (descriptive, e.g., `c1-intro`)
3. Registers the course in `src/content/<subject>/index.js` with metadata (title, shortTitle, sectionCount, metaId, src)
4. Uses `t()` helper for bilingual content

## Example
Adding Course 8 to OOP — creates the component file and adds the lazy import entry to `src/content/oop/index.js`.

## See Also
[[Skill — Curate]], [[Workflow Playbook]]
```

- [ ] **Step 4: Create skill-adding-subject.md**

```markdown
---
title: Skill — Adding Subject
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — Adding Subject

**Invoke:** `/adding-subject`
**Purpose:** Create a new university subject from scratch — directory structure, index file, registry entry, and practice page.

## When to Use
- Setting up a brand new discipline (e.g., "Data Structures", "Databases")
- User asks to add a new subject to the study guide

## What You Need
- Subject name and slug (e.g., `ds` for Data Structures)
- Year and semester (e.g., `y2s1`)

## What It Does
1. Creates `src/content/<slug>/` directory structure
2. Creates `index.js` with metadata and empty courses/tests arrays
3. Creates `practice/Practice.jsx` placeholder
4. Registers in `src/content/registry.js` (subjects array + yearSemesters)
5. Sets up source material directories

## Example
```
/adding-subject
```
Then specify: name="Data Structures", slug="ds", year/semester="y2s1"

## See Also
[[Skill — Adding Course]], [[Workflow Playbook]]
```

- [ ] **Step 5: Create skill-adding-lab-exercises.md**

```markdown
---
title: Skill — Adding Lab Exercises
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — Adding Lab Exercises

**Invoke:** `/adding-lab-exercises`
**Purpose:** Convert raw HTML lab sheets or PDFs into interactive lab exercise pages for the study guide.

## When to Use
- Converting lab PDFs or raw HTML into interactive exercises
- Adding new lab weeks to any subject

## What You Need
- Lab sheet source (PDF or HTML)
- Subject slug and lab week number

## What It Does
1. Reads the lab sheet content
2. Converts exercises into interactive components (CodeChallenge, LinuxTerminal, Toggle Q&A)
3. Creates the lab page with proper structure
4. Registers in the subject's index

## See Also
[[Skill — Curate]], [[Skill — Adding Course]], [[Workflow Playbook]]
```

- [ ] **Step 6: Create skill-creating-seminar-evaluations.md**

```markdown
---
title: Skill — Creating Seminar Evaluations
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — Creating Seminar Evaluations

**Invoke:** `/creating-seminar-evaluations`
**Purpose:** Create evaluation/practice pages from university seminar exercise sheets.

## When to Use
- Processing seminar PDFs into practice problems
- Adding new seminar weeks to the study guide

## What You Need
- Seminar exercise sheet (PDF)
- Subject slug and seminar week number

## What It Does
1. Reads the seminar exercise sheet
2. Creates practice problems with interactive components
3. Adds solutions as Toggle Q&A blocks
4. Registers in the subject's content structure

## See Also
[[Skill — Curate]], [[Workflow Playbook]]
```

- [ ] **Step 7: Create skill-creating-pa-tests.md**

```markdown
---
title: Skill — Creating PA Tests
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — Creating PA Tests

**Invoke:** `/creating-pa-tests`
**Purpose:** Add PA (Algorithm Design) test/exam PDFs as interactive test pages in the study guide.

## When to Use
- Adding previous-year PA exams
- Processing PA test PDFs into interactive format

## What You Need
- PA test/exam PDF
- Year, session type (midterm/final/retake), variant (A/B)

## What It Does
1. Extracts questions from the PDF
2. Creates JSON test file with question types (multiple-choice, open-ended, code-writing)
3. Sets metadata (year, type, session, duration, points)
4. Registers in `src/content/pa/index.js` tests array
5. Builds and validates

## See Also
[[Skill — Creating OS Tests]], [[Workflow Playbook]]
```

- [ ] **Step 8: Create skill-creating-os-tests.md**

```markdown
---
title: Skill — Creating OS Tests
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — Creating OS Tests

**Invoke:** `/creating-os-tests`
**Purpose:** Add OS (Operating Systems) test/exam content to the study guide.

## When to Use
- Adding OS test PDFs or exam practice
- Expanding the OS tests tab

## What You Need
- OS test/exam PDF
- Year, session type, variant

## What It Does
1. Extracts questions from the PDF
2. Creates test page with appropriate question components
3. Sets metadata and registers in OS subject index
4. Builds and validates

## See Also
[[Skill — Creating PA Tests]], [[Workflow Playbook]]
```

- [ ] **Step 9: Create skill-review-site.md**

```markdown
---
title: Skill — Review Site
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — Review Site

**Invoke:** `/review-site [scope]`
**Purpose:** Multi-agent quality review — audits pages against UX research, pedagogy research, and visual quality using parallel specialist agents.

## When to Use
- After curating new content (auto-prompted)
- When you want to check if a page/subject looks and teaches well
- Periodic quality audits of the whole site

## What You Need
- Scope: a page path (e.g., `oop/courses/course-01`), a subject slug (e.g., `oop`), or `all`
- Dev server must be running (script starts it if not)

## What It Does
1. Dispatches 3 agents in parallel:
   - **UX Agent:** Loads UX Playbook, audits source code against 28 UX principles
   - **Pedagogy Agent:** Loads Pedagogy Playbook, audits learning effectiveness
   - **Visual Agent:** Takes 4 screenshots (light/dark × desktop/mobile), sends to Gemini with UX Playbook context
2. Collects 3 reports (max 10 findings each, max 30 total)
3. Presents combined findings to you with severity labels
4. You pick which findings to fix
5. Coding agent implements fixes
6. Inspector agent validates — retries if needed, escalates if same mistake repeated twice

## Example
```
/review-site oop
```
Reviews all OOP content — courses, labs, tests, practice.

## See Also
[[Review Pipeline]], [[Review Playbook]], [[UX Playbook]], [[Pedagogy Playbook]], [[Design Principles]], [[Workflow Playbook]]
```

- [ ] **Step 10: Create skill-help-me.md**

```markdown
---
title: Skill — Help Me
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — Help Me

**Invoke:** `/help-me [what you want to do]`
**Purpose:** Describe what you want to do in plain language and get routed to the right skill with instructions.

## When to Use
- You don't remember which skill to use
- You want to know what's available for a task
- You're not sure what parameters a skill needs

## What You Need
- A description of what you want to accomplish (plain language)

## What It Does
1. Reads the Workflow Playbook from the wiki
2. Matches your description to the right skill(s)
3. Tells you: which skill to use, what you need to provide, what will happen
4. Asks if you want to invoke it now

## Example
```
/help-me I have a new OOP lecture PDF and want to add it to the site
```
→ Recommends `/curate oop <path-to-pdf>`, explains what you need and what happens.

## See Also
[[Workflow Playbook]]
```

- [ ] **Step 11: Create skill-commit.md**

```markdown
---
title: Skill — Commit
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — Commit

**Invoke:** `/commit`
**Purpose:** Create a git commit with a well-formatted message following repository conventions.

## When to Use
- After completing a change that should be committed
- When you want Claude to draft the commit message

## What You Need
- Staged or unstaged changes in the working tree

## What It Does
1. Checks git status and diff
2. Drafts a concise commit message based on the changes
3. Creates the commit

## See Also
[[Skill — Commit Push PR]], [[Workflow Playbook]]
```

- [ ] **Step 12: Create skill-commit-push-pr.md**

```markdown
---
title: Skill — Commit Push PR
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — Commit Push PR

**Invoke:** `/commit-push-pr`
**Purpose:** Commit current changes, push to remote, and open a pull request in one step.

## When to Use
- After completing a feature that's ready for review
- When you want to create a PR from the current branch

## What You Need
- Changes to commit
- A branch (not main, unless you want to push directly)

## What It Does
1. Commits changes with a drafted message
2. Pushes branch to remote
3. Creates a PR via `gh pr create` with title and description

## See Also
[[Skill — Commit]], [[Workflow Playbook]]
```

- [ ] **Step 13: Create skill-clean-gone.md**

```markdown
---
title: Skill — Clean Gone
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — Clean Gone

**Invoke:** `/clean_gone`
**Purpose:** Clean up local git branches that have been deleted on the remote (marked as [gone]).

## When to Use
- After merging PRs and wanting to clean up stale local branches
- Periodic branch hygiene

## What You Need
- Nothing — it auto-detects [gone] branches

## What It Does
1. Lists all local branches marked as [gone] (deleted on remote)
2. Removes associated worktrees if any
3. Deletes the local branches

## See Also
[[Skill — Commit]], [[Workflow Playbook]]
```

- [ ] **Step 14: Create skill-code-review.md**

```markdown
---
title: Skill — Code Review
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — Code Review

**Invoke:** `/code-review [PR number or URL]`
**Purpose:** Review a pull request for correctness, style, and potential issues.

## When to Use
- After a PR is created and needs review
- When you want a second opinion on code changes

## What You Need
- PR number or URL (or current branch if on a PR branch)

## What It Does
1. Reads the PR diff
2. Analyzes changes for bugs, style issues, and improvements
3. Provides structured feedback with specific file/line references

## See Also
[[Skill — Commit Push PR]], [[Workflow Playbook]]
```

- [ ] **Step 15: Create skill-frontend-design.md**

```markdown
---
title: Skill — Frontend Design
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — Frontend Design

**Invoke:** `/frontend-design`
**Purpose:** Create distinctive, production-grade frontend interfaces with high design quality. Generates creative, polished code that avoids generic AI aesthetics.

## When to Use
- Building new web components, pages, or applications
- When visual design quality matters
- Creating UI that needs to look professional and unique

## What You Need
- Description of what to build
- Design preferences or constraints

## What It Does
1. Analyzes the design requirements
2. Generates creative, polished frontend code
3. Uses modern CSS, responsive design, and accessible patterns
4. Avoids generic/template-like output

## See Also
[[UX Playbook]], [[Workflow Playbook]]
```

- [ ] **Step 16: Commit skill entity pages**

```bash
cd C:/Users/User/Desktop/SO/os-study-guide
git add wiki/entities/skill-*.md
git commit -m "docs(wiki): add 14 skill entity pages"
```

Note: wiki is gitignored — this commit will be empty. The files are local-only wiki content. Skip the commit if git says nothing to commit.

---

### Task 2: Skills Index + Router Update

**Files:**
- Create: `wiki/index-skills.md`
- Modify: `wiki/index.md`
- Modify: `wiki/log.md`

- [ ] **Step 1: Create index-skills.md**

```markdown
---
title: Skills Index
type: architecture
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skills Index

## Content Creation

- [[Skill — Curate]] — `/curate` — Full PDF-to-JSON curation pipeline with Gemini + pedagogy
- [[Skill — Adding Course]] — `/adding-course` — Add a course to an existing subject
- [[Skill — Adding Subject]] — `/adding-subject` — Create a new subject from scratch
- [[Skill — Adding Lab Exercises]] — `/adding-lab-exercises` — Convert lab sheets to interactive exercises
- [[Skill — Creating Seminar Evaluations]] — `/creating-seminar-evaluations` — Create seminar practice pages
- [[Skill — Creating PA Tests]] — `/creating-pa-tests` — Add PA exam content
- [[Skill — Creating OS Tests]] — `/creating-os-tests` — Add OS exam content

## Quality & Review

- [[Skill — Review Site]] — `/review-site` — Multi-agent UX + pedagogy + visual review
- [[Skill — Code Review]] — `/code-review` — PR code review

## Workflow

- [[Skill — Help Me]] — `/help-me` — Plain-language task router
- [[Skill — Frontend Design]] — `/frontend-design` — Production-grade UI creation

## Git & Deploy

- [[Skill — Commit]] — `/commit` — Create a git commit
- [[Skill — Commit Push PR]] — `/commit-push-pr` — Commit, push, and open PR
- [[Skill — Clean Gone]] — `/clean_gone` — Clean up deleted remote branches
```

- [ ] **Step 2: Update router index.md**

In `wiki/index.md`, add the skills sub-index line after the UX/UI line and update stats:

Replace:

```markdown
- [[index-uxui]] — UX/UI: 28 principles, 1 playbook, 1 arbiter
- [[index-platform]] — Architecture, UX, infrastructure: 7 pages

## Quick Stats

- Total pages: 97
- Last updated: 2026-04-09
```

With:

```markdown
- [[index-uxui]] — UX/UI: 28 principles, 1 playbook, 1 arbiter
- [[index-skills]] — Skills: 14 skill docs, 1 workflow playbook
- [[index-platform]] — Architecture, UX, infrastructure: 7 pages

## Quick Stats

- Total pages: 115
- Last updated: 2026-04-09
```

- [ ] **Step 3: Append to log.md**

Append to `wiki/log.md`:

```markdown

## [2026-04-09] expand | Skills documentation + review pipeline wiki
- Created 14 skill entity pages in wiki/entities/
- Created [[index-skills]] sub-index
- Created [[Workflow Playbook]], [[Review Pipeline]], [[Review Playbook]]
- Updated router [[Wiki Index|index.md]]
```

- [ ] **Step 4: Update log.md summary**

Replace summary section at top of `wiki/log.md`:

```markdown
## Summary
- **Total operations:** 10
- **Last operation:** 2026-04-09 — Skills documentation + review pipeline
- **Domains touched:** OOP (13 courses, 24 concepts), Platform (7 architecture pages), Pedagogy (15 techniques, 1 playbook), UX/UI (28 concepts, 1 playbook, 1 arbiter), Skills (14 docs, 1 playbook)
- **Pending domains:** OS, PA
```

---

### Task 3: Workflow Playbook + Review Wiki Pages

**Files:**
- Create: `wiki/architecture/Workflow Playbook.md`
- Create: `wiki/architecture/Review Pipeline.md`
- Create: `wiki/architecture/Review Playbook.md`

- [ ] **Step 1: Create Workflow Playbook**

```markdown
---
title: Workflow Playbook
type: architecture
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Workflow Playbook

Task-to-skill router. Describe what you want to do and find the right skill. The [[Skill — Help Me]] skill reads this page automatically — you can also browse it directly.

## I want to add a new lecture/course from a PDF

**Skill:** `/curate <subject> <path-to-pdf>`
**You need:** A PDF in `src/content/<subject>/source/`, the subject slug, course number
**What happens:** 6-stage pipeline extracts content, applies pedagogy rules, generates interactive JSON, deploys, builds, commits
**See:** [[Skill — Curate]]

## I want to add a course without a PDF (manual content)

**Skill:** `/adding-course`
**You need:** Subject slug, course number, content to add
**What happens:** Creates course file with boilerplate, registers in index.js
**See:** [[Skill — Adding Course]]

## I want to create a brand new subject

**Skill:** `/adding-subject`
**You need:** Subject name, slug (e.g., `ds`), year/semester (e.g., `y2s1`)
**What happens:** Creates directory structure, index.js, practice page, registry entry
**See:** [[Skill — Adding Subject]]

## I want to add lab exercises

**Skill:** `/adding-lab-exercises`
**You need:** Lab sheet (PDF or HTML), subject slug, week number
**What happens:** Converts exercises into interactive components, creates lab page
**See:** [[Skill — Adding Lab Exercises]]

## I want to add seminar practice problems

**Skill:** `/creating-seminar-evaluations`
**You need:** Seminar exercise sheet (PDF), subject slug, week number
**What happens:** Creates practice problems with solutions as Toggle Q&A
**See:** [[Skill — Creating Seminar Evaluations]]

## I want to add a PA exam/test

**Skill:** `/creating-pa-tests`
**You need:** PA test PDF, year, session type, variant
**What happens:** Extracts questions, creates interactive JSON test, registers in index
**See:** [[Skill — Creating PA Tests]]

## I want to add an OS exam/test

**Skill:** `/creating-os-tests`
**You need:** OS test PDF, year, session type
**What happens:** Extracts questions, creates test page, registers in index
**See:** [[Skill — Creating OS Tests]]

## I want to review my site's quality

**Skill:** `/review-site [scope]`
**You need:** Scope — a page, subject, or `all`. Dev server will auto-start.
**What happens:** 3 parallel agents (UX, pedagogy, visual) audit the content, produce max 30 findings, you pick what to fix, inspector validates fixes
**See:** [[Skill — Review Site]], [[Review Pipeline]]

## I want to build a new UI component

**Skill:** `/frontend-design`
**You need:** Description of what to build, any design constraints
**What happens:** Generates production-grade, creative frontend code
**See:** [[Skill — Frontend Design]]

## I want to commit and push my changes

**Skill:** `/commit` (commit only) or `/commit-push-pr` (commit + push + PR)
**You need:** Changes in working tree
**What happens:** Drafts commit message, commits, optionally pushes and creates PR
**See:** [[Skill — Commit]], [[Skill — Commit Push PR]]

## I want to clean up old branches

**Skill:** `/clean_gone`
**You need:** Nothing
**What happens:** Deletes local branches whose remote counterpart was deleted
**See:** [[Skill — Clean Gone]]

## I want a code review

**Skill:** `/code-review [PR]`
**You need:** PR number or URL
**What happens:** Analyzes diff, provides structured feedback
**See:** [[Skill — Code Review]]

## I don't know what I need

**Skill:** `/help-me [describe your goal]`
**You need:** A plain-language description of what you want to do
**What happens:** Reads this playbook, matches your goal to the right skill, tells you what to do
**See:** [[Skill — Help Me]]

## See Also
[[UX Playbook]], [[Pedagogy Playbook]], [[Design Principles]]
```

- [ ] **Step 2: Create Review Pipeline**

```markdown
---
title: Review Pipeline
type: architecture
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure, ux, pedagogy]
---

# Review Pipeline

A quality gate that checks your pages against UX and pedagogy research. Three specialist agents review independently, you decide what to fix, then an inspector validates the fixes.

## How to Use

1. Run `/review-site` (or it runs automatically after `/curate`)
2. Optionally specify scope:
   - A page: `/review-site oop/courses/course-01`
   - A subject: `/review-site oop`
   - Everything: `/review-site all`
3. Wait for 3 reports (runs in parallel, usually 1-3 minutes)
4. Read the findings — each has a severity, location, and suggested fix
5. Tell me which ones to fix (e.g., "fix all critical", "fix #1 and #3", "fix all")
6. I implement the fixes
7. Inspector checks my work
8. If the inspector finds issues, I retry. If I make the same mistake twice, I ask you for help instead.
9. Done

## The Agents

### UX Agent
Loads the [[UX Playbook]] and runs through each checklist category against your page's source code. Checks layout, interaction patterns, visual design, accessibility, and responsiveness against 28 research-backed UX principles. Also checks [[Design Principles]] for pedagogy conflicts.

### Pedagogy Agent
Loads the [[Pedagogy Playbook]] and evaluates learning effectiveness. Checks learning rhythm, question quality, exercise sequencing, retrieval practice density, feedback quality, and difficulty progression against 15 evidence-based techniques. Also checks [[Design Principles]] for UX conflicts.

### Visual Agent
Takes 4 screenshots of your page (light/dark mode × desktop/mobile) using Puppeteer, then sends them to Gemini's vision model along with the UX Playbook as grounding context. Evaluates what the page actually looks like — visual hierarchy, spacing consistency, dark mode contrast, responsive layout, professional polish.

### Inspector Agent
Runs after fixes are implemented. Reads the diff of what changed and the original findings. Validates that each fix actually addresses its finding without introducing regressions.

## Reading a Report

Each report has max 10 findings. A finding looks like:

```
### [critical] — Heading hierarchy skips h2
**Where:** src/content/oop/courses/course-03.json, step 4
**Issue:** Section jumps from h1 to h3, breaking visual hierarchy and screen reader navigation.
**Fix:** Add an h2 heading before the h3 subsections.
**Principle:** [[Visual Hierarchy]]
```

**Severity levels:**
- **critical** — Breaks usability, accessibility, or learning effectiveness. Must fix.
- **improvement** — Suboptimal but functional. Should fix.
- **suggestion** — Nice-to-have polish. Fix if time allows.

The `[[wikilink]]` points to the UX or pedagogy concept page that explains the research behind the finding. You can read it to understand why it matters.

## After Curation

When you use `/curate` to create new content, you'll be asked at the end:

```
Review complete. Run /review-site on the new content? (y/n)
```

Saying yes runs the full review pipeline on just the newly created content.

## See Also
[[Review Playbook]], [[UX Playbook]], [[Pedagogy Playbook]], [[Design Principles]], [[Skill — Review Site]]
```

- [ ] **Step 3: Create Review Playbook**

```markdown
---
title: Review Playbook
type: architecture
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure, ux, pedagogy]
---

# Review Playbook

Operational instructions for review agents. Load this page before starting any review.

## Report Format

Every finding MUST follow this format:

```markdown
### [severity] — Short descriptive title
**Where:** file path:line or component name
**Issue:** 1-2 sentences — what's wrong and why it matters
**Fix:** 1-2 sentences — specific, actionable fix
**Principle:** [[wikilink]] to the concept page
```

## Severity Definitions

- **critical:** Breaks usability (can't complete a task), breaks accessibility (WCAG AA violation), or breaks learning effectiveness (concept taught incorrectly, missing retrieval practice in an entire course). Must fix before shipping.
- **improvement:** Suboptimal but users can work around it. Examples: spacing inconsistency, missing empty state, weak quiz distractors, suboptimal heading wording. Should fix.
- **suggestion:** Polish that would improve quality but isn't blocking. Examples: animation could be smoother, whitespace could be more generous, a quiz could have one more distractor. Fix if time allows.

## Constraints

- **Max 10 findings per report.** Prioritize by severity (critical first), then by impact.
- If there are more than 10 issues, include a line at the bottom: `_N additional minor items omitted._`
- **No vague findings.** Every finding must have a specific location, a specific issue, and a specific fix.
- **No duplicate findings.** If the same issue appears on multiple pages, combine into one finding with multiple locations.
- **Cite principles.** Every finding must link to a concept page. If no concept page exists, describe the principle inline.

## UX Agent Instructions

1. Load this page (Review Playbook)
2. Load [[UX Playbook]]
3. Read the target source code (JSX or JSON)
4. Run through each UX Playbook checklist category
5. For each issue found, load the relevant concept page to verify it's a real violation
6. Check [[Design Principles]] — if a UX finding would conflict with pedagogy, note it in the finding
7. Produce report (max 10 findings)

## Pedagogy Agent Instructions

1. Load this page (Review Playbook)
2. Load [[Pedagogy Playbook]]
3. Read the target source code
4. Evaluate against pedagogy checklist:
   - Does the content follow the 5-phase learning rhythm?
   - Are there enough retrieval practice opportunities (~40% of content time)?
   - Do quiz questions have elaborated feedback and misconception-targeted distractors?
   - Is the difficulty progression appropriate (concrete before abstract)?
   - Are code exercises sequenced as trace → explain → write?
5. Check [[Design Principles]] — if a pedagogy finding would conflict with UX, note it
6. Produce report (max 10 findings)

## Visual Agent Instructions

1. Load this page (Review Playbook)
2. Load [[UX Playbook]] (as text to send to Gemini alongside screenshots)
3. Run the screenshot script: `node scripts/review-screenshot.mjs <url>`
4. Send 4 screenshots + UX Playbook text to Gemini vision model
5. Gemini prompt:

```
You are a UX reviewer for an educational web application. Review these 4 screenshots
(light desktop, dark desktop, light mobile, dark mobile) against the UX principles
provided below.

For each issue found, report:
- Severity: critical, improvement, or suggestion
- What you see in the screenshot
- Which UX principle it violates
- Specific fix recommendation

Max 10 findings, prioritized by severity. Focus on:
- Visual hierarchy and readability
- Color contrast (especially dark mode)
- Spacing consistency
- Responsive layout quality
- Professional polish and credibility
- Interactive element visibility

[UX Playbook text inserted here]
```

6. Parse Gemini response into standard report format
7. Produce report (max 10 findings)

## Inspector Agent Instructions

1. Load this page (Review Playbook)
2. Read the original findings that prompted fixes
3. Read the diff of what the coding agent changed
4. For each finding that was supposed to be fixed:
   - Does the diff address the issue?
   - Does the fix introduce any regressions?
   - Is the fix complete or partial?
5. If a fix is wrong or incomplete: describe what's still wrong, send back for retry
6. If the coding agent makes the same mistake on the same finding twice: stop and escalate to the user with a description of what went wrong and why you think it's stuck
7. Produce a pass/fail verdict per finding

## See Also
[[Review Pipeline]], [[UX Playbook]], [[Pedagogy Playbook]], [[Design Principles]]
```

---

### Task 4: Screenshot Script

**Files:**
- Create: `scripts/review-screenshot.mjs`
- Modify: `package.json` (add puppeteer devDependency)

- [ ] **Step 1: Install Puppeteer**

```bash
cd C:/Users/User/Desktop/SO/os-study-guide
npm install --save-dev puppeteer
```

Expected: puppeteer added to `devDependencies` in `package.json`.

- [ ] **Step 2: Create review-screenshot.mjs**

```javascript
#!/usr/bin/env node
import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { resolve } from 'path';
import { execSync, spawn } from 'child_process';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/review-screenshot.mjs <url-path>');
  console.error('Example: node scripts/review-screenshot.mjs /#/y1s2/oop');
  process.exit(1);
}

const BASE = 'http://localhost:5173';
const OUT_DIR = resolve('wiki/raw/assets/review');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

await mkdir(OUT_DIR, { recursive: true });

// Check if dev server is running
let devServer = null;
try {
  await fetch(BASE);
} catch {
  console.error('Dev server not running. Starting...');
  devServer = spawn('npm', ['run', 'dev'], { stdio: 'ignore', shell: true, detached: true });
  devServer.unref();
  // Wait for server to be ready
  for (let i = 0; i < 30; i++) {
    try {
      await new Promise(r => setTimeout(r, 1000));
      await fetch(BASE);
      break;
    } catch {
      if (i === 29) {
        console.error('Dev server failed to start after 30s');
        process.exit(1);
      }
    }
  }
  console.error('Dev server started.');
}

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

const configs = [
  { name: 'light-desktop', width: 1280, height: 800, dark: false },
  { name: 'dark-desktop',  width: 1280, height: 800, dark: true },
  { name: 'light-mobile',  width: 375,  height: 812, dark: false },
  { name: 'dark-mobile',   width: 375,  height: 812, dark: true },
];

const paths = [];

for (const config of configs) {
  await page.setViewport({ width: config.width, height: config.height });

  // Set dark mode via localStorage before navigating
  await page.evaluateOnNewDocument((isDark) => {
    localStorage.setItem('dark', JSON.stringify(isDark));
  }, config.dark);

  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle0' });

  // Wait for content to settle (animations, lazy loading)
  await new Promise(r => setTimeout(r, 2000));

  const filename = `${TIMESTAMP}_${config.name}.png`;
  const filepath = resolve(OUT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  paths.push(filepath);
  console.error(`Captured: ${config.name} → ${filename}`);
}

await browser.close();

// Output paths to stdout (for the visual agent to read)
for (const p of paths) {
  console.log(p);
}

if (devServer) {
  console.error('Note: dev server was started by this script and is still running.');
}
```

- [ ] **Step 3: Test the script shows usage without args**

```bash
node scripts/review-screenshot.mjs
```

Expected output on stderr: `Usage: node scripts/review-screenshot.mjs <url-path>`

- [ ] **Step 4: Commit**

```bash
git add scripts/review-screenshot.mjs package.json package-lock.json
git commit -m "feat: add Puppeteer screenshot script for review pipeline"
```

---

### Task 5: `/help-me` Skill

**Files:**
- Create: `~/.claude/skills/help-me/skill.md`

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p ~/.claude/skills/help-me
```

- [ ] **Step 2: Create skill.md**

Write to `C:\Users\User\.claude\skills\help-me\skill.md`:

```markdown
---
name: help-me
description: Describe what you want to do in plain language and get routed to the right skill with instructions. Use when you're not sure which skill to use or what parameters it needs.
---

# Help Me — Workflow Router

The user wants help finding the right skill for a task. Read the Workflow Playbook from the wiki, match their description to the right skill(s), and guide them.

## Steps

1. Read the user's description of what they want to do
2. Read the Workflow Playbook: `wiki/architecture/Workflow Playbook.md`
3. Match their description to the best entry in the playbook
4. Tell them:
   - Which skill to use (with the `/command` syntax)
   - What they need to provide (files, parameters)
   - What will happen when they run it
5. Ask: "Want me to run this now?"
6. If yes, invoke the skill

## If No Match

If the user's goal doesn't match any playbook entry:
- Check if an existing skill could be adapted
- If not, suggest they describe what they want and you'll help manually
- Consider whether a new skill should be created (suggest it, don't create it)

## Example Interactions

User: "I have a new OS lecture PDF"
→ "Use `/curate os <path-to-pdf>`. You need the PDF in `src/content/os/source/`. This will run the 6-stage pipeline to create an interactive JSON course. Want me to run it?"

User: "I want to check if my site looks good"
→ "Use `/review-site [scope]`. You can review a specific page (`/review-site oop/courses/course-01`), a whole subject (`/review-site oop`), or everything (`/review-site all`). Want me to run it?"

User: "How do I deploy?"
→ "Just commit and push — GitHub Actions auto-deploys to Pages. Use `/commit` to commit, then `git push`. For the proxy server, use `scp` to the VPS (see the deployment workflow in your memory files)."
```

- [ ] **Step 3: Verify the skill is recognized**

The skill should appear in the skills list. Test by checking:

```bash
ls ~/.claude/skills/help-me/skill.md
```

Expected: file exists.

---

### Task 6: `/review-site` Skill

**Files:**
- Create: `~/.claude/skills/review-site/skill.md`

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p ~/.claude/skills/review-site
```

- [ ] **Step 2: Create skill.md**

Write to `C:\Users\User\.claude\skills\review-site\skill.md`:

```markdown
---
name: review-site
description: Multi-agent quality review — audits pages against UX research, pedagogy research, and visual quality. Use when you want to check if pages are well-designed and effective at teaching.
---

# Review Site — Multi-Agent Quality Pipeline

Run a quality audit on study guide pages using parallel specialist agents.

## Usage

`/review-site [scope]`

- `/review-site oop/courses/course-01` — review a single page
- `/review-site oop` — review an entire subject
- `/review-site all` — review the whole site
- `/review-site` (no args) — ask the user what to review

## Steps

### 1. Parse Scope

Determine what to review from the user's input. If no scope provided, ask.

Map scope to:
- **Page:** specific file path(s) to read + URL for screenshots
- **Subject:** all courses/labs/tests for that subject + subject URL
- **All:** iterate over all subjects

### 2. Dispatch Three Agents in Parallel

Launch 3 subagents simultaneously using the Agent tool:

**UX Agent prompt:**
```
You are a UX reviewer for an educational web application.

Read these files first:
1. wiki/architecture/Review Playbook.md (your instructions and report format)
2. wiki/architecture/UX Playbook.md (your audit checklist)
3. wiki/architecture/Design Principles.md (UX vs pedagogy tensions)

Then read the target source code:
[list the specific files based on scope]

Run through each UX Playbook checklist category. For each issue, load the relevant concept page from wiki/concepts/ to verify it's a real violation.

Produce a report with max 10 findings in the format specified in the Review Playbook.
```

**Pedagogy Agent prompt:**
```
You are a pedagogy reviewer for an educational web application.

Read these files first:
1. wiki/architecture/Review Playbook.md (your instructions and report format)
2. wiki/architecture/Pedagogy Playbook.md (your audit checklist)
3. wiki/architecture/Design Principles.md (UX vs pedagogy tensions)

Then read the target source code:
[list the specific files based on scope]

Evaluate learning effectiveness: rhythm, retrieval practice, question quality, exercise sequencing, difficulty progression, feedback quality.

Produce a report with max 10 findings in the format specified in the Review Playbook.
```

**Visual Agent prompt:**
```
You are a visual reviewer for an educational web application.

1. Read wiki/architecture/Review Playbook.md for your instructions
2. Read wiki/architecture/UX Playbook.md (you'll send this to Gemini)
3. Run the screenshot script: node scripts/review-screenshot.mjs [url]
4. Read the 4 screenshot files it outputs
5. Read wiki/architecture/UX Playbook.md content as a string
6. Call Gemini vision API with the screenshots + playbook text using the prompt from the Review Playbook
7. Parse Gemini's response into standard report format

Produce a report with max 10 findings.
```

### 3. Collect and Present Reports

After all 3 agents return:

1. Combine the 3 reports
2. Count findings by severity: N critical, N improvement, N suggestion
3. Present to the user:

```
## Review Complete — [Scope]
**Total:** N findings (X critical, Y improvement, Z suggestion)

### UX Agent Report
[report content]

### Pedagogy Agent Report
[report content]

### Visual Agent Report
[report content]

---
Which findings should I fix? (e.g., "fix all critical", "fix #1 and #3", "fix all", or "none")
```

### 4. Fix Cycle

If the user requests fixes:

1. Dispatch a coding agent with:
   - The specific findings to fix
   - The source files to modify
   - Instructions to make minimal, targeted changes

2. After fixes are implemented, dispatch an inspector agent with:
   - The original findings
   - The diff of changes made
   - Instructions from Review Playbook inspector section

3. If inspector passes: done
4. If inspector fails:
   - Check if it's the same mistake as last attempt
   - If same mistake twice: stop, report to user what's stuck and why
   - If different issue: send back to coding agent with inspector's feedback

### 5. Summary

After all fixes pass inspection (or user says stop):

```
## Review Complete
- Findings: N total, M fixed, K skipped
- Files changed: [list]
```
```

---

### Task 7: Update Curate Skill

**Files:**
- Modify: `~/.claude/skills/curate/skill.md` (append after Step 6)

- [ ] **Step 1: Add review prompt to end of curate skill**

In `C:\Users\User\.claude\skills\curate\skill.md`, after the Step 6 summary block (after line 571), append:

```markdown

### Step 7: Review (Optional)

After deployment, offer to run the review pipeline on the new content:

```
Run /review-site on the new content? (y/n)
```

If the user says yes, invoke the review-site skill scoped to the newly created content path.
If the user says no or doesn't respond, skip.
```

- [ ] **Step 2: Verify the curate skill file is valid**

```bash
head -5 ~/.claude/skills/curate/skill.md
```

Expected: YAML frontmatter with `name: curate`.

---

### Task 8: Update Memory + Final Wiki Updates

**Files:**
- Modify: `~/.claude/projects/C--Users-User-Desktop-SO-os-study-guide/memory/project_review_pipeline.md`
- Modify: `~/.claude/projects/C--Users-User-Desktop-SO-os-study-guide/memory/project_wiki_expansion.md`
- Modify: `~/.claude/projects/C--Users-User-Desktop-SO-os-study-guide/memory/MEMORY.md`
- Modify: `wiki/architecture/UX Playbook.md` (add Review Playbook to See Also)
- Modify: `wiki/architecture/Pedagogy Playbook.md` (add Review Playbook to See Also)

- [ ] **Step 1: Update UX Playbook See Also**

In `wiki/architecture/UX Playbook.md`, replace:

```markdown
## See Also
[[Design Principles]], [[Pedagogy Playbook]]
```

With:

```markdown
## See Also
[[Design Principles]], [[Pedagogy Playbook]], [[Review Playbook]], [[Workflow Playbook]]
```

- [ ] **Step 2: Update Pedagogy Playbook See Also**

In `wiki/architecture/Pedagogy Playbook.md`, replace:

```markdown
## See Also
[[Platform Status]], [[Content Redesign]], [[JSON Pipeline]], [[Design Principles]], [[UX Playbook]]
```

With:

```markdown
## See Also
[[Platform Status]], [[Content Redesign]], [[JSON Pipeline]], [[Design Principles]], [[UX Playbook]], [[Review Playbook]], [[Workflow Playbook]]
```

- [ ] **Step 3: Update project_review_pipeline.md memory**

Replace content of `~/.claude/projects/C--Users-User-Desktop-SO-os-study-guide/memory/project_review_pipeline.md`:

```markdown
---
name: Multi-agent review pipeline
description: Review pipeline is BUILT — /review-site skill, /help-me skill, screenshot script, wiki docs, skill entity pages all done.
type: project
---

Review pipeline implemented on 2026-04-09.

## What Was Built
- **`/review-site` skill** — orchestrates UX + pedagogy + visual agents in parallel, max 30 findings, inspector validates fixes
- **`/help-me` skill** — plain-language workflow router, reads Workflow Playbook
- **Screenshot script** — `scripts/review-screenshot.mjs` (Puppeteer, 4 screenshots: light/dark × desktop/mobile)
- **Wiki pages:** Review Pipeline (user guide), Review Playbook (agent instructions), Workflow Playbook (task router), 14 skill entity pages, index-skills.md sub-index
- **Curate update** — Step 7 auto-offers review after curation

## How It Works
1. `/review-site [scope]` dispatches 3 agents in parallel
2. UX agent audits against 28 principles, pedagogy agent against 15 techniques, visual agent sends screenshots to Gemini
3. Each produces max 10 findings (severity + location + fix + principle wikilink)
4. User picks what to fix
5. Coding agent implements, inspector validates, escalates on repeated failure
```

- [ ] **Step 4: Update project_wiki_expansion.md memory**

Replace content of `~/.claude/projects/C--Users-User-Desktop-SO-os-study-guide/memory/project_wiki_expansion.md`:

```markdown
---
name: Wiki expansion roadmap
description: All wiki vaults complete — pedagogy, UX/UI, skills, review pipeline. Future: OS and PA domain content.
type: project
---

Wiki was restructured on 2026-04-09 into a sub-index system for token efficiency.

## Completed
- **Sub-index system:** Router `index.md` links to domain sub-indexes. ~90% startup token reduction.
- **Pedagogy vault:** 15 technique pages + Pedagogy Playbook + `index-pedagogy.md`
- **UX/UI vault:** 28 concept pages + UX Playbook + Design Principles arbiter + `index-uxui.md`
- **Skills vault:** 14 skill entity pages + Workflow Playbook + `index-skills.md`
- **Review pipeline:** Review Pipeline guide + Review Playbook + `/review-site` skill + `/help-me` skill + screenshot script
- **Existing domains:** OOP (13 courses, 24 concepts, 1 entity), Platform (7 architecture pages)

## Future domains (not started)
- OS subject content (pending OS curation)
- PA subject content (pending PA curation)
```

- [ ] **Step 5: Update MEMORY.md**

In MEMORY.md, replace:

```markdown
## Project State
- [LLM Wiki knowledge base](../../wiki/index.md) — architecture, pedagogy, project state, source inventories. Open wiki/index.md for full catalog.
- [Wiki expansion roadmap](project_wiki_expansion.md) — Sub-indexes done, pedagogy done, UX/UI design vault is next.
- [Multi-agent review pipeline](project_review_pipeline.md) — UX + pedagogy + inspector agents with retry budget. Spec after UX/UI vault.
```

With:

```markdown
## Project State
- [LLM Wiki knowledge base](../../wiki/index.md) — architecture, pedagogy, UX/UI, skills, review pipeline. Open wiki/index.md for full catalog.
- [Wiki expansion roadmap](project_wiki_expansion.md) — All vaults done. Future: OS and PA domain content.
- [Review pipeline](project_review_pipeline.md) — BUILT. /review-site, /help-me, screenshot script, wiki docs.
```
