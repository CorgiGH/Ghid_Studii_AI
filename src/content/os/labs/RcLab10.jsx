import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function RcLab10() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: RC - Lab #10, UAIC — UDP client/server with sendto()/recvfrom()',
          'Sursa: RC - Laborator #10, UAIC — Client/server UDP cu sendto()/recvfrom()'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('RC Lab #10: UDP Client/Server', 'RC Laborator #10: Client/Server UDP')}
        </p>
        <p className="text-sm">
          {t(
            'UDP is connectionless — no handshake, no established connection, no guaranteed delivery. Each datagram is independent. This lab implements a UDP echo server and client using sendto()/recvfrom().',
            'UDP este fara conexiune — fara handshake, fara conexiune stabilita, fara livrare garantata. Fiecare datagram este independent. Acest laborator implementeaza un server si client UDP echo folosind sendto()/recvfrom().'
          )}
        </p>
      </Box>

      <h3 className="text-lg font-bold mt-6 mb-3">
        {t('1. UDP vs TCP — Key Differences', '1. UDP vs TCP — Diferente cheie')}
      </h3>

      <Section
        title={t('UDP characteristics and use cases', 'Caracteristicile UDP si cazuri de utilizare')}
        id="rc_lab10-udp-chars"
        checked={!!checked['rc_lab10-udp-chars']}
        onCheck={() => toggleCheck('rc_lab10-udp-chars')}
      >
        <ul className="list-disc ml-5 space-y-2 text-sm mb-3">
          <li><strong>{t('No connection:', 'Fara conexiune:')}</strong> {t('Server never calls connect() or accept(). No 3-way handshake.', 'Serverul nu apeleaza niciodata connect() sau accept(). Fara handshake in 3 pasi.')}</li>
          <li><strong>{t('No guaranteed delivery:', 'Fara livrare garantata:')}</strong> {t('Datagrams may be lost, reordered, or duplicated. Application must handle this if needed.', 'Datagramele pot fi pierdute, reordonate sau duplicate. Aplicatia trebuie sa gestioneze daca este necesar.')}</li>
          <li><strong>{t('Message boundaries preserved:', 'Limitele mesajelor pastrate:')}</strong> {t('Each recvfrom() returns exactly one sendto() datagram — unlike TCP where recv() may return partial data.', 'Fiecare recvfrom() returneaza exact un datagram sendto() — spre deosebire de TCP unde recv() poate returna date partiale.')}</li>
          <li><strong>{t('Lower overhead:', 'Overhead mai mic:')}</strong> {t('No connection state, smaller headers, lower latency.', 'Fara stare de conexiune, headere mai mici, latenta mai mica.')}</li>
          <li><strong>{t('Use cases:', 'Cazuri de utilizare:')}</strong> DNS, DHCP, VoIP, video streaming, online games, NTP</li>
        </ul>
        <Box type="info">
          <p className="text-sm">
            {t(
              'UDP server uses the same socket for ALL clients — it does not accept() per client. Client address is passed to recvfrom() and used by sendto() to reply.',
              'Serverul UDP foloseste acelasi socket pentru TOTI clientii — nu face accept() per client. Adresa clientului este trecuta la recvfrom() si folosita de sendto() pentru a raspunde.'
            )}
          </p>
        </Box>
      </Section>

      <h3 className="text-lg font-bold mt-6 mb-3">
        {t('2. UDP Socket API', '2. API-ul socket-ului UDP')}
      </h3>

      <Section
        title={t('sendto() and recvfrom() signatures', 'Semnaturile sendto() si recvfrom()')}
        id="rc_lab10-udp-api"
        checked={!!checked['rc_lab10-udp-api']}
        onCheck={() => toggleCheck('rc_lab10-udp-api')}
      >
        <Code>{`/* sendto — send a datagram to a specific address */
ssize_t sendto(int sockfd,
               const void *buf, size_t len,
               int flags,
               const struct sockaddr *dest_addr,
               socklen_t addrlen);

/* recvfrom — receive a datagram and get sender's address */
ssize_t recvfrom(int sockfd,
                 void *buf, size_t len,
                 int flags,
                 struct sockaddr *src_addr,   /* filled in by kernel */
                 socklen_t *addrlen);          /* in/out parameter */

/* flags: usually 0
 * src_addr and addrlen can be NULL if sender address not needed
 */`}</Code>
        <p className="mt-2 text-sm">
          {t(
            'The key difference from TCP: you must specify the destination address in every sendto() call (no implicit connection). recvfrom() fills in the sender\'s address so you can reply to it.',
            'Diferenta cheie fata de TCP: trebuie sa specificati adresa de destinatie in fiecare apel sendto() (fara conexiune implicita). recvfrom() completeaza adresa expeditorului pentru a-i putea raspunde.'
          )}
        </p>
      </Section>

      <Section
        title={t('Complete UDP echo server', 'Server UDP echo complet')}
        id="rc_lab10-udp-server"
        checked={!!checked['rc_lab10-udp-server']}
        onCheck={() => toggleCheck('rc_lab10-udp-server')}
      >
        <Code>{`/* udp_server.c
 * UDP echo server — no accept(), one socket for all clients.
 * Usage: ./udpserver <port>
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
    if (argc != 2) { fprintf(stderr, "Usage: %s <port>\\n", argv[0]); exit(1); }

    /* 1. Create UDP socket */
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) { perror("socket"); exit(1); }

    /* 2. Bind to port */
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family      = AF_INET;
    addr.sin_port        = htons(atoi(argv[1]));
    addr.sin_addr.s_addr = INADDR_ANY;
    if (bind(sockfd, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        perror("bind"); exit(1);
    }
    printf("UDP server listening on port %s\\n", argv[1]);

    /* 3. Receive/send loop — NO listen(), NO accept() */
    char buf[BUFSIZE];
    for (;;) {
        struct sockaddr_in caddr;
        socklen_t clen = sizeof(caddr);

        int n = recvfrom(sockfd, buf, sizeof(buf), 0,
                         (struct sockaddr *)&caddr, &clen);
        if (n < 0) { perror("recvfrom"); continue; }

        char cip[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &caddr.sin_addr, cip, sizeof(cip));
        printf("Datagram from %s:%d (%d bytes)\\n",
               cip, ntohs(caddr.sin_port), n);

        /* Echo back to sender */
        sendto(sockfd, buf, n, 0,
               (struct sockaddr *)&caddr, clen);
    }

    close(sockfd);
    return 0;
}`}</Code>
      </Section>

      <Section
        title={t('Complete UDP echo client', 'Client UDP echo complet')}
        id="rc_lab10-udp-client"
        checked={!!checked['rc_lab10-udp-client']}
        onCheck={() => toggleCheck('rc_lab10-udp-client')}
      >
        <Code>{`/* udp_client.c
 * Usage: ./udpclient <server_ip> <port>
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

    /* 1. Create UDP socket — no connect() needed */
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) { perror("socket"); exit(1); }

    /* 2. Fill server address */
    struct sockaddr_in saddr;
    memset(&saddr, 0, sizeof(saddr));
    saddr.sin_family = AF_INET;
    saddr.sin_port   = htons(atoi(argv[2]));
    if (inet_pton(AF_INET, argv[1], &saddr.sin_addr) <= 0) {
        fprintf(stderr, "Invalid IP\\n"); exit(1);
    }

    char buf[BUFSIZE];
    char reply[BUFSIZE];

    while (fgets(buf, sizeof(buf), stdin)) {
        int len = strlen(buf);

        /* Send datagram to server */
        sendto(sockfd, buf, len, 0,
               (struct sockaddr *)&saddr, sizeof(saddr));

        /* Receive reply (could set timeout with setsockopt SO_RCVTIMEO) */
        struct sockaddr_in raddr;
        socklen_t rlen = sizeof(raddr);
        int n = recvfrom(sockfd, reply, sizeof(reply) - 1, 0,
                         (struct sockaddr *)&raddr, &rlen);
        if (n < 0) { perror("recvfrom"); break; }
        reply[n] = '\\0';
        printf("Echo: %s", reply);
    }

    close(sockfd);
    return 0;
}`}</Code>
        <p className="mt-2 text-sm">
          {t(
            'Test: ./udpserver 9999 in one terminal, ./udpclient 127.0.0.1 9999 in another. The client sends lines, server echoes them back.',
            'Test: ./udpserver 9999 intr-un terminal, ./udpclient 127.0.0.1 9999 in altul. Clientul trimite linii, serverul le trimite inapoi.'
          )}
        </p>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('3. Lab Exercises', '3. Exercitii de laborator')}
      </h3>

      <Section
        title={t('Exercise 1: UDP time server', 'Exercitiul 1: Server UDP de timp')}
        id="rc_lab10-ex1"
        checked={!!checked['rc_lab10-ex1']}
        onCheck={() => toggleCheck('rc_lab10-ex1')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Write a UDP server that ignores the content of incoming datagrams and always replies with the current date and time (from ctime(time(NULL))). The client sends any text and prints the server\'s reply.',
            'Scrieti un server UDP care ignora continutul datagramelor primite si raspunde intotdeauna cu data si ora curenta (din ctime(time(NULL))). Clientul trimite orice text si afiseaza raspunsul serverului.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`// In server recv/send loop (replace echo):
#include <time.h>

// Receive (to get client address — ignore content)
recvfrom(sockfd, buf, sizeof(buf), 0,
         (struct sockaddr *)&caddr, &clen);

// Send current time
time_t now = time(NULL);
char *ts = ctime(&now);
sendto(sockfd, ts, strlen(ts), 0,
       (struct sockaddr *)&caddr, clen);`}</Code>
          }
        />
      </Section>

      <Section
        title={t('Exercise 2: UDP with receive timeout', 'Exercitiul 2: UDP cu timeout la primire')}
        id="rc_lab10-ex2"
        checked={!!checked['rc_lab10-ex2']}
        onCheck={() => toggleCheck('rc_lab10-ex2')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Modify the UDP client to set a 3-second receive timeout using SO_RCVTIMEO. If no reply arrives within 3 seconds, print "Request timed out" and try sending again (up to 3 retries).',
            'Modificati clientul UDP pentru a seta un timeout de primire de 3 secunde folosind SO_RCVTIMEO. Daca nu soseste niciun raspuns in 3 secunde, afisati "Request timed out" si incercati din nou (pana la 3 reincercari).'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`/* Set receive timeout on UDP socket */
struct timeval tv = { .tv_sec = 3, .tv_usec = 0 };
setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));

/* Send with retry */
int retries = 3;
while (retries > 0) {
    sendto(sockfd, buf, len, 0,
           (struct sockaddr *)&saddr, sizeof(saddr));

    int n = recvfrom(sockfd, reply, sizeof(reply) - 1, 0, NULL, NULL);
    if (n > 0) {
        reply[n] = '\\0';
        printf("Echo: %s", reply);
        break;
    } else {
        // errno == EAGAIN or EWOULDBLOCK on timeout
        printf("Request timed out (retries left: %d)\\n", --retries);
    }
}
if (retries == 0) printf("No response after 3 attempts\\n");`}</Code>
          }
        />
      </Section>

      <Section
        title={t('Exercise 3: UDP broadcast', 'Exercitiul 3: Broadcast UDP')}
        id="rc_lab10-ex3"
        checked={!!checked['rc_lab10-ex3']}
        onCheck={() => toggleCheck('rc_lab10-ex3')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Write a UDP broadcaster: enable SO_BROADCAST on the socket, send a datagram to 255.255.255.255:<port>. Write a receiver that binds to INADDR_ANY and prints the received broadcast messages.',
            'Scrieti un broadcaster UDP: activati SO_BROADCAST pe socket, trimiteti un datagram la 255.255.255.255:<port>. Scrieti un receptor care se leaga la INADDR_ANY si afiseaza mesajele broadcast primite.'
          )}
        </p>
        <Toggle
          question={t('Show broadcaster', 'Arata broadcaster-ul')}
          answer={
            <Code>{`// Broadcaster
int sockfd = socket(AF_INET, SOCK_DGRAM, 0);

int bc = 1;
setsockopt(sockfd, SOL_SOCKET, SO_BROADCAST, &bc, sizeof(bc));

struct sockaddr_in baddr;
memset(&baddr, 0, sizeof(baddr));
baddr.sin_family      = AF_INET;
baddr.sin_port        = htons(9999);
baddr.sin_addr.s_addr = inet_addr("255.255.255.255");

char msg[] = "Hello LAN!";
sendto(sockfd, msg, strlen(msg), 0,
       (struct sockaddr *)&baddr, sizeof(baddr));
close(sockfd);

// Receiver: bind INADDR_ANY:9999, recvfrom — same as normal UDP server`}</Code>
          }
        />
      </Section>
    </>
  );
}
