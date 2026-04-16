#!/usr/bin/env node
/**
 * lint-site.mjs
 * Site-wide mechanical lint. Zero LLM tokens; seconds to run.
 *
 * Rules:
 *   R1  bilingual:      any {en, ro} object missing a side
 *   R2  math-outside:   Unicode math chars in learn/callout/definition content
 *                       outside $...$ KaTeX spans (excluding code: / rubric:)
 *   R3  group-dangling: question `group: "X"` with no groupPrompts["X"]
 *   R4  group-orphan:   groupPrompts["X"] with no question referencing it
 *   R5  missing-ce:     open-ended/code-writing test Q without commonErrors
 *   R6  learn-fences:   learn block content containing ``` code fences
 *   R7  learn-mdtable:  learn block content containing | pipe table rows
 *   R8  jsx-mc-feedback: seminar/practice MC option `correct: false` without feedback
 *
 * Usage:
 *   node scripts/lint-site.mjs                    # all subjects
 *   node scripts/lint-site.mjs pa                 # one subject
 *   node scripts/lint-site.mjs pa --rules=R2,R3   # filter rules
 *   node scripts/lint-site.mjs --summary          # counts only, no detail
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join, relative, sep } from 'path';

const ROOT = resolve(process.cwd());
const CONTENT = join(ROOT, 'src', 'content');

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const ruleFilter = args.find(a => a.startsWith('--rules='))?.split('=')[1]?.split(',');
const positional = args.filter(a => !a.startsWith('--'));
const subjectFilter = positional[0] || null;
const summaryOnly = flags.has('--summary');

// ---------- walk helpers ----------
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.curate' || name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const UNICODE_MATH = /[∈∉⊂⊆⊇⊃∪∩∀∃∄≤≥≠≈≡±∞ΣΠπρθφψΩαβγδεζηλμν·×÷√∑∫→←↔⇒⇐⇔⇌⊕⊗⌊⌋⌈⌉°′″]/;
// Tokens produced by KaTeX source we don't want to double-flag
const SUBSCRIPTS = /[₀₁₂₃₄₅₆₇₈₉ₙₖᵢⱼₘₚ]/;
const SUPERSCRIPTS = /[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵏⁱ]/;

function stripKatex(text) {
  // Strip $$...$$ then $...$
  return text
    .replace(/\$\$[\s\S]+?\$\$/g, ' ')
    .replace(/\$[^$\n]+?\$/g, ' ');
}

// ---------- findings collector ----------
const findings = [];
function add(rule, file, detail) {
  if (ruleFilter && !ruleFilter.includes(rule)) return;
  findings.push({ rule, file: relative(ROOT, file).split(sep).join('/'), detail });
}

// ---------- R1 bilingual gaps ----------
function lintBilingual(file, node, path = '$') {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach((v, i) => lintBilingual(file, v, `${path}[${i}]`)); return; }
  if ('en' in node || 'ro' in node) {
    const enBad = !node.en || (typeof node.en === 'string' && !node.en.trim());
    const roBad = !node.ro || (typeof node.ro === 'string' && !node.ro.trim());
    if (enBad) add('R1', file, `${path}: missing/empty en`);
    if (roBad) add('R1', file, `${path}: missing/empty ro`);
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === 'en' || k === 'ro') continue;
    lintBilingual(file, v, `${path}.${k}`);
  }
}

// ---------- R2 math outside KaTeX ----------
const MATH_OK_IN_TYPES = new Set(['code', 'table', 'list', 'video', 'image', 'figure', 'equation']);
const MATH_CHECK_TYPES = new Set(['learn', 'callout', 'info', 'tip', 'warning', 'danger', 'example', 'definition', 'think']);

function lintMathBlock(file, block, path) {
  if (!block || typeof block !== 'object') return;
  const t = block.type;
  if (!MATH_CHECK_TYPES.has(t)) return;
  const check = (val, sub) => {
    if (typeof val !== 'string') return;
    const stripped = stripKatex(val);
    if (UNICODE_MATH.test(stripped) || SUBSCRIPTS.test(stripped) || SUPERSCRIPTS.test(stripped)) {
      const m = stripped.match(new RegExp(`(${UNICODE_MATH.source}|${SUBSCRIPTS.source}|${SUPERSCRIPTS.source})`));
      const sample = stripped.slice(Math.max(0, (m?.index || 0) - 20), (m?.index || 0) + 40).replace(/\s+/g, ' ').trim();
      add('R2', file, `${path}.${sub} (${t}): unicode math outside $...$ — "${sample}"`);
    }
  };
  if (block.content) { check(block.content.en, 'content.en'); check(block.content.ro, 'content.ro'); }
  if (block.question) { check(block.question.en, 'question.en'); check(block.question.ro, 'question.ro'); }
  if (block.answer) { check(block.answer.en, 'answer.en'); check(block.answer.ro, 'answer.ro'); }
  if (block.term) { check(block.term.en, 'term.en'); check(block.term.ro, 'term.ro'); }
}

// ---------- R6 / R7 learn block markdown leaks ----------
function lintLearnMarkdown(file, block, path) {
  if (block?.type !== 'learn' && block?.type !== 'callout') return;
  const chk = (val, sub) => {
    if (typeof val !== 'string') return;
    if (/```/.test(val)) add('R6', file, `${path}.${sub}: triple-backtick fence in ${block.type} block (use 'code' block instead)`);
    // Markdown table: line starting with | and containing at least 2 pipes
    const lines = val.split('\n');
    const tableLines = lines.filter(l => /^\s*\|.*\|/.test(l));
    if (tableLines.length >= 2) add('R7', file, `${path}.${sub}: markdown table (${tableLines.length} rows) in ${block.type} block (use 'table' block)`);
  };
  if (block.content) { chk(block.content.en, 'content.en'); chk(block.content.ro, 'content.ro'); }
}

// ---------- R3 / R4 / R5 test-level rules ----------
function lintTest(file, json) {
  const groupsDeclared = new Set(Object.keys(json.groupPrompts || {}));
  const groupsUsed = new Set();
  for (const q of json.questions || []) {
    if (q.group) {
      groupsUsed.add(q.group);
      if (!groupsDeclared.has(q.group)) add('R3', file, `q=${q.id}: group "${q.group}" has no entry in groupPrompts`);
    }
    const needsCE = q.type === 'open-ended' || q.type === 'code-writing';
    if (needsCE && !q.commonErrors) add('R5', file, `q=${q.id} (${q.type}): missing commonErrors`);
  }
  for (const g of groupsDeclared) {
    if (!groupsUsed.has(g)) add('R4', file, `groupPrompts["${g}"]: declared but no question references it`);
  }
}

// ---------- course walk ----------
function lintCourse(file, json) {
  (json.steps || []).forEach((step, si) => {
    (step.blocks || []).forEach((block, bi) => {
      const path = `steps[${si}].blocks[${bi}]`;
      lintMathBlock(file, block, path);
      lintLearnMarkdown(file, block, path);
    });
  });
}

// ---------- R8 JSX seminar MC feedback ----------
function lintSeminarJsx(file, src) {
  // Find every options: [ ... ] array. Crude: balance brackets starting at "options: [".
  const marker = /options\s*:\s*\[/g;
  let m;
  while ((m = marker.exec(src)) !== null) {
    const start = m.index + m[0].length - 1; // index of '['
    let depth = 1, i = start + 1;
    while (i < src.length && depth > 0) {
      const c = src[i];
      if (c === '[') depth++;
      else if (c === ']') depth--;
      else if (c === "'" || c === '"' || c === '`') {
        // skip string literal
        const q = c;
        i++;
        while (i < src.length && src[i] !== q) {
          if (src[i] === '\\') i++;
          i++;
        }
      }
      i++;
    }
    const block = src.slice(start, i);
    // Split into individual option object literals by balanced { }
    const opts = [];
    let j = 0;
    while (j < block.length) {
      if (block[j] === '{') {
        let d = 1, k = j + 1;
        while (k < block.length && d > 0) {
          if (block[k] === "'" || block[k] === '"' || block[k] === '`') {
            const q = block[k]; k++;
            while (k < block.length && block[k] !== q) { if (block[k] === '\\') k++; k++; }
          } else if (block[k] === '{') d++;
          else if (block[k] === '}') d--;
          k++;
        }
        opts.push(block.slice(j, k));
        j = k;
      } else j++;
    }
    opts.forEach((opt, idx) => {
      const wrong = /correct\s*:\s*false/.test(opt);
      const hasFeedback = /\bfeedback\s*:/.test(opt) || /\bexplanation\s*:/.test(opt);
      if (wrong && !hasFeedback) {
        // Get a sample of the option text
        const txtMatch = opt.match(/text\s*:\s*\{\s*en\s*:\s*['"`]([^'"`]{0,60})/);
        const sample = txtMatch ? txtMatch[1] : '(text not parsed)';
        // Line number of the option within the file
        const lineNum = src.slice(0, start + (block.indexOf(opt))).split('\n').length;
        add('R8', file, `line ~${lineNum}: wrong option missing feedback — "${sample}"`);
      }
    });
  }
}

// ---------- main ----------
const subjects = subjectFilter ? [subjectFilter] : readdirSync(CONTENT).filter(n => {
  const s = statSync(join(CONTENT, n));
  return s.isDirectory();
});

for (const subj of subjects) {
  const subjDir = join(CONTENT, subj);
  if (!statSync(subjDir).isDirectory()) continue;
  const files = walk(subjDir);
  for (const file of files) {
    const ext = file.slice(file.lastIndexOf('.'));
    if (ext === '.json') {
      let json;
      try { json = JSON.parse(readFileSync(file, 'utf-8')); } catch (e) { add('R1', file, `parse error: ${e.message}`); continue; }
      lintBilingual(file, json);
      if (file.includes(`${sep}tests${sep}`) || file.includes('/tests/')) lintTest(file, json);
      if (file.includes(`${sep}courses${sep}`) || file.includes('/courses/')) lintCourse(file, json);
    } else if (ext === '.jsx') {
      const src = readFileSync(file, 'utf-8');
      lintSeminarJsx(file, src);
    }
  }
}

// ---------- output ----------
const byRule = {};
for (const f of findings) (byRule[f.rule] ||= []).push(f);

const ruleNames = {
  R1: 'bilingual gap',
  R2: 'unicode math outside KaTeX',
  R3: 'dangling group reference',
  R4: 'orphan groupPrompt',
  R5: 'missing commonErrors',
  R6: 'code fence in learn block',
  R7: 'markdown table in learn block',
  R8: 'MC wrong option missing feedback',
};

console.log(`\nLint scan: ${subjects.join(', ')}`);
console.log(`Total findings: ${findings.length}\n`);

for (const [rule, name] of Object.entries(ruleNames)) {
  const list = byRule[rule] || [];
  if (!list.length) continue;
  console.log(`${rule} — ${name}: ${list.length}`);
  if (summaryOnly) continue;
  // Group by file
  const byFile = {};
  for (const f of list) (byFile[f.file] ||= []).push(f.detail);
  for (const [file, details] of Object.entries(byFile)) {
    console.log(`  ${file}  (${details.length})`);
    const show = details.slice(0, 5);
    for (const d of show) console.log(`    · ${d}`);
    if (details.length > show.length) console.log(`    · …and ${details.length - show.length} more`);
  }
  console.log('');
}

process.exit(findings.length ? 1 : 0);
