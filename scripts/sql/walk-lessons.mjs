// Automated walk through every screen of every BD lesson, in a real (headless) Chrome against `vite preview`.
//
//   PUPPETEER_EXECUTABLE_PATH=/etc/profiles/per-user/alexa/bin/google-chrome-stable \
//     node scripts/sql/walk-lessons.mjs [--lessons bd-l01,bd-l02] [--widths 390,1280] [--jobs 4] [--out <dir>] [--no-build]
//
// For each lesson and each width (390x844 and 1280x800) it opens the lesson in a fresh browser context and goes through the
// screens with the Continue button. On a gating screen it answers like a learner would:
//   mcq           the correct option
//   reflect       reveal the answer
//   viz (predict) press "Arată-mi" (or pick on the number line, then "Arată"); every widget is then stepped to its last step
//   query machine step through every stage; on a predicted stage pick rows / type a count / click the order, then Check
//   sql-exercise  type the reference solution: the verdict must be `correct`; then one named wrong answer (the exercise's classic mistake from
//                 scripts/sql/named-mistakes.json, via scripts/sql/wrong-answers.mjs): the verdict must not be `correct`
// and it checks, on every screen: Continue unlocks, no console errors, no page errors, no horizontal overflow, and the screen is
// not blank for long after the transition. One screenshot per screen per width goes to <out>/shots, the JSON report to
// <out>/report.json (default .superpowers/sdd/2026-10-24-bd-lessons/walk, which is gitignored). Exit code 1 on any failure.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'
import { preview } from 'vite'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const argv = process.argv.slice(2)
const arg = (name, dflt) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : dflt)
const OUT = path.resolve(arg('--out', path.join(ROOT, '.superpowers', 'sdd', '2026-10-24-bd-lessons', 'walk')))
const WIDTHS = arg('--widths', '390,1280').split(',').map(Number)
const ONLY = arg('--lessons', '') ? new Set(arg('--lessons', '').split(',')) : null
const JOBS = Number(arg('--jobs', '4'))
const PORT = 4180
const BASE = `http://127.0.0.1:${PORT}/Ghid_Studii_AI/y2s1/bd`
const SIZES = { 390: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }, 1280: { width: 1280, height: 800, deviceScaleFactor: 1 } }
const BLANK_LIMIT_MS = 6000
const ENGINE_WAIT_MS = 90000

if (!argv.includes('--no-build')) execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'ignore' })


// ---- what to walk: the lesson files in registration order (tests/content/bd-content.test.js pins the order to index.js)
const COURSES = path.join(ROOT, 'src', 'content', 'bd', 'courses')
const lessons = fs.readdirSync(COURSES).filter((f) => /^lesson-.*\.json$/.test(f)).sort().map((f, i) => ({ n: i + 1, file: f, json: JSON.parse(fs.readFileSync(path.join(COURSES, f), 'utf8')) }))
  .filter((l) => !ONLY || ONLY.has(l.json.meta.id))

const wrongFile = path.join(OUT, 'wrong-answers.json')
execFileSync('node', [path.join(ROOT, 'scripts', 'sql', 'wrong-answers.mjs'), '--out', wrongFile], { cwd: ROOT, stdio: 'ignore' })
const wrong = JSON.parse(fs.readFileSync(wrongFile, 'utf8')).answers

fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true })
const server = await preview({ root: ROOT, configFile: path.join(ROOT, 'vite.config.js'), preview: { port: PORT, strictPort: true, host: '127.0.0.1' } })
const browser = await puppeteer.launch({ executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const IGNORED_CONSOLE = [/inert/i] // the app shell's own React warning about the `inert` attribute, present before the lessons

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
// click the first visible button inside `scope` whose text matches `re`
const clickText = (page, scope, re) => page.evaluate((scope, src) => {
  const re = new RegExp(src, 'i')
  const root = document.querySelector(scope) || document
  for (const b of root.querySelectorAll('button')) {
    if (b.offsetParent === null || b.disabled || b.getAttribute('aria-disabled') === 'true') continue
    if (re.test(b.innerText.trim())) { b.click(); return true }
  }
  return false
}, scope, re.source)
const nextEnabled = (page) => page.evaluate(() => { const b = document.querySelector('[data-testid=lesson-next]'); return !!b && !b.disabled })


// Click an element the way a learner would: scroll it clear of the fixed footer first, then click its centre.
async function clickEl(page, selector) {
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

async function typeInto(page, scope, text) {
  const sel = `${scope} .cm-content`
  await page.waitForSelector(sel, { timeout: 20000 })
  await clickEl(page, sel)
  await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control')
  await page.keyboard.press('Backspace')
  await page.keyboard.type(text, { delay: 0 })
}

async function runSql(page, scope, text) {
  await typeInto(page, scope, text)
  await sleep(150)
  await clickEl(page, `${scope} [data-testid=sql-run]`)
  await waitFor(page, (s) => document.querySelector(`${s} [data-testid=sql-run]`)?.getAttribute('aria-busy') === 'true', scope, 3000, 30)
  const done = await waitFor(page, (s) => document.querySelector(`${s} [data-testid=sql-run]`)?.getAttribute('aria-busy') !== 'true' && !!document.querySelector(`${s} [data-testid=sql-verdict], ${s} [data-testid=sql-note]`), scope, ENGINE_WAIT_MS, 120)
  await sleep(150)
  return page.evaluate((s) => {
    const v = document.querySelector(`${s} [data-testid=sql-verdict]`)
    return { kind: v?.dataset.kind ?? null, note: document.querySelector(`${s} [data-testid=sql-note]`)?.innerText ?? null }
  }, scope).then((r) => ({ ...r, finished: !!done }))
}

// ---- one screen
async function answerScreen(page, step, ctx) {
  const fails = []
  const info = { blocks: step.blocks.map((b) => b.type), qm: [], sql: [], viz: [] }
  for (const [bi, block] of step.blocks.entries()) {
    if (block.type === 'mcq') {
      const idx = block.options.findIndex((o) => o.correct)
      const sel = `[data-testid=lesson-screen] [data-testid=mcq-option-${idx}]`
      if (!(await page.$(sel))) { fails.push(`mcq ${block.id}: option ${idx} not found`); continue }
      await clickEl(page, sel)
      const ok = await waitFor(page, () => !!document.querySelector('[data-testid=mcq-explain]'), null, 5000)
      if (!ok) fails.push(`mcq ${block.id}: no explanation after the answer`)
      const marked = await page.evaluate((i) => document.querySelector(`[data-testid=mcq-option-${i}]`)?.dataset.correct, idx)
      if (marked !== 'true') fails.push(`mcq ${block.id}: the correct option is not marked correct (${marked})`)
    } else if (block.type === 'reflect') {
      if (!(await page.$('[data-testid=reflect-reveal]'))) { fails.push(`reflect ${block.id}: no reveal button`); continue }
      await clickEl(page, '[data-testid=reflect-reveal]')
      if (!(await waitFor(page, () => !!document.querySelector('[data-testid=reflect-answer]'), null, 5000))) fails.push(`reflect ${block.id}: no answer after reveal`)
    } else if (block.type === 'viz') {
      const scope = `figure.viz[data-widget="${block.widget}"]`
      if (!(await waitFor(page, (s) => !!document.querySelector(s), scope, 15000))) { fails.push(`viz ${block.id}: widget ${block.widget} did not render`); continue }
      const states = []
      for (let k = 0; k < 20; k++) {
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
        states.push(acted)
      }
      info.viz.push({ widget: block.widget, actions: states.length })
      const gated = block.predict === true
      if (gated && !(await waitFor(page, () => { const b = document.querySelector('[data-testid=lesson-next]'); return !!b && !b.disabled }, null, 4000))) fails.push(`viz ${block.id}: Continue stays locked after the widget was answered`)
    } else if (block.type === 'query-machine') {
      const scope = `[data-testid=query-machine]`
      if (!(await waitFor(page, () => { const q = document.querySelector('[data-testid=query-machine]'); return !!q && !q.getAttribute('aria-busy') }, null, ENGINE_WAIT_MS))) { fails.push(`query-machine ${block.id}: stuck loading`); continue }
      const log = []
      for (let k = 0; k < 40; k++) {
        const state = await page.evaluate(() => {
          const q = document.querySelector('[data-testid=query-machine]')
          const prim = q.querySelector('.qm-controls .viz-btn-primary')
          const rows = [...q.querySelectorAll('[data-testid=qm-rows] .qm-row:not(.qm-head)')].filter((r) => !r.classList.contains('is-gone')).length
          const note = q.querySelector('.qm-note')?.innerText ?? null
          const count = q.querySelector('.qm-input')
          const pickable = q.querySelectorAll('.qm-row.is-pickable').length
          return { label: prim ? prim.innerText.trim() : null, disabled: prim ? prim.disabled : null, rows, note, count: !!count, pickable, say: q.querySelector('.qm-say')?.innerText ?? '', meta: q.querySelector('.qm-meta')?.innerText ?? '' }
        })
        if (state.note) { log.push({ note: state.note }); fails.push(`query-machine ${block.id}: ${state.note}`); break }
        log.push({ rows: state.rows, label: state.label })
        if (!state.label) break // last stage, "Again" is a plain button
        if (/^(Verifică|Check)/i.test(state.label)) {
          if (state.count) { await page.type('.qm-input', '7') }
          else if (state.pickable) {
            // the first pickable rows, in order (the same click works for "keep these rows" and for "place them in order")
            await page.evaluate(() => { const rows = [...document.querySelectorAll('.qm-row.is-pickable')]; rows.slice(0, Math.min(2, rows.length)).forEach((r) => r.click()) })
          }
          await sleep(100)
          const ok = await clickText(page, '[data-testid=query-machine] .qm-controls', /^(Verifică|Check)/i)
          if (!ok) fails.push(`query-machine ${block.id}: Check button stays disabled`)
          await sleep(150)
          continue
        }
        if (/^(Din nou|Again)/i.test(state.label)) break
        if (state.disabled) break
        await page.evaluate(() => document.querySelector('[data-testid=query-machine] .qm-controls .viz-btn-primary').click())
        await sleep(160)
      }
      info.qm.push({ id: block.id, steps: log })
      // every stage that shows a table must show real rows (an empty result is only fine for the last stages of a MINUS/INTERSECT demo)
      const rowCounts = log.filter((l) => l.rows !== undefined).map((l) => l.rows)
      if (rowCounts.length === 0 || Math.max(...rowCounts) === 0) fails.push(`query-machine ${block.id}: no rows shown on any stage`)
    } else if (block.type === 'sql-exercise') {
      const scope = `[data-testid=lesson-screen] [data-testid=sql-exercise]`
      if (!(await waitFor(page, (s) => !!document.querySelector(`${s} .cm-content`) || !!document.querySelector(`${s} [data-testid=sql-paper-note]`), scope, ENGINE_WAIT_MS))) { fails.push(`sql ${block.id}: editor did not appear`); continue }
      if (await page.$(`${scope} [data-testid=sql-paper-note]`)) { fails.push(`sql ${block.id}: fell back to paper mode (engine failed)`); continue }
      const good = await runSql(page, scope, block.solution)
      const rec = { id: block.id, correct: good.kind, wrong: null, wrongName: null }
      if (good.kind !== 'correct') fails.push(`sql ${block.id}: the reference solution gets "${good.kind}" ${good.note ?? ''}`)
      const w = wrong[block.id]
      if (!w) fails.push(`sql ${block.id}: no wrong answer available`)
      else if (w.source !== 'named') fails.push(`sql ${block.id}: no named mistake in scripts/sql/named-mistakes.json, only a generic mutation (${w.name})`)
      else {
        const bad = await runSql(page, scope, w.sql)
        rec.wrong = bad.kind; rec.wrongName = w.name
        if (bad.kind === 'correct' || bad.kind === null) fails.push(`sql ${block.id}: the wrong answer (${w.name}) gets "${bad.kind}"`)
      }
      info.sql.push(rec)
    }
  }
  return { fails, info }
}

// ---- one lesson at one width
async function walkLesson(lesson, width) {
  const id = lesson.json.meta.id
  const steps = lesson.json.steps
  const result = { lesson: id, width, screens: [], failures: [], consoleErrors: [] }
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  await page.setViewport(SIZES[width])
  let screenNo = 0
  const note = (msg) => result.failures.push(`${id} @${width} screen ${screenNo}: ${msg}`)
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const text = m.text()
    if (IGNORED_CONSOLE.some((re) => re.test(text))) return
    result.consoleErrors.push({ screen: screenNo, text: text.slice(0, 300) })
    note(`console error: ${text.slice(0, 200)}`)
  })
  page.on('pageerror', (e) => { result.consoleErrors.push({ screen: screenNo, text: String(e.message).slice(0, 300) }); note(`page error: ${String(e.message).slice(0, 200)}`) })
  try {
    await page.goto(`${BASE}/course_${lesson.n}?s=1`, { waitUntil: 'domcontentloaded' })
    for (let s = 1; s <= steps.length; s++) {
      screenNo = s
      const step = steps[s - 1]
      const rec = { screen: s, id: step.id, blocks: step.blocks.map((b) => b.type), blankMs: null, failures: [] }
      // the right screen is up and has content
      const t0 = Date.now()
      const up = await waitFor(page, (n) => document.querySelector('.lp-count')?.innerText.replace(/\s/g, '').startsWith(`${n}/`), s, 20000, 50)
      if (!up) { rec.failures.push('screen did not open'); result.screens.push(rec); note('screen did not open'); break }
      const content = await waitFor(page, () => { const b = document.querySelector('[data-testid=lesson-screen]:last-of-type .lp-blocks') || document.querySelector('.lp-blocks'); return !!b && b.getBoundingClientRect().height > 20 && b.innerText.trim().length > 0 }, null, 20000, 50)
      rec.blankMs = Date.now() - t0
      if (!content || rec.blankMs > BLANK_LIMIT_MS) rec.failures.push(`blank for ${rec.blankMs} ms after the transition`)
      await sleep(450) // the slide transition
      const h = await page.evaluate(() => document.querySelector('[data-testid=lesson-screen] h2')?.innerText ?? '')
      rec.title = h
      const { fails, info } = await answerScreen(page, step, result)
      rec.failures.push(...fails)
      rec.info = info
      // Continue unlocks
      if (!(await waitFor(page, () => { const b = document.querySelector('[data-testid=lesson-next]'); return !!b && !b.disabled }, null, 6000))) rec.failures.push('Continue stays locked')
      await sleep(250)
      // overflow
      const over = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth - window.innerWidth, body: document.body.scrollWidth - window.innerWidth, card: (() => { const c = document.querySelector('.lp-card'); return c ? c.scrollWidth - c.clientWidth : 0 })() }))
      if (over.doc > 1 || over.body > 1 || over.card > 1) rec.failures.push(`horizontal overflow (${JSON.stringify(over)})`)
      const shot = path.join('shots', `${id}-s${String(s).padStart(2, '0')}-${width}.jpg`)
      await page.screenshot({ path: path.join(OUT, shot), type: 'jpeg', quality: 55, fullPage: true })
      rec.shot = shot
      rec.consoleErrors = result.consoleErrors.filter((e) => e.screen === s).length
      for (const f of rec.failures) note(f)
      if (process.env.WALK_DEBUG) console.log(`  ${id} @${width} s${s} ${rec.failures.length ? 'FAIL ' + rec.failures.join(' | ') : 'ok'} (${rec.blocks.join(',')})`)
      result.screens.push(rec)
      if (s < steps.length) {
        if (!(await nextEnabled(page))) break
        // a click that lands while the screen is still settling can be lost: try again, and report how often that was needed
        let moved = false
        for (let attempt = 0; attempt < 3 && !moved; attempt++) {
          await clickEl(page, '[data-testid=lesson-next]')
          moved = !!(await waitFor(page, (n) => document.querySelector('.lp-count')?.innerText.replace(/\s/g, '').startsWith(`${n}/`), s + 1, attempt === 2 ? 20000 : 4000, 50))
          if (!moved) rec.clickRetries = (rec.clickRetries ?? 0) + 1
        }
      }
    }
  } catch (e) {
    note(`walk crashed: ${e.message}`)
  } finally {
    await context.close()
  }
  return result
}

// ---- run the jobs with a small pool
const jobs = lessons.flatMap((l) => WIDTHS.map((w) => ({ l, w })))
const results = []
let next = 0
const t0 = Date.now()
await Promise.all(Array.from({ length: Math.min(JOBS, jobs.length) }, async () => {
  while (next < jobs.length) {
    const { l, w } = jobs[next++]
    const r = await walkLesson(l, w)
    results.push(r)
    console.log(`${r.failures.length ? 'FAIL' : 'ok  '} ${l.json.meta.id} @${w}: ${r.screens.length}/${l.json.steps.length} screens${r.failures.length ? `, ${r.failures.length} failure(s)` : ''}`)
  }
}))

results.sort((a, b) => a.lesson.localeCompare(b.lesson) || a.width - b.width)
const failures = results.flatMap((r) => r.failures)
const screens = results.reduce((n, r) => n + r.screens.length, 0)
const retries = results.reduce((n, r) => n + r.screens.reduce((m, x) => m + (x.clickRetries ?? 0), 0), 0)
const report = { when: new Date().toISOString(), widths: WIDTHS, lessons: lessons.length, screens, failures: failures.length, clickRetries: retries, seconds: Math.round((Date.now() - t0) / 1000), results }
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1) + '\n')
for (const f of failures) console.error(f)
console.log(`walk: ${lessons.length} lessons x ${WIDTHS.length} widths, ${screens} screens, ${failures.length} failure(s), ${retries} Continue click(s) repeated; report ${path.relative(ROOT, path.join(OUT, 'report.json'))}`)
await browser.close()
await new Promise((r) => server.httpServer.close(r))
process.exit(failures.length ? 1 : 0)
