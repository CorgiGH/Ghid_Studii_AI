# Animations & Micro-Interactions Design

**Date:** 2026-04-04
**Goal:** Make the study guide feel engaging and rewarding — designed for ADHD-friendly dopamine loops. Instantly rewarding for completing things, satisfying while doing them, but not over the top.

**No animation libraries.** All animations use CSS transitions/keyframes + one canvas-drawn effect for the course completion vignette. Zero new dependencies.

---

## 1. Sticky Segmented Progress Bar

**What:** Replace the current top-of-course progress bar (ReadingProgress component) with a sticky segmented bar that follows the user as they scroll.

**Behavior:**
- Bar is divided into discrete segments (one per section in the course)
- Sticks to the top of the viewport below the TopBar/ContentTypeBar when scrolling
- Shows course name + "N/total" counter on the left

**Section completion celebration (fires on each checkbox toggle):**
1. **Green flash** — the newly completed segment lights up green (`#22c55e`/`#4ade80` gradient), then transitions to blue (`#3b82f6`) over 300ms → 500ms fade
2. **"+1" floater** — a "+1" text in green rises from the completed segment and fades out (0.7s, ease-out, `floatUp` keyframe)
3. **Counter bounce** — the "N/total" number does a scale(1.45) bounce with green color flash (0.45s, `counterBounce` keyframe)

**No shimmer.** These three effects fire simultaneously on completion.

## 2. Course Completion Celebration

**Triggers when:** the final section checkbox is checked (all segments filled).

**Sequence:**
1. Normal section celebration fires first (+1, green flash, counter bounce)
2. **Segments merge** (400ms after) — gap between segments transitions to 0, inner border-radii flatten so segments become one solid green bar
3. **Checkmark draws** (500ms after) — an SVG checkmark appears next to the course title. Circle draws via `stroke-dashoffset` animation (0.4s), then checkmark path draws (0.3s, 0.4s delay)
4. **Counter updates** (700ms after) — text changes to "Complete" in green
5. **Inner vignette sweep** (500ms after) — canvas-drawn smooth glow:
   - A soft green radial glow with a feathered tail sweeps clockwise around the inner border of the page
   - Uses `requestAnimationFrame` with 180 perimeter sample points following the rounded-rect path
   - Tail length: ~25% of perimeter, intensity via `cos(falloff * PI/2)` for smooth falloff
   - As the sweep passes each point, a settled residual glow builds up to match the final hold intensity — no jarring transition when sweep completes
   - After full orbit, glow fades out smoothly (800ms, ease-in quad)
   - Leaves behind a subtle green border (`rgba(34,197,94,0.35)`) + faint box-shadow as the completed resting state
   - All glow stays inside the page bounds (`overflow: hidden` on container)

**Implementation:** Canvas overlay positioned absolutely inside the course content container. The perimeter point calculation walks the rounded-rect edges (straight segments + quarter-circle arcs at corners).

## 3. Interactive Elements — Hover Lift + Press-Down

**Applies to:** all clickable buttons, course cards, subject cards, sidebar items, ContentTypeBar tabs.

**Hover state:**
- `translateY(-2px)` lift
- Box-shadow increases: `0 6px 16px rgba(59,130,246,0.3)` for primary, lighter for secondary/ghost
- Transition: 0.15s ease

**Active/click state:**
- `translateY(1px) scale(0.97)` press-down
- Box-shadow shrinks: `0 1px 2px rgba(0,0,0,0.3)`
- Transition: 0.08s ease (snappier than hover for crisp feedback)

**Variant styling:**
- Primary buttons: blue glow shadow on hover
- Secondary buttons: subtle purple-ish shadow
- Ghost buttons: very faint shadow
- Cards: slightly more lift (`translateY(-3px)`) + border-color lighten on hover

## 4. Expand/Collapse — Polished Accordion

**Applies to:** Section component, Toggle component, CourseBlock component.

**Behavior:**
- Chevron/arrow rotates 90° with `cubic-bezier(0.4, 0, 0.2, 1)` over 0.35s
- Content height animates via `max-height` with same easing curve, 0.35s
- Replace current 0.2s `slideDown` keyframe with the smoother CSS transition approach

## 5. Page/Route Transitions — Staggered Entrance

**Applies to:** course content swap, tab switches (Courses/Seminars/Labs/Practice/Tests), home page card grid.

**Behavior:**
- Content swaps instantly (no exit animation — keeps things fast)
- New content's top-level children animate in with a cascade:
  - Each child: `opacity: 0 → 1` + `translateY(12px) → 0`
  - Duration: 0.25s ease per element
  - Stagger delay: 80ms between elements (slightly slower than default for readability)
- Maximum stagger depth: ~8 elements, then remaining appear together

**Where specifically:**
- Course sections stagger when loading a course
- Subject cards stagger on home page
- CourseMap tiles stagger when entering Courses tab

## 6. Bug Fix — Sidebar First Course Cutoff

**Problem:** Sidebar uses `lg:sticky top-0` but the TopBar and ContentTypeBar sit above it, so the first course button is hidden behind them when scrolling.

**Fix:** TopBar is ~44px (`py-2.5` + content), ContentTypeBar is ~36px (`py-2` + content), combined ~80px. Change sidebar from `lg:sticky top-0 h-screen` to `lg:sticky top-20 h-[calc(100vh-5rem)]` (top-20 = 80px). This positions the sidebar below both bars and prevents bottom overflow. The sticky progress bar (section 1) should also use the same top offset.

---

## CSS Custom Properties to Add

```css
/* Animation timing tokens */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--duration-fast: 0.15s;
--duration-normal: 0.35s;

/* Completion colors */
--color-complete: #22c55e;
--color-complete-bright: #4ade80;
```

## Files to Modify

- `src/components/ui/ReadingProgress.jsx` — Replace with sticky segmented bar + celebration logic
- `src/components/ui/Section.jsx` — Add polished accordion transition
- `src/components/ui/Toggle.jsx` — Add polished accordion transition
- `src/components/ui/CourseBlock.jsx` — Add polished accordion transition
- `src/components/layout/Sidebar.jsx` — Fix sticky top offset
- `src/index.css` — Add keyframes (`floatUp`, `counterBounce`), animation tokens
- `src/pages/SubjectPage.jsx` — Add staggered entrance for course content
- `src/pages/Home.jsx` — Add staggered entrance for subject cards
- `src/components/ui/CourseMap.jsx` — Add staggered entrance for tiles

## New Files

- `src/components/ui/StickyProgressBar.jsx` — New segmented sticky progress bar with celebration effects
- `src/components/ui/CompletionVignette.jsx` — Canvas-based vignette sweep component
- `src/hooks/useStaggeredEntrance.js` — Reusable hook for staggered child animations

## Accessibility

- All animations respect `prefers-reduced-motion: reduce` — disable floaters, vignette, stagger. Keep basic color transitions only.
- Progress bar counter text always updates regardless of animation state.
