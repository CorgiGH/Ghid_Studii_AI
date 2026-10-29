// The pure parts of the ML walk (scripts/ml/walk-ml.mjs): geometry, colour and answer helpers with no browser in them, so
// tests/ml/walk-helpers.test.js can pin them. The walk collects raw numbers and strings in the page and judges them here.
import { evaluate, toNumber, Fraction } from '../../src/ml/calc/formula.js'
import { grade, isRight, tolOf, norm, parseAnswer } from '../../src/ml/calc/answer.js'
import { scopeOf } from '../../src/components/lesson/blocks/calcSpec.js'

export const MIN_TARGET = 44 // px, the smallest tap target (G9)

// ---- overflow ------------------------------------------------------------------------------------------------------------

// { doc, body, card } are scrollWidth - clientWidth (or innerWidth) measured in the page. One pixel of rounding is allowed.
export function overflowFindings(o) {
  const bad = ['doc', 'body', 'card'].filter((k) => (o?.[k] ?? 0) > 1)
  return bad.length ? [`horizontal overflow (${bad.map((k) => `${k} +${o[k]}px`).join(', ')})`] : []
}

// An element escapes when it sticks out of its container (left or right) and no scroller sits between them: a wide table inside
// an `overflow-x:auto` box is fine, the same table in the plain card is not. rect/container are { left, right }.
export function escapesContainer(rect, container, insideScroller) {
  if (insideScroller) return false
  return rect.right > container.right + 1 || rect.left < container.left - 1
}

// ---- tap targets and hit-testing -------------------------------------------------------------------------------------------

export function smallTarget(rect, min = MIN_TARGET) {
  return rect.width < min - 0.5 || rect.height < min - 0.5
}

// Where a learner's tap on an element lands at the current scroll: the part of its box between the top bar (`above`) and the lowest
// obstruction (`limits`: the window's bottom edge, the sticky footer's top, a fixed bottom bar's top).
// Returns { top, bottom, visible, clear, tapY }; tapY is the middle of the visible part, or null when under 4 px of it shows
// (a sliver is no tap target, and its middle can fall on a sub-pixel edge of the footer).
export function visibleBand(rect, above, limits) {
  const limit = Math.min(...limits)
  const top = Math.max(rect.top, above)
  const bottom = Math.min(rect.bottom, limit)
  const visible = Math.max(0, bottom - top)
  return {
    top: Math.round(top),
    bottom: Math.round(bottom),
    limit: Math.round(limit),
    visible: Math.round(visible),
    clear: rect.top >= above && rect.bottom <= limit,
    tapY: bottom - top < 4 ? null : (top + bottom) / 2,
  }
}

// What a hit-test finds: `reaches` is true when the element at the tap point is the element itself or inside it.
// A control that is not on screen at all (tapY null) is "covered" only when `mustShow` says part of it should be.
export function hitFindings(name, band, reaches, where, { mustBeClear = false } = {}) {
  const out = []
  if (band.tapY !== null && reaches === false) out.push(`${name} is covered ${where}: a tap on its visible part reaches something else`)
  if (mustBeClear && !band.clear) out.push(`${name} is not fully clear ${where} (${band.top}-${band.bottom}, limit ${band.limit})`)
  return out
}

// ---- jolt on screen change ---------------------------------------------------------------------------------------------------

// series: [{ t, y }] of window.scrollY from the Continue press on. Scrolled down and pressing Continue the page may only move up
// (the smooth scroll to the top); a value higher than an earlier one is a jump back, and the last value must be 0.
export function joltFindings(series) {
  const out = []
  if (!series?.length) return ['no scroll samples after Continue']
  for (let i = 1; i < series.length; i++) {
    if (series[i].y > series[i - 1].y + 1) { out.push(`scroll jumped back down at ${series[i].t} ms (${Math.round(series[i - 1].y)} -> ${Math.round(series[i].y)})`); break }
  }
  const last = series[series.length - 1].y
  if (last > 1) out.push(`the new screen does not start at its top (scrollY ${Math.round(last)})`)
  return out
}

// ---- colour ----------------------------------------------------------------------------------------------------------------

// Computed colours come as rgb(), rgba() or color(srgb r g b / a) (a color-mix result). Returns { r, g, b, a } on a 0-255 scale.
export function parseColour(s) {
  const str = String(s ?? '').trim().toLowerCase()
  if (!str || str === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }
  let m = str.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/)
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: alpha(m[4]) }
  m = str.match(/^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/)
  if (m) return { r: +m[1] * 255, g: +m[2] * 255, b: +m[3] * 255, a: alpha(m[4]) }
  return null
}
function alpha(v) {
  if (v === undefined) return 1
  return v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v)
}

// The colour a viewer sees at a point, from the element's computed background and those of its ancestors (innermost first).
// Layers are composited until one is opaque; if none is, the rest shows through as the canvas colour given.
export function effectiveColour(chain, canvas = 'rgb(255, 255, 255)') {
  const layers = chain.map(parseColour)
  if (layers.some((l) => l === null)) return null
  let acc = { r: 0, g: 0, b: 0, a: 0 } // composited so far, premultiplied order: front to back
  for (const l of layers) {
    if (acc.a >= 1) break
    if (l.a <= 0) continue
    const w = l.a * (1 - acc.a)
    acc = { r: acc.r + l.r * w, g: acc.g + l.g * w, b: acc.b + l.b * w, a: acc.a + w }
  }
  if (acc.a < 1) {
    const c = parseColour(canvas)
    const w = 1 - acc.a
    acc = { r: acc.r + c.r * w, g: acc.g + c.g * w, b: acc.b + c.b * w, a: 1 }
  }
  return { r: Math.round(acc.r), g: Math.round(acc.g), b: Math.round(acc.b), a: 1 }
}

export function sameColour(a, b, tol = 2) {
  return !!a && !!b && Math.abs(a.r - b.r) <= tol && Math.abs(a.g - b.g) <= tol && Math.abs(a.b - b.b) <= tol
}

// samples: [{ t, points: [chain, chain, chain] }] taken while a screen changes. `allowed` is the computed value (or a list of them)
// of the colours that may show at a sampled point: the page background (--theme-content-bg) and the card's (--theme-card-bg).
// Any other colour at any point of any frame (a flash of white in dark mode) is a finding.
export function backgroundFindings(samples, allowed) {
  const list = (Array.isArray(allowed) ? allowed : [allowed]).map((c) => ({ css: c, rgb: parseColour(c) }))
  const bad = list.find((c) => !c.rgb || c.rgb.a < 1)
  if (!list.length || bad) return [`cannot read the theme background (${bad ? bad.css : 'none given'})`]
  const out = []
  for (const s of samples) {
    s.points.forEach((chain, i) => {
      const got = effectiveColour(chain, list[0].css)
      if (!got) out.push(`unreadable background at point ${i + 1}, ${s.t} ms: ${chain[0]}`)
      else if (!list.some((c) => sameColour(got, c.rgb))) out.push(`background is neither the page's nor the card's colour at point ${i + 1}, ${s.t} ms: rgb(${got.r}, ${got.g}, ${got.b})`)
    })
  }
  return out.slice(0, 3)
}

// ---- what to type into a calc-exercise -----------------------------------------------------------------------------------

const TF_VALUES = ['true', 'false']

// The text to type for the right answer: the value of the field's formula over the block's data, so a wrong `expected` in the JSON
// makes the page's verdict wrong and the walk fails (the content test checks the same agreement). A formula that does not evaluate
// falls back to `expected`.
export function rightText(field, block) {
  let v
  try { v = evaluate(field.formula, scopeOf(block || {})) } catch { return String(field.expected) }
  if (v instanceof Fraction) return field.kind === 'frac' ? v.toString() : fixed(toNumber(v))
  if (typeof v === 'number') return fixed(v)
  if (Array.isArray(v)) return v.join(', ')
  if (typeof v === 'string' || typeof v === 'boolean') return String(v)
  return String(field.expected)
}
const fixed = (n) => n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')

// A wrong answer for the block (plan, Task 10): the first detector's value when the block has one, else expected + 10*tol for
// the first numeric field, else a different choice. Returns { fieldId, text, via } or null when no wrong text can be built.
// The text is checked with grade(): it is never accepted as right.
export function wrongAttempt(block) {
  const scope = scopeOf(block)
  const fields = block.fields || []
  const wrong = (f, text, via) => {
    const v = grade(f, text, scope, block.detectors || [])
    return isRight(v) ? null : { fieldId: f.id, text, via, verdict: v.verdict }
  }
  for (const d of block.detectors || []) {
    const f = fields.find((x) => x.id === d.field)
    if (!f) continue
    let v
    try { v = evaluate(d.formula, scope) } catch { continue }
    let text
    if (v instanceof Fraction || typeof v === 'number') text = fixed(toNumber(v))
    else if (typeof v === 'string' || typeof v === 'boolean') text = String(v)
    else continue
    const a = wrong(f, text, 'detector')
    if (a) return a
  }
  for (const f of fields) {
    if (f.kind === 'num' || f.kind === 'frac') {
      const p = parseAnswer(String(f.expected), f.kind)
      const e = p.ok ? (p.value instanceof Fraction ? p.value.toNumber() : p.value) : NaN
      if (!Number.isFinite(e)) continue
      const a = wrong(f, String(Math.round((e + 10 * tolOf(f)) * 1e6) / 1e6), 'offset')
      if (a) return a
    } else if (f.kind === 'tf') {
      const other = TF_VALUES.find((v) => v !== String(f.expected))
      const a = wrong(f, other, 'other')
      if (a) return a
    } else if (f.kind === 'choice' && Array.isArray(f.options)) {
      const o = f.options.find((x) => norm(x.en) !== norm(f.expected))
      const a = o && wrong(f, o.en, 'other')
      if (a) return a
    } else if (f.kind === 'multi' && Array.isArray(f.options)) {
      const o = f.options[0]
      const a = o && wrong(f, o.en, 'other')
      if (a) return a
    }
  }
  return null
}
