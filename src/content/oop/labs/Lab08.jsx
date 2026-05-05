import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Lab08() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: OOP Lab 08 — STL map, priority_queue, string processing. UAIC 2024-2025.',
          'Sursă: Lab POO 08 — STL map, priority_queue, procesare string. UAIC 2024-2025.'
        )}
      </p>

      <Section
        title={t('Exercise: Word Frequency Counter', 'Exercițiul: Contor de Frecvență a Cuvintelor')}
        id="oop-lab_8-word-freq"
        checked={!!checked['oop-lab_8-word-freq']}
        onCheck={() => toggleCheck('oop-lab_8-word-freq')}
      >
        <Box type="definition">
          <p className="font-semibold mb-2">{t('Problem statement', 'Enunțul problemei')}</p>
          <p className="text-sm mb-3">
            {t(
              'Write a program that does the following:',
              'Scrieți un program care face următoarele:'
            )}
          </p>
          <ul className="list-disc ml-5 text-sm space-y-2">
            <li>
              {t(
                'Reads a phrase / sentence from a text file into a std::string object.',
                'Citește o frază / propoziție dintr-un fișier text într-un obiect std::string.'
              )}
            </li>
            <li>
              {t(
                'Splits the phrase into words. Separators are: space, comma, question mark, exclamation mark, period. Words may be separated by multiple spaces. Use only methods available in the std::string class.',
                'Împarte fraza în cuvinte. Separatorii sunt: spațiu, virgulă, semn de întrebare, semn de exclamare, punct. Cuvintele pot fi separate de mai multe spații. Folosiți doar metode disponibile în clasa std::string.'
              )}
            </li>
            <li>
              {t(
                'Creates a std::map that counts how many times each word appears. Ignore casing (case-insensitive).',
                'Creează un std::map care numără de câte ori apare fiecare cuvânt. Ignorați majusculele (case-insensitiv).'
              )}
            </li>
            <li>
              {t(
                'Uses a std::priority_queue to sort words by frequency (descending). If two words have the same frequency, sort them lexicographically.',
                'Folosește un std::priority_queue pentru a sorta cuvintele după frecvență (descrescător). Dacă două cuvinte au aceeași frecvență, sortați-le lexicografic.'
              )}
            </li>
            <li>
              {t(
                'Prints the words after they are sorted.',
                'Afișează cuvintele după ce sunt sortate.'
              )}
            </li>
          </ul>
        </Box>

        <Box type="formula">
          <p className="font-semibold mb-2">{t('Example input / output', 'Exemplu intrare / ieșire')}</p>
          <p className="text-sm mb-1">
            {t('Input phrase:', 'Fraza de intrare:')}
          </p>
          <Code>{`"I bought an apple. Then I eat an apple. Apple is my favorite."`}</Code>
          <p className="text-sm mt-3 mb-1">{t('Step 1 — map contents:', 'Pasul 1 — conținut map:')}</p>
          <Code>{`{
    "i"        : 2,
    "bought"   : 1,
    "an"       : 2,
    "apple"    : 3,
    "then"     : 1,
    "eat"      : 1,
    "is"       : 1,
    "my"       : 1,
    "favorite" : 1
}`}</Code>
          <p className="text-sm mt-3 mb-1">{t('Expected output (sorted by frequency, then lexicographically):', 'Ieșire așteptată (sortat după frecvență, apoi lexicografic):')}</p>
          <Code>{`apple     => 3
an        => 2
i         => 2
bought    => 1
eat       => 1
favorite  => 1
is        => 1
my        => 1
then      => 1`}</Code>
        </Box>

        <Toggle
          question={t('Show hints', 'Arată indicii')}
          showLabel={t('Show hints', 'Arată indicii')}
          hideLabel={t('Hide hints', 'Ascunde indicii')}
          answer={
            <div className="space-y-2 text-sm">
              <p>
                {t(
                  '1. Use std::string::find_first_of() and std::string::find_first_not_of() to locate word boundaries.',
                  '1. Folosiți std::string::find_first_of() și std::string::find_first_not_of() pentru a localiza granițele cuvintelor.'
                )}
              </p>
              <p>
                {t(
                  '2. To convert a word to lowercase, use std::transform with ::tolower.',
                  '2. Pentru a converti un cuvânt la minuscule, folosiți std::transform cu ::tolower.'
                )}
              </p>
              <p>
                {t(
                  '3. For the priority_queue, define a custom comparator struct. Higher frequency = higher priority. Equal frequency = lexicographic order (lower string = higher priority).',
                  '3. Pentru priority_queue, definiți un struct comparator personalizat. Frecvență mai mare = prioritate mai mare. Frecvență egală = ordine lexicografică (string mai mic = prioritate mai mare).'
                )}
              </p>
              <Code>{`// Custom comparator for priority_queue
struct Compare {
    bool operator()(const pair<string,int>& a,
                    const pair<string,int>& b) {
        if (a.second != b.second)
            return a.second < b.second; // higher count = higher priority
        return a.first > b.first;       // lexicographically smaller = higher priority
    }
};

priority_queue<pair<string,int>,
               vector<pair<string,int>>,
               Compare> pq;`}</Code>
            </div>
          }
        />
      </Section>
    </>
  );
}
