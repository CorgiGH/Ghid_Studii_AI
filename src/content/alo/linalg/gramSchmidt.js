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

  const u = [];
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
