import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [dark, setDark] = useLocalStorage('dark', true);
  const [lang, setLang] = useLocalStorage('lang', 'ro');
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useLocalStorage('checked', {});

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
    search, setSearch,
    checked, toggleCheck,
    t, highlight,
  }), [dark, lang, search, checked, t, toggleCheck, highlight, toggleDark, toggleLang]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
