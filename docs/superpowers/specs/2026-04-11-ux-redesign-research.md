# UX Redesign — Deep Component Research

**Date:** 2026-04-11
**Status:** Research complete, brainstorming in progress (step 3 of 9: clarifying questions)
**Context:** User wants a UX redesign informed by 80+ source research (wiki/architecture/ux-research-2026-04-10.md). This document captures the deep component-level research done in parallel agents before design decisions are made.

---

## Gap Audit: Current State vs Research

### Already matches research (no work needed)
- Progress rings with color states (green=complete, blue=active, amber=started, grey=empty)
- Segmented progress bar (InlineProgress: sticky bar with segments, celebration animations)
- Touch targets >= 44px (ContentTypeBar buttons: min-h-[44px], quiz options: p-3.5)
- Per-distractor quiz explanations (QuizBlock: "Why this is wrong/correct" per option, color-coded)
- "Review this topic" link from quizzes (QuizBlock: navigates to reviewStep section)
- Resume where left off (CourseRenderer saves lastStep to localStorage, CourseMap shows resume banner)
- Multiple color palettes + dark mode (5 palettes, CSS variables, manual toggle in TopBar)
- Mobile bottom sheet sidebar (BottomSheet component: 56px collapsed, 65% expanded, drag handle)
- Content max-width constraint (max-w-5xl on SubjectPage)
- Bilingual toggle in header (TopBar: language toggle always visible)

### Implemented differently than research recommends
| Research Says | What We Have | Delta |
|---|---|---|
| Bottom tab bar (3-5 fixed tabs) | Bottom sheet drawer (collapsible course list) | Different purpose — ours is course navigator, not content-type switcher. Research: fixed tabs 21% faster. |
| Course card left border by status | Background tint + border color | Same info, different visual. Research prefers left-border accent. |
| Body text 16px, max-width 65ch (~520px) | Body 1.05rem (~17px), max-width max-w-5xl (1024px = ~130ch) | Font OK, but content column 2x wider than recommended. |
| Typography scale H1:28, H2:24, H3:20 | Headings text-lg (18px) for everything | No visual hierarchy. |
| Skeleton shimmer loading | animate-pulse opacity fade | Shimmer preferred for 2-10s loads. |
| Dark mode default light, with auto-detect | Default dark:true, no prefers-color-scheme | Research: light has better readability. |

### Not implemented (gaps)
- Deep linking to sections (courses routable, sections within course are not)
- Hide-on-scroll header (TopBar always visible)
- "Review Mistakes" button on tests tab
- Total progress bar on subject page ("47/155 sections")
- Auto dark mode from prefers-color-scheme
- "What's On The Exam" mode
- Quick Quiz floating button

---

## Component Research Details

### 1. Segmented Progress Bars

**Duolingo**: Sticky at top, 16px height mobile / 12px web. Single continuous pill bar (border-radius: 8px), fills left-to-right per question. Colors: empty #E5E5E5, filled #58CC02, wrong flash #FF4B4B. 300ms ease-out wipe per segment. No text.

**Khan Academy**: Not sticky, 8px height, individual 8px dots with 8px gaps. Correct fills #1865F2 with scale 8→10→8px over 250ms. Shows "X of Y correct" below in 12px #6B6B6B.

**Codecademy**: Vertical stepper (24px circles + 2px lines). Horizontal bar only on syllabus: 4px tall, continuous, #3A10E5 fill.

**Current InlineProgress**: 5px segments, 3px gaps. Research standard is 12-16px height.

### 2. Progress Rings

**Khan Academy mastery rings**:
- Sizes: 40px cards, 64px unit pages, 120px dashboard
- Stroke: 4px small, 6px medium, 8px large
- Colors by mastery: Not started #D6D8DA → Attempted #C72020 → Familiar #E07D10 → Proficient #1865F2 → Mastered #1FAB54
- Animation: clockwise fill via stroke-dasharray/stroke-dashoffset, 600ms ease-in-out. Color cross-fade 400ms on level-up
- Interior: nothing at 40px, percentage at 64px, percentage + label at 120px

**Duolingo skill circles**: 64px diameter. Progress shown by outer ring fill. Level colors: L1-2 #58CC02 green, L3 #CE82FF purple, L4 #FF9600 orange, L5 #FFD900 gold. Bounce 1.0→1.2→1.0 over 400ms + particle effects on completion.

**Current ProgressRing**: 20-40px, 2.5-3px stroke, green/blue/amber/grey. Could benefit from 600ms fill animation.

### 3. Course Card/Tile Progress

| Platform | Indicator | Position | Extra |
|---|---|---|---|
| Khan Academy | Small ring 36-40px | Top-right corner | "X of Y mastered" 12px below title |
| Codecademy | Thin bar 3px | Bottom edge full width | % text right of title. 3px left border on completed |
| Coursera | Thin bar 4px | Bottom of card | "X% complete" text. Green checkmark on completed |
| Brilliant | Thin ring around icon | Centered | Full ring + checkmark, gold/green border |

Current CourseMap: background tint + border color. Research consensus: thin bottom bar (3-4px) + small ring in corner.

### 4. Completion Celebrations

**Duolingo**: Full-screen takeover. Confetti (colored dots + stars, 2s). Sound (chime). Large checkmark bounce-in, "+15 XP" counting, accuracy %, streak. Stays until Continue tapped.

**Khan Academy**: Inline banner, mastery ring animates, green bar slides in (~60px), minimal confetti from ring (~1s). Short "ding". Not full-screen.

**Codecademy**: Centered modal ~480px. Fade-in 300ms scale 0.95→1.0. Concept summary bullets. No confetti/sound.

**Current**: Green flash + "+1" floater + counter bounce + toast (1.2s). Good for section completion (matches Khan inline). For course completion: consider brief modal with stats + "Next Course" + short confetti.

### 5. Mobile Bottom Tab Bar

**Material Design 3**: Height 80dp (64dp Expressive). Icons 24dp (filled active, outlined inactive). Active pill indicator 56×32dp full rounded. Labels titleSmall. 3-5 tabs.

**Apple HIG**: Content 49pt, total 83pt (with safe area). Icons 25pt. Labels SF 10pt Medium. Always show labels.

**Real apps**:
- Duolingo: 5 tabs (Home, Practice Hub, Quests, Leaderboards, Profile)
- Khan Academy: 4 tabs (Home, Search, Bookmarks, Profile)
- YouTube: 5 tabs with Create (+) in center

**Recommended for study guide**: 4-5 tabs with icon+label:
1. Courses (book icon)
2. Practice (code/terminal)
3. Tests (clipboard)
4. Progress (chart)
5. Settings/Profile (gear)

**Scroll behavior**: Two patterns — always visible (Instagram, Duolingo) or hide on scroll down/show on scroll up (YouTube, Twitter). Animation 200-300ms translateY.

### 6. Hide-on-Scroll Header

**Mechanism**: Track scroll delta. Down past header height + delta > 5px → translateY(-100%). Any upward scroll → show. 200-300ms ease-in-out.

**Who uses it**: Medium, Twitter/X, YouTube. Not GitHub, not Stripe docs.

**Implementation**:
```js
let lastScrollY = 0;
const DELTA = 5;
function onScroll() {
  const diff = currentY - lastScrollY;
  if (Math.abs(diff) < DELTA) return;
  if (diff > 0 && currentY > headerHeight) hide();
  else show();
  lastScrollY = currentY;
}
```
CSS: `will-change: transform`, `transition: transform 0.2s ease-in-out`.

At page top (scrollY === 0): always show, no delay.

### 7. Typography

**Body text across design systems**:
| System | Size | Line-Height | Letter-Spacing |
|---|---|---|---|
| Material Design 3 Body Large | 16px | 24px (1.5) | 0.5px |
| Apple HIG Body | 17pt | ~22pt (1.29) | default |
| IBM Carbon body-02 | 16px | 24px (1.5) | 0 |
| GitHub Primer Body Large | 16px | 24px (1.5) | normal |
| Tailwind prose-base | 16px | 28px (1.75) | normal |

**Content max-width**:
| Platform | Width |
|---|---|
| Medium | 680px |
| Substack | 640px |
| Notion | 708px (default) |
| Stripe Docs | 740px |
| Vercel Docs | 768px |
| MDN | 800px |
| Tailwind prose | 65ch (~520px) |
| **Current app** | **1024px (max-w-5xl)** |

**Heading scale (Tailwind prose at 16px body)**:
| Level | Size | Weight | Line-Height | Margin-Top | Margin-Bottom |
|---|---|---|---|---|---|
| H1 | 36px (2.25em) | 800 | 1.11 | 0 | 32px |
| H2 | 24px (1.5em) | 700 | 1.33 | 48px | 24px |
| H3 | 20px (1.25em) | 600 | 1.6 | 32px | 12px |
| H4 | 16px (1em) | 600 | 1.5 | 24px | 8px |

**Code blocks**: 14px (0.875em), line-height 1.6, bg #f4f5f7 light / #1e293b dark, padding 16px 20px, border-radius 8px. Font: system monospace stack (ui-monospace, SFMono-Regular, Menlo, etc.)

**Responsive**: Body stays same, headings scale down on mobile. GitHub Primer: H1 26px mobile → 32px desktop, H2 22px → 24px. Or use clamp(): `clamp(1.75rem, 1.583rem + 0.833vw, 2.25rem)` for H1.

**Dark mode text**: Never pure white. Use #e2e8f0 (slate-200). Add -webkit-font-smoothing: antialiased. Optional +0.01em letter-spacing. No font-weight change (no major system does this).

### 8. Dark Mode

**Three-state toggle** (light/dark/system) — GitHub, Vercel, Tailwind UI pattern:
```js
function getEffectiveTheme(pref) {
  if (pref === 'system') return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return pref;
}
```
+ matchMedia change listener for system mode.

**FOUC prevention**: Blocking `<script>` in `<head>` before React loads:
```html
<script>(function(){var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d)})();</script>
```

**Dark palette values across platforms**:
| Role | GitHub | Discord | VS Code | Tailwind |
|---|---|---|---|---|
| Page bg | #0d1117 | #313338 | #1e1e1e | #111827 |
| Surface | #161b22 | #2b2d31 | #252526 | #1f2937 |
| Elevated | #1c2128 | #383a40 | #3c3c3c | #374151 |
| Border | #30363d | #3f4147 | #474747 | #4b5563 |
| Primary text | #e6edf3 | #f2f3f5 | #d4d4d4 | #f9fafb |
| Secondary text | #8b949e | #b5bac1 | #cccccc | #d1d5db |
| Muted text | #484f58 | #949ba4 | #808080 | #9ca3af |

**Contrast ratios**: All platforms exceed WCAG AAA (7:1) for primary text. GitHub: 13.3:1, Discord: 10.5:1, VS Code: 10:1. Secondary text: 5-7:1 (AA compliant).

**Theme transition**: Most platforms do NOT animate (GitHub, VS Code, Vercel). If desired: 150ms ease on background-color, color, border-color. Apply transition class temporarily, remove after 200ms.

### 9. Deep Linking (HashRouter)

**Problem**: HashRouter uses # for routing, so traditional #fragment conflicts.

**Best solution (Pattern D)**: react-router-dom v7 HashRouter supports `location.hash` as the part after a second #.
URL: `/#/y1s2/os/course/3#os-c3-processes`
- location.pathname = /y1s2/os/course/3
- location.hash = #os-c3-processes

**Scroll offset**: `scroll-margin-top` on all [id] elements = sticky header height + 16px.
```css
[id] { scroll-margin-top: calc(var(--sticky-total-height, 120px) + 1rem); }
```

**URL update on scroll**: IntersectionObserver with rootMargin '-80px 0px -70% 0px'. Use replaceState (not pushState) to avoid polluting back button.

**Copy-link UX**: Hover-revealed # icon LEFT of headings. opacity: 0 → 0.7 on group-hover. Click copies URL. Toast "Link copied!" for 2s.

**Scroll spy**: Active heading updates in sidebar + URL as user scrolls. Used by MDN, React docs, Vercel docs.

### 10. Quiz Feedback & Review Mistakes

**Per-distractor feedback** (already implemented):
UWorld pattern: inline below options. Correct: green-50 bg + 3px green left border + checkmark. Wrong: red-50 bg + red border + X. 1-2 sentence each. Reveal: max-height 300ms + opacity 200ms.

**"Review Mistakes" flow** (NOT implemented):
UWorld: filter button on test results creates new session from wrong questions only. Same quiz UI + "Attempt 2" badge. Track per question: attemptCount, lastResult, timestamps in localStorage.

**Test results summary**:
- Large circular score (ProgressRing reuse)
- Per-topic breakdown bars (colored by performance)
- Question list with check/X + time spent
- "Review Mistakes" + "Retake Test" buttons
- Color: >=80% green, 50-79% amber, <50% red

**Tutor vs Timed mode**:
Two card options before test start. Tutor = explanations after each Q. Timed = countdown, results at end. Cards: selected gets blue-500 border + blue-50 bg.

### 11. Skeleton Loading

**Shimmer CSS**:
```css
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skeleton-shimmer {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  background-attachment: fixed; /* sync all shimmers */
}
.dark .skeleton-shimmer {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  background-attachment: fixed;
}
```

**When to use**: <1s nothing, 1-2s spinner/skeleton, 2-10s skeleton preferred, >10s progress bar.

**Transition**: 150ms fade-in from skeleton to content.

**Shapes**: Match content layout — rounded rects for text (h-3/h-4 w-varying), circles for avatars/rings, rectangles for code blocks/images.

**Accessibility**: `@media (prefers-reduced-motion: reduce)` → fall back to gentle pulse.

### 12. Bottom Sheet vs Bottom Tab Bar

| Aspect | Bottom Tab Bar | Bottom Sheet |
|---|---|---|
| Purpose | Primary app-level navigation | Secondary contextual content |
| Always visible | Yes (or hide-on-scroll) | No — user-triggered |
| Content | 3-5 icon+label destinations | Any content, scrollable |
| Interaction | Tap to switch views | Drag to expand/collapse |
| Use when | App has 3-5 top-level sections | Showing details/filters without leaving context |

Current app uses bottom sheet for course navigation. Research suggests ALSO having a tab bar for content-type switching (Courses/Practice/Tests/Progress).

### 13. Sticky Section Pills/Chips

**Material Design 3 chips**: Height 32dp, corner-radius 8dp, padding 12dp horizontal, font 14sp Medium, gap 8dp.

**Active state**: secondaryContainer fill, onSecondaryContainer text (or bottom border like Airbnb).

**Scroll spy integration**: Tapping chip scrolls content via scrollIntoView. IntersectionObserver on section headings updates active chip. Chip row auto-scrolls to keep active chip visible.

**Shadow on scroll**: box-shadow: 0 2px 4px rgba(0,0,0,0.08) when scrolled below initial position.

---

## Next Steps (Brainstorming Step 3 of 9)

When resuming this session:
1. We are at **step 3: clarifying questions** — need to determine scope (which items to include in the redesign)
2. The visual companion server will need restarting (was at http://localhost:64797)
3. After scope is set → propose 2-3 approaches (step 4) → present design sections (step 5) → write spec (step 6) → implementation plan (step 7)
4. Key decision needed: Tier 1 only, Tier 1 + cherry-picks, or full overhaul?
