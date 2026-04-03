import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import MultipleChoice from '../../../components/ui/MultipleChoice';
import CodeChallenge from '../../../components/ui/CodeChallenge';
import TerminalChallenge from '../../../components/ui/TerminalChallenge';

const mcQuestions = [
  {
    question: { en: 'Which system call creates a new process?', ro: 'Ce apel de sistem creează un proces nou?' },
    options: [
      { text: 'exec()', correct: false },
      { text: 'fork()', correct: true },
      { text: 'clone()', correct: false },
      { text: 'spawn()', correct: false },
    ],
    explanation: { en: 'fork() creates a child process by duplicating the calling process. exec() replaces the current process image.', ro: 'fork() creează un proces copil prin duplicarea procesului apelant. exec() înlocuiește imaginea procesului curent.' },
  },
  {
    question: { en: 'What does chmod 755 mean?', ro: 'Ce înseamnă chmod 755?' },
    options: [
      { text: 'rwxr-xr-x', correct: true },
      { text: 'rwxrwxrwx', correct: false },
      { text: 'rw-r--r--', correct: false },
      { text: 'rwx------', correct: false },
    ],
    explanation: { en: '7=rwx (owner), 5=r-x (group), 5=r-x (others). Each digit is the sum: r=4, w=2, x=1.', ro: '7=rwx (proprietar), 5=r-x (grup), 5=r-x (alții). Fiecare cifră este suma: r=4, w=2, x=1.' },
  },
  {
    question: { en: 'What happens when fork() succeeds?', ro: 'Ce se întâmplă când fork() reușește?' },
    options: [
      { text: 'Returns 0 to both processes', correct: false },
      { text: 'Returns child PID to parent, 0 to child', correct: true },
      { text: 'Returns 1 to parent, -1 to child', correct: false },
      { text: 'Returns PID to both processes', correct: false },
    ],
    explanation: { en: 'fork() returns the child PID to the parent process and 0 to the child. On failure, it returns -1.', ro: 'fork() returnează PID-ul copilului procesului părinte și 0 procesului copil. La eșec, returnează -1.' },
  },
  {
    question: { en: 'Which command shows all running processes?', ro: 'Ce comandă afișează toate procesele care rulează?' },
    options: [
      { text: 'ls -a', correct: false },
      { text: 'ps aux', correct: true },
      { text: 'top -p', correct: false },
      { text: 'cat /proc', correct: false },
    ],
    explanation: { en: 'ps aux shows all processes for all users with detailed information.', ro: 'ps aux afișează toate procesele pentru toți utilizatorii cu informații detaliate.' },
  },
  {
    question: { en: 'What does a pipe (|) do in the shell?', ro: 'Ce face un pipe (|) în shell?' },
    options: [
      { text: 'Redirects output to a file', correct: false },
      { text: 'Connects stdout of one command to stdin of another', correct: true },
      { text: 'Runs two commands in parallel', correct: false },
      { text: 'Sends a signal to a process', correct: false },
    ],
    explanation: { en: 'The pipe operator connects the standard output of the left command to the standard input of the right command.', ro: 'Operatorul pipe conectează ieșirea standard a comenzii din stânga la intrarea standard a comenzii din dreapta.' },
  },
];

export default function Practice() {
  const { t } = useApp();

  const terminalExercises = [
    {
      description: t(
        'Navigate to the "documents" directory and read the contents of "notes.txt" using cat.',
        'Navighează în directorul "documents" și citește conținutul fișierului "notes.txt" folosind cat.'
      ),
      courseRef: t('Course 1: Directory commands', 'Cursul 1: Comenzi directoare'),
      files: {
        '/home/user/documents': null,
        '/home/user/documents/notes.txt': 'Operating systems manage hardware resources.\nThe kernel is the core of the OS.\nProcesses are instances of running programs.',
        '/home/user/documents/readme.md': '# My Project\nThis is a sample project.',
        '/home/user/pictures': null,
        '/home/user/music': null,
      },
      welcomeMessage: t('Navigate to documents/ and read notes.txt', 'Navighează în documents/ și citește notes.txt'),
      checkFn: async (emu) => {
        const dir = await emu.getDir();
        return dir === '/home/user/documents';
      },
      hints: [
        t('Use "cd dirname" to enter a directory', 'Folosește "cd dirname" pentru a intra într-un director'),
        t('Use "cat filename" to print contents', 'Folosește "cat filename" pentru a afișa conținutul'),
      ],
      solution: 'cd documents\ncat notes.txt',
    },
    {
      description: t(
        'Create a directory called "project", then create a file "main.c" inside it with some content.',
        'Creează un director numit "project", apoi creează un fișier "main.c" în el cu ceva conținut.'
      ),
      courseRef: t('Course 1: File commands', 'Cursul 1: Comenzi fișiere'),
      files: {},
      welcomeMessage: t('Create project/main.c with content', 'Creează project/main.c cu conținut'),
      checkFn: async (emu) => {
        try {
          const content = await emu.read('/home/user/project/main.c');
          return content && content.length > 0;
        } catch { return false; }
      },
      hints: [
        t('"mkdir dirname" creates a directory', '"mkdir dirname" creează un director'),
        t('"echo text > file" writes text to a file', '"echo text > file" scrie text într-un fișier'),
      ],
      solution: 'mkdir project\ncd project\necho #include <stdio.h> > main.c',
    },
    {
      description: t(
        'Use grep to find all lines containing "error" in the log file, then count the total lines with wc.',
        'Folosește grep pentru a găsi toate liniile ce conțin "error" în fișierul log, apoi numără totalul de linii cu wc.'
      ),
      courseRef: t('Course 1: File processing', 'Cursul 1: Procesare fișiere'),
      files: {
        '/home/user/server.log': 'INFO: Server started on port 8080\nERROR: Connection refused from 192.168.1.5\nINFO: Request received from 10.0.0.1\nerror: failed to parse JSON body\nINFO: Response sent 200 OK\nERROR: Disk space running low\nINFO: Backup completed successfully\nerror: timeout waiting for database\nINFO: Server shutting down gracefully',
      },
      welcomeMessage: t('Find "error" lines in server.log', 'Găsește liniile cu "error" în server.log'),
      hints: [
        t('"grep pattern file" searches for matches', '"grep pattern file" caută potriviri'),
        t('"wc file" counts lines, words, and chars', '"wc file" numără linii, cuvinte și caractere'),
      ],
      solution: 'grep error server.log\nwc server.log',
    },
    {
      description: t(
        'List files in src/, read the Makefile, then remove the "temp" directory and its contents.',
        'Listează fișierele din src/, citește Makefile-ul, apoi șterge directorul "temp" cu tot conținutul.'
      ),
      courseRef: t('Course 1: Directory & file commands', 'Cursul 1: Comenzi directoare & fișiere'),
      files: {
        '/home/user/src': null,
        '/home/user/src/main.c': '#include <stdio.h>\nint main() { return 0; }',
        '/home/user/src/utils.h': '#ifndef UTILS_H\n#define UTILS_H\nvoid helper();\n#endif',
        '/home/user/src/Makefile': 'CC=gcc\nCFLAGS=-Wall -g\n\nall: main\n\nmain: main.c\n\t$(CC) $(CFLAGS) -o main main.c\n\nclean:\n\trm -f main',
        '/home/user/temp': null,
        '/home/user/temp/scratch.txt': 'temporary data',
      },
      welcomeMessage: t('Explore src/, read Makefile, remove temp/', 'Explorează src/, citește Makefile, șterge temp/'),
      checkFn: async (emu) => {
        try {
          await emu.stat('/home/user/temp');
          return false;
        } catch { return true; }
      },
      hints: [
        t('"ls dir/" lists directory contents', '"ls dir/" listează conținutul directorului'),
        t('"rm -r dir" removes a directory recursively', '"rm -r dir" șterge un director recursiv'),
      ],
      solution: 'ls src/\ncat src/Makefile\nrm -r temp',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{t('Practice Problems', 'Probleme de practică')}</h2>
      <p className="text-sm opacity-70 mb-6">{t('Test your understanding with quizzes and coding challenges.', 'Testează-ți cunoștințele cu quiz-uri și provocări de programare.')}</p>

      <h3 className="text-lg font-bold mb-4">{t('Multiple Choice', 'Răspunsuri multiple')}</h3>
      <MultipleChoice questions={mcQuestions} />

      <h3 className="text-lg font-bold mt-10 mb-4">{t('Coding Challenges', 'Provocări de programare')}</h3>
      <p className="text-sm opacity-60 mb-6">{t('Write C code, run it, and check your answer against the expected output.', 'Scrie cod C, rulează-l și verifică răspunsul față de output-ul așteptat.')}</p>

      <CodeChallenge
        description={t('1. Write a program that prints "Hello, World!" followed by a newline.', '1. Scrieți un program care afișează "Hello, World!" urmat de o linie nouă.')}
        starterCode={`#include <stdio.h>\n\nint main() {\n    // Your code here\n\n    return 0;\n}`}
        expectedOutput="Hello, World!"
        solution={`#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`}
      />

      <CodeChallenge
        description={t('2. Write a program that reads an integer from stdin and prints its square.', '2. Scrieți un program care citește un întreg de la stdin și afișează pătratul său.')}
        starterCode={`#include <stdio.h>\n\nint main() {\n    int n;\n    // Read n from stdin, print n*n\n\n    return 0;\n}`}
        stdin="7"
        expectedOutput="49"
        solution={`#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%d\\n", n * n);\n    return 0;\n}`}
      />

      <CodeChallenge
        description={t('3. Write a program that prints numbers 1 to 10, each on a new line.', '3. Scrieți un program care afișează numerele de la 1 la 10, fiecare pe o linie nouă.')}
        starterCode={`#include <stdio.h>\n\nint main() {\n    // Print 1 through 10\n\n    return 0;\n}`}
        expectedOutput={"1\n2\n3\n4\n5\n6\n7\n8\n9\n10"}
        solution={`#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 10; i++) {\n        printf("%d\\n", i);\n    }\n    return 0;\n}`}
      />

      <CodeChallenge
        description={t('4. Write a program using fork() that prints "child" then "parent" (use wait).', '4. Scrieți un program folosind fork() care afișează "child" apoi "parent" (folosiți wait).')}
        starterCode={`#include <stdio.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\nint main() {\n    // Use fork(), print "parent" and "child"\n\n    return 0;\n}`}
        expectedOutput={"child\nparent"}
        solution={`#include <stdio.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\nint main() {\n    pid_t pid = fork();\n    if (pid == 0) {\n        printf("child\\n");\n    } else {\n        wait(NULL);\n        printf("parent\\n");\n    }\n    return 0;\n}`}
      />

      <CodeChallenge
        description={t('5. Open "test.txt", write "Hello File", read it back and print. (POSIX I/O)', '5. Deschideți "test.txt", scrieți "Hello File", citiți înapoi și afișați. (I/O POSIX)')}
        starterCode={`#include <stdio.h>\n#include <unistd.h>\n#include <fcntl.h>\n#include <string.h>\n\nint main() {\n    // Open, write, read back, print\n\n    return 0;\n}`}
        expectedOutput="Hello File"
        solution={`#include <stdio.h>\n#include <unistd.h>\n#include <fcntl.h>\n#include <string.h>\n\nint main() {\n    int fd = open("test.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);\n    write(fd, "Hello File", 10);\n    close(fd);\n\n    char buf[64];\n    fd = open("test.txt", O_RDONLY);\n    int n = read(fd, buf, sizeof(buf));\n    close(fd);\n\n    write(STDOUT_FILENO, buf, n);\n    printf("\\n");\n    return 0;\n}`}
      />

      <h3 className="text-lg font-bold mt-10 mb-4">{t('Terminal Challenges', 'Provocări de terminal')}</h3>
      <p className="text-sm opacity-60 mb-6">{t('Use "Try It" to experiment in a real Linux terminal, then "Submit Answer" to auto-check.', 'Folosește "Încearcă" pentru a experimenta într-un terminal Linux real, apoi "Trimite răspunsul" pentru verificare automată.')}</p>

      <TerminalChallenge exercises={terminalExercises} />
    </div>
  );
}
