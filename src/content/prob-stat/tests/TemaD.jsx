import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function TemaD() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: PS — Homework Theme D, 5 points. Deadline: 2026-05-21.',
          'Sursă: PS — Temă pentru acasă - Partea D, 5 puncte. Termen: 21.05.2026.'
        )}
      </p>

      {/* D */}
      <Section
        title={t('D (5p): Descriptive Statistics — EU Unemployment Data (2025)', 'D (5p): Statistică descriptivă — Date șomaj UE (2025)')}
        id="ps-tema-d-d1"
        checked={!!checked['ps-tema-d-d1']}
        onCheck={() => toggleCheck('ps-tema-d-d1')}
      >
        <Box type="definition">
          <p className="text-sm mb-2">
            {t(
              'The file unemployment.csv contains unemployment rates in EU countries (for age groups 15–24, 15–74, and 24–74). For all three age groups (for year 2025):',
              'Fișierul unemployment.csv conține ratele de șomaj în țările Uniunii Europene (pe grupele de vârstă 15–24, 15–74 și 24–74). Pentru toate cele trei categorii de vârstă (pentru anul 2025):'
            )}
          </p>
        </Box>

        <p className="text-sm mt-3 mb-1 font-semibold">
          {t(
            '(a) Create one histogram per age group using intervals (0,3%], (3%,6%], (6%,9%] etc.',
            '(a) Creați câte o histogramă folosind intervalele (0,3%], (3%,6%], (6%,9%] etc.'
          )}
        </p>
        <p className="text-sm mb-1 font-semibold">
          {t(
            '(b) Determine the five-number summary for each group.',
            '(b) Determinați sumarul celor cinci valori.'
          )}
        </p>
        <p className="text-sm mb-3 font-semibold">
          {t(
            '(c) Determine any outlier values using both methods described in the course and lab.',
            '(c) Determinați eventualele valori aberante prin cele două metode descrise la curs și laborator.'
          )}
        </p>

        <Box type="theorem">
          <p className="text-sm font-bold mb-1">{t('Hint', 'Indiciu')}</p>
          <p className="text-sm">
            {t(
              'Read data from file using read.csv(). The file has columns for country and age group columns.',
              'Pentru a citi datele din fișier folosiți funcția read.csv().'
            )}
          </p>
        </Box>

        <Toggle
          question={t('Show approach', 'Arată abordarea')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Read unemployment data
data = read.csv("unemployment.csv", header = TRUE)

# Check column names:
names(data)

# Assuming columns: country, age_15_24, age_15_74, age_24_74
# (adjust column names to match actual CSV)

# Histogram intervals: (0,3], (3,6], (6,9], (9,12], ... up to max
breaks = seq(0, ceiling(max(data$age_15_24, na.rm=T)/3)*3, by=3)

# (a) Histograms for each age group
par(mfrow = c(1, 3))

hist(data$age_15_24, breaks = breaks, right = TRUE, freq = TRUE,
     main = "Unemployment 15-24 (2025)",
     xlab = "Rate (%)", col = "lightblue")

hist(data$age_15_74, breaks = breaks, right = TRUE, freq = TRUE,
     main = "Unemployment 15-74 (2025)",
     xlab = "Rate (%)", col = "lightgreen")

hist(data$age_24_74, breaks = breaks, right = TRUE, freq = TRUE,
     main = "Unemployment 24-74 (2025)",
     xlab = "Rate (%)", col = "lightyellow")

# (b) Five-number summary
cat("=== Age group 15-24 ===\n"); summary(data$age_15_24)
cat("=== Age group 15-74 ===\n"); summary(data$age_15_74)
cat("=== Age group 24-74 ===\n"); summary(data$age_24_74)

# (c) Outlier detection — both methods
outliers_mean = function(x) {
  x = na.omit(x)
  m = mean(x); s = sd(x)
  x[x < m - 2*s | x > m + 2*s]
}

outliers_iqr = function(x) {
  x = na.omit(x)
  q = as.vector(quantile(x))
  Q1 = q[2]; Q3 = q[4]
  IQR_val = Q3 - Q1
  x[x < Q1 - 1.5*IQR_val | x > Q3 + 1.5*IQR_val]
}

for (col in c("age_15_24", "age_15_74", "age_24_74")) {
  cat("\n---", col, "---\n")
  cat("Outliers (mean method):", outliers_mean(data[[col]]), "\n")
  cat("Outliers (IQR method): ", outliers_iqr(data[[col]]), "\n")
}`}</Code>
          }
        />
      </Section>
    </>
  );
}
