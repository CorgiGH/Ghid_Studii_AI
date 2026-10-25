import { DATA, evalWhere } from './common.js';

export function deleteSweep({ table, where }) {
  const rows = DATA[table] || [];
  const doomed = rows.map(r => (where ? evalWhere(where, r) === true : true));
  const deleted = doomed.filter(Boolean).length;
  return {
    rows,
    columns: Object.keys(rows[0] || {}),
    doomed,
    deleted,
    kept: rows.length - deleted,
    sql: `DELETE FROM ${table}${where ? ` WHERE ${where}` : ''}`,
    count: 3,
  };
}
