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
    { id: "ml-l02", title: {"en":"Lesson 2: Total probability and Bayes' formula","ro":"Lecția 2: Probabilitatea totală și formula lui Bayes"}, shortTitle: {"en":"L2: Total and Bayes","ro":"L2: Totală și Bayes"}, sectionCount: 19, metaId: "ml-l02", src: "ml/courses/lesson-02.json" },
    { id: "ml-l03", title: {"en":"Lesson 3: Independence of events and conditional independence","ro":"Lecția 3: Independența evenimentelor și independența condiționată"}, shortTitle: {"en":"L3: Independence","ro":"L3: Independența"}, sectionCount: 26, metaId: "ml-l03", src: "ml/courses/lesson-03.json" },
    { id: "ml-l04", title: {"en":"Lesson 4: Discrete random variables: distribution, mean, variance; Bernoulli and binomial","ro":"Lecția 4: Variabile aleatoare discrete: distribuție, medie, varianță; Bernoulli și binomială"}, shortTitle: {"en":"L4: Random variables","ro":"L4: Variabile aleatoare"}, sectionCount: 30, metaId: "ml-l04", src: "ml/courses/lesson-04.json" },
    { id: "ml-l05", title: {"en":"Lesson 5: Joint, marginal and conditional distributions; independence of variables; covariance","ro":"Lecția 5: Distribuții comune, marginale, condiționate; independența variabilelor; covarianță"}, shortTitle: {"en":"L5: Joint distributions","ro":"L5: Distribuții comune"}, sectionCount: 32, metaId: "ml-l05", src: "ml/courses/lesson-05.json" },
    { id: "ml-l06", title: {"en":"Lesson 6: Conditional independence of random variables","ro":"Lecția 6: Independența condiționată a variabilelor aleatoare"}, shortTitle: {"en":"L6: Conditional independence","ro":"L6: Independența condiționată"}, sectionCount: 21, metaId: "ml-l06", src: "ml/courses/lesson-06.json" },
  ],
  seminars: [],
  labs: [],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default ml;
