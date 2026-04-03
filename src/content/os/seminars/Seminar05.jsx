import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Seminar05() {
  const { t, checked, toggleCheck } = useApp();
  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Week 5 — Solved Exercises: fork(), wait(), exec()', 'Săptămâna 5 — Exerciții rezolvate: fork(), wait(), exec()')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Creating process hierarchies with fork()', 'Crearea ierarhiilor de procese cu fork()')}</li>
          <li>{t('Synchronizing with wait()/waitpid()', 'Sincronizarea cu wait()/waitpid()')}</li>
          <li>{t('Running external programs with exec()', 'Rularea programelor externe cu exec()')}</li>
          <li>{t('Patterns: supervisor-workers, ping-pong', 'Pattern-uri: supervisor-workers, ping-pong')}</li>
        </ol>
      </Box>

      <Section title={t('1. Basic fork() — Parent vs Child', '1. fork() de bază — Părinte vs Fiu')} id="s5-fork" checked={!!checked['s5-fork']} onCheck={() => toggleCheck('s5-fork')}>
        <Code>{`#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork();
    if (pid < 0) { perror("fork"); return 1; }
    if (pid == 0) {
        // CHILD
        printf("Child: PID=%d, PPID=%d\\n", getpid(), getppid());
        return 42;
    }
    // PARENT
    int st;
    wait(&st);
    if (WIFEXITED(st))
        printf("Parent: child exited with %d\\n", WEXITSTATUS(st));
    return 0;
}`}</Code>
        <Box type="warning">
          <p className="font-bold">{t('Critical: always exit() in the child!', 'Critic: apelați întotdeauna exit() în fiu!')}</p>
          <p className="text-sm">{t('Without exit() in the child branch, the child continues executing the parent\'s code after the if block — potentially causing fork bombs in loops.', 'Fără exit() în ramura fiului, fiul continuă execuția codului părintelui după blocul if — potențial cauzând fork bombs în bucle.')}</p>
        </Box>
      </Section>

      <Section title={t('2. Creating N Children', '2. Crearea a N fii')} id="s5-nchildren" checked={!!checked['s5-nchildren']} onCheck={() => toggleCheck('s5-nchildren')}>
        <Code>{`int main(int argc, char *argv[]) {
    int N = atoi(argv[1]);
    for (int i = 0; i < N; i++) {
        pid_t pid = fork();
        if (pid == 0) {
            printf("Child %d: PID=%d\\n", i, getpid());
            exit(i);  // CRITICAL: exit here!
        }
    }
    // Parent waits for all children
    for (int i = 0; i < N; i++) {
        int st;
        pid_t child = wait(&st);
        printf("Child %d finished, exit=%d\\n", child, WEXITSTATUS(st));
    }
    return 0;
}`}</Code>
      </Section>

      <Section title={t('3. exec() — Running External Programs', '3. exec() — Rularea programelor externe')} id="s5-exec" checked={!!checked['s5-exec']} onCheck={() => toggleCheck('s5-exec')}>
        <Code>{`#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork();
    if (pid == 0) {
        // Child replaces itself with "ls -la"
        execlp("ls", "ls", "-la", NULL);
        perror("exec");  // only reached if exec fails
        exit(1);
    }
    wait(NULL);  // parent waits
    printf("ls finished\\n");
    return 0;
}`}</Code>
        <Box type="definition">
          <p className="font-bold">{t('exec() family naming:', 'Denumirea familiei exec():')}</p>
          <p className="text-sm font-mono">execl(path, arg0, arg1, ..., NULL) — {t('list args', 'argumente listă')}</p>
          <p className="text-sm font-mono">execv(path, argv[]) — {t('vector args', 'argumente vector')}</p>
          <p className="text-sm font-mono">execlp/execvp — {t('search PATH', 'caută în PATH')}</p>
          <p className="text-sm font-mono">execle/execve — {t('custom environment', 'mediu personalizat')}</p>
        </Box>
      </Section>

      <Section title={t('4. Pattern: fork + exec + wait', '4. Pattern: fork + exec + wait')} id="s5-pattern" checked={!!checked['s5-pattern']} onCheck={() => toggleCheck('s5-pattern')}>
        <p>{t('The fundamental pattern for running external commands:', 'Pattern-ul fundamental pentru rularea comenzilor externe:')}</p>
        <Code>{`pid_t pid = fork();
if (pid == 0) {
    // Optional: setup redirections with dup2()
    // dup2(fd, STDOUT_FILENO);

    // Replace child with the command
    execlp(cmd, cmd, arg1, arg2, NULL);
    perror("exec"); exit(1);
}
// Parent: wait and check exit status
int st;
waitpid(pid, &st, 0);
if (WIFEXITED(st))
    printf("Exit code: %d\\n", WEXITSTATUS(st));
else if (WIFSIGNALED(st))
    printf("Killed by signal %d\\n", WTERMSIG(st));`}</Code>
        <Box type="theorem">
          <p>{t('This is exactly what system("cmd") does internally: fork → child: exec /bin/sh -c "cmd" → parent: wait.', 'Aceasta este exact ce face system("cmd") intern: fork → fiu: exec /bin/sh -c "cmd" → părinte: wait.')}</p>
        </Box>
      </Section>

      <Section title={t('5. I/O Redirection with dup2()', '5. Redirecționare I/O cu dup2()')} id="s5-dup2" checked={!!checked['s5-dup2']} onCheck={() => toggleCheck('s5-dup2')}>
        <Code>{`// Redirect stdout to a file before exec:
int fd = open("output.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
dup2(fd, STDOUT_FILENO);  // stdout now goes to file
close(fd);                 // original fd no longer needed
execlp("ls", "ls", "-la", NULL);  // ls output goes to file`}</Code>
        <Box type="warning">
          <p className="font-bold">{t('fflush before fork/exec!', 'fflush înainte de fork/exec!')}</p>
          <p className="text-sm">{t('Always call fflush(NULL) before fork() or exec() to flush stdio buffers. Otherwise buffered data may be duplicated (fork) or lost (exec).', 'Apelați întotdeauna fflush(NULL) înainte de fork() sau exec() pentru a goli buffer-ele stdio. Altfel datele din buffer pot fi duplicate (fork) sau pierdute (exec).')}</p>
        </Box>
      </Section>
    </>
  );
}
