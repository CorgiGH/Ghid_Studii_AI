export function tableBuild(table, columns) {
  const sqlAt = (k) => {
    const cols = columns.slice(0, k).map(c => `  ${c.name} ${c.type}${c.notNull ? ' NOT NULL' : ''}`);
    return `CREATE TABLE ${table} (${cols.length ? `\n${cols.join(',\n')}\n` : ''})`;
  };
  // Step 0 is the empty frame, steps 1..n add one column each (the last column too), and step n + 1 is the finished table.
  const phaseAt = (k) => (k <= 0 ? { kind: 'empty' } : k <= columns.length ? { kind: 'column', col: columns[k - 1], index: k - 1 } : { kind: 'done' });
  return { counts: columns.map((_, i) => i).concat([columns.length]).filter((v, i, a) => a.indexOf(v) === i), sqlAt, phaseAt, count: columns.length + 2 };
}
