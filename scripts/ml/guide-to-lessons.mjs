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
const pair = (s) => { const v = noItalics(plainQuotes(s)); return { en: v, ro: v }; };
// A sentence that followed a label ("**Regula:** entropia este...") starts its own card, so it starts with a capital.
const cap = (s) => s.replace(/^([a-zăâîșț])/, (c) => c.toUpperCase());
// The player's markdown has no italics: a word in *stars* (outside a formula) is set in bold instead of showing its stars.
const noItalics = (s) => {
  const math = [];
  const held = s.replace(/\$[^$]+\$/g, (m) => `\u0001${math.push(m) - 1}\u0001`);
  return held.replace(/(?<![*\w])\*(?![*\s])([^*]+?)(?<![\s*])\*(?![*\w])/g, '**$1**').replace(/\u0001(\d+)\u0001/g, (_, i) => math[i]);
};

// ---- markdown chunk -> neutral items ----------------------------------------------------------------------------------------
// {k:'p',text} a paragraph · {k:'p',item:'ol',n,text} a numbered list item · {k:'p',item:'ul',text} a bullet · {k:'eq',tex}
// a display formula · {k:'tb',head,rows} a table. A list item's indented continuation lines join the item.
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
      items.push(num ? { k: 'p', item: 'ol', n: Number(num[1]), text: num[2] } : { k: 'p', item: 'ul', text: dash[1] });
      continue;
    }
    if (/^\s/.test(line) && items.length && items[items.length - 1].item && !para.length) { items[items.length - 1].text += ' ' + t; continue; }
    para.push(t);
  }
  flush();
  return items;
}

// Items as one running text (a reflect prompt, a trap, and a reflect's plain `answer`, which the player shows only when the block has
// no answerSteps): paragraphs split by a blank line, list items by a line break (a number in bold, the player's markdown has no lists), a display formula stays $$..$$ inline, a table row becomes a line of cells.
function itemsToText(items) {
  const out = [];
  items.forEach((it, i) => {
    const prevItem = i > 0 && items[i - 1].item && it.item;
    const sep = i === 0 ? '' : prevItem ? '\n' : '\n\n';
    if (it.k === 'p') out.push(sep + (it.item === 'ol' ? `**${it.n}.** ` : it.item === 'ul' ? '– ' : '') + it.text);
    else if (it.k === 'eq') out.push(`${sep}$$${it.tex}$$`);
    else out.push(sep + [it.head, ...it.rows].map((r) => r.filter(Boolean).join(' ; ')).join('\n'));
  });
  return out.join('');
}

// The data of an example or a question as a static table (the question-table form, see choiceSpec.js). An empty cell (the corner
// of a joint table, the blanks of a "corecte" row) holds a zero-width space: the form wants text in every cell, the eye sees none.
const EMPTY_CELL = '\u200b';
const staticTable = (it) => ({ columns: it.head.map((c) => plainQuotes(c) || EMPTY_CELL), rows: it.rows.map((r) => r.map((c) => plainQuotes(c) || EMPTY_CELL)) });

// A run of non-numbered items as card parts: a paragraph, a bulleted list (consecutive bullets), a table, a formula.
// Two statements set side by side with \qquad ("overfitting: ... \qquad underfitting: ...") are stacked as two lines of the same
// formula panel: side by side they are half again as wide as a phone. Only a \qquad outside braces splits.
export function splitQquad(tex) {
  const out = [];
  let depth = 0, from = 0;
  for (let i = 0; i < tex.length; i++) {
    const ch = tex[i];
    if (ch === '\\' && tex[i + 1] && /[{}]/.test(tex[i + 1])) { i++; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (depth === 0 && tex.startsWith('\\qquad', i) && !/[a-zA-Z]/.test(tex[i + 6] || '')) { out.push(tex.slice(from, i)); from = i + 6; i += 5; }
  }
  out.push(tex.slice(from));
  return out.map((t) => t.trim()).filter(Boolean);
}

function partsOf(items) {
  const parts = [];
  for (const it of items) {
    if (it.k === 'eq') for (const tex of splitQquad(it.tex)) parts.push({ tex });
    else if (it.k === 'tb') parts.push({ table: staticTable(it) });
    else if (it.item) {
      const last = parts[parts.length - 1];
      const key = it.item === 'ol' ? 'steps' : 'points';
      if (last && last[key]) last[key].push(pair(it.text)); else parts.push({ [key]: [pair(it.text)] });
    } else parts.push({ text: pair(it.text) });
  }
  return parts;
}

// An example (or a worked answer) as groups, one per numbered list: { intro: items, items: [ol items], result: items }. The
// paragraphs between two lists are split: the last paragraph (and the tables or bullets after it) introduces the next list;
// any paragraph before it closes the previous list as its result. Paragraphs after the last list are its result.
export function groupsOf(items) {
  const runs = [];
  for (const it of items) {
    const ol = it.item === 'ol';
    const last = runs[runs.length - 1];
    if (last && last.ol === ol) last.items.push(it); else runs.push({ ol, items: [it] });
  }
  const groups = [];
  let lead = [];
  runs.forEach((run, ri) => {
    if (run.ol) { groups.push({ intro: lead, items: run.items, result: [] }); lead = []; return; }
    if (!groups.length || ri === runs.length - 1) { if (groups.length) groups[groups.length - 1].result = run.items; else lead = run.items; return; }
    let cut = run.items.length - 1;
    while (cut > 0 && run.items[cut].k !== 'p') cut--;
    while (cut > 0 && run.items[cut].k === 'p' && run.items[cut].item) cut--; // bullets belong to the paragraph above them
    groups[groups.length - 1].result = run.items.slice(0, cut);
    lead = run.items.slice(cut);
  });
  if (!groups.length && lead.length) groups.push({ intro: lead, items: [], result: [] });
  for (const g of groups) {
    // a result is a closing sentence; anything else after the steps (a table, a list) becomes an intro-only group after them
    if (g.result.some((it) => it.k !== 'p' || it.item)) { groups.splice(groups.indexOf(g) + 1, 0, { intro: g.result, items: [], result: [] }); g.result = []; }
  }
  return groups;
}

// ---- screen height at 390 px, estimated, so an example is cut where a phone would have to scroll far ----------------------
// Text width: a formula counts about half its source length, a fraction adds a line's worth of height.
const visible = (s) => s.replace(/\$([^$]+)\$/g, (_, tex) => 'x'.repeat(Math.ceil(tex.replace(/\\[a-zA-Z]+|[{}]/g, '').length * 0.9))).replace(/\*\*/g, '').length;
const fracs = (s) => (s.match(/\\d?frac/g) || []).length;
const textH = (s, perLine) => Math.ceil(visible(s) / perLine) * 25 + Math.min(fracs(s), 3) * 12;
const partH = (p) => (p.text ? textH(p.text.ro, 36) + 10
  : p.tex ? 56 + fracs(p.tex) * 14
  : p.note ? 24
  : p.points ? p.points.reduce((h, q) => h + textH(q.ro, 33) + 8, 0)
  : p.steps ? p.steps.reduce((h, q) => h + textH(q.ro, 31) + 12, 0)
  : p.heading ? 30
  : p.table ? (p.table.rows.length + 1) * 37 + 40 : 0);
const stepH = (q) => textH(q.ro, 31) + 12;
const CARD_H = 34; // a card's padding and its gap to the next block
const SCREEN_H = 640; // the most an example screen holds: about one phone screen and a half of the card
const MAX_STEPS = 5;

// One or more screens for an example: each screen a list of steps cards. A list longer than 5 is cut into even chunks (7 is 4 + 3)
// whose numbers carry on; a paragraph stays with the table or bullets right after it, and a list starts on a fresh screen unless
// all of it fits after the one before.
export function exampleScreens(groups) {
  const screens = [];
  let scr = null;
  let card = null;
  const newScreen = () => { scr = { cards: [], h: 0, n: 0 }; screens.push(scr); card = null; };
  const newCard = (start) => { card = { intro: [], items: [], start }; scr.cards.push(card); scr.h += CARD_H; };
  newScreen();
  groups.forEach((g, gi) => {
    const intro = partsOf(g.intro);
    if (gi === 0 && intro[0]?.text) intro[0] = { text: pair(cap(intro[0].text.ro)) }; // "**Exemplu:** apartamentele..." opens the card
    const steps = g.items.map((it) => ({ n: it.n, text: pair(it.text) }));
    const result = g.result.length ? pair(itemsToText(g.result)) : null;
    const chunk = steps.length ? Math.ceil(steps.length / Math.ceil(steps.length / MAX_STEPS)) : 0;
    // glue: a paragraph with the table or list after it
    const units = [];
    intro.forEach((p, i) => { if (i > 0 && (p.table || p.points) && intro[i - 1].text && units.length) units[units.length - 1].push(p); else units.push([p]); });
    const unitH = (u) => u.reduce((h, p) => h + partH(p), 0);
    // a list shares a screen with the one before it only when all of it fits there
    const groupH = units.reduce((h, u) => h + unitH(u), 0) + steps.reduce((h, q) => h + stepH(q.text), 0) + (result ? textH(result.ro, 34) + 30 : 0);
    if (scr.cards.length && (scr.h + CARD_H + groupH > SCREEN_H || scr.n + steps.length > MAX_STEPS)) newScreen();
    newCard(steps[0]?.n ?? 1);
    for (const u of units) {
      if (scr.h + unitH(u) > SCREEN_H && (card.intro.length || scr.cards.length > 1)) { newScreen(); newCard(steps[0]?.n ?? 1); }
      card.intro.push(...u);
      scr.h += unitH(u);
    }
    let inChunk = 0;
    steps.forEach((q, i) => {
      const h = stepH(q.text) + (i === steps.length - 1 && result ? textH(result.ro, 34) + 30 : 0);
      if (scr.n >= MAX_STEPS || inChunk >= chunk || (scr.h + h > SCREEN_H && card.items.length)) {
        // the steps read the example's tables, so a continued list shows them again above its steps
        newScreen(); newCard(q.n); inChunk = 0;
        for (const p of intro.filter((x) => x.table)) { card.intro.push(p); scr.h += partH(p); }
      }
      if (!card.items.length) card.start = q.n;
      card.items.push(q.text);
      scr.h += h; scr.n++; inChunk++;
    });
    if (result) card.result = result;
  });
  return screens.map((s) => s.cards.map((c) => {
    const b = { type: 'steps' };
    if (c.intro.length) b.intro = c.intro;
    if (c.items.length) { b.items = c.items; if (c.start !== 1) b.start = c.start; }
    if (c.result) b.result = c.result;
    return b;
  }));
}

// The answer of a worked problem as steps groups (ReflectBlock's answerSteps).
function answerSteps(items) {
  return groupsOf(items).map((g) => {
    const out = {};
    if (g.intro.length) out.intro = partsOf(g.intro);
    if (g.items.length) { out.items = g.items.map((it) => pair(it.text)); if (g.items[0].n !== 1) out.start = g.items[0].n; }
    if (g.result.length) out.result = pair(itemsToText(g.result));
    return out;
  });
}

// A rule as one card: its first sentence, then formulas, the short lines that qualify them (a condition, "Echivalent:"),
// paragraphs and lists, in the order written.
const NOTE_MAX = 90;
function ruleBlock(items, label) {
  const [first, ...rest] = items;
  if (!first || first.k !== 'p' || first.item) throw new Error('a rule must start with its sentence: ' + JSON.stringify(first).slice(0, 80));
  const body = partsOf(rest).map((p, i, all) => {
    const nearTex = all[i - 1]?.tex !== undefined || all[i + 1]?.tex !== undefined;
    return p.text && nearTex && p.text.ro.length <= NOTE_MAX ? { note: p.text } : p;
  });
  const b = { type: 'rule' };
  if (label) b.label = pair(label);
  b.text = pair(cap(first.text));
  if (body.length) b.body = body;
  return b;
}

const estimate = (b) => CARD_H + (b.type === 'rule' ? textH(b.text.ro, 34) + (b.body || []).reduce((h, p) => h + partH(p), 0)
  : b.type === 'steps' ? (b.intro || []).reduce((h, p) => h + partH(p), 0) : textH(b.content.ro, 36));

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

// A rule too long for one screen is cut at part boundaries: its sentence and first parts stay in the rule card, the rest goes on
// the next screens as plain cards. A formula run (formulas and their condition lines) is never cut, nor a line ending in ":"
// from the list or formula it introduces; one long list is cut in half. Returns null when nothing can be cut.
function splitRule(rule, roomFirst) {
  const body = [...(rule.body || [])];
  const last = body[body.length - 1];
  if (body.length === 1 && last.points?.length >= 6) {
    const half = Math.ceil(last.points.length / 2);
    body.splice(0, 1, { points: last.points.slice(0, half) }, { points: last.points.slice(half) });
  }
  const units = [];
  body.forEach((p, i) => {
    const prev = body[i - 1];
    const glued = prev && (((p.tex || p.note) && (prev.tex || prev.note)) || (prev.text && /:$/.test(prev.text.ro) && (p.tex || p.points || p.steps)));
    if (glued) units[units.length - 1].push(p); else units.push([p]);
  });
  if (units.length < 2) return null;
  const chunks = [[]];
  let h = 0, room = roomFirst;
  for (const u of units) {
    const uh = u.reduce((n, p) => n + partH(p), 0);
    if (chunks[chunks.length - 1].length && h + uh > room) { chunks.push([]); h = 0; room = SCREEN_H * 0.85; }
    chunks[chunks.length - 1].push(...u);
    h += uh;
  }
  if (chunks.length < 2) return null;
  return { head: { ...rule, body: chunks[0] }, rests: chunks.slice(1).map((intro) => ({ type: 'steps', variant: 'rule', intro })) };
}
const FITS = SCREEN_H;
const fits = (blocks) => blocks.reduce((h, b) => h + estimate(b), 0) <= FITS;

// A fraction in a line of text is set at full size (\dfrac), as part 1a writes it: a text-size \frac shrinks its digits to
// about two thirds and reads cramped next to the words. Display formulas (tex) are full size already and a table cell keeps
// its row height, so both are left alone, and so is an explicit \tfrac.
const bigFracs = (s) => s.replace(/(^|[^\\$])\$([^$\n]+?)\$/g, (m, pre, tex) => `${pre}$${tex.replace(/\\frac(?![a-zA-Z])/g, '\\dfrac')}$`);
function typeset(v, key) {
  if (key === 'table' || key === 'tex') return v;
  if (typeof v === 'string') return bigFracs(v);
  if (Array.isArray(v)) return v.map((x) => typeset(x));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeset(x, k)]));
  return v;
}

// ---- lessons -------------------------------------------------------------------------------------------------------------
// Ghid (ml-g<part>): an overview of the part's cards, then per card: when you see it + its symbols, the example (5 steps a
// screen at most, continued), the rule with its trap, one screen per problem. Blitz (ml-b<part>): per card, when you see it +
// the rule, then the example.
function lessonOf(kind, part, ptitle, cards) {
  const id = `ml-${kind}${part}`;
  const title = kind === 'g' ? `Ghid rapid ${part}: ${ptitle}` : `Blitz ${part}: ${ptitle}`;
  const steps = [];
  let rn = 0;
  // A screen's title is its card's name; the small line above it (the kicker) says which theme and what part of it:
  // "Tema 2 din 5" on the card's first screen, then "Tema 2 · Exemplu", "Tema 2 · Regula", "Tema 2 · Încearcă tu, 1 din 2".
  const step = (stitle, blocks, kicker) => steps.push({ id: `${id}-s${steps.length + 1}`, title: pair(stitle), ...(kicker ? { kicker: pair(kicker) } : {}), blocks: blocks.map(typeset) });
  const kick = (c, what) => `Tema ${cards.indexOf(c) + 1}${what ? ` · ${what}` : ` din ${cards.length}`}`;
  const whenText = (c) => cap(parseItems(c.sections['Când vezi asta']).map((i) => i.text ?? '').join(' ').trim());
  const exampleSteps = (c) => exampleScreens(groupsOf(parseItems(c.sections['Exemplu'])))
    .forEach((blocks, i) => step(c.title, blocks, kick(c, i ? 'Exemplu, continuare' : 'Exemplu')));
  // before: the blocks that share the rule's first screen (the Blitz trigger); trap: the Ghid's warning, after the rule
  const ruleScreens = (c, before, rule, trap) => {
    const first = before.length ? kick(c) : kick(c, 'Regula');
    const all = [...before, rule, ...(trap ? [trap] : [])];
    if (fits(all)) { step(c.title, all, first); return; }
    // a trap alone on a screen is a thin screen: it stays under the rule unless that makes a long scroll
    const withTrap = (blocks) => blocks.reduce((h, b) => h + estimate(b), 0) <= SCREEN_H * 1.25;
    const room = SCREEN_H - before.reduce((h, b) => h + estimate(b), 0) - CARD_H - textH(rule.text.ro, 34);
    const cut = fits([...before, rule]) ? null : splitRule(rule, Math.max(room, SCREEN_H * 0.3));
    // a short remainder (one paragraph, a short list) is read with the rule rather than alone on a thin screen of its own
    const rest = cut ? cut.rests.reduce((h, b) => h + estimate(b), 0) : 0;
    const short = cut && cut.rests.length === 1 && rest <= SCREEN_H * 0.32 && all.reduce((h, b) => h + estimate(b), 0) <= SCREEN_H * 1.1;
    if (!cut || short) {
      if (trap && withTrap(all)) { step(c.title, all, first); return; }
      step(c.title, [...before, rule], first); if (trap) step(c.title, [trap], kick(c, 'Capcana')); return;
    }
    step(c.title, [...before, cut.head], first);
    cut.rests.forEach((rest, i) => {
      const lastOne = i === cut.rests.length - 1;
      if (lastOne && trap && withTrap([rest, trap])) { step(c.title, [rest, trap], kick(c, 'Regula, continuare')); trap = null; }
      else step(c.title, [rest], kick(c, 'Regula, continuare'));
    });
    if (trap) step(c.title, [trap], kick(c, 'Capcana'));
  };
  if (kind === 'g') {
    step(cap(ptitle), [{ type: 'steps', intro: [{ heading: pair('Ce vei putea face') }], items: cards.map((c) => pair(c.title)) }]);
  }
  for (const c of cards) {
    const S = c.sections;
    if (kind === 'b') {
      ruleScreens(c, [{ type: 'rule', variant: 'when', label: pair('Când vezi asta'), text: pair(whenText(c)) }], ruleBlock(parseItems(S['Regula']), 'Regula'), null);
      exampleSteps(c);
      continue;
    }
    const symbols = [{ heading: pair('Simboluri') }, ...partsOf(parseItems(S['Simboluri']))];
    const when = { type: 'rule', variant: 'when', label: pair('Când vezi asta'), text: pair(whenText(c)) };
    // a long list of symbols gets its own screen rather than a long scroll under the trigger
    if (fits([{ ...when, body: symbols }])) step(c.title, [{ ...when, body: symbols }], kick(c));
    else { step(c.title, [when], kick(c)); step(c.title, [{ type: 'steps', intro: symbols }], kick(c, 'Simboluri')); }
    exampleSteps(c);
    const rule = ruleBlock(parseItems(S['Regula']));
    const trap = { type: 'callout', variant: 'warning', content: pair(`**Capcana:** ${itemsToText(parseItems(S['Capcana']))}`.trim()) };
    ruleScreens(c, [], rule, trap);
    const probs = problems(S['Încearcă tu']);
    probs.forEach((p, i) => {
      let items = parseItems(p.prompt);
      // a prompt written as "1. ..." is numbered by its screen's kicker ("Încearcă tu, 1 din 2"), not by a list of one
      if (items.length === 1 && items[0].item === 'ol') items = [{ k: 'p', text: items[0].text }];
      // the reflect block draws its tables under the question, so the line that introduced a table ("Tabelul comun:") becomes
      // that table's caption (a caption is plain text: a line with a formula stays in the question) instead of a dangling line
      const tables = [];
      const text = [];
      let spare = items.filter((it) => it.k !== 'tb').length - 1; // lines the question can give up and still say something
      items.forEach((it, j) => {
        if (it.k !== 'tb') { text.push(it); return; }
        const tb = staticTable(it);
        const prev = text[text.length - 1];
        if (prev && items[j - 1] === prev && prev.k === 'p' && !prev.item && /:$/.test(prev.text) && !/[$*`]/.test(prev.text) && spare > 0) { spare--; text.pop(); tb.caption = pair(prev.text.replace(/:$/, '')); }
        tables.push(tb);
      });
      const ans = parseItems(p.answer);
      const block = { type: 'reflect', id: `${id}-r${++rn}`, prompt: pair(itemsToText(text)), answer: pair(itemsToText(ans)), answerSteps: answerSteps(ans) };
      if (tables.length) block.table = tables;
      step(c.title, [block], kick(c, `Încearcă tu${probs.length > 1 ? `, ${i + 1} din ${probs.length}` : ''}`));
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
  // the ten one-line course entries, in the order g1a b1a g1b b1b g2 b2 ..., replaced in place in src/content/ml/index.js
  const lines = PARTS.flatMap((p) => [`g${p}`, `b${p}`]).map((k) => {
    const { l, file } = courses[`ml-${k}`];
    return `    { id: ${JSON.stringify(l.meta.id)}, title: ${JSON.stringify(l.meta.title)}, shortTitle: ${JSON.stringify(l.meta.shortTitle)}, sectionCount: ${l.steps.length}, metaId: ${JSON.stringify(l.meta.id)}, src: "ml/courses/${file}" },`;
  });
  const indexFile = path.join(ROOT, 'src/content/ml/index.js');
  const index = fs.readFileSync(indexFile, 'utf8').split('\n');
  const at = index.findIndex((ln) => ln.startsWith('    { id: "ml-g1a"'));
  if (at < 0 || !index[at + lines.length - 1].startsWith('    { id: "ml-b4"')) throw new Error('index.js: the ten guide entries are not where expected');
  index.splice(at, lines.length, ...lines);
  fs.writeFileSync(indexFile, index.join('\n'));
}
