#!/usr/bin/env node
// Verifies the R15 improvement-batch fixes on the probabilistic slice are live
// and rendering as intended. Assumes dev server on http://localhost:5173.

import puppeteer from "puppeteer";

const BASE = "http://localhost:5173/Ghid_Studii_AI";
const results = { pass: [], fail: [] };

function record(name, passed, detail) {
  const bucket = passed ? results.pass : results.fail;
  bucket.push({ name, detail });
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
}

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.evaluateOnNewDocument(() => {
  try { localStorage.setItem("lang", JSON.stringify("en")); } catch {}
});

// --------------------------------------------------------------------------
// Check 1: course-04 Nuts-and-Bolts block renders without KaTeX errors.
// --------------------------------------------------------------------------
try {
  await page.goto(`${BASE}/#/y1s2/pa/course_4`, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1200));
  // Click Continue → repeatedly to walk through every step so every learn block
  // (including Nuts-and-Bolts late in the course) has a chance to render.
  for (let i = 0; i < 20; i++) {
    const clicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button"))
        .find(b => /continue|continuă|următor|next/i.test(b.textContent));
      if (!btn || btn.disabled) return false;
      btn.click();
      return true;
    });
    if (!clicked) break;
    await new Promise(r => setTimeout(r, 250));
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 800));

  const katexErrors = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".katex-error")).length;
  });
  record(
    "1. course-04 — no KaTeX parse errors on the lecture page",
    katexErrors === 0,
    `.katex-error elements: ${katexErrors}`
  );

  // The fixed block should contain a rendered \\frac{2}{j-i+1}.
  // We look for the literal text "2" and "j − i + 1" (or j-i+1 depending on font)
  // near a rendered katex span.
  const hasFrac = await page.evaluate(() => {
    const katex = Array.from(document.querySelectorAll(".katex"));
    return katex.some(k => k.textContent.includes("2") && k.textContent.includes("j"));
  });
  record(
    "1. course-04 — nuts-and-bolts $2/(j-i+1)$ renders via KaTeX",
    hasFrac,
    hasFrac ? ".katex span with 2 and j found" : "no rendered fraction found"
  );
} catch (e) {
  record("1. course-04 page", false, "exception: " + e.message);
}

// --------------------------------------------------------------------------
// Check 2: course-04 "bolt" callout — should contain KaTeX span holding
// 'bolt' as text, not as italicized product.
// --------------------------------------------------------------------------
try {
  const boltOk = await page.evaluate(() => {
    // The \\text{bolt} fragment renders as a <span class="mord text"> with
    // upright text. If it fell through as math-italic, each letter would be
    // in a separate <span class="mord mathnormal">.
    const katexSpans = Array.from(document.querySelectorAll(".katex"));
    const boltSpan = katexSpans.find(k => k.textContent.replace(/\s+/g, "").includes("bolt\u2194bolt") || /bolt.*bolt/.test(k.textContent));
    if (!boltSpan) return { found: false };
    // Check whether "bolt" is inside a .mord.text (good) or split into .mord.mathnormal letters (bad).
    const textMode = !!boltSpan.querySelector(".text, .mord.text");
    return { found: true, textMode };
  });
  if (!boltOk.found) {
    record("2. course-04 — bolt callout rendered", false, "could not locate 'bolt↔bolt' KaTeX span");
  } else {
    record("2. course-04 — bolt rendered as text not italic", boltOk.textMode, boltOk.textMode ? ".text mord present" : "bolt split into math-italic letters");
  }
} catch (e) {
  record("2. bolt callout", false, "exception: " + e.message);
}

// --------------------------------------------------------------------------
// Check 3: course-03 Legendre properties rendered via KaTeX (not bare LaTeX).
// --------------------------------------------------------------------------
try {
  await page.goto(`${BASE}/#/y1s2/pa/course_3`, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1200));
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 800));

  const katexErrors = await page.evaluate(() => Array.from(document.querySelectorAll(".katex-error")).length);
  record("3. course-03 — no KaTeX parse errors", katexErrors === 0, `.katex-error elements: ${katexErrors}`);

  // Look for the Legendre symbol rendered inside a .katex span.
  // Raw LaTeX would show literal "a^{(p-1)/2}" text. KaTeX-rendered would show
  // an exponent without visible braces.
  const bodyText = await page.evaluate(() => document.body.innerText);
  const hasBareBraces = /a\^\{\(p-1\)\/2\}/.test(bodyText);
  record(
    "3. course-03 — Euler's criterion exponent is rendered, not raw LaTeX",
    !hasBareBraces,
    hasBareBraces ? "saw literal 'a^{(p-1)/2}' in body text" : "no bare LaTeX found"
  );
} catch (e) {
  record("3. course-03 page", false, "exception: " + e.message);
}

// --------------------------------------------------------------------------
// Check 4: partial-2015-a uses groupPrompt — Problem 1 stem appears once.
// --------------------------------------------------------------------------
try {
  await page.goto(`${BASE}/#/y1s2/pa/tests?test=partial-2015-a`, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const tutor = btns.find(b => /tutor/i.test(b.textContent));
    if (tutor) tutor.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 400));

  const txt = await page.evaluate(() => document.body.innerText);
  const p1Count = (txt.match(/Problem 1: Design and Analysis, Basics/g) || []).length;
  const p2Count = (txt.match(/Problem 2: Graham Scan — Convex Hull/g) || []).length;
  const p3Count = (txt.match(/Problem 3: Problem Reductions/g) || []).length;

  record("4. partial-2015-a — Problem 1 stem renders once", p1Count === 1, `count=${p1Count}`);
  record("4. partial-2015-a — Problem 2 stem renders once", p2Count === 1, `count=${p2Count}`);
  record("4. partial-2015-a — Problem 3 stem renders once", p3Count === 1, `count=${p3Count}`);

  // Sanity: per-question tails still there.
  const hasIsincTail = /Formulate the ISINC problem as an \(input, output\) pair/.test(txt);
  record("4. partial-2015-a — ISINC 'a)' tail present", hasIsincTail, hasIsincTail ? "tail visible" : "missing");
} catch (e) {
  record("4. partial-2015-a", false, "exception: " + e.message);
}

// --------------------------------------------------------------------------
// Check 5: partial-2019-a uses groupPrompt — 5 distinct Problem stems each once.
// --------------------------------------------------------------------------
try {
  await page.goto(`${BASE}/#/y1s2/pa/tests?test=partial-2019-a`, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const tutor = btns.find(b => /tutor/i.test(b.textContent));
    if (tutor) tutor.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 400));

  const txt = await page.evaluate(() => document.body.innerText);
  const m35 = (txt.match(/Problem 1: Design and Analysis — M35/g) || []).length;
  const nondet = (txt.match(/Problem 2: Nondeterministic Algorithms/g) || []).length;
  const probab = (txt.match(/Problem 3: Probabilistic Algorithms — Average Complexity/g) || []).length;
  const kmp = (txt.match(/Problem 4: String Searching — KMP/g) || []).length;
  const regex = (txt.match(/Problem 5: Regular Expressions/g) || []).length;

  record("5. partial-2019-a — M35 stem once", m35 === 1, `count=${m35}`);
  record("5. partial-2019-a — Nondet stem once", nondet === 1, `count=${nondet}`);
  record("5. partial-2019-a — Probab stem once", probab === 1, `count=${probab}`);
  record("5. partial-2019-a — KMP stem once", kmp === 1, `count=${kmp}`);
  record("5. partial-2019-a — Regex stem once", regex === 1, `count=${regex}`);
} catch (e) {
  record("5. partial-2019-a", false, "exception: " + e.message);
}

await browser.close();

console.log("\n---");
console.log(`Summary: ${results.pass.length} passed, ${results.fail.length} failed`);
if (results.fail.length) {
  console.log("\nFailures:");
  for (const f of results.fail) console.log(`  - ${f.name}: ${f.detail}`);
}
process.exit(results.fail.length ? 1 : 0);
