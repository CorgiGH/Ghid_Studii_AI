import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar05() {
  const { t } = useApp();

  /* ─── Problem 1: Editor search performance ─── */
  const mc1 = [{
    question: {
      en: 'You create a text file filled with "abab...ab" (10-100 MB) and insert a single "a" in the middle. You search for "aa", "baa", "abaa", "babaa", "ababaa", etc. How does the editor\'s search time behave as the pattern length grows?',
      ro: 'Creați un fișier text cu "abab...ab" (10-100 MB) și inserați un singur "a" la mijloc. Căutați "aa", "baa", "abaa", "babaa", "ababaa", etc. Cum se comportă timpul de căutare al editorului pe măsură ce lungimea pattern-ului crește?',
    },
    options: [
      { text: { en: 'Search time increases linearly with pattern length', ro: 'Timpul de căutare crește liniar cu lungimea pattern-ului' }, correct: false },
      { text: { en: 'Search time increases quadratically with pattern length', ro: 'Timpul de căutare crește pătratic cu lungimea pattern-ului' }, correct: false },
      { text: { en: 'Search time stays roughly constant or decreases — longer patterns fail faster on the periodic text', ro: 'Timpul de căutare rămâne aproximativ constant sau scade — pattern-urile mai lungi eșuează mai repede pe textul periodic' }, correct: true },
      { text: { en: 'Search time depends only on file size, not pattern length', ro: 'Timpul de căutare depinde doar de dimensiunea fișierului, nu de lungimea pattern-ului' }, correct: false },
    ],
    explanation: {
      en: 'The text is highly periodic ("abab..."). Most editors use optimized algorithms (like Boyer-Moore) where longer patterns allow bigger jumps. Even with naive search, the periodic structure causes mismatches early. The single "a" insertion creates the only match point, so longer patterns fail faster at non-matching positions.',
      ro: 'Textul este foarte periodic ("abab..."). Majoritatea editoarelor folosesc algoritmi optimizați (precum Boyer-Moore) unde pattern-uri mai lungi permit salturi mai mari. Chiar și cu căutare naivă, structura periodică cauzează nepotriviri devreme. Inserarea unui singur "a" creează singurul punct de potrivire, deci pattern-urile mai lungi eșuează mai rapid la pozițiile fără potrivire.',
    },
  }];

  /* ─── Problem 2: Worst case naive search ─── */
  const mc2form = [{
    question: {
      en: 'What is the I/O formalization for finding worst-case inputs for naive string search?',
      ro: 'Care este formalizarea I/O pentru găsirea datelor de intrare în cazul cel mai nefavorabil pentru căutarea naivă?',
    },
    options: [
      { text: { en: 'Input: n, m ∈ ℤ⁺; Output: T[1..n], P[1..m] such that naive search performs maximum comparisons', ro: 'Input: n, m ∈ ℤ⁺; Output: T[1..n], P[1..m] astfel încât căutarea naivă realizează maximum de comparații' }, correct: true },
      { text: { en: 'Input: T[1..n], P[1..m]; Output: count of comparisons', ro: 'Input: T[1..n], P[1..m]; Output: numărul de comparații' }, correct: false },
      { text: { en: 'Input: n ∈ ℤ⁺; Output: T[1..n] with maximum repetitions', ro: 'Input: n ∈ ℤ⁺; Output: T[1..n] cu maximum de repetiții' }, correct: false },
      { text: { en: 'Input: m ∈ ℤ⁺; Output: P[1..m] that maximizes search time for any text', ro: 'Input: m ∈ ℤ⁺; Output: P[1..m] care maximizează timpul de căutare pentru orice text' }, correct: false },
    ],
    explanation: {
      en: 'We need to construct both the text and pattern of given sizes that maximize the number of comparisons.',
      ro: 'Trebuie să construim atât textul cât și pattern-ul de dimensiuni date care maximizează numărul de comparații.',
    },
  }];

  const mc2worst = [{
    question: {
      en: 'Which text/pattern pair produces the maximum number of comparisons for naive search (text length n, pattern length m)?',
      ro: 'Ce pereche text/pattern produce numărul maxim de comparații pentru căutarea naivă (lungime text n, lungime pattern m)?',
    },
    options: [
      { text: { en: 'T = "aaa...a" (n times), P = "aaa...ab" (m-1 a\'s + b)', ro: 'T = "aaa...a" (de n ori), P = "aaa...ab" (m-1 a-uri + b)' }, correct: true },
      { text: { en: 'T = "abab...ab", P = "baba...ba"', ro: 'T = "abab...ab", P = "baba...ba"' }, correct: false },
      { text: { en: 'T = "abcabc...abc", P = "abc...abd"', ro: 'T = "abcabc...abc", P = "abc...abd"' }, correct: false },
      { text: { en: 'T = "aaa...a", P = "aaa...a" (same character)', ro: 'T = "aaa...a", P = "aaa...a" (același caracter)' }, correct: false },
    ],
    explanation: {
      en: 'With T = "aaa...a" and P = "aaa...ab", at every position the naive algorithm matches m-1 characters before failing on the last. This gives (n - m + 1) · m comparisons = O(n·m).',
      ro: 'Cu T = "aaa...a" și P = "aaa...ab", la fiecare poziție algoritmul naiv potrivește m-1 caractere înainte de a eșua la ultimul. Aceasta dă (n - m + 1) · m comparații = O(n·m).',
    },
  }];

  const mc2count = [{
    question: {
      en: 'What is the exact maximum number of comparisons for naive search with text of length n and pattern of length m?',
      ro: 'Care este numărul maxim exact de comparații pentru căutarea naivă cu text de lungime n și pattern de lungime m?',
    },
    options: [
      { text: { en: '(n − m + 1) · m', ro: '(n − m + 1) · m' }, correct: true },
      { text: { en: 'n · m', ro: 'n · m' }, correct: false },
      { text: { en: 'n · (m − 1)', ro: 'n · (m − 1)' }, correct: false },
      { text: { en: '(n − m) · m + 1', ro: '(n − m) · m + 1' }, correct: false },
    ],
    explanation: {
      en: 'There are (n - m + 1) valid starting positions, and at each position at most m comparisons are made. The worst case achieves exactly m comparisons at each position.',
      ro: 'Există (n - m + 1) poziții de start valide, iar la fiecare poziție se fac cel mult m comparații. Cazul cel mai nefavorabil atinge exact m comparații la fiecare poziție.',
    },
  }];

  /* ─── Problem 3: Best case naive search ─── */
  const mc3 = [{
    question: {
      en: 'What is the minimum number of comparisons for naive search to determine there is no match (text length n, pattern length m, and P does NOT occur in T)?',
      ro: 'Care este numărul minim de comparații pentru căutarea naivă pentru a determina că nu există potrivire (lungime text n, lungime pattern m, P NU apare în T)?',
    },
    options: [
      { text: { en: 'n − m + 1', ro: 'n − m + 1' }, correct: true },
      { text: { en: 'n', ro: 'n' }, correct: false },
      { text: { en: 'm', ro: 'm' }, correct: false },
      { text: { en: 'n / m', ro: 'n / m' }, correct: false },
    ],
    explanation: {
      en: 'Best case: the first character of P doesn\'t match any position in T. We check 1 comparison per starting position = n - m + 1. Example: T = "bbb...b", P = "a...a".',
      ro: 'Cazul cel mai favorabil: primul caracter al lui P nu se potrivește la nicio poziție din T. Verificăm 1 comparație per poziție de start = n - m + 1. Exemplu: T = "bbb...b", P = "a...a".',
    },
  }];

  /* ─── Problem 4: All distinct characters in pattern ─── */
  const mc4form = [{
    question: {
      en: 'What is the I/O formalization for finding all occurrences of P in T, given that all characters in P are distinct?',
      ro: 'Care este formalizarea I/O pentru găsirea tuturor aparițiilor lui P în T, știind că toate caracterele din P sunt distincte?',
    },
    options: [
      { text: { en: 'Input: T[1..n], P[1..m] with all characters in P distinct; Output: all positions i where T[i..i+m-1] = P', ro: 'Input: T[1..n], P[1..m] cu toate caracterele din P distincte; Output: toate pozițiile i unde T[i..i+m-1] = P' }, correct: true },
      { text: { en: 'Input: T[1..n], P[1..m]; Output: true/false', ro: 'Input: T[1..n], P[1..m]; Output: true/false' }, correct: false },
      { text: { en: 'Input: T[1..n], P[1..m] with all characters distinct in both; Output: positions', ro: 'Input: T[1..n], P[1..m] cu toate caracterele distincte în ambele; Output: poziții' }, correct: false },
      { text: { en: 'Input: T[1..n]; Output: P[1..m] with distinct characters', ro: 'Input: T[1..n]; Output: P[1..m] cu caractere distincte' }, correct: false },
    ],
    explanation: {
      en: 'The key constraint is that characters are distinct only in P (not necessarily in T). We output all starting positions of matches.',
      ro: 'Constrângerea cheie este că caracterele sunt distincte doar în P (nu neapărat în T). Returnăm toate pozițiile de start ale potrivirilor.',
    },
  }];

  const mc4complex = [{
    question: {
      en: 'Why can we achieve O(n) instead of O(n·m) when all characters in P are distinct?',
      ro: 'De ce putem obține O(n) în loc de O(n·m) când toate caracterele din P sunt distincte?',
    },
    options: [
      { text: { en: 'If a mismatch occurs at position j in the pattern, we know all characters P[1..j-1] matched and are distinct, so none of them can start a new match — skip ahead by j positions', ro: 'Dacă apare o nepotrivire la poziția j în pattern, știm că toate caracterele P[1..j-1] s-au potrivit și sunt distincte, deci niciunul nu poate începe o nouă potrivire — sărim înainte cu j poziții' }, correct: true },
      { text: { en: 'Because distinct characters means the pattern can only appear once', ro: 'Pentru că caractere distincte înseamnă că pattern-ul poate apărea doar o dată' }, correct: false },
      { text: { en: 'Because we can use a hash function to compare in O(1)', ro: 'Pentru că putem folosi o funcție hash pentru a compara în O(1)' }, correct: false },
      { text: { en: 'Because the alphabet size limits the pattern length', ro: 'Pentru că dimensiunea alfabetului limitează lungimea pattern-ului' }, correct: false },
    ],
    explanation: {
      en: 'Since all characters in P are distinct, if P[1..j-1] matches T[i..i+j-2], then T[i..i+j-2] are all different. So no suffix of T[i..i+j-2] can equal a prefix of P. We jump directly to position i+j, ensuring each text character is examined at most once → O(n).',
      ro: 'Deoarece toate caracterele din P sunt distincte, dacă P[1..j-1] se potrivește cu T[i..i+j-2], atunci T[i..i+j-2] sunt toate diferite. Deci niciun sufix al lui T[i..i+j-2] nu poate fi egal cu un prefix al lui P. Sărim direct la poziția i+j, asigurând că fiecare caracter din text este examinat cel mult o dată → O(n).',
    },
  }];

  /* ─── Problem 5: KMP prefix function + simulation ─── */
  const mc5prefix = [{
    question: {
      en: 'What is the KMP prefix (failure) function for pattern "abcab"?',
      ro: 'Care este funcția prefix (de eșec) KMP pentru pattern-ul "abcab"?',
    },
    options: [
      { text: { en: 'f = [-1, 0, 0, 0, 1, 2]', ro: 'f = [-1, 0, 0, 0, 1, 2]' }, correct: true },
      { text: { en: 'f = [-1, 0, 0, 1, 1, 2]', ro: 'f = [-1, 0, 0, 1, 1, 2]' }, correct: false },
      { text: { en: 'f = [-1, 0, 0, 0, 0, 1]', ro: 'f = [-1, 0, 0, 0, 0, 1]' }, correct: false },
      { text: { en: 'f = [0, 0, 0, 1, 2, 0]', ro: 'f = [0, 0, 0, 1, 2, 0]' }, correct: false },
    ],
    explanation: {
      en: 'f[0] = -1 (by convention). f[1] = 0 ("a" has no proper prefix = suffix). f[2] = 0 ("ab": no match). f[3] = 0 ("abc": no match). f[4] = 1 ("abca": "a" is both prefix and suffix). f[5] = 2 ("abcab": "ab" is both prefix and suffix).',
      ro: 'f[0] = -1 (prin convenție). f[1] = 0 ("a" nu are prefix propriu = sufix). f[2] = 0 ("ab": fără potrivire). f[3] = 0 ("abc": fără potrivire). f[4] = 1 ("abca": "a" e atât prefix cât și sufix). f[5] = 2 ("abcab": "ab" e atât prefix cât și sufix).',
    },
  }];

  const mc5sim = [{
    question: {
      en: 'When running KMP to search for "abcab" in "aabcbcbabcabcabc", at which position(s) is a full match found (find-all variant)?',
      ro: 'La rularea KMP pentru a căuta "abcab" în "aabcbcbabcabcabc", la ce poziție(i) se găsește o potrivire completă (varianta find-all)?',
    },
    options: [
      { text: { en: 'Positions 7 and 10 (0-indexed)', ro: 'Pozițiile 7 și 10 (indexat de la 0)' }, correct: true },
      { text: { en: 'Position 7 only (T[7..11] = "abcab")', ro: 'Doar poziția 7 (T[7..11] = "abcab")' }, correct: false },
      { text: { en: 'Position 8 (T[8..12] = "bcabc")', ro: 'Poziția 8 (T[8..12] = "bcabc")' }, correct: false },
      { text: { en: 'No match found', ro: 'Nu s-a găsit nicio potrivire' }, correct: false },
    ],
    explanation: {
      en: 'Text: "aabcbcbabcabcabc". T[7..11] = "abcab" ✓ (first match). The find-all variant then sets j = f[m] and continues, finding T[10..14] = "abcab" ✓ (second match). Find-first KMP would stop at 7; find-all reports both.',
      ro: 'Text: "aabcbcbabcabcabc". T[7..11] = "abcab" ✓ (prima potrivire). Varianta find-all setează apoi j = f[m] și continuă, găsind T[10..14] = "abcab" ✓ (a doua potrivire). KMP find-first s-ar opri la 7; find-all le raportează pe amândouă.',
    },
  }];

  /* ─── Problem 6: KMP mismatch handling ─── */
  const mc6next = [{
    question: {
      en: 'During KMP search for pattern "ababa" in text "bbabaababa", a mismatch occurs at position i=2 in the text after k=3 characters matched (positions 2,3,4 match "aba" but position 5 doesn\'t match pattern[3]="b"). What is the next alignment position for the pattern?',
      ro: 'În timpul căutării KMP a pattern-ului "ababa" în textul "bbabaababa", o nepotrivire apare la poziția i=2 din text după k=3 caractere potrivite (pozițiile 2,3,4 potrivesc "aba" dar poziția 5 nu potrivește pattern[3]="b"). Care este următoarea poziție de aliniere a pattern-ului?',
    },
    options: [
      { text: { en: 'Position 4 — shift by 2, with 1 character already matched', ro: 'Poziția 4 — deplasare cu 2, cu 1 caracter deja potrivit' }, correct: true },
      { text: { en: 'Position 3 — shift by 1', ro: 'Poziția 3 — deplasare cu 1' }, correct: false },
      { text: { en: 'Position 5 — shift by 3, start fresh', ro: 'Poziția 5 — deplasare cu 3, pornire de la zero' }, correct: false },
      { text: { en: 'Position 6 — skip past the mismatch entirely', ro: 'Poziția 6 — sărim peste nepotrivire complet' }, correct: false },
    ],
    explanation: {
      en: 'We matched "aba" (3 characters). The prefix function for "aba" gives f[3] = 1, meaning "a" is both a proper prefix and suffix. So we shift the pattern so that the prefix "a" aligns with the suffix "a" of the matched portion. New alignment at position 4, with 1 character already known to match.',
      ro: 'Am potrivit "aba" (3 caractere). Funcția prefix pentru "aba" dă f[3] = 1, adică "a" este atât prefix propriu cât și sufix. Deplasăm pattern-ul astfel încât prefixul "a" să se alinieze cu sufixul "a" al porțiunii potrivite. Noua aliniere la poziția 4, cu 1 caracter deja știut ca potrivit.',
    },
  }];

  const mc6count = [{
    question: {
      en: 'How many characters are guaranteed to match at the new alignment (after the shift described above)?',
      ro: 'Câte caractere sunt garantat potrivite la noua aliniere (după deplasarea descrisă mai sus)?',
    },
    options: [
      { text: { en: '1', ro: '1' }, correct: true },
      { text: { en: '0', ro: '0' }, correct: false },
      { text: { en: '2', ro: '2' }, correct: false },
      { text: { en: '3', ro: '3' }, correct: false },
    ],
    explanation: {
      en: 'f[3] = 1 means the longest proper prefix of "aba" that is also a suffix has length 1 ("a"). So 1 character is already matched at the new position.',
      ro: 'f[3] = 1 înseamnă că cel mai lung prefix propriu al lui "aba" care este și sufix are lungimea 1 ("a"). Deci 1 caracter este deja potrivit la noua poziție.',
    },
  }];

  /* ─── Problem 7: Prefix function with 2 while iterations ─── */
  const mc7 = [{
    question: {
      en: 'Which pattern has a character where the KMP prefix function\'s while loop executes exactly two iterations (two longest prefix-suffixes cannot be extended, but a third one can)?',
      ro: 'Ce pattern are un caracter unde bucla while din funcția prefix KMP execută exact două iterații (două cele mai lungi prefixe-sufixe nu pot fi extinse, dar al treilea poate)?',
    },
    options: [
      { text: { en: '"abaababaab"', ro: '"abaababaab"' }, correct: true },
      { text: { en: '"ababab"', ro: '"ababab"' }, correct: false },
      { text: { en: '"abcabc"', ro: '"abcabc"' }, correct: false },
      { text: { en: '"aabaaab"', ro: '"aabaaab"' }, correct: false },
    ],
    explanation: {
      en: 'Consider "abaababaab": while computing f[7] (current char P[6]="b"), we start with j = f[6] = 3, try P[3] = "a" ≠ "b" → first while iteration falls j to f[3] = 1. Then P[1] = "b" = "b" ✓ → second while-check exits. f[7] = 2, matching the table below.',
      ro: 'Considerăm "abaababaab": la calculul lui f[7] (caracterul curent P[6]="b"), pornim cu j = f[6] = 3, încercăm P[3] = "a" ≠ "b" → prima iterație while face j = f[3] = 1. Apoi P[1] = "b" = "b" ✓ → a doua verificare while iese. f[7] = 2, conform tabelului de mai jos.',
    },
  }];

  /* ─── Problem 8: Complete prefix function table ─── */
  const mc8a = [{
    question: {
      en: 'For pattern "xyxxyxxyxyxyyxyyxyyxyxyyxyy", what is f[4] (prefix "xyxxy")?',
      ro: 'Pentru pattern-ul "xyxxyxxyxyxyyxyyxyyxyxyyxyy", care este f[4] (prefixul "xyxxy")?',
    },
    options: [
      { text: { en: '1', ro: '1' }, correct: false },
      { text: { en: '2', ro: '2' }, correct: true },
      { text: { en: '0', ro: '0' }, correct: false },
      { text: { en: '3', ro: '3' }, correct: false },
    ],
    explanation: {
      en: '"xyxxy": the longest proper prefix that is also a suffix is "xy" (length 2). "xyx" is a prefix but not a suffix ("xxy" ≠ "xyx").',
      ro: '"xyxxy": cel mai lung prefix propriu care este și sufix este "xy" (lungime 2). "xyx" este prefix dar nu sufix ("xxy" ≠ "xyx").',
    },
  }];

  const mc8b = [{
    question: {
      en: 'Continuing the pattern "xyxxyxxyxyxyyxyyxyyxyxyyxyy": what is f[8] (prefix "xyxxyxxyx")?',
      ro: 'Continuând pattern-ul "xyxxyxxyxyxyyxyyxyyxyxyyxyy": care este f[8] (prefixul "xyxxyxxyx")?',
    },
    options: [
      { text: { en: '3', ro: '3' }, correct: true },
      { text: { en: '2', ro: '2' }, correct: false },
      { text: { en: '4', ro: '4' }, correct: false },
      { text: { en: '1', ro: '1' }, correct: false },
    ],
    explanation: {
      en: '"xyxxyxxyx": the longest proper prefix that is also a suffix is "xyx" (length 3). Check: prefix "xyx" = suffix "xyx" ✓.',
      ro: '"xyxxyxxyx": cel mai lung prefix propriu care este și sufix este "xyx" (lungime 3). Verificare: prefix "xyx" = sufix "xyx" ✓.',
    },
  }];

  const mc8c = [{
    question: {
      en: 'For the same pattern, what is f[12] (prefix "xyxxyxxyxyxyy")?',
      ro: 'Pentru același pattern, care este f[12] (prefixul "xyxxyxxyxyxyy")?',
    },
    options: [
      { text: { en: '0', ro: '0' }, correct: true },
      { text: { en: '1', ro: '1' }, correct: false },
      { text: { en: '2', ro: '2' }, correct: false },
      { text: { en: '3', ro: '3' }, correct: false },
    ],
    explanation: {
      en: '"xyxxyxxyxyxyy": ends with "y". The prefix starts with "x", so any prefix-suffix must start with "x" and end with "y". Checking: "xy" prefix vs last two "yy" — no match. The suffix "y" ≠ prefix "x". So f[12] = 0.',
      ro: '"xyxxyxxyxyxyy": se termină cu "y". Prefixul începe cu "x", deci orice prefix-sufix trebuie să înceapă cu "x" și să se termine cu "y". Verificare: prefix "xy" vs ultimele două "yy" — fără potrivire. Sufixul "y" ≠ prefixul "x". Deci f[12] = 0.',
    },
  }];

  /* ─── Problem 9: KMP all occurrences ─── */
  const mc9 = [{
    question: {
      en: 'How should the KMP algorithm be modified to find ALL occurrences of the pattern (not just the first)?',
      ro: 'Cum ar trebui modificat algoritmul KMP pentru a găsi TOATE aparițiile pattern-ului (nu doar prima)?',
    },
    options: [
      { text: { en: 'After a full match at position i, set j ← f[m] and continue (don\'t stop)', ro: 'După o potrivire completă la poziția i, setăm j ← f[m] și continuăm (nu ne oprim)' }, correct: true },
      { text: { en: 'After a full match, restart from position i + 1 with j = 0', ro: 'După o potrivire completă, repornim de la poziția i + 1 cu j = 0' }, correct: false },
      { text: { en: 'After a full match, restart from position i + m with j = 0', ro: 'După o potrivire completă, repornim de la poziția i + m cu j = 0' }, correct: false },
      { text: { en: 'The standard KMP already finds all occurrences without modification', ro: 'KMP standard găsește deja toate aparițiile fără modificări' }, correct: false },
    ],
    explanation: {
      en: 'When j reaches m (full match), we record the occurrence and set j ← f[m]. This uses the prefix function to know the longest proper prefix of P that is also a suffix — that portion is already matched, so we continue from there. This maintains O(n+m) complexity.',
      ro: 'Când j ajunge la m (potrivire completă), înregistrăm apariția și setăm j ← f[m]. Aceasta folosește funcția prefix pentru a ști cel mai lung prefix propriu al lui P care este și sufix — acea porțiune este deja potrivită, deci continuăm de acolo. Aceasta menține complexitatea O(n+m).',
    },
  }];

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t('Source: Algorithm Design Seminar 5 — String Searching, UAIC 2026.',
          'Sursa: Seminar PA 5 — Căutarea peste șiruri, UAIC 2026.')}
      </p>

      {/* ─── Problem 1 ─── */}
      <h3 className="text-lg font-bold mt-6 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 1: Editor Search Performance', 'Problema 1: Performanța căutării în editor')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Create a text file filled with "abab...ab" as large as possible (10-100 MB). Insert a single "a" somewhere in the middle. Search for "aa", "baa", "abaa", "babaa", "ababaa", etc. How fast is the editor\'s search function depending on the pattern size?',
            'Creați un fișier text cu conținutul "abab...ab" cât mai mare posibil (10-100 MB). Inserați un "a" undeva la mijloc. Căutați, pe rând, șirurile "aa", "baa", "abaa", "babaa", "ababaa", etc. Cât de rapidă este funcția de căutare a editorului în funcție de dimensiunea pattern-ului?',
          )}
        </p>
      </Box>
      <MultipleChoice questions={mc1} />

      {/* ─── Problem 2 ─── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 2: Worst Case for Naive Search', 'Problema 2: Cazul cel mai nefavorabil pentru căutarea naivă')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Find an example for which naive search performs the maximum number of comparisons, for strings of any given size. Estimate this number theoretically.',
            'Găsiți un exemplu pentru care căutarea naivă face numărul maxim de comparații, pentru șiruri de mărimi date. Estimați teoretic acest număr.',
          )}
        </p>
      </Box>
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part A: Formalization', 'Partea A: Formalizare')}</p>
      <MultipleChoice questions={mc2form} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part B: Worst-case example', 'Partea B: Exemplu cazul cel mai nefavorabil')}</p>
      <MultipleChoice questions={mc2worst} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part C: Comparison count', 'Partea C: Numărul de comparații')}</p>
      <MultipleChoice questions={mc2count} />
      <Toggle
        question={t('Show detailed explanation', 'Arată explicația detaliată')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Worst-case construction', 'Construcția cazului cel mai nefavorabil')}</p>
            <p className="text-sm mb-2">
              {t(
                'T = "aaa...a" (n a\'s), P = "aa...ab" (m-1 a\'s followed by b). At each of the (n-m+1) positions, the naive algorithm compares m characters before finding the mismatch at the last position.',
                'T = "aaa...a" (n a-uri), P = "aa...ab" (m-1 a-uri urmate de b). La fiecare din cele (n-m+1) poziții, algoritmul naiv compară m caractere înainte de a găsi nepotrivirea la ultima poziție.',
              )}
            </p>
            <Box type="theorem">
              <p className="text-sm">
                {t('Maximum comparisons: (n − m + 1) · m = O(n · m)',
                  'Comparații maxime: (n − m + 1) · m = O(n · m)')}
              </p>
            </Box>
          </div>
        }
      />

      {/* ─── Problem 3 ─── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 3: Best Case for Naive Search', 'Problema 3: Cazul cel mai favorabil pentru căutarea naivă')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Find an example for which naive search performs the minimum number of comparisons, for strings of any given size.',
            'Găsiți un exemplu pentru care căutarea naivă face numărul minim de comparații, pentru șiruri de mărimi date.',
          )}
        </p>
      </Box>
      <MultipleChoice questions={mc3} />
      <Toggle
        question={t('Show detailed explanation', 'Arată explicația detaliată')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Best-case construction', 'Construcția cazului cel mai favorabil')}</p>
            <p className="text-sm mb-2">
              {t(
                'T = "bbb...b" (n b\'s), P = "aaa...a" (m a\'s). At every position, the first comparison fails immediately. Total: n - m + 1 comparisons = O(n).',
                'T = "bbb...b" (n b-uri), P = "aaa...a" (m a-uri). La fiecare poziție, prima comparație eșuează imediat. Total: n - m + 1 comparații = O(n).',
              )}
            </p>
            <Box type="theorem">
              <p className="text-sm">
                {t('Minimum comparisons: n − m + 1 = O(n)',
                  'Comparații minime: n − m + 1 = O(n)')}
              </p>
            </Box>
          </div>
        }
      />

      {/* ─── Problem 4 ─── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 4: Pattern with All Distinct Characters', 'Problema 4: Pattern cu toate caracterele distincte')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Let T be a text of length n and P a pattern of length m. It is known that all characters in P are distinct. Design an O(n+m) worst-case algorithm that finds all occurrences of P in T. Argue correctness and complexity.',
            'Fie T un text de lungime n și P un cuvânt de lungime m. Se știe că în P toate caracterele sunt distincte. Proiectați un algoritm de complexitate O(n+m) în cazul cel mai nefavorabil care determină toate aparițiile lui P în T. Argumentați corectitudinea și complexitatea algoritmului propus.',
          )}
        </p>
      </Box>
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part A: Formalization', 'Partea A: Formalizare')}</p>
      <MultipleChoice questions={mc4form} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part B: Key insight', 'Partea B: Ideea cheie')}</p>
      <MultipleChoice questions={mc4complex} />
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">
              {t(
                'Since all characters in P are distinct, when we match P[1..j-1] with T[i..i+j-2] and a mismatch occurs at P[j] ≠ T[i+j-1], we know that T[i..i+j-2] are all distinct (they equal P[1..j-1]). Therefore, no starting position between i+1 and i+j-1 can begin a match. We jump directly to i+j (or i+1 if mismatch at first character).',
                'Deoarece toate caracterele din P sunt distincte, când potrivim P[1..j-1] cu T[i..i+j-2] și o nepotrivire apare la P[j] ≠ T[i+j-1], știm că T[i..i+j-2] sunt toate distincte (sunt egale cu P[1..j-1]). Prin urmare, nicio poziție de start între i+1 și i+j-1 nu poate începe o potrivire. Sărim direct la i+j (sau i+1 dacă nepotrivirea e la primul caracter).',
              )}
            </p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm DistinctPatternSearch(T[1..n], P[1..m])
  i ← 1
  while i ≤ n − m + 1 do
    j ← 1
    while j ≤ m and T[i + j − 1] = P[j] do
      j ← j + 1
    if j = m + 1 then
      output i        // match found at position i
      i ← i + m       // skip past the match
    else if j = 1 then
      i ← i + 1       // mismatch at first character
    else
      i ← i + j − 1   // skip: no match can start in matched region`}</Code>
            <Box type="theorem">
              <p className="text-sm">
                {t(
                  'Complexity: O(n + m). Each character of T is compared at most once because after each mismatch we jump past all matched characters.',
                  'Complexitate: O(n + m). Fiecare caracter din T este comparat cel mult o dată deoarece după fiecare nepotrivire sărim peste toate caracterele potrivite.',
                )}
              </p>
            </Box>
          </div>
        }
      />

      {/* ─── Problem 5 ─── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 5: KMP Prefix Function & Simulation', 'Problema 5: Funcția prefix KMP și simulare')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Compute the KMP prefix (failure) function for pattern "abcab". Then simulate the KMP algorithm searching in text "aabcbcbabcabcabc".',
            'Calculați funcția prefix (de eșec) a algoritmului KMP pentru pattern-ul "abcab". Simulați apoi execuția algoritmului KMP pentru căutarea în textul "aabcbcbabcabcabc".',
          )}
        </p>
      </Box>
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part A: Prefix function', 'Partea A: Funcția prefix')}</p>
      <MultipleChoice questions={mc5prefix} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part B: KMP simulation', 'Partea B: Simulare KMP')}</p>
      <MultipleChoice questions={mc5sim} />
      <Toggle
        question={t('Show step-by-step KMP simulation', 'Arată simularea KMP pas cu pas')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Prefix function computation', 'Calculul funcției prefix')}</p>
            <Code>{`Pattern: a  b  c  a  b
Index:   0  1  2  3  4  5
f[i]:   -1  0  0  0  1  2`}</Code>
            <p className="font-bold mt-4 mb-1">{t('Search simulation', 'Simularea căutării')}</p>
            <p className="text-sm mb-2">
              {t(
                'Text: "aabcbcbabcabcabc", Pattern: "abcab"',
                'Text: "aabcbcbabcabcabc", Pattern: "abcab"',
              )}
            </p>
            <Code>{`i=0: T[0]='a' = P[0]='a' ✓, j=1
i=1: T[1]='a' ≠ P[1]='b', j←f[1]=0
i=1: T[1]='a' = P[0]='a' ✓, j=1
i=2: T[2]='b' = P[1]='b' ✓, j=2
i=3: T[3]='c' = P[2]='c' ✓, j=3
i=4: T[4]='b' ≠ P[3]='a', j←f[3]=0
i=4: T[4]='b' ≠ P[0]='a', j←f[0]=-1, j=0
i=5: T[5]='c' ≠ P[0]='a', j←f[0]=-1, j=0
i=6: T[6]='b' ≠ P[0]='a', j←f[0]=-1, j=0
i=7: T[7]='a' = P[0]='a' ✓, j=1
i=8: T[8]='b' = P[1]='b' ✓, j=2
i=9: T[9]='c' = P[2]='c' ✓, j=3
i=10: T[10]='a' = P[3]='a' ✓, j=4
i=11: T[11]='b' = P[4]='b' ✓, j=5 = m → MATCH at position 7`}</Code>
            <Box type="theorem">
              <p className="text-sm">
                {t('Match found at position 7 (0-indexed). T[7..11] = "abcab".',
                  'Potrivire găsită la poziția 7 (indexat de la 0). T[7..11] = "abcab".')}
              </p>
            </Box>
          </div>
        }
      />

      {/* ─── Problem 6 ─── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 6: KMP Mismatch Handling', 'Problema 6: Gestionarea nepotrivirilor în KMP')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'During KMP execution, pattern "ababa" is checked against text "bbabaababa" at position i=2. The first k=3 characters match, but the 4th doesn\'t. What is the next pattern position? How many characters are guaranteed to match at the new alignment?',
            'În timpul execuției KMP, pattern-ul "ababa" este verificat în textul "bbabaababa" la poziția i=2. Primele k=3 caractere se potrivesc, dar al 4-lea nu. Care este următoarea poziție a pattern-ului? Câte caractere se potrivesc sigur la noul deplasament?',
          )}
        </p>
      </Box>
      <Code>{`b b a b a a b a b a   (text)
    | | | /
    a b a b a           (pattern at position 2)`}</Code>
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part A: Next position', 'Partea A: Următoarea poziție')}</p>
      <MultipleChoice questions={mc6next} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part B: Guaranteed matches', 'Partea B: Potriviri garantate')}</p>
      <MultipleChoice questions={mc6count} />

      {/* ─── Problem 7 ─── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 7: Prefix Function — Two While Iterations', 'Problema 7: Funcția prefix — Două iterații while')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Give an example of a string where the while loop in the KMP prefix function computation executes two iterations for a certain character — i.e., the two longest prefix-suffixes of a prefix cannot be extended, but a third one can (non-empty).',
            'Dați un exemplu de șir în care bucla while din calculul funcției prefix a algoritmului KMP execută două iterații pentru un anumit caracter, adică două cele mai lungi prefixe ce sunt și sufixe ale unui prefix nu se pot completa; dar se poate completa un al treilea prefix/sufix care să fie nevid.',
          )}
        </p>
      </Box>
      <MultipleChoice questions={mc7} />
      <Toggle
        question={t('Show detailed trace', 'Arată urmărirea detaliată')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Prefix function for "abaababaab"', 'Funcția prefix pentru "abaababaab"')}</p>
            <Code>{`Index: 0  1  2  3  4  5  6  7  8  9
Char:  a  b  a  a  b  a  b  a  a  b
f[i]: -1  0  0  1  1  2  3  2  3  4`}</Code>
            <p className="text-sm mb-2">
              {t(
                'The two-iteration event happens while computing f[7] (current char P[6] = "b"): we start with j = f[6] = 3, try P[j] = P[3] = "a" ≠ P[6] = "b" → first while iteration falls j to f[3] = 1. Then we try P[1] = "b" = P[6] = "b" ✓ → second while-check exits, the if-branch advances, f[7] = 2 (matches the table). This is the pattern\'s only position where the fall-back chain traverses two links before succeeding.',
                'Evenimentul cu două iterații se produce la calculul lui f[7] (caracterul curent P[6] = "b"): pornim cu j = f[6] = 3, încercăm P[j] = P[3] = "a" ≠ P[6] = "b" → prima iterație while face j = f[3] = 1. Apoi încercăm P[1] = "b" = P[6] = "b" ✓ → a doua verificare while iese, ramura if avansează, f[7] = 2 (corespunde cu tabelul). Este singura poziție din pattern unde lanțul de fall-back parcurge două verigi înainte să reușească.',
              )}
            </p>
            <Box type="warning">
              <p className="text-sm">
                {t(
                  'The key insight: the while loop follows the chain f[k] → f[f[k]] → ... until it finds a prefix-suffix that can be extended by the current character, or reaches -1.',
                  'Ideea cheie: bucla while urmează lanțul f[k] → f[f[k]] → ... până găsește un prefix-sufix care poate fi extins cu caracterul curent, sau ajunge la -1.',
                )}
              </p>
            </Box>
          </div>
        }
      />

      {/* ─── Problem 8 ─── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 8: Complete the Prefix Function', 'Problema 8: Completați funcția prefix')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Complete the prefix function for the following pattern:',
            'Completați funcția prefix pentru următorul pattern:',
          )}
        </p>
      </Box>
      <Code>{`i:    0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26
p[i]: x  y  x  x  y  x  x  y  x  y  x  y  y  x  y  y  x  y  y  x  y  x  y  y  x  y  y
f[i]:-1  0  0  1  ?  ?  ?  ?  ?  ?  ?  ?  ?  ?  ?  ?  ?  ?  ?  ?  ?  ?  ?  ?  ?  ?  ?`}</Code>
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part A: f[4]', 'Partea A: f[4]')}</p>
      <MultipleChoice questions={mc8a} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part B: f[8]', 'Partea B: f[8]')}</p>
      <MultipleChoice questions={mc8b} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part C: f[12]', 'Partea C: f[12]')}</p>
      <MultipleChoice questions={mc8c} />
      <Toggle
        question={t('Show complete prefix function table', 'Arată tabelul complet al funcției prefix')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Full prefix function', 'Funcția prefix completă')}</p>
            <Code>{`i:    0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26
p[i]: x  y  x  x  y  x  x  y  x  y  x  y  y  x  y  y  x  y  y  x  y  x  y  y  x  y  y
f[i]:-1  0  0  1  2  1  2  1  2  3  4  3  4  0  1  0  1  0  1  0  1  2  3  4  0  1  0  1`}</Code>
            <p className="text-sm mb-2">
              {t(
                'Computed step by step using the KMP prefix function algorithm. Each f[i] represents the length of the longest proper prefix of P[0..i-1] that is also a suffix.',
                'Calculat pas cu pas folosind algoritmul funcției prefix KMP. Fiecare f[i] reprezintă lungimea celui mai lung prefix propriu al lui P[0..i-1] care este și sufix.',
              )}
            </p>
          </div>
        }
      />

      {/* ─── Problem 9 ─── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 9: KMP — Find All Occurrences', 'Problema 9: KMP — Găsirea tuturor aparițiilor')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Modify the KMP algorithm from the lecture to find all occurrences of the pattern, not just the first one. Hint: how should the indices be updated after a match?',
            'Modificați algoritmul KMP din curs pentru a găsi toate aparițiile pattern-ului, nu doar prima. Indiciu: cum ar trebui actualizați indicii după o potrivire?',
          )}
        </p>
      </Box>
      <MultipleChoice questions={mc9} />
      <Toggle
        question={t('Show modified KMP pseudocode', 'Arată pseudocodul KMP modificat')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Modified KMP for all occurrences', 'KMP modificat pentru toate aparițiile')}</p>
            <p className="text-sm mb-2">
              {t(
                'The key change: when a full match is found (j = m), instead of stopping, we use the prefix function to determine the next possible alignment and continue searching.',
                'Modificarea cheie: când se găsește o potrivire completă (j = m), în loc să ne oprim, folosim funcția prefix pentru a determina următoarea aliniere posibilă și continuăm căutarea.',
              )}
            </p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm KMP_AllOccurrences(T[1..n], P[1..m])
  Compute prefix function f[0..m]
  i ← 0; j ← 0
  while i < n do
    if T[i] = P[j] then
      i ← i + 1; j ← j + 1
      if j = m then
        output (i − m)       // match found
        j ← f[m]             // use prefix function to continue
    else if j > 0 then
      j ← f[j]               // mismatch: fall back
    else
      i ← i + 1              // mismatch at first character`}</Code>
            <Box type="theorem">
              <p className="text-sm">
                {t(
                  'Complexity remains O(n + m). The prefix function f[m] gives the length of the longest proper prefix of P that is also a suffix, allowing overlapping matches to be found.',
                  'Complexitatea rămâne O(n + m). Funcția prefix f[m] dă lungimea celui mai lung prefix propriu al lui P care este și sufix, permițând găsirea potrivirilor care se suprapun.',
                )}
              </p>
            </Box>
          </div>
        }
      />
    </>
  );
}
