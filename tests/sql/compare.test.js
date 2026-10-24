import { describe, expect, it } from 'vitest'
import { diffCategory, diffResults, expectsSequence, rowsDigest } from './compare.js'

const res = (rows, extra = {}) => ({ kind: 'rows', columns: ['N', 'B'], rows, rowCount: rows.length, truncated: false, ...extra })
const SQL = 'SELECT n, b FROM t ORDER BY b'

describe('comparator: ORDER BY ties', () => {
  const expected = res([['a', '1'], ['b', '1'], ['c', '2'], ['d', '3'], ['e', '3']], { orderKeys: [['1'], ['1'], ['2'], ['3'], ['3']] })

  it('accepts any permutation inside a run of equal sort keys', () => {
    expect(diffResults(expected, res([['b', '1'], ['a', '1'], ['c', '2'], ['e', '3'], ['d', '3']]), SQL)).toBeNull()
  })

  it('rejects a row that moved across a sort-key boundary', () => {
    expect(diffResults(expected, res([['a', '1'], ['c', '2'], ['b', '1'], ['d', '3'], ['e', '3']]), SQL)).toMatch(/rows 0-1/)
  })

  it('rejects a wrong row inside a tie', () => {
    expect(diffResults(expected, res([['a', '1'], ['x', '1'], ['c', '2'], ['d', '3'], ['e', '3']]), SQL)).toMatch(/rows 0-1/)
  })

  it('without frozen keys the sequence is compared strictly', () => {
    const strict = res(expected.rows)
    expect(diffResults(strict, res([['b', '1'], ['a', '1'], ['c', '2'], ['d', '3'], ['e', '3']]), SQL)).toMatch(/row 0/)
  })

  it('without ORDER BY rows are compared as a multiset', () => {
    expect(diffResults(res([['a', '1'], ['b', '2']]), res([['b', '2'], ['a', '1']]), 'SELECT n, b FROM t')).toBeNull()
  })
})

describe('comparator: difference categories (known gaps keep their kind)', () => {
  it('strips the values and keeps the kind', () => {
    expect(diffCategory('columns: Oracle ["A"], engine ["B"]')).toBe('columns')
    expect(diffCategory('row count: Oracle 3, engine 7')).toBe('row count')
    expect(diffCategory('rows differ (unordered): Oracle ["a"], engine ["b"]')).toBe('rows')
    expect(diffCategory('row 2: Oracle ["a"], engine ["b"]')).toBe('rows')
    expect(diffCategory('rows 0-1 (sort key ["1"]): Oracle x, engine y')).toBe('rows')
    expect(diffCategory('error code: Oracle ORA-01843, engine ORA-01861 (literal ...)')).toBe('error code ORA-01843 -> ORA-01861')
    expect(diffCategory('Oracle raises ORA-01861, engine returns 4 rows')).toBe('Oracle raises ORA-01861')
    expect(diffCategory('engine raises ORA-00932 (inconsistent datatypes), Oracle returns 5 rows')).toBe('engine raises ORA-00932')
  })

  it('tells a crash (ORA-?) from a wrong value', () => {
    expect(diffCategory('engine raises ORA-? (TypeError: x), Oracle returns 1 rows')).not.toBe(diffCategory('rows differ (unordered): Oracle ["1"], engine ["2"]'))
  })
})

describe('comparator: sorted set-operator output (fix 21)', () => {
  const SET = 'SELECT n, b FROM t UNION SELECT n, b FROM u'
  it('a top-level UNION / INTERSECT / MINUS without ORDER BY is compared as a sequence', () => {
    expect(expectsSequence(SET)).toBe(true)
    expect(expectsSequence('SELECT n FROM t MINUS SELECT n FROM u')).toBe(true)
    expect(diffResults(res([['a', '1'], ['b', '2']]), res([['b', '2'], ['a', '1']]), SET)).toMatch(/row 0/)
    expect(diffResults(res([['a', '1'], ['b', '2']]), res([['a', '1'], ['b', '2']]), SET)).toBeNull()
  })
  it('UNION ALL, subqueries and plain selects stay unordered', () => {
    expect(expectsSequence('SELECT n FROM t UNION ALL SELECT n FROM u')).toBe(false)
    expect(expectsSequence('SELECT n FROM (SELECT n FROM t UNION SELECT n FROM u)')).toBe(false)
    expect(expectsSequence('SELECT n FROM t')).toBe(false)
    expect(expectsSequence('SELECT n FROM t WHERE n IN (SELECT n FROM u UNION SELECT n FROM v)')).toBe(false)
  })
  it('the last operator decides: (a UNION b) UNION ALL c is not sorted as a whole', () => {
    expect(expectsSequence('SELECT n FROM t UNION SELECT n FROM u UNION ALL SELECT n FROM v')).toBe(false)
    expect(expectsSequence('SELECT n FROM t UNION ALL SELECT n FROM u UNION SELECT n FROM v')).toBe(true)
  })
})

describe('comparator: results cut at the row cap', () => {
  const rows = Array.from({ length: 6 }, (_, i) => [`r${i}`, String(i)])
  it('an unordered cut result is compared through its digest', () => {
    const expected = res(rows.slice(0, 2), { rowCount: 6, truncated: true, digest: rowsDigest(rows) })
    const same = res([...rows].reverse())
    expect(diffResults(expected, same, 'SELECT n, b FROM t')).toBeNull()
    expect(diffResults(expected, res([...rows.slice(0, 5), ['x', '9']]), 'SELECT n, b FROM t')).toMatch(/digest/)
    expect(diffResults(expected, res(rows.slice(0, 5), { rowCount: 6 }), 'SELECT n, b FROM t')).toMatch(/needs them all/)
  })
  it('an unordered cut result without a digest is skipped', () => {
    expect(diffResults(res(rows.slice(0, 2), { rowCount: 6, truncated: true }), res(rows), 'SELECT n, b FROM t')).toBeNull()
  })
  it('a cut ORDER BY result: the prefix in sequence, the tail group by membership', () => {
    const keys = [['1'], ['1'], ['2'], ['3']]
    const expected = res([['a', '1'], ['b', '1'], ['c', '2'], ['d', '3']], { rowCount: 6, truncated: true, orderKeys: keys })
    const engine = (extra) => res([['b', '1'], ['a', '1'], ['c', '2'], ...extra], { rowCount: 6 })
    expect(diffResults(expected, engine([['e', '3'], ['d', '3'], ['f', '3']]), SQL)).toBeNull()
    expect(diffResults(expected, engine([['e', '3'], ['f', '3'], ['g', '3']]), SQL)).toMatch(/cut at the row cap/)
    expect(diffResults(expected, res([['b', '1'], ['x', '1'], ['c', '2'], ['d', '3'], ['e', '3'], ['f', '3']]), SQL)).toMatch(/rows 0-1/)
  })
})
