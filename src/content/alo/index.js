import React, { lazy } from 'react';

function makeSeminarComponent(jsonLoader, displayName) {
  const Component = lazy(async () => {
    const [{ default: Shell }, { default: data }] = await Promise.all([
      import('./seminars/SeminarShell'),
      jsonLoader(),
    ]);
    return { default: () => React.createElement(Shell, { seminarData: data }) };
  });
  Component.displayName = displayName;
  return Component;
}

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
    { id: 'alo-c8', src: 'alo/courses/course-08.json', metaId: 'alo-c8',
      title: { en: 'Course 8: Numerical Optimization', ro: 'Cursul 8: Optimizare Numerică' },
      shortTitle: { en: 'C8: Optimization', ro: 'C8: Optimizare' },
      sectionCount: 8 },
    { id: 'alo-c9', src: 'alo/courses/course-09.json', metaId: 'alo-c9',
      title: { en: 'Course 9: Eigenvalues — Theory, Power Method, Inverse Iteration, QR Algorithm', ro: 'Cursul 9: Valori proprii — Teorie, metoda puterii, iterație inversă, algoritmul QR' },
      shortTitle: { en: 'C9: Eigenvalues', ro: 'C9: Valori proprii' },
      sectionCount: 7 },
    { id: 'alo-c10', src: 'alo/courses/course-10.json', metaId: 'alo-c10',
      title: { en: 'Course 10: SVD, Least Squares & Nonlinear Equations', ro: 'Cursul 10: SVD, Cele mai mici pătrate și ecuații neliniare' },
      shortTitle: { en: 'C10: SVD & LSP', ro: 'C10: SVD & CMM' },
      sectionCount: 5 },
  ],
  seminars: [
    { id: 'alo-s1', title: { en: 'Week 1: Vector & matrix norms, complex inner product', ro: 'Săptămâna 1: Norme vectoriale și matriciale, produs scalar complex' }, shortTitle: { en: 'W1: Norms', ro: 'S1: Norme' }, component: makeSeminarComponent(() => import('./seminars/seminar-01.json'), 'Seminar01') },
    { id: 'alo-s2', title: { en: 'Week 2: Triangular systems, inverses, Gram–Schmidt', ro: 'Săptămâna 2: Sisteme triunghiulare, inverse, Gram–Schmidt' }, shortTitle: { en: 'W2: GS + QR', ro: 'S2: GS + QR' }, component: makeSeminarComponent(() => import('./seminars/seminar-02.json'), 'Seminar02') },
    { id: 'alo-s3', title: { en: 'Week 3: Graphical methods, parametric systems, Gauss with pivoting', ro: 'Săptămâna 3: Metode grafice, sisteme parametrice, Gauss cu pivotare' }, shortTitle: { en: 'W3: Pivoting', ro: 'S3: Pivotare' }, component: makeSeminarComponent(() => import('./seminars/seminar-03.json'), 'Seminar03') },
    { id: 'alo-s4', title: { en: 'Week 4: LU decomposition — Doolittle, Crout, PA = LU', ro: 'Săptămâna 4: Descompunerea LU — Doolittle, Crout, PA = LU' }, shortTitle: { en: 'W4: LU', ro: 'S4: LU' }, component: makeSeminarComponent(() => import('./seminars/seminar-04.json'), 'Seminar04') },
    { id: 'alo-s5', title: { en: 'Week 5: QR decomposition — Givens and Householder', ro: 'Săptămâna 5: Descompunerea QR — Givens și Householder' }, shortTitle: { en: 'W5: QR', ro: 'S5: QR' }, component: makeSeminarComponent(() => import('./seminars/seminar-05.json'), 'Seminar05') },
    { id: 'alo-s6', title: { en: 'Week 6: Eigenvalues, similarity, power method, QR iteration', ro: 'Săptămâna 6: Valori proprii, similaritate, metoda puterii, iterație QR' }, shortTitle: { en: 'W6: Eigenvalues', ro: 'S6: Val. proprii' }, component: makeSeminarComponent(() => import('./seminars/seminar-06.json'), 'Seminar06') },
    { id: 'alo-s7', title: { en: 'Week 7: Quadratic forms, gradients, Hessians, steepest descent and Newton', ro: 'Săptămâna 7: Forme pătratice, gradienti, Hessiene, panta maximă și Newton' }, shortTitle: { en: 'W7: Optimization', ro: 'S7: Optimizare' }, component: makeSeminarComponent(() => import('./seminars/seminar-07.json'), 'Seminar07') },
  ],
  labs: [
    { id: 'alo-t1', title: { en: 'Theme 1: Machine epsilon & tan approximation', ro: 'Tema 1: Precizia mașinii & aproximarea tan' }, shortTitle: { en: 'T1', ro: 'T1' }, component: lazy(() => import('./labs/T1.jsx')) },
    { id: 'alo-t2', title: { en: 'Theme 2: Secant method for 1D minimization', ro: 'Tema 2: Metoda secantei pentru minimizare 1D' }, shortTitle: { en: 'T2', ro: 'T2' }, component: lazy(() => import('./labs/T2.jsx')) },
    { id: 'alo-t3', title: { en: 'Theme 3: LU decomposition & linear systems', ro: 'Tema 3: Descompunerea LU & sisteme liniare' }, shortTitle: { en: 'T3', ro: 'T3' }, component: lazy(() => import('./labs/T3.jsx')) },
    { id: 'alo-t4', title: { en: 'Theme 4: Householder QR & matrix inverse', ro: 'Tema 4: QR Householder & inversa matricei' }, shortTitle: { en: 'T4', ro: 'T4' }, component: lazy(() => import('./labs/T4.jsx')) },
    { id: 'alo-t5', title: { en: 'Theme 5: Jacobi eigenvalues, Cholesky QR iteration & SVD', ro: 'Tema 5: Valori proprii Jacobi, iterație QR Cholesky & SVD' }, shortTitle: { en: 'T5', ro: 'T5' }, component: lazy(() => import('./labs/T5.jsx')) },
  ],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default alo;
