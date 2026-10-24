// Shape of a `query-machine` block, shared by the validator script and the tests (no React, no engine).
import { parseQuery } from './machineParse.js'

const CLAUSES = ['from', 'join', 'where', 'select', 'distinct', 'order', 'union', 'union-all', 'intersect', 'minus']
const PREDICT_OK = new Set(['where', 'join', 'order', 'distinct'])
const isStr = (v) => typeof v === 'string' && v.length > 0
const isBi = (v) => !!v && typeof v === 'object' && isStr(v.en) && isStr(v.ro)

// Returns a list of problems; empty means the block is well-formed.
export function validateQueryMachine(block) {
  const errs = []
  if (!isStr(block?.id)) errs.push('query-machine: id missing')
  if (!isStr(block?.dataset)) errs.push('query-machine: dataset missing')
  if (!isStr(block?.sql)) { errs.push('query-machine: sql missing'); return errs }
  if (!Array.isArray(block.show) || block.show.length === 0 || !block.show.every(isStr)) errs.push('query-machine: show must list the columns to display')
  if (!Array.isArray(block.stages) || block.stages.length === 0) { errs.push('query-machine: stages missing'); return errs }
  const seen = new Set()
  block.stages.forEach((s, i) => {
    if (!s || !CLAUSES.includes(s.clause)) { errs.push(`query-machine: stages[${i}].clause "${s?.clause}" is not one of ${CLAUSES.join(', ')}`); return }
    if (seen.has(s.clause)) errs.push(`query-machine: clause "${s.clause}" appears twice`)
    seen.add(s.clause)
    if (s.predict !== undefined && typeof s.predict !== 'boolean') errs.push(`query-machine: stages[${i}].predict must be true or false`)
    if (s.predict && !PREDICT_OK.has(s.clause)) errs.push(`query-machine: "${s.clause}" cannot ask for a prediction`)
    if (s.tri !== undefined && typeof s.tri !== 'boolean') errs.push(`query-machine: stages[${i}].tri must be true or false`)
    if (s.tri && s.clause !== 'where') errs.push('query-machine: tri belongs on the where stage')
  })
  let parsed = null
  try { parsed = parseQuery(block.sql) } catch (e) { errs.push(`query-machine: ${e.message}`) }
  if (parsed) {
    const a = parsed.parts[0]
    const has = {
      join: a.joins.length > 0,
      where: parsed.parts.some((p) => p.where),
      select: true,
      distinct: parsed.parts.some((p) => p.distinct),
      order: parsed.parts.some((p) => p.order.length),
    }
    for (const op of ['union', 'union-all', 'intersect', 'minus']) has[op] = parsed.ops.includes(op)
    for (const s of block.stages) {
      if (s.clause in has && !has[s.clause]) errs.push(`query-machine: stage "${s.clause}" but the query has no such clause`)
    }
    if (parsed.ops.length > 1) errs.push('query-machine: only one set operator per query')
    if (parsed.ops.length && block.stages.some((s) => s.clause === 'order')) errs.push('query-machine: order after a set operator is not supported')
    const setIdx = block.stages.findIndex((s) => ['union', 'union-all', 'intersect', 'minus'].includes(s.clause))
    if (setIdx >= 0 && setIdx !== block.stages.length - 1) errs.push('query-machine: the set operator stage must be last')
  }
  if (block.say !== undefined) {
    if (!block.say || typeof block.say !== 'object') errs.push('query-machine: say must map clause to {en, ro}')
    else {
      for (const [k, v] of Object.entries(block.say)) {
        if (!CLAUSES.includes(k)) errs.push(`query-machine: say.${k} is not a clause`)
        else if (!seen.has(k)) errs.push(`query-machine: say.${k} has no matching stage`)
        if (!isBi(v)) errs.push(`query-machine: say.${k} needs en and ro`)
      }
      for (const c of seen) if (!block.say[c]) errs.push(`query-machine: stage "${c}" has no say text`)
    }
  } else errs.push('query-machine: say missing')
  if (block.ask !== undefined) {
    if (!block.ask || typeof block.ask !== 'object') errs.push('query-machine: ask must map clause to {en, ro}')
    else {
      for (const [k, v] of Object.entries(block.ask)) {
        const st = block.stages.find((x) => x.clause === k)
        if (!st || !st.predict) errs.push(`query-machine: ask.${k} needs a predicted stage`)
        if (!isBi(v)) errs.push(`query-machine: ask.${k} needs en and ro`)
      }
    }
  }
  return errs
}
