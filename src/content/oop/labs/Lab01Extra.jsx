import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box } from '../../../components/ui';
import MultiFileEditor from '../../../components/ui/MultiFileEditor';

export default function Lab01Extra() {
  const { t } = useApp();

  return (
    <>
      <h3 className="font-bold">
        {t('Debug Exercise — Find and Fix All Mistakes', 'Exercițiu de depanare — Găsiți și corectați toate greșelile')}
      </h3>
      <p>
        {t(
          'The two files below (header.h and source.cpp) contain multiple bugs: wrong parameter types, incorrect operations, missing break statements, wrong format specifiers, incorrect array sizes, and more. Find and fix all the mistakes so the program compiles and prints the expected output.',
          'Cele două fișiere de mai jos (header.h și source.cpp) conțin mai multe bug-uri: tipuri greșite de parametri, operații incorecte, instrucțiuni break lipsă, specificatori de format greșiți, dimensiuni incorecte ale vectorilor și altele. Găsiți și corectați toate greșelile astfel încât programul să compileze și să afișeze rezultatul așteptat.'
        )}
      </p>
      <Box type="warning">
        <p className="text-sm">
          {t(
            'Hint: Pay close attention to — (1) function signatures matching the header declarations, (2) each function performing its named operation, (3) the enum values and array indexing, (4) switch-case fall-through, (5) variable declarations and types, (6) the printf format specifier, (7) the input string length.',
            'Indiciu: Fiți atenți la — (1) semnăturile funcțiilor să corespundă declarațiilor din header, (2) fiecare funcție să realizeze operația din numele ei, (3) valorile enum și indexarea vectorului, (4) fall-through în switch-case, (5) declarațiile și tipurile variabilelor, (6) specificatorul de format din printf, (7) lungimea șirului de intrare.'
          )}
        </p>
      </Box>
      <MultiFileEditor
        files={[
          {
            name: 'header.h',
            content: `#pragma once
#include <stdio.h>
#include <time.h>
#include <stdlib.h>
#include <string.h>

#define MAX 1000

enum VALORI {
\tINMULTIRE = 0,
\tSUMA,
\tREZERVAT1,
\tDIFERENTA,
\tREZERVAT2,
\tIMPARTIRE
};

typedef int (*func)(int, int);

struct Content {
\tint p1;
\tint p2;
};

int Sum(int a, int b);
int Dif(int a, int b);
int Mul(int a, int b);
int Div(int a, int b);`,
            language: 'c',
          },
          {
            name: 'source.cpp',
            content: `#include "header.h"

int Sum(int a, float b) { return a - b; }
int Dif(char a, int b) { return a / b; }
int Mul(long a, int b) { return a + b; }
char Div(int a, int b) { return a * b; }

int main(int argc, char* argv[])
{
\tchar input[7] = "---H***E+++L+++L///O---P+++O/+-**O---";
\tfunc Operatori[4] = {Sum, Dif, 65, Mul, 0, Div};
\tint S, V;
\tContent x = 15;
\tdouble idx;

\tfor (i = 0; i < strlen(input); i++)
\t{
\t\tswitch (input[i] - 42)
\t\t{
\t\t\tcase INMULTIRE:
\t\t\t\tidx = 2;
\t\t\t\tx.p1 = 3;
\t\t\t\tx.p2 = 3;
\t\t\tcase SUMA:
\t\t\t\tidx = 0;
\t\t\t\tx.p1 = 7;
\t\t\t\tx.p2 = 5;
\t\t\tcase DIFERENTA:
\t\t\t\tidx = 1;
\t\t\t\tx.p1 = 10;
\t\t\t\tx.p2 = 1;
\t\t\tcase IMPARTIRE:
\t\t\t\tidx = 3;
\t\t\t\tx.p1 = 8;
\t\t\t\tx.p2 = 4;
\t\t}

\t\tS = S + Operatori[idx](x.p1, x.p2);
\t}

\tprintf("S = %c\\n", S);
\treturn 0;
}`,
            language: 'cpp',
          },
        ]}
        expectedOutput="S = 337"
      />
    </>
  );
}
