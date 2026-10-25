import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../../blocks/formatMarkdown';
import { useScreenGate } from '../ScreenGate';
import { useLessonStore } from '../../../lesson/useLessonStore';
import { nowMs } from '../../../lesson/clock.js';
import { dueLabel, isPracticeOnly } from '../../../lesson/review.js';
import { checkResult, runWithProbe } from '../../../sql/check.js';
import { detectMistake } from '../../../sql/mistakes.js';
import SqlEditor from '../SqlEditor.jsx';
import SchemaPanel from '../SchemaPanel.jsx';
import DataPanel from '../DataPanel.jsx';
import { useSqlClient } from './useSqlClient.js';
import {
  HINT_COUNT, attemptAction, attemptWrite, canGrade, checkSpecOf, datasetFor, hiddenNote, hintMarker, paperChecklist, restoreSqlState, revealFields,
  runOptions, slimVerdict, usesDatasetTables, verdictView,
} from './sqlExerciseSpec.js';
import { loadExpected } from './loadExpected.js';
import { ExpectedTables, LiveStatus, Outcome, VerdictPanel } from './SqlOutcome.jsx';

const Html = ({ as = 'span', className, text, testid }) => (
  React.createElement(as, { className, 'data-testid': testid, dangerouslySetInnerHTML: { __html: formatMarkdown(text) } })
);

const officialText = (o, t) => {
  if (!o) return null;
  const inline = typeof o.ex === 'string' ? /^inline-(\d+)$/.exec(o.ex) : null;
  return inline
    ? t(`Lab ${o.lab}, example ${inline[1]}`, `Laborator ${o.lab}, exemplul ${inline[1]}`)
    : t(`Lab ${o.lab}, exercise ${o.ex}`, `Laborator ${o.lab}, exercițiul ${o.ex}`);
};

// Block JSON: see sqlExerciseSpec.js. Inside a lesson the first run (or the solution being shown) opens the screen's gate and
// the first run of an edited query is recorded (a run of the unedited starter only shows its result). In the review tab
// (?variant=hidden) the query is graded on the hidden dataset and the answer goes to store.markReview instead. In paper mode (the
// engine did not load) the gate opens when the self-check is saved.
export default function SqlExerciseBlock(block) {
  const { id, prompt, official, starter, solution, hints: hintTexts, explain } = block;
  const { t } = useApp();
  const { complete, ref } = useScreenGate();
  const store = useLessonStore();
  const [params] = useSearchParams();
  const hidden = params.get('variant') === 'hidden';
  const dataset = datasetFor(block, hidden);
  const spec = useMemo(() => checkSpecOf(block), [block]);
  const { client, status, reload } = useSqlClient();

  // After a reload or Back the last query, verdict and hints come back, and no second attempt is recorded by accident.
  const [restored] = useState(() => (!hidden && ref ? restoreSqlState(store.attemptsAt(ref.src, ref.screen), id) : null));
  const [text, setText] = useState(restored?.sql || starter || '');
  const [hints, setHints] = useState(restored?.hints ?? 0);
  const [revealed, setRevealed] = useState(restored?.revealed ?? false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState(null); // { result, snapshot, verdict, mistake, expected } of the latest run
  const [note, setNote] = useState(null);
  const [version, setVersion] = useState(0);
  // A paper hand-in made before a reload comes back submitted (and settled, when the check was saved); its expected tables load below.
  const [paper, setPaper] = useState({ submitted: restored?.paper === true, expected: null, ticks: {}, done: restored?.paperDone === true });
  const paperOwned = useRef(restored?.paper === true); // the stored attempt was made by a paper hand-in
  const [reviewNote, setReviewNote] = useState(null); // review variant: the schedule line after an answer that was only practice
  const actionsRef = useRef(null);
  const checklistRef = useRef(null);

  const textRef = useRef(text);
  const hintsRef = useRef(hints);
  const busyRef = useRef(false);
  const attempted = useRef(restored !== null); // an attempt of this block is in the store
  const unscored = useRef(restored?.unscored === true); // that attempt has no verdict yet (the first graded run replaces it)
  const marked = useRef(false); // hidden variant: the review answer was given
  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { hintsRef.current = hints; }, [hints]);

  const paperMode = status === 'failed';
  const record = !hidden && !!ref;

  // Start the engine as the screen opens (a dataset switch reboots the worker, so only this block's dataset is asked for). A screen
  // that opens while the engine is in the failed state tries it once more (a slow connection may have caught up).
  const retried = useRef(false);
  useEffect(() => {
    if (!client) return;
    if (status !== 'failed') client.reset({ dataset }).catch(() => {});
    else if (!retried.current) {
      retried.current = true;
      client.retry().then((s) => { if (s === 'ready') client.reset({ dataset }).catch(() => {}); });
    }
  }, [client, dataset]); // eslint-disable-line react-hooks/exhaustive-deps
  const retryEngine = () => {
    if (!client) { reload(); return; }
    client.retry().then((s) => { if (s === 'ready') client.reset({ dataset }).catch(() => {}); });
  };

  const persist = useCallback((patch) => {
    if (record && attempted.current) store.updateLastAttempt(id, patch);
  }, [record, store, id]);

  // Carries out what attemptAction decided (the rule and the written fields live in sqlExerciseSpec.js and are tested there).
  // `fields` go into a new record (and into an update only when the action keeps the run); `extra` goes into either.
  const apply = useCallback((action, fields = {}, extra = {}) => {
    if (action.owns) paperOwned.current = true;
    if (action.type === 'markReview') {
      marked.current = true;
      const at = nowMs();
      const before = store.pendingReview(at).find((i) => i.itemId === id);
      const practice = action.ok && isPracticeOnly(before, at);
      store.markReview(id, action.ok, at);
      setReviewNote(practice ? { due: before.due, at } : null);
      return;
    }
    const w = attemptWrite(action, { item: id, ref, at: nowMs(), hints: hintsRef.current, fields, extra });
    if (!w) return;
    if (w.method === 'recordAttempt') {
      attempted.current = true;
      unscored.current = w.data.unscored === true;
      store.recordAttempt(id, w.data);
    } else {
      if (w.data.unscored === false) unscored.current = false;
      store.updateLastAttempt(id, w.data);
    }
  }, [store, id, ref]);

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
      let before = null;
      if (block.kind === 'state') {
        // the tables as they were, so the result can point at the rows the script added or changed
        try { before = await client.snapshot({ dataset, tables: block.check.tables }); } catch { before = null; }
        result = await client.run(sql, opts);
        snapshot = await client.snapshot({ dataset, tables: block.check.tables });
      } else {
        result = await runWithProbe(client, sql, opts);
      }
      const actual = block.kind === 'state' ? snapshot : result;
      let verdict = null;
      let mistake = null;
      if (canGrade(expected, actual, spec)) {
        try {
          verdict = checkResult(actual, expected, spec);
          mistake = verdict.ok || !expected ? null : detectMistake({ sql, actual: block.kind === 'state' ? null : result, expected, spec });
        } catch (e) {
          setNote(t(`This answer could not be graded (${e.message}).`, `Răspunsul nu a putut fi evaluat (${e.message}).`));
        }
      } else {
        setNote(t('The expected answer could not be loaded, so the result is shown without a verdict.', 'Răspunsul cerut nu a putut fi încărcat, deci rezultatul apare fără verdict.'));
      }
      setOutcome({ result, snapshot, verdict, mistake, expected, before });
      setVersion((v) => v + 1);
      if (silent) return;
      complete();
      // The first run is the attempt. A run that ended in an ORA error or a not-Oracle verdict counts as a failed one, so it reaches
      // the review pile and survives a reload. A run with no verdict at all (expected file missing, grader threw) is stored as an
      // unscored done marker: it keeps the screen unlocked after a reload and does not enqueue a review item.
      const action = attemptAction({
        hidden, record, attempted: attempted.current, attemptUnscored: unscored.current, marked: marked.current, verdict, silent, event: 'run',
        edited: sql.trim() !== (starter ?? '').trim(),
      });
      apply(action, { sql, verdict: verdict ? slimVerdict(verdict) : null, mistake, misconception: mistake, ran: true });
    } catch (e) {
      if (e?.code === 'CANCELLED') return;
      if (e?.code === 'ENGINE_UNAVAILABLE') return; // the status listener switches the block to paper mode
      setOutcome(null);
      setNote(e?.code === 'TIMEOUT'
        ? t('The query ran for over a minute and was stopped. Check for a join without a condition.', 'Interogarea a rulat peste un minut și a fost oprită. Verifică dacă ai o joncțiune fără condiție.')
        : t(`The query could not be run (${e?.message ?? e}).`, `Interogarea nu a putut fi rulată (${e?.message ?? e}).`));
      if (!silent) {
        complete();
        apply(attemptAction({ hidden, record, attempted: attempted.current, marked: marked.current, silent, event: 'fault', edited: sql.trim() !== (starter ?? '').trim() }),
          { sql, verdict: null, ran: false });
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [client, block, hidden, id, dataset, spec, record, apply, complete, t, starter]);

  // A restored block runs its stored query once more (nothing is recorded) so the result table is back next to the verdict.
  const reran = useRef(false);
  useEffect(() => {
    if (!restored?.ran || !client || reran.current || paperMode) return;
    reran.current = true;
    execute({ silent: true });
  }, [client, restored, paperMode, execute]);

  // The third hint puts the exercise in the review pile: before any attempt as a hint-only marker (it keeps the gate shut, and the
  // first graded run replaces it), after one by enqueueing the item (an entry already there keeps its schedule).
  const openHint = () => {
    const n = Math.min(HINT_COUNT, hints + 1);
    setHints(n);
    hintsRef.current = n;
    if (record && n >= HINT_COUNT && !attempted.current) {
      attempted.current = true;
      unscored.current = true;
      store.recordAttempt(id, hintMarker({ item: id, ref, at: nowMs() }));
      return;
    }
    persist({ hints: n });
    if (record && n >= HINT_COUNT) store.enqueueReview(id, { ref, kind: 'sql', at: nowMs() });
  };

  // Keeps Run clear of the sticky footer while the learner types.
  const showActions = () => actionsRef.current?.scrollIntoView({ block: 'nearest' });

  const showSolution = () => {
    if (revealed) return;
    setRevealed(true);
    complete();
    apply(attemptAction({ hidden, record, attempted: attempted.current, attemptUnscored: unscored.current, marked: marked.current, event: 'reveal' }),
      revealFields(attempted.current && !unscored.current, textRef.current));
  };

  // Paper mode: the engine is not available, so the learner works on paper and hands in to compare with the expected answer.
  // "Predă" shows the expected answer and the self-check; the gate opens when the check is saved (every point ticked = right).
  // With nothing to tick (the expected answer could not be loaded) the hand-in settles at once as an unscored, done attempt.
  const submitPaper = async () => {
    let expected = null;
    try { expected = await loadExpected(id, dataset); } catch { expected = null; }
    const empty = paperChecklist(block, expected).length === 0;
    setPaper((p) => ({ ...p, submitted: true, expected, done: empty }));
    apply(attemptAction({ hidden, record, attempted: attempted.current, attemptUnscored: unscored.current, marked: marked.current, event: 'paper-submit', revealed, paperEmpty: empty }),
      { verdict: null, paper: true, ran: false, ...(empty ? { paperDone: true } : {}) });
    if (empty) complete();
  };
  // the self-check appears below the fold: bring it (and its Save button) into view
  useEffect(() => {
    if (!paper.submitted || paper.done || restored?.paper) return;
    const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    checklistRef.current?.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' });
  }, [paper.submitted, paper.done, paper.expected, restored]);

  // Restored hand-in: bring the expected tables back, with the points that were ticked when the check was saved.
  const paperLoaded = useRef(false);
  useEffect(() => {
    if (!paperMode || !restored?.paper || paperLoaded.current) return;
    paperLoaded.current = true;
    (async () => {
      let expected = null;
      try { expected = await loadExpected(id, dataset); } catch { expected = null; }
      const items = paperChecklist(block, expected);
      const saved = restored.ticks
        ? Object.fromEntries(restored.ticks.filter((i) => i < items.length).map((i) => [i, true]))
        : (restored.paperDone && restored.ok ? Object.fromEntries(items.map((_, i) => [i, true])) : null);
      setPaper((p) => ({ ...p, expected, ticks: saved ?? p.ticks }));
    })();
  }, [paperMode, restored, id, dataset, block]);

  const checklist = useMemo(() => (paper.submitted ? paperChecklist(block, paper.expected) : []), [paper.submitted, paper.expected, block]);
  const paperOk = checklist.length > 0 && checklist.every((_, i) => paper.ticks[i]);
  const finishPaper = () => {
    if (paper.done) return;
    setPaper((p) => ({ ...p, done: true }));
    const ticks = checklist.map((_, i) => i).filter((i) => paper.ticks[i]);
    apply(attemptAction({ hidden, record, attempted: attempted.current, marked: marked.current, event: 'paper-done', paperOk, revealed, paperOwned: paperOwned.current }),
      { verdict: null, paper: true, ran: false, paperDone: true }, { ticks });
    complete();
  };

  const verdict = outcome ? outcome.verdict : restored?.verdict ?? null;
  const mistake = outcome ? outcome.mistake : restored?.mistake ?? null;
  const loadingEngine = !paperMode && (status === 'loading' || status === 'idle' || busy);

  // The hint ladder and the solution button, the same in both modes.
  const ladder = (
    <>
      <button type="button" className="sx-btn" data-testid="sql-hint" onClick={openHint} disabled={hints >= HINT_COUNT}>
        {hints >= HINT_COUNT ? t('No more hints', 'Niciun indiciu în plus') : t(`Hint ${hints + 1} of ${HINT_COUNT}`, `Indiciul ${hints + 1} din ${HINT_COUNT}`)}
      </button>
      <button type="button" className="sx-btn ghost" data-testid="sql-reveal" onClick={showSolution} disabled={revealed}>
        {t('Show the solution', 'Arată soluția')}
      </button>
    </>
  );

  return (
    <div className="sx" data-testid="sql-exercise" data-kind={block.kind} data-mode={paperMode ? 'paper' : 'live'}>
      {official && <p className="sx-official">{officialText(official, t)}</p>}
      <Html as="p" className="sx-prompt" text={t(prompt.en, prompt.ro)} />
      {hidden && (
        <p className="sx-hidden-note" data-testid="sql-hidden-note">{t(hiddenNote(block).en, hiddenNote(block).ro)}</p>
      )}

      {usesDatasetTables(block) && <SchemaPanel dataset={dataset} client={client} ready={status === 'ready'} version={version} />}
      {hidden && <DataPanel dataset={dataset} />}

      {paperMode ? (
        <div className="sx-paper">
          <p className="sx-muted" data-testid="sql-paper-note">
            {t('The SQL engine has not loaded yet (slow connection?). Meanwhile this exercise works on paper: write the query on a sheet, then hand it in and compare it with the expected answer.',
              'Motorul SQL nu s-a încărcat încă (conexiune lentă?). Până atunci, exercițiul se face pe hârtie: scrie interogarea pe o foaie, apoi predă și compară-o cu răspunsul cerut.')}
            {' '}
            <button type="button" className="sx-btn" data-testid="sql-engine-retry" onClick={retryEngine}>{t('Try again', 'Încearcă din nou')}</button>
          </p>
          <textarea className="sx-paper-text" readOnly value={starter ?? ''} rows={Math.min(8, Math.max(3, (starter ?? '').split('\n').length))}
            aria-label={t('Starting text (read only)', 'Text de pornire (doar citire)')} />
          <div className="sx-actions">
            {!paper.submitted && (
              <button type="button" className="sx-btn primary" data-testid="sql-submit" onClick={submitPaper}>{t('Hand in', 'Predă')}</button>
            )}
            {!paper.submitted && ladder}
          </div>
          {paper.submitted && (
            <div className="sx-paper-result" data-testid="sql-paper-result">
              {paper.expected ? <ExpectedTables block={block} expected={paper.expected} t={t} /> : <p className="sx-muted">{t('The expected answer could not be loaded.', 'Răspunsul cerut nu a putut fi încărcat.')}</p>}
              <pre className="sx-code"><code>{solution}</code></pre>
              <Html as="p" className="sx-explain" text={t(explain.en, explain.ro)} />
              {checklist.length > 0 && (
                <div className="sx-paper-check" ref={checklistRef}>
                  <p className="sx-muted">{t('Tick what your answer has right. Everything ticked counts as a correct answer.', 'Bifează ce are răspunsul tău corect. Dacă bifezi tot, răspunsul se socotește corect.')}</p>
                  <ul className="sx-checklist" data-testid="sql-checklist">
                    {checklist.map((c, i) => (
                      <li key={i}>
                        <label>
                          <input type="checkbox" checked={!!paper.ticks[i]} disabled={paper.done}
                            onChange={(e) => setPaper((p) => ({ ...p, ticks: { ...p.ticks, [i]: e.target.checked } }))} />
                          <span>{t(c.en, c.ro)}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <div className="sx-actions">
                    <button type="button" className="sx-btn primary" data-testid="sql-paper-done" onClick={finishPaper} disabled={paper.done}>
                      {paper.done ? t('Saved', 'Salvat') : t('Save my check', 'Salvează bifele')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <SqlEditor value={text} onChange={setText} onRun={execute} onFocus={showActions} label={t('SQL query', 'Interogare SQL')} />
          <div className="sx-actions" ref={actionsRef}>
            <button type="button" className="sx-btn primary" data-testid="sql-run" onClick={() => execute()} disabled={busy || !client || !text.trim()} aria-busy={busy}>
              {busy ? t('Running…', 'Se rulează…') : t('Run', 'Rulează')}
              {!busy && <kbd className="sx-kbd" aria-hidden="true">Ctrl+Enter</kbd>}
            </button>
            {ladder}
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

      <LiveStatus text={note ?? (verdict ? t(verdictView(verdict).en, verdictView(verdict).ro) : '')} />
      <div className="sx-live">
        {note && <p className="sx-note" data-testid="sql-note">{note}</p>}
        {verdict && <VerdictPanel verdict={verdict} mistake={mistake} hidden={hidden} t={t} />}
        {/* a right answer gets the explanation too: it says what the lesson's rows cannot show (a bound no row hits, a tie) */}
        {verdict?.ok && !hidden && !revealed && explain && <Html as="p" className="sx-explain" testid="sql-explain-ok" text={t(explain.en, explain.ro)} />}
        {hidden && reviewNote && (
          <p className="sx-muted" data-testid="sql-review-practice">
            {t(`It was not due yet, so this was practice and the schedule did not change. It comes back ${dueLabel(reviewNote.due, reviewNote.at, 'en')}.`,
              `Încă nu venise vremea, deci a fost doar exercițiu și programul nu s-a schimbat. Revine ${dueLabel(reviewNote.due, reviewNote.at, 'ro')}.`)}
          </p>
        )}
        {outcome && <Outcome block={block} outcome={outcome} t={t} />}
      </div>

      {revealed && !(paperMode && paper.submitted) && (
        <div className="sx-solution" data-testid="sql-solution">
          <pre className="sx-code"><code>{solution}</code></pre>
          <Html as="p" className="sx-explain" text={t(explain.en, explain.ro)} />
        </div>
      )}
    </div>
  );
}
