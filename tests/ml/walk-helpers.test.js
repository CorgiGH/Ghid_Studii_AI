import { describe, it, expect } from 'vitest'
import {
  overflowFindings, escapesContainer, smallTarget, visibleBand, hitFindings, joltFindings,
  parseColour, effectiveColour, sameColour, backgroundFindings, wrongAttempt, rightText, MIN_TARGET,
} from '../../scripts/ml/walk-helpers.mjs'
import { grade, isRight } from '../../src/ml/calc/answer.js'
import { scopeOf } from '../../src/components/lesson/blocks/calcSpec.js'

describe('overflow check', () => {
  it('allows one pixel of rounding and nothing more', () => {
    expect(overflowFindings({ doc: 0, body: 0, card: 0 })).toEqual([])
    expect(overflowFindings({ doc: 1, body: 1, card: 1 })).toEqual([])
    expect(overflowFindings({ doc: 0, body: 0, card: 0.4 })).toEqual([])
  })
  it('names each measure that is over', () => {
    const f = overflowFindings({ doc: 40, body: 0, card: 12 })
    expect(f).toHaveLength(1)
    expect(f[0]).toContain('doc +40px')
    expect(f[0]).toContain('card +12px')
    expect(f[0]).not.toContain('body')
  })
  it('a table wider than the card is fine inside its own scroller and a finding outside it', () => {
    const card = { left: 16, right: 374 }
    const wide = { left: 16, right: 700 }
    expect(escapesContainer(wide, card, true)).toBe(false)
    expect(escapesContainer(wide, card, false)).toBe(true)
    expect(escapesContainer({ left: 16, right: 374.5 }, card, false)).toBe(false)
    expect(escapesContainer({ left: 4, right: 300 }, card, false)).toBe(true)
  })
})

describe('tap targets', () => {
  it('needs 44 x 44', () => {
    expect(MIN_TARGET).toBe(44)
    expect(smallTarget({ width: 44, height: 44 })).toBe(false)
    expect(smallTarget({ width: 43.6, height: 44 })).toBe(false) // sub-pixel rounding
    expect(smallTarget({ width: 120, height: 36 })).toBe(true)
    expect(smallTarget({ width: 30, height: 60 })).toBe(true)
  })
})

describe('hit-test geometry', () => {
  // 390 x 844 phone: sticky footer from y = 760, header bottom at 56
  const limits = [844, 760]
  it('a button fully above the footer is clear and its tap point is its middle', () => {
    const b = visibleBand({ top: 300, bottom: 348 }, 56, limits)
    expect(b).toMatchObject({ clear: true, visible: 48, limit: 760 })
    expect(b.tapY).toBe(324)
  })
  it('a button half under the footer is not clear; the tap point is the middle of what shows', () => {
    const b = visibleBand({ top: 730, bottom: 778 }, 56, limits)
    expect(b.clear).toBe(false)
    expect(b.visible).toBe(30)
    expect(b.tapY).toBe(745)
  })
  it('a sliver of under 4 px is no target', () => {
    const b = visibleBand({ top: 757, bottom: 805 }, 56, limits)
    expect(b.tapY).toBeNull()
  })
  it('a button scrolled under the top bar counts only what shows below it', () => {
    const b = visibleBand({ top: 30, bottom: 78 }, 56, limits)
    expect(b.visible).toBe(22)
    expect(b.clear).toBe(false)
  })
  it('a fixed bottom bar lowers the limit', () => {
    const b = visibleBand({ top: 700, bottom: 748 }, 56, [844, 760, 700])
    expect(b.visible).toBe(0)
    expect(b.tapY).toBeNull()
  })
  it('reports a covered control, and one that is not clear when it must be', () => {
    const b = visibleBand({ top: 730, bottom: 778 }, 56, limits)
    expect(hitFindings('Verifică', b, false, 'at landing scroll')[0]).toContain('covered at landing scroll')
    expect(hitFindings('Verifică', b, true, 'at landing scroll')).toEqual([])
    expect(hitFindings('Verifică', b, true, 'at max scroll', { mustBeClear: true })[0]).toContain('not fully clear')
    const gone = visibleBand({ top: 757, bottom: 805 }, 56, limits)
    expect(hitFindings('Verifică', gone, false, 'x')).toEqual([]) // nothing shows, nothing to cover
  })
})

describe('jolt on a screen change', () => {
  it('a smooth scroll up to the top is fine', () => {
    expect(joltFindings([{ t: 0, y: 900 }, { t: 60, y: 600 }, { t: 120, y: 200 }, { t: 200, y: 0 }])).toEqual([])
  })
  it('a jump back down is a finding', () => {
    const f = joltFindings([{ t: 0, y: 900 }, { t: 60, y: 300 }, { t: 120, y: 800 }, { t: 200, y: 0 }])
    expect(f[0]).toContain('jumped back')
  })
  it('a screen that does not end at the top is a finding', () => {
    expect(joltFindings([{ t: 0, y: 500 }, { t: 100, y: 120 }])[0]).toContain('does not start at its top')
  })
  it('no samples is a finding, not a pass', () => {
    expect(joltFindings([])).toHaveLength(1)
  })
})

describe('colour sampling', () => {
  it('reads rgb, rgba and color(srgb) as the browser reports them', () => {
    expect(parseColour('rgb(15, 23, 42)')).toEqual({ r: 15, g: 23, b: 42, a: 1 })
    expect(parseColour('rgba(0, 0, 0, 0)').a).toBe(0)
    expect(parseColour('transparent').a).toBe(0)
    expect(parseColour('rgba(255, 255, 255, 0.5)')).toEqual({ r: 255, g: 255, b: 255, a: 0.5 })
    const c = parseColour('color(srgb 0.0588235 0.0901961 0.164706)')
    expect([Math.round(c.r), Math.round(c.g), Math.round(c.b)]).toEqual([15, 23, 42])
    expect(parseColour('color(srgb 1 0 0 / 0.5)').a).toBe(0.5)
    expect(parseColour('lab(50 10 10)')).toBeNull()
  })
  it('takes the first opaque layer, skipping transparent ones', () => {
    const bg = 'rgb(15, 23, 42)'
    expect(effectiveColour(['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)', bg, 'rgb(255, 255, 255)'])).toEqual({ r: 15, g: 23, b: 42, a: 1 })
  })
  it('composites a half-transparent layer over the one behind it', () => {
    const c = effectiveColour(['rgba(255, 255, 255, 0.5)', 'rgb(0, 0, 0)'])
    expect(c).toEqual({ r: 128, g: 128, b: 128, a: 1 })
  })
  it('falls back to the canvas when nothing is opaque', () => {
    expect(effectiveColour(['rgba(0, 0, 0, 0)'], 'rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 })
    expect(effectiveColour(['lab(1 1 1)'])).toBeNull()
  })
  it('sameColour allows two levels of rounding', () => {
    expect(sameColour({ r: 15, g: 23, b: 42 }, { r: 16, g: 22, b: 43 })).toBe(true)
    expect(sameColour({ r: 15, g: 23, b: 42 }, { r: 255, g: 255, b: 255 })).toBe(false)
    expect(sameColour(null, { r: 0, g: 0, b: 0 })).toBe(false)
  })
  const bg = 'rgb(15, 23, 42)'
  it('three dark frames show nothing; one white frame is reported', () => {
    const dark = ['rgba(0, 0, 0, 0)', bg]
    const ok = [{ t: 60, points: [dark, dark, dark] }, { t: 140, points: [dark, dark, dark] }]
    expect(backgroundFindings(ok, bg)).toEqual([])
    const flash = [...ok, { t: 220, points: [dark, ['rgb(255, 255, 255)'], dark] }]
    const f = backgroundFindings(flash, bg)
    expect(f).toHaveLength(1)
    expect(f[0]).toContain('point 2, 220 ms')
  })
  it('the card colour is allowed too, any other colour is not', () => {
    const card = 'rgb(29, 42, 34)'
    const frames = [{ t: 80, points: [[card], [bg], [card]] }]
    expect(backgroundFindings(frames, [bg, card])).toEqual([])
    expect(backgroundFindings(frames, bg)).toHaveLength(2)
  })
  it('reports at most three findings', () => {
    const white = ['rgb(255, 255, 255)']
    expect(backgroundFindings([{ t: 1, points: [white, white, white] }, { t: 2, points: [white, white, white] }], bg)).toHaveLength(3)
  })
  it('an unreadable --theme-bg is reported rather than passed', () => {
    expect(backgroundFindings([], 'var(--x)')[0]).toContain('cannot read')
    expect(backgroundFindings([], 'rgba(0, 0, 0, 0)')[0]).toContain('cannot read')
  })
})

describe('answers to type', () => {
  const block = {
    id: 'ml-l01-ex', statement: { en: 'x', ro: 'x' },
    data: { a: 9, b: 17 },
    fields: [
      { id: 'h', label: { en: 'H', ro: 'H' }, kind: 'num', formula: 'a / b', expected: 0.5294, tol: 0.001 },
      { id: 'who', label: { en: 'W', ro: 'W' }, kind: 'choice', formula: '"Outlook"', expected: 'Outlook', options: [{ en: 'Outlook', ro: 'Outlook' }, { en: 'Wind', ro: 'Vânt' }] },
    ],
    detectors: [{ field: 'h', formula: 'b / a', message: { en: 'swapped', ro: 'inversat' } }],
  }
  it('types the value of the formula for the right pass, and the page agrees', () => {
    expect(rightText(block.fields[0], block)).toBe('0.529412')
    expect(isRight(grade(block.fields[0], rightText(block.fields[0], block), scopeOf(block), block.detectors))).toBe(true)
    expect(rightText(block.fields[1], block)).toBe('Outlook')
  })
  it('a wrong `expected` in the JSON is not typed: the page then marks the formula value wrong', () => {
    const bad = { ...block, fields: [{ ...block.fields[0], expected: 0.5 }, block.fields[1]] }
    const text = rightText(bad.fields[0], bad)
    expect(text).toBe('0.529412')
    expect(isRight(grade(bad.fields[0], text, scopeOf(bad), []))).toBe(false)
  })
  it('a fraction field types the exact fraction and a formula that fails falls back to expected', () => {
    const b = { id: 'b', data: { a: 9, b: 17 }, fields: [] }
    expect(rightText({ kind: 'frac', formula: 'a / b', expected: '9/17' }, b)).toBe('9/17')
    expect(rightText({ kind: 'num', formula: 'nope(', expected: 0.25 }, b)).toBe('0.25')
  })
  it('uses the first detector value for the wrong pass, and it is not right', () => {
    const w = wrongAttempt(block)
    expect(w.via).toBe('detector')
    expect(w.fieldId).toBe('h')
    expect(Number(w.text)).toBeCloseTo(17 / 9, 5)
    expect(w.verdict).toBe('wrong')
  })
  it('without a detector it types expected + 10 tol', () => {
    const w = wrongAttempt({ ...block, detectors: [] })
    expect(w.via).toBe('offset')
    expect(Number(w.text)).toBeCloseTo(0.5294 + 0.01, 6)
    expect(w.verdict).toBe('wrong')
  })
  it('a detector that equals the right answer is skipped, not typed as the wrong one', () => {
    const w = wrongAttempt({ ...block, detectors: [{ field: 'h', formula: 'a / b', message: { en: 'm', ro: 'm' } }] })
    expect(w.via).toBe('offset')
  })
  it('a choice-only block gets a different option', () => {
    const w = wrongAttempt({ ...block, fields: [block.fields[1]], detectors: [] })
    expect(w).toMatchObject({ fieldId: 'who', text: 'Wind', via: 'other' })
  })
  it('a fraction field is offset from its numeric value', () => {
    const w = wrongAttempt({ id: 'b', statement: { en: 'x', ro: 'x' }, fields: [{ id: 'p', label: { en: 'p', ro: 'p' }, kind: 'frac', formula: '9/17', expected: '9/17' }] })
    expect(w.via).toBe('offset')
    expect(Number(w.text)).toBeCloseTo(9 / 17 + 10 * 0.0005, 5) // default tolerance below 1 is 0.0005
  })
  it('returns null when nothing wrong can be built', () => {
    expect(wrongAttempt({ id: 'z', statement: { en: 'x', ro: 'x' }, fields: [] })).toBeNull()
  })
})
