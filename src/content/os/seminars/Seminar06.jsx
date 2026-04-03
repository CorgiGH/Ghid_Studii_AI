import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Seminar06() {
  const { t, checked, toggleCheck } = useApp();
  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Week 6 — Solved Exercises: mmap & Shared Memory', 'Săptămâna 6 — Exerciții rezolvate: mmap și memorie partajată')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Memory-mapped file processing (mmap/munmap/msync)', 'Procesarea fișierelor mapate în memorie (mmap/munmap/msync)')}</li>
          <li>{t('Anonymous shared memory for IPC (MAP_SHARED|MAP_ANONYMOUS)', 'Memorie partajată anonimă pentru IPC (MAP_SHARED|MAP_ANONYMOUS)')}</li>
          <li>{t('POSIX shared memory objects (shm_open/shm_unlink)', 'Obiecte de memorie partajată POSIX (shm_open/shm_unlink)')}</li>
          <li>{t('Synchronization with semaphores (sem_open/sem_wait/sem_post)', 'Sincronizare cu semaphore-uri (sem_open/sem_wait/sem_post)')}</li>
        </ol>
      </Box>

      <Section title={t('1. File Processing with mmap', '1. Procesarea fișierelor cu mmap')} id="s6-mmap" checked={!!checked['s6-mmap']} onCheck={() => toggleCheck('s6-mmap')}>
        <Code>{`#include <sys/mman.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h>

int main(int argc, char *argv[]) {
    int fd = open(argv[1], O_RDONLY);
    struct stat st;
    fstat(fd, &st);

    // Map file into memory
    char *data = mmap(NULL, st.st_size, PROT_READ, MAP_PRIVATE, fd, 0);
    close(fd);  // fd can be closed after mmap

    // Process directly in memory (e.g., count lines)
    int lines = 0;
    for (off_t i = 0; i < st.st_size; i++)
        if (data[i] == '\\n') lines++;
    printf("Lines: %d\\n", lines);

    munmap(data, st.st_size);
    return 0;
}`}</Code>
        <Box type="theorem">
          <p className="font-bold">{t('mmap advantage:', 'Avantajul mmap:')}</p>
          <p className="text-sm">{t('No read()/write() calls needed — access file contents directly through pointer arithmetic. Kernel loads pages on demand via page faults.', 'Nu sunt necesare apeluri read()/write() — accesați conținutul fișierului direct prin aritmetică de pointeri. Kernel-ul încarcă paginile la cerere prin page faults.')}</p>
        </Box>
      </Section>

      <Section title={t('2. File Copy with mmap', '2. Copiere fișiere cu mmap')} id="s6-copy" checked={!!checked['s6-copy']} onCheck={() => toggleCheck('s6-copy')}>
        <Code>{`int fd_src = open(src, O_RDONLY);
struct stat st; fstat(fd_src, &st);
char *src_map = mmap(NULL, st.st_size, PROT_READ, MAP_PRIVATE, fd_src, 0);

int fd_dst = open(dst, O_RDWR | O_CREAT | O_TRUNC, 0644);
ftruncate(fd_dst, st.st_size);  // set destination size
char *dst_map = mmap(NULL, st.st_size, PROT_WRITE, MAP_SHARED, fd_dst, 0);

memcpy(dst_map, src_map, st.st_size);

msync(dst_map, st.st_size, MS_SYNC);  // flush to disk!
munmap(src_map, st.st_size);
munmap(dst_map, st.st_size);
close(fd_src); close(fd_dst);`}</Code>
        <Box type="warning">
          <p className="font-bold">{t('Always msync before munmap!', 'Întotdeauna msync înainte de munmap!')}</p>
          <p className="text-sm">{t('munmap does NOT flush dirty pages. Without msync, last writes may be lost.', 'munmap NU golește paginile modificate. Fără msync, ultimele scrieri pot fi pierdute.')}</p>
        </Box>
      </Section>

      <Section title={t('3. Anonymous Shared Memory', '3. Memorie partajată anonimă')} id="s6-anon" checked={!!checked['s6-anon']} onCheck={() => toggleCheck('s6-anon')}>
        <Code>{`// Shared between parent and child (after fork)
int *counter = mmap(NULL, sizeof(int),
    PROT_READ | PROT_WRITE,
    MAP_SHARED | MAP_ANONYMOUS,  // no file, shared
    -1, 0);
*counter = 0;

pid_t pid = fork();
if (pid == 0) {
    (*counter)++;  // child modifies shared memory
    exit(0);
}
wait(NULL);
printf("Counter: %d\\n", *counter);  // parent sees child's change
munmap(counter, sizeof(int));`}</Code>
      </Section>

      <Section title={t('4. POSIX Shared Memory + Semaphores', '4. Memorie partajată POSIX + Semaphore-uri')} id="s6-posix" checked={!!checked['s6-posix']} onCheck={() => toggleCheck('s6-posix')}>
        <Code>{`#include <sys/mman.h>
#include <semaphore.h>
#include <fcntl.h>

// Create shared memory object
int shm_fd = shm_open("/myshm", O_CREAT | O_RDWR, 0666);
ftruncate(shm_fd, sizeof(int));
int *data = mmap(NULL, sizeof(int), PROT_READ | PROT_WRITE,
                 MAP_SHARED, shm_fd, 0);

// Create semaphore for synchronization
sem_t *mutex = sem_open("/mysem", O_CREAT, 0666, 1);

// Critical section
sem_wait(mutex);    // P operation (lock)
(*data)++;          // safely modify shared data
sem_post(mutex);    // V operation (unlock)

// Cleanup
sem_close(mutex);
sem_unlink("/mysem");
munmap(data, sizeof(int));
shm_unlink("/myshm");
// Compile with: gcc prog.c -lrt -lpthread`}</Code>
      </Section>
    </>
  );
}
