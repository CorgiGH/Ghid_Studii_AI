#!/usr/bin/env node
/**
 * spot-check-html.mjs — render the spot-check sample as a click-to-grade
 * single-file HTML page. State persists in localStorage; user can export the
 * filled markdown when done.
 *
 * Usage:
 *   node scripts/spot-check-html.mjs --seed=42 --count=50 --out=docs/spot-check.html
 *   open docs/spot-check.html
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve, sep, dirname } from 'path';

const ROOT = resolve(process.cwd());
const CONTENT = join(ROOT, 'src', 'content');
const args = process.argv.slice(2);
const COUNT = Number(args.find(a => a.startsWith('--count='))?.split('=')[1]) || 50;
const SEED = Number(args.find(a => a.startsWith('--seed='))?.split('=')[1]) || 42;
const OUT = args.find(a => a.startsWith('--out='))?.split('=')[1] || 'docs/spot-check.html';

function rng(s) {
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
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
const bilEn = n => !n ? '' : typeof n === 'string' ? n : n.en || n.ro || '';
const optionText = o => !o ? '' : typeof o === 'string' ? o : o.text ? bilEn(o.text) : bilEn(o);
function extractMC(file, json) {
  const out = [];
  const rel = file.split(sep).join('/').replace(ROOT.split(sep).join('/') + '/', '');
  const subject = rel.split('/')[2];
  const isTest = rel.includes('/tests/');
  if (Array.isArray(json.questions)) {
    json.questions.forEach((q, i) => {
      if (q.type !== 'multiple-choice') return;
      let idx;
      if (typeof q.correctIndex === 'number') idx = q.correctIndex;
      else if (Array.isArray(q.correctIndices) && q.correctIndices.length === 1) idx = q.correctIndices[0];
      else return;
      const opts = (q.options || []).map(optionText);
      if (opts.length < 2) return;
      out.push({ file: rel, subject, isTest, qid: q.id || `q${i}`,
        prompt: bilEn(q.prompt) || bilEn(q.question) || '',
        options: opts, recordedIdx: idx,
        sourceHint: q.reviewStep || q.lectureRef || (json.meta?.title?.en) || '' });
    });
  }
  if (Array.isArray(json.steps)) {
    json.steps.forEach((step, si) => {
      (step.blocks || []).forEach((block, bi) => {
        if (block.type !== 'quiz') return;
        const qs = Array.isArray(block.questions) ? block.questions : block.question ? [block.question] : [];
        qs.forEach((q, qi) => {
          const opts = q.options || [];
          const idx = opts.findIndex(o => o.correct === true);
          if (idx < 0 || opts.length < 2) return;
          out.push({ file: rel, subject, isTest: false,
            qid: q.id || `${step.id}-b${bi}-q${qi}`,
            prompt: bilEn(q.question) || bilEn(q.prompt) || '',
            options: opts.map(optionText), recordedIdx: idx,
            sourceHint: q.reviewStep || step.id || (json.meta?.title?.en) || '' });
        });
      });
    });
  }
  return out;
}

const all = [];
for (const f of walk(CONTENT)) {
  let json; try { json = JSON.parse(readFileSync(f, 'utf-8')); } catch { continue; }
  all.push(...extractMC(f, json));
}
const tests = all.filter(q => q.isTest);
const courses = all.filter(q => !q.isTest);
const rand = rng(SEED);
const pick = (pool, n) => {
  const c = pool.slice();
  for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
  return c.slice(0, n);
};
const targetTests = Math.min(Math.round(COUNT * 0.6), tests.length);
const sample = [...pick(tests, targetTests), ...pick(courses, COUNT - targetTests)];
for (let i = sample.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [sample[i], sample[j]] = [sample[j], sample[i]]; }

const dataJson = JSON.stringify(sample);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Content spot-check — seed ${SEED}</title>
<style>
  :root { --bg:#0f172a; --fg:#e2e8f0; --muted:#94a3b8; --card:#1e293b; --border:#334155;
          --accent:#3b82f6; --ok:#22c55e; --bad:#ef4444; --warn:#f59e0b; }
  @media (prefers-color-scheme: light) {
    :root { --bg:#f8fafc; --fg:#0f172a; --muted:#475569; --card:#fff; --border:#cbd5e1; }
  }
  * { box-sizing: border-box; }
  body { background: var(--bg); color: var(--fg); font-family: ui-sans-serif, system-ui, sans-serif;
         margin: 0; padding: 24px; line-height: 1.5; max-width: 900px; margin-inline: auto; }
  h1 { margin: 0 0 8px; font-size: 24px; }
  .meta { color: var(--muted); font-size: 13px; margin-bottom: 24px; }
  .progress { position: sticky; top: 0; background: var(--bg); padding: 12px 0; border-bottom: 1px solid var(--border);
              z-index: 10; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .progress .bar { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; min-width: 200px; }
  .progress .fill { height: 100%; background: var(--accent); transition: width 0.3s; }
  .stats { font-size: 13px; color: var(--muted); }
  .stats .ok { color: var(--ok); } .stats .bad { color: var(--bad); } .stats .warn { color: var(--warn); }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px;
          padding: 20px; margin: 16px 0; }
  .card.done { opacity: 0.55; }
  .card .head { display: flex; justify-content: space-between; gap: 12px; font-size: 12px;
                color: var(--muted); margin-bottom: 8px; flex-wrap: wrap; }
  .card .file { font-family: ui-monospace, monospace; }
  .card .subj { padding: 2px 8px; border-radius: 4px; background: var(--accent); color: #fff; font-weight: 600; }
  .card .test-badge { padding: 2px 8px; border-radius: 4px; background: var(--warn); color: #000; font-weight: 600; }
  .prompt { font-size: 16px; margin: 12px 0; }
  .opt { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; margin: 6px 0;
         font-family: ui-monospace, monospace; font-size: 14px; }
  .opt.recorded { border-color: var(--accent); background: rgba(59,130,246,0.1); }
  .opt.recorded::before { content: '✓ recorded → '; color: var(--accent); font-family: inherit; font-weight: 600; }
  .actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  button { padding: 8px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--card);
           color: var(--fg); cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.15s; }
  button:hover { transform: translateY(-1px); }
  button.ok    { border-color: var(--ok);   } button.ok.active    { background: var(--ok);   color: #000; }
  button.bad   { border-color: var(--bad);  } button.bad.active   { background: var(--bad);  color: #fff; }
  button.warn  { border-color: var(--warn); } button.warn.active  { background: var(--warn); color: #000; }
  .extras { display: grid; grid-template-columns: 1fr 2fr; gap: 8px; margin-top: 10px; }
  .extras input, .extras textarea { padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px;
           background: var(--bg); color: var(--fg); font-family: inherit; font-size: 14px; }
  .extras textarea { min-height: 32px; resize: vertical; }
  .toolbar { display: flex; gap: 8px; margin: 24px 0 16px; flex-wrap: wrap; }
  .toolbar button { background: var(--accent); color: #fff; border-color: var(--accent); }
  .toolbar button.danger { background: transparent; color: var(--bad); border-color: var(--bad); }
  textarea#exportBox { width: 100%; min-height: 200px; margin-top: 12px; padding: 12px;
        background: var(--bg); border: 1px solid var(--border); color: var(--fg); border-radius: 6px;
        font-family: ui-monospace, monospace; font-size: 12px; }
  details { margin: 8px 0; }
  summary { cursor: pointer; color: var(--muted); font-size: 13px; }
</style>
</head>
<body>
<h1>Content spot-check</h1>
<div class="meta">Seed <code>${SEED}</code> · ${sample.length} questions · pool ${all.length} · biased ~60% toward exam tests · state saved to localStorage key <code>spot-${SEED}</code></div>

<div class="progress">
  <div class="bar"><div class="fill" id="bar"></div></div>
  <div id="stats" class="stats">0 / ${sample.length}</div>
</div>

<div class="toolbar">
  <button id="exportBtn">Export markdown</button>
  <button id="copyBtn">Copy markdown</button>
  <button id="resetBtn" class="danger">Reset all (clears localStorage)</button>
</div>

<details><summary>Source PDF lookup</summary>
<p style="font-size:13px;color:var(--muted)">Hints map to <code>wiki/raw/pdfs/</code>. Examples: <code>os-c7-...</code> → <code>OS-Course-7.pdf</code>; <code>alo-c2-...</code> → ALO course 2 PDF; OOP courses use <code>Course-N.pdf</code> (no prefix). For test questions the hint usually names the lecture/topic.</p>
</details>

<div id="cards"></div>

<textarea id="exportBox" placeholder="Click 'Export markdown' to populate" readonly></textarea>

<script>
const data = ${dataJson};
const SEED = ${SEED};
const KEY = 'spot-' + SEED;
const state = JSON.parse(localStorage.getItem(KEY) || '{}');

function save() { localStorage.setItem(KEY, JSON.stringify(state)); render(); }
function render() {
  const cards = document.getElementById('cards');
  cards.innerHTML = '';
  let done = 0, ok = 0, bad = 0, warn = 0;
  data.forEach((q, i) => {
    const s = state[i] || {};
    if (s.verdict) {
      done++;
      if (s.verdict === 'ok') ok++;
      else if (s.verdict === 'bad') bad++;
      else if (s.verdict === 'warn') warn++;
    }
    const card = document.createElement('div');
    card.className = 'card' + (s.verdict ? ' done' : '');
    card.innerHTML = \`
      <div class="head">
        <div><span class="subj">\${q.subject}</span> \${q.isTest ? '<span class="test-badge">EXAM</span>' : ''} <span class="file">\${q.file}</span></div>
        <div>\${i+1}/\${data.length} · \${q.qid}</div>
      </div>
      \${q.sourceHint ? \`<div style="font-size:12px;color:var(--muted)">Source hint: <em>\${q.sourceHint}</em></div>\` : ''}
      <div class="prompt">\${escapeHtml(q.prompt)}</div>
      \${q.options.map((o, k) => \`<div class="opt \${k===q.recordedIdx ? 'recorded' : ''}">\${k}) \${escapeHtml(o)}</div>\`).join('')}
      <div class="actions">
        <button class="ok \${s.verdict==='ok'?'active':''}" data-i="\${i}" data-v="ok">✅ correct</button>
        <button class="bad \${s.verdict==='bad'?'active':''}" data-i="\${i}" data-v="bad">❌ wrong</button>
        <button class="warn \${s.verdict==='warn'?'active':''}" data-i="\${i}" data-v="warn">⚠ ambiguous</button>
      </div>
      <div class="extras">
        <input type="text" placeholder="source page (e.g. 12)" data-i="\${i}" data-f="page" value="\${s.page || ''}">
        <textarea placeholder="notes (only when ❌ or ⚠)" data-i="\${i}" data-f="notes">\${s.notes || ''}</textarea>
      </div>
    \`;
    cards.appendChild(card);
  });
  document.getElementById('bar').style.width = (done / data.length * 100) + '%';
  document.getElementById('stats').innerHTML =
    \`<span class="ok">✅ \${ok}</span> · <span class="bad">❌ \${bad}</span> · <span class="warn">⚠ \${warn}</span> · \${done}/\${data.length}\`;
}
function escapeHtml(s) { return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]); }

document.addEventListener('click', e => {
  const btn = e.target.closest('button[data-i]');
  if (!btn) return;
  const i = +btn.dataset.i, v = btn.dataset.v;
  state[i] = state[i] || {};
  state[i].verdict = state[i].verdict === v ? null : v;
  save();
});
document.addEventListener('input', e => {
  const el = e.target.closest('[data-i][data-f]');
  if (!el) return;
  const i = +el.dataset.i, f = el.dataset.f;
  state[i] = state[i] || {};
  state[i][f] = el.value;
  localStorage.setItem(KEY, JSON.stringify(state)); // skip render to keep focus
});

function buildMarkdown() {
  const lines = [];
  lines.push('# Content spot-check — graded');
  lines.push('');
  lines.push('Seed: \`' + SEED + '\`');
  let ok=0, bad=0, warn=0;
  for (const k in state) {
    const v = state[k]?.verdict;
    if (v === 'ok') ok++;
    if (v === 'bad') bad++;
    if (v === 'warn') warn++;
  }
  lines.push('');
  lines.push('## Tally');
  lines.push('- ✅ Correct: ' + ok + ' / ' + data.length);
  lines.push('- ❌ Wrong: ' + bad + ' / ' + data.length);
  lines.push('- ⚠ Ambiguous: ' + warn + ' / ' + data.length);
  lines.push('');
  if (bad === 0 && warn < 3) lines.push('**Decision:** <2 wrong → fears overblown.');
  else if (bad <= 5) lines.push('**Decision:** 2-5 wrong → audit similar files.');
  else lines.push('**Decision:** >5 wrong → laundering risk realized; broaden audit.');
  lines.push('');
  lines.push('## Wrong / ambiguous detail');
  data.forEach((q, i) => {
    const s = state[i] || {};
    if (s.verdict === 'ok' || !s.verdict) return;
    lines.push('### ' + (i+1) + '. \`' + q.file + '\` — \`' + q.qid + '\` — ' + (s.verdict === 'bad' ? '❌ wrong' : '⚠ ambiguous'));
    lines.push('**Q:** ' + q.prompt.replace(/\\n+/g, ' '));
    q.options.forEach((o, k) => lines.push('- ' + k + ') ' + o + (k===q.recordedIdx?' ← recorded':'')));
    if (s.page) lines.push('Source page: ' + s.page);
    if (s.notes) lines.push('Notes: ' + s.notes);
    lines.push('');
  });
  return lines.join('\\n');
}
document.getElementById('exportBtn').onclick = () => {
  document.getElementById('exportBox').value = buildMarkdown();
};
document.getElementById('copyBtn').onclick = async () => {
  const md = buildMarkdown();
  try { await navigator.clipboard.writeText(md); alert('Copied to clipboard.'); }
  catch { document.getElementById('exportBox').value = md; alert('Clipboard blocked — markdown shown in textarea.'); }
};
document.getElementById('resetBtn').onclick = () => {
  if (confirm('Clear all marks for this seed?')) { localStorage.removeItem(KEY); for (const k in state) delete state[k]; render(); }
};

render();
</script>
</body>
</html>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
console.log(`Wrote ${sample.length}-question grading page to ${OUT}`);
console.log(`Open: file://${resolve(OUT).replace(/\\/g, '/')}`);
