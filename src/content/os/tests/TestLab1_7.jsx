import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import MultipleChoice from '../../../components/ui/MultipleChoice';
import Toggle from '../../../components/ui/Toggle';
import Code from '../../../components/ui/Code';

/* ─── Section A: Single-answer MCQ (Q1–Q6) ─── */
const sectionA = [
  {
    question: {
      en: '1. Which of the following commands creates a symbolic link named link.c to the file sursa.c?',
      ro: '1. Care dintre următoarele comenzi creează un link simbolic numit link.c către fișierul sursa.c?',
    },
    options: [
      { text: 'a) ln sursa.c link.c', correct: false },
      { text: 'b) ln -s sursa.c link.c', correct: true },
      { text: 'c) ln -h sursa.c link.c', correct: false },
      { text: 'd) cp -s sursa.c link.c', correct: false },
    ],
    explanation: {
      en: 'ln -s creates a symbolic (soft) link. Without -s, ln creates a hard link. -h and cp -s are not standard options for this purpose.',
      ro: 'ln -s creează un link simbolic (soft). Fără -s, ln creează un link hard. -h și cp -s nu sunt opțiuni standard pentru acest scop.',
    },
  },
  {
    question: {
      en: '2. The command chmod 440 program2.h is executed. What permissions will be set on the file program2.h?',
      ro: '2. Se execută comanda chmod 440 program2.h. Ce permisiuni vor fi setate pe fișierul program2.h?',
    },
    options: [
      { text: { en: 'a) read+write for owner, nothing for group and others', ro: 'a) citire+scriere pentru proprietar, nimic pentru grup și alții' }, correct: false },
      { text: { en: 'b) read for owner and group, nothing for others', ro: 'b) citire pentru proprietar și grup, nimic pentru alții' }, correct: true },
      { text: { en: 'c) read+execute for owner and group, nothing for others', ro: 'c) citire+execuție pentru proprietar și grup, nimic pentru alții' }, correct: false },
      { text: { en: 'd) read for all (owner, group, others)', ro: 'd) citire pentru toți (proprietar, grup, alții)' }, correct: false },
    ],
    explanation: {
      en: '4 = read (r=4, w=2, x=1). So 440 = r-- for owner, r-- for group, --- for others.',
      ro: '4 = citire (r=4, w=2, x=1). Deci 440 = r-- pentru proprietar, r-- pentru grup, --- pentru alții.',
    },
  },
  {
    question: {
      en: '3. What does the following command display, if the file test.c has 3 hard links?\nstat --format="%h" test.c',
      ro: '3. Ce afișează comanda de mai jos, dacă fișierul test.c are 3 link-uri hard?\nstat --format="%h" test.c',
    },
    options: [
      { text: 'a) 3', correct: true },
      { text: 'b) test.c', correct: false },
      { text: 'c) -rw-r--r--', correct: false },
      { text: 'd) inode', correct: false },
    ],
    explanation: {
      en: '%h in stat format gives the number of hard links. Since the file has 3 hard links, it displays 3.',
      ro: '%h în formatul stat oferă numărul de link-uri hard. Deoarece fișierul are 3 link-uri hard, afișează 3.',
    },
  },
  {
    question: {
      en: '4. Which of the following commands displays only the number of lines in the file /etc/passwd?',
      ro: '4. Care dintre comenzile de mai jos afișează doar numărul de linii din fișierul /etc/passwd?',
    },
    options: [
      { text: 'a) wc /etc/passwd', correct: false },
      { text: 'b) wc -w /etc/passwd', correct: false },
      { text: 'c) wc -l /etc/passwd', correct: true },
      { text: 'd) wc -c /etc/passwd', correct: false },
    ],
    explanation: {
      en: 'wc -l counts lines. wc (no flags) shows lines, words, and bytes. -w counts words, -c counts bytes.',
      ro: 'wc -l numără liniile. wc (fără opțiuni) afișează linii, cuvinte și octeți. -w numără cuvinte, -c numără octeți.',
    },
  },
  {
    question: {
      en: '5. In a Bash script, the special variable $# contains:',
      ro: '5. Într-un script Bash, variabila specială $# conține:',
    },
    options: [
      { text: { en: 'a) The PID of the current process', ro: 'a) PID-ul procesului curent' }, correct: false },
      { text: { en: 'b) The exit code of the last executed command', ro: 'b) Codul de exit al ultimei comenzi executate' }, correct: false },
      { text: { en: 'c) The number of arguments received by the script', ro: 'c) Numărul de argumente primite de script' }, correct: true },
      { text: { en: 'd) The script name', ro: 'd) Numele scriptului' }, correct: false },
    ],
    explanation: {
      en: '$# = argument count, $$ = current PID, $? = last exit code, $0 = script name.',
      ro: '$# = numărul de argumente, $$ = PID-ul curent, $? = ultimul cod de exit, $0 = numele scriptului.',
    },
  },
  {
    question: {
      en: '6. What POSIX system call is used to position the cursor in an open file, before reading or writing at a specific position?',
      ro: '6. Ce apel de sistem POSIX se folosește pentru a poziționa cursorul într-un fișier deschis, înainte de a citi sau scrie la o anumită poziție?',
    },
    options: [
      { text: 'a) read()', correct: false },
      { text: 'b) seek()', correct: false },
      { text: 'c) lseek()', correct: true },
      { text: 'd) fseek()', correct: false },
    ],
    explanation: {
      en: 'lseek() is the POSIX system call for repositioning the file offset. fseek() is from C stdlib (FILE*), not POSIX low-level I/O.',
      ro: 'lseek() este apelul de sistem POSIX pentru repozitionarea offset-ului fișierului. fseek() este din C stdlib (FILE*), nu I/O POSIX de nivel scăzut.',
    },
  },
];

/* ─── Section B: Multi-answer MCQ (Q7–Q10) ─── */
const sectionB = [
  {
    question: {
      en: '7. Which of the following statements about hard links are true?',
      ro: '7. Care dintre următoarele afirmații despre link-urile hard sunt adevărate?',
    },
    options: [
      { text: { en: 'a) A hard link can span different file systems.', ro: 'a) Un link hard poate traversa sisteme de fișiere diferite.' }, correct: false },
      { text: { en: 'b) Deleting a hard link does not delete the file data if at least one other hard link exists.', ro: 'b) Ștergerea unui link hard nu șterge datele fișierului dacă mai există cel puțin un alt link hard.' }, correct: true },
      { text: { en: 'c) Two hard links of the same file have the same inode number.', ro: 'c) Două link-uri hard ale aceluiași fișier au același număr de inode.' }, correct: true },
      { text: { en: 'd) A hard link can be created for a directory (without special options).', ro: 'd) Un link hard poate fi creat pentru un director (fără opțiuni speciale).' }, correct: false },
    ],
    explanation: {
      en: 'Hard links share the same inode (c) and data persists until all links are removed (b). Hard links cannot cross file systems (a is false) and cannot link directories without special options (d is false).',
      ro: 'Link-urile hard partajează același inode (c) și datele persistă până când toate link-urile sunt eliminate (b). Link-urile hard nu pot traversa sisteme de fișiere (a este fals) și nu pot fi create pentru directoare fără opțiuni speciale (d este fals).',
    },
  },
  {
    question: {
      en: '8. Which of the following commands can be used to display files modified in the last 14 days from the home directory?',
      ro: '8. Care dintre comenzile de mai jos pot fi folosite pentru a afișa fișierele modificate în ultimele 14 zile din directorul home?',
    },
    options: [
      { text: 'a) find ~ -type f -mtime -14', correct: true },
      { text: 'b) find ~ -type f -mtime +14', correct: false },
      { text: 'c) find ~ -type f -mtime -15', correct: false },
      { text: 'd) ls -lt ~', correct: false },
    ],
    explanation: {
      en: '-mtime -14 means modified less than 14 days ago (i.e., within the last 14 days). +14 means more than 14 days ago. ls -lt only lists the current directory sorted by time, not recursively.',
      ro: '-mtime -14 înseamnă modificat cu mai puțin de 14 zile în urmă (adică în ultimele 14 zile). +14 înseamnă acum mai mult de 14 zile. ls -lt listează doar directorul curent sortat după timp, nu recursiv.',
    },
  },
  {
    question: {
      en: '9. Given the following script:\n#!/bin/bash\nx=5\nif [ $x -gt 3 ] && [ $x -lt 10 ]; then\n    echo "DA"\nelse\n    echo "NU"\nfi\nWhich statements are correct?',
      ro: '9. Fie scriptul următor:\n#!/bin/bash\nx=5\nif [ $x -gt 3 ] && [ $x -lt 10 ]; then\n    echo "DA"\nelse\n    echo "NU"\nfi\nCare afirmații sunt corecte?',
    },
    options: [
      { text: { en: 'a) The script displays DA.', ro: 'a) Scriptul afișează DA.' }, correct: true },
      { text: { en: 'b) The construct [ $x -gt 3 ] && [ $x -lt 10 ] is valid in Bash.', ro: 'b) Construcția [ $x -gt 3 ] && [ $x -lt 10 ] este validă în Bash.' }, correct: true },
      { text: { en: 'c) The same result would be obtained by replacing with [[ $x -gt 3 && $x -lt 10 ]].', ro: 'c) Același rezultat s-ar obține înlocuind cu [[ $x -gt 3 && $x -lt 10 ]].' }, correct: true },
      { text: { en: 'd) The script displays NU.', ro: 'd) Scriptul afișează NU.' }, correct: false },
    ],
    explanation: {
      en: 'x=5 satisfies both conditions (5>3 and 5<10), so DA is printed (a). The [ ] && [ ] syntax is valid Bash (b). [[ ]] with && inside also works and gives the same result (c). d is false since DA is printed.',
      ro: 'x=5 satisface ambele condiții (5>3 și 5<10), deci DA este afișat (a). Sintaxa [ ] && [ ] este validă în Bash (b). [[ ]] cu && în interior funcționează și dă același rezultat (c). d este fals deoarece DA este afișat.',
    },
  },
  {
    question: {
      en: '10. Which of the following POSIX system calls are commonly used for file access in C programs (POSIX API)?',
      ro: '10. Care dintre apelurile de sistem POSIX de mai jos sunt folosite în mod uzual pentru accesul la fișiere în programele C (API POSIX)?',
    },
    options: [
      { text: 'a) open()', correct: true },
      { text: 'b) fopen()', correct: false },
      { text: 'c) read()', correct: true },
      { text: 'd) write()', correct: true },
    ],
    explanation: {
      en: 'open(), read(), write() are POSIX system calls. fopen() is a C standard library function (stdio.h), not a POSIX system call.',
      ro: 'open(), read(), write() sunt apeluri de sistem POSIX. fopen() este o funcție din biblioteca standard C (stdio.h), nu un apel de sistem POSIX.',
    },
  },
];

/* ─── Component ─── */
export default function TestLab1_7() {
  const { t } = useApp();
  const [score, setScore] = useState({ total: 0, correct: 0 });

  const handleScore = (_qIdx, isCorrect) => {
    setScore(prev => ({ total: prev.total + 1, correct: prev.correct + (isCorrect ? 1 : 0) }));
  };

  const totalMCQ = sectionA.length + sectionB.length;

  return (
    <div>
      {/* Score summary */}
      <div className="mb-6 p-4 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        {score.total === 0 ? (
          <p className="text-sm opacity-70">
            {t(
              `${totalMCQ} multiple choice questions. Check your answers to see your score.`,
              `${totalMCQ} întrebări grilă. Verifică răspunsurile pentru a vedea scorul.`
            )}
          </p>
        ) : (
          <p className={`text-sm font-medium ${score.correct / score.total >= 0.7 ? 'text-green-600 dark:text-green-400' : score.correct / score.total >= 0.4 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
            {t(
              `Score: ${score.correct}/${score.total} correct${score.total === totalMCQ ? ' (final)' : ''}`,
              `Scor: ${score.correct}/${score.total} corecte${score.total === totalMCQ ? ' (final)' : ''}`
            )}
          </p>
        )}
      </div>

      {/* Section A */}
      <h3 className="text-lg font-bold mb-1">
        {t('Section A — Single Answer', 'Secțiunea A — Răspuns simplu')}
      </h3>
      <p className="text-xs opacity-50 mb-4">{t('One correct answer per question.', 'Un singur răspuns corect per întrebare.')}</p>
      <MultipleChoice questions={sectionA} onScore={handleScore} />

      {/* Section B */}
      <h3 className="text-lg font-bold mt-10 mb-1">
        {t('Section B — Multiple Answers', 'Secțiunea B — Răspunsuri multiple')}
      </h3>
      <p className="text-xs opacity-50 mb-4">{t('One or more correct answers per question.', 'Unul sau mai multe răspunsuri corecte per întrebare.')}</p>
      <MultipleChoice questions={sectionB} multiSelect onScore={handleScore} />

      {/* Section C */}
      <h3 className="text-lg font-bold mt-10 mb-1">
        {t('Section C — Short Free Response', 'Secțiunea C — Răspuns liber scurt')}
      </h3>
      <p className="text-xs opacity-50 mb-4">{t('Write the command or concise answer (max one line).', 'Scrieți comanda sau răspunsul concis (maxim un rând).')}</p>

      <Toggle
        question={t(
          '11. Write the command that displays the name and GID of all groups on the system (one group per line, in the format name - GID), using /etc/group.',
          '11. Scrieți comanda care afișează numele și GID-ul tuturor grupurilor din sistem (câte un grup pe linie, în formatul nume - GID), folosind /etc/group.'
        )}
        answer={<Code>{`awk -F: '{print $1" - "$3}' /etc/group`}</Code>}
        showLabel={t('Show Answer', 'Arată răspunsul')}
        hideLabel={t('Hide', 'Ascunde')}
      />

      <Toggle
        question={t(
          '12. Write the find command that displays all normal files in the home directory on which the owner has write AND execute permissions.',
          '12. Scrieți comanda find care afișează toate fișierele normale din directorul home pe care proprietarul are drept de scriere ȘI execuție.'
        )}
        answer={<Code>{`find ~ -type f -perm -u=wx`}</Code>}
        showLabel={t('Show Answer', 'Arată răspunsul')}
        hideLabel={t('Hide', 'Ascunde')}
      />

      <Toggle
        question={t(
          '13. How do you redirect stderr of a compiled C program (./prog) to a file named erori.txt, leaving stdout untouched?',
          '13. Cum redirecționați stderr al unui program C compilat (./prog) într-un fișier numit erori.txt, lăsând stdout neatins?'
        )}
        answer={<Code>{`./prog 2> erori.txt`}</Code>}
        showLabel={t('Show Answer', 'Arată răspunsul')}
        hideLabel={t('Hide', 'Ascunde')}
      />

      <Toggle
        question={t(
          '14. Write the ps command that displays all processes on the system in the format: username command PID.',
          '14. Scrieți comanda ps care afișează toate procesele din sistem în formatul: username comanda PID.'
        )}
        answer={<Code>{`ps -eo user,comm,pid`}</Code>}
        showLabel={t('Show Answer', 'Arată răspunsul')}
        hideLabel={t('Hide', 'Ascunde')}
      />

      {/* Section D */}
      <h3 className="text-lg font-bold mt-10 mb-1">
        {t('Section D — Code Questions', 'Secțiunea D — Întrebări cu cod')}
      </h3>
      <p className="text-xs opacity-50 mb-4">{t('Analyze the code and answer the questions.', 'Analizați codul și răspundeți la întrebări.')}</p>

      <Toggle
        question={t(
          '15. The following script contains at least 3 errors (syntactic or semantic). Identify them and write the corrected version, so that the script calculates and displays n! (factorial of n), where n is received as a command line argument.',
          '15. Scriptul următor conține cel puțin 3 greșeli (sintactice sau semantice). Identificați-le și scrieți versiunea corectată, astfel încât scriptul să calculeze și să afișeze n! (factorialul lui n), unde n este primit ca argument în linia de comandă.'
        )}
        answer={
          <div>
            <p className="font-medium mb-2">{t('Buggy script:', 'Scriptul cu greșeli:')}</p>
            <Code>{`#!/bin/nologin
if[ $# -lt 1] then
    read -p "Dati n: " n
else
    n=$1

prod=0
for k in \${seq 1 n}
do
    prod*=k
done

echo "Fact($n)=prod"`}</Code>
            <p className="font-medium mt-4 mb-2">{t('Errors found:', 'Greșeli găsite:')}</p>
            <ul className="list-disc list-inside text-sm space-y-1 mb-4">
              <li><code>#!/bin/nologin</code> → <code>#!/bin/bash</code></li>
              <li><code>{'if[ $# -lt 1]'}</code> → <code>{'if [ $# -lt 1 ];'}</code> {t('(spaces around brackets, semicolon before then)', '(spații în jurul parantezelor, punct și virgulă înainte de then)')}</li>
              <li><code>{'prod=0'}</code> → <code>{'prod=1'}</code> {t('(factorial starts at 1, not 0)', '(factorialul începe de la 1, nu 0)')}</li>
              <li><code>{'${seq 1 n}'}</code> → <code>{'$(seq 1 $n)'}</code> {t('(command substitution with $ and $n)', '(substituție de comandă cu $ și $n)')}</li>
              <li><code>prod*=k</code> → <code>{'prod=$((prod * k))'}</code> {t('(arithmetic expansion)', '(expansiune aritmetică)')}</li>
              <li><code>{'"Fact($n)=prod"'}</code> → <code>{'"Fact($n)=$prod"'}</code> {t('($ before variable name)', '($ înaintea numelui variabilei)')}</li>
              <li>{t('Missing fi to close the if block', 'Lipsește fi pentru a închide blocul if')}</li>
            </ul>
            <p className="font-medium mb-2">{t('Corrected script:', 'Scriptul corectat:')}</p>
            <Code>{`#!/bin/bash
if [ $# -lt 1 ]; then
    read -p "Dati n: " n
else
    n=$1
fi

prod=1
for k in $(seq 1 $n)
do
    prod=$((prod * k))
done

echo "Fact($n)=$prod"`}</Code>
          </div>
        }
        showLabel={t('Show Answer', 'Arată răspunsul')}
        hideLabel={t('Hide', 'Ascunde')}
      />

      <Toggle
        question={t(
          '16. Follow the C program below. If the file date.bin does not exist before running, what will happen? If it exists and contains the integer 42 written in binary, what will the program display?',
          '16. Urmăriți programul C de mai jos. Dacă fișierul date.bin nu există înainte de rulare, ce se va întâmpla la execuție? Dacă există și conține numărul întreg 42 scris binar, ce va afișa programul?'
        )}
        answer={
          <div>
            <p className="font-medium mb-2">{t('Program:', 'Programul:')}</p>
            <Code>{`#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

int main() {
    int fd = open("date.bin", O_RDWR | O_CREAT, 0644);
    if (fd < 0) { perror("open"); return 1; }

    int val;
    ssize_t n = read(fd, &val, sizeof(int));
    if (n == sizeof(int)) {
        val *= 2;
        lseek(fd, 0, SEEK_SET);
        write(fd, &val, sizeof(int));
        printf("Valoare noua: %d\\n", val);
    } else {
        val = 1;
        write(fd, &val, sizeof(int));
        printf("Fisier nou creat cu valoarea: %d\\n", val);
    }
    close(fd);
    return 0;
}`}</Code>
            <p className="font-medium mt-4 mb-2">{t('Answer:', 'Răspuns:')}</p>
            <div className="text-sm space-y-2">
              <p>
                <strong>{t('Case 1 — file does not exist:', 'Cazul 1 — fișierul nu există:')}</strong>{' '}
                {t(
                  'open() creates the file (O_CREAT). read() returns 0 (empty file), so the else branch executes: writes val=1 to the file and prints:',
                  'open() creează fișierul (O_CREAT). read() returnează 0 (fișier gol), deci se execută ramura else: scrie val=1 în fișier și afișează:'
                )}
              </p>
              <Code>Fisier nou creat cu valoarea: 1</Code>
              <p>
                <strong>{t('Case 2 — file contains 42:', 'Cazul 2 — fișierul conține 42:')}</strong>{' '}
                {t(
                  'read() successfully reads 4 bytes (sizeof(int)), val=42. Then val *= 2 → val=84. lseek() rewinds to position 0. write() overwrites with 84. Prints:',
                  'read() citește cu succes 4 octeți (sizeof(int)), val=42. Apoi val *= 2 → val=84. lseek() repozitionează la poziția 0. write() suprascrie cu 84. Afișează:'
                )}
              </p>
              <Code>Valoare noua: 84</Code>
            </div>
          </div>
        }
        showLabel={t('Show Answer', 'Arată răspunsul')}
        hideLabel={t('Hide', 'Ascunde')}
      />
    </div>
  );
}
