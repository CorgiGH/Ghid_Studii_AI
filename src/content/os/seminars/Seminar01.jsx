import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Seminar01() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-3 text-sm opacity-80">{t('Source: OS Lab #1 - Working with simple commands in Linux, Cristian Vidrascu, UAIC', 'Sursa: SO Laborator #1 - Lucrul la linia de comanda in Linux, cu comenzi simple, Cristian Vidrascu, UAIC')}</p>

      {/* Recap */}
      <Box type="definition">
        <p className="font-bold mb-2">{t('I.1) Recap', 'I.1) Recapitulare')}</p>
        <p className="text-sm">
          {t(
            'Before starting the solved exercises, review the lecture material on basic commands and filesystems in Linux (Course 1). Make sure you understand the general command syntax, file types, directory structure, and user/group concepts.',
            'Inainte de a incepe exercitiile rezolvate, revedeți materialul din cursul practic despre comenzi de baza si sisteme de fisiere in Linux (Cursul 1). Asigurati-va ca intelegeti sintaxa generala a comenzilor, tipurile de fisiere, structura directoarelor si conceptele de utilizatori/grupuri.'
          )}
        </p>
      </Box>

      <h3 className="text-lg font-bold mt-6 mb-3">{t('I.2) Solved Examples', 'I.2) Exemple rezolvate')}</h3>

      {/* ── Exercise 1: Man Pages ── */}
      <Section title={t('1. Accessing the Man Pages', '1. Accesarea paginilor de manual')} id="s1-man" checked={!!checked['s1-man']} onCheck={() => toggleCheck('s1-man')}>
        <p>{t(
          'Man pages contain documentation for external commands available in Linux, C functions from the POSIX API, standard C library functions, and other documentation, organized into 8 sections.',
          'Paginile de manual contin documentatia despre comenzile externe disponibile in Linux, functiile C din API-ul POSIX si cele din biblioteca standard de C, plus alte documentatii, organizate pe 8 sectiuni.'
        )}</p>

        <p className="font-bold mt-3">{t('i) whatis — check if a command/function exists:', 'i) whatis — verificati daca exista o comanda/functie:')}</p>
        <Code>{`$ whatis write
write (1)            - send a message to another user
write (2)            - write to a file descriptor`}</Code>
        <p className="text-sm mt-1">{t(
          'Section 1 = user commands, Section 2 = POSIX API functions. So "write" exists as both a command and a system call.',
          'Sectiunea 1 = comenzi utilizator, Sectiunea 2 = functii din API-ul POSIX. Deci "write" exista si ca comanda si ca apel de sistem.'
        )}</p>

        <Code>{`$ whatis mkdir
mkdir (1)            - make directories
mkdir (2)            - create a directory`}</Code>

        <p className="font-bold mt-3">{t('ii) man — read the full manual page:', 'ii) man — cititi pagina completa de manual:')}</p>
        <Code>{`$ man 1 mkdir    # manual for the mkdir command (section 1)
$ man mkdir      # same — defaults to section 1
$ man 2 mkdir    # manual for the mkdir() system call (section 2)`}</Code>

        <Toggle
          question={t('Man page structure for a command (man 1 mkdir)', 'Structura paginii de manual pentru o comanda (man 1 mkdir)')}
          answer={
            <div>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li><strong>NAME</strong> {t('— command name and short description', '— numele comenzii si o scurta descriere')}</li>
                <li><strong>SYNOPSIS</strong> {t('— syntax (parameters, options)', '— sintaxa (parametri, optiuni)')}</li>
                <li><strong>DESCRIPTION</strong> {t('— meaning of each option and argument', '— semnificatia fiecarei optiuni si argument')}</li>
                <li><strong>SEE ALSO</strong> {t('— related commands/functions', '— comenzi/functii corelate')}</li>
              </ul>
            </div>
          }
          showLabel={t('Show structure', 'Arată structura')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Box type="definition">
          <p className="font-bold text-sm">{t('Navigating man pages (uses less):', 'Navigarea in paginile de manual (foloseste less):')}</p>
          <ul className="list-disc pl-5 text-sm mt-1 space-y-0.5">
            <li><code>q</code> {t('— quit', '— iesire')}</li>
            <li><code>Up/Down</code>, <code>PgUp/PgDn</code> {t('— scroll', '— derulare')}</li>
            <li><code>g</code> / <code>G</code> {t('— jump to start / end', '— salt la inceput / sfarsit')}</li>
            <li><code>/word</code> {t('— search for "word", then ', '— cautati "word", apoi ')} <code>n</code> / <code>N</code> {t('to navigate matches', 'pentru a naviga intre rezultate')}</li>
          </ul>
        </Box>

        <p className="font-bold mt-3">{t('iii) which — find the path of a command:', 'iii) which — aflati calea unei comenzi:')}</p>
        <Code>{`$ which mkdir
/bin/mkdir`}</Code>

        <p className="font-bold mt-3">{t('iv) whereis — find binary, source, and man pages:', 'iv) whereis — gasiti executabilul, sursa si paginile de manual:')}</p>
        <Code>{`$ whereis mkdir
mkdir: /bin/mkdir /usr/share/man/man2/mkdir.2.gz /usr/share/man/man1/mkdir.1.gz`}</Code>

        <p className="font-bold mt-3">{t('v) apropos — search by keyword in manual descriptions:', 'v) apropos — cautati dupa cuvinte cheie in descrierile manualelor:')}</p>
        <Code>{`$ apropos -a copy file`}</Code>
        <Toggle
          question={t('Show output of apropos -a copy file', 'Arata output-ul comenzii apropos -a copy file')}
          answer={
            <Code>{`cp (1)               - copy files and directories
cpio (1)             - copy files to and from archives
dd (1)               - convert and copy a file
install (1)          - copy files and set attributes
rsync (1)            - a fast, versatile, remote (and local) file-copying tool
scp (1)              - secure copy (remote file copy program)
...`}</Code>
          }
          showLabel={t('Show output', 'Arată output')}
          hideLabel={t('Hide', 'Ascunde')}
        />
        <p className="text-sm mt-1">{t(
          'The -a (--and) flag requires ALL keywords to appear in the description. Without it, results matching ANY keyword are shown.',
          'Optiunea -a (--and) cere ca TOATE cuvintele cheie sa apara in descriere. Fara ea, se afiseaza rezultatele ce contin ORICARE cuvant.'
        )}</p>

        <Box type="definition">
          <p className="font-bold text-sm">{t('The 8 man page sections:', 'Cele 8 sectiuni ale paginilor de manual:')}</p>
          <ol className="list-decimal pl-5 text-sm mt-1 space-y-0.5">
            <li>{t('User commands (ls, cp, ...)', 'Comenzi utilizator (ls, cp, ...)')}</li>
            <li>{t('System calls (POSIX API)', 'Apeluri de sistem (API-ul POSIX)')}</li>
            <li>{t('C library functions (libc)', 'Functii din biblioteca C (libc)')}</li>
            <li>{t('Device files (/dev/*)', 'Fisiere de dispozitiv (/dev/*)')}</li>
            <li>{t('File formats and filesystems', 'Formate de fisiere si sisteme de fisiere')}</li>
            <li>{t('Games and amusements', 'Jocuri si amuzamente')}</li>
            <li>{t('Overviews, conventions, standards', 'Rezumate, conventii, standarde')}</li>
            <li>{t('Superuser commands (admin)', 'Comenzi superutilizator (admin)')}</li>
          </ol>
        </Box>
      </Section>

      {/* ── Exercise 2: Creating Files & Directories ── */}
      <Section title={t('2. Creating Files & Directories', '2. Crearea fisierelor si directoarelor')} id="s1-create" checked={!!checked['s1-create']} onCheck={() => toggleCheck('s1-create')}>
        <p>{t(
          'Write commands to create various types of files: directories, regular files, and links.',
          'Scrieti comenzile care creaza diferite tipuri de fisiere: directoare, fisiere obisnuite si link-uri.'
        )}</p>

        <p className="font-bold mt-3">{t('i) Creating directories with mkdir:', 'i) Crearea directoarelor cu mkdir:')}</p>
        <p className="text-sm">{t(
          'Create d1 in home, d2 and d3 inside d1, and d4 inside d2.',
          'Creati d1 in directorul acasa, d2 si d3 in d1, si d4 in d2.'
        )}</p>

        <Toggle
          question={t('Show solutions for creating directories', 'Arată solutiile pentru crearea directoarelor')}
          answer={
            <div>
              <p className="text-sm font-bold">{t('Solution 1 — changing directories repeatedly:', 'Solutia 1 — cu schimbarea repetata a directorului curent:')}</p>
              <Code>{`cd
mkdir d1
cd d1
mkdir d2 d3
cd d2
mkdir d4
cd
ls -R d1`}</Code>
              <p className="text-sm font-bold mt-2">{t('Solution 2 — using paths (no cd):', 'Solutia 2 — folosind cai (fara cd):')}</p>
              <Code>{`cd
mkdir d1 d1/d2 d1/d3 d1/d2/d4
ls -R d1/`}</Code>
              <p className="text-sm font-bold mt-2">{t('Solution 3 — using mkdir -p (create parents automatically):', 'Solutia 3 — folosind mkdir -p (creeaza automat directoarele parinte):')}</p>
              <Code>{`cd
mkdir -p d1/d3
mkdir --parents d1/d2/d4
ls -R d1`}</Code>
            </div>
          }
          showLabel={t('Show solutions', 'Arată solutiile')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <p className="font-bold mt-3">{t('ii) Creating regular files with touch:', 'ii) Crearea fisierelor obisnuite cu touch:')}</p>
        <p className="text-sm">{t(
          'Create p1.c and p2.c in d1, p3.c and p4.cpp in d1/d2, p5.c and p6.h in d1/d2/d4.',
          'Creati p1.c si p2.c in d1, p3.c si p4.cpp in d1/d2, p5.c si p6.h in d1/d2/d4.'
        )}</p>

        <Code>{`cd
touch d1/p1.c d1/p2.c
touch d1/d2/p3.c d1/d2/p4.cpp d1/d2/d4/p5.c d1/d2/d4/p6.h
ls -lR d1/`}</Code>

        <p className="font-bold mt-3">{t('iii) Creating links with ln:', 'iii) Crearea link-urilor cu ln:')}</p>
        <p className="text-sm">{t(
          'Create a hard link "hardlnk1" and a symbolic link "symlnk2" in d1/d2, both pointing to d1/15lines.txt.',
          'Creati un link hard "hardlnk1" si un link simbolic "symlnk2" in d1/d2, ambele catre d1/15lines.txt.'
        )}</p>

        <Code>{`cd
ln d1/15lines.txt d1/d2/hardlnk1          # hard link
ln -s ../15lines.txt d1/d2/symlnk2        # symbolic link
ls -lR d1`}</Code>

        <Box type="warning">
          <p className="text-sm">{t(
            'For symbolic links, the target path must be relative to the directory where the symlink is created, NOT relative to your current working directory!',
            'Pentru link-urile simbolice, calea target-ului trebuie specificata relativ la directorul in care se va crea acel link simbolic, NU relativ la directorul curent de lucru!'
          )}</p>
        </Box>

        <Box type="definition">
          <p className="text-sm">{t(
            'Every file has at least one name. Additional names (hard links) are true aliases — the OS sees no difference between the original name and later hard links. You can access the file through any of its names: cat d1/15lines.txt, cat d1/d2/hardlnk1, cat d1/d2/symlnk2.',
            'Orice fisier are cel putin un nume. Numele suplimentare (link-uri hard) sunt aliasuri adevarate — sistemul de operare nu vede nicio diferenta intre numele original si link-urile hard create ulterior. Puteți accesa fisierul prin oricare dintre numele sale: cat d1/15lines.txt, cat d1/d2/hardlnk1, cat d1/d2/symlnk2.'
          )}</p>
        </Box>
      </Section>

      {/* ── Exercise 3: Copy, Move, Delete ── */}
      <Section title={t('3. Copy, Move & Delete Files', '3. Copierea, mutarea si stergerea fisierelor')} id="s1-cpmvrm" checked={!!checked['s1-cpmvrm']} onCheck={() => toggleCheck('s1-cpmvrm')}>
        <p className="text-sm mb-2">{t(
          'These exercises reuse the directory structure created in Exercise 2.',
          'Aceste exercitii reutilizeaza structura de directoare creata in Exercitiul 2.'
        )}</p>

        <p className="font-bold">{t('i) Copying with cp:', 'i) Copierea cu cp:')}</p>
        <p className="text-sm">{t(
          'Copy directory d4 into d3 (recursively), and copy p4.cpp into d3 as p4bis.cpp.',
          'Copiati directorul d4 in d3 (recursiv), si copiati p4.cpp in d3 ca p4bis.cpp.'
        )}</p>
        <Code>{`cd
cp -R d1/d2/d4 d1/d3                 # -R: recursive copy (with contents)
cp -i d1/d2/p4.cpp d1/d3/p4bis.cpp   # -i: ask before overwriting
ls -lR d1/`}</Code>

        <p className="font-bold mt-3">{t('ii) Moving and renaming with mv:', 'ii) Mutarea si redenumirea cu mv:')}</p>
        <Code>{`cd
mv -i d1/d3/p4bis.cpp d1/d3/d4/      # move file to another directory
mv -i d1/d3/d4/p5.c d1/d3/d4/p5.cpp  # rename (same directory)
mv -i d1/d3/d4/p6.h d1/d2/p6bis.h    # move + rename
ls -lR d1/`}</Code>

        <p className="font-bold mt-3">{t('iii) Deleting with rm and rmdir:', 'iii) Stergerea cu rm si rmdir:')}</p>

        <Toggle
          question={t('Show solutions for deleting d1/d3/d4', 'Arată solutiile pentru stergerea d1/d3/d4')}
          answer={
            <div>
              <p className="text-sm font-bold">{t('Solution 1 — manual (empty directory first):', 'Solutia 1 — manuala (goliti directorul intai):')}</p>
              <Code>{`rmdir d1/d3/d4          # ERROR: directory not empty!
ls -R d1/d3/d4          # see what's inside
rm d1/d3/d4/p5.cpp      # delete files one by one
rm d1/d3/d4/p4bis.cpp
rmdir d1/d3/d4          # now it works`}</Code>
              <p className="text-sm font-bold mt-2">{t('Solution 2 — recursive delete:', 'Solutia 2 — stergere recursiva:')}</p>
              <Code>{`rm -R -i d1/d3/d4/   # -R: recursive, -i: ask for each file`}</Code>
            </div>
          }
          showLabel={t('Show solutions', 'Arată solutiile')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Box type="warning">
          <p className="text-sm">{t(
            'rmdir only works on empty directories. Use rm -R to delete a directory and all its contents. Always use -i (interactive) for safety — it asks for confirmation before deleting each file.',
            'rmdir functioneaza doar pe directoare goale. Folositi rm -R pentru a sterge un director cu tot continutul. Folositi intotdeauna -i (interactiv) pentru siguranta — cere confirmare inainte de stergerea fiecarui fisier.'
          )}</p>
        </Box>
      </Section>

      {/* ── Exercise 4: Viewing File Contents ── */}
      <Section title={t('4. Viewing File Contents', '4. Vizualizarea continutului fisierelor')} id="s1-view" checked={!!checked['s1-view']} onCheck={() => toggleCheck('s1-view')}>
        <p>{t(
          'Various commands for displaying file content, each suited for different situations.',
          'Diverse comenzi pentru afisarea continutului fisierelor, fiecare potrivita pentru situatii diferite.'
        )}</p>

        <p className="font-bold mt-3">{t('i) cat and tac — display entire file:', 'i) cat si tac — afisarea intregului fisier:')}</p>
        <Code>{`cat d1/15lines.txt      # display in natural order
tac d1/15lines.txt      # display in reverse line order
cat -n d1/15lines.txt   # display with line numbers`}</Code>

        <p className="font-bold mt-3">{t('ii) more and less — paged viewing:', 'ii) more si less — vizualizare paginata:')}</p>
        <Code>{`more /etc/passwd    # forward-only paging (SPACE = next page, Q = quit)
less /etc/passwd    # bidirectional (PgUp/PgDn, Up/Down, Q = quit)`}</Code>

        <Box type="definition">
          <p className="text-sm">{t(
            'The /etc/passwd file contains user account info. Each line has the format: username:x:UID:GID:personal_data:home_directory:login_shell',
            'Fisierul /etc/passwd contine informatii despre conturile de utilizatori. Fiecare linie are formatul: username:x:UID:GID:date_personale:director_acasa:shell_login'
          )}</p>
        </Box>

        <p className="font-bold mt-3">{t('iii) head and tail — display parts of a file:', 'iii) head si tail — afisarea unor parti din fisier:')}</p>
        <Code>{`head d1/15lines.txt        # first 10 lines (default)
head -n 5 d1/15lines.txt   # first 5 lines
head -n -5 d1/15lines.txt  # all lines EXCEPT the last 5

tail d1/15lines.txt        # last 10 lines (default)
tail -n 5 d1/15lines.txt   # last 5 lines
tail -n +5 d1/15lines.txt  # all lines starting from line 5`}</Code>

        <Box type="warning">
          <p className="text-sm">{t(
            'head -n -5 means "all lines except the last 5" (not "last 5 lines"). tail -n +5 means "starting from line 5" (not "last 5 lines"). The sign changes the meaning!',
            'head -n -5 inseamna "toate liniile exceptand ultimele 5" (nu "ultimele 5 linii"). tail -n +5 inseamna "incepand de la linia 5" (nu "ultimele 5 linii"). Semnul schimba semnificatia!'
          )}</p>
        </Box>
      </Section>

      {/* ── Exercise 5: File Metadata ── */}
      <Section title={t('5. File Information (file, stat)', '5. Informatii despre fisiere (file, stat)')} id="s1-meta" checked={!!checked['s1-meta']} onCheck={() => toggleCheck('s1-meta')}>
        <p className="font-bold">{t('i) file — determine content type:', 'i) file — determinati tipul de continut:')}</p>
        <Code>{`file /etc/passwd                          # ASCII text
file /usr/bin/write                      # symbolic link...
file -L /usr/bin/write                   # -L: follow symlinks
file /usr/share/man/man1/write.1.gz      # gzip compressed data
file /etc                                # directory`}</Code>
        <p className="text-sm mt-1">{t(
          'Useful options: -b (brief, no filename prefix), -F (custom separator instead of ":").',
          'Optiuni utile: -b (scurt, fara prefixul cu numele fisierului), -F (separator personalizat in loc de ":").'
        )}</p>

        <p className="font-bold mt-3">{t('ii) stat — view file metadata:', 'ii) stat — vizualizarea metadatelor:')}</p>
        <Code>{`stat /etc/passwd`}</Code>
        <Toggle
          question={t('Show example stat output', 'Arată exemplu de output stat')}
          answer={
            <Code>{`  File: '/etc/passwd'
  Size: 2541         Blocks: 8          IO Block: 4096   regular file
Device: fd05h/64773d Inode: 1049137     Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2020-02-21 13:14:54.414890033 +0200
Modify: 2020-02-21 13:12:38.780513539 +0200
Change: 2020-02-21 13:14:03.775005209 +0200
Birth: -`}</Code>
          }
          showLabel={t('Show output', 'Arată output')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <p className="text-sm mt-2">{t('Custom format with stat:', 'Format personalizat cu stat:')}</p>
        <Code>{`stat -c "%A %s %y %n" /etc/passwd
# %A = permissions (symbolic), %s = size (bytes), %y = modify time, %n = name

stat --format="%A %s %y %n" /etc/passwd   # equivalent long option`}</Code>
      </Section>

      {/* ── Exercise 6: Permissions ── */}
      <Section title={t('6. Permissions (chmod, chown)', '6. Permisiuni (chmod, chown)')} id="s1-perms" checked={!!checked['s1-perms']} onCheck={() => toggleCheck('s1-perms')}>
        <p>{t(
          'View and modify file metadata. Some metadata can only be changed indirectly (Size changes when you add content, Inode changes when moving across partitions).',
          'Vizualizati si modificati metadatele fisierelor. Unele metadate pot fi modificate doar indirect (Size se schimba cand adaugati continut, Inode se schimba la mutarea intre partitii).'
        )}</p>

        <Box type="definition">
          <p className="font-bold text-sm">{t('Directly modifiable metadata:', 'Metadate modificabile direct:')}</p>
          <ul className="list-disc pl-5 text-sm mt-1 space-y-0.5">
            <li><strong>File</strong> {t('(name) — change with', '(nume) — modificati cu')} <code>mv</code></li>
            <li><strong>Access</strong> {t('(permissions) — change with', '(permisiuni) — modificati cu')} <code>chmod</code></li>
            <li><strong>Uid/Gid</strong> {t('(owner/group) — change with', '(proprietar/grup) — modificati cu')} <code>chown</code>, <code>chgrp</code></li>
            <li><strong>Access/Modify</strong> {t('(timestamps) — change with', '(marcile de timp) — modificati cu')} <code>touch</code></li>
          </ul>
        </Box>

        <p className="font-bold mt-3">{t('chmod — symbolic notation:', 'chmod — notatie simbolica:')}</p>
        <Code>{`chmod ug+x d1/15lines.txt
# Add (+) execute (x) for owner (u) and group (g). Other 7 bits unchanged.

chmod o-r d1/15lines.txt
# Remove (-) read (r) for others (o). Other 8 bits unchanged.`}</Code>

        <p className="font-bold mt-3">{t('chmod — octal notation:', 'chmod — notatie octala:')}</p>
        <Code>{`chmod 741 d1/15lines.txt
# Sets ALL 9 permission bits at once:
# 7 = rwx (owner), 4 = r-- (group), 1 = --x (others)`}</Code>

        <Box type="warning">
          <p className="text-sm">{t(
            'Symbolic notation (+/-) modifies specific bits while leaving others unchanged. Octal notation replaces ALL 9 bits at once. Use symbolic when you want to tweak one permission; use octal when you want to set the exact final state.',
            'Notatia simbolica (+/-) modifica biti specifici lasandu-i pe ceilalti neschimbati. Notatia octala inlocuieste TOTI cei 9 biti simultan. Folositi simbolica cand vreti sa ajustati o permisiune; folositi octala cand vreti sa setati starea finala exacta.'
          )}</p>
        </Box>
      </Section>

      {/* ── Exercise 7: cut ── */}
      <Section title={t('7. Text Selection with cut', '7. Selectia textului cu cut')} id="s1-cut" checked={!!checked['s1-cut']} onCheck={() => toggleCheck('s1-cut')}>
        <p>{t(
          'Problem: Display the username and UID of all system users.',
          'Problema: Afisati numele de cont si UID-urile tuturor utilizatorilor sistemului.'
        )}</p>
        <p className="text-sm mb-2">{t(
          'Hint: use the cut command with /etc/passwd.',
          'Indicatie: folositi comanda cut si informatiile din fisierul /etc/passwd.'
        )}</p>

        <Toggle
          question={t('Show solutions', 'Arată solutiile')}
          answer={
            <div>
              <Code>{`cut -f1,3 -d: /etc/passwd`}</Code>
              <p className="text-sm mt-2">{t('Alternative forms (all equivalent):', 'Forme alternative (toate echivalente):')}</p>
              <Code>{`cut -f 1,3 -d : /etc/passwd          # spaces between options and values
cut -d: /etc/passwd -f1,3             # options can go in any order
cut --fields=1,3 --delimiter=: /etc/passwd   # long option form`}</Code>
            </div>
          }
          showLabel={t('Show solutions', 'Arată solutiile')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Box type="definition">
          <p className="font-bold text-sm">{t('Key cut options:', 'Optiuni importante ale comenzii cut:')}</p>
          <ul className="list-disc pl-5 text-sm mt-1 space-y-0.5">
            <li><code>-f</code> / <code>--fields</code> {t('— select fields (columns)', '— selecteaza campuri (coloane)')}</li>
            <li><code>-d</code> / <code>--delimiter</code> {t('— field separator character', '— caracterul separator intre campuri')}</li>
            <li><code>-b</code> / <code>--bytes</code> {t('— select by byte position (fixed-width)', '— selectie dupa pozitia in octeti (latime fixa)')}</li>
            <li><code>-c</code> / <code>--characters</code> {t('— select by character position', '— selectie dupa pozitia caracterului')}</li>
            <li><code>--complement</code> {t('— output everything EXCEPT the selected fields', '— afiseaza tot in AFARA campurilor selectate')}</li>
            <li><code>--output-delimiter</code> {t('— replace the delimiter in output', '— inlocuieste delimitatorul in output')}</li>
          </ul>
        </Box>

        <Box type="warning">
          <p className="text-sm">{t(
            'When using long options (--fields, --delimiter), you MUST include = or a space between the option name and its value. Writing --fields1,3 or --delimiter: will cause an error!',
            'Cand folositi optiuni lungi (--fields, --delimiter), TREBUIE sa includeti = sau un spatiu intre numele optiunii si valoarea sa. Scrierea --fields1,3 sau --delimiter: va cauza o eroare!'
          )}</p>
        </Box>
      </Section>

      {/* ── Exercise 8: grep ── */}
      <Section title={t('8. Text Searching with grep', '8. Cautarea textului cu grep')} id="s1-grep" checked={!!checked['s1-grep']} onCheck={() => toggleCheck('s1-grep')}>
        <p>{t(
          'Problem: Select from /etc/passwd only the information about a specific user.',
          'Problema: Selectati din /etc/passwd doar informatiile despre un utilizator specificat.'
        )}</p>

        <Code>{`grep username /etc/passwd`}</Code>
        <p className="text-sm mt-1">{t(
          'Note: the order of arguments matters for grep! The pattern always comes before the filename.',
          'Nota: ordinea argumentelor conteaza la grep! Sablonul vine intotdeauna inaintea numelui fisierului.'
        )}</p>

        <Box type="definition">
          <p className="font-bold text-sm">{t('Key grep options:', 'Optiuni importante ale comenzii grep:')}</p>
          <ul className="list-disc pl-5 text-sm mt-1 space-y-0.5">
            <li><code>-c</code> / <code>--count</code> {t('— show only the count of matching lines', '— afiseaza doar numarul de linii gasite')}</li>
            <li><code>-w</code> / <code>--word-regexp</code> {t('— match whole words only (not substrings)', '— potrivire doar pe cuvinte intregi (nu sub-cuvinte)')}</li>
            <li><code>-v</code> / <code>--invert-match</code> {t('— show lines that do NOT match', '— afiseaza liniile care NU se potrivesc')}</li>
            <li><code>-i</code> / <code>--ignore-case</code> {t('— case-insensitive matching', '— potrivire fara a tine cont de majuscule/minuscule')}</li>
            <li><code>-o</code> / <code>--only-matching</code> {t('— show only the matching part of each line', '— afiseaza doar partea potrivita din fiecare linie')}</li>
            <li><code>-E</code> / <code>--extended-regexp</code> {t('— use extended regex (default is basic regex)', '— folositi expresii regulate extinse (implicit sunt simple)')}</li>
            <li><code>-F</code> / <code>--fixed-strings</code> {t('— treat pattern as literal string, not regex', '— trateaza sablonul ca sir constant, nu expresie regulata')}</li>
            <li><code>-q</code> / <code>--quiet</code> {t('— no output, just return exit code (0=found, 1=not found)', '— fara output, returneaza doar codul de iesire (0=gasit, 1=negasit)')}</li>
          </ul>
        </Box>
      </Section>

      {/* ── Exercise 9: sort ── */}
      <Section title={t('9. Sorting with sort', '9. Sortarea cu sort')} id="s1-sort" checked={!!checked['s1-sort']} onCheck={() => toggleCheck('s1-sort')}>
        <p className="font-bold">{t('Exercise A: Sort /etc/passwd in reverse order and save to file.', 'Exercitiul A: Sortati /etc/passwd in ordine inversa si salvati in fisier.')}</p>
        <Code>{`sort -r /etc/passwd -o output.txt
# -r: reverse order, -o: output file

# Equivalent using output redirection:
sort -r /etc/passwd > output.txt`}</Code>

        <Box type="warning">
          <p className="text-sm">{t(
            'Be careful with -o placement! "sort /etc/passwd -o -r output.txt" would try to save to /etc/passwd (the file after -o), not to output.txt. The -o option takes the NEXT word as its value.',
            'Atentie la plasarea lui -o! "sort /etc/passwd -o -r output.txt" ar incerca sa salveze in /etc/passwd (fisierul dupa -o), nu in output.txt. Optiunea -o ia urmatorul cuvant ca valoare.'
          )}</p>
        </Box>

        <p className="font-bold mt-4">{t('Exercise B: Sort /etc/passwd numerically by UID (field 3).', 'Exercitiul B: Sortati /etc/passwd numeric dupa UID (campul 3).')}</p>
        <Code>{`sort -n -t: -k3 /etc/passwd
# -n: numeric sort, -t: field delimiter (colon), -k3: sort by field 3

# Equivalent with long options:
sort --numeric-sort --key=3 --field-separator=: /etc/passwd`}</Code>
      </Section>

      {/* ── Exercise 10: wc ── */}
      <Section title={t('10. Counting with wc', '10. Numararea cu wc')} id="s1-wc" checked={!!checked['s1-wc']} onCheck={() => toggleCheck('s1-wc')}>
        <p>{t(
          'Problem: How many user accounts and how many groups exist on the system?',
          'Problema: Cate conturi de utilizatori si cate grupuri de utilizatori exista pe sistem?'
        )}</p>

        <p className="text-sm mb-2">{t(
          'Since /etc/passwd has one user per line and /etc/group has one group per line, we just need to count lines:',
          'Deoarece /etc/passwd contine cate un utilizator pe fiecare linie si /etc/group contine cate un grup pe fiecare linie, trebuie doar sa numaram liniile:'
        )}</p>

        <Code>{`wc -l /etc/passwd /etc/group`}</Code>

        <Box type="definition">
          <p className="text-sm">{t(
            'wc (word count) counts lines (-l), words (-w), characters (-c), or bytes (default: all three). When given multiple files, it also prints a total.',
            'wc (word count) numara linii (-l), cuvinte (-w), caractere (-c) sau octeti (implicit: toate trei). Cand primeste mai multe fisiere, afiseaza si un total.'
          )}</p>
        </Box>

        <Toggle
          question={t('Alternative: count users from /home directories', 'Alternativa: numarati utilizatorii din directoarele /home')}
          answer={
            <div>
              <p className="text-sm">{t(
                'On systems using centralized authentication (LDAP), /etc/passwd may not list all users. An alternative approach:',
                'Pe sisteme cu autentificare centralizata (LDAP), /etc/passwd poate sa nu listeze toti utilizatorii. O abordare alternativa:'
              )}</p>
              <Code>{`ls -1 /home/ | wc -l`}</Code>
            </div>
          }
          showLabel={t('Show alternative', 'Arată alternativa')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── Exercise 11: find ── */}
      <Section title={t('11. Finding Files with find', '11. Cautarea fisierelor cu find')} id="s1-find" checked={!!checked['s1-find']} onCheck={() => toggleCheck('s1-find')}>
        <p className="font-bold">{t('Exercise A: Traverse a directory recursively and display permissions of all files.', 'Exercitiul A: Parcurgeti recursiv un director si afisati permisiunile tuturor fisierelor.')}</p>

        <Toggle
          question={t('Show solutions', 'Arată solutiile')}
          answer={
            <div>
              <p className="text-sm font-bold">{t('Solution 1 — using -printf (most efficient):', 'Solutia 1 — folosind -printf (cea mai eficienta):')}</p>
              <Code>{`find /path/to/dir -printf "%m : %p\\n"    # %m = octal permissions
find /path/to/dir -printf "%M : %p\\n"    # %M = symbolic permissions (rwx)`}</Code>
              <p className="text-sm font-bold mt-2">{t('Solution 2 — using -exec stat (one stat per file):', 'Solutia 2 — folosind -exec stat (un stat per fisier):')}</p>
              <Code>{`find /path/to/dir -exec stat --format="%a %n" \\{} \\;    # octal
find /path/to/dir -exec stat -c "%A %n" \\{} \\;          # symbolic`}</Code>
              <p className="text-sm font-bold mt-2">{t('Solution 3 — optimized -exec (one stat call for all files):', 'Solutia 3 — -exec optimizat (un singur apel stat pentru toate fisierele):')}</p>
              <Code>{`find /path/to/dir -exec stat --format="%a %n" \\{} +
# Uses + instead of \\; — passes ALL found files to a single stat call`}</Code>
            </div>
          }
          showLabel={t('Show solutions', 'Arată solutiile')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Box type="definition">
          <p className="text-sm">{t(
            'Performance difference: -printf is built into find and is the fastest. -exec ... \\; spawns a new process for each file. -exec ... + batches files into a single process call — much faster than \\; for large directories.',
            'Diferenta de performanta: -printf este incorporat in find si este cel mai rapid. -exec ... \\; lanseaza un proces nou pentru fiecare fisier. -exec ... + grupeaza fisierele intr-un singur apel — mult mai rapid decat \\; pentru directoare mari.'
          )}</p>
        </Box>

        <p className="font-bold mt-4">{t('Exercise B: Find all files whose name starts OR ends with "a", displaying name, modification date, and size.', 'Exercitiul B: Gasiti toate fisierele al caror nume incepe SAU se termina cu "a", afisand numele, data modificarii si dimensiunea.')}</p>

        <Code>{`find /path/to/dir \\( -name "a*" -o -name "*a" \\) -printf "%p : %t : %k KB\\n"`}</Code>

        <Box type="warning">
          <p className="text-sm">{t(
            'Parentheses are essential here! Without them, the -printf would only apply to the second -name test (due to left-to-right evaluation with equal precedence). Files matching the first test would produce no output.',
            'Parantezele sunt esentiale aici! Fara ele, -printf s-ar aplica doar pe al doilea test -name (din cauza evaluarii stanga-dreapta cu precedenta egala). Fisierele care corespund primului test nu ar produce niciun output.'
          )}</p>
        </Box>

        <Toggle
          question={t('Why is this WRONG without parentheses?', 'De ce este GRESIT fara paranteze?')}
          answer={
            <div>
              <Code>{`# WRONG — do not use:
find dir -name "a*" -o -name "*a" -printf "%p : %t : %k KB\\n"`}</Code>
              <p className="text-sm mt-2">{t(
                'Without parentheses, the expression is evaluated as: (-name "a*") OR ((-name "*a") AND (-printf ...)). When a file matches -name "a*", the OR is already true and -printf is never reached. Only files matching "*a" get printed.',
                'Fara paranteze, expresia se evalueaza ca: (-name "a*") SAU ((-name "*a") SI (-printf ...)). Cand un fisier se potriveste cu -name "a*", SAU-ul este deja adevarat si -printf nu se mai executa. Doar fisierele care se potrivesc cu "*a" sunt afisate.'
              )}</p>
            </div>
          }
          showLabel={t('Show explanation', 'Arată explicatia')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Box type="definition">
          <p className="font-bold text-sm">{t('find logical operators:', 'Operatori logici in find:')}</p>
          <ul className="list-disc pl-5 text-sm mt-1 space-y-0.5">
            <li><code>-a</code> / <code>-and</code> {t('— logical AND (implicit between expressions)', '— SI logic (implicit intre expresii)')}</li>
            <li><code>-o</code> / <code>-or</code> {t('— logical OR (short-circuit: if left is true, right is skipped)', '— SAU logic (scurt-circuit: daca stanga e adevarat, dreapta este omisa)')}</li>
            <li><code>\\( ... \\)</code> {t('— grouping (must escape parentheses from the shell!)', '— grupare (trebuie sa protejati parantezele de shell!)')}</li>
          </ul>
          <p className="text-sm mt-1">{t(
            'Remember to escape special characters: * { } ; ( ) — otherwise bash interprets them before find sees them!',
            'Nu uitati sa protejati caracterele speciale: * { } ; ( ) — altfel bash le interpreteaza inainte ca find sa le vada!'
          )}</p>
        </Box>
      </Section>
    </>
  );
}
