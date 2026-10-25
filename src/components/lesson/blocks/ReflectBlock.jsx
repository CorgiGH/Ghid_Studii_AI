import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'motion/react';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../../blocks/formatMarkdown';
import { useScreenGate } from '../ScreenGate';
import { useLessonStore } from '../../../lesson/useLessonStore';
import { nowMs } from '../../../lesson/clock.js';
import { REFLECT_TEXT_MAX, restoredReflect, shouldRecordAttempt } from '../../../lesson/restore.js';
import { useSqlRunner } from '../viz/useSqlRunner.js';
import { MiniTable } from '../viz/ui.jsx';
import { pickReflectTable, tableFromResult } from './reflectTable.js';

// The small result table a reflect prompt is about: the engine when it is up, else a plain fallback.
function ReflectTable({ dataset, sql }) {
  const runner = useSqlRunner();
  const [fromEngine, setFromEngine] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (runner.status !== 'ready') return undefined;
    let live = true;
    // The runner reads the engine status only once, so a run that rejects (engine failed to
    // start) or gives no table is how a late failure shows; then the fallback takes over.
    runner.run(sql, { dataset })
      .then(r => { if (!live) return; const tb = tableFromResult(r); if (tb) setFromEngine(tb); else setFailed(true); })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [runner, sql, dataset]);
  // Nothing while the engine is loading, so the table never visibly swaps; the plain fallback
  // only when the engine is not there at all or its run failed.
  const table = useMemo(
    () => pickReflectTable({ fromEngine, unavailable: runner.status === 'unavailable' || failed, sql }),
    [fromEngine, runner.status, failed, sql],
  );
  if (!table) return null;
  return <div className="viz ch-table"><MiniTable columns={table.columns} rows={table.rows} maxHeight="14rem" /></div>;
}

// Block JSON: { type: 'reflect', id, prompt, placeholder?, answer, table?: { dataset, sql } }
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
      {table && <ReflectTable dataset={table.dataset} sql={table.sql} />}
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
