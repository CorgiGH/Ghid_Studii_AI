import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar03() {
  const { t } = useApp();

  /* ─── P1: graphical interpretation ─── */
  const mc1a = [{
    question: {
      en: 'Geometrically, the system { x₁ + 2x₂ = 0;  x₁ − x₂ = 0 } has',
      ro: 'Geometric, sistemul { x₁ + 2x₂ = 0;  x₁ − x₂ = 0 } are',
    },
    options: [
      { text: { en: 'a unique solution x = (0, 0)ᵀ — two lines through the origin with different slopes', ro: 'soluție unică x = (0, 0)ᵀ — două drepte prin origine cu pante diferite' }, correct: true },
      { text: { en: 'no solution — parallel lines', ro: 'fără soluție — drepte paralele' }, correct: false },
      { text: { en: 'infinitely many solutions — coincident lines', ro: 'infinitate de soluții — drepte suprapuse' }, correct: false },
      { text: 'x = (1, 1)ᵀ', correct: false },
    ],
    explanation: {
      en: 'Both lines pass through (0, 0). Their slopes (−1/2 and 1) differ, so they intersect only at the origin — the unique solution.',
      ro: 'Ambele drepte trec prin (0, 0). Pantele lor (−1/2 și 1) diferă, deci se intersectează doar la origine — soluția unică.',
    },
  }];

  const mc1c = [{
    question: {
      en: 'Geometrically, the system { 2x₁ + x₂ = −1;  x₁ + x₂ = 2;  x₁ − 3x₂ = 5 } has',
      ro: 'Geometric, sistemul { 2x₁ + x₂ = −1;  x₁ + x₂ = 2;  x₁ − 3x₂ = 5 } are',
    },
    options: [
      { text: { en: 'no solution — three lines with no common point', ro: 'fără soluție — trei drepte fără punct comun' }, correct: true },
      { text: { en: 'a unique solution at (−3, 5)', ro: 'soluție unică în (−3, 5)' }, correct: false },
      { text: { en: 'infinitely many solutions', ro: 'infinitate de soluții' }, correct: false },
      { text: { en: 'exactly two solutions', ro: 'exact două soluții' }, correct: false },
    ],
    explanation: {
      en: 'The first two lines meet at (−3, 5). Substituting into the third: −3 − 15 = −18 ≠ 5. The third line does not pass through the meeting point, so the three lines share no common point.',
      ro: 'Primele două drepte se întâlnesc în (−3, 5). Substituind în a treia: −3 − 15 = −18 ≠ 5. A treia dreaptă nu trece prin acest punct, deci cele trei drepte nu au punct comun.',
    },
  }];

  const mc1b = [{
    question: {
      en: 'Geometrically, the system { x₁ + 2x₂ = 3;  −2x₁ − 4x₂ = 6 } has',
      ro: 'Geometric, sistemul { x₁ + 2x₂ = 3;  −2x₁ − 4x₂ = 6 } are',
    },
    options: [
      { text: { en: 'no solutions — two parallel distinct lines', ro: 'nicio soluție — două drepte paralele distincte' }, correct: true },
      { text: { en: 'a unique solution — two intersecting lines', ro: 'soluție unică — două drepte secante' }, correct: false },
      { text: { en: 'infinitely many solutions — the same line twice', ro: 'infinitate de soluții — aceeași dreaptă de două ori' }, correct: false },
      { text: { en: 'exactly two solutions', ro: 'exact două soluții' }, correct: false },
    ],
    explanation: {
      en: 'Divide the second equation by −2: x₁ + 2x₂ = −3. Same slope as the first (x₁ + 2x₂ = 3) but different intercept, so the two lines are parallel and distinct — no intersection.',
      ro: 'Împărțim a doua ecuație la −2: x₁ + 2x₂ = −3. Aceeași pantă ca prima (x₁ + 2x₂ = 3), dar ordonată la origine diferită, deci cele două drepte sunt paralele și distincte — fără intersecție.',
    },
  }];

  const mc1d = [{
    question: {
      en: 'The system { 2x₁ + x₂ + x₃ = 1;  2x₁ + 4x₂ − x₃ = −1 } describes the intersection of',
      ro: 'Sistemul { 2x₁ + x₂ + x₃ = 1;  2x₁ + 4x₂ − x₃ = −1 } descrie intersecția dintre',
    },
    options: [
      { text: { en: 'two non-parallel planes in ℝ³ — a line of solutions', ro: 'două plane ne-paralele în ℝ³ — o dreaptă de soluții' }, correct: true },
      { text: { en: 'two parallel planes — no solutions', ro: 'două plane paralele — fără soluții' }, correct: false },
      { text: { en: 'the same plane twice — a plane of solutions', ro: 'același plan de două ori — un plan de soluții' }, correct: false },
      { text: { en: 'three planes — unique solution', ro: 'trei plane — soluție unică' }, correct: false },
    ],
    explanation: {
      en: 'Two independent equations in ℝ³ define two planes. Their normal vectors (2,1,1) and (2,4,−1) are non-parallel, so the planes meet along a line — the solution set is 1-parameter.',
      ro: 'Două ecuații independente în ℝ³ definesc două plane. Normalele (2,1,1) și (2,4,−1) nu sunt paralele, deci planele se intersectează după o dreaptă — mulțimea soluțiilor este 1-parametrică.',
    },
  }];

  /* ─── P2: parametric system ─── */
  const mc2a = [{
    question: {
      en: 'For which value(s) of α does the system (with coefficient matrix depending on α) have NO solution?',
      ro: 'Pentru ce valoare (valori) ale lui α sistemul (cu matricea coeficienților depinzând de α) NU are soluție?',
    },
    options: [
      { text: 'α = 1', correct: true },
      { text: 'α = −1', correct: false },
      { text: 'α = 0', correct: false },
      { text: { en: 'no such α', ro: 'nicio astfel de α' }, correct: false },
    ],
    explanation: {
      en: 'Adding Eq1 + Eq2 gives x₂ = 1. Eliminating x₁ leads to x₃·(1 − α²) = 1 + α. At α = 1 the left side is 0 but the right side is 2 — contradiction, so no solution.',
      ro: 'Adunând Eq1 + Eq2 obținem x₂ = 1. Eliminând x₁ ajungem la x₃·(1 − α²) = 1 + α. La α = 1 partea stângă este 0 dar cea dreaptă este 2 — contradicție, deci fără soluție.',
    },
  }];

  const mc2b = [{
    question: {
      en: 'For which value(s) of α does the system have INFINITELY many solutions?',
      ro: 'Pentru ce valoare (valori) ale lui α sistemul are o INFINITATE de soluții?',
    },
    options: [
      { text: 'α = −1', correct: true },
      { text: 'α = 1', correct: false },
      { text: { en: 'every α ≠ ±1', ro: 'orice α ≠ ±1' }, correct: false },
      { text: { en: 'no such α', ro: 'nicio astfel de α' }, correct: false },
    ],
    explanation: {
      en: 'At α = −1 the reduced equation becomes 0·x₃ = 0, which is always true, and the first two equations collapse to the third via addition — so there is a 1-parameter family of solutions.',
      ro: 'La α = −1 ecuația redusă devine 0·x₃ = 0, întotdeauna satisfăcută, iar primele două ecuații se reduc la a treia prin adunare — deci există o familie 1-parametrică de soluții.',
    },
  }];

  const mc2c = [{
    question: {
      en: 'When α ≠ ±1 the unique solution is',
      ro: 'Când α ≠ ±1 soluția unică este',
    },
    options: [
      { text: 'x = (−1/(1 − α), 1, 1/(1 − α))ᵀ', correct: true },
      { text: 'x = (1/(1 − α), 1, −1/(1 − α))ᵀ', correct: false },
      { text: 'x = (0, 1, 0)ᵀ', correct: false },
      { text: 'x = (1, 0, 1)ᵀ', correct: false },
    ],
    explanation: {
      en: 'From x₃(1 − α²) = 1 + α with α ≠ ±1: x₃ = 1/(1 − α). Back-substitution gives x₂ = 1 and x₁ = −1/(1 − α). Sanity check α = 0: x = (−1, 1, 1), which satisfies all three equations.',
      ro: 'Din x₃(1 − α²) = 1 + α cu α ≠ ±1: x₃ = 1/(1 − α). Substituția inversă dă x₂ = 1 și x₁ = −1/(1 − α). Verificare α = 0: x = (−1, 1, 1) satisface toate ecuațiile.',
    },
  }];

  /* ─── P3 ─── */
  const mc3nopivot = [{
    question: {
      en: 'For system (a), Gauss elimination WITHOUT pivoting fails at the first step because',
      ro: 'Pentru sistemul (a), eliminarea Gauss FĂRĂ pivotare eșuează la primul pas deoarece',
    },
    options: [
      { text: { en: 'after row 3 − row 1, the (2, 2) entry is 0 (no usable pivot)', ro: 'după linia 3 − linia 1, elementul (2, 2) este 0 (fără pivot utilizabil)' }, correct: false },
      { text: { en: 'after row 2 − 3·row 1, the (2, 2) entry is 0 (no usable pivot for x₂)', ro: 'după linia 2 − 3·linia 1, elementul (2, 2) este 0 (fără pivot utilizabil pentru x₂)' }, correct: true },
      { text: { en: 'the right-hand side is inconsistent', ro: 'partea dreaptă este inconsistentă' }, correct: false },
      { text: { en: 'the determinant is zero', ro: 'determinantul este zero' }, correct: false },
    ],
    explanation: {
      en: 'Row 2 − 3·Row 1 = (0, 0, −8 | −7). The x₂-pivot in row 2 collapses to zero, so naïve elimination cannot continue without swapping rows. Partial pivoting would have put the 3 from row 2 on top first.',
      ro: 'Linia 2 − 3·Linia 1 = (0, 0, −8 | −7). Pivotul x₂ în linia 2 devine zero, deci eliminarea naivă nu poate continua fără interschimbarea liniilor. Pivotarea parțială ar fi adus 3 din linia 2 în vârf mai întâi.',
    },
  }];

  const mc3c = [{
    question: {
      en: 'For system (c) (a lower-triangular system in disguise), the solution is',
      ro: 'Pentru sistemul (c) (deja triunghiular inferior), soluția este',
    },
    options: [
      { text: 'x = (1.5, 2, −1.2, 3)ᵀ', correct: true },
      { text: 'x = (3, 3, −6.6, 0.8)ᵀ', correct: false },
      { text: 'x = (1.5, 2, −6.6, 3)ᵀ', correct: false },
      { text: 'x = (3/2, 3, −1.2, 3)ᵀ', correct: false },
    ],
    explanation: {
      en: 'Forward-substitute row by row: 2x₁ = 3 ⇒ x₁ = 1.5; then 1.5 + 1.5x₂ = 4.5 ⇒ x₂ = 2; then −6 + 0.5x₃ = −6.6 ⇒ x₃ = −1.2; finally 3 − 4 − 1.2 + x₄ = 0.8 ⇒ x₄ = 3.',
      ro: 'Substituție directă linie cu linie: 2x₁ = 3 ⇒ x₁ = 1.5; apoi 1.5 + 1.5x₂ = 4.5 ⇒ x₂ = 2; apoi −6 + 0.5x₃ = −6.6 ⇒ x₃ = −1.2; în final 3 − 4 − 1.2 + x₄ = 0.8 ⇒ x₄ = 3.',
    },
  }];

  const mc3d = [{
    question: {
      en: 'For system (d), Gauss elimination reveals',
      ro: 'Pentru sistemul (d), eliminarea Gauss arată că',
    },
    options: [
      { text: { en: 'it is inconsistent — no solution', ro: 'este inconsistent — fără soluție' }, correct: true },
      { text: { en: 'it has a unique solution x = (1, 1, 1, −1)ᵀ', ro: 'are soluție unică x = (1, 1, 1, −1)ᵀ' }, correct: false },
      { text: { en: 'it has infinitely many solutions', ro: 'are o infinitate de soluții' }, correct: false },
      { text: { en: 'the coefficient matrix is singular but the system is consistent', ro: 'matricea coeficienților este singulară dar sistemul este compatibil' }, correct: false },
    ],
    explanation: {
      en: 'Row 2 − Row 1 gives x₁ − x₃ = −1. Row 4 − Row 3 gives x₁ − x₃ = 3. These two consequences of the system contradict each other, so the system is inconsistent.',
      ro: 'Linia 2 − Linia 1 dă x₁ − x₃ = −1. Linia 4 − Linia 3 dă x₁ − x₃ = 3. Două consecințe ale sistemului se contrazic, deci sistemul este inconsistent.',
    },
  }];

  /* ─── P4 ─── */
  const mc4cost = [{
    question: {
      en: 'Between (a) Gauss elimination on the extended matrix and (b) computing A⁻¹ then multiplying, which needs more operations for this 4×4 problem with two RHS vectors?',
      ro: 'Între (a) eliminarea Gauss pe matricea extinsă și (b) calculul A⁻¹ apoi înmulțirea, care cere mai multe operații pentru această problemă 4×4 cu doi vectori RHS?',
    },
    options: [
      { text: { en: 'Computing A⁻¹ explicitly (≈ 3× the cost of one Gauss elimination)', ro: 'Calculul A⁻¹ explicit (≈ 3× costul unei eliminări Gauss)' }, correct: true },
      { text: { en: 'Gauss elimination on the extended matrix', ro: 'Eliminarea Gauss pe matricea extinsă' }, correct: false },
      { text: { en: 'They cost the same', ro: 'Ambele au același cost' }, correct: false },
      { text: { en: 'Depends on the right-hand side', ro: 'Depinde de partea dreaptă' }, correct: false },
    ],
    explanation: {
      en: 'Gauss on [A | b₁ b₂] does the elimination once and back-solves twice: ≈ n³/3 + 2n² = 32 + 32 ≈ 64 mults. Computing A⁻¹ needs ≈ n³ (≈ 64) plus two matrix-vector products (≈ 32 total). So: (a) ≈ 64, (b) ≈ 96. Inverse is worse by the usual factor ≈ 3.',
      ro: 'Gauss pe [A | b₁ b₂] face eliminarea o dată și două substituții inverse: ≈ n³/3 + 2n² = 32 + 32 ≈ 64 înmulțiri. A⁻¹ necesită ≈ n³ (≈ 64) plus două produse matrice-vector (≈ 32 total). Deci: (a) ≈ 64, (b) ≈ 96. Inversa e mai scumpă cu factorul obișnuit ≈ 3.',
    },
  }];

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: Linear Algebra & Optimization Seminar 3 — Graphical methods, parametric systems, Gauss elimination with pivoting, UAIC 2025–2026.',
          'Sursa: Seminar ALO 3 — Metode grafice, sisteme parametrice, eliminarea Gauss cu pivotare, UAIC 2025–2026.',
        )}
      </p>

      {/* ══════════ Problem 1 ══════════ */}
      <h3 className="text-lg font-bold mt-6 mb-2">
        {t('Problem 1: Graphical solution of four small systems', 'Problema 1: Rezolvare grafică a patru sisteme mici')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'For each of the four systems, obtain a solution graphically when possible, and interpret geometrically.',
          'Pentru fiecare dintre cele patru sisteme, obțineți o soluție grafic dacă este posibil, și interpretați geometric.',
        )}</p>
        <ul className="text-sm list-disc ml-4 mt-1">
          <li>(a) x₁ + 2x₂ = 0;  x₁ − x₂ = 0</li>
          <li>(b) x₁ + 2x₂ = 3;  −2x₁ − 4x₂ = 6</li>
          <li>(c) 2x₁ + x₂ = −1;  x₁ + x₂ = 2;  x₁ − 3x₂ = 5</li>
          <li>(d) 2x₁ + x₂ + x₃ = 1;  2x₁ + 4x₂ − x₃ = −1</li>
        </ul>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part (a) — two lines through the origin', 'Partea (a) — două drepte prin origine')}</p>
      <MultipleChoice questions={mc1a} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part (b) — two lines', 'Partea (b) — două drepte')}</p>
      <MultipleChoice questions={mc1b} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part (c) — three lines', 'Partea (c) — trei drepte')}</p>
      <MultipleChoice questions={mc1c} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part (d) — two planes', 'Partea (d) — două plane')}</p>
      <MultipleChoice questions={mc1d} />

      <Toggle
        question={t('Show geometry and solution of all four', 'Arată geometria și soluțiile celor patru')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">(a) {t('Two lines through the origin', 'Două drepte prin origine')}</p>
            <p className="text-sm mb-2">{t(
              'Both lines pass through (0, 0). Their slopes differ (−1/2 vs. 1), so they intersect only there. Unique solution: x = (0, 0).',
              'Ambele drepte trec prin (0, 0). Pantele diferă (−1/2 vs 1), deci se intersectează doar acolo. Soluție unică: x = (0, 0).',
            )}</p>

            <p className="font-bold mt-4 mb-1">(b) {t('Two parallel lines', 'Două drepte paralele')}</p>
            <p className="text-sm mb-2">{t(
              'Dividing the second equation by −2 gives x₁ + 2x₂ = −3; the first is x₁ + 2x₂ = 3. Same slope, different intercepts. No solution.',
              'Împărțind a doua ecuație la −2 obținem x₁ + 2x₂ = −3; prima este x₁ + 2x₂ = 3. Aceeași pantă, intercepți diferiți. Fără soluție.',
            )}</p>

            <p className="font-bold mt-4 mb-1">(c) {t('Three lines, inconsistent', 'Trei drepte, inconsistent')}</p>
            <p className="text-sm mb-2">{t(
              'The first two give x₁ = −3, x₂ = 5. Substitution into the third: −3 − 15 = −18 ≠ 5. The three lines do not share a common point — no solution.',
              'Primele două dau x₁ = −3, x₂ = 5. Substituind în a treia: −3 − 15 = −18 ≠ 5. Cele trei drepte nu au punct comun — fără soluție.',
            )}</p>

            <p className="font-bold mt-4 mb-1">(d) {t('Two planes in ℝ³', 'Două plane în ℝ³')}</p>
            <p className="text-sm mb-2">
              {t('Non-parallel planes meet along a line. Parametrise x₃ = t:', 'Plane ne-paralele se intersectează după o dreaptă. Parametrizăm x₃ = t:')}
            </p>
            <Code>{`x₁ = (5 − 5t)/6,  x₂ = (2t − 2)/3,  x₃ = t,    t ∈ ℝ.`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Geometric ranks: two independent equations in ℝⁿ remove two degrees of freedom. Here n = 3, so 3 − 2 = 1 — the solution set is a line.',
                'Rangul geometric: două ecuații independente în ℝⁿ scad două grade de libertate. Aici n = 3, deci 3 − 2 = 1 — mulțimea soluțiilor e o dreaptă.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 2 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 2: Parametric system — classify by α', 'Problema 2: Sistem parametric — clasificare după α')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Consider the linear system depending on α ∈ ℝ:',
          'Considerăm sistemul liniar depinzând de α ∈ ℝ:',
        )}</p>
        <Code>{`  x₁ -  x₂ + α x₃ = -2
 -x₁ + 2x₂ - α x₃ =  3
 α x₁ +  x₂ +  x₃ =  2`}</Code>
        <ul className="text-sm list-disc ml-4 mt-2">
          <li>{t('(a) Find the value(s) of α for which the system has no solution.', '(a) Găsiți valoarea (valorile) lui α pentru care sistemul nu are soluție.')}</li>
          <li>{t('(b) Find the value(s) of α for which the system has infinitely many solutions.', '(b) Găsiți valoarea (valorile) lui α pentru care sistemul are o infinitate de soluții.')}</li>
          <li>{t('(c) Determine the unique solution when it exists.', '(c) Determinați soluția unică atunci când există.')}</li>
        </ul>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part (a)', 'Partea (a)')}</p>
      <MultipleChoice questions={mc2a} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part (b)', 'Partea (b)')}</p>
      <MultipleChoice questions={mc2b} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part (c)', 'Partea (c)')}</p>
      <MultipleChoice questions={mc2c} />

      <Toggle
        question={t('Show full reduction and case analysis', 'Arată reducerea completă și analiza cazurilor')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Step 1: eliminate x₂', 'Pasul 1: eliminăm x₂')}</p>
            <p className="text-sm mb-2">
              {t('Adding Eq1 + Eq2 gives x₂ = 1.', 'Adunând Eq1 + Eq2 obținem x₂ = 1.')}
            </p>

            <p className="font-bold mt-4 mb-1">{t('Step 2: substitute x₂ = 1', 'Pasul 2: substituim x₂ = 1')}</p>
            <p className="text-sm mb-2">
              Eq1: x₁ + αx₃ = −1;  Eq3: αx₁ + x₃ = 1.
            </p>

            <p className="font-bold mt-4 mb-1">{t('Step 3: eliminate x₁', 'Pasul 3: eliminăm x₁')}</p>
            <p className="text-sm mb-2">
              {t('α·Eq1 − Eq3: (α² − 1)x₃ = α·(−1) − (1) = −α − 1, i.e., (1 − α²)·x₃ = 1 + α.', 'α·Eq1 − Eq3: (α² − 1)x₃ = α·(−1) − (1) = −α − 1, adică (1 − α²)·x₃ = 1 + α.')}
            </p>

            <p className="font-bold mt-4 mb-1">{t('Case analysis', 'Analiza cazurilor')}</p>
            <ul className="text-sm list-disc ml-4 mb-2">
              <li>{t('α = 1: (0)·x₃ = 2 — contradiction. No solution.', 'α = 1: (0)·x₃ = 2 — contradicție. Fără soluție.')}</li>
              <li>{t('α = −1: (0)·x₃ = 0 — always true. 1-parameter family (infinite solutions).', 'α = −1: (0)·x₃ = 0 — întotdeauna adevărat. Familie 1-parametrică (infinitate).')}</li>
              <li>{t('α ≠ ±1: x₃ = 1/(1 − α), x₂ = 1, x₁ = −1/(1 − α).', 'α ≠ ±1: x₃ = 1/(1 − α), x₂ = 1, x₁ = −1/(1 − α).')}</li>
            </ul>
            <Box type="theorem">
              <p className="text-sm">{t(
                'The three behaviours correspond to rank(A) vs rank([A|b]). At α = 1, rank(A) = 2 but rank([A|b]) = 3 — inconsistent. At α = −1 both ranks drop to 2 — infinite solutions. Generic α keeps rank 3 — unique solution.',
                'Cele trei comportamente corespund rang(A) vs rang([A|b]). La α = 1, rang(A) = 2 dar rang([A|b]) = 3 — inconsistent. La α = −1 ambele rânduri scad la 2 — infinitate. α generic păstrează rangul 3 — soluție unică.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 3 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 3: Gauss elimination (no / partial / total pivoting) + back substitution', 'Problema 3: Eliminare Gauss (fără / parțială / totală) + substituție inversă')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Solve four linear systems with Gauss elimination, trying all three pivoting strategies when instructive.',
          'Rezolvați patru sisteme liniare prin eliminare Gauss, încercând toate cele trei strategii de pivotare când este instructiv.',
        )}</p>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Why pivoting matters — system (a)', 'De ce contează pivotarea — sistemul (a)')}</p>
      <MultipleChoice questions={mc3nopivot} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Solution of (c)', 'Soluția pentru (c)')}</p>
      <MultipleChoice questions={mc3c} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Consistency of (d)', 'Compatibilitatea lui (d)')}</p>
      <MultipleChoice questions={mc3d} />

      <Toggle
        question={t('Show solutions of all four systems', 'Arată soluțiile celor patru sisteme')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">(a)</p>
            <p className="text-sm mb-2">{t(
              'Naïve elimination stalls (R2 − 3·R1 gives 0 x₂). Partial pivoting swaps R1 ↔ R2 (pivot 3), then proceeds cleanly. Solution:',
              'Eliminarea naivă se blochează (R2 − 3·R1 dă 0 x₂). Pivotarea parțială schimbă R1 ↔ R2 (pivot 3), apoi continuă curat. Soluția:',
            )}</p>
            <Code>{`x₁ = 19/16,  x₂ = 29/16,  x₃ = 7/8.`}</Code>

            <p className="font-bold mt-4 mb-1">(b)</p>
            <p className="text-sm mb-2">{t(
              'Partial pivot keeps R1 (pivot 2). Eliminate, then back-substitute:',
              'Pivotarea parțială păstrează R1 (pivot 2). Eliminăm, apoi substituție inversă:',
            )}</p>
            <Code>{`x₁ = −1,  x₂ = 0,  x₃ = 1.`}</Code>

            <p className="font-bold mt-4 mb-1">(c)</p>
            <p className="text-sm mb-2">{t(
              'The coefficient matrix is already lower-triangular — forward substitution is immediate:',
              'Matricea coeficienților e deja triunghiulară inferior — substituția directă este imediată:',
            )}</p>
            <Code>{`x₁ = 1.5,  x₂ = 2,  x₃ = −1.2,  x₄ = 3.`}</Code>

            <p className="font-bold mt-4 mb-1">(d)</p>
            <p className="text-sm mb-2">{t(
              'During elimination, two derived equations contradict each other: x₁ − x₃ = −1 and x₁ − x₃ = 3. The system has no solution.',
              'În timpul eliminării, două ecuații derivate se contrazic: x₁ − x₃ = −1 și x₁ − x₃ = 3. Sistemul nu are soluție.',
            )}</p>

            <Box type="theorem">
              <p className="text-sm">{t(
                'Total pivoting picks the absolute-largest entry in the remaining submatrix (costs Θ(n²) searches per step); partial picks the largest in the current column (cheaper). Both guard against small pivots that amplify round-off error.',
                'Pivotarea totală alege elementul cel mai mare în modul din submatricea rămasă (căutări Θ(n²) pe pas); parțială alege cel mai mare din coloana curentă (mai ieftină). Ambele protejează împotriva pivoților mici care amplifică eroarea de rotunjire.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 4 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 4: Two RHS with the same A — Gauss vs inverse', 'Problema 4: Două RHS cu același A — Gauss vs inversă')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Same 4×4 coefficient matrix A, two right-hand sides b₁ = (6, 4, −2, 5)ᵀ and b₂ = (1, 1, 2, −1)ᵀ. (a) Solve both via Gauss elimination on the extended matrix. (b) Solve via A⁻¹. (c) Which method uses more operations?',
          'Aceeași matrice 4×4, două membri drepți b₁ = (6, 4, −2, 5)ᵀ și b₂ = (1, 1, 2, −1)ᵀ. (a) Rezolvați cu eliminare Gauss pe matricea extinsă. (b) Rezolvați cu A⁻¹. (c) Care metodă folosește mai multe operații?',
        )}</p>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Operation count', 'Numărul de operații')}</p>
      <MultipleChoice questions={mc4cost} />

      <Toggle
        question={t('Show both solutions and the operation-count analysis', 'Arată ambele soluții și analiza numărului de operații')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('(a) Gauss on the extended matrix [A | b₁ b₂]', '(a) Gauss pe matricea extinsă [A | b₁ b₂]')}</p>
            <p className="text-sm mb-2">{t(
              'Eliminate column-by-column; both right-hand sides carry along. Back-substitute twice — once per RHS.',
              'Eliminăm coloană cu coloană; ambii membri drepți merg împreună. Substituție inversă de două ori — o dată per RHS.',
            )}</p>
            <Code>{`x₁ = (3, −6, −2, −1)ᵀ   for b₁
x₂ = (1,  1,  1,  1)ᵀ   for b₂`}</Code>
            <p className="text-sm mt-2 mb-2">{t(
              'Sanity check for x₂: A·(1,1,1,1)ᵀ = (1−1+2−1, 1+0−1+1, 2+1+3−4, 0−1+1−1) = (1, 1, 2, −1) = b₂. ✓',
              'Verificare x₂: A·(1,1,1,1)ᵀ = (1−1+2−1, 1+0−1+1, 2+1+3−4, 0−1+1−1) = (1, 1, 2, −1) = b₂. ✓',
            )}</p>

            <p className="font-bold mt-4 mb-1">{t('(b) Via A⁻¹', '(b) Via A⁻¹')}</p>
            <p className="text-sm mb-2">{t(
              'Compute A⁻¹ (four triangular back-solves after Gauss), then xᵢ = A⁻¹bᵢ for each RHS. Same numerical answers as (a).',
              'Calculăm A⁻¹ (patru substituții inverse triunghiulare după Gauss), apoi xᵢ = A⁻¹bᵢ pentru fiecare RHS. Aceleași răspunsuri ca (a).',
            )}</p>

            <p className="font-bold mt-4 mb-1">{t('(c) Cost comparison', '(c) Comparație de cost')}</p>
            <ul className="text-sm list-disc ml-4 mb-2">
              <li>{t('Gauss + two back-solves: ≈ n³/3 + 2n² multiplications.', 'Gauss + două substituții inverse: ≈ n³/3 + 2n² înmulțiri.')}</li>
              <li>{t('A⁻¹ explicit + two matrix-vector products: ≈ n³ + 2n² multiplications.', 'A⁻¹ explicit + două produse matrice-vector: ≈ n³ + 2n² înmulțiri.')}</li>
            </ul>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Rule: never compute A⁻¹ just to solve Ax = b. The cost factor is ≈ 3 even for one RHS, and the result is numerically less stable. Solve directly via Gauss / LU / QR instead.',
                'Regulă: nu calculați A⁻¹ doar pentru a rezolva Ax = b. Factorul de cost este ≈ 3 chiar pentru un singur RHS, iar rezultatul este numeric mai puțin stabil. Rezolvați direct via Gauss / LU / QR.',
              )}</p>
            </Box>
          </div>
        }
      />
    </>
  );
}
