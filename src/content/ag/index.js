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
    en: 'Graph algorithms: partial exam and homework 1 crash packs, and the homework 1 lessons',
    ro: 'Algoritmica grafurilor: pachete de urgență pentru examenul parțial și tema 1, lecții despre tema 1',
  },
  icon: '🕸️',
  courses: [
    { id: "ag-crash-partial", title: {"en":"Crash pack: AG midterm and Tema 1 ideas (part 1)","ro":"Mod urgență: examenul parțial AG și ideile din Tema 1 (partea 1)"}, shortTitle: {"en":"AG midterm, part 1","ro":"AG parțial, partea 1"}, sectionCount: 56, metaId: "ag-crash-partial", src: "ag/courses/ag-crash-partial.json" },
    { id: "ag-crash-partial-2", title: {"en":"Crash pack: AG midterm and Tema 1 ideas (part 2)","ro":"Mod urgență: examenul parțial AG și ideile din Tema 1 (partea 2)"}, shortTitle: {"en":"AG midterm, part 2","ro":"AG parțial, partea 2"}, sectionCount: 53, metaId: "ag-crash-partial-2", src: "ag/courses/ag-crash-partial-2.json" },
    { id: "ag-t1a", title: {"en":"Homework 1, problem 1: the degrees of two nodes","ro":"Tema 1, problema 1: gradele a două noduri"}, shortTitle: {"en":"T1 P1","ro":"T1 Pb 1"}, sectionCount: 31, metaId: "ag-t1a", src: "ag/courses/lesson-t1a.json" },
    { id: "ag-t1a2", title: {"en":"Homework 1, problem 1: what can be asked next","ro":"Tema 1, problema 1: ce se poate cere în plus"}, shortTitle: {"en":"T1 P1, follow-ups","ro":"T1 Pb 1, continuări"}, sectionCount: 23, metaId: "ag-t1a2", src: "ag/courses/lesson-t1a2.json" },
    { id: "ag-t1b", title: {"en":"Homework 1, problem 2: the replacement path","ro":"Tema 1, problema 2: drumul de înlocuire"}, shortTitle: {"en":"T1 P2","ro":"T1 Pb 2"}, sectionCount: 33, metaId: "ag-t1b", src: "ag/courses/lesson-t1b.json" },
    { id: "ag-t1b2", title: {"en":"Homework 1, problem 2: what can be asked next","ro":"Tema 1, problema 2: ce se poate cere în plus"}, shortTitle: {"en":"T1 P2, follow-ups","ro":"T1 Pb 2, continuări"}, sectionCount: 26, metaId: "ag-t1b2", src: "ag/courses/lesson-t1b2.json" },
    { id: "ag-t1c", title: {"en":"Homework 1, problem 3: the cheapest neighbour","ro":"Tema 1, problema 3: cel mai ieftin vecin"}, shortTitle: {"en":"T1 P3","ro":"T1 Pb 3"}, sectionCount: 32, metaId: "ag-t1c", src: "ag/courses/lesson-t1c.json" },
    { id: "ag-t1c2", title: {"en":"Homework 1, problem 3: what can be asked next","ro":"Tema 1, problema 3: ce se poate cere în plus"}, shortTitle: {"en":"T1 P3, follow-ups","ro":"T1 Pb 3, continuări"}, sectionCount: 18, metaId: "ag-t1c2", src: "ag/courses/lesson-t1c2.json" },
    { id: "ag-t1d", title: {"en":"Homework 1: write the proofs from memory","ro":"Tema 1: scrie dovezile din memorie"}, shortTitle: {"en":"T1 from memory","ro":"T1 din memorie"}, sectionCount: 23, metaId: "ag-t1d", src: "ag/courses/lesson-t1d.json" },
  ],
  seminars: [],
  labs: [],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default ag;
