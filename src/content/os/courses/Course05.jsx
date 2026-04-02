import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Course05() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
              <p className="mb-3 text-sm opacity-80">Source: OS(5) - Programare de sistem in C pentru Linux (II), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Plan:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('Concurrent access to files (the problem)', 'Accesul concurent la fișiere (problema)')}</li>
                  <li>{t('Data races on files', 'Data race-uri pe fișiere')}</li>
                  <li>{t('Exclusive access via file locks', 'Acces exclusiv prin blocaje pe fișiere')}</li>
                  <li>{t('The flock structure', 'Structura flock')}</li>
                  <li>{t('fcntl() for locking — F_SETLK, F_SETLKW, F_GETLK', 'fcntl() pentru blocaje — F_SETLK, F_SETLKW, F_GETLK')}</li>
                  <li>{t('Lock types: read (shared/CREW) vs write (exclusive)', 'Tipuri de blocaje: citire (partajat/CREW) vs. scriere (exclusiv)')}</li>
                  <li>{t('Advisory vs mandatory locks', 'Blocaje advisory vs. mandatory')}</li>
                  <li>{t('Optimized locking (minimal lock region & duration)', 'Blocare optimizată (regiune și durată minimă)')}</li>
                  <li>{t('Measuring execution time', 'Măsurarea timpului de execuție')}</li>
                </ol>
              </Box>

              <Section title={t('1. The Concurrent Access Problem', '1. Problema accesului concurent')} id="c5-concur" checked={!!checked['c5-concur']} onCheck={() => toggleCheck('c5-concur')}>
                <p>{t('Linux is ', 'Linux este ')}<strong>{t('multi-tasking', 'multi-tasking')}</strong>{t(': multiple processes can access the same file simultaneously. This is the default and requires no special code.', ': mai multe procese pot accesa același fișier simultan. Acesta este comportamentul implicit și nu necesită cod special.')}</p>

                <Box type="warning">
                  <p className="font-bold">{t('The problem — data races:', 'Problema — data race-uri:')}</p>
                  <p>{t("When two processes read-then-write the same file region concurrently, one process's write can overwrite the other's, causing ", 'Când două procese citesc și apoi scriu în aceeași regiune a unui fișier concurent, scrierea unui proces o poate suprascrie pe a celuilalt, cauzând ')}<strong>{t('data corruption', 'coruperea datelor')}</strong>{t(". The classic pattern: both read '#', both decide to replace it, but only one replacement survives.", ". Tiparul clasic: ambele citesc '#', ambele decid să îl înlocuiască, dar doar o singură înlocuire supraviețuiește.")}</p>
                </Box>

                <svg viewBox="0 0 420 130" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="10" width="100" height="30" rx="5" fill="#3b82f6" opacity="0.15" stroke="#3b82f6"/>
                  <text x="60" y="30" textAnchor="middle" fill="#3b82f6">{t('Process A', 'Proces A')}</text>
                  <rect x="310" y="10" width="100" height="30" rx="5" fill="#ef4444" opacity="0.15" stroke="#ef4444"/>
                  <text x="360" y="30" textAnchor="middle" fill="#ef4444">{t('Process B', 'Proces B')}</text>
                  <rect x="150" y="60" width="120" height="25" rx="4" fill="currentColor" opacity="0.08" stroke="currentColor" opacity="0.3"/>
                  <text x="210" y="77" textAnchor="middle" fill="currentColor" fontSize="9">aaaa#bbbb#cccc</text>
                  <line x1="60" y1="40" x2="185" y2="60" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3"/>
                  <line x1="360" y1="40" x2="235" y2="60" stroke="#ef4444" strokeWidth="1" strokeDasharray="3"/>
                  <text x="80" y="55" fill="#3b82f6" fontSize="8">read '#', sleep, write '1'</text>
                  <text x="280" y="55" fill="#ef4444" fontSize="8">read '#', sleep, write '2'</text>
                  <text x="210" y="110" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.7">{t("Both find same '#' → only one write survives!", "Ambele găsesc același '#' → doar o scriere supraviețuiește!")}</text>
                </svg>

                <p className="font-bold mt-2">{t('Example — launching concurrent access:', 'Exemplu — lansarea accesului concurent:')}</p>
                <Code>{`$ echo -n "aaaa#bbbb#cccc" > fis.dat
$ ./access_v1 1 & ./access_v1 2 &
# Expected: aaaa1bbbb2cccc  or  aaaa2bbbb1cccc
# Actual:   aaaa1bbbb#cccc  or  aaaa2bbbb#cccc  (data race!)`}</Code>
              </Section>

              <Section title={t('2. File Locks with fcntl()', '2. Blocaje pe fișiere cu fcntl()')} id="c5-locks" checked={!!checked['c5-locks']} onCheck={() => toggleCheck('c5-locks')}>
                <Box type="definition">
                  <p className="font-bold">{t('struct flock — describes a lock:', 'struct flock — descrie un blocaj:')}</p>
                  <Code>{`#include <fcntl.h>
struct flock {
    short l_type;    // F_RDLCK, F_WRLCK, F_UNLCK
    short l_whence;  // SEEK_SET, SEEK_CUR, SEEK_END
    long  l_start;   // offset from l_whence
    long  l_len;     // length (0 = until EOF)
    int   l_pid;     // PID of lock owner (set by kernel)
};`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('fcntl() for locking:', 'fcntl() pentru blocaje:')}</p>
                  <Code>{`int fcntl(int fd, int cmd, struct flock* lock);

// cmd options:
// F_SETLK  — try to set lock, return -1 immediately if conflict
// F_SETLKW — try to set lock, BLOCK (wait) until possible
// F_GETLK  — query: is this lock possible? (fills lock->l_pid)

// Example: lock entire file for writing
struct flock fl;
fl.l_type = F_WRLCK;
fl.l_whence = SEEK_SET;
fl.l_start = 0;
fl.l_len = 0;  // 0 = lock to end of file

if (fcntl(fd, F_SETLKW, &fl) == -1)
    perror("lock failed");

// ... do exclusive work ...

// Unlock:
fl.l_type = F_UNLCK;
fcntl(fd, F_SETLK, &fl);`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Lock types — CREW semantics:', 'Tipuri de blocaje — semantica CREW:')}</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="text-left p-1">{t('Existing lock', 'Blocaj existent')}</th><th className="text-left p-1">{t('New F_RDLCK?', 'Nou F_RDLCK?')}</th><th className="text-left p-1">{t('New F_WRLCK?', 'Nou F_WRLCK?')}</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">{t('None', 'Niciunul')}</td><td className="p-1 text-green-500">{t('Allowed', 'Permis')}</td><td className="p-1 text-green-500">{t('Allowed', 'Permis')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">{t('F_RDLCK (read)', 'F_RDLCK (citire)')}</td><td className="p-1 text-green-500">{t('Allowed (shared)', 'Permis (partajat)')}</td><td className="p-1 text-red-500">{t('Blocked', 'Blocat')}</td></tr>
                      <tr><td className="p-1">{t('F_WRLCK (write)', 'F_WRLCK (scriere)')}</td><td className="p-1 text-red-500">{t('Blocked', 'Blocat')}</td><td className="p-1 text-red-500">{t('Blocked', 'Blocat')}</td></tr>
                    </tbody>
                  </table>
                  <p className="text-sm mt-1"><strong>CREW</strong> = {t('Concurrent Read or Exclusive Write. Multiple readers OR one writer, never both.', 'Citire Concurentă sau Scriere Exclusivă. Mai mulți cititori SAU un singur scriitor, niciodată ambii.')}</p>
                </Box>
              </Section>

              <Section title={t('3. Advisory Nature of Locks', '3. Caracterul advisory al blocajelor')} id="c5-advisory" checked={!!checked['c5-advisory']} onCheck={() => toggleCheck('c5-advisory')}>
                <Box type="warning">
                  <p className="font-bold">{t('Locks are ADVISORY, not mandatory!', 'Blocajele sunt ADVISORY, nu mandatory!')}</p>
                  <p>{t('A lock only works if ', 'Un blocaj funcționează doar dacă ')}<strong>{t('all cooperating processes', 'toate procesele cooperante')}</strong>{t(' agree to check for locks before accessing the file. A process that simply calls ', ' sunt de acord să verifice blocajele înainte de a accesa fișierul. Un proces care pur și simplu apelează ')} <code>write()</code> {t('without checking locks will ', 'fără a verifica blocajele va ')}<strong>{t('succeed', 'reuși')}</strong>{t(' even if another process holds a write lock.', ' chiar dacă un alt proces deține un blocaj de scriere.')}</p>
                </Box>

                <p className="font-bold mt-2">{t('Proof by example:', 'Dovadă prin exemplu:')}</p>
                <Code>{`$ echo -n "aaaa#bbbb#cccc" > fis.dat
$ ./access_v2 1 &          # This process uses locks
$ sleep 2; echo "xyxyxy" > fis.dat   # This does NOT use locks
# Result: "xyxy1y" — the echo overwrote despite the lock!`}</Code>

                <Box type="theorem">
                  <p className="font-bold">{t('Lock characteristics:', 'Caracteristici ale blocajelor:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>{t('Locks are ', 'Blocajele sunt ')}<strong>{t('auto-released', 'eliberate automat')}</strong>{t(' when process closes fd or terminates', ' când procesul închide descriptorul sau se termină')}</li>
                    <li>{t('Locks are ', 'Blocajele ')}<strong>{t('NOT inherited', 'NU se moștenesc')}</strong>{t(' by child processes after fork()', ' de procesele fii după fork()')}</li>
                    <li>{t('Unlocking a segment of a larger lock can split it into two locks', 'Deblocarea unui segment dintr-un blocaj mai mare îl poate împărți în două blocaje')}</li>
                    <li>{t('Must open fd with matching mode: read lock needs O_RDONLY or O_RDWR', 'Descriptorul trebuie deschis cu modul corespunzător: blocajul de citire necesită O_RDONLY sau O_RDWR')}</li>
                  </ul>
                </Box>
              </Section>

              <Section title={t('4. Optimized Locking', '4. Blocare optimizată')} id="c5-optim" checked={!!checked['c5-optim']} onCheck={() => toggleCheck('c5-optim')}>
                <p>{t('Locking the ', 'Blocarea ')}<strong>{t('entire file for the entire duration', 'întregului fișier pe toată durata')}</strong>{t(' serializes access — processes run one-after-another, defeating concurrency.', ' serializează accesul — procesele rulează unul după altul, eliminând concurența.')}</p>

                <Box type="theorem">
                  <p className="font-bold">{t('Optimization principles:', 'Principii de optimizare:')}</p>
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>{t('Minimize lock region', 'Minimizați regiunea blocată')}</strong>{t(": lock only the specific byte(s) you're modifying, not the whole file", ': blocați doar octetul/octeții specifici pe care îi modificați, nu întreg fișierul')}</li>
                    <li><strong>{t('Minimize lock duration', 'Minimizați durata blocajului')}</strong>{t(': acquire lock just before write, release immediately after', ': achiziționați blocajul imediat înainte de scriere, eliberați imediat după')}</li>
                    <li><strong>{t('Re-validate after acquiring lock', 'Revalidați după achiziționarea blocajului')}</strong>{t(': the data may have changed between your read and lock acquisition (TOCTOU race)', ': datele pot fi modificate între citire și achiziționarea blocajului (cursă TOCTOU)')}</li>
                  </ol>
                </Box>

                <p className="font-bold mt-2">{t('Example — lock one byte, re-validate:', 'Exemplu — blocați un octet, revalidați:')}</p>
                <Code>{`// Find first '#' in file, lock it, verify it's still '#', then replace
while (read(fd, &c, 1) == 1) {
    if (c == '#') {
        long pos = lseek(fd, -1, SEEK_CUR);
        // Lock just this one byte:
        fl.l_start = pos; fl.l_len = 1;
        fl.l_type = F_WRLCK;
        fcntl(fd, F_SETLKW, &fl);  // wait for lock

        // RE-READ to verify still '#' (another process may have changed it!)
        lseek(fd, pos, SEEK_SET);
        read(fd, &c, 1);
        if (c != '#') { /* unlock and continue searching */ }
        else { /* write replacement and unlock */ }
    }
}`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t("Trap — TOCTOU (Time-of-check to time-of-use):", "Capcană — TOCTOU (Timp de verificare vs. timp de utilizare):")}</p>
                  <p>{t("Between reading '#' and acquiring the lock, another process may have already replaced it. You MUST re-read after locking. Forgetting this is a classic concurrency bug.", "Între citirea '#' și achiziționarea blocajului, un alt proces poate deja să îl fi înlocuit. TREBUIE să recitiți după blocare. Uitarea acestui pas este un bug clasic de concurență.")}</p>
                </Box>
              </Section>

              <Section title={t('5. Measuring Execution Time', '5. Măsurarea timpului de execuție')} id="c5-time" checked={!!checked['c5-time']} onCheck={() => toggleCheck('c5-time')}>
                <Box type="formula">
                  <p className="font-bold">{t('Methods:', 'Metode:')}</p>
                  <Code>{`# Shell level:
$ time ./program           # real/user/sys times
$ /usr/bin/time ./program  # detailed stats

// C level:
#include <sys/time.h>
struct timeval tv;
gettimeofday(&tv, NULL);  // microsecond precision

#include <time.h>
struct timespec ts;
clock_gettime(CLOCK_REALTIME, &ts); // nanosecond precision`}</Code>
                </Box>
              </Section>

              <Section title={t('Cheat Sheet', 'Rezumat rapid')} id="c5-cheat" checked={!!checked['c5-cheat']} onCheck={() => toggleCheck('c5-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">{t('Lock types', 'Tipuri de blocaje')}</p><p>F_RDLCK ({t('shared read', 'citire partajată')})</p><p>F_WRLCK ({t('exclusive write', 'scriere exclusivă')})</p><p>F_UNLCK ({t('release', 'eliberare')})</p></Box>
                  <Box type="formula"><p className="font-bold">{t('fcntl commands', 'Comenzi fcntl')}</p><p>F_SETLK ({t('non-blocking', 'neblocant')})</p><p>F_SETLKW ({t('blocking/wait', 'blocant/așteptare')})</p><p>F_GETLK ({t('query', 'interogare')})</p></Box>
                  <Box type="formula"><p className="font-bold">{t('CREW rule', 'Regula CREW')}</p><p>{t('Multiple readers OR one writer', 'Mai mulți cititori SAU un scriitor')}</p><p>{t('Never both simultaneously', 'Niciodată ambii simultan')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Key facts', 'Fapte cheie')}</p><p>{t('Advisory (not mandatory)', 'Advisory (nu mandatory)')}</p><p>{t('Not inherited by fork()', 'Nu se moștenesc prin fork()')}</p><p>{t('Auto-released on close/exit', 'Eliberate automat la close/exit')}</p><p>{t('Re-validate after acquire!', 'Revalidați după achiziționare!')}</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c5-quiz" checked={!!checked['c5-quiz']} onCheck={() => toggleCheck('c5-quiz')}>
                <Toggle question={t('1. What is a data race on a file?', '1. Ce este un data race pe un fișier?')} answer={t('When two or more processes read-then-write the same region of a file concurrently, and the result depends on the unpredictable timing of their operations. One process\'s write can be overwritten or lost.', 'Când două sau mai multe procese citesc și apoi scriu în aceeași regiune a unui fișier concurent, iar rezultatul depinde de temporizarea impredictibilă a operațiilor lor. Scrierea unui proces poate fi suprascrisă sau pierdută.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('2. What does F_SETLKW do differently from F_SETLK?', '2. Ce face F_SETLKW diferit față de F_SETLK?')} answer={t('F_SETLKW is BLOCKING: if the lock conflicts with an existing lock, the call waits (blocks) until the lock becomes available. F_SETLK is non-blocking: it returns -1 immediately with errno = EACCES or EAGAIN.', 'F_SETLKW este BLOCANT: dacă blocajul intră în conflict cu unul existent, apelul așteaptă (blochează) până când blocajul devine disponibil. F_SETLK este neblocant: returnează -1 imediat cu errno = EACCES sau EAGAIN.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('3. Can a read lock and a write lock coexist on the same region?', '3. Pot coexista un blocaj de citire și unul de scriere pe aceeași regiune?')} answer={t('No. A write lock (F_WRLCK) is exclusive — it conflicts with both read and write locks. Multiple read locks CAN coexist (they are shared). This is CREW semantics.', 'Nu. Un blocaj de scriere (F_WRLCK) este exclusiv — intră în conflict atât cu blocajele de citire, cât și cu cele de scriere. Mai multe blocaje de citire POT coexista (sunt partajate). Aceasta este semantica CREW.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('4. What happens if process A holds a write lock and process B does a plain write() without locking?', '4. Ce se întâmplă dacă procesul A deține un blocaj de scriere și procesul B face un write() simplu fără blocare?')} answer={t("Process B's write SUCCEEDS! Locks are advisory — the kernel does not enforce them on processes that don't check. All cooperating processes must use locks for them to work.", 'Scrierea procesului B REUȘEȘTE! Blocajele sunt advisory — nucleul nu le impune proceselor care nu le verifică. Toate procesele cooperante trebuie să folosească blocaje pentru ca acestea să funcționeze.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('5. Are locks inherited by child processes after fork()?', '5. Blocajele se moștenesc de procesele fii după fork()?')} answer={t("No. Each lock has the creator's PID stored in l_pid. Child processes have different PIDs and do not inherit the parent's locks.", 'Nu. Fiecare blocaj are PID-ul creatorului stocat în l_pid. Procesele fii au PID-uri diferite și nu moștenesc blocajele părintelui.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('6. What is the TOCTOU problem with file locking?', '6. Ce este problema TOCTOU la blocarea fișierelor?')} answer={t('Time-of-check to time-of-use: you read data, decide to modify it, then acquire a lock — but between the read and the lock, another process may have already changed the data. Solution: re-read after acquiring the lock.', 'Timp de verificare vs. timp de utilizare: citiți datele, decideți să le modificați, apoi achiziționați un blocaj — dar între citire și blocare, un alt proces poate deja fi modificat datele. Soluție: recitiți după achiziționarea blocajului.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('7. How do you lock just one byte at position 100?', '7. Cum blocați un singur octet la poziția 100?')} answer={<span>{t('Set ', 'Setați ')} <code>l_whence=SEEK_SET, l_start=100, l_len=1</code> {t('in the flock struct, then call', 'în structura flock, apoi apelați')} <code>fcntl(fd, F_SETLKW, &fl)</code>.</span>} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('8. What does l_len=0 mean in a flock struct?', '8. Ce înseamnă l_len=0 într-o structură flock?')} answer={t("It means lock from l_start to the END OF FILE, including any bytes that may be appended later. It's a common idiom for locking the entire file.", 'Înseamnă blocarea de la l_start până la SFÂRȘITUL FIȘIERULUI, inclusiv octeții care pot fi adăugați ulterior. Este un idiom comun pentru blocarea întregului fișier.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('9. Why is locking the entire file for the entire duration suboptimal?', '9. De ce este suboptimă blocarea întregului fișier pe toată durata?')} answer={t('It serializes all access — processes run one after another, completely eliminating concurrency. Better to lock only the specific region being modified, for the minimum time needed.', 'Serializează tot accesul — procesele rulează unul după altul, eliminând complet concurența. Mai bine să blocați doar regiunea specifică modificată, pentru durata minimă necesară.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('10. How do you check if a lock exists without actually locking?', '10. Cum verificați dacă există un blocaj fără a bloca efectiv?')} answer={<span>{t('Use ', 'Utilizați ')} <code>fcntl(fd, F_GETLK, &fl)</code>. {t('If a conflicting lock exists, the struct is filled with info about it (including l_pid of the holder). If no conflict, l_type is set to F_UNLCK.', 'Dacă există un blocaj conflictual, structura este completată cu informații despre el (inclusiv l_pid al deținătorului). Dacă nu există conflict, l_type este setat la F_UNLCK.')}</span>} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
              </Section>
    </>
  );
}
