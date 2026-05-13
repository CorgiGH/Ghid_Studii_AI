#!/usr/bin/env node
// Visual review for OOP Course 7: STL (1) — Sequence Containers, Adaptors, I/O Streams, Strings, Init Lists, Iterators.
// Adapted from review-gemini-oop-c11.mjs.
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

config({ path: resolve('proxy/.env') });

const keys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map(k => k.trim()).filter(Boolean);
if (keys.length === 0) { console.error('GEMINI_API_KEY not set'); process.exit(1); }

const DIR = resolve('wiki/raw/assets/review');

// Use the c7 screenshot batch produced by T12.
const allFiles = readdirSync(DIR).filter(f => f.endsWith('.png') && /^2026-05-13T13-19-24/.test(f));
const tsCounts = allFiles.reduce((m, f) => { const ts = f.slice(0, 19); m[ts] = (m[ts] || 0) + 1; return m; }, {});
const latestTs = Object.keys(tsCounts).sort().pop();
console.error('Using batch:', latestTs, `(${tsCounts[latestTs]} files)`);

// Pick a representative cross-section: cover, an early step, a mid step, the iterators step, and the final quiz step
// across all 4 (light/dark x desktop/mobile) configs.
//
// step01 = oop-c7-vector        (early — reallocation cost, operator[] vs at)
// step03 = oop-c7-list-forward  (mid-early — list/forward_list iterator gaps)
// step06 = oop-c7-strings       (mid — string_view::data not null-terminated)
// step08 = oop-c7-iterators     (late — iterator invalidation)
// step09 = oop-c7-quiz          (final self-test, ~27 MC questions)
const picks = [
  `${latestTs}_light-desktop.png`,
  `${latestTs}_dark-desktop.png`,
  `${latestTs}_light-mobile.png`,
  `${latestTs}_dark-mobile.png`,
  `${latestTs}_light-desktop_step01.png`,
  `${latestTs}_dark-desktop_step01.png`,
  `${latestTs}_light-mobile_step01.png`,
  `${latestTs}_dark-mobile_step01.png`,
  `${latestTs}_light-desktop_step06.png`,
  `${latestTs}_dark-desktop_step06.png`,
  `${latestTs}_light-mobile_step06.png`,
  `${latestTs}_light-desktop_step08.png`,
  `${latestTs}_dark-desktop_step08.png`,
  `${latestTs}_light-mobile_step08.png`,
  `${latestTs}_dark-mobile_step08.png`,
];

const UX_PLAYBOOK = readFileSync(resolve('wiki/architecture/UX Playbook.md'), 'utf8');

const PROMPT = `You are a senior UX reviewer for an educational web application. Round-1 visual review of OOP Course 7: "STL (1) — Sequence Containers, Adaptors, I/O Streams, Strings, Init Lists, Iterators" (C++ standard library: vector, deque, array, list, forward_list, stack/queue/priority_queue, iostream, string/string_view, initializer_list, iterator categories). 10 steps total; this batch covers cover + steps 1, 6, 8, 9 (final self-test step).

ATTACHED SCREENSHOTS (15 PNGs, all fullPage Puppeteer captures):

1-4. Course cover (step 0) — light-desktop, dark-desktop, light-mobile, dark-mobile. Shows course title, step list, "Start" button, possibly a quick-quiz preview.
5-8. Step 1 (oop-c7-vector) — light/dark x desktop/mobile. Early content; expect prose + code examples for vector reallocation, push_back, reserve, operator[] vs at.
9-11. Step 6 (oop-c7-strings) — light-desktop, dark-desktop, light-mobile. Mid content; string operations, string_view, possibly a table comparing string methods.
12-15. Step 9 (oop-c7-quiz, final self-test, ~27 multiple-choice questions) — all 4 configs. Counter chip top-right ("0 / N"); long scroll. WCAG AA check on counter chip in dark mode (known historical pain point — earlier rounds on ALO c11 had purple-on-purple invisible chips).

REVIEW INSTRUCTIONS:

Check against the UX Playbook below. Focus on:

1. COLOR & CONTRAST. WCAG AA in both light and dark mode. Specifically: counter chips, callout backgrounds vs body text, code block syntax tokens, KaTeX equations, link colors, button affordances. Flag any text on background ratio < 4.5:1 (body) or < 3:1 (large text / non-text UI).

2. VISUAL HIERARCHY. Heading sizes distinct? Section breaks visible? Code blocks distinguished from prose? Callouts (info/tip/warning) visually distinct from each other and from learn blocks?

3. RESPONSIVE LAYOUT. Mobile shots: any horizontal scroll (code blocks, tables, long C++ identifiers like \`std::priority_queue<int, std::vector<int>, std::greater<int>>\`)? Any overflow? Sticky elements behaving (course progress bar, counter chip, breadcrumbs)?

4. CHUNKING & WHITESPACE. Step length appropriate? Self-test page reasonable scroll length? Padding consistent across block types?

5. INTERACTIVE AFFORDANCES. Are buttons visibly clickable? Self-test answer options look pressable? Navigation Continue/Prev buttons visible at bottom?

6. CODE BLOCKS. C++ code (likely lots of STL container methods, template syntax, iterator loops) — does syntax highlighting work in both modes? Wrap or scroll on mobile? Monospace font consistent?

7. TYPOGRAPHY. Line length 50-75ch on desktop? Body ≥16px? Line height ≥1.5? Romanian diacritics rendering correctly (ă, î, ș, ț)?

8. EMPTY/DEAD UI. Any collapsed expandables that look like buttons? Any stray scrollbars? Any visual orphans (a chip with no context, an icon with no label)?

9. SELF-TEST PAGE SPECIFIC. Question numbering visible? Option labels (A/B/C/D) consistent? Submit button discoverable at bottom? Per-question feedback (after attempt) styling matches the rest of the course? With ~27 questions, check that the page is scrollable without layout collapse.

10. DARK MODE REGRESSIONS. Any element that has only a light-mode style and looks unstyled in dark mode (white card on dark page, black text on dark bg, etc.)? Any element that uses a hardcoded color instead of \`var(--theme-*)\`?

KNOWN C7 MISCONCEPTION TRAPS (double-check quiz distractors and callout accuracy):
- vector reallocation invalidates ALL iterators/pointers/references (not just end())
- priority_queue defaults to max-heap; using std::greater gives min-heap
- queue uses deque as underlying container by default; stack uses deque too
- list and forward_list lack random-access iterators (no operator[])
- string_view::data() is NOT guaranteed null-terminated
- operator[] on vector/string does NOT bounds-check; at() throws std::out_of_range
- initializer_list elements are const; you cannot move from them
- inserting into the middle of vector is O(n); deque insert at front/back is O(1)

REPORT FORMAT (strict):

Up to 10 findings, prioritized critical > improvement > suggestion. For each:

### [severity: critical|improvement|suggestion] — Short descriptive title
**Where:** which step / which block / which screenshot # (e.g., "Step 9 self-test, dark desktop #13")
**Issue:** 1-2 sentences explaining what is visually wrong and why it matters for learning.
**Fix:** 1-2 sentences with a specific actionable recommendation.
**Principle:** UX principle violated (cite playbook category: Visual Hierarchy, Responsive, Color & Contrast, Affordances, Chunking, Gestalt, Whitespace, Motion & Animation, etc.).

Severity rules:
- critical: WCAG AA violation, content unreadable, mobile-broken, code block truncated with no scroll affordance, dark-mode invisible element
- improvement: suboptimal spacing/sizing/contrast that users can work around
- suggestion: polish that would improve quality but isn't blocking

If fewer than 10 issues exist, return fewer. Do NOT pad. Conclude with "_N additional minor items omitted._" only if there are real omissions.

UX PLAYBOOK CONTEXT:
${UX_PLAYBOOK}
`;

async function runWithRetries() {
  const MODELS = ['gemini-3-flash-preview', 'gemini-3.1-flash-lite', 'gemini-3-pro-preview', 'gemini-3.1-pro-preview', 'gemini-2.5-flash', 'gemini-flash-latest'];
  let lastErr = null;
  for (let attempt = 0; attempt < 18; attempt++) {
    const keyIdx = attempt % keys.length;
    const modelName = MODELS[Math.floor(attempt / keys.length) % MODELS.length];
    try {
      console.error(`Attempt ${attempt + 1}: key#${keyIdx} model=${modelName}`);
      const client = new GoogleGenerativeAI(keys[keyIdx]);
      const model = client.getGenerativeModel({ model: modelName });
      const parts = [{ text: PROMPT }];
      for (const name of picks) {
        const p = resolve(DIR, name);
        try {
          const buf = readFileSync(p);
          parts.push({ inlineData: { mimeType: 'image/png', data: buf.toString('base64') } });
        } catch (e) { console.error('Missing:', name); }
      }
      const result = await model.generateContent(parts);
      console.error(`OK with model=${modelName} key#${keyIdx}`);
      return result.response.text();
    } catch (e) {
      lastErr = e;
      console.error(`Attempt ${attempt + 1} failed:`, e.message?.slice(0, 200));
      if (/503|overloaded|unavailable/i.test(e.message || '')) {
        await new Promise(r => setTimeout(r, 3000 + attempt * 1500));
      }
    }
  }
  throw lastErr || new Error('All attempts failed');
}

try {
  const out = await runWithRetries();
  console.log(out);
} catch (e) {
  console.error('All retries exhausted:', e.message);
  process.exit(1);
}
