# Progress System Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat boolean `checked` progress system with two-dimensional tracking (visited + understood) for JSON courses, while keeping the old `checked`/`toggleCheck` system working for legacy JSX courses.

**Architecture:** AppContext gets new `markVisited(stepId)` and `toggleUnderstood(stepId)` functions that write to a `progress` localStorage object with shape `{ [stepId]: { visited: bool, understood: bool } }`. The existing `checked`/`toggleCheck` stays untouched for legacy JSX courses (Section component still uses it). CourseRenderer auto-marks steps visited on navigation and shows an "I understand" button. InlineProgress, ProgressRing, CourseMap, and Sidebar are updated to read from the new `progress` object when rendering JSON courses (detected by presence of `src` on the course entry).

**Tech Stack:** React 19, useLocalStorage hook, AppContext

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| None | All changes are modifications to existing files |

### Modified files
| File | Changes |
|------|---------|
| `src/contexts/AppContext.jsx` | Add `progress` state + `markVisited` + `toggleUnderstood` + expose in context |
| `src/components/blocks/CourseRenderer.jsx` | Call `markVisited` on step navigation, pass `progress` to StepRenderer |
| `src/components/blocks/StepRenderer.jsx` | Add "I understand" button at bottom of step |
| `src/components/ui/InlineProgress.jsx` | Support JSON courses: read from `progress` when course has `src` |
| `src/components/ui/ProgressRing.jsx` | Accept optional `visited` count for two-tone display |
| `src/components/ui/CourseMap.jsx` | Read from `progress` for JSON courses |
| `src/components/layout/Sidebar.jsx` | Read from `progress` for JSON courses |
| `src/pages/SubjectPage.jsx` | Pass `isJsonCourse` flag and step data to InlineProgress |

---

### Task 1: Add Progress State to AppContext

**Files:**
- Modify: `src/contexts/AppContext.jsx`

- [ ] **Step 1: Add progress localStorage state and helper functions**

In `src/contexts/AppContext.jsx`, add a new `progress` state and two helper functions. Add this inside `AppProvider`, after the existing `useLocalStorage` calls (after line 47):

```jsx
const [progress, setProgress] = useLocalStorage('progress', {});

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
```

- [ ] **Step 2: Expose in context value**

Add `progress`, `markVisited`, and `toggleUnderstood` to the `value` useMemo (line 89):

```jsx
const value = useMemo(() => ({
  dark, setDark, toggleDark,
  lang, setLang, toggleLang,
  palette, setPalette,
  search, setSearch,
  checked, setChecked, toggleCheck,
  progress, markVisited, toggleUnderstood,
  t, highlight,
  sidebarLocked, setSidebarLocked, toggleSidebarLock,
  chatOpen, setChatOpen, toggleChat,
  chatWidth, setChatWidth,
}), [dark, lang, palette, search, checked, t, toggleCheck, highlight, toggleDark, toggleLang, sidebarLocked, chatOpen, toggleSidebarLock, toggleChat, chatWidth, progress, markVisited, toggleUnderstood]);
```

- [ ] **Step 3: Verify app loads**

Run: `npm run dev`
Expected: App loads without errors, no console warnings about missing context values.

- [ ] **Step 4: Commit**

```bash
git add src/contexts/AppContext.jsx
git commit -m "feat: add progress state with markVisited/toggleUnderstood to AppContext"
```

---

### Task 2: Integrate Progress into CourseRenderer

**Files:**
- Modify: `src/components/blocks/CourseRenderer.jsx`

- [ ] **Step 1: Import and use progress functions**

In `CourseRenderer.jsx`, update the `useApp` destructure (line 8) and add `markVisited` call on step changes:

```jsx
const { t, markVisited } = useApp();
```

Add an effect after the `goToStep` callback (after line 39) to mark the current step as visited:

```jsx
// Auto-mark step as visited when navigating
useEffect(() => {
  if (!step?.id) return;
  markVisited(step.id);
}, [step?.id, markVisited]);
```

- [ ] **Step 2: Update progress strip to use real progress data**

Replace the progress strip (lines 104-121) to read from `progress` state:

```jsx
const { t, markVisited, progress, toggleUnderstood } = useApp();
```

Update the progress strip rendering to use two-tone colors (visited vs understood):

```jsx
{/* Progress strip */}
<div className="flex gap-0.5 mb-5">
  {courseData.steps.map((s, i) => {
    const stepProgress = progress[s.id];
    const isUnderstood = stepProgress?.understood;
    const isVisited = stepProgress?.visited;
    let bgColor;
    if (i === currentStep) bgColor = '#3b82f6';
    else if (isUnderstood) bgColor = '#10b981';
    else if (isVisited) bgColor = 'rgba(59, 130, 246, 0.35)';
    else bgColor = 'var(--theme-border)';
    return (
      <div
        key={s.id}
        className="flex-1 h-1 rounded-sm cursor-pointer transition-colors"
        style={{
          backgroundColor: bgColor,
          boxShadow: i === currentStep ? '0 0 6px rgba(59,130,246,0.4)' : 'none',
        }}
        onClick={() => goToStep(i)}
        title={t(s.title.en, s.title.ro)}
      />
    );
  })}
</div>
```

- [ ] **Step 3: Pass toggleUnderstood and progress to StepRenderer**

Update the StepRenderer invocation (line 133) to pass the callback and current step progress:

```jsx
<CourseTransition courseIndex={currentStep}>
  <StepRenderer
    step={step}
    lectureVisible={lectureVisible}
    isUnderstood={!!progress[step.id]?.understood}
    onToggleUnderstood={() => toggleUnderstood(step.id)}
  />
</CourseTransition>
```

- [ ] **Step 4: Verify JSON course renders with progress strip**

Run: `npm run dev`
Navigate to `/#/y1s2/os/course_12` (the JSON test course). Verify:
- Steps auto-mark as visited (lighter blue in strip)
- Progress strip shows current step in solid blue
- No console errors

- [ ] **Step 5: Commit**

```bash
git add src/components/blocks/CourseRenderer.jsx
git commit -m "feat: integrate visited/understood progress tracking in CourseRenderer"
```

---

### Task 3: Add "I Understand" Button to StepRenderer

**Files:**
- Modify: `src/components/blocks/StepRenderer.jsx`

- [ ] **Step 1: Add the understood button**

Replace the entire `StepRenderer.jsx` with:

```jsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import BlockRenderer from './BlockRenderer';

export default function StepRenderer({ step, lectureVisible, isUnderstood, onToggleUnderstood }) {
  const { t } = useApp();

  if (!step || !step.blocks) return null;

  return (
    <div>
      {step.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} lectureVisible={lectureVisible} />
      ))}

      {/* "I understand" button */}
      <div className="flex justify-center mt-8 mb-2">
        <button
          onClick={onToggleUnderstood}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          style={{
            backgroundColor: isUnderstood ? '#10b981' : 'transparent',
            color: isUnderstood ? '#fff' : '#10b981',
            border: `2px solid ${isUnderstood ? '#10b981' : '#10b98180'}`,
            boxShadow: isUnderstood ? '0 2px 12px rgba(16,185,129,0.3)' : 'none',
          }}
        >
          {isUnderstood ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('Understood!', 'Am înțeles!')}
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              {t('I understand this', 'Am înțeles asta')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the button works**

Run: `npm run dev`
Navigate to `/#/y1s2/os/course_12`. Verify:
- "I understand this" button appears at the bottom of each step
- Clicking toggles to green "Understood!" state
- Progress strip updates the step from light blue (visited) to green (understood)
- Clicking again toggles back

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/StepRenderer.jsx
git commit -m "feat: add 'I understand' button to StepRenderer"
```

---

### Task 4: Update InlineProgress for JSON Courses

**Files:**
- Modify: `src/components/ui/InlineProgress.jsx`
- Modify: `src/pages/SubjectPage.jsx`

- [ ] **Step 1: Add isJsonCourse prop and stepIds to InlineProgress**

The InlineProgress component needs to know whether it's rendering a JSON course (uses `progress` state) or legacy JSX course (uses `checked` state). Update `InlineProgress.jsx`:

Replace the component signature and counting logic (lines 5-31) with:

```jsx
const InlineProgress = forwardRef(({ courseId, sectionCount, sectionIds, isJsonCourse, stepIds }, ref) => {
  const { checked, progress, t } = useApp();
  const [topBarHeight, setTopBarHeight] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastDismissing, setToastDismissing] = useState(false);
  const prevCountRef = useRef(0);
  const segmentsRef = useRef(null);
  const counterRef = useRef(null);
  const barRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const topBar = document.querySelector('header');
    if (!topBar) return;
    const measure = () => setTopBarHeight(Math.round(topBar.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(topBar);
    return () => ro.disconnect();
  }, []);

  if (!sectionCount || sectionCount === 0) return null;

  let completedCount, visitedCount;
  if (isJsonCourse && stepIds) {
    completedCount = stepIds.filter(id => progress[id]?.understood).length;
    visitedCount = stepIds.filter(id => progress[id]?.visited).length;
  } else {
    const prefix = `${courseId}-`;
    completedCount = Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length;
    visitedCount = completedCount; // Legacy: no distinction
  }
  const isComplete = completedCount >= sectionCount;
```

- [ ] **Step 2: Update segment rendering for two-tone display**

Replace the segment rendering (the `Array.from` block around line 149) with:

```jsx
{Array.from({ length: sectionCount }, (_, i) => {
  let segBg;
  if (isJsonCourse && stepIds) {
    const stepId = stepIds[i];
    const sp = stepId ? progress[stepId] : null;
    if (sp?.understood) segBg = isComplete ? '#22c55e' : '#3b82f6';
    else if (sp?.visited) segBg = 'rgba(59, 130, 246, 0.35)';
    else segBg = 'var(--theme-border)';
  } else {
    segBg = i < completedCount
      ? (isComplete ? '#22c55e' : '#3b82f6')
      : 'var(--theme-border)';
  }
  return (
    <div
      key={i}
      className="flex-1"
      style={{
        borderRadius: isComplete
          ? (i === 0 ? '3px 0 0 3px' : i === sectionCount - 1 ? '0 3px 3px 0' : '0')
          : '3px',
        background: segBg,
        transition: 'background 0.3s, border-radius 0.4s',
      }}
    />
  );
})}
```

- [ ] **Step 3: Update SubjectPage to pass isJsonCourse and stepIds**

In `src/pages/SubjectPage.jsx`, update the InlineProgress invocation (around line 204-211).

First, add a `useMemo` to compute stepIds for JSON courses (after the existing `sectionIds` memo around line 57):

```jsx
const jsonStepIds = useMemo(() => {
  // For JSON courses, stepIds come from the JSON data — we don't have them at this level.
  // CourseRenderer handles its own progress strip, so InlineProgress for JSON courses
  // uses the course meta id prefix to find progress keys.
  if (!activeCourse?.src) return null;
  return null; // JSON courses don't have stepIds in index.js — InlineProgress skips per-segment detail
}, [activeCourse]);
```

Actually, re-thinking this: JSON courses already have their own progress strip inside CourseRenderer. InlineProgress only needs to show for JSON courses at the course level (total understood count). But we don't have stepIds at the SubjectPage level — they're inside the JSON file.

Better approach: **Don't render InlineProgress for JSON courses.** CourseRenderer already has its own progress strip. Update the condition:

Replace the InlineProgress rendering block (lines 204-211):

```jsx
{/* Inline progress bar — sticky below TopBar (only for legacy JSX courses) */}
{activeItem && activeItem.sectionCount > 0 && !activeItem.src && (
  <InlineProgress
    ref={progressRef}
    courseId={activeItem.id}
    sectionCount={activeItem.sectionCount}
    sectionIds={activeItemSectionIds}
  />
)}
```

This keeps InlineProgress untouched for legacy courses and lets CourseRenderer handle its own progress UI for JSON courses.

- [ ] **Step 4: Verify both course types work**

Run: `npm run dev`
- Navigate to `/#/y1s2/os/course_1` (legacy JSX) — InlineProgress sticky bar appears, works as before
- Navigate to `/#/y1s2/os/course_12` (JSON) — No InlineProgress bar, CourseRenderer's progress strip works
- No console errors

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/InlineProgress.jsx src/pages/SubjectPage.jsx
git commit -m "feat: skip InlineProgress for JSON courses (CourseRenderer has own progress strip)"
```

---

### Task 5: Update CourseMap to Read Progress for JSON Courses

**Files:**
- Modify: `src/components/ui/CourseMap.jsx`

- [ ] **Step 1: Add progress reading for JSON courses**

In `CourseMap.jsx`, update the `useApp` destructure and `courseProgress` computation (lines 7-19):

```jsx
const { lang, t, checked, progress } = useApp();
const getStaggerStyle = useStaggeredEntrance(subject.slug);

const courses = subject.courses || [];
if (courses.length === 0) return null;

const courseProgress = courses.map(course => {
  const total = course.sectionCount || 0;
  let completed;
  if (course.src) {
    // JSON course — count understood steps from progress state
    // We don't have individual step IDs here, so count by prefix
    const prefix = `${course.id}-`;
    completed = total > 0
      ? Object.keys(progress).filter(k => k.startsWith(prefix) && progress[k]?.understood).length
      : 0;
  } else {
    // Legacy JSX course — count from checked state
    const prefix = `${course.id}-`;
    completed = total > 0
      ? Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length
      : 0;
  }
  return { course, completed, total };
});
```

Wait — this uses `course.id` as prefix. The JSON test course has `id: 'os-c1-json'` but its step IDs are `os-c1-intro`, `os-c1-cmds`, etc. Those don't start with `os-c1-json-`. The prefix matching won't work.

Looking at the sample JSON, step IDs are like `os-c1-intro`. The course meta id is `os-c1`. So for production JSON courses, step IDs would be `os-c1-xxx` and course id would be `os-c1`. The prefix `os-c1-` would match.

But the test course has `id: 'os-c1-json'` in index.js while the JSON meta has `id: 'os-c1'`. This mismatch is a test artifact. For the plan, we should use the JSON meta ID as the prefix, not the index.js ID.

However, at the CourseMap level we don't have the JSON loaded. We'd need to store the meta ID somewhere accessible. The simplest approach: **use a convention that the index.js `id` for JSON courses matches the JSON `meta.id`**, or store the stepIds after first load.

For now, since we can't load JSON at CourseMap level, let's add a `metaId` field to JSON course entries in index.js (or just ensure `id` matches `meta.id`). Actually, the spec says the `id` in index.js should match `meta.id`. The test course is just a test with a wrong ID. Let's use the index `id` as prefix and note the test course won't match until it's fixed.

Actually, the cleanest fix: update the test course entry's `id` in index.js to match the JSON meta id `os-c1`. But that would conflict with the legacy `course_1` which also covers Course 1. Let's just keep using `course.id` as prefix — for production, these will match. The test course is temporary.

```jsx
const courseProgress = courses.map(course => {
  const total = course.sectionCount || 0;
  let completed;
  if (course.src) {
    // JSON course — count understood steps from progress state by meta ID prefix
    const prefix = course.metaId ? `${course.metaId}-` : `${course.id}-`;
    completed = total > 0
      ? Object.keys(progress).filter(k => k.startsWith(prefix) && progress[k]?.understood).length
      : 0;
  } else {
    const prefix = `${course.id}-`;
    completed = total > 0
      ? Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length
      : 0;
  }
  return { course, completed, total };
});
```

And update the test course entry in os/index.js to add `metaId: 'os-c1'`.

- [ ] **Step 2: Add metaId to the JSON test course entry in os/index.js**

In `src/content/os/index.js`, line 146, update the test course entry:

```js
{ id: 'os-c1-json', src: 'os/courses/course-01-sample.json', metaId: 'os-c1',
  title: { en: '[JSON Test] Course 1: Basic Linux Commands', ro: '[JSON Test] Cursul 1: Comenzi Linux' },
  shortTitle: { en: 'JSON Test: C1', ro: 'JSON Test: C1' },
  sectionCount: 3 },
```

- [ ] **Step 3: Verify CourseMap shows progress for both course types**

Run: `npm run dev`
Navigate to `/#/y1s2/os` (CourseMap view). Verify:
- Legacy JSX courses show progress from `checked` state (unchanged)
- JSON test course tile shows progress from `progress` state
- Overall percentage bar accounts for both

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/CourseMap.jsx src/content/os/index.js
git commit -m "feat: CourseMap reads progress state for JSON courses"
```

---

### Task 6: Update Sidebar to Read Progress for JSON Courses

**Files:**
- Modify: `src/components/layout/Sidebar.jsx`

- [ ] **Step 1: Update Sidebar courseList progress calculation**

In `Sidebar.jsx`, update the `useApp` destructure (line 11):

```jsx
const { lang, t, checked, progress } = useApp();
```

Update the `courseList` mapping (around line 86) to use `progress` for JSON courses:

```jsx
const courseList = items.map(course => {
  const total = course.sectionCount || 0;
  let completed;
  if (course.src) {
    const prefix = course.metaId ? `${course.metaId}-` : `${course.id}-`;
    completed = total > 0
      ? Object.keys(progress).filter(k => k.startsWith(prefix) && progress[k]?.understood).length
      : 0;
  } else {
    const prefix = `${course.id}-`;
    completed = total > 0
      ? Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length
      : 0;
  }
  const isActive = activeCourseId === course.id;
  const isComplete = total > 0 && completed >= total;
  const hasProgress = completed > 0;
  const isHovered = hoveredId === course.id && !isActive;
```

The rest of the `courseList` mapping (button rendering, styles) stays unchanged.

- [ ] **Step 2: Verify Sidebar shows correct progress**

Run: `npm run dev`
Navigate to `/#/y1s2/os/course_12`. Verify:
- Sidebar shows the JSON test course with its ProgressRing
- After clicking "I understand" on steps, the ring updates
- Legacy JSX courses in sidebar still show correct progress

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.jsx
git commit -m "feat: Sidebar reads progress state for JSON courses"
```

---

### Task 7: Enhance CourseRenderer Progress Strip with Celebration

**Files:**
- Modify: `src/components/blocks/CourseRenderer.jsx`

- [ ] **Step 1: Add completion celebration to CourseRenderer**

Add a completion toast state and effect to CourseRenderer. After the `markVisited` effect, add:

```jsx
const [showCompletionToast, setShowCompletionToast] = useState(false);
const [toastDismissing, setToastDismissing] = useState(false);
const prevUnderstoodRef = useRef(0);

const understoodCount = courseData?.steps
  ? courseData.steps.filter(s => progress[s.id]?.understood).length
  : 0;

// Detect all-understood completion
useEffect(() => {
  if (!courseData?.steps) return;
  const total = courseData.steps.length;
  const prev = prevUnderstoodRef.current;
  if (understoodCount >= total && prev < total && prev > 0) {
    setShowCompletionToast(true);
    setTimeout(() => {
      setToastDismissing(true);
      setTimeout(() => {
        setShowCompletionToast(false);
        setToastDismissing(false);
      }, 300);
    }, 1500);
  }
  prevUnderstoodRef.current = understoodCount;
}, [understoodCount, courseData?.steps]);
```

- [ ] **Step 2: Add completion toast JSX**

Before the closing `</div>` of the CourseRenderer return, add:

```jsx
{showCompletionToast && (
  <div
    onClick={() => { setToastDismissing(true); setTimeout(() => { setShowCompletionToast(false); setToastDismissing(false); }, 300); }}
    style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(2px)',
      zIndex: 50,
      animation: toastDismissing ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.3s ease',
      cursor: 'pointer',
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: 'var(--theme-content-bg, #1e293b)',
        border: '2px solid #22c55e', borderRadius: '16px',
        padding: '24px 36px', textAlign: 'center',
        boxShadow: '0 12px 48px rgba(34,197,94,0.25)',
        animation: toastDismissing ? 'fadeOut 0.3s ease forwards' : 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px', fontSize: '24px', color: 'white',
        boxShadow: '0 0 20px rgba(34,197,94,0.4)',
      }}>&#10003;</div>
      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--theme-text, #e2e8f0)', marginBottom: '4px' }}>
        {t('Course Complete!', 'Curs complet!')}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--theme-muted-text, #94a3b8)' }}>
        {t(`All ${totalSteps} steps understood`, `Toți cei ${totalSteps} pași înțeleși`)}
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 3: Verify celebration works**

Run: `npm run dev`
Navigate to `/#/y1s2/os/course_12`. Click "I understand" on all 3 steps. Verify:
- Completion toast appears with checkmark and "Course Complete!" message
- Toast auto-dismisses after ~1.5s
- Clicking outside the toast also dismisses it

- [ ] **Step 4: Commit**

```bash
git add src/components/blocks/CourseRenderer.jsx
git commit -m "feat: add completion celebration toast to CourseRenderer"
```

---

### Task 8: Add Progress Count to CourseRenderer Step Info Bar

**Files:**
- Modify: `src/components/blocks/CourseRenderer.jsx`

- [ ] **Step 1: Add understood counter to the step info bar**

In the step info bar `<div>` (around line 65), add an understood counter between the step counter and lecture toggle:

After the step/group span, add:

```jsx
<span className="text-xs font-semibold" style={{ color: '#10b981' }}>
  {understoodCount}/{totalSteps} {t('understood', 'înțeleși')}
</span>
```

- [ ] **Step 2: Verify the counter displays and updates**

Run: `npm run dev`
Navigate to `/#/y1s2/os/course_12`. Verify:
- Counter shows "0/3 understood" initially
- After clicking "I understand", counter updates to "1/3 understood"
- Counter color is green

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/CourseRenderer.jsx
git commit -m "feat: add understood counter to CourseRenderer step info bar"
```

---

### Task 9: Final Verification

- [ ] **Step 1: Full app smoke test**

Run: `npm run dev` and verify all of the following:
1. Home page loads, CourseMap shows correct progress for all courses
2. Legacy JSX course (`/#/y1s2/os/course_1`) — Section checkboxes work, InlineProgress bar works, Sidebar progress rings update
3. JSON course (`/#/y1s2/os/course_12`) — Steps auto-visited, "I understand" button works, progress strip two-tone, sidebar ring updates, completion toast on all understood
4. Dark mode toggle — all progress UI respects theme
5. Language toggle — "I understand" / "Am înțeles" switches correctly
6. No console errors or warnings

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit any remaining fixes**

If any fixes were needed during verification, commit them.
