import { lazy } from 'react';

const probStat = {
  slug: 'prob-stat',
  yearSemester: 'y1s2',
  title: { en: 'Probabilities & Statistics', ro: 'Probabilități și Statistică' },
  shortTitle: { en: 'Prob & Stat', ro: 'Prob & Stat' },
  description: {
    en: 'Probability theory, distributions, statistical inference',
    ro: 'Teoria probabilităților, distribuții, inferență statistică',
  },
  icon: '\uD83D\uDCCA',
  courses: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default probStat;
