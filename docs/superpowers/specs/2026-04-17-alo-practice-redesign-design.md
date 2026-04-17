# ALO Practice Tab Redesign + Seminars Migration — Design Spec

**Date:** 2026-04-17
**Scope:** ALO (Linear Algebra & Optimization) — Practice tab + Seminars tab
**Status:** Design approved; implementation plan pending via writing-plans skill

---

## §1 Purpose & scope

Redesign the ALO Practice tab (currently a "Coming soon" placeholder at `src/content/alo/practice/Practice.jsx`) into an interactive widget-driven practice surface, and migrate the existing ALO Seminars tab (six `Seminar0N.jsx` files, each an 800-line vertical scroll) into a shared navigation shell.

Both tabs render through the same `ExerciseShell`. Practice content = 10 interactive widgets with parameterized instances + gamification. Seminars content = existing problems migrated into the shell as JSON, with permission to fix typos and inject widgets where pedagogically useful.

**Out of scope:** OS/OOP/PA practice tabs (ALO-only), ALO Tests tab (separate future spec), server-side anything (app remains pure-static on GitHub Pages).

**Alternatives considered and rejected:**
- Shell C (expandable card grid) — reproduces vertical-scroll problem once multiple cards are open.
- Shell B (horizontal tab strip alone) — degrades past ~12 problems.
- Progress model: streak-mastery ("N in a row") — wiki + external research converge on this as the #1 anti-pattern (Duolingo heart system, Hanus & Fox 2015).
- Progress model: no completion — user explicitly requested gamification.
- Desmos / GeoGebra embeds — CDN dependency, license concerns (Desmos ToS, GeoGebra GPL+NC), 1–3 MB bundle.
- MathBox — stale, non-React, poor docs.
- mathjs as default compute core — heavy (~170 kB) for the feature subset we need.
- Handsontable for matrix entry — non-free commercial license.

---

## §2 Shell architecture (A2) — sidebar + top crumb strip

### Layout (desktop ≥1024px)

```
┌────────────────────────────────────────────────────────┐
│ TopBar (existing, unchanged)                           │
├────────────────────────────────────────────────────────┤
│ ContentTypeBar + overview ring "7/10 fluent" + Today  │
├──────────┬─────────────────────────────────────────────┤
│ Sidebar  │  Crumb strip  [1✓][2✓][3✓][4•][5][6]…[12] 4/12│
│  (~22%)  ├─────────────────────────────────────────────┤
│  Group1  │                                             │
│  • P1 ✓  │  Detail pane (single problem)               │
│  • P2 ✓  │  ┌─ Problem title + metadata ─┐            │
│  • P3 ✓  │  ├─ Problem statement (KaTeX) ┤            │
│  • P4 •  │  ├─ Widget area (if any)      ┤            │
│  Group2  │  ├─ Answer capture area       ┤            │
│  • P5    │  ├─ "Generate new instance"   ┤            │
│  • …     │  └─ Show solution toggle     ─┘            │
└──────────┴─────────────────────────────────────────────┘
```

### Components

- **Sidebar (~22% width)** — problem titles + existing `ProgressRing` per problem. Scrollable if >20 problems. Lockable via existing pattern. For Practice tab, grouped by topic (Foundations, Linear systems, Factorizations, Iterative & spectral, Stability); for Seminars, flat list of the problems in the currently-active seminar (seminar-to-seminar navigation is handled by the existing subject-level `Sidebar`, not by `ExerciseShell`).
- **Crumb strip** — numeric chips with status color; always visible; horizontally scrolls on overflow. Right end shows "n / total". Clicking a chip jumps directly. Color maps to `ProgressRing` state (grey/amber/blue/green).
- **Detail pane** — renders the active problem. Crossfade (~150ms via `motion`) between problems; scroll resets to top on problem change.

### Keyboard

| Key | Action |
|-----|--------|
| `j` / `↓` | Next problem |
| `k` / `↑` | Previous problem |
| `1`–`9`, `0` | Jump to problem N (Shift+digit for 10+) |
| `Enter` | Submit widget / check answer |
| `r` | Toggle "Show solution" |
| `n` | Generate new instance (Practice only) |
| `?` | Open shortcut cheat-sheet popover |

All shortcuts have ARIA-labelled button alternatives; nothing is keyboard-only.

### Responsive

- **Tablet (768–1023px):** crumb strip remains, sidebar auto-collapses behind a restore pill.
- **Mobile (<768px):** sidebar becomes a bottom sheet triggered by a "Problems (4/12)" pill in the crumb area. Crumb strip stays (horizontally scrollable with snap). Detail pane fills the screen.

### Empty state

On first visit with no history, detail pane shows a centered "Start with Problem 1" card (reuses existing illustration style; consistent with `CourseMap` empty state).

### Components reused / new

- **Reused:** `Sidebar.jsx` layout conventions, `ProgressRing`, `Breadcrumbs`, `t()` bilingual helper.
- **New:** `ExerciseShell`, `CrumbStrip`, `ProblemDetailPane`, `ShortcutCheatSheet`.

---

## §3 Progress & gamification

### Per-widget state machine

```
           ┌── any submit (wrong) ──▶ AMBER ──┐
GREY ──────┤                                  ├──▶ BLUE ──(3 cumulative correct)──▶ GREEN
           └── any submit (correct) ──────────┘
                                              (≥1 correct; arc fills 1→3)
```

| State | Ring color | Meaning |
|-------|------------|---------|
| Grey | existing `--theme-ring-idle` (defined in `palettes.js`) | Never submitted |
| Amber | existing `--theme-ring-started` | ≥1 wrong submission, 0 correct yet |
| Blue | existing `--theme-ring-active` | ≥1 correct solve — arc fills proportionally `min(correct, 3) / 3` |
| Green | existing `--theme-ring-complete` | ≥3 cumulative correct (lifetime, no "in a row" requirement) |

A first-correct-submission jumps directly grey → blue (arc at 1/3). A first-wrong-submission goes grey → amber, and a later first-correct promotes amber → blue. Rings stay green forever; nothing erodes them. No streak. No shame.

The four CSS var names above are the conceptual contract. If the current `palettes.js` uses different names (e.g., the existing `ProgressRing` color states), the implementation reuses those; no new CSS vars are introduced for ring states. New CSS vars are introduced only for `StepPlayer` cell highlights (see §10).

### Additional gamification surfaces

1. **Today chip** in the ContentTypeBar row: `Today: 4 solves across 3 widgets`. Silent; resets at local midnight; does not notify; does not appear if zero.
2. **Tab overview ring** in the ContentTypeBar: `7/10 fluent` (counts greens). Same `ProgressRing` component. For the Practice tab the ring aggregates across all 10 widgets. For the Seminars tab the ring reflects the **currently-active seminar only** (per-seminar progress, not cross-seminar aggregate) — since each seminar is a separate route.
3. **Personal bests** — each widget defines its own PB metric (smallest residual, fewest pivots, fewest iterations, shortest time). Shown inline in the detail pane next to "Generate new instance". Updated silently when beaten.
4. **Feats** — opt-in tray, collapsed by default in the detail pane footer. Each widget defines feat conditions. Earned on condition, not count. Click the tray to expand; never auto-pops a notification.

### Explicitly NOT in scope

Leaderboards, push notifications, streak flames, hearts, time penalties with loss, social feed, mastery gates, daily seed (deferred to future).

### Practice vs Seminars gamification difference

| Surface | Practice | Seminars |
|---------|----------|----------|
| State machine (grey/amber/blue/green) | ✓ | ✓ |
| Tab overview ring | ✓ | ✓ |
| Today chip | ✓ | ✗ (seminars are reference, not drill) |
| Personal bests | ✓ | ✗ (problems are static) |
| Feats | ✓ | ✗ |

---

## §4 Widget data contract

```ts
type WidgetProps<TInstance, TAnswer> = {
  instance: TInstance;                            // current parameterized problem
  onSubmit: (answer: TAnswer) => SubmitResult;    // shell-provided; updates progress
  onGenerateInstance: () => void;                 // shell-provided; rerolls
  seed: number;                                   // for deterministic generation
  difficulty: 'easy' | 'medium' | 'hard';
};

type SubmitResult = {
  correct: boolean;
  metric?: number;            // widget-specific (residual, iterations, time, etc.)
  feats?: string[];           // ids of unlocked feats this submission
  feedback?: { en: string; ro: string };
};

type WidgetSpec = {
  id: string;                 // 'norm-visualizer'
  title: { en: string; ro: string };
  courseRef: string;          // 'alo-c1'
  groupId: string;            // sidebar group
  mode: 'exercise' | 'tool-with-qa';
  Component: React.LazyExoticComponent<any>;
  generateInstance: (seed: number, difficulty: Difficulty) => TInstance;
  pbMetric?: { id: string; label: { en: string; ro: string }; lowerIsBetter: boolean };
  feats: Array<{
    id: string;
    label: { en: string; ro: string };
    condition: (history: WidgetHistory) => boolean;
  }>;
};

type WidgetHistory = {
  attempts: number;
  correct: number;
  lastSubmission?: SubmitResult;
  // full history is NOT retained; feats are evaluated on current + lastSubmission
};
```

### Per-widget localStorage shape

```ts
'alo.practice.<widgetId>' = {
  attempts: number;
  correct: number;
  bestMetric: number | null;
  lastSolveAt: string;        // ISO-8601
  feats: string[];            // earned feat ids
  todayCount: number;         // resets at midnight
  todayDate: string;          // yyyy-mm-dd for reset detection
};
```

Aggregate counters (tab overview ring, today chip) are derived on render, not stored.

### Shell vs widget responsibilities

- **Shell:** mount widget lazy on problem activation; generate a fresh seed from `Date.now()` on every mount and on every "Generate new instance" click (no persisted seed in v1 — a stored seed is reserved for the future "daily seed" feature in §13); receive `SubmitResult`; update localStorage; recompute ring color; animate state transitions.
- **Widget:** render its UI from `instance`; capture interaction; call `onSubmit({ correct, metric?, feats? })` when the student commits.

---

## §5 Widget catalog

Each entry: purpose · mode · instance generation · PB metric · feats · course ref.

### W1. Matrix Input + Display (`matrix-input`)
- **Purpose:** foundational primitive used by other widgets, also standalone: "type a matrix, see it formatted; identify properties."
- **Mode:** `tool-with-qa` — Q&A: "is this matrix symmetric? upper triangular? diagonal?"
- **Instance:** random m×n with m,n ∈ [2,5], entries ∈ ℤ ∩ [-9,9], optional special-form (sym / triangular / diag) chosen by seed.
- **PB:** time-to-correct (seconds, lower better).
- **Feats:** `quick-eye` (correct in <5s), `flawless-five` (5 correct in one session).
- **Course:** C1.

### W2. Norm Visualizer (`norm-visualizer`)
- **Purpose:** drag a 2D point inside the unit balls of ‖·‖₁, ‖·‖₂, ‖·‖∞; see all three norms update live; satisfy a target predicate.
- **Mode:** `exercise` — target: "find a point on the boundary of ‖·‖₁ but interior to ‖·‖∞".
- **Instance:** seeded target predicate drawn from a hand-authored catalog of ~12 predicates (boundary/interior constraints on any pair of norms; mix of single- and joint-constraint).
- **PB:** distance from optimal point (lower better).
- **Feats:** `corner-shot` (hit an exact ‖·‖₁ corner ±0.01), `triple-tangent` (point on all three boundaries simultaneously).
- **Course:** C2.

### W3. Gauss Elimination Step-Through (`gauss-elim`)
- **Purpose:** student picks each pivot and row-op; widget animates row reduction; verifies correctness step by step.
- **Mode:** `exercise` — success = reach REF correctly.
- **Instance:** random n×n with n ∈ [3,5], small int entries. Seed controls singularity and pivoting need.
- **PB:** total row operations (add-multiples + swaps) used to reach REF (lower better).
- **Feats:** `no-swap` (reach REF with zero row swaps on an instance where partial pivoting isn't required), `clean-pivot` (no denominator growth beyond a small threshold — exactness checked via Fraction.js).
- **Course:** C4.

### W4. LU Decomposition Step-Through (`lu-decomp`)
- **Purpose:** Doolittle or Crout (toggle); animate L and U filled column-by-column; verify A = LU.
- **Mode:** `exercise`.
- **Instance:** random n×n with n ∈ [3,4], guaranteed LU-decomposable for the chosen variant (no zero pivot).
- **PB:** mean residual ‖A − LU‖∞ (lower better).
- **Feats:** `doolittle-clean` (Doolittle without rounding), `permuted-lu-master` (handle a seed requiring a row permutation — i.e. solve PA = LU).
- **Course:** C5.

### W5. Givens QR (`givens-qr`)
- **Purpose:** apply Givens rotations one at a time to zero subdiagonal entries; 2D rotation animation per step; build R while accumulating Qᵀ.
- **Mode:** `exercise`.
- **Instance:** random n×n with n ∈ [3,4]; seeds chosen so each subdiagonal entry yields a (c, s) pair where at least one of c, s is a "nice" value (0, ±1, ±1/√2, ±3/5, ±4/5, etc.) — the widget exposes the full `(c, s, √(a²+b²))` calculation either way, but seed curation keeps the mental-arithmetic case common.
- **PB:** number of rotations (lower better).
- **Feats:** `minimal-rotations` (exactly n(n−1)/2 rotations), `unit-q` (final ‖Q − Qˢʸˢ‖₂ < 1e−6).
- **Course:** C6.

### W6. Householder QR (`householder-qr`)
- **Purpose:** pick a column, generate reflection vector v, watch the 3D reflection animation (R3F) zero out the column; build R.
- **Mode:** `exercise`.
- **Instance:** random n×n with n ∈ [3,4]; first instances are n=3 for the 3D visualization.
- **PB:** mean residual ‖QR − A‖∞ (lower better).
- **Feats:** `single-shot` (correctly identify v on first try for all columns), `orthogonal` (Q passes QᵀQ = I within ε).
- **Course:** C6.

### W7. Gram–Schmidt Orthogonalization (`gram-schmidt`)
- **Purpose:** select vectors one at a time; widget animates projection subtraction; verify orthonormality at end. 2D mode for n=2,3 vectors; 3D mode (R3F) for 3 vectors in ℝ³.
- **Mode:** `exercise`.
- **Instance:** seeded set of 2–3 vectors with integer entries. Some seeds plant a linearly-dependent set (student must flag it).
- **PB:** number of arithmetic ops the student used (counted by widget).
- **Feats:** `clean-norm` (all final ‖uᵢ‖ = 1 exactly when input allows), `parallel-spotter` (correctly flag a linearly-dependent instance).
- **Course:** C2 and C6.

### W8. Power Method (`power-method`)
- **Purpose:** iterate xₖ₊₁ = A·xₖ / ‖A·xₖ‖; live plot of Rayleigh quotient convergence and angle to dominant eigenvector.
- **Mode:** `tool-with-qa` — "what's the dominant eigenvalue?" + numeric input.
- **Instance:** random n×n with n ∈ [3,4], dominant eigenvalue gap controlled by seed (easy = large gap, hard = small).
- **PB:** iterations to converge within tolerance (lower better).
- **Feats:** `fast-converge` (≤5 iterations), `gap-spotter` (identify the gap ratio correctly).
- **Course:** C7.

### W9. Iterative Solvers (`iterative-solvers`)
- **Purpose:** solve Ax = b via Jacobi / Gauss-Seidel / SOR (toggle); animate residual decay on log plot; student picks ω for SOR.
- **Mode:** `tool-with-qa` — "which method converges fastest? what ω is best?"
- **Instance:** random diagonally-dominant n×n with n ∈ [3,5].
- **PB:** iterations to ‖rₖ‖ < 1e−6.
- **Feats:** `omega-tuner` (find ω within 0.05 of optimal), `gs-beats-jacobi` (correctly predict method ordering).
- **Course:** C7.

### W10. Condition Number Playground (`condition-number`)
- **Purpose:** enter a matrix, see κ(A) computed live; perturb b by Δb, see Δx amplified by κ; identify ill-conditioned cases.
- **Mode:** `tool-with-qa` — "by what factor is the relative error amplified?"
- **Instance:** seeded matrices spanning κ ∈ {O(1), O(10²), O(10⁶), O(10¹⁰)} — Hilbert / Vandermonde / random.
- **PB:** none (exploration widget).
- **Feats:** `hilbert-spotter` (correctly identify a Hilbert variant), `near-singular` (find a perturbation that flips the solution sign).
- **Course:** C3.

### Sidebar grouping for Practice tab

- **Foundations:** W1, W2
- **Linear systems:** W3, W4
- **Factorizations:** W5, W6, W7
- **Iterative & spectral:** W8, W9
- **Stability:** W10

---

## §6 Seminar tab migration

- **Route model:** each seminar remains a distinct route (e.g., `/#/y1s2/alo/seminars/s1`), reached via the existing subject-level `Sidebar` course/seminar picker. The new `ExerciseShell` lives **inside** a single seminar route. The shell's own sidebar therefore lists the **problems** of that one seminar (not all seminars at once). Cross-seminar navigation stays in the subject sidebar, unchanged.
- **Rendering path:** swap each `Seminar0N.jsx` from a vertical JSX layout into a JSON-backed list of problems consumed by the shared `ExerciseShell`. Problem statement, `MultipleChoice`, and `Toggle` (proof reveal) remain first-class — they become native block types inside `ProblemDetailPane`.
- **Content file:** `src/content/alo/seminars/seminar-0N.json`. Each problem is:
  ```ts
  {
    id: 'alo-s1-p4',
    title: { en: string, ro: string },
    statement: { en: string, ro: string },   // supports inline $...$ KaTeX
    blocks: Block[],
    widgets?: Array<{ id: WidgetId; mode: 'tool' | 'reveal' }>
  }
  ```
  where `Block` ∈ `mc | proof-toggle | definition | theorem | code | equation | learn`.
- **Migration procedure (per seminar):**
  1. Parse the existing `.jsx` problem-by-problem into JSON.
  2. Render-test via the shell.
  3. Cold review for typos, math errors, unclear wording (fix in place).
  4. Identify 0–2 problems per seminar where a catalog widget materially helps understanding; wire it in (for example Seminar 2's Gram–Schmidt problem links W7 inline).
  5. Ship.
- **Widget-injection rules:** a widget is only added if (a) it already exists in the catalog, and (b) it replaces or augments a step the student would otherwise have to imagine. No new widgets are authored specifically for a seminar; Practice tab is the authoring surface.
- **Deprecation:** old `.jsx` files stay on disk until the migration ships and the app compiles clean for one merge cycle. Then they are deleted.

---

## §7 Tech stack

| Role | Library | Notes |
|------|---------|-------|
| Matrix compute | `ml-matrix` | ~35 kB gz; LU, QR, SVD, EVD, Cholesky. Lazy per widget. |
| Exact arithmetic | `fraction.js` | ~3 kB gz; for Gauss/LU rational row-ops. |
| 2D viz | D3 submodules | `d3-scale`, `d3-selection`, `d3-drag`, `d3-path`, `d3-shape`. React renders SVG. |
| 3D viz | `@react-three/fiber` + `@react-three/drei` | Lazy; only in W6 + W7-3D. |
| Animation | `motion` (Framer Motion) | Already installed. Crossfades, `MotionValue` for numeric tweens. |
| Math render | KaTeX | Already installed. |
| Math input | Custom focus-ring `<input>` grid | ~80 lines, no new dep. |

**Rejected (with reason):** Desmos (CDN + API key + ToS), GeoGebra (GPL + commercial license + 3 MB), MathBox (stale), mathjs default (heavy for subset needed), handsontable (non-free commercial).

---

## §8 Animation & step-through pattern

**Snapshot + scrub architecture:**

1. Widget runs the algorithm **once** on `instance`, producing `Step[]`:
   ```ts
   type Step = {
     matrix: number[][] | Fraction[][];
     highlights: { rows?: number[]; cols?: number[]; cells?: Array<[number, number]> };
     label: { en: string; ro: string };
     metric?: number;
   };
   ```
2. Widget renders `steps[currentIndex]` with KaTeX + colored cells (via CSS vars).
3. Transport control (built in-house, ~80 lines) = play / pause · step back / forward · restart · scrubber (`<input type="range">` driving `currentIndex`). Keyboard: Space play, ←/→ step, Home/End jump.
4. `motion`'s `MotionValue` interpolates numeric cell entries between `steps[i]` and `steps[i+1]` on a 300ms tween. Respects `prefers-reduced-motion`.
5. Zero live compute during playback — deterministic, fast, scrubbable.

**Shared component:** `<StepPlayer steps={} currentIndex={} onIndexChange={} />` used by W3, W4, W5, W6, W7, W8, W9.

---

## §9 Math input / display primitives

- **`<MatrixInput rows cols value onChange mode />`** — focus-ring grid of `<input type="text">` cells. Arrow-key navigation between cells. Accepts integers and simple fractions (`3/2`) parsed via `fraction.js`. Emits `number[][]` or `Fraction[][]` depending on `mode`. Used by W1, W3, W4, W5, W6, W9, W10.
- **`<MatrixDisplay value highlight />`** — KaTeX-rendered bracketed matrix with optional cell highlighting. Used by all `tool-with-qa` widgets and `StepPlayer`.
- **`<VectorInput />`** — row form of `MatrixInput`, n=1 row.
- **Equation display** — existing `equation` block type from the course pipeline is reused for inline display.
- **Validation:** inline red border + tooltip on offending cells; submit is disabled until valid.

---

## §10 Bilingual + theming

- All widget strings pass through the existing `t(en, ro)` helper from `useApp()`. `WidgetSpec.title`, `feats[].label`, instance descriptions, error messages — all bilingual.
- Math content (LaTeX, equations, variable names) stays in English — consistent with existing course content convention.
- Colors — all widget chrome uses `var(--theme-*)` CSS vars. Accent blue `#3b82f6` for active state. New highlight vars for `StepPlayer`:
  - `--accent-pivot` (amber family)
  - `--accent-strike` (muted, for eliminated cells)
  - `--accent-target` (green family)
  Dark-mode variants defined in each palette in `src/theme/palettes.js`.
- Existing `ProgressRing` CSS vars are reused unchanged.

---

## §11 Bundle strategy

- Each widget = `React.lazy(() => import('./widgets/<id>.jsx'))` — one chunk per widget.
- Widget is only imported when the user clicks into its problem in the sidebar (not when the shell mounts). This requires a `useState` gate + `Suspense` fallback skeleton.
- `ml-matrix` + `fraction.js` imported from a shared `src/content/alo/linalg/` module — Vite/Rollup hoists to a shared chunk automatically. Confirm no duplication via `vite build` output.
- `@react-three/fiber` + `@react-three/drei` imported only inside W6 and W7 chunks. ~180 kB gz loads only when a 3D widget is first opened.
- D3 submodules imported per-widget as needed; tree-shaken. No `d3` root import.
- `StepPlayer` is shared (not lazy) — small, used by 7 of 10 widgets.
- Post-build check: `npm run build` and confirm main chunk remains < 350 kB gz (current baseline ≈ 280 kB). R3F must never end up in main.

---

## §12 Accessibility

- Every keyboard shortcut has an ARIA-labelled button alternative; no keyboard-only action paths.
- `ProblemDetailPane` uses `role="region"` + `aria-labelledby` pointing at the problem title.
- Crumb chips: `role="listitem"` inside `role="list"`; `aria-current="true"` on the active chip.
- `MatrixInput` cells use `aria-label="row 1 column 2"`; arrow-key navigation is predictable.
- KaTeX equations keep their default `aria-label` (LaTeX source) per the existing wiki mandate (`wiki/concepts/Math & Equation UX.md`).
- Feat pop-ins (never auto-triggered; expanded only on user click) and `StepPlayer` transitions are gated on `prefers-reduced-motion`.
- Color is never the sole signifier for state — ring state is reinforced by arc fill proportion, not color alone.
- `StepPlayer` is keyboard-operable: Space play/pause, ←/→ step, Home/End jump.
- Cheat-sheet popover (`?`) lists all shortcuts; dismissible via Esc.

---

## §13 Out of scope / deferred

### Deferred (explicit future work)

- GitHub-style solve-heatmap per widget
- Daily seed (shared seeded instance across users for classmate talk)
- MathLive / formula-entry widget
- Feat export / share card
- ALO Tests tab (separate subject area, separate spec)

### Out of scope (not happening from this spec)

- Redesign of Practice tabs for OS / OOP / PA subjects
- Leaderboards or any social/comparative feature
- Push notifications / streaks / hearts / timers-with-loss
- Mastery gates or prerequisite locking
- Any server-side component
- Changelog / release-notes surface

---

## Implementation plan hand-off

This spec is the authoritative design. The implementation plan (produced by the `writing-plans` skill) will split the work into batches of three widgets each, with a review gate between batches per user preference:

- **Shared infrastructure** (must land first): `ExerciseShell`, `CrumbStrip`, `ProblemDetailPane`, `MatrixInput`, `MatrixDisplay`, `StepPlayer`, `WidgetSpec` registry, localStorage shape, `ProgressRing` state-machine extension, CSS vars for highlights.
- **Batch 1 — foundations + Gauss punch:** W1, W2, W3.
- **Batch 2 — factorizations:** W4, W7, W5.
- **Batch 3 — advanced:** W6, W8, W9.
- **Bonus / cut decision after Batch 3:** W10.
- **Seminars migration** runs in parallel with Batches 1–3 as shell infrastructure lands — one seminar per migration cycle.

Each batch ends with a cold review, bug-fix loop until zero regressions, and a push. Only after the batch is clean does the next batch start.
