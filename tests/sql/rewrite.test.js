import { describe, expect, it } from 'vitest'
import { rewriteOracle, tokenize, untokenize } from '../../src/sql/rewrite/index.js'

describe('rewrite', () => {
  it('rewrite handles semicolons, comments, case, diacritics', () => {
    const r = rewriteOracle("select nume from studenti where prenume = 'Ștefan'; -- x")
    expect(r.sql).not.toMatch(/;/)
    expect(r.sql).toContain("'Ștefan'")
    expect(r.notes).toEqual([])
    // the statement text itself is untouched
    expect(r.sql).toBe("select nume from studenti where prenume = 'Ștefan'")
  })

  it('rejects two statements with ORA-00911 (what Oracle 11g answers, see corpus syntax:two-statements)', () => {
    expect(() => rewriteOracle('select 1 from dual; select 2 from dual')).toThrowError(expect.objectContaining({ code: 'ORA-00911' }))
  })

  it('a semicolon inside a literal or a comment is not a second statement', () => {
    expect(rewriteOracle("select 'a;b' from dual /* x; y */").sql).toContain("'a;b'")
  })

  it('tokenize/untokenize round-trips and classifies tokens', () => {
    const sql = `SELECT "Mixed Case", 1.5e3 -- c\nFROM t WHERE a<>b AND n LIKE 'it''s' || x; /* z */`
    const ts = tokenize(sql)
    expect(untokenize(ts)).toBe(sql)
    const types = new Set(ts.map((t) => t.type))
    for (const t of ['word', 'string', 'qident', 'number', 'op', 'space', 'comment', 'punct']) expect(types).toContain(t)
    expect(ts.find((t) => t.text === "'it''s'").type).toBe('string')
    expect(ts.find((t) => t.text === '<>').type).toBe('op')
    expect(ts.find((t) => t.text === ';').type).toBe('punct')
  })

  it('rewrites the Oracle-only words and leaves literals alone', () => {
    const r = rewriteOracle("select unique nume from studenti minus select nume from studenti where nume = 'minus' and prenume = ''")
    expect(r.sql).toBe("SELECT * FROM (select DISTINCT nume from studenti EXCEPT select nume from studenti where nume = 'minus' and prenume = NULL) ora_s ORDER BY ora_s")
  })

  it('SYSDATE reads the engine clock, or is inlined when a clock is given', () => {
    expect(rewriteOracle('select sysdate from dual').sql).toBe('select ora_sysdate() from dual')
    expect(rewriteOracle('select sysdate from dual', { clock: '2026-10-26 14:30:00' }).sql).toBe("select TIMESTAMP '2026-10-26 14:30:00' from dual")
    expect(() => rewriteOracle('select 1 from dual', { clock: 'tomorrow' })).toThrow(/clock/)
  })

  it('NATURAL JOIN with a qualified common column is ORA-25155', () => {
    expect(() => rewriteOracle('select s.nr_matricol from studenti s natural join note n')).toThrowError(expect.objectContaining({ code: 'ORA-25155' }))
  })
})

describe('rewrite passes compose', () => {
  it('DECODE, TRIM and ANY inside each other are all rewritten', () => {
    const r = rewriteOracle("select decode(trim(nume), 'a', 1, 2) from studenti where an = any (decode(1, 1, 2, 3), 4)").sql
    expect(r).toBe("select CASE WHEN ora_deq((NULLIF(trim(nume), '')), ('a')) THEN ora_widen(1) ELSE ora_conv(2, ora_widen(1)) END from studenti where an = ANY (ARRAY[CASE WHEN ora_deq((1), (1)) THEN ora_widen(2) ELSE ora_conv(3, ora_widen(2)) END, 4])")
  })
})
