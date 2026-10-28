import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../../blocks/formatMarkdown';
import { useScreenGate } from '../ScreenGate';
import { useLessonStore } from '../../../lesson/useLessonStore';
import { nowMs } from '../../../lesson/clock.js';
import { shouldRecordAttempt } from '../../../lesson/restore.js';
import { useVizMotion } from '../viz/kit.js';
import QuestionTables from './QuestionTables.jsx';
import McqBlock from './McqBlock.jsx';
import { canReveal, pickAttempt, pickOption, proofDone, restoredProof, reveal, revealAttempt } from './proofSpec.js';

const LETTERS = 'ABCDEFGH';
const Html = ({ as = 'span', className, text, id }) => (
  React.createElement(as, { id, className, dangerouslySetInnerHTML: { __html: formatMarkdown(text) } })
);

// One predict: the options, then (after a pick) the verdict, the explanation and the right answer when the pick was wrong.
function Predict({ predict, pick, onPick, qid }) {
  const { t } = useApp();
  const done = pick !== undefined;
  const right = predict.options.findIndex(o => o.correct);
  const shown = done ? predict.options[pick] : null;
  return (
    <div className="ch-proof-predict" role="group" aria-labelledby={qid}>
      <Html as="p" id={qid} className="ch-q" text={t(predict.question.en, predict.question.ro)} />
      <ul className="ch-opts">
        {predict.options.map((o, i) => {
          const state = !done ? '' : i === pick ? (o.correct ? ' is-right' : ' is-wrong') : (i === right && !shown.correct ? ' is-key' : ' is-dim');
          return (
            <li key={i}>
              <button
                type="button"
                className={`ch-opt${state}`}
                aria-disabled={done}
                aria-pressed={done ? i === pick : undefined}
                data-testid={`proof-option-${i}`}
                onClick={() => onPick(i)}
              >
                <span className="ch-mark" aria-hidden="true">{LETTERS[i]}</span>
                <Html className="ch-opt-text" text={t(o.text.en, o.text.ro)} />
                {done && (i === pick || i === right) && (
                  <span className="ch-verdict">{o.correct ? t('Correct', 'Corect') : t('Not quite', 'Nu chiar')}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {done && (
        <div className={`ch-explain ${shown.correct ? 'ok' : 'bad'}`} data-testid="proof-explain">
          <Html as="p" text={t(shown.explain.en, shown.explain.ro)} />
          {!shown.correct && (
            <div className="ch-key">
              <p>
                <strong>{t('The right answer: ', 'Răspunsul corect: ')}</strong>
                <Html text={t(predict.options[right].text.en, predict.options[right].text.ro)} />
              </p>
              <Html as="p" text={t(predict.options[right].explain.en, predict.options[right].explain.ro)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Block JSON: { type: 'proof-steps', id, exercise?, claim, given?, table?, steps: [{ shown, why?, predict? }], end }
// A proof split across mcq screens would hide its earlier steps, so the chain stays on one screen: the steps appear one at a
// time, and a step with a predict asks it first: the learner chooses the step, then its text and reason are shown (showing the
// text first would give the answer away). The gate opens once the last step is shown (and its predict answered).
export default function ProofStepsBlock(block) {
  const { id, claim, given, table, steps, end } = block;
  const { t } = useApp();
  const { complete, ref } = useScreenGate();
  const store = useLessonStore();
  const m = useVizMotion();
  // After a reload or Back the steps shown, the picks and their verdicts come back from the attempts stored for this screen.
  const [initial] = useState(() => restoredProof(ref ? store.attemptsAt(ref.src, ref.screen) : [], block));
  const [state, setState] = useState(initial);
  const stored = useRef(initial); // what the store already holds; a restored pick is never recorded twice

  const pick = (k, i) => {
    const next = pickOption(state, block, k, i);
    if (next === state) return;
    setState(next);
    if (!(k in stored.current.picks) && shouldRecordAttempt({ ref })) {
      stored.current = { ...stored.current, picks: { ...stored.current.picks, [k]: i } };
      const w = pickAttempt(block, k, i, ref, nowMs());
      store.recordAttempt(w.item, w.data);
    }
  };

  const next = () => {
    const after = reveal(state, block);
    if (after === state) return;
    setState(after);
    if (after.shown > stored.current.shown && shouldRecordAttempt({ ref })) {
      stored.current = { ...stored.current, shown: after.shown };
      const w = revealAttempt(block, after.shown, ref, nowMs());
      store.recordAttempt(w.item, w.data);
    }
  };

  const finished = proofDone(state, block);
  useEffect(() => { if (finished) complete(); }, [finished, complete]);

  const visible = steps.slice(0, state.shown);
  return (
    <div className="ch ch-proof" data-testid="proof-block">
      <Html as="p" className="ch-q" text={t(claim.en, claim.ro)} />
      {given && <Html as="p" className="ch-proof-given" text={t(given.en, given.ro)} />}
      <QuestionTables table={table} />
      <ol className="ch-proof-steps">
        {visible.map((s, k) => {
          const answered = k in state.picks;
          const open = !s.predict || answered;
          return (
            <Motion.li
              key={k}
              className="ch-proof-step"
              data-testid="proof-step"
              initial={k < initial.shown || m.reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={m.soft}
            >
              {s.predict && (
                <Predict predict={s.predict} pick={answered ? state.picks[k] : undefined} onPick={(i) => pick(k, i)} qid={`proof-${id}-${k}`} />
              )}
              {open && <Html as="p" className="ch-proof-shown" text={t(s.shown.en, s.shown.ro)} />}
              {open && s.why && <Html as="p" className="ch-proof-why" text={t(s.why.en, s.why.ro)} />}
            </Motion.li>
          );
        })}
      </ol>
      <div aria-live="polite">
        <AnimatePresence initial={false}>
          {canReveal(state, block) && (
            <Motion.div key="next" exit={{ opacity: m.reduced ? 1 : 0 }} transition={m.soft}>
              <button type="button" className="ch-reveal" onClick={next} data-testid="proof-next">{t('Next', 'Mai departe')}</button>
            </Motion.div>
          )}
        </AnimatePresence>
        {finished && (
          <Html as="p" className="ch-explain ok ch-proof-end" text={t(end.en, end.ro)} />
        )}
      </div>
    </div>
  );
}

// A missed prediction in the review tab (a `proof-step` from collectProofPool): the proof up to that step stays on the card (claim,
// given, table, the steps before it with their reasons), then the question in the next step's place. Nothing is recorded; the
// first answer goes to onAnswer, as for any review question.
export function ProofStepReview({ block, onAnswer }) {
  const { id, claim, given, table, before, question, options } = block;
  const { t } = useApp();
  return (
    <div className="ch ch-proof" data-testid="proof-review">
      <Html as="p" className="ch-q" text={t(claim.en, claim.ro)} />
      {given && <Html as="p" className="ch-proof-given" text={t(given.en, given.ro)} />}
      <QuestionTables table={table} />
      <ol className="ch-proof-steps">
        {before.map((s, k) => (
          <li key={k} className="ch-proof-step">
            <Html as="p" className="ch-proof-shown" text={t(s.shown.en, s.shown.ro)} />
            {s.why && <Html as="p" className="ch-proof-why" text={t(s.why.en, s.why.ro)} />}
          </li>
        ))}
        <li className="ch-proof-step">
          <McqBlock id={id} question={question} options={options} record={false} onAnswer={onAnswer} />
        </li>
      </ol>
    </div>
  );
}
