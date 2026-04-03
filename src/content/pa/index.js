import { lazy } from 'react';

const pa = {
  slug: 'pa',
  yearSemester: 'y1s2',
  title: { en: 'Algorithm Design', ro: 'Proiectarea Algoritmilor' },
  shortTitle: { en: 'PA', ro: 'PA' },
  description: {
    en: 'Computational problems, algorithm analysis, nondeterministic & probabilistic algorithms, string matching (KMP, Boyer-Moore, Rabin-Karp)',
    ro: 'Probleme computaționale, analiza algoritmilor, algoritmi nedeterministici și probabilistici, potrivirea șirurilor (KMP, Boyer-Moore, Rabin-Karp)',
  },
  icon: '\u2699\uFE0F',
  courses: [
    { id: 'pa-c1', title: { en: 'Lecture 1: Computational Problems', ro: 'Cursul 1: Probleme computaționale' }, shortTitle: { en: 'L1: Comp. Problems', ro: 'C1: Probleme comp.' }, component: lazy(() => import('./courses/Course01.jsx')) },
  ],
  seminars: [],
  labs: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default pa;
