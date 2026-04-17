import { lazy } from 'react';
import { generateMatrixInputInstance } from './instances/matrixInput';
import { generateNormVisualizerInstance } from './instances/normVisualizer';
import { generateGaussElimInstance } from './instances/gaussElim';
import { generateLuDecompInstance } from './instances/luDecomp';

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
