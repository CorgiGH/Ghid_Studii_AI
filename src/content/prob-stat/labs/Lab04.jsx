import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Lab04() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: PS — Lab 4: Descriptive Statistics, UAIC 2026.',
          'Sursă: PS — Laborator 4: Statistică Descriptivă, UAIC 2026.'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('Lab 4: Descriptive Statistics', 'Laborator 4: Statistică Descriptivă')}
        </p>
        <p className="text-sm">
          {t(
            'Descriptive statistics describes the main features of samples. Univariate analysis studies a single attribute (variable). Attributes can be discrete or continuous (quantitative) or ordinal/nominal (qualitative). Remember to set working directory in RStudio.',
            'Statistica descriptivă descrie trăsăturile principale ale eșantioanelor. Analiza univariată studiază un singur atribut (variabilă). Atributele pot fi discrete sau continue (cantitative) sau ordinale/nominale (calitative). Nu uitați să setați directorul de lucru în RStudio.'
          )}
        </p>
      </Box>

      {/* Section 1: Graphical representations */}
      <Section
        title={t('1. Graphical Representation of Sample Distribution', '1. Reprezentarea grafică a distribuției eșantionului')}
        id="ps-lab4-graphs"
        checked={!!checked['ps-lab4-graphs']}
        onCheck={() => toggleCheck('ps-lab4-graphs')}
      >
        <p className="text-sm mb-2">
          {t(
            'Three main graphical types: stem-and-leaf plot (for small discrete/continuous data), histogram (frequency bars over intervals), bar chart/Pareto (for discrete/categorical data using barplot()).',
            'Trei tipuri principale de reprezentări grafice: stem-and-leaf plot (pentru date discrete/continue mici), histogramă (coloane de frecvențe pe intervale), diagrama cu bare/Pareto (pentru date discrete/categoriale folosind barplot()).'
          )}
        </p>
        <Toggle
          question={t('Show: stem-and-leaf plot', 'Arată: stem-and-leaf plot')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Stem-and-leaf plot: digit before decimal = stem, digit after = leaf
x = c(11, 14, 21, 32, 17, 24, 21, 35, 52, 44, 21, 28, 36, 49, 41, 19, 20, 34, 37, 29)
stem(x)
# The decimal point is 1 digit(s) to the right of the |
# 1 | 1479
# 2 | 0111489
# 3 | 24567
# 4 | 149
# 5 | 2`}</Code>
          }
        />
        <Toggle
          question={t('Show: histogram', 'Arată: histogramă')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Read sample from file:
sample = scan("sample1.txt")
min = min(sample)   # [1] 41
max = max(sample)   # [1] 96

# Histogram with explicit interval breaks:
interval = seq(40, 100, 10)
hist(sample, breaks = interval, right = F, freq = T)

# Histogram with 6 intervals, blue bars:
a = 6
hist(sample, breaks = a, right = F, col = "blue")

# Parameters:
# breaks: vector of interval endpoints OR number of intervals
# right=F: intervals are [a,b) open on the right
# freq=T: show frequencies (TRUE) or densities (FALSE)`}</Code>
          }
        />
        <Toggle
          question={t('Show: bar chart (Pareto)', 'Arată: diagramă cu bare (Pareto)')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Bar chart for discrete/categorical data
frecv = c(9, 8, 12, 3, 17, 41, 29, 35, 32, 40, 19, 8)
barplot(frecv, space = 0)

# CSV with columns 'country' and 'rate':
tablou = read.csv("unemploy2012.csv", header = T, sep = ';')
rate = tablou[['rate']]
hist(rate, breaks = c(0,4,6,8,10,12,14,30), right = F, freq = T)`}</Code>
          }
        />
        <Box type="theorem">
          <p className="text-sm font-bold mb-1">{t('Proposed Exercises', 'Exerciții propuse')}</p>
          <p className="text-sm">{t('1.1 Stem-and-leaf plot for sample from "sample1.txt".', '1.1 Stem-and-leaf plot pentru eșantionul din fișierul "sample1.txt".')}</p>
          <p className="text-sm mt-1">{t('1.2 "unemploy2012.csv" has unemployment rates with columns "country" and "rate". Plot histogram using intervals (0,4], (4,6], (6,8], (8,10], (10,12], (12,14], (14,30].', '1.2 "unemploy2012.csv" conține rate ale șomajului cu coloanele "country" și "rate". Reprezentați histograma folosind intervalele (0,4], (4,6], (6,8], (8,10], (10,12], (12,14], (14,30].')}</p>
          <p className="text-sm mt-1">{t('1.3* "life_expect.csv" has life expectancy with columns "country", "female", "male". Plot histograms for both groups split into 7 intervals.', '1.3* "life_expect.csv" conține speranța de viață cu coloanele "country", "female", "male". Reprezentați histogramele pentru ambele grupe, împărțind eșantioanele în câte 7 intervale.')}</p>
        </Box>
      </Section>

      {/* Section 2: Central tendency */}
      <Section
        title={t('2. Central Tendency Analysis', '2. Analiza tendinței centrale')}
        id="ps-lab4-central"
        checked={!!checked['ps-lab4-central']}
        onCheck={() => toggleCheck('ps-lab4-central')}
      >
        <p className="text-sm mb-2">
          {t(
            'Key measures: Mean (M = arithmetic average, R: mean()), Median (Me = middle value after sorting, R: median()), Mode (most frequent value — no standard R function, use packages).',
            'Măsuri cheie: Media (M = medie aritmetică, R: mean()), Mediana (Me = valoarea din mijloc după sortare, R: median()), Modul (cea mai frecventă valoare — nicio funcție standard R, folosiți pachete).'
          )}
        </p>
        <Code>{`# Mean: M = (1/n) * sum(x_k)
mean(esantion)

# Median:
# - odd n: middle value x_{k+1}
# - even n: average of two middle values (x_k + x_{k+1})/2
median(esantion)

# Example:
# Sample: 3, 6, 4, 3, 6, 7, 8, 5  →  M = 42/8 = 5.25
# Sorted: 3, 3, 4, 5, 6, 6, 7, 8  →  Me = (5+6)/2 = 5.5

# Mode: value with highest frequency (no built-in)
# For bimodal: values 3 and 6 in {3,6,4,3,6,7,8,5,3,6}`}</Code>
        <Box type="theorem">
          <p className="text-sm font-bold mb-1">{t('Proposed Exercises', 'Exerciții propuse')}</p>
          <p className="text-sm">{t('2.1 Compute mean and median for the sample from "sample1.txt".', '2.1 Calculați media și mediana eșantionului din fișierul "sample1.txt".')}</p>
          <p className="text-sm mt-1">{t('2.2 Compute mean and median for samples from "life_expect.csv".', '2.2 Calculați media și mediana eșantioanelor din fișierul "life_expect.csv".')}</p>
          <p className="text-sm mt-1">{t('2.3* Write a function to compute the mode for a given sample.', '2.3* Scrieți o funcție care să calculeze modul pentru un eșantion dat.')}</p>
        </Box>
      </Section>

      {/* Section 3: Spread and outliers */}
      <Section
        title={t('3. Spread and Outliers', '3. Împrăștierea și valorile aberante')}
        id="ps-lab4-spread"
        checked={!!checked['ps-lab4-spread']}
        onCheck={() => toggleCheck('ps-lab4-spread')}
      >
        <p className="text-sm mb-2">
          {t(
            'Spread measures: Range (max - min), Standard deviation s (R: sd()), Variance s² (R: var()), Quartiles Q1/Q3 (R: quantile()), IQR = Q3 - Q1. Outliers: values outside (M-2s, M+2s) or outside (Q1-1.5·IQR, Q3+1.5·IQR).',
            'Măsuri de împrăștiere: Domeniul (max - min), Deviația standard s (R: sd()), Dispersia s² (R: var()), Quartilele Q1/Q3 (R: quantile()), IQR = Q3 - Q1. Valori aberante: valori în afara (M-2s, M+2s) sau (Q1-1.5·IQR, Q3+1.5·IQR).'
          )}
        </p>
        <Toggle
          question={t('Show spread formulas and R code', 'Arată formulele și codul R')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Standard deviation: s = sqrt(sum((x_k - M)^2) / (n-1))
sd(esantion)

# Variance: s^2
var(esantion)

# Quartiles (returns: min, Q1, Me, M, Q3, max):
quantile(esantion)
# Get Q_i: as.vector(quantile(esantion))[i+1]

# IQR = Q3 - Q1
IQR = as.vector(quantile(esantion))[4] - as.vector(quantile(esantion))[2]

# summary(): min, Q1, median, mean, Q3, max
sample = c(9, 8, 12, 3, 17, 41, 29, 35, 32, 40, 19, 8)
summary(sample)
# Min. 1st Qu. Median Mean 3rd Qu. Max.
# 3.00   8.75  18.00 21.08   32.75 41.00`}</Code>
          }
        />
        <Toggle
          question={t('Show outliers detection (mean method)', 'Arată detectarea valorilor aberante (metoda mediei)')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Outliers using std deviation: values outside (M - 2s, M + 2s)
sample = c(1, 91, 38, 72, 13, 27, 11, 85, 5, 22, 20, 19, 8, 17, 11, 15, 13, 23, 14, 17)
m = mean(sample)
s = sd(sample)
outliers = vector()
j = 0
for (i in 1:length(sample)) {
  if (sample[i] < m - 2*s || sample[i] > m + 2*s) {
    j = j + 1
    outliers[j] = sample[i]
  }
}
outliers   # [1] 91 85`}</Code>
          }
        />
        <Box type="theorem">
          <p className="text-sm font-bold mb-1">{t('Proposed Exercises', 'Exerciții propuse')}</p>
          <p className="text-sm">{t('3.1 Write function outliers_mean(esantion) to find outliers using std deviation method. Verify on the example above.', '3.1 Scrieți funcția outliers_mean(esantion) care determină valorile aberante folosind prima metodă expusă. Verificați pe eșantionul de mai sus.')}</p>
          <p className="text-sm mt-1">{t('3.2 Write function outliers_iqr(esantion) to find outliers using the IQR method (1.5·IQR rule).', '3.2 Scrieți în același script funcția outliers_iqr(esantion) care determină valorile aberante folosind cea de-a doua metodă (regula 1.5·IQR).')}</p>
          <p className="text-sm mt-1">{t('3.3 Apply summary() and both outlier functions to the sample from "sample2.txt". Are results similar?', '3.3 Aplicați funcția summary() dar și funcțiile de mai sus eșantionului din fișierul "sample2.txt". Rezultatele sunt similare?')}</p>
        </Box>
      </Section>
    </>
  );
}
