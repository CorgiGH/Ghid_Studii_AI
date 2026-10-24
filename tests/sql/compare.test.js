import { describe, expect, it } from 'vitest'
import { diffCategory, diffResults } from './compare.js'

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
