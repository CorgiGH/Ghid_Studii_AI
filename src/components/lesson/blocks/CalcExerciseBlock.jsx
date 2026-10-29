import React, { useRef, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../../blocks/formatMarkdown';
import { useScreenGate } from '../ScreenGate';
import { useLessonStore } from '../../../lesson/useLessonStore';
import { nowMs } from '../../../lesson/clock.js';
import { norm } from '../../../ml/calc/answer.js';
import QuestionTables from './QuestionTables.jsx';
import LogCalculator from './LogCalculator.jsx';
import {
  allRight, calcAction, calcWrite, checkTexts, hintAction, restoreCalcState, solutionNote, unparsedHelp, verdictView,
} from './calcSpec.js';

const Html = ({ as = 'span', className, text, testid }) => (
  React.createElement(as, { className, 'data-testid': testid, dangerouslySetInnerHTML: { __html: formatMarkdown(text) } })
);

const TF = [{ v: 'true', en: 'True', ro: 'Adevărat' }, { v: 'false', en: 'False', ro: 'Fals' }];
const isOk = (v) => v && (v.verdict === 'right' || v.verdict === 'accepted-alt');

// Block JSON: see calcSpec.js. Inside a lesson the first check is the attempt (a wrong one puts the exercise in the review pile), a
// right answer or the solution opens the screen's gate, and a reload brings back what was typed with its verdicts and hints. In
// the review tab it is rendered with record={false} and reports its first answer through onAnswer.
export default function CalcExerciseBlock(block) {
  const { id, source, statement, table, fields, hints, solution, record = true, onAnswer } = block;
  const { t } = useApp();
  const { complete, ref } = useScreenGate();
  const store = useLessonStore();

  const [restored] = useState(() => (record && ref ? restoreCalcState(store.attemptsAt(ref.src, ref.screen), id) : null));
  const [texts, setTexts] = useState(restored?.texts || {});
  const [verdicts, setVerdicts] = useState(restored?.verdicts || {});
  const [nHints, setNHints] = useState(restored?.hints ?? 0);
  const [revealed, setRevealed] = useState(restored?.revealed ?? false);
  const [padOpen, setPadOpen] = useState(false);
  const attempted = useRef(restored !== null);
  const unscored = useRef(restored?.unscored === true);
  const marked = useRef(false);
  const hintsRef = useRef(nHints);

  const canRecord = record && !!ref;
  // three in a lesson (the validator holds it); a review variant has its own three or none
  const hintCount = Array.isArray(hints) ? hints.length : 0;
  const checked = Object.keys(verdicts).length > 0;
  const finished = allRight(block, verdicts);
  const open = fields.filter((f) => !isOk(verdicts[f.id]));
  const filled = open.every((f) => norm(texts[f.id]));

  const write = (action, nextTexts, nextVerdicts) => {
    if (action.type === 'markReview') {
      marked.current = true;
      onAnswer?.({ ok: action.ok });
      return;
    }
    const w = calcWrite(action, { item: id, ref, at: nowMs(), hints: hintsRef.current, fields: nextTexts, verdicts: nextVerdicts });
    if (!w) return;
    if (w.method === 'recordAttempt') {
      attempted.current = true;
      unscored.current = w.data.unscored === true;
      store.recordAttempt(id, w.data);
    } else {
      store.updateLastAttempt(id, w.data);
    }
  };

  const check = () => {
    if (!filled) return;
    const next = checkTexts(block, texts, verdicts);
    setVerdicts(next);
    // a value that cannot be read is not an answer yet: nothing is recorded until every typed value reads
    if (Object.values(next).some((v) => v.verdict === 'unparsed')) return;
    const ok = allRight(block, next);
    write(calcAction({ record: canRecord, attempted: attempted.current, unscored: unscored.current, marked: marked.current, event: 'check', ok }), texts, next);
    if (ok) complete();
  };

  const showHint = () => {
    const n = Math.min(hintCount, nHints + 1);
    setNHints(n);
    hintsRef.current = n;
    const a = hintAction({ record: canRecord, attempted: attempted.current, n });
    if (a.type === 'record') {
      attempted.current = true;
      unscored.current = true;
      store.recordAttempt(id, { ok: false, hints: n, kind: 'calc', item: id, ref, at: nowMs(), done: false, unscored: true });
    } else if (a.type === 'update') {
      store.updateLastAttempt(id, { hints: n });
      if (a.enqueue) store.enqueueReview(id, { ref, kind: 'calc', at: nowMs() });
    }
  };

  const showSolution = () => {
    if (revealed) return;
    setRevealed(true);
    complete();
    write(calcAction({ record: canRecord, attempted: attempted.current, unscored: unscored.current, marked: marked.current, event: 'reveal' }), texts, verdicts);
  };

  const setText = (fid, v) => setTexts((p) => ({ ...p, [fid]: v }));
  const note = solutionNote(block);

  const input = (f) => {
    const v = verdicts[f.id];
    const locked = isOk(v) || revealed;
    const iid = `${id}-${f.id}`;
    if (f.kind === 'tf') {
      return (
        <div className="ch-calc-choices" role="group" aria-labelledby={`${iid}-l`}>
          {TF.map((o) => (
            <button key={o.v} type="button" className="ch-calc-choice" aria-pressed={texts[f.id] === o.v} disabled={locked} onClick={() => setText(f.id, o.v)}>{t(o.en, o.ro)}</button>
          ))}
        </div>
      );
    }
    if (f.kind === 'choice' && f.options) {
      return (
        <div className="ch-calc-choices" role="group" aria-labelledby={`${iid}-l`}>
          {f.options.map((o) => (
            <button key={o.en} type="button" className="ch-calc-choice" aria-pressed={norm(texts[f.id]) === norm(o.en)} disabled={locked} onClick={() => setText(f.id, o.en)}>
              <Html text={t(o.en, o.ro)} />
            </button>
          ))}
        </div>
      );
    }
    if (f.kind === 'multi') {
      const chosen = (texts[f.id] || '').split(/[;,]+/).map((x) => norm(x)).filter(Boolean);
      const toggle = (o) => {
        const has = chosen.includes(norm(o.en));
        const next = f.options.filter((x) => (x.en === o.en ? !has : chosen.includes(norm(x.en)))).map((x) => x.en);
        setText(f.id, next.join(', '));
      };
      return (
        <div className="ch-calc-choices" role="group" aria-labelledby={`${iid}-l`}>
          {f.options.map((o) => (
            <button key={o.en} type="button" className="ch-calc-choice" aria-pressed={chosen.includes(norm(o.en))} disabled={locked} onClick={() => toggle(o)}>
              <Html text={t(o.en, o.ro)} />
            </button>
          ))}
        </div>
      );
    }
    return (
      <input
        id={iid}
        className={`ch-calc-in${isOk(v) ? ' is-right' : v?.verdict === 'wrong' ? ' is-wrong' : ''}`}
        type="text"
        // the full keyboard: a phone's decimal pad has no "/" (9/17) and, on iOS, no minus sign
        inputMode="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        value={texts[f.id] || ''}
        readOnly={locked}
        onChange={(e) => setText(f.id, e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } }}
        aria-labelledby={`${iid}-l`}
        data-testid={`calc-input-${f.id}`}
      />
    );
  };

  const verdictLine = (f) => {
    const v = verdicts[f.id];
    if (!v) return null;
    const view = verdictView(v);
    const help = v.verdict === 'unparsed' ? unparsedHelp(f.kind) : null;
    const extra = v.verdict === 'wrong' ? v.detector : v.verdict === 'accepted-alt' ? v.note : help;
    return (
      <div className={`ch-calc-verdict ${isOk(v) ? 'ok' : 'bad'}`} data-testid={`calc-verdict-${f.id}`} data-verdict={v.verdict}>
        <strong>{t(view.en, view.ro)}</strong>
        {extra && <Html as="span" className="ch-calc-why" text={` ${t(extra.en, extra.ro)}`} />}
      </div>
    );
  };

  return (
    <div className="ch ch-calc" data-testid="calc-exercise">
      {source && <p className="ch-calc-source">{t(source.en, source.ro)}</p>}
      <Html as="p" className="ch-q" text={t(statement.en, statement.ro)} />
      <QuestionTables table={table} />
      <div className="ch-calc-fields">
        {fields.map((f) => (
          <div className="ch-calc-field" key={f.id}>
            <label id={`${id}-${f.id}-l`} htmlFor={`${id}-${f.id}`} className="ch-calc-label"><Html text={t(f.label.en, f.label.ro)} /></label>
            {input(f)}
            <div aria-live="polite">{verdictLine(f)}</div>
          </div>
        ))}
      </div>
      <div className="ch-calc-actions">
        <button type="button" className="sx-btn primary" onClick={check} disabled={!filled || finished || revealed} data-testid="calc-check">{t('Check', 'Verifică')}</button>
        {hintCount > 0 && (
          <button type="button" className="sx-btn" onClick={showHint} disabled={nHints >= hintCount || finished || revealed} data-testid="calc-hint">
            {nHints >= hintCount ? t('No more hints', 'Niciun indiciu în plus') : t(`Hint ${nHints + 1} of ${hintCount}`, `Indiciul ${nHints + 1} din ${hintCount}`)}
          </button>
        )}
        <button type="button" className="sx-btn ghost" onClick={() => setPadOpen((o) => !o)} aria-expanded={padOpen} data-testid="calc-pad-toggle">{t('Calculator', 'Calculator')}</button>
        {(checked || (hintCount > 0 && nHints >= hintCount)) && !revealed && !finished && (
          <button type="button" className="sx-btn ghost" onClick={showSolution} data-testid="calc-reveal">{t('Show the solution', 'Arată soluția')}</button>
        )}
      </div>
      {padOpen && <LogCalculator scopeKey={ref ? `${ref.src}#${ref.screen}` : id} />}
      {nHints > 0 && (
        <ol className="ch-calc-hints" data-testid="calc-hints">
          {hints.slice(0, nHints).map((h, i) => <li key={i}><Html text={t(h.en, h.ro)} /></li>)}
        </ol>
      )}
      {(revealed || finished) && (
        <div className="ch-explain ok ch-calc-solution" data-testid="calc-solution">
          <Html as="p" text={t(solution.en, solution.ro)} />
          {note && <p className="ch-calc-note" data-testid="calc-note">{t(note.en, note.ro)}</p>}
        </div>
      )}
    </div>
  );
}
