import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function RcLab04() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: RC - Lab #4, UAIC — socketpair() and bidirectional IPC',
          'Sursa: RC - Laborator #4, UAIC — socketpair() si IPC bidirectional'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('RC Lab #4: socketpair() — Bidirectional IPC', 'RC Laborator #4: socketpair() — IPC Bidirectional')}
        </p>
        <p className="text-sm">
          {t(
            'socketpair() creates a pair of connected UNIX domain sockets, enabling full-duplex communication between related processes — unlike pipes which are unidirectional.',
            'socketpair() creeaza o pereche de socket-uri UNIX domain conectate, permitand comunicare full-duplex intre procese inrudite — spre deosebire de pipe-uri care sunt unidirectionale.'
          )}
        </p>
      </Box>

      <h3 className="text-lg font-bold mt-6 mb-3">
        {t('1. socketpair() API', '1. API-ul socketpair()')}
      </h3>

      <Section
        title={t('socketpair() — creating a connected socket pair', 'socketpair() — crearea unei perechi de socket-uri conectate')}
        id="rc_lab4-socketpair-api"
        checked={!!checked['rc_lab4-socketpair-api']}
        onCheck={() => toggleCheck('rc_lab4-socketpair-api')}
      >
        <p className="mb-2 text-sm font-semibold">{t('Signature:', 'Semnatura:')}</p>
        <Code>{`int socketpair(int domain, int type, int protocol, int sv[2]);`}</Code>
        <p className="mb-2 mt-2 text-sm font-semibold">{t('Parameters:', 'Parametri:')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm mb-3">
          <li><code>domain</code> — {t('always AF_UNIX (local, same machine)', 'intotdeauna AF_UNIX (local, aceeasi masina)')}</li>
          <li><code>type</code> — <code>SOCK_STREAM</code> {t('(TCP-like, ordered) or', '(similar TCP, ordonat) sau')} <code>SOCK_DGRAM</code> {t('(UDP-like, message boundaries)', '(similar UDP, cu limite de mesaj)')}</li>
          <li><code>protocol</code> — {t('0 (default for the type)', '0 (implicit pentru tip)')}</li>
          <li><code>sv[2]</code> — {t('output: two connected socket FDs', 'iesire: doi descriptori de socket conectati')}</li>
        </ul>
        <p className="mb-2 text-sm">
          {t(
            'After socketpair(), sv[0] and sv[1] are connected: data written to sv[0] can be read from sv[1] and vice versa. After fork(), the parent typically uses sv[0] and the child uses sv[1] — both close the other end.',
            'Dupa socketpair(), sv[0] si sv[1] sunt conectati: datele scrise in sv[0] pot fi citite din sv[1] si invers. Dupa fork(), parintele foloseste de obicei sv[0] iar copilul sv[1] — ambii inchid celalalt capat.'
          )}
        </p>
        <Box type="info">
          <p className="text-sm">
            {t(
              'Unlike a pipe, socketpair() is bidirectional — the parent can read replies from the child on the same fd it used to write, and vice versa. No need for two pipes.',
              'Spre deosebire de un pipe, socketpair() este bidirectional — parintele poate citi raspunsuri de la copil pe acelasi fd pe care l-a folosit pentru scriere, si invers. Nu sunt necesare doua pipe-uri.'
            )}
          </p>
        </Box>
      </Section>

      <Section
        title={t('Full example: parent-child request/reply', 'Exemplu complet: cerere/raspuns parinte-copil')}
        id="rc_lab4-socketpair-example"
        checked={!!checked['rc_lab4-socketpair-example']}
        onCheck={() => toggleCheck('rc_lab4-socketpair-example')}
      >
        <Code>{`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/wait.h>

int main() {
    int sv[2];

    if (socketpair(AF_UNIX, SOCK_STREAM, 0, sv) < 0) {
        perror("socketpair"); exit(1);
    }

    pid_t pid = fork();
    if (pid < 0) { perror("fork"); exit(1); }

    if (pid == 0) {
        /* ---- Child: uses sv[1] ---- */
        close(sv[0]);

        char buf[64];
        // Read request from parent
        int n = read(sv[1], buf, sizeof(buf) - 1);
        buf[n] = '\\0';
        printf("Child got: %s\\n", buf);

        // Send reply
        char reply[] = "Hello from child";
        write(sv[1], reply, strlen(reply) + 1);

        close(sv[1]);
        exit(0);
    } else {
        /* ---- Parent: uses sv[0] ---- */
        close(sv[1]);

        // Send request
        char msg[] = "Hello from parent";
        write(sv[0], msg, strlen(msg) + 1);

        // Read reply
        char buf[64];
        int n = read(sv[0], buf, sizeof(buf) - 1);
        buf[n] = '\\0';
        printf("Parent got: %s\\n", buf);

        close(sv[0]);
        wait(NULL);
    }
    return 0;
}`}</Code>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('2. socketpair() vs pipe()', '2. socketpair() vs pipe()')}
      </h3>

      <Section
        title={t('Comparison: pipe vs socketpair', 'Comparatie: pipe vs socketpair')}
        id="rc_lab4-comparison"
        checked={!!checked['rc_lab4-comparison']}
        onCheck={() => toggleCheck('rc_lab4-comparison')}
      >
        <ul className="list-disc ml-5 space-y-2 text-sm">
          <li>
            <strong>pipe()</strong>: {t('unidirectional (data flows one way). Two pipes needed for full-duplex. Simple, classic.', 'unidirectional (datele curg intr-un singur sens). Doua pipe-uri necesare pentru full-duplex. Simplu, clasic.')}
          </li>
          <li>
            <strong>socketpair()</strong>: {t('bidirectional (each fd can read and write). One pair gives full-duplex. More powerful.', 'bidirectional (fiecare fd poate citi si scrie). O singura pereche ofera full-duplex. Mai puternic.')}
          </li>
          <li>
            <strong>{t('Both:', 'Ambele:')}</strong> {t('local IPC only, related processes only (share FDs via fork), kernel-buffered.', 'IPC local numai, procese inrudite numai (partajeaza FD-uri prin fork), buffer in kernel.')}
          </li>
          <li>
            <strong>{t('socketpair advantage:', 'Avantaj socketpair:')}</strong> {t('works with send()/recv() flags, supports MSG_PEEK, MSG_WAITALL, etc.', 'functioneaza cu flaguri send()/recv(), suporta MSG_PEEK, MSG_WAITALL, etc.')}
          </li>
        </ul>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('3. Lab Exercises', '3. Exercitii de laborator')}
      </h3>

      <Section
        title={t('Exercise 1: Calculator server via socketpair', 'Exercitiul 1: Server calculator prin socketpair')}
        id="rc_lab4-ex1"
        checked={!!checked['rc_lab4-ex1']}
        onCheck={() => toggleCheck('rc_lab4-ex1')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Parent (client) sends two integers to the child (server) via socketpair. The child adds them and sends the result back. The parent prints the result.',
            'Parintele (client) trimite doua numere intregi copilului (server) prin socketpair. Copilul le aduna si trimite rezultatul inapoi. Parintele afiseaza rezultatul.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/wait.h>

int main() {
    int sv[2];
    socketpair(AF_UNIX, SOCK_STREAM, 0, sv);

    pid_t pid = fork();
    if (pid == 0) {
        // Child: server
        close(sv[0]);
        int a, b;
        read(sv[1], &a, sizeof(a));
        read(sv[1], &b, sizeof(b));
        int sum = a + b;
        write(sv[1], &sum, sizeof(sum));
        close(sv[1]);
        exit(0);
    } else {
        // Parent: client
        close(sv[1]);
        int a = 42, b = 58, result;
        write(sv[0], &a, sizeof(a));
        write(sv[0], &b, sizeof(b));
        read(sv[0], &result, sizeof(result));
        printf("%d + %d = %d\\n", a, b, result);
        close(sv[0]);
        wait(NULL);
    }
    return 0;
}`}</Code>
          }
        />
      </Section>

      <Section
        title={t('Exercise 2: Multiple children with individual socket pairs', 'Exercitiul 2: Mai multi copii cu perechi individuale de socket-uri')}
        id="rc_lab4-ex2"
        checked={!!checked['rc_lab4-ex2']}
        onCheck={() => toggleCheck('rc_lab4-ex2')}
      >
        <p className="mb-2 text-sm">
          {t(
            'Fork 3 children. Give each its own socketpair channel. Parent sends child index N; each child replies "Child N done". Parent collects all replies.',
            'Faceti fork la 3 copii. Oferiti fiecaruia propriul canal socketpair. Parintele trimite indexul N al copilului; fiecare copil raspunde "Child N done". Parintele colecteaza toate raspunsurile.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/wait.h>

#define N 3

int main() {
    int sv[N][2];
    int i;

    for (i = 0; i < N; i++)
        socketpair(AF_UNIX, SOCK_STREAM, 0, sv[i]);

    for (i = 0; i < N; i++) {
        pid_t pid = fork();
        if (pid == 0) {
            // Child i: close all other pairs
            int j;
            for (j = 0; j < N; j++)
                if (j != i) { close(sv[j][0]); close(sv[j][1]); }
            close(sv[i][0]);

            int idx;
            read(sv[i][1], &idx, sizeof(idx));
            char reply[32];
            snprintf(reply, sizeof(reply), "Child %d done", idx);
            write(sv[i][1], reply, strlen(reply) + 1);
            close(sv[i][1]);
            exit(0);
        }
        close(sv[i][1]);  // parent closes child side
    }

    // Parent sends to each child and reads reply
    char buf[32];
    for (i = 0; i < N; i++) {
        write(sv[i][0], &i, sizeof(i));
        read(sv[i][0], buf, sizeof(buf));
        printf("Parent got: %s\\n", buf);
        close(sv[i][0]);
    }
    for (i = 0; i < N; i++) wait(NULL);
    return 0;
}`}</Code>
          }
        />
      </Section>
    </>
  );
}
