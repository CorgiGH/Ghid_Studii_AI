// Dev-only Oracle 11g runner for the differential tests. Never shipped to the browser.
//
//   runOnOracle(statements, { clock, dataset, maxRows? }) -> Promise<Result[]>
//
// Runs every statement on the local `oraxe11` container as user STUDENT (password from env ORA_STUDENT_PW, sent on
// stdin so it never shows up in a process list) through DBMS_SQL. Every cell is fetched as VARCHAR2 under the session
// NLS defaults (AMERICAN / AMERICA / DD-MON-RR), so the cell text is exactly what the learner is meant to see.
// Results use the same shape as the engine's `Engine.run`:
//   { kind: 'rows'|'ddl'|'dml'|'tx', columns, rows, rowCount, truncated, error?: { code, message } }
//
// `clock` ('YYYY-MM-DD HH24:MI:SS') replaces SYSDATE / CURRENT_DATE (fixed TO_DATE), SYSTIMESTAMP / CURRENT_TIMESTAMP
// (fixed TO_TIMESTAMP_TZ at +00:00) and LOCALTIMESTAMP (fixed TO_TIMESTAMP) outside literals, quoted identifiers and comments. Pass `clock: null` to run the text untouched; column headers then show the real SYSDATE
// text, which is what Oracle prints (the substituted text would leak into the header).
// `dataset` names the schema the container holds; the only one loaded is `facultate` (the STUDENT tables).
import { execFileSync } from 'node:child_process'

const DEFAULT_DOCKER_HOST = 'unix:///run/user/1000/docker.sock'
const CONTAINER = 'oraxe11'
const CLOCK_RE = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/

export const NLS_RESET =
  "ALTER SESSION SET NLS_LANGUAGE=AMERICAN NLS_TERRITORY=AMERICA NLS_DATE_FORMAT='DD-MON-RR' NLS_DATE_LANGUAGE=AMERICAN NLS_NUMERIC_CHARACTERS='.,'"

// Replace the clock-function tokens outside '...' literals, "..." identifiers and comments.
export function substituteClock(sql, clock) {
  const fixed = {
    date: `TO_DATE('${clock}','YYYY-MM-DD HH24:MI:SS')`,
    tstz: `TO_TIMESTAMP_TZ('${clock} +00:00','YYYY-MM-DD HH24:MI:SS TZH:TZM')`,
    ts: `TO_TIMESTAMP('${clock}','YYYY-MM-DD HH24:MI:SS')`,
  }
  let out = ''
  let i = 0
  while (i < sql.length) {
    const c = sql[i]
    if (c === "'") {
      let j = i + 1
      for (;;) {
        if (j >= sql.length) break
        if (sql[j] === "'") {
          if (sql[j + 1] === "'") { j += 2; continue }
          break
        }
        j++
      }
      out += sql.slice(i, j + 1); i = j + 1; continue
    }
    if (c === '"') {
      const j = sql.indexOf('"', i + 1)
      const end = j < 0 ? sql.length : j + 1
      out += sql.slice(i, end); i = end; continue
    }
    if (c === '-' && sql[i + 1] === '-') {
      const j = sql.indexOf('\n', i)
      const end = j < 0 ? sql.length : j
      out += sql.slice(i, end); i = end; continue
    }
    if (c === '/' && sql[i + 1] === '*') {
      const j = sql.indexOf('*/', i + 2)
      const end = j < 0 ? sql.length : j + 2
      out += sql.slice(i, end); i = end; continue
    }
    const prev = sql[i - 1] || ' '
    const m = /^(sysdate|current_date|systimestamp|current_timestamp|localtimestamp)(?![A-Za-z0-9_$#])/i.exec(sql.slice(i))
    if (m && !/[A-Za-z0-9_$#.]/.test(prev)) {
      const w = m[1].toLowerCase()
      out += w === 'systimestamp' || w === 'current_timestamp' ? fixed.tstz : w === 'localtimestamp' ? fixed.ts : fixed.date
      i += m[0].length; continue
    }
    out += c; i++
  }
  return out
}

function kindOf(sql) {
  const w = (/^[\s(]*(?:\/\*[\s\S]*?\*\/[\s(]*|--[^\n]*\n[\s(]*)*([A-Za-z]+)/.exec(sql) || [])[1]?.toUpperCase()
  if (w === 'SELECT' || w === 'WITH') return 'rows'
  if (w === 'INSERT' || w === 'UPDATE' || w === 'DELETE' || w === 'MERGE') return 'dml'
  if (w === 'COMMIT' || w === 'ROLLBACK' || w === 'SAVEPOINT') return 'tx'
  return 'ddl'
}

function quoteDelim(s) {
  for (const d of ['!', '~', '^', '#', '@', '%', '|']) if (!s.includes(d + "'")) return d
  throw new Error('no usable q-quote delimiter for a statement')
}

const PROC = `SET DEFINE OFF
SET SQLBLANKLINES ON
SET SERVEROUTPUT ON SIZE UNLIMITED FORMAT WRAPPED
SET LINESIZE 32767
SET TRIMOUT ON
SET PAGESIZE 0
SET FEEDBACK OFF
SET ECHO OFF
SET VERIFY OFF
CREATE OR REPLACE PROCEDURE zv_q(p_id VARCHAR2, p_sql VARCHAR2, p_query NUMBER) IS
  c INTEGER; n INTEGER; d DBMS_SQL.DESC_TAB2; v VARCHAR2(4000); x INTEGER; ln VARCHAR2(32767);
  FUNCTION h(t VARCHAR2) RETURN VARCHAR2 IS BEGIN IF t IS NULL THEN RETURN '~'; END IF; RETURN RAWTOHEX(UTL_RAW.CAST_TO_RAW(t)); END;
BEGIN
  DBMS_OUTPUT.PUT_LINE('##Q '||p_id);
  c := DBMS_SQL.OPEN_CURSOR;
  BEGIN
    DBMS_SQL.PARSE(c, p_sql, DBMS_SQL.NATIVE);
    IF p_query = 1 THEN
      DBMS_SQL.DESCRIBE_COLUMNS2(c, n, d);
      ln := '';
      FOR i IN 1..n LOOP
        DBMS_SQL.DEFINE_COLUMN(c, i, v, 4000);
        ln := ln || CASE WHEN i>1 THEN ',' END || h(d(i).col_name);
      END LOOP;
      DBMS_OUTPUT.PUT_LINE('##C '||ln);
      x := DBMS_SQL.EXECUTE(c);
      WHILE DBMS_SQL.FETCH_ROWS(c) > 0 LOOP
        ln := '';
        FOR i IN 1..n LOOP
          DBMS_SQL.COLUMN_VALUE(c, i, v);
          ln := ln || CASE WHEN i>1 THEN ',' END || h(v);
        END LOOP;
        DBMS_OUTPUT.PUT_LINE('##R '||ln);
      END LOOP;
    ELSE
      x := DBMS_SQL.EXECUTE(c);
      DBMS_OUTPUT.PUT_LINE('##X '||x);
    END IF;
  EXCEPTION WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('##E '||SQLCODE||' '||h(SUBSTR(SQLERRM,1,400)));
  END;
  IF DBMS_SQL.IS_OPEN(c) THEN DBMS_SQL.CLOSE_CURSOR(c); END IF;
  DBMS_OUTPUT.PUT_LINE('##Z');
END;
/
SHOW ERRORS
`

export async function runOnOracle(statements, o = {}) {
  const { clock, dataset = 'facultate', maxRows = Infinity } = o
  if (dataset !== 'facultate') throw new Error(`oracle container only holds the 'facultate' dataset, asked for '${dataset}'`)
  if (clock != null && !CLOCK_RE.test(clock)) throw new Error(`clock must look like 'YYYY-MM-DD HH24:MI:SS', got '${clock}'`)
  const pw = process.env.ORA_STUDENT_PW
  if (!pw) throw new Error('ORA_STUDENT_PW is not set (run: set -a; . ~/.config/bd-oracle.env; set +a)')

  let script = `${PROC}${NLS_RESET};\n`
  const kinds = statements.map(kindOf)
  statements.forEach((raw, i) => {
    const text = (clock == null ? raw : substituteClock(raw, clock)).replace(/;\s*$/, '')
    const d = quoteDelim(text)
    script += `BEGIN zv_q('${i}', q'${d}${text}${d}', ${kinds[i] === 'rows' ? 1 : 0}); END;\n/\n`
  })
  script += 'DROP PROCEDURE zv_q;\nEXIT\n'

  const env = { ...process.env, DOCKER_HOST: process.env.DOCKER_HOST || DEFAULT_DOCKER_HOST }
  const stdin = `CONNECT student/${pw}@localhost/XE\n${script}`
  const out = execFileSync(
    'docker',
    ['exec', '-i', '-e', 'NLS_LANG=AMERICAN_AMERICA.AL32UTF8', CONTAINER, 'sqlplus', '-s', '/nolog'],
    { env, input: stdin, maxBuffer: 1 << 29, timeout: 600000 },
  ).toString('latin1')

  const unhex = (x) => (x === '~' ? null : Buffer.from(x, 'hex').toString('utf8'))
  const results = statements.map((_, i) => ({ kind: kinds[i], columns: [], rows: [], rowCount: 0, truncated: false }))
  const seen = new Set()
  let cur = null
  for (const line of out.split('\n')) {
    if (line.startsWith('##Q ')) { seen.add(+line.slice(4)); cur = results[+line.slice(4)]; continue }
    if (!cur) continue
    if (line.startsWith('##C ')) {
      const body = line.slice(4).trim()
      cur.columns = body ? body.split(',').map(unhex) : []
    } else if (line.startsWith('##R ')) {
      cur.rowCount++
      if (cur.rows.length < maxRows) cur.rows.push(line.slice(4).trim().split(',').map(unhex))
      else cur.truncated = true
    } else if (line.startsWith('##X ')) {
      cur.rowCount = +line.slice(4)
    } else if (line.startsWith('##E ')) {
      const [sqlcode, msg] = line.slice(4).trim().split(' ')
      cur.error = { code: 'ORA-' + String(-sqlcode).padStart(5, '0'), message: unhex(msg) }
    } else if (line.startsWith('##Z')) cur = null
  }
  if (!seen.size && statements.length) throw new Error('sqlplus produced no results:\n' + out.slice(0, 500))
  results.forEach((r, i) => { if (!seen.has(i)) r.error = { code: 'HARNESS', message: 'statement was not executed by the Oracle script' } })
  return results
}
