import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { loadJson } from '../../content/jsonLoader';
import BlockRenderer from '../blocks/BlockRenderer';
import formatMarkdown from '../blocks/formatMarkdown';
import ScreenGate from './ScreenGate';
import { useLessonStore } from '../../lesson/useLessonStore';
import { canAdvance, isGatingScreen, mergeGate, nextScreen, screenFromUrl, seedGate, skipAttempt, slideVariants } from './playerLogic';

const EDITABLE = 'textarea, input, select, [contenteditable=""], [contenteditable="true"], .cm-editor, [data-lesson-editor]';
const INTERACTIVE = 'button, a, summary, [role="button"], [role="tab"]';

const Arrow = ({ dir }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d={dir < 0 ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function LessonPlayer({ src, onFinish, hasNext = false }) {
  const { t, markVisited, progress, toggleUnderstood, lectureVisible, setCourseContext } = useApp();
  const store = useLessonStore();
  const reduced = !!useReducedMotion();
  const [params, setParams] = useSearchParams();

  const data = useMemo(() => {
    try { return { course: loadJson(src), error: null }; } catch (e) { return { course: null, error: e.message }; }
  }, [src]);
  const steps = data.course?.steps || [];
  const total = steps.length;

  const rawS = params.get('s');
  const screen = rawS === null
    ? Math.min(Math.max(1, total), store.getPosition(src))
    : screenFromUrl(`?s=${rawS}`, total);
  const step = steps[screen - 1];

  const [gates, setGates] = useState({});
  const [dir, setDir] = useState(1);
  const firstRender = useRef(true);

  // The heading of a screen that has just entered takes focus once it is mounted, which
  // (AnimatePresence mode="wait") is after the previous screen has finished leaving.
  const headingRef = useCallback((el) => {
    if (el && !firstRender.current) el.focus({ preventScroll: true });
  }, []);

  // Keep ?s= in sync (replace, so Back leaves the lesson instead of walking screens).
  useEffect(() => {
    if (!total) return;
    if (rawS !== String(screen)) {
      setParams(prev => { const n = new URLSearchParams(prev); n.set('s', String(screen)); return n; }, { replace: true });
    }
  }, [rawS, screen, total, setParams]);

  // Remember position, mark visited, feed the course map resume pointer.
  useEffect(() => {
    if (!step) return;
    store.setPosition(src, screen);
    markVisited(step.id);
    try { localStorage.setItem(`lastStep:${src}`, JSON.stringify({ stepId: step.id, stepIndex: screen - 1, timestamp: Date.now() })); } catch { /* storage blocked */ }
  }, [step, screen, src, store, markVisited]);

  // Chat panel context.
  useEffect(() => {
    if (!step || !data.course) return undefined;
    setCourseContext({
      type: 'course',
      courseTitle: t(data.course.meta.title.en, data.course.meta.title.ro),
      stepTitle: t(step.title.en, step.title.ro),
      stepId: step.id,
      blocks: step.blocks,
      testMode: false,
    });
    return () => setCourseContext(null);
  }, [step, data.course, setCourseContext, t]);

  // New screen: scroll to the top (focus follows in headingRef).
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }, [screen, reduced]);

  // After a reload, a screen the learner already answered stays unlocked.
  const version = store.getVersion();
  const seeded = useMemo(
    () => (step ? seedGate(step, store.attemptsAt(src, screen)) : undefined),
    // version: re-seed whenever the store records something
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, src, screen, store, version],
  );
  const gate = gates[screen] || seeded;
  const advanceOk = step ? canAdvance(step, gate) : false;
  const gating = step ? isGatingScreen(step) : false;
  const isLast = screen === total;

  const go = useCallback((n) => {
    if (n === screen || n < 1 || n > total) return;
    setDir(n > screen ? 1 : -1);
    setParams(prev => { const p = new URLSearchParams(prev); p.set('s', String(n)); return p; }, { replace: true });
  }, [screen, total, setParams]);

  const markDone = useCallback(() => {
    if (step && !progress[step.id]?.understood) toggleUnderstood(step.id);
  }, [step, progress, toggleUnderstood]);

  const forward = useCallback(() => {
    if (!step || !advanceOk) return;
    markDone();
    if (isLast) onFinish?.(); else go(nextScreen(screen, 1, total));
  }, [step, advanceOk, markDone, isLast, onFinish, go, screen, total]);

  const back = useCallback(() => go(nextScreen(screen, -1, total)), [go, screen, total]);

  const patchGate = useCallback((idx, patch) => {
    setGates(g => mergeGate(g, idx, patch));
  }, []);

  const skip = useCallback(() => {
    if (!step) return;
    if (canAdvance(step, gate)) return;
    patchGate(screen, { skipped: true });
    store.recordAttempt(step.id, skipAttempt(step, src, screen, Date.now()));
    if (isLast) onFinish?.(); else go(nextScreen(screen, 1, total));
  }, [step, gate, screen, patchGate, store, src, isLast, onFinish, go, total]);

  // Blocks get a stable skip() that always runs the latest handler above.
  const skipRef = useRef(skip);
  useEffect(() => { skipRef.current = skip; }, [skip]);
  const onSkip = useCallback(() => skipRef.current(), []);

  // Keyboard: arrows and Enter, unless the learner is typing or on a control.
  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const el = e.target;
      if (el?.closest?.(EDITABLE)) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); back(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); forward(); return; }
      if (e.key === 'Enter' && !el?.closest?.(INTERACTIVE)) { e.preventDefault(); forward(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [back, forward]);

  const variants = useMemo(() => slideVariants(reduced), [reduced]);

  if (data.error) {
    return <div className="p-4 text-sm" style={{ color: '#ef4444' }}>{t('Failed to load lesson', 'Nu s-a putut încărca lecția')}: {data.error}</div>;
  }
  if (!step) {
    return <div className="p-4 text-sm opacity-50">{t('No content available', 'Niciun conținut disponibil')}</div>;
  }

  const pct = (screen / total) * 100;
  const title = t(step.title.en, step.title.ro);

  return (
    <div className="lp-root" data-testid="lesson-player">
      <div className="lp-top">
        <span className="lp-lesson-name">{t(data.course.meta.shortTitle.en, data.course.meta.shortTitle.ro)}</span>
        <span className="lp-count" aria-live="polite">{screen} / {total}</span>
      </div>
      <div className="lp-bar" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={screen}
        aria-label={t('Lesson progress', 'Progresul lecției')}>
        <Motion.div className="lp-bar-fill" initial={false} animate={{ width: `${pct}%` }}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 26 }} />
      </div>

      <div className="lp-stage">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <Motion.section
            key={screen}
            className="lp-card"
            data-testid="lesson-screen"
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduced ? { duration: 0.15 } : { x: { type: 'spring', stiffness: 380, damping: 34 }, opacity: { duration: 0.18 } }}
          >
            <h2 ref={headingRef} tabIndex={-1} className="lp-title" dangerouslySetInnerHTML={{ __html: formatMarkdown(title) }} />
            <ScreenGate src={src} screen={screen} state={gate} patchGate={patchGate} onSkip={onSkip}>
              <div className="lp-blocks">
                {step.blocks.map((block, i) => (
                  <BlockRenderer key={`${step.id}:${i}`} block={block} lectureVisible={lectureVisible} />
                ))}
              </div>
            </ScreenGate>
          </Motion.section>
        </AnimatePresence>
      </div>

      <div className="lp-footer">
        <button type="button" className="lp-btn lp-btn-ghost" data-testid="lesson-back" onClick={back} disabled={screen === 1}>
          <Arrow dir={-1} /><span>{t('Back', 'Înapoi')}</span>
        </button>
        <div className="lp-footer-end">
          {gating && !advanceOk && (
            <button type="button" className="lp-skip" data-testid="lesson-skip" onClick={skip}>{t('Skip', 'Sari peste')}</button>
          )}
          <button type="button" className="lp-btn lp-btn-primary" data-testid="lesson-next" onClick={forward} disabled={!advanceOk}>
            <span>{isLast ? (hasNext ? t('Next lesson', 'Lecția următoare') : t('Finish', 'Gata')) : t('Continue', 'Continuă')}</span>
            <Arrow dir={1} />
          </button>
        </div>
      </div>
    </div>
  );
}
