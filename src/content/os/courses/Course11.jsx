import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Course11() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
              <p className="mb-3 text-sm opacity-80">Source: OS(11) - Programare de sistem in C pentru Linux (VIII), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Plan:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('Physical screen vs virtual screen concept', 'Conceptul de ecran fizic vs. ecran virtual')}</li>
                  <li>{t('NCURSES initialization and program structure', 'Inițializarea NCURSES și structura programului')}</li>
                  <li>{t('Windows (WINDOW type) and the stdscr', 'Ferestre (tipul WINDOW) și stdscr')}</li>
                  <li>{t('Function naming conventions (w-, mv-, mvw-)', 'Convenții de denumire a funcțiilor (w-, mv-, mvw-)')}</li>
                  <li>{t('Output: addch, addstr, printw, refresh', 'Ieșire: addch, addstr, printw, refresh')}</li>
                  <li>{t('Input: getch, getstr, scanw', 'Intrare: getch, getstr, scanw')}</li>
                  <li>{t('Attributes and colors', 'Atribute și culori')}</li>
                  <li>{t('Window management: newwin, delwin, box, border', 'Gestiunea ferestrelor: newwin, delwin, box, border')}</li>
                  <li>{t('Input modes: echo/noecho, cbreak/nocbreak, keypad', 'Moduri de intrare: echo/noecho, cbreak/nocbreak, keypad')}</li>
                  <li>{t('Scrolling, cursor control, low-level terminal (termios)', 'Derulare, controlul cursorului, terminal la nivel scăzut (termios)')}</li>
                </ol>
              </Box>

              <Section title={t('1. Physical vs Virtual Screen', '1. Ecran fizic vs. ecran virtual')} id="course_11-concept" checked={!!checked['course_11-concept']} onCheck={() => toggleCheck('course_11-concept')}>
                <Box type="definition">
                  <p><strong>{t('Physical screen', 'Ecran fizic')}</strong>{t(' = what you see on the terminal right now. ', ' = ceea ce vedeți pe terminal în acest moment. ')}<strong>{t('Virtual screen', 'Ecran virtual')}</strong>{t(' = an in-memory image of the screen. All NCURSES I/O operates on the virtual screen. The ', ' = o imagine în memorie a ecranului. Toate operațiile I/O NCURSES operează pe ecranul virtual. Apelul ')}<code>refresh()</code>{t(' call copies changes to the physical screen.', ' copiază modificările pe ecranul fizic.')}</p>
                </Box>

                <svg viewBox="0 0 420 120" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="20" width="110" height="50" rx="6" fill="#3b82f6" opacity="0.12" stroke="#3b82f6"/>
                  <text x="65" y="40" textAnchor="middle" fill="#3b82f6" fontWeight="bold" fontSize="9">WINDOW</text>
                  <text x="65" y="55" textAnchor="middle" fill="currentColor" fontSize="8">{t('(in memory)', '(în memorie)')}</text>
                  <rect x="160" y="20" width="100" height="50" rx="6" fill="#f59e0b" opacity="0.12" stroke="#f59e0b"/>
                  <text x="210" y="40" textAnchor="middle" fill="#f59e0b" fontWeight="bold" fontSize="9">{t('Virtual screen', 'Ecran virtual')}</text>
                  <text x="210" y="55" textAnchor="middle" fill="currentColor" fontSize="8">{t('(in memory)', '(în memorie)')}</text>
                  <rect x="300" y="20" width="100" height="50" rx="6" fill="#10b981" opacity="0.12" stroke="#10b981"/>
                  <text x="350" y="40" textAnchor="middle" fill="#10b981" fontWeight="bold" fontSize="9">{t('Physical screen', 'Ecran fizic')}</text>
                  <text x="350" y="55" textAnchor="middle" fill="currentColor" fontSize="8">{t('(terminal)', '(terminal)')}</text>
                  <line x1="120" y1="45" x2="160" y2="45" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <line x1="260" y1="45" x2="300" y2="45" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <text x="140" y="38" textAnchor="middle" fill="currentColor" fontSize="7">{t('phase 1', 'faza 1')}</text>
                  <text x="280" y="38" textAnchor="middle" fill="currentColor" fontSize="7">{t('phase 2', 'faza 2')}</text>
                  <text x="210" y="95" textAnchor="middle" fill="#f59e0b" fontWeight="bold" fontSize="10">{t('refresh() does both phases', 'refresh() execută ambele faze')}</text>
                  <text x="210" y="108" textAnchor="middle" fill="currentColor" fontSize="8" opacity="0.6">{t('Optimized: only sends CHANGES since last refresh', 'Optimizat: trimite doar MODIFICĂRILE de la ultimul refresh')}</text>
                </svg>

                <Box type="theorem">
                  <p className="font-bold">{t('Why this architecture?', 'De ce această arhitectură?')}</p>
                  <p>{t('Minimizes actual terminal I/O (which is slow). NCURSES compares the virtual screen before and after your operations, and sends only the ', 'Minimizează I/O-ul real al terminalului (care este lent). NCURSES compară ecranul virtual înainte și după operațiile dvs. și trimite doar ')}<strong>{t('differences', 'diferențele')}</strong>{t(' to the physical terminal. This is especially important for remote (SSH) sessions.', ' la terminalul fizic. Aceasta este deosebit de importantă pentru sesiunile la distanță (SSH).')}</p>
                </Box>
              </Section>

              <Section title={t('2. Program Structure', '2. Structura programului')} id="course_11-struct" checked={!!checked['course_11-struct']} onCheck={() => toggleCheck('course_11-struct')}>
                <Box type="formula">
                  <p className="font-bold">{t('Minimal NCURSES program:', 'Program NCURSES minimal:')}</p>
                  <Code>{`#include <ncurses.h>

int main() {
    initscr();    // Initialize ncurses (creates stdscr)
    cbreak();     // Disable line buffering (get chars immediately)
    noecho();     // Don't echo typed characters
    keypad(stdscr, TRUE);  // Enable special keys (arrows, F1, etc.)

    printw("Hello, ncurses! Press any key...");
    refresh();    // Flush virtual screen → physical screen
    getch();      // Wait for keypress

    endwin();     // Restore terminal to normal mode
    return 0;
}
// Compile: gcc prog.c -lncurses`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Critical:', 'Important:')}</p>
                  <p>{t('Always call ', 'Apelați întotdeauna ')}<code>endwin()</code>{t(' before exiting! If your program crashes without it, the terminal will be in a broken state. Use ', ' înainte de ieșire! Dacă programul se blochează fără aceasta, terminalul va fi într-o stare defectă. Utilizați comanda ')}<code>reset</code>{t(' command to fix a garbled terminal.', ' pentru a repara un terminal degradat.')}</p>
                </Box>
              </Section>

              <Section title={t('3. Windows & Function Naming', '3. Ferestre și denumirea funcțiilor')} id="course_11-windows" checked={!!checked['course_11-windows']} onCheck={() => toggleCheck('course_11-windows')}>
                <p>{t('A ', 'O ')}<strong>{t('window', 'fereastră')}</strong>{t(' is a 2D character matrix of type ', ' este o matrice 2D de caractere de tip ')}<code>WINDOW*</code>{t('. Each cell stores a character + attributes + colors (', '. Fiecare celulă stochează un caracter + atribute + culori (')}<code>chtype</code>{t(').', ').')}</p>

                <Box type="definition">
                  <p className="font-bold">stdscr:</p>
                  <p>{t('A global variable representing a window that covers the entire terminal. Most functions without the ', 'O variabilă globală reprezentând o fereastră care acoperă întregul terminal. Majoritatea funcțiilor fără prefixul ')}<code>w</code>{t(' prefix operate on stdscr.', ' operează pe stdscr.')}</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Naming convention (four forms per function):', 'Convenție de denumire (patru forme per funcție):')}</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="p-1">{t('Form', 'Formă')}</th><th className="p-1">{t('Meaning', 'Semnificație')}</th><th className="p-1">{t('Example', 'Exemplu')}</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">func()</td><td className="p-1">{t('Operates on stdscr at cursor', 'Operează pe stdscr la cursor')}</td><td className="p-1 font-mono">addch('A')</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">wfunc(win,...)</td><td className="p-1">{t('Operates on specific window', 'Operează pe fereastra specificată')}</td><td className="p-1 font-mono">waddch(win,'A')</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">mvfunc(y,x,...)</td><td className="p-1">{t('Move cursor first, then operate on stdscr', 'Mută cursorul mai întâi, apoi operează pe stdscr')}</td><td className="p-1 font-mono">mvaddch(5,10,'A')</td></tr>
                      <tr><td className="p-1 font-mono">mvwfunc(win,y,x,...)</td><td className="p-1">{t('Move + operate on specific window', 'Mută + operează pe fereastra specificată')}</td><td className="p-1 font-mono">mvwaddch(win,5,10,'A')</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Window management:', 'Gestiunea ferestrelor:')}</p>
                  <Code>{`WINDOW* win = newwin(height, width, start_y, start_x);
box(win, 0, 0);       // draw border around window
wrefresh(win);         // refresh this specific window
delwin(win);           // destroy window

// Useful variables:
int h = LINES;        // terminal height
int w = COLS;         // terminal width`}</Code>
                </Box>
              </Section>

              <Section title={t('4. Output & Input Functions', '4. Funcții de ieșire și intrare')} id="course_11-io" checked={!!checked['course_11-io']} onCheck={() => toggleCheck('course_11-io')}>
                <Box type="formula">
                  <p className="font-bold">{t('Output:', 'Ieșire:')}</p>
                  <Code>{`addch('A');               // single character
addstr("Hello");          // string
printw("x=%d", x);       // formatted (like printf)
mvprintw(5, 10, "Hi");   // move + formatted print
clear();                  // clear entire window
move(y, x);              // move cursor
refresh();               // MUST call to see changes!

// With attributes:
attron(A_BOLD);           // turn on bold
printw("Bold text");
attroff(A_BOLD);          // turn off bold`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Input:', 'Intrare:')}</p>
                  <Code>{`int ch = getch();         // read single key (blocking)
char str[80];
getstr(str);              // read string (line)
scanw("%d", &n);          // formatted read (like scanf)

// Special keys (after keypad(stdscr, TRUE)):
if (ch == KEY_UP) ...
if (ch == KEY_DOWN) ...
if (ch == KEY_LEFT) ...
if (ch == KEY_F(1)) ...   // F1 key`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Input mode control:', 'Controlul modului de intrare:')}</p>
                  <Code>{`echo(); / noecho();        // show/hide typed characters
cbreak(); / nocbreak();   // char-at-a-time / line-buffered
keypad(stdscr, TRUE);     // enable special keys
nodelay(stdscr, TRUE);    // non-blocking getch (returns ERR if no key)
halfdelay(n);             // getch waits max n/10 seconds`}</Code>
                </Box>
              </Section>

              <Section title={t('5. Attributes & Colors', '5. Atribute și culori')} id="course_11-color" checked={!!checked['course_11-color']} onCheck={() => toggleCheck('course_11-color')}>
                <Box type="formula">
                  <p className="font-bold">{t('Text attributes:', 'Atribute text:')}</p>
                  <Code>{`attron(A_BOLD);        // bold
attron(A_UNDERLINE);   // underline
attron(A_REVERSE);     // reverse video (swap fg/bg)
attron(A_BLINK);       // blinking text
attrset(A_NORMAL);     // reset all attributes`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Colors:', 'Culori:')}</p>
                  <Code>{`if (has_colors()) {
    start_color();
    // Define color pairs: init_pair(id, foreground, background)
    init_pair(1, COLOR_RED, COLOR_BLACK);
    init_pair(2, COLOR_GREEN, COLOR_BLACK);
    init_pair(3, COLOR_YELLOW, COLOR_BLUE);

    attron(COLOR_PAIR(1));
    printw("Red text on black!");
    attroff(COLOR_PAIR(1));

    // Set window background:
    wbkgd(win, COLOR_PAIR(3));
}
// 8 colors: BLACK, RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE`}</Code>
                </Box>
              </Section>

              <Section title={t('6. Low-Level Terminal (termios)', '6. Terminal la nivel scăzut (termios)')} id="course_11-termios" checked={!!checked['course_11-termios']} onCheck={() => toggleCheck('course_11-termios')}>
                <Box type="definition">
                  <p>{t('For direct terminal control without NCURSES, use the ', 'Pentru controlul direct al terminalului fără NCURSES, utilizați API-ul ')}<code>termios</code>{t(' API:', ':')}</p>
                  <Code>{`#include <termios.h>
struct termios old_settings, new_settings;
tcgetattr(STDIN_FILENO, &old_settings);  // save current settings

new_settings = old_settings;
new_settings.c_lflag &= ~(ECHO | ICANON);  // no echo, char-at-a-time
tcsetattr(STDIN_FILENO, TCSANOW, &new_settings);

// ... raw terminal I/O ...

tcsetattr(STDIN_FILENO, TCSANOW, &old_settings);  // restore!`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Terminal info commands:', 'Comenzi pentru informații despre terminal:')}</p>
                  <Code>{`$ tty              # which terminal device am I using
$ stty -a          # show all terminal settings
$ stty sane        # reset terminal to sane defaults
$ reset            # hard reset terminal (fixes garbled state)`}</Code>
                </Box>
              </Section>

              <Section title={t('Cheat Sheet', 'Rezumat rapid')} id="course_11-cheat" checked={!!checked['course_11-cheat']} onCheck={() => toggleCheck('course_11-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">{t('Lifecycle', 'Ciclu de viață')}</p><p>initscr() → operations → endwin()</p><p>{t('Compile: gcc -lncurses', 'Compilare: gcc -lncurses')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Output', 'Ieșire')}</p><p>addch, addstr, printw</p><p>move(y,x), clear(), refresh()</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Input', 'Intrare')}</p><p>getch, getstr, scanw</p><p>keypad, echo/noecho, cbreak</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Windows', 'Ferestre')}</p><p>newwin, delwin, box, wrefresh</p><p>stdscr, LINES, COLS</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Style', 'Stil')}</p><p>attron/off(A_BOLD|A_REVERSE...)</p><p>start_color, init_pair, COLOR_PAIR</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Naming', 'Denumire')}</p><p>{t('func = stdscr, wfunc = window', 'func = stdscr, wfunc = fereastră')}</p><p>{t('mvfunc = move+do, mvwfunc = both', 'mvfunc = mută+face, mvwfunc = ambele')}</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="course_11-quiz" checked={!!checked['course_11-quiz']} onCheck={() => toggleCheck('course_11-quiz')}>
                <Toggle question={t('1. Why doesn\'t text appear on screen immediately after printw()?', '1. De ce textul nu apare pe ecran imediat după printw()?')} answer={t('printw() writes to the virtual screen (in memory), not the physical terminal. You must call refresh() to copy the virtual screen to the physical screen. This two-phase design allows NCURSES to optimize by sending only changes.', 'printw() scrie pe ecranul virtual (în memorie), nu pe terminalul fizic. Trebuie să apelați refresh() pentru a copia ecranul virtual pe ecranul fizic. Acest design în două faze permite NCURSES să optimizeze prin trimiterea doar a modificărilor.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('2. What does cbreak() do?', '2. Ce face cbreak()?')} answer={t('It disables line buffering: characters are available to the program as soon as typed (no need to press Enter). Without cbreak, input is buffered until a newline. Essential for interactive programs.', 'Dezactivează bufferizarea pe linii: caracterele sunt disponibile pentru program imediat ce sunt tastate (fără a fi nevoie de apăsarea Enter). Fără cbreak, intrarea este bufferizată până la o linie nouă. Esențial pentru programele interactive.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('3. What is stdscr?', '3. Ce este stdscr?')} answer={t("A global WINDOW* variable created by initscr() that covers the entire terminal. Functions without the 'w' prefix (like addch, printw) operate on stdscr. You cannot delete or recreate it.", "O variabilă globală WINDOW* creată de initscr() care acoperă întregul terminal. Funcțiile fără prefixul 'w' (cum ar fi addch, printw) operează pe stdscr. Nu puteți să o ștergeți sau să o recreați.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('4. What happens if endwin() is not called?', '4. Ce se întâmplă dacă endwin() nu este apelat?')} answer={t("The terminal remains in NCURSES mode: no echo, no line buffering, possibly garbled display. The user must type 'reset' or 'stty sane' to fix their terminal.", "Terminalul rămâne în modul NCURSES: fără echo, fără bufferizare pe linii, afișaj posibil degradat. Utilizatorul trebuie să tasteze 'reset' sau 'stty sane' pentru a repara terminalul.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('5. Explain the mvwprintw(win, y, x, fmt, ...) naming.', '5. Explicați denumirea mvwprintw(win, y, x, fmt, ...).')} answer={t("mv = move cursor first. w = operate on a specific window (not stdscr). printw = formatted print. So: move to (y,x) in window 'win', then print formatted text. Four-letter prefix = most specific form.", "mv = mută cursorul mai întâi. w = operează pe o fereastră specifică (nu stdscr). printw = tipărire formatată. Deci: mută la (y,x) în fereastra 'win', apoi tipărește text formatat. Prefix cu patru litere = forma cea mai specifică.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('6. How do you make getch() non-blocking?', '6. Cum faceți getch() neblocant?')} answer={<span><code>nodelay(stdscr, TRUE)</code> {t('makes getch return ERR immediately if no key is available. Alternatively, ', 'face ca getch să returneze ERR imediat dacă nu este disponibilă nicio tastă. Alternativ, ')}<code>halfdelay(n)</code> {t('makes getch wait at most n tenths of a second.', 'face ca getch să aștepte cel mult n zecimi de secundă.')}</span>} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('7. How do you enable arrow key detection?', '7. Cum activați detectarea tastelor săgeată?')} answer={<span><code>keypad(stdscr, TRUE)</code> {t('— without this, arrow keys generate escape sequences that getch returns as multiple characters. With keypad enabled, getch returns KEY_UP, KEY_DOWN, etc.', '— fără aceasta, tastele săgeată generează secvențe de escape pe care getch le returnează ca mai multe caractere. Cu keypad activat, getch returnează KEY_UP, KEY_DOWN, etc.')}</span>} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('8. What is the purpose of touchwin()?', '8. Care este scopul funcției touchwin()?')} answer={t("It marks all lines of a window as 'changed', forcing refresh() to redraw the entire window even if the virtual screen hasn't changed. Useful when overlapping windows cause display artifacts that the optimization misses.", "Marchează toate liniile unei ferestre ca 'modificate', forțând refresh() să redeseneze întreaga fereastră chiar dacă ecranul virtual nu s-a schimbat. Util când ferestrele suprapuse cauzează artefacte de afișare pe care optimizarea le ratează.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('9. How many colors does basic NCURSES support?', '9. Câte culori suportă NCURSES de bază?')} answer={t('8 base colors: BLACK, RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE. Colors are used in pairs (foreground + background) defined via init_pair(). Max 64 pairs (8x8). Extended terminals may support 256+ colors.', '8 culori de bază: BLACK, RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE. Culorile sunt folosite în perechi (prim-plan + fundal) definite prin init_pair(). Maximum 64 perechi (8x8). Terminalele extinse pot suporta 256+ culori.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('10. What is the termios API used for?', '10. Pentru ce este folosit API-ul termios?')} answer={t('Direct low-level terminal control without NCURSES. It lets you change terminal settings: disable echo, enable raw/char-at-a-time mode, change special characters, control flow, etc. NCURSES uses termios internally.', 'Controlul direct la nivel scăzut al terminalului fără NCURSES. Vă permite să schimbați setările terminalului: dezactivarea echo, activarea modului raw/caracter-cu-caracter, schimbarea caracterelor speciale, controlul fluxului, etc. NCURSES folosește termios intern.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
              </Section>
    </>
  );
}
