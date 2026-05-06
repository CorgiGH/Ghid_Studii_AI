import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src', 'content');

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

const files = walk(root);
const summary = [];
for (const f of files) {
  try {
    const pos = audit(f);
    if (pos.length === 0) continue;
    const counts = {};
    for (const p of pos) counts[p] = (counts[p] || 0) + 1;
    const total = pos.length;
    const max = Math.max(...Object.values(counts));
    const skewPct = Math.round(100 * max / total);
    const rel = path.relative(root, f).replace(/\\/g, '/');
    summary.push({ file: rel, total, counts, skewPct });
  } catch (e) {}
}

summary.sort((a, b) => b.skewPct - a.skewPct);

const flagged = summary.filter(s => s.skewPct >= 50 && s.total >= 4);
console.log(`FLAGGED (>=50% skew, >=4 Qs):  [${flagged.length}/${summary.length} files]`);
console.log('');
for (const s of flagged) {
  console.log(`  ${String(s.skewPct).padStart(3)}% | ${String(s.total).padStart(3)}Qs | ${JSON.stringify(s.counts).padEnd(40)} | ${s.file}`);
}
