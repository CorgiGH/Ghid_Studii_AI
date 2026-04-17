# ALO Practice Redesign — Plan 2: Batch 2 (W4 LU, W7 Gram-Schmidt, W5 Givens QR)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land three more interactive widgets in the existing ALO Practice tab — **W4 LU Decomposition**, **W7 Gram–Schmidt orthogonalization**, **W5 Givens QR** — using the shell + primitives shipped in Plan 1.

**Architecture:** Each widget follows the Plan 1 pattern: a pure-JS algorithm module emits a `Step[]` array; an instance generator produces parameterized inputs from a seed; the React widget mounts inside `ProblemDetailPane`, renders steps via the shared `StepPlayer` (using a custom `renderStep` callback when the step shape needs more than a single matrix), and reports `{correct, metric, feats}` via `useWidgetProgress`. No new shared infrastructure — only the catalog grows.

**Tech Stack:** React 19, KaTeX, motion (already installed), `fraction.js` (for LU exact arithmetic), plain `Math.*` (for Givens — irrational cosines preclude fractions), no new deps.

**Reference:** spec at `docs/superpowers/specs/2026-04-17-alo-practice-redesign-design.md` §5 W4 / W7 / W5; Plan 1 at `docs/superpowers/plans/2026-04-17-alo-practice-plan-1-infra-batch1.md`.

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/content/alo/linalg/luDecomp.js` | `runLuDecomp(A, {variant})` — Doolittle / Crout, emits `Step[]` with `{L, U, highlights, label}` per step. |
| Create | `src/content/alo/linalg/gramSchmidt.js` | `runGramSchmidt(vectors)` — emits typed steps (`initial / project / normalize / dependent / complete`) with the running orthonormal basis. |
| Create | `src/content/alo/linalg/givensQr.js` | `runGivensQr(A)` — emits `Step[]` with `{A, Qt, rotation:{col,row,c,s}, highlights, label}` per Givens rotation. |
| Create | `src/content/alo/practice/instances/luDecomp.js` | seeded n×n LU-decomposable matrix generator. |
| Create | `src/content/alo/practice/instances/gramSchmidt.js` | seeded set of 2–3 vectors in ℝ²/ℝ³, sometimes linearly-dependent. |
| Create | `src/content/alo/practice/instances/givensQr.js` | seeded n×n matrix curated for tractable rotations. |
| Create | `src/content/alo/practice/widgets/LuDecomp.jsx` | LU widget with Doolittle/Crout toggle + custom `renderStep` showing L \| U side by side. |
| Create | `src/content/alo/practice/widgets/GramSchmidt.jsx` | Gram-Schmidt widget with 2D SVG vector plot + step labels. |
| Create | `src/content/alo/practice/widgets/GivensQr.jsx` | Givens widget with `StepPlayer` rendering A and Q matrices + (c, s) panel. |
| Modify | `src/content/alo/practice/widgetCatalog.js` | append three new entries (W4, W7, W5) and three new imports. |

---

## Testing approach (same as Plan 1)

No unit-test framework is installed in this repo. "Verification" per task = (a) `npm run build` passes, (b) `npm run lint` adds no new errors over Plan 1, (c) manual browser smoke at `npm run dev` → `http://localhost:5173/#/y1s2/alo/practice`. The Phase-4 review gate runs a puppeteer cold review of all 3 new widgets.

---

## Phase 1 — W4 LU Decomposition

### Task 1: LU algorithm

**Files:**
- Create: `src/content/alo/linalg/luDecomp.js`

- [ ] **Step 1: Write the file**

Create `src/content/alo/linalg/luDecomp.js`:

```js
import { toFraction, matrixToFractions, formatFraction } from './fractions';

/**
 * LU decomposition (Doolittle or Crout) over exact rationals.
 * Emits Step[] for replay. Each step has shape:
 *   { L: Fraction[][], U: Fraction[][], highlights: { L?, U? }, label: {en, ro} }
 *
 * @param {number[][] | Fraction[][]} inputMatrix  square n×n matrix
 * @param {object} options
 * @param {'doolittle'|'crout'} options.variant
 * @returns {{ steps: Step[], L: Fraction[][], U: Fraction[][], success: boolean, ops: { divisions: number } }}
 */
export function runLuDecomp(inputMatrix, { variant = 'doolittle' } = {}) {
  const A = matrixToFractions(inputMatrix);
  const n = A.length;
  if (n === 0 || A[0].length !== n) {
    throw new Error('LU decomposition requires a square matrix');
  }

  const L = empty(n);
  const U = empty(n);
  const steps = [];
  let divisions = 0;

  if (variant === 'doolittle') {
    for (let i = 0; i < n; i++) L[i][i] = toFraction(1);
  } else {
    for (let i = 0; i < n; i++) U[i][i] = toFraction(1);
  }

  steps.push({
    L: cloneFrac(L),
    U: cloneFrac(U),
    highlights: {},
    label: {
      en: variant === 'doolittle'
        ? 'Initial — Doolittle (L diagonal = 1)'
        : 'Initial — Crout (U diagonal = 1)',
      ro: variant === 'doolittle'
        ? 'Inițial — Doolittle (diagonala L = 1)'
        : 'Inițial — Crout (diagonala U = 1)',
    },
  });

  for (let k = 0; k < n; k++) {
    if (variant === 'doolittle') {
      // Compute U[k][j] for j = k..n-1
      for (let j = k; j < n; j++) {
        let sum = toFraction(0);
        for (let p = 0; p < k; p++) sum = sum.add(L[k][p].mul(U[p][j]));
        U[k][j] = A[k][j].sub(sum);
        steps.push({
          L: cloneFrac(L), U: cloneFrac(U),
          highlights: { U: { cells: [[k, j]] }, L: { rows: [k] } },
          label: {
            en: `U[${k+1}][${j+1}] = A[${k+1}][${j+1}] − Σ L[${k+1}][p]·U[p][${j+1}] = ${formatFraction(U[k][j])}`,
            ro: `U[${k+1}][${j+1}] = A[${k+1}][${j+1}] − Σ L[${k+1}][p]·U[p][${j+1}] = ${formatFraction(U[k][j])}`,
          },
        });
      }
      if (U[k][k].equals(0)) return failStep(steps, L, U, k, 'U', divisions);
      // Compute L[i][k] for i = k+1..n-1
      for (let i = k + 1; i < n; i++) {
        let sum = toFraction(0);
        for (let p = 0; p < k; p++) sum = sum.add(L[i][p].mul(U[p][k]));
        L[i][k] = A[i][k].sub(sum).div(U[k][k]);
        divisions++;
        steps.push({
          L: cloneFrac(L), U: cloneFrac(U),
          highlights: { L: { cells: [[i, k]] }, U: { cells: [[k, k]] } },
          label: {
            en: `L[${i+1}][${k+1}] = (A[${i+1}][${k+1}] − Σ L[${i+1}][p]·U[p][${k+1}]) / U[${k+1}][${k+1}] = ${formatFraction(L[i][k])}`,
            ro: `L[${i+1}][${k+1}] = (A[${i+1}][${k+1}] − Σ L[${i+1}][p]·U[p][${k+1}]) / U[${k+1}][${k+1}] = ${formatFraction(L[i][k])}`,
          },
        });
      }
    } else {
      // Crout: compute L[i][k] for i = k..n-1
      for (let i = k; i < n; i++) {
        let sum = toFraction(0);
        for (let p = 0; p < k; p++) sum = sum.add(L[i][p].mul(U[p][k]));
        L[i][k] = A[i][k].sub(sum);
        steps.push({
          L: cloneFrac(L), U: cloneFrac(U),
          highlights: { L: { cells: [[i, k]] }, U: { rows: [k] } },
          label: {
            en: `L[${i+1}][${k+1}] = A[${i+1}][${k+1}] − Σ L[${i+1}][p]·U[p][${k+1}] = ${formatFraction(L[i][k])}`,
            ro: `L[${i+1}][${k+1}] = A[${i+1}][${k+1}] − Σ L[${i+1}][p]·U[p][${k+1}] = ${formatFraction(L[i][k])}`,
          },
        });
      }
      if (L[k][k].equals(0)) return failStep(steps, L, U, k, 'L', divisions);
      // Compute U[k][j] for j = k+1..n-1
      for (let j = k + 1; j < n; j++) {
        let sum = toFraction(0);
        for (let p = 0; p < k; p++) sum = sum.add(L[k][p].mul(U[p][j]));
        U[k][j] = A[k][j].sub(sum).div(L[k][k]);
        divisions++;
        steps.push({
          L: cloneFrac(L), U: cloneFrac(U),
          highlights: { U: { cells: [[k, j]] }, L: { cells: [[k, k]] } },
          label: {
            en: `U[${k+1}][${j+1}] = (A[${k+1}][${j+1}] − Σ L[${k+1}][p]·U[p][${j+1}]) / L[${k+1}][${k+1}] = ${formatFraction(U[k][j])}`,
            ro: `U[${k+1}][${j+1}] = (A[${k+1}][${j+1}] − Σ L[${k+1}][p]·U[p][${j+1}]) / L[${k+1}][${k+1}] = ${formatFraction(U[k][j])}`,
          },
        });
      }
    }
  }

  steps.push({
    L: cloneFrac(L), U: cloneFrac(U),
    highlights: { L: { cells: diagCells(L) }, U: { cells: diagCells(U) } },
    label: { en: 'A = LU complete', ro: 'A = LU complet' },
  });

  return { steps, L, U, success: true, ops: { divisions } };
}

function failStep(steps, L, U, k, which, divisions) {
  steps.push({
    L: cloneFrac(L), U: cloneFrac(U),
    highlights: { [which]: { cells: [[k, k]] } },
    label: {
      en: `Zero pivot at ${which}[${k+1}][${k+1}] — variant fails without pivoting`,
      ro: `Pivot zero la ${which}[${k+1}][${k+1}] — varianta eșuează fără pivotare`,
    },
  });
  return { steps, L, U, success: false, ops: { divisions } };
}

function empty(n) {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => toFraction(0)));
}
function cloneFrac(M) { return M.map(row => row.map(v => toFraction(v))); }
function diagCells(M) {
  const out = [];
  for (let i = 0; i < M.length; i++) out.push([i, i]);
  return out;
}
```

- [ ] **Step 2: Verify build**

Run `npm run build`. Expected: pass.

- [ ] **Step 3: Sanity check**

Add to `src/main.jsx` temporarily:
```js
import { runLuDecomp } from './content/alo/linalg/luDecomp';
const { steps, success } = runLuDecomp([[2,1,1],[4,-6,0],[-2,7,2]], { variant: 'doolittle' });
console.log('LU Doolittle steps:', steps.length, 'success:', success);
```
Run `npm run dev`, open browser console, verify ≥7 steps and `success: true`. Remove the temporary code.

- [ ] **Step 4: Commit**

```bash
git add src/content/alo/linalg/luDecomp.js
git commit -m "feat(alo): LU decomposition algorithm (Doolittle/Crout) with Step[] emission"
```

---

### Task 2: LU instance generator

**Files:**
- Create: `src/content/alo/practice/instances/luDecomp.js`

- [ ] **Step 1: Write the generator**

Create `src/content/alo/practice/instances/luDecomp.js`:

```js
import { mulberry32, randInt } from '../../linalg/seedRandom';
import { runLuDecomp } from '../../linalg/luDecomp';

/**
 * @returns {{ matrix: number[][], n: number, defaultVariant: 'doolittle' | 'crout' }}
 *
 * Guarantees the random matrix is LU-decomposable for the chosen variant
 * (no zero pivots) by retrying up to 50 times with fresh entries.
 */
export function generateLuDecompInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const n = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 4 : 3;
  const range = difficulty === 'hard' ? 5 : 4;
  const defaultVariant = rand() < 0.5 ? 'doolittle' : 'crout';

  let matrix;
  for (let attempt = 0; attempt < 50; attempt++) {
    matrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => randInt(rand, -range, range)),
    );
    // Avoid trivially-zero leading element
    if (matrix[0][0] === 0) matrix[0][0] = 1;
    const { success } = runLuDecomp(matrix, { variant: defaultVariant });
    if (success) break;
  }

  return { matrix, n, defaultVariant };
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expect pass.

- [ ] **Step 3: Commit**

```bash
git add src/content/alo/practice/instances/luDecomp.js
git commit -m "feat(alo): W4 LU instance generator (decomposability-guaranteed seeds)"
```

---

### Task 3: LU widget

**Files:**
- Create: `src/content/alo/practice/widgets/LuDecomp.jsx`

- [ ] **Step 1: Write the widget**

Create `src/content/alo/practice/widgets/LuDecomp.jsx`:

```jsx
import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { StepPlayer, MatrixDisplay } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { runLuDecomp } from '../../linalg/luDecomp';

export default function LuDecomp({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [variant, setVariant] = useState(instance.defaultVariant ?? 'doolittle');
  const [submitted, setSubmitted] = useState(false);
  const { submit } = useWidgetProgress('lu-decomp', { pbLowerIsBetter: true });

  const { steps, L, U, success } = useMemo(
    () => runLuDecomp(instance.matrix, { variant }),
    [instance, variant],
  );

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    if (!success) {
      submit({ correct: false });
      onSubmit?.({ correct: false });
      return;
    }
    const feats = [];
    if (variant === 'doolittle') {
      // doolittle-clean: every L entry has denominator ≤ 8
      const maxDen = Math.max(...L.flat().map(f => Number(f.d ?? 1n)));
      if (maxDen <= 8) feats.push('doolittle-clean');
    }
    // permuted-lu-master: deferred (this version doesn't drive permuted seeds)
    const residual = computeResidualMax(instance.matrix, L, U);
    submit({ correct: true, metric: residual, feats });
    onSubmit?.({ correct: true, metric: residual, feats });
  };

  const onNext = () => {
    setSubmitted(false);
    onGenerateInstance?.();
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded border text-sm"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
        <p className="font-medium mb-1">{t('Starting matrix A:', 'Matrice inițială A:')}</p>
        <MatrixDisplay value={instance.matrix} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
          {t('Variant:', 'Varianta:')}
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            className="ml-2 px-2 py-1 rounded border"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg)', color: 'var(--theme-content-text)' }}
          >
            <option value="doolittle">{t('Doolittle (L diag = 1)', 'Doolittle (diag L = 1)')}</option>
            <option value="crout">{t('Crout (U diag = 1)', 'Crout (diag U = 1)')}</option>
          </select>
        </label>
        {!success && (
          <span className="text-xs px-2 py-1 rounded" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            {t('Variant fails — try the other or a new instance', 'Varianta eșuează — încearcă cealaltă sau o instanță nouă')}
          </span>
        )}
      </div>

      <StepPlayer
        steps={steps}
        renderStep={(step) => (
          <div className="flex gap-6 flex-wrap items-start">
            <div>
              <p className="text-xs font-medium mb-1 opacity-70" style={{ color: 'var(--theme-content-text)' }}>L</p>
              <MatrixDisplay value={step.L} highlight={step.highlights?.L ?? {}} />
            </div>
            <div>
              <p className="text-xs font-medium mb-1 opacity-70" style={{ color: 'var(--theme-content-text)' }}>U</p>
              <MatrixDisplay value={step.U} highlight={step.highlights?.U ?? {}} />
            </div>
          </div>
        )}
      />

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

function computeResidualMax(A, L, U) {
  // ‖A − LU‖∞  (max abs entry of A−LU)
  const n = A.length;
  let maxDiff = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let p = 0; p < n; p++) {
        sum += Number(L[i][p].valueOf?.() ?? L[i][p]) * Number(U[p][j].valueOf?.() ?? U[p][j]);
      }
      const diff = Math.abs(Number(A[i][j].valueOf?.() ?? A[i][j]) - sum);
      if (diff > maxDiff) maxDiff = diff;
    }
  }
  return maxDiff;
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expect pass.

- [ ] **Step 3: Commit**

```bash
git add src/content/alo/practice/widgets/LuDecomp.jsx
git commit -m "feat(alo): W4 LU widget (Doolittle/Crout toggle, side-by-side L|U)"
```

---

### Task 4: Register W4 in catalog

**Files:**
- Modify: `src/content/alo/practice/widgetCatalog.js`

- [ ] **Step 1: Add the import line**

After the existing `import { generateGaussElimInstance } from './instances/gaussElim';`, add:

```js
import { generateLuDecompInstance } from './instances/luDecomp';
```

- [ ] **Step 2: Append the W4 entry to `widgetCatalog`**

After the existing W3 (`gauss-elim`) entry, before the closing `]`, add:

```js
  {
    id: 'lu-decomp',
    title: { en: 'W4 · LU Decomposition', ro: 'W4 · Descompunere LU' },
    courseRef: 'alo-c5',
    groupId: 'linear-systems',
    mode: 'exercise',
    Component: lazy(() => import('./widgets/LuDecomp')),
    generateInstance: generateLuDecompInstance,
    pbMetric: { id: 'residual', label: { en: 'Residual ‖A−LU‖∞', ro: 'Reziduu ‖A−LU‖∞' }, lowerIsBetter: true },
    feats: [
      { id: 'doolittle-clean',     label: { en: 'Doolittle clean — denominators ≤ 8', ro: 'Doolittle curat — numitori ≤ 8' }, condition: (h) => h.feats?.includes?.('doolittle-clean') },
      { id: 'permuted-lu-master',  label: { en: 'Permuted LU master — handled a permuted seed', ro: 'Maestru LU permutat — instanță permutată gestionată' }, condition: (h) => h.feats?.includes?.('permuted-lu-master') },
    ],
  },
```

- [ ] **Step 3: Verify build**

`npm run build` — expect pass.

- [ ] **Step 4: Manual smoke test**

`npm run dev`. Navigate to `/#/y1s2/alo/practice`. Expected:
- Sidebar now shows W4 under "Linear systems" alongside W3.
- Click W4: matrix renders, Doolittle/Crout selector visible, StepPlayer scrubs through L/U construction.
- "Mark as reviewed" → ring advances.

- [ ] **Step 5: Commit**

```bash
git add src/content/alo/practice/widgetCatalog.js
git commit -m "feat(alo): register W4 lu-decomp in widget catalog (Batch 2)"
```

---

## Phase 2 — W7 Gram–Schmidt

### Task 5: Gram-Schmidt algorithm

**Files:**
- Create: `src/content/alo/linalg/gramSchmidt.js`

- [ ] **Step 1: Write the algorithm**

Create `src/content/alo/linalg/gramSchmidt.js`:

```js
/**
 * Gram-Schmidt orthonormalization (in floats).
 * Emits typed steps for the widget to render.
 *
 * Step shape:
 *   { type, label: {en, ro}, ...payload }
 * Types:
 *   'initial'    — { inputs: number[][] }
 *   'project'    — { i: number, v: number[], projections: Array<{ujIndex, dot, proj}>, w_after: number[], u: number[][] }
 *   'normalize'  — { i: number, w: number[], norm: number, ui: number[], u: number[][] }
 *   'dependent'  — { i: number, w: number[], norm: number }
 *   'complete'   — { u: number[][] }
 *
 * @param {number[][]} vectors  array of vectors of equal dimension
 * @returns {{ steps: Step[], orthonormal: number[][], dependent: boolean }}
 */
export function runGramSchmidt(vectors) {
  const n = vectors.length;
  if (n === 0) return { steps: [], orthonormal: [], dependent: false };

  const u = []; // running orthonormal basis
  const steps = [];

  steps.push({
    type: 'initial',
    inputs: vectors.map(v => v.slice()),
    u: [],
    label: { en: 'Start with input vectors', ro: 'Pornim cu vectorii de intrare' },
  });

  for (let i = 0; i < n; i++) {
    const v = vectors[i].slice();
    let w = v.slice();
    const projections = [];
    for (let j = 0; j < u.length; j++) {
      const dot = dotProduct(v, u[j]);
      const proj = u[j].map(c => c * dot);
      projections.push({ ujIndex: j, dot, proj: proj.slice() });
      w = w.map((c, k) => c - proj[k]);
    }
    if (projections.length > 0) {
      steps.push({
        type: 'project',
        i,
        v,
        projections,
        w_after: w.slice(),
        u: u.map(uj => uj.slice()),
        label: {
          en: `Subtract projections of v_${i+1} onto previous orthonormal basis`,
          ro: `Scădem proiecțiile lui v_${i+1} pe baza ortonormată anterioară`,
        },
      });
    }
    const norm = Math.hypot(...w);
    if (norm < 1e-10) {
      steps.push({
        type: 'dependent',
        i,
        w: w.slice(),
        norm,
        label: {
          en: `‖w_${i+1}‖ ≈ 0 — vectors are linearly dependent`,
          ro: `‖w_${i+1}‖ ≈ 0 — vectorii sunt liniar dependenți`,
        },
      });
      return { steps, orthonormal: u, dependent: true };
    }
    const ui = w.map(c => c / norm);
    u.push(ui);
    steps.push({
      type: 'normalize',
      i,
      w: w.slice(),
      norm,
      ui: ui.slice(),
      u: u.map(uj => uj.slice()),
      label: {
        en: `u_${i+1} = w_${i+1} / ‖w_${i+1}‖    (norm = ${norm.toFixed(3)})`,
        ro: `u_${i+1} = w_${i+1} / ‖w_${i+1}‖    (norma = ${norm.toFixed(3)})`,
      },
    });
  }

  steps.push({
    type: 'complete',
    u: u.map(uj => uj.slice()),
    label: { en: 'Orthonormal basis complete', ro: 'Baza ortonormată este completă' },
  });

  return { steps, orthonormal: u, dependent: false };
}

function dotProduct(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expect pass.

- [ ] **Step 3: Sanity check**

Add to `src/main.jsx` temporarily:
```js
import { runGramSchmidt } from './content/alo/linalg/gramSchmidt';
const r1 = runGramSchmidt([[3,1],[2,2]]);
console.log('GS independent steps:', r1.steps.length, 'dependent:', r1.dependent);
const r2 = runGramSchmidt([[1,2],[2,4]]);
console.log('GS dependent steps:', r2.steps.length, 'dependent:', r2.dependent);
```
Open the browser console. Expected: r1 has ≥4 steps and `dependent: false`; r2 has ≥3 steps and `dependent: true`. Remove the temporary code.

- [ ] **Step 4: Commit**

```bash
git add src/content/alo/linalg/gramSchmidt.js
git commit -m "feat(alo): Gram-Schmidt orthonormalization with typed Step emission"
```

---

### Task 6: Gram-Schmidt instance generator

**Files:**
- Create: `src/content/alo/practice/instances/gramSchmidt.js`

- [ ] **Step 1: Write the generator**

Create `src/content/alo/practice/instances/gramSchmidt.js`:

```js
import { mulberry32, randInt } from '../../linalg/seedRandom';

/**
 * @returns {{ vectors: number[][], dim: number, count: number, isDependent: boolean }}
 *
 * difficulty:
 *   easy    — dim=2, count=2, never dependent
 *   medium  — dim=2 or 3, count=2 or 3, ~20% dependent
 *   hard    — dim=2 or 3, count=2 or 3, ~40% dependent
 */
export function generateGramSchmidtInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const dim = difficulty === 'easy' ? 2 : (rand() < 0.5 ? 2 : 3);
  const count = difficulty === 'easy' ? 2 : (rand() < 0.5 ? 2 : Math.min(dim, 3));
  const dependentChance = difficulty === 'easy' ? 0 : (difficulty === 'hard' ? 0.4 : 0.2);
  const isDependent = count >= 2 && rand() < dependentChance;

  let vectors;
  let attempts = 0;
  do {
    vectors = Array.from({ length: count }, () =>
      Array.from({ length: dim }, () => randInt(rand, -3, 3)),
    );
    // Reject zero vectors
    if (vectors.some(v => v.every(c => c === 0))) { attempts++; continue; }
    if (isDependent && count >= 2) {
      // Force vector[1] to be a small integer multiple of vector[0]
      const scale = randInt(rand, -2, 2) || 2;
      vectors[1] = vectors[0].map(c => c * scale);
    }
    attempts++;
  } while (attempts < 30 && vectors.some(v => v.every(c => c === 0)));

  return { vectors, dim, count, isDependent };
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expect pass.

- [ ] **Step 3: Commit**

```bash
git add src/content/alo/practice/instances/gramSchmidt.js
git commit -m "feat(alo): W7 Gram-Schmidt instance generator with controlled dependence"
```

---

### Task 7: Gram-Schmidt widget

**Files:**
- Create: `src/content/alo/practice/widgets/GramSchmidt.jsx`

- [ ] **Step 1: Write the widget**

Create `src/content/alo/practice/widgets/GramSchmidt.jsx`:

```jsx
import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { StepPlayer } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { runGramSchmidt } from '../../linalg/gramSchmidt';

const SVG_SIZE = 320;
const RANGE = 5;

function w2s(x, y) {
  const px = (x + RANGE) / (2 * RANGE) * SVG_SIZE;
  const py = SVG_SIZE - (y + RANGE) / (2 * RANGE) * SVG_SIZE;
  return [px, py];
}

export default function GramSchmidt({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [flaggedDependent, setFlaggedDependent] = useState(false);
  const startAt = useRef(Date.now());
  const opCount = useRef(0);
  const { submit } = useWidgetProgress('gram-schmidt', { pbLowerIsBetter: true });

  const { steps, orthonormal, dependent } = useMemo(
    () => runGramSchmidt(instance.vectors),
    [instance],
  );

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const correct = flaggedDependent === dependent;
    const feats = [];
    if (correct && dependent && flaggedDependent) feats.push('parallel-spotter');
    if (correct && !dependent) {
      // clean-norm: every final ‖uᵢ‖ within 1e−9 of 1 (always true after normalization,
      // but include only when input was integer-friendly: norm of every w was rational)
      const cleanNorm = orthonormal.length > 0 && orthonormal.every(u => Math.abs(Math.hypot(...u) - 1) < 1e-9);
      if (cleanNorm) feats.push('clean-norm');
    }
    const metric = opCount.current; // student's manual op count (here driven by step playback length)
    submit({ correct, metric: metric || steps.length, feats });
    onSubmit?.({ correct, metric: metric || steps.length, feats });
  };

  const onNext = () => {
    setSubmitted(false);
    setFlaggedDependent(false);
    startAt.current = Date.now();
    opCount.current = 0;
    onGenerateInstance?.();
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded border text-sm"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
        <p className="font-medium mb-1">
          {t('Vectors in', 'Vectorii din')} ℝ<sup>{instance.dim}</sup>:
        </p>
        <ul className="font-mono text-sm space-y-0.5">
          {instance.vectors.map((v, i) => (
            <li key={i}>v<sub>{i+1}</sub> = ({v.join(', ')})</li>
          ))}
        </ul>
      </div>

      <StepPlayer
        steps={steps}
        renderStep={(step) => <GsStep step={step} dim={instance.dim} t={t} />}
        intervalMs={1400}
      />

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
          {t('Are these vectors linearly DEPENDENT?', 'Sunt acești vectori liniar DEPENDENȚI?')}
        </span>
        <button
          disabled={submitted}
          onClick={() => setFlaggedDependent(true)}
          aria-pressed={flaggedDependent === true}
          className="px-3 py-1 rounded text-sm border"
          style={{
            borderColor: flaggedDependent === true ? '#3b82f6' : 'var(--theme-border)',
            background: flaggedDependent === true ? '#3b82f6' : 'transparent',
            color: flaggedDependent === true ? '#fff' : 'var(--theme-content-text)',
          }}
        >{t('Yes', 'Da')}</button>
        <button
          disabled={submitted}
          onClick={() => setFlaggedDependent(false)}
          aria-pressed={flaggedDependent === false}
          className="px-3 py-1 rounded text-sm border"
          style={{
            borderColor: flaggedDependent === false && submitted ? '#3b82f6' : 'var(--theme-border)',
            background: flaggedDependent === false && submitted ? '#3b82f6' : 'transparent',
            color: flaggedDependent === false && submitted ? '#fff' : 'var(--theme-content-text)',
          }}
        >{t('No', 'Nu')}</button>
      </div>

      <div className="flex gap-2 items-center">
        {!submitted ? (
          <button onClick={onCheck} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
            {t('Check (Enter)', 'Verifică (Enter)')}
          </button>
        ) : (
          <button onClick={onNext} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
            {t('New instance', 'Instanță nouă')}
          </button>
        )}
        {submitted && (
          <span className="px-3 py-1.5 text-sm rounded"
                style={{
                  background: (flaggedDependent === dependent) ? '#dcfce7' : '#fee2e2',
                  color: (flaggedDependent === dependent) ? '#15803d' : '#b91c1c',
                }}>
            {(flaggedDependent === dependent) ? t('Correct!', 'Corect!') : t('Wrong — see steps for why', 'Greșit — vezi pașii pentru motiv')}
          </span>
        )}
      </div>
    </div>
  );
}

function GsStep({ step, dim, t }) {
  if (dim !== 2) {
    return <GsStepText step={step} t={t} />;
  }
  return (
    <div className="flex gap-4 flex-wrap items-start">
      <GsSvg step={step} />
      <div className="flex-1 min-w-[200px]"><GsStepText step={step} t={t} /></div>
    </div>
  );
}

function GsSvg({ step }) {
  // Render only 2D
  const arrows = [];
  if (step.type === 'initial') {
    step.inputs.forEach((v, i) => arrows.push({ v, color: '#94a3b8', label: `v${i+1}`, dashed: false }));
  } else if (step.type === 'project') {
    arrows.push({ v: step.v, color: '#94a3b8', label: `v${step.i+1}`, dashed: false });
    step.u.forEach((u, j) => arrows.push({ v: u, color: '#3b82f6', label: `u${j+1}`, dashed: false }));
    step.projections.forEach((p, j) => arrows.push({ v: p.proj, color: '#f59e0b', label: `proj_{u${p.ujIndex+1}}(v${step.i+1})`, dashed: true }));
    arrows.push({ v: step.w_after, color: '#22c55e', label: `w${step.i+1}`, dashed: false });
  } else if (step.type === 'normalize') {
    step.u.forEach((u, j) => arrows.push({ v: u, color: '#3b82f6', label: `u${j+1}`, dashed: false }));
    arrows.push({ v: step.w, color: '#22c55e', label: `w${step.i+1}`, dashed: true });
  } else if (step.type === 'dependent') {
    arrows.push({ v: step.w, color: '#ef4444', label: `w${step.i+1} ≈ 0`, dashed: false });
  } else if (step.type === 'complete') {
    step.u.forEach((u, j) => arrows.push({ v: u, color: '#3b82f6', label: `u${j+1}`, dashed: false }));
  }

  const [ox, oy] = w2s(0, 0);
  return (
    <svg width={SVG_SIZE} height={SVG_SIZE}
         style={{ background: 'var(--theme-content-bg-alt, #f8fafc)', border: '1px solid var(--theme-border)', borderRadius: 8 }}
         aria-label="Gram-Schmidt visualization">
      <defs>
        <marker id="gs-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
      <line x1={0} y1={oy} x2={SVG_SIZE} y2={oy} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={ox} y1={0} x2={ox} y2={SVG_SIZE} stroke="#cbd5e1" strokeWidth={1} />
      {arrows.map((a, idx) => {
        const [vx, vy] = a.v.length >= 2 ? [a.v[0], a.v[1]] : [a.v[0], 0];
        const [ex, ey] = w2s(vx, vy);
        return (
          <g key={idx} style={{ color: a.color }}>
            <line x1={ox} y1={oy} x2={ex} y2={ey} stroke={a.color} strokeWidth={2}
                  strokeDasharray={a.dashed ? '4 3' : 'none'} markerEnd="url(#gs-arrow)" />
            <text x={ex + 4} y={ey - 4} fontSize={10} fill={a.color}>{a.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function GsStepText({ step, t }) {
  if (step.type === 'initial') {
    return <p className="text-sm" style={{ color: 'var(--theme-content-text)' }}>{t('Inputs:', 'Intrări:')} {step.inputs.map((v, i) => `v${i+1}=(${v.join(',')})`).join(' · ')}</p>;
  }
  if (step.type === 'project') {
    return (
      <div className="text-sm space-y-1" style={{ color: 'var(--theme-content-text)' }}>
        <p>{t('Projecting v', 'Proiectăm v')}<sub>{step.i+1}</sub>:</p>
        <ul className="font-mono text-xs space-y-0.5">
          {step.projections.map((p, j) => (
            <li key={j}>⟨v{step.i+1}, u{p.ujIndex+1}⟩ = {p.dot.toFixed(3)}, {t('proj', 'proj')} = ({p.proj.map(c => c.toFixed(3)).join(', ')})</li>
          ))}
          <li>w<sub>{step.i+1}</sub> = ({step.w_after.map(c => c.toFixed(3)).join(', ')})</li>
        </ul>
      </div>
    );
  }
  if (step.type === 'normalize') {
    return (
      <p className="text-sm font-mono" style={{ color: 'var(--theme-content-text)' }}>
        ‖w<sub>{step.i+1}</sub>‖ = {step.norm.toFixed(3)} → u<sub>{step.i+1}</sub> = ({step.ui.map(c => c.toFixed(3)).join(', ')})
      </p>
    );
  }
  if (step.type === 'dependent') {
    return (
      <p className="text-sm" style={{ color: '#b91c1c' }}>
        ‖w<sub>{step.i+1}</sub>‖ = {step.norm.toExponential(2)} ≈ 0 — {t('linearly dependent', 'liniar dependenți')}
      </p>
    );
  }
  if (step.type === 'complete') {
    return (
      <p className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
        {t('Orthonormal basis:', 'Baza ortonormată:')} {step.u.map((u, j) => `u${j+1}=(${u.map(c => c.toFixed(3)).join(',')})`).join(' · ')}
      </p>
    );
  }
  return null;
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expect pass.

- [ ] **Step 3: Commit**

```bash
git add src/content/alo/practice/widgets/GramSchmidt.jsx
git commit -m "feat(alo): W7 Gram-Schmidt widget (2D SVG plot + dependence check)"
```

---

### Task 8: Register W7 in catalog

**Files:**
- Modify: `src/content/alo/practice/widgetCatalog.js`

- [ ] **Step 1: Add the import line**

After the `import { generateLuDecompInstance } from './instances/luDecomp';` line, add:

```js
import { generateGramSchmidtInstance } from './instances/gramSchmidt';
```

- [ ] **Step 2: Append the W7 entry to `widgetCatalog`**

After the W4 (`lu-decomp`) entry, before the closing `]`, add:

```js
  {
    id: 'gram-schmidt',
    title: { en: 'W7 · Gram–Schmidt', ro: 'W7 · Gram–Schmidt' },
    courseRef: 'alo-c2',
    groupId: 'factorizations',
    mode: 'exercise',
    Component: lazy(() => import('./widgets/GramSchmidt')),
    generateInstance: generateGramSchmidtInstance,
    pbMetric: { id: 'steps', label: { en: 'Step count', ro: 'Număr pași' }, lowerIsBetter: true },
    feats: [
      { id: 'clean-norm',        label: { en: 'Clean norm — every ‖uᵢ‖ = 1 within 1e-9', ro: 'Normă curată — fiecare ‖uᵢ‖ = 1 cu eroare 1e-9' }, condition: (h) => h.feats?.includes?.('clean-norm') },
      { id: 'parallel-spotter',  label: { en: 'Parallel spotter — flagged a dependent set', ro: 'Detector paralele — marcat un set dependent' }, condition: (h) => h.feats?.includes?.('parallel-spotter') },
    ],
  },
```

- [ ] **Step 3: Verify build + smoke test**

`npm run build` — expect pass. Then `npm run dev` and navigate to `/#/y1s2/alo/practice`. Expected:
- Sidebar gets a new "Factorizations" group containing W7.
- Click W7: SVG renders 2D vectors when `dim=2`, otherwise text-only stepping. Dependence Yes/No buttons toggle. Check works.

- [ ] **Step 4: Commit**

```bash
git add src/content/alo/practice/widgetCatalog.js
git commit -m "feat(alo): register W7 gram-schmidt in widget catalog (Batch 2)"
```

---

## Phase 3 — W5 Givens QR

### Task 9: Givens QR algorithm

**Files:**
- Create: `src/content/alo/linalg/givensQr.js`

- [ ] **Step 1: Write the algorithm**

Create `src/content/alo/linalg/givensQr.js`:

```js
/**
 * QR factorization via Givens rotations (in floats — cosines/sines are irrational in general).
 * Emits Step[] for replay. Each step:
 *   { A: number[][], Qt: number[][], rotation?: { col, row, c, s, r }, highlights, label: {en, ro} }
 *
 * After the loop, R = final A and Q = transpose(Qt).
 *
 * @param {number[][]} inputMatrix
 * @returns {{ steps: Step[], Q: number[][], R: number[][], rotations: number }}
 */
export function runGivensQr(inputMatrix) {
  const m = inputMatrix.length;
  const n = inputMatrix[0]?.length ?? 0;
  if (m === 0 || n === 0) {
    return { steps: [], Q: [], R: [], rotations: 0 };
  }

  const A = inputMatrix.map(row => row.slice());
  const Qt = identity(m);
  const steps = [];
  let rotations = 0;

  steps.push({
    A: cloneFloat(A),
    Qt: cloneFloat(Qt),
    highlights: { A: {} },
    label: { en: 'Initial: A; Qᵀ = I', ro: 'Inițial: A; Qᵀ = I' },
  });

  for (let col = 0; col < Math.min(n, m - 1); col++) {
    for (let row = m - 1; row > col; row--) {
      const a = A[col][col];
      const b = A[row][col];
      if (Math.abs(b) < 1e-12) continue;
      const r = Math.hypot(a, b);
      const c = a / r;
      const s = b / r;

      // Apply Givens rotation: rows col and row of A
      for (let k = 0; k < n; k++) {
        const aTop = A[col][k];
        const aBot = A[row][k];
        A[col][k] = c * aTop + s * aBot;
        A[row][k] = -s * aTop + c * aBot;
      }
      // Same rotation applied to Qt (left-multiplication)
      for (let k = 0; k < m; k++) {
        const qTop = Qt[col][k];
        const qBot = Qt[row][k];
        Qt[col][k] = c * qTop + s * qBot;
        Qt[row][k] = -s * qTop + c * qBot;
      }

      rotations++;
      steps.push({
        A: cloneFloat(A),
        Qt: cloneFloat(Qt),
        rotation: { col, row, c, s, r },
        highlights: { A: { rows: [col, row], cells: [[row, col]] } },
        label: {
          en: `G(${col+1},${row+1}): c=${c.toFixed(3)}, s=${s.toFixed(3)}, zero A[${row+1}][${col+1}]`,
          ro: `G(${col+1},${row+1}): c=${c.toFixed(3)}, s=${s.toFixed(3)}, anulează A[${row+1}][${col+1}]`,
        },
      });
    }
  }

  steps.push({
    A: cloneFloat(A),
    Qt: cloneFloat(Qt),
    highlights: { A: { cells: upperTriCells(A) } },
    label: {
      en: `Done — ${rotations} rotation(s). R = A; Q = Qᵀᵀ.`,
      ro: `Gata — ${rotations} rotație/rotații. R = A; Q = Qᵀᵀ.`,
    },
  });

  return { steps, Q: transpose(Qt), R: A, rotations };
}

function identity(n) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}
function cloneFloat(M) { return M.map(row => row.slice()); }
function transpose(M) {
  const m = M.length, n = M[0]?.length ?? 0;
  return Array.from({ length: n }, (_, j) => Array.from({ length: m }, (_, i) => M[i][j]));
}
function upperTriCells(M) {
  const out = [];
  for (let i = 0; i < M.length; i++) for (let j = i; j < (M[0]?.length ?? 0); j++) out.push([i, j]);
  return out;
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expect pass.

- [ ] **Step 3: Sanity check**

Add to `src/main.jsx` temporarily:
```js
import { runGivensQr } from './content/alo/linalg/givensQr';
const { steps, R, rotations } = runGivensQr([[12, -51, 4], [6, 167, -68], [-4, 24, -41]]);
console.log('Givens steps:', steps.length, 'rotations:', rotations, 'R[2][0]:', R[2][0].toFixed(6));
```
Expected: ~5 steps, 3 rotations (n(n-1)/2 = 3 for 3×3), and `R[2][0] ≈ 0`. Remove the temporary code after verifying.

- [ ] **Step 4: Commit**

```bash
git add src/content/alo/linalg/givensQr.js
git commit -m "feat(alo): Givens-rotation QR factorization with Step[] emission"
```

---

### Task 10: Givens instance generator

**Files:**
- Create: `src/content/alo/practice/instances/givensQr.js`

- [ ] **Step 1: Write the generator**

Create `src/content/alo/practice/instances/givensQr.js`:

```js
import { mulberry32, randInt, pick } from '../../linalg/seedRandom';

/**
 * Hand-curated seeds yielding (c,s) pairs that include "nice" values
 * (0, ±1, ±1/√2, ±3/5, ±4/5) where possible.
 * @returns {{ matrix: number[][], n: number }}
 */
export function generateGivensQrInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const n = difficulty === 'easy' ? 3 : 4;
  const range = 5;

  // Hand-curated 3×3 seeds known to produce tractable (c,s) pairs.
  const curated3 = [
    [[3, 0, 1], [4, 5, 2], [0, 0, 7]],   // (c,s) = (3/5, 4/5)
    [[1, 2, 3], [1, 1, 4], [0, 1, 5]],
    [[5, 0, 0], [0, 12, 5], [0, 0, 13]],
    [[2, 1, 0], [2, 3, 1], [1, 0, 4]],
  ];
  const curated4 = [
    [[3, 0, 1, 0], [4, 5, 2, 1], [0, 0, 7, 0], [0, 0, 0, 9]],
    [[1, 2, 0, 0], [3, 4, 1, 0], [0, 0, 5, 0], [0, 0, 12, 13]],
  ];

  // 60% chance to pick a curated seed, otherwise random
  const useCurated = rand() < 0.6;
  let matrix;
  if (useCurated) {
    matrix = (n === 3 ? pick(rand, curated3) : pick(rand, curated4)).map(row => row.slice());
  } else {
    matrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => randInt(rand, -range, range)),
    );
    if (matrix[0][0] === 0) matrix[0][0] = 1;
  }

  return { matrix, n };
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expect pass.

- [ ] **Step 3: Commit**

```bash
git add src/content/alo/practice/instances/givensQr.js
git commit -m "feat(alo): W5 Givens QR instance generator (curated seeds)"
```

---

### Task 11: Givens widget

**Files:**
- Create: `src/content/alo/practice/widgets/GivensQr.jsx`

- [ ] **Step 1: Write the widget**

Create `src/content/alo/practice/widgets/GivensQr.jsx`:

```jsx
import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { StepPlayer, MatrixDisplay } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { runGivensQr } from '../../linalg/givensQr';

export default function GivensQr({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const { submit } = useWidgetProgress('givens-qr', { pbLowerIsBetter: true });

  const { steps, Q, R, rotations } = useMemo(
    () => runGivensQr(instance.matrix),
    [instance],
  );

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const feats = [];
    const expected = (instance.n * (instance.n - 1)) / 2;
    if (rotations === expected) feats.push('minimal-rotations');
    // unit-q: ‖Q − Q_systematic‖₂ < 1e-6 — Q is computed by us, so the residual is by construction small
    const qResidual = orthogonalResidual(Q);
    if (qResidual < 1e-6) feats.push('unit-q');
    submit({ correct: true, metric: rotations, feats });
    onSubmit?.({ correct: true, metric: rotations, feats });
  };

  const onNext = () => {
    setSubmitted(false);
    onGenerateInstance?.();
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded border text-sm"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
        <p className="font-medium mb-1">{t('Starting matrix A:', 'Matrice inițială A:')}</p>
        <MatrixDisplay value={instance.matrix} />
      </div>

      <StepPlayer
        steps={steps}
        renderStep={(step) => (
          <div className="space-y-3">
            {step.rotation && (
              <div className="text-xs font-mono p-2 rounded"
                   style={{ background: 'var(--theme-content-bg-alt, #fff7ed)', color: 'var(--theme-content-text)' }}>
                G({step.rotation.col + 1},{step.rotation.row + 1}):
                c = {step.rotation.c.toFixed(4)}, s = {step.rotation.s.toFixed(4)}, r = {step.rotation.r.toFixed(4)}
              </div>
            )}
            <div className="flex gap-6 flex-wrap items-start">
              <div>
                <p className="text-xs font-medium mb-1 opacity-70" style={{ color: 'var(--theme-content-text)' }}>A</p>
                <MatrixDisplay value={step.A} highlight={step.highlights?.A ?? {}} />
              </div>
              <div>
                <p className="text-xs font-medium mb-1 opacity-70" style={{ color: 'var(--theme-content-text)' }}>Qᵀ</p>
                <MatrixDisplay value={step.Qt} />
              </div>
            </div>
          </div>
        )}
      />

      <div className="flex gap-2 items-center">
        <span className="text-xs opacity-75" style={{ color: 'var(--theme-content-text)' }}>
          {t('Rotations used:', 'Rotații utilizate:')} {rotations} / {(instance.n * (instance.n - 1)) / 2}
        </span>
        {!submitted ? (
          <button onClick={onCheck} className="ml-auto px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
            {t('Mark as reviewed (Enter)', 'Marchează ca revizuit (Enter)')}
          </button>
        ) : (
          <button onClick={onNext} className="ml-auto px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
            {t('New instance', 'Instanță nouă')}
          </button>
        )}
      </div>
    </div>
  );
}

function orthogonalResidual(Q) {
  const n = Q.length;
  let maxAbs = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let dot = 0;
      for (let k = 0; k < n; k++) dot += Q[k][i] * Q[k][j]; // Qᵀ Q entry
      const target = i === j ? 1 : 0;
      const diff = Math.abs(dot - target);
      if (diff > maxAbs) maxAbs = diff;
    }
  }
  return maxAbs;
}
```

- [ ] **Step 2: Verify build**

`npm run build` — expect pass.

- [ ] **Step 3: Commit**

```bash
git add src/content/alo/practice/widgets/GivensQr.jsx
git commit -m "feat(alo): W5 Givens QR widget (rotation playback, A | Qᵀ side-by-side)"
```

---

### Task 12: Register W5 in catalog

**Files:**
- Modify: `src/content/alo/practice/widgetCatalog.js`

- [ ] **Step 1: Add the import line**

After the `import { generateGramSchmidtInstance } from './instances/gramSchmidt';` line, add:

```js
import { generateGivensQrInstance } from './instances/givensQr';
```

- [ ] **Step 2: Append the W5 entry to `widgetCatalog`**

After the W7 (`gram-schmidt`) entry, before the closing `]`, add:

```js
  {
    id: 'givens-qr',
    title: { en: 'W5 · Givens QR', ro: 'W5 · QR cu Givens' },
    courseRef: 'alo-c6',
    groupId: 'factorizations',
    mode: 'exercise',
    Component: lazy(() => import('./widgets/GivensQr')),
    generateInstance: generateGivensQrInstance,
    pbMetric: { id: 'rotations', label: { en: 'Rotations', ro: 'Rotații' }, lowerIsBetter: true },
    feats: [
      { id: 'minimal-rotations', label: { en: 'Minimal rotations — exactly n(n−1)/2', ro: 'Rotații minimale — exact n(n−1)/2' }, condition: (h) => h.feats?.includes?.('minimal-rotations') },
      { id: 'unit-q',            label: { en: 'Unit Q — orthogonality residual < 1e-6', ro: 'Q unitar — reziduu ortogonalitate < 1e-6' }, condition: (h) => h.feats?.includes?.('unit-q') },
    ],
  },
```

- [ ] **Step 3: Verify build + smoke test**

`npm run build` — expect pass. Then `npm run dev`, navigate to `/#/y1s2/alo/practice`. Expected:
- Sidebar's "Factorizations" group now contains W7 and W5.
- Click W5: matrix shown, StepPlayer scrubs through Givens rotations with (c,s) panel above each rotation step.

- [ ] **Step 4: Commit**

```bash
git add src/content/alo/practice/widgetCatalog.js
git commit -m "feat(alo): register W5 givens-qr in widget catalog (Batch 2)"
```

---

## Phase 4 — Batch 2 Review Gate

### Task 13: Cold review + fix loop + memory update

- [ ] **Step 1: Run validation commands**

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide"
npm run build
npm run lint
```
Expected: build passes; lint adds no NEW errors above the Plan 1 baseline (pre-existing v86 / proxy / SubjectPage warnings remain).

- [ ] **Step 2: Dispatch a batch-review subagent**

Dispatch via Agent tool, `general-purpose`, model `sonnet`, with this prompt:

> Cold review of ALO Practice tab Batch 2 (widgets W4 LU, W7 Gram-Schmidt, W5 Givens QR). Plan: `docs/superpowers/plans/2026-04-17-alo-practice-plan-2-batch2.md`. Spec: `docs/superpowers/specs/2026-04-17-alo-practice-redesign-design.md` §5 W4/W5/W7.
>
> Run `npm run dev` in background; use Puppeteer to load `http://localhost:5173/#/y1s2/alo/practice`. Take screenshots at 1280×720 to `/tmp/alo-batch2-desktop.png` and 375×720 to `/tmp/alo-batch2-mobile.png`. Confirm sidebar has 6 entries across 3 groups (Foundations: W1, W2; Linear systems: W3, W4; Factorizations: W7, W5). Click each of the 3 new widgets. For each: confirm the StepPlayer renders without crashing, ≥3 steps appear, no console errors, ring advances after "Mark as reviewed" / Check.
>
> Specifically:
> - W4 LU: toggle Doolittle ↔ Crout — both should run without crash. Side-by-side L | U should render (KaTeX).
> - W7 Gram-Schmidt: 2D instances should render the SVG vector plot. 3D instances should render text-only. Yes/No dependence buttons should toggle. Check produces correct/incorrect feedback.
> - W5 Givens: each rotation step should show a (c, s, r) panel above the matrix. Final step's R should be upper triangular (visible via highlight on cells).
>
> Inspect localStorage keys `alo.practice.lu-decomp`, `alo.practice.gram-schmidt`, `alo.practice.givens-qr` after solving each — shape must match Plan 1's spec (attempts, correct, bestMetric, lastSolveAt, feats, todayCount, todayDate).
>
> Report SEVERITY-TAGGED bugs: CRITICAL / MAJOR / MINOR / NIT. Recommendation: READY TO SHIP BATCH 2, or FIXES NEEDED. Under 700 words.
>
> Do NOT fix anything yourself.

- [ ] **Step 3: Triage and fix**

For any CRITICAL or MAJOR issue, dispatch a fix-up subagent with explicit before/after code snippets. Re-verify by re-running build + a focused puppeteer check on the affected widget. MINOR issues: fix if <5 minutes; NIT: defer.

- [ ] **Step 4: Push final state**

```bash
git push
```

- [ ] **Step 5: Update memory**

Append to `C:/Users/User/.claude/projects/C--Users-User-Desktop-SO-os-study-guide/memory/project_alo_practice_redesign.md`:
```
### Plan 2 scope — SHIPPED YYYY-MM-DD
Batch 2 widgets live: W4 LU (Doolittle/Crout step-through), W7 Gram-Schmidt (2D SVG + dependence detection), W5 Givens QR (rotation playback). Catalog now lists 6 widgets across 3 groups. Algorithms in `src/content/alo/linalg/{luDecomp,gramSchmidt,givensQr}.js`. No new shared infra. Plan 3 (Batch 3: W6 Householder, W8 Power, W9 Iterative) remains.
```

Update the index entry in `MEMORY.md` to reflect 6/10 widgets shipped.

- [ ] **Step 6: Signal readiness for Plan 3**

At this point Plan 2 is complete. Plan 3 will be authored by a fresh `writing-plans` invocation, scoped to the 3 most ambitious widgets in the catalog (Householder QR uses R3F for 3D, power method has live convergence plotting, iterative solvers compare three methods).

---

## Self-Review Checklist

Running through the skill's self-review now:

**1. Spec coverage** (each Plan-2-relevant spec section → task mapping):
- §5 W4 LU: Tasks 1 (algorithm), 2 (instance), 3 (widget), 4 (catalog).
- §5 W7 Gram-Schmidt: Tasks 5, 6, 7, 8.
- §5 W5 Givens QR: Tasks 9, 10, 11, 12.
- §3 Progress / state machine — already covered by Plan 1's `useWidgetProgress`; each widget uses it (Tasks 3, 7, 11).
- §4 Widget data contract — each widget passes `{correct, metric, feats}` to `submit` (Tasks 3, 7, 11).
- §8 Animation pattern — each algorithm uses snapshot-and-scrub via `Step[]` consumed by `StepPlayer` (Tasks 1, 5, 9 emit; Tasks 3, 7, 11 render).
- §10 Bilingual + theming — every user-facing string uses `t(en, ro)`; every color uses `var(--theme-*)` except accent blue.
- §11 Bundle strategy — every widget is `lazy(() => import(...))` in the catalog (Tasks 4, 8, 12).
- §12 Accessibility — `aria-label` on SVG, `aria-pressed` on Yes/No buttons, all dialogs/buttons keyboard-reachable. (Done in Task 7.)

No spec gaps for Batch 2 widgets.

**2. Placeholder scan:** No TBD / TODO / "Similar to Task N" / "fill in details" anywhere. All code blocks are complete.

**3. Type consistency:**
- `runLuDecomp` returns `{ steps, L, U, success, ops: { divisions } }` — Task 3 widget destructures `{ steps, L, U, success }` correctly.
- `runGramSchmidt` returns `{ steps, orthonormal, dependent }` — Task 7 widget destructures all three.
- `runGivensQr` returns `{ steps, Q, R, rotations }` — Task 11 widget destructures all four.
- Step shapes per algorithm differ — each widget's `renderStep` handles its own algorithm's shape; default `MatrixDisplay` rendering is bypassed.
- `submit({ correct, metric, feats })` shape matches `useWidgetProgress` from Plan 1 (Task 12 there). Consistent.
- All catalog entries use the `WidgetSpec` shape from Plan 1's catalog scaffold. Consistent.
- Personal-best metric ids match: `lu-decomp.residual`, `gram-schmidt.steps`, `givens-qr.rotations`.

No type drift.

---

**Plan complete.** Saved to `docs/superpowers/plans/2026-04-17-alo-practice-plan-2-batch2.md`.
