import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Course02() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
              <p className="mb-3 text-sm opacity-80">{t('Source: OS(3) - Ghid de utilizare Linux (III), Cristian Vidrascu, UAIC', 'Sursă: OS(3) - Ghid de utilizare Linux (III), Cristian Vidrascu, UAIC')}</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Foaie de parcurs:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('Simple commands (internal vs external, execution model)', 'Comenzi simple (interne vs. externe, modelul de execuție)')}</li>
                  <li>{t('Foreground vs background execution', 'Execuție în foreground vs. background')}</li>
                  <li>{t('I/O Redirections (stdin, stdout, stderr)', 'Redirecționări I/O (stdin, stdout, stderr)')}</li>
                  <li>{t('Exit status (return codes)', 'Valoarea de exit (coduri de terminare)')}</li>
                  <li>{t('Compound commands & pipelines', 'Comenzi compuse și lanțuri de comenzi')}</li>
                  <li>{t('Sequential, parallel, conditional execution', 'Execuție secvențială, paralelă, condiționată')}</li>
                  <li>{t('Command lists & precedence', 'Liste de comenzi și precedență')}</li>
                  <li>{t('Filename globbing patterns', 'Șabloane pentru specificarea numelor de fișiere')}</li>
                  <li>{t('Shell configuration files & command history', 'Fișiere de configurare a shell-ului și istoricul comenzilor')}</li>
                </ol>
              </Box>

              <Section title={t('1. Simple Commands & Execution Model', '1. Comenzi simple și modelul de execuție')} id="c2-simple" checked={!!checked['c2-simple']} onCheck={() => toggleCheck('c2-simple')}>
                <p>{t('A ', 'O ')}<strong>{t('simple command', 'comandă simplă')}</strong>{t(' is a single command (internal or external) with its options, arguments, and optional I/O redirections.', ' este o singură comandă (internă sau externă) cu opțiunile, argumentele și redirecționările I/O opționale.')}</p>
                <Box type="formula">
                  <p className="font-bold font-mono">{t('Three ways to execute a script:', 'Trei moduri de a executa un script:')}</p>
                  <Code>{`# 1. Direct execution (needs +x permission & shebang):
$ ./script.sh arg1 arg2

# 2. Explicit shell invocation:
$ bash script.sh arg1 arg2

# 3. Source (runs in CURRENT shell, no new process):
$ source script.sh arg1
$ . script.sh arg1`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Key difference:', 'Diferența esențială:')}</p>
                  <p>{t('Methods 1 & 2 create a ', 'Metodele 1 și 2 creează un ')}<strong>{t('new child process', 'nou proces copil')}</strong>{t(' (subshell) to run the script. Method 3 (', ' (subshell) pentru a rula scriptul. Metoda 3 (')} <code>source</code>{t(') runs commands in the ', ') rulează comenzile în ')}<strong>{t('current shell', 'shell-ul curent')}</strong>{t(' — so variable changes persist after the script finishes.', ' — deci modificările variabilelor persistă după terminarea scriptului.')}</p>
                </Box>

                <p className="font-bold mt-2">{t('Example - demonstrating source vs subshell:', 'Exemplu - ilustrarea source vs. subshell:')}</p>
                <Code>{`$ cat test.sh
#!/bin/bash
myvar="hello"

$ ./test.sh ; echo $myvar    # prints nothing (subshell)
$ source test.sh ; echo $myvar  # prints "hello" (same shell)`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p>{t('Running ', 'Rularea comenzii ')} <code>cd</code> {t('inside a script executed with ', 'într-un script executat cu ')} <code>./script.sh</code> {t('does NOT change your current directory — the ', 'NU schimbă directorul curent — ')} <code>cd</code> {t('happens in the child process. Use ', 'are loc în procesul copil. Folosiți ')} <code>source script.sh</code> {t('if you need the directory change to persist.', 'dacă aveți nevoie ca schimbarea de director să persiste.')}</p>
                </Box>
              </Section>

              <Section title={t('2. Background Execution', '2. Execuția în background')} id="c2-bg" checked={!!checked['c2-bg']} onCheck={() => toggleCheck('c2-bg')}>
                <Box type="definition">
                  <p><strong>{t('Foreground', 'Foreground')}</strong>{t(': shell waits for command to finish before showing prompt. ', ': shell-ul așteaptă terminarea comenzii înainte de a afișa prompterul. ')}<strong>{t('Background', 'Background')}</strong>{t(': shell immediately shows prompt; command runs concurrently.', ': shell-ul afișează imediat prompterul; comanda rulează concurent.')}</p>
                </Box>
                <Code>{`$ long_command &          # run in background
[1] 12345                   # job number + PID
$ jobs                      # list background jobs
$ fg %1                     # bring job 1 to foreground
$ bg %1                     # resume suspended job in background`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p>{t('Background processes still write to your terminal (stdout/stderr) unless redirected. This can garble your prompt. Always redirect: ', 'Procesele din background scriu în continuare la terminal (stdout/stderr) dacă nu sunt redirecționate. Aceasta poate strica prompterul. Redirecționați întotdeauna: ')} <code>cmd &gt; out.log 2&gt;&amp;1 &amp;</code></p>
                </Box>
              </Section>

              <Section title={t('3. I/O Redirections', '3. Redirecționări I/O')} id="c2-redirect" checked={!!checked['c2-redirect']} onCheck={() => toggleCheck('c2-redirect')}>
                <p>{t('Every process has three standard I/O streams:', 'Fiecare proces are trei fluxuri I/O standard:')}</p>
                <Box type="definition">
                  <ul className="space-y-1">
                    <li><strong>stdin</strong> (fd 0) — {t('input, default: keyboard', 'intrare, implicit: tastatură')}</li>
                    <li><strong>stdout</strong> (fd 1) — {t('normal output, default: screen', 'ieșire normală, implicit: ecran')}</li>
                    <li><strong>stderr</strong> (fd 2) — {t('error output, default: screen', 'ieșire erori, implicit: ecran')}</li>
                  </ul>
                </Box>

                {/* SVG: I/O redirect diagram */}
                <svg viewBox="0 0 420 140" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:11}}>
                  <rect x="150" y="40" width="120" height="50" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                  <text x="210" y="70" textAnchor="middle" fill="currentColor" fontWeight="bold">PROCESS</text>
                  <text x="50" y="55" textAnchor="middle" fill="#3b82f6">stdin(0)</text>
                  <line x1="80" y1="52" x2="150" y2="60" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <text x="350" y="50" textAnchor="middle" fill="#10b981">stdout(1)</text>
                  <line x1="270" y1="55" x2="320" y2="47" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <text x="350" y="80" textAnchor="middle" fill="#ef4444">stderr(2)</text>
                  <line x1="270" y1="72" x2="320" y2="77" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="currentColor" opacity="0.6"/></marker></defs>
                  <text x="210" y="125" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.6">{t('Redirections change where these streams point', 'Redirecționările schimbă unde pointează aceste fluxuri')}</text>
                </svg>

                <Box type="formula">
                  <p className="font-bold">{t('Redirection syntax:', 'Sintaxa redirecționărilor:')}</p>
                  <Code>{`cmd < infile           # stdin from file
cmd > outfile          # stdout to file (overwrite)
cmd >> outfile         # stdout to file (append)
cmd 2> errfile         # stderr to file (overwrite)
cmd 2>> errfile        # stderr to file (append)
cmd > out 2>&1         # both stdout+stderr to same file
cmd &> outfile         # shorthand for above (bash only)
cmd << EOF             # here-document (inline stdin)
  line1
  line2
EOF`}</Code>
                </Box>

                <p className="font-bold mt-2">{t('Example - separate stdout and stderr:', 'Exemplu - separarea stdout și stderr:')}</p>
                <Code>{`$ ls /home /nonexistent > ok.txt 2> err.txt
$ cat ok.txt    # listing of /home
$ cat err.txt   # "No such file or directory"`}</Code>

                <p className="font-bold mt-2">{t('Example - merge stderr into stdout, then pipe:', 'Exemplu - combinarea stderr în stdout, apoi canal:')}</p>
                <Code>{`$ gcc program.c 2>&1 | grep error
# Compiler errors AND warnings piped to grep`}</Code>
              </Section>

              <Section title={t('4. Exit Status', '4. Valoarea de exit')} id="c2-exit" checked={!!checked['c2-exit']} onCheck={() => toggleCheck('c2-exit')}>
                <Box type="definition">
                  <p>{t('Every command returns an integer ', 'Fiecare comandă returnează o ')}<strong>{t('exit status', 'valoare de exit')}</strong>{t(' (0-255). Stored in ', ' (0-255) ca întreg. Stocată în ')} <code>$?</code>{t('.', '.')}</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li><strong>0</strong> = {t('success', 'succes')}</li>
                    <li><strong>{t('non-zero', 'non-zero')}</strong> = {t('failure (specific codes vary by command)', 'eșec (coduri specifice variază pe comandă)')}</li>
                    <li><strong>126</strong> = {t('found but not executable', 'găsit dar nu este executabil')}</li>
                    <li><strong>127</strong> = {t('command not found', 'comandă negăsită')}</li>
                    <li><strong>128+N</strong> = {t('killed by signal N', 'omorât de semnalul N')}</li>
                  </ul>
                </Box>
                <Code>{`$ ls /home ; echo $?    # prints 0 (success)
$ ls /noexist ; echo $?  # prints 2 (error)
$ kill -9 PID ; echo $?  # process exit: 137 = 128+9`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p><code>$?</code> {t('always holds the exit code of the ', 'conține întotdeauna codul de exit al ')}<strong>{t('most recently executed foreground command', 'celei mai recent executate comenzi din foreground')}</strong>{t('. If you run ', '. Dacă rulați ')} <code>echo $?</code> {t('twice, the second one shows the exit code of the first ', 'de două ori, cel de-al doilea afișează codul de exit al primului ')} <code>echo</code> {t('(which is 0), not the original command.', '(care este 0), nu al comenzii originale.')}</p>
                </Box>
              </Section>

              <Section title={t('5. Pipelines (Command Chains)', '5. Lanțuri de comenzi (pipeline-uri)')} id="c2-pipe" checked={!!checked['c2-pipe']} onCheck={() => toggleCheck('c2-pipe')}>
                <Box type="definition">
                  <p>{t('A ', 'Un ')}<strong>{t('pipeline', 'lanț de comenzi')}</strong>{t(' connects stdout of one command to stdin of the next using ', ' conectează stdout-ul unei comenzi la stdin-ul următoarei folosind ')} <code>|</code>{t('. All commands in a pipeline run ', '. Toate comenzile dintr-un pipeline rulează ')}<strong>{t('in parallel', 'în paralel')}</strong>{t(' (not sequentially!).', ' (nu secvențial!).')}</p>
                </Box>

                <svg viewBox="0 0 450 80" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:11}}>
                  <rect x="10" y="20" width="80" height="35" rx="6" fill="none" stroke="#3b82f6" strokeWidth="1.5"/>
                  <text x="50" y="42" textAnchor="middle" fill="#3b82f6">cmd1</text>
                  <rect x="150" y="20" width="80" height="35" rx="6" fill="none" stroke="#f59e0b" strokeWidth="1.5"/>
                  <text x="190" y="42" textAnchor="middle" fill="#f59e0b">cmd2</text>
                  <rect x="290" y="20" width="80" height="35" rx="6" fill="none" stroke="#10b981" strokeWidth="1.5"/>
                  <text x="330" y="42" textAnchor="middle" fill="#10b981">cmd3</text>
                  <line x1="90" y1="37" x2="150" y2="37" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <line x1="230" y1="37" x2="290" y2="37" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <text x="120" y="32" textAnchor="middle" fill="currentColor" fontSize="9">pipe</text>
                  <text x="260" y="32" textAnchor="middle" fill="currentColor" fontSize="9">pipe</text>
                  <text x="225" y="72" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.6">{t("All 3 run in parallel. Exit status = last command's.", 'Toate 3 rulează în paralel. Valoarea de exit = a ultimei comenzi.')}</text>
                </svg>

                <Code>{`$ who | cut -f1 -d" " | sort -u
# who: list logged-in users
# cut: extract first field (username)
# sort -u: sort and remove duplicates

$ ls -Al | wc -l
# Count total files+dirs in current directory

$ cat /etc/passwd | grep -w "bash"
# Find users whose shell is bash`}</Code>

                <Box type="theorem">
                  <p className="font-bold">{t('Pipeline exit status:', 'Valoarea de exit a unui pipeline:')}</p>
                  <p>{t('By default, the exit status of a pipeline is the exit status of the ', 'În mod implicit, valoarea de exit a unui pipeline este valoarea de exit a ')}<strong>{t('last command', 'ultimei comenzi')}</strong>{t('. Use ', '. Folosiți ')} <code>set -o pipefail</code> {t('to make it fail if ', 'pentru a-l face să eșueze dacă ')} <em>{t('any', 'oricare')}</em> {t('command in the pipeline fails.', 'comandă din pipeline eșuează.')}</p>
                </Box>
              </Section>

              <Section title={t('6. Compound Commands (; & && ||)', '6. Comenzi compuse (; & && ||)')} id="c2-compound" checked={!!checked['c2-compound']} onCheck={() => toggleCheck('c2-compound')}>
                <Box type="formula">
                  <p className="font-bold">{t('Four composition operators:', 'Patru operatori de compunere:')}</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="text-left p-1">{t('Operator', 'Operator')}</th><th className="text-left p-1">{t('Execution', 'Execuție')}</th><th className="text-left p-1">{t('Behavior', 'Comportament')}</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">;</td><td className="p-1">{t('Sequential', 'Secvențial')}</td><td className="p-1">{t('Run next regardless of result', 'Rulează următoarea indiferent de rezultat')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">&amp;</td><td className="p-1">{t('Parallel', 'Paralel')}</td><td className="p-1">{t('Run in background, next starts immediately', 'Rulează în background, următoarea pornește imediat')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">&amp;&amp;</td><td className="p-1">{t('Conditional AND', 'AND condiționat')}</td><td className="p-1">{t('Run next only if previous ', 'Rulează următoarea doar dacă precedenta a ')}<strong>{t('succeeded', 'reușit')}</strong>{t(' (exit 0)', ' (exit 0)')}</td></tr>
                      <tr><td className="p-1 font-mono">||</td><td className="p-1">{t('Conditional OR', 'OR condiționat')}</td><td className="p-1">{t('Run next only if previous ', 'Rulează următoarea doar dacă precedenta a ')}<strong>{t('failed', 'eșuat')}</strong>{t(' (exit ≠ 0)', ' (exit ≠ 0)')}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <p className="font-bold mt-2">{t('Precedence:', 'Precedență:')}</p>
                <p className="text-sm"><code>&&</code> {t('and', 'și')} <code>||</code> {t('bind tighter than', 'au prioritate mai mare decât')} <code>;</code> {t('and', 'și')} <code>&amp;</code>{t('. All are left-associative.', '. Toți sunt asociativi la stânga.')}</p>

                <p className="font-bold mt-2">{t('Example 1 - sequential:', 'Exemplul 1 - secvențial:')}</p>
                <Code>{`$ mkdir d1 ; echo "Salut!" > d1/f1.txt ; cd d1 ; stat f1.txt`}</Code>

                <p className="font-bold mt-2">{t('Example 2 - conditional (common pattern):', 'Exemplul 2 - condiționat (tipar frecvent):')}</p>
                <Code>{`$ gcc prog.c -o prog && ./prog
# Only runs prog if compilation succeeded

$ cat file.txt || echo "File not found!"
# Prints fallback message if cat fails`}</Code>

                <p className="font-bold mt-2">{t('Example 3 - parallel:', 'Exemplul 3 - paralel:')}</p>
                <Code>{`$ cat /etc/passwd & cat /etc/group &
# Both run simultaneously in background`}</Code>

                <Box type="definition">
                  <p className="font-bold">{t('Subshell vs group:', 'Subshell vs. grup:')}</p>
                  <Code>{`(list)    # runs list in a SUBSHELL (new process)
{ list; } # runs list in CURRENT shell (group)
# Key: subshell can't change parent's variables`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p>{t('In ', 'În ')} <code>{`{ list; }`}</code>{t(', the space after ', ', spațiul după ')} <code>{`{`}</code> {t('and the ', 'și ')} <code>;</code> {t('before ', 'înainte de ')} <code>{`}`}</code> {t('are ', 'sunt ')}<strong>{t('mandatory', 'obligatorii')}</strong>{t('. Forgetting them causes a syntax error.', '. Uitarea lor provoacă o eroare de sintaxă.')}</p>
                </Box>
              </Section>

              <Section title={t('7. Filename Globbing (Wildcards)', '7. Șabloane pentru nume de fișiere (metacaractere)')} id="c2-glob" checked={!!checked['c2-glob']} onCheck={() => toggleCheck('c2-glob')}>
                <Box type="formula">
                  <p className="font-bold">{t('Pattern characters:', 'Caractere speciale de șablon:')}</p>
                  <table className="text-sm mt-1">
                    <tbody>
                      <tr><td className="pr-4 font-mono">*</td><td>{t('Matches any string (including empty)', 'Se potrivește cu orice șir (inclusiv gol)')}</td></tr>
                      <tr><td className="font-mono">?</td><td>{t('Matches exactly one character', 'Se potrivește cu exact un caracter')}</td></tr>
                      <tr><td className="font-mono">[abc]</td><td>{t('Matches one of a, b, or c', 'Se potrivește cu a, b sau c')}</td></tr>
                      <tr><td className="font-mono">[a-z]</td><td>{t('Matches one char in range a-z', 'Se potrivește cu un caracter din intervalul a-z')}</td></tr>
                      <tr><td className="font-mono">[^abc]</td><td>{t('Matches one char NOT in set', 'Se potrivește cu un caracter care NU este în mulțime')}</td></tr>
                      <tr><td className="font-mono">\c</td><td>{t('Escape: treat c literally', 'Escape: tratează c literal')}</td></tr>
                    </tbody>
                  </table>
                </Box>
                <Code>{`$ ls *.c              # all .c files
$ ls file?.txt        # file1.txt, fileA.txt, etc.
$ ls file[0-9].txt    # file0.txt through file9.txt
$ ls file[^0-9].txt   # fileA.txt, fileX.txt (non-digits)
$ ls !(*.o)           # everything except .o files (bash)`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p>{t('Glob patterns are expanded by the ', 'Șabloanele glob sunt expandate de ')}<strong>{t('shell before the command sees them', 'shell înainte ca comanda să le vadă')}</strong>{t('. If no file matches, the pattern is passed as-is (unexpanded). This can cause confusing errors.', '. Dacă niciun fișier nu se potrivește, șablonul este transmis neexpandat. Aceasta poate cauza erori confuze.')}</p>
                </Box>
              </Section>

              <Section title={t('8. Shell Configuration & History', '8. Configurarea shell-ului și istoricul comenzilor')} id="c2-config" checked={!!checked['c2-config']} onCheck={() => toggleCheck('c2-config')}>
                <Box type="definition">
                  <p className="font-bold">{t('Bash config files (execution order):', 'Fișierele de configurare Bash (ordinea de execuție):')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>Login shell</strong>: <code>/etc/profile</code> → <code>~/.bash_profile</code> (or <code>~/.bash_login</code> or <code>~/.profile</code>)</li>
                    <li><strong>Non-login interactive</strong>: <code>~/.bashrc</code></li>
                    <li><strong>Logout</strong>: <code>~/.bash_logout</code></li>
                  </ul>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Command history:', 'Istoricul comenzilor:')}</p>
                  <Code>{`$ history          # list all previous commands
$ !42              # re-run command #42 from history
$ !!               # re-run last command
$ UP/DOWN arrows   # navigate through history
$ CTRL+R           # reverse search in history`}</Code>
                </Box>
              </Section>

              <Section title={t('Cheat Sheet', 'Foaie de referință rapidă')} id="c2-cheat" checked={!!checked['c2-cheat']} onCheck={() => toggleCheck('c2-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">{t('Redirections', 'Redirecționări')}</p><p>{'< > >> 2> 2>> &> 2>&1'}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Composition', 'Compunere')}</p><p>{'; (seq) & (bg) && (AND) || (OR)'}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Pipelines', 'Lanțuri de comenzi')}</p><p>cmd1 | cmd2 | cmd3</p><p>{'|& = 2>&1 |'}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Globs', 'Șabloane')}</p><p>* ? [abc] [a-z] [^abc] \c</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Execution', 'Execuție')}</p><p>./script, bash script, source script</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Exit status', 'Valoarea de exit')}</p><p>$? (0=ok, 126/127/128+N)</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c2-quiz" checked={!!checked['c2-quiz']} onCheck={() => toggleCheck('c2-quiz')}>
                <Toggle
                  question={t('1. What is the difference between ./script.sh and source script.sh?', '1. Care este diferența dintre ./script.sh și source script.sh?')}
                  answer={t('./script.sh creates a new child process (subshell). source script.sh (or . script.sh) runs in the current shell. Variable assignments and cd changes only persist with source.', './script.sh creează un nou proces copil (subshell). source script.sh (sau . script.sh) rulează în shell-ul curent. Atribuirile de variabile și schimbările de director persistă doar cu source.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('2. What does 2>&1 mean?', '2. Ce înseamnă 2>&1?')}
                  answer={t('It redirects file descriptor 2 (stderr) to wherever file descriptor 1 (stdout) currently points. So stderr output goes to the same place as stdout.', 'Redirecționează file descriptor-ul 2 (stderr) unde pointează file descriptor-ul 1 (stdout). Astfel, ieșirile de eroare merg în același loc ca stdout.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('3. In cmd1 && cmd2 || cmd3, when does cmd3 run?', '3. În cmd1 && cmd2 || cmd3, când rulează cmd3?')}
                  answer={t('cmd3 runs if cmd2 fails. Evaluation is left-to-right: if cmd1 succeeds, cmd2 runs. If cmd2 then fails, cmd3 runs. If cmd1 fails, cmd2 is skipped and cmd3 runs (because the && group evaluated to non-zero).', 'cmd3 rulează dacă cmd2 eșuează. Evaluarea este de la stânga la dreapta: dacă cmd1 reușește, cmd2 rulează. Dacă cmd2 eșuează, cmd3 rulează. Dacă cmd1 eșuează, cmd2 este omis și cmd3 rulează (deoarece grupul && a evaluat la non-zero).')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('4. Do commands in a pipeline run sequentially or in parallel?', '4. Comenzile dintr-un pipeline rulează secvențial sau în paralel?')}
                  answer={t("In PARALLEL. All commands in a pipeline start simultaneously. Data flows through the pipe as it's produced. The shell waits for ALL to finish before returning.", 'În PARALEL. Toate comenzile dintr-un pipeline pornesc simultan. Datele curg prin canal pe măsură ce sunt produse. Shell-ul așteaptă ca TOATE să termine înainte de a continua.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('5. What\'s the exit status of: false | true?', '5. Care este valoarea de exit a: false | true?')}
                  answer={t('0 (success). By default, the pipeline exit status is the exit status of the LAST command (true = 0). With set -o pipefail, it would be 1 (first failure).', '0 (succes). În mod implicit, valoarea de exit a pipeline-ului este valoarea de exit a ULTIMEI comenzi (true = 0). Cu set -o pipefail, ar fi 1 (primul eșec).')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('6. What does the glob pattern file[^0-9].txt match?', '6. Cu ce se potrivește șablonul glob file[^0-9].txt?')}
                  answer={t('Files like fileA.txt, filex.txt — the [^0-9] matches any single character that is NOT a digit. It does NOT match file1.txt or file9.txt.', 'Fișiere de genul fileA.txt, filex.txt — [^0-9] se potrivește cu orice caracter care NU este o cifră. NU se potrivește cu file1.txt sau file9.txt.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('7. What is the key difference between (list) and { list; }?', '7. Care este diferența esențială dintre (list) și { list; }?')}
                  answer={t('(list) runs in a subshell (new process) — variable changes don\'t affect parent. { list; } runs in the current shell — changes persist. The curly braces require spaces and semicolons.', '(list) rulează într-un subshell (proces nou) — modificările variabilelor nu afectează părintele. { list; } rulează în shell-ul curent — modificările persistă. Acoladele necesită spații și punct și virgulă.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('8. How do you run a command in the background and redirect all output to a log file?', '8. Cum rulați o comandă în background și redirecționați toată ieșirea într-un fișier log?')}
                  answer={<code>cmd &gt; output.log 2&gt;&amp;1 &amp;</code>}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('9. Which config file runs when you open a new terminal (non-login)?', '9. Ce fișier de configurare rulează când deschideți un terminal nou (non-login)?')}
                  answer={t('~/.bashrc. Login shells read /etc/profile then ~/.bash_profile (or ~/.bash_login or ~/.profile). Interactive non-login shells (like new terminal tabs) read ~/.bashrc.', '~/.bashrc. Shell-urile de login citesc /etc/profile, apoi ~/.bash_profile (sau ~/.bash_login sau ~/.profile). Shell-urile interactive non-login (ca tab-urile noi de terminal) citesc ~/.bashrc.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('10. What happens if you type: ls *.xyz and no .xyz files exist?', '10. Ce se întâmplă dacă tastați: ls *.xyz și nu există fișiere .xyz?')}
                  answer={t("In bash (default), the literal string '*.xyz' is passed to ls, which then reports an error ('cannot access *.xyz'). The glob was not expanded because no files matched.", "În bash (implicit), șirul literal '*.xyz' este transmis comenzii ls, care raportează o eroare ('cannot access *.xyz'). Șablonul nu a fost expandat deoarece niciun fișier nu se potrivea.")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
              </Section>
    </>
  );
}
