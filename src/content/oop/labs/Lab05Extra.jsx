import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code } from '../../../components/ui';
import MultiFileEditor from '../../../components/ui/MultiFileEditor';

export default function Lab05Extra() {
  const { t } = useApp();

  return (
    <>
      {/* ── Exercise 1: Complex Class ── */}
      <h3 className="font-bold">
        {t('Exercise 1 — Complex Number Class', 'Exercițiul 1 — Clasa Număr Complex')}
      </h3>
      <p>
        {t(
          'Implement a Complex class that represents complex numbers with real and imaginary parts stored as doubles. The class must support arithmetic, comparison, increment/decrement, and stream output operators.',
          'Implementați o clasă Complex care reprezintă numere complexe cu partea reală și imaginară stocate ca double. Clasa trebuie să suporte operatori aritmetici, de comparare, de incrementare/decrementare și de afișare prin stream.'
        )}
      </p>

      <Box type="definition">
        <p className="font-semibold mb-1">
          {t('Required methods:', 'Metode necesare:')}
        </p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>
            {t(
              'is_real() — returns true if the imaginary part is zero',
              'is_real() — returnează true dacă partea imaginară este zero'
            )}
          </li>
          <li>
            {t(
              'real() — returns the real part',
              'real() — returnează partea reală'
            )}
          </li>
          <li>
            {t(
              'imag() — returns the imaginary part',
              'imag() — returnează partea imaginară'
            )}
          </li>
          <li>
            {t(
              'abs() — returns the modulus (magnitude) of the complex number',
              'abs() — returnează modulul (magnitudinea) numărului complex'
            )}
          </li>
          <li>
            {t(
              'conjugate() — returns the complex conjugate',
              'conjugate() — returnează conjugatul complex'
            )}
          </li>
        </ul>
      </Box>

      <Box type="definition">
        <p className="font-semibold mb-1">
          {t('Required operators (18 total):', 'Operatori necesari (18 în total):')}
        </p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>
            {t(
              'operator+, operator-, operator* — Complex + Complex, Complex + double, double + Complex (3 variants each = 9 operators)',
              'operator+, operator-, operator* — Complex + Complex, Complex + double, double + Complex (3 variante fiecare = 9 operatori)'
            )}
          </li>
          <li>
            {t(
              'Unary negation operator- (returns -z)',
              'Operator unar de negare operator- (returnează -z)'
            )}
          </li>
          <li>
            {t(
              'operator==, operator!= — equality and inequality comparison',
              'operator==, operator!= — comparare de egalitate și inegalitate'
            )}
          </li>
          <li>
            {t(
              'operator<< — stream output in format "a + bi" or "a - bi", omitting zero parts',
              'operator<< — afișare prin stream în format "a + bi" sau "a - bi", omițând părțile zero'
            )}
          </li>
          <li>
            {t(
              'prefix ++, postfix ++ — increment the real part',
              'prefix ++, postfix ++ — incrementează partea reală'
            )}
          </li>
          <li>
            {t(
              'prefix --, postfix -- — decrement the real part',
              'prefix --, postfix -- — decrementează partea reală'
            )}
          </li>
          <li>
            {t(
              'operator() — function call operator taking two doubles, sets new real and imaginary values',
              'operator() — operator de apel funcție cu două double-uri, setează noile valori reale și imaginare'
            )}
          </li>
        </ul>
      </Box>

      <Box type="warning">
        <p className="text-sm">
          {t(
            'Output format: "a + bi" when both parts are nonzero, "a" when imaginary is zero, "bi" when real is zero, and "0" when both are zero. Use " - " (with spaces) for negative imaginary parts, e.g. "3 - 2i".',
            'Format de afișare: "a + bi" când ambele părți sunt nenule, "a" când imaginarul este zero, "bi" când realul este zero și "0" când ambele sunt zero. Folosiți " - " (cu spații) pentru partea imaginară negativă, ex. "3 - 2i".'
          )}
        </p>
      </Box>

      <p className="mt-3 font-semibold text-sm">
        {t('Starter interface:', 'Interfața de pornire:')}
      </p>
      <Code>{`class Complex {
    double re, im;
public:
    Complex(double real = 0.0, double imag = 0.0);
    Complex(const Complex& other);

    bool is_real() const;
    double real() const;
    double imag() const;
    double abs() const;
    Complex conjugate() const;

    Complex operator+(const Complex& rhs) const;
    Complex operator-(const Complex& rhs) const;
    Complex operator*(const Complex& rhs) const;
    Complex operator-() const;  // unary negation

    bool operator==(const Complex& rhs) const;
    bool operator!=(const Complex& rhs) const;

    Complex& operator++();      // prefix ++
    Complex operator++(int);    // postfix ++
    Complex& operator--();      // prefix --
    Complex operator--(int);    // postfix --

    void operator()(double r, double i);

    friend Complex operator+(double lhs, const Complex& rhs);
    friend Complex operator-(double lhs, const Complex& rhs);
    friend Complex operator*(double lhs, const Complex& rhs);
    friend std::ostream& operator<<(std::ostream& os, const Complex& c);
};`}</Code>

      <MultiFileEditor
        files={[
          {
            name: 'complex.h',
            content: '',
            language: 'cpp',
          },
          {
            name: 'complex.cpp',
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
