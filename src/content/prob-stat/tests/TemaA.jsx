import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function TemaA() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: PS — Homework Theme A, 5 points [2p: A1] + [2p: A2] + [1p: A3]. Deadline: 2026-05-21.',
          'Sursă: PS — Temă pentru acasă - Partea A, 5 puncte [2p: A1] + [2p: A2] + [1p: A3]. Termen: 21.05.2026.'
        )}
      </p>

      <Box type="warning">
        <p className="font-bold mb-1">{t('Submission requirement', 'Cerință de predare')}</p>
        <p className="text-sm">
          {t(
            'All solutions (the R functions and their calls) must be written in a single R script file.',
            'Soluțiile acestor exerciții (funcțiile R corespunzătoare și apelurile lor) vor fi scrise într-un singur script R.'
          )}
        </p>
      </Box>

      {/* A1 */}
      <Section
        title={t('A1 (2p): Laplace Distribution — Simulation & Density', 'A1 (2p): Distribuția Laplace — Simulare și densitate')}
        id="ps-tema-a-a1"
        checked={!!checked['ps-tema-a-a1']}
        onCheck={() => toggleCheck('ps-tema-a-a1')}
      >
        <Box type="definition">
          <p className="text-sm mb-2">
            {t(
              'The Laplace distribution has density:',
              'Distribuția Laplace are funcția de densitate definită prin:'
            )}
          </p>
          <Code>{`f(x) = (1 / (2b)) * exp(-|x - mu| / b)`}</Code>
          <p className="text-sm mt-2">
            {t(
              'where mu ∈ ℝ is a location parameter and b > 0 is a dispersion parameter.',
              'unde mu ∈ ℝ este un parametru de poziție, iar b > 0 este un parametru de dispersie.'
            )}
          </p>
        </Box>
        <p className="text-sm mt-2 mb-2">
          {t(
            '(a) (1p) Simulate n = 10000 observations from Laplace with mu = 0, b ∈ {1/2, 1, 2, 4}.',
            '(a) (1p) Simulați n = 10000 observații din distribuția Laplace cu mu = 0, b ∈ {1/2, 1, 2, 4}.'
          )}
        </p>
        <p className="text-sm mb-2">
          {t(
            '(b) (1p) For each parameter set, plot the theoretical density and overlay a histogram of the sample. Hint: use rlaplace() from the extraDistr package.',
            '(b) (1p) Pentru fiecare set de parametri, reprezentați grafic densitatea teoretică și suprapuneți o histogramă a eșantionului de mai sus. Indicație: folosiți rlaplace() din pachetul extraDistr.'
          )}
        </p>
        <Toggle
          question={t('Show hint / approach', 'Arată indiciu / abordare')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`library(extraDistr)
# For each b: simulate, then plot histogram with theoretical overlay
laplace_sim_plot = function(mu, b, n) {
  samples = rlaplace(n, mu = mu, sigma = b)
  hist(samples, breaks = 100, freq = FALSE,
       main = paste("Laplace mu=", mu, ", b=", b),
       xlab = "x", col = "lightgray", border = "white")
  x_grid = seq(min(samples), max(samples), length.out = 500)
  lines(x_grid, dlaplace(x_grid, mu = mu, sigma = b), col = "red", lwd = 2)
}

# Call for all b values (2x2 grid):
par(mfrow = c(2, 2))
for (b in c(0.5, 1, 2, 4))
  laplace_sim_plot(0, b, 10000)`}</Code>
          }
        />
      </Section>

      {/* A2 */}
      <Section
        title={t('A2 (2p): Law of Large Numbers — Hypergeometric & Cauchy', 'A2 (2p): Legea Numerelor Mari — Hipergeometrică și Cauchy')}
        id="ps-tema-a-a2"
        checked={!!checked['ps-tema-a-a2']}
        onCheck={() => toggleCheck('ps-tema-a-a2')}
      >
        <Box type="definition">
          <p className="text-sm">
            {t(
              'Verify (or explain the failure of) the Law of Large Numbers (LLN) for the following cases:',
              'Verificați (sau explicați eșecul) legii numerelor mari (LLM) pentru fiecare dintre următoarele cazuri:'
            )}
          </p>
        </Box>
        <p className="text-sm mt-3 mb-2 font-semibold">
          {t(
            '(a) (1p) Hypergeometric distribution with parameters n₁ ∈ {10, 40}, n₂ ∈ {7, 10}, k = 5 (see Course 5):',
            '(a) (1p) Distribuția hipergeometrică cu parametrii n₁ ∈ {10, 40}, n₂ ∈ {7, 10}, k = 5 (vezi Cursul 5):'
          )}
        </p>
        <p className="text-sm mb-1">
          {t(
            '— Compute sample means for sample sizes 10^i, i ∈ {1, 2, 3, 4, 5} and compare with E[X] = k·n₁/(n₁+n₂).',
            '— Calculați mediile eșantionului pentru dimensiuni ale acestuia de 10^i, i ∈ {1, 2, 3, 4, 5} și comparați cu E[X] = k·n₁/(n₁+n₂).'
          )}
        </p>
        <p className="text-sm mb-3">
          {t(
            '— Plot the sample means as a function of sample size.',
            '— Reprezentați grafic mediile în funcție de dimensiunea eșantionului.'
          )}
        </p>
        <p className="text-sm mb-2 font-semibold">
          {t(
            '(b) (1p) Cauchy distribution with parameters l = 0, s ∈ {1, 2, 5}:',
            '(b) (1p) Distribuția Cauchy cu parametrii l = 0, s ∈ {1, 2, 5}:'
          )}
        </p>
        <p className="text-sm mb-1">
          {t(
            '— Compute sample means for sample sizes 10^i, i ∈ {1, 2, 3, 4, 5}.',
            '— Calculați mediile eșantionului pentru dimensiuni ale acestuia de 10^i, i ∈ {1, 2, 3, 4, 5}.'
          )}
        </p>
        <p className="text-sm mb-2">
          {t(
            '— Plot sample means as a function of sample size.',
            '— Reprezentați grafic mediile în funcție de dimensiunea eșantionului.'
          )}
        </p>
        <Toggle
          question={t('Show hint', 'Arată indiciu')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Hint: use rhyper() for hypergeometric, rcauchy() for Cauchy
# rhyper(n, m, n2, k): m=n1 (success states), n2 (failure states), k (draws)

# Example structure for hypergeometric LLN verification:
LLN_hyper = function(n1, n2, k) {
  expected = k * n1 / (n1 + n2)
  sizes = 10^(1:5)
  means = sapply(sizes, function(n) mean(rhyper(n, n1, n2, k)))
  plot(log10(sizes), means, type = 'l',
       main = paste("Hypergeometric LLN: n1=", n1, "n2=", n2, "k=", k),
       xlab = "log10(sample size)", ylab = "sample mean")
  abline(h = expected, col = "red", lty = 2)
  cat("E[X] =", expected, "\n")
}

# Cauchy: LLN fails! (Cauchy has no finite mean)
LLN_cauchy = function(l, s) {
  sizes = 10^(1:5)
  means = sapply(sizes, function(n) mean(rcauchy(n, location = l, scale = s)))
  plot(log10(sizes), means, type = 'l',
       main = paste("Cauchy LLN (fails): l=", l, "s=", s),
       xlab = "log10(sample size)", ylab = "sample mean")
}`}</Code>
          }
        />
      </Section>

      {/* A3 */}
      <Section
        title={t('A3 (1p): Central Limit Theorem — Geometric Distribution', 'A3 (1p): Teorema Limită Centrală — Distribuția Geometrică')}
        id="ps-tema-a-a3"
        checked={!!checked['ps-tema-a-a3']}
        onCheck={() => toggleCheck('ps-tema-a-a3')}
      >
        <Box type="definition">
          <p className="text-sm">
            {t(
              'Verify the Central Limit Theorem (CLT) for the geometric distribution with p = 0.25:',
              'Verificați teorema limită centrală (TLC) pentru distribuția geometrică cu p = 0.25, adică:'
            )}
          </p>
        </Box>
        <p className="text-sm mt-2 mb-1">
          {t(
            '— For n = 5, 10, 30, 50, 100 (sample sizes), generate 10000 sample means.',
            '— Pentru n = 5, 10, 30, 50, 100 (dimensiuni ale eșantionului), generați 10000 medii de eșantion.'
          )}
        </p>
        <p className="text-sm mb-2">
          {t(
            '— Standardize and compare the empirical CDF with the CDF of the normal distribution.',
            '— Standardizați și comparați funcția de repartiție empirică cu funcția de repartiție a distribuției normale.'
          )}
        </p>
        <Toggle
          question={t('Show hint', 'Arată indiciu')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Hint: use rgeom() for geometric distribution
# For geometric(p): E[X] = (1-p)/p, Var[X] = (1-p)/p^2  (R uses 0-indexed geom)
# Or: E[X] = 1/p, Var[X] = (1-p)/p^2  (1-indexed version)

CLT_geom = function(p, n, N) {
  mu = (1 - p) / p      # mean (R's rgeom is 0-indexed)
  sigma = sqrt((1 - p) / p^2)
  means = replicate(N, mean(rgeom(n, p)))
  standardized = (means - mu) / (sigma / sqrt(n))
  # Compare empirical CDF with N(0,1) CDF:
  plot(ecdf(standardized),
       main = paste("CLT Geometric p=0.25, n=", n),
       col = "blue")
  curve(pnorm(x), add = TRUE, col = "red", lwd = 2)
}

par(mfrow = c(2, 3))
for (n in c(5, 10, 30, 50, 100))
  CLT_geom(0.25, n, 10000)`}</Code>
          }
        />
      </Section>

      {/* User's working R script */}
      <Section
        title={t("User's Working Script (tema_a.R)", "Scriptul de lucru al utilizatorului (tema_a.R)")}
        id="ps-tema-a-script"
        checked={!!checked['ps-tema-a-script']}
        onCheck={() => toggleCheck('ps-tema-a-script')}
      >
        <Box type="definition">
          <p className="text-sm mb-2">
            {t(
              'Current working R script for Theme A (partial — A1 completed):',
              'Scriptul R de lucru curent pentru Tema A (parțial — A1 completat):'
            )}
          </p>
        </Box>
        <Code>{`library(extraDistr)

mu <- 0
n  <- 10000

# (a) generate samples
par(mfrow = c(2, 2))
for (b in c(0.5,1,2,4)){
  samples <- rlaplace(n, mu = mu, sigma = b)
  # (b) histogram on density scale + overlay theoretical PDF curve
  hist(samples,
       breaks = 100,
       freq   = FALSE,
       main   = paste("Laplace mu=0, b=", b),
       xlab   = "x",
       col    = "lightgray",
       border = "white")
  x_grid <- seq(min(samples), max(samples), length.out = 500)
  lines(x_grid, dlaplace(x_grid, mu = mu, sigma = b), col = "red", lwd = 2)
}`}</Code>
      </Section>
    </>
  );
}
