import { lazy } from 'react';

// Courses are appended one line per lesson, in lesson order, in BD's one-line shape
// (scripts/smoke-test.mjs counts them with a regex).
const nn = {
  slug: 'nn',
  yearSemester: 'y2s1',
  player: 'lesson',
  title: { en: 'Rețele neuronale', ro: 'Rețele neuronale' },
  shortTitle: { en: 'RN', ro: 'RN' },
  description: {
    en: 'Neural networks: homework and lab crash packs',
    ro: 'Rețele neuronale: pachete de urgență pentru teme și laborator',
  },
  icon: '🔗',
  courses: [
    { id: "nn-crash-hw3", title: {"en":"HW3: MLP and backprop for the presentation (Crash pack)","ro":"Tema 3: MLP și backprop pentru prezentare (Mod urgență)"}, shortTitle: {"en":"HW3 crash","ro":"Tema 3 urgență"}, sectionCount: 54, metaId: "nn-crash-hw3", src: "nn/courses/crash-hw3.json" },
  ],
  seminars: [],
  labs: [],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default nn;
