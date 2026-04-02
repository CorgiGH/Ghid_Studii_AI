import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Course06() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
              <p className="mb-3 text-sm opacity-80">Source: OS(6) - Programare de sistem in C pentru Linux (III), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Plan:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('Program vs process — definitions', 'Program vs. proces — definiții')}</li>
                  <li>{t('Process table (PCB), PID, PPID, UID, states', 'Tabela proceselor (PCB), PID, PPID, UID, stări')}</li>
                  <li>{t('Info primitives: getpid, getppid, getuid, etc.', 'Primitive informative: getpid, getppid, getuid, etc.')}</li>
                  <li>{t('Sleep primitives: sleep, usleep, nanosleep', 'Primitive de suspendare: sleep, usleep, nanosleep')}</li>
                  <li>{t('Termination: exit (normal) vs abort/signal (abnormal)', 'Terminare: exit (normală) vs. abort/semnal (anormală)')}</li>
                  <li>{t('Process creation: fork() — the only way', 'Crearea proceselor: fork() — singura metodă')}</li>
                  <li>{t("What the child inherits (and what it doesn't)", 'Ce moștenește fiul (și ce nu)')}</li>
                  <li>{t('Synchronization: wait() and waitpid()', 'Sincronizare: wait() și waitpid()')}</li>
                  <li>{t('Zombie and orphan processes', 'Procese zombie și orfane')}</li>
                </ol>
              </Box>

              <Section title={t('1. Program vs Process', '1. Program vs. Proces')} id="c6-def" checked={!!checked['c6-def']} onCheck={() => toggleCheck('c6-def')}>
                <Box type="definition">
                  <p><strong>{t('Program', 'Program')}</strong> = {t('an executable file on disk (compiled from source).', 'un fișier executabil pe disc (compilat din sursă).')}</p>
                  <p><strong>{t('Process', 'Proces')}</strong> = {t('an instance of a program in execution, characterized by: lifetime, allocated memory (code + data + stacks), CPU time, and other resources.', 'o instanță a unui program în execuție, caracterizată prin: durată de viață, memorie alocată (cod + date + stive), timp procesor și alte resurse.')}</p>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Process hierarchy:', 'Ierarhia proceselor:')}</p>
                  <p>{t('Processes form a ', 'Procesele formează un ')}<strong>{t('tree', 'arbore')}</strong>{t('. Every process has a parent (PPID) that created it. Root of tree = PID 0 (created at boot). PID 1 = ', '. Fiecare proces are un părinte (PPID) care l-a creat. Rădăcina arborelui = PID 0 (creat la pornire). PID 1 = ')} <code>init</code>/<code>systemd</code> {t('(first user-space process).', '(primul proces din spațiul utilizator).')}</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Process Control Block (PCB) contains:', 'Process Control Block (PCB) conține:')}</p>
                  <Code>{`PID, PPID             // process & parent IDs
UID, GID              // real owner
EUID, EGID            // effective owner (for setuid programs)
State                 // ready, running, waiting, zombie
Terminal, cmdline, env, hardware context, ...`}</Code>
                </Box>
              </Section>

              <Section title={t('2. Info & Utility Primitives', '2. Primitive informative și utilitare')} id="c6-info" checked={!!checked['c6-info']} onCheck={() => toggleCheck('c6-info')}>
                <Box type="formula">
                  <p className="font-bold">{t('Process information:', 'Informații despre proces:')}</p>
                  <Code>{`pid_t getpid(void);   // my PID
pid_t getppid(void);  // parent's PID
uid_t getuid(void);   // real user ID
uid_t geteuid(void);  // effective user ID
gid_t getgid(void);   // real group ID`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Sleep (suspend execution):', 'Sleep (suspendarea execuției):')}</p>
                  <Code>{`sleep(5);             // 5 seconds (precision: seconds)
usleep(500000);       // 0.5 seconds (precision: microseconds)
nanosleep(&req, &rem); // nanosecond precision, restartable`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p>{t('Actual sleep duration may ', 'Durata efectivă de suspendare poate ')}<strong>{t('exceed', 'depăși')}</strong>{t(' the requested time (OS scheduling). It may also be ', ' valoarea specificată (planificarea SO). Poate fi și ')}<strong>{t('shorter', 'mai scurtă')}</strong>{t(' if a signal interrupts the sleep (errno = EINTR). Only ', ' dacă un semnal întrerupe suspendarea (errno = EINTR). Doar ')} <code>nanosleep</code> {t('reports the remaining time via its second argument.', 'raportează timpul rămas prin al doilea argument.')}</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Termination:', 'Terminare:')}</p>
                  <Code>{`// Normal termination:
exit(status);  // status & 0xFF saved as exit code
return n;      // from main(), equivalent to exit(n)

// Abnormal termination:
abort();       // sends SIGABRT to self → abnormal exit`}</Code>
                </Box>
              </Section>

              <Section title={t('3. fork() — Process Creation', '3. fork() — Crearea proceselor')} id="c6-fork" checked={!!checked['c6-fork']} onCheck={() => toggleCheck('c6-fork')}>
                <p><code>fork()</code> {t('is the ', 'este singura ')}<strong>{t('only', '')}</strong>{t(' way to create a new process in UNIX/Linux.', 'modalitate de a crea un proces nou în UNIX/Linux.')}</p>

                <Box type="formula">
                  <p className="font-bold">{t('Interface:', 'Interfață:')}</p>
                  <Code>{`pid_t fork(void);
// Creates a COPY (clone) of the calling process
// BOTH parent and child continue from the next instruction

// Return values:
//   In parent: child's PID (positive number)
//   In child:  0
//   On error:  -1 (no child created)`}</Code>
                </Box>

                <svg viewBox="0 0 400 180" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="140" y="5" width="120" height="30" rx="6" fill="#3b82f6" opacity="0.15" stroke="#3b82f6"/>
                  <text x="200" y="24" textAnchor="middle" fill="#3b82f6" fontWeight="bold">{t('Parent process', 'Proces părinte')}</text>
                  <text x="200" y="55" textAnchor="middle" fill="currentColor" fontWeight="bold" fontSize="12">fork()</text>
                  <line x1="200" y1="35" x2="200" y2="45" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="200" y1="60" x2="100" y2="80" stroke="#3b82f6" strokeWidth="1.5"/>
                  <line x1="200" y1="60" x2="300" y2="80" stroke="#10b981" strokeWidth="1.5"/>
                  <rect x="40" y="80" width="120" height="35" rx="6" fill="#3b82f6" opacity="0.1" stroke="#3b82f6"/>
                  <text x="100" y="95" textAnchor="middle" fill="#3b82f6" fontSize="9">{t('Parent continues', 'Părintele continuă')}</text>
                  <text x="100" y="108" textAnchor="middle" fill="#3b82f6" fontSize="9">{t('fork() returns child PID', 'fork() returnează PID-ul fiului')}</text>
                  <rect x="240" y="80" width="120" height="35" rx="6" fill="#10b981" opacity="0.1" stroke="#10b981"/>
                  <text x="300" y="95" textAnchor="middle" fill="#10b981" fontSize="9">{t('Child starts here', 'Fiul începe aici')}</text>
                  <text x="300" y="108" textAnchor="middle" fill="#10b981" fontSize="9">{t('fork() returns 0', 'fork() returnează 0')}</text>
                  <text x="200" y="140" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.6">{t('Both run the SAME code, differentiated by return value', 'Ambii rulează ACELAȘI cod, diferențiați prin valoarea returnată')}</text>
                  <text x="200" y="155" textAnchor="middle" fill="#ef4444" fontSize="9">{t('Separate memory! Variable changes are NOT shared.', 'Memorie separată! Modificările variabilelor NU sunt partajate.')}</text>
                </svg>

                <p className="font-bold mt-2">{t('Canonical fork pattern:', 'Tiparul canonic fork:')}</p>
                <Code>{`pid_t pid = fork();
if (pid == -1) {
    perror("fork failed"); exit(1);
}
if (pid == 0) {
    // ===== CHILD process =====
    printf("I am child, PID=%d, parent=%d\\n", getpid(), getppid());
    exit(0);  // child exits with code 0
}
// ===== PARENT process =====
printf("I am parent, PID=%d, child=%d\\n", getpid(), pid);
// parent continues...`}</Code>

                <Box type="theorem">
                  <p className="font-bold">{t('What the child inherits from parent:', 'Ce moștenește fiul de la părinte:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>{t('Same UID/GID, environment variables, command line', 'Același UID/GID, variabile de mediu, linie de comandă')}</li>
                    <li>{t('Same ', 'Aceiași ')}<strong>{t('open file descriptors', 'descriptori de fișiere deschiși')}</strong>{t(' (shared entries in global file table!)', ' (intrări partajate în tabela globală de fișiere!)')}</li>
                    <li>{t('Same memory-mapped regions (mmap)', 'Aceleași regiuni mapate în memorie (mmap)')}</li>
                    <li>{t('Copy of all variables (but in ', 'Copie a tuturor variabilelor (dar în ')}<strong>{t('separate memory', 'memorie separată')}</strong>{t(' — COW)', ' — COW)')}</li>
                  </ul>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Critical point — no shared memory by default:', 'Punct critic — fără memorie partajată implicit:')}</p>
                  <p>{t('After fork, parent and child each work on their ', 'După fork, părintele și fiul lucrează fiecare pe propria ')}<strong>{t('own copy', 'copie')}</strong>{t(' of memory. If the child modifies a variable, the parent does NOT see it (and vice versa). This is implemented via ', ' a memoriei. Dacă fiul modifică o variabilă, părintele NU o vede (și invers). Aceasta este implementată prin pagini ')}<strong>{t('copy-on-write', 'copy-on-write')}</strong>{t(' (COW) pages for efficiency.', ' (COW) pentru eficiență.')}</p>
                </Box>

                <p className="font-bold mt-2">{t('Example — proving separate memory:', 'Exemplu — demonstrarea memoriei separate:')}</p>
                <Code>{`int x = 10;
pid_t pid = fork();
if (pid == 0) {
    x = 99;  // child modifies x
    printf("Child: x=%d\\n", x);   // prints 99
    exit(0);
}
wait(NULL);
printf("Parent: x=%d\\n", x);     // prints 10 (unchanged!)`}</Code>
              </Section>

              <Section title={t('4. wait() — Synchronization', '4. wait() — Sincronizare')} id="c6-wait" checked={!!checked['c6-wait']} onCheck={() => toggleCheck('c6-wait')}>
                <Box type="formula">
                  <p className="font-bold">{t('wait() and waitpid():', 'wait() și waitpid():')}</p>
                  <Code>{`pid_t wait(int* wstatus);
// Blocks until ANY child terminates
// Returns: PID of terminated child, or -1 (no children)

pid_t waitpid(pid_t pid, int* wstatus, int options);
// pid = -1: wait for any child (like wait())
// pid > 0: wait for specific child
// options: 0 (block) or WNOHANG (non-blocking)`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Inspecting wstatus with macros:', 'Inspectarea wstatus cu macro-uri:')}</p>
                  <Code>{`int wstatus;
pid_t child = wait(&wstatus);

if (WIFEXITED(wstatus)) {
    // Normal termination
    int code = WEXITSTATUS(wstatus);  // exit code (0-255)
    printf("Child %d exited with code %d\\n", child, code);
}
else if (WIFSIGNALED(wstatus)) {
    // Killed by signal
    int sig = WTERMSIG(wstatus);
    printf("Child %d killed by signal %d\\n", child, sig);
}`}</Code>
                </Box>

                <Box type="definition">
                  <p className="font-bold">{t('Zombie and orphan processes:', 'Procese zombie și orfane:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>{t('Zombie', 'Zombie')}</strong>: {t("child terminated but parent hasn't called wait() yet. The PCB entry remains in the process table. Fix: parent must call wait().", 'fiul s-a terminat dar părintele nu a apelat încă wait(). Intrarea PCB rămâne în tabela proceselor. Soluție: părintele trebuie să apeleze wait().')}</li>
                    <li><strong>{t('Orphan', 'Orfan')}</strong>: {t('parent terminates before child. The child is re-parented to PID 1 (init/systemd), which will reap it.', 'părintele se termină înainte de fiu. Fiul este re-adoptat de PID 1 (init/systemd), care îl va recolta.')}</li>
                  </ul>
                </Box>

                <p className="font-bold mt-2">{t('Example — create N children, wait for all:', 'Exemplu — crearea a N fii, așteptarea tuturor:')}</p>
                <Code>{`#define N 5
for (int i = 0; i < N; i++) {
    pid_t pid = fork();
    if (pid == 0) {
        printf("Child %d (PID %d) working...\\n", i, getpid());
        sleep(i + 1);       // simulate work
        exit(i);            // return i as exit code
    }
}
// Parent waits for ALL children:
for (int i = 0; i < N; i++) {
    int st;
    pid_t p = wait(&st);
    if (WIFEXITED(st))
        printf("Child %d finished, code=%d\\n", p, WEXITSTATUS(st));
}`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Trap — fork in a loop:', 'Capcană — fork într-o buclă:')}</p>
                  <p>{t('If you forget the ', 'Dacă uitați ')} <code>exit()</code> {t('in the child branch, the child will continue the for-loop and fork ', 'din ramura fiului, fiul va continua bucla for și va fork ')}<strong>{t('its own', 'proprii')}</strong>{t(' children, causing an exponential explosion of processes (fork bomb)!', ' copii, cauzând o explozie exponențială de procese (fork bomb)!')}</p>
                </Box>
              </Section>

              <Section title={t('5. Synchronization Points', '5. Puncte de sincronizare')} id="c6-sync" checked={!!checked['c6-sync']} onCheck={() => toggleCheck('c6-sync')}>
                <Box type="theorem">
                  <p className="font-bold">{t('Two synchronization points:', 'Două puncte de sincronizare:')}</p>
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>fork()</strong>{t(': both parent and child start simultaneous execution from this point', ': atât părintele cât și fiul încep execuția simultană din acest punct')}</li>
                    <li><strong>wait()</strong>{t(': parent blocks until child terminates — this is where exit code flows from child to parent', ': părintele se blochează până când fiul se termină — aici curge codul de exit de la fiu la părinte')}</li>
                  </ol>
                </Box>

                <svg viewBox="0 0 350 130" className="w-full max-w-sm mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <text x="175" y="15" textAnchor="middle" fill="currentColor" fontWeight="bold">{t('Timeline', 'Cronologie')}</text>
                  <line x1="50" y1="40" x2="300" y2="40" stroke="#3b82f6" strokeWidth="2"/>
                  <text x="30" y="44" fill="#3b82f6" fontSize="9">P</text>
                  <line x1="120" y1="40" x2="120" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="3"/>
                  <line x1="120" y1="70" x2="250" y2="70" stroke="#10b981" strokeWidth="2"/>
                  <text x="105" y="68" fill="#10b981" fontSize="9">C</text>
                  <circle cx="120" cy="40" r="4" fill="#f59e0b"/>
                  <text x="120" y="30" textAnchor="middle" fill="#f59e0b" fontSize="8">fork()</text>
                  <circle cx="250" cy="70" r="4" fill="#ef4444"/>
                  <text x="250" y="85" textAnchor="middle" fill="#ef4444" fontSize="8">exit()</text>
                  <line x1="250" y1="70" x2="250" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3"/>
                  <circle cx="250" cy="40" r="4" fill="#f59e0b"/>
                  <text x="250" y="30" textAnchor="middle" fill="#f59e0b" fontSize="8">{t('wait() returns', 'wait() returnează')}</text>
                  <rect x="160" y="36" width="90" height="8" rx="2" fill="#3b82f6" opacity="0.2"/>
                  <text x="205" y="43" textAnchor="middle" fill="#3b82f6" fontSize="7">{t('blocked', 'blocat')}</text>
                </svg>
              </Section>

              <Section title={t('Cheat Sheet', 'Rezumat rapid')} id="c6-cheat" checked={!!checked['c6-cheat']} onCheck={() => toggleCheck('c6-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">fork()</p><p>{t('Returns: child PID (parent), 0 (child), -1 (error)', 'Returnează: PID fiu (părinte), 0 (fiu), -1 (eroare)')}</p><p>{t('Child = clone, separate memory (COW)', 'Fiu = clonă, memorie separată (COW)')}</p><p>{t('Shares: open fds, mmaps, env', 'Partajează: descriptori deschiși, mmap-uri, env')}</p></Box>
                  <Box type="formula"><p className="font-bold">wait()/waitpid()</p><p>WIFEXITED, WEXITSTATUS</p><p>WIFSIGNALED, WTERMSIG</p><p>{t('WNOHANG for non-blocking', 'WNOHANG pentru neblocant')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Info', 'Informații')}</p><p>getpid, getppid, getuid, geteuid</p><p>sleep, usleep, nanosleep</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Termination', 'Terminare')}</p><p>{t('exit(code) — normal', 'exit(cod) — normală')}</p><p>abort() — SIGABRT — {t('abnormal', 'anormală')}</p><p>{t('Zombie: child done, parent no wait', 'Zombie: fiu terminat, părintele nu a așteptat')}</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c6-quiz" checked={!!checked['c6-quiz']} onCheck={() => toggleCheck('c6-quiz')}>
                <Toggle question={t('1. What is the ONLY way to create a new process in UNIX?', '1. Care este singura modalitate de a crea un proces nou în UNIX?')} answer={t('The fork() system call. It creates a clone of the calling process. There is no other mechanism (unlike Windows which has CreateProcess).', 'Apelul de sistem fork(). Creează o clonă a procesului apelant. Nu există alt mecanism (spre deosebire de Windows care are CreateProcess).')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('2. What does fork() return in the child process, and why?', '2. Ce returnează fork() în procesul fiu și de ce?')} answer={t("0. Because the child can always find its parent's PID via getppid(), but the parent has no built-in way to find the child's PID other than the fork() return value. So the asymmetry is by design.", '0. Deoarece fiul poate afla oricând PID-ul părintelui prin getppid(), dar părintele nu are altă metodă built-in de a afla PID-ul fiului decât valoarea returnată de fork(). Asimetria este intenționată.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('3. After fork(), if the child modifies variable x, does the parent see the change?', '3. După fork(), dacă fiul modifică variabila x, o vede și părintele?')} answer={t('No. Parent and child have separate memory spaces. Changes in one are invisible to the other. This is the fundamental consequence of fork() creating a COPY. (Implemented efficiently via copy-on-write pages.)', 'Nu. Părintele și fiul au spații de memorie separate. Modificările dintr-unul sunt invizibile pentru celălalt. Aceasta este consecința fundamentală a faptului că fork() creează o COPIE. (Implementat eficient prin pagini copy-on-write.)')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('4. What is a zombie process and how do you prevent it?', '4. Ce este un proces zombie și cum îl preveniți?')} answer={t("A zombie is a process that has terminated but whose parent hasn't called wait() to read its exit status. The PCB remains in the process table. Prevention: parent must call wait() or waitpid() for each child.", "Un zombie este un proces care s-a terminat dar al cărui părinte nu a apelat wait() pentru a-i citi statusul de exit. PCB-ul rămâne în tabela proceselor. Prevenire: părintele trebuie să apeleze wait() sau waitpid() pentru fiecare fiu.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('5. What happens to orphan processes?', '5. Ce se întâmplă cu procesele orfane?')} answer={t('If a parent dies before its children, the children become orphans and are re-parented to PID 1 (init/systemd), which will eventually call wait() to reap them.', 'Dacă un părinte moare înaintea copiilor săi, aceștia devin orfani și sunt re-adoptați de PID 1 (init/systemd), care va apela în cele din urmă wait() pentru a-i recolta.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('6. Why is exit() in the child critical inside a fork-in-a-loop?', '6. De ce este exit() în fiu critic într-un fork în buclă?')} answer={t("Without exit(), the child continues the loop and calls fork() itself, creating grandchildren who also continue the loop — exponential process explosion (fork bomb). Always exit() or _exit() in the child branch.", 'Fără exit(), fiul continuă bucla și apelează fork() el însuși, creând nepoți care continuă și ei bucla — explozie exponențială de procese (fork bomb). Utilizați întotdeauna exit() sau _exit() în ramura fiului.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('7. Do file descriptors survive fork()?', '7. Descriptorii de fișiere supraviețuiesc fork()?')} answer={t("Yes. The child inherits copies of ALL open file descriptors, and crucially, they point to the SAME entries in the kernel's global open file table. So parent and child share the file offset — reads/writes by one affect the other's position.", 'Da. Fiul moștenește copii ale TUTUROR descriptorilor de fișiere deschiși și, crucial, aceștia pointează spre ACELEAȘI intrări din tabela globală de fișiere a nucleului. Deci părintele și fiul partajează offset-ul — citirile/scrierile unuia afectează poziția celuilalt.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('8. What does WEXITSTATUS(wstatus) return if the child called exit(42)?', '8. Ce returnează WEXITSTATUS(wstatus) dacă fiul a apelat exit(42)?')} answer={t('42. WEXITSTATUS extracts the low 8 bits of the exit code from the wstatus value. Only valid if WIFEXITED(wstatus) is true.', '42. WEXITSTATUS extrage cei 8 biți inferiori ai codului de exit din valoarea wstatus. Valabil doar dacă WIFEXITED(wstatus) este adevărat.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('9. How do you wait for a SPECIFIC child process?', '9. Cum așteptați un anumit proces fiu?')} answer={<span>{t('Use ', 'Utilizați ')} <code>waitpid(child_pid, &st, 0)</code> {t('instead of', 'în loc de')} <code>wait()</code>. {t('The first argument is the specific PID to wait for.', 'Primul argument este PID-ul specific pentru care se așteaptă.')}</span>} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('10. What is the difference between exit() and _exit()?', '10. Care este diferența dintre exit() și _exit()?')} answer={t("exit() flushes stdio buffers, runs atexit() handlers, then terminates. _exit() terminates IMMEDIATELY without flushing buffers or cleanup. Use _exit() in child processes after fork() if the child will call exec() (to avoid double-flushing buffers).", 'exit() golește buffer-ele stdio, rulează handler-ele atexit(), apoi termină. _exit() termină IMEDIAT fără a goli buffer-ele sau a face curățenie. Utilizați _exit() în procesele fii după fork() dacă fiul va apela exec() (pentru a evita dublarea golirii buffer-elor).')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
              </Section>
    </>
  );
}
