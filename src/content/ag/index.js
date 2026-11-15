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
    { id: "ag-l05a", title: {"en":"Lesson 5a: From zero: trees, spanning trees, the minimum cost problem","ro":"Lecția 5a: De la zero: arbori, arbori parțiali, problema de cost minim"}, shortTitle: {"en":"L5a: Trees and MST","ro":"L5a: Arbori și MST"}, sectionCount: 26, metaId: "ag-l05a", src: "ag/courses/lesson-05a.json" },
    { id: "ag-l05b", title: {"en":"Lesson 5b: The general method and Theorem 1","ro":"Lecția 5b: Metoda generală și teorema 1"}, shortTitle: {"en":"L5b: General method","ro":"L5b: Metoda generală"}, sectionCount: 24, metaId: "ag-l05b", src: "ag/courses/lesson-05b.json" },
    { id: "ag-l05c", title: {"en":"Lesson 5c: Prim's algorithm","ro":"Lecția 5c: Algoritmul lui Prim"}, shortTitle: {"en":"L5c: Prim","ro":"L5c: Prim"}, sectionCount: 23, metaId: "ag-l05c", src: "ag/courses/lesson-05c.json" },
    { id: "ag-l05d", title: {"en":"Lesson 5d: Kruskal's algorithm and union-find, first solution","ro":"Lecția 5d: Algoritmul lui Kruskal și union-find, prima soluție"}, shortTitle: {"en":"L5d: Kruskal","ro":"L5d: Kruskal"}, sectionCount: 24, metaId: "ag-l05d", src: "ag/courses/lesson-05d.json" },
    { id: "ag-l05e", title: {"en":"Lesson 5e: Union-find: pred, sizes, compression","ro":"Lecția 5e: Union-find: pred, mărimi, compresie"}, shortTitle: {"en":"L5e: Union-find","ro":"L5e: Union-find"}, sectionCount: 28, metaId: "ag-l05e", src: "ag/courses/lesson-05e.json" },
    { id: "ag-l05f", title: {"en":"Lesson 5f: Seminar 6: exercise 1', the swap lemma and the minimality test","ro":"Lecția 5f: Seminar 6: exercițiul 1′, schimbul și testul de minimalitate"}, shortTitle: {"en":"L5f: Seminar 6 (1′, 3)","ro":"L5f: Seminar 6 (1′, 3)"}, sectionCount: 23, metaId: "ag-l05f", src: "ag/courses/lesson-05f.json" },
    { id: "ag-l05g", title: {"en":"Lesson 5g: Seminar 6: uniqueness, true or false, epsilon","ro":"Lecția 5g: Seminar 6: unicitate, adevărat sau fals, ε"}, shortTitle: {"en":"L5g: Seminar 6 (1, 7, 10)","ro":"L5g: Seminar 6 (1, 7, 10)"}, sectionCount: 25, metaId: "ag-l05g", src: "ag/courses/lesson-05g.json" },
    { id: "ag-l05h", title: {"en":"Lesson 5h: Edge swaps: G minus e, the cheapest neighbour, the second-best tree","ro":"Lecția 5h: Schimbul de muchii: G − e, cel mai ieftin vecin, al doilea arbore"}, shortTitle: {"en":"L5h: Swap, neighbour, second best","ro":"L5h: Schimb, vecin, al doilea"}, sectionCount: 34, metaId: "ag-l05h", src: "ag/courses/lesson-05h.json" },
    { id: "ag-l05i", title: {"en":"Lesson 5i: Seminar 6: the graph of minimum trees, the bottleneck path, the colouring","ro":"Lecția 5i: Seminar 6: graful arborilor minimi, drumul cu gâtuire maximă, colorarea"}, shortTitle: {"en":"L5i: Seminar 6 (2, 5, 8)","ro":"L5i: Seminar 6 (2, 5, 8)"}, sectionCount: 25, metaId: "ag-l05i", src: "ag/courses/lesson-05i.json" },
    { id: "ag-l05j", title: {"en":"Lesson 5j: Matchings, edge covers, the Norman-Rabin theorem","ro":"Lecția 5j: Cuplaje, acoperiri cu muchii, teorema Norman-Rabin"}, shortTitle: {"en":"L5j: Matchings and covers","ro":"L5j: Cuplaje și acoperiri"}, sectionCount: 25, metaId: "ag-l05j", src: "ag/courses/lesson-05j.json" },
    { id: "ag-l05k", title: {"en":"Lesson 5k: Hall, König and exercises 11-16","ro":"Lecția 5k: Hall, König și exercițiile 11–16"}, shortTitle: {"en":"L5k: Hall, Konig, ex. 11-16","ro":"L5k: Hall, König, ex. 11–16"}, sectionCount: 29, metaId: "ag-l05k", src: "ag/courses/lesson-05k.json" },
  ],
  seminars: [],
  labs: [],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default ag;
