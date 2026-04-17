import { lazy } from 'react';
import { generateMatrixInputInstance } from './instances/matrixInput';
import { generateNormVisualizerInstance } from './instances/normVisualizer';
import { generateGaussElimInstance } from './instances/gaussElim';
import { generateLuDecompInstance } from './instances/luDecomp';
import { generateGramSchmidtInstance } from './instances/gramSchmidt';
import { generateGivensQrInstance } from './instances/givensQr';
import { generateHouseholderQrInstance } from './instances/householderQr';
import { generatePowerMethodInstance } from './instances/powerMethod';
import { generateIterativeSolversInstance } from './instances/iterativeSolvers';
import { generateConditionNumberInstance } from './instances/conditionNumber';

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
