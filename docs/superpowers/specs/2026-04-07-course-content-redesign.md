# Course Content System Redesign — Design Spec

**Date:** 2026-04-07
**Status:** Approved
**Scope:** Content data model, rendering system, progress tracking, lecture overlay, test system, chat panel integration, pipeline updates

## Overview

Complete redesign of how course content is stored, rendered, and interacted with. Replaces JSX-per-course components with a data-driven JSON block system rendered by a universal `CourseRenderer`. Introduces a step-based learning flow (Option C: Tutorial + Lecture Toggle Overlay), two-dimensional progress tracking (visited/understood), a full test system with AI grading, and pipeline updates to generate richer content autonomously.

### Goals

- **Digestibility** — Step-based learning flow with learn → visual → think → quiz rhythm
- **Extensibility** — Adding a new block type = one component + one registry line
- **Pipeline-first** — Curate pipeline generates complete courses in one pass, with a manifest for easy post-generation fixes
- **Rich media** — Natively support diagrams, animations, interactive widgets, embedded videos as first-class block types
- **Lecture context** — Toggle overlay shows slide refs, professor notes, exam emphasis, video links without disrupting the tutorial flow
- **Full test mode** — Curated real exams + AI-generated practice with open-ended AI grading against course content
- **Preserve existing features** — Chat panel, 5 color palettes, dark/light mode, bilingual system

### Non-Goals

- Redesigning the home page, subject picker, or navigation layout
- Changing the deployment pipeline (GitHub Actions)
- Replacing the theme/palette system

---

## 1. Data Model & File Structure

### 1.1 Standardized Folder Structure

```
src/content/<slug>/
├── index.js                    # Subject metadata + course registry (JSON paths, no lazy component imports)
├── courses/
│   ├── course-01.json          # Data-driven course content
│   ├── course-02.json
│   └── ...
├── seminars/
│   ├── seminar-01.json         # Same block format as courses
│   └── ...
├── labs/
│   ├── lab-01.json
│   └── ...
├── tests/
│   ├── test-01.json            # Curated test content (real exam questions)
│   └── ...
├── practice/
│   └── Practice.jsx            # Keep as JSX — interactive custom pages
├── source/                     # Raw input materials (not rendered, not bundled)
│   ├── courses/                # Lecture PDFs
│   ├── seminars/               # Seminar PDFs
│   ├── labs/                   # Lab PDFs/HTML
│   ├── tests/                  # Exam PDFs
│   └── refs/                   # Student reference files, bibliography
└── .curate/                    # Pipeline intermediate files (gitignored)
    └── course-01/
        ├── status.json
        ├── stage1-extraction.json
        ├── manifest.json       # Block inventory with complexity ratings
        └── ...
```

All subjects follow this layout. Existing files are migrated:
- `os/diagrams/` → diagrams become inline block data or separate SVG assets referenced by blocks
- `os/labs/lab1_raw.html`, `os/seminars/sem2_part1.html` → move to `source/labs/`, `source/seminars/`
- `pa/.curate/` → stays as-is (already gitignored convention)
- `pa/refs/` → moves to `source/refs/`
- PDFs in `os/labs/`, `pa/seminars/`, `pa/tests/` → move to respective `source/` subdirs

### 1.2 Standardized ID Convention

All IDs follow: `<slug>-c<N>-<descriptive>`

- `os-c1-intro`, `os-c1-cmds`, `os-c1-quiz`
- `pa-c1-def`, `pa-c1-output`, `pa-c1-solvability`
- `oop-c3-constructors`, `oop-c5-virtual`

Consistent across all subjects. No more `course_1` vs `pa-c1` vs `oop-course_1`.

### 1.3 Course JSON Schema

```json
{
  "meta": {
    "id": "os-c1",
    "title": { "en": "Course 1: Basic Linux Commands", "ro": "Cursul 1: Comenzi Linux" },
    "shortTitle": { "en": "C1: Commands", "ro": "C1: Comenzi" },
    "source": { "en": "Prof. X — Lecture 1 slides", "ro": "Prof. X — Curs 1" }
  },
  "steps": [
    {
      "id": "os-c1-intro",
      "title": { "en": "What is Linux?", "ro": "Ce este Linux?" },
      "group": "fundamentals",
      "blocks": [
        { "type": "learn", "content": { "en": "...", "ro": "..." } },
        { "type": "definition", "term": { "en": "Kernel", "ro": "Kernel" }, "content": { "en": "...", "ro": "..." } },
        { "type": "diagram", "variant": "tree", "data": { "nodes": [...], "edges": [...] } },
        { "type": "think", "question": { "en": "...", "ro": "..." }, "answer": { "en": "...", "ro": "..." } },
        { "type": "lecture", "slides": "1-4", "note": { "en": "...", "ro": "..." } },
        { "type": "lecture-video", "url": "https://youtube.com/...", "title": "...", "duration": "8:42", "relevance": "..." },
        { "type": "lecture-exam", "note": { "en": "...", "ro": "..." }, "frequency": 0.8, "years": ["2024", "2023", "2022"] }
      ]
    }
  ]
}
```

- **Steps** = navigable pages (user clicks "Continue" through them)
- **Blocks** = content within a step, rendered top-to-bottom
- **`type`** = determines which React component renders the block
- **Lecture blocks** (`lecture`, `lecture-video`, `lecture-exam`) filtered by toggle
- **`frequency`** on exam blocks = how often topic appeared across available tests (0.0–1.0)
- The `type` field is open-ended — new types added by registering a component
- **`group`** on steps is an optional label for visual grouping in the progress strip and sidebar (e.g., "fundamentals", "scheduling", "assessment"). Steps with the same group are visually clustered. If omitted, steps are ungrouped. Groups are cosmetic — they don't affect navigation or progress tracking.

### 1.4 Subject index.js (New Format)

```js
const os = {
  slug: 'os',
  yearSemester: 'y1s2',
  title: { en: 'Operating Systems', ro: 'Sisteme de Operare' },
  shortTitle: { en: 'OS', ro: 'SO' },
  description: { en: '...', ro: '...' },
  icon: '🖥️',
  courses: [
    { id: 'os-c1', src: 'os/courses/course-01.json' },
    { id: 'os-c2', src: 'os/courses/course-02.json' },
    // ...
  ],
  seminars: [
    { id: 'os-s1', src: 'os/seminars/seminar-01.json' },
    // ...
  ],
  labs: [
    { id: 'os-l1', src: 'os/labs/lab-01.json' },
    // ...
  ],
  tests: [
    { id: 'os-test-lab1-7', src: 'os/tests/test-lab1-7.json' },
    // ...
  ],
  practice: lazy(() => import('./practice/Practice.jsx')),
};
```

Title, shortTitle, sectionCount are read from the JSON `meta` at load time — no duplication in index.js.

---

## 2. Block Rendering System

### 2.1 Component Architecture

```
src/components/blocks/
├── registry.js               # { type → lazy(Component) } map
├── BlockRenderer.jsx          # Looks up type, renders component, passes props
├── StepRenderer.jsx           # Renders all blocks for a step + "I understand" button
├── CourseRenderer.jsx          # Loads JSON, manages step/progress/lecture state
├── UnknownBlock.jsx            # Fallback for unregistered types (visible, not crash)
│
├── learn/
│   └── LearnBlock.jsx
├── definition/
│   └── DefinitionBlock.jsx
├── diagram/
│   ├── DiagramBlock.jsx        # Router — picks sub-component by `variant`
│   ├── StateMachineDiagram.jsx
│   ├── TreeDiagram.jsx
│   ├── FlowchartDiagram.jsx
│   └── MemoryLayoutDiagram.jsx
├── interactive/
│   ├── AnimationBlock.jsx      # Step-through algorithm animations
│   ├── CodeChallengeBlock.jsx  # Wraps existing CodeChallenge
│   ├── TerminalBlock.jsx       # Wraps existing LinuxTerminal/V86Terminal
│   └── MultiFileEditorBlock.jsx
├── assessment/
│   ├── ThinkBlock.jsx          # "Think about it" with reveal
│   ├── QuizBlock.jsx           # Multiple choice (wraps existing MultipleChoice)
│   └── CodeQuizBlock.jsx       # Write code + check output
├── lecture/
│   ├── LectureNoteBlock.jsx    # Slide reference + professor note
│   ├── LectureVideoBlock.jsx   # YouTube embed/link with metadata
│   └── LectureExamBlock.jsx    # Exam emphasis + frequency badge
├── media/
│   ├── ImageBlock.jsx
│   ├── VideoBlock.jsx
│   └── CodeBlock.jsx           # Syntax-highlighted code snippet
└── layout/
    ├── CalloutBlock.jsx        # Warning, tip, trap (replaces Box)
    ├── TableBlock.jsx
    └── ListBlock.jsx
```

### 2.2 BlockRenderer

```jsx
function BlockRenderer({ block, lectureVisible }) {
  if (block.type.startsWith('lecture') && !lectureVisible) return null;
  const Component = registry[block.type];
  if (!Component) return <UnknownBlock type={block.type} />;
  return <Component {...block} />;
}
```

- Lecture blocks skipped when toggle is off (zero render cost)
- Unknown types render a visible placeholder, not a crash
- Each block component receives the full block object as props

### 2.3 Adding a New Block Type

1. Create `src/components/blocks/<category>/NewBlock.jsx`
2. Add to `registry.js`: `'new-type': lazy(() => import('./<category>/NewBlock.jsx'))`
3. Pipeline can now emit `{ "type": "new-type", ... }` — it renders automatically

No changes to CourseRenderer, StepRenderer, or any existing course files.

### 2.4 Existing Component Reuse

| Current Component | New Block Wrapper | Notes |
|---|---|---|
| `Section.jsx` | Removed | Steps replace sections; progress tracks steps |
| `Toggle.jsx` | `ThinkBlock.jsx` | Same reveal UX, data-driven |
| `Box.jsx` | `CalloutBlock.jsx` | Types map: definition→definition, warning→callout |
| `MultipleChoice.jsx` | `QuizBlock.jsx` | Same component, fed from JSON |
| `Code.jsx` | `CodeBlock.jsx` | Thin wrapper |
| `CodeChallenge.jsx` | `CodeChallengeBlock.jsx` | Props from JSON |
| `LinuxTerminal.jsx` | `TerminalBlock.jsx` | Props from JSON |
| `CodeEditor.jsx` | Used inside CodeChallengeBlock | No change |
| `V86Terminal.jsx` | Used inside TerminalBlock | No change |

### 2.5 CourseRenderer (Universal Course Shell)

Replaces per-course lazy JSX imports. All courses use the same renderer:

```jsx
// In SubjectPage or routing:
<CourseRenderer src="os/courses/course-01.json" />
```

Responsibilities:
- Loads course JSON via dynamic import
- Manages state: current step index, visited set, understood set, lecture toggle
- Renders: progress strip + toggle bar + StepRenderer + prev/next navigation
- Feeds progress data to InlineProgress and ProgressRing

### 2.6 StepRenderer

Renders a single step (one "page" in the course flow):
1. Maps `step.blocks` through `BlockRenderer`
2. Auto-marks step as "visited" on mount
3. Shows "I understand this" button at bottom
4. Smooth transition animation between steps (reuse `CourseTransition` logic)

---

## 3. Progress System

### 3.1 Two-Dimensional Tracking

| Flag | Set by | Meaning |
|---|---|---|
| **Visited** | Automatic on navigation | "I've seen this step" |
| **Understood** | Manual "I understand" click | "I've learned this" |

### 3.2 Storage Format

Same localStorage mechanism via `useLocalStorage`. New shape:

```json
{
  "os-c1-intro": { "visited": true, "understood": true },
  "os-c1-cmds": { "visited": true, "understood": false },
  "os-c1-quiz": { "visited": false, "understood": false }
}
```

AppContext changes: `toggleCheck(id)` → `markVisited(stepId)` + `toggleUnderstood(stepId)`.

### 3.3 UI Integration

- **ProgressRing** (sidebar): `understood / total` per course. Colors: green=all understood, blue=active, amber=at least 1 visited, grey=not started.
- **InlineProgress** (sticky bar): Two-tone segments — lighter shade=visited, full color=understood. Celebration on all understood.
- **CourseMap** (bird's-eye grid): Understood count per course tile.
- **Progress strip** (inside CourseRenderer): Grey=unvisited, blue=visited, green=understood.

### 3.4 Test Progress (Separate Track)

```json
{
  "os-test-lab1-7": { "score": 0.85, "completedAt": "2026-04-07", "answers": {} },
  "os-generated-c3": { "score": 0.7, "completedAt": "2026-04-07" }
}
```

Course learning progress and test performance are distinct concepts.

---

## 4. Lecture Context Layer

### 4.1 Toggle Behavior (Option C)

- Tutorial is the clean default — no lecture blocks visible
- Toggle in the step info bar reveals/hides all `lecture-*` blocks
- Purple visual treatment with "LECTURE" / "EXAM" badges
- Toggle state persisted in localStorage per user
- No scroll position disruption — blocks slide in/out smoothly

### 4.2 Data Sources

| Source | Contributes | Required? |
|---|---|---|
| Lecture PDF | Slide references, section mapping | Yes |
| Seminar PDFs | Cross-reference links ("Practiced in Seminar X, Ex Y") | No — added on `--redo` |
| Previous tests | Exam frequency badges, emphasis blocks | No — added on `--redo` |
| Student ref files | Additional context, alternative explanations | No — added on `--redo` |
| User notes param | Course-specific corrections | No — applied on `--redo` |

### 4.3 Exam Frequency Calculation

When test PDFs are available:
1. Extract topics/question-types from each test
2. Map to course steps by content similarity
3. Calculate weighted frequency with recency:
   - Current year: weight 1.0
   - 1 year old: 0.8
   - 2-3 years: 0.5
   - 4+ years: 0.3
4. Emit `lecture-exam` blocks with `frequency` and `years` fields

**Critical rule:** Frequency informs emphasis, not coverage. A step with `frequency: 0.0` stays in the course. A topic appearing in 90% of tests gets a prominent badge, but content not found in any test is still fully included.

**Exception for priority:** Recurring exercise types or topics present in most tests across multiple years are flagged as high-priority in the lecture overlay — but the course content itself is always comprehensive regardless of test coverage.

### 4.4 Progressive Enrichment

First run (lecture PDF only):
```json
{ "type": "lecture", "slides": "12-14", "note": { "en": "Key concept" } }
```

After `--redo` with seminars + tests added:
```json
{ "type": "lecture", "slides": "12-14", "note": { "en": "Key concept" } },
{ "type": "lecture-exam", "note": { "en": "Draw this diagram" }, "frequency": 0.75, "years": ["2024", "2023", "2022"] },
{ "type": "lecture", "crossRef": "os-s3-ex5", "note": { "en": "Practiced in Seminar 3, Exercise 5" } }
```

The course gets richer each `--redo` without changing existing content.

---

## 5. Test System

### 5.1 Two Modes

**Curated Tests** — Real exam questions from PDFs, structured by pipeline into JSON.

**Generated Tests** — AI creates questions from course JSON on demand ("Practice this course" or "Generate test for courses 1-5").

### 5.2 Test JSON Schema

```json
{
  "meta": {
    "id": "pa-test-2024-partial-a",
    "title": { "en": "2024 Partial — Variant A", "ro": "Partial 2024 — Var. A" },
    "year": 2024,
    "type": "partial",
    "duration": 90,
    "totalPoints": 100
  },
  "questions": [
    {
      "id": "q1",
      "type": "open-ended",
      "points": 15,
      "prompt": { "en": "Define a computational problem...", "ro": "..." },
      "rubric": { "en": "Must mention: input set, output set, relation...", "ro": "..." },
      "relatedSteps": ["pa-c1-def", "pa-c1-output"],
      "tags": ["definition", "computational-problems"]
    },
    {
      "id": "q2",
      "type": "code-writing",
      "points": 25,
      "prompt": { "en": "Write a bash script that...", "ro": "..." },
      "testCases": [{ "input": "...", "expected": "..." }],
      "rubric": { "en": "Correct output (15pts), error handling (5pts), style (5pts)" },
      "relatedSteps": ["os-c3-scripts", "os-c3-control"]
    },
    {
      "id": "q3",
      "type": "diagram",
      "points": 20,
      "prompt": { "en": "Draw the 5-state process diagram...", "ro": "..." },
      "rubric": { "en": "All 5 states (5pts), transitions (10pts), no invalid (5pts)" },
      "relatedSteps": ["os-c6-def"]
    },
    {
      "id": "q4",
      "type": "multiple-choice",
      "points": 10,
      "prompt": { "en": "Which system call...", "ro": "..." },
      "options": [...],
      "relatedSteps": ["os-c7-family"]
    }
  ]
}
```

### 5.3 Question Types

| Type | Input | Grading |
|---|---|---|
| `open-ended` | Textarea | AI API: answer + rubric + related course blocks |
| `multiple-choice` | Radio/checkbox | Deterministic |
| `code-writing` | CodeEditor | Judge0 execution + AI review |
| `diagram` | Textarea description (v1) | AI API: description + rubric + related blocks |
| `fill-in` | Inline text inputs | Deterministic or AI for partial credit |

### 5.4 AI Grading Flow

```
Student answer → Proxy API → AI receives:
  - Student's answer text
  - Question rubric (from test JSON)
  - Related course blocks (from course JSON, via relatedSteps)
  - The question prompt

AI returns:
  - score (number) / maxScore
  - feedback.correct: ["What was right"]
  - feedback.missing: ["What was expected but absent"]
  - feedback.incorrect: ["What was wrong, with correction"]
  - feedback.references: ["See step pa-c1-def, block 2"]
```

Grading is anchored to course content — if the professor defines something a specific way, that's the standard.

### 5.5 Test-Taking UI

Components under `src/components/blocks/test/`:

```
├── test/
│   ├── TestRenderer.jsx          # Full test-taking shell
│   ├── OpenEndedQuestion.jsx
│   ├── CodeWritingQuestion.jsx
│   ├── DiagramQuestion.jsx
│   ├── MultipleChoiceQuestion.jsx
│   ├── FillInQuestion.jsx
│   └── TestResults.jsx
```

Features:
- Question list sidebar with jump navigation
- Optional timer for timed exams
- Flag questions for review
- Submit individual or all at once
- Results: score breakdown, expandable feedback, links to relevant course steps

### 5.6 Test Organization

Tests tab (existing ContentTypeBar), sorted by:
1. Generated practice tests (at top, on-demand)
2. Curated tests by year descending
3. Each shows best score if previously attempted

---

## 6. Chat Panel

### 6.1 Changes

- **Context source:** Reads current step's blocks as structured JSON (better than DOM scraping)
- **Position awareness:** Knows current course, step, and block — "Explain this" maps to a specific block
- **Test mode guard:** During tests, helps you reason but won't directly answer the question
- **Step context badge:** Shows "Discussing: Course 3, Step 2 — Process States"
- **Course-grounded responses:** Cites specific steps with clickable links

### 6.2 No Changes

- Toggle open/close from nav bar
- Conversation history per session
- Markdown rendering
- "Check with AI" button on quiz blocks
- All theme/palette styling

---

## 7. Theme & Visual Customization

### 7.1 Preserved As-Is

- 5 palettes: Slate, Warm Stone, Ocean Blue, Zinc, Forest Green
- Dark/light mode via `@custom-variant`
- `applyPalette(paletteId, isDark)` sets CSS custom properties
- PalettePicker component unchanged
- localStorage persistence of palette preference

### 7.2 Block Component Requirements

All new block components must:
1. Use `var(--theme-*)` for all colors — no hardcoded Tailwind `dark:` classes
2. Support both light and dark mode
3. Respect current palette's nav, content, sidebar, border, and text colors
4. Accent blue `#3b82f6` remains hardcoded across palettes

### 7.3 Block Type Semantic Colors

Fixed across all palettes (content-type recognition):

| Block Type | Color | Hex |
|---|---|---|
| Learn | Blue | `#3b82f6` |
| Definition | Light blue | `#60a5fa` |
| Visual/Diagram | Green | `#10b981` |
| Think | Amber | `#f59e0b` |
| Quiz | Purple | `#a855f7` |
| Lecture | Indigo | `#818cf8` |
| Exam emphasis | Amber | `#f59e0b` |
| Code | Green | `#10b981` |

---

## 8. Pipeline Updates

### 8.1 Inputs (Graceful Degradation)

| Input | Required | Effect |
|---|---|---|
| Lecture PDF | Yes | Core content extraction |
| Seminar PDFs | No | Adds cross-references to lecture overlay |
| Previous test PDFs | No | Adds exam frequency, emphasis blocks |
| Student ref files | No | Additional context for enrichment |
| User notes (`--redo` param) | No | Course-specific corrections applied during regeneration |
| YouTube search | Automatic | Pipeline searches for relevant videos when it deems them helpful |

Pipeline generates a complete course from the lecture PDF alone. Additional sources enrich via `--redo`.

### 8.2 Output

- `courses/course-NN.json` — Complete course data
- `.curate/<course>/manifest.json` — Block inventory: each block's type, complexity rating (simple/medium/complex), generation confidence, and the key props that control its behavior. Purpose: makes post-generation edits surgical.
- `.curate/<course>/status.json` — Pipeline state (existing, enhanced with new stages)

### 8.3 Pipeline Decision-Making

The pipeline autonomously decides:
- Block types per content section (learn, definition, diagram, animation, etc.)
- Where to insert "think about it" pauses
- Where visuals/animations would aid understanding
- Which YouTube videos to embed (searches and evaluates relevance)
- Quiz question placement and difficulty
- Lecture overlay content (slide refs, exam emphasis)

Complex generated blocks (animations, interactive diagrams) are logged in the manifest with their key configuration props so that fixing a broken animation = editing a few JSON fields, not rewriting a component.

### 8.4 Test Curation

For test PDFs, the pipeline:
1. Extracts all questions with metadata (year, variant, points)
2. Classifies question type (open-ended, multiple-choice, code-writing, diagram)
3. Generates rubrics from course content
4. Maps `relatedSteps` by content similarity
5. Outputs structured test JSON

---

## 9. Migration Strategy

### 9.1 Existing Courses

The 11 OS courses, 6 PA courses, and 7 OOP courses need to be converted from JSX to JSON. This is done by:
1. Running the curate pipeline with `--redo` against existing content
2. Pipeline reads the existing JSX + original PDF and produces JSON
3. Manual review of the output

### 9.2 Backwards Compatibility

During migration, both systems can coexist:
- `CourseRenderer` handles JSON courses
- Legacy JSX courses still work via the old lazy import path
- `index.js` can mix both: `{ src: 'course-01.json' }` and `{ component: lazy(...) }`
- Once all courses are migrated, remove the legacy JSX rendering path

### 9.3 Progress Data Migration

Existing `checked` keys (`course_1-intro`) map to new format (`os-c1-intro`). A one-time migration function in AppContext converts old keys to new format, setting `{ visited: true, understood: true }` for any previously checked item.
