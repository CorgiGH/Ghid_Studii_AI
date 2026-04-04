# Animations & Micro-Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ADHD-friendly animations — rewarding progress celebrations, crunchy interactive feedback, smooth transitions — with zero new dependencies.

**Architecture:** CSS keyframes/transitions for most animations, one canvas-drawn effect for the completion vignette. A new `StickyProgressBar` replaces `ReadingProgress`. A `useStaggeredEntrance` hook provides reusable stagger logic. All animations respect `prefers-reduced-motion`.

**Tech Stack:** React 19, Tailwind CSS v4, CSS keyframes, Canvas 2D API

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/index.css` (append) | Keyframes: `floatUp`, `counterBounce`; animation tokens; `prefers-reduced-motion` |
| Create | `src/hooks/useStaggeredEntrance.js` | Hook: returns ref + className generator for staggered child reveal |
| Create | `src/components/ui/StickyProgressBar.jsx` | Segmented sticky bar + section celebration (green flash, +1, counter bounce) |
| Create | `src/components/ui/CompletionVignette.jsx` | Canvas-drawn clockwise inner vignette sweep |
| Modify | `src/components/layout/Sidebar.jsx:17-19` | Fix `top-0` → `top-20`, `h-screen` → `h-[calc(100vh-5rem)]` |
| Modify | `src/components/ui/Section.jsx` | Replace `animate-slide-down` with CSS transition accordion |
| Modify | `src/components/ui/Toggle.jsx` | Replace `animate-slide-down` with CSS transition accordion |
| Modify | `src/components/ui/CourseBlock.jsx` | Replace `hidden` toggle with CSS transition accordion + hover lift |
| Modify | `src/components/ui/SubjectCard.jsx` | Add hover lift + press-down |
| Modify | `src/components/ui/CourseMap.jsx` | Add staggered entrance to tiles |
| Modify | `src/pages/SubjectPage.jsx:187-188` | Swap `ReadingProgress` → `StickyProgressBar`, add completion vignette |
| Modify | `src/pages/Home.jsx:29` | Add staggered entrance to subject card grid |

---

### Task 1: CSS Foundation — Keyframes & Animation Tokens

**Files:**
- Modify: `src/index.css:64` (append after `:root` block)

- [ ] **Step 1: Add keyframes and animation tokens to index.css**

Append the following after the existing `:root { ... }` block in `src/index.css`:

```css
/* Animation keyframes */
@keyframes floatUp {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  50% { opacity: 1; transform: translateY(-18px) scale(1.15); }
  100% { opacity: 0; transform: translateY(-30px) scale(0.8); }
}

@keyframes counterBounce {
  0% { transform: scale(1); }
  35% { transform: scale(1.45); color: #4ade80; }
  100% { transform: scale(1); }
}

@keyframes checkCircle {
  from { stroke-dashoffset: 56.5; }
  to { stroke-dashoffset: 0; }
}

@keyframes checkPath {
  from { stroke-dashoffset: 20; }
  to { stroke-dashoffset: 0; }
}

/* Reduced motion: disable decorative animations */
@media (prefers-reduced-motion: reduce) {
  .animate-float-up,
  .animate-counter-bounce,
  .animate-slide-down {
    animation: none !important;
  }
  .stagger-child {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 2: Verify the dev server still compiles**

Run: `npm run dev`
Expected: No CSS errors, site loads normally.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add animation keyframes and reduced-motion support"
```

---

### Task 2: Bug Fix — Sidebar Sticky Offset

**Files:**
- Modify: `src/components/layout/Sidebar.jsx:17-19`

- [ ] **Step 1: Fix the sidebar sticky position**

In `src/components/layout/Sidebar.jsx`, change the `<aside>` className. Replace:

```jsx
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          w-60 h-screen overflow-y-auto
```

with:

```jsx
          fixed lg:sticky top-20 left-0 z-50 lg:z-auto
          w-60 h-[calc(100vh-5rem)] overflow-y-auto
```

This offsets the sidebar 80px down (`top-20`) to clear the TopBar + ContentTypeBar, and adjusts the height so it doesn't overflow at the bottom.

- [ ] **Step 2: Verify the fix**

Open the site, navigate to a subject with courses (e.g. OS). Scroll down — the sidebar should stay visible below the top bars, and the first course (Course 1) should be fully visible, not cut off.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.jsx
git commit -m "fix: sidebar first course cutoff — add top offset for sticky positioning"
```

---

### Task 3: Polished Accordion — Section Component

**Files:**
- Modify: `src/components/ui/Section.jsx`

- [ ] **Step 1: Rewrite Section with CSS transition accordion**

Replace the entire contents of `src/components/ui/Section.jsx` with:

```jsx
import React, { useState, useRef, useEffect } from 'react';

const Section = ({ title, id, children, checked, onCheck }) => {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');

  useEffect(() => {
    if (open && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight('0px');
    }
  }, [open]);

  // Re-measure when children change (e.g. nested toggles opening)
  useEffect(() => {
    if (!open || !contentRef.current) return;
    const observer = new ResizeObserver(() => {
      if (contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [open]);

  return (
    <div className="mb-3 border rounded-lg overflow-hidden transition-shadow hover:shadow-sm" id={id}
      style={{ borderColor: 'var(--theme-border)' }}
    >
      <div
        className="flex items-center gap-2 p-3 cursor-pointer transition-colors"
        style={{ backgroundColor: 'transparent' }}
        onClick={() => setOpen(!open)}
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
            className="inline-block transition-transform duration-350 mr-1"
            style={{
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
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
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          borderTop: open ? '1px solid var(--theme-border)' : '1px solid transparent',
        }}
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

- [ ] **Step 2: Verify the accordion**

Open any course, click a section header. It should expand smoothly (0.35s) with the chevron rotating. Click again — it should collapse smoothly. No `animate-slide-down` class should appear in the DOM.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Section.jsx
git commit -m "feat: polished accordion animation for Section component"
```

---

### Task 4: Polished Accordion — Toggle Component

**Files:**
- Modify: `src/components/ui/Toggle.jsx`

- [ ] **Step 1: Rewrite Toggle with CSS transition accordion**

Replace the entire contents of `src/components/ui/Toggle.jsx` with:

```jsx
import React, { useState, useRef, useEffect } from 'react';

const Toggle = ({ question, answer, hideLabel = 'Hide', showLabel = 'Show Answer' }) => {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');

  useEffect(() => {
    if (open && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight('0px');
    }
  }, [open]);

  useEffect(() => {
    if (!open || !contentRef.current) return;
    const observer = new ResizeObserver(() => {
      if (contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [open]);

  return (
    <div className="my-2 border rounded-lg overflow-hidden"
      style={{ borderColor: 'var(--theme-border)' }}
    >
      <div
        className="flex justify-between items-center p-3 cursor-pointer transition-colors"
        onClick={() => setOpen(!open)}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--theme-hover-bg)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span className="font-sans text-sm flex-1 pr-3">{question}</span>
        <button className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-px active:scale-97 whitespace-nowrap flex-shrink-0">
          {open ? hideLabel : showLabel}
        </button>
      </div>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{
          maxHeight,
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          borderTop: open ? '1px solid var(--theme-border)' : '1px solid transparent',
        }}
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

- [ ] **Step 2: Verify**

Open a Toggle Q&A in any course. It should expand/collapse smoothly. The "Show Answer" button should have a hover lift + press-down effect.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Toggle.jsx
git commit -m "feat: polished accordion animation for Toggle component"
```

---

### Task 5: Polished Accordion — CourseBlock Component

**Files:**
- Modify: `src/components/ui/CourseBlock.jsx`

- [ ] **Step 1: Rewrite CourseBlock with CSS transition accordion + hover lift**

Replace the entire contents of `src/components/ui/CourseBlock.jsx` with:

```jsx
import React, { useState, useEffect, useRef } from 'react';

const CourseBlock = ({ title, id, children, forceOpen, searchState }) => {
  const [userOpen, setUserOpen] = useState(false);
  const ref = useRef(null);
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');

  const open = searchState ? searchState === 'match' : userOpen;

  useEffect(() => {
    if (forceOpen) {
      setUserOpen(true);
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (open && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight('0px');
    }
  }, [open]);

  useEffect(() => {
    if (!open || !contentRef.current) return;
    const observer = new ResizeObserver(() => {
      if (contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [open]);

  return (
    <div
      ref={ref}
      className="mb-4 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
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
        <span
          className="inline-block mr-2 transition-transform duration-350"
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          ▸
        </span>
        {title}
      </div>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{
          maxHeight,
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="p-4" style={{ borderTop: '1px solid var(--theme-border)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CourseBlock;
```

- [ ] **Step 2: Verify**

Open a course — CourseBlock should expand/collapse smoothly with chevron rotation. On hover, the block should lift slightly with shadow. Clicking presses it back.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/CourseBlock.jsx
git commit -m "feat: polished accordion + hover lift for CourseBlock"
```

---

### Task 6: Interactive Elements — SubjectCard Hover Lift + Press-Down

**Files:**
- Modify: `src/components/ui/SubjectCard.jsx:13`

- [ ] **Step 1: Update SubjectCard hover/active classes**

In `src/components/ui/SubjectCard.jsx`, change the outer `<div>` className from:

```jsx
      className="rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group"
```

to:

```jsx
      className="rounded-xl p-6 cursor-pointer transition-all duration-150 hover:shadow-lg hover:-translate-y-1 active:translate-y-px active:scale-[0.98] active:shadow-sm group"
```

This adds the press-down effect (`active:translate-y-px active:scale-[0.98] active:shadow-sm`) and increases the hover lift from `0.5` to `1` (3px) for cards per spec.

- [ ] **Step 2: Verify**

On the home page, hover a subject card — it should lift up noticeably. Click — it should press down briefly. Release — it lifts back.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/SubjectCard.jsx
git commit -m "feat: hover lift + press-down for SubjectCard"
```

---

### Task 7: Staggered Entrance Hook

**Files:**
- Create: `src/hooks/useStaggeredEntrance.js`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useStaggeredEntrance.js`:

```jsx
import { useEffect, useRef, useState } from 'react';

/**
 * Returns a function that generates inline styles for each child index.
 * Children animate in with opacity + translateY, staggered by 80ms.
 *
 * Usage:
 *   const getStaggerStyle = useStaggeredEntrance(key);
 *   items.map((item, i) => <div style={getStaggerStyle(i)}>{item}</div>)
 *
 * @param {string|number} key - Changes to this trigger a new entrance animation
 * @param {object} opts - { delay: 80, duration: 250, maxStagger: 8 }
 */
export default function useStaggeredEntrance(key, opts = {}) {
  const { delay = 80, duration = 250, maxStagger = 8 } = opts;
  const [triggered, setTriggered] = useState(false);
  const prevKey = useRef(key);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTriggered(true);
      return;
    }

    setTriggered(false);
    const frame = requestAnimationFrame(() => {
      setTriggered(true);
    });
    prevKey.current = key;
    return () => cancelAnimationFrame(frame);
  }, [key]);

  return (index) => {
    if (triggered) {
      return {
        opacity: 1,
        transform: 'translateY(0)',
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        transitionDelay: `${Math.min(index, maxStagger) * delay}ms`,
      };
    }
    return {
      opacity: 0,
      transform: 'translateY(12px)',
    };
  };
}
```

- [ ] **Step 2: Verify the file was created**

Run: `ls src/hooks/useStaggeredEntrance.js`
Expected: File exists.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useStaggeredEntrance.js
git commit -m "feat: add useStaggeredEntrance hook for cascading reveal animations"
```

---

### Task 8: Staggered Entrance — Home Page Subject Cards

**Files:**
- Modify: `src/pages/Home.jsx:1-2,29-33`

- [ ] **Step 1: Add staggered entrance to the card grid**

In `src/pages/Home.jsx`, add the import at the top:

```jsx
import useStaggeredEntrance from '../hooks/useStaggeredEntrance';
```

Then inside the `Home` component, before the `return`, add:

```jsx
  const getStaggerStyle = useStaggeredEntrance('home');
```

Then change the subject card mapping from:

```jsx
            {ys.subjects.map(slug => {
              const subject = subjects.find(s => s.slug === slug);
              return subject ? <SubjectCard key={slug} subject={subject} /> : null;
            })}
```

to:

```jsx
            {ys.subjects.map((slug, i) => {
              const subject = subjects.find(s => s.slug === slug);
              return subject ? (
                <div key={slug} style={getStaggerStyle(i)}>
                  <SubjectCard subject={subject} />
                </div>
              ) : null;
            })}
```

- [ ] **Step 2: Verify**

Reload the home page. Subject cards should cascade in one by one with a slight upward slide + fade.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.jsx
git commit -m "feat: staggered entrance for home page subject cards"
```

---

### Task 9: Staggered Entrance — CourseMap Tiles

**Files:**
- Modify: `src/components/ui/CourseMap.jsx:1-3,59-83`

- [ ] **Step 1: Add staggered entrance to CourseMap tiles**

In `src/components/ui/CourseMap.jsx`, add the import:

```jsx
import useStaggeredEntrance from '../../hooks/useStaggeredEntrance';
```

Inside the `CourseMap` component, before `const courseProgress`, add:

```jsx
  const getStaggerStyle = useStaggeredEntrance(subject.slug);
```

Then wrap each tile `<button>` with a stagger style. Change the tile mapping from:

```jsx
          return (
            <button
              key={course.id}
              onClick={() => onCourseClick(course.id)}
              className="text-center p-3 rounded-xl cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-md"
```

to:

```jsx
          return (
            <button
              key={course.id}
              onClick={() => onCourseClick(course.id)}
              className="text-center p-3 rounded-xl cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:shadow-md active:translate-y-px active:scale-[0.98] active:shadow-sm"
              style={{
                ...getStaggerStyle(index),
                backgroundColor: tileBg,
                border: `1.5px solid ${tileBorder}`,
                opacity: !hasProgress && !isComplete ? 0.6 : getStaggerStyle(index).opacity,
              }}
```

Note: also change the `.map` to include `index`:

```jsx
        {courseProgress.map(({ course, completed, total }, index) => {
```

- [ ] **Step 2: Verify**

Navigate to a subject — the CourseMap tiles should cascade in. Hovering lifts them, clicking presses down.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/CourseMap.jsx
git commit -m "feat: staggered entrance + hover lift for CourseMap tiles"
```

---

### Task 10: Sticky Segmented Progress Bar

**Files:**
- Create: `src/components/ui/StickyProgressBar.jsx`

- [ ] **Step 1: Create StickyProgressBar component**

Create `src/components/ui/StickyProgressBar.jsx`:

```jsx
import React, { useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';

const StickyProgressBar = ({ courseId, sectionCount, courseName }) => {
  const { checked, t } = useApp();
  const prevCountRef = useRef(0);
  const segmentsRef = useRef(null);
  const counterRef = useRef(null);
  const barRef = useRef(null);

  if (!sectionCount || sectionCount === 0) return null;

  const prefix = `${courseId}-`;
  const completedCount = Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length;
  const isComplete = completedCount >= sectionCount;

  const celebrate = useCallback((segIndex) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const segments = segmentsRef.current?.children;
    const counter = counterRef.current;
    if (!segments || !counter) return;

    const seg = segments[segIndex];
    if (!seg) return;

    // 1. Green flash on the segment
    seg.style.transition = 'background 0.15s';
    seg.style.background = 'linear-gradient(90deg, #22c55e, #4ade80)';
    setTimeout(() => {
      seg.style.transition = 'background 0.5s';
      seg.style.background = '#3b82f6';
    }, 300);

    // 2. +1 floater
    const bar = barRef.current;
    if (bar) {
      const floater = document.createElement('div');
      floater.textContent = '+1';
      floater.style.cssText = `
        position: absolute;
        left: ${seg.offsetLeft + seg.offsetWidth / 2 - 10}px;
        top: -6px;
        color: #4ade80;
        font-size: 15px;
        font-weight: bold;
        pointer-events: none;
        animation: floatUp 0.7s ease-out forwards;
        text-shadow: 0 0 8px rgba(74,222,128,0.5);
        z-index: 10;
      `;
      bar.appendChild(floater);
      setTimeout(() => floater.remove(), 700);
    }

    // 3. Counter bounce
    counter.style.animation = 'counterBounce 0.45s ease';
    setTimeout(() => { counter.style.animation = ''; }, 450);
  }, []);

  const celebrateComplete = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const segments = segmentsRef.current;
    const counter = counterRef.current;
    if (!segments || !counter) return;

    // Segments merge: close gaps, flatten inner radii
    setTimeout(() => {
      segments.style.gap = '0px';
      Array.from(segments.children).forEach((s, i) => {
        s.style.transition = 'background 0.4s, border-radius 0.4s';
        s.style.background = '#22c55e';
        if (i === 0) s.style.borderRadius = '4px 0 0 4px';
        else if (i === sectionCount - 1) s.style.borderRadius = '0 4px 4px 0';
        else s.style.borderRadius = '0';
      });
    }, 400);

    // Counter updates to "Complete"
    setTimeout(() => {
      counter.textContent = t('Complete', 'Complet');
      counter.style.color = '#22c55e';
    }, 700);
  }, [sectionCount, t]);

  // Detect changes and fire celebrations
  useEffect(() => {
    const prev = prevCountRef.current;
    if (completedCount > prev && prev > 0) {
      // Find which segment just got completed (approximate: use completedCount - 1)
      celebrate(completedCount - 1);

      if (completedCount >= sectionCount) {
        celebrateComplete();
      }
    }
    prevCountRef.current = completedCount;
  }, [completedCount, sectionCount, celebrate, celebrateComplete]);

  return (
    <div
      className="sticky z-10 py-2 px-3 -mx-4 mb-4"
      style={{
        top: '5rem',
        backgroundColor: 'var(--theme-content-bg)',
        borderBottom: '1px solid var(--theme-border)',
      }}
    >
      <div className="flex items-center gap-2 text-xs mb-1.5" style={{ color: 'var(--theme-muted-text)' }}>
        <span className="truncate">{courseName}</span>
        <span
          ref={counterRef}
          className="ml-auto font-bold whitespace-nowrap"
        >
          {isComplete ? t('Complete', 'Complet') : `${completedCount}/${sectionCount}`}
        </span>
      </div>
      <div className="relative overflow-visible" ref={barRef}>
        <div
          ref={segmentsRef}
          className="flex h-2"
          style={{ gap: isComplete ? '0px' : '3px', transition: 'gap 0.4s ease' }}
        >
          {Array.from({ length: sectionCount }, (_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                borderRadius: isComplete
                  ? (i === 0 ? '4px 0 0 4px' : i === sectionCount - 1 ? '0 4px 4px 0' : '0')
                  : '4px',
                background: i < completedCount
                  ? (isComplete ? '#22c55e' : '#3b82f6')
                  : 'var(--theme-border)',
                transition: 'background 0.3s, border-radius 0.4s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StickyProgressBar;
```

- [ ] **Step 2: Verify the file was created**

Run: `ls src/components/ui/StickyProgressBar.jsx`
Expected: File exists.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/StickyProgressBar.jsx
git commit -m "feat: StickyProgressBar with segmented bar + section celebration effects"
```

---

### Task 11: Completion Vignette Canvas Component

**Files:**
- Create: `src/components/ui/CompletionVignette.jsx`

- [ ] **Step 1: Create CompletionVignette component**

Create `src/components/ui/CompletionVignette.jsx`:

```jsx
import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Canvas-drawn clockwise inner vignette sweep.
 * Mount inside a container with overflow:hidden and position:relative.
 * Set `trigger` to true to fire the animation once.
 */
const CompletionVignette = ({ trigger, onComplete }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const getPerimeterPoints = useCallback((w, h, r, numPoints) => {
    const points = [];
    const straightTop = w - 2 * r;
    const straightRight = h - 2 * r;
    const straightBottom = w - 2 * r;
    const straightLeft = h - 2 * r;
    const cornerArc = Math.PI * r / 2;

    const segments = [
      { type: 'line', len: straightTop },
      { type: 'arc', cx: w - r, cy: r, startAngle: -Math.PI / 2, len: cornerArc },
      { type: 'line', len: straightRight },
      { type: 'arc', cx: w - r, cy: h - r, startAngle: 0, len: cornerArc },
      { type: 'line', len: straightBottom },
      { type: 'arc', cx: r, cy: h - r, startAngle: Math.PI / 2, len: cornerArc },
      { type: 'line', len: straightLeft },
      { type: 'arc', cx: r, cy: r, startAngle: Math.PI, len: cornerArc },
    ];
    const lineStarts = [
      { x: r, y: 0, dx: 1, dy: 0 },
      { x: w, y: r, dx: 0, dy: 1 },
      { x: w - r, y: h, dx: -1, dy: 0 },
      { x: 0, y: h - r, dx: 0, dy: -1 },
    ];

    const perimeter = segments.reduce((s, seg) => s + seg.len, 0);
    for (let i = 0; i < numPoints; i++) {
      let remaining = (i / numPoints) * perimeter;
      let x = r, y = 0, lineIdx = 0;
      for (let s = 0; s < segments.length; s++) {
        const seg = segments[s];
        if (remaining <= seg.len) {
          if (seg.type === 'line') {
            const ls = lineStarts[lineIdx];
            x = ls.x + ls.dx * remaining;
            y = ls.y + ls.dy * remaining;
          } else {
            const angle = seg.startAngle + (remaining / r);
            x = seg.cx + r * Math.cos(angle);
            y = seg.cy + r * Math.sin(angle);
          }
          break;
        }
        remaining -= seg.len;
        if (seg.type === 'line') lineIdx++;
      }
      points.push({ x, y });
    }
    return points;
  }, []);

  const drawGlow = useCallback((ctx, px, py, radius, alpha) => {
    if (alpha < 0.003) return;
    const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
    grad.addColorStop(0, `rgba(34, 197, 94, ${alpha})`);
    grad.addColorStop(0.5, `rgba(34, 197, 94, ${alpha * 0.4})`);
    grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
  }, []);

  useEffect(() => {
    if (!trigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete?.();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const r = 12;
    const numPoints = 180;
    const points = getPerimeterPoints(w, h, r, numPoints);
    const glowRadius = 50;
    const holdAlpha = 0.09;
    const settled = new Float32Array(numPoints);

    const startTime = performance.now();
    const sweepDuration = 1200;
    const tailLength = 0.25;
    const fadeDuration = 800;

    function animate(now) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, w, h);

      if (elapsed < sweepDuration) {
        const progress = elapsed / sweepDuration;
        const eased = 1 - Math.pow(1 - progress, 2);
        const headPos = eased;

        for (let i = 0; i < numPoints; i++) {
          const pointPos = i / numPoints;
          let behind = headPos - pointPos;
          if (behind < 0) behind += 1;

          let alpha = 0;
          if (behind >= 0 && behind < headPos) {
            if (behind <= tailLength) {
              const falloff = behind / tailLength;
              alpha = 0.2 * Math.cos(falloff * Math.PI / 2);
            }
            const timeSincePassed = headPos - pointPos;
            const settleProgress = Math.min(timeSincePassed / 0.3, 1);
            settled[i] = holdAlpha * settleProgress;
            alpha = Math.max(alpha, settled[i]);
          }
          if (alpha > 0) drawGlow(ctx, points[i].x, points[i].y, glowRadius, alpha);
        }
        animRef.current = requestAnimationFrame(animate);

      } else if (elapsed < sweepDuration + fadeDuration) {
        const fadeProgress = (elapsed - sweepDuration) / fadeDuration;
        const alpha = holdAlpha * (1 - fadeProgress * fadeProgress);
        for (let i = 0; i < numPoints; i++) {
          drawGlow(ctx, points[i].x, points[i].y, glowRadius, alpha);
        }
        animRef.current = requestAnimationFrame(animate);

      } else {
        ctx.clearRect(0, 0, w, h);
        onComplete?.();
      }
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [trigger, getPerimeterPoints, drawGlow, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    />
  );
};

export default CompletionVignette;
```

- [ ] **Step 2: Verify the file was created**

Run: `ls src/components/ui/CompletionVignette.jsx`
Expected: File exists.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/CompletionVignette.jsx
git commit -m "feat: CompletionVignette canvas component for course completion glow"
```

---

### Task 12: Wire Up Progress Bar + Vignette in SubjectPage

**Files:**
- Modify: `src/pages/SubjectPage.jsx:9,187-189`

- [ ] **Step 1: Replace ReadingProgress import with StickyProgressBar**

In `src/pages/SubjectPage.jsx`, change the import on line 9 from:

```jsx
import ReadingProgress from '../components/ui/ReadingProgress';
```

to:

```jsx
import StickyProgressBar from '../components/ui/StickyProgressBar';
```

- [ ] **Step 2: Replace ReadingProgress usage with StickyProgressBar**

In the course rendering section (~line 187), change:

```jsx
                        {course.sectionCount > 0 && (
                          <ReadingProgress courseId={course.id} sectionCount={course.sectionCount} />
                        )}
```

to:

```jsx
                        {course.sectionCount > 0 && (
                          <StickyProgressBar
                            courseId={course.id}
                            sectionCount={course.sectionCount}
                            courseName={course.shortTitle[lang]}
                          />
                        )}
```

- [ ] **Step 3: Verify**

Open a course with sections. The sticky segmented bar should appear at the top. Scroll down — it should follow. Check off a section — green flash, +1 floater, and counter bounce should fire.

- [ ] **Step 4: Commit**

```bash
git add src/pages/SubjectPage.jsx
git commit -m "feat: wire StickyProgressBar into SubjectPage, replacing ReadingProgress"
```

---

### Task 13: Wire Completion Vignette into CourseBlock

**Files:**
- Modify: `src/components/ui/CourseBlock.jsx:1-2,16-38`

- [ ] **Step 1: Add vignette to CourseBlock**

In `src/components/ui/CourseBlock.jsx`, add imports at the top:

```jsx
import CompletionVignette from './CompletionVignette';
import { useApp } from '../../contexts/AppContext';
```

Inside the component, add state for the vignette trigger. After the existing state/refs, add:

```jsx
  const { checked } = useApp();
  const [vignetteActive, setVignetteActive] = useState(false);
  const [showGreenBorder, setShowGreenBorder] = useState(false);
```

The `CourseBlock` doesn't know `courseId` or `sectionCount` directly. We need to pass these as optional props. Update the function signature:

```jsx
const CourseBlock = ({ title, id, children, forceOpen, searchState, courseId, sectionCount }) => {
```

After the existing `useEffect` hooks, add:

```jsx
  // Detect course completion for vignette
  const prevCompleteRef = useRef(false);
  const isComplete = courseId && sectionCount > 0
    ? Object.keys(checked).filter(k => k.startsWith(`${courseId}-`) && checked[k]).length >= sectionCount
    : false;

  useEffect(() => {
    if (isComplete && !prevCompleteRef.current && open) {
      setTimeout(() => setVignetteActive(true), 500);
    }
    prevCompleteRef.current = isComplete;
  }, [isComplete, open]);

  useEffect(() => {
    if (isComplete) setShowGreenBorder(true);
    else setShowGreenBorder(false);
  }, [isComplete]);
```

Update the outer div's style to add the green border when complete:

```jsx
      style={{
        border: `2px solid ${showGreenBorder ? 'rgba(34,197,94,0.35)' : 'var(--theme-border)'}`,
        boxShadow: showGreenBorder ? '0 0 12px rgba(34,197,94,0.08)' : undefined,
        transition: 'border-color 0.5s, box-shadow 0.5s',
        position: 'relative',
        overflow: 'hidden',
      }}
```

Inside the outer div, right before the header `<div>`, add:

```jsx
      <CompletionVignette
        trigger={vignetteActive}
        onComplete={() => setVignetteActive(false)}
      />
```

- [ ] **Step 2: Pass courseId and sectionCount from SubjectPage**

In `src/pages/SubjectPage.jsx`, update the `<CourseBlock>` render (~line 180) to pass the new props:

```jsx
                      <CourseBlock
                        key={course.id}
                        title={course.title[lang]}
                        id={course.id}
                        forceOpen={activeCourseId === course.id}
                        searchState={courseSearchStates[course.id]}
                        courseId={course.id}
                        sectionCount={course.sectionCount}
                      >
```

- [ ] **Step 3: Verify**

Open a course, check off all sections. After the last one: the progress bar celebration fires, then segments merge to green, checkmark draws, and the green vignette sweeps clockwise inside the CourseBlock, fading to a green border.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/CourseBlock.jsx src/pages/SubjectPage.jsx
git commit -m "feat: wire CompletionVignette into CourseBlock for course completion glow"
```

---

### Task 14: Staggered Entrance — Course Sections in SubjectPage

**Files:**
- Modify: `src/pages/SubjectPage.jsx:176-201`

- [ ] **Step 1: Add staggered entrance for CourseBlock list**

In `src/pages/SubjectPage.jsx`, add the import:

```jsx
import useStaggeredEntrance from '../hooks/useStaggeredEntrance';
```

Inside the `SubjectPage` component, add after the existing state declarations:

```jsx
  const getStaggerStyle = useStaggeredEntrance(tab + '-' + subjectSlug);
```

Then wrap each `<CourseBlock>` with the stagger style. Change the course map (~line 177):

```jsx
                <div ref={coursesRef}>
                  {subject.courses.map((course, index) => {
                    const CourseContent = course.component;
                    return (
                      <div key={course.id} style={getStaggerStyle(index)}>
                        <CourseBlock
                          title={course.title[lang]}
                          id={course.id}
                          forceOpen={activeCourseId === course.id}
                          searchState={courseSearchStates[course.id]}
                          courseId={course.id}
                          sectionCount={course.sectionCount}
                        >
                          {course.sectionCount > 0 && (
                            <StickyProgressBar
                              courseId={course.id}
                              sectionCount={course.sectionCount}
                              courseName={course.shortTitle[lang]}
                            />
                          )}
                          <Suspense fallback={<LoadingFallback />}>
                            <CourseContent />
                          </Suspense>
                          <CourseNavigation
                            items={subject.courses}
                            currentIndex={index}
                            onNavigate={handleCourseClick}
                          />
                        </CourseBlock>
                      </div>
                    );
                  })}
                </div>
```

- [ ] **Step 2: Verify**

Navigate to a subject's Courses tab. The CourseBlock items should cascade in from top to bottom with slight upward slide + fade.

- [ ] **Step 3: Commit**

```bash
git add src/pages/SubjectPage.jsx
git commit -m "feat: staggered entrance for course blocks on subject page"
```

---

### Task 15: Final Verification + Cleanup

**Files:**
- All modified files

- [ ] **Step 1: Remove unused ReadingProgress import reference**

Check if `ReadingProgress` is imported anywhere else. Run:
```bash
grep -r "ReadingProgress" src/
```
If only `ReadingProgress.jsx` itself remains (no more imports), the file is dead code. Leave it in place for now — it can be removed in a future cleanup.

- [ ] **Step 2: Full smoke test**

Open the site and verify all animations:

1. **Home page**: subject cards stagger in on load
2. **Subject page**: CourseMap tiles stagger in, hover lifts, click presses
3. **Course blocks**: smooth accordion expand/collapse, chevron rotates
4. **Sections inside courses**: smooth accordion, no `animate-slide-down`
5. **Toggle Q&As**: smooth accordion
6. **Progress bar**: sticky, follows scroll, segments visible
7. **Check off a section**: green flash + "+1" floater + counter bounce
8. **Check off ALL sections**: segments merge, checkmark draws, "Complete" text, green vignette sweep, green border remains
9. **Sidebar**: first course is not cut off behind the top bars
10. **SubjectCard**: hover lifts with shadow, click presses down

- [ ] **Step 3: Test reduced motion**

In browser DevTools, enable "Prefers reduced motion". Verify:
- No floaters, no vignette, no stagger animation
- Progress bar still updates count text
- Expand/collapse still works (transitions are fast)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete animations system — progress celebrations, interactive feedback, smooth transitions"
```

- [ ] **Step 5: Push**

```bash
git push
```
