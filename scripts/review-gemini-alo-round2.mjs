#!/usr/bin/env node
// One-off: send ALO round-2 screenshots to Gemini vision and print its review.
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

config({ path: resolve('proxy/.env') });

const keys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map(k => k.trim()).filter(Boolean);
if (keys.length === 0) {
  console.error('GEMINI_API_KEY not set');
  process.exit(1);
}

const MODEL = 'gemini-3-flash-preview';
const DIR = resolve('wiki/raw/assets/review');

// Pick the latest timestamp from live-* pngs
const files = readdirSync(DIR).filter(f => f.endsWith('.png') && f.includes('_live-'));
const latestTs = files.map(f => f.slice(0, 19)).sort().pop();
console.error('Using batch:', latestTs);

// Send a curated subset: step1 + step2 + step3 + step4 across light/dark desktop, plus 2 mobile
const picks = [
  `${latestTs}_live-light-desktop_step1.png`,
  `${latestTs}_live-light-desktop_step2.png`,
  `${latestTs}_live-light-desktop_step3.png`,
  `${latestTs}_live-light-desktop_step4.png`,
  `${latestTs}_live-dark-desktop_step1.png`,
  `${latestTs}_live-dark-desktop_step2.png`,
  `${latestTs}_live-dark-desktop_step3.png`,
  `${latestTs}_live-dark-desktop_step4.png`,
  `${latestTs}_live-light-mobile_step2.png`,
  `${latestTs}_live-dark-mobile_step3.png`,
];

const UX_PLAYBOOK = readFileSync(resolve('wiki/architecture/UX Playbook.md'), 'utf8');
const MATH_UX     = readFileSync(resolve('wiki/concepts/Math & Equation UX.md'), 'utf8');
const LONGFORM    = readFileSync(resolve('wiki/concepts/Long-Form Reading UX.md'), 'utf8');

const PROMPT = `You are a senior UX reviewer for an educational web app teaching Linear Algebra.
This is a ROUND-2 visual review of the ALO Course 1 page after round-1 fixes shipped.
The 10 attached screenshots are the live-deployed page in both themes, stepping through course sections.

ROUND-1 FIXES TO VERIFY (mark each as FIXED, STILL-BROKEN, or N/A):
V1. Equation blocks should now have a blue left-rail and NO card border / NO card background — distinct from learn callouts.
V2. Equation label chip should now sit in a RIGHT GUTTER (italic serif), not crowd the formula.
V3. Rasterized slides should now have a visible "photo-frame" wrapper (card-bg padding) in dark mode.
V5. KaTeX display equations should have a subtle color-mix tint in dark mode.
V7. Image captions should now be italic, left-aligned, and larger / more readable.
V8. Pixel-matrix SVD slide: click-to-zoom link around image should help mobile.
V9. Inline math variable styling should be consistent (KaTeX CSS rules).
V4 and V10 were intentionally NOT fixed (out of ALO scope) — mark STILL-BROKEN if visible, else N/A.

ALSO CHECK:
- The new "pretest think block" (usually a yellow/amber callout with a prompt + reveal gate) — is it visually clear as a CHALLENGE moment vs ordinary callouts?
- The new retrospective table at the end of the SVD example (step 4) — is it readable, grouped, aligned?
- The new self-test quiz (may be step 5, may not be captured) — per-option explanations, reviewStep navigation — render notes if visible, otherwise skip.
- Any NEW layout issues the round-1 fixes introduced (e.g., ambiguity between equation block and learn callout, gutter label clipping, photo-frame awkward on mobile, etc.).

REPORT FORMAT (strict):
First, a table of V1–V10 with status (FIXED / STILL-BROKEN / N/A / NOT-VISIBLE) and a one-line justification each.
Then, up to 8 NEW findings in this format:

### [severity: critical|improvement|suggestion] — Short title
**Where:** component/page hint (e.g., equation block step 2 dark mobile)
**Issue:** 1-2 sentences explaining what's visually wrong and why it matters.
**Fix:** 1-2 sentences with a specific actionable recommendation.
**Principle:** short rationale referencing UX/Math-UX principle.

End with a one-line verdict: "Ship as-is" or "Needs round 3" and why.

CONTEXT — UX PLAYBOOK (trimmed):
${UX_PLAYBOOK}

CONTEXT — MATH & EQUATION UX:
${MATH_UX}

CONTEXT — LONG-FORM READING UX:
${LONGFORM}
`;

async function callGemini() {
  const client = new GoogleGenerativeAI(keys[0]);
  const model = client.getGenerativeModel({ model: MODEL });
  const parts = [{ text: PROMPT }];
  for (const name of picks) {
    const p = resolve(DIR, name);
    try {
      const buf = readFileSync(p);
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: buf.toString('base64'),
        },
      });
      console.error('Attached:', name, `(${(buf.length/1024).toFixed(0)}KB)`);
    } catch (e) {
      console.error('Missing:', name);
    }
  }
  const result = await model.generateContent(parts);
  return result.response.text();
}

try {
  const out = await callGemini();
  console.log(out);
} catch (e) {
  console.error('Gemini call failed:', e.message);
  // Try rotation if multi-key
  if (keys.length > 1) {
    try {
      const client = new GoogleGenerativeAI(keys[1]);
      const model = client.getGenerativeModel({ model: MODEL });
      const parts = [{ text: PROMPT }];
      for (const name of picks) {
        const buf = readFileSync(resolve(DIR, name));
        parts.push({ inlineData: { mimeType: 'image/png', data: buf.toString('base64') } });
      }
      const result = await model.generateContent(parts);
      console.log(result.response.text());
    } catch (e2) {
      console.error('Second key also failed:', e2.message);
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
}
