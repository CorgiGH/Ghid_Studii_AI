// What the query machine shows at each step, as plain data (no React), so it can be tested in node.
// A stage is one step, except that a predicted stage first asks ('ask') and then shows ('show'),
// and a set-operator stage first lays out its two lists ('lists') and then combines them.
import { isSetClause, scoreCount, scoreOrder, scorePicks } from './machine.js'

export function buildSteps(stages) {
  const steps = []
  stages.forEach((s, i) => {
    if (s.predict) steps.push({ stage: i, phase: 'ask' })
    else if (isSetClause(s.clause)) steps.push({ stage: i, phase: 'lists' })
    steps.push({ stage: i, phase: 'show' })
  })
  return steps
}

// Where a clause chip jumps: a stage that asks and has not been checked is entered at its question, never its answer.
export function chipStep(steps, i, checked = {}) {
  const ask = steps.findIndex((x) => x.stage === i && x.phase === 'ask')
  return ask >= 0 && !checked[i] ? ask : steps.findIndex((x) => x.stage === i && x.phase === 'show')
}

// Which kind of answer a predicted stage asks for.
export function predictKind(clause) {
  if (clause === 'where') return 'rows'
  if (clause === 'order') return 'order'
  return 'count' // join, distinct
}

const keepRows = (S) => {
  const keep = new Set(S.kept)
  return S.rows.filter((r) => keep.has(r.key))
}

// Rows and columns standing on screen once stage i is done.
export function settled(plan, i) {
  if (i < 0) return { rows: [], columns: [], dimmed: [], labels: {} }
  const S = plan[i]
  const rows = S.clause === 'where' ? keepRows(S) : isSetClause(S.clause) ? [...keepRows(S), ...(S.right || []).filter((r) => S.kept.includes(r.key))] : S.rows
  return { rows, columns: S.columns, dimmed: S.dimmed || [], labels: S.labels || {} }
}

// The view for one step. `ui[stageIndex]` holds the learner's answer for a predicted stage:
// { picks: string[] } | { placed: string[] } | { value: string }, and `checked[stageIndex]` its score.
export function viewAt(plan, steps, stepIndex, ui = {}, checked = {}) {
  const { stage: i, phase } = steps[stepIndex]
  const S = plan[i]
  const prev = settled(plan, i - 1)
  const answer = ui[i] || {}
  const done = checked[i] || null
  const view = { clause: S.clause, phase, columns: S.columns, dimmed: [], labels: {}, rows: [], ask: null, meta: {}, panels: null }
  const rowOf = (r, extra = {}) => ({ key: r.key, cells: r.cells, status: 'plain', ...extra })

  if (phase === 'ask') {
    const kind = predictKind(S.clause)
    view.ask = { kind, done }
    const input = i === 0 || S.clause === 'where' ? (S.clause === 'where' ? S.rows : []) : prev.rows
    view.columns = i === 0 ? S.columns : prev.columns
    view.dimmed = i === 0 ? [] : prev.dimmed
    view.labels = i === 0 ? {} : prev.labels
    if (kind === 'rows') {
      const picked = new Set(answer.picks || [])
      const score = done ? scorePicks(S, picked) : null
      view.rows = input.map((r) => rowOf(r, { status: 'pickable', picked: picked.has(r.key), mark: score ? score.marks[r.key] : undefined }))
    } else if (kind === 'order') {
      const placed = answer.placed || []
      view.rows = input.map((r) => rowOf(r, { status: 'pickable', pickNo: placed.indexOf(r.key) + 1 || null }))
    } else {
      view.rows = input.map((r) => rowOf(r))
    }
    view.meta = { count: input.length, kind }
    return view
  }

  if (S.clause === 'from') {
    view.rows = S.rows.map((r) => rowOf(r))
    view.meta = { to: S.rows.length, tables: S.tables || null }
  } else if (S.clause === 'join') {
    view.rows = S.rows.map((r) => rowOf(r))
    view.meta = { from: prev.rows.length, to: S.rows.length, tables: S.tables || null, product: S.product ?? null }
  } else if (S.clause === 'where') {
    const hold = !!(S.predict || S.truth)
    const score = done ? scorePicks(S, answer.picks || []) : null
    const keep = new Set(S.kept)
    const rows = hold ? S.rows : keepRows(S)
    view.rows = rows.map((r) => rowOf(r, {
      status: keep.has(r.key) ? 'kept' : 'gone',
      truth: S.truth ? S.truth[r.key] : undefined,
      mark: score ? score.marks[r.key] : undefined,
    }))
    view.meta = { from: S.rows.length, to: S.kept.length, score: score && { correct: score.correct, total: score.total } }
  } else if (S.clause === 'select') {
    view.dimmed = S.dimmed
    view.labels = S.labels
    view.rows = S.rows.map((r) => rowOf(r))
    view.meta = { to: S.rows.length }
  } else if (S.clause === 'distinct') {
    view.labels = S.labels
    view.rows = S.rows.map((r) => rowOf(r, { count: S.counts[r.key] }))
    view.meta = { from: S.inputCount, to: S.rows.length, count: done ? scoreCount(S, answer.value) : null }
  } else if (S.clause === 'order') {
    view.dimmed = S.dimmed
    view.labels = S.labels
    const score = done ? scoreOrder(S, answer.placed || []) : null
    view.rows = S.rows.map((r, n) => rowOf(r, { pos: n + 1, mark: score ? score.marks[n] : undefined }))
    view.meta = { to: S.rows.length, score: score && { correct: score.correct, total: score.total } }
  } else if (isSetClause(S.clause)) {
    const keep = new Set(S.kept)
    const split = phase === 'show'
    // The second list of MINUS / INTERSECT is only the thing compared against, never struck out.
    const operand = S.clause === 'minus' || S.clause === 'intersect'
    const side = (rows, right) => rows.map((r) => rowOf(r, { status: right && operand ? 'plain' : keep.has(r.key) ? 'kept' : 'gone', moved: split && keep.has(r.key) }))
    view.panels = { left: side(S.rows, false), right: side(S.right || [], true), result: split ? [...S.rows, ...(S.right || [])].filter((r) => keep.has(r.key)).map((r) => rowOf(r, { status: 'kept' })) : [] }
    view.meta = { left: S.setCounts.left, right: S.setCounts.right, leftDistinct: S.rows.length, rightDistinct: (S.right || []).length, to: S.kept.length }
  }
  if (S.clause === 'join' && done) view.meta.count = scoreCount(S, answer.value)
  return view
}

