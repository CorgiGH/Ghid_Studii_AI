import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code } from '../../../components/ui';
import MultiFileEditor from '../../../components/ui/MultiFileEditor';

export default function Lab05() {
  const { t } = useApp();

  return (
    <>
      {/* ── Exercise 1: Number Class ── */}
      <h3 className="font-bold">
        {t('Exercise 1 — Number Class (Bases 2-16)', 'Exercițiul 1 — Clasa Number (Baze 2-16)')}
      </h3>
      <p>
        {t(
          'Implement a Number class that represents a number in any base from 2 to 16. The class must support base conversion, arithmetic operations between numbers in different bases, and comparison operators.',
          'Implementați o clasă Number care reprezintă un număr în orice bază de la 2 la 16. Clasa trebuie să suporte conversia între baze, operații aritmetice între numere în baze diferite și operatori de comparare.'
        )}
      </p>

      <Box type="definition">
        <p className="font-semibold mb-1">
          {t('Required operators:', 'Operatori necesari:')}
        </p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>
            {t(
              'operator+ — adds two Numbers (member function)',
              'operator+ — adună două obiecte Number (funcție membră)'
            )}
          </li>
          <li>
            {t(
              'operator- — subtracts two Numbers (friend function)',
              'operator- — scade două obiecte Number (funcție friend)'
            )}
          </li>
          <li>
            {t(
              'operator[] — returns the digit at a given index',
              'operator[] — returnează cifra de la un index dat'
            )}
          </li>
          <li>
            {t(
              'Comparison: >, <, >=, <=, ==',
              'Comparare: >, <, >=, <=, =='
            )}
          </li>
          <li>
            {t(
              'prefix -- — removes the most significant digit (MSB)',
              'prefix -- — elimină cifra cea mai semnificativă (MSB)'
            )}
          </li>
          <li>
            {t(
              'postfix -- — removes the least significant digit (LSB)',
              'postfix -- — elimină cifra cea mai puțin semnificativă (LSB)'
            )}
          </li>
          <li>
            {t(
              'Copy constructor, move constructor, move assignment operator',
              'Constructor de copiere, constructor de mutare, operator de atribuire prin mutare'
            )}
          </li>
        </ul>
      </Box>

      <Box type="warning">
        <p className="text-sm">
          {t(
            'When performing operations (+, -) on Numbers with different bases, the result must use the larger of the two bases. For example, adding a base-8 number and a base-16 number produces a base-16 result.',
            'Când se efectuează operații (+, -) pe obiecte Number cu baze diferite, rezultatul trebuie să folosească baza mai mare dintre cele două. De exemplu, adunarea unui număr în baza 8 cu unul în baza 16 produce un rezultat în baza 16.'
          )}
        </p>
      </Box>

      <p className="mt-3 font-semibold text-sm">
        {t('Starter interface:', 'Interfața de pornire:')}
      </p>
      <Code>{`class Number {
   // add data members
public:
   Number(const char * value, int base);
   ~Number();
   void SwitchBase(int newBase);
   void Print();
   int GetDigitsCount();
   int GetBase();
};`}</Code>

      <MultiFileEditor
        files={[
          {
            name: 'Number.h',
            content: `#pragma once

class Number {
   // add data members
public:
   Number(const char * value, int base);
   ~Number();
   void SwitchBase(int newBase);
   void Print();
   int GetDigitsCount();
   int GetBase();
};`,
            language: 'cpp',
          },
          {
            name: 'Number.cpp',
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
