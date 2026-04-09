# Wiki Sub-Index Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the wiki's single flat index into a thin router + domain-scoped sub-indexes, reducing startup token cost by ~90%.

**Architecture:** Replace `wiki/index.md` (single 62-line catalog) with a ~15-line router that links to 4 domain sub-indexes (`index-oop.md`, `index-os.md`, `index-pa.md`, `index-platform.md`). Add a summary header to `log.md`. Update CLAUDE.md startup protocol. No pages move, no wikilinks break.

**Tech Stack:** Markdown files only. No code, no dependencies.

---

### Task 1: Create `index-oop.md`

**Files:**
- Create: `wiki/index-oop.md`

- [ ] **Step 1: Create the OOP sub-index**

Write `wiki/index-oop.md` with all OOP sources and concepts extracted from the current `wiki/index.md`:

```markdown
---
title: OOP Index
type: architecture
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [oop]
---

# OOP Index

## Sources

- [[OOP Course 1]] — Introduction, OS architecture, memory alignment, C++ classes (2026-04-09)
- [[OOP Course 2]] — Pointers vs references, overloading, const, friend (2026-04-09)
- [[OOP Course 3]] — Initialization, constructors, value types, singleton (2026-04-09)
- [[OOP Course 4]] — Destructors, operator overloading, move semantics (2026-04-09)
- [[OOP Course 5]] — Inheritance, virtual methods, vfptr/VTable, diamond problem (2026-04-09)
- [[OOP Course 6]] — Casts, macros, literals, templates, static_assert (2026-04-09)
- [[OOP Course 7]] — STL containers, iterators, I/O streams, string_view (2026-04-09)
- [[OOP Course 8]] — constexpr, auto/decltype, CRTP, POD types (2023-2024, 2026-04-09)
- [[OOP Course 9]] — Lambda expressions, closures, captures, std::function (2023-2024, 2026-04-09)
- [[OOP Course 10]] — Exceptions, try-throw-catch, noexcept, RAII (2023-2024, 2026-04-09)
- [[OOP Course 11]] — Unit testing, Google Test, TDD, code coverage (2023-2024, 2026-04-09)
- [[OOP Course 12]] — OO modeling, UML, SOLID principles, design by contract (2023-2024, 2026-04-09)
- [[OOP Course 13]] — Design patterns, Singleton, Composite, Visitor, Factory (2023-2024, 2026-04-09)

## Entities

- [[OOP Source Materials]] — Full inventory of OOP PDFs, exams, videos, bibliography

## Concepts

- [[Memory Alignment]] — Padding rules, `#pragma pack`, alignment formula
- [[C++ Classes]] — Access modifiers, constructors, static members, `this` pointer
- [[OS Memory Layout]] — Stack, heap, global variables, constants
- [[Pointers vs References]] — Safety differences, identical assembly output
- [[Method Overloading]] — Resolution steps, ambiguity rules
- [[Const Correctness]] — Const pointers, const methods, mutable keyword
- [[Friend Specifier]] — Friend functions, classes, and methods
- [[Constructors]] — Default, copy, move, delegating, initializer lists
- [[Value Categories]] — glvalue, prvalue, xvalue, lvalue, rvalue
- [[Move Semantics]] — Move constructor, resource stealing, rvalue references
- [[Singleton Pattern]] — Private constructor, static GetInstance()
- [[Destructors]] — Lifecycle, private destructors, destruction order
- [[Operator Overloading]] — Mechanics, friend functions, prefix/postfix, special operators
- [[Inheritance]] — Simple, multiple, access modifier transformation, constructor order
- [[Virtual Methods]] — vfptr, VTable, override, final, virtual destructors, covariance
- [[Abstract Classes]] — Pure virtual methods, interfaces
- [[Diamond Problem]] — Virtual inheritance, Variable Offsets Table
- [[C++ Casts]] — reinterpret_cast, static_cast, dynamic_cast, const_cast, object slicing
- [[Macros]] — Preprocessor, function-like, `#`, `##`, predefined macros
- [[Templates]] — Function/class templates, specialization, default parameters
- [[Static Assert]] — Compile-time assertion, TypeCompare pattern
- [[STL Containers]] — vector, deque, array, list, stack, queue, priority_queue
- [[Iterators]] — Random access, bidirectional, forward-only
- [[IO Streams]] — ios hierarchy, file I/O, manipulators, strings
```

- [ ] **Step 2: Commit**

```bash
git add wiki/index-oop.md
git commit -m "wiki: create OOP sub-index"
```

---

### Task 2: Create `index-platform.md`

**Files:**
- Create: `wiki/index-platform.md`

- [ ] **Step 1: Create the platform sub-index**

Write `wiki/index-platform.md` with all architecture entries from the current `wiki/index.md`:

```markdown
---
title: Platform Index
type: architecture
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [architecture, ui, ux, infrastructure]
---

# Platform Index

## Architecture

- [[Platform Status]] — Deployed features, content status, proxy endpoints
- [[VPS Proxy Deployment]] — VPS setup, nginx, SSL, PM2, API keys, troubleshooting
- [[Content Redesign]] — JSON block system, pipeline, phase status
- [[UX Redesign]] — Bottom sheet, animations, prediction gates, code highlighting
- [[JSON Pipeline]] — Pipeline JSON output + evidence-based pedagogy rules
- [[Scaling Plan]] — Growth strategy, content creation skills
- [[Remaining Work]] — OOP 6/13 done, then PA, OS, cleanup

## Comparisons

_(No comparison pages yet)_
```

- [ ] **Step 2: Commit**

```bash
git add wiki/index-platform.md
git commit -m "wiki: create platform sub-index"
```

---

### Task 3: Create empty `index-os.md` and `index-pa.md`

**Files:**
- Create: `wiki/index-os.md`
- Create: `wiki/index-pa.md`

- [ ] **Step 1: Create OS sub-index template**

Write `wiki/index-os.md`:

```markdown
---
title: OS Index
type: architecture
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [os]
---

# OS Index

## Sources

_(No OS sources ingested yet)_

## Concepts

_(No OS concepts yet)_
```

- [ ] **Step 2: Create PA sub-index template**

Write `wiki/index-pa.md`:

```markdown
---
title: PA Index
type: architecture
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pa]
---

# PA Index

## Sources

_(No PA sources ingested yet)_

## Concepts

_(No PA concepts yet)_
```

- [ ] **Step 3: Commit**

```bash
git add wiki/index-os.md wiki/index-pa.md
git commit -m "wiki: create empty OS and PA sub-indexes"
```

---

### Task 4: Rewrite `index.md` as thin router

**Files:**
- Modify: `wiki/index.md` (full rewrite)

- [ ] **Step 1: Replace index.md contents**

Overwrite `wiki/index.md` with:

```markdown
# Wiki Index

## Domains

- [[index-oop]] — OOP: 13 courses, 24 concepts, 1 entity
- [[index-os]] — OS: (pending)
- [[index-pa]] — PA: (pending)
- [[index-platform]] — Architecture, UX, infrastructure, pedagogy: 7 pages

## Quick Stats

- Total pages: 49
- Last updated: 2026-04-09

See [[log]] for recent activity. See [[overview]] for platform context.
```

- [ ] **Step 2: Commit**

```bash
git add wiki/index.md
git commit -m "wiki: rewrite index.md as thin router to sub-indexes"
```

---

### Task 5: Add summary header to `log.md`

**Files:**
- Modify: `wiki/log.md` (add header, keep existing entries)

- [ ] **Step 1: Add summary header above existing entries**

Insert at the top of `wiki/log.md`, before the first `## [2026-04-09]` entry:

```markdown
# Wiki Log

## Summary
- **Total operations:** 7
- **Last operation:** 2026-04-09 — Sub-index migration
- **Domains touched:** OOP (13 courses, 24 concepts), Platform (7 architecture pages)
- **Pending domains:** OS, PA

## Entries
```

The existing chronological entries (`## [2026-04-09] init | Wiki initialized`, etc.) follow below the `## Entries` header.

Then append a new entry at the bottom:

```markdown
## [2026-04-09] migrate | Sub-index redesign
- Split index.md into router + 4 domain sub-indexes
- Created: [[index-oop]], [[index-os]], [[index-pa]], [[index-platform]]
- Router index.md reduced from 62 lines to 13 lines (~90% token reduction at scale)
- Added summary header to log.md
```

- [ ] **Step 2: Commit**

```bash
git add wiki/log.md
git commit -m "wiki: add summary header to log and record migration"
```

---

### Task 6: Update CLAUDE.md wiki schema

**Files:**
- Modify: `CLAUDE.md:112-163` (Directory Layout, Operations, Maintenance Rules, Startup sections)

- [ ] **Step 1: Update Directory Layout section**

In CLAUDE.md, replace the `### Directory Layout` section (lines 112-121) with:

```markdown
### Directory Layout
- `wiki/raw/{assets,pdfs,articles,notes,other}/` — user drops sources here
- `wiki/sources/` — one summary page per ingested source
- `wiki/entities/` — specific things (components, tools, subjects)
- `wiki/concepts/` — ideas (pedagogy techniques, design patterns)
- `wiki/architecture/` — platform architecture, infra, decisions
- `wiki/comparisons/` — side-by-side analyses filed from queries
- `wiki/index.md` — router index (links to domain sub-indexes)
- `wiki/index-oop.md` — OOP sources, entities, concepts
- `wiki/index-os.md` — OS sources, concepts
- `wiki/index-pa.md` — PA sources, concepts
- `wiki/index-platform.md` — architecture, UX, infrastructure, pedagogy
- `wiki/log.md` — chronological operation record (summary header + entries)
- `wiki/overview.md` — high-level synthesis front page
```

- [ ] **Step 2: Update Ingest operation**

In the **Ingest** operation (line 140), change:

```
- Always: write/update summary page in `sources/`, update entity/concept pages, update `index.md`, append to `log.md`
```

to:

```
- Always: write/update summary page in `sources/`, update entity/concept pages, update the relevant domain sub-index (e.g., `index-oop.md`), append to `log.md`
```

- [ ] **Step 3: Update Query operation**

In the **Query** operation (line 143), change:

```
- Read `index.md` first to find relevant pages, then drill in
```

to:

```
- Read `index.md` (router) to identify the domain, then read the relevant sub-index, then drill into pages
```

- [ ] **Step 4: Update Maintenance Rules**

In **Maintenance Rules** (line 156), change:

```
- Update `index.md` after every page creation or modification
```

to:

```
- Update the relevant domain sub-index after every page creation or modification. Update the router `index.md` only when adding a new domain. Quick stats (page count) are best-effort, updated during lint operations.
```

- [ ] **Step 5: Update Startup protocol**

In **Startup** (line 163), change:

```
When wiki work is expected, read `wiki/index.md` and last 10 lines of `wiki/log.md` to understand current state.
```

to:

```
When wiki work is expected, read `wiki/index.md` (router). Based on the query domain, read the relevant sub-index (e.g., `index-oop.md` for OOP questions). Read the `## Summary` header of `wiki/log.md` for recent activity context.
```

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md wiki schema for sub-index system"
```

---

### Task 7: Verify and push

- [ ] **Step 1: Verify all files exist**

```bash
ls wiki/index.md wiki/index-oop.md wiki/index-os.md wiki/index-pa.md wiki/index-platform.md wiki/log.md
```

Expected: all 6 files listed, no errors.

- [ ] **Step 2: Verify router index is small**

```bash
wc -l wiki/index.md
```

Expected: ~13 lines.

- [ ] **Step 3: Verify sub-indexes have correct entry counts**

```bash
grep -c '^\- \[\[' wiki/index-oop.md wiki/index-platform.md
```

Expected: `index-oop.md: 38` (13 sources + 1 entity + 24 concepts), `index-platform.md: 7`.

- [ ] **Step 4: Push**

```bash
git push
```
