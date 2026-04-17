# ALO Practice Redesign — Plan 3: Batch 3 (W6 Householder QR, W8 Power Method, W9 Iterative Solvers)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the three most ambitious widgets in the catalog — **W6 Householder QR** (first 3D visualization via `@react-three/fiber`), **W8 Power Method** (live convergence plot + eigenvalue Q&A), **W9 Iterative Solvers** (Jacobi / Gauss–Seidel / SOR toggle + log residual plot + ω slider).

**Architecture:** Same pattern as Plans 1 & 2 — pure-JS algorithm modules emit `Step[]`; seeded instance generators produce parameterized problems; React widgets render via `StepPlayer` with custom `renderStep` callbacks. New wrinkles: W6 adds `@react-three/fiber` + `@react-three/drei` (lazy-bundled inside the W6 widget chunk thanks to `React.lazy` in the catalog, so R3F only loads when the user opens W6). W8 and W9 render live residual/convergence plots as pure SVG (no d3-scale) to match the W2/W7 pattern.

**Tech Stack:** React 19, KaTeX, motion, `fraction.js` (unused in this batch — floats throughout since eigen/Householder/SOR arithmetic is irrational). **New deps:** `three` + `@react-three/fiber` + `@react-three/drei` for W6 only. `ml-matrix` for eigenvalue gap verification in W8's instance generator.

**Reference:**
- Spec: `docs/superpowers/specs/2026-04-17-alo-practice-redesign-design.md` §5 W6 / W8 / W9, §7 (tech stack), §11 (bundle strategy).
- Plan 1: `docs/superpowers/plans/2026-04-17-alo-practice-plan-1-infra-batch1.md` (shell, primitives, progress hook).
- Plan 2: `docs/superpowers/plans/2026-04-17-alo-practice-plan-2-batch2.md` (W4 LU, W7 GS, W5 Givens — pattern to copy).
- Memory: `C:/Users/User/.claude/projects/C--Users-User-Desktop-SO-os-study-guide/memory/project_alo_practice_redesign.md` — status, locked decisions, critical lessons from review gates.

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `package.json` | Add `three`, `@react-three/fiber`, `@react-three/drei` dependencies. |
| Create | `src/content/alo/linalg/householderQr.js` | `runHouseholderQr(A)` — Householder QR (floats), emits `Step[]` with `{A, Q, reflection?: {col, x, v, normX, sign}, highlights, label}`. |
| Create | `src/content/alo/linalg/powerMethod.js` | `runPowerMethod(A, {maxIter, tol})` — emits `Step[]` with `{k, x, Ax, lambdaRayleigh, residualLambda, angleToTruth, label}` + final `{truthLambda, iterations, converged}`. |
| Create | `src/content/alo/linalg/iterativeSolvers.js` | `runIterativeSolvers(A, b, {method, omega, maxIter, tol})` for `'jacobi'`, `'gauss-seidel'`, `'sor'`. Emits `Step[]` with `{k, x, residualNorm, label}` + `{iterations, converged}`. Helper `optimalOmegaEstimate(A)`. |
| Create | `src/content/alo/practice/instances/householderQr.js` | seeded n×n (n∈{3,4}) with non-trivial first column (so column reflection is well-posed). |
| Create | `src/content/alo/practice/instances/powerMethod.js` | seeded symmetric n×n (n∈{3,4}) with controlled dominant-eigenvalue gap. Uses `ml-matrix`'s `EigenvalueDecomposition` to verify `|λ₁/λ₂| ≥ gap`. Stores `truthLambda` for scoring. |
| Create | `src/content/alo/practice/instances/iterativeSolvers.js` | seeded n×n (n∈{3,4,5}) strictly diagonally-dominant `A` + random `b`. |
| Create | `src/content/alo/practice/widgets/HouseholderQr.jsx` | Widget with n=3 R3F scene (reflection of column vector about plane ⟂ v) + matrix panel; n=4 falls back to matrix-only. |
| Create | `src/content/alo/practice/widgets/PowerMethod.jsx` | Widget with SVG convergence plot + eigenvalue numeric input + "Check" answer. |
| Create | `src/content/alo/practice/widgets/IterativeSolvers.jsx` | Widget with method radio (Jacobi / GS / SOR), ω slider (SOR-only), SVG log residual plot, fastest-method Q&A. |
| Modify | `src/content/alo/practice/widgetCatalog.js` | Append three new entries (W6, W8, W9) + three new imports. |

---

## Testing approach (same as Plans 1 & 2)

No unit-test framework. "Verification" per task = (a) `npm run build` passes, (b) `npm run lint` adds no new errors, (c) manual browser smoke at `npm run dev` → `http://localhost:5173/#/y1s2/alo/practice`. Phase 4 review gate runs a puppeteer cold review of all 3 new widgets with console-error + localStorage shape checks.

---

## Phase 0 — Install 3D dependencies

### Task 1: Add R3F + three to package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

Run:
```bash
cd "C:/Users/User/Desktop/SO/os-study-guide"
npm install three @react-three/fiber @react-three/drei
```

Expected: `package.json` gains three new deps; `package-lock.json` updates; no peer-dep warnings (R3F 8.x is compatible with React 19 via its built-in concurrent-mode support — but confirm by reading the terminal output; if npm warns about an incompatible React peer, re-run with `npm install three @react-three/fiber@latest @react-three/drei@latest`).

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: pass. Main bundle size should NOT increase — R3F is not imported anywhere yet.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(alo): add three + @react-three/fiber + @react-three/drei for W6 (Batch 3)"
```

---

## Phase 1 — W6 Householder QR

### Task 2: Householder algorithm

**Files:**
- Create: `src/content/alo/linalg/householderQr.js`

- [ ] **Step 1: Write the algorithm**

Create `src/content/alo/linalg/householderQr.js`:

```js
/**
 * QR factorization via Householder reflections (floats).
 * For each column k = 0..min(n, m-1)-1:
 *   x  = A[k..m-1, k]
 *   v  = x ± ‖x‖·e₁   (sign chosen to avoid cancellation: sign = sign(x[0]) || 1)
 *   v  = v / ‖v‖
 *   H  = I − 2 v vᵀ       (applied to rows k..m-1)
 *   A  = H·A
 *   Q  = Q·H
 *
 * Emits Step[] — each step has shape:
 *   { A, Q, reflection?: { col, x, v, normX, sign, vFull }, highlights, label: {en, ro} }
 *
 * `vFull` is v padded with zeros to length m (used by the R3F scene).
 *
 * @param {number[][]} inputMatrix
 * @returns {{ steps: Step[], Q: number[][], R: number[][], reflections: number }}
 */
export function runHouseholderQr(inputMatrix) {
  const m = inputMatrix.length;
  const n = inputMatrix[0]?.length ?? 0;
  if (m === 0 || n === 0) return { steps: [], Q: [], R: [], reflections: 0 };

  const A = inputMatrix.map(row => row.slice());
  const Q = identity(m);
  const steps = [];
  let reflections = 0;

  steps.push({
    A: cloneFloat(A),
    Q: cloneFloat(Q),
    highlights: {},
    label: { en: 'Initial: A; Q = I', ro: 'Inițial: A; Q = I' },
  });

  const limit = Math.min(n, m - 1);
  for (let k = 0; k < limit; k++) {
    // Extract subcolumn x = A[k..m-1, k]
    const x = [];
    for (let i = k; i < m; i++) x.push(A[i][k]);
    const normX = Math.hypot(...x);
    if (normX < 1e-14) continue;

    const sign = x[0] >= 0 ? 1 : -1;
    // v = x + sign(x[0]) * ‖x‖ * e₁
    const v = x.slice();
    v[0] = v[0] + sign * normX;
    const normV = Math.hypot(...v);
    if (normV < 1e-14) continue;
    for (let i = 0; i < v.length; i++) v[i] /= normV;

    // Apply H = I − 2 v vᵀ to A[k..m-1, :]
    for (let j = 0; j < n; j++) {
      let dot = 0;
      for (let i = 0; i < v.length; i++) dot += v[i] * A[k + i][j];
      for (let i = 0; i < v.length; i++) A[k + i][j] -= 2 * v[i] * dot;
    }
    // Apply H on the right to Q: Q = Q · H (cols k..m-1)
    for (let i = 0; i < m; i++) {
      let dot = 0;
      for (let j = 0; j < v.length; j++) dot += v[j] * Q[i][k + j];
      for (let j = 0; j < v.length; j++) Q[i][k + j] -= 2 * v[j] * dot;
    }

    reflections++;
    const vFull = Array.from({ length: m }, (_, i) => (i >= k ? v[i - k] : 0));
    steps.push({
      A: cloneFloat(A),
      Q: cloneFloat(Q),
      reflection: { col: k, x, v, vFull, normX, sign },
      highlights: { A: { rows: rangeArr(k, m - 1), cols: [k] } },
      label: {
        en: `Reflect column ${k + 1}: ‖x‖ = ${normX.toFixed(3)}, v = unit vector with ${v.length} entries`,
        ro: `Reflectăm coloana ${k + 1}: ‖x‖ = ${normX.toFixed(3)}, v = vector unitar cu ${v.length} componente`,
      },
    });
  }

  steps.push({
    A: cloneFloat(A),
    Q: cloneFloat(Q),
    highlights: { A: { cells: upperTriCells(A) } },
    label: {
      en: `Done — ${reflections} reflection(s). R = A; Q accumulated.`,
      ro: `Gata — ${reflections} reflexie/reflexii. R = A; Q acumulat.`,
    },
  });

  return { steps, Q, R: A, reflections };
}

function identity(n) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}
function cloneFloat(M) { return M.map(row => row.slice()); }
function rangeArr(lo, hi) {
  const out = [];
  for (let i = lo; i <= hi; i++) out.push(i);
  return out;
}
function upperTriCells(M) {
  const out = [];
  for (let i = 0; i < M.length; i++) for (let j = i; j < (M[0]?.length ?? 0); j++) out.push([i, j]);
  return out;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 3: Sanity check**

Add to `src/main.jsx` temporarily:
```js
import { runHouseholderQr } from './content/alo/linalg/householderQr';
const { steps, Q, R, reflections } = runHouseholderQr([[12, -51, 4], [6, 167, -68], [-4, 24, -41]]);
console.log('HH steps:', steps.length, 'reflections:', reflections,
  'R below diag:', R[1][0].toFixed(6), R[2][0].toFixed(6), R[2][1].toFixed(6));
// Check QR ≈ A:
let maxDiff = 0;
const A0 = [[12, -51, 4], [6, 167, -68], [-4, 24, -41]];
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
  let s = 0; for (let k = 0; k < 3; k++) s += Q[i][k] * R[k][j];
  maxDiff = Math.max(maxDiff, Math.abs(s - A0[i][j]));
}
console.log('HH ‖QR − A‖∞:', maxDiff);
```
Run `npm run dev`, open console. Expected: ≥3 steps, 2 reflections, all three subdiagonal entries near 0 (< 1e-10), `‖QR − A‖∞ < 1e-10`. Remove the temporary code afterwards.

- [ ] **Step 4: Commit**

```bash
git add src/content/alo/linalg/householderQr.js src/main.jsx
git commit -m "feat(alo): Householder QR algorithm with Step[] emission + reflection vectors"
```

---

### Task 3: Householder instance generator

**Files:**
- Create: `src/content/alo/practice/instances/householderQr.js`

- [ ] **Step 1: Write the generator**

Create `src/content/alo/practice/instances/householderQr.js`:

```js
import { mulberry32, randInt, pick } from '../../linalg/seedRandom';

/**
 * @returns {{ matrix: number[][], n: number }}
 *
 * difficulty:
 *   easy   — n=3, small integer entries
 *   medium — n=3, slightly larger entries
 *   hard   — n=4
 *
 * Curated seeds for n=3 so the first column has a "nice" reflection.
 */
export function generateHouseholderQrInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const n = difficulty === 'hard' ? 4 : 3;
  const range = difficulty === 'easy' ? 4 : 6;

  const curated3 = [
    [[12, -51, 4], [6, 167, -68], [-4, 24, -41]],
    [[3, 1, 0], [4, 1, 1], [0, 1, 1]],
    [[1, 2, 3], [2, 1, 4], [-1, 1, 2]],
    [[4, 0, 1], [0, 3, 2], [3, 4, 0]],
  ];

  const useCurated = n === 3 && rand() < 0.5;
  let matrix;
  if (useCurated) {
    matrix = pick(rand, curated3).map(row => row.slice());
  } else {
    matrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => randInt(rand, -range, range)),
    );
    // Ensure first column has a nonzero reflection target:
    // If all first-column entries below A[0][0] are 0, force A[1][0] = 1.
    let hasNonzeroBelow = false;
    for (let i = 1; i < n; i++) if (matrix[i][0] !== 0) { hasNonzeroBelow = true; break; }
    if (!hasNonzeroBelow) matrix[1][0] = 1;
  }

  return { matrix, n };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/content/alo/practice/instances/householderQr.js
git commit -m "feat(alo): W6 Householder QR instance generator (curated 3x3 seeds)"
```

---

### Task 4: Householder widget (with R3F 3D scene)

**Files:**
- Create: `src/content/alo/practice/widgets/HouseholderQr.jsx`

- [ ] **Step 1: Write the widget**

Create `src/content/alo/practice/widgets/HouseholderQr.jsx`:

```jsx
import React, { useMemo, useState, Suspense, lazy } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { StepPlayer, MatrixDisplay } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { runHouseholderQr } from '../../linalg/householderQr';

const ReflectionScene = lazy(() => import('./HouseholderScene'));

export default function HouseholderQr({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const { submit } = useWidgetProgress('householder-qr', { pbLowerIsBetter: true });

  const { steps, Q, R, reflections } = useMemo(
    () => runHouseholderQr(instance.matrix),
    [instance],
  );

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const feats = [];
    // single-shot: reached upper-triangular R without numeric drift — proxy: ‖QR − A‖∞ < 1e-9
    const residual = residualMax(instance.matrix, Q, R);
    if (residual < 1e-9) feats.push('single-shot');
    // orthogonal: ‖QᵀQ − I‖∞ < 1e-9
    if (orthogonalResidual(Q) < 1e-9) feats.push('orthogonal');
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

      <StepPlayer
        steps={steps}
        renderStep={(step) => (
          <div className="space-y-3">
            {step.reflection && (
              <div className="text-xs font-mono p-2 rounded"
                   style={{ background: 'var(--theme-content-bg-alt, #fff7ed)', color: 'var(--theme-content-text)' }}>
                {t('Reflection', 'Reflexie')} k = {step.reflection.col + 1}:
                {' '}‖x‖ = {step.reflection.normX.toFixed(4)},
                {' '}v = ({step.reflection.v.map(c => c.toFixed(3)).join(', ')})
              </div>
            )}
            <div className="flex gap-6 flex-wrap items-start">
              {instance.n === 3 && step.reflection && (
                <div className="shrink-0"
                     style={{ width: 320, height: 320, border: '1px solid var(--theme-border)', borderRadius: 8, background: 'var(--theme-content-bg-alt, #f8fafc)' }}>
                  <Suspense fallback={<SceneFallback t={t} />}>
                    <ReflectionScene x={step.reflection.x} v={step.reflection.v} />
                  </Suspense>
                </div>
              )}
              <div>
                <p className="text-xs font-medium mb-1 opacity-70" style={{ color: 'var(--theme-content-text)' }}>A</p>
                <MatrixDisplay value={step.A} highlight={step.highlights?.A ?? {}} />
              </div>
              <div>
                <p className="text-xs font-medium mb-1 opacity-70" style={{ color: 'var(--theme-content-text)' }}>Q</p>
                <MatrixDisplay value={step.Q} />
              </div>
            </div>
          </div>
        )}
      />

      <div className="flex gap-2 items-center">
        <span className="text-xs opacity-75" style={{ color: 'var(--theme-content-text)' }}>
          {t('Reflections used:', 'Reflexii utilizate:')} {reflections} / {Math.min(instance.n, instance.n - 1)}
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

function SceneFallback({ t }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-xs opacity-70" style={{ color: 'var(--theme-content-text)' }}>
      {t('Loading 3D view…', 'Se încarcă vizualizarea 3D…')}
    </div>
  );
}

function residualMax(A, Q, R) {
  const m = A.length, n = A[0]?.length ?? 0;
  let maxAbs = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let k = 0; k < Math.min(m, R.length); k++) s += Q[i][k] * R[k][j];
      const diff = Math.abs(A[i][j] - s);
      if (diff > maxAbs) maxAbs = diff;
    }
  }
  return maxAbs;
}

function orthogonalResidual(Q) {
  const n = Q.length;
  let maxAbs = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let dot = 0;
      for (let k = 0; k < n; k++) dot += Q[k][i] * Q[k][j];
      const target = i === j ? 1 : 0;
      const diff = Math.abs(dot - target);
      if (diff > maxAbs) maxAbs = diff;
    }
  }
  return maxAbs;
}
```

- [ ] **Step 2: Write the R3F scene file**

Create `src/content/alo/practice/widgets/HouseholderScene.jsx`:

```jsx
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';

/**
 * Renders a 3D scene visualizing a Householder reflection:
 *   — blue arrow = x (the column being reflected)
 *   — amber arrow = v (the reflection axis)
 *   — green arrow = H·x = reflected(x)   =  x − 2 v (v · x)
 *   — translucent plane ⟂ v through origin = the reflection mirror
 *
 * Expects x and v as 3-arrays. If lengths differ (e.g. n=4 edge case slipped through),
 * pads/truncates to 3D.
 */
export default function HouseholderScene({ x, v }) {
  const x3 = to3(x);
  const v3 = normalize(to3(v));

  const reflected = useMemo(() => {
    const dot = x3[0] * v3[0] + x3[1] * v3[1] + x3[2] * v3[2];
    return [x3[0] - 2 * v3[0] * dot, x3[1] - 2 * v3[1] * dot, x3[2] - 2 * v3[2] * dot];
  }, [x3, v3]);

  const bound = Math.max(Math.hypot(...x3), Math.hypot(...v3), 1) * 1.2;
  const planeBasis = useMemo(() => orthonormalBasisPerpTo(v3), [v3]);

  return (
    <Canvas camera={{ position: [bound * 1.8, bound * 1.6, bound * 2.2], fov: 45 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} />
      <OrbitControls enablePan={false} />

      <axesHelper args={[bound]} />

      {/* Reflection plane */}
      <mesh rotation={quaternionFromBasis(planeBasis)}>
        <planeGeometry args={[bound * 1.6, bound * 1.6]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.28} side={2} />
      </mesh>

      {/* x (blue) */}
      <Arrow start={[0, 0, 0]} end={x3} color="#3b82f6" />
      {/* v (amber) — scaled to bound for visibility */}
      <Arrow start={[0, 0, 0]} end={[v3[0] * bound, v3[1] * bound, v3[2] * bound]} color="#f59e0b" />
      {/* H·x (green) */}
      <Arrow start={[0, 0, 0]} end={reflected} color="#22c55e" />
    </Canvas>
  );
}

function Arrow({ start, end, color }) {
  return <Line points={[start, end]} color={color} lineWidth={2} />;
}

function to3(arr) {
  const a = (arr ?? []).slice(0, 3);
  while (a.length < 3) a.push(0);
  return [Number(a[0]) || 0, Number(a[1]) || 0, Number(a[2]) || 0];
}

function normalize(a) {
  const n = Math.hypot(...a);
  if (n < 1e-12) return [1, 0, 0];
  return [a[0] / n, a[1] / n, a[2] / n];
}

function orthonormalBasisPerpTo(n) {
  // Given unit n, build e1, e2 spanning the plane ⟂ n.
  const pick = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const e1 = normalize(cross(pick, n));
  const e2 = normalize(cross(n, e1));
  return { e1, e2, n };
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function quaternionFromBasis({ e1, e2, n }) {
  // Rotation that maps the default plane normal (0,0,1) to `n`.
  // three.js planeGeometry lies in the XY plane with normal +Z.
  // Use Euler-from-axis-angle: axis = (0,0,1) × n, angle = acos(n.z).
  const zDotN = n[2];
  if (Math.abs(zDotN - 1) < 1e-9) return [0, 0, 0];     // already aligned
  if (Math.abs(zDotN + 1) < 1e-9) return [Math.PI, 0, 0]; // flipped
  const axis = normalize([-n[1], n[0], 0]); // (0,0,1) × n, simplified
  const angle = Math.acos(zDotN);
  // three.js rotation prop accepts Euler triple; approximate via axis-angle → Euler
  // Rodrigues: for small-to-moderate angles the XYZ Euler approximation rot ≈ angle·axis is close
  // but for correctness, use a precomputed Euler: rotate about axis by angle.
  // React-three-fiber's rotation prop is XYZ Euler; we build an equivalent via a proper conversion:
  return axisAngleToEulerXYZ(axis, angle);
  void e1; void e2;
}

function axisAngleToEulerXYZ(axis, angle) {
  // Standard axis-angle to XYZ Euler.
  const [x, y, z] = axis;
  const c = Math.cos(angle), s = Math.sin(angle), C = 1 - c;
  const m00 = c + x * x * C;
  const m01 = x * y * C - z * s;
  const m02 = x * z * C + y * s;
  const m10 = y * x * C + z * s;
  const m12 = y * z * C - x * s;
  const m20 = z * x * C - y * s;
  const m21 = z * y * C + x * s;
  const m22 = c + z * z * C;

  // Extract XYZ Euler (three.js convention)
  const ry = Math.asin(clamp(m02, -1, 1));
  let rx, rz;
  if (Math.abs(m02) < 0.99999) {
    rx = Math.atan2(-m12, m22);
    rz = Math.atan2(-m01, m00);
  } else {
    rx = Math.atan2(m21, m11);
    rz = 0;
  }
  return [rx, ry, rz];
  void m10; void m20;
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: pass. Output should mention a new chunk that includes R3F — confirm R3F is NOT in the main chunk (bundle report will show something like `HouseholderScene-*.js` separately).

- [ ] **Step 4: Commit**

```bash
git add src/content/alo/practice/widgets/HouseholderQr.jsx src/content/alo/practice/widgets/HouseholderScene.jsx
git commit -m "feat(alo): W6 Householder QR widget + R3F reflection scene (lazy)"
```

---

### Task 5: Register W6 in catalog

**Files:**
- Modify: `src/content/alo/practice/widgetCatalog.js`

- [ ] **Step 1: Add the import line**

After the existing `import { generateGivensQrInstance } from './instances/givensQr';`, add:

```js
import { generateHouseholderQrInstance } from './instances/householderQr';
```

- [ ] **Step 2: Append the W6 entry**

After the W5 (`givens-qr`) entry, before the closing `]`, add:

```js
  {
    id: 'householder-qr',
    title: { en: 'W6 · Householder QR', ro: 'W6 · QR cu Householder' },
    courseRef: 'alo-c6',
    groupId: 'factorizations',
    mode: 'exercise',
    Component: lazy(() => import('./widgets/HouseholderQr')),
    generateInstance: generateHouseholderQrInstance,
    pbMetric: { id: 'residual', label: { en: 'Residual ‖QR − A‖∞', ro: 'Reziduu ‖QR − A‖∞' }, lowerIsBetter: true },
    feats: [
      { id: 'single-shot', label: { en: 'Single shot — ‖QR − A‖∞ < 1e-9', ro: 'Dintr-o lovitură — ‖QR − A‖∞ < 1e-9' }, condition: (h) => h.feats?.includes?.('single-shot') },
      { id: 'orthogonal', label: { en: 'Orthogonal — ‖QᵀQ − I‖∞ < 1e-9', ro: 'Ortogonal — ‖QᵀQ − I‖∞ < 1e-9' }, condition: (h) => h.feats?.includes?.('orthogonal') },
    ],
  },
```

- [ ] **Step 3: Verify build + smoke test**

Run: `npm run build`. Expected: pass.

Then `npm run dev` and navigate to `/#/y1s2/alo/practice`. Expected:
- Sidebar's "Factorizations" group now contains W7, W5, W6 (three entries).
- Click W6: matrix A renders, StepPlayer scrubs through reflection steps, n=3 instance shows a 3D R3F canvas with blue x + amber v + green H·x arrows and a translucent reflection plane, n=4 instance shows matrix-only. No console errors. "Mark as reviewed" advances the ring.

- [ ] **Step 4: Commit**

```bash
git add src/content/alo/practice/widgetCatalog.js
git commit -m "feat(alo): register W6 householder-qr in widget catalog (Batch 3)"
```

---

## Phase 2 — W8 Power Method

### Task 6: Power method algorithm

**Files:**
- Create: `src/content/alo/linalg/powerMethod.js`

- [ ] **Step 1: Write the algorithm**

Create `src/content/alo/linalg/powerMethod.js`:

```js
/**
 * Power method for the dominant eigenvalue of a square matrix A (floats).
 *
 * xₖ₊₁ = A·xₖ / ‖A·xₖ‖
 * λₖ   = xₖᵀ·A·xₖ / (xₖᵀ·xₖ)    (Rayleigh quotient)
 *
 * Emits Step[] with shape:
 *   { k, x, Ax, lambdaRayleigh, residualLambda, angleToTruth?, highlights, label: {en, ro} }
 * where `residualLambda = |λₖ − λₖ₋₁|` (NaN on k=0).
 *
 * @param {number[][]} A
 * @param {object} options
 * @param {number} options.maxIter   default 30
 * @param {number} options.tol       default 1e-6 (stops when |λₖ − λₖ₋₁| < tol)
 * @param {number[]} [options.truthEigenvector]  for angle-to-truth metric
 * @returns {{ steps: Step[], lambda: number, iterations: number, converged: boolean, finalX: number[] }}
 */
export function runPowerMethod(A, { maxIter = 30, tol = 1e-6, truthEigenvector } = {}) {
  const n = A.length;
  const steps = [];
  let x = Array.from({ length: n }, (_, i) => (i === 0 ? 1 : 0.1)); // deterministic seed
  let prevLambda = NaN;
  let lambda = NaN;
  let iterations = 0;
  let converged = false;

  // Initial step
  {
    const Ax = matVec(A, x);
    lambda = rayleigh(x, Ax);
    steps.push({
      k: 0,
      x: x.slice(),
      Ax: Ax.slice(),
      lambdaRayleigh: lambda,
      residualLambda: NaN,
      angleToTruth: truthEigenvector ? angleBetween(x, truthEigenvector) : null,
      highlights: {},
      label: { en: 'Initial x₀', ro: 'Inițial x₀' },
    });
  }

  for (let k = 1; k <= maxIter; k++) {
    const Ax = matVec(A, x);
    const norm = Math.hypot(...Ax);
    if (norm < 1e-14) break;
    const xNext = Ax.map(c => c / norm);
    prevLambda = lambda;
    lambda = rayleigh(xNext, matVec(A, xNext));
    const residualLambda = Math.abs(lambda - prevLambda);

    steps.push({
      k,
      x: xNext.slice(),
      Ax: Ax.slice(),
      lambdaRayleigh: lambda,
      residualLambda,
      angleToTruth: truthEigenvector ? angleBetween(xNext, truthEigenvector) : null,
      highlights: {},
      label: {
        en: `k=${k}: λ = ${lambda.toFixed(5)}, Δλ = ${residualLambda.toExponential(2)}`,
        ro: `k=${k}: λ = ${lambda.toFixed(5)}, Δλ = ${residualLambda.toExponential(2)}`,
      },
    });

    x = xNext;
    iterations = k;
    if (residualLambda < tol) { converged = true; break; }
  }

  return { steps, lambda, iterations, converged, finalX: x };
}

function matVec(A, x) {
  const n = A.length;
  const out = new Array(n).fill(0);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out[i] += A[i][j] * x[j];
  return out;
}
function rayleigh(x, Ax) {
  let top = 0, bot = 0;
  for (let i = 0; i < x.length; i++) { top += x[i] * Ax[i]; bot += x[i] * x[i]; }
  return bot === 0 ? NaN : top / bot;
}
function angleBetween(a, b) {
  const na = Math.hypot(...a), nb = Math.hypot(...b);
  if (na === 0 || nb === 0) return NaN;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  const cos = Math.min(1, Math.max(-1, Math.abs(dot) / (na * nb))); // abs — direction doesn't matter
  return Math.acos(cos);
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 3: Sanity check**

Add to `src/main.jsx` temporarily:
```js
import { runPowerMethod } from './content/alo/linalg/powerMethod';
const { lambda, iterations, converged } = runPowerMethod([[4, 1, 0], [1, 3, 1], [0, 1, 2]]);
console.log('Power method: λ ≈', lambda.toFixed(5), 'iter:', iterations, 'converged:', converged);
```
Run `npm run dev`. Expected: λ ≈ 4.73 (dominant eigenvalue of the symmetric matrix), convergence in ≤15 iterations. Remove the temporary code.

- [ ] **Step 4: Commit**

```bash
git add src/content/alo/linalg/powerMethod.js src/main.jsx
git commit -m "feat(alo): power method (Rayleigh quotient) with Step[] emission"
```

---

### Task 7: Power method instance generator

**Files:**
- Create: `src/content/alo/practice/instances/powerMethod.js`

- [ ] **Step 1: Write the generator**

Create `src/content/alo/practice/instances/powerMethod.js`:

```js
import { Matrix, EigenvalueDecomposition } from 'ml-matrix';
import { mulberry32, randInt } from '../../linalg/seedRandom';

/**
 * Generates a symmetric n×n matrix with a controlled spectral gap.
 *
 * difficulty:
 *   easy   — n=3, target gap |λ₁/λ₂| ≥ 2.5
 *   medium — n=3, gap ≥ 1.8
 *   hard   — n=4, gap ≥ 1.3
 *
 * Symmetric ensures real eigenvalues. Gap verified via ml-matrix's EVD.
 *
 * @returns {{ matrix: number[][], n: number, truthLambda: number, truthVec: number[], gapRatio: number }}
 */
export function generatePowerMethodInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const n = difficulty === 'hard' ? 4 : 3;
  const minGap = difficulty === 'easy' ? 2.5 : difficulty === 'hard' ? 1.3 : 1.8;

  for (let attempt = 0; attempt < 100; attempt++) {
    const M = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => randInt(rand, -3, 3)),
    );
    // Symmetrize: A = M + Mᵀ
    const A = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) A[i][j] = M[i][j] + M[j][i];

    // Compute eigenvalues via ml-matrix
    const evd = new EigenvalueDecomposition(new Matrix(A));
    const real = evd.realEigenvalues;
    // Sort by |λ| desc
    const sortedIdx = [...real.map((_, i) => i)].sort((a, b) => Math.abs(real[b]) - Math.abs(real[a]));
    const lambdas = sortedIdx.map(i => real[i]);
    if (Math.abs(lambdas[1]) < 1e-9) continue; // degenerate — λ₂ ≈ 0
    const gapRatio = Math.abs(lambdas[0]) / Math.abs(lambdas[1]);
    if (gapRatio < minGap) continue;

    const eigenVec = evd.eigenvectorMatrix.to2DArray().map(row => row[sortedIdx[0]]);
    return {
      matrix: A,
      n,
      truthLambda: lambdas[0],
      truthVec: eigenVec,
      gapRatio,
    };
  }

  // Fallback — shouldn't hit, but return a known-good 3×3
  return {
    matrix: [[4, 1, 0], [1, 3, 1], [0, 1, 2]],
    n: 3,
    truthLambda: 4.7321,
    truthVec: [0.7370, 0.5910, 0.3280],
    gapRatio: 2.1,
  };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: pass. `ml-matrix` is already in `dependencies`, no new install.

- [ ] **Step 3: Commit**

```bash
git add src/content/alo/practice/instances/powerMethod.js
git commit -m "feat(alo): W8 power method instance generator (symmetric, gap-verified)"
```

---

### Task 8: Power method widget

**Files:**
- Create: `src/content/alo/practice/widgets/PowerMethod.jsx`

- [ ] **Step 1: Write the widget**

Create `src/content/alo/practice/widgets/PowerMethod.jsx`:

```jsx
import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { StepPlayer, MatrixDisplay } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { runPowerMethod } from '../../linalg/powerMethod';

export default function PowerMethod({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [answer, setAnswer] = useState('');
  const [gapGuess, setGapGuess] = useState('');
  const { submit } = useWidgetProgress('power-method', { pbLowerIsBetter: true });

  const { steps, lambda: computedLambda, iterations, converged } = useMemo(
    () => runPowerMethod(instance.matrix, {
      maxIter: 30,
      tol: 1e-6,
      truthEigenvector: instance.truthVec,
    }),
    [instance],
  );

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const parsed = parseFloat(answer);
    const lambdaCorrect = Number.isFinite(parsed) && Math.abs(parsed - instance.truthLambda) < 0.05;
    const feats = [];
    if (lambdaCorrect && iterations <= 5) feats.push('fast-converge');
    if (gapGuess) {
      const parsedGap = parseFloat(gapGuess);
      if (Number.isFinite(parsedGap) && Math.abs(parsedGap - instance.gapRatio) < 0.15) {
        feats.push('gap-spotter');
      }
    }
    submit({ correct: lambdaCorrect, metric: iterations, feats });
    onSubmit?.({ correct: lambdaCorrect, metric: iterations, feats });
  };

  const onNext = () => {
    setSubmitted(false);
    setAnswer('');
    setGapGuess('');
    onGenerateInstance?.();
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded border text-sm"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
        <p className="font-medium mb-1">{t('Find the dominant eigenvalue of A:', 'Găsește valoarea proprie dominantă a lui A:')}</p>
        <MatrixDisplay value={instance.matrix} />
      </div>

      <StepPlayer
        steps={steps}
        renderStep={(step) => (
          <div className="space-y-2">
            <p className="text-xs font-mono" style={{ color: 'var(--theme-content-text)' }}>
              x<sub>{step.k}</sub> = ({step.x.map(c => c.toFixed(3)).join(', ')})
              {step.lambdaRayleigh != null && !Number.isNaN(step.lambdaRayleigh) && (
                <>  ·  λ ≈ {step.lambdaRayleigh.toFixed(5)}</>
              )}
            </p>
            <ConvergencePlot steps={steps} currentK={step.k} />
          </div>
        )}
        intervalMs={900}
      />

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm flex items-center gap-2" style={{ color: 'var(--theme-content-text)' }}>
          {t('Your λ₁:', 'λ₁ al tău:')}
          <input
            type="number" step="0.01"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={submitted}
            className="px-2 py-1 rounded border w-28 font-mono"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg)', color: 'var(--theme-content-text)' }}
          />
        </label>
        <label className="text-sm flex items-center gap-2" style={{ color: 'var(--theme-content-text)' }}>
          {t('Gap ratio |λ₁/λ₂| (optional):', 'Raport gap |λ₁/λ₂| (opțional):')}
          <input
            type="number" step="0.01"
            value={gapGuess}
            onChange={(e) => setGapGuess(e.target.value)}
            disabled={submitted}
            className="px-2 py-1 rounded border w-24 font-mono"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg)', color: 'var(--theme-content-text)' }}
          />
        </label>
      </div>

      <div className="flex gap-2 items-center">
        {!submitted ? (
          <button onClick={onCheck} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
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
                  background: Math.abs(parseFloat(answer) - instance.truthLambda) < 0.05 ? '#dcfce7' : '#fee2e2',
                  color: Math.abs(parseFloat(answer) - instance.truthLambda) < 0.05 ? '#15803d' : '#b91c1c',
                }}>
            {Math.abs(parseFloat(answer) - instance.truthLambda) < 0.05
              ? t(`Correct — truth λ₁ = ${instance.truthLambda.toFixed(4)}, converged in ${iterations} iter`, `Corect — adevărat λ₁ = ${instance.truthLambda.toFixed(4)}, convergență în ${iterations} iter`)
              : t(`Off — truth λ₁ = ${instance.truthLambda.toFixed(4)} (computed ${computedLambda.toFixed(4)})`, `Greșit — adevărat λ₁ = ${instance.truthLambda.toFixed(4)} (calculat ${computedLambda.toFixed(4)})`)
            }
          </span>
        )}
        {!converged && submitted && (
          <span className="text-xs opacity-75" style={{ color: 'var(--theme-content-text)' }}>
            {t('(did not reach tol in 30 iter)', '(nu s-a atins toleranța în 30 iter)')}
          </span>
        )}
      </div>
    </div>
  );
}

const PLOT_W = 320, PLOT_H = 140, PAD = 28;

function ConvergencePlot({ steps, currentK }) {
  // Plot λₖ vs k — simple SVG line chart, auto-scale Y.
  const ys = steps.map(s => s.lambdaRayleigh).filter(v => Number.isFinite(v));
  if (ys.length === 0) return null;
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const yPad = (yMax - yMin) * 0.1 || 0.5;
  const yLo = yMin - yPad, yHi = yMax + yPad;
  const xMax = Math.max(steps.length - 1, 1);

  const xs = (k) => PAD + (k / xMax) * (PLOT_W - 2 * PAD);
  const ysc = (v) => PLOT_H - PAD - ((v - yLo) / (yHi - yLo)) * (PLOT_H - 2 * PAD);

  const pts = steps
    .filter(s => Number.isFinite(s.lambdaRayleigh))
    .map(s => `${xs(s.k)},${ysc(s.lambdaRayleigh)}`)
    .join(' ');
  const currentStep = steps.find(s => s.k === currentK);

  return (
    <svg width={PLOT_W} height={PLOT_H}
         style={{ background: 'var(--theme-content-bg-alt, #f8fafc)', border: '1px solid var(--theme-border)', borderRadius: 6 }}
         aria-label="Rayleigh quotient convergence">
      <line x1={PAD} y1={PLOT_H - PAD} x2={PLOT_W - PAD} y2={PLOT_H - PAD} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={PAD} y1={PAD} x2={PAD} y2={PLOT_H - PAD} stroke="#cbd5e1" strokeWidth={1} />
      <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth={2} />
      {currentStep && Number.isFinite(currentStep.lambdaRayleigh) && (
        <circle cx={xs(currentStep.k)} cy={ysc(currentStep.lambdaRayleigh)} r={4} fill="#22c55e" />
      )}
      <text x={PAD + 4} y={PAD - 6} fontSize={10} fill="#64748b">λ</text>
      <text x={PLOT_W - PAD - 10} y={PLOT_H - PAD + 14} fontSize={10} fill="#64748b">k</text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/content/alo/practice/widgets/PowerMethod.jsx
git commit -m "feat(alo): W8 power method widget (SVG convergence plot + eigenvalue Q&A)"
```

---

### Task 9: Register W8 in catalog

**Files:**
- Modify: `src/content/alo/practice/widgetCatalog.js`

- [ ] **Step 1: Add the import line**

After the `import { generateHouseholderQrInstance } from './instances/householderQr';` line, add:

```js
import { generatePowerMethodInstance } from './instances/powerMethod';
```

- [ ] **Step 2: Append the W8 entry**

After the W6 (`householder-qr`) entry, before the closing `]`, add:

```js
  {
    id: 'power-method',
    title: { en: 'W8 · Power Method', ro: 'W8 · Metoda puterii' },
    courseRef: 'alo-c7',
    groupId: 'iterative-spectral',
    mode: 'tool-with-qa',
    Component: lazy(() => import('./widgets/PowerMethod')),
    generateInstance: generatePowerMethodInstance,
    pbMetric: { id: 'iterations', label: { en: 'Iterations', ro: 'Iterații' }, lowerIsBetter: true },
    feats: [
      { id: 'fast-converge', label: { en: 'Fast converge — correct in ≤5 iterations', ro: 'Convergență rapidă — corect în ≤5 iterații' }, condition: (h) => h.feats?.includes?.('fast-converge') },
      { id: 'gap-spotter',   label: { en: 'Gap spotter — identified |λ₁/λ₂| within 0.15', ro: 'Detector de gap — identificat |λ₁/λ₂| cu eroare 0.15' }, condition: (h) => h.feats?.includes?.('gap-spotter') },
    ],
  },
```

- [ ] **Step 3: Verify build + smoke test**

Run: `npm run build`. Expected: pass.

Then `npm run dev` and navigate to `/#/y1s2/alo/practice`. Expected:
- Sidebar gains a new "Iterative & spectral" group containing W8.
- Click W8: matrix A renders, StepPlayer shows x₀ and λ converging, SVG plot appears and updates on scrub, numeric input accepts λ guess, Check produces correct/off feedback comparing to `truthLambda`, ring advances on correct.

- [ ] **Step 4: Commit**

```bash
git add src/content/alo/practice/widgetCatalog.js
git commit -m "feat(alo): register W8 power-method in widget catalog (Batch 3)"
```

---

## Phase 3 — W9 Iterative Solvers

### Task 10: Iterative solvers algorithm

**Files:**
- Create: `src/content/alo/linalg/iterativeSolvers.js`

- [ ] **Step 1: Write the algorithm**

Create `src/content/alo/linalg/iterativeSolvers.js`:

```js
/**
 * Runs Jacobi / Gauss-Seidel / SOR on Ax = b from x₀ = 0.
 *
 * Methods:
 *   jacobi       xᵢ,ₖ₊₁ = (bᵢ − Σⱼ≠ᵢ Aᵢⱼ xⱼ,ₖ)    / Aᵢᵢ
 *   gauss-seidel xᵢ,ₖ₊₁ = (bᵢ − Σⱼ<ᵢ Aᵢⱼ xⱼ,ₖ₊₁ − Σⱼ>ᵢ Aᵢⱼ xⱼ,ₖ) / Aᵢᵢ
 *   sor          xᵢ,ₖ₊₁ = (1−ω) xᵢ,ₖ + ω · (GS update)
 *
 * Emits Step[] with shape:
 *   { k, x, residualNorm, label: {en, ro} }
 *
 * @param {number[][]} A
 * @param {number[]}   b
 * @param {object} options
 * @param {'jacobi'|'gauss-seidel'|'sor'} options.method
 * @param {number} options.omega       SOR only (default 1.0 = GS)
 * @param {number} options.maxIter     default 40
 * @param {number} options.tol         default 1e-6  (‖rₖ‖₂ < tol)
 * @returns {{ steps, x, iterations, converged }}
 */
export function runIterativeSolvers(A, b, { method = 'jacobi', omega = 1.0, maxIter = 40, tol = 1e-6 } = {}) {
  const n = A.length;
  const x = new Array(n).fill(0);
  const steps = [];
  let iterations = 0;
  let converged = false;

  const residualNorm = () => {
    // r = b − A·x
    let sq = 0;
    for (let i = 0; i < n; i++) {
      let s = b[i];
      for (let j = 0; j < n; j++) s -= A[i][j] * x[j];
      sq += s * s;
    }
    return Math.sqrt(sq);
  };

  steps.push({
    k: 0, x: x.slice(), residualNorm: residualNorm(),
    label: { en: `Start x₀ = 0, method = ${method}${method === 'sor' ? `, ω = ${omega.toFixed(2)}` : ''}`,
             ro: `Pornim x₀ = 0, metoda = ${method}${method === 'sor' ? `, ω = ${omega.toFixed(2)}` : ''}` },
  });

  for (let k = 1; k <= maxIter; k++) {
    if (method === 'jacobi') {
      const xNew = x.slice();
      for (let i = 0; i < n; i++) {
        let s = b[i];
        for (let j = 0; j < n; j++) if (j !== i) s -= A[i][j] * x[j];
        xNew[i] = s / A[i][i];
      }
      for (let i = 0; i < n; i++) x[i] = xNew[i];
    } else if (method === 'gauss-seidel') {
      for (let i = 0; i < n; i++) {
        let s = b[i];
        for (let j = 0; j < n; j++) if (j !== i) s -= A[i][j] * x[j];
        x[i] = s / A[i][i];
      }
    } else { // sor
      for (let i = 0; i < n; i++) {
        let s = b[i];
        for (let j = 0; j < n; j++) if (j !== i) s -= A[i][j] * x[j];
        const gsUpdate = s / A[i][i];
        x[i] = (1 - omega) * x[i] + omega * gsUpdate;
      }
    }

    const rn = residualNorm();
    steps.push({
      k, x: x.slice(), residualNorm: rn,
      label: { en: `k=${k}: ‖rₖ‖ = ${rn.toExponential(3)}`, ro: `k=${k}: ‖rₖ‖ = ${rn.toExponential(3)}` },
    });
    iterations = k;
    if (rn < tol) { converged = true; break; }
    if (!Number.isFinite(rn)) break; // divergence
  }

  return { steps, x: x.slice(), iterations, converged };
}

/**
 * Jacobi iteration matrix spectral radius estimate for an optimal-ω guess.
 * Uses power iteration on the Jacobi iteration matrix for a quick approximation.
 * Returns the recommended ω in [1, 2) for SOR.
 */
export function optimalOmegaEstimate(A) {
  const n = A.length;
  const B = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) B[i][j] = -A[i][j] / A[i][i];
    }
  }
  // Power iteration on B
  let v = new Array(n).fill(1 / Math.sqrt(n));
  let rho = 0;
  for (let k = 0; k < 40; k++) {
    const next = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) next[i] += B[i][j] * v[j];
    const norm = Math.hypot(...next);
    if (norm < 1e-14) break;
    const vNew = next.map(c => c / norm);
    // Rayleigh
    let top = 0, bot = 0;
    for (let i = 0; i < n; i++) { top += vNew[i] * next[i]; bot += vNew[i] * vNew[i]; }
    rho = Math.abs(bot === 0 ? 0 : top / bot);
    v = vNew;
    if (rho > 1) break;
  }
  // Optimal ω for Jacobi-consistent-ordered: ω* = 2 / (1 + √(1 − ρ²))
  const r2 = Math.min(0.999, rho * rho);
  const omega = 2 / (1 + Math.sqrt(1 - r2));
  return Math.max(1.0, Math.min(1.95, omega));
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 3: Sanity check**

Add to `src/main.jsx` temporarily:
```js
import { runIterativeSolvers, optimalOmegaEstimate } from './content/alo/linalg/iterativeSolvers';
const A = [[4, 1, 0], [1, 4, 1], [0, 1, 4]];
const b = [5, 6, 5];
const j = runIterativeSolvers(A, b, { method: 'jacobi' });
const g = runIterativeSolvers(A, b, { method: 'gauss-seidel' });
const s = runIterativeSolvers(A, b, { method: 'sor', omega: optimalOmegaEstimate(A) });
console.log('Jacobi iter:', j.iterations, 'GS iter:', g.iterations, 'SOR iter:', s.iterations,
  'ω*:', optimalOmegaEstimate(A).toFixed(3));
```
Expected: Jacobi iterations > GS iterations ≥ SOR iterations. All converge. Remove the temporary code.

- [ ] **Step 4: Commit**

```bash
git add src/content/alo/linalg/iterativeSolvers.js src/main.jsx
git commit -m "feat(alo): iterative solvers (Jacobi/GS/SOR) + optimal ω estimate"
```

---

### Task 11: Iterative solvers instance generator

**Files:**
- Create: `src/content/alo/practice/instances/iterativeSolvers.js`

- [ ] **Step 1: Write the generator**

Create `src/content/alo/practice/instances/iterativeSolvers.js`:

```js
import { mulberry32, randInt } from '../../linalg/seedRandom';
import { optimalOmegaEstimate } from '../../linalg/iterativeSolvers';

/**
 * Generates strictly diagonally-dominant A (ensures convergence for all three methods)
 * plus a random b.
 *
 * difficulty:
 *   easy   — n=3, dominance margin ≥ 3
 *   medium — n=4, dominance margin ≥ 2
 *   hard   — n=5, dominance margin = 1
 *
 * @returns {{ matrix, b, n, optimalOmega }}
 */
export function generateIterativeSolversInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const n = difficulty === 'easy' ? 3 : (difficulty === 'hard' ? 5 : 4);
  const margin = difficulty === 'easy' ? 3 : (difficulty === 'hard' ? 1 : 2);

  const A = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    let rowAbsSum = 0;
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        A[i][j] = randInt(rand, -3, 3);
        rowAbsSum += Math.abs(A[i][j]);
      }
    }
    // Diagonal: at least rowAbsSum + margin in magnitude
    const sign = rand() < 0.5 ? -1 : 1;
    A[i][i] = sign * (rowAbsSum + margin + randInt(rand, 0, 2));
    if (A[i][i] === 0) A[i][i] = rowAbsSum + margin; // paranoia
  }

  const b = Array.from({ length: n }, () => randInt(rand, -5, 5));

  return { matrix: A, b, n, optimalOmega: optimalOmegaEstimate(A) };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/content/alo/practice/instances/iterativeSolvers.js
git commit -m "feat(alo): W9 iterative solvers instance generator (diag-dominant)"
```

---

### Task 12: Iterative solvers widget

**Files:**
- Create: `src/content/alo/practice/widgets/IterativeSolvers.jsx`

- [ ] **Step 1: Write the widget**

Create `src/content/alo/practice/widgets/IterativeSolvers.jsx`:

```jsx
import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { StepPlayer, MatrixDisplay } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { runIterativeSolvers } from '../../linalg/iterativeSolvers';

export default function IterativeSolvers({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [method, setMethod] = useState('jacobi');
  const [omega, setOmega] = useState(1.1);
  const [submitted, setSubmitted] = useState(false);
  const [fastestGuess, setFastestGuess] = useState(null); // 'jacobi' | 'gauss-seidel' | 'sor'
  const { submit } = useWidgetProgress('iterative-solvers', { pbLowerIsBetter: true });

  const jResult = useMemo(() => runIterativeSolvers(instance.matrix, instance.b, { method: 'jacobi' }), [instance]);
  const gResult = useMemo(() => runIterativeSolvers(instance.matrix, instance.b, { method: 'gauss-seidel' }), [instance]);
  const sResult = useMemo(() => runIterativeSolvers(instance.matrix, instance.b, { method: 'sor', omega }), [instance, omega]);

  const current =
    method === 'jacobi' ? jResult :
    method === 'gauss-seidel' ? gResult :
    sResult;

  const fastestActual = [['jacobi', jResult], ['gauss-seidel', gResult], ['sor', sResult]]
    .sort(([, a], [, b]) => a.iterations - b.iterations)[0][0];

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const feats = [];
    const predictedRight = fastestGuess && fastestGuess === fastestActual;
    if (predictedRight) feats.push('gs-beats-jacobi');
    if (Math.abs(omega - instance.optimalOmega) < 0.05) feats.push('omega-tuner');
    submit({
      correct: !!predictedRight,
      metric: current.iterations,
      feats,
    });
    onSubmit?.({
      correct: !!predictedRight,
      metric: current.iterations,
      feats,
    });
  };

  const onNext = () => {
    setSubmitted(false);
    setMethod('jacobi');
    setOmega(1.1);
    setFastestGuess(null);
    onGenerateInstance?.();
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded border text-sm"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
        <p className="font-medium mb-1">{t('Solve Ax = b:', 'Rezolvă Ax = b:')}</p>
        <div className="flex gap-4 flex-wrap">
          <div>
            <p className="text-xs opacity-70 mb-1">A</p>
            <MatrixDisplay value={instance.matrix} />
          </div>
          <div>
            <p className="text-xs opacity-70 mb-1">b</p>
            <MatrixDisplay value={instance.b.map(v => [v])} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {[
          { id: 'jacobi', label: 'Jacobi' },
          { id: 'gauss-seidel', label: 'Gauss–Seidel' },
          { id: 'sor', label: 'SOR' },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setMethod(opt.id)}
            className="px-3 py-1 rounded text-sm border"
            style={{
              borderColor: method === opt.id ? '#3b82f6' : 'var(--theme-border)',
              background: method === opt.id ? '#3b82f6' : 'transparent',
              color: method === opt.id ? '#fff' : 'var(--theme-content-text)',
            }}
          >{opt.label}</button>
        ))}
        {method === 'sor' && (
          <label className="text-sm flex items-center gap-2" style={{ color: 'var(--theme-content-text)' }}>
            ω = {omega.toFixed(2)}
            <input
              type="range" min={1} max={1.95} step={0.01}
              value={omega}
              onChange={(e) => setOmega(parseFloat(e.target.value))}
            />
          </label>
        )}
        <span className="text-xs opacity-70" style={{ color: 'var(--theme-content-text)' }}>
          {t('iterations:', 'iterații:')} {current.iterations}
          {current.converged ? '' : t(' (did not converge)', ' (nu a convers)')}
        </span>
      </div>

      <StepPlayer
        steps={current.steps}
        renderStep={(step) => (
          <div className="space-y-2">
            <p className="text-xs font-mono" style={{ color: 'var(--theme-content-text)' }}>
              x<sub>{step.k}</sub> = ({step.x.map(c => c.toFixed(4)).join(', ')})  ·  ‖rₖ‖ = {step.residualNorm.toExponential(2)}
            </p>
            <LogResidualPlot
              series={[
                { label: 'Jacobi', steps: jResult.steps, color: '#3b82f6', highlight: method === 'jacobi' },
                { label: 'GS',     steps: gResult.steps, color: '#f59e0b', highlight: method === 'gauss-seidel' },
                { label: 'SOR',    steps: sResult.steps, color: '#22c55e', highlight: method === 'sor' },
              ]}
              currentK={step.k}
            />
          </div>
        )}
        intervalMs={700}
      />

      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
          {t('Which method converges fastest?', 'Care metodă converge cel mai rapid?')}
        </span>
        {[
          { id: 'jacobi', label: 'Jacobi' },
          { id: 'gauss-seidel', label: 'GS' },
          { id: 'sor', label: 'SOR' },
        ].map(opt => (
          <button
            key={opt.id}
            disabled={submitted}
            onClick={() => setFastestGuess(opt.id)}
            aria-pressed={fastestGuess === opt.id}
            className="px-3 py-1 rounded text-sm border"
            style={{
              borderColor: fastestGuess === opt.id ? '#3b82f6' : 'var(--theme-border)',
              background: fastestGuess === opt.id ? '#3b82f6' : 'transparent',
              color: fastestGuess === opt.id ? '#fff' : 'var(--theme-content-text)',
            }}
          >{opt.label}</button>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        {!submitted ? (
          <button
            onClick={onCheck}
            disabled={!fastestGuess}
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
                  background: fastestGuess === fastestActual ? '#dcfce7' : '#fee2e2',
                  color: fastestGuess === fastestActual ? '#15803d' : '#b91c1c',
                }}>
            {fastestGuess === fastestActual
              ? t(`Correct — ω* ≈ ${instance.optimalOmega.toFixed(2)}, fastest = ${fastestActual}`, `Corect — ω* ≈ ${instance.optimalOmega.toFixed(2)}, cea mai rapidă = ${fastestActual}`)
              : t(`Off — fastest was ${fastestActual} (ω* ≈ ${instance.optimalOmega.toFixed(2)})`, `Greșit — cea mai rapidă a fost ${fastestActual} (ω* ≈ ${instance.optimalOmega.toFixed(2)})`)
            }
          </span>
        )}
      </div>
    </div>
  );
}

const LP_W = 360, LP_H = 160, LP_PAD = 30;

function LogResidualPlot({ series, currentK }) {
  // Each series: { label, steps, color, highlight }
  const allRs = series.flatMap(s => s.steps.map(st => st.residualNorm)).filter(v => v > 0 && Number.isFinite(v));
  if (allRs.length === 0) return null;
  const logMin = Math.log10(Math.min(...allRs));
  const logMax = Math.log10(Math.max(...allRs));
  const xMax = Math.max(...series.map(s => s.steps.length - 1), 1);

  const xs = (k) => LP_PAD + (k / xMax) * (LP_W - 2 * LP_PAD);
  const ys = (r) => {
    const lg = Math.log10(r > 0 ? r : 1e-16);
    return LP_H - LP_PAD - ((lg - logMin) / (logMax - logMin || 1)) * (LP_H - 2 * LP_PAD);
  };

  return (
    <svg width={LP_W} height={LP_H}
         style={{ background: 'var(--theme-content-bg-alt, #f8fafc)', border: '1px solid var(--theme-border)', borderRadius: 6 }}
         aria-label="log-scale residual plot">
      <line x1={LP_PAD} y1={LP_H - LP_PAD} x2={LP_W - LP_PAD} y2={LP_H - LP_PAD} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={LP_PAD} y1={LP_PAD} x2={LP_PAD} y2={LP_H - LP_PAD} stroke="#cbd5e1" strokeWidth={1} />
      {series.map((s, si) => {
        const pts = s.steps
          .filter(st => st.residualNorm > 0 && Number.isFinite(st.residualNorm))
          .map(st => `${xs(st.k)},${ys(st.residualNorm)}`)
          .join(' ');
        return (
          <polyline key={si} points={pts}
                    fill="none" stroke={s.color}
                    strokeWidth={s.highlight ? 2.5 : 1}
                    opacity={s.highlight ? 1 : 0.45} />
        );
      })}
      {series.map((s, si) => {
        const st = s.steps[currentK];
        if (!st || !(st.residualNorm > 0)) return null;
        return s.highlight ? <circle key={si} cx={xs(st.k)} cy={ys(st.residualNorm)} r={4} fill={s.color} /> : null;
      })}
      <text x={LP_PAD + 4} y={LP_PAD - 6} fontSize={10} fill="#64748b">log‖rₖ‖</text>
      <text x={LP_W - LP_PAD - 10} y={LP_H - LP_PAD + 14} fontSize={10} fill="#64748b">k</text>
      {/* Legend */}
      {series.map((s, si) => (
        <g key={`legend-${si}`} transform={`translate(${LP_PAD + 10 + si * 70}, ${LP_PAD + 6})`}>
          <line x1={0} y1={0} x2={12} y2={0} stroke={s.color} strokeWidth={2} />
          <text x={16} y={3} fontSize={10} fill="#64748b">{s.label}</text>
        </g>
      ))}
    </svg>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/content/alo/practice/widgets/IterativeSolvers.jsx
git commit -m "feat(alo): W9 iterative solvers widget (method toggle + ω slider + log plot)"
```

---

### Task 13: Register W9 in catalog

**Files:**
- Modify: `src/content/alo/practice/widgetCatalog.js`

- [ ] **Step 1: Add the import line**

After the `import { generatePowerMethodInstance } from './instances/powerMethod';` line, add:

```js
import { generateIterativeSolversInstance } from './instances/iterativeSolvers';
```

- [ ] **Step 2: Append the W9 entry**

After the W8 (`power-method`) entry, before the closing `]`, add:

```js
  {
    id: 'iterative-solvers',
    title: { en: 'W9 · Iterative Solvers', ro: 'W9 · Rezolvatori iterativi' },
    courseRef: 'alo-c7',
    groupId: 'iterative-spectral',
    mode: 'tool-with-qa',
    Component: lazy(() => import('./widgets/IterativeSolvers')),
    generateInstance: generateIterativeSolversInstance,
    pbMetric: { id: 'iterations', label: { en: 'Iterations (chosen method)', ro: 'Iterații (metoda aleasă)' }, lowerIsBetter: true },
    feats: [
      { id: 'omega-tuner',       label: { en: 'Omega tuner — within 0.05 of ω*', ro: 'Reglaj ω — în limita 0.05 de ω*' }, condition: (h) => h.feats?.includes?.('omega-tuner') },
      { id: 'gs-beats-jacobi',   label: { en: 'Predicted fastest method correctly', ro: 'Metoda cea mai rapidă prezisă corect' }, condition: (h) => h.feats?.includes?.('gs-beats-jacobi') },
    ],
  },
```

- [ ] **Step 3: Verify build + smoke test**

Run: `npm run build`. Expected: pass.

Then `npm run dev` and navigate to `/#/y1s2/alo/practice`. Expected:
- Sidebar's "Iterative & spectral" group now contains W8 and W9.
- Click W9: matrix A + vector b render, method toggle switches between Jacobi/GS/SOR, ω slider appears only for SOR, log residual plot shows all three curves with the active one highlighted, fastest-method prediction Yes/No/SOR buttons, Check button disabled until a guess is picked, correct/off feedback references `ω*` and `fastestActual`.

- [ ] **Step 4: Commit**

```bash
git add src/content/alo/practice/widgetCatalog.js
git commit -m "feat(alo): register W9 iterative-solvers in widget catalog (Batch 3)"
```

---

## Phase 4 — Batch 3 Review Gate

### Task 14: Cold review + fix loop + memory update

- [ ] **Step 1: Run validation commands**

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide"
npm run build
npm run lint
```
Expected: build passes; lint adds no NEW errors above the Plan 2 baseline (pre-existing v86 / proxy / SubjectPage warnings stay).

- [ ] **Step 2: Dispatch a batch-review subagent**

Dispatch via Agent tool, `general-purpose`, model `sonnet`, with this prompt:

> Cold review of ALO Practice tab Batch 3 (widgets W6 Householder QR, W8 Power Method, W9 Iterative Solvers).
> Plan: `docs/superpowers/plans/2026-04-17-alo-practice-plan-3-batch3.md`.
> Spec: `docs/superpowers/specs/2026-04-17-alo-practice-redesign-design.md` §5 W6/W8/W9.
>
> Run `npm run dev` in background; use Puppeteer to load `http://localhost:5173/#/y1s2/alo/practice`. Take screenshots at 1280×720 to `/tmp/alo-batch3-desktop.png` and 375×720 to `/tmp/alo-batch3-mobile.png`. Confirm sidebar has 9 entries across 4 groups (Foundations: W1, W2; Linear systems: W3, W4; Factorizations: W7, W5, W6; Iterative & spectral: W8, W9). Click each of the 3 new widgets. For each: confirm the StepPlayer renders without crashing, ≥3 steps appear, no console errors, ring advances after Mark-as-reviewed / Check.
>
> Specifically:
> - W6 Householder: for n=3 instances, confirm a 3D Canvas renders (`<canvas>` element present inside the widget) with visible arrows; for n=4 instances, confirm the scene is skipped and matrices render. Confirm ‖QR − A‖∞ feedback. No WebGL errors in console.
> - W8 Power Method: StepPlayer increments k, SVG convergence plot appears and current k highlighted with a green dot. Numeric λ input accepts values. Check compares to `truthLambda` with tolerance 0.05. Optional gap input works.
> - W9 Iterative Solvers: method toggle swaps between Jacobi/GS/SOR. ω slider appears only when SOR is active. Log residual plot shows three curves and highlights the active one. Fastest-method guess is required to enable Check. Correct/off feedback references `ω*`.
>
> Bundle check: confirm `dist/assets/` contains a Householder chunk with R3F symbols (look for a chunk containing `three` or `react-three`), and that the main chunk size (largest `index-*.js`) has NOT grown by more than ~30 kB gz vs the previous Plan 2 baseline. R3F must not be in the main chunk.
>
> Inspect localStorage keys `alo.practice.householder-qr`, `alo.practice.power-method`, `alo.practice.iterative-solvers` after solving each — shape must match Plan 1's spec (attempts, correct, bestMetric, lastSolveAt, feats, todayCount, todayDate).
>
> Report SEVERITY-TAGGED bugs: CRITICAL / MAJOR / MINOR / NIT. Recommendation: READY TO SHIP BATCH 3, or FIXES NEEDED. Under 700 words.
>
> Do NOT fix anything yourself.

- [ ] **Step 3: Triage and fix**

For any CRITICAL or MAJOR issue, dispatch a fix-up subagent with explicit before/after code snippets. Re-verify by re-running build + a focused puppeteer check on the affected widget. MINOR issues: fix if <5 minutes; NIT: defer.

- [ ] **Step 4: Push final state**

```bash
git push
```

- [ ] **Step 5: Update memory**

Open `C:/Users/User/.claude/projects/C--Users-User-Desktop-SO-os-study-guide/memory/project_alo_practice_redesign.md` and:

1. Update the front-matter `description:` line from `2 of 5 plans shipped` to `3 of 5 plans shipped`.
2. Update the status line (currently `## Status: 2 of 5 plans shipped (2026-04-17). 6 of 10 widgets live.`) to reflect 9 of 10 live.
3. Tick W6, W8, W9 rows in the widget catalog table from `pending` to `✅ shipped`.
4. Add a new lesson to "Critical lessons from review gates" if R3F integration revealed anything subtle (otherwise leave the section as-is).
5. Append a new plan link under "Authoritative documents": `- **Plan 3** (shipped): docs/superpowers/plans/2026-04-17-alo-practice-plan-3-batch3.md`.
6. Update the commit-range line (`base aa03089 through HEAD 1a0e077`) to reflect the new HEAD sha after push.

Also update the `MEMORY.md` index entry for "ALO Practice Plans 1–2 shipped" → "ALO Practice Plans 1–3 shipped", and refresh the one-line hook to mention 9/10 widgets + R3F integration.

- [ ] **Step 6: Signal readiness for Plan 4 or Plan 5**

At this point Plan 3 is complete. Ask the user whether to author Plan 4 (seminar tab migration — pure content migration of existing Seminar01..Seminar06 JSX into JSON-backed shell problems) or Plan 5 (optional W10 Condition Number Playground — exploration widget, no gameplay).

---

## Self-Review Checklist

**1. Spec coverage** (Plan-3-relevant spec sections → task mapping):

- §5 W6 Householder: Tasks 2 (algorithm), 3 (instance), 4 (widget + R3F scene), 5 (catalog). 3D viz per spec §7. Mode `exercise`. Feats `single-shot`, `orthogonal`. PB = `residual`. ✓
- §5 W8 Power Method: Tasks 6, 7, 8, 9. Mode `tool-with-qa` with numeric λ input. Feats `fast-converge`, `gap-spotter`. PB = iterations. ✓
- §5 W9 Iterative Solvers: Tasks 10, 11, 12, 13. Mode `tool-with-qa` with method toggle + ω slider. Feats `omega-tuner`, `gs-beats-jacobi`. PB = iterations. ✓
- §3 Progress state machine — uses `useWidgetProgress` in Tasks 4, 8, 12 unchanged. ✓
- §4 Widget data contract — each widget calls `submit({correct, metric, feats})`. ✓
- §7 Tech stack — `three` + `@react-three/fiber` + `@react-three/drei` added (Task 1), used only in Task 4's HouseholderScene.jsx (not W7's GS, per revised scope — W7 is 2D-only and already shipped in Plan 2). `ml-matrix` used by Task 7 for eigenvalue verification. ✓
- §8 Animation snapshot+scrub — each algorithm (Tasks 2, 6, 10) emits `Step[]` consumed by `StepPlayer`. Custom `renderStep` per widget. ✓
- §10 Bilingual + theming — all user-facing strings via `t(en, ro)`; all colors via `var(--theme-*)` except accent blue `#3b82f6` and fixed arrow colors inside the R3F scene (convention). ✓
- §11 Bundle strategy — every new widget is `lazy(() => import(...))` in the catalog (Tasks 5, 9, 13). `HouseholderScene` is `lazy` inside `HouseholderQr.jsx` with `<Suspense fallback>`. R3F chunk only loads when W6 opens AND the instance is n=3. ✓
- §12 Accessibility — `aria-label` on SVG plots and R3F canvas wrapper, `aria-pressed` on toggle buttons, all controls keyboard-reachable. ✓

No spec gaps for Batch 3 widgets.

**2. Placeholder scan:** No TBD / TODO / "implement later" / "similar to Task N" / bare prose describing code. All code blocks are complete and self-contained.

**3. Type consistency:**

- `runHouseholderQr` returns `{ steps, Q, R, reflections }` — Task 4 widget destructures all four. ✓
- `runPowerMethod` returns `{ steps, lambda, iterations, converged, finalX }` — Task 8 destructures `steps`, `lambda` (aliased `computedLambda`), `iterations`, `converged`. `finalX` unused (fine). ✓
- `runIterativeSolvers` returns `{ steps, x, iterations, converged }` — Task 12 destructures as `current = {steps, iterations, converged}` per method (`x` unused). ✓
- `optimalOmegaEstimate(A)` → number; used in Task 11 instance generator and Task 12 widget for `instance.optimalOmega`. Consistent. ✓
- `submit({correct, metric, feats})` contract matches `useWidgetProgress` from Plan 1. ✓
- Catalog entries use the same `WidgetSpec` shape as Plans 1 & 2. ✓
- Feat IDs in catalog match feat strings pushed by widgets:
  - W6: `single-shot`, `orthogonal` ↔ widget pushes both via `feats.push(...)`. ✓
  - W8: `fast-converge`, `gap-spotter` ↔ widget matches. ✓
  - W9: `omega-tuner`, `gs-beats-jacobi` ↔ widget matches. ✓
- Step shape per algorithm is self-contained; each widget's `renderStep` handles only its own algorithm's step fields.

No type drift detected.

---

**Plan complete.** Saved to `docs/superpowers/plans/2026-04-17-alo-practice-plan-3-batch3.md`.
