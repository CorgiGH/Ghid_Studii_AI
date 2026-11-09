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
    en: 'Intro to AI: the lessons for lecture 4 (CSP) and lecture 5 (games), and the Test 2 crash pack',
    ro: 'Introducere în IA: lecțiile cursurilor 4 (CSP) și 5 (jocuri) și pachetul de urgență T2',
  },
  icon: '🧠',
  courses: [
    { id: "ia-crash-t2", title: {"en":"Crash pack: written test 2 (CSP and game theory)","ro":"Mod urgență: Testul scris 2 (CSP și teoria jocurilor)"}, shortTitle: {"en":"Test 2 crash pack","ro":"Mod urgență T2"}, sectionCount: 72, metaId: "ia-crash-t2", src: "ia/courses/crash-t2.json" },
    { id: "ia-l04a", title: {"en":"Lesson 4a: What a constraint satisfaction problem is","ro":"Lecția 4a: Ce este o problemă cu restricții (CSP)"}, shortTitle: {"en":"L4a: The CSP","ro":"L4a: Problema CSP"}, sectionCount: 34, metaId: "ia-l04a", src: "ia/courses/lesson-04a.json" },
    { id: "ia-l04b", title: {"en":"Lesson 4b: Backtracking search","ro":"Lecția 4b: Căutarea cu backtracking"}, shortTitle: {"en":"L4b: Backtracking","ro":"L4b: Backtracking"}, sectionCount: 21, metaId: "ia-l04b", src: "ia/courses/lesson-04b.json" },
    { id: "ia-l04c", title: {"en":"Lesson 4c: MRV, LCV and forward checking","ro":"Lecția 4c: MRV, LCV și forward checking"}, shortTitle: {"en":"L4c: MRV, LCV, FC","ro":"L4c: MRV, LCV, FC"}, sectionCount: 31, metaId: "ia-l04c", src: "ia/courses/lesson-04c.json" },
    { id: "ia-l04d", title: {"en":"Lesson 4d: Arc consistency and AC-3","ro":"Lecția 4d: Arc consistency și AC-3"}, shortTitle: {"en":"L4d: AC-3","ro":"L4d: AC-3"}, sectionCount: 32, metaId: "ia-l04d", src: "ia/courses/lesson-04d.json" },
    { id: "ia-l04e", title: {"en":"Lesson 4e: Smart backjumping and problem structure","ro":"Lecția 4e: Salt înapoi inteligent și structura problemei"}, shortTitle: {"en":"L4e: Structure","ro":"L4e: Structura"}, sectionCount: 28, metaId: "ia-l04e", src: "ia/courses/lesson-04e.json" },
    { id: "ia-l04f", title: {"en":"Lesson 4f: Local search and review","ro":"Lecția 4f: Căutarea locală și recapitulare"}, shortTitle: {"en":"L4f: Local search","ro":"L4f: Local și recapitulare"}, sectionCount: 22, metaId: "ia-l04f", src: "ia/courses/lesson-04f.json" },
    { id: "ia-l05a", title: {"en":"Lesson 5a: What a game is (tic-tac-toe as a game)","ro":"Lecția 5a: Ce este un joc (tic-tac-toe ca joc)"}, shortTitle: {"en":"L5a: Games","ro":"L5a: Ce e un joc"}, sectionCount: 31, metaId: "ia-l05a", src: "ia/courses/lesson-05a.json" },
    { id: "ia-l05b", title: {"en":"Lesson 5b: Minimax, depth and the score function","ro":"Lecția 5b: Minimax, adâncimea și funcția de scor"}, shortTitle: {"en":"L5b: Minimax","ro":"L5b: Minimax"}, sectionCount: 30, metaId: "ia-l05b", src: "ia/courses/lesson-05b.json" },
    { id: "ia-l05c", title: {"en":"Lesson 5c: Alpha-beta pruning","ro":"Lecția 5c: Alpha-beta, minimax fără frunzele inutile"}, shortTitle: {"en":"L5c: Alpha-beta","ro":"L5c: Alpha-beta"}, sectionCount: 29, metaId: "ia-l05c", src: "ia/courses/lesson-05c.json" },
    { id: "ia-l05d", title: {"en":"Lesson 5d: Game theory: matrices, dominant strategies, equilibria","ro":"Lecția 5d: Teoria jocurilor: matrice, strategii dominante și echilibre"}, shortTitle: {"en":"L5d: Game theory","ro":"L5d: Matrice și echilibre"}, sectionCount: 33, metaId: "ia-l05d", src: "ia/courses/lesson-05d.json" },
    { id: "ia-l05e", title: {"en":"Lesson 5e: Mixed strategies, trust, Parrondo, Monte-Carlo and review","ro":"Lecția 5e: Strategii mixte, încredere, Parrondo, Monte-Carlo și recapitulare"}, shortTitle: {"en":"L5e: Mixed and review","ro":"L5e: Mixte și recapitulare"}, sectionCount: 24, metaId: "ia-l05e", src: "ia/courses/lesson-05e.json" },
  ],
  seminars: [],
  labs: [],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default ia;
