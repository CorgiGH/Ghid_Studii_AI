import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Seminar03() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-3 text-sm opacity-80">{t('Source: OS Lab #3 - Working with shell scripts in Linux, Cristian Vidrascu, UAIC', 'Sursa: SO Laborator #3 - Lucrul la linia de comanda in Linux, cu fisiere de comenzi, Cristian Vidrascu, UAIC')}</p>

      {/* Roadmap */}
      <Box type="definition">
        <p className="font-bold mb-2">{t('Roadmap', 'Parcurs')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>{t('a) First script examples (review from Lab 2)', 'a) Primele exemple de script-uri (recapitulare din Lab 2)')}</li>
          <li>{t('b) Iterative math scripts (loops, conditionals, bc)', 'b) Script-uri cu calcule matematice iterative (bucle, conditii, bc)')}</li>
          <li>{t('c) Recursive math scripts (recursive functions, script self-calls)', 'c) Script-uri cu calcule matematice recursive (functii recursive, auto-apel de script)')}</li>
          <li>{t('d) Cooperating scripts (pipes, environment variables)', 'd) Script-uri cooperante (pipe-uri, variabile de mediu)')}</li>
          <li>{t('e) File processing scripts (gcc, g++, SPMD)', 'e) Script-uri de procesare a fisierelor (gcc, g++, SPMD)')}</li>
          <li>{t('f) Recursive filesystem traversal scripts (MyFind)', 'f) Script-uri cu parcurgeri recursive ale sistemului de fisiere (MyFind)')}</li>
          <li>{t('g) System resource processing scripts (users, groups)', 'g) Script-uri de procesare a altor resurse (utilizatori, grupuri)')}</li>
        </ul>
      </Box>

      <Box type="warning">
        <p className="text-sm">
          {t(
            'Important: The main purpose of bash scripting is NOT mathematical calculations (other languages are better for that), but automating command-line work in Unix systems -- system administration tasks, resource manipulation (files, processes, etc.). The math examples below are used to illustrate bash syntax and semantics.',
            'Important: Scopul principal al limbajului de scripting bash NU este acela de a face calcule matematice (alte limbaje sunt mai adecvate), ci de a permite automatizarea lucrului la linia de comanda in sistemele Unix -- sarcini de administrare, manipularea resurselor (fisiere, procese, etc.). Exemplele matematice de mai jos sunt folosite pentru a ilustra sintaxa si semantica bash.'
          )}
        </p>
      </Box>

      {/* ── b) Iterative Math Scripts ── */}
      <h3 className="text-lg font-bold mt-6 mb-3">{t('b) Iterative Math Scripts', 'b) Script-uri cu calcule matematice iterative')}</h3>

      {/* Iterative math #2: Arithmetic Mean */}
      <Section title={t('Iterative math #2: Arithmetic Mean', 'Iterative math #2: Media aritmetica')} id="s3-arith-mean" checked={!!checked['s3-arith-mean']} onCheck={() => toggleCheck('s3-arith-mean')}>
        <p>{t(
          'Write a script that computes the arithmetic mean of n numbers. The values for n and the n numbers are taken as command-line arguments or read with the read command if not provided.',
          'Sa se scrie un script care calculeaza media aritmetica a n numere. Valorile pentru n si cele n numere se preiau ca argumente din linia de comanda sau se citesc cu comanda read daca nu sunt date.'
        )}</p>

        <Toggle
          question={t('Solution v1: let (integer only -- inexact!)', 'Solutia v1: let (doar intregi -- inexact!)')}
          answer={
            <div>
              <p className="text-sm mb-2">{t('Using let -- integer division only, result is NOT exact:', 'Folosind let -- doar impartire intreaga, rezultatul NU este exact:')}</p>
              <Code>{`#!/bin/bash
# ArithmeticMean_v1.sh -- using let (integer only!)
if [ $# -ge 2 ]; then
  n=$1; shift
  let sum=0
  for i in $*; do
    let sum=sum+i
  done
  let mean=sum/n
  echo "Mean = $mean (integer division!)"
else
  echo "Usage: $0 n val1 val2 ... valn"
fi`}</Code>
            </div>
          }
          showLabel={t('Show v1', 'Arata v1')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Toggle
          question={t('Solution v2: bc for floating-point', 'Solutia v2: bc pentru virgula mobila')}
          answer={
            <div>
              <p className="text-sm mb-2">{t('Using bc -l for floating-point arithmetic:', 'Folosind bc -l pentru aritmetica in virgula mobila:')}</p>
              <Code>{`#!/bin/bash
# ArithmeticMean_v2.sh -- using bc for floating-point
if [ $# -ge 2 ]; then
  n=$1; shift
  let sum=0
  for i in $*; do
    let sum=sum+i
  done
  mean=$(echo "scale=5; $sum / $n" | bc -l)
  echo "Mean = $mean"
else
  echo "Usage: $0 n val1 val2 ... valn"
fi`}</Code>
              <p className="text-sm mt-2">{t('Note: scale=5 sets bc to use 5 decimal places.', 'Nota: scale=5 seteaza bc sa foloseasca 5 cifre zecimale.')}</p>
            </div>
          }
          showLabel={t('Show v2', 'Arata v2')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Toggle
          question={t('Solution v3: Complete -- reads from keyboard if no args', 'Solutia v3: Completa -- citeste de la tastatura daca nu sunt argumente')}
          answer={
            <div>
              <Code>{`#!/bin/bash
# ArithmeticMean_v3.sh -- complete version
if [ $# -ge 2 ]; then
  n=$1; shift
  let sum=0
  for i in $*; do
    let sum=sum+i
  done
else
  echo -n "Enter n: "; read n
  let sum=0
  for ((i=1; i<=n; i++)); do
    echo -n "Enter number $i: "; read val
    let sum=sum+val
  done
fi
mean=$(echo "scale=5; $sum / $n" | bc -l)
echo "Arithmetic mean = $mean"`}</Code>
            </div>
          }
          showLabel={t('Show v3', 'Arata v3')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* Iterative math #3: Min and Max */}
      <Section title={t('Iterative math #3: Min and Max', 'Iterative math #3: Minim si maxim')} id="s3-minmax" checked={!!checked['s3-minmax']} onCheck={() => toggleCheck('s3-minmax')}>
        <p>{t(
          'Write a script that computes the minimum and maximum values in a sequence of numbers, given as command-line arguments or read from keyboard.',
          'Sa se scrie un script care calculeaza valorile minima si maxima dintr-o secventa de numere, date ca argumente in linia de comanda sau citite de la tastatura.'
        )}</p>

        <Toggle
          question={t('Solution v1: Command-line only', 'Solutia v1: Doar linia de comanda')}
          answer={
            <Code>{`#!/bin/bash
# MinMax_v1.sh -- min and max from command-line args
if [ $# -eq 0 ]; then
  echo "Usage: $0 num1 num2 ..."; exit 1
fi
min=$1; max=$1; shift
for i in $*; do
  if [ $i -lt $min ]; then min=$i; fi
  if [ $i -gt $max ]; then max=$i; fi
done
echo "Min = $min"
echo "Max = $max"`}</Code>
          }
          showLabel={t('Show v1', 'Arata v1')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Toggle
          question={t('Solution v2: Complete -- reads from keyboard too', 'Solutia v2: Completa -- citeste si de la tastatura')}
          answer={
            <Code>{`#!/bin/bash
# MinMax_v2.sh -- complete version
if [ $# -ge 1 ]; then
  min=$1; max=$1; shift
  for i in $*; do
    if [ $i -lt $min ]; then min=$i; fi
    if [ $i -gt $max ]; then max=$i; fi
  done
else
  echo -n "Enter count of numbers: "; read n
  echo -n "Enter number 1: "; read val
  min=$val; max=$val
  for ((i=2; i<=n; i++)); do
    echo -n "Enter number $i: "; read val
    if [ $val -lt $min ]; then min=$val; fi
    if [ $val -gt $max ]; then max=$val; fi
  done
fi
echo "Min = $min"
echo "Max = $max"`}</Code>
          }
          showLabel={t('Show v2', 'Arata v2')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* Iterative math #4: Frequency Vector */}
      <Section title={t('Iterative math #4: Most Frequent Value', 'Iterative math #4: Valoarea cea mai frecventa')} id="s3-freq" checked={!!checked['s3-freq']} onCheck={() => toggleCheck('s3-freq')}>
        <p>{t(
          'Write a script that finds the most frequent numeric value and its count of occurrences in a sequence of numbers given as command-line arguments or read from keyboard.',
          'Sa se scrie un script care gaseste valoarea numerica ce apare de cele mai multe ori si numarul ei de aparitii, intr-un sir de valori numerice date ca argumente in linia de comanda sau citite de la tastatura.'
        )}</p>
        <p className="text-sm mt-2 italic">{t('Note the use of array variables (declaration and element access) in the script below.', 'Observati folosirea variabilelor de tip tablou (declarare si referire la valoarea unui element) in scriptul de mai jos.')}</p>

        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`#!/bin/bash
# FrequencyVector.sh -- most frequent value using arrays
if [ $# -ge 1 ]; then
  nums=($*)
else
  echo -n "Enter numbers (space-separated): "; read -a nums
fi

n=\${#nums[@]}
declare -a count
for ((i=0; i<n; i++)); do
  count[$i]=0
done

for ((i=0; i<n; i++)); do
  for ((j=0; j<n; j++)); do
    if [ \${nums[$i]} -eq \${nums[$j]} ]; then
      let count[$i]++
    fi
  done
done

maxIdx=0
for ((i=1; i<n; i++)); do
  if [ \${count[$i]} -gt \${count[$maxIdx]} ]; then
    maxIdx=$i
  fi
done
echo "Most frequent: \${nums[$maxIdx]} (appears \${count[$maxIdx]} times)"`}</Code>
          }
          showLabel={t('Show solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* Iterative math #5: Combinations C(n,k) */}
      <Section title={t('Iterative math #5: Combinations C(n,k)', 'Iterative math #5: Combinari C(n,k)')} id="s3-combin" checked={!!checked['s3-combin']} onCheck={() => toggleCheck('s3-combin')}>
        <p>{t(
          'Write a script that computes C(n,k) (combinations of n taken k at a time). Values n and k are taken as command-line arguments or read from keyboard.',
          'Sa se scrie un script care calculeaza C(n,k) (combinari de n luate cate k). Valorile n si k se preiau ca argumente din linia de comanda sau se citesc de la tastatura.'
        )}</p>

        <Toggle
          question={t('Solution v1: Using factorial function', 'Solutia v1: Folosind functia factorial')}
          answer={
            <div>
              <p className="text-sm mb-2">{t('C(n,k) = n! / (k! * (n-k)!) using an auxiliary factorial function:', 'C(n,k) = n! / (k! * (n-k)!) folosind o functie auxiliara pentru factorial:')}</p>
              <Code>{`#!/bin/bash
# Combinatorial_v1.sh -- C(n,k) with factorial function
fact() {
  local result=1
  for ((i=2; i<=$1; i++)); do
    let result=result*i
  done
  echo $result
}

if [ $# -ge 2 ]; then
  n=$1; k=$2
else
  echo -n "Enter n: "; read n
  echo -n "Enter k: "; read k
fi

fn=$(fact $n)
fk=$(fact $k)
fnk=$(fact $((n-k)))

echo "n!=$fn  k!=$fk  (n-k)!=$fnk" >&2
let result=fn/(fk*fnk)
echo "C($n,$k) = $result"`}</Code>
            </div>
          }
          showLabel={t('Show v1', 'Arata v1')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Toggle
          question={t('Solution v3: Single loop with simplified formula', 'Solutia v3: O singura bucla cu formula simplificata')}
          answer={
            <div>
              <p className="text-sm mb-2">{t('C(n,k) = (n-k+1)*(n-k+2)*...*n / (1*2*...*k)', 'C(n,k) = (n-k+1)*(n-k+2)*...*n / (1*2*...*k)')}</p>
              <Code>{`#!/bin/bash
# Combinatorial_v3.sh -- single loop
if [ $# -ge 2 ]; then
  n=$1; k=$2
else
  echo -n "Enter n: "; read n
  echo -n "Enter k: "; read k
fi

let numer=1
let denom=1
for ((i=1; i<=k; i++)); do
  let numer=numer*(n-k+i)
  let denom=denom*i
done
let result=numer/denom
echo "C($n,$k) = $result"`}</Code>
            </div>
          }
          showLabel={t('Show v3', 'Arata v3')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── c) Recursive Math Scripts ── */}
      <h3 className="text-lg font-bold mt-6 mb-3">{t('c) Recursive Math Scripts', 'c) Script-uri cu calcule matematice recursive')}</h3>

      {/* Recursive math #1: Factorial */}
      <Section title={t('Recursive math #1: Factorial (4 methods)', 'Recursive math #1: Factorial (4 metode)')} id="s3-rec-fact" checked={!!checked['s3-rec-fact']} onCheck={() => toggleCheck('s3-rec-fact')}>
        <p>{t(
          'Write a script that computes n! recursively. This exercise demonstrates four different ways to implement recursion and pass intermediate values in bash.',
          'Sa se scrie un script care calculeaza n! recursiv. Acest exercitiu demonstreaza patru moduri diferite de a implementa recursia si de a transmite valori intermediare in bash.'
        )}</p>

        <Box type="definition">
          <p className="font-bold text-sm mb-1">{t('Four ways to pass values between recursive calls:', 'Patru moduri de a transmite valori intre apeluri recursive:')}</p>
          <ol className="list-decimal pl-5 text-sm space-y-1">
            <li>{t('Via exit code (limited to 1 byte unsigned)', 'Prin codul de terminare (limitat la 1 octet fara semn)')}</li>
            <li>{t('Via stdout capture using command substitution $()', 'Prin captura stdout folosind substitutia de comanda $()')}</li>
            <li>{t('Via a global variable', 'Printr-o variabila globala')}</li>
            <li>{t('Via a function parameter (additional argument)', 'Printr-un parametru de functie (argument suplimentar)')}</li>
          </ol>
        </Box>

        <Toggle
          question={t('Method 1: Recursive function + exit code', 'Metoda 1: Functie recursiva + cod de terminare')}
          answer={
            <Code>{`#!/bin/bash
# Factorial via recursive function, result via exit code
# WARNING: limited to values fitting in 1 byte (0-255)
fact() {
  if [ $1 -le 1 ]; then
    return 1
  else
    let n1=$1-1
    fact $n1
    let result=$?*$1
    return $result
  fi
}

if [ $# -ge 1 ]; then n=$1
else echo -n "Enter n: "; read n; fi

fact $n
echo "$n! = $?"`}</Code>
          }
          showLabel={t('Show method 1', 'Arata metoda 1')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Toggle
          question={t('Method 2: Recursive function + stdout capture', 'Metoda 2: Functie recursiva + captura stdout')}
          answer={
            <Code>{`#!/bin/bash
# Factorial via recursive function, result via stdout
fact() {
  if [ $1 -le 1 ]; then
    echo 1
  else
    let n1=$1-1
    prev=$(fact $n1)
    let result=prev*$1
    echo $result
  fi
}

if [ $# -ge 1 ]; then n=$1
else echo -n "Enter n: "; read n; fi

result=$(fact $n)
echo "$n! = $result"`}</Code>
          }
          showLabel={t('Show method 2', 'Arata metoda 2')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Toggle
          question={t('Method 3: Recursive function + global variable', 'Metoda 3: Functie recursiva + variabila globala')}
          answer={
            <Code>{`#!/bin/bash
# Factorial via recursive function, result via global variable
fact_result=1
fact() {
  if [ $1 -le 1 ]; then
    fact_result=1
  else
    let n1=$1-1
    fact $n1
    let fact_result=fact_result*$1
  fi
}

if [ $# -ge 1 ]; then n=$1
else echo -n "Enter n: "; read n; fi

fact $n
echo "$n! = $fact_result"`}</Code>
          }
          showLabel={t('Show method 3', 'Arata metoda 3')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* Recursive math #2: Is Power */}
      <Section title={t('Recursive math #2: Check if n is a power of m', 'Recursive math #2: Verificare daca n este putere a lui m')} id="s3-ispower" checked={!!checked['s3-ispower']} onCheck={() => toggleCheck('s3-ispower')}>
        <p>{t(
          'Write a script that takes two values n and m and recursively checks whether n is a power of m, displaying "True" or "False" at the end.',
          'Sa se scrie un script care primeste doua valori n si m si verifica recursiv daca n este o putere a lui m, afisand la final "Adevarat" sau "Fals".'
        )}</p>
        <p className="text-sm mt-1 italic">{t('Idea: repeatedly divide n by m (recursively) until either a non-zero remainder is obtained, or the quotient becomes 1.', 'Ideea: impartim pe n la m in mod repetat (recursiv) pana fie obtinem un rest nenul, fie obtinem catul 1.')}</p>

        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`#!/bin/bash
# IsPower.sh -- check if n is a power of m
isPower_result="False"
isPower() {
  local n=$1
  if [ $n -eq 1 ]; then
    isPower_result="True"
  elif [ $((n % m)) -ne 0 ]; then
    isPower_result="False"
  else
    isPower $((n / m))
  fi
}

if [ $# -ge 2 ]; then
  n=$1; m=$2
else
  echo -n "Enter n: "; read n
  echo -n "Enter m: "; read m
fi

isPower $n
echo "$isPower_result"`}</Code>
          }
          showLabel={t('Show solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── d) Cooperating Scripts ── */}
      <h3 className="text-lg font-bold mt-6 mb-3">{t('d) Cooperating Scripts', 'd) Script-uri cooperante')}</h3>

      {/* Cooperating Iterative Math #1 */}
      <Section title={t('Cooperating iterative math #1: Parallel sum via pipes', 'Cooperating iterative math #1: Suma paralelizata prin pipe-uri')} id="s3-coop1" checked={!!checked['s3-coop1']} onCheck={() => toggleCheck('s3-coop1')}>
        <p>{t(
          'Two scripts collaborate to compute a sum in parallel. A "producer" script generates a sequence of numbers and a "consumer" script processes them. This demonstrates inter-process communication using pipes and environment variables.',
          'Doua script-uri colaboreaza pentru a calcula o suma in paralel. Un script "producer" genereaza o secventa de numere, iar un script "consumer" le proceseaza. Aceasta demonstreaza comunicarea inter-procese folosind pipe-uri si variabile de mediu.'
        )}</p>
        <p className="text-sm mt-2 italic">{t(
          'Note: The parallelized computation here is intentionally simple -- the purpose is didactic, to illustrate how cooperating scripts work.',
          'Nota: Calculul paralelizat este intentionat simplu -- scopul este didactic, pentru a ilustra cum functioneaza script-urile cooperante.'
        )}</p>

        <Toggle
          question={t('Show producer/consumer example', 'Arata exemplul producer/consumer')}
          answer={
            <div>
              <p className="text-sm font-bold mb-1">{t('Producer: filters numbers and pipes to consumer', 'Producer: filtreaza numerele si le trimite prin pipe la consumer')}</p>
              <Code>{`#!/bin/bash
# producer.sh -- filters numbers <= p, outputs to stdout
if [ $# -ge 1 ]; then
  nums="$*"
else
  echo -n "Enter numbers: " >&2; read nums
fi
echo -n "Enter threshold p: " >&2; read p

for n in $nums; do
  if [ $n -le $p ]; then
    echo -n "$n "
  fi
done`}</Code>
              <p className="text-sm font-bold mt-3 mb-1">{t('Consumer: reads from stdin, computes sum of cubes', 'Consumer: citeste de la stdin, calculeaza suma cuburilor')}</p>
              <Code>{`#!/bin/bash
# consumer.sh -- reads numbers from stdin, sums their cubes
read nums
if [ -z "$nums" ]; then
  echo "Consumer: computed sum is NULL."
  exit 1
fi
let sum=0
for n in $nums; do
  let sum=sum+n*n*n
done
echo "Consumer: computed sum is $sum."
exit 0`}</Code>
              <p className="text-sm mt-2">{t('Usage:', 'Utilizare:')}</p>
              <Code>{`./producer.sh -2 35 -1 2025 2 10 | ./consumer.sh ; echo "Exit: $?"`}</Code>
            </div>
          }
          showLabel={t('Show example', 'Arata exemplul')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── e) File Processing Scripts ── */}
      <h3 className="text-lg font-bold mt-6 mb-3">{t('e) File Processing Scripts', 'e) Script-uri de procesare a fisierelor')}</h3>

      {/* MyGccOrCat */}
      <Section title={t('[MyGccOrCat] Compile C files or display text files', '[MyGccOrCat] Compilarea fisierelor C sau afisarea fisierelor text')} id="s3-gccorcat" checked={!!checked['s3-gccorcat']} onCheck={() => toggleCheck('s3-gccorcat')}>
        <p>{t(
          'Write a script that receives a directory name as parameter. It compiles each C source file in that directory and prints the contents of each text file. (No recursive traversal required!)',
          'Sa se scrie un script care primeste un nume de director ca parametru. Compileaza fiecare fisier sursa C din acel director si afiseaza pe ecran continutul fiecarui fisier text. (NU se cere parcurgere recursiva!)'
        )}</p>

        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <div>
              <Code>{`#!/bin/bash
# MyGccOrCat.sh -- compile C files or cat text files
compile_C() {
  local src=$1
  local exe=$(basename "$src" .c)
  gcc "$src" -o "$(dirname "$src")/$exe" -Wall
  if [ $? -eq 0 ]; then
    echo "$src -> Compiled OK!" >&2
  else
    echo "$src -> Compilation error!" >&2
  fi
}

print_text() {
  echo "=== Contents of $1 ===" >&2
  cat "$1"
}

if [ $# -lt 1 ]; then
  echo "Usage: $0 directory"; exit 1
fi

dir=$1
for f in "$dir"/*; do
  if [ -f "$f" ]; then
    type_info=$(file "$f")
    if echo "$type_info" | grep -q "C source"; then
      compile_C "$f"
    elif echo "$type_info" | grep -q "text"; then
      print_text "$f"
    fi
  fi
done`}</Code>
              <p className="text-sm mt-2">{t(
                'Note: If files with spaces in their names exist, errors may occur due to how for...in evaluates the word list. See the MyFind exercises for workarounds.',
                'Nota: Daca exista fisiere cu spatii in nume, pot aparea erori datorita modului in care for...in evalueaza lista de cuvinte. Vedeti exercitiile MyFind pentru solutii.'
              )}</p>
            </div>
          }
          showLabel={t('Show solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* Run SPMD Programs */}
      <Section title={t('[Run SPMD] Launch n parallel instances of a program', '[Run SPMD] Lansarea a n instante paralele ale unui program')} id="s3-spmd" checked={!!checked['s3-spmd']} onCheck={() => toggleCheck('s3-spmd')}>
        <p>{t(
          'Write a script that, given a path to an executable, a number n, and n values, launches n parallel (asynchronous) instances of that program, each with one of the n values as argument.',
          'Sa se scrie un script care, primind calea catre un executabil, un numar n si n valori, lanseaza in executie paralela si neinlantuita n instante ale acelui program, fiecare cu una dintre cele n valori ca argument.'
        )}</p>

        <Box type="definition">
          <p className="text-sm"><strong>SPMD</strong> = <em>Single-Program-Multiple-Data</em>{t(
            ' -- a parallel programming pattern where n instances of a sequential program run in parallel on different data, asynchronously.',
            ' -- un sablon de programare paralela in care n instante ale unui program secvential ruleaza in paralel, pe date diferite, in maniera asincrona.'
          )}</p>
        </Box>

        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <div>
              <Code>{`#!/bin/bash
# RunMySPMD.sh -- launch SPMD instances
if [ $# -lt 3 ]; then
  echo "Usage: $0 program n val1 val2 ... valn"; exit 1
fi

prog=$1; n=$2; shift 2

if [ $# -lt $n ]; then
  echo "Error: expected $n values, got $#"; exit 1
fi

for ((i=1; i<=n; i++)); do
  $prog $1 &
  shift
done
wait
echo "All $n instances have finished."`}</Code>
              <p className="text-sm mt-2">{t('Example calls:', 'Exemple de apelare:')}</p>
              <Code>{`./RunMySPMD.sh /bin/ls 3 ~ /usr/share /proc
./RunMySPMD.sh /bin/cat 2 /etc/passwd /etc/group
./RunMySPMD.sh /bin/ps 3 a -ef -af`}</Code>
            </div>
          }
          showLabel={t('Show solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* MyG++ */}
      <Section title={t('[MyG++] Compile all C++ files in a directory', '[MyG++] Compilarea tuturor fisierelor C++ dintr-un director')} id="s3-gpp" checked={!!checked['s3-gpp']} onCheck={() => toggleCheck('s3-gpp')}>
        <p>{t(
          'Write a script that receives a directory as parameter and compiles all C++ source files (.cpp) in that directory (not recursively). Compilation: g++ file.cpp -o file -Wall.',
          'Sa se scrie un script care primeste un director ca parametru si compileaza toate fisierele sursa C++ (.cpp) din acel director (nu recursiv). Compilare: g++ file.cpp -o file -Wall.'
        )}</p>

        <Toggle
          question={t('Solution v1: Using glob pattern', 'Solutia v1: Folosind sablon glob')}
          answer={
            <Code>{`#!/bin/bash
# MyG++_v1.sh -- using glob pattern *.cpp
if [ $# -lt 1 ]; then
  echo "Usage: $0 directory"; exit 1
fi
dir=$1
for src in "$dir"/*.cpp; do
  if [ -f "$src" ]; then
    exe=$(basename "$src" .cpp)
    g++ "$src" -o "$dir/$exe" -Wall
    if [ $? -eq 0 ]; then
      echo "$src -> OK"
    else
      echo "$src -> ERRORS"
    fi
  fi
done`}</Code>
          }
          showLabel={t('Show v1', 'Arata v1')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Toggle
          question={t('Solution v2: Using find', 'Solutia v2: Folosind find')}
          answer={
            <Code>{`#!/bin/bash
# MyG++_v2.sh -- using find with maxdepth 1
if [ $# -lt 1 ]; then
  echo "Usage: $0 directory"; exit 1
fi
dir=$1
for src in $(find "$dir" -maxdepth 1 -name "*.cpp" -type f); do
  exe=$(basename "$src" .cpp)
  g++ "$src" -o "$dir/$exe" -Wall
  if [ $? -eq 0 ]; then
    echo "$src -> OK"
  else
    echo "$src -> ERRORS"
  fi
done`}</Code>
          }
          showLabel={t('Show v2', 'Arata v2')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* EditCompileRun */}
      <Section title={t('[EditCompileRun] Automate edit-compile-run cycle', '[EditCompileRun] Automatizarea ciclului editare-compilare-executie')} id="s3-editcomp" checked={!!checked['s3-editcomp']} onCheck={() => toggleCheck('s3-editcomp')}>
        <p>{t(
          'Write a script to automate the C development cycle: edit source -> compile -> test (run). The script launches the preferred editor, asks whether to compile, loops back on errors, and optionally runs the executable.',
          'Sa se scrie un script pentru automatizarea ciclului de dezvoltare C: editare sursa -> compilare -> testare (executie). Scriptul lanseaza editorul preferat, intreaba daca sa compileze, reia la erori si optional ruleaza executabilul.'
        )}</p>

        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`#!/bin/bash
# EditCompileRun.sh -- automate C development cycle
if [ $# -ge 1 ]; then
  prog=$1
else
  echo -n "Enter C source name (without .c): "; read prog
fi

while true; do
  \${EDITOR:-nano} "$prog.c"
  echo -n "Compile $prog.c? (y/n): "; read ans
  if [ "$ans" != "y" ]; then break; fi

  gcc "$prog.c" -o "$prog" -Wall
  if [ $? -eq 0 ]; then
    echo "Compilation successful!"
    echo -n "Run ./$prog? (y/n): "; read ans
    if [ "$ans" = "y" ]; then
      ./"$prog"
    fi
    break
  else
    echo "Compilation failed! Press Enter to re-edit..."
    read
  fi
done`}</Code>
          }
          showLabel={t('Show solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── f) Recursive Filesystem Traversal Scripts ── */}
      <h3 className="text-lg font-bold mt-6 mb-3">{t('f) Recursive Filesystem Traversal Scripts', 'f) Script-uri cu parcurgeri recursive ale sistemului de fisiere')}</h3>

      {/* Call2Find #1 */}
      <Section title={t('[Call2Find #1] Display comments from bash scripts (using find)', '[Call2Find #1] Afisarea comentariilor din script-uri bash (folosind find)')} id="s3-call2find1" checked={!!checked['s3-call2find1']} onCheck={() => toggleCheck('s3-call2find1')}>
        <p>{t(
          'Write a script that displays all comments from bash scripts found in a specified directory and its subdirectories. Simplifying assumption: bash scripts have the .sh extension.',
          'Sa se scrie un script care afiseaza toate comentariile din script-urile bash aflate intr-un director specificat si subdirectoarele acestuia. Presupunere simplificatoare: script-urile bash au extensia .sh.'
        )}</p>

        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <div>
              <Code>{`#!/bin/bash
# Call2Find_1.sh -- display comments from .sh scripts
if [ $# -lt 1 ]; then
  echo "Usage: $0 directory"; exit 1
fi
dir=$1
for f in $(find "$dir" -type f -name "*.sh"); do
  echo "=== $f ==="
  grep -n "#" "$f" | grep -v '\\$#' | grep -v '^[0-9]*:#!'
done`}</Code>
              <p className="text-sm mt-2">{t(
                'The first grep selects lines with comments (-n adds line numbers). The second grep removes lines containing $# (not a comment). The third grep removes the shebang line (#!).',
                'Primul grep selecteaza liniile cu comentarii (-n adauga numere de linie). Al doilea grep elimina liniile cu $# (nu e comentariu). Al treilea grep elimina linia shebang (#!).'
              )}</p>
              <p className="text-sm mt-1 italic">{t(
                'Better approach: use the file command to check if a file is actually a bash script, regardless of extension.',
                'Abordare mai buna: folositi comanda file pentru a verifica daca un fisier este de fapt un script bash, indiferent de extensie.'
              )}</p>
            </div>
          }
          showLabel={t('Show solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* Call2Find #2 */}
      <Section title={t('[Call2Find #2] Display first k lines of readable files', '[Call2Find #2] Afisarea primelor k linii din fisiere accesibile')} id="s3-call2find2" checked={!!checked['s3-call2find2']} onCheck={() => toggleCheck('s3-call2find2')}>
        <p>{t(
          'Write a script that takes parameters d (directory name) and k (positive integer). For each file where the current user has read and execute permissions, found in d or its subdirectories, display the first k lines of text.',
          'Sa se scrie un script care primeste parametrii d (un nume de director) si k (un numar intreg pozitiv). Pentru fiecare fisier pentru care utilizatorul curent are drepturi de citire si executie, aflat in d sau subdirectoarele acestuia, se vor afisa primele k linii de text.'
        )}</p>

        <Toggle
          question={t('Solution v1: Test with if', 'Solutia v1: Test cu if')}
          answer={
            <Code>{`#!/bin/bash
# Call2Find_2_v1.sh
if [ $# -lt 2 ]; then
  echo "Usage: $0 directory k"; exit 1
fi
dir=$1; k=$2
for f in $(find "$dir" -type f); do
  if [ -r "$f" ] && [ -x "$f" ]; then
    echo "=== $f (first $k lines) ==="
    head -n $k "$f"
  fi
done`}</Code>
          }
          showLabel={t('Show v1', 'Arata v1')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Toggle
          question={t('Solution v2: Move tests to find (more efficient)', 'Solutia v2: Teste mutate la find (mai eficient)')}
          answer={
            <div>
              <Code>{`#!/bin/bash
# Call2Find_2_v2.sh -- more efficient
if [ $# -lt 2 ]; then
  echo "Usage: $0 directory k"; exit 1
fi
dir=$1; k=$2
for f in $(find "$dir" -type f -readable -executable); do
  echo "=== $f (first $k lines) ==="
  head -n $k "$f"
done`}</Code>
              <p className="text-sm mt-2">{t(
                'Q: Which is more efficient? A: v2, because find filters first so the for loop iterates fewer times.',
                'Intrebare: Care este mai eficienta? Raspuns: v2, deoarece find filtreaza mai intai si bucla for itereaza de mai putine ori.'
              )}</p>
            </div>
          }
          showLabel={t('Show v2', 'Arata v2')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* MyFind #1 */}
      <Section title={t('[MyFind #1] Count fifos and subdirectories (explicit recursion)', '[MyFind #1] Numararea fifo-urilor si subdirectoarelor (recursie explicita)')} id="s3-myfind1" checked={!!checked['s3-myfind1']} onCheck={() => toggleCheck('s3-myfind1')}>
        <p>{t(
          'Write a script that computes and displays the total number of fifo files and subdirectories in a given directory, traversing it recursively and explicitly (without using find or ls -R).',
          'Sa se scrie un script care calculeaza si afiseaza numarul total de fisiere fifo si subdirectoare dintr-un director dat, parcurgand recursiv si explicit directorul (fara a folosi find sau ls -R).'
        )}</p>

        <Box type="definition">
          <p className="font-bold text-sm mb-1">{t('Implementation approaches:', 'Abordari de implementare:')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>{t('Recursion via: recursive function OR recursive script call', 'Recursia prin: functie recursiva SAU apel recursiv de script')}</li>
            <li>{t('Directory listing via: ls -A or glob patterns (*/.*)', 'Listare director prin: ls -A sau sabloane glob (*/.*)')}</li>
            <li>{t('Value passing via: exit code, stdout capture, global variable, or extra parameter', 'Transmiterea valorilor prin: cod de terminare, captura stdout, variabila globala sau parametru suplimentar')}</li>
          </ul>
        </Box>

        <Toggle
          question={t('Solution 1: Recursive function + global variables', 'Solutia 1: Functie recursiva + variabile globale')}
          answer={
            <Code>{`#!/bin/bash
# MyFind_1_v1.sh -- recursive function
nr_dir=0
nr_fif=0

parcurge() {
  local cale=$1
  for f in "$cale"/* "$cale"/.*; do
    # skip . and ..
    local base=$(basename "$f")
    if [ "$base" = "." ] || [ "$base" = ".." ]; then continue; fi

    if [ -d "$f" ]; then
      let nr_dir++
      echo "DIR: $f" >&2
      parcurge "$f"    # recursive call
    elif [ -p "$f" ]; then
      let nr_fif++
      echo "FIFO: $f" >&2
    fi
  done
}

if [ $# -ge 1 ]; then dir=$1
else echo -n "Enter directory: "; read dir; fi

if [ ! -d "$dir" ]; then
  echo "Error: $dir is not a directory!" >&2; exit 1
fi

parcurge "$dir"
echo "Total subdirectories: $nr_dir"
echo "Total fifo files: $nr_fif"`}</Code>
          }
          showLabel={t('Show solution 1', 'Arata solutia 1')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Toggle
          question={t('Solution 2: Recursive script call (new process per call)', 'Solutia 2: Apel recursiv de script (proces nou per apel)')}
          answer={
            <div>
              <Code>{`#!/bin/bash
# MyFind_1_v2.sh -- recursive script, stdout capture
if [ $# -ge 1 ]; then dir=$1
else echo -n "Enter directory: "; read dir; fi

nr_dir=0; nr_fif=0
for f in "$dir"/* "$dir"/.*; do
  base=$(basename "$f")
  if [ "$base" = "." ] || [ "$base" = ".." ]; then continue; fi

  if [ -d "$f" ]; then
    let nr_dir++
    # Recursive call -- new shell process!
    sub_result=$($0 "$f" "apel_recursiv")
    sub_dir=$(echo $sub_result | cut -d' ' -f1)
    sub_fif=$(echo $sub_result | cut -d' ' -f2)
    let nr_dir+=sub_dir
    let nr_fif+=sub_fif
  elif [ -p "$f" ]; then
    let nr_fif++
  fi
done

if [ "M$2" = "Mapel_recursiv" ]; then
  echo "$nr_dir $nr_fif"   # return values to parent
else
  echo "Total subdirectories: $nr_dir"
  echo "Total fifo files: $nr_fif"
fi`}</Code>
              <p className="text-sm mt-2">{t(
                'Warning: each recursive call creates a new shell process. Deep directory trees (~25 levels) may hit the per-user process limit.',
                'Atentie: fiecare apel recursiv creeaza un proces shell nou. Arborii de directoare adanci (~25 nivele) pot atinge limita de procese per utilizator.'
              )}</p>
            </div>
          }
          showLabel={t('Show solution 2', 'Arata solutia 2')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Toggle
          question={t('Solution 3: source call (same process) + global variables', 'Solutia 3: apel cu source (acelasi proces) + variabile globale')}
          answer={
            <div>
              <Code>{`#!/bin/bash
# MyFind_1_v3.sh -- using "source" for recursion (no new process)
if [ "M$2" != "Mapel_recursiv" ]; then
  nr_dir=0; nr_fif=0
fi

cale=$1
for f in "$cale"/* "$cale"/.*; do
  base=$(basename "$f")
  if [ "$base" = "." ] || [ "$base" = ".." ]; then continue; fi

  if [ -d "$f" ]; then
    let nr_dir++
    source $0 "$f" "apel_recursiv"
  elif [ -p "$f" ]; then
    let nr_fif++
  fi
done

if [ "M$2" != "Mapel_recursiv" ]; then
  echo "Total subdirectories: $nr_dir"
  echo "Total fifo files: $nr_fif"
fi`}</Code>
              <p className="text-sm mt-2">{t(
                'Using "source" (or ".") runs the script in the SAME shell process, so global variables are shared across all recursive calls -- no need for stdout capture.',
                'Folosind "source" (sau ".") se ruleaza scriptul in ACELASI proces shell, deci variabilele globale sunt partajate intre toate apelurile recursive -- nu mai e nevoie de captura stdout.'
              )}</p>
            </div>
          }
          showLabel={t('Show solution 3', 'Arata solutia 3')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* MyFind #2 */}
      <Section title={t('[MyFind #2] Count total lines and characters (recursive)', '[MyFind #2] Numararea liniilor si caracterelor (recursiv)')} id="s3-myfind2" checked={!!checked['s3-myfind2']} onCheck={() => toggleCheck('s3-myfind2')}>
        <p>{t(
          'Write a script that computes the total number of text lines and characters from all regular files in a directory, traversing it explicitly and recursively.',
          'Sa se scrie un script care calculeaza numarul total de linii de text si caractere din toate fisierele normale dintr-un director, parcurgand explicit si recursiv.'
        )}</p>

        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`#!/bin/bash
# MyFind_2.sh -- count lines and characters recursively
total_lines=0
total_chars=0

parcurge() {
  local cale=$1
  for f in "$cale"/* "$cale"/.*; do
    local base=$(basename "$f")
    if [ "$base" = "." ] || [ "$base" = ".." ]; then continue; fi

    if [ -d "$f" ]; then
      parcurge "$f"
    elif [ -f "$f" ]; then
      local nl=$(wc -l < "$f")
      local nc=$(wc -c < "$f")
      let total_lines+=nl
      let total_chars+=nc
      echo "$f : $nl lines, $nc chars" >&2
    fi
  done
}

if [ $# -ge 1 ]; then dir=$1
else echo -n "Enter directory: "; read dir; fi

parcurge "$dir"
echo "Total lines: $total_lines"
echo "Total characters: $total_chars"`}</Code>
          }
          showLabel={t('Show solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* MyFind #3 */}
      <Section title={t('[MyFind #3] Display directory tree structure', '[MyFind #3] Afisarea structurii arborescente a directoarelor')} id="s3-myfind3" checked={!!checked['s3-myfind3']} onCheck={() => toggleCheck('s3-myfind3')}>
        <p>{t(
          'Write a script that displays a tree of the subdirectory structure within a given directory, traversing recursively and explicitly.',
          'Sa se scrie un script care afiseaza un arbore cu structura subdirectoarelor dintr-un director dat, parcurgand recursiv si explicit.'
        )}</p>

        <Toggle
          question={t('Show solution', 'Arata solutia')}
          answer={
            <Code>{`#!/bin/bash
# MyFind_3.sh -- display directory tree
parcurge() {
  local cale=$1
  local indent=$2
  for f in "$cale"/* "$cale"/.*; do
    local base=$(basename "$f")
    if [ "$base" = "." ] || [ "$base" = ".." ]; then continue; fi

    if [ -d "$f" ]; then
      echo "\${indent}|-- $base/"
      parcurge "$f" "\${indent}|   "
    fi
  done
}

if [ $# -ge 1 ]; then dir=$1
else echo -n "Enter directory: "; read dir; fi

echo "$dir/"
parcurge "$dir" ""`}</Code>
          }
          showLabel={t('Show solution', 'Arata solutia')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── g) System Resource Processing ── */}
      <h3 className="text-lg font-bold mt-6 mb-3">{t('g) System Resource Processing Scripts', 'g) Script-uri de procesare a resurselor sistemului')}</h3>

      {/* MyId */}
      <Section title={t('[MyId] Display user info by UID', '[MyId] Afisarea informatiilor utilizatorului dupa UID')} id="s3-myid" checked={!!checked['s3-myid']} onCheck={() => toggleCheck('s3-myid')}>
        <p>{t(
          'Write a script that, given a UID as command-line argument, displays the user\'s real name, username, and all groups they belong to.',
          'Sa se scrie un script care, primind un UID ca argument in linia de comanda, afiseaza numele real al utilizatorului, numele de cont si toate grupurile din care face parte.'
        )}</p>

        <Toggle
          question={t('Solution v1: Using /etc/passwd and /etc/group', 'Solutia v1: Folosind /etc/passwd si /etc/group')}
          answer={
            <div>
              <Code>{`#!/bin/bash
# MyId_v1.sh -- user info from /etc/passwd and /etc/group
if [ $# -lt 1 ]; then
  echo "Usage: $0 UID"; exit 1
fi
uid=$1

# Extract user info from /etc/passwd
line=$(grep ":$uid:" /etc/passwd)
if [ -z "$line" ]; then
  echo "UID $uid not found!"; exit 1
fi

username=$(echo "$line" | cut -d: -f1)
realname=$(echo "$line" | cut -d: -f5 | cut -d, -f1)
gid=$(echo "$line" | cut -d: -f4)

# Get primary group name
primary_group=$(grep ":$gid:" /etc/group | cut -d: -f1)

# Get all groups
all_groups=$(grep -w "$username" /etc/group | cut -d: -f1)

echo "Real name: $realname"
echo "Username:  $username"
echo "Primary group: $primary_group"
echo "All groups: $all_groups"`}</Code>
              <p className="text-sm mt-2">{t(
                'Note: We search UIDs/GIDs with pattern :nnn: to avoid matching substrings. We use grep -w for usernames to match whole words only.',
                'Nota: Cautam UID/GID cu sablonul :nnn: pentru a evita potrivirea subsirurilior. Folosim grep -w pentru utilizatori pentru a potrivi doar cuvinte intregi.'
              )}</p>
            </div>
          }
          showLabel={t('Show v1', 'Arata v1')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Toggle
          question={t('Solution v3: Using the id command', 'Solutia v3: Folosind comanda id')}
          answer={
            <Code>{`#!/bin/bash
# MyId_v3.sh -- using id command
if [ $# -lt 1 ]; then
  echo "Usage: $0 UID"; exit 1
fi
uid=$1

username=$(grep ":$uid:" /etc/passwd | cut -d: -f1)
if [ -z "$username" ]; then
  echo "UID $uid not found!"; exit 1
fi

realname=$(grep ":$uid:" /etc/passwd | cut -d: -f5 | cut -d, -f1)

# Use id command for groups
groups_info=$(id $username)

echo "Real name: $realname"
echo "Username:  $username"
echo "Groups info: $groups_info"`}</Code>
          }
          showLabel={t('Show v3', 'Arata v3')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>

      {/* ── Error Detection in Scripts ── */}
      <h3 className="text-lg font-bold mt-6 mb-3">{t('Debugging Scripts: Error Detection', 'Depanarea script-urilor: Detectarea erorilor')}</h3>

      <Box type="warning">
        <p className="font-bold text-sm mb-1">{t('Two methods for detecting errors in scripts:', 'Doua metode pentru detectarea erorilor in script-uri:')}</p>
        <ol className="list-decimal pl-5 text-sm space-y-2">
          <li>
            <strong>noexec</strong>{t(' -- reads commands without executing them (syntax check only):', ' -- citeste comenzile fara a le executa (verificare doar a sintaxei):')}<br/>
            <code>bash -n script.sh</code>{t(' or ', ' sau ')}<code>set -n</code>{t(' inside the script', ' in interiorul scriptului')}
          </li>
          <li>
            <strong>xtrace</strong>{t(' -- displays each command after interpretation, before execution (trace/debug):', ' -- afiseaza fiecare comanda dupa interpretare, inainte de executie (trasare/depanare):')}<br/>
            <code>bash -x script.sh</code>{t(' or ', ' sau ')}<code>set -x</code>{t(' inside the script (disable with set +x)', ' in interiorul scriptului (dezactivare cu set +x)')}
          </li>
        </ol>
      </Box>

      <Section title={t('[Example #1] Script with errors: power computation', '[Exemplul #1] Script cu erori: ridicarea la putere')} id="s3-errors1" checked={!!checked['s3-errors1']} onCheck={() => toggleCheck('s3-errors1')}>
        <p>{t(
          'Given a script intended to compute "first_param ^ second_param", identify and correct the syntax and semantic errors so that it works correctly.',
          'Dat un script care trebuie sa calculeze "primul_param ^ al_doilea_param", identificati si corectati erorile sintactice si semantice ca sa functioneze corect.'
        )}</p>
        <p className="text-sm mt-1">{t('Use bash -n to find syntax errors, then bash -x to trace execution and find semantic bugs.', 'Folositi bash -n pentru erori de sintaxa, apoi bash -x pentru a trasa executia si a gasi bug-uri semantice.')}</p>

        <Toggle
          question={t('Show debugging approach', 'Arata abordarea de depanare')}
          answer={
            <div>
              <Code>{`# Step 1: Check syntax
bash -n script_with_errors.sh

# Step 2: Run with trace to see what happens
bash -x script_with_errors.sh 2 5

# Step 3: Fix errors one by one:
# - Missing spaces in [ ] tests
# - Wrong variable names
# - Missing 'then' or 'fi' or 'done'
# - Logical errors in the algorithm`}</Code>
            </div>
          }
          showLabel={t('Show approach', 'Arata abordarea')}
          hideLabel={t('Hide', 'Ascunde')}
        />
      </Section>
    </>
  );
}
