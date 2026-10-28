import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, useReducedMotion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { loadJson } from '../../content/jsonLoader';
import formatMarkdown from '../blocks/formatMarkdown';
import McqBlock from './blocks/McqBlock.jsx';
import CalcExerciseBlock from './blocks/CalcExerciseBlock.jsx';
import { ProofStepReview } from './blocks/ProofStepsBlock.jsx';
import { useLessonStore } from '../../lesson/useLessonStore';
import { nowMs } from '../../lesson/clock.js';
import { pendingReviewFor } from '../../lesson/subjectScope.js';
import {
  applyReviewAnswer, collectCalcPool, collectMcqPool, collectProofPool, dueLabel, furthestVisited, groupReview, pickCalcVariant, pickVariant,
} from '../../lesson/review.js';

function readLesson(src) {
  try { return loadJson(src); } catch { return null; }
}

// The question of a review card: a multiple-choice one, a step of a proof (with the proof before it) or a calculation exercise
// with new numbers. None records an attempt; the first answer goes to onAnswer.
export function ReviewQuestion({ block, onAnswer }) {
  if (block.type === 'calc-exercise') return <CalcExerciseBlock {...block} record={false} onAnswer={onAnswer} />;
  if (block.type === 'proof-step') return <ProofStepReview block={block} onAnswer={onAnswer} />;
  return <McqBlock id={block.id} question={block.question} table={block.table} options={block.options} record={false} onAnswer={onAnswer} />;
}

// Recapitulare: everything the learner missed and has not yet answered right three times.
export default function ReviewTab({ subject, yearSem, subjectSlug }) {
  const { t, lang } = useApp();
  const store = useLessonStore();
  const navigate = useNavigate();
  const reduced = !!useReducedMotion();
  const [active, setActive] = useState(null); // { item, variant, key, result }
  const seen = useRef({}); // itemId -> variant ids already shown

  const lessons = useMemo(
    () => subject.courses.map((c, i) => ({ src: c.src, index: i, meta: c, course: c.src ? readLesson(c.src) : null })).filter(l => l.src),
    [subject],
  );
  // A missed proof pick is an mcq item too: its question joins the multiple-choice pool, with the proof it belongs to.
  const pool = useMemo(() => {
    const loaded = lessons.filter(l => l.course);
    return [...collectMcqPool(loaded), ...collectProofPool(loaded)];
  }, [lessons]);
  const calcPool = useMemo(() => collectCalcPool(lessons.filter(l => l.course)), [lessons]);
  const bySrc = useMemo(() => Object.fromEntries(lessons.map(l => [l.src, l])), [lessons]);

  const now = nowMs();
  const groups = groupReview(pendingReviewFor(store, subject.slug, now), now);

  const lessonTitle = (src) => {
    const l = bySrc[src];
    return l ? t(l.meta.shortTitle.en, l.meta.shortTitle.ro) : src;
  };
  const originalOf = (item) => pool.find(p => p.id === item.itemId) || calcPool.find(p => p.id === item.itemId) || null;
  // The list names a proof step by its proof's claim: its own question means nothing on its own.
  const questionOf = (orig) => orig.block.claim || orig.block.question || orig.block.statement;

  const openLesson = (item, hidden) => {
    const l = bySrc[item.ref?.src];
    if (!l) return;
    const q = new URLSearchParams({ s: String(item.ref.screen) });
    if (hidden) q.set('variant', 'hidden');
    navigate(`/${yearSem}/${subjectSlug}/course_${l.index + 1}?${q}`);
  };

  const variantFor = useCallback((item) => {
    const upTo = Math.max(
      furthestVisited(lessons.map(l => l.src), src => store.hasPosition(src)),
      bySrc[item.ref?.src]?.index ?? -1,
    );
    const avoid = seen.current[item.itemId] || [];
    if (item.kind === 'calc') {
      const c = pickCalcVariant(item, calcPool, { avoid });
      if (c) seen.current[item.itemId] = [...avoid, c.variant];
      return c;
    }
    const v = pickVariant(item, pool, { avoid, upTo });
    if (v) seen.current[item.itemId] = [...avoid, v.entry.id];
    return v;
  }, [pool, calcPool, lessons, bySrc, store]);

  const start = (item) => {
    if (item.kind === 'mcq' || item.kind === 'calc') {
      const variant = variantFor(item);
      if (variant) { setActive({ item, variant, key: 0, result: null }); return; }
    }
    openLesson(item, item.kind === 'sql');
  };

  const onAnswer = (item) => ({ ok }) => {
    const result = applyReviewAnswer(store, item.itemId, ok, nowMs());
    setActive(a => (a ? { ...a, result } : a));
  };

  const another = () => setActive(a => {
    const variant = variantFor(a.item);
    return variant ? { ...a, variant, key: a.key + 1, result: null } : a;
  });

  if (active) {
    const { item, variant, key, result } = active;
    return (
      <div className="ch-review">
        <button type="button" className="ch-back" onClick={() => setActive(null)}>← {t('Back to the list', 'Înapoi la listă')}</button>
        <p className="ch-from">{lessonTitle(item.ref?.src)}</p>
        <div className="ch-card">
          <ReviewQuestion key={`${variant.entry.id}:${key}`} block={variant.block} onAnswer={onAnswer(item)} />
        </div>
        {result && (
          <Motion.div
            className={`ch-result ${result.ok ? 'ok' : 'bad'}`}
            data-testid="review-result"
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>
              {result.ok
                ? (result.practice
                  ? t(`Right. It was not due yet, so this was practice and the schedule did not change. It comes back ${dueLabel(result.due, result.at, 'en')}.`, `Corect. Încă nu venise vremea, deci a fost doar exercițiu și programul nu s-a schimbat. Revine ${dueLabel(result.due, result.at, 'ro')}.`)
                  : result.gone
                  ? t('Right, and this one is done. It leaves Review.', 'Corect, și gata cu această întrebare. Iese din Recapitulare.')
                  : t(`Right. It comes back ${dueLabel(result.due, result.at, 'en')}.`, `Corect. Revine ${dueLabel(result.due, result.at, 'ro')}.`))
                : t('Not this time. It stays in Review; try another version.', 'De data asta nu. Rămâne în Recapitulare; încearcă altă variantă.')}
            </p>
            <div className="ch-actions">
              {!result.ok && <button type="button" className="ch-reveal" data-testid="review-another" onClick={another}>{t('Another version', 'Altă variantă')}</button>}
              <button type="button" className="ch-reveal ghost" data-testid="review-list" onClick={() => setActive(null)}>{t('Back to the list', 'Înapoi la listă')}</button>
            </div>
          </Motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="ch-review" data-testid="review-tab">
      <h2 className="ch-h">{t('Review', 'Recapitulare')}</h2>
      {groups.length === 0 ? (
        <div className="ch-empty" data-testid="review-empty">
          <p>{t('Nothing to review yet. Questions you miss show up here, and come back until you get them right three times.', 'Nimic de recapitulat deocamdată. Întrebările la care greșești apar aici și revin până le nimerești de trei ori.')}</p>
        </div>
      ) : (
        <>
          <p className="ch-lead">{t('Questions you missed. Each one comes back as a fresh version until you get it right three times, on different days.', 'Întrebările la care ai greșit. Fiecare revine într-o variantă nouă până o nimerești de trei ori, în zile diferite.')}</p>
          {groups.map(g => (
            <section key={g.src} className="ch-group" data-testid="review-group">
              <h3 className="ch-gh">{lessonTitle(g.src)} <span className="ch-count">{g.items.length}</span></h3>
              <ul className="ch-list">
                {g.items.map(item => {
                  const orig = originalOf(item);
                  const text = orig
                    ? t(questionOf(orig).en, questionOf(orig).ro)
                    : (bySrc[item.ref?.src]?.course?.steps?.[item.ref.screen - 1]?.title
                      ? t(bySrc[item.ref.src].course.steps[item.ref.screen - 1].title.en, bySrc[item.ref.src].course.steps[item.ref.screen - 1].title.ro)
                      : item.itemId);
                  return (
                    <li key={item.itemId} className={`ch-item${item.isDue ? ' due' : ''}`} data-testid="review-item" data-item={item.itemId}>
                      <span className="ch-item-text" dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }} />
                      <span className="ch-due">{dueLabel(item.due, now, lang)}</span>
                      <button type="button" className="ch-reveal" onClick={() => start(item)}>
                        {item.kind === 'mcq' || item.kind === 'calc' ? t('Practise', 'Exersează') : t('Open the exercise', 'Deschide exercițiul')}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
