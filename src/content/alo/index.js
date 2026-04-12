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
      sectionCount: 7 },
    { id: 'alo-c2', src: 'alo/courses/course-02.json', metaId: 'alo-c2',
      title: { en: 'Course 2: Inner products, norms, and a short history of linear systems', ro: 'Cursul 2: Produse scalare, norme și o scurtă istorie a sistemelor liniare' },
      shortTitle: { en: 'C2: Norms', ro: 'C2: Norme' },
      sectionCount: 11 },
  ],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default alo;
