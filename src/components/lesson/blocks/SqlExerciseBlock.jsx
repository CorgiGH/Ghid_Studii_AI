import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../../blocks/formatMarkdown';
import { useScreenGate } from '../ScreenGate';
import { useLessonStore } from '../../../lesson/useLessonStore';
import { nowMs } from '../../../lesson/clock.js';
import { checkResult, runWithProbe } from '../../../sql/check.js';
import { detectMistake } from '../../../sql/mistakes.js';
import { explainMistake, explainVerdict } from '../../../sql/explain.js';
import SqlEditor from '../SqlEditor.jsx';
import ResultTable from '../ResultTable.jsx';
import SchemaPanel from '../SchemaPanel.jsx';
import { useSqlClient } from './useSqlClient.js';
import {
  HINT_COUNT, checkSpecOf, datasetFor, expectedPath, markRows, paperChecklist, restoreSqlState, runOptions, slimVerdict, statementRows,
  verdictView,
} from './sqlExerciseSpec.js';

const Html = ({ as = 'span', className, text }) => (
  React.createElement(as, { className, dangerouslySetInnerHTML: { __html: formatMarkdown(text) } })
);

// The frozen Oracle answer of an exercise on a dataset (public/sql/expected/<id>.<dataset>.json), fetched once.
const expectedCache = new Map();
function loadExpected(id, dataset) {
  const url = `${import.meta.env.BASE_URL}${expectedPath(id, dataset)}`;
  if (!expectedCache.has(url)) {
    const p = fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${url}: ${r.status}`))));
    p.catch(() => expectedCache.delete(url));
    expectedCache.set(url, p);
  }
  return expectedCache.get(url);
}

const upperKeys = (o) => Object.fromEntries(Object.entries(o ?? {}).map(([k, v]) => [k.toUpperCase(), v]));
const COMPARE_KINDS = new Set(['rows', 'rowcount', 'order', 'columns', 'alias', 'contents']);
const officialText = (o, t) => {
  if (!o) return null;
  const inline = typeof o.ex === 'string' ? /^inline-(\d+)$/.exec(o.ex) : null;
  return inline
    ? t(`Lab ${o.lab}, example ${inline[1]}`, `Laborator ${o.lab}, exemplul ${inline[1]}`)
    : t(`Lab ${o.lab}, exercise ${o.ex}`, `Laborator ${o.lab}, exercițiul ${o.ex}`);
};

function VerdictPanel({ verdict, mistake, hidden, t }) {
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
function Outcome({ block, outcome, t }) {
  const { result, snapshot, verdict, expected } = outcome;
  const compare = !!expected && !!verdict && !verdict.ok && COMPARE_KINDS.has(verdict.kind);
  const state = block.kind === 'state';
  if (state) {
    const stmts = statementRows(result.statements);
    const tables = (block.check.tables ?? []).map((n) => n.toUpperCase());
    const snap = upperKeys(snapshot);
    const exp = upperKeys(expected);
    return (
      <div className="sx-outcome">
        <ol className="sx-stmts" data-testid="sql-statements">
          {stmts.map((s, i) => (
            <li key={i} className={s.ok ? 'ok' : 'bad'}>
              <code>{s.sql.replace(/\s+/g, ' ').slice(0, 90)}</code>
              <span className="sx-stmt-state">{s.ok ? `OK · ${t(s.noteEn, s.note)}` : `${s.code} · ${s.note}`}</span>
            </li>
          ))}
        </ol>
        {tables.map((name) => {
          const a = snap[name];
          if (!a || a.error) return <p key={name} className="sx-muted">{name}: {t('the table does not exist', 'tabelul nu există')}</p>;
          const e = exp[name];
          const mark = compare && verdict.table?.toUpperCase() === name;
          return (
            <div key={name} className={mark && e ? 'sx-compare' : undefined}>
              <ResultTable title={mark ? `${name} · ${t('yours', 'al tău')}` : name} columns={a.columns} rows={a.rows} rowCount={a.rowCount} truncated={a.truncated}
                mark={mark ? markRows(a.rows, verdict.extra) : undefined} markKind="extra" />
              {mark && e && <ResultTable title={`${name} · ${t('expected', 'cerut')}`} columns={e.columns} rows={e.rows} mark={markRows(e.rows, verdict.missing)} markKind="missing" />}
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

function ExpectedTables({ block, expected, t }) {
  if (block.kind === 'state') {
    return Object.entries(upperKeys(expected)).map(([name, e]) => (
      <ResultTable key={name} title={`${name} · ${t('expected', 'cerut')}`} columns={e.columns} rows={e.rows} />
    ));
  }
  return <ResultTable title={t('Expected result', 'Rezultatul cerut')} columns={expected.columns} rows={expected.rows} />;
}

// Block JSON: see sqlExerciseSpec.js. Inside a lesson the first run (or the solution being shown) opens the screen's gate and
// the first graded run is recorded. In the review tab (?variant=hidden) the query is graded on the hidden dataset and the answer
// goes to store.markReview instead.
export default function SqlExerciseBlock(block) {
  const { id, prompt, official, starter, solution, hints: hintTexts, explain } = block;
  const { t } = useApp();
  const { complete, ref } = useScreenGate();
  const store = useLessonStore();
  const [params] = useSearchParams();
  const hidden = params.get('variant') === 'hidden';
  const dataset = datasetFor(block, hidden);
  const spec = useMemo(() => checkSpecOf(block), [block]);
  const { client, status } = useSqlClient();

  // After a reload or Back the last query, verdict and hints come back, and no second attempt is recorded by accident.
  const [restored] = useState(() => (!hidden && ref ? restoreSqlState(store.attemptsAt(ref.src, ref.screen), id) : null));
  const [text, setText] = useState(restored?.sql ?? starter ?? '');
  const [hints, setHints] = useState(restored?.hints ?? 0);
  const [revealed, setRevealed] = useState(restored?.revealed ?? false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState(null); // { result, snapshot, verdict, mistake, expected } of the latest run
  const [note, setNote] = useState(null);
  const [version, setVersion] = useState(0);
  const [paper, setPaper] = useState({ submitted: false, expected: null, ticks: {} });

  const textRef = useRef(text);
  const hintsRef = useRef(hints);
  const busyRef = useRef(false);
  const attempted = useRef(restored !== null); // an attempt of this block is in the store
  const marked = useRef(false); // hidden variant: the review answer was given
  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { hintsRef.current = hints; }, [hints]);

  const paperMode = status === 'failed';
  const record = !hidden && !!ref;

  // Start the engine as the screen opens (a dataset switch reboots the worker, so only this block's dataset is asked for).
  useEffect(() => {
    if (client && status !== 'failed') client.reset({ dataset }).catch(() => {});
  }, [client, dataset]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback((patch) => {
    if (record && attempted.current) store.updateLastAttempt(id, patch);
  }, [record, store, id]);

  const execute = useCallback(async ({ silent = false } = {}) => {
    const sql = textRef.current;
    if (!client || busyRef.current || !sql.trim()) return;
    busyRef.current = true;
    setBusy(true);
    setNote(null);
    try {
      const opts = runOptions(block, { hidden });
      let expected = null;
      try { expected = await loadExpected(id, dataset); } catch { expected = null; }
      await client.reset({ dataset });
      let result;
      let snapshot = null;
      if (block.kind === 'state') {
        result = await client.run(sql, opts);
        snapshot = await client.snapshot({ dataset, tables: block.check.tables });
      } else {
        result = await runWithProbe(client, sql, opts);
      }
      const actual = block.kind === 'state' ? snapshot : result;
      let verdict = null;
      let mistake = null;
      if (expected) {
        try {
          verdict = checkResult(actual, expected, spec);
          mistake = verdict.ok ? null : detectMistake({ sql, actual: block.kind === 'state' ? null : result, expected, spec });
        } catch (e) {
          setNote(t(`This answer could not be graded (${e.message}).`, `Răspunsul nu a putut fi evaluat (${e.message}).`));
        }
      } else {
        setNote(t('The expected answer could not be loaded, so the result is shown without a verdict.', 'Răspunsul cerut nu a putut fi încărcat, deci rezultatul apare fără verdict.'));
      }
      setOutcome({ result, snapshot, verdict, mistake, expected });
      setVersion((v) => v + 1);
      if (silent) return;
      complete();
      const graded = !!verdict && verdict.kind !== 'error' && verdict.kind !== 'not-oracle';
      if (hidden) {
        if (graded && !marked.current) {
          marked.current = true;
          store.markReview(id, verdict.ok, nowMs());
        }
      } else if (record) {
        const slim = verdict ? slimVerdict(verdict) : null;
        if (attempted.current) {
          store.updateLastAttempt(id, { sql, verdict: slim, hints: hintsRef.current });
        } else if (graded) {
          attempted.current = true;
          store.recordAttempt(id, {
            ok: verdict.ok, hints: hintsRef.current, kind: 'sql', item: id, ref, at: nowMs(), done: true,
            sql, verdict: slim, misconception: mistake, revealed: false,
          });
        }
      }
    } catch (e) {
      if (e?.code === 'CANCELLED') return;
      if (e?.code === 'ENGINE_UNAVAILABLE') return; // the status listener switches the block to paper mode
      setOutcome(null);
      setNote(e?.code === 'TIMEOUT'
        ? t('The query ran for over a minute and was stopped. Check for a join without a condition.', 'Interogarea a rulat peste un minut și a fost oprită. Verifică dacă ai o joncțiune fără condiție.')
        : t(`The query could not be run (${e?.message ?? e}).`, `Interogarea nu a putut fi rulată (${e?.message ?? e}).`));
      if (!silent) complete();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [client, block, hidden, id, dataset, spec, record, ref, store, complete, t]);

  // A restored block runs its stored query once more (nothing is recorded) so the result table is back next to the verdict.
  const reran = useRef(false);
  useEffect(() => {
    if (!restored?.sql || !client || reran.current || paperMode) return;
    reran.current = true;
    execute({ silent: true });
  }, [client, restored, paperMode, execute]);

  const openHint = () => {
    const n = Math.min(HINT_COUNT, hints + 1);
    setHints(n);
    hintsRef.current = n;
    persist({ hints: n });
  };

  const showSolution = () => {
    if (revealed) return;
    setRevealed(true);
    complete();
    if (hidden) {
      if (!marked.current) { marked.current = true; store.markReview(id, false, nowMs()); }
    } else if (record) {
      if (attempted.current) persist({ revealed: true, hints: hintsRef.current });
      else {
        attempted.current = true;
        store.recordAttempt(id, { ok: false, hints: hintsRef.current, kind: 'sql', item: id, ref, at: nowMs(), done: true, sql: textRef.current, verdict: null, revealed: true });
      }
    }
  };

  // Paper mode: the engine is not available, so the learner works on paper and hands in to compare with the expected answer.
  const submitPaper = async () => {
    let expected = null;
    try { expected = await loadExpected(id, dataset); } catch { expected = null; }
    setPaper((p) => ({ ...p, submitted: true, expected }));
    complete();
    if (!hidden && record && !attempted.current) {
      attempted.current = true;
      store.recordAttempt(id, { ok: true, hints: hintsRef.current, kind: 'sql', item: id, ref, at: nowMs(), done: true, sql: textRef.current, verdict: null, paper: true });
    }
  };

  const verdict = outcome ? outcome.verdict : restored?.verdict ?? null;
  const mistake = outcome ? outcome.mistake : restored?.verdict?.mistake ?? null;
  const checklist = useMemo(() => (paper.submitted ? paperChecklist(block, paper.expected) : []), [paper.submitted, paper.expected, block]);
  const loadingEngine = !paperMode && (status === 'loading' || status === 'idle' || busy);

  return (
    <div className="sx" data-testid="sql-exercise" data-kind={block.kind} data-mode={paperMode ? 'paper' : 'live'}>
      {official && <p className="sx-official">{officialText(official, t)}</p>}
      <Html as="p" className="sx-prompt" text={t(prompt.en, prompt.ro)} />
      {hidden && (
        <p className="sx-hidden-note" data-testid="sql-hidden-note">
          {t('Different rows than in the lesson: your query has to work on any data.', 'Rânduri diferite față de lecție: interogarea trebuie să meargă pe orice date.')}
        </p>
      )}

      <SchemaPanel dataset={dataset} client={client} ready={status === 'ready'} version={version} />

      {paperMode ? (
        <div className="sx-paper">
          <p className="sx-muted" data-testid="sql-paper-note">
            {t('The SQL engine is not available here, so this exercise works on paper: write the query on a sheet, then hand it in and compare it with the expected answer.',
              'Motorul SQL nu este disponibil aici, deci exercițiul se face pe hârtie: scrie interogarea pe o foaie, apoi predă și compară-o cu răspunsul cerut.')}
          </p>
          <textarea className="sx-paper-text" readOnly value={starter ?? ''} rows={Math.min(8, Math.max(3, (starter ?? '').split('\n').length))}
            aria-label={t('Starting text (read only)', 'Text de pornire (doar citire)')} />
          {!paper.submitted && (
            <button type="button" className="sx-btn primary" data-testid="sql-submit" onClick={submitPaper}>{t('Hand in', 'Predă')}</button>
          )}
          {paper.submitted && (
            <div className="sx-paper-result" data-testid="sql-paper-result">
              {paper.expected ? <ExpectedTables block={block} expected={paper.expected} t={t} /> : <p className="sx-muted">{t('The expected answer could not be loaded.', 'Răspunsul cerut nu a putut fi încărcat.')}</p>}
              <pre className="sx-code"><code>{solution}</code></pre>
              <Html as="p" className="sx-explain" text={t(explain.en, explain.ro)} />
              {checklist.length > 0 && (
                <ul className="sx-checklist" data-testid="sql-checklist">
                  {checklist.map((c, i) => (
                    <li key={i}>
                      <label>
                        <input type="checkbox" checked={!!paper.ticks[i]} onChange={(e) => setPaper((p) => ({ ...p, ticks: { ...p.ticks, [i]: e.target.checked } }))} />
                        <span>{t(c.en, c.ro)}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <SqlEditor value={text} onChange={setText} onRun={execute} label={t('SQL query', 'Interogare SQL')} />
          <div className="sx-actions">
            <button type="button" className="sx-btn primary" data-testid="sql-run" onClick={() => execute()} disabled={busy || !client || !text.trim()} aria-busy={busy}>
              {busy ? t('Running…', 'Se rulează…') : t('Run', 'Rulează')}
              {!busy && <kbd className="sx-kbd" aria-hidden="true">Ctrl+Enter</kbd>}
            </button>
            <button type="button" className="sx-btn" data-testid="sql-hint" onClick={openHint} disabled={hints >= HINT_COUNT}>
              {hints >= HINT_COUNT ? t('No more hints', 'Niciun indiciu în plus') : t(`Hint ${hints + 1} of ${HINT_COUNT}`, `Indiciul ${hints + 1} din ${HINT_COUNT}`)}
            </button>
            <button type="button" className="sx-btn ghost" data-testid="sql-reveal" onClick={showSolution} disabled={revealed}>
              {t('Show the solution', 'Arată soluția')}
            </button>
            {loadingEngine && status !== 'ready' && <span className="sx-muted" aria-live="polite">{t('Starting the SQL engine…', 'Se pornește motorul SQL…')}</span>}
          </div>
        </>
      )}

      {hints > 0 && (
        <ol className="sx-hints" data-testid="sql-hints">
          {hintTexts.slice(0, hints).map((h, i) => (
            <li key={i}><Html text={t(h.en, h.ro)} /></li>
          ))}
        </ol>
      )}

      <div aria-live="polite" className="sx-live">
        {note && <p className="sx-note" data-testid="sql-note">{note}</p>}
        {verdict && <VerdictPanel verdict={verdict} mistake={mistake} hidden={hidden} t={t} />}
        {outcome && <Outcome block={block} outcome={outcome} t={t} />}
      </div>

      {revealed && !paperMode && (
        <div className="sx-solution" data-testid="sql-solution">
          <pre className="sx-code"><code>{solution}</code></pre>
          <Html as="p" className="sx-explain" text={t(explain.en, explain.ro)} />
        </div>
      )}
    </div>
  );
}
