# Evidence-Based Pedagogy + Component Gaps — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the 3 minor component gaps and 1 major gap identified by the evidence-based learning audit, then commit + push all changes including the curate skill pedagogy rewrite (already done, local only in `~/.claude/skills/curate/skill.md`).

**Context:** The curate pipeline skill has already been rewritten with 10 research-backed pedagogical rules (Dunlosky 2013, Roediger & Karpicke 2006, Kapur 2014, Mayer 2009, Sweller, Margulieux & Guzdial, Hundhausen 2002, etc.). The pipeline now instructs Claude to use:
- Pretest → concrete examples → abstraction → elaboration → retrieval (5-phase rhythm)
- Misconception-targeted distractors with per-option feedback
- Spaced retrieval (30% of quiz questions reference prior steps)
- Subgoal-labeled code blocks
- Prediction prompts in animation labels
- 3-4 options per quiz (not 5), targeting 60-80% success rate

However, 4 component gaps were identified that limit how well these techniques work in the UI. This plan fixes them.

**Branch:** `content-redesign` (current)

**Tech Stack:** React 19, Tailwind CSS v4 (CSS vars), existing block component system

---

## Completed Prior to This Plan

| Item | Status | Commit |
|------|--------|--------|
| Plan 6 — all 8 tasks (pipeline JSON) | DONE | Various commits |
| UX redesign — all 3 workstreams | DONE | `6623de0` and prior |
| Gemini key rotation (3 keys) | DONE | `5e078b3` |
| Legacy cleanup (5 files removed) | DONE | `a3459c4` |
| Curate skill pedagogy rewrite | DONE (local) | Not yet committed (skill files outside repo) |

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/components/blocks/assessment/QuizBlock.jsx` | **Fix** | reviewStep navigation — use goToStep instead of anchor href |
| `src/components/blocks/CourseRenderer.jsx` | **Modify** | Pass goToStep callback down through context or props |
| `src/components/blocks/StepRenderer.jsx` | **Modify** | Forward goToStep to QuizBlock |
| `src/components/blocks/media/CodeBlock.jsx` | **Enhance** | Add comment highlighting for subgoal labels |
| `src/components/blocks/interactive/StepPlayer.jsx` | **Enhance** | Add prediction prompt gate before step advance |
| `src/components/blocks/interactive/ArrayRenderer.jsx` | **Modify** | Support prediction field in step data |
| `src/components/blocks/interactive/GraphRenderer.jsx` | **Modify** | Support prediction field in step data |
| `src/components/blocks/interactive/TableRenderer.jsx` | **Modify** | Support prediction field in step data |

---

### Task 1: Fix reviewStep Navigation in QuizBlock

**Problem:** QuizBlock renders `reviewStep` as `<a href="#stepId">` but CourseRenderer uses state-based navigation (`goToStep(index)`), so the link does nothing useful.

**Solution:** Pass a `goToStep` callback through the rendering chain. QuizBlock converts `reviewStep` ID to a step index and calls it.

**Files:**
- Modify: `src/components/blocks/CourseRenderer.jsx`
- Modify: `src/components/blocks/StepRenderer.jsx`
- Modify: `src/components/blocks/assessment/QuizBlock.jsx`

- [ ] **Step 1: Read current component chain**

Read these files to understand the prop flow:
- `src/components/blocks/CourseRenderer.jsx` — owns `goToStep`, `currentStep`, `steps`
- `src/components/blocks/StepRenderer.jsx` — renders blocks for one step
- `src/components/blocks/BlockRenderer.jsx` — dispatches to typed block components
- `src/components/blocks/assessment/QuizBlock.jsx` — renders reviewStep link

- [ ] **Step 2: Pass navigation context from CourseRenderer**

In `CourseRenderer.jsx`, the `goToStep` function and `steps` array already exist. Create a context or pass props:

Option A (context — cleaner): Create a small `CourseContext` that provides `{ goToStep, steps, currentStep }`. Wrap the step rendering in this provider.

Option B (props — simpler): Pass `goToStep` and `steps` as props through StepRenderer → BlockRenderer → QuizBlock.

Choose whichever approach matches the existing pattern in the codebase. Check if there's already a context being used.

- [ ] **Step 3: Update QuizBlock to use goToStep**

In `QuizBlock.jsx`, replace the anchor link (line ~186):

**Before:**
```jsx
<a href={`#${q.reviewStep}`} ...>
```

**After:**
```jsx
<button onClick={() => {
  const stepIndex = steps.findIndex(s => s.id === q.reviewStep);
  if (stepIndex !== -1) goToStep(stepIndex);
}} ...>
```

Style the button to look like a link (underline, blue text, cursor pointer).

- [ ] **Step 4: Test**

Run `npm run build` to verify no errors. Visually verify in the browser if possible — click a reviewStep link in a quiz and confirm it navigates to the correct step.

- [ ] **Step 5: Commit**

```bash
git add src/components/blocks/assessment/QuizBlock.jsx src/components/blocks/CourseRenderer.jsx src/components/blocks/StepRenderer.jsx src/components/blocks/BlockRenderer.jsx
git commit -m "fix: reviewStep links navigate to correct step via goToStep"
```

---

### Task 2: Add Comment Highlighting to CodeBlock

**Problem:** CodeBlock renders all text in a single green color (`#10b981`). Code comments used as subgoal labels (e.g., `// Step 1: Initialize`) don't stand out visually, reducing the effectiveness of subgoal labeling (Margulieux & Guzdial 2015).

**Solution:** Add simple comment detection and highlight comment lines with a distinct style (dimmer/italic) so they visually separate from code.

**Files:**
- Modify: `src/components/blocks/media/CodeBlock.jsx`

- [ ] **Step 1: Read current CodeBlock**

File: `src/components/blocks/media/CodeBlock.jsx` (30 lines, very simple)

Currently renders `<code>{content}</code>` as plain text.

- [ ] **Step 2: Add comment line highlighting**

Replace the plain `<code>{content}</code>` with a line-by-line renderer that detects comments:

```jsx
<code>
  {content.split('\n').map((line, i) => {
    const trimmed = line.trimStart();
    const isComment = trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*');
    return (
      <React.Fragment key={i}>
        {i > 0 && '\n'}
        <span style={isComment ? {
          color: '#6ee7b7',
          fontStyle: 'italic',
          fontWeight: trimmed.match(/^\/\/\s*(Step|Phase|Initialize|Process|Check|Return|Finalize)/i) ? 600 : 400,
        } : undefined}>
          {line}
        </span>
      </React.Fragment>
    );
  })}
</code>
```

This gives:
- Regular code: `#10b981` (existing green)
- Comments: `#6ee7b7` (lighter green, italic)
- Subgoal labels (comments starting with Step/Phase/Initialize/Process/etc.): **bold** italic — visually distinct headers within code

Keep it simple — no full syntax highlighter, just comment detection.

- [ ] **Step 3: Test**

Run `npm run build`. Check a course page with code blocks to verify comments render differently.

- [ ] **Step 4: Commit**

```bash
git add src/components/blocks/media/CodeBlock.jsx
git commit -m "feat: highlight code comments and subgoal labels in CodeBlock"
```

---

### Task 3: Add Prediction Prompts to Animation StepPlayer

**Problem:** StepPlayer advances immediately on click — no way to ask "What happens next?" before revealing the result. Research (Hundhausen 2002) shows active prediction dramatically improves learning from visualizations.

**Solution:** Add an optional `prediction` field to animation step data. When present, StepPlayer shows the prediction text in a prompt overlay and requires a tap/click to reveal the actual result.

**Files:**
- Modify: `src/components/blocks/interactive/StepPlayer.jsx`

- [ ] **Step 1: Read StepPlayer**

Read `src/components/blocks/interactive/StepPlayer.jsx` to understand the current step advance logic.

- [ ] **Step 2: Add prediction gate**

Add state: `const [predictionShown, setPredictionShown] = useState(false);`

When the current step has a `prediction` field and the user hasn't seen it yet:
- Show a small overlay/banner above the step content: the prediction question text
- The "Next" button text changes to "Reveal" or "Show Answer"
- On click: set `predictionShown = true`, reveal the actual step content
- On next click: advance to the next step, reset `predictionShown = false`

This means each animation step with a prediction takes 2 clicks: one to think, one to see.

The prediction field comes from the animation JSON data:
```json
{
  "array": [5, 3, 8, 1],
  "highlights": { "comparing": [1, 2] },
  "label": { "en": "Comparing 3 and 8", "ro": "Comparăm 3 și 8" },
  "prediction": { "en": "Will these be swapped?", "ro": "Se vor interschimba?" }
}
```

Style the prediction banner:
- Amber/yellow background tint (matches "thinking" color)
- Question mark icon
- Text: the prediction question
- Subtle: doesn't obscure the array/graph, just appears above it

- [ ] **Step 3: Update renderers to pass prediction data through**

Read `ArrayRenderer.jsx`, `GraphRenderer.jsx`, `TableRenderer.jsx` — ensure they pass the full step object (including `prediction`) to StepPlayer, or that StepPlayer reads it directly from the data.

- [ ] **Step 4: Test**

Run `npm run build`. If there's existing animation data in any course, test in browser. The prediction gate should only appear when the `prediction` field exists — existing animations without it work exactly as before.

- [ ] **Step 5: Commit**

```bash
git add src/components/blocks/interactive/StepPlayer.jsx src/components/blocks/interactive/ArrayRenderer.jsx src/components/blocks/interactive/GraphRenderer.jsx src/components/blocks/interactive/TableRenderer.jsx
git commit -m "feat: add prediction prompt gate to animation StepPlayer"
```

---

### Task 4: Build Verification + Final Commit + Push

**Files:**
- Read-only verification of all modified files

- [ ] **Step 1: Full build check**

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide" && npm run build
```

Must pass cleanly.

- [ ] **Step 2: Verify git status is clean**

```bash
git status
```

All changes should be committed. Only untracked files should be PDFs, backups, and `.claude/`.

- [ ] **Step 3: Push**

```bash
git push origin content-redesign
```

- [ ] **Step 4: Update memory files**

Update these memory files to reflect completion:
- `~/.claude/projects/.../memory/project_content_redesign.md` — Phase 5 (pedagogy) DONE
- `~/.claude/projects/.../memory/project_next_pa_curate.md` — Update TODO order

---

## Summary

| Task | Files | Effort | Technique Unlocked |
|------|-------|--------|--------------------|
| 1. Fix reviewStep nav | QuizBlock, CourseRenderer, StepRenderer | ~15 min | Spaced retrieval links actually work |
| 2. Code comment highlighting | CodeBlock | ~10 min | Subgoal labels visible in code |
| 3. Prediction gate in animations | StepPlayer + 3 renderers | ~45 min | Active prediction in visualizations |
| 4. Build + push | — | ~5 min | — |

**Total: ~75 minutes of component work.** After this, all 10 evidence-based techniques are fully supported by the UI, and the curate pipeline will generate content that leverages them.
