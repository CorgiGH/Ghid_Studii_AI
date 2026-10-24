// Token stream for the Oracle -> PostgreSQL rewriter. Strings, "quoted identifiers" and comments are tokens of
// their own, so no rewrite pass can ever touch their contents.
//
//   Token = { type: 'word'|'string'|'qident'|'number'|'op'|'space'|'comment'|'punct', text: string }
//
// Passes may also emit { type: 'raw', text } for text they generate; passes must not look inside it, and
// untokenize prints it as is. `punct` is one of ( ) , ; . and `op` is every other operator character.

const PUNCT = new Set(['(', ')', ',', ';', '.'])
const TWO_CHAR_OPS = ['||', '<>', '!=', '<=', '>=', '^=']

export function tokenize(sql) {
  const t = []
  let i = 0
  const n = sql.length
  while (i < n) {
    const c = sql[i]
    if (/\s/.test(c)) {
      let j = i
      while (j < n && /\s/.test(sql[j])) j++
      t.push({ type: 'space', text: sql.slice(i, j) }); i = j
    } else if (c === '-' && sql[i + 1] === '-') {
      let j = sql.indexOf('\n', i)
      if (j < 0) j = n
      t.push({ type: 'comment', text: sql.slice(i, j) }); i = j
    } else if (c === '/' && sql[i + 1] === '*') {
      let j = sql.indexOf('*/', i + 2)
      j = j < 0 ? n : j + 2
      t.push({ type: 'comment', text: sql.slice(i, j) }); i = j
    } else if (c === "'") {
      let j = i + 1
      for (;;) {
        if (j >= n) break
        if (sql[j] === "'") {
          if (sql[j + 1] === "'") { j += 2; continue }
          j++
          break
        }
        j++
      }
      t.push({ type: 'string', text: sql.slice(i, j) }); i = j
    } else if (c === '"') {
      let j = sql.indexOf('"', i + 1)
      j = j < 0 ? n : j + 1
      t.push({ type: 'qident', text: sql.slice(i, j) }); i = j
    } else if (/[A-Za-z_]/.test(c) || c.charCodeAt(0) > 127) {
      let j = i + 1
      while (j < n && (/[\w$#]/.test(sql[j]) || sql.charCodeAt(j) > 127)) j++
      t.push({ type: 'word', text: sql.slice(i, j) }); i = j
    } else if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(sql[i + 1] || ''))) {
      let j = i
      while (j < n && /[0-9.]/.test(sql[j])) j++
      if (/[eE]/.test(sql[j] || '') && /[-+0-9]/.test(sql[j + 1] || '')) {
        j += 2
        while (j < n && /[0-9]/.test(sql[j])) j++
      }
      t.push({ type: 'number', text: sql.slice(i, j) }); i = j
    } else {
      const two = sql.slice(i, i + 2)
      if (TWO_CHAR_OPS.includes(two)) { t.push({ type: 'op', text: two }); i += 2 }
      else { t.push({ type: PUNCT.has(c) ? 'punct' : 'op', text: c }); i++ }
    }
  }
  return t
}

export const untokenize = (tokens) => tokens.map((x) => x.text).join('')

// ---- helpers shared by the passes ------------------------------------------------------------------------------
export const raw = (text) => ({ type: 'raw', text })
export const isSig = (t) => t.type !== 'space' && t.type !== 'comment'
// operator or punctuation token with exactly this text
export const isSym = (t, text) => !!t && (t.type === 'op' || t.type === 'punct') && t.text === text
export const isSymbol = (t) => !!t && (t.type === 'op' || t.type === 'punct')
// keyword test: word token whose upper-case text is `kw`
export const isWord = (t, kw) => !!t && t.type === 'word' && t.text.toUpperCase() === kw

export function nextSig(ts, i) {
  for (let j = i + 1; j < ts.length; j++) if (isSig(ts[j])) return j
  return -1
}
export function prevSig(ts, i) {
  for (let j = i - 1; j >= 0; j--) if (isSig(ts[j])) return j
  return -1
}
export function matchParen(ts, open) {
  let d = 0
  for (let j = open; j < ts.length; j++) {
    if (isSym(ts[j], '(')) d++
    else if (isSym(ts[j], ')')) { d--; if (d === 0) return j }
  }
  return -1
}
export function splitTop(ts, sep = ',') {
  const out = [[]]
  let d = 0
  for (const x of ts) {
    if (isSym(x, '(')) d++
    if (isSym(x, ')')) d--
    if (d === 0 && isSym(x, sep)) out.push([])
    else out[out.length - 1].push(x)
  }
  return out
}
export function trimSpace(ts) {
  let a = 0
  let b = ts.length
  while (a < b && !isSig(ts[a])) a++
  while (b > a && !isSig(ts[b - 1])) b--
  return ts.slice(a, b)
}
