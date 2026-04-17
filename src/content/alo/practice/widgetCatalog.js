import { lazy } from 'react';
import { generateMatrixInputInstance } from './instances/matrixInput';

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
