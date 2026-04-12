import { useState, useEffect, useRef, useCallback } from 'react';
import { createSerialExecutor } from '../utils/v86Exec';

let globalEmulator = null;
let globalBooted = false;
let globalBootStarted = false; // module-level guard against concurrent boot()
let globalExec = null;
let globalScreenDiv = null; // persistent div that v86 renders into
let bootListeners = [];

function notifyBoot() {
  globalBooted = true;
  bootListeners.forEach(fn => fn());
  bootListeners = [];
}

export default function useV86(containerRef) {
  const [booted, setBooted] = useState(globalBooted);
  const [booting, setBooting] = useState(false);
  const [bootStage, setBootStage] = useState('idle'); // idle | script | emulator | login | ready
  const emulatorRef = useRef(globalEmulator);
  const execRef = useRef(globalExec);
  const mountedRef = useRef(true);

  // Track mount state to guard async state updates
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const safeSetBooted = (v) => { if (mountedRef.current) setBooted(v); };
  const safeSetBooting = (v) => { if (mountedRef.current) setBooting(v); };
  const safeSetBootStage = (v) => { if (mountedRef.current) setBootStage(v); };

  const boot = useCallback(() => {
    if (globalEmulator || globalBootStarted) return;
    if (!containerRef?.current) return;
    globalBootStarted = true;
    setBooting(true);
    safeSetBootStage('script');

    const basePath = import.meta.env.BASE_URL || '/';

    const script = document.createElement('script');
    script.src = `${basePath}v86/libv86.js`;
    script.onload = () => {
      safeSetBootStage('emulator');
      // Create a persistent screen div that outlives React component unmounts
      globalScreenDiv = document.createElement('div');
      globalScreenDiv.style.width = '100%';
      globalScreenDiv.style.height = '100%';
      // Guard against unmount between boot() call and script.onload
      if (containerRef?.current) {
        containerRef.current.appendChild(globalScreenDiv);
      } else {
        document.body.appendChild(globalScreenDiv);
        globalScreenDiv.style.display = 'none';
      }

      const emulator = new window.V86({
        wasm_path: `${basePath}v86/v86.wasm`,
        memory_size: 64 * 1024 * 1024,
        vga_memory_size: 2 * 1024 * 1024,
        screen_container: globalScreenDiv,
        bios: { url: `${basePath}v86/seabios.bin` },
        vga_bios: { url: `${basePath}v86/vgabios.bin` },
        cdrom: { url: `${basePath}v86/linux.iso` },
        autostart: true,
        disable_keyboard: false,
        disable_mouse: true,
      });

      globalEmulator = emulator;
      emulatorRef.current = emulator;

      // Wait for serial login prompt, log in, verify exec works, THEN mark booted
      let serialOutput = '';
      let bootTriggered = false;
      const onBootByte = (byte) => {
        if (bootTriggered) return;
        serialOutput += String.fromCharCode(byte);
        if (serialOutput.includes('login:')) {
          bootTriggered = true;
          safeSetBootStage('login');
          emulator.remove_listener('serial0-output-byte', onBootByte);

          // Log in on serial console, then disable echo so exec
          // markers aren't duplicated in the command echo
          emulator.serial0_send('root\n');
          setTimeout(() => {
            emulator.serial0_send('stty -echo\n');
          }, 1000);

          // Wait for shell to be ready, then verify exec works
          setTimeout(async () => {
            globalExec = createSerialExecutor(emulator);

            // Warm-up: drain residual output and confirm serial exec works
            try {
              const result = await globalExec('echo v86ok', 5000);
              if (!result.includes('v86ok')) {
                console.warn('v86Exec warm-up: unexpected result:', result);
              }
            } catch (e) {
              console.warn('v86Exec warm-up failed:', e);
            }

            notifyBoot();
            execRef.current = globalExec;
            safeSetBootStage('ready');
            safeSetBooted(true);
            safeSetBooting(false);
          }, 2000);
        }
      };
      emulator.add_listener('serial0-output-byte', onBootByte);

      // Fallback: consider booted after 20 seconds regardless
      setTimeout(() => {
        if (!globalBooted) {
          bootTriggered = true;
          emulator.remove_listener('serial0-output-byte', onBootByte);
          if (!globalExec) {
            globalExec = createSerialExecutor(emulator);
          }
          notifyBoot();
          execRef.current = globalExec;
          safeSetBooted(true);
          safeSetBooting(false);
        }
      }, 20000);
    };
    document.head.appendChild(script);
  }, [containerRef]);

  // Reparent the persistent v86 screen div into the current component's container.
  // This handles navigation between pages that each have a TerminalChallenge.
  useEffect(() => {
    if (!globalScreenDiv || !containerRef?.current) return;
    const container = containerRef.current;
    if (globalScreenDiv.parentNode !== container) {
      container.appendChild(globalScreenDiv);
    }
  }, [booted]);

  useEffect(() => {
    if (globalBooted) {
      setBooted(true);
      emulatorRef.current = globalEmulator;
      execRef.current = globalExec;
    } else {
      const listener = () => {
        safeSetBooted(true);
        emulatorRef.current = globalEmulator;
        execRef.current = globalExec;
      };
      bootListeners.push(listener);
      // Re-check in case notifyBoot() fired between render and effect
      if (globalBooted) {
        listener();
        bootListeners = bootListeners.filter(fn => fn !== listener);
        return;
      }
      return () => { bootListeners = bootListeners.filter(fn => fn !== listener); };
    }
  }, []);

  return { emulator: emulatorRef, exec: execRef, booted, booting, bootStage, boot };
}
