import { describe, expect, it } from 'vitest'
import { diffResults } from './compare.js'

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
