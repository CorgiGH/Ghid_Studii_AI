import { useState, useEffect, useRef, useCallback } from 'react';

let globalEmulator = null;
let globalBooted = false;
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

      // Detect boot completion by watching serial output for login prompt
      let output = '';
      emulator.add_listener('serial0-output-byte', (byte) => {
        output += String.fromCharCode(byte);
        if (output.includes('login:') || output.includes('$') || output.includes('#')) {
          if (!globalBooted) {
            // Auto-login if we see login prompt
            setTimeout(() => {
              emulator.serial0_send('root\n');
              setTimeout(() => {
                notifyBoot();
                setBooted(true);
                setBooting(false);
              }, 1000);
            }, 500);
          }
        }
      });

      // Fallback: consider booted after 15 seconds regardless
      setTimeout(() => {
        if (!globalBooted) {
          notifyBoot();
          setBooted(true);
          setBooting(false);
        }
      }, 15000);
    };
    document.head.appendChild(script);
  }, [containerRef, booting]);

  useEffect(() => {
    if (globalBooted) {
      setBooted(true);
      emulatorRef.current = globalEmulator;
    } else {
      bootListeners.push(() => {
        setBooted(true);
        emulatorRef.current = globalEmulator;
      });
    }
  }, []);

  return { emulator: emulatorRef, booted, booting, boot };
}
