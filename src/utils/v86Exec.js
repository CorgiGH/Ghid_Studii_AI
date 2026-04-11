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

/**
 * Escape content for use inside a single-line printf command.
 * Converts newlines to \n, escapes backslashes and single quotes.
 */
function escapeForPrintf(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '%%')
    .replace(/'/g, "'\\''")
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

/**
 * Inject files and directories into the running v86 VM.
 * Directories (null values) are created with mkdir -p.
 * Files (string values) are written via printf (single-line, no heredoc issues).
 * Directories are created first (sorted by depth), then files.
 */
export async function injectFiles(exec, files) {
  if (!files || Object.keys(files).length === 0) return;

  const entries = Object.entries(files);
  const dirs = entries.filter(([, v]) => v === null).map(([k]) => k);
  const fileEntries = entries.filter(([, v]) => v !== null);

  // Sort directories by depth (shallowest first)
  dirs.sort((a, b) => a.split('/').length - b.split('/').length);

  for (const dir of dirs) {
    await exec(`mkdir -p "${dir}"`);
  }

  for (const [path, content] of fileEntries) {
    if (content.length > 8192) {
      console.warn(`v86Exec: file ${path} is ${content.length} bytes, may be slow over serial`);
    }
    const parentDir = path.substring(0, path.lastIndexOf('/'));
    if (parentDir) {
      await exec(`mkdir -p "${parentDir}"`);
    }
    const escaped = escapeForPrintf(content);
    await exec(`printf '${escaped}' > "${path}"`);
  }
}

/**
 * Run a check script inside the VM.
 * Returns { passed: boolean, feedback: string }.
 * The check script should exit 0 for pass, non-zero for fail.
 */
export async function runCheck(exec, checkScript) {
  const id = ++cmdId;
  const passMark = `__PASS_${id}__`;
  const failMark = `__FAIL_${id}__`;
  const result = await exec(
    `( ${checkScript} ) 2>&1 && echo ${passMark} || echo ${failMark}`,
    5000
  );
  const passed = result.includes(passMark);
  const marker = passed ? passMark : failMark;
  const feedbackEnd = result.lastIndexOf(marker);
  const feedback = result.slice(0, feedbackEnd).trim();
  return { passed, feedback };
}
