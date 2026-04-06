import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const GEMINI_MODEL = 'gemini-2.5-flash';

let genAI = null;

function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not set. Add it to proxy/.env');
      process.exit(1);
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export function getModel() {
  return getClient().getGenerativeModel({ model: GEMINI_MODEL });
}

export async function sendPdfWithPrompt(pdfPath, promptText) {
  const model = getModel();
  const pdfBuffer = readFileSync(resolve(pdfPath));
  const pdfBase64 = pdfBuffer.toString('base64');

  const result = await model.generateContent([
    { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
    { text: promptText },
  ]);

  return result.response.text();
}

export async function sendTextPrompt(promptText) {
  const model = getModel();
  const result = await model.generateContent(promptText);
  return result.response.text();
}

export function loadPromptTemplate(templateName) {
  const templatePath = resolve('scripts/prompts', templateName);
  return readFileSync(templatePath, 'utf-8');
}
