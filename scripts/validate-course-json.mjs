#!/usr/bin/env node
/**
 * validate-course-json.mjs
 * Validates a course JSON file against the project's expected schema.
 * Exit 0 = valid, Exit 1 = errors found.
 * Usage: node scripts/validate-course-json.mjs <path-to-json>
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validateViz } from '../src/components/lesson/viz/vizSpec.js';
import { validateMcq, validateReflect } from '../src/components/lesson/blocks/choiceSpec.js';
import { validateProof } from '../src/components/lesson/blocks/proofSpec.js';
import { validateQueryMachine } from '../src/sql/machineSpec.js';
import { validateSqlExercise } from '../src/components/lesson/blocks/sqlExerciseSpec.js';
import { validateCalc } from '../src/components/lesson/blocks/calcSpec.js';
import { validateSteps, validateRule } from '../src/components/lesson/blocks/guideSpec.js';

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
        if (t === 'viz') {
          for (const e of validateViz(block)) errors.push(`steps[${si}].blocks[${bi}] ${e}`);
        }
        if (t === 'mcq') {
          for (const e of validateMcq(block, { lessonId: json.meta?.id })) errors.push(`steps[${si}].blocks[${bi}] ${e}`);
        }
        if (t === 'reflect') {
          for (const e of validateReflect(block)) errors.push(`steps[${si}].blocks[${bi}] ${e}`);
        }
        if (t === 'query-machine') {
          for (const e of validateQueryMachine(block)) errors.push(`steps[${si}].blocks[${bi}] ${e}`);
        }
        if (t === 'sql-exercise') {
          for (const e of validateSqlExercise(block)) errors.push(`steps[${si}].blocks[${bi}] ${e}`);
        }
        if (t === 'calc-exercise') {
          for (const e of validateCalc(block)) errors.push(`steps[${si}].blocks[${bi}] ${e}`);
        }
        if (t === 'proof-steps') {
          for (const e of validateProof(block, { lessonId: json.meta?.id })) errors.push(`steps[${si}].blocks[${bi}] ${e}`);
        }
        if (t === 'steps') {
          for (const e of validateSteps(block)) errors.push(`steps[${si}].blocks[${bi}] ${e}`);
        }
        if (t === 'rule') {
          for (const e of validateRule(block)) errors.push(`steps[${si}].blocks[${bi}] ${e}`);
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
