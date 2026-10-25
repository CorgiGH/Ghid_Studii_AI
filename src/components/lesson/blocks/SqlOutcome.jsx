import React from 'react';
import ResultTable from '../ResultTable.jsx';
import { explainMistake, explainVerdict } from '../../../sql/explain.js';
import { changedRows, describeRows, markRows, sortRows, statementRows, verdictView } from './sqlExerciseSpec.js';

// The verdict panel, the learner's result (beside the expected table when it differs) and the expected tables: shared by the
// sql-exercise block and the sql test question.
const upperKeys = (o) => Object.fromEntries(Object.entries(o ?? {}).map(([k, v]) => [k.toUpperCase(), v]));
const COMPARE_KINDS = new Set(['rows', 'rowcount', 'order', 'columns', 'alias', 'contents']);

// The one place a screen reader hears results: the note or the verdict headline, in a region that is always in the page. The result
// tables and the rest of the panel stay outside it.
export function LiveStatus({ text }) {
  return <div className="sx-sr" role="status" aria-live="polite" aria-atomic="true" data-testid="sql-live">{text || ''}</div>;
}

export function VerdictPanel({ verdict, mistake, hidden, t }) {
  const head = verdictView(verdict);
  const why = explainVerdict(verdict);
  const m = mistake ? explainMistake(mistake) : null;
  return (
    <div className={`sx-verdict is-${head.tone}`} data-testid="sql-verdict" data-kind={verdict.kind}>
      <p className="sx-verdict-head">{t(head.en, head.ro)}</p>
      {verdict.kind === 'error' && (
        <p className="sx-ora"><code>{verdict.code}</code>{verdict.message ? ` ${verdict.message}` : ''}</p>
      )}
      <p>{t(why.en, why.ro)}</p>
      {m && <p className="sx-mistake" data-testid="sql-mistake" data-mistake={mistake}><strong>{t('Likely cause: ', 'Posibilă cauză: ')}</strong>{t(m.en, m.ro)}</p>}
      {hidden && verdict.ok && <p className="sx-muted">{t('Right on different rows too.', 'Corect și pe alte rânduri.')}</p>}
    </div>
  );
}

// What the learner's run left on screen: the result (or the script's statements and tables) and, when it is wrong, the expected
// table beside it with the differing rows tinted.
export function Outcome({ block, outcome, t }) {
  const { result, snapshot, verdict, expected, before } = outcome;
  const compare = !!expected && !!verdict && !verdict.ok && COMPARE_KINDS.has(verdict.kind);
  const state = block.kind === 'state';
  if (state) {
    const stmts = statementRows(result.statements);
    const tables = (block.check.tables ?? []).map((n) => n.toUpperCase());
    const snap = upperKeys(snapshot);
    const exp = upperKeys(expected);
    const prior = upperKeys(before);
    const structure = !!block.check.structure;
    return (
      <div className="sx-outcome">
        <ol className="sx-stmts" data-testid="sql-statements">
          {stmts.map((s, i) => (
            <li key={i} className={s.ok ? 'ok' : 'bad'}>
              <code>{s.sql.replace(/\s+/g, ' ').trim()}</code>
              <span className="sx-stmt-state">{s.ok ? `OK · ${t(s.noteEn, s.note)}` : `${s.code} · ${s.note}`}</span>
            </li>
          ))}
        </ol>
        {tables.map((name) => {
          const a = snap[name];
          if (!a || a.error) return <p key={name} className="sx-muted">{name}: {t('the table does not exist', 'tabelul nu există')}</p>;
          const e = exp[name];
          const wrongHere = !!verdict && !verdict.ok && verdict.table?.toUpperCase() === name;
          if (structure) {
            // a CREATE TABLE exercise is graded on the columns: show them as DESCRIBE does, the expected ones beside them when they differ
            const mine = describeRows(a.describe);
            const want = e?.describe ? describeRows(e.describe) : null;
            const head = [t('Column', 'Coloană'), t('Type', 'Tip'), 'NOT NULL'];
            return (
              <div key={name} className={wrongHere && want ? 'sx-compare' : undefined}>
                <ResultTable title={`${name} · ${wrongHere ? t('yours', 'al tău') : t('its columns (DESCRIBE)', 'coloanele lui (DESCRIBE)')}`} columns={head} rows={mine}
                  countLabel={{ en: 'columns', ro: 'coloane', one: { en: 'column', ro: 'coloană' } }}
                  mark={wrongHere && want ? markRows(mine, want).map((x) => !x) : undefined} markKind="extra" />
                {wrongHere && want && (
                  <ResultTable title={`${name} · ${t('expected', 'cerut')}`} columns={head} rows={want}
                    countLabel={{ en: 'columns', ro: 'coloane', one: { en: 'column', ro: 'coloană' } }}
                    mark={markRows(want, mine).map((x) => !x)} markKind="missing" />
                )}
              </div>
            );
          }
          const mark = compare && verdict.table?.toUpperCase() === name;
          const rows = sortRows(a.rows);
          const changed = changedRows(rows, prior[name]);
          const eRows = e ? sortRows(e.rows) : null;
          return (
            <div key={name} className={mark && e ? 'sx-compare' : undefined}>
              <ResultTable title={mark ? `${name} · ${t('yours', 'al tău')}` : name} columns={a.columns} rows={rows} rowCount={a.rowCount} truncated={a.truncated}
                mark={mark ? markRows(rows, verdict.extra) : undefined} markKind="extra" tint={changed} />
              {mark && e && <ResultTable title={`${name} · ${t('expected', 'cerut')}`} columns={e.columns} rows={eRows} mark={markRows(eRows, verdict.missing)} markKind="missing" />}
            </div>
          );
        })}
      </div>
    );
  }
  if (result.error || result.kind !== 'rows') return null;
  return (
    <div className={`sx-outcome${compare ? ' sx-compare' : ''}`}>
      <ResultTable title={t('Your result', 'Rezultatul tău')} columns={result.columns} rows={result.rows} rowCount={result.rowCount} truncated={result.truncated}
        mark={compare ? markRows(result.rows, verdict.extra) : undefined} markKind="extra" />
      {compare && (
        <ResultTable title={t('Expected result', 'Rezultatul cerut')} columns={expected.columns} rows={expected.rows}
          mark={markRows(expected.rows, verdict.missing)} markKind="missing" />
      )}
    </div>
  );
}

export function ExpectedTables({ block, expected, t }) {
  if (block.kind === 'state') {
    return Object.entries(upperKeys(expected)).map(([name, e]) => (
      <ResultTable key={name} title={`${name} · ${t('expected', 'cerut')}`} columns={e.columns} rows={e.rows} />
    ));
  }
  return <ResultTable title={t('Expected result', 'Rezultatul cerut')} columns={expected.columns} rows={expected.rows} />;
}

