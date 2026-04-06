# Course Content Redesign — Implementation Plan Overview

> **For agentic workers:** This is the master plan document. Each sub-plan is a separate file that can be executed independently in order.

**Goal:** Replace JSX-per-course components with a data-driven JSON block system, step-based learning flow, lecture toggle overlay, test system with AI grading, and pipeline updates.

**Branch:** `content-redesign` (all work stays local until explicitly pushed)

## Sub-Plan Execution Order

Each sub-plan produces working, testable software. Execute in order — each depends on the previous.

| # | Plan File | What It Builds | Depends On |
|---|---|---|---|
| 1 | `2026-04-07-content-redesign-1-core-blocks.md` | Block registry, BlockRenderer, StepRenderer, CourseRenderer, sample JSON course, SubjectPage integration | Nothing |
| 2 | `2026-04-07-content-redesign-2-progress.md` | Two-dimensional progress (visited/understood), AppContext changes, InlineProgress/ProgressRing/CourseMap adaptation | Plan 1 |
| 3 | `2026-04-07-content-redesign-3-lecture-overlay.md` | Lecture toggle, lecture block components, persistence, smooth slide animation | Plans 1-2 |
| 4 | `2026-04-07-content-redesign-4-test-system.md` | Test JSON schema, TestRenderer, question components, AI grading via proxy, generated tests | Plans 1-3 |
| 5 | `2026-04-07-content-redesign-5-chat-migration.md` | Chat panel JSON context, progress data migration, existing course JSX→JSON conversion, backwards compat layer removal | Plans 1-4 |

## Verification Between Plans

After completing each sub-plan:
1. `npm run dev` — app starts without errors
2. Navigate to a subject with JSON courses — content renders
3. All existing features still work (themes, palettes, dark mode, sidebar, navigation)
4. Commit the completed sub-plan's work
