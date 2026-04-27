#!/usr/bin/env node
/**
 * smoke-test.mjs — pre-deploy gate.
 *
 * Boots `vite preview` against `dist/`, drives Puppeteer through every
 * registry route (home, every subject's tabs, every course/lab/seminar/test),
 * and fails the build if any page hits an ErrorBoundary, throws an uncaught
 * error, or shows a known crash sentinel. Designed to run in GitHub Actions
 * before publishing the Pages artifact.
 *
 * Usage:
 *   npm run build && node scripts/smoke-test.mjs
 *   node scripts/smoke-test.mjs --port 4173 --quiet
 */
import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import { spawn } from 'child_process';
import http from 'http';
import puppeteer from 'puppeteer';

const ROOT = resolve(process.cwd());
const CONTENT = join(ROOT, 'src', 'content');
const BASE_PATH = '/Ghid_Studii_AI/'; // must match vite.config.js `base`
const SUBJECTS = ['os', 'prob-stat', 'alo', 'pa', 'oop'];

const args = process.argv.slice(2);
const PORT = Number(args[args.indexOf('--port') + 1]) || 4173;
const QUIET = args.includes('--quiet');

// ---------- registry parser (regex; avoids importing React-typed modules) ----------
function sliceArray(src, key) {
  const m = new RegExp(`\\b${key}\\s*:\\s*\\[`).exec(src);
  if (!m) return null;
  const start = m.index + m[0].length - 1;
  let depth = 1, i = start + 1;
  while (i < src.length && depth > 0) {
    const c = src[i];
    if (c === '[') depth++;
    else if (c === ']') depth--;
    else if (c === "'" || c === '"' || c === '`') {
      const q = c; i++;
      while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; }
    }
    i++;
  }
  return src.slice(start + 1, i - 1);
}

function countIds(section) {
  if (!section) return 0;
  return (section.match(/\bid\s*:\s*['"`]/g) || []).length;
}

function extractIds(section) {
  if (!section) return [];
  const out = [];
  const re = /\bid\s*:\s*['"`]([^'"`]+)['"`]/g;
  let m;
  while ((m = re.exec(section)) !== null) out.push(m[1]);
  return out;
}

function parseSubject(slug) {
  const file = join(CONTENT, slug, 'index.js');
  let src;
  try { src = readFileSync(file, 'utf-8'); }
  catch { return null; }
  return {
    slug,
    courses: countIds(sliceArray(src, 'courses')),
    labs: countIds(sliceArray(src, 'labs')),
    seminars: countIds(sliceArray(src, 'seminars')),
    testIds: extractIds(sliceArray(src, 'tests')),
  };
}

function buildRoutes() {
  const routes = ['/'];
  for (const slug of SUBJECTS) {
    const m = parseSubject(slug);
    if (!m) continue;
    const base = `/${'y1s2'}/${slug}`;
    routes.push(base);                       // courses tab default (CourseMap)
    routes.push(`${base}/practice`);         // every subject has practice
    if (m.seminars > 0) routes.push(`${base}/seminars`);
    if (m.labs > 0) routes.push(`${base}/labs`);
    if (m.testIds.length > 0) routes.push(`${base}/tests`);
    for (let i = 1; i <= m.courses; i++) routes.push(`${base}/course_${i}`);
    for (let i = 1; i <= m.labs; i++) routes.push(`${base}/lab_${i}`);
    for (let i = 1; i <= m.seminars; i++) routes.push(`${base}/sem_${i}`);
    for (const tid of m.testIds) routes.push(`${base}/tests?test=${encodeURIComponent(tid)}`);
  }
  return routes;
}

// ---------- preview server ----------
function waitForHttp(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolveOk, rejectErr) => {
    const tick = () => {
      const req = http.get(url, res => { res.resume(); resolveOk(); });
      req.on('error', () => {
        if (Date.now() > deadline) rejectErr(new Error(`preview did not start at ${url}`));
        else setTimeout(tick, 250);
      });
    };
    tick();
  });
}

async function startPreview() {
  const isWin = process.platform === 'win32';
  // On Windows, npx is npx.cmd — only resolvable via shell. Pass the full
  // command as a single string to avoid the DEP0190 array+shell warning.
  // Port is validated as Number above so no injection surface.
  const child = isWin
    ? spawn(`npx vite preview --port ${PORT} --strictPort`, {
        cwd: ROOT,
        stdio: QUIET ? 'ignore' : ['ignore', 'pipe', 'pipe'],
        shell: true,
      })
    : spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
        cwd: ROOT,
        stdio: QUIET ? 'ignore' : ['ignore', 'pipe', 'pipe'],
      });
  if (!QUIET) {
    child.stdout?.on('data', d => process.stderr.write(`[preview] ${d}`));
    child.stderr?.on('data', d => process.stderr.write(`[preview] ${d}`));
  }
  await waitForHttp(`http://localhost:${PORT}${BASE_PATH}`);
  return child;
}

// ---------- smoke ----------
async function smoke(routes) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Per-route crash buckets
  let current = null;
  const failures = [];
  const noteFailure = (route, kind, detail) => failures.push({ route, kind, detail });

  // Known-noise console.error patterns. Anything matching is dropped to avoid
  // false positives. Anything else is treated as a real failure — production
  // builds shouldn't be screaming on render unless something's wrong.
  const CONSOLE_ERROR_NOISE = [
    /Failed to load resource.*favicon/i,
    /\bfavicon\b.*404/i,
    /\bDevTools\b/i,
    /chrome-extension:/i,
  ];

  page.on('pageerror', err => {
    if (current) noteFailure(current, 'pageerror', err.message);
  });
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    if (!current) return;
    const text = msg.text();
    if (text.includes('ErrorBoundary caught:')) {
      noteFailure(current, 'errorBoundary', text.slice(0, 300));
      return;
    }
    if (CONSOLE_ERROR_NOISE.some(re => re.test(text))) return;
    noteFailure(current, 'consoleError', text.slice(0, 300));
  });

  // First load picks up the SPA shell + hash. Subsequent routes flip the hash
  // so we don't pay the bundle-eval cost 100+ times.
  const baseUrl = `http://localhost:${PORT}${BASE_PATH}`;
  await page.goto(baseUrl + '#/', { waitUntil: 'networkidle0', timeout: 30000 });

  for (const route of routes) {
    current = route;
    const target = '#' + route;
    try {
      await page.evaluate(t => {
        // Force a real navigation even when the hash equals current — covers
        // routes that fire side effects only on hashchange.
        if (window.location.hash === t) window.location.hash = '#__smoke_reset__';
        window.location.hash = t;
      }, target);
      // Settle: KaTeX, Suspense, JSON loaders. 350ms is plenty in headless prod build.
      await new Promise(r => setTimeout(r, 350));

      const probe = await page.evaluate(() => {
        const txt = (document.body.innerText || '').trim();
        // "Skeleton-only" detection: if every non-whitespace child is a
        // skeleton-shimmer placeholder, we're stuck in Suspense. The bundle
        // is fast in headless preview so this should never trigger unless a
        // lazy chunk legitimately failed to resolve.
        const skeletons = document.querySelectorAll('.skeleton-shimmer').length;
        const headings = document.querySelectorAll('h1, h2, h3').length;
        const buttons = document.querySelectorAll('button').length;
        return {
          crashed: txt.includes('Something went wrong'),
          unknownBlock: /Unknown (?:block type|seminar block type)/.test(txt),
          notFound: txt.includes('Subject not found'),
          jsonMissing: /JSON content not found:/.test(txt),
          textLen: txt.length,
          skeletons,
          headings,
          buttons,
          firstLine: txt.slice(0, 160).replace(/\s+/g, ' ').trim(),
        };
      });

      if (probe.crashed) noteFailure(route, 'errorBoundary', probe.firstLine);
      if (probe.unknownBlock) noteFailure(route, 'unknownBlock', probe.firstLine);
      if (probe.notFound) noteFailure(route, 'notFound', probe.firstLine);
      if (probe.jsonMissing) noteFailure(route, 'jsonMissing', probe.firstLine);

      // Content-presence assertions. Skip the home and bare-subject overview
      // routes (CourseMap may render only buttons) — focus on the leaf routes
      // that load JSON/JSX and should produce real content.
      const isLeaf = /\/(course|lab|sem)_\d+$/.test(route)
        || (route.includes('/tests') && route.includes('?test='))
        || /\/(seminars|labs|practice)$/.test(route);
      if (isLeaf) {
        if (probe.textLen < 80) {
          noteFailure(route, 'emptyContent', `body text=${probe.textLen}c, headings=${probe.headings}, buttons=${probe.buttons}`);
        }
        if (probe.skeletons > 0 && probe.headings === 0 && probe.buttons === 0) {
          noteFailure(route, 'stuckInSuspense', `skeletons=${probe.skeletons}, no headings/buttons`);
        }
      }
    } catch (e) {
      noteFailure(route, 'navError', e.message);
    }
  }

  await browser.close();
  return failures;
}

// ---------- main ----------
const routes = buildRoutes();
console.log(`smoke: ${routes.length} routes across ${SUBJECTS.length} subjects`);

const preview = await startPreview();
let failures = [];
try {
  failures = await smoke(routes);
} finally {
  preview.kill();
}

if (failures.length === 0) {
  console.log(`smoke: PASS (${routes.length} routes)`);
  process.exit(0);
}

const byRoute = {};
for (const f of failures) (byRoute[f.route] ||= []).push(f);
console.error(`\nsmoke: FAIL — ${Object.keys(byRoute).length} broken route(s)\n`);
for (const [route, list] of Object.entries(byRoute)) {
  console.error(`  ${route}`);
  for (const f of list) console.error(`    [${f.kind}] ${f.detail}`);
}
process.exit(1);
