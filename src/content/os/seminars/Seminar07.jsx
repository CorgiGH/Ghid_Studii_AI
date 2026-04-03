import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Seminar07() {
  const { t, checked, toggleCheck } = useApp();
  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Week 7 — Solved Exercises: Pipes, FIFOs & Signals', 'Săptămâna 7 — Exerciții rezolvate: Pipes, FIFO-uri și Signals')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Anonymous pipes: pipe(), dup2(), implementing pipelines', 'Pipe-uri anonime: pipe(), dup2(), implementarea pipeline-urilor')}</li>
          <li>{t('Named pipes (FIFOs): mkfifo(), IPC between unrelated processes', 'Pipe-uri cu nume (FIFO-uri): mkfifo(), IPC între procese neînrudite')}</li>
          <li>{t('POSIX signals: signal(), sigaction(), kill(), raise()', 'POSIX signals: signal(), sigaction(), kill(), raise()')}</li>
        </ol>
      </Box>

      <Section title={t('1. Anonymous Pipe — Parent to Child', '1. Pipe anonim — Părinte către Fiu')} id="s7-pipe" checked={!!checked['s7-pipe']} onCheck={() => toggleCheck('s7-pipe')}>
        <Code>{`#include <unistd.h>
#include <stdio.h>
#include <sys/wait.h>

int main() {
    int pfd[2];
    pipe(pfd);  // pfd[0]=read end, pfd[1]=write end

    pid_t pid = fork();
    if (pid == 0) {
        // CHILD: reads from pipe
        close(pfd[1]);  // close unused write end!
        char buf[256];
        int n = read(pfd[0], buf, sizeof(buf));
        buf[n] = '\\0';
        printf("Child received: %s\\n", buf);
        close(pfd[0]);
        exit(0);
    }
    // PARENT: writes to pipe
    close(pfd[0]);  // close unused read end!
    write(pfd[1], "Hello from parent", 17);
    close(pfd[1]);  // signals EOF to child
    wait(NULL);
    return 0;
}`}</Code>
        <Box type="warning">
          <p className="font-bold">{t('Always close unused pipe ends!', 'Închideți întotdeauna capetele neutilizate ale pipe-ului!')}</p>
          <p className="text-sm">{t('If the reader keeps the write end open, read() will never return EOF (blocks forever). If the writer keeps the read end open, the kernel won\'t send SIGPIPE on write to a broken pipe.', 'Dacă cititorul păstrează capătul de scriere deschis, read() nu va returna niciodată EOF (blochează la infinit). Dacă scriitorul păstrează capătul de citire deschis, kernel-ul nu va trimite SIGPIPE la scrierea pe un pipe rupt.')}</p>
        </Box>
      </Section>

      <Section title={t('2. Implementing cmd1 | cmd2', '2. Implementarea cmd1 | cmd2')} id="s7-pipeline" checked={!!checked['s7-pipeline']} onCheck={() => toggleCheck('s7-pipeline')}>
        <Code>{`int pfd[2];
pipe(pfd);

pid_t pid1 = fork();
if (pid1 == 0) {
    // Child 1: runs cmd1, stdout → pipe
    close(pfd[0]);
    dup2(pfd[1], STDOUT_FILENO);
    close(pfd[1]);
    execlp("ls", "ls", "-la", NULL);
    exit(1);
}

pid_t pid2 = fork();
if (pid2 == 0) {
    // Child 2: runs cmd2, stdin ← pipe
    close(pfd[1]);
    dup2(pfd[0], STDIN_FILENO);
    close(pfd[0]);
    execlp("grep", "grep", ".c", NULL);
    exit(1);
}

// Parent: close both ends, wait for both children
close(pfd[0]); close(pfd[1]);
wait(NULL); wait(NULL);`}</Code>
        <Box type="theorem">
          <p>{t('Pattern: pipe() BEFORE fork(). Parent closes both ends. Each child closes the end it doesn\'t use, dup2() the other end to stdin/stdout, then exec().', 'Pattern: pipe() ÎNAINTE de fork(). Părintele închide ambele capete. Fiecare fiu închide capătul pe care nu-l folosește, dup2() celălalt capăt la stdin/stdout, apoi exec().')}</p>
        </Box>
      </Section>

      <Section title={t('3. Named Pipes (FIFOs)', '3. Pipe-uri cu nume (FIFO-uri)')} id="s7-fifo" checked={!!checked['s7-fifo']} onCheck={() => toggleCheck('s7-fifo')}>
        <Code>{`// WRITER process:
#include <fcntl.h>
#include <sys/stat.h>
mkfifo("/tmp/myfifo", 0666);  // create the FIFO
int fd = open("/tmp/myfifo", O_WRONLY);  // blocks until reader opens!
write(fd, "Hello via FIFO", 14);
close(fd);

// READER process (separate program):
int fd = open("/tmp/myfifo", O_RDONLY);  // blocks until writer opens!
char buf[256];
int n = read(fd, buf, sizeof(buf));
buf[n] = '\\0';
printf("Received: %s\\n", buf);
close(fd);`}</Code>
        <Box type="definition">
          <p className="font-bold">{t('FIFO vs anonymous pipe:', 'FIFO vs pipe anonim:')}</p>
          <ul className="list-disc pl-5 text-sm">
            <li>{t('FIFO has a name in the filesystem → unrelated processes can use it', 'FIFO are un nume în filesystem → procese neînrudite îl pot folosi')}</li>
            <li>{t('open() blocks until BOTH ends are opened (reader + writer must rendezvous)', 'open() blochează până când AMBELE capete sunt deschise (cititorul + scriitorul trebuie să se întâlnească)')}</li>
            <li>{t('Data is NOT persistent — stored in kernel RAM only', 'Datele NU sunt persistente — stocate doar în RAM-ul kernel-ului')}</li>
          </ul>
        </Box>
      </Section>

      <Section title={t('4. Signal Handling', '4. Tratarea signals')} id="s7-signals" checked={!!checked['s7-signals']} onCheck={() => toggleCheck('s7-signals')}>
        <Code>{`#include <signal.h>
#include <stdio.h>
#include <unistd.h>

volatile sig_atomic_t got_signal = 0;

void handler(int sig) {
    // ONLY async-signal-safe functions here!
    // NO printf, malloc, etc.
    got_signal = 1;
}

int main() {
    struct sigaction sa;
    sa.sa_handler = handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = 0;
    sigaction(SIGUSR1, &sa, NULL);

    printf("PID: %d. Send me SIGUSR1!\\n", getpid());
    while (!got_signal)
        pause();  // sleep until signal arrives

    printf("Got SIGUSR1!\\n");
    return 0;
}
// Test: kill -USR1 <pid>`}</Code>
        <Box type="warning">
          <p className="font-bold">{t('Signal handler safety:', 'Siguranța signal handler-elor:')}</p>
          <p className="text-sm">{t('Only use async-signal-safe functions in handlers (write(), _exit(), sig_atomic_t assignments). NO printf, malloc, or any function that uses internal locks/buffers.', 'Folosiți doar funcții async-signal-safe în handlers (write(), _exit(), atribuiri sig_atomic_t). FĂRĂ printf, malloc sau orice funcție care folosește locks/buffere interne.')}</p>
        </Box>
      </Section>

      <Section title={t('5. Blocking Signals', '5. Blocarea signals')} id="s7-block" checked={!!checked['s7-block']} onCheck={() => toggleCheck('s7-block')}>
        <Code>{`sigset_t mask, old;
sigemptyset(&mask);
sigaddset(&mask, SIGINT);

// Block SIGINT during critical section
sigprocmask(SIG_BLOCK, &mask, &old);
// ... critical section (SIGINT queued, not lost) ...
sigprocmask(SIG_SETMASK, &old, NULL);  // restore, deliver queued`}</Code>
        <Box type="theorem">
          <p>{t('Blocking ≠ ignoring! Blocked signals are queued and delivered when unblocked. Ignored signals (SIG_IGN) are discarded permanently.', 'Blocarea ≠ ignorarea! Signal-ele blocate sunt puse în coadă și livrate când sunt deblocate. Signal-ele ignorate (SIG_IGN) sunt eliminate permanent.')}</p>
        </Box>
      </Section>
    </>
  );
}
