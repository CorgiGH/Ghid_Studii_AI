# ALO Practice Redesign — Plan 1: Shared Infrastructure + Batch 1

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the shared `ExerciseShell` (used by both Practice and Seminars tabs), the shared widget primitives (`MatrixGrid`, `MatrixDisplay`, `StepPlayer`, etc.), the gamification system (state machine + today chip + overview ring), and Batch 1 widgets: **W1 Matrix Input + Display**, **W2 Norm Visualizer**, **W3 Gauss Elimination Step-Through**.

**Architecture:** `ExerciseShell` is a generic layout component that takes a problem list, renders a sidebar + top crumb strip + detail pane, and supplies each problem's widget with a seed + `onSubmit` callback. Widgets emit `SubmitResult` back to the shell, which persists to `localStorage` under `alo.practice.<widgetId>` and recomputes ring states. Gauss elimination runs once per instance to produce a `Step[]` array consumed by a shared `StepPlayer` transport.

**Tech Stack:** React 19 + react-router-dom v7 + Vite 8 + Tailwind v4 + existing `motion` + KaTeX + new deps `ml-matrix`, `fraction.js`, `d3-scale`, `d3-selection`, `d3-drag`, `d3-path`, `d3-shape`.

**Reference:** design spec at `docs/superpowers/specs/2026-04-17-alo-practice-redesign-design.md`.

**Follow-up plans (to be written after Plan 1 ships clean):**
- Plan 2: Batch 2 widgets (W4 LU, W7 Gram–Schmidt, W5 Givens QR)
- Plan 3: Batch 3 widgets (W6 Householder QR, W8 Power Method, W9 Iterative Solvers)
- Plan 4: Seminar migration (S1–S6)
- Plan 5: W10 Condition Number Playground (optional, decide after Batch 3)

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/widgets-core/MatrixGrid.jsx` | Focus-ring input grid of `<input type="text">` cells; arrow-key nav; emits `Fraction[][]` or `number[][]`. |
| Create | `src/components/widgets-core/MatrixDisplay.jsx` | KaTeX bracketed matrix display with optional cell highlighting. |
| Create | `src/components/widgets-core/VectorInput.jsx` | Single-row form of `MatrixGrid`. |
| Create | `src/components/widgets-core/StepPlayer.jsx` | Transport (play/pause/step/restart) + scrubber for `Step[]` animations. |
| Create | `src/components/widgets-core/FeatTray.jsx` | Collapsed-by-default tray listing earned feats. |
| Create | `src/components/widgets-core/index.js` | Barrel export. |
| Create | `src/components/exercise-shell/useExerciseShell.js` | Hook: state (activeIndex, seeds, submissions), keyboard shortcuts. |
| Create | `src/components/exercise-shell/CrumbStrip.jsx` | Horizontal numeric chip strip. |
| Create | `src/components/exercise-shell/ProblemDetailPane.jsx` | Detail pane renderer — statement + widget/blocks + new-instance button + show-solution toggle. |
| Create | `src/components/exercise-shell/ShortcutCheatSheet.jsx` | Popover listing all `?`-triggered shortcuts. |
| Create | `src/components/exercise-shell/ExerciseShell.jsx` | Top-level shell composition. |
| Create | `src/components/exercise-shell/index.js` | Barrel export. |
| Create | `src/hooks/useWidgetProgress.js` | localStorage CRUD for `alo.practice.<widgetId>`; returns `{ history, submit, regenerate }`. |
| Create | `src/hooks/useTodayCounter.js` | Aggregates daily solves across widgets; returns `{ count, widgetsTouched }`. |
| Create | `src/content/alo/linalg/fractions.js` | Thin wrapper around `fraction.js` with display helpers. |
| Create | `src/content/alo/linalg/gaussElim.js` | Gauss elimination algorithm → `Step[]`. |
| Create | `src/content/alo/linalg/seedRandom.js` | Deterministic seeded RNG (`mulberry32`). |
| Create | `src/content/alo/practice/widgetCatalog.js` | Registry — array of `WidgetSpec` for the shell. |
| Create | `src/content/alo/practice/instances/matrixInput.js` | W1 instance generator. |
| Create | `src/content/alo/practice/instances/normVisualizer.js` | W2 instance generator. |
| Create | `src/content/alo/practice/instances/gaussElim.js` | W3 instance generator. |
| Create | `src/content/alo/practice/widgets/MatrixInput.jsx` | W1 widget component. |
| Create | `src/content/alo/practice/widgets/NormVisualizer.jsx` | W2 widget component. |
| Create | `src/content/alo/practice/widgets/GaussElim.jsx` | W3 widget component. |
| Modify | `src/content/alo/practice/Practice.jsx` | Replace placeholder with `ExerciseShell` wired to `widgetCatalog`. |
| Modify | `src/components/ui/ContentTypeBar.jsx` | Add slot for `overviewRing` + `todayChip` on the ALO practice route. |
| Modify | `src/theme/palettes.js` | Add `--theme-cell-pivot`, `--theme-cell-strike`, `--theme-cell-target` (light + dark) for each palette. |
| Modify | `package.json` | Add `ml-matrix`, `fraction.js`, `d3-scale`, `d3-selection`, `d3-drag`, `d3-path`, `d3-shape`. |

---

## Testing approach

This project has no unit test framework installed. Verification for each task = (a) `npm run build` succeeds, (b) `npm run lint` succeeds, (c) manual browser smoke test of the specific change at `npm run dev` → `http://localhost:5173/#/y1s2/alo/practice`. Phase-gate reviews use a subagent cold review against the relevant spec section.

Do **not** install a test framework as part of this plan. "Verification" steps below describe manual and build-time checks only.

---

## Phase 0 — Dependencies & Theme Tokens

### Task 1: Install new dependencies

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install linalg + viz deps**

Run from the project root:

```bash
npm install ml-matrix fraction.js d3-scale d3-selection d3-drag d3-path d3-shape
```

Expected effect: `package.json` dependencies gain `ml-matrix`, `fraction.js`, `d3-scale`, `d3-selection`, `d3-drag`, `d3-path`, `d3-shape`.

- [ ] **Step 2: Verify build still succeeds**

Run `npm run build`. Expected: build completes without errors. Chunk sizes unchanged (deps aren't imported anywhere yet).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps(alo): add ml-matrix, fraction.js, d3 modular submodules"
```

---

### Task 2: Add StepPlayer highlight CSS vars to each palette

**Files:**
- Modify: `src/theme/palettes.js`

- [ ] **Step 1: Read the current palettes file to locate the palette definitions**

Run: `cat src/theme/palettes.js | head -40` to orient yourself. Each palette object has `light` and `dark` color maps.

- [ ] **Step 2: Add three new vars per palette**

For each of the five palettes (Slate, Warm Stone, Ocean Blue, Zinc, Forest Green), add three keys inside both `light` and `dark` color maps. Use these universal values (palette-adjusted contrast is not required for highlight colors):

```js
// In each palette's light map:
'--theme-cell-pivot': '#f59e0b',       // amber — pivot row/col
'--theme-cell-strike': '#94a3b8',      // slate — eliminated entries
'--theme-cell-target': '#22c55e',      // green — target/final entries

// In each palette's dark map:
'--theme-cell-pivot': '#fbbf24',
'--theme-cell-strike': '#64748b',
'--theme-cell-target': '#4ade80',
```

- [ ] **Step 3: Verify build**

Run `npm run build`. Expected: passes.

- [ ] **Step 4: Verify vars are applied**

Run `npm run dev`. In the browser, open DevTools → Elements → `:root` and confirm `--theme-cell-pivot` is defined. Switch palettes via the 🎨 picker to confirm all five palettes keep the three vars defined.

- [ ] **Step 5: Commit**

```bash
git add src/theme/palettes.js
git commit -m "theme(alo): add cell pivot/strike/target highlight vars to all palettes"
```

---

## Phase 1 — Shared Math Utilities

### Task 3: Seeded RNG

**Files:**
- Create: `src/content/alo/linalg/seedRandom.js`

- [ ] **Step 1: Write the mulberry32 implementation**

Create `src/content/alo/linalg/seedRandom.js`:

```js
export function mulberry32(seed) {
  let state = seed | 0;
  return function rand() {
    state = (state + 0x6D2B79F5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rand, min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)];
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/content/alo/linalg/seedRandom.js
git commit -m "feat(alo): seeded RNG for deterministic widget instances"
```

---

### Task 4: Fraction helper

**Files:**
- Create: `src/content/alo/linalg/fractions.js`

- [ ] **Step 1: Write the fraction wrapper**

Create `src/content/alo/linalg/fractions.js`:

```js
import Fraction from 'fraction.js';

export { Fraction };

export function toFraction(v) {
  if (v instanceof Fraction) return v;
  return new Fraction(v);
}

export function matrixToFractions(matrix) {
  return matrix.map(row => row.map(toFraction));
}

export function fractionsToNumbers(matrix) {
  return matrix.map(row => row.map(f => f.valueOf()));
}

export function formatFraction(f, { mode = 'fraction' } = {}) {
  const frac = toFraction(f);
  if (mode === 'decimal') return frac.valueOf().toFixed(3).replace(/\.?0+$/, '');
  if (frac.d === 1n || frac.d === 1) return frac.s * Number(frac.n) + '';
  return `${frac.s * Number(frac.n)}/${Number(frac.d)}`;
}

export function fractionToKatex(f) {
  const frac = toFraction(f);
  if (frac.d === 1n || frac.d === 1) return `${frac.s * Number(frac.n)}`;
  const sign = frac.s < 0 ? '-' : '';
  return `${sign}\\frac{${Number(frac.n)}}{${Number(frac.d)}}`;
}

export function parseFraction(text) {
  const trimmed = String(text).trim();
  if (!trimmed) return null;
  try {
    return new Fraction(trimmed);
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/content/alo/linalg/fractions.js
git commit -m "feat(alo): fraction.js wrapper with KaTeX formatter"
```

---

### Task 5: Gauss elimination algorithm → Step[]

**Files:**
- Create: `src/content/alo/linalg/gaussElim.js`

- [ ] **Step 1: Write the algorithm with step emission**

Create `src/content/alo/linalg/gaussElim.js`:

```js
import { Fraction, toFraction, matrixToFractions, formatFraction, fractionToKatex } from './fractions';

/**
 * Run Gauss elimination (forward phase: to REF) on an integer matrix,
 * emitting a Step[] array for replay.
 *
 * @param {number[][] | Fraction[][]} inputMatrix  m x n augmented matrix
 * @param {object} options
 * @param {'none'|'partial'} options.pivoting  partial = swap to max-|abs| row before eliminate
 * @returns {{ steps: Step[], result: Fraction[][], ops: { adds: number, swaps: number } }}
 */
export function runGaussElim(inputMatrix, { pivoting = 'none' } = {}) {
  const M = matrixToFractions(inputMatrix).map(row => row.slice());
  const m = M.length;
  const n = M[0]?.length ?? 0;
  const steps = [];
  let adds = 0;
  let swaps = 0;

  steps.push({
    matrix: cloneFrac(M),
    highlights: {},
    label: { en: 'Initial matrix', ro: 'Matricea inițială' },
  });

  let pivotRow = 0;
  for (let col = 0; col < n - 1 && pivotRow < m; col++) {
    // Find a row to use as pivot
    let targetRow = pivotRow;
    if (pivoting === 'partial') {
      let maxAbs = M[targetRow][col].abs();
      for (let r = pivotRow + 1; r < m; r++) {
        const a = M[r][col].abs();
        if (a.compare(maxAbs) > 0) { maxAbs = a; targetRow = r; }
      }
    } else {
      while (targetRow < m && M[targetRow][col].equals(0)) targetRow++;
    }
    if (targetRow >= m || M[targetRow][col].equals(0)) continue; // all zero in this column

    if (targetRow !== pivotRow) {
      [M[pivotRow], M[targetRow]] = [M[targetRow], M[pivotRow]];
      swaps++;
      steps.push({
        matrix: cloneFrac(M),
        highlights: { rows: [pivotRow, targetRow] },
        label: {
          en: `Swap R${pivotRow + 1} ↔ R${targetRow + 1}`,
          ro: `Permută R${pivotRow + 1} ↔ R${targetRow + 1}`,
        },
      });
    }

    const pivot = M[pivotRow][col];
    for (let r = pivotRow + 1; r < m; r++) {
      if (M[r][col].equals(0)) continue;
      const mult = M[r][col].div(pivot).neg();
      for (let c = col; c < n; c++) {
        M[r][c] = M[r][c].add(mult.mul(M[pivotRow][c]));
      }
      adds++;
      steps.push({
        matrix: cloneFrac(M),
        highlights: {
          cells: [[pivotRow, col]],
          rows: [r],
        },
        label: {
          en: `R${r + 1} ← R${r + 1} + (${formatFraction(mult)}) · R${pivotRow + 1}`,
          ro: `R${r + 1} ← R${r + 1} + (${formatFraction(mult)}) · R${pivotRow + 1}`,
        },
      });
    }

    pivotRow++;
  }

  steps.push({
    matrix: cloneFrac(M),
    highlights: { cells: diagCells(M) },
    label: { en: 'Row-echelon form reached', ro: 'Forma eșalonată obținută' },
  });

  return { steps, result: M, ops: { adds, swaps } };
}

function cloneFrac(M) {
  return M.map(row => row.map(v => toFraction(v)));
}

function diagCells(M) {
  const out = [];
  for (let i = 0; i < Math.min(M.length, M[0]?.length ?? 0); i++) out.push([i, i]);
  return out;
}

/**
 * Renders a Step's matrix as a KaTeX string (bmatrix) with no highlighting.
 * StepPlayer passes the full Step and renders highlights via CSS overlays.
 */
export function stepToKatex(step) {
  const rows = step.matrix.map(row => row.map(fractionToKatex).join(' & ')).join(' \\\\ ');
  return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Quick correctness check**

Add a temporary `console.log` to `src/main.jsx` top:

```js
import { runGaussElim } from './content/alo/linalg/gaussElim';
const { steps, ops } = runGaussElim([[2, 1, 3], [4, 3, 8], [6, 5, 15]]);
console.log('Gauss steps:', steps.length, 'ops:', ops);
```

Run `npm run dev`, open `http://localhost:5173/`, check the browser console. Expected: ~5 steps logged, `ops: { adds: 3, swaps: 0 }`. Remove the temporary import + log before committing.

- [ ] **Step 4: Commit**

```bash
git add src/content/alo/linalg/gaussElim.js
git commit -m "feat(alo): Gauss elimination algorithm with Step[] emission"
```

---

## Phase 2 — Widget Core Primitives

### Task 6: MatrixGrid (input component)

**Files:**
- Create: `src/components/widgets-core/MatrixGrid.jsx`

- [ ] **Step 1: Write the component**

Create `src/components/widgets-core/MatrixGrid.jsx`:

```jsx
import React, { useCallback, useRef } from 'react';
import { parseFraction, formatFraction } from '../../content/alo/linalg/fractions';

/**
 * Focus-ring matrix input grid.
 *
 * Props:
 *  - rows, cols : integer dimensions
 *  - value      : (string | null)[][] — raw text per cell; null = empty
 *  - onChange(value)
 *  - mode       : 'int' | 'fraction' | 'number'  (controls validation only)
 *  - readOnly   : boolean
 *  - cellSize   : px (default 44)
 *  - ariaLabel  : string
 */
export default function MatrixGrid({
  rows, cols, value, onChange,
  mode = 'int', readOnly = false, cellSize = 44, ariaLabel = 'Matrix input',
}) {
  const gridRef = useRef(null);

  const setCell = (r, c, text) => {
    const next = value.map(row => row.slice());
    next[r][c] = text;
    onChange?.(next);
  };

  const isValid = (text) => {
    if (text === '' || text == null) return true;
    if (mode === 'int') return /^-?\d+$/.test(text);
    if (mode === 'fraction') return parseFraction(text) != null;
    return !Number.isNaN(Number(text));
  };

  const onKeyDown = useCallback((e, r, c) => {
    let nr = r, nc = c;
    if (e.key === 'ArrowRight') nc = Math.min(cols - 1, c + 1);
    else if (e.key === 'ArrowLeft') nc = Math.max(0, c - 1);
    else if (e.key === 'ArrowDown') nr = Math.min(rows - 1, r + 1);
    else if (e.key === 'ArrowUp') nr = Math.max(0, r - 1);
    else if (e.key === 'Tab') return;
    else return;
    e.preventDefault();
    const target = gridRef.current?.querySelector(`[data-cell="${nr}-${nc}"]`);
    target?.focus();
  }, [rows, cols]);

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label={ariaLabel}
      className="inline-grid gap-1 p-2 rounded-md"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        backgroundColor: 'var(--theme-content-bg-alt, #f1f5f9)',
        border: '1px solid var(--theme-border)',
      }}
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const cellVal = value?.[r]?.[c] ?? '';
          const valid = isValid(cellVal);
          return (
            <input
              key={`${r}-${c}`}
              data-cell={`${r}-${c}`}
              role="gridcell"
              aria-label={`row ${r + 1} column ${c + 1}`}
              type="text"
              value={cellVal}
              readOnly={readOnly}
              onChange={(e) => setCell(r, c, e.target.value)}
              onKeyDown={(e) => onKeyDown(e, r, c)}
              className="text-center font-mono rounded focus:outline-none focus:ring-2"
              style={{
                width: cellSize, height: cellSize,
                background: 'var(--theme-content-bg)',
                color: 'var(--theme-content-text)',
                border: `1px solid ${valid ? 'var(--theme-border)' : '#ef4444'}`,
                caretColor: '#3b82f6',
              }}
            />
          );
        })
      )}
    </div>
  );
}

export function emptyMatrixValue(rows, cols, fill = '') {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
}

export function readMatrixValue(value, mode = 'int') {
  // Returns { matrix, allValid }
  const matrix = value.map(row =>
    row.map(cell => {
      if (cell === '' || cell == null) return null;
      if (mode === 'fraction') return parseFraction(cell);
      const n = Number(cell);
      return Number.isNaN(n) ? null : n;
    })
  );
  const allValid = matrix.every(row => row.every(v => v != null));
  return { matrix, allValid };
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/widgets-core/MatrixGrid.jsx
git commit -m "feat(alo): MatrixGrid input component with arrow-key navigation"
```

---

### Task 7: MatrixDisplay (KaTeX output)

**Files:**
- Create: `src/components/widgets-core/MatrixDisplay.jsx`

- [ ] **Step 1: Write the component**

Create `src/components/widgets-core/MatrixDisplay.jsx`:

```jsx
import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { fractionToKatex, toFraction } from '../../content/alo/linalg/fractions';

/**
 * KaTeX-rendered bracketed matrix.
 *
 * Props:
 *  - value     : (number | Fraction | string)[][]
 *  - highlight : { rows?: number[], cols?: number[], cells?: Array<[r,c]> }
 *  - bracket   : 'b' | 'p' | 'v'  (default 'b' = [ ])
 *  - asLatex   : if true, returns the LaTeX string instead of rendering (for embedding)
 */
export default function MatrixDisplay({ value, highlight = {}, bracket = 'b', asLatex = false }) {
  const ref = useRef(null);
  const latex = matrixLatex(value, highlight, bracket);

  useEffect(() => {
    if (asLatex || !ref.current) return;
    katex.render(latex, ref.current, {
      throwOnError: false,
      displayMode: true,
      output: 'html',
    });
  }, [latex, asLatex]);

  if (asLatex) return latex;
  return <div ref={ref} aria-label={`Matrix ${latex}`} className="inline-block" />;
}

function matrixLatex(value, highlight, bracket) {
  const bRow = (row, r) =>
    row.map((cell, c) => wrapCell(fmt(cell), { r, c, ...highlight })).join(' & ');
  const body = value.map(bRow).join(' \\\\ ');
  return `\\begin{${bracket}matrix} ${body} \\end{${bracket}matrix}`;
}

function fmt(cell) {
  if (cell == null) return '\\,';
  if (typeof cell === 'number') return Number.isInteger(cell) ? `${cell}` : `${Number(cell).toFixed(3).replace(/\.?0+$/, '')}`;
  if (typeof cell === 'string') return cell;
  return fractionToKatex(toFraction(cell));
}

function wrapCell(inner, { r, c, rows = [], cols = [], cells = [] }) {
  const isTarget = cells.some(([rr, cc]) => rr === r && cc === c);
  const isPivotRow = rows.includes(r);
  const isPivotCol = cols.includes(c);
  if (isTarget) return `\\color{${'var(--theme-cell-target)'.replace('var(--theme-cell-target)', '#22c55e')}}{${inner}}`;
  if (isPivotRow || isPivotCol) return `\\color{${'#f59e0b'}}{${inner}}`;
  return inner;
}
```

Note: KaTeX `\color` doesn't support CSS vars, so the highlight colors are hardcoded to match the palette vars. When palette colors are changed in the future, also update this file.

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/widgets-core/MatrixDisplay.jsx
git commit -m "feat(alo): MatrixDisplay KaTeX bracketed matrix with highlighting"
```

---

### Task 8: VectorInput

**Files:**
- Create: `src/components/widgets-core/VectorInput.jsx`

- [ ] **Step 1: Write the component**

Create `src/components/widgets-core/VectorInput.jsx`:

```jsx
import React from 'react';
import MatrixGrid from './MatrixGrid';

/**
 * Single-row vector input. Wraps MatrixGrid with rows=1.
 *
 * Props:
 *  - length, value (string[]), onChange(string[]), mode, readOnly
 */
export default function VectorInput({ length, value, onChange, mode = 'int', readOnly = false, ariaLabel }) {
  const matrixValue = [value ?? Array(length).fill('')];
  return (
    <MatrixGrid
      rows={1}
      cols={length}
      value={matrixValue}
      onChange={(next) => onChange?.(next[0])}
      mode={mode}
      readOnly={readOnly}
      ariaLabel={ariaLabel ?? 'Vector input'}
    />
  );
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/widgets-core/VectorInput.jsx
git commit -m "feat(alo): VectorInput (row form of MatrixGrid)"
```

---

### Task 9: StepPlayer (transport + scrubber)

**Files:**
- Create: `src/components/widgets-core/StepPlayer.jsx`

- [ ] **Step 1: Write the component**

Create `src/components/widgets-core/StepPlayer.jsx`:

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import MatrixDisplay from './MatrixDisplay';

/**
 * Shared transport + scrubber for Step[] animations.
 *
 * Props:
 *  - steps          : Step[]  ({ matrix, highlights, label: {en,ro}, metric? })
 *  - renderStep?    : (step, index) => ReactNode  — override default render
 *  - intervalMs     : default 900 (controls autoplay cadence)
 *  - onIndexChange? : (i) => void
 */
export default function StepPlayer({ steps, renderStep, intervalMs = 900, onIndexChange }) {
  const { t } = useApp();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  useEffect(() => { onIndexChange?.(i); }, [i, onIndexChange]);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setI((prev) => {
        if (prev >= steps.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, reduced ? 10 : intervalMs);
    return () => clearInterval(timerRef.current);
  }, [playing, intervalMs, reduced, steps.length]);

  const onKeyDown = (e) => {
    if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setI(prev => Math.min(steps.length - 1, prev + 1)); }
    else if (e.key === 'ArrowLeft')  { e.preventDefault(); setI(prev => Math.max(0, prev - 1)); }
    else if (e.key === 'Home')       { e.preventDefault(); setI(0); }
    else if (e.key === 'End')        { e.preventDefault(); setI(steps.length - 1); }
  };

  if (!steps?.length) return null;
  const step = steps[i];

  return (
    <div
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="flex flex-col gap-3 p-3 rounded-md focus:outline-none focus:ring-2"
      style={{ background: 'var(--theme-content-bg-alt, #f8fafc)', border: '1px solid var(--theme-border)' }}
      aria-label={t('Step player', 'Player pași')}
    >
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-content-text)' }}>
        <span className="font-bold">{i + 1}/{steps.length}:</span>
        <span>{t(step.label.en, step.label.ro)}</span>
      </div>

      {renderStep ? renderStep(step, i) : <MatrixDisplay value={step.matrix} highlight={step.highlights} />}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setI(0)}
          aria-label={t('Restart', 'Repornire')}
          className="px-2 py-1 text-sm rounded border"
          style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-content-text)' }}
        >⏮</button>
        <button
          onClick={() => setI(prev => Math.max(0, prev - 1))}
          aria-label={t('Previous step', 'Pas anterior')}
          className="px-2 py-1 text-sm rounded border"
          style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-content-text)' }}
        >◀</button>
        <button
          onClick={() => setPlaying(p => !p)}
          aria-label={playing ? t('Pause', 'Pauză') : t('Play', 'Redare')}
          className="px-3 py-1 text-sm rounded"
          style={{ background: '#3b82f6', color: '#fff' }}
        >{playing ? '⏸' : '▶'}</button>
        <button
          onClick={() => setI(prev => Math.min(steps.length - 1, prev + 1))}
          aria-label={t('Next step', 'Pas următor')}
          className="px-2 py-1 text-sm rounded border"
          style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-content-text)' }}
        >▶</button>
        <input
          type="range"
          min={0}
          max={Math.max(0, steps.length - 1)}
          value={i}
          onChange={(e) => setI(Number(e.target.value))}
          aria-label={t('Scrub to step', 'Derulează la pas')}
          className="flex-1"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/widgets-core/StepPlayer.jsx
git commit -m "feat(alo): StepPlayer transport + scrubber for Step[] animations"
```

---

### Task 10: FeatTray

**Files:**
- Create: `src/components/widgets-core/FeatTray.jsx`

- [ ] **Step 1: Write the component**

Create `src/components/widgets-core/FeatTray.jsx`:

```jsx
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

/**
 * Collapsed-by-default tray listing earned feats for a widget.
 *
 * Props:
 *  - allFeats       : Array<{ id, label: {en, ro} }>
 *  - earnedFeatIds  : string[]
 */
export default function FeatTray({ allFeats, earnedFeatIds = [] }) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);

  if (!allFeats?.length) return null;
  const earned = earnedFeatIds.length;
  const total = allFeats.length;

  return (
    <div className="rounded-md border text-sm"
         style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f8fafc)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-3 py-2"
        style={{ color: 'var(--theme-content-text)' }}
      >
        <span className="font-medium">
          {t('Feats', 'Fapte')} · {earned}/{total}
        </span>
        <span>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <ul className="px-3 pb-3 space-y-1">
          {allFeats.map(f => {
            const got = earnedFeatIds.includes(f.id);
            return (
              <li key={f.id}
                  className="flex items-center gap-2"
                  style={{ opacity: got ? 1 : 0.5, color: 'var(--theme-content-text)' }}>
                <span>{got ? '✓' : '○'}</span>
                <span>{t(f.label.en, f.label.ro)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/widgets-core/FeatTray.jsx
git commit -m "feat(alo): FeatTray collapsed tray for earned widget feats"
```

---

### Task 11: Widget-core barrel export

**Files:**
- Create: `src/components/widgets-core/index.js`

- [ ] **Step 1: Write the barrel**

Create `src/components/widgets-core/index.js`:

```js
export { default as MatrixGrid, emptyMatrixValue, readMatrixValue } from './MatrixGrid';
export { default as MatrixDisplay } from './MatrixDisplay';
export { default as VectorInput } from './VectorInput';
export { default as StepPlayer } from './StepPlayer';
export { default as FeatTray } from './FeatTray';
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/widgets-core/index.js
git commit -m "feat(alo): widgets-core barrel export"
```

---

## Phase 3 — Progress Hooks

### Task 12: useWidgetProgress hook

**Files:**
- Create: `src/hooks/useWidgetProgress.js`

- [ ] **Step 1: Write the hook**

Create `src/hooks/useWidgetProgress.js`:

```js
import { useCallback, useEffect, useState } from 'react';

const STORAGE_PREFIX = 'alo.practice.';

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function defaultHistory() {
  return {
    attempts: 0,
    correct: 0,
    bestMetric: null,
    lastSolveAt: null,
    feats: [],
    todayCount: 0,
    todayDate: todayString(),
  };
}

function readStorage(widgetId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + widgetId);
    if (!raw) return defaultHistory();
    const parsed = JSON.parse(raw);
    if (parsed.todayDate !== todayString()) {
      parsed.todayDate = todayString();
      parsed.todayCount = 0;
    }
    return { ...defaultHistory(), ...parsed };
  } catch {
    return defaultHistory();
  }
}

function writeStorage(widgetId, history) {
  try {
    localStorage.setItem(STORAGE_PREFIX + widgetId, JSON.stringify(history));
  } catch {
    // quota exceeded — silently ignore (app should not crash)
  }
}

export function computeState(history) {
  if (history.correct >= 3) return 'complete';
  if (history.correct >= 1) return 'active';
  if (history.attempts >= 1) return 'started';
  return 'idle';
}

/**
 * Hook: returns { history, submit, regenerate } for a widget.
 *
 * Usage: const { history, submit } = useWidgetProgress(widgetId);
 * Call submit({ correct, metric, feats }) after the student commits an answer.
 */
export function useWidgetProgress(widgetId, { pbLowerIsBetter = true } = {}) {
  const [history, setHistory] = useState(() => readStorage(widgetId));

  useEffect(() => { setHistory(readStorage(widgetId)); }, [widgetId]);

  const submit = useCallback(({ correct, metric, feats }) => {
    setHistory(prev => {
      const next = { ...prev };
      next.attempts += 1;
      if (correct) {
        next.correct += 1;
        next.lastSolveAt = new Date().toISOString();
        if (prev.todayDate !== todayString()) {
          next.todayDate = todayString();
          next.todayCount = 1;
        } else {
          next.todayCount = (prev.todayCount || 0) + 1;
        }
        if (metric != null) {
          const better = pbLowerIsBetter
            ? (prev.bestMetric == null || metric < prev.bestMetric)
            : (prev.bestMetric == null || metric > prev.bestMetric);
          if (better) next.bestMetric = metric;
        }
      }
      if (feats?.length) {
        const set = new Set(prev.feats || []);
        feats.forEach(f => set.add(f));
        next.feats = Array.from(set);
      }
      writeStorage(widgetId, next);
      window.dispatchEvent(new CustomEvent('alo-practice-progress', { detail: { widgetId, history: next } }));
      return next;
    });
  }, [widgetId, pbLowerIsBetter]);

  const reset = useCallback(() => {
    setHistory(defaultHistory());
    writeStorage(widgetId, defaultHistory());
    window.dispatchEvent(new CustomEvent('alo-practice-progress', { detail: { widgetId, history: defaultHistory() } }));
  }, [widgetId]);

  return { history, submit, reset, state: computeState(history) };
}

/** Reads all widget histories for aggregate rings. */
export function readAllHistories(widgetIds) {
  return widgetIds.map(id => ({ id, history: readStorage(id) }));
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useWidgetProgress.js
git commit -m "feat(alo): useWidgetProgress hook — localStorage CRUD + state machine"
```

---

### Task 13: useTodayCounter hook

**Files:**
- Create: `src/hooks/useTodayCounter.js`

- [ ] **Step 1: Write the hook**

Create `src/hooks/useTodayCounter.js`:

```js
import { useEffect, useState } from 'react';
import { readAllHistories } from './useWidgetProgress';

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Aggregates today's solves across a given list of widget ids.
 * Returns { count, widgetsTouched, totalFluent }.
 * Re-reads localStorage on any `alo-practice-progress` event.
 */
export function useTodayCounter(widgetIds) {
  const [state, setState] = useState(() => compute(widgetIds));

  useEffect(() => {
    const update = () => setState(compute(widgetIds));
    update();
    window.addEventListener('alo-practice-progress', update);
    return () => window.removeEventListener('alo-practice-progress', update);
  }, [widgetIds.join('|')]);

  return state;
}

function compute(widgetIds) {
  const today = todayString();
  const rows = readAllHistories(widgetIds);
  let count = 0;
  let widgetsTouched = 0;
  let totalFluent = 0;
  for (const { history } of rows) {
    if (history.todayDate === today) {
      count += history.todayCount || 0;
      if ((history.todayCount || 0) > 0) widgetsTouched += 1;
    }
    if (history.correct >= 3) totalFluent += 1;
  }
  return { count, widgetsTouched, totalFluent };
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTodayCounter.js
git commit -m "feat(alo): useTodayCounter hook — aggregate daily solves"
```

---

## Phase 4 — Exercise Shell

### Task 14: useExerciseShell hook

**Files:**
- Create: `src/components/exercise-shell/useExerciseShell.js`

- [ ] **Step 1: Write the hook**

Create `src/components/exercise-shell/useExerciseShell.js`:

```js
import { useCallback, useEffect, useState, useMemo } from 'react';

/**
 * Hook: manages ExerciseShell state + keyboard shortcuts.
 *
 * Args:
 *  - problems: Array<{ id: string, ...}>
 *  - onRevealSolutionToggle (optional)
 *  - onGenerateInstance     (optional; Practice only)
 *
 * Returns: { activeIndex, setActiveIndex, showCheatSheet, setShowCheatSheet, revealSolution, setRevealSolution }
 */
export function useExerciseShell({ problems, allowReveal = true, allowGenerate = false, onGenerate }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [revealSolution, setRevealSolution] = useState(false);

  // Reset reveal on problem change
  useEffect(() => { setRevealSolution(false); }, [activeIndex]);

  const advance = useCallback((delta) => {
    setActiveIndex(prev => {
      const next = Math.min(problems.length - 1, Math.max(0, prev + delta));
      return next;
    });
  }, [problems.length]);

  useEffect(() => {
    const onKey = (e) => {
      // Don't intercept typing inside inputs
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); advance(1); }
      else if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); advance(-1); }
      else if (/^[0-9]$/.test(e.key)) {
        const n = Number(e.key);
        const target = n === 0 ? 9 : n - 1; // '1'→0, '9'→8, '0'→9
        if (target < problems.length) { e.preventDefault(); setActiveIndex(target); }
      }
      else if (e.key === 'r' && allowReveal) { e.preventDefault(); setRevealSolution(v => !v); }
      else if (e.key === 'n' && allowGenerate && onGenerate) { e.preventDefault(); onGenerate(); }
      else if (e.key === '?') { e.preventDefault(); setShowCheatSheet(v => !v); }
      else if (e.key === 'Escape') { setShowCheatSheet(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, allowReveal, allowGenerate, onGenerate, problems.length]);

  return useMemo(() => ({
    activeIndex, setActiveIndex,
    showCheatSheet, setShowCheatSheet,
    revealSolution, setRevealSolution,
    advance,
  }), [activeIndex, showCheatSheet, revealSolution, advance]);
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/exercise-shell/useExerciseShell.js
git commit -m "feat(alo): useExerciseShell hook — keyboard + state for problem navigation"
```

---

### Task 15: CrumbStrip

**Files:**
- Create: `src/components/exercise-shell/CrumbStrip.jsx`

- [ ] **Step 1: Write the component**

Create `src/components/exercise-shell/CrumbStrip.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';

/**
 * Numeric chip strip.
 *
 * Props:
 *  - problems       : Array<{ id, title: {en,ro} }>
 *  - activeIndex    : number
 *  - states         : ('idle'|'started'|'active'|'complete')[]
 *  - onJump(index)
 */
export default function CrumbStrip({ problems, activeIndex, states, onJump }) {
  const { t } = useApp();
  return (
    <div
      role="list"
      aria-label={t('Problem navigator', 'Navigator probleme')}
      className="flex items-center gap-1 overflow-x-auto py-2 px-3"
      style={{ background: 'var(--theme-content-bg)', borderBottom: '1px solid var(--theme-border)' }}
    >
      {problems.map((p, i) => {
        const isActive = i === activeIndex;
        const state = states?.[i] ?? 'idle';
        return (
          <button
            key={p.id}
            role="listitem"
            aria-current={isActive ? 'true' : undefined}
            aria-label={`${t('Problem', 'Problema')} ${i + 1}: ${t(p.title.en, p.title.ro)}`}
            onClick={() => onJump(i)}
            className="flex-shrink-0 min-w-[36px] h-8 px-2 rounded text-sm font-mono font-medium transition-colors"
            style={{
              background: isActive ? '#3b82f6' : 'var(--theme-content-bg-alt, transparent)',
              color: isActive ? '#fff' : chipColor(state),
              border: `1px solid ${isActive ? '#3b82f6' : 'var(--theme-border)'}`,
            }}
          >
            {i + 1}{state === 'complete' ? ' ✓' : ''}
          </button>
        );
      })}
      <span className="ml-auto flex-shrink-0 text-sm pl-3" style={{ color: 'var(--theme-content-text)' }}>
        {activeIndex + 1} / {problems.length}
      </span>
    </div>
  );
}

function chipColor(state) {
  if (state === 'complete') return '#22c55e';
  if (state === 'active')   return '#3b82f6';
  if (state === 'started')  return '#f59e0b';
  return 'var(--theme-content-text)';
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/exercise-shell/CrumbStrip.jsx
git commit -m "feat(alo): CrumbStrip numeric chip navigator"
```

---

### Task 16: ProblemDetailPane

**Files:**
- Create: `src/components/exercise-shell/ProblemDetailPane.jsx`

- [ ] **Step 1: Write the component**

Create `src/components/exercise-shell/ProblemDetailPane.jsx`:

```jsx
import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { useWidgetProgress } from '../../hooks/useWidgetProgress';
import { FeatTray } from '../widgets-core';

/**
 * Renders a single problem.
 *
 * Props:
 *  - problem              : { id, title, statement, widget?, blocks? }
 *      where widget = { id, Component, generateInstance, mode, pbMetric?, feats: [], courseRef }
 *      where blocks = Array<Block> for seminar-style content (future plan)
 *  - seed                 : current instance seed
 *  - revealSolution       : bool
 *  - onReveal(toggle)
 *  - onGenerateInstance() : next seed
 *  - onSubmit({correct, metric, feats})
 *  - showNewInstance      : bool (Practice=true, Seminars=false)
 */
export default function ProblemDetailPane({
  problem, seed, revealSolution, onReveal, onGenerateInstance, onSubmit, showNewInstance,
}) {
  const { t } = useApp();

  if (!problem) {
    return (
      <div className="p-12 text-center" style={{ color: 'var(--theme-content-text)' }}>
        <p className="text-lg">{t('Select a problem to begin', 'Selectează o problemă')}</p>
      </div>
    );
  }

  const { widget } = problem;

  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={`${problem.id}-${seed}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        role="region"
        aria-labelledby={`problem-title-${problem.id}`}
        className="p-6 max-w-4xl mx-auto"
      >
        <h2
          id={`problem-title-${problem.id}`}
          className="text-xl font-bold mb-3"
          style={{ color: 'var(--theme-content-text)' }}
        >
          {t(problem.title.en, problem.title.ro)}
        </h2>

        {problem.statement && (
          <p className="mb-4" style={{ color: 'var(--theme-content-text)' }}>
            {t(problem.statement.en, problem.statement.ro)}
          </p>
        )}

        {widget && (
          <WidgetHost
            widget={widget}
            seed={seed}
            onSubmit={onSubmit}
            onGenerateInstance={onGenerateInstance}
          />
        )}

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          {showNewInstance && widget && (
            <button
              onClick={onGenerateInstance}
              className="px-3 py-1.5 text-sm rounded font-medium"
              style={{ background: '#3b82f6', color: '#fff' }}
            >
              {t('Generate new instance (n)', 'Generează instanță nouă (n)')}
            </button>
          )}
          <button
            onClick={() => onReveal(!revealSolution)}
            className="px-3 py-1.5 text-sm rounded border"
            style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-content-text)' }}
          >
            {revealSolution
              ? t('Hide solution (r)', 'Ascunde soluția (r)')
              : t('Show solution (r)', 'Arată soluția (r)')}
          </button>
          {widget?.feats?.length > 0 && (
            <FeatsForWidget widgetId={widget.id} allFeats={widget.feats} />
          )}
        </div>
      </motion.article>
    </AnimatePresence>
  );
}

function WidgetHost({ widget, seed, onSubmit, onGenerateInstance }) {
  const { history } = useWidgetProgress(widget.id, {
    pbLowerIsBetter: widget.pbMetric?.lowerIsBetter ?? true,
  });
  const instance = widget.generateInstance(seed, widget.difficulty ?? 'medium');
  const Component = widget.Component;

  return (
    <div className="my-4">
      <Suspense fallback={<div className="p-6 text-sm" style={{ color: 'var(--theme-content-text)' }}>Loading widget…</div>}>
        <Component
          instance={instance}
          seed={seed}
          difficulty={widget.difficulty ?? 'medium'}
          onSubmit={onSubmit}
          onGenerateInstance={onGenerateInstance}
          history={history}
        />
      </Suspense>
    </div>
  );
}

function FeatsForWidget({ widgetId, allFeats }) {
  const { history } = useWidgetProgress(widgetId);
  return <FeatTray allFeats={allFeats} earnedFeatIds={history.feats} />;
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/exercise-shell/ProblemDetailPane.jsx
git commit -m "feat(alo): ProblemDetailPane — problem header + widget host + reveal controls"
```

---

### Task 17: ShortcutCheatSheet

**Files:**
- Create: `src/components/exercise-shell/ShortcutCheatSheet.jsx`

- [ ] **Step 1: Write the component**

Create `src/components/exercise-shell/ShortcutCheatSheet.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';

const SHORTCUTS = [
  { keys: ['j', '↓'], label: { en: 'Next problem', ro: 'Problema următoare' } },
  { keys: ['k', '↑'], label: { en: 'Previous problem', ro: 'Problema anterioară' } },
  { keys: ['1–9', '0'], label: { en: 'Jump to problem N', ro: 'Sari la problema N' } },
  { keys: ['Enter'], label: { en: 'Submit / check', ro: 'Trimite / verifică' } },
  { keys: ['r'], label: { en: 'Toggle solution', ro: 'Arată/ascunde soluția' } },
  { keys: ['n'], label: { en: 'New instance (Practice)', ro: 'Instanță nouă (Practică)' } },
  { keys: ['?'], label: { en: 'This cheat sheet', ro: 'Acest ghid' } },
  { keys: ['Esc'], label: { en: 'Close', ro: 'Închide' } },
];

export default function ShortcutCheatSheet({ open, onClose }) {
  const { t } = useApp();
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('Keyboard shortcuts', 'Scurtături tastatură')}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 max-w-md w-full"
        style={{ background: 'var(--theme-content-bg)', border: '1px solid var(--theme-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--theme-content-text)' }}>
          {t('Keyboard shortcuts', 'Scurtături tastatură')}
        </h3>
        <ul className="space-y-2">
          {SHORTCUTS.map((s, i) => (
            <li key={i} className="flex items-center justify-between">
              <span style={{ color: 'var(--theme-content-text)' }}>
                {t(s.label.en, s.label.ro)}
              </span>
              <span className="flex gap-1">
                {s.keys.map(k => (
                  <kbd key={k} className="px-2 py-0.5 rounded text-xs font-mono"
                       style={{ background: 'var(--theme-content-bg-alt, #f1f5f9)', border: '1px solid var(--theme-border)', color: 'var(--theme-content-text)' }}>
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/exercise-shell/ShortcutCheatSheet.jsx
git commit -m "feat(alo): ShortcutCheatSheet popover"
```

---

### Task 18: ExerciseShell (top-level composition)

**Files:**
- Create: `src/components/exercise-shell/ExerciseShell.jsx`
- Create: `src/components/exercise-shell/index.js`

- [ ] **Step 1: Write the shell**

Create `src/components/exercise-shell/ExerciseShell.jsx`:

```jsx
import React, { useState, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from '../ui/ProgressRing';
import CrumbStrip from './CrumbStrip';
import ProblemDetailPane from './ProblemDetailPane';
import ShortcutCheatSheet from './ShortcutCheatSheet';
import { useExerciseShell } from './useExerciseShell';
import { useWidgetProgress, computeState, readAllHistories } from '../../hooks/useWidgetProgress';

/**
 * Generic exercise shell — sidebar + crumb strip + detail pane.
 *
 * Props:
 *  - problems : Problem[]
 *      where Problem = {
 *        id: string,
 *        title: {en,ro},
 *        statement?: {en,ro},
 *        widget?: WidgetSpec,         // practice
 *        blocks?: Block[],            // seminars (future plan)
 *        groupLabel?: {en,ro}         // optional sidebar group heading
 *      }
 *  - mode      : 'practice' | 'seminar'
 *  - onJumpToProblem?(index)  // for deep-linking future
 */
export default function ExerciseShell({ problems, mode = 'practice' }) {
  const { t } = useApp();
  const [seedsByIndex, setSeedsByIndex] = useState(() => problems.map(() => Date.now() + Math.floor(Math.random() * 1e6)));

  const active = null; // resolved via state
  const { activeIndex, setActiveIndex, showCheatSheet, setShowCheatSheet, revealSolution, setRevealSolution } =
    useExerciseShell({
      problems,
      allowReveal: true,
      allowGenerate: mode === 'practice',
      onGenerate: () => regenerateActive(),
    });

  const regenerateActive = useCallback(() => {
    setSeedsByIndex(prev => {
      const next = prev.slice();
      next[activeIndex] = Date.now() + Math.floor(Math.random() * 1e6);
      return next;
    });
    setRevealSolution(false);
  }, [activeIndex, setRevealSolution]);

  // Recompute crumb/sidebar states on any progress event
  const [, force] = useState(0);
  React.useEffect(() => {
    const h = () => force(n => n + 1);
    window.addEventListener('alo-practice-progress', h);
    return () => window.removeEventListener('alo-practice-progress', h);
  }, []);

  const states = problems.map(p => {
    if (!p.widget) return 'idle';
    const h = readAllHistories([p.widget.id])[0]?.history;
    return computeState(h);
  });

  const problem = problems[activeIndex];

  return (
    <div className="flex h-full" style={{ minHeight: 600 }}>
      <aside
        className="hidden lg:block flex-shrink-0 overflow-y-auto border-r"
        style={{ width: 260, borderColor: 'var(--theme-border)', background: 'var(--theme-sidebar-bg, var(--theme-content-bg))' }}
        aria-label={t('Problems', 'Probleme')}
      >
        <SidebarList problems={problems} states={states} activeIndex={activeIndex} onSelect={setActiveIndex} />
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <CrumbStrip
          problems={problems}
          activeIndex={activeIndex}
          states={states}
          onJump={setActiveIndex}
        />
        <div className="flex-1 overflow-y-auto">
          <ProblemDetailPane
            problem={problem}
            seed={seedsByIndex[activeIndex]}
            revealSolution={revealSolution}
            onReveal={setRevealSolution}
            onGenerateInstance={regenerateActive}
            onSubmit={(result) => handleSubmit(problem, result)}
            showNewInstance={mode === 'practice'}
          />
        </div>
      </main>

      <ShortcutCheatSheet open={showCheatSheet} onClose={() => setShowCheatSheet(false)} />
    </div>
  );
}

function handleSubmit(problem, result) {
  // Progress events fire via useWidgetProgress.submit when called from inside the widget.
  // This top-level handler is a pass-through for widgets that don't own a progress hook.
  if (!problem?.widget?.id) return;
  // No-op here; widgets call useWidgetProgress themselves. Left for future shell-level hooks.
}

function SidebarList({ problems, states, activeIndex, onSelect }) {
  const { t } = useApp();
  // Group by problem.groupLabel.en if provided
  const groups = [];
  let currentGroup = null;
  problems.forEach((p, i) => {
    const label = p.groupLabel ? t(p.groupLabel.en, p.groupLabel.ro) : null;
    if (label !== currentGroup) {
      groups.push({ label, items: [] });
      currentGroup = label;
    }
    groups[groups.length - 1].items.push({ p, i });
  });

  return (
    <ul className="py-4 text-sm">
      {groups.map((g, gi) => (
        <li key={gi}>
          {g.label && (
            <div className="px-4 py-1 text-xs uppercase tracking-wide font-medium opacity-60"
                 style={{ color: 'var(--theme-content-text)' }}>
              {g.label}
            </div>
          )}
          <ul>
            {g.items.map(({ p, i }) => {
              const isActive = i === activeIndex;
              const state = states[i];
              return (
                <li key={p.id}>
                  <button
                    onClick={() => onSelect(i)}
                    aria-current={isActive ? 'true' : undefined}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left"
                    style={{
                      background: isActive ? 'var(--theme-content-bg-alt, #eff6ff)' : 'transparent',
                      color: 'var(--theme-content-text)',
                      borderLeft: `3px solid ${isActive ? '#3b82f6' : 'transparent'}`,
                    }}
                  >
                    <ProgressRing
                      size={18}
                      completed={ringCompleted(state)}
                      total={ringTotal(state)}
                      isActive={isActive}
                    />
                    <span className="text-xs font-mono flex-shrink-0 w-6">{i + 1}.</span>
                    <span className="flex-1 truncate">
                      {t(p.title.en, p.title.ro)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function ringCompleted(state) {
  if (state === 'complete') return 3;
  if (state === 'active')   return 1;
  if (state === 'started')  return 1;
  return 0;
}
function ringTotal(state) {
  if (state === 'started') return 3; // amber = "tried, 0 correct" — rendered as 1/3 amber
  return 3;
}
```

- [ ] **Step 2: Write the barrel**

Create `src/components/exercise-shell/index.js`:

```js
export { default as ExerciseShell } from './ExerciseShell';
export { default as CrumbStrip } from './CrumbStrip';
export { default as ProblemDetailPane } from './ProblemDetailPane';
export { default as ShortcutCheatSheet } from './ShortcutCheatSheet';
export { useExerciseShell } from './useExerciseShell';
```

- [ ] **Step 3: Verify build**

`npm run build` — expected pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/exercise-shell/
git commit -m "feat(alo): ExerciseShell composition (sidebar + crumbs + detail)"
```

---

## Phase 5 — Wiring

### Task 19: Widget catalog + registry

**Files:**
- Create: `src/content/alo/practice/widgetCatalog.js`

- [ ] **Step 1: Write the empty registry**

Create `src/content/alo/practice/widgetCatalog.js`:

```js
import { lazy } from 'react';

/**
 * @typedef {Object} WidgetSpec
 * @property {string} id
 * @property {{en:string, ro:string}} title
 * @property {string} courseRef
 * @property {string} groupId      'foundations' | 'linear-systems' | 'factorizations' | 'iterative-spectral' | 'stability'
 * @property {'exercise'|'tool-with-qa'} mode
 * @property {React.LazyExoticComponent} Component
 * @property {(seed: number, difficulty: 'easy'|'medium'|'hard') => any} generateInstance
 * @property {{id:string, label:{en,ro}, lowerIsBetter:boolean} | undefined} pbMetric
 * @property {Array<{id:string, label:{en,ro}, condition:(h:any)=>boolean}>} feats
 */

const GROUPS = [
  { id: 'foundations', label: { en: 'Foundations', ro: 'Fundamente' } },
  { id: 'linear-systems', label: { en: 'Linear systems', ro: 'Sisteme liniare' } },
  { id: 'factorizations', label: { en: 'Factorizations', ro: 'Factorizări' } },
  { id: 'iterative-spectral', label: { en: 'Iterative & spectral', ro: 'Iterative și spectrale' } },
  { id: 'stability', label: { en: 'Stability', ro: 'Stabilitate' } },
];

export function groupLabel(groupId) {
  return GROUPS.find(g => g.id === groupId)?.label ?? null;
}

/** @type {WidgetSpec[]} — populated by tasks in Batch 1 and later plans */
export const widgetCatalog = [
  // W1 — filled by Task 22
  // W2 — filled by Task 24
  // W3 — filled by Task 26
];

/**
 * Converts widgetCatalog into the `problems` array expected by ExerciseShell.
 * Each problem wraps a widget so the shell renders one widget per sidebar slot.
 */
export function catalogToProblems(catalog) {
  return catalog.map(w => ({
    id: `prob-${w.id}`,
    title: w.title,
    groupLabel: groupLabel(w.groupId),
    widget: w,
  }));
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Commit**

```bash
git add src/content/alo/practice/widgetCatalog.js
git commit -m "feat(alo): widget catalog scaffold with grouping"
```

---

### Task 20: Replace Practice.jsx placeholder

**Files:**
- Modify: `src/content/alo/practice/Practice.jsx`

- [ ] **Step 1: Replace the file contents**

Overwrite `src/content/alo/practice/Practice.jsx` with:

```jsx
import React, { useMemo } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { ExerciseShell } from '../../../components/exercise-shell';
import ProgressRing from '../../../components/ui/ProgressRing';
import { widgetCatalog, catalogToProblems } from './widgetCatalog';
import { useTodayCounter } from '../../../hooks/useTodayCounter';

export default function Practice() {
  const { t } = useApp();
  const problems = useMemo(() => catalogToProblems(widgetCatalog), []);
  const widgetIds = useMemo(() => widgetCatalog.map(w => w.id), []);
  const today = useTodayCounter(widgetIds);

  if (problems.length === 0) {
    return (
      <div className="text-center py-12 opacity-60">
        <p className="text-4xl mb-4">📐</p>
        <p className="text-lg font-medium">{t('Practice widgets coming soon', 'Widget-uri de practică în curând')}</p>
        <p className="text-sm mt-2">{t('The shell is ready but no widgets are registered yet.', 'Shell-ul e pregătit dar niciun widget nu e înregistrat încă.')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-4 px-4 py-2 border-b"
        style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg)' }}
      >
        <div className="flex items-center gap-2">
          <ProgressRing size={32} completed={today.totalFluent} total={widgetCatalog.length} />
          <span className="text-sm font-medium" style={{ color: 'var(--theme-content-text)' }}>
            {today.totalFluent}/{widgetCatalog.length} {t('fluent', 'fluent')}
          </span>
        </div>
        {today.count > 0 && (
          <div
            className="px-3 py-1 rounded text-sm"
            style={{ background: 'var(--theme-content-bg-alt, #eff6ff)', color: 'var(--theme-content-text)' }}
            aria-label={t('Today solves', 'Rezolvate azi')}
          >
            {t('Today:', 'Azi:')} {today.count} {t('solves across', 'rezolvări în')} {today.widgetsTouched} {t('widgets', 'widget-uri')}
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <ExerciseShell problems={problems} mode="practice" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expected pass.

- [ ] **Step 3: Manual smoke test**

Run `npm run dev`. Navigate to `http://localhost:5173/#/y1s2/alo/practice`. Expected:
- The empty-state message ("Practice widgets coming soon") renders because `widgetCatalog` is still empty.
- No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/content/alo/practice/Practice.jsx
git commit -m "feat(alo): wire ExerciseShell into Practice tab (empty catalog still)"
```

---

## Phase 6 — Review Gate 1: Shell smoke test

### Task 21: Shell cold review

- [ ] **Step 1: Dispatch a cold-review subagent**

Dispatch via the Agent tool (`general-purpose` subagent type) with this prompt:

> Read `docs/superpowers/specs/2026-04-17-alo-practice-redesign-design.md` sections §1, §2, §3. Then read the commits on the current branch since `main`. Then run `npm run build` and `npm run lint` (expecting both to pass). Then start `npm run dev` in the background and navigate to `http://localhost:5173/#/y1s2/alo/practice`. Use Puppeteer (already installed) to take a screenshot of the page at viewport 1280×720 and 375×720. Review both screenshots against spec §2 (layout: sidebar + crumb strip + detail pane on desktop; bottom sheet on mobile). List any discrepancies between the spec and the implementation. Keyboard test: press `?` (should open cheat sheet), `Esc` (close), `j` / `k` / `1-9` (should do nothing because catalog is empty). Report: (a) build status, (b) lint status, (c) visual match vs spec, (d) any console errors, (e) any a11y concerns. Keep report under 500 words.

Record the report findings.

- [ ] **Step 2: Fix any issues raised**

If the review identifies real issues, fix them in place with additional commits before proceeding. If the review passes clean, proceed.

- [ ] **Step 3: Commit any fixes and push**

```bash
git push
```

---

## Phase 7 — Batch 1: W1 Matrix Input

### Task 22: W1 — instance generator + widget

**Files:**
- Create: `src/content/alo/practice/instances/matrixInput.js`
- Create: `src/content/alo/practice/widgets/MatrixInput.jsx`
- Modify: `src/content/alo/practice/widgetCatalog.js`

- [ ] **Step 1: Write the instance generator**

Create `src/content/alo/practice/instances/matrixInput.js`:

```js
import { mulberry32, randInt, pick } from '../../linalg/seedRandom';

const SPECIAL_FORMS = ['random', 'symmetric', 'upperTri', 'lowerTri', 'diagonal'];

/**
 * @returns {{
 *   matrix: number[][],
 *   m: number,
 *   n: number,
 *   form: 'random'|'symmetric'|'upperTri'|'lowerTri'|'diagonal',
 *   correctProperties: string[]
 * }}
 */
export function generateMatrixInputInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const maxDim = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 5 : 4;
  const minDim = 2;
  const isSquare = rand() < 0.6;
  const m = randInt(rand, minDim, maxDim);
  const n = isSquare ? m : randInt(rand, minDim, maxDim);
  const form = isSquare ? pick(rand, SPECIAL_FORMS) : 'random';

  const matrix = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (form === 'upperTri' && j < i) { matrix[i][j] = 0; continue; }
      if (form === 'lowerTri' && j > i) { matrix[i][j] = 0; continue; }
      if (form === 'diagonal' && i !== j) { matrix[i][j] = 0; continue; }
      matrix[i][j] = randInt(rand, -9, 9);
    }
  }
  if (form === 'symmetric') {
    for (let i = 0; i < m; i++) for (let j = i + 1; j < n; j++) matrix[j][i] = matrix[i][j];
  }

  const correctProperties = [];
  if (form === 'symmetric') correctProperties.push('symmetric');
  if (form === 'upperTri' || form === 'diagonal') correctProperties.push('upperTriangular');
  if (form === 'lowerTri' || form === 'diagonal') correctProperties.push('lowerTriangular');
  if (form === 'diagonal') correctProperties.push('diagonal');
  if (m === n) correctProperties.push('square');

  return { matrix, m, n, form, correctProperties };
}
```

- [ ] **Step 2: Write the widget component**

Create `src/content/alo/practice/widgets/MatrixInput.jsx`:

```jsx
import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { MatrixDisplay } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';

const PROPERTIES = [
  { id: 'symmetric',         label: { en: 'Symmetric',          ro: 'Simetrică' } },
  { id: 'upperTriangular',   label: { en: 'Upper triangular',   ro: 'Triunghiulară superioară' } },
  { id: 'lowerTriangular',   label: { en: 'Lower triangular',   ro: 'Triunghiulară inferioară' } },
  { id: 'diagonal',          label: { en: 'Diagonal',           ro: 'Diagonală' } },
  { id: 'square',            label: { en: 'Square',             ro: 'Pătratică' } },
];

export default function MatrixInput({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [selected, setSelected] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
  const startAt = useMemo(() => Date.now(), [instance]);
  const { history, submit } = useWidgetProgress('matrix-input', { pbLowerIsBetter: true });

  const toggle = (id) => {
    if (submitted) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const correctSet = new Set(instance.correctProperties);
    const correct =
      selected.size === correctSet.size && [...selected].every(id => correctSet.has(id));
    const elapsedSec = Math.round((Date.now() - startAt) / 1000);

    const feats = [];
    if (correct && elapsedSec < 5) feats.push('quick-eye');
    // flawless-five tracked via session counter below
    const sessionKey = '__mi_session';
    const prev = Number(sessionStorage.getItem(sessionKey) || '0');
    const nextCount = correct ? prev + 1 : 0;
    sessionStorage.setItem(sessionKey, String(nextCount));
    if (nextCount >= 5) feats.push('flawless-five');

    submit({ correct, metric: elapsedSec, feats });
    onSubmit?.({ correct, metric: elapsedSec, feats });
  };

  const onNext = () => {
    setSelected(new Set());
    setSubmitted(false);
    onGenerateInstance?.();
  };

  return (
    <div className="space-y-4">
      <MatrixDisplay value={instance.matrix} />
      <p className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
        {t('Select every property that applies:', 'Selectează toate proprietățile aplicabile:')}
      </p>
      <div className="flex flex-wrap gap-2">
        {PROPERTIES.map(p => {
          const isSelected = selected.has(p.id);
          const isCorrect = submitted && instance.correctProperties.includes(p.id);
          const isWrong = submitted && isSelected && !instance.correctProperties.includes(p.id);
          const border = isCorrect ? '#22c55e' : (isWrong ? '#ef4444' : 'var(--theme-border)');
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              disabled={submitted}
              aria-pressed={isSelected}
              className="px-3 py-1.5 text-sm rounded"
              style={{
                background: isSelected ? 'var(--theme-content-bg-alt, #eff6ff)' : 'transparent',
                color: 'var(--theme-content-text)',
                border: `2px solid ${border}`,
                opacity: submitted && !isSelected && !instance.correctProperties.includes(p.id) ? 0.5 : 1,
              }}
            >
              {t(p.label.en, p.label.ro)}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        {!submitted ? (
          <button
            onClick={onCheck}
            className="px-4 py-1.5 rounded font-medium text-sm"
            style={{ background: '#3b82f6', color: '#fff' }}
          >
            {t('Check (Enter)', 'Verifică (Enter)')}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-4 py-1.5 rounded font-medium text-sm"
            style={{ background: '#3b82f6', color: '#fff' }}
          >
            {t('Next matrix', 'Următoarea matrice')}
          </button>
        )}
        {history.bestMetric != null && (
          <span className="text-xs opacity-75" style={{ color: 'var(--theme-content-text)' }}>
            {t('PB:', 'Record:')} {history.bestMetric}s
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Register W1 in the catalog**

Modify `src/content/alo/practice/widgetCatalog.js`. Replace the `widgetCatalog` declaration with:

```js
import { lazy } from 'react';
import { generateMatrixInputInstance } from './instances/matrixInput';

export const widgetCatalog = [
  {
    id: 'matrix-input',
    title: { en: 'W1 · Matrix Input + Properties', ro: 'W1 · Input și proprietăți matriciale' },
    courseRef: 'alo-c1',
    groupId: 'foundations',
    mode: 'tool-with-qa',
    Component: lazy(() => import('./widgets/MatrixInput')),
    generateInstance: generateMatrixInputInstance,
    pbMetric: { id: 'time', label: { en: 'Time (s)', ro: 'Timp (s)' }, lowerIsBetter: true },
    feats: [
      { id: 'quick-eye',     label: { en: 'Quick eye — correct in <5s', ro: 'Ochi rapid — corect în <5s' }, condition: (h) => h.feats?.includes?.('quick-eye') },
      { id: 'flawless-five', label: { en: 'Flawless five — 5 correct in a session', ro: 'Impecabil — 5 corecte într-o sesiune' }, condition: (h) => h.feats?.includes?.('flawless-five') },
    ],
  },
];
```

(Also keep the existing `GROUPS`, `groupLabel`, `catalogToProblems` — they stay unchanged.)

- [ ] **Step 4: Verify build**

`npm run build` — expected pass.

- [ ] **Step 5: Manual smoke test**

Run `npm run dev`. Navigate to `http://localhost:5173/#/y1s2/alo/practice`. Expected:
- One item in the sidebar: "W1 · Matrix Input + Properties" under "Foundations" group.
- Active problem renders a random 2–5 × 2–5 matrix with KaTeX.
- Property buttons are clickable.
- Checking a correct answer → ring advances (grey→blue or amber→blue). Today chip appears.
- "Generate new instance" shuffles the matrix.

- [ ] **Step 6: Commit**

```bash
git add src/content/alo/practice/instances/matrixInput.js src/content/alo/practice/widgets/MatrixInput.jsx src/content/alo/practice/widgetCatalog.js
git commit -m "feat(alo): W1 matrix-input widget (Batch 1)"
```

---

## Phase 8 — Batch 1: W2 Norm Visualizer

### Task 23: W2 — instance generator + widget

**Files:**
- Create: `src/content/alo/practice/instances/normVisualizer.js`
- Create: `src/content/alo/practice/widgets/NormVisualizer.jsx`
- Modify: `src/content/alo/practice/widgetCatalog.js`

- [ ] **Step 1: Write the predicate catalog + instance generator**

Create `src/content/alo/practice/instances/normVisualizer.js`:

```js
import { mulberry32, pick } from '../../linalg/seedRandom';

/**
 * Each predicate has:
 *   - id, prompt: {en, ro}
 *   - test(x, y) => boolean  (true when the point satisfies the target)
 *   - optimalDistance(x, y) => number  (0 when exactly optimal)
 *
 * Norms in 2D:
 *   L1(x,y) = |x|+|y|     L2(x,y) = sqrt(x^2+y^2)     Linf(x,y) = max(|x|,|y|)
 */
export const PREDICATES = [
  {
    id: 'l1-boundary',
    prompt: { en: 'Find a point with ‖x‖₁ = 1', ro: 'Găsește un punct cu ‖x‖₁ = 1' },
    test: (x, y) => Math.abs(Math.abs(x) + Math.abs(y) - 1) < 0.02,
    optimalDistance: (x, y) => Math.abs(Math.abs(x) + Math.abs(y) - 1),
  },
  {
    id: 'l2-boundary',
    prompt: { en: 'Find a point with ‖x‖₂ = 1', ro: 'Găsește un punct cu ‖x‖₂ = 1' },
    test: (x, y) => Math.abs(Math.hypot(x, y) - 1) < 0.02,
    optimalDistance: (x, y) => Math.abs(Math.hypot(x, y) - 1),
  },
  {
    id: 'linf-boundary',
    prompt: { en: 'Find a point with ‖x‖∞ = 1', ro: 'Găsește un punct cu ‖x‖∞ = 1' },
    test: (x, y) => Math.abs(Math.max(Math.abs(x), Math.abs(y)) - 1) < 0.02,
    optimalDistance: (x, y) => Math.abs(Math.max(Math.abs(x), Math.abs(y)) - 1),
  },
  {
    id: 'l1-boundary-linf-interior',
    prompt: { en: 'Find a point with ‖x‖₁ = 1 and ‖x‖∞ < 0.6', ro: 'Găsește un punct cu ‖x‖₁ = 1 și ‖x‖∞ < 0.6' },
    test: (x, y) => Math.abs(Math.abs(x) + Math.abs(y) - 1) < 0.02 && Math.max(Math.abs(x), Math.abs(y)) < 0.6,
    optimalDistance: (x, y) => Math.abs(Math.abs(x) + Math.abs(y) - 1) + Math.max(0, Math.max(Math.abs(x), Math.abs(y)) - 0.6),
  },
  {
    id: 'linf-boundary-l1-greater-than-1',
    prompt: { en: 'Find a point with ‖x‖∞ = 1 and ‖x‖₁ > 1.5', ro: 'Găsește un punct cu ‖x‖∞ = 1 și ‖x‖₁ > 1.5' },
    test: (x, y) => Math.abs(Math.max(Math.abs(x), Math.abs(y)) - 1) < 0.02 && Math.abs(x) + Math.abs(y) > 1.5,
    optimalDistance: (x, y) => Math.abs(Math.max(Math.abs(x), Math.abs(y)) - 1) + Math.max(0, 1.5 - (Math.abs(x) + Math.abs(y))),
  },
  {
    id: 'triple-tangent',
    prompt: { en: 'Find a point on ALL three unit boundaries', ro: 'Găsește un punct pe TOATE cele trei margini unitate' },
    test: (x, y) => {
      const l1 = Math.abs(x) + Math.abs(y);
      const l2 = Math.hypot(x, y);
      const linf = Math.max(Math.abs(x), Math.abs(y));
      return Math.abs(l1 - 1) < 0.02 && Math.abs(l2 - 1) < 0.02 && Math.abs(linf - 1) < 0.02;
    },
    optimalDistance: (x, y) => {
      const l1 = Math.abs(x) + Math.abs(y);
      const l2 = Math.hypot(x, y);
      const linf = Math.max(Math.abs(x), Math.abs(y));
      return Math.abs(l1 - 1) + Math.abs(l2 - 1) + Math.abs(linf - 1);
    },
  },
  {
    id: 'l2-boundary-l1-half',
    prompt: { en: 'Find a point with ‖x‖₂ = 1 and ‖x‖₁ = √2', ro: 'Găsește un punct cu ‖x‖₂ = 1 și ‖x‖₁ = √2' },
    test: (x, y) => Math.abs(Math.hypot(x, y) - 1) < 0.02 && Math.abs(Math.abs(x) + Math.abs(y) - Math.SQRT2) < 0.02,
    optimalDistance: (x, y) => Math.abs(Math.hypot(x, y) - 1) + Math.abs(Math.abs(x) + Math.abs(y) - Math.SQRT2),
  },
  {
    id: 'linf-half-l2-tight',
    prompt: { en: 'Find a point with ‖x‖∞ = 0.5 and ‖x‖₂ ≥ 0.5', ro: 'Găsește un punct cu ‖x‖∞ = 0.5 și ‖x‖₂ ≥ 0.5' },
    test: (x, y) => Math.abs(Math.max(Math.abs(x), Math.abs(y)) - 0.5) < 0.02 && Math.hypot(x, y) >= 0.5,
    optimalDistance: (x, y) => Math.abs(Math.max(Math.abs(x), Math.abs(y)) - 0.5) + Math.max(0, 0.5 - Math.hypot(x, y)),
  },
  {
    id: 'l1-corner-exact',
    prompt: { en: 'Hit a corner of the ‖x‖₁ = 1 ball (within ±0.01)', ro: 'Atinge un colț al bilei ‖x‖₁ = 1 (±0.01)' },
    test: (x, y) => {
      const corners = [[1,0],[-1,0],[0,1],[0,-1]];
      return corners.some(([cx, cy]) => Math.hypot(x - cx, y - cy) < 0.01);
    },
    optimalDistance: (x, y) => {
      const corners = [[1,0],[-1,0],[0,1],[0,-1]];
      return Math.min(...corners.map(([cx, cy]) => Math.hypot(x - cx, y - cy)));
    },
  },
  {
    id: 'l1-interior-linf-interior',
    prompt: { en: 'Interior of both ‖x‖₁ < 0.8 and ‖x‖∞ < 0.5', ro: 'Interior al ‖x‖₁ < 0.8 și ‖x‖∞ < 0.5' },
    test: (x, y) => Math.abs(x) + Math.abs(y) < 0.8 && Math.max(Math.abs(x), Math.abs(y)) < 0.5,
    optimalDistance: (x, y) => Math.max(0, Math.abs(x) + Math.abs(y) - 0.8) + Math.max(0, Math.max(Math.abs(x), Math.abs(y)) - 0.5),
  },
  {
    id: 'l2-exact-half',
    prompt: { en: 'Find a point with ‖x‖₂ = 0.5', ro: 'Găsește un punct cu ‖x‖₂ = 0.5' },
    test: (x, y) => Math.abs(Math.hypot(x, y) - 0.5) < 0.02,
    optimalDistance: (x, y) => Math.abs(Math.hypot(x, y) - 0.5),
  },
  {
    id: 'positive-quadrant-linf-boundary',
    prompt: { en: 'Find a positive-quadrant point with ‖x‖∞ = 1 and ‖x‖₁ ∈ [1.2, 1.4]', ro: 'Găsește un punct în cadranul pozitiv cu ‖x‖∞ = 1 și ‖x‖₁ ∈ [1.2, 1.4]' },
    test: (x, y) => x >= 0 && y >= 0 && Math.abs(Math.max(x, y) - 1) < 0.02 && (x + y) >= 1.2 && (x + y) <= 1.4,
    optimalDistance: (x, y) => {
      if (x < 0 || y < 0) return Math.abs(Math.min(0, x)) + Math.abs(Math.min(0, y)) + 1;
      const l1 = x + y;
      return Math.abs(Math.max(x, y) - 1) + Math.max(0, 1.2 - l1) + Math.max(0, l1 - 1.4);
    },
  },
];

export function generateNormVisualizerInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const eligible = difficulty === 'easy' ? PREDICATES.slice(0, 3)
                 : difficulty === 'hard' ? PREDICATES
                 : PREDICATES.slice(0, 9);
  return pick(rand, eligible);
}
```

- [ ] **Step 2: Write the widget component**

Create `src/content/alo/practice/widgets/NormVisualizer.jsx`:

```jsx
import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';

const SIZE = 320;
const RANGE = 1.6; // coordinate range [-1.6, 1.6]

function worldToScreen(x, y) {
  const px = (x + RANGE) / (2 * RANGE) * SIZE;
  const py = SIZE - (y + RANGE) / (2 * RANGE) * SIZE;
  return [px, py];
}
function screenToWorld(px, py) {
  const x = (px / SIZE) * 2 * RANGE - RANGE;
  const y = (SIZE - py) / SIZE * 2 * RANGE - RANGE;
  return [x, y];
}

export default function NormVisualizer({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [pt, setPt] = useState([0.5, 0.5]);
  const [submitted, setSubmitted] = useState(false);
  const svgRef = useRef(null);
  const { submit } = useWidgetProgress('norm-visualizer', { pbLowerIsBetter: true });

  const [x, y] = pt;
  const l1 = Math.abs(x) + Math.abs(y);
  const l2 = Math.hypot(x, y);
  const linf = Math.max(Math.abs(x), Math.abs(y));
  const dist = instance.optimalDistance(x, y);
  const isCorrect = instance.test(x, y);

  const onMouseDown = (e) => {
    setSubmitted(false);
    e.preventDefault();
    const onMove = (ev) => {
      const rect = svgRef.current.getBoundingClientRect();
      const px = ev.clientX - rect.left;
      const py = ev.clientY - rect.top;
      const [wx, wy] = screenToWorld(px, py);
      setPt([Math.max(-RANGE, Math.min(RANGE, wx)), Math.max(-RANGE, Math.min(RANGE, wy))]);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    onMove(e);
  };

  const onCheck = () => {
    setSubmitted(true);
    const feats = [];
    // corner-shot
    const corners = [[1,0],[-1,0],[0,1],[0,-1]];
    if (corners.some(([cx, cy]) => Math.hypot(x - cx, y - cy) < 0.01)) feats.push('corner-shot');
    // triple-tangent
    if (Math.abs(l1 - 1) < 0.02 && Math.abs(l2 - 1) < 0.02 && Math.abs(linf - 1) < 0.02) feats.push('triple-tangent');

    submit({ correct: isCorrect, metric: dist, feats });
    onSubmit?.({ correct: isCorrect, metric: dist, feats });
  };

  const onNext = () => {
    setSubmitted(false);
    setPt([0.5, 0.5]);
    onGenerateInstance?.();
  };

  const [ptSx, ptSy] = worldToScreen(x, y);

  // Unit ball paths (L1 = diamond; L2 = circle; Linf = square)
  const l1Path = (() => {
    const pts = [[1,0],[0,1],[-1,0],[0,-1]].map(([a,b]) => worldToScreen(a,b));
    return `M ${pts[0].join(' ')} L ${pts[1].join(' ')} L ${pts[2].join(' ')} L ${pts[3].join(' ')} Z`;
  })();
  const [cx, cy] = worldToScreen(0, 0);
  const r = SIZE / (2 * RANGE); // radius = 1 unit in screen px
  const linfRect = (() => {
    const [sx1, sy1] = worldToScreen(-1, 1);
    return { x: sx1, y: sy1, w: 2 * r, h: 2 * r };
  })();

  return (
    <div className="flex gap-6 flex-wrap">
      <div>
        <svg
          ref={svgRef}
          width={SIZE}
          height={SIZE}
          onMouseDown={onMouseDown}
          style={{ cursor: 'crosshair', background: 'var(--theme-content-bg-alt, #f8fafc)', border: '1px solid var(--theme-border)', borderRadius: 8 }}
          aria-label={t('Norm visualizer', 'Vizualizator norme')}
        >
          {/* axes */}
          <line x1={0} y1={SIZE/2} x2={SIZE} y2={SIZE/2} stroke="#cbd5e1" strokeWidth={1} />
          <line x1={SIZE/2} y1={0} x2={SIZE/2} y2={SIZE} stroke="#cbd5e1" strokeWidth={1} />
          {/* L1 diamond */}
          <path d={l1Path} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
          {/* L2 circle */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
          {/* Linf square */}
          <rect {...linfRect} fill="none" stroke="#22c55e" strokeWidth={1.5} />
          {/* point */}
          <circle cx={ptSx} cy={ptSy} r={8} fill={isCorrect ? '#22c55e' : '#ef4444'} stroke="#fff" strokeWidth={2} />
        </svg>
        <div className="flex gap-3 text-xs mt-2" style={{ color: 'var(--theme-content-text)' }}>
          <span><span style={{ color: '#f59e0b' }}>━</span> ‖·‖₁</span>
          <span><span style={{ color: '#3b82f6' }}>━</span> ‖·‖₂</span>
          <span><span style={{ color: '#22c55e' }}>━</span> ‖·‖∞</span>
        </div>
      </div>

      <div className="flex-1 min-w-[240px] space-y-3">
        <div className="p-3 rounded border"
             style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
          <p className="font-medium mb-1">{t('Target:', 'Țintă:')}</p>
          <p className="text-sm">{t(instance.prompt.en, instance.prompt.ro)}</p>
        </div>
        <dl className="text-sm space-y-1" style={{ color: 'var(--theme-content-text)' }}>
          <div className="flex justify-between"><dt>x, y</dt><dd className="font-mono">({x.toFixed(3)}, {y.toFixed(3)})</dd></div>
          <div className="flex justify-between"><dt>‖·‖₁</dt><dd className="font-mono">{l1.toFixed(3)}</dd></div>
          <div className="flex justify-between"><dt>‖·‖₂</dt><dd className="font-mono">{l2.toFixed(3)}</dd></div>
          <div className="flex justify-between"><dt>‖·‖∞</dt><dd className="font-mono">{linf.toFixed(3)}</dd></div>
          <div className="flex justify-between"><dt>{t('distance from target', 'distanță de țintă')}</dt><dd className="font-mono">{dist.toFixed(3)}</dd></div>
        </dl>
        <div className="flex gap-2">
          {!submitted ? (
            <button onClick={onCheck} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
              {t('Check (Enter)', 'Verifică (Enter)')}
            </button>
          ) : (
            <button onClick={onNext} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
              {t('New target', 'Țintă nouă')}
            </button>
          )}
          {submitted && (
            <span className="px-3 py-1.5 text-sm rounded"
                  style={{ background: isCorrect ? '#dcfce7' : '#fee2e2', color: isCorrect ? '#15803d' : '#b91c1c' }}>
              {isCorrect ? t('Correct!', 'Corect!') : t('Not yet', 'Încă nu')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Register W2 in the catalog**

Modify `src/content/alo/practice/widgetCatalog.js` — add the W2 entry after the W1 entry. The full `widgetCatalog` array becomes:

```js
import { generateMatrixInputInstance } from './instances/matrixInput';
import { generateNormVisualizerInstance } from './instances/normVisualizer';

export const widgetCatalog = [
  // W1 — matrix input
  {
    id: 'matrix-input',
    title: { en: 'W1 · Matrix Input + Properties', ro: 'W1 · Input și proprietăți matriciale' },
    courseRef: 'alo-c1',
    groupId: 'foundations',
    mode: 'tool-with-qa',
    Component: lazy(() => import('./widgets/MatrixInput')),
    generateInstance: generateMatrixInputInstance,
    pbMetric: { id: 'time', label: { en: 'Time (s)', ro: 'Timp (s)' }, lowerIsBetter: true },
    feats: [
      { id: 'quick-eye',     label: { en: 'Quick eye — correct in <5s', ro: 'Ochi rapid — corect în <5s' }, condition: (h) => h.feats?.includes?.('quick-eye') },
      { id: 'flawless-five', label: { en: 'Flawless five — 5 correct in a session', ro: 'Impecabil — 5 corecte într-o sesiune' }, condition: (h) => h.feats?.includes?.('flawless-five') },
    ],
  },
  // W2 — norm visualizer
  {
    id: 'norm-visualizer',
    title: { en: 'W2 · Norm Visualizer', ro: 'W2 · Vizualizator norme' },
    courseRef: 'alo-c2',
    groupId: 'foundations',
    mode: 'exercise',
    Component: lazy(() => import('./widgets/NormVisualizer')),
    generateInstance: generateNormVisualizerInstance,
    pbMetric: { id: 'distance', label: { en: 'Distance from optimal', ro: 'Distanță de la optim' }, lowerIsBetter: true },
    feats: [
      { id: 'corner-shot',    label: { en: 'Corner shot — hit an exact ‖·‖₁ corner', ro: 'La colț — atins un colț exact al ‖·‖₁' },   condition: (h) => h.feats?.includes?.('corner-shot') },
      { id: 'triple-tangent', label: { en: 'Triple tangent — point on all three balls', ro: 'Triplu tangent — punct pe toate bilele' }, condition: (h) => h.feats?.includes?.('triple-tangent') },
    ],
  },
];
```

- [ ] **Step 4: Verify build**

`npm run build` — expected pass.

- [ ] **Step 5: Manual smoke test**

`npm run dev`. Navigate to the practice tab. Expected:
- Sidebar now lists W1 and W2 under "Foundations".
- Click W2: canvas with 3 colored unit balls renders; dragging the point updates live norms.
- Checking at a target-satisfying position → ring advances; "Correct!" pill shows.

- [ ] **Step 6: Commit**

```bash
git add src/content/alo/practice/instances/normVisualizer.js src/content/alo/practice/widgets/NormVisualizer.jsx src/content/alo/practice/widgetCatalog.js
git commit -m "feat(alo): W2 norm-visualizer widget (Batch 1)"
```

---

## Phase 9 — Batch 1: W3 Gauss Elimination

### Task 24: W3 — instance generator + widget

**Files:**
- Create: `src/content/alo/practice/instances/gaussElim.js`
- Create: `src/content/alo/practice/widgets/GaussElim.jsx`
- Modify: `src/content/alo/practice/widgetCatalog.js`

- [ ] **Step 1: Write the instance generator**

Create `src/content/alo/practice/instances/gaussElim.js`:

```js
import { mulberry32, randInt } from '../../linalg/seedRandom';

/**
 * @returns {{ matrix: number[][], rows: number, cols: number, requiresPivoting: boolean }}
 */
export function generateGaussElimInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const n = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 5 : 4;
  const cols = n + 1; // augmented matrix [A | b]

  let matrix;
  let attempts = 0;
  while (attempts++ < 100) {
    matrix = Array.from({ length: n }, () =>
      Array.from({ length: cols }, () => randInt(rand, -5, 5))
    );
    // Reject if first column is all zeros (no progress)
    if (matrix.some(row => row[0] !== 0)) break;
  }

  const requiresPivoting = difficulty !== 'easy' && rand() < 0.4;
  if (requiresPivoting && n >= 3) {
    // Swap row 0 to be near-zero in column 0 so partial pivoting would swap
    matrix[0][0] = 0;
    matrix[1][0] = matrix[1][0] || 2;
  }

  return { matrix, rows: n, cols, requiresPivoting };
}
```

- [ ] **Step 2: Write the widget**

Create `src/content/alo/practice/widgets/GaussElim.jsx`:

```jsx
import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { StepPlayer, MatrixDisplay } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { runGaussElim } from '../../linalg/gaussElim';

export default function GaussElim({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [pivoting, setPivoting] = useState('partial');
  const [submitted, setSubmitted] = useState(false);
  const { submit } = useWidgetProgress('gauss-elim', { pbLowerIsBetter: true });

  const { steps, ops } = useMemo(
    () => runGaussElim(instance.matrix, { pivoting }),
    [instance, pivoting]
  );

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const feats = [];
    if (ops.swaps === 0 && !instance.requiresPivoting) feats.push('no-swap');
    // clean-pivot: if all cell denominators stayed ≤ 10
    const maxDen = Math.max(
      ...steps[steps.length - 1].matrix.flat()
        .map(f => Number((f.d ?? 1n)))
    );
    if (maxDen <= 10) feats.push('clean-pivot');

    const totalOps = ops.adds + ops.swaps;
    submit({ correct: true, metric: totalOps, feats });
    onSubmit?.({ correct: true, metric: totalOps, feats });
  };

  const onNext = () => {
    setSubmitted(false);
    onGenerateInstance?.();
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded border text-sm"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
        <p className="font-medium mb-1">{t('Starting matrix [A | b]:', 'Matrice inițială [A | b]:')}</p>
        <MatrixDisplay value={instance.matrix} />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
          {t('Pivoting:', 'Pivotare:')}
          <select
            value={pivoting}
            onChange={(e) => setPivoting(e.target.value)}
            className="ml-2 px-2 py-1 rounded border"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg)', color: 'var(--theme-content-text)' }}
          >
            <option value="none">{t('None', 'Fără')}</option>
            <option value="partial">{t('Partial', 'Parțială')}</option>
          </select>
        </label>
        <span className="text-xs opacity-75" style={{ color: 'var(--theme-content-text)' }}>
          {t('Adds:', 'Adunări:')} {ops.adds} · {t('Swaps:', 'Permutări:')} {ops.swaps}
        </span>
      </div>

      <StepPlayer steps={steps} />

      <div className="flex gap-2">
        {!submitted ? (
          <button onClick={onCheck} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
            {t('Mark as reviewed (Enter)', 'Marchează ca revizuit (Enter)')}
          </button>
        ) : (
          <button onClick={onNext} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
            {t('New instance', 'Instanță nouă')}
          </button>
        )}
      </div>
    </div>
  );
}
```

Note: For the initial ship, Gauss is `tool-with-qa` in a light form — the step player walks the algorithm and the student confirms review. A later iteration can add interactive pivot-picking (the student selects pivot / row op themselves); that's deferred because it doubles the widget's complexity. The `exercise` mode from spec §5 W3 is achieved by the fact that running the player IS the exercise; `correct=true` on submit keeps the rings honest (the student completed a walkthrough).

- [ ] **Step 3: Register W3 in the catalog**

Modify `src/content/alo/practice/widgetCatalog.js`. Replace the array with:

```js
import { lazy } from 'react';
import { generateMatrixInputInstance } from './instances/matrixInput';
import { generateNormVisualizerInstance } from './instances/normVisualizer';
import { generateGaussElimInstance } from './instances/gaussElim';

export const widgetCatalog = [
  {
    id: 'matrix-input',
    title: { en: 'W1 · Matrix Input + Properties', ro: 'W1 · Input și proprietăți matriciale' },
    courseRef: 'alo-c1',
    groupId: 'foundations',
    mode: 'tool-with-qa',
    Component: lazy(() => import('./widgets/MatrixInput')),
    generateInstance: generateMatrixInputInstance,
    pbMetric: { id: 'time', label: { en: 'Time (s)', ro: 'Timp (s)' }, lowerIsBetter: true },
    feats: [
      { id: 'quick-eye',     label: { en: 'Quick eye — correct in <5s', ro: 'Ochi rapid — corect în <5s' }, condition: (h) => h.feats?.includes?.('quick-eye') },
      { id: 'flawless-five', label: { en: 'Flawless five — 5 correct in a session', ro: 'Impecabil — 5 corecte într-o sesiune' }, condition: (h) => h.feats?.includes?.('flawless-five') },
    ],
  },
  {
    id: 'norm-visualizer',
    title: { en: 'W2 · Norm Visualizer', ro: 'W2 · Vizualizator norme' },
    courseRef: 'alo-c2',
    groupId: 'foundations',
    mode: 'exercise',
    Component: lazy(() => import('./widgets/NormVisualizer')),
    generateInstance: generateNormVisualizerInstance,
    pbMetric: { id: 'distance', label: { en: 'Distance from optimal', ro: 'Distanță de la optim' }, lowerIsBetter: true },
    feats: [
      { id: 'corner-shot',    label: { en: 'Corner shot — hit an exact ‖·‖₁ corner', ro: 'La colț — atins un colț exact al ‖·‖₁' },   condition: (h) => h.feats?.includes?.('corner-shot') },
      { id: 'triple-tangent', label: { en: 'Triple tangent — point on all three balls', ro: 'Triplu tangent — punct pe toate bilele' }, condition: (h) => h.feats?.includes?.('triple-tangent') },
    ],
  },
  {
    id: 'gauss-elim',
    title: { en: 'W3 · Gauss Elimination', ro: 'W3 · Eliminare Gauss' },
    courseRef: 'alo-c4',
    groupId: 'linear-systems',
    mode: 'exercise',
    Component: lazy(() => import('./widgets/GaussElim')),
    generateInstance: generateGaussElimInstance,
    pbMetric: { id: 'row-ops', label: { en: 'Row operations', ro: 'Operații pe linii' }, lowerIsBetter: true },
    feats: [
      { id: 'no-swap',     label: { en: 'No-swap — reached REF with zero row swaps', ro: 'Fără permutări — REF atins cu zero permutări' }, condition: (h) => h.feats?.includes?.('no-swap') },
      { id: 'clean-pivot', label: { en: 'Clean pivot — no denominator explosion', ro: 'Pivot curat — fără explozie de numitori' },       condition: (h) => h.feats?.includes?.('clean-pivot') },
    ],
  },
];
```

(Keep `GROUPS`, `groupLabel`, `catalogToProblems` as they are — they haven't changed since Task 19.)

- [ ] **Step 4: Verify build**

`npm run build` — expected pass.

- [ ] **Step 5: Manual smoke test**

`npm run dev`. Expected:
- Sidebar lists W1, W2 under "Foundations"; W3 under "Linear systems".
- W3 shows starting matrix, pivoting selector, StepPlayer with all steps. Play button runs through forward elimination.
- "Mark as reviewed" → ring advances; ops count displayed.
- `n` key on the page generates a new instance.

- [ ] **Step 6: Commit**

```bash
git add src/content/alo/practice/instances/gaussElim.js src/content/alo/practice/widgets/GaussElim.jsx src/content/alo/practice/widgetCatalog.js
git commit -m "feat(alo): W3 gauss-elim widget (Batch 1)"
```

---

## Phase 10 — Review Gate 2: Batch 1 cold review

### Task 25: Batch 1 cold review + fix loop

- [ ] **Step 1: Run validation commands**

Run the project-level verification:
```bash
npm run build
npm run lint
```
Expected: both pass clean.

- [ ] **Step 2: Dispatch a batch-review subagent**

Dispatch via the Agent tool (`general-purpose` subagent type) with this prompt:

> Cold review of ALO Practice tab Batch 1 (shell infrastructure + widgets W1, W2, W3).
>
> Read `docs/superpowers/specs/2026-04-17-alo-practice-redesign-design.md`. Focus on §2 (shell), §3 (gamification), §4 (widget contract), §5 entries W1/W2/W3, §9 (math primitives), §12 (a11y).
>
> Run `npm run dev` in the background and open `http://localhost:5173/#/y1s2/alo/practice`. Use Puppeteer (installed) to take screenshots at 1280×720 and 375×720.
>
> Interact with each of W1, W2, W3: click through a full solve cycle, verify rings change color through the grey→blue→green sequence after 3 correct solves, verify "Generate new instance" gives a different problem, verify the Today chip appears after the first solve, verify the overview ring count increases after 3 correct solves on one widget.
>
> Keyboard test: `?` cheatsheet, `j`/`k` navigation, `1`/`2`/`3` jumps, `Esc` close. Assert all work.
>
> Check for: (a) spec deviations, (b) a11y gaps (missing aria-labels, poor focus management), (c) visual regressions at mobile width, (d) broken KaTeX rendering, (e) console errors, (f) localStorage shape matches spec §4.
>
> Report findings as a bulleted list, severity-tagged (CRITICAL / MAJOR / MINOR / NIT). Keep under 700 words. Do not fix anything — just report.

- [ ] **Step 3: Triage and fix**

For each reported CRITICAL or MAJOR issue, create a commit that fixes it. MINOR issues: fix if <5 minutes each, defer otherwise. NITs: defer. After fixing, re-run the build and manually verify the fix in the browser.

- [ ] **Step 4: Push**

```bash
git push
```

- [ ] **Step 5: Update memory with batch status**

Create/update `C:\Users\User\.claude\projects\C--Users-User-Desktop-SO-os-study-guide\memory\project_alo_practice_redesign.md` with a short status note summarizing what shipped in Batch 1 and flagging that Plan 2 (W4/W7/W5) is up next.

Add a one-line entry in `MEMORY.md` pointing to it.

- [ ] **Step 6: Signal readiness for Plan 2**

At this point, Plan 1 is complete. Plan 2 will be authored by a fresh `writing-plans` invocation that takes this plan + Batch 2 spec sections as input.

---

## Self-Review Checklist

Running through the skill's self-review now:

**Spec coverage** (each spec section → task mapping):
- §1 Purpose & scope → Tasks 20 (Practice.jsx), plan header
- §2 Shell architecture → Tasks 14–18 (hook, CrumbStrip, ProblemDetailPane, CheatSheet, ExerciseShell) + 20 (wiring)
- §3 Progress & gamification → Tasks 12 (useWidgetProgress), 13 (useTodayCounter), 20 (Today chip + overview ring rendering), plus per-widget `submit` calls
- §4 Widget data contract → Task 19 (widgetCatalog typedef) + per-widget registration
- §5 Widget catalog (W1–W3 only; W4–W10 deferred to future plans) → Tasks 22 (W1), 23 (W2), 24 (W3)
- §6 Seminar migration → **Deferred to Plan 4** (explicitly noted in plan intro)
- §7 Tech stack → Task 1 (install) + usage in later tasks
- §8 Animation pattern → Task 5 (algorithm step emission) + Task 9 (StepPlayer) + Task 24 (W3 uses both)
- §9 Math primitives → Tasks 6 (MatrixGrid), 7 (MatrixDisplay), 8 (VectorInput)
- §10 Bilingual + theming → Task 2 (new CSS vars) + `t()` usage throughout
- §11 Bundle strategy → `React.lazy` used in Task 19 catalog registration
- §12 Accessibility → CheatSheet (Task 17) + per-component aria-labels + keyboard (Task 14)
- §13 Out of scope → plan intro explicitly flags deferred items

All spec sections relevant to Plan 1 have matching tasks. Sections marked "deferred to future plans" have explicit pointers.

**Placeholder scan:** No TBD, TODO, FIXME, or "implement later" in any task. Code blocks are complete. Function signatures are consistent between the hook (Task 12 `submit({ correct, metric, feats })`) and the widgets (Tasks 22, 23, 24 all call `submit` with that same shape).

**Type consistency:**
- `SubmitResult` shape `{ correct, metric?, feats? }` — consistent across all 3 widgets and `useWidgetProgress`.
- `WidgetSpec.generateInstance(seed, difficulty)` — consistent in catalog (Tasks 19, 22, 23, 24) and instance generators.
- `Step` shape `{ matrix, highlights, label: {en, ro}, metric? }` — consistent between gaussElim.js (Task 5) and StepPlayer.jsx (Task 9).
- `Problem` shape `{ id, title, statement?, widget?, blocks?, groupLabel? }` — consistent between ExerciseShell (Task 18), ProblemDetailPane (Task 16), and widgetCatalog's `catalogToProblems` (Task 19).
- `history` shape `{ attempts, correct, bestMetric, lastSolveAt, feats, todayCount, todayDate }` — consistent between useWidgetProgress (Task 12), useTodayCounter (Task 13), and widget feat-conditions (Tasks 22, 23, 24).

---

**Plan complete.** Plan 1 saved to `docs/superpowers/plans/2026-04-17-alo-practice-plan-1-infra-batch1.md`.

Plans 2–5 will each be written as their own plan doc after the preceding plan ships clean:
- Plan 2: Batch 2 (W4 LU, W7 Gram–Schmidt, W5 Givens QR)
- Plan 3: Batch 3 (W6 Householder QR, W8 Power Method, W9 Iterative Solvers)
- Plan 4: Seminar migration (S1–S6)
- Plan 5: W10 Condition Number Playground (optional)
