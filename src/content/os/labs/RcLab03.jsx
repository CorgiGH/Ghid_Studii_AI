import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function RcLab03() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: RC - Lab #3, UAIC — Pipes and FIFO in UNIX/Linux',
          'Sursa: RC - Laborator #3, UAIC — Pipes si FIFO in UNIX/Linux'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('RC Lab #3: Pipes and FIFO', 'RC Laborator #3: Pipes si FIFO')}
        </p>
        <p className="text-sm">
          {t(
            'This lab covers IPC via anonymous pipes (pipe()) and named pipes (FIFO). Topics include pipe(), dup()/dup2(), mkfifo(), and building shell-style pipelines.',
            'Acest laborator acopera IPC prin pipe-uri anonime (pipe()) si pipe-uri cu nume (FIFO). Subiectele includ pipe(), dup()/dup2(), mkfifo() si construirea de pipeline-uri in stil shell.'
          )}
        </p>
      </Box>

      <h3 className="text-lg font-bold mt-6 mb-3">
        {t('1. Anonymous Pipes', '1. Pipe-uri anonime')}
      </h3>

      <Section
        title={t('pipe() — unidirectional data channel', 'pipe() — canal unidirectional de date')}
        id="rc_lab3-pipe"
        checked={!!checked['rc_lab3-pipe']}
        onCheck={() => toggleCheck('rc_lab3-pipe')}
      >
        <p className="mb-2 text-sm">
          {t(
            'pipe() creates a pair of file descriptors: fd[0] for reading and fd[1] for writing. Data written to fd[1] can be read from fd[0]. Only processes that share a common ancestor (related processes) can use an anonymous pipe.',
            'pipe() creeaza o pereche de descriptori de fisier: fd[0] pentru citire si fd[1] pentru scriere. Datele scrise in fd[1] pot fi citite din fd[0]. Doar procesele care au un stramos comun (procese inrudite) pot folosi un pipe anonim.'
          )}
        </p>
        <Box type="warning">
          <p className="text-sm">
            {t(
              'Always close the unused end of the pipe in each process. If the write end is open in the reader, read() will never return EOF. If the read end is open in the writer, writing to a full pipe will block instead of generating SIGPIPE.',
              'Inchideti intotdeauna capatul nefolosit al pipe-ului in fiecare proces. Daca capatul de scriere este deschis in cititor, read() nu va returna niciodata EOF. Daca capatul de citire este deschis in scriitor, scrierea intr-un pipe plin va bloca in loc sa genereze SIGPIPE.'
            )}
          </p>
        </Box>
        <Code>{`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    int fd[2];
    pid_t pid;
    char msg[] = "Hello from parent";
    char buf[64];

    if (pipe(fd) < 0) { perror("pipe"); exit(1); }

    pid = fork();
    if (pid < 0) { perror("fork"); exit(1); }

    if (pid == 0) {
        // Child: reader
        close(fd[1]);         // close write end
        read(fd[0], buf, sizeof(buf));
        printf("Child received: %s\\n", buf);
        close(fd[0]);
        exit(0);
    } else {
        // Parent: writer
        close(fd[0]);         // close read end
        write(fd[1], msg, strlen(msg) + 1);
        close(fd[1]);         // EOF for reader
        wait(NULL);
    }
    return 0;
}`}</Code>
      </Section>

      <Section
        title={t('dup() and dup2() — file descriptor redirection', 'dup() si dup2() — redirectarea descriptorilor de fisier')}
        id="rc_lab3-dup"
        checked={!!checked['rc_lab3-dup']}
        onCheck={() => toggleCheck('rc_lab3-dup')}
      >
        <p className="mb-2 text-sm">
          {t(
            'dup() duplicates a file descriptor to the lowest available number. dup2(oldfd, newfd) duplicates oldfd to exactly newfd, closing newfd first if open. This is how shell pipelines connect stdout of one program to stdin of the next.',
            'dup() duplica un descriptor de fisier la cel mai mic numar disponibil. dup2(oldfd, newfd) duplica oldfd exact la newfd, inchizand mai intai newfd daca este deschis. Astfel conecteaza shell-ul stdout-ul unui program cu stdin-ul urmatorului.'
          )}
        </p>
        <Code>{`// Redirect stdout to pipe write-end (child becomes "writer to pipe")
// Then exec a program — its printf goes into the pipe

if (pid == 0) {
    // Connect stdout -> pipe write end
    dup2(fd[1], STDOUT_FILENO);
    close(fd[0]);
    close(fd[1]);  // original fd[1] no longer needed
    execlp("ls", "ls", "-l", NULL);
    perror("exec"); exit(1);
}

// Connect stdin -> pipe read end (this process reads ls output)
dup2(fd[0], STDIN_FILENO);
close(fd[0]);
close(fd[1]);
execlp("wc", "wc", "-l", NULL);
// This is how  ls -l | wc -l  works internally`}</Code>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('2. Named Pipes (FIFO)', '2. Pipe-uri cu nume (FIFO)')}
      </h3>

      <Section
        title={t('mkfifo() — named pipes for unrelated processes', 'mkfifo() — pipe-uri cu nume pentru procese nerudite')}
        id="rc_lab3-fifo"
        checked={!!checked['rc_lab3-fifo']}
        onCheck={() => toggleCheck('rc_lab3-fifo')}
      >
        <p className="mb-2 text-sm">
          {t(
            'A FIFO (named pipe) has a path in the filesystem. Any process that knows the path can open it — no parent/child relationship required. open() blocks until both a reader and a writer have opened the FIFO.',
            'Un FIFO (pipe cu nume) are o cale in sistemul de fisiere. Orice proces care cunoaste calea il poate deschide — nu este necesara o relatie parinte/copil. open() blocheaza pana cand atat un cititor cat si un scriitor au deschis FIFO-ul.'
          )}
        </p>
        <Code>{`// Create a FIFO
mkfifo("/tmp/myfifo", 0666);

// Writer process
int wfd = open("/tmp/myfifo", O_WRONLY);
write(wfd, "data", 4);
close(wfd);

// Reader process (can be a completely separate program)
int rfd = open("/tmp/myfifo", O_RDONLY);
char buf[64];
int n = read(rfd, buf, sizeof(buf));
close(rfd);

// From shell: create and use a FIFO
// mkfifo /tmp/myfifo
// echo "hello" > /tmp/myfifo &
// cat /tmp/myfifo`}</Code>
        <p className="mt-2 text-sm">
          {t(
            'FIFO vs anonymous pipe: FIFO persists in the filesystem (remove with unlink()); anonymous pipe exists only while processes share it.',
            'FIFO vs pipe anonim: FIFO persista in sistemul de fisiere (stergeti cu unlink()); pipe-ul anonim exista doar cat timp procesele il partajeaza.'
          )}
        </p>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('3. Lab Exercises', '3. Exercitii de laborator')}
      </h3>

      <Section
        title={t('Exercise 1: Parent-child communication via pipe', 'Exercitiul 1: Comunicare parinte-copil prin pipe')}
        id="rc_lab3-ex1"
        checked={!!checked['rc_lab3-ex1']}
        onCheck={() => toggleCheck('rc_lab3-ex1')}
      >
        <p className="mb-2 text-sm">
          {t(
            'The parent reads lines from stdin and writes them to a pipe. The child reads from the pipe and prints each line prefixed with "CHILD: ". Continue until the parent reads EOF (Ctrl+D).',
            'Parintele citeste linii de la stdin si le scrie intr-un pipe. Copilul citeste din pipe si afiseaza fiecare linie prefixata cu "CHILD: ". Continuati pana cand parintele citeste EOF (Ctrl+D).'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    int fd[2];
    char line[256];

    if (pipe(fd) < 0) { perror("pipe"); exit(1); }

    pid_t pid = fork();
    if (pid < 0) { perror("fork"); exit(1); }

    if (pid == 0) {
        // Child: reader
        close(fd[1]);
        FILE *in = fdopen(fd[0], "r");
        while (fgets(line, sizeof(line), in)) {
            printf("CHILD: %s", line);
        }
        fclose(in);
        exit(0);
    } else {
        // Parent: writer
        close(fd[0]);
        while (fgets(line, sizeof(line), stdin)) {
            write(fd[1], line, strlen(line));
        }
        close(fd[1]);  // EOF for child
        wait(NULL);
    }
    return 0;
}`}</Code>
          }
        />
      </Section>

      <Section
        title={t('Exercise 2: Pipeline — ls | wc -l', 'Exercitiul 2: Pipeline — ls | wc -l')}
        id="rc_lab3-ex2"
        checked={!!checked['rc_lab3-ex2']}
        onCheck={() => toggleCheck('rc_lab3-ex2')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Implement the shell pipeline "ls | wc -l" using fork(), pipe(), dup2(), and exec(). No shell is allowed — call exec directly.',
            'Implementati pipeline-ul shell "ls | wc -l" folosind fork(), pipe(), dup2() si exec(). Nu este permis shell-ul — apelati exec direct.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    int fd[2];
    if (pipe(fd) < 0) { perror("pipe"); exit(1); }

    pid_t pid1 = fork();
    if (pid1 == 0) {
        // Child 1: runs "ls"
        dup2(fd[1], STDOUT_FILENO);
        close(fd[0]); close(fd[1]);
        execlp("ls", "ls", NULL);
        perror("exec ls"); exit(1);
    }

    pid_t pid2 = fork();
    if (pid2 == 0) {
        // Child 2: runs "wc -l"
        dup2(fd[0], STDIN_FILENO);
        close(fd[0]); close(fd[1]);
        execlp("wc", "wc", "-l", NULL);
        perror("exec wc"); exit(1);
    }

    close(fd[0]); close(fd[1]);
    waitpid(pid1, NULL, 0);
    waitpid(pid2, NULL, 0);
    return 0;
}`}</Code>
          }
        />
      </Section>

      <Section
        title={t('Exercise 3: FIFO between two independent programs', 'Exercitiul 3: FIFO intre doua programe independente')}
        id="rc_lab3-ex3"
        checked={!!checked['rc_lab3-ex3']}
        onCheck={() => toggleCheck('rc_lab3-ex3')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Write two separate programs: fifo_writer and fifo_reader. The writer creates /tmp/labfifo, writes 5 numbered messages, then removes the FIFO. The reader opens /tmp/labfifo and prints each message.',
            'Scrieti doua programe separate: fifo_writer si fifo_reader. Scriitorul creeaza /tmp/labfifo, scrie 5 mesaje numerotate, apoi sterge FIFO-ul. Cititorul deschide /tmp/labfifo si afiseaza fiecare mesaj.'
          )}
        </p>
        <Toggle
          question={t('Show fifo_writer', 'Arata fifo_writer')}
          answer={
            <Code>{`// fifo_writer.c
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>

int main() {
    mkfifo("/tmp/labfifo", 0666);
    int fd = open("/tmp/labfifo", O_WRONLY);
    if (fd < 0) { perror("open"); exit(1); }

    char buf[64];
    for (int i = 1; i <= 5; i++) {
        snprintf(buf, sizeof(buf), "Message %d\\n", i);
        write(fd, buf, strlen(buf));
        sleep(1);
    }
    close(fd);
    unlink("/tmp/labfifo");
    return 0;
}`}</Code>
          }
        />
        <Toggle
          question={t('Show fifo_reader', 'Arata fifo_reader')}
          answer={
            <Code>{`// fifo_reader.c
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>

int main() {
    int fd = open("/tmp/labfifo", O_RDONLY);
    if (fd < 0) { perror("open"); exit(1); }

    char buf[64];
    int n;
    while ((n = read(fd, buf, sizeof(buf))) > 0) {
        buf[n] = '\\0';
        printf("Received: %s", buf);
    }
    close(fd);
    return 0;
}

// Run: ./fifo_reader &
//      ./fifo_writer`}</Code>
          }
        />
      </Section>
    </>
  );
}
