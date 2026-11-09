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
    { id: "ia-l04a", title: {"en":"Lesson 4a: What a constraint satisfaction problem is","ro":"Lecția 4a: Ce este o problemă cu restricții (CSP)"}, shortTitle: {"en":"L4a: The CSP","ro":"L4a: Problema CSP"}, sectionCount: 34, metaId: "ia-l04a", src: "ia/courses/lesson-04a.json" },
    { id: "ia-l04b", title: {"en":"Lesson 4b: Backtracking search","ro":"Lecția 4b: Căutarea cu backtracking"}, shortTitle: {"en":"L4b: Backtracking","ro":"L4b: Backtracking"}, sectionCount: 21, metaId: "ia-l04b", src: "ia/courses/lesson-04b.json" },
    { id: "ia-l04c", title: {"en":"Lesson 4c: MRV, LCV and forward checking","ro":"Lecția 4c: MRV, LCV și forward checking"}, shortTitle: {"en":"L4c: MRV, LCV, FC","ro":"L4c: MRV, LCV, FC"}, sectionCount: 31, metaId: "ia-l04c", src: "ia/courses/lesson-04c.json" },
    { id: "ia-l04d", title: {"en":"Lesson 4d: Arc consistency and AC-3","ro":"Lecția 4d: Arc consistency și AC-3"}, shortTitle: {"en":"L4d: AC-3","ro":"L4d: AC-3"}, sectionCount: 32, metaId: "ia-l04d", src: "ia/courses/lesson-04d.json" },
    { id: "ia-l04e", title: {"en":"Lesson 4e: Smart backjumping and problem structure","ro":"Lecția 4e: Salt înapoi inteligent și structura problemei"}, shortTitle: {"en":"L4e: Structure","ro":"L4e: Structura"}, sectionCount: 28, metaId: "ia-l04e", src: "ia/courses/lesson-04e.json" },
    { id: "ia-l04f", title: {"en":"Lesson 4f: Local search and review","ro":"Lecția 4f: Căutarea locală și recapitulare"}, shortTitle: {"en":"L4f: Local search","ro":"L4f: Local și recapitulare"}, sectionCount: 22, metaId: "ia-l04f", src: "ia/courses/lesson-04f.json" },
  ],
  seminars: [],
  labs: [],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default ia;
