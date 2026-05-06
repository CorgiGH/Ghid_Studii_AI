// Audit MC bias in test JSONs (different schema: `correctIndex`)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src', 'content');

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

function audit(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const positions = [];
  if (data.questions && Array.isArray(data.questions)) {
    for (const q of data.questions) {
      if (q.type !== 'multiple-choice') continue;
      if (!Array.isArray(q.options)) continue;
      const ci = q.correctIndex;
      if (typeof ci === 'number') {
        positions.push(ci);
      } else if (Array.isArray(ci)) {
        // Multi-select — record each. Bias on multi-select is less concerning
        // but still worth noting if every test answer set starts at idx 0.
        for (const v of ci) positions.push(v);
      }
    }
  }
  return positions;
}

const files = walk(root).filter(f => f.includes(path.sep + 'tests' + path.sep));
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
console.log(`TEST BIAS (>=50% skew, >=4 Qs):  [${flagged.length}/${summary.length}]`);
console.log('');
for (const s of flagged) {
  console.log(`  ${String(s.skewPct).padStart(3)}% | ${String(s.total).padStart(3)}Qs | ${JSON.stringify(s.counts).padEnd(35)} | ${s.file}`);
}
