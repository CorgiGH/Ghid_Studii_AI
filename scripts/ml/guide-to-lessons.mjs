// Turns the Ghid rapid ML part files (src/guides/ml/part-*.md) into lesson-player lessons: for each part a full lesson
// (ml-g<part>) and a blitz lesson (ml-b<part>). Content is converted, never retyped. Run: node scripts/ml/guide-to-lessons.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const GUIDES = path.join(ROOT, 'src/guides/ml');
const OUT = path.join(ROOT, 'src/content/ml/courses');
const PARTS = ['1a', '1b', '2', '3', '4'];

// the content gate (T1) writes Romanian quotes as plain "…": „ and ” become "
const plainQuotes = (s) => s.replace(/[„”“]/g, '"');
const pair = (s) => ({ en: plainQuotes(s), ro: plainQuotes(s) });
const wordCount = (s) => (s.match(/\S+/g) || []).length;

// ---- markdown chunk -> neutral items: {k:'p',text} {k:'eq',tex} {k:'tb',head,rows} ---------------------------------------
// A list item becomes its own paragraph: a number turns into a bold "1." (not a markdown list), a dash into an en dash.
export function parseItems(md) {
  const lines = md.replace(/\r/g, '').split('\n');
  const items = [];
  let para = [];
  const flush = () => { if (para.length) { items.push({ k: 'p', text: para.join(' ').trim() }); para = []; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (!t) { flush(); continue; }
    if (t.startsWith('$$')) {
      flush();
      let buf = t;
      while (!(buf.length > 2 && buf.endsWith('$$')) && i + 1 < lines.length) buf += '\n' + lines[++i];
      items.push({ k: 'eq', tex: buf.replace(/^\$\$\s*/, '').replace(/\s*\$\$$/, '').trim() });
      continue;
    }
    if (t.startsWith('|')) {
      flush();
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i].trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
        if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells);
        i++;
      }
      i--;
      items.push({ k: 'tb', head: rows[0], rows: rows.slice(1) });
      continue;
    }
    const num = t.match(/^(\d+)[.)]\s+(.*)$/);
    const dash = t.match(/^[-*]\s+(.*)$/);
    if (num || dash) {
      flush();
      items.push({ k: 'p', text: num ? `**${num[1]}.** ${num[2]}` : `– ${dash[1]}`, item: true });
      continue;
    }
    if (/^\s/.test(line) && items.length && items[items.length - 1].item && !para.length) { items[items.length - 1].text += ' ' + t; continue; }
    para.push(t);
  }
  flush();
  return items;
}

// Items as one running text (a reflect prompt or answer is a single string): paragraphs split by a blank line, list items by a
// line break, a display formula stays $$..$$ inline, a table row becomes a line of cells.
function itemsToText(items) {
  const out = [];
  items.forEach((it, i) => {
    const prevItem = i > 0 && items[i - 1].item && it.item;
    const sep = i === 0 ? '' : prevItem ? '\n' : '\n\n';
    if (it.k === 'p') out.push(sep + it.text);
    else if (it.k === 'eq') out.push(`${sep}$$${it.tex}$$`);
    else out.push(sep + [it.head, ...it.rows].map((r) => r.filter(Boolean).join(' ; ')).join('\n'));
  });
  return out.join('');
}

const tableBlock = (it) => ({ type: 'table', headers: it.head.map(pair), rows: it.rows.map((r) => r.map(pair)) });
function toBlocks(items) {
  return items.map((it) => (it.k === 'p' ? { type: 'learn', content: pair(it.text) } : it.k === 'eq' ? { type: 'equation', tex: it.tex } : tableBlock(it)));
}

// ---- part file -> cards ---------------------------------------------------------------------------------------------------
const LABELS = ['Când vezi asta', 'Simboluri', 'Exemplu', 'Regula', 'Capcana', 'Încearcă tu'];
export function parseCards(md) {
  const [head, ...cardsRaw] = md.split(/^## /m);
  const h = head.match(/^# Partea (\w+): (.*)$/m);
  const cards = cardsRaw.map((raw) => {
    const nl = raw.indexOf('\n');
    const title = raw.slice(0, nl).trim();
    let body = raw.slice(nl + 1);
    const studied = /<!--\s*studied\s*-->/.test(body);
    body = body.replace(/<!--\s*studied\s*-->\n?/, '');
    const sections = {};
    let cur = null;
    for (const line of body.split('\n')) {
      const m = line.match(/^\*\*([^*:]+):\*\*\s*(.*)$/);
      if (m && LABELS.includes(m[1])) { cur = m[1]; sections[cur] = m[2] + '\n'; continue; }
      if (cur) sections[cur] += line + '\n';
    }
    for (const l of LABELS) if (sections[l] === undefined) throw new Error(`card "${title}" has no "${l}"`);
    return { title, studied, sections };
  });
  return { part: h[1], ptitle: h[2].trim(), cards };
}

function problems(section) {
  const out = [];
  const re = /<details>\s*<summary>[^<]*<\/summary>([\s\S]*?)<\/details>/g;
  let last = 0, m;
  while ((m = re.exec(section))) {
    out.push({ prompt: section.slice(last, m.index), answer: m[1] });
    last = re.lastIndex;
  }
  if (section.slice(last).trim()) throw new Error('text after the last answer: ' + section.slice(last).slice(0, 60));
  return out;
}

// ---- lessons -------------------------------------------------------------------------------------------------------------
function lessonOf(kind, part, ptitle, cards) {
  const id = `ml-${kind}${part}`;
  const title = kind === 'g' ? `Ghid rapid ${part}: ${ptitle}` : `Blitz ${part}: ${ptitle}`;
  const steps = [];
  let rn = 0;
  const step = (stitle, blocks) => steps.push({ id: `${id}-s${steps.length + 1}`, title: pair(stitle), blocks });
  const ruleBlocks = (items) => {
    const blocks = toBlocks(items);
    const first = blocks[0];
    if (first && first.type === 'learn') { blocks[0] = { type: 'definition', term: pair('Regula'), content: first.content }; return blocks; }
    return [{ type: 'definition', term: pair('Regula'), content: pair('Reține formula:') }, ...blocks];
  };
  for (const c of cards) {
    const S = c.sections;
    const when = { type: 'learn', content: pair(`**Când vezi asta:** ${parseItems(S['Când vezi asta']).map((i) => i.text ?? '').join(' ')}`.trim()) };
    const exItems = parseItems(S['Exemplu']);
    if (kind === 'b') {
      step(c.title, [when, ...ruleBlocks(parseItems(S['Regula']))]);
      step(`${c.title}: Exemplu`, toBlocks(exItems));
      continue;
    }
    step(c.title, [when, { type: 'learn', content: pair('**Simboluri:**') }, ...toBlocks(parseItems(S['Simboluri']))]);
    const words = exItems.reduce((n, it) => n + (it.text ? wordCount(it.text) : 0), 0);
    const steps6 = exItems.filter((it) => it.item).length;
    if ((words > 120 || steps6 > 6) && exItems.length > 1) {
      // split at the paragraph boundary nearest to half of the words
      let acc = 0, cut = 1, best = Infinity;
      for (let i = 0; i < exItems.length - 1; i++) {
        acc += exItems[i].text ? wordCount(exItems[i].text) : 4;
        const nextIsListItem = exItems[i + 1].item && exItems[i].item;
        const d = Math.abs(acc - words / 2) + (nextIsListItem ? 15 : 0);
        if (d < best) { best = d; cut = i + 1; }
      }
      step(`${c.title}: Exemplu, partea 1`, toBlocks(exItems.slice(0, cut)));
      step(`${c.title}: Exemplu, partea 2`, toBlocks(exItems.slice(cut)));
    } else step(`${c.title}: Exemplu`, toBlocks(exItems));
    step(`${c.title}: Regula`, [...ruleBlocks(parseItems(S['Regula'])), { type: 'callout', variant: 'trap', content: pair(`**Capcana:** ${itemsToText(parseItems(S['Capcana']))}`.trim()) }]);
    const probs = problems(S['Încearcă tu']);
    probs.forEach((p, i) => {
      const items = parseItems(p.prompt);
      const tables = items.filter((it) => it.k === 'tb');
      const block = { type: 'reflect', id: `${id}-r${++rn}`, prompt: pair(itemsToText(items.filter((it) => it.k !== 'tb'))), answer: pair(itemsToText(parseItems(p.answer))) };
      if (tables.length) block.table = tables.map((tb) => ({ columns: tb.head.map((c) => c || '·'), rows: tb.rows.map((r) => r.map((c) => c || '·')) }));
      step(`${c.title}: Încearcă tu${probs.length > 1 ? ` ${i + 1}` : ''}`, [block]);
    });
  }
  return {
    meta: { id, kind: 'guide', title: pair(title), shortTitle: pair(`${kind === 'g' ? 'Ghid' : 'Blitz'} ${part}`), source: pair('Ghid rapid ML, UAIC FII') },
    steps,
  };
}

export function convert(mdText) {
  const { part, ptitle, cards } = parseCards(mdText);
  return [lessonOf('g', part, ptitle, cards), lessonOf('b', part, ptitle, cards)];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const courses = {};
  for (const p of PARTS) {
    const lessons = convert(fs.readFileSync(path.join(GUIDES, `part-${p}.md`), 'utf8'));
    for (const l of lessons) {
      const file = `guide-${l.meta.id.slice(3)}.json`;
      fs.writeFileSync(path.join(OUT, file), JSON.stringify(l, null, 2) + '\n');
      courses[l.meta.id] = { l, file };
      console.log(l.meta.id, l.steps.length);
    }
  }
  // the ten one-line course entries, in the order g1a b1a g1b b1b g2 b2 ...
  const lines = PARTS.flatMap((p) => [`g${p}`, `b${p}`]).map((k) => {
    const { l, file } = courses[`ml-${k}`];
    return `    { id: ${JSON.stringify(l.meta.id)}, title: ${JSON.stringify(l.meta.title)}, shortTitle: ${JSON.stringify(l.meta.shortTitle)}, sectionCount: ${l.steps.length}, metaId: ${JSON.stringify(l.meta.id)}, src: "ml/courses/${file}" },`;
  });
  fs.writeFileSync(path.join(ROOT, '.scratch-guide-courses.txt'), lines.join('\n') + '\n');
}
