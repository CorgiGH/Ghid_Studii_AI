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
    { id: "ia-crash-t2", title: {"en":"Crash pack: written test 2 (CSP and game theory)","ro":"Mod urgență: Testul scris 2 (CSP și teoria jocurilor)"}, shortTitle: {"en":"Test 2 crash pack","ro":"Mod urgență T2"}, sectionCount: 70, metaId: "ia-crash-t2", src: "ia/courses/crash-t2.json" },
  ],
  seminars: [],
  labs: [],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default ia;
