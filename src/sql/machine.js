// Query machine: derives every stage of a query's evaluation by running sub-queries on the engine,
// so the only hand-written input is the stage list. Pure (no React); the runner is any object with
// run(sql, { dataset }) => Promise<Result> (the Engine in tests, the SqlClient in the browser).
//
//   planStages(sql, stages, runner, { dataset, show }) -> Promise<StageState[]>
//   StageState = { clause, rows, kept, removed, columns, dimmed, itemCols, order?, truth?, ... }
//   itemCols: the cell column each select item reads, in select order.
//
// `rows` are the rows on screen while the stage runs (for WHERE: its input rows, with `kept` and
// `removed` telling which survive); the next stage starts from the survivors.
import { MachineError, conjuncts, parseQuery } from './machineParse.js'

export { MachineError, conjuncts, parseQuery }

// How many candidate pairs a predicted join may put on screen for clicking.
export const MAX_PAIRS = 60

export const CLAUSES = ['from', 'join', 'where', 'select', 'distinct', 'order', 'union', 'union-all', 'intersect', 'minus']
const SET_CLAUSES = new Set(['union', 'union-all', 'intersect', 'minus'])
export const isSetClause = (c) => SET_CLAUSES.has(c)

const q = (s) => `"${s}"`
const tupleKey = (cells) => JSON.stringify(cells)
const norm = (s) => String(s).replace(/\s+/g, '').toLowerCase()

async function exec(runner, dataset, sql) {
  if (!runner || typeof runner.run !== 'function') throw new MachineError('The SQL engine is not available.', 'unavailable')
  const r = await runner.run(sql, { dataset })
  if (!r || r.error) throw new MachineError(r?.error?.message || 'The query failed.', r?.error?.code || 'failed')
  return r
}

// Which show entry does a select item stand for? (same expression, qualified or not)
function matchShow(item, show) {
  const e = norm(item.expr)
  const exact = show.findIndex((s) => norm(s) === e)
  if (exact >= 0) return exact
  const tail = (s) => norm(s).replace(/^.*\./, '')
  if (/^(\w+\.)?\w+$/.test(item.expr)) {
    const qualified = item.expr.includes('.')
    const cands = show.map((s, i) => [s, i]).filter(([s]) => tail(s) === tail(item.expr) && (qualified !== s.includes('.')))
    if (cands.length === 1) return cands[0][1]
  }
  return -1
}

function resolveOrder(part) {
  return part.order.map((o) => {
    let expr = o.expr
    if (/^\d+$/.test(expr)) {
      const it = part.select[Number(expr) - 1]
      if (it) expr = it.expr
    } else {
      const quoted = /^"[^"]*"$/.test(expr)
      const key = quoted ? expr.slice(1, -1) : expr
      const byAlias = part.select.find((it) => it.alias && (quoted ? it.alias === key : it.alias.toLowerCase() === key.toLowerCase()))
      if (byAlias) expr = byAlias.expr
    }
    return { expr, mods: o.mods }
  })
}

// Runs the part's rows through the engine once: show columns, select values, order keys and the WHERE verdict per row.
async function loadPart(runner, dataset, part, show, tag, computed) {
  const selExprs = part.star ? show : part.select.map((it) => it.expr)
  const orders = resolveOrder(part)
  const where = part.where
  const build = (showCols) => {
    const list = [...showCols, ...selExprs, ...orders.map((o) => o.expr)]
    if (where) list.push(`CASE WHEN (${where}) THEN 'T' WHEN NOT (${where}) THEN 'F' ELSE 'U' END`)
    return { list, sql: `SELECT ${list.map((e, i) => `${e} AS ${q(`x${i}`)}`).join(', ')} FROM ${part.fromText}` }
  }
  let showCols = show
  let built = build(showCols)
  let res
  try {
    res = await exec(runner, dataset, built.sql)
  } catch (err) {
    if (tag === 'a' || !(err instanceof MachineError) || err.code === 'unavailable') throw err
    showCols = []
    built = build(showCols)
    res = await exec(runner, dataset, built.sql)
  }
  const nShow = showCols.length
  const nSel = selExprs.length
  const nOrd = orders.length
  const rows = []
  const sel = {}
  const ordKey = {}
  const truth = {}
  res.rows.forEach((r, i) => {
    const key = `${tag}${i}`
    const cells = {}
    showCols.forEach((label, k) => { cells[label] = r[k] })
    sel[key] = r.slice(nShow, nShow + nSel)
    ordKey[key] = tupleKey(r.slice(nShow + nSel, nShow + nSel + nOrd))
    truth[key] = where ? r[nShow + nSel + nOrd] : 'T'
    rows.push({ key, cells })
  })
  rows.forEach((r) => computed.forEach((c) => { r.cells[c.label] = sel[r.key][c.index] }))
  return { part, rows, sel, ordKey, truth, selExprs, orders, showCols, nShow, rawRows: res.rows, list: built.list, fellBack: nShow === 0 && show.length > 0 }
}

// The pairs a predicted join puts in front of the learner. The plain equalities of every ON (column = column,
// column = constant) are already applied, and the learner decides the rest (inequalities, OR, BETWEEN, ...).
// When every ON part is an equality, nothing is applied and the pairs are every combination of rows.
// Survivors are the master query's own rows (matched by value), so later stages carry on from them.
async function loadPairs(runner, dataset, part, A, rowMap, maxPairs) {
  if (!part.joins.length || part.joins.some((j) => j.kind !== 'inner' || !j.on || j.using)) {
    throw new MachineError('A predicted join needs every join to be an inner JOIN ... ON.', 'unsupported')
  }
  const split = part.joins.map((j) => conjuncts(j.on))
  const anyOther = split.some((cs) => cs.some((c) => !c.eq))
  const isTest = (c) => !anyOther || !c.eq
  const given = split.flat().filter((c) => !isTest(c)).map((c) => c.text)
  const test = split.flat().filter(isTest).map((c) => c.text)
  const fromText = [part.base.text, ...part.joins.map((j, k) => {
    const on = split[k].filter((c) => !isTest(c)).map((c) => c.text)
    return `${j.head} ON ${on.length ? on.join(' AND ') : '1 = 1'}`
  })].join(' ')
  const n = Number((await exec(runner, dataset, `SELECT COUNT(*) FROM ${fromText}`)).rows[0][0])
  if (n > maxPairs) throw new MachineError(`A predicted join would list ${n} pairs to click; at most ${maxPairs} fit on screen.`, 'unsupported')
  const verdict = `CASE WHEN ${test.map((t) => `(${t})`).join(' AND ')} THEN 'T' ELSE 'F' END`
  const list = [...A.list, verdict]
  const res = await exec(runner, dataset, `SELECT ${list.map((e, i) => `${e} AS ${q(`x${i}`)}`).join(', ')} FROM ${fromText}`)
  const queues = new Map()
  A.rawRows.forEach((r, i) => {
    const t = tupleKey(r.slice(0, A.list.length))
    if (!queues.has(t)) queues.set(t, [])
    queues.get(t).push(A.rows[i].key)
  })
  const rows = []
  const kept = []
  const removed = []
  res.rows.forEach((r, i) => {
    if (r[A.list.length] === 'T') {
      const key = (queues.get(tupleKey(r.slice(0, A.list.length))) || []).shift()
      if (key === undefined) throw new MachineError('A predicted join pair did not match the join result.', 'failed')
      rows.push(rowMap.get(key))
      kept.push(key)
    } else {
      const key = `j${i}`
      rows.push({ key, cells: Object.fromEntries(A.showCols.map((label, k) => [label, r[k]])) })
      removed.push(key)
    }
  })
  if (kept.length !== A.rows.length) throw new MachineError('A predicted join pair did not match the join result.', 'failed')
  return { rows, kept, removed, given, test: test.join(' AND ') }
}

// The kept rows of a set operator in the order the full query returns them. Oracle sorts UNION, INTERSECT and
// MINUS results (ascending, every column) when there is no ORDER BY, and UNION ALL keeps the first list then the
// second, so the order comes from the engine running the whole query, matched back to the kept rows by value.
async function orderSetResult(runner, dataset, sql, clause, kept, selOf, width) {
  const body = String(sql).replace(/;\s*$/, '')
  const cols = Array.from({ length: width }, (_, i) => i + 1).join(', ')
  const ordered = clause === 'union-all' ? body : `SELECT * FROM (${body}) ORDER BY ${cols}`
  const res = await exec(runner, dataset, ordered)
  const queues = new Map()
  for (const k of kept) {
    const t = tupleKey(selOf(k))
    if (!queues.has(t)) queues.set(t, [])
    queues.get(t).push(k)
  }
  const out = []
  for (const row of res.rows) {
    const queue = queues.get(tupleKey(row))
    if (!queue || !queue.length) throw new MachineError('A row of the set operator result did not match the engine result.', 'failed')
    out.push(queue.shift())
  }
  if (out.length !== kept.length) throw new MachineError('The set operator result does not match the engine result.', 'failed')
  return out
}

function columnPlan(part, show) {
  // show columns, then select items that are not a show column
  const matched = new Set()
  const computed = []
  const labels = {}
  if (part.star) show.forEach((_, i) => matched.add(i))
  else {
    part.select.forEach((it) => {
      const m = matchShow(it, show)
      if (m >= 0) {
        matched.add(m)
        if (it.alias) labels[show[m]] = it.alias
      } else computed.push({ label: it.alias || it.expr, expr: it.expr, index: part.select.indexOf(it) })
    })
  }
  const selected = [...show.filter((_, i) => matched.has(i)), ...computed.map((c) => c.label)]
  const dimmed = show.filter((_, i) => !matched.has(i))
  return { computed, labels, selected, dimmed }
}

const visibleBaseColumns = (part, show, baseColumns) => {
  const alias = (part.base.alias || '').toLowerCase()
  const table = (part.base.table || '').toLowerCase()
  const cols = baseColumns.map((c) => c.toLowerCase())
  return show.filter((s) => {
    const m = /^(\w+)\.(\w+)$/.exec(s)
    if (m) return (m[1].toLowerCase() === alias || m[1].toLowerCase() === table) && cols.includes(m[2].toLowerCase())
    return cols.includes(s.toLowerCase())
  })
}

function groupBySel(keys, sel) {
  const groups = new Map()
  for (const k of keys) {
    const t = tupleKey(sel[k])
    if (!groups.has(t)) groups.set(t, [])
    groups.get(t).push(k)
  }
  return groups
}

export async function planStages(sql, stages, runner, { dataset = 'facultate', show = [], maxPairs = MAX_PAIRS } = {}) {
  const parsed = parseQuery(sql)
  if (parsed.parts.length > 2) throw new MachineError('Only one set operator per query is animated.', 'unsupported')
  if (parsed.parts.length > 1 && parsed.parts.some((p) => p.order.length)) throw new MachineError('ORDER BY after a set operator is not animated.', 'unsupported')
  const a0 = parsed.parts[0]
  const b0 = parsed.parts[1] || null
  // An alias is not an expression the master query can select, so the default show list is the expressions.
  const showCols = show.length ? show : (a0.star ? [] : a0.select.map((it) => it.expr))
  if (!showCols.length) throw new MachineError('The block needs a "show" list of columns.', 'unsupported')
  const plan = columnPlan(a0, showCols)
  const A = await loadPart(runner, dataset, a0, showCols, 'a', plan.computed)
  const B = b0 ? await loadPart(runner, dataset, b0, showCols, 'b', []) : null
  const rowMap = new Map([...A.rows, ...(B ? B.rows : [])].map((r) => [r.key, r]))
  const rowsOf = (keys) => keys.map((k) => rowMap.get(k))

  const countCache = {}
  const countOf = async (table) => {
    if (!(table in countCache)) countCache[table] = Number((await exec(runner, dataset, `SELECT COUNT(*) FROM ${table}`)).rows[0][0])
    return countCache[table]
  }
  const tablesInfo = async () => {
    const tables = [{ name: a0.base.table, alias: a0.base.alias, count: await countOf(a0.base.table) }]
    for (const j of a0.joins) tables.push({ name: j.table, alias: j.alias, count: await countOf(j.table), kind: j.kind })
    return tables
  }

  // Rows of the first FROM item alone, shown before its joins happen.
  let base = null
  if (a0.joins.length > 0 && stages.some((s) => s.clause === 'join')) {
    const br = await exec(runner, dataset, `SELECT * FROM ${a0.base.text}`)
    const names = br.columns.map((c) => c.toLowerCase())
    let columns = visibleBaseColumns(a0, showCols, br.columns)
    if (!columns.length) columns = br.columns.slice(0, 3)
    const rows = br.rows.map((r, i) => ({
      key: `base${i}`,
      cells: Object.fromEntries(columns.map((c) => [c, r[names.indexOf(c.replace(/^.*\./, '').toLowerCase())]])),
    }))
    base = { rows, columns }
  }

  const itemLabels = a0.star ? showCols : a0.select.map((it) => {
    if (it.alias) return it.alias
    const m = matchShow(it, showCols)
    return m >= 0 ? showCols[m] : it.expr
  })

  // The cell column each select item reads from, in select order (the order the engine returns its columns).
  const itemCols = a0.star ? showCols : a0.select.map((it) => {
    const m = matchShow(it, showCols)
    return m >= 0 ? showCols[m] : (it.alias || it.expr)
  })

  const out = []
  let cur = { keys: A.rows.map((r) => r.key), columns: showCols, dimmed: [], labels: {}, part: A }
  let whereDoneA = false

  for (const st of stages) {
    const clause = st.clause
    const S = { clause, rows: [], kept: [], removed: [], columns: [], dimmed: [], itemCols }
    if (clause === 'from') {
      if (base) {
        S.rows = base.rows
        S.columns = base.columns
        S.kept = base.rows.map((r) => r.key)
        S.tables = await tablesInfo()
      } else {
        S.rows = rowsOf(cur.keys)
        S.columns = showCols
        S.kept = cur.keys.slice()
      }
    } else if (clause === 'join' && st.predict) {
      const J = await loadPairs(runner, dataset, a0, A, rowMap, maxPairs)
      S.rows = J.rows
      S.columns = showCols
      S.kept = J.kept
      S.removed = J.removed
      S.given = J.given
      S.test = J.test
      S.tables = await tablesInfo()
      cur = { ...cur, keys: J.kept.slice() }
    } else if (clause === 'join') {
      S.rows = rowsOf(cur.keys)
      S.columns = showCols
      S.kept = cur.keys.slice()
      if (a0.joins.length) {
        S.tables = await tablesInfo()
        S.product = a0.joins.every((j) => j.kind === 'inner') ? S.tables.reduce((n, t) => n * t.count, 1) : null
      }
    } else if (clause === 'where') {
      let P = A
      if (B && (!a0.where || whereDoneA) && b0.where) P = B
      if (P === A) whereDoneA = true
      if (P.fellBack) throw new MachineError('The second query does not have the block\'s columns, so its WHERE cannot be shown row by row.', 'unsupported')
      const input = P === A ? cur.keys : P.rows.map((r) => r.key)
      S.rows = rowsOf(input)
      S.columns = showCols
      S.kept = input.filter((k) => P.truth[k] === 'T')
      S.removed = input.filter((k) => P.truth[k] !== 'T')
      if (st.tri) S.truth = Object.fromEntries(input.map((k) => [k, P.truth[k]]))
      cur = { ...cur, keys: S.kept, part: P }
    } else if (clause === 'select') {
      S.rows = rowsOf(cur.keys)
      S.columns = [...showCols, ...plan.computed.map((c) => c.label)]
      S.dimmed = plan.dimmed
      S.labels = plan.labels
      S.kept = cur.keys.slice()
      cur = { ...cur, columns: S.columns, dimmed: plan.dimmed, labels: plan.labels }
    } else if (clause === 'distinct') {
      const groups = groupBySel(cur.keys, cur.part.sel)
      const merge = {}
      const counts = {}
      const reps = new Set()
      for (const keys of groups.values()) {
        reps.add(keys[0])
        counts[keys[0]] = keys.length
        for (const k of keys.slice(1)) merge[k] = keys[0]
      }
      S.rows = rowsOf(cur.keys.filter((k) => reps.has(k)))
      S.inputCount = cur.keys.length
      S.kept = S.rows.map((r) => r.key)
      S.removed = cur.keys.filter((k) => !reps.has(k))
      S.merge = merge
      S.counts = counts
      S.columns = plan.selected
      S.labels = plan.labels
      cur = { ...cur, keys: S.kept, columns: S.columns, dimmed: [] }
    } else if (clause === 'order') {
      if (B) throw new MachineError('ORDER BY after a set operator is not animated.', 'unsupported')
      const ord = A.orders
      let sorted = cur.keys.slice()
      if (ord.length) {
        const list = [...showCols, ...A.selExprs, ...ord.map((o) => o.expr)]
        const orderBy = ord.map((o) => `${o.expr}${o.mods ? ` ${o.mods}` : ''}`).join(', ')
        const sqlO = `SELECT ${list.map((e, i) => `${e} AS ${q(`x${i}`)}`).join(', ')} FROM ${a0.fromText}${a0.where ? ` WHERE ${a0.where}` : ''} ORDER BY ${orderBy}`
        const r = await exec(runner, dataset, sqlO)
        const queues = new Map()
        for (const k of cur.keys) {
          const t = tupleKey(A.rawRows[Number(k.slice(1))].slice(0, list.length))
          if (!queues.has(t)) queues.set(t, [])
          queues.get(t).push(k)
        }
        sorted = []
        for (const row of r.rows) {
          const queue = queues.get(tupleKey(row))
          if (queue && queue.length) sorted.push(queue.shift())
        }
      }
      S.rows = rowsOf(sorted)
      S.order = sorted
      S.kept = sorted.slice()
      S.tie = Object.fromEntries(sorted.map((k) => [k, A.ordKey[k]]))
      S.columns = cur.columns
      S.dimmed = cur.dimmed
      S.labels = cur.labels
      cur = { ...cur, keys: sorted }
    } else if (isSetClause(clause)) {
      if (!B) throw new MachineError(`${clause.toUpperCase()} needs a set operator in the query.`, 'unsupported')
      const all = clause === 'union-all'
      const keysA = A.rows.map((r) => r.key).filter((k) => A.truth[k] === 'T')
      const keysB = B.rows.map((r) => r.key).filter((k) => B.truth[k] === 'T')
      const reps = (keys, P) => (all ? keys : [...groupBySel(keys, P.sel).values()].map((g) => g[0]))
      const repsA = reps(keysA, A)
      const repsB = reps(keysB, B)
      const inB = new Set(keysB.map((k) => tupleKey(B.sel[k])))
      const inA = new Set(keysA.map((k) => tupleKey(A.sel[k])))
      let kept
      if (clause === 'minus') kept = repsA.filter((k) => !inB.has(tupleKey(A.sel[k])))
      else if (clause === 'intersect') kept = repsA.filter((k) => inB.has(tupleKey(A.sel[k])))
      else kept = [...repsA, ...repsB.filter((k) => all || !inA.has(tupleKey(B.sel[k])))]
      const view = (P, keys) => keys.map((k) => ({ key: k, cells: Object.fromEntries(itemLabels.map((l, i) => [l, P.sel[k][i]])) }))
      const keptSet = new Set(kept)
      S.rows = view(A, repsA)
      S.right = view(B, repsB)
      S.kept = kept
      S.result = await orderSetResult(runner, dataset, sql, clause, kept, (k) => (k.startsWith('a') ? A : B).sel[k], itemLabels.length)
      S.removed = [...repsA, ...repsB].filter((k) => !keptSet.has(k))
      S.columns = itemLabels
      S.setCounts = { left: keysA.length, right: keysB.length }
    } else {
      throw new MachineError(`Unknown clause "${clause}".`, 'unsupported')
    }
    out.push(S)
  }
  return out
}

// ---- predict checks (pure) --------------------------------------------------------------------

// WHERE row picks and JOIN pair picks: marks[key] is true when the learner's choice for that row was right.
export function scorePicks(stage, picked) {
  const inRows = stage.rows.map((r) => r.key)
  const keep = new Set(stage.kept)
  const set = picked instanceof Set ? picked : new Set(picked)
  const marks = {}
  let correct = 0
  for (const k of inRows) {
    const ok = set.has(k) === keep.has(k)
    marks[k] = ok
    if (ok) correct += 1
  }
  return { marks, correct, total: inRows.length }
}

// ORDER BY placements: marks[i] is true when the learner's i-th pick is tie-equivalent to the i-th expected row.
export function scoreOrder(stage, placed) {
  const expected = stage.order
  const marks = expected.map((k, i) => placed[i] !== undefined && stage.tie[placed[i]] === stage.tie[k])
  return { marks, correct: marks.filter(Boolean).length, total: expected.length }
}

// A predicted row count (DISTINCT).
export function expectedCount(stage) {
  return stage.rows.length
}
export function scoreCount(stage, value) {
  const want = expectedCount(stage)
  const n = typeof value === 'number' ? value : Number(String(value).trim())
  const ok = Number.isInteger(n) && n === want
  return { ok, want, got: Number.isInteger(n) ? n : null }
}
