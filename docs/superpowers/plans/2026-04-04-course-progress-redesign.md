# Course Progress & Navigation Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the course viewing experience with per-course routing, auto-progress tracking, always-visible right progress sidebar, animated left sidebar, and directional slide transitions.

**Architecture:** SubjectPage detects `course_N` in the wildcard URL param and renders a three-column layout: left navigation sidebar, single course content with slide transitions, and right progress sidebar. Auto-progress uses IntersectionObserver + custom DOM events from Toggle components to mark sections complete without manual checkbox clicks.

**Tech Stack:** React 19, react-router-dom v7, Tailwind CSS v4, CSS custom properties, IntersectionObserver API, CustomEvent API

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `src/hooks/useAutoProgress.js` | IntersectionObserver + Toggle event listener → auto-check sections |
| `src/components/ui/ProgressSidebar.jsx` | Right sidebar: vertical segment bar + section labels + mini ring |
| `src/components/ui/CourseTransition.jsx` | Direction-aware slide animation wrapper |

### Modified files
| File | Changes |
|------|---------|
| `src/contexts/AppContext.jsx` | localStorage migration (`c1-*` → `course_1-*`), add `setChecked` to context |
| `src/content/os/index.js` | Course IDs `c1`→`course_1` ... `c11`→`course_11` |
| `src/content/os/courses/Course01.jsx` – `Course11.jsx` | Section ID prefixes `c1-`→`course_1-` etc. (88 occurrences total) |
| `src/content/oop/index.js` | Course IDs `oop-c1`→`oop-course_1` ... `oop-c7`→`oop-course_7` |
| `src/content/oop/courses/Course01.jsx` – `Course07.jsx` | Section ID prefixes `oop-c1-`→`oop-course_1-` etc. (43 occurrences total) |
| `src/components/ui/Toggle.jsx` | Add `data-toggle` attr + dispatch `toggle-interacted` CustomEvent |
| `src/components/ui/Section.jsx` | Integrate `useAutoProgress` hook |
| `src/components/layout/Sidebar.jsx` | Scale/extrude styling, `navigate()` routing, active from URL |
| `src/pages/SubjectPage.jsx` | Parse `course_N`, three-column layout, integrate CourseTransition + ProgressSidebar |
| `src/components/ui/CourseNavigation.jsx` | Use `navigate()` instead of scroll callback |
| `src/components/ui/CourseMap.jsx` | `onCourseClick` now receives navigate-based callback from SubjectPage |

---

### Task 1: localStorage Migration & Course ID Rename in AppContext

**Files:**
- Modify: `src/contexts/AppContext.jsx`

- [ ] **Step 1: Add migration logic to AppContext**

In `AppContext.jsx`, add a migration function before the `AppProvider` component and call it inside the provider. Also expose `setChecked` in the context value (needed later by `useAutoProgress` to set without toggling):

```jsx
// Add above AppProvider function:
function migrateCheckedKeys(checked) {
  const migrated = {};
  let changed = false;
  for (const [key, value] of Object.entries(checked)) {
    // Match OS pattern: c1-intro, c2-shell, etc.
    const osMatch = key.match(/^c(\d+)-(.+)$/);
    // Match prefixed pattern: oop-c1-glossary, etc.
    const prefixMatch = key.match(/^(.+?)-c(\d+)-(.+)$/);
    if (osMatch) {
      migrated[`course_${osMatch[1]}-${osMatch[2]}`] = value;
      changed = true;
    } else if (prefixMatch) {
      migrated[`${prefixMatch[1]}-course_${prefixMatch[2]}-${prefixMatch[3]}`] = value;
      changed = true;
    } else {
      migrated[key] = value;
    }
  }
  return changed ? migrated : checked;
}
```

- [ ] **Step 2: Call migration on first render**

Inside `AppProvider`, after the `useLocalStorage` call for `checked`, add:

```jsx
const [checked, setChecked] = useLocalStorage('checked', {});

// One-time migration of course IDs
useEffect(() => {
  if (localStorage.getItem('checked_v2_migrated')) return;
  const migrated = migrateCheckedKeys(checked);
  if (migrated !== checked) {
    setChecked(migrated);
  }
  localStorage.setItem('checked_v2_migrated', '1');
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 3: Expose setChecked in context value**

In the `value` useMemo, add `setChecked`:

```jsx
const value = useMemo(() => ({
  dark, setDark, toggleDark,
  lang, setLang, toggleLang,
  palette, setPalette,
  search, setSearch,
  checked, setChecked, toggleCheck,
  t, highlight,
}), [dark, lang, palette, search, checked, t, toggleCheck, highlight, toggleDark, toggleLang]);
```

- [ ] **Step 4: Verify the app still loads**

Run: `npm run dev`
Expected: App loads without errors, existing progress data (if any) is preserved.

- [ ] **Step 5: Commit**

```bash
git add src/contexts/AppContext.jsx
git commit -m "feat: add localStorage migration for course ID rename and expose setChecked"
```

---

### Task 2: Rename Course IDs in OS Subject

**Files:**
- Modify: `src/content/os/index.js`
- Modify: `src/content/os/courses/Course01.jsx` through `Course11.jsx` (11 files, 88 occurrences)

- [ ] **Step 1: Update OS index.js course IDs**

In `src/content/os/index.js`, rename every course `id` field. For each course entry:
- `id: 'c1'` → `id: 'course_1'`
- `id: 'c2'` → `id: 'course_2'`
- ... through `id: 'c11'` → `id: 'course_11'`

Do NOT change seminar IDs (`s1`, `s2`, etc.), lab IDs (`l1`, `l2`, etc.), or test IDs.

- [ ] **Step 2: Rename section ID prefixes in each course file**

For each of the 11 course files, do a find-and-replace of the section ID prefix. The pattern appears in three places per section: the `id` prop, the `checked` lookup, and the `toggleCheck` call.

**Course01.jsx:** Replace all `c1-` with `course_1-` (9 sections = 27 replacements across `id="c1-"`, `checked['c1-"`, `toggleCheck('c1-"`)

**Course02.jsx:** Replace all `c2-` with `course_2-` (10 sections)

**Course03.jsx:** Replace all `c3-` with `course_3-` (9 sections)

**Course04.jsx:** Replace all `c4-` with `course_4-` (7 sections)

**Course05.jsx:** Replace all `c5-` with `course_5-` (7 sections)

**Course06.jsx:** Replace all `c6-` with `course_6-` (7 sections)

**Course07.jsx:** Replace all `c7-` with `course_7-` (7 sections)

**Course08.jsx:** Replace all `c8-` with `course_8-` (8 sections)

**Course09.jsx:** Replace all `c9-` with `course_9-` (8 sections)

**Course10.jsx:** Replace all `c10-` with `course_10-` (8 sections)

**Course11.jsx:** Replace all `c11-` with `course_11-` (8 sections)

Use the Edit tool with `replace_all: true` for each file. For example in Course01.jsx: `old_string: 'c1-'`, `new_string: 'course_1-'`, `replace_all: true`.

- [ ] **Step 3: Verify the app loads and OS courses render**

Run: `npm run dev`
Navigate to `/#/y1s2/os`, verify CourseMap renders and courses open without errors.

- [ ] **Step 4: Commit**

```bash
git add src/content/os/
git commit -m "feat: rename OS course IDs from c1-c11 to course_1-course_11"
```

---

### Task 3: Rename Course IDs in OOP Subject

**Files:**
- Modify: `src/content/oop/index.js`
- Modify: `src/content/oop/courses/Course01.jsx` through `Course07.jsx` (7 files, 43 occurrences)

- [ ] **Step 1: Update OOP index.js course IDs**

In `src/content/oop/index.js`, rename every course `id` field:
- `id: 'oop-c1'` → `id: 'oop-course_1'`
- `id: 'oop-c2'` → `id: 'oop-course_2'`
- ... through `id: 'oop-c7'` → `id: 'oop-course_7'`

Do NOT change lab IDs (`oop-l1`, etc.).

- [ ] **Step 2: Rename section ID prefixes in each OOP course file**

For each of the 7 course files, replace the section ID prefix:

**Course01.jsx:** Replace all `oop-c1-` with `oop-course_1-` (6 sections)

**Course02.jsx:** Replace all `oop-c2-` with `oop-course_2-` (6 sections)

**Course03.jsx:** Replace all `oop-c3-` with `oop-course_3-` (7 sections)

**Course04.jsx:** Replace all `oop-c4-` with `oop-course_4-` (6 sections)

**Course05.jsx:** Replace all `oop-c5-` with `oop-course_5-` (6 sections)

**Course06.jsx:** Replace all `oop-c6-` with `oop-course_6-` (6 sections)

**Course07.jsx:** Replace all `oop-c7-` with `oop-course_7-` (6 sections)

Use the Edit tool with `replace_all: true` for each file.

- [ ] **Step 3: Verify OOP courses render**

Run: `npm run dev`
Navigate to `/#/y1s2/oop`, verify courses work.

- [ ] **Step 4: Commit**

```bash
git add src/content/oop/
git commit -m "feat: rename OOP course IDs from oop-c1-c7 to oop-course_1-course_7"
```

---

### Task 4: Toggle Component — Add data-toggle Attribute & Custom Event

**Files:**
- Modify: `src/components/ui/Toggle.jsx`

- [ ] **Step 1: Add data-toggle attribute and dispatch event on first open**

Modify `Toggle.jsx`. Add a ref for tracking whether the event has fired, add `data-toggle` to the root div, and dispatch the custom event on first open:

```jsx
import React, { useState, useRef, useCallback } from 'react';

const Toggle = ({ question, answer, hideLabel = 'Hide', showLabel = 'Show Answer' }) => {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const rootRef = useRef(null);
  const hasFiredEvent = useRef(false);
  const [maxHeight, setMaxHeight] = useState('0px');
  const [transitioning, setTransitioning] = useState(false);

  const handleToggle = useCallback(() => {
    if (!open) {
      setTransitioning(true);
      if (contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      }
      setOpen(true);

      // Dispatch toggle-interacted event on first open
      if (!hasFiredEvent.current && rootRef.current) {
        hasFiredEvent.current = true;
        rootRef.current.dispatchEvent(new CustomEvent('toggle-interacted', { bubbles: true }));
      }
    } else {
      setTransitioning(true);
      if (contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMaxHeight('0px');
          setOpen(false);
        });
      });
    }
  }, [open]);

  const handleTransitionEnd = useCallback((e) => {
    if (e.target !== contentRef.current) return;
    setTransitioning(false);
    if (open && contentRef.current) {
      setMaxHeight('none');
    }
  }, [open]);

  return (
    <div
      ref={rootRef}
      data-toggle
      className="my-2 border rounded-lg overflow-hidden"
      style={{ borderColor: 'var(--theme-border)' }}
    >
      <div
        className="flex justify-between items-center p-3 cursor-pointer transition-colors"
        onClick={handleToggle}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--theme-hover-bg)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span className="font-sans text-sm flex-1 pr-3">{question}</span>
        <button className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-px active:scale-[0.97] whitespace-nowrap flex-shrink-0">
          {open ? hideLabel : showLabel}
        </button>
      </div>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{
          maxHeight,
          transition: transitioning ? 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          borderTop: open ? '1px solid var(--theme-border)' : '1px solid transparent',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="p-3 text-sm font-sans" style={{ backgroundColor: 'var(--theme-hover-bg)' }}>
          {answer}
        </div>
      </div>
    </div>
  );
};

export default Toggle;
```

- [ ] **Step 2: Verify Toggle still works**

Run: `npm run dev`
Navigate to any course with Toggle components, expand/collapse them, confirm behavior unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Toggle.jsx
git commit -m "feat: add data-toggle attribute and toggle-interacted custom event to Toggle"
```

---

### Task 5: useAutoProgress Hook

**Files:**
- Create: `src/hooks/useAutoProgress.js`

- [ ] **Step 1: Create the hook**

```jsx
import { useRef, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';

export default function useAutoProgress(sectionId) {
  const { checked, setChecked } = useApp();
  const sectionRef = useRef(null);
  const hasScrolledThrough = useRef(false);
  const hasInteractedWithToggle = useRef(false);
  const hasAutoFired = useRef(false);
  const needsToggle = useRef(false);

  const tryComplete = useCallback(() => {
    if (hasAutoFired.current) return;
    if (!hasScrolledThrough.current) return;
    if (needsToggle.current && !hasInteractedWithToggle.current) return;

    hasAutoFired.current = true;
    setChecked(prev => {
      if (prev[sectionId]) return prev; // already checked
      return { ...prev, [sectionId]: true };
    });
  }, [sectionId, setChecked]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Detect if section contains Toggle components
    const toggles = el.querySelectorAll('[data-toggle]');
    needsToggle.current = toggles.length > 0;
    if (!needsToggle.current) {
      hasInteractedWithToggle.current = true;
    }

    // Listen for toggle-interacted events bubbling up
    const handleToggleInteracted = () => {
      hasInteractedWithToggle.current = true;
      tryComplete();
    };
    el.addEventListener('toggle-interacted', handleToggleInteracted);

    // IntersectionObserver on the section — observe the element itself
    // We want to detect when the user has scrolled past the bottom of the section
    // Create a sentinel div at the bottom of the section
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.width = '1px';
    sentinel.style.position = 'relative';
    el.appendChild(sentinel);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            hasScrolledThrough.current = true;
            tryComplete();
            observer.disconnect();
          }
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      el.removeEventListener('toggle-interacted', handleToggleInteracted);
      if (sentinel.parentNode) sentinel.parentNode.removeChild(sentinel);
    };
  }, [tryComplete]);

  return { ref: sectionRef };
}
```

- [ ] **Step 2: Verify the file was created**

Run: `ls src/hooks/useAutoProgress.js`
Expected: File exists.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAutoProgress.js
git commit -m "feat: create useAutoProgress hook for scroll + toggle auto-completion"
```

---

### Task 6: Integrate useAutoProgress into Section Component

**Files:**
- Modify: `src/components/ui/Section.jsx`

- [ ] **Step 1: Add useAutoProgress to Section**

Modify `Section.jsx` to use the auto-progress hook. The hook's ref needs to be merged with the existing section div. The section already has an `id` prop which is the section ID:

```jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import useAutoProgress from '../../hooks/useAutoProgress';

const Section = ({ title, id, children, checked, onCheck }) => {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');
  const [transitioning, setTransitioning] = useState(false);
  const { ref: autoRef } = useAutoProgress(id);

  const handleToggle = useCallback(() => {
    if (!open) {
      setTransitioning(true);
      if (contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      }
      setOpen(true);
    } else {
      setTransitioning(true);
      if (contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMaxHeight('0px');
          setOpen(false);
        });
      });
    }
  }, [open]);

  const handleTransitionEnd = useCallback((e) => {
    if (e.target !== contentRef.current) return;
    setTransitioning(false);
    if (open && contentRef.current) {
      setMaxHeight('none');
    }
  }, [open]);

  return (
    <div
      ref={autoRef}
      className="mb-3 border rounded-lg overflow-hidden transition-shadow hover:shadow-sm"
      id={id}
      style={{ borderColor: 'var(--theme-border)' }}
    >
      <div
        className="flex items-center gap-2 p-3 cursor-pointer transition-colors"
        style={{ backgroundColor: 'transparent' }}
        onClick={handleToggle}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--theme-hover-bg)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheck}
          onClick={e => e.stopPropagation()}
          className="w-4 h-4 accent-green-500"
        />
        <span className={`font-semibold flex-1 transition-colors ${checked ? 'text-green-600 line-through opacity-70' : ''}`}
          style={{ color: checked ? undefined : 'var(--theme-content-text)' }}
        >
          <span
            className="inline-block mr-1"
            style={{
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            ▸
          </span>
          {title}
        </span>
      </div>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{
          maxHeight,
          transition: transitioning ? 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          borderTop: open ? '1px solid var(--theme-border)' : '1px solid transparent',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Section;
```

- [ ] **Step 2: Verify auto-progress works**

Run: `npm run dev`
Navigate to a course, scroll through a section that has no Toggle components — it should auto-check when the bottom is scrolled into view. For a section with Toggles, also open a Toggle before scrolling to the bottom.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Section.jsx
git commit -m "feat: integrate useAutoProgress into Section component"
```

---

### Task 7: CourseTransition Component

**Files:**
- Create: `src/components/ui/CourseTransition.jsx`

- [ ] **Step 1: Create the transition wrapper component**

```jsx
import React, { useState, useRef, useEffect } from 'react';

const DURATION = 350;

const animations = {
  slideOutUp: { transform: 'translateY(-40px)', opacity: 0 },
  slideInUp: { from: { transform: 'translateY(40px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
  slideOutDown: { transform: 'translateY(40px)', opacity: 0 },
  slideInDown: { from: { transform: 'translateY(-40px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
  fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
};

export default function CourseTransition({ courseIndex, children }) {
  const prevIndexRef = useRef(null);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [animClass, setAnimClass] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = courseIndex;

    if (prevIndex === null) {
      // First load — fade in
      setDisplayChildren(children);
      setAnimClass('course-fade-in');
      const timer = setTimeout(() => setAnimClass(''), DURATION);
      return () => clearTimeout(timer);
    }

    if (prevIndex === courseIndex) {
      setDisplayChildren(children);
      return;
    }

    const goingDown = courseIndex > prevIndex;

    // Phase 1: slide out old content
    setAnimClass(goingDown ? 'course-slide-out-up' : 'course-slide-out-down');

    const timer1 = setTimeout(() => {
      // Phase 2: swap content and slide in
      setDisplayChildren(children);
      setAnimClass(goingDown ? 'course-slide-in-up' : 'course-slide-in-down');

      const timer2 = setTimeout(() => setAnimClass(''), DURATION);
      return () => clearTimeout(timer2);
    }, DURATION);

    return () => clearTimeout(timer1);
  }, [courseIndex, children]);

  return (
    <div ref={containerRef} className={`course-transition ${animClass}`}>
      {displayChildren}
      <style>{`
        .course-transition {
          will-change: transform, opacity;
        }
        .course-slide-out-up {
          animation: courseSlideOutUp ${DURATION}ms ease forwards;
        }
        .course-slide-in-up {
          animation: courseSlideInUp ${DURATION}ms ease forwards;
        }
        .course-slide-out-down {
          animation: courseSlideOutDown ${DURATION}ms ease forwards;
        }
        .course-slide-in-down {
          animation: courseSlideInDown ${DURATION}ms ease forwards;
        }
        .course-fade-in {
          animation: courseFadeIn ${DURATION}ms ease forwards;
        }
        @keyframes courseSlideOutUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-40px); opacity: 0; }
        }
        @keyframes courseSlideInUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes courseSlideOutDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(40px); opacity: 0; }
        }
        @keyframes courseSlideInDown {
          from { transform: translateY(-40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes courseFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/CourseTransition.jsx
git commit -m "feat: create CourseTransition component with directional slide animations"
```

---

### Task 8: ProgressSidebar Component

**Files:**
- Create: `src/components/ui/ProgressSidebar.jsx`

- [ ] **Step 1: Create the right progress sidebar**

This component needs: `courseId`, `sectionCount`, `sectionIds` (array of section ID strings), `sectionTitles` (array of bilingual title strings).

```jsx
import React, { useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from './ProgressRing';

const ProgressSidebar = ({ courseId, sectionCount, sectionIds, sectionTitles }) => {
  const { checked, t } = useApp();
  const segmentsRef = useRef(null);
  const ringRef = useRef(null);
  const prevCountRef = useRef(0);
  const initializedRef = useRef(false);

  if (!sectionCount || sectionCount === 0) return null;

  const prefix = `${courseId}-`;
  const completedCount = Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length;
  const isComplete = completedCount >= sectionCount;

  const celebrate = useCallback((segIndex) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const segments = segmentsRef.current?.children;
    if (!segments) return;
    const seg = segments[segIndex];
    if (!seg) return;

    // Green flash
    seg.style.transition = 'background 0.15s';
    seg.style.background = 'linear-gradient(180deg, #22c55e, #4ade80)';
    setTimeout(() => {
      seg.style.transition = 'background 0.5s';
      seg.style.background = '#3b82f6';
    }, 300);

    // +1 floater (goes right for vertical layout)
    const floater = document.createElement('div');
    floater.textContent = '+1';
    floater.style.cssText = `
      position: absolute;
      left: 14px;
      top: ${seg.offsetTop + seg.offsetHeight / 2 - 8}px;
      color: #4ade80;
      font-size: 13px;
      font-weight: bold;
      pointer-events: none;
      animation: floatRight 0.7s ease-out forwards;
      text-shadow: 0 0 8px rgba(74,222,128,0.5);
      z-index: 10;
    `;
    segmentsRef.current.parentElement.appendChild(floater);
    setTimeout(() => floater.remove(), 700);

    // Ring bounce
    if (ringRef.current) {
      ringRef.current.style.animation = 'counterBounce 0.45s ease';
      setTimeout(() => { if (ringRef.current) ringRef.current.style.animation = ''; }, 450);
    }
  }, []);

  const celebrateComplete = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const segments = segmentsRef.current;
    if (!segments) return;

    setTimeout(() => {
      segments.style.gap = '0px';
      Array.from(segments.children).forEach((s, i) => {
        s.style.transition = 'background 0.4s, border-radius 0.4s';
        s.style.background = '#22c55e';
        if (i === 0) s.style.borderRadius = '3px 3px 0 0';
        else if (i === sectionCount - 1) s.style.borderRadius = '0 0 3px 3px';
        else s.style.borderRadius = '0';
      });
    }, 400);
  }, [sectionCount]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      prevCountRef.current = completedCount;
      return;
    }
    const prev = prevCountRef.current;
    if (completedCount > prev) {
      celebrate(completedCount - 1);
      if (completedCount >= sectionCount) {
        celebrateComplete();
      }
    }
    prevCountRef.current = completedCount;
  }, [completedCount, sectionCount, celebrate, celebrateComplete]);

  const handleSegmentClick = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside className="hidden lg:block lg:sticky top-20 w-44 h-[calc(100vh-5rem)] p-3 flex-shrink-0">
      <div className="flex flex-col h-full">
        {/* Vertical segment bar with labels */}
        <div className="flex-1 relative overflow-visible">
          <div className="flex gap-3 h-full">
            {/* Segments column */}
            <div
              ref={segmentsRef}
              className="flex flex-col w-1.5"
              style={{ gap: isComplete ? '0px' : '2px', transition: 'gap 0.4s ease' }}
            >
              {Array.from({ length: sectionCount }, (_, i) => {
                const sectionId = sectionIds?.[i];
                const isChecked = sectionId ? checked[sectionId] : i < completedCount;
                return (
                  <div
                    key={i}
                    className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => sectionId && handleSegmentClick(sectionId)}
                    style={{
                      borderRadius: isComplete
                        ? (i === 0 ? '3px 3px 0 0' : i === sectionCount - 1 ? '0 0 3px 3px' : '0')
                        : '3px',
                      background: isChecked
                        ? (isComplete ? '#22c55e' : '#3b82f6')
                        : 'var(--theme-border)',
                      transition: 'background 0.3s, border-radius 0.4s',
                      minHeight: '8px',
                    }}
                  />
                );
              })}
            </div>

            {/* Labels column */}
            <div className="flex flex-col flex-1 min-w-0" style={{ gap: '2px' }}>
              {Array.from({ length: sectionCount }, (_, i) => {
                const sectionId = sectionIds?.[i];
                const label = sectionTitles?.[i] || `Section ${i + 1}`;
                const isChecked = sectionId ? checked[sectionId] : i < completedCount;
                return (
                  <div
                    key={i}
                    className="flex-1 flex items-center cursor-pointer hover:opacity-80 transition-colors min-h-0"
                    onClick={() => sectionId && handleSegmentClick(sectionId)}
                  >
                    <span
                      className="text-[10px] leading-tight truncate"
                      style={{
                        color: isChecked ? '#22c55e' : 'var(--theme-muted-text)',
                        transition: 'color 0.3s',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mini progress ring at bottom */}
        <div ref={ringRef} className="flex items-center justify-center gap-2 pt-3 mt-3"
          style={{ borderTop: '1px solid var(--theme-border)' }}
        >
          <ProgressRing size={32} completed={completedCount} total={sectionCount} />
          <span
            className="text-xs font-bold"
            style={{ color: isComplete ? '#22c55e' : 'var(--theme-muted-text)' }}
          >
            {isComplete ? t('Complete', 'Complet') : `${completedCount}/${sectionCount}`}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes floatRight {
          0% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(20px) translateY(-10px); }
        }
        @keyframes counterBounce {
          0% { transform: scale(1); }
          40% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </aside>
  );
};

export default ProgressSidebar;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/ProgressSidebar.jsx
git commit -m "feat: create ProgressSidebar component with vertical segments and mini ring"
```

---

### Task 9: Redesign Left Sidebar

**Files:**
- Modify: `src/components/layout/Sidebar.jsx`

- [ ] **Step 1: Rewrite Sidebar with new styling and navigate-based routing**

The sidebar now receives `yearSem` and `subjectSlug` props, and an `activeCourseId` derived from the current URL (passed by SubjectPage). Clicking navigates instead of scrolling.

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from '../ui/ProgressRing';

const Sidebar = ({ subject, activeCourseId, open, onClose, yearSem, subjectSlug }) => {
  const { lang, t, checked } = useApp();
  const navigate = useNavigate();

  if (!subject || !subject.courses?.length) return null;

  const handleClick = (course) => {
    // Extract the number from the course ID (course_1 → 1, oop-course_3 → 3)
    const match = course.id.match(/course_(\d+)$/);
    if (match) {
      navigate(`/${yearSem}/${subjectSlug}/course_${match[1]}`);
    }
    onClose();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed lg:sticky top-20 left-0 z-50 lg:z-auto
          w-60 h-[calc(100vh-5rem)] overflow-y-auto
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

        <nav className="flex flex-col gap-1">
          {subject.courses.map(course => {
            const total = course.sectionCount || 0;
            const prefix = `${course.id}-`;
            const completed = total > 0
              ? Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length
              : 0;
            const isActive = activeCourseId === course.id;
            const isComplete = total > 0 && completed >= total;
            const hasProgress = completed > 0;

            return (
              <button
                key={course.id}
                className="relative flex items-center gap-2 px-3 py-2.5 rounded-lg w-full text-left"
                style={{
                  border: isActive
                    ? '1.5px solid #3b82f6'
                    : '1.5px solid transparent',
                  backgroundColor: isActive ? 'var(--theme-hover-bg)' : 'transparent',
                  transform: isActive ? 'scale(1.07)' : 'scale(1)',
                  boxShadow: isActive
                    ? '0 4px 20px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                    : 'none',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'scale(1.04)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.25)';
                    e.currentTarget.style.backgroundColor = 'var(--theme-hover-bg)';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(59, 130, 246, 0.1)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                onClick={() => handleClick(course)}
              >
                {/* Blue accent bar */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1px',
                      top: '20%',
                      bottom: '20%',
                      width: '3px',
                      borderRadius: '0 3px 3px 0',
                      background: '#3b82f6',
                    }}
                  />
                )}

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
                      color: isActive ? '#fff' : (isComplete ? '#16a34a' : 'var(--theme-content-text)'),
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
git commit -m "feat: redesign sidebar with scale/extrude animations and navigate-based routing"
```

---

### Task 10: Update CourseNavigation to Use navigate()

**Files:**
- Modify: `src/components/ui/CourseNavigation.jsx`

- [ ] **Step 1: Update CourseNavigation to accept yearSem and subjectSlug, use navigate**

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const CourseNavigation = ({ items, currentIndex, yearSem, subjectSlug }) => {
  const { lang } = useApp();
  const navigate = useNavigate();
  const prev = currentIndex > 0 ? items[currentIndex - 1] : null;
  const next = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

  if (!prev && !next) return null;

  const navTo = (course) => {
    const match = course.id.match(/course_(\d+)$/);
    if (match) {
      navigate(`/${yearSem}/${subjectSlug}/course_${match[1]}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="flex justify-between items-center mt-8 pt-4 text-sm"
      style={{ borderTop: '1px solid var(--theme-border)' }}
    >
      {prev ? (
        <button
          onClick={() => navTo(prev)}
          className="flex items-center gap-2 hover:opacity-80 transition"
          style={{ color: 'var(--theme-muted-text)' }}
        >
          <span>{'\u2190'}</span>
          <div className="text-left">
            <div className="text-[10px] opacity-60">Previous</div>
            <div className="font-medium text-xs">{prev.shortTitle[lang]}</div>
          </div>
        </button>
      ) : <div />}

      {next ? (
        <button
          onClick={() => navTo(next)}
          className="flex items-center gap-2 hover:opacity-80 transition text-right"
          style={{ color: '#3b82f6' }}
        >
          <div>
            <div className="text-[10px] opacity-60">Next</div>
            <div className="font-semibold text-xs">{next.shortTitle[lang]}</div>
          </div>
          <span>{'\u2192'}</span>
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
git commit -m "feat: update CourseNavigation to use navigate() for per-course routing"
```

---

### Task 11: Add Section Metadata to Subject Index Files

**Files:**
- Modify: `src/content/os/index.js`

The ProgressSidebar needs section IDs and titles for each course. Add a `sections` array to each course entry in the OS index. This is needed so ProgressSidebar can render labels and map segments to section IDs.

- [ ] **Step 1: Add sections metadata to OS index**

For each course entry in `src/content/os/index.js`, add a `sections` array containing `{ id, title }` objects. The `title` is bilingual. These must match the Section `id` and `title` props used in each course file.

Example for course_1 (9 sections, taken from Course01.jsx grep results):

```js
{ id: 'course_1', title: { ... }, shortTitle: { ... }, sectionCount: 9,
  sections: [
    { id: 'course_1-intro', title: { en: '1. Command-Line Introduction', ro: '1. Introducere în linia de comandă' } },
    { id: 'course_1-users', title: { en: '2. Users & Auth', ro: '2. Utilizatori & Autentificare' } },
    { id: 'course_1-files', title: { en: '3. Files & FS', ro: '3. Fișiere & FS' } },
    { id: 'course_1-perms', title: { en: '4. Permissions', ro: '4. Permisiuni' } },
    { id: 'course_1-cmds', title: { en: '5. Commands', ro: '5. Comenzi' } },
    { id: 'course_1-proc', title: { en: '6. Processes', ro: '6. Procese' } },
    { id: 'course_1-trouble', title: { en: '7. Troubleshooting', ro: '7. Depanare' } },
    { id: 'course_1-cheat', title: { en: 'Cheat Sheet', ro: 'Referință rapidă' } },
    { id: 'course_1-quiz', title: { en: 'Self-Test', ro: 'Autoevaluare' } },
  ],
  component: lazy(() => import('./courses/Course01.jsx'))
},
```

Repeat for all 11 courses. Extract the section IDs and short versions of titles from each CourseNN.jsx file. Use abbreviated titles (10-20 chars) for the sidebar labels.

- [ ] **Step 2: Commit**

```bash
git add src/content/os/index.js
git commit -m "feat: add section metadata to OS course entries for ProgressSidebar"
```

---

### Task 11b: Add Section Metadata to OOP Subject Index

**Files:**
- Modify: `src/content/oop/index.js`

- [ ] **Step 1: Add sections metadata to OOP index**

Same pattern as Task 11 but for OOP courses. For each of the 7 OOP course entries, add a `sections` array. Extract section IDs and short titles from each `src/content/oop/courses/CourseNN.jsx` file.

Example for oop-course_1 (6 sections):
```js
sections: [
  { id: 'oop-course_1-glossary', title: { en: '1. Glossary', ro: '1. Glosar' } },
  { id: 'oop-course_1-os-arch', title: { en: '2. OS Architecture', ro: '2. Arhitectura SO' } },
  // ... etc
],
```

- [ ] **Step 2: Commit**

```bash
git add src/content/oop/index.js
git commit -m "feat: add section metadata to OOP course entries for ProgressSidebar"
```

---

### Task 12: Rewrite SubjectPage for Per-Course Routing

**Files:**
- Modify: `src/pages/SubjectPage.jsx`

This is the main integration task. SubjectPage needs to:
1. Detect `course_N` in the wildcard URL param
2. When a specific course is selected: render three-column layout (Sidebar + Course Content + ProgressSidebar) with CourseTransition
3. When no course is selected (courses tab default): render CourseMap overview as before, but `onCourseClick` now navigates

- [ ] **Step 1: Rewrite SubjectPage**

```jsx
import React, { Suspense, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getSubject } from '../content/registry';
import Sidebar from '../components/layout/Sidebar';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import ContentTypeBar from '../components/ui/ContentTypeBar';
import CourseMap from '../components/ui/CourseMap';
import ProgressSidebar from '../components/ui/ProgressSidebar';
import CourseTransition from '../components/ui/CourseTransition';
import CourseNavigation from '../components/ui/CourseNavigation';
import { CourseBlock } from '../components/ui';

const LoadingFallback = () => {
  const { t } = useApp();
  return <div className="animate-pulse p-4 text-sm opacity-50">{t('Loading...', 'Se încarcă...')}</div>;
};

export default function SubjectPage({ sidebarOpen, setSidebarOpen }) {
  const { yearSem, subject: subjectSlug, '*': wildcard } = useParams();
  const navigate = useNavigate();
  const { lang, t, search, setSearch, checked } = useApp();
  const subject = getSubject(subjectSlug);

  // Detect course_N pattern in wildcard
  const courseMatch = wildcard?.match(/^course_(\d+)$/);
  const courseNum = courseMatch ? parseInt(courseMatch[1], 10) : null;

  // Determine active tab
  const tab = courseNum
    ? 'courses'
    : (['seminars', 'labs', 'practice', 'tests'].includes(wildcard) ? wildcard : 'courses');

  // Find the active course by number (course_1 = index 0)
  const activeCourseIndex = courseNum !== null
    ? subject?.courses?.findIndex(c => c.id.endsWith(`course_${courseNum}`)) ?? -1
    : -1;
  const activeCourse = activeCourseIndex >= 0 ? subject.courses[activeCourseIndex] : null;

  // Section metadata for ProgressSidebar
  const sectionIds = useMemo(() =>
    activeCourse?.sections?.map(s => s.id) || [],
    [activeCourse]
  );
  const sectionTitles = useMemo(() =>
    activeCourse?.sections?.map(s => s.title[lang]) || [],
    [activeCourse, lang]
  );

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
    const match = courseId.match(/course_(\d+)$/);
    if (match) {
      navigate(`/${yearSem}/${subjectSlug}/course_${match[1]}`);
    }
  };

  const showCourseMap = tab === 'courses' && !activeCourse && subject.courses.length > 0;

  return (
    <div className="flex flex-col flex-1">
      <ContentTypeBar subject={subject} activeTab={tab} onTabChange={handleTabChange} />

      <Breadcrumbs
        yearSem={yearSem}
        subject={subject}
        tab={tab}
        activeItemTitle={activeCourse ? activeCourse.shortTitle[lang] : undefined}
      />

      <div className="flex flex-1">
        {/* Left sidebar — show on courses tab or when viewing a specific course */}
        {tab === 'courses' && subject.courses.length > 0 && (
          <Sidebar
            subject={subject}
            activeCourseId={activeCourse?.id || null}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            yearSem={yearSem}
            subjectSlug={subjectSlug}
          />
        )}

        <main className="flex-1 max-w-5xl mx-auto p-4 lg:p-8 min-h-[calc(100vh-120px)]">
          {/* Courses tab — overview */}
          {tab === 'courses' && !activeCourse && (
            <>
              {showCourseMap && (
                <CourseMap subject={subject} onCourseClick={handleCourseClick} />
              )}

              {subject.courses.length === 0 && (
                <div className="text-center py-12 opacity-60">
                  <p className="text-4xl mb-4">{subject.icon}</p>
                  <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                  <p className="text-sm mt-2">{t('Course content will be added here.', 'Conținutul cursurilor va fi adăugat aici.')}</p>
                </div>
              )}
            </>
          )}

          {/* Courses tab — single course view */}
          {tab === 'courses' && activeCourse && (
            <CourseTransition courseIndex={activeCourseIndex}>
              <Suspense fallback={<LoadingFallback />}>
                {React.createElement(activeCourse.component)}
              </Suspense>
              <CourseNavigation
                items={subject.courses}
                currentIndex={activeCourseIndex}
                yearSem={yearSem}
                subjectSlug={subjectSlug}
              />
            </CourseTransition>
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
              {React.createElement(subject.practice)}
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

        {/* Right progress sidebar — only on single course view */}
        {tab === 'courses' && activeCourse && (
          <ProgressSidebar
            courseId={activeCourse.id}
            sectionCount={activeCourse.sectionCount}
            sectionIds={sectionIds}
            sectionTitles={sectionTitles}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the full flow works**

Run: `npm run dev`

Test these scenarios:
1. Navigate to `/#/y1s2/os` — CourseMap overview shows
2. Click a course tile — navigates to `/#/y1s2/os/course_1`, course content renders with left sidebar and right progress sidebar
3. Click different courses in left sidebar — slide transitions work, content swaps
4. Use prev/next at bottom of course — navigates and slides
5. Browser back/forward buttons work
6. Other tabs (seminars, labs, practice, tests) still work normally
7. Auto-progress: scroll through a section, checkbox marks automatically

- [ ] **Step 3: Commit**

```bash
git add src/pages/SubjectPage.jsx
git commit -m "feat: rewrite SubjectPage for per-course routing with three-column layout"
```

---

### Task 13: Remove Stale Code & Clean Up

**Files:**
- Modify: `src/pages/SubjectPage.jsx` (if any stale imports remain)
- Potentially: `src/components/ui/CourseBlock.jsx` (no changes needed — still used by seminars/labs/tests)

- [ ] **Step 1: Remove unused imports from SubjectPage**

Check that `StickyProgressBar`, `useStaggeredEntrance`, and the search-related state (`courseSearchStates`, `coursesRef`) are removed from SubjectPage since they're no longer used for the courses tab. The search functionality across all courses is removed (it was an inline search across CourseBlocks which no longer exist in course view).

If the search bar is still desired on the CourseMap overview page, keep the `search`/`setSearch` state but remove the `courseSearchStates` and `CSS.highlights` logic.

- [ ] **Step 2: Verify no console errors**

Run: `npm run dev`
Open browser dev console, navigate through the app. Confirm no warnings about missing props, unused state, etc.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove stale imports and inline search code from SubjectPage"
```

---

### Task 14: End-to-End Verification

- [ ] **Step 1: Full manual test**

Run: `npm run dev` and test the complete flow:

1. **Routing:** `/#/y1s2/os` shows CourseMap. `/#/y1s2/os/course_1` shows Course 1. Direct URL entry works.
2. **Left sidebar:** Active course is scaled with blue border. Hover shows subtle scale. Clicking navigates.
3. **Right progress sidebar:** Vertical segments with section labels. Clicking a label scrolls to that section. Mini ring at bottom.
4. **Auto-progress:** Open a section, scroll to the bottom → auto-checks if no Toggles. Open a Toggle first if Toggles exist → then scrolling to bottom auto-checks.
5. **Manual checkbox:** Still works. Unchecking doesn't get re-auto-checked.
6. **Slide transitions:** Going from course 1 to course 3 slides up. Going from course 3 to course 1 slides down.
7. **Celebration animations:** Check a section → green flash on segment, +1 floater, ring bounce. Complete all sections → segments merge, all green.
8. **Responsive:** Resize to mobile width — left sidebar becomes overlay, right progress sidebar hidden.
9. **Other tabs:** Seminars, labs, practice, tests all work as before.
10. **localStorage migration:** Clear `checked_v2_migrated` from localStorage, set some old `c1-intro` style keys, reload — verify they migrate to `course_1-intro`.

- [ ] **Step 2: Production build test**

Run: `npm run build`
Expected: Builds without errors.

- [ ] **Step 3: Final commit and push**

```bash
git add -A
git commit -m "feat: course progress redesign — per-course routing, auto-progress, progress sidebar, sidebar animations, slide transitions"
git push
```
