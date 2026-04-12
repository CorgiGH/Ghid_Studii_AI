#!/usr/bin/env node
import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { resolve } from 'path';
import { spawn } from 'child_process';

let url = process.argv[2];
let baseArg = process.argv[3];
if (!url) {
  console.error('Usage: node scripts/review-screenshot.mjs <url-path> [base-url]');
  console.error('Example: node scripts/review-screenshot.mjs /#/y1s2/oop');
  console.error('Example: node scripts/review-screenshot.mjs /#/y1s2/oop https://corgigh.github.io/Ghid_Studii_AI');
  process.exit(1);
}
// Git Bash on Windows expands leading slashes to Windows paths (e.g. /#/y1s2/pa → C:/Program Files/Git/#/y1s2/pa)
// Sanitize: extract the hash route portion if present
const hashMatch = url.match(/(#\/.*)/);
if (hashMatch) url = '/' + hashMatch[1];

// BASE is configurable: accept a URL arg, fall back to localhost dev server.
const BASE = (baseArg || 'http://localhost:5173').replace(/\/+$/, '');
const IS_LOCAL = /^https?:\/\/localhost/i.test(BASE);
const OUT_DIR = resolve('wiki/raw/assets/review');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

await mkdir(OUT_DIR, { recursive: true });

// Check if dev server is running — only auto-start when pointing at localhost.
let devServer = null;
if (IS_LOCAL) {
  try {
    await fetch(BASE);
  } catch {
    console.error('Dev server not running. Starting...');
    devServer = spawn('npm', ['run', 'dev'], { stdio: 'ignore', shell: true, detached: true });
    devServer.unref();
    // Wait for server to be ready
    for (let i = 0; i < 30; i++) {
      try {
        await new Promise(r => setTimeout(r, 1000));
        await fetch(BASE);
        break;
      } catch {
        if (i === 29) {
          console.error('Dev server failed to start after 30s');
          process.exit(1);
        }
      }
    }
    console.error('Dev server started.');
  }
}

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

const configs = [
  { name: 'light-desktop', width: 1280, height: 800, dark: false },
  { name: 'dark-desktop',  width: 1280, height: 800, dark: true },
  { name: 'light-mobile',  width: 375,  height: 812, dark: false },
  { name: 'dark-mobile',   width: 375,  height: 812, dark: true },
];

const paths = [];

// Max step screenshots per config to keep output bounded even on very long courses.
const MAX_STEPS = 20;

for (const config of configs) {
  await page.setViewport({ width: config.width, height: config.height });

  // Set theme via localStorage before navigating.
  // Current app uses 'themeMode' ('light' | 'dark' | 'system'); we also write legacy 'dark'
  // for backwards compatibility with older builds.
  await page.evaluateOnNewDocument((isDark) => {
    try {
      localStorage.setItem('themeMode', JSON.stringify(isDark ? 'dark' : 'light'));
      localStorage.setItem('dark', JSON.stringify(isDark));
    } catch { /* ignore quota */ }
  }, config.dark);

  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle0' });

  // Wait for content to settle (animations, lazy loading)
  await new Promise(r => setTimeout(r, 2000));

  // Capture the initial view.
  const firstFile = `${TIMESTAMP}_${config.name}.png`;
  await page.screenshot({ path: resolve(OUT_DIR, firstFile), fullPage: true });
  paths.push(resolve(OUT_DIR, firstFile));
  console.error(`Captured: ${config.name} → ${firstFile}`);

  // Step-through: find and click the "Continue →" button iteratively.
  // Selector comes from CourseRenderer.jsx nav (buttons with text "Continue" / "Continuă").
  for (let i = 1; i <= MAX_STEPS; i++) {
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => {
        const txt = (b.textContent || '').trim();
        // Match "Continue →" / "Continuă →" only — not "Complete ✓" (end of course)
        // and not generic "Next" outside the step nav.
        return /^(Continue|Continu[ăa])\s*[\u2192→]/.test(txt);
      });
      if (!nextBtn) return false;
      if (nextBtn.disabled || nextBtn.getAttribute('aria-disabled') === 'true') return false;
      const pe = window.getComputedStyle(nextBtn).pointerEvents;
      if (pe === 'none') return false;
      nextBtn.click();
      return true;
    });
    if (!clicked) break;
    await new Promise(r => setTimeout(r, 800));
    const stepFile = `${TIMESTAMP}_${config.name}_step${String(i).padStart(2, '0')}.png`;
    await page.screenshot({ path: resolve(OUT_DIR, stepFile), fullPage: true });
    paths.push(resolve(OUT_DIR, stepFile));
    console.error(`Captured: ${config.name} step ${i} → ${stepFile}`);
  }
}

await browser.close();

// Output paths to stdout (for the visual agent to read)
for (const p of paths) {
  console.log(p);
}

if (devServer) {
  console.error('Note: dev server was started by this script and is still running.');
}
