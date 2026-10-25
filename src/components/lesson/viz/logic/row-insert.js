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
