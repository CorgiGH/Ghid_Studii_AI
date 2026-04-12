#!/usr/bin/env node
/**
 * fix-oop-test-meta.mjs
 *
 * Patches metadata fields in OOP test JSONs that Gemini returned as "unknown".
 * Derives year/testPart/session/type from the slug. Regenerates title from
 * the className that toTestJson already extracted.
 *
 * Usage:
 *   node scripts/fix-oop-test-meta.mjs                # fix all unknown metadata
 *   node scripts/fix-oop-test-meta.mjs <slug>         # fix one file by slug
 *   node scripts/fix-oop-test-meta.mjs --dry-run      # show what would change
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DIR = 'src/content/oop/tests';

function deriveMeta(slug) {
  // Match: examen<y1>-<y2>(-<rest>)?
  const m = slug.match(/^examen(\d{4})-(\d{4})(?:-(.*))?$/);
  if (!m) return null;
  const year = `${m[1]}-${m[2]}`;
  const rest = m[3] || '';

  const patterns = [
    // T1/T2 practical lab tests with variants 2024
    { re: /^t([12])-p(\d)-2024$/, fn: (g) => ({ testPart: `T${g[1]}`, problemNumber: `P${g[2]}`, type: 'lab-test', session: 'lab-test' }) },
    // T1/T2 practical lab tests (no year suffix)
    { re: /^t([12])-p(\d)$/, fn: (g) => ({ testPart: `T${g[1]}`, problemNumber: `P${g[2]}`, type: 'lab-test', session: 'lab-test' }) },
    // ALTI ANI bank — varied problems, belong to T2
    { re: /^t2-alti-ani-/, fn: () => ({ testPart: 'T2', problemNumber: null, type: 'lab-test', session: 'alti-ani' }) },
    // model test
    { re: /^model-model-test-([12])-lab-oop-(\d)$/, fn: (g) => ({ testPart: `T${g[1]}`, problemNumber: `P${g[2]}`, type: 'model', session: 'model' }) },
    // restanta (retake)
    { re: /^restanta$/, fn: () => ({ testPart: null, problemNumber: null, type: 'exam-retake', session: 'restanta' }) },
    // marire (grade-boost retake)
    { re: /marire/, fn: () => ({ testPart: null, problemNumber: null, type: 'exam-retake', session: 'marire' }) },
    // sesiune (regular exam session)
    { re: /sesiune/, fn: () => ({ testPart: null, problemNumber: null, type: 'exam', session: 'sesiune' }) },
    // generic examen folder (usually retake material per memory note)
    { re: /^examen$/, fn: () => ({ testPart: null, problemNumber: null, type: 'exam', session: 'sesiune' }) },
    // subiect a/b — 2018-2019 written exam
    { re: /^subiect-([ab])$/, fn: (g) => ({ testPart: null, problemNumber: `Subiect ${g[1].toUpperCase()}`, type: 'exam', session: 'sesiune' }) },
  ];

  for (const p of patterns) {
    const mm = rest.match(p.re);
    if (mm) return { year, ...p.fn(mm) };
  }

  // Fallback for bare year slug (e.g. examen2021-2022)
  if (!rest) return { year, testPart: null, problemNumber: null, type: 'exam', session: 'sesiune' };

  return { year, testPart: null, problemNumber: null, type: 'exam', session: 'unknown' };
}

function buildTitle(meta, className) {
  const parts = [meta.year];
  if (meta.session === 'model') parts.push('Model');
  else if (meta.session === 'restanta') parts.push('Restanță');
  else if (meta.session === 'marire') parts.push('Mărire');
  else if (meta.session === 'alti-ani') parts.push('Alți Ani');
  if (meta.testPart) parts.push(meta.testPart);
  if (meta.problemNumber) parts.push(meta.problemNumber);
  let t = parts.join(' ');
  if (className && className !== 'Problem' && className !== 'Problema') {
    t += ` — ${className}`;
  }
  return t;
}

function needsFix(m) {
  return (
    m.year === 'unknown' ||
    !m.year ||
    m.session === 'unknown' ||
    m.testPart === null && /^t\d/.test((m.id || '').replace(/^examen\d{4}-\d{4}-/, '')) ||
    !m.title?.en || m.title.en.includes('unknown')
  );
}

function fixFile(path, dryRun) {
  const raw = readFileSync(path, 'utf-8');
  const data = JSON.parse(raw);
  const slug = (data.meta.id || '').replace(/\.json$/, '');
  const derived = deriveMeta(slug);
  if (!derived) return { path, skipped: 'unparseable slug', changed: false };

  const before = JSON.stringify(data.meta);
  // Preserve totalPoints, duration, id. Overwrite year/type/session/testPart/problemNumber.
  data.meta.year = derived.year;
  data.meta.type = derived.type;
  data.meta.session = derived.session;
  data.meta.testPart = derived.testPart;
  data.meta.problemNumber = derived.problemNumber;

  // Extract className from the first question's prompt — toTestJson starts it with "**ClassName**\n..."
  // This is more stable than reading the current title (which this script may have rewritten).
  let className = null;
  const promptEn = data.questions?.[0]?.prompt?.en || '';
  const mm = promptEn.match(/^\*\*([^*\n]+)\*\*/);
  if (mm) {
    const candidate = mm[1].trim();
    if (candidate && candidate !== 'Problem' && candidate !== 'Problema' && candidate !== 'null') {
      className = candidate;
    }
  }

  const newTitle = buildTitle(data.meta, className);
  data.meta.title = { en: newTitle, ro: newTitle };

  const after = JSON.stringify(data.meta);
  if (before === after) return { path, changed: false };

  if (!dryRun) writeFileSync(path, JSON.stringify(data, null, 2));
  return { path, changed: true, slug, title: newTitle };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const filtered = args.find(a => !a.startsWith('--'));

  const files = readdirSync(DIR)
    .filter(f => f.endsWith('.json'))
    .filter(f => !filtered || f.includes(filtered))
    .map(f => join(DIR, f));

  let changed = 0, skipped = 0;
  for (const f of files) {
    try {
      const r = fixFile(f, dryRun);
      if (r.changed) {
        console.log(`${dryRun ? 'WOULD FIX' : 'fixed'}: ${r.slug}  →  ${r.title}`);
        changed++;
      }
      if (r.skipped) {
        console.log(`SKIP ${f}: ${r.skipped}`);
        skipped++;
      }
    } catch (err) {
      console.error(`ERROR ${f}: ${err.message}`);
    }
  }
  console.log(`\n${dryRun ? 'would change' : 'changed'}: ${changed} / total: ${files.length}`);
}

main();
