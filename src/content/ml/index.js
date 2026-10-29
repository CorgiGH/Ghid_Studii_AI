import { lazy } from 'react';

// Courses are appended one line per lesson, in lesson order, in BD's one-line shape
// (scripts/smoke-test.mjs counts them with a regex).
const ml = {
  slug: 'ml',
  yearSemester: 'y2s1',
  player: 'lesson',
  title: { en: 'Machine learning', ro: 'Învățare automată' },
  shortTitle: { en: 'ML', ro: 'ML' },
  description: {
    en: 'Probability, entropy, decision trees (ID3) and Bayesian classifiers, weeks 1–5',
    ro: 'Probabilități, entropie, arbori de decizie (ID3) și clasificatori bayesieni, săptămânile 1–5',
  },
  icon: '🤖',
  courses: [
    { id: "ml-l01", title: {"en":"Lesson 1: Probability, conditional probability, the multiplication rule","ro":"Lecția 1: Probabilitate, probabilitate condiționată, regula de înmulțire"}, shortTitle: {"en":"L1: Probability","ro":"L1: Probabilitate"}, sectionCount: 27, metaId: "ml-l01", src: "ml/courses/lesson-01.json" },
  ],
  seminars: [],
  labs: [],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default ml;
