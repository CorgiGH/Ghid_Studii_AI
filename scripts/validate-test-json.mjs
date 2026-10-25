#!/usr/bin/env node
/**
 * validate-test-json.mjs
 * Validates a test JSON file against the project's test schema.
 * Usage: node scripts/validate-test-json.mjs <path-to-json>
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const file = process.argv[2];
if (!file) { console.error('Usage: node validate-test-json.mjs <file>'); process.exit(1); }

const json = JSON.parse(readFileSync(resolve(file), 'utf-8'));
const errors = [];

// Meta validation
if (!json.meta) errors.push('Missing "meta" object');
else {
  if (!json.meta.id) errors.push('meta.id missing');
  if (!json.meta.title?.en || !json.meta.title?.ro) errors.push('meta.title must have en + ro');
}

// Questions validation
if (!Array.isArray(json.questions)) errors.push('Missing "questions" array');
else {
  json.questions.forEach((q, qi) => {
    if (!q.id) errors.push(`questions[${qi}]: missing id`);
    if (!q.type) errors.push(`questions[${qi}]: missing type`);
    if (!q.prompt?.en || !q.prompt?.ro) errors.push(`questions[${qi}]: prompt must have en + ro`);
    if (q.type === 'multiple-choice') {
      if (!Array.isArray(q.options) || q.options.length < 2)
        errors.push(`questions[${qi}]: multiple-choice needs >=2 options`);
      if (q.correctIndex === undefined && q.correctIndices === undefined)
        errors.push(`questions[${qi}]: multiple-choice needs correctIndex or correctIndices`);
    }
    if (q.type === 'sql') {
      if (typeof q.solution !== 'string' || !q.solution.trim()) errors.push(`questions[${qi}]: sql needs solution`);
      if (!['facultate', 'biblioteca'].includes(q.dataset))
        errors.push(`questions[${qi}]: sql needs dataset (facultate or biblioteca)`);
      if (!q.check || typeof q.check !== 'object') errors.push(`questions[${qi}]: sql needs check`);
      else {
        if (!['any', 'required'].includes(q.check.order)) errors.push(`questions[${qi}]: sql check.order must be "any" or "required"`);
        if (!['bag', 'set'].includes(q.check.mode)) errors.push(`questions[${qi}]: sql check.mode must be "bag" or "set"`);
      }
      if (q.kind !== undefined && !['query', 'state'].includes(q.kind)) errors.push(`questions[${qi}]: sql kind must be query or state`);
      if (!Number.isFinite(q.points) || q.points <= 0) errors.push(`questions[${qi}]: sql needs positive points`);
    }
    if (q.type === 'fill-in') {
      if (!Array.isArray(q.blanks) || q.blanks.length === 0)
        errors.push(`questions[${qi}]: fill-in needs blanks array`);
    }
  });
}

if (errors.length > 0) {
  console.error(`\u274C ${errors.length} error(s) in ${file}:`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`\u2705 ${file} is valid (${json.questions.length} questions)`);
  process.exit(0);
}
