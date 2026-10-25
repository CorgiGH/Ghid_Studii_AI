import React, { useRef, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'motion/react';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../../blocks/formatMarkdown';
import { useScreenGate } from '../ScreenGate';
import { useLessonStore } from '../../../lesson/useLessonStore';
import { nowMs } from '../../../lesson/clock.js';
import { REFLECT_TEXT_MAX, restoredReflect, shouldRecordAttempt } from '../../../lesson/restore.js';
import QuestionTables from './QuestionTables.jsx';

// Block JSON: { type: 'reflect', id, prompt, placeholder?, answer, table?: { dataset, sql, caption? } | [{ dataset, sql, caption? }, ...] }
export default function ReflectBlock({ id, prompt, placeholder, answer, table }) {
  const { t } = useApp();
  const { complete, ref } = useScreenGate();
  const store = useLessonStore();
  const reduced = !!useReducedMotion();
  // After a reload or Back the learner's text and the revealed answer come back.
  const [restored] = useState(() => (ref ? restoredReflect(store.attemptsAt(ref.src, ref.screen), id) : null));
  const [text, setText] = useState(restored?.text || '');
  const [revealed, setRevealed] = useState(restored !== null);
  const recorded = useRef(restored !== null);

  const reveal = () => {
    setRevealed(true);
    if (shouldRecordAttempt({ ref, restored: recorded.current })) {
      recorded.current = true;
      store.recordAttempt(id, { ok: true, hints: 0, kind: 'reflect', item: id, text: text.slice(0, REFLECT_TEXT_MAX), ref, at: nowMs() });
    }
    complete();
  };

  return (
    <div className="ch ch-reflect" data-testid="reflect-block">
      <p className="ch-q" dangerouslySetInnerHTML={{ __html: formatMarkdown(t(prompt.en, prompt.ro)) }} />
      <QuestionTables table={table} />
      <textarea
        className="ch-text"
        rows={3}
        value={text}
        readOnly={revealed}
        onChange={e => setText(e.target.value)}
        placeholder={placeholder ? t(placeholder.en, placeholder.ro) : t('Write what you think', 'Scrie ce crezi')}
        aria-label={t('Your answer', 'Răspunsul tău')}
        data-testid="reflect-input"
      />
      <div aria-live="polite">
        <AnimatePresence initial={false} mode="wait">
          {revealed ? (
            <Motion.div
              key="answer"
              className="ch-explain ok"
              data-testid="reflect-answer"
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 30 }}
              dangerouslySetInnerHTML={{ __html: `<p>${formatMarkdown(t(answer.en, answer.ro))}</p>` }}
            />
          ) : (
            <Motion.div key="btn" exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.12 }}>
              <button type="button" className="ch-reveal" onClick={reveal} data-testid="reflect-reveal">
                {t('Show me', 'Arată-mi')}
              </button>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
