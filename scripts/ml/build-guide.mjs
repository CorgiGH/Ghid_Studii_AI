#!/usr/bin/env node
// Builds the "Ghid rapid ML" page (public/ml-ghid/index.html) from src/guides/ml/part-*.md.
//   node scripts/ml/build-guide.mjs [--src <dir>] [--out <dir>]
// Markdown contract: one H1 per part, one H2 per card, bold-label sections (Când vezi asta, Simboluri, Exemplu,
// Regula, Capcana, Încearcă tu), $..$ and $$..$$ math rendered with KaTeX at build time.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { micromark } from 'micromark';

const require = createRequire(import.meta.url);
const katex = require('katex');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ORDER = ['1a', '1b', '2', '3', '4'];
const SECTIONS = [
  ['cand', 'Când vezi asta'], ['simboluri', 'Simboluri'], ['exemplu', 'Exemplu'],
  ['regula', 'Regula'], ['capcana', 'Capcana'], ['incearca', 'Încearcă tu'],
];
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const SEC_BY_LABEL = new Map(SECTIONS.map(([k, l]) => [norm(l), k]));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const md = (s) => micromark(s, { allowDangerousHtml: true });

// 1. Math: swap every formula for an alphanumeric token, render it with KaTeX (throwOnError), swap back later.
function protectMath(text, file, store) {
  const lineAt = (off) => text.slice(0, off).split('\n').length;
  const render = (tex, display, off) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: display, throwOnError: true });
    } catch (e) {
      throw new Error(`${file}:${lineAt(off)}: bad formula "${tex.trim().slice(0, 60)}": ${e.message}`);
    }
  };
  // Single pass so offsets refer to the original text; $$ is tried before $.
  return text.replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, (m, d, i, off) => {
    const display = d !== undefined;
    const id = store.length;
    store.push({ html: render(display ? d : i, display, off), display });
    return `MATHPH${id}X`;
  });
}

// 2. Pipe tables (micromark has no GFM here): convert to HTML blocks held behind a token.
function protectTables(text, store) {
  const lines = text.split('\n');
  const out = [];
  const isSep = (l) => /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/.test(l) && l.includes('-') && l.includes('|');
  const cells = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const inline = (c) => md(c).replace(/^<p>/, '').replace(/<\/p>\s*$/, '').trim();
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('|') && i + 1 < lines.length && isSep(lines[i + 1])) {
      const head = cells(lines[i]);
      const aligns = cells(lines[i + 1]).map((c) => (c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : ''));
      let j = i + 2;
      const rows = [];
      while (j < lines.length && lines[j].trim() && lines[j].includes('|')) rows.push(cells(lines[j++]));
      const td = (tag, c, k) => `<${tag}${aligns[k] ? ` style="text-align:${aligns[k]}"` : ''}>${inline(c)}</${tag}>`;
      const html = `<div class="tscroll"><table><thead><tr>${head.map((c, k) => td('th', c, k)).join('')}</tr></thead><tbody>${rows
        .map((r) => `<tr>${head.map((_, k) => td('td', r[k] ?? '', k)).join('')}</tr>`).join('')}</tbody></table></div>`;
      out.push(`TBLPH${store.length}X`);
      store.push(html);
      i = j - 1;
    } else out.push(lines[i]);
  }
  return out.join('\n');
}

function restore(html, math, tables) {
  html = html.replace(/<p>\s*TBLPH(\d+)X\s*<\/p>/g, (_, n) => tables[n]).replace(/TBLPH(\d+)X/g, (_, n) => tables[n]);
  html = html.replace(/<p>\s*MATHPH(\d+)X\s*<\/p>/g, (m, n) => (math[n].display ? `<div class="mscroll">${math[n].html}</div>` : m));
  return html.replace(/MATHPH(\d+)X/g, (_, n) => (math[n].display ? `<div class="mscroll">${math[n].html}</div>` : math[n].html));
}

export function parsePart(file, id) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const math = [], tables = [];
  const text = protectTables(protectMath(raw, path.basename(file), math), tables);
  const lines = text.split('\n');
  let title = `Partea ${id}`;
  const cards = [];
  let cur = null;
  for (const l of lines) {
    let m;
    if ((m = l.match(/^# (.+)$/)) && !cards.length && !cur) { title = m[1].trim(); continue; }
    if ((m = l.match(/^## (.+)$/))) { cur = { title: m[1].trim(), studied: false, lines: [] }; cards.push(cur); continue; }
    if (!cur) continue;
    if (/^\s*<!--\s*studied\s*-->\s*$/.test(l) && !cur.lines.some((x) => x.trim())) { cur.studied = true; continue; }
    cur.lines.push(l);
  }
  const out = cards.map((c, n) => {
    const parts = [];
    let sec = 'intro', buf = [];
    const flush = () => { if (buf.join('').trim()) parts.push([sec, buf.join('\n')]); buf = []; };
    for (const l of c.lines) {
      const m = l.match(/^\*\*([^*]+?):?\*\*:?/);
      const key = m && SEC_BY_LABEL.get(norm(m[1].replace(/:$/, '')));
      if (key) { flush(); sec = key; }
      buf.push(l);
    }
    flush();
    const body = parts.map(([k, s]) => `<div data-sec="${k}">${restore(md(s), math, tables)}</div>`).join('\n');
    return { id: `c-${id}-${n + 1}`, title: restore(md(c.title).replace(/^<p>|<\/p>\s*$/g, ''), math, tables), studied: c.studied, body };
  });
  return { id, title: restore(esc(title), math, tables), cards: out };
}

const CSS = `:root{--bg:#fbfaf7;--fg:#1d2330;--mut:#5b6474;--card:#fff;--line:#d9dde5;--acc:#1f5fd1;--accbg:#e8f0fd;--ok:#1b7a43;--warn:#fff4d6;--warnl:#e0b84a;--code:#f0f2f6}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#14171d;--fg:#e6e9ef;--mut:#a0a8b6;--card:#1c2029;--line:#2f3542;--acc:#7fb0ff;--accbg:#1f2d47;--ok:#5fd18a;--warn:#3a3118;--warnl:#8a7330;--code:#252a35}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--fg);font:18px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;overflow-x:hidden}
a{color:var(--acc)}
header.top,main{max-width:760px;margin:0 auto;padding:0 16px}
header.top{padding-top:16px}
h1{font-size:1.7rem;margin:.2em 0}
.lead{color:var(--mut);margin:.3em 0 1em}
.bar{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:8px 16px}
.bar .in{max-width:760px;margin:0 auto}
.row{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}
.prog{flex:1 1 100%;font-size:.95rem;color:var(--mut)}
.track{height:10px;background:var(--line);border-radius:6px;overflow:hidden;margin-top:4px}
.fill{height:100%;width:0;background:var(--ok);transition:width .25s}
.sw{display:inline-flex;align-items:center;gap:8px;min-height:44px;cursor:pointer;font-weight:600}
.sw input{width:22px;height:22px}
.nav a{display:inline-flex;align-items:center;min-height:44px;padding:0 12px;border:1px solid var(--line);border-radius:10px;text-decoration:none;background:var(--card)}
.parttitle{font-size:1.35rem;margin:1.6em 0 .4em;scroll-margin-top:130px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:4px 14px 12px;margin:14px 0;scroll-margin-top:130px}
.card.done{border-color:var(--ok)}
.card h3{font-size:1.2rem;margin:.7em 0 .2em}
.tick{display:inline-flex;align-items:center;gap:10px;min-height:44px;cursor:pointer;color:var(--mut);font-size:.95rem}
.tick input{width:24px;height:24px}
[data-sec]>p:first-child>strong:first-child{color:var(--acc)}
[data-sec=capcana]{background:var(--warn);border-left:4px solid var(--warnl);padding:2px 12px;border-radius:8px;margin:.8em 0}
[data-sec=regula]{background:var(--accbg);padding:2px 12px;border-radius:8px;margin:.8em 0}
details{border:1px solid var(--line);border-radius:10px;margin:.5em 0;padding:0 12px}
summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:600;color:var(--acc)}
.tscroll,.mscroll{overflow-x:auto;max-width:100%;-webkit-overflow-scrolling:touch}
.mscroll{padding:4px 0}
.mscroll .katex-display{margin:.3em 0}
table{border-collapse:collapse;margin:.6em 0}th,td{border:1px solid var(--line);padding:6px 10px;text-align:left;white-space:nowrap}th{background:var(--code)}
code{background:var(--code);padding:1px 5px;border-radius:5px;overflow-wrap:anywhere}
pre{overflow-x:auto;background:var(--code);padding:10px;border-radius:8px}
li{margin:.3em 0}
img{max-width:100%}
body.blitz [data-sec=simboluri],body.blitz [data-sec=capcana],body.blitz [data-sec=incearca],body.blitz [data-sec=intro]{display:none}
.empty{padding:24px 0;color:var(--mut)}
footer{max-width:760px;margin:24px auto 60px;padding:0 16px}`;

const JS = `(function(){
var KEY='mlguide:v1',state={};
function load(){try{var s=localStorage.getItem(KEY);if(s)state=JSON.parse(s)||{}}catch(e){state={}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function pref(k,v){try{if(v===undefined)return localStorage.getItem('mlguide:'+k);localStorage.setItem('mlguide:'+k,v)}catch(e){return null}}
load();
var boxes=[].slice.call(document.querySelectorAll('input.tickbox'));
var total=boxes.length,txt=document.getElementById('progtxt'),fill=document.getElementById('fill');
function upd(){var n=0;boxes.forEach(function(b){if(b.checked)n++;b.closest('.card').classList.toggle('done',b.checked)});
 if(txt)txt.textContent=n+' din '+total+' carduri bifate';if(fill)fill.style.width=(total?100*n/total:0)+'%'}
boxes.forEach(function(b){var id=b.getAttribute('data-id'),st=b.getAttribute('data-studied')==='1';
 b.checked=(id in state)?!!state[id]:st;
 b.addEventListener('change',function(){state[id]=b.checked;save();upd()})});
var sw=document.getElementById('blitz');
if(sw){sw.checked=pref('blitz')==='1';document.body.classList.toggle('blitz',sw.checked);
 sw.addEventListener('change',function(){document.body.classList.toggle('blitz',sw.checked);pref('blitz',sw.checked?'1':'0')})}
upd();
})();`;

export function build({ src = path.join(ROOT, 'src/guides/ml'), out = path.join(ROOT, 'public/ml-ghid'), copyKatex = true } = {}) {
  const found = fs.existsSync(src) ? fs.readdirSync(src) : [];
  const parts = ORDER.filter((id) => found.includes(`part-${id}.md`)).map((id) => parsePart(path.join(src, `part-${id}.md`), id));
  const total = parts.reduce((n, p) => n + p.cards.length, 0);
  const nav = parts.map((p) => `<a href="#part-${p.id}">${esc(p.id)}</a>`).join('');
  const bodyHtml = parts.length
    ? parts.map((p) => `<h2 class="parttitle" id="part-${p.id}">${p.title}</h2>\n` + p.cards.map((c) => `<section class="card" id="${c.id}">
<h3>${c.title}</h3>
<label class="tick"><input type="checkbox" class="tickbox" data-id="${c.id}" data-studied="${c.studied ? 1 : 0}"> Bifat</label>
${c.body}
</section>`).join('\n')).join('\n')
    : '<p class="empty">Părțile ghidului vin în curând.</p>';
  const html = `<!doctype html>
<html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ghid rapid ML</title>
<link rel="stylesheet" href="katex/katex.min.css">
<style>${CSS}</style></head>
<body>
<div class="bar"><div class="in"><div class="row">
<div class="prog"><span id="progtxt">0 din ${total} carduri bifate</span><div class="track"><div class="fill" id="fill"></div></div></div>
<label class="sw"><input type="checkbox" id="blitz"> Blitz</label>
<nav class="row nav">${nav}</nav>
</div></div></div>
<header class="top"><h1>Ghid rapid ML</h1>
<p class="lead">Acoperă fiecare punct din lista profesorului. Mod Blitz: doar când vezi asta, regula și exemplul. <a href="/Ghid_Studii_AI/y2s1/ml">Înapoi la lecțiile ML</a></p></header>
<main>
${bodyHtml}
</main>
<footer><a href="/Ghid_Studii_AI/y2s1/ml">Înapoi la lecțiile ML</a></footer>
<script>${JS}</script>
</body></html>
`;
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), html);
  if (copyKatex) {
    const dist = path.join(path.dirname(require.resolve('katex/package.json')), 'dist');
    const dest = path.join(out, 'katex');
    fs.mkdirSync(path.join(dest, 'fonts'), { recursive: true });
    fs.copyFileSync(path.join(dist, 'katex.min.css'), path.join(dest, 'katex.min.css'));
    for (const f of fs.readdirSync(path.join(dist, 'fonts'))) fs.copyFileSync(path.join(dist, 'fonts', f), path.join(dest, 'fonts', f));
  }
  return { html, parts: parts.map((p) => p.id), cards: total };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? path.resolve(process.argv[i + 1]) : undefined; };
  try {
    const r = build({ src: arg('--src'), out: arg('--out') });
    console.log(`Ghid rapid ML: ${r.cards} cards from parts [${r.parts.join(', ')}]`);
  } catch (e) { console.error(e.message); process.exit(1); }
}
