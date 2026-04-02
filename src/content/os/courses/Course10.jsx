import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Course10() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
              <p className="mb-3 text-sm opacity-80">Source: OS(10) - Programare de sistem in C pentru Linux (VII), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Plan:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('What is a signal — software interrupt concept', 'Ce este un semnal — conceptul de întrerupere software')}</li>
                  <li>{t('Signal categories: errors, external events, explicit requests', 'Categorii de semnale: erori, evenimente externe, cereri explicite')}</li>
                  <li>{t('Synchronous vs asynchronous signals', 'Semnale sincrone vs. asincrone')}</li>
                  <li>{t('Generating signals: kill(), raise()', 'Generarea semnalelor: kill(), raise()')}</li>
                  <li>{t('Predefined signal types (SIGINT, SIGKILL, SIGSEGV, etc.)', 'Tipuri predefinite de semnale (SIGINT, SIGKILL, SIGSEGV, etc.)')}</li>
                  <li>{t('Signal handling: default, ignore, custom handler', 'Tratarea semnalelor: implicit, ignorare, handler personalizat')}</li>
                  <li>{t('signal() — configuring handlers', 'signal() — configurarea handler-elor')}</li>
                  <li>{t('Writing safe signal handlers', 'Scrierea handler-elor de semnal sigure')}</li>
                  <li>{t('Blocking signals: sigprocmask(), sigpending()', 'Blocarea semnalelor: sigprocmask(), sigpending()')}</li>
                  <li>{t('Waiting for signals: pause(), sigsuspend()', 'Așteptarea semnalelor: pause(), sigsuspend()')}</li>
                </ol>
              </Box>

              <Section title={t('1. What is a Signal?', '1. Ce este un semnal?')} id="c10-what" checked={!!checked['c10-what']} onCheck={() => toggleCheck('c10-what')}>
                <Box type="definition">
                  <p>{t('A ', 'Un ')}<strong>{t('signal', 'semnal')}</strong>{t(' is a software interrupt generated when an exceptional event occurs, delivered by the OS to a specific process. Each signal has a ', ' este o întrerupere software generată când apare un eveniment excepțional, transmisă de sistemul de operare unui anumit proces. Fiecare semnal are un ')}<strong>{t('type', 'tip')}</strong>{t(' (integer) and a ', ' (întreg) și un ')}<strong>{t('destination process', 'proces destinatar')}</strong>{t('.', '.')}</p>
                </Box>

                <svg viewBox="0 0 450 140" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="15" width="110" height="35" rx="5" fill="#ef4444" opacity="0.12" stroke="#ef4444"/>
                  <text x="65" y="30" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">{t('Errors', 'Erori')}</text>
                  <text x="65" y="42" textAnchor="middle" fill="currentColor" fontSize="8">SIGSEGV, SIGFPE</text>
                  <rect x="10" y="58" width="110" height="35" rx="5" fill="#3b82f6" opacity="0.12" stroke="#3b82f6"/>
                  <text x="65" y="73" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="bold">{t('External events', 'Evenimente externe')}</text>
                  <text x="65" y="85" textAnchor="middle" fill="currentColor" fontSize="8">SIGCHLD, SIGINT</text>
                  <rect x="10" y="100" width="110" height="35" rx="5" fill="#10b981" opacity="0.12" stroke="#10b981"/>
                  <text x="65" y="115" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">{t('Explicit requests', 'Cereri explicite')}</text>
                  <text x="65" y="127" textAnchor="middle" fill="currentColor" fontSize="8">kill(), raise()</text>
                  <line x1="120" y1="75" x2="180" y2="75" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)"/>
                  <rect x="180" y="55" width="80" height="40" rx="6" fill="#f59e0b" opacity="0.15" stroke="#f59e0b"/>
                  <text x="220" y="72" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">{t('Signal', 'Semnal')}</text>
                  <text x="220" y="85" textAnchor="middle" fill="currentColor" fontSize="8">{t('queue', 'coadă')}</text>
                  <line x1="260" y1="75" x2="310" y2="75" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)"/>
                  <rect x="310" y="55" width="120" height="40" rx="6" fill="currentColor" opacity="0.06" stroke="currentColor" strokeWidth="1"/>
                  <text x="370" y="72" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="bold">{t('Process', 'Proces')}</text>
                  <text x="370" y="85" textAnchor="middle" fill="currentColor" fontSize="8">{t('→ handler executes', '→ handler-ul se execută')}</text>
                </svg>

                <Box type="theorem">
                  <p className="font-bold">{t('Synchronous vs asynchronous:', 'Sincron vs. asincron:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>{t('Synchronous', 'Sincron')}</strong>{t(': caused by the process itself (division by zero → SIGFPE, bad pointer → SIGSEGV). Delivered during the triggering action.', ': cauzat de procesul însuși (împărțire la zero → SIGFPE, pointer invalid → SIGSEGV). Livrat în timpul acțiunii declanșatoare.')}</li>
                    <li><strong>{t('Asynchronous', 'Asincron')}</strong>{t(': caused by external events (user presses Ctrl+C → SIGINT, another process calls kill()). Arrives at unpredictable times.', ': cauzat de evenimente externe (utilizatorul apasă Ctrl+C → SIGINT, alt proces apelează kill()). Sosește la momente imprevizibile.')}</li>
                  </ul>
                </Box>
              </Section>

              <Section title={t('2. Generating Signals', '2. Generarea semnalelor')} id="c10-gen" checked={!!checked['c10-gen']} onCheck={() => toggleCheck('c10-gen')}>
                <Box type="formula">
                  <p className="font-bold">{t('From C code:', 'Din cod C:')}</p>
                  <Code>{`#include <signal.h>
int kill(pid_t pid, int sig);
// Send signal 'sig' to process 'pid'
// Returns 0 on success, -1 on error
// kill(pid, 0) — test if process exists (no signal sent)

int raise(int sig);
// Send signal to SELF. Equivalent to: kill(getpid(), sig)`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('From the command line:', 'Din linia de comandă:')}</p>
                  <Code>{`$ kill -SIGTERM 1234     # send SIGTERM to PID 1234
$ kill -9 1234          # send SIGKILL (9) to PID 1234
$ kill -l               # list all signal numbers and names
$ killall -SIGINT myprg # send SIGINT to all processes named "myprg"`}</Code>
                </Box>

                <Box type="definition">
                  <p className="font-bold">{t('Common keyboard signals:', 'Semnale comune de la tastatură:')}</p>
                  <table className="text-sm mt-1">
                    <tbody>
                      <tr><td className="pr-4 font-mono">Ctrl+C</td><td>SIGINT (2) — {t('interrupt', 'întrerupere')}</td></tr>
                      <tr><td className="font-mono">Ctrl+\</td><td>SIGQUIT (3) — {t('quit with core dump', 'ieșire cu core dump')}</td></tr>
                      <tr><td className="font-mono">Ctrl+Z</td><td>SIGTSTP (20) — {t('suspend/stop', 'suspendare/oprire')}</td></tr>
                    </tbody>
                  </table>
                </Box>
              </Section>

              <Section title={t('3. Signal Types', '3. Tipuri de semnale')} id="c10-types" checked={!!checked['c10-types']} onCheck={() => toggleCheck('c10-types')}>
                <Box type="formula">
                  <p className="font-bold">{t('Key predefined signals:', 'Semnale predefinite principale:')}</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="p-1">{t('Signal', 'Semnal')}</th><th className="p-1">{t('Default', 'Implicit')}</th><th className="p-1">{t('Meaning', 'Semnificație')}</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGINT (2)</td><td className="p-1">{t('Terminate', 'Terminare')}</td><td className="p-1">{t('Ctrl+C interrupt', 'Întrerupere Ctrl+C')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGQUIT (3)</td><td className="p-1">{t('Core dump', 'Core dump')}</td><td className="p-1">{t('Ctrl+\\ quit', 'Ieșire Ctrl+\\')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGKILL (9)</td><td className="p-1">{t('Terminate', 'Terminare')}</td><td className="p-1">{t('Force kill (', 'Terminare forțată (')}<strong>{t('cannot be caught!', 'nu poate fi interceptat!')}</strong>{t(')', ')')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGSEGV (11)</td><td className="p-1">{t('Core dump', 'Core dump')}</td><td className="p-1">{t('Invalid memory access', 'Acces invalid la memorie')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGPIPE (13)</td><td className="p-1">{t('Terminate', 'Terminare')}</td><td className="p-1">{t('Write to pipe with no reader', 'Scriere pe canal fără cititor')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGALRM (14)</td><td className="p-1">{t('Terminate', 'Terminare')}</td><td className="p-1">{t('Timer alarm (alarm())', 'Alarmă temporizator (alarm())')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGTERM (15)</td><td className="p-1">{t('Terminate', 'Terminare')}</td><td className="p-1">{t('Graceful termination request', 'Cerere de terminare gracioasă')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGCHLD (17)</td><td className="p-1">{t('Ignore', 'Ignorare')}</td><td className="p-1">{t('Child terminated/stopped', 'Copil terminat/oprit')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGSTOP (19)</td><td className="p-1">{t('Stop', 'Oprire')}</td><td className="p-1">{t('Suspend process (', 'Suspendare proces (')}<strong>{t('cannot be caught!', 'nu poate fi interceptat!')}</strong>{t(')', ')')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGCONT (18)</td><td className="p-1">{t('Continue', 'Continuare')}</td><td className="p-1">{t('Resume stopped process', 'Reluarea procesului oprit')}</td></tr>
                      <tr><td className="p-1 font-mono">SIGUSR1/2</td><td className="p-1">{t('Terminate', 'Terminare')}</td><td className="p-1">{t('User-defined (application use)', 'Definit de utilizator (uz aplicație)')}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Uncatchable signals:', 'Semnale care nu pot fi interceptate:')}</p>
                  <p><code>SIGKILL</code>{t(' and ', ' și ')}<code>SIGSTOP</code>{t(' can ', ' nu pot ')}<strong>{t('never', 'niciodată')}</strong>{t(' be caught, ignored, or blocked. They are the OS\'s guarantee of being able to terminate or stop any process.', ' fi interceptate, ignorate sau blocate. Ele reprezintă garanția sistemului de operare că poate termina sau opri orice proces.')}</p>
                </Box>
              </Section>

              <Section title={t('4. Signal Handling with signal()', '4. Tratarea semnalelor cu signal()')} id="c10-handle" checked={!!checked['c10-handle']} onCheck={() => toggleCheck('c10-handle')}>
                <p>{t('Three possible reactions when a signal arrives:', 'Trei reacții posibile când sosește un semnal:')}</p>
                <Box type="definition">
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>{t('Default action', 'Acțiunea implicită')}</strong>{t(' (SIG_DFL) — terminate, core dump, ignore, or stop', ' (SIG_DFL) — terminare, core dump, ignorare sau oprire')}</li>
                    <li><strong>{t('Ignore', 'Ignorare')}</strong>{t(' (SIG_IGN) — signal is discarded', ' (SIG_IGN) — semnalul este ignorat')}</li>
                    <li><strong>{t('Custom handler', 'Handler personalizat')}</strong>{t(' — your function runs, then process resumes', ' — funcția dvs. se execută, apoi procesul reia execuția')}</li>
                  </ol>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('signal() — configure handling:', 'signal() — configurarea tratării:')}</p>
                  <Code>{`#include <signal.h>
typedef void (*sighandler_t)(int);

sighandler_t signal(int signum, sighandler_t handler);
// handler: SIG_DFL, SIG_IGN, or pointer to your function
// Returns: previous handler, or SIG_ERR on error

// Example — ignore Ctrl+C:
signal(SIGINT, SIG_IGN);

// Example — restore default:
signal(SIGINT, SIG_DFL);`}</Code>
                </Box>

                <p className="font-bold mt-2">{t('Example — custom handler:', 'Exemplu — handler personalizat:')}</p>
                <Code>{`void my_handler(int sig) {
    // sig = signal number that triggered this handler
    printf("Caught signal %d\\n", sig);  // Note: printf not async-signal-safe!
}

int main() {
    signal(SIGINT, my_handler);   // Ctrl+C now calls my_handler
    signal(SIGQUIT, my_handler);  // Ctrl+\\ also calls my_handler

    while (1) {
        printf("Working... (Ctrl+C to test, Ctrl+\\\\ to quit)\\n");
        sleep(2);
    }
    // After handler runs, execution resumes in the while loop
}`}</Code>

                <p className="font-bold mt-2">{t('Example — restoring defaults after catching:', 'Exemplu — restaurarea valorilor implicite după interceptare:')}</p>
                <Code>{`int count = 0;
void handler(int sig) {
    count++;
    printf("Signal %d caught %d time(s)\\n", sig, count);
    if (count >= 3) {
        printf("Restoring default... next one will kill me.\\n");
        signal(sig, SIG_DFL);  // next signal uses default action
    }
}`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Handler safety:', 'Siguranța handler-ului:')}</p>
                  <p>{t('Signal handlers run ', 'Handler-ele de semnal se execută ')}<strong>{t('asynchronously', 'asincron')}</strong>{t(' — they interrupt your program at unpredictable points. Only call ', ' — întrerup programul la puncte imprevizibile. Apelați doar funcții ')}<strong>{t('async-signal-safe', 'sigure pentru semnale asincrone')}</strong>{t(' functions inside handlers (write, _exit, etc.). ', ' în interiorul handler-elor (write, _exit, etc.). ')}<code>printf</code>{t(', ', ', ')}<code>malloc</code>{t(', ', ', ')}<code>fprintf</code>{t(' are NOT safe. Preferred pattern: set a ', ' NU sunt sigure. Tipar preferat: setați un indicator ')}<code>volatile sig_atomic_t</code>{t(' flag in the handler, check it in the main loop.', ' în handler, verificați-l în bucla principală.')}</p>
                </Box>
              </Section>

              <Section title={t('5. Blocking Signals', '5. Blocarea semnalelor')} id="c10-block" checked={!!checked['c10-block']} onCheck={() => toggleCheck('c10-block')}>
                <p><strong>{t('Blocking', 'Blocarea')}</strong>{t(' ≠ ignoring. Blocked signals are ', ' ≠ ignorarea. Semnalele blocate sunt ')}<strong>{t('queued', 'puse în coadă')}</strong>{t(' and delivered when unblocked. Ignored signals are discarded permanently.', ' și livrate când sunt deblocate. Semnalele ignorate sunt eliminate permanent.')}</p>

                <Box type="formula">
                  <p className="font-bold">{t('sigprocmask — block/unblock signal types:', 'sigprocmask — blocarea/deblocarea tipurilor de semnale:')}</p>
                  <Code>{`sigset_t block_set, old_set;

sigemptyset(&block_set);           // start with empty set
sigaddset(&block_set, SIGINT);     // add SIGINT to set
sigaddset(&block_set, SIGQUIT);    // add SIGQUIT to set

// Block these signals:
sigprocmask(SIG_BLOCK, &block_set, &old_set);

// ... critical section (signals queued, not delivered) ...

// Unblock (restore old mask):
sigprocmask(SIG_SETMASK, &old_set, NULL);
// Queued signals are now delivered!

// Check if signals are pending (queued):
sigset_t pending;
sigpending(&pending);
if (sigismember(&pending, SIGINT))
    printf("SIGINT is waiting to be delivered\\n");`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('When to block vs ignore:', 'Când să blocați vs. să ignorați:')}</p>
                  <p>{t('Block signals during critical code sections where interruption would corrupt state. Don\'t ignore — you\'d lose the signal permanently. Blocking defers delivery; ignoring discards it.', 'Blocați semnalele în secțiunile critice de cod unde o întrerupere ar corupe starea. Nu ignorați — ați pierde semnalul permanent. Blocarea amână livrarea; ignorarea îl elimină.')}</p>
                </Box>
              </Section>

              <Section title={t('6. Waiting for Signals', '6. Așteptarea semnalelor')} id="c10-wait" checked={!!checked['c10-wait']} onCheck={() => toggleCheck('c10-wait')}>
                <Box type="formula">
                  <p className="font-bold">{t('pause() — simple wait:', 'pause() — așteptare simplă:')}</p>
                  <Code>{`int pause(void);
// Suspends process until ANY signal is received
// Always returns -1 with errno = EINTR`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('sigsuspend() — safe wait (preferred):', 'sigsuspend() — așteptare sigură (preferată):')}</p>
                  <Code>{`int sigsuspend(const sigset_t* mask);
// Atomically: replace signal mask AND suspend
// Wakes when a signal not in 'mask' is received
// Restores old mask on return

// Example: wait specifically for SIGQUIT, blocking everything else
sigset_t wait_mask;
sigfillset(&wait_mask);           // block ALL signals
sigdelset(&wait_mask, SIGQUIT);   // except SIGQUIT
sigsuspend(&wait_mask);           // sleep until SIGQUIT arrives`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Why sigsuspend over pause?', 'De ce sigsuspend în loc de pause?')}</p>
                  <p>{t('With ', 'Cu ')}<code>pause()</code>{t(", there's a race condition: the signal might arrive ", ', există o condiție de cursă: semnalul poate sosi ')}<strong>{t('between', 'între')}</strong>{t(' unblocking it and calling pause(), so pause() would miss it and block forever. ', ' deblocarea sa și apelul pause(), astfel pause() l-ar rata și ar bloca la infinit. ')}<code>sigsuspend()</code>{t(' is atomic — it changes the mask and suspends in one indivisible operation.', ' este atomică — schimbă masca și suspendă într-o singură operație indivizibilă.')}</p>
                </Box>
              </Section>

              <Section title={t('Cheat Sheet', 'Rezumat rapid')} id="c10-cheat" checked={!!checked['c10-cheat']} onCheck={() => toggleCheck('c10-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">{t('Generate', 'Generare')}</p><p>kill(pid, sig), raise(sig)</p><p>{t('Keyboard: Ctrl+C/\\/Z', 'Tastatură: Ctrl+C/\\/Z')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Handle', 'Tratare')}</p><p>signal(sig, handler)</p><p>SIG_DFL, SIG_IGN, custom func</p><p>{t('Handler signature: void f(int)', 'Semnătură handler: void f(int)')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Block', 'Blocare')}</p><p>sigprocmask(SIG_BLOCK/UNBLOCK/SET)</p><p>sigset_t, sigemptyset, sigaddset</p><p>{t('sigpending — check queued signals', 'sigpending — verificare semnale în coadă')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Wait', 'Așteptare')}</p><p>{t('pause() — any signal', 'pause() — orice semnal')}</p><p>{t('sigsuspend(mask) — atomic, safe', 'sigsuspend(mask) — atomic, sigur')}</p><p>{t('SIGKILL/SIGSTOP: uncatchable!', 'SIGKILL/SIGSTOP: nu pot fi interceptate!')}</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c10-quiz" checked={!!checked['c10-quiz']} onCheck={() => toggleCheck('c10-quiz')}>
                <Toggle question={t('1. What is the difference between a signal and a system call?', '1. Care este diferența dintre un semnal și un apel de sistem?')} answer={t('A system call is a SYNCHRONOUS request from a process to the kernel (the process initiates it). A signal is an ASYNCHRONOUS notification from the kernel (or another process) to a process — it arrives at unpredictable times, interrupting whatever the process is doing.', 'Un apel de sistem este o cerere SINCRONĂ de la un proces la nucleu (procesul o inițiază). Un semnal este o notificare ASINCRONĂ de la nucleu (sau alt proces) la un proces — sosește la momente imprevizibile, întrerupând orice face procesul.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('2. Which two signals can never be caught, ignored, or blocked?', '2. Care două semnale nu pot fi niciodată interceptate, ignorate sau blocate?')} answer={t("SIGKILL (9) and SIGSTOP (19). They are the OS's unconditional controls: SIGKILL always terminates, SIGSTOP always suspends. This ensures the administrator can always stop a runaway process.", 'SIGKILL (9) și SIGSTOP (19). Ele sunt controalele necondiționate ale sistemului de operare: SIGKILL termină întotdeauna, SIGSTOP suspendă întotdeauna. Aceasta garantează că administratorul poate opri oricând un proces scăpat de sub control.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('3. What happens if a signal arrives while its handler is already running?', '3. Ce se întâmplă dacă un semnal sosește în timp ce handler-ul său este deja în execuție?')} answer={t('If the SAME signal arrives again, it is blocked until the current handler finishes (one is queued). If a DIFFERENT signal arrives, it CAN interrupt the current handler (nesting). This is why handlers must be kept short.', 'Dacă același semnal sosește din nou, este blocat până când handler-ul curent termină (unul este pus în coadă). Dacă un semnal DIFERIT sosește, el POATE întrerupe handler-ul curent (imbricare). De aceea handler-ele trebuie menținute scurte.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('4. Why is printf() unsafe inside a signal handler?', '4. De ce printf() este nesigur în interiorul unui handler de semnal?')} answer={t('printf() is NOT async-signal-safe. It uses internal buffers and locks. If the signal interrupts printf() in the main program, calling printf() in the handler can deadlock or corrupt the buffer. Use write() instead, or set a flag.', 'printf() NU este sigur pentru semnale asincrone. Folosește buffere interne și lacăte. Dacă semnalul întrerupe printf() în programul principal, apelarea printf() în handler poate provoca deadlock sau coruperea buffer-ului. Utilizați write() în schimb sau setați un indicator.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('5. What is the difference between blocking and ignoring a signal?', '5. Care este diferența dintre blocarea și ignorarea unui semnal?')} answer={t('Ignoring (SIG_IGN): signal is permanently discarded. Blocking (sigprocmask): signal is QUEUED and delivered when unblocked. Blocking preserves the signal; ignoring loses it.', 'Ignorare (SIG_IGN): semnalul este eliminat permanent. Blocare (sigprocmask): semnalul este PUS ÎN COADĂ și livrat când este deblocat. Blocarea păstrează semnalul; ignorarea îl pierde.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('6. What exit status does a process killed by signal N have?', '6. Ce cod de ieșire are un proces terminat de semnalul N?')} answer={t('128 + N. For example, SIGKILL (9) → exit status 137. SIGSEGV (11) → exit status 139. You can check with WIFSIGNALED and WTERMSIG macros from wait().', '128 + N. De exemplu, SIGKILL (9) → cod de ieșire 137. SIGSEGV (11) → cod de ieșire 139. Puteți verifica cu macro-urile WIFSIGNALED și WTERMSIG din wait().')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('7. Why is sigsuspend() preferred over pause()?', '7. De ce sigsuspend() este preferat față de pause()?')} answer={t('pause() has a race condition: the signal may arrive between sigprocmask(unblock) and pause(), causing pause to block forever. sigsuspend() atomically changes the mask AND suspends, eliminating the race.', 'pause() are o condiție de cursă: semnalul poate sosi între sigprocmask(unblock) și pause(), cauzând blocarea la infinit a lui pause. sigsuspend() schimbă atomic masca ȘI suspendă, eliminând condiția de cursă.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('8. What does kill(pid, 0) do?', '8. Ce face kill(pid, 0)?')} answer={t("It doesn't send any signal. It tests whether the process with the given PID exists and whether you have permission to send it signals. Returns 0 if yes, -1 if not. Useful for checking if a process is alive.", 'Nu trimite niciun semnal. Testează dacă procesul cu PID-ul dat există și dacă aveți permisiunea de a-i trimite semnale. Returnează 0 dacă da, -1 dacă nu. Util pentru a verifica dacă un proces este în viață.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('9. What signal is sent when you write to a pipe with no readers?', '9. Ce semnal este trimis când scrieți pe un canal fără cititori?')} answer={t('SIGPIPE (13). Default action: terminate the process. This connects to Course 9 — it\'s why closing unused pipe ends matters. You can catch SIGPIPE to handle the situation gracefully instead of dying.', 'SIGPIPE (13). Acțiunea implicită: terminarea procesului. Aceasta se leagă de Cursul 9 — de aceea contează închiderea capetelor neutilizate ale canalului. Puteți intercepta SIGPIPE pentru a gestiona situația gracios în loc să terminați.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('10. After exec(), what happens to signal handlers?', '10. După exec(), ce se întâmplă cu handler-ele de semnal?')} answer={t('Custom handlers are RESET to SIG_DFL (because the handler code no longer exists in the new program). Signals set to SIG_IGN remain ignored. The signal mask (blocked signals) is preserved.', 'Handler-ele personalizate sunt RESETATE la SIG_DFL (deoarece codul handler-ului nu mai există în noul program). Semnalele setate la SIG_IGN rămân ignorate. Masca de semnale (semnale blocate) este păstrată.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
              </Section>
    </>
  );
}
