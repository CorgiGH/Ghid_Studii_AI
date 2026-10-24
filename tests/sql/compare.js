// Comparison rule shared by the differential tests: engine result vs frozen Oracle result.
//   - an Oracle error must be matched by the same ORA code (the message is not compared)
//   - otherwise column headers and row count must match
//   - with ORDER BY the rows must match in sequence; without it, as a multiset (row order is unspecified)
//   - an expected result with `orderKeys` (the ORDER BY key values per row, frozen from Oracle) is compared tie-tolerantly:
//     rows with equal keys form a run, Oracle's order inside a run is unspecified, so a run matches as a multiset
//   - a snapshot cut at its row cap is compared only when there is an ORDER BY (the cut rows are not comparable otherwise)
const key = (r) => JSON.stringify(r)

export function hasOrderBy(sql) {
  return /\bORDER\s+BY\b/i.test(sql)
}

// Returns null when the results agree, otherwise a one-line description of the first difference.
export function diffResults(expected, actual, sql, { skipColumns = false } = {}) {
  if (expected.error || actual.error) {
    if (expected.error && actual.error) {
      return expected.error.code === actual.error.code ? null : `error code: Oracle ${expected.error.code}, engine ${actual.error.code} (${actual.error.message})`
    }
    return expected.error
      ? `Oracle raises ${expected.error.code}, engine returns ${actual.rowCount} rows`
      : `engine raises ${actual.error.code} (${actual.error.message}), Oracle returns ${expected.rowCount} rows`
  }
  if (!skipColumns && key(expected.columns) !== key(actual.columns)) return `columns: Oracle ${key(expected.columns)}, engine ${key(actual.columns)}`
  if (expected.rowCount !== actual.rowCount) return `row count: Oracle ${expected.rowCount}, engine ${actual.rowCount}`
  const ordered = hasOrderBy(sql)
  if (expected.truncated && !ordered) return null
  const a = expected.rows
  const b = actual.rows.slice(0, a.length)
  if (ordered && expected.orderKeys) {
    if (expected.orderKeys.length !== a.length) return `snapshot orderKeys has ${expected.orderKeys.length} rows, result has ${a.length}`
    for (let lo = 0; lo < a.length;) {
      let hi = lo + 1
      while (hi < a.length && key(expected.orderKeys[hi]) === key(expected.orderKeys[lo])) hi++
      const sa = a.slice(lo, hi).map(key).sort()
      const sb = b.slice(lo, hi).map(key).sort()
      for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return `rows ${lo}-${hi - 1} (sort key ${key(expected.orderKeys[lo])}): Oracle ${sa[i]}, engine ${sb[i]}`
      lo = hi
    }
    return null
  }
  if (ordered) {
    for (let i = 0; i < a.length; i++) if (key(a[i]) !== key(b[i])) return `row ${i}: Oracle ${key(a[i])}, engine ${key(b[i])}`
    return null
  }
  const sa = a.map(key).sort()
  const sb = b.map(key).sort()
  for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return `rows differ (unordered): Oracle ${sa[i]}, engine ${sb[i]}`
  return null
}
