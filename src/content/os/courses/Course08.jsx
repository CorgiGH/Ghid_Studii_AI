import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Course08() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
              <p className="mb-3 text-sm opacity-80">Source: OS(8) - Programare de sistem in C pentru Linux (V), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Plan:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('Memory-mapped files — concept and motivation', 'Fișiere mapate în memorie — concept și motivație')}</li>
                  <li>{t('mmap() — creating file mappings', 'mmap() — crearea mapărilor de fișiere')}</li>
                  <li>{t('munmap() — removing mappings', 'munmap() — eliminarea mapărilor')}</li>
                  <li>{t('MAP_PRIVATE vs MAP_SHARED', 'MAP_PRIVATE vs. MAP_SHARED')}</li>
                  <li>{t('msync() — flushing changes to disk', 'msync() — scrierea modificărilor pe disc')}</li>
                  <li>{t('Non-persistent mappings (anonymous & named shared memory)', 'Mapări nepersistente (anonime și memorie partajată cu nume)')}</li>
                  <li>{t('POSIX shared memory API (shm_open, ftruncate, mmap)', 'API memorie partajată POSIX (shm_open, ftruncate, mmap)')}</li>
                  <li>{t('IPC models: shared memory vs message passing', 'Modele IPC: memorie partajată vs. transmitere de mesaje')}</li>
                  <li>{t('Cooperation patterns (Producer-Consumer, Supervisor-Workers, etc.)', 'Șabloane de cooperare (Producător-Consumator, Supervizor-Lucrători, etc.)')}</li>
                  <li>{t('POSIX semaphores (named and unnamed)', 'Semafoare POSIX (cu nume și fără nume)')}</li>
                </ol>
              </Box>

              <Section title={t('1. Memory-Mapped Files Concept', '1. Conceptul fișierelor mapate în memorie')} id="c8-concept" checked={!!checked['c8-concept']} onCheck={() => toggleCheck('c8-concept')}>
                <p>{t('A ', 'Un ')}<strong>{t('memory-mapped file', 'fișier mapat în memorie')}</strong>{t(" creates a direct byte-to-byte correspondence between a region of a process's virtual address space and a portion of a file on disk.", ' creează o corespondență directă octet-la-octet între o regiune din spațiul virtual de adrese al unui proces și o porțiune a unui fișier de pe disc.')}</p>

                <svg viewBox="0 0 440 160" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="20" y="10" width="160" height="80" rx="6" fill="#3b82f6" opacity="0.1" stroke="#3b82f6"/>
                  <text x="100" y="28" textAnchor="middle" fill="#3b82f6" fontWeight="bold">{t('Process virtual memory', 'Memorie virtuală proces')}</text>
                  <rect x="40" y="40" width="120" height="30" rx="4" fill="#f59e0b" opacity="0.2" stroke="#f59e0b"/>
                  <text x="100" y="60" textAnchor="middle" fill="#f59e0b" fontSize="9">{t('mapped region', 'regiune mapată')}</text>
                  <rect x="260" y="30" width="160" height="40" rx="6" fill="#10b981" opacity="0.1" stroke="#10b981"/>
                  <text x="340" y="48" textAnchor="middle" fill="#10b981" fontSize="9">{t('Open file (fd)', 'Fișier deschis (fd)')}</text>
                  <rect x="280" y="52" width="50" height="14" rx="2" fill="#f59e0b" opacity="0.3" stroke="#f59e0b"/>
                  <text x="305" y="63" textAnchor="middle" fill="#f59e0b" fontSize="7">offset</text>
                  <rect x="332" y="52" width="70" height="14" rx="2" fill="#f59e0b" opacity="0.3" stroke="#f59e0b"/>
                  <text x="367" y="63" textAnchor="middle" fill="#f59e0b" fontSize="7">length</text>
                  <line x1="160" y1="55" x2="260" y2="55" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arr)"/>
                  <text x="210" y="50" textAnchor="middle" fill="#f59e0b" fontSize="8">{t('1:1 mapping', 'mapare 1:1')}</text>
                  <text x="220" y="100" textAnchor="middle" fill="currentColor" fontSize="9">{t('Read/write memory = read/write file', 'Citire/scriere memorie = citire/scriere fișier')}</text>
                  <text x="220" y="115" textAnchor="middle" fill="currentColor" fontSize="9">{t('No need for read()/write() syscalls!', 'Nu sunt necesare apeluri read()/write()!')}</text>
                  <text x="220" y="140" textAnchor="middle" fill="#10b981" fontSize="9">{t('Backing store = the file itself (not swap)', 'Stocare de fundal = fișierul însuși (nu swap)')}</text>
                </svg>

                <Box type="theorem">
                  <p className="font-bold">{t('Why use mmap?', 'De ce să folosiți mmap?')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>{t('Access file contents ', 'Accesați conținutul fișierelor ')}<strong>{t('directly in memory', 'direct în memorie')}</strong>{t(' (pointer arithmetic, no read/write calls)', ' (aritmetică de pointeri, fără apeluri read/write)')}</li>
                    <li>{t('Multiple processes can mmap the same file → ', 'Mai multe procese pot mapa același fișier → ')}<strong>{t('shared memory IPC', 'IPC prin memorie partajată')}</strong></li>
                    <li>{t('Kernel handles page faults to load data on demand (efficient for large files)', 'Kernel-ul gestionează erorile de pagină pentru a încărca datele la cerere (eficient pentru fișiere mari)')}</li>
                  </ul>
                </Box>
              </Section>

              <Section title={t('2. mmap() and munmap()', '2. mmap() și munmap()')} id="c8-mmap" checked={!!checked['c8-mmap']} onCheck={() => toggleCheck('c8-mmap')}>
                <Box type="formula">
                  <p className="font-bold">{t('mmap — create a mapping:', 'mmap — crearea unei mapări:')}</p>
                  <Code>{`#include <sys/mman.h>
void* mmap(void* addr, size_t length, int prot,
           int flags, int fd, off_t offset);

// addr: NULL (let kernel choose) or hint address
// length: size of mapping (rounded up to page boundary)
// prot: PROT_READ | PROT_WRITE | PROT_EXEC | PROT_NONE
// flags: MAP_SHARED or MAP_PRIVATE [| MAP_ANONYMOUS ...]
// fd: file descriptor (or -1 for anonymous)
// offset: must be page-aligned (multiple of 4096)
// Returns: pointer to mapped region, or MAP_FAILED (-1)`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('munmap — remove a mapping:', 'munmap — eliminarea unei mapări:')}</p>
                  <Code>{`int munmap(void* addr, size_t length);
// addr = value returned by mmap (page-aligned)
// Returns 0 on success, -1 on error
// WARNING: does NOT auto-flush dirty pages!`}</Code>
                </Box>

                <p className="font-bold mt-2">{t('Example — read a file via mmap:', 'Exemplu — citirea unui fișier prin mmap:')}</p>
                <Code>{`int fd = open("data.txt", O_RDONLY);
struct stat sb;
fstat(fd, &sb);  // get file size

char* map = mmap(NULL, sb.st_size, PROT_READ,
                 MAP_PRIVATE, fd, 0);
close(fd);  // fd can be closed immediately after mmap!

// Access file contents directly:
for (int i = 0; i < sb.st_size; i++)
    putchar(map[i]);

munmap(map, sb.st_size);`}</Code>
              </Section>

              <Section title={t('3. MAP_PRIVATE vs MAP_SHARED', '3. MAP_PRIVATE vs. MAP_SHARED')} id="c8-flags" checked={!!checked['c8-flags']} onCheck={() => toggleCheck('c8-flags')}>
                <Box type="theorem">
                  <p className="font-bold">{t('The critical distinction:', 'Distincția critică:')}</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="text-left p-1">{t('Feature', 'Caracteristică')}</th><th className="text-left p-1">MAP_PRIVATE</th><th className="text-left p-1">MAP_SHARED</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">{t('Writes visible to other processes?', 'Scrierile sunt vizibile altor procese?')}</td><td className="p-1 text-red-400">{t('No', 'Nu')}</td><td className="p-1 text-green-400">{t('Yes', 'Da')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">{t('Writes propagated to disk file?', 'Scrierile sunt propagate la fișierul de pe disc?')}</td><td className="p-1 text-red-400">{t('No (copy-on-write)', 'Nu (copy-on-write)')}</td><td className="p-1 text-green-400">{t('Yes (eventually)', 'Da (eventual)')}</td></tr>
                      <tr><td className="p-1">{t('Use case', 'Caz de utilizare')}</td><td className="p-1">{t('Read-only views, private scratch', 'Vizualizări read-only, spațiu privat')}</td><td className="p-1">{t('IPC, persistent modification', 'IPC, modificare persistentă')}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('msync — force flush to disk:', 'msync — forțarea scrierii pe disc:')}</p>
                  <Code>{`int msync(void* addr, size_t length, int flags);
// flags: MS_SYNC (blocking) or MS_ASYNC (non-blocking)
//        optionally | MS_INVALIDATE

// ALWAYS msync before munmap for shared mappings!
msync(map, length, MS_SYNC);
munmap(map, length);`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Critical trap:', 'Capcană critică:')}</p>
                  <p><code>munmap()</code> {t('does ', 'NU ')}<strong>{t('NOT', '')}</strong>{t(' flush dirty pages. If you munmap a shared mapping without calling msync first, your last writes may be lost. The kernel flushes eventually, but not guaranteed before munmap returns.', ' golește paginile murdare. Dacă faceți munmap la o mapare partajată fără a apela mai întâi msync, ultimele scrieri pot fi pierdute. Kernel-ul golește eventual, dar nu este garantat înainte ca munmap să returneze.')}</p>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Page boundary trap:', 'Capcana limitei de pagină:')}</p>
                  <p>{t('If ', 'Dacă ')} <code>length</code> {t('is not a multiple of page size (4096), the remaining bytes in the last page are zero-filled. Writes to these "extra" bytes succeed but are ', 'nu este un multiplu al dimensiunii paginii (4096), octeții rămași din ultima pagină sunt umpluți cu zero. Scrierile la acești octeți "extra" reușesc dar ')}<strong>{t('NOT', 'NU')}</strong>{t(' propagated to the disk file.', ' sunt propagate la fișierul de pe disc.')}</p>
                </Box>
              </Section>

              <Section title={t('4. Non-Persistent Mappings & POSIX Shared Memory', '4. Mapări nepersistente și memorie partajată POSIX')} id="c8-shm" checked={!!checked['c8-shm']} onCheck={() => toggleCheck('c8-shm')}>
                <Box type="definition">
                  <p className="font-bold">{t('Two types of mappings:', 'Două tipuri de mapări:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>{t('File-backed (persistent)', 'Cu suport de fișier (persistentă)')}</strong>: {t('mmap of a regular file. Data survives in the file.', 'mmap al unui fișier obișnuit. Datele supraviețuiesc în fișier.')}</li>
                    <li><strong>{t('Non-persistent', 'Nepersistentă')}</strong>: {t('no disk file. Data exists only in RAM, lost when all processes unmap.', 'fără fișier pe disc. Datele există doar în RAM, se pierd când toate procesele fac unmap.')}</li>
                  </ul>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Anonymous mapping (related processes via fork):', 'Mapare anonimă (procese înrudite prin fork):')}</p>
                  <Code>{`// MAP_ANONYMOUS + MAP_SHARED = shared memory between parent & child
void* shm = mmap(NULL, 4096, PROT_READ|PROT_WRITE,
                 MAP_SHARED|MAP_ANONYMOUS, -1, 0);
// fd = -1 (no file), inherited by child after fork
pid_t pid = fork();
if (pid == 0) {
    strcpy(shm, "Hello from child!");  // child writes
    exit(0);
}
wait(NULL);
printf("Parent reads: %s\\n", (char*)shm);  // sees child's data!`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Named shared memory (unrelated processes):', 'Memorie partajată cu nume (procese neînrudite):')}</p>
                  <Code>{`// Producer:
int fd = shm_open("/myshm", O_CREAT|O_RDWR, 0666);
ftruncate(fd, 4096);       // set size (new objects have size 0!)
void* p = mmap(NULL, 4096, PROT_READ|PROT_WRITE,
               MAP_SHARED, fd, 0);
close(fd);
strcpy(p, "data from producer");
munmap(p, 4096);

// Consumer (separate program):
int fd = shm_open("/myshm", O_RDONLY, 0);
void* p = mmap(NULL, 4096, PROT_READ, MAP_SHARED, fd, 0);
close(fd);
printf("Got: %s\\n", (char*)p);
munmap(p, 4096);
shm_unlink("/myshm");  // cleanup

// Compile with: gcc prog.c -lrt`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('POSIX shared memory objects:', 'Obiecte de memorie partajată POSIX:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>{t('Created with ', 'Create cu ')} <code>shm_open()</code>{t(', visible under ', ', vizibile în ')} <code>/dev/shm/</code></li>
                    <li><strong>{t('Kernel persistence', 'Persistență la nivel de kernel')}</strong>{t(': survives until reboot or ', ': supraviețuiesc până la repornire sau ')} <code>shm_unlink()</code></li>
                    <li>{t('Must set size with ', 'Trebuie să setați dimensiunea cu ')} <code>ftruncate()</code> {t('after creation (default size is 0)', 'după creare (dimensiunea implicită este 0)')}</li>
                  </ul>
                </Box>
              </Section>

              <Section title={t('5. IPC Models & Cooperation Patterns', '5. Modele IPC și șabloane de cooperare')} id="c8-ipc" checked={!!checked['c8-ipc']} onCheck={() => toggleCheck('c8-ipc')}>
                <svg viewBox="0 0 460 130" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="10" width="200" height="50" rx="6" fill="#3b82f6" opacity="0.1" stroke="#3b82f6"/>
                  <text x="110" y="28" textAnchor="middle" fill="#3b82f6" fontWeight="bold">{t('Shared Memory Model', 'Modelul memoriei partajate')}</text>
                  <text x="110" y="43" textAnchor="middle" fill="currentColor" fontSize="9">mmap, shm_open, anonymous maps</text>
                  <text x="110" y="53" textAnchor="middle" fill="currentColor" fontSize="8">{t('Needs synchronization (semaphores)', 'Necesită sincronizare (semafoare)')}</text>
                  <rect x="250" y="10" width="200" height="50" rx="6" fill="#10b981" opacity="0.1" stroke="#10b981"/>
                  <text x="350" y="28" textAnchor="middle" fill="#10b981" fontWeight="bold">{t('Message Passing Model', 'Modelul transmiterii de mesaje')}</text>
                  <text x="350" y="43" textAnchor="middle" fill="currentColor" fontSize="9">pipes, fifos, message queues, sockets</text>
                  <text x="350" y="53" textAnchor="middle" fill="currentColor" fontSize="8">{t('Implicit synchronization (blocking I/O)', 'Sincronizare implicită (I/O blocant)')}</text>
                  <text x="110" y="80" fill="currentColor" fontSize="9">{t('Patterns: Producer-Consumer,', 'Șabloane: Producător-Consumator,')}</text>
                  <text x="110" y="93" fill="currentColor" fontSize="9">{t('Readers-Writers (CREW),', 'Cititori-Scriitori (CREW),')}</text>
                  <text x="110" y="106" fill="currentColor" fontSize="9">{t('Critical Section, Supervisor-Workers', 'Secțiune critică, Supervizor-Lucrători')}</text>
                </svg>

                <Box type="warning">
                  <p className="font-bold">{t('Data race with shared memory:', 'Data race cu memorie partajată:')}</p>
                  <p>{t('Shared memory has NO built-in synchronization. If producer writes while consumer reads, the consumer may see partially-written (corrupted) data. Use ', 'Memoria partajată NU are sincronizare built-in. Dacă producătorul scrie în timp ce consumatorul citește, consumatorul poate vedea date parțial scrise (corupte). Utilizați ')}<strong>{t('semaphores', 'semaphore-uri')}</strong>{t(' to coordinate access.', ' pentru a coordona accesul.')}</p>
                </Box>
              </Section>

              <Section title={t('6. POSIX Semaphores', '6. POSIX Semaphores')} id="c8-sem" checked={!!checked['c8-sem']} onCheck={() => toggleCheck('c8-sem')}>
                <Box type="definition">
                  <p>{t('A ', 'Un ')}<strong>{t('semaphore', 'semaphore')}</strong>{t(' is a non-negative integer counter. Two atomic operations: ', ' este un contor întreg non-negativ. Două operații atomice: ')} <code>sem_wait</code> {t('(decrement, blocks if 0) and ', '(decrementare, blochează dacă 0) și ')} <code>sem_post</code> {t('(increment, never blocks).', '(incrementare, nu blochează niciodată).')}</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Named semaphores (any processes):', 'Semaphore-uri cu nume (orice procese):')}</p>
                  <Code>{`#include <semaphore.h>
sem_t* s = sem_open("/mysem", O_CREAT, 0666, 1); // initial value 1
sem_wait(s);   // P operation (decrement, block if 0)
// ... critical section ...
sem_post(s);   // V operation (increment)
sem_close(s);
sem_unlink("/mysem");  // cleanup

// Compile with: gcc prog.c -lpthread`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Unnamed semaphores (related processes, in shared memory):', 'Semaphore-uri fără nume (procese înrudite, în memorie partajată):')}</p>
                  <Code>{`// Place semaphore IN shared memory region:
sem_t* sem = (sem_t*) shm_ptr;
sem_init(sem, 1, 1);  // 1=shared between processes, initial=1
// ... use sem_wait/sem_post ...
sem_destroy(sem);`}</Code>
                </Box>

                <p className="font-bold mt-2">{t('Example — mutex with named semaphore:', 'Exemplu — mutex cu semaphore cu nume:')}</p>
                <Code>{`sem_t* mutex = sem_open("/mutex", O_CREAT, 0666, 1);
pid_t pid = fork();
// Both parent and child:
for (int i = 0; i < 5; i++) {
    sem_wait(mutex);
    // Critical section: write to shared file/memory
    printf("PID %d in critical section\\n", getpid());
    sleep(1);
    sem_post(mutex);
}
sem_close(mutex);
if (pid > 0) { wait(NULL); sem_unlink("/mutex"); }`}</Code>
              </Section>

              <Section title={t('Cheat Sheet', 'Rezumat rapid')} id="c8-cheat" checked={!!checked['c8-cheat']} onCheck={() => toggleCheck('c8-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">mmap</p><p>mmap(NULL, len, prot, flags, fd, off)</p><p>munmap(addr, len)</p><p>msync(addr, len, MS_SYNC)</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Flags', 'Flag-uri')}</p><p>MAP_SHARED vs MAP_PRIVATE</p><p>MAP_ANONYMOUS ({t('no file', 'fără fișier')})</p><p>PROT_READ | PROT_WRITE</p></Box>
                  <Box type="formula"><p className="font-bold">POSIX shm</p><p>shm_open, ftruncate, mmap</p><p>shm_unlink ({t('cleanup', 'curățenie')})</p><p>{t('Objects in /dev/shm/', 'Obiecte în /dev/shm/')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Semaphores', 'Semaphores')}</p><p>sem_open/sem_close/sem_unlink ({t('named', 'cu nume')})</p><p>sem_init/sem_destroy ({t('unnamed', 'fără nume')})</p><p>sem_wait (P), sem_post (V)</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c8-quiz" checked={!!checked['c8-quiz']} onCheck={() => toggleCheck('c8-quiz')}>
                <Toggle question={t('1. What is the fundamental advantage of mmap over read/write?', '1. Care este avantajul fundamental al mmap față de read/write?')} answer={t('With mmap, file contents are accessed directly in memory via pointer operations — no system calls needed for each read/write. The kernel handles loading pages on demand via page faults.', 'Cu mmap, conținutul fișierului este accesat direct în memorie prin operații cu pointeri — nu sunt necesare apeluri de sistem pentru fiecare read/write. Kernel-ul gestionează încărcarea paginilor la cerere prin erori de pagină.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('2. Can you close the fd immediately after mmap?', '2. Puteți închide descriptorul imediat după mmap?')} answer={t("Yes. The mapping remains valid even after closing the file descriptor. The kernel maintains its own reference to the file's inode.", "Da. Maparea rămâne validă chiar și după închiderea descriptorului. Kernel-ul menține propria referință la inode-ul fișierului.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('3. What happens if you write to a MAP_PRIVATE mapping?', '3. Ce se întâmplă dacă scrieți într-o mapare MAP_PRIVATE?')} answer={t('The write uses copy-on-write: the kernel creates a private copy of the affected page. The change is NOT visible to other processes and NOT propagated to the disk file. It goes to swap if evicted.', 'Scrierea folosește copy-on-write: kernel-ul creează o copie privată a paginii afectate. Modificarea NU este vizibilă altor procese și NU este propagată la fișierul de pe disc. Merge în swap dacă este evacuată.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('4. Why must you call msync before munmap on a shared mapping?', '4. De ce trebuie să apelați msync înainte de munmap pe o mapare partajată?')} answer={t('munmap does NOT flush dirty pages. Without msync, the last writes in memory may not be saved to the disk file. The kernel MAY flush them eventually, but it\'s not guaranteed before munmap returns.', 'munmap NU golește paginile murdare. Fără msync, ultimele scrieri din memorie pot să nu fie salvate pe disc. Kernel-ul POATE să le golească eventual, dar nu este garantat înainte ca munmap să returneze.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('5. What is the offset parameter requirement for mmap?', '5. Care este cerința pentru parametrul offset la mmap?')} answer={t('It must be a multiple of the system page size (typically 4096 bytes). If you need to map from a non-aligned offset, round down and adjust your pointer arithmetic.', 'Trebuie să fie un multiplu al dimensiunii paginii de sistem (de obicei 4096 octeți). Dacă trebuie să mapați de la un offset nealiniat, rotunjiți în jos și ajustați aritmetica pointerilor.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('6. How do you create shared memory between unrelated processes?', '6. Cum creați memorie partajată între procese neînrudite?')} answer={t('Use shm_open() to create a named shared memory object, ftruncate() to set its size, then mmap() with MAP_SHARED. The other process uses shm_open() with the same name. Clean up with shm_unlink().', 'Utilizați shm_open() pentru a crea un obiect de memorie partajată cu nume, ftruncate() pentru a seta dimensiunea, apoi mmap() cu MAP_SHARED. Celălalt proces folosește shm_open() cu același nume. Curățați cu shm_unlink().')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('7. What is the difference between anonymous shared and anonymous private mappings?', '7. Care este diferența dintre mapările anonime partajate și cele anonime private?')} answer={t('MAP_SHARED|MAP_ANONYMOUS: shared between parent and child (after fork). Used for IPC. MAP_PRIVATE|MAP_ANONYMOUS: private to the process, used for memory allocation (this is what malloc uses internally for large allocations).', 'MAP_SHARED|MAP_ANONYMOUS: partajată între părinte și fiu (după fork). Utilizată pentru IPC. MAP_PRIVATE|MAP_ANONYMOUS: privată procesului, utilizată pentru alocarea memoriei (aceasta este metoda internă folosită de malloc pentru alocări mari).')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('8. Why do POSIX shared memory objects need ftruncate after creation?', '8. De ce obiectele de memorie partajată POSIX necesită ftruncate după creare?')} answer={t('A newly created shared memory object has size 0. You MUST call ftruncate() to set its size before mapping it. Mapping a zero-size object would be useless (or cause errors).', 'Un obiect de memorie partajată nou creat are dimensiunea 0. TREBUIE să apelați ftruncate() pentru a seta dimensiunea înainte de mapare. Maparea unui obiect de dimensiune zero ar fi inutilă (sau ar cauza erori).')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('9. What does sem_wait do when the semaphore value is 0?', '9. Ce face sem_wait când valoarea semaphore-ului este 0?')} answer={t('It BLOCKS (the calling process/thread sleeps) until another process/thread calls sem_post to increment the value above 0. This is the fundamental blocking mechanism for synchronization.', 'BLOCHEAZĂ (procesul/firul apelant doarme) până când un alt proces/fir apelează sem_post pentru a incrementa valoarea peste 0. Acesta este mecanismul fundamental de blocare pentru sincronizare.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('10. Where are named semaphores and shared memory objects stored in Linux?', '10. Unde sunt stocate semaphore-urile cu nume și obiectele de memorie partajată în Linux?')} answer={t('Both are stored in /dev/shm/ (a tmpfs virtual filesystem in RAM). Named semaphores appear as sem.name files. They persist until the system reboots or are explicitly unlinked.', 'Ambele sunt stocate în /dev/shm/ (un sistem de fișiere virtual tmpfs în RAM). Semaphore-urile cu nume apar ca fișiere sem.name. Persistă până la repornirea sistemului sau sunt șterse explicit.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
              </Section>
    </>
  );
}
