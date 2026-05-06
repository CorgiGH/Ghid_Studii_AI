// Audit quiz data integrity: no-correct, multi-correct in single-select,
// missing options, missing question text, duplicate options, etc.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src', 'content');

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.curate') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.isFile() && p.endsWith('.json')) out.push(p);
  }
  return out;
}

const issues = [];
function flag(file, kind, detail) {
  issues.push({ file: path.relative(root, file).replace(/\\/g, '/'), kind, detail });
}

function inspectQuestion(file, q, where) {
  if (!Array.isArray(q.options)) {
    flag(file, 'missing-options', `${where}`);
    return;
  }
  if (q.options.length < 2) {
    flag(file, 'too-few-options', `${where} (${q.options.length})`);
  }
  const correctCount = q.options.filter(o => o.correct === true).length;
  if (correctCount === 0) {
    flag(file, 'no-correct', `${where}`);
  }
  if (correctCount > 1 && !q.multiSelect && !q.multiselect) {
    flag(file, 'multi-correct-single-select', `${where} (${correctCount} correct)`);
  }
  // Duplicate option text (en)
  const seen = new Set();
  for (const opt of q.options) {
    const t = typeof opt.text === 'object' ? opt.text.en : String(opt.text);
    if (seen.has(t)) flag(file, 'duplicate-option-text', `${where} "${t.slice(0, 40)}"`);
    seen.add(t);
  }
  // Bilingual gaps
  if (typeof q.question === 'object') {
    if (!q.question.en || !q.question.ro) flag(file, 'bilingual-gap-question', `${where}`);
  }
  for (let i = 0; i < q.options.length; i++) {
    const o = q.options[i];
    if (typeof o.text === 'object' && (!o.text.en || !o.text.ro)) {
      flag(file, 'bilingual-gap-option', `${where} opt[${i}]`);
    }
  }
}

const files = walk(root);
for (const f of files) {
  let data;
  try { data = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) {
    flag(f, 'json-parse-error', e.message);
    continue;
  }
  // Course schema
  if (data.steps) {
    for (const step of data.steps) {
      if (!step.blocks) continue;
      for (const [bi, b] of step.blocks.entries()) {
        if (b.type === 'quiz' && Array.isArray(b.questions)) {
          for (const [qi, q] of b.questions.entries()) {
            inspectQuestion(f, q, `${step.id}/block${bi}/q${qi}`);
          }
        }
      }
    }
  }
  // Test schema (questions[] with type)
  if (Array.isArray(data.questions)) {
    for (const [qi, q] of data.questions.entries()) {
      if (q.type === 'multiple-choice' && Array.isArray(q.options)) {
        const ci = q.correctIndex;
        const isMulti = Array.isArray(ci);
        const total = q.options.length;
        if (typeof ci === 'undefined' || ci === null) {
          flag(f, 'test-no-correctIndex', `q${qi}`);
        } else if (isMulti) {
          for (const v of ci) {
            if (typeof v !== 'number' || v < 0 || v >= total) {
              flag(f, 'test-correctIndex-oob', `q${qi} idx=${v} total=${total}`);
            }
          }
        } else {
          if (typeof ci !== 'number' || ci < 0 || ci >= total) {
            flag(f, 'test-correctIndex-oob', `q${qi} idx=${ci} total=${total}`);
          }
        }
      }
    }
  }
}

const byKind = {};
for (const i of issues) (byKind[i.kind] ||= []).push(i);
console.log(`Total issues: ${issues.length}`);
console.log('');
for (const kind of Object.keys(byKind).sort()) {
  console.log(`== ${kind} (${byKind[kind].length}) ==`);
  for (const i of byKind[kind].slice(0, 20)) console.log(`  ${i.file} :: ${i.detail}`);
  if (byKind[kind].length > 20) console.log(`  ...+${byKind[kind].length - 20} more`);
  console.log('');
}
