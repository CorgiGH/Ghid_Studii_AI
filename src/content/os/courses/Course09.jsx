import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Course09() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
              <p className="mb-3 text-sm opacity-80">Source: OS(9) - Programare de sistem in C pentru Linux (VI), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Plan:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('Pipes as FIFO communication channels', 'Pipe-uri ca structuri de comunicație FIFO')}</li>
                  <li>{t('Anonymous pipes: pipe() system call', 'Pipe-uri anonime: apelul de sistem pipe()')}</li>
                  <li>{t('Usage pattern: pipe → fork → close unused ends', 'Tiparul de utilizare: pipe → fork → închiderea capetelor neutilizate')}</li>
                  <li>{t('Named pipes (fifos): mkfifo()', 'Pipe-uri cu nume (fifo): mkfifo()')}</li>
                  <li>{t('Blocking behavior of open, read, write on pipes', 'Comportamentul blocant al operațiilor open, read, write pe pipe-uri')}</li>
                  <li>{t('Non-persistent data in fifos', 'Date nepersistente în fifouri')}</li>
                  <li>{t('Non-blocking mode (O_NONBLOCK)', 'Modul neblocant (O_NONBLOCK)')}</li>
                  <li>{t('Communication patterns: 1-to-1, 1-to-N, N-to-1, N-to-N', 'Șabloane de comunicație: 1-la-1, 1-la-N, N-la-1, N-la-N')}</li>
                  <li>{t('Applications: semaphores via fifos, client/server architecture', 'Aplicații: semafoare via fifouri, arhitectură client/server')}</li>
                </ol>
              </Box>

              <Section title={t('1. Pipe Fundamentals', '1. Noțiuni fundamentale despre pipe-uri')} id="course_9-fund" checked={!!checked['course_9-fund']} onCheck={() => toggleCheck('course_9-fund')}>
                <Box type="definition">
                  <p>{t('A ', 'Un ')}<strong>{t('pipe', 'pipe')}</strong>{t(' is a unidirectional FIFO buffer managed by the kernel. Data written at one end is read (and consumed) at the other. Capacity is limited (typically 64KB on Linux).', ' este un buffer FIFO unidirecțional gestionat de kernel. Datele scrise la un capăt sunt citite (și consumate) la celălalt. Capacitatea este limitată (în mod obișnuit 64KB pe Linux).')}</p>
                </Box>

                <svg viewBox="0 0 400 100" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="30" y="25" width="80" height="35" rx="6" fill="#3b82f6" opacity="0.15" stroke="#3b82f6"/>
                  <text x="70" y="47" textAnchor="middle" fill="#3b82f6">{t('Writer', 'Scriitor')}</text>
                  <rect x="290" y="25" width="80" height="35" rx="6" fill="#10b981" opacity="0.15" stroke="#10b981"/>
                  <text x="330" y="47" textAnchor="middle" fill="#10b981">{t('Reader', 'Cititor')}</text>
                  <rect x="140" y="30" width="120" height="25" rx="12" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="1.5"/>
                  <text x="200" y="47" textAnchor="middle" fill="#f59e0b" fontSize="9">{t('FIFO buffer', 'buffer FIFO')}</text>
                  <line x1="110" y1="42" x2="140" y2="42" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <line x1="260" y1="42" x2="290" y2="42" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <text x="125" y="37" fill="currentColor" fontSize="8">write</text>
                  <text x="275" y="37" fill="currentColor" fontSize="8">read</text>
                  <text x="200" y="80" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.6">{t('Unidirectional, FIFO order, read = consume', 'Unidirecțional, ordine FIFO, citirea = consumare')}</text>
                </svg>

                <Box type="theorem">
                  <p className="font-bold">{t('Anonymous vs named pipes:', 'Pipe-uri anonime vs. cu nume:')}</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="p-1">{t('Feature', 'Caracteristică')}</th><th className="p-1">{t('Anonymous (pipe)', 'Anonim (pipe)')}</th><th className="p-1">{t('Named (fifo)', 'Cu nume (fifo)')}</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">{t('Creation', 'Creare')}</td><td className="p-1 font-mono">pipe(pfd)</td><td className="p-1 font-mono">mkfifo(path, mode)</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">{t('Who can use', 'Cine poate folosi')}</td><td className="p-1">{t('Related processes (fork/exec)', 'Procese înrudite (fork/exec)')}</td><td className="p-1">{t('Any process (knows the name)', 'Orice proces (cunoaște numele)')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">{t('Filesystem entry', 'Intrare în sistemul de fișiere')}</td><td className="p-1">{t('None', 'Nu')}</td><td className="p-1">{t('Yes (special file)', 'Da (fișier special)')}</td></tr>
                      <tr><td className="p-1">{t('Reopenable', 'Redeschidere posibilă')}</td><td className="p-1 text-red-400">{t('No', 'Nu')}</td><td className="p-1 text-green-400">{t('Yes', 'Da')}</td></tr>
                    </tbody>
                  </table>
                </Box>
              </Section>

              <Section title={t('2. Anonymous Pipes', '2. Pipe-uri anonime')} id="course_9-anon" checked={!!checked['course_9-anon']} onCheck={() => toggleCheck('course_9-anon')}>
                <Box type="formula">
                  <p className="font-bold">{t('pipe() — create anonymous pipe:', 'pipe() — crearea unui pipe anonim:')}</p>
                  <Code>{`int pfd[2];
pipe(pfd);
// pfd[0] = read end
// pfd[1] = write end
// Both ends open in calling process`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Standard pattern: pipe → fork → close unused ends:', 'Tiparul standard: pipe → fork → închiderea capetelor neutilizate:')}</p>
                  <Code>{`int pfd[2];
pipe(pfd);           // 1. Create pipe BEFORE fork
pid_t pid = fork();  // 2. Fork: child inherits both fds

if (pid == 0) {
    // CHILD = reader
    close(pfd[1]);   // 3. Close WRITE end (child only reads)
    char buf[256];
    int n = read(pfd[0], buf, sizeof(buf));
    buf[n] = '\\0';
    printf("Child received: %s\\n", buf);
    close(pfd[0]);
    exit(0);
}
// PARENT = writer
close(pfd[0]);       // 3. Close READ end (parent only writes)
write(pfd[1], "Hello child!", 12);
close(pfd[1]);       // 4. Close write end → child reads EOF
wait(NULL);`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Why close unused ends?', 'De ce se închid capetele neutilizate?')}</p>
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>{t('Read EOF', 'Citire EOF')}</strong>{t(': The reader only gets EOF (read returns 0) when ALL write ends are closed. If the reader still has the write end open, it blocks forever.', ': Cititorul primește EOF (read returnează 0) doar când TOATE capetele de scriere sunt închise. Dacă cititorul are în continuare capătul de scriere deschis, se blochează la infinit.')}</li>
                    <li><strong>SIGPIPE</strong>{t(': A writer to a pipe with no readers gets killed by SIGPIPE. If the writer still has the read end open, the kernel won\'t send SIGPIPE.', ': Un scriitor pe un pipe fără cititori este terminat de SIGPIPE. Dacă scriitorul are în continuare capătul de citire deschis, kernel-ul nu va trimite SIGPIPE.')}</li>
                  </ol>
                </Box>
              </Section>

              <Section title={t('3. Named Pipes (FIFOs)', '3. Pipe-uri cu nume (FIFO)')} id="course_9-fifo" checked={!!checked['course_9-fifo']} onCheck={() => toggleCheck('course_9-fifo')}>
                <Box type="formula">
                  <p className="font-bold">{t('mkfifo — create a named pipe:', 'mkfifo — crearea unui pipe cu nume:')}</p>
                  <Code>{`int mkfifo(const char* path, mode_t mode);
// Creates a special file in the filesystem
// Does NOT open it (unlike pipe() which opens both ends)`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Usage pattern:', 'Tiparul de utilizare:')}</p>
                  <Code>{`// Writer program:
mkfifo("/tmp/myfifo", 0666);
int fd = open("/tmp/myfifo", O_WRONLY); // BLOCKS until reader opens!
write(fd, "data", 4);
close(fd);

// Reader program (separate process):
int fd = open("/tmp/myfifo", O_RDONLY); // BLOCKS until writer opens!
char buf[100];
int n = read(fd, buf, 100);
close(fd);`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Blocking open:', 'Deschidere blocantă:')}</p>
                  <p>{t('Opening a fifo for read-only ', 'Deschiderea unui fifo în mod read-only ')}<strong>{t('blocks', 'blochează')}</strong>{t(' until another process opens it for writing (and vice versa). They must "rendezvous". Exception: opening with O_RDWR never blocks (both ends in one process), or use O_NONBLOCK.', ' până când un alt proces îl deschide pentru scriere (și invers). Ele trebuie să „se întâlnească". Excepție: deschiderea cu O_RDWR nu blochează niciodată (ambele capete într-un singur proces) sau se utilizează O_NONBLOCK.')}</p>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Data persistence in fifos:', 'Persistența datelor în fifouri:')}</p>
                  <p>{t('Data in a fifo is stored ', 'Datele dintr-un fifo sunt stocate ')}<strong>{t('in RAM only', 'doar în RAM')}</strong>{t(' (not on disk), and only while at least one process has the fifo open. When all processes close both ends, unread data is ', ' (nu pe disc), și doar atât timp cât cel puțin un proces are fifo-ul deschis. Când toate procesele închid ambele capete, datele necitite sunt ')}<strong>{t('lost', 'pierdute')}</strong>{t('. The fifo file itself persists in the filesystem, but its data does not.', '. Fișierul fifo în sine persistă în sistemul de fișiere, dar datele sale nu.')}</p>
                </Box>
              </Section>

              <Section title={t('4. Blocking Behavior', '4. Comportamentul blocant')} id="course_9-block" checked={!!checked['course_9-block']} onCheck={() => toggleCheck('course_9-block')}>
                <Box type="formula">
                  <p className="font-bold">{t('Default (blocking) behavior summary:', 'Rezumatul comportamentului implicit (blocant):')}</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="p-1">{t('Operation', 'Operație')}</th><th className="p-1">{t('Condition', 'Condiție')}</th><th className="p-1">{t('Behavior', 'Comportament')}</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">read</td><td className="p-1">{t('Pipe empty', 'Pipe gol')}</td><td className="p-1">{t('Blocks until data or EOF', 'Blochează până la date sau EOF')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">read</td><td className="p-1">{t('All writers closed', 'Toți scriitorii au închis')}</td><td className="p-1">{t('Returns 0 (EOF)', 'Returnează 0 (EOF)')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">write</td><td className="p-1">{t('Pipe full', 'Pipe plin')}</td><td className="p-1">{t('Blocks until space', 'Blochează până la spațiu disponibil')}</td></tr>
                      <tr><td className="p-1">write</td><td className="p-1">{t('All readers closed', 'Toți cititorii au închis')}</td><td className="p-1"><strong>SIGPIPE</strong>{t(' → process killed!', ' → procesul este terminat!')}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Non-blocking mode:', 'Modul neblocant:')}</p>
                  <Code>{`// At open time:
int fd = open("/tmp/fifo", O_RDONLY | O_NONBLOCK);

// Or after opening:
fcntl(fd, F_SETFL, O_NONBLOCK);

// With O_NONBLOCK:
// - read on empty pipe returns -1 (errno=EAGAIN)
// - write on full pipe returns -1 (errno=EAGAIN)
// - open of fifo returns immediately (no rendezvous needed)`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Buffer-ized I/O trap:', 'Capcana I/O bufferizat:')}</p>
                  <p>{t('Using ', 'Utilizarea ')}<code>fprintf/fwrite</code>{t(' on pipes: data sits in the user-space buffer until flushed! A reader blocks waiting for data that\'s already "written" but stuck in the writer\'s buffer. Always ', ' pe pipe-uri: datele rămân în buffer-ul user-space până la golire! Un cititor se blochează așteptând date care au fost deja „scrise" dar blocate în buffer-ul scriitorului. Întotdeauna ')}<code>fflush()</code>{t(' after writing to a pipe with stdio functions.', ' după scrierea pe un pipe cu funcții stdio.')}</p>
                </Box>
              </Section>

              <Section title={t('5. Communication Patterns', '5. Șabloane de comunicație')} id="course_9-patterns" checked={!!checked['course_9-patterns']} onCheck={() => toggleCheck('course_9-patterns')}>
                <Box type="definition">
                  <p className="font-bold">{t('Four patterns by writer/reader count:', 'Patru șabloane după numărul de scriitori/cititori:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>{t('1-to-1', '1-la-1')}</strong>{t(': simplest, no synchronization issues', ': cel mai simplu, fără probleme de sincronizare')}</li>
                    <li><strong>{t('1-to-N', '1-la-N')}</strong>{t(': one writer, multiple readers. Issues: message length (variable-length needs header), message destination (which reader gets which message?)', ': un scriitor, mai mulți cititori. Probleme: lungimea mesajului (lungimea variabilă necesită antet), destinația mesajului (care cititor primește ce mesaj?)')}</li>
                    <li><strong>{t('N-to-1', 'N-la-1')}</strong>{t(': multiple writers, one reader. Issues: message integrity (writes ≤ PIPE_BUF bytes are atomic), sender identification (add header)', ': mai mulți scriitori, un cititor. Probleme: integritatea mesajului (scrierile ≤ PIPE_BUF octeți sunt atomice), identificarea expeditorului (adăugare antet)')}</li>
                    <li><strong>{t('N-to-N', 'N-la-N')}</strong>{t(': combines all issues above', ': combină toate problemele de mai sus')}</li>
                  </ul>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Atomic write guarantee (POSIX):', 'Garanția scrierii atomice (POSIX):')}</p>
                  <p>{t('A write of ', 'O scriere de ')}<strong>{t('≤ PIPE_BUF bytes', '≤ PIPE_BUF octeți')}</strong>{t(' (at least 512, typically 4096 on Linux) to a pipe is ', ' (cel puțin 512, în mod obișnuit 4096 pe Linux) pe un pipe este ')}<strong>{t('atomic', 'atomică')}</strong>{t(' — it will not be interleaved with writes from other processes. Writes > PIPE_BUF may be split and interleaved.', ' — nu va fi intercalată cu scrierile altor procese. Scrierile > PIPE_BUF pot fi divizate și intercalate.')}</p>
                </Box>

                <p className="font-bold mt-2">{t('Tip for N-to-1 with variable-length messages:', 'Sfat pentru N-la-1 cu mesaje de lungime variabilă:')}</p>
                <Code>{`// Use a fixed-size header:
struct message {
    int sender_pid;
    int payload_length;
    // followed by payload_length bytes of actual data
};
// Write header+payload in one write() call to ensure atomicity
// (if total size <= PIPE_BUF)`}</Code>
              </Section>

              <Section title={t('6. Applications', '6. Aplicații')} id="course_9-apps" checked={!!checked['course_9-apps']} onCheck={() => toggleCheck('course_9-apps')}>
                <Box type="definition">
                  <p className="font-bold">{t('Semaphore via fifo:', 'Semaphore prin fifo:')}</p>
                  <p className="text-sm">{t('Create a fifo, write 1 byte (init). ', 'Se creează un fifo, se scrie 1 octet (inițializare). ')}<code>wait()</code>{t(' = read 1 byte (blocks if empty). ', ' = citire 1 octet (blochează dacă e gol). ')}<code>signal()</code>{t(' = write 1 byte. The blocking read behavior gives us semaphore semantics for free.', ' = scriere 1 octet. Comportamentul blocant al citirii ne oferă semantica semaphore-ului în mod gratuit.')}</p>
                </Box>

                <Box type="definition">
                  <p className="font-bold">{t('Client/Server via fifos:', 'Client/Server prin fifouri:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>{t('Server creates a ', 'Serverul creează un ')}<strong>{t('well-known fifo', 'fifo binecunoscut')}</strong>{t(' and listens for requests', ' și ascultă cereri')}</li>
                    <li>{t('Each client connects to the well-known fifo and sends a request with its PID', 'Fiecare client se conectează la fifo-ul binecunoscut și trimite o cerere cu PID-ul său')}</li>
                    <li>{t('Server creates a ', 'Serverul creează un ')}<strong>{t('per-client fifo', 'fifo per-client')}</strong>{t(' (e.g., ', ' (ex., ')}<code>/tmp/resp.PID</code>{t(') to send the reply', ') pentru a trimite răspunsul')}</li>
                    <li><strong>{t('Iterative server', 'Server iterativ')}</strong>{t(': serves one client at a time. ', ': servește un client pe rând. ')}<strong>{t('Concurrent server', 'Server concurent')}</strong>{t(': forks a worker per client', ': creează un worker per client prin fork')}</li>
                  </ul>
                </Box>
              </Section>

              <Section title={t('Cheat Sheet', 'Rezumat rapid')} id="course_9-cheat" checked={!!checked['course_9-cheat']} onCheck={() => toggleCheck('course_9-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">{t('Anonymous pipe', 'Pipe anonim')}</p><p>pipe(pfd) → pfd[0]=read, pfd[1]=write</p><p>{t('Must pipe() BEFORE fork()', 'pipe() trebuie apelat ÎNAINTE de fork()')}</p><p>{t('Close unused ends!', 'Închideți capetele neutilizate!')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Named pipe', 'Pipe cu nume')}</p><p>mkfifo(path, mode)</p><p>{t('open() blocks until both ends open', 'open() blochează până la deschiderea ambelor capete')}</p><p>{t('Data non-persistent (RAM only)', 'Date nepersistente (doar în RAM)')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Blocking rules', 'Reguli de blocare')}</p><p>{t('Read empty → block (or EOF if no writers)', 'Citire gol → blocare (sau EOF dacă nu sunt scriitori)')}</p><p>{t('Write full → block', 'Scriere plin → blocare')}</p><p>{t('Write no readers → SIGPIPE!', 'Scriere fără cititori → SIGPIPE!')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Atomicity', 'Atomicitate')}</p><p>{t('write ≤ PIPE_BUF = atomic', 'scriere ≤ PIPE_BUF = atomică')}</p><p>PIPE_BUF ≥ 512 (Linux: 4096)</p><p>{t('Larger writes may interleave', 'Scrierile mai mari pot fi intercalate')}</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="course_9-quiz" checked={!!checked['course_9-quiz']} onCheck={() => toggleCheck('course_9-quiz')}>
                <Toggle question={t('1. Why must you create the pipe BEFORE fork?', '1. De ce trebuie să creați pipe-ul ÎNAINTE de fork?')} answer={t('Because the child needs to inherit both file descriptors (pfd[0] and pfd[1]) from the parent. After fork, both processes have copies. If you pipe() after fork, only the calling process has the descriptors — the other can\'t access the pipe.', 'Deoarece procesul fiu trebuie să moștenească ambii descriptori (pfd[0] și pfd[1]) de la părinte. După fork, ambele procese au copii. Dacă apelați pipe() după fork, doar procesul apelant are descriptorii — celălalt nu poate accesa pipe-ul.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('2. What happens if you don\'t close the unused write end in the reader?', '2. Ce se întâmplă dacă nu închideți capătul de scriere neutilizat în cititor?')} answer={t('The reader will NEVER see EOF. read() returns 0 (EOF) only when ALL write-end descriptors are closed. Since the reader still has a write end open, read blocks forever when the pipe empties.', 'Cititorul nu va vedea NICIODATĂ EOF. read() returnează 0 (EOF) doar când TOȚI descriptorii capătului de scriere sunt închiși. Deoarece cititorul are în continuare un capăt de scriere deschis, read blochează la infinit când pipe-ul se golește.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('3. Can unrelated processes use an anonymous pipe?', '3. Pot procesele neînrudite folosi un pipe anonim?')} answer={t('No. Anonymous pipes have no name/path — the only way to share the descriptors is through fork (inheritance) or exec (fd inheritance). Use named pipes (fifos) for unrelated processes.', 'Nu. Pipe-urile anonime nu au nume/cale — singura modalitate de a partaja descriptorii este prin fork (moștenire) sau exec (moștenirea fd). Utilizați pipe-uri cu nume (fifouri) pentru procese neînrudite.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('4. What signal is sent when writing to a pipe with no readers?', '4. Ce signal este trimis la scrierea pe un pipe fără cititori?')} answer={t("SIGPIPE (signal 13). Default action: terminate the process. This is why you see processes silently die when piping to 'head' — head closes its stdin after reading enough lines, and the writer gets SIGPIPE.", "SIGPIPE (signal 13). Acțiunea implicită: terminarea procesului. De aceea procesele mor în tăcere când se face pipe spre 'head' — head își închide stdin-ul după citirea suficientelor linii, iar scriitorul primește SIGPIPE.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('5. Is data in a fifo persistent on disk?', '5. Datele dintr-un fifo sunt persistente pe disc?')} answer={t('No. Despite having a filename in the filesystem, the data in a fifo exists only in kernel memory (RAM). When all processes close the fifo, unread data is lost. The file entry persists, but the data does not.', 'Nu. În ciuda faptului că au un nume de fișier în sistemul de fișiere, datele dintr-un fifo există doar în memoria kernel-ului (RAM). Când toate procesele închid fifo-ul, datele necitite sunt pierdute. Intrarea din sistem de fișiere persistă, dar datele nu.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('6. What does the blocking open of a fifo mean?', '6. Ce înseamnă deschiderea blocantă a unui fifo?')} answer={t("Opening a fifo for O_RDONLY blocks until another process opens it for O_WRONLY (and vice versa). They must 'rendezvous'. This is different from regular files where open always succeeds immediately.", "Deschiderea unui fifo cu O_RDONLY blochează până când un alt proces îl deschide cu O_WRONLY (și invers). Ele trebuie să 'se întâlnească'. Aceasta diferă de fișierele obișnuite unde open reușește întotdeauna imediat.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('7. When are pipe writes atomic?', '7. Când sunt scrierile pe pipe atomice?')} answer={t('When the write size is ≤ PIPE_BUF bytes (POSIX guarantees ≥ 512, Linux uses 4096). Atomic means the bytes won\'t be interleaved with bytes from another writer. Writes > PIPE_BUF may be split.', 'Când dimensiunea scrierii este ≤ PIPE_BUF octeți (POSIX garantează ≥ 512, Linux folosește 4096). Atomic înseamnă că octeții nu vor fi intercalați cu octeții de la alt scriitor. Scrierile > PIPE_BUF pot fi divizate.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('8. Why is fflush() critical when using fprintf on pipes?', '8. De ce fflush() este critic când folosiți fprintf pe pipe-uri?')} answer={t('fprintf writes to a user-space buffer, NOT directly to the pipe. Without fflush(), the data sits in the buffer. The reader blocks waiting for data that the writer thinks it has already sent. This is a very common and hard-to-debug mistake.', 'fprintf scrie într-un buffer user-space, NU direct pe pipe. Fără fflush(), datele rămân în buffer. Cititorul se blochează așteptând date pe care scriitorul crede că le-a trimis deja. Aceasta este o greșeală foarte frecventă și greu de depanat.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('9. How would you implement bidirectional communication with pipes?', '9. Cum ați implementa comunicația bidirecțională cu pipe-uri?')} answer={t('Use TWO pipes: one for each direction. A single pipe is unidirectional. Pipe1: parent→child. Pipe2: child→parent. Each process closes the unused ends of both pipes.', 'Utilizați DOUĂ pipe-uri: unul pentru fiecare direcție. Un singur pipe este unidirecțional. Pipe1: părinte→copil. Pipe2: copil→părinte. Fiecare proces închide capetele neutilizate ale ambelor pipe-uri.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('10. How can you implement a semaphore using a fifo?', '10. Cum puteți implementa un semaphore folosind un fifo?')} answer={t('Create a fifo. Initialize: write N bytes (for semaphore value N). sem_wait: read 1 byte (blocks if empty = value is 0). sem_post: write 1 byte. The blocking read semantics give you semaphore behavior.', 'Creați un fifo. Inițializare: scrieți N octeți (pentru valoarea semaphore-ului N). sem_wait: citiți 1 octet (blochează dacă e gol = valoarea este 0). sem_post: scrieți 1 octet. Semantica citirii blocante vă oferă comportamentul semaphore-ului.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
              </Section>
    </>
  );
}
