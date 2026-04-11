import { useState, useEffect, useRef, useCallback } from 'react';
import { createSerialExecutor } from '../utils/v86Exec';

let globalEmulator = null;
let globalBooted = false;
let globalExec = null;
let bootListeners = [];

function notifyBoot() {
  globalBooted = true;
  bootListeners.forEach(fn => fn());
  bootListeners = [];
}

export default function useV86(containerRef) {
  const [booted, setBooted] = useState(globalBooted);
  const [booting, setBooting] = useState(false);
  const emulatorRef = useRef(globalEmulator);
  const execRef = useRef(globalExec);

  const boot = useCallback(() => {
    if (globalEmulator || booting) return;
    if (!containerRef?.current) return;
    setBooting(true);

    const basePath = import.meta.env.BASE_URL || '/';

    const script = document.createElement('script');
    script.src = `${basePath}v86/libv86.js`;
    script.onload = () => {
      const emulator = new window.V86({
        wasm_path: `${basePath}v86/v86.wasm`,
        memory_size: 64 * 1024 * 1024,
        vga_memory_size: 2 * 1024 * 1024,
        screen_container: containerRef.current,
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
            setBooted(true);
            setBooting(false);
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
          setBooted(true);
          setBooting(false);
        }
      }, 20000);
    };
    document.head.appendChild(script);
  }, [containerRef, booting]);

  useEffect(() => {
    if (globalBooted) {
      setBooted(true);
      emulatorRef.current = globalEmulator;
      execRef.current = globalExec;
    } else {
      const listener = () => {
        setBooted(true);
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

  return { emulator: emulatorRef, exec: execRef, booted, booting, boot };
}
