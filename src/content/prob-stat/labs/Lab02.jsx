import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Lab02() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: PS — Lab 2: Simulation. Monte Carlo Methods, UAIC 2026.',
          'Sursă: PS — Laborator 2: Simulare. Metode de tip Monte Carlo, UAIC 2026.'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('Lab 2: Monte Carlo Simulation', 'Laborator 2: Simulare Monte Carlo')}
        </p>
        <p className="text-sm">
          {t(
            'Monte Carlo methods use random sampling to estimate numerical quantities. Errors: absolute (|MC - actual|), relative (|MC - actual| / |actual|), percentage (relative * 100%). Remember to set working directory in RStudio.',
            'Metodele Monte Carlo folosesc eșantionare aleatoare pentru a estima cantități numerice. Erori: absolută (|MC - actual|), relativă (|MC - actual| / |actual|), procentuală (relativă * 100%). Nu uitați să setați directorul de lucru în RStudio.'
          )}
        </p>
      </Box>

      {/* Section 1: Estimating areas */}
      <Section
        title={t('1. Estimating Areas and Volumes', '1. Estimarea ariilor și a volumelor')}
        id="ps-lab2-areas"
        checked={!!checked['ps-lab2-areas']}
        onCheck={() => toggleCheck('ps-lab2-areas')}
      >
        <p className="text-sm mb-2">
          {t(
            'The unit disk has area pi. Cover it with a 2x2 square and estimate pi by counting random uniform points that fall inside the disk.',
            'Discul unitate are aria pi. Acoperim cu un pătrat 2x2 și estimăm pi numărând punctele uniforme aleatoare care cad în interiorul discului.'
          )}
        </p>
        <Code>{`disc_area = function(N) {
  N_C = 0;
  for (i in 1:N) {
    x = runif(1, -1, 1);
    y = runif(1, -1, 1);
    if (x*x + y*y <= 1)
      N_C = N_C + 1;
  }
  return(4*N_C/N);
}
# Try: disc_area(10000), disc_area(50000), disc_area(100000)`}</Code>
        <Box type="theorem">
          <p className="text-sm font-bold mb-1">{t('Proposed Exercises', 'Exerciții propuse')}</p>
          <p className="text-sm">
            {t(
              '1.1 Estimate the volume of the unit sphere (= 4π/3) using random samples of different sizes and compute absolute and relative errors.',
              '1.1 Estimați volumul sferei unitate (= 4π/3) folosind eșantioane de dimensiuni diferite și calculați erorile absolute și relative.'
            )}
          </p>
          <p className="text-sm mt-1">
            {t(
              '1.2* Estimate the area between parabola y = -2x²+5x-2 and Ox axis using 10000 uniform values. Exact area by integration, compute relative error. Hint: parabola intersects Ox at (1/2,0) and (2,0); vertex at (5/4, 9/8). Rectangular domain: [0,2]×[0,2].',
              '1.2* Estimați aria dintre parabola y = -2x²+5x-2 și axa Ox folosind 10000 valori uniforme. Aria exactă prin integrare, calculați eroarea relativă. Indicație: parabola intersectează Ox în (1/2,0) și (2,0); vârful în (5/4, 9/8). Domeniu rectangular: [0,2]×[0,2].'
            )}
          </p>
        </Box>
      </Section>

      {/* Section 2: MC integration */}
      <Section
        title={t('2. Monte Carlo Integration', '2. Integrarea Monte Carlo')}
        id="ps-lab2-integration"
        checked={!!checked['ps-lab2-integration']}
        onCheck={() => toggleCheck('ps-lab2-integration')}
      >
        <p className="text-sm mb-2">
          {t(
            'Estimate the integral of e^(-u²/2) from 0 to 10 using uniform random samples. Compute k=30 estimates to get mean and standard deviation of the estimator.',
            'Estimați integrala lui e^(-u²/2) de la 0 la 10 folosind eșantioane uniforme aleatoare. Calculați k=30 estimări pentru a obține media și deviația standard a estimatorului.'
          )}
        </p>
        <Toggle
          question={t('Show basic MC integration', 'Arată integrarea MC de bază')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Basic MC integration of integral from 0 to 10 of exp(-u^2/2) du
MC_integration = function(N) {
  sum = 0;
  for (i in 1:N) {
    u = runif(1, 0, 10);
    sum = sum + exp(-u*u/2);
  }
  return(10*sum/N);
}

# Average over k=30 estimates
MC_integr_average = function(k, N) {
  estimates = vector();
  for (i in 1:k)
    estimates[i] = MC_integration(N);
  print(mean(estimates));
  print(sd(estimates));
}

# Results:
# MC_integr_average(30, 20000)  → mean ≈ 1.249768, sd ≈ 0.02327472
# MC_integr_average(30, 50000)  → mean ≈ 1.253072, sd ≈ 0.01373724`}</Code>
          }
        />
        <Toggle
          question={t('Show improved MC (exponential importance sampling)', 'Arată MC îmbunătățit (eșantionare importanță exponențială)')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Improved MC for integral from 0 to +inf of exp(-u^2) du
# Exact value: sqrt(pi)/2 ≈ 0.8862269
# Uses exponential distribution (lambda=1) as importance distribution
MC_improved_integration = function(N) {
  sum = 0;
  for (i in 1:N) {
    u = rexp(1, 1);
    sum = sum + exp(-u*u)/exp(-u);
  }
  return(sum/N);
}

MC_imprvd_integr_average = function(k, N) {
  estimates = 0;
  for (i in 1:k)
    estimates[i] = MC_improved_integration(N);
  print(mean(estimates));
  print(sd(estimates));
}

# Results:
# MC_imprvd_integr_average(30, 20000) → mean ≈ 0.8858024, sd ≈ 0.002743676
# MC_imprvd_integr_average(30, 50000) → mean ≈ 0.8861285, sd ≈ 0.00213069`}</Code>
          }
        />
        <Box type="theorem">
          <p className="text-sm font-bold mb-1">{t('Proposed Exercises', 'Exerciții propuse')}</p>
          <p className="text-sm">
            {t(
              '2.1 Estimate (pick one or more): (a) ∫₀^π sin²x dx = π/2; (b) ∫₁⁴ eˣ dx = 51.87987; (c) ∫₀¹ dx/√(1-x²) = π/2; (d) ∫₁^∞ dx/(4x²-1) = ln(3/4). Compute absolute and relative errors.',
              '2.1 Estimați (alegeți unul sau mai multe): (a) ∫₀^π sin²x dx = π/2; (b) ∫₁⁴ eˣ dx = 51.87987; (c) ∫₀¹ dx/√(1-x²) = π/2; (d) ∫₁^∞ dx/(4x²-1) = ln(3/4). Calculați erorile absolute și relative.'
            )}
          </p>
          <p className="text-sm mt-1">
            {t(
              '2.2* Estimate ∫₀^∞ e^(-2u²) du = √(π/8) using improved MC with exponential distribution (λ=3, N=50000). Compare with exact value, compute errors. Determine 30 approximations, compute mean and std dev.',
              '2.2* Estimați ∫₀^∞ e^(-2u²) du = √(π/8) folosind MC îmbunătățit cu distribuție exponențială (λ=3, N=50000). Comparați cu valoarea exactă, calculați erorile. Determinați 30 aproximări, calculați media și deviația standard.'
            )}
          </p>
        </Box>
      </Section>

      {/* Section 3: Estimating means */}
      <Section
        title={t('3. Estimating Means (Bug Model)', '3. Estimarea mediilor (Model erori software)')}
        id="ps-lab2-means"
        checked={!!checked['ps-lab2-means']}
        onCheck={() => toggleCheck('ps-lab2-means')}
      >
        <p className="text-sm mb-2">
          {t(
            'Stochastic model: daily errors follow Poisson(λᵢ) where λᵢ = min(Xᵢ₋₂, Xᵢ₋₁). Starting values: X₁=27, X₂=31 errors. Estimate the average number of days until all errors are found using N=10000 runs.',
            'Model stochastic: erorile zilnice urmează Poisson(λᵢ) unde λᵢ = min(Xᵢ₋₂, Xᵢ₋₁). Valori inițiale: X₁=27, X₂=31 erori. Estimați numărul mediu de zile până când toate erorile sunt găsite folosind N=10000 simulări.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arată soluția')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Single "run": returns nr of days until errors reach 0
Nr_days = function() {
  nr_days = 1;
  last_errors = c(27, 31);
  nr_errors = 27;
  while (nr_errors > 0) {
    lambda = min(last_errors);
    nr_errors = rpois(1, lambda);
    last_errors = c(nr_errors, last_errors[1]);
    nr_days = nr_days + 1;
  }
  return(nr_days);
}

# MC estimator over N runs
MC_nr_days = function(N) {
  s = 0;
  for (i in 1:N)
    s = s + Nr_days();
  return(s/N);
}

# Result: ≈ 28.0686 → approximately 4 weeks`}</Code>
          }
        />
        <Box type="theorem">
          <p className="text-sm font-bold mb-1">{t('Proposed Exercises', 'Exerciții propuse')}</p>
          <p className="text-sm">
            {t(
              '3.1 Redo the exercise with λᵢ = mean of last 3 days (starting values: 9, 15, 13 errors).',
              '3.1 Refaceți exercițiul cu λᵢ = media ultimelor 3 zile (valori inițiale: 9, 15, 13 erori).'
            )}
          </p>
          <p className="text-sm mt-1">
            {t(
              '3.2* Social network PokPik model: Xᵢ ~ Poisson(min(Xᵢ₋₁, Xᵢ₋₂)). Starting: 32 and 25 fake news. Find average days until count drops below safety level 10 (N=100000 runs).',
              '3.2* Model rețea socială PokPik: Xᵢ ~ Poisson(min(Xᵢ₋₁, Xᵢ₋₂)). Inițial: 32 și 25 știri false. Găsiți numărul mediu de zile până când numărul scade sub nivelul sigur 10 (N=100000 simulări).'
            )}
          </p>
        </Box>
      </Section>

      {/* Section 4: Estimating probabilities */}
      <Section
        title={t('4. Estimating Probabilities (Bug Model, 3-day min)', '4. Estimarea probabilităților (Model erori, min 3 zile)')}
        id="ps-lab2-probs"
        checked={!!checked['ps-lab2-probs']}
        onCheck={() => toggleCheck('ps-lab2-probs')}
      >
        <p className="text-sm mb-2">
          {t(
            'New model: λᵢ = min(Xᵢ₋₃, Xᵢ₋₂, Xᵢ₋₁). Starting values: X₁=18, X₂=22, X₃=28 errors. Estimate: (a) probability of still having errors after 21 days using N=5000 runs; (b) find N for error ≤ ±0.01 with probability 0.95.',
            'Model nou: λᵢ = min(Xᵢ₋₃, Xᵢ₋₂, Xᵢ₋₁). Valori inițiale: X₁=18, X₂=22, X₃=28 erori. Estimați: (a) probabilitatea de a mai avea erori după 21 de zile folosind N=5000 simulări; (b) găsiți N pentru eroare ≤ ±0.01 cu probabilitate 0.95.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arată soluția')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Single run: days until errors = 0
Nr_days = function() {
  nr_days = 2;
  last_errors = c(18, 22, 28);
  nr_errors = 18;
  while (nr_errors > 0) {
    lambda = min(last_errors);
    nr_errors = rpois(1, lambda);
    last_errors = c(nr_errors, last_errors[1:2]);
    nr_days = nr_days + 1;
  }
  return(nr_days);
}

# MC: proportion of runs exceeding 21 days
MC_nr_days_21 = function(N) {
  s = 0;
  for (i in 1:N) {
    if (Nr_days() > 21)
      s = s + 1;
  }
  return(s/N);
}
# Result ≈ 0.246

# Find N for error ≤ 0.01, confidence 0.95
# Method 1 (using estimated p* = 0.246):
alfa = 1 - 0.95
z = qnorm(alfa/2)
epsilon = 0.01
p = 0.246
N_min = p*(1-p)*(z/epsilon)^2   # ≈ 7125.291

# Method 2 (conservative, p=1/2):
N_min = (1/4)*(z/epsilon)^2      # ≈ 9603.647`}</Code>
          }
        />
        <Box type="theorem">
          <p className="text-sm font-bold mb-1">{t('Proposed Exercises', 'Exerciții propuse')}</p>
          <p className="text-sm">
            {t(
              '4.1 Estimate P(X < Y²) where X~Geom(0.3) and Y~Geom(0.5) are independent. Then estimate the same probability with error ≤ ±0.005, confidence 0.95. How many runs needed?',
              '4.1 Estimați P(X < Y²) unde X~Geom(0.3) și Y~Geom(0.5) sunt independente. Estimați aceeași probabilitate cu eroare ≤ ±0.005, probabilitate 0.95. Câte simulări sunt necesare?'
            )}
          </p>
          <p className="text-sm mt-1">
            {t(
              '4.2* PokPik model: Xᵢ ~ Poisson(min(Xᵢ₋₁, Xᵢ₋₂)), starting: 32 and 25. N=100000 runs. (a) P(15 days sufficient to remove all fake news); (b) same probability with error ≤ ±0.01, confidence 0.95.',
              '4.2* Model PokPik: Xᵢ ~ Poisson(min(Xᵢ₋₁, Xᵢ₋₂)), inițial: 32 și 25. N=100000 simulări. (a) P(15 zile sunt suficiente pentru a înlătura toate știrile false); (b) aceeași probabilitate cu eroare ≤ ±0.01, probabilitate 0.95.'
            )}
          </p>
        </Box>
      </Section>
    </>
  );
}
