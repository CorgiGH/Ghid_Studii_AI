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
    { id: "nn-crash-hw3", title: {"en":"HW3: MLP and backprop for the presentation (Crash pack)","ro":"Tema 3: MLP și backprop pentru prezentare (Mod urgență)"}, shortTitle: {"en":"HW3 crash","ro":"Tema 3 urgență"}, sectionCount: 76, metaId: "nn-crash-hw3", src: "nn/courses/crash-hw3.json" },
    { id: "nn-l03a", title: {"en":"Lesson 3a: The neuron, the threshold and the sigmoid","ro":"Lecția 3a: Neuronul, pragul și sigmoida"}, shortTitle: {"en":"L3a: The neuron","ro":"L3a: Neuronul"}, sectionCount: 28, metaId: "nn-l03a", src: "nn/courses/lesson-03a.json" },
    { id: "nn-l03b", title: {"en":"Lesson 3b: Layers, networks and the matrix form","ro":"Lecția 3b: Straturi, rețele și forma cu matrice"}, shortTitle: {"en":"L3b: Layers","ro":"L3b: Straturi"}, sectionCount: 27, metaId: "nn-l03b", src: "nn/courses/lesson-03b.json" },
    { id: "nn-l03c", title: {"en":"Lesson 3c: The cost (mean squared error)","ro":"Lecția 3c: Costul (eroarea pătratică medie)"}, shortTitle: {"en":"L3c: The cost","ro":"L3c: Costul"}, sectionCount: 27, metaId: "nn-l03c", src: "nn/courses/lesson-03c.json" },
    { id: "nn-l03d", title: {"en":"Lesson 3d: The idea of descent and partial derivatives","ro":"Lecția 3d: Ideea coborârii și derivatele parțiale"}, shortTitle: {"en":"L3d: Partial derivatives","ro":"L3d: Derivate parțiale"}, sectionCount: 25, metaId: "nn-l03d", src: "nn/courses/lesson-03d.json" },
    { id: "nn-l03e", title: {"en":"Lesson 3e: The gradient step and the chain rule","ro":"Lecția 3e: Pasul pe gradient și regula lanțului"}, shortTitle: {"en":"L3e: The gradient step","ro":"L3e: Pasul pe gradient"}, sectionCount: 28, metaId: "nn-l03e", src: "nn/courses/lesson-03e.json" },
    { id: "nn-l03f", title: {"en":"Lesson 3f: Adaline and the logistic neuron","ro":"Lecția 3f: Adaline și neuronul logistic"}, shortTitle: {"en":"L3f: Adaline and logistic","ro":"L3f: Adaline și logistic"}, sectionCount: 30, metaId: "nn-l03f", src: "nn/courses/lesson-03f.json" },
  ],
  seminars: [],
  labs: [],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default nn;
