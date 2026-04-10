#!/usr/bin/env node
/**
 * validate-course-json.mjs
 * Validates a course JSON file against the project's expected schema.
 * Exit 0 = valid, Exit 1 = errors found.
 * Usage: node scripts/validate-course-json.mjs <path-to-json>
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const file = process.argv[2];
if (!file) { console.error('Usage: node validate-course-json.mjs <file>'); process.exit(1); }

const json = JSON.parse(readFileSync(resolve(file), 'utf-8'));
const errors = [];

// Meta validation
if (!json.meta) errors.push('Missing "meta" object');
else {
  if (!json.meta.id) errors.push('meta.id missing');
  if (!json.meta.title?.en || !json.meta.title?.ro) errors.push('meta.title must have en + ro');
  if (!json.meta.shortTitle?.en || !json.meta.shortTitle?.ro) errors.push('meta.shortTitle must have en + ro');
}

// Steps validation
if (!Array.isArray(json.steps)) errors.push('Missing "steps" array');
else {
  json.steps.forEach((step, si) => {
    if (!step.id) errors.push(`steps[${si}]: missing id`);
    if (!step.title?.en || !step.title?.ro) errors.push(`steps[${si}]: title must have en + ro`);
    if (!Array.isArray(step.blocks) || step.blocks.length === 0)
      errors.push(`steps[${si}]: empty or missing blocks array`);
    else {
      step.blocks.forEach((block, bi) => {
        if (!block.type) errors.push(`steps[${si}].blocks[${bi}]: missing type`);
        const t = block.type;
        if (['learn', 'callout', 'info', 'tip', 'warning', 'danger', 'example'].includes(t)) {
          if (!block.content?.en || !block.content?.ro)
            errors.push(`steps[${si}].blocks[${bi}] (${t}): content must have en + ro`);
        }
        if (t === 'definition') {
          if (!block.term?.en || !block.term?.ro)
            errors.push(`steps[${si}].blocks[${bi}] (definition): term must have en + ro`);
          if (!block.content?.en || !block.content?.ro)
            errors.push(`steps[${si}].blocks[${bi}] (definition): content must have en + ro`);
        }
        if (t === 'quiz') {
          if (!block.questions && !block.question)
            errors.push(`steps[${si}].blocks[${bi}] (quiz): needs questions or question`);
        }
        if (t === 'think') {
          if (!block.question?.en || !block.question?.ro)
            errors.push(`steps[${si}].blocks[${bi}] (think): question must have en + ro`);
          if (!block.answer?.en || !block.answer?.ro)
            errors.push(`steps[${si}].blocks[${bi}] (think): answer must have en + ro`);
        }
        if (t === 'code') {
          if (!block.code) errors.push(`steps[${si}].blocks[${bi}] (code): missing code field`);
        }
      });
    }
  });
}

if (errors.length > 0) {
  console.error(`\u274C ${errors.length} validation error(s) in ${file}:`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`\u2705 ${file} is valid (${json.steps.length} steps, ${json.steps.reduce((a, s) => a + s.blocks.length, 0)} blocks)`);
  process.exit(0);
}
