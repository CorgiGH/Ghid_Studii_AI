// Pure logic for the /azi page: which step opens, which buttons a step gets, done / undo.
import { subjects } from '../content/registry';

// Course id -> player route, by position in the subject's courses list (routes are course_N, N = index + 1).
// Returns null when the course (or subject) does not exist yet.
export function resolveCourse(subjectSlug, courseId) {
  const subject = subjects.find(s => s.slug === subjectSlug);
  if (!subject) return null;
  const idx = subject.courses.findIndex(c => c.id === courseId);
  if (idx < 0) return null;
  return `/${subject.yearSemester}/${subject.slug}/course_${idx + 1}`;
}

// The lesson file and screen count of a course id (for the saved-progress line).
export function courseInfo(subjectSlug, courseId) {
  const subject = subjects.find(s => s.slug === subjectSlug);
  const c = subject && subject.courses.find(x => x.id === courseId);
  return c ? { src: c.src || null, total: c.sectionCount || 0 } : null;
}

function findSubjectOf(courseId) {
  return subjects.find(s => s.courses.some(c => c.id === courseId));
}

export const isPassed = (step, now) => new Date(step.due).getTime() <= now;
const isOpenable = (step, done, now) => !done.includes(step.id) && !isPassed(step, now);

// The step the card opens on: first one not done and not passed; else first not done (all passed); else the last one.
export function openingIndex(steps, done, now) {
  if (!steps.length) return -1;
  let i = steps.findIndex(s => isOpenable(s, done, now));
  if (i >= 0) return i;
  i = steps.findIndex(s => !done.includes(s.id));
  return i >= 0 ? i : steps.length - 1;
}

// After "Gata": the next not-done, not-passed step after `from` (wrapping to the start), else the opening step.
export function nextIndexAfter(steps, done, now, from) {
  for (let k = 1; k <= steps.length; k++) {
    const i = (from + k) % steps.length;
    if (i !== from && isOpenable(steps[i], done, now)) return i;
  }
  return openingIndex(steps, done, now);
}

// Înapoi / Înainte: moves one step, stays put at the ends.
export function moveIndex(index, dir, length) {
  const n = index + dir;
  return n < 0 || n >= length ? index : n;
}

export function markDone(done, id) {
  return done.includes(id) ? done : [...done, id];
}

export function unmarkDone(done, id) {
  return done.filter(x => x !== id);
}

// Distinct places a step can send the learner. Never two entries with the same href.
// -> [{ key, kind: 'lesson' | 'crash', href, external, part, parts, courseId, subject }]
export function buildTargets(step, resolve = resolveCourse) {
  const out = [];
  const seen = new Set();
  const push = (t) => {
    if (!t.href || seen.has(t.href)) return;
    seen.add(t.href);
    out.push(t);
  };
  const link = step.link;
  const crashIds = step.crash ? (Array.isArray(step.crash) ? step.crash : [step.crash]) : [];

  // Resolve crash packs first so a lesson that is really one of them is not offered twice.
  const crash = [];
  for (const id of crashIds) {
    const subject = (link && link.subject) || findSubjectOf(id)?.slug;
    const href = subject ? resolve(subject, id) : null;
    if (href) crash.push({ key: id, kind: 'crash', href, external: false, courseId: id, subject });
  }

  if (typeof link === 'string') push({ key: 'url', kind: 'lesson', href: link, external: true });
  else if (link && link.url) push({ key: 'url', kind: 'lesson', href: link.url, external: true });
  else if (link && link.course && !crashIds.includes(link.course)) {
    const href = resolve(link.subject, link.course);
    if (href) push({ key: link.course, kind: 'lesson', href, external: false, courseId: link.course, subject: link.subject });
  }

  crash.forEach(c => push(c));
  const crashOnly = out.filter(t => t.kind === 'crash');
  crashOnly.forEach((t, i) => { t.part = i + 1; t.parts = crashOnly.length; });
  return out;
}
