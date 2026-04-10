import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';
import FileSystemTreeSVG from '../diagrams/FileSystemTreeSVG';
import PermissionsSVG from '../diagrams/PermissionsSVG';

export default function Course01() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
              <p className="mb-3 text-sm opacity-80">{t('Source: OS(2) - Ghid de utilizare Linux (II), Cristian Vidrascu, UAIC', 'Sursă: OS(2) - Ghid de utilizare Linux (II), Cristian Vidrascu, UAIC')}</p>

              {/* Roadmap */}
              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap - Topics in this course:', 'Foaie de parcurs - Subiecte din acest curs:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('Command-line introduction (internal vs external commands)', 'Introducere în linia de comandă (comenzi interne vs. externe)')}</li>
                  <li>{t('Help commands (man, whatis, which, whereis, apropos)', 'Comenzi de ajutor (man, whatis, which, whereis, apropos)')}</li>
                  <li>{t('Text editors & compilers', 'Editoare de text și compilatoare')}</li>
                  <li>{t('Remote connections (ssh, sftp, scp)', 'Conexiuni la distanță (ssh, sftp, scp)')}</li>
                  <li>{t('Users & groups (/etc/passwd, /etc/group, UID, GID)', 'Utilizatori și grupuri (/etc/passwd, /etc/group, UID, GID)')}</li>
                  <li>{t('Files & filesystems (types, logical/physical structure)', 'Fișiere și sisteme de fișiere (tipuri, structură logică/fizică)')}</li>
                  <li>{t('Mounting filesystems', 'Montarea sistemelor de fișiere')}</li>
                  <li>{t('Directory commands (mkdir, rmdir, ls, pwd, cd)', 'Comenzi pentru directoare (mkdir, rmdir, ls, pwd, cd)')}</li>
                  <li>{t('File commands (ln, cp, mv, rm, touch, etc.)', 'Comenzi pentru fișiere (ln, cp, mv, rm, touch, etc.)')}</li>
                  <li>{t('File permissions (rwx, chmod, chown, chgrp)', 'Permisiuni de acces (rwx, chmod, chown, chgrp)')}</li>
                  <li>{t('File content processing (cat, grep, cut, sort, find, etc.)', 'Procesarea conținutului fișierelor (cat, grep, cut, sort, find, etc.)')}</li>
                  <li>{t('Processes (ps, top, kill, jobs, fg/bg)', 'Procese (ps, top, kill, jobs, fg/bg)')}</li>
                  <li>{t('System information commands', 'Comenzi pentru informații despre sistem')}</li>
                  <li>{t('Troubleshooting ("survival guide")', 'Depanare ("ghid de supraviețuire")')}</li>
                </ol>
              </Box>

              {/* Pretest */}
              <Box type="theorem">
                <p className="font-bold mb-2">{t('Pretest — What do you already know?', 'Pre-test — Ce știți deja?')}</p>
                <p className="text-sm mb-2">{t('Try answering these before reading the course. Come back after to see how your understanding changed.', 'Încercați să răspundeți înainte de a citi cursul. Reveniți după pentru a vedea cum s-a schimbat înțelegerea voastră.')}</p>
                <Toggle
                  question={t('1. Is Linux case-sensitive? Does it matter if you type "ls" or "LS"?', '1. Este Linux sensibil la majuscule? Contează dacă tastați „ls" sau „LS"?')}
                  answer={t('Yes! Linux is case-sensitive. "ls" is a valid command, but "LS" is not. Similarly, "File.txt" and "file.txt" are two completely different files.', 'Da! Linux este sensibil la majuscule. „ls" este o comandă validă, dar „LS" nu. Similar, „File.txt" și „file.txt" sunt două fișiere complet diferite.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('2. What does the root directory "/" contain? Is it the same as the root user\'s home?', '2. Ce conține directorul rădăcină „/"? Este același lucru cu directorul home al utilizatorului root?')}
                  answer={t('"/" is the top of the filesystem tree — it contains all other directories (/home, /etc, /bin, etc.). It is NOT the same as root\'s home directory, which is /root. Every path on the system starts from /.', '„/" este vârful arborelui de fișiere — conține toate celelalte directoare (/home, /etc, /bin, etc.). NU este același lucru cu directorul home al utilizatorului root, care este /root. Fiecare cale din sistem pornește de la /.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('3. What is the difference between "rm" and "rmdir"?', '3. Care este diferența dintre „rm" și „rmdir"?')}
                  answer={t('"rmdir" only removes empty directories — it fails if the directory has any contents. "rm" removes files; with the -r flag it removes directories recursively (including all contents). "rm -rf" is dangerous because it deletes everything without asking.', '„rmdir" șterge doar directoare goale — eșuează dacă directorul conține ceva. „rm" șterge fișiere; cu flag-ul -r șterge directoare recursiv (inclusiv tot conținutul). „rm -rf" este periculos deoarece șterge totul fără a întreba.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('4. Can two files with different names point to the same data on disk?', '4. Pot două fișiere cu nume diferite să indice aceleași date pe disc?')}
                  answer={t('Yes! Hard links and symbolic links both allow this. A hard link is another name for the same file data (same inode). A symbolic link is a shortcut that points to another filename.', 'Da! Atât legăturile hard cât și cele simbolice permit acest lucru. O legătură hard este un alt nume pentru aceleași date (același inod). O legătură simbolică este o scurtătură care indică spre un alt nume de fișier.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('5. If you have read (r) permission on a directory but not execute (x), can you open files inside it?', '5. Dacă aveți permisiune de citire (r) pe un director dar nu și de execuție (x), puteți deschide fișierele din interior?')}
                  answer={t('No! Read permission on a directory only lets you list the filenames. You need execute (x) permission to actually access/traverse the directory and open files inside it. Without x, you can see names but not open anything.', 'Nu! Permisiunea de citire pe un director vă permite doar să listați numele fișierelor. Aveți nevoie de permisiunea de execuție (x) pentru a accesa/traversa directorul și a deschide fișierele. Fără x, puteți vedea numele dar nu puteți deschide nimic.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
              </Box>

              {/* Topic 1: Intro */}
              <Section title={t('1. Command-Line Introduction', '1. Introducere în linia de comandă')} id="course_1-intro" checked={!!checked['course_1-intro']} onCheck={() => toggleCheck('course_1-intro')}>
                <p>{t('A ', 'Un ')} <strong>{t('command interpreter', 'interpretor de comenzi')}</strong> {t('(shell) is a program that takes user commands, executes them, and displays results. It is the interface between the user and the OS.', '(shell) este un program care preia comenzile utilizatorului, le execută și afișează rezultatele. Este interfața dintre utilizator și sistemul de operare.')}</p>

                <Box type="definition">
                  <p className="font-bold">{t('Two categories of simple commands:', 'Două categorii de comenzi simple:')}</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li><strong>{t('Internal commands', 'Comenzi interne')}</strong> {t('- built into the shell itself. Examples:', '- implementate în interpretorul de comenzi. Exemple:')} <code>cd</code>, <code>help</code></li>
                    <li><strong>{t('External commands', 'Comenzi externe')}</strong> {t('- separate executables on disk. Examples:', '- implementate de sine stătător (fiecare în câte un fișier). Exemple:')} <code>ls</code>, <code>passwd</code>{t(', scripts like ', ', scripturi de genul ')} <code>backup.sh</code></li>
                  </ul>
                </Box>

                <Box type="formula">
                  <p className="font-bold font-mono">{t('General command syntax:', 'Sintaxa generală a unei comenzi:')}</p>
                  <Code>command_name [options] [arguments]</Code>
                  <ul className="list-disc pl-5 text-sm mt-1">
                    <li>{t('Options preceded by ', 'Opțiunile sunt precedate de ')} <code>-</code> {t('(short) or ', '(scurt) sau ')} <code>--</code> {t('(long)', '(lung)')}</li>
                    <li>{t('Separator between words: SPACE or TAB', 'Separator între cuvinte: SPACE sau TAB')}</li>
                    <li>{t('Multi-line commands: end each line with ', 'Comenzi pe mai multe linii: terminați fiecare linie cu ')} <code>\</code> {t('then ENTER', 'urmat de ENTER')}</li>
                  </ul>
                </Box>

                <p className="mt-2 font-bold">{t('Example 1 (straightforward):', 'Exemplul 1 (simplu):')}</p>
                <Code>{`$ ls -l /home
# Lists contents of /home in long format
# -l is an option, /home is an argument`}</Code>

                <p className="font-bold mt-3">{t('Example 2 (edge case - multi-line command):', 'Exemplul 2 (caz particular - comandă pe mai multe linii):')}</p>
                <Code>{`$ gcc -fdiagnostics-color=always \\
    -g program.c \\
    -o program`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Common trap:', 'Capcană frecventă:')}</p>
                  <p>{t('UNIX is ', 'UNIX este ')} <strong>{t('case-sensitive', 'sensibil la majuscule')}</strong>! <code>ls</code> {t('works, ', 'funcționează, ')} <code>LS</code> {t('does not. Filenames ', 'nu. Numele de fișiere ')} <code>File.txt</code> {t('and ', 'și ')} <code>file.txt</code> {t('are different files.', 'sunt fișiere diferite.')}</p>
                </Box>
              </Section>

              {/* Topic 2: Help Commands */}
              <Section title={t('2. Help Commands', '2. Comenzi de ajutor')} id="course_1-help" checked={!!checked['course_1-help']} onCheck={() => toggleCheck('course_1-help')}>
                <p>{t('When you encounter an unfamiliar command, Linux provides several tools to look up documentation directly from the terminal.', 'Când întâlniți o comandă necunoscută, Linux oferă mai multe instrumente pentru a căuta documentația direct din terminal.')}</p>

                <Box type="formula">
                  <p className="font-bold font-mono">{t('The man command (manual pages):', 'Comanda man (pagini de manual):')}</p>
                  <Code>{`$ man ls          # open the manual page for ls
$ man 5 passwd    # open section 5 (file formats) for passwd
$ man -k keyword  # search all man pages for keyword (same as apropos)`}</Code>
                  <p className="text-sm mt-1">{t('Man pages are organized into sections: 1=commands, 2=system calls, 3=library functions, 4=devices, 5=file formats, 6=games, 7=misc, 8=admin commands. Navigate with arrows, search with /, quit with q.', 'Paginile de manual sunt organizate în secțiuni: 1=comenzi, 2=apeluri de sistem, 3=funcții de bibliotecă, 4=dispozitive, 5=formate de fișiere, 6=jocuri, 7=diverse, 8=comenzi admin. Navigați cu săgețile, căutați cu /, ieșiți cu q.')}</p>
                </Box>

                <Box type="definition">
                  <p className="font-bold">{t('Other help commands:', 'Alte comenzi de ajutor:')}</p>
                  <Code>{`$ whatis ls       # one-line description of a command
$ which ls        # shows the path of the executable
$ whereis ls      # shows binary, source, and man page locations
$ apropos copy    # search man page descriptions for "copy"
$ help cd         # help for shell built-in commands only`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Tip:', 'Sfat:')}</p>
                  <p>{t('Use "man -k" or "apropos" when you know what you want to do but not the command name. For example, "apropos compress" will list all commands related to compression.', 'Folosiți „man -k" sau „apropos" când știți ce doriți să faceți dar nu și numele comenzii. De exemplu, „apropos compress" va lista toate comenzile legate de compresie.')}</p>
                </Box>
              </Section>

              {/* Checkpoint: Sections 1-2 */}
              <Toggle
                question={t('Checkpoint: Name two ways to get help about a command you don\'t know.', 'Punct de control: Numiți două modalități de a obține ajutor despre o comandă pe care nu o cunoașteți.')}
                answer={t('You can use "man command" to read its full manual page, or "whatis command" for a one-line summary. You can also use "apropos keyword" to search for commands by description.', 'Puteți folosi „man comandă" pentru a citi pagina de manual completă, sau „whatis comandă" pentru un rezumat de o linie. Puteți folosi și „apropos cuvânt" pentru a căuta comenzi după descriere.')}
                hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
              />
              <Toggle
                question={t('Checkpoint: What is the difference between an internal and an external command? Give one example of each.', 'Punct de control: Care este diferența dintre o comandă internă și una externă? Dați un exemplu pentru fiecare.')}
                answer={t('Internal commands are built into the shell (e.g., cd). External commands are separate programs stored on disk (e.g., ls at /bin/ls). Use "type command" to check.', 'Comenzile interne sunt integrate în shell (ex: cd). Comenzile externe sunt programe separate stocate pe disc (ex: ls la /bin/ls). Folosiți „type comandă" pentru a verifica.')}
                hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
              />

              {/* Topic 3: Users & Groups */}
              <Section title={t('3. Users, Groups & Authentication', '3. Utilizatori, grupuri și autentificare')} id="course_1-users" checked={!!checked['course_1-users']} onCheck={() => toggleCheck('course_1-users')}>
                <p>{t('Every user needs an ', 'Fiecare utilizator are nevoie de un ')}<strong>{t('account', 'cont')}</strong>{t(' (username + password) to work on a UNIX system. Each account has a ', ' (nume utilizator + parolă) pentru a lucra pe un sistem UNIX. Fiecare cont are un ')}<strong>UID</strong>{t(' (User ID). The special user ', ' (identificator de utilizator). Utilizatorul special ')}<strong>root</strong>{t(' (UID=0) has full system privileges.', ' (UID=0) are toate privilegiile pe sistem.')}</p>

                <Box type="formula">
                  <p className="font-bold font-mono">{t('/etc/passwd format:', 'Formatul /etc/passwd:')}</p>
                  <Code>username:x:UID:GID:userdata:home_directory:login_shell</Code>
                  <p className="text-sm mt-1">{t('The ', 'Câmpul ')} <code>x</code> {t('means the encrypted password is in ', 'indică că parola criptată se află în ')} <code>/etc/shadow</code> {t('(readable only by root).', '(citibil doar de root).')}</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold font-mono">{t('/etc/group format:', 'Formatul /etc/group:')}</p>
                  <Code>groupname:x:GID:list_of_users</Code>
                </Box>

                <p className="font-bold mt-2">{t('Example - inspect your own account:', 'Exemplu - inspectați propriul cont:')}</p>
                <Code>{`$ whoami          # shows your username
$ id              # shows UID, GID, and all groups
$ groups          # shows group memberships
$ who             # shows who is logged in
$ w               # detailed info about logged-in users
$ finger username # info about a specific user
$ last            # login history`}</Code>

                <p className="font-bold mt-2">{t('Example - change password:', 'Exemplu - schimbați parola:')}</p>
                <Code>{`$ passwd    # change your own password (interactive)`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p>{t('Each user belongs to exactly one ', 'Fiecare utilizator aparține exact unui ')}<strong>{t('primary group', 'grup primar')}</strong>{t(' (GID in /etc/passwd) and can belong to multiple ', ' (GID în /etc/passwd) și poate aparține mai multor ')}<strong>{t('supplementary groups', 'grupuri suplimentare')}</strong>{t(' (listed in /etc/group). Forgetting which group you\'re in can cause "Permission denied" errors.', ' (listate în /etc/group). Uitarea grupului curent poate cauza erori de tip „Permission denied".')}</p>
                </Box>
              </Section>

              {/* Topic 4: Files & Filesystem Structure */}
              <Section title={t('4. Files & Filesystem Structure', '4. Fișiere și structura sistemului de fișiere')} id="course_1-files" checked={!!checked['course_1-files']} onCheck={() => toggleCheck('course_1-files')}>
                <p>{t('In UNIX, data and programs are stored in ', 'În UNIX, datele și programele sunt stocate în ')}<strong>{t('files', 'fișiere')}</strong>{t('. Files are organized into ', '. Fișierele sunt organizate în ')}<strong>{t('filesystems', 'sisteme de fișiere')}</strong>{t(' (volumes on disk).', ' (volume pe disc).')}</p>

                <Box type="definition">
                  <p className="font-bold">{t('Six file types in UNIX:', 'Șase tipuri de fișiere în UNIX:')}</p>
                  <ol className="list-decimal pl-5">
                    <li><strong>{t('Regular files', 'Fișiere obișnuite')}</strong>{t(' - ordinary data/programs', ' - date/programe obișnuite')}</li>
                    <li><strong>{t('Directories', 'Directoare')}</strong>{t(' - "catalogs" containing other files', ' - „cataloage" ce conțin alte fișiere')}</li>
                    <li><strong>{t('Links', 'Legături')}</strong>{t(' (hard or symbolic) - aliases for existing files', ' (hard sau simbolice) - aliasuri pentru fișiere existente')}</li>
                    <li><strong>{t('Device files', 'Fișiere de dispozitiv')}</strong>{t(' (block or character) - hardware drivers', ' (bloc sau caracter) - drivere hardware')}</li>
                    <li><strong>{t('FIFO files', 'Fișiere FIFO')}</strong>{t(' (named pipes) - local IPC mechanism', ' (pipe-uri cu nume) - mecanism local de comunicare între procese')}</li>
                    <li><strong>{t('Socket files', 'Fișiere socket')}</strong>{t(' - network IPC mechanism', ' - mecanism de comunicare prin rețea')}</li>
                  </ol>
                </Box>

                <FileSystemTreeSVG />

                <Box type="theorem">
                  <p className="font-bold">{t('Key difference from Windows:', 'Diferența esențială față de Windows:')}</p>
                  <p>{t('UNIX has a ', 'UNIX are un ')}<strong>{t('single root filesystem', 'sistem de fișiere unic cu rădăcina')}</strong>{t(' rooted at ', ' la ')} <code>/</code>{t('. No drive letters (C:, D:). All other volumes are ', '. Fără litere de unitate (C:, D:). Toate celelalte volume sunt ')}<strong>{t('mounted', 'montate')}</strong>{t(' as subtrees. Path separator is ', ' ca subarbori. Separatorul de cale este ')} <code>/</code> {t('(not ', '(nu ')} <code>\</code>{t(').', ').')}</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Two ways to specify a file path:', 'Două moduri de a specifica o cale de fișier:')}</p>
                  <ul className="list-disc pl-5">
                    <li><strong>{t('Absolute path', 'Cale absolută')}</strong>{t(': from root ', ': de la rădăcina ')} <code>/</code>{t('. Example: ', '. Exemplu: ')} <code>/home/user/file.txt</code></li>
                    <li><strong>{t('Relative path', 'Cale relativă')}</strong>{t(': from current directory. Example: ', ': de la directorul curent. Exemplu: ')} <code>../docs/file.txt</code></li>
                  </ul>
                  <p className="mt-1 text-sm">{t('Special: ', 'Special: ')} <code>~</code> = {t('home directory', 'directorul home')}, <code>~user</code> = {t("user's home", 'home-ul utilizatorului')}, <code>.</code> = {t('current dir', 'director curent')}, <code>..</code> = {t('parent dir', 'director părinte')}</p>
                </Box>

                <p className="font-bold mt-2">{t('Filesystem types:', 'Tipuri de sisteme de fișiere:')}</p>
                <p className="text-sm">ext2/ext3/ext4 (Linux native), xfs, btrfs, zfs, vfat, ntfs, tmpfs, procfs, NFS, etc.</p>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p>{t("Don't confuse a file's ", 'Nu confundați ')}<strong>{t('extension', 'extensia')}</strong>{t(' (.c, .txt) with its ', ' (.c, .txt) a unui fișier cu ')}<strong>{t('type', 'tipul')}</strong>{t(' (regular, directory, link...). Extensions are just naming conventions for humans. The ', ' (obișnuit, director, legătură...). Extensiile sunt simple convenții de denumire. Comanda ')} <code>file</code> {t('command inspects actual content to determine type.', 'inspectează conținutul real pentru a determina tipul.')}</p>
                </Box>
              </Section>

              {/* Checkpoint: Sections 3-4 */}
              <Toggle
                question={t('Checkpoint: What is the difference between an absolute path and a relative path?', 'Punct de control: Care este diferența dintre o cale absolută și una relativă?')}
                answer={t('An absolute path starts from the root "/" (e.g., /home/user/file.txt). A relative path starts from the current directory (e.g., ../docs/file.txt). Absolute paths always work regardless of where you are; relative paths depend on your current location.', 'O cale absolută pornește de la rădăcina „/" (ex: /home/user/file.txt). O cale relativă pornește de la directorul curent (ex: ../docs/file.txt). Căile absolute funcționează indiferent de locație; căile relative depind de directorul curent.')}
                hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
              />
              <Toggle
                question={t('Checkpoint: Where is user account information stored, and what does the "x" in the password field mean?', 'Punct de control: Unde sunt stocate informațiile conturilor de utilizator și ce înseamnă „x" din câmpul parolei?')}
                answer={t('User accounts are stored in /etc/passwd. The "x" means the actual password hash is stored separately in /etc/shadow, which is only readable by root — this is a security measure.', 'Conturile de utilizator sunt stocate în /etc/passwd. „x" înseamnă că hash-ul parolei este stocat separat în /etc/shadow, care este citibil doar de root — aceasta este o măsură de securitate.')}
                hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
              />

              {/* Topic 5: Permissions */}
              <Section title={t('5. File Permissions', '5. Permisiuni de acces la fișiere')} id="course_1-perms" checked={!!checked['course_1-perms']} onCheck={() => toggleCheck('course_1-perms')}>
                <p>{t('Every file has an ', 'Fiecare fișier are un ')}<strong>{t('owner user', 'utilizator proprietar')}</strong>{t(', an ', ', un ')}<strong>{t('owner group', 'grup proprietar')}</strong>{t(', and ', ', și ')}<strong>{t('3 sets of permissions', '3 seturi de permisiuni')}</strong>{t(' for: user (u), group (g), others (o).', ' pentru: utilizator (u), grup (g), alții (o).')}</p>

                <PermissionsSVG />

                <Box type="formula">
                  <p className="font-bold">{t('Permission bits (for regular files):', 'Biții de permisiune (pentru fișiere obișnuite):')}</p>
                  <table className="text-sm font-mono mt-1">
                    <tbody>
                      <tr><td className="pr-4">r (read) = 4</td><td>{t('Can read file contents', 'Poate citi conținutul fișierului')}</td></tr>
                      <tr><td>w (write) = 2</td><td>{t('Can modify/delete file', 'Poate modifica/șterge fișierul')}</td></tr>
                      <tr><td>x (execute) = 1</td><td>{t('Can execute as program', 'Poate executa ca program')}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('For directories, permissions mean something different:', 'Pentru directoare, permisiunile au altă semnificație:')}</p>
                  <table className="text-sm font-mono mt-1">
                    <tbody>
                      <tr><td className="pr-4">r</td><td>{t('Can list filenames in directory', 'Poate lista numele fișierelor din director')}</td></tr>
                      <tr><td>w</td><td>{t('Can add/delete/rename files in directory', 'Poate adăuga/șterge/redenumi fișiere în director')}</td></tr>
                      <tr><td>x</td><td>{t('Can traverse (access files inside) directory', 'Poate traversa (accesa fișierele din) directorul')}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <p className="font-bold mt-3">{t('Example 1 - reading and setting permissions:', 'Exemplul 1 - citirea și setarea permisiunilor:')}</p>
                <Code>{`$ ls -l file.txt
-rw-r--r-- 1 user group 1234 Mar 15 10:00 file.txt

$ chmod 755 script.sh    # rwxr-xr-x (octal)
$ chmod u+x script.sh    # add execute for owner (symbolic)
$ chmod go-w file.txt    # remove write for group & others
$ chmod a+r file.txt     # add read for all`}</Code>

                <p className="font-bold mt-3">{t('Example 2 - changing ownership:', 'Exemplul 2 - schimbarea proprietarului:')}</p>
                <Code>{`$ chown newuser file.txt       # change owner
$ chgrp newgroup file.txt      # change group
$ chown newuser:newgroup file.txt  # both at once`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Access verification algorithm:', 'Algoritmul de verificare a accesului:')}</p>
                  <p>{t('To access ', 'Pentru a accesa ')} <code>/d1/d2/file</code>{t(', the OS checks ', ', sistemul de operare verifică permisiunea ')}<strong>x</strong>{t(' permission on ', ' pe ')} <code>/</code>{t(', ', ', ')} <code>d1</code>{t(', ', ', ')} <code>d2</code>{t(' for your user category, then the appropriate permission (r/w/x) on ', ' pentru categoria dvs. de utilizator, apoi permisiunea corespunzătoare (r/w/x) pe ')} <code>file</code> {t('itself. If any check fails, you get "Permission denied".', 'însuși. Dacă orice verificare eșuează, primiți „Permission denied".')}</p>
                </Box>
              </Section>

              {/* Topic 6: Essential Commands */}
              <Section title={t('6. Essential File & Directory Commands', '6. Comenzi esențiale pentru fișiere și directoare')} id="course_1-cmds" checked={!!checked['course_1-cmds']} onCheck={() => toggleCheck('course_1-cmds')}>
                <Box type="definition">
                  <p className="font-bold">{t('Directory commands:', 'Comenzi pentru directoare:')}</p>
                  <Code>{`mkdir dirname     # create directory
mkdir -p a/b/c    # create nested directories
rmdir dirname     # remove empty directory
ls                # list files
ls -lA            # long format, include hidden
pwd               # print working directory
cd /path          # change directory
cd ~              # go home
cd -              # go to previous directory`}</Code>
                </Box>

                <Box type="definition">
                  <p className="font-bold">{t('File manipulation commands:', 'Comenzi pentru manipularea fișierelor:')}</p>
                  <Code>{`touch file        # create empty file / update timestamp
cp src dst        # copy file
cp -r srcdir dst  # copy directory recursively
mv old new        # move or rename
rm file           # delete file
rm -rf dir        # delete directory recursively (DANGEROUS!)
ln -s target link # create symbolic link
ln target link    # create hard link`}</Code>
                </Box>

                <Box type="definition">
                  <p className="font-bold">{t('File content commands:', 'Comenzi pentru conținutul fișierelor:')}</p>
                  <Code>{`cat file          # display entire file
head -n 10 file   # first 10 lines
tail -n 10 file   # last 10 lines
less file         # paginated viewer
wc file           # count lines/words/chars
grep pattern file # search for pattern in file
cut -d: -f1 file  # extract column 1 (delimiter :)
sort file         # sort lines
find /path -name "*.c"  # find files by name
diff file1 file2  # compare two files
file myfile       # detect file content type`}</Code>
                </Box>

                <p className="font-bold mt-2">{t('Worked Example - find all .c files modified in the last 7 days:', 'Exemplu rezolvat - găsiți toate fișierele .c modificate în ultimele 7 zile:')}</p>
                <Code>{`$ find /home/user -name "*.c" -mtime -7 -type f
# -name: pattern match
# -mtime -7: modified less than 7 days ago
# -type f: regular files only`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p><code>rm -rf</code> {t('is irreversible! There is no trash/recycle bin in UNIX CLI. Double-check paths before using it. A misplaced space in ', 'este ireversibil! Nu există coș de gunoi în CLI-ul UNIX. Verificați de două ori căile înainte de utilizare. Un spațiu greșit în ')} <code>rm -rf / home</code> {t('(vs ', '(față de ')} <code>rm -rf /home</code>{t(') can destroy the entire system.', ') poate distruge întregul sistem.')}</p>
                </Box>
              </Section>

              {/* Checkpoint: Sections 5-6 */}
              <Toggle
                question={t('Checkpoint: What is the octal value for rwxr-x--- and how do you set it?', 'Punct de control: Care este valoarea octală pentru rwxr-x--- și cum o setați?')}
                answer={t('rwx=7, r-x=5, ---=0, so the octal is 750. Set it with: chmod 750 filename. You can also use symbolic mode: chmod u=rwx,g=rx,o= filename.', 'rwx=7, r-x=5, ---=0, deci octalul este 750. Setați cu: chmod 750 numefișier. Puteți folosi și modul simbolic: chmod u=rwx,g=rx,o= numefișier.')}
                hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
              />
              <Toggle
                question={t('Checkpoint: What is the difference between "cp" and "mv"? What happens to the original file?', 'Punct de control: Care este diferența dintre „cp" și „mv"? Ce se întâmplă cu fișierul original?')}
                answer={t('"cp" creates a copy — the original remains. "mv" moves or renames — the original is gone from the old location. Neither asks for confirmation by default, so be careful.', '„cp" creează o copie — originalul rămâne. „mv" mută sau redenumește — originalul dispare din locația veche. Niciuna nu cere confirmare implicit, deci fiți atenți.')}
                hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
              />

              {/* Topic 7: Processes */}
              <Section title={t('7. Processes', '7. Procese')} id="course_1-proc" checked={!!checked['course_1-proc']} onCheck={() => toggleCheck('course_1-proc')}>
                <Box type="definition">
                  <p><strong>{t('Process', 'Proces')}</strong> = {t('an instance of a program in execution. Processes form a ', 'o instanță a unui program în execuție. Procesele formează o ')}<strong>{t('tree hierarchy', 'ierarhie de arbore')}</strong>{t(' (parent-child) rooted at PID 1 (init or systemd, the first user-space process).', ' (părinte-copil) cu rădăcina la PID 1 (init sau systemd, primul proces din spațiul utilizator).')}</p>
                </Box>
                <Code>{`$ ps -f            # processes in current session
$ ps aux           # all processes, detailed
$ pstree           # tree view of processes
$ top              # real-time process monitor
$ jobs             # background jobs in current shell
$ fg %1            # bring job 1 to foreground
$ bg %1            # resume job 1 in background
$ kill PID         # send SIGTERM to process
$ kill -9 PID      # force kill (SIGKILL)
$ killall name     # kill by name`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Connection to later courses:', 'Legătură cu cursurile ulterioare:')}</p>
                  <p>{t('Courses 6-7 (OS(6), OS(7)) will teach you how to create processes programmatically with ', 'Cursurile 6-7 (OS(6), OS(7)) vă vor învăța cum să creați procese programatic cu ')} <code>fork()</code>{t(', synchronize them with ', ', să le sincronizați cu ')} <code>wait()</code>{t(', and replace their program with ', ', și să înlocuiți programul lor cu ')} <code>exec()</code>{t('.', '.')}</p>
                </Box>
              </Section>

              {/* Topic 8: Troubleshooting */}
              <Section title={t('8. Troubleshooting (Survival Guide)', '8. Depanare (Ghid de supraviețuire)')} id="course_1-trouble" checked={!!checked['course_1-trouble']} onCheck={() => toggleCheck('course_1-trouble')}>
                <Box type="warning">
                  <p className="font-bold">{t('When a command appears "stuck":', 'Când o comandă pare „blocată":')}</p>
                  <ol className="list-decimal pl-5">
                    <li>{t('Wait a reasonable time - it might just be busy computing', 'Așteptați un timp rezonabil - poate doar calculează')}</li>
                    <li>{t('Press ', 'Apăsați ')}<strong>CTRL+C</strong>{t(' (sends SIGINT) - interrupts the program', ' (trimite SIGINT) - întrerupe programul')}</li>
                    <li>{t('Press ', 'Apăsați ')}<strong>CTRL+\</strong>{t(' (sends SIGQUIT) - stronger termination', ' (trimite SIGQUIT) - terminare mai puternică')}</li>
                    <li>{t('Press ', 'Apăsați ')}<strong>CTRL+Z</strong>{t(' (suspends program), then use ', ' (suspendă programul), apoi utilizați ')} <code>ps</code>{t(' to find PID, then ', ' pentru a găsi PID-ul, apoi ')} <code>kill -9 PID</code></li>
                  </ol>
                </Box>
              </Section>

              {/* Checkpoint: Sections 7-8 */}
              <Toggle
                question={t('Checkpoint: Your terminal appears frozen after running a command. What steps do you take?', 'Punct de control: Terminalul pare înghețat după rularea unei comenzi. Ce pași urmați?')}
                answer={t('1) Wait briefly — it might be computing. 2) Press CTRL+C to send SIGINT. 3) Press CTRL+\\ to send SIGQUIT. 4) Press CTRL+Z to suspend, then find the PID with "ps" and use "kill -9 PID" to force-kill it.', '1) Așteptați scurt — poate calculează. 2) Apăsați CTRL+C pentru SIGINT. 3) Apăsați CTRL+\\ pentru SIGQUIT. 4) Apăsați CTRL+Z pentru a suspenda, apoi găsiți PID-ul cu „ps" și folosiți „kill -9 PID" pentru terminare forțată.')}
                hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
              />

              {/* Cheat Sheet */}
              <Section title={t('Cheat Sheet', 'Foaie de referință rapidă')} id="course_1-cheat" checked={!!checked['course_1-cheat']} onCheck={() => toggleCheck('course_1-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula">
                    <p className="font-bold">{t('Navigation', 'Navigare')}</p>
                    <p>pwd, cd, ls -lA</p>
                    <p>mkdir -p, rmdir, realpath</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">{t('Files', 'Fișiere')}</p>
                    <p>cp, mv, rm, ln -s, touch</p>
                    <p>cat, head, tail, less, file</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">{t('Search & Filter', 'Căutare și filtrare')}</p>
                    <p>grep, find, sort, cut, wc, tr, uniq</p>
                    <p>diff, cmp, comm</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">{t('Permissions', 'Permisiuni')}</p>
                    <p>chmod (octal/symbolic)</p>
                    <p>chown, chgrp</p>
                    <p>r=4 w=2 x=1</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">{t('Users', 'Utilizatori')}</p>
                    <p>whoami, id, groups, who, w</p>
                    <p>/etc/passwd, /etc/group</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">{t('Processes', 'Procese')}</p>
                    <p>ps, pstree, top, jobs</p>
                    <p>kill, kill -9, fg, bg</p>
                    <p>CTRL+C, CTRL+Z, CTRL+\</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">{t('Help', 'Ajutor')}</p>
                    <p>man [section] name</p>
                    <p>help cmd, whatis, which</p>
                    <p>whereis, apropos</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">{t('Remote', 'La distanță')}</p>
                    <p>ssh user@host</p>
                    <p>scp src user@host:dst</p>
                    <p>sftp user@host</p>
                  </Box>
                </div>
              </Section>

              {/* Quiz */}
              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="course_1-quiz" checked={!!checked['course_1-quiz']} onCheck={() => toggleCheck('course_1-quiz')}>
                <Toggle
                  question={t('1. What is the difference between an internal and an external command?', '1. Care este diferența dintre o comandă internă și una externă?')}
                  answer={t('Internal commands are built into the shell (e.g., cd, help). External commands are separate executable files on disk (e.g., ls → /bin/ls). External commands can be scripts or compiled binaries.', 'Comenzile interne sunt implementate în interpretorul de comenzi (ex: cd, help). Comenzile externe sunt fișiere executabile separate pe disc (ex: ls → /bin/ls). Comenzile externe pot fi scripturi sau binare compilate.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t("2. What does the 'x' permission mean on a directory?", "2. Ce înseamnă permisiunea 'x' pe un director?")}
                  answer={t("It means 'traverse' permission — the right to access files and subdirectories inside that directory. Without x, you can't cd into it or access any file by path through it, even if you have r permission to list its contents.", "Înseamnă permisiunea de 'traversare' — dreptul de a accesa fișierele și subdirectoarele din acel director. Fără x, nu puteți face cd în el sau accesa niciun fișier prin cale, chiar dacă aveți permisiunea r pentru a lista conținutul.")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('3. What is the octal representation of rwxr-x---?', '3. Care este reprezentarea octală a lui rwxr-x---?')}
                  answer={t('rwx=7, r-x=5, ---=0. Answer: 750.', 'rwx=7, r-x=5, ---=0. Răspuns: 750.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('4. How does UNIX filesystem differ from Windows?', '4. Cum diferă sistemul de fișiere UNIX față de Windows?')}
                  answer={t("UNIX has a single root filesystem tree rooted at '/', uses '/' as path separator (not '\\\\'), filenames are case-sensitive, no drive letters. Other volumes are mounted as subtrees via the mount command.", "UNIX are un singur arbore de sisteme de fișiere cu rădăcina la '/', folosește '/' ca separator de cale (nu '\\\\'), numele de fișiere sunt sensibile la majuscule, fără litere de unitate. Alte volume sunt montate ca subarbori prin comanda mount.")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('5. What file stores user account information? What are its fields?', '5. Ce fișier stochează informațiile conturilor de utilizator? Care sunt câmpurile sale?')}
                  answer={t("/etc/passwd. Fields: username:x:UID:GID:userdata:home_directory:login_shell. The 'x' indicates the password hash is stored in /etc/shadow.", "/etc/passwd. Câmpuri: username:x:UID:GID:userdata:home_directory:login_shell. 'x' indică faptul că hash-ul parolei este stocat în /etc/shadow.")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('6. What are the 6 file types in UNIX?', '6. Care sunt cele 6 tipuri de fișiere în UNIX?')}
                  answer={t('Regular files, directories, links (hard/symbolic), device files (block/character), FIFO (named pipe), sockets.', 'Fișiere obișnuite, directoare, legături (hard/simbolice), fișiere de dispozitiv (bloc/caracter), FIFO (pipe cu nume), socket-uri.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('7. What happens if you run: rm -rf / home (note the space)?', '7. Ce se întâmplă dacă rulați: rm -rf / home (observați spațiul)?')}
                  answer={t("This tries to recursively delete EVERYTHING starting from root '/' first, then a relative path 'home'. This would destroy the entire system. The correct command is rm -rf /home (no space). Always double-check rm -rf commands!", "Aceasta încearcă să șteargă recursiv TOT ce pornește de la rădăcina '/' mai întâi, apoi calea relativă 'home'. Ar distruge întregul sistem. Comanda corectă este rm -rf /home (fără spațiu). Verificați întotdeauna comenzile rm -rf!")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('8. How do you find all .txt files larger than 1MB under /home?', '8. Cum găsiți toate fișierele .txt mai mari de 1MB din /home?')}
                  answer={<code>find /home -name "*.txt" -size +1M -type f</code>}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('9. What\'s the difference between kill PID and kill -9 PID?', '9. Care este diferența dintre kill PID și kill -9 PID?')}
                  answer={t('kill PID sends SIGTERM (signal 15), which asks the process to terminate gracefully (it can be caught/ignored). kill -9 PID sends SIGKILL (signal 9), which forcefully terminates the process immediately and cannot be caught or ignored.', 'kill PID trimite SIGTERM (signal 15), care cere procesului să se termine elegant (poate fi capturat/ignorat). kill -9 PID trimite SIGKILL (signal 9), care termină forțat procesul imediat și nu poate fi captat sau ignorat.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('10. What command shows all environment information about your user session?', '10. Ce comandă afișează toate informațiile despre sesiunea dvs. de utilizator?')}
                  answer={<span><code>id</code> {t('shows UID/GID/groups.', 'afișează UID/GID/grupuri.')} <code>env</code> {t('or', 'sau')} <code>printenv</code> {t('shows environment variables.', 'afișează variabilele de mediu.')} <code>who am i</code> {t('or', 'sau')} <code>whoami</code> {t('shows current user.', 'afișează utilizatorul curent.')} <code>tty</code> {t('shows terminal device.', 'afișează dispozitivul terminal.')}</span>}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
              </Section>
    </>
  );
}
