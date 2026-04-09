# Review Pipeline + Workflow System — Design Spec

## Goal

Build a multi-agent review pipeline that audits pages against UX and pedagogy research, plus a workflow routing system that maps plain-language goals to the right skills.

## Why

1. **No quality gate exists.** Content gets curated and deployed without systematic review against the UX and pedagogy knowledge bases we've built.
2. **Skill discovery is manual.** There are ~14 skills and the user has to remember names, parameters, and when to use each one. A routing layer eliminates this friction.
3. **Visual review is missing.** No one checks what the deployed pages actually look like across palettes, dark mode, and mobile breakpoints.

## Non-Goals

- No changes to existing component code (the pipeline reviews code, doesn't modify it)
- No automated fix application without user approval
- No CI/CD integration (this is a local development tool)

## Architecture

### System Flow

```
User invokes /review-site [scope]
         ↓
    ┌────┼────┐
    ↓    ↓    ↓        (parallel)
   UX  Peda  Visual
  Agent Agent Agent
    ↓    ↓    ↓
    └────┼────┘
         ↓
  Combined report (max 30 findings)
         ↓
  User reviews, picks fixes
         ↓
  Coding agent implements
         ↓
  Inspector agent validates
         ↓
  Pass? → Done
  Fail? → Coding agent retries
         (escalate if same mistake repeated twice)
```

### Trigger Modes

- **On-demand:** User runs `/review-site` with optional scope
- **Post-curation:** Curate skill offers review step after content is built and committed
- **Scope options:** Single page/component, full subject, entire site, or user-specified

## Agents

### UX Agent

- **Loads:** Review Playbook + UX Playbook → relevant concept pages from `index-uxui.md`
- **Reads:** Target page source code (JSX or JSON course file)
- **Process:** Runs through UX Playbook checklist categories, identifies violations, loads concept pages for each finding, checks Design Principles arbiter for pedagogy interactions
- **Output:** Max 10 findings in standard report format

### Pedagogy Agent

- **Loads:** Review Playbook + Pedagogy Playbook → relevant technique pages from `index-pedagogy.md`
- **Reads:** Target page source code
- **Process:** Evaluates learning rhythm, question quality, exercise sequencing, retrieval practice density, feedback quality
- **Output:** Max 10 findings in standard report format

### Visual Agent

- **Loads:** Review Playbook + UX Playbook (as text context for Gemini)
- **Input:** 4 screenshots from Puppeteer (light desktop, dark desktop, light mobile, dark mobile)
- **Process:** Sends screenshots + UX Playbook text to Gemini vision model. Gemini evaluates visual quality grounded in the UX principles — contrast, hierarchy, spacing, consistency, responsiveness, dark mode quality.
- **Model:** Uses existing Gemini API keys (GEMINI_API_KEYS from proxy/.env with rotation)
- **Output:** Max 10 findings in standard report format

### Inspector Agent

- **Loads:** Review Playbook + the original findings that prompted fixes
- **Reads:** The diff of what the coding agent changed
- **Process:** Validates each fix actually addresses its finding. Checks for regressions.
- **On failure:** Sends specific feedback to coding agent for retry
- **Escalation:** If the coding agent makes the same mistake twice, stops and reports to user instead of retrying indefinitely

## Report Format

```markdown
## [Agent Name] Review — [Scope]
[N] findings ([X] critical, [Y] improvement, [Z] suggestion)

### [critical] — Short title
**Where:** file:line or component name
**Issue:** 1-2 sentences — what's wrong
**Fix:** 1-2 sentences — what to do
**Principle:** [[wikilink]] to UX/pedagogy concept
```

- **critical:** Breaks usability, accessibility, or learning effectiveness. Must fix.
- **improvement:** Suboptimal but functional. Should fix.
- **suggestion:** Nice-to-have polish. Fix if time allows.
- Max 10 findings per agent, prioritized by severity
- If more than 10 exist, note "X additional minor items omitted" at bottom

## Screenshot Script

**File:** `scripts/review-screenshot.mjs`

- Uses Puppeteer (added as devDependency)
- Starts dev server (`npm run dev`) if not already running
- Navigates to target page URL (constructed from scope: `/#/y1s2/oop` etc.)
- Takes 4 screenshots:
  - Light mode, desktop (1280×800)
  - Dark mode, desktop (1280×800)
  - Light mode, mobile (375×812)
  - Dark mode, mobile (375×812)
- Dark mode toggled via localStorage `dark` key + page reload
- Saves screenshots to `wiki/raw/assets/review/` (timestamped filenames)
- Returns file paths for the visual agent to read
- Waits for page load + 2s settle time before screenshot (animations, lazy content)

## Workflow System

### Workflow Playbook (`wiki/architecture/Workflow Playbook.md`)

Task-to-skill router organized by goal. Each entry:

```markdown
### I want to [goal]
**Skill:** /skill-name
**You need:** what to provide (PDF, slug, etc.)
**What happens:** brief description of the process
**See also:** [[Skill Entity Page]] for full details
```

Categories:
- **Adding content:** curate, adding-course, adding-lab-exercises, creating-seminar-evaluations
- **Adding a new subject:** adding-subject
- **Adding tests/exams:** creating-pa-tests, creating-os-tests
- **Reviewing quality:** review-site
- **Deploying:** commit, commit-push-pr, deploy workflow
- **Getting help:** help-me
- **Cleaning up:** clean_gone
- **Building UI:** frontend-design
- **Code review:** code-review

### `/help-me` Skill

1. Read user's plain-language description
2. Load Workflow Playbook from wiki
3. Match to the right skill(s)
4. Tell user: which skill, what they need to provide, what will happen
5. Ask if they want to invoke it now
6. If yes, invoke the skill

### Skill Entity Pages (`wiki/entities/skill-*.md`)

One page per skill (~14 pages). Format:

```markdown
---
title: Skill — [Name]
type: entity
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [infrastructure]
---

# Skill — [Name]

**Invoke:** `/skill-name [args]`
**Purpose:** 1-2 sentence description

## When to Use
- Bullet list of trigger conditions

## What You Need
- What to provide (files, parameters, context)

## What It Does
Step-by-step walkthrough of what happens when invoked

## Example
Concrete example invocation and expected behavior

## See Also
[[related skills]], [[Workflow Playbook]]
```

### `wiki/index-skills.md`

Sub-index listing all skill entity pages, grouped by category. Added to router `index.md`.

## Wiki Pages Summary

| Page | Type | Location |
|------|------|----------|
| Review Pipeline | architecture | `wiki/architecture/Review Pipeline.md` |
| Review Playbook | architecture | `wiki/architecture/Review Playbook.md` |
| Workflow Playbook | architecture | `wiki/architecture/Workflow Playbook.md` |
| ~14 skill entity pages | entity | `wiki/entities/skill-*.md` |
| Skills Index | architecture | `wiki/index-skills.md` |

## Curate Skill Update

After the curate skill finishes building and committing content, add a prompt:

```
Review complete. Run /review-site on the new content? (y/n)
```

If yes, invoke the review pipeline scoped to the newly created content.

## Dependencies

- **New devDependency:** `puppeteer` (for screenshot script)
- **Existing:** Gemini API keys (already configured in proxy/.env)
- **Existing:** Wiki knowledge base (UX Playbook, Pedagogy Playbook, Design Principles)
- **Existing:** Subagent support (for parallel agent dispatch)

## File Summary

| File | Action |
|------|--------|
| `scripts/review-screenshot.mjs` | Create |
| Skills: `review-site`, `help-me` | Create |
| `wiki/architecture/Review Pipeline.md` | Create |
| `wiki/architecture/Review Playbook.md` | Create |
| `wiki/architecture/Workflow Playbook.md` | Create |
| `wiki/entities/skill-*.md` (~14 files) | Create |
| `wiki/index-skills.md` | Create |
| `wiki/index.md` | Update (add skills sub-index) |
| `wiki/log.md` | Update |
| Curate skill file | Update (add review prompt) |
| `package.json` | Update (add puppeteer devDep) |
