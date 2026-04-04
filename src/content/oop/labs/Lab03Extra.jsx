import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code } from '../../../components/ui';
import MultiFileEditor from '../../../components/ui/MultiFileEditor';

const canvasHeaderCode = `class Canvas {
  public:
    Canvas(int lines, int columns);
    void set_pixel(int x, int y, char value);
    void set_pixels(int count, ...);
    void clear();
    void print() const;
};`;

export default function Lab03Extra() {
  const { t } = useApp();

  return (
    <>
      {/* ── Exercise 1: Math Class (Practice) ── */}
      <h3 className="font-bold">
        {t('Exercise 1 — Math Class (Practice Reimplementation)', 'Exercițiul 1 — Clasa Math (Reimplementare de practică)')}
      </h3>
      <p>
        {t(
          'Reimplement the Math class from Lab 3 from scratch as additional practice. The class should have the same static overloaded Add and Mul methods for int and double (2 and 3 parameters), a variadic Add(int count, ...), and a string concatenation Add(const char*, const char*).',
          'Reimplementați clasa Math din Laboratorul 3 de la zero ca practică suplimentară. Clasa trebuie să aibă aceleași metode statice supraîncărcate Add și Mul pentru int și double (2 și 3 parametri), un Add variadic Add(int count, ...) și un Add de concatenare șiruri Add(const char*, const char*).'
        )}
      </p>
      <Box type="definition">
        <p className="text-sm font-semibold mb-1">{t('Requirements:', 'Cerințe:')}</p>
        <ul className="text-sm list-disc ml-4 space-y-1">
          <li>
            {t(
              'Static Add and Mul overloads for int and double, each with 2 and 3 parameter variants.',
              'Supraîncărcări statice Add și Mul pentru int și double, fiecare cu variante de 2 și 3 parametri.'
            )}
          </li>
          <li>
            {t(
              'Variadic Add(int count, ...) that sums count integers using <cstdarg>.',
              'Add variadic Add(int count, ...) care adună count numere întregi folosind <cstdarg>.'
            )}
          </li>
          <li>
            {t(
              'String Add(const char*, const char*) that concatenates into a new buffer. Returns nullptr if either input is null.',
              'Add pentru șiruri Add(const char*, const char*) care concatenează într-un buffer nou. Returnează nullptr dacă oricare intrare este null.'
            )}
          </li>
        </ul>
      </Box>
      <Box type="warning">
        <p className="text-sm">
          {t(
            'Hint: This time, try writing the header yourself from memory. Use <cstdarg> for variadic arguments and dynamic allocation (new/delete[]) for string concatenation.',
            'Indiciu: De data aceasta, încercați să scrieți header-ul din memorie. Folosiți <cstdarg> pentru argumente variadice și alocare dinamică (new/delete[]) pentru concatenarea șirurilor.'
          )}
        </p>
      </Box>
      <MultiFileEditor
        files={[
          { name: 'Math.h', content: '', language: 'cpp' },
          { name: 'Math.cpp', content: '', language: 'cpp' },
          { name: 'main.cpp', content: '', language: 'cpp' },
        ]}
      />

      {/* ── Exercise 2: Canvas Class (Variadic) ── */}
      <h3 className="font-bold mt-6">
        {t('Exercise 2 — Canvas Class (Variadic Pixels)', 'Exercițiul 2 — Clasa Canvas (Pixeli variadici)')}
      </h3>
      <p>
        {t(
          'Implement a simplified Canvas class that uses a 2D character matrix. This version focuses on pixel-level operations with a variadic set_pixels method that accepts multiple (x, y, value) tuples at once.',
          'Implementați o clasă Canvas simplificată care folosește o matrice 2D de caractere. Această versiune se concentrează pe operații la nivel de pixel cu o metodă variadică set_pixels care acceptă mai multe tuple (x, y, valoare) simultan.'
        )}
      </p>
      <Box type="definition">
        <p className="text-sm font-semibold mb-1">{t('Requirements:', 'Cerințe:')}</p>
        <ul className="text-sm list-disc ml-4 space-y-1">
          <li>
            {t(
              'Constructor takes lines and columns, initializes the matrix with spaces.',
              'Constructorul primește linii și coloane, inițializează matricea cu spații.'
            )}
          </li>
          <li>
            {t(
              'set_pixel(x, y, value) — sets a single character at position (x, y).',
              'set_pixel(x, y, value) — setează un singur caracter la poziția (x, y).'
            )}
          </li>
          <li>
            {t(
              'set_pixels(int count, ...) — variadic method that sets count pixels. Each pixel is passed as three arguments: int x, int y, char value.',
              'set_pixels(int count, ...) — metodă variadică care setează count pixeli. Fiecare pixel este transmis ca trei argumente: int x, int y, char value.'
            )}
          </li>
          <li>
            {t(
              'clear() — resets all cells to spaces. print() — displays the canvas to stdout.',
              'clear() — resetează toate celulele la spații. print() — afișează canvas-ul la stdout.'
            )}
          </li>
        </ul>
      </Box>
      <Box type="warning">
        <p className="text-sm">
          {t(
            'Hint: In set_pixels, use va_arg to read int, int, int (char is promoted to int in variadic calls) for each of the count pixels.',
            'Indiciu: În set_pixels, folosiți va_arg pentru a citi int, int, int (char este promovat la int în apeluri variadice) pentru fiecare dintre cei count pixeli.'
          )}
        </p>
      </Box>
      <p className="text-sm font-semibold mt-2 mb-1">{t('Starter interface (Canvas.h):', 'Interfața de pornire (Canvas.h):')}</p>
      <Code language="cpp">{canvasHeaderCode}</Code>
      <MultiFileEditor
        files={[
          { name: 'Canvas.h', content: canvasHeaderCode, language: 'cpp' },
          { name: 'Canvas.cpp', content: '', language: 'cpp' },
          { name: 'main.cpp', content: '', language: 'cpp' },
        ]}
      />
    </>
  );
}
