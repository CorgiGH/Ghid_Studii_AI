import { lazy } from 'react';

const os = {
  slug: 'os',
  yearSemester: 'y1s2',
  title: { en: 'Operating Systems', ro: 'Sisteme de Operare' },
  shortTitle: { en: 'OS', ro: 'SO' },
  description: {
    en: 'Linux systems programming: commands, shell, file I/O, processes, IPC, signals, ncurses',
    ro: 'Programare de sistem Linux: comenzi, shell, I/O fișiere, procese, IPC, semnale, ncurses',
  },
  icon: '\uD83D\uDDA5\uFE0F',
  courses: [
    { id: 'c1', title: { en: 'Course 1: Basic Linux Commands & Filesystems', ro: 'Cursul 1: Comenzi de bază Linux și sisteme de fișiere' }, shortTitle: { en: 'C1: Commands & FS', ro: 'C1: Comenzi & FS' }, component: lazy(() => import('./courses/Course01.jsx')) },
    { id: 'c2', title: { en: 'Course 2: Shell Interpreters I - General Overview', ro: 'Cursul 2: Interpretoare de comenzi I - Prezentare generală' }, shortTitle: { en: 'C2: Shell I', ro: 'C2: Shell I' }, component: lazy(() => import('./courses/Course02.jsx')) },
    { id: 'c3', title: { en: 'Course 3: Bash Scripting', ro: 'Cursul 3: Scripting Bash' }, shortTitle: { en: 'C3: Bash Script', ro: 'C3: Script Bash' }, component: lazy(() => import('./courses/Course03.jsx')) },
    { id: 'c4', title: { en: 'Course 4: File I/O Primitives (POSIX + C stdlib)', ro: 'Cursul 4: Primitivele I/O pentru fișiere (POSIX + C stdlib)' }, shortTitle: { en: 'C4: File I/O', ro: 'C4: I/O Fișiere' }, component: lazy(() => import('./courses/Course04.jsx')) },
    { id: 'c5', title: { en: 'Course 5: File Locking & Concurrent Access', ro: 'Cursul 5: Blocaje pe fișiere și acces concurent' }, shortTitle: { en: 'C5: File Locks', ro: 'C5: Blocaje' }, component: lazy(() => import('./courses/Course05.jsx')) },
    { id: 'c6', title: { en: 'Course 6: Process Management I - fork() & wait()', ro: 'Cursul 6: Gestiunea proceselor I - fork() și wait()' }, shortTitle: { en: 'C6: fork/wait', ro: 'C6: fork/wait' }, component: lazy(() => import('./courses/Course06.jsx')) },
    { id: 'c7', title: { en: 'Course 7: Process Management II - exec()', ro: 'Cursul 7: Gestiunea proceselor II - exec()' }, shortTitle: { en: 'C7: exec', ro: 'C7: exec' }, component: lazy(() => import('./courses/Course07.jsx')) },
    { id: 'c8', title: { en: 'Course 8: Memory-Mapped Files, Shared Memory & Semaphores', ro: 'Cursul 8: Fișiere mapate în memorie, memorie partajată și semafoare' }, shortTitle: { en: 'C8: mmap/IPC', ro: 'C8: mmap/IPC' }, component: lazy(() => import('./courses/Course08.jsx')) },
    { id: 'c9', title: { en: 'Course 9: IPC via Pipes (Anonymous & Named)', ro: 'Cursul 9: Comunicația inter-procese prin canale (anonime și cu nume)' }, shortTitle: { en: 'C9: Pipes', ro: 'C9: Canale' }, component: lazy(() => import('./courses/Course09.jsx')) },
    { id: 'c10', title: { en: 'Course 10: POSIX Signals', ro: 'Cursul 10: Semnale POSIX' }, shortTitle: { en: 'C10: Signals', ro: 'C10: Semnale' }, component: lazy(() => import('./courses/Course10.jsx')) },
    { id: 'c11', title: { en: 'Course 11: NCURSES & Terminal Management', ro: 'Cursul 11: NCURSES și gestiunea terminalelor' }, shortTitle: { en: 'C11: ncurses', ro: 'C11: ncurses' }, component: lazy(() => import('./courses/Course11.jsx')) },
  ],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default os;
