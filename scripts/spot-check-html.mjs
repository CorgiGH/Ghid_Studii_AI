#!/usr/bin/env node
/**
 * spot-check-html.mjs — render the spot-check sample as a click-to-grade
 * single-file HTML page. State persists in localStorage; user can export the
 * filled markdown when done.
 *
 * Usage:
 *   node scripts/spot-check-html.mjs --seed=42 --count=50 --out=docs/spot-check.html
 *   open docs/spot-check.html
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync } from 'fs';
import { join, resolve, sep, dirname, basename } from 'path';
import { execFileSync } from 'child_process';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { pdf as pdfToImg } from 'pdf-to-img';
import { createCanvas, loadImage } from '@napi-rs/canvas';

// Silence pdfjs verbose warnings (CCITTFax / JBig2) during text extraction.
const _origWarn = console.warn;
console.warn = (...a) => { const s = String(a[0] || ''); if (s.startsWith('Warning:')) return; _origWarn(...a); };

const ROOT = resolve(process.cwd());
const CONTENT = join(ROOT, 'src', 'content');
const args = process.argv.slice(2);
const COUNT = Number(args.find(a => a.startsWith('--count='))?.split('=')[1]) || 50;
const SEED = Number(args.find(a => a.startsWith('--seed='))?.split('=')[1]) || 42;
// --bundle=path/to/out.zip → produce a self-contained zip with html + pdfs/ for offline distribution.
// In bundle mode, OUT and PDF_BASE are overridden to assemble files under a staging dir.
const BUNDLE_ZIP = args.find(a => a.startsWith('--bundle='))?.split('=')[1] || null;
const BUNDLE_DIR = BUNDLE_ZIP ? BUNDLE_ZIP.replace(/\.zip$/i, '') + '-staging' : null;
const OUT = BUNDLE_DIR
  ? join(BUNDLE_DIR, 'spot-check.html')
  : (args.find(a => a.startsWith('--out='))?.split('=')[1] || 'docs/spot-check.html');
// PDF base path used in the generated HTML — relative to the HTML file location.
// Bundle: html + pdfs/ are siblings, so "./pdfs/X.pdf".
// Dev (docs/): html is in docs/, pdfs in wiki/raw/pdfs/, so "../wiki/raw/pdfs/X.pdf".
const PDF_BASE = BUNDLE_DIR ? './pdfs/' : '../wiki/raw/pdfs/';

function rng(s) {
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (p.endsWith('.json')) out.push(p);
  }
  return out;
}
const bilEn = n => !n ? '' : typeof n === 'string' ? n : n.en || n.ro || '';
const optionText = o => !o ? '' : typeof o === 'string' ? o : o.text ? bilEn(o.text) : bilEn(o);
function extractMC(file, json) {
  const out = [];
  const rel = file.split(sep).join('/').replace(ROOT.split(sep).join('/') + '/', '');
  const subject = rel.split('/')[2];
  const isTest = rel.includes('/tests/');
  if (Array.isArray(json.questions)) {
    json.questions.forEach((q, i) => {
      if (q.type !== 'multiple-choice') return;
      let idx;
      if (typeof q.correctIndex === 'number') idx = q.correctIndex;
      else if (Array.isArray(q.correctIndices) && q.correctIndices.length === 1) idx = q.correctIndices[0];
      else return;
      const opts = (q.options || []).map(optionText);
      if (opts.length < 2) return;
      out.push({ file: rel, subject, isTest, qid: q.id || `q${i}`,
        prompt: bilEn(q.prompt) || bilEn(q.question) || '',
        options: opts, recordedIdx: idx,
        sourceHint: q.reviewStep || q.lectureRef || (json.meta?.title?.en) || '' });
    });
  }
  if (Array.isArray(json.steps)) {
    json.steps.forEach((step, si) => {
      (step.blocks || []).forEach((block, bi) => {
        if (block.type !== 'quiz') return;
        const qs = Array.isArray(block.questions) ? block.questions : block.question ? [block.question] : [];
        qs.forEach((q, qi) => {
          const opts = q.options || [];
          const idx = opts.findIndex(o => o.correct === true);
          if (idx < 0 || opts.length < 2) return;
          out.push({ file: rel, subject, isTest: false,
            qid: q.id || `${step.id}-b${bi}-q${qi}`,
            prompt: bilEn(q.question) || bilEn(q.prompt) || '',
            options: opts.map(optionText), recordedIdx: idx,
            sourceHint: q.reviewStep || step.id || (json.meta?.title?.en) || '' });
        });
      });
    });
  }
  return out;
}

// Map a content JSON path → relative PDF path emitted into the HTML.
// PDF_BASE depends on output mode (dev = ../wiki/raw/pdfs/, bundle = ./pdfs/).
function pdfFor(file) {
  let m = file.match(/^src\/content\/os\/courses\/course-(\d+)\.json$/);
  if (m) return `${PDF_BASE}OS-Course-${parseInt(m[1], 10)}.pdf`;
  m = file.match(/^src\/content\/oop\/courses\/course-(\d+)\.json$/);
  if (m) return `${PDF_BASE}Course-${parseInt(m[1], 10)}.pdf`;
  return null;
}
// Resolve a PDF reference back to its absolute source path under wiki/raw/pdfs/ —
// used by the text extractor (always reads from the canonical source) and by the
// bundle copier.
function resolvePdfSource(emittedPath) {
  const name = emittedPath.split('/').pop();
  return join(ROOT, 'wiki', 'raw', 'pdfs', name);
}

const all = [];
for (const f of walk(CONTENT)) {
  let json; try { json = JSON.parse(readFileSync(f, 'utf-8')); } catch { continue; }
  all.push(...extractMC(f, json));
}
// Attach pdf path to every record.
all.forEach(q => { q.pdf = pdfFor(q.file); });

// Course-only mode (default): drop test Qs and any course Q whose subject has no PDF in raw/.
const COURSE_ONLY = !args.includes('--include-tests');
const pool = COURSE_ONLY ? all.filter(q => !q.isTest && q.pdf) : all;
const rand = rng(SEED);
const pick = (p, n) => {
  const c = p.slice();
  for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
  return c.slice(0, n);
};
let sample;
if (COURSE_ONLY) {
  sample = pick(pool, Math.min(COUNT, pool.length));
} else {
  const tests = all.filter(q => q.isTest);
  const courses = all.filter(q => !q.isTest);
  const targetTests = Math.min(Math.round(COUNT * 0.6), tests.length);
  sample = [...pick(tests, targetTests), ...pick(courses, COUNT - targetTests)];
  for (let i = sample.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [sample[i], sample[j]] = [sample[j], sample[i]]; }
}

// ---------- PDF text extraction + page hint resolver ----------
// Cache: pdf path → array of normalized page text strings (1-based; index 0 unused).
const PDF_CACHE_DIR = join(ROOT, '.cache', 'pdf-text');
mkdirSync(PDF_CACHE_DIR, { recursive: true });

async function extractPdfText(relPdfPath) {
  // relPdfPath is the path emitted into HTML; the canonical source PDF always
  // lives in wiki/raw/pdfs/<basename> regardless of bundle vs. dev mode.
  const abs = resolvePdfSource(relPdfPath);
  const cacheFile = join(PDF_CACHE_DIR, basename(abs) + '.json');
  if (existsSync(cacheFile)) {
    try { return JSON.parse(readFileSync(cacheFile, 'utf-8')); } catch { /* refall through */ }
  }
  const buf = readFileSync(abs);
  const data = new Uint8Array(buf);
  const doc = await pdfjs.getDocument({ data, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: false, verbosity: 0 }).promise;
  const pages = ['']; // 1-based
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    const text = tc.items.map(it => it.str).join(' ').replace(/\s+/g, ' ').toLowerCase();
    pages.push(text);
  }
  await doc.destroy();
  writeFileSync(cacheFile, JSON.stringify(pages));
  return pages;
}

// Stopwords (EN + RO) — short tokens get pruned; these get dropped explicitly.
const STOP = new Set([
  'the','and','for','that','this','with','from','what','which','when','where','have','will','your','about',
  'into','than','then','they','them','their','there','these','those','some','also','only','such','more',
  'most','many','much','other','being','been','were','was','are','its','was','can','any','one','two',
  'pentru','este','acest','sunt','este','dintre','dintre','intre','intre','dupa','daca','prin','asupra',
  'insa','nu','sau','un','o','la','de','si','in','pe','cu','ca','sa','se','iar','am','au','dar',
  'all','any','out','use','all','not','but','off','via','too','yes','let','let',
]);
function tokens(s) {
  if (!s) return [];
  return String(s).toLowerCase()
    .replace(/[^a-z0-9_+\-*/() ]+/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 4 && !STOP.has(t));
}
// rankPages — score every page in `pageTexts` against the question/option
// terms, return top-K hits above a confidence threshold. Returning an empty
// array (rather than the page with score=1) is intentional: graders reported
// that low-confidence hints are *worse* than no hint, because they get
// trusted as "the source page" and lead to spurious ⚠ ambiguous verdicts.
const RANK_TOP_K = 5;            // was 3 — broader coverage when right page barely loses tie
const RANK_MIN_SCORE = 4;        // require at least one option-token (3) + one prompt-token (1), or any bigram (8)
const RANK_MIN_RATIO = 0.4;      // suppress pages whose score is < 40% of the top hit (long tail noise)
function rankPages(pageTexts, prompt, correctOpt) {
  const pTok = tokens(prompt);
  const oTok = tokens(correctOpt);
  // Build bigrams from option text — strong signal.
  const bigrams = [];
  const oRaw = (correctOpt || '').toLowerCase().split(/\s+/).filter(Boolean);
  for (let i = 0; i < oRaw.length - 1; i++) {
    const bg = oRaw[i] + ' ' + oRaw[i + 1];
    if (bg.length >= 8) bigrams.push(bg);
  }
  const scored = [];
  for (let i = 1; i < pageTexts.length; i++) {
    const txt = pageTexts[i];
    if (!txt) continue;
    let s = 0;
    for (const t of oTok) if (txt.includes(t)) s += 3;
    for (const t of pTok) if (txt.includes(t)) s += 1;
    for (const bg of bigrams) if (txt.includes(bg)) s += 8;
    if (s >= RANK_MIN_SCORE) scored.push({ page: i, score: s });
  }
  scored.sort((a, b) => b.score - a.score);
  if (scored.length === 0) return [];
  const cutoff = scored[0].score * RANK_MIN_RATIO;
  return scored.filter(s => s.score >= cutoff).slice(0, RANK_TOP_K);
}

// Resolve hints for every sampled question whose PDF is mapped.
console.log('Extracting PDF text for page hints...');
const pdfTextCache = new Map();
for (const q of all) {
  if (!q.pdf) continue;
  if (!pdfTextCache.has(q.pdf)) {
    process.stdout.write(`  ${q.pdf}... `);
    const t = await extractPdfText(q.pdf);
    pdfTextCache.set(q.pdf, t);
    console.log(`${t.length - 1} pages`);
  }
}

// Build pageHints for every sampled question (with PDF). Returns the same sample
// shape augmented with `pageHints: [{page, score, imgPath?}]` per question.
const sampleWithHints = sample.map(q => {
  const out = { ...q };
  if (q.pdf && pdfTextCache.has(q.pdf)) {
    const correct = q.options[q.recordedIdx] || '';
    out.pageHints = rankPages(pdfTextCache.get(q.pdf), q.prompt, correct);
  } else {
    out.pageHints = [];
  }
  return out;
});

// Bundle-image mode: rasterize every unique (pdf, page) hint to a small JPEG.
// Embedded as separate files in <bundle>/pages/ so the bundle stays self-contained
// without shipping the full PDFs (Discord 10 MB cap).
const PAGE_IMG_CACHE = join(ROOT, '.cache', 'pdf-pages');
mkdirSync(PAGE_IMG_CACHE, { recursive: true });
const RASTER_SCALE = 0.7;
const RASTER_QUALITY = 55;

function pageImgFilename(pdfBasename, pageNum) {
  return pdfBasename.replace(/\.pdf$/i, '') + '-p' + String(pageNum).padStart(2, '0') + '.jpg';
}

async function rasterizePages(pdfPath, wantedPages) {
  // wantedPages = Set<number>. Returns Map<page, Buffer> for those pages,
  // pulling from cache when present, rendering any misses.
  const pdfName = basename(pdfPath);
  const out = new Map();
  const misses = new Set();
  for (const p of wantedPages) {
    const cached = join(PAGE_IMG_CACHE, pageImgFilename(pdfName, p));
    if (existsSync(cached)) out.set(p, readFileSync(cached));
    else misses.add(p);
  }
  if (misses.size === 0) return out;
  const it = await pdfToImg(pdfPath, { scale: RASTER_SCALE });
  let i = 0;
  for await (const pngBuf of it) {
    i++;
    if (!misses.has(i)) continue;
    const img = await loadImage(pngBuf);
    const c = createCanvas(img.width, img.height);
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const jpg = await c.encode('jpeg', RASTER_QUALITY);
    out.set(i, jpg);
    writeFileSync(join(PAGE_IMG_CACHE, pageImgFilename(pdfName, i)), jpg);
    misses.delete(i);
    if (misses.size === 0) break;
  }
  return out;
}

if (BUNDLE_DIR) {
  console.log('Rasterizing hint pages to JPEG...');
  const pagesDir = join(BUNDLE_DIR, 'pages');
  mkdirSync(pagesDir, { recursive: true });
  // Group wanted pages by PDF.
  const byPdf = new Map();
  for (const q of sampleWithHints) {
    if (!q.pdf) continue;
    const pdfName = basename(q.pdf);
    const srcPath = resolvePdfSource(q.pdf);
    if (!byPdf.has(pdfName)) byPdf.set(pdfName, { srcPath, pages: new Set() });
    for (const h of q.pageHints) byPdf.get(pdfName).pages.add(h.page);
  }
  let totalBytes = 0;
  for (const [pdfName, { srcPath, pages }] of byPdf) {
    process.stdout.write(`  ${pdfName} (${pages.size} pages)... `);
    const rendered = await rasterizePages(srcPath, pages);
    for (const [pageNum, buf] of rendered) {
      const fname = pageImgFilename(pdfName, pageNum);
      writeFileSync(join(pagesDir, fname), buf);
      totalBytes += buf.length;
    }
    console.log('done');
  }
  console.log(`  total raw page bytes: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  // Annotate each pageHint with its imgPath for the HTML.
  for (const q of sampleWithHints) {
    if (!q.pdf) continue;
    const pdfName = basename(q.pdf);
    for (const h of q.pageHints) {
      h.imgPath = './pages/' + pageImgFilename(pdfName, h.page);
    }
  }
}

const dataJson = JSON.stringify(sampleWithHints);
const BUNDLE_MODE = !!BUNDLE_DIR;
const STATE_KEY = COURSE_ONLY ? `spot-${SEED}-courses` : `spot-${SEED}`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Content spot-check — seed ${SEED}</title>
<style>
  :root { --bg:#0f172a; --fg:#e2e8f0; --muted:#94a3b8; --card:#1e293b; --border:#334155;
          --accent:#3b82f6; --ok:#22c55e; --bad:#ef4444; --warn:#f59e0b; }
  @media (prefers-color-scheme: light) {
    :root { --bg:#f8fafc; --fg:#0f172a; --muted:#475569; --card:#fff; --border:#cbd5e1; }
  }
  * { box-sizing: border-box; }
  body { background: var(--bg); color: var(--fg); font-family: ui-sans-serif, system-ui, sans-serif;
         margin: 0; padding: 16px; line-height: 1.5; }
  .layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px;
            max-width: 1800px; margin-inline: auto; align-items: start; }
  .col-left { min-width: 0; }
  .col-right { position: sticky; top: 16px; height: calc(100vh - 32px); display: flex; flex-direction: column;
               border: 1px solid var(--border); border-radius: 12px; background: var(--card); overflow: hidden; }
  .col-right .pdf-head { padding: 8px 12px; border-bottom: 1px solid var(--border); display: flex; gap: 8px;
                          align-items: center; flex-wrap: wrap; font-size: 13px; }
  .col-right .pdf-head .label { color: var(--muted); }
  .col-right .pdf-head .name { font-family: ui-monospace, monospace; }
  .col-right iframe { flex: 1; border: 0; width: 100%; background: #fff; }
  .col-right .pdf-imgwrap { flex: 1; overflow: auto; background: #fff; padding: 12px; display: flex; align-items: flex-start; justify-content: center; }
  .col-right .pdf-imgwrap img { max-width: 100%; height: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .col-right .empty { flex: 1; display: flex; align-items: center; justify-content: center;
                       color: var(--muted); padding: 24px; text-align: center; font-size: 14px; }
  .scope-banner { background: rgba(245, 158, 11, 0.12); border: 1px solid var(--warn);
                   border-radius: 8px; padding: 12px 14px; margin: 12px 0; font-size: 14px; line-height: 1.5; }
  .scope-banner strong { color: var(--warn); }
  .grader-card { background: var(--card); border: 1px solid var(--border); border-radius: 8px;
                  padding: 12px 14px; margin: 0 0 16px; }
  .grader-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grader-row label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--muted); }
  .grader-row input { padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px;
                       background: var(--bg); color: var(--fg); font-family: inherit; font-size: 14px; }
  .grader-hint { font-size: 12px; color: var(--muted); margin-top: 8px; }
  .merge-protocol { margin-top: 32px; padding: 16px; border-top: 2px solid var(--border);
                     font-size: 13px; color: var(--muted); line-height: 1.6; }
  .merge-protocol strong { color: var(--fg); }
  @media (max-width: 600px) { .grader-row { grid-template-columns: 1fr; } }
  @media (max-width: 1100px) {
    .layout { grid-template-columns: 1fr; }
    .col-right { position: relative; top: 0; height: 70vh; }
  }
  h1 { margin: 0 0 8px; font-size: 24px; }
  .meta { color: var(--muted); font-size: 13px; margin-bottom: 24px; }
  .progress { position: sticky; top: 0; background: var(--bg); padding: 12px 0; border-bottom: 1px solid var(--border);
              z-index: 10; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .progress .bar { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; min-width: 200px; }
  .progress .fill { height: 100%; background: var(--accent); transition: width 0.3s; }
  .stats { font-size: 13px; color: var(--muted); }
  .stats .ok { color: var(--ok); } .stats .bad { color: var(--bad); } .stats .warn { color: var(--warn); }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px;
          padding: 20px; margin: 16px 0; }
  .card.done { opacity: 0.55; }
  .card .head { display: flex; justify-content: space-between; gap: 12px; font-size: 12px;
                color: var(--muted); margin-bottom: 8px; flex-wrap: wrap; }
  .card .file { font-family: ui-monospace, monospace; }
  .card .subj { padding: 2px 8px; border-radius: 4px; background: var(--accent); color: #fff; font-weight: 600; }
  .card .test-badge { padding: 2px 8px; border-radius: 4px; background: var(--warn); color: #000; font-weight: 600; }
  .prompt { font-size: 16px; margin: 12px 0; }
  .opt { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; margin: 6px 0;
         font-family: ui-monospace, monospace; font-size: 14px; }
  .opt.recorded { border-color: var(--accent); background: rgba(59,130,246,0.1); }
  .opt.recorded::before { content: '✓ recorded → '; color: var(--accent); font-family: inherit; font-weight: 600; }
  .actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  button { padding: 8px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--card);
           color: var(--fg); cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.15s; }
  button:hover { transform: translateY(-1px); }
  button.ok    { border-color: var(--ok);   } button.ok.active    { background: var(--ok);   color: #000; }
  button.bad   { border-color: var(--bad);  } button.bad.active   { background: var(--bad);  color: #fff; }
  button.warn  { border-color: var(--warn); } button.warn.active  { background: var(--warn); color: #000; }
  .extras { display: grid; grid-template-columns: 1fr 2fr; gap: 8px; margin-top: 10px; }
  .extras input, .extras textarea { padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px;
           background: var(--bg); color: var(--fg); font-family: inherit; font-size: 14px; }
  .extras textarea { min-height: 32px; resize: vertical; }
  .toolbar { display: flex; gap: 8px; margin: 24px 0 16px; flex-wrap: wrap; }
  .toolbar button { background: var(--accent); color: #fff; border-color: var(--accent); }
  .toolbar button.danger { background: transparent; color: var(--bad); border-color: var(--bad); }
  textarea#exportBox { width: 100%; min-height: 200px; margin-top: 12px; padding: 12px;
        background: var(--bg); border: 1px solid var(--border); color: var(--fg); border-radius: 6px;
        font-family: ui-monospace, monospace; font-size: 12px; }
  details { margin: 8px 0; }
  summary { cursor: pointer; color: var(--muted); font-size: 13px; }
</style>
</head>
<body>
<h1>Content spot-check</h1>
<div class="meta">Seed <code>${SEED}</code> · ${sample.length} questions · pool ${pool.length} · ${COURSE_ONLY ? 'courses-only (OS + OOP — subjects with source PDFs)' : 'biased ~60% toward exam tests'} · state saved to localStorage key <code>${STATE_KEY}</code></div>

<div class="scope-banner">
  <strong>Scope:</strong> this round audits <em>course-extraction fidelity only</em> — does the recorded "correct" answer match what the lecture slides say? <strong>Test-bank answer keys are NOT covered here</strong> (those need a separate audit). A green report on this sample says nothing about exam questions.
</div>

<div class="grader-card">
  <div class="grader-row">
    <label>Your name <input type="text" id="graderName" placeholder="e.g. Alex P." autocomplete="off"></label>
    <label>Discord/email <input type="text" id="graderContact" placeholder="how the maintainer reaches you" autocomplete="off"></label>
  </div>
  <div class="grader-hint">Filled into the export header. Saved locally — won't leave this browser until you click <strong>Copy markdown</strong>.</div>
</div>

<div class="layout">
  <div class="col-left">
    <div class="progress">
      <div class="bar"><div class="fill" id="bar"></div></div>
      <div id="stats" class="stats">0 / ${sample.length}</div>
    </div>

    <div class="toolbar">
      <button id="exportBtn">Export markdown</button>
      <button id="copyBtn">Copy markdown</button>
      <button id="resetBtn" class="danger">Reset all (clears localStorage)</button>
    </div>

    <details><summary>How to grade</summary>
    <p style="font-size:13px;color:var(--muted)">Click <strong>📖 Load source</strong> on a question card. Source PDF appears in the right pane. Use Ctrl+F inside the PDF viewer to find content matching the source hint, then check whether the recorded answer is correct vs the lecture material. Mark verdict + jot the page number you found it on.</p>
    </details>

    <div id="cards"></div>

    <textarea id="exportBox" placeholder="Click 'Export markdown' to populate" readonly></textarea>

    <div class="merge-protocol">
      <strong>Merge protocol:</strong> three graders are reviewing the same 50 items. For each question, <strong>majority of 3 wins</strong>; ties or 1-of-3 disagreements are resolved by the maintainer, who reads the dissenting grader's notes before deciding. This means the <em>notes</em> field matters when you mark <strong>❌ wrong</strong> or <strong>⚠ ambiguous</strong> — write down the page you found it on and what the slide actually says.
    </div>
  </div>

  <div class="col-right" id="pdfPane">
    <div class="pdf-head">
      <span class="label">${BUNDLE_MODE ? 'Slide image:' : 'Source PDF:'}</span>
      <span class="name" id="pdfName">—</span>
    </div>
    <div class="empty" id="pdfEmpty">Click <strong>📖 p.N</strong> on any question card to view ${BUNDLE_MODE ? 'the slide image here' : 'its source PDF here'}.</div>
    ${BUNDLE_MODE
      ? '<div class="pdf-imgwrap" id="pdfImgWrap" style="display:none"><img id="pdfImg" alt=""></div>'
      : '<iframe id="pdfFrame" style="display:none" title="Source PDF"></iframe>'}
  </div>
</div>

<script>
const data = ${dataJson};
const SEED = ${SEED};
const KEY = ${JSON.stringify(STATE_KEY)};
const GRADER_KEY = KEY + '-grader';
const state = JSON.parse(localStorage.getItem(KEY) || '{}');
const grader = JSON.parse(localStorage.getItem(GRADER_KEY) || '{}');
// Restore grader fields after DOM ready.
window.addEventListener('DOMContentLoaded', () => {
  const n = document.getElementById('graderName');
  const c = document.getElementById('graderContact');
  if (n) n.value = grader.name || '';
  if (c) c.value = grader.contact || '';
  [n, c].forEach(el => el && el.addEventListener('input', () => {
    grader.name = (n && n.value) || '';
    grader.contact = (c && c.value) || '';
    localStorage.setItem(GRADER_KEY, JSON.stringify(grader));
  }));
});

function save() { localStorage.setItem(KEY, JSON.stringify(state)); render(); }
function render() {
  const cards = document.getElementById('cards');
  cards.innerHTML = '';
  let done = 0, ok = 0, bad = 0, warn = 0;
  data.forEach((q, i) => {
    const s = state[i] || {};
    if (s.verdict) {
      done++;
      if (s.verdict === 'ok') ok++;
      else if (s.verdict === 'bad') bad++;
      else if (s.verdict === 'warn') warn++;
    }
    const card = document.createElement('div');
    card.className = 'card' + (s.verdict ? ' done' : '');
    card.innerHTML = \`
      <div class="head">
        <div><span class="subj">\${q.subject}</span> \${q.isTest ? '<span class="test-badge">EXAM</span>' : ''} <span class="file">\${q.file}</span></div>
        <div>\${i+1}/\${data.length} · \${q.qid}</div>
      </div>
      \${q.sourceHint ? \`<div style="font-size:12px;color:var(--muted)">Source hint: <em>\${q.sourceHint}</em></div>\` : ''}
      <div class="prompt">\${escapeHtml(q.prompt)}</div>
      \${q.options.map((o, k) => \`<div class="opt \${k===q.recordedIdx ? 'recorded' : ''}">\${k}) \${escapeHtml(o)}</div>\`).join('')}
      <div class="actions">
        \${q.pdf ? renderSourceButtons(q, i) : '<button disabled title="No source PDF available for this subject">📖 No source PDF</button>'}
        <button class="ok \${s.verdict==='ok'?'active':''}" data-i="\${i}" data-v="ok">✅ correct</button>
        <button class="bad \${s.verdict==='bad'?'active':''}" data-i="\${i}" data-v="bad">❌ wrong</button>
        <button class="warn \${s.verdict==='warn'?'active':''}" data-i="\${i}" data-v="warn">⚠ ambiguous</button>
      </div>
      <div class="extras">
        <input type="text" placeholder="source page (e.g. 12)" data-i="\${i}" data-f="page" value="\${s.page || ''}">
        <textarea placeholder="notes (only when ❌ or ⚠)" data-i="\${i}" data-f="notes">\${s.notes || ''}</textarea>
      </div>
    \`;
    cards.appendChild(card);
  });
  document.getElementById('bar').style.width = (done / data.length * 100) + '%';
  document.getElementById('stats').innerHTML =
    \`<span class="ok">✅ \${ok}</span> · <span class="bad">❌ \${bad}</span> · <span class="warn">⚠ \${warn}</span> · \${done}/\${data.length}\`;
}
const BUNDLE_MODE = ${JSON.stringify(BUNDLE_MODE)};
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]); }
function renderSourceButtons(q, i) {
  const name = escapeHtml(q.pdf.split('/').pop());
  const hints = (q.pageHints || []);
  if (BUNDLE_MODE) {
    if (hints.length === 0) return '<span style="font-size:12px;color:var(--muted)">no page match (skip / mark ambiguous)</span>';
    return hints.map(h => \`<button data-img="\${escapeHtml(h.imgPath)}" data-pdfname="\${name}" data-page="\${h.page}" data-i="\${i}" data-v="pdf" title="ranked match (score \${h.score})">📖 p.\${h.page}</button>\`).join('');
  }
  const pageBtns = hints.map(h => \`<button data-pdf="\${escapeHtml(q.pdf)}" data-pdfname="\${name}" data-page="\${h.page}" data-i="\${i}" data-v="pdf" title="ranked match (score \${h.score})">📖 p.\${h.page}</button>\`).join('');
  const fullBtn = \`<button data-pdf="\${escapeHtml(q.pdf)}" data-pdfname="\${name}" data-i="\${i}" data-v="pdf" title="open PDF at first page">📄 full PDF</button>\`;
  if (hints.length === 0) return \`<span style="font-size:12px;color:var(--muted);margin-right:6px">no page match</span>\${fullBtn}\`;
  return pageBtns + fullBtn;
}

function loadSource(btn) {
  const empty = document.getElementById('pdfEmpty');
  const nameEl = document.getElementById('pdfName');
  const page = btn.dataset.page;
  const name = btn.dataset.pdfname;
  if (BUNDLE_MODE) {
    const wrap = document.getElementById('pdfImgWrap');
    const img = document.getElementById('pdfImg');
    img.src = btn.dataset.img;
    wrap.style.display = 'flex';
    empty.style.display = 'none';
    nameEl.textContent = name + (page ? ' · p.' + page : '');
  } else {
    const frame = document.getElementById('pdfFrame');
    const src = btn.dataset.pdf;
    frame.src = page ? src + '#page=' + page : src;
    frame.style.display = 'block';
    empty.style.display = 'none';
    nameEl.textContent = name + (page ? ' · p.' + page : '');
  }
}
document.addEventListener('click', e => {
  const btn = e.target.closest('button[data-i]');
  if (!btn) return;
  const v = btn.dataset.v;
  if (v === 'pdf') {
    loadSource(btn);
    return;
  }
  const i = +btn.dataset.i;
  state[i] = state[i] || {};
  state[i].verdict = state[i].verdict === v ? null : v;
  save();
});
document.addEventListener('input', e => {
  const el = e.target.closest('[data-i][data-f]');
  if (!el) return;
  const i = +el.dataset.i, f = el.dataset.f;
  state[i] = state[i] || {};
  state[i][f] = el.value;
  localStorage.setItem(KEY, JSON.stringify(state)); // skip render to keep focus
});

function buildMarkdown() {
  const lines = [];
  lines.push('# Content spot-check — graded');
  lines.push('');
  lines.push('**Grader:** ' + (grader.name || '(unset)'));
  lines.push('**Contact:** ' + (grader.contact || '(unset)'));
  lines.push('**Scope:** course-extraction fidelity only (test-bank NOT covered)');
  lines.push('**Date:** ' + new Date().toISOString().slice(0, 10));
  lines.push('');
  lines.push('Seed: \`' + SEED + '\`');
  let ok=0, bad=0, warn=0;
  for (const k in state) {
    const v = state[k]?.verdict;
    if (v === 'ok') ok++;
    if (v === 'bad') bad++;
    if (v === 'warn') warn++;
  }
  lines.push('');
  lines.push('## Tally');
  lines.push('- ✅ Correct: ' + ok + ' / ' + data.length);
  lines.push('- ❌ Wrong: ' + bad + ' / ' + data.length);
  lines.push('- ⚠ Ambiguous: ' + warn + ' / ' + data.length);
  lines.push('');
  if (bad === 0 && warn < 3) lines.push('**Decision:** <2 wrong → fears overblown.');
  else if (bad <= 5) lines.push('**Decision:** 2-5 wrong → audit similar files.');
  else lines.push('**Decision:** >5 wrong → laundering risk realized; broaden audit.');
  lines.push('');
  lines.push('## Wrong / ambiguous detail');
  data.forEach((q, i) => {
    const s = state[i] || {};
    if (s.verdict === 'ok' || !s.verdict) return;
    lines.push('### ' + (i+1) + '. \`' + q.file + '\` — \`' + q.qid + '\` — ' + (s.verdict === 'bad' ? '❌ wrong' : '⚠ ambiguous'));
    lines.push('**Q:** ' + q.prompt.replace(/\\n+/g, ' '));
    q.options.forEach((o, k) => lines.push('- ' + k + ') ' + o + (k===q.recordedIdx?' ← recorded':'')));
    if (s.page) lines.push('Source page: ' + s.page);
    if (s.notes) lines.push('Notes: ' + s.notes);
    lines.push('');
  });
  return lines.join('\\n');
}
document.getElementById('exportBtn').onclick = () => {
  document.getElementById('exportBox').value = buildMarkdown();
};
document.getElementById('copyBtn').onclick = async () => {
  const md = buildMarkdown();
  try { await navigator.clipboard.writeText(md); alert('Copied to clipboard.'); }
  catch { document.getElementById('exportBox').value = md; alert('Clipboard blocked — markdown shown in textarea.'); }
};
document.getElementById('resetBtn').onclick = () => {
  if (confirm('Clear all marks for this seed?')) { localStorage.removeItem(KEY); for (const k in state) delete state[k]; render(); }
};

render();
</script>
</body>
</html>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
console.log(`Wrote ${sample.length}-question grading page to ${OUT}`);
console.log(`Open: file://${resolve(OUT).replace(/\\/g, '/')}`);

if (BUNDLE_ZIP) {
  const readme = `# Spot-check grading bundle\n\n` +
    `Open \`spot-check.html\` in any modern browser (Chrome, Edge, Firefox all work — no PDF viewer needed).\n\n` +
    `Fill in your name + Discord/email at the top, grade each question (click a **📖 p.N** button to view the matching slide image), then click **Copy markdown** when done and paste back to the maintainer.\n\n` +
    `**Scope:** course-extraction fidelity only — does the recorded "correct" answer match the lecture slide? Test-bank items are not covered in this round.\n\n` +
    `**Merge protocol:** 3 graders, majority of 3 wins; ties resolved by the maintainer based on the notes you write.\n\n` +
    `**Note:** the slide images are pre-rasterized at modest resolution (top-3 ranked candidate pages per question). If the recorded answer doesn't appear on any of the suggested pages, mark **⚠ ambiguous** and note that — the page-hint algorithm sometimes misses.\n`;
  writeFileSync(join(BUNDLE_DIR, 'README.md'), readme);
  // Build zip via Windows native tar (supports zip via -a). Fall back to "tar" on PATH.
  mkdirSync(dirname(BUNDLE_ZIP), { recursive: true });
  if (existsSync(BUNDLE_ZIP)) rmSync(BUNDLE_ZIP);
  const zipAbs = resolve(BUNDLE_ZIP);
  const tarBin = process.platform === 'win32' ? 'C:\\Windows\\System32\\tar.exe' : 'tar';
  execFileSync(tarBin, ['-a', '-c', '-f', zipAbs, '-C', resolve(BUNDLE_DIR), '.'], { stdio: 'inherit' });
  console.log(`\nBundle ready: ${BUNDLE_ZIP}`);
  console.log(`  Send to graders via Discord DM.`);
}
