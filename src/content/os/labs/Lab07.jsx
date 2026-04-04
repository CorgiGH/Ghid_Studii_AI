import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Lab07() {
  const { t, checked, toggleCheck } = useApp();
  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Lab #7: C Programming — Pipes, FIFOs & Signals', 'Laborator #7: Programare C — Pipes, FIFO-uri și Signals')}</p>
        <p className="text-sm">{t('Inter-process communication using anonymous pipes, named pipes (FIFOs), and POSIX signal handling. Exercises cover pipeline implementation, distributed computing patterns, and signal-based synchronization.', 'Comunicația inter-procese folosind pipe-uri anonime, pipe-uri cu nume (FIFO-uri) și tratarea signals POSIX. Exercițiile acoperă implementarea pipeline-urilor, pattern-uri de calcul distribuit și sincronizare bazată pe signals.')}</p>
      </Box>

      <h3 className="text-lg font-bold mt-6 mb-3">{t('a) Anonymous Pipes', 'a) Pipe-uri anonime')}</h3>

      <Section title={t('Ex 1: Pipe commands #3', 'Ex 1: Comenzi pipe #3')} id="lab_7-ex1" checked={!!checked['lab_7-ex1']} onCheck={() => toggleCheck('lab_7-ex1')}>
        <p>{t('Implement a pipeline of two commands programmatically: fork two children, connect them with pipe(), redirect stdin/stdout with dup2(), exec each command.', 'Implementați un pipeline de două comenzi programatic: faceți fork la doi fii, conectați-i cu pipe(), redirecționați stdin/stdout cu dup2(), exec fiecare comandă.')}</p>
        <Code>{`// Implement: cmd1 | cmd2
// Parent: pipe(pfd), fork child1, fork child2
// Child1: close(pfd[0]), dup2(pfd[1], STDOUT), exec(cmd1)
// Child2: close(pfd[1]), dup2(pfd[0], STDIN), exec(cmd2)`}</Code>
      </Section>

      <Section title="Ex 2: MyShell v2 (with pipelines)" id="lab_7-ex2" checked={!!checked['lab_7-ex2']} onCheck={() => toggleCheck('lab_7-ex2')}>
        <p>{t('Extend MyShell to support pipelines: parse the | character, create a pipe for each |, fork+exec each command in the pipeline with appropriate redirections.', 'Extindeți MyShell pentru a suporta pipeline-uri: parsați caracterul |, creați un pipe pentru fiecare |, fork+exec fiecare comandă din pipeline cu redirecționările potrivite.')}</p>
      </Section>

      <Section title={t('Ex 3: Supervisor-Workers with pipes', 'Ex 3: Supervisor-Workers cu pipe-uri')} id="lab_7-ex3" checked={!!checked['lab_7-ex3']} onCheck={() => toggleCheck('lab_7-ex3')}>
        <p>{t('Implement a coordinated distributed sum: supervisor creates N workers via fork, sends data through anonymous pipes, each worker computes a partial sum and sends it back through another pipe.', 'Implementați o sumă distribuită coordonată: supervisor-ul creează N workers prin fork, trimite date prin pipe-uri anonime, fiecare worker calculează o sumă parțială și o trimite înapoi printr-un alt pipe.')}</p>
      </Section>

      <Section title={t('Ex 4: Ping-Pong with pipes', 'Ex 4: Ping-Pong cu pipe-uri')} id="lab_7-ex4" checked={!!checked['lab_7-ex4']} onCheck={() => toggleCheck('lab_7-ex4')}>
        <p>{t('Implement Ping-Pong using two anonymous pipes (one for each direction). Parent and child alternate writing/reading messages.', 'Implementați Ping-Pong folosind două pipe-uri anonime (unul pentru fiecare direcție). Părintele și fiul alternează scrierea/citirea mesajelor.')}</p>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">{t('b) Named Pipes (FIFOs)', 'b) Pipe-uri cu nume (FIFO-uri)')}</h3>

      <Section title={t('Ex 5: Supervisor-Workers with FIFOs', 'Ex 5: Supervisor-Workers cu FIFO-uri')} id="lab_7-ex5" checked={!!checked['lab_7-ex5']} onCheck={() => toggleCheck('lab_7-ex5')}>
        <p>{t('Same distributed sum pattern but using named pipes (mkfifo) for IPC between unrelated processes. Supervisor and workers are separate programs.', 'Același pattern de sumă distribuită dar folosind pipe-uri cu nume (mkfifo) pentru IPC între procese neînrudite. Supervisor-ul și workers sunt programe separate.')}</p>
      </Section>

      <Section title={t('Ex 6: Ping-Pong with FIFOs', 'Ex 6: Ping-Pong cu FIFO-uri')} id="lab_7-ex6" checked={!!checked['lab_7-ex6']} onCheck={() => toggleCheck('lab_7-ex6')}>
        <p>{t('Implement Ping-Pong using named pipes. Two separate programs communicate via two FIFOs.', 'Implementați Ping-Pong folosind pipe-uri cu nume. Două programe separate comunică prin două FIFO-uri.')}</p>
      </Section>

      <Section title="Ex 7: MyShell v3 (distributed)" id="lab_7-ex7" checked={!!checked['lab_7-ex7']} onCheck={() => toggleCheck('lab_7-ex7')}>
        <p>{t('Extend MyShell with distributed processing: the shell supervisor sends commands to workers via FIFOs, collects results.', 'Extindeți MyShell cu procesare distribuită: supervisor-ul shell trimite comenzi la workers prin FIFO-uri, colectează rezultatele.')}</p>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">{t('c) Signals exercises', 'c) Exerciții cu signals')}</h3>

      <Section title={t('Ex 8: Signal handling basics', 'Ex 8: Bazele tratării signals')} id="lab_7-ex8" checked={!!checked['lab_7-ex8']} onCheck={() => toggleCheck('lab_7-ex8')}>
        <p>{t('Write programs that install custom signal handlers using signal() or sigaction(). Handle SIGINT (Ctrl+C), SIGTERM, SIGUSR1/SIGUSR2.', 'Scrieți programe care instalează signal handlers personalizate folosind signal() sau sigaction(). Tratați SIGINT (Ctrl+C), SIGTERM, SIGUSR1/SIGUSR2.')}</p>
        <Code>{`// Basic signal handler
void handler(int sig) {
    write(STDOUT_FILENO, "Caught!\\n", 8);
}
signal(SIGINT, handler);  // or use sigaction`}</Code>
      </Section>

      <Section title={t('Ex 9: Producer-Consumer with signals', 'Ex 9: Producător-Consumator cu signals')} id="lab_7-ex9" checked={!!checked['lab_7-ex9']} onCheck={() => toggleCheck('lab_7-ex9')}>
        <p>{t('Implement producer-consumer synchronization using signals (SIGUSR1/SIGUSR2) and shared memory or pipes for data transfer.', 'Implementați sincronizarea producător-consumator folosind signals (SIGUSR1/SIGUSR2) și memorie partajată sau pipe-uri pentru transferul de date.')}</p>
      </Section>

      <Section title={t('Ex 10: Multi-player game', 'Ex 10: Joc multi-player')} id="lab_7-ex10" checked={!!checked['lab_7-ex10']} onCheck={() => toggleCheck('lab_7-ex10')}>
        <p>{t('Implement a multi-player game where a supervisor coordinates N player processes using FIFOs for communication and signals for turn synchronization.', 'Implementați un joc multi-player unde un supervisor coordonează N procese jucători folosind FIFO-uri pentru comunicare și signals pentru sincronizarea rundelor.')}</p>
      </Section>
    </>
  );
}
