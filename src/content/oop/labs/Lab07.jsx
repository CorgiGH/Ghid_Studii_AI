import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code } from '../../../components/ui';
import MultiFileEditor from '../../../components/ui/MultiFileEditor';

export default function Lab07() {
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

      {/* ── Exercise 2: Generic Tree ── */}
      <h3 className="font-bold mt-8">
        {t('Exercise 2 — Generic Tree Template', 'Exercițiul 2 — Arbore generic (template)')}
      </h3>
      <p>
        {t(
          'Implement a generic tree data structure as a C++ template class. Do not use STL containers for storing children — use a dynamically allocated array or linked list instead.',
          'Implementați o structură de date de tip arbore generic ca o clasă template C++. Nu folosiți containere STL pentru stocarea copiilor — folosiți un tablou alocat dinamic sau o listă înlănțuită.'
        )}
      </p>

      <Box type="definition">
        <p className="font-semibold mb-1">{t('Required methods:', 'Metode necesare:')}</p>
        <ul className="list-disc ml-4 space-y-1 text-sm">
          <li><code>add_node(parent)</code> — {t('adds a new child node under the given parent', 'adaugă un nod copil sub părintele dat')}</li>
          <li><code>get_node(parent)</code> — {t('retrieves a node by parent reference', 'recuperează un nod după referința părintelui')}</li>
          <li><code>delete_node</code> — {t('removes a node and its subtree', 'șterge un nod și subarborele său')}</li>
          <li><code>find(callback)</code> — {t('searches the tree using a callback predicate', 'caută în arbore folosind un predicat callback')}</li>
          <li><code>insert(parent, index)</code> — {t('inserts a node at a specific child index', 'inserează un nod la un index specific de copil')}</li>
          <li><code>sort(callback)</code> — {t('sorts children using a comparison callback', 'sortează copiii folosind un callback de comparare')}</li>
          <li><code>count(node)</code> — {t('returns the number of nodes in the subtree', 'returnează numărul de noduri din subarbore')}</li>
        </ul>
      </Box>

      <Box type="warning">
        <p className="text-sm">
          {t(
            'Hint: Each tree node should store a value of type T, a pointer to its first child, and a pointer to its next sibling (child-sibling representation). Alternatively, store a dynamic array of child pointers.',
            'Indiciu: Fiecare nod al arborelui trebuie să stocheze o valoare de tip T, un pointer către primul copil și un pointer către următorul frate (reprezentare copil-frate). Alternativ, stocați un tablou dinamic de pointeri la copii.'
          )}
        </p>
      </Box>

      <MultiFileEditor
        files={[
          { name: 'Tree.h', content: '', language: 'cpp' },
          { name: 'main.cpp', content: '', language: 'cpp' },
        ]}
      />
    </>
  );
}
