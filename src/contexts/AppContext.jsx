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

export function AppProvider({ children }) {
  const [dark, setDark] = useLocalStorage('dark', true);
  const [lang, setLang] = useLocalStorage('lang', 'ro');
  const [palette, setPalette] = useLocalStorage('palette', DEFAULT_PALETTE);
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useLocalStorage('checked', {});

  useEffect(() => {
    applyPalette(palette, dark);
  }, [palette, dark]);

  // Run one-time checked-key migration
  useEffect(() => {
    if (localStorage.getItem('checked_v2_migrated')) return;
    const migrated = migrateCheckedKeys(checked);
    if (migrated) setChecked(migrated);
    localStorage.setItem('checked_v2_migrated', '1');
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
  const toggleDark = useCallback(() => setDark(d => !d), []);

  const value = useMemo(() => ({
    dark, setDark, toggleDark,
    lang, setLang, toggleLang,
    palette, setPalette,
    search, setSearch,
    checked, setChecked, toggleCheck,
    t, highlight,
  }), [dark, lang, palette, search, checked, t, toggleCheck, highlight, toggleDark, toggleLang]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
