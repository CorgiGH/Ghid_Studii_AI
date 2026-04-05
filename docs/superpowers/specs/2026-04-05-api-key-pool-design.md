# API Key Pool with Round-Robin + Fallback Chain

## Problem

The proxy server uses a single Groq API key and a single OpenRouter key. Groq's free tier has a ~500k token daily limit, which can be exhausted quickly since each chat request includes ~2k tokens of context. We need to pool multiple API keys to increase total available quota.

## Solution

Add support for multiple API keys per service (Groq, OpenRouter) with round-robin selection and automatic failover on rate limits.

## .env Format

Comma-separated key lists. Backwards-compatible with the old singular env vars.

```env
# New plural format (preferred)
GROQ_API_KEYS=gsk_key1,gsk_key2,gsk_key3,gsk_key4
OPENROUTER_API_KEYS=sk-or-v1-key1,sk-or-v1-key2

# Old singular format still works as a single-key pool
GROQ_API_KEY=gsk_single
OPENROUTER_API_KEY=sk-or-v1-single
```

## Key Selection: Round-Robin

Each service maintains an in-memory index counter. On each request, the next key in the array is selected and the index wraps around. This distributes load evenly across all keys.

- `nextGroqIndex` starts at 0, increments mod `groqKeys.length`
- `nextOpenRouterIndex` starts at 0, increments mod `openRouterKeys.length`
- Index resets on server restart (acceptable — evens out over time)

## Fallback Chain Per Request

1. Pick the current round-robin Groq key and call the LLM
2. If 429 (rate limited) → try the next Groq key
3. Cycle through all Groq keys. If all return 429 → fall through to OpenRouter
4. Pick the current round-robin OpenRouter key and call the LLM
5. If 429 → try the next OpenRouter key
6. If all OpenRouter keys also return 429 → return error to the client

Any non-429 error (auth failure, server error, etc.) is thrown immediately without trying the next key.

## Changes

### `proxy/server.js`
- Parse `GROQ_API_KEYS` (or fall back to `GROQ_API_KEY`) into an array
- Parse `OPENROUTER_API_KEYS` (or fall back to `OPENROUTER_API_KEY`) into an array
- Replace `callLLM()` with a key-pool-aware version that implements the round-robin + fallback chain described above
- Log which key index is being used (not the key itself) for debugging

### `proxy/.env.example`
- Update to show the new plural format

### No changes to:
- Client-side code (`src/services/api.js`, React components)
- Judge0 integration (client-side, keyless)
- Request/response API format
