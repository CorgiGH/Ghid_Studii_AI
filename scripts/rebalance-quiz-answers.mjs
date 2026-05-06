// Rebalance correct-answer positions in course JSON quiz blocks.
// Strategy: deterministic — assign target position based on running index modulo
// option count so distribution is uniform across the file. Swap options to move
// the correct one to the target slot.
//
// Safety: skip any question whose text or explanations reference an option by
// position (e.g. "option A", "first option"). Those need a manual fix.
//
// Usage: node scripts/rebalance-quiz-answers.mjs [--dry] [glob...]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src', 'content');

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const filterArgs = args.filter(a => !a.startsWith('--'));

// Position-reference detection. If a question has any of these in any text
// field, we cannot safely shuffle.
const POSITION_PATTERNS = [
  /\boption [ABCD]\b/i,
  /\banswer [ABCD]\b/i,
  /\bchoice [ABCD]\b/i,
  /\bopțiunea [ABCD]\b/i,
  /\bvarianta [ABCD]\b/i,
  /\brăspunsul [ABCD]\b/i,
  /\bfirst option\b/i,
  /\bsecond option\b/i,
  /\bthird option\b/i,
  /\bfourth option\b/i,
  /\bfirst answer\b/i,
  /\bsecond answer\b/i,
  /\bthird answer\b/i,
  /\bprimul răspuns\b/i,
  /\bal doilea răspuns\b/i,
  /\bal treilea răspuns\b/i,
];

function hasPositionRef(text) {
  if (!text) return false;
  if (typeof text === 'string') {
    return POSITION_PATTERNS.some(re => re.test(text));
  }
  if (typeof text === 'object') {
    return Object.values(text).some(v => hasPositionRef(v));
  }
  return false;
}

function questionHasPositionRefs(q) {
  if (hasPositionRef(q.question)) return true;
  if (hasPositionRef(q.explanation)) return true;
  if (Array.isArray(q.options)) {
    for (const opt of q.options) {
      if (hasPositionRef(opt.text)) return true;
      if (hasPositionRef(opt.explanation)) return true;
      if (hasPositionRef(opt.feedback)) return true;
    }
  }
  return false;
}

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

function getQuizBlocks(data) {
  const blocks = [];
  if (data.steps && Array.isArray(data.steps)) {
    for (const step of data.steps) {
      if (!step.blocks) continue;
      for (const b of step.blocks) {
        if (b.type === 'quiz' && Array.isArray(b.questions)) blocks.push(b);
      }
    }
  }
  return blocks;
}

function rebalanceFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(text);

  const quizBlocks = getQuizBlocks(data);
  if (quizBlocks.length === 0) return null;

  let questionIdx = 0;
  let swappedCount = 0;
  let skippedCount = 0;
  const skippedReasons = [];
  const before = { 0: 0, 1: 0, 2: 0, 3: 0 };
  const after = { 0: 0, 1: 0, 2: 0, 3: 0 };

  for (const block of quizBlocks) {
    for (const q of block.questions) {
      if (!Array.isArray(q.options)) continue;

      const currentIdx = q.options.findIndex(o => o.correct === true);
      if (currentIdx < 0) continue;
      before[currentIdx] = (before[currentIdx] || 0) + 1;

      const total = q.options.length;
      const targetIdx = questionIdx % total;
      questionIdx += 1;

      if (currentIdx === targetIdx) {
        after[targetIdx] = (after[targetIdx] || 0) + 1;
        continue;
      }

      if (questionHasPositionRefs(q)) {
        skippedCount += 1;
        skippedReasons.push({ q: typeof q.question === 'object' ? q.question.en?.slice(0, 80) : String(q.question).slice(0, 80) });
        after[currentIdx] = (after[currentIdx] || 0) + 1;
        continue;
      }

      // Swap option at currentIdx with option at targetIdx
      const tmp = q.options[currentIdx];
      q.options[currentIdx] = q.options[targetIdx];
      q.options[targetIdx] = tmp;
      swappedCount += 1;
      after[targetIdx] = (after[targetIdx] || 0) + 1;
    }
  }

  if (swappedCount === 0 && skippedCount === 0) return null;

  if (!dry) {
    // Preserve trailing newline if original had one
    const trailing = text.endsWith('\n') ? '\n' : '';
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + trailing, 'utf8');
  }

  return { file, swappedCount, skippedCount, skippedReasons, before, after };
}

const files = walk(root).filter(f => f.includes(path.sep + 'courses' + path.sep));

const filtered = filterArgs.length > 0
  ? files.filter(f => filterArgs.some(arg => f.includes(arg.replace(/[/]/g, path.sep))))
  : files;

const results = [];
for (const f of filtered) {
  try {
    const r = rebalanceFile(f);
    if (r) results.push(r);
  } catch (e) {
    console.error('ERROR', f, e.message);
  }
}

console.log(dry ? '[DRY RUN]' : '[APPLIED]');
console.log('');
let totalSwapped = 0;
let totalSkipped = 0;
for (const r of results) {
  const rel = path.relative(root, r.file).replace(/\\/g, '/');
  totalSwapped += r.swappedCount;
  totalSkipped += r.skippedCount;
  console.log(`${rel}`);
  console.log(`  before: ${JSON.stringify(r.before)}`);
  console.log(`  after:  ${JSON.stringify(r.after)}`);
  console.log(`  swapped: ${r.swappedCount}, skipped (position-ref): ${r.skippedCount}`);
  if (r.skippedReasons.length > 0) {
    for (const sr of r.skippedReasons) {
      console.log(`    skip: "${sr.q}..."`);
    }
  }
  console.log('');
}
console.log(`Total: ${totalSwapped} swaps across ${results.length} files (${totalSkipped} skipped).`);
