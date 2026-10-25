import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../../blocks/formatMarkdown';
import { useScreenGate } from '../ScreenGate';
import { useLessonStore } from '../../../lesson/useLessonStore';
import { nowMs } from '../../../lesson/clock.js';
import { checkResult, runWithProbe } from '../../../sql/check.js';
import { detectMistake } from '../../../sql/mistakes.js';
import SqlEditor from '../SqlEditor.jsx';
import SchemaPanel from '../SchemaPanel.jsx';
import DataPanel from '../DataPanel.jsx';
import { useSqlClient } from './useSqlClient.js';
import {
  HINT_COUNT, attemptAction, canGrade, checkSpecOf, datasetFor, paperChecklist, restoreSqlState, revealFields, runOptions, slimVerdict, verdictView,
} from './sqlExerciseSpec.js';
import { loadExpected } from './loadExpected.js';
import { ExpectedTables, LiveStatus, Outcome, VerdictPanel } from './SqlOutcome.jsx';

const Html = ({ as = 'span', className, text }) => (
  React.createElement(as, { className, dangerouslySetInnerHTML: { __html: formatMarkdown(text) } })
);

const officialText = (o, t) => {
  if (!o) return null;
  const inline = typeof o.ex === 'string' ? /^inline-(\d+)$/.exec(o.ex) : null;
  return inline
    ? t(`Lab ${o.lab}, example ${inline[1]}`, `Laborator ${o.lab}, exemplul ${inline[1]}`)
    : t(`Lab ${o.lab}, exercise ${o.ex}`, `Laborator ${o.lab}, exercițiul ${o.ex}`);
};

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

  // Carries out what attemptAction decided (the rule lives in sqlExerciseSpec.js and is tested there).
  const apply = useCallback((action, fields = {}) => {
    if (action.owns) paperOwned.current = true;
    if (action.type === 'markReview') {
      marked.current = true;
      store.markReview(id, action.ok, nowMs());
    } else if (action.type === 'record') {
      attempted.current = true;
      store.recordAttempt(id, {
        ok: action.ok, hints: hintsRef.current, kind: 'sql', item: id, ref, at: nowMs(), done: true, revealed: false,
        ...(action.unscored ? { unscored: true } : {}), ...fields,
      });
    } else if (action.type === 'update') {
      store.updateLastAttempt(id, { hints: hintsRef.current, ...fields, ...(action.set ?? {}) });
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
      if (block.kind === 'state') {
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
      setOutcome({ result, snapshot, verdict, mistake, expected });
      setVersion((v) => v + 1);
      if (silent) return;
      complete();
      // The first run is the attempt. A run that ended in an ORA error or a not-Oracle verdict counts as a failed one, so it reaches
      // the review pile and survives a reload. A run with no verdict at all (expected file missing, grader threw) is stored as an
      // unscored done marker: it keeps the screen unlocked after a reload and does not enqueue a review item.
      const action = attemptAction({ hidden, record, attempted: attempted.current, marked: marked.current, verdict, silent, event: 'run' });
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
        apply(attemptAction({ hidden, record, attempted: attempted.current, marked: marked.current, silent, event: 'fault' }),
          { sql, verdict: null, ran: false });
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [client, block, hidden, id, dataset, spec, record, apply, complete, t]);

  // A restored block runs its stored query once more (nothing is recorded) so the result table is back next to the verdict.
  const reran = useRef(false);
  useEffect(() => {
    if (!restored?.ran || !client || reran.current || paperMode) return;
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
    apply(attemptAction({ hidden, record, attempted: attempted.current, marked: marked.current, event: 'reveal' }),
      revealFields(attempted.current, textRef.current));
  };

  // Paper mode: the engine is not available, so the learner works on paper and hands in to compare with the expected answer.
  // The gate opens at hand-in; the self-check decides the result (every point ticked = right) when the learner confirms it.
  const submitPaper = async () => {
    let expected = null;
    try { expected = await loadExpected(id, dataset); } catch { expected = null; }
    setPaper((p) => ({ ...p, submitted: true, expected }));
    complete();
    apply(attemptAction({ hidden, record, attempted: attempted.current, marked: marked.current, event: 'paper-submit', revealed }),
      { verdict: null, paper: true, ran: false });
  };

  // Restored hand-in: bring the expected tables back (a settled check shows its points ticked when it counted as right).
  const paperLoaded = useRef(false);
  useEffect(() => {
    if (!paperMode || !restored?.paper || paperLoaded.current) return;
    paperLoaded.current = true;
    (async () => {
      let expected = null;
      try { expected = await loadExpected(id, dataset); } catch { expected = null; }
      const items = paperChecklist(block, expected);
      setPaper((p) => ({ ...p, expected, ticks: restored.ok ? Object.fromEntries(items.map((_, i) => [i, true])) : p.ticks }));
    })();
  }, [paperMode, restored, id, dataset, block]);

  const checklist = useMemo(() => (paper.submitted ? paperChecklist(block, paper.expected) : []), [paper.submitted, paper.expected, block]);
  const paperOk = checklist.length > 0 && checklist.every((_, i) => paper.ticks[i]);
  const finishPaper = () => {
    if (paper.done) return;
    setPaper((p) => ({ ...p, done: true }));
    apply(attemptAction({ hidden, record, attempted: attempted.current, marked: marked.current, event: 'paper-done', paperOk, revealed, paperOwned: paperOwned.current }),
      { verdict: null, paper: true, ran: false, paperDone: true });
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
        <p className="sx-hidden-note" data-testid="sql-hidden-note">
          {t('Different rows than in the lesson: your query has to work on any data.', 'Rânduri diferite față de lecție: interogarea trebuie să meargă pe orice date.')}
        </p>
      )}

      <SchemaPanel dataset={dataset} client={client} ready={status === 'ready'} version={version} />
      {hidden && <DataPanel dataset={dataset} />}

      {paperMode ? (
        <div className="sx-paper">
          <p className="sx-muted" data-testid="sql-paper-note">
            {t('The SQL engine is not available here, so this exercise works on paper: write the query on a sheet, then hand it in and compare it with the expected answer.',
              'Motorul SQL nu este disponibil aici, deci exercițiul se face pe hârtie: scrie interogarea pe o foaie, apoi predă și compară-o cu răspunsul cerut.')}
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
                <>
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
                </>
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
