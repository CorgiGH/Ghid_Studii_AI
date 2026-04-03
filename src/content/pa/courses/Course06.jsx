import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Course06() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Lecture 5b — Topics:', 'Cursul 5b — Subiecte:')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Boyer-Moore: bad character rule, good suffix rule', 'Boyer-Moore: regula caracterului rău, regula sufixului bun')}</li>
          <li>{t('Boyer-Moore: right-to-left comparison, sublinear average case', 'Boyer-Moore: comparație de la dreapta la stânga, caz mediu subliniar')}</li>
          <li>{t('Rabin-Karp: hashing approach, rolling hash, false positives', 'Rabin-Karp: abordarea prin hashing, rolling hash, false positives')}</li>
        </ol>
      </Box>

      {/* ── 1. Boyer-Moore Overview ── */}
      <Section title={t('1. Boyer-Moore Algorithm', '1. Algoritmul Boyer-Moore')} id="pa-c6-bm" checked={!!checked['pa-c6-bm']} onCheck={() => toggleCheck('pa-c6-bm')}>
        <Box type="theorem">
          <p className="font-bold">{t('Key idea:', 'Ideea cheie:')}</p>
          <p>{t('Compare pattern against text RIGHT-TO-LEFT (unlike naive and KMP which go left-to-right). When a mismatch occurs, use two rules to compute how far to shift the pattern — potentially skipping large portions of the text. This makes BM sublinear in practice.', 'Compară pattern-ul cu textul de la DREAPTA la STÂNGA (spre deosebire de naiv și KMP care merg de la stânga la dreapta). Când apare un mismatch, folosește două reguli pentru a calcula cât de departe să deplaseze pattern-ul — potențial sărind porțiuni mari din text. Aceasta face BM subliniar în practică.')}</p>
        </Box>

        <p className="mt-2">{t('Boyer-Moore is one of the most efficient string matching algorithms in practice. It is implemented in most text editors (Find/Replace) and in tools like grep.', 'Boyer-Moore este unul dintre cei mai eficienți algoritmi de potrivire a șirurilor în practică. Este implementat în majoritatea editoarelor de text (Find/Replace) și în instrumente precum grep.')}</p>

        <Box type="definition">
          <p className="font-bold">{t('Two shift rules:', 'Două reguli de deplasare:')}</p>
          <p>{t('When a mismatch occurs, BM computes two possible shifts and chooses the LARGER one:', 'Când apare un mismatch, BM calculează două deplasări posibile și o alege pe cea MAI MARE:')}</p>
          <ol className="list-decimal pl-5 text-sm mt-1">
            <li><strong>{t('Bad character rule', 'Regula caracterului rău')}</strong>{t(': based on the mismatched character in the text', ': bazată pe caracterul nepotrivit din text')}</li>
            <li><strong>{t('Good suffix rule', 'Regula sufixului bun')}</strong>{t(': based on the part of the pattern that DID match', ': bazată pe partea din pattern care S-A potrivit')}</li>
          </ol>
        </Box>
      </Section>

      {/* ── 2. Bad Character Rule ── */}
      <Section title={t('2. Bad Character Rule', '2. Regula caracterului rău')} id="pa-c6-badchar" checked={!!checked['pa-c6-badchar']} onCheck={() => toggleCheck('pa-c6-badchar')}>
        <p>{t('When a mismatch occurs at position k in the pattern (comparing right-to-left), the "bad character" is T[i+k] — the text character that caused the mismatch.', 'Când apare un mismatch la poziția k în pattern (comparând de la dreapta la stânga), "caracterul rău" este T[i+k] — caracterul din text care a cauzat mismatch-ul.')}</p>

        <Box type="formula">
          <p className="font-bold">{t('Case 1 (typical): Bad character exists in pattern to the LEFT', 'Cazul 1 (tipic): Caracterul rău există în pattern la STÂNGA')}</p>
          <p className="text-sm">{t('Shift the pattern right so that the rightmost occurrence of the bad character in P[0..k-1] aligns with T[i+k]. Shift amount = k - last_occurrence_index.', 'Deplasează pattern-ul la dreapta astfel încât cea mai din dreapta apariție a caracterului rău în P[0..k-1] să se alinieze cu T[i+k]. Deplasare = k - index_ultima_apariție.')}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Case 2: Bad character does NOT exist in pattern', 'Cazul 2: Caracterul rău NU există în pattern')}</p>
          <p className="text-sm">{t('Shift the entire pattern past the bad character position. Shift = k + 1.', 'Deplasează întregul pattern dincolo de poziția caracterului rău. Deplasare = k + 1.')}</p>
        </Box>

        <Box type="warning">
          <p className="font-bold">{t('Case 3 (negative shift): Bad character is to the RIGHT', 'Cazul 3 (deplasare negativă): Caracterul rău este la DREAPTA')}</p>
          <p className="text-sm">{t('If the rightmost occurrence of the bad character in the pattern is to the right of position k, the bad character rule gives a negative shift. In this case, use shift = 1 (or rely on the good suffix rule for a better shift).', 'Dacă cea mai din dreapta apariție a caracterului rău în pattern este la dreapta poziției k, regula caracterului rău dă o deplasare negativă. În acest caz, folosiți deplasare = 1 (sau bazați-vă pe regula sufixului bun pentru o deplasare mai bună).')}</p>
        </Box>

        <Code>{`// Precompute: last occurrence of each character in pattern
int lastOcc[ALPHABET_SIZE];
for (int c = 0; c < ALPHABET_SIZE; c++)
  lastOcc[c] = -1;  // not in pattern
for (int j = 0; j < m; j++)
  lastOcc[P[j]] = j;  // rightmost occurrence

// Bad character shift at position k:
// shift = k - lastOcc[T[i+k]]  (if > 0, else 1)`}</Code>
      </Section>

      {/* ── 3. Good Suffix Rule ── */}
      <Section title={t('3. Good Suffix Rule', '3. Regula sufixului bun')} id="pa-c6-goodsuffix" checked={!!checked['pa-c6-goodsuffix']} onCheck={() => toggleCheck('pa-c6-goodsuffix')}>
        <p>{t('The "good suffix" is the part of the pattern that matched before the mismatch (the suffix P[k+1..m-1]).', '"Sufixul bun" este partea din pattern care s-a potrivit înainte de mismatch (sufixul P[k+1..m-1]).')}</p>

        <Box type="formula">
          <p className="font-bold">{t('Case 1: Good suffix reappears in pattern', 'Cazul 1: Sufixul bun reapare în pattern')}</p>
          <p className="text-sm">{t('If the good suffix appears elsewhere in the pattern (preceded by a different character), shift to align that occurrence with the text. This reuses the information that those characters already matched.', 'Dacă sufixul bun apare în altă parte a pattern-ului (precedat de un caracter diferit), deplasează pentru a alinia acea apariție cu textul. Aceasta reutilizează informația că acele caractere s-au potrivit deja.')}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Case 2: Only a prefix of the good suffix reappears', 'Cazul 2: Doar un prefix al sufixului bun reapare')}</p>
          <p className="text-sm">{t('If no full reoccurrence exists, look for the longest suffix of the good suffix that is also a prefix of the pattern. Shift to align that prefix.', 'Dacă nu există o reapariție completă, căutați cel mai lung sufix al sufixului bun care este și un prefix al pattern-ului. Deplasați pentru a alinia acel prefix.')}</p>
        </Box>

        <Box type="theorem">
          <p className="font-bold">{t('Boyer-Moore Complexity', 'Complexitatea Boyer-Moore')}</p>
          <ul className="list-disc pl-5 text-sm">
            <li>{t('Preprocessing: O(m + |Σ|)', 'Preprocesare: O(m + |Σ|)')}</li>
            <li>{t('Worst case: O(n·m) — but O(n) with Galil\'s optimization', 'Caz defavorabil: O(n·m) — dar O(n) cu optimizarea lui Galil')}</li>
            <li>{t('Average/best case: O(n/m) — SUBLINEAR! Can skip characters entirely', 'Caz mediu/cel mai bun: O(n/m) — SUBLINIAR! Poate sări caractere complet')}</li>
          </ul>
        </Box>
      </Section>

      {/* ── 4. Rabin-Karp ── */}
      <Section title={t('4. The Rabin-Karp Algorithm', '4. Algoritmul Rabin-Karp')} id="pa-c6-rk" checked={!!checked['pa-c6-rk']} onCheck={() => toggleCheck('pa-c6-rk')}>
        <Box type="theorem">
          <p className="font-bold">{t('Key idea:', 'Ideea cheie:')}</p>
          <p>{t('Convert pattern and each m-length substring of text into numbers using a hash function. Compare numbers instead of strings. Use a rolling hash to compute the next hash from the previous one in O(1).', 'Convertește pattern-ul și fiecare subșir de lungime m din text în numere folosind o funcție hash. Compară numere în loc de șiruri. Folosește un rolling hash pentru a calcula hash-ul următor din cel anterior în O(1).')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Hash function:', 'Funcția hash:')}</p>
        <Code>{`// Convert string to number (Horner's rule)
f(S) {
  result = 0
  for i = 0 to m-1:
    result = result * |Σ| + S[i]
  return result
}
// Example: f("BABX") = 1·26³ + 0·26² + 1·26 + 23 = 17625`}</Code>

        <p className="font-bold mt-3">{t('Rolling hash (key optimization):', 'Rolling hash (optimizarea cheie):')}</p>
        <Box type="formula">
          <p className="text-sm font-mono">f(T[i+1..i+m]) = |Σ| · f(T[i..i+m-1]) - T[i] · |Σ|^m + T[i+m]</p>
          <p className="text-sm mt-1">{t('Each new hash computed in O(1) from the previous one — no need to recompute from scratch.', 'Fiecare hash nou calculat în O(1) din cel anterior — nu e nevoie să recalculăm de la zero.')}</p>
        </Box>

        <Box type="warning">
          <p className="font-bold">{t('Problem: large numbers', 'Problemă: numere mari')}</p>
          <p>{t('For long patterns, the hash values become astronomically large. Solution: work modulo a prime number q. Use fq(S) = f(S) mod q.', 'Pentru pattern-uri lungi, valorile hash devin astronomic de mari. Soluție: lucrăm modulo un număr prim q. Folosim fq(S) = f(S) mod q.')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Rabin-Karp algorithm:', 'Algoritmul Rabin-Karp:')}</p>
        <Code>{`// Rabin-Karp with modular hashing
q = prime_number
x = hash(P[0..m-1]) mod q
y = hash(T[0..m-1]) mod q

for i = 0 to n-m:
  if y == x:
    if P[0..m-1] == T[i..i+m-1]:  // verify (avoid false positives)
      return i
  // Rolling hash update:
  y = ((y - T[i] * |Σ|^(m-1) mod q) * |Σ| + T[i+m]) mod q

return -1`}</Code>

        <Box type="definition">
          <p className="font-bold">{t('False positives', 'False positives')}</p>
          <p>{t('Since we work modulo q, different strings can have the same hash (collision). When hashes match, we MUST verify the actual strings character by character. A position where hashes match but strings differ is called a false positive.', 'Deoarece lucrăm modulo q, șiruri diferite pot avea același hash (coliziune). Când hash-urile se potrivesc, TREBUIE să verificăm șirurile reale caracter cu caracter. O poziție unde hash-urile se potrivesc dar șirurile diferă se numește false positive.')}</p>
        </Box>

        <Box type="theorem">
          <p className="font-bold">{t('Rabin-Karp Complexity', 'Complexitatea Rabin-Karp')}</p>
          <ul className="list-disc pl-5 text-sm">
            <li>{t('Preprocessing: O(m)', 'Preprocesare: O(m)')}</li>
            <li>{t('Worst case: O(n·m) — if every position is a false positive', 'Caz defavorabil: O(n·m) — dacă fiecare poziție este un false positive')}</li>
            <li>{t('Average case: O(n + m) — for well-chosen q, few false positives', 'Caz mediu: O(n + m) — pentru q bine ales, puține false positives')}</li>
          </ul>
        </Box>

        <Box type="definition">
          <p className="font-bold">{t('Advantage of Rabin-Karp', 'Avantajul Rabin-Karp')}</p>
          <p>{t('Easily generalizable from 1D strings to 2D matrices (searching for a pattern matrix inside a larger matrix). Neither KMP nor Boyer-Moore can be extended this way.', 'Ușor generalizabil de la șiruri 1D la matrice 2D (căutarea unei matrice pattern într-o matrice mai mare). Nici KMP nici Boyer-Moore nu pot fi extinse astfel.')}</p>
        </Box>
      </Section>

      {/* ── 5. Comparison ── */}
      <Section title={t('5. Algorithm Comparison', '5. Comparația algoritmilor')} id="pa-c6-compare" checked={!!checked['pa-c6-compare']} onCheck={() => toggleCheck('pa-c6-compare')}>
        <div className="overflow-x-auto">
          <table className="text-sm w-full">
            <thead>
              <tr className="border-b dark:border-gray-600">
                <th className="p-2 text-left">{t('Algorithm', 'Algoritm')}</th>
                <th className="p-2">{t('Preprocessing', 'Preprocesare')}</th>
                <th className="p-2">{t('Worst Case', 'Caz defav.')}</th>
                <th className="p-2">{t('Average', 'Mediu')}</th>
                <th className="p-2">{t('Direction', 'Direcție')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-700"><td className="p-2">Naive</td><td className="p-2 text-center">O(0)</td><td className="p-2 text-center">O(n·m)</td><td className="p-2 text-center">O(n·m)</td><td className="p-2 text-center">L→R</td></tr>
              <tr className="border-b dark:border-gray-700"><td className="p-2">KMP</td><td className="p-2 text-center">O(m)</td><td className="p-2 text-center">O(n)</td><td className="p-2 text-center">O(n)</td><td className="p-2 text-center">L→R</td></tr>
              <tr className="border-b dark:border-gray-700"><td className="p-2">Boyer-Moore</td><td className="p-2 text-center">O(m+|Σ|)</td><td className="p-2 text-center">O(n·m)*</td><td className="p-2 text-center font-bold text-green-600 dark:text-green-400">O(n/m)</td><td className="p-2 text-center">R→L</td></tr>
              <tr className="border-b dark:border-gray-700"><td className="p-2">Rabin-Karp</td><td className="p-2 text-center">O(m)</td><td className="p-2 text-center">O(n·m)</td><td className="p-2 text-center">O(n+m)</td><td className="p-2 text-center">L→R</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-1 opacity-60">* O(n) {t('with Galil\'s optimization', 'cu optimizarea lui Galil')}</p>
      </Section>

      {/* ── Self-Test ── */}
      <Section title={t('Self-Test (5 Questions)', 'Autoevaluare (5 întrebări)')} id="pa-c6-quiz" checked={!!checked['pa-c6-quiz']} onCheck={() => toggleCheck('pa-c6-quiz')}>
        <Toggle question={t('1. Why does Boyer-Moore compare right-to-left?', '1. De ce Boyer-Moore compară de la dreapta la stânga?')} answer={t('Right-to-left comparison allows the bad character rule to skip more characters. If the last character of the pattern mismatches a character not in the pattern, the entire pattern can be shifted past that position — achieving sublinear performance.', 'Comparația de la dreapta la stânga permite regulii caracterului rău să sară mai multe caractere. Dacă ultimul caracter al pattern-ului nu se potrivește cu un caracter care nu e în pattern, întregul pattern poate fi deplasat dincolo de acea poziție — obținând performanță subliniară.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
        <Toggle question={t('2. What is a rolling hash and why is it important for Rabin-Karp?', '2. Ce este un rolling hash și de ce este important pentru Rabin-Karp?')} answer={t('A rolling hash computes the next hash value from the previous one in O(1) instead of O(m). Formula: h(T[i+1..i+m]) = |Σ|·h(T[i..i+m-1]) - T[i]·|Σ|^(m-1) + T[i+m]. Without it, Rabin-Karp would be no faster than naive.', 'Un rolling hash calculează valoarea hash următoare din cea anterioară în O(1) în loc de O(m). Formula: h(T[i+1..i+m]) = |Σ|·h(T[i..i+m-1]) - T[i]·|Σ|^(m-1) + T[i+m]. Fără el, Rabin-Karp nu ar fi mai rapid decât algoritmul naiv.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
        <Toggle question={t('3. What is a false positive in Rabin-Karp?', '3. Ce este un false positive în Rabin-Karp?')} answer={t('A position where the hash values match but the actual strings differ (a hash collision). Since we work modulo q, different strings can produce the same hash. This is why Rabin-Karp must verify matches character by character.', 'O poziție unde valorile hash se potrivesc dar șirurile reale diferă (o coliziune hash). Deoarece lucrăm modulo q, șiruri diferite pot produce același hash. De aceea Rabin-Karp trebuie să verifice potrivirile caracter cu caracter.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
        <Toggle question={t('4. Which algorithm is best for large alphabets?', '4. Care algoritm este cel mai bun pentru alfabete mari?')} answer={t('Boyer-Moore. With large alphabets, mismatches are more frequent and the bad character rule gives larger shifts. Average case becomes closer to O(n/m) — the larger the alphabet, the better BM performs.', 'Boyer-Moore. Cu alfabete mari, mismatch-urile sunt mai frecvente și regula caracterului rău dă deplasări mai mari. Cazul mediu se apropie de O(n/m) — cu cât alfabetul este mai mare, cu atât BM performează mai bine.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
        <Toggle question={t('5. What unique advantage does Rabin-Karp have over KMP and BM?', '5. Ce avantaj unic are Rabin-Karp față de KMP și BM?')} answer={t('Rabin-Karp can be easily generalized to 2D pattern matching (searching for a pattern matrix inside a larger matrix). Neither KMP nor Boyer-Moore can be extended to 2D.', 'Rabin-Karp poate fi ușor generalizat la potrivirea 2D a pattern-urilor (căutarea unei matrice pattern într-o matrice mai mare). Nici KMP nici Boyer-Moore nu pot fi extinse la 2D.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
      </Section>
    </>
  );
}
