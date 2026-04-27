#!/usr/bin/env node
/**
 * spot-check-sample.mjs — generate a 50-question grading sheet.
 *
 * Council 1777313729 step 2: "Spot-check 50 random MC questions against
 * source PDFs by hand." This script samples MC questions from across the
 * corpus (skipping .curate drafts) and writes a markdown checklist.
 *
 * Usage:
 *   node scripts/spot-check-sample.mjs                       # 50 questions, default seed
 *   node scripts/spot-check-sample.mjs --count=30 --seed=42
 *   node scripts/spot-check-sample.mjs --out=docs/spot.md
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve, sep, dirname } from 'path';

const ROOT = resolve(process.cwd());
const CONTENT = join(ROOT, 'src', 'content');
const args = process.argv.slice(2);
const COUNT = Number(args.find(a => a.startsWith('--count='))?.split('=')[1]) || 50;
const SEED = Number(args.find(a => a.startsWith('--seed='))?.split('=')[1]) || Date.now() & 0xffff;
const OUT = args.find(a => a.startsWith('--out='))?.split('=')[1]
  || `docs/spot-check-${new Date().toISOString().slice(0, 10)}-seed${SEED}.md`;

// Mulberry32 PRNG so the same seed produces the same sample.
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
      out.push({
        file: rel, subject, isTest, qid: q.id || `q${i}`,
        prompt: bilEn(q.prompt) || bilEn(q.question) || '',
        options: opts, recordedIdx: idx,
        sourceHint: q.reviewStep || q.lectureRef || (json.meta?.title?.en) || '',
      });
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
          out.push({
            file: rel, subject, isTest: false,
            qid: q.id || `${step.id}-b${bi}-q${qi}`,
            prompt: bilEn(q.question) || bilEn(q.prompt) || '',
            options: opts.map(optionText), recordedIdx: idx,
            sourceHint: q.reviewStep || step.id || (json.meta?.title?.en) || '',
          });
        });
      });
    });
  }
  return out;
}

const files = walk(CONTENT);
const all = [];
for (const f of files) {
  let json;
  try { json = JSON.parse(readFileSync(f, 'utf-8')); } catch { continue; }
  all.push(...extractMC(f, json));
}

if (all.length === 0) { console.error('No MC questions found.'); process.exit(1); }

// Sample with a soft bias toward test questions (higher stakes than self-tests).
const tests = all.filter(q => q.isTest);
const courses = all.filter(q => !q.isTest);
const rand = rng(SEED);
function pick(pool, n) {
  const copy = pool.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
const targetTests = Math.min(Math.round(COUNT * 0.6), tests.length);
const targetCourses = COUNT - targetTests;
const sample = [...pick(tests, targetTests), ...pick(courses, targetCourses)];
// Shuffle final order so subjects are interleaved.
for (let i = sample.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [sample[i], sample[j]] = [sample[j], sample[i]];
}

// Render
const lines = [];
lines.push(`# Content spot-check — ${new Date().toISOString().slice(0, 10)}`);
lines.push('');
lines.push(`> Council 1777313729 step 2. Sample ${sample.length} MC questions, grade by hand against source PDFs in \`wiki/raw/pdfs/\`. Mark each as ✅ correct, ❌ wrong, or ⚠ ambiguous. Tally at the bottom.`);
lines.push('');
lines.push(`Sample seed: \`${SEED}\` (rerun with \`--seed=${SEED}\` to reproduce). Source pool: ${all.length} MC questions; tests biased ~60%.`);
lines.push('');
lines.push('---');
lines.push('');

const bySubject = { os: [], alo: [], pa: [], oop: [], 'prob-stat': [] };
for (const q of sample) (bySubject[q.subject] ||= []).push(q);

let n = 0;
for (const [subj, items] of Object.entries(bySubject)) {
  if (items.length === 0) continue;
  lines.push(`## ${subj.toUpperCase()} (${items.length})`);
  lines.push('');
  for (const q of items) {
    n++;
    lines.push(`### ${n}. \`${q.file}\` — \`${q.qid}\``);
    if (q.sourceHint) lines.push(`*Source hint: ${q.sourceHint}*`);
    lines.push('');
    lines.push(`**Q:** ${q.prompt.replace(/\n+/g, ' ')}`);
    lines.push('');
    q.options.forEach((opt, i) => {
      const mark = i === q.recordedIdx ? ' ← **recorded correct**' : '';
      lines.push(`- ${i}) ${opt.replace(/\n+/g, ' ')}${mark}`);
    });
    lines.push('');
    lines.push('| Verdict | Source page | Notes |');
    lines.push('|---|---|---|');
    lines.push('|       |             |       |');
    lines.push('');
  }
}

lines.push('---');
lines.push('');
lines.push('## Tally');
lines.push('');
lines.push('- ✅ Correct (recorded matches source): __ / ' + sample.length);
lines.push('- ❌ Wrong (recorded contradicts source): __ / ' + sample.length);
lines.push('- ⚠ Ambiguous (cannot verify from source / poorly worded): __ / ' + sample.length);
lines.push('');
lines.push('**Decision rule** (per council):');
lines.push('- < 2 wrong → fears overblown, no action needed');
lines.push('- 2-5 wrong → fix flagged, audit similar questions in same files');
lines.push('- > 5 wrong → confidence-laundering risk realized, broaden audit + reconsider /curate trust');

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, lines.join('\n') + '\n');
console.log(`Wrote ${sample.length} questions to ${OUT}`);
