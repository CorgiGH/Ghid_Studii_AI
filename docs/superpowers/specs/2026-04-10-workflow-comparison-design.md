# Workflow Comparison Experiment — Design Spec

**Date:** 2026-04-10
**Purpose:** Compare three workflow systems (Ruflo, Enhanced Pipeline, Control) across four task types to determine the best approach for the project going forward.

## Context

The study guide platform currently has no automated testing, no quality gates beyond manual review, and all work runs through the default Claude Code workflow. We want to determine whether:
- **Ruflo** (multi-agent orchestration) improves quality and reduces token usage
- **An enhanced pipeline** (ruflo-inspired optimizations without the dependency) achieves similar benefits
- **The current workflow** is already good enough

The OS subject needs to be re-curated from old JSX to new JSON format anyway, so the experiment produces real, usable output regardless of which system wins.

## The Three Systems

### System A — Ruflo

Install ruflo (`npx ruflo@latest init`) on an isolated git worktree. Configure its CLAUDE.md integration, MCP server, and agent routing. Run tasks through its orchestration layer.

**What we're testing:** Does multi-agent coordination, model routing, and pattern caching actually improve output quality and reduce token usage?

**Risk factors:** Windows compatibility issues (389 open issues, several Windows-specific bugs), potential 300K token context bloat, some MCP tools may be stubs.

### System B — Enhanced Pipeline

Current workflow + targeted optimizations inspired by ruflo's architecture, but implemented as lightweight scripts and hooks:

- **Model routing:** Use haiku agents for simple/mechanical tasks (JSON validation, formatting checks), opus for architectural decisions
- **Validation scripts:** JSON schema validation, bilingual completeness checks, section ID format verification, block structure validation
- **Pre-commit hooks:** Run validation automatically before every commit
- **Structured self-review prompts:** After each task, run a checklist-based review step
- **Error logging:** Track and count errors caught at each stage

**What we're testing:** Can we get ruflo's benefits with simple, proven tooling?

### System C — Control

Current workflow with no modifications. Default Claude Code behavior, no extra validation, no model routing. This is the baseline.

**What we're testing:** How good is the current workflow already?

## The Four Tasks

Each system performs all four tasks. The same input is used across all three systems for each task.

### Task 1: Curate

**Input:** `wiki/raw/pdfs/OS-Course-1.pdf` (Basic Commands & Filesystems, 34 slides)
**Output:** `src/content/os/courses/course-01.json` in the project's standard JSON course format
**Expected deliverables:**
- Valid JSON matching the project's course schema
- Bilingual content (EN + RO) for all text fields
- Correct section IDs (descriptive, prefix-matching compatible)
- All block types properly structured (learn, code, quiz, think, definition, table, callout)
- Section count matching actual sections
- Metadata in index.js format (title, shortTitle, sectionCount, metaId, src)

### Task 2: Review

**Input:** Existing OS courses 1-3 on the live site (old JSX format)
**Output:** A findings report listing issues found, categorized by severity
**Expected deliverables:**
- Content accuracy issues (factual errors, outdated info)
- UX/accessibility issues (contrast, mobile, readability)
- Pedagogy issues (missing retrieval practice, no pretests, engagement gaps)
- Bilingual issues (missing translations, diacritics errors)
- Component issues (wrong block types, broken rendering)

### Task 3: Extract

**Input:** `wiki/raw/other/prev-year-so/Sisteme de Operare/Examen/examen_2023-2024/TP1_2024/varianta_1.pdf`
**Output:** Test JSON file in the project's standard test format
**Expected deliverables:**
- Valid JSON matching the project's test schema
- All questions/tasks extracted with bilingual text
- Correct metadata (year, type, variant)
- Proper categorization of question types (code writing, bash scripting, theory)
- Hints and solution outlines where applicable

### Task 4: Develop

**Input:** Feature request: add a `TestRenderer` component that renders test JSON files (similar to how `CourseRenderer` renders course JSON)
**Output:** Working React component + integration
**Expected deliverables:**
- Component renders test JSON with proper question display
- Supports the test format used by OOP tests (already working) and OS tests (new)
- Uses theme CSS variables (no hardcoded colors)
- Bilingual via `t()` helper
- No regressions in existing functionality

## Scoring

Each task is scored on 4 metrics. Each metric is scored 1-10.

| Metric | Measurement Method | Score |
|--------|-------------------|-------|
| **Correctness** | Count errors in output: broken JSON, wrong content, rendering bugs, missing fields, crashed builds. 0 errors = 10, each error -1, floor at 1. | 1-10 |
| **Completeness** | Checklist of expected deliverables (listed per task above). Percentage completed. 100% = 10, each 10% gap = -1. | 1-10 |
| **Token usage** | Recorded from Claude Code session stats at end of task. Normalized: lowest usage = 10, others scored proportionally. | 1-10 |
| **Human intervention** | Count every correction, clarification, or redo needed. 0 interventions = 10, each intervention -1, floor at 1. | 1-10 |

**Per-task score:** Sum of 4 metrics (max 40)
**Per-system score:** Sum of 4 tasks (max 160)

## Execution Plan

### Phase 0: Setup (before experiment)

1. Create three git worktrees: `experiment/ruflo`, `experiment/enhanced`, `experiment/control`
2. **System A setup:** Install ruflo in the ruflo worktree, configure MCP, verify it works on Windows
3. **System B setup:** In the enhanced worktree, create validation scripts, configure pre-commit hooks, add model routing instructions to CLAUDE.md
4. **System C setup:** No changes — vanilla worktree

### Phase 1: Run Tasks

Run each task sequentially per system. Record token usage and intervention count for each.

**Order:** C (control) first to establish baseline, then B (enhanced), then A (ruflo).

Running control first prevents the other systems' approaches from biasing the baseline.

| Run | System | Task | Worktree |
|-----|--------|------|----------|
| 1 | C | Curate | experiment/control |
| 2 | C | Review | experiment/control |
| 3 | C | Extract | experiment/control |
| 4 | C | Develop | experiment/control |
| 5 | B | Curate | experiment/enhanced |
| 6 | B | Review | experiment/enhanced |
| 7 | B | Extract | experiment/enhanced |
| 8 | B | Develop | experiment/enhanced |
| 9 | A | Curate | experiment/ruflo |
| 10 | A | Review | experiment/ruflo |
| 11 | A | Extract | experiment/ruflo |
| 12 | A | Develop | experiment/ruflo |

### Phase 2: Score

After all 12 runs complete:
1. Score each run on all 4 metrics
2. Compile results into a comparison table
3. Identify which system produced the best output for each task
4. Check if any system's output is good enough to merge directly

### Phase 3: Report

Create a wiki page (`wiki/comparisons/workflow-comparison-2026-04-10.md`) with:
- Raw scores per run
- Aggregate scores per system
- Qualitative observations (what worked, what didn't)
- Recommendation: adopt, adapt, or reject each system
- Decision on which outputs to merge into main

## Success Criteria

The experiment succeeds if:
1. All 12 runs produce scorable output (even if some systems fail tasks, that's a valid data point)
2. We have clear enough data to make a decision about which workflow to adopt
3. At least one system's OS Course 1 output is good enough to use in the actual site rebuild

## Abort Criteria

- **System A (Ruflo):** If installation fails on Windows, or if the first task consumes >2x the control's tokens due to context bloat, skip remaining ruflo tasks and note "Windows incompatible" or "context bloat" in the report
- **System B (Enhanced):** No expected abort scenarios — this is built from proven tools
- **System C (Control):** No abort — this always runs to completion as the baseline
