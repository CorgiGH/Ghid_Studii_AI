#!/usr/bin/env node
/**
 * validate-all.mjs — pre-deploy mechanical validation gate.
 *
 * Walks every JSON under src/content/, picks the right validator by path
 * (tests vs courses/seminars vs other), runs each, then runs lint-site.mjs.
 * Aggregates findings and exits non-zero on any error so CI can block deploy.
 *
 * Usage:
 *   npm run validate
 *   node scripts/validate-all.mjs
 */
import { readdirSync, statSync, readFileSync } from 'fs';
import { join, resolve, sep } from 'path';
import { spawnSync } from 'child_process';

const ROOT = resolve(process.cwd());
const CONTENT = join(ROOT, 'src', 'content');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (p.endsWith('.json')) out.push(p);
  }
  return out;
}

function classify(file) {
  const norm = file.split(sep).join('/');
  if (norm.includes('/tests/')) return 'test';
  if (norm.includes('/courses/') || norm.includes('/seminars/')) {
    // ALO seminars use a different shape: { id, title, problems[] } instead
    // of the course shape { meta, steps[] }. Detect by content, not path.
    try {
      const j = JSON.parse(readFileSync(file, 'utf-8'));
      if (j && j.problems && !j.steps) return 'bilingual-only';
    } catch { /* JSON parse error caught by bilingual validator */ }
    return 'course';
  }
  return 'bilingual-only';
}

function run(scriptName, args = []) {
  const r = spawnSync('node', [`scripts/${scriptName}`, ...args], {
    cwd: ROOT,
    encoding: 'utf-8',
  });
  return { code: r.status ?? 1, stdout: r.stdout || '', stderr: r.stderr || '' };
}

const files = walk(CONTENT);
const failures = [];
let okCount = 0;

for (const file of files) {
  const kind = classify(file);
  const rel = file.split(sep).join('/');
  // Always check bilingual completeness
  let r = run('validate-bilingual.mjs', [file]);
  if (r.code !== 0) failures.push({ file: rel, validator: 'bilingual', output: r.stderr || r.stdout });

  if (kind === 'test') {
    r = run('validate-test-json.mjs', [file]);
    if (r.code !== 0) failures.push({ file: rel, validator: 'test', output: r.stderr || r.stdout });
  } else if (kind === 'course') {
    r = run('validate-course-json.mjs', [file]);
    if (r.code !== 0) failures.push({ file: rel, validator: 'course', output: r.stderr || r.stdout });
  }
  if (r.code === 0) okCount++;
}

console.log(`\nvalidate-all: ${files.length} JSON files scanned`);

// Site-wide lint (cross-file rules). Reported as a warning only — these are
// content-quality findings (missing commonErrors, MC-without-feedback, math
// outside KaTeX) that we want visibility on but that pre-date this gate and
// shouldn't block deploy until they're cleaned up.
console.log('\nRunning lint-site.mjs (advisory)...');
const lint = run('lint-site.mjs', ['--summary']);
process.stdout.write(lint.stdout);
if (lint.code !== 0) {
  console.log('  (lint-site issues are advisory — not blocking validate-all)');
}

if (failures.length === 0) {
  console.log(`\nvalidate-all: PASS (${files.length} files schema+bilingual clean)`);
  process.exit(0);
}

console.error(`\nvalidate-all: FAIL — ${failures.length} issue(s)\n`);
for (const f of failures) {
  console.error(`  [${f.validator}] ${f.file}`);
  const trimmed = f.output.trim().split('\n').slice(0, 8).join('\n    ');
  if (trimmed) console.error(`    ${trimmed}`);
}
process.exit(1);
