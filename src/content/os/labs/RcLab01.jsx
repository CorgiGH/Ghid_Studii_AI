import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function RcLab01() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: RC - Lab #1, UAIC — Recap of Operating Systems knowledge',
          'Sursa: RC - Laborator #1, UAIC — Recapitularea cunostintelor legate de Sisteme de Operare'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('RC Lab #1: OS Knowledge Recap', 'RC Laborator #1: Recapitularea cunostintelor SO')}
        </p>
        <p className="text-sm">
          {t(
            'This lab reviews UNIX system structure, Bash commands, file system hierarchy, and file I/O modes — foundations needed for network programming.',
            'Acest laborator recapituleaza structura sistemului UNIX, comenzile Bash, ierarhia sistemului de fisiere si modurile de I/O pentru fisiere — fundamente necesare pentru programarea in retea.'
          )}
        </p>
      </Box>

      <h3 className="text-lg font-bold mt-6 mb-3">
        {t('1. Installing Linux on a Virtual Machine', 'I. Instalarea unei distributii Linux pe o masina virtuala')}
      </h3>

      <Section
        title={t('Download links for VirtualBox and Linux distributions', 'Link-uri de descarcare pentru VirtualBox si distributii Linux')}
        id="rc_lab1-vm"
        checked={!!checked['rc_lab1-vm']}
        onCheck={() => toggleCheck('rc_lab1-vm')}
      >
        <p className="mb-2">{t('Download the following tools:', 'Descarcati urmatoarele instrumente:')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm">
          <li><strong>Oracle VirtualBox:</strong> https://www.virtualbox.org/</li>
          <li><strong>Ubuntu:</strong> https://www.ubuntu.com/download/desktop</li>
          <li><strong>Linux Mint:</strong> https://linuxmint.com/download.php</li>
        </ul>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('2. UNIX Systems & Bash Commands', '2. Sisteme UNIX; Comenzi Bash')}
      </h3>

      <Section
        title={t('UNIX system structure and shell concepts', 'Structura sistemului Unix si concepte shell')}
        id="rc_lab1-unix"
        checked={!!checked['rc_lab1-unix']}
        onCheck={() => toggleCheck('rc_lab1-unix')}
      >
        <p className="mb-2 font-semibold">{t('UNIX system layers:', 'Straturile unui sistem Unix:')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm mb-3">
          <li><strong>{t('Hardware level:', 'Nivelul hardware:')}</strong> {t('network, HDD, memory, CPU', 'retea, HDD, memorie, CPU')}</li>
          <li><strong>{t('System level (kernel):', 'Nivelul sistem (kernel):')}</strong> TCP/IP, File System Manager, Process Manager</li>
          <li><strong>{t('User level:', 'Nivelul utilizator:')}</strong> {t('applications, shell', 'aplicatii, shell')}</li>
        </ul>
        <p className="mb-2 text-sm">
          <strong>Kernel</strong> = {t('"command center" of the OS — allocates time and memory to programs and manages the file system and communications based on UNIX system calls.', '"centrul de comanda" al SO — aloca timp si memorie programelor si face managementul sistemului de fisiere si al comunicarii in functie de apelurile de sistem UNIX.')}
        </p>
        <p className="text-sm">
          <strong>Shell</strong> = {t('acts as a communication interface between the user and the kernel; it is a command interpreter at the command line (CLI); it has the characteristics of a programming language.', 'actioneaza ca o interfata de comunicare intre utilizator si kernel; shell-ul este un interpretor al comenzilor la linia de comanda (CLI); acesta are caracteristicile unui limbaj de programare.')}
        </p>
      </Section>

      <Section
        title={t('Bash command types and execution modes', 'Tipuri si moduri de executie ale comenzilor Bash')}
        id="rc_lab1-bash-types"
        checked={!!checked['rc_lab1-bash-types']}
        onCheck={() => toggleCheck('rc_lab1-bash-types')}
      >
        <p className="mb-2 font-semibold">{t('Command types:', 'Tipuri de comenzi:')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm mb-3">
          <li><strong>{t('External:', 'Externe:')}</strong> {t('Not built into shell; searched in PATH; create a new process. Examples: cat, rm', 'Nu sunt construite in shell; calea este cautata in variabila PATH; se creeaza un nou proces. Exemple: cat, rm')}</li>
          <li><strong>{t('Internal:', 'Interne:')}</strong> {t('Built into the shell; fast — no PATH search, no new process. Examples: source, cd, fg', 'Construite in shell; rapide — fara cautare PATH, fara proces nou. Exemple: source, cd, fg')}</li>
        </ul>
        <p className="mb-2 font-semibold">{t('Execution modes:', 'Moduri de executie:')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm mb-3">
          <li><strong>Foreground:</strong> {t('Default — shell blocks until command finishes.', 'Implicit — shell-ul blocheaza pana cand comanda se termina.')}</li>
          <li><strong>Background:</strong> {t('Append & — shell remains free immediately. Example:', 'Adauga & — shell-ul ramane liber imediat. Exemplu:')} <Code>{`(sleep 10; ls -oh)&`}</Code></li>
          <li><strong>{t('Sequential:', 'Secventiala:')}</strong> <Code>{`ls; cd ~so`}</Code></li>
          <li><strong>{t('Parallel (pipe):', 'Paralela (pipe):')}</strong> <Code>{`cat /etc/passwd | grep x`}</Code></li>
          <li><strong>{t('Conditional:', 'Conditionala:')}</strong> <Code>{`cmd1 && cmd2`}</Code> {t('or', 'sau')} <Code>{`cmd1 || cmd2`}</Code></li>
        </ul>
        <p className="mb-2 font-semibold">{t('Useful background control commands:', 'Comenzi utile de control background:')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm">
          <li><Code>jobs</Code> — {t('list background processes', 'afisarea proceselor din fundal')}</li>
          <li><Code>fg</Code> — {t('bring a process to foreground', 'aducerea unui proces din fundal')}</li>
          <li><Code>bg</Code> — {t('send a process to background', 'trimiterea in fundal')}</li>
          <li><Code>alias</Code> — {t('create aliases for long commands', 'crearea aliasurilor pentru comenzi lungi')}</li>
          <li><Code>env</Code> — {t('list environment variables or run program in altered environment', 'poate lista toate variabilele de environment si poate rula programe in alt environment')}</li>
        </ul>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('3. Working with Files and Directories', '3. Lucrul cu fisiere si directoare')}
      </h3>

      <Section
        title={t('Linux directory structure', 'Structura de directoare Linux')}
        id="rc_lab1-dirs"
        checked={!!checked['rc_lab1-dirs']}
        onCheck={() => toggleCheck('rc_lab1-dirs')}
      >
        <ul className="list-disc ml-5 space-y-1 text-sm">
          <li><Code>/</Code> — {t('root directory', 'directorul radacina')}</li>
          <li><Code>/dev</Code> — {t('system devices (e.g. /dev/hda = first HDD, /dev/hda1 = first partition)', 'dispozitivele sistemului (ex. /dev/hda - primul HDD, /dev/hda1 - prima partitie)')}</li>
          <li><Code>/etc</Code> — {t('configuration files (e.g. /etc/passwd, /etc/group, /etc/hosts)', 'fisiere de configurare (ex. /etc/passwd, /etc/group, /etc/hosts)')}</li>
          <li><Code>/usr</Code> — {t('user utilities (/lib=libraries, /man=manual, /include=C headers)', 'fisiere utilizate de utilizatorii sistemului (/lib=biblioteci, /man=manual, /include=headere C)')}</li>
          <li><Code>/lib</Code> — {t('shared libraries and modules', 'biblioteci si module partajate')}</li>
          <li><Code>/boot</Code> — {t('kernel image', 'imaginea nucleului')}</li>
          <li><Code>/tmp</Code> — {t('temporary information', 'informatii temporare')}</li>
          <li><Code>/home</Code> — {t('user home directories', 'directoarele userilor')}</li>
          <li><Code>/mnt</Code> — {t('mount point for other filesystems (CD-ROM, FAT)', 'director de montare a diferitelor sisteme de fisiere')}</li>
          <li><Code>/var</Code> — {t('log files and variable data', 'contine fisiere log completate de sistem')}</li>
          <li><Code>/proc</Code> — {t('virtual filesystem — one subdir per process, plus network connection info', 'sistemul virtual de fisiere proc — cate un subdirector per proces si info despre conexiunile in retea')}</li>
        </ul>
      </Section>

      <Section
        title={t('Wildcards and file commands', 'Metacaractere si comenzi pentru fisiere')}
        id="rc_lab1-wildcards"
        checked={!!checked['rc_lab1-wildcards']}
        onCheck={() => toggleCheck('rc_lab1-wildcards')}
      >
        <p className="mb-2 font-semibold">{t('Wildcards (metacharacters):', 'Metacaracterele (wildcards):')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm mb-3">
          <li><Code>$</Code> — {t('end of line', 'indica sfarsit de linie')}</li>
          <li><Code>?</Code> — {t('one character', 'un caracter')}</li>
          <li><Code>*</Code> — {t('0, 1, or more characters', '0,1 sau mai multe caractere')}</li>
          <li><Code>[chars]</Code> — {t('an interval of characters', 'un interval')}</li>
          <li><Code>[^a]</Code> — {t('any character except a', 'orice diferit de a')}</li>
          <li><Code>+</Code> — {t('one or more occurrences', 'indica una sau mai multe aparitii')}</li>
          <li><Code>|</Code> — {t('alternative', 'o alternativa')}</li>
          <li><Code>{'{n}'}</Code> — {t('exactly n occurrences', 'exact n aparitii')}</li>
        </ul>
        <p className="mb-1 font-semibold text-sm">{t('Filesystem commands:', 'Comenzi Bash specifice sistemului de fisiere:')}</p>
        <p className="text-sm mb-1"><Code>ls, file, du, cat, head, tail, tac, stat, find</Code></p>
        <p className="mb-1 font-semibold text-sm">{t('Directory commands:', 'Comenzi Bash pentru prelucrarea directoarelor:')}</p>
        <p className="text-sm mb-1"><Code>mkdir, rmdir, cd, pwd</Code></p>
        <p className="mb-1 font-semibold text-sm">{t('Permissions:', 'Modificarea drepturilor:')}</p>
        <p className="text-sm"><Code>chmod</Code> — {t('example:', 'exemplu:')} <Code>chmod +uW bau</Code></p>
      </Section>

      <Section
        title={t('I/O redirection and file access modes', 'Redirectionarea I/O si moduri de acces la fisiere')}
        id="rc_lab1-io"
        checked={!!checked['rc_lab1-io']}
        onCheck={() => toggleCheck('rc_lab1-io')}
      >
        <p className="mb-2 font-semibold">{t('Standard I/O redirection:', 'Redirectionarea intrarilor si iesirilor standard:')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm mb-3">
          <li><strong>stdin (fd 0):</strong> <Code>cmd {'<'} file</Code></li>
          <li><strong>stdout (fd 1):</strong> <Code>cmd {'>'} file</Code></li>
          <li><strong>stderr (fd 2):</strong> <Code>cmd 2{'>'} file</Code></li>
        </ul>
        <p className="mb-2 font-semibold">{t('File access modes in C:', 'Moduri de prelucrare a fisierelor in C:')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm">
          <li><strong>{t('Via descriptors (primitives):', 'Via descriptori (primitive):')}</strong> <Code>open, read, write, lseek, close</Code></li>
          <li><strong>{t('Via FILE* (library):', 'Via structura FILE (biblioteca):')}</strong> <Code>fopen, fread, fgetc, fgets, fscanf, fwrite, fputc, fputs, fprintf, fseek, ftell, fclose</Code></li>
        </ul>
      </Section>

      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('Exercises', 'Exercitii')}
      </h3>

      <Section
        title={t('Ex 1: Install Linux in a VM and explore the file system', 'Ex 1: Instaleaza Linux intr-o masina virtuala si exploreaza sistemul de fisiere')}
        id="rc_lab1-ex1"
        checked={!!checked['rc_lab1-ex1']}
        onCheck={() => toggleCheck('rc_lab1-ex1')}
      >
        <p className="text-sm mb-2">{t('Install Ubuntu or Linux Mint in VirtualBox. Once booted, explore:', 'Instaleaza Ubuntu sau Linux Mint in VirtualBox. Odata pornit, exploreaza:')}</p>
        <ul className="list-disc ml-5 space-y-1 text-sm">
          <li><Code>ls /</Code> — {t('list root directory contents', 'listeaza continutul directorului radacina')}</li>
          <li><Code>ls /proc</Code> — {t('see running processes as directories', 'vede procesele rulate ca directoare')}</li>
          <li><Code>cat /proc/net/tcp</Code> — {t('list TCP connections (relevant to networking!)', 'listeaza conexiunile TCP (relevant pentru retele!)')}</li>
          <li><Code>cat /etc/hosts</Code> — {t('see local hostname-to-IP mappings', 'vede mapari locale hostname-la-IP')}</li>
        </ul>
      </Section>
    </>
  );
}
