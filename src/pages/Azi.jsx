import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { subjects } from '../content/registry';
import schedule from '../content/schedule-y2s1.json';

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

// Course id -> player route, by position in the subject's courses list (routes are course_N, N = index + 1).
// Returns null when the course (or subject) does not exist yet.
export function resolveCourse(subjectSlug, courseId) {
  const subject = subjects.find(s => s.slug === subjectSlug);
  if (!subject) return null;
  const idx = subject.courses.findIndex(c => c.id === courseId);
  if (idx < 0) return null;
  return `/${subject.yearSemester}/${subject.slug}/course_${idx + 1}`;
}

function findSubjectOf(courseId) {
  return subjects.find(s => s.courses.some(c => c.id === courseId));
}

function resolveLink(link) {
  if (!link) return null;
  if (typeof link === 'string') return { href: link, external: true };
  if (link.url) return { href: link.url, external: true };
  const to = resolveCourse(link.subject, link.course);
  return to ? { href: to, external: false } : null;
}

function resolveCrash(step) {
  if (!step.crash) return null;
  const subj = (step.link && step.link.subject) || findSubjectOf(step.crash)?.slug;
  return subj ? resolveCourse(subj, step.crash) : null;
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

const btnBase = 'block w-full text-center rounded-xl px-5 py-4 text-lg font-bold transition-all active:scale-[0.98]';

function ActionButton({ target, primary, children }) {
  const style = primary
    ? { backgroundColor: '#3b82f6', color: '#fff' }
    : { backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-content-text)', border: '2px solid #ef4444' };
  if (target.external) {
    return <a href={target.href} target="_blank" rel="noreferrer" className={btnBase} style={style}>{children}</a>;
  }
  return <Link to={target.href} className={btnBase} style={style}>{children}</Link>;
}

export default function Azi() {
  const { lang, t } = useApp();
  const [done, setDone] = useState(loadDone);
  const [showAll, setShowAll] = useState(false);
  const now = Date.now();

  const steps = useMemo(
    () => [...schedule.steps].sort((a, b) => new Date(a.due) - new Date(b.due)),
    [],
  );
  const next = steps.find(s => !done.includes(s.id));

  const markDone = () => {
    if (!next) return;
    const nd = [...done, next.id];
    setDone(nd);
    saveDone(nd);
  };

  const primary = next ? resolveLink(next.link) : null;
  const crash = next ? resolveCrash(next) : null;
  const card = { backgroundColor: 'var(--theme-card-bg)', border: '1px solid var(--theme-border)' };

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--theme-muted-text)' }}>
        {t('Today: what to do now', 'Azi: ce fac acum')}
      </h2>

      {next ? (
        <section className="rounded-2xl p-5" style={card} data-testid="azi-next">
          <h3 className="text-3xl font-bold leading-tight mb-2">{next.title[lang]}</h3>
          <p className="text-lg font-semibold text-blue-500 mb-1">{formatDue(next.due, lang)}</p>
          <p className="text-xl font-bold mb-5" style={{ color: '#ef4444' }}>{countdown(next.due, now, lang)}</p>

          <h4 className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--theme-muted-text)' }}>
            {t('What to do', 'Ce faci')}
          </h4>
          <p className="text-lg leading-relaxed mb-4">{next.action[lang]}</p>

          <h4 className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--theme-muted-text)' }}>
            {t('Why it matters', 'De ce contează')}
          </h4>
          <p className="text-lg leading-relaxed mb-6">{next.why[lang]}</p>

          <div className="flex flex-col gap-3">
            {primary && (
              <ActionButton target={primary} primary>{t('Open the lesson', 'Deschide lecția')}</ActionButton>
            )}
            {crash && (
              <ActionButton target={{ href: crash, external: false }}>{t('Emergency mode', 'Mod urgență')}</ActionButton>
            )}
            <button
              type="button"
              onClick={markDone}
              className={btnBase}
              style={{ backgroundColor: 'transparent', color: 'var(--theme-content-text)', border: '2px solid var(--theme-border)' }}
            >
              {t('Done, next', 'Gata, următorul')}
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl p-5 text-center" style={card}>
          <p className="text-2xl font-bold">{t('Everything on the list is done.', 'Tot ce era pe listă e gata.')}</p>
        </section>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          aria-expanded={showAll}
          className="text-sm font-medium py-2"
          style={{ color: 'var(--theme-muted-text)' }}
        >
          {showAll ? '▾' : '▸'} {t('All steps', 'Toate pașii')}
        </button>
        {showAll && (
          <ol className="mt-2 flex flex-col gap-2">
            {steps.map(s => {
              const isDone = done.includes(s.id);
              return (
                <li key={s.id} className="rounded-lg px-3 py-2 text-sm flex justify-between gap-3"
                  style={{ ...card, opacity: isDone ? 0.5 : 1 }}>
                  <span style={{ textDecoration: isDone ? 'line-through' : 'none' }}>{s.title[lang]}</span>
                  <span style={{ color: 'var(--theme-muted-text)' }}>
                    {new Date(s.due).toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-GB', { timeZone: 'Europe/Bucharest', day: 'numeric', month: 'short' })}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </main>
  );
}
