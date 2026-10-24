// Pass 4: Oracle (+) outer join -> ANSI LEFT/RIGHT JOIN (single query block, comma FROM, AND-only WHERE).
import { isSig, isSym, isSymbol, isWord, nextSig, raw, splitTop, trimSpace, untokenize } from './tokens.js'

function hasPlus(ts) { for (let i = 0; i + 2 < ts.length; i++) { if (ts[i].text === '(') { const a = nextSig(ts, i); const b = a >= 0 ? nextSig(ts, a) : -1; if (a >= 0 && b >= 0 && ts[a].text === '+' && ts[b].text === ')') return true; } } return false; }

function depth0Index(ts, pred, from = 0) { let d = 0; for (let i = from; i < ts.length; i++) { const x = ts[i]; if (isSym(x, '(')) d++; else if (isSym(x, ')')) d--; else if (d === 0 && pred(x, i)) return i; } return -1; }

function convertBlock(ts, notes) {
  // ts = one SELECT block (no set operators at depth 0)
  const fromI = depth0Index(ts, (x) => isWord(x, 'FROM'));
  const whereI = depth0Index(ts, (x) => isWord(x, 'WHERE'));
  if (fromI < 0 || whereI < 0 || !hasPlus(ts.slice(whereI))) return ts;
  const tailI = depth0Index(ts, (x) => isWord(x, 'GROUP') || isWord(x, 'ORDER') || isWord(x, 'HAVING') || isWord(x, 'CONNECT'), whereI + 1);
  const head = ts.slice(0, fromI + 1);
  const fromT = ts.slice(fromI + 1, whereI);
  const whereT = ts.slice(whereI + 1, tailI < 0 ? ts.length : tailI);
  const tail = tailI < 0 ? [] : ts.slice(tailI);
  if (depth0Index(fromT, (x) => isWord(x, 'JOIN')) >= 0) { notes.push('(+) mixed with ANSI JOIN: not converted'); return ts; }
  if (depth0Index(whereT, (x) => isWord(x, 'OR')) >= 0) { notes.push('(+) with OR: not converted (Oracle rejects it too: ORA-01719)'); return ts; }
  const items = splitTop(fromT).map(trimSpace).map((it) => it.filter(isSig));
  const tables = [];
  for (const it of items) {
    const ws = it.filter((x) => x.type === 'word' || x.type === 'qident');
    if (it.length !== ws.length || ws.length < 1 || ws.length > 3) { notes.push('(+) with non-trivial FROM item: not converted'); return ts; }
    const name = ws[0].text; const alias = ws.length === 1 ? name : ws[ws.length - 1].text;
    tables.push({ name, alias, key: alias.toUpperCase(), text: ws.map((x) => x.text).join(' ') });
  }
  // split WHERE into AND conjuncts (BETWEEN .. AND .. kept together)
  const conj = [[]]; let d = 0, between = 0;
  for (const x of whereT) {
    if (isSym(x, '(')) d++; if (isSym(x, ')')) d--;
    if (d === 0 && isWord(x, 'BETWEEN')) between++;
    if (d === 0 && isWord(x, 'AND')) { if (between > 0) between--; else { conj.push([]); continue; } }
    conj[conj.length - 1].push(x);
  }
  const plain = []; const outer = [];   // outer: {def, pres:Set, text}
  for (const cj of conj) {
    const sig = cj.filter(isSig);
    if (!hasPlus(sig)) { plain.push(untokenize(cj).trim()); continue; }
    const defs = new Set(); const refs = new Set(); const cleaned = [];
    for (let i = 0; i < cj.length; i++) {
      const x = cj[i];
      if (x.text === '(' ) { const a = nextSig(cj, i); const b = a >= 0 ? nextSig(cj, a) : -1; if (a >= 0 && b >= 0 && cj[a].text === '+' && cj[b].text === ')') {
        // deficient column = the qualified id right before
        let j = cleaned.length - 1; while (j >= 0 && !isSig(cleaned[j])) j--;
        let k = j - 1; while (k >= 0 && !isSig(cleaned[k])) k--;
        const dot = cleaned[k]; let m = k - 1; while (m >= 0 && !isSig(cleaned[m])) m--;
        if (!(dot && dot.text === '.' && cleaned[m] && !isSymbol(cleaned[m]))) { notes.push('(+) on an unqualified column: not converted'); return ts; }
        defs.add(cleaned[m].text.toUpperCase()); i = b; continue; } }
      cleaned.push(x);
    }
    for (let i = 0; i + 2 < cleaned.length; i++) { if (cleaned[i].type === 'word' && cleaned[i + 1].text === '.' && cleaned[i + 2].type === 'word') refs.add(cleaned[i].text.toUpperCase()); }
    if (defs.size !== 1) { notes.push('(+) on several tables in one condition: not converted'); return ts; }
    const def = [...defs][0]; refs.delete(def);
    outer.push({ def, pres: refs, text: untokenize(cleaned).trim() });
  }
  const keyOf = (a) => tables.findIndex((t) => t.key === a);
  const defKeys = [...new Set(outer.map((o) => o.def))];
  for (const dk of defKeys) { if (keyOf(dk) < 0) { notes.push('(+) alias not in FROM: not converted'); return ts; } }
  // each deficient table needs exactly one preserved parent
  const parent = {}; const conds = {};
  for (const o of outer) {
    (conds[o.def] ||= []).push(o.text);
    for (const p of o.pres) { if (parent[o.def] && parent[o.def] !== p) { notes.push('(+) table joined to two preserved tables: not converted'); return ts; } parent[o.def] = p; }
  }
  const rootStr = {}; const owner = {};   // alias -> root key
  tables.forEach((t) => { rootStr[t.key] = t.text; owner[t.key] = t.key; });
  const done = new Set(); let guard = 0;
  while (done.size < defKeys.length && guard++ < 20) {
    for (const dk of defKeys) {
      if (done.has(dk)) continue;
      const pk = parent[dk];
      if (pk && defKeys.includes(pk) && !done.has(pk)) continue;      // parent not yet attached
      const on = conds[dk].join(' AND ');
      const droot = owner[dk]; const dt = tables[keyOf(dk)];
      if (!pk) { rootStr[dt.key] = `${rootStr[dt.key]}`; /* constant-only condition: attach to first table */ }
      const proot = pk ? owner[pk] : tables.find((t) => !defKeys.includes(t.key)).key;
      const dIdx = keyOf(dk), pIdx = keyOf(proot);
      const dStr = rootStr[droot];
      if (dIdx < pIdx && owner[pk] === pk && droot === dt.key && Object.values(owner).filter((v) => v === pk).length === 1) {
        rootStr[proot] = `${dStr} RIGHT JOIN ${rootStr[proot]} ON ${on}`;      // keeps the FROM column order of Oracle
      } else {
        rootStr[proot] = `${rootStr[proot]} LEFT JOIN ${dStr} ON ${on}`;
      }
      owner[dk] = proot; for (const k of Object.keys(owner)) if (owner[k] === droot && k !== proot) owner[k] = proot;
      delete rootStr[droot === proot ? '' : droot]; done.add(dk);
    }
  }
  const roots = tables.filter((t) => owner[t.key] === t.key).map((t) => rootStr[t.key]);
  const out = head.concat([raw(' ' + roots.join(', '))]);
  if (plain.length) out.push(raw(' WHERE ' + plain.join(' AND ')));
  if (tail.length) out.push(raw(' '), ...tail);
  notes.push('(+) rewritten to ANSI outer join');
  return out;
}

const SET_WORDS = ['UNION', 'INTERSECT', 'EXCEPT', 'MINUS']
// MINUS has already become a raw EXCEPT when this pass runs
const isSetOp = (x) => (x.type === 'word' || x.type === 'raw') && SET_WORDS.includes(x.text.toUpperCase())

// One nesting level: every parenthesised group is converted first (a subquery, a set-operator arm in parentheses), then
// the level is cut at its depth-0 set operators and each SELECT block is converted on its own. The whitespace around
// a block and the set operators between the blocks are kept as they were.
function convertLevel(ts, notes) {
  const flat = [];
  for (let i = 0; i < ts.length; i++) {
    if (isSym(ts[i], '(')) {
      let d = 0, c = -1;
      for (let j = i; j < ts.length; j++) { if (isSym(ts[j], '(')) d++; else if (isSym(ts[j], ')') && --d === 0) { c = j; break; } }
      if (c > 0) { flat.push(ts[i], ...convertLevel(ts.slice(i + 1, c), notes), ts[c]); i = c; continue; }
    }
    flat.push(ts[i]);
  }
  const out = []; let blockStart = 0; let d = 0;
  const flush = (end) => {
    const block = flat.slice(blockStart, end);
    const core = trimSpace(block);
    const a = block.indexOf(core[0]);
    const startsQuery = core.length && (isWord(core.find(isSig), 'SELECT') || isWord(core.find(isSig), 'WITH'));
    out.push(...block.slice(0, a), ...(startsQuery ? convertBlock(core, notes) : core), ...block.slice(a + core.length));
  };
  for (let i = 0; i < flat.length; i++) {
    const x = flat[i];
    if (isSym(x, '(')) d++; else if (isSym(x, ')')) d--;
    if (d === 0 && isSetOp(x)) {
      flush(i); out.push(x); blockStart = i + 1;
      const n = nextSig(flat, i);
      if (isWord(x, 'UNION') && n >= 0 && isWord(flat[n], 'ALL')) { for (let j = i + 1; j <= n; j++) out.push(flat[j]); blockStart = n + 1; i = n; }
    }
  }
  flush(flat.length);
  return out;
}

export function outerJoinPass(ts, notes) {
  if (!hasPlus(ts)) return ts;
  return convertLevel(ts, notes);
}
