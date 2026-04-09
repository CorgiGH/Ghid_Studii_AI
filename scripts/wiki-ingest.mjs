#!/usr/bin/env node
/**
 * wiki-ingest.mjs
 *
 * Sends a PDF to Gemini for knowledge extraction.
 * Outputs structured JSON to stdout for Claude to integrate into the wiki.
 *
 * Usage:
 *   node scripts/wiki-ingest.mjs <path-to-pdf>
 */

import { readFileSync, existsSync } from 'fs';
import { basename, resolve, extname } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Load keys from proxy/.env ──

function loadEnv() {
  const envPath = resolve('proxy/.env');
  if (!existsSync(envPath)) {
    console.error('ERROR: proxy/.env not found. Need Gemini API keys.');
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

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/wiki-ingest.mjs <path-to-pdf>');
  process.exit(1);
}

const absPath = resolve(filePath);
if (!existsSync(absPath)) {
  console.error(`File not found: ${absPath}`);
  process.exit(1);
}

const ext = extname(absPath).toLowerCase();
if (ext !== '.pdf') {
  console.error(`Only PDF files are supported. Got: ${ext}`);
  process.exit(1);
}

const env = loadEnv();
const geminiKeys = (env.GEMINI_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
if (geminiKeys.length === 0) {
  console.error('ERROR: No GEMINI_API_KEYS in proxy/.env');
  process.exit(1);
}

const fileBytes = readFileSync(absPath);
const fileName = basename(absPath);
const base64Data = fileBytes.toString('base64');

const PROMPT = `You are a knowledge extraction assistant. Analyze this PDF and return a JSON object with these fields:

{
  "title": "Document title or best descriptive title",
  "summary": "2-3 paragraph summary of the document's content and significance",
  "concepts": ["list", "of", "key", "concepts", "covered"],
  "entities": ["list", "of", "specific", "named", "things", "mentioned"],
  "sections": [
    {
      "heading": "Section heading",
      "content": "Key content from this section, preserving important details, formulas, code examples"
    }
  ]
}

Be thorough. Preserve technical details, code examples, formulas, and specific terminology. The output will be integrated into a knowledge base wiki.`;

const MODEL = 'gemini-3-flash-preview';

console.error(`Ingesting: ${fileName} (${(fileBytes.length / 1024).toFixed(0)} KB)`);
console.error(`Model: ${MODEL}`);
console.error(`Keys: ${geminiKeys.length} available`);

let keyIndex = 0;

async function callGemini() {
  for (let ki = 0; ki < geminiKeys.length; ki++) {
    const key = geminiKeys[keyIndex % geminiKeys.length];
    keyIndex++;
    const client = new GoogleGenerativeAI(key);
    const model = client.getGenerativeModel({ model: MODEL });

    try {
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Data
          }
        },
        { text: PROMPT }
      ]);
      return result.response.text();
    } catch (err) {
      const isRateLimit = err.status === 429 || err.message?.includes('429');
      if (isRateLimit && ki < geminiKeys.length - 1) {
        console.error(`Key ${ki + 1} rate-limited, trying next...`);
        continue;
      }
      throw err;
    }
  }
}

function cleanJson(text) {
  // Strip markdown code fences if present
  let cleaned = text.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
  // Fix common Gemini JSON issues: bad escape sequences
  cleaned = cleaned.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
  return cleaned;
}

const MAX_RETRIES = 2;
for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
  try {
    const text = await callGemini();
    const cleaned = cleanJson(text);
    JSON.parse(cleaned);
    console.log(cleaned);
    process.exit(0);
  } catch (err) {
    if (err instanceof SyntaxError && attempt < MAX_RETRIES) {
      console.error(`JSON parse error (attempt ${attempt + 1}), retrying...`);
      continue;
    }
    if (err instanceof SyntaxError) {
      // Output raw text to stderr for debugging, still try to output cleaned version
      console.error(`JSON parse failed after ${MAX_RETRIES + 1} attempts. Outputting raw text.`);
      const text = await callGemini();
      console.log(cleanJson(text));
      process.exit(0);
    }
    console.error(`Request failed: ${err.message}`);
    process.exit(1);
  }
}
