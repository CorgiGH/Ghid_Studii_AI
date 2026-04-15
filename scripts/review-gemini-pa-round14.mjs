#!/usr/bin/env node
// Cold-review round 14 on PA — send curated live screenshots to Gemini.
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inline .env loader (avoid dotenv dep)
const envPath = resolve('proxy/.env');
const envText = readFileSync(envPath, 'utf8');
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const keys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map(k => k.trim()).filter(Boolean);
if (keys.length === 0) { console.error('no gemini key'); process.exit(1); }

const MODEL = 'gemini-3-flash-preview';
const DIR = resolve('wiki/raw/assets/review');

// Explicit picks from today's run. Timestamps:
//   16-26-11 = course_4 (with stepper)
//   16-26-34 = seminars
//   16-26-48 = tests
//   16-27-02 = practice
const picks = [
  // course_4 — stepper pages, mobile, dark desktop
  '2026-04-15T16-26-11_light-desktop.png',
  '2026-04-15T16-26-11_light-desktop_step02.png',
  '2026-04-15T16-26-11_light-desktop_step03.png',
  '2026-04-15T16-26-11_light-desktop_step04.png',
  '2026-04-15T16-26-11_light-desktop_step05.png',
  '2026-04-15T16-26-11_dark-desktop.png',
  '2026-04-15T16-26-11_light-mobile.png',
  '2026-04-15T16-26-11_dark-mobile.png',
  // seminars
  '2026-04-15T16-26-34_light-desktop.png',
  '2026-04-15T16-26-34_dark-desktop.png',
  '2026-04-15T16-26-34_light-mobile.png',
  '2026-04-15T16-26-34_dark-mobile.png',
  // tests
  '2026-04-15T16-26-48_light-desktop.png',
  '2026-04-15T16-26-48_dark-desktop.png',
  '2026-04-15T16-26-48_light-mobile.png',
  '2026-04-15T16-26-48_dark-mobile.png',
  // practice
  '2026-04-15T16-27-02_light-desktop.png',
  '2026-04-15T16-27-02_dark-desktop.png',
  '2026-04-15T16-27-02_light-mobile.png',
];

const UX_PLAYBOOK = readFileSync(resolve('wiki/architecture/UX Playbook.md'), 'utf8');

const PROMPT = `You are a senior visual UX reviewer for a bilingual university study-guide web app
(React + Vite, Tailwind v4, GitHub Pages). This is COLD-REVIEW ROUND 14 on the PA (Algorithm
Design) subject. The prior 13 rounds fixed all obvious visual issues — focus on subtle
layout/typography/spacing regressions only.

SCREENSHOT MAP (all from LIVE site, https://corgigh.github.io/Ghid_Studii_AI/):
  1–8   Course 4 (/#/y1s2/pa/course_4) — page 1, step 2, step 3, step 4, step 5, dark desktop,
        light mobile, dark mobile. Steps are reached via the "Continue →" stepper.
  9–12  Seminars landing (/#/y1s2/pa/seminars) — light/dark desktop + mobile.
  13–16 Tests landing (/#/y1s2/pa/tests) — light/dark desktop + mobile.
  17–19 Practice tab (/#/y1s2/pa/practice) — light/dark desktop + light mobile.

KNOWN SCRIPT LIMITATION: the dark-mode screenshots for seminars/tests/practice and the non-
stepped course-4 shots may appear in LIGHT mode due to a puppeteer localStorage timing issue.
Do NOT report "dark mode not applying" as a finding unless you can prove it from a clearly
dark-themed shot. Only flag dark-mode regressions you can verify from screenshots that ARE
rendered in dark mode.

FOCUS AREAS FOR THIS ROUND (subtle regressions):
- Sticky TopBar / ContentTypeBar / InlineProgress bar alignment & stacking at scroll.
- Progress ring (InlineProgress) alignment vs stepper dots.
- Dark mode readability regressions (hardcoded colors that didn't switch to \`var(--theme-*)\`).
- Code block overflow on narrow widths (mobile).
- KaTeX display/inline math cut-off, baseline misalignment, or bad vertical rhythm.
- Tests landing: visual hierarchy between PARTIALE group and EXAMENE group (are exam tiles
  visually privileged? are group headers strong enough?).
- Card grid alignment, gutter consistency, and wrap behavior on tight viewports.
- Callout / "think block" (pre-test) crowding, borders doubling up, or inconsistent left-rail
  treatment across block types.
- Mobile sidebar toggle / hamburger — any overlap with breadcrumbs or inline progress.

HARD CONSTRAINTS:
- MAX 10 findings total. Prioritize critical first, then improvement, then suggestion.
- Each finding MUST cite a specific screenshot number (1–19) and a specific element.
- Skip nitpicks that are clearly addressed by recent commits (rounds 1–13 over last 24h).
- No duplicates: if the same issue appears on multiple pages, combine into one finding.
- No vague findings. If you can't describe the fix in one concrete sentence, drop it.

REPORT FORMAT (strict):

### [severity] — Short descriptive title
**Where:** screenshot #N (page name) — element name
**Issue:** 1–2 sentences: what is visually wrong and why it matters.
**Fix:** 1–2 sentences: specific, actionable fix (CSS class, var swap, spacing value).
**Principle:** Short rationale referencing UX principle (e.g. Visual Hierarchy, Color Contrast).

End with one line: "Verdict: Ship / Needs round 15 / Needs deeper sweep" + one-sentence rationale.

CONTEXT — UX PLAYBOOK:
${UX_PLAYBOOK}
`;

async function run(keyIdx = 0) {
  const client = new GoogleGenerativeAI(keys[keyIdx]);
  const model = client.getGenerativeModel({ model: MODEL });
  const parts = [{ text: PROMPT }];
  for (const [i, name] of picks.entries()) {
    const p = resolve(DIR, name);
    try {
      const buf = readFileSync(p);
      parts.push({ inlineData: { mimeType: 'image/png', data: buf.toString('base64') } });
      console.error(`#${i+1} ${name} (${(buf.length/1024).toFixed(0)}KB)`);
    } catch (e) {
      console.error(`MISSING #${i+1} ${name}`);
    }
  }
  const res = await model.generateContent(parts);
  return res.response.text();
}

try {
  const out = await run(0);
  console.log(out);
} catch (e) {
  console.error('key0 failed:', e.message);
  if (keys.length > 1) {
    try {
      const out = await run(1);
      console.log(out);
    } catch (e2) {
      console.error('key1 failed:', e2.message);
      process.exit(1);
    }
  } else { process.exit(1); }
}
