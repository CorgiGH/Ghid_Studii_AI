import { lazy } from 'react';

const pa = {
  slug: 'pa',
  yearSemester: 'y1s2',
  title: { en: 'Algorithm Design', ro: 'Proiectarea Algoritmilor' },
  shortTitle: { en: 'PA', ro: 'PA' },
  description: {
    en: 'Algorithm design techniques, complexity analysis, classic algorithms',
    ro: 'Tehnici de proiectare a algoritmilor, analiza complexității, algoritmi clasici',
  },
  icon: '\u2699\uFE0F',
  courses: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default pa;
