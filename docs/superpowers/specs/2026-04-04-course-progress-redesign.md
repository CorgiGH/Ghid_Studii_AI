# Course Progress & Navigation Redesign

## Summary

Redesign the course viewing experience: split courses into individual pages with dedicated URLs, add auto-progress tracking (scroll + interaction), relocate the progress bar to an always-visible right sidebar, redesign the left sidebar with scale/extrude animations, and add directional slide transitions between course pages.

## 1. Routing & Course ID Migration

### New route structure

- `/#/y1s2/os` — Courses tab default, shows CourseMap overview (unchanged)
- `/#/y1s2/os/course_1` — Individual course page (new)
- `/#/y1s2/os/course_2` ... `/#/y1s2/os/course_11` — Each course gets its own URL

### Route changes

**App.jsx:** The existing `/:yearSem/:subject/*` wildcard route already captures sub-paths. SubjectPage parses the wildcard to detect `course_N` patterns.

**SubjectPage.jsx:** When `wildcard` matches `/^course_(\d+)$/`, render the `CoursePage` layout (single course with left nav sidebar + right progress sidebar). Otherwise, existing tab logic remains unchanged.

### Course ID rename

All subject index files rename course IDs: `c1` → `course_1`, `c2` → `course_2`, etc.

Affected files per subject:
- `src/content/<slug>/index.js` — course ID field
- `src/content/<slug>/courses/CourseNN.jsx` — all Section `id` props that use `cN-` prefix become `course_N-`
- Any other reference to course IDs in content files

### localStorage migration

On app boot (in `AppContext.jsx`), run a one-time migration:
1. Check if `localStorage.getItem('checked_v2_migrated')` exists
2. If not, scan all keys in the `checked` object
3. Replace keys matching `^c(\d+)-` with `course_$1-`
4. Set the migration flag
5. This preserves all existing user progress

## 2. Page Layout

### Course page layout (when viewing a specific course)

```
┌──────────────────────────────────────────────────────┐
│  TopBar (sticky)                                     │
├──────────────────────────────────────────────────────┤
│  ContentTypeBar                                      │
├──────────────────────────────────────────────────────┤
│  Breadcrumbs: Home / Y1S2 / OS / Course Title        │
├─────────┬─────────────────────────┬──────────────────┤
│  Left   │  Course Content         │  Right Progress  │
│  Sidebar│  (rendered directly,    │  Sidebar         │
│  (nav)  │   no CourseBlock wrap)  │  (~180px)        │
│  (260px)│                         │                  │
│         │  Sections with          │  Vertical        │
│         │  auto-progress          │  segment bar     │
│         │                         │  + section labels│
│         │  CourseNavigation       │  + mini ring     │
│         │  (prev/next)            │                  │
├─────────┴─────────────────────────┴──────────────────┤
```

### Courses tab default (no specific course selected)

Same as current: CourseMap overview + search bar. No right progress sidebar.

### Responsive behavior

- **Desktop (lg+):** Three-column layout — left sidebar sticky, main content, right progress sidebar sticky
- **Mobile (<lg):** Left sidebar is a slide-over (existing behavior). Right progress sidebar is hidden. Course content renders full-width.

## 3. Left Sidebar Redesign

### Styling changes

Replace current flat list with scaled card-style items:

**All items:**
- `border-radius: 8px`
- `border: 1.5px solid transparent`
- `transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1)`
- Contains: ProgressRing + course title + progress count

**Active item (derived from current URL, not local state):**
- `transform: scale(1.07)`
- `border-color: #3b82f6`
- `background: elevated theme color`
- `box-shadow: 0 4px 20px rgba(59, 130, 246, 0.25)`
- Blue left accent bar (3px, positioned absolute, 60% height, centered)
- Text: `color: #fff`, `font-weight: 600`

**Hover (non-active):**
- `transform: scale(1.04)`
- `border-color: rgba(59, 130, 246, 0.25)`
- Subtle background shift

**Inactive:**
- `transform: scale(1)`
- Transparent border
- Normal text color, reduced opacity if no progress

### Navigation behavior

Clicking a sidebar item calls `navigate(\`/${yearSem}/${subjectSlug}/course_${num}\`)` instead of scrolling to an element. On mobile, also closes the sidebar overlay.

## 4. Right Progress Sidebar

### New component: `ProgressSidebar`

Located at `src/components/ui/ProgressSidebar.jsx`.

**Structure:**
- Sticky positioned (`lg:sticky top-20`), width ~180px
- Hidden on mobile (<lg)
- Contains a vertical version of the existing StickyProgressBar segments

**Vertical segment bar:**
- Same visual style as current StickyProgressBar but oriented vertically
- Segments stacked top-to-bottom instead of left-to-right
- Each segment: `flex-1` height, `width: 6px`, `border-radius: 3px` (adjusted for vertical — careful with border-radius direction)
- Blue (#3b82f6) when completed, theme border color when incomplete, green (#22c55e) when all complete
- Gap between segments: 2px (merges to 0 on complete)

**Section labels:**
- Each segment has a truncated section title label to its right
- Label color: green when completed, muted when not
- Clicking a label/segment scrolls to that section in the content

**Mini ProgressRing:**
- Positioned at the bottom of the sidebar
- Shows `completed/total` count
- Same ProgressRing component already in use
- Smooth `stroke-dashoffset` transition on updates

**Celebration animations (preserved from StickyProgressBar):**
- Green flash on segment completion (adapted: vertical segment)
- +1 floater (goes right instead of up)
- Counter bounce on the mini ring
- Segments merge on course completion (vertical gap closes, all turn green, inner border-radii flatten)

## 5. Auto-Progress System

### New hook: `useAutoProgress`

Located at `src/hooks/useAutoProgress.js`.

**Parameters:** `sectionId` (string)

**Returns:** `{ ref, isAutoCompleted }` — ref attaches to the Section wrapper div

**Behavior:**

1. **Scroll detection:** Creates an IntersectionObserver on the Section element. When the bottom ~100px of the section crosses ~90% visibility threshold, sets `hasScrolledThrough = true`.

2. **Toggle interaction detection:** Listens for a custom `toggle-interacted` DOM event bubbling up from child Toggle components. On first event, sets `hasInteractedWithToggle = true`. If the section has no Toggle children, this condition defaults to `true`.

3. **Completion trigger:** When both conditions are met and `checked[sectionId]` is not already true, calls `toggleCheck(sectionId)`.

4. **Manual override respected:** The manual checkbox remains functional. Auto-progress only checks (never unchecks). If the user manually unchecks, auto-progress won't re-check until the next page navigation (tracked via a `hasAutoFired` ref that resets on mount).

### Toggle component changes

**Toggle.jsx:** Dispatch a custom DOM event when opened:
```js
// On first open:
element.dispatchEvent(new CustomEvent('toggle-interacted', { bubbles: true }));
```

### Section component changes

**Section.jsx:** Integrate `useAutoProgress`:
- Accept the `sectionId` prop (same as `id`)
- Attach the auto-progress ref to the section wrapper div
- No changes to manual checkbox behavior

### Detecting Toggle presence

`useAutoProgress` checks on mount whether any Toggle components exist inside the section ref. If none are found, `hasInteractedWithToggle` defaults to `true` (scroll-only completion).

Detection method: check for elements with a `[data-toggle]` attribute inside the ref. Toggle.jsx adds `data-toggle` to its root element.

## 6. Slide Transitions

### New component: `CourseTransition`

Located at `src/components/ui/CourseTransition.jsx`.

**Props:** `courseIndex` (number), `children`

**Behavior:**
- Tracks `prevIndex` via useRef
- On `courseIndex` change, determines direction: `newIndex > prevIndex` → sliding up, else sliding down
- Applies CSS animation classes to outgoing/incoming content
- Duration: 350ms, ease timing function

**CSS animations:**
```
slideOutUp:    translateY(0) → translateY(-40px), opacity 1 → 0
slideInUp:     translateY(40px) → translateY(0), opacity 0 → 1
slideOutDown:  translateY(0) → translateY(40px), opacity 1 → 0
slideInDown:   translateY(-40px) → translateY(0), opacity 0 → 1
```

**First load:** No previous course — content fades in without directional slide.

**Integration:** Wraps the course content in SubjectPage when rendering a specific course.

## 7. Files Changed

### New files
- `src/components/ui/ProgressSidebar.jsx` — Right progress sidebar
- `src/components/ui/CourseTransition.jsx` — Slide transition wrapper
- `src/hooks/useAutoProgress.js` — Auto-progress hook

### Modified files
- `src/App.jsx` — No route changes needed (wildcard already captures)
- `src/pages/SubjectPage.jsx` — Parse `course_N` from wildcard, render single-course layout with three columns, integrate CourseTransition
- `src/components/layout/Sidebar.jsx` — New scaled/extruded styling, navigate() instead of scroll, active state from URL
- `src/components/ui/Section.jsx` — Integrate useAutoProgress hook
- `src/components/ui/Toggle.jsx` — Dispatch `toggle-interacted` custom event, add `data-toggle` attribute
- `src/components/ui/StickyProgressBar.jsx` — Kept as-is (used by ProgressSidebar as reference, may be deprecated later)
- `src/components/ui/CourseNavigation.jsx` — Use navigate() instead of scroll callback
- `src/contexts/AppContext.jsx` — Add localStorage migration for course ID rename
- `src/content/os/index.js` — Rename course IDs `c1`→`course_1` etc.
- `src/content/os/courses/Course01.jsx` through `Course11.jsx` — Rename section ID prefixes
- All other subject index files with courses (oop, pa, etc.) — Same ID rename

### Unchanged
- `src/components/ui/CourseMap.jsx` — `onCourseClick` callback changes from scroll-to-element to `navigate()` in SubjectPage (CourseMap itself unchanged, just receives a different callback)
- `src/components/ui/ReadingProgress.jsx` — Prefix matching still works with new IDs
- `src/components/ui/ProgressRing.jsx` — No changes, reused in ProgressSidebar
