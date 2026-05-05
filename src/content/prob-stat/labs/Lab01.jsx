import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Lab01() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: PS — Lab 1: R and RStudio Introduction, UAIC 2026.',
          'Sursă: PS — Laborator 1: Introducere în R și RStudio, UAIC 2026.'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('Lab 1: R and RStudio', 'Laborator 1: R și RStudio')}
        </p>
        <p className="text-sm">
          {t(
            'R is a statistical computing environment introduced in 1996, open-source. RStudio provides a graphical interface with four panels: script editor, environment/history, plots/help, and console. Sessions start with Session → Set Working Directory → Choose Directory.',
            'R este un mediu dedicat analizei statistice introdus în 1996, open-source. RStudio oferă o interfață grafică cu patru paneluri: editor de script, mediu/istoric, grafice/ajutor și consolă. Sesiunile încep cu Session → Set Working Directory → Choose Directory.'
          )}
        </p>
      </Box>

      {/* Section 1: RStudio session */}
      <Section
        title={t('1. RStudio Session Setup', '1. Configurarea sesiunii RStudio')}
        id="ps-lab1-session"
        checked={!!checked['ps-lab1-session']}
        onCheck={() => toggleCheck('ps-lab1-session')}
      >
        <p className="text-sm mb-2">
          {t(
            'A session must begin by setting the working directory and end by saving the workspace.',
            'O sesiune trebuie să înceapă prin setarea directorului de lucru și să se termine prin salvarea spațiului de lucru.'
          )}
        </p>
        <Code>{`# Set working directory (via menu: Session → Set Working Directory → Choose Directory)
# Save workspace: Session → Save Workspace As → choose "Save" at dialog`}</Code>
      </Section>

      {/* Section 2: Variables and types */}
      <Section
        title={t('2. Variables and Types', '2. Variabile și tipuri')}
        id="ps-lab1-variables"
        checked={!!checked['ps-lab1-variables']}
        onCheck={() => toggleCheck('ps-lab1-variables')}
      >
        <p className="text-sm mb-2">
          {t(
            'Variables in R are usually vectors or matrices. Types: numeric, character strings, boolean (TRUE/T, FALSE/F). Assignment uses = or <- (no spaces; <- recommended for compatibility).',
            'Variabilele în R sunt uzual vectori sau matrici. Tipuri: numeric, șiruri de caractere, boolean (TRUE/T, FALSE/F). Asignarea folosește = sau <- (fără spații; <- recomandat pentru compatibilitate).'
          )}
        </p>
        <Code>{`# Creating vectors
x = c(1, 3, 2, 15, 6, 21, 34, 54, 7)   # concatenation
x = c(T, T, F, T, F)                    # boolean vector
x = -5:13                               # integer sequence
x = seq(-3, 3, length=100)              # seq with length

# Accessing elements
x[4]        # 4th element
x[2:6]      # elements 2 to 6 inclusive
x[-3]       # all elements except the 3rd

# Edit a vector interactively
data.entry(x)`}</Code>
      </Section>

      {/* Section 3: Arithmetic operations */}
      <Section
        title={t('3. Arithmetic Operations and Predefined Functions', '3. Operații aritmetice și funcții predefinite')}
        id="ps-lab1-arithmetic"
        checked={!!checked['ps-lab1-arithmetic']}
        onCheck={() => toggleCheck('ps-lab1-arithmetic')}
      >
        <p className="text-sm mb-2">
          {t(
            'Operations on vectors are element-wise. R includes mathematical and statistical functions: length(), sort(), sqrt(), exp(), sin(), log(), mean(), sum() etc.',
            'Operațiile efectuate cu vectori sunt la nivelul fiecărei componente. R include funcții matematice și statistice: length(), sort(), sqrt(), exp(), sin(), log(), mean(), sum() etc.'
          )}
        </p>
        <Code>{`> x = c(1, 3, 2, 15, 6, 21, 34, 54, 7)
> y = c(22, 11, 32, 25, 54, 13, 27, 36, 2)
> x^2          # [1] 1 9 4 225 36 441 1156 2916 49
> x + y        # [1] 23 14 34 40 60 34 61 90 9
> length(x)    # [1] 9
> sort(x)      # [1] 1 2 3 6 7 15 21 34 54
> sqrt(x)
> exp(x)
> help(function_name)   # get help for any function`}</Code>
      </Section>

      {/* Section 4: User-defined functions */}
      <Section
        title={t('4. User-Defined Functions', '4. Funcții definite de utilizator')}
        id="ps-lab1-functions"
        checked={!!checked['ps-lab1-functions']}
        onCheck={() => toggleCheck('ps-lab1-functions')}
      >
        <p className="text-sm mb-2">
          {t(
            'Functions can be defined from the command line or written in a script file (File → New File → R Script). Save with Ctrl+S, load with Code → Source File (Ctrl+Shift+O) or source(script_file). Edit an existing function with fix(function_name).',
            'Funcțiile pot fi definite din linia de comandă sau scrise într-un fișier script (File → New File → R Script). Salvați cu Ctrl+S, încărcați cu Code → Source File (Ctrl+Shift+O) sau source(script_file). Editați o funcție existentă cu fix(function_name).'
          )}
        </p>
        <Toggle
          question={t('Show example: variance function', 'Arată exemplu: funcție dispersie')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`dispersie = function(x, p) {
  media = sum(p*x);
  dispersie = sum(p*(x - media)^2);
  return(dispersie)
}

# Call it:
y = c(23, 32, 31, 27, 27, 33, 25, 21)
q = c(1/8, 1/16, 1/8, 1/16, 1/8, 1/16, 1/8, 5/16)
dispersie(y, q)`}</Code>
          }
        />
        <Toggle
          question={t('Show example: control structures', 'Arată exemplu: structuri de control')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# if/else
if (condition) { statement } else { alternative }

# for loop
for (var in sequence) { statement }

# while loop
while (condition) { statement }

# Example: element-wise sqrt (using absolute value for negative elements)
vector_sqrt = function(x) {
  for (i in 1:length(x)) {
    if (x[i] > 0)
      x[i] = sqrt(x[i])
    else
      x[i] = sqrt(-x[i])
  }
}`}</Code>
          }
        />
      </Section>

      {/* Section 5: File I/O */}
      <Section
        title={t('5. File Manipulation', '5. Manipularea fișierelor cu date')}
        id="ps-lab1-files"
        checked={!!checked['ps-lab1-files']}
        onCheck={() => toggleCheck('ps-lab1-files')}
      >
        <p className="text-sm mb-2">
          {t(
            'Read a file containing a single data vector with scan(). Read a file with a header (table) using read.table(). Read CSV files using read.csv().',
            'Citiți un fișier care conține un singur vector de date cu scan(). Citiți un fișier cu antet (tabel) folosind read.table(). Citiți fișiere CSV folosind read.csv().'
          )}
        </p>
        <Code>{`# Single vector file (no header):
x = scan("my_file")

# File with header columns "col1" and "col2":
y = read.table("my_file", header = T)
x1 = y[['col1']]   # numeric data from column "col1"
x2 = y[['col2']]   # numeric data from column "col2"

# CSV file:
x = read.csv(file="date.csv", header = T)`}</Code>
      </Section>

      {/* Section 6: LLN exercises */}
      <Section
        title={t('6. Exercise: Law of Large Numbers (LLN) — Poisson & Gamma', '6. Exercițiu: Legea Numerelor Mari (LNM) — Poisson și Gamma')}
        id="ps-lab1-lln"
        checked={!!checked['ps-lab1-lln']}
        onCheck={() => toggleCheck('ps-lab1-lln')}
      >
        <p className="text-sm mb-2">
          {t(
            'For i.i.d. random variables X_i, the sample mean converges to E[X_i] as n grows (LLN). Verify LLN for Poisson(lambda) where E[X]=lambda, and Gamma(alpha, lambda) where E[X]=alpha/lambda.',
            'Pentru variabile aleatoare i.i.d. X_i, media eșantionului converge la E[X_i] când n crește (LNM). Verificați LNM pentru Poisson(lambda) unde E[X]=lambda, și Gamma(alpha, lambda) unde E[X]=alpha/lambda.'
          )}
        </p>
        <Toggle
          question={t('Show solutions', 'Arată soluțiile')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# LLN for Poisson (simple version)
LLN_Poisson = function(lambda, n) {
  return(mean(rpois(n, lambda)));
}

# LLN for Gamma (simple version)
LLN_Gamma = function(alfa, lambda, n) {
  return(mean(rgamma(n, alfa, lambda)));
}

# Proposed exercises:
# 2.1a: X_i : Exponential(lambda) — E[X_i] = 1/lambda — use rexp()
# 2.1b: X_i : B(m,p) — E[X_i] = mp — use rbinom()
# 2.2*: X_i : Student(r) — E[X_i] = 0 — compare for n in {1000,10000,100000,1000000}, r in {2,3,4,5}`}</Code>
          }
        />
      </Section>

      {/* Section 7: CLT exercise */}
      <Section
        title={t('7. Exercise: Central Limit Theorem (CLT) — Poisson', '7. Exercițiu: Teorema Limită Centrală (TLC) — Poisson')}
        id="ps-lab1-clt"
        checked={!!checked['ps-lab1-clt']}
        onCheck={() => toggleCheck('ps-lab1-clt')}
      >
        <p className="text-sm mb-2">
          {t(
            'For i.i.d. X_i with mean mu and variance sigma^2, the standardized sample mean follows N(0,1) for large n. Verify CLT for Poisson(lambda) where E[X]=Var[X]=lambda. Recommended: n >= 30, N=10000, z in {0, 1, 1.5, 2}.',
            'Pentru X_i i.i.d. cu medie mu și varianță sigma^2, media eșantionului standardizată urmează N(0,1) pentru n mare. Verificați TLC pentru Poisson(lambda) unde E[X]=Var[X]=lambda. Recomandat: n >= 30, N=10000, z din {0, 1, 1.5, 2}.'
          )}
        </p>
        <Toggle
          question={t('Show CLT Poisson solution', 'Arată soluția TLC Poisson')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`CLT_Poisson = function(lambda, n, N, z) {
  expectation = lambda;
  st_dev = sqrt(lambda);
  upper_bound = z * st_dev/sqrt(n) + expectation;
  sum = 0;
  for (i in 1:N) {
    x_n = mean(rpois(n, lambda));
    if (x_n <= upper_bound) {
      sum = sum + 1;
    }
  }
  return(sum/N);
}
# Compare CLT_Poisson(lambda, n, N, z) with pnorm(z)

# Proposed exercises:
# 3.1: X_i : Exponential(lambda) — E[X]=1/lambda, Var[X]=1/lambda^2 — use rexp()
# 3.2*: X_i : Gamma(alpha,lambda) — E[X]=alpha/lambda, Var[X]=alpha/lambda^2
#       n=50, N in {5000,10000,20000}, z in {-1.5, 0, 1.5}`}</Code>
          }
        />
      </Section>
    </>
  );
}
