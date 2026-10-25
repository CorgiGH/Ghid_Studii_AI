import { lazy } from 'react';

const bd = {
  slug: 'bd',
  yearSemester: 'y2s1',
  player: 'lesson',
  title: { en: 'Databases', ro: 'Baze de date' },
  shortTitle: { en: 'DB', ro: 'BD' },
  description: {
    en: 'SQL on Oracle 11g: querying, joins, grouping, subqueries, creating and changing tables',
    ro: 'SQL pe Oracle 11g: interogări, joncțiuni, grupare, subinterogări, crearea și modificarea tabelelor',
  },
  icon: '🗄️',
  courses: [
    { id: 'bd-l01', title: { en: 'Lesson 1: First queries', ro: 'Lecția 1: Primele interogări' }, shortTitle: { en: 'L1: First queries', ro: 'L1: Primele interogări' }, sectionCount: 3, metaId: 'bd-l01', src: 'bd/courses/lesson-01.json' },
  ],
  seminars: [],
  labs: [],
  tests: [
    {
      id: 'bd-mock-l1',
      src: 'bd/tests/mock-l1.json',
      title: { en: 'Mock test: lesson 1 level', ro: 'Test de probă: nivelul Lecției 1' },
      shortTitle: { en: 'Mock test L1', ro: 'Test de probă L1' },
    },
  ],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default bd;
