import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function T2() {
  const { t, checked, toggleCheck } = useApp();
  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: ALO Lab Theme 2 — Minimizing a univariate function via the secant method, UAIC 2026.',
          'Sursă: ALO Tema 2 — Minimizarea unei funcții univariate prin metoda secantei, UAIC 2026.'
        )}
      </p>

      <Section
        title={t('1. Problem statement', '1. Enunțul problemei')}
        id="alo-t2-stmt"
        checked={!!checked['alo-t2-stmt']}
        onCheck={() => toggleCheck('alo-t2-stmt')}
      >
        <p>
          {t(
            'Given F : ℝ → ℝ twice differentiable, approximate a local or global minimum using the secant method applied to F′(x) = 0. Verify that the found point is indeed a minimum by checking F″(x*) > 0. Compare the two derivative approximation formulas.',
            'Dată F : ℝ → ℝ de două ori derivabilă, aproximați un minim local sau global folosind metoda secantei aplicată lui F′(x) = 0. Verificați că punctul găsit este minim prin F″(x*) > 0. Comparați cele două formule de aproximare a derivatei.'
          )}
        </p>
        <Box type="definition">
          <p className="font-bold mb-2">{t('Test functions', 'Funcții de test')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>F(x) = x³/3 − 2x² + 2x + 3 {t('— min at', '— minim în')} x* = 2 + √2 ≈ 3.414</li>
            <li>F(x) = x² + sin(x) {t('— min near', '— minim în apropierea lui')} x* ≈ −0.4502</li>
            <li>F(x) = x⁴ − 6x³ + 13x² − 12x + 4 {t('— minima at', '— minime în')} x* ∈ {'{1, 2}'}</li>
          </ul>
        </Box>
      </Section>

      <Section
        title={t('2. Secant method for root finding', '2. Metoda secantei pentru găsirea rădăcinii')}
        id="alo-t2-secant"
        checked={!!checked['alo-t2-secant']}
        onCheck={() => toggleCheck('alo-t2-secant')}
      >
        <p>
          {t(
            'The secant method approximates a root of g(x) = 0 (here g = F′) without computing derivatives analytically.',
            'Metoda secantei aproximează o rădăcină a lui g(x) = 0 (aici g = F′) fără a calcula derivatele analitic.'
          )}
        </p>
        <Code>{`// Secant method for g(x) = 0
x0, x1 = random initial values (chosen near x*)
k = 0
do {
    Δx = (x - x0) * g(x) / (g(x) - g(x0))
    if |g(x) - g(x0)| <= ε {
        if |g(x)| <= ε/100: Δx = 0  // x ≈ x*; STOP
        else: Δx = 1e-5
    }
    x0 = x
    x = x - Δx
    k++
} while (|Δx| >= ε  and  k <= kmax  and  |Δx| <= 1e8)
// Good: kmax = 1000, ε > 1e-5`}</Code>
        <Toggle
          question={t('When does the secant method fail?', 'Când eșuează metoda secantei?')}
          answer={t(
            'The method diverges when the initial points x0, x1 are far from x*. If g(xk) ≈ g(xk-1) (denominator ≈ 0) and |g(xk)| is not small, we use Δx = 10⁻⁵ to continue. Poor initial guesses may cause divergence (|Δx| > 10⁸). Try different starting points if the method diverges.',
            'Metoda diverge când punctele inițiale x0, x1 sunt departe de x*. Dacă g(xk) ≈ g(xk-1) (numitor ≈ 0) și |g(xk)| nu e mic, folosim Δx = 10⁻⁵. Alegeri proaste pot cauza divergență (|Δx| > 10⁸). Încercați puncte inițiale diferite dacă metoda diverge.'
          )}
        />
      </Section>

      <Section
        title={t('3. Derivative approximation formulas', '3. Formulele de aproximare a derivatei')}
        id="alo-t2-deriv"
        checked={!!checked['alo-t2-deriv']}
        onCheck={() => toggleCheck('alo-t2-deriv')}
      >
        <p>
          {t(
            'Instead of computing F′(x) analytically, use numerical formulas. Compare convergence speed (number of iterations for same precision ε) between the two formulas.',
            'În loc să calculăm F′(x) analitic, folosim formule numerice. Comparați viteza de convergență (număr de iterații pentru aceeași precizie ε) între cele două formule.'
          )}
        </p>
        <Box type="formula">
          <p className="font-bold mb-2 text-sm">{t('Formula 1 (3-point, 2nd order)', 'Formula 1 (3 puncte, ordin 2)')}</p>
          <p className="font-mono text-sm">G₁(x,h) = [3F(x) − 4F(x−h) + F(x−2h)] / (2h)</p>
          <p className="font-bold mt-3 mb-2 text-sm">{t('Formula 2 (5-point, 4th order)', 'Formula 2 (5 puncte, ordin 4)')}</p>
          <p className="font-mono text-sm">G₂(x,h) = [−F(x+2h) + 8F(x+h) − 8F(x−h) + F(x−2h)] / (12h)</p>
          <p className="mt-2 text-sm">{t('Use h = 10⁻⁵ or 10⁻⁶', 'Folosiți h = 10⁻⁵ sau 10⁻⁶')}</p>
        </Box>
        <Code>{`// 2nd-order approximation of F″ (to verify minimum)
F''(x) ≈ [−F(x+2h) + 16F(x+h) − 30F(x) + 16F(x−h) − F(x−2h)] / (12h²)
// Check F''(x*) > 0 for minimum`}</Code>
      </Section>
    </>
  );
}
