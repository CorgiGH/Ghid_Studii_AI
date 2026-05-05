import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function RcLab07() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: RC - Lab #7, UAIC — TCP concurrent server (fork per client)',
          'Sursa: RC - Laborator #7, UAIC — Server TCP concurent (fork per client)'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('RC Lab #7: TCP Concurrent Server', 'RC Laborator #7: Server TCP Concurent')}
        </p>
        <p className="text-sm">
          {t(
            'A concurrent server handles multiple clients simultaneously by forking a child process for each accepted connection. The parent continues accepting while children serve their assigned clients.',
            'Un server concurent gestioneaza mai multi clienti simultan prin fork-ul unui proces copil pentru fiecare conexiune acceptata. Parintele continua sa accepte in timp ce copiii servesc clientii asignati.'
          )}
        </p>
      </Box>

      <h3 className="text-lg font-bold mt-6 mb-3">
        {t('1. Concurrent Server Design', '1. Designul serverului concurent')}
      </h3>

      <Section
        title={t('Iterative vs concurrent — when to use each', 'Iterativ vs concurent — cand sa folosesti fiecare')}
        id="rc_lab7-iter-vs-conc"
        checked={!!checked['rc_lab7-iter-vs-conc']}
        onCheck={() => toggleCheck('rc_lab7-iter-vs-conc')}
      >
        <p className="mb-2 text-sm font-semibold">{t('Iterative server:', 'Server iterativ:')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm mb-3">
          <li>{t('Serves one client at a time — second client waits in listen() backlog queue', 'Serveste un client pe rand — al doilea client asteapta in coada listen()')}</li>
          <li>{t('Simple — no zombie management, no signal handling', 'Simplu — fara gestionarea zombilor, fara gestionarea semnalelor')}</li>
          <li>{t('Good for: short-lived requests (time server, simple echo)', 'Bun pentru: cereri de scurta durata (server de timp, echo simplu)')}</li>
        </ul>
        <p className="mb-2 text-sm font-semibold">{t('Concurrent server (fork per client):', 'Server concurent (fork per client):')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm mb-3">
          <li>{t('Parent forks a child for each accepted client; child handles it fully', 'Parintele face fork unui copil pentru fiecare client acceptat; copilul il gestioneaza complet')}</li>
          <li>{t('Parent closes connfd immediately and loops back to accept()', 'Parintele inchide connfd imediat si revine la accept()')}</li>
          <li>{t('Child closes listenfd and serves the single client', 'Copilul inchide listenfd si serveste clientul unic')}</li>
          <li>{t('Must handle SIGCHLD to reap zombie children', 'Trebuie sa gestioneze SIGCHLD pentru a colecta copiii zombie')}</li>
          <li>{t('Good for: long-lived sessions (file transfer, chat)', 'Bun pentru: sesiuni de lunga durata (transfer de fisiere, chat)')}</li>
        </ul>
      </Section>

      <Section
        title={t('Zombie prevention with SIGCHLD handler', 'Prevenirea zombilor cu handler SIGCHLD')}
        id="rc_lab7-sigchld"
        checked={!!checked['rc_lab7-sigchld']}
        onCheck={() => toggleCheck('rc_lab7-sigchld')}
      >
        <p className="mb-2 text-sm">
          {t(
            'When a child process exits, it becomes a zombie until the parent calls wait(). A concurrent server must handle SIGCHLD to reap children automatically, otherwise zombie processes accumulate and eventually exhaust PIDs.',
            'Cand un proces copil iese, devine zombie pana cand parintele apeleaza wait(). Un server concurent trebuie sa gestioneze SIGCHLD pentru a colecta copiii automat, altfel procesele zombie se acumuleaza si in final epuizeaza PID-urile.'
          )}
        </p>
        <Code>{`/* SIGCHLD handler — reap all finished children */
#include <signal.h>
#include <sys/wait.h>

void sigchld_handler(int sig) {
    /* waitpid with WNOHANG: don't block, reap all zombies */
    while (waitpid(-1, NULL, WNOHANG) > 0)
        ;
}

/* Install in main() before the accept loop: */
struct sigaction sa;
sa.sa_handler = sigchld_handler;
sigemptyset(&sa.sa_mask);
sa.sa_flags = SA_RESTART;  // restart interrupted accept()
sigaction(SIGCHLD, &sa, NULL);`}</Code>
        <Box type="warning">
          <p className="text-sm">
            {t(
              'Use SA_RESTART so that SIGCHLD does not interrupt accept() with EINTR. Without it, accept() returns -1 with errno=EINTR whenever a child exits, and you must check for EINTR explicitly.',
              'Folositi SA_RESTART astfel incat SIGCHLD sa nu intrerupa accept() cu EINTR. Fara el, accept() returneaza -1 cu errno=EINTR ori de cate ori un copil iese, si trebuie sa verificati EINTR explicit.'
            )}
          </p>
        </Box>
      </Section>

      <Section
        title={t('Complete concurrent TCP echo server', 'Server TCP echo concurent complet')}
        id="rc_lab7-server-code"
        checked={!!checked['rc_lab7-server-code']}
        onCheck={() => toggleCheck('rc_lab7-server-code')}
      >
        <Code>{`/* tcp_server_concurrent.c
 * Fork-per-client TCP echo server.
 * Usage: ./server <port>
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <sys/wait.h>
#include <netinet/in.h>

#define BACKLOG 10
#define BUFSIZE 1024

void sigchld_handler(int sig) {
    while (waitpid(-1, NULL, WNOHANG) > 0) ;
}

int main(int argc, char *argv[]) {
    if (argc != 2) { fprintf(stderr, "Usage: %s <port>\\n", argv[0]); exit(1); }

    /* Setup SIGCHLD before first accept */
    struct sigaction sa;
    sa.sa_handler = sigchld_handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART;
    sigaction(SIGCHLD, &sa, NULL);

    int listenfd = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family      = AF_INET;
    addr.sin_port        = htons(atoi(argv[1]));
    addr.sin_addr.s_addr = INADDR_ANY;
    bind(listenfd, (struct sockaddr *)&addr, sizeof(addr));
    listen(listenfd, BACKLOG);
    printf("Concurrent server on port %s\\n", argv[1]);

    for (;;) {
        struct sockaddr_in caddr;
        socklen_t clen = sizeof(caddr);

        int connfd = accept(listenfd, (struct sockaddr *)&caddr, &clen);
        if (connfd < 0) { perror("accept"); continue; }

        pid_t pid = fork();
        if (pid < 0) { perror("fork"); close(connfd); continue; }

        if (pid == 0) {
            /* ---- Child: serve one client ---- */
            close(listenfd);  // child doesn't need the listening socket

            char buf[BUFSIZE];
            int n;
            while ((n = recv(connfd, buf, sizeof(buf), 0)) > 0)
                send(connfd, buf, n, 0);

            close(connfd);
            exit(0);
        }

        /* ---- Parent: back to accept() ---- */
        close(connfd);  // parent doesn't need the connected socket
    }

    return 0;
}`}</Code>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('2. Lab Exercises', '2. Exercitii de laborator')}
      </h3>

      <Section
        title={t('Exercise 1: Chat room (broadcast to all clients)', 'Exercitiul 1: Camera de chat (broadcast la toti clientii)')}
        id="rc_lab7-ex1"
        checked={!!checked['rc_lab7-ex1']}
        onCheck={() => toggleCheck('rc_lab7-ex1')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Extend the concurrent server: when a client sends a message, the server should write it back to all currently connected clients. This requires sharing the list of active connfds between processes (use a shared memory segment or a pipe back to the parent).',
            'Extindeti serverul concurent: cand un client trimite un mesaj, serverul ar trebui sa il scrie inapoi la toti clientii conectati. Aceasta necesita partajarea listei de connfd-uri active intre procese (folositi un segment de memorie partajata sau un pipe inapoi la parinte).'
          )}
        </p>
        <Toggle
          question={t('Show simplified approach (parent broadcast)', 'Arata abordarea simplificata (broadcast parinte)')}
          answer={
            <Code>{`/* Simplified: child sends received data to parent via socketpair;
 * parent broadcasts to all children via their socketpairs.
 * Each child[i] has: sv[i][0] for child, sv[i][1] for parent.
 *
 * Full implementation is complex — key idea:
 * - Maintain sv[][2] array of parent↔child channels
 * - Parent uses select() to detect which child has data
 * - Parent reads from child channel, writes to all OTHER child channels
 * - Each child: select() on {connfd, sv[i][0]}
 *   - data from connfd → write to sv[i][0] (parent broadcasts)
 *   - data from sv[i][0] → send to connfd (received broadcast)
 */

// Minimal broadcast in child using shared pipe (sketch):
// child recv from client → write(pipe_to_parent[1], msg)
// parent reads pipe → for each child: write(sv[i][1], msg)`}</Code>
          }
        />
      </Section>

      <Section
        title={t('Exercise 2: Count active connections', 'Exercitiul 2: Numara conexiunile active')}
        id="rc_lab7-ex2"
        checked={!!checked['rc_lab7-ex2']}
        onCheck={() => toggleCheck('rc_lab7-ex2')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Modify the concurrent server to track connection count using a shared memory integer. The parent increments it on each accept() and decrements it in the SIGCHLD handler. The child prints the current count when it starts.',
            'Modificati serverul concurent pentru a urmari numarul de conexiuni folosind un intreg in memorie partajata. Parintele il incrementeaza la fiecare accept() si il decrementeaza in handlerul SIGCHLD. Copilul afiseaza numarul curent cand porneste.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`#include <sys/mman.h>

// In main(), before listen():
int *conn_count = mmap(NULL, sizeof(int),
    PROT_READ | PROT_WRITE,
    MAP_SHARED | MAP_ANONYMOUS, -1, 0);
*conn_count = 0;

// Update SIGCHLD handler:
void sigchld_handler(int sig) {
    while (waitpid(-1, NULL, WNOHANG) > 0)
        (*conn_count)--;
}

// In parent after accept():
(*conn_count)++;

// In child, at start:
printf("Client connected. Active connections: %d\\n", *conn_count);`}</Code>
          }
        />
      </Section>

      <Section
        title={t('Exercise 3: Graceful shutdown on SIGINT', 'Exercitiul 3: Oprire gratiosa la SIGINT')}
        id="rc_lab7-ex3"
        checked={!!checked['rc_lab7-ex3']}
        onCheck={() => toggleCheck('rc_lab7-ex3')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Add a SIGINT handler to the concurrent server. On Ctrl+C: close the listening socket, send SIGTERM to all child processes, wait for all children to exit, then exit cleanly.',
            'Adaugati un handler SIGINT serverului concurent. La Ctrl+C: inchideti socket-ul de ascultare, trimiteti SIGTERM tuturor proceselor copil, asteptati terminarea tuturor copiilor, apoi iesiti curat.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`volatile int running = 1;
int g_listenfd;

void sigint_handler(int sig) {
    running = 0;
    close(g_listenfd);      // unblock accept()
    kill(0, SIGTERM);       // signal entire process group
}

// Install in main():
signal(SIGINT, sigint_handler);
g_listenfd = listenfd;

// Change accept loop:
while (running) {
    int connfd = accept(listenfd, ...);
    if (connfd < 0) break;  // running=0 → exit loop
    // ... fork child
}

// After loop:
while (wait(NULL) > 0) ;  // reap remaining children
printf("Server shut down cleanly\\n");`}</Code>
          }
        />
      </Section>
    </>
  );
}
