// Pass 5: a NATURAL JOIN column used with a qualifier is ORA-25155 in Oracle; PostgreSQL silently accepts it.
import { isSig, isWord } from './tokens.js'
import { OracleError } from '../engine/errors.js'

// Columns of the dataset tables (lowercase), needed to know which columns a NATURAL JOIN merges.
export const SCHEMA = {
  studenti: ['nr_matricol', 'nume', 'prenume', 'an', 'grupa', 'bursa', 'data_nastere'],
  cursuri: ['id_curs', 'titlu_curs', 'an', 'semestru', 'credite'],
  note: ['nr_matricol', 'id_curs', 'valoare', 'data_notare'],
  profesori: ['id_prof', 'nume', 'prenume', 'grad_didactic'],
  didactic: ['id_prof', 'id_curs'],
}

// Throws OracleError when a qualified common column is used; returns nothing otherwise.
export function naturalJoinCheck(ts) {
  const sig = ts.filter(isSig);
  if (!sig.some((x, i) => isWord(x, 'NATURAL') && isWord(sig[i + 1], 'JOIN'))) return;
  const tabs = [];       // {name, alias}
  for (let i = 0; i < sig.length; i++) {
    if ((isWord(sig[i], 'FROM') || isWord(sig[i], 'JOIN')) && sig[i + 1] && sig[i + 1].type === 'word' && SCHEMA[sig[i + 1].text.toLowerCase()]) {
      const name = sig[i + 1].text.toLowerCase(); let alias = name; const a = sig[i + 2];
      if (a && a.type === 'word' && !['JOIN', 'NATURAL', 'ON', 'WHERE', 'LEFT', 'RIGHT', 'FULL', 'INNER', 'CROSS', 'ORDER', 'GROUP', 'UNION', 'EXCEPT', 'INTERSECT', 'USING'].includes(a.text.toUpperCase())) alias = a.text.toLowerCase();
      tabs.push({ name, alias });
    }
  }
  const count = {}; tabs.forEach((t) => SCHEMA[t.name].forEach((c) => (count[c] = (count[c] || 0) + 1)));
  const common = new Set(Object.keys(count).filter((c) => count[c] > 1));
  const quals = new Set(tabs.flatMap((t) => [t.alias, t.name]));
  for (let i = 0; i + 2 < sig.length; i++) {
    if (sig[i].type === 'word' && sig[i + 1].text === '.' && sig[i + 2].type === 'word' && quals.has(sig[i].text.toLowerCase()) && common.has(sig[i + 2].text.toLowerCase()))
      throw new OracleError('ORA-25155', 'column used in NATURAL join cannot have qualifier');
  }
}

