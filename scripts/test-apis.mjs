import { readFileSync } from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const env = readFileSync('../proxy/.env', 'utf-8');
const vars = {};
env.split('\n').forEach(line => {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) vars[m[1].trim()] = m[2].trim();
});

const geminiKeys = (vars.GEMINI_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
const orKeys = (vars.OPENROUTER_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);

console.log('=== GEMINI ===');
console.log('Keys:', geminiKeys.length);

const models = ['gemini-3-flash-preview', 'gemini-2.5-flash'];
for (const modelName of models) {
  console.log(`\n--- ${modelName} ---`);
  for (let i = 0; i < geminiKeys.length; i++) {
    try {
      const client = new GoogleGenerativeAI(geminiKeys[i]);
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello in one word');
      console.log(`Key ${i+1}: OK - ${result.response.text().trim().slice(0,60)}`);
    } catch(e) {
      console.log(`Key ${i+1}: ${e.status || ''} ${e.message?.slice(0,150)}`);
    }
  }
}

console.log('\n=== OPENROUTER ===');
console.log('Keys:', orKeys.length);
for (let i = 0; i < orKeys.length; i++) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${orKeys[i]}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: 'Say hello in one word' }],
        max_tokens: 50,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`Key ${i+1}: OK - ${(data.choices?.[0]?.message?.content || '').slice(0,50)}`);
      console.log(`  Credits remaining: check https://openrouter.ai/settings/credits`);
    } else {
      console.log(`Key ${i+1}: HTTP ${res.status} - ${JSON.stringify(data.error || data).slice(0,200)}`);
    }
  } catch(e) {
    console.log(`Key ${i+1}: ${e.message?.slice(0,120)}`);
  }
}
