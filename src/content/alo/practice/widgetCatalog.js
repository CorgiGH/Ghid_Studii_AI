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
