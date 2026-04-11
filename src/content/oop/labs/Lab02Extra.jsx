import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box } from '../../../components/ui';
import MultiFileEditor from '../../../components/ui/MultiFileEditor';

export default function Lab02Extra() {
  const { t } = useApp();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="font-bold text-lg" style={{ color: 'var(--theme-content-text)' }}>
          {t('Exercise — Movie & MovieSeries Classes', 'Exercițiu — Clasele Movie și MovieSeries')}
        </h3>

        <p style={{ color: 'var(--theme-content-text)' }}>
          {t(
            'Create a Movie class and a MovieSeries class that manages a collection of movies, along with five comparison functions.',
            'Creați o clasă Movie și o clasă MovieSeries care gestionează o colecție de filme, împreună cu cinci funcții de comparare.'
          )}
        </p>

        <Box type="definition" title={t('Movie class specification', 'Specificația clasei Movie')}>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              {t(
                'Name: character array of up to 256 characters.',
                'Nume: tablou de caractere de maxim 256 caractere.'
              )}
            </li>
            <li>
              {t(
                'Release year: integer.',
                'Anul lansării: întreg.'
              )}
            </li>
            <li>
              {t(
                'IMDB score: double, range 1–10.',
                'Scor IMDB: double, interval 1–10.'
              )}
            </li>
            <li>
              {t(
                'Length: integer (minutes).',
                'Durata: întreg (minute).'
              )}
            </li>
            <li>
              {t(
                'Getter and setter for each field.',
                'Getter și setter pentru fiecare câmp.'
              )}
            </li>
            <li>
              {t(
                'A method that returns the number of years since release (based on the current year).',
                'O metodă care returnează numărul de ani de la lansare (bazat pe anul curent).'
              )}
            </li>
          </ul>
        </Box>

        <Box type="definition" title={t('MovieSeries class specification', 'Specificația clasei MovieSeries')}>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              {t(
                'Stores up to 16 pointers to Movie objects.',
                'Stochează până la 16 pointeri la obiecte Movie.'
              )}
            </li>
            <li>
              <code>Init()</code> — {t(
                'initializes the series (sets count to 0).',
                'inițializează seria (setează contorul la 0).'
              )}
            </li>
            <li>
              <code>Add(Movie*)</code> — {t(
                'adds a movie pointer to the series if not full.',
                'adaugă un pointer la film în serie dacă nu este plină.'
              )}
            </li>
            <li>
              <code>Print()</code> — {t(
                'prints information about all movies in the series.',
                'afișează informațiile despre toate filmele din serie.'
              )}
            </li>
            <li>
              <code>Sort()</code> — {t(
                'sorts movies by years since release in descending order.',
                'sortează filmele după numărul de ani de la lansare în ordine descrescătoare.'
              )}
            </li>
          </ul>
        </Box>

        <Box type="definition" title={t('Comparison functions', 'Funcții de comparare')}>
          <p className="mb-2">
            {t(
              'Implement 5 global comparison functions. Each takes two Movie references and returns:',
              'Implementați 5 funcții globale de comparare. Fiecare primește două referințe Movie și returnează:'
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
            <li>{t('Release year', 'Anul lansării')}</li>
            <li>{t('IMDB score', 'Scor IMDB')}</li>
            <li>{t('Length in minutes', 'Durata în minute')}</li>
            <li>{t('Years since release', 'Ani de la lansare')}</li>
          </ol>
        </Box>

        <MultiFileEditor
          files={[
            { name: 'movie.h', content: '', language: 'cpp' },
            { name: 'movie.cpp', content: '', language: 'cpp' },
            { name: 'movieseries.h', content: '', language: 'cpp' },
            { name: 'movieseries.cpp', content: '', language: 'cpp' },
            { name: 'comparison.h', content: '', language: 'cpp' },
            { name: 'comparison.cpp', content: '', language: 'cpp' },
            { name: 'main.cpp', content: '', language: 'cpp' },
          ]}
        />
      </section>
    </div>
  );
}
