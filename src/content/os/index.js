import { lazy } from 'react';

const os = {
  slug: 'os',
  yearSemester: 'y1s2',
  title: { en: 'Operating Systems', ro: 'Sisteme de Operare' },
  shortTitle: { en: 'OS', ro: 'SO' },
  description: {
    en: 'Linux systems programming: commands, shell, file I/O, processes, IPC, signals, ncurses',
    ro: 'Programare de sistem Linux: comenzi, shell, I/O fișiere, procese, IPC, signals, ncurses',
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
    { id: 'c9', title: { en: 'Course 9: IPC via Pipes (Anonymous & Named)', ro: 'Cursul 9: Comunicația inter-procese prin pipes (anonime și cu nume)' }, shortTitle: { en: 'C9: Pipes', ro: 'C9: Pipes' }, component: lazy(() => import('./courses/Course09.jsx')) },
    { id: 'c10', title: { en: 'Course 10: POSIX Signals', ro: 'Cursul 10: POSIX Signals' }, shortTitle: { en: 'C10: Signals', ro: 'C10: Signals' }, component: lazy(() => import('./courses/Course10.jsx')) },
    { id: 'c11', title: { en: 'Course 11: NCURSES & Terminal Management', ro: 'Cursul 11: NCURSES și gestiunea terminalelor' }, shortTitle: { en: 'C11: ncurses', ro: 'C11: ncurses' }, component: lazy(() => import('./courses/Course11.jsx')) },
  ],
  seminars: [
    { id: 's1', title: { en: 'Week 1: Basic Linux Commands (Solved)', ro: 'Săptămâna 1: Comenzi de bază Linux (Rezolvate)' }, shortTitle: { en: 'W1: Commands', ro: 'S1: Comenzi' }, component: lazy(() => import('./seminars/Seminar01.jsx')) },
    { id: 's2', title: { en: 'Week 2: Chained Commands & Pipelines (Solved)', ro: 'Săptămâna 2: Comenzi înlănțuite și pipeline-uri (Rezolvate)' }, shortTitle: { en: 'W2: Pipelines', ro: 'S2: Pipeline-uri' }, component: lazy(() => import('./seminars/Seminar02.jsx')) },
    { id: 's3', title: { en: 'Week 3: Bash Scripting (Solved)', ro: 'Săptămâna 3: Scripting Bash (Rezolvate)' }, shortTitle: { en: 'W3: Bash Scripts', ro: 'S3: Scripturi Bash' }, component: lazy(() => import('./seminars/Seminar03.jsx')) },
    { id: 's4', title: { en: 'Week 4: File I/O & Locking in C (Solved)', ro: 'Săptămâna 4: I/O fișiere și blocaje în C (Rezolvate)' }, shortTitle: { en: 'W4: File I/O', ro: 'S4: I/O fișiere' }, component: lazy(() => import('./seminars/Seminar04.jsx')) },
    { id: 's5', title: { en: 'Week 5: fork/wait/exec (Solved)', ro: 'Săptămâna 5: fork/wait/exec (Rezolvate)' }, shortTitle: { en: 'W5: Processes', ro: 'S5: Procese' }, component: lazy(() => import('./seminars/Seminar05.jsx')) },
    { id: 's6', title: { en: 'Week 6: mmap & Shared Memory (Solved)', ro: 'Săptămâna 6: mmap și memorie partajată (Rezolvate)' }, shortTitle: { en: 'W6: mmap/shm', ro: 'S6: mmap/shm' }, component: lazy(() => import('./seminars/Seminar06.jsx')) },
    { id: 's7', title: { en: 'Week 7: Pipes, FIFOs & Signals (Solved)', ro: 'Săptămâna 7: Pipes, FIFO-uri și Signals (Rezolvate)' }, shortTitle: { en: 'W7: Pipes/Signals', ro: 'S7: Pipes/Signals' }, component: lazy(() => import('./seminars/Seminar07.jsx')) },
  ],
  labs: [
    { id: 'l1', title: { en: 'Week 1: Simple Commands (Exercises)', ro: 'Săptămâna 1: Comenzi simple (Exerciții)' }, shortTitle: { en: 'W1: Commands', ro: 'S1: Comenzi' }, component: lazy(() => import('./labs/Lab01.jsx')) },
    { id: 'l2', title: { en: 'Week 2: Chained Commands & Pipelines (Exercises)', ro: 'Săptămâna 2: Comenzi înlănțuite și pipeline-uri (Exerciții)' }, shortTitle: { en: 'W2: Pipelines', ro: 'S2: Pipeline-uri' }, component: lazy(() => import('./labs/Lab02.jsx')) },
    { id: 'l3', title: { en: 'Week 3: Bash Scripting (Exercises)', ro: 'Săptămâna 3: Scripting Bash (Exerciții)' }, shortTitle: { en: 'W3: Bash Scripts', ro: 'S3: Scripturi Bash' }, component: lazy(() => import('./labs/Lab03.jsx')) },
    { id: 'l4', title: { en: 'Week 4: File I/O & Locking in C (Exercises)', ro: 'Săptămâna 4: I/O fișiere și blocaje în C (Exerciții)' }, shortTitle: { en: 'W4: File I/O', ro: 'S4: I/O fișiere' }, component: lazy(() => import('./labs/Lab04.jsx')) },
    { id: 'l5', title: { en: 'Week 5: fork/wait/exec (Exercises)', ro: 'Săptămâna 5: fork/wait/exec (Exerciții)' }, shortTitle: { en: 'W5: Processes', ro: 'S5: Procese' }, component: lazy(() => import('./labs/Lab05.jsx')) },
    { id: 'l6', title: { en: 'Week 6: mmap & Shared Memory (Exercises)', ro: 'Săptămâna 6: mmap și memorie partajată (Exerciții)' }, shortTitle: { en: 'W6: mmap/shm', ro: 'S6: mmap/shm' }, component: lazy(() => import('./labs/Lab06.jsx')) },
    { id: 'l7', title: { en: 'Week 7: Pipes, FIFOs & Signals (Exercises)', ro: 'Săptămâna 7: Pipes, FIFO-uri și Signals (Exerciții)' }, shortTitle: { en: 'W7: Pipes/Signals', ro: 'S7: Pipes/Signals' }, component: lazy(() => import('./labs/Lab07.jsx')) },
  ],
  tests: [
    { id: 'test-lab1-7', title: { en: 'Test: Labs 1–7', ro: 'Test: Laboratoarele 1–7' }, shortTitle: { en: 'Labs 1–7', ro: 'Lab 1–7' }, component: lazy(() => import('./test/TestLab1_7.jsx')) },
  ],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default os;
