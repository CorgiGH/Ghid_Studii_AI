# UX/UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve visual polish, build a data-driven animation system, and add learning flow features (resume, quiz feedback, mobile sidebar).

**Architecture:** Three independent workstreams. WS1 tweaks CSS across existing block components. WS2 adds `motion` (framer-motion) and builds StepPlayer + 3 renderers (Array, Graph, Table) routed through AnimationBlock. WS3 enhances QuizBlock with per-distractor feedback, adds a resume banner to CourseMap, and converts the mobile sidebar to a bottom sheet.

**Tech Stack:** React 19, Tailwind CSS v4, motion (framer-motion), CSS custom properties

---

## File Map

### WS1: Visual Polish (modify only)
- `src/components/blocks/learn/LearnBlock.jsx` — label size
- `src/components/blocks/definition/DefinitionBlock.jsx` — label size
- `src/components/blocks/layout/CalloutBlock.jsx` — label size + dark callout colors
- `src/components/blocks/media/CodeBlock.jsx` — label size
- `src/components/blocks/interactive/AnimationBlock.jsx` — label size + dark callout colors
- `src/components/blocks/assessment/ThinkBlock.jsx` — label size + dark callout colors
- `src/components/blocks/assessment/QuizBlock.jsx` — label size + option padding
- `src/index.css` — theme transition rule

### WS2: Animation System (create + modify)
- `src/components/blocks/interactive/StepPlayer.jsx` — **CREATE** shared playback controls
- `src/components/blocks/interactive/ArrayRenderer.jsx` — **CREATE** sorting/searching viz
- `src/components/blocks/interactive/GraphRenderer.jsx` — **CREATE** graph traversal viz
- `src/components/blocks/interactive/TableRenderer.jsx` — **CREATE** DP table viz
- `src/components/blocks/interactive/AnimationBlock.jsx` — modify to route new renderers

### WS3: Learning Flow (modify + create)
- `src/components/blocks/assessment/QuizBlock.jsx` — per-distractor feedback
- `src/components/ui/CourseMap.jsx` — resume banner + progress-aware tile styling
- `src/components/blocks/CourseRenderer.jsx` — save lastStep to localStorage
- `src/components/layout/Sidebar.jsx` — mobile bottom sheet
- `src/components/layout/BottomSheet.jsx` — **CREATE** reusable bottom sheet

---

## WS1: Visual Polish

### Task 1: Fix block label sizes (WCAG)

**Files:**
- Modify: `src/components/blocks/learn/LearnBlock.jsx:25`
- Modify: `src/components/blocks/definition/DefinitionBlock.jsx:16`
- Modify: `src/components/blocks/layout/CalloutBlock.jsx:25`
- Modify: `src/components/blocks/media/CodeBlock.jsx:8`
- Modify: `src/components/blocks/interactive/AnimationBlock.jsx:28`
- Modify: `src/components/blocks/assessment/ThinkBlock.jsx:29`
- Modify: `src/components/blocks/assessment/QuizBlock.jsx:16`

- [ ] **Step 1: Update LearnBlock label**

In `src/components/blocks/learn/LearnBlock.jsx`, change line 25:

```jsx
// Before:
className="text-[10px] font-bold uppercase tracking-widest mb-2"
// After:
className="text-xs font-semibold uppercase tracking-wide mb-2"
```

- [ ] **Step 2: Update DefinitionBlock label**

In `src/components/blocks/definition/DefinitionBlock.jsx`, change line 16:

```jsx
// Before:
className="text-[10px] font-bold uppercase tracking-widest mb-2"
// After:
className="text-xs font-semibold uppercase tracking-wide mb-2"
```

- [ ] **Step 3: Update CalloutBlock label**

In `src/components/blocks/layout/CalloutBlock.jsx`, change line 25:

```jsx
// Before:
className="text-[10px] font-bold uppercase tracking-widest mb-2"
// After:
className="text-xs font-semibold uppercase tracking-wide mb-2"
```

- [ ] **Step 4: Update CodeBlock label**

In `src/components/blocks/media/CodeBlock.jsx`, change line 8:

```jsx
// Before:
className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
// After:
className="px-3 py-1 text-xs font-semibold uppercase tracking-wide"
```

- [ ] **Step 5: Update AnimationBlock label**

In `src/components/blocks/interactive/AnimationBlock.jsx`, change line 28 (the fallback div):

```jsx
// Before:
className="text-[10px] font-bold uppercase tracking-widest mb-2"
// After:
className="text-xs font-semibold uppercase tracking-wide mb-2"
```

- [ ] **Step 6: Update ThinkBlock label**

In `src/components/blocks/assessment/ThinkBlock.jsx`, change line 29:

```jsx
// Before:
className="text-[10px] font-bold uppercase tracking-widest mb-2"
// After:
className="text-xs font-semibold uppercase tracking-wide mb-2"
```

- [ ] **Step 7: Update QuizBlock label**

In `src/components/blocks/assessment/QuizBlock.jsx`, change line 16:

```jsx
// Before:
className="text-[10px] font-bold uppercase tracking-widest mb-3"
// After:
className="text-xs font-semibold uppercase tracking-wide mb-3"
```

- [ ] **Step 8: Verify visually**

Run: `npm run dev`

Open any JSON course page. Verify block labels (Learn, Definition, Tip, Warning, Code, Think, Quiz) are slightly larger and readable. Compare against 10px — should be 12px now.

- [ ] **Step 9: Commit**

```bash
git add src/components/blocks/learn/LearnBlock.jsx src/components/blocks/definition/DefinitionBlock.jsx src/components/blocks/layout/CalloutBlock.jsx src/components/blocks/media/CodeBlock.jsx src/components/blocks/interactive/AnimationBlock.jsx src/components/blocks/assessment/ThinkBlock.jsx src/components/blocks/assessment/QuizBlock.jsx
git commit -m "fix: increase block label size from 10px to 12px (WCAG AA)"
```

---

### Task 2: Increase quiz option padding

**Files:**
- Modify: `src/components/blocks/assessment/QuizBlock.jsx:61,86`

- [ ] **Step 1: Update option gap**

In `src/components/blocks/assessment/QuizBlock.jsx`, change line 61:

```jsx
// Before:
<div className="flex flex-col gap-2">
// After:
<div className="flex flex-col gap-3">
```

- [ ] **Step 2: Update option button padding**

In the same file, change line 86 (the option `<button>`):

```jsx
// Before:
className="flex items-center gap-3 p-2.5 rounded-lg text-left text-sm cursor-pointer"
// After:
className="flex items-center gap-3 p-3.5 rounded-lg text-left text-sm cursor-pointer"
```

- [ ] **Step 3: Verify visually**

Run: `npm run dev`

Open a course page with a quiz block. Options should have more breathing room. Touch targets should feel comfortable.

- [ ] **Step 4: Commit**

```bash
git add src/components/blocks/assessment/QuizBlock.jsx
git commit -m "fix: increase quiz option padding for better touch targets"
```

---

### Task 3: Fix dark mode callout visibility

**Files:**
- Modify: `src/components/blocks/layout/CalloutBlock.jsx:19-20`
- Modify: `src/components/blocks/interactive/AnimationBlock.jsx:27`
- Modify: `src/components/blocks/assessment/ThinkBlock.jsx:23-24`

- [ ] **Step 1: Update CalloutBlock color-mix values**

In `src/components/blocks/layout/CalloutBlock.jsx`, change lines 19-20:

```jsx
// Before:
backgroundColor: `color-mix(in srgb, ${v.color} 6%, var(--theme-card-bg))`,
border: `1px solid color-mix(in srgb, ${v.color} 15%, var(--theme-border))`,
// After:
backgroundColor: `color-mix(in srgb, ${v.color} 12%, var(--theme-card-bg))`,
border: `1px solid color-mix(in srgb, ${v.color} 25%, var(--theme-border))`,
```

- [ ] **Step 2: Update AnimationBlock fallback color-mix values**

In `src/components/blocks/interactive/AnimationBlock.jsx`, change line 27 (the fallback div's style):

```jsx
// Before:
style={{ backgroundColor: 'color-mix(in srgb, #10b981 6%, var(--theme-card-bg))', border: '1px solid color-mix(in srgb, #10b981 15%, var(--theme-border))' }}
// After:
style={{ backgroundColor: 'color-mix(in srgb, #10b981 12%, var(--theme-card-bg))', border: '1px solid color-mix(in srgb, #10b981 25%, var(--theme-border))' }}
```

- [ ] **Step 3: Update ThinkBlock color-mix values**

In `src/components/blocks/assessment/ThinkBlock.jsx`, change lines 23-24:

```jsx
// Before:
backgroundColor: 'color-mix(in srgb, #f59e0b 6%, var(--theme-card-bg))',
border: '1px solid color-mix(in srgb, #f59e0b 15%, var(--theme-border))',
// After:
backgroundColor: 'color-mix(in srgb, #f59e0b 12%, var(--theme-card-bg))',
border: '1px solid color-mix(in srgb, #f59e0b 25%, var(--theme-border))',
```

- [ ] **Step 4: Update QuizBlock outer container color-mix**

In `src/components/blocks/assessment/QuizBlock.jsx`, change lines 11-12:

```jsx
// Before:
backgroundColor: 'color-mix(in srgb, #a855f7 6%, var(--theme-card-bg))',
border: '1px solid color-mix(in srgb, #a855f7 15%, var(--theme-border))',
// After:
backgroundColor: 'color-mix(in srgb, #a855f7 12%, var(--theme-card-bg))',
border: '1px solid color-mix(in srgb, #a855f7 25%, var(--theme-border))',
```

- [ ] **Step 5: Verify in dark mode**

Run: `npm run dev`

Switch to dark mode. Verify callout blocks (tip, warning, trap, info), think blocks, quiz blocks, and animation placeholders all have visible tinted backgrounds. They should be noticeably tinted, not invisible.

- [ ] **Step 6: Commit**

```bash
git add src/components/blocks/layout/CalloutBlock.jsx src/components/blocks/interactive/AnimationBlock.jsx src/components/blocks/assessment/ThinkBlock.jsx src/components/blocks/assessment/QuizBlock.jsx
git commit -m "fix: increase dark mode callout tint 6%→12% for visibility"
```

---

### Task 4: Add theme switch transition

**Files:**
- Modify: `src/index.css:32-34`

- [ ] **Step 1: Add transition to body rule**

In `src/index.css`, update the `body` rule (around line 32):

```css
/* Before: */
body {
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
}

/* After: */
body {
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  transition: background-color 0.2s ease, color 0.2s ease;
}

*,
*::before,
*::after {
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
```

- [ ] **Step 2: Exclude animations from the global transition**

Add an override so interactive elements and animations aren't slowed:

```css
/* Exclude interactive elements from global transition */
button,
a,
input,
.animate-pulse,
[style*="transition"] {
  transition: unset;
}
```

Wait — this approach is too broad. A global `*` transition will interfere with hover states, quiz animations, etc. Better approach: apply transitions only to themed containers.

**Revised Step 1:** Instead of `*`, target only the containers that change on theme switch:

```css
body {
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Smooth theme switching for themed containers */
[style*="--theme"],
.rounded-xl,
header,
aside,
nav {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
```

Actually, since all themed elements use inline `style` with `var(--theme-*)`, and `applyPalette()` changes CSS custom properties on `:root`, the simplest and safest approach is just the body transition. CSS custom property changes propagate instantly — the transition on `body` covers the page background. Individual component backgrounds won't smoothly transition unless they also have the transition property.

**Final approach — minimal and safe:**

In `src/index.css`, replace the body rule:

```css
body {
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  transition: background-color 0.2s ease, color 0.2s ease;
}
```

That's it. The body background and text will transition smoothly. Individual block components already have inline styles with CSS custom properties — adding transitions to all of them would require touching every component. The body-only transition gives 80% of the polish for 1% of the work.

- [ ] **Step 2: Verify**

Run: `npm run dev`

Toggle dark mode and switch palettes. The page background should smoothly fade instead of snapping.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: add smooth body transition for theme switching"
```

---

## WS2: Animation System

### Task 5: Install motion dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install motion**

```bash
npm install motion
```

- [ ] **Step 2: Verify install**

```bash
npm run build
```

Expected: Build succeeds with no errors. `motion` should appear in `package.json` dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add motion (framer-motion) for animation system"
```

---

### Task 6: Build StepPlayer component

**Files:**
- Create: `src/components/blocks/interactive/StepPlayer.jsx`

- [ ] **Step 1: Create StepPlayer**

Create `src/components/blocks/interactive/StepPlayer.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

const SPEEDS = [0.5, 1, 2, 4];

export default function StepPlayer({ totalSteps, currentStep, onStepChange, playing, onPlayPause, speed, onSpeedChange, stepLabel }) {
  const { t } = useApp();

  const canBack = currentStep > 0;
  const canForward = currentStep < totalSteps - 1;

  const nextSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    onSpeedChange(SPEEDS[(idx + 1) % SPEEDS.length]);
  };

  return (
    <div
      className="flex items-center gap-2 p-2 rounded-lg text-xs"
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        border: '1px solid var(--theme-border)',
      }}
    >
      {/* Play / Pause */}
      <button
        onClick={onPlayPause}
        className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
        style={{ backgroundColor: '#3b82f6', color: 'white' }}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="3" height="8" fill="white"/><rect x="6" y="1" width="3" height="8" fill="white"/></svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10"><polygon points="2,0 10,5 2,10" fill="white"/></svg>
        )}
      </button>

      {/* Step back */}
      <button
        onClick={() => canBack && onStepChange(currentStep - 1)}
        className="px-1 cursor-pointer"
        style={{ color: canBack ? 'var(--theme-content-text)' : 'var(--theme-border)', pointerEvents: canBack ? 'auto' : 'none' }}
        aria-label="Previous step"
      >
        <svg width="12" height="12" viewBox="0 0 12 12"><path d="M8 1L3 6L8 11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
      </button>

      {/* Progress bar */}
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 100}%`, backgroundColor: '#3b82f6' }}
        />
      </div>

      {/* Step forward */}
      <button
        onClick={() => canForward && onStepChange(currentStep + 1)}
        className="px-1 cursor-pointer"
        style={{ color: canForward ? 'var(--theme-content-text)' : 'var(--theme-border)', pointerEvents: canForward ? 'auto' : 'none' }}
        aria-label="Next step"
      >
        <svg width="12" height="12" viewBox="0 0 12 12"><path d="M4 1L9 6L4 11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
      </button>

      {/* Step counter */}
      <span className="font-mono whitespace-nowrap" style={{ color: 'var(--theme-muted-text)' }}>
        {currentStep + 1}/{totalSteps}
      </span>

      {/* Speed button */}
      <button
        onClick={nextSpeed}
        className="px-1.5 py-0.5 rounded font-mono cursor-pointer"
        style={{ backgroundColor: 'var(--theme-border)', color: 'var(--theme-content-text)' }}
      >
        {speed}x
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify import works**

Temporarily import StepPlayer in AnimationBlock to confirm no build errors:

```bash
npm run build
```

Remove the temporary import after confirming.

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/interactive/StepPlayer.jsx
git commit -m "feat: add StepPlayer shared animation controls"
```

---

### Task 7: Build ArrayRenderer

**Files:**
- Create: `src/components/blocks/interactive/ArrayRenderer.jsx`

- [ ] **Step 1: Create ArrayRenderer**

Create `src/components/blocks/interactive/ArrayRenderer.jsx`:

```jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../../contexts/AppContext';
import StepPlayer from './StepPlayer';

const COLORS = {
  comparing: '#ef4444',
  swapped: '#22c55e',
  sorted: '#86efac',
  pivot: '#f59e0b',
  found: '#3b82f6',
  default: 'var(--theme-border)',
};

export default function ArrayRenderer({ data }) {
  const { t } = useApp();
  const { meta, config, steps } = data;
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  const step = steps[currentStep];
  const display = config?.display || 'bars';
  const maxVal = Math.max(...steps.flatMap(s => s.array));

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    if (!playing) { stopTimer(); return; }
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, 800 / speed);
    return stopTimer;
  }, [playing, speed, steps.length, stopTimer]);

  const getColor = (index) => {
    const h = step.highlights || {};
    if (h.sorted?.includes(index)) return COLORS.sorted;
    if (h.comparing?.includes(index)) return COLORS.comparing;
    if (h.swapped?.includes(index)) return COLORS.swapped;
    if (h.pivot?.includes(index)) return COLORS.pivot;
    if (h.found?.includes(index)) return COLORS.found;
    return COLORS.default;
  };

  return (
    <div className="rounded-xl p-4 mb-3" style={{
      backgroundColor: 'color-mix(in srgb, #10b981 12%, var(--theme-card-bg))',
      border: '1px solid color-mix(in srgb, #10b981 25%, var(--theme-border))',
    }}>
      <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#10b981' }}>
        {meta?.algorithm || t('Animation', 'Animatie')}
      </div>

      {meta?.description && (
        <p className="text-xs mb-3" style={{ color: 'var(--theme-muted-text)' }}>
          {t(meta.description.en, meta.description.ro)}
        </p>
      )}

      {/* Array visualization */}
      <div className="flex items-end gap-1 justify-center mb-3" style={{ height: display === 'bars' ? '120px' : 'auto' }}>
        {step.array.map((val, i) => {
          const color = getColor(i);
          if (display === 'bars') {
            return (
              <motion.div
                key={i}
                layout
                className="rounded-t-sm flex items-end justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: color, width: `${Math.max(100 / step.array.length - 2, 8)}%` }}
                animate={{ height: `${(val / maxVal) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <span className="pb-0.5">{val}</span>
              </motion.div>
            );
          }
          // cells mode
          return (
            <motion.div
              key={i}
              layout
              className="w-10 h-10 rounded flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: color, color: color === COLORS.default ? 'var(--theme-content-text)' : 'white' }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {val}
            </motion.div>
          );
        })}
      </div>

      {/* Step label */}
      {step.label && (
        <p className="text-xs text-center mb-2" style={{ color: 'var(--theme-content-text)' }}>
          {t(step.label.en, step.label.ro)}
        </p>
      )}

      <StepPlayer
        totalSteps={steps.length}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/interactive/ArrayRenderer.jsx
git commit -m "feat: add ArrayRenderer for sorting/searching animations"
```

---

### Task 8: Build GraphRenderer

**Files:**
- Create: `src/components/blocks/interactive/GraphRenderer.jsx`

- [ ] **Step 1: Create GraphRenderer**

Create `src/components/blocks/interactive/GraphRenderer.jsx`:

```jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../../contexts/AppContext';
import StepPlayer from './StepPlayer';

const NODE_R = 18;

const NODE_COLORS = {
  active:    { fill: '#3b82f6', stroke: '#3b82f6', text: 'white' },
  visited:   { fill: '#22c55e', stroke: '#22c55e', text: 'white' },
  queued:    { fill: 'var(--theme-card-bg)', stroke: '#f59e0b', text: 'var(--theme-content-text)' },
  unvisited: { fill: 'var(--theme-card-bg)', stroke: 'var(--theme-border)', text: 'var(--theme-content-text)' },
};

export default function GraphRenderer({ data }) {
  const { t } = useApp();
  const { meta, graph, steps } = data;
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  const step = steps[currentStep];

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    if (!playing) { stopTimer(); return; }
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, 1000 / speed);
    return stopTimer;
  }, [playing, speed, steps.length, stopTimer]);

  const getNodeState = (id) => {
    if (id === step.active) return 'active';
    if (step.visited?.includes(id)) return 'visited';
    if (step.queue?.includes(id)) return 'queued';
    return 'unvisited';
  };

  const isEdgeHighlighted = (from, to) => {
    return step.edgeHighlights?.some(e =>
      (e.from === from && e.to === to) || (!graph.directed && e.from === to && e.to === from)
    );
  };

  // Compute SVG viewBox from node positions
  const xs = graph.nodes.map(n => n.x);
  const ys = graph.nodes.map(n => n.y);
  const pad = 30;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const maxX = Math.max(...xs) + pad;
  const maxY = Math.max(...ys) + pad;
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  const nodeMap = Object.fromEntries(graph.nodes.map(n => [n.id, n]));

  return (
    <div className="rounded-xl p-4 mb-3" style={{
      backgroundColor: 'color-mix(in srgb, #10b981 12%, var(--theme-card-bg))',
      border: '1px solid color-mix(in srgb, #10b981 25%, var(--theme-border))',
    }}>
      <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#10b981' }}>
        {meta?.algorithm || t('Graph Animation', 'Animatie graf')}
      </div>

      {meta?.description && (
        <p className="text-xs mb-3" style={{ color: 'var(--theme-muted-text)' }}>
          {t(meta.description.en, meta.description.ro)}
        </p>
      )}

      {/* SVG graph */}
      <svg viewBox={viewBox} className="w-full mb-3" style={{ maxHeight: '280px' }}>
        {/* Edges */}
        {graph.edges.map((edge, i) => {
          const from = nodeMap[edge.from];
          const to = nodeMap[edge.to];
          if (!from || !to) return null;
          const highlighted = isEdgeHighlighted(edge.from, edge.to);
          return (
            <g key={i}>
              <motion.line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={highlighted ? '#3b82f6' : 'var(--theme-border)'}
                strokeWidth={highlighted ? 2.5 : 1.5}
                animate={{ stroke: highlighted ? '#3b82f6' : 'var(--theme-border)' }}
                transition={{ duration: 0.3 }}
              />
              {edge.weight != null && (
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--theme-muted-text)"
                >
                  {edge.weight}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {graph.nodes.map(node => {
          const state = getNodeState(node.id);
          const colors = NODE_COLORS[state];
          return (
            <g key={node.id}>
              <motion.circle
                cx={node.x} cy={node.y} r={NODE_R}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={state === 'queued' ? 2 : 1.5}
                strokeDasharray={state === 'queued' ? '4 2' : 'none'}
                animate={{ fill: colors.fill, stroke: colors.stroke }}
                transition={{ duration: 0.3 }}
              />
              {state === 'active' && (
                <motion.circle
                  cx={node.x} cy={node.y} r={NODE_R + 4}
                  fill="none" stroke="#3b82f6" strokeWidth={1}
                  animate={{ opacity: [0.6, 0, 0.6], r: [NODE_R + 2, NODE_R + 8, NODE_R + 2] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <text
                x={node.x} y={node.y + 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={colors.text}
              >
                {node.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Step label */}
      {step.label && (
        <p className="text-xs text-center mb-2" style={{ color: 'var(--theme-content-text)' }}>
          {t(step.label.en, step.label.ro)}
        </p>
      )}

      <StepPlayer
        totalSteps={steps.length}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/interactive/GraphRenderer.jsx
git commit -m "feat: add GraphRenderer for graph traversal animations"
```

---

### Task 9: Build TableRenderer

**Files:**
- Create: `src/components/blocks/interactive/TableRenderer.jsx`

- [ ] **Step 1: Create TableRenderer**

Create `src/components/blocks/interactive/TableRenderer.jsx`:

```jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../../contexts/AppContext';
import StepPlayer from './StepPlayer';

const CELL_COLORS = {
  active:     { bg: '#f59e0b', text: 'white' },
  computed:   { bg: 'color-mix(in srgb, #22c55e 15%, var(--theme-card-bg))', text: 'var(--theme-content-text)' },
  dependency: { bg: 'var(--theme-card-bg)', text: '#3b82f6', border: '#3b82f6' },
  pending:    { bg: 'var(--theme-card-bg)', text: 'var(--theme-muted-text)' },
};

function parseCoord(str) {
  const [r, c] = str.split(',').map(Number);
  return { r, c };
}

export default function TableRenderer({ data }) {
  const { t } = useApp();
  const { meta, config, steps } = data;
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  const step = steps[currentStep];
  const rows = config?.rows || [];
  const cols = config?.cols || [];

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    if (!playing) { stopTimer(); return; }
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, 600 / speed);
    return stopTimer;
  }, [playing, speed, steps.length, stopTimer]);

  // Build cumulative fills up to current step
  const fills = {};
  for (let i = 0; i <= currentStep; i++) {
    if (steps[i].fills) {
      Object.assign(fills, steps[i].fills);
    }
  }

  const getCellState = (coord) => {
    if (coord === step.active) return 'active';
    if (step.dependencies?.includes(coord)) return 'dependency';
    if (fills[coord] !== undefined) return 'computed';
    return 'pending';
  };

  return (
    <div className="rounded-xl p-4 mb-3" style={{
      backgroundColor: 'color-mix(in srgb, #10b981 12%, var(--theme-card-bg))',
      border: '1px solid color-mix(in srgb, #10b981 25%, var(--theme-border))',
    }}>
      <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#10b981' }}>
        {meta?.algorithm || t('DP Table', 'Tabel PD')}
      </div>

      {meta?.description && (
        <p className="text-xs mb-3" style={{ color: 'var(--theme-muted-text)' }}>
          {t(meta.description.en, meta.description.ro)}
        </p>
      )}

      {/* Table grid */}
      <div className="overflow-x-auto mb-3">
        <table className="mx-auto text-xs" style={{ borderCollapse: 'separate', borderSpacing: '3px' }}>
          {/* Column headers */}
          {cols.length > 1 && (
            <thead>
              <tr>
                <td />
                {cols.map((col, ci) => (
                  <td key={ci} className="text-center px-2 py-1 font-semibold" style={{ color: 'var(--theme-muted-text)' }}>
                    {col}
                  </td>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                <td className="px-2 py-1 font-semibold text-right" style={{ color: 'var(--theme-muted-text)' }}>
                  {row}
                </td>
                {cols.map((_, ci) => {
                  const coord = `${ri},${ci}`;
                  const state = getCellState(coord);
                  const colors = CELL_COLORS[state];
                  const value = fills[coord];

                  return (
                    <td key={ci} className="text-center">
                      <motion.div
                        className="w-10 h-8 rounded flex items-center justify-center font-mono"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                          border: state === 'dependency' ? `1.5px solid ${colors.border}` : state === 'pending' ? '1.5px dashed var(--theme-border)' : '1.5px solid transparent',
                        }}
                        animate={state === 'active' ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {value !== undefined ? value : '?'}
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Step label */}
      {step.label && (
        <p className="text-xs text-center mb-2" style={{ color: 'var(--theme-content-text)' }}>
          {t(step.label.en, step.label.ro)}
        </p>
      )}

      <StepPlayer
        totalSteps={steps.length}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/interactive/TableRenderer.jsx
git commit -m "feat: add TableRenderer for DP table animations"
```

---

### Task 10: Update AnimationBlock to route new renderers

**Files:**
- Modify: `src/components/blocks/interactive/AnimationBlock.jsx`

- [ ] **Step 1: Rewrite AnimationBlock**

Replace the entire contents of `src/components/blocks/interactive/AnimationBlock.jsx`:

```jsx
import React, { lazy, Suspense } from 'react';
import { useApp } from '../../../contexts/AppContext';

const StringMatchAnimation = lazy(() => import('./StringMatchAnimation'));
const ArrayRenderer = lazy(() => import('./ArrayRenderer'));
const GraphRenderer = lazy(() => import('./GraphRenderer'));
const TableRenderer = lazy(() => import('./TableRenderer'));

const KNOWN_VARIANTS = {
  kmp: { component: StringMatchAnimation, props: { variant: 'kmp' } },
  'boyer-moore': { component: StringMatchAnimation, props: { variant: 'bm' } },
  'rabin-karp': { component: StringMatchAnimation, props: { variant: 'rk' } },
  'string-matching': { component: StringMatchAnimation, props: { variant: 'kmp' } },
};

const RENDERERS = {
  array: ArrayRenderer,
  graph: GraphRenderer,
  table: TableRenderer,
};

export default function AnimationBlock({ variant, renderer, data }) {
  const { t } = useApp();

  const loading = (
    <div className="animate-pulse p-4 text-sm opacity-50">
      {t('Loading animation...', 'Se incarca animatia...')}
    </div>
  );

  // New data-driven format: renderer + data
  if (renderer && RENDERERS[renderer]) {
    const Comp = RENDERERS[renderer];
    return (
      <Suspense fallback={loading}>
        <Comp data={data} />
      </Suspense>
    );
  }

  // Legacy variant format
  const entry = KNOWN_VARIANTS[variant];
  if (entry) {
    const Comp = entry.component;
    return (
      <Suspense fallback={loading}>
        <Comp {...entry.props} />
      </Suspense>
    );
  }

  // Fallback for unknown
  return (
    <div className="rounded-xl p-4 mb-3 text-center" style={{
      backgroundColor: 'color-mix(in srgb, #10b981 12%, var(--theme-card-bg))',
      border: '1px solid color-mix(in srgb, #10b981 25%, var(--theme-border))',
    }}>
      <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#10b981' }}>
        🎬 {t('Animation', 'Animație')}
      </div>
      <div className="text-xs" style={{ color: 'var(--theme-muted-text)' }}>
        {t('Animation placeholder', 'Placeholder animație')}: {variant || renderer}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify StepRenderer passes new props**

Check how `StepRenderer` renders animation blocks. Read `src/components/blocks/StepRenderer.jsx` to confirm it spreads block props to components. If it does `<Component {...block} />` or similar, then `renderer` and `data` will be passed automatically. If not, update it.

The block registry (`src/components/blocks/registry.js`) maps `animation` → `AnimationBlock`. StepRenderer loads the component from the registry and spreads the block's JSON fields as props. Since JSON courses already spread all fields, `renderer` and `data` will flow through.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Manual test with sample JSON**

To test, temporarily add a test animation block to any existing JSON course. For example, add this block to any step's `blocks` array:

```json
{
  "type": "animation",
  "renderer": "array",
  "data": {
    "meta": { "algorithm": "Bubble Sort", "description": { "en": "Sort by comparing adjacent pairs", "ro": "Sortare prin compararea perechilor adiacente" } },
    "config": { "display": "bars" },
    "steps": [
      { "array": [5, 3, 8, 1], "highlights": { "comparing": [0, 1] }, "label": { "en": "Compare 5 and 3", "ro": "Compara 5 si 3" } },
      { "array": [3, 5, 8, 1], "highlights": { "swapped": [0, 1] }, "label": { "en": "Swap! 3 < 5", "ro": "Interschimba! 3 < 5" } },
      { "array": [3, 5, 8, 1], "highlights": { "comparing": [1, 2] }, "label": { "en": "Compare 5 and 8", "ro": "Compara 5 si 8" } },
      { "array": [3, 5, 8, 1], "highlights": { "comparing": [2, 3] }, "label": { "en": "Compare 8 and 1", "ro": "Compara 8 si 1" } },
      { "array": [3, 5, 1, 8], "highlights": { "swapped": [2, 3], "sorted": [3] }, "label": { "en": "Swap! 1 < 8. 8 is sorted.", "ro": "Interschimba! 1 < 8. 8 e sortat." } }
    ]
  }
}
```

Open the page in the dev server and confirm:
- Bars render with correct heights
- Play button auto-advances steps
- Colors change (red=comparing, green=swapped)
- Step counter increments
- Speed button cycles through 0.5x/1x/2x/4x

Remove the test block after verifying.

- [ ] **Step 5: Commit**

```bash
git add src/components/blocks/interactive/AnimationBlock.jsx
git commit -m "feat: route AnimationBlock to data-driven renderers"
```

---

## WS3: Learning Flow

### Task 11: Add per-distractor quiz feedback

**Files:**
- Modify: `src/components/blocks/assessment/QuizBlock.jsx`

- [ ] **Step 1: Rewrite QuizQuestion to support per-option explanations**

Replace the entire `QuizQuestion` function (lines 28-156) in `src/components/blocks/assessment/QuizBlock.jsx`:

```jsx
function QuizQuestion({ q, index, total }) {
  const { t } = useApp();
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const explanationRef = useRef(null);
  const [explanationHeight, setExplanationHeight] = useState(0);

  useEffect(() => {
    if (!explanationRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setExplanationHeight(entry.contentRect.height);
    });
    ro.observe(explanationRef.current);
    return () => ro.disconnect();
  }, []);

  const handleSelect = (i) => {
    if (submitted) return;
    setSelected(i);
  };

  const handleCheck = () => {
    if (selected === null) return;
    setSubmitted(true);
  };

  // Determine if we have per-option explanations (new format) or single explanation (old format)
  const hasPerOptionExplanations = q.options.some(opt => opt.explanation);
  const correctIndex = q.options.findIndex(opt => opt.correct);

  return (
    <div className={index < total - 1 ? 'mb-4 pb-4' : ''} style={index < total - 1 ? { borderBottom: '1px solid var(--theme-border)' } : {}}>
      <p className="text-sm font-medium mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {total > 1 && <span style={{ color: 'var(--theme-muted-text)' }}>Q{index + 1}. </span>}
        {t(q.question.en, q.question.ro)}
      </p>
      <div className="flex flex-col gap-3">
        {q.options.map((opt, oi) => {
          let bg = 'var(--theme-card-bg)';
          let border = 'var(--theme-border)';
          let textColor = 'var(--theme-content-text)';

          if (submitted) {
            if (opt.correct) {
              bg = 'color-mix(in srgb, #10b981 12%, var(--theme-card-bg))';
              border = '#10b981';
              textColor = '#10b981';
            } else if (oi === selected && !opt.correct) {
              bg = 'color-mix(in srgb, #ef4444 12%, var(--theme-card-bg))';
              border = '#ef4444';
              textColor = '#ef4444';
            }
          } else if (oi === selected) {
            border = '#a855f7';
            bg = 'color-mix(in srgb, #a855f7 8%, var(--theme-card-bg))';
          }

          return (
            <div key={oi}>
              <button
                onClick={() => handleSelect(oi)}
                className="flex items-center gap-3 p-3.5 rounded-lg text-left text-sm cursor-pointer w-full"
                style={{
                  backgroundColor: bg,
                  border: `1px solid ${border}`,
                  color: textColor,
                  pointerEvents: submitted ? 'none' : 'auto',
                  transition: 'background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease',
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: 'var(--theme-border)' }}
                >
                  {String.fromCharCode(65 + oi)}
                </span>
                {typeof opt.text === 'string' ? opt.text : t(opt.text.en, opt.text.ro)}
              </button>

              {/* Per-option explanation (new format) */}
              {submitted && hasPerOptionExplanations && opt.explanation && (oi === selected || opt.correct) && (
                <div
                  className="mt-1.5 ml-9 p-2.5 rounded-lg text-xs leading-relaxed"
                  style={{
                    backgroundColor: opt.correct
                      ? 'color-mix(in srgb, #10b981 8%, var(--theme-card-bg))'
                      : 'color-mix(in srgb, #ef4444 8%, var(--theme-card-bg))',
                    border: `1px solid ${opt.correct
                      ? 'color-mix(in srgb, #10b981 20%, var(--theme-border))'
                      : 'color-mix(in srgb, #ef4444 20%, var(--theme-border))'}`,
                    color: opt.correct ? '#10b981' : '#ef4444',
                    animation: 'fadeIn 0.3s ease',
                  }}
                >
                  <span className="font-semibold">
                    {opt.correct
                      ? t('Why this is correct: ', 'De ce e corect: ')
                      : t('Why this is wrong: ', 'De ce e gresit: ')}
                  </span>
                  {typeof opt.explanation === 'string' ? opt.explanation : t(opt.explanation.en, opt.explanation.ro)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Check button */}
      <div
        style={{
          maxHeight: submitted ? '0px' : '40px',
          opacity: submitted ? 0 : 1,
          overflow: 'hidden',
          transition: 'max-height 0.25s ease, opacity 0.15s ease',
        }}
      >
        <button
          onClick={handleCheck}
          disabled={selected === null}
          className="mt-2 px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity"
          style={{
            backgroundColor: '#a855f7',
            opacity: selected === null ? 0.4 : 1,
            cursor: selected === null ? 'not-allowed' : 'pointer',
          }}
        >
          {t('Check Answer', 'Verifica')}
        </button>
      </div>

      {/* Legacy single explanation (old format — backwards compatible) */}
      {q.explanation && !hasPerOptionExplanations && (
        <div
          style={{
            maxHeight: submitted ? `${explanationHeight + 16}px` : '0px',
            opacity: submitted ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.35s ease 0.1s, opacity 0.25s ease 0.15s',
          }}
        >
          <div ref={explanationRef}>
            <div
              className="mt-2 p-3 rounded-lg text-xs leading-relaxed"
              style={{
                backgroundColor: 'color-mix(in srgb, #10b981 8%, var(--theme-card-bg))',
                border: '1px solid color-mix(in srgb, #10b981 20%, var(--theme-border))',
                color: '#10b981',
              }}
            >
              {t(q.explanation.en, q.explanation.ro)}
            </div>
          </div>
        </div>
      )}

      {/* Review step link */}
      {submitted && q.reviewStep && (
        <div className="mt-2 text-xs" style={{ animation: 'fadeIn 0.3s ease 0.2s both' }}>
          <a
            href={`#${q.reviewStep}`}
            className="underline"
            style={{ color: '#3b82f6' }}
          >
            {t('Review this topic', 'Revizuieste acest subiect')} →
          </a>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify backwards compatibility**

Run: `npm run dev`

Open a course page with existing quiz blocks. They use the old `q.explanation` format (single explanation string). Verify:
- Old quizzes still work — single green explanation box appears after submit
- No console errors

- [ ] **Step 3: Test new format manually**

Add a test quiz block to any JSON course step with per-option explanations:

```json
{
  "type": "quiz",
  "questions": [{
    "question": { "en": "What is the time complexity of binary search?", "ro": "Care e complexitatea cautarii binare?" },
    "options": [
      { "text": { "en": "O(n)", "ro": "O(n)" }, "correct": false, "explanation": { "en": "O(n) is linear search, not binary search.", "ro": "O(n) e cautare liniara, nu binara." } },
      { "text": { "en": "O(log n)", "ro": "O(log n)" }, "correct": true, "explanation": { "en": "Each comparison halves the search space.", "ro": "Fiecare comparatie injumatateste spatiul de cautare." } },
      { "text": { "en": "O(n log n)", "ro": "O(n log n)" }, "correct": false, "explanation": { "en": "This is the complexity of efficient sorting, not searching.", "ro": "Aceasta e complexitatea sortarii eficiente, nu a cautarii." } },
      { "text": { "en": "O(1)", "ro": "O(1)" }, "correct": false, "explanation": { "en": "O(1) means constant time — only hash table lookup achieves this.", "ro": "O(1) inseamna timp constant — doar cautarea in tabela hash realizeaza asta." } }
    ],
    "reviewStep": "pa-c1-binary-search"
  }]
}
```

Verify:
- Select wrong answer → red "Why this is wrong" + green "Why this is correct" both appear
- Select correct answer → only green "Why this is correct" appears
- "Review this topic →" link appears after submission
- Smooth fade-in animation on explanations

Remove test block after verifying.

- [ ] **Step 4: Commit**

```bash
git add src/components/blocks/assessment/QuizBlock.jsx
git commit -m "feat: add per-distractor quiz feedback with review links"
```

---

### Task 12: Add resume-where-left-off

**Files:**
- Modify: `src/components/blocks/CourseRenderer.jsx:46-49`
- Modify: `src/components/ui/CourseMap.jsx`

- [ ] **Step 1: Save lastStep in CourseRenderer**

In `src/components/blocks/CourseRenderer.jsx`, add a `useEffect` after the existing `goToStep` callback (after line 49). This saves the current step to localStorage:

```jsx
// Add after the goToStep useCallback (line 49):

// Save last step for resume
useEffect(() => {
  if (!step?.id || !src) return;
  const key = `lastStep:${src}`;
  localStorage.setItem(key, JSON.stringify({ stepId: step.id, stepIndex: currentStep, timestamp: Date.now() }));
}, [step?.id, currentStep, src]);
```

- [ ] **Step 2: Add resume banner to CourseMap**

Replace the full contents of `src/components/ui/CourseMap.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from './ProgressRing';
import useStaggeredEntrance from '../../hooks/useStaggeredEntrance';

const CourseMap = ({ subject, onCourseClick }) => {
  const { lang, t, checked, progress } = useApp();
  const getStaggerStyle = useStaggeredEntrance(subject.slug);

  const courses = subject.courses || [];
  if (courses.length === 0) return null;

  const courseProgress = courses.map(course => {
    const total = course.sectionCount || 0;
    let completed;
    if (course.src) {
      const prefix = (course.metaId || course.id) + '-';
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

  const totalSections = courseProgress.reduce((sum, cp) => sum + cp.total, 0);
  const totalCompleted = courseProgress.reduce((sum, cp) => sum + cp.completed, 0);
  const overallPercent = totalSections > 0 ? Math.round((totalCompleted / totalSections) * 100) : 0;

  // Find the best course to resume
  const resumeCourse = (() => {
    // Look for courses with a saved lastStep
    for (const { course, completed, total } of courseProgress) {
      if (!course.src) continue;
      const key = `lastStep:${course.src}`;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const isComplete = total > 0 && completed >= total;
      if (isComplete) continue;
      try {
        const data = JSON.parse(raw);
        return { course, ...data };
      } catch { continue; }
    }
    // Fallback: find first incomplete course with progress
    for (const { course, completed, total } of courseProgress) {
      const isComplete = total > 0 && completed >= total;
      if (completed > 0 && !isComplete) return { course, stepIndex: 0 };
    }
    return null;
  })();

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <div className="flex justify-between mb-1.5">
            <span className="font-bold text-sm" style={{ color: 'var(--theme-content-text)' }}>
              {subject.title[lang]}
            </span>
            <span className="text-xs font-semibold" style={{ color: '#3b82f6' }}>
              {overallPercent}% {t('complete', 'complet')}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
            />
          </div>
        </div>
      </div>

      {/* Resume banner */}
      {resumeCourse && (
        <button
          onClick={() => onCourseClick(resumeCourse.course.id)}
          className="w-full mb-4 p-3 rounded-xl text-left cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-px"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            border: 'none',
            animation: 'fadeIn 0.4s ease',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="white"><polygon points="3,0 14,7 3,14" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white/70">
                {t('Continue where you left off', 'Continua de unde ai ramas')}
              </div>
              <div className="text-sm font-bold text-white truncate">
                {resumeCourse.course.shortTitle[lang]}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {courseProgress.map(({ course, completed, total }, index) => {
          const isComplete = total > 0 && completed >= total;
          const hasProgress = completed > 0;

          // Determine if this is the "next" course (first incomplete)
          const isNext = !isComplete && !hasProgress &&
            courseProgress.slice(0, index).every(cp => cp.total > 0 && cp.completed >= cp.total);

          let tileBg, tileBorder;
          if (isComplete) {
            tileBg = '#f0fdf4'; tileBorder = '#bbf7d0';
          } else if (hasProgress) {
            tileBg = '#eff6ff'; tileBorder = '#bfdbfe';
          } else if (isNext) {
            tileBg = 'var(--theme-card-bg)'; tileBorder = '#93c5fd';
          } else {
            tileBg = 'var(--theme-card-bg)'; tileBorder = 'var(--theme-border)';
          }

          return (
            <button
              key={course.id}
              onClick={() => onCourseClick(course.id)}
              className="text-center p-3 rounded-xl cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:shadow-md active:translate-y-px active:scale-[0.98] active:shadow-sm"
              style={{
                ...getStaggerStyle(index),
                backgroundColor: tileBg,
                border: `1.5px solid ${tileBorder}`,
                opacity: (!hasProgress && !isComplete && !isNext) ? 0.6 : getStaggerStyle(index).opacity,
              }}
            >
              <div className="flex justify-center mb-1.5">
                <ProgressRing size={40} completed={completed} total={total} />
              </div>
              <div
                className="font-bold text-xs"
                style={{ color: isComplete ? '#16a34a' : hasProgress ? '#2563eb' : 'var(--theme-muted-text)' }}
              >
                {course.shortTitle[lang].split(':')[0]}
              </div>
              <div className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--theme-muted-text)' }}>
                {course.shortTitle[lang].split(':').slice(1).join(':').trim() || course.shortTitle[lang]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CourseMap;
```

- [ ] **Step 3: Verify resume behavior**

Run: `npm run dev`

1. Navigate to a subject's course map
2. Open a course, navigate to step 3+, go back to course map
3. A blue "Continue where you left off" banner should appear above the grid
4. Click it — should navigate to that course
5. Complete all steps of a course — that course should NOT show as resume candidate
6. The "next" untouched course should have a subtle blue border

- [ ] **Step 4: Commit**

```bash
git add src/components/blocks/CourseRenderer.jsx src/components/ui/CourseMap.jsx
git commit -m "feat: add resume-where-left-off banner to course map"
```

---

### Task 13: Convert mobile sidebar to bottom sheet

**Files:**
- Create: `src/components/layout/BottomSheet.jsx`
- Modify: `src/components/layout/Sidebar.jsx`

- [ ] **Step 1: Create BottomSheet component**

Create `src/components/layout/BottomSheet.jsx`:

```jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';

const SNAP_COLLAPSED = 56;   // px — pill chips row height
const SNAP_EXPANDED = 0.65;  // fraction of viewport height

export default function BottomSheet({ open, onClose, children }) {
  const sheetRef = useRef(null);
  const dragRef = useRef({ startY: 0, startH: 0, dragging: false });
  const [sheetHeight, setSheetHeight] = useState(SNAP_COLLAPSED);
  const [dragging, setDragging] = useState(false);
  const isExpanded = sheetHeight > SNAP_COLLAPSED + 20;

  // Reset height when opened
  useEffect(() => {
    if (open) setSheetHeight(SNAP_COLLAPSED);
  }, [open]);

  const onDragStart = useCallback((clientY) => {
    dragRef.current = { startY: clientY, startH: sheetHeight, dragging: true };
    setDragging(true);
  }, [sheetHeight]);

  const onDragMove = useCallback((clientY) => {
    if (!dragRef.current.dragging) return;
    const delta = dragRef.current.startY - clientY;
    const maxH = window.innerHeight * SNAP_EXPANDED;
    const newH = Math.max(SNAP_COLLAPSED, Math.min(maxH, dragRef.current.startH + delta));
    setSheetHeight(newH);
  }, []);

  const onDragEnd = useCallback(() => {
    dragRef.current.dragging = false;
    setDragging(false);
    const maxH = window.innerHeight * SNAP_EXPANDED;
    const mid = (SNAP_COLLAPSED + maxH) / 2;
    setSheetHeight(sheetHeight > mid ? maxH : SNAP_COLLAPSED);
  }, [sheetHeight]);

  // Touch handlers
  const onTouchStart = (e) => onDragStart(e.touches[0].clientY);
  const onTouchMove = (e) => onDragMove(e.touches[0].clientY);
  const onTouchEnd = () => onDragEnd();

  if (!open) return null;

  return (
    <>
      {/* Backdrop (only when expanded) */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)', transition: 'opacity 0.2s' }}
          onClick={onClose}
        />
      )}

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden rounded-t-2xl"
        style={{
          height: `${sheetHeight}px`,
          backgroundColor: 'var(--theme-sidebar-bg)',
          borderTop: '1px solid var(--theme-sidebar-border)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          transition: dragging ? 'none' : 'height 0.25s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-2 cursor-grab active:cursor-grabbing"
          onClick={() => setSheetHeight(isExpanded ? SNAP_COLLAPSED : window.innerHeight * SNAP_EXPANDED)}
        >
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--theme-border)' }} />
        </div>

        {/* Content */}
        <div
          className="px-3 overflow-y-auto"
          style={{
            height: `${sheetHeight - 28}px`,
            scrollbarWidth: 'none',
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Integrate BottomSheet into Sidebar**

In `src/components/layout/Sidebar.jsx`, add the import at the top:

```jsx
import BottomSheet from './BottomSheet';
```

Then replace the mobile sidebar section (lines 227-249). Find:

```jsx
{/* Mobile sidebar */}
<aside
  className={`
    fixed top-0 left-0 z-50 lg:hidden
    w-60 h-full overflow-y-auto
    p-3 pt-16 text-sm
    transition-transform duration-200
    ${open ? 'translate-x-0' : '-translate-x-full'}
  `}
  style={{
    backgroundColor: 'var(--theme-sidebar-bg)',
    borderRight: '1px solid var(--theme-sidebar-border)',
  }}
>
  <div className="flex justify-end mb-2">
    <button onClick={onClose} className="p-1 rounded transition" style={{ backgroundColor: 'var(--theme-hover-bg)' }}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
  <nav className="flex flex-col gap-1">{courseList}</nav>
</aside>
```

Replace with:

```jsx
{/* Mobile bottom sheet */}
<BottomSheet open={open} onClose={onClose}>
  <nav className="flex flex-col gap-1 text-sm">{courseList}</nav>
</BottomSheet>
```

Also remove the mobile backdrop div (lines 163-165):

```jsx
{/* Remove this — BottomSheet handles its own backdrop */}
{/* {open && (
  <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
)} */}
```

- [ ] **Step 3: Verify mobile sidebar**

Run: `npm run dev`

Open browser DevTools → toggle mobile view (375px width). Navigate to a course page:
1. Bottom sheet should appear as a collapsed bar at the bottom
2. Swipe up (or click the handle) → expands to show full course list
3. Swipe down → collapses back
4. Tapping a course navigates and collapses the sheet
5. Desktop: sidebar should work exactly as before (no change)

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/BottomSheet.jsx src/components/layout/Sidebar.jsx
git commit -m "feat: convert mobile sidebar to bottom sheet drawer"
```

---

## Final Verification

### Task 14: Full build + push

- [ ] **Step 1: Production build**

```bash
npm run build
```

Expected: Build succeeds with no errors or warnings.

- [ ] **Step 2: Visual regression check**

Run: `npm run dev`

Quick check across all workstreams:
- Labels: 12px, readable (WS1)
- Quiz options: more padding (WS1)
- Dark mode callouts: visible tints (WS1)
- Theme switch: smooth body transition (WS1)
- Animation blocks: test with sample JSON if available (WS2)
- Quiz feedback: per-option explanations show (WS3)
- Resume banner: appears on course map (WS3)
- Mobile sidebar: bottom sheet works (WS3)

- [ ] **Step 3: Commit and push**

```bash
git add -A
git commit -m "chore: final verification pass for UX redesign"
git push
```
