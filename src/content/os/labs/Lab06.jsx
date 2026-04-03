import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Lab06() {
  const { t, checked, toggleCheck } = useApp();
  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Lab #6: C Programming — Memory-Mapped Files & Shared Memory', 'Laborator #6: Programare C — Fișiere mapate în memorie și memorie partajată')}</p>
        <p className="text-sm">{t('Process files directly in memory using mmap(), implement inter-process communication with shared memory, and use semaphores for synchronization.', 'Procesați fișiere direct în memorie folosind mmap(), implementați comunicația inter-procese cu memorie partajată și folosiți semaphore-uri pentru sincronizare.')}</p>
      </Box>

      <h3 className="text-lg font-bold mt-6 mb-3">{t('a) mmap file processing', 'a) Procesarea fișierelor cu mmap')}</h3>

      <Section title="Ex 1: MyTr_mmap" id="lab6-ex1" checked={!!checked['lab6-ex1']} onCheck={() => toggleCheck('lab6-ex1')}>
        <p>{t('Rewrite the MyTr filter using mmap: map the input file into memory, perform character replacement directly in memory, write result to output file.', 'Rescrieți filtrul MyTr folosind mmap: mapați fișierul de intrare în memorie, efectuați înlocuirea caracterelor direct în memorie, scrieți rezultatul în fișierul de ieșire.')}</p>
      </Section>

      <Section title="Ex 2: MyHead_mmap" id="lab6-ex2" checked={!!checked['lab6-ex2']} onCheck={() => toggleCheck('lab6-ex2')}>
        <p>{t('Rewrite MyHead using mmap: map the file, scan for newlines in memory to find the first N lines.', 'Rescrieți MyHead folosind mmap: mapați fișierul, scanați pentru newline-uri în memorie pentru a găsi primele N linii.')}</p>
      </Section>

      <Section title="Ex 3: MyWc_mmap" id="lab6-ex3" checked={!!checked['lab6-ex3']} onCheck={() => toggleCheck('lab6-ex3')}>
        <p>{t('Implement wc using mmap: count lines, words, and characters by scanning the memory-mapped file directly.', 'Implementați wc folosind mmap: numărați linii, cuvinte și caractere scanând fișierul mapat direct în memorie.')}</p>
      </Section>

      <Section title="Ex 4: MyCp_mmap" id="lab6-ex4" checked={!!checked['lab6-ex4']} onCheck={() => toggleCheck('lab6-ex4')}>
        <p>{t('Implement file copy using mmap: map both source and destination, use memcpy to copy data between the two mappings.', 'Implementați copierea fișierelor folosind mmap: mapați atât sursa cât și destinația, folosiți memcpy pentru a copia datele între cele două mapări.')}</p>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">{t('b) Shared memory IPC', 'b) IPC cu memorie partajată')}</h3>

      <Section title="Ex 5: MyCS_shmem #1" id="lab6-ex5" checked={!!checked['lab6-ex5']} onCheck={() => toggleCheck('lab6-ex5')}>
        <p>{t('Implement mutual exclusion with shared memory: parent and child increment a shared counter using anonymous mmap (MAP_SHARED|MAP_ANONYMOUS) with semaphore synchronization.', 'Implementați excluderea mutuală cu memorie partajată: părintele și fiul incrementează un contor partajat folosind mmap anonim (MAP_SHARED|MAP_ANONYMOUS) cu sincronizare prin semaphore.')}</p>
      </Section>

      <Section title={t('Ex 6: Parallel Sorting with shared memory', 'Ex 6: Sortare paralelă cu memorie partajată')} id="lab6-ex6" checked={!!checked['lab6-ex6']} onCheck={() => toggleCheck('lab6-ex6')}>
        <p>{t('Implement parallel sorting: parent creates shared memory with the array, forks N children, each child sorts a portion, parent merges the sorted portions.', 'Implementați sortarea paralelă: părintele creează memorie partajată cu array-ul, face fork la N fii, fiecare fiu sortează o porțiune, părintele combină porțiunile sortate.')}</p>
      </Section>

      <Section title="Ex 7: MyCREW_shmem" id="lab6-ex7" checked={!!checked['lab6-ex7']} onCheck={() => toggleCheck('lab6-ex7')}>
        <p>{t('Implement CREW pattern with POSIX shared memory (shm_open/mmap) and named semaphores for synchronization between unrelated processes.', 'Implementați pattern-ul CREW cu memorie partajată POSIX (shm_open/mmap) și semaphore-uri cu nume pentru sincronizare între procese neînrudite.')}</p>
      </Section>

      <Section title={t('Ex 8: Ping-Pong with anonymous mmap', 'Ex 8: Ping-Pong cu mmap anonim')} id="lab6-ex8" checked={!!checked['lab6-ex8']} onCheck={() => toggleCheck('lab6-ex8')}>
        <p>{t('Implement Ping-Pong pattern using anonymous shared memory for data exchange and synchronization flags.', 'Implementați pattern-ul Ping-Pong folosind memorie partajată anonimă pentru schimbul de date și flag-uri de sincronizare.')}</p>
      </Section>

      <Section title={t('Ex 9: Token Ring with anonymous mmap', 'Ex 9: Token Ring cu mmap anonim')} id="lab6-ex9" checked={!!checked['lab6-ex9']} onCheck={() => toggleCheck('lab6-ex9')}>
        <p>{t('Implement a Token Ring pattern: N processes arranged in a ring, passing a token through shared memory. Only the process holding the token can execute its critical section.', 'Implementați un pattern Token Ring: N procese aranjate în inel, pasând un token prin memorie partajată. Doar procesul care deține token-ul poate executa secțiunea critică.')}</p>
      </Section>
    </>
  );
}
