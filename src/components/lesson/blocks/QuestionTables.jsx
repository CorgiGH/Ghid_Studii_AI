// The tables a question is about (a reflect prompt, an mcq), shown with the question so the learner never
// answers about data they cannot see. `table`: one table or a list of them, each either { dataset, sql, caption? } (run by the
// SQL engine) or a static { columns, rows, caption?, highlight? } (typed into the JSON, drawn at once).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { useSqlRunner } from '../viz/useSqlRunner.js';
import { displayCell } from '../viz/logic/date-mask.js';
import ResultTable from '../ResultTable.jsx';
import formatMarkdown from '../../blocks/formatMarkdown';
import { pickReflectTable, tableFromResult } from './reflectTable.js';
import { isStaticTable } from './choiceSpec.js';

// The small result table a question is about: the plain fallback at once (a cold load would otherwise show the question with
// no table while the engine starts), then the engine's own result once it answers.
function OneTable({ index, dataset, sql, caption, onSettled }) {
  const { t } = useApp();
  const runner = useSqlRunner();
  const [fromEngine, setFromEngine] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (runner.status !== 'ready') return undefined;
    let live = true;
    // The runner reads the engine status only once, so a run that rejects (engine failed to
    // start) or gives no table is how a late failure shows; then the fallback takes over.
    runner.run(sql, { dataset })
      .then(r => { if (!live) return; const tb = tableFromResult(r); if (tb) setFromEngine(tb); else setFailed(true); })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [runner, sql, dataset]);
  const table = useMemo(() => pickReflectTable({ fromEngine, sql }), [fromEngine, sql]);
  // Settled: the engine's table is on screen, or it never will be (no engine), or the plain fallback has been up for
  // 4 s on a slow engine. Until then the question's options wait, so neither a late table nor the fallback-to-engine
  // swap (a slightly different height) can move an option out from under the learner's finger.
  const [slow, setSlow] = useState(false);
  useEffect(() => { const id = setTimeout(() => setSlow(true), 4000); return () => clearTimeout(id); }, []);
  const settled = !!fromEngine || runner.status === 'unavailable' || failed || (!!table && slow);
  useEffect(() => { onSettled?.(index, settled); }, [index, settled, onSettled]);
  if (!table) {
    if (runner.status === 'unavailable' || failed) return null;
    return <p className="ch-table-wait" data-testid="question-table-wait">{t('Loading the table…', 'Se încarcă tabelul…')}</p>;
  }
  const rows = table.rows.map((r) => table.columns.map((c) => (r[c] === null || r[c] === undefined ? null : displayCell(r[c]))));
  return <div className="ch-table" data-testid="question-table"><ResultTable title={caption || undefined} columns={table.columns} rows={rows} /></div>;
}

// A static table needs no engine: no hook here touches useSqlRunner, and it is settled from the first render. A cell or a
// header written with $…$ is typeset; a column is a string or { en, ro }.
function StaticTable({ columns, rows, caption, highlight }) {
  const { t } = useApp();
  const cell = (v) => (typeof v === 'string' && /[$`*]/.test(v) ? <span dangerouslySetInnerHTML={{ __html: formatMarkdown(v) }} /> : v);
  const head = columns.map((c) => (typeof c === 'string' ? c : t(c.en, c.ro)));
  return (
    <div className="ch-table" data-testid="question-table">
      <ResultTable title={caption ? t(caption.en, caption.ro) : undefined} columns={head} rows={rows.map((r) => r.map(cell))} highlight={highlight} />
    </div>
  );
}

// onReady(): called once every table has settled (see OneTable), so a question can hold its options until then.
export default function QuestionTables({ table, onReady }) {
  const { t } = useApp();
  const list = table ? (Array.isArray(table) ? table : [table]) : [];
  const [settled, setSettled] = useState(() => list.map(isStaticTable)); // a static table is settled at once
  const report = useCallback((i, ok) => setSettled((s) => (s[i] === ok ? s : s.map((v, j) => (j === i ? ok : v)))), []);
  const all = settled.length > 0 && settled.every(Boolean);
  useEffect(() => { if (all) onReady?.(); }, [all, onReady]);
  if (!list.length) return null;
  return list.map((tb, i) => (isStaticTable(tb)
    ? <StaticTable key={i} columns={tb.columns} rows={tb.rows} caption={tb.caption} highlight={tb.highlight} />
    : <OneTable key={i} dataset={tb.dataset} sql={tb.sql} index={i} caption={tb.caption ? t(tb.caption.en, tb.caption.ro) : null} onSettled={report} />
  ));
}
