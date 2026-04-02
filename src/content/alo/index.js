import { lazy } from 'react';

const alo = {
  slug: 'alo',
  yearSemester: 'y1s2',
  title: { en: 'Linear Algebra & Optimization', ro: 'Algebră Liniară și Optimizare' },
  shortTitle: { en: 'ALO', ro: 'ALO' },
  description: {
    en: 'Linear algebra, matrix theory, optimization methods',
    ro: 'Algebră liniară, teoria matricelor, metode de optimizare',
  },
  icon: '\uD83D\uDCD0',
  courses: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default alo;
