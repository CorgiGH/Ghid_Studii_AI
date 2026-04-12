#!/usr/bin/env node
/**
 * extract-oop-tests.mjs
 *
 * Scans the OOP Examen folder, sends each exam (PDFs + images) to Gemini,
 * extracts structured JSON, and saves to src/content/oop/tests/.
 *
 * Usage:
 *   node scripts/extract-oop-tests.mjs                    # process all
 *   node scripts/extract-oop-tests.mjs --folder "T1/P1"   # process one subfolder
 *   node scripts/extract-oop-tests.mjs --dry-run           # list what would be processed
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { resolve, join, basename, extname, relative } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Config ──

const EXAMEN_ROOT = resolve('C:/Users/User/Downloads/Programare Orientata Obiect-20260407T201348Z-3-001/Programare Orientata Obiect/Examen');
const OUTPUT_DIR = resolve('src/content/oop/tests');
const SOURCE_DIR = resolve('src/content/oop/tests/source');
const PROMPT_PATH = resolve('scripts/prompts/extract-oop-test.md');

const SUPPORTED_IMG = new Set(['.png', '.jpg', '.jpeg']);
const SUPPORTED_PDF = new Set(['.pdf']);
const SUPPORTED_CODE = new Set(['.cpp', '.h']);

// ── Load keys from proxy/.env ──

function loadEnv() {
  const envPath = resolve('proxy/.env');
  if (!existsSync(envPath)) {
    console.error('ERROR: ../proxy/.env not found. Need Gemini API keys.');
    process.exit(1);
  }
  const raw = readFileSync(envPath, 'utf-8');
  const vars = {};
  raw.split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) vars[m[1].trim()] = m[2].trim();
  });
  return vars;
}

const env = loadEnv();
const geminiKeys = (env.GEMINI_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
if (geminiKeys.length === 0) {
  console.error('ERROR: No GEMINI_API_KEYS in proxy/.env');
  process.exit(1);
}
console.log(`Loaded ${geminiKeys.length} Gemini key(s)`);

let keyIndex = 0;
function getClient() {
  const key = geminiKeys[keyIndex % geminiKeys.length];
  keyIndex++;
  return new GoogleGenerativeAI(key);
}

const openrouterKeys = (env.OPENROUTER_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
let orKeyIndex = 0;
console.log(`Loaded ${openrouterKeys.length} OpenRouter key(s)`);

const GEMINI_MODELS = ['gemini-3-flash-preview'];

// ── Gemini call with retry + OpenRouter fallback ──

async function callGemini(parts, retries = 0) {
  // Try Gemini first
  for (const modelName of GEMINI_MODELS) {
    for (let ki = 0; ki < geminiKeys.length; ki++) {
      const client = getClient();
      const model = client.getGenerativeModel({ model: modelName });
      try {
        const result = await model.generateContent(parts);
        return result.response.text();
      } catch (err) {
        const isRateLimit = err.status === 429 || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED');
        const isUnavailable = err.status === 503 || err.message?.includes('503');
        if (isRateLimit || isUnavailable) {
          console.log(`    Gemini ${modelName} key ${ki + 1}: ${isRateLimit ? 'rate limited' : 'unavailable'}`);
          continue;
        }
        throw err;
      }
    }
  }

  // Fallback to OpenRouter
  if (openrouterKeys.length > 0) {
    console.log(`    Falling back to OpenRouter...`);
    return callOpenRouter(parts);
  }

  throw new Error('All Gemini keys exhausted and no OpenRouter keys available');
}

async function callOpenRouter(parts) {
  // Convert parts to OpenRouter format
  const content = [];
  for (const p of parts) {
    if (p.text) {
      content.push({ type: 'text', text: p.text });
    } else if (p.inlineData) {
      const { mimeType, data } = p.inlineData;
      content.push({
        type: 'image_url',
        image_url: { url: `data:${mimeType};base64,${data}` },
      });
    }
  }

  const key = openrouterKeys[orKeyIndex % openrouterKeys.length];
  orKeyIndex++;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://corgigh.github.io/Ghid_Studii_AI/',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content }],
      max_tokens: 7000,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ── Discover exam folders ──

function discoverExams(root) {
  const exams = [];

  function scan(dir, breadcrumb) {
    const entries = readdirSync(dir);
    const files = [];
    const subdirs = [];

    for (const name of entries) {
      const full = join(dir, name);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        subdirs.push({ name, full });
      } else {
        const ext = extname(name).toLowerCase();
        if (SUPPORTED_IMG.has(ext) || SUPPORTED_PDF.has(ext) || SUPPORTED_CODE.has(ext)) {
          files.push({ name, full, ext });
        }
      }
    }

    const hasPdfs = files.some(f => SUPPORTED_PDF.has(f.ext));
    const hasImages = files.some(f => SUPPORTED_IMG.has(f.ext));
    const hasCode = files.some(f => SUPPORTED_CODE.has(f.ext));

    if (hasPdfs || hasImages) {
      // Special case: folder with many independent PDFs (e.g. "ALTI ANI", "model", "legacy")
      // Split each PDF (+ associated .cpp) into its own exam unit
      const pdfs = files.filter(f => SUPPORTED_PDF.has(f.ext));
      const onlyPdfs = !hasImages;

      if (onlyPdfs && pdfs.length > 2) {
        // Each PDF is a separate problem — split
        for (const pdf of pdfs) {
          const stem = basename(pdf.name, pdf.ext);
          // Find matching .cpp if any
          const matching = files.filter(f =>
            SUPPORTED_CODE.has(f.ext) && basename(f.name, f.ext) === stem
          );
          const group = [pdf, ...matching];
          exams.push({
            path: dir,
            breadcrumb: [...breadcrumb, stem],
            files: group,
            hasPdfs: true,
            hasImages: false,
            hasCode: matching.length > 0,
          });
        }
      } else {
        exams.push({
          path: dir,
          breadcrumb,
          files,
          hasPdfs,
          hasImages,
          hasCode,
        });
      }
    }

    for (const sub of subdirs) {
      scan(sub.full, [...breadcrumb, sub.name]);
    }
  }

  scan(root, []);
  return exams;
}

// ── Generate a slug from breadcrumb ──

function makeSlug(breadcrumb) {
  return breadcrumb
    .join('-')
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[șş]/g, 's').replace(/[țţ]/g, 't')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Build Gemini parts from an exam folder ──

function buildParts(exam, promptText) {
  const parts = [];

  // Sort images numerically
  const images = exam.files
    .filter(f => SUPPORTED_IMG.has(f.ext))
    .sort((a, b) => {
      const numA = parseInt(a.name.match(/(\d+)/)?.[1] || '0');
      const numB = parseInt(b.name.match(/(\d+)/)?.[1] || '0');
      return numA - numB;
    });

  const pdfs = exam.files.filter(f => SUPPORTED_PDF.has(f.ext));
  const codes = exam.files.filter(f => SUPPORTED_CODE.has(f.ext));

  // Add PDFs first
  for (const pdf of pdfs) {
    const data = readFileSync(pdf.full).toString('base64');
    parts.push({ inlineData: { mimeType: 'application/pdf', data } });
  }

  // Add images
  for (const img of images) {
    const mimeType = img.ext === '.png' ? 'image/png' : 'image/jpeg';
    const data = readFileSync(img.full).toString('base64');
    parts.push({ inlineData: { mimeType, data } });
  }

  // Add code files as text context
  if (codes.length > 0) {
    let codeContext = '\n\n--- SOLUTION FILES PROVIDED ---\n';
    for (const c of codes) {
      codeContext += `\n// ${c.name}\n${readFileSync(c.full, 'utf-8')}\n`;
    }
    parts.push({ text: promptText + codeContext });
  } else {
    parts.push({ text: promptText });
  }

  return parts;
}

// ── Parse Gemini response to JSON ──

function parseResponse(raw) {
  // Strip markdown fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(cleaned);
}

// ── Convert extracted data to study-guide test JSON format ──

function toTestJson(extracted, slug) {
  const meta = extracted.metadata || {};
  const problem = extracted.problem || {};
  const grading = extracted.grading || [];
  const totalPoints = meta.totalPoints || grading.reduce((s, g) => s + (g.points || 0), 0);

  // Determine type from session
  const sessionMap = {
    'sesiune': 'exam', 'restanta': 'exam-retake', 'marire': 'exam-retake',
    'model': 'model', 'lab-test': 'lab-test',
  };
  const type = sessionMap[meta.session] || 'lab-test';

  // Build the single code-writing question with mainCode + expectedOutput embedded in prompt
  const questions = [];

  function buildPrompt(desc, constraintsList, observationsList, isRo) {
    const parts = [];
    if (desc) parts.push(desc);
    if (constraintsList?.length) {
      parts.push(`\n**${isRo ? 'Restricții' : 'Constraints'}:**`);
      constraintsList.forEach(c => parts.push(`- ${c}`));
    }
    if (observationsList?.length) {
      parts.push(`\n**${isRo ? 'Observații' : 'Observations'}:**`);
      observationsList.forEach(o => parts.push(`- ${o}`));
    }
    if (problem.umlDiagram) {
      parts.push(`\n**UML:**\n${problem.umlDiagram}`);
    }
    if (problem.mainCode) {
      parts.push(`\n**main():**\n\`\`\`cpp\n${problem.mainCode}\n\`\`\``);
    }
    if (problem.expectedOutput) {
      parts.push(`\n**${isRo ? 'Ieșire așteptată' : 'Expected output'}:**\n\`\`\`\n${problem.expectedOutput}\n\`\`\``);
    }
    return parts.join('\n');
  }

  const promptEn = `**${problem.className || 'Problem'}**\n${buildPrompt(
    problem.description,
    problem.constraints,
    problem.observations,
    false
  )}`;
  const promptRo = `**${problem.className || 'Problema'}**\n${buildPrompt(
    problem.descriptionRo,
    problem.constraintsRo || problem.constraints,
    problem.observationsRo || problem.observations,
    true
  )}`;

  questions.push({
    id: 'q1',
    type: 'code-writing',
    points: totalPoints,
    language: 'cpp',
    prompt: { en: promptEn, ro: promptRo },
    rubric: {
      en: grading.map(g => `**${g.id}** (${g.points}p): ${g.description}`).join('\n'),
      ro: grading.map(g => `**${g.id}** (${g.points}p): ${g.descriptionRo || g.description}`).join('\n'),
    },
    solution: extracted.solution || null,
  });

  // Build a human-readable title
  const className = problem.className || '';
  const yearStr = meta.year || '';
  const partStr = [meta.testPart, meta.problemNumber].filter(Boolean).join(' ');
  const sessionStr = meta.session && meta.session !== 'null' ? ` (${meta.session})` : '';
  const titleBase = [yearStr, partStr, className].filter(Boolean).join(' — ');

  return {
    meta: {
      id: slug,
      title: {
        en: titleBase + (sessionStr || ''),
        ro: titleBase + (sessionStr || ''),
      },
      year: meta.year || 'unknown',
      type,
      session: meta.session || 'unknown',
      testPart: meta.testPart || null,
      problemNumber: meta.problemNumber || null,
      duration: meta.duration || null,
      totalPoints,
    },
    questions,
  };
}

// ── Main ──

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const folderFilter = args.includes('--folder') ? args[args.indexOf('--folder') + 1] : null;

  // Ensure output dirs
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  if (!existsSync(SOURCE_DIR)) mkdirSync(SOURCE_DIR, { recursive: true });

  const promptText = readFileSync(PROMPT_PATH, 'utf-8');
  const allExams = discoverExams(EXAMEN_ROOT);

  console.log(`\nDiscovered ${allExams.length} exam units:\n`);

  const exams = folderFilter
    ? allExams.filter(e => e.breadcrumb.join('/').includes(folderFilter))
    : allExams;

  for (const exam of exams) {
    const trail = exam.breadcrumb.join(' > ');
    const slug = makeSlug(exam.breadcrumb);
    const fileCount = exam.files.length;
    const types = [
      exam.hasPdfs && 'PDF',
      exam.hasImages && 'IMG',
      exam.hasCode && 'CPP',
    ].filter(Boolean).join('+');

    console.log(`  ${trail}`);
    console.log(`    slug: ${slug} | files: ${fileCount} (${types})`);

    if (dryRun) continue;

    const outPath = join(OUTPUT_DIR, `${slug}.json`);
    if (existsSync(outPath)) {
      console.log(`    SKIP (already exists)`);
      continue;
    }

    try {
      console.log(`    Sending ${fileCount} file(s) to Gemini...`);
      const parts = buildParts(exam, promptText);
      const raw = await callGemini(parts);

      // Parse extraction
      const extracted = parseResponse(raw);

      // Convert to study-guide format
      const testJson = toTestJson(extracted, slug);

      // Save JSON
      writeFileSync(outPath, JSON.stringify(testJson, null, 2));
      console.log(`    Saved: ${slug}.json (${testJson.meta.totalPoints}pts)`);

      // Copy source files to source/ dir for reference
      const sourceSubdir = join(SOURCE_DIR, slug);
      if (!existsSync(sourceSubdir)) mkdirSync(sourceSubdir, { recursive: true });
      for (const f of exam.files) {
        copyFileSync(f.full, join(sourceSubdir, f.name));
      }

      // Rate limit courtesy delay
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`    ERROR: ${err.message}`);
      // Save raw error for debugging
      writeFileSync(
        join(OUTPUT_DIR, `${slug}.error.txt`),
        `${err.message}\n\n${err.stack || ''}`
      );
    }
  }

  if (!dryRun) {
    // Generate index snippet
    console.log('\n\n=== INDEX.JS ENTRIES ===\n');
    const jsons = readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json') && !f.includes('.error'));
    for (const f of jsons.sort()) {
      const data = JSON.parse(readFileSync(join(OUTPUT_DIR, f), 'utf-8'));
      const m = data.meta;
      console.log(`    { id: '${m.id}', title: { en: '${m.title.en}', ro: '${m.title.ro}' }, shortTitle: { en: '${m.id}', ro: '${m.id}' }, src: 'oop/tests/${f}' },`);
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
