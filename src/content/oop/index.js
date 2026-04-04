import { lazy } from 'react';

const oop = {
  slug: 'oop',
  yearSemester: 'y1s2',
  title: { en: 'Object-Oriented Programming', ro: 'Programare Orientată pe Obiecte' },
  shortTitle: { en: 'OOP', ro: 'POO' },
  description: {
    en: 'C++ fundamentals: classes, constructors, operators, inheritance, templates, STL',
    ro: 'Bazele C++: clase, constructori, operatori, moștenire, șabloane, STL',
  },
  icon: '🧱',
  courses: [
    { id: 'oop-c1', title: { en: 'Course 1: Introduction', ro: 'Cursul 1: Introducere' }, shortTitle: { en: 'C1: Introduction', ro: 'C1: Introducere' }, sectionCount: 6, component: lazy(() => import('./courses/Course01.jsx')) },
    { id: 'oop-c2', title: { en: 'Course 2: C++ Language Specifiers', ro: 'Cursul 2: Specificatori ai limbajului C++' }, shortTitle: { en: 'C2: Specifiers', ro: 'C2: Specificatori' }, sectionCount: 6, component: lazy(() => import('./courses/Course02.jsx')) },
    { id: 'oop-c3', title: { en: 'Course 3: Creating an Object', ro: 'Cursul 3: Crearea unui obiect' }, shortTitle: { en: 'C3: Objects', ro: 'C3: Obiecte' }, sectionCount: 7, component: lazy(() => import('./courses/Course03.jsx')) },
    { id: 'oop-c4', title: { en: 'Course 4: Operators', ro: 'Cursul 4: Operatori' }, shortTitle: { en: 'C4: Operators', ro: 'C4: Operatori' }, sectionCount: 6, component: lazy(() => import('./courses/Course04.jsx')) },
    { id: 'oop-c5', title: { en: 'Course 5: Inheritance', ro: 'Cursul 5: Moștenire' }, shortTitle: { en: 'C5: Inheritance', ro: 'C5: Moștenire' }, sectionCount: 6, component: lazy(() => import('./courses/Course05.jsx')) },
    { id: 'oop-c6', title: { en: 'Course 6: Templates', ro: 'Cursul 6: Șabloane' }, shortTitle: { en: 'C6: Templates', ro: 'C6: Șabloane' }, sectionCount: 6, component: lazy(() => import('./courses/Course06.jsx')) },
    { id: 'oop-c7', title: { en: 'Course 7: STL (1)', ro: 'Cursul 7: STL (1)' }, shortTitle: { en: 'C7: STL', ro: 'C7: STL' }, sectionCount: 6, component: lazy(() => import('./courses/Course07.jsx')) },
  ],
  seminars: [],
  labs: [
    { id: 'oop-l1', title: { en: 'Lab 01: Introduction', ro: 'Lab 01: Introducere' }, shortTitle: { en: 'L1: Intro', ro: 'L1: Intro' }, component: lazy(() => import('./labs/Lab01.jsx')) },
    { id: 'oop-l1e', title: { en: 'Lab 01 Extra', ro: 'Lab 01 Extra' }, shortTitle: { en: 'L1 Extra', ro: 'L1 Extra' }, component: lazy(() => import('./labs/Lab01Extra.jsx')) },
    { id: 'oop-l2', title: { en: 'Lab 02', ro: 'Lab 02' }, shortTitle: { en: 'L2', ro: 'L2' }, component: lazy(() => import('./labs/Lab02.jsx')) },
    { id: 'oop-l2e', title: { en: 'Lab 02 Extra', ro: 'Lab 02 Extra' }, shortTitle: { en: 'L2 Extra', ro: 'L2 Extra' }, component: lazy(() => import('./labs/Lab02Extra.jsx')) },
    { id: 'oop-l3', title: { en: 'Lab 03: Classes', ro: 'Lab 03: Clase' }, shortTitle: { en: 'L3: Classes', ro: 'L3: Clase' }, component: lazy(() => import('./labs/Lab03.jsx')) },
    { id: 'oop-l3e', title: { en: 'Lab 03 Extra', ro: 'Lab 03 Extra' }, shortTitle: { en: 'L3 Extra', ro: 'L3 Extra' }, component: lazy(() => import('./labs/Lab03Extra.jsx')) },
    { id: 'oop-l4', title: { en: 'Lab 04', ro: 'Lab 04' }, shortTitle: { en: 'L4', ro: 'L4' }, component: lazy(() => import('./labs/Lab04.jsx')) },
    { id: 'oop-l5', title: { en: 'Lab 05: Number Class', ro: 'Lab 05: Clasa Number' }, shortTitle: { en: 'L5: Number', ro: 'L5: Number' }, component: lazy(() => import('./labs/Lab05.jsx')) },
    { id: 'oop-l5e', title: { en: 'Lab 05 Extra', ro: 'Lab 05 Extra' }, shortTitle: { en: 'L5 Extra', ro: 'L5 Extra' }, component: lazy(() => import('./labs/Lab05Extra.jsx')) },
    { id: 'oop-l6', title: { en: 'Lab 06', ro: 'Lab 06' }, shortTitle: { en: 'L6', ro: 'L6' }, component: lazy(() => import('./labs/Lab06.jsx')) },
    { id: 'oop-l6e', title: { en: 'Lab 06 Extra', ro: 'Lab 06 Extra' }, shortTitle: { en: 'L6 Extra', ro: 'L6 Extra' }, component: lazy(() => import('./labs/Lab06Extra.jsx')) },
    { id: 'oop-l7', title: { en: 'Lab 07', ro: 'Lab 07' }, shortTitle: { en: 'L7', ro: 'L7' }, component: lazy(() => import('./labs/Lab07.jsx')) },
    { id: 'oop-l7e', title: { en: 'Lab 07 Extra', ro: 'Lab 07 Extra' }, shortTitle: { en: 'L7 Extra', ro: 'L7 Extra' }, component: lazy(() => import('./labs/Lab07Extra.jsx')) },
  ],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default oop;
