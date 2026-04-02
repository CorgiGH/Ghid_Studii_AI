import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import MultipleChoice from '../../../components/ui/MultipleChoice';
import { Box, Code, Toggle } from '../../../components/ui';

const mcQuestions = [
  {
    question: { en: 'Which system call creates a new process?', ro: 'Ce apel de sistem creează un proces nou?' },
    options: [
      { text: 'exec()', correct: false },
      { text: 'fork()', correct: true },
      { text: 'clone()', correct: false },
      { text: 'spawn()', correct: false },
    ],
    explanation: { en: 'fork() creates a child process by duplicating the calling process. exec() replaces the current process image.', ro: 'fork() creează un proces copil prin duplicarea procesului apelant. exec() înlocuiește imaginea procesului curent.' },
  },
  {
    question: { en: 'What does chmod 755 mean?', ro: 'Ce înseamnă chmod 755?' },
    options: [
      { text: 'rwxr-xr-x', correct: true },
      { text: 'rwxrwxrwx', correct: false },
      { text: 'rw-r--r--', correct: false },
      { text: 'rwx------', correct: false },
    ],
    explanation: { en: '7=rwx (owner), 5=r-x (group), 5=r-x (others). Each digit is the sum: r=4, w=2, x=1.', ro: '7=rwx (proprietar), 5=r-x (grup), 5=r-x (alții). Fiecare cifră este suma: r=4, w=2, x=1.' },
  },
  {
    question: { en: 'What happens when fork() succeeds?', ro: 'Ce se întâmplă când fork() reușește?' },
    options: [
      { text: { en: 'Returns child PID to parent, 0 to child', ro: 'Returnează PID-ul copilului la părinte, 0 la copil' }[('en')], correct: false },
      { text: 'Returns 0 to both processes', correct: false },
      { text: 'Returns child PID to parent, 0 to child', correct: true },
      { text: 'Returns 1 to parent, -1 to child', correct: false },
    ],
    explanation: { en: 'fork() returns the child PID to the parent process and 0 to the child. On failure, it returns -1 to the parent.', ro: 'fork() returnează PID-ul copilului procesului părinte și 0 procesului copil. La eșec, returnează -1 părintelui.' },
  },
  {
    question: { en: 'Which command shows all running processes?', ro: 'Ce comandă afișează toate procesele care rulează?' },
    options: [
      { text: 'ls -a', correct: false },
      { text: 'ps aux', correct: true },
      { text: 'top -p', correct: false },
      { text: 'cat /proc', correct: false },
    ],
    explanation: { en: 'ps aux shows all processes for all users with detailed information.', ro: 'ps aux afișează toate procesele pentru toți utilizatorii cu informații detaliate.' },
  },
  {
    question: { en: 'What does a pipe (|) do in the shell?', ro: 'Ce face o conductă (|) în shell?' },
    options: [
      { text: { en: 'Redirects output to a file', ro: 'Redirecționează ieșirea într-un fișier' }[('en')], correct: false },
      { text: { en: 'Connects stdout of one command to stdin of another', ro: 'Conectează stdout-ul unei comenzi la stdin-ul alteia' }[('en')], correct: false },
      { text: 'Connects stdout of one command to stdin of another', correct: true },
      { text: 'Runs two commands in parallel', correct: false },
    ],
    explanation: { en: 'The pipe operator connects the standard output of the left command to the standard input of the right command.', ro: 'Operatorul pipe conectează ieșirea standard a comenzii din stânga la intrarea standard a comenzii din dreapta.' },
  },
];

export default function Practice() {
  const { t } = useApp();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{t('Practice Problems', 'Probleme de practică')}</h2>
      <p className="text-sm opacity-70 mb-6">{t('Test your understanding with multiple choice and free-form problems.', 'Testează-ți cunoștințele cu probleme cu răspunsuri multiple și deschise.')}</p>

      <h3 className="text-lg font-bold mb-4">{t('Multiple Choice', 'Răspunsuri multiple')}</h3>
      <MultipleChoice questions={mcQuestions} />

      <h3 className="text-lg font-bold mt-8 mb-4">{t('Free-Form Problems', 'Probleme deschise')}</h3>
      <Toggle
        question={t('Write a bash script that counts the number of files in a directory.', 'Scrieți un script bash care numără fișierele dintr-un director.')}
        answer={<Code>{`#!/bin/bash
count=$(ls -1 "\${1:-.}" | wc -l)
echo "Number of files: $count"`}</Code>}
        hideLabel={t('Hide', 'Ascunde')}
        showLabel={t('Show Answer', 'Arată răspunsul')}
      />
      <Toggle
        question={t('Write a C program using fork() that creates a child process which prints its PID.', 'Scrieți un program C folosind fork() care creează un proces copil ce afișează PID-ul său.')}
        answer={<Code>{`#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork();
    if (pid == 0) {
        printf("Child PID: %d\\n", getpid());
    } else if (pid > 0) {
        wait(NULL);
        printf("Parent: child finished\\n");
    } else {
        perror("fork");
    }
    return 0;
}`}</Code>}
        hideLabel={t('Hide', 'Ascunde')}
        showLabel={t('Show Answer', 'Arată răspunsul')}
      />
    </div>
  );
}
