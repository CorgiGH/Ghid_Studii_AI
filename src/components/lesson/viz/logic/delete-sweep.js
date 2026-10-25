import { DATA, evalWhere } from './common.js';
import { rows } from './words.js';

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

// The badges under the table at step k: before anything is marked only the table's size is known; once the WHERE has
// marked rows, how many go and how many stay (the two always add up to the table's size).
export function sweepBadges(d, k) {
  if (k === 0) return [{ kind: 'total', n: d.rows.length }];
  return [{ kind: 'go', n: d.deleted }, { kind: 'stay', n: d.kept }];
}

export function sweepCaption(d, k, { table, where }) {
  if (k === 0) {
    return {
      en: `${table} has ${rows(d.rows.length).en}. ${where ? 'The WHERE decides which ones go.' : 'There is no WHERE.'}`,
      ro: `${table} are ${rows(d.rows.length).ro}. ${where ? 'WHERE hotărăște care pleacă.' : 'Nu există WHERE.'}`,
    };
  }
  if (k === 1) {
    return where
      ? { en: `${rows(d.deleted).en} satisfy ${where}. Only those are marked.`, ro: `${d.deleted === 1 ? '1 rând îndeplinește' : `${rows(d.deleted).ro} îndeplinesc`} ${where}. Doar ${d.deleted === 1 ? 'el este marcat' : 'ele sunt marcate'}.` }
      : { en: 'Without WHERE every row is marked.', ro: 'Fără WHERE toate rândurile sunt marcate.' };
  }
  return where
    ? { en: `${rows(d.deleted).en} deleted, ${d.kept} stay.`, ro: `${d.deleted === 1 ? '1 rând șters' : `${rows(d.deleted).ro} șterse`}, ${d.kept === 1 ? 'rămâne 1' : `rămân ${d.kept}`}.` }
    : { en: 'All rows are gone, but the table itself, its columns and types, is still there.', ro: 'Toate rândurile au dispărut, dar tabelul, cu coloanele și tipurile lui, există în continuare.' };
}
