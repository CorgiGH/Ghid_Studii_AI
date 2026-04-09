#!/usr/bin/env node
import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { resolve } from 'path';
import { spawn } from 'child_process';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/review-screenshot.mjs <url-path>');
  console.error('Example: node scripts/review-screenshot.mjs /#/y1s2/oop');
  process.exit(1);
}

const BASE = 'http://localhost:5173';
const OUT_DIR = resolve('wiki/raw/assets/review');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

await mkdir(OUT_DIR, { recursive: true });

// Check if dev server is running
let devServer = null;
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

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

const configs = [
  { name: 'light-desktop', width: 1280, height: 800, dark: false },
  { name: 'dark-desktop',  width: 1280, height: 800, dark: true },
  { name: 'light-mobile',  width: 375,  height: 812, dark: false },
  { name: 'dark-mobile',   width: 375,  height: 812, dark: true },
];

const paths = [];

for (const config of configs) {
  await page.setViewport({ width: config.width, height: config.height });

  // Set dark mode via localStorage before navigating
  await page.evaluateOnNewDocument((isDark) => {
    localStorage.setItem('dark', JSON.stringify(isDark));
  }, config.dark);

  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle0' });

  // Wait for content to settle (animations, lazy loading)
  await new Promise(r => setTimeout(r, 2000));

  const filename = `${TIMESTAMP}_${config.name}.png`;
  const filepath = resolve(OUT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  paths.push(filepath);
  console.error(`Captured: ${config.name} → ${filename}`);
}

await browser.close();

// Output paths to stdout (for the visual agent to read)
for (const p of paths) {
  console.log(p);
}

if (devServer) {
  console.error('Note: dev server was started by this script and is still running.');
}
