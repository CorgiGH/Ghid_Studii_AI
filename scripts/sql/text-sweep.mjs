// Sweeps the text a learner reads in the BD lessons (and the mock test) for what must not be there.
//
//   node scripts/sql/text-sweep.mjs [<dir> ...]     (default src/content/bd)
//
// 1. Pedagogy labels: the names of the teaching phases and study names, in either language ("pretest", "Faza", "Kapur",
//    "Dunlosky", "productive failure", "retrieval", a screen titled "Regula" or "De ce?", "Scrie singur", "Încearcă" as a label).
// 2. English words left in a Romanian string (a stop-list of English function words; code in backticks is ignored).
// 3. The mistakes of the official pages (content outline section 4): a sentence that repeats one of them as true, or SQL
//    that has them built in.
// Exits non-zero when anything is found; every finding names the file, the JSON path and the text.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

// ---- 1. pedagogy labels (any language)
const LABEL_RULES = [
  ['pretest', /\bpre-?test/i],
  ['phase name (faza)', /\bfaz(a|ă|e|ei|ele)\b/i],
  ['phase name (phase)', /\b(phase|stage) ?\d\b|\bphases?\b/i],
  ['Kapur', /\bkapur\b/i],
  ['Dunlosky', /\bdunlosky\b/i],
  ['productive failure', /productive failure|e[sș]ec productiv/i],
  ['retrieval', /\bretrieval\b|\bretrieve\b/i],
  ['Scrie singur', /scrie singur|write it yourself|write (it )?on your own/i],
  ['spaced practice label', /spaced (practice|repetition)|repeti[tț]ie spa[tț]iat[aă]/i],
  ['study citation', /\bet al\.|\(\d{4}\)\s*(study|studiu)/i],
]
// a screen or block TITLE that is only a label
const TITLE_RULES = [
  ['title "Regula"/"The rule"', /^\s*(regula|the rule|rule)\s*[:.!]?\s*$/i],
  ['title "De ce?"/"Why?"', /^\s*(de ce|why)\s*[?!.]*\s*$/i],
  ['title "Încearcă"/"Try it"', /^\s*([iî]ncearc[aă]|try (it|this))\s*[:.!]?\s*$/i],
  ['title prefix "Regula:"', /^\s*(regula|the rule)\s*:/i],
  ['title prefix "Capcane:"', /^\s*(capcane|traps|capcana|the trap)\s*:/i],
  ['title prefix "Scrie singur:"', /^\s*scrie singur\s*:/i],
  ['title prefix "Încearcă:"', /^\s*[iî]ncearc[aă]\s*:/i],
]
// "Încearcă" used as a label in front of a sentence ("Încearcă: ...", "Încearcă singur")
const LABEL_IN_TEXT = [['"Încearcă" as a label', /(^|\n)\s*(\*\*)?[iî]ncearc[aă](\*\*)?\s*[:.]/i]]

// ---- 2. English in Romanian
const EN_STOP = ['the', 'and', 'with', 'which', 'because', 'when', 'you', 'your', 'is', 'of', 'to', 'for', 'from', 'that', 'this', 'then', 'if', 'how', 'what', 'why', 'does', 'not', 'it', 'was', 'be', 'by', 'but', 'have', 'has', 'will', 'can', 'only', 'each', 'every', 'rows', 'row', 'table', 'column', 'result', 'query', 'answer', 'step', 'next', 'show']
const EN_RE = new RegExp(`(?<![\\p{L}\\p{N}_])(${EN_STOP.join('|')})(?![\\p{L}\\p{N}_])`, 'u')

// ---- 3. the official pages' mistakes (content outline section 4.1), as sentences or as built-in SQL
// [name, pattern, scope, unless]: scope 'text' = prose only, 'sql' = SQL fields only, 'any' = both. A prose sentence that
// matches `unless` is a correction of the mistake (the lessons name the pages' errors in order to refute them) and passes.
const CORRECTION = /\b(no|not|No|Not)\b|n't|[Nn]ici|[Nn]u exist[aă]|[Nn]u e |[Nn]u este|[Ww]rong|gre[sș]it|[Oo]fficial|[Oo]ficial|[Pp]agin|[Pp]age|actually|de fapt/
const ERROR_RULES = [
  ['4.1.1 NULL = NULL gives FALSE', /NULL\s*(=|<>)\s*NULL[^.\n]{0,80}?(returns|gives|evaluates to|is|este|d[aă]|returneaz[aă])\s+FALSE/i, 'text', CORRECTION],
  ['4.1.2 titlu_curs as VARCHAR2(10)', /titlu_curs\s+VARCHAR2\s*\(\s*10\s*\)/i, 'sql'],
  ['4.1.3 NOT NULL on a column the live script leaves nullable', /\b(nume|prenume)\s+(VARCHAR2\(\d+\)|CHAR\(\d+\))\s+NOT NULL|\bid_prof\s+CHAR\(4\)\s+NOT NULL/i, 'sql'],
  ['4.1.5 "%" and "_" escaped with a backslash by default', /(prefix|prefixa|prefixeaz[aă]|precede)[^.\n]{0,60}\\/i, 'text', /ESCAPE|no default|nu exist[aă]/i],
  ['4.1.6 the table studenti spelled with a cedilla t', /\b(FROM|JOIN|INTO|UPDATE|TABLE)\s+studen\u0163i\b/i, 'sql'],
  ['4.1.7 NOT IN is != ANY', /NOT IN[^.\n]{0,80}(equivalent|echivalent)[^.\n]{0,40}(!=|<>)\s*ANY/i, 'text', CORRECTION],
  ['4.1.8 INTERSECT ALL in 11g', /\bINTERSECT\s+ALL\b/i, 'any', CORRECTION],
  ['4.1.9 "Excepție fac CONCAT, NVL, REPLACE, REGEXP_REPLACE" as the complete list', /Excep[tț]ie fac CONCAT, NVL, REPLACE, REGEXP_REPLACE|exceptions are CONCAT, NVL, REPLACE, REGEXP_REPLACE/i, 'text', CORRECTION],
  ['4.1.10 negative SUBSTR counted left to right', /negative[^.\n]{0,60}(left to right|from the left)|negativ[^.\n]{0,60}(de la st[aâ]nga la dreapta|din st[aâ]nga)/i, 'text', CORRECTION],
  ["4.1.11 UPPER(nume)='BREABAN' gives 0 rows", /UPPER\s*\(\s*nume\s*\)\s*=\s*'BREABAN'[^.\n]{0,40}\b0\b/i, 'text', CORRECTION],
  ['4.1.13 HH:MI mask with no AM/PM', /'[^']*\bHH:MI(?!:SS)(?![^']*\b(AM|PM|A\.M\.|P\.M\.))[^']*'/, 'sql'],
  ['4.1.14 NEXT_DAY on a bare text date', /NEXT_DAY\s*\(\s*'/i, 'sql'],
  ['4.1.15 NEXT_DAY the next working day / TRUNC the nearest day', /working day|zi lucr[aă]toare|zilei lucr[aă]toare|nearest day|closest day|cea mai apropiat[aă] zi/i, 'text', CORRECTION],
]

const SQL_KEYS = new Set(['solution', 'starter', 'sql', 'altSolutions', 'code'])
const SKIP_KEYS = new Set(['id', 'type', 'widget', 'dataset', 'kind', 'clause', 'src', 'mode', 'misconception', 'tag', 'tags', 'order', 'orderBy', 'aliases', 'cosmetic', 'tables', 'answerKey', 'clock', 'metaId', 'from', 'to'])

// strip `code`, ``` fences and "quoted SQL" so a word inside code is not read as English prose
const stripCode = (s) => s.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ').replace(/ORA-\d{5}\s*\([^)]*\)/g, ' ')

export function sweepNode(root, file) {
  const findings = []
  const add = (rule, at, text) => findings.push({ file, rule, at, text: text.length > 140 ? `${text.slice(0, 140)}...` : text })
  const visit = (node, trail, lang, key, isTitle) => {
    if (typeof node === 'string') {
      const where = trail.join('.')
      const code = SQL_KEYS.has(key)
      const prose = !code && (lang === 'en' || lang === 'ro')
      if (prose) {
        for (const [name, re] of LABEL_RULES) if (re.test(node)) add(`pedagogy label: ${name}`, where, node)
        for (const [name, re] of LABEL_IN_TEXT) if (re.test(node)) add(`pedagogy label: ${name}`, where, node)
        if (isTitle) for (const [name, re] of TITLE_RULES) if (re.test(node)) add(`pedagogy label: ${name}`, where, node)
        if (lang === 'ro') {
          const m = EN_RE.exec(stripCode(node))
          if (m) add(`English word in Romanian text: "${m[1]}"`, where, node)
        }
      }
      for (const [name, re, scope, unless] of ERROR_RULES) {
        if ((scope === 'text' && !prose) || (scope === 'sql' && !code)) continue
        if (scope === 'any' && !prose && !code) continue
        // prose is judged sentence by sentence, so a correction elsewhere in the paragraph does not hide a repeated mistake
        const parts = prose && unless ? node.split(/(?<=[.!?])\s+|\n+/) : [node]
        if (parts.some((part) => re.test(part) && !(unless && unless.test(part)))) add(`official-page mistake: ${name}`, where, node)
      }
      return
    }
    if (Array.isArray(node)) return node.forEach((x, i) => visit(x, [...trail, i], lang, key, isTitle))
    if (!node || typeof node !== 'object') return
    for (const [k, v] of Object.entries(node)) {
      if (SKIP_KEYS.has(k) && typeof v !== 'object') continue
      const nextLang = k === 'en' || k === 'ro' ? k : lang
      visit(v, [...trail, k], nextLang, k === 'en' || k === 'ro' ? key : k, isTitle || k === 'title' || k === 'shortTitle')
    }
  }
  visit(root, [], null, undefined, false)
  return findings
}

export function sweepDir(dirs) {
  const findings = []
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.name.endsWith('.json')) findings.push(...sweepNode(JSON.parse(fs.readFileSync(p, 'utf8')), path.relative(ROOT, p)))
    }
  }
  dirs.forEach(walk)
  return findings
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dirs = process.argv.slice(2).map((d) => path.resolve(d))
  const found = sweepDir(dirs.length ? dirs : [path.join(ROOT, 'src', 'content', 'bd', 'courses'), path.join(ROOT, 'src', 'content', 'bd', 'tests')])
  for (const f of found) console.error(`${f.file} ${f.at}\n   ${f.rule}\n   ${f.text}`)
  console.log(found.length ? `text-sweep: ${found.length} finding(s)` : 'text-sweep: clean')
  process.exitCode = found.length ? 1 : 0
}
