# LLM Wiki — Design Spec

**Date:** 2026-04-09
**Status:** Approved

## Overview

A persistent, compounding knowledge base maintained by Claude Code for the study guide platform. Instead of rediscovering knowledge from scratch each session, Claude incrementally builds and maintains a structured wiki of interlinked markdown files. The wiki covers both the content domain (university courses — OS, OOP, PA, etc.) and the platform itself (UI/UX, pedagogy, architecture, infrastructure).

The wiki lives at `wiki/` in the project root, opened as an Obsidian vault by the user. It is excluded from git (`.gitignore`). Claude owns all wiki pages; the user curates raw sources and directs analysis.

## Three Layers

1. **Raw sources** (`wiki/raw/`) — Immutable source documents. PDFs, web clips, notes, images, transcripts. Claude reads from these but never modifies them.
2. **The wiki** (all other `wiki/` directories) — LLM-generated markdown pages. Summaries, entity pages, concept pages, architecture docs, comparisons. Claude creates, updates, and maintains everything.
3. **The schema** (section in `CLAUDE.md`) — Rules and conventions that tell Claude how to operate the wiki. Loaded automatically every session.

## Directory Structure

```
wiki/                          <- Obsidian vault root
├── .obsidian/                 <- Created by Obsidian on first open
├── raw/                       <- Immutable source documents (LLM read-only)
│   ├── assets/                <- Images, downloaded attachments
│   ├── pdfs/                  <- Lecture slides, exam papers
│   ├── articles/              <- Web clips (Obsidian Web Clipper)
│   ├── notes/                 <- User's own notes, transcripts
│   └── other/                 <- Anything else
├── sources/                   <- LLM-written summary page per ingested source
├── entities/                  <- Pages for specific things (components, tools, subjects)
├── concepts/                  <- Pages for ideas (pedagogy techniques, design patterns)
├── architecture/              <- Platform architecture, infrastructure, decisions
├── comparisons/               <- Side-by-side analyses filed from queries
├── index.md                   <- Master catalog of all wiki pages
├── log.md                     <- Chronological record of operations
└── overview.md                <- High-level synthesis — the "front page"
```

## Page Format

Every LLM-generated wiki page uses this template:

```markdown
---
title: Page Title
type: source | entity | concept | architecture | comparison
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [source-filename-1, source-filename-2]
tags: [tag1, tag2]
---

# Page Title

Content here. Links to other wiki pages use [[wikilinks]].

## See Also
- [[Related Page 1]]
- [[Related Page 2]]
```

### Conventions

- **Wikilinks** (`[[Page Name]]`) for all cross-references — Obsidian renders these as clickable links and shows them in graph view.
- **Frontmatter** is required on every page — enables Obsidian Dataview queries and helps Claude find relevant pages.
- **`sources` field** traces every claim back to raw sources for verifiability.
- **`updated` date** changes whenever Claude modifies the page.
- **Tags** are flat, drawn from a curated set:
  `os`, `oop`, `pa`, `prob-stat`, `alo`, `pedagogy`, `ui`, `ux`, `architecture`, `infrastructure`, `components`, `deployment`, `testing`, `design-decisions`
- **Cross-references are bidirectional** — if A links to B, B should link back to A.

## index.md

Content-oriented catalog of every wiki page, organized by category:

```markdown
# Wiki Index

## Sources
- [[source-name]] — one-line summary (YYYY-MM-DD)

## Entities
- [[entity-name]] — one-line summary

## Concepts
- [[concept-name]] — one-line summary

## Architecture
- [[page-name]] — one-line summary

## Comparisons
- [[comparison-name]] — one-line summary
```

Updated on every ingest or page creation. Claude reads this first when answering queries.

## log.md

Chronological, append-only record of operations:

```markdown
# Wiki Log

## [2026-04-09] init | Wiki initialized
- Created directory structure, index.md, log.md, overview.md

## [2026-04-09] ingest | Source Title
- Created: [[source-summary-page]]
- Updated: [[entity-1]], [[concept-1]]
- New page: [[entity-2]]

## [2026-04-10] query | "What pedagogy techniques work best for X?"
- Filed answer as: [[comparison-pedagogy-techniques]]

## [2026-04-12] lint | Health check
- Found 3 orphan pages, 1 contradiction
- Fixed: [[page-1]], [[page-2]]
```

Parseable with: `grep "^## \[" wiki/log.md | tail -5`

## Operations

### Ingest

Two modes, chosen per-source by the user:

**Collaborative** (complex/important sources):
1. Claude reads the source (Gemini for PDFs, direct for text/markdown).
2. Claude presents key takeaways and asks what to emphasize.
3. User guides direction.
4. Claude writes/updates wiki pages.
5. Claude updates `index.md` and appends to `log.md`.

**Autonomous** (routine sources):
1. User says "ingest `raw/pdfs/something.pdf`".
2. Claude processes end-to-end — extraction, summary page, entity/concept updates, index, log.
3. Claude gives a short summary of what changed.

### Query

1. Claude reads `index.md` to find relevant pages.
2. Claude reads those pages.
3. Claude synthesizes an answer with `[[wikilinks]]` citations.
4. If the answer is substantial/reusable, Claude asks whether to file it as a new wiki page.

### Lint

Triggered by user ("lint the wiki") or suggested by Claude periodically. Checks for:
- Orphan pages (no inbound links)
- Mentioned concepts without their own page
- Stale pages (old `updated` date, newer sources exist)
- Contradictions between pages
- Missing cross-references

Claude reports findings and fixes with user approval.

## Gemini PDF Pipeline

A Node script at `scripts/wiki-ingest.mjs` handles PDF extraction:

1. Takes a file path as argument.
2. Sends the PDF directly to the Gemini API (native file upload — no base64 conversion).
3. Model: `gemini-3-flash-preview`.
4. Prompt asks Gemini to: extract full content, identify key concepts/entities, provide a structured summary.
5. Returns JSON: `{ content, summary, concepts, entities }`.
6. API keys: read from project `.env` (direct API calls, not through the proxy).

Claude calls this script, receives the structured output, then does all wiki integration.

For non-PDF sources (markdown, text, web clips), Claude handles directly — no Gemini needed.

## Schema in CLAUDE.md

A new `## LLM Wiki` section added to the existing project `CLAUDE.md`. Contains:
- Overview and three-layer architecture
- Directory layout reference
- Page conventions (frontmatter, wikilinks, tags)
- Operations (ingest modes, query, lint)
- Gemini PDF pipeline reference
- Maintenance rules (index updates, log appends, bidirectional links, contradiction flagging)
- Startup behavior: read `index.md` and recent `log.md` at session start when wiki work is expected

Approximately 80-100 lines. Automatically loaded every session.

## Memory Migration

These knowledge-heavy memory files move from `.claude/projects/.../memory/` to wiki pages:

| Memory file | Wiki destination |
|---|---|
| `project_roadmap.md` | `wiki/architecture/platform-status.md` |
| `project_oop_source_materials.md` | `wiki/entities/oop-source-materials.md` |
| `project_vps_proxy_deployment.md` | `wiki/architecture/vps-proxy-deployment.md` |
| `project_content_redesign.md` | `wiki/architecture/content-redesign.md` |
| `project_ux_redesign.md` | `wiki/architecture/ux-redesign.md` |
| `project_pipeline_json_update.md` | `wiki/architecture/json-pipeline.md` |
| `project_scaling_plan.md` | `wiki/architecture/scaling-plan.md` |
| `project_next_pa_curate.md` | `wiki/architecture/remaining-work.md` |

**Stay in memory:** All `feedback_*.md` files, `user_student_sharing.md`, `reference_subject_folder_layout.md`, `reference_oop_test_pipeline.md`.

**MEMORY.md** updated: migrated entries replaced with a single pointer to the wiki.

## First Ingest Example

After setup, the first ingest would demonstrate the full pipeline:
1. User drops a PDF into `wiki/raw/pdfs/`.
2. User says "ingest this" (collaborative or autonomous).
3. Claude runs `scripts/wiki-ingest.mjs` to extract via Gemini.
4. Claude writes a summary page in `wiki/sources/`.
5. Claude creates/updates relevant entity and concept pages.
6. Claude updates `index.md` with new entries.
7. Claude appends the operation to `log.md`.
8. User browses results in Obsidian.
