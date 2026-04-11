# Unified v86 Terminal Challenge — Design Spec

**Date:** 2026-04-12
**Status:** Approved

## Problem

The current `TerminalChallenge` component uses two separate terminals:
- **"Try It" tab** — real v86 Linux VM for free experimentation
- **"Submit Answer" tab** — JS bash-emulator (simulated) for auto-checked submission

This causes: confusing dual-tab UX, feature asymmetry (real Linux vs limited simulation), context-switching friction, and maintenance burden of two terminal implementations.

## Solution

Replace with a **single v86 terminal** that handles both practice and auto-checking. Kill the bash-emulator dependency in TerminalChallenge entirely. Use the v86 serial port (already wired for boot detection) to run check scripts and inject files inside the real VM.

## Architecture

### 1. Serial Command Executor (`src/utils/v86Exec.js`)

Core primitive: send a shell command to v86 via serial, return output as a promise.

**Protocol:**
1. Generate unique delimiter pair: `__CMD_START_<id>__` / `__CMD_END_<id>__`
2. Send via `emulator.serial0_send()`:
   ```
   echo __CMD_START_<id>__; <command>; echo __CMD_END_<id>__\n
   ```
3. Accumulate bytes from `serial0-output-byte` listener until both delimiters captured
4. Extract text between delimiters → resolve promise
5. Timeout after 3s → reject with error

**Queuing:** Commands serialized via a simple queue (one at a time on the serial line). Each `exec()` call appends to queue and awaits its turn.

**API:**
```js
import { createSerialExecutor } from '../utils/v86Exec';

const exec = createSerialExecutor(emulator);
const output = await exec('cat /etc/passwd | wc -l');
// output = "7"
```

**Edge cases:**
- Commands that produce no output still resolve (empty string between delimiters)
- Commands that fail (non-zero exit) still return output (stderr merged via `2>&1` in wrapper)
- Binary output not supported (text only)
- Queue drains in order; timeout on one command rejects that promise and moves to next

### 2. File Injection (`src/utils/v86Exec.js`)

Inject exercise files into the running VM using the serial executor.

**For directories** (`null` value in files map):
```
mkdir -p /path/to/dir
```

**For files** (string value):
```
cat <<'__FILEINJECT__' > /path/to/file
file contents here
__FILEINJECT__
```

Quoted heredoc delimiter (`'__FILEINJECT__'`) prevents shell expansion — no issues with `$`, backticks, or special characters in file content.

**API:**
```js
import { injectFiles } from '../utils/v86Exec';

await injectFiles(exec, {
  '/home/user/data.txt': 'line1\nline2\n',
  '/home/user/output': null,  // directory
});
```

**Limits:** ~8KB per file max (serial throughput). All existing exercises are well under 2KB. Dev warning logged if exceeded.

**Ordering:** Directories created first (sorted by depth), then files. All sequential via the command queue.

### 3. Check System

Exercises define a `checkScript` — a shell snippet that exits 0 for pass, non-zero for fail.

**Execution wrapper:**
```
( <checkScript> ) 2>&1 && echo __PASS__ || echo __FAIL__
```

**Parsing:** Look for `__PASS__` or `__FAIL__` in output. Any text before the marker is captured as optional feedback.

**Exercise definition format:**
```js
{
  description: t('Create directories tema1 and tema2', '...'),
  files: {},
  checkScript: 'test -d /home/user/programe/tema1 && test -d /home/user/programe/tema2',
  solution: 'mkdir -p programe/tema1 programe/tema2',
  hints: [...],
}
```

**Covers all existing check patterns:**

| Current pattern | Shell equivalent |
|---|---|
| `emu.stat(path)` (existence) | `test -f /path` or `test -d /path` |
| `emu.read(path)` (content check) | `grep -q 'expected' /path` |
| `emu.getDir()` (working dir) | `` test "$(pwd)" = "/expected/path" `` |
| Content comparison | `diff <(sort /path) <(echo 'expected' \| sort)` |
| Line count | `` test "$(wc -l < /path)" = "5" `` |

**Future patterns (now possible):**
- Permission checks: `stat -c %a /path`
- Process checks: `pgrep processname`
- User/group checks: `id username`
- Network checks: `ss -tlnp | grep :8080`
- Arbitrary pipe validation

### 4. Unified UX

Single-terminal layout replacing the dual-tab design.

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ [Ex 1] [Ex 2] [Ex 3]           exercise picker  │
├────────────────────────────────┬────────────────┤
│                                │ Exercise 3/5   │
│                                │ 📎 Course 1    │
│                                │                │
│        v86 terminal            │ Description... │
│        (single instance)       │                │
│                                │ 📂 Files:      │
│                                │   data.txt     │
│                                │   output/      │
│                                │                │
│                                │ 💡 hints       │
├────────────────────────────────┴────────────────┤
│ ← Prev    Next →    [Check] [Reset ▼] [Solution]│
└─────────────────────────────────────────────────┘
```

**Key behaviors:**

- **Single v86 instance** — singleton via `globalEmulator` (already implemented in `useV86`). Boots once, shared across all exercises.
- **Exercise switching** — injects new exercise's files into the running VM. No reboot, no cleanup. Previous exercise files remain (realistic Linux behavior).
- **Exercise files list** — collapsible section in instructions panel showing files belonging to the current exercise. Helps students distinguish current vs carry-over files.
- **Check button** — runs `checkScript` via serial executor. Disabled + shows "Checking..." spinner during execution. Minimum 300ms display to avoid flash. Result shown as green (pass) or red (fail) banner below the terminal.
- **Two-level reset:**
  - "Reset Exercise" (default click) — re-injects current exercise's files, fast (~0.5s)
  - "Reset VM" (dropdown option) — full VM reboot to pristine state (~3-5s), for troubleshooting only
- **Loading overlay** — shown during initial VM boot (existing behavior, keep as-is)
- **Mobile** — instructions panel stacks below terminal (existing responsive behavior)

### 5. Exercise Definition Migration

All existing exercises in Lab01, Lab02, and Practice must be migrated from `checkFn` (JS function over bash-emulator) to `checkScript` (shell snippet over v86).

**Migration mapping (Lab01):**

Exercise 1 (create directories):
```js
// Before
checkFn: async (emu) => {
  await emu.stat('/home/user/programe');
  await emu.stat('/home/user/programe/tema1');
  await emu.stat('/home/user/programe/tema2');
  return true;
}
// After
checkScript: 'test -d ~/programe && test -d ~/programe/tema1 && test -d ~/programe/tema2'
```

Exercise 2 (create files):
```js
// Before: emu.stat() on several paths
// After
checkScript: 'test -f ~/programe/program1.c && test -f ~/programe/program2.c && test -f ~/programe/tema1/tema1-1.c'
```

Exercise 3 (copy/move/delete):
```js
// Before: emu.read() + content checks + stat for deletion
// After
checkScript: `
  grep -q "tema1" ~/programe/tema2/tema2-1.c &&
  test -f ~/programe/tema2/tema2-2.c &&
  ! test -f ~/programe/tema2/tema2-3.c &&
  ! test -d ~/temp
`
```

Similar pattern for Lab02 (grep/wc exercises) and Practice exercises.

### 6. Hook Integration with `useV86`

The existing `useV86` hook needs a small extension: expose the `exec` function alongside `emulator`, `booted`, `booting`, `boot`.

```js
const { emulator, exec, booted, booting, boot } = useV86(screenRef);
```

`exec` is created once from `createSerialExecutor(emulator)` after boot completes. Before boot, `exec` is null.

### 7. Files Removed

- `LinuxTerminal.jsx` — only imported by TerminalChallenge, safe to delete
- `bash-emulator` dependency — only used by LinuxTerminal, remove from package.json
- `xterm` / `xterm-addon-fit` — only used by LinuxTerminal, remove from package.json

## Out of Scope

- Rebuilding the Buildroot Linux image (no 9p, no custom daemons)
- Binary file injection
- Multi-user or collaborative terminal sessions
- Grading persistence (check results are ephemeral, per-session)
