import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function RcLab02() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: RC - Lab #2, UAIC — Processes in UNIX/Linux',
          'Sursa: RC - Laborator #2, UAIC — Procese in UNIX/Linux'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('RC Lab #2: Processes in UNIX/Linux', 'RC Laborator #2: Procese in UNIX/Linux')}
        </p>
        <p className="text-sm">
          {t(
            'This lab covers process management: PID, process states, foreground/background execution, ps/kill commands, fork()/exec() system calls, and UNIX signals.',
            'Acest laborator acopera managementul proceselor: PID, starile proceselor, executie foreground/background, comenzile ps/kill, apelurile de sistem fork()/exec() si semnalele UNIX.'
          )}
        </p>
      </Box>

      <h3 className="text-lg font-bold mt-6 mb-3">
        {t('1. Process Concepts', '1. Concepte despre procese')}
      </h3>

      <Section
        title={t('Process definition and PID', 'Definitia procesului si PID')}
        id="rc_lab2-process-def"
        checked={!!checked['rc_lab2-process-def']}
        onCheck={() => toggleCheck('rc_lab2-process-def')}
      >
        <p className="mb-2 text-sm">
          {t(
            'A process is a program in execution — a program loaded into memory and actively running. Each process has a unique Process ID (PID).',
            'Un proces este un program in executie — un program incarcat in memorie si care ruleaza activ. Fiecare proces are un identificator unic (PID).'
          )}
        </p>
        <p className="mb-2 text-sm font-semibold">{t('Process states:', 'Starile unui proces:')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm mb-3">
          <li><strong>Running:</strong> {t('CPU is executing its instructions', 'CPU executa instructiunile sale')}</li>
          <li><strong>Ready:</strong> {t('waiting for CPU time (in run queue)', 'asteapta timp de CPU (in coada de executie)')}</li>
          <li><strong>Blocked/Waiting:</strong> {t('waiting for an event (I/O, signal)', 'asteapta un eveniment (I/O, semnal)')}</li>
          <li><strong>Zombie:</strong> {t('finished but parent has not called wait() yet', 'terminat, dar parintele nu a apelat inca wait()')}</li>
        </ul>
        <p className="mb-1 text-sm font-semibold">{t('Key identifiers:', 'Identificatori cheie:')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm">
          <li><code>getpid()</code> — {t('returns PID of current process', 'returneaza PID-ul procesului curent')}</li>
          <li><code>getppid()</code> — {t('returns PID of parent process', 'returneaza PID-ul procesului parinte')}</li>
        </ul>
      </Section>

      <Section
        title={t('Foreground and background processes; ps and kill', 'Procese foreground si background; ps si kill')}
        id="rc_lab2-fg-bg"
        checked={!!checked['rc_lab2-fg-bg']}
        onCheck={() => toggleCheck('rc_lab2-fg-bg')}
      >
        <p className="mb-2 text-sm">
          {t(
            'A foreground process occupies the terminal — the shell waits for it to finish. A background process runs independently; the shell prompt returns immediately.',
            'Un proces foreground ocupa terminalul — shell-ul asteapta sa se termine. Un proces background ruleaza independent; promptul shell revine imediat.'
          )}
        </p>
        <Code>{`# Run in background with &
sleep 60 &        # returns immediately, prints [1] <PID>
jobs              # list background jobs
fg %1             # bring job 1 to foreground
bg %1             # resume stopped job in background

# Suspend foreground process
Ctrl+Z            # sends SIGTSTP, suspends to background

# Inspect running processes
ps aux            # all processes, all users, detailed
ps -ef            # POSIX-style full listing
top               # interactive monitor

# Send signals
kill <PID>        # send SIGTERM (graceful terminate)
kill -9 <PID>     # send SIGKILL (force kill)
kill -SIGSTOP <PID>  # pause a process`}</Code>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('2. fork() and exec() System Calls', '2. Apelurile de sistem fork() si exec()')}
      </h3>

      <Section
        title={t('fork() — creating child processes', 'fork() — crearea proceselor copil')}
        id="rc_lab2-fork"
        checked={!!checked['rc_lab2-fork']}
        onCheck={() => toggleCheck('rc_lab2-fork')}
      >
        <p className="mb-2 text-sm">
          {t(
            'fork() creates a copy of the calling process. The child is nearly identical to the parent — same code, same data, same open files — but gets a new PID.',
            'fork() creeaza o copie a procesului apelant. Copilul este aproape identic cu parintele — acelasi cod, aceleasi date, aceleasi fisiere deschise — dar primeste un PID nou.'
          )}
        </p>
        <p className="mb-2 text-sm font-semibold">{t('Return value of fork():', 'Valoarea returnata de fork():')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm mb-3">
          <li><strong>{t('In parent:', 'In parinte:')}</strong> {t('PID of the child (positive integer)', 'PID-ul copilului (intreg pozitiv)')}</li>
          <li><strong>{t('In child:', 'In copil:')}</strong> 0</li>
          <li><strong>{t('On error:', 'La eroare:')}</strong> -1</li>
        </ul>
        <Code>{`#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork();

    if (pid < 0) {
        perror("fork");
        exit(1);
    } else if (pid == 0) {
        // Child process
        printf("Child: PID=%d, parent PID=%d\\n", getpid(), getppid());
        exit(0);
    } else {
        // Parent process
        printf("Parent: PID=%d, child PID=%d\\n", getpid(), pid);
        wait(NULL);  // wait for child to avoid zombie
        printf("Parent: child finished\\n");
    }
    return 0;
}`}</Code>
        <Box type="warning">
          <p className="text-sm">
            {t(
              'Always call wait() or waitpid() in the parent after fork(). If the parent exits without waiting, the child becomes a zombie process that occupies a PID slot until the init process reaps it.',
              'Apelati intotdeauna wait() sau waitpid() in parinte dupa fork(). Daca parintele iese fara sa astepte, copilul devine un proces zombie care ocupa un slot PID pana cand procesul init il colecteaza.'
            )}
          </p>
        </Box>
      </Section>

      <Section
        title={t('exec() family — replacing process image', 'Familia exec() — inlocuirea imaginii procesului')}
        id="rc_lab2-exec"
        checked={!!checked['rc_lab2-exec']}
        onCheck={() => toggleCheck('rc_lab2-exec')}
      >
        <p className="mb-2 text-sm">
          {t(
            'exec() replaces the current process image with a new program. The PID stays the same; code, data, and stack are replaced. Combined with fork(), this is how the shell launches programs.',
            'exec() inlocuieste imaginea procesului curent cu un nou program. PID-ul ramane acelasi; codul, datele si stiva sunt inlocuite. Combinat cu fork(), acesta este modul in care shell-ul lanseaza programe.'
          )}
        </p>
        <Code>{`#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main() {
    pid_t pid = fork();

    if (pid == 0) {
        // Child: replace with "ls -l"
        char *args[] = {"ls", "-l", NULL};
        execvp("ls", args);
        // If exec returns, it failed
        perror("execvp");
        exit(1);
    } else {
        wait(NULL);
        printf("ls finished\\n");
    }
    return 0;
}

/* Common exec variants:
 * execl  (path, arg0, arg1, ..., NULL)
 * execv  (path, argv[])
 * execvp (file, argv[])  -- searches PATH
 * execle (path, arg0, ..., NULL, envp[])
 */`}</Code>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('3. UNIX Signals', '3. Semnale UNIX')}
      </h3>

      <Section
        title={t('Signal concepts and common signals', 'Concepte despre semnale si semnale comune')}
        id="rc_lab2-signals"
        checked={!!checked['rc_lab2-signals']}
        onCheck={() => toggleCheck('rc_lab2-signals')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Signals are software interrupts sent to a process to notify it of an event. A process can catch, ignore, or let the default action apply.',
            'Semnalele sunt intreruperi software trimise unui proces pentru a-l notifica despre un eveniment. Un proces poate prinde, ignora sau lasa actiunea implicita sa se aplice.'
          )}
        </p>
        <p className="mb-2 text-sm font-semibold">{t('Common signals:', 'Semnale comune:')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm mb-3">
          <li><code>SIGTERM (15)</code> — {t('graceful terminate request; can be caught', 'cerere de terminare gratiosa; poate fi prinsa')}</li>
          <li><code>SIGKILL (9)</code> — {t('force kill; cannot be caught or ignored', 'terminare fortata; nu poate fi prinsa sau ignorata')}</li>
          <li><code>SIGINT (2)</code> — {t('keyboard interrupt (Ctrl+C)', 'intrerupere de la tastatura (Ctrl+C)')}</li>
          <li><code>SIGTSTP (20)</code> — {t('keyboard stop (Ctrl+Z); suspends process', 'oprire de la tastatura (Ctrl+Z); suspenda procesul')}</li>
          <li><code>SIGCHLD (17)</code> — {t('child process stopped or terminated', 'procesul copil s-a oprit sau terminat')}</li>
          <li><code>SIGHUP (1)</code> — {t('hangup; often used to reload daemons', 'deconectare; adesea folosit pentru a reincarca daemoni')}</li>
          <li><code>SIGSEGV (11)</code> — {t('segmentation fault (invalid memory access)', 'eroare de segmentare (acces invalid la memorie)')}</li>
          <li><code>SIGPIPE (13)</code> — {t('write to a pipe with no reader', 'scriere intr-un pipe fara cititor')}</li>
        </ul>
        <Code>{`#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <unistd.h>

void handler(int sig) {
    printf("Caught signal %d\\n", sig);
}

int main() {
    // Register handler for SIGINT
    signal(SIGINT, handler);

    // Or use sigaction (preferred — more portable)
    struct sigaction sa;
    sa.sa_handler = handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = 0;
    sigaction(SIGTERM, &sa, NULL);

    // Ignore a signal
    signal(SIGHUP, SIG_IGN);

    // Restore default
    signal(SIGINT, SIG_DFL);

    // Send signal programmatically
    kill(getpid(), SIGUSR1);

    pause();  // wait for any signal
    return 0;
}`}</Code>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('4. Lab Exercises', '4. Exercitii de laborator')}
      </h3>

      <Section
        title={t('Exercise 1: fork() and process identification', 'Exercitiul 1: fork() si identificarea proceselor')}
        id="rc_lab2-ex1"
        checked={!!checked['rc_lab2-ex1']}
        onCheck={() => toggleCheck('rc_lab2-ex1')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Write a program that creates 3 child processes using fork(). Each child prints its PID and its parent\'s PID, then exits. The parent waits for all children.',
            'Scrieti un program care creeaza 3 procese copil folosind fork(). Fiecare copil isi afiseaza PID-ul si PID-ul parintelui, apoi iese. Parintele asteapta toti copiii.'
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
    int i;
    pid_t pid;

    for (i = 0; i < 3; i++) {
        pid = fork();
        if (pid < 0) {
            perror("fork"); exit(1);
        }
        if (pid == 0) {
            printf("Child %d: PID=%d, PPID=%d\\n",
                   i+1, getpid(), getppid());
            exit(0);  // child exits immediately
        }
        // parent continues loop
    }

    // Parent waits for all 3 children
    for (i = 0; i < 3; i++) {
        wait(NULL);
    }
    printf("All children finished\\n");
    return 0;
}`}</Code>
          }
        />
      </Section>

      <Section
        title={t('Exercise 2: exec() to run another program', 'Exercitiul 2: exec() pentru a rula alt program')}
        id="rc_lab2-ex2"
        checked={!!checked['rc_lab2-ex2']}
        onCheck={() => toggleCheck('rc_lab2-ex2')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Write a program that forks a child. The child uses execvp() to run "date". The parent waits and prints "Done" after the child finishes.',
            'Scrieti un program care face fork unui copil. Copilul foloseste execvp() pentru a rula "date". Parintele asteapta si afiseaza "Done" dupa ce copilul termina.'
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
    pid_t pid = fork();

    if (pid < 0) { perror("fork"); exit(1); }

    if (pid == 0) {
        char *args[] = {"date", NULL};
        execvp("date", args);
        perror("execvp");  // only reached on error
        exit(1);
    }

    wait(NULL);
    printf("Done\\n");
    return 0;
}`}</Code>
          }
        />
      </Section>

      <Section
        title={t('Exercise 3: Signal handler for SIGINT', 'Exercitiul 3: Handler de semnal pentru SIGINT')}
        id="rc_lab2-ex3"
        checked={!!checked['rc_lab2-ex3']}
        onCheck={() => toggleCheck('rc_lab2-ex3')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Write a program that counts to 100 in a loop (1 second delay each iteration). Install a SIGINT handler that prints "Interrupted at count N" and exits cleanly when Ctrl+C is pressed.',
            'Scrieti un program care numara pana la 100 intr-un ciclu (intarziere de 1 secunda la fiecare iteratie). Instalati un handler SIGINT care afiseaza "Interrupted at count N" si iese curat cand se apasa Ctrl+C.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <unistd.h>

volatile int count = 0;

void handler(int sig) {
    printf("\\nInterrupted at count %d\\n", count);
    exit(0);
}

int main() {
    signal(SIGINT, handler);

    for (count = 1; count <= 100; count++) {
        printf("Count: %d\\n", count);
        sleep(1);
    }
    printf("Finished normally\\n");
    return 0;
}`}</Code>
          }
        />
      </Section>
    </>
  );
}
