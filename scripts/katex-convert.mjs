#!/usr/bin/env node
// Convert residual Unicode math in PA course JSON to KaTeX $...$.
// Usage: node scripts/katex-convert.mjs <path-to-course.json>
// Rewrites in place. Skips string values whose parent key is "code".
import fs from "node:fs";

const charMap = new Map([
  ["₀", "_0"], ["₁", "_1"], ["₂", "_2"], ["₃", "_3"], ["₄", "_4"],
  ["₅", "_5"], ["₆", "_6"], ["₇", "_7"], ["₈", "_8"], ["₉", "_9"],
  ["ᵢ", "_i"], ["ⱼ", "_j"], ["ₙ", "_n"], ["ₖ", "_k"], ["ₘ", "_m"],
  ["ₚ", "_p"], ["ᵣ", "_r"], ["ₜ", "_t"], ["ₐ", "_a"],
  ["₊", "+"], ["₋", "-"],
  ["⁰", "^0"], ["¹", "^1"], ["²", "^2"], ["³", "^3"], ["⁴", "^4"],
  ["⁵", "^5"], ["⁶", "^6"], ["⁷", "^7"], ["⁸", "^8"], ["⁹", "^9"],
  ["ⁿ", "^n"], ["ⁱ", "^i"], ["⁺", "^+"], ["⁻", "^-"],
  ["α", "\\alpha"], ["β", "\\beta"], ["γ", "\\gamma"], ["δ", "\\delta"],
  ["ε", "\\varepsilon"], ["ζ", "\\zeta"], ["η", "\\eta"], ["θ", "\\theta"],
  ["ι", "\\iota"], ["κ", "\\kappa"], ["λ", "\\lambda"], ["μ", "\\mu"],
  ["ν", "\\nu"], ["ξ", "\\xi"], ["π", "\\pi"], ["ρ", "\\rho"],
  ["σ", "\\sigma"], ["τ", "\\tau"], ["υ", "\\upsilon"], ["φ", "\\varphi"],
  ["χ", "\\chi"], ["ψ", "\\psi"], ["ω", "\\omega"],
  ["Θ", "\\Theta"], ["Ω", "\\Omega"], ["Λ", "\\Lambda"], ["Φ", "\\Phi"],
  ["Δ", "\\Delta"], ["Σ", "\\sum"], ["Π", "\\prod"], ["Ψ", "\\Psi"],
  ["≤", "\\leq"], ["≥", "\\geq"], ["≠", "\\neq"], ["≈", "\\approx"], ["≡", "\\equiv"],
  ["∞", "\\infty"], ["∈", "\\in"], ["∉", "\\notin"], ["∀", "\\forall"], ["∃", "\\exists"],
  ["∧", "\\land"], ["∨", "\\lor"], ["¬", "\\lnot"],
  ["→", "\\to"], ["↔", "\\leftrightarrow"], ["⇒", "\\Rightarrow"], ["⇔", "\\Leftrightarrow"],
  ["∪", "\\cup"], ["∩", "\\cap"], ["⊆", "\\subseteq"], ["⊂", "\\subset"],
  ["⊇", "\\supseteq"], ["⊃", "\\supset"],
  ["⌊", "\\lfloor"], ["⌋", "\\rfloor"], ["⌈", "\\lceil"], ["⌉", "\\rceil"],
  ["√", "\\sqrt"],
  ["ℕ", "\\mathbb{N}"], ["ℤ", "\\mathbb{Z}"], ["ℝ", "\\mathbb{R}"], ["ℚ", "\\mathbb{Q}"],
  ["·", "\\cdot"], ["×", "\\times"], ["±", "\\pm"],
  ["∑", "\\sum"], ["∏", "\\prod"],
  ["∅", "\\emptyset"],
]);

const MATH_CHARS = [...charMap.keys()].join("");
const MATH_CHAR_RE = new RegExp("[" + MATH_CHARS + "]");
const CHAR_REPLACE_RE = new RegExp("[" + MATH_CHARS + "]", "g");

// Known short math identifiers. Treat these as math tokens even though they're multi-letter.
const SHORT_IDS = new Set([
  "lg", "log", "ln", "mod", "max", "min", "sin", "cos", "tan", "exp",
  "gcd", "lcm", "Pr", "E", "Var", "inf", "sup", "lim",
]);

// Identifiers that should get a `\` prefix inside math mode.
const LONG_ID_MAP = new Map([
  ["lg", "\\lg"], ["log", "\\log"], ["ln", "\\ln"], ["mod", "\\bmod"],
  ["max", "\\max"], ["min", "\\min"], ["sin", "\\sin"], ["cos", "\\cos"],
  ["tan", "\\tan"], ["exp", "\\exp"], ["gcd", "\\gcd"],
  ["inf", "\\inf"], ["sup", "\\sup"], ["lim", "\\lim"],
]);
const LONG_ID_RE = /(?<![a-zA-Z\\])(lg|log|ln|mod|max|min|sin|cos|tan|exp|gcd|inf|sup|lim)(?![a-zA-Z])/g;

function convertChars(s) {
  // Per-char substitution that inserts a trailing space only when the emitted TeX ends
  // in a letter and the very next source char is another letter — avoids `\cdotf` while
  // leaving pre-existing `\leq`, `\ldots`, etc. untouched.
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const tex = charMap.get(ch);
    if (tex === undefined) { out += ch; continue; }
    out += tex;
    if (tex.startsWith("\\") && /[a-zA-Z]$/.test(tex)) {
      const next = s[i + 1];
      if (next && /[a-zA-Z]/.test(next)) out += " ";
    }
  }
  out = out.replace(LONG_ID_RE, m => LONG_ID_MAP.get(m) ?? m);
  out = out.replace(/\^\(([^()]*)\)/g, "^{$1}");
  out = out.replace(/_\(([^()]*)\)/g, "_{$1}");
  return out;
}

function isMathToken(tok) {
  if (!tok) return false;
  // Strip trailing prose punctuation for classification.
  const core = tok.replace(/[.,;:!?]+$/, "");
  if (!core) return false;
  // Prose / markdown markers break any run.
  if (core === "-" || core === "•" || core === "—" || core === "–") return false;
  if (core.includes("**") || core.includes("__") || core.includes("`")) return false;
  if (core.startsWith(">") || core.startsWith("#")) return false;
  // Any chunk with a math char counts.
  if (MATH_CHAR_RE.test(core)) return true;
  // Pure operators / punctuation.
  if (/^[()\[\]<>=+\-/^_,!'?]+$/.test(core)) return true;
  // Pure word (all letters): single letter or known identifier only.
  if (/^[a-zA-Z]+$/.test(core)) {
    if (core.length === 1) return true;
    return SHORT_IDS.has(core);
  }
  // Mixed token: all chars must be allowed, must have a non-letter, and every letter
  // subsequence must be a single letter or known short identifier (prevents "doesn't",
  // "they're", "can't", etc. from looking like math because of the apostrophe).
  if (/^[a-zA-Z0-9()\[\]<>=+\-/^_,!'?.]+$/.test(core) && /[^a-zA-Z]/.test(core)) {
    const letterChunks = core.match(/[a-zA-Z]+/g) || [];
    const allShort = letterChunks.every(lc => lc.length === 1 || SHORT_IDS.has(lc));
    if (allShort) return true;
  }
  // Numeric with decorations.
  if (/^[0-9][0-9()\[\]<>=+\-*/^_,.!'?]*$/.test(core)) return true;
  return false;
}

function wrapMathRuns(s) {
  // Split on whitespace, keeping delimiters at odd indices.
  const chunks = s.split(/(\s+)/);
  let out = "";
  let i = 0;
  while (i < chunks.length) {
    const chunk = chunks[i];
    const isSpace = i % 2 === 1;
    if (isSpace) { out += chunk; i++; continue; }
    if (!chunk || !isMathToken(chunk)) { out += chunk; i++; continue; }
    // Try to extend: next delimiter must be a simple single-line space run, and next token must be a math token.
    let j = i;
    while (
      j + 2 < chunks.length &&
      /^[ \t]+$/.test(chunks[j + 1]) &&
      isMathToken(chunks[j + 2])
    ) {
      j += 2;
    }
    const runChunks = chunks.slice(i, j + 1);
    const runText = runChunks.join("");
    if (!MATH_CHAR_RE.test(runText)) {
      out += runText;
      i = j + 1;
      continue;
    }
    // Strip trailing prose punctuation from the last chunk.
    let tail = "";
    const lastChunk = runChunks[runChunks.length - 1];
    const m = lastChunk.match(/[.,;:!?]+$/);
    if (m) {
      tail = m[0];
      runChunks[runChunks.length - 1] = lastChunk.slice(0, -tail.length);
    }
    const cleanRun = runChunks.join("");
    if (!cleanRun) {
      out += tail;
      i = j + 1;
      continue;
    }
    out += "$" + convertChars(cleanRun) + "$" + tail;
    i = j + 1;
  }
  return out;
}

// Stray-sub/superscript cleanup: wraps leftover `var<unicode-sub/sup>` patterns that
// the token-level wrap missed (e.g. inside `**...**` markdown bold regions).
const STRAY_ATTACHED_RE = /([a-zA-Z])([₀-₉ᵢⱼₙₖₘₚᵣₜₐ₊₋⁰-⁹ⁿⁱ⁺⁻²³]+)/gu;
const STANDALONE_MATH_RE = /(^|[\s(])([≤≥≠≈≡∞∈∉∀∃∧∨¬→↔⇒⇔∪∩⊆⊂⊇⊃⌊⌋⌈⌉√ℕℤℝℚ·×±∑∏∅])(?=$|[\s),.;:!?])/gu;

function wrapStrays(s) {
  const parts = s.split(/(\$[^$\n]*\$)/g);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) continue;
    parts[i] = parts[i].replace(STRAY_ATTACHED_RE,
      (m, letter, dec) => "$" + convertChars(letter + dec) + "$");
    parts[i] = parts[i].replace(STANDALONE_MATH_RE,
      (m, lead, ch) => lead + "$" + convertChars(ch) + "$");
  }
  return parts.join("");
}

function transformString(s) {
  // Protect existing $...$ regions; within them, convert chars directly.
  const parts = s.split(/(\$[^$\n]*\$)/g);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      parts[i] = "$" + convertChars(parts[i].slice(1, -1)) + "$";
    } else {
      parts[i] = wrapMathRuns(parts[i]);
    }
  }
  let merged = parts.join("");
  merged = wrapStrays(merged);
  return merged;
}

function transform(obj, parentKey) {
  if (typeof obj === "string") {
    if (parentKey === "code") return obj;
    return transformString(obj);
  }
  if (Array.isArray(obj)) return obj.map(x => transform(x, parentKey));
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = transform(v, k);
    return out;
  }
  return obj;
}

// Allow importing the functions for tests.
export { transformString, wrapMathRuns, convertChars, isMathToken };

// Collect (originalJsonLiteral -> transformedJsonLiteral) pairs by walking the parsed tree,
// then apply them to the raw text via replaceAll so the file's original formatting is preserved.
function collectPairs(obj, parentKey, pairs) {
  if (typeof obj === "string") {
    if (parentKey === "code") return;
    const xformed = transformString(obj);
    if (xformed !== obj) {
      pairs.push([JSON.stringify(obj), JSON.stringify(xformed)]);
    }
    return;
  }
  if (Array.isArray(obj)) {
    for (const x of obj) collectPairs(x, parentKey, pairs);
    return;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) collectPairs(v, k, pairs);
  }
}

// CLI entry
if (process.argv[1]?.endsWith("katex-convert.mjs")) {
  const file = process.argv[2];
  if (file) {
    const src = fs.readFileSync(file, "utf-8");
    const data = JSON.parse(src);
    const pairs = [];
    collectPairs(data, "", pairs);
    // Deduplicate identical (from, to) pairs.
    const seen = new Set();
    const unique = [];
    for (const [from, to] of pairs) {
      const key = from + "\u0000" + to;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push([from, to]);
    }
    // Sort by length descending so longer strings replace before shorter substrings.
    unique.sort((a, b) => b[0].length - a[0].length);
    let out = src;
    for (const [from, to] of unique) {
      out = out.split(from).join(to);
    }
    // Verify the result still parses as JSON (must match the transformed in-memory tree).
    try {
      JSON.parse(out);
    } catch (e) {
      console.error("Result is not valid JSON:", e.message);
      process.exit(1);
    }
    fs.writeFileSync(file, out, "utf-8");
    console.log(`converted: ${file}`);
  }
}
