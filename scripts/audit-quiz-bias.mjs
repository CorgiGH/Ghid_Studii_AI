// Where the correct answer sits in multiple-choice questions: course `quiz` blocks, test `multiple-choice`
// questions and lesson `mcq` blocks (options[].correct). Advisory, not part of `npm run validate`.
//   node scripts/audit-quiz-bias.mjs [dir] [--all]
// dir defaults to src/content; --all also lists the files that are not flagged.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const listAll = args.includes('--all');
const dirArg = args.find(a => !a.startsWith('--'));
const root = dirArg ? path.resolve(dirArg) : path.join(__dirname, '..', 'src', 'content');
const LETTERS = 'ABCDEFGH';

function findCorrectIdx(opts) {
  return opts.findIndex(o => o.correct === true);
}

function audit(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const positions = [];
  if (data.steps) {
    for (const step of data.steps) {
      if (!step.blocks) continue;
      for (const b of step.blocks) {
        if (b.type === 'quiz' && Array.isArray(b.questions)) {
          for (const q of b.questions) {
            if (Array.isArray(q.options)) positions.push(findCorrectIdx(q.options));
          }
        }
        if (b.type === 'mcq' && Array.isArray(b.options)) positions.push(findCorrectIdx(b.options));
      }
    }
  }
  if (data.questions && Array.isArray(data.questions)) {
    for (const q of data.questions) {
      if (q.type === 'multiple-choice' && Array.isArray(q.options)) {
        positions.push(findCorrectIdx(q.options));
      }
    }
  }
  return positions;
}

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.isFile() && p.endsWith('.json')) out.push(p);
  }
  return out;
}

const letterCounts = (counts) => Object.fromEntries(Object.entries(counts).map(([k, v]) => [k < 0 ? '?' : LETTERS[k], v]));

const files = walk(root);
const summary = [];
const overall = {};
for (const f of files) {
  try {
    const pos = audit(f);
    if (pos.length === 0) continue;
    const counts = {};
    for (const p of pos) {
      counts[p] = (counts[p] || 0) + 1;
      overall[p] = (overall[p] || 0) + 1;
    }
    const total = pos.length;
    const max = Math.max(...Object.values(counts));
    const skewPct = Math.round(100 * max / total);
    const rel = path.relative(root, f).replace(/\\/g, '/');
    summary.push({ file: rel, total, counts, max, skewPct });
  } catch { /* not a content file */ }
}

summary.sort((a, b) => b.skewPct - a.skewPct || a.file.localeCompare(b.file));

const line = (s) => `  ${String(s.skewPct).padStart(3)}% | ${String(s.total).padStart(3)}Qs | ${JSON.stringify(letterCounts(s.counts)).padEnd(40)} | ${s.file}`;

const flagged = summary.filter(s => s.skewPct >= 50 && s.total >= 4);
console.log(`FLAGGED (>=50% skew, >=4 Qs):  [${flagged.length}/${summary.length} files]`);
console.log('');
for (const s of flagged) console.log(line(s));

// "No position holds more than half" (the lesson rule): exactly half is allowed.
const overHalf = summary.filter(s => s.total >= 4 && s.max * 2 > s.total);
console.log('');
console.log(`OVER HALF (one position holds >50%, >=4 Qs):  [${overHalf.length}/${summary.length} files]`);
for (const s of overHalf) console.log(line(s));

if (listAll) {
  console.log('');
  console.log('ALL FILES:');
  for (const s of [...summary].sort((a, b) => a.file.localeCompare(b.file))) console.log(line(s));
}

const n = Object.values(overall).reduce((a, b) => a + b, 0);
const share = Object.keys(overall).sort((a, b) => a - b)
  .map(k => `${k < 0 ? '?' : LETTERS[k]} ${overall[k]} (${(100 * overall[k] / n).toFixed(1)}%)`).join(' | ');
console.log('');
console.log(`ALL POSITIONS (${n} questions): ${share}`);
