import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code } from '../../../components/ui';
import MultiFileEditor from '../../../components/ui/MultiFileEditor';

export default function Lab07Extra() {
  const { t } = useApp();

  return (
    <>
      {/* ── Exercise 1: Temperature Literals ── */}
      <h3 className="font-bold mt-8">
        {t('Exercise 1 — Temperature Literals', 'Exercițiul 1 — Literali de temperatură')}
      </h3>
      <p>
        {t(
          'Create two user-defined literals, _Kelvin and _Fahrenheit, that convert the given temperature value to Celsius.',
          'Creați doi literali definiți de utilizator, _Kelvin și _Fahrenheit, care convertesc valoarea de temperatură dată în grade Celsius.'
        )}
      </p>

      <Box type="formula">
        <p className="text-sm">
          {t('Conversion formulas:', 'Formule de conversie:')}
        </p>
        <ul className="list-disc ml-4 text-sm mt-1">
          <li>Kelvin → Celsius: <code>C = K - 273.15</code></li>
          <li>Fahrenheit → Celsius: <code>C = (F - 32) * 5 / 9</code></li>
        </ul>
      </Box>

      <Box type="warning">
        <p className="text-sm">
          {t(
            'Hint: User-defined literals are declared as: float operator""_Kelvin(unsigned long long val). After the conversion, the result should be stored in a float variable representing degrees Celsius.',
            'Indiciu: Literalii definiți de utilizator se declară astfel: float operator""_Kelvin(unsigned long long val). După conversie, rezultatul trebuie stocat într-o variabilă float reprezentând grade Celsius.'
          )}
        </p>
      </Box>

      <p className="mt-4 font-semibold text-sm">{t('Starter code (main.cpp):', 'Cod inițial (main.cpp):')}</p>
      <Code>{`int main() {
    float a = 300_Kelvin;      // should be ~26.85
    float b = 120_Fahrenheit;  // should be ~48.89
    return 0;
}`}</Code>

      <MultiFileEditor
        files={[
          {
            name: 'main.cpp',
            content: `#include <iostream>

// TODO: define _Kelvin and _Fahrenheit user-defined literals

int main() {
    float a = 300_Kelvin;
    float b = 120_Fahrenheit;
    std::cout << "300 Kelvin = " << a << " Celsius\\n";
    std::cout << "120 Fahrenheit = " << b << " Celsius\\n";
    return 0;
}`,
            language: 'cpp',
          },
        ]}
      />

      {/* ── Exercise 2: Vector Template ── */}
      <h3 className="font-bold mt-8">
        {t('Exercise 2 — Vector Class Template', 'Exercițiul 2 — Clasă template Vector')}
      </h3>
      <p>
        {t(
          'Implement a header-only Vector class template that manages a dynamic array. The class must support insertion, removal, sorting, printing, and deep copying (both copy and move semantics).',
          'Implementați o clasă template Vector (header-only) care gestionează un tablou dinamic. Clasa trebuie să suporte inserare, ștergere, sortare, afișare și copiere profundă (atât semantică de copiere, cât și de mutare).'
        )}
      </p>

      <Box type="definition">
        <p className="font-semibold mb-1">{t('Required interface:', 'Interfață necesară:')}</p>
        <ul className="list-disc ml-4 space-y-1 text-sm">
          <li><code>insert(index, element)</code> — {t('inserts element at the given index, shifting subsequent elements', 'inserează elementul la indexul dat, mutând elementele ulterioare')}</li>
          <li><code>remove(index)</code> — {t('removes the element at the given index', 'șterge elementul de la indexul dat')}</li>
          <li><code>sort(cmp)</code> — {t('sorts using a comparison function: cmp(a, b) returns -1, 0, or 1', 'sortează folosind o funcție de comparare: cmp(a, b) returnează -1, 0 sau 1')}</li>
          <li><code>sort()</code> — {t('sorts using operator< of the element type', 'sortează folosind operator< al tipului de element')}</li>
          <li><code>print()</code> — {t('prints all elements', 'afișează toate elementele')}</li>
          <li><code>{t('Copy constructor', 'Constructor de copiere')}</code> — {t('deep copy of all elements', 'copie profundă a tuturor elementelor')}</li>
          <li><code>{t('Move constructor', 'Constructor de mutare')}</code> — {t('transfers ownership of internal data', 'transferă posesiunea datelor interne')}</li>
          <li><code>operator[]</code> — {t('access element by index', 'acces la element după index')}</li>
        </ul>
      </Box>

      <Box type="warning">
        <p className="text-sm">
          {t(
            'Hint: Since this is a template, all code must be in the header file. Use new/delete for dynamic memory. Remember the Rule of Five: if you define a destructor, copy ctor, or move ctor, define all five special members.',
            'Indiciu: Deoarece este un template, tot codul trebuie să fie în fișierul header. Folosiți new/delete pentru memorie dinamică. Amintiți-vă Regula celor Cinci: dacă definiți un destructor, constructor de copiere sau de mutare, definiți toți cei cinci membri speciali.'
          )}
        </p>
      </Box>

      <p className="mt-4 font-semibold text-sm">{t('Starter code (main.cpp):', 'Cod inițial (main.cpp):')}</p>
      <Code>{`int compare_ints(int x, int y) {
    // return -1, 0, or 1
}
int main() {
    Vector<int> v;
    v.insert(0, 10);
    v.insert(1, 5);
    v.insert(2, 20);
    Vector<int> w = v;
    v.remove(0);
    v.sort(compare_ints);
    printf("%d\\n", w[0]);
    v.print();
}`}</Code>

      <MultiFileEditor
        files={[
          { name: 'Vector.h', content: '', language: 'cpp' },
          {
            name: 'main.cpp',
            content: `#include "Vector.h"
#include <cstdio>

int compare_ints(int x, int y) {
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
}

int main() {
    Vector<int> v;
    v.insert(0, 10);
    v.insert(1, 5);
    v.insert(2, 20);
    Vector<int> w = v;
    v.remove(0);
    v.sort(compare_ints);
    printf("%d\\n", w[0]);
    v.print();
    return 0;
}`,
            language: 'cpp',
          },
        ]}
      />
    </>
  );
}
