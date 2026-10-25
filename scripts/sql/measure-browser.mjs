// Boot / first-query / memory numbers of the SQL engine in a real (headless) Chrome, for spec section 8.
//   PUPPETEER_EXECUTABLE_PATH=/path/to/chrome node scripts/sql/measure-browser.mjs [--runs 3] [--only desktop|mobile]
// CDP's CPU throttle does not reach a worker, and the engine lives in one. For a real 4x slowdown of the engine, point
// SQL_MEASURE_CHROME at a wrapper that starts Chrome under `systemd-run --user --scope -p CPUQuota=25%` and pass --only mobile.
// It bundles scripts/sql/measure-harness (a page that only imports the real client and worker) with the app's Vite config
// options, serves it together with public/ (the prebuilt data dirs), and measures a desktop profile and a mobile profile
// (390x844, touch, mobile user agent, 4x CPU throttle). Headless only: no window opens.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'
import { build, preview } from 'vite'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const runs = Number(process.argv[process.argv.indexOf('--runs') + 1]) || 3
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sql-measure-'))
await build({
  root: path.join(ROOT, 'scripts', 'sql', 'measure-harness'),
  publicDir: path.join(ROOT, 'public'),
  base: '/',
  logLevel: 'error',
  configFile: false,
  optimizeDeps: { exclude: ['@electric-sql/pglite'] },
  worker: { format: 'es' },
  build: { outDir, emptyOutDir: true },
})
const server = await preview({ root: ROOT, configFile: false, base: '/', build: { outDir }, preview: { port: 4179, strictPort: true, host: '127.0.0.1' } })
const url = 'http://127.0.0.1:4179/'

const chromeRssMb = (marker) => {
  try {
    const out = execFileSync('ps', ['-eo', 'rss,args'], { encoding: 'utf8' })
    return out.split('\n').filter((l) => l.includes(marker)).reduce((a, l) => a + Number(l.trim().split(/\s+/)[0]), 0) / 1024
  } catch { return null }
}

const PROFILES = {
  desktop: { viewport: { width: 1280, height: 800 }, throttle: 1 },
  mobile: { viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }, throttle: 4, ua: 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36' },
}

async function once(browser, profile, marker) {
  const page = await browser.newPage()
  await page.setViewport(profile.viewport)
  if (profile.ua) await page.setUserAgent(profile.ua)
  const cdp = await page.createCDPSession()
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.throttle })
  // the engine runs in a worker, which the page-level throttle does not reach: throttle the worker's own session as well
  let workerThrottled = false
  page.on('workercreated', async (w) => {
    try {
      await w.client.send('Emulation.setCPUThrottlingRate', { rate: profile.throttle })
      workerThrottled = profile.throttle > 1
    } catch { /* not supported for workers */ }
  })
  await page.goto(url, { waitUntil: 'load' })
  await page.waitForFunction('window.__ready === true')
  const m = await page.evaluate(async () => {
    const sql = window.__sql
    const DS = { dataset: 'facultate' }
    const t0 = performance.now()
    const first = sql.run('SELECT nume FROM studenti ORDER BY nume', DS)
    await sql.ready()
    const bootMs = performance.now() - t0
    const t1 = performance.now()
    const r1 = await first
    const firstQueryMs = performance.now() - t1
    const t2 = performance.now()
    const r2 = await sql.run('SELECT s.nume, c.titlu_curs, n.valoare FROM studenti s JOIN note n ON n.nr_matricol = s.nr_matricol JOIN cursuri c ON c.id_curs = n.id_curs ORDER BY 1, 2', DS)
    const joinQueryMs = performance.now() - t2
    const t3 = performance.now()
    const r3 = await sql.run('SELECT * FROM cursuri a, didactic b, cursuri c, didactic d, studenti e', DS)
    const cartesianMs = performance.now() - t3
    return { bootMs, firstQueryMs, joinQueryMs, cartesianMs, status: sql.status, errors: [r1.error, r2.error, r3.error].filter(Boolean).map((e) => e.code), cartesianRows: r3.rowCount, cartesianKept: r3.rows.length }
  })
  const main = await page.evaluate(() => (performance.memory ? { usedMb: performance.memory.usedJSHeapSize / 1048576, totalMb: performance.memory.totalJSHeapSize / 1048576 } : null))
  let worker = null
  const w = page.workers()[0]
  if (w) {
    const h = await w.client.send('Runtime.getHeapUsage')
    worker = { usedMb: h.usedSize / 1048576, totalMb: h.totalSize / 1048576 }
  }
  const rssMb = chromeRssMb(marker)
  await page.close()
  return { ...m, workerThrottled, mainHeap: main, workerHeap: worker, chromeRssMb: rssMb }
}

const report = {}
try {
  const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null
  for (const [name, profile] of Object.entries(PROFILES)) {
    if (only && only !== name) continue
    const results = []
    for (let i = 0; i < runs; i++) {
      // a fresh browser per run: cold HTTP cache, cold WASM compile cache
      const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'sql-measure-profile-'))
      const browser = await puppeteer.launch({ headless: true, executablePath: process.env.SQL_MEASURE_CHROME || undefined, args: ['--no-sandbox', '--user-data-dir=' + userData] })
      try { results.push(await once(browser, profile, userData)) } finally { await browser.close() }
    }
    const pick = (f) => median(results.map(f).filter((x) => x != null))
    report[name] = {
      runs: results.length,
      bootMs: Math.round(pick((r) => r.bootMs)),
      firstQueryMs: Math.round(pick((r) => r.firstQueryMs)),
      joinQueryMs: Math.round(pick((r) => r.joinQueryMs)),
      cartesianMs: Math.round(pick((r) => r.cartesianMs)),
      workerHeapUsedMb: Math.round(pick((r) => r.workerHeap?.usedMb)),
      workerHeapTotalMb: Math.round(pick((r) => r.workerHeap?.totalMb)),
      mainHeapUsedMb: Math.round(pick((r) => r.mainHeap?.usedMb)),
      chromeRssMb: Math.round(pick((r) => r.chromeRssMb)),
      workerThrottled: results.every((r) => r.workerThrottled),
      statuses: [...new Set(results.map((r) => r.status))],
      errors: results.flatMap((r) => r.errors),
      raw: results.map((r) => Math.round(r.bootMs)),
    }
  }
  const datadir = fs.statSync(path.join(ROOT, 'public', 'sql', 'datadir-facultate.tar.gz')).size
  report.datadirMb = Number((datadir / 1048576).toFixed(1))
  console.log(JSON.stringify(report, null, 2))
} finally {
  await new Promise((r) => server.httpServer.close(r))
  fs.rmSync(outDir, { recursive: true, force: true })
}
