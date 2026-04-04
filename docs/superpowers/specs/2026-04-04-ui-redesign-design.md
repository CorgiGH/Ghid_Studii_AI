# UI Redesign: Navigation, Progress Feedback & Theming

## Context

The study guide app has functional UI but navigation between subjects, content types, and courses feels clunky. The visual design is plain, and there's no meaningful progress feedback while reading courses. The checkbox system exists but doesn't feel rewarding. This redesign addresses all three areas while keeping the hybrid sidebar layout that works well for course-by-course reading.

## Scope

Three interconnected systems:

1. **Navigation redesign** — faster, more seamless movement at every level
2. **Progress feedback** — visual indicators that make studying feel like progressing
3. **Theme system** — 5 color palettes + light/dark mode with subtle contrast

---

## 1. Navigation Redesign

### 1.1 Persistent Top Bar with Subject Switcher

**What changes:** Replace the current top bar with a redesigned version that includes an always-visible subject switcher.

- Left side: "Study Guide" brand + subject switcher dropdown
- Right side: search icon, language toggle (RO/EN), palette picker (🎨), light/dark toggle
- Subject switcher opens a row of pill-style chips (e.g., `🖥️ OS`, `📊 Prob & Stat`, `📐 Linear Algebra`, `🧮 Algorithms`) — click to switch subject without going Home
- Active subject is highlighted with the accent color

**Files to modify:**
- `src/components/layout/TopBar.jsx` — redesign layout, add subject switcher
- `src/contexts/AppContext.jsx` — may need to expose current subject at context level for the switcher

### 1.2 Content Type Selector (Replaces Tabs)

**What changes:** Move the current tab bar (Courses/Seminars/Labs/Practice/Tests) into a secondary navigation row below the top bar, visually distinct from it.

- Sits between top bar and content area
- Active type has a filled/elevated style (white background, shadow, accent border)
- Inactive types are plain text
- Only shows types that the subject actually has content for (e.g., hide "Tests" if subject has no tests)

**Files to modify:**
- `src/pages/SubjectPage.jsx` — extract tab logic, replace inline tab rendering with new component
- `src/components/ui/TabBar.jsx` — redesign or replace with new `ContentTypeBar` component

**Scalability fix:** Currently tabs are hardcoded in `SubjectPage.jsx` (lines 101-107). The new content type bar should derive available types from the subject's index data (check if `subject.courses`, `subject.seminars`, etc. have content).

### 1.3 Breadcrumbs

**What changes:** Add a breadcrumb trail between the content type bar and the main content area.

- Format: `Home / Y1 S2 / Operating Systems / Courses / C3. Processes`
- Each segment is clickable and navigates to that level
- Current page (last segment) is bold and not a link
- Collapses gracefully on mobile (show last 2-3 segments)

**Files to modify:**
- New component: `src/components/layout/Breadcrumbs.jsx`
- `src/pages/SubjectPage.jsx` — render breadcrumbs above content area

### 1.4 Prev/Next Course Navigation

**What changes:** Add previous/next navigation at the bottom of each course's content area.

- Left: `← C2. File Systems` (previous course)
- Right: `C4. Scheduling →` (next course, slightly bolder as the primary action)
- First course has no "previous", last course has no "next"
- Clicking navigates to that course and scrolls to top

**Files to modify:**
- `src/pages/SubjectPage.jsx` — add prev/next below course content
- Or: new component `src/components/ui/CourseNavigation.jsx`

---

## 2. Progress Feedback System

### 2.1 Sidebar Progress Rings

**What changes:** Redesign sidebar course list items to include compact inline progress rings.

- Each course shows a small (16-24px) SVG ring next to its name
- Ring fill represents percentage of checked sections
- Color states:
  - **Green** (filled circle + ✓): all sections complete
  - **Blue** (partial ring + percentage): active/in-progress course
  - **Amber** (partial ring): started but not current
  - **Grey** (empty ring): not started, slightly dimmed
- Below course name: "3/5 sections" count text
- Active course has left border accent + light background

**Scalability fix:** Currently `Sidebar.jsx` (line 39) hardcodes `Array.from({ length: 20 })` to count sections. The new sidebar must dynamically count actual sections per course. This requires either:
- (a) Each course's index entry includes a `sectionCount` field, OR
- (b) Section IDs follow a discoverable pattern and we count them from `checked` state

Approach (a) is simpler and more reliable. Add `sectionCount` to each course entry in subject index files.

**Files to modify:**
- `src/components/layout/Sidebar.jsx` — redesign course list items
- New component: `src/components/ui/ProgressRing.jsx` — reusable SVG ring
- `src/content/os/index.js` (and other subject indexes) — add `sectionCount` per course

### 2.2 Course Map Dashboard

**What changes:** Add a bird's-eye overview grid accessible from the subject page, showing all courses as tiles with progress rings.

- Overall subject progress bar at top (e.g., "Operating Systems — 42% complete")
- Grid of course tiles (4 columns on desktop, 2 on mobile)
- Each tile shows:
  - Progress ring (same `ProgressRing` component as sidebar, but larger ~40px)
  - Course short name (C1, C2, etc.)
  - Course title
- Tile background color matches state (green-tinted for complete, blue for active, amber for partial, grey for not started)
- Clicking a tile navigates to that course

**Where it lives:** This could be:
- The default view when you first land on a subject (before selecting a specific course)
- A collapsible section at the top of the courses tab

The dashboard shows when the Courses content type is active but no specific course is selected (landing on `/#/y1s2/os`). Seminars, Labs, and other content types show their own list views directly without a dashboard.

**Files to modify:**
- New component: `src/components/ui/CourseMap.jsx`
- `src/pages/SubjectPage.jsx` — render CourseMap when no course is active

### 2.3 In-Course Reading Progress

**What changes:** Add inline progress indicators while reading a course.

- **Top gradient bar**: thin (3px) bar at the top of the content area, fills left-to-right as sections are completed. Gradient from blue to purple.
- **Section segments**: horizontal row of small bars below the top bar. Each bar represents a section: green=completed, blue=current, grey=ahead. Shows "Section X of Y" text.
- Both update in real-time as the user checks off sections.

**Files to modify:**
- New component: `src/components/ui/ReadingProgress.jsx`
- `src/pages/SubjectPage.jsx` — render above course content

---

## 3. Theme System

### 3.1 Color Palettes

5 palettes, each defining nav shell and content area colors for both light and dark modes:

| Palette | Light Nav | Light Content | Dark Nav | Dark Content |
|---------|-----------|---------------|----------|--------------|
| **Slate** | `#e2e8f0` | `#ffffff` | `#12122a` | `#1e1e38` |
| **Warm Stone** | `#e7e5e4` | `#fafaf9` | `#1c1917` | `#292524` |
| **Ocean Blue** | `#dbe4f0` | `#f8faff` | `#0f172a` | `#1a2540` |
| **Zinc** | `#e4e4e7` | `#ffffff` | `#18181b` | `#27272a` |
| **Forest Green** | `#d8e5dc` | `#f8fbf8` | `#121a16` | `#1d2a22` |

Each palette also defines intermediate shades for the content type bar, breadcrumb area, sidebar background, and interactive element backgrounds.

### 3.2 Palette Picker UI

- 🎨 icon in the top bar (between language toggle and light/dark toggle)
- Clicking opens a compact popover with 5 flat solid color circles in a row
- Selected palette has a blue ring border
- Label below each circle (Slate, Stone, Ocean, Zinc, Forest)
- Popover must be wide enough to fit all 5 circles comfortably (min ~210px)
- Clicking a circle applies the palette immediately
- Palette preference persisted to localStorage

### 3.3 Contrast Principle

The nav shell (top bar + content type bar) is always one shade deeper than the content area. This creates subtle visual layering without the jarring black-over-white split. Both light and dark modes follow this principle using their respective palette colors.

### 3.4 Implementation Approach

Use CSS custom properties (variables) on `:root` for all theme colors. Switching palette updates the variables. Tailwind CSS v4 supports `@theme` for custom properties.

```
--color-nav-bg
--color-nav-text
--color-content-bg
--color-content-text
--color-sidebar-bg
--color-breadcrumb-bg
--color-accent
... etc
```

**Files to modify:**
- `src/index.css` or Tailwind config — define CSS variables per palette
- `src/contexts/AppContext.jsx` — add `palette` state (persisted to localStorage)
- `src/components/layout/TopBar.jsx` — add palette picker
- New component: `src/components/ui/PalettePicker.jsx`

---

## Key Files Summary

| File | Changes |
|------|---------|
| `src/components/layout/TopBar.jsx` | Redesign: subject switcher, palette picker, layout |
| `src/components/layout/Sidebar.jsx` | Redesign: progress rings, dynamic section counting |
| `src/components/layout/Breadcrumbs.jsx` | **New**: breadcrumb navigation |
| `src/pages/SubjectPage.jsx` | Content type bar, breadcrumbs, course map, reading progress, prev/next |
| `src/pages/Home.jsx` | May need minor updates for new theming |
| `src/contexts/AppContext.jsx` | Add `palette` state, possibly expose current subject |
| `src/hooks/useLocalStorage.js` | No changes (already handles persistence) |
| `src/components/ui/ProgressRing.jsx` | **New**: reusable SVG progress ring |
| `src/components/ui/CourseMap.jsx` | **New**: bird's-eye course dashboard |
| `src/components/ui/ReadingProgress.jsx` | **New**: in-course progress bar + section segments |
| `src/components/ui/CourseNavigation.jsx` | **New**: prev/next course links |
| `src/components/ui/PalettePicker.jsx` | **New**: palette popover component |
| `src/components/ui/ContentTypeBar.jsx` | **New**: replaces TabBar for content type selection |
| `src/index.css` | CSS custom properties for palette system |
| `src/content/os/index.js` | Add `sectionCount` per course |
| `src/content/pa/index.js` | Add `sectionCount` per course |

---

## Verification

1. **Navigation flow**: From Home, click a subject → see course map dashboard → click a course → see reading progress + sidebar rings → use prev/next to move between courses → use content type bar to switch to Seminars → use subject switcher to jump to another subject → use breadcrumbs to go back
2. **Progress tracking**: Check off sections in a course → verify sidebar ring updates, course map tile updates, reading progress bar updates, all in real-time
3. **Theme switching**: Click 🎨 → try each palette → verify nav/content contrast in both light and dark mode → refresh page → verify palette persists
4. **Responsive**: Test on mobile viewport — sidebar collapses, course map goes to 2 columns, breadcrumbs collapse, content type bar scrolls horizontally if needed
5. **Scalability**: Add a test subject with no courses — verify content type bar hides "Courses" tab, course map shows empty state
