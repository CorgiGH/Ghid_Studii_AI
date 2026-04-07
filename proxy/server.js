import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createHash } from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());
function parseKeys(plural, singular) {
  const raw = process.env[plural] || process.env[singular] || '';
  return raw.split(',').map(k => k.trim()).filter(Boolean);
}

const groqKeys = parseKeys('GROQ_API_KEYS', 'GROQ_API_KEY');
const openRouterKeys = parseKeys('OPENROUTER_API_KEYS', 'OPENROUTER_API_KEY');
let nextGroqIndex = 0;
let nextOpenRouterIndex = 0;

console.log(`Loaded ${groqKeys.length} Groq key(s), ${openRouterKeys.length} OpenRouter key(s)`);
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const OPENROUTER_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

// --- Daily usage tracking per key ---
const usageStats = new Map(); // key hash -> { provider, requests, inputTokens, outputTokens, date }

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function keyHash(key) {
  return createHash('sha256').update(key).digest('hex').slice(0, 8);
}

function getKeyStats(key, provider) {
  const hash = keyHash(key);
  const today = todayStr();
  if (!usageStats.has(hash) || usageStats.get(hash).date !== today) {
    usageStats.set(hash, { provider, requests: 0, inputTokens: 0, outputTokens: 0, date: today });
  }
  return usageStats.get(hash);
}

function recordUsage(key, provider, inputTokens, outputTokens) {
  const stats = getKeyStats(key, provider);
  stats.requests++;
  stats.inputTokens += inputTokens;
  stats.outputTokens += outputTokens;
  console.log(`[usage] ${stats.provider} key ...${keyHash(key)} | today: ${stats.requests} reqs, ${stats.inputTokens + stats.outputTokens} tokens (${stats.inputTokens} in + ${stats.outputTokens} out)`);
}

app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json({ limit: '64kb' }));

const verifyCache = new Map();

function buildChatSystemPrompt(pageContext, syllabus) {
  return `You are a friendly, knowledgeable CS university tutor. Your role is to help students understand course material deeply — not just give answers, but build understanding.

Current page content (use as primary reference):
${pageContext}

Subject overview:
${syllabus}

Rules:
- Respond in whatever language the student writes in
- Ground answers in the course material when applicable
- Use your general CS knowledge when the question goes beyond the page content
- Be encouraging but accurate — never make up information
- Use examples and analogies to explain complex concepts
- Keep responses concise but thorough`;
}

function buildVerifySystemPrompt() {
  return `You are an answer evaluator for a CS university course. Evaluate the student's answer and respond with a JSON object:
{"verdict": "correct" | "partial" | "wrong", "explanation": "your explanation here"}

Rules:
- "correct": answer demonstrates full understanding of key concepts
- "partial": answer is on the right track but missing important aspects
- "wrong": answer is incorrect or shows fundamental misunderstanding
- Respond in whatever language the student's question is written in
- Be encouraging even when the answer is wrong
- Always explain WHY the answer is correct/partial/wrong
- Reference the key concepts and model answer when provided
- Respond ONLY with the JSON object, no other text`;
}

async function tryKey(url, model, key, messages, stream, { temperature = 0.7, max_tokens = 1024 } = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages, stream, temperature, max_tokens }),
  });

  if (res.status === 429) return null; // signal to try next key

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM API error ${res.status}: ${err}`);
  }

  return res;
}

async function callLLM(messages, stream = false, opts = {}) {
  // Estimate input tokens (~4 chars per token)
  const inputEstimate = Math.ceil(messages.reduce((sum, m) => sum + m.content.length, 0) / 4);

  // Try all Groq keys starting from round-robin index
  for (let i = 0; i < groqKeys.length; i++) {
    const idx = (nextGroqIndex + i) % groqKeys.length;
    console.log(`Trying Groq key index ${idx}`);
    const res = await tryKey(
      'https://api.groq.com/openai/v1/chat/completions',
      GROQ_MODEL, groqKeys[idx], messages, stream, opts
    );
    if (res) {
      nextGroqIndex = (idx + 1) % groqKeys.length;
      return { res, key: groqKeys[idx], provider: 'Groq', inputEstimate };
    }
    console.log(`Groq key index ${idx} rate-limited`);
  }

  // All Groq keys exhausted — try OpenRouter keys
  for (let i = 0; i < openRouterKeys.length; i++) {
    const idx = (nextOpenRouterIndex + i) % openRouterKeys.length;
    console.log(`Trying OpenRouter key index ${idx}`);
    const res = await tryKey(
      'https://openrouter.ai/api/v1/chat/completions',
      OPENROUTER_MODEL, openRouterKeys[idx], messages, stream, opts
    );
    if (res) {
      nextOpenRouterIndex = (idx + 1) % openRouterKeys.length;
      return { res, key: openRouterKeys[idx], provider: 'OpenRouter', inputEstimate };
    }
    console.log(`OpenRouter key index ${idx} rate-limited`);
  }

  throw new Error('All API keys rate-limited. Try again later.');
}

// POST /api/chat — streaming
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], pageContext = '', subjectSyllabus = '' } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    const messages = [
      { role: 'system', content: buildChatSystemPrompt(pageContext, subjectSyllabus) },
      ...history.slice(-10),
      { role: 'user', content: message },
    ];

    const { res: llmRes, key, provider, inputEstimate } = await callLLM(messages, true);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = llmRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let outputChars = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            recordUsage(key, provider, inputEstimate, Math.ceil(outputChars / 4));
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              outputChars += content.length;
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch {
            // skip
          }
        }
      }
    }

    recordUsage(key, provider, inputEstimate, Math.ceil(outputChars / 4));
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// POST /api/verify — cached
app.post('/api/verify', async (req, res) => {
  try {
    const { question, studentAnswer, type, options, correct, keyConcepts, modelAnswer } = req.body;
    if (!question) return res.status(400).json({ error: 'question required' });

    const cacheKey = createHash('sha256').update(`${question}|${studentAnswer}`).digest('hex');

    if (verifyCache.has(cacheKey)) {
      return res.json(verifyCache.get(cacheKey));
    }

    let userContent = `Question: ${question}\nStudent answer: ${studentAnswer}\nQuestion type: ${type || 'open-ended'}`;
    if (options) userContent += `\nOptions: ${options.join(', ')}`;
    if (correct !== undefined) userContent += `\nCorrect answer index: ${correct}`;
    if (keyConcepts?.length) userContent += `\nKey concepts to check: ${keyConcepts.join(', ')}`;
    if (modelAnswer) userContent += `\nModel answer: ${modelAnswer}`;

    const messages = [
      { role: 'system', content: buildVerifySystemPrompt() },
      { role: 'user', content: userContent },
    ];

    const { res: llmRes, key, provider, inputEstimate } = await callLLM(messages, false);
    const data = await llmRes.json();
    const raw = data.choices?.[0]?.message?.content || '';
    recordUsage(key, provider, inputEstimate, Math.ceil(raw.length / 4));

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      result = { verdict: 'partial', explanation: raw };
    }

    verifyCache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Verify error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/grade — rubric-based AI grading with concise structured feedback
function buildGradeSystemPrompt() {
  return `You grade university CS exam answers. Return ONLY a JSON object, no other text.

Format:
{"score": <number>, "maxScore": <number>, "feedback": {"correct": ["..."], "missing": ["..."], "incorrect": ["..."]}}

Rules:
- score is 0 to maxScore (partial credit allowed, be generous with partial credit)
- "correct": 1-2 bullet points on what the student got right (skip if nothing correct)
- "missing": 1-2 bullet points on key concepts the student missed (skip if nothing missing)
- "incorrect": 1-2 bullet points on factual errors (skip if none)
- Each bullet point is ONE short sentence (max 20 words)
- Empty arrays are fine — omit categories with nothing to say
- Match the language of the question (Romanian or English)
- Grade the MEANING, not the exact wording — if the student says the same thing in different words, it counts
- Paraphrasing, synonyms, and reordering are perfectly fine — only mark as missing if the concept is truly absent
- If the answer covers all rubric points even in informal language, give full marks
- NEVER pad feedback with filler like "Good attempt!" — only substantive points`;
}

app.post('/api/grade', async (req, res) => {
  try {
    const { prompt, studentAnswer, rubric, maxPoints, questionType, courseContext } = req.body;
    if (!prompt || !studentAnswer) return res.status(400).json({ error: 'prompt and studentAnswer required' });

    const cacheKey = createHash('sha256').update(`grade|${prompt}|${studentAnswer}`).digest('hex');
    if (verifyCache.has(cacheKey)) {
      return res.json(verifyCache.get(cacheKey));
    }

    let userContent = `Question (${questionType || 'open-ended'}, ${maxPoints || 10} points):\n${prompt}\n\nStudent answer:\n${studentAnswer}`;
    if (rubric) userContent += `\n\nGrading rubric:\n${rubric}`;
    if (courseContext) userContent += `\n\nRelevant course material (use as ground truth):\n${courseContext}`;

    const messages = [
      { role: 'system', content: buildGradeSystemPrompt() },
      { role: 'user', content: userContent },
    ];

    const { res: llmRes, key, provider, inputEstimate } = await callLLM(messages, false, { temperature: 0.1 });
    const data = await llmRes.json();
    const raw = data.choices?.[0]?.message?.content || '';
    recordUsage(key, provider, inputEstimate, Math.ceil(raw.length / 4));

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      result = { score: 0, maxScore: maxPoints || 10, feedback: { incorrect: [raw.slice(0, 200)] } };
    }

    verifyCache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Grade error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// GET /stats — daily usage per key
app.get('/stats', (req, res) => {
  const today = todayStr();
  const stats = [];
  for (const [hash, s] of usageStats) {
    if (s.date === today) {
      stats.push({
        key: `...${hash}`,
        provider: s.provider,
        requests: s.requests,
        inputTokens: s.inputTokens,
        outputTokens: s.outputTokens,
        totalTokens: s.inputTokens + s.outputTokens,
      });
    }
  }
  res.json({ date: today, keys: stats, totalRequests: stats.reduce((s, k) => s + k.requests, 0) });
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
  console.log(`CORS origins: ${CORS_ORIGINS.join(', ')}`);
});
