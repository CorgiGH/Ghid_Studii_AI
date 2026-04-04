# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the study guide UI with improved navigation (subject switcher, content type bar, breadcrumbs, prev/next), progress feedback (sidebar rings, course map dashboard, reading progress), and a 5-palette theme system.

**Architecture:** CSS custom properties define 5 color palettes (slate, stone, ocean, zinc, forest) with light/dark variants. A `palette` state in AppContext (persisted to localStorage) switches palettes by setting a data attribute on the root element. All layout components (TopBar, Sidebar, ContentTypeBar, Breadcrumbs) reference these CSS variables via Tailwind classes. New reusable components (ProgressRing, CourseMap, ReadingProgress, CourseNavigation, PalettePicker) compose into the existing SubjectPage.

**Tech Stack:** React 19, Tailwind CSS v4 (CSS-first config), react-router-dom v7, CSS custom properties

**Spec:** `docs/superpowers/specs/2026-04-04-ui-redesign-design.md`

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `src/theme/palettes.js` | Palette definitions (colors for 5 palettes × light/dark × nav/content/sidebar/etc.) |
| `src/components/ui/ProgressRing.jsx` | Reusable SVG circular progress indicator |
| `src/components/ui/PalettePicker.jsx` | Popover with 5 color circles for palette selection |
| `src/components/ui/ContentTypeBar.jsx` | Secondary nav row replacing TabBar for content types |
| `src/components/layout/Breadcrumbs.jsx` | Clickable breadcrumb trail |
| `src/components/ui/CourseMap.jsx` | Bird's-eye course grid with progress tiles |
| `src/components/ui/ReadingProgress.jsx` | Top gradient bar + section segment indicators |
| `src/components/ui/CourseNavigation.jsx` | Prev/next course links at bottom of content |

### Modified files
| File | Changes |
|------|---------|
| `src/index.css` | Add CSS custom properties for all palette colors, palette data-attribute selectors |
| `src/contexts/AppContext.jsx` | Add `palette` state (persisted), expose in context |
| `src/components/layout/AppShell.jsx` | Apply `data-palette` attribute to root div, update bg classes to use CSS vars |
| `src/components/layout/TopBar.jsx` | Full redesign: subject switcher dropdown, palette picker, new layout |
| `src/components/layout/Sidebar.jsx` | Redesign: progress rings, dynamic section counting, themed colors |
| `src/pages/SubjectPage.jsx` | Replace TabBar with ContentTypeBar, add Breadcrumbs, CourseMap, ReadingProgress, CourseNavigation |
| `src/pages/Home.jsx` | Update bg/text classes to use theme CSS vars |
| `src/content/os/index.js` | Add `sectionCount` to each course |
| `src/content/pa/index.js` | Add `sectionCount` to each course |
| `src/components/ui/index.js` | Export new components |

---

## Task 1: Theme System — Palette Definitions & CSS Variables

**Files:**
- Create: `src/theme/palettes.js`
- Modify: `src/index.css`

- [ ] **Step 1: Create palette definitions**

Create `src/theme/palettes.js`:

```jsx
export const PALETTES = {
  slate: {
    id: 'slate',
    name: 'Slate',
    swatch: '#94a3b8',
    light: {
      navBg: '#e2e8f0',
      navText: '#1e293b',
      navHover: '#cbd5e1',
      contentTypeBg: '#f1f5f9',
      breadcrumbBg: '#f8fafc',
      contentBg: '#ffffff',
      contentText: '#1a1a1a',
      sidebarBg: '#f8fafc',
      sidebarBorder: '#e2e8f0',
      mutedText: '#64748b',
      border: '#e2e8f0',
      cardBg: '#ffffff',
      hoverBg: '#f1f5f9',
    },
    dark: {
      navBg: '#12122a',
      navText: '#e2e4e8',
      navHover: '#1e1e3a',
      contentTypeBg: '#161630',
      breadcrumbBg: '#1a1a32',
      contentBg: '#1e1e38',
      contentText: '#e2e4e8',
      sidebarBg: '#1a1a32',
      sidebarBorder: '#2a2a4a',
      mutedText: '#6b6d80',
      border: '#2a2a4a',
      cardBg: '#1e1e38',
      hoverBg: '#2a2a4a',
    },
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    swatch: '#a8a29e',
    light: {
      navBg: '#e7e5e4',
      navText: '#1c1917',
      navHover: '#d6d3d1',
      contentTypeBg: '#f5f5f4',
      breadcrumbBg: '#faf8f5',
      contentBg: '#fafaf9',
      contentText: '#1c1917',
      sidebarBg: '#f5f5f4',
      sidebarBorder: '#e7e5e4',
      mutedText: '#78716c',
      border: '#e7e5e4',
      cardBg: '#fafaf9',
      hoverBg: '#f5f5f4',
    },
    dark: {
      navBg: '#1c1917',
      navText: '#e7e5e4',
      navHover: '#292524',
      contentTypeBg: '#231f1c',
      breadcrumbBg: '#211e1b',
      contentBg: '#292524',
      contentText: '#e7e5e4',
      sidebarBg: '#211e1b',
      sidebarBorder: '#44403c',
      mutedText: '#78716c',
      border: '#44403c',
      cardBg: '#292524',
      hoverBg: '#44403c',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    swatch: '#7393b8',
    light: {
      navBg: '#dbe4f0',
      navText: '#1e293b',
      navHover: '#c5d4e8',
      contentTypeBg: '#edf2fa',
      breadcrumbBg: '#f0f4ff',
      contentBg: '#f8faff',
      contentText: '#1a1a1a',
      sidebarBg: '#edf2fa',
      sidebarBorder: '#dbe4f0',
      mutedText: '#64748b',
      border: '#dbe4f0',
      cardBg: '#f8faff',
      hoverBg: '#edf2fa',
    },
    dark: {
      navBg: '#0f172a',
      navText: '#e2e8f0',
      navHover: '#1e293b',
      contentTypeBg: '#141d32',
      breadcrumbBg: '#162038',
      contentBg: '#1a2540',
      contentText: '#e2e8f0',
      sidebarBg: '#162038',
      sidebarBorder: '#1e3050',
      mutedText: '#475569',
      border: '#1e3050',
      cardBg: '#1a2540',
      hoverBg: '#1e3050',
    },
  },
  zinc: {
    id: 'zinc',
    name: 'Zinc',
    swatch: '#71717a',
    light: {
      navBg: '#e4e4e7',
      navText: '#18181b',
      navHover: '#d4d4d8',
      contentTypeBg: '#f4f4f5',
      breadcrumbBg: '#fafafa',
      contentBg: '#ffffff',
      contentText: '#18181b',
      sidebarBg: '#f4f4f5',
      sidebarBorder: '#e4e4e7',
      mutedText: '#71717a',
      border: '#e4e4e7',
      cardBg: '#ffffff',
      hoverBg: '#f4f4f5',
    },
    dark: {
      navBg: '#18181b',
      navText: '#fafafa',
      navHover: '#27272a',
      contentTypeBg: '#1e1e22',
      breadcrumbBg: '#202024',
      contentBg: '#27272a',
      contentText: '#fafafa',
      sidebarBg: '#202024',
      sidebarBorder: '#3f3f46',
      mutedText: '#71717a',
      border: '#3f3f46',
      cardBg: '#27272a',
      hoverBg: '#3f3f46',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    swatch: '#5a8a6a',
    light: {
      navBg: '#d8e5dc',
      navText: '#1a2e20',
      navHover: '#c4d8ca',
      contentTypeBg: '#ecf2ed',
      breadcrumbBg: '#f5f9f5',
      contentBg: '#f8fbf8',
      contentText: '#1a1a1a',
      sidebarBg: '#ecf2ed',
      sidebarBorder: '#d8e5dc',
      mutedText: '#5a7a64',
      border: '#d8e5dc',
      cardBg: '#f8fbf8',
      hoverBg: '#ecf2ed',
    },
    dark: {
      navBg: '#121a16',
      navText: '#d8e5dc',
      navHover: '#1d2a22',
      contentTypeBg: '#17211c',
      breadcrumbBg: '#1a2520',
      contentBg: '#1d2a22',
      contentText: '#d8e5dc',
      sidebarBg: '#1a2520',
      sidebarBorder: '#2a3e30',
      mutedText: '#5a7a64',
      border: '#2a3e30',
      cardBg: '#1d2a22',
      hoverBg: '#2a3e30',
    },
  },
};

export const DEFAULT_PALETTE = 'slate';

// Apply palette CSS variables to a DOM element
export function applyPalette(paletteId, isDark) {
  const palette = PALETTES[paletteId] || PALETTES[DEFAULT_PALETTE];
  const colors = isDark ? palette.dark : palette.light;
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case: navBg -> --theme-nav-bg
    const cssVar = '--theme-' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(cssVar, value);
  });
}
```

- [ ] **Step 2: Add CSS variable references to index.css**

Add to the end of `src/index.css`:

```css
/* Theme system — variables are set dynamically by applyPalette() in palettes.js */
/* Provide defaults so the page doesn't flash unstyled */
:root {
  --theme-nav-bg: #e2e8f0;
  --theme-nav-text: #1e293b;
  --theme-nav-hover: #cbd5e1;
  --theme-content-type-bg: #f1f5f9;
  --theme-breadcrumb-bg: #f8fafc;
  --theme-content-bg: #ffffff;
  --theme-content-text: #1a1a1a;
  --theme-sidebar-bg: #f8fafc;
  --theme-sidebar-border: #e2e8f0;
  --theme-muted-text: #64748b;
  --theme-border: #e2e8f0;
  --theme-card-bg: #ffffff;
  --theme-hover-bg: #f1f5f9;
}
```

- [ ] **Step 3: Verify dev server starts**

Run: `npm run dev`
Expected: Vite dev server starts, no errors. Page loads normally (no visual changes yet — variables are defined but not consumed).

- [ ] **Step 4: Commit**

```bash
git add src/theme/palettes.js src/index.css
git commit -m "feat: add theme palette definitions and CSS custom properties"
```

---

## Task 2: AppContext — Add Palette State & Apply Palette Effect

**Files:**
- Modify: `src/contexts/AppContext.jsx`
- Modify: `src/components/layout/AppShell.jsx`

- [ ] **Step 1: Add palette state to AppContext**

In `src/contexts/AppContext.jsx`, add the palette import and state. The full updated file:

```jsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { applyPalette, DEFAULT_PALETTE } from '../theme/palettes';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [dark, setDark] = useLocalStorage('dark', true);
  const [lang, setLang] = useLocalStorage('lang', 'ro');
  const [palette, setPalette] = useLocalStorage('palette', DEFAULT_PALETTE);
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useLocalStorage('checked', {});

  // Apply palette CSS variables whenever palette or dark mode changes
  useEffect(() => {
    applyPalette(palette, dark);
  }, [palette, dark]);

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
    checked, toggleCheck,
    t, highlight,
  }), [dark, lang, palette, search, checked, t, toggleCheck, highlight, toggleDark, toggleLang]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
```

- [ ] **Step 2: Update AppShell to use theme CSS variables**

In `src/components/layout/AppShell.jsx`, replace the hardcoded `bg-gray-50 dark:bg-gray-900` with CSS variable backgrounds:

```jsx
import React, { useState } from 'react';
import TopBar from './TopBar';
import { useApp } from '../../contexts/AppContext';

const AppShell = ({ children }) => {
  const { dark } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={dark ? 'dark' : ''}>
      <div
        className="min-h-screen font-sans transition-colors duration-200"
        style={{ backgroundColor: 'var(--theme-content-bg)', color: 'var(--theme-content-text)' }}
      >
        <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {typeof children === 'function' ? children({ sidebarOpen, setSidebarOpen }) : children}
      </div>
    </div>
  );
};

export default AppShell;
```

- [ ] **Step 3: Verify palette applies on load**

Run: `npm run dev`
Expected: Page loads with slate palette colors. Background should be `#1e1e38` in dark mode (the default). Open browser DevTools → inspect `<html>` element → verify `--theme-content-bg` and other CSS vars are set on `:root`.

- [ ] **Step 4: Commit**

```bash
git add src/contexts/AppContext.jsx src/components/layout/AppShell.jsx
git commit -m "feat: add palette state to AppContext, apply CSS vars on theme change"
```

---

## Task 3: ProgressRing Component

**Files:**
- Create: `src/components/ui/ProgressRing.jsx`

- [ ] **Step 1: Create ProgressRing component**

Create `src/components/ui/ProgressRing.jsx`:

```jsx
import React from 'react';

/**
 * Circular SVG progress ring.
 * @param {number} size - Diameter in px (default 24)
 * @param {number} completed - Number of completed sections
 * @param {number} total - Total number of sections
 * @param {boolean} isActive - Whether this is the currently active course
 */
const ProgressRing = ({ size = 24, completed = 0, total = 0, isActive = false }) => {
  const percent = total > 0 ? completed / total : 0;
  const isComplete = total > 0 && completed >= total;
  const hasProgress = completed > 0;

  const strokeWidth = size >= 36 ? 3 : 2.5;
  const radius = (size / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent);
  const center = size / 2;

  // Color logic: green=complete, blue=active, amber=started-not-active, grey=not-started
  let strokeColor, fillColor, textColor;
  if (isComplete) {
    strokeColor = '#22c55e';
    fillColor = 'var(--theme-content-bg, #dcfce7)';
    textColor = '#16a34a';
  } else if (isActive && hasProgress) {
    strokeColor = '#3b82f6';
    fillColor = 'none';
    textColor = '#3b82f6';
  } else if (hasProgress) {
    strokeColor = '#f59e0b';
    fillColor = 'none';
    textColor = '#f59e0b';
  } else {
    strokeColor = 'var(--theme-border, #e5e7eb)';
    fillColor = 'none';
    textColor = 'var(--theme-muted-text, #9ca3af)';
  }

  const fontSize = size >= 36 ? 10 : (size >= 28 ? 8 : 7);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      {/* Background circle */}
      <circle
        cx={center} cy={center} r={radius}
        fill={isComplete ? fillColor : 'none'}
        stroke={isComplete ? strokeColor : 'var(--theme-border, #e5e7eb)'}
        strokeWidth={strokeWidth}
      />
      {/* Progress arc (only if not complete and has progress) */}
      {!isComplete && hasProgress && (
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-all duration-300"
        />
      )}
      {/* Center text */}
      <text
        x={center} y={center + fontSize * 0.35}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="bold"
        fill={textColor}
      >
        {isComplete ? '✓' : (total > 0 ? Math.round(percent * 100) : '')}
      </text>
    </svg>
  );
};

export default ProgressRing;
```

- [ ] **Step 2: Export from ui/index.js**

Add to `src/components/ui/index.js`:

```js
export { default as ProgressRing } from './ProgressRing';
```

- [ ] **Step 3: Verify component renders**

Open browser DevTools console on the running dev server, or temporarily import ProgressRing in any visible component to confirm it renders without errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/ProgressRing.jsx src/components/ui/index.js
git commit -m "feat: add reusable ProgressRing SVG component"
```

---

## Task 4: Add sectionCount to Subject Indexes

**Files:**
- Modify: `src/content/os/index.js`
- Modify: `src/content/pa/index.js`

- [ ] **Step 1: Add sectionCount to OS courses**

In `src/content/os/index.js`, add `sectionCount` to each course entry. The counts are:

| Course | sectionCount |
|--------|-------------|
| c1 | 9 |
| c2 | 10 |
| c3 | 9 |
| c4 | 7 |
| c5 | 7 |
| c6 | 7 |
| c7 | 7 |
| c8 | 8 |
| c9 | 8 |
| c10 | 8 |
| c11 | 8 |

Each course entry changes from:
```js
{ id: 'c1', title: { ... }, shortTitle: { ... }, component: lazy(() => import('./courses/Course01.jsx')) },
```
to:
```js
{ id: 'c1', title: { ... }, shortTitle: { ... }, sectionCount: 9, component: lazy(() => import('./courses/Course01.jsx')) },
```

Apply to all 11 courses with their respective counts.

- [ ] **Step 2: Add sectionCount to PA courses**

In `src/content/pa/index.js`, add `sectionCount` to each course:

| Course | sectionCount |
|--------|-------------|
| pa-c1 | 6 |
| pa-c2 | 7 |
| pa-c3 | 7 |
| pa-c4 | 6 |
| pa-c5 | 5 |
| pa-c6 | 6 |

Same pattern as OS courses.

- [ ] **Step 3: Commit**

```bash
git add src/content/os/index.js src/content/pa/index.js
git commit -m "feat: add sectionCount to OS and PA course indexes"
```

---

## Task 5: PalettePicker Component

**Files:**
- Create: `src/components/ui/PalettePicker.jsx`

- [ ] **Step 1: Create PalettePicker component**

Create `src/components/ui/PalettePicker.jsx`:

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { PALETTES } from '../../theme/palettes';

const PalettePicker = () => {
  const { palette, setPalette } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs px-2 py-1.5 rounded-lg transition"
        style={{ backgroundColor: 'var(--theme-nav-hover)', color: 'var(--theme-nav-text)' }}
        title="Color theme"
      >
        🎨
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 rounded-xl p-3 shadow-lg z-50"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            border: '1px solid var(--theme-border)',
            minWidth: '220px',
          }}
        >
          <div className="flex gap-3 justify-center">
            {Object.values(PALETTES).map((p) => (
              <button
                key={p.id}
                onClick={() => { setPalette(p.id); setOpen(false); }}
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className="w-8 h-8 rounded-full transition-all duration-150"
                  style={{
                    backgroundColor: p.swatch,
                    border: palette === p.id ? '3px solid #3b82f6' : '3px solid transparent',
                    boxShadow: palette === p.id ? '0 0 0 1px #3b82f6' : 'none',
                  }}
                />
                <span
                  className="text-[9px] font-medium"
                  style={{ color: palette === p.id ? '#3b82f6' : 'var(--theme-muted-text)' }}
                >
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PalettePicker;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/PalettePicker.jsx
git commit -m "feat: add PalettePicker popover component"
```

---

## Task 6: Redesign TopBar — Subject Switcher + Palette Picker

**Files:**
- Modify: `src/components/layout/TopBar.jsx`

- [ ] **Step 1: Rewrite TopBar**

Replace `src/components/layout/TopBar.jsx` entirely:

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { subjects } from '../../content/registry';
import PalettePicker from '../ui/PalettePicker';

const TopBar = ({ sidebarOpen, setSidebarOpen }) => {
  const { dark, toggleDark, lang, toggleLang, t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Extract current subject from URL
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentYearSem = pathParts[0] || null;
  const currentSubjectSlug = pathParts[1] || null;
  const currentSubject = subjects.find(s => s.slug === currentSubjectSlug);

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef(null);

  // Close switcher on click outside
  useEffect(() => {
    if (!switcherOpen) return;
    const handler = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) setSwitcherOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [switcherOpen]);

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-sm transition-colors duration-200"
      style={{ backgroundColor: 'var(--theme-nav-bg)', color: 'var(--theme-nav-text)' }}
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Mobile sidebar toggle */}
        {!isHome && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg transition"
            style={{ backgroundColor: 'var(--theme-nav-hover)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Brand */}
        <span
          onClick={() => navigate('/')}
          className="font-bold text-sm cursor-pointer hover:opacity-80 transition"
        >
          {t('Study Guide', 'Ghid de Studiu')}
        </span>

        {/* Subject switcher */}
        {!isHome && currentSubject && (
          <div className="relative" ref={switcherRef}>
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition"
              style={{ backgroundColor: 'var(--theme-nav-hover)' }}
            >
              <span>{currentSubject.icon}</span>
              <span>{currentSubject.shortTitle[lang]}</span>
              <span className="text-[10px] opacity-60">▼</span>
            </button>

            {switcherOpen && (
              <div
                className="absolute left-0 top-full mt-1.5 rounded-lg p-2 shadow-lg z-50 flex flex-wrap gap-1.5"
                style={{
                  backgroundColor: 'var(--theme-nav-bg)',
                  border: '1px solid var(--theme-border)',
                  minWidth: '200px',
                }}
              >
                {subjects.map(s => (
                  <button
                    key={s.slug}
                    onClick={() => {
                      navigate(`/${s.yearSemester}/${s.slug}`);
                      setSwitcherOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition"
                    style={{
                      backgroundColor: s.slug === currentSubjectSlug ? '#3b82f6' : 'var(--theme-nav-hover)',
                      color: s.slug === currentSubjectSlug ? '#ffffff' : 'var(--theme-nav-text)',
                    }}
                  >
                    <span>{s.icon}</span>
                    <span>{s.shortTitle[lang]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleLang}
            className="text-xs px-2.5 py-1.5 rounded-lg font-bold transition"
            style={{ backgroundColor: 'var(--theme-nav-hover)' }}
          >
            {lang === 'ro' ? 'EN' : 'RO'}
          </button>
          <PalettePicker />
          <button
            onClick={toggleDark}
            className="text-xs px-2 py-1.5 rounded-lg transition"
            style={{ backgroundColor: 'var(--theme-nav-hover)' }}
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
```

- [ ] **Step 2: Verify TopBar renders**

Run: `npm run dev`
Expected: New top bar with subject switcher (visible on subject pages), palette picker (🎨 icon), language and dark mode toggles. Clicking 🎨 opens popover with 5 color circles. Clicking a circle changes the palette.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/TopBar.jsx
git commit -m "feat: redesign TopBar with subject switcher and palette picker"
```

---

## Task 7: ContentTypeBar Component

**Files:**
- Create: `src/components/ui/ContentTypeBar.jsx`

- [ ] **Step 1: Create ContentTypeBar**

Create `src/components/ui/ContentTypeBar.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';

/**
 * Secondary navigation row for content types (Courses, Seminars, Labs, Practice, Tests).
 * Derives available types from the subject data.
 */
const ContentTypeBar = ({ subject, activeTab, onTabChange }) => {
  const { t } = useApp();

  // Build tabs from subject data — only show types with content
  const tabs = [];
  if (subject.courses?.length > 0) {
    tabs.push({ id: 'courses', label: t('Courses', 'Cursuri') });
  }
  if (subject.seminars?.length > 0) {
    tabs.push({ id: 'seminars', label: t('Solved Exercises', 'Exerciții rezolvate') });
  }
  if (subject.labs?.length > 0) {
    tabs.push({ id: 'labs', label: t('Exercises', 'Exerciții') });
  }
  if (subject.practice) {
    tabs.push({ id: 'practice', label: t('Practice', 'Practică') });
  }
  if (subject.tests?.length > 0) {
    tabs.push({ id: 'tests', label: t('Tests', 'Teste') });
  }

  return (
    <div
      className="flex items-center gap-1 px-4 py-2 overflow-x-auto transition-colors duration-200"
      style={{
        backgroundColor: 'var(--theme-content-type-bg)',
        borderBottom: '1px solid var(--theme-border)',
      }}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150"
            style={isActive ? {
              backgroundColor: 'var(--theme-card-bg)',
              color: '#3b82f6',
              fontWeight: 600,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              border: '1px solid #bfdbfe',
            } : {
              backgroundColor: 'transparent',
              color: 'var(--theme-muted-text)',
              border: '1px solid transparent',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default ContentTypeBar;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/ContentTypeBar.jsx
git commit -m "feat: add ContentTypeBar component (data-driven tab replacement)"
```

---

## Task 8: Breadcrumbs Component

**Files:**
- Create: `src/components/layout/Breadcrumbs.jsx`

- [ ] **Step 1: Create Breadcrumbs**

Create `src/components/layout/Breadcrumbs.jsx`:

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { getYearSemester } from '../../content/registry';

/**
 * Breadcrumb trail: Home / Y1 S2 / Operating Systems / Courses / C3. Processes
 * @param {string} yearSem - Year/semester ID (e.g. 'y1s2')
 * @param {object} subject - Subject object
 * @param {string} tab - Active tab ID (e.g. 'courses')
 * @param {string} [activeItemTitle] - Title of active course/seminar/lab (optional)
 */
const Breadcrumbs = ({ yearSem, subject, tab, activeItemTitle }) => {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const ys = getYearSemester(yearSem);

  const tabLabels = {
    courses: t('Courses', 'Cursuri'),
    seminars: t('Solved Exercises', 'Exerciții rezolvate'),
    labs: t('Exercises', 'Exerciții'),
    practice: t('Practice', 'Practică'),
    tests: t('Tests', 'Teste'),
  };

  const crumbs = [
    { label: t('Home', 'Acasă'), onClick: () => navigate('/') },
    ...(ys ? [{ label: ys.title[lang], onClick: () => navigate('/') }] : []),
    { label: subject.title[lang], onClick: () => navigate(`/${yearSem}/${subject.slug}`) },
    { label: tabLabels[tab] || tab, onClick: () => {
      if (tab === 'courses') navigate(`/${yearSem}/${subject.slug}`);
      else navigate(`/${yearSem}/${subject.slug}/${tab}`);
    }},
    ...(activeItemTitle ? [{ label: activeItemTitle }] : []),
  ];

  return (
    <nav
      className="px-4 py-1.5 text-xs transition-colors duration-200 overflow-x-auto whitespace-nowrap"
      style={{ backgroundColor: 'var(--theme-breadcrumb-bg)', color: 'var(--theme-muted-text)' }}
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span className="mx-1.5 opacity-40">/</span>}
            {isLast ? (
              <span className="font-semibold" style={{ color: 'var(--theme-content-text)' }}>
                {crumb.label}
              </span>
            ) : (
              <span
                onClick={crumb.onClick}
                className="cursor-pointer hover:underline"
                style={{ color: '#3b82f6' }}
              >
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Breadcrumbs.jsx
git commit -m "feat: add Breadcrumbs navigation component"
```

---

## Task 9: CourseNavigation (Prev/Next)

**Files:**
- Create: `src/components/ui/CourseNavigation.jsx`

- [ ] **Step 1: Create CourseNavigation**

Create `src/components/ui/CourseNavigation.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';

/**
 * Prev/next navigation at the bottom of course content.
 * @param {Array} items - Array of course/seminar/lab objects (each has id, shortTitle)
 * @param {number} currentIndex - Index of the currently active item
 * @param {function} onNavigate - Called with item id when prev/next is clicked
 */
const CourseNavigation = ({ items, currentIndex, onNavigate }) => {
  const { lang } = useApp();
  const prev = currentIndex > 0 ? items[currentIndex - 1] : null;
  const next = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

  if (!prev && !next) return null;

  return (
    <div
      className="flex justify-between items-center mt-8 pt-4 text-sm"
      style={{ borderTop: '1px solid var(--theme-border)' }}
    >
      {prev ? (
        <button
          onClick={() => onNavigate(prev.id)}
          className="flex items-center gap-2 hover:opacity-80 transition"
          style={{ color: 'var(--theme-muted-text)' }}
        >
          <span>←</span>
          <div className="text-left">
            <div className="text-[10px] opacity-60">Previous</div>
            <div className="font-medium text-xs">{prev.shortTitle[lang]}</div>
          </div>
        </button>
      ) : <div />}

      {next ? (
        <button
          onClick={() => onNavigate(next.id)}
          className="flex items-center gap-2 hover:opacity-80 transition text-right"
          style={{ color: '#3b82f6' }}
        >
          <div>
            <div className="text-[10px] opacity-60">Next</div>
            <div className="font-semibold text-xs">{next.shortTitle[lang]}</div>
          </div>
          <span>→</span>
        </button>
      ) : <div />}
    </div>
  );
};

export default CourseNavigation;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/CourseNavigation.jsx
git commit -m "feat: add CourseNavigation prev/next component"
```

---

## Task 10: ReadingProgress Component

**Files:**
- Create: `src/components/ui/ReadingProgress.jsx`

- [ ] **Step 1: Create ReadingProgress**

Create `src/components/ui/ReadingProgress.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';

/**
 * In-course reading progress: top gradient bar + section segment indicators.
 * @param {string} courseId - Course ID prefix (e.g. 'c1')
 * @param {number} sectionCount - Total sections in this course
 */
const ReadingProgress = ({ courseId, sectionCount }) => {
  const { checked, t } = useApp();

  if (!sectionCount || sectionCount === 0) return null;

  // Count completed sections
  const sections = Array.from({ length: sectionCount }, (_, i) => ({
    id: `${courseId}-${i}`,
    completed: !!checked[`${courseId}-${i}`],
  }));

  const completedCount = sections.filter(s => s.completed).length;
  const percent = (completedCount / sectionCount) * 100;

  // Find first incomplete section (the "current" one)
  const currentIndex = sections.findIndex(s => !s.completed);

  return (
    <div className="mb-4">
      {/* Top gradient bar */}
      <div className="h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percent}%`,
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          }}
        />
      </div>

      {/* Section segments */}
      <div className="flex items-center gap-1 mt-2">
        {sections.map((section, i) => {
          let color;
          if (section.completed) {
            color = '#22c55e'; // green
          } else if (i === currentIndex) {
            color = '#3b82f6'; // blue (current)
          } else {
            color = 'var(--theme-border, #e5e7eb)'; // grey
          }

          return (
            <div
              key={section.id}
              className="h-[3px] flex-1 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: color,
                boxShadow: i === currentIndex ? '0 0 4px rgba(59,130,246,0.4)' : 'none',
              }}
            />
          );
        })}
        <span className="ml-2 text-[11px] whitespace-nowrap" style={{ color: 'var(--theme-muted-text)' }}>
          {completedCount}/{sectionCount}
        </span>
      </div>
    </div>
  );
};

export default ReadingProgress;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/ReadingProgress.jsx
git commit -m "feat: add ReadingProgress bar and section segments"
```

---

## Task 11: CourseMap Dashboard Component

**Files:**
- Create: `src/components/ui/CourseMap.jsx`

- [ ] **Step 1: Create CourseMap**

Create `src/components/ui/CourseMap.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from './ProgressRing';

/**
 * Bird's-eye overview grid of all courses with progress tiles.
 * @param {object} subject - Subject object with courses array
 * @param {function} onCourseClick - Called with course id
 */
const CourseMap = ({ subject, onCourseClick }) => {
  const { lang, t, checked } = useApp();

  const courses = subject.courses || [];
  if (courses.length === 0) return null;

  // Calculate per-course progress
  const courseProgress = courses.map(course => {
    const total = course.sectionCount || 0;
    const completed = total > 0
      ? Array.from({ length: total }, (_, i) => `${course.id}-${i}`).filter(id => checked[id]).length
      : 0;
    return { course, completed, total };
  });

  // Overall progress
  const totalSections = courseProgress.reduce((sum, cp) => sum + cp.total, 0);
  const totalCompleted = courseProgress.reduce((sum, cp) => sum + cp.completed, 0);
  const overallPercent = totalSections > 0 ? Math.round((totalCompleted / totalSections) * 100) : 0;

  return (
    <div className="mb-8">
      {/* Overall progress bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <div className="flex justify-between mb-1.5">
            <span className="font-bold text-sm" style={{ color: 'var(--theme-content-text)' }}>
              {subject.title[lang]}
            </span>
            <span className="text-xs font-semibold" style={{ color: '#3b82f6' }}>
              {overallPercent}% {t('complete', 'complet')}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
            />
          </div>
        </div>
      </div>

      {/* Course tiles grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {courseProgress.map(({ course, completed, total }) => {
          const isComplete = total > 0 && completed >= total;
          const hasProgress = completed > 0;

          // Tile background color
          let tileBg, tileBorder;
          if (isComplete) {
            tileBg = '#f0fdf4'; tileBorder = '#bbf7d0';
          } else if (hasProgress) {
            tileBg = '#eff6ff'; tileBorder = '#bfdbfe';
          } else {
            tileBg = 'var(--theme-card-bg)'; tileBorder = 'var(--theme-border)';
          }

          return (
            <button
              key={course.id}
              onClick={() => onCourseClick(course.id)}
              className="text-center p-3 rounded-xl cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-md"
              style={{
                backgroundColor: tileBg,
                border: `1.5px solid ${tileBorder}`,
                opacity: !hasProgress && !isComplete ? 0.6 : 1,
              }}
            >
              <div className="flex justify-center mb-1.5">
                <ProgressRing size={40} completed={completed} total={total} />
              </div>
              <div
                className="font-bold text-xs"
                style={{ color: isComplete ? '#16a34a' : hasProgress ? '#2563eb' : 'var(--theme-muted-text)' }}
              >
                {course.shortTitle[lang].split(':')[0]}
              </div>
              <div className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--theme-muted-text)' }}>
                {course.shortTitle[lang].split(':').slice(1).join(':').trim() || course.shortTitle[lang]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CourseMap;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/CourseMap.jsx
git commit -m "feat: add CourseMap dashboard with progress tiles"
```

---

## Task 12: Redesign Sidebar with Progress Rings

**Files:**
- Modify: `src/components/layout/Sidebar.jsx`

- [ ] **Step 1: Rewrite Sidebar**

Replace `src/components/layout/Sidebar.jsx` entirely:

```jsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from '../ui/ProgressRing';

const Sidebar = ({ subject, activeCourseId, open, onClose, onCourseClick }) => {
  const { lang, t, checked } = useApp();

  if (!subject || !subject.courses?.length) return null;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          w-60 h-screen overflow-y-auto
          p-3 text-sm
          transition-all duration-200
          lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          backgroundColor: 'var(--theme-sidebar-bg)',
          borderRight: '1px solid var(--theme-sidebar-border)',
        }}
      >
        <div className="lg:hidden flex justify-end mb-2">
          <button
            onClick={onClose}
            className="p-1 rounded transition"
            style={{ backgroundColor: 'var(--theme-hover-bg)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-0.5">
          {subject.courses.map(course => {
            const total = course.sectionCount || 0;
            const completed = total > 0
              ? Array.from({ length: total }, (_, i) => `${course.id}-${i}`).filter(id => checked[id]).length
              : 0;
            const isActive = activeCourseId === course.id;
            const isComplete = total > 0 && completed >= total;
            const hasProgress = completed > 0;

            return (
              <button
                key={course.id}
                className="flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-150 w-full text-left"
                style={{
                  backgroundColor: isActive ? 'var(--theme-hover-bg)' : 'transparent',
                  borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                }}
                onClick={() => { onCourseClick?.(course.id); onClose(); }}
              >
                <ProgressRing
                  size={20}
                  completed={completed}
                  total={total}
                  isActive={isActive}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs truncate"
                    style={{
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#3b82f6' : (isComplete ? '#16a34a' : 'var(--theme-content-text)'),
                      opacity: !hasProgress && !isActive ? 0.5 : 1,
                    }}
                  >
                    {course.shortTitle[lang]}
                  </div>
                  {total > 0 && (
                    <div className="text-[10px]" style={{ color: isComplete ? '#22c55e' : 'var(--theme-muted-text)' }}>
                      {isComplete ? t('Complete', 'Complet') : `${completed}/${total}`}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Sidebar.jsx
git commit -m "feat: redesign Sidebar with progress rings and theme colors"
```

---

## Task 13: Integrate Everything into SubjectPage

**Files:**
- Modify: `src/pages/SubjectPage.jsx`

This is the largest task — wiring ContentTypeBar, Breadcrumbs, CourseMap, ReadingProgress, and CourseNavigation into the existing SubjectPage.

- [ ] **Step 1: Rewrite SubjectPage**

Replace `src/pages/SubjectPage.jsx` entirely:

```jsx
import React, { Suspense, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getSubject } from '../content/registry';
import Sidebar from '../components/layout/Sidebar';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import ContentTypeBar from '../components/ui/ContentTypeBar';
import CourseMap from '../components/ui/CourseMap';
import ReadingProgress from '../components/ui/ReadingProgress';
import CourseNavigation from '../components/ui/CourseNavigation';
import { CourseBlock } from '../components/ui';

function PracticeTab({ practice: LazyPractice }) {
  return <LazyPractice />;
}

const LoadingFallback = () => {
  const { t } = useApp();
  return <div className="animate-pulse p-4 text-sm opacity-50">{t('Loading...', 'Se încarcă...')}</div>;
};

export default function SubjectPage({ sidebarOpen, setSidebarOpen }) {
  const { yearSem, subject: subjectSlug, '*': wildcard } = useParams();
  const navigate = useNavigate();
  const { lang, t, search, setSearch, checked } = useApp();
  const subject = getSubject(subjectSlug);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [courseSearchStates, setCourseSearchStates] = useState({});
  const coursesRef = useRef(null);

  const searchActive = search && search.length >= 2;

  // Reset activeCourseId after scroll so the same course can be clicked again
  useEffect(() => {
    if (activeCourseId) {
      const timer = setTimeout(() => setActiveCourseId(null), 500);
      return () => clearTimeout(timer);
    }
  }, [activeCourseId]);

  // Two-phase content search
  useEffect(() => {
    if (!searchActive || !subject) {
      setCourseSearchStates({});
      if (CSS.highlights) CSS.highlights.delete('search-results');
      return;
    }

    const timer = setTimeout(() => {
      if (!coursesRef.current) return;
      const query = search.toLowerCase();
      const newStates = {};
      const allRanges = [];

      for (const course of subject.courses) {
        const el = document.getElementById(course.id);
        if (!el) { newStates[course.id] = 'no-match'; continue; }

        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let hasMatch = false;

        while (walker.nextNode()) {
          const node = walker.currentNode;
          const text = node.textContent.toLowerCase();
          let pos = 0;
          while (pos < text.length) {
            const idx = text.indexOf(query, pos);
            if (idx === -1) break;
            hasMatch = true;
            const range = new Range();
            range.setStart(node, idx);
            range.setEnd(node, idx + search.length);
            allRanges.push(range);
            pos = idx + search.length;
          }
        }
        newStates[course.id] = hasMatch ? 'match' : 'no-match';
      }

      setCourseSearchStates(newStates);

      if (CSS.highlights) {
        CSS.highlights.delete('search-results');
        if (allRanges.length > 0) {
          CSS.highlights.set('search-results', new Highlight(...allRanges));
          const el = allRanges[0].startContainer.parentElement;
          if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, searchActive, subject]);

  const tab = ['seminars', 'labs', 'practice', 'tests'].includes(wildcard) ? wildcard : 'courses';

  if (!subject) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg opacity-60">{t('Subject not found', 'Materia nu a fost găsită')}</p>
      </div>
    );
  }

  const handleTabChange = (tabId) => {
    if (tabId === 'courses') {
      navigate(`/${yearSem}/${subjectSlug}`);
    } else {
      navigate(`/${yearSem}/${subjectSlug}/${tabId}`);
    }
  };

  const handleCourseClick = (courseId) => {
    setActiveCourseId(courseId);
    // Scroll to the course block
    const el = document.getElementById(courseId);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  // Find active course index for prev/next navigation
  const activeCourseIndex = activeCourseId
    ? subject.courses.findIndex(c => c.id === activeCourseId)
    : -1;

  // Get the currently open course (for reading progress + breadcrumbs)
  const openCourse = activeCourseId
    ? subject.courses.find(c => c.id === activeCourseId)
    : null;

  // Determine if we should show the course map (Courses tab, no search active)
  const showCourseMap = tab === 'courses' && !searchActive && subject.courses.length > 0;

  return (
    <div className="flex flex-col flex-1">
      {/* Content type bar */}
      <ContentTypeBar subject={subject} activeTab={tab} onTabChange={handleTabChange} />

      {/* Breadcrumbs */}
      <Breadcrumbs
        yearSem={yearSem}
        subject={subject}
        tab={tab}
        activeItemTitle={openCourse ? openCourse.shortTitle[lang] : undefined}
      />

      <div className="flex flex-1">
        {/* Sidebar — only show on courses tab */}
        {tab === 'courses' && subject.courses.length > 0 && (
          <Sidebar
            subject={subject}
            activeCourseId={activeCourseId}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onCourseClick={handleCourseClick}
          />
        )}

        <main className="flex-1 max-w-5xl mx-auto p-4 lg:p-8 min-h-[calc(100vh-120px)]">
          {/* Courses tab */}
          {tab === 'courses' && (
            <>
              {/* Course map dashboard (when no search) */}
              {showCourseMap && (
                <CourseMap subject={subject} onCourseClick={handleCourseClick} />
              )}

              {/* Search input */}
              <input
                type="text"
                placeholder={t('Search across all content...', 'Caută în tot conținutul...')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full p-3 mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  border: '1px solid var(--theme-border)',
                  color: 'var(--theme-content-text)',
                }}
              />

              {subject.courses.length === 0 ? (
                <div className="text-center py-12 opacity-60">
                  <p className="text-4xl mb-4">{subject.icon}</p>
                  <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                  <p className="text-sm mt-2">{t('Course content will be added here.', 'Conținutul cursurilor va fi adăugat aici.')}</p>
                </div>
              ) : (
                <div ref={coursesRef}>
                  {subject.courses.map((course, index) => {
                    const CourseContent = course.component;
                    const isOpen = activeCourseId === course.id || courseSearchStates[course.id] === 'match';
                    return (
                      <CourseBlock
                        key={course.id}
                        title={course.title[lang]}
                        id={course.id}
                        forceOpen={activeCourseId === course.id}
                        searchState={courseSearchStates[course.id]}
                      >
                        {/* Reading progress (shown when course is open) */}
                        {course.sectionCount > 0 && (
                          <ReadingProgress courseId={course.id} sectionCount={course.sectionCount} />
                        )}
                        <Suspense fallback={<LoadingFallback />}>
                          <CourseContent />
                        </Suspense>
                        {/* Prev/Next navigation */}
                        <CourseNavigation
                          items={subject.courses}
                          currentIndex={index}
                          onNavigate={handleCourseClick}
                        />
                      </CourseBlock>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Seminars tab */}
          {tab === 'seminars' && subject.seminars && (
            <div>
              {subject.seminars.length === 0 ? (
                <div className="text-center py-12 opacity-60">
                  <p className="text-4xl mb-4">{subject.icon}</p>
                  <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                </div>
              ) : (
                subject.seminars.map(sem => {
                  const SemContent = sem.component;
                  return (
                    <CourseBlock key={sem.id} title={sem.title[lang]} id={sem.id}>
                      <Suspense fallback={<LoadingFallback />}>
                        <SemContent />
                      </Suspense>
                    </CourseBlock>
                  );
                })
              )}
            </div>
          )}

          {/* Labs tab */}
          {tab === 'labs' && subject.labs && (
            <div>
              {subject.labs.length === 0 ? (
                <div className="text-center py-12 opacity-60">
                  <p className="text-4xl mb-4">{subject.icon}</p>
                  <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                </div>
              ) : (
                subject.labs.map(lab => {
                  const LabContent = lab.component;
                  return (
                    <CourseBlock key={lab.id} title={lab.title[lang]} id={lab.id}>
                      <Suspense fallback={<LoadingFallback />}>
                        <LabContent />
                      </Suspense>
                    </CourseBlock>
                  );
                })
              )}
            </div>
          )}

          {/* Practice tab */}
          {tab === 'practice' && (
            <Suspense fallback={<LoadingFallback />}>
              <PracticeTab practice={subject.practice} />
            </Suspense>
          )}

          {/* Tests tab */}
          {tab === 'tests' && subject.tests && (
            <div>
              {subject.tests.map(test => {
                const TestContent = test.component;
                return (
                  <CourseBlock key={test.id} title={test.title[lang]} id={test.id}>
                    <Suspense fallback={<LoadingFallback />}>
                      <TestContent />
                    </Suspense>
                  </CourseBlock>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Remove old "← All subjects" button and TabBar import**

The new SubjectPage no longer imports `TabBar` or renders the old back button. Verify the file has no references to `TabBar` (it's replaced by `ContentTypeBar`) and no `← All subjects` button (replaced by breadcrumbs).

- [ ] **Step 3: Verify full integration**

Run: `npm run dev`
Expected:
- Home page loads normally
- Navigate to OS → see course map dashboard with progress tiles
- See ContentTypeBar below top bar (Courses, Solved Exercises, Exercises, Practice, Tests)
- See breadcrumbs: Home / Y1 S2 / Operating Systems / Courses
- Click a course tile → course opens, reading progress bar appears, sidebar shows progress rings
- Prev/next navigation appears at bottom of each course
- Switch to Seminars tab → sidebar hides, seminars list shows
- Use subject switcher in top bar to jump to PA
- Switch palettes with 🎨 → all colors update

- [ ] **Step 4: Commit**

```bash
git add src/pages/SubjectPage.jsx
git commit -m "feat: integrate ContentTypeBar, Breadcrumbs, CourseMap, ReadingProgress, CourseNavigation into SubjectPage"
```

---

## Task 14: Update Home Page Theming

**Files:**
- Modify: `src/pages/Home.jsx`

- [ ] **Step 1: Update Home page to use theme variables**

Update `src/pages/Home.jsx` to use theme CSS variables for borders and backgrounds:

```jsx
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { yearSemesters, subjects } from '../content/registry';
import SubjectCard from '../components/ui/SubjectCard';

export default function Home() {
  const { lang, t } = useApp();

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('University Study Guide', 'Ghid Universitar de Studiu')}
        </h2>
        <p className="text-lg" style={{ color: 'var(--theme-muted-text)' }}>
          {t('Select a subject to start studying', 'Selectează o materie pentru a începe studiul')}
        </p>
      </div>

      {yearSemesters.map(ys => (
        <div key={ys.id} className="mb-12">
          <h3
            className="text-xl font-bold mb-5 pb-2 flex items-center gap-2"
            style={{ borderBottom: '1px solid var(--theme-border)' }}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {ys.title[lang]}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ys.subjects.map(slug => {
              const subject = subjects.find(s => s.slug === slug);
              return subject ? <SubjectCard key={slug} subject={subject} /> : null;
            })}
          </div>
        </div>
      ))}

      <footer className="mt-20 pt-6 text-center text-sm opacity-40" style={{ borderTop: '1px solid var(--theme-border)' }}>
        <p>{t('Based on lectures at UAIC (2026)', 'Bazat pe cursurile de la UAIC (2026)')}</p>
      </footer>
    </main>
  );
}
```

- [ ] **Step 2: Update SubjectCard to use theme variables**

Update `src/components/ui/SubjectCard.jsx`:

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const SubjectCard = ({ subject }) => {
  const navigate = useNavigate();
  const { lang, t } = useApp();
  const hasCourses = subject.courses.length > 0;

  return (
    <div
      onClick={() => navigate(`/${subject.yearSemester}/${subject.slug}`)}
      className="rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group"
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        border: '1px solid var(--theme-border)',
      }}
    >
      <div className="text-3xl mb-3">{subject.icon}</div>
      <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors"
        style={{ color: 'var(--theme-content-text)' }}
      >
        {subject.title[lang]}
      </h3>
      <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--theme-muted-text)' }}>
        {subject.description[lang]}
      </p>
      <div className="text-xs font-medium">
        {hasCourses ? (
          <span className="inline-flex items-center gap-1.5 text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {subject.courses.length} {t('courses', 'cursuri')}
          </span>
        ) : (
          <span style={{ color: 'var(--theme-muted-text)' }} className="italic">{t('Coming soon', 'În curând')}</span>
        )}
      </div>
    </div>
  );
};

export default SubjectCard;
```

- [ ] **Step 3: Verify Home page theming**

Run: `npm run dev`
Expected: Home page renders with correct palette colors. Switch palettes via 🎨 → cards, borders, text all update. Toggle dark mode → all colors flip correctly.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.jsx src/components/ui/SubjectCard.jsx
git commit -m "feat: update Home page and SubjectCard to use theme CSS variables"
```

---

## Task 15: Update CourseBlock Theming

**Files:**
- Modify: `src/components/ui/CourseBlock.jsx`

- [ ] **Step 1: Update CourseBlock to use theme variables**

Replace `src/components/ui/CourseBlock.jsx`:

```jsx
import React, { useState, useEffect, useRef } from 'react';

const CourseBlock = ({ title, id, children, forceOpen, searchState }) => {
  const [userOpen, setUserOpen] = useState(false);
  const ref = useRef(null);

  const open = searchState ? searchState === 'match' : userOpen;

  useEffect(() => {
    if (forceOpen) {
      setUserOpen(true);
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, [forceOpen]);

  return (
    <div
      ref={ref}
      className="mb-4 rounded-xl overflow-hidden transition-shadow hover:shadow-md"
      style={{ border: '2px solid var(--theme-border)' }}
      id={id}
    >
      <div
        className="p-4 cursor-pointer font-bold text-lg transition-colors"
        style={{ color: 'var(--theme-content-text)' }}
        onClick={() => { if (!searchState) setUserOpen(!userOpen); }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-hover-bg)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span className="mr-2">{open ? '▾' : '▸'}</span>{title}
      </div>
      <div
        className={`p-4 ${open ? '' : 'hidden'}`}
        style={{ borderTop: '1px solid var(--theme-border)' }}
      >
        {children}
      </div>
    </div>
  );
};

export default CourseBlock;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/CourseBlock.jsx
git commit -m "feat: update CourseBlock to use theme CSS variables"
```

---

## Task 16: Clean Up Unused TabBar & Update Exports

**Files:**
- Modify: `src/components/ui/index.js`

- [ ] **Step 1: Update ui/index.js exports**

Read the current `src/components/ui/index.js` and add exports for all new components. Remove the TabBar export if it's there (TabBar file can stay for backward compatibility but SubjectPage no longer imports it directly).

Add these exports:

```js
export { default as ProgressRing } from './ProgressRing';
export { default as PalettePicker } from './PalettePicker';
export { default as ContentTypeBar } from './ContentTypeBar';
export { default as CourseMap } from './CourseMap';
export { default as ReadingProgress } from './ReadingProgress';
export { default as CourseNavigation } from './CourseNavigation';
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/index.js
git commit -m "feat: export new UI components from ui/index.js"
```

---

## Task 17: End-to-End Verification

- [ ] **Step 1: Full navigation flow test**

Run: `npm run dev`

Test the following flow:
1. Load Home page → verify themed colors
2. Click OS subject card → see course map dashboard with progress tiles
3. Verify ContentTypeBar shows: Courses, Solved Exercises, Exercises, Practice, Tests
4. Verify breadcrumbs show: Home / Anul 1, Semestrul 2 / Sisteme de Operare / Cursuri
5. Click a course tile in course map → course opens, sidebar shows course list with progress rings
6. Check off a section inside the course → verify:
   - Reading progress bar updates (segment turns green)
   - Sidebar ring fills slightly
   - Course map tile updates (if scrolled up)
7. Scroll to bottom of course → see prev/next navigation
8. Click "Next" → next course opens
9. Switch to Seminars tab → sidebar disappears, seminars list shows
10. Use subject switcher in top bar → navigate to PA
11. Use breadcrumbs → navigate back to Home

- [ ] **Step 2: Theme switching test**

1. Click 🎨 icon → popover with 5 color circles appears
2. Click each palette → verify all UI elements update (nav, sidebar, content, cards)
3. Toggle dark mode → verify colors switch correctly
4. Refresh page → verify palette and dark mode persist

- [ ] **Step 3: Mobile responsiveness test**

Open browser DevTools, switch to mobile viewport (~375px wide):
1. Sidebar should be hidden by default
2. Hamburger icon should toggle sidebar overlay
3. Course map should show 2 columns
4. ContentTypeBar should scroll horizontally if needed
5. Breadcrumbs should not wrap (scroll)

- [ ] **Step 4: Build verification**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Final commit and push**

```bash
git add -A
git commit -m "feat: complete UI redesign — navigation, progress feedback, theme system"
git push
```
