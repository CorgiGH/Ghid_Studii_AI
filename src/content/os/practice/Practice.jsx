import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import MultipleChoice from '../../../components/ui/MultipleChoice';
import CodeChallenge from '../../../components/ui/CodeChallenge';
import TerminalChallenge from '../../../components/ui/TerminalChallenge';

const mcQuestions = [
  {
    question: { en: 'Which system call creates a new process?', ro: 'Ce apel de sistem creează un proces nou?' },
    options: [
      { text: 'exec()', correct: false, feedback: { en: 'exec() replaces the current process image with a new program — it does NOT create a new process.', ro: 'exec() înlocuiește imaginea procesului curent cu un program nou — NU creează un proces nou.' } },
      { text: 'fork()', correct: true },
      { text: 'clone()', correct: false, feedback: { en: 'clone() is a lower-level Linux-specific syscall that fork() wraps. The portable POSIX answer is fork().', ro: 'clone() este un apel de sistem Linux de nivel inferior pe care fork() îl folosește intern. Răspunsul POSIX portabil este fork().' } },
      { text: 'spawn()', correct: false, feedback: { en: 'spawn() is a Windows API concept, not POSIX. POSIX creates processes via fork().', ro: 'spawn() este un concept Windows API, nu POSIX. POSIX creează procese prin fork().' } },
    ],
    explanation: { en: 'fork() creates a child process by duplicating the calling process. exec() replaces the current process image.', ro: 'fork() creează un proces copil prin duplicarea procesului apelant. exec() înlocuiește imaginea procesului curent.' },
  },
  {
    question: { en: 'What does chmod 755 mean?', ro: 'Ce înseamnă chmod 755?' },
    options: [
      { text: 'rwxr-xr-x', correct: true },
      { text: 'rwxrwxrwx', correct: false, feedback: { en: 'rwxrwxrwx = 777, not 755. You may be reading the digits as bit counts rather than rwx triples.', ro: 'rwxrwxrwx = 777, nu 755. Poate confunzi cifrele cu numere de biți în loc de triple rwx.' } },
      { text: 'rw-r--r--', correct: false, feedback: { en: 'rw-r--r-- = 644. You may be thinking of default file permissions, but 755 includes execute (x=1) for owner, group, and others.', ro: 'rw-r--r-- = 644. Poate te gândești la permisiunile implicite de fișier, dar 755 include execute (x=1) pentru proprietar, grup și alții.' } },
      { text: 'rwx------', correct: false, feedback: { en: 'rwx------ = 700 (only owner). 755 gives read+execute to group and others as well.', ro: 'rwx------ = 700 (doar proprietar). 755 oferă read+execute și grupului și celorlalți.' } },
    ],
    explanation: { en: '7=rwx (owner), 5=r-x (group), 5=r-x (others). Each digit is the sum: r=4, w=2, x=1.', ro: '7=rwx (proprietar), 5=r-x (grup), 5=r-x (alții). Fiecare cifră este suma: r=4, w=2, x=1.' },
  },
  {
    question: { en: 'What happens when fork() succeeds?', ro: 'Ce se întâmplă când fork() reușește?' },
    options: [
      { text: 'Returns 0 to both processes', correct: false, feedback: { en: 'If both received 0, they couldn\'t distinguish themselves. fork() returns different values so each process knows its role.', ro: 'Dacă ambele ar primi 0, nu s-ar putea distinge. fork() returnează valori diferite ca fiecare proces să-și cunoască rolul.' } },
      { text: 'Returns child PID to parent, 0 to child', correct: true },
      { text: 'Returns 1 to parent, -1 to child', correct: false, feedback: { en: '-1 means failure in POSIX. Success returns the actual child PID to parent and 0 to child.', ro: '-1 înseamnă eșec în POSIX. Succes returnează PID-ul copilului părintelui și 0 copilului.' } },
      { text: 'Returns PID to both processes', correct: false, feedback: { en: 'Only the parent gets the child\'s PID. The child gets 0 — this asymmetry lets the code branch.', ro: 'Doar părintele primește PID-ul copilului. Copilul primește 0 — această asimetrie permite ramificarea codului.' } },
    ],
    explanation: { en: 'fork() returns the child PID to the parent process and 0 to the child. On failure, it returns -1.', ro: 'fork() returnează PID-ul copilului procesului părinte și 0 procesului copil. La eșec, returnează -1.' },
  },
  {
    question: { en: 'Which command shows all running processes?', ro: 'Ce comandă afișează toate procesele care rulează?' },
    options: [
      { text: 'ls -a', correct: false, feedback: { en: 'ls -a lists files (including hidden ones), not processes. You may be confusing process listing with file listing.', ro: 'ls -a listează fișiere (inclusiv ascunse), nu procese. Poate confunzi listarea proceselor cu listarea fișierelor.' } },
      { text: 'ps aux', correct: true },
      { text: 'top -p', correct: false, feedback: { en: 'top shows live process data but "-p" filters by PID. Just "top" works interactively; "ps aux" gives a one-shot listing.', ro: 'top afișează date live despre procese dar "-p" filtrează după PID. Doar "top" funcționează interactiv; "ps aux" dă o listare one-shot.' } },
      { text: 'cat /proc', correct: false, feedback: { en: '/proc is a directory, not a file — cat alone won\'t work. Process info is under /proc/<pid>/, but ps reads and formats it for you.', ro: '/proc este director, nu fișier — cat singur nu funcționează. Info despre procese sunt în /proc/<pid>/, dar ps le citește și formatează pentru tine.' } },
    ],
    explanation: { en: 'ps aux shows all processes for all users with detailed information.', ro: 'ps aux afișează toate procesele pentru toți utilizatorii cu informații detaliate.' },
  },
  {
    question: { en: 'What does a pipe (|) do in the shell?', ro: 'Ce face un pipe (|) în shell?' },
    options: [
      { text: 'Redirects output to a file', correct: false, feedback: { en: 'That\'s what > does. Pipe (|) connects one command to ANOTHER command, not to a file.', ro: 'Asta face >. Pipe (|) conectează o comandă la ALTĂ comandă, nu la un fișier.' } },
      { text: 'Connects stdout of one command to stdin of another', correct: true },
      { text: 'Runs two commands in parallel', correct: false, feedback: { en: 'Pipe actually runs commands concurrently AND connects them (stdout → stdin). Parallel execution without coupling uses & or wait.', ro: 'Pipe rulează comenzile concomitent DAR le și conectează (stdout → stdin). Execuția paralelă fără cuplare folosește & sau wait.' } },
      { text: 'Sends a signal to a process', correct: false, feedback: { en: 'That\'s what kill does. Pipe only connects data streams between processes.', ro: 'Asta face kill. Pipe doar conectează fluxuri de date între procese.' } },
    ],
    explanation: { en: 'The pipe operator connects the standard output of the left command to the standard input of the right command.', ro: 'Operatorul pipe conectează ieșirea standard a comenzii din stânga la intrarea standard a comenzii din dreapta.' },
  },
];

export default function Practice() {
  const { t } = useApp();

  const terminalExercises = [
    {
      description: t(
        'Navigate to "documents", read "notes.txt" with cat, and save a copy as ~/backup.txt.',
        'Navighează în "documents", citește "notes.txt" cu cat, și salvează o copie ca ~/backup.txt.'
      ),
      courseRef: t('Course 1: Directory commands', 'Cursul 1: Comenzi directoare'),
      files: {
        '/root/documents': null,
        '/root/documents/notes.txt': 'Operating systems manage hardware resources.\nThe kernel is the core of the OS.\nProcesses are instances of running programs.',
        '/root/documents/readme.md': '# My Project\nThis is a sample project.',
        '/root/pictures': null,
        '/root/music': null,
      },
      checkScript: 'test -f /root/backup.txt && diff /root/documents/notes.txt /root/backup.txt > /dev/null 2>&1',
      failureHint: (t) => t('Make sure ~/backup.txt exists and matches notes.txt. Try: cp documents/notes.txt ~/backup.txt', 'Asigură-te că ~/backup.txt există și se potrivește cu notes.txt. Încearcă: cp documents/notes.txt ~/backup.txt'),
      hints: [
        t('Use "cd dirname" to enter a directory', 'Folosește "cd dirname" pentru a intra într-un director'),
        t('Use "cat filename" to print contents', 'Folosește "cat filename" pentru a afișa conținutul'),
        t('Use "cp source dest" to copy a file', 'Folosește "cp sursă dest" pentru a copia un fișier'),
      ],
      solution: 'cd documents\ncat notes.txt\ncp notes.txt ~/backup.txt',
    },
    {
      description: t(
        'Create a directory called "project", then create a file "main.c" inside it with some content.',
        'Creează un director numit "project", apoi creează un fișier "main.c" în el cu ceva conținut.'
      ),
      courseRef: t('Course 1: File commands', 'Cursul 1: Comenzi fișiere'),
      files: {},
      checkScript: 'test -f /root/project/main.c && test -s /root/project/main.c',
      hints: [
        t('"mkdir dirname" creates a directory', '"mkdir dirname" creează un director'),
        t('"echo text > file" writes text to a file', '"echo text > file" scrie text într-un fișier'),
      ],
      solution: 'mkdir project\ncd project\necho "#include <stdio.h>" > main.c',
    },
    {
      description: t(
        'Save all "error" lines (case-insensitive) from server.log to errors.txt. Then save the total line count of server.log to total.txt.',
        'Salvează toate liniile cu "error" (fără a ține cont de litere mari/mici) din server.log în errors.txt. Apoi salvează numărul total de linii din server.log în total.txt.'
      ),
      courseRef: t('Course 1: File processing', 'Cursul 1: Procesare fișiere'),
      files: {
        '/root/server.log': 'INFO: Server started on port 8080\nERROR: Connection refused from 192.168.1.5\nINFO: Request received from 10.0.0.1\nerror: failed to parse JSON body\nINFO: Response sent 200 OK\nERROR: Disk space running low\nINFO: Backup completed successfully\nerror: timeout waiting for database\nINFO: Server shutting down gracefully\n',
      },
      checkScript: 'test -f /root/errors.txt && test "$(grep -c . /root/errors.txt)" = "4" && test -f /root/total.txt && test "$(grep -oE "[0-9]+" /root/total.txt | head -1)" = "9"',
      failureHint: (t) => t('errors.txt should have 4 lines (one per error). total.txt should contain just the number 9.', 'errors.txt trebuie să aibă 4 linii (câte una pentru fiecare eroare). total.txt trebuie să conțină doar numărul 9.'),
      hints: [
        t('"grep -i pattern file" searches case-insensitively', '"grep -i pattern file" caută fără a ține cont de litere mari/mici'),
        t('Redirect output with > filename.txt', 'Redirectează output-ul cu > fisier.txt'),
        t('"wc -l file" counts just lines', '"wc -l file" numără doar liniile'),
      ],
      solution: 'grep -i error server.log > errors.txt\nwc -l < server.log > total.txt',
    },
    {
      description: t(
        'List files in src/, read the Makefile, then remove the "temp" directory and its contents.',
        'Listează fișierele din src/, citește Makefile-ul, apoi șterge directorul "temp" cu tot conținutul.'
      ),
      courseRef: t('Course 1: Directory & file commands', 'Cursul 1: Comenzi directoare & fișiere'),
      files: {
        '/root/src': null,
        '/root/src/main.c': '#include <stdio.h>\nint main() { return 0; }',
        '/root/src/utils.h': '#ifndef UTILS_H\n#define UTILS_H\nvoid helper();\n#endif',
        '/root/src/Makefile': 'CC=gcc\nCFLAGS=-Wall -g\n\nall: main\n\nmain: main.c\n\t$(CC) $(CFLAGS) -o main main.c\n\nclean:\n\trm -f main',
        '/root/temp': null,
        '/root/temp/scratch.txt': 'temporary data',
      },
      checkScript: '! test -d /root/temp',
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

      {/* Trace-before-write: predict fork() behavior before implementing it */}
      <div className="border rounded-lg p-4 mb-4" style={{ borderColor: 'var(--theme-border)', background: 'color-mix(in srgb, var(--theme-content-bg), #3b82f6 3%)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--theme-muted)' }}>
          {t('Before writing: trace this', 'Înainte de a scrie: trasează acest cod')}
        </p>
        <MultipleChoice questions={[{
          question: {
            en: 'Given: pid_t pid = fork(); if (pid == 0) printf("A"); else printf("B"); — what prints after fork() succeeds?',
            ro: 'Dat fiind: pid_t pid = fork(); if (pid == 0) printf("A"); else printf("B"); — ce se afișează după ce fork() reușește?'
          },
          options: [
            { text: { en: 'Just "A"', ro: 'Doar "A"' }, correct: false, feedback: { en: 'fork() creates BOTH a parent and a child. Both continue executing from the fork() call.', ro: 'fork() creează ATÂT un părinte cât și un copil. Ambele continuă execuția de la apelul fork().' } },
            { text: { en: 'Just "B"', ro: 'Doar "B"' }, correct: false, feedback: { en: 'Both processes execute. The child sees pid==0 (A), parent sees pid==child\'s PID (B).', ro: 'Ambele procese execută. Copilul vede pid==0 (A), părintele vede pid==PID-ul copilului (B).' } },
            { text: { en: 'Both "A" and "B" (in some order)', ro: 'Atât "A" cât și "B" (în vreo ordine)' }, correct: true },
            { text: { en: 'Nothing, because fork() doesn\'t return', ro: 'Nimic, deoarece fork() nu returnează' } , correct: false, feedback: { en: 'fork() does return — it returns to BOTH processes with different values (0 to child, child PID to parent).', ro: 'fork() returnează — returnează la AMBELE procese cu valori diferite (0 copilului, PID-ul copilului părintelui).' } },
          ],
          explanation: { en: 'After fork() succeeds, both parent and child continue past the call. The child receives 0, the parent receives the child\'s PID — so both branches of the if execute, once per process.', ro: 'După ce fork() reușește, atât părintele cât și copilul continuă după apel. Copilul primește 0, părintele primește PID-ul copilului — deci ambele ramuri ale if se execută, câte una pe proces.' },
        }]} />
      </div>

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
      <p className="text-sm opacity-60 mb-6">{t('Practice in the real Linux terminal below. Click "Check" to verify your solution.', 'Exersați în terminalul Linux real de mai jos. Apăsați "Verifică" pentru a valida soluția.')}</p>

      <TerminalChallenge exercises={terminalExercises} />
    </div>
  );
}
