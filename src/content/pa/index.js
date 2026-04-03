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
    { id: 'pa-c2', title: { en: 'Lecture 2: Algorithm Efficiency Analysis', ro: 'Cursul 2: Analiza eficienței algoritmilor' }, shortTitle: { en: 'L2: Analysis', ro: 'C2: Analiză' }, component: lazy(() => import('./courses/Course02.jsx')) },
    { id: 'pa-c3', title: { en: 'Lecture 3: Nondeterministic & Probabilistic Algorithms', ro: 'Cursul 3: Algoritmi nedeterministici și probabilistici' }, shortTitle: { en: 'L3: Nondet/Prob', ro: 'C3: Nedet/Prob' }, component: lazy(() => import('./courses/Course03.jsx')) },
    { id: 'pa-c4', title: { en: 'Lecture 4: Probabilistic Analysis', ro: 'Cursul 4: Analiză probabilistică' }, shortTitle: { en: 'L4: Prob. Analysis', ro: 'C4: Analiză prob.' }, component: lazy(() => import('./courses/Course04.jsx')) },
    { id: 'pa-c5', title: { en: 'Lecture 5a: KMP Algorithm', ro: 'Cursul 5a: Algoritmul KMP' }, shortTitle: { en: 'L5a: KMP', ro: 'C5a: KMP' }, component: lazy(() => import('./courses/Course05.jsx')) },
    { id: 'pa-c6', title: { en: 'Lecture 5b: Boyer-Moore & Rabin-Karp', ro: 'Cursul 5b: Boyer-Moore și Rabin-Karp' }, shortTitle: { en: 'L5b: BM/RK', ro: 'C5b: BM/RK' }, component: lazy(() => import('./courses/Course06.jsx')) },
  ],
  seminars: [
    { id: 'pa-s1', title: { en: 'Week 1: Computational Problems', ro: 'Săptămâna 1: Probleme computaționale' }, shortTitle: { en: 'W1: Comp. Problems', ro: 'S1: Probleme comp.' }, component: lazy(() => import('./seminars/Seminar01.jsx')) },
    { id: 'pa-s2', title: { en: 'Week 2: Algorithm Efficiency Analysis', ro: 'Săptămâna 2: Analiza eficienței algoritmilor' }, shortTitle: { en: 'W2: Analysis', ro: 'S2: Analiză' }, component: lazy(() => import('./seminars/Seminar02.jsx')) },
    { id: 'pa-s3', title: { en: 'Week 3: Nondeterministic & Probabilistic Algorithms', ro: 'Săptămâna 3: Algoritmi nedeterminiști și probabiliști' }, shortTitle: { en: 'W3: Nondet/Prob', ro: 'S3: Nedet/Prob' }, component: lazy(() => import('./seminars/Seminar03.jsx')) },
    { id: 'pa-s4', title: { en: 'Week 4: Probabilistic Algorithms — Average Complexity (Cont.)', ro: 'Săptămâna 4: Algoritmi probabiliști — Complexitatea medie (cont.)' }, shortTitle: { en: 'W4: Avg. Complexity', ro: 'S4: Complex. medie' }, component: lazy(() => import('./seminars/Seminar04.jsx')) },
    { id: 'pa-s5', title: { en: 'Week 5: String Searching', ro: 'Săptămâna 5: Căutarea peste șiruri' }, shortTitle: { en: 'W5: Strings', ro: 'S5: Șiruri' }, component: lazy(() => import('./seminars/Seminar05.jsx')) },
  ],
  labs: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default pa;
