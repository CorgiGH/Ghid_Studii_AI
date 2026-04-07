/**
 * Validates a JSON course file against renderer expectations.
 * Run: node scripts/validate-course.mjs <path-to-course.json>
 *
 * Checks for common issues that cause rendering failures:
 * - Block type validity (must be in registry)
 * - Bilingual field formats (list items, table headers/rows)
 * - Required props for each block type
 * - JSON quote characters that break parsing
 * - Step ID conventions
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const VALID_BLOCK_TYPES = [
  'learn', 'definition', 'think', 'quiz', 'code', 'callout',
  'diagram', 'image', 'table', 'list', 'lecture', 'lecture-video',
  'lecture-exam', 'animation', 'code-challenge', 'terminal',
];

// Props that each block type requires
const REQUIRED_PROPS = {
  learn: ['content'],
  definition: ['term', 'content'],
  think: ['question', 'answer'],
  quiz: ['questions'],
  code: ['code'],
  callout: ['variant', 'content'],
  table: ['rows'],
  list: ['items'],
  lecture: ['note'],
  'lecture-video': ['url'],
  'lecture-exam': [],
  diagram: [],
  image: ['src'],
  animation: [],
};

function isBilingualObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val) && ('en' in val || 'ro' in val);
}

function validateBilingualField(val, path, errors) {
  if (typeof val === 'string') return; // plain string OK
  if (isBilingualObject(val)) {
    if (!val.en) errors.push(`${path}: missing 'en' in bilingual object`);
    if (!val.ro) errors.push(`${path}: missing 'ro' in bilingual object`);
    return;
  }
  errors.push(`${path}: expected string or {en, ro} object, got ${typeof val}`);
}

function validateBlock(block, stepId, blockIndex, errors, warnings) {
  const path = `${stepId}[${blockIndex}]`;

  // Check block type
  if (!VALID_BLOCK_TYPES.includes(block.type)) {
    errors.push(`${path}: unknown block type '${block.type}'`);
    return;
  }

  // Check required props
  const required = REQUIRED_PROPS[block.type] || [];
  for (const prop of required) {
    if (!(prop in block)) {
      errors.push(`${path} (${block.type}): missing required prop '${prop}'`);
    }
  }

  // Type-specific validation
  switch (block.type) {
    case 'learn':
      if (block.content) validateBilingualField(block.content, `${path}.content`, errors);
      break;

    case 'definition':
      if (block.term) validateBilingualField(block.term, `${path}.term`, errors);
      if (block.content) validateBilingualField(block.content, `${path}.content`, errors);
      break;

    case 'think':
      if (block.question) validateBilingualField(block.question, `${path}.question`, errors);
      if (block.answer) validateBilingualField(block.answer, `${path}.answer`, errors);
      break;

    case 'callout':
      if (block.content) validateBilingualField(block.content, `${path}.content`, errors);
      if (!['tip', 'warning', 'trap', 'info'].includes(block.variant)) {
        warnings.push(`${path} (callout): variant '${block.variant}' not in [tip, warning, trap, info]`);
      }
      break;

    case 'list': {
      const items = block.items;
      if (items) {
        if (Array.isArray(items)) {
          // Array format — each item can be string or {en, ro}
          for (let i = 0; i < items.length; i++) {
            if (typeof items[i] !== 'string' && !isBilingualObject(items[i])) {
              errors.push(`${path}.items[${i}]: must be string or {en, ro}`);
            }
          }
        } else if (isBilingualObject(items)) {
          // Bilingual object format {en: [], ro: []} — supported by component
          if (!Array.isArray(items.en)) errors.push(`${path}.items.en: must be array`);
          if (!Array.isArray(items.ro)) errors.push(`${path}.items.ro: must be array`);
        } else {
          errors.push(`${path}.items: must be array or {en: [], ro: []}`);
        }
      }
      break;
    }

    case 'table': {
      const { headers, rows } = block;
      if (headers) {
        if (!Array.isArray(headers) && !isBilingualObject(headers)) {
          errors.push(`${path}.headers: must be array or {en: [], ro: []}`);
        }
      }
      if (rows) {
        if (!Array.isArray(rows)) {
          errors.push(`${path}.rows: must be array`);
        } else {
          for (let ri = 0; ri < rows.length; ri++) {
            const row = rows[ri];
            if (!Array.isArray(row) && !isBilingualObject(row)) {
              errors.push(`${path}.rows[${ri}]: must be array or {en: [], ro: []}`);
            }
          }
        }
      }
      break;
    }

    case 'quiz':
      if (block.questions) {
        for (let qi = 0; qi < block.questions.length; qi++) {
          const q = block.questions[qi];
          if (q.question) validateBilingualField(q.question, `${path}.questions[${qi}].question`, errors);
          if (q.options) {
            for (let oi = 0; oi < q.options.length; oi++) {
              const opt = q.options[oi];
              if (opt.text) validateBilingualField(opt.text, `${path}.questions[${qi}].options[${oi}].text`, errors);
              if (!('explanation' in opt)) {
                warnings.push(`${path}.questions[${qi}].options[${oi}]: missing per-option explanation`);
              }
            }
            const correctCount = q.options.filter(o => o.correct).length;
            if (correctCount !== 1) {
              errors.push(`${path}.questions[${qi}]: expected exactly 1 correct option, found ${correctCount}`);
            }
          }
        }
      }
      break;

    case 'lecture-video':
      if (block.label) validateBilingualField(block.label, `${path}.label`, errors);
      break;

    case 'lecture':
      if (block.note) validateBilingualField(block.note, `${path}.note`, errors);
      break;

    case 'code':
      if (typeof block.code !== 'string') {
        errors.push(`${path} (code): 'code' must be a string`);
      }
      break;
  }
}

function validateCourse(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const errors = [];
  const warnings = [];

  // Check for problematic Unicode quotes that might break JSON
  const lines = raw.split('\n');
  for (let i = 0; i < lines.length; i++) {
    // Check for unescaped ASCII " inside string values (heuristic)
    const line = lines[i];
    if (line.includes('\u201E') || line.includes('\u201C') || line.includes('\u201D')) {
      warnings.push(`Line ${i + 1}: contains Unicode quotation marks (U+201E/201C/201D) — may cause JSON issues`);
    }
  }

  let course;
  try {
    course = JSON.parse(raw);
  } catch (e) {
    errors.push(`Invalid JSON: ${e.message}`);
    return { errors, warnings };
  }

  // Validate meta
  if (!course.meta) errors.push('Missing meta object');
  if (!course.meta?.id) errors.push('Missing meta.id');
  if (!course.meta?.title) errors.push('Missing meta.title');

  // Validate steps
  if (!course.steps || !Array.isArray(course.steps)) {
    errors.push('Missing or invalid steps array');
    return { errors, warnings };
  }

  const stepIds = new Set();
  for (let si = 0; si < course.steps.length; si++) {
    const step = course.steps[si];
    const stepPath = `steps[${si}]`;

    if (!step.id) errors.push(`${stepPath}: missing id`);
    if (!step.title) errors.push(`${stepPath}: missing title`);
    if (step.title) validateBilingualField(step.title, `${stepPath}.title`, errors);

    // Check for duplicate step IDs
    if (step.id && stepIds.has(step.id)) {
      errors.push(`${stepPath}: duplicate step ID '${step.id}'`);
    }
    stepIds.add(step.id);

    // Validate blocks
    if (!step.blocks || !Array.isArray(step.blocks)) {
      errors.push(`${stepPath}: missing or invalid blocks array`);
      continue;
    }

    for (let bi = 0; bi < step.blocks.length; bi++) {
      validateBlock(step.blocks[bi], step.id, bi, errors, warnings);
    }
  }

  // Validate quiz reviewStep references
  for (const step of course.steps) {
    for (const block of (step.blocks || [])) {
      if (block.type === 'quiz' && block.questions) {
        for (const q of block.questions) {
          if (q.reviewStep && !stepIds.has(q.reviewStep)) {
            warnings.push(`Quiz in ${step.id}: reviewStep '${q.reviewStep}' doesn't match any step ID`);
          }
        }
      }
    }
  }

  return { errors, warnings, stepCount: course.steps.length, blockCount: course.steps.reduce((sum, s) => sum + (s.blocks?.length || 0), 0) };
}

// ── CLI ──

const filePath = process.argv[2];
if (!filePath) {
  console.log('Usage: node scripts/validate-course.mjs <path-to-course.json>');
  process.exit(1);
}

const result = validateCourse(resolve(filePath));

if (result.errors.length === 0) {
  console.log(`✅ Valid — ${result.stepCount} steps, ${result.blockCount} blocks`);
} else {
  console.log(`❌ ${result.errors.length} error(s):`);
  result.errors.forEach(e => console.log(`  ERROR: ${e}`));
}

if (result.warnings.length > 0) {
  console.log(`\n⚠️  ${result.warnings.length} warning(s):`);
  result.warnings.forEach(w => console.log(`  WARN: ${w}`));
}

process.exit(result.errors.length > 0 ? 1 : 0);
