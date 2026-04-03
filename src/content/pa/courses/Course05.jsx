import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Course05() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Lecture 5a — Topics:', 'Cursul 5a — Subiecte:')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('String matching problem definition', 'Definirea problemei de potrivire a șirurilor')}</li>
          <li>{t('The Naive algorithm and its quadratic worst case', 'Algoritmul naiv și cazul cel mai defavorabil pătratic')}</li>
          <li>{t('The KMP algorithm: borders, failure function, linear time', 'Algoritmul KMP: borders, funcția de eșec, timp liniar')}</li>
          <li>{t('KMP preprocessing (failure function computation)', 'Preprocesarea KMP (calculul funcției de eșec)')}</li>
        </ol>
      </Box>

      {/* ── 1. Problem Definition ── */}
      <Section title={t('1. String Matching Problem', '1. Problema potrivirii șirurilor')} id="pa-c5-problem" checked={!!checked['pa-c5-problem']} onCheck={() => toggleCheck('pa-c5-problem')}>
        <Box type="formula">
          <p className="font-bold">{t('Pattern Matching', 'Pattern Matching')}</p>
          <p className="text-sm font-mono">{t('Input: T[0..n-1] (text, n symbols), P[0..m-1] (pattern, m symbols). Output: i such that T[i..i+m-1] == P, or -1 if no such i exists.', 'Input: T[0..n-1] (text, n simboluri), P[0..m-1] (pattern, m simboluri). Output: i astfel încât T[i..i+m-1] == P, sau -1 dacă nu există un astfel de i.')}</p>
        </Box>

        <p className="mt-2 text-sm">{t('Notation: T = text, P = pattern, n = |T|, m = |P|. S[i..j] denotes substring from index i to j. Both T and P use the same alphabet Σ.', 'Notație: T = text, P = pattern, n = |T|, m = |P|. S[i..j] denotă subșirul de la indexul i la j. Atât T cât și P folosesc același alfabet Σ.')}</p>

        <Box type="definition">
          <p className="font-bold">{t('Variants:', 'Variante:')}</p>
          <ul className="list-disc pl-5 text-sm">
            <li>{t('Find first occurrence (return index i)', 'Găsirea primei apariții (returnează index i)')}</li>
            <li>{t('Find all occurrences (return set of all i)', 'Găsirea tuturor aparițiilor (returnează mulțimea tuturor i)')}</li>
            <li>{t('Decision version (does P occur in T? Yes/No)', 'Versiunea de decizie (apare P în T? Yes/No)')}</li>
          </ul>
        </Box>
      </Section>

      {/* ── 2. Naive Algorithm ── */}
      <Section title={t('2. The Naive Algorithm', '2. Algoritmul naiv')} id="pa-c5-naive" checked={!!checked['pa-c5-naive']} onCheck={() => toggleCheck('pa-c5-naive')}>
        <p>{t('Check every possible offset i from 0 to n-m, comparing P against T[i..i+m-1] character by character:', 'Verifică fiecare offset posibil i de la 0 la n-m, comparând P cu T[i..i+m-1] caracter cu caracter:')}</p>

        <Code>{`int naive(char *T, int n, char *P, int m) {
  for (int i = 0; i < n - m + 1; ++i) {
    bool found = true;
    for (int k = 0; k < m; ++k) {
      if (P[k] != T[i + k]) {
        found = false;
        break;
      }
    }
    if (found) return i;
  }
  return -1;
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Worst case: O(n·m) = O(d²)', 'Caz defavorabil: O(n·m) = O(d²)')}</p>
          <p className="text-sm">{t('Worst case input: T = "AAA...AB" (n-1 As + B), P = "AA...AB" (m-1 As + B). At every offset, all m comparisons are made before mismatch at the last character.', 'Input cel mai defavorabil: T = "AAA...AB" (n-1 A-uri + B), P = "AA...AB" (m-1 A-uri + B). La fiecare offset, toate cele m comparații sunt făcute înainte de mismatch la ultimul caracter.')}</p>
        </Box>
      </Section>

      {/* ── 3. KMP Algorithm ── */}
      <Section title={t('3. The KMP Algorithm', '3. Algoritmul KMP')} id="pa-c5-kmp" checked={!!checked['pa-c5-kmp']} onCheck={() => toggleCheck('pa-c5-kmp')}>
        <Box type="theorem">
          <p className="font-bold">{t('Key idea:', 'Ideea cheie:')}</p>
          <p>{t('Reuse information from comparisons at the current offset to skip impossible offsets. When a mismatch occurs after matching j characters, use the failure function to jump directly to the next viable offset — without re-comparing characters already known to match.', 'Reutilizează informația din comparațiile de la offset-ul curent pentru a sări offset-urile imposibile. Când apare un mismatch după potrivirea a j caractere, folosește funcția de eșec pentru a sări direct la următorul offset viabil — fără a recompara caractere deja cunoscute ca potrivite.')}</p>
        </Box>

        <Box type="definition">
          <p className="font-bold">{t('Border of a string', 'Border al unui șir')}</p>
          <p>{t('A border of string S is a substring that is simultaneously a proper prefix AND a proper suffix of S. Example: "ABAB" is a border of "ABABXABAB" (prefix ABAB = suffix ABAB). A string can have multiple borders.', 'Un border al șirului S este un subșir care este simultan un prefix propriu ȘI un sufix propriu al lui S. Exemplu: "ABAB" este un border al "ABABXABAB" (prefix ABAB = sufix ABAB). Un șir poate avea mai multe borders.')}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Failure function F[j]', 'Funcția de eșec F[j]')}</p>
          <p className="text-sm">{t('F[j] = length of the longest proper border of P[0..j]. F[0] = 0 always. This tells KMP: after matching j+1 characters and finding a mismatch, the next comparison should start at position F[j] in the pattern (skipping F[j] characters that are already known to match).', 'F[j] = lungimea celui mai lung border propriu al P[0..j]. F[0] = 0 întotdeauna. Aceasta spune KMP-ului: după potrivirea a j+1 caractere și găsirea unui mismatch, următoarea comparație ar trebui să înceapă de la poziția F[j] în pattern (sărind F[j] caractere deja știute ca potrivite).')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Example:', 'Exemplu:')}</p>
        <Code>{`Pattern: A B A B X A B A B Y
Index:   0 1 2 3 4 5 6 7 8 9
F[j]:    0 0 1 2 0 1 2 3 4 0

F[3]=2: border of "ABAB" is "AB" (length 2)
F[8]=4: border of "ABABXABAB" is "ABAB" (length 4)`}</Code>

        <p className="font-bold mt-3">{t('KMP Search Algorithm:', 'Algoritmul de căutare KMP:')}</p>
        <Code>{`int kmp(char *T, int n, char *P, int m, int *F) {
  int j = 0;  // position in pattern
  for (int i = 0; i < n; ++i) {
    while (j > 0 && T[i] != P[j])
      j = F[j - 1];     // fall back using failure function
    if (T[i] == P[j])
      j++;
    if (j == m)
      return i - m + 1;  // match found at offset i-m+1
  }
  return -1;
}
// Time: O(n) — each character of T examined at most twice`}</Code>

        <Box type="theorem">
          <p className="font-bold">{t('KMP Complexity', 'Complexitatea KMP')}</p>
          <p>{t('Search phase: O(n). Preprocessing (computing F): O(m). Total: O(n + m) — linear in the input size.', 'Faza de căutare: O(n). Preprocesare (calculul lui F): O(m). Total: O(n + m) — liniar în dimensiunea input-ului.')}</p>
        </Box>
      </Section>

      {/* ── 4. Failure Function Computation ── */}
      <Section title={t('4. Computing the Failure Function', '4. Calculul funcției de eșec')} id="pa-c5-fail" checked={!!checked['pa-c5-fail']} onCheck={() => toggleCheck('pa-c5-fail')}>
        <p>{t('The failure function is computed by matching the pattern against itself — essentially running KMP on P with P as both text and pattern:', 'Funcția de eșec este calculată potrivind pattern-ul cu el însuși — rulând esențial KMP pe P cu P ca atât text cât și pattern:')}</p>

        <Code>{`void computeF(char *P, int m, int *F) {
  F[0] = 0;
  int j = 0;
  for (int i = 1; i < m; ++i) {
    while (j > 0 && P[i] != P[j])
      j = F[j - 1];
    if (P[i] == P[j])
      j++;
    F[i] = j;
  }
}
// Time: O(m)`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Why is KMP not commonly used in practice?', 'De ce KMP nu este folosit frecvent în practică?')}</p>
          <p>{t('While KMP guarantees O(n+m) worst case, Boyer-Moore is typically faster in practice (sublinear average case — it can skip characters). However, KMP concepts (borders, failure function) are reused in Boyer-Moore and other algorithms.', 'Deși KMP garantează O(n+m) în cazul cel mai defavorabil, Boyer-Moore este de obicei mai rapid în practică (caz mediu subliniar — poate sări caractere). Totuși, conceptele KMP (borders, funcția de eșec) sunt reutilizate în Boyer-Moore și alți algoritmi.')}</p>
        </Box>
      </Section>

      {/* ── Self-Test ── */}
      <Section title={t('Self-Test (5 Questions)', 'Autoevaluare (5 întrebări)')} id="pa-c5-quiz" checked={!!checked['pa-c5-quiz']} onCheck={() => toggleCheck('pa-c5-quiz')}>
        <Toggle question={t('1. What is the worst-case complexity of the naive string matching algorithm?', '1. Care este complexitatea cazului cel mai defavorabil al algoritmului naiv de potrivire?')} answer={t('O(n·m) or O(d²) where d = n+m. Worst case: T = "AAA...AB", P = "AA...AB" — at every offset, all m characters are compared before the mismatch at the end.', 'O(n·m) sau O(d²) unde d = n+m. Cazul cel mai defavorabil: T = "AAA...AB", P = "AA...AB" — la fiecare offset, toate cele m caractere sunt comparate înainte de mismatch la final.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
        <Toggle question={t('2. What is a border of a string?', '2. Ce este un border al unui șir?')} answer={t('A border is a substring that is simultaneously a proper prefix and a proper suffix of the string. Example: "AB" and "ABAB" are both borders of "ABABXABAB".', 'Un border este un subșir care este simultan un prefix propriu și un sufix propriu al șirului. Exemplu: "AB" și "ABAB" sunt ambele borders ale "ABABXABAB".')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
        <Toggle question={t('3. What does the failure function F[j] represent?', '3. Ce reprezintă funcția de eșec F[j]?')} answer={t('F[j] = the length of the longest proper border of P[0..j]. It tells KMP where to resume matching after a mismatch: jump to position F[j-1] in the pattern instead of starting over.', 'F[j] = lungimea celui mai lung border propriu al P[0..j]. Spune KMP-ului unde să reia potrivirea după un mismatch: sare la poziția F[j-1] în pattern în loc să înceapă de la capăt.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
        <Toggle question={t('4. What is the total time complexity of KMP?', '4. Care este complexitatea totală a KMP?')} answer={t('O(n + m): O(m) for preprocessing (computing failure function) + O(n) for the search phase. This is optimal — you must read every character at least once.', 'O(n + m): O(m) pentru preprocesare (calculul funcției de eșec) + O(n) pentru faza de căutare. Este optim — trebuie citit fiecare caracter cel puțin o dată.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
        <Toggle question={t('5. Compute F for pattern "AABAAAB".', '5. Calculați F pentru pattern-ul "AABAAAB".')} answer={t('A A B A A A B → F = [0, 1, 0, 1, 2, 2, 3]. F[4]=2 because "AA" is a border of "AABAA". F[6]=3 because "AAB" is a border of "AABAAAB".', 'A A B A A A B → F = [0, 1, 0, 1, 2, 2, 3]. F[4]=2 deoarece "AA" este un border al "AABAA". F[6]=3 deoarece "AAB" este un border al "AABAAAB".')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
      </Section>
    </>
  );
}
