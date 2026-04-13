import { lazy } from 'react';

const alo = {
  slug: 'alo',
  yearSemester: 'y1s2',
  title: { en: 'Linear Algebra & Optimization', ro: 'Algebră Liniară și Optimizare' },
  shortTitle: { en: 'ALO', ro: 'ALO' },
  description: {
    en: 'Linear algebra, matrix theory, optimization methods',
    ro: 'Algebră liniară, teoria matricelor, metode de optimizare',
  },
  icon: '\uD83D\uDCD0',
  courses: [
    { id: 'alo-c1', src: 'alo/courses/course-01.json', metaId: 'alo-c1',
      title: { en: 'Course 1: Introduction & Motivating Examples', ro: 'Cursul 1: Introducere și exemple motivante' },
      shortTitle: { en: 'C1: Intro', ro: 'C1: Intro' },
      sectionCount: 7 },
    { id: 'alo-c2', src: 'alo/courses/course-02.json', metaId: 'alo-c2',
      title: { en: 'Course 2: Inner products, norms, and a short history of linear systems', ro: 'Cursul 2: Produse scalare, norme și o scurtă istorie a sistemelor liniare' },
      shortTitle: { en: 'C2: Norms', ro: 'C2: Norme' },
      sectionCount: 12 },
    { id: 'alo-c3', src: 'alo/courses/course-03.json', metaId: 'alo-c3',
      title: { en: 'Course 3: Floating point, errors, conditioning, and stability', ro: 'Cursul 3: Virgulă mobilă, erori, condiționare și stabilitate' },
      shortTitle: { en: 'C3: Errors', ro: 'C3: Erori' },
      sectionCount: 13 },
    { id: 'alo-c4', src: 'alo/courses/course-04.json', metaId: 'alo-c4',
      title: { en: 'Course 4: Solving linear systems — from Cramer to Gauss', ro: 'Cursul 4: Rezolvarea sistemelor liniare — de la Cramer la Gauss' },
      shortTitle: { en: 'C4: Gauss', ro: 'C4: Gauss' },
      sectionCount: 10 },
    { id: 'alo-c5', src: 'alo/courses/course-05.json', metaId: 'alo-c5',
      title: { en: 'Course 5: Matrix factorizations — Cholesky, LU, QR', ro: 'Cursul 5: Factorizări matriciale — Cholesky, LU, QR' },
      shortTitle: { en: 'C5: Factorizations', ro: 'C5: Factorizări' },
      sectionCount: 10 },
    { id: 'alo-c6', src: 'alo/courses/course-06.json', metaId: 'alo-c6',
      title: { en: 'Course 6: Three roads to QR — Householder, Givens, Gram–Schmidt', ro: 'Cursul 6: Trei drumuri spre QR — Householder, Givens, Gram–Schmidt' },
      shortTitle: { en: 'C6: QR algorithms', ro: 'C6: Algoritmi QR' },
      sectionCount: 11 },
    { id: 'alo-c7', src: 'alo/courses/course-07.json', metaId: 'alo-c7',
      title: { en: 'Course 7: Iterative methods for linear systems', ro: 'Cursul 7: Metode iterative pentru sisteme liniare' },
      shortTitle: { en: 'C7: Iterative', ro: 'C7: Iterative' },
      sectionCount: 9 },
  ],
  seminars: [
    { id: 'alo-s1', title: { en: 'Week 1: Vector & matrix norms, complex inner product', ro: 'Săptămâna 1: Norme vectoriale și matriciale, produs scalar complex' }, shortTitle: { en: 'W1: Norms', ro: 'S1: Norme' }, component: lazy(() => import('./seminars/Seminar01.jsx')) },
  ],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default alo;
