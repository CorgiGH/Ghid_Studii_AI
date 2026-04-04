import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box } from '../../../components/ui';
import MultiFileEditor from '../../../components/ui/MultiFileEditor';

export default function Lab01() {
  const { t } = useApp();

  return (
    <>
      {/* ── Exercise 1: Git Setup ── */}
      <h3 className="font-bold">
        {t('Exercise 1 — Git Setup', 'Exercițiul 1 — Configurare Git')}
      </h3>
      <p>
        {t(
          'Create a Git repository for your OOP laboratory work. Initialize a local repo, create a README file, and push it to a remote repository (GitHub / GitLab).',
          'Creați un repository Git pentru lucrările de laborator la POO. Inițializați un repo local, creați un fișier README și împingeți-l într-un repository remote (GitHub / GitLab).'
        )}
      </p>
      <Box type="warning">
        <p className="text-sm">
          {t(
            'Steps: git init → git add . → git commit -m "Initial commit" → git remote add origin <URL> → git push -u origin main',
            'Pași: git init → git add . → git commit -m "Initial commit" → git remote add origin <URL> → git push -u origin main'
          )}
        </p>
      </Box>

      {/* ── Exercise 2: Sum from File ── */}
      <h3 className="font-bold mt-6">
        {t('Exercise 2 — Sum from File', 'Exercițiul 2 — Sumă din fișier')}
      </h3>
      <p>
        {t(
          'Read numbers from an input file (in.txt), calculate their sum using a custom atoi implementation (do not use the standard atoi/strtol). Print the total sum.',
          'Citiți numere dintr-un fișier de intrare (in.txt), calculați suma lor folosind o implementare proprie a funcției atoi (nu folosiți atoi/strtol din bibliotecă). Afișați suma totală.'
        )}
      </p>
      <Box type="warning">
        <p className="text-sm">
          {t(
            'Hint: Implement your own atoi by iterating through each character, converting it to a digit (ch - \'0\'), and accumulating the result.',
            'Indiciu: Implementați propriul atoi iterând prin fiecare caracter, convertindu-l într-o cifră (ch - \'0\'), și acumulând rezultatul.'
          )}
        </p>
      </Box>
      <MultiFileEditor
        files={[{ name: 'main.c', content: '', language: 'c' }]}
        expectedOutput="1187109"
      />

      {/* ── Exercise 3: Sort Words ── */}
      <h3 className="font-bold mt-6">
        {t('Exercise 3 — Sort Words', 'Exercițiul 3 — Sortarea cuvintelor')}
      </h3>
      <p>
        {t(
          'Read a sentence from the user. Split it into words, then sort the words by length in descending order. If two words have the same length, sort them alphabetically.',
          'Citiți o propoziție de la utilizator. Împărțiți-o în cuvinte, apoi sortați cuvintele după lungime în ordine descrescătoare. Dacă două cuvinte au aceeași lungime, sortați-le alfabetic.'
        )}
      </p>
      <Box type="warning">
        <p className="text-sm">
          {t(
            'Hint: Use strtok to tokenize the string, store words in an array, then apply a sorting algorithm with a custom comparator.',
            'Indiciu: Folosiți strtok pentru a tokeniza șirul, stocați cuvintele într-un vector, apoi aplicați un algoritm de sortare cu un comparator personalizat.'
          )}
        </p>
      </Box>
      <MultiFileEditor
        files={[{ name: 'main.c', content: '', language: 'c' }]}
      />

      {/* ── Exercise 4: Prime Checker ── */}
      <h3 className="font-bold mt-6">
        {t('Exercise 4 — Prime Checker (Fill in the blanks)', 'Exercițiul 4 — Verificare număr prim (Completați spațiile libere)')}
      </h3>
      <p>
        {t(
          'The code below checks whether a number is prime, but some parts are missing (marked with ......). Fill in the blanks to make the program work correctly.',
          'Codul de mai jos verifică dacă un număr este prim, dar unele părți lipsesc (marcate cu ......). Completați spațiile libere pentru ca programul să funcționeze corect.'
        )}
      </p>
      <Box type="warning">
        <p className="text-sm">
          {t(
            'Hint: Think about the optimal upper bound for checking divisors of n, and what the function should return when a divisor is found.',
            'Indiciu: Gândiți-vă la limita superioară optimă pentru verificarea divizorilor lui n și ce ar trebui să returneze funcția când se găsește un divizor.'
          )}
        </p>
      </Box>
      <MultiFileEditor
        files={[
          {
            name: 'main.cpp',
            content: `#include <iostream>
using namespace std;

bool isPrime(int n)
{
    for (int tr = 2; tr < n / ......; tr++)
        if ((n % ...... ) == 0)
            return ......;
    return true;
}
int main()
{
    int n;
    std::cout << "Enter a number:";
    std::cin >> ......;
    if (isPrime(n))
        std::cout << n << " is prime !";
    else
        std::cout << n << " is NOT prime !";
    return 0;
}`,
            language: 'cpp',
          },
        ]}
      />
    </>
  );
}
