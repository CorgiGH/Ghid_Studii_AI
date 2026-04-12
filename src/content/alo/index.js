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
  courses: [
    { id: 'alo-c1', src: 'alo/courses/course-01.json', metaId: 'alo-c1',
      title: { en: 'Course 1: Introduction & Motivating Examples', ro: 'Cursul 1: Introducere și exemple motivante' },
      shortTitle: { en: 'C1: Intro', ro: 'C1: Intro' },
      sectionCount: 4 },
  ],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default alo;
