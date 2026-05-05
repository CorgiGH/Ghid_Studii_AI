import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function TemaB() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: PS — Homework Theme B, 5 points [1p: B1] + [1p: B2] + [3p: B3]. Deadline: 2026-05-21.',
          'Sursă: PS — Temă pentru acasă - Partea B, 5 puncte [1p: B1] + [1p: B2] + [3p: B3]. Termen: 21.05.2026.'
        )}
      </p>

      <Box type="warning">
        <p className="font-bold mb-1">{t('Note', 'Notă')}</p>
        <p className="text-sm">
          {t(
            'Use N = 1000 simulations ("runs") for the Monte Carlo estimator unless otherwise specified.',
            'Folosiți N = 1000 de simulări ("runs") pentru estimatorul Monte Carlo, dacă nu este specificat altfel.'
          )}
        </p>
      </Box>

      {/* B1 */}
      <Section
        title={t('B1 (1p): Volume of a Triaxial Ellipsoid — Monte Carlo', 'B1 (1p): Volumul unui elipsoid triaxial — Monte Carlo')}
        id="ps-tema-b-b1"
        checked={!!checked['ps-tema-b-b1']}
        onCheck={() => toggleCheck('ps-tema-b-b1')}
      >
        <Box type="definition">
          <p className="text-sm mb-2">
            {t(
              'The triaxial ellipsoid E(a,b,c) = {(x,y,z) : x²/a² + y²/b² + z²/c² ≤ 1} ⊆ [-a,a]×[-b,b]×[-c,c] has exact volume (4/3)πabc.',
              'Elipsoidul triaxial E(a,b,c) = {(x,y,z) : x²/a² + y²/b² + z²/c² ≤ 1} ⊆ [-a,a]×[-b,b]×[-c,c] are volumul exact (4/3)πabc.'
            )}
          </p>
          <p className="text-sm">
            {t(
              'Estimate this volume using Monte Carlo for a = 2, b = 3, c ∈ {5, 6}. Use samples of size 10000, 20000, 50000 and compute relative errors.',
              'Estimați acest volum utilizând metoda Monte Carlo pentru a = 2, b = 3, c ∈ {5, 6}. Folosiți eșantioane de dimensiune 10000, 20000 și 50000 și calculați erorile relative.'
            )}
          </p>
        </Box>
        <Toggle
          question={t('Show approach', 'Arată abordarea')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# MC estimate of ellipsoid volume
ellipsoid_volume = function(a, b, c, N) {
  # Sample uniformly from bounding box [-a,a] x [-b,b] x [-c,c]
  x = runif(N, -a, a)
  y = runif(N, -b, b)
  z = runif(N, -c, c)
  # Count points inside ellipsoid
  inside = (x^2/a^2 + y^2/b^2 + z^2/c^2 <= 1)
  # Volume of bounding box * proportion inside
  V_box = (2*a) * (2*b) * (2*c)
  return(V_box * mean(inside))
}

# Exact volume:
exact_volume = function(a, b, c) (4/3) * pi * a * b * c

# Test for a=2, b=3, c=5:
for (N in c(10000, 20000, 50000)) {
  mc = ellipsoid_volume(2, 3, 5, N)
  exact = exact_volume(2, 3, 5)
  rel_error = abs(mc - exact) / abs(exact)
  cat("N =", N, "MC =", mc, "exact =", exact, "rel_error =", rel_error, "\n")
}
# Exact for c=5: (4/3)*pi*2*3*5 ≈ 125.664
# Exact for c=6: (4/3)*pi*2*3*6 ≈ 150.796`}</Code>
          }
        />
      </Section>

      {/* B2 */}
      <Section
        title={t('B2 (1p): MC Estimation of Improper Integrals', 'B2 (1p): Estimarea MC a integralelor improprii')}
        id="ps-tema-b-b2"
        checked={!!checked['ps-tema-b-b2']}
        onCheck={() => toggleCheck('ps-tema-b-b2')}
      >
        <Box type="definition">
          <p className="text-sm mb-1">
            {t(
              'Estimate the values of the following integrals and compare with the exact values:',
              'Estimați valorile următoarelor integrale și comparați rezultatul cu valorile exacte:'
            )}
          </p>
          <p className="text-sm mt-2">
            {t(
              '(a) ∫₀^∞ (sin x / x) dx = lim_{a→∞} ∫₀^a (sin x / x) dx = π/2',
              '(a) ∫₀^∞ (sin x / x) dx = lim_{a→∞} ∫₀^a (sin x / x) dx = π/2'
            )}
          </p>
          <p className="text-sm">
            {t(
              '(b) ∫₀^∞ x·e^(-x²) dx = 1/2',
              '(b) ∫₀^∞ x·e^(-x²) dx = 1/2'
            )}
          </p>
        </Box>
        <Toggle
          question={t('Show approach', 'Arată abordarea')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# (a) Estimate integral of sin(x)/x from 0 to a (large a ≈ inf)
# Use substitution or truncate at large a (e.g., a = 1000)
# Note: sin(x)/x -> 1 as x -> 0 (handle x=0 separately)
sinc_integral = function(N, a = 1000) {
  x = runif(N, 0, a)
  f = ifelse(x == 0, 1, sin(x)/x)
  return(a * mean(f))
}
# Exact: pi/2 ≈ 1.5708
cat("MC:", sinc_integral(100000), "Exact:", pi/2, "\n")

# (b) Estimate integral of x*exp(-x^2) from 0 to inf
# Use exponential importance sampling
xe_integral = function(N) {
  # u ~ Exp(1): pdf = exp(-u), sample with rexp(N, 1)
  u = rexp(N, 1)
  f = u * exp(-u^2)
  g = exp(-u)   # Exp(1) pdf
  return(mean(f/g))
}
# Exact: 1/2 = 0.5
cat("MC:", xe_integral(100000), "Exact:", 0.5, "\n")`}</Code>
          }
        />
      </Section>

      {/* B3 */}
      <Section
        title={t('B3 (3p): Social Network AI Account Removal Model', 'B3 (3p): Model eliminare conturi IA din rețea socială')}
        id="ps-tema-b-b3"
        checked={!!checked['ps-tema-b-b3']}
        onCheck={() => toggleCheck('ps-tema-b-b3')}
      >
        <Box type="definition">
          <p className="text-sm mb-2">
            {t(
              'In social network Y, AI-created accounts that must be closed appear daily. The number of such accounts found on day i, denoted Xᵢ, follows Poisson(min(Xᵢ₋₁/2, Xᵢ₋₂ - 1)). In the first two days, 40 and 36 accounts were found, respectively.',
              'În rețeaua socială Y apar zilnic conturi create de IA care trebuie închise conform reglementărilor din domeniu. Numărul de astfel de conturi găsite în ziua i, notat cu Xᵢ, este distribuit Poisson(min(Xᵢ₋₁/2, Xᵢ₋₂ - 1)). Presupunem că în primele două zile au fost găsite 40 și 36 astfel de conturi, respectiv.'
            )}
          </p>
        </Box>
        <p className="text-sm mt-2 mb-1 font-semibold">
          {t('(a) (1p) Find the average number of days after which all accounts will be removed.', '(a) (1p) Care este numărul mediu de zile după care toate conturile vor fi șterse?')}
        </p>
        <p className="text-sm mb-1 font-semibold">
          {t('(b) (1p) Estimate the probability that after 5 days all accounts have been removed.', '(b) (1p) Estimați probabilitatea ca după 5 zile toate conturile să fi fost îndepărtate.')}
        </p>
        <p className="text-sm mb-3 font-semibold">
          {t('(c) (1p) Estimate that same probability with error ≤ ±0.01 with probability 0.99.', '(c) (1p) Estimați din nou aceeași probabilitate cu o eroare de ±0.01 cu probabilitate 0.99.')}
        </p>
        <Toggle
          question={t('Show approach for (a) and (b)', 'Arată abordarea pentru (a) și (b)')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Single "run": days until account count reaches 0
Nr_days_B3 = function() {
  nr_days = 1;
  last = c(36, 40);  # last[1] = X_{i-1}, last[2] = X_{i-2}
  nr = 36;           # current day starts at X_1
  while (nr > 0) {
    lambda = min(last[1]/2, last[2] - 1);
    lambda = max(lambda, 0);  # lambda must be >= 0
    nr = rpois(1, lambda);
    last = c(nr, last[1]);
    nr_days = nr_days + 1;
  }
  return(nr_days);
}

# (a) Average days: N=1000 runs
MC_mean_days_B3 = function(N = 1000) {
  s = 0;
  for (i in 1:N) s = s + Nr_days_B3();
  return(s/N);
}

# (b) P(all accounts removed by day 5): proportion where Nr_days <= 5
MC_prob_5_B3 = function(N = 1000) {
  s = 0;
  for (i in 1:N) if (Nr_days_B3() <= 5) s = s + 1;
  return(s/N);
}

# (c) Find N for error <= 0.01, confidence 0.99
# p* from (b), then N >= p*(1-p*) * (z_{alpha/2}/epsilon)^2
# Conservative: N >= (1/4) * (z_{alpha/2}/epsilon)^2
alfa = 1 - 0.99
z = qnorm(alfa/2)    # note: negative, use abs
epsilon = 0.01
N_conservative = (1/4) * (z/epsilon)^2   # ≈ 16587
cat("Minimum N (conservative):", ceiling(N_conservative), "\n")`}</Code>
          }
        />
      </Section>
    </>
  );
}
