# UX/UI Redesign — Design Spec

**Date:** 2026-04-07
**Branch:** `content-redesign`
**Status:** Design phase — brainstorming complete, spec written, plan NOT yet written

## Context

User wants to improve course layout, information curation quality, and overall UX. Research phase consulted: internal component audit (every file read), web research (NN/g, Springer, Baymard, WCAG), Gemini 2.5 Flash, and multiple research agents. All sources converged on the same priorities.

### Root Causes Found

1. **Animation system is hardcoded, not data-driven.** `AnimationBlock.jsx` only routes 3 string-matching variants (kmp, boyer-moore, rabin-karp) to `StringMatchAnimation.jsx`. Everything else renders a placeholder. The AI curation pipeline has no guidance on when to include visuals, so it generates 0 animation blocks.

2. **Visual design has measurable accessibility/UX issues.** 10px labels fail WCAG AA, dark mode callouts invisible (6% color-mix), quiz options cramped, no typography scale.

3. **Missing learning flow features** that all major platforms (Khan Academy, Duolingo, Brilliant, Coursera) have: resume-where-left-off, targeted quiz feedback, progress legend.

---

## Workstream 1: Visual Polish

### 1.1 Block Label Size Fix
**What:** Change `text-[10px] font-bold uppercase tracking-widest` to `text-xs font-semibold uppercase tracking-wide` across all block components.

**Files to modify:**
- `src/components/blocks/learn/LearnBlock.jsx`
- `src/components/blocks/definition/DefinitionBlock.jsx`
- `src/components/blocks/layout/CalloutBlock.jsx`
- `src/components/blocks/media/CodeBlock.jsx`
- `src/components/blocks/interactive/AnimationBlock.jsx`
- `src/components/blocks/assessment/ThinkBlock.jsx`
- Any other block with `text-[10px]`

**Why:** 10px is below WCAG AA minimum (12px). All sources rated MUST DO.

### 1.2 Quiz Option Padding
**What:** Change quiz option padding from `p-2.5` to `p-3.5`, gap from `gap-2` to `gap-3`.

**File:** `src/components/blocks/assessment/QuizBlock.jsx`

**Why:** 10px padding too cramped for students to weigh choices. Research: touch targets need 44px minimum.

### 1.3 Dark Mode Callout Colors
**What:** Increase color-mix tint from 6% to 12%, border from 15% to 25%.

**Files:**
- `src/components/blocks/layout/CalloutBlock.jsx`
- `src/components/ui/Box.jsx` (legacy, same pattern)

**Change:**
```
Before: background: color-mix(in srgb, ${color} 6%, var(--theme-card-bg))
After:  background: color-mix(in srgb, ${color} 12%, var(--theme-card-bg))

Before: border: 1px solid color-mix(in srgb, ${color} 15%, var(--theme-border))
After:  border: 1px solid color-mix(in srgb, ${color} 25%, var(--theme-border))
```

**Why:** 6% tint produces invisible backgrounds in dark mode. Callout types (tip/warning/trap) become indistinguishable.

### 1.4 Typography Scale
**What:** Establish consistent 5-level scale across all components:
- H1: `text-xl font-bold` — course titles
- H2: `text-lg font-semibold` — section headers
- H3: `text-base font-medium` — subsection headings
- Body: `text-[15px] leading-relaxed` — main content (bump from 14px)
- Label: `text-xs font-semibold uppercase tracking-wide` — block type labels

**Files:** All block components in `src/components/blocks/`, plus legacy UI components.

**Why:** Current font sizes jump inconsistently. Research: 16-18px body optimal for reading, 15px is a compromise that doesn't break existing layouts.

### 1.5 Theme Switch Transition
**What:** Add `transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease` to body in `src/index.css`.

**Why:** Instant theme switching is jarring. Low effort, nice polish.

---

## Workstream 2: Data-Driven Animation System

### Architecture: Specialized Renderers + Motion (framer-motion)

**Decision:** Option B (specialized renderers) with Motion library for smooth animations. Validated by:
- No existing npm libraries for embeddable algorithm visualization (all are standalone demo apps)
- D3 fights React's DOM model
- Canvas loses Tailwind/theme integration
- Motion's `layout` prop auto-animates element reordering — perfect for sorting
- ~3KB gzipped, React 19 compatible, actively maintained

**New dependency:** `motion` (framer-motion)

### Components to Build

#### 2.1 StepPlayer (shared controls)
**File:** `src/components/blocks/interactive/StepPlayer.jsx` (~50 lines)
**Props:** `steps`, `currentStep`, `onStepChange`, `playing`, `onPlayPause`, `speed`, `onSpeedChange`
**UI:** Play/pause button, step-back, step-forward, progress scrubber, step counter ("Step 4 / 12"), speed slider, scrollable step log showing labels.

#### 2.2 ArrayRenderer
**File:** `src/components/blocks/interactive/ArrayRenderer.jsx` (~80 lines)
**Covers:** Bubble sort, insertion sort, selection sort, quicksort, mergesort, binary search, linear search.
**Display:** Row of `<motion.div>` bars/cells. Height represents value. Color states: comparing (red), swapped (green), sorted (muted green), default (grey), pivot (amber).
**JSON schema:**
```json
{
  "renderer": "array",
  "meta": { "algorithm": "Bubble Sort", "description": { "en": "...", "ro": "..." } },
  "config": { "display": "bars" },
  "steps": [
    {
      "array": [5, 3, 8, 1],
      "highlights": { "comparing": [0, 1], "sorted": [] },
      "label": { "en": "Compare 5 and 3", "ro": "Compară 5 și 3" }
    }
  ]
}
```

#### 2.3 GraphRenderer
**File:** `src/components/blocks/interactive/GraphRenderer.jsx` (~120 lines)
**Covers:** BFS, DFS, Dijkstra, Prim, Kruskal, topological sort.
**Display:** SVG with `<motion.circle>` nodes + `<motion.line>` edges. Node states: visited (green fill), active (blue pulse), queued (dashed yellow border), unvisited (grey border).
**JSON schema:**
```json
{
  "renderer": "graph",
  "meta": { "algorithm": "BFS", "description": { "en": "...", "ro": "..." } },
  "graph": {
    "nodes": [{ "id": "A", "x": 50, "y": 20 }, ...],
    "edges": [{ "from": "A", "to": "B", "weight": null }, ...]
  },
  "steps": [
    {
      "visited": ["A"], "active": "A", "queue": ["B", "C"],
      "edgeHighlights": [{ "from": "A", "to": "B" }],
      "label": { "en": "Visit A, enqueue B and C", "ro": "..." }
    }
  ]
}
```

#### 2.4 TableRenderer
**File:** `src/components/blocks/interactive/TableRenderer.jsx` (~60 lines)
**Covers:** Fibonacci, knapsack, LCS, edit distance, matrix chain.
**Display:** Grid of `<motion.div>` cells. States: computed (green tint), dependency (blue border), computing (amber glow + pulse), pending (dashed grey border, "?").
**JSON schema:**
```json
{
  "renderer": "table",
  "meta": { "algorithm": "Fibonacci DP", "description": { "en": "...", "ro": "..." } },
  "config": { "rows": ["F(0)", "F(1)", ...], "cols": ["Value"] },
  "steps": [
    {
      "fills": { "0,0": 0 },
      "active": "0,0",
      "dependencies": [],
      "label": { "en": "Base case: F(0) = 0", "ro": "..." }
    }
  ]
}
```

#### 2.5 AnimationBlock Update
**File:** `src/components/blocks/interactive/AnimationBlock.jsx`
**Change:** Detect new format (`renderer` + `data` fields) vs old format (`variant` field). Route new format to ArrayRenderer/GraphRenderer/TableRenderer. Old format continues working as-is.

```jsx
if (block.renderer) {
  // New data-driven format
  switch (block.renderer) {
    case 'array': return <ArrayRenderer data={block.data} />;
    case 'graph': return <GraphRenderer data={block.data} />;
    case 'table': return <TableRenderer data={block.data} />;
  }
}
// Legacy format — existing KNOWN_VARIANTS logic unchanged
```

#### 2.6 Block Registry Update
**File:** `src/components/blocks/registry.js`
**Change:** No change needed — `animation` type already registered, AnimationBlock handles routing internally.

### Pipeline Changes (Stage 4 prompt)
After animation components are built, update the curate skill's Stage 4 instructions to:
1. List available renderers + JSON schemas as examples
2. Add rules: "Any sorting/searching algorithm MUST have an `array` animation block"
3. "Any graph traversal MUST have a `graph` animation block"
4. "Any DP algorithm with a table MUST have a `table` animation block"

This is part of Plan 6 (pipeline JSON update) — do AFTER animation components work.

---

## Workstream 3: Learning Flow

### 3.1 Resume Where Left Off

**Pattern:** Explicit resume banner + progress-aware course map (validated by Khan Academy, Duolingo, Coursera — no major platform auto-navigates).

**Implementation:**
- Store `lastStep` per course in localStorage: `{ "pa-c1": { "lastStep": "pa-c1-binary-search", "timestamp": 1712500000 } }`
- On CourseMap render, check for `lastStep`. If exists and course not 100% complete, show resume banner.
- Resume banner: blue gradient card with play icon, step title, "Resume" button. Auto-hides if first visit.
- CourseMap tiles: completed = green border + checkmark, next = blue glow + pulse, unstarted = dimmed/muted.

**Course map layout: DECIDED — keep current grid.** Multiple alternatives explored (zigzag, vertical list, inline circles, accordion, timeline) with mockups. User decided to keep existing grid layout, enhanced with resume banner + progress-aware tile states.

**Files to modify:**
- `src/components/ui/CourseMap.jsx` — replace current grid with chosen layout
- `src/components/blocks/CourseRenderer.jsx` — save lastStep to localStorage on step navigation
- `src/contexts/AppContext.jsx` — add `lastStep` tracking if not using raw localStorage

### 3.2 Targeted Quiz Feedback

**Pattern:** No retry → instant targeted feedback → optional deep dive. Validated by Brilliant.org and Duolingo internal research (retry decreases completion without improving retention).

**UX flow:**
1. Student selects wrong answer → instant red highlight on chosen + green on correct
2. Per-distractor explanation appears: "Why A is wrong" (2-3 sentences) + "Why B is correct" (2-3 sentences)
3. Optional "Review this in Step N: [Title]" link navigates to relevant step
4. No retry button. Wrong questions can be re-queued in end-of-course review quiz (future feature).

**JSON schema change for quiz blocks:**
```json
{
  "type": "quiz",
  "questions": [{
    "question": { "en": "...", "ro": "..." },
    "options": [
      {
        "text": { "en": "O(n)", "ro": "O(n)" },
        "correct": false,
        "explanation": { "en": "O(n) is linear search, not binary.", "ro": "..." }
      },
      {
        "text": { "en": "O(log n)", "ro": "O(log n)" },
        "correct": true,
        "explanation": { "en": "Each comparison halves the search space.", "ro": "..." }
      }
    ],
    "reviewStep": "pa-c1-binary-search"
  }]
}
```

**Files to modify:**
- `src/components/blocks/assessment/QuizBlock.jsx` — add per-option explanation display, "Why X is wrong/correct" panels, "Review in Step N" link
- Curate pipeline Stage 4 prompt — instruct AI to generate per-distractor explanations + reviewStep references

### 3.3 Mobile Sidebar Fix

**Pattern:** Replace side overlay (64% of screen) with bottom sheet drawer on mobile.

**Behavior:**
- Mobile: Bottom sheet with drag handle. Minimized = horizontal pill chips (course numbers). Swipe up = full course list. Swipe down = minimize.
- Desktop: Keep current sidebar (hover-to-peek, lockable). No change.

**Files to modify:**
- `src/components/layout/Sidebar.jsx` — add mobile bottom sheet variant
- May need a new `BottomSheet.jsx` component or use CSS transforms

---

## Implementation Order

1. **Visual polish** (1.1-1.5) — quick wins, ~1-2 hours. Do first for immediate visible improvement.
2. **Animation system** (2.1-2.6) — largest effort, ~4-6 hours. Install Motion, build StepPlayer, then renderers one at a time. Test with sample JSON.
3. **Quiz feedback** (3.2) — medium effort, ~2 hours. Modify QuizBlock + update quiz JSON schema.
4. **Resume + course map** (3.1) — medium effort, ~3 hours. Depends on layout decision (D1 vs D2 vs other).
5. **Mobile sidebar** (3.3) — medium effort, ~2 hours. Do last, isolated change.
6. **Pipeline prompt updates** — after all components work. Part of Plan 6.

## Status

All 3 workstreams (visual polish, animation system, learning flow) have been **implemented in app code** by a previous session. What remains:

- [x] WS1: Visual polish — DONE (commits b7caca3 through 3404193)
- [x] WS2: Animation system — DONE (commits d15e879 through ae4fe81)
- [x] WS3: Learning flow — DONE (commits b040e6a through 6623de0)
- [x] Curate skill updated — animation renderers + quiz feedback schemas added
- [x] Adding-course skill updated — block type table updated
- [ ] End-of-course review quiz — future feature, not in scope

## Research Sources

- NN/g: Scrolling and Attention (57% above fold, 74% in first two screenfuls)
- Springer 2024: Interactive step-through > passive animation for learning
- Baymard Institute: 50-75 char line length, 66 ideal
- Frontiers in Psychology 2021: Elaborated feedback didn't outperform simple correction (cue overload)
- Hypercorrection effect (InnerDrive): High-confidence wrong answers corrected more effectively
- Duolingo internal research: Retry before reveal decreased completion rates
- Brilliant.org pattern: Wrong → targeted explanation → no retry
- Motion (framer-motion): Layout FLIP animations, ~3KB, React 19 compatible
- No existing npm algorithm visualization libraries exist as embeddable components
