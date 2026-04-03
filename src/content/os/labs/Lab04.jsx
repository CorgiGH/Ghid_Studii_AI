import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Lab04() {
  const { t, checked, toggleCheck } = useApp();
  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Lab #4: C Programming — File Processing & File Locking', 'Laborator #4: Programare C — Procesarea fișierelor și blocaje pe fișiere')}</p>
        <p className="text-sm">{t('Implement Linux commands in C using POSIX API (open, read, write, close) and file locking (fcntl). All exercises require POSIX system calls, not C stdlib.', 'Implementați comenzi Linux în C folosind API-ul POSIX (open, read, write, close) și blocaje pe fișiere (fcntl). Toate exercițiile necesită apeluri de sistem POSIX, nu biblioteca standard C.')}</p>
      </Box>

      <h3 className="text-lg font-bold mt-6 mb-3">{t('a) File Processing Exercises', 'a) Exerciții de procesare a fișierelor')}</h3>

      <Section title="Ex 1: MyTr" id="lab4-ex1" checked={!!checked['lab4-ex1']} onCheck={() => toggleCheck('lab4-ex1')}>
        <p>{t('Write a C program that implements a simplified version of the tr command: reads from an input file, replaces all occurrences of character c1 with c2, and writes to an output file. Use POSIX API (open/read/write/close).', 'Scrieți un program C care implementează o versiune simplificată a comenzii tr: citește dintr-un fișier de intrare, înlocuiește toate aparițiile caracterului c1 cu c2 și scrie într-un fișier de ieșire. Folosiți API-ul POSIX (open/read/write/close).')}</p>
        <Code>{`// Usage: ./mytr input_file output_file c1 c2`}</Code>
        <Toggle question={t('Hint', 'Indicație')} answer={<p className="text-sm">{t('Single pass through the input file: read each character, if it matches c1 write c2, otherwise write the original character.', 'O singură parcurgere a fișierului: citiți fiecare caracter, dacă se potrivește cu c1 scrieți c2, altfel scrieți caracterul original.')}</p>} showLabel={t('Show Hint', 'Arată indicația')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      <Section title="Ex 2: MyHead" id="lab4-ex2" checked={!!checked['lab4-ex2']} onCheck={() => toggleCheck('lab4-ex2')}>
        <p>{t('Write a C program that implements the head command: displays the first N lines of a file (default N=10). Use POSIX API.', 'Scrieți un program C care implementează comanda head: afișează primele N linii ale unui fișier (implicit N=10). Folosiți API-ul POSIX.')}</p>
        <Code>{`// Usage: ./myhead [-n N] filename`}</Code>
      </Section>

      <Section title="Ex 3: MyFind #2" id="lab4-ex3" checked={!!checked['lab4-ex3']} onCheck={() => toggleCheck('lab4-ex3')}>
        <p>{t('Write a C program that searches a directory (non-recursively) for files matching a given name pattern and displays their names with sizes.', 'Scrieți un program C care caută într-un director (nerecursiv) fișiere cu un anumit pattern de nume și afișează numele lor cu dimensiunile.')}</p>
      </Section>

      <Section title="Ex 4: MyFind #3" id="lab4-ex4" checked={!!checked['lab4-ex4']} onCheck={() => toggleCheck('lab4-ex4')}>
        <p>{t('Write a C program that searches a directory RECURSIVELY for files matching a pattern. Use opendir/readdir/closedir with recursive descent.', 'Scrieți un program C care caută într-un director RECURSIV fișiere cu un pattern. Folosiți opendir/readdir/closedir cu parcurgere recursivă.')}</p>
      </Section>

      <Section title="Ex 5: MyMv" id="lab4-ex5" checked={!!checked['lab4-ex5']} onCheck={() => toggleCheck('lab4-ex5')}>
        <p>{t('Implement the mv command in C using rename() system call.', 'Implementați comanda mv în C folosind apelul de sistem rename().')}</p>
      </Section>

      <Section title="Ex 6: MyLs" id="lab4-ex6" checked={!!checked['lab4-ex6']} onCheck={() => toggleCheck('lab4-ex6')}>
        <p>{t('Implement ls -l in C: list directory contents with permissions, size, owner, date.', 'Implementați ls -l în C: listați conținutul directorului cu permisiuni, dimensiune, proprietar, dată.')}</p>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">{t('b) File Locking Exercises', 'b) Exerciții cu blocaje pe fișiere')}</h3>

      <Section title="Ex 7: MyCritSec #4" id="lab4-ex7" checked={!!checked['lab4-ex7']} onCheck={() => toggleCheck('lab4-ex7')}>
        <p>{t('Implement mutual exclusion using file locking (fcntl with F_SETLKW). Two processes increment a shared counter in a file, using write locks to prevent data races.', 'Implementați excluderea mutuală folosind blocaje pe fișiere (fcntl cu F_SETLKW). Două procese incrementează un contor partajat într-un fișier, folosind write locks pentru a preveni data races.')}</p>
      </Section>

      <Section title="Ex 8: MyCREW #1" id="lab4-ex8" checked={!!checked['lab4-ex8']} onCheck={() => toggleCheck('lab4-ex8')}>
        <p>{t('Implement Concurrent-Read-Exclusive-Write (CREW) pattern: multiple readers can access simultaneously, but writers get exclusive access. Use fcntl read/write locks.', 'Implementați pattern-ul Concurrent-Read-Exclusive-Write (CREW): mai mulți cititori pot accesa simultan, dar scriitorii obțin acces exclusiv. Folosiți read/write locks cu fcntl.')}</p>
      </Section>

      <Section title="Ex 9: MyCREW #2" id="lab4-ex9" checked={!!checked['lab4-ex9']} onCheck={() => toggleCheck('lab4-ex9')}>
        <p>{t('Extend MyCREW #1: implement a producer-consumer scenario where multiple producers write records to a shared file and multiple consumers read them, using region-based file locking.', 'Extindeți MyCREW #1: implementați un scenariu producător-consumator unde mai mulți producători scriu înregistrări într-un fișier partajat și mai mulți consumatori le citesc, folosind blocaje pe regiuni de fișier.')}</p>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">{t('c) Homework', 'c) Teme pentru acasă')}</h3>

      <Section title="HW: Octal2Binary filter" id="lab4-hw1" checked={!!checked['lab4-hw1']} onCheck={() => toggleCheck('lab4-hw1')}>
        <p>{t('Write a filter that converts octal numbers to binary. Read from input file (or stdin), write to output file (or stdout). Use POSIX API.', 'Scrieți un filtru care convertește numere octale în binar. Citiți din fișier de intrare (sau stdin), scrieți în fișier de ieșire (sau stdout). Folosiți API-ul POSIX.')}</p>
      </Section>

      <Section title="HW: MyUniq" id="lab4-hw2" checked={!!checked['lab4-hw2']} onCheck={() => toggleCheck('lab4-hw2')}>
        <p>{t('Implement the uniq command in C: filter out adjacent duplicate lines. Support -c (count) and -d (only duplicates) options. Use POSIX API.', 'Implementați comanda uniq în C: filtrați liniile duplicate adiacente. Suportați opțiunile -c (numărare) și -d (doar duplicate). Folosiți API-ul POSIX.')}</p>
      </Section>

      <Section title="HW: MyTac" id="lab4-hw3" checked={!!checked['lab4-hw3']} onCheck={() => toggleCheck('lab4-hw3')}>
        <p>{t('Implement the tac command in C: display file contents in reverse line order. Use POSIX API with lseek.', 'Implementați comanda tac în C: afișați conținutul fișierului în ordine inversă a liniilor. Folosiți API-ul POSIX cu lseek.')}</p>
      </Section>
    </>
  );
}
