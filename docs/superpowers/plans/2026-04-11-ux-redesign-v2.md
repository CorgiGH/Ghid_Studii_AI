# UX Redesign v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the "AI-generated" look through cumulative improvements across 4 phases: visual foundation, navigation, progress, and test features.

**Architecture:** Phased bottom-up approach. Phase 1 (typography, width, dark mode, skeletons) is pure CSS/config. Phase 2 (navigation) adds hooks and components. Phase 3 (progress) enhances existing components. Phase 4 (tests) adds new features. All work on local main branch with commits at each step.

**Tech Stack:** React 19, Vite 8, Tailwind CSS v4, CSS custom properties, localStorage

**Spec:** `docs/superpowers/specs/2026-04-11-ux-redesign-v2-design.md`

**Research:** `docs/superpowers/specs/2026-04-11-ux-redesign-research.md`

---

## Phase 1: Visual Foundation

### Task 1: Typography System — CSS Custom Properties

**Files:**
- Modify: `src/index.css`

This task adds a typography scale as CSS custom properties so all components can reference consistent sizes. No component changes yet — just the foundation.

- [ ] **Step 1: Add typography custom properties to src/index.css**

Add after the existing `:root` defaults (after line 64) in `src/index.css`:

```css
/* Typography scale — from research §7 (Tailwind prose, Material Design 3, Apple HIG consensus) */
:root {
  --type-body: 1rem;           /* 16px */
  --type-body-lh: 1.5;        /* 24px */
  --type-h1: clamp(1.75rem, 1.583rem + 0.833vw, 2.25rem); /* 28-36px responsive */
  --type-h1-lh: 1.11;
  --type-h1-weight: 800;
  --type-h2: 1.5rem;          /* 24px */
  --type-h2-lh: 1.33;
  --type-h2-weight: 700;
  --type-h3: 1.25rem;         /* 20px */
  --type-h3-lh: 1.6;
  --type-h3-weight: 600;
  --type-h4: 1rem;            /* 16px */
  --type-h4-lh: 1.5;
  --type-h4-weight: 600;
  --type-code: 0.875rem;      /* 14px */
  --type-code-lh: 1.6;
  --content-max-width: 768px; /* Vercel Docs standard — research §7 */
}
```

- [ ] **Step 2: Add dark mode text smoothing to src/index.css**

Add after the typography variables:

```css
/* Dark mode text rendering — research §8 */
.dark {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: 0.01em;
}
```

- [ ] **Step 3: Verify dev server loads without errors**

Run: `npm run dev`
Open browser, confirm app loads. Check DevTools → Elements → `:root` to confirm new CSS variables are present.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat(ux): add typography scale CSS custom properties"
```

---

### Task 2: Apply Typography to Components

**Files:**
- Modify: `src/components/ui/Section.jsx:61-63` (section title)
- Modify: `src/components/blocks/CourseRenderer.jsx:223-227` (step title)
- Modify: `src/components/ui/CourseBlock.jsx:110` (course block title)
- Modify: `src/pages/SubjectPage.jsx:215` (content width + font size)

This task applies the typography scale to existing components that currently use `text-lg` for everything.

- [ ] **Step 1: Update Section component title to use H3 scale**

In `src/components/ui/Section.jsx`, the title span at ~line 61 currently uses `font-semibold` with conditional green color. Update the title styling to use the H3 typography scale:

Change the `<span>` that renders the title text. Replace the classes on the title span from `font-semibold` to use CSS variables:

```jsx
<span
  className={checked ? 'line-through opacity-70' : ''}
  style={{
    fontSize: 'var(--type-h3)',
    lineHeight: 'var(--type-h3-lh)',
    fontWeight: 'var(--type-h3-weight)',
    color: checked ? '#16a34a' : 'var(--theme-content-text)'
  }}
>
  {title}
</span>
```

- [ ] **Step 2: Update CourseRenderer step title to use H2 scale**

In `src/components/blocks/CourseRenderer.jsx`, the step title at ~line 223-227 currently uses `text-lg font-bold`. Update to H2 scale:

```jsx
<h2
  style={{
    fontSize: 'var(--type-h2)',
    lineHeight: 'var(--type-h2-lh)',
    fontWeight: 'var(--type-h2-weight)',
    color: 'var(--theme-content-text)',
    marginTop: '0.5rem',
    marginBottom: '1.5rem'
  }}
>
  {stepTitle}
</h2>
```

- [ ] **Step 3: Update CourseBlock title to use H2 scale**

In `src/components/ui/CourseBlock.jsx`, the title at ~line 110 currently uses `font-bold text-lg`. Update:

```jsx
<span
  style={{
    fontSize: 'var(--type-h2)',
    lineHeight: 'var(--type-h2-lh)',
    fontWeight: 'var(--type-h2-weight)',
    color: 'inherit'
  }}
>
  {title}
</span>
```

- [ ] **Step 4: Update SubjectPage content width and font size**

In `src/pages/SubjectPage.jsx`, line 215 currently has `max-w-5xl` and inline `fontSize: '1.05rem'`. Update:

```jsx
<main
  ref={contentRef}
  className="flex-1 flex flex-col mx-auto p-4 lg:p-8"
  style={{
    maxWidth: 'var(--content-max-width)',
    fontSize: 'var(--type-body)',
    lineHeight: 'var(--type-body-lh)'
  }}
>
```

- [ ] **Step 5: Verify typography changes in browser**

Run dev server. Navigate to any OS course. Confirm:
- Section headings are visibly larger than body text (20px vs 16px)
- Step titles are larger than section headings (24px vs 20px)
- Content column is narrower (~768px vs previous 1024px)
- Text is 16px with 24px line-height
- On mobile (resize to 375px), H1-level elements clamp down

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Section.jsx src/components/blocks/CourseRenderer.jsx src/components/ui/CourseBlock.jsx src/pages/SubjectPage.jsx
git commit -m "feat(ux): apply typography scale to headings and content width"
```

---

### Task 3: Dark Mode Three-State Toggle

**Files:**
- Modify: `src/contexts/AppContext.jsx:40,132` (state + toggle logic)
- Modify: `src/components/layout/AppShell.jsx:10` (dark class application)
- Modify: `src/components/layout/TopBar.jsx:115-130` (toggle UI)
- Modify: `index.html` (FOUC prevention script)

- [ ] **Step 1: Update AppContext dark state from boolean to three-state**

In `src/contexts/AppContext.jsx`, change line 40 from:

```jsx
const [dark, setDark] = useLocalStorage('dark', true);
```

to:

```jsx
const [themeMode, setThemeMode] = useLocalStorage('themeMode', 'system');
```

Add a derived `dark` boolean after the state declaration:

```jsx
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
```

- [ ] **Step 2: Update toggleDark to cycle through three states**

Replace the `toggleDark` callback (line 132) with:

```jsx
const cycleTheme = useCallback(() => {
  setThemeMode(m => m === 'light' ? 'dark' : m === 'dark' ? 'system' : 'light');
}, []);
```

Update the context value to expose both `dark` (boolean), `themeMode`, and `cycleTheme`:

```jsx
value={{ dark, themeMode, cycleTheme, /* ...rest unchanged */ }}
```

Remove the old `toggleDark` from the context value and replace all references.

- [ ] **Step 3: Migrate localStorage from 'dark' boolean to 'themeMode' string**

Add a migration at the top of AppContext (near existing migrations around lines 8-37):

```jsx
// Migrate dark boolean → themeMode string
const rawDark = localStorage.getItem('dark');
if (rawDark !== null && !localStorage.getItem('themeMode')) {
  localStorage.setItem('themeMode', JSON.parse(rawDark) ? 'dark' : 'light');
  localStorage.removeItem('dark');
}
```

- [ ] **Step 4: Update AppShell.jsx dark class**

In `src/components/layout/AppShell.jsx`, the `dark` boolean from context is still a boolean, so the existing `className={dark ? 'dark' : ''}` at line 10 should continue to work. Verify it destructures `dark` from `useApp()`.

- [ ] **Step 5: Update TopBar toggle UI**

In `src/components/layout/TopBar.jsx`, replace the dark mode toggle button (~line 115-130) with a three-state button:

```jsx
<button
  onClick={cycleTheme}
  className="p-2 rounded-lg transition-colors"
  style={{ color: 'var(--theme-nav-text)' }}
  title={themeMode === 'light' ? 'Light mode' : themeMode === 'dark' ? 'Dark mode' : 'System mode'}
>
  {themeMode === 'light' ? '☀️' : themeMode === 'dark' ? '🌙' : '💻'}
</button>
```

Update the destructured imports from `useApp()` in TopBar to include `themeMode` and `cycleTheme` instead of `dark` and `toggleDark`.

- [ ] **Step 6: Add FOUC prevention script to index.html**

In `index.html`, add this blocking script inside `<head>`, before the closing `</head>` tag:

```html
<script>
(function(){
  var raw = localStorage.getItem('themeMode');
  var mode = raw ? JSON.parse(raw) : 'system';
  var dark = mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) document.documentElement.classList.add('dark');
})();
</script>
```

- [ ] **Step 7: Find and update all toggleDark references**

Search for `toggleDark` across the codebase. Replace all references with `cycleTheme`. The main locations are:
- `src/contexts/AppContext.jsx` (definition — already updated)
- `src/components/layout/TopBar.jsx` (already updated)
- Any other component that imports `toggleDark` from context

- [ ] **Step 8: Verify three-state toggle in browser**

Run dev server. Test:
1. Click the theme toggle — cycles Light → Dark → System
2. In System mode, change OS dark mode setting — app follows
3. Refresh page — theme persists without flash (FOUC prevention)
4. Check that existing users with `dark: true` in localStorage get migrated to `themeMode: "dark"`

- [ ] **Step 9: Commit**

```bash
git add src/contexts/AppContext.jsx src/components/layout/AppShell.jsx src/components/layout/TopBar.jsx index.html
git commit -m "feat(ux): three-state dark mode toggle (light/dark/system) with FOUC prevention"
```

---

### Task 4: Skeleton Shimmer

**Files:**
- Modify: `src/index.css` (shimmer keyframes + utility class)
- Modify: `src/components/blocks/BlockRenderer.jsx` (replace animate-pulse)
- Modify: `src/components/blocks/CourseRenderer.jsx:120` (replace animate-pulse)
- Modify: `src/components/blocks/test/TestRenderer.jsx` (replace animate-pulse)
- Modify: `src/pages/SubjectPage.jsx:24` (LoadingFallback)
- Modify: `src/components/ui/TestsTab.jsx` (loading fallback)

- [ ] **Step 1: Add shimmer keyframes and utility class to src/index.css**

Add after the dark mode text smoothing rules:

```css
/* Skeleton shimmer — research §11 */
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-shimmer {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  background-attachment: fixed;
  border-radius: 6px;
}

.dark .skeleton-shimmer {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  background-attachment: fixed;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
}
```

- [ ] **Step 2: Replace animate-pulse in BlockRenderer.jsx**

In `src/components/blocks/BlockRenderer.jsx`, find the Suspense fallback that uses `animate-pulse`. Replace `className="animate-pulse h-8 rounded"` with `className="skeleton-shimmer h-8"`. Remove the inline `backgroundColor` style since the shimmer class handles it.

- [ ] **Step 3: Replace animate-pulse in CourseRenderer.jsx**

In `src/components/blocks/CourseRenderer.jsx` at ~line 120, replace `className="animate-pulse p-4 text-sm opacity-50"` with `className="skeleton-shimmer h-32"`. Remove the text content from the loading state — shimmer replaces text.

- [ ] **Step 4: Replace animate-pulse in TestRenderer.jsx**

In `src/components/blocks/test/TestRenderer.jsx`, find the loading fallback. Replace `animate-pulse` with `skeleton-shimmer` class. Adjust height to match expected test content (~h-48).

- [ ] **Step 5: Replace animate-pulse in SubjectPage LoadingFallback**

In `src/pages/SubjectPage.jsx` at ~line 24, the `LoadingFallback` component uses `animate-pulse`. Replace with shimmer. Create a content-shaped skeleton:

```jsx
const LoadingFallback = () => (
  <div className="p-4 lg:p-8 space-y-4" style={{ maxWidth: 'var(--content-max-width)' }}>
    <div className="skeleton-shimmer h-8 w-3/4" />
    <div className="skeleton-shimmer h-4 w-full" />
    <div className="skeleton-shimmer h-4 w-5/6" />
    <div className="skeleton-shimmer h-4 w-2/3" />
    <div className="skeleton-shimmer h-32 w-full mt-4" />
  </div>
);
```

- [ ] **Step 6: Replace animate-pulse in TestsTab.jsx**

In `src/components/ui/TestsTab.jsx`, find the loading fallback. Replace `animate-pulse` with `skeleton-shimmer`.

- [ ] **Step 7: Verify shimmer in browser**

Run dev server. Force a slow load (throttle network in DevTools to Slow 3G). Navigate between courses. Confirm:
- Shimmer gradient sweeps left-to-right across all loading states
- All shimmer bars are synchronized (background-attachment: fixed)
- Dark mode shimmer uses darker gradient
- No remaining `animate-pulse` visible in loading states

- [ ] **Step 8: Commit**

```bash
git add src/index.css src/components/blocks/BlockRenderer.jsx src/components/blocks/CourseRenderer.jsx src/components/blocks/test/TestRenderer.jsx src/pages/SubjectPage.jsx src/components/ui/TestsTab.jsx
git commit -m "feat(ux): replace animate-pulse with synchronized shimmer skeletons"
```

---

## Phase 2: Navigation & Wayfinding

### Task 5: Hide-on-Scroll Header Hook

**Files:**
- Create: `src/hooks/useHideOnScroll.js`

- [ ] **Step 1: Create the useHideOnScroll hook**

Create `src/hooks/useHideOnScroll.js`:

```jsx
import { useState, useEffect, useRef } from 'react';

/**
 * Hides element on scroll down, shows on scroll up.
 * Returns `hidden` boolean. Research §6: Medium/Twitter/YouTube pattern.
 */
export default function useHideOnScroll(headerHeight = 60) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const DELTA = 5;

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (Math.abs(y - lastY.current) < DELTA) return;
      if (y <= 0) {
        setHidden(false);
      } else if (y > lastY.current && y > headerHeight) {
        setHidden(true);
      } else if (y < lastY.current) {
        setHidden(false);
      }
      lastY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [headerHeight]);

  return hidden;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useHideOnScroll.js
git commit -m "feat(ux): add useHideOnScroll hook"
```

---

### Task 6: Apply Hide-on-Scroll to TopBar

**Files:**
- Modify: `src/components/layout/TopBar.jsx:44-48` (add transform)
- Modify: `src/components/ui/InlineProgress.jsx:138` (offset top when header hidden)
- Modify: `src/components/blocks/CourseRenderer.jsx` (sticky header offset)

- [ ] **Step 1: Import and use useHideOnScroll in TopBar**

In `src/components/layout/TopBar.jsx`, import the hook:

```jsx
import useHideOnScroll from '../../hooks/useHideOnScroll';
```

Inside the component, call it:

```jsx
const hidden = useHideOnScroll(60);
```

Update the outer div's style (~line 44-48) to add the transform:

```jsx
style={{
  backgroundColor: 'var(--theme-nav-bg)',
  color: 'var(--theme-nav-text)',
  transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
  transition: 'transform 0.2s ease-in-out',
  willChange: 'transform'
}}
```

- [ ] **Step 2: Publish hidden state via CSS variable**

In the TopBar's ResizeObserver callback (or alongside the `--topbar-height` publication at ~line 35), also publish the hidden state so other sticky elements can respond:

```jsx
document.documentElement.style.setProperty(
  '--topbar-offset',
  hidden ? '0px' : `${topBarHeight}px`
);
```

Update InlineProgress and CourseRenderer sticky headers to use `var(--topbar-offset)` for their `top` value instead of reading `--topbar-height` directly.

- [ ] **Step 3: Update InlineProgress sticky top**

In `src/components/ui/InlineProgress.jsx` at ~line 138, change the `top` style from `${topBarHeight}px` to use the CSS variable:

```jsx
style={{ top: 'var(--topbar-offset, 0px)' }}
```

- [ ] **Step 4: Update CourseRenderer sticky header top**

In `src/components/blocks/CourseRenderer.jsx`, the sticky progress header uses `top: ${topBarHeight}px`. Change to:

```jsx
style={{ top: 'var(--topbar-offset, 0px)' }}
```

- [ ] **Step 5: Verify hide-on-scroll in browser**

Run dev server. Navigate to a long OS course. Test:
1. Scroll down slowly — header hides after passing header height
2. Scroll up any amount — header shows
3. At page top — header always visible
4. InlineProgress and CourseRenderer sticky headers shift up when TopBar hides
5. Transition is smooth (0.2s ease-in-out)

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/TopBar.jsx src/components/ui/InlineProgress.jsx src/components/blocks/CourseRenderer.jsx
git commit -m "feat(ux): hide-on-scroll header with coordinated sticky offsets"
```

---

### Task 7: Deep Linking to Sections

**Files:**
- Modify: `src/index.css` (scroll-margin-top)
- Modify: `src/components/ui/Section.jsx` (anchor link icon)
- Create: `src/hooks/useScrollToHash.js`
- Modify: `src/components/blocks/CourseRenderer.jsx` (use scroll-to-hash on mount)

- [ ] **Step 1: Add scroll-margin-top CSS rule**

In `src/index.css`, add:

```css
/* Deep linking offset — research §9 */
[id] {
  scroll-margin-top: calc(var(--topbar-offset, 60px) + 1rem);
}
```

- [ ] **Step 2: Create useScrollToHash hook**

Create `src/hooks/useScrollToHash.js`:

```jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to the element matching location.hash on mount/hash change.
 * HashRouter: location.hash is the part after the second #.
 */
export default function useScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    // Delay to allow content to render
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 300);
    return () => clearTimeout(timer);
  }, [hash]);
}
```

- [ ] **Step 3: Add copy-link anchor to Section component**

In `src/components/ui/Section.jsx`, add a hover-revealed `#` link next to the title. Import `useLocation` from react-router-dom:

```jsx
import { useLocation } from 'react-router-dom';
```

Inside the component, get the current path:

```jsx
const { pathname } = useLocation();
```

Add a copy-link handler:

```jsx
const copyLink = (e) => {
  e.stopPropagation();
  const url = `${window.location.origin}${window.location.pathname}#${pathname}#${id}`;
  navigator.clipboard.writeText(url);
  // Brief visual feedback
  e.currentTarget.textContent = '✓';
  setTimeout(() => { e.currentTarget.textContent = '#'; }, 2000);
};
```

Add the anchor element to the left of the title inside the section header button, inside a `group` wrapper:

```jsx
<span
  onClick={copyLink}
  className="opacity-0 group-hover:opacity-70 cursor-pointer select-none transition-opacity mr-1"
  style={{ fontSize: 'var(--type-body)', color: 'var(--theme-muted-text)' }}
  title="Copy link"
>
  #
</span>
```

Add `group` to the parent element's className.

- [ ] **Step 4: Use useScrollToHash in CourseRenderer**

In `src/components/blocks/CourseRenderer.jsx`, import and call the hook:

```jsx
import useScrollToHash from '../../hooks/useScrollToHash';
// Inside the component:
useScrollToHash();
```

- [ ] **Step 5: Verify deep linking**

Run dev server. Test:
1. Navigate to `/#/y1s2/os/course/1#os-c1-intro` — page scrolls to that section
2. Hover over any section heading — `#` icon appears on the left
3. Click the `#` — URL is copied, icon briefly shows `✓`
4. Paste the URL in a new tab — scrolls to the correct section

- [ ] **Step 6: Commit**

```bash
git add src/index.css src/hooks/useScrollToHash.js src/components/ui/Section.jsx src/components/blocks/CourseRenderer.jsx
git commit -m "feat(ux): deep linking to sections with copy-link anchors"
```

---

### Task 8: Scroll Spy

**Files:**
- Create: `src/hooks/useScrollSpy.js`
- Modify: `src/components/layout/Sidebar.jsx` (highlight active section)

- [ ] **Step 1: Create useScrollSpy hook**

Create `src/hooks/useScrollSpy.js`:

```jsx
import { useState, useEffect } from 'react';

/**
 * Observes section headings and returns the ID of the currently visible one.
 * Updates URL hash via replaceState (no back-button pollution). Research §9.
 */
export default function useScrollSpy(sectionIds = [], { rootMargin = '-80px 0px -70% 0px', updateHash = true } = {}) {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!sectionIds.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveId(id);
            if (updateHash) {
              const base = window.location.href.split('#').slice(0, 2).join('#');
              window.history.replaceState(null, '', `${base}#${id}`);
            }
            break;
          }
        }
      },
      { rootMargin }
    );

    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds.join(','), rootMargin, updateHash]);

  return activeId;
}
```

- [ ] **Step 2: Integrate scroll spy into Sidebar**

In `src/components/layout/Sidebar.jsx`, the sidebar renders a list of courses with progress rings. Scroll spy needs section-level granularity within the active course. This requires the sidebar to know about section IDs.

Import the hook:

```jsx
import useScrollSpy from '../../hooks/useScrollSpy';
```

The sidebar receives course data as props. When a course is active, collect section IDs from the DOM and pass to the hook:

```jsx
const [sectionIds, setSectionIds] = useState([]);

useEffect(() => {
  // Collect all section IDs currently in the DOM
  const sections = document.querySelectorAll('[data-section-id]');
  setSectionIds(Array.from(sections).map(el => el.id));
}, [activeCourse]);

const activeSection = useScrollSpy(sectionIds);
```

Add a `data-section-id` attribute to the Section component's outer div (in Section.jsx): `data-section-id={id}`.

In the sidebar's course list, visually indicate which section is active by scrolling the sidebar to show a small indicator dot or highlight next to the active course. Since the sidebar shows courses (not individual sections), highlight the currently active course's entry when any of its sections is visible.

- [ ] **Step 3: Auto-scroll sidebar to keep active item visible**

In the Sidebar, when the active section changes, scroll the sidebar to keep the relevant course item visible:

```jsx
const activeCourseRef = useRef(null);

useEffect(() => {
  if (activeCourseRef.current) {
    activeCourseRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}, [activeSection]);
```

Add `ref={isActive ? activeCourseRef : null}` to the active course's list item element.

- [ ] **Step 4: Verify scroll spy**

Run dev server. Navigate to a long OS course. Test:
1. Scroll through sections — URL hash updates to match current section
2. Sidebar highlights the active course
3. Back button doesn't have polluted history (replaceState used)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useScrollSpy.js src/components/layout/Sidebar.jsx src/components/ui/Section.jsx
git commit -m "feat(ux): scroll spy with sidebar highlighting and URL hash sync"
```

---

### Task 9: Mobile Bottom Tab Bar

**Files:**
- Create: `src/components/layout/BottomTabBar.jsx`
- Modify: `src/pages/SubjectPage.jsx` (render BottomTabBar on mobile)
- Modify: `src/index.css` (safe area padding)

- [ ] **Step 1: Create BottomTabBar component**

Create `src/components/layout/BottomTabBar.jsx`:

```jsx
import { useLocation, useNavigate } from 'react-router-dom';

const TABS = [
  { key: 'courses', label: 'Courses', labelRo: 'Cursuri', icon: '📖', iconActive: '📖' },
  { key: 'practice', label: 'Practice', labelRo: 'Practică', icon: '💻', iconActive: '💻' },
  { key: 'tests', label: 'Tests', labelRo: 'Teste', icon: '📋', iconActive: '📋' },
  { key: 'progress', label: 'Progress', labelRo: 'Progres', icon: '📊', iconActive: '📊' },
];

export default function BottomTabBar({ subject, lang, availableTabs }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from current route
  const path = location.pathname;
  const activeTab = TABS.find(t => path.includes(`/${t.key}`))?.key || 'courses';

  const visibleTabs = TABS.filter(t => availableTabs.includes(t.key));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{
        backgroundColor: 'var(--theme-nav-bg)',
        borderTop: '1px solid var(--theme-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="flex justify-around items-center" style={{ height: '64px' }}>
        {visibleTabs.map(tab => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => {
                const base = path.split('/').slice(0, 4).join('/');
                navigate(tab.key === 'courses' ? base : `${base}/${tab.key}`);
              }}
              className="flex flex-col items-center justify-center flex-1 h-full transition-colors"
              style={{ color: isActive ? '#3b82f6' : 'var(--theme-muted-text)' }}
            >
              {isActive && (
                <span
                  className="absolute rounded-full"
                  style={{
                    width: '56px',
                    height: '32px',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    top: '4px',
                    borderRadius: '16px'
                  }}
                />
              )}
              <span className="text-xl relative z-10">{isActive ? tab.iconActive : tab.icon}</span>
              <span
                className="relative z-10"
                style={{
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 400,
                  marginTop: '2px'
                }}
              >
                {lang === 'ro' ? tab.labelRo : tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Add bottom padding and safe-area CSS**

In `src/index.css`, add:

```css
/* Bottom tab bar safe area — research §5 */
@media (max-width: 1023px) {
  body {
    padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  }
}
```

- [ ] **Step 3: Render BottomTabBar in SubjectPage**

In `src/pages/SubjectPage.jsx`, import the component:

```jsx
import BottomTabBar from '../components/layout/BottomTabBar';
```

Determine available tabs from subject data (similar to how ContentTypeBar works). Render at the bottom of the component, outside the main content area:

```jsx
<BottomTabBar
  subject={subject}
  lang={lang}
  availableTabs={availableTabs}
/>
```

Where `availableTabs` is computed from the subject's data (courses, labs, seminars, practice, tests presence).

- [ ] **Step 4: Hide ContentTypeBar on mobile**

In the SubjectPage where ContentTypeBar is rendered, add `className="hidden lg:block"` or equivalent so it only shows on desktop. The BottomTabBar takes over navigation on mobile.

- [ ] **Step 5: Verify bottom tab bar**

Run dev server. Resize to mobile (375px width). Test:
1. Bottom tab bar visible with 4 tabs (or fewer if subject lacks some content types)
2. Tapping each tab navigates to correct route
3. Active tab shows pill indicator + blue color
4. ContentTypeBar hidden on mobile, visible on desktop
5. Bottom sheet for course navigation still works above the tab bar
6. Content isn't hidden behind the tab bar (bottom padding applied)

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/BottomTabBar.jsx src/pages/SubjectPage.jsx src/index.css
git commit -m "feat(ux): mobile bottom tab bar with 4 fixed tabs (Material Design 3)"
```

---

## Phase 3: Progress & Engagement

### Task 10: Course Card Left-Border Accent

**Files:**
- Modify: `src/components/ui/CourseMap.jsx:114-125` (card styling)

- [ ] **Step 1: Replace background tint with left-border accent**

In `src/components/ui/CourseMap.jsx`, at ~lines 114-125, the card styling uses `tileBg` and `tileBorder` for full background tint. Replace with a left-border accent pattern:

```jsx
let borderLeftColor, tileBorder;
if (isComplete) {
  borderLeftColor = '#22c55e';
  tileBorder = dark ? 'rgba(34,197,94,0.3)' : '#d1fae5';
} else if (hasProgress) {
  borderLeftColor = '#3b82f6';
  tileBorder = dark ? 'rgba(96,165,250,0.3)' : '#dbeafe';
} else if (isNext) {
  borderLeftColor = '#93c5fd';
  tileBorder = 'var(--theme-border)';
} else {
  borderLeftColor = 'transparent';
  tileBorder = 'var(--theme-border)';
}
```

Update the card's inline style to use the left border:

```jsx
style={{
  backgroundColor: 'var(--theme-card-bg)',
  border: `1px solid ${tileBorder}`,
  borderLeft: `4px solid ${borderLeftColor}`,
}}
```

- [ ] **Step 2: Verify card styling**

Run dev server. Navigate to OS subject (CourseMap view). Confirm:
- Completed courses have green left border (4px)
- In-progress courses have blue left border
- Not-started courses have no left border accent
- Background is now uniform card-bg instead of tinted

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/CourseMap.jsx
git commit -m "feat(ux): course card left-border accent by progress status"
```

---

### Task 11: Total Subject Progress Ring

**Files:**
- Modify: `src/components/ui/CourseMap.jsx` (add large progress ring)

- [ ] **Step 1: Add total progress ring to CourseMap header**

In `src/components/ui/CourseMap.jsx`, the component shows a grid of course tiles. Add a header section above the grid with a large ProgressRing showing total subject progress.

Import ProgressRing if not already imported:

```jsx
import ProgressRing from './ProgressRing';
```

Before the course grid, add:

```jsx
{/* Total subject progress — research §2: Khan Academy 120px dashboard ring */}
<div className="flex flex-col items-center mb-6">
  <ProgressRing size={120} completed={totalCompleted} total={totalSections} />
  <p
    className="mt-2"
    style={{
      fontSize: 'var(--type-body)',
      color: 'var(--theme-muted-text)'
    }}
  >
    {totalCompleted}/{totalSections} {lang === 'ro' ? 'secțiuni' : 'sections'}
  </p>
</div>
```

Compute `totalCompleted` and `totalSections` from the courses data passed to CourseMap. Sum up all courses' completed and total section counts.

- [ ] **Step 2: Verify total progress ring**

Run dev server. Navigate to OS subject (CourseMap). Confirm:
- 120px progress ring appears above the course grid
- Shows correct fraction (e.g. "47/155 sections")
- Ring color matches progress state (green if complete, blue if active, amber if started)
- Percentage displays inside the ring

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/CourseMap.jsx
git commit -m "feat(ux): total subject progress ring (120px, Khan Academy pattern)"
```

---

### Task 12: Progress Ring Fill Animation

**Files:**
- Modify: `src/components/ui/ProgressRing.jsx` (add animated fill)

- [ ] **Step 1: Add animated fill to ProgressRing**

In `src/components/ui/ProgressRing.jsx`, the progress arc currently uses `transition-all duration-300`. Enhance it with a proper fill animation on mount.

Add state to track whether the component has mounted:

```jsx
const [mounted, setMounted] = useState(false);
useEffect(() => {
  const timer = setTimeout(() => setMounted(true), 50);
  return () => clearTimeout(timer);
}, []);
```

Update the progress circle's `strokeDashoffset` to start at full circumference and animate to the target:

```jsx
<circle
  cx={size / 2}
  cy={size / 2}
  r={radius}
  fill="none"
  stroke={strokeColor}
  strokeWidth={strokeWidth}
  strokeDasharray={circumference}
  strokeDashoffset={mounted ? offset : circumference}
  strokeLinecap="round"
  transform={`rotate(-90 ${size / 2} ${size / 2})`}
  style={{
    transition: 'stroke-dashoffset 0.6s ease-in-out, stroke 0.4s ease',
  }}
/>
```

This gives the 600ms clockwise fill animation from research §2 (Khan Academy pattern) and 400ms color cross-fade on level-up.

- [ ] **Step 2: Verify animation**

Run dev server. Navigate between pages that show ProgressRings. Confirm:
- Rings animate clockwise from empty to their progress value on mount
- Animation is 600ms ease-in-out
- Color transitions smoothly when progress state changes

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ProgressRing.jsx
git commit -m "feat(ux): animated progress ring fill (600ms ease-in-out)"
```

---

### Task 13: Course Completion Celebration Modal

**Files:**
- Create: `src/components/ui/CompletionModal.jsx`
- Modify: `src/components/blocks/CourseRenderer.jsx` (trigger modal on course complete)

- [ ] **Step 1: Create CompletionModal component**

Create `src/components/ui/CompletionModal.jsx`:

```jsx
import { useEffect, useState } from 'react';

/**
 * Brief celebration modal for course completion.
 * Research §4: Khan Academy pattern — centered modal, fade+scale, short confetti, stats.
 */
export default function CompletionModal({ courseName, sectionsCompleted, onNext, onClose, lang }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: visible ? 'rgba(15, 23, 42, 0.6)' : 'transparent',
        backdropFilter: visible ? 'blur(4px)' : 'none',
        transition: 'background-color 0.3s, backdrop-filter 0.3s',
      }}
      onClick={handleClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="rounded-2xl p-8 text-center"
        style={{
          maxWidth: '480px',
          width: '90%',
          backgroundColor: 'var(--theme-card-bg)',
          border: '2px solid #22c55e',
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
        }}
      >
        {/* Success icon */}
        <div
          className="mx-auto mb-4 flex items-center justify-center rounded-full"
          style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          }}
        >
          <span style={{ fontSize: '32px', color: 'white' }}>✓</span>
        </div>

        <h2
          style={{
            fontSize: 'var(--type-h2)',
            fontWeight: 'var(--type-h2-weight)',
            color: 'var(--theme-content-text)',
            marginBottom: '8px',
          }}
        >
          {lang === 'ro' ? 'Curs Finalizat!' : 'Course Complete!'}
        </h2>

        <p style={{ color: 'var(--theme-muted-text)', marginBottom: '24px' }}>
          {courseName} — {sectionsCompleted} {lang === 'ro' ? 'secțiuni completate' : 'sections completed'}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-content-text)',
              backgroundColor: 'var(--theme-card-bg)',
            }}
          >
            {lang === 'ro' ? 'Închide' : 'Close'}
          </button>
          {onNext && (
            <button
              onClick={() => { handleClose(); setTimeout(onNext, 300); }}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
              }}
            >
              {lang === 'ro' ? 'Cursul Următor' : 'Next Course'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Trigger CompletionModal from CourseRenderer**

In `src/components/blocks/CourseRenderer.jsx`, the existing completion toast (~lines 269-307) fires when the course is fully complete. Add a state for showing the modal:

```jsx
const [showCompletionModal, setShowCompletionModal] = useState(false);
```

Import CompletionModal:

```jsx
import CompletionModal from '../ui/CompletionModal';
```

When the course completion condition is met (all steps understood), instead of or in addition to the toast, set `showCompletionModal(true)`. Detect the transition from not-complete to complete.

Render the modal conditionally:

```jsx
{showCompletionModal && (
  <CompletionModal
    courseName={courseTitle}
    sectionsCompleted={totalSteps}
    onClose={() => setShowCompletionModal(false)}
    onNext={nextCourseHandler}
    lang={lang}
  />
)}
```

Where `nextCourseHandler` navigates to the next course if one exists.

- [ ] **Step 3: Verify completion modal**

Run dev server. Navigate to an OS course. Mark all sections as understood. Confirm:
- Modal appears with fade-in + scale animation
- Shows course name and section count
- "Next Course" button navigates correctly
- Clicking outside or "Close" dismisses with fade-out
- Existing section-level celebrations still work

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/CompletionModal.jsx src/components/blocks/CourseRenderer.jsx
git commit -m "feat(ux): course completion celebration modal with stats"
```

---

## Phase 4: Test Features

### Task 14: Test Results Summary

**Files:**
- Create: `src/components/ui/TestResultsSummary.jsx`
- Modify: `src/components/blocks/test/TestRenderer.jsx` (show results summary after test)

- [ ] **Step 1: Create TestResultsSummary component**

Create `src/components/ui/TestResultsSummary.jsx`:

```jsx
import ProgressRing from './ProgressRing';

/**
 * Test results summary page. Research §10: large score ring, per-topic bars,
 * question list, review/retake buttons.
 */
export default function TestResultsSummary({
  score,
  totalPoints,
  questions,
  onReviewMistakes,
  onRetake,
  lang
}) {
  const percent = Math.round((score / totalPoints) * 100);
  const colorClass = percent >= 80 ? '#22c55e' : percent >= 50 ? '#f59e0b' : '#ef4444';

  const wrongQuestions = questions.filter(q => !q.correct);

  return (
    <div className="py-8" style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
      {/* Score ring */}
      <div className="flex flex-col items-center mb-8">
        <ProgressRing size={120} completed={score} total={totalPoints} />
        <p
          className="mt-3"
          style={{
            fontSize: 'var(--type-h2)',
            fontWeight: 'var(--type-h2-weight)',
            color: colorClass
          }}
        >
          {percent}%
        </p>
        <p style={{ color: 'var(--theme-muted-text)' }}>
          {score}/{totalPoints} {lang === 'ro' ? 'puncte' : 'points'}
        </p>
      </div>

      {/* Question list */}
      <div className="space-y-2 mb-8">
        <h3 style={{
          fontSize: 'var(--type-h3)',
          fontWeight: 'var(--type-h3-weight)',
          color: 'var(--theme-content-text)',
          marginBottom: '12px'
        }}>
          {lang === 'ro' ? 'Întrebări' : 'Questions'}
        </h3>
        {questions.map((q, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              border: '1px solid var(--theme-border)',
            }}
          >
            <span style={{ color: q.correct ? '#22c55e' : '#ef4444', fontSize: '18px' }}>
              {q.correct ? '✓' : '✗'}
            </span>
            <span className="flex-1" style={{ color: 'var(--theme-content-text)' }}>
              {q.label || `${lang === 'ro' ? 'Întrebarea' : 'Question'} ${i + 1}`}
            </span>
            {q.timeSpent && (
              <span style={{ color: 'var(--theme-muted-text)', fontSize: '14px' }}>
                {q.timeSpent}s
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        {wrongQuestions.length > 0 && (
          <button
            onClick={onReviewMistakes}
            className="px-6 py-3 rounded-lg transition-colors"
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              fontWeight: 600,
            }}
          >
            {lang === 'ro' ? 'Revizuiește Greșelile' : 'Review Mistakes'} ({wrongQuestions.length})
          </button>
        )}
        <button
          onClick={onRetake}
          className="px-6 py-3 rounded-lg transition-colors"
          style={{
            border: '1px solid var(--theme-border)',
            color: 'var(--theme-content-text)',
            backgroundColor: 'var(--theme-card-bg)',
            fontWeight: 600,
          }}
        >
          {lang === 'ro' ? 'Reia Testul' : 'Retake Test'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Integrate TestResultsSummary into TestRenderer**

In `src/components/blocks/test/TestRenderer.jsx`, after the test is submitted and scored, render TestResultsSummary instead of the current results display. Import the component:

```jsx
import TestResultsSummary from '../../ui/TestResultsSummary';
```

When the test is in "results" state, render:

```jsx
<TestResultsSummary
  score={totalScore}
  totalPoints={maxScore}
  questions={questionResults}
  onReviewMistakes={() => startReviewMistakes()}
  onRetake={() => resetTest()}
  lang={lang}
/>
```

Where `questionResults` is an array of `{ label, correct, timeSpent }` built from the test answers.

- [ ] **Step 3: Verify test results summary**

Run dev server. Navigate to a test, answer all questions, submit. Confirm:
- Large ProgressRing shows score percentage
- Color: green >=80%, amber 50-79%, red <50%
- Question list shows check/X for each question
- "Review Mistakes" button appears if there are wrong answers
- "Retake Test" button resets the test

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/TestResultsSummary.jsx src/components/blocks/test/TestRenderer.jsx
git commit -m "feat(ux): test results summary with score ring and question list"
```

---

### Task 15: Review Mistakes Flow

**Files:**
- Modify: `src/components/blocks/test/TestRenderer.jsx` (add review mode)
- Modify: `src/contexts/AppContext.jsx` (extend testProgress tracking)

- [ ] **Step 1: Extend testProgress in AppContext**

In `src/contexts/AppContext.jsx`, the `saveTestResult` function currently saves `{ score, totalPoints, answers }`. Extend it to also save per-question attempt data:

```jsx
const saveTestResult = useCallback((testId, score, totalPoints, answers, questionDetails) => {
  setTestProgress(prev => {
    const existing = prev[testId] || {};
    const attempts = (existing.attempts || 0) + 1;
    // Track per-question: merge attempt data
    const perQuestion = { ...(existing.perQuestion || {}) };
    if (questionDetails) {
      questionDetails.forEach(q => {
        const qKey = q.id || q.index;
        const prev = perQuestion[qKey] || { attemptCount: 0, results: [] };
        perQuestion[qKey] = {
          attemptCount: prev.attemptCount + 1,
          lastResult: q.correct,
          results: [...prev.results, { correct: q.correct, timestamp: Date.now() }],
        };
      });
    }
    return {
      ...prev,
      [testId]: { score, totalPoints, answers, attempts, perQuestion }
    };
  });
}, []);
```

- [ ] **Step 2: Add review-mistakes mode to TestRenderer**

In `src/components/blocks/test/TestRenderer.jsx`, add a `reviewMode` state:

```jsx
const [reviewMode, setReviewMode] = useState(false);
const [reviewQuestions, setReviewQuestions] = useState([]);
```

The `startReviewMistakes` function filters to only wrong questions:

```jsx
const startReviewMistakes = () => {
  const wrong = questionResults
    .map((q, i) => ({ ...q, originalIndex: i }))
    .filter(q => !q.correct);
  setReviewQuestions(wrong);
  setReviewMode(true);
  setSubmitted(false);
  // Reset answers for wrong questions only
};
```

When `reviewMode` is true, render only the wrong questions with an "Attempt 2" badge:

```jsx
{reviewMode && (
  <div
    className="inline-block px-2 py-1 rounded text-sm mb-4"
    style={{
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      color: '#3b82f6',
      fontWeight: 600,
    }}
  >
    {lang === 'ro' ? 'Încercare 2' : 'Attempt 2'} — {reviewQuestions.length} {lang === 'ro' ? 'întrebări' : 'questions'}
  </div>
)}
```

- [ ] **Step 3: Verify review mistakes flow**

Run dev server. Take a test, get some wrong. Click "Review Mistakes". Confirm:
- Only wrong questions are shown
- "Attempt 2" badge visible
- After re-answering and submitting, results show for the review session
- Test progress in localStorage tracks attempt count per question

- [ ] **Step 4: Commit**

```bash
git add src/components/blocks/test/TestRenderer.jsx src/contexts/AppContext.jsx
git commit -m "feat(ux): review mistakes flow with per-question attempt tracking"
```

---

### Task 16: Tutor vs Timed Mode Selector

**Files:**
- Create: `src/components/ui/TestModeSelector.jsx`
- Modify: `src/components/blocks/test/TestRenderer.jsx` (show mode selector before test)

- [ ] **Step 1: Create TestModeSelector component**

Create `src/components/ui/TestModeSelector.jsx`:

```jsx
/**
 * Pre-test mode selection. Research §10: two cards, selected gets blue border.
 * Tutor = explanations after each Q. Timed = countdown, results at end.
 */
export default function TestModeSelector({ onSelect, lang }) {
  const modes = [
    {
      key: 'tutor',
      title: lang === 'ro' ? 'Mod Tutor' : 'Tutor Mode',
      desc: lang === 'ro'
        ? 'Explicații după fiecare întrebare. Poți învăța din greșeli pe parcurs.'
        : 'Explanations after each question. Learn from mistakes as you go.',
      icon: '📝',
    },
    {
      key: 'timed',
      title: lang === 'ro' ? 'Mod Cronometrat' : 'Timed Mode',
      desc: lang === 'ro'
        ? 'Cronometru cu numărătoare inversă. Rezultate la final.'
        : 'Countdown timer. Results at the end.',
      icon: '⏱️',
    },
  ];

  return (
    <div className="py-8" style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
      <h2
        className="text-center mb-6"
        style={{
          fontSize: 'var(--type-h2)',
          fontWeight: 'var(--type-h2-weight)',
          color: 'var(--theme-content-text)',
        }}
      >
        {lang === 'ro' ? 'Alege Modul' : 'Choose Mode'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
        {modes.map(mode => (
          <button
            key={mode.key}
            onClick={() => onSelect(mode.key)}
            className="p-6 rounded-xl text-left transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              border: '2px solid var(--theme-border)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--theme-border)';
              e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)';
            }}
          >
            <span style={{ fontSize: '32px' }}>{mode.icon}</span>
            <h3
              className="mt-3"
              style={{
                fontSize: 'var(--type-h3)',
                fontWeight: 'var(--type-h3-weight)',
                color: 'var(--theme-content-text)',
              }}
            >
              {mode.title}
            </h3>
            <p className="mt-2" style={{ color: 'var(--theme-muted-text)', fontSize: '14px' }}>
              {mode.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Integrate mode selector into TestRenderer**

In `src/components/blocks/test/TestRenderer.jsx`, add a `testMode` state:

```jsx
const [testMode, setTestMode] = useState(null); // null = not started, 'tutor' | 'timed'
```

Import TestModeSelector:

```jsx
import TestModeSelector from '../../ui/TestModeSelector';
```

Before the test starts (when `testMode === null`), render the selector:

```jsx
if (!testMode) {
  return <TestModeSelector onSelect={setTestMode} lang={lang} />;
}
```

In timed mode, add a countdown timer:

```jsx
const [timeLeft, setTimeLeft] = useState(null);

useEffect(() => {
  if (testMode !== 'timed' || submitted) return;
  // 2 minutes per question
  const total = questions.length * 120;
  setTimeLeft(total);
  const interval = setInterval(() => {
    setTimeLeft(t => {
      if (t <= 1) {
        clearInterval(interval);
        handleSubmit(); // Auto-submit when time runs out
        return 0;
      }
      return t - 1;
    });
  }, 1000);
  return () => clearInterval(interval);
}, [testMode, submitted]);
```

In tutor mode, show feedback after each question (this is the existing behavior — keep it).
In timed mode, hide per-question feedback until the end.

- [ ] **Step 3: Verify mode selector**

Run dev server. Navigate to a test. Confirm:
- Mode selector appears before test starts
- Tutor mode: existing behavior (feedback after each question)
- Timed mode: timer shown, no per-question feedback, auto-submit on timeout
- Card hover shows blue border + light blue background

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/TestModeSelector.jsx src/components/blocks/test/TestRenderer.jsx
git commit -m "feat(ux): tutor vs timed test mode selector"
```

---

### Task 17: "What's On The Exam" Mode

**Files:**
- Modify: `src/components/blocks/CourseRenderer.jsx` (filter by exam relevance)
- Modify: `src/pages/SubjectPage.jsx` (add exam mode toggle)

This feature requires an `examRelevant` field on course sections in JSON. Since not all content is tagged yet, this task adds the UI toggle and filtering logic. Content tagging is a separate data task.

- [ ] **Step 1: Add exam mode toggle to SubjectPage**

In `src/pages/SubjectPage.jsx`, add a state for exam mode:

```jsx
const [examMode, setExamMode] = useState(false);
```

Add a toggle button in the page header area (near breadcrumbs or content type bar):

```jsx
<button
  onClick={() => setExamMode(e => !e)}
  className="px-3 py-1.5 rounded-lg text-sm transition-colors"
  style={{
    backgroundColor: examMode ? 'rgba(239, 68, 68, 0.12)' : 'var(--theme-card-bg)',
    color: examMode ? '#ef4444' : 'var(--theme-muted-text)',
    border: `1px solid ${examMode ? '#ef4444' : 'var(--theme-border)'}`,
    fontWeight: examMode ? 600 : 400,
  }}
>
  {lang === 'ro' ? '🎯 Examen' : '🎯 Exam Mode'}
</button>
```

Pass `examMode` down to the course content renderer.

- [ ] **Step 2: Filter/dim content in CourseRenderer based on exam relevance**

In `src/components/blocks/CourseRenderer.jsx`, accept an `examMode` prop. When `examMode` is true, check each step/section for an `examRelevant` field in the course JSON data:

```jsx
// Wrap each step's content in a container that dims if not exam-relevant
const stepOpacity = examMode && step.examRelevant === false ? 0.3 : 1;
const stepStyle = {
  opacity: stepOpacity,
  transition: 'opacity 0.2s',
  pointerEvents: examMode && step.examRelevant === false ? 'none' : 'auto',
};
```

If `examRelevant` is undefined (not yet tagged), treat it as relevant (don't dim it).

- [ ] **Step 3: Verify exam mode**

Run dev server. Toggle exam mode on. Confirm:
- Toggle button turns red when active
- Sections not tagged as exam-relevant are dimmed (if any are tagged)
- Untagged sections remain fully visible
- Toggle off restores everything to normal

- [ ] **Step 4: Commit**

```bash
git add src/pages/SubjectPage.jsx src/components/blocks/CourseRenderer.jsx
git commit -m "feat(ux): exam mode toggle with section dimming"
```

---

### Task 18: Quick Quiz Floating Action Button

**Files:**
- Create: `src/components/ui/QuickQuizFAB.jsx`
- Modify: `src/pages/SubjectPage.jsx` (render FAB)

- [ ] **Step 1: Create QuickQuizFAB component**

Create `src/components/ui/QuickQuizFAB.jsx`:

```jsx
import { useState } from 'react';

/**
 * Floating action button that launches a random quiz.
 * Research gap audit: bottom-right, above bottom tab bar on mobile.
 * Standard FAB: 56px, circular, shadow elevation 6dp.
 */
export default function QuickQuizFAB({ quizSections, onSelectQuiz, lang }) {
  const [hovered, setHovered] = useState(false);

  if (!quizSections || quizSections.length === 0) return null;

  const handleClick = () => {
    const randomIndex = Math.floor(Math.random() * quizSections.length);
    onSelectQuiz(quizSections[randomIndex]);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed z-40 flex items-center justify-center rounded-full transition-all"
      style={{
        width: '56px',
        height: '56px',
        bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))', /* above bottom tab bar */
        right: '16px',
        backgroundColor: '#3b82f6',
        color: 'white',
        boxShadow: hovered
          ? '0 8px 16px rgba(59, 130, 246, 0.4)'
          : '0 4px 12px rgba(59, 130, 246, 0.3)',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        fontSize: '24px',
      }}
      title={lang === 'ro' ? 'Quiz Rapid' : 'Quick Quiz'}
    >
      ⚡
    </button>
  );
}
```

- [ ] **Step 2: Render QuickQuizFAB in SubjectPage**

In `src/pages/SubjectPage.jsx`, import the component:

```jsx
import QuickQuizFAB from '../components/ui/QuickQuizFAB';
```

Collect quiz sections from the subject's course data. Render at the bottom of the page:

```jsx
<QuickQuizFAB
  quizSections={quizSections}
  onSelectQuiz={(section) => {
    // Navigate to the quiz section's course and scroll to it
    navigate(`/${yearSem}/${slug}/course/${section.courseIndex}#${section.sectionId}`);
  }}
  lang={lang}
/>
```

Where `quizSections` is extracted from course JSON data (sections containing quiz blocks). On desktop, position relative to the right edge. Adjust bottom position for when there's no bottom tab bar (desktop):

Add a media query check or adjust the `bottom` value:
- Mobile (< lg): `calc(80px + env(safe-area-inset-bottom))` (above bottom tab bar)
- Desktop (>= lg): `24px`

- [ ] **Step 3: Verify FAB**

Run dev server. Navigate to OS subject. Confirm:
- Blue circular FAB visible in bottom-right corner
- On mobile: positioned above the bottom tab bar
- On desktop: positioned near bottom-right
- Clicking navigates to a random quiz section
- Hover shows elevated shadow + slight scale

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/QuickQuizFAB.jsx src/pages/SubjectPage.jsx
git commit -m "feat(ux): quick quiz floating action button"
```

---

## Post-Implementation

After all tasks are complete:

- [ ] **Run `npm run build`** — verify no build errors
- [ ] **Test on mobile viewport** (375px) — bottom tab bar, hide-on-scroll, typography
- [ ] **Test dark/light/system modes** — all three states work, FOUC prevention confirmed
- [ ] **Test deep links** — share a section URL, confirm it scrolls correctly
- [ ] **Commit and push to trigger deploy**
