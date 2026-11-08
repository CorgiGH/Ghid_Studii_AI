import { lazy } from 'react';

// Courses are appended one line per lesson, in lesson order, in BD's one-line shape
// (scripts/smoke-test.mjs counts them with a regex).
const nn = {
  slug: 'nn',
  yearSemester: 'y2s1',
  player: 'lesson',
  title: { en: 'Rețele neuronale', ro: 'Rețele neuronale' },
  shortTitle: { en: 'RN', ro: 'RN' },
  description: {
    en: 'Neural networks: homework and lab crash packs',
    ro: 'Rețele neuronale: pachete de urgență pentru teme și laborator',
  },
  icon: '🔗',
  courses: [
  ],
  seminars: [],
  labs: [],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default nn;
