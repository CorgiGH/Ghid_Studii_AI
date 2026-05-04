#!/usr/bin/env node
/**
 * trap-audit.mjs — flag quiz questions that have no per-option `explanation`.
 * Distractors without explicit debunking are higher trap-risk: the spot-check
 * grader 1 was confused by exactly this on os-c1-file-permissions.
 *
 * Usage: node scripts/trap-audit.mjs [--subject=os|oop|...]
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, sep } from 'path';

const ROOT = process.cwd();
const subjArg = process.argv.find(a => a.startsWith('--subject='))?.split('=')[1];
const SUBJECTS = subjArg ? [subjArg] : ['os', 'oop', 'pa', 'alo'];

function walk(dir, out = []) {
  if (!statSync(dir, { throwIfNoEntry: false })) return out;
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (p.endsWith('.json')) out.push(p);
  }
  return out;
}

const findings = [];
for (const subj of SUBJECTS) {
  const dir = join(ROOT, 'src', 'content', subj, 'courses');
  for (const file of walk(dir)) {
    let json;
    try { json = JSON.parse(readFileSync(file, 'utf-8')); } catch { continue; }
    if (!Array.isArray(json.steps)) continue;
    json.steps.forEach((step, si) => {
      (step.blocks || []).forEach((block, bi) => {
        if (block.type !== 'quiz') return;
        const qs = Array.isArray(block.questions) ? block.questions : block.question ? [block.question] : [];
        qs.forEach((q, qi) => {
          const opts = q.options || [];
          const total = opts.length;
          if (total < 3) return;
          const withExpl = opts.filter(o => o.explanation && (o.explanation.en || o.explanation.ro)).length;
          if (withExpl === 0) {
            findings.push({
              file: file.split(sep).join('/').replace(ROOT.split(sep).join('/') + '/', ''),
              step: step.id,
              q: q.id || `${step.id}-b${bi}-q${qi}`,
              opts: total,
              subject: subj,
            });
          }
        });
      });
    });
  }
}

console.log(`Quiz Qs with no per-option explanations (trap-debunking absent):`);
console.log(`  total: ${findings.length}`);
const bySubject = {};
findings.forEach(f => { bySubject[f.subject] = (bySubject[f.subject] || 0) + 1; });
console.log(`  by subject:`, bySubject);
console.log();
console.log(`Top 20:`);
findings.slice(0, 20).forEach(f => console.log(`  ${f.file} :: ${f.q} (${f.opts} opts)`));
if (findings.length > 20) console.log(`  ... ${findings.length - 20} more`);
