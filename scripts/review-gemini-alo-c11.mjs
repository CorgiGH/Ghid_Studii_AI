#!/usr/bin/env node
// One-off: send ALO course-11 screenshots to Gemini vision and print its review.
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

// Pick latest batch (matches our timestamp pattern)
const files = readdirSync(DIR).filter(f => f.endsWith('.png') && /^2026-05-12T/.test(f));
const latestTs = files.map(f => f.slice(0, 19)).sort().pop();
console.error('Using batch:', latestTs);

// Curated subset (per task instructions): cover, dense-math (Laguerre), Aitken table, quiz,
// + mobile variants. Mapping:
//   base       = step 1 (Newton-Raphson cover)
//   step03     = step 4 (Laguerre)
//   step04     = step 5 (Newton-systems — has dense matrix math + mid-step quiz)
//   step06     = step 7 (Lagrange interpolation)
//   step09     = step 10 (Aitken table)
//   step10     = step 11 (Self-test quiz)
const picks = [
  `${latestTs}_light-desktop.png`,                // 1. Newton cover
  `${latestTs}_dark-desktop.png`,                 // 1. Newton cover, dark
  `${latestTs}_light-desktop_step03.png`,         // 4. Laguerre (dense math)
  `${latestTs}_dark-desktop_step03.png`,          // 4. Laguerre dark
  `${latestTs}_light-desktop_step04.png`,         // 5. Newton-systems
  `${latestTs}_dark-desktop_step07.png`,          // 8. Remainder theorem (group MC)
  `${latestTs}_light-desktop_step09.png`,         // 10. Aitken table
  `${latestTs}_dark-desktop_step09.png`,          // 10. Aitken table dark
  `${latestTs}_light-desktop_step10.png`,         // 11. Self-test quiz
  `${latestTs}_light-mobile_step03.png`,          // 4. Laguerre mobile
  `${latestTs}_dark-mobile_step03.png`,          // 4. Laguerre mobile dark
  `${latestTs}_light-mobile_step09.png`,          // 10. Aitken table mobile
  `${latestTs}_dark-mobile_step10.png`,          // 11. Self-test quiz mobile dark
];

const UX_PLAYBOOK = readFileSync(resolve('wiki/architecture/UX Playbook.md'), 'utf8');

const PROMPT = `You are a senior UX reviewer for an educational web application teaching numerical methods (Linear Algebra & Optimization, "ALO" subject, Course 11).

The 13 attached screenshots cover Course 11 ("Newton-Raphson, false position, secant, Laguerre, Newton-systems, Lagrange interpolation, Aitken's scheme, self-test") in both light/dark themes across desktop (1280px) and mobile (375px). They include the cover step (Newton-Raphson), a dense-math step (4. Laguerre — nested max[...] brackets, fractions inside fractions, multiple display equations), the Newton-systems step (matrix Jacobians + code), the remainder-theorem step (with a "GROUP MC" quiz that has per-option feedback), the Aitken triangular-table step (uses em-dash "—" cells as triangular-table placeholders), and the self-test quiz step.

FOCUS YOUR REVIEW ON:

1) KaTeX rendering quality — fractions inside fractions (Laguerre G(y_k), H(y_k)); nested max[ ... ] brackets; \\boxed{} blocks; matrix Jacobians; large product/summation; \\sqrt over compound expressions. Are any equations clipped, broken, mis-rendered, or visually awkward?

2) Aitken triangular table (step 10) — uses em-dashes ("—") as placeholders for missing cells in the lower-triangle of a divided-difference table. Does the table read as intentional (triangular pattern), or does it look broken/empty? Are column widths consistent? Is the column count appropriate for mobile (does anything clip)?

3) Dark-mode contrast on callouts — the course uses several callout block types (NOTĂ=note/info, ÎNVAȚĂ=learn, SFAT=tip, GÂNDEȘTE-TE=think, AVERTISMENT=warning, CAPCANĂ=trap, DEFINIȚIE=definition). Are all of them readable in dark mode? Any borderline contrast on the colored chips, headers, or body text?

4) Mobile overflow at 375px — long equations like "max[ p'(y_k) ± sqrt{(n-1)^2 [p'(y_k)]^2 - n(n-1)p(y_k)p''(y_k)} ]" are very wide. Does KaTeX scale them or do they overflow the card horizontally? Do code blocks overflow? Does the Aitken table overflow?

5) Quiz layout — step 11 has an 8-question self-test. Step 8 has a mid-step "Group MC" quiz with per-option distractor feedback. Are options clearly clickable? Are feedback messages legible? Is the correctness indicator (check/x) visible?

6) Dead UI — any unlabeled icons, unstyled buttons, missing focus rings, sticky overlap (e.g., a floating mobile bottom bar overlapping content), or visual elements that look broken/unintentional.

7) Visual hierarchy — does the page have a clear reading path through 11 dense pedagogical steps? Are step headers, block headers, math, and prose distinguishable at a glance?

REPORT FORMAT (strict — orchestrator pastes this to user):

Up to 10 findings, severity-tagged. For each finding:

### [severity: critical|improvement|suggestion] — Short title
**Where:** which step / which block / which screenshot config (e.g., "Step 4 Laguerre, light mobile", or "Step 10 Aitken table, all configs")
**Issue:** 1-2 sentences explaining what's visually wrong and why it matters for learning.
**Fix:** 1-2 sentences with a specific actionable recommendation (CSS rule, component change, content edit).
**Principle:** short rationale referencing the UX principle violated (cite the playbook category).

Severity rules:
- critical: WCAG AA violation, content unreadable, equation broken/clipped, course unusable on mobile
- improvement: suboptimal spacing/sizing/contrast that users can work around
- suggestion: polish that would improve quality but isn't blocking

If fewer than 10 issues exist, return fewer findings. Do NOT pad. Conclude with "_N additional minor items omitted._" only if there are real omissions.

UX PLAYBOOK CONTEXT (consult for principle naming):
${UX_PLAYBOOK}
`;

async function callGemini(keyIdx = 0) {
  const client = new GoogleGenerativeAI(keys[keyIdx]);
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
      console.error('Attached:', name, `(${(buf.length / 1024).toFixed(0)}KB)`);
    } catch (e) {
      console.error('Missing:', name);
    }
  }
  const result = await model.generateContent(parts);
  return result.response.text();
}

try {
  const out = await callGemini(0);
  console.log(out);
} catch (e) {
  console.error('Gemini call failed (key 0):', e.message);
  if (keys.length > 1) {
    try {
      console.error('Retrying with key 1...');
      const out = await callGemini(1);
      console.log(out);
    } catch (e2) {
      console.error('Second key also failed:', e2.message);
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
}
