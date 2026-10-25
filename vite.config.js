import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const SQL_DATASETS = path.join(ROOT, 'public', 'sql', 'datasets')
const SQL_COMPAT = path.join(ROOT, 'src', 'sql', 'compat')
const sqlFiles = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort().map((f) => path.join(dir, f))

// The SQL engine's prebuilt data directories (public/sql/datadir-<dataset>.tar.gz, made by the prebuild script) hold the compat
// layer and a dataset. Their URL carries a hash of what they are made from, so a browser never pairs an old cached data
// directory with a new compat layer after a redeploy.
function sqlDatadirVersion() {
  const h = createHash('sha256')
  const pglite = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules', '@electric-sql', 'pglite', 'package.json'), 'utf8')).version
  h.update(`pglite ${pglite}\n`)
  for (const f of [...sqlFiles(SQL_COMPAT), ...sqlFiles(SQL_DATASETS)]) h.update(`${path.basename(f)}\n`).update(fs.readFileSync(f))
  return h.digest('hex').slice(0, 12)
}

// `vite build` stops when a data directory is missing (the prebuild script did not run, or failed for one dataset)
function requireSqlDatadirs() {
  return {
    name: 'require-sql-datadirs',
    apply: 'build',
    buildStart() {
      const missing = sqlFiles(SQL_DATASETS)
        .map((f) => `datadir-${path.basename(f, '.sql')}.tar.gz`)
        .filter((f) => !fs.existsSync(path.join(ROOT, 'public', 'sql', f)))
      if (missing.length) {
        throw new Error(`missing SQL data directories in public/sql: ${missing.join(', ')}. Run "node scripts/sql/build-datadirs.mjs" (the prebuild script of npm run build) first.`)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/Ghid_Studii_AI/',
  plugins: [react(), tailwindcss(), requireSqlDatadirs()],
  define: { __SQL_DATADIR_VERSION__: JSON.stringify(sqlDatadirVersion()) },
  // PGlite loads its own WASM and data files relative to its module URL; pre-bundling would break that
  optimizeDeps: { exclude: ['@electric-sql/pglite'] },
  worker: { format: 'es' },
})
