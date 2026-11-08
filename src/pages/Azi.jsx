import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useLessonStore } from '../lesson/useLessonStore';
import schedule from '../content/schedule-y2s1.json';
import {
  courseInfo, buildTargets, isPassed, openingIndex, nextIndexAfter, moveIndex, markDone, unmarkDone,
} from './aziLogic';

const STORE_KEY = 'azi.v1';

function loadDone() {
  try {
    const v = JSON.parse(localStorage.getItem(STORE_KEY));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function saveDone(done) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(done)); } catch { /* ignore */ }
}

function countdown(due, now, lang) {
  const ms = new Date(due).getTime() - now;
  if (ms <= 0) return lang === 'ro' ? 'termen depășit' : 'deadline passed';
  const hours = Math.floor(ms / 3600000);
  const d = Math.floor(hours / 24);
  const h = hours % 24;
  if (lang === 'ro') {
    if (d === 0) return `peste ${h} ${h === 1 ? 'oră' : 'ore'}`;
    return `peste ${d} ${d === 1 ? 'zi' : 'zile'} și ${h} ${h === 1 ? 'oră' : 'ore'}`;
  }
  if (d === 0) return `in ${h} ${h === 1 ? 'hour' : 'hours'}`;
  return `in ${d} ${d === 1 ? 'day' : 'days'} and ${h} ${h === 1 ? 'hour' : 'hours'}`;
}

function formatDue(due, lang) {
  return new Date(due).toLocaleString(lang === 'ro' ? 'ro-RO' : 'en-GB', {
    timeZone: 'Europe/Bucharest',
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });
}

const btnBase = 'block w-full text-center rounded-xl px-5 py-4 text-lg font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100';
const muted = { color: 'var(--theme-muted-text)' };

function ActionButton({ target, primary, label, progress }) {
  const style = primary
    ? { backgroundColor: '#3b82f6', color: '#fff' }
    : { backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-content-text)', border: '2px solid #ef4444' };
  const inner = (
    <>
      <span className="block">{label}</span>
      {progress && <span className="block text-sm font-medium opacity-80 mt-0.5">{progress}</span>}
    </>
  );
  if (target.external) {
    return <a href={target.href} target="_blank" rel="noreferrer" className={btnBase} style={style}>{inner}</a>;
  }
  return <Link to={target.href} className={btnBase} style={style}>{inner}</Link>;
}

export default function Azi() {
  const { lang, t } = useApp();
  const store = useLessonStore();
  const [done, setDone] = useState(loadDone);
  const [now, setNow] = useState(() => Date.now());
  const cardRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const steps = useMemo(
    () => [...schedule.steps].sort((a, b) => new Date(a.due) - new Date(b.due)),
    [],
  );
  const [index, setIndex] = useState(() => openingIndex(steps, loadDone(), Date.now()));
  const step = steps[index];
  const isDone = !!step && done.includes(step.id);
  const passed = !!step && isPassed(step, now);
  const currentId = steps.find(s => !done.includes(s.id) && !isPassed(s, now))?.id;
  const allDone = steps.every(s => done.includes(s.id));

  const show = (i) => {
    setIndex(i);
    try { cardRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch { /* no scrolling */ }
  };

  const commit = (nd) => { setDone(nd); saveDone(nd); };
  const onDone = () => {
    if (!step) return;
    const nd = markDone(done, step.id);
    commit(nd);
    setIndex(nextIndexAfter(steps, nd, now, index));
  };
  const onUndo = () => { if (step) commit(unmarkDone(done, step.id)); };

  const targets = step ? buildTargets(step) : [];
  const hasLesson = targets.some(x => x.kind === 'lesson');
  const progressOf = (target) => {
    const info = target.courseId ? courseInfo(target.subject, target.courseId) : null;
    if (!info || !info.src || !info.total || !store.hasPosition(info.src)) return null;
    const at = Math.min(info.total, store.getPosition(info.src));
    return t(`${at} / ${info.total} screens`, `${at} / ${info.total} ecrane`);
  };
  const labelOf = (target) => {
    if (target.kind === 'lesson') return t('Open the lesson', 'Deschide lecția');
    if (target.parts > 1) return t(`Emergency mode · part ${target.part}`, `Mod urgență · partea ${target.part}`);
    return t('Emergency mode', 'Mod urgență');
  };

  const card = { backgroundColor: 'var(--theme-card-bg)', border: '1px solid var(--theme-border)' };
  const shortDate = (due) => new Date(due).toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-GB', { timeZone: 'Europe/Bucharest', day: 'numeric', month: 'short' });
  const navStyle = { backgroundColor: 'transparent', color: 'var(--theme-content-text)', border: '2px solid var(--theme-border)' };

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={muted}>
        {t('Today: what to do now', 'Azi: ce fac acum')}
      </h2>

      {step && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <button type="button" onClick={() => show(moveIndex(index, -1, steps.length))} disabled={index <= 0}
              className="rounded-xl px-4 py-3 text-base font-bold disabled:opacity-40" style={navStyle} data-testid="azi-prev">
              ‹ {t('Back', 'Înapoi')}
            </button>
            <p className="flex-1 text-center text-sm font-semibold" style={muted} aria-live="polite" data-testid="azi-position">
              {t(`Step ${index + 1} of ${steps.length}`, `Pasul ${index + 1} din ${steps.length}`)}
            </p>
            <button type="button" onClick={() => show(moveIndex(index, 1, steps.length))} disabled={index >= steps.length - 1}
              className="rounded-xl px-4 py-3 text-base font-bold disabled:opacity-40" style={navStyle} data-testid="azi-forward">
              {t('Next', 'Înainte')} ›
            </button>
          </div>

          <section ref={cardRef} className="rounded-2xl p-5 scroll-mt-4" style={card} data-testid="azi-next">
            {isDone && (
              <p className="inline-block rounded-full px-3 py-1 text-sm font-bold mb-3" style={{ backgroundColor: '#16a34a', color: '#fff' }} data-testid="azi-done-badge">
                ✓ {t('This one is done', 'Pasul ăsta e gata')}
              </p>
            )}
            <h3 className="text-3xl font-bold leading-tight mb-2 break-words">{step.title[lang]}</h3>
            <p className="text-lg font-semibold text-blue-500 mb-1">{formatDue(step.due, lang)}</p>
            <p className="text-xl font-bold mb-5" style={passed || isDone ? muted : { color: '#ef4444' }}>{countdown(step.due, now, lang)}</p>

            <h4 className="text-xs font-bold uppercase tracking-wide mb-1" style={muted}>
              {t('What to do', 'Ce faci')}
            </h4>
            <p className="text-lg leading-relaxed mb-4">{step.action[lang]}</p>

            <h4 className="text-xs font-bold uppercase tracking-wide mb-1" style={muted}>
              {t('Why it matters', 'De ce contează')}
            </h4>
            <p className="text-lg leading-relaxed mb-6">{step.why[lang]}</p>

            <div className="flex flex-col gap-3">
              {targets.map((target, i) => (
                <ActionButton key={target.key} target={target} primary={hasLesson ? target.kind === 'lesson' : i === 0}
                  label={labelOf(target)} progress={progressOf(target)} />
              ))}
              {isDone ? (
                <button type="button" onClick={onUndo} className={btnBase} style={navStyle} data-testid="azi-undo">
                  {t('Not done, put it back', 'Nu e gata, pune-l înapoi')}
                </button>
              ) : (
                <button type="button" onClick={onDone} className={btnBase} style={navStyle} data-testid="azi-done">
                  {t('Done, next', 'Gata, următorul')}
                </button>
              )}
            </div>
          </section>
        </>
      )}

      {allDone && (
        <p className="mt-4 text-center text-lg font-bold" data-testid="azi-all-done">
          {t('Everything on the list is done.', 'Tot ce era pe listă e gata.')}
        </p>
      )}

      <h3 className="text-sm font-bold uppercase tracking-wide mt-6 mb-2" style={muted}>{t('All steps', 'Toate pașii')}</h3>
      <ol className="flex flex-col gap-2" data-testid="azi-list">
        {steps.map((s, i) => {
          const sDone = done.includes(s.id);
          const sPassed = isPassed(s, now);
          const selected = i === index;
          const mark = sDone ? '✓' : sPassed ? '⏱' : s.id === currentId ? '●' : '○';
          const markText = sDone ? t('done', 'gata') : sPassed ? t('deadline passed', 'termen depășit') : s.id === currentId ? t('now', 'acum') : '';
          return (
            <li key={s.id}>
              <button type="button" onClick={() => show(i)} aria-current={selected ? 'step' : undefined}
                className="w-full rounded-xl px-3 py-3 text-left flex items-center gap-3 min-h-[48px]"
                style={{ ...card, borderColor: selected ? '#3b82f6' : 'var(--theme-border)', borderWidth: 2, backgroundColor: selected ? 'color-mix(in srgb, #3b82f6 12%, var(--theme-card-bg))' : 'var(--theme-card-bg)', opacity: sDone || sPassed ? 0.75 : 1 }}>
                <span aria-hidden="true" className="w-6 text-center text-lg" style={{ color: sDone ? '#16a34a' : sPassed ? '#ef4444' : s.id === currentId ? '#3b82f6' : 'var(--theme-muted-text)' }}>{mark}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold break-words" style={{ textDecoration: sDone ? 'line-through' : 'none' }}>{s.title[lang]}</span>
                  {markText && <span className="block text-xs" style={muted}>{markText}</span>}
                </span>
                <span className="text-sm shrink-0" style={muted}>{shortDate(s.due)}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
