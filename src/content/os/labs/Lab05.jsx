import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Lab05() {
  const { t, checked, toggleCheck } = useApp();
  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Lab #5: C Programming — fork(), wait(), exec()', 'Laborator #5: Programare C — fork(), wait(), exec()')}</p>
        <p className="text-sm">{t('Create process hierarchies, synchronize parent-child processes, and execute external programs. Exercises progress from simple process trees to complex multi-process coordination patterns.', 'Creați ierarhii de procese, sincronizați procese părinte-fiu și executați programe externe. Exercițiile progresează de la arbori simpli de procese la pattern-uri complexe de coordonare multi-proces.')}</p>
      </Box>

      <h3 className="text-lg font-bold mt-6 mb-3">{t('a) fork() & wait() exercises', 'a) Exerciții fork() și wait()')}</h3>

      <Section title={t('Ex 1: A particular tree of processes', 'Ex 1: Un arbore particular de procese')} id="lab5-ex1" checked={!!checked['lab5-ex1']} onCheck={() => toggleCheck('lab5-ex1')}>
        <p>{t('Create a specific hierarchy of processes using fork(). The parent creates N children, each child may create further children according to the specified tree structure. Use wait() to synchronize.', 'Creați o ierarhie specifică de procese folosind fork(). Părintele creează N fii, fiecare fiu poate crea alți fii conform structurii de arbore specificate. Folosiți wait() pentru sincronizare.')}</p>
      </Section>

      <Section title={t('Ex 2: Perfect k-ary tree (recursive)', 'Ex 2: Arbore k-ar perfect (recursiv)')} id="lab5-ex2" checked={!!checked['lab5-ex2']} onCheck={() => toggleCheck('lab5-ex2')}>
        <p>{t('Create a perfect k-ary tree of processes with depth d. Each process creates exactly k children. Recursive implementation.', 'Creați un arbore k-ar perfect de procese cu adâncimea d. Fiecare proces creează exact k fii. Implementare recursivă.')}</p>
        <Code>{`// Usage: ./tree k d
// k=2, d=3 → binary tree with 2^3-1 = 7 internal nodes`}</Code>
      </Section>

      <Section title={t('Ex 3: Perfect k-ary tree (iterative)', 'Ex 3: Arbore k-ar perfect (iterativ)')} id="lab5-ex3" checked={!!checked['lab5-ex3']} onCheck={() => toggleCheck('lab5-ex3')}>
        <p>{t('Same as above but iterative implementation. Track tree level and position without recursion.', 'La fel ca mai sus dar implementare iterativă. Urmăriți nivelul și poziția în arbore fără recursie.')}</p>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">{t('b) exec() exercises', 'b) Exerciții exec()')}</h3>

      <Section title={t('Ex 4: Exec command — cut', 'Ex 4: Exec command — cut')} id="lab5-ex4" checked={!!checked['lab5-ex4']} onCheck={() => toggleCheck('lab5-ex4')}>
        <p>{t('Write a C program that uses fork+exec to run the cut command programmatically. The parent forks a child, the child calls execlp/execvp to run cut with appropriate arguments, the parent waits.', 'Scrieți un program C care folosește fork+exec pentru a rula comanda cut programatic. Părintele face fork, fiul apelează execlp/execvp pentru a rula cut cu argumentele potrivite, părintele așteaptă.')}</p>
      </Section>

      <Section title="Ex 5: MyCall_System" id="lab5-ex5" checked={!!checked['lab5-ex5']} onCheck={() => toggleCheck('lab5-ex5')}>
        <p>{t('Implement your own version of the system() function using fork+exec+wait. Your function should take a command string, fork a child, exec /bin/sh -c "command", and wait for it.', 'Implementați propria versiune a funcției system() folosind fork+exec+wait. Funcția trebuie să primească un string de comandă, să facă fork, exec /bin/sh -c "command" și să aștepte.')}</p>
        <Code>{`int my_system(const char *cmd) {
    pid_t pid = fork();
    if (pid == 0) {
        execlp("/bin/sh", "sh", "-c", cmd, NULL);
        perror("exec"); exit(1);
    }
    int st; waitpid(pid, &st, 0);
    return WEXITSTATUS(st);
}`}</Code>
      </Section>

      <Section title={t('Ex 6: Run SPMD programs', 'Ex 6: Rularea programelor SPMD')} id="lab5-ex6" checked={!!checked['lab5-ex6']} onCheck={() => toggleCheck('lab5-ex6')}>
        <p>{t('Write a supervisor program that launches N instances of another program (SPMD = Single Program Multiple Data). Each instance receives its rank (0..N-1) as argument.', 'Scrieți un program supervisor care lansează N instanțe ale altui program (SPMD = Single Program Multiple Data). Fiecare instanță primește rank-ul (0..N-1) ca argument.')}</p>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">{t('c) Pattern exercises', 'c) Exerciții cu pattern-uri')}</h3>

      <Section title={t('Ex 7: Supervisor-Workers pattern', 'Ex 7: Pattern-ul Supervisor-Workers')} id="lab5-ex7" checked={!!checked['lab5-ex7']} onCheck={() => toggleCheck('lab5-ex7')}>
        <p>{t('Implement the Supervisor-Workers pattern: a supervisor process creates N worker processes, distributes tasks via regular files, collects results, and reports the aggregate.', 'Implementați pattern-ul Supervisor-Workers: un proces supervisor creează N procese worker, distribuie sarcini prin fișiere obișnuite, colectează rezultatele și raportează agregatul.')}</p>
      </Section>

      <Section title={t('Ex 8: Ping-Pong pattern', 'Ex 8: Pattern-ul Ping-Pong')} id="lab5-ex8" checked={!!checked['lab5-ex8']} onCheck={() => toggleCheck('lab5-ex8')}>
        <p>{t('Implement the Ping-Pong pattern: two processes alternate sending/receiving messages via a regular file, using file locking for synchronization.', 'Implementați pattern-ul Ping-Pong: două procese alternează trimiterea/primirea mesajelor printr-un fișier obișnuit, folosind blocaje pe fișiere pentru sincronizare.')}</p>
      </Section>

      <Section title="Ex 9: MyShell v1" id="lab5-ex9" checked={!!checked['lab5-ex9']} onCheck={() => toggleCheck('lab5-ex9')}>
        <p>{t('Implement a simple shell: read commands from stdin in a loop, fork+exec each command, wait for it to finish, repeat. Support simple commands with arguments.', 'Implementați un shell simplu: citiți comenzi de la stdin într-o buclă, fork+exec fiecare comandă, așteptați terminarea, repetați. Suportați comenzi simple cu argumente.')}</p>
      </Section>
    </>
  );
}
