# Wiki Sub-Index Redesign

**Date:** 2026-04-09
**Goal:** Reduce wiki startup token cost by ~90% while maintaining quality, scaling to 200+ pages without degradation.

## Problem

The current `wiki/index.md` is a single flat file listing all pages across all domains. At 49 pages (62 lines, ~935 tokens) it's manageable. Projected at 200+ pages (OS, PA, prob-stat, alo content), it grows to ~300 lines (~4,500 tokens) loaded every session — most of it irrelevant to the current query.

## Solution

Split `index.md` into a thin router (~15 lines) + domain-scoped sub-indexes. No pages move. No wikilinks break.

## New File Structure

```
wiki/
  index.md              <- Router index. Lists sub-indexes only. (~15 lines, ~50 tokens)
  index-oop.md          <- OOP sources + concepts (39 entries now, grows per subject)
  index-os.md           <- OS sources + concepts (empty now)
  index-pa.md           <- PA sources + concepts (empty now)
  index-platform.md     <- Architecture + entities + UX + infra + pedagogy (8 entries now)
  log.md                <- Unchanged (chronological record)
  overview.md           <- Unchanged
  sources/              <- Unchanged
  concepts/             <- Unchanged
  architecture/         <- Unchanged
  entities/             <- Unchanged
  comparisons/          <- Unchanged
  raw/                  <- Unchanged
```

## Router Index Format

`index.md` becomes:

```markdown
# Wiki Index

## Domains

- [[index-oop]] — OOP: 13 courses, 24 concepts
- [[index-os]] — OS: (pending)
- [[index-pa]] — PA: (pending)
- [[index-platform]] — Architecture, UX, infrastructure, pedagogy

## Quick Stats

- Total pages: 49
- Last updated: 2026-04-09

See [[log]] for recent activity. See [[overview]] for platform context.
```

## Domain Sub-Index Format

Each sub-index follows this structure (example: `index-oop.md`):

```markdown
# OOP Index

## Sources
- [[OOP Course 1]] — Introduction, OS architecture, memory alignment, C++ classes
- [[OOP Course 2]] — Pointers vs references, overloading, const, friend
...

## Concepts
- [[Memory Alignment]] — Padding rules, #pragma pack, alignment formula
- [[C++ Classes]] — Access modifiers, constructors, static members
...
```

## Log Enhancement

`log.md` gets a compact summary header (3-5 lines) above the chronological entries so Claude can quickly assess recent activity without scanning all entries:

```markdown
# Wiki Log

## Summary
- **Total operations:** 6
- **Last operation:** 2026-04-09 — OOP Courses 8-13 ingested
- **Domains touched:** OOP (13 courses), Platform (8 architecture pages)

## Entries
(existing chronological entries below)
```

This adds ~80 tokens but saves scanning the full log on every startup.

## Startup Protocol

### Current (CLAUDE.md)
> "When wiki work is expected, read `wiki/index.md` and last 10 lines of `wiki/log.md`"

### New
> "When wiki work is expected, read `wiki/index.md` (router). Based on the query domain, read the relevant sub-index (e.g., `index-oop.md` for OOP questions). Read `log.md` summary header for recent activity context."

### Token Cost Comparison (projected at 200+ pages)

| Step | Current | New |
|------|---------|-----|
| Startup (index) | ~4,500 | ~50 |
| Route to domain | — | ~200-400 |
| Log context | ~500 | ~80 (summary header) |
| **Total before drill-down** | **~5,000** | **~330-530** |
| **Savings** | — | **~90%** |

## CLAUDE.md Changes

Two updates to the LLM Wiki schema section:

1. **Startup** line: "read `wiki/index.md` (router), route to relevant sub-index based on query domain, read `log.md` summary header"
2. **Maintenance Rules** addition: "When creating/modifying pages, update the relevant domain sub-index, not the router index. Update the router index only when adding a new domain. Quick stats (page count) are best-effort, updated during lint operations, not on every page creation."

## Migration Steps

1. Create `index-oop.md` — move current Sources and Concepts sections from index.md
2. Create `index-platform.md` — move current Architecture and Entities sections
3. Create `index-os.md` and `index-pa.md` — empty templates with headers
4. Rewrite `index.md` to thin router format
5. Add summary header to `log.md`
6. Update CLAUDE.md startup protocol and maintenance rules
7. Append migration entry to `log.md`

## What Does NOT Change

- No wiki pages move or get renamed
- No wikilinks break (sub-indexes are new files, old links still resolve)
- No folder restructuring
- No new tooling or dependencies
- `overview.md` untouched
- Page format (frontmatter, cross-references) untouched
