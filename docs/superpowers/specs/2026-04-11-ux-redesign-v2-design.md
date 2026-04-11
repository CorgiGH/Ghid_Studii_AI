# UX Redesign v2 — Design Spec

**Date:** 2026-04-11
**Status:** Approved design
**Goal:** Eliminate the "AI-generated" look through cumulative improvements across typography, navigation, progress, and test features.
**Approach:** Foundation First (Approach A) — phased delivery, bottom-up by architectural layer.
**Work mode:** Local on main branch, commits at each meaningful step for version control.
**Research basis:** `docs/superpowers/specs/2026-04-11-ux-redesign-research.md` (13 areas, 80+ sources)

---

## Phase 1: Visual Foundation

### 1.1 Typography Scale

**Source:** Research §7 — surveyed Material Design 3, Apple HIG, IBM Carbon, GitHub Primer, Tailwind prose.

**Current state:** All headings use `text-lg` (18px). No visual hierarchy.

**Target:**
- Body: 16px, line-height 24px (1.5), normal letter-spacing
- H1: 36px (2.25em), weight 800, line-height 1.11, margin-top 0, margin-bottom 32px
- H2: 24px (1.5em), weight 700, line-height 1.33, margin-top 48px, margin-bottom 24px
- H3: 20px (1.25em), weight 600, line-height 1.6, margin-top 32px, margin-bottom 12px
- H4: 16px (1em), weight 600, line-height 1.5, margin-top 24px, margin-bottom 8px
- Responsive H1: `clamp(1.75rem, 1.583rem + 0.833vw, 2.25rem)`
- Code blocks: 14px (0.875em), line-height 1.6, padding 16px 20px, border-radius 8px, font: system monospace stack (ui-monospace, SFMono-Regular, Menlo, etc.)

**Dark mode text:**
- Primary text: `#e2e8f0` (slate-200), never pure white
- `-webkit-font-smoothing: antialiased`
- Optional `+0.01em` letter-spacing
- No font-weight changes (no major system does this)

### 1.2 Content Column Width

**Source:** Research §7 — Medium 680px, Substack 640px, Notion 708px, Stripe Docs 740px, Vercel Docs 768px, MDN 800px, Tailwind prose 65ch (~520px).

**Current state:** `max-w-5xl` (1024px) — 2x wider than any recommendation.

**Target:** 768px (`max-w-3xl`) matching Vercel Docs. Code blocks may extend wider if needed via negative margins or breakout classes.

### 1.3 Dark Mode System Detect

**Source:** Research §8 — GitHub/Vercel/Tailwind UI pattern.

**Current state:** Two-state toggle (light/dark), default dark, no `prefers-color-scheme` detection.

**Target:**
- Three-state toggle: Light / Dark / System
- `getEffectiveTheme(pref)`: if `pref === 'system'`, read `matchMedia('(prefers-color-scheme: dark)')`, else return pref
- `matchMedia` change listener for live system mode updates
- FOUC prevention: blocking `<script>` in `<head>` before React loads:
  ```html
  <script>(function(){var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d)})()</script>
  ```
- No theme transition animation (matches GitHub, VS Code, Vercel behavior)

### 1.4 Skeleton Shimmer

**Source:** Research §11.

**Current state:** `animate-pulse` opacity fade.

**Target:**
- Shimmer gradient: `linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)`, `background-size: 200% 100%`, 1.5s infinite
- Dark variant: `#374151` / `#4b5563`
- Sync all shimmers via `background-attachment: fixed`
- 150ms fade-in transition from skeleton to real content
- Timing: <1s show nothing, 1-2s spinner/skeleton, 2-10s skeleton preferred
- Shapes match content layout: rounded rects for text (h-3/h-4, varying widths), rectangles for code blocks
- `@media (prefers-reduced-motion: reduce)` → fall back to gentle pulse
- Accessibility: skeleton elements get `aria-hidden="true"`

---

## Phase 2: Navigation & Wayfinding

### 2.1 Hide-on-Scroll Header

**Source:** Research §6 — Medium, Twitter/X, YouTube pattern.

**Current state:** TopBar always visible, consuming mobile screen space.

**Target:**
- Track scroll delta. Down past header height + delta > 5px → `translateY(-100%)`. Any upward scroll → show.
- 200-300ms `ease-in-out`
- At `scrollY === 0`: always show, no delay
- CSS: `will-change: transform`, `transition: transform 0.2s ease-in-out`

### 2.2 Deep Linking to Sections

**Source:** Research §9 — HashRouter pattern D.

**Current state:** Courses are routable, sections within courses are not.

**Target:**
- URL pattern: `/#/y1s2/os/course/3#os-c3-processes`
- `location.pathname` = `/y1s2/os/course/3`, `location.hash` = `#os-c3-processes`
- Scroll offset: `scroll-margin-top` on all `[id]` elements = sticky header height + 16px
  ```css
  [id] { scroll-margin-top: calc(var(--sticky-total-height, 120px) + 1rem); }
  ```
- URL update on scroll: IntersectionObserver with `rootMargin '-80px 0px -70% 0px'`
- Use `replaceState` (not `pushState`) to avoid polluting back button

### 2.3 Copy-Link Anchors

**Source:** Research §9.

**Current state:** Not implemented.

**Target:**
- Hover-revealed `#` icon LEFT of section headings
- `opacity: 0 → 0.7` on `group-hover`
- Click copies full URL (including hash) to clipboard
- Toast "Link copied!" for 2s

### 2.4 Scroll Spy

**Source:** Research §9 + §13 — MDN, React docs, Vercel docs pattern.

**Current state:** Not implemented.

**Target:**
- Active heading updates in sidebar + URL as user scrolls
- IntersectionObserver on section headings updates active item
- Sidebar auto-scrolls to keep active item visible
- If using sticky section pills: Material Design 3 chips — height 32dp, corner-radius 8dp, padding 12dp horizontal, font 14sp Medium, gap 8dp
- Active state: `secondaryContainer` fill or bottom border (Airbnb pattern)
- Shadow on scroll: `box-shadow: 0 2px 4px rgba(0,0,0,0.08)` when scrolled below initial position

### 2.5 Mobile Bottom Tab Bar

**Source:** Research §5 + §12.

**Current state:** ContentTypeBar (secondary nav row) for content-type switching. Bottom sheet for course navigation.

**Target:**
- 4 fixed tabs: Courses (book icon), Practice (code/terminal icon), Tests (clipboard icon), Progress (chart icon)
- Material Design 3 specs: height 80dp, icons 24dp (filled active, outlined inactive), active pill indicator 56x32dp full rounded, labels titleSmall
- Always show labels (Apple HIG recommendation)
- Mobile only — desktop continues using ContentTypeBar or equivalent
- Existing bottom sheet remains for course navigation within Courses tab
- Research: fixed tabs 21% faster than current approach

---

## Phase 3: Progress & Engagement

### 3.1 Course Card Left-Border Accent

**Source:** Research §3 — Khan Academy, Codecademy, Coursera consensus.

**Current state:** Background tint + border color on CourseMap tiles.

**Target:**
- Left-border accent by status (3-4px)
- Colors by progress state: not started (grey), started (amber), completed (green), active (blue)
- Matches existing ProgressRing color semantics

### 3.2 Total Subject Progress Bar

**Source:** Gap audit — listed as "not implemented."

**Current state:** No subject-level progress indicator.

**Target:**
- Subject page shows total progress: "47/155 sections"
- Reuse ProgressRing at 120px size (research §2: Khan Academy uses 120px on dashboard with percentage + label inside)
- Shows percentage inside ring, "47/155 sections" label below

### 3.3 Progress Ring Animation

**Source:** Research §2 — Khan Academy, Duolingo patterns.

**Current state:** ProgressRing is static (no fill animation).

**Target:**
- Clockwise fill via `stroke-dasharray` / `stroke-dashoffset`, 600ms `ease-in-out`
- Color cross-fade 400ms on level-up
- Optional: bounce 1.0→1.2→1.0 over 400ms on completion (Duolingo pattern)

### 3.4 Course Completion Celebration

**Source:** Research §4 — Khan Academy inline pattern.

**Current state:** Section completion: green flash + "+1" floater + counter bounce + toast (1.2s). No special course completion treatment.

**Target:**
- Keep existing section completion animations
- Add course completion: centered modal (~480px), fade-in 300ms, scale 0.95→1.0
- Modal content: stats summary (sections completed, time if tracked), "Next Course" button
- Brief confetti from ring (~1s), Khan Academy style
- Not a full-screen Duolingo takeover

---

## Phase 4: Test Features

### 4.1 Review Mistakes Flow

**Source:** Research §10 — UWorld pattern.

**Current state:** Not implemented (listed in gap audit).

**Target:**
- Filter button on test results creates a new session from wrong questions only
- Same quiz UI with "Attempt 2" badge
- Track per question in localStorage: `attemptCount`, `lastResult`, timestamps

### 4.2 Test Results Summary

**Source:** Research §10.

**Current state:** No structured results summary page.

**Target:**
- Large circular score (reuse ProgressRing at larger size)
- Per-topic breakdown bars colored by performance
- Question list with check/X + time spent per question
- "Review Mistakes" + "Retake Test" buttons
- Color thresholds: >=80% green, 50-79% amber, <50% red

### 4.3 Tutor vs Timed Modes

**Source:** Research §10.

**Current state:** Not implemented.

**Target:**
- Two card options shown before test start
- Tutor mode: explanations shown after each question (current behavior becomes this)
- Timed mode: countdown timer, all results shown at end
- Selected card: `blue-500` border + `blue-50` bg

### 4.4 "What's On The Exam" Mode

**Source:** Gap audit — listed as not implemented. Not detailed in component research.

**Target:**
- Filter/highlight content tagged as exam-relevant across courses
- Requires a tagging system on course sections (new `examRelevant: true/false` field in course JSON)
- UI: toggle or filter that dims non-exam content and highlights exam content
- Detailed design to be refined during implementation planning

### 4.5 Quick Quiz Floating Button

**Source:** Gap audit — listed as not implemented.

**Target:**
- Floating action button that launches a random quiz from the current subject's question pool
- Position: bottom-right, above bottom tab bar on mobile
- Standard FAB pattern: 56dp, circular, shadow elevation 6dp
- Tap opens a quiz overlay or navigates to a random quiz section
