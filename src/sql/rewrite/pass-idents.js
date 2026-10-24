// Identifier pass: a NATURAL JOIN column used with a qualifier is ORA-25155 in Oracle; PostgreSQL silently accepts it.
import { isSig, isSym, isWord, matchParen, splitTop } from './tokens.js'
import { OracleError } from '../engine/errors.js'

// Columns of the dataset tables (lowercase), needed to know which columns a NATURAL JOIN merges.
export const SCHEMA = {
  studenti: ['nr_matricol', 'nume', 'prenume', 'an', 'grupa', 'bursa', 'data_nastere'],
  cursuri: ['id_curs', 'titlu_curs', 'an', 'semestru', 'credite'],
  note: ['nr_matricol', 'id_curs', 'valoare', 'data_notare'],
  profesori: ['id_prof', 'nume', 'prenume', 'grad_didactic'],
  didactic: ['id_prof', 'id_curs'],
}

// Throws OracleError when a qualified common column is used; returns nothing otherwise.
export function naturalJoinCheck(ts) {
  const sig = ts.filter(isSig);
  if (!sig.some((x, i) => isWord(x, 'NATURAL') && isWord(sig[i + 1], 'JOIN'))) return;
  const tabs = [];       // {name, alias}
  for (let i = 0; i < sig.length; i++) {
    if ((isWord(sig[i], 'FROM') || isWord(sig[i], 'JOIN')) && sig[i + 1] && sig[i + 1].type === 'word' && SCHEMA[sig[i + 1].text.toLowerCase()]) {
      const name = sig[i + 1].text.toLowerCase(); let alias = name; const a = sig[i + 2];
      if (a && a.type === 'word' && !['JOIN', 'NATURAL', 'ON', 'WHERE', 'LEFT', 'RIGHT', 'FULL', 'INNER', 'CROSS', 'ORDER', 'GROUP', 'UNION', 'EXCEPT', 'INTERSECT', 'USING'].includes(a.text.toUpperCase())) alias = a.text.toLowerCase();
      tabs.push({ name, alias });
    }
  }
  const count = {}; tabs.forEach((t) => SCHEMA[t.name].forEach((c) => (count[c] = (count[c] || 0) + 1)));
  const common = new Set(Object.keys(count).filter((c) => count[c] > 1));
  const quals = new Set(tabs.flatMap((t) => [t.alias, t.name]));
  for (let i = 0; i + 2 < sig.length; i++) {
    if (sig[i].type === 'word' && sig[i + 1].text === '.' && sig[i + 2].type === 'word' && quals.has(sig[i].text.toLowerCase()) && common.has(sig[i + 2].text.toLowerCase()))
      throw new OracleError('ORA-25155', 'column used in NATURAL join cannot have qualifier');
  }
}


const FROM_STOP = new Set(['JOIN', 'NATURAL', 'ON', 'WHERE', 'LEFT', 'RIGHT', 'FULL', 'INNER', 'CROSS', 'OUTER', 'ORDER', 'GROUP', 'HAVING', 'UNION', 'EXCEPT', 'INTERSECT', 'MINUS', 'USING', 'CONNECT', 'START', 'FOR'])

// Names the query block ts[s, e) can qualify a column with: the table name, or its alias when it has one. Only the block's
// own FROM / JOIN items count (depth 0 of the slice), not those of the subqueries inside it.
function tableQualifiers(ts, s, e) {
  const names = new Set()
  let depth = 0
  for (let i = s; i < e; i++) {
    if (isSym(ts[i], '(')) { depth++; continue }
    if (isSym(ts[i], ')')) { depth--; continue }
    if (depth !== 0) continue
    const isFrom = isWord(ts[i], 'FROM') && !isSym(ts[i - 1], '.')
    if (!isFrom && !isWord(ts[i], 'JOIN')) continue
    let j = i + 1
    for (;;) {
      let name = null
      if (isSym(ts[j], '(')) {
        const c = matchParen(ts, j)
        if (c < 0) break
        j = c + 1
      } else if (ts[j] && ts[j].type === 'word') {
        name = ts[j].text.toLowerCase()
        j++
        while (isSym(ts[j], '.') && ts[j + 1]) { name = ts[j + 1].text.toLowerCase(); j += 2 }
      } else break
      const a = ts[j]
      if (a && a.type === 'word' && !FROM_STOP.has(a.text.toUpperCase())) { name = a.text.toLowerCase(); j++ }
      else if (a && isWord(a, 'AS') && ts[j + 1]) { name = ts[j + 1].text.toLowerCase(); j += 2 }
      if (name) names.add(name)
      if (isFrom && isSym(ts[j], ',')) { j++; continue }
      break
    }
  }
  return names
}

const SET_WORDS = new Set(['UNION', 'INTERSECT', 'MINUS', 'EXCEPT'])

// JOIN ... USING (col): the column cannot carry a table qualifier in the query block that holds the USING join (ORA-25154),
// nor in a subquery of that block unless the subquery binds the same qualifier to a table of its own. Another block (a
// subquery with its own FROM, a later arm of a set operation) may use the same names freely (checked on Oracle 11g).
// `ts` holds significant tokens only. Returns { idx, code, message } for the first qualified use, or null.
export function usingQualifierProblem(ts) {
  let first = null
  // inherited: [{ quals, cols }] of the enclosing blocks' USING joins
  function walk(from, to, inherited) {
    // cut [from, to) into the arms of a set operation
    const arms = []
    let d = 0
    let armStart = from
    for (let i = from; i < to; i++) {
      if (isSym(ts[i], '(')) d++
      else if (isSym(ts[i], ')')) d--
      else if (d === 0 && ts[i].type === 'word' && SET_WORDS.has(ts[i].text.toUpperCase())) { arms.push([armStart, i]); armStart = i + 1 }
    }
    arms.push([armStart, to])
    for (const [s, e] of arms) {
      const cols = new Set()
      const groups = []   // [open, close] of the parenthesised groups at depth 0 of the arm
      for (let i = s; i < e; i++) {
        if (!isSym(ts[i], '(')) continue
        const c = matchParen(ts, i)
        if (c < 0 || c >= e) break
        groups.push([i, c])
        if (i - 1 >= s && isWord(ts[i - 1], 'USING')) {
          for (const part of splitTop(ts.slice(i + 1, c))) if (part.length === 1 && part[0].type === 'word') cols.add(part[0].text.toLowerCase())
        }
        i = c
      }
      const quals = tableQualifiers(ts, s, e)
      const rules = inherited.map((r) => ({ quals: new Set([...r.quals].filter((q) => !quals.has(q))), cols: r.cols }))
      if (cols.size) rules.push({ quals, cols })
      if (rules.length) {
        let g = 0
        for (let i = s; i + 2 < e; i++) {
          while (g < groups.length && groups[g][1] < i) g++
          if (g < groups.length && groups[g][0] <= i) { i = groups[g][1]; continue }
          if (ts[i].type === 'word' && isSym(ts[i + 1], '.') && ts[i + 2].type === 'word' && !isSym(ts[i - 1], '.')) {
            const q = ts[i].text.toLowerCase()
            const c = ts[i + 2].text.toLowerCase()
            if (rules.some((r) => r.quals.has(q) && r.cols.has(c)) && (!first || i < first.idx)) {
              first = { idx: i, code: 'ORA-25154', message: 'column part of USING clause cannot have qualifier' }
            }
          }
        }
      }
      for (const [o, c] of groups) walk(o + 1, c, rules)
    }
  }
  walk(0, ts.length, [])
  return first
}

// Quoted identifiers written in capitals ("NUME") name the same thing as the unquoted NUME, which the PostgreSQL side keeps in
// lower case. Lower-case them (quotes stay, so a reserved word is still safe). Mixed-case "Nume" is a different name in Oracle too.
export function upperQuotedIdents(ts) {
  return ts.map((x) => (x.type === 'qident' && /^"[A-Z][A-Z0-9_$#]*"$/.test(x.text) ? { type: 'qident', text: x.text.toLowerCase() } : x))
}
