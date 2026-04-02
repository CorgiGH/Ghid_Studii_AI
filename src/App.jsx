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

const Toggle = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-2 border rounded dark:border-gray-600">
      <div className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setOpen(!open)}>
        <span className="font-sans text-sm">{question}</span>
        <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">{open ? 'Hide' : 'Show Answer'}</button>
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
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState({});

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
    { id: 'c1', title: 'Course 1: Basic Linux Commands & Filesystems', shortTitle: 'C1: Commands & FS' },
    { id: 'c2', title: 'Course 2: Shell Interpreters I - General Overview', shortTitle: 'C2: Shell I' },
    { id: 'c3', title: 'Course 3: Bash Scripting', shortTitle: 'C3: Bash Script' },
    { id: 'c4', title: 'Course 4: File I/O Primitives (POSIX + C stdlib)', shortTitle: 'C4: File I/O' },
    { id: 'c5', title: 'Course 5: File Locking & Concurrent Access', shortTitle: 'C5: File Locks' },
    { id: 'c6', title: 'Course 6: Process Management I - fork() & wait()', shortTitle: 'C6: fork/wait' },
    { id: 'c7', title: 'Course 7: Process Management II - exec()', shortTitle: 'C7: exec' },
    { id: 'c8', title: 'Course 8: Memory-Mapped Files, Shared Memory, Semaphores', shortTitle: 'C8: mmap/IPC' },
    { id: 'c9', title: 'Course 9: IPC via Pipes (Anonymous & Named)', shortTitle: 'C9: Pipes' },
    { id: 'c10', title: 'Course 10: POSIX Signals', shortTitle: 'C10: Signals' },
    { id: 'c11', title: 'Course 11: NCURSES & Terminal Management', shortTitle: 'C11: ncurses' },
  ];

  return (
    <div className={`${dark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 h-screen sticky top-0 overflow-y-auto border-r dark:border-gray-700 p-3 text-sm bg-gray-50 dark:bg-gray-800">
            <h2 className="font-bold text-lg mb-3">OS Study Guide</h2>
            <div className="mb-3">
              <button onClick={() => setDark(!dark)} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 hover:opacity-80 transition">
                {dark ? 'Light Mode' : 'Dark Mode'}
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
              <h1 className="text-3xl font-bold">Operating Systems - Complete Study Guide</h1>
              <button onClick={() => setDark(!dark)} className="lg:hidden text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-600">
                {dark ? 'Light' : 'Dark'}
              </button>
            </div>

            <input
              type="text"
              placeholder="Search across all content..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full p-3 mb-6 rounded border dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* ==================== COURSE 1 ==================== */}
            <CourseBlock title="Course 1: Basic Linux Commands & Filesystems" id="c1">
              <p className="mb-3 text-sm opacity-80">Source: OS(2) - Ghid de utilizare Linux (II), Cristian Vidrascu, UAIC</p>

              {/* Roadmap */}
              <Box type="definition">
                <p className="font-bold mb-2">Roadmap - Topics in this course:</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Command-line introduction (internal vs external commands)</li>
                  <li>Help commands (man, whatis, which, whereis, apropos)</li>
                  <li>Text editors &amp; compilers</li>
                  <li>Remote connections (ssh, sftp, scp)</li>
                  <li>Users &amp; groups (/etc/passwd, /etc/group, UID, GID)</li>
                  <li>Files &amp; filesystems (types, logical/physical structure)</li>
                  <li>Mounting filesystems</li>
                  <li>Directory commands (mkdir, rmdir, ls, pwd, cd)</li>
                  <li>File commands (ln, cp, mv, rm, touch, etc.)</li>
                  <li>File permissions (rwx, chmod, chown, chgrp)</li>
                  <li>File content processing (cat, grep, cut, sort, find, etc.)</li>
                  <li>Processes (ps, top, kill, jobs, fg/bg)</li>
                  <li>System information commands</li>
                  <li>Troubleshooting ("survival guide")</li>
                </ol>
              </Box>

              {/* Topic 1: Intro */}
              <Section title="1. Command-Line Introduction" id="c1-intro" checked={!!checked['c1-intro']} onCheck={() => toggleCheck('c1-intro')}>
                <p>A <strong>command interpreter</strong> (shell) is a program that takes user commands, executes them, and displays results. It is the interface between the user and the OS.</p>

                <Box type="definition">
                  <p className="font-bold">Two categories of simple commands:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li><strong>Internal commands</strong> - built into the shell itself. Examples: <code className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">cd</code>, <code className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">help</code></li>
                    <li><strong>External commands</strong> - separate executables on disk. Examples: <code className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">ls</code>, <code className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">passwd</code>, scripts like <code className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">.bashrc</code></li>
                  </ul>
                </Box>

                <Box type="formula">
                  <p className="font-bold font-mono">General command syntax:</p>
                  <Code>command_name [options] [arguments]</Code>
                  <ul className="list-disc pl-5 text-sm mt-1">
                    <li>Options preceded by <code>-</code> (short) or <code>--</code> (long)</li>
                    <li>Separator between words: SPACE or TAB</li>
                    <li>Multi-line commands: end each line with <code>\</code> then ENTER</li>
                  </ul>
                </Box>

                <p className="mt-2 font-bold">Example 1 (straightforward):</p>
                <Code>{`$ ls -l /home
# Lists contents of /home in long format
# -l is an option, /home is an argument`}</Code>

                <p className="font-bold mt-3">Example 2 (edge case - multi-line command):</p>
                <Code>{`$ gcc -fdiagnostics-color=always \\
    -g program.c \\
    -o program`}</Code>

                <Box type="warning">
                  <p className="font-bold">Common trap:</p>
                  <p>UNIX is <strong>case-sensitive</strong>! <code>ls</code> works, <code>LS</code> does not. Filenames <code>File.txt</code> and <code>file.txt</code> are different files.</p>
                </Box>
              </Section>

              {/* Topic 2: Users & Groups */}
              <Section title="2. Users, Groups & Authentication" id="c1-users" checked={!!checked['c1-users']} onCheck={() => toggleCheck('c1-users')}>
                <p>Every user needs an <strong>account</strong> (username + password) to work on a UNIX system. Each account has a <strong>UID</strong> (User ID). The special user <strong>root</strong> (UID=0) has full system privileges.</p>

                <Box type="formula">
                  <p className="font-bold font-mono">/etc/passwd format:</p>
                  <Code>username:x:UID:GID:userdata:home_directory:login_shell</Code>
                  <p className="text-sm mt-1">The <code>x</code> means the encrypted password is in <code>/etc/shadow</code> (readable only by root).</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold font-mono">/etc/group format:</p>
                  <Code>groupname:x:GID:list_of_users</Code>
                </Box>

                <p className="font-bold mt-2">Example - inspect your own account:</p>
                <Code>{`$ whoami          # shows your username
$ id              # shows UID, GID, and all groups
$ groups          # shows group memberships
$ who             # shows who is logged in
$ w               # detailed info about logged-in users
$ finger username # info about a specific user
$ last            # login history`}</Code>

                <p className="font-bold mt-2">Example - change password:</p>
                <Code>{`$ passwd    # change your own password (interactive)`}</Code>

                <Box type="warning">
                  <p className="font-bold">Trap:</p>
                  <p>Each user belongs to exactly one <strong>primary group</strong> (GID in /etc/passwd) and can belong to multiple <strong>supplementary groups</strong> (listed in /etc/group). Forgetting which group you're in can cause "Permission denied" errors.</p>
                </Box>
              </Section>

              {/* Topic 3: Files & Filesystem Structure */}
              <Section title="3. Files & Filesystem Structure" id="c1-files" checked={!!checked['c1-files']} onCheck={() => toggleCheck('c1-files')}>
                <p>In UNIX, data and programs are stored in <strong>files</strong>. Files are organized into <strong>filesystems</strong> (volumes on disk).</p>

                <Box type="definition">
                  <p className="font-bold">Six file types in UNIX:</p>
                  <ol className="list-decimal pl-5">
                    <li><strong>Regular files</strong> - ordinary data/programs</li>
                    <li><strong>Directories</strong> - "catalogs" containing other files</li>
                    <li><strong>Links</strong> (hard or symbolic) - aliases for existing files</li>
                    <li><strong>Device files</strong> (block or character) - hardware drivers</li>
                    <li><strong>FIFO files</strong> (named pipes) - local IPC mechanism</li>
                    <li><strong>Socket files</strong> - network IPC mechanism</li>
                  </ol>
                </Box>

                <FileSystemTreeSVG />

                <Box type="theorem">
                  <p className="font-bold">Key difference from Windows:</p>
                  <p>UNIX has a <strong>single root filesystem</strong> rooted at <code>/</code>. No drive letters (C:, D:). All other volumes are <strong>mounted</strong> as subtrees. Path separator is <code>/</code> (not <code>\</code>).</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Two ways to specify a file path:</p>
                  <ul className="list-disc pl-5">
                    <li><strong>Absolute path</strong>: from root <code>/</code>. Example: <code>/home/user/file.txt</code></li>
                    <li><strong>Relative path</strong>: from current directory. Example: <code>../docs/file.txt</code></li>
                  </ul>
                  <p className="mt-1 text-sm">Special: <code>~</code> = home directory, <code>~user</code> = user's home, <code>.</code> = current dir, <code>..</code> = parent dir</p>
                </Box>

                <p className="font-bold mt-2">Filesystem types:</p>
                <p className="text-sm">ext2/ext3/ext4 (Linux native), xfs, btrfs, zfs, vfat, ntfs, tmpfs, procfs, NFS, etc.</p>

                <Box type="warning">
                  <p className="font-bold">Trap:</p>
                  <p>Don't confuse a file's <strong>extension</strong> (.c, .txt) with its <strong>type</strong> (regular, directory, link...). Extensions are just naming conventions for humans. The <code>file</code> command inspects actual content to determine type.</p>
                </Box>
              </Section>

              {/* Topic 4: Permissions */}
              <Section title="4. File Permissions" id="c1-perms" checked={!!checked['c1-perms']} onCheck={() => toggleCheck('c1-perms')}>
                <p>Every file has an <strong>owner user</strong>, an <strong>owner group</strong>, and <strong>3 sets of permissions</strong> for: user (u), group (g), others (o).</p>

                <PermissionsSVG />

                <Box type="formula">
                  <p className="font-bold">Permission bits (for regular files):</p>
                  <table className="text-sm font-mono mt-1">
                    <tbody>
                      <tr><td className="pr-4">r (read) = 4</td><td>Can read file contents</td></tr>
                      <tr><td>w (write) = 2</td><td>Can modify/delete file</td></tr>
                      <tr><td>x (execute) = 1</td><td>Can execute as program</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">For directories, permissions mean something different:</p>
                  <table className="text-sm font-mono mt-1">
                    <tbody>
                      <tr><td className="pr-4">r</td><td>Can list filenames in directory</td></tr>
                      <tr><td>w</td><td>Can add/delete/rename files in directory</td></tr>
                      <tr><td>x</td><td>Can traverse (access files inside) directory</td></tr>
                    </tbody>
                  </table>
                </Box>

                <p className="font-bold mt-3">Example 1 - reading and setting permissions:</p>
                <Code>{`$ ls -l file.txt
-rw-r--r-- 1 user group 1234 Mar 15 10:00 file.txt

$ chmod 755 script.sh    # rwxr-xr-x (octal)
$ chmod u+x script.sh    # add execute for owner (symbolic)
$ chmod go-w file.txt    # remove write for group & others
$ chmod a+r file.txt     # add read for all`}</Code>

                <p className="font-bold mt-3">Example 2 - changing ownership:</p>
                <Code>{`$ chown newuser file.txt       # change owner
$ chgrp newgroup file.txt      # change group
$ chown newuser:newgroup file.txt  # both at once`}</Code>

                <Box type="warning">
                  <p className="font-bold">Access verification algorithm:</p>
                  <p>To access <code>/d1/d2/file</code>, the OS checks <strong>x</strong> permission on <code>/</code>, <code>d1</code>, <code>d2</code> for your user category, then the appropriate permission (r/w/x) on <code>file</code> itself. If any check fails, you get "Permission denied".</p>
                </Box>
              </Section>

              {/* Topic 5: Essential Commands */}
              <Section title="5. Essential File & Directory Commands" id="c1-cmds" checked={!!checked['c1-cmds']} onCheck={() => toggleCheck('c1-cmds')}>
                <Box type="definition">
                  <p className="font-bold">Directory commands:</p>
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
                  <p className="font-bold">File manipulation commands:</p>
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
                  <p className="font-bold">File content commands:</p>
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

                <p className="font-bold mt-2">Worked Example - find all .c files modified in the last 7 days:</p>
                <Code>{`$ find /home/user -name "*.c" -mtime -7 -type f
# -name: pattern match
# -mtime -7: modified less than 7 days ago
# -type f: regular files only`}</Code>

                <Box type="warning">
                  <p className="font-bold">Trap:</p>
                  <p><code>rm -rf</code> is irreversible! There is no trash/recycle bin in UNIX CLI. Double-check paths before using it. A misplaced space in <code>rm -rf / home</code> (vs <code>rm -rf /home</code>) can destroy the entire system.</p>
                </Box>
              </Section>

              {/* Topic 6: Processes */}
              <Section title="6. Processes" id="c1-proc" checked={!!checked['c1-proc']} onCheck={() => toggleCheck('c1-proc')}>
                <Box type="definition">
                  <p><strong>Process</strong> = an instance of a program in execution. Processes form a <strong>tree hierarchy</strong> (parent-child) rooted at PID 0 (created at boot).</p>
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
                  <p className="font-bold">Connection to later courses:</p>
                  <p>Courses 6-7 (OS(6), OS(7)) will teach you how to create processes programmatically with <code>fork()</code>, synchronize them with <code>wait()</code>, and replace their program with <code>exec()</code>.</p>
                </Box>
              </Section>

              {/* Topic 7: Troubleshooting */}
              <Section title="7. Troubleshooting (Survival Guide)" id="c1-trouble" checked={!!checked['c1-trouble']} onCheck={() => toggleCheck('c1-trouble')}>
                <Box type="warning">
                  <p className="font-bold">When a command appears "stuck":</p>
                  <ol className="list-decimal pl-5">
                    <li>Wait a reasonable time - it might just be busy computing</li>
                    <li>Press <strong>CTRL+C</strong> (sends SIGINT) - interrupts the program</li>
                    <li>Press <strong>CTRL+\</strong> (sends SIGQUIT) - stronger termination</li>
                    <li>Press <strong>CTRL+Z</strong> (suspends program), then use <code>ps</code> to find PID, then <code>kill -9 PID</code></li>
                  </ol>
                </Box>
              </Section>

              {/* Cheat Sheet */}
              <Section title="Cheat Sheet" id="c1-cheat" checked={!!checked['c1-cheat']} onCheck={() => toggleCheck('c1-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula">
                    <p className="font-bold">Navigation</p>
                    <p>pwd, cd, ls -lA</p>
                    <p>mkdir -p, rmdir, realpath</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">Files</p>
                    <p>cp, mv, rm, ln -s, touch</p>
                    <p>cat, head, tail, less, file</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">Search &amp; Filter</p>
                    <p>grep, find, sort, cut, wc, tr, uniq</p>
                    <p>diff, cmp, comm</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">Permissions</p>
                    <p>chmod (octal/symbolic)</p>
                    <p>chown, chgrp</p>
                    <p>r=4 w=2 x=1</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">Users</p>
                    <p>whoami, id, groups, who, w</p>
                    <p>/etc/passwd, /etc/group</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">Processes</p>
                    <p>ps, pstree, top, jobs</p>
                    <p>kill, kill -9, fg, bg</p>
                    <p>CTRL+C, CTRL+Z, CTRL+\</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">Help</p>
                    <p>man [section] name</p>
                    <p>help cmd, whatis, which</p>
                    <p>whereis, apropos</p>
                  </Box>
                  <Box type="formula">
                    <p className="font-bold">Remote</p>
                    <p>ssh user@host</p>
                    <p>scp src user@host:dst</p>
                    <p>sftp user@host</p>
                  </Box>
                </div>
              </Section>

              {/* Quiz */}
              <Section title="Self-Test (10 Questions)" id="c1-quiz" checked={!!checked['c1-quiz']} onCheck={() => toggleCheck('c1-quiz')}>
                <Toggle question="1. What is the difference between an internal and an external command?" answer="Internal commands are built into the shell (e.g., cd, help). External commands are separate executable files on disk (e.g., ls → /bin/ls). External commands can be scripts or compiled binaries." />
                <Toggle question="2. What does the 'x' permission mean on a directory?" answer="It means 'traverse' permission — the right to access files and subdirectories inside that directory. Without x, you can't cd into it or access any file by path through it, even if you have r permission to list its contents." />
                <Toggle question="3. What is the octal representation of rwxr-x---?" answer="rwx=7, r-x=5, ---=0. Answer: 750." />
                <Toggle question="4. How does UNIX filesystem differ from Windows?" answer="UNIX has a single root filesystem tree rooted at '/', uses '/' as path separator (not '\\'), filenames are case-sensitive, no drive letters. Other volumes are mounted as subtrees via the mount command." />
                <Toggle question="5. What file stores user account information? What are its fields?" answer="/etc/passwd. Fields: username:x:UID:GID:userdata:home_directory:login_shell. The 'x' indicates the password hash is stored in /etc/shadow." />
                <Toggle question="6. What are the 6 file types in UNIX?" answer="Regular files, directories, links (hard/symbolic), device files (block/character), FIFO (named pipe), sockets." />
                <Toggle question="7. What happens if you run: rm -rf / home (note the space)?" answer="This tries to recursively delete EVERYTHING starting from root '/' first, then a relative path 'home'. This would destroy the entire system. The correct command is rm -rf /home (no space). Always double-check rm -rf commands!" />
                <Toggle question="8. How do you find all .txt files larger than 1MB under /home?" answer={<code>find /home -name "*.txt" -size +1M -type f</code>} />
                <Toggle question="9. What's the difference between kill PID and kill -9 PID?" answer="kill PID sends SIGTERM (signal 15), which asks the process to terminate gracefully (it can be caught/ignored). kill -9 PID sends SIGKILL (signal 9), which forcefully terminates the process immediately and cannot be caught or ignored." />
                <Toggle question="10. What command shows all environment information about your user session?" answer={<span><code>id</code> shows UID/GID/groups. <code>env</code> or <code>printenv</code> shows environment variables. <code>who am i</code> or <code>whoami</code> shows current user. <code>tty</code> shows terminal device.</span>} />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 2 ==================== */}
            <CourseBlock title="Course 2: Shell Interpreters I - General Overview" id="c2">
              <p className="mb-3 text-sm opacity-80">Source: OS(3) - Ghid de utilizare Linux (III), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">Roadmap:</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Simple commands (internal vs external, execution model)</li>
                  <li>Foreground vs background execution</li>
                  <li>I/O Redirections (stdin, stdout, stderr)</li>
                  <li>Exit status (return codes)</li>
                  <li>Compound commands &amp; pipelines</li>
                  <li>Sequential, parallel, conditional execution</li>
                  <li>Command lists &amp; precedence</li>
                  <li>Filename globbing patterns</li>
                  <li>Shell configuration files &amp; command history</li>
                </ol>
              </Box>

              <Section title="1. Simple Commands & Execution Model" id="c2-simple" checked={!!checked['c2-simple']} onCheck={() => toggleCheck('c2-simple')}>
                <p>A <strong>simple command</strong> is a single command (internal or external) with its options, arguments, and optional I/O redirections.</p>
                <Box type="formula">
                  <p className="font-bold font-mono">Three ways to execute a script:</p>
                  <Code>{`# 1. Direct execution (needs +x permission & shebang):
$ ./script.sh arg1 arg2

# 2. Explicit shell invocation:
$ bash script.sh arg1 arg2

# 3. Source (runs in CURRENT shell, no new process):
$ source script.sh arg1
$ . script.sh arg1`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">Key difference:</p>
                  <p>Methods 1 &amp; 2 create a <strong>new child process</strong> (subshell) to run the script. Method 3 (<code>source</code>) runs commands in the <strong>current shell</strong> — so variable changes persist after the script finishes.</p>
                </Box>

                <p className="font-bold mt-2">Example - demonstrating source vs subshell:</p>
                <Code>{`$ cat test.sh
#!/bin/bash
myvar="hello"

$ ./test.sh ; echo $myvar    # prints nothing (subshell)
$ source test.sh ; echo $myvar  # prints "hello" (same shell)`}</Code>

                <Box type="warning">
                  <p className="font-bold">Trap:</p>
                  <p>Running <code>cd</code> inside a script executed with <code>./script.sh</code> does NOT change your current directory — the <code>cd</code> happens in the child process. Use <code>source script.sh</code> if you need the directory change to persist.</p>
                </Box>
              </Section>

              <Section title="2. Background Execution" id="c2-bg" checked={!!checked['c2-bg']} onCheck={() => toggleCheck('c2-bg')}>
                <Box type="definition">
                  <p><strong>Foreground</strong>: shell waits for command to finish before showing prompt. <strong>Background</strong>: shell immediately shows prompt; command runs concurrently.</p>
                </Box>
                <Code>{`$ long_command &          # run in background
[1] 12345                   # job number + PID
$ jobs                      # list background jobs
$ fg %1                     # bring job 1 to foreground
$ bg %1                     # resume suspended job in background`}</Code>

                <Box type="warning">
                  <p className="font-bold">Trap:</p>
                  <p>Background processes still write to your terminal (stdout/stderr) unless redirected. This can garble your prompt. Always redirect: <code>cmd &gt; out.log 2&gt;&amp;1 &amp;</code></p>
                </Box>
              </Section>

              <Section title="3. I/O Redirections" id="c2-redirect" checked={!!checked['c2-redirect']} onCheck={() => toggleCheck('c2-redirect')}>
                <p>Every process has three standard I/O streams:</p>
                <Box type="definition">
                  <ul className="space-y-1">
                    <li><strong>stdin</strong> (fd 0) — input, default: keyboard</li>
                    <li><strong>stdout</strong> (fd 1) — normal output, default: screen</li>
                    <li><strong>stderr</strong> (fd 2) — error output, default: screen</li>
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
                  <text x="210" y="125" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.6">Redirections change where these streams point</text>
                </svg>

                <Box type="formula">
                  <p className="font-bold">Redirection syntax:</p>
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

                <p className="font-bold mt-2">Example - separate stdout and stderr:</p>
                <Code>{`$ ls /home /nonexistent > ok.txt 2> err.txt
$ cat ok.txt    # listing of /home
$ cat err.txt   # "No such file or directory"`}</Code>

                <p className="font-bold mt-2">Example - merge stderr into stdout, then pipe:</p>
                <Code>{`$ gcc program.c 2>&1 | grep error
# Compiler errors AND warnings piped to grep`}</Code>
              </Section>

              <Section title="4. Exit Status" id="c2-exit" checked={!!checked['c2-exit']} onCheck={() => toggleCheck('c2-exit')}>
                <Box type="definition">
                  <p>Every command returns an integer <strong>exit status</strong> (0-255). Stored in <code>$?</code>.</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li><strong>0</strong> = success</li>
                    <li><strong>non-zero</strong> = failure (specific codes vary by command)</li>
                    <li><strong>126</strong> = found but not executable</li>
                    <li><strong>127</strong> = command not found</li>
                    <li><strong>128+N</strong> = killed by signal N</li>
                  </ul>
                </Box>
                <Code>{`$ ls /home ; echo $?    # prints 0 (success)
$ ls /noexist ; echo $?  # prints 2 (error)
$ kill -9 PID ; echo $?  # process exit: 137 = 128+9`}</Code>

                <Box type="warning">
                  <p className="font-bold">Trap:</p>
                  <p><code>$?</code> always holds the exit code of the <strong>most recently executed foreground command</strong>. If you run <code>echo $?</code> twice, the second one shows the exit code of the first <code>echo</code> (which is 0), not the original command.</p>
                </Box>
              </Section>

              <Section title="5. Pipelines (Command Chains)" id="c2-pipe" checked={!!checked['c2-pipe']} onCheck={() => toggleCheck('c2-pipe')}>
                <Box type="definition">
                  <p>A <strong>pipeline</strong> connects stdout of one command to stdin of the next using <code>|</code>. All commands in a pipeline run <strong>in parallel</strong> (not sequentially!).</p>
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
                  <text x="225" y="72" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.6">All 3 run in parallel. Exit status = last command's.</text>
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
                  <p className="font-bold">Pipeline exit status:</p>
                  <p>By default, the exit status of a pipeline is the exit status of the <strong>last command</strong>. Use <code>set -o pipefail</code> to make it fail if <em>any</em> command in the pipeline fails.</p>
                </Box>
              </Section>

              <Section title="6. Compound Commands (;  &  &&  ||)" id="c2-compound" checked={!!checked['c2-compound']} onCheck={() => toggleCheck('c2-compound')}>
                <Box type="formula">
                  <p className="font-bold">Four composition operators:</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="text-left p-1">Operator</th><th className="text-left p-1">Execution</th><th className="text-left p-1">Behavior</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">;</td><td className="p-1">Sequential</td><td className="p-1">Run next regardless of result</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">&amp;</td><td className="p-1">Parallel</td><td className="p-1">Run in background, next starts immediately</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">&amp;&amp;</td><td className="p-1">Conditional AND</td><td className="p-1">Run next only if previous <strong>succeeded</strong> (exit 0)</td></tr>
                      <tr><td className="p-1 font-mono">||</td><td className="p-1">Conditional OR</td><td className="p-1">Run next only if previous <strong>failed</strong> (exit ≠ 0)</td></tr>
                    </tbody>
                  </table>
                </Box>

                <p className="font-bold mt-2">Precedence:</p>
                <p className="text-sm"><code>&&</code> and <code>||</code> bind tighter than <code>;</code> and <code>&amp;</code>. All are left-associative.</p>

                <p className="font-bold mt-2">Example 1 - sequential:</p>
                <Code>{`$ mkdir d1 ; echo "Salut!" > d1/f1.txt ; cd d1 ; stat f1.txt`}</Code>

                <p className="font-bold mt-2">Example 2 - conditional (common pattern):</p>
                <Code>{`$ gcc prog.c -o prog && ./prog
# Only runs prog if compilation succeeded

$ cat file.txt || echo "File not found!"
# Prints fallback message if cat fails`}</Code>

                <p className="font-bold mt-2">Example 3 - parallel:</p>
                <Code>{`$ cat /etc/passwd & cat /etc/group &
# Both run simultaneously in background`}</Code>

                <Box type="definition">
                  <p className="font-bold">Subshell vs group:</p>
                  <Code>{`(list)    # runs list in a SUBSHELL (new process)
{ list; } # runs list in CURRENT shell (group)
# Key: subshell can't change parent's variables`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">Trap:</p>
                  <p>In <code>{`{ list; }`}</code>, the space after <code>{`{`}</code> and the <code>;</code> before <code>{`}`}</code> are <strong>mandatory</strong>. Forgetting them causes a syntax error.</p>
                </Box>
              </Section>

              <Section title="7. Filename Globbing (Wildcards)" id="c2-glob" checked={!!checked['c2-glob']} onCheck={() => toggleCheck('c2-glob')}>
                <Box type="formula">
                  <p className="font-bold">Pattern characters:</p>
                  <table className="text-sm mt-1">
                    <tbody>
                      <tr><td className="pr-4 font-mono">*</td><td>Matches any string (including empty)</td></tr>
                      <tr><td className="font-mono">?</td><td>Matches exactly one character</td></tr>
                      <tr><td className="font-mono">[abc]</td><td>Matches one of a, b, or c</td></tr>
                      <tr><td className="font-mono">[a-z]</td><td>Matches one char in range a-z</td></tr>
                      <tr><td className="font-mono">[^abc]</td><td>Matches one char NOT in set</td></tr>
                      <tr><td className="font-mono">\c</td><td>Escape: treat c literally</td></tr>
                    </tbody>
                  </table>
                </Box>
                <Code>{`$ ls *.c              # all .c files
$ ls file?.txt        # file1.txt, fileA.txt, etc.
$ ls file[0-9].txt    # file0.txt through file9.txt
$ ls file[^0-9].txt   # fileA.txt, fileX.txt (non-digits)
$ ls !(*.o)           # everything except .o files (bash)`}</Code>

                <Box type="warning">
                  <p className="font-bold">Trap:</p>
                  <p>Glob patterns are expanded by the <strong>shell before the command sees them</strong>. If no file matches, the pattern is passed as-is (unexpanded). This can cause confusing errors.</p>
                </Box>
              </Section>

              <Section title="8. Shell Configuration & History" id="c2-config" checked={!!checked['c2-config']} onCheck={() => toggleCheck('c2-config')}>
                <Box type="definition">
                  <p className="font-bold">Bash config files (execution order):</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>Login shell</strong>: <code>/etc/profile</code> → <code>~/.bash_profile</code> (or <code>~/.bash_login</code> or <code>~/.profile</code>)</li>
                    <li><strong>Non-login interactive</strong>: <code>~/.bashrc</code></li>
                    <li><strong>Logout</strong>: <code>~/.bash_logout</code></li>
                  </ul>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Command history:</p>
                  <Code>{`$ history          # list all previous commands
$ !42              # re-run command #42 from history
$ !!               # re-run last command
$ UP/DOWN arrows   # navigate through history
$ CTRL+R           # reverse search in history`}</Code>
                </Box>
              </Section>

              <Section title="Cheat Sheet" id="c2-cheat" checked={!!checked['c2-cheat']} onCheck={() => toggleCheck('c2-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">Redirections</p><p>{'< > >> 2> 2>> &> 2>&1'}</p></Box>
                  <Box type="formula"><p className="font-bold">Composition</p><p>{'; (seq) & (bg) && (AND) || (OR)'}</p></Box>
                  <Box type="formula"><p className="font-bold">Pipelines</p><p>cmd1 | cmd2 | cmd3</p><p>{'|& = 2>&1 |'}</p></Box>
                  <Box type="formula"><p className="font-bold">Globs</p><p>* ? [abc] [a-z] [^abc] \c</p></Box>
                  <Box type="formula"><p className="font-bold">Execution</p><p>./script, bash script, source script</p></Box>
                  <Box type="formula"><p className="font-bold">Exit status</p><p>$? (0=ok, 126/127/128+N)</p></Box>
                </div>
              </Section>

              <Section title="Self-Test (10 Questions)" id="c2-quiz" checked={!!checked['c2-quiz']} onCheck={() => toggleCheck('c2-quiz')}>
                <Toggle question="1. What is the difference between ./script.sh and source script.sh?" answer="./script.sh creates a new child process (subshell). source script.sh (or . script.sh) runs in the current shell. Variable assignments and cd changes only persist with source." />
                <Toggle question="2. What does 2>&1 mean?" answer="It redirects file descriptor 2 (stderr) to wherever file descriptor 1 (stdout) currently points. So stderr output goes to the same place as stdout." />
                <Toggle question="3. In cmd1 && cmd2 || cmd3, when does cmd3 run?" answer="cmd3 runs if cmd2 fails. Evaluation is left-to-right: if cmd1 succeeds, cmd2 runs. If cmd2 then fails, cmd3 runs. If cmd1 fails, cmd2 is skipped and cmd3 runs (because the && group evaluated to non-zero)." />
                <Toggle question="4. Do commands in a pipeline run sequentially or in parallel?" answer="In PARALLEL. All commands in a pipeline start simultaneously. Data flows through the pipe as it's produced. The shell waits for ALL to finish before returning." />
                <Toggle question="5. What's the exit status of: false | true?" answer="0 (success). By default, the pipeline exit status is the exit status of the LAST command (true = 0). With set -o pipefail, it would be 1 (first failure)." />
                <Toggle question="6. What does the glob pattern file[^0-9].txt match?" answer="Files like fileA.txt, filex.txt — the [^0-9] matches any single character that is NOT a digit. It does NOT match file1.txt or file9.txt." />
                <Toggle question="7. What is the key difference between (list) and { list; }?" answer="(list) runs in a subshell (new process) — variable changes don't affect parent. { list; } runs in the current shell — changes persist. The curly braces require spaces and semicolons." />
                <Toggle question="8. How do you run a command in the background and redirect all output to a log file?" answer={<code>cmd &gt; output.log 2&gt;&amp;1 &amp;</code>} />
                <Toggle question="9. Which config file runs when you open a new terminal (non-login)?" answer="~/.bashrc. Login shells read /etc/profile then ~/.bash_profile (or ~/.bash_login or ~/.profile). Interactive non-login shells (like new terminal tabs) read ~/.bashrc." />
                <Toggle question="10. What happens if you type: ls *.xyz and no .xyz files exist?" answer="In bash (default), the literal string '*.xyz' is passed to ls, which then reports an error ('cannot access *.xyz'). The glob was not expanded because no files matched." />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 3 ==================== */}
            <CourseBlock title="Course 3: Bash Scripting" id="c3">
              <p className="mb-3 text-sm opacity-80">Source: OS(1) - Ghid de utilizare Linux (IV), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">Roadmap:</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Shell scripts & shebang</li>
                  <li>Variables (definition, substitution, assignment)</li>
                  <li>String operations (length, substring, prefix/suffix removal)</li>
                  <li>Positional parameters & special variables</li>
                  <li>Useful built-in commands (read, export, shift, eval, set)</li>
                  <li>Arithmetic expressions (let, expr, bc, $((...)))</li>
                  <li>Conditional expressions (test, [ ], [[ ]])</li>
                  <li>Control structures: if/elif/else/fi, case/esac</li>
                  <li>Loops: while, until, for, select</li>
                  <li>Shell functions</li>
                </ol>
              </Box>

              <Section title="1. Shell Scripts & the Shebang" id="c3-scripts" checked={!!checked['c3-scripts']} onCheck={() => toggleCheck('c3-scripts')}>
                <p>A <strong>shell script</strong> is a text file containing a sequence of UNIX commands. The first line (the <strong>shebang</strong>) tells the system which interpreter to use.</p>
                <Code>{`#!/bin/bash
# This is a comment
echo "Hello, $1!"
ps -f`}</Code>

                <Box type="formula">
                  <p className="font-bold">Making a script executable and running it:</p>
                  <Code>{`$ chmod u+x Hello.sh
$ ./Hello.sh world       # Method 1: direct (needs shebang + x perm)
$ bash Hello.sh world    # Method 2: explicit shell
$ source Hello.sh world  # Method 3: current shell (no new process)`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">Trap:</p>
                  <p>With <code>source</code>, no new process is created. The <code>ps -f</code> output shows only the current shell. With <code>./Hello.sh</code>, you see a child <code>/bin/bash ./Hello.sh</code> process.</p>
                </Box>
              </Section>

              <Section title="2. Variables" id="c3-vars" checked={!!checked['c3-vars']} onCheck={() => toggleCheck('c3-vars')}>
                <p>Shell variables are <strong>string-typed by default</strong>, don't need declaration, and are created on first assignment.</p>

                <Box type="formula">
                  <p className="font-bold">Assignment & substitution:</p>
                  <Code>{`v=123          # Assign (NO spaces around =!)
echo $v        # Substitution: prints "123"
echo \${v}xyz   # Use braces when followed by text: "123xyz"
v=abc\${v}xyz   # v is now "abc123xyz"
unset v        # Destroy variable
v=             # Equivalent: set to empty string`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">Critical trap - spaces around =:</p>
                  <Code>{`v = 123    # WRONG! Shell interprets "v" as command, "=" as arg
v=123      # CORRECT`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">String operations:</p>
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
                  <p className="font-bold">Pattern removal mnemonic:</p>
                  <p><code>#</code> removes from the <strong>front</strong> (# is on the left of $). <code>%</code> removes from the <strong>back</strong>. Double (<code>##</code>, <code>%%</code>) = greedy (longest match). Single = shortest match.</p>
                </Box>
              </Section>

              <Section title="3. Special Variables & Positional Parameters" id="c3-special" checked={!!checked['c3-special']} onCheck={() => toggleCheck('c3-special')}>
                <Box type="formula">
                  <p className="font-bold">Positional parameters:</p>
                  <table className="text-sm mt-1">
                    <tbody>
                      <tr><td className="pr-4 font-mono">$0</td><td>Script name</td></tr>
                      <tr><td className="font-mono">$1..$9, ${'{10}'}</td><td>Arguments passed to script/function</td></tr>
                      <tr><td className="font-mono">$#</td><td>Number of arguments</td></tr>
                      <tr><td className="font-mono">$*</td><td>All arguments as one string (when quoted)</td></tr>
                      <tr><td className="font-mono">$@</td><td>All arguments as separate strings (when quoted)</td></tr>
                      <tr><td className="font-mono">$$</td><td>PID of current shell</td></tr>
                      <tr><td className="font-mono">$?</td><td>Exit code of last foreground command</td></tr>
                      <tr><td className="font-mono">$!</td><td>PID of last background process</td></tr>
                    </tbody>
                  </table>
                </Box>

                <p className="font-bold mt-2">Example - "$*" vs "$@":</p>
                <Code>{`#!/bin/bash
function count_params() { echo "Count: $#, All: $*"; }
count_params "$*"   # Count: 1, All: a b c  (one string)
count_params "$@"   # Count: 3, All: a b c  (three strings)
# Run with: ./script.sh a b c`}</Code>

                <Box type="definition">
                  <p className="font-bold">Key built-in commands:</p>
                  <Code>{`read -p "Enter n:" n    # Read input into variable n
export VAR=value       # Make variable visible to child processes
shift [n]              # Shift positional params left by n (default 1)
eval "cmd"             # Evaluate and execute string as command
set -x                 # Debug mode (print each command before execution)
set -n                 # Syntax check only (don't execute)`}</Code>
                </Box>
              </Section>

              <Section title="4. Arithmetic Expressions" id="c3-arith" checked={!!checked['c3-arith']} onCheck={() => toggleCheck('c3-arith')}>
                <Box type="formula">
                  <p className="font-bold">Four ways to do arithmetic:</p>
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
                  <p className="font-bold">Trap with expr:</p>
                  <p><code>*</code> must be escaped as <code>\*</code> because the shell would glob-expand it otherwise. Spaces around operators are mandatory in <code>expr</code>.</p>
                </Box>

                <Box type="definition">
                  <p className="font-bold">Typed variables:</p>
                  <Code>{`declare -i n    # integer variable (arithmetic without let)
n=5*4           # n=20 (automatic evaluation!)
declare -a arr  # array variable
arr[0]=hello; arr[1]=world
echo \${arr[1]} # "world"`}</Code>
                </Box>
              </Section>

              <Section title="5. Conditional Expressions (test)" id="c3-test" checked={!!checked['c3-test']} onCheck={() => toggleCheck('c3-test')}>
                <Box type="formula">
                  <p className="font-bold">test / [ ] syntax:</p>
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
                  <p className="font-bold">Trap:</p>
                  <p>In <code>[ condition ]</code>, the spaces after <code>[</code> and before <code>]</code> are <strong>mandatory</strong>. <code>[</code> is actually a command (synonym for <code>test</code>), and <code>]</code> is its last argument.</p>
                </Box>
              </Section>

              <Section title="6. Control Structures" id="c3-control" checked={!!checked['c3-control']} onCheck={() => toggleCheck('c3-control')}>

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
                  <text x="55" y="140" textAnchor="middle" fill="currentColor" fontSize="9">Alternatives</text>
                  <text x="180" y="140" textAnchor="middle" fill="currentColor" fontSize="9">Loops</text>
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
                  <p className="font-bold">for (two forms):</p>
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
                  <p className="font-bold">select (interactive menu):</p>
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
                  <p className="font-bold">Trap:</p>
                  <p>The <code>while</code> condition checks the exit status of the <strong>entire command list</strong>, not a boolean expression. <code>while read line</code> is idiomatic because <code>read</code> returns non-zero at EOF.</p>
                </Box>
              </Section>

              <Section title="7. Shell Functions" id="c3-funcs" checked={!!checked['c3-funcs']} onCheck={() => toggleCheck('c3-funcs')}>
                <Box type="formula">
                  <p className="font-bold">Function declaration:</p>
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

                <p className="font-bold mt-2">Example - a listing function:</p>
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
                  <p className="font-bold">Key differences from C functions:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Parentheses <code>()</code> are ALWAYS empty in the declaration — arguments are accessed via <code>$1, $2...</code></li>
                    <li>Variables are <strong>global by default</strong>. Use <code>local var=val</code> for local scope</li>
                    <li>Functions run in the <strong>same process</strong> (unlike scripts called with ./)</li>
                    <li><code>return</code> sets exit status (0-255), not a value. Use <code>echo</code> + command substitution to "return" data</li>
                  </ul>
                </Box>
              </Section>

              <Section title="Cheat Sheet" id="c3-cheat" checked={!!checked['c3-cheat']} onCheck={() => toggleCheck('c3-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">Variables</p><p>var=val, $var, ${'{var}'}, ${'{#var}'}</p><p>${'{var:start:len}'}, ${'{var#pat}'}, ${'{var%pat}'}</p></Box>
                  <Box type="formula"><p className="font-bold">Special vars</p><p>$0 $1..$9 $# $@ $* $$ $? $!</p></Box>
                  <Box type="formula"><p className="font-bold">Arithmetic</p><p>let, expr, $((...)), bc</p></Box>
                  <Box type="formula"><p className="font-bold">Tests</p><p>-z -n = != -eq -ne -gt -lt -ge -le</p><p>-e -f -d -r -w -x -s ! -a -o</p></Box>
                  <Box type="formula"><p className="font-bold">Control</p><p>if/elif/else/fi, case/esac</p><p>while/until/for/select + do/done</p></Box>
                  <Box type="formula"><p className="font-bold">Functions</p><p>function name() {'{...}'}</p><p>local, return, shift, read</p></Box>
                </div>
              </Section>

              <Section title="Self-Test (10 Questions)" id="c3-quiz" checked={!!checked['c3-quiz']} onCheck={() => toggleCheck('c3-quiz')}>
                <Toggle question="1. Why does v = 5 fail but v=5 works?" answer="The shell parses 'v = 5' as running a command named 'v' with arguments '=' and '5'. Assignment requires NO spaces around '='. This is the #1 beginner bash mistake." />
                <Toggle question='2. What does ${path##*/} do if path="/a/b/c.txt"?' answer='It removes the longest prefix matching */. The longest match of */ in "/a/b/c.txt" is "/a/b/". Result: "c.txt". This is equivalent to basename.' />
                <Toggle question='3. What is the difference between "$@" and "$*"?' answer='When quoted: "$*" expands to a single string "arg1 arg2 arg3". "$@" expands to separate strings "arg1" "arg2" "arg3". Use "$@" in for loops to correctly handle args with spaces.' />
                <Toggle question="4. How do you do floating-point division in bash?" answer="Bash arithmetic $((...)) only handles integers. Use bc: echo 'scale=4; 3/2' | bc outputs 1.5000. Or use awk: awk 'BEGIN{print 3/2}'." />
                <Toggle question="5. What's wrong with: if [$x -gt 5]; then ...?" answer="Missing spaces. [ is a command, so it needs space after it and before ]. Correct: if [ $x -gt 5 ]; then. Also, quote $x to handle empty values: [ &quot;$x&quot; -gt 5 ]." />
                <Toggle question="6. How does 'until' differ from 'while'?" answer="while loops WHILE condition is true (exit 0). until loops WHILE condition is false (exit ≠ 0). until stops when the condition becomes true. They are logical inverses." />
                <Toggle question="7. Can a bash function return a string?" answer="Not directly. 'return' only sets exit status (0-255). To return data, use echo inside the function and capture it: result=$(my_func args). Or use a global variable." />
                <Toggle question="8. What does shift 2 do?" answer="It shifts all positional parameters left by 2. $3 becomes $1, $4 becomes $2, etc. The old $1 and $2 are discarded. $# decreases by 2. Useful for parsing options in a loop." />
                <Toggle question="9. Write a one-liner to sum numbers 1 to 100." answer={<code>echo $(($(seq -s+ 1 100)))</code>} />
                <Toggle question="10. What does set -x do and when is it useful?" answer="set -x enables debug/trace mode: the shell prints each command (after expansion) before executing it, prefixed with '+'. Useful for debugging scripts. Add it at the top during development, remove when done." />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 4 ==================== */}
            <CourseBlock title="Course 4: File I/O Primitives (POSIX API + C Standard Library)" id="c4">
              <p className="mb-3 text-sm opacity-80">Source: OS(4) - Programare de sistem in C pentru Linux (I), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">Roadmap:</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>POSIX API vs C Standard Library — trade-offs</li>
                  <li>Categories of POSIX I/O primitives</li>
                  <li>Core primitives: access, creat, open, read, write, lseek, close</li>
                  <li>File work session pattern (open → read/write loop → close)</li>
                  <li>Directory primitives: opendir, readdir, closedir</li>
                  <li>Filesystem cache (kernel-level disk cache)</li>
                  <li>C stdlib I/O: fopen, fread/fwrite, fscanf/fprintf, fclose</li>
                  <li>Buffered vs unbuffered I/O — the two-level cache</li>
                  <li>Format specifiers (%d, %s, %f, etc.)</li>
                </ol>
              </Box>

              <Section title="1. POSIX API vs C Standard Library" id="c4-api" checked={!!checked['c4-api']} onCheck={() => toggleCheck('c4-api')}>
                <p>Two families of functions for file I/O in C on Linux:</p>

                <svg viewBox="0 0 480 180" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="10" width="200" height="60" rx="8" fill="#3b82f6" opacity="0.12" stroke="#3b82f6" strokeWidth="1.5"/>
                  <text x="110" y="30" textAnchor="middle" fill="#3b82f6" fontWeight="bold" fontSize="11">C Standard Library</text>
                  <text x="110" y="45" textAnchor="middle" fill="currentColor" fontSize="9">fopen, fread, fprintf, fclose</text>
                  <text x="110" y="58" textAnchor="middle" fill="currentColor" fontSize="9">Buffered, FILE*, portable</text>

                  <rect x="260" y="10" width="200" height="60" rx="8" fill="#10b981" opacity="0.12" stroke="#10b981" strokeWidth="1.5"/>
                  <text x="360" y="30" textAnchor="middle" fill="#10b981" fontWeight="bold" fontSize="11">POSIX API</text>
                  <text x="360" y="45" textAnchor="middle" fill="currentColor" fontSize="9">open, read, write, close</text>
                  <text x="360" y="58" textAnchor="middle" fill="currentColor" fontSize="9">Unbuffered, int fd, Linux/UNIX only</text>

                  <rect x="130" y="90" width="220" height="40" rx="6" fill="#f59e0b" opacity="0.1" stroke="#f59e0b"/>
                  <text x="240" y="112" textAnchor="middle" fill="#f59e0b" fontWeight="bold" fontSize="10">Kernel filesystem cache</text>
                  <text x="240" y="125" textAnchor="middle" fill="currentColor" fontSize="9">Unique per system, in kernel-space</text>

                  <rect x="160" y="145" width="160" height="25" rx="4" fill="currentColor" opacity="0.08" stroke="currentColor" opacity="0.3"/>
                  <text x="240" y="162" textAnchor="middle" fill="currentColor" fontSize="9">Physical disk</text>

                  <line x1="110" y1="70" x2="200" y2="90" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4"/>
                  <line x1="360" y1="70" x2="280" y2="90" stroke="#10b981" strokeWidth="1" strokeDasharray="4"/>
                  <line x1="240" y1="130" x2="240" y2="145" stroke="currentColor" strokeWidth="1"/>
                </svg>

                <Box type="theorem">
                  <p className="font-bold">Key trade-off:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>POSIX API</strong>: Full access to OS features (permissions, locks, devices). Not portable to Windows. Uses <code>int</code> file descriptors.</li>
                    <li><strong>C stdlib</strong>: Portable across platforms. Buffer-ized (user-space cache per process). Uses <code>FILE*</code> pointers. Limited OS control.</li>
                  </ul>
                </Box>

                <Box type="warning">
                  <p className="font-bold">Error handling convention:</p>
                  <p>All POSIX primitives return <strong>-1</strong> on error and set the global variable <code>errno</code>. Diagnose with <code>perror("context")</code>.</p>
                </Box>
              </Section>

              <Section title="2. Core POSIX Primitives" id="c4-posix" checked={!!checked['c4-posix']} onCheck={() => toggleCheck('c4-posix')}>
                <Box type="formula">
                  <p className="font-bold">access — check file permissions:</p>
                  <Code>{`#include <unistd.h>
int access(char* path, int mode);
// mode: F_OK(0)=exists, R_OK(4), W_OK(2), X_OK(1)
// Returns 0 if allowed, -1 if not

if (access("data.txt", R_OK | W_OK) == -1)
    perror("Cannot read/write data.txt");`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">open — start a file session:</p>
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
                  <p className="font-bold">read / write — transfer data:</p>
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
                  <p className="font-bold">lseek — reposition cursor:</p>
                  <Code>{`off_t lseek(int fd, off_t offset, int whence);
// whence: SEEK_SET(0), SEEK_CUR(1), SEEK_END(2)
// Returns: new absolute position, or -1 on error

lseek(fd, 0, SEEK_SET);    // go to beginning
lseek(fd, -10, SEEK_END);  // 10 bytes before end
off_t pos = lseek(fd, 0, SEEK_CUR); // get current position`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">close — end a file session:</p>
                  <Code>{`int close(int fd);  // Returns 0 on success, -1 on error`}</Code>
                </Box>

                <p className="font-bold mt-3">Worked example — cp implementation with POSIX API:</p>
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
                  <p className="font-bold">Trap — buffer size matters:</p>
                  <p>Using <code>BUF_SIZE = 4096</code> (one page) is optimal because the kernel filesystem cache operates at page granularity. Using 1-byte reads is catastrophically slow (thousands of system calls).</p>
                </Box>
              </Section>

              <Section title="3. Directory Primitives" id="c4-dir" checked={!!checked['c4-dir']} onCheck={() => toggleCheck('c4-dir')}>
                <Box type="formula">
                  <p className="font-bold">Directory traversal pattern:</p>
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
                  <p className="font-bold">Other directory/path primitives:</p>
                  <Code>{`mkdir(path, mode);    // create directory
rmdir(path);          // remove empty directory
chdir(path);          // change working directory
getcwd(buf, size);    // get current working directory`}</Code>
                </Box>
              </Section>

              <Section title="4. C Standard Library I/O" id="c4-stdio" checked={!!checked['c4-stdio']} onCheck={() => toggleCheck('c4-stdio')}>
                <Box type="formula">
                  <p className="font-bold">Equivalent functions (FILE* based):</p>
                  <Code>{`FILE* f = fopen("data.txt", "rb");  // modes: r/w/a + b
size_t n = fread(buf, 1, size, f);  // binary read
size_t n = fwrite(buf, 1, size, f); // binary write
fscanf(f, "%d %s", &num, str);     // formatted read
fprintf(f, "x=%d\\n", x);           // formatted write
fseek(f, offset, SEEK_SET);        // reposition
fclose(f);                          // close`}</Code>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">Two-level caching:</p>
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>stdio buffer</strong> (user-space, per process) — fwrite writes here first</li>
                    <li><strong>Kernel filesystem cache</strong> (kernel-space, shared by all processes) — actual disk I/O</li>
                  </ol>
                  <p className="text-sm mt-1">The stdio buffer is flushed: on <code>fclose</code>, when buffer fills, on <code>fflush(f)</code>, or on <code>\n</code> for line-buffered streams (stdout to terminal).</p>
                </Box>

                <Box type="warning">
                  <p className="font-bold">Critical trap — buffered writes before exec/fork:</p>
                  <p>Calling <code>exec()</code> does NOT flush stdio buffers! Data in the buffer is <strong>lost</strong>. Always call <code>fflush(NULL)</code> (flushes all open streams) before <code>exec</code> or <code>fork</code>.</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Format specifiers (scanf/printf family):</p>
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

              <Section title="5. Filesystem Cache" id="c4-cache" checked={!!checked['c4-cache']} onCheck={() => toggleCheck('c4-cache')}>
                <Box type="theorem">
                  <p className="font-bold">Kernel filesystem cache:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>Unique per system</strong>, in kernel-space, shared by ALL processes</li>
                    <li>Granularity = physical page (4096 bytes on x86/x64)</li>
                    <li>Repeated reads of same block → served from RAM (fast)</li>
                    <li>Writes go to cache first, flushed to disk later (write-back)</li>
                    <li>Bypass with <code>O_DIRECT</code> flag; force sync with <code>O_SYNC</code> or <code>fsync(fd)</code></li>
                  </ul>
                </Box>

                <Box type="warning">
                  <p className="font-bold">Connection:</p>
                  <p>The stdio buffer (Course 4) sits ON TOP of the filesystem cache. So there are <strong>two layers</strong> of caching between your <code>fprintf</code> and the actual disk. This is why <code>fflush</code> is critical before sharing data between processes.</p>
                </Box>
              </Section>

              <Section title="Cheat Sheet" id="c4-cheat" checked={!!checked['c4-cheat']} onCheck={() => toggleCheck('c4-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">POSIX I/O</p><p>open, read, write, lseek, close</p><p>access, creat, stat, chmod, link, unlink</p><p>dup, dup2, pipe, mkfifo, fcntl</p></Box>
                  <Box type="formula"><p className="font-bold">C stdlib I/O</p><p>fopen, fread/fwrite, fclose</p><p>fscanf/fprintf, fseek, fflush</p><p>FILE*, buffered, portable</p></Box>
                  <Box type="formula"><p className="font-bold">Directories</p><p>opendir, readdir, closedir</p><p>mkdir, rmdir, chdir, getcwd</p></Box>
                  <Box type="formula"><p className="font-bold">Error handling</p><p>return -1, errno, perror()</p><p>Always check return values!</p></Box>
                </div>
              </Section>

              <Section title="Self-Test (10 Questions)" id="c4-quiz" checked={!!checked['c4-quiz']} onCheck={() => toggleCheck('c4-quiz')}>
                <Toggle question="1. What does open() return on success vs failure?" answer="On success: a non-negative integer (file descriptor, the lowest available fd number). On failure: -1, and errno is set." />
                <Toggle question="2. What happens if read() returns 0?" answer="It means EOF — end of file was reached. No bytes were read. This is NOT an error (error would return -1)." />
                <Toggle question="3. Why is buffer size 4096 optimal for read/write?" answer="4096 bytes is the page size on x86/x64. The kernel filesystem cache operates at page granularity. Reads/writes aligned to page boundaries minimize system calls and maximize DMA transfer efficiency." />
                <Toggle question="4. What is the difference between POSIX descriptors (int) and stdio descriptors (FILE*)?" answer="POSIX int fd is a raw OS-level handle — unbuffered, direct syscalls. FILE* is a library-level wrapper that adds user-space buffering, formatted I/O, and portability. Internally, FILE* uses an int fd underneath." />
                <Toggle question="5. What happens to stdio buffers when you call exec()?" answer="They are LOST. exec() replaces the process image (including all user-space memory), but does NOT flush stdio buffers first. Always call fflush(NULL) before exec()." />
                <Toggle question="6. How do you convert between int fd and FILE*?" answer="fd → FILE*: fdopen(fd, mode). FILE* → fd: fileno(fp). Useful when mixing POSIX and stdio functions on the same file." />
                <Toggle question="7. What are the three standard file descriptors?" answer="0 = stdin, 1 = stdout, 2 = stderr. They are inherited from the parent process and are open by default." />
                <Toggle question="8. What does lseek(fd, 0, SEEK_CUR) return?" answer="The current file position (offset from beginning). This is an idiom to query position without changing it." />
                <Toggle question="9. Why must you skip '.' and '..' when traversing a directory with readdir()?" answer="readdir() returns ALL entries including '.' (current dir) and '..' (parent dir). If you're doing recursive operations (like recursive delete), processing these would cause infinite loops or delete parent directories." />
                <Toggle question="10. Can two processes share the kernel filesystem cache?" answer="Yes! The kernel filesystem cache is unique per system and shared by ALL processes. This is why one process's write (once flushed to cache) can be read by another process even before disk sync." />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 5 ==================== */}
            <CourseBlock title="Course 5: File Locking & Concurrent Access" id="c5">
              <p className="mb-3 text-sm opacity-80">Source: OS(5) - Programare de sistem in C pentru Linux (II), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">Roadmap:</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Concurrent access to files (the problem)</li>
                  <li>Data races on files</li>
                  <li>Exclusive access via file locks</li>
                  <li>The flock structure</li>
                  <li>fcntl() for locking — F_SETLK, F_SETLKW, F_GETLK</li>
                  <li>Lock types: read (shared/CREW) vs write (exclusive)</li>
                  <li>Advisory vs mandatory locks</li>
                  <li>Optimized locking (minimal lock region & duration)</li>
                  <li>Measuring execution time</li>
                </ol>
              </Box>

              <Section title="1. The Concurrent Access Problem" id="c5-concur" checked={!!checked['c5-concur']} onCheck={() => toggleCheck('c5-concur')}>
                <p>Linux is <strong>multi-tasking</strong>: multiple processes can access the same file simultaneously. This is the default and requires no special code.</p>

                <Box type="warning">
                  <p className="font-bold">The problem — data races:</p>
                  <p>When two processes read-then-write the same file region concurrently, one process's write can overwrite the other's, causing <strong>data corruption</strong>. The classic pattern: both read '#', both decide to replace it, but only one replacement survives.</p>
                </Box>

                <svg viewBox="0 0 420 130" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="10" width="100" height="30" rx="5" fill="#3b82f6" opacity="0.15" stroke="#3b82f6"/>
                  <text x="60" y="30" textAnchor="middle" fill="#3b82f6">Process A</text>
                  <rect x="310" y="10" width="100" height="30" rx="5" fill="#ef4444" opacity="0.15" stroke="#ef4444"/>
                  <text x="360" y="30" textAnchor="middle" fill="#ef4444">Process B</text>
                  <rect x="150" y="60" width="120" height="25" rx="4" fill="currentColor" opacity="0.08" stroke="currentColor" opacity="0.3"/>
                  <text x="210" y="77" textAnchor="middle" fill="currentColor" fontSize="9">aaaa#bbbb#cccc</text>
                  <line x1="60" y1="40" x2="185" y2="60" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3"/>
                  <line x1="360" y1="40" x2="235" y2="60" stroke="#ef4444" strokeWidth="1" strokeDasharray="3"/>
                  <text x="80" y="55" fill="#3b82f6" fontSize="8">read '#', sleep, write '1'</text>
                  <text x="280" y="55" fill="#ef4444" fontSize="8">read '#', sleep, write '2'</text>
                  <text x="210" y="110" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.7">Both find same '#' → only one write survives!</text>
                </svg>

                <p className="font-bold mt-2">Example — launching concurrent access:</p>
                <Code>{`$ echo -n "aaaa#bbbb#cccc" > fis.dat
$ ./access_v1 1 & ./access_v1 2 &
# Expected: aaaa1bbbb2cccc  or  aaaa2bbbb1cccc
# Actual:   aaaa1bbbb#cccc  or  aaaa2bbbb#cccc  (data race!)`}</Code>
              </Section>

              <Section title="2. File Locks with fcntl()" id="c5-locks" checked={!!checked['c5-locks']} onCheck={() => toggleCheck('c5-locks')}>
                <Box type="definition">
                  <p className="font-bold">struct flock — describes a lock:</p>
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
                  <p className="font-bold">fcntl() for locking:</p>
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
                  <p className="font-bold">Lock types — CREW semantics:</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="text-left p-1">Existing lock</th><th className="text-left p-1">New F_RDLCK?</th><th className="text-left p-1">New F_WRLCK?</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">None</td><td className="p-1 text-green-500">Allowed</td><td className="p-1 text-green-500">Allowed</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">F_RDLCK (read)</td><td className="p-1 text-green-500">Allowed (shared)</td><td className="p-1 text-red-500">Blocked</td></tr>
                      <tr><td className="p-1">F_WRLCK (write)</td><td className="p-1 text-red-500">Blocked</td><td className="p-1 text-red-500">Blocked</td></tr>
                    </tbody>
                  </table>
                  <p className="text-sm mt-1"><strong>CREW</strong> = Concurrent Read or Exclusive Write. Multiple readers OR one writer, never both.</p>
                </Box>
              </Section>

              <Section title="3. Advisory Nature of Locks" id="c5-advisory" checked={!!checked['c5-advisory']} onCheck={() => toggleCheck('c5-advisory')}>
                <Box type="warning">
                  <p className="font-bold">Locks are ADVISORY, not mandatory!</p>
                  <p>A lock only works if <strong>all cooperating processes</strong> agree to check for locks before accessing the file. A process that simply calls <code>write()</code> without checking locks will <strong>succeed</strong> even if another process holds a write lock.</p>
                </Box>

                <p className="font-bold mt-2">Proof by example:</p>
                <Code>{`$ echo -n "aaaa#bbbb#cccc" > fis.dat
$ ./access_v2 1 &          # This process uses locks
$ sleep 2; echo "xyxyxy" > fis.dat   # This does NOT use locks
# Result: "xyxy1y" — the echo overwrote despite the lock!`}</Code>

                <Box type="theorem">
                  <p className="font-bold">Lock characteristics:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Locks are <strong>auto-released</strong> when process closes fd or terminates</li>
                    <li>Locks are <strong>NOT inherited</strong> by child processes after fork()</li>
                    <li>Unlocking a segment of a larger lock can split it into two locks</li>
                    <li>Must open fd with matching mode: read lock needs O_RDONLY or O_RDWR</li>
                  </ul>
                </Box>
              </Section>

              <Section title="4. Optimized Locking" id="c5-optim" checked={!!checked['c5-optim']} onCheck={() => toggleCheck('c5-optim')}>
                <p>Locking the <strong>entire file for the entire duration</strong> serializes access — processes run one-after-another, defeating concurrency.</p>

                <Box type="theorem">
                  <p className="font-bold">Optimization principles:</p>
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>Minimize lock region</strong>: lock only the specific byte(s) you're modifying, not the whole file</li>
                    <li><strong>Minimize lock duration</strong>: acquire lock just before write, release immediately after</li>
                    <li><strong>Re-validate after acquiring lock</strong>: the data may have changed between your read and lock acquisition (TOCTOU race)</li>
                  </ol>
                </Box>

                <p className="font-bold mt-2">Example — lock one byte, re-validate:</p>
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
                  <p className="font-bold">Trap — TOCTOU (Time-of-check to time-of-use):</p>
                  <p>Between reading '#' and acquiring the lock, another process may have already replaced it. You MUST re-read after locking. Forgetting this is a classic concurrency bug.</p>
                </Box>
              </Section>

              <Section title="5. Measuring Execution Time" id="c5-time" checked={!!checked['c5-time']} onCheck={() => toggleCheck('c5-time')}>
                <Box type="formula">
                  <p className="font-bold">Methods:</p>
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

              <Section title="Cheat Sheet" id="c5-cheat" checked={!!checked['c5-cheat']} onCheck={() => toggleCheck('c5-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">Lock types</p><p>F_RDLCK (shared read)</p><p>F_WRLCK (exclusive write)</p><p>F_UNLCK (release)</p></Box>
                  <Box type="formula"><p className="font-bold">fcntl commands</p><p>F_SETLK (non-blocking)</p><p>F_SETLKW (blocking/wait)</p><p>F_GETLK (query)</p></Box>
                  <Box type="formula"><p className="font-bold">CREW rule</p><p>Multiple readers OR one writer</p><p>Never both simultaneously</p></Box>
                  <Box type="formula"><p className="font-bold">Key facts</p><p>Advisory (not mandatory)</p><p>Not inherited by fork()</p><p>Auto-released on close/exit</p><p>Re-validate after acquire!</p></Box>
                </div>
              </Section>

              <Section title="Self-Test (10 Questions)" id="c5-quiz" checked={!!checked['c5-quiz']} onCheck={() => toggleCheck('c5-quiz')}>
                <Toggle question="1. What is a data race on a file?" answer="When two or more processes read-then-write the same region of a file concurrently, and the result depends on the unpredictable timing of their operations. One process's write can be overwritten or lost." />
                <Toggle question="2. What does F_SETLKW do differently from F_SETLK?" answer="F_SETLKW is BLOCKING: if the lock conflicts with an existing lock, the call waits (blocks) until the lock becomes available. F_SETLK is non-blocking: it returns -1 immediately with errno = EACCES or EAGAIN." />
                <Toggle question="3. Can a read lock and a write lock coexist on the same region?" answer="No. A write lock (F_WRLCK) is exclusive — it conflicts with both read and write locks. Multiple read locks CAN coexist (they are shared). This is CREW semantics." />
                <Toggle question="4. What happens if process A holds a write lock and process B does a plain write() without locking?" answer="Process B's write SUCCEEDS! Locks are advisory — the kernel does not enforce them on processes that don't check. All cooperating processes must use locks for them to work." />
                <Toggle question="5. Are locks inherited by child processes after fork()?" answer="No. Each lock has the creator's PID stored in l_pid. Child processes have different PIDs and do not inherit the parent's locks." />
                <Toggle question="6. What is the TOCTOU problem with file locking?" answer="Time-of-check to time-of-use: you read data, decide to modify it, then acquire a lock — but between the read and the lock, another process may have already changed the data. Solution: re-read after acquiring the lock." />
                <Toggle question="7. How do you lock just one byte at position 100?" answer={<span>Set <code>l_whence=SEEK_SET, l_start=100, l_len=1</code> in the flock struct, then call <code>fcntl(fd, F_SETLKW, &fl)</code>.</span>} />
                <Toggle question="8. What does l_len=0 mean in a flock struct?" answer="It means lock from l_start to the END OF FILE, including any bytes that may be appended later. It's a common idiom for locking the entire file." />
                <Toggle question="9. Why is locking the entire file for the entire duration suboptimal?" answer="It serializes all access — processes run one after another, completely eliminating concurrency. Better to lock only the specific region being modified, for the minimum time needed." />
                <Toggle question="10. How do you check if a lock exists without actually locking?" answer={<span>Use <code>fcntl(fd, F_GETLK, &fl)</code>. If a conflicting lock exists, the struct is filled with info about it (including l_pid of the holder). If no conflict, l_type is set to F_UNLCK.</span>} />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 6 ==================== */}
            <CourseBlock title="Course 6: Process Management I - fork() & wait()" id="c6">
              <p className="mb-3 text-sm opacity-80">Source: OS(6) - Programare de sistem in C pentru Linux (III), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">Roadmap:</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Program vs process — definitions</li>
                  <li>Process table (PCB), PID, PPID, UID, states</li>
                  <li>Info primitives: getpid, getppid, getuid, etc.</li>
                  <li>Sleep primitives: sleep, usleep, nanosleep</li>
                  <li>Termination: exit (normal) vs abort/signal (abnormal)</li>
                  <li>Process creation: fork() — the only way</li>
                  <li>What the child inherits (and what it doesn't)</li>
                  <li>Synchronization: wait() and waitpid()</li>
                  <li>Zombie and orphan processes</li>
                </ol>
              </Box>

              <Section title="1. Program vs Process" id="c6-def" checked={!!checked['c6-def']} onCheck={() => toggleCheck('c6-def')}>
                <Box type="definition">
                  <p><strong>Program</strong> = an executable file on disk (compiled from source).</p>
                  <p><strong>Process</strong> = an instance of a program in execution, characterized by: lifetime, allocated memory (code + data + stacks), CPU time, and other resources.</p>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">Process hierarchy:</p>
                  <p>Processes form a <strong>tree</strong>. Every process has a parent (PPID) that created it. Root of tree = PID 0 (created at boot). PID 1 = <code>init</code>/<code>systemd</code> (first user-space process).</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Process Control Block (PCB) contains:</p>
                  <Code>{`PID, PPID             // process & parent IDs
UID, GID              // real owner
EUID, EGID            // effective owner (for setuid programs)
State                 // ready, running, waiting, zombie
Terminal, cmdline, env, hardware context, ...`}</Code>
                </Box>
              </Section>

              <Section title="2. Info & Utility Primitives" id="c6-info" checked={!!checked['c6-info']} onCheck={() => toggleCheck('c6-info')}>
                <Box type="formula">
                  <p className="font-bold">Process information:</p>
                  <Code>{`pid_t getpid(void);   // my PID
pid_t getppid(void);  // parent's PID
uid_t getuid(void);   // real user ID
uid_t geteuid(void);  // effective user ID
gid_t getgid(void);   // real group ID`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Sleep (suspend execution):</p>
                  <Code>{`sleep(5);             // 5 seconds (precision: seconds)
usleep(500000);       // 0.5 seconds (precision: microseconds)
nanosleep(&req, &rem); // nanosecond precision, restartable`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">Trap:</p>
                  <p>Actual sleep duration may <strong>exceed</strong> the requested time (OS scheduling). It may also be <strong>shorter</strong> if a signal interrupts the sleep (errno = EINTR). Only <code>nanosleep</code> reports the remaining time via its second argument.</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Termination:</p>
                  <Code>{`// Normal termination:
exit(status);  // status & 0xFF saved as exit code
return n;      // from main(), equivalent to exit(n)

// Abnormal termination:
abort();       // sends SIGABRT to self → abnormal exit`}</Code>
                </Box>
              </Section>

              <Section title="3. fork() — Process Creation" id="c6-fork" checked={!!checked['c6-fork']} onCheck={() => toggleCheck('c6-fork')}>
                <p><code>fork()</code> is the <strong>only</strong> way to create a new process in UNIX/Linux.</p>

                <Box type="formula">
                  <p className="font-bold">Interface:</p>
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
                  <text x="200" y="24" textAnchor="middle" fill="#3b82f6" fontWeight="bold">Parent process</text>
                  <text x="200" y="55" textAnchor="middle" fill="currentColor" fontWeight="bold" fontSize="12">fork()</text>
                  <line x1="200" y1="35" x2="200" y2="45" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="200" y1="60" x2="100" y2="80" stroke="#3b82f6" strokeWidth="1.5"/>
                  <line x1="200" y1="60" x2="300" y2="80" stroke="#10b981" strokeWidth="1.5"/>
                  <rect x="40" y="80" width="120" height="35" rx="6" fill="#3b82f6" opacity="0.1" stroke="#3b82f6"/>
                  <text x="100" y="95" textAnchor="middle" fill="#3b82f6" fontSize="9">Parent continues</text>
                  <text x="100" y="108" textAnchor="middle" fill="#3b82f6" fontSize="9">fork() returns child PID</text>
                  <rect x="240" y="80" width="120" height="35" rx="6" fill="#10b981" opacity="0.1" stroke="#10b981"/>
                  <text x="300" y="95" textAnchor="middle" fill="#10b981" fontSize="9">Child starts here</text>
                  <text x="300" y="108" textAnchor="middle" fill="#10b981" fontSize="9">fork() returns 0</text>
                  <text x="200" y="140" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.6">Both run the SAME code, differentiated by return value</text>
                  <text x="200" y="155" textAnchor="middle" fill="#ef4444" fontSize="9">Separate memory! Variable changes are NOT shared.</text>
                </svg>

                <p className="font-bold mt-2">Canonical fork pattern:</p>
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
                  <p className="font-bold">What the child inherits from parent:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Same UID/GID, environment variables, command line</li>
                    <li>Same <strong>open file descriptors</strong> (shared entries in global file table!)</li>
                    <li>Same memory-mapped regions (mmap)</li>
                    <li>Copy of all variables (but in <strong>separate memory</strong> — COW)</li>
                  </ul>
                </Box>

                <Box type="warning">
                  <p className="font-bold">Critical point — no shared memory by default:</p>
                  <p>After fork, parent and child each work on their <strong>own copy</strong> of memory. If the child modifies a variable, the parent does NOT see it (and vice versa). This is implemented via <strong>copy-on-write</strong> (COW) pages for efficiency.</p>
                </Box>

                <p className="font-bold mt-2">Example — proving separate memory:</p>
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

              <Section title="4. wait() — Synchronization" id="c6-wait" checked={!!checked['c6-wait']} onCheck={() => toggleCheck('c6-wait')}>
                <Box type="formula">
                  <p className="font-bold">wait() and waitpid():</p>
                  <Code>{`pid_t wait(int* wstatus);
// Blocks until ANY child terminates
// Returns: PID of terminated child, or -1 (no children)

pid_t waitpid(pid_t pid, int* wstatus, int options);
// pid = -1: wait for any child (like wait())
// pid > 0: wait for specific child
// options: 0 (block) or WNOHANG (non-blocking)`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Inspecting wstatus with macros:</p>
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
                  <p className="font-bold">Zombie and orphan processes:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>Zombie</strong>: child terminated but parent hasn't called wait() yet. The PCB entry remains in the process table. Fix: parent must call wait().</li>
                    <li><strong>Orphan</strong>: parent terminates before child. The child is re-parented to PID 1 (init/systemd), which will reap it.</li>
                  </ul>
                </Box>

                <p className="font-bold mt-2">Example — create N children, wait for all:</p>
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
                  <p className="font-bold">Trap — fork in a loop:</p>
                  <p>If you forget the <code>exit()</code> in the child branch, the child will continue the for-loop and fork <strong>its own</strong> children, causing an exponential explosion of processes (fork bomb)!</p>
                </Box>
              </Section>

              <Section title="5. Synchronization Points" id="c6-sync" checked={!!checked['c6-sync']} onCheck={() => toggleCheck('c6-sync')}>
                <Box type="theorem">
                  <p className="font-bold">Two synchronization points:</p>
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>fork()</strong>: both parent and child start simultaneous execution from this point</li>
                    <li><strong>wait()</strong>: parent blocks until child terminates — this is where exit code flows from child to parent</li>
                  </ol>
                </Box>

                <svg viewBox="0 0 350 130" className="w-full max-w-sm mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <text x="175" y="15" textAnchor="middle" fill="currentColor" fontWeight="bold">Timeline</text>
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
                  <text x="250" y="30" textAnchor="middle" fill="#f59e0b" fontSize="8">wait() returns</text>
                  <rect x="160" y="36" width="90" height="8" rx="2" fill="#3b82f6" opacity="0.2"/>
                  <text x="205" y="43" textAnchor="middle" fill="#3b82f6" fontSize="7">blocked</text>
                </svg>
              </Section>

              <Section title="Cheat Sheet" id="c6-cheat" checked={!!checked['c6-cheat']} onCheck={() => toggleCheck('c6-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">fork()</p><p>Returns: child PID (parent), 0 (child), -1 (error)</p><p>Child = clone, separate memory (COW)</p><p>Shares: open fds, mmaps, env</p></Box>
                  <Box type="formula"><p className="font-bold">wait()/waitpid()</p><p>WIFEXITED, WEXITSTATUS</p><p>WIFSIGNALED, WTERMSIG</p><p>WNOHANG for non-blocking</p></Box>
                  <Box type="formula"><p className="font-bold">Info</p><p>getpid, getppid, getuid, geteuid</p><p>sleep, usleep, nanosleep</p></Box>
                  <Box type="formula"><p className="font-bold">Termination</p><p>exit(code) — normal</p><p>abort() — SIGABRT — abnormal</p><p>Zombie: child done, parent no wait</p></Box>
                </div>
              </Section>

              <Section title="Self-Test (10 Questions)" id="c6-quiz" checked={!!checked['c6-quiz']} onCheck={() => toggleCheck('c6-quiz')}>
                <Toggle question="1. What is the ONLY way to create a new process in UNIX?" answer="The fork() system call. It creates a clone of the calling process. There is no other mechanism (unlike Windows which has CreateProcess)." />
                <Toggle question="2. What does fork() return in the child process, and why?" answer="0. Because the child can always find its parent's PID via getppid(), but the parent has no built-in way to find the child's PID other than the fork() return value. So the asymmetry is by design." />
                <Toggle question="3. After fork(), if the child modifies variable x, does the parent see the change?" answer="No. Parent and child have separate memory spaces. Changes in one are invisible to the other. This is the fundamental consequence of fork() creating a COPY. (Implemented efficiently via copy-on-write pages.)" />
                <Toggle question="4. What is a zombie process and how do you prevent it?" answer="A zombie is a process that has terminated but whose parent hasn't called wait() to read its exit status. The PCB remains in the process table. Prevention: parent must call wait() or waitpid() for each child." />
                <Toggle question="5. What happens to orphan processes?" answer="If a parent dies before its children, the children become orphans and are re-parented to PID 1 (init/systemd), which will eventually call wait() to reap them." />
                <Toggle question="6. Why is exit() in the child critical inside a fork-in-a-loop?" answer="Without exit(), the child continues the loop and calls fork() itself, creating grandchildren who also continue the loop — exponential process explosion (fork bomb). Always exit() or _exit() in the child branch." />
                <Toggle question="7. Do file descriptors survive fork()?" answer="Yes. The child inherits copies of ALL open file descriptors, and crucially, they point to the SAME entries in the kernel's global open file table. So parent and child share the file offset — reads/writes by one affect the other's position." />
                <Toggle question="8. What does WEXITSTATUS(wstatus) return if the child called exit(42)?" answer="42. WEXITSTATUS extracts the low 8 bits of the exit code from the wstatus value. Only valid if WIFEXITED(wstatus) is true." />
                <Toggle question="9. How do you wait for a SPECIFIC child process?" answer={<span>Use <code>waitpid(child_pid, &st, 0)</code> instead of <code>wait()</code>. The first argument is the specific PID to wait for.</span>} />
                <Toggle question="10. What is the difference between exit() and _exit()?" answer="exit() flushes stdio buffers, runs atexit() handlers, then terminates. _exit() terminates IMMEDIATELY without flushing buffers or cleanup. Use _exit() in child processes after fork() if the child will call exec() (to avoid double-flushing buffers)." />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 7 ==================== */}
            <CourseBlock title="Course 7: Process Management II - exec() Family" id="c7">
              <p className="mb-3 text-sm opacity-80">Source: OS(7) - Programare de sistem in C pentru Linux (IV), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">Roadmap:</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>The exec concept — process "overlay" (not creation)</li>
                  <li>The 6+1 exec functions and their differences</li>
                  <li>What survives exec (PID, fds, etc.) and what doesn't</li>
                  <li>The fork+exec pattern for running external programs</li>
                  <li>Exec with open files — fd inheritance and FD_CLOEXEC</li>
                  <li>Exec with scripts (shebang interpreter)</li>
                  <li>stdout redirection via dup/dup2 before exec</li>
                  <li>The system() convenience function</li>
                </ol>
              </Box>

              <Section title="1. The exec() Concept" id="c7-concept" checked={!!checked['c7-concept']} onCheck={() => toggleCheck('c7-concept')}>
                <p><code>fork()</code> creates a new process running the <strong>same</strong> program. But how do we run a <strong>different</strong> program? Answer: <code>exec()</code> <strong>replaces</strong> the current process's program with a new one.</p>

                <Box type="definition">
                  <p className="font-bold">Key mental model:</p>
                  <p><code>exec()</code> does NOT create a new process. It <strong>overlays</strong> the calling process with a new executable. Same PID, same parent, same open files — but completely new code, data, and stack.</p>
                </Box>

                <svg viewBox="0 0 420 110" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="20" y="20" width="140" height="50" rx="8" fill="#3b82f6" opacity="0.12" stroke="#3b82f6"/>
                  <text x="90" y="40" textAnchor="middle" fill="#3b82f6" fontWeight="bold">Old Program</text>
                  <text x="90" y="55" textAnchor="middle" fill="currentColor" fontSize="9">code + data + stack</text>
                  <text x="210" y="48" textAnchor="middle" fill="#f59e0b" fontWeight="bold" fontSize="12">exec()</text>
                  <line x1="160" y1="45" x2="250" y2="45" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arr)"/>
                  <rect x="260" y="20" width="140" height="50" rx="8" fill="#10b981" opacity="0.12" stroke="#10b981"/>
                  <text x="330" y="40" textAnchor="middle" fill="#10b981" fontWeight="bold">New Program</text>
                  <text x="330" y="55" textAnchor="middle" fill="currentColor" fontSize="9">code + data + stack</text>
                  <text x="210" y="90" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.6">Same PID, same parent, same open fds</text>
                  <text x="210" y="102" textAnchor="middle" fill="#ef4444" fontSize="9">On success: exec() NEVER returns!</text>
                </svg>

                <Box type="warning">
                  <p className="font-bold">exec() does not return on success!</p>
                  <p>If exec succeeds, the calling program no longer exists — it's been replaced. Any code after exec() only runs if exec <strong>failed</strong> (returns -1).</p>
                </Box>
              </Section>

              <Section title="2. The 6+1 exec Functions" id="c7-family" checked={!!checked['c7-family']} onCheck={() => toggleCheck('c7-family')}>
                <Box type="formula">
                  <p className="font-bold">Naming convention — each letter means something:</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="p-1">Suffix</th><th className="p-1">Meaning</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">l</td><td className="p-1">args as <strong>l</strong>ist (variadic: arg0, arg1, ..., NULL)</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">v</td><td className="p-1">args as <strong>v</strong>ector (char* argv[])</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">p</td><td className="p-1">search <strong>P</strong>ATH for executable</td></tr>
                      <tr><td className="p-1 font-mono">e</td><td className="p-1">provide custom <strong>e</strong>nvironment (char* env[])</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="formula">
                  <p className="font-bold">All 7 functions:</p>
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
                  <p className="font-bold">Important rules:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><code>arg0</code> / <code>argv[0]</code> = process name (shown by ps), by convention = executable name</li>
                    <li>Last arg in list form, and last element of argv[], must be <strong>NULL</strong></li>
                    <li>Without <code>p</code> suffix: <code>path</code> must be full/relative path (not searched in PATH)</li>
                    <li><code>execve</code> is the actual system call; others are library wrappers</li>
                  </ul>
                </Box>

                <p className="font-bold mt-2">Example — execl:</p>
                <Code>{`execl("/bin/ls", "ls", "-l", "-i", "/home", NULL);
// If we reach here, exec failed:
perror("exec failed");
exit(127);`}</Code>
              </Section>

              <Section title="3. What Survives exec()" id="c7-survives" checked={!!checked['c7-survives']} onCheck={() => toggleCheck('c7-survives')}>
                <Box type="theorem">
                  <p className="font-bold">Preserved after exec:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>PID, PPID, priority</li>
                    <li>Open file descriptors (unless FD_CLOEXEC is set)</li>
                    <li>UID/GID (unless setuid/setgid bit is set on new executable)</li>
                    <li>Working directory, umask, signal masks</li>
                  </ul>
                </Box>

                <Box type="warning">
                  <p className="font-bold">NOT preserved:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>Signal handlers</strong> are reset to defaults (the old handler code no longer exists)</li>
                    <li><strong>Memory mappings</strong> are destroyed</li>
                    <li><strong>stdio buffers</strong> are lost! (Call <code>fflush(NULL)</code> before exec!)</li>
                    <li>FDs with <strong>FD_CLOEXEC</strong> (or O_CLOEXEC) are closed</li>
                  </ul>
                </Box>
              </Section>

              <Section title="4. The fork+exec Pattern" id="c7-forkexec" checked={!!checked['c7-forkexec']} onCheck={() => toggleCheck('c7-forkexec')}>
                <p>The standard way to run an external command from C:</p>

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
                  <p className="font-bold">Why fork before exec?</p>
                  <p>Without fork, exec replaces YOUR program — you never get control back. fork first, then exec in the child. The parent survives and can wait for the result. This is exactly how the shell runs every command you type.</p>
                </Box>
              </Section>

              <Section title="5. File Descriptors & Redirection" id="c7-redirect" checked={!!checked['c7-redirect']} onCheck={() => toggleCheck('c7-redirect')}>
                <Box type="formula">
                  <p className="font-bold">dup() and dup2() — duplicate file descriptors:</p>
                  <Code>{`int dup(int oldfd);            // returns new fd pointing to same file
int dup2(int oldfd, int newfd); // make newfd point where oldfd points

// Redirect stdout to a file BEFORE exec:
int fd = open("output.txt", O_WRONLY|O_CREAT|O_TRUNC, 0644);
dup2(fd, STDOUT_FILENO);  // stdout (fd 1) now goes to output.txt
close(fd);                 // close original fd (stdout still open)
execl("/bin/ls", "ls", "-l", NULL);
// ls writes to output.txt, not the terminal!`}</Code>
                </Box>

                <p className="font-bold mt-2">Example — exec a script:</p>
                <Code>{`// Scripts work too! The kernel reads the shebang:
execl("./my_script.sh", "my_script.sh", "arg1", NULL);
// This actually runs: /bin/bash ./my_script.sh arg1
// (assuming #!/bin/bash is the first line of my_script.sh)`}</Code>

                <Box type="definition">
                  <p className="font-bold">system() — convenience wrapper:</p>
                  <Code>{`#include <stdlib.h>
int ret = system("ls -l /home ; rm -i temp.txt");
// Equivalent to: fork + exec /bin/sh -c "command" + wait
// Simpler but less control than manual fork+exec`}</Code>
                </Box>
              </Section>

              <Section title="Cheat Sheet" id="c7-cheat" checked={!!checked['c7-cheat']} onCheck={() => toggleCheck('c7-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">exec naming</p><p>l=list, v=vector, p=PATH, e=env</p><p>execve = the actual syscall</p></Box>
                  <Box type="formula"><p className="font-bold">Key behavior</p><p>Does NOT create new process</p><p>Replaces code+data+stack</p><p>Never returns on success (-1 on fail)</p></Box>
                  <Box type="formula"><p className="font-bold">Survives exec</p><p>PID, PPID, open fds, UID/GID</p><p>cwd, umask, signal mask</p></Box>
                  <Box type="formula"><p className="font-bold">Lost at exec</p><p>Signal handlers (reset to default)</p><p>stdio buffers (call fflush first!)</p><p>FD_CLOEXEC fds, memory maps</p></Box>
                  <Box type="formula"><p className="font-bold">Redirection</p><p>dup(fd), dup2(old, new)</p><p>Set up before exec in child</p></Box>
                  <Box type="formula"><p className="font-bold">Pattern</p><p>fork → child: setup + exec</p><p>parent: wait + inspect status</p><p>system("cmd") = fork+exec+wait</p></Box>
                </div>
              </Section>

              <Section title="Self-Test (10 Questions)" id="c7-quiz" checked={!!checked['c7-quiz']} onCheck={() => toggleCheck('c7-quiz')}>
                <Toggle question="1. Does exec() create a new process?" answer="No. exec() REPLACES the current process's program image. Same PID, same parent. It is not process creation — that's fork(). exec is process transformation." />
                <Toggle question="2. What happens to code written after a successful exec() call?" answer="It never executes. A successful exec() completely replaces the program — there is no return. Code after exec() only runs if exec FAILED (returned -1)." />
                <Toggle question="3. What do the letters l, v, p, e mean in exec function names?" answer="l = args as list (variadic), v = args as vector (array), p = search PATH for the executable, e = provide custom environment variables. So execlp = list args + PATH search." />
                <Toggle question="4. Why must the last argument to execl() be NULL?" answer="The variadic argument list has no inherent length information. NULL serves as the sentinel/terminator so the function knows where the argument list ends. Forgetting NULL causes undefined behavior." />
                <Toggle question="5. What happens to stdio buffers when you call exec()?" answer="They are LOST. exec replaces all user-space memory. Unflushed fprintf/printf data disappears. Always call fflush(NULL) before exec()." />
                <Toggle question="6. How does the shell implement 'ls > output.txt'?" answer="fork() → in child: open('output.txt'), dup2(fd, STDOUT_FILENO), close(fd), then exec('ls'). The ls command writes to stdout which now points to the file. Parent waits." />
                <Toggle question="7. What is FD_CLOEXEC and when should you use it?" answer="A flag on a file descriptor that causes it to be automatically closed when exec() is called. Use it on fds that the new program shouldn't inherit (e.g., lock files, server sockets). Set via fcntl() or O_CLOEXEC flag in open()." />
                <Toggle question="8. What is the difference between execl and execlp?" answer="execl requires the full path to the executable (e.g., '/bin/ls'). execlp searches the PATH environment variable, so you can just say 'ls'. Without p, the file must be in the current directory or specified by path." />
                <Toggle question="9. Why use exit(10) after a failed exec, not exit(1)?" answer="Commands like ls use exit codes 0, 1, 2 for their own purposes. Using a distinctive code like 10 lets the parent distinguish 'exec itself failed' from 'the command ran but returned an error code'." />
                <Toggle question="10. What does system('ls -l') do internally?" answer={<span>It calls <code>fork()</code>, then in the child: <code>execl("/bin/sh", "sh", "-c", "ls -l", NULL)</code>, and the parent calls <code>waitpid()</code>. It spawns a shell to parse and execute the command string.</span>} />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 8 ==================== */}
            <CourseBlock title="Course 8: Memory-Mapped Files, Shared Memory & Semaphores" id="c8">
              <p className="mb-3 text-sm opacity-80">Source: OS(8) - Programare de sistem in C pentru Linux (V), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">Roadmap:</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Memory-mapped files — concept and motivation</li>
                  <li>mmap() — creating file mappings</li>
                  <li>munmap() — removing mappings</li>
                  <li>MAP_PRIVATE vs MAP_SHARED</li>
                  <li>msync() — flushing changes to disk</li>
                  <li>Non-persistent mappings (anonymous & named shared memory)</li>
                  <li>POSIX shared memory API (shm_open, ftruncate, mmap)</li>
                  <li>IPC models: shared memory vs message passing</li>
                  <li>Cooperation patterns (Producer-Consumer, Supervisor-Workers, etc.)</li>
                  <li>POSIX semaphores (named and unnamed)</li>
                </ol>
              </Box>

              <Section title="1. Memory-Mapped Files Concept" id="c8-concept" checked={!!checked['c8-concept']} onCheck={() => toggleCheck('c8-concept')}>
                <p>A <strong>memory-mapped file</strong> creates a direct byte-to-byte correspondence between a region of a process's virtual address space and a portion of a file on disk.</p>

                <svg viewBox="0 0 440 160" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="20" y="10" width="160" height="80" rx="6" fill="#3b82f6" opacity="0.1" stroke="#3b82f6"/>
                  <text x="100" y="28" textAnchor="middle" fill="#3b82f6" fontWeight="bold">Process virtual memory</text>
                  <rect x="40" y="40" width="120" height="30" rx="4" fill="#f59e0b" opacity="0.2" stroke="#f59e0b"/>
                  <text x="100" y="60" textAnchor="middle" fill="#f59e0b" fontSize="9">mapped region</text>
                  <rect x="260" y="30" width="160" height="40" rx="6" fill="#10b981" opacity="0.1" stroke="#10b981"/>
                  <text x="340" y="48" textAnchor="middle" fill="#10b981" fontSize="9">Open file (fd)</text>
                  <rect x="280" y="52" width="50" height="14" rx="2" fill="#f59e0b" opacity="0.3" stroke="#f59e0b"/>
                  <text x="305" y="63" textAnchor="middle" fill="#f59e0b" fontSize="7">offset</text>
                  <rect x="332" y="52" width="70" height="14" rx="2" fill="#f59e0b" opacity="0.3" stroke="#f59e0b"/>
                  <text x="367" y="63" textAnchor="middle" fill="#f59e0b" fontSize="7">length</text>
                  <line x1="160" y1="55" x2="260" y2="55" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arr)"/>
                  <text x="210" y="50" textAnchor="middle" fill="#f59e0b" fontSize="8">1:1 mapping</text>
                  <text x="220" y="100" textAnchor="middle" fill="currentColor" fontSize="9">Read/write memory = read/write file</text>
                  <text x="220" y="115" textAnchor="middle" fill="currentColor" fontSize="9">No need for read()/write() syscalls!</text>
                  <text x="220" y="140" textAnchor="middle" fill="#10b981" fontSize="9">Backing store = the file itself (not swap)</text>
                </svg>

                <Box type="theorem">
                  <p className="font-bold">Why use mmap?</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Access file contents <strong>directly in memory</strong> (pointer arithmetic, no read/write calls)</li>
                    <li>Multiple processes can mmap the same file → <strong>shared memory IPC</strong></li>
                    <li>Kernel handles page faults to load data on demand (efficient for large files)</li>
                  </ul>
                </Box>
              </Section>

              <Section title="2. mmap() and munmap()" id="c8-mmap" checked={!!checked['c8-mmap']} onCheck={() => toggleCheck('c8-mmap')}>
                <Box type="formula">
                  <p className="font-bold">mmap — create a mapping:</p>
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
                  <p className="font-bold">munmap — remove a mapping:</p>
                  <Code>{`int munmap(void* addr, size_t length);
// addr = value returned by mmap (page-aligned)
// Returns 0 on success, -1 on error
// WARNING: does NOT auto-flush dirty pages!`}</Code>
                </Box>

                <p className="font-bold mt-2">Example — read a file via mmap:</p>
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

              <Section title="3. MAP_PRIVATE vs MAP_SHARED" id="c8-flags" checked={!!checked['c8-flags']} onCheck={() => toggleCheck('c8-flags')}>
                <Box type="theorem">
                  <p className="font-bold">The critical distinction:</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="text-left p-1">Feature</th><th className="text-left p-1">MAP_PRIVATE</th><th className="text-left p-1">MAP_SHARED</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">Writes visible to other processes?</td><td className="p-1 text-red-400">No</td><td className="p-1 text-green-400">Yes</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">Writes propagated to disk file?</td><td className="p-1 text-red-400">No (copy-on-write)</td><td className="p-1 text-green-400">Yes (eventually)</td></tr>
                      <tr><td className="p-1">Use case</td><td className="p-1">Read-only views, private scratch</td><td className="p-1">IPC, persistent modification</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="formula">
                  <p className="font-bold">msync — force flush to disk:</p>
                  <Code>{`int msync(void* addr, size_t length, int flags);
// flags: MS_SYNC (blocking) or MS_ASYNC (non-blocking)
//        optionally | MS_INVALIDATE

// ALWAYS msync before munmap for shared mappings!
msync(map, length, MS_SYNC);
munmap(map, length);`}</Code>
                </Box>

                <Box type="warning">
                  <p className="font-bold">Critical trap:</p>
                  <p><code>munmap()</code> does <strong>NOT</strong> flush dirty pages. If you munmap a shared mapping without calling msync first, your last writes may be lost. The kernel flushes eventually, but not guaranteed before munmap returns.</p>
                </Box>

                <Box type="warning">
                  <p className="font-bold">Page boundary trap:</p>
                  <p>If <code>length</code> is not a multiple of page size (4096), the remaining bytes in the last page are zero-filled. Writes to these "extra" bytes succeed but are <strong>NOT</strong> propagated to the disk file.</p>
                </Box>
              </Section>

              <Section title="4. Non-Persistent Mappings & POSIX Shared Memory" id="c8-shm" checked={!!checked['c8-shm']} onCheck={() => toggleCheck('c8-shm')}>
                <Box type="definition">
                  <p className="font-bold">Two types of mappings:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>File-backed (persistent)</strong>: mmap of a regular file. Data survives in the file.</li>
                    <li><strong>Non-persistent</strong>: no disk file. Data exists only in RAM, lost when all processes unmap.</li>
                  </ul>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Anonymous mapping (related processes via fork):</p>
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
                  <p className="font-bold">Named shared memory (unrelated processes):</p>
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
                  <p className="font-bold">POSIX shared memory objects:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Created with <code>shm_open()</code>, visible under <code>/dev/shm/</code></li>
                    <li><strong>Kernel persistence</strong>: survives until reboot or <code>shm_unlink()</code></li>
                    <li>Must set size with <code>ftruncate()</code> after creation (default size is 0)</li>
                  </ul>
                </Box>
              </Section>

              <Section title="5. IPC Models & Cooperation Patterns" id="c8-ipc" checked={!!checked['c8-ipc']} onCheck={() => toggleCheck('c8-ipc')}>
                <svg viewBox="0 0 460 130" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="10" width="200" height="50" rx="6" fill="#3b82f6" opacity="0.1" stroke="#3b82f6"/>
                  <text x="110" y="28" textAnchor="middle" fill="#3b82f6" fontWeight="bold">Shared Memory Model</text>
                  <text x="110" y="43" textAnchor="middle" fill="currentColor" fontSize="9">mmap, shm_open, anonymous maps</text>
                  <text x="110" y="53" textAnchor="middle" fill="currentColor" fontSize="8">Needs synchronization (semaphores)</text>
                  <rect x="250" y="10" width="200" height="50" rx="6" fill="#10b981" opacity="0.1" stroke="#10b981"/>
                  <text x="350" y="28" textAnchor="middle" fill="#10b981" fontWeight="bold">Message Passing Model</text>
                  <text x="350" y="43" textAnchor="middle" fill="currentColor" fontSize="9">pipes, fifos, message queues, sockets</text>
                  <text x="350" y="53" textAnchor="middle" fill="currentColor" fontSize="8">Implicit synchronization (blocking I/O)</text>
                  <text x="110" y="80" fill="currentColor" fontSize="9">Patterns: Producer-Consumer,</text>
                  <text x="110" y="93" fill="currentColor" fontSize="9">Readers-Writers (CREW),</text>
                  <text x="110" y="106" fill="currentColor" fontSize="9">Critical Section, Supervisor-Workers</text>
                </svg>

                <Box type="warning">
                  <p className="font-bold">Data race with shared memory:</p>
                  <p>Shared memory has NO built-in synchronization. If producer writes while consumer reads, the consumer may see partially-written (corrupted) data. Use <strong>semaphores</strong> to coordinate access.</p>
                </Box>
              </Section>

              <Section title="6. POSIX Semaphores" id="c8-sem" checked={!!checked['c8-sem']} onCheck={() => toggleCheck('c8-sem')}>
                <Box type="definition">
                  <p>A <strong>semaphore</strong> is a non-negative integer counter. Two atomic operations: <code>sem_wait</code> (decrement, blocks if 0) and <code>sem_post</code> (increment, never blocks).</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Named semaphores (any processes):</p>
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
                  <p className="font-bold">Unnamed semaphores (related processes, in shared memory):</p>
                  <Code>{`// Place semaphore IN shared memory region:
sem_t* sem = (sem_t*) shm_ptr;
sem_init(sem, 1, 1);  // 1=shared between processes, initial=1
// ... use sem_wait/sem_post ...
sem_destroy(sem);`}</Code>
                </Box>

                <p className="font-bold mt-2">Example — mutex with named semaphore:</p>
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

              <Section title="Cheat Sheet" id="c8-cheat" checked={!!checked['c8-cheat']} onCheck={() => toggleCheck('c8-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">mmap</p><p>mmap(NULL, len, prot, flags, fd, off)</p><p>munmap(addr, len)</p><p>msync(addr, len, MS_SYNC)</p></Box>
                  <Box type="formula"><p className="font-bold">Flags</p><p>MAP_SHARED vs MAP_PRIVATE</p><p>MAP_ANONYMOUS (no file)</p><p>PROT_READ | PROT_WRITE</p></Box>
                  <Box type="formula"><p className="font-bold">POSIX shm</p><p>shm_open, ftruncate, mmap</p><p>shm_unlink (cleanup)</p><p>Objects in /dev/shm/</p></Box>
                  <Box type="formula"><p className="font-bold">Semaphores</p><p>sem_open/sem_close/sem_unlink (named)</p><p>sem_init/sem_destroy (unnamed)</p><p>sem_wait (P), sem_post (V)</p></Box>
                </div>
              </Section>

              <Section title="Self-Test (10 Questions)" id="c8-quiz" checked={!!checked['c8-quiz']} onCheck={() => toggleCheck('c8-quiz')}>
                <Toggle question="1. What is the fundamental advantage of mmap over read/write?" answer="With mmap, file contents are accessed directly in memory via pointer operations — no system calls needed for each read/write. The kernel handles loading pages on demand via page faults." />
                <Toggle question="2. Can you close the fd immediately after mmap?" answer="Yes. The mapping remains valid even after closing the file descriptor. The kernel maintains its own reference to the file's inode." />
                <Toggle question="3. What happens if you write to a MAP_PRIVATE mapping?" answer="The write uses copy-on-write: the kernel creates a private copy of the affected page. The change is NOT visible to other processes and NOT propagated to the disk file. It goes to swap if evicted." />
                <Toggle question="4. Why must you call msync before munmap on a shared mapping?" answer="munmap does NOT flush dirty pages. Without msync, the last writes in memory may not be saved to the disk file. The kernel MAY flush them eventually, but it's not guaranteed before munmap returns." />
                <Toggle question="5. What is the offset parameter requirement for mmap?" answer="It must be a multiple of the system page size (typically 4096 bytes). If you need to map from a non-aligned offset, round down and adjust your pointer arithmetic." />
                <Toggle question="6. How do you create shared memory between unrelated processes?" answer="Use shm_open() to create a named shared memory object, ftruncate() to set its size, then mmap() with MAP_SHARED. The other process uses shm_open() with the same name. Clean up with shm_unlink()." />
                <Toggle question="7. What is the difference between anonymous shared and anonymous private mappings?" answer="MAP_SHARED|MAP_ANONYMOUS: shared between parent and child (after fork). Used for IPC. MAP_PRIVATE|MAP_ANONYMOUS: private to the process, used for memory allocation (this is what malloc uses internally for large allocations)." />
                <Toggle question="8. Why do POSIX shared memory objects need ftruncate after creation?" answer="A newly created shared memory object has size 0. You MUST call ftruncate() to set its size before mapping it. Mapping a zero-size object would be useless (or cause errors)." />
                <Toggle question="9. What does sem_wait do when the semaphore value is 0?" answer="It BLOCKS (the calling process/thread sleeps) until another process/thread calls sem_post to increment the value above 0. This is the fundamental blocking mechanism for synchronization." />
                <Toggle question="10. Where are named semaphores and shared memory objects stored in Linux?" answer="Both are stored in /dev/shm/ (a tmpfs virtual filesystem in RAM). Named semaphores appear as sem.name files. They persist until the system reboots or are explicitly unlinked." />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 9 ==================== */}
            <CourseBlock title="Course 9: IPC via Pipes (Anonymous & Named)" id="c9">
              <p className="mb-3 text-sm opacity-80">Source: OS(9) - Programare de sistem in C pentru Linux (VI), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">Roadmap:</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Pipes as FIFO communication channels</li>
                  <li>Anonymous pipes: pipe() system call</li>
                  <li>Usage pattern: pipe → fork → close unused ends</li>
                  <li>Named pipes (fifos): mkfifo()</li>
                  <li>Blocking behavior of open, read, write on pipes</li>
                  <li>Non-persistent data in fifos</li>
                  <li>Non-blocking mode (O_NONBLOCK)</li>
                  <li>Communication patterns: 1-to-1, 1-to-N, N-to-1, N-to-N</li>
                  <li>Applications: semaphores via fifos, client/server architecture</li>
                </ol>
              </Box>

              <Section title="1. Pipe Fundamentals" id="c9-fund" checked={!!checked['c9-fund']} onCheck={() => toggleCheck('c9-fund')}>
                <Box type="definition">
                  <p>A <strong>pipe</strong> is a unidirectional FIFO buffer managed by the kernel. Data written at one end is read (and consumed) at the other. Capacity is limited (typically 64KB on Linux).</p>
                </Box>

                <svg viewBox="0 0 400 100" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="30" y="25" width="80" height="35" rx="6" fill="#3b82f6" opacity="0.15" stroke="#3b82f6"/>
                  <text x="70" y="47" textAnchor="middle" fill="#3b82f6">Writer</text>
                  <rect x="290" y="25" width="80" height="35" rx="6" fill="#10b981" opacity="0.15" stroke="#10b981"/>
                  <text x="330" y="47" textAnchor="middle" fill="#10b981">Reader</text>
                  <rect x="140" y="30" width="120" height="25" rx="12" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="1.5"/>
                  <text x="200" y="47" textAnchor="middle" fill="#f59e0b" fontSize="9">FIFO buffer</text>
                  <line x1="110" y1="42" x2="140" y2="42" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <line x1="260" y1="42" x2="290" y2="42" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <text x="125" y="37" fill="currentColor" fontSize="8">write</text>
                  <text x="275" y="37" fill="currentColor" fontSize="8">read</text>
                  <text x="200" y="80" textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.6">Unidirectional, FIFO order, read = consume</text>
                </svg>

                <Box type="theorem">
                  <p className="font-bold">Anonymous vs named pipes:</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="p-1">Feature</th><th className="p-1">Anonymous (pipe)</th><th className="p-1">Named (fifo)</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">Creation</td><td className="p-1 font-mono">pipe(pfd)</td><td className="p-1 font-mono">mkfifo(path, mode)</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">Who can use</td><td className="p-1">Related processes (fork/exec)</td><td className="p-1">Any process (knows the name)</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">Filesystem entry</td><td className="p-1">None</td><td className="p-1">Yes (special file)</td></tr>
                      <tr><td className="p-1">Reopenable</td><td className="p-1 text-red-400">No</td><td className="p-1 text-green-400">Yes</td></tr>
                    </tbody>
                  </table>
                </Box>
              </Section>

              <Section title="2. Anonymous Pipes" id="c9-anon" checked={!!checked['c9-anon']} onCheck={() => toggleCheck('c9-anon')}>
                <Box type="formula">
                  <p className="font-bold">pipe() — create anonymous pipe:</p>
                  <Code>{`int pfd[2];
pipe(pfd);
// pfd[0] = read end
// pfd[1] = write end
// Both ends open in calling process`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Standard pattern: pipe → fork → close unused ends:</p>
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
                  <p className="font-bold">Why close unused ends?</p>
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>Read EOF</strong>: The reader only gets EOF (read returns 0) when ALL write ends are closed. If the reader still has the write end open, it blocks forever.</li>
                    <li><strong>SIGPIPE</strong>: A writer to a pipe with no readers gets killed by SIGPIPE. If the writer still has the read end open, the kernel won't send SIGPIPE.</li>
                  </ol>
                </Box>
              </Section>

              <Section title="3. Named Pipes (FIFOs)" id="c9-fifo" checked={!!checked['c9-fifo']} onCheck={() => toggleCheck('c9-fifo')}>
                <Box type="formula">
                  <p className="font-bold">mkfifo — create a named pipe:</p>
                  <Code>{`int mkfifo(const char* path, mode_t mode);
// Creates a special file in the filesystem
// Does NOT open it (unlike pipe() which opens both ends)`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Usage pattern:</p>
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
                  <p className="font-bold">Blocking open:</p>
                  <p>Opening a fifo for read-only <strong>blocks</strong> until another process opens it for writing (and vice versa). They must "rendezvous". Exception: opening with O_RDWR never blocks (both ends in one process), or use O_NONBLOCK.</p>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">Data persistence in fifos:</p>
                  <p>Data in a fifo is stored <strong>in RAM only</strong> (not on disk), and only while at least one process has the fifo open. When all processes close both ends, unread data is <strong>lost</strong>. The fifo file itself persists in the filesystem, but its data does not.</p>
                </Box>
              </Section>

              <Section title="4. Blocking Behavior" id="c9-block" checked={!!checked['c9-block']} onCheck={() => toggleCheck('c9-block')}>
                <Box type="formula">
                  <p className="font-bold">Default (blocking) behavior summary:</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="p-1">Operation</th><th className="p-1">Condition</th><th className="p-1">Behavior</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">read</td><td className="p-1">Pipe empty</td><td className="p-1">Blocks until data or EOF</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">read</td><td className="p-1">All writers closed</td><td className="p-1">Returns 0 (EOF)</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1">write</td><td className="p-1">Pipe full</td><td className="p-1">Blocks until space</td></tr>
                      <tr><td className="p-1">write</td><td className="p-1">All readers closed</td><td className="p-1"><strong>SIGPIPE</strong> → process killed!</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Non-blocking mode:</p>
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
                  <p className="font-bold">Buffer-ized I/O trap:</p>
                  <p>Using <code>fprintf/fwrite</code> on pipes: data sits in the user-space buffer until flushed! A reader blocks waiting for data that's already "written" but stuck in the writer's buffer. Always <code>fflush()</code> after writing to a pipe with stdio functions.</p>
                </Box>
              </Section>

              <Section title="5. Communication Patterns" id="c9-patterns" checked={!!checked['c9-patterns']} onCheck={() => toggleCheck('c9-patterns')}>
                <Box type="definition">
                  <p className="font-bold">Four patterns by writer/reader count:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>1-to-1</strong>: simplest, no synchronization issues</li>
                    <li><strong>1-to-N</strong>: one writer, multiple readers. Issues: message length (variable-length needs header), message destination (which reader gets which message?)</li>
                    <li><strong>N-to-1</strong>: multiple writers, one reader. Issues: message integrity (writes ≤ PIPE_BUF bytes are atomic), sender identification (add header)</li>
                    <li><strong>N-to-N</strong>: combines all issues above</li>
                  </ul>
                </Box>

                <Box type="theorem">
                  <p className="font-bold">Atomic write guarantee (POSIX):</p>
                  <p>A write of <strong>≤ PIPE_BUF bytes</strong> (at least 512, typically 4096 on Linux) to a pipe is <strong>atomic</strong> — it will not be interleaved with writes from other processes. Writes &gt; PIPE_BUF may be split and interleaved.</p>
                </Box>

                <p className="font-bold mt-2">Tip for N-to-1 with variable-length messages:</p>
                <Code>{`// Use a fixed-size header:
struct message {
    int sender_pid;
    int payload_length;
    // followed by payload_length bytes of actual data
};
// Write header+payload in one write() call to ensure atomicity
// (if total size <= PIPE_BUF)`}</Code>
              </Section>

              <Section title="6. Applications" id="c9-apps" checked={!!checked['c9-apps']} onCheck={() => toggleCheck('c9-apps')}>
                <Box type="definition">
                  <p className="font-bold">Semaphore via fifo:</p>
                  <p className="text-sm">Create a fifo, write 1 byte (init). <code>wait()</code> = read 1 byte (blocks if empty). <code>signal()</code> = write 1 byte. The blocking read behavior gives us semaphore semantics for free.</p>
                </Box>

                <Box type="definition">
                  <p className="font-bold">Client/Server via fifos:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Server creates a <strong>well-known fifo</strong> and listens for requests</li>
                    <li>Each client connects to the well-known fifo and sends a request with its PID</li>
                    <li>Server creates a <strong>per-client fifo</strong> (e.g., <code>/tmp/resp.PID</code>) to send the reply</li>
                    <li><strong>Iterative server</strong>: serves one client at a time. <strong>Concurrent server</strong>: forks a worker per client</li>
                  </ul>
                </Box>
              </Section>

              <Section title="Cheat Sheet" id="c9-cheat" checked={!!checked['c9-cheat']} onCheck={() => toggleCheck('c9-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">Anonymous pipe</p><p>pipe(pfd) → pfd[0]=read, pfd[1]=write</p><p>Must pipe() BEFORE fork()</p><p>Close unused ends!</p></Box>
                  <Box type="formula"><p className="font-bold">Named pipe</p><p>mkfifo(path, mode)</p><p>open() blocks until both ends open</p><p>Data non-persistent (RAM only)</p></Box>
                  <Box type="formula"><p className="font-bold">Blocking rules</p><p>Read empty → block (or EOF if no writers)</p><p>Write full → block</p><p>Write no readers → SIGPIPE!</p></Box>
                  <Box type="formula"><p className="font-bold">Atomicity</p><p>write ≤ PIPE_BUF = atomic</p><p>PIPE_BUF ≥ 512 (Linux: 4096)</p><p>Larger writes may interleave</p></Box>
                </div>
              </Section>

              <Section title="Self-Test (10 Questions)" id="c9-quiz" checked={!!checked['c9-quiz']} onCheck={() => toggleCheck('c9-quiz')}>
                <Toggle question="1. Why must you create the pipe BEFORE fork?" answer="Because the child needs to inherit both file descriptors (pfd[0] and pfd[1]) from the parent. After fork, both processes have copies. If you pipe() after fork, only the calling process has the descriptors — the other can't access the pipe." />
                <Toggle question="2. What happens if you don't close the unused write end in the reader?" answer="The reader will NEVER see EOF. read() returns 0 (EOF) only when ALL write-end descriptors are closed. Since the reader still has a write end open, read blocks forever when the pipe empties." />
                <Toggle question="3. Can unrelated processes use an anonymous pipe?" answer="No. Anonymous pipes have no name/path — the only way to share the descriptors is through fork (inheritance) or exec (fd inheritance). Use named pipes (fifos) for unrelated processes." />
                <Toggle question="4. What signal is sent when writing to a pipe with no readers?" answer="SIGPIPE (signal 13). Default action: terminate the process. This is why you see processes silently die when piping to 'head' — head closes its stdin after reading enough lines, and the writer gets SIGPIPE." />
                <Toggle question="5. Is data in a fifo persistent on disk?" answer="No. Despite having a filename in the filesystem, the data in a fifo exists only in kernel memory (RAM). When all processes close the fifo, unread data is lost. The file entry persists, but the data does not." />
                <Toggle question="6. What does the blocking open of a fifo mean?" answer="Opening a fifo for O_RDONLY blocks until another process opens it for O_WRONLY (and vice versa). They must 'rendezvous'. This is different from regular files where open always succeeds immediately." />
                <Toggle question="7. When are pipe writes atomic?" answer="When the write size is ≤ PIPE_BUF bytes (POSIX guarantees ≥ 512, Linux uses 4096). Atomic means the bytes won't be interleaved with bytes from another writer. Writes > PIPE_BUF may be split." />
                <Toggle question="8. Why is fflush() critical when using fprintf on pipes?" answer="fprintf writes to a user-space buffer, NOT directly to the pipe. Without fflush(), the data sits in the buffer. The reader blocks waiting for data that the writer thinks it has already sent. This is a very common and hard-to-debug mistake." />
                <Toggle question="9. How would you implement bidirectional communication with pipes?" answer="Use TWO pipes: one for each direction. A single pipe is unidirectional. Pipe1: parent→child. Pipe2: child→parent. Each process closes the unused ends of both pipes." />
                <Toggle question="10. How can you implement a semaphore using a fifo?" answer="Create a fifo. Initialize: write N bytes (for semaphore value N). sem_wait: read 1 byte (blocks if empty = value is 0). sem_post: write 1 byte. The blocking read semantics give you semaphore behavior." />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 10 ==================== */}
            <CourseBlock title="Course 10: POSIX Signals" id="c10">
              <p className="mb-3 text-sm opacity-80">Source: OS(10) - Programare de sistem in C pentru Linux (VII), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">Roadmap:</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>What is a signal — software interrupt concept</li>
                  <li>Signal categories: errors, external events, explicit requests</li>
                  <li>Synchronous vs asynchronous signals</li>
                  <li>Generating signals: kill(), raise()</li>
                  <li>Predefined signal types (SIGINT, SIGKILL, SIGSEGV, etc.)</li>
                  <li>Signal handling: default, ignore, custom handler</li>
                  <li>signal() — configuring handlers</li>
                  <li>Writing safe signal handlers</li>
                  <li>Blocking signals: sigprocmask(), sigpending()</li>
                  <li>Waiting for signals: pause(), sigsuspend()</li>
                </ol>
              </Box>

              <Section title="1. What is a Signal?" id="c10-what" checked={!!checked['c10-what']} onCheck={() => toggleCheck('c10-what')}>
                <Box type="definition">
                  <p>A <strong>signal</strong> is a software interrupt generated when an exceptional event occurs, delivered by the OS to a specific process. Each signal has a <strong>type</strong> (integer) and a <strong>destination process</strong>.</p>
                </Box>

                <svg viewBox="0 0 450 140" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="15" width="110" height="35" rx="5" fill="#ef4444" opacity="0.12" stroke="#ef4444"/>
                  <text x="65" y="30" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">Errors</text>
                  <text x="65" y="42" textAnchor="middle" fill="currentColor" fontSize="8">SIGSEGV, SIGFPE</text>
                  <rect x="10" y="58" width="110" height="35" rx="5" fill="#3b82f6" opacity="0.12" stroke="#3b82f6"/>
                  <text x="65" y="73" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="bold">External events</text>
                  <text x="65" y="85" textAnchor="middle" fill="currentColor" fontSize="8">SIGCHLD, SIGINT</text>
                  <rect x="10" y="100" width="110" height="35" rx="5" fill="#10b981" opacity="0.12" stroke="#10b981"/>
                  <text x="65" y="115" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">Explicit requests</text>
                  <text x="65" y="127" textAnchor="middle" fill="currentColor" fontSize="8">kill(), raise()</text>
                  <line x1="120" y1="75" x2="180" y2="75" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)"/>
                  <rect x="180" y="55" width="80" height="40" rx="6" fill="#f59e0b" opacity="0.15" stroke="#f59e0b"/>
                  <text x="220" y="72" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">Signal</text>
                  <text x="220" y="85" textAnchor="middle" fill="currentColor" fontSize="8">queue</text>
                  <line x1="260" y1="75" x2="310" y2="75" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)"/>
                  <rect x="310" y="55" width="120" height="40" rx="6" fill="currentColor" opacity="0.06" stroke="currentColor" strokeWidth="1"/>
                  <text x="370" y="72" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="bold">Process</text>
                  <text x="370" y="85" textAnchor="middle" fill="currentColor" fontSize="8">→ handler executes</text>
                </svg>

                <Box type="theorem">
                  <p className="font-bold">Synchronous vs asynchronous:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>Synchronous</strong>: caused by the process itself (division by zero → SIGFPE, bad pointer → SIGSEGV). Delivered during the triggering action.</li>
                    <li><strong>Asynchronous</strong>: caused by external events (user presses Ctrl+C → SIGINT, another process calls kill()). Arrives at unpredictable times.</li>
                  </ul>
                </Box>
              </Section>

              <Section title="2. Generating Signals" id="c10-gen" checked={!!checked['c10-gen']} onCheck={() => toggleCheck('c10-gen')}>
                <Box type="formula">
                  <p className="font-bold">From C code:</p>
                  <Code>{`#include <signal.h>
int kill(pid_t pid, int sig);
// Send signal 'sig' to process 'pid'
// Returns 0 on success, -1 on error
// kill(pid, 0) — test if process exists (no signal sent)

int raise(int sig);
// Send signal to SELF. Equivalent to: kill(getpid(), sig)`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">From the command line:</p>
                  <Code>{`$ kill -SIGTERM 1234     # send SIGTERM to PID 1234
$ kill -9 1234          # send SIGKILL (9) to PID 1234
$ kill -l               # list all signal numbers and names
$ killall -SIGINT myprg # send SIGINT to all processes named "myprg"`}</Code>
                </Box>

                <Box type="definition">
                  <p className="font-bold">Common keyboard signals:</p>
                  <table className="text-sm mt-1">
                    <tbody>
                      <tr><td className="pr-4 font-mono">Ctrl+C</td><td>SIGINT (2) — interrupt</td></tr>
                      <tr><td className="font-mono">Ctrl+\</td><td>SIGQUIT (3) — quit with core dump</td></tr>
                      <tr><td className="font-mono">Ctrl+Z</td><td>SIGTSTP (20) — suspend/stop</td></tr>
                    </tbody>
                  </table>
                </Box>
              </Section>

              <Section title="3. Signal Types" id="c10-types" checked={!!checked['c10-types']} onCheck={() => toggleCheck('c10-types')}>
                <Box type="formula">
                  <p className="font-bold">Key predefined signals:</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="p-1">Signal</th><th className="p-1">Default</th><th className="p-1">Meaning</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGINT (2)</td><td className="p-1">Terminate</td><td className="p-1">Ctrl+C interrupt</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGQUIT (3)</td><td className="p-1">Core dump</td><td className="p-1">Ctrl+\ quit</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGKILL (9)</td><td className="p-1">Terminate</td><td className="p-1">Force kill (<strong>cannot be caught!</strong>)</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGSEGV (11)</td><td className="p-1">Core dump</td><td className="p-1">Invalid memory access</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGPIPE (13)</td><td className="p-1">Terminate</td><td className="p-1">Write to pipe with no reader</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGALRM (14)</td><td className="p-1">Terminate</td><td className="p-1">Timer alarm (alarm())</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGTERM (15)</td><td className="p-1">Terminate</td><td className="p-1">Graceful termination request</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGCHLD (17)</td><td className="p-1">Ignore</td><td className="p-1">Child terminated/stopped</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGSTOP (19)</td><td className="p-1">Stop</td><td className="p-1">Suspend process (<strong>cannot be caught!</strong>)</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">SIGCONT (18)</td><td className="p-1">Continue</td><td className="p-1">Resume stopped process</td></tr>
                      <tr><td className="p-1 font-mono">SIGUSR1/2</td><td className="p-1">Terminate</td><td className="p-1">User-defined (application use)</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="warning">
                  <p className="font-bold">Uncatchable signals:</p>
                  <p><code>SIGKILL</code> and <code>SIGSTOP</code> can <strong>never</strong> be caught, ignored, or blocked. They are the OS's guarantee of being able to terminate or stop any process.</p>
                </Box>
              </Section>

              <Section title="4. Signal Handling with signal()" id="c10-handle" checked={!!checked['c10-handle']} onCheck={() => toggleCheck('c10-handle')}>
                <p>Three possible reactions when a signal arrives:</p>
                <Box type="definition">
                  <ol className="list-decimal pl-5 text-sm">
                    <li><strong>Default action</strong> (SIG_DFL) — terminate, core dump, ignore, or stop</li>
                    <li><strong>Ignore</strong> (SIG_IGN) — signal is discarded</li>
                    <li><strong>Custom handler</strong> — your function runs, then process resumes</li>
                  </ol>
                </Box>

                <Box type="formula">
                  <p className="font-bold">signal() — configure handling:</p>
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

                <p className="font-bold mt-2">Example — custom handler:</p>
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

                <p className="font-bold mt-2">Example — restoring defaults after catching:</p>
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
                  <p className="font-bold">Handler safety:</p>
                  <p>Signal handlers run <strong>asynchronously</strong> — they interrupt your program at unpredictable points. Only call <strong>async-signal-safe</strong> functions inside handlers (write, _exit, etc.). <code>printf</code>, <code>malloc</code>, <code>fprintf</code> are NOT safe. Preferred pattern: set a <code>volatile sig_atomic_t</code> flag in the handler, check it in the main loop.</p>
                </Box>
              </Section>

              <Section title="5. Blocking Signals" id="c10-block" checked={!!checked['c10-block']} onCheck={() => toggleCheck('c10-block')}>
                <p><strong>Blocking</strong> ≠ ignoring. Blocked signals are <strong>queued</strong> and delivered when unblocked. Ignored signals are discarded permanently.</p>

                <Box type="formula">
                  <p className="font-bold">sigprocmask — block/unblock signal types:</p>
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
                  <p className="font-bold">When to block vs ignore:</p>
                  <p>Block signals during critical code sections where interruption would corrupt state. Don't ignore — you'd lose the signal permanently. Blocking defers delivery; ignoring discards it.</p>
                </Box>
              </Section>

              <Section title="6. Waiting for Signals" id="c10-wait" checked={!!checked['c10-wait']} onCheck={() => toggleCheck('c10-wait')}>
                <Box type="formula">
                  <p className="font-bold">pause() — simple wait:</p>
                  <Code>{`int pause(void);
// Suspends process until ANY signal is received
// Always returns -1 with errno = EINTR`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">sigsuspend() — safe wait (preferred):</p>
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
                  <p className="font-bold">Why sigsuspend over pause?</p>
                  <p>With <code>pause()</code>, there's a race condition: the signal might arrive <strong>between</strong> unblocking it and calling pause(), so pause() would miss it and block forever. <code>sigsuspend()</code> is atomic — it changes the mask and suspends in one indivisible operation.</p>
                </Box>
              </Section>

              <Section title="Cheat Sheet" id="c10-cheat" checked={!!checked['c10-cheat']} onCheck={() => toggleCheck('c10-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">Generate</p><p>kill(pid, sig), raise(sig)</p><p>Keyboard: Ctrl+C/\/Z</p></Box>
                  <Box type="formula"><p className="font-bold">Handle</p><p>signal(sig, handler)</p><p>SIG_DFL, SIG_IGN, custom func</p><p>Handler signature: void f(int)</p></Box>
                  <Box type="formula"><p className="font-bold">Block</p><p>sigprocmask(SIG_BLOCK/UNBLOCK/SET)</p><p>sigset_t, sigemptyset, sigaddset</p><p>sigpending — check queued signals</p></Box>
                  <Box type="formula"><p className="font-bold">Wait</p><p>pause() — any signal</p><p>sigsuspend(mask) — atomic, safe</p><p>SIGKILL/SIGSTOP: uncatchable!</p></Box>
                </div>
              </Section>

              <Section title="Self-Test (10 Questions)" id="c10-quiz" checked={!!checked['c10-quiz']} onCheck={() => toggleCheck('c10-quiz')}>
                <Toggle question="1. What is the difference between a signal and a system call?" answer="A system call is a SYNCHRONOUS request from a process to the kernel (the process initiates it). A signal is an ASYNCHRONOUS notification from the kernel (or another process) to a process — it arrives at unpredictable times, interrupting whatever the process is doing." />
                <Toggle question="2. Which two signals can never be caught, ignored, or blocked?" answer="SIGKILL (9) and SIGSTOP (19). They are the OS's unconditional controls: SIGKILL always terminates, SIGSTOP always suspends. This ensures the administrator can always stop a runaway process." />
                <Toggle question="3. What happens if a signal arrives while its handler is already running?" answer="If the SAME signal arrives again, it is blocked until the current handler finishes (one is queued). If a DIFFERENT signal arrives, it CAN interrupt the current handler (nesting). This is why handlers must be kept short." />
                <Toggle question="4. Why is printf() unsafe inside a signal handler?" answer="printf() is NOT async-signal-safe. It uses internal buffers and locks. If the signal interrupts printf() in the main program, calling printf() in the handler can deadlock or corrupt the buffer. Use write() instead, or set a flag." />
                <Toggle question="5. What is the difference between blocking and ignoring a signal?" answer="Ignoring (SIG_IGN): signal is permanently discarded. Blocking (sigprocmask): signal is QUEUED and delivered when unblocked. Blocking preserves the signal; ignoring loses it." />
                <Toggle question="6. What exit status does a process killed by signal N have?" answer="128 + N. For example, SIGKILL (9) → exit status 137. SIGSEGV (11) → exit status 139. You can check with WIFSIGNALED and WTERMSIG macros from wait()." />
                <Toggle question="7. Why is sigsuspend() preferred over pause()?" answer="pause() has a race condition: the signal may arrive between sigprocmask(unblock) and pause(), causing pause to block forever. sigsuspend() atomically changes the mask AND suspends, eliminating the race." />
                <Toggle question="8. What does kill(pid, 0) do?" answer="It doesn't send any signal. It tests whether the process with the given PID exists and whether you have permission to send it signals. Returns 0 if yes, -1 if not. Useful for checking if a process is alive." />
                <Toggle question="9. What signal is sent when you write to a pipe with no readers?" answer="SIGPIPE (13). Default action: terminate the process. This connects to Course 9 — it's why closing unused pipe ends matters. You can catch SIGPIPE to handle the situation gracefully instead of dying." />
                <Toggle question="10. After exec(), what happens to signal handlers?" answer="Custom handlers are RESET to SIG_DFL (because the handler code no longer exists in the new program). Signals set to SIG_IGN remain ignored. The signal mask (blocked signals) is preserved." />
              </Section>
            </CourseBlock>

            {/* ==================== COURSE 11 ==================== */}
            <CourseBlock title="Course 11: NCURSES & Terminal Management" id="c11">
              <p className="mb-3 text-sm opacity-80">Source: OS(11) - Programare de sistem in C pentru Linux (VIII), Cristian Vidrascu, UAIC</p>

              <Box type="definition">
                <p className="font-bold mb-2">Roadmap:</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Physical screen vs virtual screen concept</li>
                  <li>NCURSES initialization and program structure</li>
                  <li>Windows (WINDOW type) and the stdscr</li>
                  <li>Function naming conventions (w-, mv-, mvw-)</li>
                  <li>Output: addch, addstr, printw, refresh</li>
                  <li>Input: getch, getstr, scanw</li>
                  <li>Attributes and colors</li>
                  <li>Window management: newwin, delwin, box, border</li>
                  <li>Input modes: echo/noecho, cbreak/nocbreak, keypad</li>
                  <li>Scrolling, cursor control, low-level terminal (termios)</li>
                </ol>
              </Box>

              <Section title="1. Physical vs Virtual Screen" id="c11-concept" checked={!!checked['c11-concept']} onCheck={() => toggleCheck('c11-concept')}>
                <Box type="definition">
                  <p><strong>Physical screen</strong> = what you see on the terminal right now. <strong>Virtual screen</strong> = an in-memory image of the screen. All NCURSES I/O operates on the virtual screen. The <code>refresh()</code> call copies changes to the physical screen.</p>
                </Box>

                <svg viewBox="0 0 420 120" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:10}}>
                  <rect x="10" y="20" width="110" height="50" rx="6" fill="#3b82f6" opacity="0.12" stroke="#3b82f6"/>
                  <text x="65" y="40" textAnchor="middle" fill="#3b82f6" fontWeight="bold" fontSize="9">WINDOW</text>
                  <text x="65" y="55" textAnchor="middle" fill="currentColor" fontSize="8">(in memory)</text>
                  <rect x="160" y="20" width="100" height="50" rx="6" fill="#f59e0b" opacity="0.12" stroke="#f59e0b"/>
                  <text x="210" y="40" textAnchor="middle" fill="#f59e0b" fontWeight="bold" fontSize="9">Virtual screen</text>
                  <text x="210" y="55" textAnchor="middle" fill="currentColor" fontSize="8">(in memory)</text>
                  <rect x="300" y="20" width="100" height="50" rx="6" fill="#10b981" opacity="0.12" stroke="#10b981"/>
                  <text x="350" y="40" textAnchor="middle" fill="#10b981" fontWeight="bold" fontSize="9">Physical screen</text>
                  <text x="350" y="55" textAnchor="middle" fill="currentColor" fontSize="8">(terminal)</text>
                  <line x1="120" y1="45" x2="160" y2="45" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <line x1="260" y1="45" x2="300" y2="45" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arr)"/>
                  <text x="140" y="38" textAnchor="middle" fill="currentColor" fontSize="7">phase 1</text>
                  <text x="280" y="38" textAnchor="middle" fill="currentColor" fontSize="7">phase 2</text>
                  <text x="210" y="95" textAnchor="middle" fill="#f59e0b" fontWeight="bold" fontSize="10">refresh() does both phases</text>
                  <text x="210" y="108" textAnchor="middle" fill="currentColor" fontSize="8" opacity="0.6">Optimized: only sends CHANGES since last refresh</text>
                </svg>

                <Box type="theorem">
                  <p className="font-bold">Why this architecture?</p>
                  <p>Minimizes actual terminal I/O (which is slow). NCURSES compares the virtual screen before and after your operations, and sends only the <strong>differences</strong> to the physical terminal. This is especially important for remote (SSH) sessions.</p>
                </Box>
              </Section>

              <Section title="2. Program Structure" id="c11-struct" checked={!!checked['c11-struct']} onCheck={() => toggleCheck('c11-struct')}>
                <Box type="formula">
                  <p className="font-bold">Minimal NCURSES program:</p>
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
                  <p className="font-bold">Critical:</p>
                  <p>Always call <code>endwin()</code> before exiting! If your program crashes without it, the terminal will be in a broken state. Use <code>reset</code> command to fix a garbled terminal.</p>
                </Box>
              </Section>

              <Section title="3. Windows & Function Naming" id="c11-windows" checked={!!checked['c11-windows']} onCheck={() => toggleCheck('c11-windows')}>
                <p>A <strong>window</strong> is a 2D character matrix of type <code>WINDOW*</code>. Each cell stores a character + attributes + colors (<code>chtype</code>).</p>

                <Box type="definition">
                  <p className="font-bold">stdscr:</p>
                  <p>A global variable representing a window that covers the entire terminal. Most functions without the <code>w</code> prefix operate on stdscr.</p>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Naming convention (four forms per function):</p>
                  <table className="text-sm mt-1 w-full">
                    <thead><tr className="border-b dark:border-gray-600"><th className="p-1">Form</th><th className="p-1">Meaning</th><th className="p-1">Example</th></tr></thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">func()</td><td className="p-1">Operates on stdscr at cursor</td><td className="p-1 font-mono">addch('A')</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">wfunc(win,...)</td><td className="p-1">Operates on specific window</td><td className="p-1 font-mono">waddch(win,'A')</td></tr>
                      <tr className="border-b dark:border-gray-700"><td className="p-1 font-mono">mvfunc(y,x,...)</td><td className="p-1">Move cursor first, then operate on stdscr</td><td className="p-1 font-mono">mvaddch(5,10,'A')</td></tr>
                      <tr><td className="p-1 font-mono">mvwfunc(win,y,x,...)</td><td className="p-1">Move + operate on specific window</td><td className="p-1 font-mono">mvwaddch(win,5,10,'A')</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Window management:</p>
                  <Code>{`WINDOW* win = newwin(height, width, start_y, start_x);
box(win, 0, 0);       // draw border around window
wrefresh(win);         // refresh this specific window
delwin(win);           // destroy window

// Useful variables:
int h = LINES;        // terminal height
int w = COLS;         // terminal width`}</Code>
                </Box>
              </Section>

              <Section title="4. Output & Input Functions" id="c11-io" checked={!!checked['c11-io']} onCheck={() => toggleCheck('c11-io')}>
                <Box type="formula">
                  <p className="font-bold">Output:</p>
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
                  <p className="font-bold">Input:</p>
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
                  <p className="font-bold">Input mode control:</p>
                  <Code>{`echo(); / noecho();        // show/hide typed characters
cbreak(); / nocbreak();   // char-at-a-time / line-buffered
keypad(stdscr, TRUE);     // enable special keys
nodelay(stdscr, TRUE);    // non-blocking getch (returns ERR if no key)
halfdelay(n);             // getch waits max n/10 seconds`}</Code>
                </Box>
              </Section>

              <Section title="5. Attributes & Colors" id="c11-color" checked={!!checked['c11-color']} onCheck={() => toggleCheck('c11-color')}>
                <Box type="formula">
                  <p className="font-bold">Text attributes:</p>
                  <Code>{`attron(A_BOLD);        // bold
attron(A_UNDERLINE);   // underline
attron(A_REVERSE);     // reverse video (swap fg/bg)
attron(A_BLINK);       // blinking text
attrset(A_NORMAL);     // reset all attributes`}</Code>
                </Box>

                <Box type="formula">
                  <p className="font-bold">Colors:</p>
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

              <Section title="6. Low-Level Terminal (termios)" id="c11-termios" checked={!!checked['c11-termios']} onCheck={() => toggleCheck('c11-termios')}>
                <Box type="definition">
                  <p>For direct terminal control without NCURSES, use the <code>termios</code> API:</p>
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
                  <p className="font-bold">Terminal info commands:</p>
                  <Code>{`$ tty              # which terminal device am I using
$ stty -a          # show all terminal settings
$ stty sane        # reset terminal to sane defaults
$ reset            # hard reset terminal (fixes garbled state)`}</Code>
                </Box>
              </Section>

              <Section title="Cheat Sheet" id="c11-cheat" checked={!!checked['c11-cheat']} onCheck={() => toggleCheck('c11-cheat')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <Box type="formula"><p className="font-bold">Lifecycle</p><p>initscr() → operations → endwin()</p><p>Compile: gcc -lncurses</p></Box>
                  <Box type="formula"><p className="font-bold">Output</p><p>addch, addstr, printw</p><p>move(y,x), clear(), refresh()</p></Box>
                  <Box type="formula"><p className="font-bold">Input</p><p>getch, getstr, scanw</p><p>keypad, echo/noecho, cbreak</p></Box>
                  <Box type="formula"><p className="font-bold">Windows</p><p>newwin, delwin, box, wrefresh</p><p>stdscr, LINES, COLS</p></Box>
                  <Box type="formula"><p className="font-bold">Style</p><p>attron/off(A_BOLD|A_REVERSE...)</p><p>start_color, init_pair, COLOR_PAIR</p></Box>
                  <Box type="formula"><p className="font-bold">Naming</p><p>func = stdscr, wfunc = window</p><p>mvfunc = move+do, mvwfunc = both</p></Box>
                </div>
              </Section>

              <Section title="Self-Test (10 Questions)" id="c11-quiz" checked={!!checked['c11-quiz']} onCheck={() => toggleCheck('c11-quiz')}>
                <Toggle question="1. Why doesn't text appear on screen immediately after printw()?" answer="printw() writes to the virtual screen (in memory), not the physical terminal. You must call refresh() to copy the virtual screen to the physical screen. This two-phase design allows NCURSES to optimize by sending only changes." />
                <Toggle question="2. What does cbreak() do?" answer="It disables line buffering: characters are available to the program as soon as typed (no need to press Enter). Without cbreak, input is buffered until a newline. Essential for interactive programs." />
                <Toggle question="3. What is stdscr?" answer="A global WINDOW* variable created by initscr() that covers the entire terminal. Functions without the 'w' prefix (like addch, printw) operate on stdscr. You cannot delete or recreate it." />
                <Toggle question="4. What happens if endwin() is not called?" answer="The terminal remains in NCURSES mode: no echo, no line buffering, possibly garbled display. The user must type 'reset' or 'stty sane' to fix their terminal." />
                <Toggle question="5. Explain the mvwprintw(win, y, x, fmt, ...) naming." answer="mv = move cursor first. w = operate on a specific window (not stdscr). printw = formatted print. So: move to (y,x) in window 'win', then print formatted text. Four-letter prefix = most specific form." />
                <Toggle question="6. How do you make getch() non-blocking?" answer={<span><code>nodelay(stdscr, TRUE)</code> makes getch return ERR immediately if no key is available. Alternatively, <code>halfdelay(n)</code> makes getch wait at most n tenths of a second.</span>} />
                <Toggle question="7. How do you enable arrow key detection?" answer={<span><code>keypad(stdscr, TRUE)</code> — without this, arrow keys generate escape sequences that getch returns as multiple characters. With keypad enabled, getch returns KEY_UP, KEY_DOWN, etc.</span>} />
                <Toggle question="8. What is the purpose of touchwin()?" answer="It marks all lines of a window as 'changed', forcing refresh() to redraw the entire window even if the virtual screen hasn't changed. Useful when overlapping windows cause display artifacts that the optimization misses." />
                <Toggle question="9. How many colors does basic NCURSES support?" answer="8 base colors: BLACK, RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE. Colors are used in pairs (foreground + background) defined via init_pair(). Max 64 pairs (8x8). Extended terminals may support 256+ colors." />
                <Toggle question="10. What is the termios API used for?" answer="Direct low-level terminal control without NCURSES. It lets you change terminal settings: disable echo, enable raw/char-at-a-time mode, change special characters, control flow, etc. NCURSES uses termios internally." />
              </Section>
            </CourseBlock>

            <footer className="mt-12 pt-6 border-t dark:border-gray-700 text-center text-sm opacity-60">
              <p>OS Study Guide - Based on lectures by Cristian Vidrascu, UAIC (2026)</p>
              <p>Generated with intensive study methodology</p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
