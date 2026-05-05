import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function TemaC() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: PS — Homework Theme C, 5 points [3p: C1] + [2p: C2]. Deadline: 2026-05-21.',
          'Sursă: PS — Temă pentru acasă - Partea C, 5 puncte [3p: C1] + [2p: C2]. Termen: 21.05.2026.'
        )}
      </p>

      {/* C1 */}
      <Section
        title={t('C1 (3p): Randomized Median Algorithm (from Course 9)', 'C1 (3p): Algoritmul aleator pentru mediană (din Cursul 9)')}
        id="ps-tema-c-c1"
        checked={!!checked['ps-tema-c-c1']}
        onCheck={() => toggleCheck('ps-tema-c-c1')}
      >
        <Box type="definition">
          <p className="text-sm">
            {t(
              'Implement the randomized algorithm for finding the median as presented in Course 9.',
              'Implementați algoritmul pentru determinarea medianei din cursul 9.'
            )}
          </p>
        </Box>
        <p className="text-sm mt-3 mb-2">
          {t(
            'The randomized median algorithm (Motwani & Raghavan style):',
            'Algoritmul aleator pentru mediană (stilul Motwani & Raghavan):'
          )}
        </p>
        <Toggle
          question={t('Show approach / structure', 'Arată abordarea / structura')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Randomized median algorithm (Course 9 approach)
# Key idea: sample a subset S of size ~sqrt(n)*log(n),
# sort S, identify a "band" [d, u] around the expected median position,
# count elements of original array that fall in this band.

random_median = function(x) {
  n = length(x)
  # Step 1: sample sqrt(n)*log(n) elements (with replacement)
  k = ceiling(sqrt(n) * log(n))
  S = sample(x, k, replace = TRUE)
  S = sort(S)

  # Step 2: find band boundaries in S
  # d = S[k/2 - sqrt(k)] and u = S[k/2 + sqrt(k)] (approx)
  lo = max(1, floor(k/2 - sqrt(k)))
  hi = min(k, ceiling(k/2 + sqrt(k)))
  d = S[lo]
  u = S[hi]

  # Step 3: collect elements of x in [d, u]
  C = x[x >= d & x <= u]

  # Step 4: count elements < d
  l_d = sum(x < d)

  # Step 5: find the median within C
  target = ceiling(n/2) - l_d
  if (target < 1 || target > length(C)) {
    # Fallback: return exact median (band failed)
    return(median(x))
  }
  C_sorted = sort(C)
  return(C_sorted[target])
}

# Test:
x = sample(1:1000, 100)
cat("Randomized median:", random_median(x), "\n")
cat("Exact median:     ", median(x), "\n")`}</Code>
          }
        />
      </Section>

      {/* C2 */}
      <Section
        title={t('C2 (2p): Randomized Polynomial Identity Testing with Amplification', 'C2 (2p): Testarea identității polinoamelor cu amplificare')}
        id="ps-tema-c-c2"
        checked={!!checked['ps-tema-c-c2']}
        onCheck={() => toggleCheck('ps-tema-c-c2')}
      >
        <Box type="definition">
          <p className="text-sm mb-2">
            {t(
              'Given f(X), g(X) and h(X) — three polynomials of degree n, n, and 2n respectively. The following randomized algorithm tests if f·g = h:',
              'Fie f(X), g(X) și h(X) trei polinoame de grade n, n și, respectiv, 2n. Următorul algoritm aleator testează egalitatea f·g = h:'
            )}
          </p>
          <Code>{`choose uniformly p ∈ {1, 2, ..., 3n}
if (f(p) * g(p) == h(p)) then
  return true
else
  return false`}</Code>
          <p className="text-sm mt-2">
            {t(
              'The algorithm has error probability ≤ 2/3. Implement this algorithm and then apply amplification to reduce the error probability below 10⁻⁵. Hint: a polynomial of degree k can be represented as an array of k+1 coefficients.',
              'Algoritmul are probabilitatea de a greși ≤ 2/3. Implementați mai întâi algoritmul de mai sus și apoi aplicați metoda amplificării pentru a reduce probabilitatea de a greși sub 10⁻⁵ știind că algoritmul are probabilitatea de a greși ≤ 2/3. Indicație: Un polinom de grad k poate fi reprezentat printr-un tablou de lungime k+1 al coeficienților.'
            )}
          </p>
        </Box>
        <Toggle
          question={t('Show approach', 'Arată abordarea')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Polynomial evaluation at point p: coefficients c[1..k+1] for c[1] + c[2]*p + ...
poly_eval = function(coefs, p) {
  result = 0
  for (i in 1:length(coefs))
    result = result + coefs[i] * p^(i-1)
  return(result)
}

# Single randomized test: f*g == h at random point p in {1..3n}
poly_identity_test = function(f_coefs, g_coefs, h_coefs) {
  n = length(f_coefs) - 1   # degree of f (and g)
  p = sample(1:(3*n), 1)
  fp = poly_eval(f_coefs, p)
  gp = poly_eval(g_coefs, p)
  hp = poly_eval(h_coefs, p)
  return(fp * gp == hp)
}

# Amplification: run k times
# Error prob <= (2/3)^k; want < 10^-5
# (2/3)^k < 10^-5  =>  k > log(10^-5)/log(2/3) ≈ 27.9  =>  k = 28
amplified_poly_test = function(f_coefs, g_coefs, h_coefs, k = 28) {
  for (i in 1:k) {
    if (!poly_identity_test(f_coefs, g_coefs, h_coefs))
      return(FALSE)
  }
  return(TRUE)
}

# Compute required k:
k_needed = ceiling(log(1e-5) / log(2/3))
cat("Minimum k for error < 1e-5:", k_needed, "\n")  # 28

# Example: f = 1 + 2x, g = 1 + 3x, h = 1 + 5x + 6x^2
f = c(1, 2)
g = c(1, 3)
h = c(1, 5, 6)  # correct: f*g
cat("Identity holds:", amplified_poly_test(f, g, h), "\n")  # TRUE`}</Code>
          }
        />
      </Section>
    </>
  );
}
