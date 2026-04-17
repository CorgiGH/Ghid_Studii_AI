# ALO Practice Redesign — Plan 5: W10 Condition Number Playground

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the final widget in the catalog — **W10 Condition Number Playground** — an exploration widget where the student picks a perturbation Δb and sees how the linear-system solution amplifies it by a factor close to κ(A). After Plan 5 ships, the widget catalog reaches its full 10-of-10 state.

**Architecture:** No `Step[]` playback (W10 is exploration, not a step-by-step procedure). Instead the widget computes κ(A), solves Ax = b, then live-recomputes Ax̃ = b + Δb and displays the amplification ratio. Same shell + theming + bilingual + lazy-loading conventions as Plans 1–3.

**Tech Stack:** React 19, KaTeX, `ml-matrix`'s `SingularValueDecomposition` (κ via σ_max / σ_min) and `solve` (Ax = b solve via LU). No new deps.

**Reference:**
- Spec: `docs/superpowers/specs/2026-04-17-alo-practice-redesign-design.md` §5 W10 (lines 274–280) and §5 sidebar grouping (line 288: W10 → "Stability").
- Plans 1–3: `docs/superpowers/plans/2026-04-17-alo-practice-plan-{1,2,3}-*.md`.
- Memory: `C:/Users/User/.claude/projects/C--Users-User-Desktop-SO-os-study-guide/memory/project_alo_practice_redesign.md` — pattern reference and lessons learned (now 10 items including R3F).

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/content/alo/linalg/conditionNumber.js` | `computeConditionNumber(A)` (SVD-based κ + σ_max/σ_min), `solveLinearSystem(A, b)` (LU-based), `relativeAmplification(A, b, deltaB)` (one-shot ratio computation). |
| Create | `src/content/alo/practice/instances/conditionNumber.js` | Seeded instance generator covering Hilbert, Vandermonde, and random matrix families spanning four κ buckets: O(1), O(10²), O(10⁶), O(10¹⁰). |
| Create | `src/content/alo/practice/widgets/ConditionNumber.jsx` | Widget: display A + κ + b → live Δb input (VectorInput) → display Δx + amplification ratio → Q&A: "amplification factor?" (numeric) + "is A a Hilbert matrix?" (Yes/No). |
| Modify | `src/content/alo/practice/widgetCatalog.js` | Append a single new entry (W10) plus its import; reuse the existing `stability` group already declared in `GROUPS`. |

---

## Testing approach (same as Plans 1–3)

No unit-test framework. Verification per task = (a) `npm run build` passes, (b) `npm run lint` adds no new errors above the Plan 3 baseline, (c) manual browser smoke at `npm run dev` → `http://localhost:5173/#/y1s2/alo/practice`. Phase 3 runs a sonnet+Puppeteer cold review of the new widget plus a regression check that the existing 9 widgets still load.

---

## Phase 1 — W10 algorithm + instances + widget

### Task 1: Condition-number algorithm module

**Files:**
- Create: `src/content/alo/linalg/conditionNumber.js`

- [ ] **Step 1: Write the file**

Create `src/content/alo/linalg/conditionNumber.js`:

```js
import { Matrix, SingularValueDecomposition, solve } from 'ml-matrix';

/**
 * Compute the 2-norm condition number κ₂(A) = σ_max / σ_min via SVD.
 *
 * @param {number[][]} A square matrix
 * @returns {{ kappa: number, sigmaMax: number, sigmaMin: number, singular: boolean }}
 */
export function computeConditionNumber(A) {
  const M = new Matrix(A);
  const svd = new SingularValueDecomposition(M);
  const sigmas = svd.diagonal;
  if (sigmas.length === 0) {
    return { kappa: Infinity, sigmaMax: 0, sigmaMin: 0, singular: true };
  }
  const sigmaMax = sigmas[0];
  const sigmaMin = sigmas[sigmas.length - 1];
  const singular = sigmaMin < 1e-14 * Math.max(sigmaMax, 1);
  const kappa = singular ? Infinity : sigmaMax / sigmaMin;
  return { kappa, sigmaMax, sigmaMin, singular };
}

/**
 * Solve Ax = b via ml-matrix's `solve` (LU-based).
 *
 * @param {number[][]} A
 * @param {number[]}   b
 * @returns {number[]} x
 */
export function solveLinearSystem(A, b) {
  const M = new Matrix(A);
  const bMat = Matrix.columnVector(b);
  const xMat = solve(M, bMat);
  return xMat.to1DArray();
}

/**
 * For a given perturbation Δb, compute:
 *   x          = A⁻¹·b
 *   xPerturbed = A⁻¹·(b + Δb)
 *   Δx         = xPerturbed − x
 *   ratio      = (‖Δx‖₂ / ‖x‖₂) / (‖Δb‖₂ / ‖b‖₂)
 *
 * The ratio is bounded above by κ₂(A); when Δb is aligned with the worst right-singular vector
 * the bound is achieved.
 *
 * @returns {{ x, xPerturbed, deltaX, ratio, signFlip }}
 *   `signFlip` is true if any component of x flips sign between the unperturbed and perturbed solutions.
 */
export function relativeAmplification(A, b, deltaB) {
  const x = solveLinearSystem(A, b);
  const bPerturbed = b.map((v, i) => v + (deltaB?.[i] ?? 0));
  const xPerturbed = solveLinearSystem(A, bPerturbed);
  const deltaX = x.map((v, i) => xPerturbed[i] - v);

  const normX = norm2(x);
  const normB = norm2(b);
  const normDx = norm2(deltaX);
  const normDb = norm2(deltaB ?? b.map(() => 0));

  let ratio = NaN;
  if (normX > 0 && normB > 0 && normDb > 0) {
    ratio = (normDx / normX) / (normDb / normB);
  }

  const signFlip = x.some((v, i) => v !== 0 && xPerturbed[i] !== 0 && Math.sign(v) !== Math.sign(xPerturbed[i]));

  return { x, xPerturbed, deltaX, ratio, signFlip };
}

function norm2(v) {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  return Math.sqrt(s);
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 3: Sanity check via Node**

Create `/tmp/cn-sanity.mjs`:
```js
import { computeConditionNumber, solveLinearSystem, relativeAmplification } from './src/content/alo/linalg/conditionNumber.js';

// Identity — κ = 1
const I = [[1,0,0],[0,1,0],[0,0,1]];
console.log('κ(I):', computeConditionNumber(I).kappa.toFixed(4));

// Hilbert 4 — known-bad κ ≈ 1.55e4
const H4 = [
  [1, 1/2, 1/3, 1/4],
  [1/2, 1/3, 1/4, 1/5],
  [1/3, 1/4, 1/5, 1/6],
  [1/4, 1/5, 1/6, 1/7],
];
const { kappa: kH4 } = computeConditionNumber(H4);
console.log('κ(H4):', kH4.toExponential(2));

// Solve identity
console.log('solve I·x = (3,4,5):', solveLinearSystem(I, [3,4,5]));

// Amplification on Hilbert 4
const b = [1, 1, 1, 1];
const dB = [0.001, 0, 0, 0];
const { ratio, signFlip } = relativeAmplification(H4, b, dB);
console.log('amplification ratio:', ratio.toFixed(2), 'signFlip:', signFlip);
```

Run from repo root: `node /tmp/cn-sanity.mjs`. Expected output:
- κ(I) ≈ 1.0000
- κ(H4) ≈ 1.55e+4
- solve I → [3, 4, 5]
- amplification ratio is a finite positive number, often hundreds-to-thousands for Hilbert 4
Delete `/tmp/cn-sanity.mjs` after verifying.

- [ ] **Step 4: Commit + push**

```bash
git add src/content/alo/linalg/conditionNumber.js
git commit -m "feat(alo): condition-number primitives (κ via SVD, solve, amplification)"
git push
```

---

### Task 2: Instance generator

**Files:**
- Create: `src/content/alo/practice/instances/conditionNumber.js`

- [ ] **Step 1: Write the file**

Create `src/content/alo/practice/instances/conditionNumber.js`:

```js
import { mulberry32, randInt, pick } from '../../linalg/seedRandom';
import { computeConditionNumber } from '../../linalg/conditionNumber';

/**
 * Returns a problem instance for W10:
 *   { matrix, n, b, family, kappaTrue, isHilbert }
 *
 * Difficulty controls the κ band:
 *   easy   — κ ∈ [1, 10²]      (well-conditioned)
 *   medium — κ ∈ [10², 10⁶]    (moderately ill-conditioned)
 *   hard   — κ ∈ [10⁶, 10¹²]   (severely ill-conditioned, e.g. Hilbert 5+)
 *
 * Families: 'identity-scaled', 'random', 'vandermonde', 'hilbert'.
 * Hilbert is forced for ~30% of medium/hard instances so the `hilbert-spotter` feat is reachable.
 */
export function generateConditionNumberInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);

  const wantHilbert = difficulty !== 'easy' && rand() < 0.3;
  const candidatesEasy = ['identity-scaled', 'random'];
  const candidatesMed = ['random', 'vandermonde', 'hilbert'];
  const candidatesHard = ['vandermonde', 'hilbert'];

  for (let attempt = 0; attempt < 60; attempt++) {
    const family = wantHilbert
      ? 'hilbert'
      : difficulty === 'easy'
        ? pick(rand, candidatesEasy)
        : difficulty === 'hard'
          ? pick(rand, candidatesHard)
          : pick(rand, candidatesMed);
    const n = pickSize(rand, family, difficulty);
    const matrix = buildMatrix(rand, family, n);
    const { kappa, singular } = computeConditionNumber(matrix);
    if (singular) continue;
    if (!withinBand(kappa, difficulty)) continue;

    const b = Array.from({ length: n }, () => randInt(rand, -3, 3) || 1);
    return {
      matrix,
      n,
      b,
      family,
      kappaTrue: kappa,
      isHilbert: family === 'hilbert',
    };
  }

  // Fallback: Hilbert 4 always exists and is moderately ill-conditioned.
  const fallback = buildMatrix(rand, 'hilbert', 4);
  return {
    matrix: fallback,
    n: 4,
    b: [1, 1, 1, 1],
    family: 'hilbert',
    kappaTrue: computeConditionNumber(fallback).kappa,
    isHilbert: true,
  };
}

function pickSize(rand, family, difficulty) {
  if (family === 'hilbert') return difficulty === 'hard' ? 5 : difficulty === 'medium' ? 4 : 3;
  if (family === 'vandermonde') return difficulty === 'hard' ? 5 : 4;
  return difficulty === 'hard' ? 4 : 3;
}

function buildMatrix(rand, family, n) {
  if (family === 'hilbert') {
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => 1 / (i + j + 1)),
    );
  }
  if (family === 'vandermonde') {
    const xs = Array.from({ length: n }, (_, i) => 1 + i * 0.5);
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => Math.pow(xs[i], j)),
    );
  }
  if (family === 'identity-scaled') {
    const scale = randInt(rand, 1, 4);
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? scale : 0)),
    );
  }
  // random
  return Array.from({ length: n }, () =>
    Array.from({ length: n }, () => randInt(rand, -4, 4)),
  );
}

function withinBand(kappa, difficulty) {
  if (!Number.isFinite(kappa)) return false;
  if (difficulty === 'easy') return kappa >= 1 && kappa < 1e2;
  if (difficulty === 'medium') return kappa >= 1e2 && kappa < 1e6;
  return kappa >= 1e6 && kappa < 1e12;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: pass. (`ml-matrix` already installed; no new deps.)

- [ ] **Step 3: Commit + push**

```bash
git add src/content/alo/practice/instances/conditionNumber.js
git commit -m "feat(alo): W10 instance generator (Hilbert / Vandermonde / random across κ bands)"
git push
```

---

### Task 3: W10 widget

**Files:**
- Create: `src/content/alo/practice/widgets/ConditionNumber.jsx`

- [ ] **Step 1: Write the widget**

Create `src/content/alo/practice/widgets/ConditionNumber.jsx`:

```jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { MatrixDisplay, VectorInput } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { computeConditionNumber, relativeAmplification } from '../../linalg/conditionNumber';

export default function ConditionNumber({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [factorAnswer, setFactorAnswer] = useState('');
  const [hilbertGuess, setHilbertGuess] = useState(null); // null | true | false
  const [deltaB, setDeltaB] = useState(() => instance.b.map(() => '0'));
  const sawSignFlipRef = useRef(false);
  const { submit } = useWidgetProgress('condition-number', { pbLowerIsBetter: true });

  // Reset volatile UI state on new instance
  useEffect(() => {
    setSubmitted(false);
    setFactorAnswer('');
    setHilbertGuess(null);
    setDeltaB(instance.b.map(() => '0'));
    sawSignFlipRef.current = false;
  }, [instance]);

  const { kappa, sigmaMax, sigmaMin, singular } = useMemo(
    () => computeConditionNumber(instance.matrix),
    [instance],
  );

  const deltaBNumeric = useMemo(
    () => deltaB.map(s => {
      const v = parseFloat(s);
      return Number.isFinite(v) ? v : 0;
    }),
    [deltaB],
  );

  const probe = useMemo(
    () => relativeAmplification(instance.matrix, instance.b, deltaBNumeric),
    [instance, deltaBNumeric],
  );

  // Track lifetime sign-flip detection for the `near-singular` feat.
  useEffect(() => {
    if (probe.signFlip) sawSignFlipRef.current = true;
  }, [probe.signFlip]);

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);

    const parsed = parseFloat(factorAnswer);
    const factorCorrect =
      Number.isFinite(parsed) &&
      Number.isFinite(probe.ratio) &&
      Math.abs(Math.log10(Math.max(parsed, 1)) - Math.log10(Math.max(probe.ratio, 1))) < 0.5;

    const hilbertCorrect = hilbertGuess !== null && hilbertGuess === instance.isHilbert;

    const feats = [];
    if (hilbertCorrect && instance.isHilbert) feats.push('hilbert-spotter');
    if (sawSignFlipRef.current) feats.push('near-singular');

    submit({
      correct: factorCorrect && hilbertGuess !== null && hilbertCorrect,
      feats,
    });
    onSubmit?.({
      correct: factorCorrect && hilbertGuess !== null && hilbertCorrect,
      feats,
    });
  };

  const onNext = () => {
    onGenerateInstance?.();
  };

  const familyLabel = (() => {
    switch (instance.family) {
      case 'hilbert': return t('Hilbert', 'Hilbert');
      case 'vandermonde': return t('Vandermonde', 'Vandermonde');
      case 'identity-scaled': return t('Identity-scaled', 'Identitate scalată');
      default: return t('Random', 'Aleatorie');
    }
  })();

  const factorParsed = parseFloat(factorAnswer);
  const factorOk =
    submitted &&
    Number.isFinite(factorParsed) &&
    Number.isFinite(probe.ratio) &&
    Math.abs(Math.log10(Math.max(factorParsed, 1)) - Math.log10(Math.max(probe.ratio, 1))) < 0.5;
  const hilbertOk = submitted && hilbertGuess !== null && hilbertGuess === instance.isHilbert;

  return (
    <div className="space-y-4">
      <div className="p-3 rounded border text-sm"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
        <p className="font-medium mb-1">{t('Matrix A:', 'Matricea A:')}</p>
        <MatrixDisplay value={instance.matrix} />
        <p className="text-xs mt-2 opacity-75">
          {t('b =', 'b =')} ({instance.b.join(', ')})
        </p>
      </div>

      <div className="p-3 rounded border text-sm grid grid-cols-1 sm:grid-cols-3 gap-2"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #fff7ed)', color: 'var(--theme-content-text)' }}>
        <div><span className="opacity-70">σ<sub>max</sub>:</span> <span className="font-mono">{sigmaMax.toExponential(3)}</span></div>
        <div><span className="opacity-70">σ<sub>min</sub>:</span> <span className="font-mono">{sigmaMin.toExponential(3)}</span></div>
        <div><span className="opacity-70">κ<sub>2</sub>(A):</span> <span className="font-mono">{singular ? '∞' : kappa.toExponential(3)}</span></div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium" style={{ color: 'var(--theme-content-text)' }}>
          {t('Perturb b — set Δb:', 'Perturbă b — alege Δb:')}
        </p>
        <VectorInput
          length={instance.n}
          value={deltaB}
          onChange={setDeltaB}
          mode="float"
          ariaLabel="Delta b input"
        />

        <div className="text-xs font-mono mt-1" style={{ color: 'var(--theme-content-text)' }}>
          x = ({probe.x.map(v => v.toFixed(3)).join(', ')})
        </div>
        <div className="text-xs font-mono" style={{ color: 'var(--theme-content-text)' }}>
          x̃ = ({probe.xPerturbed.map(v => v.toFixed(3)).join(', ')})
        </div>
        <div className="text-xs font-mono" style={{ color: 'var(--theme-content-text)' }}>
          Δx = ({probe.deltaX.map(v => v.toFixed(3)).join(', ')})
        </div>
        <div className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
          {t('Live amplification (‖Δx‖/‖x‖) ÷ (‖Δb‖/‖b‖) ≈', 'Amplificare live (‖Δx‖/‖x‖) ÷ (‖Δb‖/‖b‖) ≈')}
          {' '}<span className="font-mono">{Number.isFinite(probe.ratio) ? probe.ratio.toExponential(2) : '—'}</span>
          {probe.signFlip && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded" style={{ background: '#fee2e2', color: '#b91c1c' }}>
              {t('sign flip detected', 'schimbare de semn detectată')}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm flex items-center gap-2" style={{ color: 'var(--theme-content-text)' }}>
          {t('Estimated amplification factor:', 'Factor de amplificare estimat:')}
          <input
            type="number" step="0.1"
            value={factorAnswer}
            onChange={(e) => setFactorAnswer(e.target.value)}
            disabled={submitted}
            className="px-2 py-1 rounded border w-32 font-mono"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg)', color: 'var(--theme-content-text)' }}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
          {t('Is A a Hilbert matrix?', 'Este A o matrice Hilbert?')}
        </span>
        <button
          disabled={submitted}
          onClick={() => setHilbertGuess(true)}
          aria-pressed={hilbertGuess === true}
          className="px-3 py-1 rounded text-sm border"
          style={{
            borderColor: hilbertGuess === true ? '#3b82f6' : 'var(--theme-border)',
            background: hilbertGuess === true ? '#3b82f6' : 'transparent',
            color: hilbertGuess === true ? '#fff' : 'var(--theme-content-text)',
          }}
        >{t('Yes', 'Da')}</button>
        <button
          disabled={submitted}
          onClick={() => setHilbertGuess(false)}
          aria-pressed={hilbertGuess === false}
          className="px-3 py-1 rounded text-sm border"
          style={{
            borderColor: hilbertGuess === false ? '#3b82f6' : 'var(--theme-border)',
            background: hilbertGuess === false ? '#3b82f6' : 'transparent',
            color: hilbertGuess === false ? '#fff' : 'var(--theme-content-text)',
          }}
        >{t('No', 'Nu')}</button>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        {!submitted ? (
          <button
            onClick={onCheck}
            disabled={hilbertGuess === null || !factorAnswer}
            className="px-4 py-1.5 rounded font-medium text-sm disabled:opacity-50"
            style={{ background: '#3b82f6', color: '#fff' }}
          >
            {t('Check', 'Verifică')}
          </button>
        ) : (
          <button onClick={onNext} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
            {t('New instance', 'Instanță nouă')}
          </button>
        )}
        {submitted && (
          <span className="text-sm px-3 py-1.5 rounded"
                style={{
                  background: factorOk && hilbertOk ? '#dcfce7' : '#fee2e2',
                  color: factorOk && hilbertOk ? '#15803d' : '#b91c1c',
                }}>
            {factorOk && hilbertOk
              ? t(`Correct — family ${familyLabel}, κ ≈ ${kappa.toExponential(2)}`, `Corect — familia ${familyLabel}, κ ≈ ${kappa.toExponential(2)}`)
              : t(`See: family was ${familyLabel}, κ ≈ ${kappa.toExponential(2)}, live ratio ≈ ${Number.isFinite(probe.ratio) ? probe.ratio.toExponential(2) : '—'}`, `Vezi: familia a fost ${familyLabel}, κ ≈ ${kappa.toExponential(2)}, raport live ≈ ${Number.isFinite(probe.ratio) ? probe.ratio.toExponential(2) : '—'}`)
            }
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 3: Commit + push**

```bash
git add src/content/alo/practice/widgets/ConditionNumber.jsx
git commit -m "feat(alo): W10 condition-number playground widget (κ, Δb explorer, Hilbert Q&A)"
git push
```

---

### Task 4: Register W10 in catalog

**Files:**
- Modify: `src/content/alo/practice/widgetCatalog.js`

- [ ] **Step 1: Add the import line**

After the existing line `import { generateIterativeSolversInstance } from './instances/iterativeSolvers';`, ADD a new import line:

```js
import { generateConditionNumberInstance } from './instances/conditionNumber';
```

- [ ] **Step 2: Append the W10 entry**

After the W9 (`iterative-solvers`) entry inside `export const widgetCatalog = [...]`, BEFORE the closing `];`, INSERT this new entry (keep trailing comma on previous entry):

```js
  {
    id: 'condition-number',
    title: { en: 'W10 · Condition Number', ro: 'W10 · Numărul de condiționare' },
    courseRef: 'alo-c3',
    groupId: 'stability',
    mode: 'tool-with-qa',
    Component: lazy(() => import('./widgets/ConditionNumber')),
    generateInstance: generateConditionNumberInstance,
    pbMetric: undefined,
    feats: [
      { id: 'hilbert-spotter', label: { en: 'Hilbert spotter — flagged a Hilbert variant', ro: 'Detector Hilbert — recunoscut o variantă Hilbert' }, condition: (h) => h.feats?.includes?.('hilbert-spotter') },
      { id: 'near-singular',   label: { en: 'Near-singular — induced a sign flip in x', ro: 'Aproape singular — provocat schimbare de semn în x' }, condition: (h) => h.feats?.includes?.('near-singular') },
    ],
  },
```

- [ ] **Step 3: Verify build + smoke test**

Run: `npm run build` — expected: passes.

Then `npm run dev` and navigate to `/#/y1s2/alo/practice`. Expected:
- Sidebar gains the new "Stability" group (the GROUPS array already declares `{ id: 'stability', label: { en: 'Stability', ro: 'Stabilitate' } }`).
- Click W10: matrix A renders with σ_max / σ_min / κ stat row, Δb VectorInput accepts numbers, x / x̃ / Δx update live as Δb changes, amplification ratio shown, "Hilbert?" Yes/No toggles, factor input + Hilbert guess required to enable Check.
- Try a perturbation that flips a sign in x for an ill-conditioned instance — confirm the red "sign flip detected" badge appears, then submit; on next instance the `near-singular` feat is set in localStorage.

- [ ] **Step 4: Commit + push**

```bash
git add src/content/alo/practice/widgetCatalog.js
git commit -m "feat(alo): register W10 condition-number in widget catalog (Plan 5)"
git push
```

---

## Phase 2 — Plan 5 Review Gate

### Task 5: Cold review + memory update

- [ ] **Step 1: Run validation commands**

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide"
npm run build
npm run lint
```
Expected: build passes; lint adds no new errors above Plan 3 baseline (pre-existing v86 / proxy / SubjectPage warnings stay).

- [ ] **Step 2: Dispatch a sonnet+Puppeteer review subagent**

Dispatch via Agent tool, `general-purpose`, model `sonnet`, with this prompt:

> Cold review of ALO Practice tab Plan 5 (W10 Condition Number Playground). Plan: `docs/superpowers/plans/2026-04-17-alo-practice-plan-5-w10.md`. Spec: `docs/superpowers/specs/2026-04-17-alo-practice-redesign-design.md` §5 W10.
>
> Run `npm run dev` in background; use Puppeteer to load `http://localhost:5173/#/y1s2/alo/practice`. Take screenshots at 1280×720 to `/tmp/alo-w10-desktop.png` and 375×720 to `/tmp/alo-w10-mobile.png`. Confirm sidebar now has 10 entries across 5 groups (Foundations: W1, W2; Linear systems: W3, W4; Factorizations: W7, W5, W6; Iterative & spectral: W8, W9; Stability: W10).
>
> For W10:
> - Confirm σ_max / σ_min / κ stat row renders.
> - Type values into the Δb VectorInput; confirm x / x̃ / Δx update live; confirm amplification ratio updates.
> - Generate several new instances. Confirm at least one Hilbert instance appears (medium or hard difficulty); confirm κ for Hilbert 4 is ~10⁴; confirm the family label says "Hilbert" after Check.
> - Try a Δb that triggers a sign flip on an ill-conditioned instance. Confirm the red "sign flip detected" badge appears.
> - Confirm Check stays disabled until both factor input is non-empty AND Yes/No is picked.
> - Submit a correct factor (within 0.5 of log10(ratio)) + correct Hilbert flag — confirm green "Correct" feedback.
> - Submit wrong values — confirm red feedback that includes the family label, κ, and live ratio.
> - Inspect `localStorage['alo.practice.condition-number']` shape: must contain attempts, correct, bestMetric, lastSolveAt, feats, todayCount, todayDate.
>
> Regression check on existing widgets: click W1, W3, W6, W8, W9 once each; confirm each opens, no console errors, ring still advances on Mark-as-reviewed / Check (where applicable).
>
> Bundle check: `npm run build` should NOT add a new R3F-style heavy chunk for W10 (it has no 3D viz). Main bundle should stay flat.
>
> Severity-tagged bug list: CRITICAL / MAJOR / MINOR / NIT. Recommendation: READY TO SHIP PLAN 5, or FIXES NEEDED. Under 600 words. Do NOT fix anything yourself. Kill the dev server before exiting.

- [ ] **Step 3: Triage and fix**

For any CRITICAL or MAJOR issue, dispatch a fix-up subagent with explicit before/after code snippets. Re-verify by re-running build + a focused puppeteer check on W10. MINOR issues: fix if <5 minutes; NIT: defer.

- [ ] **Step 4: Update memory**

Open `C:/Users/User/.claude/projects/C--Users-User-Desktop-SO-os-study-guide/memory/project_alo_practice_redesign.md` and:

1. Update front-matter `name:` from `Plans 1+2+3 shipped, 4-5 remaining` to `Plans 1+2+3+5 shipped, 4 remaining`.
2. Update front-matter `description:` from `9 of 10 widgets live` to `10 of 10 widgets live`.
3. Update the status line on line 7 (`## Status: 3 of 5 plans shipped`) to `## Status: 4 of 5 plans shipped (2026-04-17). 10 of 10 widgets live.`
4. Add a new authoritative-documents entry: `- **Plan 5** (shipped): docs/superpowers/plans/2026-04-17-alo-practice-plan-5-w10.md (commit <SHA-of-plan-doc>).`
5. Update the "Live commit range" line to bump HEAD to the new push SHA and add the count of new commits (~5 from Plan 5).
6. Tick W10 in the widget catalog table from `optional, decide before/after P4` to `✅ shipped`.
7. If anything novel was learned during Plan 5 review (e.g. a quirk of `ml-matrix`'s SVD, or a surprising VectorInput interaction), add it as lesson #11 in the "Critical lessons from review gates" section.
8. Update the "Resuming the project" section so it points to Plan 4 only (not Plan 5).

Also update `MEMORY.md` index entry for ALO Practice from `Plans 1–3 shipped` → `Plans 1–3+5 shipped` and change the live-widget count to 10.

- [ ] **Step 5: Push final state**

```bash
git push
```

(All per-task commits should already be pushed from Tasks 1–4; this is just paranoia.)

- [ ] **Step 6: Signal readiness for Plan 4**

At this point Plan 5 is complete. Plan 4 (Seminar tab migration: convert `Seminar01..Seminar06.jsx` from vertical-scroll JSX to JSON-backed problems consumed by `ExerciseShell`) is the remaining work. Plan 4 will be authored fresh by `writing-plans` when the user is ready.

---

## Self-Review Checklist

**1. Spec coverage** (W10-relevant spec sections → task mapping):

- §5 W10 purpose (enter A, see κ, perturb b, see Δx amplified): Task 1 (algorithm) emits κ + amplification ratio; Task 3 (widget) provides the matrix display + Δb VectorInput + live solve + ratio readout. ✓
- §5 W10 mode `tool-with-qa` ("by what factor is the relative error amplified?"): Task 3 widget asks for a numeric "estimated amplification factor"; Task 4 catalog entry sets `mode: 'tool-with-qa'`. ✓
- §5 W10 instances (κ ∈ {O(1), O(10²), O(10⁶), O(10¹⁰)}, Hilbert / Vandermonde / random): Task 2 instance generator implements three families and three difficulty κ-bands [1, 10²], [10², 10⁶], [10⁶, 10¹²]. ✓
- §5 W10 PB (none — exploration widget): Task 4 catalog entry sets `pbMetric: undefined` and the widget passes no `metric` to `submit()`. ✓
- §5 W10 feats (`hilbert-spotter`, `near-singular`): Task 3 widget detects both — `hilbert-spotter` when the user correctly answers "Is A a Hilbert matrix?" Yes for a Hilbert instance, `near-singular` when any Δb the user has tried during this instance produces a sign flip in x. Task 4 catalog entry registers both feat IDs. ✓
- §5 sidebar grouping (W10 → Stability): Task 4 catalog entry sets `groupId: 'stability'`. The `stability` group is already declared in `GROUPS` (it was reserved when the catalog was first written in Plan 1). ✓
- §3 progress state machine — Task 3 widget uses `useWidgetProgress('condition-number', ...)` unchanged. ✓
- §10 bilingual + theming — every user-facing string uses `t(en, ro)`; every color uses `var(--theme-*)` except accent blue `#3b82f6` and the literal red/green semantic flags `#fee2e2`/`#dcfce7` (consistent with W7/W8/W9 patterns). ✓
- §11 bundle strategy — Task 4 lazy-imports the widget; no new heavy deps means no new chunk. ✓
- §12 accessibility — `aria-pressed` on Yes/No buttons, `aria-label` on VectorInput, all controls keyboard-reachable. ✓

No spec gaps for W10.

**2. Placeholder scan:** No TBD / TODO / "implement later" / "similar to Task N" / bare prose describing code. All code blocks are complete and self-contained.

**3. Type consistency:**

- `computeConditionNumber(A)` returns `{ kappa, sigmaMax, sigmaMin, singular }` — Task 3 destructures all four. ✓
- `solveLinearSystem(A, b)` returns `number[]` — used internally by `relativeAmplification` only; widget never calls it directly. ✓
- `relativeAmplification(A, b, deltaB)` returns `{ x, xPerturbed, deltaX, ratio, signFlip }` — Task 3 widget destructures `x`, `xPerturbed`, `deltaX`, `ratio`, `signFlip`. ✓
- `generateConditionNumberInstance(seed, difficulty)` returns `{ matrix, n, b, family, kappaTrue, isHilbert }` — Task 3 widget reads `matrix`, `n`, `b`, `family`, `isHilbert`. `kappaTrue` is unused (widget recomputes via `computeConditionNumber` for live update with same seed; either is fine). ✓
- Catalog entry uses the same `WidgetSpec` shape as Plans 1–3. ✓
- `feats` array IDs match between widget pushes (`hilbert-spotter`, `near-singular`) and catalog entries. ✓

No type drift detected.

---

**Plan complete.** Saved to `docs/superpowers/plans/2026-04-17-alo-practice-plan-5-w10.md`.
