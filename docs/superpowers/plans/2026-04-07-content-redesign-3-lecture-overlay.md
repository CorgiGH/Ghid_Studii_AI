# Plan 3: Lecture Overlay — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist lecture toggle state in localStorage and animate lecture blocks sliding in/out smoothly.

**Architecture:** Add `lectureVisible` to AppContext as a localStorage-backed boolean. Replace the hard `return null` in BlockRenderer with a max-height + opacity CSS transition wrapper so lecture blocks slide in/out without layout jumps. Add lecture blocks to the sample JSON course for testing.

**Tech Stack:** React 19, CSS transitions (max-height + opacity pattern already used by ThinkBlock/QuizBlock), useLocalStorage hook

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/contexts/AppContext.jsx` | Add `lectureVisible` + `toggleLecture` to context |
| Modify | `src/components/blocks/BlockRenderer.jsx` | Replace `return null` with animated wrapper |
| Modify | `src/components/blocks/CourseRenderer.jsx` | Read `lectureVisible` from context instead of local state |
| Modify | `src/content/os/courses/course-01-sample.json` | Add lecture blocks to step 1 for testing |

---

### Task 1: Add lecture blocks to sample JSON for testing

**Files:**
- Modify: `src/content/os/courses/course-01-sample.json`

- [ ] **Step 1: Add lecture blocks to step 1 ("What is Linux?")**

Add three lecture blocks (one of each type) after the existing `think` block in step `os-c1-intro`:

```json
{
  "type": "lecture",
  "slides": "1-4",
  "note": {
    "en": "The professor introduces Linux history and kernel architecture in these slides.",
    "ro": "Profesorul introduce istoria Linux și arhitectura nucleului în aceste slide-uri."
  }
},
{
  "type": "lecture-video",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "Linux Kernel Explained",
  "duration": "12:34",
  "relevance": "Covers kernel vs userspace"
},
{
  "type": "lecture-exam",
  "note": {
    "en": "Define the role of the kernel — appeared frequently in exams.",
    "ro": "Definiți rolul nucleului — a apărut frecvent la examene."
  },
  "frequency": 0.85,
  "years": ["2025", "2024", "2023", "2022"]
}
```

Insert these after the `think` block (index 3) and before the end of the blocks array in the first step.

- [ ] **Step 2: Verify dev server renders the blocks**

Run: `npm run dev`

Navigate to `/#/y1s2/os/course_12` → Step 1. Toggle lecture ON in the sticky header. All three lecture blocks should appear: the indigo note block, the video link, and the amber exam block with "85%" badge.

- [ ] **Step 3: Commit**

```bash
git add src/content/os/courses/course-01-sample.json
git commit -m "test: add lecture blocks to sample JSON for overlay testing"
```

---

### Task 2: Persist lecture toggle in AppContext via localStorage

**Files:**
- Modify: `src/contexts/AppContext.jsx`
- Modify: `src/components/blocks/CourseRenderer.jsx`

- [ ] **Step 1: Add lectureVisible state to AppContext**

In `src/contexts/AppContext.jsx`, add a new `useLocalStorage` state and a toggle callback. Inside `AppProvider`, after the `progress` state line (line 48):

```jsx
const [lectureVisible, setLectureVisible] = useLocalStorage('lectureVisible', false);
const toggleLecture = useCallback(() => setLectureVisible(v => !v), []);
```

Add `lectureVisible`, `toggleLecture` to the `value` useMemo object and its dependency array.

- [ ] **Step 2: Update CourseRenderer to use context instead of local state**

In `src/components/blocks/CourseRenderer.jsx`:

1. Add `lectureVisible` and `toggleLecture` to the destructured `useApp()` call (line 8):
```jsx
const { t, markVisited, progress, toggleUnderstood, lectureVisible, toggleLecture } = useApp();
```

2. Remove the local state line (line 13):
```jsx
// DELETE: const [lectureVisible, setLectureVisible] = useState(false);
```

3. In the toggle button's `onClick` (line 169), replace:
```jsx
onClick={() => setLectureVisible(v => !v)}
```
with:
```jsx
onClick={toggleLecture}
```

- [ ] **Step 3: Verify persistence works**

Run: `npm run dev`

1. Navigate to `/#/y1s2/os/course_12` → toggle lecture ON → lecture blocks appear
2. Hard-refresh the page (Ctrl+Shift+R) → toggle should still be ON, lecture blocks still visible
3. Open browser DevTools → Application → Local Storage → confirm `lectureVisible` key is `true`
4. Navigate to a different step → toggle state persists

- [ ] **Step 4: Commit**

```bash
git add src/contexts/AppContext.jsx src/components/blocks/CourseRenderer.jsx
git commit -m "feat: persist lecture toggle state in localStorage"
```

---

### Task 3: Animate lecture blocks sliding in/out

**Files:**
- Modify: `src/components/blocks/BlockRenderer.jsx`

- [ ] **Step 1: Replace hard return null with animated wrapper**

The current `BlockRenderer.jsx` does `if (block.type.startsWith('lecture') && !lectureVisible) return null;` — this causes a hard cut. Replace the entire file with an animated version using the same max-height + opacity pattern that ThinkBlock/QuizBlock already use (per the project's "no layout jumps" rule):

```jsx
import React, { Suspense, useRef, useEffect, useState } from 'react';
import registry from './registry';
import UnknownBlock from './UnknownBlock';

export default function BlockRenderer({ block, lectureVisible }) {
  const isLecture = block.type.startsWith('lecture');
  const shouldShow = !isLecture || lectureVisible;

  const Component = registry[block.type];
  if (!Component) {
    // Non-lecture unknown blocks always render; lecture unknown blocks follow toggle
    if (isLecture && !lectureVisible) return null;
    return <UnknownBlock type={block.type} />;
  }

  // Non-lecture blocks render directly — no animation wrapper overhead
  if (!isLecture) {
    return (
      <Suspense fallback={<div className="animate-pulse h-8 rounded" style={{ backgroundColor: 'var(--theme-border)' }} />}>
        <Component {...block} />
      </Suspense>
    );
  }

  // Lecture blocks get animated wrapper
  return (
    <LectureBlockWrapper visible={shouldShow}>
      <Suspense fallback={<div className="animate-pulse h-8 rounded" style={{ backgroundColor: 'var(--theme-border)' }} />}>
        <Component {...block} />
      </Suspense>
    </LectureBlockWrapper>
  );
}

function LectureBlockWrapper({ visible, children }) {
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(visible ? 'none' : '0px');
  const [opacity, setOpacity] = useState(visible ? 1 : 0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on first render — just set the correct state
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (visible) {
      // Expanding: measure content, animate to that height
      const el = contentRef.current;
      if (!el) return;
      const height = el.scrollHeight;
      setMaxHeight(`${height}px`);
      setOpacity(1);
      // After transition completes, remove max-height constraint so content can reflow
      const timer = setTimeout(() => setMaxHeight('none'), 350);
      return () => clearTimeout(timer);
    } else {
      // Collapsing: set explicit height first, then animate to 0
      const el = contentRef.current;
      if (!el) return;
      const height = el.scrollHeight;
      setMaxHeight(`${height}px`);
      // Force layout before animating to 0
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight;
      requestAnimationFrame(() => {
        setMaxHeight('0px');
        setOpacity(0);
      });
    }
  }, [visible]);

  return (
    <div
      ref={contentRef}
      style={{
        maxHeight,
        opacity,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease, opacity 0.25s ease',
      }}
    >
      {children}
    </div>
  );
}
```

Key design decisions:
- Non-lecture blocks have **zero wrapper overhead** — rendered directly as before
- Lecture blocks always mount (DOM stays in tree) so the wrapper can animate height
- On expand: measure `scrollHeight`, animate `maxHeight` from `0px` → `Npx`, then set `none` for reflow
- On collapse: snapshot `scrollHeight`, force layout, then animate to `0px` + fade out
- First render skips animation (respects persisted toggle state without a flash)

- [ ] **Step 2: Verify animations work**

Run: `npm run dev`

Navigate to `/#/y1s2/os/course_12` → Step 1:
1. Toggle lecture OFF → all three lecture blocks should smoothly slide up and fade out (~300ms)
2. Toggle lecture ON → blocks should smoothly slide down and fade in (~300ms)
3. No layout jumps — the content below should shift smoothly
4. Toggle rapidly 3-4 times — no glitches or stuck states
5. Navigate to Step 2 (no lecture blocks) → toggle ON/OFF — no errors
6. Navigate back to Step 1 → lecture blocks should match current toggle state without animation flash

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/BlockRenderer.jsx
git commit -m "feat: smooth slide animations for lecture block toggle"
```

---

### Task 4: Final verification

- [ ] **Step 1: Full smoke test**

Run: `npm run dev` and verify:

1. **Persistence:** Toggle lecture ON → hard refresh → still ON. Toggle OFF → hard refresh → still OFF.
2. **Animation:** Lecture blocks slide in/out smoothly without layout jumps.
3. **No regression on non-lecture blocks:** Navigate through all 3 steps of the sample course — learn, definition, callout, think, quiz, code blocks all render correctly.
4. **Legacy JSX courses unaffected:** Navigate to `/#/y1s2/os/course_1` (old JSX course) — renders normally, no errors.
5. **Theme compatibility:** Switch palettes and dark/light mode — lecture blocks respect theme colors.
6. **Build passes:** Run `npm run build` — no errors.

- [ ] **Step 2: Commit and push**

```bash
git add -A
git commit -m "feat: Plan 3 complete — lecture overlay with persistence and animations"
git push
```

---

## Summary of Changes

| What | How |
|------|-----|
| Lecture toggle persistence | `useLocalStorage('lectureVisible', false)` in AppContext, exposed as `lectureVisible` + `toggleLecture` |
| Smooth animations | `LectureBlockWrapper` in BlockRenderer uses max-height + opacity transitions |
| No layout jumps | Lecture blocks stay mounted (DOM in tree), animated via CSS, `overflow: hidden` during transition |
| Zero overhead for non-lecture blocks | Only lecture-type blocks get the animation wrapper |
| Testable | Sample JSON now includes all 3 lecture block types in step 1 |
