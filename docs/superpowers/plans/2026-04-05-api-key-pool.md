# API Key Pool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pool multiple Groq and OpenRouter API keys with round-robin selection and automatic 429 failover to maximize available token quota.

**Architecture:** Replace the single-key `callLLM()` with a key-pool-aware version. Keys are parsed from comma-separated env vars at startup. Round-robin index per service selects the next key; on 429, cycle through remaining keys before falling back to the next service.

**Tech Stack:** Node.js, Express (existing proxy server)

---

## File Structure

- **Modify:** `proxy/server.js` — key parsing, round-robin state, new `callLLM()` with fallback chain
- **Modify:** `proxy/.env.example` — updated to show plural key format

---

### Task 1: Update .env.example with plural key format

**Files:**
- Modify: `proxy/.env.example`

- [ ] **Step 1: Update .env.example**

Replace the contents of `proxy/.env.example` with:

```env
# Comma-separated list of API keys (add as many as you want)
GROQ_API_KEYS=gsk_key1,gsk_key2,gsk_key3
OPENROUTER_API_KEYS=sk-or-v1-key1,sk-or-v1-key2

# Old singular format still works (treated as a single-key pool)
# GROQ_API_KEY=gsk_single
# OPENROUTER_API_KEY=sk-or-v1-single

PORT=3001
CORS_ORIGIN=https://corgigh.github.io
```

- [ ] **Step 2: Commit**

```bash
git add proxy/.env.example
git commit -m "docs: update .env.example with plural API key format"
```

---

### Task 2: Parse key arrays from env vars

**Files:**
- Modify: `proxy/server.js:9-10`

- [ ] **Step 1: Replace the single-key constants with array parsing**

In `proxy/server.js`, replace these two lines (lines 9-10):

```js
const GROQ_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
```

With:

```js
function parseKeys(plural, singular) {
  const raw = process.env[plural] || process.env[singular] || '';
  return raw.split(',').map(k => k.trim()).filter(Boolean);
}

const groqKeys = parseKeys('GROQ_API_KEYS', 'GROQ_API_KEY');
const openRouterKeys = parseKeys('OPENROUTER_API_KEYS', 'OPENROUTER_API_KEY');
let nextGroqIndex = 0;
let nextOpenRouterIndex = 0;

console.log(`Loaded ${groqKeys.length} Groq key(s), ${openRouterKeys.length} OpenRouter key(s)`);
```

- [ ] **Step 2: Verify the server still starts**

```bash
cd proxy && node server.js
```

Expected: Server starts and prints `Loaded N Groq key(s), N OpenRouter key(s)` followed by `Proxy running on port 3001`. Kill with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add proxy/server.js
git commit -m "feat: parse API key pools from comma-separated env vars"
```

---

### Task 3: Rewrite callLLM with round-robin + fallback chain

**Files:**
- Modify: `proxy/server.js` — replace the `callLLM` function (lines 52-78)

- [ ] **Step 1: Replace the callLLM function**

Replace the entire existing `callLLM` function:

```js
async function callLLM(messages, stream = false, useOpenRouter = false) {
  const url = useOpenRouter
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.groq.com/openai/v1/chat/completions';
  const key = useOpenRouter ? OPENROUTER_KEY : GROQ_KEY;
  const model = useOpenRouter ? OPENROUTER_MODEL : GROQ_MODEL;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages, stream, temperature: 0.7, max_tokens: 1024 }),
  });

  if (res.status === 429 && !useOpenRouter) {
    return callLLM(messages, stream, true);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM API error ${res.status}: ${err}`);
  }

  return res;
}
```

With this new implementation:

```js
async function tryKey(url, model, key, messages, stream) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages, stream, temperature: 0.7, max_tokens: 1024 }),
  });

  if (res.status === 429) return null; // signal to try next key

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM API error ${res.status}: ${err}`);
  }

  return res;
}

async function callLLM(messages, stream = false) {
  // Try all Groq keys starting from round-robin index
  for (let i = 0; i < groqKeys.length; i++) {
    const idx = (nextGroqIndex + i) % groqKeys.length;
    console.log(`Trying Groq key index ${idx}`);
    const res = await tryKey(
      'https://api.groq.com/openai/v1/chat/completions',
      GROQ_MODEL, groqKeys[idx], messages, stream
    );
    if (res) {
      nextGroqIndex = (idx + 1) % groqKeys.length;
      return res;
    }
    console.log(`Groq key index ${idx} rate-limited`);
  }

  // All Groq keys exhausted — try OpenRouter keys
  for (let i = 0; i < openRouterKeys.length; i++) {
    const idx = (nextOpenRouterIndex + i) % openRouterKeys.length;
    console.log(`Trying OpenRouter key index ${idx}`);
    const res = await tryKey(
      'https://openrouter.ai/api/v1/chat/completions',
      OPENROUTER_MODEL, openRouterKeys[idx], messages, stream
    );
    if (res) {
      nextOpenRouterIndex = (idx + 1) % openRouterKeys.length;
      return res;
    }
    console.log(`OpenRouter key index ${idx} rate-limited`);
  }

  throw new Error('All API keys rate-limited. Try again later.');
}
```

- [ ] **Step 2: Verify the server starts and the /health endpoint works**

```bash
cd proxy && node server.js &
curl http://localhost:3001/health
```

Expected: `{"status":"ok"}`

Kill the background process after.

- [ ] **Step 3: Manual test with a real request (optional)**

If keys are configured in `.env`, test with:

```bash
curl -X POST http://localhost:3001/api/verify \
  -H "Content-Type: application/json" \
  -d '{"question":"What is 2+2?","studentAnswer":"4","type":"open-ended"}'
```

Expected: A JSON response with `verdict` and `explanation` fields. Console should show `Trying Groq key index 0`.

- [ ] **Step 4: Commit**

```bash
git add proxy/server.js
git commit -m "feat: round-robin API key pool with 429 fallback chain"
```

---

### Task 4: Update .env on VPS

**Files:**
- Remote: VPS at `46.247.109.91`, proxy `.env`

- [ ] **Step 1: SSH into VPS and update the .env file**

Update the proxy `.env` on the VPS to use the new plural format with all available keys:

```env
GROQ_API_KEYS=gsk_key1,gsk_key2,gsk_key3,gsk_key4
OPENROUTER_API_KEYS=sk-or-v1-key1,sk-or-v1-key2
PORT=3001
CORS_ORIGIN=*
```

- [ ] **Step 2: Restart the proxy with PM2**

```bash
pm2 restart proxy
pm2 logs proxy --lines 5
```

Expected: Logs show `Loaded N Groq key(s), N OpenRouter key(s)` and `Proxy running on port 3001`.

- [ ] **Step 3: Verify from outside**

```bash
curl https://studyguide.duckdns.org/health
```

Expected: `{"status":"ok"}`
