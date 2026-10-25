// Pure helpers for the `sql-exercise` block (no React): the block's shape, what it asks the engine and the files, how a
// verdict reads, what is stored to bring the block back after a reload. Shared by the block, the validator script and the tests.
//
// Block JSON:
//   { type: 'sql-exercise', id, dataset: 'facultate'|'biblioteca', kind: 'query'|'state', prompt: {en, ro},
//     official?: { lab, ex: number|'inline-N' }, starter?, solution, altSolutions?: string[],
//     check: { order: 'any'|'required', mode: 'bag'|'set', orderBy?, aliases?, tables? (state), cosmetic? },
//     clock?: 'YYYY-MM-DD'|'YYYY-MM-DD HH:MM:SS', hints: [3 x {en, ro}], explain: {en, ro} }

export const DATASETS = ['facultate', 'biblioteca'];
export const KINDS = ['query', 'state'];
export const SCHEMA_TABLES = {
  facultate: ['studenti', 'cursuri', 'note', 'profesori', 'didactic'],
  biblioteca: ['cititori', 'carti', 'autori', 'scris', 'imprumuturi'],
};
export const HINT_COUNT = 3;

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isBi = (v) => !!v && typeof v === 'object' && isStr(v.en) && isStr(v.ro);
const CLOCK = /^\d{4}-\d\d-\d\d( \d\d:\d\d:\d\d)?$/;

// Returns a list of problems; empty means the block is well-formed.
export function validateSqlExercise(b) {
  const errs = [];
  const at = (m) => errs.push(`(sql-exercise${b?.id ? ` ${b.id}` : ''}): ${m}`);
  if (!isStr(b?.id)) at('id missing');
  if (!DATASETS.includes(b?.dataset)) at(`dataset must be one of ${DATASETS.join(', ')}`);
  if (!KINDS.includes(b?.kind)) at(`kind must be one of ${KINDS.join(', ')}`);
  if (!isBi(b?.prompt)) at('prompt must have en + ro');
  if (!isStr(b?.solution)) at('solution missing');
  if (!isBi(b?.explain)) at('explain must have en + ro');
  if (!Array.isArray(b?.hints) || b.hints.length !== HINT_COUNT) at(`needs exactly ${HINT_COUNT} hints`);
  else b.hints.forEach((h, i) => { if (!isBi(h)) at(`hints[${i}] must have en + ro`); });

  const c = b?.check;
  if (!c || typeof c !== 'object') at('check missing');
  else {
    if (!['any', 'required'].includes(c.order)) at('check.order must be "any" or "required"');
    if (!['bag', 'set'].includes(c.mode)) at('check.mode must be "bag" or "set"');
    if (c.orderBy !== undefined && !(Array.isArray(c.orderBy) && c.orderBy.every(isStr))) at('check.orderBy must be a list of column names');
    if (c.aliases !== undefined && c.aliases !== 'any-distinct' && !(Array.isArray(c.aliases) && c.aliases.every((a) => typeof a === 'string'))) {
      at('check.aliases must be "any-distinct" or a list of headers');
    }
    if (c.aliasCase !== undefined && c.aliasCase !== true) at('check.aliasCase must be true');
    if (c.aliasesDiffer !== undefined && !(Array.isArray(c.aliasesDiffer) && c.aliasesDiffer.every((a) => typeof a === 'string'))) {
      at('check.aliasesDiffer must be a list of column names');
    }
    if (c.cosmetic !== undefined && !(Array.isArray(c.cosmetic) && c.cosmetic.every((x) => x === '' || x === 'trim-case'))) {
      at('check.cosmetic must be a list of "" or "trim-case", one per column');
    }
    if (b?.kind === 'state' && !(Array.isArray(c.tables) && c.tables.length > 0 && c.tables.every(isStr))) at('a state exercise needs check.tables');
  }
  if (b?.official !== undefined) {
    const o = b.official;
    const exOk = Number.isInteger(o?.ex) || (typeof o?.ex === 'string' && /^inline-\d+$/.test(o.ex));
    if (!(o && Number.isInteger(o.lab) && exOk)) at('official must be { lab: number, ex: number | "inline-N" }');
  }
  if (b?.starter !== undefined && typeof b.starter !== 'string') at('starter must be text');
  if (b?.clock !== undefined && !(typeof b.clock === 'string' && CLOCK.test(b.clock))) at('clock must be YYYY-MM-DD or YYYY-MM-DD HH:MM:SS');
  if (b?.altSolutions !== undefined && !(Array.isArray(b.altSolutions) && b.altSolutions.every(isStr))) at('altSolutions must be a list of SQL texts');
  return errs;
}

// ---- what the block asks the engine and the files ---------------------------------------------------------------------
export const clockOf = (clock) => (!clock ? undefined : clock.length === 10 ? `${clock} 14:30:00` : clock);
// A clocked exercise runs on its own date for the learner (the lab data) and on the default date for the hidden variant, so a date
// typed by hand passes one and fails the other.
export const datasetFor = (b, hidden) => (hidden ? `${b.dataset}-hidden` : b.dataset);
export const expectedPath = (id, dataset) => `sql/expected/${id}.${dataset}.json`;

// Options for SqlClient.run: a state exercise runs the learner's text as a script, a clock exercise runs on its own clock.
export function runOptions(b, { hidden = false } = {}) {
  const o = { dataset: datasetFor(b, hidden) };
  const clock = hidden ? undefined : clockOf(b.clock);
  if (clock) o.clock = clock;
  if (b.kind === 'state') o.script = true;
  return o;
}

export function checkSpecOf(b) {
  return { order: 'any', mode: 'bag', ...(b.check ?? {}), kind: b.kind ?? 'query' };
}

// ---- how a verdict reads ----------------------------------------------------------------------------------------------
const HEADLINES = {
  correct: ['Corect', 'Correct', 'ok'],
  rows: ['Rândurile nu sunt cele cerute', 'The rows are not the ones asked for', 'bad'],
  rowcount: ['Numărul de rânduri nu este cel cerut', 'The number of rows is not the one asked for', 'bad'],
  order: ['Rândurile sunt bune, dar nu în ordinea cerută', 'The rows are right but not in the requested order', 'warn'],
  columns: ['Coloanele nu sunt cele cerute', 'The columns are not the ones asked for', 'bad'],
  alias: ['Datele sunt bune, dar numele coloanelor nu e cel cerut', 'The data is right, but the column names are not the requested ones', 'warn'],
  'not-oracle': ['Comanda nu este scrisă în Oracle SQL', 'The command is not written in Oracle SQL', 'warn'],
  structure: ['Structura tabelelor nu este cea cerută', 'The structure of the tables is not the one asked for', 'bad'],
};

export function verdictView(v) {
  const kind = v?.kind;
  if (kind === 'error') {
    return { ro: v.code ? `Oracle a răspuns cu eroarea ${v.code}` : 'Oracle a răspuns cu o eroare', en: v.code ? `Oracle answered with the error ${v.code}` : 'Oracle answered with an error', tone: 'bad' };
  }
  if (kind === 'contents') {
    return { ro: `Conținutul tabelului${v.table ? ` ${v.table}` : ''} nu este cel cerut`, en: `The contents of the table${v.table ? ` ${v.table}` : ''} are not the ones asked for`, tone: 'bad' };
  }
  const h = HEADLINES[kind];
  if (h) return { ro: h[0], en: h[1], tone: h[2] };
  return { ro: 'Rezultatul nu este cel cerut', en: 'The result is not the one asked for', tone: 'bad' };
}

// Which rows of `rows` are listed in `list` (each listed row marks one matching row). Used to tint the extra rows of the learner's
// table and the missing rows of the expected one.
export function markRows(rows, list) {
  const key = (r) => JSON.stringify(r.map((v) => (v === null || v === undefined ? null : String(v))));
  const left = new Map();
  for (const r of list ?? []) left.set(key(r), (left.get(key(r)) ?? 0) + 1);
  return rows.map((r) => {
    const k = key(r);
    const n = left.get(k) ?? 0;
    if (!n) return false;
    left.set(k, n - 1);
    return true;
  });
}

// A script's statements for the list under the editor.
export function statementRows(statements) {
  return (Array.isArray(statements) ? statements : []).map((s) => {
    const ok = !s.error;
    const note = ok
      ? (s.kind === 'dml' ? { ro: `${s.rowCount} ${s.rowCount === 1 ? 'rând modificat' : 'rânduri modificate'}`, en: `${s.rowCount} ${s.rowCount === 1 ? 'row changed' : 'rows changed'}` } : { ro: 'executată', en: 'done' })
      : { ro: s.error.message, en: s.error.message };
    return { sql: s.sql, ok, code: s.error?.code ?? null, note: note.ro, noteEn: note.en };
  });
}

// What the learner compares by hand in paper mode (the engine is not available): every point is something the checker checks.
export function paperChecklist(b, expected) {
  const c = b.check ?? {};
  const items = [];
  if (b.kind === 'state') {
    for (const t of c.tables ?? Object.keys(expected ?? {})) {
      const e = expected?.[t] ?? expected?.[String(t).toUpperCase()];
      const cols = e ? e.columns.join(', ') : '';
      items.push({
        ro: `Tabelul ${t} există și are coloanele${cols ? ` ${cols}` : ''}, cu aceleași rânduri ca în tabelul cerut`,
        en: `The table ${t} exists and has the columns${cols ? ` ${cols}` : ''}, with the same rows as the expected table`,
      });
    }
    return items;
  }
  if (expected?.columns) {
    items.push({ ro: `Ai coloanele cerute, în ordinea cerută: ${expected.columns.join(', ')}`, en: `You have the requested columns, in the requested order: ${expected.columns.join(', ')}` });
    const n = expected.rows.length;
    items.push({ ro: `Rezultatul are ${n} ${n === 1 ? 'rând' : 'rânduri'}`, en: `The result has ${n} ${n === 1 ? 'row' : 'rows'}` });
    items.push({ ro: 'Fiecare rând al tău se regăsește în tabelul cerut și invers', en: 'Every row of yours is in the expected table and the other way round' });
  }
  if (c.order === 'required') {
    items.push({ ro: `Rândurile sunt în ordinea cerută${c.orderBy?.length ? ` (după ${c.orderBy.join(', ')})` : ''}`, en: `The rows are in the requested order${c.orderBy?.length ? ` (by ${c.orderBy.join(', ')})` : ''}` });
  }
  if (Array.isArray(c.aliases)) {
    const named = c.aliases.filter(Boolean);
    if (named.length) items.push({ ro: `Coloanele se numesc ${named.join(', ')}`, en: `The columns are named ${named.join(', ')}` });
  } else if (c.aliases === 'any-distinct') {
    items.push({ ro: 'Fiecare coloană are un nume propriu, diferit de celelalte', en: 'Every column has a name of its own, different from the others' });
  }
  if (Array.isArray(c.aliasesDiffer) && c.aliasesDiffer.some(Boolean)) {
    items.push({ ro: 'Niciun antet nu e identic cu numele coloanei din tabel', en: 'No header is the same as the name of its column in the table' });
  }
  return items;
}

// ---- bringing the block back after a reload or Back --------------------------------------------------------------------
const CAP = 20;

// The part of a verdict worth keeping in localStorage: kind, code, message, table, mistake and a few of the differing rows.
export function slimVerdict(v) {
  if (!v) return null;
  const out = { ok: !!v.ok, kind: v.kind };
  for (const k of ['code', 'message', 'table', 'mistake']) if (v[k]) out[k] = v[k];
  out.missing = (v.missing ?? []).slice(0, CAP);
  out.extra = (v.extra ?? []).slice(0, CAP);
  return out;
}

// What the stored attempts of this screen say about block `id`, or null when it has none.
export function restoreSqlState(attempts, id) {
  const list = (Array.isArray(attempts) ? attempts : []).filter((a) => a && a.item === id && a.kind === 'sql');
  if (!list.length) return null;
  const last = list[list.length - 1];
  const hints = Number.isInteger(last.hints) ? Math.min(HINT_COUNT, Math.max(0, last.hints)) : 0;
  return {
    sql: typeof last.sql === 'string' ? last.sql : null,
    hints,
    revealed: last.revealed === true,
    verdict: last.verdict && typeof last.verdict === 'object' ? last.verdict : null,
    mistake: typeof last.mistake === 'string' && last.mistake ? last.mistake : (typeof last.verdict?.mistake === 'string' ? last.verdict.mistake : null),
    // true only when `sql` is a query the learner actually ran: a starter text, a paper hand-in or a reveal never gets re-run
    ran: last.ran === true && typeof last.sql === 'string' && last.sql.trim().length > 0,
    paper: last.paper === true,
    paperDone: last.paper === true && last.paperDone === true,
    ok: last.ok === true,
  };
}

// ---- what to do with an answer: record it, update it, mark a review, or nothing ------------------------------------------
// One decision for every path that can end an attempt, so the block has no three copies of the rule.
//   event 'run'          a run finished (verdict may be null when the expected file is missing or the grader threw)
//   event 'fault'        a run threw something other than a cancel
//   event 'reveal'       the learner opened the solution
//   event 'paper-submit' paper mode: the learner handed in
//   event 'paper-done'   paper mode: the learner confirmed the self-check (`paperOk` = every point ticked)
// hidden = the review variant (never writes an attempt, schedules through markReview); record = this block may write attempts;
// attempted = an attempt of this block is already stored; marked = the review answer was already given.
// Returns { type: 'none' | 'record' | 'update' | 'markReview', ok, unscored, set? }.
const NONE = { type: 'none' };
export const isGraded = (verdict) => !!verdict && verdict.kind !== 'error' && verdict.kind !== 'not-oracle';

export function attemptAction({ hidden = false, record = false, attempted = false, marked = false, verdict = null, silent = false, event = 'run', paperOk = false, revealed = false, paperOwned = false } = {}) {
  if (silent) return NONE;
  if (hidden) {
    if (marked) return NONE;
    if (event === 'run') return isGraded(verdict) ? { type: 'markReview', ok: verdict.ok === true } : NONE;
    if (event === 'reveal') return { type: 'markReview', ok: false };
    if (event === 'paper-done') return { type: 'markReview', ok: paperOk === true };
    return NONE;
  }
  if (!record) return NONE;
  switch (event) {
    case 'run':
      return attempted ? { type: 'update' } : { type: 'record', ok: isGraded(verdict) && verdict.ok === true, unscored: !verdict };
    case 'fault':
      return attempted ? NONE : { type: 'record', ok: false, unscored: false };
    case 'reveal':
      return attempted ? { type: 'update' } : { type: 'record', ok: false, unscored: false };
    case 'paper-submit':
      if (!attempted) return { type: 'record', ok: false, unscored: true, owns: true };
      // The solution was opened first: that attempt is already a miss, the hand-in only marks it as a paper one.
      // An attempt from a live run is somebody else's: the hand-in writes nothing and owns nothing.
      return revealed ? { type: 'update', owns: true, set: { paper: true } } : NONE;
    case 'paper-done':
      if (!attempted) return { type: 'record', ok: paperOk === true, unscored: false };
      if (!paperOwned) return NONE; // only the attempt this paper hand-in made (or marked) may be settled
      if (revealed) return { type: 'update', set: { paperDone: true } }; // already stands as a miss
      return paperOk ? { type: 'update', set: { ok: true, unscored: false, paperDone: true } } : { type: 'record', ok: false, unscored: false };
    default:
      return NONE;
  }
}

// The fields the reveal writes: on an existing attempt only the flag (the query, verdict, mistake and ran stay, so a reload brings
// them back); the first attempt of a block starts with the whole record.
export const revealFields = (attempted, sql) => (attempted ? { revealed: true } : { sql, verdict: null, ran: false, revealed: true });

// A query-kind run that ended in an ORA error is a verdict even without the expected file: the code and its explanation do not
// depend on the answer key. Returns true when checkResult can be asked.
export const canGrade = (expected, actual, spec) => !!expected || (spec?.kind !== 'state' && !!actual?.error);

// ---- the rows of a dataset file (the review variant shows them) --------------------------------------------------------
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function splitValues(body) {
  const out = [];
  let cur = '';
  let depth = 0;
  let quote = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (quote) {
      cur += ch;
      if (ch === "'") { if (body[i + 1] === "'") { cur += "'"; i++; } else quote = false; }
    } else if (ch === "'") { quote = true; cur += ch; }
    else if (ch === '(') { depth++; cur += ch; }
    else if (ch === ')') { depth--; cur += ch; }
    else if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function cellOf(raw) {
  if (/^null$/i.test(raw)) return null;
  const d = /^TO_DATE\(\s*'(\d\d)\/(\d\d)\/(\d{4})'\s*,\s*'dd\/mm\/yyyy'\s*\)$/i.exec(raw);
  if (d) return `${d[1]}-${MONTHS[Number(d[2]) - 1]}-${d[3].slice(2)}`;
  const q = /^'([\s\S]*)'$/.exec(raw);
  if (q) return q[1].replace(/''/g, "'");
  return /^-?\d+(\.\d+)?$/.test(raw) ? String(Number(raw)) : raw;
}

// [{ table, columns: [names], rows: [[cell]] }] from the CREATE TABLE and INSERT statements of a dataset file, in the order the
// file creates the tables. Dates read as the engine shows them (DD-MON-RR).
export function rowsFromSql(text) {
  const tables = schemaFromSql(text).map((tb) => ({ table: tb.table, columns: tb.columns.map((c) => c.name), rows: [] }));
  const by = new Map(tables.map((tb) => [tb.table, tb]));
  for (const m of String(text).matchAll(/^\s*INSERT\s+INTO\s+(\w+)\s+VALUES\s*\((.*)\)\s*;\s*$/gim)) {
    const tb = by.get(m[1].toUpperCase());
    if (tb) tb.rows.push(splitValues(m[2]).map(cellOf));
  }
  return tables;
}

// ---- the schema drawer when the engine is not there ---------------------------------------------------------------------
// The CREATE TABLE statements of a dataset file (written for the engine: numeric(6,2), ora_date ...) as the Oracle types the
// learner knows: [{ table, columns: [{ name, type, nullable }] }].
const ORACLE_TYPE = (raw) => {
  const t = raw.trim().replace(/\s+/g, '');
  let m = /^varchar2?\((\d+)\)$/i.exec(t);
  if (m) return `VARCHAR2(${m[1]})`;
  m = /^char\((\d+)\)$/i.exec(t);
  if (m) return `CHAR(${m[1]})`;
  m = /^numeric\((\d+),0\)$/i.exec(t);
  if (m) return `NUMBER(${m[1]})`;
  m = /^numeric\((\d+),(\d+)\)$/i.exec(t);
  if (m) return `NUMBER(${m[1]},${m[2]})`;
  if (/^ora_date$/i.test(t)) return 'DATE';
  return t.toUpperCase();
};

export function schemaFromSql(text) {
  const out = [];
  for (const m of String(text).matchAll(/CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\)\s*;/gi)) {
    const columns = [];
    // split on commas that are not inside parentheses
    let depth = 0;
    let cur = '';
    const parts = [];
    for (const ch of m[2]) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
    }
    parts.push(cur);
    for (const p of parts) {
      const c = /^\s*(\w+)\s+([\s\S]+?)\s*(NOT\s+NULL)?\s*$/i.exec(p);
      if (c && !/^(PRIMARY|FOREIGN|CONSTRAINT|UNIQUE)$/i.test(c[1])) columns.push({ name: c[1].toUpperCase(), type: ORACLE_TYPE(c[2]), nullable: !c[3] });
    }
    out.push({ table: m[1].toUpperCase(), columns });
  }
  return out;
}
