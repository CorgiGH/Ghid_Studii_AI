import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function T1() {
  const { t, checked, toggleCheck } = useApp();
  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: ALO Lab Theme 1 — Floating-point precision and polynomial approximation of tan, UAIC 2026.',
          'Sursă: ALO Tema 1 — Precizia în virgulă mobilă și aproximarea polinomială a funcției tan, UAIC 2026.'
        )}
      </p>

      <Section
        title={t('1. Machine epsilon', '1. Precizia mașinii')}
        id="alo-t1-epsilon"
        checked={!!checked['alo-t1-epsilon']}
        onCheck={() => toggleCheck('alo-t1-epsilon')}
      >
        <p>
          {t(
            'Find the smallest positive number u > 0 of the form u = 10⁻ᵐ (m ∈ ℕ) such that 1.0 + u ≠ 1.0 in computer arithmetic. This u is called the machine epsilon.',
            'Găsiți cel mai mic număr pozitiv u > 0, de forma u = 10⁻ᵐ (m ∈ ℕ), astfel că 1.0 +c u ≠ 1.0 în aritmetica calculatorului. Numărul u se numește precizia mașinii.'
          )}
        </p>
        <Toggle
          question={t('Hint', 'Indiciu')}
          answer={t(
            'Loop m from 1 upward: compute u = 10^(-m) and check 1.0 + u != 1.0. The first m for which this fails gives the machine epsilon. In IEEE 754 double precision, machine epsilon ≈ 2.22e-16 (so m ≈ 15 for powers of 10).',
            'Parcurgeți m de la 1 în sus: calculați u = 10^(-m) și verificați 1.0 + u != 1.0. Primul m pentru care condiția eșuează dă precizia mașinii. În IEEE 754 dublu, epsilon_mașinii ≈ 2.22e-16 (deci m ≈ 15 pentru puteri ale lui 10).'
          )}
        />
      </Section>

      <Section
        title={t('2. Non-associativity of floating-point addition', '2. Non-asociativitatea adunării în virgulă mobilă')}
        id="alo-t1-assoc"
        checked={!!checked['alo-t1-assoc']}
        onCheck={() => toggleCheck('alo-t1-assoc')}
      >
        <p>
          {t(
            'Using x = 1.0, y = u/10, z = u/10 (where u is the machine epsilon from part 1), verify: (x + y) + z ≠ x + (y + z). Also find x, y, z for which multiplication is non-associative: (x × y) × z ≠ x × (y × z).',
            'Folosind x = 1.0, y = u/10, z = u/10 (unde u este precizia mașinii de la punctul 1), verificați: (x +c y) +c z ≠ x +c (y +c z). Găsiți și x, y, z pentru care înmulțirea este non-asociativă: (x ×c y) ×c z ≠ x ×c (y ×c z).'
          )}
        </p>
        <Box type="warning">
          <p className="text-sm">
            {t(
              'Since y = z = u/10 < machine epsilon, adding y or z to 1.0 gives exactly 1.0. But (1.0 + y) + z = 1.0 + z = 1.0, while 1.0 + (y + z) = 1.0 + u = 1.0 + u ≠ 1.0 (because u ≥ machine epsilon). Non-associativity arises from rounding.',
              'Deoarece y = z = u/10 < epsilon_mașinii, adăugarea lui y sau z la 1.0 dă exact 1.0. Dar (1.0 + y) + z = 1.0, în timp ce 1.0 + (y + z) = 1.0 + u ≠ 1.0 (deoarece u ≥ epsilon_mașinii). Non-asociativitatea apare din rotunjire.'
            )}
          </p>
        </Box>
      </Section>

      <Section
        title={t('3. Polynomial approximation of tan', '3. Aproximarea polinomială a funcției tan')}
        id="alo-t1-tan"
        checked={!!checked['alo-t1-tan']}
        onCheck={() => toggleCheck('alo-t1-tan')}
      >
        <p>
          {t(
            'Implement a polynomial approximation of tan(x) using the MacLaurin-derived formula. Test it on 10,000 random values in (-π/2, π/2) and compare with the library function.',
            'Implementați aproximarea polinomială a funcției tan(x) folosind formula derivată cu MacLaurin. Testați pe 10.000 de valori aleatoare în (-π/2, π/2) și comparați cu funcția din bibliotecă.'
          )}
        </p>
        <Box type="definition">
          <p className="font-bold mb-2">{t('Approximation formula', 'Formula de aproximare')}</p>
          <p className="text-sm font-mono">
            {t(
              'tan(x) ≈ x + (1/3)x³ + (2/15)x⁵ + (17/315)x⁷ + (62/2835)x⁹',
              'tan(x) ≈ x + (1/3)x³ + (2/15)x⁵ + (17/315)x⁷ + (62/2835)x⁹'
            )}
          </p>
        </Box>
        <Code>{`// Constants (precomputed once)
c1 = 0.33333333333333333;
c2 = 0.13333333333333333;
c3 = 0.05396825396825397;
c4 = 0.02186948853615521;

my_tan(x):
    x2 = x * x
    x3 = x2 * x
    return x + x3 * (c1 + x2 * (c2 + x2 * (c3 + x2 * c4)))

// For |x| in [π/4, π/2): use tan(x) = 1/tan(π/2 - x)
// For x outside (-π/2, π/2): use periodicity + antisymmetry`}</Code>
        <Toggle
          question={t('What to measure and report', 'Ce să măsurați și să raportați')}
          answer={t(
            'Generate 10,000 values xi ∈ (-π/2, π/2). Compute: (1) sum of |tan(xi) - my_tan(xi)| over all i; (2) time for 10,000 library calls vs polynomial evaluations. The formula works best for x ∈ (-π/4, π/4); for larger arguments, use tan(x) = 1/tan(π/2 - x) to reduce into (-π/4, π/4).',
            'Generați 10.000 valori xi ∈ (-π/2, π/2). Calculați: (1) suma |tan(xi) - my_tan(xi)| pentru toți i; (2) timpul pentru 10.000 apeluri la bibliotecă vs evaluări polinomiale. Formula funcționează cel mai bine pentru x ∈ (-π/4, π/4); pentru argumente mai mari, folosiți tan(x) = 1/tan(π/2 - x) pentru reducere în (-π/4, π/4).'
          )}
        />
      </Section>
    </>
  );
}
