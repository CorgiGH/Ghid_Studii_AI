import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';
import TerminalChallenge from '../../../components/ui/TerminalChallenge';

export default function Lab01() {
  const { t, lang, checked, toggleCheck } = useApp();

  // ── Interactive terminal exercises (filesystem manipulation) ──────────
  const terminalExercises = [
    {
      description: t(
        'Create a subdirectory "programe" in your home directory (~). Then inside it, create "tema1" and "tema2" subdirectories. Inside "tema2", create "sub-temaA", then rename it to "tema2_sub-temaA".',
        'Creați un subdirector "programe" în directorul acasă (~). Apoi în el, creați subdirectoarele "tema1" și "tema2". În "tema2", creați "sub-temaA", apoi redenumiți-l în "tema2_sub-temaA".'
      ),
      courseRef: t('Course 1: Directory commands', 'Cursul 1: Comenzi directoare'),
      files: {},
      checkScript: 'test -d /root/programe && test -d /root/programe/tema1 && test -d /root/programe/tema2 && test -d /root/programe/tema2/tema2_sub-temaA',
      hints: [
        t('Use "mkdir" to create directories', 'Folosiți "mkdir" pentru a crea directoare'),
        t('Use "mv old new" to rename', 'Folosiți "mv vechi nou" pentru a redenumi'),
        t('You can create nested dirs: mkdir -p a/b/c', 'Puteți crea directoare imbricate: mkdir -p a/b/c'),
      ],
      solution: 'mkdir programe\nmkdir programe/tema1\nmkdir programe/tema2\nmkdir programe/tema2/sub-temaA\nmv programe/tema2/sub-temaA programe/tema2/tema2_sub-temaA',
    },
    {
      description: t(
        'In ~/programe, create files: program1.c, program2.c, program2.h. In ~/programe/tema1, create tema1-1.c and tema1-2.c. In ~/programe/tema2/tema2_sub-temaA, create sub-temaA1.c and sub-temaA2.cpp.',
        'În ~/programe, creați fișierele: program1.c, program2.c, program2.h. În ~/programe/tema1, creați tema1-1.c și tema1-2.c. În ~/programe/tema2/tema2_sub-temaA, creați sub-temaA1.c și sub-temaA2.cpp.'
      ),
      courseRef: t('Course 1: File commands', 'Cursul 1: Comenzi fișiere'),
      files: {
        '/root/programe': null,
        '/root/programe/tema1': null,
        '/root/programe/tema2': null,
        '/root/programe/tema2/tema2_sub-temaA': null,
      },
      checkScript: 'test -f /root/programe/program1.c && test -f /root/programe/program2.c && test -f /root/programe/program2.h && test -f /root/programe/tema1/tema1-1.c && test -f /root/programe/tema1/tema1-2.c && test -f /root/programe/tema2/tema2_sub-temaA/sub-temaA1.c && test -f /root/programe/tema2/tema2_sub-temaA/sub-temaA2.cpp',
      hints: [
        t('Use "touch filename" to create empty files', 'Folosiți "touch fisier" pentru a crea fișiere goale'),
        t('You can create multiple files: touch a.c b.c c.h', 'Puteți crea mai multe fișiere: touch a.c b.c c.h'),
      ],
      solution: 'touch programe/program1.c programe/program2.c programe/program2.h\ntouch programe/tema1/tema1-1.c programe/tema1/tema1-2.c\ntouch programe/tema2/tema2_sub-temaA/sub-temaA1.c programe/tema2/tema2_sub-temaA/sub-temaA2.cpp',
    },
    {
      description: t(
        'Copy ~/programe/tema1/tema1-1.c to ~/programe/tema2/ as "tema2-1.c". Move ~/programe/tema1/tema1-2.c to ~/programe/tema2/ as "tema2-2.c". Then delete the temp/ directory.',
        'Copiați ~/programe/tema1/tema1-1.c în ~/programe/tema2/ ca "tema2-1.c". Mutați ~/programe/tema1/tema1-2.c în ~/programe/tema2/ ca "tema2-2.c". Apoi ștergeți directorul temp/.'
      ),
      courseRef: t('Course 1: cp, mv, rm', 'Cursul 1: cp, mv, rm'),
      files: {
        '/root/programe': null,
        '/root/programe/tema1': null,
        '/root/programe/tema1/tema1-1.c': '// tema1-1',
        '/root/programe/tema1/tema1-2.c': '// tema1-2',
        '/root/programe/tema2': null,
        '/root/temp': null,
        '/root/temp/scratch.txt': 'temporary data',
      },
      checkScript: 'test -f /root/programe/tema2/tema2-1.c && grep -q "tema1" /root/programe/tema2/tema2-1.c && test -f /root/programe/tema2/tema2-2.c && ! test -d /root/temp',
      hints: [
        t('"cp source dest" copies a file', '"cp sursa dest" copiază un fișier'),
        t('"mv source dest" moves/renames a file', '"mv sursa dest" mută/redenumește un fișier'),
        t('"rm -r dir" removes a directory recursively', '"rm -r dir" șterge un director recursiv'),
      ],
      solution: 'cp programe/tema1/tema1-1.c programe/tema2/tema2-1.c\nmv programe/tema1/tema1-2.c programe/tema2/tema2-2.c\nrm -r temp',
    },
    {
      description: t(
        'The file server.log contains system messages. Use grep to find all lines containing "error" (case-insensitive). Then use wc to count how many lines the file has.',
        'Fișierul server.log conține mesaje de sistem. Folosiți grep pentru a găsi toate liniile ce conțin "error" (case-insensitive). Apoi folosiți wc pentru a număra câte linii are fișierul.'
      ),
      courseRef: t('Course 1: grep, wc', 'Cursul 1: grep, wc'),
      files: {
        '/root/server.log': 'INFO: Server started on port 8080\nERROR: Connection refused from 192.168.1.5\nINFO: Request received from 10.0.0.1\nerror: failed to parse JSON body\nINFO: Response sent 200 OK\nERROR: Disk space running low\nINFO: Backup completed successfully\nerror: timeout waiting for database\nINFO: Server shutting down gracefully',
      },
      hints: [
        t('"grep -i pattern file" searches case-insensitively', '"grep -i pattern file" caută fără a ține cont de litere mari/mici'),
        t('"wc -l file" counts lines', '"wc -l file" numără liniile'),
      ],
      solution: 'grep -i error server.log\nwc -l server.log',
    },
  ];

  // ── Static exercises (output-based, harder to auto-check) ────────────
  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: OS - Lab #1, Cristian Vidrașcu, UAIC',
          'Sursa: SO - Laborator #1, Cristian Vidrașcu, UAIC'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('Lab #1: Exercises with Simple Commands', 'Laborator #1: Exerciții cu comenzi simple')}
        </p>
        <p className="text-sm">
          {t(
            'This lab covers basic Linux commands: directory operations (mkdir, mv), file operations (touch, ln, cp, rm), metadata inspection (stat, chmod), text processing (cut, grep, wc, sort), and file searching (find).',
            'Acest laborator acoperă comenzi de bază Linux: operații cu directoare (mkdir, mv), operații cu fișiere (touch, ln, cp, rm), inspectarea metadatelor (stat, chmod), procesarea textului (cut, grep, wc, sort) și căutarea fișierelor (find).'
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

      {/* ── Additional static exercises ── */}
      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('Additional Exercises', 'Exerciții suplimentare')}
      </h3>
      <p className="text-sm mb-4 opacity-80">
        {t(
          'These exercises require commands that produce output. Try them on your own system or in the terminal above, then check the solution.',
          'Aceste exerciții necesită comenzi care produc output. Încercați-le pe sistemul propriu sau în terminalul de mai sus, apoi verificați soluția.'
        )}
      </p>

      <Section title={t('cut #2: Display group names and GIDs', 'cut #2: Afișarea numelor și GID-urilor grupurilor')} id="lab_1-ex4" checked={!!checked['lab_1-ex4']} onCheck={() => toggleCheck('lab_1-ex4')}>
        <p>{t('Write the command that displays the names and GIDs of all user groups on the system. Additional: replace ":" with " - " in the output.', 'Scrieți comanda care afișează numele și GID-urile tuturor grupurilor de utilizatori ai sistemului. Suplimentar: înlocuiți ":" cu " - " în output.')}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={<Code>{`cut -d: -f1,3 /etc/group\n# With delimiter replacement:\ncut -d: -f1,3 --output-delimiter=" - " /etc/group`}</Code>} showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('grep #2: Find users in root group', 'grep #2: Găsirea utilizatorilor din grupul root')} id="lab_1-ex5" checked={!!checked['lab_1-ex5']} onCheck={() => toggleCheck('lab_1-ex5')}>
        <p>{t('Write the command that displays information about all users who are members of the root group.', 'Scrieți comanda care afișează informațiile asociate tuturor utilizatorilor care sunt membri ai grupului root.')}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={<><p className="text-sm mb-2">{t('First find root GID from /etc/group, then grep in /etc/passwd:', 'Mai întâi aflați GID-ul root din /etc/group, apoi grep în /etc/passwd:')}</p><Code>{`grep "^root:" /etc/group\n# root:x:0:\n# Then find users with GID 0:\ngrep ":0:" /etc/passwd`}</Code></>} showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('stat #1: Count hard links of a file', 'stat #1: Numărarea link-urilor hard ale unui fișier')} id="lab_1-ex6" checked={!!checked['lab_1-ex6']} onCheck={() => toggleCheck('lab_1-ex6')}>
        <p>{t('Write the command that finds how many synonym names (hard links) a file has.', 'Scrieți comanda care să afle câte nume sinonime (link-uri hard) are un fișier.')}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={<Code>{`stat -c "%h" filename\n# Or with more context:\nstat -c "File: %n  Hard links: %h" filename`}</Code>} showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('wc #2: Count lines and longest line', 'wc #2: Numărarea liniilor și cea mai lungă linie')} id="lab_1-ex7" checked={!!checked['lab_1-ex7']} onCheck={() => toggleCheck('lab_1-ex7')}>
        <p>{t('Write the command that displays how many lines /etc/mtab has and the length of the longest line.', 'Scrieți comanda ce afișează câte linii conține /etc/mtab și lungimea celei mai lungi linii.')}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={<Code>{`wc -lL /etc/mtab`}</Code>} showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('find #3: Files modified in last 2 weeks', 'find #3: Fișiere modificate în ultimele 2 săptămâni')} id="lab_1-ex8" checked={!!checked['lab_1-ex8']} onCheck={() => toggleCheck('lab_1-ex8')}>
        <p>{t('Write the command that displays all regular files you own in your home directory, modified in the last 2 weeks, with permissions and modification date.', 'Scrieți comanda ce afișează toate fișierele de tip normal pe care le dețineți în directorul acasă, modificate în ultimele 2 săptămâni, cu permisiuni și data modificării.')}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={<Code>{`find ~ -type f -mtime -14 -printf "%M %Tc %p\\n"`}</Code>} showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('find #4: Files with owner write+execute', 'find #4: Fișiere cu write+execute pentru proprietar')} id="lab_1-ex9" checked={!!checked['lab_1-ex9']} onCheck={() => toggleCheck('lab_1-ex9')}>
        <p>{t('Write the command that displays all regular files (recursive) where the owner has write AND execute permissions, with last access date and size in bytes.', 'Scrieți comanda ce afișează toate fișierele de tip normal (recursiv) unde proprietarul are drepturi de scriere ȘI execuție, cu data ultimei accesări și dimensiunea în bytes.')}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={<Code>{`find /path -type f -perm -u=wx -printf "%Ac %s %p\\n"`}</Code>} showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('ps #1: List all processes', 'ps #1: Listarea tuturor proceselor')} id="lab_1-ex10" checked={!!checked['lab_1-ex10']} onCheck={() => toggleCheck('lab_1-ex10')}>
        <p>{t('Write the command that displays all processes in the format "username command processID".', 'Scrieți comanda care afișează toate procesele în formatul "username command processID".')}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={<Code>{`ps -eo user,comm,pid`}</Code>} showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* ── Homework ── */}
      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('Homework Exercises', 'Exerciții pentru acasă')}
      </h3>

      <Section title={t('ps #2: Root processes with details', 'ps #2: Procesele root cu detalii')} id="lab_1-hw1" checked={!!checked['lab_1-hw1']} onCheck={() => toggleCheck('lab_1-hw1')}>
        <p>{t('Display all processes running as root (real and effective owner), in format "processID parentID real_userID effective_userID command".', 'Afișați toate procesele ce rulează ca root (proprietarul real și cel efectiv), în formatul "processID parentID real_userID effective_userID command".')}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={<Code>{`ps -eo pid,ppid,ruid,euid,comm | grep root`}</Code>} showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('sort #3: Sort /etc/group by GID descending', 'sort #3: Sortarea /etc/group după GID descrescător')} id="lab_1-hw2" checked={!!checked['lab_1-hw2']} onCheck={() => toggleCheck('lab_1-hw2')}>
        <p>{t('Sort the lines of /etc/group in descending order by GID.', 'Sortați descrescător după GID liniile din /etc/group.')}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={<Code>{`sort -t: -k3 -n -r /etc/group`}</Code>} showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('find #5: Group read+execute permissions', 'find #5: Permisiuni read+execute pentru grup')} id="lab_1-hw3" checked={!!checked['lab_1-hw3']} onCheck={() => toggleCheck('lab_1-hw3')}>
        <p>{t('Display all files and directories (recursive) where the owner group has read and execute permissions, with their access permissions.', 'Afișați toate fișierele și directoarele (recursiv) pentru care grupul proprietarului are drepturi de citire și execuție, cu permisiunile de acces.')}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={<Code>{`find /path -perm -g=rx -printf "%M %p\\n"`}</Code>} showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('find #6: C/C++ source files with sizes', 'find #6: Fișiere sursă C/C++ cu dimensiuni')} id="lab_1-hw4" checked={!!checked['lab_1-hw4']} onCheck={() => toggleCheck('lab_1-hw4')}>
        <p>{t('Display all C/C++ source files (.c, .cpp, .h) you own, with sizes (bytes) and last modification date.', 'Afișați toate fișierele sursă C/C++ (.c, .cpp, .h) pe care le dețineți, cu dimensiunile (bytes) și data ultimei modificări.')}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={<Code>{`find ~ \\( -name "*.c" -o -name "*.cpp" -o -name "*.h" \\) -printf "%s %Tc %p\\n"`}</Code>} showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('find #9: Delete temporary files', 'find #9: Ștergerea fișierelor temporare')} id="lab_1-hw7" checked={!!checked['lab_1-hw7']} onCheck={() => toggleCheck('lab_1-hw7')}>
        <p>{t('Delete all temporary files (names ending with "~" or ".bak") from your home directory, recursively.', 'Ștergeți toate fișierele temporare (nume terminate cu "~" sau ".bak") din directorul home, recursiv.')}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={<Code>{`find ~ \\( -name "*~" -o -name "*.bak" \\) -delete\n# Or with -exec:\nfind ~ \\( -name "*~" -o -name "*.bak" \\) -exec rm {} \\;`}</Code>} showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title={t('find #10: Find all hard link names', 'find #10: Găsirea tuturor numelor hard link')} id="lab_1-hw8" checked={!!checked['lab_1-hw8']} onCheck={() => toggleCheck('lab_1-hw8')}>
        <p>{t('Find and display all synonym names (hard links) of a file, specified by any of its names.', 'Găsiți și afișați toate numele sinonime (link-urile hard) ale unui fișier, specificat prin oricare dintre numele sale.')}</p>
        <Toggle question={t('Solution', 'Soluție')} answer={<Code>{`# Find the inode number first:\nstat -c "%i" filename\n# Then find all files with the same inode:\nfind / -inum <inode_number> 2>/dev/null`}</Code>} showLabel={t('Show Solution', 'Arată soluția')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>
    </>
  );
}
