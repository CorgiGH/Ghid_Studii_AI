import React, { useState, useMemo, useCallback } from 'react';

// ============================================================
// OS STUDY GUIDE - Course 1: Basic Linux Commands & Filesystems
// ============================================================
// Courses will be added incrementally. Say "continue" for next.

// ---------- Color constants ----------
const COLORS = {
  definition: { light: 'bg-blue-50 border-blue-300', dark: 'dark:bg-blue-950 dark:border-blue-700' },
  theorem: { light: 'bg-green-50 border-green-300', dark: 'dark:bg-green-950 dark:border-green-700' },
  warning: { light: 'bg-red-50 border-red-300', dark: 'dark:bg-red-950 dark:border-red-700' },
  formula: { light: 'bg-purple-50 border-purple-300', dark: 'dark:bg-purple-950 dark:border-purple-700' },
  code: { light: 'bg-gray-100 border-gray-300', dark: 'dark:bg-gray-800 dark:border-gray-600' },
};

// ---------- Reusable Components ----------
const Box = ({ type, children }) => {
  const c = COLORS[type] || COLORS.definition;
  return <div className={`border-l-4 p-3 my-3 rounded-r ${c.light} ${c.dark}`}>{children}</div>;
};

const Code = ({ children }) => (
  <pre className={`p-3 my-2 rounded text-sm font-mono overflow-x-auto ${COLORS.code.light} ${COLORS.code.dark}`}>
    <code>{children}</code>
  </pre>
);

const Toggle = ({ question, answer, hideLabel = 'Hide', showLabel = 'Show Answer' }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-2 border rounded dark:border-gray-600">
      <div className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setOpen(!open)}>
        <span className="font-sans text-sm">{question}</span>
        <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">{open ? hideLabel : showLabel}</button>
      </div>
      {open && <div className="p-2 border-t dark:border-gray-600 text-sm font-sans">{answer}</div>}
    </div>
  );
};

const Section = ({ title, id, children, checked, onCheck }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3 border rounded dark:border-gray-700" id={id}>
      <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setOpen(!open)}>
        <input type="checkbox" checked={checked} onChange={onCheck} onClick={e => e.stopPropagation()} className="w-4 h-4 accent-green-500" />
        <span className="font-bold text-lg flex-1">{open ? '▾' : '▸'} {title}</span>
      </div>
      {open && <div className="p-4 border-t dark:border-gray-700">{children}</div>}
    </div>
  );
};

const CourseBlock = ({ title, id, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 border-2 rounded-lg dark:border-gray-600" id={id}>
      <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-xl" onClick={() => setOpen(!open)}>
        {open ? '▾' : '▸'} {title}
      </div>
      {open && <div className="p-4 border-t dark:border-gray-600">{children}</div>}
    </div>
  );
};

// ---------- SVG Diagrams ----------
const FileSystemTreeSVG = () => (
  <svg viewBox="0 0 400 260" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:12}}>
    <line x1="200" y1="20" x2="80" y2="70" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="200" y1="20" x2="200" y2="70" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="200" y1="20" x2="320" y2="70" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="80" y1="70" x2="40" y2="120" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="80" y1="70" x2="120" y2="120" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="200" y1="70" x2="170" y2="120" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="200" y1="70" x2="230" y2="120" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="320" y1="70" x2="290" y2="120" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="320" y1="70" x2="350" y2="120" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="40" y1="120" x2="40" y2="170" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="185" y="5" width="30" height="22" rx="4" fill="#3b82f6" opacity="0.2" stroke="#3b82f6"/>
    <text x="200" y="20" textAnchor="middle" fill="currentColor" fontWeight="bold">/</text>
    <text x="80" y="85" textAnchor="middle" fill="#f59e0b" fontWeight="bold">bin</text>
    <text x="200" y="85" textAnchor="middle" fill="#f59e0b" fontWeight="bold">home</text>
    <text x="320" y="85" textAnchor="middle" fill="#f59e0b" fontWeight="bold">etc</text>
    <text x="40" y="135" textAnchor="middle" fill="#10b981">bash</text>
    <text x="120" y="135" textAnchor="middle" fill="#10b981">ls</text>
    <text x="170" y="135" textAnchor="middle" fill="#f59e0b" fontWeight="bold">user1</text>
    <text x="230" y="135" textAnchor="middle" fill="#f59e0b" fontWeight="bold">user2</text>
    <text x="290" y="135" textAnchor="middle" fill="#10b981">passwd</text>
    <text x="350" y="135" textAnchor="middle" fill="#10b981">group</text>
    <text x="40" y="185" textAnchor="middle" fill="#10b981">.bashrc</text>
    <text x="200" y="230" textAnchor="middle" fill="currentColor" fontSize="10" opacity="0.6">UNIX Filesystem Tree (single root "/")</text>
  </svg>
);

const PermissionsSVG = () => (
  <svg viewBox="0 0 440 100" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:13}}>
    <text x="10" y="25" fill="currentColor" fontWeight="bold">-rwxr-xr--</text>
    <line x1="18" y1="30" x2="18" y2="50" stroke="#ef4444" strokeWidth="1.5"/>
    <text x="5" y="65" fill="#ef4444" fontSize="10">type</text>
    <rect x="25" y="10" width="55" height="20" rx="3" fill="#3b82f6" opacity="0.15" stroke="#3b82f6"/>
    <text x="52" y="45" textAnchor="middle" fill="#3b82f6" fontSize="10">owner(u)</text>
    <text x="52" y="57" textAnchor="middle" fill="#3b82f6" fontSize="10">rwx=7</text>
    <rect x="82" y="10" width="45" height="20" rx="3" fill="#f59e0b" opacity="0.15" stroke="#f59e0b"/>
    <text x="104" y="45" textAnchor="middle" fill="#f59e0b" fontSize="10">group(g)</text>
    <text x="104" y="57" textAnchor="middle" fill="#f59e0b" fontSize="10">r-x=5</text>
    <rect x="130" y="10" width="45" height="20" rx="3" fill="#10b981" opacity="0.15" stroke="#10b981"/>
    <text x="152" y="45" textAnchor="middle" fill="#10b981" fontSize="10">others(o)</text>
    <text x="152" y="57" textAnchor="middle" fill="#10b981" fontSize="10">r--=4</text>
    <text x="200" y="25" fill="currentColor">{'\u2192'} chmod 754 file</text>
    <text x="200" y="80" fill="currentColor" fontSize="10">r=4, w=2, x=1 (octal sum per category)</text>
  </svg>
);

// ---------- Course 1 Data ----------
const course1Topics = [
  'intro', 'help', 'editors', 'compilers', 'ssh', 'users', 'groups',
  'files_intro', 'logical_structure', 'physical_structure', 'mounting',
  'dir_commands', 'file_commands', 'permissions', 'file_processing',
  'processes', 'system_info', 'other_commands', 'troubleshooting',
];

// ---------- Main Component ----------
export default function OSStudyGuide() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState('ro');
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState({});

  const t = useCallback((en, ro) => lang === 'ro' ? ro : en, [lang]);

  const toggleCheck = useCallback((id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const highlight = useCallback((text) => {
    if (!search || search.length < 2) return text;
    if (typeof text !== 'string') return text;
    const re = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(re).map((part, i) =>
      re.test(part) ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-700">{part}</mark> : part
    );
  }, [search]);

  const courses = [
    { id: 'c1', title: t('Course 1: Basic Linux Commands & Filesystems', 'Cursul 1: Comenzi de bază Linux și sisteme de fișiere'), shortTitle: t('C1: Commands & FS', 'C1: Comenzi & FS') },
    { id: 'c2', title: t('Course 2: Shell Interpreters I - General Overview', 'Cursul 2: Interpretoare de comenzi I - Prezentare generală'), shortTitle: t('C2: Shell I', 'C2: Shell I') },
    { id: 'c3', title: t('Course 3: Bash Scripting', 'Cursul 3: Scripting Bash'), shortTitle: t('C3: Bash Script', 'C3: Script Bash') },
    { id: 'c4', title: t('Course 4: File I/O Primitives (POSIX + C stdlib)', 'Cursul 4: Primitivele I/O pentru fișiere (POSIX + C stdlib)'), shortTitle: t('C4: File I/O', 'C4: I/O Fișiere') },
    { id: 'c5', title: t('Course 5: File Locking & Concurrent Access', 'Cursul 5: Blocaje pe fișiere și acces concurent'), shortTitle: t('C5: File Locks', 'C5: Blocaje') },
    { id: 'c6', title: t('Course 6: Process Management I - fork() & wait()', 'Cursul 6: Gestiunea proceselor I - fork() și wait()'), shortTitle: t('C6: fork/wait', 'C6: fork/wait') },
    { id: 'c7', title: t('Course 7: Process Management II - exec()', 'Cursul 7: Gestiunea proceselor II - exec()'), shortTitle: t('C7: exec', 'C7: exec') },
    { id: 'c8', title: t('Course 8: Memory-Mapped Files, Shared Memory & Semaphores', 'Cursul 8: Fișiere mapate în memorie, memorie partajată și semafoare'), shortTitle: t('C8: mmap/IPC', 'C8: mmap/IPC') },
    { id: 'c9', title: t('Course 9: IPC via Pipes (Anonymous & Named)', 'Cursul 9: Comunicația inter-procese prin canale (anonime și cu nume)'), shortTitle: t('C9: Pipes', 'C9: Canale') },
    { id: 'c10', title: t('Course 10: POSIX Signals', 'Cursul 10: Semnale POSIX'), shortTitle: t('C10: Signals', 'C10: Semnale') },
    { id: 'c11', title: t('Course 11: NCURSES & Terminal Management', 'Cursul 11: NCURSES și gestiunea terminalelor'), shortTitle: t('C11: ncurses', 'C11: ncurses') },
  ];

  return (
    <div className={`${dark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 h-screen sticky top-0 overflow-y-auto border-r dark:border-gray-700 p-3 text-sm bg-gray-50 dark:bg-gray-800">
            <h2 className="font-bold text-lg mb-3">{t('OS Study Guide', 'Ghid de studiu SO')}</h2>
            <div className="mb-3 flex gap-2">
              <button onClick={() => setDark(!dark)} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 hover:opacity-80 transition">
                {dark ? 'Light' : 'Dark'}
              </button>
              <button onClick={() => setLang(lang === 'ro' ? 'en' : 'ro')} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 hover:opacity-80 transition font-bold">
                {lang === 'ro' ? 'EN' : 'RO'}
              </button>
            </div>
            <nav className="space-y-1">
              {courses.map(c => (
                <a key={c.id} href={`#${c.id}`} className="block px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 truncate">
                  {c.shortTitle}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 max-w-5xl mx-auto p-4 lg:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <h1 className="text-3xl font-bold">{t('Operating Systems - Complete Study Guide', 'Sisteme de Operare - Ghid complet de studiu')}</h1>
              <button onClick={() => setDark(!dark)} className="lg:hidden text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-600">
                {dark ? 'Light' : 'Dark'}
              </button>
              <button onClick={() => setLang(lang === 'ro' ? 'en' : 'ro')} className="lg:hidden text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 font-bold">
                {lang === 'ro' ? 'EN' : 'RO'}
              </button>
            </div>

            <input
              type="text"
              placeholder={t('Search across all content...', 'Caută în tot conținutul...')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full p-3 mb-6 rounded border dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* ==================== COURSE 1 ==================== */}
            <CourseBlock title={t('Course 1: Basic Linux Commands & Filesystems', 'Cursul 1: Comenzi de bază Linux și sisteme de fișiere')} id="c1">
              <p className="mb-3 text-sm opacity-80">{t('Source: OS(2) - Ghid de utilizare Linux (II), Cristian Vidrascu, UAIC', 'Sursă: OS(2) - Ghid de utilizare Linux (II), Cristian Vidrascu, UAIC')}</p>

              {/* Roadmap */}
              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap - Topics in this course:', 'Foaie de parcurs - Subiecte din acest curs:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('Command-line introduction (internal vs external commands)', 'Introducere în linia de comandă (comenzi interne vs. externe)')}</li>
                  <li>{t('Help commands (man, whatis, which, whereis, apropos)', 'Comenzi de ajutor (man, whatis, which, whereis, apropos)')}</li>
                  <li>{t('Text editors & compilers', 'Editoare de text și compilatoare')}</li>
                  <li>{t('Remote connections (ssh, sftp, scp)', 'Conexiuni la distanță (ssh, sftp, scp)')}</li>
                  <li>{t('Users & groups (/etc/passwd, /etc/group, UID, GID)', 'Utilizatori și grupuri (/etc/passwd, /etc/group, UID, GID)')}</li>
                  <li>{t('Files & filesystems (types, logical/physical structure)', 'Fișiere și sisteme de fișiere (tipuri, structură logică/fizică)')}</li>
                  <li>{t('Mounting filesystems', 'Montarea sistemelor de fișiere')}</li>
                  <li>{t('Directory commands (mkdir, rmdir, ls, pwd, cd)', 'Comenzi pentru directoare (mkdir, rmdir, ls, pwd, cd)')}</li>
                  <li>{t('File commands (ln, cp, mv, rm, touch, etc.)', 'Comenzi pentru fișiere (ln, cp, mv, rm, touch, etc.)')}</li>
                  <li>{t('File permissions (rwx, chmod, chown, chgrp)', 'Permisiuni de acces (rwx, chmod, chown, chgrp)')}</li>
                  <li>{t('File content processing (cat, grep, cut, sort, find, etc.)', 'Procesarea conținutului fișierelor (cat, grep, cut, sort, find, etc.)')}</li>
                  <li>{t('Processes (ps, top, kill, jobs, fg/bg)', 'Procese (ps, top, kill, jobs, fg/bg)')}</li>
                  <li>{t('System information commands', 'Comenzi pentru informații despre sistem')}</li>
                  <li>{t('Troubleshooting ("survival guide")', 'Depanare ("ghid de supraviețuire")')}</li>
                </ol>
              </Box>

              {/* Topic 1: Intro */}
              <Section title={t('1. Command-Line Introduction', '1. Introducere în linia de comandă')} id="c1-intro" checked={!!checked['c1-intro']} onCheck={() => toggleCheck('c1-intro')}>
                <p>{t('A ', 'Un ')} <strong>{t('command interpreter', 'interpretor de comenzi')}</strong> {t('(shell) is a program that takes user commands, executes them, and displays results. It is the interface between the user and the OS.', '(shell) este un program care preia comenzile utilizatorului, le execută și afișează rezultatele. Este interfața dintre utilizator și sistemul de operare.')}</p>

                <Box type="definition">
                  <p className="font-bold">{t('Two categories of simple commands:', 'Două categorii de comenzi simple:')}</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li><strong>{t('Internal commands', 'Comenzi interne')}</strong> {t('- built into the shell itself. Examples:', '- implementate în interpretorul de comenzi. Exemple:')} <code className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">cd</code>, <code className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">help</code></li>
                    <li><strong>{t('External commands', 'Comenzi externe')}</strong> {t('- separate executables on disk. Examples:', '- implementate de sine stătător (fiecare în câte un fișier). Exemple:')} <code className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">ls</code>, <code className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">passwd</code>{t(', scripts like ', ', scripturi de genul ')} <code className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">.bashrc</code></li>
                  </ul>
                </Box>

                <Box type="formula">
                  <p className="font-bold font-mono">{t('General command syntax:', 'Sintaxa generală a unei comenzi:')}</p>
                  <Code>command_name [options] [arguments]</Code>
                  <ul className="list-disc pl-5 text-sm mt-1">
                    <li>{t('Options preceded by ', 'Opțiunile sunt precedate de ')} <code>-</code> {t('(short) or ', '(scurt) sau ')} <code>--</code> {t('(long)', '(lung)')}</li>
                    <li>{t('Separator between words: SPACE or TAB', 'Separator între cuvinte: SPACE sau TAB')}</li>
                    <li>{t('Multi-line commands: end each line with ', 'Comenzi pe mai multe linii: terminați fiecare linie cu ')} <code>\</code> {t('then ENTER', 'urmat de ENTER')}</li>
                  </ul>
                </Box>

                <p className="mt-2 font-bold">{t('Example 1 (straightforward):', 'Exemplul 1 (simplu):')}</p>
                <Code>{`$ ls -l /home
# Lists contents of /home in long format
# -l is an option, /home is an argument`}</Code>

                <p className="font-bold mt-3">{t('Example 2 (edge case - multi-line command):', 'Exemplul 2 (caz particular - comandă pe mai multe linii):')}</p>
                <Code>{`$ gcc -fdiagnostics-color=always \\
    -g program.c \\
    -o program`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Common trap:', 'Capcană frecventă:')}</p>
                  <p>{t('UNIX is ', 'UNIX este ')} <strong>{t('case-sensitive', 'sensibil la majuscule')}</strong>! <code>ls</code> {t('works, ', 'funcționează, ')} <code>LS</code> {t('does not. Filenames ', 'nu. Numele de fișiere ')} <code>File.txt</code> {t('and ', 'și ')} <code>file.txt</code> {t('are different files.', 'sunt fișiere diferite.')}</p>
                </Box>
              </Section>

              {/* Topic 2: Users & Groups */}
              <Section title={t('2. Users, Groups & Authentication', '2. Utilizatori, grupuri și autentificare')} id="c1-users" checked={!!checked['c1-users']} onCheck={() => toggleCheck('c1-users')}>
                <p>{t('Every user needs an ', 'Fiecare utilizator are nevoie de un ')}<strong>{t('account', 'cont')}</strong>{t(' (username + password) to work on a UNIX system. Each account has a ', ' (nume utilizator + parolă) pentru a lucra pe un sistem UNIX. Fiecare cont are un ')}<strong>UID</strong>{t(' (User ID). The special user ', ' (identificator de utilizator). Utilizatorul special ')}<strong>root</strong>{t(' (UID=0) has full system privileges.', ' (UID=0) are toate privilegiile pe sistem.')}</p>

                <Box type="formula">
                  <p className="font-bold font-mono">{t('/etc/passwd format:', 'Formatul /etc/passwd:')}</p>
                  <Code>username:x:UID:GID:userdata:home_directory:login_shell</Code>
                  <p className="text-sm mt-1">{t('The ', 'Câmpul ')} <code>x</code> {t('means the encrypted password is in ', 'indică că parola criptată se află în ')} <code>/etc/shadow</code> {t('(readable only by root).', '(citibil doar de root).')}</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold font-mono">{t('/etc/group format:', 'Formatul /etc/group:')}</p>
                  <Code>groupname:x:GID:list_of_users</Code>
                </Box>

                <p className="font-bold mt-2">{t('Example - inspect your own account:', 'Exemplu - inspectați propriul cont:')}</p>
                <Code>{`$ whoami          # shows your username
$ id              # shows UID, GID, and all groups
$ groups          # shows group memberships
$ who             # shows who is logged in
$ w               # detailed info about logged-in users
$ finger username # info about a specific user
$ last            # login history`}</Code>

                <p className="font-bold mt-2">{t('Example - change password:', 'Exemplu - schimbați parola:')}</p>
                <Code>{`$ passwd    # change your own password (interactive)`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p>{t('Each user belongs to exactly one ', 'Fiecare utilizator aparține exact unui ')}<strong>{t('primary group', 'grup primar')}</strong>{t(' (GID in /etc/passwd) and can belong to multiple ', ' (GID în /etc/passwd) și poate aparține mai multor ')}<strong>{t('supplementary groups', 'grupuri suplimentare')}</strong>{t(' (listed in /etc/group). Forgetting which group you\'re in can cause "Permission denied" errors.', ' (listate în /etc/group). Uitarea grupului curent poate cauza erori de tip „Permission denied".')}</p>
                </Box>
              </Section>

              {/* Topic 3: Files & Filesystem Structure */}
              <Section title={t('3. Files & Filesystem Structure', '3. Fișiere și structura sistemului de fișiere')} id="c1-files" checked={!!checked['c1-files']} onCheck={() => toggleCheck('c1-files')}>
                <p>{t('In UNIX, data and programs are stored in ', 'În UNIX, datele și programele sunt stocate în ')}<strong>{t('files', 'fișiere')}</strong>{t('. Files are organized into ', '. Fișierele sunt organizate în ')}<strong>{t('filesystems', 'sisteme de fișiere')}</strong>{t(' (volumes on disk).', ' (volume pe disc).')}</p>

                <Box type="definition">
                  <p className="font-bold">{t('Six file types in UNIX:', 'Șase tipuri de fișiere în UNIX:')}</p>
                  <ol className="list-decimal pl-5">
                    <li><strong>{t('Regular files', 'Fișiere obișnuite')}</strong>{t(' - ordinary data/programs', ' - date/programe obișnuite')}</li>
                    <li><strong>{t('Directories', 'Directoare')}</strong>{t(' - "catalogs" containing other files', ' - „cataloage" ce conțin alte fișiere')}</li>
                    <li><strong>{t('Links', 'Legături')}</strong>{t(' (hard or symbolic) - aliases for existing files', ' (hard sau simbolice) - aliasuri pentru fișiere existente')}</li>
                    <li><strong>{t('Device files', 'Fișiere de dispozitiv')}</strong>{t(' (block or character) - hardware drivers', ' (bloc sau caracter) - drivere hardware')}</li>
                    <li><strong>{t('FIFO files', 'Fișiere FIFO')}</strong>{t(' (named pipes) - local IPC mechanism', ' (canale cu nume) - mecanism local de comunicare între procese')}</li>
                    <li><strong>{t('Socket files', 'Fișiere socket')}</strong>{t(' - network IPC mechanism', ' - mecanism de comunicare prin rețea')}</li>
                  </ol>
                </Box>

                <FileSystemTreeSVG />

                <Box type="theorem">
                  <p className="font-bold">{t('Key difference from Windows:', 'Diferența esențială față de Windows:')}</p>
                  <p>{t('UNIX has a ', 'UNIX are un ')}<strong>{t('single root filesystem', 'sistem de fișiere unic cu rădăcina')}</strong>{t(' rooted at ', ' la ')} <code>/</code>{t('. No drive letters (C:, D:). All other volumes are ', '. Fără litere de unitate (C:, D:). Toate celelalte volume sunt ')}<strong>{t('mounted', 'montate')}</strong>{t(' as subtrees. Path separator is ', ' ca subarbori. Separatorul de cale este ')} <code>/</code> {t('(not ', '(nu ')} <code>\</code>{t(').', ').')}</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Two ways to specify a file path:', 'Două moduri de a specifica o cale de fișier:')}</p>
                  <ul className="list-disc pl-5">
                    <li><strong>{t('Absolute path', 'Cale absolută')}</strong>{t(': from root ', ': de la rădăcina ')} <code>/</code>{t('. Example: ', '. Exemplu: ')} <code>/home/user/file.txt</code></li>
                    <li><strong>{t('Relative path', 'Cale relativă')}</strong>{t(': from current directory. Example: ', ': de la directorul curent. Exemplu: ')} <code>../docs/file.txt</code></li>
                  </ul>
                  <p className="mt-1 text-sm">{t('Special: ', 'Special: ')} <code>~</code> = {t('home directory', 'directorul home')}, <code>~user</code> = {t("user's home", 'home-ul utilizatorului')}, <code>.</code> = {t('current dir', 'director curent')}, <code>..</code> = {t('parent dir', 'director părinte')}</p>
                </Box>

                <p className="font-bold mt-2">{t('Filesystem types:', 'Tipuri de sisteme de fișiere:')}</p>
                <p className="text-sm">ext2/ext3/ext4 (Linux native), xfs, btrfs, zfs, vfat, ntfs, tmpfs, procfs, NFS, etc.</p>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p>{t("Don't confuse a file's ", 'Nu confundați ')}<strong>{t('extension', 'extensia')}</strong>{t(' (.c, .txt) with its ', ' (.c, .txt) a unui fișier cu ')}<strong>{t('type', 'tipul')}</strong>{t(' (regular, directory, link...). Extensions are just naming conventions for humans. The ', ' (obișnuit, director, legătură...). Extensiile sunt simple convenții de denumire. Comanda ')} <code>file</code> {t('command inspects actual content to determine type.', 'inspectează conținutul real pentru a determina tipul.')}</p>
                </Box>
              </Section>

              {/* Topic 4: Permissions */}
              <Section title={t('4. File Permissions', '4. Permisiuni de acces la fișiere')} id="c1-perms" checked={!!checked['c1-perms']} onCheck={() => toggleCheck('c1-perms')}>
                <p>{t('Every file has an ', 'Fiecare fișier are un ')}<strong>{t('owner user', 'utilizator proprietar')}</strong>{t(', an ', ', un ')}<strong>{t('owner group', 'grup proprietar')}</strong>{t(', and ', ', și ')}<strong>{t('3 sets of permissions', '3 seturi de permisiuni')}</strong>{t(' for: user (u), group (g), others (o).', ' pentru: utilizator (u), grup (g), alții (o).')}</p>

                <PermissionsSVG />

                <Box type="formula">
                  <p className="font-bold">{t('Permission bits (for regular files):', 'Biții de permisiune (pentru fișiere obișnuite):')}</p>
                  <table className="text-sm font-mono mt-1">
                    <tbody>
                      <tr><td className="pr-4">r (read) = 4</td><td>{t('Can read file contents', 'Poate citi conținutul fișierului')}</td></tr>
                      <tr><td>w (write) = 2</td><td>{t('Can modify/delete file', 'Poate modifica/șterge fișierul')}</td></tr>
                      <tr><td>x (execute) = 1</td><td>{t('Can execute as program', 'Poate executa ca program')}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('For directories, permissions mean something different:', 'Pentru directoare, permisiunile au altă semnificație:')}</p>
                  <table className="text-sm font-mono mt-1">
                    <tbody>
                      <tr><td className="pr-4">r</td><td>{t('Can list filenames in directory', 'Poate lista numele fișierelor din director')}</td></tr>
                      <tr><td>w</td><td>{t('Can add/delete/rename files in directory', 'Poate adăuga/șterge/redenumi fișiere în director')}</td></tr>
                      <tr><td>x</td><td>{t('Can traverse (access files inside) directory', 'Poate traversa (accesa fișierele din) directorul')}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <p className="font-bold mt-3">{t('Example 1 - reading and setting permissions:', 'Exemplul 1 - citirea și setarea permisiunilor:')}</p>
                <Code>{`$ ls -l file.txt
-rw-r--r-- 1 user group 1234 Mar 15 10:00 file.txt

$ chmod 755 script.sh    # rwxr-xr-x (octal)
$ chmod u+x script.sh    # add execute for owner (symbolic)
$ chmod go-w file.txt    # remove write for group & others
$ chmod a+r file.txt     # add read for all`}</Code>

                <p className="font-bold mt-3">{t('Example 2 - changing ownership:', 'Exemplul 2 - schimbarea proprietarului:')}</p>
                <Code>{`$ chown newuser file.txt       # change owner
$ chgrp newgroup file.txt      # change group
$ chown newuser:newgroup file.txt  # both at once`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Access verification algorithm:', 'Algoritmul de verificare a accesului:')}</p>
                  <p>{t('To access ', 'Pentru a accesa ')} <code>/d1/d2/file</code>{t(', the OS checks ', ', sistemul de operare verifică permisiunea ')}<strong>x</strong>{t(' permission on ', ' pe ')} <code>/</code>{t(', ', ', ')} <code>d1</code>{t(', ', ', ')} <code>d2</code>{t(' for your user category, then the appropriate permission (r/w/x) on ', ' pentru categoria dvs. de utilizator, apoi permisiunea corespunzătoare (r/w/x) pe ')} <code>file</code> {t('itself. If any check fails, you get "Permission denied".', 'însuși. Dacă orice verificare eșuează, primiți „Permission denied".')}</p>
                </Box>
              </Section>

              {/* Topic 5: Essential Commands */}
              <Section title={t('5. Essential File & Directory Commands', '5. Comenzi esențiale pentru fișiere și directoare')} id="c1-cmds" checked={!!checked['c1-cmds']} onCheck={() => toggleCheck('c1-cmds')}>
                <Box type="definition">
                  <p className="font-bold">{t('Directory commands:', 'Comenzi pentru directoare:')}</p>
                  <Code>{`mkdir dirname     # create directory
mkdir -p a/b/c    # create nested directories
rmdir dirname     # remove empty directory
ls                # list files
ls -lA            # long format, include hidden
pwd               # print working directory
cd /path          # change directory
cd ~              # go home
cd -              # go to previous directory`}</Code>
                </Box>

                <Box type="definition">
                  <p className="font-bold">{t('File manipulation commands:', 'Comenzi pentru manipularea fișierelor:')}</p>
                  <Code>{`touch file        # create empty file / update timestamp
cp src dst        # copy file
cp -r srcdir dst  # copy directory recursively
mv old new        # move or rename
rm file           # delete file
rm -rf dir        # delete directory recursively (DANGEROUS!)
ln -s target link # create symbolic link
ln target link    # create hard link`}</Code>
                </Box>

                <Box type="definition">
                  <p className="font-bold">{t('File content commands:', 'Comenzi pentru conținutul fișierelor:')}</p>
                  <Code>{`cat file          # display entire file
head -n 10 file   # first 10 lines
tail -n 10 file   # last 10 lines
less file         # paginated viewer
wc file           # count lines/words/chars
grep pattern file # search for pattern in file
cut -d: -f1 file  # extract column 1 (delimiter :)
sort file         # sort lines
find /path -name "*.c"  # find files by name
diff file1 file2  # compare two files
file myfile       # detect file content type`}</Code>
                </Box>

                <p className="font-bold mt-2">{t('Worked Example - find all .c files modified in the last 7 days:', 'Exemplu rezolvat - găsiți toate fișierele .c modificate în ultimele 7 zile:')}</p>
                <Code>{`$ find /home/user -name "*.c" -mtime -7 -type f
# -name: pattern match
# -mtime -7: modified less than 7 days ago
# -type f: regular files only`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p><code>rm -rf</code> {t('is irreversible! There is no trash/recycle bin in UNIX CLI. Double-check paths before using it. A misplaced space in ', 'este ireversibil! Nu există coș de gunoi în CLI-ul UNIX. Verificați de două ori căile înainte de utilizare. Un spațiu greșit în ')} <code>rm -rf / home</code> {t('(vs ', '(față de ')} <code>rm -rf /home</code>{t(') can destroy the entire system.', ') poate distruge întregul sistem.')}</p>
                </Box>
              </Section>

              {/* Topic 6: Processes */}
              <Section title={t('6. Processes', '6. Procese')} id="c1-proc" checked={!!checked['c1-proc']} onCheck={() => toggleCheck('c1-proc')}>
                <Box type="definition">
                  <p><strong>{t('Process', 'Proces')}</strong> = {t('an instance of a program in execution. Processes form a ', 'o instanță a unui program în execuție. Procesele formează o ')}<strong>{t('tree hierarchy', 'ierarhie de arbore')}</strong>{t(' (parent-child) rooted at PID 0 (created at boot).', ' (părinte-copil) cu rădăcina la PID 0 (creat la pornire).')}</p>
                </Box>
                <Code>{`$ ps -f            # processes in current session
$ ps aux           # all processes, detailed
$ pstree           # tree view of processes
$ top              # real-time process monitor
$ jobs             # background jobs in current shell
$ fg %1            # bring job 1 to foreground
$ bg %1            # resume job 1 in background
$ kill PID         # send SIGTERM to process
$ kill -9 PID      # force kill (SIGKILL)
$ killall name     # kill by name`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Connection to later courses:', 'Legătură cu cursurile ulterioare:')}</p>
                  <p>{t('Courses 6-7 (OS(6), OS(7)) will teach you how to create processes programmatically with ', 'Cursurile 6-7 (OS(6), OS(7)) vă vor învăța cum să creați procese programatic cu ')} <code>fork()</code>{t(', synchronize them with ', ', să le sincronizați cu ')} <code>wait()</code>{t(', and replace their program with ', ', și să înlocuiți programul lor cu ')} <code>exec()</code>{t('.', '.')}</p>
                </Box>
              </Section>

              {/* Topic 7: Troubleshooting */}
              <Section title={t('7. Troubleshooting (Survival Guide)', '7. Depanare (Ghid de supraviețuire)')} id="c1-trouble" checked={!!checked['c1-trouble']} onCheck={() => toggleCheck('c1-trouble')}>
                <Box type="warning">
                  <p className="font-bold">{t('When a command appears "stuck":', 'Când o comandă pare „blocată":')}</p>
                  <ol className="list-decimal pl-5">
                    <li>{t('Wait a reasonable time - it might just be busy computing', 'Așteptați un timp rezonabil - poate doar calculează')}</li>
                    <li>{t('Press ', 'Apăsați ')}<strong>CTRL+C</strong>{t(' (sends SIGINT) - interrupts the program', ' (trimite SIGINT) - întrerupe programul')}</li>
                    <li>{t('Press ', 'Apăsați ')}<strong>CTRL+\</strong>{t(' (sends SIGQUIT) - stronger termination', ' (trimite SIGQUIT) - terminare mai puternică')}</li>
                    <li>{t('Press ', 'Apăsați ')}<strong>CTRL+Z</strong>{t(' (suspends program), then use ', ' (suspendă programul), apoi utilizați ')} <code>ps</code>{t(' to find PID, then ', ' pentru a găsi PID-ul, apoi ')} <code>kill -9 PID</code></li>
                  </ol>
                </Box>
              </Section>

              {/* Cheat Sheet */}
              <Section title={t('Cheat Sheet', 'Foaie de referință rapidă')} id="c1-cheat" checked={!!checked['c1-cheat']} onCheck={() => toggleCheck('c1-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula">
                    <p className="font-bold">{t('Navigation', 'Navigare')}</p>
                    <p>pwd, cd, ls -lA</p>
                    <p>mkdir -p, rmdir, realpath</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">{t('Files', 'Fișiere')}</p>
                    <p>cp, mv, rm, ln -s, touch</p>
                    <p>cat, head, tail, less, file</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">{t('Search & Filter', 'Căutare și filtrare')}</p>
                    <p>grep, find, sort, cut, wc, tr, uniq</p>
                    <p>diff, cmp, comm</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">{t('Permissions', 'Permisiuni')}</p>
                    <p>chmod (octal/symbolic)</p>
                    <p>chown, chgrp</p>
                    <p>r=4 w=2 x=1</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">{t('Users', 'Utilizatori')}</p>
                    <p>whoami, id, groups, who, w</p>
                    <p>/etc/passwd, /etc/group</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">{t('Processes', 'Procese')}</p>
                    <p>ps, pstree, top, jobs</p>
                    <p>kill, kill -9, fg, bg</p>
                    <p>CTRL+C, CTRL+Z, CTRL+\</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">{t('Help', 'Ajutor')}</p>
                    <p>man [section] name</p>
                    <p>help cmd, whatis, which</p>
                    <p>whereis, apropos</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">{t('Remote', 'La distanță')}</p>
                    <p>ssh user@host</p>
                    <p>scp src user@host:dst</p>
                    <p>sftp user@host</p>
                  </Box>
                </div>
              </Section>

              {/* Quiz */}
              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c1-quiz" checked={!!checked['c1-quiz']} onCheck={() => toggleCheck('c1-quiz')}>
                <Toggle
                  question={t('1. What is the difference between an internal and an external command?', '1. Care este diferența dintre o comandă internă și una externă?')}
                  answer={t('Internal commands are built into the shell (e.g., cd, help). External commands are separate executable files on disk (e.g., ls → /bin/ls). External commands can be scripts or compiled binaries.', 'Comenzile interne sunt implementate în interpretorul de comenzi (ex: cd, help). Comenzile externe sunt fișiere executabile separate pe disc (ex: ls → /bin/ls). Comenzile externe pot fi scripturi sau binare compilate.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t("2. What does the 'x' permission mean on a directory?", "2. Ce înseamnă permisiunea 'x' pe un director?")}
                  answer={t("It means 'traverse' permission — the right to access files and subdirectories inside that directory. Without x, you can't cd into it or access any file by path through it, even if you have r permission to list its contents.", "Înseamnă permisiunea de 'traversare' — dreptul de a accesa fișierele și subdirectoarele din acel director. Fără x, nu puteți face cd în el sau accesa niciun fișier prin cale, chiar dacă aveți permisiunea r pentru a lista conținutul.")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('3. What is the octal representation of rwxr-x---?', '3. Care este reprezentarea octală a lui rwxr-x---?')}
                  answer={t('rwx=7, r-x=5, ---=0. Answer: 750.', 'rwx=7, r-x=5, ---=0. Răspuns: 750.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('4. How does UNIX filesystem differ from Windows?', '4. Cum diferă sistemul de fișiere UNIX față de Windows?')}
                  answer={t("UNIX has a single root filesystem tree rooted at '/', uses '/' as path separator (not '\\\\'), filenames are case-sensitive, no drive letters. Other volumes are mounted as subtrees via the mount command.", "UNIX are un singur arbore de sisteme de fișiere cu rădăcina la '/', folosește '/' ca separator de cale (nu '\\\\'), numele de fișiere sunt sensibile la majuscule, fără litere de unitate. Alte volume sunt montate ca subarbori prin comanda mount.")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('5. What file stores user account information? What are its fields?', '5. Ce fișier stochează informațiile conturilor de utilizator? Care sunt câmpurile sale?')}
                  answer={t("/etc/passwd. Fields: username:x:UID:GID:userdata:home_directory:login_shell. The 'x' indicates the password hash is stored in /etc/shadow.", "/etc/passwd. Câmpuri: username:x:UID:GID:userdata:home_directory:login_shell. 'x' indică faptul că hash-ul parolei este stocat în /etc/shadow.")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('6. What are the 6 file types in UNIX?', '6. Care sunt cele 6 tipuri de fișiere în UNIX?')}
                  answer={t('Regular files, directories, links (hard/symbolic), device files (block/character), FIFO (named pipe), sockets.', 'Fișiere obișnuite, directoare, legături (hard/simbolice), fișiere de dispozitiv (bloc/caracter), FIFO (canal cu nume), socket-uri.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('7. What happens if you run: rm -rf / home (note the space)?', '7. Ce se întâmplă dacă rulați: rm -rf / home (observați spațiul)?')}
                  answer={t("This tries to recursively delete EVERYTHING starting from root '/' first, then a relative path 'home'. This would destroy the entire system. The correct command is rm -rf /home (no space). Always double-check rm -rf commands!", "Aceasta încearcă să șteargă recursiv TOT ce pornește de la rădăcina '/' mai întâi, apoi calea relativă 'home'. Ar distruge întregul sistem. Comanda corectă este rm -rf /home (fără spațiu). Verificați întotdeauna comenzile rm -rf!")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('8. How do you find all .txt files larger than 1MB under /home?', '8. Cum găsiți toate fișierele .txt mai mari de 1MB din /home?')}
                  answer={<code>find /home -name "*.txt" -size +1M -type f</code>}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('9. What\'s the difference between kill PID and kill -9 PID?', '9. Care este diferența dintre kill PID și kill -9 PID?')}
                  answer={t('kill PID sends SIGTERM (signal 15), which asks the process to terminate gracefully (it can be caught/ignored). kill -9 PID sends SIGKILL (signal 9), which forcefully terminates the process immediately and cannot be caught or ignored.', 'kill PID trimite SIGTERM (semnalul 15), care cere procesului să se termine elegant (poate fi capturat/ignorat). kill -9 PID trimite SIGKILL (semnalul 9), care termină forțat procesul imediat și nu poate fi captat sau ignorat.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('10. What command shows all environment information about your user session?', '10. Ce comandă afișează toate informațiile despre sesiunea dvs. de utilizator?')}
                  answer={<span><code>id</code> {t('shows UID/GID/groups.', 'afișează UID/GID/grupuri.')} <code>env</code> {t('or', 'sau')} <code>printenv</code> {t('shows environment variables.', 'afișează variabilele de mediu.')} <code>who am i</code> {t('or', 'sau')} <code>whoami</code> {t('shows current user.', 'afișează utilizatorul curent.')} <code>tty</code> {t('shows terminal device.', 'afișează dispozitivul terminal.')}</span>}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 2 ==================== */}
            <CourseBlock title={t('Course 2: Shell Interpreters I - General Overview', 'Cursul 2: Interpretoare de comenzi I - Prezentare generală')} id="c2">
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
            </CourseBlock>

            {/* ==================== COURSE 3 ==================== */}
            <CourseBlock title={t('Course 3: Bash Scripting', 'Cursul 3: Scripting Bash')} id="c3">
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

              <Section title={t('1. Shell Scripts & the Shebang', '1. Scripturi shell și shebang')} id="c3-scripts" checked={!!checked['c3-scripts']} onCheck={() => toggleCheck('c3-scripts')}>
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

              <Section title={t('2. Variables', '2. Variabile')} id="c3-vars" checked={!!checked['c3-vars']} onCheck={() => toggleCheck('c3-vars')}>
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

              <Section title={t('3. Special Variables & Positional Parameters', '3. Variabile speciale și parametri pozițional')} id="c3-special" checked={!!checked['c3-special']} onCheck={() => toggleCheck('c3-special')}>
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

              <Section title={t('4. Arithmetic Expressions', '4. Expresii aritmetice')} id="c3-arith" checked={!!checked['c3-arith']} onCheck={() => toggleCheck('c3-arith')}>
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

              <Section title={t('5. Conditional Expressions (test)', '5. Expresii condiționale (test)')} id="c3-test" checked={!!checked['c3-test']} onCheck={() => toggleCheck('c3-test')}>
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

              <Section title={t('6. Control Structures', '6. Structuri de control')} id="c3-control" checked={!!checked['c3-control']} onCheck={() => toggleCheck('c3-control')}>

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

              <Section title={t('7. Shell Functions', '7. Funcții shell')} id="c3-funcs" checked={!!checked['c3-funcs']} onCheck={() => toggleCheck('c3-funcs')}>
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

              <Section title={t('Cheat Sheet', 'Foaie de referință rapidă')} id="c3-cheat" checked={!!checked['c3-cheat']} onCheck={() => toggleCheck('c3-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">{t('Variables', 'Variabile')}</p><p>var=val, $var, ${'{var}'}, ${'{#var}'}</p><p>${'{var:start:len}'}, ${'{var#pat}'}, ${'{var%pat}'}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Special vars', 'Variabile speciale')}</p><p>$0 $1..$9 $# $@ $* $$ $? $!</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Arithmetic', 'Aritmetică')}</p><p>let, expr, $((...)), bc</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Tests', 'Teste')}</p><p>-z -n = != -eq -ne -gt -lt -ge -le</p><p>-e -f -d -r -w -x -s ! -a -o</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Control', 'Control')}</p><p>if/elif/else/fi, case/esac</p><p>while/until/for/select + do/done</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Functions', 'Funcții')}</p><p>function name() {'{...}'}</p><p>local, return, shift, read</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c3-quiz" checked={!!checked['c3-quiz']} onCheck={() => toggleCheck('c3-quiz')}>
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
            </CourseBlock>

            {/* ==================== COURSE 4 ==================== */}
            <CourseBlock title={t('Course 4: File I/O Primitives (POSIX API + C Standard Library)', 'Cursul 4: Primitivele I/O pentru fișiere (API POSIX + biblioteca standard C)')} id="c4">
              <p className="mb-3 text-sm opacity-80">{t('Source: OS(4) - Programare de sistem in C pentru Linux (I), Cristian Vidrascu, UAIC', 'Sursă: OS(4) - Programare de sistem în C pentru Linux (I), Cristian Vidrascu, UAIC')}</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Foaie de parcurs:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('POSIX API vs C Standard Library — trade-offs', 'API POSIX vs. biblioteca standard C — compromisuri')}</li>
                  <li>{t('Categories of POSIX I/O primitives', 'Categoriile de primitive I/O POSIX')}</li>
                  <li>{t('Core primitives: access, creat, open, read, write, lseek, close', 'Primitivele de bază: access, creat, open, read, write, lseek, close')}</li>
                  <li>{t('File work session pattern (open → read/write loop → close)', 'Șablonul sesiunii de lucru cu fișiere (open → buclă read/write → close)')}</li>
                  <li>{t('Directory primitives: opendir, readdir, closedir', 'Primitive pentru directoare: opendir, readdir, closedir')}</li>
                  <li>{t('Filesystem cache (kernel-level disk cache)', 'Cache-ul sistemului de fișiere (cache disc la nivel kernel)')}</li>
                  <li>{t('C stdlib I/O: fopen, fread/fwrite, fscanf/fprintf, fclose', 'I/O biblioteca standard C: fopen, fread/fwrite, fscanf/fprintf, fclose')}</li>
                  <li>{t('Buffered vs unbuffered I/O — the two-level cache', 'I/O cu tampon vs. fără tampon — cache-ul pe două niveluri')}</li>
                  <li>{t('Format specifiers (%d, %s, %f, etc.)', 'Specificatori de format (%d, %s, %f, etc.)')}</li>
                </ol>
              </Box>

              <Section title={t('1. POSIX API vs C Standard Library', '1. API POSIX vs. biblioteca standard C')} id="c4-api" checked={!!checked['c4-api']} onCheck={() => toggleCheck('c4-api')}>
                <p>{t('Two families of functions for file I/O in C on Linux:', 'Două familii de funcții pentru I/O cu fișiere în C pe Linux:')}</p>

                <svg viewBox="0 0 480 180" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="10" width="200" height="60" rx="8" fill="#3b82f6" opacity="0.12" stroke="#3b82f6" strokeWidth="1.5"/>
                  <text x="110" y="30" textAnchor="middle" fill="#3b82f6" fontWeight="bold" fontSize="11">C Standard Library</text>
                  <text x="110" y="45" textAnchor="middle" fill="currentColor" fontSize="9">fopen, fread, fprintf, fclose</text>
                  <text x="110" y="58" textAnchor="middle" fill="currentColor" fontSize="9">{t('Buffered, FILE*, portable', 'Cu tampon, FILE*, portabil')}</text>

                  <rect x="260" y="10" width="200" height="60" rx="8" fill="#10b981" opacity="0.12" stroke="#10b981" strokeWidth="1.5"/>
                  <text x="360" y="30" textAnchor="middle" fill="#10b981" fontWeight="bold" fontSize="11">POSIX API</text>
                  <text x="360" y="45" textAnchor="middle" fill="currentColor" fontSize="9">open, read, write, close</text>
                  <text x="360" y="58" textAnchor="middle" fill="currentColor" fontSize="9">{t('Unbuffered, int fd, Linux/UNIX only', 'Fără tampon, int fd, doar Linux/UNIX')}</text>

                  <rect x="130" y="90" width="220" height="40" rx="6" fill="#f59e0b" opacity="0.1" stroke="#f59e0b"/>
                  <text x="240" y="112" textAnchor="middle" fill="#f59e0b" fontWeight="bold" fontSize="10">{t('Kernel filesystem cache', 'Cache-ul sistemului de fișiere din kernel')}</text>
                  <text x="240" y="125" textAnchor="middle" fill="currentColor" fontSize="9">{t('Unique per system, in kernel-space', 'Unic per sistem, în kernel-space')}</text>

                  <rect x="160" y="145" width="160" height="25" rx="4" fill="currentColor" opacity="0.08" stroke="currentColor" opacity="0.3"/>
                  <text x="240" y="162" textAnchor="middle" fill="currentColor" fontSize="9">{t('Physical disk', 'Disc fizic')}</text>

                  <line x1="110" y1="70" x2="200" y2="90" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4"/>
                  <line x1="360" y1="70" x2="280" y2="90" stroke="#10b981" strokeWidth="1" strokeDasharray="4"/>
                  <line x1="240" y1="130" x2="240" y2="145" stroke="currentColor" strokeWidth="1"/>
                </svg>

                <Box type="theorem">
                  <p className="font-bold">{t('Key trade-off:', 'Compromisul esențial:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>POSIX API</strong>{t(': Full access to OS features (permissions, locks, devices). Not portable to Windows. Uses ', ': Acces complet la funcționalitățile SO (permisiuni, blocaje, dispozitive). Nu este portabil pe Windows. Folosește ')} <code>int</code> {t('file descriptors.', 'descriptorii de fișiere.')}</li>
                    <li><strong>C stdlib</strong>{t(': Portable across platforms. Buffer-ized (user-space cache per process). Uses ', ': Portabilă pe platforme. Cu tampon (cache user-space per proces). Folosește ')} <code>FILE*</code> {t('pointers. Limited OS control.', 'pointeri. Control limitat al SO.')}</li>
                  </ul>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Error handling convention:', 'Convenția de gestionare a erorilor:')}</p>
                  <p>{t('All POSIX primitives return ', 'Toate primitivele POSIX returnează ')}<strong>-1</strong>{t(' on error and set the global variable ', ' la eroare și setează variabila globală ')} <code>errno</code>{t('. Diagnose with ', '. Diagnosticați cu ')} <code>perror("context")</code>{t('.', '.')}</p>
                </Box>
              </Section>

              <Section title={t('2. Core POSIX Primitives', '2. Primitivele de bază POSIX')} id="c4-posix" checked={!!checked['c4-posix']} onCheck={() => toggleCheck('c4-posix')}>
                <Box type="formula">
                  <p className="font-bold">{t('access — check file permissions:', 'access — verificarea permisiunilor:')}</p>
                  <Code>{`#include <unistd.h>
int access(char* path, int mode);
// mode: F_OK(0)=exists, R_OK(4), W_OK(2), X_OK(1)
// Returns 0 if allowed, -1 if not

if (access("data.txt", R_OK | W_OK) == -1)
    perror("Cannot read/write data.txt");`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('open — start a file session:', 'open — deschiderea unei sesiuni de lucru cu fișierul:')}</p>
                  <Code>{`#include <fcntl.h>
int open(char* path, int flags, mode_t perms);
// flags: O_RDONLY | O_WRONLY | O_RDWR
//   optionally OR'd with: O_CREAT, O_TRUNC, O_APPEND,
//   O_EXCL, O_NONBLOCK, O_CLOEXEC, O_SYNC, O_DIRECT
// perms: used only with O_CREAT (e.g., 0644)
// Returns: file descriptor (int >= 0), or -1 on error

int fd = open("out.dat", O_WRONLY|O_CREAT|O_TRUNC, 0600);
if (fd == -1) { perror("open"); exit(1); }`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('read / write — transfer data:', 'read / write — transferul datelor:')}</p>
                  <Code>{`ssize_t read(int fd, void* buf, size_t count);
ssize_t write(int fd, void* buf, size_t count);
// Returns: number of bytes actually transferred
// read returns 0 at EOF
// write may return less than count (disk full, etc.)

char buf[4096];
ssize_t n;
while ((n = read(in_fd, buf, sizeof(buf))) > 0) {
    if (write(out_fd, buf, n) != n) {
        perror("write error"); exit(1);
    }
}`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('lseek — reposition cursor:', 'lseek — repoziționarea cursorului:')}</p>
                  <Code>{`off_t lseek(int fd, off_t offset, int whence);
// whence: SEEK_SET(0), SEEK_CUR(1), SEEK_END(2)
// Returns: new absolute position, or -1 on error

lseek(fd, 0, SEEK_SET);    // go to beginning
lseek(fd, -10, SEEK_END);  // 10 bytes before end
off_t pos = lseek(fd, 0, SEEK_CUR); // get current position`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('close — end a file session:', 'close — încheierea unei sesiuni de lucru:')}</p>
                  <Code>{`int close(int fd);  // Returns 0 on success, -1 on error`}</Code>
                </Box>

                <p className="font-bold mt-3">{t('Worked example — cp implementation with POSIX API:', 'Exemplu rezolvat — implementarea cp cu API POSIX:')}</p>
                <Code>{`#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#define BUF 4096  // page size for efficiency

int main(int argc, char* argv[]) {
    int in_fd = open(argv[1], O_RDONLY);
    int out_fd = open(argv[2], O_WRONLY|O_CREAT|O_TRUNC, 0600);
    char buf[BUF];
    ssize_t n;
    while ((n = read(in_fd, buf, BUF)) > 0)
        write(out_fd, buf, n);
    close(in_fd); close(out_fd);
    return 0;
}`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Trap — buffer size matters:', 'Capcană — dimensiunea tamponului contează:')}</p>
                  <p>{t('Using ', 'Folosirea ')} <code>BUF_SIZE = 4096</code> {t('(one page) is optimal because the kernel filesystem cache operates at page granularity. Using 1-byte reads is catastrophically slow (thousands of system calls).', '(o pagină) este optimă deoarece cache-ul sistemului de fișiere din kernel operează la granularitate de pagină. Citirile de 1 byte sunt catastrofal de lente (mii de apeluri sistem).')}</p>
                </Box>
              </Section>

              <Section title={t('3. Directory Primitives', '3. Primitive pentru directoare')} id="c4-dir" checked={!!checked['c4-dir']} onCheck={() => toggleCheck('c4-dir')}>
                <Box type="formula">
                  <p className="font-bold">{t('Directory traversal pattern:', 'Șablonul de parcurgere a unui director:')}</p>
                  <Code>{`#include <dirent.h>
DIR* dd;
struct dirent* de;

dd = opendir(dirname);
if (dd == NULL) { perror("opendir"); exit(1); }

while ((de = readdir(dd)) != NULL) {
    printf("Found: %s\\n", de->d_name);
    // Skip "." and ".." entries!
}
closedir(dd);`}</Code>
                </Box>

                <Box type="definition">
                  <p className="font-bold">{t('Other directory/path primitives:', 'Alte primitive pentru directoare/căi:')}</p>
                  <Code>{`mkdir(path, mode);    // create directory
rmdir(path);          // remove empty directory
chdir(path);          // change working directory
getcwd(buf, size);    // get current working directory`}</Code>
                </Box>
              </Section>

              <Section title={t('4. C Standard Library I/O', '4. I/O din biblioteca standard C')} id="c4-stdio" checked={!!checked['c4-stdio']} onCheck={() => toggleCheck('c4-stdio')}>
                <Box type="formula">
                  <p className="font-bold">{t('Equivalent functions (FILE* based):', 'Funcții echivalente (bazate pe FILE*):')}</p>
                  <Code>{`FILE* f = fopen("data.txt", "rb");  // modes: r/w/a + b
size_t n = fread(buf, 1, size, f);  // binary read
size_t n = fwrite(buf, 1, size, f); // binary write
fscanf(f, "%d %s", &num, str);     // formatted read
fprintf(f, "x=%d\\n", x);           // formatted write
fseek(f, offset, SEEK_SET);        // reposition
fclose(f);                          // close`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Two-level caching:', 'Cache pe două niveluri:')}</p>
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>{t('stdio buffer', 'tamponul stdio')}</strong>{t(' (user-space, per process) — fwrite writes here first', ' (user-space, per proces) — fwrite scrie aici mai întâi')}</li>
                    <li><strong>{t('Kernel filesystem cache', 'Cache-ul sistemului de fișiere din kernel')}</strong>{t(' (kernel-space, shared by all processes) — actual disk I/O', ' (kernel-space, partajat de toate procesele) — I/O efectiv pe disc')}</li>
                  </ol>
                  <p className="text-sm mt-1">{t('The stdio buffer is flushed: on ', 'Tamponul stdio este golit: la ')} <code>fclose</code>{t(', when buffer fills, on ', ', când tamponul se umple, la ')} <code>fflush(f)</code>{t(', or on ', ', sau la ')} <code>\n</code> {t('for line-buffered streams (stdout to terminal).', 'pentru fluxurile cu tampon de linie (stdout la terminal).')}</p>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Critical trap — buffered writes before exec/fork:', 'Capcană critică — scrieri cu tampon înainte de exec/fork:')}</p>
                  <p>{t('Calling ', 'Apelarea ')} <code>exec()</code> {t('does NOT flush stdio buffers! Data in the buffer is ', 'NU golește tampoanele stdio! Datele din tampon sunt ')}<strong>{t('lost', 'pierdute')}</strong>{t('. Always call ', '. Apelați întotdeauna ')} <code>fflush(NULL)</code> {t('(flushes all open streams) before ', '(golește toate fluxurile deschise) înainte de ')} <code>exec</code> {t('or', 'sau')} <code>fork</code>{t('.', '.')}</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Format specifiers (scanf/printf family):', 'Specificatori de format (familia scanf/printf):')}</p>
                  <table className="text-sm mt-1">
                    <tbody>
                      <tr><td className="pr-3 font-mono">%c</td><td>char</td><td className="pr-3 font-mono pl-4">%s</td><td>string</td></tr>
                      <tr><td className="font-mono">%d</td><td>int (decimal)</td><td className="font-mono pl-4">%u</td><td>unsigned int</td></tr>
                      <tr><td className="font-mono">%o</td><td>unsigned (octal)</td><td className="font-mono pl-4">%x</td><td>unsigned (hex)</td></tr>
                      <tr><td className="font-mono">%f</td><td>double (fixed)</td><td className="font-mono pl-4">%e</td><td>double (scientific)</td></tr>
                    </tbody>
                  </table>
                </Box>
              </Section>

              <Section title={t('5. Filesystem Cache', '5. Cache-ul sistemului de fișiere')} id="c4-cache" checked={!!checked['c4-cache']} onCheck={() => toggleCheck('c4-cache')}>
                <Box type="theorem">
                  <p className="font-bold">{t('Kernel filesystem cache:', 'Cache-ul sistemului de fișiere din kernel:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>{t('Unique per system', 'Unic per sistem')}</strong>{t(', in kernel-space, shared by ALL processes', ', în kernel-space, partajat de TOATE procesele')}</li>
                    <li>{t('Granularity = physical page (4096 bytes on x86/x64)', 'Granularitate = pagină fizică (4096 bytes pe x86/x64)')}</li>
                    <li>{t('Repeated reads of same block → served from RAM (fast)', 'Citiri repetate ale aceluiași bloc → servit din RAM (rapid)')}</li>
                    <li>{t('Writes go to cache first, flushed to disk later (write-back)', 'Scrierile merg mai întâi în cache, golite pe disc ulterior (write-back)')}</li>
                    <li>{t('Bypass with ', 'Evitați cu ')} <code>O_DIRECT</code> {t('flag; force sync with ', 'flag; forțați sincronizarea cu ')} <code>O_SYNC</code> {t('or', 'sau')} <code>fsync(fd)</code></li>
                  </ul>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Connection:', 'Legătură:')}</p>
                  <p>{t('The stdio buffer (Course 4) sits ON TOP of the filesystem cache. So there are ', 'Tamponul stdio (Cursul 4) se află DEASUPRA cache-ului sistemului de fișiere. Deci există ')}<strong>{t('two layers', 'două niveluri')}</strong>{t(' of caching between your ', ' de cache între ')} <code>fprintf</code> {t('and the actual disk. This is why ', 'și discul efectiv. De aceea ')} <code>fflush</code> {t('is critical before sharing data between processes.', 'este critic înainte de a partaja date între procese.')}</p>
                </Box>
              </Section>

              <Section title={t('Cheat Sheet', 'Foaie de referință rapidă')} id="c4-cheat" checked={!!checked['c4-cheat']} onCheck={() => toggleCheck('c4-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">POSIX I/O</p><p>open, read, write, lseek, close</p><p>access, creat, stat, chmod, link, unlink</p><p>dup, dup2, pipe, mkfifo, fcntl</p></Box>
                  <Box type="formula"><p className="font-bold">{t('C stdlib I/O', 'I/O bibliotecă standard C')}</p><p>fopen, fread/fwrite, fclose</p><p>fscanf/fprintf, fseek, fflush</p><p>FILE*, {t('buffered, portable', 'cu tampon, portabil')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Directories', 'Directoare')}</p><p>opendir, readdir, closedir</p><p>mkdir, rmdir, chdir, getcwd</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Error handling', 'Gestionarea erorilor')}</p><p>return -1, errno, perror()</p><p>{t('Always check return values!', 'Verificați întotdeauna valorile returnate!')}</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c4-quiz" checked={!!checked['c4-quiz']} onCheck={() => toggleCheck('c4-quiz')}>
                <Toggle
                  question={t('1. What does open() return on success vs failure?', '1. Ce returnează open() la succes față de eșec?')}
                  answer={t('On success: a non-negative integer (file descriptor, the lowest available fd number). On failure: -1, and errno is set.', 'La succes: un număr întreg non-negativ (file descriptor, cel mai mic număr fd disponibil). La eșec: -1, și errno este setat.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('2. What happens if read() returns 0?', '2. Ce se întâmplă dacă read() returnează 0?')}
                  answer={t('It means EOF — end of file was reached. No bytes were read. This is NOT an error (error would return -1).', 'Înseamnă EOF — s-a ajuns la sfârșitul fișierului. Niciun octet nu a fost citit. Aceasta NU este o eroare (eroarea ar returna -1).')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('3. Why is buffer size 4096 optimal for read/write?', '3. De ce dimensiunea 4096 a tamponului este optimă pentru read/write?')}
                  answer={t('4096 bytes is the page size on x86/x64. The kernel filesystem cache operates at page granularity. Reads/writes aligned to page boundaries minimize system calls and maximize DMA transfer efficiency.', '4096 bytes este dimensiunea paginii pe x86/x64. Cache-ul sistemului de fișiere din kernel operează la granularitate de pagină. Citirile/scrierile aliniate la granițele de pagini minimizează apelurile sistem și maximizează eficiența transferului DMA.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('4. What is the difference between POSIX descriptors (int) and stdio descriptors (FILE*)?', '4. Care este diferența dintre descriptorii POSIX (int) și descriptorii stdio (FILE*)?')}
                  answer={t('POSIX int fd is a raw OS-level handle — unbuffered, direct syscalls. FILE* is a library-level wrapper that adds user-space buffering, formatted I/O, and portability. Internally, FILE* uses an int fd underneath.', 'int fd POSIX este un handle brut la nivel SO — fără tampon, apeluri sistem directe. FILE* este un wrapper la nivel de bibliotecă ce adaugă tampon în user-space, I/O formatat și portabilitate. Intern, FILE* folosește un int fd pe dedesubt.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('5. What happens to stdio buffers when you call exec()?', '5. Ce se întâmplă cu tampoanele stdio când apelați exec()?')}
                  answer={t('They are LOST. exec() replaces the process image (including all user-space memory), but does NOT flush stdio buffers first. Always call fflush(NULL) before exec().', 'Sunt PIERDUTE. exec() înlocuiește imaginea procesului (inclusiv toată memoria user-space), dar NU golește tampoanele stdio mai întâi. Apelați întotdeauna fflush(NULL) înainte de exec().')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('6. How do you convert between int fd and FILE*?', '6. Cum convertiți între int fd și FILE*?')}
                  answer={t('fd → FILE*: fdopen(fd, mode). FILE* → fd: fileno(fp). Useful when mixing POSIX and stdio functions on the same file.', 'fd → FILE*: fdopen(fd, mode). FILE* → fd: fileno(fp). Util când combinați funcții POSIX și stdio pe același fișier.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('7. What are the three standard file descriptors?', '7. Care sunt cei trei file descriptori standard?')}
                  answer={t('0 = stdin, 1 = stdout, 2 = stderr. They are inherited from the parent process and are open by default.', '0 = stdin, 1 = stdout, 2 = stderr. Sunt moșteniți de la procesul părinte și sunt deschiși implicit.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('8. What does lseek(fd, 0, SEEK_CUR) return?', '8. Ce returnează lseek(fd, 0, SEEK_CUR)?')}
                  answer={t('The current file position (offset from beginning). This is an idiom to query position without changing it.', 'Poziția curentă în fișier (offset față de început). Acesta este un idiom pentru a interoga poziția fără a o schimba.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t("9. Why must you skip '.' and '..' when traversing a directory with readdir()?", "9. De ce trebuie să omiteți '.' și '..' când parcurgeți un director cu readdir()?")}
                  answer={t("readdir() returns ALL entries including '.' (current dir) and '..' (parent dir). If you're doing recursive operations (like recursive delete), processing these would cause infinite loops or delete parent directories.", "readdir() returnează TOATE intrările inclusiv '.' (directorul curent) și '..' (directorul părinte). Dacă efectuați operații recursive (cum ar fi ștergerea recursivă), procesarea acestora ar cauza bucle infinite sau ștergerea directoarelor părinte.")}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
                <Toggle
                  question={t('10. Can two processes share the kernel filesystem cache?', '10. Pot două procese să partajeze cache-ul sistemului de fișiere din kernel?')}
                  answer={t("Yes! The kernel filesystem cache is unique per system and shared by ALL processes. This is why one process's write (once flushed to cache) can be read by another process even before disk sync.", 'Da! Cache-ul sistemului de fișiere din kernel este unic per sistem și partajat de TOATE procesele. De aceea scrierea unui proces (odată golită în cache) poate fi citită de alt proces chiar înainte de sincronizarea cu discul.')}
                  hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
                />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 5 ==================== */}
            <CourseBlock title="Course 5: File Locking & Concurrent Access" id="c5">
              <p className="mb-3 text-sm opacity-80">Source: OS(5) - Programare de sistem in C pentru Linux (II), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Plan:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('Concurrent access to files (the problem)', 'Accesul concurent la fișiere (problema)')}</li>
                  <li>{t('Data races on files', 'Data race-uri pe fișiere')}</li>
                  <li>{t('Exclusive access via file locks', 'Acces exclusiv prin blocaje pe fișiere')}</li>
                  <li>{t('The flock structure', 'Structura flock')}</li>
                  <li>{t('fcntl() for locking — F_SETLK, F_SETLKW, F_GETLK', 'fcntl() pentru blocaje — F_SETLK, F_SETLKW, F_GETLK')}</li>
                  <li>{t('Lock types: read (shared/CREW) vs write (exclusive)', 'Tipuri de blocaje: citire (partajat/CREW) vs. scriere (exclusiv)')}</li>
                  <li>{t('Advisory vs mandatory locks', 'Blocaje advisory vs. mandatory')}</li>
                  <li>{t('Optimized locking (minimal lock region & duration)', 'Blocare optimizată (regiune și durată minimă)')}</li>
                  <li>{t('Measuring execution time', 'Măsurarea timpului de execuție')}</li>
                </ol>
              </Box>

              <Section title={t('1. The Concurrent Access Problem', '1. Problema accesului concurent')} id="c5-concur" checked={!!checked['c5-concur']} onCheck={() => toggleCheck('c5-concur')}>
                <p>{t('Linux is ', 'Linux este ')}<strong>{t('multi-tasking', 'multi-tasking')}</strong>{t(': multiple processes can access the same file simultaneously. This is the default and requires no special code.', ': mai multe procese pot accesa același fișier simultan. Acesta este comportamentul implicit și nu necesită cod special.')}</p>

                <Box type="warning">
                  <p className="font-bold">{t('The problem — data races:', 'Problema — data race-uri:')}</p>
                  <p>{t("When two processes read-then-write the same file region concurrently, one process's write can overwrite the other's, causing ", 'Când două procese citesc și apoi scriu în aceeași regiune a unui fișier concurent, scrierea unui proces o poate suprascrie pe a celuilalt, cauzând ')}<strong>{t('data corruption', 'coruperea datelor')}</strong>{t(". The classic pattern: both read '#', both decide to replace it, but only one replacement survives.", ". Tiparul clasic: ambele citesc '#', ambele decid să îl înlocuiască, dar doar o singură înlocuire supraviețuiește.")}</p>
                </Box>

                <svg viewBox="0 0 420 130" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="10" width="100" height="30" rx="5" fill="#3b82f6" opacity="0.15" stroke="#3b82f6"/>
                  <text x="60" y="30" textAnchor="middle" fill="#3b82f6">{t('Process A', 'Proces A')}</text>
                  <rect x="310" y="10" width="100" height="30" rx="5" fill="#ef4444" opacity="0.15" stroke="#ef4444"/>
                  <text x="360" y="30" textAnchor="middle" fill="#ef4444">{t('Process B', 'Proces B')}</text>
                  <rect x="150" y="60" width="120" height="25" rx="4" fill="currentColor" opacity="0.08" stroke="currentColor" opacity="0.3"/>
                  <text x="210" y="77" textAnchor="middle" fill="currentColor" fontSize="9">aaaa#bbbb#cccc</text>
                  <line x1="60" y1="40" x2="185" y2="60" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3"/>
                  <line x1="360" y1="40" x2="235" y2="60" stroke="#ef4444" strokeWidth="1" strokeDasharray="3"/>
                  <text x="80" y="55" fill="#3b82f6" fontSize="8">read '#', sleep, write '1'</text>
                  <text x="280" y="55" fill="#ef4444" fontSize="8">read '#', sleep, write '2'</text>
                  <text x="210" y="110" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.7">{t("Both find same '#' → only one write survives!", "Ambele găsesc același '#' → doar o scriere supraviețuiește!")}</text>
                </svg>

                <p className="font-bold mt-2">{t('Example — launching concurrent access:', 'Exemplu — lansarea accesului concurent:')}</p>
                <Code>{`$ echo -n "aaaa#bbbb#cccc" > fis.dat
$ ./access_v1 1 & ./access_v1 2 &
# Expected: aaaa1bbbb2cccc  or  aaaa2bbbb1cccc
# Actual:   aaaa1bbbb#cccc  or  aaaa2bbbb#cccc  (data race!)`}</Code>
              </Section>

              <Section title={t('2. File Locks with fcntl()', '2. Blocaje pe fișiere cu fcntl()')} id="c5-locks" checked={!!checked['c5-locks']} onCheck={() => toggleCheck('c5-locks')}>
                <Box type="definition">
                  <p className="font-bold">{t('struct flock — describes a lock:', 'struct flock — descrie un blocaj:')}</p>
                  <Code>{`#include <fcntl.h>
struct flock {
    short l_type;    // F_RDLCK, F_WRLCK, F_UNLCK
    short l_whence;  // SEEK_SET, SEEK_CUR, SEEK_END
    long  l_start;   // offset from l_whence
    long  l_len;     // length (0 = until EOF)
    int   l_pid;     // PID of lock owner (set by kernel)
};`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('fcntl() for locking:', 'fcntl() pentru blocaje:')}</p>
                  <Code>{`int fcntl(int fd, int cmd, struct flock* lock);

// cmd options:
// F_SETLK  — try to set lock, return -1 immediately if conflict
// F_SETLKW — try to set lock, BLOCK (wait) until possible
// F_GETLK  — query: is this lock possible? (fills lock->l_pid)

// Example: lock entire file for writing
struct flock fl;
fl.l_type = F_WRLCK;
fl.l_whence = SEEK_SET;
fl.l_start = 0;
fl.l_len = 0;  // 0 = lock to end of file

if (fcntl(fd, F_SETLKW, &fl) == -1)
    perror("lock failed");

// ... do exclusive work ...

// Unlock:
fl.l_type = F_UNLCK;
fcntl(fd, F_SETLK, &fl);`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Lock types — CREW semantics:', 'Tipuri de blocaje — semantica CREW:')}</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="text-left p-1">{t('Existing lock', 'Blocaj existent')}</th><th className="text-left p-1">{t('New F_RDLCK?', 'Nou F_RDLCK?')}</th><th className="text-left p-1">{t('New F_WRLCK?', 'Nou F_WRLCK?')}</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">{t('None', 'Niciunul')}</td><td className="p-1 text-green-500">{t('Allowed', 'Permis')}</td><td className="p-1 text-green-500">{t('Allowed', 'Permis')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">{t('F_RDLCK (read)', 'F_RDLCK (citire)')}</td><td className="p-1 text-green-500">{t('Allowed (shared)', 'Permis (partajat)')}</td><td className="p-1 text-red-500">{t('Blocked', 'Blocat')}</td></tr>
                      <tr><td className="p-1">{t('F_WRLCK (write)', 'F_WRLCK (scriere)')}</td><td className="p-1 text-red-500">{t('Blocked', 'Blocat')}</td><td className="p-1 text-red-500">{t('Blocked', 'Blocat')}</td></tr>
                    </tbody>
                  </table>
                  <p className="text-sm mt-1"><strong>CREW</strong> = {t('Concurrent Read or Exclusive Write. Multiple readers OR one writer, never both.', 'Citire Concurentă sau Scriere Exclusivă. Mai mulți cititori SAU un singur scriitor, niciodată ambii.')}</p>
                </Box>
              </Section>

              <Section title={t('3. Advisory Nature of Locks', '3. Caracterul advisory al blocajelor')} id="c5-advisory" checked={!!checked['c5-advisory']} onCheck={() => toggleCheck('c5-advisory')}>
                <Box type="warning">
                  <p className="font-bold">{t('Locks are ADVISORY, not mandatory!', 'Blocajele sunt ADVISORY, nu mandatory!')}</p>
                  <p>{t('A lock only works if ', 'Un blocaj funcționează doar dacă ')}<strong>{t('all cooperating processes', 'toate procesele cooperante')}</strong>{t(' agree to check for locks before accessing the file. A process that simply calls ', ' sunt de acord să verifice blocajele înainte de a accesa fișierul. Un proces care pur și simplu apelează ')} <code>write()</code> {t('without checking locks will ', 'fără a verifica blocajele va ')}<strong>{t('succeed', 'reuși')}</strong>{t(' even if another process holds a write lock.', ' chiar dacă un alt proces deține un blocaj de scriere.')}</p>
                </Box>

                <p className="font-bold mt-2">{t('Proof by example:', 'Dovadă prin exemplu:')}</p>
                <Code>{`$ echo -n "aaaa#bbbb#cccc" > fis.dat
$ ./access_v2 1 &          # This process uses locks
$ sleep 2; echo "xyxyxy" > fis.dat   # This does NOT use locks
# Result: "xyxy1y" — the echo overwrote despite the lock!`}</Code>

                <Box type="theorem">
                  <p className="font-bold">{t('Lock characteristics:', 'Caracteristici ale blocajelor:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>{t('Locks are ', 'Blocajele sunt ')}<strong>{t('auto-released', 'eliberate automat')}</strong>{t(' when process closes fd or terminates', ' când procesul închide descriptorul sau se termină')}</li>
                    <li>{t('Locks are ', 'Blocajele ')}<strong>{t('NOT inherited', 'NU se moștenesc')}</strong>{t(' by child processes after fork()', ' de procesele fii după fork()')}</li>
                    <li>{t('Unlocking a segment of a larger lock can split it into two locks', 'Deblocarea unui segment dintr-un blocaj mai mare îl poate împărți în două blocaje')}</li>
                    <li>{t('Must open fd with matching mode: read lock needs O_RDONLY or O_RDWR', 'Descriptorul trebuie deschis cu modul corespunzător: blocajul de citire necesită O_RDONLY sau O_RDWR')}</li>
                  </ul>
                </Box>
              </Section>

              <Section title={t('4. Optimized Locking', '4. Blocare optimizată')} id="c5-optim" checked={!!checked['c5-optim']} onCheck={() => toggleCheck('c5-optim')}>
                <p>{t('Locking the ', 'Blocarea ')}<strong>{t('entire file for the entire duration', 'întregului fișier pe toată durata')}</strong>{t(' serializes access — processes run one-after-another, defeating concurrency.', ' serializează accesul — procesele rulează unul după altul, eliminând concurența.')}</p>

                <Box type="theorem">
                  <p className="font-bold">{t('Optimization principles:', 'Principii de optimizare:')}</p>
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>{t('Minimize lock region', 'Minimizați regiunea blocată')}</strong>{t(": lock only the specific byte(s) you're modifying, not the whole file", ': blocați doar octetul/octeții specifici pe care îi modificați, nu întreg fișierul')}</li>
                    <li><strong>{t('Minimize lock duration', 'Minimizați durata blocajului')}</strong>{t(': acquire lock just before write, release immediately after', ': achiziționați blocajul imediat înainte de scriere, eliberați imediat după')}</li>
                    <li><strong>{t('Re-validate after acquiring lock', 'Revalidați după achiziționarea blocajului')}</strong>{t(': the data may have changed between your read and lock acquisition (TOCTOU race)', ': datele pot fi modificate între citire și achiziționarea blocajului (cursă TOCTOU)')}</li>
                  </ol>
                </Box>

                <p className="font-bold mt-2">{t('Example — lock one byte, re-validate:', 'Exemplu — blocați un octet, revalidați:')}</p>
                <Code>{`// Find first '#' in file, lock it, verify it's still '#', then replace
while (read(fd, &c, 1) == 1) {
    if (c == '#') {
        long pos = lseek(fd, -1, SEEK_CUR);
        // Lock just this one byte:
        fl.l_start = pos; fl.l_len = 1;
        fl.l_type = F_WRLCK;
        fcntl(fd, F_SETLKW, &fl);  // wait for lock

        // RE-READ to verify still '#' (another process may have changed it!)
        lseek(fd, pos, SEEK_SET);
        read(fd, &c, 1);
        if (c != '#') { /* unlock and continue searching */ }
        else { /* write replacement and unlock */ }
    }
}`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t("Trap — TOCTOU (Time-of-check to time-of-use):", "Capcană — TOCTOU (Timp de verificare vs. timp de utilizare):")}</p>
                  <p>{t("Between reading '#' and acquiring the lock, another process may have already replaced it. You MUST re-read after locking. Forgetting this is a classic concurrency bug.", "Între citirea '#' și achiziționarea blocajului, un alt proces poate deja să îl fi înlocuit. TREBUIE să recitiți după blocare. Uitarea acestui pas este un bug clasic de concurență.")}</p>
                </Box>
              </Section>

              <Section title={t('5. Measuring Execution Time', '5. Măsurarea timpului de execuție')} id="c5-time" checked={!!checked['c5-time']} onCheck={() => toggleCheck('c5-time')}>
                <Box type="formula">
                  <p className="font-bold">{t('Methods:', 'Metode:')}</p>
                  <Code>{`# Shell level:
$ time ./program           # real/user/sys times
$ /usr/bin/time ./program  # detailed stats

// C level:
#include <sys/time.h>
struct timeval tv;
gettimeofday(&tv, NULL);  // microsecond precision

#include <time.h>
struct timespec ts;
clock_gettime(CLOCK_REALTIME, &ts); // nanosecond precision`}</Code>
                </Box>
              </Section>

              <Section title={t('Cheat Sheet', 'Rezumat rapid')} id="c5-cheat" checked={!!checked['c5-cheat']} onCheck={() => toggleCheck('c5-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">{t('Lock types', 'Tipuri de blocaje')}</p><p>F_RDLCK ({t('shared read', 'citire partajată')})</p><p>F_WRLCK ({t('exclusive write', 'scriere exclusivă')})</p><p>F_UNLCK ({t('release', 'eliberare')})</p></Box>
                  <Box type="formula"><p className="font-bold">{t('fcntl commands', 'Comenzi fcntl')}</p><p>F_SETLK ({t('non-blocking', 'neblocant')})</p><p>F_SETLKW ({t('blocking/wait', 'blocant/așteptare')})</p><p>F_GETLK ({t('query', 'interogare')})</p></Box>
                  <Box type="formula"><p className="font-bold">{t('CREW rule', 'Regula CREW')}</p><p>{t('Multiple readers OR one writer', 'Mai mulți cititori SAU un scriitor')}</p><p>{t('Never both simultaneously', 'Niciodată ambii simultan')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Key facts', 'Fapte cheie')}</p><p>{t('Advisory (not mandatory)', 'Advisory (nu mandatory)')}</p><p>{t('Not inherited by fork()', 'Nu se moștenesc prin fork()')}</p><p>{t('Auto-released on close/exit', 'Eliberate automat la close/exit')}</p><p>{t('Re-validate after acquire!', 'Revalidați după achiziționare!')}</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c5-quiz" checked={!!checked['c5-quiz']} onCheck={() => toggleCheck('c5-quiz')}>
                <Toggle question={t('1. What is a data race on a file?', '1. Ce este un data race pe un fișier?')} answer={t('When two or more processes read-then-write the same region of a file concurrently, and the result depends on the unpredictable timing of their operations. One process\'s write can be overwritten or lost.', 'Când două sau mai multe procese citesc și apoi scriu în aceeași regiune a unui fișier concurent, iar rezultatul depinde de temporizarea impredictibilă a operațiilor lor. Scrierea unui proces poate fi suprascrisă sau pierdută.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('2. What does F_SETLKW do differently from F_SETLK?', '2. Ce face F_SETLKW diferit față de F_SETLK?')} answer={t('F_SETLKW is BLOCKING: if the lock conflicts with an existing lock, the call waits (blocks) until the lock becomes available. F_SETLK is non-blocking: it returns -1 immediately with errno = EACCES or EAGAIN.', 'F_SETLKW este BLOCANT: dacă blocajul intră în conflict cu unul existent, apelul așteaptă (blochează) până când blocajul devine disponibil. F_SETLK este neblocant: returnează -1 imediat cu errno = EACCES sau EAGAIN.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('3. Can a read lock and a write lock coexist on the same region?', '3. Pot coexista un blocaj de citire și unul de scriere pe aceeași regiune?')} answer={t('No. A write lock (F_WRLCK) is exclusive — it conflicts with both read and write locks. Multiple read locks CAN coexist (they are shared). This is CREW semantics.', 'Nu. Un blocaj de scriere (F_WRLCK) este exclusiv — intră în conflict atât cu blocajele de citire, cât și cu cele de scriere. Mai multe blocaje de citire POT coexista (sunt partajate). Aceasta este semantica CREW.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('4. What happens if process A holds a write lock and process B does a plain write() without locking?', '4. Ce se întâmplă dacă procesul A deține un blocaj de scriere și procesul B face un write() simplu fără blocare?')} answer={t("Process B's write SUCCEEDS! Locks are advisory — the kernel does not enforce them on processes that don't check. All cooperating processes must use locks for them to work.", 'Scrierea procesului B REUȘEȘTE! Blocajele sunt advisory — nucleul nu le impune proceselor care nu le verifică. Toate procesele cooperante trebuie să folosească blocaje pentru ca acestea să funcționeze.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('5. Are locks inherited by child processes after fork()?', '5. Blocajele se moștenesc de procesele fii după fork()?')} answer={t("No. Each lock has the creator's PID stored in l_pid. Child processes have different PIDs and do not inherit the parent's locks.", 'Nu. Fiecare blocaj are PID-ul creatorului stocat în l_pid. Procesele fii au PID-uri diferite și nu moștenesc blocajele părintelui.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('6. What is the TOCTOU problem with file locking?', '6. Ce este problema TOCTOU la blocarea fișierelor?')} answer={t('Time-of-check to time-of-use: you read data, decide to modify it, then acquire a lock — but between the read and the lock, another process may have already changed the data. Solution: re-read after acquiring the lock.', 'Timp de verificare vs. timp de utilizare: citiți datele, decideți să le modificați, apoi achiziționați un blocaj — dar între citire și blocare, un alt proces poate deja fi modificat datele. Soluție: recitiți după achiziționarea blocajului.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('7. How do you lock just one byte at position 100?', '7. Cum blocați un singur octet la poziția 100?')} answer={<span>{t('Set ', 'Setați ')} <code>l_whence=SEEK_SET, l_start=100, l_len=1</code> {t('in the flock struct, then call', 'în structura flock, apoi apelați')} <code>fcntl(fd, F_SETLKW, &fl)</code>.</span>} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('8. What does l_len=0 mean in a flock struct?', '8. Ce înseamnă l_len=0 într-o structură flock?')} answer={t("It means lock from l_start to the END OF FILE, including any bytes that may be appended later. It's a common idiom for locking the entire file.", 'Înseamnă blocarea de la l_start până la SFÂRȘITUL FIȘIERULUI, inclusiv octeții care pot fi adăugați ulterior. Este un idiom comun pentru blocarea întregului fișier.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('9. Why is locking the entire file for the entire duration suboptimal?', '9. De ce este suboptimă blocarea întregului fișier pe toată durata?')} answer={t('It serializes all access — processes run one after another, completely eliminating concurrency. Better to lock only the specific region being modified, for the minimum time needed.', 'Serializează tot accesul — procesele rulează unul după altul, eliminând complet concurența. Mai bine să blocați doar regiunea specifică modificată, pentru durata minimă necesară.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('10. How do you check if a lock exists without actually locking?', '10. Cum verificați dacă există un blocaj fără a bloca efectiv?')} answer={<span>{t('Use ', 'Utilizați ')} <code>fcntl(fd, F_GETLK, &fl)</code>. {t('If a conflicting lock exists, the struct is filled with info about it (including l_pid of the holder). If no conflict, l_type is set to F_UNLCK.', 'Dacă există un blocaj conflictual, structura este completată cu informații despre el (inclusiv l_pid al deținătorului). Dacă nu există conflict, l_type este setat la F_UNLCK.')}</span>} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 6 ==================== */}
            <CourseBlock title="Course 6: Process Management I - fork() & wait()" id="c6">
              <p className="mb-3 text-sm opacity-80">Source: OS(6) - Programare de sistem in C pentru Linux (III), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Plan:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('Program vs process — definitions', 'Program vs. proces — definiții')}</li>
                  <li>{t('Process table (PCB), PID, PPID, UID, states', 'Tabela proceselor (PCB), PID, PPID, UID, stări')}</li>
                  <li>{t('Info primitives: getpid, getppid, getuid, etc.', 'Primitive informative: getpid, getppid, getuid, etc.')}</li>
                  <li>{t('Sleep primitives: sleep, usleep, nanosleep', 'Primitive de suspendare: sleep, usleep, nanosleep')}</li>
                  <li>{t('Termination: exit (normal) vs abort/signal (abnormal)', 'Terminare: exit (normală) vs. abort/semnal (anormală)')}</li>
                  <li>{t('Process creation: fork() — the only way', 'Crearea proceselor: fork() — singura metodă')}</li>
                  <li>{t("What the child inherits (and what it doesn't)", 'Ce moștenește fiul (și ce nu)')}</li>
                  <li>{t('Synchronization: wait() and waitpid()', 'Sincronizare: wait() și waitpid()')}</li>
                  <li>{t('Zombie and orphan processes', 'Procese zombie și orfane')}</li>
                </ol>
              </Box>

              <Section title={t('1. Program vs Process', '1. Program vs. Proces')} id="c6-def" checked={!!checked['c6-def']} onCheck={() => toggleCheck('c6-def')}>
                <Box type="definition">
                  <p><strong>{t('Program', 'Program')}</strong> = {t('an executable file on disk (compiled from source).', 'un fișier executabil pe disc (compilat din sursă).')}</p>
                  <p><strong>{t('Process', 'Proces')}</strong> = {t('an instance of a program in execution, characterized by: lifetime, allocated memory (code + data + stacks), CPU time, and other resources.', 'o instanță a unui program în execuție, caracterizată prin: durată de viață, memorie alocată (cod + date + stive), timp procesor și alte resurse.')}</p>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Process hierarchy:', 'Ierarhia proceselor:')}</p>
                  <p>{t('Processes form a ', 'Procesele formează un ')}<strong>{t('tree', 'arbore')}</strong>{t('. Every process has a parent (PPID) that created it. Root of tree = PID 0 (created at boot). PID 1 = ', '. Fiecare proces are un părinte (PPID) care l-a creat. Rădăcina arborelui = PID 0 (creat la pornire). PID 1 = ')} <code>init</code>/<code>systemd</code> {t('(first user-space process).', '(primul proces din spațiul utilizator).')}</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Process Control Block (PCB) contains:', 'Process Control Block (PCB) conține:')}</p>
                  <Code>{`PID, PPID             // process & parent IDs
UID, GID              // real owner
EUID, EGID            // effective owner (for setuid programs)
State                 // ready, running, waiting, zombie
Terminal, cmdline, env, hardware context, ...`}</Code>
                </Box>
              </Section>

              <Section title={t('2. Info & Utility Primitives', '2. Primitive informative și utilitare')} id="c6-info" checked={!!checked['c6-info']} onCheck={() => toggleCheck('c6-info')}>
                <Box type="formula">
                  <p className="font-bold">{t('Process information:', 'Informații despre proces:')}</p>
                  <Code>{`pid_t getpid(void);   // my PID
pid_t getppid(void);  // parent's PID
uid_t getuid(void);   // real user ID
uid_t geteuid(void);  // effective user ID
gid_t getgid(void);   // real group ID`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Sleep (suspend execution):', 'Sleep (suspendarea execuției):')}</p>
                  <Code>{`sleep(5);             // 5 seconds (precision: seconds)
usleep(500000);       // 0.5 seconds (precision: microseconds)
nanosleep(&req, &rem); // nanosecond precision, restartable`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Trap:', 'Capcană:')}</p>
                  <p>{t('Actual sleep duration may ', 'Durata efectivă de suspendare poate ')}<strong>{t('exceed', 'depăși')}</strong>{t(' the requested time (OS scheduling). It may also be ', ' valoarea specificată (planificarea SO). Poate fi și ')}<strong>{t('shorter', 'mai scurtă')}</strong>{t(' if a signal interrupts the sleep (errno = EINTR). Only ', ' dacă un semnal întrerupe suspendarea (errno = EINTR). Doar ')} <code>nanosleep</code> {t('reports the remaining time via its second argument.', 'raportează timpul rămas prin al doilea argument.')}</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Termination:', 'Terminare:')}</p>
                  <Code>{`// Normal termination:
exit(status);  // status & 0xFF saved as exit code
return n;      // from main(), equivalent to exit(n)

// Abnormal termination:
abort();       // sends SIGABRT to self → abnormal exit`}</Code>
                </Box>
              </Section>

              <Section title={t('3. fork() — Process Creation', '3. fork() — Crearea proceselor')} id="c6-fork" checked={!!checked['c6-fork']} onCheck={() => toggleCheck('c6-fork')}>
                <p><code>fork()</code> {t('is the ', 'este singura ')}<strong>{t('only', '')}</strong>{t(' way to create a new process in UNIX/Linux.', 'modalitate de a crea un proces nou în UNIX/Linux.')}</p>

                <Box type="formula">
                  <p className="font-bold">{t('Interface:', 'Interfață:')}</p>
                  <Code>{`pid_t fork(void);
// Creates a COPY (clone) of the calling process
// BOTH parent and child continue from the next instruction

// Return values:
//   In parent: child's PID (positive number)
//   In child:  0
//   On error:  -1 (no child created)`}</Code>
                </Box>

                <svg viewBox="0 0 400 180" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="140" y="5" width="120" height="30" rx="6" fill="#3b82f6" opacity="0.15" stroke="#3b82f6"/>
                  <text x="200" y="24" textAnchor="middle" fill="#3b82f6" fontWeight="bold">{t('Parent process', 'Proces părinte')}</text>
                  <text x="200" y="55" textAnchor="middle" fill="currentColor" fontWeight="bold" fontSize="12">fork()</text>
                  <line x1="200" y1="35" x2="200" y2="45" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="200" y1="60" x2="100" y2="80" stroke="#3b82f6" strokeWidth="1.5"/>
                  <line x1="200" y1="60" x2="300" y2="80" stroke="#10b981" strokeWidth="1.5"/>
                  <rect x="40" y="80" width="120" height="35" rx="6" fill="#3b82f6" opacity="0.1" stroke="#3b82f6"/>
                  <text x="100" y="95" textAnchor="middle" fill="#3b82f6" fontSize="9">{t('Parent continues', 'Părintele continuă')}</text>
                  <text x="100" y="108" textAnchor="middle" fill="#3b82f6" fontSize="9">{t('fork() returns child PID', 'fork() returnează PID-ul fiului')}</text>
                  <rect x="240" y="80" width="120" height="35" rx="6" fill="#10b981" opacity="0.1" stroke="#10b981"/>
                  <text x="300" y="95" textAnchor="middle" fill="#10b981" fontSize="9">{t('Child starts here', 'Fiul începe aici')}</text>
                  <text x="300" y="108" textAnchor="middle" fill="#10b981" fontSize="9">{t('fork() returns 0', 'fork() returnează 0')}</text>
                  <text x="200" y="140" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.6">{t('Both run the SAME code, differentiated by return value', 'Ambii rulează ACELAȘI cod, diferențiați prin valoarea returnată')}</text>
                  <text x="200" y="155" textAnchor="middle" fill="#ef4444" fontSize="9">{t('Separate memory! Variable changes are NOT shared.', 'Memorie separată! Modificările variabilelor NU sunt partajate.')}</text>
                </svg>

                <p className="font-bold mt-2">{t('Canonical fork pattern:', 'Tiparul canonic fork:')}</p>
                <Code>{`pid_t pid = fork();
if (pid == -1) {
    perror("fork failed"); exit(1);
}
if (pid == 0) {
    // ===== CHILD process =====
    printf("I am child, PID=%d, parent=%d\\n", getpid(), getppid());
    exit(0);  // child exits with code 0
}
// ===== PARENT process =====
printf("I am parent, PID=%d, child=%d\\n", getpid(), pid);
// parent continues...`}</Code>

                <Box type="theorem">
                  <p className="font-bold">{t('What the child inherits from parent:', 'Ce moștenește fiul de la părinte:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>{t('Same UID/GID, environment variables, command line', 'Același UID/GID, variabile de mediu, linie de comandă')}</li>
                    <li>{t('Same ', 'Aceiași ')}<strong>{t('open file descriptors', 'descriptori de fișiere deschiși')}</strong>{t(' (shared entries in global file table!)', ' (intrări partajate în tabela globală de fișiere!)')}</li>
                    <li>{t('Same memory-mapped regions (mmap)', 'Aceleași regiuni mapate în memorie (mmap)')}</li>
                    <li>{t('Copy of all variables (but in ', 'Copie a tuturor variabilelor (dar în ')}<strong>{t('separate memory', 'memorie separată')}</strong>{t(' — COW)', ' — COW)')}</li>
                  </ul>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Critical point — no shared memory by default:', 'Punct critic — fără memorie partajată implicit:')}</p>
                  <p>{t('After fork, parent and child each work on their ', 'După fork, părintele și fiul lucrează fiecare pe propria ')}<strong>{t('own copy', 'copie')}</strong>{t(' of memory. If the child modifies a variable, the parent does NOT see it (and vice versa). This is implemented via ', ' a memoriei. Dacă fiul modifică o variabilă, părintele NU o vede (și invers). Aceasta este implementată prin pagini ')}<strong>{t('copy-on-write', 'copy-on-write')}</strong>{t(' (COW) pages for efficiency.', ' (COW) pentru eficiență.')}</p>
                </Box>

                <p className="font-bold mt-2">{t('Example — proving separate memory:', 'Exemplu — demonstrarea memoriei separate:')}</p>
                <Code>{`int x = 10;
pid_t pid = fork();
if (pid == 0) {
    x = 99;  // child modifies x
    printf("Child: x=%d\\n", x);   // prints 99
    exit(0);
}
wait(NULL);
printf("Parent: x=%d\\n", x);     // prints 10 (unchanged!)`}</Code>
              </Section>

              <Section title={t('4. wait() — Synchronization', '4. wait() — Sincronizare')} id="c6-wait" checked={!!checked['c6-wait']} onCheck={() => toggleCheck('c6-wait')}>
                <Box type="formula">
                  <p className="font-bold">{t('wait() and waitpid():', 'wait() și waitpid():')}</p>
                  <Code>{`pid_t wait(int* wstatus);
// Blocks until ANY child terminates
// Returns: PID of terminated child, or -1 (no children)

pid_t waitpid(pid_t pid, int* wstatus, int options);
// pid = -1: wait for any child (like wait())
// pid > 0: wait for specific child
// options: 0 (block) or WNOHANG (non-blocking)`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Inspecting wstatus with macros:', 'Inspectarea wstatus cu macro-uri:')}</p>
                  <Code>{`int wstatus;
pid_t child = wait(&wstatus);

if (WIFEXITED(wstatus)) {
    // Normal termination
    int code = WEXITSTATUS(wstatus);  // exit code (0-255)
    printf("Child %d exited with code %d\\n", child, code);
}
else if (WIFSIGNALED(wstatus)) {
    // Killed by signal
    int sig = WTERMSIG(wstatus);
    printf("Child %d killed by signal %d\\n", child, sig);
}`}</Code>
                </Box>

                <Box type="definition">
                  <p className="font-bold">{t('Zombie and orphan processes:', 'Procese zombie și orfane:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>{t('Zombie', 'Zombie')}</strong>: {t("child terminated but parent hasn't called wait() yet. The PCB entry remains in the process table. Fix: parent must call wait().", 'fiul s-a terminat dar părintele nu a apelat încă wait(). Intrarea PCB rămâne în tabela proceselor. Soluție: părintele trebuie să apeleze wait().')}</li>
                    <li><strong>{t('Orphan', 'Orfan')}</strong>: {t('parent terminates before child. The child is re-parented to PID 1 (init/systemd), which will reap it.', 'părintele se termină înainte de fiu. Fiul este re-adoptat de PID 1 (init/systemd), care îl va recolta.')}</li>
                  </ul>
                </Box>

                <p className="font-bold mt-2">{t('Example — create N children, wait for all:', 'Exemplu — crearea a N fii, așteptarea tuturor:')}</p>
                <Code>{`#define N 5
for (int i = 0; i < N; i++) {
    pid_t pid = fork();
    if (pid == 0) {
        printf("Child %d (PID %d) working...\\n", i, getpid());
        sleep(i + 1);       // simulate work
        exit(i);            // return i as exit code
    }
}
// Parent waits for ALL children:
for (int i = 0; i < N; i++) {
    int st;
    pid_t p = wait(&st);
    if (WIFEXITED(st))
        printf("Child %d finished, code=%d\\n", p, WEXITSTATUS(st));
}`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Trap — fork in a loop:', 'Capcană — fork într-o buclă:')}</p>
                  <p>{t('If you forget the ', 'Dacă uitați ')} <code>exit()</code> {t('in the child branch, the child will continue the for-loop and fork ', 'din ramura fiului, fiul va continua bucla for și va fork ')}<strong>{t('its own', 'proprii')}</strong>{t(' children, causing an exponential explosion of processes (fork bomb)!', ' copii, cauzând o explozie exponențială de procese (fork bomb)!')}</p>
                </Box>
              </Section>

              <Section title={t('5. Synchronization Points', '5. Puncte de sincronizare')} id="c6-sync" checked={!!checked['c6-sync']} onCheck={() => toggleCheck('c6-sync')}>
                <Box type="theorem">
                  <p className="font-bold">{t('Two synchronization points:', 'Două puncte de sincronizare:')}</p>
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>fork()</strong>{t(': both parent and child start simultaneous execution from this point', ': atât părintele cât și fiul încep execuția simultană din acest punct')}</li>
                    <li><strong>wait()</strong>{t(': parent blocks until child terminates — this is where exit code flows from child to parent', ': părintele se blochează până când fiul se termină — aici curge codul de exit de la fiu la părinte')}</li>
                  </ol>
                </Box>

                <svg viewBox="0 0 350 130" className="w-full max-w-sm mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <text x="175" y="15" textAnchor="middle" fill="currentColor" fontWeight="bold">{t('Timeline', 'Cronologie')}</text>
                  <line x1="50" y1="40" x2="300" y2="40" stroke="#3b82f6" strokeWidth="2"/>
                  <text x="30" y="44" fill="#3b82f6" fontSize="9">P</text>
                  <line x1="120" y1="40" x2="120" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="3"/>
                  <line x1="120" y1="70" x2="250" y2="70" stroke="#10b981" strokeWidth="2"/>
                  <text x="105" y="68" fill="#10b981" fontSize="9">C</text>
                  <circle cx="120" cy="40" r="4" fill="#f59e0b"/>
                  <text x="120" y="30" textAnchor="middle" fill="#f59e0b" fontSize="8">fork()</text>
                  <circle cx="250" cy="70" r="4" fill="#ef4444"/>
                  <text x="250" y="85" textAnchor="middle" fill="#ef4444" fontSize="8">exit()</text>
                  <line x1="250" y1="70" x2="250" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3"/>
                  <circle cx="250" cy="40" r="4" fill="#f59e0b"/>
                  <text x="250" y="30" textAnchor="middle" fill="#f59e0b" fontSize="8">{t('wait() returns', 'wait() returnează')}</text>
                  <rect x="160" y="36" width="90" height="8" rx="2" fill="#3b82f6" opacity="0.2"/>
                  <text x="205" y="43" textAnchor="middle" fill="#3b82f6" fontSize="7">{t('blocked', 'blocat')}</text>
                </svg>
              </Section>

              <Section title={t('Cheat Sheet', 'Rezumat rapid')} id="c6-cheat" checked={!!checked['c6-cheat']} onCheck={() => toggleCheck('c6-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">fork()</p><p>{t('Returns: child PID (parent), 0 (child), -1 (error)', 'Returnează: PID fiu (părinte), 0 (fiu), -1 (eroare)')}</p><p>{t('Child = clone, separate memory (COW)', 'Fiu = clonă, memorie separată (COW)')}</p><p>{t('Shares: open fds, mmaps, env', 'Partajează: descriptori deschiși, mmap-uri, env')}</p></Box>
                  <Box type="formula"><p className="font-bold">wait()/waitpid()</p><p>WIFEXITED, WEXITSTATUS</p><p>WIFSIGNALED, WTERMSIG</p><p>{t('WNOHANG for non-blocking', 'WNOHANG pentru neblocant')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Info', 'Informații')}</p><p>getpid, getppid, getuid, geteuid</p><p>sleep, usleep, nanosleep</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Termination', 'Terminare')}</p><p>{t('exit(code) — normal', 'exit(cod) — normală')}</p><p>abort() — SIGABRT — {t('abnormal', 'anormală')}</p><p>{t('Zombie: child done, parent no wait', 'Zombie: fiu terminat, părintele nu a așteptat')}</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c6-quiz" checked={!!checked['c6-quiz']} onCheck={() => toggleCheck('c6-quiz')}>
                <Toggle question={t('1. What is the ONLY way to create a new process in UNIX?', '1. Care este singura modalitate de a crea un proces nou în UNIX?')} answer={t('The fork() system call. It creates a clone of the calling process. There is no other mechanism (unlike Windows which has CreateProcess).', 'Apelul de sistem fork(). Creează o clonă a procesului apelant. Nu există alt mecanism (spre deosebire de Windows care are CreateProcess).')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('2. What does fork() return in the child process, and why?', '2. Ce returnează fork() în procesul fiu și de ce?')} answer={t("0. Because the child can always find its parent's PID via getppid(), but the parent has no built-in way to find the child's PID other than the fork() return value. So the asymmetry is by design.", '0. Deoarece fiul poate afla oricând PID-ul părintelui prin getppid(), dar părintele nu are altă metodă built-in de a afla PID-ul fiului decât valoarea returnată de fork(). Asimetria este intenționată.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('3. After fork(), if the child modifies variable x, does the parent see the change?', '3. După fork(), dacă fiul modifică variabila x, o vede și părintele?')} answer={t('No. Parent and child have separate memory spaces. Changes in one are invisible to the other. This is the fundamental consequence of fork() creating a COPY. (Implemented efficiently via copy-on-write pages.)', 'Nu. Părintele și fiul au spații de memorie separate. Modificările dintr-unul sunt invizibile pentru celălalt. Aceasta este consecința fundamentală a faptului că fork() creează o COPIE. (Implementat eficient prin pagini copy-on-write.)')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('4. What is a zombie process and how do you prevent it?', '4. Ce este un proces zombie și cum îl preveniți?')} answer={t("A zombie is a process that has terminated but whose parent hasn't called wait() to read its exit status. The PCB remains in the process table. Prevention: parent must call wait() or waitpid() for each child.", "Un zombie este un proces care s-a terminat dar al cărui părinte nu a apelat wait() pentru a-i citi statusul de exit. PCB-ul rămâne în tabela proceselor. Prevenire: părintele trebuie să apeleze wait() sau waitpid() pentru fiecare fiu.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('5. What happens to orphan processes?', '5. Ce se întâmplă cu procesele orfane?')} answer={t('If a parent dies before its children, the children become orphans and are re-parented to PID 1 (init/systemd), which will eventually call wait() to reap them.', 'Dacă un părinte moare înaintea copiilor săi, aceștia devin orfani și sunt re-adoptați de PID 1 (init/systemd), care va apela în cele din urmă wait() pentru a-i recolta.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('6. Why is exit() in the child critical inside a fork-in-a-loop?', '6. De ce este exit() în fiu critic într-un fork în buclă?')} answer={t("Without exit(), the child continues the loop and calls fork() itself, creating grandchildren who also continue the loop — exponential process explosion (fork bomb). Always exit() or _exit() in the child branch.", 'Fără exit(), fiul continuă bucla și apelează fork() el însuși, creând nepoți care continuă și ei bucla — explozie exponențială de procese (fork bomb). Utilizați întotdeauna exit() sau _exit() în ramura fiului.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('7. Do file descriptors survive fork()?', '7. Descriptorii de fișiere supraviețuiesc fork()?')} answer={t("Yes. The child inherits copies of ALL open file descriptors, and crucially, they point to the SAME entries in the kernel's global open file table. So parent and child share the file offset — reads/writes by one affect the other's position.", 'Da. Fiul moștenește copii ale TUTUROR descriptorilor de fișiere deschiși și, crucial, aceștia pointează spre ACELEAȘI intrări din tabela globală de fișiere a nucleului. Deci părintele și fiul partajează offset-ul — citirile/scrierile unuia afectează poziția celuilalt.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('8. What does WEXITSTATUS(wstatus) return if the child called exit(42)?', '8. Ce returnează WEXITSTATUS(wstatus) dacă fiul a apelat exit(42)?')} answer={t('42. WEXITSTATUS extracts the low 8 bits of the exit code from the wstatus value. Only valid if WIFEXITED(wstatus) is true.', '42. WEXITSTATUS extrage cei 8 biți inferiori ai codului de exit din valoarea wstatus. Valabil doar dacă WIFEXITED(wstatus) este adevărat.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('9. How do you wait for a SPECIFIC child process?', '9. Cum așteptați un anumit proces fiu?')} answer={<span>{t('Use ', 'Utilizați ')} <code>waitpid(child_pid, &st, 0)</code> {t('instead of', 'în loc de')} <code>wait()</code>. {t('The first argument is the specific PID to wait for.', 'Primul argument este PID-ul specific pentru care se așteaptă.')}</span>} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('10. What is the difference between exit() and _exit()?', '10. Care este diferența dintre exit() și _exit()?')} answer={t("exit() flushes stdio buffers, runs atexit() handlers, then terminates. _exit() terminates IMMEDIATELY without flushing buffers or cleanup. Use _exit() in child processes after fork() if the child will call exec() (to avoid double-flushing buffers).", 'exit() golește buffer-ele stdio, rulează handler-ele atexit(), apoi termină. _exit() termină IMEDIAT fără a goli buffer-ele sau a face curățenie. Utilizați _exit() în procesele fii după fork() dacă fiul va apela exec() (pentru a evita dublarea golirii buffer-elor).')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 7 ==================== */}
            <CourseBlock title="Course 7: Process Management II - exec() Family" id="c7">
              <p className="mb-3 text-sm opacity-80">Source: OS(7) - Programare de sistem in C pentru Linux (IV), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Plan:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('The exec concept — process "overlay" (not creation)', 'Conceptul exec — "reacoperirea" procesului (nu crearea)')}</li>
                  <li>{t('The 6+1 exec functions and their differences', 'Cele 6+1 funcții exec și diferențele dintre ele')}</li>
                  <li>{t('What survives exec (PID, fds, etc.) and what doesn\'t', 'Ce supraviețuiește exec (PID, descriptori, etc.) și ce nu')}</li>
                  <li>{t('The fork+exec pattern for running external programs', 'Tiparul fork+exec pentru rularea programelor externe')}</li>
                  <li>{t('Exec with open files — fd inheritance and FD_CLOEXEC', 'Exec cu fișiere deschise — moștenirea descriptorilor și FD_CLOEXEC')}</li>
                  <li>{t('Exec with scripts (shebang interpreter)', 'Exec cu scripturi (interpretorul shebang)')}</li>
                  <li>{t('stdout redirection via dup/dup2 before exec', 'Redirecționarea stdout prin dup/dup2 înainte de exec')}</li>
                  <li>{t('The system() convenience function', 'Funcția de conveniență system()')}</li>
                </ol>
              </Box>

              <Section title={t('1. The exec() Concept', '1. Conceptul exec()')} id="c7-concept" checked={!!checked['c7-concept']} onCheck={() => toggleCheck('c7-concept')}>
                <p><code>fork()</code> {t('creates a new process running the ', 'creează un proces nou care rulează ')}<strong>{t('same', 'același')}</strong>{t(' program. But how do we run a ', ' program. Dar cum rulăm un ')}<strong>{t('different', 'alt')}</strong>{t(' program? Answer: ', ' program? Răspuns: ')} <code>exec()</code> <strong>{t('replaces', 'înlocuiește')}</strong>{t(" the current process's program with a new one.", ' programul procesului curent cu unul nou.')}</p>

                <Box type="definition">
                  <p className="font-bold">{t('Key mental model:', 'Modelul mental esențial:')}</p>
                  <p><code>exec()</code> {t('does NOT create a new process. It ', 'NU creează un proces nou. ')}<strong>{t('overlays', 'Reacoperă')}</strong>{t(' the calling process with a new executable. Same PID, same parent, same open files — but completely new code, data, and stack.', ' procesul apelant cu un nou executabil. Același PID, același părinte, aceleași fișiere deschise — dar cod, date și stivă complet noi.')}</p>
                </Box>

                <svg viewBox="0 0 420 110" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="20" y="20" width="140" height="50" rx="8" fill="#3b82f6" opacity="0.12" stroke="#3b82f6"/>
                  <text x="90" y="40" textAnchor="middle" fill="#3b82f6" fontWeight="bold">{t('Old Program', 'Program vechi')}</text>
                  <text x="90" y="55" textAnchor="middle" fill="currentColor" fontSize="9">code + data + stack</text>
                  <text x="210" y="48" textAnchor="middle" fill="#f59e0b" fontWeight="bold" fontSize="12">exec()</text>
                  <line x1="160" y1="45" x2="250" y2="45" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arr)"/>
                  <rect x="260" y="20" width="140" height="50" rx="8" fill="#10b981" opacity="0.12" stroke="#10b981"/>
                  <text x="330" y="40" textAnchor="middle" fill="#10b981" fontWeight="bold">{t('New Program', 'Program nou')}</text>
                  <text x="330" y="55" textAnchor="middle" fill="currentColor" fontSize="9">code + data + stack</text>
                  <text x="210" y="90" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.6">{t('Same PID, same parent, same open fds', 'Același PID, același părinte, aceiași descriptori deschiși')}</text>
                  <text x="210" y="102" textAnchor="middle" fill="#ef4444" fontSize="9">{t('On success: exec() NEVER returns!', 'La succes: exec() NU returnează niciodată!')}</text>
                </svg>

                <Box type="warning">
                  <p className="font-bold">{t('exec() does not return on success!', 'exec() nu returnează la succes!')}</p>
                  <p>{t("If exec succeeds, the calling program no longer exists — it's been replaced. Any code after exec() only runs if exec ", 'Dacă exec reușește, programul apelant nu mai există — a fost înlocuit. Orice cod după exec() rulează doar dacă exec ')}<strong>{t('failed', 'a eșuat')}</strong>{t(' (returns -1).', ' (returnează -1).')}</p>
                </Box>
              </Section>

              <Section title={t('2. The 6+1 exec Functions', '2. Cele 6+1 funcții exec')} id="c7-family" checked={!!checked['c7-family']} onCheck={() => toggleCheck('c7-family')}>
                <Box type="formula">
                  <p className="font-bold">{t('Naming convention — each letter means something:', 'Convenția de denumire — fiecare literă are o semnificație:')}</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="p-1">{t('Suffix', 'Sufix')}</th><th className="p-1">{t('Meaning', 'Semnificație')}</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">l</td><td className="p-1">{t('args as ', 'argumente ca ')} <strong>{t('l', 'l')}</strong>{t('ist (variadic: arg0, arg1, ..., NULL)', 'istă (variadic: arg0, arg1, ..., NULL)')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">v</td><td className="p-1">{t('args as ', 'argumente ca ')} <strong>{t('v', 'v')}</strong>{t('ector (char* argv[])', 'ector (char* argv[])')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">p</td><td className="p-1">{t('search ', 'caută în ')} <strong>PATH</strong> {t('for executable', 'după executabil')}</td></tr>
                      <tr><td className="p-1 font-mono">e</td><td className="p-1">{t('provide custom ', 'furnizează un ')} <strong>{t('e', 'e')}</strong>{t('nvironment (char* env[])', 'nvironment personalizat (char* env[])')}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('All 7 functions:', 'Toate 7 funcțiile:')}</p>
                  <Code>{`// List-based (variable number of args):
int execl (char* path, char* arg0, ..., NULL);
int execlp(char* file, char* arg0, ..., NULL);      // +PATH
int execle(char* path, char* arg0,..., NULL, env[]); // +env

// Vector-based (argv array):
int execv (char* path, char* argv[]);
int execvp(char* file, char* argv[]);               // +PATH
int execve(char* path, char* argv[], char* env[]);   // +env (THE syscall)
int execvpe(char* file, char* argv[], char* env[]);  // +PATH+env (GNU)`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Important rules:', 'Reguli importante:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><code>arg0</code> / <code>argv[0]</code> = {t('process name (shown by ps), by convention = executable name', 'numele procesului (afișat de ps), prin convenție = numele executabilului')}</li>
                    <li>{t('Last arg in list form, and last element of argv[], must be ', 'Ultimul argument în formă de listă și ultimul element al argv[] trebuie să fie ')} <strong>NULL</strong></li>
                    <li>{t('Without ', 'Fără sufixul ')} <code>p</code> {t('suffix: ', ': ')} <code>path</code> {t('must be full/relative path (not searched in PATH)', 'trebuie să fie cale completă/relativă (nu se caută în PATH)')}</li>
                    <li><code>execve</code> {t('is the actual system call; others are library wrappers', 'este apelul de sistem real; celelalte sunt wrapper-e de bibliotecă')}</li>
                  </ul>
                </Box>

                <p className="font-bold mt-2">{t('Example — execl:', 'Exemplu — execl:')}</p>
                <Code>{`execl("/bin/ls", "ls", "-l", "-i", "/home", NULL);
// If we reach here, exec failed:
perror("exec failed");
exit(127);`}</Code>
              </Section>

              <Section title={t('3. What Survives exec()', '3. Ce supraviețuiește exec()')} id="c7-survives" checked={!!checked['c7-survives']} onCheck={() => toggleCheck('c7-survives')}>
                <Box type="theorem">
                  <p className="font-bold">{t('Preserved after exec:', 'Păstrat după exec:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>{t('PID, PPID, priority', 'PID, PPID, prioritate')}</li>
                    <li>{t('Open file descriptors (unless FD_CLOEXEC is set)', 'Descriptorii de fișiere deschiși (dacă nu este setat FD_CLOEXEC)')}</li>
                    <li>{t('UID/GID (unless setuid/setgid bit is set on new executable)', 'UID/GID (dacă nu este setat bitul setuid/setgid pe noul executabil)')}</li>
                    <li>{t('Working directory, umask, signal masks', 'Directorul de lucru, umask, măști de semnale')}</li>
                  </ul>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('NOT preserved:', 'NU se păstrează:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>{t('Signal handlers', 'Handler-ele de semnale')}</strong> {t('are reset to defaults (the old handler code no longer exists)', 'sunt resetate la implicit (vechiul cod handler nu mai există)')}</li>
                    <li><strong>{t('Memory mappings', 'Mapările de memorie')}</strong> {t('are destroyed', 'sunt distruse')}</li>
                    <li><strong>{t('stdio buffers', 'Buffer-ele stdio')}</strong> {t('are lost! (Call ', 'se pierd! (Apelați ')} <code>fflush(NULL)</code> {t('before exec!)', 'înainte de exec!)')}</li>
                    <li>{t('FDs with ', 'Descriptorii cu ')} <strong>FD_CLOEXEC</strong> {t('(or O_CLOEXEC) are closed', '(sau O_CLOEXEC) sunt închiși')}</li>
                  </ul>
                </Box>
              </Section>

              <Section title={t('4. The fork+exec Pattern', '4. Tiparul fork+exec')} id="c7-forkexec" checked={!!checked['c7-forkexec']} onCheck={() => toggleCheck('c7-forkexec')}>
                <p>{t('The standard way to run an external command from C:', 'Metoda standard de a rula o comandă externă din C:')}</p>

                <Box type="formula">
                  <Code>{`pid_t pid = fork();
if (pid == -1) { perror("fork"); exit(1); }

if (pid == 0) {
    // CHILD: overlay with desired program
    execl("/bin/ls", "ls", "-l", dirname, NULL);
    perror("exec failed");
    exit(10);  // use distinctive code (not 0/1/2)
}

// PARENT: wait and inspect result
int st;
wait(&st);
if (WIFEXITED(st)) {
    switch (WEXITSTATUS(st)) {
        case 0:  printf("ls succeeded\\n"); break;
        case 10: printf("exec itself failed\\n"); break;
        default: printf("ls failed with %d\\n", WEXITSTATUS(st));
    }
} else {
    printf("ls killed by signal %d\\n", WTERMSIG(st));
}`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Why fork before exec?', 'De ce fork înainte de exec?')}</p>
                  <p>{t('Without fork, exec replaces YOUR program — you never get control back. fork first, then exec in the child. The parent survives and can wait for the result. This is exactly how the shell runs every command you type.', 'Fără fork, exec înlocuiește PROGRAMUL DUMNEAVOASTRĂ — nu mai recuperați controlul. Întâi fork, apoi exec în fiu. Părintele supraviețuiește și poate aștepta rezultatul. Exact astfel rulează shell-ul fiecare comandă pe care o tastați.')}</p>
                </Box>
              </Section>

              <Section title={t('5. File Descriptors & Redirection', '5. Descriptori de fișiere și redirecționare')} id="c7-redirect" checked={!!checked['c7-redirect']} onCheck={() => toggleCheck('c7-redirect')}>
                <Box type="formula">
                  <p className="font-bold">{t('dup() and dup2() — duplicate file descriptors:', 'dup() și dup2() — duplicarea descriptorilor de fișiere:')}</p>
                  <Code>{`int dup(int oldfd);            // returns new fd pointing to same file
int dup2(int oldfd, int newfd); // make newfd point where oldfd points

// Redirect stdout to a file BEFORE exec:
int fd = open("output.txt", O_WRONLY|O_CREAT|O_TRUNC, 0644);
dup2(fd, STDOUT_FILENO);  // stdout (fd 1) now goes to output.txt
close(fd);                 // close original fd (stdout still open)
execl("/bin/ls", "ls", "-l", NULL);
// ls writes to output.txt, not the terminal!`}</Code>
                </Box>

                <p className="font-bold mt-2">{t('Example — exec a script:', 'Exemplu — exec cu un script:')}</p>
                <Code>{`// Scripts work too! The kernel reads the shebang:
execl("./my_script.sh", "my_script.sh", "arg1", NULL);
// This actually runs: /bin/bash ./my_script.sh arg1
// (assuming #!/bin/bash is the first line of my_script.sh)`}</Code>

                <Box type="definition">
                  <p className="font-bold">{t('system() — convenience wrapper:', 'system() — wrapper de conveniență:')}</p>
                  <Code>{`#include <stdlib.h>
int ret = system("ls -l /home ; rm -i temp.txt");
// Equivalent to: fork + exec /bin/sh -c "command" + wait
// Simpler but less control than manual fork+exec`}</Code>
                </Box>
              </Section>

              <Section title={t('Cheat Sheet', 'Rezumat rapid')} id="c7-cheat" checked={!!checked['c7-cheat']} onCheck={() => toggleCheck('c7-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">{t('exec naming', 'Denumire exec')}</p><p>{t('l=list, v=vector, p=PATH, e=env', 'l=listă, v=vector, p=PATH, e=env')}</p><p>{t('execve = the actual syscall', 'execve = apelul de sistem real')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Key behavior', 'Comportament cheie')}</p><p>{t('Does NOT create new process', 'NU creează un proces nou')}</p><p>{t('Replaces code+data+stack', 'Înlocuiește cod+date+stivă')}</p><p>{t('Never returns on success (-1 on fail)', 'Nu returnează la succes (-1 la eșec)')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Survives exec', 'Supraviețuiește exec')}</p><p>{t('PID, PPID, open fds, UID/GID', 'PID, PPID, descriptori deschiși, UID/GID')}</p><p>{t('cwd, umask, signal mask', 'cwd, umask, mască de semnale')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Lost at exec', 'Pierdut la exec')}</p><p>{t('Signal handlers (reset to default)', 'Handler-e de semnale (resetate la implicit)')}</p><p>{t('stdio buffers (call fflush first!)', 'Buffer-e stdio (apelați fflush mai întâi!)')}</p><p>{t('FD_CLOEXEC fds, memory maps', 'Descriptori FD_CLOEXEC, mapări de memorie')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Redirection', 'Redirecționare')}</p><p>dup(fd), dup2(old, new)</p><p>{t('Set up before exec in child', 'Configurați înainte de exec în fiu')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Pattern', 'Tipar')}</p><p>{t('fork → child: setup + exec', 'fork → fiu: configurare + exec')}</p><p>{t('parent: wait + inspect status', 'părinte: wait + inspectare status')}</p><p>{t('system("cmd") = fork+exec+wait', 'system("cmd") = fork+exec+wait')}</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c7-quiz" checked={!!checked['c7-quiz']} onCheck={() => toggleCheck('c7-quiz')}>
                <Toggle question={t('1. Does exec() create a new process?', '1. exec() creează un proces nou?')} answer={t('No. exec() REPLACES the current process\'s program image. Same PID, same parent. It is not process creation — that\'s fork(). exec is process transformation.', 'Nu. exec() ÎNLOCUIEȘTE imaginea de program a procesului curent. Același PID, același părinte. Nu este crearea unui proces — aceea este treaba lui fork(). exec este transformarea procesului.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('2. What happens to code written after a successful exec() call?', '2. Ce se întâmplă cu codul scris după un apel exec() reușit?')} answer={t('It never executes. A successful exec() completely replaces the program — there is no return. Code after exec() only runs if exec FAILED (returned -1).', 'Nu se execută niciodată. Un exec() reușit înlocuiește complet programul — nu există returnare. Codul după exec() rulează doar dacă exec A EȘUAT (a returnat -1).')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('3. What do the letters l, v, p, e mean in exec function names?', '3. Ce înseamnă literele l, v, p, e din numele funcțiilor exec?')} answer={t('l = args as list (variadic), v = args as vector (array), p = search PATH for the executable, e = provide custom environment variables. So execlp = list args + PATH search.', 'l = argumente ca listă (variadic), v = argumente ca vector (tablou), p = caută în PATH executabilul, e = furnizează variabile de mediu personalizate. Deci execlp = argumente ca listă + căutare în PATH.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('4. Why must the last argument to execl() be NULL?', '4. De ce trebuie ca ultimul argument al execl() să fie NULL?')} answer={t('The variadic argument list has no inherent length information. NULL serves as the sentinel/terminator so the function knows where the argument list ends. Forgetting NULL causes undefined behavior.', 'Lista de argumente variadic nu are informații despre lungime. NULL servește ca santinelă/terminator pentru ca funcția să știe unde se termină lista de argumente. Uitarea lui NULL cauzează comportament nedefinit.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('5. What happens to stdio buffers when you call exec()?', '5. Ce se întâmplă cu buffer-ele stdio când apelați exec()?')} answer={t('They are LOST. exec replaces all user-space memory. Unflushed fprintf/printf data disappears. Always call fflush(NULL) before exec().', 'Se PIERD. exec înlocuiește toată memoria din spațiul utilizator. Datele fprintf/printf negolite dispar. Apelați întotdeauna fflush(NULL) înainte de exec().')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t("6. How does the shell implement 'ls > output.txt'?", "6. Cum implementează shell-ul 'ls > output.txt'?")} answer={t("fork() → in child: open('output.txt'), dup2(fd, STDOUT_FILENO), close(fd), then exec('ls'). The ls command writes to stdout which now points to the file. Parent waits.", "fork() → în fiu: open('output.txt'), dup2(fd, STDOUT_FILENO), close(fd), apoi exec('ls'). Comanda ls scrie în stdout care acum pointează la fișier. Părintele așteaptă.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('7. What is FD_CLOEXEC and when should you use it?', '7. Ce este FD_CLOEXEC și când ar trebui să îl folosiți?')} answer={t('A flag on a file descriptor that causes it to be automatically closed when exec() is called. Use it on fds that the new program shouldn\'t inherit (e.g., lock files, server sockets). Set via fcntl() or O_CLOEXEC flag in open().', 'Un flag pe un descriptor de fișier care îl face să fie închis automat când se apelează exec(). Utilizați-l pe descriptorii pe care noul program nu ar trebui să îi moștenească (ex: fișiere de blocare, socket-uri server). Setați prin fcntl() sau flag-ul O_CLOEXEC în open().')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('8. What is the difference between execl and execlp?', '8. Care este diferența dintre execl și execlp?')} answer={t("execl requires the full path to the executable (e.g., '/bin/ls'). execlp searches the PATH environment variable, so you can just say 'ls'. Without p, the file must be in the current directory or specified by path.", "execl necesită calea completă spre executabil (ex: '/bin/ls'). execlp caută în variabila de mediu PATH, deci puteți spune doar 'ls'. Fără p, fișierul trebuie să fie în directorul curent sau specificat prin cale.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('9. Why use exit(10) after a failed exec, not exit(1)?', '9. De ce se folosește exit(10) după un exec eșuat, nu exit(1)?')} answer={t("Commands like ls use exit codes 0, 1, 2 for their own purposes. Using a distinctive code like 10 lets the parent distinguish 'exec itself failed' from 'the command ran but returned an error code'.", "Comenzi precum ls folosesc codurile de exit 0, 1, 2 în scopuri proprii. Folosirea unui cod distinctiv ca 10 îi permite părintelui să distingă 'exec-ul în sine a eșuat' de 'comanda a rulat dar a returnat un cod de eroare'.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t("10. What does system('ls -l') do internally?", "10. Ce face system('ls -l') intern?")} answer={<span>{t('It calls ', 'Apelează ')} <code>fork()</code>{t(', then in the child: ', ', apoi în fiu: ')} <code>execl("/bin/sh", "sh", "-c", "ls -l", NULL)</code>{t(', and the parent calls ', ', iar părintele apelează ')} <code>waitpid()</code>. {t('It spawns a shell to parse and execute the command string.', 'Pornește un shell pentru a parsa și executa șirul de comandă.')}</span>} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 8 ==================== */}
            <CourseBlock title="Course 8: Memory-Mapped Files, Shared Memory & Semaphores" id="c8">
              <p className="mb-3 text-sm opacity-80">Source: OS(8) - Programare de sistem in C pentru Linux (V), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Plan:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('Memory-mapped files — concept and motivation', 'Fișiere mapate în memorie — concept și motivație')}</li>
                  <li>{t('mmap() — creating file mappings', 'mmap() — crearea mapărilor de fișiere')}</li>
                  <li>{t('munmap() — removing mappings', 'munmap() — eliminarea mapărilor')}</li>
                  <li>{t('MAP_PRIVATE vs MAP_SHARED', 'MAP_PRIVATE vs. MAP_SHARED')}</li>
                  <li>{t('msync() — flushing changes to disk', 'msync() — scrierea modificărilor pe disc')}</li>
                  <li>{t('Non-persistent mappings (anonymous & named shared memory)', 'Mapări nepersistente (anonime și memorie partajată cu nume)')}</li>
                  <li>{t('POSIX shared memory API (shm_open, ftruncate, mmap)', 'API memorie partajată POSIX (shm_open, ftruncate, mmap)')}</li>
                  <li>{t('IPC models: shared memory vs message passing', 'Modele IPC: memorie partajată vs. transmitere de mesaje')}</li>
                  <li>{t('Cooperation patterns (Producer-Consumer, Supervisor-Workers, etc.)', 'Șabloane de cooperare (Producător-Consumator, Supervizor-Lucrători, etc.)')}</li>
                  <li>{t('POSIX semaphores (named and unnamed)', 'Semafoare POSIX (cu nume și fără nume)')}</li>
                </ol>
              </Box>

              <Section title={t('1. Memory-Mapped Files Concept', '1. Conceptul fișierelor mapate în memorie')} id="c8-concept" checked={!!checked['c8-concept']} onCheck={() => toggleCheck('c8-concept')}>
                <p>{t('A ', 'Un ')}<strong>{t('memory-mapped file', 'fișier mapat în memorie')}</strong>{t(" creates a direct byte-to-byte correspondence between a region of a process's virtual address space and a portion of a file on disk.", ' creează o corespondență directă octet-la-octet între o regiune din spațiul virtual de adrese al unui proces și o porțiune a unui fișier de pe disc.')}</p>

                <svg viewBox="0 0 440 160" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="20" y="10" width="160" height="80" rx="6" fill="#3b82f6" opacity="0.1" stroke="#3b82f6"/>
                  <text x="100" y="28" textAnchor="middle" fill="#3b82f6" fontWeight="bold">{t('Process virtual memory', 'Memorie virtuală proces')}</text>
                  <rect x="40" y="40" width="120" height="30" rx="4" fill="#f59e0b" opacity="0.2" stroke="#f59e0b"/>
                  <text x="100" y="60" textAnchor="middle" fill="#f59e0b" fontSize="9">{t('mapped region', 'regiune mapată')}</text>
                  <rect x="260" y="30" width="160" height="40" rx="6" fill="#10b981" opacity="0.1" stroke="#10b981"/>
                  <text x="340" y="48" textAnchor="middle" fill="#10b981" fontSize="9">{t('Open file (fd)', 'Fișier deschis (fd)')}</text>
                  <rect x="280" y="52" width="50" height="14" rx="2" fill="#f59e0b" opacity="0.3" stroke="#f59e0b"/>
                  <text x="305" y="63" textAnchor="middle" fill="#f59e0b" fontSize="7">offset</text>
                  <rect x="332" y="52" width="70" height="14" rx="2" fill="#f59e0b" opacity="0.3" stroke="#f59e0b"/>
                  <text x="367" y="63" textAnchor="middle" fill="#f59e0b" fontSize="7">length</text>
                  <line x1="160" y1="55" x2="260" y2="55" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arr)"/>
                  <text x="210" y="50" textAnchor="middle" fill="#f59e0b" fontSize="8">{t('1:1 mapping', 'mapare 1:1')}</text>
                  <text x="220" y="100" textAnchor="middle" fill="currentColor" fontSize="9">{t('Read/write memory = read/write file', 'Citire/scriere memorie = citire/scriere fișier')}</text>
                  <text x="220" y="115" textAnchor="middle" fill="currentColor" fontSize="9">{t('No need for read()/write() syscalls!', 'Nu sunt necesare apeluri read()/write()!')}</text>
                  <text x="220" y="140" textAnchor="middle" fill="#10b981" fontSize="9">{t('Backing store = the file itself (not swap)', 'Stocare de fundal = fișierul însuși (nu swap)')}</text>
                </svg>

                <Box type="theorem">
                  <p className="font-bold">{t('Why use mmap?', 'De ce să folosiți mmap?')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>{t('Access file contents ', 'Accesați conținutul fișierelor ')}<strong>{t('directly in memory', 'direct în memorie')}</strong>{t(' (pointer arithmetic, no read/write calls)', ' (aritmetică de pointeri, fără apeluri read/write)')}</li>
                    <li>{t('Multiple processes can mmap the same file → ', 'Mai multe procese pot mapa același fișier → ')}<strong>{t('shared memory IPC', 'IPC prin memorie partajată')}</strong></li>
                    <li>{t('Kernel handles page faults to load data on demand (efficient for large files)', 'Nucleul gestionează erorile de pagină pentru a încărca datele la cerere (eficient pentru fișiere mari)')}</li>
                  </ul>
                </Box>
              </Section>

              <Section title={t('2. mmap() and munmap()', '2. mmap() și munmap()')} id="c8-mmap" checked={!!checked['c8-mmap']} onCheck={() => toggleCheck('c8-mmap')}>
                <Box type="formula">
                  <p className="font-bold">{t('mmap — create a mapping:', 'mmap — crearea unei mapări:')}</p>
                  <Code>{`#include <sys/mman.h>
void* mmap(void* addr, size_t length, int prot,
           int flags, int fd, off_t offset);

// addr: NULL (let kernel choose) or hint address
// length: size of mapping (rounded up to page boundary)
// prot: PROT_READ | PROT_WRITE | PROT_EXEC | PROT_NONE
// flags: MAP_SHARED or MAP_PRIVATE [| MAP_ANONYMOUS ...]
// fd: file descriptor (or -1 for anonymous)
// offset: must be page-aligned (multiple of 4096)
// Returns: pointer to mapped region, or MAP_FAILED (-1)`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('munmap — remove a mapping:', 'munmap — eliminarea unei mapări:')}</p>
                  <Code>{`int munmap(void* addr, size_t length);
// addr = value returned by mmap (page-aligned)
// Returns 0 on success, -1 on error
// WARNING: does NOT auto-flush dirty pages!`}</Code>
                </Box>

                <p className="font-bold mt-2">{t('Example — read a file via mmap:', 'Exemplu — citirea unui fișier prin mmap:')}</p>
                <Code>{`int fd = open("data.txt", O_RDONLY);
struct stat sb;
fstat(fd, &sb);  // get file size

char* map = mmap(NULL, sb.st_size, PROT_READ,
                 MAP_PRIVATE, fd, 0);
close(fd);  // fd can be closed immediately after mmap!

// Access file contents directly:
for (int i = 0; i < sb.st_size; i++)
    putchar(map[i]);

munmap(map, sb.st_size);`}</Code>
              </Section>

              <Section title={t('3. MAP_PRIVATE vs MAP_SHARED', '3. MAP_PRIVATE vs. MAP_SHARED')} id="c8-flags" checked={!!checked['c8-flags']} onCheck={() => toggleCheck('c8-flags')}>
                <Box type="theorem">
                  <p className="font-bold">{t('The critical distinction:', 'Distincția critică:')}</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="text-left p-1">{t('Feature', 'Caracteristică')}</th><th className="text-left p-1">MAP_PRIVATE</th><th className="text-left p-1">MAP_SHARED</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">{t('Writes visible to other processes?', 'Scrierile sunt vizibile altor procese?')}</td><td className="p-1 text-red-400">{t('No', 'Nu')}</td><td className="p-1 text-green-400">{t('Yes', 'Da')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">{t('Writes propagated to disk file?', 'Scrierile sunt propagate la fișierul de pe disc?')}</td><td className="p-1 text-red-400">{t('No (copy-on-write)', 'Nu (copy-on-write)')}</td><td className="p-1 text-green-400">{t('Yes (eventually)', 'Da (eventual)')}</td></tr>
                      <tr><td className="p-1">{t('Use case', 'Caz de utilizare')}</td><td className="p-1">{t('Read-only views, private scratch', 'Vizualizări read-only, spațiu privat')}</td><td className="p-1">{t('IPC, persistent modification', 'IPC, modificare persistentă')}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('msync — force flush to disk:', 'msync — forțarea scrierii pe disc:')}</p>
                  <Code>{`int msync(void* addr, size_t length, int flags);
// flags: MS_SYNC (blocking) or MS_ASYNC (non-blocking)
//        optionally | MS_INVALIDATE

// ALWAYS msync before munmap for shared mappings!
msync(map, length, MS_SYNC);
munmap(map, length);`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Critical trap:', 'Capcană critică:')}</p>
                  <p><code>munmap()</code> {t('does ', 'NU ')}<strong>{t('NOT', '')}</strong>{t(' flush dirty pages. If you munmap a shared mapping without calling msync first, your last writes may be lost. The kernel flushes eventually, but not guaranteed before munmap returns.', ' golește paginile murdare. Dacă faceți munmap la o mapare partajată fără a apela mai întâi msync, ultimele scrieri pot fi pierdute. Nucleul golește eventual, dar nu este garantat înainte ca munmap să returneze.')}</p>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Page boundary trap:', 'Capcana limitei de pagină:')}</p>
                  <p>{t('If ', 'Dacă ')} <code>length</code> {t('is not a multiple of page size (4096), the remaining bytes in the last page are zero-filled. Writes to these "extra" bytes succeed but are ', 'nu este un multiplu al dimensiunii paginii (4096), octeții rămași din ultima pagină sunt umpluți cu zero. Scrierile la acești octeți "extra" reușesc dar ')}<strong>{t('NOT', 'NU')}</strong>{t(' propagated to the disk file.', ' sunt propagate la fișierul de pe disc.')}</p>
                </Box>
              </Section>

              <Section title={t('4. Non-Persistent Mappings & POSIX Shared Memory', '4. Mapări nepersistente și memorie partajată POSIX')} id="c8-shm" checked={!!checked['c8-shm']} onCheck={() => toggleCheck('c8-shm')}>
                <Box type="definition">
                  <p className="font-bold">{t('Two types of mappings:', 'Două tipuri de mapări:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>{t('File-backed (persistent)', 'Cu suport de fișier (persistentă)')}</strong>: {t('mmap of a regular file. Data survives in the file.', 'mmap al unui fișier obișnuit. Datele supraviețuiesc în fișier.')}</li>
                    <li><strong>{t('Non-persistent', 'Nepersistentă')}</strong>: {t('no disk file. Data exists only in RAM, lost when all processes unmap.', 'fără fișier pe disc. Datele există doar în RAM, se pierd când toate procesele fac unmap.')}</li>
                  </ul>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Anonymous mapping (related processes via fork):', 'Mapare anonimă (procese înrudite prin fork):')}</p>
                  <Code>{`// MAP_ANONYMOUS + MAP_SHARED = shared memory between parent & child
void* shm = mmap(NULL, 4096, PROT_READ|PROT_WRITE,
                 MAP_SHARED|MAP_ANONYMOUS, -1, 0);
// fd = -1 (no file), inherited by child after fork
pid_t pid = fork();
if (pid == 0) {
    strcpy(shm, "Hello from child!");  // child writes
    exit(0);
}
wait(NULL);
printf("Parent reads: %s\\n", (char*)shm);  // sees child's data!`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Named shared memory (unrelated processes):', 'Memorie partajată cu nume (procese neînrudite):')}</p>
                  <Code>{`// Producer:
int fd = shm_open("/myshm", O_CREAT|O_RDWR, 0666);
ftruncate(fd, 4096);       // set size (new objects have size 0!)
void* p = mmap(NULL, 4096, PROT_READ|PROT_WRITE,
               MAP_SHARED, fd, 0);
close(fd);
strcpy(p, "data from producer");
munmap(p, 4096);

// Consumer (separate program):
int fd = shm_open("/myshm", O_RDONLY, 0);
void* p = mmap(NULL, 4096, PROT_READ, MAP_SHARED, fd, 0);
close(fd);
printf("Got: %s\\n", (char*)p);
munmap(p, 4096);
shm_unlink("/myshm");  // cleanup

// Compile with: gcc prog.c -lrt`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('POSIX shared memory objects:', 'Obiecte de memorie partajată POSIX:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>{t('Created with ', 'Create cu ')} <code>shm_open()</code>{t(', visible under ', ', vizibile în ')} <code>/dev/shm/</code></li>
                    <li><strong>{t('Kernel persistence', 'Persistență la nivel de nucleu')}</strong>{t(': survives until reboot or ', ': supraviețuiesc până la repornire sau ')} <code>shm_unlink()</code></li>
                    <li>{t('Must set size with ', 'Trebuie să setați dimensiunea cu ')} <code>ftruncate()</code> {t('after creation (default size is 0)', 'după creare (dimensiunea implicită este 0)')}</li>
                  </ul>
                </Box>
              </Section>

              <Section title={t('5. IPC Models & Cooperation Patterns', '5. Modele IPC și șabloane de cooperare')} id="c8-ipc" checked={!!checked['c8-ipc']} onCheck={() => toggleCheck('c8-ipc')}>
                <svg viewBox="0 0 460 130" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="10" width="200" height="50" rx="6" fill="#3b82f6" opacity="0.1" stroke="#3b82f6"/>
                  <text x="110" y="28" textAnchor="middle" fill="#3b82f6" fontWeight="bold">{t('Shared Memory Model', 'Modelul memoriei partajate')}</text>
                  <text x="110" y="43" textAnchor="middle" fill="currentColor" fontSize="9">mmap, shm_open, anonymous maps</text>
                  <text x="110" y="53" textAnchor="middle" fill="currentColor" fontSize="8">{t('Needs synchronization (semaphores)', 'Necesită sincronizare (semafoare)')}</text>
                  <rect x="250" y="10" width="200" height="50" rx="6" fill="#10b981" opacity="0.1" stroke="#10b981"/>
                  <text x="350" y="28" textAnchor="middle" fill="#10b981" fontWeight="bold">{t('Message Passing Model', 'Modelul transmiterii de mesaje')}</text>
                  <text x="350" y="43" textAnchor="middle" fill="currentColor" fontSize="9">pipes, fifos, message queues, sockets</text>
                  <text x="350" y="53" textAnchor="middle" fill="currentColor" fontSize="8">{t('Implicit synchronization (blocking I/O)', 'Sincronizare implicită (I/O blocant)')}</text>
                  <text x="110" y="80" fill="currentColor" fontSize="9">{t('Patterns: Producer-Consumer,', 'Șabloane: Producător-Consumator,')}</text>
                  <text x="110" y="93" fill="currentColor" fontSize="9">{t('Readers-Writers (CREW),', 'Cititori-Scriitori (CREW),')}</text>
                  <text x="110" y="106" fill="currentColor" fontSize="9">{t('Critical Section, Supervisor-Workers', 'Secțiune critică, Supervizor-Lucrători')}</text>
                </svg>

                <Box type="warning">
                  <p className="font-bold">{t('Data race with shared memory:', 'Data race cu memorie partajată:')}</p>
                  <p>{t('Shared memory has NO built-in synchronization. If producer writes while consumer reads, the consumer may see partially-written (corrupted) data. Use ', 'Memoria partajată NU are sincronizare built-in. Dacă producătorul scrie în timp ce consumatorul citește, consumatorul poate vedea date parțial scrise (corupte). Utilizați ')}<strong>{t('semaphores', 'semafoare')}</strong>{t(' to coordinate access.', ' pentru a coordona accesul.')}</p>
                </Box>
              </Section>

              <Section title={t('6. POSIX Semaphores', '6. Semafoare POSIX')} id="c8-sem" checked={!!checked['c8-sem']} onCheck={() => toggleCheck('c8-sem')}>
                <Box type="definition">
                  <p>{t('A ', 'Un ')}<strong>{t('semaphore', 'semafor')}</strong>{t(' is a non-negative integer counter. Two atomic operations: ', ' este un contor întreg non-negativ. Două operații atomice: ')} <code>sem_wait</code> {t('(decrement, blocks if 0) and ', '(decrementare, blochează dacă 0) și ')} <code>sem_post</code> {t('(increment, never blocks).', '(incrementare, nu blochează niciodată).')}</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Named semaphores (any processes):', 'Semafoare cu nume (orice procese):')}</p>
                  <Code>{`#include <semaphore.h>
sem_t* s = sem_open("/mysem", O_CREAT, 0666, 1); // initial value 1
sem_wait(s);   // P operation (decrement, block if 0)
// ... critical section ...
sem_post(s);   // V operation (increment)
sem_close(s);
sem_unlink("/mysem");  // cleanup

// Compile with: gcc prog.c -lpthread`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Unnamed semaphores (related processes, in shared memory):', 'Semafoare fără nume (procese înrudite, în memorie partajată):')}</p>
                  <Code>{`// Place semaphore IN shared memory region:
sem_t* sem = (sem_t*) shm_ptr;
sem_init(sem, 1, 1);  // 1=shared between processes, initial=1
// ... use sem_wait/sem_post ...
sem_destroy(sem);`}</Code>
                </Box>

                <p className="font-bold mt-2">{t('Example — mutex with named semaphore:', 'Exemplu — mutex cu semafor cu nume:')}</p>
                <Code>{`sem_t* mutex = sem_open("/mutex", O_CREAT, 0666, 1);
pid_t pid = fork();
// Both parent and child:
for (int i = 0; i < 5; i++) {
    sem_wait(mutex);
    // Critical section: write to shared file/memory
    printf("PID %d in critical section\\n", getpid());
    sleep(1);
    sem_post(mutex);
}
sem_close(mutex);
if (pid > 0) { wait(NULL); sem_unlink("/mutex"); }`}</Code>
              </Section>

              <Section title={t('Cheat Sheet', 'Rezumat rapid')} id="c8-cheat" checked={!!checked['c8-cheat']} onCheck={() => toggleCheck('c8-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">mmap</p><p>mmap(NULL, len, prot, flags, fd, off)</p><p>munmap(addr, len)</p><p>msync(addr, len, MS_SYNC)</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Flags', 'Flag-uri')}</p><p>MAP_SHARED vs MAP_PRIVATE</p><p>MAP_ANONYMOUS ({t('no file', 'fără fișier')})</p><p>PROT_READ | PROT_WRITE</p></Box>
                  <Box type="formula"><p className="font-bold">POSIX shm</p><p>shm_open, ftruncate, mmap</p><p>shm_unlink ({t('cleanup', 'curățenie')})</p><p>{t('Objects in /dev/shm/', 'Obiecte în /dev/shm/')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Semaphores', 'Semafoare')}</p><p>sem_open/sem_close/sem_unlink ({t('named', 'cu nume')})</p><p>sem_init/sem_destroy ({t('unnamed', 'fără nume')})</p><p>sem_wait (P), sem_post (V)</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c8-quiz" checked={!!checked['c8-quiz']} onCheck={() => toggleCheck('c8-quiz')}>
                <Toggle question={t('1. What is the fundamental advantage of mmap over read/write?', '1. Care este avantajul fundamental al mmap față de read/write?')} answer={t('With mmap, file contents are accessed directly in memory via pointer operations — no system calls needed for each read/write. The kernel handles loading pages on demand via page faults.', 'Cu mmap, conținutul fișierului este accesat direct în memorie prin operații cu pointeri — nu sunt necesare apeluri de sistem pentru fiecare read/write. Nucleul gestionează încărcarea paginilor la cerere prin erori de pagină.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('2. Can you close the fd immediately after mmap?', '2. Puteți închide descriptorul imediat după mmap?')} answer={t("Yes. The mapping remains valid even after closing the file descriptor. The kernel maintains its own reference to the file's inode.", "Da. Maparea rămâne validă chiar și după închiderea descriptorului. Nucleul menține propria referință la inode-ul fișierului.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('3. What happens if you write to a MAP_PRIVATE mapping?', '3. Ce se întâmplă dacă scrieți într-o mapare MAP_PRIVATE?')} answer={t('The write uses copy-on-write: the kernel creates a private copy of the affected page. The change is NOT visible to other processes and NOT propagated to the disk file. It goes to swap if evicted.', 'Scrierea folosește copy-on-write: nucleul creează o copie privată a paginii afectate. Modificarea NU este vizibilă altor procese și NU este propagată la fișierul de pe disc. Merge în swap dacă este evacuată.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('4. Why must you call msync before munmap on a shared mapping?', '4. De ce trebuie să apelați msync înainte de munmap pe o mapare partajată?')} answer={t('munmap does NOT flush dirty pages. Without msync, the last writes in memory may not be saved to the disk file. The kernel MAY flush them eventually, but it\'s not guaranteed before munmap returns.', 'munmap NU golește paginile murdare. Fără msync, ultimele scrieri din memorie pot să nu fie salvate pe disc. Nucleul POATE să le golească eventual, dar nu este garantat înainte ca munmap să returneze.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('5. What is the offset parameter requirement for mmap?', '5. Care este cerința pentru parametrul offset la mmap?')} answer={t('It must be a multiple of the system page size (typically 4096 bytes). If you need to map from a non-aligned offset, round down and adjust your pointer arithmetic.', 'Trebuie să fie un multiplu al dimensiunii paginii de sistem (de obicei 4096 octeți). Dacă trebuie să mapați de la un offset nealiniat, rotunjiți în jos și ajustați aritmetica pointerilor.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('6. How do you create shared memory between unrelated processes?', '6. Cum creați memorie partajată între procese neînrudite?')} answer={t('Use shm_open() to create a named shared memory object, ftruncate() to set its size, then mmap() with MAP_SHARED. The other process uses shm_open() with the same name. Clean up with shm_unlink().', 'Utilizați shm_open() pentru a crea un obiect de memorie partajată cu nume, ftruncate() pentru a seta dimensiunea, apoi mmap() cu MAP_SHARED. Celălalt proces folosește shm_open() cu același nume. Curățați cu shm_unlink().')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('7. What is the difference between anonymous shared and anonymous private mappings?', '7. Care este diferența dintre mapările anonime partajate și cele anonime private?')} answer={t('MAP_SHARED|MAP_ANONYMOUS: shared between parent and child (after fork). Used for IPC. MAP_PRIVATE|MAP_ANONYMOUS: private to the process, used for memory allocation (this is what malloc uses internally for large allocations).', 'MAP_SHARED|MAP_ANONYMOUS: partajată între părinte și fiu (după fork). Utilizată pentru IPC. MAP_PRIVATE|MAP_ANONYMOUS: privată procesului, utilizată pentru alocarea memoriei (aceasta este metoda internă folosită de malloc pentru alocări mari).')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('8. Why do POSIX shared memory objects need ftruncate after creation?', '8. De ce obiectele de memorie partajată POSIX necesită ftruncate după creare?')} answer={t('A newly created shared memory object has size 0. You MUST call ftruncate() to set its size before mapping it. Mapping a zero-size object would be useless (or cause errors).', 'Un obiect de memorie partajată nou creat are dimensiunea 0. TREBUIE să apelați ftruncate() pentru a seta dimensiunea înainte de mapare. Maparea unui obiect de dimensiune zero ar fi inutilă (sau ar cauza erori).')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('9. What does sem_wait do when the semaphore value is 0?', '9. Ce face sem_wait când valoarea semaforului este 0?')} answer={t('It BLOCKS (the calling process/thread sleeps) until another process/thread calls sem_post to increment the value above 0. This is the fundamental blocking mechanism for synchronization.', 'BLOCHEAZĂ (procesul/firul apelant doarme) până când un alt proces/fir apelează sem_post pentru a incrementa valoarea peste 0. Acesta este mecanismul fundamental de blocare pentru sincronizare.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('10. Where are named semaphores and shared memory objects stored in Linux?', '10. Unde sunt stocate semafoarele cu nume și obiectele de memorie partajată în Linux?')} answer={t('Both are stored in /dev/shm/ (a tmpfs virtual filesystem in RAM). Named semaphores appear as sem.name files. They persist until the system reboots or are explicitly unlinked.', 'Ambele sunt stocate în /dev/shm/ (un sistem de fișiere virtual tmpfs în RAM). Semafoarele cu nume apar ca fișiere sem.name. Persistă până la repornirea sistemului sau sunt șterse explicit.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 9 ==================== */}
            <CourseBlock title={t('Course 9: IPC via Pipes (Anonymous & Named)', 'Cursul 9: Comunicația inter-procese prin canale (anonime și cu nume)')} id="c9">
              <p className="mb-3 text-sm opacity-80">Source: OS(9) - Programare de sistem in C pentru Linux (VI), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Plan:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('Pipes as FIFO communication channels', 'Canale ca structuri de comunicație FIFO')}</li>
                  <li>{t('Anonymous pipes: pipe() system call', 'Canale anonime: apelul de sistem pipe()')}</li>
                  <li>{t('Usage pattern: pipe → fork → close unused ends', 'Tiparul de utilizare: pipe → fork → închiderea capetelor neutilizate')}</li>
                  <li>{t('Named pipes (fifos): mkfifo()', 'Canale cu nume (fifo): mkfifo()')}</li>
                  <li>{t('Blocking behavior of open, read, write on pipes', 'Comportamentul blocant al operațiilor open, read, write pe canale')}</li>
                  <li>{t('Non-persistent data in fifos', 'Date nepersistente în fifouri')}</li>
                  <li>{t('Non-blocking mode (O_NONBLOCK)', 'Modul neblocant (O_NONBLOCK)')}</li>
                  <li>{t('Communication patterns: 1-to-1, 1-to-N, N-to-1, N-to-N', 'Șabloane de comunicație: 1-la-1, 1-la-N, N-la-1, N-la-N')}</li>
                  <li>{t('Applications: semaphores via fifos, client/server architecture', 'Aplicații: semafoare via fifouri, arhitectură client/server')}</li>
                </ol>
              </Box>

              <Section title={t('1. Pipe Fundamentals', '1. Noțiuni fundamentale despre canale')} id="c9-fund" checked={!!checked['c9-fund']} onCheck={() => toggleCheck('c9-fund')}>
                <Box type="definition">
                  <p>{t('A ', 'Un ')}<strong>{t('pipe', 'canal')}</strong>{t(' is a unidirectional FIFO buffer managed by the kernel. Data written at one end is read (and consumed) at the other. Capacity is limited (typically 64KB on Linux).', ' este un buffer FIFO unidirecțional gestionat de nucleu. Datele scrise la un capăt sunt citite (și consumate) la celălalt. Capacitatea este limitată (în mod obișnuit 64KB pe Linux).')}</p>
                </Box>

                <svg viewBox="0 0 400 100" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="30" y="25" width="80" height="35" rx="6" fill="#3b82f6" opacity="0.15" stroke="#3b82f6"/>
                  <text x="70" y="47" textAnchor="middle" fill="#3b82f6">{t('Writer', 'Scriitor')}</text>
                  <rect x="290" y="25" width="80" height="35" rx="6" fill="#10b981" opacity="0.15" stroke="#10b981"/>
                  <text x="330" y="47" textAnchor="middle" fill="#10b981">{t('Reader', 'Cititor')}</text>
                  <rect x="140" y="30" width="120" height="25" rx="12" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="1.5"/>
                  <text x="200" y="47" textAnchor="middle" fill="#f59e0b" fontSize="9">{t('FIFO buffer', 'buffer FIFO')}</text>
                  <line x1="110" y1="42" x2="140" y2="42" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <line x1="260" y1="42" x2="290" y2="42" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <text x="125" y="37" fill="currentColor" fontSize="8">write</text>
                  <text x="275" y="37" fill="currentColor" fontSize="8">read</text>
                  <text x="200" y="80" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.6">{t('Unidirectional, FIFO order, read = consume', 'Unidirecțional, ordine FIFO, citirea = consumare')}</text>
                </svg>

                <Box type="theorem">
                  <p className="font-bold">{t('Anonymous vs named pipes:', 'Canale anonime vs. cu nume:')}</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="p-1">{t('Feature', 'Caracteristică')}</th><th className="p-1">{t('Anonymous (pipe)', 'Anonim (pipe)')}</th><th className="p-1">{t('Named (fifo)', 'Cu nume (fifo)')}</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">{t('Creation', 'Creare')}</td><td className="p-1 font-mono">pipe(pfd)</td><td className="p-1 font-mono">mkfifo(path, mode)</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">{t('Who can use', 'Cine poate folosi')}</td><td className="p-1">{t('Related processes (fork/exec)', 'Procese înrudite (fork/exec)')}</td><td className="p-1">{t('Any process (knows the name)', 'Orice proces (cunoaște numele)')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">{t('Filesystem entry', 'Intrare în sistemul de fișiere')}</td><td className="p-1">{t('None', 'Nu')}</td><td className="p-1">{t('Yes (special file)', 'Da (fișier special)')}</td></tr>
                      <tr><td className="p-1">{t('Reopenable', 'Redeschidere posibilă')}</td><td className="p-1 text-red-400">{t('No', 'Nu')}</td><td className="p-1 text-green-400">{t('Yes', 'Da')}</td></tr>
                    </tbody>
                  </table>
                </Box>
              </Section>

              <Section title={t('2. Anonymous Pipes', '2. Canale anonime')} id="c9-anon" checked={!!checked['c9-anon']} onCheck={() => toggleCheck('c9-anon')}>
                <Box type="formula">
                  <p className="font-bold">{t('pipe() — create anonymous pipe:', 'pipe() — crearea unui canal anonim:')}</p>
                  <Code>{`int pfd[2];
pipe(pfd);
// pfd[0] = read end
// pfd[1] = write end
// Both ends open in calling process`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Standard pattern: pipe → fork → close unused ends:', 'Tiparul standard: pipe → fork → închiderea capetelor neutilizate:')}</p>
                  <Code>{`int pfd[2];
pipe(pfd);           // 1. Create pipe BEFORE fork
pid_t pid = fork();  // 2. Fork: child inherits both fds

if (pid == 0) {
    // CHILD = reader
    close(pfd[1]);   // 3. Close WRITE end (child only reads)
    char buf[256];
    int n = read(pfd[0], buf, sizeof(buf));
    buf[n] = '\\0';
    printf("Child received: %s\\n", buf);
    close(pfd[0]);
    exit(0);
}
// PARENT = writer
close(pfd[0]);       // 3. Close READ end (parent only writes)
write(pfd[1], "Hello child!", 12);
close(pfd[1]);       // 4. Close write end → child reads EOF
wait(NULL);`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Why close unused ends?', 'De ce se închid capetele neutilizate?')}</p>
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>{t('Read EOF', 'Citire EOF')}</strong>{t(': The reader only gets EOF (read returns 0) when ALL write ends are closed. If the reader still has the write end open, it blocks forever.', ': Cititorul primește EOF (read returnează 0) doar când TOATE capetele de scriere sunt închise. Dacă cititorul are în continuare capătul de scriere deschis, se blochează la infinit.')}</li>
                    <li><strong>SIGPIPE</strong>{t(': A writer to a pipe with no readers gets killed by SIGPIPE. If the writer still has the read end open, the kernel won\'t send SIGPIPE.', ': Un scriitor pe un canal fără cititori este terminat de SIGPIPE. Dacă scriitorul are în continuare capătul de citire deschis, nucleul nu va trimite SIGPIPE.')}</li>
                  </ol>
                </Box>
              </Section>

              <Section title={t('3. Named Pipes (FIFOs)', '3. Canale cu nume (FIFO)')} id="c9-fifo" checked={!!checked['c9-fifo']} onCheck={() => toggleCheck('c9-fifo')}>
                <Box type="formula">
                  <p className="font-bold">{t('mkfifo — create a named pipe:', 'mkfifo — crearea unui canal cu nume:')}</p>
                  <Code>{`int mkfifo(const char* path, mode_t mode);
// Creates a special file in the filesystem
// Does NOT open it (unlike pipe() which opens both ends)`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Usage pattern:', 'Tiparul de utilizare:')}</p>
                  <Code>{`// Writer program:
mkfifo("/tmp/myfifo", 0666);
int fd = open("/tmp/myfifo", O_WRONLY); // BLOCKS until reader opens!
write(fd, "data", 4);
close(fd);

// Reader program (separate process):
int fd = open("/tmp/myfifo", O_RDONLY); // BLOCKS until writer opens!
char buf[100];
int n = read(fd, buf, 100);
close(fd);`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Blocking open:', 'Deschidere blocantă:')}</p>
                  <p>{t('Opening a fifo for read-only ', 'Deschiderea unui fifo în mod read-only ')}<strong>{t('blocks', 'blochează')}</strong>{t(' until another process opens it for writing (and vice versa). They must "rendezvous". Exception: opening with O_RDWR never blocks (both ends in one process), or use O_NONBLOCK.', ' până când un alt proces îl deschide pentru scriere (și invers). Ele trebuie să „se întâlnească". Excepție: deschiderea cu O_RDWR nu blochează niciodată (ambele capete într-un singur proces) sau se utilizează O_NONBLOCK.')}</p>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Data persistence in fifos:', 'Persistența datelor în fifouri:')}</p>
                  <p>{t('Data in a fifo is stored ', 'Datele dintr-un fifo sunt stocate ')}<strong>{t('in RAM only', 'doar în RAM')}</strong>{t(' (not on disk), and only while at least one process has the fifo open. When all processes close both ends, unread data is ', ' (nu pe disc), și doar atât timp cât cel puțin un proces are fifo-ul deschis. Când toate procesele închid ambele capete, datele necitite sunt ')}<strong>{t('lost', 'pierdute')}</strong>{t('. The fifo file itself persists in the filesystem, but its data does not.', '. Fișierul fifo în sine persistă în sistemul de fișiere, dar datele sale nu.')}</p>
                </Box>
              </Section>

              <Section title={t('4. Blocking Behavior', '4. Comportamentul blocant')} id="c9-block" checked={!!checked['c9-block']} onCheck={() => toggleCheck('c9-block')}>
                <Box type="formula">
                  <p className="font-bold">{t('Default (blocking) behavior summary:', 'Rezumatul comportamentului implicit (blocant):')}</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="p-1">{t('Operation', 'Operație')}</th><th className="p-1">{t('Condition', 'Condiție')}</th><th className="p-1">{t('Behavior', 'Comportament')}</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">read</td><td className="p-1">{t('Pipe empty', 'Canal gol')}</td><td className="p-1">{t('Blocks until data or EOF', 'Blochează până la date sau EOF')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">read</td><td className="p-1">{t('All writers closed', 'Toți scriitorii au închis')}</td><td className="p-1">{t('Returns 0 (EOF)', 'Returnează 0 (EOF)')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">write</td><td className="p-1">{t('Pipe full', 'Canal plin')}</td><td className="p-1">{t('Blocks until space', 'Blochează până la spațiu disponibil')}</td></tr>
                      <tr><td className="p-1">write</td><td className="p-1">{t('All readers closed', 'Toți cititorii au închis')}</td><td className="p-1"><strong>SIGPIPE</strong>{t(' → process killed!', ' → procesul este terminat!')}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('Non-blocking mode:', 'Modul neblocant:')}</p>
                  <Code>{`// At open time:
int fd = open("/tmp/fifo", O_RDONLY | O_NONBLOCK);

// Or after opening:
fcntl(fd, F_SETFL, O_NONBLOCK);

// With O_NONBLOCK:
// - read on empty pipe returns -1 (errno=EAGAIN)
// - write on full pipe returns -1 (errno=EAGAIN)
// - open of fifo returns immediately (no rendezvous needed)`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Buffer-ized I/O trap:', 'Capcana I/O bufferizat:')}</p>
                  <p>{t('Using ', 'Utilizarea ')}<code>fprintf/fwrite</code>{t(' on pipes: data sits in the user-space buffer until flushed! A reader blocks waiting for data that\'s already "written" but stuck in the writer\'s buffer. Always ', ' pe canale: datele rămân în buffer-ul user-space până la golire! Un cititor se blochează așteptând date care au fost deja „scrise" dar blocate în buffer-ul scriitorului. Întotdeauna ')}<code>fflush()</code>{t(' after writing to a pipe with stdio functions.', ' după scrierea pe un canal cu funcții stdio.')}</p>
                </Box>
              </Section>

              <Section title={t('5. Communication Patterns', '5. Șabloane de comunicație')} id="c9-patterns" checked={!!checked['c9-patterns']} onCheck={() => toggleCheck('c9-patterns')}>
                <Box type="definition">
                  <p className="font-bold">{t('Four patterns by writer/reader count:', 'Patru șabloane după numărul de scriitori/cititori:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>{t('1-to-1', '1-la-1')}</strong>{t(': simplest, no synchronization issues', ': cel mai simplu, fără probleme de sincronizare')}</li>
                    <li><strong>{t('1-to-N', '1-la-N')}</strong>{t(': one writer, multiple readers. Issues: message length (variable-length needs header), message destination (which reader gets which message?)', ': un scriitor, mai mulți cititori. Probleme: lungimea mesajului (lungimea variabilă necesită antet), destinația mesajului (care cititor primește ce mesaj?)')}</li>
                    <li><strong>{t('N-to-1', 'N-la-1')}</strong>{t(': multiple writers, one reader. Issues: message integrity (writes ≤ PIPE_BUF bytes are atomic), sender identification (add header)', ': mai mulți scriitori, un cititor. Probleme: integritatea mesajului (scrierile ≤ PIPE_BUF octeți sunt atomice), identificarea expeditorului (adăugare antet)')}</li>
                    <li><strong>{t('N-to-N', 'N-la-N')}</strong>{t(': combines all issues above', ': combină toate problemele de mai sus')}</li>
                  </ul>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('Atomic write guarantee (POSIX):', 'Garanția scrierii atomice (POSIX):')}</p>
                  <p>{t('A write of ', 'O scriere de ')}<strong>{t('≤ PIPE_BUF bytes', '≤ PIPE_BUF octeți')}</strong>{t(' (at least 512, typically 4096 on Linux) to a pipe is ', ' (cel puțin 512, în mod obișnuit 4096 pe Linux) pe un canal este ')}<strong>{t('atomic', 'atomică')}</strong>{t(' — it will not be interleaved with writes from other processes. Writes > PIPE_BUF may be split and interleaved.', ' — nu va fi intercalată cu scrierile altor procese. Scrierile > PIPE_BUF pot fi divizate și intercalate.')}</p>
                </Box>

                <p className="font-bold mt-2">{t('Tip for N-to-1 with variable-length messages:', 'Sfat pentru N-la-1 cu mesaje de lungime variabilă:')}</p>
                <Code>{`// Use a fixed-size header:
struct message {
    int sender_pid;
    int payload_length;
    // followed by payload_length bytes of actual data
};
// Write header+payload in one write() call to ensure atomicity
// (if total size <= PIPE_BUF)`}</Code>
              </Section>

              <Section title={t('6. Applications', '6. Aplicații')} id="c9-apps" checked={!!checked['c9-apps']} onCheck={() => toggleCheck('c9-apps')}>
                <Box type="definition">
                  <p className="font-bold">{t('Semaphore via fifo:', 'Semafor prin fifo:')}</p>
                  <p className="text-sm">{t('Create a fifo, write 1 byte (init). ', 'Se creează un fifo, se scrie 1 octet (inițializare). ')}<code>wait()</code>{t(' = read 1 byte (blocks if empty). ', ' = citire 1 octet (blochează dacă e gol). ')}<code>signal()</code>{t(' = write 1 byte. The blocking read behavior gives us semaphore semantics for free.', ' = scriere 1 octet. Comportamentul blocant al citirii ne oferă semantica semaforului în mod gratuit.')}</p>
                </Box>

                <Box type="definition">
                  <p className="font-bold">{t('Client/Server via fifos:', 'Client/Server prin fifouri:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>{t('Server creates a ', 'Serverul creează un ')}<strong>{t('well-known fifo', 'fifo binecunoscut')}</strong>{t(' and listens for requests', ' și ascultă cereri')}</li>
                    <li>{t('Each client connects to the well-known fifo and sends a request with its PID', 'Fiecare client se conectează la fifo-ul binecunoscut și trimite o cerere cu PID-ul său')}</li>
                    <li>{t('Server creates a ', 'Serverul creează un ')}<strong>{t('per-client fifo', 'fifo per-client')}</strong>{t(' (e.g., ', ' (ex., ')}<code>/tmp/resp.PID</code>{t(') to send the reply', ') pentru a trimite răspunsul')}</li>
                    <li><strong>{t('Iterative server', 'Server iterativ')}</strong>{t(': serves one client at a time. ', ': servește un client pe rând. ')}<strong>{t('Concurrent server', 'Server concurent')}</strong>{t(': forks a worker per client', ': creează un worker per client prin fork')}</li>
                  </ul>
                </Box>
              </Section>

              <Section title={t('Cheat Sheet', 'Rezumat rapid')} id="c9-cheat" checked={!!checked['c9-cheat']} onCheck={() => toggleCheck('c9-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">{t('Anonymous pipe', 'Canal anonim')}</p><p>pipe(pfd) → pfd[0]=read, pfd[1]=write</p><p>{t('Must pipe() BEFORE fork()', 'pipe() trebuie apelat ÎNAINTE de fork()')}</p><p>{t('Close unused ends!', 'Închideți capetele neutilizate!')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Named pipe', 'Canal cu nume')}</p><p>mkfifo(path, mode)</p><p>{t('open() blocks until both ends open', 'open() blochează până la deschiderea ambelor capete')}</p><p>{t('Data non-persistent (RAM only)', 'Date nepersistente (doar în RAM)')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Blocking rules', 'Reguli de blocare')}</p><p>{t('Read empty → block (or EOF if no writers)', 'Citire gol → blocare (sau EOF dacă nu sunt scriitori)')}</p><p>{t('Write full → block', 'Scriere plin → blocare')}</p><p>{t('Write no readers → SIGPIPE!', 'Scriere fără cititori → SIGPIPE!')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Atomicity', 'Atomicitate')}</p><p>{t('write ≤ PIPE_BUF = atomic', 'scriere ≤ PIPE_BUF = atomică')}</p><p>PIPE_BUF ≥ 512 (Linux: 4096)</p><p>{t('Larger writes may interleave', 'Scrierile mai mari pot fi intercalate')}</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c9-quiz" checked={!!checked['c9-quiz']} onCheck={() => toggleCheck('c9-quiz')}>
                <Toggle question={t('1. Why must you create the pipe BEFORE fork?', '1. De ce trebuie să creați canalul ÎNAINTE de fork?')} answer={t('Because the child needs to inherit both file descriptors (pfd[0] and pfd[1]) from the parent. After fork, both processes have copies. If you pipe() after fork, only the calling process has the descriptors — the other can\'t access the pipe.', 'Deoarece procesul fiu trebuie să moștenească ambii descriptori (pfd[0] și pfd[1]) de la părinte. După fork, ambele procese au copii. Dacă apelați pipe() după fork, doar procesul apelant are descriptorii — celălalt nu poate accesa canalul.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('2. What happens if you don\'t close the unused write end in the reader?', '2. Ce se întâmplă dacă nu închideți capătul de scriere neutilizat în cititor?')} answer={t('The reader will NEVER see EOF. read() returns 0 (EOF) only when ALL write-end descriptors are closed. Since the reader still has a write end open, read blocks forever when the pipe empties.', 'Cititorul nu va vedea NICIODATĂ EOF. read() returnează 0 (EOF) doar când TOȚI descriptorii capătului de scriere sunt închiși. Deoarece cititorul are în continuare un capăt de scriere deschis, read blochează la infinit când canalul se golește.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('3. Can unrelated processes use an anonymous pipe?', '3. Pot procesele neînrudite folosi un canal anonim?')} answer={t('No. Anonymous pipes have no name/path — the only way to share the descriptors is through fork (inheritance) or exec (fd inheritance). Use named pipes (fifos) for unrelated processes.', 'Nu. Canalele anonime nu au nume/cale — singura modalitate de a partaja descriptorii este prin fork (moștenire) sau exec (moștenirea fd). Utilizați canale cu nume (fifouri) pentru procese neînrudite.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('4. What signal is sent when writing to a pipe with no readers?', '4. Ce semnal este trimis la scrierea pe un canal fără cititori?')} answer={t("SIGPIPE (signal 13). Default action: terminate the process. This is why you see processes silently die when piping to 'head' — head closes its stdin after reading enough lines, and the writer gets SIGPIPE.", "SIGPIPE (semnalul 13). Acțiunea implicită: terminarea procesului. De aceea procesele mor în tăcere când se face pipe spre 'head' — head își închide stdin-ul după citirea suficientelor linii, iar scriitorul primește SIGPIPE.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('5. Is data in a fifo persistent on disk?', '5. Datele dintr-un fifo sunt persistente pe disc?')} answer={t('No. Despite having a filename in the filesystem, the data in a fifo exists only in kernel memory (RAM). When all processes close the fifo, unread data is lost. The file entry persists, but the data does not.', 'Nu. În ciuda faptului că au un nume de fișier în sistemul de fișiere, datele dintr-un fifo există doar în memoria nucleului (RAM). Când toate procesele închid fifo-ul, datele necitite sunt pierdute. Intrarea din sistem de fișiere persistă, dar datele nu.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('6. What does the blocking open of a fifo mean?', '6. Ce înseamnă deschiderea blocantă a unui fifo?')} answer={t("Opening a fifo for O_RDONLY blocks until another process opens it for O_WRONLY (and vice versa). They must 'rendezvous'. This is different from regular files where open always succeeds immediately.", "Deschiderea unui fifo cu O_RDONLY blochează până când un alt proces îl deschide cu O_WRONLY (și invers). Ele trebuie să 'se întâlnească'. Aceasta diferă de fișierele obișnuite unde open reușește întotdeauna imediat.")} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('7. When are pipe writes atomic?', '7. Când sunt scrierile pe canal atomice?')} answer={t('When the write size is ≤ PIPE_BUF bytes (POSIX guarantees ≥ 512, Linux uses 4096). Atomic means the bytes won\'t be interleaved with bytes from another writer. Writes > PIPE_BUF may be split.', 'Când dimensiunea scrierii este ≤ PIPE_BUF octeți (POSIX garantează ≥ 512, Linux folosește 4096). Atomic înseamnă că octeții nu vor fi intercalați cu octeții de la alt scriitor. Scrierile > PIPE_BUF pot fi divizate.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('8. Why is fflush() critical when using fprintf on pipes?', '8. De ce fflush() este critic când folosiți fprintf pe canale?')} answer={t('fprintf writes to a user-space buffer, NOT directly to the pipe. Without fflush(), the data sits in the buffer. The reader blocks waiting for data that the writer thinks it has already sent. This is a very common and hard-to-debug mistake.', 'fprintf scrie într-un buffer user-space, NU direct pe canal. Fără fflush(), datele rămân în buffer. Cititorul se blochează așteptând date pe care scriitorul crede că le-a trimis deja. Aceasta este o greșeală foarte frecventă și greu de depanat.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('9. How would you implement bidirectional communication with pipes?', '9. Cum ați implementa comunicația bidirecțională cu canale?')} answer={t('Use TWO pipes: one for each direction. A single pipe is unidirectional. Pipe1: parent→child. Pipe2: child→parent. Each process closes the unused ends of both pipes.', 'Utilizați DOUĂ canale: unul pentru fiecare direcție. Un singur canal este unidirecțional. Canal1: părinte→copil. Canal2: copil→părinte. Fiecare proces închide capetele neutilizate ale ambelor canale.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('10. How can you implement a semaphore using a fifo?', '10. Cum puteți implementa un semafor folosind un fifo?')} answer={t('Create a fifo. Initialize: write N bytes (for semaphore value N). sem_wait: read 1 byte (blocks if empty = value is 0). sem_post: write 1 byte. The blocking read semantics give you semaphore behavior.', 'Creați un fifo. Inițializare: scrieți N octeți (pentru valoarea semaforului N). sem_wait: citiți 1 octet (blochează dacă e gol = valoarea este 0). sem_post: scrieți 1 octet. Semantica citirii blocante vă oferă comportamentul semaforului.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 10 ==================== */}
            <CourseBlock title={t('Course 10: POSIX Signals', 'Cursul 10: Semnale POSIX')} id="c10">
              <p className="mb-3 text-sm opacity-80">Source: OS(10) - Programare de sistem in C pentru Linux (VII), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">{t('Roadmap:', 'Plan:')}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>{t('What is a signal — software interrupt concept', 'Ce este un semnal — conceptul de întrerupere software')}</li>
                  <li>{t('Signal categories: errors, external events, explicit requests', 'Categorii de semnale: erori, evenimente externe, cereri explicite')}</li>
                  <li>{t('Synchronous vs asynchronous signals', 'Semnale sincrone vs. asincrone')}</li>
                  <li>{t('Generating signals: kill(), raise()', 'Generarea semnalelor: kill(), raise()')}</li>
                  <li>{t('Predefined signal types (SIGINT, SIGKILL, SIGSEGV, etc.)', 'Tipuri predefinite de semnale (SIGINT, SIGKILL, SIGSEGV, etc.)')}</li>
                  <li>{t('Signal handling: default, ignore, custom handler', 'Tratarea semnalelor: implicit, ignorare, handler personalizat')}</li>
                  <li>{t('signal() — configuring handlers', 'signal() — configurarea handler-elor')}</li>
                  <li>{t('Writing safe signal handlers', 'Scrierea handler-elor de semnal sigure')}</li>
                  <li>{t('Blocking signals: sigprocmask(), sigpending()', 'Blocarea semnalelor: sigprocmask(), sigpending()')}</li>
                  <li>{t('Waiting for signals: pause(), sigsuspend()', 'Așteptarea semnalelor: pause(), sigsuspend()')}</li>
                </ol>
              </Box>

              <Section title={t('1. What is a Signal?', '1. Ce este un semnal?')} id="c10-what" checked={!!checked['c10-what']} onCheck={() => toggleCheck('c10-what')}>
                <Box type="definition">
                  <p>{t('A ', 'Un ')}<strong>{t('signal', 'semnal')}</strong>{t(' is a software interrupt generated when an exceptional event occurs, delivered by the OS to a specific process. Each signal has a ', ' este o întrerupere software generată când apare un eveniment excepțional, transmisă de sistemul de operare unui anumit proces. Fiecare semnal are un ')}<strong>{t('type', 'tip')}</strong>{t(' (integer) and a ', ' (întreg) și un ')}<strong>{t('destination process', 'proces destinatar')}</strong>{t('.', '.')}</p>
                </Box>

                <svg viewBox="0 0 450 140" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="15" width="110" height="35" rx="5" fill="#ef4444" opacity="0.12" stroke="#ef4444"/>
                  <text x="65" y="30" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">{t('Errors', 'Erori')}</text>
                  <text x="65" y="42" textAnchor="middle" fill="currentColor" fontSize="8">SIGSEGV, SIGFPE</text>
                  <rect x="10" y="58" width="110" height="35" rx="5" fill="#3b82f6" opacity="0.12" stroke="#3b82f6"/>
                  <text x="65" y="73" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="bold">{t('External events', 'Evenimente externe')}</text>
                  <text x="65" y="85" textAnchor="middle" fill="currentColor" fontSize="8">SIGCHLD, SIGINT</text>
                  <rect x="10" y="100" width="110" height="35" rx="5" fill="#10b981" opacity="0.12" stroke="#10b981"/>
                  <text x="65" y="115" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">{t('Explicit requests', 'Cereri explicite')}</text>
                  <text x="65" y="127" textAnchor="middle" fill="currentColor" fontSize="8">kill(), raise()</text>
                  <line x1="120" y1="75" x2="180" y2="75" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)"/>
                  <rect x="180" y="55" width="80" height="40" rx="6" fill="#f59e0b" opacity="0.15" stroke="#f59e0b"/>
                  <text x="220" y="72" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">{t('Signal', 'Semnal')}</text>
                  <text x="220" y="85" textAnchor="middle" fill="currentColor" fontSize="8">{t('queue', 'coadă')}</text>
                  <line x1="260" y1="75" x2="310" y2="75" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)"/>
                  <rect x="310" y="55" width="120" height="40" rx="6" fill="currentColor" opacity="0.06" stroke="currentColor" strokeWidth="1"/>
                  <text x="370" y="72" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="bold">{t('Process', 'Proces')}</text>
                  <text x="370" y="85" textAnchor="middle" fill="currentColor" fontSize="8">{t('→ handler executes', '→ handler-ul se execută')}</text>
                </svg>

                <Box type="theorem">
                  <p className="font-bold">{t('Synchronous vs asynchronous:', 'Sincron vs. asincron:')}</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>{t('Synchronous', 'Sincron')}</strong>{t(': caused by the process itself (division by zero → SIGFPE, bad pointer → SIGSEGV). Delivered during the triggering action.', ': cauzat de procesul însuși (împărțire la zero → SIGFPE, pointer invalid → SIGSEGV). Livrat în timpul acțiunii declanșatoare.')}</li>
                    <li><strong>{t('Asynchronous', 'Asincron')}</strong>{t(': caused by external events (user presses Ctrl+C → SIGINT, another process calls kill()). Arrives at unpredictable times.', ': cauzat de evenimente externe (utilizatorul apasă Ctrl+C → SIGINT, alt proces apelează kill()). Sosește la momente imprevizibile.')}</li>
                  </ul>
                </Box>
              </Section>

              <Section title={t('2. Generating Signals', '2. Generarea semnalelor')} id="c10-gen" checked={!!checked['c10-gen']} onCheck={() => toggleCheck('c10-gen')}>
                <Box type="formula">
                  <p className="font-bold">{t('From C code:', 'Din cod C:')}</p>
                  <Code>{`#include <signal.h>
int kill(pid_t pid, int sig);
// Send signal 'sig' to process 'pid'
// Returns 0 on success, -1 on error
// kill(pid, 0) — test if process exists (no signal sent)

int raise(int sig);
// Send signal to SELF. Equivalent to: kill(getpid(), sig)`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('From the command line:', 'Din linia de comandă:')}</p>
                  <Code>{`$ kill -SIGTERM 1234     # send SIGTERM to PID 1234
$ kill -9 1234          # send SIGKILL (9) to PID 1234
$ kill -l               # list all signal numbers and names
$ killall -SIGINT myprg # send SIGINT to all processes named "myprg"`}</Code>
                </Box>

                <Box type="definition">
                  <p className="font-bold">{t('Common keyboard signals:', 'Semnale comune de la tastatură:')}</p>
                  <table className="text-sm mt-1">
                    <tbody>
                      <tr><td className="pr-4 font-mono">Ctrl+C</td><td>SIGINT (2) — {t('interrupt', 'întrerupere')}</td></tr>
                      <tr><td className="font-mono">Ctrl+\</td><td>SIGQUIT (3) — {t('quit with core dump', 'ieșire cu core dump')}</td></tr>
                      <tr><td className="font-mono">Ctrl+Z</td><td>SIGTSTP (20) — {t('suspend/stop', 'suspendare/oprire')}</td></tr>
                    </tbody>
                  </table>
                </Box>
              </Section>

              <Section title={t('3. Signal Types', '3. Tipuri de semnale')} id="c10-types" checked={!!checked['c10-types']} onCheck={() => toggleCheck('c10-types')}>
                <Box type="formula">
                  <p className="font-bold">{t('Key predefined signals:', 'Semnale predefinite principale:')}</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="p-1">{t('Signal', 'Semnal')}</th><th className="p-1">{t('Default', 'Implicit')}</th><th className="p-1">{t('Meaning', 'Semnificație')}</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGINT (2)</td><td className="p-1">{t('Terminate', 'Terminare')}</td><td className="p-1">{t('Ctrl+C interrupt', 'Întrerupere Ctrl+C')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGQUIT (3)</td><td className="p-1">{t('Core dump', 'Core dump')}</td><td className="p-1">{t('Ctrl+\\ quit', 'Ieșire Ctrl+\\')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGKILL (9)</td><td className="p-1">{t('Terminate', 'Terminare')}</td><td className="p-1">{t('Force kill (', 'Terminare forțată (')}<strong>{t('cannot be caught!', 'nu poate fi interceptat!')}</strong>{t(')', ')')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGSEGV (11)</td><td className="p-1">{t('Core dump', 'Core dump')}</td><td className="p-1">{t('Invalid memory access', 'Acces invalid la memorie')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGPIPE (13)</td><td className="p-1">{t('Terminate', 'Terminare')}</td><td className="p-1">{t('Write to pipe with no reader', 'Scriere pe canal fără cititor')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGALRM (14)</td><td className="p-1">{t('Terminate', 'Terminare')}</td><td className="p-1">{t('Timer alarm (alarm())', 'Alarmă temporizator (alarm())')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGTERM (15)</td><td className="p-1">{t('Terminate', 'Terminare')}</td><td className="p-1">{t('Graceful termination request', 'Cerere de terminare gracioasă')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGCHLD (17)</td><td className="p-1">{t('Ignore', 'Ignorare')}</td><td className="p-1">{t('Child terminated/stopped', 'Copil terminat/oprit')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGSTOP (19)</td><td className="p-1">{t('Stop', 'Oprire')}</td><td className="p-1">{t('Suspend process (', 'Suspendare proces (')}<strong>{t('cannot be caught!', 'nu poate fi interceptat!')}</strong>{t(')', ')')}</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGCONT (18)</td><td className="p-1">{t('Continue', 'Continuare')}</td><td className="p-1">{t('Resume stopped process', 'Reluarea procesului oprit')}</td></tr>
                      <tr><td className="p-1 font-mono">SIGUSR1/2</td><td className="p-1">{t('Terminate', 'Terminare')}</td><td className="p-1">{t('User-defined (application use)', 'Definit de utilizator (uz aplicație)')}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Uncatchable signals:', 'Semnale care nu pot fi interceptate:')}</p>
                  <p><code>SIGKILL</code>{t(' and ', ' și ')}<code>SIGSTOP</code>{t(' can ', ' nu pot ')}<strong>{t('never', 'niciodată')}</strong>{t(' be caught, ignored, or blocked. They are the OS\'s guarantee of being able to terminate or stop any process.', ' fi interceptate, ignorate sau blocate. Ele reprezintă garanția sistemului de operare că poate termina sau opri orice proces.')}</p>
                </Box>
              </Section>

              <Section title={t('4. Signal Handling with signal()', '4. Tratarea semnalelor cu signal()')} id="c10-handle" checked={!!checked['c10-handle']} onCheck={() => toggleCheck('c10-handle')}>
                <p>{t('Three possible reactions when a signal arrives:', 'Trei reacții posibile când sosește un semnal:')}</p>
                <Box type="definition">
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>{t('Default action', 'Acțiunea implicită')}</strong>{t(' (SIG_DFL) — terminate, core dump, ignore, or stop', ' (SIG_DFL) — terminare, core dump, ignorare sau oprire')}</li>
                    <li><strong>{t('Ignore', 'Ignorare')}</strong>{t(' (SIG_IGN) — signal is discarded', ' (SIG_IGN) — semnalul este ignorat')}</li>
                    <li><strong>{t('Custom handler', 'Handler personalizat')}</strong>{t(' — your function runs, then process resumes', ' — funcția dvs. se execută, apoi procesul reia execuția')}</li>
                  </ol>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('signal() — configure handling:', 'signal() — configurarea tratării:')}</p>
                  <Code>{`#include <signal.h>
typedef void (*sighandler_t)(int);

sighandler_t signal(int signum, sighandler_t handler);
// handler: SIG_DFL, SIG_IGN, or pointer to your function
// Returns: previous handler, or SIG_ERR on error

// Example — ignore Ctrl+C:
signal(SIGINT, SIG_IGN);

// Example — restore default:
signal(SIGINT, SIG_DFL);`}</Code>
                </Box>

                <p className="font-bold mt-2">{t('Example — custom handler:', 'Exemplu — handler personalizat:')}</p>
                <Code>{`void my_handler(int sig) {
    // sig = signal number that triggered this handler
    printf("Caught signal %d\\n", sig);  // Note: printf not async-signal-safe!
}

int main() {
    signal(SIGINT, my_handler);   // Ctrl+C now calls my_handler
    signal(SIGQUIT, my_handler);  // Ctrl+\\ also calls my_handler

    while (1) {
        printf("Working... (Ctrl+C to test, Ctrl+\\\\ to quit)\\n");
        sleep(2);
    }
    // After handler runs, execution resumes in the while loop
}`}</Code>

                <p className="font-bold mt-2">{t('Example — restoring defaults after catching:', 'Exemplu — restaurarea valorilor implicite după interceptare:')}</p>
                <Code>{`int count = 0;
void handler(int sig) {
    count++;
    printf("Signal %d caught %d time(s)\\n", sig, count);
    if (count >= 3) {
        printf("Restoring default... next one will kill me.\\n");
        signal(sig, SIG_DFL);  // next signal uses default action
    }
}`}</Code>

                <Box type="warning">
                  <p className="font-bold">{t('Handler safety:', 'Siguranța handler-ului:')}</p>
                  <p>{t('Signal handlers run ', 'Handler-ele de semnal se execută ')}<strong>{t('asynchronously', 'asincron')}</strong>{t(' — they interrupt your program at unpredictable points. Only call ', ' — întrerup programul la puncte imprevizibile. Apelați doar funcții ')}<strong>{t('async-signal-safe', 'sigure pentru semnale asincrone')}</strong>{t(' functions inside handlers (write, _exit, etc.). ', ' în interiorul handler-elor (write, _exit, etc.). ')}<code>printf</code>{t(', ', ', ')}<code>malloc</code>{t(', ', ', ')}<code>fprintf</code>{t(' are NOT safe. Preferred pattern: set a ', ' NU sunt sigure. Tipar preferat: setați un indicator ')}<code>volatile sig_atomic_t</code>{t(' flag in the handler, check it in the main loop.', ' în handler, verificați-l în bucla principală.')}</p>
                </Box>
              </Section>

              <Section title={t('5. Blocking Signals', '5. Blocarea semnalelor')} id="c10-block" checked={!!checked['c10-block']} onCheck={() => toggleCheck('c10-block')}>
                <p><strong>{t('Blocking', 'Blocarea')}</strong>{t(' ≠ ignoring. Blocked signals are ', ' ≠ ignorarea. Semnalele blocate sunt ')}<strong>{t('queued', 'puse în coadă')}</strong>{t(' and delivered when unblocked. Ignored signals are discarded permanently.', ' și livrate când sunt deblocate. Semnalele ignorate sunt eliminate permanent.')}</p>

                <Box type="formula">
                  <p className="font-bold">{t('sigprocmask — block/unblock signal types:', 'sigprocmask — blocarea/deblocarea tipurilor de semnale:')}</p>
                  <Code>{`sigset_t block_set, old_set;

sigemptyset(&block_set);           // start with empty set
sigaddset(&block_set, SIGINT);     // add SIGINT to set
sigaddset(&block_set, SIGQUIT);    // add SIGQUIT to set

// Block these signals:
sigprocmask(SIG_BLOCK, &block_set, &old_set);

// ... critical section (signals queued, not delivered) ...

// Unblock (restore old mask):
sigprocmask(SIG_SETMASK, &old_set, NULL);
// Queued signals are now delivered!

// Check if signals are pending (queued):
sigset_t pending;
sigpending(&pending);
if (sigismember(&pending, SIGINT))
    printf("SIGINT is waiting to be delivered\\n");`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">{t('When to block vs ignore:', 'Când să blocați vs. să ignorați:')}</p>
                  <p>{t('Block signals during critical code sections where interruption would corrupt state. Don\'t ignore — you\'d lose the signal permanently. Blocking defers delivery; ignoring discards it.', 'Blocați semnalele în secțiunile critice de cod unde o întrerupere ar corupe starea. Nu ignorați — ați pierde semnalul permanent. Blocarea amână livrarea; ignorarea îl elimină.')}</p>
                </Box>
              </Section>

              <Section title={t('6. Waiting for Signals', '6. Așteptarea semnalelor')} id="c10-wait" checked={!!checked['c10-wait']} onCheck={() => toggleCheck('c10-wait')}>
                <Box type="formula">
                  <p className="font-bold">{t('pause() — simple wait:', 'pause() — așteptare simplă:')}</p>
                  <Code>{`int pause(void);
// Suspends process until ANY signal is received
// Always returns -1 with errno = EINTR`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">{t('sigsuspend() — safe wait (preferred):', 'sigsuspend() — așteptare sigură (preferată):')}</p>
                  <Code>{`int sigsuspend(const sigset_t* mask);
// Atomically: replace signal mask AND suspend
// Wakes when a signal not in 'mask' is received
// Restores old mask on return

// Example: wait specifically for SIGQUIT, blocking everything else
sigset_t wait_mask;
sigfillset(&wait_mask);           // block ALL signals
sigdelset(&wait_mask, SIGQUIT);   // except SIGQUIT
sigsuspend(&wait_mask);           // sleep until SIGQUIT arrives`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">{t('Why sigsuspend over pause?', 'De ce sigsuspend în loc de pause?')}</p>
                  <p>{t('With ', 'Cu ')}<code>pause()</code>{t(", there's a race condition: the signal might arrive ", ', există o condiție de cursă: semnalul poate sosi ')}<strong>{t('between', 'între')}</strong>{t(' unblocking it and calling pause(), so pause() would miss it and block forever. ', ' deblocarea sa și apelul pause(), astfel pause() l-ar rata și ar bloca la infinit. ')}<code>sigsuspend()</code>{t(' is atomic — it changes the mask and suspends in one indivisible operation.', ' este atomică — schimbă masca și suspendă într-o singură operație indivizibilă.')}</p>
                </Box>
              </Section>

              <Section title={t('Cheat Sheet', 'Rezumat rapid')} id="c10-cheat" checked={!!checked['c10-cheat']} onCheck={() => toggleCheck('c10-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">{t('Generate', 'Generare')}</p><p>kill(pid, sig), raise(sig)</p><p>{t('Keyboard: Ctrl+C/\\/Z', 'Tastatură: Ctrl+C/\\/Z')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Handle', 'Tratare')}</p><p>signal(sig, handler)</p><p>SIG_DFL, SIG_IGN, custom func</p><p>{t('Handler signature: void f(int)', 'Semnătură handler: void f(int)')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Block', 'Blocare')}</p><p>sigprocmask(SIG_BLOCK/UNBLOCK/SET)</p><p>sigset_t, sigemptyset, sigaddset</p><p>{t('sigpending — check queued signals', 'sigpending — verificare semnale în coadă')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Wait', 'Așteptare')}</p><p>{t('pause() — any signal', 'pause() — orice semnal')}</p><p>{t('sigsuspend(mask) — atomic, safe', 'sigsuspend(mask) — atomic, sigur')}</p><p>{t('SIGKILL/SIGSTOP: uncatchable!', 'SIGKILL/SIGSTOP: nu pot fi interceptate!')}</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c10-quiz" checked={!!checked['c10-quiz']} onCheck={() => toggleCheck('c10-quiz')}>
                <Toggle question={t('1. What is the difference between a signal and a system call?', '1. Care este diferența dintre un semnal și un apel de sistem?')} answer={t('A system call is a SYNCHRONOUS request from a process to the kernel (the process initiates it). A signal is an ASYNCHRONOUS notification from the kernel (or another process) to a process — it arrives at unpredictable times, interrupting whatever the process is doing.', 'Un apel de sistem este o cerere SINCRONĂ de la un proces la nucleu (procesul o inițiază). Un semnal este o notificare ASINCRONĂ de la nucleu (sau alt proces) la un proces — sosește la momente imprevizibile, întrerupând orice face procesul.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('2. Which two signals can never be caught, ignored, or blocked?', '2. Care două semnale nu pot fi niciodată interceptate, ignorate sau blocate?')} answer={t("SIGKILL (9) and SIGSTOP (19). They are the OS's unconditional controls: SIGKILL always terminates, SIGSTOP always suspends. This ensures the administrator can always stop a runaway process.", 'SIGKILL (9) și SIGSTOP (19). Ele sunt controalele necondiționate ale sistemului de operare: SIGKILL termină întotdeauna, SIGSTOP suspendă întotdeauna. Aceasta garantează că administratorul poate opri oricând un proces scăpat de sub control.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('3. What happens if a signal arrives while its handler is already running?', '3. Ce se întâmplă dacă un semnal sosește în timp ce handler-ul său este deja în execuție?')} answer={t('If the SAME signal arrives again, it is blocked until the current handler finishes (one is queued). If a DIFFERENT signal arrives, it CAN interrupt the current handler (nesting). This is why handlers must be kept short.', 'Dacă același semnal sosește din nou, este blocat până când handler-ul curent termină (unul este pus în coadă). Dacă un semnal DIFERIT sosește, el POATE întrerupe handler-ul curent (imbricare). De aceea handler-ele trebuie menținute scurte.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('4. Why is printf() unsafe inside a signal handler?', '4. De ce printf() este nesigur în interiorul unui handler de semnal?')} answer={t('printf() is NOT async-signal-safe. It uses internal buffers and locks. If the signal interrupts printf() in the main program, calling printf() in the handler can deadlock or corrupt the buffer. Use write() instead, or set a flag.', 'printf() NU este sigur pentru semnale asincrone. Folosește buffere interne și lacăte. Dacă semnalul întrerupe printf() în programul principal, apelarea printf() în handler poate provoca deadlock sau coruperea buffer-ului. Utilizați write() în schimb sau setați un indicator.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('5. What is the difference between blocking and ignoring a signal?', '5. Care este diferența dintre blocarea și ignorarea unui semnal?')} answer={t('Ignoring (SIG_IGN): signal is permanently discarded. Blocking (sigprocmask): signal is QUEUED and delivered when unblocked. Blocking preserves the signal; ignoring loses it.', 'Ignorare (SIG_IGN): semnalul este eliminat permanent. Blocare (sigprocmask): semnalul este PUS ÎN COADĂ și livrat când este deblocat. Blocarea păstrează semnalul; ignorarea îl pierde.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('6. What exit status does a process killed by signal N have?', '6. Ce cod de ieșire are un proces terminat de semnalul N?')} answer={t('128 + N. For example, SIGKILL (9) → exit status 137. SIGSEGV (11) → exit status 139. You can check with WIFSIGNALED and WTERMSIG macros from wait().', '128 + N. De exemplu, SIGKILL (9) → cod de ieșire 137. SIGSEGV (11) → cod de ieșire 139. Puteți verifica cu macro-urile WIFSIGNALED și WTERMSIG din wait().')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('7. Why is sigsuspend() preferred over pause()?', '7. De ce sigsuspend() este preferat față de pause()?')} answer={t('pause() has a race condition: the signal may arrive between sigprocmask(unblock) and pause(), causing pause to block forever. sigsuspend() atomically changes the mask AND suspends, eliminating the race.', 'pause() are o condiție de cursă: semnalul poate sosi între sigprocmask(unblock) și pause(), cauzând blocarea la infinit a lui pause. sigsuspend() schimbă atomic masca ȘI suspendă, eliminând condiția de cursă.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('8. What does kill(pid, 0) do?', '8. Ce face kill(pid, 0)?')} answer={t("It doesn't send any signal. It tests whether the process with the given PID exists and whether you have permission to send it signals. Returns 0 if yes, -1 if not. Useful for checking if a process is alive.", 'Nu trimite niciun semnal. Testează dacă procesul cu PID-ul dat există și dacă aveți permisiunea de a-i trimite semnale. Returnează 0 dacă da, -1 dacă nu. Util pentru a verifica dacă un proces este în viață.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('9. What signal is sent when you write to a pipe with no readers?', '9. Ce semnal este trimis când scrieți pe un canal fără cititori?')} answer={t('SIGPIPE (13). Default action: terminate the process. This connects to Course 9 — it\'s why closing unused pipe ends matters. You can catch SIGPIPE to handle the situation gracefully instead of dying.', 'SIGPIPE (13). Acțiunea implicită: terminarea procesului. Aceasta se leagă de Cursul 9 — de aceea contează închiderea capetelor neutilizate ale canalului. Puteți intercepta SIGPIPE pentru a gestiona situația gracios în loc să terminați.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
                <Toggle question={t('10. After exec(), what happens to signal handlers?', '10. După exec(), ce se întâmplă cu handler-ele de semnal?')} answer={t('Custom handlers are RESET to SIG_DFL (because the handler code no longer exists in the new program). Signals set to SIG_IGN remain ignored. The signal mask (blocked signals) is preserved.', 'Handler-ele personalizate sunt RESETATE la SIG_DFL (deoarece codul handler-ului nu mai există în noul program). Semnalele setate la SIG_IGN rămân ignorate. Masca de semnale (semnale blocate) este păstrată.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 11 ==================== */}
            <CourseBlock title={t('Course 11: NCURSES & Terminal Management', 'Cursul 11: NCURSES și gestiunea terminalelor')} id="c11">
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

              <Section title={t('1. Physical vs Virtual Screen', '1. Ecran fizic vs. ecran virtual')} id="c11-concept" checked={!!checked['c11-concept']} onCheck={() => toggleCheck('c11-concept')}>
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

              <Section title={t('2. Program Structure', '2. Structura programului')} id="c11-struct" checked={!!checked['c11-struct']} onCheck={() => toggleCheck('c11-struct')}>
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

              <Section title={t('3. Windows & Function Naming', '3. Ferestre și denumirea funcțiilor')} id="c11-windows" checked={!!checked['c11-windows']} onCheck={() => toggleCheck('c11-windows')}>
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

              <Section title={t('4. Output & Input Functions', '4. Funcții de ieșire și intrare')} id="c11-io" checked={!!checked['c11-io']} onCheck={() => toggleCheck('c11-io')}>
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

              <Section title={t('5. Attributes & Colors', '5. Atribute și culori')} id="c11-color" checked={!!checked['c11-color']} onCheck={() => toggleCheck('c11-color')}>
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

              <Section title={t('6. Low-Level Terminal (termios)', '6. Terminal la nivel scăzut (termios)')} id="c11-termios" checked={!!checked['c11-termios']} onCheck={() => toggleCheck('c11-termios')}>
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

              <Section title={t('Cheat Sheet', 'Rezumat rapid')} id="c11-cheat" checked={!!checked['c11-cheat']} onCheck={() => toggleCheck('c11-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">{t('Lifecycle', 'Ciclu de viață')}</p><p>initscr() → operations → endwin()</p><p>{t('Compile: gcc -lncurses', 'Compilare: gcc -lncurses')}</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Output', 'Ieșire')}</p><p>addch, addstr, printw</p><p>move(y,x), clear(), refresh()</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Input', 'Intrare')}</p><p>getch, getstr, scanw</p><p>keypad, echo/noecho, cbreak</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Windows', 'Ferestre')}</p><p>newwin, delwin, box, wrefresh</p><p>stdscr, LINES, COLS</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Style', 'Stil')}</p><p>attron/off(A_BOLD|A_REVERSE...)</p><p>start_color, init_pair, COLOR_PAIR</p></Box>
                  <Box type="formula"><p className="font-bold">{t('Naming', 'Denumire')}</p><p>{t('func = stdscr, wfunc = window', 'func = stdscr, wfunc = fereastră')}</p><p>{t('mvfunc = move+do, mvwfunc = both', 'mvfunc = mută+face, mvwfunc = ambele')}</p></Box>
                </div>
              </Section>

              <Section title={t('Self-Test (10 Questions)', 'Autoevaluare (10 întrebări)')} id="c11-quiz" checked={!!checked['c11-quiz']} onCheck={() => toggleCheck('c11-quiz')}>
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
            </CourseBlock>

            <footer className="mt-12 pt-6 border-t dark:border-gray-700 text-center text-sm opacity-60">
              <p>{t('OS Study Guide - Based on lectures by Cristian Vidrascu, UAIC (2026)', 'Ghid de studiu SO - Bazat pe cursurile lui Cristian Vidrașcu, UAIC (2026)')}</p>
              <p>{t('Generated with intensive study methodology', 'Generat cu metodologie intensivă de studiu')}</p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
