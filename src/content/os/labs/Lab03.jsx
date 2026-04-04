import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Lab03() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: OS - Lab #3 Exercises, Cristian Vidrascu, UAIC',
          'Sursa: SO - Laborator #3 Exercitii, Cristian Vidrascu, UAIC'
        )}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">
          {t('Lab #3: Bash Scripting Exercises', 'Laborator #3: Exercitii cu fisiere de comenzi')}
        </p>
        <p className="text-sm">
          {t(
            'This lab covers bash scripting exercises: iterative and recursive math scripts, cooperating scripts, file processing scripts, recursive filesystem traversal, and debugging scripts with errors.',
            'Acest laborator acopera exercitii cu script-uri bash: script-uri matematice iterative si recursive, script-uri cooperante, script-uri de procesare a fisierelor, parcurgeri recursive ale sistemului de fisiere si depanarea script-urilor cu erori.'
          )}
        </p>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* I) Math scripts (iterative & recursive) */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <h3 className="text-lg font-bold mt-6 mb-3">
        {t('I) Math Scripts (Iterative & Recursive)', 'I) Script-uri matematice (iterative si recursive)')}
      </h3>
      <p className="text-sm mb-4 opacity-80">
        {t('In-class exercises:', 'Exercitii propuse spre rezolvare:')}
      </p>

      {/* Recursive math #3 */}
      <Section title={t('[Recursive math #3] Powers of 2 recursively', '[Recursive math #3] Puterile lui 2 recursiv')} id="lab_3-rec3" checked={!!checked['lab_3-rec3']} onCheck={() => toggleCheck('lab_3-rec3')}>
        <p>{t(
          'Write a script that takes a number n and recursively computes the successive powers of 2, from 2^0 to 2^n, printing them to stderr. Based on the recurrence: 2^k = 2 * 2^(k-1) for k > 0.',
          'Sa se scrie un script care primeste un numar n si calculeaza recursiv puterile succesive ale lui 2, de la 2^0 pana la 2^n, afisandu-le pe stderr. Pe baza recurentei: 2^k = 2 * 2^(k-1) pentru k > 0.'
        )}</p>
        <p className="text-sm mt-1">{t(
          'Requirement: n is taken as a command-line argument or read with read if not provided.',
          'Cerinta: valoarea pentru n se preia ca argument din linia de comanda sau se citeste cu read daca nu este data.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`#!/bin/bash
# Powers of 2 recursively
power2() {
  local k=$1
  if [ $k -eq 0 ]; then
    echo "2^0 = 1" >&2
    echo 1    # return via stdout
  else
    local prev=$(power2 $((k-1)))
    local curr=$((2 * prev))
    echo "2^$k = $curr" >&2
    echo $curr
  fi
}

if [ $# -ge 1 ]; then n=$1
else echo -n "Enter n: "; read n; fi

power2 $n > /dev/null`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Cooperating iterative math #2 */}
      <Section title={t('[Cooperating iterative math #2] Producer-Consumer with cube sum', '[Cooperating iterative math #2] Producer-Consumer cu suma cuburilor')} id="lab_3-coop2" checked={!!checked['lab_3-coop2']} onCheck={() => toggleCheck('lab_3-coop2')}>
        <p>{t(
          'Write two scripts that collaboratively compute the iterative sum of cubes of numbers that are <= p (where p is read from keyboard).',
          'Sa se scrie doua script-uri care sa efectueze in maniera colaborativa calculul iterativ al sumei cuburilor doar a acelor numere care sunt <= p (unde p se citeste de la tastatura).'
        )}</p>
        <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
          <li>{t(
            'producer.sh: Takes numbers as args (or reads them), reads p from keyboard, outputs to stdout only numbers <= p.',
            'producer.sh: Preia numerele ca argumente (sau le citeste), citeste p de la tastatura, afiseaza pe stdout doar numerele <= p.'
          )}</li>
          <li>{t(
            'consumer.sh: Reads numbers from stdin, computes sum of cubes, outputs result (or NULL if empty), exits 0 or 1.',
            'consumer.sh: Citeste numerele de la stdin, calculeaza suma cuburilor, afiseaza rezultatul (sau NULL daca e vid), exit 0 sau 1.'
          )}</li>
        </ul>
        <p className="text-sm mt-2">{t('Usage example:', 'Exemplu de utilizare:')}</p>
        <Code>{`./producer.sh -2 35 -1 2025 2 10 | ./consumer.sh ; echo "Exit: $?"
# If p=25: Consumer: computed sum is 999.  ((-8)+(-1)+8+1000=999)
# If all filtered out: Consumer: computed sum is NULL.  Exit: 1`}</Code>

        <Toggle question={t('Solution', 'Solutie')} answer={
          <div>
            <p className="text-sm font-bold mb-1">producer.sh:</p>
            <Code>{`#!/bin/bash
if [ $# -ge 1 ]; then nums="$*"
else echo -n "Enter numbers: " >&2; read nums; fi
echo -n "Enter p: " >&2; read p
for n in $nums; do
  if [ $n -le $p ]; then echo -n "$n "; fi
done`}</Code>
            <p className="text-sm font-bold mt-3 mb-1">consumer.sh:</p>
            <Code>{`#!/bin/bash
read nums
if [ -z "$nums" ]; then
  echo "Consumer: computed sum is NULL."
  exit 1
fi
let sum=0
for n in $nums; do
  let sum+=n*n*n
done
echo "Consumer: computed sum is $sum."
exit 0`}</Code>
          </div>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Homework: math exercises */}
      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('Homework: Math Scripts', 'Tema: Script-uri matematice')}
      </h3>

      {/* Iterative math #6: Fibonacci */}
      <Section title={t('[Iterative math #6] Fibonacci number', '[Iterative math #6] Numarul Fibonacci')} id="lab_3-fib" checked={!!checked['lab_3-fib']} onCheck={() => toggleCheck('lab_3-fib')}>
        <p>{t(
          'Write a script that computes the n-th value in the Fibonacci sequence. The value n is taken as a command-line argument or read from keyboard.',
          'Sa se scrie un script care calculeaza valoarea de rang n din sirul lui Fibonacci. Valoarea n se preia ca argument sau se citeste de la tastatura.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`#!/bin/bash
if [ $# -ge 1 ]; then n=$1
else echo -n "Enter n: "; read n; fi

if [ $n -le 0 ]; then echo 0; exit; fi
if [ $n -eq 1 ]; then echo 1; exit; fi

a=0; b=1
for ((i=2; i<=n; i++)); do
  let c=a+b
  a=$b; b=$c
done
echo "Fibonacci($n) = $b"`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Iterative math #7: Arrangements A(n,k) */}
      <Section title={t('[Iterative math #7] Arrangements A(n,k)', '[Iterative math #7] Aranjamente A(n,k)')} id="lab_3-ank" checked={!!checked['lab_3-ank']} onCheck={() => toggleCheck('lab_3-ank')}>
        <p>{t(
          'Write a script that computes A(n,k) (arrangements of n taken k at a time). Values n and k from command-line or keyboard.',
          'Sa se scrie un script care calculeaza A(n,k) (aranjamente de n luate cate k). Valorile n si k din linia de comanda sau tastatura.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`#!/bin/bash
if [ $# -ge 2 ]; then n=$1; k=$2
else echo -n "Enter n: "; read n; echo -n "Enter k: "; read k; fi

let result=1
for ((i=n; i>n-k; i--)); do
  let result*=i
done
echo "A($n,$k) = $result"`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Iterative math #8: Sum groups of N */}
      <Section title={t('[Iterative math #8] Sum of arguments in groups of N', '[Iterative math #8] Suma argumentelor in grupuri de N')} id="lab_3-sumN" checked={!!checked['lab_3-sumN']} onCheck={() => toggleCheck('lab_3-sumN')}>
        <p>{t(
          'Write a script launched with 1+N*k+p arguments. The first argument is N. The script sums the following arguments in groups of N, printing each sum and writing them to output.txt. If no arguments, read N and N values from keyboard.',
          'Sa se scrie un script lansat cu 1+N*k+p argumente. Primul argument este N. Scriptul calculeaza suma urmatoarelor argumente luate cate N, afisand sumele si scriindu-le in output.txt. Fara argumente, citeste N si N valori de la tastatura.'
        )}</p>
        <p className="text-sm mt-1 italic">{t('Hint: man expr and help shift.', 'Indicatie: man expr si help shift.')}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`#!/bin/bash
if [ $# -eq 0 ]; then
  echo -n "Enter N: "; read N
  let sum=0
  for ((i=1; i<=N; i++)); do
    echo -n "Enter number $i: "; read val
    let sum+=val
  done
  echo "Sum = $sum"
  echo "$sum" > output.txt
  exit 0
fi

N=$1; shift
> output.txt  # clear output file
while [ $# -gt 0 ]; do
  let sum=0; let cnt=0
  while [ $cnt -lt $N ] && [ $# -gt 0 ]; do
    let sum+=$1
    shift; let cnt++
  done
  echo "Sum ($cnt values) = $sum"
  echo "$sum" >> output.txt
done`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Iterative math #9: Iterative Factorial */}
      <Section title={t('[Iterative math #9] Iterative Factorial', '[Iterative math #9] Factorial iterativ')} id="lab_3-ifact" checked={!!checked['lab_3-ifact']} onCheck={() => toggleCheck('lab_3-ifact')}>
        <p>{t(
          'Write a script that computes n! iteratively (n! = 1 * 2 * ... * n for n > 0). Value n from command-line or keyboard.',
          'Sa se scrie un script care calculeaza n! iterativ (n! = 1 * 2 * ... * n pentru n > 0). Valoarea n din linia de comanda sau tastatura.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`#!/bin/bash
if [ $# -ge 1 ]; then n=$1
else echo -n "Enter n: "; read n; fi

let result=1
for ((i=2; i<=n; i++)); do
  let result*=i
done
echo "$n! = $result"`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Cooperating iterative math #3 */}
      <Section title={t('[Cooperating iterative math #3] Producer-Consumer via env variable', '[Cooperating iterative math #3] Producer-Consumer prin variabila de mediu')} id="lab_3-coop3" checked={!!checked['lab_3-coop3']} onCheck={() => toggleCheck('lab_3-coop3')}>
        <p>{t(
          'Write two scripts that collaboratively compute the iterative sum of numbers > 1000 from a sequence. The producer filters numbers > 1000 into an environment variable "secventa1001", then calls the consumer script which processes that variable.',
          'Sa se scrie doua script-uri care calculeaza colaborativ suma iterativa a numerelor > 1000 dintr-o secventa. Producer-ul filtreaza numerele > 1000 intr-o variabila de mediu "secventa1001", apoi apeleaza consumer-ul care proceseaza acea variabila.'
        )}</p>
        <p className="text-sm mt-1">{t('Example:', 'Exemplu:')}</p>
        <Code>{`./producer.sh -10 3500 -54 2002 95 1000
# Output: Consumer: computed sum is 5502. (3500+2002)
# Producer: consumer's exit code is 0.`}</Code>

        <Toggle question={t('Solution', 'Solutie')} answer={
          <div>
            <p className="text-sm font-bold mb-1">producer.sh:</p>
            <Code>{`#!/bin/bash
if [ $# -ge 1 ]; then nums="$*"
else echo -n "Enter numbers: "; read nums; fi

export secventa1001=""
for n in $nums; do
  if [ $n -gt 1000 ]; then
    secventa1001="$secventa1001 $n"
  fi
done
export secventa1001

./consumer.sh
echo "Producer: consumer's exit code is $?."`}</Code>
            <p className="text-sm font-bold mt-3 mb-1">consumer.sh:</p>
            <Code>{`#!/bin/bash
if [ -z "$secventa1001" ]; then
  echo "Consumer: computed sum is NULL."
  exit 1
fi
let sum=0
for n in $secventa1001; do
  let sum+=n
done
echo "Consumer: computed sum is $sum."
exit 0`}</Code>
          </div>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Recursive math #4: Sum of prime digits */}
      <Section title={t('[Recursive math #4] Sum of prime digits', '[Recursive math #4] Suma cifrelor prime')} id="lab_3-rec4" checked={!!checked['lab_3-rec4']} onCheck={() => toggleCheck('lab_3-rec4')}>
        <p>{t(
          'Write a script that takes n (verify n > 0) and recursively computes the sum of its digits that are prime numbers.',
          'Sa se scrie un script care primeste n (verificati ca n > 0) si calculeaza recursiv suma cifrelor sale care sunt numere prime.'
        )}</p>
        <p className="text-sm mt-1">{t('Example: n=1235 -> 2+3+5=10; n=6274 -> 2+7=9', 'Exemplu: n=1235 -> 2+3+5=10; n=6274 -> 2+7=9')}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`#!/bin/bash
is_prime_digit() {
  case $1 in
    2|3|5|7) return 0 ;;
    *) return 1 ;;
  esac
}

sum_prime_digits() {
  local n=$1
  if [ $n -eq 0 ]; then
    echo 0; return
  fi
  local digit=$((n % 10))
  local rest=$((n / 10))
  local sub=$(sum_prime_digits $rest)
  if is_prime_digit $digit; then
    echo $((sub + digit))
  else
    echo $sub
  fi
}

if [ $# -ge 1 ]; then n=$1
else echo -n "Enter n: "; read n; fi

if [ $n -le 0 ]; then echo "Error: n must be > 0"; exit 1; fi
result=$(sum_prime_digits $n)
echo "Sum of prime digits of $n = $result"`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Recursive math #5: Complement inverse */}
      <Section title={t('[Recursive math #5] Reverse of 9-complement', '[Recursive math #5] Inversul complementului fata de 9')} id="lab_3-rec5" checked={!!checked['lab_3-rec5']} onCheck={() => toggleCheck('lab_3-rec5')}>
        <p>{t(
          'Write a script that takes n (verify n > 0) and recursively computes the reverse of the number obtained by complementing all digits with respect to 9.',
          'Sa se scrie un script care primeste n (verificati ca n > 0) si calculeaza recursiv inversul numarului obtinut prin complementarierea tuturor cifrelor fata de 9.'
        )}</p>
        <p className="text-sm mt-1">{t('Example: n=13950 -> 94068 (9-0=9, 9-5=4, 9-9=0, 9-3=6, 9-1=8); n=349 -> 56 (9-9=0, 9-4=5, 9-3=6)', 'Exemplu: n=13950 -> 94068 (9-0=9, 9-5=4, 9-9=0, 9-3=6, 9-1=8); n=349 -> 56 (9-9=0, 9-4=5, 9-3=6)')}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`#!/bin/bash
complement_reverse() {
  local n=$1
  local acc=$2   # accumulator for building result
  if [ $n -eq 0 ]; then
    echo $acc; return
  fi
  local digit=$((n % 10))
  local comp=$((9 - digit))
  local rest=$((n / 10))
  # Build reversed complement: acc = acc * 10 + comp
  # But skip leading zeros (when acc is 0 and comp is 0)
  if [ $acc -eq 0 ] && [ $comp -eq 0 ]; then
    complement_reverse $rest 0
  else
    complement_reverse $rest $((acc * 10 + comp))
  fi
}

if [ $# -ge 1 ]; then n=$1
else echo -n "Enter n: "; read n; fi

if [ $n -le 0 ]; then echo "Error: n must be > 0"; exit 1; fi
result=$(complement_reverse $n 0)
echo "Result: $result"`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Recursive math #6: Sequence x_m */}
      <Section title={t('[Recursive math #6] Sequence x_m = x_(m-1) + 4*x_(m-2) + m', '[Recursive math #6] Sirul x_m = x_(m-1) + 4*x_(m-2) + m')} id="lab_3-rec6" checked={!!checked['lab_3-rec6']} onCheck={() => toggleCheck('lab_3-rec6')}>
        <p>{t(
          'Write a script that takes n (verify n > 0) and recursively computes x_n where: x_0 = 1, x_1 = 2, x_m = x_(m-1) + 4*x_(m-2) + m for m >= 2.',
          'Sa se scrie un script care primeste n (verificati ca n > 0) si calculeaza recursiv x_n unde: x_0 = 1, x_1 = 2, x_m = x_(m-1) + 4*x_(m-2) + m pentru m >= 2.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`#!/bin/bash
compute_x() {
  local m=$1
  if [ $m -eq 0 ]; then echo 1; return; fi
  if [ $m -eq 1 ]; then echo 2; return; fi
  local x1=$(compute_x $((m-1)))
  local x2=$(compute_x $((m-2)))
  echo $((x1 + 4*x2 + m))
}

if [ $# -ge 1 ]; then n=$1
else echo -n "Enter n: "; read n; fi

if [ $n -lt 0 ]; then echo "Error: n must be >= 0"; exit 1; fi
result=$(compute_x $n)
echo "x_$n = $result"`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Recursive math #7: Sequence y_m */}
      <Section title={t('[Recursive math #7] Sequence y_m = (m+1)*y_(m-1) + (m+2)*y_(m-2)', '[Recursive math #7] Sirul y_m = (m+1)*y_(m-1) + (m+2)*y_(m-2)')} id="lab_3-rec7" checked={!!checked['lab_3-rec7']} onCheck={() => toggleCheck('lab_3-rec7')}>
        <p>{t(
          'Write a script that takes n (verify n > 0) and recursively computes y_n where: y_0 = 1, y_1 = 1, y_m = (m+1)*y_(m-1) + (m+2)*y_(m-2) for m >= 2.',
          'Sa se scrie un script care primeste n (verificati ca n > 0) si calculeaza recursiv y_n unde: y_0 = 1, y_1 = 1, y_m = (m+1)*y_(m-1) + (m+2)*y_(m-2) pentru m >= 2.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`#!/bin/bash
compute_y() {
  local m=$1
  if [ $m -eq 0 ]; then echo 1; return; fi
  if [ $m -eq 1 ]; then echo 1; return; fi
  local y1=$(compute_y $((m-1)))
  local y2=$(compute_y $((m-2)))
  echo $(( (m+1)*y1 + (m+2)*y2 ))
}

if [ $# -ge 1 ]; then n=$1
else echo -n "Enter n: "; read n; fi

if [ $n -lt 0 ]; then echo "Error: n must be >= 0"; exit 1; fi
result=$(compute_y $n)
echo "y_$n = $result"`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Recursive math #8: GCD */}
      <Section title={t('[Recursive math #8] GCD with Euclidean subtraction', '[Recursive math #8] CMMDC cu algoritmul lui Euclid cu scaderi')} id="lab_3-rec8" checked={!!checked['lab_3-rec8']} onCheck={() => toggleCheck('lab_3-rec8')}>
        <p>{t(
          'Write a script that recursively computes the greatest common divisor of two numbers a and b using Euclid\'s algorithm with subtractions.',
          'Sa se scrie un script care calculeaza recursiv cel mai mare divizor comun a doua numere a si b folosind algoritmul lui Euclid cu scaderi.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`#!/bin/bash
gcd() {
  local a=$1 b=$2
  if [ $a -eq $b ]; then echo $a; return; fi
  if [ $a -gt $b ]; then
    gcd $((a - b)) $b
  else
    gcd $a $((b - a))
  fi
}

if [ $# -ge 2 ]; then a=$1; b=$2
else echo -n "Enter a: "; read a; echo -n "Enter b: "; read b; fi

result=$(gcd $a $b)
echo "GCD($a, $b) = $result"`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* II) File processing scripts */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('II) File Processing Scripts', 'II) Script-uri de procesare a fisierelor')}
      </h3>
      <p className="text-sm mb-4 opacity-80">
        {t('In-class exercises:', 'Exercitii propuse spre rezolvare:')}
      </p>

      {/* Call2Find #3 */}
      <Section title={t('[Call2Find #3] Find and compile recently modified C files', '[Call2Find #3] Gasirea si compilarea fisierelor C modificate recent')} id="lab_3-c2f3" checked={!!checked['lab_3-c2f3']} onCheck={() => toggleCheck('lab_3-c2f3')}>
        <p>{t(
          'Write a script that takes a number (max depth), finds all regular files you own in ~ modified in the last 4 weeks up to that depth. If find fails, print error to stderr and exit 1. For each file: if it\'s a C source (file command reports "C source"), compile it; otherwise display its modification date.',
          'Sa se scrie un script care primeste un numar (adancime maxima), gaseste toate fisierele de tip normal din ~ modificate in ultimele 4 saptamani pana la acea adancime. Daca find esueaza, afiseaza eroare pe stderr si exit 1. Pentru fiecare fisier: daca e sursa C (comanda file raporteaza "C source"), compileaza-l; altfel afiseaza data modificarii.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`#!/bin/bash
if [ $# -ge 1 ]; then depth=$1
else echo -n "Enter max depth: "; read depth; fi

files=$(find ~ -maxdepth $depth -type f -user $(whoami) -mtime -28 2>/dev/null)
if [ $? -ne 0 ]; then
  echo "Command find has failed!" >&2; exit 1
fi

for f in $files; do
  type_info=$(file "$f")
  if echo "$type_info" | grep -q "C source"; then
    exe=$(echo "$f" | sed 's/\\.c$//')
    gcc "$f" -o "$exe" -Wall
    if [ $? -eq 0 ]; then
      echo "$f -> Compilat ok!"
    else
      echo "$f -> Eroare la compilare!"
    fi
  else
    echo "$(stat -c '%y' "$f") $f"
  fi
done`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Cooperating MyFind #1 */}
      <Section title={t('[Cooperating MyFind #1] Recursive SHA256 of bash scripts', '[Cooperating MyFind #1] SHA256 recursiv al script-urilor bash')} id="lab_3-cmf1" checked={!!checked['lab_3-cmf1']} onCheck={() => toggleCheck('lab_3-cmf1')}>
        <p>{t(
          'Write two scripts. The first validates a directory argument (exists, readable, traversable) and calls the second from a "subfolder" subdirectory. The second recursively traverses the directory (explicitly, no find/ls -R): for bash scripts, compute SHA256 and display; for other regular files, display name and newline count on stderr. At the end, display total bash script count.',
          'Sa se scrie doua script-uri. Primul valideaza argumentul director (exista, citibil, traversabil) si apeleaza al doilea dintr-un subdirector "subfolder". Al doilea parcurge recursiv directorul (explicit, fara find/ls -R): pentru script-uri bash, calculeaza SHA256 si afiseaza; pentru alte fisiere normale, afiseaza numele si numarul de newline pe stderr. La final afiseaza totalul script-urilor bash.'
        )}</p>
        <Toggle question={t('Hints', 'Indicatii')} answer={
          <div>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>{t('Recursion can be via recursive function or recursive script call', 'Recursia poate fi prin functie recursiva sau apel recursiv de script')}</li>
              <li>{t('Use "file" command to check if content is "Bourne-Again shell script"', 'Folositi comanda "file" pentru a verifica daca continutul este "Bourne-Again shell script"')}</li>
              <li>{t('Use sha256sum to compute the hash', 'Folositi sha256sum pentru a calcula hash-ul')}</li>
              <li>{t('Exit code 0 if total > 0, else -1', 'Codul de exit 0 daca totalul > 0, altfel -1')}</li>
            </ul>
          </div>
        } showLabel={t('Show Hints', 'Arata indicatiile')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Homework: file processing */}
      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('Homework: File Processing Scripts', 'Tema: Script-uri de procesare a fisierelor')}
      </h3>

      {/* MyFind #4 */}
      <Section title={t('[MyFind #4] Count words and longest line (recursive)', '[MyFind #4] Numararea cuvintelor si cea mai lunga linie (recursiv)')} id="lab_3-mf4" checked={!!checked['lab_3-mf4']} onCheck={() => toggleCheck('lab_3-mf4')}>
        <p>{t(
          'Write a script that computes the total word count and the longest line length from all ASCII text files in a given directory, traversing explicitly and recursively (without find or ls -R). Display totals per subdirectory.',
          'Sa se scrie un script care calculeaza numarul total de cuvinte si lungimea celei mai lungi linii din toate fisierele ASCII text dintr-un director dat, parcurgand explicit si recursiv (fara find sau ls -R). Afisati totalurile per subdirector.'
        )}</p>
        <Toggle question={t('Hints', 'Indicatii')} answer={
          <div>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>{t('Use the file command to detect "ASCII text" files', 'Folositi comanda file pentru a detecta fisierele "ASCII text"')}</li>
              <li>{t('Use wc -w for word count and wc -L for longest line', 'Folositi wc -w pentru numararea cuvintelor si wc -L pentru cea mai lunga linie')}</li>
              <li>{t('Implement recursion via function or script self-call with source', 'Implementati recursia prin functie sau auto-apel de script cu source')}</li>
            </ul>
          </div>
        } showLabel={t('Show Hints', 'Arata indicatiile')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Cooperating MyFind #2 */}
      <Section title={t('[Cooperating MyFind #2] Recursive: count C source lines', '[Cooperating MyFind #2] Recursiv: numara liniile din surse C')} id="lab_3-cmf2" checked={!!checked['lab_3-cmf2']} onCheck={() => toggleCheck('lab_3-cmf2')}>
        <p>{t(
          'Write two scripts. The first validates a directory argument (exists, readable) and calls the second from "subdir_sh". The second recursively traverses the directory (explicitly): for C source files, display line count and name; for other regular files, display name and first 5 lines on stderr. At the end, display total C source line count.',
          'Sa se scrie doua script-uri. Primul valideaza argumentul director (exista, citibil) si apeleaza al doilea din "subdir_sh". Al doilea parcurge recursiv directorul (explicit): pentru surse C, afiseaza numarul de linii si numele; pentru alte fisiere normale, afiseaza numele si primele 5 linii pe stderr. La final afiseaza totalul liniilor din surse C.'
        )}</p>
        <Toggle question={t('Hints', 'Indicatii')} answer={
          <div>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>{t('Use "file" command to check for "C source" content', 'Folositi comanda "file" pentru a verifica continutul "C source"')}</li>
              <li>{t('Use wc -l for line count and head -5 for first 5 lines', 'Folositi wc -l pentru numarul de linii si head -5 pentru primele 5 linii')}</li>
              <li>{t('Exit 0 if total lines > 0, else exit 1', 'Exit 0 daca totalul liniilor > 0, altfel exit 1')}</li>
            </ul>
          </div>
        } showLabel={t('Show Hints', 'Arata indicatiile')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Call2Find #4 */}
      <Section title={t('[Call2Find #4] Find and process files with read+write', '[Call2Find #4] Gasirea si procesarea fisierelor cu read+write')} id="lab_3-c2f4" checked={!!checked['lab_3-c2f4']} onCheck={() => toggleCheck('lab_3-c2f4')}>
        <p>{t(
          'Write a script that takes a number (min depth), finds all regular files you own in ~ from that minimum depth where the owner has read AND write. If find fails, print error to stderr and exit 2. For bash scripts: add execute permission for all users and display name with new permissions. For other files: display octal permissions and name.',
          'Sa se scrie un script care primeste un numar (adancime minima), gaseste toate fisierele de tip normal din ~ de la acea adancime minima unde proprietarul are citire SI scriere. Daca find esueaza, afiseaza eroare pe stderr si exit 2. Pentru script-uri bash: adaugati permisiune de executie pentru toti si afisati numele cu permisiunile noi. Pentru alte fisiere: afisati permisiunile in octal si numele.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`#!/bin/bash
if [ $# -ge 1 ]; then depth=$1
else echo -n "Enter min depth: "; read depth; fi

files=$(find ~ -mindepth $depth -type f -user $(whoami) -perm -u=rw 2>/dev/null)
if [ $? -ne 0 ]; then
  echo "The find command has failed!" >&2; exit 2
fi

for f in $files; do
  type_info=$(file "$f")
  if echo "$type_info" | grep -q "Bourne-Again shell script"; then
    chmod a+x "$f"
    echo "$(stat -c '%A' "$f") $f"
  else
    echo "$(stat -c '%a' "$f") $f"
  fi
done`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Call2Find #5: MP3 playlist */}
      <Section title={t('[Call2Find #5] Scan for MP3 files and create HTML playlist', '[Call2Find #5] Scanarea fisierelor MP3 si crearea unui playlist HTML')} id="lab_3-c2f5" checked={!!checked['lab_3-c2f5']} onCheck={() => toggleCheck('lab_3-c2f5')}>
        <p>{t(
          'Write a script that scans a directory (default: ~) for MP3 files, creates hard links in ~/html/muzica/, generates an HTML playlist in ~/html/, and sets appropriate permissions for web access.',
          'Sa se scrie un script care scaneaza un director (implicit: ~) pentru fisiere MP3, creeaza link-uri hard in ~/html/muzica/, genereaza un playlist HTML in ~/html/ si seteaza permisiunile adecvate pentru acces web.'
        )}</p>
        <p className="text-sm mt-1 italic">{t('Hints: Use ln for hard links, basename for file names without extension.', 'Indicatii: Folositi ln pentru link-uri hard, basename pentru numele fara extensie.')}</p>
        <Toggle question={t('Solution outline', 'Schita solutiei')} answer={
          <Code>{`#!/bin/bash
dir=\${1:-~}
mkdir -p ~/html/muzica

# Start HTML
echo "<html><body><h1>Playlist</h1><ul>" > ~/html/playlist.html

for f in $(find "$dir" -name "*.mp3" -type f); do
  name=$(basename "$f")
  name_noext=$(basename "$f" .mp3)
  ln "$f" ~/html/muzica/"$name" 2>/dev/null
  echo "<li><a href=\\"muzica/$name\\">$name_noext</a></li>" >> ~/html/playlist.html
done

echo "</ul></body></html>" >> ~/html/playlist.html

# Set permissions for web access
chmod o+x ~ ~/html ~/html/muzica
chmod o+r ~/html/playlist.html`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Call2Find #6: Image gallery */}
      <Section title={t('[Call2Find #6] Build HTML page with image links', '[Call2Find #6] Construirea unei pagini HTML cu link-uri catre imagini')} id="lab_3-c2f6" checked={!!checked['lab_3-c2f6']} onCheck={() => toggleCheck('lab_3-c2f6')}>
        <p>{t(
          'Write a script that builds an HTML web page with links to all image files (.jpg, .gif, .png, etc.) in your personal account, ordered by last modification date. Ensure proper permissions for web visibility.',
          'Sa se scrie un script care construieste o pagina web HTML cu link-uri catre toate fisierele imagine (.jpg, .gif, .png etc.) din contul personal, ordonate dupa data ultimei modificari. Asigurati permisiuni adecvate pentru vizibilitate web.'
        )}</p>
        <Toggle question={t('Solution outline', 'Schita solutiei')} answer={
          <Code>{`#!/bin/bash
echo "<html><body><h1>Image Gallery</h1><ul>" > ~/html/gallery.html

find ~ \\( -name "*.jpg" -o -name "*.gif" -o -name "*.png" \\) \\
  -type f -printf "%T@ %p\\n" | sort -n | cut -d' ' -f2 |
while read f; do
  name=$(basename "$f")
  echo "<li><a href=\\"$f\\">$name</a></li>" >> ~/html/gallery.html
done

echo "</ul></body></html>" >> ~/html/gallery.html
chmod o+rx ~ ~/html
chmod o+r ~/html/gallery.html`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* MyLast */}
      <Section title={t('[MyLast] Last 3 logins per user', '[MyLast] Ultimele 3 conectari per utilizator')} id="lab_3-mylast" checked={!!checked['lab_3-mylast']} onCheck={() => toggleCheck('lab_3-mylast')}>
        <p>{t(
          'Write a script that reads usernames from stdin and, for each user, displays their last 3 logins this month. If not logged in, display "User X has never logged in!".',
          'Sa se scrie un script care citeste nume de utilizatori de la stdin si, pentru fiecare utilizator, afiseaza ultimele 3 conectari din luna curenta. Daca nu s-a conectat, afiseaza "Utilizatorul X nu s-a conectat niciodata!".'
        )}</p>
        <p className="text-sm mt-1 italic">{t('Hint: use the last command.', 'Indicatie: folositi comanda last.')}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`#!/bin/bash
while true; do
  echo -n "Enter username (or 'q' to quit): "; read user
  if [ "$user" = "q" ]; then break; fi

  logins=$(last "$user" | head -3 | grep -v "^$")
  if [ -z "$logins" ]; then
    echo "Utilizatorul $user nu s-a conectat niciodata!"
  else
    echo "Last 3 logins for $user:"
    echo "$logins"
  fi
  echo
done`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* MyZip */}
      <Section title={t('[MyZip] Archive text and script files', '[MyZip] Arhivarea fisierelor text si script')} id="lab_3-myzip" checked={!!checked['lab_3-myzip']} onCheck={() => toggleCheck('lab_3-myzip')}>
        <p>{t(
          'Write a script that takes a directory and archives all .txt files with gzip and all .sh files with zip (replacing .sh extension with .zip). Not recursive.',
          'Sa se scrie un script care primeste un director si arhiveaza toate fisierele .txt cu gzip si toate fisierele .sh cu zip (inlocuind extensia .sh cu .zip). Nu recursiv.'
        )}</p>
        <Toggle question={t('Solution', 'Solutie')} answer={
          <Code>{`#!/bin/bash
if [ $# -ge 1 ]; then dir=$1
else echo -n "Enter directory: "; read dir; fi

# Archive .txt files with gzip
for f in "$dir"/*.txt; do
  if [ -f "$f" ]; then
    gzip "$f"
    echo "gzip: $f -> $f.gz"
  fi
done

# Archive .sh files with zip
for f in "$dir"/*.sh; do
  if [ -f "$f" ]; then
    base=\${f%.sh}
    zip "$base.zip" "$f"
    echo "zip: $f -> $base.zip"
  fi
done`}</Code>
        } showLabel={t('Show Solution', 'Arata solutia')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* III) Debugging scripts with errors */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <h3 className="text-lg font-bold mt-8 mb-3">
        {t('III) Debugging Scripts with Errors', 'III) Corectarea script-urilor cu erori')}
      </h3>

      {/* Error script #2 */}
      <Section title={t('[Error script #2] Fix a script to count subdirectories', '[Script cu erori #2] Corectarea unui script care numara subdirectoare')} id="lab_3-err2" checked={!!checked['lab_3-err2']} onCheck={() => toggleCheck('lab_3-err2')}>
        <p>{t(
          'A script is given that should display the number of subdirectories in /usr/share followed by the number of parameters it was called with. i) Explain what the script outputs. ii) Fix all syntax and semantic errors.',
          'Se da un script care trebuie sa afiseze numarul subdirectoarelor din /usr/share urmat de numarul parametrilor cu care a fost apelat. i) Explicati ce afiseaza scriptul. ii) Corectati toate erorile sintactice si semantice.'
        )}</p>
        <Toggle question={t('Debugging approach', 'Abordarea de depanare')} answer={
          <div>
            <p className="text-sm mb-2">{t('Steps:', 'Pasi:')}</p>
            <ol className="list-decimal pl-5 text-sm space-y-1">
              <li>{t('Run bash -n to find syntax errors', 'Rulati bash -n pentru a gasi erorile de sintaxa')}</li>
              <li>{t('Execute the script, identify error messages', 'Executati scriptul, identificati mesajele de eroare')}</li>
              <li>{t('Fix syntax errors one by one', 'Corectati erorile de sintaxa una cate una')}</li>
              <li>{t('Check for semantic bugs (script runs but produces wrong output)', 'Verificati bug-urile semantice (scriptul ruleaza dar produce output gresit)')}</li>
            </ol>
            <p className="text-sm mt-2">{t('Common bash errors: missing spaces in [ ], wrong variable references, missing then/fi/done, wrong operator in tests.', 'Erori bash comune: spatii lipsa in [ ], referinte gresite la variabile, then/fi/done lipsa, operator gresit in teste.')}</p>
          </div>
        } showLabel={t('Show approach', 'Arata abordarea')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>

      {/* Error script #3 */}
      <Section title={t('[Error script #3] Fix a factorial script', '[Script cu erori #3] Corectarea unui script de factorial')} id="lab_3-err3" checked={!!checked['lab_3-err3']} onCheck={() => toggleCheck('lab_3-err3')}>
        <p>{t(
          'A script is given that should display the factorial of the number received as parameter. i) Explain what the script outputs. ii) Fix all syntax and semantic errors so it correctly computes the factorial.',
          'Se da un script care trebuie sa afiseze factorialul numarului primit ca parametru. i) Explicati ce afiseaza scriptul. ii) Corectati toate erorile sintactice si semantice ca sa calculeze corect factorialul.'
        )}</p>
        <Toggle question={t('Debugging approach', 'Abordarea de depanare')} answer={
          <div>
            <p className="text-sm mb-2">{t('Steps:', 'Pasi:')}</p>
            <ol className="list-decimal pl-5 text-sm space-y-1">
              <li>{t('Run bash -n script.sh to check syntax', 'Rulati bash -n script.sh pentru verificarea sintaxei')}</li>
              <li>{t('Run bash -x script.sh 5 to trace execution', 'Rulati bash -x script.sh 5 pentru trasarea executiei')}</li>
              <li>{t('Compare expected vs actual behavior at each step', 'Comparati comportamentul asteptat vs cel real la fiecare pas')}</li>
              <li>{t('Fix errors: check loop bounds, multiplication operator, variable initialization', 'Corectati erorile: verificati limitele buclei, operatorul de inmultire, initializarea variabilelor')}</li>
            </ol>
          </div>
        } showLabel={t('Show approach', 'Arata abordarea')} hideLabel={t('Hide', 'Ascunde')} />
      </Section>
    </>
  );
}
