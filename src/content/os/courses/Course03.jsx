import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Course03() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
              <p className="mb-3 text-sm opacity-80">{t('Source: OS(1) - Ghid de utilizare Linux (IV), Cristian Vidrascu, UAIC', 'Sursă: OS(1) - Ghid de utilizare Linux (IV), Cristian Vidrascu, UAIC')}</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Foaie de parcurs:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('Shell scripts & shebang', 'Scripturi shell și shebang')}</li>
                  <li>{t('Variables (definition, substitution, assignment)', 'Variabile (definire, substituție, atribuire)')}</li>
                  <li>{t('String operations (length, substring, prefix/suffix removal)', 'Operații pe șiruri (lungime, substring, eliminare prefix/sufix)')}</li>
                  <li>{t('Positional parameters & special variables', 'Parametri pozițional și variabile speciale')}</li>
                  <li>{t('Useful built-in commands (read, export, shift, eval, set)', 'Comenzi interne utile (read, export, shift, eval, set)')}</li>
                  <li>{t('Arithmetic expressions (let, expr, bc, $((...)))', 'Expresii aritmetice (let, expr, bc, $((...)))')}</li>
                  <li>{t('Conditional expressions (test, [ ], [[ ]])', 'Expresii condiționale (test, [ ], [[ ]])')}</li>
                  <li>{t('Control structures: if/elif/else/fi, case/esac', 'Structuri de control: if/elif/else/fi, case/esac')}</li>
                  <li>{t('Loops: while, until, for, select', 'Bucle: while, until, for, select')}</li>
                  <li>{t('Shell functions', 'Funcții shell')}</li>
                </ol>
              </Box>

              <Section title={t('1. Shell Scripts & the Shebang', '1. Scripturi shell și shebang')} id="course_3-scripts" checked={!!checked['course_3-scripts']} onCheck={() => toggleCheck('course_3-scripts')}>
                <p>{t('A ', 'Un ')}<strong>{t('shell script', 'script shell')}</strong>{t(' is a text file containing a sequence of UNIX commands. The first line (the ', ' este un fișier text care conține o secvență de comenzi UNIX. Prima linie (')}<strong>{t('shebang', 'shebang')}</strong>{t(') tells the system which interpreter to use.', ') indică sistemului ce interpretor să folosească.')}</p>
                <Code>{`#!/bin/bash
# This is a comment
echo "Hello, $1!"
ps -f`}</Code>

                <Box type="formula">
                  <p className="font-bold">{t('Making a script executable and running it:', 'Cum faceți un script executabil și îl rulați:')}</p>
                  <Code>{`$ chmod u+x Hello.sh
$ ./Hello.sh world       # Method 1: direct (needs shebang + x perm)
$ bash Hello.sh world    # Method 2: explicit shell
$ source Hello.sh world  # Method 3: current shell (no new process)`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p>{t('With ', 'Cu ')} <code>source</code>{t(', no new process is created. The ', ', nu se creează niciun proces nou. Ieșirea ')} <code>ps -f</code> {t('output shows only the current shell. With ', 'afișează doar shell-ul curent. Cu ')} <code>./Hello.sh</code>{t(', you see a child ', ', vedeți un proces copil ')} <code>/bin/bash ./Hello.sh</code>{t(' process.', '.')}</p>
                </Box>
              </Section>

              <Section title={t('2. Variables', '2. Variabile')} id="course_3-vars" checked={!!checked['course_3-vars']} onCheck={() => toggleCheck('course_3-vars')}>
                <p>{t('Shell variables are ', 'Variabilele shell sunt ')}<strong>{t('string-typed by default', 'de tip șir implicit')}</strong>{t(", don't need declaration, and are created on first assignment.", ', nu necesită declarare și sunt create la prima atribuire.')}</p>

                <Box type="formula">
                  <p className="font-bold">{t('Assignment & substitution:', 'Atribuire și substituție:')}</p>
                  <Code>{`v=123          # Assign (NO spaces around =!)
echo $v        # Substitution: prints "123"
echo \${v}xyz   # Use braces when followed by text: "123xyz"
v=abc\${v}xyz   # v is now "abc123xyz"
unset v        # Destroy variable
v=             # Equivalent: set to empty string`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Critical trap - spaces around =:', 'Capcană critică - spații în jurul =:')}</p>
                  <Code>{`v = 123    # WRONG! Shell interprets "v" as command, "=" as arg
v=123      # CORRECT`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('String operations:', 'Operații pe șiruri:')}</p>
                  <Code>{`word="Hello World"
echo \${#word}         # Length: 11
echo \${word:0:5}      # Substring: "Hello" (start:length)
echo \${word:6}        # From position 6: "World"

path="/home/user/docs/file.c"
echo \${path##*/}      # Remove longest prefix */: "file.c"
echo \${path%.*}       # Remove shortest suffix .*: "/home/user/docs/file"
echo \${path%.c}.txt   # Replace .c with .txt`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Pattern removal mnemonic:', 'Regulă mnemonică pentru eliminarea șablonului:')}</p>
                  <p><code>#</code> {t('removes from the ', 'elimină din ')}<strong>{t('front', 'față')}</strong>{t(' (# is on the left of $). ', ' (# este la stânga lui $). ')} <code>%</code> {t('removes from the ', 'elimină din ')}<strong>{t('back', 'spate')}</strong>{t('. Double (', '. Dublu (')} <code>##</code>{t(', ', ', ')} <code>%%</code>{t(') = greedy (longest match). Single = shortest match.', ') = lacom (potrivire cea mai lungă). Simplu = potrivire cea mai scurtă.')}</p>
                </Box>
              </Section>

              <Section title={t('3. Special Variables & Positional Parameters', '3. Variabile speciale și parametri pozițional')} id="course_3-special" checked={!!checked['course_3-special']} onCheck={() => toggleCheck('course_3-special')}>
                <Box type="formula">
                  <p className="font-bold">{t('Positional parameters:', 'Parametri pozițional:')}</p>
                  <table className="text-sm mt-1">
                    <tbody>
                      <tr><td className="pr-4 font-mono">$0</td><td>{t('Script name', 'Numele scriptului')}</td></tr>
                      <tr><td className="font-mono">$1..$9, ${'{10}'}</td><td>{t('Arguments passed to script/function', 'Argumente transmise scriptului/funcției')}</td></tr>
                      <tr><td className="font-mono">$#</td><td>{t('Number of arguments', 'Numărul de argumente')}</td></tr>
                      <tr><td className="font-mono">$*</td><td>{t('All arguments as one string (when quoted)', 'Toate argumentele ca un singur șir (când este citat)')}</td></tr>
                      <tr><td className="font-mono">$@</td><td>{t('All arguments as separate strings (when quoted)', 'Toate argumentele ca șiruri separate (când este citat)')}</td></tr>
                      <tr><td className="font-mono">$$</td><td>{t('PID of current shell', 'PID-ul shell-ului curent')}</td></tr>
                      <tr><td className="font-mono">$?</td><td>{t('Exit code of last foreground command', 'Codul de exit al ultimei comenzi din foreground')}</td></tr>
                      <tr><td className="font-mono">$!</td><td>{t('PID of last background process', 'PID-ul ultimului proces din background')}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <p className="font-bold mt-2">{t('Example - "$*" vs "$@":', 'Exemplu - "$*" vs "$@":')}</p>
                <Code>{`#!/bin/bash
function count_params() { echo "Count: $#, All: $*"; }
count_params "$*"   # Count: 1, All: a b c  (one string)
count_params "$@"   # Count: 3, All: a b c  (three strings)
# Run with: ./script.sh a b c`}</Code>

                <Box type="definition">
                  <p className="font-bold">{t('Key built-in commands:', 'Comenzi interne importante:')}</p>
                  <Code>{`read -p "Enter n:" n    # Read input into variable n
export VAR=value       # Make variable visible to child processes
shift [n]              # Shift positional params left by n (default 1)
eval "cmd"             # Evaluate and execute string as command
set -x                 # Debug mode (print each command before execution)
set -n                 # Syntax check only (don't execute)`}</Code>
                </Box>
              </Section>

              <Section title={t('4. Arithmetic Expressions', '4. Expresii aritmetice')} id="course_3-arith" checked={!!checked['course_3-arith']} onCheck={() => toggleCheck('course_3-arith')}>
                <Box type="formula">
                  <p className="font-bold">{t('Four ways to do arithmetic:', 'Patru moduri de a face aritmetică:')}</p>
                  <Code>{`# 1. let command
let v=v-1
let "v += 2 ** 3"    # v += 8

# 2. expr (external command, note escaping)
v=$(expr $v + 10)
expr 1 + 2 \\* 3     # prints 7

# 3. Arithmetic expansion $(( ))
a=$(( 4 + 5 ))       # a = 9
(( a += 10 ))        # a = 19
echo $((0xFFFF))     # 65535 (hex)
echo $((4#1203))     # 99 (base 4)

# 4. bc (floating-point capable)
echo "3/2" | bc -l              # 1.500...
echo "scale=4; 3/2" | bc        # 1.5000
echo "scale=5; sqrt(2)" | bc    # 1.41421`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Trap with expr:', 'Capcană cu expr:')}</p>
                  <p><code>*</code> {t('must be escaped as ', 'trebuie escapat ca ')} <code>\*</code> {t('because the shell would glob-expand it otherwise. Spaces around operators are mandatory in ', 'deoarece shell-ul l-ar expanda altfel prin glob. Spațiile în jurul operatorilor sunt obligatorii în ')} <code>expr</code>{t('.', '.')}</p>
                </Box>

                <Box type="definition">
                  <p className="font-bold">{t('Typed variables:', 'Variabile cu tip specificat:')}</p>
                  <Code>{`declare -i n    # integer variable (arithmetic without let)
n=5*4           # n=20 (automatic evaluation!)
declare -a arr  # array variable
arr[0]=hello; arr[1]=world
echo \${arr[1]} # "world"`}</Code>
                </Box>
              </Section>

              <Section title={t('5. Conditional Expressions (test)', '5. Expresii condiționale (test)')} id="course_3-test" checked={!!checked['course_3-test']} onCheck={() => toggleCheck('course_3-test')}>
                <Box type="formula">
                  <p className="font-bold">{t('test / [ ] syntax:', 'Sintaxa test / [ ]:')}</p>
                  <Code>{`# String comparisons
test -z "$s"       # true if s has length 0
test -n "$s"       # true if s is non-empty
test "$a" = "$b"   # string equality
test "$a" != "$b"  # string inequality

# Integer comparisons
test $a -eq $b     # equal
test $a -ne $b     # not equal
test $a -gt $b     # greater than
test $a -lt $b     # less than
test $a -ge $b     # greater or equal
test $a -le $b     # less or equal

# File tests
test -e file       # exists
test -f file       # is regular file
test -d file       # is directory
test -r file       # is readable
test -w file       # is writable
test -x file       # is executable
test -s file       # is non-empty

# Logical operators
test ! cond        # NOT
test c1 -a c2      # AND
test c1 -o c2      # OR`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p>{t('In ', 'În ')} <code>[ condition ]</code>{t(', the spaces after ', ', spațiile după ')} <code>[</code> {t('and before ', 'și înainte de ')} <code>]</code> {t('are ', 'sunt ')}<strong>{t('mandatory', 'obligatorii')}</strong>{t('. ', '. ')} <code>[</code> {t('is actually a command (synonym for ', 'este de fapt o comandă (sinonim pentru ')} <code>test</code>{t('), and ', '), iar ')} <code>]</code> {t('is its last argument.', 'este ultimul său argument.')}</p>
                </Box>
              </Section>

              <Section title={t('6. Control Structures', '6. Structuri de control')} id="course_3-control" checked={!!checked['course_3-control']} onCheck={() => toggleCheck('course_3-control')}>

                {/* SVG: Control flow diagram */}
                <svg viewBox="0 0 480 170" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="10" width="90" height="40" rx="6" fill="#3b82f6" opacity="0.15" stroke="#3b82f6"/>
                  <text x="55" y="34" textAnchor="middle" fill="#3b82f6" fontWeight="bold">if/elif/fi</text>
                  <rect x="120" y="10" width="90" height="40" rx="6" fill="#f59e0b" opacity="0.15" stroke="#f59e0b"/>
                  <text x="165" y="34" textAnchor="middle" fill="#f59e0b" fontWeight="bold">case/esac</text>
                  <rect x="10" y="70" width="75" height="35" rx="6" fill="#10b981" opacity="0.15" stroke="#10b981"/>
                  <text x="47" y="92" textAnchor="middle" fill="#10b981" fontWeight="bold">while</text>
                  <rect x="95" y="70" width="75" height="35" rx="6" fill="#10b981" opacity="0.15" stroke="#10b981"/>
                  <text x="132" y="92" textAnchor="middle" fill="#10b981" fontWeight="bold">until</text>
                  <rect x="180" y="70" width="75" height="35" rx="6" fill="#10b981" opacity="0.15" stroke="#10b981"/>
                  <text x="217" y="92" textAnchor="middle" fill="#10b981" fontWeight="bold">for</text>
                  <rect x="265" y="70" width="75" height="35" rx="6" fill="#10b981" opacity="0.15" stroke="#10b981"/>
                  <text x="302" y="92" textAnchor="middle" fill="#10b981" fontWeight="bold">select</text>
                  <text x="55" y="140" textAnchor="middle" fill="currentColor" fontSize="9">{t('Alternatives', 'Alternative')}</text>
                  <text x="180" y="140" textAnchor="middle" fill="currentColor" fontSize="9">{t('Loops', 'Bucle')}</text>
                  <rect x="350" y="10" width="110" height="40" rx="6" fill="#ef4444" opacity="0.12" stroke="#ef4444"/>
                  <text x="405" y="28" textAnchor="middle" fill="#ef4444" fontSize="9">break, continue</text>
                  <text x="405" y="42" textAnchor="middle" fill="#ef4444" fontSize="9">exit, return</text>
                </svg>

                <Box type="formula">
                  <p className="font-bold">if/elif/else:</p>
                  <Code>{`if [ $# -eq 0 ]; then
    echo "No arguments"
elif [ $# -eq 1 ]; then
    echo "One argument: $1"
else
    echo "Multiple arguments: $@"
fi`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">case:</p>
                  <Code>{`case "$1" in
    start)  echo "Starting..." ;;
    stop)   echo "Stopping..." ;;
    *)      echo "Usage: $0 {start|stop}" ;;
esac`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">while / until:</p>
                  <Code>{`# while: loop while condition is TRUE (exit 0)
i=1
while [ $i -le 5 ]; do
    echo $i
    let i++
done

# until: loop while condition is FALSE (exit ≠ 0)
until [ $i -gt 10 ]; do
    echo $i
    let i++
done`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('for (two forms):', 'for (două forme):')}</p>
                  <Code>{`# Form 1: iterate over a list
for f in *.c; do
    echo "Compiling $f..."
    gcc -c "$f"
done

# Form 2: C-style (arithmetic)
for (( i=0; i<10; i++ )); do
    echo $i
done

# Using seq:
for v in $(seq 1 2 10); do echo $v; done  # 1 3 5 7 9`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('select (interactive menu):', 'select (meniu interactiv):')}</p>
                  <Code>{`select opt in "Option A" "Option B" "Quit"; do
    case $opt in
        "Option A") echo "You chose A" ;;
        "Option B") echo "You chose B" ;;
        "Quit")     break ;;
        *)          echo "Invalid" ;;
    esac
done
# Terminates with CTRL+D (EOF)`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p>{t('The ', 'Condiția ')} <code>while</code> {t('condition checks the exit status of the ', 'verifică valoarea de exit a ')}<strong>{t('entire command list', 'întregii liste de comenzi')}</strong>{t(', not a boolean expression. ', ', nu o expresie booleană. ')} <code>while read line</code> {t('is idiomatic because ', 'este idiomul standard deoarece ')} <code>read</code> {t('returns non-zero at EOF.', 'returnează non-zero la EOF.')}</p>
                </Box>
              </Section>

              <Section title={t('7. Shell Functions', '7. Funcții shell')} id="course_3-funcs" checked={!!checked['course_3-funcs']} onCheck={() => toggleCheck('course_3-funcs')}>
                <Box type="formula">
                  <p className="font-bold">{t('Function declaration:', 'Declararea funcțiilor:')}</p>
                  <Code>{`function my_func() {
    echo "Called with $# args: $@"
    return 0   # optional return code
}
# Or without 'function' keyword:
my_func() { echo "Hello"; }

# Calling:
my_func arg1 arg2

# Access args inside function: $1, $2, $#, $@
# These SHADOW the script's positional params!`}</Code>
                </Box>

                <p className="font-bold mt-2">{t('Example - a listing function:', 'Exemplu - o funcție de listare:')}</p>
                <Code>{`function my_listing() {
    echo "Listing: $1"
    if test -d "$1"; then
        ls -lA "$1"
    else
        echo "Error: not a directory"
    fi
}
my_listing /home`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Key differences from C functions:', 'Diferențe esențiale față de funcțiile C:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>{t('Parentheses ', 'Parantezele ')} <code>()</code> {t('are ALWAYS empty in the declaration — arguments are accessed via ', 'sunt ÎNTOTDEAUNA goale în declarare — argumentele sunt accesate prin ')} <code>$1, $2...</code></li>
                    <li>{t('Variables are ', 'Variabilele sunt ')}<strong>{t('global by default', 'globale implicit')}</strong>{t('. Use ', '. Folosiți ')} <code>local var=val</code> {t('for local scope', 'pentru domeniu local')}</li>
                    <li>{t('Functions run in the ', 'Funcțiile rulează în ')}<strong>{t('same process', 'același proces')}</strong>{t(' (unlike scripts called with ./)', ' (spre deosebire de scripturile apelate cu ./)')}</li>
                    <li><code>return</code> {t('sets exit status (0-255), not a value. Use ', 'setează valoarea de exit (0-255), nu o valoare. Folosiți ')} <code>echo</code> {t('+ command substitution to "return" data', '+ substituția comenzii pentru a "returna" date')}</li>
                  </ul>
                </Box>
              </Section>

              <Section title={t('Cheat Sheet', 'Foaie de referință rapidă')} id="course_3-cheat" checked={!!checked['course_3-cheat']} onCheck={() => toggleCheck('course_3-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">{t('Variables', 'Variabile')}</p><p>var=val, $var, ${'{var}'}, ${'{#var}'}</p><p>${'{var:start:len}'}, ${'{var#pat}'}, ${'{var%pat}'}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Special vars', 'Variabile speciale')}</p><p>$0 $1..$9 $# $@ $* $$ $? $!</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Arithmetic', 'Aritmetică')}</p><p>let, expr, $((...)), bc</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Tests', 'Teste')}</p><p>-z -n = != -eq -ne -gt -lt -ge -le</p><p>-e -f -d -r -w -x -s ! -a -o</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Control', 'Control')}</p><p>if/elif/else/fi, case/esac</p><p>while/until/for/select + do/done</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Functions', 'Funcții')}</p><p>function name() {'{...}'}</p><p>local, return, shift, read</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="course_3-quiz" checked={!!checked['course_3-quiz']} onCheck={() => toggleCheck('course_3-quiz')}>
                <Toggle
                  question={t('1. Why does v = 5 fail but v=5 works?', '1. De ce eșuează v = 5 dar v=5 funcționează?')}
                  answer={t("The shell parses 'v = 5' as running a command named 'v' with arguments '=' and '5'. Assignment requires NO spaces around '='. This is the #1 beginner bash mistake.", "Shell-ul interpretează 'v = 5' ca rularea unei comenzi numite 'v' cu argumentele '=' și '5'. Atribuirea nu necesită spații în jurul '='. Aceasta este greșeala #1 a începătorilor în bash.")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('2. What does ${path##*/} do if path="/a/b/c.txt"?', '2. Ce face ${path##*/} dacă path="/a/b/c.txt"?')}
                  answer={t('It removes the longest prefix matching */. The longest match of */ in "/a/b/c.txt" is "/a/b/". Result: "c.txt". This is equivalent to basename.', 'Elimină cel mai lung prefix care se potrivește cu */. Cea mai lungă potrivire a */ în "/a/b/c.txt" este "/a/b/". Rezultat: "c.txt". Echivalent cu basename.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('3. What is the difference between "$@" and "$*"?', '3. Care este diferența dintre "$@" și "$*"?')}
                  answer={t('When quoted: "$*" expands to a single string "arg1 arg2 arg3". "$@" expands to separate strings "arg1" "arg2" "arg3". Use "$@" in for loops to correctly handle args with spaces.', 'Când sunt citate: "$*" se expandează la un singur șir "arg1 arg2 arg3". "$@" se expandează la șiruri separate "arg1" "arg2" "arg3". Folosiți "$@" în bucle for pentru a gestiona corect argumentele cu spații.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('4. How do you do floating-point division in bash?', '4. Cum faceți împărțire cu virgulă mobilă în bash?')}
                  answer={t("Bash arithmetic $((...)) only handles integers. Use bc: echo 'scale=4; 3/2' | bc outputs 1.5000. Or use awk: awk 'BEGIN{print 3/2}'.", "Aritmetica bash $((...)) gestionează doar întregi. Folosiți bc: echo 'scale=4; 3/2' | bc afișează 1.5000. Sau awk: awk 'BEGIN{print 3/2}'.")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t("5. What's wrong with: if [$x -gt 5]; then ...?", '5. Ce este greșit în: if [$x -gt 5]; then ...?')}
                  answer={t('Missing spaces. [ is a command, so it needs space after it and before ]. Correct: if [ $x -gt 5 ]; then. Also, quote $x to handle empty values: [ "$x" -gt 5 ].', 'Lipsesc spațiile. [ este o comandă, deci necesită spațiu după ea și înainte de ]. Corect: if [ $x -gt 5 ]; then. De asemenea, citați $x pentru a gestiona valorile goale: [ "$x" -gt 5 ].')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t("6. How does 'until' differ from 'while'?", "6. Cum diferă 'until' față de 'while'?")}
                  answer={t("while loops WHILE condition is true (exit 0). until loops WHILE condition is false (exit ≠ 0). until stops when the condition becomes true. They are logical inverses.", "while iterează CÂND condiția este adevărată (exit 0). until iterează CÂND condiția este falsă (exit ≠ 0). until se oprește când condiția devine adevărată. Sunt inversele logice.")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('7. Can a bash function return a string?', '7. Poate o funcție bash să returneze un șir?')}
                  answer={t("Not directly. 'return' only sets exit status (0-255). To return data, use echo inside the function and capture it: result=$(my_func args). Or use a global variable.", "Nu direct. 'return' setează doar valoarea de exit (0-255). Pentru a returna date, folosiți echo în interiorul funcției și capturați-l: result=$(my_func args). Sau folosiți o variabilă globală.")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('8. What does shift 2 do?', '8. Ce face shift 2?')}
                  answer={t('It shifts all positional parameters left by 2. $3 becomes $1, $4 becomes $2, etc. The old $1 and $2 are discarded. $# decreases by 2. Useful for parsing options in a loop.', 'Deplasează toți parametrii pozițional la stânga cu 2. $3 devine $1, $4 devine $2, etc. Vechii $1 și $2 sunt eliminați. $# scade cu 2. Util pentru analiza opțiunilor în buclă.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('9. Write a one-liner to sum numbers 1 to 100.', '9. Scrieți un one-liner pentru a suma numerele 1 la 100.')}
                  answer={<code>echo $(($(seq -s+ 1 100)))</code>}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('10. What does set -x do and when is it useful?', '10. Ce face set -x și când este util?')}
                  answer={t("set -x enables debug/trace mode: the shell prints each command (after expansion) before executing it, prefixed with '+'. Useful for debugging scripts. Add it at the top during development, remove when done.", "set -x activează modul de depanare/trasare: shell-ul afișează fiecare comandă (după expandare) înainte de execuție, prefixată cu '+'. Util pentru depanarea scripturilor. Adăugați la începutul scriptului în timp de dezvoltare, eliminați când terminați.")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
              </Section>
    </>
  );
}
