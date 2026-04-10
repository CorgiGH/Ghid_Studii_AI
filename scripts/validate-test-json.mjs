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
