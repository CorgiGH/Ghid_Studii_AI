import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar01() {
  const { t } = useApp();

  /* ─── Problem 1: First n primes ─── */
  const mc1 = [{
    question: {
      en: 'Which is the correct Input-Output formalization for "Find the first n prime numbers"?',
      ro: 'Care este formalizarea corectă Input-Output pentru „Determinați primele n numere prime"?',
    },
    options: [
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: (p\u2081, p\u2082, \u2026, p\u2099) where p\u1D62 is the i-th prime number', ro: 'Input: n \u2208 \u2124\u207A; Output: (p\u2081, p\u2082, \u2026, p\u2099) unde p\u1D62 este al i-lea număr prim' }, correct: true },
      { text: { en: 'Input: a list of numbers; Output: which of them are prime', ro: 'Input: o listă de numere; Output: care dintre ele sunt prime' }, correct: false },
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: true if n is prime, false otherwise', ro: 'Input: n \u2208 \u2124\u207A; Output: true dacă n este prim, false altfel' }, correct: false },
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: the n-th prime number only', ro: 'Input: n \u2208 \u2124\u207A; Output: doar al n-lea număr prim' }, correct: false },
    ],
    explanation: {
      en: 'The problem asks for the first n primes as a sequence, not a single number or a primality test. Input is a positive integer n, output is an ordered tuple of the first n primes.',
      ro: 'Problema cere primele n numere prime ca secvență, nu un singur număr sau un test de primalitate. Input-ul este un număr natural n, output-ul este un tuplu ordonat al primelor n numere prime.',
    },
  }];

  /* ─── Problem 2: Sieve of Eratosthenes ─── */
  const mc2 = [{
    question: {
      en: 'Which is the correct Input-Output formalization for "Generate primes less than n using the Sieve of Eratosthenes"?',
      ro: 'Care este formalizarea corectă Input-Output pentru „Generați numerele prime mai mici decât n folosind ciurul lui Eratostene"?',
    },
    options: [
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: all prime numbers in {2, 3, \u2026, n\u22121}', ro: 'Input: n \u2208 \u2124\u207A; Output: toate numerele prime din {2, 3, \u2026, n\u22121}' }, correct: true },
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: the first n prime numbers', ro: 'Input: n \u2208 \u2124\u207A; Output: primele n numere prime' }, correct: false },
      { text: { en: 'Input: a range [a, b]; Output: primes in that range', ro: 'Input: un interval [a, b]; Output: numerele prime din acel interval' }, correct: false },
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: composite numbers less than n', ro: 'Input: n \u2208 \u2124\u207A; Output: numerele compuse mai mici decât n' }, correct: false },
    ],
    explanation: {
      en: 'The Sieve finds all primes strictly less than n (in the set {2, \u2026, n\u22121}). It does not find the first n primes \u2014 that would be a different problem.',
      ro: 'Ciurul găsește toate numerele prime strict mai mici decât n (în mulțimea {2, \u2026, n\u22121}). Nu găsește primele n numere prime \u2014 aceasta ar fi o altă problemă.',
    },
  }];

  /* ─── Problem 3: Square palindromes ─── */
  const mc3 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Find all square palindromes \u2264 n"?',
      ro: 'Care este formalizarea corectă I/O pentru „Găsiți toate palindromurile pătrate \u2264 n"?',
    },
    options: [
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: {x \u2208 \u2124\u207A | x \u2264 n, x is a palindrome AND x\u00B2 is a palindrome}', ro: 'Input: n \u2208 \u2124\u207A; Output: {x \u2208 \u2124\u207A | x \u2264 n, x este palindrom \u0218I x\u00B2 este palindrom}' }, correct: true },
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: {x \u2208 \u2124\u207A | x\u00B2 \u2264 n, x\u00B2 is a palindrome}', ro: 'Input: n \u2208 \u2124\u207A; Output: {x \u2208 \u2124\u207A | x\u00B2 \u2264 n, x\u00B2 este palindrom}' }, correct: false },
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: true if n is a square palindrome', ro: 'Input: n \u2208 \u2124\u207A; Output: true dacă n este un palindrom pătrat' }, correct: false },
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: {x \u2208 \u2124\u207A | x \u2264 n, x is a palindrome}', ro: 'Input: n \u2208 \u2124\u207A; Output: {x \u2208 \u2124\u207A | x \u2264 n, x este palindrom}' }, correct: false },
    ],
    explanation: {
      en: 'A square palindrome x requires BOTH x and x\u00B2 to be palindromes (e.g. 11\u00B2 = 121). The last option only checks if x is a palindrome, ignoring x\u00B2.',
      ro: 'Un palindrom pătrat x necesită ca AMBELE, x și x\u00B2, să fie palindromuri (ex. 11\u00B2 = 121). Ultima opțiune verifică doar dacă x e palindrom, ignorând x\u00B2.',
    },
  }];

  /* ─── Problem 4: Happy number ─── */
  const mc4 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Determine if n is a happy number"?',
      ro: 'Care este formalizarea corectă I/O pentru „Stabiliți dacă n este un număr fericit"?',
    },
    options: [
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: "happy" if repeated digit-square-sum reaches 1, "unhappy" otherwise', ro: 'Input: n \u2208 \u2124\u207A; Output: "fericit" dacă suma repetată a pătratelor cifrelor ajunge la 1, "nefericit" altfel' }, correct: true },
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: the sequence of sums until a cycle is found', ro: 'Input: n \u2208 \u2124\u207A; Output: secvența sumelor până la găsirea unui ciclu' }, correct: false },
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: the sum of squares of digits of n', ro: 'Input: n \u2208 \u2124\u207A; Output: suma pătratelor cifrelor lui n' }, correct: false },
    ],
    explanation: {
      en: 'The problem asks for a decision (happy or not), not the intermediate sequence. A happy number eventually reaches 1; an unhappy one enters a cycle that never includes 1.',
      ro: 'Problema cere o decizie (fericit sau nu), nu secvența intermediară. Un număr fericit ajunge la 1; unul nefericit intră într-un ciclu care nu include 1.',
    },
  }];

  /* ─── Problem 5: Even Fibonacci sum ─── */
  const mc5 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Find the sum of even Fibonacci terms not exceeding 4,000,000"?',
      ro: 'Care este formalizarea corectă I/O pentru „Găsiți suma termenilor pari din secvența Fibonacci care nu depășesc 4.000.000"?',
    },
    options: [
      { text: { en: 'Input: limit = 4,000,000; Output: \u03A3{f \u2208 Fibonacci | f \u2264 limit AND f is even}', ro: 'Input: limit = 4.000.000; Output: \u03A3{f \u2208 Fibonacci | f \u2264 limit \u0218I f este par}' }, correct: true },
      { text: { en: 'Input: none; Output: all even Fibonacci numbers up to 4,000,000', ro: 'Input: niciunul; Output: toate numerele Fibonacci pare până la 4.000.000' }, correct: false },
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: the n-th even Fibonacci number', ro: 'Input: n \u2208 \u2124\u207A; Output: al n-lea număr Fibonacci par' }, correct: false },
      { text: { en: 'Input: limit = 4,000,000; Output: count of even Fibonacci numbers \u2264 limit', ro: 'Input: limit = 4.000.000; Output: numărul de Fibonacci pare \u2264 limit' }, correct: false },
    ],
    explanation: {
      en: 'The output is a single number (the sum), not a list or a count. The input is the upper bound (4,000,000). Starting sequence: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, \u2026',
      ro: 'Output-ul este un singur număr (suma), nu o listă sau un contor. Input-ul este limita superioară (4.000.000). Secvența: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, \u2026',
    },
  }];

  /* ─── Problem 6: Hexagonal numbers ─── */
  const mc6 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Given an array, count how many elements are hexagonal numbers"?',
      ro: 'Care este formalizarea corectă I/O pentru „Dat un vector de numere, determinați câte sunt numere hexagonale"?',
    },
    options: [
      { text: { en: 'Input: (a\u2081, \u2026, a\u2099) where a\u1D62 \u2208 \u2124\u207A; Output: |{a\u1D62 | \u2203k: a\u1D62 = k(2k\u22121)}|', ro: 'Input: (a\u2081, \u2026, a\u2099) unde a\u1D62 \u2208 \u2124\u207A; Output: |{a\u1D62 | \u2203k: a\u1D62 = k(2k\u22121)}|' }, correct: true },
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: the first n hexagonal numbers', ro: 'Input: n \u2208 \u2124\u207A; Output: primele n numere hexagonale' }, correct: false },
      { text: { en: 'Input: (a\u2081, \u2026, a\u2099); Output: the hexagonal numbers in the array', ro: 'Input: (a\u2081, \u2026, a\u2099); Output: numerele hexagonale din vector' }, correct: false },
      { text: { en: 'Input: n \u2208 \u2124\u207A; Output: true if n is hexagonal', ro: 'Input: n \u2208 \u2124\u207A; Output: true dacă n este hexagonal' }, correct: false },
    ],
    explanation: {
      en: 'The output is a count (how many), not the list itself. A number h is hexagonal iff h = k(2k\u22121) for some positive integer k. First hexagonal numbers: 1, 6, 15, 28, 45, 66, 91, 120, \u2026',
      ro: 'Output-ul este un contor (câte), nu lista în sine. Un număr h este hexagonal dacă h = k(2k\u22121) pentru un k natural. Primele numere hexagonale: 1, 6, 15, 28, 45, 66, 91, 120, \u2026',
    },
  }];

  /* ─── Problem 7: Shortest path with ≤ k nodes ─── */
  const mc7 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Find the minimum cost path between two nodes visiting at most k nodes in a weighted digraph"?',
      ro: 'Care este formalizarea corectă I/O pentru „Determinați drumul cu cel mai mic cost între două noduri, vizitând cel mult k noduri, într-un graf orientat ponderat"?',
    },
    options: [
      { text: { en: 'Input: G = (V, E, w), s \u2208 V, d \u2208 V, k \u2208 \u2124\u207A; Output: min cost path from s to d using \u2264 k nodes', ro: 'Input: G = (V, E, w), s \u2208 V, d \u2208 V, k \u2208 \u2124\u207A; Output: drumul de cost minim de la s la d folosind \u2264 k noduri' }, correct: true },
      { text: { en: 'Input: G = (V, E, w), s \u2208 V, d \u2208 V; Output: shortest path from s to d', ro: 'Input: G = (V, E, w), s \u2208 V, d \u2208 V; Output: drumul cel mai scurt de la s la d' }, correct: false },
      { text: { en: 'Input: G = (V, E, w), k \u2208 \u2124\u207A; Output: all paths with \u2264 k nodes', ro: 'Input: G = (V, E, w), k \u2208 \u2124\u207A; Output: toate drumurile cu \u2264 k noduri' }, correct: false },
      { text: { en: 'Input: G = (V, E, w), s \u2208 V, d \u2208 V, k \u2208 \u2124\u207A; Output: true if a path with \u2264 k nodes exists', ro: 'Input: G = (V, E, w), s \u2208 V, d \u2208 V, k \u2208 \u2124\u207A; Output: true dacă există un drum cu \u2264 k noduri' }, correct: false },
    ],
    explanation: {
      en: 'The problem requires finding the minimum cost path (not just existence), from a specific source to destination, with the constraint of visiting at most k nodes. All four inputs (graph, source, destination, k) are needed.',
      ro: 'Problema cere găsirea drumului de cost minim (nu doar existența), de la o sursă specifică la o destinație, cu constrângerea de a vizita cel mult k noduri. Toate cele patru intrări (graf, sursă, destinație, k) sunt necesare.',
    },
  }];

  /* ─── Problem 8: N-Queens ─── */
  const mc8 = [{
    question: {
      en: 'Which is the correct I/O formalization for the N-Queens problem?',
      ro: 'Care este formalizarea corectă I/O pentru problema celor N regine?',
    },
    options: [
      { text: { en: 'Input: N \u2208 \u2124\u207A; Output: all placements of N queens on an N\u00D7N board such that no two queens attack each other', ro: 'Input: N \u2208 \u2124\u207A; Output: toate plasările a N regine pe o tablă N\u00D7N astfel încât nicio pereche de regine să nu se atace' }, correct: true },
      { text: { en: 'Input: an N\u00D7N board with queens placed; Output: true if no two queens attack each other', ro: 'Input: o tablă N\u00D7N cu regine plasate; Output: true dacă nicio pereche de regine nu se atacă' }, correct: false },
      { text: { en: 'Input: N \u2208 \u2124\u207A; Output: the maximum number of queens that can be placed on an N\u00D7N board', ro: 'Input: N \u2208 \u2124\u207A; Output: numărul maxim de regine care pot fi plasate pe o tablă N\u00D7N' }, correct: false },
      { text: { en: 'Input: N \u2208 \u2124\u207A; Output: one valid placement of N non-attacking queens', ro: 'Input: N \u2208 \u2124\u207A; Output: o plasare validă a N regine care nu se atacă' }, correct: false },
    ],
    explanation: {
      en: 'The N-Queens problem asks for ALL valid arrangements, not just one. The answer N is always N queens (trivially), so max-queens makes no sense. The input is the board size N, not a pre-placed board.',
      ro: 'Problema celor N regine cere TOATE aranjamentele valide, nu doar una. Răspunsul N este întotdeauna N regine (trivial), deci max-regine nu are sens. Input-ul este dimensiunea tablei N, nu o tablă pre-populată.',
    },
  }];

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: Algorithm Design Seminar 1 \u2014 Computational Problems, UAIC 2026. For each problem: test your I/O formalization, then reveal the algorithm & pseudocode.',
          'Sursa: Seminar PA 1 \u2014 Probleme computaționale, UAIC 2026. Pentru fiecare problemă: testează-ți formalizarea I/O, apoi dezvăluie algoritmul și pseudocodul.'
        )}
      </p>

      {/* ═══ Problem 1 ═══ */}
      <h3 className="text-lg font-bold mt-6 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 1: First n Primes', 'Problema 1: Primele n numere prime')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Given a positive integer n, find the first n prime numbers.',
          'Dat un număr natural n, determinați primele n numere prime.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc1} />
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">{t(
              'Start from 2 and check each candidate number for primality by testing divisibility against all primes found so far. Stop when we have collected n primes.',
              'Pornind de la 2, verificăm fiecare candidat pentru primalitate testând divizibilitatea cu toate numerele prime găsite anterior. Ne oprim când am colectat n numere prime.'
            )}</p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm FirstNPrimes(n)
  primes \u2190 empty list
  candidate \u2190 2
  while |primes| < n do
    isPrime \u2190 true
    for each p in primes do
      if candidate mod p == 0 then
        isPrime \u2190 false
        break
    if isPrime then
      append candidate to primes
    candidate \u2190 candidate + 1
  return primes`}</Code>
          </div>
        }
      />

      {/* ═══ Problem 2 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 2: Sieve of Eratosthenes', 'Problema 2: Ciurul lui Eratostene')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Write an algorithm that generates all prime numbers less than a given number n using the Sieve of Eratosthenes.',
          'Scrieți un algoritm care generează numerele prime mai mici decât un număr dat n folosind ciurul lui Eratostene.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc2} />
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">{t(
              'Create a boolean array of size n, initially all true. Starting from 2, for each number still marked true, mark all its multiples as false. The indices still marked true at the end are primes.',
              'Creăm un vector boolean de dimensiune n, inițial toate true. Pornind de la 2, pentru fiecare număr încă marcat true, marcăm toți multiplii săi ca false. Indicii rămași true la final sunt numere prime.'
            )}</p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm SieveOfEratosthenes(n)
  isPrime[0..n-1] \u2190 all true
  isPrime[0] \u2190 false
  isPrime[1] \u2190 false
  for i = 2 to \u230A\u221An\u230B do
    if isPrime[i] then
      for j = i\u00B2 to n-1 step i do
        isPrime[j] \u2190 false
  result \u2190 empty list
  for i = 2 to n-1 do
    if isPrime[i] then
      append i to result
  return result`}</Code>
          </div>
        }
      />

      {/* ═══ Problem 3 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 3: Square Palindromes', 'Problema 3: Palindromuri pătrate')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'A square palindrome is a number where both the number and its square are palindromes (e.g. 11\u00B2 = 121). Given n, find all square palindromes \u2264 n.',
          'Un palindrom pătrat este un număr pentru care atât numărul, cât și pătratul său sunt palindromuri (ex. 11\u00B2 = 121). Dat n, găsiți toate palindromurile pătrate \u2264 n.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc3} />
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">{t(
              'Iterate through all numbers from 1 to n. For each number, check if it is a palindrome and if its square is also a palindrome. To check if a number is a palindrome, reverse its digits and compare.',
              'Iterăm prin toate numerele de la 1 la n. Pentru fiecare număr, verificăm dacă este palindrom și dacă pătratul său este tot palindrom. Pentru a verifica dacă un număr este palindrom, inversăm cifrele și comparăm.'
            )}</p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm IsPalindrome(x)
  original \u2190 x
  reversed \u2190 0
  while x > 0 do
    reversed \u2190 reversed * 10 + (x mod 10)
    x \u2190 \u230Ax / 10\u230B
  return original == reversed

Algorithm SquarePalindromes(n)
  result \u2190 empty list
  for i = 1 to n do
    if IsPalindrome(i) AND IsPalindrome(i\u00B2) then
      append i to result
  return result`}</Code>
          </div>
        }
      />

      {/* ═══ Problem 4 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 4: Happy Number', 'Problema 4: Număr fericit')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'A happy number reaches 1 when repeatedly replaced by the sum of squares of its digits. If it enters a cycle not including 1, it is unhappy. Example: 19 is happy, 4 is not.',
          'Un număr fericit ajunge la 1 când este înlocuit repetat de suma pătratelor cifrelor sale. Dacă intră într-un ciclu care nu include 1, este nefericit. Exemplu: 19 este fericit, 4 nu.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc4} />
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">{t(
              'Use a set to track visited numbers. Repeatedly compute the sum of squared digits. If we reach 1, the number is happy. If we encounter a previously seen number, we\'ve found a cycle \u2014 the number is unhappy.',
              'Folosim o mulțime pentru a urmări numerele vizitate. Calculăm repetat suma pătratelor cifrelor. Dacă ajungem la 1, numărul este fericit. Dacă întâlnim un număr deja văzut, am găsit un ciclu \u2014 numărul este nefericit.'
            )}</p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm DigitSquareSum(x)
  sum \u2190 0
  while x > 0 do
    d \u2190 x mod 10
    sum \u2190 sum + d\u00B2
    x \u2190 \u230Ax / 10\u230B
  return sum

Algorithm IsHappy(n)
  seen \u2190 empty set
  while n \u2260 1 AND n \u2209 seen do
    add n to seen
    n \u2190 DigitSquareSum(n)
  return n == 1`}</Code>
          </div>
        }
      />

      {/* ═══ Problem 5 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 5: Even Fibonacci Sum', 'Problema 5: Suma Fibonacci pară')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Starting with 1 and 2, each Fibonacci term is the sum of the two preceding ones. Find the sum of even-valued Fibonacci terms not exceeding 4,000,000.',
          'Pornind cu 1 și 2, fiecare termen Fibonacci este suma celor doi termeni precedenți. Găsiți suma termenilor pari din secvența Fibonacci care nu depășesc 4.000.000.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc5} />
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">{t(
              'Generate Fibonacci numbers iteratively. For each term, if it is even, add it to a running sum. Stop when the current term exceeds the limit.',
              'Generăm numerele Fibonacci iterativ. Pentru fiecare termen, dacă este par, îl adăugăm la o sumă cumulativă. Ne oprim când termenul curent depășește limita.'
            )}</p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm EvenFibSum(limit)
  a \u2190 1, b \u2190 2
  sum \u2190 0
  while b \u2264 limit do
    if b mod 2 == 0 then
      sum \u2190 sum + b
    temp \u2190 a + b
    a \u2190 b
    b \u2190 temp
  return sum`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t('Answer: 4,613,732', 'Răspuns: 4.613.732')}</p>
            </Box>
          </div>
        }
      />

      {/* ═══ Problem 6 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 6: Hexagonal Numbers', 'Problema 6: Numere hexagonale')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'The n-th hexagonal number is h\u2099 = n(2n\u22121). First values: 1, 6, 15, 28, 45, 66, 91, 120, \u2026 Given an array, count how many elements are hexagonal numbers.',
          'Al n-lea număr hexagonal este h\u2099 = n(2n\u22121). Primele valori: 1, 6, 15, 28, 45, 66, 91, 120, \u2026 Dat un vector de numere, determinați câte sunt numere hexagonale.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc6} />
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">{t(
              'For each element, check if it is hexagonal. A number h is hexagonal iff k = (1 + \u221A(1 + 8h)) / 4 is a positive integer (derived by solving h = k(2k\u22121) as a quadratic in k).',
              'Pentru fiecare element, verificăm dacă este hexagonal. Un număr h este hexagonal dacă k = (1 + \u221A(1 + 8h)) / 4 este un număr natural pozitiv (derivat din rezolvarea ecuației h = k(2k\u22121) ca o ecuație de gradul 2 în k).'
            )}</p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm IsHexagonal(h)
  discriminant \u2190 1 + 8 * h
  sqrtDisc \u2190 \u230A\u221Adiscriminant\u230B
  if sqrtDisc\u00B2 \u2260 discriminant then
    return false
  if (1 + sqrtDisc) mod 4 \u2260 0 then
    return false
  return true

Algorithm CountHexagonal(a[1..n])
  count \u2190 0
  for i = 1 to n do
    if IsHexagonal(a[i]) then
      count \u2190 count + 1
  return count`}</Code>
          </div>
        }
      />

      {/* ═══ Problem 7 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 7: Shortest Path with \u2264 k Nodes', 'Problema 7: Drum de cost minim cu \u2264 k noduri')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Given a weighted directed graph with positive edge costs, find the minimum cost path between a source and destination, such that the path visits at most k nodes.',
          'Dat un graf orientat cu costuri pozitive ale arcelor, determinați drumul cu cel mai mic cost între o sursă și o destinație, astfel încât drumul să viziteze cel mult k noduri.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc7} />
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">{t(
              'Use a modified BFS/Dijkstra approach. Maintain a distance table dist[v][j] = minimum cost to reach node v using exactly j edges. Relax edges up to k times. This is essentially a bounded Bellman-Ford.',
              'Folosim o abordare BFS/Dijkstra modificată. Menținem un tabel de distanțe dist[v][j] = costul minim pentru a ajunge la nodul v folosind exact j arce. Relaxăm arcele de cel mult k ori. Aceasta este esențialmente un Bellman-Ford limitat.'
            )}</p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm ShortestPathBounded(G, s, d, k)
  dist[v][j] \u2190 \u221E for all v \u2208 V, j \u2208 {0..k}
  dist[s][0] \u2190 0
  for j = 1 to k do
    for each edge (u, v, w) \u2208 E do
      if dist[u][j-1] + w < dist[v][j] then
        dist[v][j] \u2190 dist[u][j-1] + w
  return min(dist[d][0], dist[d][1], \u2026, dist[d][k])`}</Code>
          </div>
        }
      />

      {/* ═══ Problem 8 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 8: N-Queens Problem', 'Problema 8: Problema celor N regine')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'State the N-Queens problem. Give an example of a problem instance.',
          'Enunțați problema celor N regine. Dați exemplu de o instanță a problemei.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc8} />
      <Toggle
        question={t('Show problem statement & example', 'Arată enunțul problemei și un exemplu')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Formal Statement', 'Enunț formal')}</p>
            <Box type="formula">
              <p className="text-sm">
                <strong>Input:</strong> N \u2208 \u2124\u207A {t('(board size)', '(dimensiunea tablei)')}<br />
                <strong>Output:</strong> {t(
                  'All arrangements of N queens on an N\u00D7N chessboard such that no two queens share the same row, column, or diagonal.',
                  'Toate aranjamentele a N regine pe o tablă de șah N\u00D7N astfel încât nicio pereche de regine să nu fie pe aceeași linie, coloană sau diagonală.'
                )}
              </p>
            </Box>
            <p className="font-bold mt-3 mb-1">{t('Example: N = 4', 'Exemplu: N = 4')}</p>
            <Code>{`. Q . .
. . . Q
Q . . .
. . Q .`}</Code>
            <p className="text-sm mt-1">{t(
              'Queens are placed at positions (1,2), (2,4), (3,1), (4,3). No two queens share a row, column, or diagonal. There are exactly 2 distinct solutions for N=4.',
              'Reginele sunt plasate la pozițiile (1,2), (2,4), (3,1), (4,3). Nicio pereche de regine nu este pe aceeași linie, coloană sau diagonală. Există exact 2 soluții distincte pentru N=4.'
            )}</p>
          </div>
        }
      />
    </>
  );
}
