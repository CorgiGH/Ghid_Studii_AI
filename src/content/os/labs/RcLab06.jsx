import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function RcLab06() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: RC - Lab #6, UAIC — TCP iterative client/server',
          'Sursa: RC - Laborator #6, UAIC — Client/server TCP iterativ'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('RC Lab #6: TCP Iterative Client/Server', 'RC Laborator #6: Client/Server TCP Iterativ')}
        </p>
        <p className="text-sm">
          {t(
            'Build a complete TCP echo server (iterative — one client at a time) and a TCP client. Covers socket(), bind(), listen(), accept(), connect(), send(), recv(), and the full connection lifecycle.',
            'Construiti un server TCP echo complet (iterativ — un client pe rand) si un client TCP. Acopera socket(), bind(), listen(), accept(), connect(), send(), recv() si ciclul de viata complet al conexiunii.'
          )}
        </p>
      </Box>

      <h3 className="text-lg font-bold mt-6 mb-3">
        {t('1. TCP Server — Step by Step', '1. Server TCP — Pas cu pas')}
      </h3>

      <Section
        title={t('Server skeleton: socket → bind → listen → accept → recv/send → close', 'Schelet server: socket → bind → listen → accept → recv/send → close')}
        id="rc_lab6-server-steps"
        checked={!!checked['rc_lab6-server-steps']}
        onCheck={() => toggleCheck('rc_lab6-server-steps')}
      >
        <p className="mb-2 text-sm font-semibold">{t('Step-by-step walkthrough:', 'Parcurgere pas cu pas:')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm mb-3">
          <li><strong>socket()</strong> — {t('create the server socket (SOCK_STREAM for TCP)', 'creeaza socket-ul server (SOCK_STREAM pentru TCP)')}</li>
          <li><strong>setsockopt(SO_REUSEADDR)</strong> — {t('avoid EADDRINUSE on quick restart', 'evita EADDRINUSE la repornire rapida')}</li>
          <li><strong>bind()</strong> — {t('attach to a port (and optionally IP)', 'ataseaza la un port (si optional un IP)')}</li>
          <li><strong>listen()</strong> — {t('mark socket as passive; set backlog queue size', 'marcheaza socket-ul ca pasiv; seteaza marimea cozii de asteptare')}</li>
          <li><strong>accept()</strong> — {t('block until a client connects; returns a NEW connected fd', 'blocheaza pana se conecteaza un client; returneaza un FD NOU conectat')}</li>
          <li><strong>recv()/send()</strong> — {t('exchange data on the accepted fd', 'schimba date pe fd-ul acceptat')}</li>
          <li><strong>close(accepted fd)</strong> — {t('close connection; go back to accept() for next client', 'inchide conexiunea; revine la accept() pentru urmatorul client')}</li>
        </ul>
        <Box type="warning">
          <p className="text-sm">
            {t(
              'accept() returns a NEW socket fd for the accepted connection — it is NOT the same as the listening fd. Always close the accepted fd after serving that client, and keep the listening fd open for subsequent clients.',
              'accept() returneaza un fd de socket NOU pentru conexiunea acceptata — nu este acelasi cu fd-ul de ascultare. Inchideti intotdeauna fd-ul acceptat dupa servirea clientului, si mentineti fd-ul de ascultare deschis pentru clientii urmatori.'
            )}
          </p>
        </Box>
      </Section>

      <Section
        title={t('Complete TCP echo server (iterative)', 'Server TCP echo complet (iterativ)')}
        id="rc_lab6-server-code"
        checked={!!checked['rc_lab6-server-code']}
        onCheck={() => toggleCheck('rc_lab6-server-code')}
      >
        <Code>{`/* tcp_server_iterative.c
 * Iterative echo server: serves one client at a time.
 * Usage: ./server <port>
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define BACKLOG 5
#define BUFSIZE 1024

int main(int argc, char *argv[]) {
    if (argc != 2) { fprintf(stderr, "Usage: %s <port>\\n", argv[0]); exit(1); }
    int port = atoi(argv[1]);

    /* 1. Create listening socket */
    int listenfd = socket(AF_INET, SOCK_STREAM, 0);
    if (listenfd < 0) { perror("socket"); exit(1); }

    /* 2. SO_REUSEADDR — avoid "Address already in use" on restart */
    int opt = 1;
    setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    /* 3. Bind to port on all interfaces */
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family      = AF_INET;
    addr.sin_port        = htons(port);
    addr.sin_addr.s_addr = INADDR_ANY;

    if (bind(listenfd, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        perror("bind"); exit(1);
    }

    /* 4. Start listening */
    if (listen(listenfd, BACKLOG) < 0) { perror("listen"); exit(1); }
    printf("Server listening on port %d...\\n", port);

    /* 5. Accept loop — one client at a time */
    for (;;) {
        struct sockaddr_in caddr;
        socklen_t clen = sizeof(caddr);

        int connfd = accept(listenfd, (struct sockaddr *)&caddr, &clen);
        if (connfd < 0) { perror("accept"); continue; }

        char cip[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &caddr.sin_addr, cip, sizeof(cip));
        printf("Client connected: %s:%d\\n", cip, ntohs(caddr.sin_port));

        /* 6. Echo loop for this client */
        char buf[BUFSIZE];
        int n;
        while ((n = recv(connfd, buf, sizeof(buf), 0)) > 0) {
            send(connfd, buf, n, 0);  // echo back
        }

        /* 7. Client disconnected or error */
        printf("Client disconnected\\n");
        close(connfd);
    }

    close(listenfd);
    return 0;
}`}</Code>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('2. TCP Client', '2. Client TCP')}
      </h3>

      <Section
        title={t('Complete TCP client', 'Client TCP complet')}
        id="rc_lab6-client-code"
        checked={!!checked['rc_lab6-client-code']}
        onCheck={() => toggleCheck('rc_lab6-client-code')}
      >
        <Code>{`/* tcp_client.c
 * Usage: ./client <server_ip> <port>
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define BUFSIZE 1024

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <ip> <port>\\n", argv[0]); exit(1);
    }

    /* 1. Create socket */
    int sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) { perror("socket"); exit(1); }

    /* 2. Fill server address */
    struct sockaddr_in saddr;
    memset(&saddr, 0, sizeof(saddr));
    saddr.sin_family = AF_INET;
    saddr.sin_port   = htons(atoi(argv[2]));
    if (inet_pton(AF_INET, argv[1], &saddr.sin_addr) <= 0) {
        fprintf(stderr, "Invalid IP: %s\\n", argv[1]); exit(1);
    }

    /* 3. Connect to server */
    if (connect(sockfd, (struct sockaddr *)&saddr, sizeof(saddr)) < 0) {
        perror("connect"); exit(1);
    }
    printf("Connected to %s:%s\\n", argv[1], argv[2]);

    /* 4. Send/receive loop */
    char buf[BUFSIZE];
    while (fgets(buf, sizeof(buf), stdin)) {
        int len = strlen(buf);
        send(sockfd, buf, len, 0);

        char reply[BUFSIZE];
        int n = recv(sockfd, reply, sizeof(reply) - 1, 0);
        if (n <= 0) break;
        reply[n] = '\\0';
        printf("Echo: %s", reply);
    }

    close(sockfd);
    return 0;
}`}</Code>
        <p className="mt-2 text-sm">
          {t(
            'Test: open two terminals. Run ./server 9999 in one, ./client 127.0.0.1 9999 in the other. Type lines — the server echoes them back.',
            'Test: deschideti doua terminale. Rulati ./server 9999 intr-unul, ./client 127.0.0.1 9999 in celalalt. Tastati linii — serverul le trimite inapoi.'
          )}
        </p>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('3. Lab Exercises', '3. Exercitii de laborator')}
      </h3>

      <Section
        title={t('Exercise 1: Time server', 'Exercitiul 1: Server de timp')}
        id="rc_lab6-ex1"
        checked={!!checked['rc_lab6-ex1']}
        onCheck={() => toggleCheck('rc_lab6-ex1')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Modify the echo server: instead of echoing, the server sends the current date and time (from time()/ctime()) to the client immediately after accepting, then closes the connection.',
            'Modificati serverul echo: in loc sa faca echo, serverul trimite data si ora curenta (din time()/ctime()) clientului imediat dupa acceptare, apoi inchide conexiunea.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`// In the accept loop, replace echo section with:
#include <time.h>

time_t now = time(NULL);
char *timestr = ctime(&now);
send(connfd, timestr, strlen(timestr), 0);
close(connfd);`}</Code>
          }
        />
      </Section>

      <Section
        title={t('Exercise 2: Uppercase echo server', 'Exercitiul 2: Server echo cu majuscule')}
        id="rc_lab6-ex2"
        checked={!!checked['rc_lab6-ex2']}
        onCheck={() => toggleCheck('rc_lab6-ex2')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Modify the echo server to convert the received message to uppercase before sending it back. The client sends lowercase text, the server replies in UPPERCASE.',
            'Modificati serverul echo pentru a converti mesajul primit la majuscule inainte de a-l trimite inapoi. Clientul trimite text cu litere mici, serverul raspunde cu MAJUSCULE.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`#include <ctype.h>

// Inside recv loop:
int n = recv(connfd, buf, sizeof(buf), 0);
if (n <= 0) break;

for (int i = 0; i < n; i++)
    buf[i] = toupper((unsigned char)buf[i]);

send(connfd, buf, n, 0);`}</Code>
          }
        />
      </Section>

      <Section
        title={t('Exercise 3: Reverse string server', 'Exercitiul 3: Server inversare sir')}
        id="rc_lab6-ex3"
        checked={!!checked['rc_lab6-ex3']}
        onCheck={() => toggleCheck('rc_lab6-ex3')}
      >
        <p className="mb-2 text-sm">
          {t(
            'The server receives a line of text, reverses it character-by-character, and sends it back. Example: "hello" → "olleh".',
            'Serverul primeste o linie de text, o inverseaza caracter cu caracter si o trimite inapoi. Exemplu: "hello" → "olleh".'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`// Inside recv loop:
int n = recv(connfd, buf, sizeof(buf) - 1, 0);
if (n <= 0) break;

// Reverse in-place
int lo = 0, hi = n - 1;
while (lo < hi) {
    char tmp = buf[lo];
    buf[lo++] = buf[hi];
    buf[hi--] = tmp;
}
send(connfd, buf, n, 0);`}</Code>
          }
        />
      </Section>
    </>
  );
}
