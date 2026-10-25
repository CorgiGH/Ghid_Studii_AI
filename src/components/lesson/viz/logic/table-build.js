export function tableBuild(table, columns) {
  const sqlAt = (k) => {
    const cols = columns.slice(0, k).map(c => `  ${c.name} ${c.type}${c.notNull ? ' NOT NULL' : ''}`);
    return `CREATE TABLE ${table} (${cols.length ? `\n${cols.join(',\n')}\n` : ''})`;
  };
  return { counts: columns.map((_, i) => i).concat([columns.length]).filter((v, i, a) => a.indexOf(v) === i), sqlAt, count: columns.length + 1 };
}
