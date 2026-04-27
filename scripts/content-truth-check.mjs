#!/usr/bin/env node
/**
 * content-truth-check.mjs — LLM second-grader for multiple-choice answer keys.
 *
 * For every changed (or with --all, every) MC question in the content, asks
 * Gemini independently which option is correct, then compares against the
 * recorded `correctIndex` / `correct: true` flag. Disagreements are flagged.
 *
 * The validator + smoke gate verify *delivery*; this gate verifies *truth*.
 * Council 2026-04-27 critical finding: a wrong answer key passes every other
 * gate green, lands in classmates' brains the night before exams.
 *
 * Usage:
 *   node scripts/content-truth-check.mjs                # diff vs HEAD~1, advisory
 *   node scripts/content-truth-check.mjs --all          # every MC question
 *   node scripts/content-truth-check.mjs --strict       # exit 1 on disagreement
 *   node scripts/content-truth-check.mjs --max=50       # cap question count
 *   node scripts/content-truth-check.mjs --base=origin/main
 *
 * Env:
 *   GEMINI_API_KEY  required. If unset, the script logs a warning and exits 0
 *                   so unconfigured CI runs don't block deploy.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, resolve, sep } from 'path';
import { spawnSync } from 'child_process';

const ROOT = resolve(process.cwd());
const CONTENT = join(ROOT, 'src', 'content');

const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const ALL = args.includes('--all');
const MAX = Number(args.find(a => a.startsWith('--max='))?.split('=')[1]) || Infinity;
const BASE = args.find(a => a.startsWith('--base='))?.split('=')[1] || 'HEAD~1';
const OUT = args.find(a => a.startsWith('--out='))?.split('=')[1];
const MODEL = process.env.CONTENT_TRUTH_MODEL || 'gemini-2.5-flash';
const KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

if (KEYS.length === 0) {
  console.warn('content-truth: GEMINI_API_KEY[S] not set — skipping (advisory).');
  process.exit(0);
}

let keyIdx = 0;
const dailyDeadKeys = new Set();
function nextKey() {
  for (let i = 0; i < KEYS.length; i++) {
    const idx = (keyIdx + i) % KEYS.length;
    if (!dailyDeadKeys.has(idx)) { keyIdx = idx; return KEYS[idx]; }
  }
  return null;
}

// ---------- file walk + diff ----------
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

function relPosix(file) {
  return file.split(sep).join('/').replace(ROOT.split(sep).join('/') + '/', '');
}

function changedFiles() {
  const r = spawnSync('git', ['diff', '--name-only', `${BASE}...HEAD`], { encoding: 'utf-8' });
  if (r.status !== 0) return null; // signal "diff unavailable"
  return r.stdout.split('\n')
    .map(s => s.trim())
    .filter(s => s.startsWith('src/content/') && s.endsWith('.json'))
    .map(s => join(ROOT, s));
}

// ---------- MC extraction (handles both test + course-quiz shapes) ----------
function extractMC(file, json) {
  const out = [];
  // Top-level test shape
  if (Array.isArray(json.questions)) {
    json.questions.forEach((q, i) => {
      if (q.type !== 'multiple-choice') return;
      let idx;
      if (typeof q.correctIndex === 'number') idx = q.correctIndex;
      else if (Array.isArray(q.correctIndices) && q.correctIndices.length === 1) idx = q.correctIndices[0];
      else return; // skip multi-answer or missing
      const opts = (q.options || []).map(o => optionText(o));
      if (opts.length < 2 || idx < 0 || idx >= opts.length) return;
      out.push({
        file: relPosix(file),
        qid: q.id || `q${i}`,
        location: `questions[${i}]`,
        prompt: bilEn(q.prompt) || bilEn(q.question) || '',
        options: opts,
        recordedIdx: idx,
      });
    });
  }
  // Course quiz blocks (nested under steps[].blocks[].type === 'quiz')
  if (Array.isArray(json.steps)) {
    json.steps.forEach((step, si) => {
      (step.blocks || []).forEach((block, bi) => {
        if (block.type !== 'quiz') return;
        const qs = Array.isArray(block.questions) ? block.questions
          : block.question ? [block.question] : [];
        qs.forEach((q, qi) => {
          const opts = q.options || [];
          const idx = opts.findIndex(o => o.correct === true);
          if (idx < 0 || opts.length < 2) return;
          out.push({
            file: relPosix(file),
            qid: q.id || `${step.id}-b${bi}-q${qi}`,
            location: `steps[${si}].blocks[${bi}].questions[${qi}]`,
            prompt: bilEn(q.question) || bilEn(q.prompt) || '',
            options: opts.map(o => optionText(o)),
            recordedIdx: idx,
          });
        });
      });
    });
  }
  return out;
}

function bilEn(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  return node.en || node.ro || '';
}

function optionText(o) {
  if (!o) return '';
  if (typeof o === 'string') return o;
  if (o.text) return bilEn(o.text);
  return bilEn(o);
}

// ---------- Gemini call ----------
async function askGemini(q) {
  const optList = q.options.map((o, i) => `${i}) ${o}`).join('\n');
  const body = {
    contents: [{
      parts: [{
        text: `You are an expert university teacher in computer science and applied mathematics (operating systems, algorithms, linear algebra, probability, OOP, C/C++/Bash). Identify the correct option for the multiple-choice question below.

Reply with ONLY a JSON object on a single line: {"index": <0-based-integer>, "confidence": <1-10>}.
- "index": the index of the option you believe is correct.
- "confidence": 1-10. Use 10 only when the answer is unambiguous to a domain expert. Use 3 or below if the question is ambiguous, multiple options could be correct, or the question is malformed.

Question:
${q.prompt}

Options:
${optList}`
      }]
    }],
    generationConfig: {
      temperature: 0,
      // Gemini 2.5 reserves tokens for "thinking"; tight caps starve the
      // visible output. Give plenty of room — we discard everything but the
      // single JSON line anyway.
      maxOutputTokens: 1024,
      thinkingConfig: { thinkingBudget: 0 },
    }
  };
  // Rotate keys on per-key quota exhaustion (429). Most failures are
  // per-minute caps that reset; we retry the same key once after a delay
  // before marking it dead for the run.
  let lastErr;
  for (let attempt = 0; attempt < KEYS.length * 2; attempt++) {
    const key = nextKey();
    if (!key) break;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      const j = await r.json();
      return parseGeminiResponse(j);
    }
    const txt = (await r.text()).slice(0, 240);
    lastErr = `${r.status}: ${txt}`;
    if (r.status === 429) {
      // Burned this key for the run. Try another.
      dailyDeadKeys.add(keyIdx);
      keyIdx = (keyIdx + 1) % KEYS.length;
      continue;
    }
    if (r.status >= 500) {
      // Transient: short backoff, retry next key.
      await new Promise(res => setTimeout(res, 1000));
      continue;
    }
    // 4xx other than 429: not retryable.
    throw new Error(`Gemini ${lastErr}`);
  }
  throw new Error(`Gemini all keys exhausted: ${lastErr}`);
}

function parseGeminiResponse(j) {
  const text = j.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  // Strip ```json ... ``` fences if Gemini decided to add them.
  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const m = stripped.match(/\{[\s\S]*?\}/);
  if (!m) return { index: null, confidence: null, raw: text };
  try {
    const obj = JSON.parse(m[0]);
    return { index: typeof obj.index === 'number' ? obj.index : null,
             confidence: typeof obj.confidence === 'number' ? obj.confidence : null,
             raw: text };
  } catch {
    return { index: null, confidence: null, raw: text };
  }
}

// ---------- main ----------
console.log(`content-truth: model=${MODEL} mode=${ALL ? 'all' : `diff(${BASE})`}`);

let files;
if (ALL) {
  files = walk(CONTENT);
} else {
  const changed = changedFiles();
  if (changed === null) {
    console.warn(`content-truth: cannot diff against ${BASE} — falling back to --all is too expensive; exiting 0.`);
    process.exit(0);
  }
  files = changed;
}

const questions = [];
for (const file of files) {
  let json;
  try { json = JSON.parse(readFileSync(file, 'utf-8')); }
  catch { continue; }
  questions.push(...extractMC(file, json));
}

if (questions.length === 0) {
  console.log('content-truth: no MC questions to verify (PASS).');
  process.exit(0);
}

const checkList = questions.slice(0, MAX);
console.log(`content-truth: verifying ${checkList.length} of ${questions.length} MC questions${MAX < Infinity ? ` (capped at ${MAX})` : ''}`);

const disagreements = [];
const lowConf = [];
const errors = [];
let i = 0;
for (const q of checkList) {
  i++;
  process.stdout.write(`\r  [${i}/${checkList.length}] ${q.file.replace('src/content/','')} ${q.qid}        `);
  try {
    const ans = await askGemini(q);
    if (ans.index === null) {
      errors.push({ q, reason: 'unparseable response', raw: ans.raw });
      continue;
    }
    if (ans.index !== q.recordedIdx) {
      disagreements.push({ q, llmIdx: ans.index, confidence: ans.confidence });
    } else if (ans.confidence !== null && ans.confidence <= 3) {
      lowConf.push({ q, llmIdx: ans.index, confidence: ans.confidence });
    }
  } catch (e) {
    errors.push({ q, reason: e.message });
  }
}
process.stdout.write('\n');

const report = { checked: checkList.length, total: questions.length, disagreements, lowConf, errors };
if (OUT) {
  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(`content-truth: report written to ${OUT}`);
}

console.log(`\ncontent-truth summary:`);
console.log(`  checked:       ${checkList.length}`);
console.log(`  disagreements: ${disagreements.length}`);
console.log(`  low-confidence agreements: ${lowConf.length}`);
console.log(`  errors:        ${errors.length}`);

if (disagreements.length) {
  console.log(`\nDISAGREEMENTS (LLM thinks a different option is correct):`);
  for (const d of disagreements.slice(0, 50)) {
    const recOpt = d.q.options[d.q.recordedIdx]?.slice(0, 80) || '?';
    const llmOpt = d.q.options[d.llmIdx]?.slice(0, 80) || '?';
    console.log(`  ${d.q.file} ${d.q.qid}`);
    console.log(`    Q: ${d.q.prompt.slice(0, 110).replace(/\s+/g, ' ')}`);
    console.log(`    recorded[${d.q.recordedIdx}]: ${recOpt}`);
    console.log(`    LLM[${d.llmIdx}] (conf ${d.confidence ?? '?'}): ${llmOpt}`);
  }
  if (disagreements.length > 50) console.log(`  …and ${disagreements.length - 50} more`);
}
if (errors.length) {
  console.log(`\nERRORS (no LLM verdict):`);
  for (const e of errors.slice(0, 5)) {
    console.log(`  ${e.q.file} ${e.q.qid}: ${e.reason}`);
  }
}

if (STRICT && disagreements.length > 0) {
  console.error(`\ncontent-truth: FAIL (--strict) — ${disagreements.length} disagreement(s)`);
  process.exit(1);
}
console.log(`\ncontent-truth: PASS (advisory)${disagreements.length ? ' — disagreements above are warnings, not blockers' : ''}`);
process.exit(0);
