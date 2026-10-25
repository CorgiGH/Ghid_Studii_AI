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

const isText = (v) => typeof v === 'string' && v.trim().length > 0;
const isBilingual = (v) => !!v && typeof v === 'object' && isText(v.en) && isText(v.ro);
const SQL_DATASETS = ['facultate', 'biblioteca'];

// Every extra part (7b ...) needs what a question needs to be graded: id, solution, dataset (its own or the question's), check.
// gradingNotes, when present, read in both languages.
function sqlParts(q, qi) {
  const at = (m) => errors.push(`questions[${qi}]: ${m}`);
  if (q.gradingNotes !== undefined && !isBilingual(q.gradingNotes)) at('sql gradingNotes must have en + ro');
  if (q.moreParts === undefined) return;
  if (!Array.isArray(q.moreParts)) { at('sql moreParts must be a list'); return; }
  const seen = new Set([q.id]);
  q.moreParts.forEach((p, pi) => {
    const pat = (m) => at(`moreParts[${pi}]: ${m}`);
    if (!isText(p?.id)) pat('missing id');
    else if (seen.has(p.id)) pat(`duplicate id ${p.id}`);
    else seen.add(p.id);
    if (!isText(p?.solution)) pat('needs solution');
    const dataset = p?.dataset ?? q.dataset;
    if (!SQL_DATASETS.includes(dataset)) pat('needs a dataset (its own or the question\'s: facultate or biblioteca)');
    if (!p?.check || typeof p.check !== 'object') pat('needs check');
    else {
      if (!['any', 'required'].includes(p.check.order)) pat('check.order must be "any" or "required"');
      if (!['bag', 'set'].includes(p.check.mode)) pat('check.mode must be "bag" or "set"');
    }
    if (p?.kind !== undefined && !['query', 'state'].includes(p.kind)) pat('kind must be query or state');
  });
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
      sqlParts(q, qi);
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

// The points of the questions add up to meta.totalPoints (a test with sql questions: the other subjects' tests are not held to it).
if (json.meta && Array.isArray(json.questions) && json.questions.some((q) => q?.type === 'sql')) {
  const sum = json.questions.reduce((n, q) => n + (Number.isFinite(q?.points) ? q.points : 0), 0);
  if (json.meta.totalPoints !== sum) errors.push(`meta.totalPoints is ${json.meta.totalPoints} but the questions add up to ${sum}`);
}
if (json.meta?.timerChoices !== undefined) {
  const c = json.meta.timerChoices;
  if (!Array.isArray(c) || c.length === 0 || !c.every((n) => Number.isInteger(n) && n > 0)) errors.push('meta.timerChoices must be a list of positive whole minutes');
}

if (errors.length > 0) {
  console.error(`\u274C ${errors.length} error(s) in ${file}:`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`\u2705 ${file} is valid (${json.questions.length} questions)`);
  process.exit(0);
}
