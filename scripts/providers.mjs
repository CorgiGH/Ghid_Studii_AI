import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Gemini Provider ──

const GEMINI_MODEL = 'gemini-3-flash-preview';

let geminiKeys = [];
let geminiKeyIndex = 0;

function getGeminiKeys() {
  if (geminiKeys.length === 0) {
    const raw = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
    geminiKeys = raw.split(',').map(k => k.trim()).filter(Boolean);
    if (geminiKeys.length === 0) {
      throw new Error('GEMINI_API_KEY not set. Add it to proxy/.env (supports comma-separated GEMINI_API_KEYS for rotation)');
    }
    if (geminiKeys.length > 1) {
      console.log(`  🔑 ${geminiKeys.length} Gemini keys loaded — will rotate on rate limit`);
    }
  }
  return geminiKeys;
}

function nextGeminiModel() {
  const keys = getGeminiKeys();
  const key = keys[geminiKeyIndex % keys.length];
  geminiKeyIndex++;
  const client = new GoogleGenerativeAI(key);
  return client.getGenerativeModel({ model: GEMINI_MODEL });
}

class RateLimitError extends Error {
  constructor(provider, message) {
    super(message);
    this.name = 'RateLimitError';
    this.provider = provider;
  }
}

async function geminiWithRetry(fn, retries = 0) {
  const keys = getGeminiKeys();
  try {
    const model = nextGeminiModel();
    return await fn(model);
  } catch (err) {
    const isRateLimit = err.status === 429 || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED');
    if (isRateLimit && retries < keys.length - 1) {
      console.log(`  ⚠ Gemini key ${((geminiKeyIndex - 1) % keys.length) + 1} rate limited, trying key ${(geminiKeyIndex % keys.length) + 1}...`);
      return geminiWithRetry(fn, retries + 1);
    }
    if (isRateLimit) {
      throw new RateLimitError('gemini', `All ${keys.length} Gemini key(s) rate limited: ${err.message}`);
    }
    throw err;
  }
}

const geminiProvider = {
  name: 'gemini',
  model: GEMINI_MODEL,

  async sendPdf(pdfPath, promptText) {
    const pdfBuffer = readFileSync(resolve(pdfPath));
    const pdfBase64 = pdfBuffer.toString('base64');

    return geminiWithRetry(async (model) => {
      const result = await model.generateContent([
        { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
        { text: promptText },
      ]);
      return result.response.text();
    });
  },

  async sendText(promptText) {
    return geminiWithRetry(async (model) => {
      const result = await model.generateContent(promptText);
      return result.response.text();
    });
  },
};

// ── OpenRouter Provider ──

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_VISION_MODEL = 'google/gemini-2.5-flash';
const OPENROUTER_TEXT_MODEL = 'google/gemini-2.5-flash';

let openrouterKeys = [];
let openrouterKeyIndex = 0;

function getOpenRouterKeys() {
  if (openrouterKeys.length === 0) {
    const raw = process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || '';
    openrouterKeys = raw.split(',').map(k => k.trim()).filter(Boolean);
    if (openrouterKeys.length === 0) {
      throw new Error('OPENROUTER_API_KEYS not set. Add it to proxy/.env');
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
  if (!data.choices?.[0]?.message?.content) {
    throw new Error(`OpenRouter returned unexpected response: ${JSON.stringify(data).slice(0, 200)}`);
  }
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

// ── Stage Allocation ──

const STAGE_PROVIDER = {
  'stage1':       'gemini',
  'stage2':       'gemini',
  'stage2.5':     'gemini',
  'bibliography': 'gemini',
  'source-search':'gemini',
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

export function loadPromptTemplate(templateName) {
  const templatePath = resolve('scripts/prompts', templateName);
  return readFileSync(templatePath, 'utf-8');
}
