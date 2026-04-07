# Plan 5: Chat Panel Improvements + Progress Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve chat panel to use structured JSON course context (instead of DOM scraping) when viewing JSON courses, add step context badge, add test mode guard, and implement one-time progress data migration from old `checked` keys to new `progress` format.

**Architecture:** Add `courseContext` state to AppContext (set by CourseRenderer/TestRenderer with current step/question data). ChatPanel reads this for better-quality context. A one-time migration function converts old `checked` keys to `progress` entries on app startup. The JSX→JSON course conversion itself is handled by the curate pipeline separately — this plan only builds the infrastructure.

**Tech Stack:** React 19, AppContext, existing ChatPanel + proxy

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/contexts/AppContext.jsx` | Add `courseContext` state + setter, progress migration function |
| Modify | `src/components/blocks/CourseRenderer.jsx` | Set courseContext when step changes |
| Modify | `src/components/blocks/test/TestRenderer.jsx` | Set courseContext with test mode flag |
| Modify | `src/components/ui/ChatPanel.jsx` | Use courseContext, show step badge, test mode guard |
| Modify | `src/pages/SubjectPage.jsx` | Pass courseContext from AppContext to ChatPanel |

---

### Task 1: Add courseContext to AppContext + progress migration

**Files:**
- Modify: `src/contexts/AppContext.jsx`

- [ ] **Step 1: Add courseContext state**

In `src/contexts/AppContext.jsx`, after the `testProgress`/`saveTestResult` lines, add:

```jsx
const [courseContext, setCourseContext] = useState(null);
```

`courseContext` shape:
```js
{
  type: 'course' | 'test',        // determines chat behavior
  courseTitle: 'Course 1: ...',     // for badge display
  stepTitle: 'What is Linux?',     // for badge display
  stepId: 'os-c1-intro',           // for position awareness
  blocks: [...],                   // structured JSON blocks (the actual content)
  testMode: false,                 // true during tests — guard behavior
}
```

Add `courseContext`, `setCourseContext` to the `value` useMemo and deps.

- [ ] **Step 2: Add progress migration function**

Add a one-time migration effect that converts old `checked` keys to `progress` entries. After the existing lab key migration effect:

```jsx
// One-time migration: checked keys → progress entries
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
```

This sets `visited: true, understood: true` for any previously checked item, preserving existing progress.

- [ ] **Step 3: Commit**

```bash
git add src/contexts/AppContext.jsx
git commit -m "feat: add courseContext state + one-time progress migration"
```

---

### Task 2: CourseRenderer and TestRenderer set courseContext

**Files:**
- Modify: `src/components/blocks/CourseRenderer.jsx`
- Modify: `src/components/blocks/test/TestRenderer.jsx`

- [ ] **Step 1: CourseRenderer sets courseContext on step change**

In `src/components/blocks/CourseRenderer.jsx`, add `setCourseContext` to the useApp destructure. After the `markVisited` effect, add:

```jsx
// Set course context for chat panel
useEffect(() => {
  if (!step || !courseData) return;
  setCourseContext({
    type: 'course',
    courseTitle: t(courseData.meta.title.en, courseData.meta.title.ro),
    stepTitle: t(step.title.en, step.title.ro),
    stepId: step.id,
    blocks: step.blocks,
    testMode: false,
  });
  return () => setCourseContext(null);
}, [step, courseData, setCourseContext, t]);
```

- [ ] **Step 2: TestRenderer sets courseContext with test mode**

In `src/components/blocks/test/TestRenderer.jsx`, add `setCourseContext` to the useApp destructure. After the JSON load effect, add:

```jsx
// Set test context for chat panel (test mode guard)
useEffect(() => {
  if (!testData) return;
  setCourseContext({
    type: 'test',
    courseTitle: t(testData.meta.title.en, testData.meta.title.ro),
    stepTitle: null,
    stepId: null,
    blocks: [],
    testMode: true,
  });
  return () => setCourseContext(null);
}, [testData, setCourseContext, t]);
```

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/CourseRenderer.jsx src/components/blocks/test/TestRenderer.jsx
git commit -m "feat: CourseRenderer and TestRenderer set courseContext for chat"
```

---

### Task 3: ChatPanel uses courseContext — badge, JSON context, test guard

**Files:**
- Modify: `src/components/ui/ChatPanel.jsx`
- Modify: `src/pages/SubjectPage.jsx`

- [ ] **Step 1: ChatPanel reads courseContext from AppContext**

In `src/components/ui/ChatPanel.jsx`:

1. Add `courseContext` to the useApp destructure (alongside existing `t, toggleChat, chatWidth, setChatWidth`).

2. Build structured pageContext from courseContext when available. Replace the existing `pageContext` prop usage with a computed value. Above `handleSendChat`, add:

```jsx
// Build chat context: prefer structured JSON from courseContext, fall back to DOM-scraped pageContext
const effectiveContext = React.useMemo(() => {
  if (courseContext?.blocks?.length > 0) {
    const blocksText = courseContext.blocks
      .filter(b => !b.type.startsWith('lecture'))  // skip lecture blocks from context
      .map(b => {
        const content = b.content ? (typeof b.content === 'string' ? b.content : b.content.en || b.content.ro || '') : '';
        return `[${b.type}] ${b.term?.en || b.term?.ro || ''} ${content}`.trim();
      })
      .join('\n');
    return `Current step: ${courseContext.stepTitle}\n\n${blocksText}`;
  }
  return pageContext || '';
}, [courseContext, pageContext]);
```

3. In `handleSendChat`, replace `pageContext: pageContext || ''` with `pageContext: effectiveContext`.

4. If `courseContext?.testMode`, prepend a guard instruction to the message. Modify `handleSendChat`:
```jsx
const contextNote = courseContext?.testMode
  ? 'NOTE: Student is taking a test. Help them reason through problems but do NOT give direct answers.\n\n'
  : '';
```
And pass `pageContext: contextNote + effectiveContext` in the streamChat call.

- [ ] **Step 2: Add step context badge to ChatPanel header**

After the tab buttons and before the flex spacer, add:

```jsx
{courseContext && (
  <span className="text-[9px] truncate max-w-[120px]" style={{ color: courseContext.testMode ? '#f59e0b' : '#818cf8' }}>
    {courseContext.testMode ? '\u{1F4DD}' : '\u{1F4D6}'} {courseContext.stepTitle || courseContext.courseTitle}
  </span>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ChatPanel.jsx src/pages/SubjectPage.jsx
git commit -m "feat: chat panel uses JSON course context, step badge, test mode guard"
```

---

### Task 4: Final verification

- [ ] **Step 1: Build check**

Run: `npm run build` — must pass with no errors.

- [ ] **Step 2: Smoke test**

1. Navigate to JSON course (`/#/y1s2/os/course_12`) → chat panel should show step badge with step title
2. Ask a question in chat → response should be context-aware (referencing current step content)
3. Navigate between steps → badge updates
4. Navigate to Tests tab → sample test → chat panel shows test mode badge (amber)
5. Ask a question during test → AI should help reason but not give direct answers
6. Legacy JSX courses → chat still works with DOM-scraped context (fallback)
7. Progress migration: if any old `checked` keys exist, they should appear in `progress` as `visited+understood`

- [ ] **Step 3: Commit and push**

```bash
git add -A
git commit -m "feat: Plan 5 complete — chat context + progress migration"
git push
```
