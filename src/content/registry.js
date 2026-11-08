import os from './os/index.js';
import probStat from './prob-stat/index.js';
import alo from './alo/index.js';
import pa from './pa/index.js';
import oop from './oop/index.js';
import bd from './bd/index.js';
import ml from './ml/index.js';
import ag from './ag/index.js';
import ia from './ia/index.js';
import nn from './nn/index.js';

export const subjects = [os, probStat, alo, pa, oop, bd, ml, ag, ia, nn];

export const yearSemesters = [
  {
    id: 'y1s2',
    title: { en: 'Year 1, Semester 2', ro: 'Anul 1, Semestrul 2' },
    subjects: ['os', 'prob-stat', 'alo', 'pa', 'oop'],
  },
  {
    id: 'y2s1',
    title: { en: 'Year 2, Semester 1', ro: 'Anul 2, Semestrul 1' },
    subjects: ['bd', 'ml', 'ag', 'ia', 'nn'],
  },
];

export function getSubject(slug) {
  return subjects.find(s => s.slug === slug);
}

export function getYearSemester(id) {
  return yearSemesters.find(ys => ys.id === id);
}
