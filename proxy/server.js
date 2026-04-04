import express from 'express';
import cors from 'cors';
import { createHash } from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const GROQ_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const OPENROUTER_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

app.use(cors({ origin: CORS_ORIGIN }));
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

    const llmRes = await callLLM(messages, true);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = llmRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

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
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch {
            // skip
          }
        }
      }
    }

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

    const llmRes = await callLLM(messages, false);
    const data = await llmRes.json();
    const raw = data.choices?.[0]?.message?.content || '';

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

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
  console.log(`CORS origin: ${CORS_ORIGIN}`);
});
