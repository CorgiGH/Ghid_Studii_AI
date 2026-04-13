import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar05() {
  const { t } = useApp();

  /* ─── P1: QR already given ─── */
  const mc1strat = [{
    question: {
      en: 'With Q orthogonal and R upper-triangular, solving QR·x = b reduces to',
      ro: 'Cu Q ortogonală și R triunghiulară superior, rezolvarea QR·x = b se reduce la',
    },
    options: [
      { text: { en: 'y = Qᵀb (one matrix-vector product), then back-solve Rx = y', ro: 'y = Qᵀb (un produs matrice-vector), apoi substituție inversă Rx = y' }, correct: true },
      { text: { en: 'forward-solve Ly = b then back-solve Rx = y', ro: 'substituție directă Ly = b, apoi substituție inversă Rx = y' }, correct: false },
      { text: { en: 'compute R⁻¹, then x = R⁻¹Q⁻¹b', ro: 'calculează R⁻¹, apoi x = R⁻¹Q⁻¹b' }, correct: false },
      { text: { en: 'invert Q as an LU decomposition first', ro: 'inversează Q întâi ca o descompunere LU' }, correct: false },
    ],
    explanation: {
      en: 'Q orthogonal ⇒ Q⁻¹ = Qᵀ, which costs only n² multiplications to apply. The Rx = y stage is one triangular back-solve — another n²/2 mults. Never form Q⁻¹ or R⁻¹ explicitly.',
      ro: 'Q ortogonală ⇒ Q⁻¹ = Qᵀ, care costă doar n² înmulțiri. Etapa Rx = y este o substituție inversă triunghiulară — încă n²/2 înmulțiri. Niciodată nu formați Q⁻¹ sau R⁻¹ explicit.',
    },
  }];
  const mc1sol = [{
    question: {
      en: 'For both systems (a) and (b), the solution x is',
      ro: 'Pentru ambele sisteme (a) și (b), soluția x este',
    },
    options: [
      { text: 'x = (1, 2, 3)ᵀ', correct: true },
      { text: 'x = (3, 2, 1)ᵀ', correct: false },
      { text: 'x = (25, 35, 15)ᵀ', correct: false },
      { text: 'x = (1, 1, 1)ᵀ', correct: false },
    ],
    explanation: {
      en: 'In (a): Qᵀb = (25, 35, 15)ᵀ. Back-solve R·x = Qᵀb: 5x₃ = 15 ⇒ x₃ = 3; 10x₂ + 15 = 35 ⇒ x₂ = 2; 5x₁ + 20 = 25 ⇒ x₁ = 1. In (b): Qᵀb = (25, 35, 15)ᵀ again — same x.',
      ro: 'În (a): Qᵀb = (25, 35, 15)ᵀ. Substituție inversă R·x = Qᵀb: 5x₃ = 15 ⇒ x₃ = 3; 10x₂ + 15 = 35 ⇒ x₂ = 2; 5x₁ + 20 = 25 ⇒ x₁ = 1. În (b): Qᵀb = (25, 35, 15)ᵀ iarăși — același x.',
    },
  }];

  /* ─── P2: Givens QR ─── */
  const mc2single = [{
    question: {
      en: 'A single Givens rotation suffices to reduce A₁ (or A₂) to upper-triangular because',
      ro: 'O singură rotație Givens ajunge să reducă A₁ (sau A₂) la forma superior-triunghiulară pentru că',
    },
    options: [
      { text: { en: 'each matrix has only one non-zero sub-diagonal entry that needs to be eliminated', ro: 'fiecare matrice are o singură intrare sub-diagonală nenulă care trebuie eliminată' }, correct: true },
      { text: { en: 'Givens rotations act on the entire matrix in one shot', ro: 'rotațiile Givens acționează pe întreaga matrice într-o singură aplicare' }, correct: false },
      { text: { en: 'the diagonal is already correct', ro: 'diagonala este deja corectă' }, correct: false },
      { text: { en: 'the matrices are already orthogonal', ro: 'matricele sunt deja ortogonale' }, correct: false },
    ],
    explanation: {
      en: 'A₁ has only the (2,1) entry −4 to zero (R3 starts at (0, 0, 5)). A₂ has only (3,1) = −4 to zero (R2 starts at (0, 10, 5)). One Givens each. Dense matrices would need up to n(n − 1)/2 rotations.',
      ro: 'A₁ are doar (2,1) = −4 de anulat (R3 începe cu (0, 0, 5)). A₂ are doar (3,1) = −4 de anulat (R2 începe cu (0, 10, 5)). O singură rotație fiecare. Matricele dense ar cere până la n(n − 1)/2 rotații.',
    },
  }];

  /* ─── P3: Householder ─── */
  const mc3rho = [{
    question: {
      en: 'In Householder on A’s first column a = (3, 4)ᵀ, with the sign convention ρ = −sign(a₁)·‖a‖₂, the value ρ equals',
      ro: 'În Householder pe prima coloană a lui A, a = (3, 4)ᵀ, cu convenția ρ = −sign(a₁)·‖a‖₂, valoarea ρ este',
    },
    options: [
      { text: '−5', correct: true },
      { text: '+5', correct: false },
      { text: '0', correct: false },
      { text: '−3', correct: false },
    ],
    explanation: {
      en: '‖a‖₂ = √(9 + 16) = 5, and a₁ = 3 > 0, so ρ = −5. The sign choice ensures v = a − ρ·e₁ has large ‖v‖₂, which avoids catastrophic cancellation.',
      ro: '‖a‖₂ = √(9 + 16) = 5, iar a₁ = 3 > 0, deci ρ = −5. Alegerea semnului asigură v = a − ρ·e₁ cu ‖v‖₂ mare, evitând anularea catastrofală.',
    },
  }];
  const mc3residual = [{
    question: {
      en: 'For the computed solution z, the residual norm ‖Az − b‖₁ equals',
      ro: 'Pentru soluția calculată z, norma reziduală ‖Az − b‖₁ este',
    },
    options: [
      { text: '0', correct: true },
      { text: '1', correct: false },
      { text: '14/5', correct: false },
      { text: { en: 'non-zero in general', ro: 'nenulă în general' }, correct: false },
    ],
    explanation: {
      en: 'The 2×2 system has a unique exact solution z = (1, −1)ᵀ: A·z = (3 − 1, 4 − 2) = (2, 2) = b. Hence Az − b = 0 and ‖Az − b‖₁ = 0.',
      ro: 'Sistemul 2×2 are o soluție unică exactă z = (1, −1)ᵀ: A·z = (3 − 1, 4 − 2) = (2, 2) = b. Deci Az − b = 0 și ‖Az − b‖₁ = 0.',
    },
  }];

  /* ─── P4 ─── */
  const mc4sol = [{
    question: {
      en: 'The solution of 6x₁ + 8x₂ + 13x₃ = 21;  −8x₁ + 6x₂ − 9x₃ = −3;  10x₃ = 10 via Givens QR is',
      ro: 'Soluția lui 6x₁ + 8x₂ + 13x₃ = 21;  −8x₁ + 6x₂ − 9x₃ = −3;  10x₃ = 10 via Givens QR este',
    },
    options: [
      { text: 'x = (0, 1, 1)ᵀ', correct: true },
      { text: 'x = (1, 0, 1)ᵀ', correct: false },
      { text: 'x = (1, 1, 1)ᵀ', correct: false },
      { text: 'x = (0, 0, 1)ᵀ', correct: false },
    ],
    explanation: {
      en: 'One Givens G₁₂ with (c, s) = (0.6, −0.8) zeroes a₂₁ and leaves R = diag-like [[10, 0, 15],[0, 10, 5],[0, 0, 10]]. Qᵀb = (15, 15, 10)ᵀ. Back-solve: x₃ = 1, x₂ = 1, x₁ = 0.',
      ro: 'O singură G₁₂ cu (c, s) = (0.6, −0.8) anulează a₂₁ și lasă R = [[10, 0, 15],[0, 10, 5],[0, 0, 10]]. Qᵀb = (15, 15, 10)ᵀ. Substituție inversă: x₃ = 1, x₂ = 1, x₁ = 0.',
    },
  }];

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: Linear Algebra & Optimization Seminar 5 — QR via Givens and Householder, UAIC 2025–2026.',
          'Sursa: Seminar ALO 5 — QR prin Givens și Householder, UAIC 2025–2026.',
        )}
      </p>

      {/* ══════════ Problem 1 ══════════ */}
      <h3 className="text-lg font-bold mt-6 mb-2">
        {t('Problem 1: Solve QR·x = b when (Q, R) is given', 'Problema 1: Rezolvă QR·x = b când (Q, R) e dat')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Two systems presented already in factored form Q·R·x = b. R is the same in both; only Q (and b) differ.',
          'Două sisteme deja sub forma factorizată Q·R·x = b. R este același în ambele; diferă doar Q (și b).',
        )}</p>
        <ul className="text-sm list-disc ml-4 mt-1">
          <li>(a) Q = [[0.6, 0.8, 0],[−0.8, 0.6, 0],[0, 0, 1]],  b = (43, 1, 15)ᵀ</li>
          <li>(b) Q = [[0.6, 0, 0.8],[0, 1, 0],[−0.8, 0, 0.6]],  b = (27, 35, −11)ᵀ</li>
          <li>R = [[5, 10, 0],[0, 10, 5],[0, 0, 5]]</li>
        </ul>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Strategy', 'Strategia')}</p>
      <MultipleChoice questions={mc1strat} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Solution', 'Soluția')}</p>
      <MultipleChoice questions={mc1sol} />

      <Toggle
        question={t('Show full Qᵀb + back-solve for each system', 'Arată Qᵀb complet + substituție inversă pentru fiecare sistem')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">(a)</p>
            <p className="text-sm mb-2">{t('Qᵀ·b via dot products with the columns of Q:', 'Qᵀ·b prin produse scalare cu coloanele lui Q:')}</p>
            <Code>{`Qᵀ·b = ( 0.6·43 + (−0.8)·1 + 0·15,
         0.8·43 +   0.6·1 + 0·15,
           0·43 +     0·1 + 1·15 )
     = (25, 35, 15)ᵀ`}</Code>
            <p className="text-sm mt-2 mb-2">{t('Back-solve R·x = (25, 35, 15)ᵀ: x₃ = 3, x₂ = 2, x₁ = 1. So x = (1, 2, 3)ᵀ.', 'Substituție inversă R·x = (25, 35, 15)ᵀ: x₃ = 3, x₂ = 2, x₁ = 1. Deci x = (1, 2, 3)ᵀ.')}</p>

            <p className="font-bold mt-4 mb-1">(b)</p>
            <Code>{`Qᵀ·b = (0.6·27 +      0·35 + (−0.8)·(−11),
             0·27 +     1·35 +        0·(−11),
           0.8·27 +     0·35 +      0.6·(−11))
      = (25, 35, 15)ᵀ`}</Code>
            <p className="text-sm mt-2 mb-2">{t('Same RHS to R — same solution x = (1, 2, 3)ᵀ.', 'Același RHS pentru R — aceeași soluție x = (1, 2, 3)ᵀ.')}</p>

            <Box type="theorem">
              <p className="text-sm">{t(
                'Orthogonal Q preserves the 2-norm: ‖Q·R·x‖₂ = ‖R·x‖₂. So ‖Ax − b‖₂ = ‖Rx − Qᵀb‖₂ — back-solving R·x = Qᵀb gives the least-squares solution of Ax = b when A has full column rank.',
                'Q ortogonală conservă norma 2: ‖Q·R·x‖₂ = ‖R·x‖₂. Deci ‖Ax − b‖₂ = ‖Rx − Qᵀb‖₂ — substituția inversă R·x = Qᵀb dă soluția celor mai mici pătrate a lui Ax = b când A are rang complet pe coloane.',
              )}</p>
            </Box>

            <p className="text-sm mt-2 italic opacity-80">
              {t(
                '→ Problem 2 derives this (Q, R) pair from scratch via a single Givens rotation — here we only used it.',
                '→ Problema 2 derivează perechea (Q, R) de la zero printr-o singură rotație Givens — aici doar am folosit-o.',
              )}
            </p>
          </div>
        }
      />

      {/* ══════════ Problem 2 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 2: QR by Givens rotations', 'Problema 2: QR prin rotații Givens')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Compute the QR decomposition of A₁ = [[3, 14, 4],[−4, −2, 3],[0, 0, 5]] and A₂ = [[3, 6, 4],[0, 10, 5],[−4, −8, 3]] using Givens rotations.',
          'Calculați descompunerea QR a matricelor A₁ = [[3, 14, 4],[−4, −2, 3],[0, 0, 5]] și A₂ = [[3, 6, 4],[0, 10, 5],[−4, −8, 3]] folosind rotații Givens.',
        )}</p>
      </Box>
      <MultipleChoice questions={mc2single} />
      <Toggle
        question={t('Show Q, R for A₁ and A₂', 'Arată Q, R pentru A₁ și A₂')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">A₁ — {t('single Givens in plane (1, 2)', 'o singură rotație Givens în planul (1, 2)')}</p>
            <p className="text-sm mb-2">
              ρ = √(3² + (−4)²) = 5;  c = 3/5 = 0.6,  s = −4/5 = −0.8.  G₁₂ has (G[1,1], G[1,2], G[2,1], G[2,2]) = (0.6, −0.8, 0.8, 0.6).
            </p>
            <p className="text-sm mb-1 font-semibold">Q = G₁₂ᵀ</p>
            <Code>{` 0.6   0.8   0
-0.8   0.6   0
 0     0     1`}</Code>
            <p className="text-sm mb-1 mt-2 font-semibold">R = G₁₂·A₁</p>
            <Code>{`5   10   0
0   10   5
0    0   5`}</Code>
            <p className="text-sm mt-2 mb-2">{t(
              'This is exactly the (Q, R) pair of Problem 1(a): P1(a) hands you the factorisation to use; here we derive it.',
              'Exact perechea (Q, R) din Problema 1(a): P1(a) ne dădea factorizarea; aici o deducem.',
            )}</p>

            <p className="font-bold mt-4 mb-1">A₂ — {t('single Givens in plane (1, 3)', 'o singură rotație Givens în planul (1, 3)')}</p>
            <p className="text-sm mb-2">
              ρ = √(3² + (−4)²) = 5;  c = 0.6,  s = −0.8.  G₁₃ has (G[1,1], G[1,3], G[3,1], G[3,3]) = (0.6, −0.8, 0.8, 0.6).
            </p>
            <p className="text-sm mb-1 font-semibold">Q = G₁₃ᵀ</p>
            <Code>{` 0.6    0    0.8
 0      1    0
-0.8    0    0.6`}</Code>
            <p className="text-sm mb-1 mt-2 font-semibold">R = G₁₃·A₂</p>
            <Code>{`5   10   0
0   10   5
0    0   5`}</Code>
            <p className="text-sm mt-2 mb-2">{t(
              'Matches Problem 1(b). Same R in both cases because the eliminated column was (3, ∗, −4)ᵀ in both (just in different rows).',
              'Potrivește Problema 1(b). Același R în ambele cazuri pentru că prima coloană eliminată a fost (3, ∗, −4)ᵀ în ambele (doar pe linii diferite).',
            )}</p>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Givens is ideal when only a few sub-diagonal entries are non-zero (e.g. Hessenberg matrices, updating a QR after a rank-1 change). Each rotation touches only 2 rows, so you can parallelize disjoint (row-pairs) rotations.',
                'Givens este ideal când doar câteva intrări sub-diagonale sunt nenule (de exemplu matrice Hessenberg, actualizarea unei QR după o schimbare de rang 1). Fiecare rotație afectează doar 2 linii, deci rotațiile pe perechi disjuncte pot fi paralelizate.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 3 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 3: Householder QR for a 2×2 system', 'Problema 3: QR Householder pentru un sistem 2×2')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'System: 3x + y = 2;  4x + 2y = 2. Compute the Householder QR of A = [[3, 1],[4, 2]], solve via back substitution, and compute the residual ‖Az − b‖₁.',
          'Sistem: 3x + y = 2;  4x + 2y = 2. Calculați QR Householder pentru A = [[3, 1],[4, 2]], rezolvați prin substituție inversă, și calculați rezidualul ‖Az − b‖₁.',
        )}</p>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Choice of ρ', 'Alegerea lui ρ')}</p>
      <MultipleChoice questions={mc3rho} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Residual', 'Reziduul')}</p>
      <MultipleChoice questions={mc3residual} />

      <Toggle
        question={t('Show Q, R, z and residual', 'Arată Q, R, z și rezidualul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Householder step on column 1', 'Pasul Householder pe coloana 1')}</p>
            <p className="text-sm mb-2">
              a = (3, 4)ᵀ, ρ = −5, v = a − ρ·e₁ = (8, 4)ᵀ. ‖v‖₂² = 80, v̂ = v/‖v‖₂ = (2/√5, 1/√5)ᵀ. P = I − 2·v̂·v̂ᵀ.
            </p>
            <Code>{`P = -3/5  -4/5
    -4/5   3/5`}</Code>

            <p className="font-bold mt-4 mb-1">{t('Apply P to A', 'Aplicăm P lui A')}</p>
            <p className="text-sm mb-1">{t('The product P·A is already upper-triangular, so we take R = P·A.', 'Produsul P·A este deja triunghiular superior, deci R = P·A.')}</p>
            <p className="text-sm mb-1 font-semibold">P·A</p>
            <Code>{`-5   -11/5
 0     2/5`}</Code>

            <p className="font-bold mt-4 mb-1">{t('Q = Pᵀ = P (P is symmetric)', 'Q = Pᵀ = P (P este simetrică)')}</p>
            <p className="text-sm mb-1 font-semibold">Q</p>
            <Code>{`-3/5  -4/5
-4/5   3/5`}</Code>
            <p className="text-sm mb-1 mt-2 font-semibold">R</p>
            <Code>{`-5   -11/5
 0     2/5`}</Code>

            <p className="font-bold mt-4 mb-1">{t('Solve via QR', 'Rezolvare via QR')}</p>
            <p className="text-sm mb-2">
              y = Qᵀb = Q·b = (−14/5, −2/5)ᵀ. Back-solve R·z = y: (2/5)·z₂ = −2/5 ⇒ z₂ = −1; −5·z₁ − 11/5·(−1) = −14/5 ⇒ z₁ = 1. So z = (1, −1)ᵀ.
            </p>

            <p className="font-bold mt-4 mb-1">{t('Residual', 'Rezidualul')}</p>
            <p className="text-sm mb-2">
              A·z = (3 − 1, 4 − 2)ᵀ = (2, 2)ᵀ = b. Therefore ‖Az − b‖₁ = 0 — an exact solution.
            </p>
            <Box type="theorem">
              <p className="text-sm">{t(
                'The sign of ρ is chosen to maximise |v₁| = |a₁ − ρ| = |a₁| + ‖a‖. If you take ρ = +sign(a₁)·‖a‖, then v₁ = a₁ − ρ has a catastrophic subtractive cancellation when a₁ ≈ ρ. The convention ρ = −sign(a₁)·‖a‖ is what course 6 called the stable sign.',
                'Semnul lui ρ este ales ca să maximizeze |v₁| = |a₁ − ρ| = |a₁| + ‖a‖. Dacă alegi ρ = +sign(a₁)·‖a‖, atunci v₁ = a₁ − ρ are o anulare catastrofală când a₁ ≈ ρ. Convenția ρ = −sign(a₁)·‖a‖ este ceea ce cursul 6 a numit semnul stabil.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 4 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 4: Givens QR and solve for a 3×3 system', 'Problema 4: Givens QR și rezolvare pentru un sistem 3×3')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'System: 6x₁ + 8x₂ + 13x₃ = 21;  −8x₁ + 6x₂ − 9x₃ = −3;  10x₃ = 10. Compute QR via Givens and back-solve.',
          'Sistem: 6x₁ + 8x₂ + 13x₃ = 21;  −8x₁ + 6x₂ − 9x₃ = −3;  10x₃ = 10. Calculați QR via Givens și rezolvați.',
        )}</p>
      </Box>
      <MultipleChoice questions={mc4sol} />
      <Toggle
        question={t('Show Q, R, and the back-solve', 'Arată Q, R și substituția inversă')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Single Givens in plane (1, 2)', 'O singură rotație Givens în planul (1, 2)')}</p>
            <p className="text-sm mb-2">
              Zero a₂₁ = −8. ρ = √(36 + 64) = 10; c = 0.6, s = −0.8.
            </p>
            <p className="text-sm mb-1 font-semibold">G₁₂</p>
            <Code>{`0.6  -0.8   0
0.8   0.6   0
  0     0   1`}</Code>
            <p className="text-sm mb-1 mt-2 font-semibold">Q = G₁₂ᵀ</p>
            <Code>{` 0.6   0.8   0
-0.8   0.6   0
   0     0   1`}</Code>
            <p className="text-sm mb-1 mt-2 font-semibold">R = G₁₂ · A</p>
            <Code>{`10    0   15
 0   10    5
 0    0   10`}</Code>

            <p className="font-bold mt-4 mb-1">{t('Solve', 'Rezolvare')}</p>
            <p className="text-sm mb-2">
              Qᵀ·b = G₁₂·b = (0.6·21 − 0.8·(−3),  0.8·21 + 0.6·(−3),  10)ᵀ = (15, 15, 10)ᵀ.
            </p>
            <p className="text-sm mb-2">
              Back-solve R·x = (15, 15, 10): 10x₃ = 10 ⇒ x₃ = 1; 10x₂ + 5 = 15 ⇒ x₂ = 1; 10x₁ + 15 = 15 ⇒ x₁ = 0.
            </p>

            <Box type="theorem">
              <p className="text-sm">{t(
                'Why QR instead of LU for this system? Both work here (A is non-singular and well-conditioned). QR is the go-to when A may be ill-conditioned or rectangular — it doubles the cost of LU but halves the condition number of the factored problem.',
                'De ce QR în loc de LU pentru acest sistem? Ambele merg aici (A nesingulară și bine-condiționată). QR e preferată când A poate fi rău-condiționată sau dreptunghiulară — dublează costul LU dar înjumătățește numărul de condiționare al problemei factorizate.',
              )}</p>
            </Box>
          </div>
        }
      />
    </>
  );
}
