// Prebuilt PGlite data directories, one per dataset: the compat layer installed and the data loaded, gzipped.
// The browser worker starts from one of these instead of replaying ~thousands of compat statements on every visit.
//   node scripts/sql/build-datadirs.mjs         -> public/sql/datadir-<dataset>.tar.gz   (runs as the "prebuild" npm script)
import fs from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createServer } from 'vite'

// core.js uses import.meta.glob for the compat files, so it is loaded through Vite's module runner rather than plain Node
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const DEFAULT_CLOCK = '2026-10-26 14:30:00'
const datasetText = (name) => fs.readFileSync(path.join(ROOT, 'public', 'sql', 'datasets', `${name}.sql`), 'utf8')

export const DATADIR_DATASETS = ['facultate', 'facultate-hidden', 'biblioteca', 'biblioteca-hidden']

export async function buildDatadir(name, createEngine) {
  const pg = new PGlite()
  const engine = await createEngine(pg, { clock: DEFAULT_CLOCK, datasets: { [name]: datasetText(name) } })
  const probe = await engine.run('SELECT 1 FROM dual', { dataset: name }) // loads the dataset
  if (probe.error) throw new Error(`${name}: ${probe.error.code} ${probe.error.message}`)
  const blob = await pg.dumpDataDir('gzip')
  await pg.close()
  return Buffer.from(await blob.arrayBuffer())
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const vite = await createServer({ root: ROOT, configFile: false, logLevel: 'error', appType: 'custom', server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { createEngine } = await vite.ssrLoadModule('/src/sql/engine/core.js')
    const out = path.join(ROOT, 'public', 'sql')
    fs.mkdirSync(out, { recursive: true })
    for (const name of DATADIR_DATASETS) {
      const buf = await buildDatadir(name, createEngine)
      fs.writeFileSync(path.join(out, `datadir-${name}.tar.gz`), buf)
      console.log(`datadir-${name}.tar.gz  ${(buf.length / 1048576).toFixed(1)} MB`)
    }
  } finally {
    await vite.close()
  }
}
