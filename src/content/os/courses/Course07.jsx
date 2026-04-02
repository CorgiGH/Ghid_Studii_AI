import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Course07() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
              <p className="mb-3 text-sm opacity-80">Source: OS(7) - Programare de sistem in C pentru Linux (IV), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Plan:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('The exec concept — process "overlay" (not creation)', 'Conceptul exec — "reacoperirea" procesului (nu crearea)')}</li>
                  <li>{t('The 6+1 exec functions and their differences', 'Cele 6+1 funcții exec și diferențele dintre ele')}</li>
                  <li>{t('What survives exec (PID, fds, etc.) and what doesn\'t', 'Ce supraviețuiește exec (PID, descriptori, etc.) și ce nu')}</li>
                  <li>{t('The fork+exec pattern for running external programs', 'Tiparul fork+exec pentru rularea programelor externe')}</li>
                  <li>{t('Exec with open files — fd inheritance and FD_CLOEXEC', 'Exec cu fișiere deschise — moștenirea descriptorilor și FD_CLOEXEC')}</li>
                  <li>{t('Exec with scripts (shebang interpreter)', 'Exec cu scripturi (interpretorul shebang)')}</li>
                  <li>{t('stdout redirection via dup/dup2 before exec', 'Redirecționarea stdout prin dup/dup2 înainte de exec')}</li>
                  <li>{t('The system() convenience function', 'Funcția de conveniență system()')}</li>
                </ol>
              </Box>

              <Section title={t('1. The exec() Concept', '1. Conceptul exec()')} id="c7-concept" checked={!!checked['c7-concept']} onCheck={() => toggleCheck('c7-concept')}>
                <p><code>fork()</code> {t('creates a new process running the ', 'creează un proces nou care rulează ')}<strong>{t('same', 'același')}</strong>{t(' program. But how do we run a ', ' program. Dar cum rulăm un ')}<strong>{t('different', 'alt')}</strong>{t(' program? Answer: ', ' program? Răspuns: ')} <code>exec()</code> <strong>{t('replaces', 'înlocuiește')}</strong>{t(" the current process's program with a new one.", ' programul procesului curent cu unul nou.')}</p>

                <Box type="definition">
                  <p className="font-bold">{t('Key mental model:', 'Modelul mental esențial:')}</p>
                  <p><code>exec()</code> {t('does NOT create a new process. It ', 'NU creează un proces nou. ')}<strong>{t('overlays', 'Reacoperă')}</strong>{t(' the calling process with a new executable. Same PID, same parent, same open files — but completely new code, data, and stack.', ' procesul apelant cu un nou executabil. Același PID, același părinte, aceleași fișiere deschise — dar cod, date și stivă complet noi.')}</p>
                </Box>

                <svg viewBox="0 0 420 110" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="20" y="20" width="140" height="50" rx="8" fill="#3b82f6" opacity="0.12" stroke="#3b82f6"/>
                  <text x="90" y="40" textAnchor="middle" fill="#3b82f6" fontWeight="bold">{t('Old Program', 'Program vechi')}</text>
                  <text x="90" y="55" textAnchor="middle" fill="currentColor" fontSize="9">code + data + stack</text>
                  <text x="210" y="48" textAnchor="middle" fill="#f59e0b" fontWeight="bold" fontSize="12">exec()</text>
                  <line x1="160" y1="45" x2="250" y2="45" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arr)"/>
                  <rect x="260" y="20" width="140" height="50" rx="8" fill="#10b981" opacity="0.12" stroke="#10b981"/>
                  <text x="330" y="40" textAnchor="middle" fill="#10b981" fontWeight="bold">{t('New Program', 'Program nou')}</text>
                  <text x="330" y="55" textAnchor="middle" fill="currentColor" fontSize="9">code + data + stack</text>
                  <text x="210" y="90" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.6">{t('Same PID, same parent, same open fds', 'Același PID, același părinte, aceiași descriptori deschiși')}</text>
                  <text x="210" y="102" textAnchor="middle" fill="#ef4444" fontSize="9">{t('On success: exec() NEVER returns!', 'La succes: exec() NU returnează niciodată!')}</text>
                </svg>

                <Box type="warning">
                  <p className="font-bold">{t('exec() does not return on success!', 'exec() nu returnează la succes!')}</p>
                  <p>{t("If exec succeeds, the calling program no longer exists — it's been replaced. Any code after exec() only runs if exec ", 'Dacă exec reușește, programul apelant nu mai există — a fost înlocuit. Orice cod după exec() rulează doar dacă exec ')}<strong>{t('failed', 'a eșuat')}</strong>{t(' (returns -1).', ' (returnează -1).')}</p>
                </Box>
              </Section>

              <Section title={t('2. The 6+1 exec Functions', '2. Cele 6+1 funcții exec')} id="c7-family" checked={!!checked['c7-family']} onCheck={() => toggleCheck('c7-family')}>
                <Box type="formula">
                  <p className="font-bold">{t('Naming convention — each letter means something:', 'Convenția de denumire — fiecare literă are o semnificație:')}</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="p-1">{t('Suffix', 'Sufix')}</th><th className="p-1">{t('Meaning', 'Semnificație')}</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">l</td><td className="p-1">{t('args as ', 'argumente ca ')} <strong>{t('l', 'l')}</strong>{t('ist (variadic: arg0, arg1, ..., NULL)', 'istă (variadic: arg0, arg1, ..., NULL)')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">v</td><td className="p-1">{t('args as ', 'argumente ca ')} <strong>{t('v', 'v')}</strong>{t('ector (char* argv[])', 'ector (char* argv[])')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">p</td><td className="p-1">{t('search ', 'caută în ')} <strong>PATH</strong> {t('for executable', 'după executabil')}</td></tr>
                      <tr><td className="p-1 font-mono">e</td><td className="p-1">{t('provide custom ', 'furnizează un ')} <strong>{t('e', 'e')}</strong>{t('nvironment (char* env[])', 'nvironment personalizat (char* env[])')}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('All 7 functions:', 'Toate 7 funcțiile:')}</p>
                  <Code>{`// List-based (variable number of args):
int execl (char* path, char* arg0, ..., NULL);
int execlp(char* file, char* arg0, ..., NULL);      // +PATH
int execle(char* path, char* arg0,..., NULL, env[]); // +env

// Vector-based (argv array):
int execv (char* path, char* argv[]);
int execvp(char* file, char* argv[]);               // +PATH
int execve(char* path, char* argv[], char* env[]);   // +env (THE syscall)
int execvpe(char* file, char* argv[], char* env[]);  // +PATH+env (GNU)`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Important rules:', 'Reguli importante:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><code>arg0</code> / <code>argv[0]</code> = {t('process name (shown by ps), by convention = executable name', 'numele procesului (afișat de ps), prin convenție = numele executabilului')}</li>
                    <li>{t('Last arg in list form, and last element of argv[], must be ', 'Ultimul argument în formă de listă și ultimul element al argv[] trebuie să fie ')} <strong>NULL</strong></li>
                    <li>{t('Without ', 'Fără sufixul ')} <code>p</code> {t('suffix: ', ': ')} <code>path</code> {t('must be full/relative path (not searched in PATH)', 'trebuie să fie cale completă/relativă (nu se caută în PATH)')}</li>
                    <li><code>execve</code> {t('is the actual system call; others are library wrappers', 'este apelul de sistem real; celelalte sunt wrapper-e de bibliotecă')}</li>
                  </ul>
                </Box>

                <p className="font-bold mt-2">{t('Example — execl:', 'Exemplu — execl:')}</p>
                <Code>{`execl("/bin/ls", "ls", "-l", "-i", "/home", NULL);
// If we reach here, exec failed:
perror("exec failed");
exit(127);`}</Code>
              </Section>

              <Section title={t('3. What Survives exec()', '3. Ce supraviețuiește exec()')} id="c7-survives" checked={!!checked['c7-survives']} onCheck={() => toggleCheck('c7-survives')}>
                <Box type="theorem">
                  <p className="font-bold">{t('Preserved after exec:', 'Păstrat după exec:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>{t('PID, PPID, priority', 'PID, PPID, prioritate')}</li>
                    <li>{t('Open file descriptors (unless FD_CLOEXEC is set)', 'Descriptorii de fișiere deschiși (dacă nu este setat FD_CLOEXEC)')}</li>
                    <li>{t('UID/GID (unless setuid/setgid bit is set on new executable)', 'UID/GID (dacă nu este setat bitul setuid/setgid pe noul executabil)')}</li>
                    <li>{t('Working directory, umask, signal masks', 'Directorul de lucru, umask, măști de semnale')}</li>
                  </ul>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('NOT preserved:', 'NU se păstrează:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>{t('Signal handlers', 'Handler-ele de semnale')}</strong> {t('are reset to defaults (the old handler code no longer exists)', 'sunt resetate la implicit (vechiul cod handler nu mai există)')}</li>
                    <li><strong>{t('Memory mappings', 'Mapările de memorie')}</strong> {t('are destroyed', 'sunt distruse')}</li>
                    <li><strong>{t('stdio buffers', 'Buffer-ele stdio')}</strong> {t('are lost! (Call ', 'se pierd! (Apelați ')} <code>fflush(NULL)</code> {t('before exec!)', 'înainte de exec!)')}</li>
                    <li>{t('FDs with ', 'Descriptorii cu ')} <strong>FD_CLOEXEC</strong> {t('(or O_CLOEXEC) are closed', '(sau O_CLOEXEC) sunt închiși')}</li>
                  </ul>
                </Box>
              </Section>

              <Section title={t('4. The fork+exec Pattern', '4. Tiparul fork+exec')} id="c7-forkexec" checked={!!checked['c7-forkexec']} onCheck={() => toggleCheck('c7-forkexec')}>
                <p>{t('The standard way to run an external command from C:', 'Metoda standard de a rula o comandă externă din C:')}</p>

                <Box type="formula">
                  <Code>{`pid_t pid = fork();
if (pid == -1) { perror("fork"); exit(1); }

if (pid == 0) {
    // CHILD: overlay with desired program
    execl("/bin/ls", "ls", "-l", dirname, NULL);
    perror("exec failed");
    exit(10);  // use distinctive code (not 0/1/2)
}

// PARENT: wait and inspect result
int st;
wait(&st);
if (WIFEXITED(st)) {
    switch (WEXITSTATUS(st)) {
        case 0:  printf("ls succeeded\\n"); break;
        case 10: printf("exec itself failed\\n"); break;
        default: printf("ls failed with %d\\n", WEXITSTATUS(st));
    }
} else {
    printf("ls killed by signal %d\\n", WTERMSIG(st));
}`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Why fork before exec?', 'De ce fork înainte de exec?')}</p>
                  <p>{t('Without fork, exec replaces YOUR program — you never get control back. fork first, then exec in the child. The parent survives and can wait for the result. This is exactly how the shell runs every command you type.', 'Fără fork, exec înlocuiește PROGRAMUL DUMNEAVOASTRĂ — nu mai recuperați controlul. Întâi fork, apoi exec în fiu. Părintele supraviețuiește și poate aștepta rezultatul. Exact astfel rulează shell-ul fiecare comandă pe care o tastați.')}</p>
                </Box>
              </Section>

              <Section title={t('5. File Descriptors & Redirection', '5. Descriptori de fișiere și redirecționare')} id="c7-redirect" checked={!!checked['c7-redirect']} onCheck={() => toggleCheck('c7-redirect')}>
                <Box type="formula">
                  <p className="font-bold">{t('dup() and dup2() — duplicate file descriptors:', 'dup() și dup2() — duplicarea descriptorilor de fișiere:')}</p>
                  <Code>{`int dup(int oldfd);            // returns new fd pointing to same file
int dup2(int oldfd, int newfd); // make newfd point where oldfd points

// Redirect stdout to a file BEFORE exec:
int fd = open("output.txt", O_WRONLY|O_CREAT|O_TRUNC, 0644);
dup2(fd, STDOUT_FILENO);  // stdout (fd 1) now goes to output.txt
close(fd);                 // close original fd (stdout still open)
execl("/bin/ls", "ls", "-l", NULL);
// ls writes to output.txt, not the terminal!`}</Code>
                </Box>

                <p className="font-bold mt-2">{t('Example — exec a script:', 'Exemplu — exec cu un script:')}</p>
                <Code>{`// Scripts work too! The kernel reads the shebang:
execl("./my_script.sh", "my_script.sh", "arg1", NULL);
// This actually runs: /bin/bash ./my_script.sh arg1
// (assuming #!/bin/bash is the first line of my_script.sh)`}</Code>

                <Box type="definition">
                  <p className="font-bold">{t('system() — convenience wrapper:', 'system() — wrapper de conveniență:')}</p>
                  <Code>{`#include <stdlib.h>
int ret = system("ls -l /home ; rm -i temp.txt");
// Equivalent to: fork + exec /bin/sh -c "command" + wait
// Simpler but less control than manual fork+exec`}</Code>
                </Box>
              </Section>

              <Section title={t('Cheat Sheet', 'Rezumat rapid')} id="c7-cheat" checked={!!checked['c7-cheat']} onCheck={() => toggleCheck('c7-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">{t('exec naming', 'Denumire exec')}</p><p>{t('l=list, v=vector, p=PATH, e=env', 'l=listă, v=vector, p=PATH, e=env')}</p><p>{t('execve = the actual syscall', 'execve = apelul de sistem real')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Key behavior', 'Comportament cheie')}</p><p>{t('Does NOT create new process', 'NU creează un proces nou')}</p><p>{t('Replaces code+data+stack', 'Înlocuiește cod+date+stivă')}</p><p>{t('Never returns on success (-1 on fail)', 'Nu returnează la succes (-1 la eșec)')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Survives exec', 'Supraviețuiește exec')}</p><p>{t('PID, PPID, open fds, UID/GID', 'PID, PPID, descriptori deschiși, UID/GID')}</p><p>{t('cwd, umask, signal mask', 'cwd, umask, mască de semnale')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Lost at exec', 'Pierdut la exec')}</p><p>{t('Signal handlers (reset to default)', 'Handler-e de semnale (resetate la implicit)')}</p><p>{t('stdio buffers (call fflush first!)', 'Buffer-e stdio (apelați fflush mai întâi!)')}</p><p>{t('FD_CLOEXEC fds, memory maps', 'Descriptori FD_CLOEXEC, mapări de memorie')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Redirection', 'Redirecționare')}</p><p>dup(fd), dup2(old, new)</p><p>{t('Set up before exec in child', 'Configurați înainte de exec în fiu')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Pattern', 'Tipar')}</p><p>{t('fork → child: setup + exec', 'fork → fiu: configurare + exec')}</p><p>{t('parent: wait + inspect status', 'părinte: wait + inspectare status')}</p><p>{t('system("cmd") = fork+exec+wait', 'system("cmd") = fork+exec+wait')}</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c7-quiz" checked={!!checked['c7-quiz']} onCheck={() => toggleCheck('c7-quiz')}>
                <Toggle question={t('1. Does exec() create a new process?', '1. exec() creează un proces nou?')} answer={t('No. exec() REPLACES the current process\'s program image. Same PID, same parent. It is not process creation — that\'s fork(). exec is process transformation.', 'Nu. exec() ÎNLOCUIEȘTE imaginea de program a procesului curent. Același PID, același părinte. Nu este crearea unui proces — aceea este treaba lui fork(). exec este transformarea procesului.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('2. What happens to code written after a successful exec() call?', '2. Ce se întâmplă cu codul scris după un apel exec() reușit?')} answer={t('It never executes. A successful exec() completely replaces the program — there is no return. Code after exec() only runs if exec FAILED (returned -1).', 'Nu se execută niciodată. Un exec() reușit înlocuiește complet programul — nu există returnare. Codul după exec() rulează doar dacă exec A EȘUAT (a returnat -1).')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('3. What do the letters l, v, p, e mean in exec function names?', '3. Ce înseamnă literele l, v, p, e din numele funcțiilor exec?')} answer={t('l = args as list (variadic), v = args as vector (array), p = search PATH for the executable, e = provide custom environment variables. So execlp = list args + PATH search.', 'l = argumente ca listă (variadic), v = argumente ca vector (tablou), p = caută în PATH executabilul, e = furnizează variabile de mediu personalizate. Deci execlp = argumente ca listă + căutare în PATH.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('4. Why must the last argument to execl() be NULL?', '4. De ce trebuie ca ultimul argument al execl() să fie NULL?')} answer={t('The variadic argument list has no inherent length information. NULL serves as the sentinel/terminator so the function knows where the argument list ends. Forgetting NULL causes undefined behavior.', 'Lista de argumente variadic nu are informații despre lungime. NULL servește ca santinelă/terminator pentru ca funcția să știe unde se termină lista de argumente. Uitarea lui NULL cauzează comportament nedefinit.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('5. What happens to stdio buffers when you call exec()?', '5. Ce se întâmplă cu buffer-ele stdio când apelați exec()?')} answer={t('They are LOST. exec replaces all user-space memory. Unflushed fprintf/printf data disappears. Always call fflush(NULL) before exec().', 'Se PIERD. exec înlocuiește toată memoria din spațiul utilizator. Datele fprintf/printf negolite dispar. Apelați întotdeauna fflush(NULL) înainte de exec().')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t("6. How does the shell implement 'ls > output.txt'?", "6. Cum implementează shell-ul 'ls > output.txt'?")} answer={t("fork() → in child: open('output.txt'), dup2(fd, STDOUT_FILENO), close(fd), then exec('ls'). The ls command writes to stdout which now points to the file. Parent waits.", "fork() → în fiu: open('output.txt'), dup2(fd, STDOUT_FILENO), close(fd), apoi exec('ls'). Comanda ls scrie în stdout care acum pointează la fișier. Părintele așteaptă.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('7. What is FD_CLOEXEC and when should you use it?', '7. Ce este FD_CLOEXEC și când ar trebui să îl folosiți?')} answer={t('A flag on a file descriptor that causes it to be automatically closed when exec() is called. Use it on fds that the new program shouldn\'t inherit (e.g., lock files, server sockets). Set via fcntl() or O_CLOEXEC flag in open().', 'Un flag pe un descriptor de fișier care îl face să fie închis automat când se apelează exec(). Utilizați-l pe descriptorii pe care noul program nu ar trebui să îi moștenească (ex: fișiere de blocare, socket-uri server). Setați prin fcntl() sau flag-ul O_CLOEXEC în open().')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('8. What is the difference between execl and execlp?', '8. Care este diferența dintre execl și execlp?')} answer={t("execl requires the full path to the executable (e.g., '/bin/ls'). execlp searches the PATH environment variable, so you can just say 'ls'. Without p, the file must be in the current directory or specified by path.", "execl necesită calea completă spre executabil (ex: '/bin/ls'). execlp caută în variabila de mediu PATH, deci puteți spune doar 'ls'. Fără p, fișierul trebuie să fie în directorul curent sau specificat prin cale.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('9. Why use exit(10) after a failed exec, not exit(1)?', '9. De ce se folosește exit(10) după un exec eșuat, nu exit(1)?')} answer={t("Commands like ls use exit codes 0, 1, 2 for their own purposes. Using a distinctive code like 10 lets the parent distinguish 'exec itself failed' from 'the command ran but returned an error code'.", "Comenzi precum ls folosesc codurile de exit 0, 1, 2 în scopuri proprii. Folosirea unui cod distinctiv ca 10 îi permite părintelui să distingă 'exec-ul în sine a eșuat' de 'comanda a rulat dar a returnat un cod de eroare'.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t("10. What does system('ls -l') do internally?", "10. Ce face system('ls -l') intern?")} answer={<span>{t('It calls ', 'Apelează ')} <code>fork()</code>{t(', then in the child: ', ', apoi în fiu: ')} <code>execl("/bin/sh", "sh", "-c", "ls -l", NULL)</code>{t(', and the parent calls ', ', iar părintele apelează ')} <code>waitpid()</code>. {t('It spawns a shell to parse and execute the command string.', 'Pornește un shell pentru a parsa și executa șirul de comandă.')}</span>} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
              </Section>
    </>
  );
}
