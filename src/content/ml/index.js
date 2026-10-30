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
    { id: "ml-g1a", title: {"en":"Ghid rapid 1a: Probabilitatea totală, formula lui Bayes, independența evenimentelor","ro":"Ghid rapid 1a: Probabilitatea totală, formula lui Bayes, independența evenimentelor"}, shortTitle: {"en":"Ghid 1a","ro":"Ghid 1a"}, sectionCount: 32, metaId: "ml-g1a", src: "ml/courses/guide-g1a.json" },
    { id: "ml-b1a", title: {"en":"Blitz 1a: Probabilitatea totală, formula lui Bayes, independența evenimentelor","ro":"Blitz 1a: Probabilitatea totală, formula lui Bayes, independența evenimentelor"}, shortTitle: {"en":"Blitz 1a","ro":"Blitz 1a"}, sectionCount: 17, metaId: "ml-b1a", src: "ml/courses/guide-b1a.json" },
    { id: "ml-g1b", title: {"en":"Ghid rapid 1b: Variabile aleatoare, operații, independența variabilelor","ro":"Ghid rapid 1b: Variabile aleatoare, operații, independența variabilelor"}, shortTitle: {"en":"Ghid 1b","ro":"Ghid 1b"}, sectionCount: 58, metaId: "ml-g1b", src: "ml/courses/guide-g1b.json" },
    { id: "ml-b1b", title: {"en":"Blitz 1b: Variabile aleatoare, operații, independența variabilelor","ro":"Blitz 1b: Variabile aleatoare, operații, independența variabilelor"}, shortTitle: {"en":"Blitz 1b","ro":"Blitz 1b"}, sectionCount: 29, metaId: "ml-b1b", src: "ml/courses/guide-b1b.json" },
    { id: "ml-g2", title: {"en":"Ghid rapid 2: Entropie, câștig de informație, ID3","ro":"Ghid rapid 2: Entropie, câștig de informație, ID3"}, shortTitle: {"en":"Ghid 2","ro":"Ghid 2"}, sectionCount: 75, metaId: "ml-g2", src: "ml/courses/guide-g2.json" },
    { id: "ml-b2", title: {"en":"Blitz 2: Entropie, câștig de informație, ID3","ro":"Blitz 2: Entropie, câștig de informație, ID3"}, shortTitle: {"en":"Blitz 2","ro":"Blitz 2"}, sectionCount: 39, metaId: "ml-b2", src: "ml/courses/guide-b2.json" },
    { id: "ml-g3", title: {"en":"Ghid rapid 3: Antrenare, validare, test; overfitting; cross-validare; pruning","ro":"Ghid rapid 3: Antrenare, validare, test; overfitting; cross-validare; pruning"}, shortTitle: {"en":"Ghid 3","ro":"Ghid 3"}, sectionCount: 66, metaId: "ml-g3", src: "ml/courses/guide-g3.json" },
    { id: "ml-b3", title: {"en":"Blitz 3: Antrenare, validare, test; overfitting; cross-validare; pruning","ro":"Blitz 3: Antrenare, validare, test; overfitting; cross-validare; pruning"}, shortTitle: {"en":"Blitz 3","ro":"Blitz 3"}, sectionCount: 36, metaId: "ml-b3", src: "ml/courses/guide-b3.json" },
    { id: "ml-g4", title: {"en":"Ghid rapid 4: Clasificatori bayesieni","ro":"Ghid rapid 4: Clasificatori bayesieni"}, shortTitle: {"en":"Ghid 4","ro":"Ghid 4"}, sectionCount: 54, metaId: "ml-g4", src: "ml/courses/guide-g4.json" },
    { id: "ml-b4", title: {"en":"Blitz 4: Clasificatori bayesieni","ro":"Blitz 4: Clasificatori bayesieni"}, shortTitle: {"en":"Blitz 4","ro":"Blitz 4"}, sectionCount: 32, metaId: "ml-b4", src: "ml/courses/guide-b4.json" },
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
