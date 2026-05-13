import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { applyPalette, DEFAULT_PALETTE } from '../theme/palettes';

const AppContext = createContext();

/** One-time migration: rename old section-check keys (c1-xxx → course_1-xxx) */
function migrateCheckedKeys(obj) {
  const out = {};
  let changed = false;
  for (const [k, v] of Object.entries(obj)) {
    let nk = k;
    if (/^c(\d+)-(.+)$/.test(k)) {
      nk = k.replace(/^c(\d+)-(.+)$/, 'course_$1-$2');
    } else if (/^(.+?)-c(\d+)-(.+)$/.test(k)) {
      nk = k.replace(/^(.+?)-c(\d+)-(.+)$/, '$1-course_$2-$3');
    }
    if (nk !== k) changed = true;
    out[nk] = v;
  }
  return changed ? out : null;
}

/** One-time migration: rename lab section keys (lab1-ex4 → lab_1-ex4) */
function migrateLabKeys(obj) {
  const out = {};
  let changed = false;
  for (const [k, v] of Object.entries(obj)) {
    let nk = k;
    if (/^lab(\d+)-(.+)$/.test(k)) {
      nk = k.replace(/^lab(\d+)-(.+)$/, 'lab_$1-$2');
    }
    if (nk !== k) changed = true;
    out[nk] = v;
  }
  return changed ? out : null;
}

/** One-time migration: legacy oop-course_7-* section checks → oop-c7-* progress entries.
 *  Mapping is by topic, captured during the Course 7 JSON migration (2026-05-13).
 *  Returns { removeFromChecked, addToProgress } or null if no legacy keys present. */
function migrateOopC7Keys(checked) {
  const map = {
    'oop-course_7-sequence':   'oop-c7-vector',
    'oop-course_7-adaptors':   'oop-c7-adaptors',
    'oop-course_7-streams':    'oop-c7-io-streams',
    'oop-course_7-strings':    'oop-c7-strings',
    'oop-course_7-init-lists': 'oop-c7-init-lists',
    'oop-course_7-iterators':  'oop-c7-iterators',
  };
  const removeFromChecked = [];
  const addToProgress = {};
  let any = false;
  for (const [oldK, newK] of Object.entries(map)) {
    if (oldK in checked) {
      if (checked[oldK]) addToProgress[newK] = { visited: true, understood: true };
      removeFromChecked.push(oldK);
      any = true;
    }
  }
  return any ? { removeFromChecked, addToProgress } : null;
}

// Migrate dark boolean → themeMode string (one-time)
try {
  const rawDark = localStorage.getItem('dark');
  if (rawDark !== null && !localStorage.getItem('themeMode')) {
    localStorage.setItem('themeMode', JSON.stringify(JSON.parse(rawDark) ? 'dark' : 'light'));
    localStorage.removeItem('dark');
  }
} catch { /* ignore corrupted localStorage */ }

export function AppProvider({ children }) {
  const [themeMode, setThemeMode] = useLocalStorage('themeMode', 'system');

  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const dark = themeMode === 'dark' || (themeMode === 'system' && systemDark);
  const [lang, setLang] = useLocalStorage('lang', 'ro');
  const [palette, setPalette] = useLocalStorage('palette', DEFAULT_PALETTE);
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useLocalStorage('checked', {});
  const [sidebarLocked, setSidebarLocked] = useLocalStorage('sidebarLocked', true);
  // Default collapsed on desktop — user opens deliberately. State persists
  // in localStorage (useLocalStorage), so returning users keep their choice.
  const [chatOpen, setChatOpen] = useLocalStorage('chatOpen', false);
  const [chatWidth, setChatWidth] = useLocalStorage('chatWidth', null);
  const [progress, setProgress] = useLocalStorage('progress', {});
  const [lectureVisible, setLectureVisible] = useLocalStorage('lectureVisible', false);
  const toggleLecture = useCallback(() => setLectureVisible(v => !v), []);
  const [testProgress, setTestProgress] = useLocalStorage('testProgress', {});

  const [courseContext, setCourseContext] = useState(null);

  const saveTestResult = useCallback((testId, score, totalPoints, answers) => {
    setTestProgress(prev => ({
      ...prev,
      [testId]: {
        score,
        totalPoints,
        completedAt: new Date().toISOString().slice(0, 10),
        answers,
      },
    }));
  }, []);

  const markVisited = useCallback((stepId) => {
    setProgress(prev => {
      if (prev[stepId]?.visited) return prev;
      return { ...prev, [stepId]: { ...prev[stepId], visited: true, understood: prev[stepId]?.understood || false } };
    });
  }, []);

  const toggleUnderstood = useCallback((stepId) => {
    setProgress(prev => {
      const current = prev[stepId] || { visited: false, understood: false };
      return { ...prev, [stepId]: { ...current, visited: true, understood: !current.understood } };
    });
  }, []);

  useEffect(() => {
    applyPalette(palette, dark);
    // Sync <html> dark class (FOUC script sets it before React, React must update it)
    document.documentElement.classList.toggle('dark', dark);
  }, [palette, dark]);

  // Run one-time checked-key migration (course IDs: c1-xxx → course_1-xxx)
  useEffect(() => {
    if (localStorage.getItem('checked_v2_migrated')) return;
    const migrated = migrateCheckedKeys(checked);
    if (migrated) setChecked(migrated);
    localStorage.setItem('checked_v2_migrated', '1');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Run one-time checked-key migration (lab IDs: lab1-xxx → lab_1-xxx)
  useEffect(() => {
    if (localStorage.getItem('checked_v3_migrated')) return;
    const migrated = migrateLabKeys(checked);
    if (migrated) setChecked(migrated);
    localStorage.setItem('checked_v3_migrated', '1');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // One-time migration: checked keys → progress entries (visited + understood)
  useEffect(() => {
    if (localStorage.getItem('progress_v1_migrated')) return;
    const newProgress = { ...progress };
    let changed = false;
    for (const [key, value] of Object.entries(checked)) {
      if (value && !newProgress[key]) {
        newProgress[key] = { visited: true, understood: true };
        changed = true;
      }
    }
    if (changed) setProgress(newProgress);
    localStorage.setItem('progress_v1_migrated', '1');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // One-time migration: legacy oop-course_7-* checked keys → oop-c7-* progress entries.
  // Added 2026-05-13 with the Course 7 JSON migration. Sentinel-gated. Idempotent.
  useEffect(() => {
    if (localStorage.getItem('migrated_oop_c7') === '1') return;
    try {
      const result = migrateOopC7Keys(checked);
      if (result) {
        const { removeFromChecked, addToProgress } = result;
        if (removeFromChecked.length > 0) {
          setChecked(prev => {
            const next = { ...prev };
            for (const k of removeFromChecked) delete next[k];
            return next;
          });
        }
        if (Object.keys(addToProgress).length > 0) {
          setProgress(prev => ({ ...prev, ...addToProgress }));
        }
      }
      localStorage.setItem('migrated_oop_c7', '1');
    } catch (e) {
      console.error('oop-c7 shim failed', e);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const t = useCallback((en, ro) => lang === 'ro' ? ro : en, [lang]);

  const toggleCheck = useCallback((id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const highlight = useCallback((text) => {
    if (!search || search.length < 2) return text;
    if (typeof text !== 'string') return text;
    const re = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(re).map((part, i) =>
      re.test(part) ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-700">{part}</mark> : part
    );
  }, [search]);

  const toggleLang = useCallback(() => setLang(l => l === 'ro' ? 'en' : 'ro'), []);
  const cycleTheme = useCallback(() => {
    setThemeMode(m => m === 'light' ? 'dark' : m === 'dark' ? 'system' : 'light');
  }, []);
  const toggleSidebarLock = useCallback(() => setSidebarLocked(l => !l), []);
  const toggleChat = useCallback(() => setChatOpen(c => !c), []);

  const value = useMemo(() => ({
    dark, themeMode, cycleTheme,
    lang, setLang, toggleLang,
    palette, setPalette,
    search, setSearch,
    checked, setChecked, toggleCheck,
    progress, markVisited, toggleUnderstood,
    lectureVisible, toggleLecture,
    testProgress, saveTestResult,
    courseContext, setCourseContext,
    t, highlight,
    sidebarLocked, setSidebarLocked, toggleSidebarLock,
    chatOpen, setChatOpen, toggleChat,
    chatWidth, setChatWidth,
  }), [dark, themeMode, lang, palette, search, checked, t, toggleCheck, highlight, cycleTheme, toggleLang, sidebarLocked, chatOpen, toggleSidebarLock, toggleChat, chatWidth, progress, markVisited, toggleUnderstood, lectureVisible, toggleLecture, testProgress, saveTestResult, courseContext, setCourseContext]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
