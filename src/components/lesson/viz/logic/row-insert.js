import { listEn, listRo } from './words.js';

const sqlVal = (v) => (v === null || v === undefined ? 'NULL' : /^-?\d+(\.\d+)?$/.test(String(v)) && typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

const MESSAGES = {
  'ORA-01400': (col, table) => `cannot insert NULL into ("STUDENT"."${table.toUpperCase()}"."${col.toUpperCase()}")`,
  'ORA-00001': (col, table) => `unique constraint violated on "${table.toUpperCase()}"."${col.toUpperCase()}"`,
  'ORA-12899': (col, table) => `value too large for column "STUDENT"."${table.toUpperCase()}"."${col.toUpperCase()}"`,
  'ORA-01722': () => 'invalid number',
};

export function rowInsert({ table, row, errorCase = null }) {
  const columns = Object.keys(row);
  const insertSql = `INSERT INTO ${table} VALUES (${columns.map(c => sqlVal(row[c])).join(', ')})`;
  let error = null;
  if (errorCase) {
    const bad = errorCase.row || row;
    const column = columns.find(c => bad[c] !== row[c]) || columns[0];
    const msg = (MESSAGES[errorCase.code] || (() => 'statement rejected'))(column, table);
    error = {
      code: errorCase.code,
      column,
      row: bad,
      message: `${errorCase.code}: ${msg}`,
      sql: `INSERT INTO ${table} VALUES (${columns.map(c => sqlVal(bad[c])).join(', ')})`,
    };
  }
  return { columns, row, insertSql, error, count: error ? 3 : 2 };
}

const shown = (v) => (v === null || v === undefined ? 'NULL' : sqlVal(v));

// What each step says. The widget draws only the new row under the table's columns (not the rows the table already
// has), so step 0 speaks of the empty place for that row and never claims the table itself is empty.
export function rowInsertCaption(r, k, table) {
  if (k === 0) {
    return {
      en: `The columns of ${table}, and under them the empty place of the new row. One INSERT adds exactly one row.`,
      ro: `Coloanele tabelului ${table} și, sub ele, locul gol al rândului nou. Un INSERT adaugă exact un rând.`,
    };
  }
  if (k === 1) {
    const [c1, c2] = r.columns;
    const nulls = r.columns.filter(c => r.row[c] === null || r.row[c] === undefined);
    const nullEn = !nulls.length ? '' : nulls.length === 1
      ? ` Column ${nulls[0]} is NULL because we wrote NULL in its place.`
      : ` Columns ${listEn(nulls)} are NULL because we wrote NULL in their place.`;
    const nullRo = !nulls.length ? '' : nulls.length === 1
      ? ` Coloana ${nulls[0]} e NULL pentru că am scris NULL pe locul ei.`
      : ` Coloanele ${listRo(nulls)} sunt NULL pentru că am scris NULL pe locul lor.`;
    return {
      en: `Each value lands in the column at the same position: ${shown(r.row[c1])} in ${c1}, ${shown(r.row[c2])} in ${c2}, and so on.${nullEn}`,
      ro: `Fiecare valoare ajunge în coloana de pe aceeași poziție: ${shown(r.row[c1])} în ${c1}, ${shown(r.row[c2])} în ${c2} și tot așa.${nullRo}`,
    };
  }
  // the error step: the row from step 1 is still drawn above, the rejected one in red below it
  const e = r.error;
  const key = r.columns[0];
  const bad = shown(e.row[e.column]);
  const why = e.code === 'ORA-01400'
    ? { en: ` The red row has NULL in ${e.column}, and ${e.column} is NOT NULL, so it is rejected.`, ro: ` Rândul roșu are NULL în ${e.column}, iar ${e.column} e NOT NULL, deci e respins.` }
    : { en: ` The red row, with ${bad} in ${e.column}, is rejected.`, ro: ` Rândul roșu, cu ${bad} în ${e.column}, e respins.` };
  return {
    en: `Nothing was added. The row above, with ${shown(r.row[key])}, went in at the previous step.${why.en}`,
    ro: `Nu s-a adăugat nimic. Rândul de sus, cu ${shown(r.row[key])}, a intrat la pasul trecut.${why.ro}`,
  };
}
