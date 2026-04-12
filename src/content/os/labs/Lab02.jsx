import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';
import TerminalChallenge from '../../../components/ui/TerminalChallenge';

export default function Lab02() {
  const { t, checked, toggleCheck } = useApp();

  // ── Interactive terminal exercises (chained commands) ──────────
  const terminalExercises = [
    // Interleaving: combines Lab01 (mkdir/touch) + Lab02 (pipeline/wc) skills
    {
      description: t(
        'Review: Create directory ~/work, then create 3 empty files inside it (a.txt, b.txt, c.txt). Then count how many .txt files exist in ~/work and save the number to count.txt.',
        'Recapitulare: Creați directorul ~/work, apoi creați 3 fișiere goale în el (a.txt, b.txt, c.txt). Apoi numărați câte fișiere .txt există în ~/work și salvați numărul în count.txt.'
      ),
      courseRef: t('Review: Lab 1 + pipelines', 'Recapitulare: Lab 1 + pipeline-uri'),
      topic: t('review', 'recap'),
      files: {},
      checkScript: 'test -f /root/work/a.txt && test -f /root/work/b.txt && test -f /root/work/c.txt && test -f /root/count.txt && test "$(tr -d "[:space:]" < /root/count.txt)" = "3"',
      failureHint: (t) => t('Check all three: ~/work exists with exactly a.txt, b.txt, c.txt inside. count.txt must contain only the number 3 — not a listing or file names.', 'Verifică toate trei: ~/work există cu exact a.txt, b.txt, c.txt în el. count.txt trebuie să conțină doar numărul 3 — nu o listare sau nume de fișiere.'),
      hints: [
        t('You need two commands from Lab 1 — one creates the directory, one creates empty files', 'Ai nevoie de două comenzi din Lab 1 — una creează directorul, una creează fișiere goale'),
        t('For counting, pipe a listing of matching files into a line counter', 'Pentru numărare, trimite prin pipe o listare a fișierelor potrivite într-un contor de linii'),
      ],
      solution: 'mkdir work\ntouch work/a.txt work/b.txt work/c.txt\nls work/*.txt | wc -l > count.txt',
    },
    {
      description: t(
        'The file passwd (in your home directory) contains user account data. Write a pipeline that extracts all unique login shells and saves them to shells.txt. (You can cat shells.txt afterward to inspect it, but only the saved file is checked.)',
        'Fișierul passwd (în directorul home) conține date despre conturile de utilizatori. Scrieți un pipeline care extrage toate shell-urile de login unice și le salvează în shells.txt. (Puteți să afișați shells.txt cu cat după aceea pentru a inspecta, dar doar fișierul salvat este verificat.)'
      ),
      courseRef: t('Course 2: Pipelines, cut, sort', 'Cursul 2: Pipeline-uri, cut, sort'),
      topic: t('cut/sort', 'cut/sort'),
      files: {
        '/root/passwd': 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nuser:x:1000:1000:User:/home/user:/bin/bash\nstudent:x:1001:1001:Student:/home/student:/bin/bash\npostgres:x:108:114:PostgreSQL:/var/lib/postgresql:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\nsshd:x:109:65534::/run/sshd:/usr/sbin/nologin\n',
      },
      checkScript: 'test -f /root/shells.txt && ! grep -q ":" /root/shells.txt && awk "NF && !/^\\//{exit 1}" /root/shells.txt && test "$(wc -l < /root/shells.txt)" = "$(sort -u /root/shells.txt | wc -l)" && grep -q "/bin/bash" /root/shells.txt && grep -q "nologin" /root/shells.txt',
      failureHint: (t) => t('shells.txt must contain only shell paths (each starting with /), with no colons, and already deduplicated. Three transformations are needed: extract the right field, make lines unique, redirect to the file.', 'shells.txt trebuie să conțină doar căi de shell (fiecare începând cu /), fără două puncte, și deja deduplicate. Sunt necesare trei transformări: extragerea câmpului corect, unicizarea liniilor, redirectarea în fișier.'),
      hints: [
        t('Use "cut -f7 -d: passwd" to extract the shell field', 'Folosiți "cut -f7 -d: passwd" pentru a extrage câmpul shell'),
        t('Pipe to "sort -u" to get unique values', 'Pipe la "sort -u" pentru valori unice'),
        t('Redirect with > shells.txt, then cat shells.txt', 'Redirectați cu > shells.txt, apoi cat shells.txt'),
      ],
      solution: 'cut -f7 -d: passwd | sort -u > shells.txt\ncat shells.txt',
    },
    {
      description: t(
        'The file passwd contains user accounts. Write a pipeline that counts how many accounts use /bin/bash as their login shell. Save just the number to bash_count.txt.',
        'Fișierul passwd conține conturile de utilizatori. Scrieți un pipeline care numără câte conturi folosesc /bin/bash ca shell de login. Salvați doar numărul în bash_count.txt.'
      ),
      courseRef: t('Course 2: grep, wc, pipelines', 'Cursul 2: grep, wc, pipeline-uri'),
      topic: t('grep/wc', 'grep/wc'),
      files: {
        '/root/passwd': 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nuser:x:1000:1000:User:/home/user:/bin/bash\nstudent:x:1001:1001:Student:/home/student:/bin/bash\npostgres:x:108:114:PostgreSQL:/var/lib/postgresql:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\nsshd:x:109:65534::/run/sshd:/usr/sbin/nologin\n',
      },
      checkScript: 'test -f /root/bash_count.txt && test "$(cat /root/bash_count.txt | tr -d "[:space:]")" = "4"',
      hints: [
        t('Use "grep /bin/bash passwd" to find matching lines', 'Folosiți "grep /bin/bash passwd" pentru a găsi liniile potrivite'),
        t('Pipe to "wc -l" to count lines, or use "grep -c"', 'Pipe la "wc -l" pentru a număra linii, sau folosiți "grep -c"'),
        t('Redirect output with > bash_count.txt', 'Redirectați output-ul cu > bash_count.txt'),
      ],
      solution: 'grep -c /bin/bash passwd > bash_count.txt\ncat bash_count.txt',
    },
    {
      description: t(
        'The file data.txt contains usernames (one per line). Write a pipeline that: (1) selects only names containing "ana" but NOT "diana", (2) sorts them alphabetically, and (3) saves the result to filtered.txt.',
        'Fișierul data.txt conține nume de utilizatori (câte unul pe linie). Scrieți un pipeline care: (1) selectează doar numele ce conțin "ana" dar NU "diana", (2) le sortează alfabetic, și (3) salvează rezultatul în filtered.txt.'
      ),
      courseRef: t('Course 2: grep, grep -v, sort, pipelines', 'Cursul 2: grep, grep -v, sort, pipeline-uri'),
      topic: t('filter', 'filtrare'),
      files: {
        '/root/data.txt': 'ana.popescu\ndiana.ionescu\nioana.stan\nroxana.marin\nmihai.popa\nstefana.dinu\ndiana.vasile\nbogdana.rusu\nana.voicu\nadrian.ganea\n',
      },
      checkScript: 'test -f /root/filtered.txt && grep -q "ana" /root/filtered.txt && ! grep -q "diana" /root/filtered.txt && test "$(wc -l < /root/filtered.txt)" -ge 4',
      hints: [
        t('Start with "cat data.txt | grep ana" to select lines with "ana"', 'Începeți cu "cat data.txt | grep ana" pentru a selecta liniile cu "ana"'),
        t('Pipe to "grep -v diana" to exclude lines containing "diana"', 'Pipe la "grep -v diana" pentru a exclude liniile cu "diana"'),
        t('Pipe to "sort" then redirect with > filtered.txt', 'Pipe la "sort" apoi redirectați cu > filtered.txt'),
      ],
      solution: 'grep ana data.txt | grep -v diana | sort > filtered.txt\ncat filtered.txt',
    },
  ];

  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: OS - Lab #2, Cristian Vidrascu, UAIC',
          'Sursa: SO - Laborator #2, Cristian Vidrascu, UAIC'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('Lab #2: Chained Commands, Pipelines & I/O Redirections', 'Laborator #2: Comenzi înlănțuite, pipeline-uri și redirecționări I/O')}
        </p>
        <p className="text-sm">
          {t(
            'This lab covers chained commands (pipelines with |, sequential with ;, conditional with && and ||), I/O redirections (>, >>, 2>&1), and login initialization files (.bash_profile, .profile, .bashrc).',
            'Acest laborator acoperă comenzi înlănțuite (pipeline-uri cu |, secvențiale cu ;, condiționale cu && și ||), redirecționări I/O (>, >>, 2>&1) și fișiere de inițializare a sesiunii (.bash_profile, .profile, .bashrc).'
          )}
        </p>
      </Box>

      {/* ── Interactive exercises ── */}
      <h3 className="text-lg font-bold mt-6 mb-3">
        {t('Interactive Exercises', 'Exerciții interactive')}
      </h3>
      <p className="text-sm mb-4 opacity-80">
        {t(
          'Practice in the real Linux terminal below. Click "Check" to verify your solution.',
          'Exersați în terminalul Linux real de mai jos. Apăsați "Verifică" pentru a valida soluția.'
        )}
      </p>
      <TerminalChallenge exercises={terminalExercises} />

      {/* ── Section I: Chained command exercises ── */}
      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('I) Exercises with Chained Commands', 'I) Exerciții cu comenzi înlănțuite')}
      </h3>
      <p className="text-sm mb-4 opacity-80">
        {t(
          'These exercises require building command pipelines to process data from /etc/passwd or from dynamic sources like who, ps. Try them on your own Linux system, then check the solution.',
          'Aceste exerciții necesită construirea de pipeline-uri de comenzi pentru procesarea datelor din /etc/passwd sau din surse dinamice precum who, ps. Încercați-le pe propriul sistem Linux, apoi verificați soluția.'
        )}
      </p>

      {/* a) In-class exercises */}
      <h4 className="text-base font-semibold mt-4 mb-2">{t('a) In-class Exercises', 'a) Exerciții propuse pentru laborator')}</h4>

      <Section title={t('File/DB Processing #1: Filter usernames from first 15 lines', 'Procesare fișier/BD #1: Filtrarea username-urilor din primele 15 linii')} id="lab_2-ex1" checked={!!checked['lab_2-ex1']} onCheck={() => toggleCheck('lab_2-ex1')}>
        <p>{t(
          'Write a chained command that writes to max15.txt only the usernames from the first 15 lines of /etc/passwd, for accounts whose username ends with a letter from m..z and whose login shell is /sbin/nologin.',
          'Scrieți comanda înlănțuită care scrie în fișierul max15.txt doar username-urile acelor conturi din primele 15 linii ale /etc/passwd, al căror username se termină cu o literă din intervalul m..z și care folosesc ca interpretor de login /sbin/nologin.'
        )}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={
          <Code>{`head -n 15 /etc/passwd | grep "/sbin/nologin" | cut -d: -f1 | grep "[m-z]$" > max15.txt`}</Code>
        } showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Running Tasks #2: Bash processes on specific terminals', 'Procese în execuție #2: Procese bash pe terminale specifice')} id="lab_2-ex2" checked={!!checked['lab_2-ex2']} onCheck={() => toggleCheck('lab_2-ex2')}>
        <p>{t(
          'Write a chained command that writes to output.txt all processes of users using bash as their command interpreter, working at terminals (pts/XY) starting with digits 0, 1, 2, or 5, sorted by PID in descending numeric order.',
          'Scrieți comanda înlănțuită care scrie în output.txt toate procesele utilizatorilor ce folosesc bash drept interpretor de comenzi, care lucrează la terminale (pts/XY) ce încep cu cifrele 0, 1, 2 sau 5, sortate după PID-uri în ordine descrescătoare (numerică).'
        )}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={
          <div>
            <Code>{`ps aux | grep bash | grep "pts/[0125]" | sort -k2 -n -r > output.txt`}</Code>
            <p className="text-sm mt-1">{t(
              'Hint: process the output of ps with appropriate options. Use grep to filter by bash and terminal pattern, then sort numerically by PID descending.',
              'Indicație: prelucrați rezultatele afișate de comanda ps cu opțiunile adecvate. Folosiți grep pentru a filtra după bash și pattern-ul de terminal, apoi sortați numeric după PID descrescător.'
            )}</p>
          </div>
        } showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Connected Users #3: IPs of most recent 8 users', 'Utilizatori conectați #3: IP-urile celor mai recenți 8 utilizatori')} id="lab_2-ex3" checked={!!checked['lab_2-ex3']} onCheck={() => toggleCheck('lab_2-ex3')}>
        <p>{t(
          'Write a chained command that writes to filtruIPs.txt only the IPs of the computers from which the 8 most recently connected users logged in.',
          'Scrieți comanda înlănțuită care scrie în filtruIPs.txt doar IP-urile calculatoarelor de la care s-au conectat cei mai recent conectați 8 utilizatori.'
        )}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={
          <div>
            <Code>{`who | tail -n 8 | tr -s " " | cut -d" " -f5 | tr -d "()" > filtruIPs.txt`}</Code>
            <p className="text-sm mt-1">{t(
              'who lists connected users. tail -n 8 gets the 8 most recent. tr and cut extract the IP field, and tr -d "()" removes the parentheses.',
              'who listează utilizatorii conectați. tail -n 8 ia cei mai recenți 8. tr și cut extrag câmpul IP, și tr -d "()" elimină parantezele.'
            )}</p>
          </div>
        } showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Puzzle Pipeline #2: Arrange 4 commands correctly', 'Puzzle Pipeline #2: Aranjați 4 comenzi corect')} id="lab_2-ex4" checked={!!checked['lab_2-ex4']} onCheck={() => toggleCheck('lab_2-ex4')}>
        <p>{t(
          'Specify the correct chaining order for these 4 commands, so the pipeline displays all system processes in the format user:command:pid, sorted by command name:',
          'Specificați ordinea corectă de înlănțuire a celor 4 comenzi de mai jos, astfel încât pipeline-ul să afișeze toate procesele din sistem în formatul user:comanda:pid, sortate după numele comenzii:'
        )}</p>
        <ol className="list-decimal pl-5 text-sm space-y-1 mt-2 mb-3">
          <li><code>cut -d" " -f1,2,3 --output-delimiter=:</code></li>
          <li><code>sort -k2 -t:</code></li>
          <li><code>ps -eo user,comm,pid --no-headers</code></li>
          <li><code>tr -s " "</code></li>
        </ol>
        <Toggle question={t('Solution', 'Soluție')} answer={
          <div>
            <p className="text-sm">{t(
              'Logical reasoning: (3) ps is the data source. (4) tr squeezes spaces for consistent delimiters. (1) cut reformats with ":" delimiter. (2) sort by command name (field 2).',
              'Raționament logic: (3) ps este sursa de date. (4) tr comprimă spațiile pentru delimitatori consistenți. (1) cut reformatează cu delimitatorul ":". (2) sortare după numele comenzii (câmpul 2).'
            )}</p>
            <p className="text-sm mt-2 font-bold">{t('Correct order: 3, 4, 1, 2', 'Ordinea corectă: 3, 4, 1, 2')}</p>
            <Code>{`ps -eo user,comm,pid --no-headers | tr -s " " | cut -d" " -f1,2,3 --output-delimiter=: | sort -k2 -t:`}</Code>
          </div>
        } showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* b) Homework exercises */}
      <h4 className="text-base font-semibold mt-6 mb-2">{t('b) Homework Exercises', 'b) Exerciții suplimentare (pentru acasă)')}</h4>

      <Section title={t('User Accounts #2: Display username -> UID -> GID sorted by UID', 'Conturi utilizatori #2: Afișare username -> UID -> GID sortat după UID')} id="lab_2-hw1" checked={!!checked['lab_2-hw1']} onCheck={() => toggleCheck('lab_2-hw1')}>
        <p>{t(
          'Write a chained command that displays the data: username, UID, and GID in the format "username -> UID -> GID", for all system users, sorted ascending by UID.',
          'Scrieți comanda înlănțuită care afișează datele: username, UID și GID în formatul "username -> UID -> GID", pentru toți utilizatorii sistemului, sortați crescător după UID.'
        )}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={
          <Code>{`cut -d: -f1,3,4 /etc/passwd | sort -t: -k2 -n | cut -d: -f1,2,3 --output-delimiter=" -> "`}</Code>
        } showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Regex #3 / User Accounts #3: Users with UID > 4681', 'Regex #3 / Conturi utilizatori #3: Utilizatori cu UID > 4681')} id="lab_2-hw2" checked={!!checked['lab_2-hw2']} onCheck={() => toggleCheck('lab_2-hw2')}>
        <p>{t(
          'Write a chained command that displays all system users whose UID is strictly greater than 4681.',
          'Scrieți comanda înlănțuită care afișează toți utilizatorii sistemului care au UID-ul mai mare (strict) decât 4681.'
        )}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={
          <div>
            <p className="text-sm">{t(
              'Use a regex to match UIDs: 4682-4689, 469x, 47xx-49xx, 5xxx-9xxx, and 10000+.',
              'Folosiți un regex pentru a potrivi UID-uri: 4682-4689, 469x, 47xx-49xx, 5xxx-9xxx și 10000+.'
            )}</p>
            <Code>{`cut -d: -f1,3 /etc/passwd | grep -E ":468[2-9]|:469[0-9]|:4[7-9][0-9]{2}|:[5-9][0-9]{3}|:[1-9][0-9]{4,}" | cut -d: -f1`}</Code>
          </div>
        } showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('File/DB Processing #2: ext4 partitions with rw', 'Procesare fișier/BD #2: Partiții ext4 cu rw')} id="lab_2-hw3" checked={!!checked['lab_2-hw3']} onCheck={() => toggleCheck('lab_2-hw3')}>
        <p>{t(
          'Write a chained command that writes to volume-montate.txt the names of partitions using the ext4 filesystem mounted with the rw option, along with their mount points, separated by " -> ".',
          'Scrieți comanda înlănțuită care scrie în volume-montate.txt numele partițiilor ce folosesc sistemul de fișiere ext4 și au fost montate cu opțiunea rw, precum și punctele lor de montare, separate prin " -> ".'
        )}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={
          <Code>{`mount | grep "type ext4" | grep "rw" | tr -s " " | cut -d" " -f1,3 --output-delimiter=" -> " > volume-montate.txt
# Or using /etc/mtab:
grep ext4 /etc/mtab | grep rw | cut -d" " -f1,2 --output-delimiter=" -> " > volume-montate.txt`}</Code>
        } showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Running Tasks #3: Root processes running init', 'Procese în execuție #3: Procese root care rulează init')} id="lab_2-hw4" checked={!!checked['lab_2-hw4']} onCheck={() => toggleCheck('lab_2-hw4')}>
        <p>{t(
          'Write a chained command that writes to CMDs.txt all commands (with arguments, i.e. the full command line) running as root that are instances of the init program.',
          'Scrieți comanda înlănțuită care afișează în CMDs.txt toate comenzile (cu argumente, adică întreaga linie de comandă) rulate cu drepturi de root și care sunt instanțe de execuție ale programului init.'
        )}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={
          <Code>{`ps -U root -o args= | grep init > CMDs.txt
# Or:
ps -eo user,args | grep "^root" | grep init > CMDs.txt`}</Code>
        } showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Last Connected Users: Last 15 users by login time', 'Ultimii utilizatori conectați: Ultimii 15 după ora logării')} id="lab_2-hw5" checked={!!checked['lab_2-hw5']} onCheck={() => toggleCheck('lab_2-hw5')}>
        <p>{t(
          'Write a chained command that displays the last 15 users connected to the system by login time, along with the date, time, and station from which they connected.',
          'Scrieți comanda înlănțuită care afișează ultimii 15 utilizatori conectați la sistem în funcție de ora conectării, precum și data, ora și stația de la care s-au conectat.'
        )}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={
          <Code>{`last | head -n 15`}</Code>
        } showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Connected Users #4: User, station, foreground process', 'Utilizatori conectați #4: Utilizator, stație, proces foreground')} id="lab_2-hw6" checked={!!checked['lab_2-hw6']} onCheck={() => toggleCheck('lab_2-hw6')}>
        <p>{t(
          'Write a chained command that displays, for each connected user: account name, connection station, and foreground process, sorted alphabetically by account name.',
          'Scrieți comanda înlănțuită care afișează, pentru fiecare utilizator conectat: numele de cont, stația de la care s-a conectat și procesul rulat în foreground, ordonate în ordinea alfabetică a numelor de cont.'
        )}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={
          <div>
            <Code>{`w -h | tr -s " " | cut -d" " -f1,2,8 | sort`}</Code>
            <p className="text-sm mt-1">{t(
              'w -h omits the header line. tr squeezes spaces, cut selects user, TTY, and WHAT columns, sort orders alphabetically.',
              'w -h omite linia de header. tr comprimă spațiile, cut selectează coloanele user, TTY și WHAT, sort ordonează alfabetic.'
            )}</p>
          </div>
        } showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Connected Users #5: Earliest 12 login times appended to file', 'Utilizatori conectați #5: Cele mai mici 12 ore de login adăugate în fișier')} id="lab_2-hw7" checked={!!checked['lab_2-hw7']} onCheck={() => toggleCheck('lab_2-hw7')}>
        <p>{t(
          'Write a chained command that appends to the end of FirstLogins.txt the 12 smallest login times (HH:MM format) of currently connected users.',
          'Scrieți comanda înlănțuită care adaugă la finalul fișierului FirstLogins.txt cele mai mici 12 "ore" (formatul HH:MM) la care s-au logat utilizatorii prezenți pe server.'
        )}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={
          <div>
            <Code>{`who | tr -s " " | cut -d" " -f4 | sort | head -n 12 >> FirstLogins.txt`}</Code>
            <p className="text-sm mt-1">{t(
              'Note the >> operator for appending (not overwriting) the file.',
              'Notă: operatorul >> pentru adăugare (nu suprascriere) în fișier.'
            )}</p>
          </div>
        } showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* ── Section II: Login initialization files ── */}
      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('II) Login Initialization Files Experiment', 'II) Experiment cu fișierele de inițializare a sesiunii')}
      </h3>

      <Section title={t('Experiment: .bash_profile vs .profile execution order', 'Experiment: ordinea execuției .bash_profile vs .profile')} id="lab_2-init" checked={!!checked['lab_2-init']} onCheck={() => toggleCheck('lab_2-init')}>
        <p>{t(
          'Test what happens when you have both .bash_profile and .profile in your home directory. Which one is executed? In what order? What if only one exists? What if neither exists?',
          'Testați ce se întâmplă când aveți ambele fișiere .bash_profile și .profile în directorul home. Care este executat? În ce ordine? Ce se întâmplă dacă există doar unul? Dar dacă niciunul nu există?'
        )}</p>
        <Toggle question={t('Solution approach', 'Abordarea soluției')} answer={
          <div>
            <p className="text-sm">{t(
              'Add an echo command to each file to identify which is being executed:',
              'Adăugați o comandă echo în fiecare fișier pentru a identifica care este executat:'
            )}</p>
            <Code>{`echo 'echo "Executing .bash_profile..."' >> ~/.bash_profile
echo 'echo "Executing .profile..."' >> ~/.profile`}</Code>
            <p className="text-sm mt-2">{t(
              'Then test 4 cases: (i) both present, (ii) only .profile, (iii) only .bash_profile, (iv) neither. Open a new login session each time and observe messages.',
              'Apoi testați 4 cazuri: (i) ambele prezente, (ii) doar .profile, (iii) doar .bash_profile, (iv) niciunul. Deschideți o sesiune de login nouă de fiecare dată și observați mesajele.'
            )}</p>
            <Box type="definition">
              <p className="text-sm">{t(
                'Bash checks in order: .bash_profile -> .bash_login -> .profile. It executes the FIRST one found and stops. So if .bash_profile exists, .profile is NOT executed.',
                'Bash verifică în ordine: .bash_profile -> .bash_login -> .profile. Execută PRIMUL găsit și se oprește. Deci dacă .bash_profile există, .profile NU este executat.'
              )}</p>
            </Box>
          </div>
        } showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* ── Section III: I/O Redirections ── */}
      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('III) I/O Redirections Experiment', 'III) Experiment cu redirecționările I/O')}
      </h3>

      <Section title={t('Experiment: Redirecting stdout and stderr', 'Experiment: Redirecționarea stdout și stderr')} id="lab_2-redir" checked={!!checked['lab_2-redir']} onCheck={() => toggleCheck('lab_2-redir')}>
        <p>{t(
          'Determine what the three standard I/O devices will be during execution for each of these command lines. Does anything get lost?',
          'Determinați care vor fi cele trei dispozitive I/O standard în timpul execuției pentru fiecare din liniile de comandă următoare. Se pierde ceva?'
        )}</p>
        <Code>{`command 2>&1 >file
command 2>>&1 >file
command 2>&1 >>file
command 2>>&1 >>file
command >file 2>&1
command >file 2>>&1
command >>file 2>&1
command >>file 2>>&1`}</Code>
        <Toggle question={t('Solution approach', 'Abordarea soluției')} answer={
          <div>
            <p className="text-sm">{t(
              'Test with a command that produces both stdout and stderr output:',
              'Testați cu o comandă care produce atât output stdout cât și stderr:'
            )}</p>
            <Code>{`ls -l ~/.bashrc ~/NonExistentFile`}</Code>
            <p className="text-sm mt-2">{t(
              'Key insight: Redirections are processed LEFT TO RIGHT. The order matters!',
              'Ideea cheie: Redirecționările sunt procesate de la STÂNGA la DREAPTA. Ordinea contează!'
            )}</p>
            <Box type="warning">
              <p className="text-sm">{t(
                '"command 2>&1 >file" — stderr goes to terminal (was copied to stdout\'s original destination BEFORE stdout was redirected to file). stdout goes to file. Stderr output is NOT captured in file!',
                '"command 2>&1 >file" — stderr merge la terminal (a fost copiat la destinația originală a stdout ÎNAINTE ca stdout să fie redirecționat în fișier). stdout merge în fișier. Output-ul stderr NU este capturat în fișier!'
              )}</p>
            </Box>
            <Box type="definition">
              <p className="text-sm">{t(
                '"command >file 2>&1" — stdout goes to file first, then stderr is copied to the same destination (file). Both stdout AND stderr end up in the file. This is the correct way to capture everything.',
                '"command >file 2>&1" — stdout merge în fișier mai întâi, apoi stderr este copiat la aceeași destinație (fișier). Atât stdout CÂT ȘI stderr ajung în fișier. Aceasta este modalitatea corectă de a captura totul.'
              )}</p>
            </Box>
          </div>
        } showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>
    </>
  );
}
