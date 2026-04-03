import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Seminar02() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-3 text-sm opacity-80">{t('Source: OS Lab #2 - Simple commands (part 2), Chained commands & Shell scripts, Cristian Vidrascu, UAIC', 'Sursa: SO Laborator #2 - Comenzi simple (partea 2), Comenzi inlantuite & Scripturi shell, Cristian Vidrascu, UAIC')}</p>

      {/* Roadmap */}
      <Box type="definition">
        <p className="font-bold mb-2">{t('Week 2 Topics', 'Subiectele saptamanii 2')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>{t('Simple commands review: user info (id, groups, who, w, finger, last)', 'Recapitulare comenzi simple: informatii utilizator (id, groups, who, w, finger, last)')}</li>
          <li>{t('Simple commands review: running programs (ps, pstree, top, jobs)', 'Recapitulare comenzi simple: programe in executie (ps, pstree, top, jobs)')}</li>
          <li>{t('Simple commands review: system info (date, cal, uptime, hostname, uname)', 'Recapitulare comenzi simple: informatii sistem (date, cal, uptime, hostname, uname)')}</li>
          <li>{t('Chained commands: pipelines (|), sequential (;), conditional (&& ||)', 'Comenzi inlantuite: pipeline-uri (|), secventiale (;), conditionale (&& ||)')}</li>
          <li>{t('Solved examples with pipelines: cut, grep, sort, uniq, wc, tr, head, tail', 'Exemple rezolvate cu pipeline-uri: cut, grep, sort, uniq, wc, tr, head, tail')}</li>
          <li>{t('Regular expressions basics for grep', 'Bazele expresiilor regulate pentru grep')}</li>
        </ul>
      </Box>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  PART I — Simple Commands (cont.)                     */}
      {/* ══════════════════════════════════════════════════════ */}
      <h3 className="text-lg font-bold mt-6 mb-3">{t('I) Simple Commands — Part 2 (Solved Examples)', 'I) Comenzi simple — Partea 2 (Exemple rezolvate)')}</h3>

      {/* ── Exercise 1: User info ── */}
      <Section title={t('1. User Information Commands (id, groups)', '1. Comenzi de informare despre utilizatori (id, groups)')} id="s2-userinfo" checked={!!checked['s2-userinfo']} onCheck={() => toggleCheck('s2-userinfo')}>
        <p>{t(
          'Write the command to display information about a user account on the system: numeric ID, groups the user belongs to.',
          'Scrieti comanda care afiseaza informatii despre un cont de utilizator de pe sistem: ID-ul numeric, grupurile din care face parte.'
        )}</p>

        <p className="font-bold mt-3">{t('i) id — display user identity:', 'i) id — afisarea identitatii utilizatorului:')}</p>
        <Code>{`$ id username
uid=1000(username) gid=1000(username) groups=1000(username),27(sudo)`}</Code>
        <p className="text-sm mt-1">{t(
          'Shows UID, primary GID, and all group memberships for the specified user.',
          'Afiseaza UID-ul, GID-ul primar si toate apartenentele la grupuri pentru utilizatorul specificat.'
        )}</p>

        <p className="font-bold mt-3">{t('ii) groups — list group memberships:', 'ii) groups — afisarea grupurilor:')}</p>
        <Code>{`$ groups username
username : username sudo`}</Code>
      </Section>

      {/* ── Exercise 2: Connected users ── */}
      <Section title={t('2. Connected Users (users, who, w, finger, last)', '2. Utilizatori conectati (users, who, w, finger, last)')} id="s2-connected" checked={!!checked['s2-connected']} onCheck={() => toggleCheck('s2-connected')}>
        <p>{t(
          'Write commands to display information about users who have open work sessions on the system.',
          'Scrieti comenzile care afiseaza informatii despre utilizatorii care au sesiuni de lucru deschise pe sistem.'
        )}</p>

        <p className="font-bold mt-3">{t('i) users — simple list of connected usernames:', 'i) users — lista simpla de utilizatori conectati:')}</p>
        <Code>{`$ users
adrian.erhan alexandra.ursu alin.gavriliu so stefan.nistor`}</Code>
        <p className="text-sm mt-1">{t('May contain duplicates if a user has multiple sessions open.', 'Poate contine duplicate daca un utilizator are mai multe sesiuni deschise.')}</p>

        <p className="font-bold mt-3">{t('ii) who — usernames + terminal + login time + IP:', 'ii) who — utilizator + terminal + ora login + IP:')}</p>
        <Code>{`$ who
ioan.samson   pts/0   2021-02-26 11:51 (86.124.182.132)
irina.burada  pts/1   2021-02-26 12:01 (79.112.255.165)
...`}</Code>

        <p className="font-bold mt-3">{t('iii) w — like who but with idle time and current command:', 'iii) w — ca who dar cu timp inactiv si comanda curenta:')}</p>
        <Code>{`$ w
 13:14:55 up 17 days, 23 users
USER     TTY      FROM             LOGIN@  IDLE  WHAT
ioan.sam pts/0    86.124.182.132   11:51   1:17  -bash
andra.an pts/5    79.112.126.191   13:10   16s   mcedit file1.txt`}</Code>
        <Box type="warning">
          <p className="text-sm">{t(
            'Note: the first column (USER) is truncated to 8 characters by default. Use PROCPS_USERLEN=20 to increase it.',
            'Nota: prima coloana (USER) este trunchiata la 8 caractere implicit. Folositi PROCPS_USERLEN=20 pentru a o mari.'
          )}</p>
        </Box>

        <p className="font-bold mt-3">{t('iv) finger — sorted list with real name and idle time:', 'iv) finger — lista sortata cu nume real si timp inactiv:')}</p>
        <Code>{`$ finger
Login             Name           Tty   Idle  Login Time   Office
adrian.erhan                     pts/6   17  Feb 26 12:12 (188.138.192.80)
alexandra.ursu                   pts/17  22  Feb 26 12:50 (79.112.34.200)
...`}</Code>

        <p className="font-bold mt-3">{t('v) last — session history (from /var/log/wtmp):', 'v) last — istoricul sesiunilor (din /var/log/wtmp):')}</p>
        <Code>{`$ last so
so  pts/23  79.112.83.231  Fri Feb 26 11:19   still logged in
so  pts/27  79.112.86.169  Thu Feb 25 12:14 - 13:37  (01:23)
...
wtmp begins Mon Feb  1 07:14:02 2021`}</Code>
      </Section>

      {/* ── Exercise 3: Running programs ── */}
      <Section title={t('3. Running Programs (ps, pstree, top)', '3. Programe in executie (ps, pstree, top)')} id="s2-procs" checked={!!checked['s2-procs']} onCheck={() => toggleCheck('s2-procs')}>
        <p>{t(
          'Write commands to display information about programs running on the system.',
          'Scrieti comenzile care afiseaza informatii despre programele care ruleaza pe sistem.'
        )}</p>

        <p className="font-bold mt-3">{t('i) pstree — process tree:', 'i) pstree — arborele de procese:')}</p>
        <Code>{`$ pstree            # full process tree from init (PID 1)
$ pstree username   # subtrees owned by a specific user
$ pstree PID        # subtree rooted at a specific PID`}</Code>

        <p className="font-bold mt-3">{t('ii) ps — process list with many options:', 'ii) ps — lista de procese cu multe optiuni:')}</p>
        <Code>{`$ ps              # only current user, current session
$ ps u            # current user, all sessions, with owner column
$ ps x            # current user, including non-interactive processes
$ ps a            # all users
$ ps aux          # all users, all processes, verbose format`}</Code>

        <Toggle
          question={t('ps selection and formatting options', 'Optiuni de selectie si formatare ps')}
          answer={
            <div>
              <p className="font-bold text-sm">{t('Selection options:', 'Optiuni de selectie:')}</p>
              <Code>{`ps -C cmd-list       # select by command name
ps --ppid pid-list   # select by parent PID
ps -U user-list      # select by real user
ps -u user-list      # select by effective user
ps -L                # show threads too`}</Code>
              <p className="font-bold text-sm mt-2">{t('Formatting options:', 'Optiuni de formatare:')}</p>
              <Code>{`ps -f                # full format (more columns)
ps -F                # extra full format
ps -o pid,user,args  # custom columns
ps -o pid,args --forest  # ASCII art process tree`}</Code>
            </div>
          }
          showLabel={t('Show details', 'Arata detalii')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <p className="font-bold mt-3">{t('iii) top / htop — real-time interactive view:', 'iii) top / htop — vizualizare interactiva in timp real:')}</p>
        <Code>{`$ top     # press 'h' for help, 'q' to quit
$ htop    # similar, with a nicer interface`}</Code>

        <p className="font-bold mt-3">{t('iv) jobs, fg, bg — background process control:', 'iv) jobs, fg, bg — controlul proceselor din fundal:')}</p>
        <Code>{`$ jobs    # list background processes started from current shell
$ fg %1   # bring job #1 to foreground
$ bg %1   # resume job #1 in background`}</Code>
      </Section>

      {/* ── Exercise 4: System info ── */}
      <Section title={t('4. System Information (date, cal, uptime, hostname, uname)', '4. Informatii despre sistem (date, cal, uptime, hostname, uname)')} id="s2-sysinfo" checked={!!checked['s2-sysinfo']} onCheck={() => toggleCheck('s2-sysinfo')}>

        <p className="font-bold mt-2">{t('i) date, cal — date, time and calendar:', 'i) date, cal — data, ora si calendar:')}</p>
        <Code>{`$ date
Sun Feb 27 15:51:08 EET 2022
$ cal           # current month
$ cal -3 -m     # 3-month view, weeks start on Monday (CentOS)
$ ncal -3 -M    # equivalent on Debian/Ubuntu
$ cal -y        # entire year`}</Code>

        <p className="font-bold mt-3">{t('ii) uptime — system uptime:', 'ii) uptime — timp de functionare:')}</p>
        <Code>{`$ uptime -p
up 2 weeks, 4 days, 22 hours, 46 minutes
$ uptime -s
2022-02-08 17:46:23
$ uptime
 16:40:51 up 18 days, 22:54,  4 users,  load average: 0.06, 0.05, 0.05`}</Code>

        <p className="font-bold mt-3">{t('iii) hostname — system name:', 'iii) hostname — numele sistemului:')}</p>
        <Code>{`$ hostname -f          # FQDN
students.info.uaic.ro
$ hostname -I          # IP addresses
85.122.23.32
$ hostnamectl          # detailed system info`}</Code>

        <p className="font-bold mt-3">{t('iv) uname — kernel information:', 'iv) uname — informatii nucleu:')}</p>
        <Code>{`$ uname -a
Linux students.info.uaic.ro 3.10.0-1160.42.2.el7.x86_64 ... GNU/Linux`}</Code>

        <p className="font-bold mt-3">{t('v) Linux distribution info:', 'v) Informatii distributie Linux:')}</p>
        <Code>{`$ lsb_release -a       # Debian-based systems
$ cat /etc/os-release  # works on all distributions`}</Code>
      </Section>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  PART II — Chained Commands (Solved Examples)         */}
      {/* ══════════════════════════════════════════════════════ */}
      <h3 className="text-lg font-bold mt-8 mb-3">{t('II) Chained Commands — Solved Examples', 'II) Comenzi inlantuite — Exemple rezolvate')}</h3>

      <Box type="definition">
        <p className="text-sm">{t(
          'Chained commands process data by connecting the output (stdout) of one command to the input (stdin) of the next using the pipe operator (|). Data sources can be static (files like /etc/passwd) or dynamic (output of commands like who or ps).',
          'Comenzile inlantuite prelucreaza date conectand iesirea (stdout) unei comenzi la intrarea (stdin) urmatoarei cu operatorul pipe (|). Sursele de date pot fi statice (fisiere ca /etc/passwd) sau dinamice (output-ul unor comenzi ca who sau ps).'
        )}</p>
      </Box>

      {/* ── Exercise 5: Login shells ── */}
      <Section title={t('5. Login Shells — unique login shells from /etc/passwd', '5. Shell-uri de login — shell-urile unice din /etc/passwd')} id="s2-shells" checked={!!checked['s2-shells']} onCheck={() => toggleCheck('s2-shells')}>
        <p>{t(
          'Write a chained command that displays (uniquely) all login shells used by the system\'s users.',
          'Scrieti comanda inlantuita care afiseaza (in mod unic) toate shell-urile de login folosite de utilizatorii sistemului.'
        )}</p>

        <Toggle
          question={t('Solution', 'Solutie')}
          answer={
            <div>
              <Code>{`$ cut -f7 -d: /etc/passwd | sort -u`}</Code>
              <p className="text-sm mt-2">{t(
                'cut extracts field 7 (login shell) using ":" as delimiter, then sort -u removes duplicates. Alternative: pipe through sort | uniq instead of sort -u.',
                'cut extrage campul 7 (shell de login) folosind ":" ca delimitator, apoi sort -u elimina duplicatele. Alternativa: pipe prin sort | uniq in loc de sort -u.'
              )}</p>
              <Code>{`# Alternative:
$ cut -f7 -d: /etc/passwd | sort | uniq`}</Code>
              <p className="text-sm mt-2">{t(
                'To count how many users use each shell, add -c to uniq:',
                'Pentru a numara cati utilizatori folosesc fiecare shell, adaugati -c la uniq:'
              )}</p>
              <Code>{`$ cut -f7 -d: /etc/passwd | sort | uniq -c`}</Code>
            </div>
          }
          showLabel={t('Show Solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Toggle
          question={t('Advanced: Changing your login shell', 'Avansat: Schimbarea shell-ului de login')}
          answer={
            <div>
              <p className="text-sm">{t(
                'Use chsh to change your login shell. Valid shells are listed in /etc/shells. To find all installed shells:',
                'Folositi chsh pentru a schimba shell-ul de login. Shell-urile valide sunt listate in /etc/shells. Pentru a gasi toate shell-urile instalate:'
              )}</p>
              <Code>{`$ cat /etc/shells
$ find /bin /usr/bin -name "*sh"`}</Code>
            </div>
          }
          showLabel={t('Show details', 'Arata detalii')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── Exercise 6: Human users ── */}
      <Section title={t('6. Human Users — count human user accounts', '6. Utilizatori umani — numararea conturilor de utilizatori umani')} id="s2-human" checked={!!checked['s2-human']} onCheck={() => toggleCheck('s2-human')}>
        <p>{t(
          'Write a chained command that calculates how many human user accounts exist on the system. Additional requirement: filter out system accounts (those that don\'t have an interactive shell like /bin/bash).',
          'Scrieti comanda inlantuita care calculeaza cate conturi de utilizatori (umani) exista in sistem. Cerinta suplimentara: filtrati conturile de sistem (cele care nu au un shell interactiv precum /bin/bash).'
        )}</p>

        <Toggle
          question={t('Solution', 'Solutie')}
          answer={
            <div>
              <p className="text-sm font-bold">{t('Count accounts with /bin/bash as login shell:', 'Numararea conturilor cu /bin/bash ca shell de login:')}</p>
              <Code>{`$ grep /bin/bash /etc/passwd | wc -l
# Or with a single command:
$ grep -c /bin/bash /etc/passwd`}</Code>
              <p className="text-sm mt-2 font-bold">{t('Count system (non-interactive) accounts:', 'Numararea conturilor de sistem (non-interactive):')}</p>
              <Code>{`$ grep -v /bin/bash /etc/passwd | wc -l
# Or:
$ grep -v /bin/bash /etc/passwd -c`}</Code>
              <p className="text-sm mt-2">{t(
                'For a complete solution covering multiple shells (bash, sh, zsh):',
                'Pentru o solutie completa care acopera mai multe shell-uri (bash, sh, zsh):'
              )}</p>
              <Code>{`$ grep -E "/bin/bash|/bin/sh|/bin/zsh" /etc/passwd -c`}</Code>
            </div>
          }
          showLabel={t('Show Solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── Exercise 7: How many Anna ── */}
      <Section title={t('7. How Many Anna? — filtering with grep -v', '7. Cate Ana? — filtrare cu grep -v')} id="s2-anna" checked={!!checked['s2-anna']} onCheck={() => toggleCheck('s2-anna')}>
        <p>{t(
          'Write a chained command that displays how many system users contain "ana" in their username, but NOT in the context of "diana".',
          'Scrieti comanda inlantuita care afiseaza cati utilizatori ai sistemului contin "ana" in numele de cont, dar NU in contextul "diana".'
        )}</p>

        <Toggle
          question={t('Solution (step by step)', 'Solutie (pas cu pas)')}
          answer={
            <div>
              <p className="text-sm">{t('Step 1: Extract usernames', 'Pasul 1: Extrageti numele de utilizator')}</p>
              <Code>{`$ cut -d: -f1 /etc/passwd`}</Code>
              <p className="text-sm mt-2">{t('Step 2: Select lines containing "ana"', 'Pasul 2: Selectati liniile ce contin "ana"')}</p>
              <Code>{`$ cut -d: -f1 /etc/passwd | grep ana`}</Code>
              <p className="text-sm mt-2">{t('Step 3: Remove lines containing "diana"', 'Pasul 3: Eliminati liniile ce contin "diana"')}</p>
              <Code>{`$ cut -d: -f1 /etc/passwd | grep ana | grep -v diana`}</Code>
              <p className="text-sm mt-2">{t('Step 4: Count the result', 'Pasul 4: Numarati rezultatul')}</p>
              <Code>{`$ cut -d: -f1 /etc/passwd | grep ana | grep -v diana | wc -l
# Or:
$ cut -d: -f1 /etc/passwd | grep ana | grep -v diana -c`}</Code>
              <Box type="warning">
                <p className="text-sm">{t(
                  'Note: reversing the grep order (grep -v diana first, then grep ana) also works but is less efficient because more data passes through the pipeline.',
                  'Nota: inversarea ordinii grep (grep -v diana mai intai, apoi grep ana) functioneaza dar este mai putin eficienta deoarece mai multe date trec prin pipeline.'
                )}</p>
              </Box>
            </div>
          }
          showLabel={t('Show Solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── Exercise 8: Puzzle pipeline ── */}
      <Section title={t('8. Puzzle Pipeline #1 — arrange commands in correct order', '8. Puzzle Pipeline #1 — aranjati comenzile in ordinea corecta')} id="s2-puzzle1" checked={!!checked['s2-puzzle1']} onCheck={() => toggleCheck('s2-puzzle1')}>
        <p>{t(
          'Specify the correct chaining order for these 4 commands so the pipeline displays the 3 most recently modified files in the current directory, sorted descending by file size in bytes:',
          'Specificati ordinea corecta de inlantuire a celor 4 comenzi de mai jos, astfel incat pipeline-ul sa afiseze cele 3 fisiere modificate cel mai recent din directorul curent, sortate descrescator dupa dimensiunea in octeti:'
        )}</p>
        <ol className="list-decimal pl-5 text-sm space-y-1 mt-2 mb-3">
          <li><code>sort -t: -k3 -n -r</code></li>
          <li><code>head -n 3</code></li>
          <li><code>find . -type f -printf "%p:%s:%T@\n"</code></li>
          <li><code>sort -r -n -k2 -t:</code></li>
        </ol>

        <Toggle
          question={t('Solution with reasoning', 'Solutie cu rationament')}
          answer={
            <div>
              <p className="text-sm">{t(
                'Logical reasoning: (1) find is the data source -> first. (2) sort by modification date (field 3) -> second. (3) head selects top 3 -> third. (4) sort by size (field 2) -> last.',
                'Rationament logic: (1) find este sursa de date -> prima. (2) sortare dupa data modificarii (campul 3) -> a doua. (3) head selecteaza primele 3 -> a treia. (4) sortare dupa dimensiune (campul 2) -> ultima.'
              )}</p>
              <p className="text-sm mt-2 font-bold">{t('Correct order: 3, 1, 2, 4', 'Ordinea corecta: 3, 1, 2, 4')}</p>
              <Code>{`find . -type f -printf "%p:%s:%T@\\n" | sort -t: -k3 -n -r | head -n 3 | sort -r -n -k2 -t:`}</Code>
            </div>
          }
          showLabel={t('Show Solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── Exercise 9: Connected users #1 ── */}
      <Section title={t('9. Connected Users #1 — sorted unique list to file', '9. Utilizatori conectati #1 — lista sortata unica in fisier')} id="s2-conn1" checked={!!checked['s2-conn1']} onCheck={() => toggleCheck('s2-conn1')}>
        <p>{t(
          'Write a chained command that writes, to the file utilizatori-logati.txt, the account names of all currently connected users, in alphabetical order (unique).',
          'Scrieti comanda inlantuita care scrie, in fisierul utilizatori-logati.txt, numele de cont ale tuturor utilizatorilor prezenti in sistem, in ordine alfabetica (unica).'
        )}</p>

        <Toggle
          question={t('Solution (multiple approaches)', 'Solutie (mai multe abordari)')}
          answer={
            <div>
              <p className="text-sm font-bold">{t('i) Starting from who:', 'i) Pornind de la who:')}</p>
              <Code>{`$ who | cut -f1 -d" " | sort -u -o utilizatori-logati.txt`}</Code>
              <p className="text-sm font-bold mt-2">{t('ii) Starting from finger:', 'ii) Pornind de la finger:')}</p>
              <Code>{`$ finger | tail -n +2 | cut -f1 -d" " | sort -u -o utilizatori-logati.txt`}</Code>
              <p className="text-sm mt-1">{t('tail -n +2 removes the header line from finger output.', 'tail -n +2 elimina linia de header din output-ul finger.')}</p>
              <p className="text-sm font-bold mt-2">{t('iii) Starting from users:', 'iii) Pornind de la users:')}</p>
              <Code>{`$ users | tr " " "\\n" | sort -u > utilizatori-logati.txt`}</Code>
              <p className="text-sm mt-1">{t('tr replaces spaces with newlines so sort can process individual names.', 'tr inlocuieste spatiile cu newline-uri pentru ca sort sa proceseze numele individual.')}</p>
              <p className="text-sm font-bold mt-2">{t('iv) Starting from w (with column fix):', 'iv) Pornind de la w (cu corectarea coloanei):')}</p>
              <Code>{`$ export PROCPS_USERLEN=20
$ w -h | cut -f1 -d" " | sort -u -o utilizatori-logati.txt`}</Code>
              <p className="text-sm font-bold mt-2">{t('Count sessions per user:', 'Numararea sesiunilor per utilizator:')}</p>
              <Code>{`$ who | cut -f1 -d" " | sort | uniq -c > utilizatori-logati.txt`}</Code>
            </div>
          }
          showLabel={t('Show Solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── Exercise 10: Connected users #2 ── */}
      <Section title={t('10. Connected Users #2 — login date/time and IP', '10. Utilizatori conectati #2 — data/ora login si IP')} id="s2-conn2" checked={!!checked['s2-conn2']} onCheck={() => toggleCheck('s2-conn2')}>
        <p>{t(
          'Write a chained command that displays the login date/time and the computer from which the connection was made, for all sessions opened by a specified user.',
          'Scrieti comanda inlantuita care afiseaza data si ora logarii, precum si calculatorul de pe care s-a facut logarea, pentru toate sesiunile deschise de un utilizator specificat.'
        )}</p>

        <Toggle
          question={t('Solution', 'Solutie')}
          answer={
            <div>
              <p className="text-sm font-bold">{t('i) Starting from finger (fixed-width columns):', 'i) Pornind de la finger (coloane de latime fixa):')}</p>
              <Code>{`$ finger | grep username | cut -b 49-`}</Code>
              <p className="text-sm font-bold mt-2">{t('ii) Starting from who (variable-width columns):', 'ii) Pornind de la who (coloane de latime variabila):')}</p>
              <Code>{`$ who | grep username | tr -s " " | cut -d " " -f 3-`}</Code>
              <p className="text-sm mt-1">{t(
                'tr -s " " squeezes consecutive spaces into one, needed because who\'s columns have variable widths.',
                'tr -s " " comprima spatiile consecutive intr-unul singur, necesar deoarece coloanele lui who au latimi variabile.'
              )}</p>
              <p className="text-sm font-bold mt-2">{t('iii) Starting from w (only login time, not date):', 'iii) Pornind de la w (doar ora login, nu si data):')}</p>
              <Code>{`$ w -h username | tr -s " " | cut -f 3,4 -d " "`}</Code>
            </div>
          }
          showLabel={t('Show Solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── Exercise 11: Running tasks ── */}
      <Section title={t('11. Running Tasks #1 — count processes of a user', '11. Procese in executie #1 — numararea proceselor unui utilizator')} id="s2-tasks1" checked={!!checked['s2-tasks1']} onCheck={() => toggleCheck('s2-tasks1')}>
        <p>{t(
          'Write a chained command that displays the total number of processes (across all sessions) for a user specified as parameter.',
          'Scrieti comanda inlantuita care afiseaza numarul total de procese (din toate sesiunile deschise) ale utilizatorului specificat ca parametru.'
        )}</p>

        <Toggle
          question={t('Solution', 'Solutie')}
          answer={
            <div>
              <p className="text-sm font-bold">{t('i) Using ps -U with custom format:', 'i) Folosind ps -U cu format personalizat:')}</p>
              <Code>{`$ ps -U username -o pid= | wc -l`}</Code>
              <p className="text-sm mt-1">{t('-o pid= outputs only PIDs without header.', '-o pid= afiseaza doar PID-urile fara header.')}</p>
              <p className="text-sm font-bold mt-2">{t('ii) Removing header with grep or tail:', 'ii) Eliminarea header-ului cu grep sau tail:')}</p>
              <Code>{`$ ps -U username | grep -v PID -c
# Or:
$ ps -U username | tail -n +2 | wc -l`}</Code>
              <p className="text-sm font-bold mt-2">{t('iii) Using --no-headers:', 'iii) Folosind --no-headers:')}</p>
              <Code>{`$ ps --no-headers -U username | wc -l`}</Code>
            </div>
          }
          showLabel={t('Show Solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── Exercise 12: Regex #1 — usernames starting with 'a' ── */}
      <Section title={t('12. Regex #1 — connected users filtered by name pattern', '12. Regex #1 — utilizatori conectati filtrati dupa un sablon de nume')} id="s2-regex1" checked={!!checked['s2-regex1']} onCheck={() => toggleCheck('s2-regex1')}>
        <p>{t(
          'Write a chained command that writes to a.txt the usernames of all connected users whose name starts with "a". Additional: write to escu.txt all connected users whose name ends with "escu".',
          'Scrieti comanda inlantuita care scrie in a.txt numele de cont ale utilizatorilor conectati al caror nume incepe cu "a". Suplimentar: scrieti in escu.txt utilizatorii conectati al caror nume se termina cu "escu".'
        )}</p>

        <Toggle
          question={t('Solution', 'Solutie')}
          answer={
            <div>
              <Box type="definition">
                <p className="text-sm">{t(
                  'Regex anchors: ^ matches the start of a line, $ matches the end of a line.',
                  'Ancore regex: ^ potriveste inceputul unei linii, $ potriveste sfarsitul unei linii.'
                )}</p>
              </Box>
              <p className="text-sm font-bold mt-2">{t('Names starting with "a":', 'Nume care incep cu "a":')}</p>
              <Code>{`$ who | cut -f1 -d" " | grep ^a > a.txt
# Or from finger:
$ finger | tail -n +2 | cut -f1 -d" " | grep ^a > a.txt
# Or from users:
$ users | tr " " "\\n" | grep ^a > a.txt`}</Code>
              <p className="text-sm font-bold mt-2">{t('Names ending with "escu":', 'Nume care se termina cu "escu":')}</p>
              <Code>{`$ who | cut -f1 -d" " | grep escu$ > escu.txt`}</Code>
            </div>
          }
          showLabel={t('Show Solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── Exercise 13: Regex #2 — UIDs >= 5000 ── */}
      <Section title={t('13. Regex #2 — users with UID >= 5000', '13. Regex #2 — utilizatori cu UID >= 5000')} id="s2-regex2" checked={!!checked['s2-regex2']} onCheck={() => toggleCheck('s2-regex2')}>
        <p>{t(
          'Write a chained command that displays all system users whose UID is greater than or equal to 5000.',
          'Scrieti comanda inlantuita care afiseaza toti utilizatorii sistemului care au UID-ul mai mare sau egal cu 5000.'
        )}</p>

        <Toggle
          question={t('Solution', 'Solutie')}
          answer={
            <div>
              <p className="text-sm">{t(
                'We need a regex that matches numbers >= 5000: either 5-9 followed by 3 digits, or 1-9 followed by 4+ digits.',
                'Avem nevoie de o expresie regulata care potriveste numere >= 5000: fie 5-9 urmat de 3 cifre, fie 1-9 urmat de 4+ cifre.'
              )}</p>
              <Code>{`$ cut -d: -f1,3 /etc/passwd | grep -E ":[5-9][0-9]{3}$|:[1-9][0-9]{4,}" | cut -d: -f1`}</Code>
              <p className="text-sm mt-2">{t(
                'The first alternative matches 5000-9999, the second matches 10000+. The colon ensures we match the UID field, not part of another field.',
                'Prima alternativa potriveste 5000-9999, a doua potriveste 10000+. Doua puncte asigura potrivirea campului UID, nu a unei parti din alt camp.'
              )}</p>
              <Box type="warning">
                <p className="text-sm">{t(
                  'For arbitrary limits like 5432, you need multiple regex alternatives to cover each digit range: :543[2-9]|:54[4-9][0-9]|:5[5-9][0-9]{2}|:[6-9][0-9]{3}|:[1-9][0-9]{4,}',
                  'Pentru limite arbitrare ca 5432, aveti nevoie de mai multe alternative regex pentru a acoperi fiecare interval de cifre: :543[2-9]|:54[4-9][0-9]|:5[5-9][0-9]{2}|:[6-9][0-9]{3}|:[1-9][0-9]{4,}'
                )}</p>
              </Box>
            </div>
          }
          showLabel={t('Show Solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>
    </>
  );
}
