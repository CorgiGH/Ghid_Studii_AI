# Multi-Provider AI Pipeline — Design Spec

**Date:** 2026-04-07
**Status:** Approved
**Scope:** Replace single-provider Gemini pipeline with adaptive Gemini + OpenRouter system

## Problem

The curate pipeline (`scripts/curate.mjs`) uses Gemini 2.5 Flash for all API stages (1, 2, 2.5, bibliography). The free tier is capped at ~20 RPD, limiting throughput to ~4-6 courses/day. The user has multiple OpenRouter API keys available and wants to process ~15 courses/day while maximizing quality where it matters most.

## Solution

Introduce a provider abstraction layer that routes requests to Gemini (high quality, limited quota) or OpenRouter (adequate quality, higher quota) based on stage priority and remaining quota.

## Providers

### Gemini (Primary — quality-critical stages)

- SDK: `@google/generative-ai`
- Model: `gemini-3-flash-preview` (newest free model, best quality)
- Auth: `GEMINI_API_KEY` env var (single key)
- Capabilities: Native PDF upload, structured JSON output, 1M context
- Limit: ~20 RPD on free tier

### OpenRouter (Secondary — bulk stages)

- API: OpenAI-compatible REST (`https://openrouter.ai/api/v1/chat/completions`)
- Model: A free vision-capable model for PDF stages (e.g., `google/gemini-2.5-flash:free` or `qwen/qwen3.6-plus:free`), a free text model for text-only stages
- Auth: `OPENROUTER_API_KEYS` env var (comma-separated, round-robin rotation)
- Capabilities: Vision models can handle PDF pages as images, text models handle cross-reference/diff
- Limit: ~50 RPD per key. With 2-3 keys = 100-150 RPD

## Provider Interface

Both providers expose the same two functions:

```javascript
async sendPdf(pdfPath, prompt) → string   // PDF + prompt → text response
async sendText(prompt) → string            // Text prompt → text response
```

OpenRouter's `sendPdf` converts the PDF to base64 and sends it as a document/image part via a vision-capable free model.

## Stage-to-Provider Allocation

| Stage | Default provider | Rationale |
|-------|-----------------|-----------|
| Stage 1 (PDF extraction) | **Gemini** | Most critical — errors cascade. Native PDF understanding matters. |
| Stage 2 (cross-reference) | **Gemini if quota remains**, else OpenRouter | Benefits from strong reasoning but is text-only. |
| Bibliography extraction | **Gemini if quota remains**, else OpenRouter | PDF-based but structurally simpler than Stage 1. |
| Stage 2.5 (diff) | **OpenRouter** | Mechanical comparison — low quality sensitivity. |
| Source search | **OpenRouter** | Simple classification task — any model handles it. |

The allocation does not require tracking Gemini's RPD counter. The script simply attempts Gemini for Gemini-priority stages. If it receives HTTP 429 (rate limited), it knows quota is exhausted.

## Fallback Behavior

### Default mode (no flag)

When Gemini returns 429 on a Gemini-priority stage:
1. Log: `"⚠️ Gemini rate limit hit on [stage]. Run with --fallback to continue with OpenRouter, or wait and re-run."`
2. Stop the pipeline.
3. Status file records progress — re-running later resumes from this point.

### `--fallback` flag

When Gemini returns 429 on a Gemini-priority stage:
1. Log: `"⚠️ Gemini rate limited — falling back to OpenRouter for [stage]"`
2. Retry the same stage using OpenRouter.
3. Continue the pipeline.
4. Mark the stage as downgraded in status/metadata (see below).

The user can later re-run specific stages with `--from stageN` to upgrade downgraded outputs when Gemini quota resets.

## Provider Tracking

### Per-stage output metadata

Each stage output JSON includes a `_provider` field:

```json
{
  "_provider": {
    "name": "gemini",
    "model": "gemini-3-flash-preview",
    "timestamp": "2026-04-07T14:30:00Z"
  },
  "sections": [...]
}
```

### Status file enhancement

`curate-status.json` records provider info per completed stage:

```json
{
  "lastCompleted": "stage2",
  "type": "course",
  "subject": "os",
  "stages": {
    "stage1": { "provider": "gemini", "model": "gemini-3-flash-preview" },
    "stage2": { "provider": "openrouter", "model": "google/gemini-2.5-flash:free", "fallback": true }
  }
}
```

The `fallback: true` flag indicates the stage was downgraded due to rate limiting. This makes it easy to find courses that need re-processing:
- Scan all `curate-status.json` files for `"fallback": true`
- Re-run those specific stages after quota resets

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `scripts/gemini.mjs` | **Rename** to `scripts/providers.mjs` | Add OpenRouter provider alongside Gemini, export unified interface + stage-aware selector |
| `scripts/curate.mjs` | **Modify** | Import from `providers.mjs`, use stage-aware provider selection, add `--fallback` CLI flag, write `_provider` metadata to stage outputs and status file |
| `proxy/.env` | **Modify** | Ensure `GEMINI_API_KEY` is present alongside existing `OPENROUTER_API_KEYS` |
| `proxy/.env.example` | **Modify** | Add `GEMINI_API_KEY=your-key-here` entry |

## OpenRouter Key Rotation

Keys are loaded from `OPENROUTER_API_KEYS` (comma-separated). A simple round-robin counter rotates through them per request. If one key returns 429, the next key is tried. If all keys are exhausted, the pipeline stops (same as Gemini exhaustion behavior).

## Error Handling

| Error | Behavior |
|-------|----------|
| Gemini 429 (rate limit) | Fallback to OpenRouter if `--fallback`, else stop |
| OpenRouter 429 (all keys) | Stop pipeline, log which keys were tried |
| Gemini other error (500, network) | Retry once, then fail the stage |
| OpenRouter other error | Retry once with next key, then fail |
| Invalid JSON response | Existing repair logic applies regardless of provider |

## No New Dependencies

OpenRouter uses the standard `fetch` API (available in Node 18+) with OpenAI-compatible REST format. No new npm packages needed. The existing `@google/generative-ai` package stays for Gemini.
