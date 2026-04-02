import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import MultipleChoice from '../../../components/ui/MultipleChoice';
import CodeChallenge from '../../../components/ui/CodeChallenge';

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
    question: { en: 'What does a pipe (|) do in the shell?', ro: 'Ce face o conductă (|) în shell?' },
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{t('Practice Problems', 'Probleme de practică')}</h2>
      <p className="text-sm opacity-70 mb-6">{t('Test your understanding with quizzes and coding challenges.', 'Testează-ți cunoștințele cu quiz-uri și provocări de programare.')}</p>

      <h3 className="text-lg font-bold mb-4">{t('Multiple Choice', 'Răspunsuri multiple')}</h3>
      <MultipleChoice questions={mcQuestions} />

      <h3 className="text-lg font-bold mt-10 mb-4">{t('Coding Challenges', 'Provocări de programare')}</h3>
      <p className="text-sm opacity-60 mb-6">{t('Write C code, run it, and check your answer against the expected output.', 'Scrie cod C, rulează-l și verifică răspunsul față de output-ul așteptat.')}</p>

      <CodeChallenge
        description={t(
          '1. Write a program that prints "Hello, World!" followed by a newline.',
          '1. Scrieți un program care afișează "Hello, World!" urmat de o linie nouă.'
        )}
        starterCode={`#include <stdio.h>

int main() {
    // Your code here

    return 0;
}`}
        expectedOutput="Hello, World!"
        solution={`#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`}
      />

      <CodeChallenge
        description={t(
          '2. Write a program that reads an integer from stdin and prints its square.',
          '2. Scrieți un program care citește un întreg de la stdin și afișează pătratul său.'
        )}
        starterCode={`#include <stdio.h>

int main() {
    int n;
    // Read n from stdin, print n*n

    return 0;
}`}
        stdin="7"
        expectedOutput="49"
        solution={`#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\\n", n * n);
    return 0;
}`}
      />

      <CodeChallenge
        description={t(
          '3. Write a program that prints numbers 1 to 10, each on a new line.',
          '3. Scrieți un program care afișează numerele de la 1 la 10, fiecare pe o linie nouă.'
        )}
        starterCode={`#include <stdio.h>

int main() {
    // Print 1 through 10

    return 0;
}`}
        expectedOutput={"1\n2\n3\n4\n5\n6\n7\n8\n9\n10"}
        solution={`#include <stdio.h>

int main() {
    for (int i = 1; i <= 10; i++) {
        printf("%d\\n", i);
    }
    return 0;
}`}
      />

      <CodeChallenge
        description={t(
          '4. Write a program using fork() that prints "parent" in the parent process and "child" in the child process. Parent should print first (use wait).',
          '4. Scrieți un program folosind fork() care afișează "parent" în procesul părinte și "child" în procesul copil. Părintele trebuie să afișeze primul (folosiți wait).'
        )}
        starterCode={`#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    // Use fork(), print "parent" and "child"

    return 0;
}`}
        expectedOutput={"child\nparent"}
        solution={`#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork();
    if (pid == 0) {
        printf("child\\n");
    } else {
        wait(NULL);
        printf("parent\\n");
    }
    return 0;
}`}
      />

      <CodeChallenge
        description={t(
          '5. Write a program that opens a file "test.txt", writes "Hello File" to it, then reads it back and prints the contents. (Hint: use POSIX open/write/read/close)',
          '5. Scrieți un program care deschide fișierul "test.txt", scrie "Hello File" în el, apoi îl citește înapoi și afișează conținutul. (Indiciu: folosiți open/write/read/close POSIX)'
        )}
        starterCode={`#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>

int main() {
    // Open, write, read back, print

    return 0;
}`}
        expectedOutput="Hello File"
        solution={`#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>

int main() {
    int fd = open("test.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    write(fd, "Hello File", 10);
    close(fd);

    char buf[64];
    fd = open("test.txt", O_RDONLY);
    int n = read(fd, buf, sizeof(buf));
    close(fd);

    write(STDOUT_FILENO, buf, n);
    printf("\\n");
    return 0;
}`}
      />
    </div>
  );
}
