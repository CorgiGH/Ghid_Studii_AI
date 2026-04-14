import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar06() {
  const { t } = useApp();

  /* ─── Problem 1: Rabin-Karp Implementation ─── */
  const mc1 = [
    {
      question: {
        en: 'What is the I/O formalization for implementing the Rabin-Karp algorithm?',
        ro: 'Care este formalizarea I/O pentru implementarea algoritmului Rabin-Karp?',
      },
      options: [
        { text: { en: 'Input: s ∈ Σ*, p ∈ Σ*, q ∈ ℤ⁺; Output: {i ∈ ℕ | s[i..i+|p|−1] = p}', ro: 'Input: s ∈ Σ*, p ∈ Σ*, q ∈ ℤ⁺; Output: {i ∈ ℕ | s[i..i+|p|−1] = p}' }, correct: true },
        { text: { en: 'Input: s ∈ Σ*, p ∈ Σ*; Output: i ∈ ℕ (first occurrence of p in s)', ro: 'Input: s ∈ Σ*, p ∈ Σ*; Output: i ∈ ℕ (prima apariție a lui p în s)' }, correct: false },
        { text: { en: 'Input: s ∈ Σ*, p ∈ Σ*, q ∈ ℤ⁺; Output: hash(p)', ro: 'Input: s ∈ Σ*, p ∈ Σ*, q ∈ ℤ⁺; Output: hash(p)' }, correct: false },
        { text: { en: 'Input: s ∈ Σ*, p ∈ Σ*; Output: true/false (p is substring of s)', ro: 'Input: s ∈ Σ*, p ∈ Σ*; Output: true/false (p este subșir al lui s)' }, correct: false },
      ],
      explanation: {
        en: 'Rabin-Karp takes a text s, pattern p, and a prime q for hashing. It outputs all positions where p occurs in s.',
        ro: 'Rabin-Karp primește un text s, un pattern p și un număr prim q pentru hashing. Returnează toate pozițiile unde p apare în s.',
      },
    },
  ];

  /* ─── Problem 2: Rabin-Karp Hash Computation ─── */
  const mc2hash = [
    {
      question: {
        en: 'Given p = "aba", s = "aabbababbabab", q = 3, d = 3 (alphabet size), what is hash(p) mod q?\nUsing h = (d·h + char) mod q, with a=0, b=1:\nh = ((3·((3·0+0) mod 3)+1) mod 3·3+0) mod 3',
        ro: 'Dat p = "aba", s = "aabbababbabab", q = 3, d = 3 (dimensiunea alfabetului), care este hash(p) mod q?\nFolosind h = (d·h + char) mod q, cu a=0, b=1:\nh = ((3·((3·0+0) mod 3)+1) mod 3·3+0) mod 3',
      },
      options: [
        {
          text: { en: '−1', ro: '−1' },
          correct: false,
          explanation: {
            en: 'Hash values are non-negative (they come from a mod-q operation with q > 0), so −1 is not a valid Rabin-Karp hash.',
            ro: 'Valorile hash sunt nenegative (rezultă din operația mod q cu q > 0), deci −1 nu este o valoare de hash Rabin-Karp validă.',
          },
        },
        { text: { en: '1', ro: '1' }, correct: false },
        { text: { en: '2', ro: '2' }, correct: false },
        {
          text: {
            en: '0 — because hash("aba") = (0·9 + 1·3 + 0·1) mod 3 = 3 mod 3 = 0',
            ro: '0 — deoarece hash("aba") = (0·9 + 1·3 + 0·1) mod 3 = 3 mod 3 = 0',
          },
          correct: true,
        },
      ],
      explanation: {
        en: 'With a=0, b=1, d=3, q=3: hash("aba") = 0·3² + 1·3¹ + 0·3⁰ = 3 mod 3 = 0. Many substrings of s will also hash to 0, causing spurious hits that require character-by-character verification.',
        ro: 'Cu a=0, b=1, d=3, q=3: hash("aba") = 0·3² + 1·3¹ + 0·3⁰ = 3 mod 3 = 0. Multe subșiruri ale lui s vor avea de asemenea hash 0, provocând potriviri false ce necesită verificare caracter cu caracter.',
      },
    },
  ];

  /* ─── Problem 3: Rabin-Karp Worst Case ─── */
  const mc3 = [
    {
      question: {
        en: 'Which of the following inputs cause Rabin-Karp to run in O(n·m) time?',
        ro: 'Care dintre următoarele intrări determină algoritmul Rabin-Karp să ruleze în O(n·m)?',
      },
      options: [
        {
          text: {
            en: 's = "aaa...a" (n times), p = "aaa...a" (m times), q = 1 — every hash matches, every position needs full verification',
            ro: 's = "aaa...a" (de n ori), p = "aaa...a" (de m ori), q = 1 — fiecare hash se potrivește, fiecare poziție necesită verificare completă',
          },
          correct: true,
        },
        {
          text: {
            en: 's = "abcdef...xyz", p = "abc", q = 101 — distinct characters minimize collisions',
            ro: 's = "abcdef...xyz", p = "abc", q = 101 — caractere distincte minimizează coliziunile',
          },
          correct: false,
        },
        {
          text: {
            en: 's = "aaa...a", p = "b", q = 7 — no hash collisions occur',
            ro: 's = "aaa...a", p = "b", q = 7 — nu apar coliziuni de hash',
          },
          correct: false,
        },
        {
          text: {
            en: 'Any input with a large prime q avoids the worst case',
            ro: 'Orice intrare cu un q prim mare evită cazul cel mai defavorabil',
          },
          correct: false,
        },
      ],
      explanation: {
        en: 'The worst case occurs when every hash matches (all spurious hits), forcing O(m) verification at each of the O(n−m+1) positions. Using q=1 means hash ≡ 0 for everything, guaranteeing this scenario.',
        ro: 'Cazul cel mai defavorabil apare când fiecare hash se potrivește (toate potrivirile sunt false), forțând verificare O(m) la fiecare din cele O(n−m+1) poziții. Folosind q=1, hash ≡ 0 pentru orice, garantând acest scenariu.',
      },
    },
  ];

  /* ─── Problem 4: Matrix Search Formalization ─── */
  const mc4 = [
    {
      question: {
        en: 'What is the I/O formalization for searching a matrix P (m₁×m₂) inside a matrix T (n₁×n₂)?',
        ro: 'Care este formalizarea I/O pentru căutarea unei matrici P (m₁×m₂) într-o matrice T (n₁×n₂)?',
      },
      options: [
        { text: { en: 'Input: T ∈ Σⁿ¹ˣⁿ², P ∈ Σᵐ¹ˣᵐ²; Output: {(i,j) | T[i..i+m₁−1][j..j+m₂−1] = P}', ro: 'Input: T ∈ Σⁿ¹ˣⁿ², P ∈ Σᵐ¹ˣᵐ²; Output: {(i,j) | T[i..i+m₁−1][j..j+m₂−1] = P}' }, correct: true },
        { text: { en: 'Input: T ∈ Σⁿ¹ˣⁿ², P ∈ Σᵐ¹ˣᵐ²; Output: true/false', ro: 'Input: T ∈ Σⁿ¹ˣⁿ², P ∈ Σᵐ¹ˣᵐ²; Output: true/false' }, correct: false },
        { text: { en: 'Input: T ∈ Σⁿˣⁿ, P ∈ Σᵐˣᵐ; Output: count of occurrences', ro: 'Input: T ∈ Σⁿˣⁿ, P ∈ Σᵐˣᵐ; Output: numărul de apariții' }, correct: false },
        { text: { en: 'Input: T ∈ Σ*, P ∈ Σ*; Output: {(i,j) | T[i][j] = P[0][0]}', ro: 'Input: T ∈ Σ*, P ∈ Σ*; Output: {(i,j) | T[i][j] = P[0][0]}' }, correct: false },
      ],
      explanation: {
        en: 'We search for all top-left corners (i,j) where the m₁×m₂ submatrix of T starting at (i,j) equals P. The matrices need not be square.',
        ro: 'Căutăm toate colțurile stânga-sus (i,j) unde submatricea m₁×m₂ a lui T începând de la (i,j) este egală cu P. Matricele nu trebuie să fie pătrate.',
      },
    },
  ];

  /* ─── Problem 5: Naive Matrix Search Complexity ─── */
  const mc5 = [
    {
      question: {
        en: 'What is the complexity of the naive algorithm for searching matrix P (m₁×m₂) in T (n₁×n₂)?',
        ro: 'Care este complexitatea algoritmului naiv pentru căutarea matricii P (m₁×m₂) în T (n₁×n₂)?',
      },
      options: [
        { text: { en: 'O(n₁·n₂·m₁·m₂)', ro: 'O(n₁·n₂·m₁·m₂)' }, correct: true },
        { text: { en: 'O((n₁−m₁)·(n₂−m₂)·m₁·m₂)', ro: 'O((n₁−m₁)·(n₂−m₂)·m₁·m₂)' }, correct: false },
        { text: { en: 'O(n₁·n₂ + m₁·m₂)', ro: 'O(n₁·n₂ + m₁·m₂)' }, correct: false },
        { text: { en: 'O(n₁²·m₁²)', ro: 'O(n₁²·m₁²)' }, correct: false },
      ],
      explanation: {
        en: 'For each of the O(n₁·n₂) possible positions, we compare all m₁·m₂ elements. The precise count is (n₁−m₁+1)·(n₂−m₂+1)·m₁·m₂, which is O(n₁·n₂·m₁·m₂).',
        ro: 'Pentru fiecare din cele O(n₁·n₂) poziții posibile, comparăm toate cele m₁·m₂ elemente. Numărul exact este (n₁−m₁+1)·(n₂−m₂+1)·m₁·m₂, adică O(n₁·n₂·m₁·m₂).',
      },
    },
  ];

  /* ─── Problem 6: Rabin-Karp for Matrix Search ─── */
  const mc6hash = [
    {
      question: {
        en: 'For 2D Rabin-Karp, which hash function strategy is appropriate?',
        ro: 'Pentru Rabin-Karp 2D, care strategie de funcție hash este potrivită?',
      },
      options: [
        {
          text: {
            en: 'Hash each column of the m₁×m₂ window, then combine column hashes into a row hash — allows rolling updates in both directions',
            ro: 'Hash-uiește fiecare coloană a ferestrei m₁×m₂, apoi combină hash-urile coloanelor într-un hash de rând — permite actualizări rolling în ambele direcții',
          },
          correct: true,
        },
        {
          text: {
            en: 'Flatten the matrix to a 1D string and apply standard Rabin-Karp',
            ro: 'Aplatizează matricea într-un șir 1D și aplică Rabin-Karp standard',
          },
          correct: false,
        },
        {
          text: {
            en: 'Hash each row independently and compare row-by-row',
            ro: 'Hash-uiește fiecare rând independent și compară rând cu rând',
          },
          correct: false,
        },
        {
          text: {
            en: 'Use a single hash over all m₁·m₂ elements without structure',
            ro: 'Folosește un singur hash peste toate cele m₁·m₂ elemente fără structură',
          },
          correct: false,
        },
      ],
      explanation: {
        en: 'The key insight is to use a two-level rolling hash: first hash each column segment of height m₁, then combine m₂ column hashes into a row hash. When sliding right, update one column hash (remove leftmost, add rightmost). When sliding down, update all column hashes.',
        ro: 'Ideea cheie este folosirea unui hash rolling pe două niveluri: mai întâi hash-uiește fiecare segment de coloană de înălțime m₁, apoi combină m₂ hash-uri de coloană într-un hash de rând. La deplasare spre dreapta, actualizezi un hash de coloană. La deplasare în jos, actualizezi toate hash-urile de coloană.',
      },
    },
  ];

  const mc6complexity = [
    {
      question: {
        en: 'What is the expected complexity of 2D Rabin-Karp (assuming few spurious hits)?',
        ro: 'Care este complexitatea așteptată a Rabin-Karp 2D (presupunând puține potriviri false)?',
      },
      options: [
        { text: { en: 'O(n₁·n₂)', ro: 'O(n₁·n₂)' }, correct: true },
        { text: { en: 'O(n₁·n₂·m₁)', ro: 'O(n₁·n₂·m₁)' }, correct: false },
        { text: { en: 'O(n₁·n₂·m₂)', ro: 'O(n₁·n₂·m₂)' }, correct: false },
        { text: { en: 'O(n₁·n₂·m₁·m₂)', ro: 'O(n₁·n₂·m₁·m₂)' }, correct: false },
      ],
      explanation: {
        en: 'With a good hash function and few collisions, each position is processed in O(1) amortized time (rolling hash update), giving O(n₁·n₂) expected time. Preprocessing column hashes takes O(n₁·n₂) as well.',
        ro: 'Cu o funcție hash bună și puține coliziuni, fiecare poziție este procesată în O(1) amortizat (actualizare rolling hash), rezultând O(n₁·n₂) timp așteptat. Preprocesarea hash-urilor de coloană necesită de asemenea O(n₁·n₂).',
      },
    },
  ];

  /* ─── Problem 7: Longest Substring Appearing K Times ─── */
  const mc7 = [
    {
      question: {
        en: 'What approach efficiently finds the longest substring appearing at least K times in a string of length N?',
        ro: 'Ce abordare găsește eficient cel mai lung subșir care apare de cel puțin K ori într-un șir de lungime N?',
      },
      options: [
        {
          text: {
            en: 'Binary search on length L + Rabin-Karp hashing to check if any substring of length L appears ≥ K times',
            ro: 'Căutare binară pe lungimea L + hashing Rabin-Karp pentru a verifica dacă vreun subșir de lungime L apare ≥ K ori',
          },
          correct: true,
        },
        {
          text: {
            en: 'Check all O(N²) substrings and count occurrences with a hash map — O(N³)',
            ro: 'Verifică toate cele O(N²) subșiruri și numără aparițiile cu un hash map — O(N³)',
          },
          correct: false,
        },
        {
          text: {
            en: 'Use KMP for each possible substring length — O(N³)',
            ro: 'Folosește KMP pentru fiecare lungime posibilă de subșir — O(N³)',
          },
          correct: false,
        },
        {
          text: {
            en: 'Sort all substrings lexicographically and scan — O(N² log N)',
            ro: 'Sortează toate subșirurile lexicografic și scanează — O(N² log N)',
          },
          correct: false,
        },
      ],
      explanation: {
        en: 'Binary search works because if a substring of length L appears K times, so does one of length L−1. For each candidate length, use Rabin-Karp rolling hash to collect all substring hashes in O(N), then check if any hash appears ≥ K times. Total: O(N log N) expected.',
        ro: 'Căutarea binară funcționează deoarece dacă un subșir de lungime L apare de K ori, la fel și unul de lungime L−1. Pentru fiecare lungime candidat, folosim rolling hash Rabin-Karp pentru a colecta toate hash-urile subșirurilor în O(N), apoi verificăm dacă vreun hash apare ≥ K ori. Total: O(N log N) așteptat.',
      },
    },
  ];

  /* ─── Problem 8: Minimum Characters to Make Palindrome ─── */
  const mc8 = [
    {
      question: {
        en: 'Given s = "acecaxy", what is the minimum number of characters to prepend to make it a palindrome?',
        ro: 'Dat s = "acecaxy", care este numărul minim de caractere care trebuie adăugate la început pentru a deveni palindrom?',
      },
      options: [
        { text: { en: '2', ro: '2' }, correct: true },
        { text: { en: '3', ro: '3' }, correct: false },
        { text: { en: '1', ro: '1' }, correct: false },
        { text: { en: '4', ro: '4' }, correct: false },
      ],
      explanation: {
        en: 'We need to prepend "yx" → "yxacecaxy" which is a palindrome. The key insight: find the longest prefix of s that is a palindrome. Here "aceca" (length 5) is a palindromic prefix, so we prepend the reverse of the remaining suffix "xy" → "yx". Answer: 7 − 5 = 2.',
        ro: 'Trebuie să adăugăm "yx" → "yxacecaxy" care este palindrom. Ideea cheie: găsim cel mai lung prefix al lui s care este palindrom. Aici "aceca" (lungime 5) este un prefix palindromic, deci adăugăm inversul sufixului rămas "xy" → "yx". Răspuns: 7 − 5 = 2.',
      },
    },
  ];

  const mc8method = [
    {
      question: {
        en: 'Which algorithm efficiently solves "minimum characters to prepend for palindrome"?',
        ro: 'Care algoritm rezolvă eficient "numărul minim de caractere de adăugat la început pentru palindrom"?',
      },
      options: [
        {
          text: {
            en: 'Concatenate s + "$" + reverse(s), compute KMP failure function — the last value gives the longest palindromic prefix length',
            ro: 'Concatenează s + "$" + reverse(s), calculează funcția de eșec KMP — ultima valoare dă lungimea celui mai lung prefix palindromic',
          },
          correct: true,
        },
        {
          text: {
            en: 'Use dynamic programming on all substrings — O(n²)',
            ro: 'Folosește programare dinamică pe toate subșirurile — O(n²)',
          },
          correct: false,
        },
        {
          text: {
            en: 'Reverse the string and use Rabin-Karp to find matching prefixes',
            ro: 'Inversează șirul și folosește Rabin-Karp pentru a găsi prefixe potrivite',
          },
          correct: false,
        },
        {
          text: {
            en: 'Check all prefixes one by one — O(n²)',
            ro: 'Verifică toate prefixele unul câte unul — O(n²)',
          },
          correct: false,
        },
      ],
      explanation: {
        en: 'Build t = s + "$" + reverse(s). The KMP failure function value at the last position of t gives the length of the longest prefix of s that is also a suffix of reverse(s) — i.e., the longest palindromic prefix. Answer = n − f[len(t)−1]. This runs in O(n).',
        ro: 'Construim t = s + "$" + reverse(s). Valoarea funcției de eșec KMP la ultima poziție a lui t dă lungimea celui mai lung prefix al lui s care este și sufix al lui reverse(s) — adică cel mai lung prefix palindromic. Răspuns = n − f[len(t)−1]. Rulează în O(n).',
      },
    },
  ];

  /* ─── Problem 9: Longest Palindromic Substring ─── */
  const mc9 = [
    {
      question: {
        en: 'Which approach efficiently finds the longest palindromic substring?',
        ro: 'Care abordare găsește eficient cel mai lung subșir palindromic?',
      },
      options: [
        {
          text: {
            en: "Manacher's algorithm — O(n) time using palindrome radius expansion",
            ro: 'Algoritmul lui Manacher — O(n) timp folosind expansiunea razei palindromului',
          },
          correct: true,
        },
        {
          text: {
            en: 'Expand around each center — O(n²) worst case',
            ro: 'Expandare în jurul fiecărui centru — O(n²) caz defavorabil',
          },
          correct: false,
        },
        {
          text: {
            en: 'Dynamic programming on all pairs (i,j) — O(n²) time and space',
            ro: 'Programare dinamică pe toate perechile (i,j) — O(n²) timp și spațiu',
          },
          correct: false,
        },
        {
          text: {
            en: 'Reverse string + LCS — O(n²)',
            ro: 'Inversare șir + LCS — O(n²)',
          },
          correct: false,
        },
      ],
      explanation: {
        en: "Manacher's algorithm processes each position once using previously computed palindrome radii. It maintains a rightmost palindrome boundary and mirrors known radii, achieving O(n). The expand-around-center approach is simpler but O(n²).",
        ro: 'Algoritmul lui Manacher procesează fiecare poziție o dată folosind raze de palindrom calculate anterior. Menține o frontieră dreaptă a palindromului și oglindește razele cunoscute, obținând O(n). Abordarea expandării în jurul centrului este mai simplă dar O(n²).',
      },
    },
  ];

  /* ─── Problem 10: Java hashCode Collisions ─── */
  const mc10 = [
    {
      question: {
        en: 'How can we generate 2ᴺ strings of length 2N that all have the same Java .hashCode()?\nhashCode: hash = (hash * 31) + charAt(i)',
        ro: 'Cum putem genera 2ᴺ șiruri de lungime 2N care au toate același .hashCode() în Java?\nhashCode: hash = (hash * 31) + charAt(i)',
      },
      options: [
        {
          text: {
            en: 'Find two 2-char strings with equal hashCode (e.g., "Aa"=2112, "BB"=2112), then form all 2ᴺ combinations of length 2N by concatenating N such pairs',
            ro: 'Găsim două șiruri de 2 caractere cu hashCode egal (ex: "Aa"=2112, "BB"=2112), apoi formăm toate cele 2ᴺ combinații de lungime 2N concatenând N astfel de perechi',
          },
          correct: true,
        },
        {
          text: {
            en: 'Use brute force to enumerate all strings of length 2N — O(|Σ|²ᴺ)',
            ro: 'Folosim forță brută pentru a enumera toate șirurile de lungime 2N — O(|Σ|²ᴺ)',
          },
          correct: false,
        },
        {
          text: {
            en: 'Generate random strings and filter by hashCode — probabilistic approach',
            ro: 'Generăm șiruri aleatorii și filtrăm după hashCode — abordare probabilistică',
          },
          correct: false,
        },
        {
          text: {
            en: 'This is impossible due to the properties of polynomial hashing',
            ro: 'Acest lucru este imposibil datorită proprietăților hashing-ului polinomial',
          },
          correct: false,
        },
      ],
      explanation: {
        en: 'Key insight: if hash("Aa") = hash("BB") = 2112, then hash("Aa"+"Aa") = hash("Aa"+"BB") = hash("BB"+"Aa") = hash("BB"+"BB"), because hash(xy) = hash(x)·31² + hash(y). This gives 2ᴺ strings from N positions, each choosing "Aa" or "BB". ASCII: A=65, a=97, B=66 → "Aa" = 65·31+97 = 2112, "BB" = 66·31+66 = 2112.',
        ro: 'Ideea cheie: dacă hash("Aa") = hash("BB") = 2112, atunci hash("Aa"+"Aa") = hash("Aa"+"BB") = hash("BB"+"Aa") = hash("BB"+"BB"), deoarece hash(xy) = hash(x)·31² + hash(y). Obținem 2ᴺ șiruri din N poziții, fiecare alegând "Aa" sau "BB". ASCII: A=65, a=97, B=66 → "Aa" = 65·31+97 = 2112, "BB" = 66·31+66 = 2112.',
      },
    },
  ];

  /* ─── Problem 11: String Rotation ─── */
  const mc11 = [
    {
      question: {
        en: 'How do you reduce the string rotation problem to string searching?\nInput: s, t of length n. Output: "yes" if s is a rotation of t.',
        ro: 'Cum reduci problema rotației de șiruri la problema căutării?\nInput: s, t de lungime n. Output: "da" dacă s este o rotație a lui t.',
      },
      options: [
        {
          text: {
            en: 'Search for s in t+t — s is a rotation of t iff s appears as a substring of t+t',
            ro: 'Caută s în t+t — s este o rotație a lui t dacă și numai dacă s apare ca subșir în t+t',
          },
          correct: true,
        },
        {
          text: {
            en: 'Sort both strings and compare — if they match, s is a rotation',
            ro: 'Sortează ambele șiruri și compară — dacă se potrivesc, s este o rotație',
          },
          correct: false,
        },
        {
          text: {
            en: 'Try all n rotations of t and compare with s — O(n²)',
            ro: 'Încearcă toate cele n rotații ale lui t și compară cu s — O(n²)',
          },
          correct: false,
        },
        {
          text: {
            en: 'Compare hash(s) with hash(t) — if equal, they are rotations',
            ro: 'Compară hash(s) cu hash(t) — dacă sunt egale, sunt rotații',
          },
          correct: false,
        },
      ],
      explanation: {
        en: 'If t = "BAAB", then t+t = "BAABBAAB". Any rotation of t is a substring of t+t. So search for s = "ABBA" in "BAABBAAB" — found at position 2 (characters at indices 2..5 = A,B,B,A)! Using KMP or Rabin-Karp, this runs in O(n).',
        ro: 'Dacă t = "BAAB", atunci t+t = "BAABBAAB". Orice rotație a lui t este un subșir al lui t+t. Deci căutăm s = "ABBA" în "BAABBAAB" — găsit la poziția 2 (caracterele la indecșii 2..5 = A,B,B,A)! Folosind KMP sau Rabin-Karp, rulează în O(n).',
      },
    },
  ];

  /* ─── Problem 12: Anagram Search ─── */
  const mc12 = [
    {
      question: {
        en: 'How do you efficiently find all anagrams of pattern p in string s?',
        ro: 'Cum găsești eficient toate anagramele pattern-ului p în șirul s?',
      },
      options: [
        {
          text: {
            en: 'Sliding window of size |p| over s, maintaining a character frequency count — update in O(1) per step, total O(n)',
            ro: 'Fereastră glisantă de dimensiune |p| peste s, menținând un contor de frecvență a caracterelor — actualizare în O(1) per pas, total O(n)',
          },
          correct: true,
        },
        {
          text: {
            en: 'Sort p, then sort each substring of length |p| in s and compare — O(n·m·log m)',
            ro: 'Sortează p, apoi sortează fiecare subșir de lungime |p| din s și compară — O(n·m·log m)',
          },
          correct: false,
        },
        {
          text: {
            en: 'Use Rabin-Karp where the hash function is the sum of character codes',
            ro: 'Folosește Rabin-Karp unde funcția hash este suma codurilor caracterelor',
          },
          correct: false,
        },
        {
          text: {
            en: 'Generate all permutations of p and search each — O(m!·n)',
            ro: 'Generează toate permutările lui p și caută fiecare — O(m!·n)',
          },
          correct: false,
        },
      ],
      explanation: {
        en: 'Maintain a frequency array for the current window. When sliding right: increment count of new char, decrement count of removed char. If the frequency array matches p\'s frequency array, we found an anagram. With a fixed alphabet, comparison is O(1). Example: p="aba", s="baab" → anagrams at positions 0 ("baa") and 1 ("aab").',
        ro: 'Menținem un vector de frecvență pentru fereastra curentă. La deplasare spre dreapta: incrementăm contorul noului caracter, decrementăm contorul caracterului eliminat. Dacă vectorul de frecvență se potrivește cu cel al lui p, am găsit o anagramă. Cu alfabet fix, compararea este O(1). Exemplu: p="aba", s="baab" → anagrame la pozițiile 0 ("baa") și 1 ("aab").',
      },
    },
  ];

  /* ─── Problem 13: Boyer-Moore Minimum Comparisons ─── */
  const mc13 = [
    {
      question: {
        en: 'For a binary alphabet, which scenario gives Boyer-Moore the minimum number of comparisons?',
        ro: 'Pentru un alfabet binar, care scenariu oferă Boyer-Moore numărul minim de comparații?',
      },
      options: [
        {
          text: {
            en: 'Pattern = "1...1" (all 1s), Text = "0...0" (all 0s) — each alignment fails on the first comparison, shifts by m, giving ≈ n/m comparisons',
            ro: 'Pattern = "1...1" (doar 1), Text = "0...0" (doar 0) — fiecare aliniere eșuează la prima comparație, deplasare cu m, dând ≈ n/m comparații',
          },
          correct: true,
        },
        {
          text: {
            en: 'Pattern = "01", Text = "010101..." — alternating characters',
            ro: 'Pattern = "01", Text = "010101..." — caractere alternante',
          },
          correct: false,
        },
        {
          text: {
            en: 'Pattern = Text — always matches, no wasted comparisons',
            ro: 'Pattern = Text — se potrivește mereu, fără comparații irosite',
          },
          correct: false,
        },
        {
          text: {
            en: 'Any case with short patterns — minimum is always O(n)',
            ro: 'Orice caz cu pattern-uri scurte — minimul este mereu O(n)',
          },
          correct: false,
        },
      ],
      explanation: {
        en: 'Boyer-Moore achieves its best case when the bad character rule gives maximum shifts. With pattern all-1s and text all-0s, the rightmost character of the pattern (1) mismatches the text character (0), and since 0 doesn\'t appear in the pattern, we shift by m. This gives ⌈n/m⌉ comparisons — sublinear in n!',
        ro: 'Boyer-Moore atinge cazul cel mai bun când regula caracterului rău dă deplasări maxime. Cu pattern doar-1 și text doar-0, ultimul caracter al pattern-ului (1) nu se potrivește cu caracterul din text (0), și deoarece 0 nu apare în pattern, deplasăm cu m. Aceasta dă ⌈n/m⌉ comparații — subliniar în n!',
      },
    },
  ];

  /* ─── Problem 14: Boyer-Moore Comparisons in Binary Text ─── */
  const mc14a = [
    {
      question: {
        en: 'How many comparisons does Boyer-Moore make searching for "00001" in 1000 zeros?',
        ro: 'Câte comparații face Boyer-Moore căutând "00001" într-un text de 1000 de zerouri?',
      },
      options: [
        {
          text: {
            en: '996 — each alignment: last char "1" vs "0" mismatches, bad character shifts by 1 (since "0" is in pattern at pos 3), yielding 996 single comparisons',
            ro: '996 — fiecare aliniere: ultimul caracter "1" vs "0" nu se potrivește, deplasare cu 1 (deoarece "0" e în pattern la poz. 3), rezultând 996 comparații simple',
          },
          correct: true,
        },
        { text: { en: '200', ro: '200' }, correct: false },
        { text: { en: '1000', ro: '1000' }, correct: false },
        { text: { en: '4980', ro: '4980' }, correct: false },
      ],
      explanation: {
        en: 'Pattern "00001": last char is "1", text is all "0"s. At each position, we compare P[4]="1" with T[i]="0" — mismatch. Bad character rule: "0" last occurs at P[3], so shift = max(1, 4−3) = 1. We make 1 comparison per position, for 996 positions (1000−5+1).',
        ro: 'Pattern "00001": ultimul caracter este "1", textul este doar "0". La fiecare poziție, comparăm P[4]="1" cu T[i]="0" — nepotrivire. Regula caracterului rău: "0" apare ultima dată la P[3], deci deplasare = max(1, 4−3) = 1. Facem 1 comparație per poziție, pentru 996 poziții (1000−5+1).',
      },
    },
  ];

  const mc14b = [
    {
      question: {
        en: 'How many comparisons does Boyer-Moore make searching for "10000" in 1000 zeros?',
        ro: 'Câte comparații face Boyer-Moore căutând "10000" într-un text de 1000 de zerouri?',
      },
      options: [
        {
          text: {
            en: '≈ 4·996 = 3984 — miscounts the comparisons: only the 4 matching chars are counted, ignoring that the mismatch itself is also a comparison',
            ro: '≈ 4·996 = 3984 — numără greșit comparațiile: sunt numărate doar cele 4 caractere potrivite, ignorând faptul că și nepotrivirea este o comparație',
          },
          correct: false,
          explanation: {
            en: 'Incorrect: the mismatch at P[0] vs T[j] still counts as a comparison. It\'s 5 comparisons per alignment, not 4.',
            ro: 'Incorect: nepotrivirea la P[0] vs T[j] se numără tot ca o comparație. Sunt 5 comparații per aliniere, nu 4.',
          },
        },
        { text: { en: '996', ro: '996' }, correct: false },
        { text: { en: '200', ro: '200' }, correct: false },
        {
          text: {
            en: '≈ 5·996 = 4980 — at each alignment, chars 4,3,2,1 match ("0"s) and char 0 mismatches ("1" vs "0"), totaling 5 comparisons; then bad-character shifts by 1',
            ro: '≈ 5·996 = 4980 — la fiecare aliniere, caracterele 4,3,2,1 se potrivesc ("0") și caracterul 0 nu se potrivește ("1" vs "0"), rezultând 5 comparații; apoi deplasare cu 1',
          },
          correct: true,
        },
      ],
      explanation: {
        en: 'Pattern "10000": starting from the right, P[4]="0", P[3]="0", P[2]="0", P[1]="0" all match the text\'s zeros (4 comparisons). Then P[0]="1" mismatches T[j]="0" — that is a 5th comparison. Bad character: "0" last occurs at P[4], but we\'re at P[0], so shift by 1. That\'s 5 comparisons per alignment × 996 alignments = 4980.',
        ro: 'Pattern "10000": de la dreapta, P[4]="0", P[3]="0", P[2]="0", P[1]="0" se potrivesc toate cu zerourile din text (4 comparații). Apoi P[0]="1" nu se potrivește cu T[j]="0" — aceasta este a 5-a comparație. Regula caracterului rău: "0" apare ultima dată la P[4], dar suntem la P[0], deci deplasare cu 1. Rezultă 5 comparații per aliniere × 996 alinieri = 4980.',
      },
    },
  ];

  const mc14c = [
    {
      question: {
        en: 'How many comparisons does Boyer-Moore make searching for "01010" in 1000 zeros?',
        ro: 'Câte comparații face Boyer-Moore căutând "01010" într-un text de 1000 de zerouri?',
      },
      options: [
        {
          text: {
            en: '≈ 498 — P[4]="0" matches, P[3]="1" mismatches, good-suffix shift of 4 (pattern realigns so P[0]="0" meets a previously-matched "0"), giving ~2 comparisons per 4 text positions → ≈ 996/2 = 498',
            ro: '≈ 498 — P[4]="0" se potrivește, P[3]="1" nu se potrivește, deplasare de sufix bun cu 4 (pattern-ul se realiniază astfel încât P[0]="0" se potrivește cu un "0" deja confirmat), dând ~2 comparații la fiecare 4 poziții din text → ≈ 996/2 = 498',
          },
          correct: true,
        },
        { text: { en: '996', ro: '996' }, correct: false },
        { text: { en: '200', ro: '200' }, correct: false },
        { text: { en: '1992', ro: '1992' }, correct: false },
      ],
      explanation: {
        en: 'Pattern "01010": compare from right — P[4]="0" matches T[i+4]="0", then P[3]="1" mismatches T[i+3]="0" (≈ 2 comparisons per alignment). Bad character gives shift 1, but the good suffix rule aligns the matched "0" with the leftmost "0" at P[0] (the preceding-char condition holds by convention since no char precedes P[0]), giving shift 4. With ~996/4 ≈ 249 alignments × 2 comparisons each ≈ 498 total. Without good-suffix (shift 1 only) the count jumps to ~1992.',
        ro: 'Pattern "01010": comparare de la dreapta — P[4]="0" se potrivește cu T[i+4]="0", apoi P[3]="1" nu se potrivește cu T[i+3]="0" (≈ 2 comparații per aliniere). Caracterul rău dă deplasare 1, dar regula sufixului bun aliniază "0"-ul potrivit cu "0" de la P[0] (condiția caracterului precedent se verifică prin convenție pentru că nu există caracter înainte de P[0]), dând deplasare 4. Cu ~996/4 ≈ 249 alinieri × 2 comparații fiecare ≈ 498 total. Fără sufixul bun (doar deplasare 1), numărul ar urca la ~1992.',
      },
    },
  ];

  /* ─── Problem 15: Repeated Substring Pattern ─── */
  const mc15 = [
    {
      question: {
        en: 'How do you determine if T of length N is of the form pⁿ (a substring repeated 2+ times)?',
        ro: 'Cum determini dacă T de lungime N este de forma pⁿ (un subșir repetat de 2+ ori)?',
      },
      options: [
        {
          text: {
            en: 'Compute KMP failure function f[]. T = pⁿ iff (N − f[N−1]) divides N and f[N−1] > 0. The period is N − f[N−1].',
            ro: 'Calculează funcția de eșec KMP f[]. T = pⁿ dacă și numai dacă (N − f[N−1]) divide N și f[N−1] > 0. Perioada este N − f[N−1].',
          },
          correct: true,
        },
        {
          text: {
            en: 'Try all divisors d of N: check if T[0..d−1] repeated N/d times equals T — O(N·d(N))',
            ro: 'Încearcă toți divizorii d ai lui N: verifică dacă T[0..d−1] repetat de N/d ori este egal cu T — O(N·d(N))',
          },
          correct: false,
        },
        {
          text: {
            en: 'Search for T in T+T; if found at position ≠ 0, then T is periodic',
            ro: 'Caută T în T+T; dacă e găsit la poziție ≠ 0, atunci T este periodic',
          },
          correct: false,
        },
        {
          text: {
            en: 'Reverse T and check if T = reverse(T) — only works for palindromes',
            ro: 'Inversează T și verifică dacă T = reverse(T) — funcționează doar pentru palindroame',
          },
          correct: false,
        },
      ],
      explanation: {
        en: 'The KMP failure function f[N−1] gives the length of the longest proper prefix that is also a suffix. If the "period" p = N − f[N−1] divides N, then T consists of the pattern T[0..p−1] repeated N/p times. This runs in O(N). Note: the T+T trick also works — T is periodic iff it appears in T+T at a position other than 0 and N.',
        ro: 'Funcția de eșec KMP f[N−1] dă lungimea celui mai lung prefix propriu care este și sufix. Dacă "perioada" p = N − f[N−1] divide N, atunci T constă din pattern-ul T[0..p−1] repetat de N/p ori. Rulează în O(N). Notă: trucul T+T funcționează de asemenea — T este periodic dacă și numai dacă apare în T+T la o poziție diferită de 0 și N.',
      },
    },
  ];

  /* ─── Problem 16: Subsequence Check ─── */
  const mc16 = [
    {
      question: {
        en: 'What is the I/O formalization for checking if s is a subsequence of S?',
        ro: 'Care este formalizarea I/O pentru verificarea dacă s este o subsecvență a lui S?',
      },
      options: [
        { text: { en: 'Input: s ∈ Σ*, S ∈ Σ*; Output: true iff s is a subsequence of S (can be obtained by deleting characters from S)', ro: 'Input: s ∈ Σ*, S ∈ Σ*; Output: true dacă s este o subsecvență a lui S (poate fi obținută prin ștergerea de caractere din S)' }, correct: true },
        { text: { en: 'Input: s ∈ Σ*, S ∈ Σ*; Output: true iff s is a substring of S', ro: 'Input: s ∈ Σ*, S ∈ Σ*; Output: true dacă s este un subșir al lui S' }, correct: false },
        { text: { en: 'Input: s ∈ Σ*, S ∈ Σ*; Output: positions of s in S', ro: 'Input: s ∈ Σ*, S ∈ Σ*; Output: pozițiile lui s în S' }, correct: false },
        { text: { en: 'Input: s ∈ Σ*, S ∈ Σ*; Output: longest common subsequence', ro: 'Input: s ∈ Σ*, S ∈ Σ*; Output: cea mai lungă subsecvență comună' }, correct: false },
      ],
      explanation: {
        en: 'A subsequence preserves order but not contiguity: "abcd" is a subsequence of "cdaaacbbacccda" because we can pick a(4), b(6), c(9), d(12). This is different from a substring which must be contiguous.',
        ro: 'O subsecvență păstrează ordinea dar nu contiguitatea: "abcd" este o subsecvență a "cdaaacbbacccda" deoarece putem alege a(4), b(6), c(9), d(12). Aceasta diferă de un subșir care trebuie să fie contiguu.',
      },
    },
  ];

  const mc16algo = [
    {
      question: {
        en: 'What is the optimal algorithm for checking if s (length n) is a subsequence of S (length m)?',
        ro: 'Care este algoritmul optim pentru verificarea dacă s (lungime n) este o subsecvență a lui S (lungime m)?',
      },
      options: [
        {
          text: {
            en: 'Two-pointer greedy: scan S with pointer j, advance pointer i in s when S[j]=s[i]. O(n+m)',
            ro: 'Greedy cu doi pointeri: scanează S cu pointerul j, avansează pointerul i în s când S[j]=s[i]. O(n+m)',
          },
          correct: true,
        },
        {
          text: {
            en: 'Dynamic programming on both strings — O(n·m)',
            ro: 'Programare dinamică pe ambele șiruri — O(n·m)',
          },
          correct: false,
        },
        {
          text: {
            en: 'Use KMP to find s in S — O(n+m) but solves substring not subsequence',
            ro: 'Folosește KMP pentru a găsi s în S — O(n+m) dar rezolvă subșir nu subsecvență',
          },
          correct: false,
        },
        {
          text: {
            en: 'Binary search for each character of s in S — O(n·log m)',
            ro: 'Căutare binară pentru fiecare caracter al lui s în S — O(n·log m)',
          },
          correct: false,
        },
      ],
      explanation: {
        en: 'The greedy two-pointer approach: i=0, j=0. While i<n and j<m: if s[i]==S[j] then i++. Always j++. At the end, s is a subsequence iff i==n. This is optimal at O(n+m).',
        ro: 'Abordarea greedy cu doi pointeri: i=0, j=0. Cât timp i<n și j<m: dacă s[i]==S[j] atunci i++. Întotdeauna j++. La final, s este o subsecvență dacă și numai dacă i==n. Este optim la O(n+m).',
      },
    },
  ];

  /* ─── Problem 17: Boyer-Moore BC/GS Tables ─── */
  const mc17type = [
    {
      question: {
        en: 'In Boyer-Moore, what do the BC (Bad Character) and GS (Good Suffix) tables store?',
        ro: 'În Boyer-Moore, ce stochează tabelele BC (Bad Character) și GS (Good Suffix)?',
      },
      options: [
        {
          text: {
            en: 'BC[c] = rightmost position of character c in pattern (or −1). GS[i] = shift when mismatch at position i after matching suffix P[i+1..m−1].',
            ro: 'BC[c] = cea mai din dreapta poziție a caracterului c în pattern (sau −1). GS[i] = deplasarea când apare nepotrivire la poziția i după potrivirea sufixului P[i+1..m−1].',
          },
          correct: true,
        },
        {
          text: {
            en: 'BC[i] = first position of P[i] from the left. GS[i] = length of longest suffix starting at i.',
            ro: 'BC[i] = prima poziție a lui P[i] de la stânga. GS[i] = lungimea celui mai lung sufix începând la i.',
          },
          correct: false,
        },
        {
          text: {
            en: 'BC and GS both store shift amounts based only on the text characters',
            ro: 'BC și GS stochează ambele cantități de deplasare bazate doar pe caracterele textului',
          },
          correct: false,
        },
        {
          text: {
            en: 'BC[c] = number of times c appears in pattern. GS[i] = KMP failure function at i.',
            ro: 'BC[c] = numărul de apariții ale lui c în pattern. GS[i] = funcția de eșec KMP la i.',
          },
          correct: false,
        },
      ],
      explanation: {
        en: 'The Bad Character table maps each alphabet character to its rightmost occurrence in the pattern (used to align the mismatched text character with its occurrence in the pattern). The Good Suffix table is precomputed from the pattern and determines shifts based on the matched suffix.',
        ro: 'Tabela Bad Character mapează fiecare caracter din alfabet la cea mai din dreapta apariție a sa în pattern (folosită pentru a alinia caracterul nepotrivit din text cu apariția sa în pattern). Tabela Good Suffix este precalculată din pattern și determină deplasări bazate pe sufixul potrivit.',
      },
    },
  ];

  /* ─── Problem 19: Boyer-Moore Prefix Function ─── */
  const mc19 = [
    {
      question: {
        en: 'Given pattern P with |P|=m > 5, and prefix function f[m] = 5. The vector h[] is the mirror of g[] (prefix function for R = reverse of P). What is h[0]?',
        ro: 'Dat pattern-ul P cu |P|=m > 5, și funcția prefix f[m] = 5. Vectorul h[] este oglindirea lui g[] (funcția prefix pentru R = inversul lui P). Cât este h[0]?',
      },
      options: [
        { text: { en: '5', ro: '5' }, correct: true },
        { text: { en: '0', ro: '0' }, correct: false },
        { text: { en: 'm − 5', ro: 'm − 5' }, correct: false },
        { text: { en: '1', ro: '1' }, correct: false },
      ],
      explanation: {
        en: 'f[m] = 5 means the longest proper prefix of P that is also a suffix has length 5. Since h[] mirrors g[] (prefix function of reversed P), h[0] = g[m−1] which corresponds to the longest suffix of P that is also a prefix — which is exactly f[m] = 5.',
        ro: 'f[m] = 5 înseamnă că cel mai lung prefix propriu al lui P care este și sufix are lungimea 5. Deoarece h[] oglindește g[] (funcția prefix a inversului lui P), h[0] = g[m−1] care corespunde celui mai lung sufix al lui P care este și prefix — adică exact f[m] = 5.',
      },
    },
  ];

  /* ─── Problem 20: Repeated Substring (Same as 15) ─── */

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: Algorithm Design Seminar 6 — String Searching (Rabin-Karp, Boyer-Moore), UAIC 2026.',
          'Sursa: Seminar PA 6 — Căutarea peste șiruri (Rabin-Karp, Boyer-Moore), UAIC 2026.'
        )}
      </p>

      <h2 className="text-xs font-bold uppercase tracking-wider mt-6 mb-1 pb-1" style={{ color: 'var(--theme-muted-text)', borderBottom: '1px solid var(--theme-border)' }}>
        {t('Rabin-Karp', 'Rabin-Karp')}
      </h2>

      {/* ── Problem 1 ── */}
      <h3 className="text-lg font-bold mt-4 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 1: Rabin-Karp Implementation', 'Problema 1: Implementarea Rabin-Karp')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t('Implement the Rabin-Karp algorithm.', 'Implementați algoritmul Rabin-Karp.')}</p>
      </Box>
      <MultipleChoice questions={mc1} />
      <Toggle
        question={t('Show Rabin-Karp pseudocode', 'Arată pseudocodul Rabin-Karp')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">
              {t(
                'Rabin-Karp uses a rolling hash to compare the pattern hash with each window hash in O(1). On hash match, verify character by character to avoid false positives.',
                'Rabin-Karp folosește un hash rolling pentru a compara hash-ul pattern-ului cu hash-ul fiecărei ferestre în O(1). La potrivirea hash-ului, verificăm caracter cu caracter pentru a evita fals-pozitivele.'
              )}
            </p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`RabinKarp(s, p, d, q)
  n ← length(s), m ← length(p)
  h ← d^(m-1) mod q
  hp ← 0, hs ← 0

  // Preprocessing: compute hash of pattern and first window
  for i ← 0 to m-1 do
    hp ← (d · hp + p[i]) mod q
    hs ← (d · hs + s[i]) mod q

  // Search
  for i ← 0 to n-m do
    if hp = hs then
      if s[i..i+m-1] = p then
        report match at position i
    if i < n-m then
      hs ← (d · (hs - s[i] · h) + s[i+m]) mod q
      if hs < 0 then hs ← hs + q`}</Code>
            <Box type="theorem">
              <p className="text-sm">
                {t(
                  'Expected complexity: O(n + m). Worst case: O(n·m) when all hashes collide.',
                  'Complexitate așteptată: O(n + m). Caz defavorabil: O(n·m) când toate hash-urile colizionează.'
                )}
              </p>
            </Box>
          </div>
        }
      />

      {/* ── Problem 2 ── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 2: Hash Computation Example', 'Problema 2: Exemplu de calcul hash')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Compute the hashes of pattern p and all substrings of length m of s for: p = aba, s = aabbababbabab, q = 3.',
            'Calculați hash-urile pattern-ului p și a tuturor subșirurilor de lungime m ale lui s pentru: p = aba, s = aabbababbabab, q = 3.'
          )}
        </p>
      </Box>
      <MultipleChoice questions={mc2hash} />
      <Toggle
        question={t('Show full hash computation', 'Arată calculul complet de hash')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Setup', 'Configurare')}</p>
            <p className="text-sm mb-2">
              {t('Let a=0, b=1, d=3 (alphabet size), q=3.', 'Fie a=0, b=1, d=3 (dimensiunea alfabetului), q=3.')}
            </p>
            <Code>{`hash(p) = hash("aba") = (0·9 + 1·3 + 0·1) mod 3 = 3 mod 3 = 0

s = a a b b a b a b b a b a b
    0 1 2 3 4 5 6 7 8 9 10 11 12

Substrings of length 3 and their hashes (mod 3):
pos 0: "aab" = (0·9 + 0·3 + 1) mod 3 = 1
pos 1: "abb" = (0·9 + 1·3 + 1) mod 3 = 4 mod 3 = 1
pos 2: "bba" = (1·9 + 1·3 + 0) mod 3 = 12 mod 3 = 0  ← hash match! verify: "bba" ≠ "aba"
pos 3: "bab" = (1·9 + 0·3 + 1) mod 3 = 10 mod 3 = 1
pos 4: "aba" = (0·9 + 1·3 + 0) mod 3 = 3 mod 3 = 0   ← hash match! verify: "aba" = "aba" ✓
pos 5: "bab" = 1
pos 6: "abb" = 1
pos 7: "bba" = 0  ← spurious hit
pos 8: "bab" = 1
pos 9: "aba" = 0  ← match ✓
pos 10: "bab" = 1`}</Code>
            <Box type="warning">
              <p className="text-sm">
                {t(
                  'With q=3 there are many spurious hits (hash collisions). A larger prime q reduces false positives.',
                  'Cu q=3 există multe potriviri false (coliziuni de hash). Un q prim mai mare reduce fals-pozitivele.'
                )}
              </p>
            </Box>
          </div>
        }
      />

      {/* ── Problem 3 ── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 3: Rabin-Karp Worst Case', 'Problema 3: Cazul defavorabil Rabin-Karp')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Find s, p, and q such that Rabin-Karp runs in O(n·m) time.',
            'Găsiți s, p și q astfel încât algoritmul Rabin-Karp să ruleze în O(n·m).'
          )}
        </p>
      </Box>
      <MultipleChoice questions={mc3} />

      {/* ── Problems 4-6: Matrix Search ── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problems 4–6: Matrix Pattern Matching', 'Problemele 4–6: Căutarea matricilor')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            '4. State the problem of searching a matrix inside another matrix.\n5. Write the naive algorithm. What is its complexity?\n6. Adapt Rabin-Karp for 2D matrix search: (a) hash function, (b) rolling update, (c) complexity.',
            '4. Enunțați problema căutării unei matrici într-o altă matrice.\n5. Scrieți algoritmul naiv. Ce complexitate are?\n6. Adaptați Rabin-Karp pentru căutarea 2D: (a) funcție hash, (b) actualizare rolling, (c) complexitate.'
          )}
        </p>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part A: Formalization', 'Partea A: Formalizare')}</p>
      <MultipleChoice questions={mc4} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part B: Naive complexity', 'Partea B: Complexitatea naivă')}</p>
      <MultipleChoice questions={mc5} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part C: 2D Rabin-Karp hash', 'Partea C: Hash Rabin-Karp 2D')}</p>
      <MultipleChoice questions={mc6hash} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part D: 2D Rabin-Karp complexity', 'Partea D: Complexitate Rabin-Karp 2D')}</p>
      <MultipleChoice questions={mc6complexity} />

      <Toggle
        question={t('Show 2D Rabin-Karp algorithm', 'Arată algoritmul Rabin-Karp 2D')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Naive Algorithm', 'Algoritmul naiv')}</p>
            <Code>{`NaiveMatrixSearch(T[n₁×n₂], P[m₁×m₂])
  for i ← 0 to n₁-m₁ do
    for j ← 0 to n₂-m₂ do
      match ← true
      for r ← 0 to m₁-1 do
        for c ← 0 to m₂-1 do
          if T[i+r][j+c] ≠ P[r][c] then
            match ← false; break
      if match then report (i, j)`}</Code>

            <p className="font-bold mt-4 mb-1">{t('2D Rabin-Karp Strategy', 'Strategia Rabin-Karp 2D')}</p>
            <p className="text-sm mb-2">
              {t(
                '1. For each column j, compute a rolling hash of each vertical strip of m₁ elements.\n2. For each row position i, combine m₂ consecutive column hashes into a single "row hash" using another rolling hash.\n3. When sliding horizontally: remove leftmost column hash, add rightmost.\n4. When sliding vertically: update each column hash by removing top row, adding bottom row.',
                '1. Pentru fiecare coloană j, calculează un hash rolling al fiecărei fâșii verticale de m₁ elemente.\n2. Pentru fiecare poziție de rând i, combină m₂ hash-uri de coloană consecutive într-un singur "hash de rând" folosind alt hash rolling.\n3. La deplasare orizontală: elimină hash-ul coloanei din stânga, adaugă pe cel din dreapta.\n4. La deplasare verticală: actualizează fiecare hash de coloană eliminând rândul de sus, adăugând rândul de jos.'
              )}
            </p>
            <Box type="theorem">
              <p className="text-sm">
                {t(
                  'Expected complexity: O(n₁·n₂) with a good hash function.',
                  'Complexitate așteptată: O(n₁·n₂) cu o funcție hash bună.'
                )}
              </p>
            </Box>
          </div>
        }
      />

      <h2 className="text-xs font-bold uppercase tracking-wider mt-8 mb-1 pb-1" style={{ color: 'var(--theme-muted-text)', borderBottom: '1px solid var(--theme-border)' }}>
        {t('String algorithms', 'Algoritmi pe șiruri')}
      </h2>

      {/* ── Problem 7 ── */}
      <h3 className="text-lg font-bold mt-4 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 7: Longest Substring Appearing K Times', 'Problema 7: Cel mai lung subșir care apare de K ori')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Given an integer K and a string of length N, find the longest substring that appears at least K times.',
            'Dându-se un număr întreg K și un șir de lungime N, găsiți cel mai lung subșir care apare de cel puțin K ori.'
          )}
        </p>
      </Box>
      <MultipleChoice questions={mc7} />
      <Toggle
        question={t('Show algorithm', 'Arată algoritmul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Binary Search + Rolling Hash', 'Căutare binară + Rolling Hash')}</p>
            <Code>{`LongestKRepeat(s, K)
  lo ← 1, hi ← N, ans ← 0
  while lo ≤ hi do
    mid ← (lo + hi) / 2
    if existsSubstringOfLengthAppearingKTimes(s, mid, K) then
      ans ← mid
      lo ← mid + 1
    else
      hi ← mid - 1
  return ans

existsSubstringOfLengthAppearingKTimes(s, L, K)
  // Use Rabin-Karp rolling hash to hash all substrings of length L
  // Store hashes in a hash map, count occurrences
  // Return true if any hash appears ≥ K times (verify to avoid false positives)`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t('Expected complexity: O(N log N).', 'Complexitate așteptată: O(N log N).')}</p>
            </Box>
          </div>
        }
      />

      {/* ── Problem 8 ── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 8: Minimum Prepend for Palindrome', 'Problema 8: Minim de caractere adăugate pentru palindrom')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Given string s, find the minimum number of characters to prepend to make it a palindrome.\nExample: Input: "acecaxy" → Output: 2 (prepend "yx")',
            'Dat un șir s, găsiți numărul minim de caractere de adăugat la început pentru a deveni palindrom.\nExemplu: Input: "acecaxy" → Output: 2 (se adaugă "yx")'
          )}
        </p>
      </Box>
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part A: Answer', 'Partea A: Răspuns')}</p>
      <MultipleChoice questions={mc8} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part B: Algorithm', 'Partea B: Algoritm')}</p>
      <MultipleChoice questions={mc8method} />
      <Toggle
        question={t('Show KMP-based solution', 'Arată soluția bazată pe KMP')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <Code>{`MinPrependPalindrome(s)
  n ← length(s)
  rev ← reverse(s)
  t ← s + "$" + rev          // "$" is a separator not in alphabet
  f ← KMP_failure(t)         // compute failure/prefix function
  longest_palindromic_prefix ← f[length(t) - 1]
  return n - longest_palindromic_prefix`}</Code>
            <p className="text-sm mb-2">
              {t(
                'Example: s = "acecaxy", rev = "yxaceca"\nt = "acecaxy$yxaceca"\nf[14] = 5 (prefix "aceca" = suffix "aceca")\nAnswer: 7 − 5 = 2',
                'Exemplu: s = "acecaxy", rev = "yxaceca"\nt = "acecaxy$yxaceca"\nf[14] = 5 (prefix "aceca" = sufix "aceca")\nRăspuns: 7 − 5 = 2'
              )}
            </p>
            <Box type="theorem">
              <p className="text-sm">{t('Complexity: O(n).', 'Complexitate: O(n).')}</p>
            </Box>
          </div>
        }
      />

      {/* ── Problem 9 ── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 9: Longest Palindromic Substring', 'Problema 9: Cel mai lung subșir palindromic')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Given a string s, find the longest substring that is a palindrome.',
            'Dat un șir de caractere s, găsiți cel mai lung subșir care este palindrom.'
          )}
        </p>
      </Box>
      <MultipleChoice questions={mc9} />
      <Toggle
        question={t("Show Manacher's algorithm", 'Arată algoritmul lui Manacher')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t("Manacher's Algorithm", 'Algoritmul lui Manacher')}</p>
            <p className="text-sm mb-2">
              {t(
                'Insert a special character (e.g., "#") between each pair of characters and at both ends to handle even-length palindromes uniformly. Then compute the palindrome radius at each position.',
                'Inserează un caracter special (ex: "#") între fiecare pereche de caractere și la ambele capete pentru a trata uniform palindroamele de lungime pară. Apoi calculează raza palindromului la fiecare poziție.'
              )}
            </p>
            <Code>{`Manacher(s)
  t ← "#" + s[0] + "#" + s[1] + "#" + ... + s[n-1] + "#"
  P ← array of size |t|, initialized to 0
  C ← 0, R ← 0   // center and right boundary of rightmost palindrome

  for i ← 0 to |t|-1 do
    mirror ← 2·C - i
    if i < R then
      P[i] ← min(R - i, P[mirror])

    // Expand around center i
    while i + P[i] + 1 < |t| and i - P[i] - 1 ≥ 0
          and t[i + P[i] + 1] = t[i - P[i] - 1] do
      P[i] ← P[i] + 1

    // Update center if we expanded past R
    if i + P[i] > R then
      C ← i, R ← i + P[i]

  return max(P)   // length of longest palindromic substring`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t('Complexity: O(n) time, O(n) space.', 'Complexitate: O(n) timp, O(n) spațiu.')}</p>
            </Box>
          </div>
        }
      />

      {/* ── Problem 10 ── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 10: Java hashCode Collisions', 'Problema 10: Coliziuni Java hashCode')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Find 2ᴺ strings of length 2N that all have the same Java .hashCode(). The hash function is: hash = (hash * 31) + charAt(i), starting from hash = 0.',
            'Determinați 2ᴺ șiruri de lungime 2N care au aceeași valoare .hashCode() în Java. Funcția hash este: hash = (hash * 31) + charAt(i), pornind de la hash = 0.'
          )}
        </p>
      </Box>
      <Code>{`public int hashCode() {
  int hash = 0;
  for (int i = 0; i < length(); i++) {
    hash = (hash * 31) + charAt(i);
  }
  return hash;
}`}</Code>
      <MultipleChoice questions={mc10} />
      <Toggle
        question={t('Show construction', 'Arată construcția')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Key Observation', 'Observație cheie')}</p>
            <p className="text-sm mb-2">
              {t(
                'Find two 2-character strings with identical hashCode:\n• "Aa" → 65·31 + 97 = 2112\n• "BB" → 66·31 + 66 = 2112\n\nNow, for any concatenation of length 2N using these building blocks, the hashCode is the same!',
                'Găsim două șiruri de 2 caractere cu hashCode identic:\n• "Aa" → 65·31 + 97 = 2112\n• "BB" → 66·31 + 66 = 2112\n\nAcum, pentru orice concatenare de lungime 2N folosind aceste blocuri, hashCode-ul este identic!'
              )}
            </p>
            <Code>{`N=1: "Aa", "BB"                    → 2 strings of length 2
N=2: "AaAa", "AaBB", "BBAa", "BBBB" → 4 strings of length 4
N=3: 8 strings of length 6, e.g., "AaAaAa", "AaAaBB", ...

Why it works:
hash("xy") = hash("x") · 31^len(y) + hash("y")

If hash("Aa") = hash("BB") = H, then:
hash("Aa" + z) = H · 31^len(z) + hash(z)
hash("BB" + z) = H · 31^len(z) + hash(z)
These are equal regardless of z!`}</Code>
          </div>
        }
      />

      {/* ── Problem 11 ── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 11: String Rotation Detection', 'Problema 11: Detectarea rotației de șiruri')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Given two strings s and t of length n, determine if s is a rotation of t.\nExample: s = "ABBA", t = "BAAB" → "yes". s = "ABA", t = "BAB" → "no".\nReduce to string searching and conclude it can be solved in linear time.',
            'Date două șiruri s și t de lungime n, determinați dacă s este o rotație a lui t.\nExemplu: s = "ABBA", t = "BAAB" → "da". s = "ABA", t = "BAB" → "nu".\nReduceți la problema căutării și concluzionați că se poate rezolva în timp liniar.'
          )}
        </p>
      </Box>
      <MultipleChoice questions={mc11} />

      {/* ── Problem 12 ── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 12: Anagram Search', 'Problema 12: Căutarea anagramelor')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Find all anagrams of pattern p in string s. Two strings are anagrams if every character appears the same number of times in both.\nExample: p = "aba", s = "baab" → anagrams at positions 0 and 1.',
            'Găsiți toate anagramele pattern-ului p în șirul s. Două șiruri sunt anagrame dacă fiecare caracter apare de același număr de ori în ambele.\nExemplu: p = "aba", s = "baab" → anagrame la pozițiile 0 și 1.'
          )}
        </p>
      </Box>
      <MultipleChoice questions={mc12} />
      <Toggle
        question={t('Show sliding window algorithm', 'Arată algoritmul cu fereastră glisantă')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <Code>{`AnagramSearch(s, p)
  n ← length(s), m ← length(p)
  countP ← frequency array of p
  countW ← frequency array of s[0..m-1]

  for i ← 0 to n-m do
    if countW = countP then
      report anagram at position i
    if i + m < n then
      countW[s[i+m]] ← countW[s[i+m]] + 1    // add new char
      countW[s[i]]   ← countW[s[i]]   - 1    // remove old char`}</Code>
            <Box type="theorem">
              <p className="text-sm">
                {t(
                  'Complexity: O(n·|Σ|) or O(n) with a match counter optimization (track how many characters have matching frequencies).',
                  'Complexitate: O(n·|Σ|) sau O(n) cu optimizarea unui contor de potriviri (urmărim câte caractere au frecvențe identice).'
                )}
              </p>
            </Box>
          </div>
        }
      />

      {/* ── Problems 13–14: Boyer-Moore Comparisons ── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problems 13–14: Boyer-Moore Comparison Counts', 'Problemele 13–14: Numărul de comparații Boyer-Moore')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            '13. For a binary alphabet, find an example where Boyer-Moore makes the minimum comparisons.\n14. Count comparisons for searching (a) "00001", (b) "10000", (c) "01010" in a text of 1000 zeros.',
            '13. Pentru alfabetul binar, găsiți un exemplu unde Boyer-Moore face numărul minim de comparații.\n14. Numărați comparațiile pentru căutarea (a) "00001", (b) "10000", (c) "01010" într-un text de 1000 de zerouri.'
          )}
        </p>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Best case scenario', 'Scenariul cel mai favorabil')}</p>
      <MultipleChoice questions={mc13} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('(a) Pattern "00001"', '(a) Pattern "00001"')}</p>
      <MultipleChoice questions={mc14a} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('(b) Pattern "10000"', '(b) Pattern "10000"')}</p>
      <MultipleChoice questions={mc14b} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('(c) Pattern "01010"', '(c) Pattern "01010"')}</p>
      <MultipleChoice questions={mc14c} />

      {/* ── Problem 15 & 20 ── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problems 15 & 20: Repeated Substring Pattern', 'Problemele 15 & 20: Subșir repetat')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Determine if a text T of length N is of the form pⁿ, i.e., a substring repeated two or more times.',
            'Determinați dacă un text T de lungime N este de forma pⁿ, adică un subșir repetat de două sau mai multe ori.'
          )}
        </p>
      </Box>
      <MultipleChoice questions={mc15} />

      {/* ── Problem 16 ── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 16: Subsequence Check', 'Problema 16: Verificarea subsecvenței')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'A sequence s is a subsequence of S if s can be obtained by deleting characters from S (preserving order). Example: "abcd" is a subsequence of "cdaaacbbacccda".\nImplement an O(n+m) algorithm to check if s is a subsequence of S.',
            'O secvență s este o subsecvență a lui S dacă s poate fi obținută prin ștergerea unor caractere din S (păstrând ordinea). Exemplu: "abcd" este o subsecvență a "cdaaacbbacccda".\nImplementați un algoritm O(n+m) care verifică dacă s este subsecvență a lui S.'
          )}
        </p>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Formalization', 'Formalizare')}</p>
      <MultipleChoice questions={mc16} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Algorithm', 'Algoritm')}</p>
      <MultipleChoice questions={mc16algo} />

      <Toggle
        question={t('Show two-pointer algorithm', 'Arată algoritmul cu doi pointeri')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <Code>{`IsSubsequence(s, S)
  i ← 0, j ← 0
  n ← length(s), m ← length(S)
  while i < n and j < m do
    if s[i] = S[j] then
      i ← i + 1
    j ← j + 1
  return i = n`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t('Complexity: O(n + m).', 'Complexitate: O(n + m).')}</p>
            </Box>
          </div>
        }
      />

      <h2 className="text-xs font-bold uppercase tracking-wider mt-8 mb-1 pb-1" style={{ color: 'var(--theme-muted-text)', borderBottom: '1px solid var(--theme-border)' }}>
        {t('Boyer-Moore', 'Boyer-Moore')}
      </h2>

      {/* ── Problem 17 ── */}
      <h3 className="text-lg font-bold mt-4 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 17: Boyer-Moore BC & GS Tables', 'Problema 17: Tabelele BC & GS Boyer-Moore')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Compute the BC[i] (bad character) and GS[i] (good suffix) tables for:\n(a) P = "oxoxoyoxo"\n(b) P = "ABCWABCYABXAB"\nThen search (b) in T = "TTTTTTTTTTCABAZABTTTTTTAABXABCWABCYABXAB".',
            'Calculați tabelele BC[i] (bad character) și GS[i] (good suffix) pentru:\n(a) P = "oxoxoyoxo"\n(b) P = "ABCWABCYABXAB"\nApoi căutați (b) în T = "TTTTTTTTTTCABAZABTTTTTTAABXABCWABCYABXAB".'
          )}
        </p>
      </Box>
      <MultipleChoice questions={mc17type} />
      <Toggle
        question={t('Show BC/GS tables for P = "oxoxoyoxo"', 'Arată tabelele BC/GS pentru P = "oxoxoyoxo"')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">P = "oxoxoyoxo" (m = 9)</p>
            <Code>{`Positions: 0 1 2 3 4 5 6 7 8
           o x o x o y o x o

BC table (rightmost occurrence):
  BC['o'] = 8
  BC['x'] = 7
  BC['y'] = 5
  All others = -1`}</Code>
            <p className="text-sm mb-2">
              {t(
                'The Good Suffix table requires computing the suffix function and border array of the reversed pattern. For each position i where a mismatch occurs after matching suffix P[i+1..8], GS[i] gives the safe shift.',
                'Tabela Good Suffix necesită calcularea funcției sufix și a vectorului de bordură al pattern-ului inversat. Pentru fiecare poziție i unde apare nepotrivire după potrivirea sufixului P[i+1..8], GS[i] dă deplasarea sigură.'
              )}
            </p>
          </div>
        }
      />
      <Toggle
        question={t('Show search of "ABCWABCYABXAB" in T', 'Arată căutarea lui "ABCWABCYABXAB" în T')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">P = "ABCWABCYABXAB" (m = 13)</p>
            <Code>{`BC table:
  BC['A'] = 12, BC['B'] = 11, BC['C'] = 6
  BC['W'] = 3,  BC['X'] = 10, BC['Y'] = 7
  All others = -1

T = TTTTTTTTTTCABAZABTTTTTTAABXABCWABCYABXAB
    0         1         2         3
    0123456789012345678901234567890123456789

Search proceeds right-to-left within pattern:
- Align at pos 0:  T[12]='C' vs P[12]='B' → mismatch
  BC['C']=6, shift = max(1, 12-6) = 6
- Align at pos 6:  T[18]='T' vs P[12]='B' → mismatch
  BC['T']=-1, shift = max(1, 12-(-1)) = 13
- Align at pos 19: T[31]='C' vs P[12]='B' → mismatch
  BC['C']=6, shift = max(1, 12-6) = 6
- Align at pos 25: Compare from right...
  Eventually: T[25..37] = "ABCWABCYABXAB" = P → Match at position 25! ✓`}</Code>
          </div>
        }
      />

      {/* ── Problem 18: Boyer-Moore Case III ── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 18: Boyer-Moore Bad Character — Case III', 'Problema 18: Boyer-Moore Caracter rău — Cazul III')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Case III: the mismatched character from T is found in P but to the right of the last compared position, making the bad character rule ineffective (would cause regression). The naive fix shifts by 1.\n(a) Propose a precomputation to handle this efficiently.\n(b) What if |Σ| is large and we cannot allocate O(m × |Σ|) memory?',
            'Cazul III: caracterul nepotrivit din T se găsește în P dar la dreapta ultimului caracter comparat, făcând regula caracterului rău ineficientă. Soluția naivă deplasează cu 1.\n(a) Propuneți o precalculare pentru a trata eficient acest caz.\n(b) Ce se întâmplă dacă |Σ| este mare și nu putem aloca O(m × |Σ|) memorie?'
          )}
        </p>
      </Box>
      <Toggle
        question={t('Show enhanced bad character approach', 'Arată abordarea îmbunătățită a caracterului rău')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('(a) Full BC Table: O(m × |Σ|)', '(a) Tabela BC completă: O(m × |Σ|)')}</p>
            <p className="text-sm mb-2">
              {t(
                'Instead of storing just the rightmost occurrence, build a 2D table BC[i][c] = rightmost position of character c in P[0..i−1] (to the left of position i). When mismatch at position i with text character c, shift to align with BC[i][c]. Since |Σ| = O(1) by assumption, this takes O(m) space and O(m) preprocessing.',
                'În loc să stocăm doar cea mai din dreapta apariție, construim o tabelă 2D BC[i][c] = cea mai din dreapta poziție a caracterului c în P[0..i−1] (la stânga poziției i). La nepotrivire la poziția i cu caracterul c din text, deplasăm pentru a alinia cu BC[i][c]. Deoarece |Σ| = O(1) prin ipoteză, necesită O(m) spațiu și O(m) preprocesare.'
              )}
            </p>

            <p className="font-bold mt-4 mb-1">{t('(b) Space-efficient: O(m) with linked lists', '(b) Eficient ca spațiu: O(m) cu liste înlănțuite')}</p>
            <p className="text-sm mb-2">
              {t(
                'For each position i in P, maintain a linked list of previous occurrences of each character. When mismatch at position i with character c, walk the list for c to find the first occurrence to the left of position i. Alternatively, for each character c, store a sorted array of positions where c appears in P, then binary search for the largest position < i. This gives O(m) total space and O(log m) per query.',
                'Pentru fiecare poziție i în P, menținem o listă înlănțuită a aparițiilor anterioare ale fiecărui caracter. La nepotrivire la poziția i cu caracterul c, parcurgem lista pentru c pentru a găsi prima apariție la stânga poziției i. Alternativ, pentru fiecare caracter c, stocăm un array sortat de poziții unde c apare în P, apoi facem căutare binară pentru cea mai mare poziție < i. Aceasta dă O(m) spațiu total și O(log m) per interogare.'
              )}
            </p>
          </div>
        }
      />

      {/* ── Problem 19 ── */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 19: Prefix Function & h[] Vector', 'Problema 19: Funcția prefix & vectorul h[]')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t(
            'Given pattern P with |P| = m > 5 and prefix function f[m] = 5. The vector h[] is the mirror of g[] (prefix function for R = reverse of P). What is h[0]?',
            'Fie pattern-ul P cu |P| = m > 5 și funcția prefix f[m] = 5. Vectorul h[] este oglindirea lui g[] (funcția prefix pentru R = inversul lui P). Cât este h[0]?'
          )}
        </p>
      </Box>
      <MultipleChoice questions={mc19} />
    </>
  );
}
