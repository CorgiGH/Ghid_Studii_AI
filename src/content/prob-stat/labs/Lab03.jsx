import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Lab03() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: PS — Lab 3: Random Algorithms, UAIC 2026.',
          'Sursă: PS — Laborator 3: Algoritmi Aleatori, UAIC 2026.'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('Lab 3: Random Algorithms', 'Laborator 3: Algoritmi Aleatori')}
        </p>
        <p className="text-sm">
          {t(
            'R has a rich collection of functions for generating random objects: integers, reals, permutations, and samples from named distributions. This lab covers random number generation and two types of randomized algorithms: Monte Carlo (error-bounded output) and Las Vegas (always correct, random runtime).',
            'R are o colecție vastă de funcții pentru generarea obiectelor aleatoare: numere întregi, reale, permutări și eșantioane din distribuții cunoscute. Acest laborator acoperă generarea numerelor aleatoare și două tipuri de algoritmi randomizați: Monte Carlo (output cu eroare mărginită) și Las Vegas (rezultat corect, timp aleator).'
          )}
        </p>
      </Box>

      {/* Section 1: Integer random numbers */}
      <Section
        title={t('1. Generating Random Integers', '1. Generarea numerelor aleatoare întregi')}
        id="ps-lab3-integers"
        checked={!!checked['ps-lab3-integers']}
        onCheck={() => toggleCheck('ps-lab3-integers')}
      >
        <p className="text-sm mb-2">
          {t(
            'Use sample() to generate random integers or permutations. By default replace=FALSE (sampling without replacement).',
            'Folosiți sample() pentru a genera numere întregi aleatoare sau permutări. Implicit replace=FALSE (eșantionare fără înlocuire).'
          )}
        </p>
        <Code>{`# Single random integer in [1, 300]:
x = sample(300, 1)

# 5 random integers in [200, 250]:
x = sample(200:250, 5)

# With replacement (repetitions allowed):
x = sample(30, 6, replace=T)
x = sample(20:40, 5, replace=T)

# Sample from a custom vector:
x = c(2.1, 3.2, 2.3, 2.5, 3.1, 2.9, 2.6, 2.2, 3.3)
sample(x, 5)               # without replacement
sample(x, 5, replace=T)    # with replacement

# Random permutation of 1..10:
sample(10)    # [1] 3 2 5 7 8 10 6 9 1 4

# See also: shuffle() from the permute package`}</Code>
      </Section>

      {/* Section 2: Real random numbers */}
      <Section
        title={t('2. Generating Random Real Numbers', '2. Generarea numerelor aleatoare reale')}
        id="ps-lab3-reals"
        checked={!!checked['ps-lab3-reals']}
        onCheck={() => toggleCheck('ps-lab3-reals')}
      >
        <p className="text-sm mb-2">
          {t(
            'Use runif(k, a, b) for k uniform random reals in [a, b].',
            'Folosiți runif(k, a, b) pentru k numere reale aleatoare uniforme în [a, b].'
          )}
        </p>
        <Code>{`# 10 uniform reals in [2, 4.5]:
runif(10, 2, 4.5)
# [1] 3.802909 3.072721 3.615275 2.378011 3.281129 4.269154
# [7] 2.611120 4.297596 2.418020 2.536075

# 4 uniform reals in [0, 1]:
x = runif(4, 0, 1)
# [1] 0.9979809 0.6081421 0.4032731 0.8214655`}</Code>
      </Section>

      {/* Section 3: Monte Carlo algorithm — matrix multiplication check */}
      <Section
        title={t('3. Monte Carlo Algorithm: Matrix Multiplication Check', '3. Algoritm Monte Carlo: Verificarea înmulțirii matricelor')}
        id="ps-lab3-mc-matrix"
        checked={!!checked['ps-lab3-mc-matrix']}
        onCheck={() => toggleCheck('ps-lab3-mc-matrix')}
      >
        <p className="text-sm mb-2">
          {t(
            'Write a function that checks whether A·B = C for matrices A, B, C using a random vector r with components 0 or 1. Check: ABr = Cr. Then amplify: reduce error probability below 2^(-k) by running k times.',
            'Scrieți o funcție care verifică dacă A·B = C pentru matricele A, B, C folosind un vector aleator r cu componente 0 sau 1. Verificare: ABr = Cr. Amplificare: reduceți probabilitatea de eroare sub 2^(-k) rulând de k ori.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arată soluția')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Create a 3x2 and 2x3 matrix for testing:
x = c(1, 3, 1, 4, 12, 7)
M = matrix(x, 3, 2)   # 3x2 matrix
N = matrix(x, 2, 3)   # 2x3 matrix

# Single MC check: returns TRUE if ABr == Cr
matrix_product = function(A, B, C) {
  n = nrow(A);
  r = matrix( , nrow = n, ncol = 1);
  x = matrix( , nrow = n, ncol = 1);
  y = matrix( , nrow = n, ncol = 1);
  r = sample(0:1, n, replace = TRUE);
  for (i in 1:n) { # x = Br
    x[i] = 0;
    for (j in 1:nrow(B))
      x[i] = (x[i] + B[i,j]*r[j])%%2;
  }
  for (i in 1:nrow(B)) { # y = Ax = ABr
    y[i] = 0;
    for (j in 1:n)
      y[i] = (y[i] + A[i,j]*x[j])%%2;
  }
  for (i in 1:n) { # x = Cr
    x[i] = 0;
    for (j in 1:n)
      x[i] = (x[i] + C[i,j]*r[j])%%2;
  }
  for (i in 1:n) { # verify ABr == Cr
    if (y[i] != x[i])
      return(FALSE);
  }
  return(TRUE);
}

# Amplification: run k times, error probability < 2^(-k)
matrix_product_reduce = function(A, B, C, k) {
  for (i in 1:k) {
    if (!matrix_product(A, B, C))
      return(FALSE);
  }
  return(TRUE);
}`}</Code>
          }
        />
      </Section>

      {/* Section 4: Las Vegas algorithm — game tree evaluation */}
      <Section
        title={t('4. Las Vegas Algorithm: Game Tree Evaluation', '4. Algoritm Las Vegas: Evaluarea arborelui de joc')}
        id="ps-lab3-lv-tree"
        checked={!!checked['ps-lab3-lv-tree']}
        onCheck={() => toggleCheck('ps-lab3-lv-tree')}
      >
        <p className="text-sm mb-2">
          {t(
            'Evaluate a game tree of depth 2h. The tree is given as a vector of 4^h leaf values. Nodes at odd levels are MAX; nodes at even levels are MIN. Evaluate recursively, reading only one child at random first.',
            'Evaluați un arbore de joc de adâncime 2h. Arborele este dat ca un vector cu cele 4^h valori din frunze. Nodurile de pe niveluri impare sunt MAX; nodurile de pe niveluri pare sunt MIN. Evaluați recursiv, citind mai întâi un singur copil aleator.'
          )}
        </p>
        <Toggle
          question={t('Show solution', 'Arată soluția')}
          showLabel={t('Show', 'Arată')}
          hideLabel={t('Hide', 'Ascunde')}
          answer={
            <Code>{`# Example leaves for h=2: 4^2 = 16 leaves
leaves = c(0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0)

# tree_eval(i, leaves): evaluate node i (1-indexed from root)
# Node i is MAX if floor(log2(i)) is odd, MIN if even
tree_eval = function(i, leaves) {
  a = runif(1, 0, 1); len = length(leaves);
  if (log(i,2) >= log(len,2) - 1) { # children of i are leaves
    if (a <= 0.5) {
      if (leaves[2*i - len + 1] == 0)
        return(leaves[2*i + 1 - len + 1]);
      return(1);}
    else {
      if (leaves[2*i + 1 - len + 1] == 0)
        return(leaves[2*i - len + 1]);
      return(1);}
  }
  if ((floor(log(i,2))%% 2 == 0)) { # node i is MIN type
    if (a <= 0.5) {
      if (tree_eval(2*i, leaves) == 1)
        return(tree_eval(2*i + 1, leaves));
      return(0);
    } else {
      if (tree_eval(2*i + 1, leaves) == 1)
        return(tree_eval(2*i, leaves));
      return(0);
    }
  }
  # ... (MAX node: symmetric, return 1 if either child is 1)
}

# Wrapper: evaluate from root (node 1)
game_tree_eval = function(leaves) {
  return(tree_eval(1, leaves));
}`}</Code>
          }
        />
        <Box type="theorem">
          <p className="text-sm font-bold mb-1">{t('Proposed Exercise', 'Exercițiu propus')}</p>
          <p className="text-sm">
            {t(
              '1. Write a function that simulates a finite random variable X with distribution: values x₁, x₂, ..., xₖ with probabilities p₁, p₂, ..., pₖ.',
              '1. Scrieți o funcție care simulează o variabilă aleatoare finită X cu distribuția: valori x₁, x₂, ..., xₖ cu probabilitățile p₁, p₂, ..., pₖ.'
            )}
          </p>
        </Box>
      </Section>
    </>
  );
}
