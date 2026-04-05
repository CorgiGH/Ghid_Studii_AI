# Progress Bar: Left-to-Right Fill + Restore Animations

**Date:** 2026-04-05
**Component:** `src/components/ui/InlineProgress.jsx`

---

## Problem

1. Segments currently map 1:1 to specific section IDs — checking section 3 lights up segment 3 even if sections 1-2 are unchecked. User wants left-to-right fill by count.
2. Celebration animations (green flash, +1 floater, counter bounce, completion merge) existed in the old `StickyProgressBar` but were lost when `InlineProgress` replaced it.

## Changes

### 1. Left-to-right fill by count

- Segment `i` is green when `i < completedCount`, not based on `sectionIds[i]`
- Remove `sectionIds` from the coloring logic (prop can stay accepted but unused)
- Remove the `isNext` partial-fill gradient — segments are either filled (green/blue) or empty (theme border)

### 2. Port animations from StickyProgressBar

Add refs: `prevCountRef`, `segmentsRef`, `counterRef`, `barRef`, `initializedRef`.

**On section completion (completedCount increases):**
1. **Green flash** — newly filled segment flashes `linear-gradient(90deg, #22c55e, #4ade80)`, fades to `#3b82f6` (300ms delay, 500ms transition)
2. **"+1" floater** — absolutely positioned div with "+1" text rises from segment center, fades out (0.7s `floatUp` keyframe)
3. **Counter bounce** — ProgressRing wrapper gets `scale(1.45)` bounce (0.45s `counterBounce` keyframe)

**On course completion (all sections checked):**
1. Normal section celebration fires first
2. Segments merge (400ms after) — gap transitions to 0, inner border-radii flatten, all segments go `#22c55e`
3. Counter text changes to "Complete"/"Complet"

**Guards:**
- `initializedRef` prevents animations on first render
- `prefers-reduced-motion: reduce` skips all animations
- Floater elements self-remove after animation completes

### 3. CSS keyframes needed

```css
@keyframes floatUp {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-18px); }
}

@keyframes counterBounce {
  0% { transform: scale(1); }
  40% { transform: scale(1.45); color: #4ade80; }
  100% { transform: scale(1); }
}
```

These already exist in `src/index.css` (lines 66-76). No CSS changes needed.

## What stays the same

- Sticky positioning logic (topBar height measurement via ResizeObserver)
- ProgressRing component on the right
- `courseId` prefix-based counting from `checked` state
- `forwardRef` pattern
- Overall layout structure
