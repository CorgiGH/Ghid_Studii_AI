# Sidebar Overlap Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the locked sidebar start below the navigation bars (TopBar, ContentTypeBar, Breadcrumbs) instead of overlapping them.

**Architecture:** Wrap ContentTypeBar + Breadcrumbs in a ref'd div inside SubjectPage. Use a ResizeObserver + scroll listener to measure the bottom edge of that wrapper. Pass the offset to Sidebar, which uses it for `top` and `height`. The TopBar is `sticky top-0`, so `getBoundingClientRect().bottom` on the wrapper naturally includes its height when scrolled to top.

**Tech Stack:** React refs, ResizeObserver, inline styles

---

### Task 1: Measure header offset in SubjectPage

**Files:**
- Modify: `src/pages/SubjectPage.jsx`

- [ ] **Step 1: Add ref and state for header bottom offset**

In `SubjectPage`, add a ref for the header wrapper and state for the computed offset. Wrap ContentTypeBar + Breadcrumbs in a div with this ref. Add a `useEffect` that uses `ResizeObserver` and a scroll listener to keep the offset up to date.

At the top of the component (after existing hooks, around line 27):

```jsx
const headerRef = useRef(null);
const [sidebarTop, setSidebarTop] = useState(0);
```

- [ ] **Step 2: Add the measurement effect**

Add this effect after the existing effects (after line 103):

```jsx
useEffect(() => {
  const el = headerRef.current;
  if (!el) return;
  const measure = () => setSidebarTop(el.getBoundingClientRect().bottom);
  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(el);
  window.addEventListener('scroll', measure, { passive: true });
  return () => { ro.disconnect(); window.removeEventListener('scroll', measure); };
}, []);
```

- [ ] **Step 3: Wrap ContentTypeBar + Breadcrumbs in a ref'd div**

Replace lines 133-141 (the ContentTypeBar and Breadcrumbs):

```jsx
{/* Before: */}
<ContentTypeBar subject={subject} activeTab={tab} onTabChange={handleTabChange} />
<Breadcrumbs ... />

{/* After: */}
<div ref={headerRef}>
  <ContentTypeBar subject={subject} activeTab={tab} onTabChange={handleTabChange} />
  <Breadcrumbs
    yearSem={yearSem}
    subject={subject}
    tab={tab}
    activeItemTitle={activeCourse ? activeCourse.shortTitle[lang] : activeLab ? activeLab.shortTitle[lang] : undefined}
  />
</div>
```

- [ ] **Step 4: Pass sidebarTop to both Sidebar instances**

Add `sidebarTop={sidebarTop}` prop to both Sidebar components (courses sidebar ~line 145 and labs sidebar ~line 159):

```jsx
<Sidebar
  items={subject.courses}
  activeCourseId={activeCourse?.id || null}
  open={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  yearSem={yearSem}
  subjectSlug={subjectSlug}
  routePrefix="course_"
  locked={sidebarLocked}
  onToggleLock={toggleSidebarLock}
  sidebarTop={sidebarTop}
/>
```

Same for the labs Sidebar instance.

- [ ] **Step 5: Commit**

```bash
git add src/pages/SubjectPage.jsx
git commit -m "feat: measure header offset for sidebar positioning"
```

---

### Task 2: Use sidebarTop in Sidebar component

**Files:**
- Modify: `src/components/layout/Sidebar.jsx`

- [ ] **Step 1: Accept the sidebarTop prop**

Update the component signature (line 8) to include `sidebarTop`:

```jsx
const Sidebar = ({ items, activeCourseId, open, onClose, yearSem, subjectSlug, routePrefix, locked, onToggleLock, sidebarTop = 0 }) => {
```

- [ ] **Step 2: Update the desktop sidebar positioning**

In the desktop `<aside>` element (line 190-215), change the inline styles:

```jsx
{/* Before: */}
style={{
  width: '15%',
  minWidth: '160px',
  height: '100vh',
  transform: (locked || showOverlay) ? 'translateX(0)' : 'translateX(-100%)',
  transition: 'transform 0.2s ease-in-out',
  boxShadow: !locked && showOverlay ? '4px 0 16px rgba(0,0,0,0.2)' : 'none',
}}

{/* After: */}
style={{
  width: '15%',
  minWidth: '160px',
  top: `${sidebarTop}px`,
  height: `calc(100vh - ${sidebarTop}px)`,
  transform: (locked || showOverlay) ? 'translateX(0)' : 'translateX(-100%)',
  transition: 'transform 0.2s ease-in-out',
  boxShadow: !locked && showOverlay ? '4px 0 16px rgba(0,0,0,0.2)' : 'none',
}}
```

- [ ] **Step 3: Remove the paddingTop hack**

In the inner div of the desktop sidebar (line 206), remove the `paddingTop` that was compensating for TopBar overlap:

```jsx
{/* Before: */}
style={{
  paddingTop: 'calc(3rem + 8px)',
  backgroundColor: 'var(--theme-sidebar-bg)',
  borderRight: '1px solid var(--theme-sidebar-border)',
  scrollbarWidth: 'none',
}}

{/* After: */}
style={{
  backgroundColor: 'var(--theme-sidebar-bg)',
  borderRight: '1px solid var(--theme-sidebar-border)',
  scrollbarWidth: 'none',
}}
```

- [ ] **Step 4: Update the toggle nub position**

The toggle nub (lines 218-241) that shows when the sidebar is hidden also needs its `top` adjusted so it stays vertically centered within the sidebar area, not the full viewport. Update its style:

```jsx
{/* Before: */}
style={{
  left: '0',
  top: '50%',
  transform: 'translateY(-50%)',
  ...
}}

{/* After: */}
style={{
  left: '0',
  top: `calc(${sidebarTop}px + (100vh - ${sidebarTop}px) / 2)`,
  transform: 'translateY(-50%)',
  ...
}}
```

- [ ] **Step 5: Verify mobile sidebar is unchanged**

Confirm the mobile sidebar `<aside>` (lines 244-265) has no references to `sidebarTop` — it should remain `fixed top-0 left-0 z-50 w-60 h-full` with `pt-16`. No changes needed.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/Sidebar.jsx
git commit -m "fix: sidebar starts below navigation bars"
```

---

### Task 3: Manual verification

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test locked sidebar on desktop**

1. Navigate to a subject page (e.g., `/#/y1s2/os`)
2. Click the sidebar lock toggle to lock it open
3. Verify: ContentTypeBar and Breadcrumbs are fully visible above the sidebar
4. Verify: Sidebar starts immediately below the Breadcrumbs
5. Click through different tabs (Courses, Exercises, etc.) — sidebar top should adapt

- [ ] **Step 3: Test overlay sidebar on desktop**

1. Unlock the sidebar
2. Hover the left edge to trigger the overlay sidebar
3. Verify: Overlay sidebar also starts below the navigation bars

- [ ] **Step 4: Test scroll behavior**

1. Lock the sidebar open
2. Scroll down the page
3. Verify: TopBar sticks to top, sidebar remains correctly positioned below it
4. Verify: No visual jump or flicker

- [ ] **Step 5: Test mobile sidebar**

1. Resize browser to mobile width (< 1024px)
2. Open sidebar via hamburger menu
3. Verify: Mobile sidebar is unchanged (full-height overlay with backdrop)

- [ ] **Step 6: Test home page**

1. Navigate to home page (`/#/`)
2. Verify: No sidebar visible, no errors in console

- [ ] **Step 7: Commit and push**

```bash
git push
```
