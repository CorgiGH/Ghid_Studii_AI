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
export const datasetFor = (b, hidden) => (hidden ? `${b.dataset}-hidden` : b.dataset);
export const expectedPath = (id, dataset) => `sql/expected/${id}.${dataset}.json`;

// Options for SqlClient.run: a state exercise runs the learner's text as a script, a clock exercise runs on its own clock.
export function runOptions(b, { hidden = false } = {}) {
  const o = { dataset: datasetFor(b, hidden) };
  const clock = clockOf(b.clock);
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
    ok: last.ok === true,
  };
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
