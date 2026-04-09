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
    {
      id: 'pa-c1',
      title: { en: 'Course 1: Computational Problems', ro: 'Cursul 1: Probleme computaționale' },
      shortTitle: { en: 'C1: Comp. Problems', ro: 'C1: Probleme comp.' },
      sectionCount: 10,
      metaId: 'pa-c1',
      src: 'pa/courses/course-01.json'
    },
    { id: 'pa-c2', title: { en: 'Course 2: Algorithm Efficiency Analysis', ro: 'Cursul 2: Analiza eficienței algoritmilor' }, shortTitle: { en: 'C2: Efficiency Analysis', ro: 'C2: Analiza eficienței' }, sectionCount: 13, metaId: 'pa-c2', src: 'pa/courses/course-02.json' },
    { id: 'pa-c3', title: { en: 'Course 3: Nondeterministic & Probabilistic Algorithms', ro: 'Cursul 3: Algoritmi nedeterministici și probabilistici' }, shortTitle: { en: 'C3: Nondet/Prob', ro: 'C3: Nedet/Prob' }, sectionCount: 13, metaId: 'pa-c3', src: 'pa/courses/course-03.json' },
    { id: 'pa-c4', title: { en: 'Course 4: Probabilistic Analysis', ro: 'Cursul 4: Analiză probabilistică' }, shortTitle: { en: 'C4: Prob. Analysis', ro: 'C4: Analiză prob.' }, sectionCount: 6, metaId: 'pa-c4', src: 'pa/courses/course-04.json' },
    { id: 'pa-c5', title: { en: 'Course 5: KMP Algorithm', ro: 'Cursul 5: Algoritmul KMP' }, shortTitle: { en: 'C5: KMP', ro: 'C5: KMP' }, sectionCount: 5, metaId: 'pa-c5', src: 'pa/courses/course-05.json' },
    { id: 'pa-c6', title: { en: 'Course 6: Boyer-Moore & Rabin-Karp', ro: 'Cursul 6: Boyer-Moore și Rabin-Karp' }, shortTitle: { en: 'C6: BM/RK', ro: 'C6: BM/RK' }, sectionCount: 6, metaId: 'pa-c6', src: 'pa/courses/course-06.json' },
  ],
  seminars: [
    { id: 'pa-s1', title: { en: 'Week 1: Computational Problems', ro: 'Săptămâna 1: Probleme computaționale' }, shortTitle: { en: 'W1: Comp. Problems', ro: 'S1: Probleme comp.' }, component: lazy(() => import('./seminars/Seminar01.jsx')) },
    { id: 'pa-s2', title: { en: 'Week 2: Algorithm Efficiency Analysis', ro: 'Săptămâna 2: Analiza eficienței algoritmilor' }, shortTitle: { en: 'W2: Analysis', ro: 'S2: Analiză' }, component: lazy(() => import('./seminars/Seminar02.jsx')) },
    { id: 'pa-s3', title: { en: 'Week 3: Nondeterministic & Probabilistic Algorithms', ro: 'Săptămâna 3: Algoritmi nedeterminiști și probabiliști' }, shortTitle: { en: 'W3: Nondet/Prob', ro: 'S3: Nedet/Prob' }, component: lazy(() => import('./seminars/Seminar03.jsx')) },
    { id: 'pa-s4', title: { en: 'Week 4: Probabilistic Algorithms — Average Complexity (Cont.)', ro: 'Săptămâna 4: Algoritmi probabiliști — Complexitatea medie (cont.)' }, shortTitle: { en: 'W4: Avg. Complexity', ro: 'S4: Complex. medie' }, component: lazy(() => import('./seminars/Seminar04.jsx')) },
    { id: 'pa-s5', title: { en: 'Week 5: String Searching', ro: 'Săptămâna 5: Căutarea peste șiruri' }, shortTitle: { en: 'W5: Strings', ro: 'S5: Șiruri' }, component: lazy(() => import('./seminars/Seminar05.jsx')) },
    { id: 'pa-s6', title: { en: 'Week 6: String Searching (Cont.)', ro: 'Săptămâna 6: Căutarea peste șiruri (cont.)' }, shortTitle: { en: 'W6: Strings II', ro: 'S6: Șiruri II' }, component: lazy(() => import('./seminars/Seminar06.jsx')) },
  ],
  labs: [],
  tests: [
    // Midterms (Partials)
    { id: 'partial-2025-a', group: 'partial', title: { en: 'Partial 2025 — Variant A', ro: 'Partial 2025 — Varianta A' }, shortTitle: { en: '2025 A', ro: '2025 A' }, src: 'pa/tests/partial-2025-a.json' },
    { id: 'partial-2025-b', group: 'partial', title: { en: 'Partial 2025 — Variant B', ro: 'Partial 2025 — Varianta B' }, shortTitle: { en: '2025 B', ro: '2025 B' }, src: 'pa/tests/partial-2025-b.json' },
    { id: 'partial-2022-a', group: 'partial', title: { en: 'Partial 2022 — Variant A', ro: 'Partial 2022 — Varianta A' }, shortTitle: { en: '2022 A', ro: '2022 A' }, src: 'pa/tests/partial-2022-a.json' },
    { id: 'partial-2022-b', group: 'partial', title: { en: 'Partial 2022 — Variant B', ro: 'Partial 2022 — Varianta B' }, shortTitle: { en: '2022 B', ro: '2022 B' }, src: 'pa/tests/partial-2022-b.json' },
    { id: 'partial-2022-ex', group: 'partial', title: { en: 'Week 8 Test — Example', ro: 'Test Săpt. 8 — Exemplu' }, shortTitle: { en: 'W8 Ex', ro: 'S8 Ex' }, src: 'pa/tests/partial-2022-ex.json' },
    { id: 'partial-2022-i', group: 'partial', title: { en: 'Week 8 — Series I (Cubes)', ro: 'Test Săpt. 8 — Seria I (Cuburi)' }, shortTitle: { en: 'W8 S1', ro: 'S8 S1' }, src: 'pa/tests/partial-2022-i.json' },
    { id: 'partial-2022-ii', group: 'partial', title: { en: 'Week 8 — Series II (Odd Cubes)', ro: 'Test Săpt. 8 — Seria II (Cuburi impare)' }, shortTitle: { en: 'W8 S2', ro: 'S8 S2' }, src: 'pa/tests/partial-2022-ii.json' },
    { id: 'partial-2019-a', group: 'partial', title: { en: 'Partial 2019 — Variant A', ro: 'Partial 2019 — Varianta A' }, shortTitle: { en: '2019 A', ro: '2019 A' }, src: 'pa/tests/partial-2019-a.json' },
    { id: 'partial-2019-b', group: 'partial', title: { en: 'Partial 2019 — Variant B', ro: 'Partial 2019 — Varianta B' }, shortTitle: { en: '2019 B', ro: '2019 B' }, src: 'pa/tests/partial-2019-b.json' },
    { id: 'partial-2017-a', group: 'partial', title: { en: 'Partial 2017 — Variant A', ro: 'Partial 2017 — Varianta A' }, shortTitle: { en: '2017 A', ro: '2017 A' }, src: 'pa/tests/partial-2017-a.json' },
    { id: 'partial-2017-b', group: 'partial', title: { en: 'Partial 2017 — Variant B', ro: 'Partial 2017 — Varianta B' }, shortTitle: { en: '2017 B', ro: '2017 B' }, src: 'pa/tests/partial-2017-b.json' },
    { id: 'partial-2016-a', group: 'partial', title: { en: 'Partial 2016 — Variant A', ro: 'Partial 2016 — Varianta A' }, shortTitle: { en: '2016 A', ro: '2016 A' }, src: 'pa/tests/partial-2016-a.json' },
    { id: 'partial-2015-a', group: 'partial', title: { en: 'Partial 2015 — Variant A', ro: 'Partial 2015 — Varianta A' }, shortTitle: { en: '2015 A', ro: '2015 A' }, src: 'pa/tests/partial-2015-a.json' },
    // Finals
    { id: 'exam-2014-a', group: 'exam', title: { en: 'Exam 2014 — Variant A (BM)', ro: 'Examen 2014 — Varianta A (BM)' }, shortTitle: { en: 'Exam A', ro: 'Ex. A' }, src: 'pa/tests/exam-2014-a.json' },
    { id: 'exam-2014-b', group: 'exam', title: { en: 'Exam 2014 — Variant B (Regex + DP)', ro: 'Examen 2014 — Varianta B (Regex + PD)' }, shortTitle: { en: 'Exam B', ro: 'Ex. B' }, src: 'pa/tests/exam-2014-b.json' },
    { id: 'exam-2014-c', group: 'exam', title: { en: 'Exam 2014 — Variant A\' (Voronoi)', ro: 'Examen 2014 — Varianta A\' (Voronoi)' }, shortTitle: { en: 'Exam A\'', ro: 'Ex. A\'' }, src: 'pa/tests/exam-2014-c.json' },
  ],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default pa;
