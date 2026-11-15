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
    en: 'Graph algorithms: partial exam and homework 1 crash packs',
    ro: 'Algoritmica grafurilor: pachete de urgență pentru examenul parțial și tema 1',
  },
  icon: '🕸️',
  courses: [
    { id: "ag-crash-partial", title: {"en":"Crash pack: AG midterm and Tema 1 ideas (part 1)","ro":"Mod urgență: examenul parțial AG și ideile din Tema 1 (partea 1)"}, shortTitle: {"en":"AG midterm, part 1","ro":"AG parțial, partea 1"}, sectionCount: 56, metaId: "ag-crash-partial", src: "ag/courses/ag-crash-partial.json" },
    { id: "ag-crash-partial-2", title: {"en":"Crash pack: AG midterm and Tema 1 ideas (part 2)","ro":"Mod urgență: examenul parțial AG și ideile din Tema 1 (partea 2)"}, shortTitle: {"en":"AG midterm, part 2","ro":"AG parțial, partea 2"}, sectionCount: 53, metaId: "ag-crash-partial-2", src: "ag/courses/ag-crash-partial-2.json" },
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
