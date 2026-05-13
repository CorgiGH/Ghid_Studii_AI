# OOP Course 7 Migration + Enrichment — Design

**Date:** 2026-05-13
**Scope:** Single course (`oop-c7`)
**Type:** Migration (JSX → JSON) + pedagogy enrichment (quizzes, traps, per-option explanations)

## Goal

Bring OOP Course 7 — STL (1) — to parity with sibling JSON courses `oop-c1`...`oop-c6`, `oop-c8`...`oop-c11`:
- JSON-backed (currently the only JSX course in the OOP subject).
- Normalized `oop-c7` id (currently the only OOP course with the legacy `oop-course_7` id).
- Quiz blocks with `explanation: {en, ro}` per option.
- Trap callouts on pitfalls.
- All validators clean, deploy gate passes, classmates retain section progress via shim.

## Background

`src/content/oop/courses/Course07.jsx` is 838 lines of bilingual content covering six sections (Sequence Containers, Adaptors, I/O Streams, Strings, Initialization Lists, Iterators). It predates the `/curate` skill; all sibling OOP courses were curated from PDF via the six-stage pipeline (Gemini extraction → Opus draft → self-review → validate → auto-deploy).

Course 7 is the lone holdout. Its content shape (`Section`, `Box`, `Code`, `Toggle`) does not match the c8-c11 vocabulary (`learn`, `definition`, `callout`, `code`, `quiz`, `list`, `table`). Its id `oop-course_7` is the only OOP course not matching the `oop-cN` pattern. Section ids `oop-course_7-sequence` etc. are off-pattern too.

Registry references:
- `src/content/oop/index.js:20-29` — c7 entry (JSX, legacy id, embedded `sections[]`).
- `src/content/oop/index.js:14`, `:30-33` — sibling JSON entries for shape reference.

Existing curate output reference: `src/content/oop/.curate/Course-11/` — pattern for staged artifacts.

PDF source: `src/content/oop/source/Course-7.pdf` (942 KB).

## Decisions made during brainstorm

1. **Approach: `/curate` fresh from PDF.** Not a `--redo` diff-merge, not a hand-port. Accept full regeneration of content; the review round catches gaps.
2. **ID normalization with shim.** Clean ids AND no progress loss for existing classmates.
3. **One review round** (not loop-until-zero) — clone `scripts/review-gemini-oop-c11.mjs`.
4. **No labs/seminars/tests/practice touched.** Just the course JSON + registry + shim + Course07.jsx delete.

## Architecture

### Pipeline

`/curate` skill invoked on `src/content/oop/source/Course-7.pdf`:

| Stage | Engine | Output |
|---|---|---|
| 1 | Gemini script | `.curate/Course-7/stage1-extraction.json` (PDF text + structure) |
| 2 | Gemini script | `.curate/Course-7/stage2-crossref.json` (bibliography refs) |
| 3 | Haiku agent | `.curate/Course-7/stage3-diagrams.json` (diagram triage) |
| 4 | Opus | `.curate/Course-7/stage4-draft.json` (initial course JSON) |
| 5 | Opus | `.curate/Course-7/stage5-draft.json` + `index-snippet.js` (self-reviewed) |
| 5.5 | `validate-course.mjs` | structural pass/fail (block props, bilingual, quiz schema) |
| 6 | Opus | move to `courses/course-07.json`, patch `index.js`, build, commit, push |

### Block-type budget

Output must use only these block types (must match `src/components/blocks/` registry): `learn`, `definition`, `callout` (variants `info`/`tip`/`warning`/`danger`/`trap`), `code`, `quiz`, `list`, `table`, `think`. No `figure`/`image` unless stage 3 promotes a PDF diagram.

### Quiz coverage rule

- Every content step has ≥1 `quiz` block. (An optional `intro`/overview step at position 0 is exempt — c8 pattern.) If curate emits a content step without a quiz, hand-add one before ship.
- Each `quiz` option matches the c11 quiz schema shape: `{ en, ro, correct, explanation: { en, ro } }`. Per-option `explanation` is non-optional (lint rule R5 + memory `feedback_curate_gotchas` rule on explanations).
- Trap callouts precede quizzes on the known pitfalls from the PDF and the JSX content:
  - `vector` push_back reallocation cost without `reserve()`
  - `priority_queue` underlying container constraint (no `list` — needs random access)
  - `queue` underlying container constraint (no `vector` — needs `pop_front`)
  - `list` iterator capability gap (no `<`, no `+`)
  - `forward_list` iterator capability gap (no `--`, no reverse iterator)
  - `string_view::data()` not null-terminated → `printf("%s", sv.data())` UB
  - Iterator invalidation after `erase`
  - `operator[]` no bounds check in Release vs `at()` bounds check + throw
  - Macro misparse of brace-init due to commas

### File changes

| Path | Change |
|---|---|
| `src/content/oop/source/Course-7.pdf` | Input (no change) |
| `src/content/oop/.curate/Course-7/*` | New (staged artifacts) |
| `src/content/oop/courses/course-07.json` | **New** — curate output |
| `src/content/oop/index.js` | **Modify** — replace c7 entry (see ID section) |
| `src/contexts/AppContext.jsx` | **Modify** — add one-shot localStorage shim |
| `src/content/oop/courses/Course07.jsx` | **Delete** |
| `scripts/review-gemini-oop-c7.mjs` | **New** — clone of `review-gemini-oop-c11.mjs` |
| `wiki/sources/OOP Course 7.md` | **Modify** — bump `updated:` to 2026-05-13; append one-line note "Migrated to JSON 2026-05-13; see `src/content/oop/courses/course-07.json`." No content rewrite. |

## ID normalization + shim

### Registry change

`src/content/oop/index.js` lines 20-29. Replace:

```js
{ id: 'oop-course_7', title: { en: 'Course 7: STL (1)', ro: 'Cursul 7: STL (1)' },
  shortTitle: { en: 'C7: STL', ro: 'C7: STL' }, sectionCount: 6,
  sections: [
    { id: 'oop-course_7-sequence',  title: { en: '1. Seq Containers', ro: '1. Cont. secvenț.' } },
    { id: 'oop-course_7-adaptors',  title: { en: '2. Adaptors',       ro: '2. Adaptori' } },
    { id: 'oop-course_7-streams',   title: { en: '3. I/O Streams',    ro: '3. Fluxuri I/O' } },
    { id: 'oop-course_7-strings',   title: { en: '4. Strings',        ro: '4. Șiruri' } },
    { id: 'oop-course_7-init-lists',title: { en: '5. Init Lists',     ro: '5. Liste inițial.' } },
    { id: 'oop-course_7-iterators', title: { en: '6. Iterators',      ro: '6. Iteratori' } },
  ],
  component: lazy(() => import('./courses/Course07.jsx')) },
```

With:

```js
{ id: 'oop-c7', title: { en: 'Course 7: STL (1)', ro: 'Cursul 7: STL (1)' },
  shortTitle: { en: 'C7: STL', ro: 'C7: STL' }, sectionCount: N, metaId: 'oop-c7',
  src: 'oop/courses/course-07.json' },
```

`N` = step count from curate output (expected 6-8; intro step is common in c8 pattern).

### Legacy → new ID mapping (ordinal, not name-based)

After curate emits `course-07.json`, capture the step ids in their JSON order. Map each legacy id to the corresponding new id by position:

| Pos | Legacy key | New key (filled in after curate) |
|---|---|---|
| 1 | `oop-course_7-sequence`  | `oop-c7-<step1-id>` |
| 2 | `oop-course_7-adaptors`  | `oop-c7-<step2-id>` |
| 3 | `oop-course_7-streams`   | `oop-c7-<step3-id>` |
| 4 | `oop-course_7-strings`   | `oop-c7-<step4-id>` |
| 5 | `oop-course_7-init-lists`| `oop-c7-<step5-id>` |
| 6 | `oop-course_7-iterators` | `oop-c7-<step6-id>` |

If curate emits an intro step ahead of the six content steps (c8 pattern: `oop-c8-intro` + 7 content steps), shift the mapping by one: legacy `sequence` lands on the first content step, not the intro.

If curate emits fewer than 6 steps (e.g. merges Strings + Init Lists), the unmapped legacy keys stay unmapped — minor progress loss accepted.

### Shim implementation

`src/contexts/AppContext.jsx` — add one-shot effect on provider mount:

```js
useEffect(() => {
  if (localStorage.getItem('migrated_oop_c7') === '1') return;
  const legacyToNew = {
    'oop-course_7-sequence':   'oop-c7-<step1-id>',
    'oop-course_7-adaptors':   'oop-c7-<step2-id>',
    'oop-course_7-streams':    'oop-c7-<step3-id>',
    'oop-course_7-strings':    'oop-c7-<step4-id>',
    'oop-course_7-init-lists': 'oop-c7-<step5-id>',
    'oop-course_7-iterators':  'oop-c7-<step6-id>',
  };
  try {
    setChecked(prev => {
      const next = { ...prev };
      for (const [oldK, newK] of Object.entries(legacyToNew)) {
        if (prev[oldK]) next[newK] = true;
        delete next[oldK];
      }
      return next;
    });
    localStorage.setItem('migrated_oop_c7', '1');
  } catch (e) {
    console.error('oop-c7 shim failed', e);
  }
}, []);
```

Exact code shape verified against current `AppContext.jsx` API at implementation time. Sentinel makes shim idempotent. Wrap in try/catch so error never blocks app boot; sentinel only set on success so a partial failure retries next load.

### Shim lifetime

Keep ~2 months past deploy. Then delete the effect (sentinel is harmless residue).

## Review round + post-ship gates

### Review script

New `scripts/review-gemini-oop-c7.mjs` — copy of `scripts/review-gemini-oop-c11.mjs` with paths swapped. Sends `course-07.json` plus Course-7 PDF text to Gemini with a structured prompt asking it to flag:
- Factual errors (C++ semantics)
- Weak distractors (obviously wrong, off-topic, dup)
- Missing or shallow per-option `explanation`
- RO translation drift (technical terms mismatched)
- Unclear MC stems
- Callout misclassification (`warning` vs `trap` vs `danger`)
- Coverage gaps vs PDF section topics

### Apply pattern

Mirror the c11 round cadence. Either:
- Manual fixes per finding (small set), OR
- Generate `scripts/apply-c7-r1-fixes.mjs` if Gemini emits a structured diff (the c11 round-2 pattern at `scripts/apply-c11-r2-fixes.mjs`).

One round only. Accept plateau. Do not loop until zero.

### Mechanical gates (must all pass before commit)

1. `node scripts/validate-course-json.mjs src/content/oop/courses/course-07.json`
2. `node scripts/validate-bilingual.mjs src/content/oop/courses/course-07.json`
3. `node scripts/lint-site.mjs` (advisory; chase R1-R8 hits)
4. `npm run build` exits 0
5. `node scripts/smoke-test.mjs` passes for `/y1s2/oop` + c7 deep link

Optional advisory:
6. `node scripts/content-truth-check.mjs --file src/content/oop/courses/course-07.json` — MC answer-key sanity check against out-of-band Gemini.

### Commits

Per memory rule (commit + push every course):
- Commit 1: `feat(oop): migrate Course 7 to JSON (c7) + ID shim`
- Commit 2: `fix(oop): review round 1 — c7 (gemini)`

## What user MUST see at URL `/y1s2/oop` → Course 7

Visual-presence acceptance per global feature-shipped rule. After deploy + cache purge:

1. Course header reads "Course 7: STL (1)" (EN) / "Cursul 7: STL (1)" (RO).
2. Step navigation paints with N step thumbnails (N from curate output).
3. First step content visible: title + at least one `learn` paragraph.
4. Sticky `InlineProgress` ring shows `0 / N`.
5. No `ErrorBoundary` crash screen. No stuck Suspense spinner. No `console.error`.

### Required `data-testid` selectors (verify on first run; add if absent)

- `[data-testid="course-renderer"]` — root of rendered course
- `[data-testid="step-content"]` — current step's block list
- `[data-testid="step-nav-next"]` and `[data-testid="step-nav-prev"]` — pagination
- `[data-testid="quiz-block"]` — every quiz instance
- `[data-testid="quiz-option"]` — every MC option
- `[data-testid="quiz-feedback"]` — per-option explanation panel

If any selector missing in `CourseRenderer.jsx` or quiz block component, add as a one-line `data-testid={...}` prop. No refactor.

### Interaction smoke (per global rule)

- Click each step → no 4xx network response (course-media images, if any, resolve via `BASE_URL`).
- Click every quiz option in at least one step → feedback panel paints; no `404|HTTP \d{3}|not found|error/i` text appears; no new 4xx requests fire.
- Toggle EN ↔ RO → every visible string swaps; no raw `{en: ..., ro: ...}` objects leak through.
- Toggle light ↔ dark → all colors resolve via `var(--theme-*)`; no hardcoded light-only contrast.

Ship blocked unless all selectors paint AND no 4xx during click-through AND no error text after any click.

## Rollback

Single revert per commit. Revert restores `Course07.jsx`, registry entry, removes JSON, removes shim. The `migrated_oop_c7=1` sentinel survives revert but causes no harm — its code path is gone.

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Curate emits <6 or >8 steps (different chunking than JSX sections) | Shim mapping is ordinal, not name-based; works at any N. Unmapped legacy keys stay (acceptable). |
| Curate output loses critical JSX content (perf numbers, IgnoreCase, Toggle Qs) | Accepted per Approach A. Review round flags gaps; manual patch as needed. |
| Quiz block schema drift (c8 vs c11 shapes) | Validator catches. Match c11 quiz schema (option fields: `en`, `ro`, `correct`, `explanation: {en, ro}`) — latest reference. |
| Curate pipeline 503 / quota / 402 | 3 Gemini + 3 OpenRouter keys with rotation. Retry-with-backoff exists. If both exhausted: defer ship. |
| Section ID collision (legacy + new live momentarily) | `delete next[oldK]` in shim removes legacy keys on first load. |
| Build base-path issue with new JSON | `loadJson()` already handles `BASE_URL` — same code path as c1-c11. No new path. |
| User mid-deploy sees stale c7 JSX | Cache only. Refresh clears. Same as any deploy. |
| Stale `Course07` references after delete | Grep `Course07` after delete; remove holdouts. |
| ErrorBoundary swallows shim error silently | Shim try/catch + console.error; sentinel only set on success. |

## Out of scope

- No renderer component changes.
- No new block types.
- No labs / seminars / tests / practice touched.
- No global routing or `App.jsx` changes.
- No `wiki/concepts/STL Containers.md` rewrite — existing wiki source page only gets `updated:` bump.

## Open items deferred to implementation phase

1. Confirm `setChecked` API shape in current `AppContext.jsx`.
2. Confirm `data-testid` presence/absence in `CourseRenderer.jsx` and quiz component; add if missing.
3. Verify `.curate/Course-N/` directory is gitignored or committed (look at c11 commit `a510295`).
4. Verify legacy URL pattern for direct linking to c7 — does anything reach `/y1s2/oop?course=oop-course_7` that needs a redirect?
