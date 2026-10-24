// Dev-only: the practice datasets inside the local Oracle container, one throw-away schema per dataset, so exercises
// (including ones that DROP and CREATE tables) can be run on real Oracle without touching the STUDENT lab tables.
//
//   oracleSchemaFor('facultate-hidden')            -> 'FZ_FACULTATE_HIDDEN'
//   pgToOracle(text)                               -> the dataset file (PostgreSQL spelling) as Oracle DDL / INSERT statements
//   loadDatasetOnOracle(name, text)                -> (re)creates the schema and loads the dataset; returns the schema name
//   runOnDataset(name, statements, { clock, maxRows }) -> Promise<Result[]>, same as runOnOracle in that schema
//
// The schema password is the STUDENT password (env ORA_STUDENT_PW), sent on stdin only.
import { execFileSync } from 'node:child_process'
import { splitScript } from '../../src/sql/engine/script.js'
import { runOnOracle } from './oracle.mjs'

export const oracleSchemaFor = (dataset) => {
  if (!/^[a-z][a-z0-9-]*$/.test(dataset)) throw new Error(`bad dataset name '${dataset}'`)
  return 'FZ_' + dataset.toUpperCase().replace(/-/g, '_')
}

// The dataset files are written for the engine (PostgreSQL types); Oracle gets the spelling the lab scripts use.
export function pgToOracle(text) {
  return text
    .replace(/\bvarchar\s*\(/gi, 'VARCHAR2(')
    .replace(/\bnumeric\s*\(\s*(\d+)\s*,\s*0\s*\)/gi, 'NUMBER($1)')
    .replace(/\bnumeric\s*\(/gi, 'NUMBER(')
    .replace(/\bora_date\b/gi, 'DATE')
}

function sysdba(sql, pw) {
  execFileSync('docker', ['exec', '-i', 'oraxe11', 'sqlplus', '-s', '/', 'as', 'sysdba'], {
    env: { ...process.env, DOCKER_HOST: process.env.DOCKER_HOST || 'unix:///run/user/1000/docker.sock' },
    input: sql.replace(/__PW__/g, pw),
    timeout: 120000,
  })
}

export async function loadDatasetOnOracle(name, text) {
  const pw = process.env.ORA_STUDENT_PW
  if (!pw) throw new Error('ORA_STUDENT_PW is not set (run: set -a; . ~/.config/bd-oracle.env; set +a)')
  const user = oracleSchemaFor(name)
  sysdba(`WHENEVER SQLERROR CONTINUE
SET FEEDBACK OFF
DROP USER ${user} CASCADE;
CREATE USER ${user} IDENTIFIED BY "__PW__" DEFAULT TABLESPACE USERS TEMPORARY TABLESPACE TEMP;
GRANT CONNECT, RESOURCE TO ${user};
EXIT
`, pw)
  const statements = splitScript(pgToOracle(text))
  const results = await runOnOracle(statements, { clock: null, user })
  const bad = results.findIndex((r) => r.error)
  if (bad >= 0) throw new Error(`loading ${name} on Oracle failed at statement ${bad + 1}: ${results[bad].error.code} ${results[bad].error.message}\n${statements[bad]}`)
  return user
}

export const runOnDataset = (name, statements, o = {}) => runOnOracle(statements, { ...o, user: oracleSchemaFor(name) })
