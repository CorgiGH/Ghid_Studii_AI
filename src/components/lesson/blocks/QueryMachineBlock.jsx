import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../../blocks/formatMarkdown';
import { useScreenGate } from '../ScreenGate';
import { useLessonStore } from '../../../lesson/useLessonStore';
import { nowMs } from '../../../lesson/clock.js';
import { shouldRecordAttempt } from '../../../lesson/restore.js';
import { useSqlRunner } from '../viz/useSqlRunner.js';
import { useVizMotion } from '../viz/kit.js';
import { CountUp } from '../viz/ui.jsx';
import { displayCell } from '../viz/logic/date-mask.js';
import { planStages, parseQuery, scoreCount, scoreOrder, scorePicks } from '../../../sql/machine.js';
import { allPredictionsChecked, buildSteps, chipStep, predictKind, sumChecks, viewAt } from '../../../sql/machineView.js';

const CLAUSE_LABEL = {
  from: 'FROM', join: 'JOIN', where: 'WHERE', select: 'SELECT', distinct: 'DISTINCT', order: 'ORDER BY',
  union: 'UNION', 'union-all': 'UNION ALL', intersect: 'INTERSECT', minus: 'MINUS',
};
const NEW_LINE = new Set(['from', 'join', 'where', 'order', 'union', 'union-all', 'intersect', 'minus']);

const Html = ({ as = 'span', className, text }) => (
  React.createElement(as, { className, dangerouslySetInnerHTML: { __html: formatMarkdown(text) } })
);

// SQL from the block goes into text that is rendered as HTML, so its < > & must stay text.
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Only a real NULL reads NULL; a value the engine did not give stays blank rather than looking like a NULL.
const cellText = (v) => (v === undefined ? '' : v === null ? 'NULL' : displayCell(typeof v === 'string' ? v.replace(/\s+$/, '') : v));

function Mark({ row, m }) {
  // One slot before the cells: position number, verdict, tri-state pill or the pick box.
  let body = null;
  let cls = '';
  if (row.truth) {
    cls = `t-${row.truth}`;
    body = row.truth === 'T' ? 'TRUE' : row.truth === 'F' ? 'FALSE' : 'UNKNOWN';
  } else if (row.status === 'pickable' && row.pickNo !== undefined) {
    cls = row.pickNo ? 'placed' : 'open';
    body = row.pickNo || '';
  } else if (row.status === 'pickable') {
    cls = row.picked ? 'picked' : 'open';
    body = row.picked ? '✓' : '';
  } else if (row.pos) {
    cls = 'pos';
    body = row.pos;
  }
  const own = !row.truth && row.mark !== undefined;
  if (own) cls += row.mark ? ' ok' : ' bad';
  return (
    <span className={`qm-mark ${cls}`} aria-hidden={row.truth ? undefined : 'true'}>
      <AnimatePresence initial={false} mode="popLayout">
        <Motion.span
          key={`${body}|${row.mark}`}
          initial={{ scale: m.reduced ? 1 : 0.4, opacity: m.reduced ? 1 : 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: m.reduced ? 0 : 0.08 } }}
          transition={m.bounce}
          className="qm-mark-in"
        >
          {own ? (row.mark ? '✓' : '✗') : body}
        </Motion.span>
      </AnimatePresence>
    </span>
  );
}

function Row({ row, columns, dimmed, index, m, onPick, layoutId, animateLayout, mergeOut }) {
  const pickable = row.status === 'pickable';
  const Tag = pickable ? Motion.button : Motion.div;
  const gone = row.status === 'gone';
  const fall = mergeOut
    ? { opacity: 0, x: m.reduced ? 0 : -18, scale: m.reduced ? 1 : 0.94, transition: { duration: m.reduced ? 0 : 0.26 } }
    : { opacity: 0, y: m.reduced ? 0 : 30, rotate: m.reduced ? 0 : (index % 2 ? 2.2 : -2.2), transition: { duration: m.reduced ? 0 : 0.34, ease: [0.4, 0, 1, 1] } };
  return (
    <Tag
      layout={animateLayout ? 'position' : false}
      layoutId={layoutId}
      type={pickable ? 'button' : undefined}
      aria-pressed={pickable && row.picked !== undefined ? row.picked : undefined}
      onClick={pickable ? () => onPick(row.key) : undefined}
      className={`qm-row${gone ? ' is-gone' : ''}${row.truth ? ` tri-${row.truth}` : ''}${pickable ? ' is-pickable' : ''}${row.picked ? ' is-picked' : ''}${row.pickNo ? ' is-placed' : ''}`}
      style={{ '--qm-n': columns.length }}
      initial={{ opacity: m.reduced ? 1 : 0, y: m.reduced ? 0 : -10 }}
      animate={{ opacity: gone ? 0.5 : 1, y: 0, rotate: 0, scale: 1, x: 0 }}
      exit={fall}
      transition={m.reduced ? { duration: 0 } : { ...m.soft, delay: Math.min(index, 10) * 0.025 }}
    >
      <Mark row={row} m={m} />
      {columns.map((c) => (
        <span key={c} className={`qm-cell${dimmed.includes(c) ? ' is-dim' : ''}${row.cells[c] === null ? ' nul' : ''}`}>{cellText(row.cells[c])}</span>
      ))}
      {row.truth && row.mark !== undefined && (
        <span className={`qm-mark qm-mark-end ${row.mark ? 'ok' : 'bad'}`} role="img" aria-label={row.mark ? 'correct' : 'wrong'}>{row.mark ? '✓' : '✗'}</span>
      )}
      {row.count > 1 && (
        <Motion.span
          className="qm-count"
          initial={{ scale: m.reduced ? 1 : 0.3, opacity: m.reduced ? 1 : 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={m.reduced ? { duration: 0 } : { ...m.bounce, delay: 0.22 }}
        >
          ×{row.count}
        </Motion.span>
      )}
    </Tag>
  );
}

function Head({ columns, dimmed, labels, m }) {
  return (
    <div className="qm-row qm-head" style={{ '--qm-n': columns.length }} role="presentation">
      <span className="qm-mark" />
      <AnimatePresence initial={false} mode="popLayout">
        {columns.map((c) => (
          <Motion.span
            key={c}
            layout="position"
            className={`qm-cell qm-th${dimmed.includes(c) ? ' is-dim' : ''}`}
            initial={{ opacity: m.reduced ? 1 : 0 }}
            animate={{ opacity: dimmed.includes(c) ? 0.4 : 1 }}
            exit={{ opacity: 0, transition: { duration: m.reduced ? 0 : 0.12 } }}
            transition={m.reduced ? { duration: 0 } : { duration: 0.22 }}
          >
            {labels[c] || c}
          </Motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

function Table({ rows, columns, dimmed, labels, m, onPick, mergeOut = false, layoutPrefix = null, empty }) {
  const animateLayout = !m.reduced && rows.length <= 80;
  return (
    <div className="qm-grid" role="group" style={{ '--qm-n': columns.length }}>
      <Head columns={columns} dimmed={dimmed} labels={labels} m={m} />
      <div className="qm-body">
        <AnimatePresence initial mode="popLayout">
          {rows.map((r, i) => (
            <Row
              key={r.key}
              row={r}
              index={i}
              columns={columns}
              dimmed={dimmed}
              m={m}
              onPick={onPick}
              animateLayout={animateLayout}
              mergeOut={mergeOut}
              layoutId={layoutPrefix ? `${layoutPrefix}:${r.key}` : undefined}
            />
          ))}
        </AnimatePresence>
        {rows.length === 0 && <div className="qm-empty">{empty}</div>}
      </div>
    </div>
  );
}

function SetPanels({ view, m, id }) {
  const { t } = useApp();
  const { left, right, result } = view.panels;
  const sets = (rows, moved) => rows.filter((r) => !(moved && r.moved));
  const showResult = view.phase === 'show';
  const noop = () => {};
  return (
    <div className="qm-sets">
      <div className="qm-set-pair">
        <section className="qm-set" aria-label={t('First list', 'Prima listă')}>
          <h4 className="qm-set-title">{t('First list', 'Prima listă')} <span>{view.meta.leftDistinct}</span></h4>
          <div className="qm-set-scroll"><Table rows={sets(left, showResult)} columns={view.columns} dimmed={[]} labels={view.labels} m={m} onPick={noop} layoutPrefix={`${id}-set`} empty={t('Nothing left here', 'Nu a rămas nimic aici')} /></div>
        </section>
        <section className="qm-set" aria-label={t('Second list', 'A doua listă')}>
          <h4 className="qm-set-title">{t('Second list', 'A doua listă')} <span>{view.meta.rightDistinct}</span></h4>
          <div className="qm-set-scroll"><Table rows={sets(right, showResult)} columns={view.columns} dimmed={[]} labels={view.labels} m={m} onPick={noop} layoutPrefix={`${id}-set`} empty={t('Nothing left here', 'Nu a rămas nimic aici')} /></div>
        </section>
      </div>
      <AnimatePresence initial={false}>
        {showResult && (
          <Motion.section
            key="result"
            className="qm-set qm-set-result"
            aria-label={t('Result', 'Rezultat')}
            initial={{ opacity: m.reduced ? 1 : 0, height: m.reduced ? 'auto' : 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={m.reduced ? { duration: 0 } : m.soft}
          >
            <h4 className="qm-set-title">{t('Result', 'Rezultat')} <span>{view.meta.to}</span></h4>
            <div className="qm-set-scroll"><Table rows={result} columns={view.columns} dimmed={[]} labels={view.labels} m={m} onPick={noop} layoutPrefix={`${id}-set`} empty={t('No rows', 'Niciun rând')} /></div>
          </Motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function Meta({ view, tick }) {
  const { t } = useApp();
  const mt = view.meta;
  const parts = [];
  if (view.panels) {
    parts.push(<span key="a">{t('First list', 'Prima listă')} {mt.leftDistinct}</span>);
    parts.push(<span key="b">{t('Second list', 'A doua listă')} {mt.rightDistinct}</span>);
    if (view.phase === 'show') parts.push(<span key="c" className="qm-meta-strong">{t('Result', 'Rezultat')} <CountUp key={`r${tick}`} from={mt.leftDistinct} to={mt.to} /></span>);
  } else if (view.ask) {
    parts.push(<span key="n">{mt.count} {view.clause === 'join' ? t('pairs', 'perechi') : t('rows', 'rânduri')}</span>);
  } else if (view.clause === 'join' && mt.tables && mt.product && mt.tables.length === 2) {
    parts.push(<span key="p">{mt.tables.map((x) => x.count).join(' × ')} = {mt.product} {t('pairs', 'perechi')}</span>);
    parts.push(<span key="r" className="qm-meta-strong"><CountUp key={`j${tick}`} from={mt.product} to={mt.to} duration={0.7} /> {t('rows', 'rânduri')}</span>);
  } else if (view.clause === 'from' && mt.tables && mt.tables.length === 2 && mt.tables[1].kind === 'inner') {
    parts.push(<span key="a">{mt.tables[0].name}: {mt.tables[0].count} {t('rows', 'rânduri')}</span>);
    parts.push(<span key="b">{mt.tables[1].name}: {mt.tables[1].count} {t('rows', 'rânduri')}</span>);
  } else if (mt.from !== undefined && mt.from !== mt.to) {
    parts.push(<span key="n" className="qm-meta-strong"><CountUp key={`c${tick}`} from={mt.from} to={mt.to} duration={0.7} /> {t('rows', 'rânduri')}</span>);
  } else {
    parts.push(<span key="n">{mt.to} {t('rows', 'rânduri')}</span>);
  }
  return <div className="qm-meta" aria-live="polite">{parts}</div>;
}

function Sql({ segments, active }) {
  return (
    <pre className="qm-sql" aria-label="SQL">
      {segments.map((s, i) => {
        const nl = i > 0 && NEW_LINE.has(s.clause);
        const on = s.clause === active;
        return (
          <React.Fragment key={i}>
            {nl && '\n'}
            <span className={`qm-seg${on ? ' on' : ''}`}>{nl ? s.text.replace(/^\s+/, '') : s.text}</span>
          </React.Fragment>
        );
      })}
    </pre>
  );
}

// Rendered where the animation cannot run (no engine, or the block's query fails): the screen must not wait on a
// prediction that cannot be asked, and no skip is recorded for what was not the learner's doing.
function ReleaseGate() {
  const { complete } = useScreenGate();
  useEffect(() => { complete(); }, [complete]);
  return null;
}

// Block JSON: { type: 'query-machine', id, dataset, sql, stages: [{ clause, predict?, tri? }], show: [column...],
//   say: { clause: { en, ro } }, ask?: { clause: { en, ro } } }
export default function QueryMachineBlock({ id, dataset = 'facultate', sql, stages = [], show = [], say = {}, ask = {} }) {
  const { t } = useApp();
  const m = useVizMotion();
  const runner = useSqlRunner();
  const { complete, ref } = useScreenGate();
  const store = useLessonStore();
  const [result, setResult] = useState({ key: null, plan: null, error: null });
  const [step, setStep] = useState(0);
  const [ui, setUi] = useState({});
  const [checked, setChecked] = useState({});
  const [tick, setTick] = useState(0);
  const recorded = useRef(null);

  const stagesKey = JSON.stringify(stages);
  const showKey = JSON.stringify(show);
  const segments = useMemo(() => {
    try { return parseQuery(sql).segments; } catch { return [{ clause: 'select', part: 0, text: sql }]; }
  }, [sql]);

  const key = `${dataset}|${sql}|${stagesKey}|${showKey}`;
  useEffect(() => {
    if (runner.status !== 'ready') return undefined;
    let live = true;
    planStages(sql, JSON.parse(stagesKey), runner, { dataset, show: JSON.parse(showKey) })
      .then((plan) => { if (live) setResult({ key, plan, error: null }); })
      .catch((e) => { if (live) setResult({ key, plan: null, error: e }); });
    return () => { live = false; };
  }, [runner, sql, dataset, stagesKey, showKey, key]);
  // Derived, not stored: the engine being absent or the plan not yet there needs no state of its own.
  const state = runner.status === 'unavailable'
    ? { status: 'unavailable', plan: null, error: null }
    : result.key !== key
      ? { status: 'loading', plan: null, error: null }
      : result.error ? { status: 'error', plan: null, error: result.error } : { status: 'ready', plan: result.plan, error: null };

  const plan = state.plan;
  // The planned stages carry the block's own flags (predict, tri) for the view code.
  const flags = useMemo(() => JSON.parse(stagesKey).map((x) => !!x.predict), [stagesKey]);
  const planned = useMemo(() => (plan ? plan.map((p, i) => ({ ...p, predict: flags[i] })) : null), [plan, flags]);
  const steps = useMemo(() => (planned ? buildSteps(planned) : []), [planned]);
  const cur = steps[Math.min(step, Math.max(0, steps.length - 1))];
  const view = useMemo(() => (planned && cur ? viewAt(planned, steps, Math.min(step, steps.length - 1), ui, checked) : null), [planned, steps, step, ui, checked, cur]);

  const stageIdx = cur ? cur.stage : 0;
  const stage = planned ? planned[stageIdx] : null;
  const atAsk = !!view?.ask;
  const answered = !!checked[stageIdx];

  const go = useCallback((n) => { setTick((x) => x + 1); setStep(n); }, []);

  const setAnswer = (patch) => setUi((u) => ({ ...u, [stageIdx]: { ...(u[stageIdx] || {}), ...patch } }));
  const togglePick = (key) => {
    if (answered) return;
    if (view.ask.kind === 'rows') {
      const have = new Set(ui[stageIdx]?.picks || []);
      if (have.has(key)) have.delete(key); else have.add(key);
      setAnswer({ picks: [...have] });
    } else if (view.ask.kind === 'order') {
      const placed = ui[stageIdx]?.placed || [];
      setAnswer({ placed: placed.includes(key) ? placed.filter((k) => k !== key) : [...placed, key] });
    }
  };

  // The gate opens and the attempt is recorded once every predicted stage has been checked.
  const recordOnce = (summary) => {
    const restored = store.attemptsAt && ref ? store.attemptsAt(ref.src, ref.screen).some((a) => a && a.item === id && a.kind === 'predict') : false;
    if (recorded.current || !shouldRecordAttempt({ ref, restored })) return;
    recorded.current = true;
    // A prediction is a warm-up, not a graded answer: it opens the gate and never joins the review pile.
    store.recordAttempt(id, { ok: true, hints: 0, kind: 'predict', item: id, ref, at: nowMs(), ...summary });
  };

  const check = () => {
    if (!stage || !atAsk || answered) return;
    const kind = view.ask.kind;
    const a = ui[stageIdx] || {};
    let summary;
    if (kind === 'rows') { const r = scorePicks(stage, a.picks || []); summary = { correct: r.correct, total: r.total }; }
    else if (kind === 'order') { const r = scoreOrder(stage, a.placed || []); summary = { correct: r.correct, total: r.total }; }
    else { const r = scoreCount(stage, a.value ?? ''); summary = { correct: r.ok ? 1 : 0, total: 1 }; }
    const nextChecked = { ...checked, [stageIdx]: summary };
    setChecked(nextChecked);
    const predicted = stages.map((x) => !!x.predict);
    if (allPredictionsChecked(predicted, nextChecked)) {
      recordOnce(sumChecks(predicted, nextChecked));
      complete();
    }
    go(step + 1);
  };

  const last = steps.length > 0 && step >= steps.length - 1;
  const primaryIsCheck = atAsk && !answered;
  const canCheck = atAsk && !answered && (view.ask.kind !== 'count' || String(ui[stageIdx]?.value ?? '').trim() !== '');
  const reset = () => { setUi({}); setChecked({}); go(0); };

  const text = (() => {
    if (!cur || !stage) return null;
    const c = stage.clause;
    if (atAsk) {
      const authored = ask[c];
      if (authored) return t(authored.en, authored.ro);
      if (c === 'join' && stage.test !== undefined) {
        const cond = `\`${escapeHtml(stage.test)}\``;
        return stage.given.length
          ? t(`These pairs already meet the equalities in ON. Which ones also pass ${cond}? Click them, then check.`, `Perechile de mai jos respectă deja egalitățile din ON. Care trec și de ${cond}? Apasă pe ele, apoi verifică.`)
          : t(`Here is every combination of rows. Which ones pass ${cond}? Click them, then check.`, `Mai jos sunt toate combinațiile de rânduri. Care trec de ${cond}? Apasă pe ele, apoi verifică.`);
      }
      if (view.ask.kind === 'rows') return t('Which rows will WHERE keep? Click the ones you think stay, then check.', 'Ce rânduri păstrează WHERE? Apasă pe cele care crezi că rămân, apoi verifică.');
      if (view.ask.kind === 'order') return t('Click the rows in the order they will come out, then check.', 'Apasă rândurile în ordinea în care vor ieși, apoi verifică.');
      return t('How many rows are left after DISTINCT? Type a number, then check.', 'Câte rânduri rămân după DISTINCT? Scrie un număr, apoi verifică.');
    }
    if (cur.phase === 'lists' && !say[`${c}:lists`]) return t('Two lists, one from each query. Press Combine to merge them.', 'Două liste, câte una din fiecare interogare. Apasă Combină ca să le combini.');
    const s = say[c];
    return s ? t(s.en, s.ro) : null;
  })();

  const verdict = (() => {
    if (!stage || !answered || !view) return null;
    const c = checked[stageIdx];
    const kind = predictKind(stage.clause);
    if (kind === 'count') return { ok: c.correct === 1, text: c.correct === 1 ? t(`Right: ${stage.rows.length} rows.`, `Corect: ${stage.rows.length} rânduri.`) : t(`Not quite: ${stage.rows.length} rows.`, `Nu chiar: ${stage.rows.length} rânduri.`) };
    if (kind === 'order') return { ok: c.correct === c.total, text: t(`${c.correct} of ${c.total} places right.`, `${c.correct} din ${c.total} locuri corecte.`) };
    return { ok: c.correct === c.total, text: t(`${c.correct} of ${c.total} right.`, `${c.correct} din ${c.total} corecte.`) };
  })();

  if (state.status === 'unavailable') {
    return (
      <figure className="qm" data-testid="query-machine">
        <Sql segments={segments} active={null} />
        <ReleaseGate />
        <p className="qm-note">{t('The SQL engine is not available in this browser right now, so the animation cannot run.', 'Motorul SQL nu este disponibil acum în acest browser, deci animația nu poate rula.')}</p>
      </figure>
    );
  }
  if (state.status === 'error') {
    return (
      <figure className="qm" data-testid="query-machine">
        <Sql segments={segments} active={null} />
        <ReleaseGate />
        <p className="qm-note">{t('This query could not be run here', 'Interogarea nu a putut fi rulată aici')}{String(state.error?.code).startsWith('ORA-') ? ` (${state.error.code})` : ''}.</p>
      </figure>
    );
  }
  if (state.status === 'loading' || !view) {
    return (
      <figure className="qm" data-testid="query-machine" aria-busy="true">
        <Sql segments={segments} active={null} />
        <div className="skeleton-shimmer viz-skeleton" />
      </figure>
    );
  }

  const reachedStage = Math.max(...steps.map((s, i) => (i <= step ? s.stage : -1)));
  return (
    <figure className="qm" data-testid="query-machine" aria-label={t('Step-by-step view of the query', 'Interogarea pas cu pas')}>
      <Sql segments={segments} active={stage.clause} />
      <div className="qm-chips" role="group" aria-label={t('Clauses', 'Clauze')}>
        {planned.map((s, i) => (
          <button
            key={s.clause}
            type="button"
            className={`qm-chip${i === stageIdx ? ' cur' : ''}${i < stageIdx ? ' past' : ''}`}
            aria-current={i === stageIdx ? 'step' : undefined}
            disabled={i > reachedStage}
            onClick={() => go(chipStep(steps, i, checked))}
          >
            {CLAUSE_LABEL[s.clause]}
          </button>
        ))}
      </div>

      <Meta view={view} tick={tick} />
      <div className={`qm-scroll${view.panels ? ' qm-scroll-free' : ''}`} data-testid="qm-rows">
        {view.panels
          ? <SetPanels view={view} m={m} id={id} />
          : (
            <Table
              rows={view.rows}
              columns={view.columns}
              dimmed={view.dimmed}
              labels={view.labels}
              m={m}
              onPick={togglePick}
              mergeOut={view.clause === 'distinct'}
              empty={t('No rows', 'Niciun rând')}
            />
          )}
      </div>

      {atAsk && view.ask.kind === 'count' && !answered && (
        <form className="qm-count-form" onSubmit={(e) => { e.preventDefault(); if (canCheck) check(); }}>
          <label htmlFor={`qm-${id}-n`}>{t('How many rows are left?', 'Câte rânduri rămân?')}</label>
          <input
            id={`qm-${id}-n`}
            aria-label={t('How many rows are left?', 'Câte rânduri rămân?')}
            className="qm-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={ui[stageIdx]?.value ?? ''}
            onChange={(e) => setAnswer({ value: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) })}
          />
        </form>
      )}
      {atAsk && view.ask.kind === 'order' && !answered && (
        <div className="qm-tools">
          <span>{t(`${(ui[stageIdx]?.placed || []).length} of ${view.rows.length} placed`, `${(ui[stageIdx]?.placed || []).length} din ${view.rows.length} așezate`)}</span>
          <button type="button" className="viz-link" onClick={() => setAnswer({ placed: [] })} disabled={!(ui[stageIdx]?.placed || []).length}>{t('Start over', 'De la capăt')}</button>
        </div>
      )}
      {atAsk && view.ask.kind === 'rows' && !answered && (
        <div className="qm-tools"><span>{t(`${(ui[stageIdx]?.picks || []).length} of ${view.rows.length} picked`, `${(ui[stageIdx]?.picks || []).length} din ${view.rows.length} alese`)}</span></div>
      )}

      <div className="qm-say" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait" initial={false}>
          <Motion.div
            key={`${step}`}
            initial={{ opacity: m.reduced ? 1 : 0, y: m.reduced ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: m.reduced ? 1 : 0 }}
            transition={m.reduced ? { duration: 0 } : { duration: 0.18 }}
          >
            {!atAsk && verdict && <p className={`qm-verdict ${verdict.ok ? 'ok' : 'bad'}`}>{verdict.text}</p>}
            {text && <Html as="p" className="qm-say-text" text={text} />}
          </Motion.div>
        </AnimatePresence>
      </div>

      <div className="viz-controls qm-controls">
        <button type="button" className="viz-btn" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0} aria-label={t('Previous step', 'Pasul anterior')}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span className="viz-count">{step + 1} / {steps.length}</span>
        {last && !primaryIsCheck ? (
          <button type="button" className="viz-btn" onClick={reset}>{t('Again', 'Din nou')}</button>
        ) : (
          <button
            type="button"
            className="viz-btn viz-btn-primary"
            onClick={primaryIsCheck ? check : () => go(step + 1)}
            disabled={primaryIsCheck && !canCheck}
          >
            <span>{primaryIsCheck ? t('Check', 'Verifică') : (cur.phase === 'lists' ? t('Combine', 'Combină') : t('Next', 'Mai departe'))}</span>
            {!primaryIsCheck && <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </button>
        )}
      </div>
    </figure>
  );
}
