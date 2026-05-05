import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function RcLab09() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: RC - Lab #9, UAIC — I/O multiplexing with select()',
          'Sursa: RC - Laborator #9, UAIC — Multiplexare I/O cu select()'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('RC Lab #9: select() — I/O Multiplexing', 'RC Laborator #9: select() — Multiplexare I/O')}
        </p>
        <p className="text-sm">
          {t(
            'select() allows a single process to monitor multiple file descriptors simultaneously, blocking until at least one is ready for I/O. This enables a single-process server that handles many clients without forking.',
            'select() permite unui singur proces sa monitorizeze mai multi descriptori de fisier simultan, blocand pana cand cel putin unul este gata pentru I/O. Aceasta permite un server cu un singur proces care gestioneaza multi clienti fara fork.'
          )}
        </p>
      </Box>

      <h3 className="text-lg font-bold mt-6 mb-3">
        {t('1. select() API', '1. API-ul select()')}
      </h3>

      <Section
        title={t('Signature and fd_set macros', 'Semnatura si macro-urile fd_set')}
        id="rc_lab9-select-api"
        checked={!!checked['rc_lab9-select-api']}
        onCheck={() => toggleCheck('rc_lab9-select-api')}
      >
        <Code>{`#include <sys/select.h>
#include <sys/time.h>

int select(int nfds,
           fd_set *readfds,
           fd_set *writefds,
           fd_set *exceptfds,
           struct timeval *timeout);

/* nfds   — highest fd in any set + 1
 * readfds  — set of fds to watch for readability
 * writefds — set of fds to watch for writability (often NULL)
 * exceptfds — set to watch for exceptions (often NULL)
 * timeout  — max wait time (NULL = block forever)
 *
 * Returns: number of ready fds, 0 on timeout, -1 on error
 */

/* fd_set manipulation macros: */
FD_ZERO(&set);           // clear the set
FD_SET(fd, &set);        // add fd to set
FD_CLR(fd, &set);        // remove fd from set
FD_ISSET(fd, &set);      // test if fd is in set (non-zero if ready)`}</Code>
        <Box type="warning">
          <p className="text-sm">
            {t(
              'select() MODIFIES the fd_sets in-place — after it returns, only ready fds remain in the sets. You must rebuild the sets before each call to select(). Keep a master set and copy it into a working set each iteration.',
              'select() MODIFICA fd_set-urile in-place — dupa ce returneaza, doar fd-urile gata raman in seturi. Trebuie sa reconstruiti seturile inainte de fiecare apel la select(). Pastrati un set master si copiati-l intr-un set de lucru la fiecare iteratie.'
            )}
          </p>
        </Box>
        <Box type="warning">
          <p className="text-sm">
            {t(
              'FD_SETSIZE is typically 1024. select() cannot monitor more than 1024 fds. For high-connection counts, use poll() or epoll() (Linux-specific).',
              'FD_SETSIZE este de obicei 1024. select() nu poate monitoriza mai mult de 1024 fd-uri. Pentru un numar mare de conexiuni, folositi poll() sau epoll() (specific Linux).'
            )}
          </p>
        </Box>
      </Section>

      <Section
        title={t('select() server — full implementation', 'Server cu select() — implementare completa')}
        id="rc_lab9-select-server"
        checked={!!checked['rc_lab9-select-server']}
        onCheck={() => toggleCheck('rc_lab9-select-server')}
      >
        <Code>{`/* tcp_select_server.c
 * Single-process TCP server using select() for multiplexing.
 * Handles multiple clients without forking.
 * Usage: ./server <port>
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <sys/select.h>
#include <netinet/in.h>

#define MAXCLIENTS 100
#define BUFSIZE    1024

int main(int argc, char *argv[]) {
    if (argc != 2) { fprintf(stderr, "Usage: %s <port>\\n", argv[0]); exit(1); }

    /* Setup listening socket */
    int listenfd = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family      = AF_INET;
    addr.sin_port        = htons(atoi(argv[1]));
    addr.sin_addr.s_addr = INADDR_ANY;
    bind(listenfd, (struct sockaddr *)&addr, sizeof(addr));
    listen(listenfd, 10);
    printf("select() server on port %s\\n", argv[1]);

    /* Track client fds */
    int clients[MAXCLIENTS];
    int nclients = 0;

    fd_set master_set;
    FD_ZERO(&master_set);
    FD_SET(listenfd, &master_set);
    int maxfd = listenfd;

    for (;;) {
        /* Copy master — select() modifies the working copy */
        fd_set working = master_set;

        int ready = select(maxfd + 1, &working, NULL, NULL, NULL);
        if (ready < 0) { perror("select"); break; }

        /* Check listening socket — new connection? */
        if (FD_ISSET(listenfd, &working)) {
            struct sockaddr_in caddr;
            socklen_t clen = sizeof(caddr);
            int connfd = accept(listenfd, (struct sockaddr *)&caddr, &clen);
            if (connfd >= 0 && nclients < MAXCLIENTS) {
                FD_SET(connfd, &master_set);
                if (connfd > maxfd) maxfd = connfd;
                clients[nclients++] = connfd;
                printf("New client fd=%d (total=%d)\\n", connfd, nclients);
            }
        }

        /* Check each client fd */
        for (int i = 0; i < nclients; ) {
            int fd = clients[i];
            if (FD_ISSET(fd, &working)) {
                char buf[BUFSIZE];
                int n = recv(fd, buf, sizeof(buf), 0);
                if (n <= 0) {
                    /* Client disconnected */
                    printf("Client fd=%d disconnected\\n", fd);
                    FD_CLR(fd, &master_set);
                    close(fd);
                    clients[i] = clients[--nclients];  // compact array
                    continue;  // don't increment i — slot now has different fd
                }
                send(fd, buf, n, 0);  // echo back
            }
            i++;
        }
    }

    close(listenfd);
    return 0;
}`}</Code>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('2. select() with Timeout', '2. select() cu Timeout')}
      </h3>

      <Section
        title={t('Using struct timeval for non-blocking polls', 'Folosind struct timeval pentru poll-uri non-blocante')}
        id="rc_lab9-timeout"
        checked={!!checked['rc_lab9-timeout']}
        onCheck={() => toggleCheck('rc_lab9-timeout')}
      >
        <Code>{`struct timeval tv;
tv.tv_sec  = 5;   // 5 seconds
tv.tv_usec = 0;   // 0 microseconds

fd_set working = master_set;
int ready = select(maxfd + 1, &working, NULL, NULL, &tv);

if (ready == 0) {
    printf("Timeout — no activity in 5 seconds\\n");
    // Can do housekeeping here (heartbeat, cleanup, etc.)
} else if (ready < 0) {
    perror("select");
} else {
    // At least one fd is ready — process normally
}

/* NOTE: tv is also modified by select() on Linux!
 * Always reset tv before each call if you want a fixed timeout.
 */`}</Code>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('3. Lab Exercises', '3. Exercitii de laborator')}
      </h3>

      <Section
        title={t('Exercise 1: select() on stdin and a socket', 'Exercitiul 1: select() pe stdin si un socket')}
        id="rc_lab9-ex1"
        checked={!!checked['rc_lab9-ex1']}
        onCheck={() => toggleCheck('rc_lab9-ex1')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Write a client that uses select() to monitor both stdin (fd=0) and the TCP socket simultaneously. When stdin has data, send it to the server. When the socket has data, print it. This avoids blocking on either one.',
            'Scrieti un client care foloseste select() pentru a monitoriza atat stdin (fd=0) cat si socket-ul TCP simultan. Cand stdin are date, trimiteti-le la server. Cand socket-ul are date, afisati-le. Aceasta evita blocarea pe oricare dintre ele.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`/* Main loop for select()-based client */
int sockfd = /* connected socket */;

for (;;) {
    fd_set fds;
    FD_ZERO(&fds);
    FD_SET(STDIN_FILENO, &fds);
    FD_SET(sockfd, &fds);
    int maxfd = sockfd > STDIN_FILENO ? sockfd : STDIN_FILENO;

    if (select(maxfd + 1, &fds, NULL, NULL, NULL) < 0) {
        perror("select"); break;
    }

    if (FD_ISSET(STDIN_FILENO, &fds)) {
        char buf[1024];
        int n = read(STDIN_FILENO, buf, sizeof(buf));
        if (n <= 0) break;          // EOF
        send(sockfd, buf, n, 0);
    }

    if (FD_ISSET(sockfd, &fds)) {
        char buf[1024];
        int n = recv(sockfd, buf, sizeof(buf) - 1, 0);
        if (n <= 0) { printf("Server closed connection\\n"); break; }
        buf[n] = '\\0';
        printf("Server: %s", buf);
    }
}
close(sockfd);`}</Code>
          }
        />
      </Section>

      <Section
        title={t('Exercise 2: select() server with broadcast', 'Exercitiul 2: Server cu select() si broadcast')}
        id="rc_lab9-ex2"
        checked={!!checked['rc_lab9-ex2']}
        onCheck={() => toggleCheck('rc_lab9-ex2')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Modify the select() echo server so that when one client sends a message, the server broadcasts it to ALL connected clients (not just echoes back to sender). Each message should be prefixed with "Client <fd>: ".',
            'Modificati serverul echo cu select() astfel incat cand un client trimite un mesaj, serverul sa il transmita TUTUROR clientilor conectati (nu doar inapoi la expeditor). Fiecare mesaj trebuie prefixat cu "Client <fd>: ".'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`/* Replace echo line with broadcast: */
// When fd sends n bytes in buf:
char out[BUFSIZE + 32];
int outlen = snprintf(out, sizeof(out), "Client %d: %.*s", fd, n, buf);

for (int j = 0; j < nclients; j++) {
    if (clients[j] != listenfd) {  // skip listen socket if tracked
        send(clients[j], out, outlen, 0);
    }
}`}</Code>
          }
        />
      </Section>

      <Section
        title={t('Exercise 3: 5-second idle timeout disconnect', 'Exercitiul 3: Deconectare la 5 secunde de inactivitate')}
        id="rc_lab9-ex3"
        checked={!!checked['rc_lab9-ex3']}
        onCheck={() => toggleCheck('rc_lab9-ex3')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Add a 5-second timeout to the select() server. If no client sends data within 5 seconds, send "idle timeout — disconnecting" to all clients and close all connections, then exit.',
            'Adaugati un timeout de 5 secunde serverului cu select(). Daca niciun client nu trimite date in 5 secunde, trimiteti "idle timeout — disconnecting" tuturor clientilor si inchideti toate conexiunile, apoi iesiti.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`struct timeval tv = { .tv_sec = 5, .tv_usec = 0 };
fd_set working = master_set;
int ready = select(maxfd + 1, &working, NULL, NULL, &tv);

if (ready == 0) {
    char msg[] = "idle timeout — disconnecting\\n";
    for (int i = 0; i < nclients; i++) {
        send(clients[i], msg, strlen(msg), 0);
        close(clients[i]);
    }
    close(listenfd);
    printf("All clients idle — server exiting\\n");
    exit(0);
}
// Reset tv before next iteration (Linux modifies it)
tv.tv_sec = 5; tv.tv_usec = 0;`}</Code>
          }
        />
      </Section>
    </>
  );
}
