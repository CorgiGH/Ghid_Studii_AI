# Multi-Provider AI Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-provider Gemini pipeline with an adaptive Gemini + OpenRouter system that maximizes quality on critical stages and falls back gracefully when rate-limited.

**Architecture:** A new `scripts/providers.mjs` module exposes a unified `sendPdf`/`sendText` interface backed by Gemini and OpenRouter. A `getProvider(stageName)` function returns the right provider per stage. `curate.mjs` gains a `--fallback` flag and writes `_provider` metadata to all stage outputs.

**Tech Stack:** `@google/generative-ai` (existing), `fetch` (built-in Node 18+), OpenRouter OpenAI-compatible REST API

**Spec:** `docs/superpowers/specs/2026-04-07-multi-provider-pipeline-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `scripts/providers.mjs` | **Create** | Provider abstraction: Gemini + OpenRouter clients, unified interface, key rotation, rate limit detection |
| `scripts/gemini.mjs` | **Delete** | Replaced by `providers.mjs` |
| `scripts/curate.mjs` | **Modify** | Use `providers.mjs`, add `--fallback` flag, write `_provider` metadata, update status tracking |
| `proxy/.env.example` | **Modify** | Add `GEMINI_API_KEY` entry |

---

### Task 1: Create `scripts/providers.mjs` — Provider Abstraction

**Files:**
- Create: `scripts/providers.mjs`
- Read (reference only): `scripts/gemini.mjs`

This task creates the new provider module from scratch. It replaces `gemini.mjs` entirely.

- [ ] **Step 1: Create the Gemini provider**

```javascript
// scripts/providers.mjs
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Gemini Provider ──

const GEMINI_MODEL = 'gemini-3-flash-preview';

let geminiClient = null;

function getGeminiClient() {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not set. Add it to proxy/.env');
      process.exit(1);
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

function getGeminiModel() {
  return getGeminiClient().getGenerativeModel({ model: GEMINI_MODEL });
}

class RateLimitError extends Error {
  constructor(provider, message) {
    super(message);
    this.name = 'RateLimitError';
    this.provider = provider;
  }
}

const geminiProvider = {
  name: 'gemini',
  model: GEMINI_MODEL,

  async sendPdf(pdfPath, promptText) {
    const model = getGeminiModel();
    const pdfBuffer = readFileSync(resolve(pdfPath));
    const pdfBase64 = pdfBuffer.toString('base64');

    try {
      const result = await model.generateContent([
        { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
        { text: promptText },
      ]);
      return result.response.text();
    } catch (err) {
      if (err.status === 429 || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new RateLimitError('gemini', `Gemini rate limit hit: ${err.message}`);
      }
      throw err;
    }
  },

  async sendText(promptText) {
    const model = getGeminiModel();
    try {
      const result = await model.generateContent(promptText);
      return result.response.text();
    } catch (err) {
      if (err.status === 429 || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new RateLimitError('gemini', `Gemini rate limit hit: ${err.message}`);
      }
      throw err;
    }
  },
};
```

- [ ] **Step 2: Add the OpenRouter provider**

Append to `scripts/providers.mjs`:

```javascript
// ── OpenRouter Provider ──

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_VISION_MODEL = 'google/gemini-2.5-flash:free';
const OPENROUTER_TEXT_MODEL = 'google/gemini-2.5-flash:free';

let openrouterKeys = [];
let openrouterKeyIndex = 0;

function getOpenRouterKeys() {
  if (openrouterKeys.length === 0) {
    const raw = process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || '';
    openrouterKeys = raw.split(',').map(k => k.trim()).filter(Boolean);
    if (openrouterKeys.length === 0) {
      console.error('❌ OPENROUTER_API_KEYS not set. Add it to proxy/.env');
      process.exit(1);
    }
  }
  return openrouterKeys;
}

function nextOpenRouterKey() {
  const keys = getOpenRouterKeys();
  const key = keys[openrouterKeyIndex % keys.length];
  openrouterKeyIndex++;
  return key;
}

async function openrouterRequest(model, messages, retries = 0) {
  const keys = getOpenRouterKeys();
  const key = nextOpenRouterKey();

  const res = await fetch(OPENROUTER_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://corgigh.github.io/Ghid_Studii_AI/',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 16384,
    }),
  });

  if (res.status === 429) {
    // Try next key if we haven't tried all of them
    if (retries < keys.length - 1) {
      console.log(`  ⚠ OpenRouter key ${(openrouterKeyIndex - 1) % keys.length + 1} rate limited, trying next key...`);
      return openrouterRequest(model, messages, retries + 1);
    }
    throw new RateLimitError('openrouter', `All ${keys.length} OpenRouter keys rate limited`);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

const openrouterProvider = {
  name: 'openrouter',
  model: OPENROUTER_TEXT_MODEL,

  async sendPdf(pdfPath, promptText) {
    const pdfBuffer = readFileSync(resolve(pdfPath));
    const pdfBase64 = pdfBuffer.toString('base64');

    return openrouterRequest(OPENROUTER_VISION_MODEL, [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:application/pdf;base64,${pdfBase64}` },
          },
          { type: 'text', text: promptText },
        ],
      },
    ]);
  },

  async sendText(promptText) {
    return openrouterRequest(OPENROUTER_TEXT_MODEL, [
      { role: 'user', content: promptText },
    ]);
  },
};
```

- [ ] **Step 3: Add the stage allocation logic and exports**

Append to `scripts/providers.mjs`:

```javascript
// ── Stage Allocation ──

// Priority: which stages prefer Gemini (high quality) vs OpenRouter (bulk)
const STAGE_PROVIDER = {
  'stage1':       'gemini',     // PDF extraction — most critical
  'stage2':       'gemini',     // Cross-reference — benefits from quality
  'stage2.5':     'openrouter', // Diff — mechanical comparison
  'bibliography': 'gemini',     // PDF extraction — moderate complexity
  'source-search':'openrouter', // Simple classification
};

let geminiExhausted = false;

export function getProvider(stageName) {
  const preferred = STAGE_PROVIDER[stageName] || 'openrouter';
  if (preferred === 'gemini' && !geminiExhausted) {
    return geminiProvider;
  }
  return openrouterProvider;
}

export function markGeminiExhausted() {
  geminiExhausted = true;
}

export function isGeminiExhausted() {
  return geminiExhausted;
}

export { RateLimitError, geminiProvider, openrouterProvider };

// ── Backward-compatible exports (used by curate.mjs) ──

export function loadPromptTemplate(templateName) {
  const templatePath = resolve('scripts/prompts', templateName);
  return readFileSync(templatePath, 'utf-8');
}
```

- [ ] **Step 4: Verify the module loads without errors**

Run: `cd /c/Users/User/Desktop/SO/os-study-guide && node -e "import('./scripts/providers.mjs').then(m => console.log('✅ Module loaded. Exports:', Object.keys(m).join(', ')))"`

Expected: `✅ Module loaded. Exports: getProvider, markGeminiExhausted, isGeminiExhausted, RateLimitError, geminiProvider, openrouterProvider, loadPromptTemplate`

- [ ] **Step 5: Delete `scripts/gemini.mjs`**

```bash
rm scripts/gemini.mjs
```

- [ ] **Step 6: Commit**

```bash
git add scripts/providers.mjs
git add -u scripts/gemini.mjs
git commit -m "feat: add multi-provider abstraction (Gemini + OpenRouter)

Replaces gemini.mjs with providers.mjs. Supports stage-aware provider
selection, OpenRouter key rotation, and rate limit detection."
```

---

### Task 2: Update `curate.mjs` — Provider Integration

**Files:**
- Modify: `scripts/curate.mjs`

This task rewires curate.mjs to use the new provider system. Changes are surgical — the stage logic stays the same, only the API call layer changes.

- [ ] **Step 1: Update imports and add `--fallback` flag**

Replace line 3:
```javascript
import { sendPdfWithPrompt, sendTextPrompt, loadPromptTemplate } from './gemini.mjs';
```

With:
```javascript
import { getProvider, markGeminiExhausted, RateLimitError, loadPromptTemplate } from './providers.mjs';
```

Add `fallback` to the flags object (around line 85):
```javascript
const flags = {
  subject: getFlagValue('--subject'),
  type: getFlagValue('--type'),
  desc: getFlagValue('--desc'),
  redo: args.includes('--redo'),
  fallback: args.includes('--fallback'),
};
```

- [ ] **Step 2: Add provider-aware send helpers with fallback logic**

Add after the `getFlagValue` function (after line 173):

```javascript
// ── Provider-Aware API Calls ──

async function sendPdf(stageName, pdfPath, promptText) {
  const provider = getProvider(stageName);
  try {
    const result = await provider.sendPdf(pdfPath, promptText);
    return { result, provider: { name: provider.name, model: provider.model } };
  } catch (err) {
    if (err instanceof RateLimitError && err.provider === 'gemini') {
      markGeminiExhausted();
      if (flags.fallback) {
        console.log(`  ⚠ Gemini rate limited — falling back to OpenRouter for ${stageName}`);
        const fallbackProvider = getProvider(stageName); // Will now return OpenRouter
        const result = await fallbackProvider.sendPdf(pdfPath, promptText);
        return { result, provider: { name: fallbackProvider.name, model: fallbackProvider.model, fallback: true } };
      }
      console.error(`\n⚠️  Gemini rate limit hit on ${stageName}.`);
      console.error('   Run with --fallback to continue with OpenRouter, or wait and re-run tomorrow.');
      process.exit(1);
    }
    throw err;
  }
}

async function sendText(stageName, promptText) {
  const provider = getProvider(stageName);
  try {
    const result = await provider.sendText(promptText);
    return { result, provider: { name: provider.name, model: provider.model } };
  } catch (err) {
    if (err instanceof RateLimitError && err.provider === 'gemini') {
      markGeminiExhausted();
      if (flags.fallback) {
        console.log(`  ⚠ Gemini rate limited — falling back to OpenRouter for ${stageName}`);
        const fallbackProvider = getProvider(stageName);
        const result = await fallbackProvider.sendText(promptText);
        return { result, provider: { name: fallbackProvider.name, model: fallbackProvider.model, fallback: true } };
      }
      console.error(`\n⚠️  Gemini rate limit hit on ${stageName}.`);
      console.error('   Run with --fallback to continue with OpenRouter, or wait and re-run tomorrow.');
      process.exit(1);
    }
    throw err;
  }
}
```

- [ ] **Step 3: Update status tracking to include provider info**

Replace the `writeStatus` function (line 134-137):

```javascript
const stageProviders = {};

function writeStatus(stage) {
  ensureCurateDir();
  writeFileSync(statusPath, JSON.stringify({
    lastCompleted: stage,
    type: contentType,
    subject,
    stages: { ...stageProviders },
  }, null, 2));
}

function recordStageProvider(stageName, providerInfo) {
  stageProviders[stageName] = {
    provider: providerInfo.name,
    model: providerInfo.model,
    ...(providerInfo.fallback ? { fallback: true } : {}),
    timestamp: new Date().toISOString(),
  };
}
```

Also update `readStatus` to preserve existing stage providers on resume (line 129-131):

```javascript
function readStatus() {
  if (!existsSync(statusPath)) return { lastCompleted: 0, type: contentType, subject, stages: {} };
  const status = JSON.parse(readFileSync(statusPath, 'utf-8'));
  // Restore previously recorded providers on resume
  if (status.stages) Object.assign(stageProviders, status.stages);
  return status;
}
```

- [ ] **Step 4: Update `runStage1` to use provider-aware calls**

In `runStage1` (line 355-389), replace:
```javascript
  console.log(`  Sending PDF to Gemini (${promptFile})...`);
  const rawResponse = await sendPdfWithPrompt(pdfPath, prompt);
```

With:
```javascript
  const provider = getProvider('stage1');
  console.log(`  Sending PDF to ${provider.name} (${promptFile})...`);
  const { result: rawResponse, provider: providerInfo } = await sendPdf('stage1', pdfPath, prompt);
  recordStageProvider('stage1', providerInfo);
```

Also update the error message (line 378) — replace `Gemini returned invalid JSON` with `${providerInfo.name} returned invalid JSON`.

At the end of `runStage1`, before the final `writeFileSync`, add `_provider` metadata:

Replace:
```javascript
  writeFileSync(resolve(curateDir, 'stage1-extraction.json'), JSON.stringify(extraction, null, 2));
```

With:
```javascript
  extraction._provider = { name: providerInfo.name, model: providerInfo.model, timestamp: new Date().toISOString() };
  writeFileSync(resolve(curateDir, 'stage1-extraction.json'), JSON.stringify(extraction, null, 2));
```

- [ ] **Step 5: Update `runStage2` to use provider-aware calls**

In `runStage2` (line 438-439), replace:
```javascript
  console.log(`  Cross-referencing against ${sourcesIndex.sources.filter(s => s.available).length} source(s)...`);
  const rawResponse = await sendTextPrompt(fullPrompt);
```

With:
```javascript
  const availableCount = sourcesIndex.sources.filter(s => s.available).length;
  const provider = getProvider('stage2');
  console.log(`  Cross-referencing against ${availableCount} source(s) via ${provider.name}...`);
  const { result: rawResponse, provider: providerInfo } = await sendText('stage2', fullPrompt);
  recordStageProvider('stage2', providerInfo);
```

Update the error message (line 456) — replace `Cross-reference returned invalid JSON` with `Cross-reference (${providerInfo.name}) returned invalid JSON`.

Before the final `writeFileSync` for stage2 (line 460), add metadata:

Replace:
```javascript
  writeFileSync(resolve(curateDir, 'stage2-crossref.json'), JSON.stringify(crossref, null, 2));
```

With:
```javascript
  crossref._provider = { name: providerInfo.name, model: providerInfo.model, timestamp: new Date().toISOString() };
  writeFileSync(resolve(curateDir, 'stage2-crossref.json'), JSON.stringify(crossref, null, 2));
```

- [ ] **Step 6: Update `runStage2_5` to use provider-aware calls**

In `runStage2_5` (line 532-533), replace:
```javascript
  console.log(`  Comparing against ${targetFile}...`);
  const rawResponse = await sendTextPrompt(prompt);
```

With:
```javascript
  const provider = getProvider('stage2.5');
  console.log(`  Comparing against ${targetFile} via ${provider.name}...`);
  const { result: rawResponse, provider: providerInfo } = await sendText('stage2.5', prompt);
  recordStageProvider('stage2.5', providerInfo);
```

Update the error message (line 550) — replace `Diff returned invalid JSON` with `Diff (${providerInfo.name}) returned invalid JSON`.

Before the final `writeFileSync` for stage 2.5 (line 554), add metadata:

Replace:
```javascript
  writeFileSync(resolve(curateDir, 'stage2.5-diff.json'), JSON.stringify(diff, null, 2));
```

With:
```javascript
  diff._provider = { name: providerInfo.name, model: providerInfo.model, timestamp: new Date().toISOString() };
  writeFileSync(resolve(curateDir, 'stage2.5-diff.json'), JSON.stringify(diff, null, 2));
```

- [ ] **Step 7: Update `ensureBibliography` to use provider-aware calls**

In `ensureBibliography`, replace the bibliography extraction call (line 278):
```javascript
  const rawResponse = await sendPdfWithPrompt(descPdf, extractPrompt);
```

With:
```javascript
  const { result: rawResponse } = await sendPdf('bibliography', descPdf, extractPrompt);
```

Replace the source search call (line 321):
```javascript
    const searchResult = await sendTextPrompt(searchPrompt);
```

With:
```javascript
    const { result: searchResult } = await sendText('source-search', searchPrompt);
```

- [ ] **Step 8: Update the main pipeline logging**

In the `main` function, update stage labels to show provider info. Replace lines 190 and 199 and 208:

```javascript
  // Line 190 — before Stage 1
  console.log(`── Stage 1: PDF Extraction (${getProvider('stage1').name}) ──`);

  // Line 199 — before Stage 2
  console.log(`── Stage 2: Bibliography Cross-Reference (${getProvider('stage2').name}) ──`);

  // Line 208 — before Stage 2.5
  console.log(`── Stage 2.5: Diff Against Existing (${getProvider('stage2.5').name}) ──`);
```

Replace lines 216-217:
```javascript
  console.log('── AI stages complete ──');
  console.log('Run /curate in Claude Code to continue with stages 3-5.\n');
```

Also update the usage line (line 72) to include `--fallback`:
```javascript
  console.error('Usage: node curate.mjs <pdf-path> [--subject <slug>] [--type <course|lab|seminar|test>] [--desc <course-description.pdf>] [--redo] [--fallback]');
```

- [ ] **Step 9: Add the `getProvider` import for logging**

The main function logging in Step 8 uses `getProvider` directly. Confirm it's already imported (it is, from Step 1). No additional changes needed.

- [ ] **Step 10: Verify the script loads and shows help**

Run: `cd /c/Users/User/Desktop/SO/os-study-guide && node scripts/curate.mjs`

Expected: Usage message ending with `[--fallback]`

- [ ] **Step 11: Commit**

```bash
git add scripts/curate.mjs
git commit -m "feat: integrate multi-provider system into curate pipeline

Stages use Gemini 3 Flash for critical work (stage 1, 2, bibliography)
and OpenRouter for bulk work (stage 2.5, source search). --fallback flag
enables automatic downgrade on rate limit. Provider metadata tracked in
all stage outputs and status files."
```

---

### Task 3: Update `.env.example`

**Files:**
- Modify: `proxy/.env.example`

- [ ] **Step 1: Add `GEMINI_API_KEY` to env example**

The current `proxy/.env.example` has `GROQ_API_KEYS` and `OPENROUTER_API_KEYS`. Add the Gemini key:

Replace the full file content with:

```bash
# Comma-separated list of API keys (add as many as you want)
GROQ_API_KEYS=gsk_key1,gsk_key2,gsk_key3
OPENROUTER_API_KEYS=sk-or-v1-key1,sk-or-v1-key2

# Old singular format still works (treated as a single-key pool)
# GROQ_API_KEY=gsk_single
# OPENROUTER_API_KEY=sk-or-v1-single

# Gemini API key (used by curate pipeline for high-quality PDF extraction)
GEMINI_API_KEY=your-gemini-key-here

PORT=3001
CORS_ORIGIN=https://corgigh.github.io
```

- [ ] **Step 2: Commit**

```bash
git add proxy/.env.example
git commit -m "docs: add GEMINI_API_KEY to .env.example"
```

---

### Task 4: Smoke Test — End-to-End Verification

**Files:**
- Read (verify): `scripts/providers.mjs`, `scripts/curate.mjs`

- [ ] **Step 1: Verify module loads with both providers detected**

Run: `cd /c/Users/User/Desktop/SO/os-study-guide && node -e "
  import('dotenv').then(d => d.config({ path: 'proxy/.env' }));
  setTimeout(async () => {
    const m = await import('./scripts/providers.mjs');
    console.log('Exports:', Object.keys(m).join(', '));
    const s1 = m.getProvider('stage1');
    const s25 = m.getProvider('stage2.5');
    console.log('Stage 1 provider:', s1.name, s1.model);
    console.log('Stage 2.5 provider:', s25.name, s25.model);
  }, 100);
"`

Expected:
```
Exports: getProvider, markGeminiExhausted, isGeminiExhausted, RateLimitError, geminiProvider, openrouterProvider, loadPromptTemplate
Stage 1 provider: gemini gemini-3-flash-preview
Stage 2.5 provider: openrouter google/gemini-2.5-flash:free
```

- [ ] **Step 2: Verify curate status command still works**

Run: `cd /c/Users/User/Desktop/SO/os-study-guide && node scripts/curate.mjs status`

Expected: Lists active pipelines or "No active pipelines." — no import errors.

- [ ] **Step 3: Verify fallback flag is recognized**

Run: `cd /c/Users/User/Desktop/SO/os-study-guide && node scripts/curate.mjs`

Expected: Usage message includes `[--fallback]`.

- [ ] **Step 4: Test with a real PDF (optional — requires API keys in .env)**

If `GEMINI_API_KEY` and `OPENROUTER_API_KEYS` are set in `proxy/.env`:

Run: `cd /c/Users/User/Desktop/SO/os-study-guide && node scripts/curate.mjs src/content/os/info/curs1.pdf --subject os --type course`

Expected: Stage 1 uses Gemini, creates `stage1-extraction.json` with `_provider` field. Stage 2 uses Gemini (or OpenRouter if quota exhausted). Status file includes `stages` object with provider info.

- [ ] **Step 5: Final commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: address smoke test issues in multi-provider pipeline"
```
