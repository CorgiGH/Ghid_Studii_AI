import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';
import TerminalChallenge from '../../../components/ui/TerminalChallenge';

export default function Lab02() {
  const { t, lang, checked, toggleCheck } = useApp();

  // ── Interactive terminal exercises (chained commands) ──────────
  const terminalExercises = [
    {
      description: t(
        'Write a pipeline that extracts all unique login shells from /etc/passwd and saves them to shells.txt. Then display the contents of shells.txt.',
        'Scrieti un pipeline care extrage toate shell-urile de login unice din /etc/passwd si le salveaza in shells.txt. Apoi afisati continutul shells.txt.'
      ),
      courseRef: t('Course 2: Pipelines, cut, sort', 'Cursul 2: Pipeline-uri, cut, sort'),
      files: {
        '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nuser:x:1000:1000:User:/home/user:/bin/bash\nstudent:x:1001:1001:Student:/home/student:/bin/bash\npostgres:x:108:114:PostgreSQL:/var/lib/postgresql:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\nsshd:x:109:65534::/run/sshd:/usr/sbin/nologin\n',
      },
      checkScript: 'test -f /root/shells.txt && LINES=$(sort -u /root/shells.txt | grep -c .) && test "$LINES" -ge 2 && grep -qE "/bin/bash|nologin" /root/shells.txt',
      hints: [
        t('Use "cut -f7 -d: /etc/passwd" to extract the shell field', 'Folositi "cut -f7 -d: /etc/passwd" pentru a extrage campul shell'),
        t('Pipe to "sort -u" to get unique values', 'Pipe la "sort -u" pentru valori unice'),
        t('Redirect with > shells.txt, then cat shells.txt', 'Redirectati cu > shells.txt, apoi cat shells.txt'),
      ],
      solution: 'cut -f7 -d: /etc/passwd | sort -u > shells.txt\ncat shells.txt',
    },
    {
      description: t(
        'The file /etc/passwd contains user accounts. Write a pipeline that counts how many accounts use /bin/bash as their login shell. Save just the number to bash_count.txt.',
        'Fisierul /etc/passwd contine conturile de utilizatori. Scrieti un pipeline care numara cate conturi folosesc /bin/bash ca shell de login. Salvati doar numarul in bash_count.txt.'
      ),
      courseRef: t('Course 2: grep, wc, pipelines', 'Cursul 2: grep, wc, pipeline-uri'),
      files: {
        '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nuser:x:1000:1000:User:/home/user:/bin/bash\nstudent:x:1001:1001:Student:/home/student:/bin/bash\npostgres:x:108:114:PostgreSQL:/var/lib/postgresql:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\nsshd:x:109:65534::/run/sshd:/usr/sbin/nologin\n',
      },
      checkScript: 'test -f /root/bash_count.txt && test "$(cat /root/bash_count.txt | tr -d "[:space:]")" = "4"',
      hints: [
        t('Use "grep /bin/bash /etc/passwd" to find matching lines', 'Folositi "grep /bin/bash /etc/passwd" pentru a gasi liniile potrivite'),
        t('Pipe to "wc -l" to count lines, or use "grep -c"', 'Pipe la "wc -l" pentru a numara linii, sau folositi "grep -c"'),
        t('Redirect output with > bash_count.txt', 'Redirectati output-ul cu > bash_count.txt'),
      ],
      solution: 'grep -c /bin/bash /etc/passwd > bash_count.txt\ncat bash_count.txt',
    },
    {
      description: t(
        'The file data.txt contains usernames (one per line). Write a pipeline that: (1) selects only names containing "ana" but NOT "diana", (2) sorts them alphabetically, and (3) saves the result to filtered.txt.',
        'Fisierul data.txt contine nume de utilizatori (cate unul pe linie). Scrieti un pipeline care: (1) selecteaza doar numele ce contin "ana" dar NU "diana", (2) le sorteaza alfabetic, si (3) salveaza rezultatul in filtered.txt.'
      ),
      courseRef: t('Course 2: grep, grep -v, sort, pipelines', 'Cursul 2: grep, grep -v, sort, pipeline-uri'),
      files: {
        '/root/data.txt': 'ana.popescu\ndiana.ionescu\nioana.stan\nroxana.marin\nmihai.popa\nstefana.dinu\ndiana.vasile\nbogdana.rusu\nana.voicu\nadrian.ganea\n',
      },
      checkScript: 'test -f /root/filtered.txt && grep -q "ana" /root/filtered.txt && ! grep -q "diana" /root/filtered.txt && test "$(wc -l < /root/filtered.txt)" -ge 4',
      hints: [
        t('Start with "cat data.txt | grep ana" to select lines with "ana"', 'Incepeti cu "cat data.txt | grep ana" pentru a selecta liniile cu "ana"'),
        t('Pipe to "grep -v diana" to exclude lines containing "diana"', 'Pipe la "grep -v diana" pentru a exclude liniile cu "diana"'),
        t('Pipe to "sort" then redirect with > filtered.txt', 'Pipe la "sort" apoi redirectati cu > filtered.txt'),
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
          {t('Lab #2: Chained Commands, Pipelines & I/O Redirections', 'Laborator #2: Comenzi inlantuite, pipeline-uri si redirectari I/O')}
        </p>
        <p className="text-sm">
          {t(
            'This lab covers chained commands (pipelines with |, sequential with ;, conditional with && and ||), I/O redirections (>, >>, 2>&1), and login initialization files (.bash_profile, .profile, .bashrc).',
            'Acest laborator acopera comenzi inlantuite (pipeline-uri cu |, secventiale cu ;, conditionale cu && si ||), redirectari I/O (>, >>, 2>&1) si fisiere de initializare a sesiunii (.bash_profile, .profile, .bashrc).'
          )}
        </p>
      </Box>

      {/* ── Interactive exercises ── */}
      <h3 className="text-lg font-bold mt-6 mb-3">
        {t('Interactive Exercises', 'Exercitii interactive')}
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
        {t('I) Exercises with Chained Commands', 'I) Exercitii cu comenzi inlantuite')}
      </h3>
      <p className="text-sm mb-4 opacity-80">
        {t(
          'These exercises require building command pipelines to process data from /etc/passwd or from dynamic sources like who, ps. Try them on your own Linux system, then check the solution.',
          'Aceste exercitii necesita construirea de pipeline-uri de comenzi pentru procesarea datelor din /etc/passwd sau din surse dinamice precum who, ps. Incercati-le pe propriul sistem Linux, apoi verificati solutia.'
        )}
      </p>

      {/* a) In-class exercises */}
      <h4 className="text-base font-semibold mt-4 mb-2">{t('a) In-class Exercises', 'a) Exercitii propuse pentru laborator')}</h4>

      <Section title={t('File/DB Processing #1: Filter usernames from first 15 lines', 'Procesare fisier/BD #1: Filtrarea username-urilor din primele 15 linii')} id="lab_2-ex1" checked={!!checked['lab_2-ex1']} onCheck={() => toggleCheck('lab_2-ex1')}>
        <p>{t(
          'Write a chained command that writes to max15.txt only the usernames from the first 15 lines of /etc/passwd, for accounts whose username ends with a letter from m..z and whose login shell is /sbin/nologin.',
          'Scrieti comanda inlantuita care scrie in fisierul max15.txt doar username-urile acelor conturi din primele 15 linii ale /etc/passwd, al caror username se termina cu o litera din intervalul m..z si care folosesc ca interpretor de login /sbin/nologin.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`head -n 15 /etc/passwd | grep "/sbin/nologin" | cut -d: -f1 | grep "[m-z]$" > max15.txt`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Running Tasks #2: Bash processes on specific terminals', 'Procese in executie #2: Procese bash pe terminale specifice')} id="lab_2-ex2" checked={!!checked['lab_2-ex2']} onCheck={() => toggleCheck('lab_2-ex2')}>
        <p>{t(
          'Write a chained command that writes to output.txt all processes of users using bash as their command interpreter, working at terminals (pts/XY) starting with digits 0, 1, 2, or 5, sorted by PID in descending numeric order.',
          'Scrieti comanda inlantuita care scrie in output.txt toate procesele utilizatorilor ce folosesc bash drept interpretor de comenzi, care lucreaza la terminale (pts/XY) ce incep cu cifrele 0, 1, 2 sau 5, sortate dupa PID-uri in ordine descrescatoare (numerica).'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <div>
            <Code>{`ps aux | grep bash | grep "pts/[0125]" | sort -k2 -n -r > output.txt`}</Code>
            <p className="text-sm mt-1">{t(
              'Hint: process the output of ps with appropriate options. Use grep to filter by bash and terminal pattern, then sort numerically by PID descending.',
              'Indicatie: prelucrați rezultatele afisate de comanda ps cu optiunile adecvate. Folositi grep pentru a filtra dupa bash si pattern-ul de terminal, apoi sortati numeric dupa PID descrescator.'
            )}</p>
          </div>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Connected Users #3: IPs of most recent 8 users', 'Utilizatori conectati #3: IP-urile celor mai recenti 8 utilizatori')} id="lab_2-ex3" checked={!!checked['lab_2-ex3']} onCheck={() => toggleCheck('lab_2-ex3')}>
        <p>{t(
          'Write a chained command that writes to filtruIPs.txt only the IPs of the computers from which the 8 most recently connected users logged in.',
          'Scrieti comanda inlantuita care scrie in filtruIPs.txt doar IP-urile calculatoarelor de la care s-au conectat cei mai recent conectati 8 utilizatori.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <div>
            <Code>{`who | tail -n 8 | tr -s " " | cut -d" " -f5 | tr -d "()" > filtruIPs.txt`}</Code>
            <p className="text-sm mt-1">{t(
              'who lists connected users. tail -n 8 gets the 8 most recent. tr and cut extract the IP field, and tr -d "()" removes the parentheses.',
              'who listeaza utilizatorii conectati. tail -n 8 ia cei mai recenti 8. tr si cut extrag campul IP, si tr -d "()" elimina parantezele.'
            )}</p>
          </div>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Puzzle Pipeline #2: Arrange 4 commands correctly', 'Puzzle Pipeline #2: Aranjati 4 comenzi corect')} id="lab_2-ex4" checked={!!checked['lab_2-ex4']} onCheck={() => toggleCheck('lab_2-ex4')}>
        <p>{t(
          'Specify the correct chaining order for these 4 commands, so the pipeline displays all system processes in the format user:command:pid, sorted by command name:',
          'Specificati ordinea corecta de inlantuire a celor 4 comenzi de mai jos, astfel incat pipeline-ul sa afiseze toate procesele din sistem in formatul user:comanda:pid, sortate dupa numele comenzii:'
        )}</p>
        <ol className="list-decimal pl-5 text-sm space-y-1 mt-2 mb-3">
          <li><code>cut -d" " -f1,2,3 --output-delimiter=:</code></li>
          <li><code>sort -k2 -t:</code></li>
          <li><code>ps -eo user,comm,pid --no-headers</code></li>
          <li><code>tr -s " "</code></li>
        </ol>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <div>
            <p className="text-sm">{t(
              'Logical reasoning: (3) ps is the data source. (4) tr squeezes spaces for consistent delimiters. (1) cut reformats with ":" delimiter. (2) sort by command name (field 2).',
              'Rationament logic: (3) ps este sursa de date. (4) tr comprima spatiile pentru delimitatori consistenti. (1) cut reformateaza cu delimitatorul ":". (2) sortare dupa numele comenzii (campul 2).'
            )}</p>
            <p className="text-sm mt-2 font-bold">{t('Correct order: 3, 4, 1, 2', 'Ordinea corecta: 3, 4, 1, 2')}</p>
            <Code>{`ps -eo user,comm,pid --no-headers | tr -s " " | cut -d" " -f1,2,3 --output-delimiter=: | sort -k2 -t:`}</Code>
          </div>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* b) Homework exercises */}
      <h4 className="text-base font-semibold mt-6 mb-2">{t('b) Homework Exercises', 'b) Exercitii suplimentare (pentru acasa)')}</h4>

      <Section title={t('User Accounts #2: Display username -> UID -> GID sorted by UID', 'Conturi utilizatori #2: Afisare username -> UID -> GID sortat dupa UID')} id="lab_2-hw1" checked={!!checked['lab_2-hw1']} onCheck={() => toggleCheck('lab_2-hw1')}>
        <p>{t(
          'Write a chained command that displays the data: username, UID, and GID in the format "username -> UID -> GID", for all system users, sorted ascending by UID.',
          'Scrieti comanda inlantuita care afiseaza datele: username, UID si GID in formatul "username -> UID -> GID", pentru toti utilizatorii sistemului, sortati crescator dupa UID.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`cut -d: -f1,3,4 /etc/passwd | sort -t: -k2 -n | cut -d: -f1,2,3 --output-delimiter=" -> "`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Regex #3 / User Accounts #3: Users with UID > 4681', 'Regex #3 / Conturi utilizatori #3: Utilizatori cu UID > 4681')} id="lab_2-hw2" checked={!!checked['lab_2-hw2']} onCheck={() => toggleCheck('lab_2-hw2')}>
        <p>{t(
          'Write a chained command that displays all system users whose UID is strictly greater than 4681.',
          'Scrieti comanda inlantuita care afiseaza toti utilizatorii sistemului care au UID-ul mai mare (strict) decat 4681.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <div>
            <p className="text-sm">{t(
              'Use a regex to match UIDs: 4682-4689, 469x, 47xx-49xx, 5xxx-9xxx, and 10000+.',
              'Folositi un regex pentru a potrivi UID-uri: 4682-4689, 469x, 47xx-49xx, 5xxx-9xxx si 10000+.'
            )}</p>
            <Code>{`cut -d: -f1,3 /etc/passwd | grep -E ":468[2-9]|:469[0-9]|:4[7-9][0-9]{2}|:[5-9][0-9]{3}|:[1-9][0-9]{4,}" | cut -d: -f1`}</Code>
          </div>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('File/DB Processing #2: ext4 partitions with rw', 'Procesare fisier/BD #2: Partitii ext4 cu rw')} id="lab_2-hw3" checked={!!checked['lab_2-hw3']} onCheck={() => toggleCheck('lab_2-hw3')}>
        <p>{t(
          'Write a chained command that writes to volume-montate.txt the names of partitions using the ext4 filesystem mounted with the rw option, along with their mount points, separated by " -> ".',
          'Scrieti comanda inlantuita care scrie in volume-montate.txt numele partitiilor ce folosesc sistemul de fisiere ext4 si au fost montate cu optiunea rw, precum si punctele lor de montare, separate prin " -> ".'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`mount | grep "type ext4" | grep "rw" | tr -s " " | cut -d" " -f1,3 --output-delimiter=" -> " > volume-montate.txt
# Or using /etc/mtab:
grep ext4 /etc/mtab | grep rw | cut -d" " -f1,2 --output-delimiter=" -> " > volume-montate.txt`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Running Tasks #3: Root processes running init', 'Procese in executie #3: Procese root care ruleaza init')} id="lab_2-hw4" checked={!!checked['lab_2-hw4']} onCheck={() => toggleCheck('lab_2-hw4')}>
        <p>{t(
          'Write a chained command that writes to CMDs.txt all commands (with arguments, i.e. the full command line) running as root that are instances of the init program.',
          'Scrieti comanda inlantuita care afiseaza in CMDs.txt toate comenzile (cu argumente, adica intreaga linie de comanda) rulate cu drepturi de root si care sunt instante de executie ale programului init.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`ps -U root -o args= | grep init > CMDs.txt
# Or:
ps -eo user,args | grep "^root" | grep init > CMDs.txt`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Last Connected Users: Last 15 users by login time', 'Ultimii utilizatori conectati: Ultimii 15 dupa ora logarii')} id="lab_2-hw5" checked={!!checked['lab_2-hw5']} onCheck={() => toggleCheck('lab_2-hw5')}>
        <p>{t(
          'Write a chained command that displays the last 15 users connected to the system by login time, along with the date, time, and station from which they connected.',
          'Scrieti comanda inlantuita care afiseaza ultimii 15 utilizatori conectati la sistem in functie de ora conectarii, precum si data, ora si statia de la care s-au conectat.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`last | head -n 15`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Connected Users #4: User, station, foreground process', 'Utilizatori conectati #4: Utilizator, statie, proces foreground')} id="lab_2-hw6" checked={!!checked['lab_2-hw6']} onCheck={() => toggleCheck('lab_2-hw6')}>
        <p>{t(
          'Write a chained command that displays, for each connected user: account name, connection station, and foreground process, sorted alphabetically by account name.',
          'Scrieti comanda inlantuita care afiseaza, pentru fiecare utilizator conectat: numele de cont, statia de la care s-a conectat si procesul rulat in foreground, ordonate in ordinea alfabetica a numelor de cont.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <div>
            <Code>{`w -h | tr -s " " | cut -d" " -f1,2,8 | sort`}</Code>
            <p className="text-sm mt-1">{t(
              'w -h omits the header line. tr squeezes spaces, cut selects user, TTY, and WHAT columns, sort orders alphabetically.',
              'w -h omite linia de header. tr comprima spatiile, cut selecteaza coloanele user, TTY si WHAT, sort ordoneaza alfabetic.'
            )}</p>
          </div>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('Connected Users #5: Earliest 12 login times appended to file', 'Utilizatori conectati #5: Cele mai mici 12 ore de login adaugate in fisier')} id="lab_2-hw7" checked={!!checked['lab_2-hw7']} onCheck={() => toggleCheck('lab_2-hw7')}>
        <p>{t(
          'Write a chained command that appends to the end of FirstLogins.txt the 12 smallest login times (HH:MM format) of currently connected users.',
          'Scrieti comanda inlantuita care adauga la finalul fisierului FirstLogins.txt cele mai mici 12 "ore" (formatul HH:MM) la care s-au logat utilizatorii prezenti pe server.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <div>
            <Code>{`who | tr -s " " | cut -d" " -f4 | sort | head -n 12 >> FirstLogins.txt`}</Code>
            <p className="text-sm mt-1">{t(
              'Note the >> operator for appending (not overwriting) the file.',
              'Nota: operatorul >> pentru adaugare (nu suprascriere) in fisier.'
            )}</p>
          </div>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* ── Section II: Login initialization files ── */}
      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('II) Login Initialization Files Experiment', 'II) Experiment cu fisierele de initializare a sesiunii')}
      </h3>

      <Section title={t('Experiment: .bash_profile vs .profile execution order', 'Experiment: ordinea executiei .bash_profile vs .profile')} id="lab_2-init" checked={!!checked['lab_2-init']} onCheck={() => toggleCheck('lab_2-init')}>
        <p>{t(
          'Test what happens when you have both .bash_profile and .profile in your home directory. Which one is executed? In what order? What if only one exists? What if neither exists?',
          'Testati ce se intampla cand aveti ambele fisiere .bash_profile si .profile in directorul home. Care este executat? In ce ordine? Ce se intampla daca exista doar unul? Dar daca niciunul nu exista?'
        )}</p>
        <Toggle question={t('Solution approach', 'Abordarea solutiei')} answer={
          <div>
            <p className="text-sm">{t(
              'Add an echo command to each file to identify which is being executed:',
              'Adaugati o comanda echo in fiecare fisier pentru a identifica care este executat:'
            )}</p>
            <Code>{`echo 'echo "Executing .bash_profile..."' >> ~/.bash_profile
echo 'echo "Executing .profile..."' >> ~/.profile`}</Code>
            <p className="text-sm mt-2">{t(
              'Then test 4 cases: (i) both present, (ii) only .profile, (iii) only .bash_profile, (iv) neither. Open a new login session each time and observe messages.',
              'Apoi testati 4 cazuri: (i) ambele prezente, (ii) doar .profile, (iii) doar .bash_profile, (iv) niciunul. Deschideti o sesiune de login noua de fiecare data si observati mesajele.'
            )}</p>
            <Box type="definition">
              <p className="text-sm">{t(
                'Bash checks in order: .bash_profile -> .bash_login -> .profile. It executes the FIRST one found and stops. So if .bash_profile exists, .profile is NOT executed.',
                'Bash verifica in ordine: .bash_profile -> .bash_login -> .profile. Executa PRIMUL gasit si se opreste. Deci daca .bash_profile exista, .profile NU este executat.'
              )}</p>
            </Box>
          </div>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* ── Section III: I/O Redirections ── */}
      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('III) I/O Redirections Experiment', 'III) Experiment cu redirectarile I/O')}
      </h3>

      <Section title={t('Experiment: Redirecting stdout and stderr', 'Experiment: Redirectarea stdout si stderr')} id="lab_2-redir" checked={!!checked['lab_2-redir']} onCheck={() => toggleCheck('lab_2-redir')}>
        <p>{t(
          'Determine what the three standard I/O devices will be during execution for each of these command lines. Does anything get lost?',
          'Determinati care vor fi cele trei dispozitive I/O standard in timpul executiei pentru fiecare din liniile de comanda urmatoare. Se pierde ceva?'
        )}</p>
        <Code>{`command 2>&1 >file
command 2>>&1 >file
command 2>&1 >>file
command 2>>&1 >>file
command >file 2>&1
command >file 2>>&1
command >>file 2>&1
command >>file 2>>&1`}</Code>
        <Toggle question={t('Solution approach', 'Abordarea solutiei')} answer={
          <div>
            <p className="text-sm">{t(
              'Test with a command that produces both stdout and stderr output:',
              'Testati cu o comanda care produce atat output stdout cat si stderr:'
            )}</p>
            <Code>{`ls -l ~/.bashrc ~/NonExistentFile`}</Code>
            <p className="text-sm mt-2">{t(
              'Key insight: Redirections are processed LEFT TO RIGHT. The order matters!',
              'Ideea cheie: Redirectarile sunt procesate de la STANGA la DREAPTA. Ordinea conteaza!'
            )}</p>
            <Box type="warning">
              <p className="text-sm">{t(
                '"command 2>&1 >file" — stderr goes to terminal (was copied to stdout\'s original destination BEFORE stdout was redirected to file). stdout goes to file. Stderr output is NOT captured in file!',
                '"command 2>&1 >file" — stderr merge la terminal (a fost copiat la destinatia originala a stdout INAINTE ca stdout sa fie redirectat in fisier). stdout merge in fisier. Output-ul stderr NU este capturat in fisier!'
              )}</p>
            </Box>
            <Box type="definition">
              <p className="text-sm">{t(
                '"command >file 2>&1" — stdout goes to file first, then stderr is copied to the same destination (file). Both stdout AND stderr end up in the file. This is the correct way to capture everything.',
                '"command >file 2>&1" — stdout merge in fisier mai intai, apoi stderr este copiat la aceeasi destinatie (fisier). Atat stdout CAT SI stderr ajung in fisier. Aceasta este modalitatea corecta de a captura totul.'
              )}</p>
            </Box>
          </div>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>
    </>
  );
}
