# Unified v86 Terminal Challenge — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dual-tab TerminalChallenge (v86 + bash-emulator) with a single v86 terminal that uses serial port commands for file injection and shell-based auto-checking.

**Architecture:** A serial command executor utility sends shell commands to the v86 VM via `serial0_send` and collects output between unique delimiters. The TerminalChallenge component is rewritten to use a single V86Terminal with exercise file injection and checkScript-based verification. LinuxTerminal and its dependencies (bash-emulator, xterm) are removed.

**Tech Stack:** React 19, v86 (existing), serial port communication

---

## File Structure

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `src/utils/v86Exec.js` | Serial command executor + file injection + check runner |
| Modify | `src/hooks/useV86.js` | Expose `exec` function after boot |
| Rewrite | `src/components/ui/TerminalChallenge.jsx` | Single v86 terminal, unified UX |
| Modify | `src/content/os/labs/Lab01.jsx` | Migrate exercises: `checkFn` → `checkScript` |
| Modify | `src/content/os/labs/Lab02.jsx` | Migrate exercises: `checkFn` → `checkScript` |
| Modify | `src/content/os/practice/Practice.jsx` | Migrate exercises: `checkFn` → `checkScript` |
| Delete | `src/components/ui/LinuxTerminal.jsx` | No longer needed |
| Modify | `package.json` | Remove bash-emulator, xterm, xterm-addon-fit |

---

### Task 1: Create Serial Command Executor

**Files:**
- Create: `src/utils/v86Exec.js`

- [ ] **Step 1: Create the v86Exec utility with createSerialExecutor**

Create `src/utils/v86Exec.js`:

```js
let cmdId = 0;

/**
 * Creates a serial command executor for a v86 emulator instance.
 * Sends shell commands via serial0, collects output between unique delimiters.
 * Commands are queued (one at a time on the serial line).
 */
export function createSerialExecutor(emulator) {
  const queue = [];
  let running = false;

  function processQueue() {
    if (running || queue.length === 0) return;
    running = true;
    const { command, resolve, reject, timeout } = queue.shift();

    const id = ++cmdId;
    const startMark = `__CMD_START_${id}__`;
    const endMark = `__CMD_END_${id}__`;
    let output = '';
    let capturing = false;
    let done = false;

    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        emulator.remove_listener('serial0-output-byte', onByte);
        running = false;
        reject(new Error(`v86Exec timeout after ${timeout}ms: ${command}`));
        processQueue();
      }
    }, timeout);

    function onByte(byte) {
      if (done) return;
      const char = String.fromCharCode(byte);
      output += char;

      if (!capturing && output.includes(startMark)) {
        capturing = true;
        // Keep only what's after the start marker
        output = output.slice(output.indexOf(startMark) + startMark.length);
      }

      if (capturing && output.includes(endMark)) {
        done = true;
        clearTimeout(timer);
        emulator.remove_listener('serial0-output-byte', onByte);
        const result = output.slice(0, output.indexOf(endMark)).trim();
        running = false;
        resolve(result);
        processQueue();
      }
    }

    emulator.add_listener('serial0-output-byte', onByte);
    emulator.serial0_send(`echo ${startMark}; ${command} 2>&1; echo ${endMark}\n`);
  }

  function exec(command, timeout = 3000) {
    return new Promise((resolve, reject) => {
      queue.push({ command, resolve, reject, timeout });
      processQueue();
    });
  }

  return exec;
}
```

- [ ] **Step 2: Add injectFiles function**

Append to `src/utils/v86Exec.js`:

```js
/**
 * Inject files and directories into the running v86 VM.
 * Directories (null values) are created with mkdir -p.
 * Files (string values) are written via heredoc to avoid shell escaping issues.
 * Directories are created first (sorted by depth), then files.
 */
export async function injectFiles(exec, files) {
  if (!files || Object.keys(files).length === 0) return;

  const entries = Object.entries(files);
  // Separate directories and files
  const dirs = entries.filter(([, v]) => v === null).map(([k]) => k);
  const fileEntries = entries.filter(([, v]) => v !== null);

  // Sort directories by depth (shallowest first)
  dirs.sort((a, b) => a.split('/').length - b.split('/').length);

  // Create directories
  for (const dir of dirs) {
    await exec(`mkdir -p ${dir}`);
  }

  // Write files via heredoc
  for (const [path, content] of fileEntries) {
    if (content.length > 8192) {
      console.warn(`v86Exec: file ${path} is ${content.length} bytes, may be slow over serial`);
    }
    // Ensure parent directory exists
    const parentDir = path.substring(0, path.lastIndexOf('/'));
    if (parentDir) {
      await exec(`mkdir -p ${parentDir}`);
    }
    await exec(`cat <<'__FILEINJECT__' > ${path}\n${content}\n__FILEINJECT__`);
  }
}
```

- [ ] **Step 3: Add runCheck function**

Append to `src/utils/v86Exec.js`:

```js
/**
 * Run a check script inside the VM.
 * Returns { passed: boolean, output: string }.
 * The check script should exit 0 for pass, non-zero for fail.
 */
export async function runCheck(exec, checkScript) {
  const result = await exec(
    `( ${checkScript} ) 2>&1 && echo __PASS__ || echo __FAIL__`,
    5000
  );
  const passed = result.includes('__PASS__');
  // Extract any feedback text before the pass/fail marker
  const feedbackEnd = result.lastIndexOf(passed ? '__PASS__' : '__FAIL__');
  const feedback = result.slice(0, feedbackEnd).trim();
  return { passed, feedback };
}
```

- [ ] **Step 4: Verify the file was created correctly**

Run: `node -e "import('./src/utils/v86Exec.js').then(m => console.log(Object.keys(m)))"`

Expected: `[ 'createSerialExecutor', 'injectFiles', 'runCheck' ]`

- [ ] **Step 5: Commit**

```bash
git add src/utils/v86Exec.js
git commit -m "feat: serial command executor for v86 terminal auto-checking"
```

---

### Task 2: Extend useV86 Hook

**Files:**
- Modify: `src/hooks/useV86.js`

- [ ] **Step 1: Add exec to the useV86 hook**

At the top of `src/hooks/useV86.js`, add the import:

```js
import { createSerialExecutor } from '../utils/v86Exec';
```

Add a module-level variable after `let bootListeners = [];`:

```js
let globalExec = null;
```

Inside the `notifyBoot()` function, after `globalBooted = true;`, add:

```js
globalExec = createSerialExecutor(globalEmulator);
```

Add a new ref inside the hook function body, after `const emulatorRef = useRef(globalEmulator);`:

```js
const execRef = useRef(globalExec);
```

In the `useEffect` at the bottom of the hook (the one that checks `globalBooted`), update both branches to also set `execRef.current = globalExec;`:

The `if (globalBooted)` branch becomes:
```js
if (globalBooted) {
  setBooted(true);
  emulatorRef.current = globalEmulator;
  execRef.current = globalExec;
}
```

The `bootListeners.push(...)` callback becomes:
```js
bootListeners.push(() => {
  setBooted(true);
  emulatorRef.current = globalEmulator;
  execRef.current = globalExec;
});
```

Update the return statement to include `exec`:

```js
return { emulator: emulatorRef, exec: execRef, booted, booting, boot };
```

- [ ] **Step 2: Verify syntax**

Run: `npx vite build 2>&1 | head -5`

Expected: no syntax errors (warnings are fine).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useV86.js
git commit -m "feat: expose serial exec from useV86 hook"
```

---

### Task 3: Rewrite TerminalChallenge Component

**Files:**
- Rewrite: `src/components/ui/TerminalChallenge.jsx`

- [ ] **Step 1: Replace TerminalChallenge with the unified v86 version**

Rewrite `src/components/ui/TerminalChallenge.jsx` with:

```jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Code } from './index';
import { injectFiles, runCheck } from '../../utils/v86Exec';
import useV86 from '../../hooks/useV86';

function HoverHint({ children }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="cursor-help text-blue-500 hover:text-blue-400 transition text-sm">
        💡
      </span>
      {show && (
        <span className="absolute left-6 top-0 z-20 w-56 p-2 rounded-lg shadow-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 animate-slide-down">
          {children}
        </span>
      )}
    </span>
  );
}

function ExerciseFilesList({ files, t }) {
  const [open, setOpen] = useState(false);
  if (!files || Object.keys(files).length === 0) return null;

  const entries = Object.entries(files);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition flex items-center gap-1"
      >
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
        {t('Exercise Files', 'Fișiere exercițiu')} ({entries.length})
      </button>
      {open && (
        <ul className="mt-1 ml-4 text-xs space-y-0.5 text-gray-600 dark:text-gray-400">
          {entries.map(([path, val]) => (
            <li key={path} className="font-mono">
              {val === null ? '📁' : '📄'} {path.split('/').pop()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TerminalChallenge({ exercises }) {
  const { t } = useApp();
  const screenRef = useRef(null);
  const { exec, booted, booting, boot } = useV86(screenRef);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [resetMenuOpen, setResetMenuOpen] = useState(false);

  const ex = exercises[currentIdx];

  // Boot v86 on mount
  useEffect(() => {
    if (screenRef.current && !booted && !booting) {
      boot();
    }
  }, [boot, booted, booting]);

  // Inject files when exercise changes or VM boots
  useEffect(() => {
    if (!booted || !exec.current || !ex.files || Object.keys(ex.files).length === 0) return;
    let cancelled = false;
    setInjecting(true);
    injectFiles(exec.current, ex.files).then(() => {
      if (!cancelled) setInjecting(false);
    }).catch(() => {
      if (!cancelled) setInjecting(false);
    });
    return () => { cancelled = true; };
  }, [booted, currentIdx]);

  const switchExercise = (idx) => {
    setCurrentIdx(idx);
    setCheckResult(null);
    setShowSolution(false);
    setResetMenuOpen(false);
  };

  const check = useCallback(async () => {
    if (!exec.current || !ex.checkScript) return;
    setChecking(true);
    setCheckResult(null);
    const minDelay = new Promise(r => setTimeout(r, 300));
    try {
      const [result] = await Promise.all([
        runCheck(exec.current, ex.checkScript),
        minDelay,
      ]);
      setCheckResult(result);
    } catch {
      setCheckResult({ passed: false, feedback: '' });
    }
    setChecking(false);
  }, [ex]);

  const resetExercise = useCallback(async () => {
    if (!exec.current || !ex.files || Object.keys(ex.files).length === 0) return;
    setCheckResult(null);
    setResetMenuOpen(false);
    setInjecting(true);
    try {
      await injectFiles(exec.current, ex.files);
    } catch { /* best effort */ }
    setInjecting(false);
  }, [ex]);

  const resetVM = useCallback(() => {
    setResetMenuOpen(false);
    setCheckResult(null);
    // Trigger a full page reload of the VM — the simplest reliable way
    // to reset the singleton. globalEmulator will be recreated on next boot.
    window.location.reload();
  }, []);

  return (
    <div className="border rounded-xl overflow-hidden mb-6" style={{ borderColor: 'var(--theme-border)' }}>
      {/* Exercise selector */}
      <div className="flex items-center gap-1 p-2 overflow-x-auto" style={{ background: 'var(--theme-sidebar-bg)', borderBottom: '1px solid var(--theme-border)' }}>
        {exercises.map((e, i) => (
          <button
            key={i}
            onClick={() => switchExercise(i)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              i === currentIdx
                ? 'bg-blue-600 text-white'
                : 'hover:opacity-80'
            }`}
            style={i !== currentIdx ? { background: 'var(--theme-content-bg)', color: 'var(--theme-text)' } : undefined}
          >
            {t('Ex', 'Ex')} {i + 1}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Left: v86 terminal */}
        <div className="flex-1 min-w-0">
          <div ref={screenRef} className="v86-screen" style={{ width: '100%', minHeight: '450px', overflow: 'auto', background: '#000' }} />
          {/* Boot overlay */}
          {!booted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 z-10" style={{ position: 'absolute' }}>
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-4" />
              <p className="text-sm text-gray-300 font-mono">
                {booting ? t('Booting Linux...', 'Se pornește Linux...') : t('Preparing terminal...', 'Se pregătește terminalul...')}
              </p>
            </div>
          )}
          {/* Injecting overlay */}
          {injecting && booted && (
            <div className="absolute bottom-2 left-2 z-10 px-2 py-1 rounded bg-blue-900/80 text-xs text-blue-200 font-mono">
              {t('Loading files...', 'Se încarcă fișierele...')}
            </div>
          )}
        </div>

        {/* Right: Instructions panel */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l p-4" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-sidebar-bg)' }}>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-muted)' }}>
              {t('Exercise', 'Exercițiu')} {currentIdx + 1}/{exercises.length}
            </h4>
            {ex.courseRef && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                {ex.courseRef}
              </span>
            )}
          </div>

          <p className="text-sm mb-3">{ex.description}</p>

          {ex.hints && ex.hints.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              {ex.hints.map((hint, i) => (
                <HoverHint key={i}>{hint}</HoverHint>
              ))}
              <span className="text-xs" style={{ color: 'var(--theme-muted)' }}>{t('Hover for hints', 'Treci cursorul pentru indicii')}</span>
            </div>
          )}

          <ExerciseFilesList files={ex.files} t={t} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 p-3" style={{ borderTop: '1px solid var(--theme-border)', background: 'var(--theme-sidebar-bg)' }}>
        <button
          onClick={() => switchExercise(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="px-3 py-1.5 text-sm font-medium rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
          style={{ background: 'var(--theme-content-bg)', color: 'var(--theme-text)' }}
        >
          ← {t('Prev', 'Anterior')}
        </button>
        <button
          onClick={() => switchExercise(Math.min(exercises.length - 1, currentIdx + 1))}
          disabled={currentIdx === exercises.length - 1}
          className="px-3 py-1.5 text-sm font-medium rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
          style={{ background: 'var(--theme-content-bg)', color: 'var(--theme-text)' }}
        >
          {t('Next', 'Următor')} →
        </button>

        <div className="flex-1" />

        {ex.checkScript && (
          <button
            onClick={check}
            disabled={checking || !booted}
            className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                {t('Checking...', 'Se verifică...')}
              </span>
            ) : t('Check', 'Verifică')}
          </button>
        )}

        {/* Reset dropdown */}
        <div className="relative">
          <button
            onClick={() => setResetMenuOpen(!resetMenuOpen)}
            disabled={!booted}
            className="px-4 py-1.5 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('Reset', 'Resetează')} ▾
          </button>
          {resetMenuOpen && (
            <div className="absolute bottom-full mb-1 right-0 w-48 rounded-lg shadow-lg border overflow-hidden z-20" style={{ background: 'var(--theme-content-bg)', borderColor: 'var(--theme-border)' }}>
              <button
                onClick={resetExercise}
                className="w-full px-3 py-2 text-sm text-left hover:bg-blue-50 dark:hover:bg-blue-950/20 transition"
              >
                {t('Reset Exercise', 'Resetează exercițiul')}
                <span className="block text-xs opacity-50">{t('Re-inject files (~0.5s)', 'Reinjectează fișierele (~0.5s)')}</span>
              </button>
              <button
                onClick={resetVM}
                className="w-full px-3 py-2 text-sm text-left hover:bg-red-50 dark:hover:bg-red-950/20 transition border-t"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                {t('Reset VM', 'Resetează VM')}
                <span className="block text-xs opacity-50">{t('Full reboot (~5s)', 'Repornire completă (~5s)')}</span>
              </button>
            </div>
          )}
        </div>

        {ex.solution && (
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="px-4 py-1.5 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            {showSolution ? t('Hide Solution', 'Ascunde soluția') : t('Show Solution', 'Arată soluția')}
          </button>
        )}
      </div>

      {/* Check result banner */}
      {checkResult !== null && (
        <div className={`p-3 text-sm font-medium ${
          checkResult.passed
            ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
        }`} style={{ borderTop: '1px solid var(--theme-border)' }}>
          {checkResult.passed
            ? t('Correct! Task completed.', 'Corect! Sarcină finalizată.')
            : t('Not quite — try again.', 'Nu exact — încearcă din nou.')}
          {checkResult.feedback && (
            <p className="text-xs mt-1 opacity-70 font-mono">{checkResult.feedback}</p>
          )}
        </div>
      )}

      {/* Solution */}
      {showSolution && ex.solution && (
        <div className="p-3 animate-slide-down" style={{ borderTop: '1px solid var(--theme-border)' }}>
          <p className="text-xs font-medium mb-2 opacity-60">{t('Solution:', 'Soluția:')}</p>
          <Code>{ex.solution}</Code>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npx vite build 2>&1 | tail -5`

Expected: build succeeds (the V86Terminal is now embedded inside TerminalChallenge directly via `useV86` + `screenRef`).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/TerminalChallenge.jsx
git commit -m "feat: unified v86 terminal challenge with serial auto-checking"
```

---

### Task 4: Migrate Lab01 Exercises

**Files:**
- Modify: `src/content/os/labs/Lab01.jsx:10-115`

- [ ] **Step 1: Replace checkFn with checkScript in all 4 exercises**

In `src/content/os/labs/Lab01.jsx`, replace each exercise's `checkFn` property with `checkScript`. Also remove the `welcomeMessage` property (no longer used — bash-emulator concept).

Exercise 1 (line 19-27): Replace `checkFn: async (emu) => { ... }` with:
```js
checkScript: 'test -d /home/user/programe && test -d /home/user/programe/tema1 && test -d /home/user/programe/tema2 && test -d /home/user/programe/tema2/tema2_sub-temaA',
```

Exercise 2 (line 48-58): Replace `checkFn: async (emu) => { ... }` with:
```js
checkScript: 'test -f /home/user/programe/program1.c && test -f /home/user/programe/program2.c && test -f /home/user/programe/program2.h && test -f /home/user/programe/tema1/tema1-1.c && test -f /home/user/programe/tema1/tema1-2.c && test -f /home/user/programe/tema2/tema2_sub-temaA/sub-temaA1.c && test -f /home/user/programe/tema2/tema2_sub-temaA/sub-temaA2.cpp',
```

Exercise 3 (line 82-91): Replace `checkFn: async (emu) => { ... }` with:
```js
checkScript: 'test -f /home/user/programe/tema2/tema2-1.c && grep -q "tema1" /home/user/programe/tema2/tema2-1.c && test -f /home/user/programe/tema2/tema2-2.c && ! test -d /home/user/temp',
```

Exercise 4 (line 99-114): This exercise has no `checkFn` (just `hints` and `solution`). No `checkScript` needed — leave as-is.

- [ ] **Step 2: Remove welcomeMessage from all exercises**

Delete the `welcomeMessage: t(...)` line from each of the 4 exercises (lines 18, 47, 81, 108).

- [ ] **Step 3: Update the instruction text that references dual-tab UX**

Replace the paragraph at lines 144-147:
```jsx
<p className="text-sm mb-4 opacity-80">
  {t(
    'Practice in the terminal below. Use "Try It" for free experimentation, then switch to "Submit Answer" and click "Check" to verify your solution.',
    'Exersați în terminalul de mai jos. Folosiți "Încearcă" pentru experimentare liberă, apoi treceți la "Trimite răspunsul" și apăsați "Verifică" pentru a valida soluția.'
  )}
</p>
```

With:
```jsx
<p className="text-sm mb-4 opacity-80">
  {t(
    'Practice in the real Linux terminal below. Click "Check" to verify your solution.',
    'Exersați în terminalul Linux real de mai jos. Apăsați "Verifică" pentru a valida soluția.'
  )}
</p>
```

- [ ] **Step 4: Verify build**

Run: `npx vite build 2>&1 | tail -3`

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/content/os/labs/Lab01.jsx
git commit -m "feat: migrate Lab01 exercises to checkScript"
```

---

### Task 5: Migrate Lab02 Exercises

**Files:**
- Modify: `src/content/os/labs/Lab02.jsx:10-91`

- [ ] **Step 1: Replace checkFn with checkScript in all 3 exercises**

Exercise 1 — shells.txt (line 21-29): Replace `checkFn` with:
```js
checkScript: 'test -f /home/user/shells.txt && LINES=$(sort -u /home/user/shells.txt | grep -c .) && test "$LINES" -ge 2 && grep -qE "/bin/bash|nologin" /home/user/shells.txt',
```

Exercise 2 — bash_count.txt (line 48-54): Replace `checkFn` with:
```js
checkScript: 'test -f /home/user/bash_count.txt && test "$(cat /home/user/bash_count.txt | tr -d "[:space:]")" = "4"',
```

Exercise 3 — filtered.txt (line 73-82): Replace `checkFn` with:
```js
checkScript: 'test -f /home/user/filtered.txt && grep -q "ana" /home/user/filtered.txt && ! grep -q "diana" /home/user/filtered.txt && test "$(wc -l < /home/user/filtered.txt)" -ge 4',
```

- [ ] **Step 2: Remove welcomeMessage from all 3 exercises**

Delete the `welcomeMessage: t(...)` line from each exercise (lines 20, 47, 72).

- [ ] **Step 3: Update the instruction text that references dual-tab UX**

Replace lines 118-122:
```jsx
<p className="text-sm mb-4 opacity-80">
  {t(
    'Practice in the terminal below. Use "Try It" for free experimentation, then switch to "Submit Answer" and click "Check" to verify your solution.',
    'Exersati in terminalul de mai jos. Folositi "Incearca" pentru experimentare libera, apoi treceti la "Trimite raspunsul" si apasati "Verifica" pentru a valida solutia.'
  )}
</p>
```

With:
```jsx
<p className="text-sm mb-4 opacity-80">
  {t(
    'Practice in the real Linux terminal below. Click "Check" to verify your solution.',
    'Exersați în terminalul Linux real de mai jos. Apăsați "Verifică" pentru a valida soluția.'
  )}
</p>
```

- [ ] **Step 4: Verify build**

Run: `npx vite build 2>&1 | tail -3`

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/content/os/labs/Lab02.jsx
git commit -m "feat: migrate Lab02 exercises to checkScript"
```

---

### Task 6: Migrate Practice Exercises

**Files:**
- Modify: `src/content/os/practice/Practice.jsx:63-151`

- [ ] **Step 1: Replace checkFn with checkScript in all 4 exercises**

Exercise 1 — navigate to documents (line 78-80): Replace `checkFn` with:
```js
checkScript: 'test "$(pwd)" = "/home/user/documents" || test "$(pwd)" = "/root/documents"',
```

Exercise 2 — create project/main.c (line 96-100): Replace `checkFn` with:
```js
checkScript: 'test -f /home/user/project/main.c && test -s /home/user/project/main.c',
```
(Note: `test -s` checks the file exists AND has size > 0)

Exercise 3 — grep error (line 113-122): This exercise has no `checkFn`. No `checkScript` needed — leave as-is.

Exercise 4 — remove temp/ (line 139-144): Replace `checkFn` with:
```js
checkScript: '! test -d /home/user/temp',
```

- [ ] **Step 2: Remove welcomeMessage from all exercises**

Delete the `welcomeMessage: t(...)` line from each exercise that has one (lines 77, 95, 117, 138).

- [ ] **Step 3: Update the instruction text that references dual-tab UX**

Replace line 201:
```jsx
<p className="text-sm opacity-60 mb-6">{t('Use "Try It" to experiment in a real Linux terminal, then "Submit Answer" to auto-check.', 'Folosește "Încearcă" pentru a experimenta într-un terminal Linux real, apoi "Trimite răspunsul" pentru verificare automată.')}</p>
```

With:
```jsx
<p className="text-sm opacity-60 mb-6">{t('Practice in the real Linux terminal below. Click "Check" to verify your solution.', 'Exersați în terminalul Linux real de mai jos. Apăsați "Verifică" pentru a valida soluția.')}</p>
```

- [ ] **Step 4: Verify build**

Run: `npx vite build 2>&1 | tail -3`

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/content/os/practice/Practice.jsx
git commit -m "feat: migrate Practice exercises to checkScript"
```

---

### Task 7: Remove LinuxTerminal and Unused Dependencies

**Files:**
- Delete: `src/components/ui/LinuxTerminal.jsx`
- Modify: `package.json`

- [ ] **Step 1: Delete LinuxTerminal.jsx**

```bash
rm src/components/ui/LinuxTerminal.jsx
```

- [ ] **Step 2: Remove unused dependencies from package.json**

Run:
```bash
npm uninstall bash-emulator xterm xterm-addon-fit
```

- [ ] **Step 3: Verify nothing else imports the removed modules**

Run:
```bash
grep -r "bash-emulator\|from 'xterm'\|xterm-addon-fit\|LinuxTerminal" src/ --include="*.jsx" --include="*.js"
```

Expected: no results (all references were in LinuxTerminal.jsx which is now deleted).

- [ ] **Step 4: Verify build**

Run: `npx vite build 2>&1 | tail -5`

Expected: build succeeds with no missing module errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove LinuxTerminal and bash-emulator/xterm dependencies"
```

---

### Task 8: Manual Testing in Browser

**Files:** None (testing only)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test Lab01 terminal challenge**

Navigate to `/#/y1s2/os`, switch to Labs tab, open Lab 1.

Verify:
- Single v86 terminal boots (loading overlay shown, then terminal appears)
- Exercise picker shows Ex 1–4
- Exercise 1: run `mkdir -p programe/tema1 programe/tema2/sub-temaA && mv programe/tema2/sub-temaA programe/tema2/tema2_sub-temaA`, click Check → green pass
- Click Check without doing anything → red fail
- Exercise files list shows correctly in instructions panel
- Switch to Ex 2 → files injected, no reboot
- Reset dropdown works: "Reset Exercise" re-injects files, "Reset VM" reloads page
- Solution toggle works

- [ ] **Step 3: Test Lab02 terminal challenge**

Navigate to Labs → Lab 2.

Verify:
- Exercise 1: `cut -f7 -d: /etc/passwd | sort -u > shells.txt` → Check → pass
- Exercise 2: `grep -c /bin/bash /etc/passwd > bash_count.txt` → Check → pass
- Exercise 3: `grep ana data.txt | grep -v diana | sort > filtered.txt` → Check → pass

- [ ] **Step 4: Test Practice terminal challenge**

Navigate to Practice tab, scroll to Terminal Challenges.

Verify:
- Exercise 1: `cd documents` → Check → pass
- Exercise 2: `mkdir project && echo test > project/main.c` → Check → pass
- Exercise 4: `rm -r temp` → Check → pass

- [ ] **Step 5: Test edge cases**

- Click Check before VM boots → button disabled
- Click Check multiple times rapidly → only one check runs (button disabled during check)
- Minimum 300ms spinner visible even if check is fast
- Check result clears when switching exercises
- Check feedback text displayed if check script produces output

- [ ] **Step 6: Commit any fixes**

If any fixes were needed during testing, commit them:
```bash
git add -A
git commit -m "fix: terminal challenge testing fixes"
```
