#!/usr/bin/env node
// The ML content gate as a report, one section per lesson: the same checks as tests/content/ml-content.test.js
// (scripts/ml/content-checks.mjs), grouped by the lesson each problem names. Exits 1 when anything is found.
//   node scripts/ml/check-repetition.mjs [--root <dir>]
import path from 'node:path';
import { loadLessons, loadAllocation, loadTermOwners, registeredWidgets, runAll, validatorProblems, colourProblems, colourFiles, ROOT } from './content-checks.mjs';

const i = process.argv.indexOf('--root');
const root = i > 0 ? path.resolve(process.argv[i + 1]) : ROOT;
const lessons = loadLessons(root);
if (!lessons.length) { console.log('No ML lessons yet.'); process.exit(0); }

const widgets = registeredWidgets(path.join(root, 'src/components/lesson/blocks/VizBlock.jsx'));
const results = runAll(lessons, { allocation: loadAllocation(root), owners: loadTermOwners(root), widgets });
results.validator = validatorProblems(lessons.map((l) => l.file));
results.colours = colourProblems(colourFiles(root));

// A problem belongs to the lesson whose id (ml-lNN) or file (lesson-NN.json) it names; the others (subject-wide) go under "subject".
const bucket = new Map(lessons.map((l) => [l.metaId, []]));
bucket.set('subject', []);
const lessonOf = (p) => { const m = p.match(/\bml-l(\d\d)\b|\blesson-(\d\d)\.json\b/); return m ? `ml-l${m[1] ?? m[2]}` : 'subject'; };
for (const [name, problems] of Object.entries(results)) {
  for (const p of problems) {
    const id = lessonOf(p);
    (bucket.get(id) || bucket.get('subject')).push(`[${name}] ${p}`);
  }
}
let total = 0;
for (const [id, list] of bucket) {
  if (id === 'subject' && !list.length) continue;
  console.log(`${id}: ${list.length ? `${list.length} problem(s)` : 'clean'}`);
  for (const p of list) console.log(`  ${p}`);
  total += list.length;
}
console.log(total ? `\n${total} problem(s)` : '\nAll lessons clean.');
process.exit(total ? 1 : 0);
