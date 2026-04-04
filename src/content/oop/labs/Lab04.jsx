import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code } from '../../../components/ui';
import MultiFileEditor from '../../../components/ui/MultiFileEditor';

export default function Lab04() {
  const { t } = useApp();

  return (
    <>
      {/* ── Exercise 1: Sort Class ── */}
      <h3 className="font-bold">
        {t('Exercise 1 — Sort Class', 'Exercițiul 1 — Clasa Sort')}
      </h3>
      <p>
        {t(
          'Implement a Sort class that stores an array of integers and provides multiple sorting algorithms. The class must support five different constructors and three sorting methods, each with an optional ascending parameter.',
          'Implementați o clasă Sort care stochează un vector de numere întregi și oferă mai mulți algoritmi de sortare. Clasa trebuie să suporte cinci constructori diferiți și trei metode de sortare, fiecare cu un parametru opțional pentru ordine crescătoare.'
        )}
      </p>

      <Box type="definition">
        <p className="font-semibold mb-1">
          {t('Constructors required:', 'Constructori necesari:')}
        </p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>
            {t(
              'Random values — takes count, min, max and fills the array with random integers in [min, max]',
              'Valori aleatoare — primește count, min, max și umple vectorul cu numere aleatoare în [min, max]'
            )}
          </li>
          <li>
            {t(
              'Initializer list — e.g. Sort s = {10, 40, 100, 5, 70}',
              'Listă de inițializare — ex. Sort s = {10, 40, 100, 5, 70}'
            )}
          </li>
          <li>
            {t(
              'C-style array + count — takes a pointer and element count',
              'Vector C + count — primește un pointer și numărul de elemente'
            )}
          </li>
          <li>
            {t(
              'Variadic (va_args) — takes a count followed by that many int arguments',
              'Variadic (va_args) — primește un count urmat de atâtea argumente int'
            )}
          </li>
          <li>
            {t(
              'String parsing — parses a comma-separated string like "10,40,100,5,70"',
              'Parsare string — parsează un string cu valori separate prin virgulă, ex. "10,40,100,5,70"'
            )}
          </li>
        </ul>
      </Box>

      <Box type="warning">
        <p className="text-sm">
          {t(
            'Each sorting method (InsertSort, QuickSort, BubbleSort) takes a bool ascendent parameter (default false = descending). Implement Print() to display the array, GetElementsCount() to return the size, and GetElementFromIndex(int) to return the element at a given position.',
            'Fiecare metodă de sortare (InsertSort, QuickSort, BubbleSort) primește un parametru bool ascendent (implicit false = descrescător). Implementați Print() pentru afișarea vectorului, GetElementsCount() pentru returnarea dimensiunii și GetElementFromIndex(int) pentru elementul de la o poziție dată.'
          )}
        </p>
      </Box>

      <p className="mt-3 font-semibold text-sm">
        {t('Starter interface:', 'Interfața de pornire:')}
      </p>
      <Code>{`class Sort {
    // add data members
public:
    // add constructors
    void InsertSort(bool ascendent=false);
    void QuickSort(bool ascendent=false);
    void BubbleSort(bool ascendent=false);
    void Print();
    int GetElementsCount();
    int GetElementFromIndex(int index);
};`}</Code>

      <MultiFileEditor
        files={[
          {
            name: 'Sort.h',
            content: `#pragma once

class Sort {
    // add data members
public:
    // add constructors
    void InsertSort(bool ascendent=false);
    void QuickSort(bool ascendent=false);
    void BubbleSort(bool ascendent=false);
    void Print();
    int GetElementsCount();
    int GetElementFromIndex(int index);
};`,
            language: 'cpp',
          },
          {
            name: 'Sort.cpp',
            content: '',
            language: 'cpp',
          },
          {
            name: 'main.cpp',
            content: '',
            language: 'cpp',
          },
        ]}
      />
    </>
  );
}
