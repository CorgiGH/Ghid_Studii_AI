import React, { useRef, useEffect, useCallback } from 'react';
import bashEmulator from 'bash-emulator';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const DEFAULT_FS = {
  '/': { type: 'dir', modified: Date.now() },
  '/home': { type: 'dir', modified: Date.now() },
  '/home/user': { type: 'dir', modified: Date.now() },
};

function buildFileSystem(files) {
  const fs = { ...DEFAULT_FS };
  if (!files) return fs;

  for (const [path, content] of Object.entries(files)) {
    // Ensure parent dirs exist
    const parts = path.split('/').filter(Boolean);
    let current = '';
    for (let i = 0; i < parts.length - 1; i++) {
      current += '/' + parts[i];
      if (!fs[current]) {
        fs[current] = { type: 'dir', modified: Date.now() };
      }
    }
    // Add the file or directory
    if (content === null) {
      fs[path] = { type: 'dir', modified: Date.now() };
    } else {
      fs[path] = { type: 'file', modified: Date.now(), content };
    }
  }
  return fs;
}

function addCustomCommands(emulator) {
  emulator.commands.echo = function (env, args) {
    env.output(args.slice(1).join(' '));
    env.exit(0);
  };

  emulator.commands.whoami = function (env) {
    env.output(env.system.state.user);
    env.exit(0);
  };

  emulator.commands.grep = function (env, args) {
    const pattern = args[1];
    const filePath = args[2];
    if (!pattern) {
      env.error('grep: missing pattern');
      env.exit(1);
      return;
    }
    if (!filePath) {
      env.error('grep: missing file');
      env.exit(1);
      return;
    }
    env.system.read(filePath).then(content => {
      const regex = new RegExp(pattern, 'g');
      const matches = content.split('\n').filter(line => regex.test(line));
      env.output(matches.join('\n'));
      env.exit(0);
    }).catch(() => {
      env.error(`grep: ${filePath}: No such file or directory`);
      env.exit(1);
    });
  };

  emulator.commands.head = function (env, args) {
    let n = 10;
    let file = args[1];
    if (args[1] === '-n' && args[2]) { n = parseInt(args[2]); file = args[3]; }
    if (!file) { env.error('head: missing file'); env.exit(1); return; }
    env.system.read(file).then(content => {
      env.output(content.split('\n').slice(0, n).join('\n'));
      env.exit(0);
    }).catch(() => {
      env.error(`head: ${file}: No such file or directory`);
      env.exit(1);
    });
  };

  emulator.commands.tail = function (env, args) {
    let n = 10;
    let file = args[1];
    if (args[1] === '-n' && args[2]) { n = parseInt(args[2]); file = args[3]; }
    if (!file) { env.error('tail: missing file'); env.exit(1); return; }
    env.system.read(file).then(content => {
      const lines = content.split('\n');
      env.output(lines.slice(-n).join('\n'));
      env.exit(0);
    }).catch(() => {
      env.error(`tail: ${file}: No such file or directory`);
      env.exit(1);
    });
  };

  emulator.commands.wc = function (env, args) {
    const file = args[1];
    if (!file) { env.error('wc: missing file'); env.exit(1); return; }
    env.system.read(file).then(content => {
      const lines = content.split('\n').length;
      const words = content.split(/\s+/).filter(Boolean).length;
      const chars = content.length;
      env.output(`  ${lines}  ${words} ${chars} ${file}`);
      env.exit(0);
    }).catch(() => {
      env.error(`wc: ${file}: No such file or directory`);
      env.exit(1);
    });
  };

  emulator.commands.help = function (env) {
    env.output(
      'Available commands: ls, cd, pwd, cat, echo, mkdir, rmdir, touch,\n' +
      'cp, mv, rm, grep, head, tail, wc, whoami, history, clear, help'
    );
    env.exit(0);
  };
}

export default function LinuxTerminal({ files, welcomeMessage, emulatorRef }) {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const emuRef = useRef(null);
  const lineRef = useRef('');

  const initEmulator = useCallback(() => {
    const fs = buildFileSystem(files);
    const emu = bashEmulator({
      user: 'student',
      workingDirectory: '/home/user',
      fileSystem: fs,
    });
    addCustomCommands(emu);
    emuRef.current = emu;
    if (emulatorRef) emulatorRef.current = emu;
    return emu;
  }, [files]);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: '"Cascadia Code", "Fira Code", monospace',
      theme: {
        background: '#0f172a',
        foreground: '#e2e8f0',
        cursor: '#38bdf8',
        selectionBackground: '#334155',
      },
      rows: 16,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();
    termRef.current = term;

    const emu = initEmulator();

    // Welcome message
    if (welcomeMessage) {
      term.writeln('\x1b[36m' + welcomeMessage + '\x1b[0m');
      term.writeln('\x1b[90mType "help" for available commands.\x1b[0m');
      term.writeln('');
    }

    const writePrompt = () => {
      emu.getDir().then(dir => {
        const shortDir = dir.replace('/home/student', '~').replace('/home/user', '~');
        term.write(`\x1b[32mstudent@linux\x1b[0m:\x1b[34m${shortDir}\x1b[0m$ `);
      });
    };

    writePrompt();

    term.onKey(({ key, domEvent }) => {
      const code = domEvent.keyCode;

      if (code === 13) { // Enter
        term.writeln('');
        const cmd = lineRef.current.trim();
        lineRef.current = '';

        if (!cmd) {
          writePrompt();
          return;
        }

        if (cmd === 'clear') {
          term.clear();
          writePrompt();
          return;
        }

        emu.run(cmd).then(output => {
          if (output) term.writeln(output.replace(/\n/g, '\r\n'));
          writePrompt();
        }).catch(err => {
          term.writeln(`\x1b[31m${err}\x1b[0m`);
          writePrompt();
        });
      } else if (code === 8) { // Backspace
        if (lineRef.current.length > 0) {
          lineRef.current = lineRef.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (domEvent.key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey) {
        lineRef.current += domEvent.key;
        term.write(domEvent.key);
      }
    });

    const ro = new ResizeObserver(() => fitAddon.fit());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      term.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="rounded-lg overflow-hidden border dark:border-gray-600"
      style={{ minHeight: '320px' }}
    />
  );
}
