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
