import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import SqlEditor from '../../lesson/SqlEditor.jsx';
import ResultTable from '../../lesson/ResultTable.jsx';
import SchemaPanel from '../../lesson/SchemaPanel.jsx';
import { useSqlClient } from '../../lesson/blocks/useSqlClient.js';
import { loadExpected } from '../../lesson/blocks/loadExpected.js';
import { ExpectedTables, LiveStatus, Outcome, VerdictPanel } from '../../lesson/blocks/SqlOutcome.jsx';
import { runOptions, verdictView } from '../../lesson/blocks/sqlExerciseSpec.js';
import { runWithProbe } from '../../../sql/check.js';
import { scoreSqlQuestion } from './sqlScoring.js';
import { checkPartOnce, gradeParts, issueText, offersRetry, paperCheckable, partsOf } from './sqlGrading.js';
import { exclusive } from './clientLock.js';

// A `sql` test question: one query per part (most problems have one part; `moreParts` adds the others, e.g. 7a and 7b).
//   practice mode: write, run to see the result, hand in. The query is graded on the lab data and on its altered twin and earns the
//     points only when it is right on both. After hand-in the verdict, the reference solution and the grading notes show.
//   paper mode: the box is locked (work on paper); "Predă" shows the expected table, the reference solution and the grading notes,
//     and the learner scores themself. It is also the fallback when the SQL engine cannot start.
// the entry to show: the first dataset the query got wrong, else one that has no verdict, else the lab data
const shownEntry = (entries) => (entries ? (entries.find((e) => e.verdict && !e.verdict.ok) ?? entries.find((e) => !e.verdict) ?? entries[0]) : null);

const runErrorText = (e, t) => (e?.code === 'TIMEOUT'
  ? t('The query ran for over a minute and was stopped. Check for a join without a condition.', 'Interogarea a rulat peste un minut și a fost oprită. Verifică dacă ai o joncțiune fără condiție.')
  : t(`The query could not be run (${e?.message ?? e}).`, `Interogarea nu a putut fi rulată (${e?.message ?? e}).`));

export default function SqlQuestion({ question, onAnswer, suppressFeedback = false, mode = 'practice', registerFlush }) {
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
  const [issue, setIssue] = useState(null); // why the last hand-in was not graded (sqlGrading.issueText)
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
    if (client && client.status !== 'failed' && !paper) exclusive(() => client.reset({ dataset: base })).catch(() => {});
  }, [client, base, paper]);

  const setText = (id, v) => setTexts((s) => ({ ...s, [id]: v }));

  const runPart = useCallback(async (part) => {
    const sql = textsRef.current[part.id] ?? '';
    if (!client || busyRef.current || !sql.trim()) return;
    busyRef.current = true; setBusy(true); setNote(null);
    try {
      const result = await exclusive(async () => {
        await client.reset({ dataset: base });
        return runWithProbe(client, sql, runOptions(part));
      });
      setRuns((s) => ({ ...s, [part.id]: { result } }));
    } catch (e) {
      if (e?.code !== 'CANCELLED' && e?.code !== 'ENGINE_UNAVAILABLE') setNote(runErrorText(e, t));
    } finally { busyRef.current = false; setBusy(false); }
  }, [client, base, t]);

  // One try at grading (sqlGrading.gradeParts): every part on the lab data and on its hidden twin. When something keeps an entry
  // from getting a verdict the question stays open to hand in again, not locked at 0.
  const handIn = useCallback(async () => {
    if (!client || busyRef.current) return;
    busyRef.current = true; setBusy(true); setNote(null); setIssue(null);
    try {
      const done = await exclusive(() => gradeParts({ client, parts, base, texts: textsRef.current, loadExpected }));
      if (done.status === 'unavailable') return;
      if (done.status === 'ungraded') { setIssue(done.issue); return; }
      const score = scoreSqlQuestion(question.points, done.flat);
      setGraded({ score, parts: done.out });
      onAnswer?.(question.id, score, question.points, { sql: textsRef.current });
    } finally { busyRef.current = false; setBusy(false); }
  }, [client, parts, base, question, onAnswer]);

  // Paper mode after hand-in: the box unlocks so the paper answer can be typed in and checked against the expected table.
  const [paperRuns, setPaperRuns] = useState({}); // part id -> { result, verdict, mistake } | { failed }
  const unlocked = paperCheckable({ mode, status, handedIn, hasClient: !!client });
  const checkPaperPart = async (part) => {
    const sql = textsRef.current[part.id] ?? '';
    const expected = paperExpected?.[part.id];
    if (!client || busyRef.current || !sql.trim() || !expected) return;
    busyRef.current = true; setBusy(true); setNote(null);
    try {
      const checked = await exclusive(() => checkPartOnce({ client, part, base, sql, expected }));
      setPaperRuns((s) => ({ ...s, [part.id]: checked }));
    } catch (e) {
      if (e?.code !== 'CANCELLED' && e?.code !== 'ENGINE_UNAVAILABLE') setNote(runErrorText(e, t));
    } finally { busyRef.current = false; setBusy(false); }
  };

  const handInPaper = async () => {
    const found = {};
    for (const part of parts) {
      try { found[part.id] = await loadExpected(part.id, base); } catch { found[part.id] = null; }
    }
    setPaperExpected(found);
    setHandedIn(true);
  };

  // When the test's clock runs out the test asks every open question to hand in (registerFlush). Practice: the typed text is graded
  // as it stands, and what cannot be graded scores 0. Paper: the question is handed in so its expected table and solution show,
  // and the learner still has to score themself. Resolves to 'done' or 'needs-score'.
  const flushRef = useRef(null);
  flushRef.current = async () => {
    for (let i = 0; busyRef.current && i < 100; i++) await new Promise((r) => setTimeout(r, 100));
    if (paper) {
      if (!handedIn) await handInPaper();
      return selfScore === null ? 'needs-score' : 'done';
    }
    if (graded) return 'done';
    const texts0 = textsRef.current;
    let done = null;
    if (client && !busyRef.current) {
      busyRef.current = true; setBusy(true);
      try { done = await exclusive(() => gradeParts({ client, parts, base, texts: texts0, loadExpected })); } catch { done = null; } finally { busyRef.current = false; setBusy(false); }
    }
    if (done?.status === 'graded') {
      const score = scoreSqlQuestion(question.points, done.flat);
      setGraded({ score, parts: done.out });
      onAnswer?.(question.id, score, question.points, { sql: texts0 });
    } else {
      setGraded({ score: 0, parts: {} });
      onAnswer?.(question.id, 0, question.points, { sql: texts0, ungraded: true });
    }
    return 'done';
  };
  useEffect(() => (registerFlush ? registerFlush(question.id, () => flushRef.current()) : undefined), [registerFlush, question.id]);

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
        <p className="sx-muted" data-testid="sql-paper-note" data-engine={status === 'failed' ? 'failed' : 'ok'}>
          {status === 'failed'
            ? t('The SQL engine cannot run on this device, so your answer cannot be run here. Write the query on a sheet; when you hand in you see the expected table and the reference solution, and then score yourself.',
              'Motorul SQL nu poate rula pe acest dispozitiv, deci răspunsul tău nu poate fi rulat aici. Scrie interogarea pe o foaie; când predai, vezi tabelul cerut și soluția de referință, apoi te notezi singur.')
            : t('Paper mode: write the query on a sheet. When you are done, hand in and the box unlocks so you can run your answer; you also see the expected table, the reference solution and the grading notes, then score yourself.',
            'Mod hârtie: scrie interogarea pe o foaie. Când ai terminat, predă: cutia se deblochează ca să-ți poți rula răspunsul, și vezi tabelul cerut, soluția de referință și notele de corectare; apoi notează-te singur.')}
        </p>
        {parts.map((p) => (unlocked
          ? (
            <div key={p.id} className="sx-part" data-testid="sql-paper-unlocked">
              <SqlEditor value={texts[p.id] ?? ''} onChange={(v) => setText(p.id, v)} onRun={() => checkPaperPart(p)} label={multi ? `SQL (${p.label})` : t('SQL query', 'Interogare SQL')} />
              <div className="sx-actions">
                <button type="button" className="sx-btn" data-testid="sql-paper-run" onClick={() => checkPaperPart(p)} disabled={busy || !(texts[p.id] ?? '').trim() || !paperExpected?.[p.id]}>
                  {t('Run and check', 'Rulează și verifică')}<kbd className="sx-kbd" aria-hidden="true">Ctrl+Enter</kbd>
                </button>
              </div>
              {paperRuns[p.id] && (
                <div data-testid="sql-paper-verdict">
                  <LiveStatus text={t(verdictView(paperRuns[p.id].verdict).en, verdictView(paperRuns[p.id].verdict).ro)} />
                  <VerdictPanel verdict={paperRuns[p.id].verdict} mistake={paperRuns[p.id].mistake} hidden={false} t={t} />
                  {!paperRuns[p.id].result.error && <Outcome block={p} outcome={{ result: paperRuns[p.id].result, snapshot: null, verdict: paperRuns[p.id].verdict, expected: paperExpected[p.id] }} t={t} />}
                </div>
              )}
            </div>
          )
          : (
            <textarea key={p.id} className="sx-paper-text" disabled rows={3} value="" readOnly
              placeholder={multi ? `(${p.label}) ${t('on paper', 'pe hârtie')}` : t('on paper', 'pe hârtie')}
              aria-label={t('SQL box (locked in paper mode)', 'Cutia SQL (blocată în modul hârtie)')} />
          )))}
        {note && handedIn && <p className="sx-note" data-testid="sql-note">{note}</p>}
        <LiveStatus text={note && handedIn ? note : ''} />
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
  const issueCopy = issueText(issue);
  const issueMsg = issueCopy ? t(issueCopy.en, issueCopy.ro) : null;
  const headline = (e) => (!e ? '' : e.empty ? t('No answer', 'Fără răspuns') : e.verdict ? t(verdictView(e.verdict).en, verdictView(e.verdict).ro) : '');
  const liveText = note ?? issueMsg ?? (graded && !suppressFeedback ? parts.map((p) => headline(shownEntry(graded.parts[p.id]))).filter(Boolean).join('. ') : '');
  const loadingEngine = status === 'loading' || status === 'idle';
  return (
    <div className="sx" data-testid="sql-question" data-mode="practice">
      {/* static schema: describing through the shared client would reboot it onto this dataset in the middle of a hand-in */}
      <SchemaPanel dataset={base} client={null} ready={false} />
      {parts.map((p, idx) => {
        const run = runs[p.id];
        const entries = graded?.parts[p.id];
        const shown = shownEntry(entries);
        return (
          <div key={p.id} className="sx-part" data-testid="sql-part">
            {multi && <p className="sx-prompt">{idx > 0 && p.prompt ? t(p.prompt.en, p.prompt.ro) : `(${p.label})`}</p>}
            {locked
              ? ((texts[p.id] ?? '').trim() ? <pre className="sx-code"><code>{texts[p.id]}</code></pre> : null)
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
              <div data-testid="sql-graded">
                {shown.empty
                  ? <p className="sx-note" data-testid="sql-no-answer">{multi && <strong>({p.label}) </strong>}{t('No answer', 'Fără răspuns')}</p>
                  : shown.verdict
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
      {issueMsg && (
        <p className="sx-note" data-testid="sql-issue" data-issue={issue.kind}>{issueMsg}</p>
      )}
      <LiveStatus text={liveText} />
      {!locked && (
        <div className="sx-actions">
          <button type="button" className="sx-btn primary" data-testid="sql-submit" onClick={handIn}
            disabled={busy || !client}>
            {busy ? t('Checking…', 'Se verifică…') : t('Hand in', 'Predă')}
          </button>
          {offersRetry(issue) && !busy && (
            <button type="button" className="sx-btn" data-testid="sql-retry" onClick={handIn}>{t('Try again', 'Încearcă din nou')}</button>
          )}
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
