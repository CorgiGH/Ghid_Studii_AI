import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code } from '../../../components/ui';
import MultiFileEditor from '../../../components/ui/MultiFileEditor';

const mathHeaderCode = `class Math {
public:
    static int Add(int,int);
    static int Add(int,int,int);
    static int Add(double,double);
    static int Add(double,double,double);
    static int Mul(int,int);
    static int Mul(int,int,int);
    static int Mul(double,double);
    static int Mul(double,double,double);
    static int Add(int count,...);
    static char* Add(const char *, const char *);
};`;

const canvasHeaderCode = `class Canvas {
public:
    Canvas(int width, int height);
    void DrawCircle(int x, int y, int ray, char ch);
    void FillCircle(int x, int y, int ray, char ch);
    void DrawRect(int left, int top, int right, int bottom, char ch);
    void FillRect(int left, int top, int right, int bottom, char ch);
    void SetPoint(int x, int y, char ch);
    void DrawLine(int x1, int y1, int x2, int y2, char ch);
    void Print();
    void Clear();
};`;

export default function Lab03() {
  const { t } = useApp();

  return (
    <>
      {/* ── Exercise 1: Math Class ── */}
      <h3 className="font-bold">
        {t('Exercise 1 — Math Class (Static Overloaded Methods)', 'Exercițiul 1 — Clasa Math (Metode statice supraincarcate)')}
      </h3>
      <p>
        {t(
          'Implement a Math class with static overloaded methods for addition and multiplication. The class should handle both int and double types, with 2 and 3 parameter variants for each.',
          'Implementați o clasă Math cu metode statice supraincărcate pentru adunare și multiplicare. Clasa trebuie să gestioneze atât tipuri int cât și double, cu variante de 2 și 3 parametri pentru fiecare.'
        )}
      </p>
      <Box type="definition">
        <p className="text-sm font-semibold mb-1">{t('Requirements:', 'Cerințe:')}</p>
        <ul className="text-sm list-disc ml-4 space-y-1">
          <li>
            {t(
              'Add and Mul overloads for int and double, with 2 and 3 parameters each.',
              'Supraincărcări Add și Mul pentru int și double, cu câte 2 și 3 parametri fiecare.'
            )}
          </li>
          <li>
            {t(
              'A variadic Add(int count, ...) that sums count integers passed as variable arguments.',
              'Un Add variadic Add(int count, ...) care adună count numere întregi transmise ca argumente variabile.'
            )}
          </li>
          <li>
            {t(
              'A string Add(const char*, const char*) that concatenates two C-strings into a newly allocated buffer. Returns nullptr if either input is null.',
              'Un Add pentru șiruri Add(const char*, const char*) care concatenează două C-stringuri într-un buffer nou alocat. Returnează nullptr dacă oricare dintre intrări este null.'
            )}
          </li>
        </ul>
      </Box>
      <Box type="warning">
        <p className="text-sm">
          {t(
            'Hint: Use <cstdarg> for the variadic method (va_list, va_start, va_arg, va_end). For string concatenation, allocate memory with new char[len1 + len2 + 1] and use strcpy/strcat.',
            'Indiciu: Folosiți <cstdarg> pentru metoda variadică (va_list, va_start, va_arg, va_end). Pentru concatenarea șirurilor, alocați memorie cu new char[len1 + len2 + 1] și folosiți strcpy/strcat.'
          )}
        </p>
      </Box>
      <p className="text-sm font-semibold mt-2 mb-1">{t('Starter interface (Math.h):', 'Interfața de pornire (Math.h):')}</p>
      <Code language="cpp">{mathHeaderCode}</Code>
      <MultiFileEditor
        files={[
          { name: 'Math.h', content: mathHeaderCode, language: 'cpp' },
          { name: 'Math.cpp', content: '', language: 'cpp' },
          { name: 'main.cpp', content: '', language: 'cpp' },
        ]}
      />

      {/* ── Exercise 2: Canvas Class ── */}
      <h3 className="font-bold mt-6">
        {t('Exercise 2 — Canvas Class (2D Drawing)', 'Exercițiul 2 — Clasa Canvas (Desen 2D)')}
      </h3>
      <p>
        {t(
          'Implement a Canvas class that manages a 2D character matrix and provides drawing primitives. The canvas should support drawing and filling circles and rectangles, setting individual points, and drawing lines.',
          'Implementați o clasă Canvas care gestionează o matrice 2D de caractere și oferă primitive de desenare. Canvas-ul trebuie să suporte desenarea și umplerea cercurilor și dreptunghiurilor, setarea punctelor individuale și desenarea liniilor.'
        )}
      </p>
      <Box type="definition">
        <p className="text-sm font-semibold mb-1">{t('Requirements:', 'Cerințe:')}</p>
        <ul className="text-sm list-disc ml-4 space-y-1">
          <li>
            {t(
              'Constructor takes width and height, initializes the matrix with spaces.',
              'Constructorul primește lățimea și înălțimea, inițializează matricea cu spații.'
            )}
          </li>
          <li>
            {t(
              'DrawCircle / FillCircle — draw the outline or fill a circle at (x, y) with given radius using the specified character.',
              'DrawCircle / FillCircle — desenează conturul sau umple un cerc la (x, y) cu raza dată folosind caracterul specificat.'
            )}
          </li>
          <li>
            {t(
              'DrawRect / FillRect — draw the outline or fill a rectangle defined by (left, top, right, bottom).',
              'DrawRect / FillRect — desenează conturul sau umple un dreptunghi definit prin (left, top, right, bottom).'
            )}
          </li>
          <li>
            {t(
              'DrawLine — draw a line from (x1,y1) to (x2,y2) using Bresenham\'s line algorithm.',
              'DrawLine — desenează o linie de la (x1,y1) la (x2,y2) folosind algoritmul lui Bresenham.'
            )}
          </li>
          <li>
            {t(
              'Print — display the canvas to stdout. Clear — reset all cells to spaces.',
              'Print — afișează canvas-ul la stdout. Clear — resetează toate celulele la spații.'
            )}
          </li>
        </ul>
      </Box>
      <Box type="warning">
        <p className="text-sm">
          {t(
            'Hint: For circles, iterate over all points and check if (dx*dx + dy*dy) falls within the radius range. For Bresenham\'s line, track an error term and step in x/y accordingly.',
            'Indiciu: Pentru cercuri, iterați prin toate punctele și verificați dacă (dx*dx + dy*dy) se încadrează în intervalul razei. Pentru linia Bresenham, urmăriți un termen de eroare și avansați în x/y corespunzător.'
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
