#!/usr/bin/env node
// One-off live URL screenshot for ALO review (bypasses localhost)
// Captures full-page so math-dense sections below the fold are included.
import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { resolve } from 'path';

const LIVE = 'https://corgigh.github.io/Ghid_Studii_AI/#/y1s2/alo/course_1';
const OUT_DIR = resolve('wiki/raw/assets/review');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

await mkdir(OUT_DIR, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

const configs = [
  { name: 'live-light-desktop', width: 1280, height: 900, dark: false },
  { name: 'live-dark-desktop',  width: 1280, height: 900, dark: true },
  { name: 'live-light-mobile',  width: 390,  height: 844, dark: false },
  { name: 'live-dark-mobile',   width: 390,  height: 844, dark: true },
];

const paths = [];

for (const config of configs) {
  await page.setViewport({ width: config.width, height: config.height, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: config.dark ? 'dark' : 'light' }]);
  await page.evaluateOnNewDocument((isDark) => {
    localStorage.setItem('themeMode', JSON.stringify(isDark ? 'dark' : 'light'));
  }, config.dark);
  await page.goto(LIVE, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate((isDark) => {
    localStorage.setItem('themeMode', JSON.stringify(isDark ? 'dark' : 'light'));
  }, config.dark);
  await page.reload({ waitUntil: 'networkidle0' });
  // Take one screenshot per section by advancing via "Continuă" / "Next" button
  for (let step = 1; step <= 4; step++) {
    await new Promise(r => setTimeout(r, 1200));
    const filename = `${TIMESTAMP}_${config.name}_step${step}.png`;
    const filepath = resolve(OUT_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    paths.push(filepath);
    console.error(`Captured: ${config.name} step ${step} -> ${filename}`);
    if (step === 4) break;
    // Click "Am înțeles asta" (got it) + "Continuă" (continue) or the next button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      // First try "got it" style unlocks
      let got = buttons.find(b => /am înțeles|got it|continuă|continua|continue|next|următor/i.test(b.textContent || ''));
      if (got && !got.disabled) got.click();
    });
    await new Promise(r => setTimeout(r, 700));
    // Second click for the "continue" after unlocking
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      let next = buttons.find(b => /continuă|continua|continue|următor|next/i.test(b.textContent || '') && !b.disabled);
      if (next) next.click();
    });
    await new Promise(r => setTimeout(r, 1500));
  }
}

await browser.close();
for (const p of paths) console.log(p);
