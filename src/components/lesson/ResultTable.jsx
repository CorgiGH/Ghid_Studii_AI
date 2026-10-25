import React, { useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useScrollCues } from './useScrollCues.js';
import { cellClass, headerParts, spacedColumns, tableFitsWhole } from './tableText.js';

// A column header that may break after _ , ( or / (NR_MATRICOL, LPAD(RPAD('*',BURSA/50,'*'),9)) instead of widening its column.
function Header({ text }) {
  return headerParts(text).map((p, i) => <React.Fragment key={i}>{i > 0 && <wbr />}{p}</React.Fragment>);
}

// A query result as a table: header, rows, "n rows" line and a note when the engine cut the list. `mark` tints rows
// (extra rows of the learner's table, missing rows of the expected one); `tint` marks rows a script added or changed. NULL
// reads NULL, never a blank, and a value keeps its spaces (an LPAD result, a padded CHAR). Up to 20 rows the whole table
// shows; a longer one scrolls inside its box (opening at the first tinted row), and the line under it says what is hidden
// below or to the right.
export default function ResultTable({ title, columns, rows, rowCount, truncated = false, mark, markKind = 'extra', tint, caption, empty, countLabel }) {
  const { t } = useApp();
  const total = rowCount ?? rows.length;
  const capped = !tableFitsWhole(rows.length);
  const boxRef = useRef(null);
  // the parent rebuilds `rows` on every render (sorted, mapped), so the effects key on what the table holds, not the array
  const shape = `${rows.length}|${columns.join('\u0001')}|${rows.length ? rows[0].length : 0}`;
  const cues = useScrollCues(boxRef, 'tbody tr', [shape, capped], 'th'); // the header cells are what sticks
  const unit = countLabel
    ? (total === 1 ? countLabel.one : countLabel)
    : (total === 1 ? { en: 'row', ro: 'rând' } : { en: 'rows', ro: 'rânduri' });
  const changed = tint ? tint.filter(Boolean).length : 0;
  const mono = useMemo(() => spacedColumns(rows, columns.length), [rows, columns.length]);
  // a long table opens at the first row the script added or changed (only the box scrolls, never the page)
  const firstTint = tint ? tint.indexOf(true) : -1;
  useEffect(() => {
    const box = boxRef.current;
    if (!capped || !box || firstTint < 0) return;
    const tr = box.querySelectorAll('tbody tr')[firstTint];
    const head = box.querySelector('thead');
    if (!tr) return;
    const top = tr.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - (head ? head.offsetHeight : 0) - 4;
    if (top < box.scrollTop || top + tr.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = Math.max(0, top);
  }, [capped, firstTint, shape]);
  return (
    <figure className="sx-table" data-testid="sql-result-table">
      {title && <figcaption className="sx-table-title">{title}</figcaption>}
      <div ref={boxRef} className={`sx-table-scroll${capped ? ' is-capped' : ''}${cues.right ? ' is-cut-right' : ''}`} tabIndex={0} role="region" aria-label={title || t('Result', 'Rezultat')}>
        <table>
          <thead>
            <tr>{columns.map((c, i) => <th key={i} scope="col"><Header text={c} /></th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className={mark?.[ri] ? `is-${markKind}` : tint?.[ri] ? 'is-new' : undefined}>
                {r.map((v, ci) => (
                  <td key={ci} className={[cellClass(v), mono[ci] ? 'mono' : null].filter(Boolean).join(' ') || undefined}>{v === null || v === undefined ? 'NULL' : v}</td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="nul" colSpan={Math.max(1, columns.length)}>{empty || t('No rows', 'Niciun rând')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="sx-table-count" data-testid="sql-row-count">
        {t(`${total} ${unit.en}`, `${total} ${unit.ro}`)}
        {truncated && <span className="sx-trunc"> · {t(`showing the first ${rows.length}`, `se afișează primele ${rows.length}`)}</span>}
        {changed > 0 && (
          <span className="sx-changed" data-testid="sql-changed"> · {changed === 1
            ? t('the tinted row was added or changed by your script', 'rândul colorat e adăugat sau schimbat de scriptul tău')
            : t(`the ${changed} tinted rows were added or changed by your script`, `cele ${changed} rânduri colorate sunt adăugate sau schimbate de scriptul tău`)}</span>
        )}
        {caption && <span> · {caption}</span>}
        {cues.above > 0 && <span className="sx-cue" data-testid="sql-cue-above"> · {t(`${cues.above} more above ↑`, `încă ${cues.above} mai sus ↑`)}</span>}
        {cues.below > 0 && <span className="sx-cue" data-testid="sql-cue-below"> · {t(`${cues.below} more below, scroll in the table ↓`, `încă ${cues.below} mai jos, derulează în tabel ↓`)}</span>}
        {cues.right && <span className="sx-cue" data-testid="sql-cue-right"> · {t(`${columns.length} columns, swipe right →`, `${columns.length} coloane, glisează spre dreapta →`)}</span>}
      </p>
    </figure>
  );
}
