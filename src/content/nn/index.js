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
    en: 'Neural networks: the lessons for lecture 3 (the neuron, the cost, gradient descent) and lecture 4 (cross-entropy, softmax, backpropagation, hyper-parameters), and the HW3 crash pack',
    ro: 'Rețele neuronale: lecțiile cursurilor 3 (neuronul, costul, coborârea pe gradient) și 4 (entropia încrucișată, softmax, backpropagation, hiperparametri) și pachetul de urgență pentru Tema 3',
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
    { id: "nn-l04a", title: {"en":"Lesson 4a: Why MSE with a sigmoid learns slowly","ro":"Lecția 4a: De ce învață încet MSE cu sigmoidă"}, shortTitle: {"en":"L4a: MSE and sigmoid","ro":"L4a: MSE și sigmoidă"}, sectionCount: 24, metaId: "nn-l04a", src: "nn/courses/lesson-04a.json" },
    { id: "nn-l04b", title: {"en":"Lesson 4b: Cross-entropy for one neuron","ro":"Lecția 4b: Entropia încrucișată pentru un neuron"}, shortTitle: {"en":"L4b: Cross-entropy","ro":"L4b: Entropia încrucișată"}, sectionCount: 24, metaId: "nn-l04b", src: "nn/courses/lesson-04b.json" },
    { id: "nn-l04c", title: {"en":"Lesson 4c: Where cross-entropy comes from","ro":"Lecția 4c: De unde vine entropia încrucișată"}, shortTitle: {"en":"L4c: Origin of cross-entropy","ro":"L4c: Originea entropiei"}, sectionCount: 23, metaId: "nn-l04c", src: "nn/courses/lesson-04c.json" },
    { id: "nn-l04d", title: {"en":"Lesson 4d: Softmax","ro":"Lecția 4d: Softmax"}, shortTitle: {"en":"L4d: Softmax","ro":"L4d: Softmax"}, sectionCount: 24, metaId: "nn-l04d", src: "nn/courses/lesson-04d.json" },
    { id: "nn-l04e", title: {"en":"Lesson 4e: The gradient of cross-entropy with softmax","ro":"Lecția 4e: Gradientul entropiei încrucișate cu softmax"}, shortTitle: {"en":"L4e: delta = y - t","ro":"L4e: δ = y − t"}, sectionCount: 22, metaId: "nn-l04e", src: "nn/courses/lesson-04e.json" },
    { id: "nn-l04f", title: {"en":"Lesson 4f: Backpropagation, notation and formulas","ro":"Lecția 4f: Backpropagation, notația și formulele"}, shortTitle: {"en":"L4f: Backprop formulas","ro":"L4f: Backprop, formulele"}, sectionCount: 29, metaId: "nn-l04f", src: "nn/courses/lesson-04f.json" },
    { id: "nn-l04g", title: {"en":"Lesson 4g: Backprop on numbers, the lab sheet and new nets","ro":"Lecția 4g: Backprop pe numere, foaia de laborator și rețele noi"}, shortTitle: {"en":"L4g: Backprop on numbers","ro":"L4g: Backprop pe numere"}, sectionCount: 25, metaId: "nn-l04g", src: "nn/courses/lesson-04g.json" },
    { id: "nn-l04h", title: {"en":"Lesson 4h: The algorithm in the course pseudocode","ro":"Lecția 4h: Algoritmul în pseudocodul cursului"}, shortTitle: {"en":"L4h: The pseudocode","ro":"L4h: Pseudocodul"}, sectionCount: 11, metaId: "nn-l04h", src: "nn/courses/lesson-04h.json" },
    { id: "nn-l04i", title: {"en":"Lesson 4i: How to choose the hyper-parameters","ro":"Lecția 4i: Cum alegi hiperparametrii"}, shortTitle: {"en":"L4i: Hyper-parameters","ro":"L4i: Hiperparametri"}, sectionCount: 28, metaId: "nn-l04i", src: "nn/courses/lesson-04i.json" },
  ],
  seminars: [],
  labs: [],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default nn;
