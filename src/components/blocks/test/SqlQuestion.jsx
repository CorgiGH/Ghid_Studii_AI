import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import SqlEditor from '../../lesson/SqlEditor.jsx';
import ResultTable from '../../lesson/ResultTable.jsx';
import SchemaPanel from '../../lesson/SchemaPanel.jsx';
import { useSqlClient } from '../../lesson/blocks/useSqlClient.js';
import { loadExpected } from '../../lesson/blocks/loadExpected.js';
import { ExpectedTables, Outcome, VerdictPanel } from '../../lesson/blocks/SqlOutcome.jsx';
import { checkSpecOf, runOptions } from '../../lesson/blocks/sqlExerciseSpec.js';
import { checkResult, runWithProbe } from '../../../sql/check.js';
import { detectMistake } from '../../../sql/mistakes.js';
import { SQL_DATASETS, scoreSqlQuestion } from './sqlScoring.js';

// A `sql` test question: one query per part (most problems have one part; `moreParts` adds the others, e.g. 7a and 7b).
//   practice mode: write, run to see the result, hand in. The query is graded on the lab data and on its altered twin and earns the
//     points only when it is right on both. After hand-in the verdict, the reference solution and the grading notes show.
//   paper mode: the box is locked (work on paper); "Predă" shows the expected table, the reference solution and the grading notes,
//     and the learner scores themself. It is also the fallback when the SQL engine cannot start.
const partsOf = (q) => [q, ...(q.moreParts ?? [])].map((p) => ({
  ...p, dataset: p.dataset ?? q.dataset, kind: p.kind ?? q.kind ?? 'query', clock: p.clock ?? q.clock,
}));

const runErrorText = (e, t) => (e?.code === 'TIMEOUT'
  ? t('The query ran for over a minute and was stopped. Check for a join without a condition.', 'Interogarea a rulat peste un minut și a fost oprită. Verifică dacă ai o joncțiune fără condiție.')
  : t(`The query could not be run (${e?.message ?? e}).`, `Interogarea nu a putut fi rulată (${e?.message ?? e}).`));

export default function SqlQuestion({ question, onAnswer, suppressFeedback = false, mode = 'practice' }) {
  const { t } = useApp();
  const { client, status } = useSqlClient();
  const parts = useMemo(() => partsOf(question), [question]);
  const base = question.dataset;
  const multi = parts.length > 1;
  const paper = mode === 'paper' || status === 'failed';

  const [texts, setTexts] = useState({});
  const [runs, setRuns] = useState({}); // part id -> { result } of the latest Run
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);
  const [graded, setGraded] = useState(null); // { score, parts: { id: [{ dataset, result, verdict, mistake, expected }] } }
  const [handedIn, setHandedIn] = useState(false);
  const [paperExpected, setPaperExpected] = useState(null); // part id -> Expected
  const [selfScore, setSelfScore] = useState(null);
  const busyRef = useRef(false);
  const textsRef = useRef(texts);
  useEffect(() => { textsRef.current = texts; }, [texts]);

  // Warm the engine as the question opens. Not tied to `status`: a status change while the hidden twin is loaded must not switch the
  // dataset back under a hand-in that is running.
  useEffect(() => {
    if (client && client.status !== 'failed' && !paper) client.reset({ dataset: base }).catch(() => {});
  }, [client, base, paper]);

  const setText = (id, v) => setTexts((s) => ({ ...s, [id]: v }));

  const runPart = useCallback(async (part) => {
    const sql = textsRef.current[part.id] ?? '';
    if (!client || busyRef.current || !sql.trim()) return;
    busyRef.current = true; setBusy(true); setNote(null);
    try {
      await client.reset({ dataset: base });
      const result = await runWithProbe(client, sql, runOptions(part));
      setRuns((s) => ({ ...s, [part.id]: { result } }));
    } catch (e) {
      if (e?.code !== 'CANCELLED' && e?.code !== 'ENGINE_UNAVAILABLE') setNote(runErrorText(e, t));
    } finally { busyRef.current = false; setBusy(false); }
  }, [client, base, t]);

  const handIn = useCallback(async () => {
    if (!client || busyRef.current) return;
    busyRef.current = true; setBusy(true); setNote(null);
    try {
      const out = {};
      const flat = [];
      for (const part of parts) {
        const sql = textsRef.current[part.id] ?? '';
        out[part.id] = [];
        for (const dataset of SQL_DATASETS(base)) {
          let entry;
          try {
            let expected = null;
            try { expected = await loadExpected(part.id, dataset); } catch { expected = null; }
            await client.reset({ dataset });
            const result = sql.trim() ? await runWithProbe(client, sql, runOptions({ ...part, dataset: base }, { hidden: dataset !== base })) : { error: { code: 'EMPTY', message: '' }, columns: [], rows: [] };
            const spec = checkSpecOf(part);
            const verdict = expected && !(result.error?.code === 'EMPTY') ? checkResult(result, expected, spec) : null;
            const mistake = verdict && !verdict.ok ? detectMistake({ sql, actual: result, expected, spec }) : null;
            entry = { dataset, result, verdict, mistake, expected };
          } catch (e) {
            if (e?.code === 'ENGINE_UNAVAILABLE') return;
            entry = { dataset, result: null, verdict: null, mistake: null, expected: null, failure: e };
          }
          out[part.id].push(entry);
          flat.push(entry.verdict);
        }
      }
      const score = scoreSqlQuestion(question.points, flat);
      setGraded({ score, parts: out });
      onAnswer?.(question.id, score, question.points, { sql: textsRef.current });
    } finally { busyRef.current = false; setBusy(false); }
  }, [client, parts, base, question, onAnswer]);

  const handInPaper = async () => {
    const found = {};
    for (const part of parts) {
      try { found[part.id] = await loadExpected(part.id, base); } catch { found[part.id] = null; }
    }
    setPaperExpected(found);
    setHandedIn(true);
  };

  const pickScore = (n) => {
    setSelfScore(n);
    onAnswer?.(question.id, n, question.points, { paper: true });
  };

  const notes = question.gradingNotes ? t(question.gradingNotes.en, question.gradingNotes.ro) : null;
  const solutions = (
    <div className="sx-solution" data-testid="sql-solution">
      {parts.map((p) => (
        <div key={p.id}>
          {multi && <p className="sx-muted"><strong>({p.label})</strong></p>}
          <pre className="sx-code"><code>{p.solution}</code></pre>
        </div>
      ))}
      {notes && <p className="sx-explain" data-testid="sql-grading-notes">{notes}</p>}
    </div>
  );

  // ---- paper mode
  if (paper) {
    return (
      <div className="sx" data-testid="sql-question" data-mode="paper">
        <SchemaPanel dataset={base} client={null} ready={false} />
        <p className="sx-muted" data-testid="sql-paper-note">
          {t('Paper mode: write the query on a sheet. When you are done, hand in to see the expected table, the reference solution and the grading notes, then score yourself.',
            'Mod hârtie: scrie interogarea pe o foaie. Când ai terminat, predă ca să vezi tabelul cerut, soluția de referință și notele de corectare, apoi notează-te singur.')}
        </p>
        {parts.map((p) => (
          <textarea key={p.id} className="sx-paper-text" disabled rows={3} value="" readOnly
            placeholder={multi ? `(${p.label}) ${t('on paper', 'pe hârtie')}` : t('on paper', 'pe hârtie')}
            aria-label={t('SQL box (locked in paper mode)', 'Cutia SQL (blocată în modul hârtie)')} />
        ))}
        {!handedIn && <button type="button" className="sx-btn primary" data-testid="sql-submit" onClick={handInPaper}>{t('Hand in', 'Predă')}</button>}
        {handedIn && (
          <div className="sx-paper-result" data-testid="sql-paper-result">
            {parts.map((p) => (paperExpected?.[p.id]
              ? <ExpectedTables key={p.id} block={p} expected={paperExpected[p.id]} t={t} />
              : <p key={p.id} className="sx-muted">{t('The expected answer could not be loaded.', 'Răspunsul cerut nu a putut fi încărcat.')}</p>))}
            {solutions}
            <div className="sx-actions" role="group" aria-label={t('Your score', 'Punctajul tău')} data-testid="sql-self-score">
              <span className="sx-muted">{t('Your score:', 'Punctajul tău:')}</span>
              {Array.from({ length: question.points + 1 }, (_, n) => (
                <button key={n} type="button" className={`sx-btn${selfScore === n ? ' primary' : ''}`} aria-pressed={selfScore === n} onClick={() => pickScore(n)}>{n}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- practice mode
  const locked = !!graded;
  const loadingEngine = status === 'loading' || status === 'idle';
  return (
    <div className="sx" data-testid="sql-question" data-mode="practice">
      <SchemaPanel dataset={base} client={client} ready={status === 'ready'} />
      {parts.map((p, idx) => {
        const run = runs[p.id];
        const entries = graded?.parts[p.id];
        // the entry to show: the first dataset the query got wrong, else the lab data
        const shown = entries ? (entries.find((e) => e.verdict && !e.verdict.ok) ?? entries.find((e) => e.verdict) ?? entries[0]) : null;
        return (
          <div key={p.id} className="sx-part" data-testid="sql-part">
            {multi && <p className="sx-prompt">{idx > 0 && p.prompt ? t(p.prompt.en, p.prompt.ro) : `(${p.label})`}</p>}
            {locked
              ? <pre className="sx-code"><code>{texts[p.id] ?? ''}</code></pre>
              : <SqlEditor value={texts[p.id] ?? ''} onChange={(v) => setText(p.id, v)} onRun={() => runPart(p)} label={multi ? `SQL (${p.label})` : t('SQL query', 'Interogare SQL')} />}
            {!locked && (
              <div className="sx-actions">
                <button type="button" className="sx-btn" data-testid="sql-run" onClick={() => runPart(p)} disabled={busy || !client || !(texts[p.id] ?? '').trim()}>
                  {t('Run', 'Rulează')}<kbd className="sx-kbd" aria-hidden="true">Ctrl+Enter</kbd>
                </button>
              </div>
            )}
            {run && !locked && (run.result.error
              ? <p className="sx-note" data-testid="sql-run-error"><code>{run.result.error.code}</code> {run.result.error.message}</p>
              : <Outcome block={p} outcome={{ result: run.result, snapshot: null, verdict: null, expected: null }} t={t} />)}
            {shown && !suppressFeedback && (
              <div aria-live="polite" data-testid="sql-graded">
                {shown.verdict
                  ? <>
                    {multi && <p className="sx-muted"><strong>({p.label})</strong></p>}
                    {shown.dataset !== base && <p className="sx-hidden-note">{t('Right on the lab data, but wrong on different rows: your query has to work on any data.', 'Corect pe datele din laborator, dar greșit pe alte rânduri: interogarea trebuie să meargă pe orice date.')}</p>}
                    <VerdictPanel verdict={shown.verdict} mistake={shown.mistake} hidden={false} t={t} />
                    {shown.result && !shown.result.error && <Outcome block={p} outcome={{ result: shown.result, snapshot: null, verdict: shown.verdict, expected: shown.expected }} t={t} />}
                  </>
                  : <p className="sx-note">{shown.failure ? runErrorText(shown.failure, t) : t('This answer could not be graded.', 'Răspunsul nu a putut fi evaluat.')}</p>}
              </div>
            )}
          </div>
        );
      })}
      {note && <p className="sx-note" data-testid="sql-note">{note}</p>}
      {!locked && (
        <div className="sx-actions">
          <button type="button" className="sx-btn primary" data-testid="sql-submit" onClick={handIn}
            disabled={busy || !client || !parts.some((p) => (texts[p.id] ?? '').trim())}>
            {busy ? t('Checking…', 'Se verifică…') : t('Hand in', 'Predă')}
          </button>
          {loadingEngine && <span className="sx-muted" aria-live="polite">{t('Starting the SQL engine…', 'Se pornește motorul SQL…')}</span>}
        </div>
      )}
      {locked && !suppressFeedback && (
        <>
          <p className="sx-verdict-head" data-testid="sql-score">{graded.score} / {question.points} {t('points', 'puncte')}</p>
          {solutions}
        </>
      )}
    </div>
  );
}
