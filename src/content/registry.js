import os from './os/index.js';
import probStat from './prob-stat/index.js';
import alo from './alo/index.js';

export const subjects = [os, probStat, alo];

export const yearSemesters = [
  {
    id: 'y1s2',
    title: { en: 'Year 1, Semester 2', ro: 'Anul 1, Semestrul 2' },
    subjects: ['os', 'prob-stat', 'alo'],
  },
];

export function getSubject(slug) {
  return subjects.find(s => s.slug === slug);
}

export function getYearSemester(id) {
  return yearSemesters.find(ys => ys.id === id);
}
