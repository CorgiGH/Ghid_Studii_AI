// Automated walk through every screen of every ML lesson, in a real (headless) Chrome against `vite preview`.
// A fork of scripts/sql/walk-lessons.mjs without the SQL engine, with the checks the BD build missed (docs/superpowers/specs/
// 2026-10-28-bd-mistakes-to-prevent.md, G9 and G10).
//
//   PUPPETEER_EXECUTABLE_PATH=/etc/profiles/per-user/alexa/bin/google-chrome-stable \
//     node scripts/ml/walk-ml.mjs [--lessons ml-l01,ml-l02] [--widths 390,1280] [--jobs 4] [--port 4190] [--out <dir>] [--no-build]
//
// For each lesson it opens the lesson in a fresh browser context and goes through the screens with Continue. On each screen it
// answers like a learner would:
//   mcq            the correct option
//   reflect        reveal the answer
//   viz (predict)  predict ("Arată-mi", or pick on the number line, then "Arată"), then step to the end
//   proof-steps    the correct pick at every step that asks, then "Mai departe" until the proof is shown
//   calc-exercise  first the first detector's value (or expected + 10 tol when the block has no detector): the verdict must not be
//                  right; then the expected answers: every verdict must be right
// and checks, on every screen: Continue unlocks, no console errors, no page errors, no horizontal overflow, the screen is not blank
// for long after the transition. At 390 px also: on a calc screen the Verifică button and every field are hit-tested above the
// sticky footer at landing and at max scroll; every visible button and input is at least 44x44; no element is wider than its scroll
// container; scrolled to the bottom, Continue into the next screen never jumps the scroll back and no frame shows a background that is
// neither the page's nor the card's colour (the 390 px walk runs once in light and once in dark mode). Once per lesson: Back keeps the
// answers (first screen with an mcq, a calc exercise and a proof), a reload on the first calc screen restores the typed answers,
// verdicts and hints, and an answer given in one tab reaches a second tab open on the same screen after focus (the shared store holds it and
// that tab's Continue unlocks), so two tabs never overwrite each other's progress.
// One screenshot per screen per run goes to <out>/shots, the JSON report to <out>/report.json (default
// .superpowers/sdd/2026-10-28-ml-lessons/walk, ignored by a .gitignore the script writes there). Exit code 1 on any failure.
// With no lesson file yet it only proves the build starts and /y2s1/ml opens, and says "0 lessons".
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'
import { preview } from 'vite'
import {
  overflowFindings, escapesContainer, smallTarget, visibleBand, hitFindings, joltFindings, backgroundFindings, wrongAttempt, rightText,
} from './walk-helpers.mjs'
import { parseAnswer, norm } from '../../src/ml/calc/answer.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const argv = process.argv.slice(2)
const arg = (name, dflt) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : dflt)
const OUT = path.resolve(arg('--out', path.join(ROOT, '.superpowers', 'sdd', '2026-10-28-ml-lessons', 'walk')))
const WIDTHS = arg('--widths', '390,1280').split(',').map(Number)
const ONLY = arg('--lessons', '') ? new Set(arg('--lessons', '').split(',')) : null
const JOBS = Number(arg('--jobs', '4'))
const PORT = Number(arg('--port', '4190'))
const ORIGIN = `http://127.0.0.1:${PORT}`
const BASE = `${ORIGIN}/Ghid_Studii_AI/y2s1/ml`
const SIZES = { 390: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }, 1280: { width: 1280, height: 800, deviceScaleFactor: 1 } }
const BLANK_LIMIT_MS = 6000
const SCREEN = '[data-testid=lesson-screen]:not([data-leaving])'

if (!argv.includes('--no-build')) execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'ignore' })

// ---- what to walk: the lesson files in registration order (tests/content/ml-content.test.js pins the order to index.js)
const COURSES = path.join(ROOT, 'src', 'content', 'ml', 'courses')
const lessons = (fs.existsSync(COURSES) ? fs.readdirSync(COURSES) : []).filter((f) => /^lesson-.*\.json$/.test(f)).sort()
  .map((f, i) => ({ n: i + 1, file: f, json: JSON.parse(fs.readFileSync(path.join(COURSES, f), 'utf8')) }))
  .filter((l) => !ONLY || ONLY.has(l.json.meta.id))

fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true })
fs.writeFileSync(path.join(OUT, '.gitignore'), '*\n') // the report and shots are never committed, whatever the repo's ignore list says
const server = await preview({ root: ROOT, configFile: path.join(ROOT, 'vite.config.js'), preview: { port: PORT, strictPort: true, host: '127.0.0.1' } })
const browser = await puppeteer.launch({ executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const IGNORED_CONSOLE = [] // console errors that are not the lessons' (none)

// ---- small page helpers
async function waitFor(page, fn, arg, timeout = 15000, step = 80) {
  const t0 = Date.now()
  for (;;) {
    const v = await page.evaluate(fn, arg)
    if (v) return v
    if (Date.now() - t0 > timeout) return null
    await sleep(step)
  }
}
const nextEnabled = (page) => page.evaluate(() => { const b = document.querySelector('[data-testid=lesson-next]'); return !!b && !b.disabled })

// A screen change runs a smooth scroll to the top while the new screen slides in; a click aimed during that motion lands where the
// target used to be. Wait until no screen is leaving and the page has stopped scrolling (as a person would).
async function settle(page) {
  await page.waitForFunction(() => {
    const w = window.__walkSettle || (window.__walkSettle = { y: -1, same: 0 })
    if (document.querySelector('[data-testid=lesson-screen][data-leaving]')) { w.same = 0; return false }
    w.same = window.scrollY === w.y ? w.same + 1 : 0
    w.y = window.scrollY
    return w.same >= 3
  }, { timeout: 5000, polling: 60 }).catch(() => {})
}

// Mark the i-th visible match of `sel` (or, with `sub`, the j-th match of sub.sel inside it) so it can be clicked by selector.
async function mark(page, sel, i = 0, sub = null) {
  return page.evaluate((sel, i, sub) => {
    document.querySelectorAll('[data-walk-target]').forEach((e) => e.removeAttribute('data-walk-target'))
    const shown = (e) => e.offsetParent !== null || getComputedStyle(e).position === 'fixed'
    let el = [...document.querySelectorAll(sel)].filter(shown)[i]
    if (el && sub) el = [...el.querySelectorAll(sub.sel)].filter(shown)[sub.i ?? 0]
    if (!el) return false
    el.setAttribute('data-walk-target', '1')
    return true
  }, sel, i, sub)
}

// Click an element the way a learner would: scroll it clear of the fixed footer first, then click its centre.
async function clickEl(page, selector) {
  await settle(page)
  for (let attempt = 0; attempt < 4; attempt++) {
    const box = await page.evaluate((sel, attempt) => {
      const el = [...document.querySelectorAll(sel)].find((e) => e.offsetParent !== null) || document.querySelector(sel)
      if (!el) return null
      el.scrollIntoView({ block: attempt % 2 === 0 ? 'center' : 'start' })
      if (attempt >= 2) window.scrollBy(0, -140)
      const r = el.getBoundingClientRect()
      const x = r.x + r.width / 2
      const y = r.y + Math.min(r.height / 2, 20)
      const top = document.elementFromPoint(x, y)
      return { x, y, ok: !!top && (el === top || el.contains(top)) }
    }, selector, attempt)
    if (!box) throw new Error(`no element ${selector}`)
    if (box.ok) { await page.mouse.click(box.x, box.y); return }
    await sleep(100)
  }
  throw new Error(`${selector} stays covered by another element`)
}
async function clickAt(page, sel, i = 0, sub = null) {
  if (!(await mark(page, sel, i, sub))) throw new Error(`no element ${sel}[${i}]${sub ? ` ${sub.sel}[${sub.i ?? 0}]` : ''}`)
  await clickEl(page, '[data-walk-target]')
}

// ---- geometry in the page, judged by walk-helpers.mjs
// Where `sel`[i] is and what can cover it: the top bar, the window's bottom edge, the sticky footer, a fixed bottom bar.
const geometry = (page, sel, i) => page.evaluate((sel, i) => {
  const el = [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null)[i]
  if (!el) return null
  const r = el.getBoundingClientRect()
  const limits = [innerHeight]
  const footer = document.querySelector('.lp-footer')?.getBoundingClientRect()
  if (footer && footer.height > 0) limits.push(footer.top)
  for (const n of document.querySelectorAll('nav')) {
    const b = n.getBoundingClientRect()
    if (getComputedStyle(n).position === 'fixed' && b.height > 0 && b.bottom >= innerHeight - 1) limits.push(b.top)
  }
  const header = document.querySelector('header')?.getBoundingClientRect()
  return { rect: { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height }, above: Math.max(0, header && header.bottom > 0 ? header.bottom : 0), limits }
}, sel, i)

const reaches = (page, sel, i, x, y) => page.evaluate((sel, i, x, y) => {
  const el = [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null)[i]
  const top = document.elementFromPoint(x, y)
  return !!el && !!top && (el === top || el.contains(top))
}, sel, i, x, y)

// A tap on `sel`[i] must reach it wherever part of it shows above the footer (landing scroll), and at max scroll it must be fully clear.
async function checkReach(page, name, sel, i) {
  const fails = []
  const at = async (where, opts) => {
    const g = await geometry(page, sel, i)
    if (!g) { fails.push(`${name}: not found`); return }
    const band = visibleBand(g.rect, g.above, g.limits)
    const hit = band.tapY === null ? null : await reaches(page, sel, i, (g.rect.left + g.rect.right) / 2, band.tapY)
    fails.push(...hitFindings(name, band, hit, where, opts))
  }
  await settle(page)
  await at('at landing scroll')
  const y0 = await page.evaluate(() => scrollY)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await sleep(350)
  await at('at max scroll', { mustBeClear: true })
  await page.evaluate((y) => window.scrollTo(0, y), y0)
  await sleep(200)
  return fails
}

// Every visible button and input of the screen and the footer, and every element that sticks out of its container.
async function layoutChecks(page) {
  const raw = await page.evaluate((SCREEN) => {
    const card = document.querySelector(`${SCREEN}`) || document.querySelector('.lp-card')
    if (!card) return null
    const cr = card.getBoundingClientRect()
    const shown = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' }
    const label = (e) => `${e.tagName.toLowerCase()}${e.dataset.testid ? `[${e.dataset.testid}]` : e.className && typeof e.className === 'string' ? `.${e.className.split(' ')[0]}` : ''} "${(e.innerText || e.value || e.getAttribute('aria-label') || '').trim().slice(0, 24)}"`
    const controls = [...document.querySelectorAll(`${SCREEN} :is(button, input:not([type=hidden]), textarea, select), .lp-footer :is(button, input)`)].filter(shown)
      .map((e) => { const r = e.getBoundingClientRect(); return { name: label(e), width: r.width, height: r.height } })
    const wide = []
    for (const e of card.querySelectorAll('*')) {
      if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue
      const r = e.getBoundingClientRect()
      if (r.width <= 1 || r.height <= 1) continue
      if (!(r.right > cr.right + 1 || r.left < cr.left - 1)) continue
      if (getComputedStyle(e).position === 'fixed') continue
      let scroller = false
      for (let p = e.parentElement; p && p !== card; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX
        if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') { scroller = true; break }
      }
      wide.push({ name: label(e), rect: { left: r.left, right: r.right }, scroller })
    }
    return { container: { left: cr.left, right: cr.right }, controls, wide: wide.slice(0, 200) }
  }, SCREEN)
  if (!raw) return []
  const fails = []
  const small = raw.controls.filter((c) => smallTarget(c))
  for (const c of small.slice(0, 4)) fails.push(`touch target under 44x44: ${c.name} is ${Math.round(c.width)}x${Math.round(c.height)}`)
  if (small.length > 4) fails.push(`... and ${small.length - 4} more touch targets under 44x44`)
  const out = raw.wide.filter((w) => escapesContainer(w.rect, raw.container, w.scroller))
  for (const w of out.slice(0, 3)) fails.push(`wider than its container with no scroller: ${w.name} (${Math.round(w.rect.left)}..${Math.round(w.rect.right)} vs ${Math.round(raw.container.left)}..${Math.round(raw.container.right)})`)
  return fails
}

// The colours a viewer may see where no content covers the page: the theme's page background and its card background.
const themeColours = (page) => page.evaluate(() => {
  const probe = (v) => { const d = document.createElement('div'); d.style.background = `var(${v})`; document.body.appendChild(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return c }
  return [probe('--theme-content-bg'), probe('--theme-card-bg')]
})

// Scrolled to the bottom, press Continue and record scrollY and the colour at three points of the page on every frame for ~0.8 s.
async function continueWithRecording(page, stats) {
  await settle(page)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await sleep(300)
  const allowed = await themeColours(page)
  await page.evaluate(() => {
    const rec = (window.__walkRec = { series: [], samples: [], done: false })
    const t0 = performance.now()
    const chain = (x, y) => { const out = []; for (let n = document.elementFromPoint(x, y); n; n = n.parentElement) out.push(getComputedStyle(n).backgroundColor); return out }
    const frame = () => {
      const t = Math.round(performance.now() - t0)
      rec.series.push({ t, y: window.scrollY })
      rec.samples.push({ t, points: [0.25, 0.5, 0.85].map((f) => chain(3, Math.round(innerHeight * f))) })
      if (t < 800) requestAnimationFrame(frame); else rec.done = true
    }
    requestAnimationFrame(frame)
  })
  await clickEl(page, '[data-testid=lesson-next]')
  await waitFor(page, () => window.__walkRec.done, null, 4000, 50)
  const rec = await page.evaluate(() => window.__walkRec)
  if (stats) Object.assign(stats, { frames: rec.series.length, fromY: Math.round(rec.series[0]?.y ?? 0), toY: Math.round(rec.series.at(-1)?.y ?? 0), colours: allowed })
  // frames before the press sit at the bottom of the old screen; the press itself happens a few frames in
  return [...joltFindings(rec.series), ...backgroundFindings(rec.samples, allowed)]
}

// ---- one screen
const countOf = (page, sel) => page.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => e.offsetParent !== null).length, sel)

// Fill the buttons of one choice / tf / multi field so that exactly `want` (option indexes) are pressed.
async function setButtons(page, fieldIdx, want) {
  const states = await page.evaluate((SCREEN, fieldIdx) => {
    const f = [...document.querySelectorAll(`${SCREEN} .ch-calc-field`)][fieldIdx]
    return f ? [...f.querySelectorAll('.ch-calc-choice')].map((b) => b.getAttribute('aria-pressed') === 'true') : null
  }, SCREEN, fieldIdx)
  if (!states) throw new Error(`calc field ${fieldIdx} not found`)
  for (let j = 0; j < states.length; j++) {
    if (states[j] !== want.includes(j)) await clickAt(page, `${SCREEN} .ch-calc-field`, fieldIdx, { sel: '.ch-calc-choice', i: j })
  }
}

// Type (or press) `text` as the answer to field `f` (the fieldIdx-th field of the screen).
async function enter(page, f, fieldIdx, text) {
  if (f.kind === 'tf') return setButtons(page, fieldIdx, [text === 'true' ? 0 : 1])
  if (f.kind === 'choice' && f.options) return setButtons(page, fieldIdx, [f.options.findIndex((o) => norm(o.en) === norm(text) || norm(o.ro) === norm(text))])
  if (f.kind === 'multi') {
    const names = parseAnswer(text, 'multi', f.options).value || []
    return setButtons(page, fieldIdx, f.options.map((o, j) => (names.some((n) => norm(n) === norm(o.en)) ? j : -1)).filter((j) => j >= 0))
  }
  await clickAt(page, `${SCREEN} [data-testid=calc-input-${f.id}]`)
  await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control')
  await page.keyboard.press('Backspace')
  await page.keyboard.type(String(text), { delay: 0 })
}

const verdictOf = (page, id) => page.evaluate((s, id) => document.querySelector(`${s} [data-testid=calc-verdict-${id}]`)?.dataset.verdict ?? null, SCREEN, id)

async function pressCheck(page, ids) {
  await clickAt(page, `${SCREEN} [data-testid=calc-check]`)
  await waitFor(page, (a) => a.ids.every((id) => document.querySelector(`${a.s} [data-testid=calc-verdict-${id}]`)), { ids, s: SCREEN }, 5000, 60)
  await sleep(120)
}

async function answerCalc(page, block, ctx, base, opts) {
  const fails = []
  const fieldIdx = (f) => base + block.fields.indexOf(f)
  const calcIdx = opts.calcIdx
  if (ctx.width === 390) {
    for (const f of block.fields) {
      const sel = f.kind === 'num' || f.kind === 'frac' || (f.kind === 'choice' && !f.options) ? `${SCREEN} [data-testid=calc-input-${f.id}]` : `${SCREEN} .ch-calc-field`
      const i = sel.endsWith('field') ? fieldIdx(f) : 0
      for (const m of await checkReach(page, `calc ${block.id} field ${f.id}`, sel, i)) fails.push(m)
    }
    for (const m of await checkReach(page, `calc ${block.id} Verifică`, `${SCREEN} [data-testid=calc-check]`, calcIdx)) fails.push(m)
  }
  const wrong = wrongAttempt(block)
  const ids = block.fields.map((f) => f.id)
  if (!wrong) fails.push(`calc ${block.id}: cannot build a wrong answer to try`)
  else {
    for (const f of block.fields) await enter(page, f, fieldIdx(f), f.id === wrong.fieldId ? wrong.text : rightText(f, block))
    await pressCheck(page, ids)
    const v = await verdictOf(page, wrong.fieldId)
    if (v === 'right' || v === 'accepted-alt' || v === null) fails.push(`calc ${block.id}: the wrong answer "${wrong.text}" (${wrong.via}) gets verdict "${v}"`)
    if (wrong.via === 'detector' && !(await page.evaluate((s, id) => !!document.querySelector(`${s} [data-testid=calc-verdict-${id}] .ch-calc-why`), SCREEN, wrong.fieldId))) {
      fails.push(`calc ${block.id}: the detector answer "${wrong.text}" shows no named message`)
    }
  }
  // one hint on the first calc screen, so the reload check can see it come back
  if (opts.hint && block.hints?.length) {
    if (await page.$(`${SCREEN} [data-testid=calc-hint]:not([disabled])`)) await clickAt(page, `${SCREEN} [data-testid=calc-hint]`, calcIdx)
  }
  for (const f of block.fields) {
    if ((await verdictOf(page, f.id)) === 'right') continue
    await enter(page, f, fieldIdx(f), rightText(f, block))
  }
  await pressCheck(page, ids)
  for (const f of block.fields) {
    const v = await verdictOf(page, f.id)
    if (v !== 'right') fails.push(`calc ${block.id}: the expected answer "${rightText(f, block)}" for ${f.id} gets verdict "${v}"`)
  }
  return fails
}

// What a screen must show again after Back or a reload: every mcq answered, every calc field right, the proof complete.
async function checkRestored(page, step, withTexts) {
  const fails = []
  const mcqs = step.blocks.filter((b) => b.type === 'mcq')
  if (mcqs.length && (await countOf(page, `${SCREEN} [data-testid=mcq-explain]`)) < mcqs.length) fails.push('an mcq answer did not come back')
  for (const b of step.blocks.filter((x) => x.type === 'calc-exercise')) {
    for (const f of b.fields) {
      const v = await verdictOf(page, f.id)
      if (v !== 'right') fails.push(`calc ${b.id}: field ${f.id} comes back with verdict "${v}"`)
      if (withTexts && (f.kind === 'num' || f.kind === 'frac' || (f.kind === 'choice' && !f.options))) {
        const val = await page.evaluate((s, id) => document.querySelector(`${s} [data-testid=calc-input-${id}]`)?.value ?? null, SCREEN, f.id)
        if (!val || !val.trim()) fails.push(`calc ${b.id}: the typed answer for ${f.id} did not come back`)
      }
    }
  }
  for (const b of step.blocks.filter((x) => x.type === 'proof-steps')) {
    const asked = b.steps.filter((s) => s.predict).length
    if ((await countOf(page, `${SCREEN} [data-testid=proof-explain]`)) < asked) fails.push(`proof ${b.id}: a pick did not come back`)
    if ((await countOf(page, `${SCREEN} [data-testid=proof-step]`)) < b.steps.length) fails.push(`proof ${b.id}: the steps shown did not come back`)
  }
  if (!(await nextEnabled(page))) fails.push('Continue is locked again')
  return fails
}

async function answerScreen(page, step, ctx) {
  const fails = []
  const info = { blocks: step.blocks.map((b) => b.type), viz: [] }
  const idx = { mcq: 0, reflect: 0, calc: 0, field: 0 }
  const firstAnswerable = step.blocks.find((b) => b.type === 'mcq' || b.type === 'calc-exercise')
  // a second tab on the same screen, opened before the first answer
  let tab2 = null
  if (firstAnswerable && !ctx.did.tabs) {
    ctx.did.tabs = true
    tab2 = await ctx.context.newPage()
    await tab2.setViewport(SIZES[ctx.width])
    await tab2.goto(page.url(), { waitUntil: 'domcontentloaded' })
    await waitFor(tab2, () => !!document.querySelector('[data-testid=lesson-screen]'), null, 15000, 80)
    await page.bringToFront()
  }
  const firstCalc = !ctx.did.reload && step.blocks.find((b) => b.type === 'calc-exercise')
  for (const block of step.blocks) {
    if (block.type === 'mcq') {
      const idxOk = block.options.findIndex((o) => o.correct)
      const sel = `${SCREEN} [data-testid=mcq-option-${idxOk}]`
      if (!(await mark(page, sel, idx.mcq))) { fails.push(`mcq ${block.id}: option ${idxOk} not found`); idx.mcq++; continue }
      if (!(await waitFor(page, () => { const b = document.querySelector('[data-walk-target]'); return !!b && !b.disabled }, null, 15000))) { fails.push(`mcq ${block.id}: options never unlocked`); idx.mcq++; continue }
      await clickAt(page, sel, idx.mcq)
      if (!(await waitFor(page, (n) => document.querySelectorAll('[data-testid=mcq-explain]').length > n, idx.mcq, 5000))) fails.push(`mcq ${block.id}: no explanation after the answer`)
      const marked = await page.evaluate((s, i, n) => document.querySelectorAll(`${s} [data-testid=mcq-option-${i}]`)[n]?.dataset.correct, SCREEN, idxOk, idx.mcq)
      if (marked !== 'true') fails.push(`mcq ${block.id}: the correct option is not marked correct (${marked})`)
      idx.mcq++
    } else if (block.type === 'reflect') {
      if (!(await page.$(`${SCREEN} [data-testid=reflect-reveal]`))) { fails.push(`reflect ${block.id}: no reveal button`); continue }
      await clickAt(page, `${SCREEN} [data-testid=reflect-reveal]`, 0)
      if (!(await waitFor(page, () => !!document.querySelector('[data-testid=reflect-answer]'), null, 5000))) fails.push(`reflect ${block.id}: no answer after reveal`)
    } else if (block.type === 'viz') {
      const scope = `figure.viz[data-widget="${block.widget}"]`
      if (!(await waitFor(page, (s) => !!document.querySelector(s), scope, 15000))) { fails.push(`viz ${block.id}: widget ${block.widget} did not render`); continue }
      let actions = 0
      for (let k = 0; k < 30; k++) {
        const acted = await page.evaluate((s) => {
          const fig = [...document.querySelectorAll(s)].find((f) => f.offsetParent !== null) || document.querySelector(s)
          const vis = (b) => b && b.offsetParent !== null && !b.disabled
          const show = fig.parentElement.querySelector('.viz-numline-show') || fig.querySelector('.viz-numline-show')
          if (vis(show)) { show.click(); return 'show' }
          const prim = fig.querySelector('.viz-btn-primary')
          if (vis(prim)) { const label = prim.innerText.trim(); prim.click(); return label }
          return null
        }, scope)
        if (!acted) break
        await sleep(120)
        actions++
      }
      info.viz.push({ widget: block.widget, actions })
      if (block.predict === true && !(await waitFor(page, () => { const b = document.querySelector('[data-testid=lesson-next]'); return !!b && !b.disabled }, null, 4000))) fails.push(`viz ${block.id}: Continue stays locked after the widget was answered`)
    } else if (block.type === 'proof-steps') {
      let predictsDone = 0
      for (let k = 0; k < block.steps.length; k++) {
        const s = block.steps[k]
        if (!(await waitFor(page, (a) => document.querySelectorAll(`${a.s} [data-testid=proof-step]`).length > a.k, { s: SCREEN, k }, 6000))) { fails.push(`proof ${block.id}: step ${k + 1} never appeared`); break }
        if (s.predict) {
          const right = s.predict.options.findIndex((o) => o.correct)
          await clickAt(page, `${SCREEN} [data-testid=proof-option-${right}]`, predictsDone)
          predictsDone++
          if (!(await waitFor(page, (a) => document.querySelectorAll(`${a.s} [data-testid=proof-explain]`).length >= a.n, { s: SCREEN, n: predictsDone }, 5000))) fails.push(`proof ${block.id}: no explanation after the pick at step ${k + 1}`)
        }
        if (k < block.steps.length - 1) {
          if (!(await waitFor(page, (s) => !!document.querySelector(`${s} [data-testid=proof-next]`), SCREEN, 5000))) { fails.push(`proof ${block.id}: no "Mai departe" after step ${k + 1}`); break }
          await clickAt(page, `${SCREEN} [data-testid=proof-next]`)
        }
      }
    } else if (block.type === 'calc-exercise') {
      if (!(await page.$(`${SCREEN} [data-testid=calc-check]`))) { fails.push(`calc ${block.id}: no Verifică button`); idx.calc++; continue }
      const hint = firstCalc === block
      for (const m of await answerCalc(page, block, ctx, idx.field, { calcIdx: idx.calc, hint })) fails.push(m)
      if (hint) {
        ctx.did.reload = true
        // reload: the typed answers, verdicts and hints come back and the gate stays open
        const hintsBefore = await countOf(page, `${SCREEN} [data-testid=calc-hints] li`)
        await page.reload({ waitUntil: 'domcontentloaded' })
        await waitFor(page, () => !!document.querySelector('[data-testid=lesson-screen] [data-testid=calc-exercise]'), null, 20000, 80)
        await settle(page)
        for (const m of await checkRestored(page, { blocks: [block] }, true)) fails.push(`after reload: ${m}`)
        const hintsAfter = await countOf(page, `${SCREEN} [data-testid=calc-hints] li`)
        if (hintsAfter !== hintsBefore) fails.push(`calc ${block.id}: ${hintsBefore} hint(s) shown before the reload, ${hintsAfter} after`)
        if (!(await nextEnabled(page))) fails.push('after reload: Continue is locked')
      }
      idx.calc++
      idx.field += block.fields.length
    }
  }
  if (tab2) {
    try {
      await tab2.bringToFront()
      await tab2.evaluate(() => { window.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange')) })
      // the shared store holds tab 1's answer, and tab 2's open screen has picked it up (its gate, seeded from the store, opens)
      const inStore = await waitFor(tab2, (id) => { try { return (localStorage.getItem('bdLessonState.v1') || '').includes(`"${id}"`) } catch { return false } }, firstAnswerable.id, 4000, 100)
      if (!inStore) fails.push(`two tabs: the answer given in tab 1 (${firstAnswerable.id}) is not in the shared lesson store`)
      const unlocked = await waitFor(tab2, () => { const b = document.querySelector('[data-testid=lesson-next]'); return !!b && !b.disabled }, null, 4000, 100)
      if (!unlocked) fails.push(`two tabs: the answer given in tab 1 (${firstAnswerable.id}) did not reach tab 2 after focus (its Continue stays locked)`)
    } catch (e) {
      fails.push(`two tabs: ${e.message}`)
    } finally {
      await tab2.close().catch(() => {})
      await page.bringToFront()
    }
  }
  return { fails, info }
}

// ---- one lesson at one width and colour mode
async function walkLesson(lesson, width, mode) {
  const id = lesson.json.meta.id
  const steps = lesson.json.steps
  const tag = `${width}${mode === 'dark' ? 'd' : ''}`
  const result = { lesson: id, width, mode, screens: [], failures: [], consoleErrors: [] }
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  await page.setViewport(SIZES[width])
  if (mode === 'dark') await page.evaluateOnNewDocument(() => { try { localStorage.setItem('themeMode', '"dark"') } catch { /* ignore */ } })
  let screenNo = 0
  const note = (msg) => result.failures.push(`${id} @${tag} screen ${screenNo}: ${msg}`)
  const watch = (p) => {
    p.on('console', (m) => {
      if (m.type() !== 'error') return
      const text = m.text()
      if (IGNORED_CONSOLE.some((re) => re.test(text))) return
      result.consoleErrors.push({ screen: screenNo, text: text.slice(0, 300) })
      note(`console error: ${text.slice(0, 200)}`)
    })
    p.on('pageerror', (e) => { result.consoleErrors.push({ screen: screenNo, text: String(e.message).slice(0, 300) }); note(`page error: ${String(e.message).slice(0, 200)}`) })
  }
  watch(page)
  context.on('targetcreated', async (t) => { try { const p = await t.page(); if (p && p !== page) watch(p) } catch { /* closed */ } })
  const ctx = { context, width, did: { tabs: false, reload: false, back: new Set() } }
  try {
    await page.goto(`${BASE}/course_${lesson.n}?s=1`, { waitUntil: 'domcontentloaded' })
    for (let s = 1; s <= steps.length; s++) {
      screenNo = s
      const step = steps[s - 1]
      const rec = { screen: s, id: step.id, blocks: step.blocks.map((b) => b.type), blankMs: null, failures: [] }
      const t0 = Date.now()
      const up = await waitFor(page, (n) => document.querySelector('.lp-count')?.innerText.replace(/\s/g, '').startsWith(`${n}/`), s, 20000, 50)
      if (!up) { rec.failures.push('screen did not open'); result.screens.push(rec); note('screen did not open'); break }
      const content = await waitFor(page, () => { const b = document.querySelector('[data-testid=lesson-screen]:last-of-type .lp-blocks') || document.querySelector('.lp-blocks'); return !!b && b.getBoundingClientRect().height > 20 && b.innerText.trim().length > 0 }, null, 20000, 50)
      rec.blankMs = Date.now() - t0
      if (!content || rec.blankMs > BLANK_LIMIT_MS) rec.failures.push(`blank for ${rec.blankMs} ms after the transition`)
      await sleep(450) // the slide transition
      rec.title = await page.evaluate(() => document.querySelector('[data-testid=lesson-screen] h2')?.innerText ?? '')
      const { fails, info } = await answerScreen(page, step, ctx)
      rec.failures.push(...fails)
      rec.info = info
      if (!(await waitFor(page, () => { const b = document.querySelector('[data-testid=lesson-next]'); return !!b && !b.disabled }, null, 6000))) rec.failures.push('Continue stays locked')
      await sleep(250)
      rec.failures.push(...overflowFindings(await page.evaluate(() => ({ doc: document.documentElement.scrollWidth - window.innerWidth, body: document.body.scrollWidth - window.innerWidth, card: (() => { const c = document.querySelector('.lp-card'); return c ? c.scrollWidth - c.clientWidth : 0 })() }))))
      if (width === 390) rec.failures.push(...(await layoutChecks(page)))
      const shot = path.join('shots', `${id}-s${String(s).padStart(2, '0')}-${tag}.jpg`)
      await page.screenshot({ path: path.join(OUT, shot), type: 'jpeg', quality: 55, fullPage: true })
      rec.shot = shot
      rec.consoleErrors = result.consoleErrors.filter((e) => e.screen === s).length
      if (s < steps.length) {
        if (!(await nextEnabled(page))) { for (const f of rec.failures) note(f); result.screens.push(rec); break }
        // a click that lands while the screen is still settling can be lost: try again, and report how often that was needed
        let moved = false
        for (let attempt = 0; attempt < 3 && !moved; attempt++) {
          if (width === 390 && attempt === 0) { rec.transition = {}; rec.failures.push(...(await continueWithRecording(page, rec.transition))) }
          else await clickEl(page, '[data-testid=lesson-next]')
          moved = !!(await waitFor(page, (n) => document.querySelector('.lp-count')?.innerText.replace(/\s/g, '').startsWith(`${n}/`), s + 1, attempt === 2 ? 20000 : 4000, 50))
          if (!moved) rec.clickRetries = (rec.clickRetries ?? 0) + 1
        }
        // Back keeps the answers: once per lesson for each kind of answered block, come back to this screen and look
        const kinds = ['mcq', 'calc-exercise', 'proof-steps'].filter((k) => step.blocks.some((b) => b.type === k) && !ctx.did.back.has(k))
        if (moved && kinds.length) {
          kinds.forEach((k) => ctx.did.back.add(k))
          await settle(page)
          await clickEl(page, '[data-testid=lesson-back]')
          if (await waitFor(page, (n) => document.querySelector('.lp-count')?.innerText.replace(/\s/g, '').startsWith(`${n}/`), s, 6000, 50)) {
            await sleep(450)
            await settle(page)
            for (const m of await checkRestored(page, step, false)) rec.failures.push(`after Back: ${m}`)
            await clickEl(page, '[data-testid=lesson-next]')
            await waitFor(page, (n) => document.querySelector('.lp-count')?.innerText.replace(/\s/g, '').startsWith(`${n}/`), s + 1, 6000, 50)
          } else rec.failures.push('Back did not return to the screen')
        }
      }
      for (const f of rec.failures) note(f)
      if (process.env.WALK_DEBUG) console.log(`  ${id} @${tag} s${s} ${rec.failures.length ? 'FAIL ' + rec.failures.join(' | ') : 'ok'} (${rec.blocks.join(',')})`)
      result.screens.push(rec)
    }
  } catch (e) {
    note(`walk crashed: ${e.message}`)
  } finally {
    await context.close()
  }
  return result
}

// ---- no lesson file yet: prove the build starts and the subject page opens
async function walkEmpty() {
  const failures = []
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  await page.setViewport(SIZES[390])
  page.on('console', (m) => { if (m.type() === 'error') failures.push(`console error: ${m.text().slice(0, 200)}`) })
  page.on('pageerror', (e) => failures.push(`page error: ${String(e.message).slice(0, 200)}`))
  const res = await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  if (!res || res.status() >= 400) failures.push(`${BASE} answered ${res?.status()}`)
  const shown = await waitFor(page, () => document.body.innerText.trim().length > 40, null, 15000, 100)
  if (!shown) failures.push('the ML page stays blank')
  const text = await page.evaluate(() => document.body.innerText)
  if (!/Învățare automată|Machine learning|\bML\b/.test(text)) failures.push('the ML page does not show the subject title')
  await page.screenshot({ path: path.join(OUT, 'shots', 'ml-subject-390.jpg'), type: 'jpeg', quality: 55 })
  await context.close()
  return failures
}

let failures = []
const t0 = Date.now()
let results = []
if (!lessons.length) {
  failures = await walkEmpty()
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ when: new Date().toISOString(), lessons: 0, failures: failures.length, details: failures }, null, 1) + '\n')
  for (const f of failures) console.error(f)
  console.log(`walk: 0 lessons (${path.relative(ROOT, COURSES)} has no lesson files); the /y2s1/ml page ${failures.length ? 'FAILED to open cleanly' : 'opens cleanly'}; ${failures.length} failure(s)`)
} else {
  // 390 px runs in light and in dark mode, 1280 px in light mode
  const runs = WIDTHS.flatMap((w) => (w === 390 ? [{ w, mode: 'light' }, { w, mode: 'dark' }] : [{ w, mode: 'light' }]))
  const jobs = lessons.flatMap((l) => runs.map((r) => ({ l, ...r })))
  let next = 0
  await Promise.all(Array.from({ length: Math.min(JOBS, jobs.length) }, async () => {
    while (next < jobs.length) {
      const { l, w, mode } = jobs[next++]
      const r = await walkLesson(l, w, mode)
      results.push(r)
      console.log(`${r.failures.length ? 'FAIL' : 'ok  '} ${l.json.meta.id} @${w}${mode === 'dark' ? ' dark' : ''}: ${r.screens.length}/${l.json.steps.length} screens${r.failures.length ? `, ${r.failures.length} failure(s)` : ''}`)
    }
  }))
  results.sort((a, b) => a.lesson.localeCompare(b.lesson) || a.width - b.width || a.mode.localeCompare(b.mode))
  failures = results.flatMap((r) => r.failures)
  const screens = results.reduce((n, r) => n + r.screens.length, 0)
  const retries = results.reduce((n, r) => n + r.screens.reduce((m, x) => m + (x.clickRetries ?? 0), 0), 0)
  const report = { when: new Date().toISOString(), widths: WIDTHS, lessons: lessons.length, screens, failures: failures.length, clickRetries: retries, seconds: Math.round((Date.now() - t0) / 1000), results }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1) + '\n')
  for (const f of failures) console.error(f)
  console.log(`walk: ${lessons.length} lessons x ${runs.length} runs, ${screens} screens, ${failures.length} failure(s), ${retries} Continue click(s) repeated; report ${path.relative(ROOT, path.join(OUT, 'report.json'))}`)
}
await browser.close()
await new Promise((r) => server.httpServer.close(r))
process.exit(failures.length ? 1 : 0)
