# ALO Practice Redesign — Plan 4: Seminar Tab Migration (Path A — full spec)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the ALO Seminar tab from six monolithic `Seminar0N.jsx` files (~2,900 lines of JSX+data) into six `seminar-0N.json` files consumed by a new `SeminarShell` that reuses the Practice tab's `ExerciseShell`. Each seminar becomes a distinct route (`/y1s2/alo/sem_N`) with its own problem sidebar, following the Practice UX pattern. Net result: all six seminars live in the same shell as Practice; classroom problems render via a new `SeminarBlockRenderer` supporting seven block types.

**Architecture:**
- **Per-seminar routing** mirrors the existing `labs` pattern in `SubjectPage.jsx` (wildcard `sem_N`, Sidebar `routePrefix="sem_"`, `activeSem` state) — no new routing primitives.
- **`SeminarShell`** wraps `ExerciseShell` and passes `showNewInstance={false}` because seminar problems are fixed (not seeded).
- **`ProblemDetailPane`** extends from "widget OR nothing" to "widget AND/OR blocks" — when `problem.blocks` exists it renders them via a new `SeminarBlockRenderer` switch.
- **JSON schema** per spec §6: `{ id, title, problems: [{ id, title, statement?, blocks: Block[], widgets?: [{id,mode}] }] }`. Block types: `mc | proof-toggle | definition | theorem | code | equation | learn`.
- **Widget injection** permitted but minimal. Seminar 02 (Gram–Schmidt) and Seminar 05 (QR) may link to W7 / W5 / W6 as `widgets: [{id, mode:'reveal'}]`.

**Tech Stack:** No new deps. Reuses `ExerciseShell`, `MultipleChoice`, `Toggle`, `Box`, `Code` (all already in the codebase), KaTeX for inline math.

**Reference:**
- Spec: `docs/superpowers/specs/2026-04-17-alo-practice-redesign-design.md` §6 (lines 292–314).
- Current seminar renders at `src/pages/SubjectPage.jsx` lines 287–314 (stack-all pattern, to be replaced).
- Lab routing pattern: `src/pages/SubjectPage.jsx` lines 51–52 (`labMatch`), 75–83 (`activeLab`), 318–350 (`activeLab ? ...: all-stacked`).
- Memory: `C:/Users/User/.claude/projects/C--Users-User-Desktop-SO-os-study-guide/memory/project_alo_practice_redesign.md`.

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/exercise-shell/SeminarBlockRenderer.jsx` | Switch over block.type → `mc | proof-toggle | definition | theorem | code | equation | learn`; imports `MultipleChoice`, `Toggle`, `Box`, `Code` from `ui/`; for `equation` and `learn` reuses the existing `formatMarkdown` + `katex` helpers. |
| Create | `src/content/alo/seminars/SeminarShell.jsx` | Takes a seminar JSON file (module import), converts `problems[]` into `ExerciseShell`'s `problems` prop, passes `showNewInstance={false}`. |
| Create | `src/content/alo/seminars/seminar-01.json` | Migrated content of `Seminar01.jsx`. |
| Create | `src/content/alo/seminars/seminar-02.json` | Migrated content of `Seminar02.jsx`. |
| Create | `src/content/alo/seminars/seminar-03.json` | Migrated content of `Seminar03.jsx`. |
| Create | `src/content/alo/seminars/seminar-04.json` | Migrated content of `Seminar04.jsx`. |
| Create | `src/content/alo/seminars/seminar-05.json` | Migrated content of `Seminar05.jsx`. |
| Create | `src/content/alo/seminars/seminar-06.json` | Migrated content of `Seminar06.jsx`. |
| Modify | `src/components/exercise-shell/ProblemDetailPane.jsx` | Add `SeminarBlockRenderer` call when `problem.blocks` is truthy; call after widget and before FeatTray. |
| Modify | `src/pages/SubjectPage.jsx` | Add `semMatch`/`semNum`/`activeSem`/`activeSemIndex`; update `tab` derivation to include `semNum → 'seminars'`; replace the "stack all seminars" JSX with an `activeSem ? <SeminarShell /> : <seminar picker>` branch, mirroring the labs pattern. Add Sidebar wiring with `routePrefix="sem_"`. |
| Modify | `src/content/alo/index.js` | Replace each seminar's `component: lazy(() => import('./seminars/Seminar0N.jsx'))` with `component: lazy(() => import('./seminars/SeminarShell.jsx').then(m => ({ default: () => <m.default seminarId="alo-sN" /> })))` OR simpler: add `src` field pointing at the JSON and let SeminarShell load it by id. |
| Delete | `src/content/alo/seminars/Seminar01.jsx` – `Seminar06.jsx` | Dead code after Task 10. |

---

## Testing approach (same as Plans 1–3, 5)

No unit-test framework. Verification per task = (a) `npm run build` passes, (b) `npm run lint` adds no new errors above the Plan 5 baseline, (c) manual browser smoke at `npm run dev` → `http://localhost:5173/#/y1s2/alo/seminars`. Phase 5 runs a sonnet+Puppeteer cold review.

---

## Phase 1 — Shell infrastructure (3 tasks)

### Task 1: SeminarBlockRenderer

**Files:**
- Create: `src/components/exercise-shell/SeminarBlockRenderer.jsx`

- [ ] **Step 1: Write the component**

Create `src/components/exercise-shell/SeminarBlockRenderer.jsx`:

```jsx
import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useApp } from '../../contexts/AppContext';
import { Box, Code, Toggle } from '../../components/ui';
import MultipleChoice from '../../components/ui/MultipleChoice';
import formatMarkdown from '../blocks/formatMarkdown';

/**
 * Renders an array of seminar blocks. Each block has a `type` and a type-specific payload.
 *
 * Supported types:
 *   - mc                { questions: [{ question:{en,ro}, options:[{text,correct,feedback}], explanation:{en,ro} }] }
 *   - proof-toggle      { question:{en,ro}, answer:{en,ro} }
 *   - definition        { title?:{en,ro}, content:{en,ro} }
 *   - theorem           { title?:{en,ro}, content:{en,ro} }
 *   - code              { language?:string, code:string }
 *   - equation          { tex:string }
 *   - learn             { content:{en,ro} }     // supports $...$ and $$...$$ via formatMarkdown
 */
export default function SeminarBlockRenderer({ blocks }) {
  const { t } = useApp();
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <div className="space-y-3 my-4">
      {blocks.map((block, i) => <SeminarBlock key={i} block={block} t={t} />)}
    </div>
  );
}

function SeminarBlock({ block, t }) {
  switch (block.type) {
    case 'mc':
      return <MultipleChoice questions={normalizeMcQuestions(block.questions)} />;

    case 'proof-toggle':
      return (
        <Toggle
          question={t(block.question.en, block.question.ro)}
          answer={<span dangerouslySetInnerHTML={{ __html: formatMarkdown(t(block.answer.en, block.answer.ro)) }} />}
          hideLabel={t('Hide solution', 'Ascunde soluția')}
          showLabel={t('Show solution', 'Arată soluția')}
        />
      );

    case 'definition':
      return (
        <Box type="definition">
          {block.title && (
            <strong className="block mb-1">{t(block.title.en, block.title.ro)}</strong>
          )}
          <span dangerouslySetInnerHTML={{ __html: formatMarkdown(t(block.content.en, block.content.ro)) }} />
        </Box>
      );

    case 'theorem':
      return (
        <Box type="theorem">
          {block.title && (
            <strong className="block mb-1">{t(block.title.en, block.title.ro)}</strong>
          )}
          <span dangerouslySetInnerHTML={{ __html: formatMarkdown(t(block.content.en, block.content.ro)) }} />
        </Box>
      );

    case 'code':
      return <Code language={block.language ?? 'plaintext'}>{block.code}</Code>;

    case 'equation': {
      let html;
      try {
        html = katex.renderToString(block.tex, { displayMode: true, throwOnError: false, output: 'htmlAndMathml' });
      } catch {
        html = `<code>${escapeHtml(block.tex)}</code>`;
      }
      return (
        <div className="my-2 text-center overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
      );
    }

    case 'learn':
      return (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-content-text)' }}
           dangerouslySetInnerHTML={{ __html: formatMarkdown(t(block.content.en, block.content.ro)) }} />
      );

    default:
      return (
        <div className="text-xs p-2 rounded" style={{ background: '#fee2e2', color: '#b91c1c' }}>
          Unknown seminar block type: {block.type}
        </div>
      );
  }
}

/**
 * MultipleChoice accepts either `text: string` or `text: { en, ro }` per option.
 * Normalize bilingual option text so the component receives what it expects.
 * (Its internal `t()` call handles both shapes already — no transform needed.)
 *
 * We also enforce `questions` being an array (seminar JSON often stores a single-question block).
 */
function normalizeMcQuestions(questions) {
  if (!questions) return [];
  return Array.isArray(questions) ? questions : [questions];
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 3: Commit + push**

```bash
git add src/components/exercise-shell/SeminarBlockRenderer.jsx
git commit -m "feat(alo): SeminarBlockRenderer (mc/proof-toggle/definition/theorem/code/equation/learn)"
git push
```

---

### Task 2: Extend ProblemDetailPane to render blocks

**Files:**
- Modify: `src/components/exercise-shell/ProblemDetailPane.jsx`

- [ ] **Step 1: Add the import**

At the top of `ProblemDetailPane.jsx`, after the existing `FeatTray` import, ADD:

```js
import SeminarBlockRenderer from './SeminarBlockRenderer';
```

- [ ] **Step 2: Render blocks after widget, before the action row**

Find this block in `ProblemDetailPane.jsx`:

```jsx
        {widget && (
          <WidgetHost
            widget={widget}
            seed={seed}
            onSubmit={onSubmit}
            onGenerateInstance={onGenerateInstance}
          />
        )}

        <div className="mt-4 flex items-center gap-3 flex-wrap">
```

REPLACE with:

```jsx
        {widget && (
          <WidgetHost
            widget={widget}
            seed={seed}
            onSubmit={onSubmit}
            onGenerateInstance={onGenerateInstance}
          />
        )}

        {problem.blocks && <SeminarBlockRenderer blocks={problem.blocks} />}

        <div className="mt-4 flex items-center gap-3 flex-wrap">
```

- [ ] **Step 3: Verify build + smoke**

Run: `npm run build`. Expected: pass. No runtime test yet — blocks rendering verified in Task 4 smoke.

- [ ] **Step 4: Commit + push**

```bash
git add src/components/exercise-shell/ProblemDetailPane.jsx
git commit -m "feat(alo): ProblemDetailPane renders problem.blocks via SeminarBlockRenderer"
git push
```

---

### Task 3: SeminarShell wrapper

**Files:**
- Create: `src/content/alo/seminars/SeminarShell.jsx`

- [ ] **Step 1: Write the shell**

Create `src/content/alo/seminars/SeminarShell.jsx`:

```jsx
import React, { useMemo } from 'react';
import ExerciseShell from '../../../components/exercise-shell/ExerciseShell';

/**
 * Renders a single seminar's problems via the shared ExerciseShell.
 *
 * Props:
 *   - seminarData : { id, title:{en,ro}, problems: Problem[] }
 *     where Problem = { id, title:{en,ro}, statement?:{en,ro}, blocks?:Block[], widgets?:[{id,mode}] }
 *
 * Seminar problems are fixed content (no seeded instance generation).
 * They pass `showNewInstance={false}` to the shell.
 */
export default function SeminarShell({ seminarData }) {
  const problems = useMemo(
    () => (seminarData?.problems ?? []).map(p => ({
      id: p.id,
      title: p.title,
      statement: p.statement,
      blocks: p.blocks,
      // widgets (optional): reserved for later; ProblemDetailPane will pick these up via problem.widget
      // if the array is non-empty and mode is 'tool' or 'reveal'. For now we map the first entry only.
      widget: (p.widgets && p.widgets.length > 0) ? pickReferencedWidget(p.widgets[0]) : undefined,
      groupLabel: undefined,
    })),
    [seminarData],
  );

  return (
    <ExerciseShell
      problems={problems}
      showNewInstance={false}
      titleEn={seminarData?.title?.en ?? 'Seminar'}
      titleRo={seminarData?.title?.ro ?? 'Seminar'}
    />
  );
}

/**
 * Look up a widget in the Practice catalog by id. Returns the WidgetSpec (same shape
 * ExerciseShell expects) or undefined if no match. Keeps seminar widget injection
 * optional and non-breaking — missing ids just mean no widget.
 */
function pickReferencedWidget(ref) {
  if (!ref?.id) return undefined;
  // Lazy-require the catalog so seminars that don't use widgets don't import it at all.
  // eslint-disable-next-line global-require
  const { widgetCatalog } = require('../practice/widgetCatalog');
  return widgetCatalog.find(w => w.id === ref.id);
}
```

**Note:** Check whether `ExerciseShell` accepts `titleEn`/`titleRo` props. If not, the shell internally derives title from the current `problem.title`; drop the two props from this call and remove them from the component signature. **Before committing this file, `grep -n "props\|title" src/components/exercise-shell/ExerciseShell.jsx` to confirm the shell's actual prop surface — if it only accepts `problems` and `showNewInstance` (plus a few optional handlers), trim the `titleEn`/`titleRo` references.** Same rule for the `require('../practice/widgetCatalog')`: if the project's build forbids dynamic requires, change it to a top-level import.

- [ ] **Step 2: Audit and adjust ExerciseShell prop compatibility**

Run:
```bash
grep -n "export default function\|props\." src/components/exercise-shell/ExerciseShell.jsx
```

Read the top ~40 lines of `ExerciseShell.jsx` to confirm what props it actually takes. Adjust Step 1's `SeminarShell.jsx` to exactly match — remove any props the shell does not accept. If `ExerciseShell` does not take a `showNewInstance` prop (this was mentioned in the Plan 1 infra as a seminar-vs-practice switch), pass it through however the shell expects (e.g., a different prop name, or a render prop).

- [ ] **Step 3: Adjust `require` to `import` if the project forbids dynamic `require`**

If ESM-only (look for `"type": "module"` in package.json — it is set), replace the `require` in `pickReferencedWidget` with a static top-level import:

```js
import { widgetCatalog } from '../practice/widgetCatalog';
// ... then in pickReferencedWidget: return widgetCatalog.find(w => w.id === ref.id);
```

This makes the catalog always imported when SeminarShell loads. Small acceptable bundle cost (the catalog itself is lazy-inside, so only metadata loads).

- [ ] **Step 4: Verify build**

Run: `npm run build`. Expected: pass.

- [ ] **Step 5: Commit + push**

```bash
git add src/content/alo/seminars/SeminarShell.jsx
git commit -m "feat(alo): SeminarShell wraps ExerciseShell for JSON-driven seminar content"
git push
```

---

## Phase 2 — JSON schema + Seminar01 worked example (1 task)

### Task 4: Migrate Seminar01.jsx → seminar-01.json

**Files:**
- Create: `src/content/alo/seminars/seminar-01.json`

- [ ] **Step 1: Read the source**

Read `src/content/alo/seminars/Seminar01.jsx` in full (832 lines). Identify the problem breakdown — the JSX uses comment separators like `/* ─── P1 ─── */`, `/* ─── P2 ─── */`, etc. Each block between separators is typically one problem. For problems with sub-parts (e.g. P2a, P2c) merge the sub-parts into a single problem whose `blocks` array contains one `mc` block per sub-question, ordered top-to-bottom.

- [ ] **Step 2: Write the JSON**

Create `src/content/alo/seminars/seminar-01.json` with this shape:

```json
{
  "id": "alo-s1",
  "title": {
    "en": "Week 1: Vector & matrix norms, complex inner product",
    "ro": "Săptămâna 1: Norme vectoriale și matriciale, produs scalar complex"
  },
  "problems": [
    {
      "id": "alo-s1-p1",
      "title": { "en": "Problem 1 — ℓ₁ norm of (1, 2, …, n)", "ro": "Problema 1 — norma ℓ₁ a lui (1, 2, …, n)" },
      "statement": { "en": "For $x = (1, 2, \\ldots, n)^\\top$, compute $\\|x\\|_1$.", "ro": "Pentru $x = (1, 2, \\ldots, n)^\\top$, calculați $\\|x\\|_1$." },
      "blocks": [
        {
          "type": "mc",
          "questions": [
            {
              "question": { "en": "For x = (1, 2, …, n)ᵀ ∈ ℕⁿ, which expression gives ‖x‖₁?", "ro": "Pentru x = (1, 2, …, n)ᵀ ∈ ℕⁿ, care expresie dă ‖x‖₁?" },
              "options": [
                { "text": "n(n+1)/2", "correct": true },
                { "text": "n²", "correct": false, "feedback": { "en": "That is the count of entries in an n×n matrix, not the sum 1..n. Σᵢ=1..n i = n(n+1)/2.", "ro": "Acela e numărul de elemente dintr-o matrice n×n, nu suma 1..n. Σᵢ=1..n i = n(n+1)/2." } },
                { "text": "n(n+1)(2n+1)/6", "correct": false, "feedback": { "en": "That is Σᵢ² (sum of squares); ‖x‖₁ sums |xᵢ| = i.", "ro": "Aceea e Σᵢ² (suma pătratelor); ‖x‖₁ sumează |xᵢ| = i." } },
                { "text": "n", "correct": false, "feedback": { "en": "That is just the largest entry (‖x‖∞), not the sum.", "ro": "Acela e doar elementul cel mai mare (‖x‖∞), nu suma." } }
              ],
              "explanation": { "en": "‖x‖₁ = Σᵢ|xᵢ| = 1+2+⋯+n = n(n+1)/2.", "ro": "‖x‖₁ = Σᵢ|xᵢ| = 1+2+⋯+n = n(n+1)/2." }
            }
          ]
        }
      ]
    }
  ]
}
```

Repeat the pattern for all problems present in `Seminar01.jsx`. If the JSX has `mc1`, `mc2a`, `mc2c`, `mc3`, ..., each MC array becomes a `blocks[]` entry with `type: "mc"` and the appropriate `questions` array. For problems that also include `<Toggle question=... answer=...>` (proof reveal), append a `{ "type": "proof-toggle", "question": {...}, "answer": {...} }` block in the same problem's `blocks`.

**JSON rules to follow (bug-bitten conventions from the curation memory):**
- No Unicode fancy quotes ("", '', `, ´) in JSON strings — ASCII `"` only. Mathematical symbols (×, ×, −, ⋯, ℕ, ‖, Σ, ᵢ, etc.) are fine inside strings.
- Backslashes inside JSON strings must be escaped: `\\` for a literal `\`. Inside KaTeX `$...$`, a backslash in LaTeX becomes `\\` in JSON (e.g. `$\\|x\\|_1$` renders `‖x‖₁`).
- `feedback` is optional per option; provide it for incorrect options to give students a hint.

- [ ] **Step 3: Verify valid JSON**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('src/content/alo/seminars/seminar-01.json', 'utf8')); console.log('valid');"
```
Expected: `valid`. If it errors, inspect the reported line/column and fix.

- [ ] **Step 4: Run build**

`npm run build` — expected: passes (JSON isn't imported yet, so this is just a smoke test).

- [ ] **Step 5: Commit + push**

```bash
git add src/content/alo/seminars/seminar-01.json
git commit -m "feat(alo): migrate Seminar01 → seminar-01.json (Plan 4 worked example)"
git push
```

---

## Phase 3 — Per-seminar migration (5 tasks)

### Tasks 5–9: Migrate Seminar02 … Seminar06

Each task follows the same procedure as Task 4. Implementer subagents should:

1. Read the source JSX (`src/content/alo/seminars/Seminar0N.jsx`) in full.
2. Extract each `/* ─── PN ─── */`-delimited block → JSON problem.
3. Preserve every MC question, every Toggle, every Box (definition/theorem/warning/formula), every Code.
4. Copy EN and RO strings verbatim — do NOT re-translate.
5. Produce a valid JSON file matching the schema above.
6. Verify with `node -e "JSON.parse(...)"`.
7. Run `npm run build` — pass.
8. Commit + push per-seminar.

**Specific cues per seminar:**

### Task 5: Seminar02 → seminar-02.json
- Source: `src/content/alo/seminars/Seminar02.jsx` (470 lines). Topic: triangular systems, inverses, Gram–Schmidt.
- File: `src/content/alo/seminars/seminar-02.json`.
- Commit: `feat(alo): migrate Seminar02 → seminar-02.json (triangular systems, GS)`.
- Optional widget: if any problem references Gram–Schmidt explicitly, add `"widgets": [{"id": "gram-schmidt", "mode": "reveal"}]` on that problem.

### Task 6: Seminar03 → seminar-03.json
- Source: `src/content/alo/seminars/Seminar03.jsx` (463 lines). Topic: graphical methods, parametric systems, Gauss with pivoting.
- File: `src/content/alo/seminars/seminar-03.json`.
- Commit: `feat(alo): migrate Seminar03 → seminar-03.json (Gauss + pivoting)`.
- Optional widget: link W3 (`gauss-elim`) on the Gauss problem.

### Task 7: Seminar04 → seminar-04.json
- Source: `src/content/alo/seminars/Seminar04.jsx` (373 lines). Topic: LU decomposition — Doolittle, Crout, PA = LU.
- File: `src/content/alo/seminars/seminar-04.json`.
- Commit: `feat(alo): migrate Seminar04 → seminar-04.json (LU Doolittle/Crout)`.
- Optional widget: link W4 (`lu-decomp`).

### Task 8: Seminar05 → seminar-05.json
- Source: `src/content/alo/seminars/Seminar05.jsx` (358 lines). Topic: QR via Givens and Householder.
- File: `src/content/alo/seminars/seminar-05.json`.
- Commit: `feat(alo): migrate Seminar05 → seminar-05.json (Givens + Householder QR)`.
- Optional widgets: W5 (`givens-qr`) and W6 (`householder-qr`).

### Task 9: Seminar06 → seminar-06.json
- Source: `src/content/alo/seminars/Seminar06.jsx` (408 lines). Topic: eigenvalues, similarity, power method, QR iteration.
- File: `src/content/alo/seminars/seminar-06.json`.
- Commit: `feat(alo): migrate Seminar06 → seminar-06.json (eigenvalues, power method)`.
- Optional widget: W8 (`power-method`).

Each task = one subagent dispatch. Paste-heavy but instruction-driven; use haiku with the schema + Task 4's worked example as the pattern.

---

## Phase 4 — Routing + index wiring + cleanup (1 task)

### Task 10: Per-seminar routing, index rewiring, old JSX deletion

**Files:**
- Modify: `src/pages/SubjectPage.jsx`
- Modify: `src/content/alo/index.js`
- Delete: `src/content/alo/seminars/Seminar01.jsx` … `Seminar06.jsx` (6 files)

- [ ] **Step 1: Add per-seminar routing to SubjectPage**

Open `src/pages/SubjectPage.jsx`. After the existing `labMatch` / `labNum` lines (around lines 51–52), ADD:

```js
  const semMatch = wildcard?.match(/^sem_(\d+)$/);
  const semNum = semMatch ? parseInt(semMatch[1], 10) : null;
```

Then update the `tab` derivation (line 54–58) to include seminars-with-sem:

```js
  const tab = courseNum
    ? 'courses'
    : labNum
      ? 'labs'
      : semNum
        ? 'seminars'
        : ['seminars', 'labs', 'practice', 'tests'].includes(wildcard) ? wildcard : 'courses';
```

After `activeLab` / `activeLabIndex` memos (around lines 75–83), ADD:

```js
  const activeSem = useMemo(() => {
    if (!semNum || !subject) return null;
    return subject.seminars?.[semNum - 1] || null;
  }, [semNum, subject]);

  const activeSemIndex = useMemo(() => {
    if (!activeSem || !subject) return -1;
    return subject.seminars.findIndex(s => s.id === activeSem.id);
  }, [activeSem, subject]);
```

- [ ] **Step 2: Wire Sidebar for seminars**

Find the existing labs-tab Sidebar wiring (around line 223–228, passing `activeCourseId={activeLab?.id}` and `routePrefix="lab_"`). You'll need to teach the Sidebar component to switch `items` and `routePrefix` based on which tab is active. Look at how the current sidebar source-of-truth works — if the Sidebar receives `items` via SubjectPage context, pass `subject.seminars` when `tab === 'seminars'` and `routePrefix="sem_"` with `activeCourseId={activeSem?.id}`. If the Sidebar is structured differently, read `src/components/layout/Sidebar.jsx` and adapt.

- [ ] **Step 3: Rewrite the seminars tab body**

Find the current block in `SubjectPage.jsx`:

```jsx
            {tab === 'seminars' && subject.seminars && (
              <div>
                {subject.seminars.length === 0 ? (
                  <div className="text-center py-12 opacity-60">
                    <p className="text-4xl mb-4">{subject.icon}</p>
                    <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                  </div>
                ) : (
                  <>
                    {subject.slug === 'pa' && (
                      <p className="mb-4 text-xs" style={{ color: 'var(--theme-muted-text)' }}>
                        {t(`${subject.seminars.length} weeks`, `${subject.seminars.length} săptămâni`)}
                      </p>
                    )}
                    {subject.seminars.map(sem => {
                      const SemContent = sem.component;
                      return (
                        <CourseBlock key={sem.id} title={sem.title[lang]} id={sem.id}>
                          <Suspense fallback={<LoadingFallback />}>
                            <SemContent />
                          </Suspense>
                        </CourseBlock>
                      );
                    })}
                  </>
                )}
              </div>
            )}
```

REPLACE with (mirrors the labs pattern at lines 316–351):

```jsx
            {tab === 'seminars' && subject.seminars && (
              <>
                {activeSem ? (
                  <CourseTransition courseIndex={activeSemIndex}>
                    <Suspense fallback={<LoadingFallback />}>
                      {React.createElement(activeSem.component)}
                    </Suspense>
                    <CourseNavigation
                      items={subject.seminars}
                      currentIndex={activeSemIndex}
                      yearSem={yearSem}
                      subjectSlug={subjectSlug}
                      routePrefix="sem_"
                    />
                  </CourseTransition>
                ) : (
                  subject.seminars.length === 0 ? (
                    <div className="text-center py-12 opacity-60">
                      <p className="text-4xl mb-4">{subject.icon}</p>
                      <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                    </div>
                  ) : (
                    subject.seminars.map((sem, idx) => (
                      <div
                        key={sem.id}
                        onClick={() => navigate(`/${yearSem}/${subjectSlug}/sem_${idx + 1}`)}
                        className="p-4 mb-3 rounded border cursor-pointer hover:shadow-md transition-shadow"
                        style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-card-bg)', color: 'var(--theme-content-text)' }}
                      >
                        <h3 className="font-semibold mb-1">{sem.title[lang]}</h3>
                        <p className="text-xs opacity-70">{t('Click to open', 'Click pentru a deschide')}</p>
                      </div>
                    ))
                  )
                )}
              </>
            )}
```

Note: for subjects OTHER than ALO (os, pa, oop) the existing seminars are still JSX-component-shaped. Those subjects will render as the "picker" above, and clicking a card will still lazy-load the JSX component — same behavior as current ALO per-page visit, just now gated behind a route. This is OK because Plan 4 is ALO-only (per memory: this project is ALO-only).

- [ ] **Step 4: Update `src/content/alo/index.js`**

Find the `seminars: [...]` block (around lines 43–49). For each of the 6 seminars, REPLACE the `component: lazy(() => import('./seminars/Seminar0N.jsx'))` with a `SeminarShell`-backed lazy that loads the corresponding JSON:

```js
import seminar01Json from './seminars/seminar-01.json';
import seminar02Json from './seminars/seminar-02.json';
import seminar03Json from './seminars/seminar-03.json';
import seminar04Json from './seminars/seminar-04.json';
import seminar05Json from './seminars/seminar-05.json';
import seminar06Json from './seminars/seminar-06.json';
import { lazy } from 'react';

const SeminarShellLazy = lazy(() => import('./seminars/SeminarShell'));

function wrap(json) {
  return lazy(() => Promise.resolve({
    default: () => {
      const React = require('react');
      return React.createElement(SeminarShellLazy, { seminarData: json });
    },
  }));
}

// ...later in the seminars array:
seminars: [
  { id: 'alo-s1', title: { en: 'Week 1: Vector & matrix norms, complex inner product', ro: 'Săptămâna 1: Norme vectoriale și matriciale, produs scalar complex' }, shortTitle: { en: 'W1: Norms', ro: 'S1: Norme' }, component: wrap(seminar01Json) },
  { id: 'alo-s2', title: { en: 'Week 2: Triangular systems, inverses, Gram–Schmidt', ro: 'Săptămâna 2: Sisteme triunghiulare, inverse, Gram–Schmidt' }, shortTitle: { en: 'W2: GS + QR', ro: 'S2: GS + QR' }, component: wrap(seminar02Json) },
  { id: 'alo-s3', title: { en: 'Week 3: Graphical methods, parametric systems, Gauss with pivoting', ro: 'Săptămâna 3: Metode grafice, sisteme parametrice, Gauss cu pivotare' }, shortTitle: { en: 'W3: Pivoting', ro: 'S3: Pivotare' }, component: wrap(seminar03Json) },
  { id: 'alo-s4', title: { en: 'Week 4: LU decomposition — Doolittle, Crout, PA = LU', ro: 'Săptămâna 4: Descompunerea LU — Doolittle, Crout, PA = LU' }, shortTitle: { en: 'W4: LU', ro: 'S4: LU' }, component: wrap(seminar04Json) },
  { id: 'alo-s5', title: { en: 'Week 5: QR decomposition — Givens and Householder', ro: 'Săptămâna 5: Descompunerea QR — Givens și Householder' }, shortTitle: { en: 'W5: QR', ro: 'S5: QR' }, component: wrap(seminar05Json) },
  { id: 'alo-s6', title: { en: 'Week 6: Eigenvalues, similarity, power method, QR iteration', ro: 'Săptămâna 6: Valori proprii, similaritate, metoda puterii, iterație QR' }, shortTitle: { en: 'W6: Eigenvalues', ro: 'S6: Val. proprii' }, component: wrap(seminar06Json) },
],
```

**ESM alternative** (preferred if `require` is forbidden): replace the `wrap(json)` helper with a top-level factory component file `SeminarById.jsx` that takes a `seminarData` prop via a wrapping arrow. The simplest form:

```js
const makeSeminarComponent = (json) => {
  const Component = () => React.createElement(SeminarShellLazy, { seminarData: json });
  Component.displayName = `Seminar(${json.id})`;
  return Component;
};

// and in the list:
{ id: 'alo-s1', ..., component: makeSeminarComponent(seminar01Json) }
```

Test both forms locally; pick the one that `npm run build` accepts without warnings.

- [ ] **Step 5: Delete the old JSX**

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide"
rm src/content/alo/seminars/Seminar01.jsx
rm src/content/alo/seminars/Seminar02.jsx
rm src/content/alo/seminars/Seminar03.jsx
rm src/content/alo/seminars/Seminar04.jsx
rm src/content/alo/seminars/Seminar05.jsx
rm src/content/alo/seminars/Seminar06.jsx
```

- [ ] **Step 6: Verify build**

Run: `npm run build`. Expected: pass. Any import errors mean something else referenced the old files — grep:
```bash
grep -rn "Seminar0[1-6]\.jsx" src/ 2>/dev/null
```
Should return nothing.

- [ ] **Step 7: Smoke test**

Run `npm run dev`. Navigate to:
- `/#/y1s2/alo/seminars` → should show 6 seminar cards as clickable tiles.
- Click the first card → should navigate to `/#/y1s2/alo/sem_1` and render the first seminar's problems inside ExerciseShell with sidebar + crumbs.
- Verify each problem renders its blocks (MC works, proof-toggle expands, definition/theorem boxes render, inline KaTeX works).
- Click through W1-to-W6 seminars; confirm no console errors.

- [ ] **Step 8: Commit + push**

```bash
git add -A src/pages/SubjectPage.jsx src/content/alo/index.js src/content/alo/seminars/
git commit -m "feat(alo): per-seminar routing + JSON-backed seminars; delete old Seminar0N.jsx"
git push
```

---

## Phase 5 — Review gate (1 task)

### Task 11: Cold review + fix loop + memory update

- [ ] **Step 1: Run validation**

```bash
cd "C:/Users/User/Desktop/SO/os-study-guide"
npm run build
npm run lint
```

Expected: build passes; lint adds no new errors above Plan 5 baseline.

- [ ] **Step 2: Dispatch a sonnet+Puppeteer cold review**

Dispatch via Agent tool, `general-purpose`, model `sonnet`, with this prompt:

> Cold review of ALO Seminar tab migration (Plan 4).
> Plan: `docs/superpowers/plans/2026-04-17-alo-practice-plan-4-seminars.md`
> Spec: `docs/superpowers/specs/2026-04-17-alo-practice-redesign-design.md` §6
> Repo: `C:/Users/User/Desktop/SO/os-study-guide`
>
> Run `npm run dev` in background (port 5173). Use Puppeteer.
>
> 1. Navigate to `/#/y1s2/alo/seminars`. Screenshot to `/tmp/alo-seminars-picker.png` (1280×720). Confirm 6 seminar cards (W1–W6 titles) render as clickable tiles.
> 2. Click "Week 1" card. URL should become `/#/y1s2/alo/sem_1`. ExerciseShell should render with a sidebar listing Problems 1..N and a detail pane. Screenshot to `/tmp/alo-seminar-01.png`.
> 3. For each of the 6 seminars (navigate via the Sidebar or URL), confirm:
>    - The detail pane renders for each problem in the shell's sidebar.
>    - MC blocks are interactive (clickable options, reveal shows explanation).
>    - Proof-toggle blocks expand to reveal the answer.
>    - Definition/theorem Box blocks render with correct styling.
>    - Inline KaTeX (from `$...$` in problem `statement`) renders as math.
>    - Display KaTeX (`type: "equation"` blocks) renders centered.
>    - No console errors during interaction.
> 4. Navigate between seminars using `/sem_N` URLs. Confirm the Sidebar updates to reflect the active seminar.
> 5. Confirm the Practice tab at `/#/y1s2/alo/practice` still shows all 10 widgets and works (regression check).
>
> Bundle check: `npm run build` output should not show a new heavy chunk for the shell rewrite. Main bundle should stay flat within ±20 kB gz.
>
> Severity-tagged bug list: CRITICAL / MAJOR / MINOR / NIT. Recommendation: READY TO SHIP PLAN 4 / FIXES NEEDED. Under 800 words.
>
> Do NOT fix anything yourself. Kill the dev server before exiting.

- [ ] **Step 3: Triage and fix**

For CRITICAL / MAJOR issues: dispatch a focused fix-up subagent with explicit before/after snippets. Re-verify on the affected surface.

Common likely issues (flag and fix if they appear):
- JSON syntax errors in seminar-0N.json (missing comma, unescaped backslash in `\|` or `\\frac{}{}`).
- MC options with `text: { en, ro }` not rendering — check MultipleChoice's text render path.
- KaTeX errors from `$...$` inside JSON — ensure backslashes are doubled.
- ExerciseShell not accepting seminar problems with no widget — confirm the shell gracefully handles `problem.widget === undefined`.

- [ ] **Step 4: Commit this plan doc**

```bash
git add docs/superpowers/plans/2026-04-17-alo-practice-plan-4-seminars.md
git commit -m "docs(alo): plan 4 (Seminar tab migration, full spec path)"
git push
```

- [ ] **Step 5: Update memory**

Open `C:/Users/User/.claude/projects/C--Users-User-Desktop-SO-os-study-guide/memory/project_alo_practice_redesign.md` and:

1. Update front-matter `name:` from `Plans 1+2+3+5 shipped, only Plan 4 (seminars) remaining` to `ALO Practice redesign — ALL PLANS SHIPPED`.
2. Update front-matter `description:` to reflect complete migration: 10/10 widgets + 6/6 seminars on shared ExerciseShell.
3. Update the status line to `## Status: ALL 5 PLANS SHIPPED (2026-04-17). 10 of 10 widgets live + 6 of 6 seminars migrated.`
4. Add Plan 4 to authoritative documents with its commit SHA.
5. Update "Live commit range" to bump HEAD to the latest push SHA (it will be the commit from Step 4 of this task) and add ~13 commits from Plan 4.
6. Update the widget catalog table if needed (unchanged — still 10 widgets).
7. Append lessons from Plan 4 to the "Critical lessons from review gates" list. Candidates (include only the ones that actually bit during review):
   - JSON escaping for KaTeX (`\\|` for `\|`, `\\frac` for `\frac`).
   - MultipleChoice option `text` dual shape (string vs `{en,ro}`).
   - Lazy-import pattern for JSON-driven components (`makeSeminarComponent(json)` wrap).
   - ExerciseShell `showNewInstance` false for seminars (mentioned in Plan 1 but only now exercised in Plan 4).
8. Replace the entire "Resuming the project (next session prompt)" section with a brief "Project complete — future work parked" note, referencing `MEMORY.md` for any follow-ups.

Also update `MEMORY.md` index entry for ALO Practice from the Plan-1–3+5 entry to a final state: `ALO Practice redesign COMPLETE 2026-04-17` — Shell + 10 widgets + 6 seminars + full spec shipped.

- [ ] **Step 6: Final push**

```bash
git push
```

All work done.

---

## Self-Review Checklist

**1. Spec coverage** (§6 Seminar tab migration → task mapping):

- §6 "Route model — each seminar remains a distinct route (`/y1s2/alo/seminars/s1`)": Task 10 adds `sem_N` wildcard detection and per-seminar rendering, mirroring the labs pattern. Route format is `/y1s2/alo/sem_1` (consistent with `lab_1`). ✓
- §6 "The new ExerciseShell lives inside a single seminar route": Task 3 (`SeminarShell`) + Task 10 wiring. ✓
- §6 "The shell's own sidebar lists the problems of that one seminar": This is provided by `ExerciseShell`'s own problem sidebar (built in Plan 1). ✓
- §6 "Cross-seminar navigation stays in the subject sidebar, unchanged": Task 10 configures the subject `Sidebar` with `items={subject.seminars}` and `routePrefix="sem_"`. ✓
- §6 JSON per-seminar schema `{ id, title, problems: [...] }` with `Block[]` from the enumerated types: Task 1 (renderer) + Tasks 4–9 (migrations). ✓
- §6 "Problem statement, MultipleChoice, Toggle remain first-class — they become native block types inside ProblemDetailPane": Task 1 + Task 2 add `mc`, `proof-toggle` rendering in `SeminarBlockRenderer`. `MultipleChoice` and `Toggle` are reused unchanged. ✓
- §6 migration procedure (parse JSX → JSON → render-test → fix typos → widget-inject optionally → ship): Tasks 4–9 follow this procedure. ✓
- §6 widget injection rules (only pre-existing catalog widgets, replaces imagined steps): Task 3 (`SeminarShell.pickReferencedWidget`) looks up the catalog; Tasks 5–9 recommend specific widgets per seminar where pedagogically useful. ✓
- §6 deprecation (old `.jsx` stays until compiles clean for one merge cycle, then deleted): Task 10 deletes the 6 old JSX files after the JSON replacement is verified. Per project convention (`feedback_commit_push.md`: commit + push per task), one merge cycle effectively becomes "per-task CI passes on main". ✓

**2. Placeholder scan:** All code blocks are complete. No "TBD / implement later / similar to Task N". The per-seminar tasks (5–9) are instruction-driven but self-contained: each gives the implementer the source file path, destination, commit message, and points back to the Task 4 worked example.

**3. Type consistency:**

- Block shapes: `mc.questions[]` matches `MultipleChoice`'s `questions` prop. `proof-toggle.{question,answer}` matches `Toggle`'s `{question,answer}` (bilingual is rendered via `t()` inside the renderer). `definition/theorem` blocks share a shape and route to the same `Box` component with different `type`. `code.{code, language?}` matches `Code`. `equation.{tex}` matches the existing KaTeX helper. `learn.{content:{en,ro}}` matches `formatMarkdown`. ✓
- JSON schema → `SeminarShell` consumption: `seminarData.problems[]` maps into `ExerciseShell.problems[]` in Task 3. ✓
- `widgets: [{id, mode}]` optional → Task 3 `pickReferencedWidget` looks up the catalog by id, returning the `WidgetSpec` or undefined. ✓
- `activeSem` / `activeSemIndex` mirror `activeLab` / `activeLabIndex` (Task 10 Step 1). ✓

No type drift detected.

---

**Plan complete.** Saved to `docs/superpowers/plans/2026-04-17-alo-practice-plan-4-seminars.md`.
