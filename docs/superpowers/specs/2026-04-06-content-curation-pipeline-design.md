# Content Curation Pipeline — Design Spec

**Date:** 2026-04-06
**Status:** Approved (v1 — expect iterations after real-world usage)

## Problem

Course content in the study guide suffers from:
1. **Accuracy issues** — content sometimes wrong or missing parts of source material
2. **Incomplete references** — bibliography sources not cross-referenced
3. **Lost visuals** — diagrams/graphs from professor PDFs lost in translation to JSX
4. **Professor-specific conventions** — non-standard approaches (e.g., KMP indexed from -1) must be preserved exactly, as grades depend on following the professor's standard
5. **Slow manual process** — each course is hand-crafted, doesn't scale as more subjects are added

## Solution

An on-demand, semi-automated content curation pipeline triggered via `/curate` in Claude Code. Uses Gemini API (free tier) for PDF extraction and bibliography cross-referencing, Claude (Haiku/Opus tiered) for draft generation and quality review. Stops for human review before publishing.

## Command Interface

```
/curate <pdf-path> [--bib <path>] [--subject <slug>] [--type <course|lab|seminar|test>] [--redo]
/curate status
/curate resume <path>
```

**Auto-detection:** Subject and content type are inferred from the file path. `--bib`, `--subject`, and `--type` flags are overrides for when auto-detection fails or isn't applicable.

**`--redo` flag:** For refining existing courses. Reads the current JSX file, compares against source PDF, preserves correct sections, and rewrites wrong/missing ones.

## Pipeline Stages

All stages are sequential with checkpoint/resume support. Each stage saves output to `.curate/` before proceeding. If interrupted (token limit, error), re-running `/curate` resumes from the last completed stage.

### Stage 1 — PDF Extraction (Gemini, free)

- Send PDF to Gemini 2.5 Flash API
- Extract: structured text, section headings, code blocks, math notation, table data
- Identify diagrams/figures: output image files + descriptions
- Output: `stage1-extraction.json` + `stage1-images/`

### Stage 2 — Bibliography Cross-Reference (Gemini, free)

- Load relevant pre-processed sources from `src/content/<subject>/refs/`
- Compare extracted content against bibliography sources
- Flag professor-specific deviations from standard material (preserve professor's version)
- Flag claims that can't be verified against available sources
- Output: `stage2-crossref.json` with annotations per section

### Stage 2.5 — Diff Against Existing (Gemini, free) — `--redo` only

- Read existing JSX course file
- Compare extraction against current content
- Identify: missing content, inaccurate sections, lost diagrams, sections that are fine
- Output: `stage2.5-diff.json` with keep/rewrite decisions per section

### Stage 3 — Diagram Triage (Haiku, cheap)

- For each extracted diagram: check if a matching SVG already exists in the subject
- Decision per diagram: reuse existing SVG / create new SVG / keep as extracted image
- Save images that will stay as images to the subject's media folder
- Output: `stage3-diagrams.json` with decisions + saved files

### Stage 4 — Draft Generation (Opus, quality)

- Consumes: extraction + cross-ref + diff (if redo) + diagram decisions
- Follows existing skills conventions (Section IDs, bilingual t(), Box types, etc.)
- Generates: `stage4-draft.jsx` following all subject-specific patterns
- Embeds `{/* ⚠️ UNVERIFIED: ... */}` comments on uncertain sections
- Embeds `{/* ⚠️ DEVIATION: professor uses X, standard is Y */}` where relevant
- For `--redo`: preserves sections marked "keep", rewrites sections marked "rewrite"
- Output: `stage4-draft.jsx` + `stage4-review-notes.md`

### Stage 5 — Self-Review (Opus, quality)

- Re-reads source PDF alongside generated draft
- Checks: missing sections, wrong ordering, lost content, broken code blocks
- Updates/adds flags in the draft
- Output: `stage5-draft.jsx` + `stage5-review-notes.md`
- Also generates: `index-snippet.js` — the exact code to paste into the subject's `index.js` (course entry with id, title, shortTitle, sectionCount, sections array, component import)

### Stage 6 — STOP → Human Review

Pipeline prints:
```
✅ Pipeline complete — N flags to review

Next steps:
  1. Read review notes:  .curate/<name>/stage5-review-notes.md
  2. Preview in browser:  npm run dev → navigate to the course
  3. Edit draft if needed: .curate/<name>/stage5-draft.jsx
  4. Move to final location: courses/CourseNN.jsx
  5. Register in index.js — paste snippet from .curate/<name>/index-snippet.js
  6. Commit and push
```

## Checkpoint/Resume

Intermediate artifacts stored in:
```
src/content/<subject>/.curate/<name>/
├── status.json                ← { lastCompleted: 3, type: "course", subject: "os" }
├── stage1-extraction.json
├── stage1-images/
├── stage2-crossref.json
├── stage2.5-diff.json         ← only for --redo
├── stage3-diagrams.json
├── stage4-draft.jsx
├── stage4-review-notes.md
├── stage5-draft.jsx
└── stage5-review-notes.md
```

Re-running `/curate` on the same path checks `status.json` and skips completed stages. `.curate/` folders are gitignored.

## Bibliography System

Bibliography is per-subject, set up once, reused automatically.

### Structure
```
src/content/<subject>/refs/
├── sources.json              ← index of all bibliography entries
├── vidrascu-linux.md         ← full text (source < ~30k tokens)
├── tanenbaum-ch3.summary.md  ← summary (source > ~30k tokens)
└── ...
```

### Source Processing
- Extract bibliography references from the course description PDF (one-time)
- For each source: search locally in `refs/` → if not found, search internet → download and convert to markdown
- **Source < ~30k tokens:** store full text as markdown
- **Source > ~30k tokens:** store detailed summary (key concepts, formulas, algorithms, conventions)
- **Source unavailable online:** store metadata only, flag as `"available": false` in `sources.json` — pipeline flags content referencing this source as `⚠️ UNVERIFIED`

### sources.json Schema
```json
{
  "courseDescription": "course-description.pdf",
  "sources": [
    {
      "id": "vidrascu",
      "title": "Ghid de utilizare Linux",
      "author": "Cristian Vidrascu",
      "file": "vidrascu-linux.md",
      "format": "full",
      "available": true
    },
    {
      "id": "tanenbaum",
      "title": "Modern Operating Systems",
      "author": "Andrew Tanenbaum",
      "file": "tanenbaum-ch3.summary.md",
      "format": "summary",
      "available": true
    },
    {
      "id": "unknown-source",
      "title": "Some Unavailable Reference",
      "author": "Unknown",
      "file": null,
      "format": null,
      "available": false
    }
  ]
}
```

At pipeline runtime, only sources relevant to the current course topic are loaded into context.

## Content Type Handling

| Type | Gemini Extraction | Claude Generation | Output |
|---|---|---|---|
| **Course** | Full structured content + diagrams | `CourseNN.draft.jsx` with Sections, Boxes, Code, Toggle | Follows `adding-course` skill |
| **Lab** | Exercise statements + solutions | `LabNN.draft.jsx` with Sections + Toggle solutions | Follows `adding-lab-exercises` skill |
| **Seminar** | Exercise statements + solutions | `SeminarNN.draft.jsx` with MultipleChoice + Toggle | Follows `creating-seminar-evaluations` skill |
| **Test** | Problems + answers | Test data object or JSX depending on subject | Follows `creating-pa-tests` or `creating-os-tests` skill |

## Infrastructure

### Files
```
scripts/
├── curate.mjs              ← Gemini orchestrator (stages 1-2, optionally 2.5 and 3)
├── prompts/
│   ├── extract-course.md   ← stage 1 prompt template for courses
│   ├── extract-lab.md      ← stage 1 prompt template for labs
│   ├── extract-seminar.md  ← stage 1 prompt template for seminars
│   ├── extract-test.md     ← stage 1 prompt template for tests
│   ├── crossref.md         ← stage 2 prompt template
│   └── diagram-triage.md   ← stage 3 prompt template
└── package.json            ← deps: @google/generative-ai
```

### Claude Code Skill
- Skill name: `curate`
- Location: `~/.claude/skills/curate/skill.md`
- Orchestrates: calls `node scripts/curate.mjs` for Gemini stages, then runs Haiku/Opus agents for Claude stages

### Environment
- `GEMINI_API_KEY` in `proxy/.env`
- Gemini model: `gemini-2.5-flash` (stable, good PDF understanding)
- `.curate/` added to `.gitignore`
- `refs/` committed to git (processed markdown sources are part of the project)

## Design Principles

1. **Professor is authoritative** — never "correct" professor's conventions to match textbooks. Flag deviations, keep the professor's version.
2. **Checkpoint everything** — every stage saves to disk before proceeding. Token limits, errors, and interruptions are expected.
3. **Human reviews before publish** — the pipeline produces drafts, not final content. Quality gate is always human.
4. **Cache aggressively** — bibliography sources processed once, stored as markdown, reused forever. PDFs extracted once per pipeline run.
5. **Cheap by default** — Gemini free tier for bulk extraction, Haiku for simple decisions, Opus only for quality-critical generation and review.
6. **Skills as conventions** — draft generation follows existing skills (adding-course, creating-seminar-evaluations, etc.) for consistent output.
7. **v1 — iterate** — this design will evolve after real-world usage. Prompt templates are separate files for easy iteration.

## Future Considerations

- Student-compiled resource pack: one-time import/sifting task to extract useful material into `refs/`
- Prompt template iteration based on output quality observations
- Possible migration of stage 3 (diagram triage) to Gemini if it handles image analysis well enough
- New content types as the site grows (e.g., cheat sheets, flashcards)
