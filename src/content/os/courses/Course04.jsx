import React from "react";
import { useApp } from "../../../contexts/AppContext";
import { Box, Code, Toggle, Section } from "../../../components/ui";

export default function Course04() {
  const { t, checked, toggleCheck } = useApp();
  return (
    <>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Foaie de parcurs:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('POSIX API vs C Standard Library — trade-offs', 'API POSIX vs. biblioteca standard C — compromisuri')}</li>
                  <li>{t('Categories of POSIX I/O primitives', 'Categoriile de primitive I/O POSIX')}</li>
                  <li>{t('Core primitives: access, creat, open, read, write, lseek, close', 'Primitivele de bază: access, creat, open, read, write, lseek, close')}</li>
                  <li>{t('File work session pattern (open → read/write loop → close)', 'Șablonul sesiunii de lucru cu fișiere (open → buclă read/write → close)')}</li>
                  <li>{t('Directory primitives: opendir, readdir, closedir', 'Primitive pentru directoare: opendir, readdir, closedir')}</li>
                  <li>{t('Filesystem cache (kernel-level disk cache)', 'Cache-ul sistemului de fișiere (cache disc la nivel kernel)')}</li>
                  <li>{t('C stdlib I/O: fopen, fread/fwrite, fscanf/fprintf, fclose', 'I/O biblioteca standard C: fopen, fread/fwrite, fscanf/fprintf, fclose')}</li>
                  <li>{t('Buffered vs unbuffered I/O — the two-level cache', 'I/O cu tampon vs. fără tampon — cache-ul pe două niveluri')}</li>
                  <li>{t('Format specifiers (%d, %s, %f, etc.)', 'Specificatori de format (%d, %s, %f, etc.)')}</li>
                </ol>
              </Box>

              <Section title={t('1. POSIX API vs C Standard Library', '1. API POSIX vs. biblioteca standard C')} id="c4-api" checked={!!checked['c4-api']} onCheck={() => toggleCheck('c4-api')}>
                <p>{t('Two families of functions for file I/O in C on Linux:', 'Două familii de funcții pentru I/O cu fișiere în C pe Linux:')}</p>

                <svg viewBox="0 0 480 180" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="10" width="200" height="60" rx="8" fill="#3b82f6" opacity="0.12" stroke="#3b82f6" strokeWidth="1.5"/>
                  <text x="110" y="30" textAnchor="middle" fill="#3b82f6" fontWeight="bold" fontSize="11">C Standard Library</text>
                  <text x="110" y="45" textAnchor="middle" fill="currentColor" fontSize="9">fopen, fread, fprintf, fclose</text>
                  <text x="110" y="58" textAnchor="middle" fill="currentColor" fontSize="9">{t('Buffered, FILE*, portable', 'Cu tampon, FILE*, portabil')}</text>

                  <rect x="260" y="10" width="200" height="60" rx="8" fill="#10b981" opacity="0.12" stroke="#10b981" strokeWidth="1.5"/>
                  <text x="360" y="30" textAnchor="middle" fill="#10b981" fontWeight="bold" fontSize="11">POSIX API</text>
                  <text x="360" y="45" textAnchor="middle" fill="currentColor" fontSize="9">open, read, write, close</text>
                  <text x="360" y="58" textAnchor="middle" fill="currentColor" fontSize="9">{t('Unbuffered, int fd, Linux/UNIX only', 'Fără tampon, int fd, doar Linux/UNIX')}</text>

                  <rect x="130" y="90" width="220" height="40" rx="6" fill="#f59e0b" opacity="0.1" stroke="#f59e0b"/>
                  <text x="240" y="112" textAnchor="middle" fill="#f59e0b" fontWeight="bold" fontSize="10">{t('Kernel filesystem cache', 'Cache-ul sistemului de fișiere din kernel')}</text>
                  <text x="240" y="125" textAnchor="middle" fill="currentColor" fontSize="9">{t('Unique per system, in kernel-space', 'Unic per sistem, în kernel-space')}</text>

                  <rect x="160" y="145" width="160" height="25" rx="4" fill="currentColor" opacity="0.08" stroke="currentColor" opacity="0.3"/>
                  <text x="240" y="162" textAnchor="middle" fill="currentColor" fontSize="9">{t('Physical disk', 'Disc fizic')}</text>

                  <line x1="110" y1="70" x2="200" y2="90" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4"/>
                  <line x1="360" y1="70" x2="280" y2="90" stroke="#10b981" strokeWidth="1" strokeDasharray="4"/>
                  <line x1="240" y1="130" x2="240" y2="145" stroke="currentColor" strokeWidth="1"/>
                </svg>

                <Box type="theorem">
                  <p className="font-bold">{t('Key trade-off:', 'Compromisul esențial:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>POSIX API</strong>{t(': Full access to OS features (permissions, locks, devices). Not portable to Windows. Uses ', ': Acces complet la funcționalitățile SO (permisiuni, blocaje, dispozitive). Nu este portabil pe Windows. Folosește ')} <code>int</code> {t('file descriptors.', 'descriptorii de fișiere.')}</li>
                    <li><strong>C stdlib</strong>{t(': Portable across platforms. Buffer-ized (user-space cache per process). Uses ', ': Portabilă pe platforme. Cu tampon (cache user-space per proces). Folosește ')} <code>FILE*</code> {t('pointers. Limited OS control.', 'pointeri. Control limitat al SO.')}</li>
                  </ul>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Error handling convention:', 'Convenția de gestionare a erorilor:')}</p>
                  <p>{t('All POSIX primitives return ', 'Toate primitivele POSIX returnează ')}<strong>-1</strong>{t(' on error and set the global variable ', ' la eroare și setează variabila globală ')} <code>errno</code>{t('. Diagnose with ', '. Diagnosticați cu ')} <code>perror("context")</code>{t('.', '.')}</p>
                </Box>
              </Section>

              <Section title={t('2. Core POSIX Primitives', '2. Primitivele de bază POSIX')} id="c4-posix" checked={!!checked['c4-posix']} onCheck={() => toggleCheck('c4-posix')}>
                <Box type="formula">
                  <p className="font-bold">{t('access — check file permissions:', 'access — verificarea permisiunilor:')}</p>
                  <Code>{`#include <unistd.h>
int access(char* path, int mode);
// mode: F_OK(0)=exists, R_OK(4), W_OK(2), X_OK(1)
// Returns 0 if allowed, -1 if not

if (access("data.txt", R_OK | W_OK) == -1)
    perror("Cannot read/write data.txt");`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('open — start a file session:', 'open — deschiderea unei sesiuni de lucru cu fișierul:')}</p>
                  <Code>{`#include <fcntl.h>
int open(char* path, int flags, mode_t perms);
// flags: O_RDONLY | O_WRONLY | O_RDWR
//   optionally OR'd with: O_CREAT, O_TRUNC, O_APPEND,
//   O_EXCL, O_NONBLOCK, O_CLOEXEC, O_SYNC, O_DIRECT
// perms: used only with O_CREAT (e.g., 0644)
// Returns: file descriptor (int >= 0), or -1 on error

int fd = open("out.dat", O_WRONLY|O_CREAT|O_TRUNC, 0600);
if (fd == -1) { perror("open"); exit(1); }`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('read / write — transfer data:', 'read / write — transferul datelor:')}</p>
                  <Code>{`ssize_t read(int fd, void* buf, size_t count);
ssize_t write(int fd, void* buf, size_t count);
// Returns: number of bytes actually transferred
// read returns 0 at EOF
// write may return less than count (disk full, etc.)

char buf[4096];
ssize_t n;
while ((n = read(in_fd, buf, sizeof(buf))) > 0) {
    if (write(out_fd, buf, n) != n) {
        perror("write error"); exit(1);
    }
}`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('lseek — reposition cursor:', 'lseek — repoziționarea cursorului:')}</p>
                  <Code>{`off_t lseek(int fd, off_t offset, int whence);
// whence: SEEK_SET(0), SEEK_CUR(1), SEEK_END(2)
// Returns: new absolute position, or -1 on error

lseek(fd, 0, SEEK_SET);    // go to beginning
lseek(fd, -10, SEEK_END);  // 10 bytes before end
off_t pos = lseek(fd, 0, SEEK_CUR); // get current position`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('close — end a file session:', 'close — încheierea unei sesiuni de lucru:')}</p>
                  <Code>{`int close(int fd);  // Returns 0 on success, -1 on error`}</Code>
                </Box>

                <p className="font-bold mt-3">{t('Worked example — cp implementation with POSIX API:', 'Exemplu rezolvat — implementarea cp cu API POSIX:')}</p>
                <Code>{`#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#define BUF 4096  // page size for efficiency

int main(int argc, char* argv[]) {
    int in_fd = open(argv[1], O_RDONLY);
    int out_fd = open(argv[2], O_WRONLY|O_CREAT|O_TRUNC, 0600);
    char buf[BUF];
    ssize_t n;
    while ((n = read(in_fd, buf, BUF)) > 0)
        write(out_fd, buf, n);
    close(in_fd); close(out_fd);
    return 0;
}`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Trap — buffer size matters:', 'Capcană — dimensiunea tamponului contează:')}</p>
                  <p>{t('Using ', 'Folosirea ')} <code>BUF_SIZE = 4096</code> {t('(one page) is optimal because the kernel filesystem cache operates at page granularity. Using 1-byte reads is catastrophically slow (thousands of system calls).', '(o pagină) este optimă deoarece cache-ul sistemului de fișiere din kernel operează la granularitate de pagină. Citirile de 1 byte sunt catastrofal de lente (mii de apeluri sistem).')}</p>
                </Box>
              </Section>

              <Section title={t('3. Directory Primitives', '3. Primitive pentru directoare')} id="c4-dir" checked={!!checked['c4-dir']} onCheck={() => toggleCheck('c4-dir')}>
                <Box type="formula">
                  <p className="font-bold">{t('Directory traversal pattern:', 'Șablonul de parcurgere a unui director:')}</p>
                  <Code>{`#include <dirent.h>
DIR* dd;
struct dirent* de;

dd = opendir(dirname);
if (dd == NULL) { perror("opendir"); exit(1); }

while ((de = readdir(dd)) != NULL) {
    printf("Found: %s\\n", de->d_name);
    // Skip "." and ".." entries!
}
closedir(dd);`}</Code>
                </Box>

                <Box type="definition">
                  <p className="font-bold">{t('Other directory/path primitives:', 'Alte primitive pentru directoare/căi:')}</p>
                  <Code>{`mkdir(path, mode);    // create directory
rmdir(path);          // remove empty directory
chdir(path);          // change working directory
getcwd(buf, size);    // get current working directory`}</Code>
                </Box>
              </Section>

              <Section title={t('4. C Standard Library I/O', '4. I/O din biblioteca standard C')} id="c4-stdio" checked={!!checked['c4-stdio']} onCheck={() => toggleCheck('c4-stdio')}>
                <Box type="formula">
                  <p className="font-bold">{t('Equivalent functions (FILE* based):', 'Funcții echivalente (bazate pe FILE*):')}</p>
                  <Code>{`FILE* f = fopen("data.txt", "rb");  // modes: r/w/a + b
size_t n = fread(buf, 1, size, f);  // binary read
size_t n = fwrite(buf, 1, size, f); // binary write
fscanf(f, "%d %s", &num, str);     // formatted read
fprintf(f, "x=%d\\n", x);           // formatted write
fseek(f, offset, SEEK_SET);        // reposition
fclose(f);                          // close`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Two-level caching:', 'Cache pe două niveluri:')}</p>
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>{t('stdio buffer', 'tamponul stdio')}</strong>{t(' (user-space, per process) — fwrite writes here first', ' (user-space, per proces) — fwrite scrie aici mai întâi')}</li>
                    <li><strong>{t('Kernel filesystem cache', 'Cache-ul sistemului de fișiere din kernel')}</strong>{t(' (kernel-space, shared by all processes) — actual disk I/O', ' (kernel-space, partajat de toate procesele) — I/O efectiv pe disc')}</li>
                  </ol>
                  <p className="text-sm mt-1">{t('The stdio buffer is flushed: on ', 'Tamponul stdio este golit: la ')} <code>fclose</code>{t(', when buffer fills, on ', ', când tamponul se umple, la ')} <code>fflush(f)</code>{t(', or on ', ', sau la ')} <code>\n</code> {t('for line-buffered streams (stdout to terminal).', 'pentru fluxurile cu tampon de linie (stdout la terminal).')}</p>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Critical trap — buffered writes before exec/fork:', 'Capcană critică — scrieri cu tampon înainte de exec/fork:')}</p>
                  <p>{t('Calling ', 'Apelarea ')} <code>exec()</code> {t('does NOT flush stdio buffers! Data in the buffer is ', 'NU golește tampoanele stdio! Datele din tampon sunt ')}<strong>{t('lost', 'pierdute')}</strong>{t('. Always call ', '. Apelați întotdeauna ')} <code>fflush(NULL)</code> {t('(flushes all open streams) before ', '(golește toate fluxurile deschise) înainte de ')} <code>exec</code> {t('or', 'sau')} <code>fork</code>{t('.', '.')}</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Format specifiers (scanf/printf family):', 'Specificatori de format (familia scanf/printf):')}</p>
                  <table className="text-sm mt-1">
                    <tbody>
                      <tr><td className="pr-3 font-mono">%c</td><td>char</td><td className="pr-3 font-mono pl-4">%s</td><td>string</td></tr>
                      <tr><td className="font-mono">%d</td><td>int (decimal)</td><td className="font-mono pl-4">%u</td><td>unsigned int</td></tr>
                      <tr><td className="font-mono">%o</td><td>unsigned (octal)</td><td className="font-mono pl-4">%x</td><td>unsigned (hex)</td></tr>
                      <tr><td className="font-mono">%f</td><td>double (fixed)</td><td className="font-mono pl-4">%e</td><td>double (scientific)</td></tr>
                    </tbody>
                  </table>
                </Box>
              </Section>

              <Section title={t('5. Filesystem Cache', '5. Cache-ul sistemului de fișiere')} id="c4-cache" checked={!!checked['c4-cache']} onCheck={() => toggleCheck('c4-cache')}>
                <Box type="theorem">
                  <p className="font-bold">{t('Kernel filesystem cache:', 'Cache-ul sistemului de fișiere din kernel:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>{t('Unique per system', 'Unic per sistem')}</strong>{t(', in kernel-space, shared by ALL processes', ', în kernel-space, partajat de TOATE procesele')}</li>
                    <li>{t('Granularity = physical page (4096 bytes on x86/x64)', 'Granularitate = pagină fizică (4096 bytes pe x86/x64)')}</li>
                    <li>{t('Repeated reads of same block → served from RAM (fast)', 'Citiri repetate ale aceluiași bloc → servit din RAM (rapid)')}</li>
                    <li>{t('Writes go to cache first, flushed to disk later (write-back)', 'Scrierile merg mai întâi în cache, golite pe disc ulterior (write-back)')}</li>
                    <li>{t('Bypass with ', 'Evitați cu ')} <code>O_DIRECT</code> {t('flag; force sync with ', 'flag; forțați sincronizarea cu ')} <code>O_SYNC</code> {t('or', 'sau')} <code>fsync(fd)</code></li>
                  </ul>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Connection:', 'Legătură:')}</p>
                  <p>{t('The stdio buffer (Course 4) sits ON TOP of the filesystem cache. So there are ', 'Tamponul stdio (Cursul 4) se află DEASUPRA cache-ului sistemului de fișiere. Deci există ')}<strong>{t('two layers', 'două niveluri')}</strong>{t(' of caching between your ', ' de cache între ')} <code>fprintf</code> {t('and the actual disk. This is why ', 'și discul efectiv. De aceea ')} <code>fflush</code> {t('is critical before sharing data between processes.', 'este critic înainte de a partaja date între procese.')}</p>
                </Box>
              </Section>

              <Section title={t('Cheat Sheet', 'Foaie de referință rapidă')} id="c4-cheat" checked={!!checked['c4-cheat']} onCheck={() => toggleCheck('c4-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">POSIX I/O</p><p>open, read, write, lseek, close</p><p>access, creat, stat, chmod, link, unlink</p><p>dup, dup2, pipe, mkfifo, fcntl</p></Box>
                  <Box type="formula"><p className="font-bold">{t('C stdlib I/O', 'I/O bibliotecă standard C')}</p><p>fopen, fread/fwrite, fclose</p><p>fscanf/fprintf, fseek, fflush</p><p>FILE*, {t('buffered, portable', 'cu tampon, portabil')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Directories', 'Directoare')}</p><p>opendir, readdir, closedir</p><p>mkdir, rmdir, chdir, getcwd</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Error handling', 'Gestionarea erorilor')}</p><p>return -1, errno, perror()</p><p>{t('Always check return values!', 'Verificați întotdeauna valorile returnate!')}</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c4-quiz" checked={!!checked['c4-quiz']} onCheck={() => toggleCheck('c4-quiz')}>
                <Toggle
                  question={t('1. What does open() return on success vs failure?', '1. Ce returnează open() la succes față de eșec?')}
                  answer={t('On success: a non-negative integer (file descriptor, the lowest available fd number). On failure: -1, and errno is set.', 'La succes: un număr întreg non-negativ (file descriptor, cel mai mic număr fd disponibil). La eșec: -1, și errno este setat.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('2. What happens if read() returns 0?', '2. Ce se întâmplă dacă read() returnează 0?')}
                  answer={t('It means EOF — end of file was reached. No bytes were read. This is NOT an error (error would return -1).', 'Înseamnă EOF — s-a ajuns la sfârșitul fișierului. Niciun octet nu a fost citit. Aceasta NU este o eroare (eroarea ar returna -1).')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('3. Why is buffer size 4096 optimal for read/write?', '3. De ce dimensiunea 4096 a tamponului este optimă pentru read/write?')}
                  answer={t('4096 bytes is the page size on x86/x64. The kernel filesystem cache operates at page granularity. Reads/writes aligned to page boundaries minimize system calls and maximize DMA transfer efficiency.', '4096 bytes este dimensiunea paginii pe x86/x64. Cache-ul sistemului de fișiere din kernel operează la granularitate de pagină. Citirile/scrierile aliniate la granițele de pagini minimizează apelurile sistem și maximizează eficiența transferului DMA.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('4. What is the difference between POSIX descriptors (int) and stdio descriptors (FILE*)?', '4. Care este diferența dintre descriptorii POSIX (int) și descriptorii stdio (FILE*)?')}
                  answer={t('POSIX int fd is a raw OS-level handle — unbuffered, direct syscalls. FILE* is a library-level wrapper that adds user-space buffering, formatted I/O, and portability. Internally, FILE* uses an int fd underneath.', 'int fd POSIX este un handle brut la nivel SO — fără tampon, apeluri sistem directe. FILE* este un wrapper la nivel de bibliotecă ce adaugă tampon în user-space, I/O formatat și portabilitate. Intern, FILE* folosește un int fd pe dedesubt.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('5. What happens to stdio buffers when you call exec()?', '5. Ce se întâmplă cu tampoanele stdio când apelați exec()?')}
                  answer={t('They are LOST. exec() replaces the process image (including all user-space memory), but does NOT flush stdio buffers first. Always call fflush(NULL) before exec().', 'Sunt PIERDUTE. exec() înlocuiește imaginea procesului (inclusiv toată memoria user-space), dar NU golește tampoanele stdio mai întâi. Apelați întotdeauna fflush(NULL) înainte de exec().')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('6. How do you convert between int fd and FILE*?', '6. Cum convertiți între int fd și FILE*?')}
                  answer={t('fd → FILE*: fdopen(fd, mode). FILE* → fd: fileno(fp). Useful when mixing POSIX and stdio functions on the same file.', 'fd → FILE*: fdopen(fd, mode). FILE* → fd: fileno(fp). Util când combinați funcții POSIX și stdio pe același fișier.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('7. What are the three standard file descriptors?', '7. Care sunt cei trei file descriptori standard?')}
                  answer={t('0 = stdin, 1 = stdout, 2 = stderr. They are inherited from the parent process and are open by default.', '0 = stdin, 1 = stdout, 2 = stderr. Sunt moșteniți de la procesul părinte și sunt deschiși implicit.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('8. What does lseek(fd, 0, SEEK_CUR) return?', '8. Ce returnează lseek(fd, 0, SEEK_CUR)?')}
                  answer={t('The current file position (offset from beginning). This is an idiom to query position without changing it.', 'Poziția curentă în fișier (offset față de început). Acesta este un idiom pentru a interoga poziția fără a o schimba.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t("9. Why must you skip '.' and '..' when traversing a directory with readdir()?", "9. De ce trebuie să omiteți '.' și '..' când parcurgeți un director cu readdir()?")}
                  answer={t("readdir() returns ALL entries including '.' (current dir) and '..' (parent dir). If you're doing recursive operations (like recursive delete), processing these would cause infinite loops or delete parent directories.", "readdir() returnează TOATE intrările inclusiv '.' (directorul curent) și '..' (directorul părinte). Dacă efectuați operații recursive (cum ar fi ștergerea recursivă), procesarea acestora ar cauza bucle infinite sau ștergerea directoarelor părinte.")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('10. Can two processes share the kernel filesystem cache?', '10. Pot două procese să partajeze cache-ul sistemului de fișiere din kernel?')}
                  answer={t("Yes! The kernel filesystem cache is unique per system and shared by ALL processes. This is why one process's write (once flushed to cache) can be read by another process even before disk sync.", 'Da! Cache-ul sistemului de fișiere din kernel este unic per sistem și partajat de TOATE procesele. De aceea scrierea unui proces (odată golită în cache) poate fi citită de alt proces chiar înainte de sincronizarea cu discul.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
              </Section>
    </>
  );
}
