import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Seminar04() {
  const { t, checked, toggleCheck } = useApp();
  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Week 4 — Solved Exercises: File I/O & File Locking in C', 'Săptămâna 4 — Exerciții rezolvate: I/O fișiere și blocaje pe fișiere în C')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('C workflow: edit → compile → run', 'Fluxul de lucru C: editare → compilare → rulare')}</li>
          <li>{t('File processing with POSIX API (open/read/write/close)', 'Procesarea fișierelor cu API-ul POSIX (open/read/write/close)')}</li>
          <li>{t('Implementing Linux commands in C (cp, cat, head)', 'Implementarea comenzilor Linux în C (cp, cat, head)')}</li>
          <li>{t('File locking with fcntl (read/write locks, CREW)', 'Blocaje pe fișiere cu fcntl (read/write locks, CREW)')}</li>
        </ol>
      </Box>

      <Section title={t('1. First C Program — The Workflow', '1. Primul program C — Fluxul de lucru')} id="s4-workflow" checked={!!checked['s4-workflow']} onCheck={() => toggleCheck('s4-workflow')}>
        <Code>{`// hello.c
#include <stdio.h>
int main() {
    printf("Hello, Linux!\\n");
    return 0;
}

// Compile and run:
// $ gcc -Wall -o hello hello.c
// $ ./hello`}</Code>
        <Box type="warning">
          <p className="font-bold">{t('Always compile with -Wall:', 'Compilați întotdeauna cu -Wall:')}</p>
          <p className="text-sm">{t('The -Wall flag enables all warnings. Fix ALL warnings before running — they often indicate real bugs.', 'Flag-ul -Wall activează toate avertismentele. Rezolvați TOATE avertismentele înainte de rulare — ele indică adesea bug-uri reale.')}</p>
        </Box>
      </Section>

      <Section title={t('2. MyCp — File Copy with POSIX API', '2. MyCp — Copiere fișiere cu API-ul POSIX')} id="s4-mycp" checked={!!checked['s4-mycp']} onCheck={() => toggleCheck('s4-mycp')}>
        <p>{t('Copy a file using only POSIX system calls (no fopen/fread):', 'Copierea unui fișier folosind doar apeluri de sistem POSIX (fără fopen/fread):')}</p>
        <Code>{`#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>
#define BUF 4096

int main(int argc, char *argv[]) {
    if (argc != 3) { fprintf(stderr, "Usage: %s src dst\\n", argv[0]); return 1; }
    int in = open(argv[1], O_RDONLY);
    if (in < 0) { perror("open src"); return 1; }
    int out = open(argv[2], O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (out < 0) { perror("open dst"); close(in); return 1; }

    char buf[BUF];
    ssize_t n;
    while ((n = read(in, buf, BUF)) > 0)
        write(out, buf, n);

    close(in);
    close(out);
    return 0;
}`}</Code>
        <Box type="theorem">
          <p className="font-bold">{t('Key pattern: open → read/write loop → close', 'Pattern cheie: open → buclă read/write → close')}</p>
          <p className="text-sm">{t('Buffer size 4096 (one page) is optimal. Always check return values of open() and handle errors with perror().', 'Dimensiunea buffer-ului 4096 (o pagină) este optimă. Verificați întotdeauna valorile returnate de open() și tratați erorile cu perror().')}</p>
        </Box>
      </Section>

      <Section title={t('3. MyCat — Display File Contents', '3. MyCat — Afișarea conținutului fișierului')} id="s4-mycat" checked={!!checked['s4-mycat']} onCheck={() => toggleCheck('s4-mycat')}>
        <Code>{`#include <fcntl.h>
#include <unistd.h>
#define BUF 4096

int main(int argc, char *argv[]) {
    int fd = (argc > 1) ? open(argv[1], O_RDONLY) : STDIN_FILENO;
    if (fd < 0) { perror("open"); return 1; }

    char buf[BUF];
    ssize_t n;
    while ((n = read(fd, buf, BUF)) > 0)
        write(STDOUT_FILENO, buf, n);

    if (fd != STDIN_FILENO) close(fd);
    return 0;
}`}</Code>
        <p className="text-sm mt-2">{t('If no file argument given, reads from stdin (fd 0). Output goes to stdout (fd 1).', 'Dacă nu se dă argument de fișier, citește de la stdin (fd 0). Output-ul merge la stdout (fd 1).')}</p>
      </Section>

      <Section title={t('4. Directory Traversal', '4. Parcurgerea directoarelor')} id="s4-dir" checked={!!checked['s4-dir']} onCheck={() => toggleCheck('s4-dir')}>
        <Code>{`#include <dirent.h>
#include <stdio.h>
#include <sys/stat.h>

int main(int argc, char *argv[]) {
    const char *path = (argc > 1) ? argv[1] : ".";
    DIR *d = opendir(path);
    if (!d) { perror("opendir"); return 1; }

    struct dirent *entry;
    while ((entry = readdir(d)) != NULL) {
        if (entry->d_name[0] == '.') continue;  // skip hidden
        struct stat st;
        char fullpath[1024];
        snprintf(fullpath, sizeof(fullpath), "%s/%s", path, entry->d_name);
        stat(fullpath, &st);
        printf("%s  %ld bytes\\n", entry->d_name, st.st_size);
    }
    closedir(d);
    return 0;
}`}</Code>
      </Section>

      <Section title={t('5. File Locking — Critical Section', '5. Blocaje pe fișiere — Secțiune critică')} id="s4-lock" checked={!!checked['s4-lock']} onCheck={() => toggleCheck('s4-lock')}>
        <Code>{`#include <fcntl.h>
#include <unistd.h>

void lock_file(int fd, short type) {  // F_WRLCK or F_RDLCK
    struct flock fl = { .l_type = type, .l_whence = SEEK_SET,
                        .l_start = 0, .l_len = 0 };  // whole file
    fcntl(fd, F_SETLKW, &fl);  // blocking wait
}
void unlock_file(int fd) {
    struct flock fl = { .l_type = F_UNLCK, .l_whence = SEEK_SET,
                        .l_start = 0, .l_len = 0 };
    fcntl(fd, F_SETLK, &fl);
}

// Usage in critical section:
lock_file(fd, F_WRLCK);   // acquire write lock
// ... critical section: read-modify-write ...
unlock_file(fd);           // release`}</Code>
        <Box type="warning">
          <p className="font-bold">{t('Locks are advisory!', 'Blocajele sunt advisory!')}</p>
          <p className="text-sm">{t('POSIX locks do NOT prevent other processes from reading/writing the file — they only block processes that also use locks. ALL cooperating processes must use locks for them to work.', 'Blocajele POSIX NU împiedică alte procese să citească/scrie fișierul — ele blochează doar procesele care folosesc și ele blocaje. TOATE procesele cooperante trebuie să folosească blocaje pentru ca acestea să funcționeze.')}</p>
        </Box>
      </Section>
    </>
  );
}
