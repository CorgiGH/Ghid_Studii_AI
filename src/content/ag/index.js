import { lazy } from 'react';

// Courses are appended one line per lesson, in lesson order, in BD's one-line shape
// (scripts/smoke-test.mjs counts them with a regex).
const ag = {
  slug: 'ag',
  yearSemester: 'y2s1',
  player: 'lesson',
  title: { en: 'Algoritmica grafurilor', ro: 'Algoritmica grafurilor' },
  shortTitle: { en: 'AG', ro: 'AG' },
  description: {
    en: 'Graph algorithms: from-zero lessons first, then the partial exam and homework 1 crash packs',
    ro: 'Algoritmica grafurilor: lecțiile „De la zero” întâi, apoi pachetele de urgență pentru parțial și tema 1',
  },
  icon: '🕸️',
  courses: [
    { id: "ag-crash-partial", title: {"en":"Crash pack: AG midterm and Tema 1 ideas (part 1)","ro":"Mod urgență: examenul parțial AG și ideile din Tema 1 (partea 1)"}, shortTitle: {"en":"AG midterm, part 1","ro":"AG parțial, partea 1"}, sectionCount: 56, metaId: "ag-crash-partial", src: "ag/courses/ag-crash-partial.json" },
    { id: "ag-crash-partial-2", title: {"en":"Crash pack: AG midterm and Tema 1 ideas (part 2)","ro":"Mod urgență: examenul parțial AG și ideile din Tema 1 (partea 2)"}, shortTitle: {"en":"AG midterm, part 2","ro":"AG parțial, partea 2"}, sectionCount: 53, metaId: "ag-crash-partial-2", src: "ag/courses/ag-crash-partial-2.json" },
    { id: "ag-z0a", title: {"en":"Lesson 0a: From zero, running an algorithm by hand","ro":"Lecția 0a: De la zero, rulez un algoritm cu mâna"}, shortTitle: {"en":"L0a: Algorithm","ro":"L0a: Algoritm"}, sectionCount: 33, metaId: "ag-z0a", src: "ag/courses/lesson-00a.json" },
    { id: "ag-z0b", title: {"en":"Lesson 0b: From zero, the words of graphs","ro":"Lecția 0b: De la zero, cuvintele grafurilor"}, shortTitle: {"en":"L0b: Words","ro":"L0b: Cuvinte"}, sectionCount: 31, metaId: "ag-z0b", src: "ag/courses/lesson-00b.json" },
    { id: "ag-z0c", title: {"en":"Lesson 0c: From zero, reading the symbols and counting steps","ro":"Lecția 0c: De la zero, citesc simbolurile și număr pașii"}, shortTitle: {"en":"L0c: Symbols","ro":"L0c: Simboluri"}, sectionCount: 32, metaId: "ag-z0c", src: "ag/courses/lesson-00c.json" },
    { id: "ag-z0d", title: {"en":"Lesson 0d: From zero, how to write a proof","ro":"Lecția 0d: De la zero, cum scriu o demonstrație"}, shortTitle: {"en":"L0d: Proofs","ro":"L0d: Demonstrații"}, sectionCount: 29, metaId: "ag-z0d", src: "ag/courses/lesson-00d.json" },
  ],
  seminars: [],
  labs: [],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default ag;
