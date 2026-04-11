import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box } from '../../../components/ui';
import MultiFileEditor from '../../../components/ui/MultiFileEditor';

export default function Lab02() {
  const { t } = useApp();

  return (
    <div className="space-y-8">
      {/* ── Exercise 1: NumberList ── */}
      <section className="space-y-4">
        <h3 className="font-bold text-lg" style={{ color: 'var(--theme-content-text)' }}>
          {t('Exercise 1 — NumberList Class', 'Exercițiul 1 — Clasa NumberList')}
        </h3>

        <p style={{ color: 'var(--theme-content-text)' }}>
          {t(
            'Create a class that manages a fixed-size array of integers (maximum 10 elements).',
            'Creați o clasă care gestionează un tablou de dimensiune fixă de numere întregi (maxim 10 elemente).'
          )}
        </p>

        <Box type="definition" title={t('Class specification', 'Specificația clasei')}>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              {t(
                'Private members: an array of up to 10 integers and a count of current elements.',
                'Membri privați: un tablou de maxim 10 întregi și un contor al elementelor curente.'
              )}
            </li>
            <li>
              <code>Init()</code> — {t(
                'initializes the list (sets count to 0).',
                'inițializează lista (setează contorul la 0).'
              )}
            </li>
            <li>
              <code>Add(int)</code> — {t(
                'adds an integer to the list if not full.',
                'adaugă un întreg în listă dacă nu este plină.'
              )}
            </li>
            <li>
              <code>Sort()</code> — {t(
                'sorts the list in ascending order.',
                'sortează lista în ordine crescătoare.'
              )}
            </li>
            <li>
              <code>Print()</code> — {t(
                'prints all elements in the list.',
                'afișează toate elementele din listă.'
              )}
            </li>
          </ul>
        </Box>

        <MultiFileEditor
          files={[
            { name: 'NumberList.h', content: '', language: 'cpp' },
            { name: 'NumberList.cpp', content: '', language: 'cpp' },
            { name: 'main.cpp', content: '', language: 'cpp' },
          ]}
        />
      </section>

      {/* ── Exercise 2: Student ── */}
      <section className="space-y-4">
        <h3 className="font-bold text-lg" style={{ color: 'var(--theme-content-text)' }}>
          {t('Exercise 2 — Student Class', 'Exercițiul 2 — Clasa Student')}
        </h3>

        <p style={{ color: 'var(--theme-content-text)' }}>
          {t(
            'Create a Student class and five global comparison functions.',
            'Creați o clasă Student și cinci funcții globale de comparare.'
          )}
        </p>

        <Box type="definition" title={t('Class specification', 'Specificația clasei')}>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              {t(
                'Fields: name (string), three grades — math, english, history (float, range 1–10), and average (float).',
                'Câmpuri: nume (string), trei note — matematică, engleză, istorie (float, interval 1–10), și media (float).'
              )}
            </li>
            <li>
              {t(
                'The average should be computed from the three grades.',
                'Media trebuie calculată din cele trei note.'
              )}
            </li>
          </ul>
        </Box>

        <Box type="definition" title={t('Comparison functions', 'Funcții de comparare')}>
          <p className="mb-2">
            {t(
              'Implement 5 global (non-member) comparison functions. Each takes two Student references and returns:',
              'Implementați 5 funcții globale (non-membru) de comparare. Fiecare primește două referințe Student și returnează:'
            )}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><code>0</code> — {t('if equal', 'dacă sunt egale')}</li>
            <li><code>1</code> — {t('if first > second', 'dacă primul > al doilea')}</li>
            <li><code>-1</code> — {t('if first < second', 'dacă primul < al doilea')}</li>
          </ul>
          <p className="mt-2">
            {t('The five functions compare by:', 'Cele cinci funcții compară după:')}
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>{t('Name (alphabetical)', 'Nume (alfabetic)')}</li>
            <li>{t('Math grade', 'Nota la matematică')}</li>
            <li>{t('English grade', 'Nota la engleză')}</li>
            <li>{t('History grade', 'Nota la istorie')}</li>
            <li>{t('Average', 'Medie')}</li>
          </ol>
        </Box>

        <MultiFileEditor
          files={[
            { name: 'Student.h', content: '', language: 'cpp' },
            { name: 'Student.cpp', content: '', language: 'cpp' },
            { name: 'compare.h', content: '', language: 'cpp' },
            { name: 'compare.cpp', content: '', language: 'cpp' },
            { name: 'main.cpp', content: '', language: 'cpp' },
          ]}
        />
      </section>
    </div>
  );
}
