# Course Completion Toast + Restore ProgressRing

**Date:** 2026-04-05
**Component:** `src/components/ui/InlineProgress.jsx`

---

## Changes

### 1. Restore ProgressRing in progress bar

- Replace the `<span>` text counter (`N/total` / `Complete`) with `<ProgressRing size={22} completed={completedCount} total={sectionCount} />`
- Wrap ProgressRing in a `<div ref={counterRef}>` so the existing `counterBounce` animation applies to the wrapper
- Remove the `t` import usage for "Complete"/"Complet" in the counter (ProgressRing handles its own display)

### 2. Course completion toast (center popup)

**Trigger:** `completedCount >= sectionCount` detected in the existing `useEffect` change handler, fires after `celebrateComplete()`.

**Visual:**
- Overlay: absolute positioned over the progress bar's parent (or portal to page content area), `rgba(15,23,42,0.6)` background with `backdrop-filter: blur(2px)`
- Card: dark bg (`#1e293b`), green border (`#22c55e`), rounded 16px, centered
- Green checkmark circle (48px, gradient `#22c55e → #16a34a`, glow shadow)
- Title: "Course Complete!" / "Curs complet!" (bilingual via `t()`)
- Subtitle: "All N sections finished" / "Toate cele N secțiuni completate"
- Entry animation: `popIn` — `scale(0.8) → scale(1)` with `cubic-bezier(0.34, 1.56, 0.64, 1)`, 0.4s
- Auto-dismiss after 2 seconds with fade-out (0.3s)
- Click overlay to dismiss early

**Implementation:** Managed via `useState` boolean (`showToast`). Set to `true` in `celebrateComplete`, `setTimeout` sets it to `false` after 2s. Rendered conditionally inside the component (absolute positioned relative to the content area).

**Note:** The toast needs to overlay the course content, not just the progress bar. It should be rendered as a fixed/absolute overlay relative to the main content area. Since `InlineProgress` is a child of the content wrapper, it can render a `position: fixed` overlay that covers the viewport center.

**Guards:**
- `prefers-reduced-motion: reduce` — skip animation, still show toast briefly
- `initializedRef` — no toast on mount

### 3. CSS keyframes needed

```css
@keyframes popIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

Add to `src/index.css` alongside existing `floatUp` and `counterBounce` keyframes.

## What stays the same

- All existing progress bar behavior (left-to-right fill, segment animations, green flash, +1 floater, completion merge)
- Sticky positioning, topBar height measurement
- `forwardRef` pattern
