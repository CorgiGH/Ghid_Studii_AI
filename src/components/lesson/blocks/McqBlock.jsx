import React, { useRef, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'motion/react';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../../blocks/formatMarkdown';
import { useScreenGate } from '../ScreenGate';
import { useLessonStore } from '../../../lesson/useLessonStore';
import { nowMs } from '../../../lesson/clock.js';
import { restoredMcqPick } from '../../../lesson/restore.js';

const LETTERS = 'ABCDEFGH';
const Html = ({ as = 'span', className, text, id }) => (
  React.createElement(as, { id, className, dangerouslySetInnerHTML: { __html: formatMarkdown(text) } })
);

// Block JSON: { type: 'mcq', id, question, options: [{ text, correct, misconception?, explain }], review? }
// Inside a lesson the first answer is recorded and opens the screen's gate. In the review
// tab it is rendered with record={false} and reports through onAnswer instead.
export default function McqBlock({ id, question, options, record = true, onAnswer }) {
  const { t } = useApp();
  const { complete, ref } = useScreenGate();
  const store = useLessonStore();
  const reduced = !!useReducedMotion();
  // After a reload or Back the answer given earlier comes back (and counts as answered, so
  // no second attempt can reset the review schedule by accident).
  const [restored] = useState(() => (
    record && ref ? restoredMcqPick(store.attemptsAt(ref.src, ref.screen), id, options.length) : null
  ));
  const [picked, setPicked] = useState(restored);
  const answered = useRef(restored !== null);
  const qid = `mcq-${id}`;

  const pick = (i) => {
    if (answered.current) return;
    answered.current = true;
    const opt = options[i];
    setPicked(i);
    if (record && ref) {
      store.recordAttempt(id, { ok: !!opt.correct, hints: 0, kind: 'mcq', item: id, option: i, misconception: opt.misconception || null, ref, at: nowMs() });
    }
    complete();
    onAnswer?.({ ok: !!opt.correct, option: opt, index: i });
  };

  const done = picked !== null;
  const right = options.findIndex(o => o.correct);
  const shown = done ? options[picked] : null;

  return (
    <div className="ch ch-mcq" role="group" aria-labelledby={qid} data-testid="mcq-block">
      <Html as="p" id={qid} className="ch-q" text={t(question.en, question.ro)} />
      <ul className="ch-opts">
        {options.map((o, i) => {
          const state = !done ? '' : i === picked ? (o.correct ? ' is-right' : ' is-wrong') : (i === right && !shown.correct ? ' is-key' : ' is-dim');
          return (
            <li key={i}>
              <button
                type="button"
                className={`ch-opt${state}`}
                aria-disabled={done}
                aria-pressed={done ? i === picked : undefined}
                data-testid={`mcq-option-${i}`}
                data-correct={done ? String(!!o.correct) : undefined}
                onClick={() => pick(i)}
              >
                <span className="ch-mark" aria-hidden="true">{LETTERS[i]}</span>
                <Html className="ch-opt-text" text={t(o.text.en, o.text.ro)} />
                {done && (i === picked || i === right) && (
                  <span className="ch-verdict">{o.correct ? t('Correct', 'Corect') : t('Not quite', 'Nu chiar')}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div aria-live="polite">
        <AnimatePresence initial={false}>
          {done && (
            <Motion.div
              key="explain"
              className={`ch-explain ${shown.correct ? 'ok' : 'bad'}`}
              data-testid="mcq-explain"
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 30 }}
            >
              <Html as="p" text={t(shown.explain.en, shown.explain.ro)} />
              {!shown.correct && (
                <div className="ch-key">
                  <p>
                    <strong>{t('The right answer: ', 'Răspunsul corect: ')}</strong>
                    <Html text={t(options[right].text.en, options[right].text.ro)} />
                  </p>
                  <Html as="p" text={t(options[right].explain.en, options[right].explain.ro)} />
                </div>
              )}
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
