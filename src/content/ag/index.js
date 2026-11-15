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
    en: 'Graph algorithms: start from zero, homework 1 explained, and the midterm crash packs',
    ro: 'Algoritmica grafurilor: de la zero, Tema 1 explicată și pachetele de urgență pentru parțial',
  },
  icon: '🕸️',
  courses: [
    { id: "ag-crash-partial", title: {"en":"Crash pack: AG midterm and Tema 1 ideas (part 1)","ro":"Mod urgență: examenul parțial AG și ideile din Tema 1 (partea 1)"}, shortTitle: {"en":"AG midterm, part 1","ro":"AG parțial, partea 1"}, sectionCount: 56, metaId: "ag-crash-partial", src: "ag/courses/ag-crash-partial.json" },
    { id: "ag-crash-partial-2", title: {"en":"Crash pack: AG midterm and Tema 1 ideas (part 2)","ro":"Mod urgență: examenul parțial AG și ideile din Tema 1 (partea 2)"}, shortTitle: {"en":"AG midterm, part 2","ro":"AG parțial, partea 2"}, sectionCount: 53, metaId: "ag-crash-partial-2", src: "ag/courses/ag-crash-partial-2.json" },
    { id: "ag-z0a", title: {"en":"Lesson 0a: From zero, running an algorithm by hand","ro":"Lecția 0a: De la zero, rulez un algoritm cu mâna"}, shortTitle: {"en":"L0a: Algorithm","ro":"L0a: Algoritm"}, sectionCount: 36, metaId: "ag-z0a", src: "ag/courses/lesson-00a.json" },
    { id: "ag-z0b", title: {"en":"Lesson 0b: From zero, the words of graphs","ro":"Lecția 0b: De la zero, cuvintele grafurilor"}, shortTitle: {"en":"L0b: Words","ro":"L0b: Cuvinte"}, sectionCount: 39, metaId: "ag-z0b", src: "ag/courses/lesson-00b.json" },
    { id: "ag-z0c", title: {"en":"Lesson 0c: From zero, reading the symbols and counting steps","ro":"Lecția 0c: De la zero, citesc simbolurile și număr pașii"}, shortTitle: {"en":"L0c: Symbols","ro":"L0c: Simboluri"}, sectionCount: 32, metaId: "ag-z0c", src: "ag/courses/lesson-00c.json" },
    { id: "ag-z0d", title: {"en":"Lesson 0d: From zero, how to write a proof","ro":"Lecția 0d: De la zero, cum scriu o demonstrație"}, shortTitle: {"en":"L0d: Proofs","ro":"L0d: Demonstrații"}, sectionCount: 29, metaId: "ag-z0d", src: "ag/courses/lesson-00d.json" },
    { id: "ag-t1a", title: {"en":"Homework 1, problem 1: the degrees of two nodes","ro":"Tema 1, problema 1: gradele a două noduri"}, shortTitle: {"en":"T1 P1","ro":"T1 Pb 1"}, sectionCount: 31, metaId: "ag-t1a", src: "ag/courses/lesson-t1a.json" },
    { id: "ag-t1a2", title: {"en":"Homework 1, problem 1: what can be asked next","ro":"Tema 1, problema 1: ce se poate cere în plus"}, shortTitle: {"en":"T1 P1, follow-ups","ro":"T1 Pb 1, continuări"}, sectionCount: 23, metaId: "ag-t1a2", src: "ag/courses/lesson-t1a2.json" },
    { id: "ag-t1b", title: {"en":"Homework 1, problem 2: the replacement path","ro":"Tema 1, problema 2: drumul de înlocuire"}, shortTitle: {"en":"T1 P2","ro":"T1 Pb 2"}, sectionCount: 35, metaId: "ag-t1b", src: "ag/courses/lesson-t1b.json" },
    { id: "ag-t1b2", title: {"en":"Homework 1, problem 2: what can be asked next","ro":"Tema 1, problema 2: ce se poate cere în plus"}, shortTitle: {"en":"T1 P2, follow-ups","ro":"T1 Pb 2, continuări"}, sectionCount: 26, metaId: "ag-t1b2", src: "ag/courses/lesson-t1b2.json" },
    { id: "ag-t1c", title: {"en":"Homework 1, problem 3: the cheapest neighbour","ro":"Tema 1, problema 3: cel mai ieftin vecin"}, shortTitle: {"en":"T1 P3","ro":"T1 Pb 3"}, sectionCount: 35, metaId: "ag-t1c", src: "ag/courses/lesson-t1c.json" },
    { id: "ag-t1c2", title: {"en":"Homework 1, problem 3: what can be asked next","ro":"Tema 1, problema 3: ce se poate cere în plus"}, shortTitle: {"en":"T1 P3, follow-ups","ro":"T1 Pb 3, continuări"}, sectionCount: 19, metaId: "ag-t1c2", src: "ag/courses/lesson-t1c2.json" },
    { id: "ag-t1d", title: {"en":"Homework 1: write the proofs from memory","ro":"Tema 1: scrie dovezile din memorie"}, shortTitle: {"en":"T1 from memory","ro":"T1 din memorie"}, sectionCount: 23, metaId: "ag-t1d", src: "ag/courses/lesson-t1d.json" },
    { id: "ag-l03a", title: {"en": "Lecția 3a: drumuri de cost minim, de la zero", "ro": "Lecția 3a: drumuri de cost minim, de la zero"}, shortTitle: {"en": "L3a: Drumuri de cost minim", "ro": "L3a: Drumuri de cost minim"}, sectionCount: 19, metaId: "ag-l03a", src: "ag/courses/lesson-03a.json" },
    { id: "ag-l03b", title: {"en": "Lecția 3b: Dag-uri, ordonare topologică, substituție", "ro": "Lecția 3b: Dag-uri, ordonare topologică, substituție"}, shortTitle: {"en": "L3b: Dag-uri", "ro": "L3b: Dag-uri"}, sectionCount: 26, metaId: "ag-l03b", src: "ag/courses/lesson-03b.json" },
    { id: "ag-l03c", title: {"en": "Lecția 3c: Dijkstra, pas cu pas", "ro": "Lecția 3c: Dijkstra, pas cu pas"}, shortTitle: {"en": "L3c: Dijkstra", "ro": "L3c: Dijkstra"}, sectionCount: 22, metaId: "ag-l03c", src: "ag/courses/lesson-03c.json" },
    { id: "ag-l03d", title: {"en": "Lecția 3d: de ce merge Dijkstra, cât costă, arce negative", "ro": "Lecția 3d: de ce merge Dijkstra, cât costă, arce negative"}, shortTitle: {"en": "L3d: Corectitudine și cost", "ro": "L3d: Corectitudine și cost"}, sectionCount: 24, metaId: "ag-l03d", src: "ag/courses/lesson-03d.json" },
    { id: "ag-l03e", title: {"en": "Lecția 3e: P1, estimator, A* și Dijkstra bidirecțional", "ro": "Lecția 3e: P1, estimator, A* și Dijkstra bidirecțional"}, shortTitle: {"en": "L3e: P1 și A*", "ro": "L3e: P1 și A*"}, sectionCount: 19, metaId: "ag-l03e", src: "ag/courses/lesson-03e.json" },
    { id: "ag-l03f", title: {"en": "Lecția 3f: Bellman-Ford-Moore", "ro": "Lecția 3f: Bellman-Ford-Moore"}, shortTitle: {"en": "L3f: Bellman-Ford-Moore", "ro": "L3f: Bellman-Ford-Moore"}, sectionCount: 22, metaId: "ag-l03f", src: "ag/courses/lesson-03f.json" },
    { id: "ag-l03g", title: {"en": "Lecția 3g: toate perechile, Floyd-Warshall", "ro": "Lecția 3g: toate perechile, Floyd-Warshall"}, shortTitle: {"en": "L3g: Floyd-Warshall", "ro": "L3g: Floyd-Warshall"}, sectionCount: 22, metaId: "ag-l03g", src: "ag/courses/lesson-03g.json" },
    { id: "ag-l03h", title: {"en": "Lecția 3h: Johnson și produsul (min, +)", "ro": "Lecția 3h: Johnson și produsul (min, +)"}, shortTitle: {"en": "L3h: Johnson și (min,+)", "ro": "L3h: Johnson și (min,+)"}, sectionCount: 19, metaId: "ag-l03h", src: "ag/courses/lesson-03h.json" },
    { id: "ag-l03i", title: {"en": "Lecția 3i: arborele SP și drumul de înlocuire", "ro": "Lecția 3i: arborele SP și drumul de înlocuire"}, shortTitle: {"en": "L3i: Arbore SP", "ro": "L3i: Arbore SP"}, sectionCount: 28, metaId: "ag-l03i", src: "ag/courses/lesson-03i.json" },
    { id: "ag-l03j", title: {"en": "Lecția 3j: seminarul 4, în sus și în jos, componente, cost mediu", "ro": "Lecția 3j: seminarul 4, în sus și în jos, componente, cost mediu"}, shortTitle: {"en": "L3j: Seminar: sus-jos, componente", "ro": "L3j: Seminar: sus-jos, componente"}, sectionCount: 20, metaId: "ag-l03j", src: "ag/courses/lesson-03j.json" },
    { id: "ag-l03k", title: {"en": "Lecția 3k: seminarul 4, grafuri, grade, arbori, mulțimi (opțional)", "ro": "Lecția 3k: seminarul 4, grafuri, grade, arbori, mulțimi (opțional)"}, shortTitle: {"en": "L3k: Seminar: grafuri și arbori", "ro": "L3k: Seminar: grafuri și arbori"}, sectionCount: 19, metaId: "ag-l03k", src: "ag/courses/lesson-03k.json" },
  ],
  seminars: [],
  labs: [],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default ag;
