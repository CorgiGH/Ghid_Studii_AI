import { lazy } from 'react';

// Courses are appended one line per lesson, in lesson order, in BD's one-line shape
// (scripts/smoke-test.mjs counts them with a regex).
const ia = {
  slug: 'ia',
  yearSemester: 'y2s1',
  player: 'lesson',
  title: { en: 'Introducere în Inteligența Artificială', ro: 'Introducere în Inteligența Artificială' },
  shortTitle: { en: 'IA', ro: 'IA' },
  description: {
    en: 'Intro to AI: written lab test crash packs',
    ro: 'Introducere în IA: pachete de urgență pentru testele scrise de laborator',
  },
  icon: '🧠',
  courses: [
    { id: "ia-crash-t2", title: {"en":"Crash pack: written test 2 (CSP and game theory)","ro":"Mod urgență: Testul scris 2 (CSP și teoria jocurilor)"}, shortTitle: {"en":"Test 2 crash pack","ro":"Mod urgență T2"}, sectionCount: 72, metaId: "ia-crash-t2", src: "ia/courses/crash-t2.json" },
    { id: "ia-l05a", title: {"en":"Cursul 5, partea 1: ce este un joc, tic-tac-toe ca joc","ro":"Cursul 5, partea 1: ce este un joc, tic-tac-toe ca joc"}, shortTitle: {"en":"IA C5: ce e un joc","ro":"IA C5: ce e un joc"}, sectionCount: 31, metaId: "ia-l05a", src: "ia/courses/lesson-05a.json" },
    { id: "ia-l05b", title: {"en":"Cursul 5, partea 2: minimax, adâncimea și funcția de scor","ro":"Cursul 5, partea 2: minimax, adâncimea și funcția de scor"}, shortTitle: {"en":"IA C5: minimax","ro":"IA C5: minimax"}, sectionCount: 30, metaId: "ia-l05b", src: "ia/courses/lesson-05b.json" },
    { id: "ia-l05c", title: {"en":"Cursul 5, partea 3: alpha-beta, minimax fără frunzele inutile","ro":"Cursul 5, partea 3: alpha-beta, minimax fără frunzele inutile"}, shortTitle: {"en":"IA C5: alpha-beta","ro":"IA C5: alpha-beta"}, sectionCount: 29, metaId: "ia-l05c", src: "ia/courses/lesson-05c.json" },
    { id: "ia-l05d", title: {"en":"Cursul 5, partea 4: teoria jocurilor, matrice, strategii dominante și echilibre","ro":"Cursul 5, partea 4: teoria jocurilor, matrice, strategii dominante și echilibre"}, shortTitle: {"en":"IA C5: matrice și echilibre","ro":"IA C5: matrice și echilibre"}, sectionCount: 33, metaId: "ia-l05d", src: "ia/courses/lesson-05d.json" },
    { id: "ia-l05e", title: {"en":"Cursul 5, partea 5: strategii mixte, încredere, Parrondo, Monte-Carlo și toată lecția","ro":"Cursul 5, partea 5: strategii mixte, încredere, Parrondo, Monte-Carlo și toată lecția"}, shortTitle: {"en":"IA C5: mixte, Monte-Carlo, recapitulare","ro":"IA C5: mixte, Monte-Carlo, recapitulare"}, sectionCount: 24, metaId: "ia-l05e", src: "ia/courses/lesson-05e.json" },
  ],
  seminars: [],
  labs: [],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default ia;
