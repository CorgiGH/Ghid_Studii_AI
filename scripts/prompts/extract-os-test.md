You are extracting an Operating Systems (OS / Sisteme de Operare) university test/exam from Romanian-language PDF(s). Output valid JSON only — no prose, no fences, no commentary.

## Input context

- One or more PDFs from an exam folder. Possible formats:
  - Single PDF with the full test (problems + grading/barem inline)
  - Two PDFs: `specificatie.pdf` (problems) + `barem.pdf` (grading rubric). Merge rubric points into each question.
  - A PDF with multiple-choice quiz questions ("grile")
- Content is in Romanian. Preserve the original Romanian wording in the `ro` fields; produce a faithful English translation in `en`.

## Output schema

```json
{
  "meta": {
    "id": "TEMP-slug",
    "title": { "en": "...", "ro": "..." },
    "year": 2024,
    "type": "midterm",
    "variant": 1,
    "duration": 120,
    "totalPoints": 20
  },
  "questions": [
    {
      "id": "q1",
      "type": "code-writing",
      "points": 5,
      "prompt": { "en": "...", "ro": "..." },
      "language": "c",
      "hints": [ { "en": "...", "ro": "..." } ],
      "solutionOutline": { "en": "...", "ro": "..." }
    }
  ]
}
```

## Rules for `meta`

- `id`: leave as `"TEMP-slug"` — the calling script will overwrite it.
- `title.ro`: a short descriptive title in Romanian, e.g. `"Test Practic SO 1 – 2023-2024, Varianta 2"`. `title.en`: matching English.
- `year`: single integer. If the academic year is `2023-2024`, use `2024`. If you cannot determine a year, use `null`.
- `type`: one of:
  - `"midterm"` — Test Parțial 1 / Test Parțial 2 / TP1 / TP2 / "test 1 lab" / "test 2 lab" / PartialSOT*
  - `"final-exam"` — "Examen Curs", "partea 1/2" (curs), "Examen Teoretic"
  - `"exam-retake"` — "restanță" / "restanta" / "mărire" / "marire"
  - `"model"` — labeled as model / sample
  - `"unknown"` — only if truly unclassifiable
- `variant`: integer variant number if visible (varianta_2 → 2; PartialSOT3 → 3). Otherwise `null`.
- `duration`: minutes as integer if stated (e.g. "2 ore" → 120, "90 min" → 90). Otherwise `null`.
- `totalPoints`: sum of all question `points`. If the PDF shows explicit points, sum them; otherwise estimate based on standard grading.

## Rules for `questions`

- Each question gets sequential id `q1`, `q2`, …
- `type`: one of
  - `"code-writing"` — write a C program
  - `"bash-scripting"` — write a bash script
  - `"multiple-choice"` — choose one answer (see MC schema below)
  - `"open-ended"` — explain / describe in prose
  - `"fill-in"` — short fill-in-the-blank (MUST include `blanks` array, see below)
- `points`: numeric. For midterm TP1/TP2 Romanian scale, questions typically sum to 10 or 20 per test. For multiple-choice, assign 1 point each unless the PDF says otherwise.
- `prompt.ro`: the problem statement verbatim from the PDF (keep the Romanian). Preserve bullet lists, code samples, file hierarchies, grading breakdowns (barem). Use plain text; use `\n` for newlines; use markdown bold (`**`) sparingly for structure.
- `prompt.en`: faithful English translation. Preserve same structure.
- `language`: `"c"` for code-writing, `"bash"` for bash-scripting, otherwise omit.
- `hints`: 1–2 practical hints per non-MC question that nudge without revealing the full answer. Bilingual `{en, ro}`. For MC questions, usually omit or provide a single conceptual hint.
- `solutionOutline`: a step-by-step sketch of the solution in numbered form. Bilingual. For MC questions, put the correct answer letter + brief justification.

### Fill-in schema

For `type: "fill-in"`, ALSO include:

```json
{
  "id": "q1",
  "type": "fill-in",
  "points": 1,
  "prompt": { "en": "...", "ro": "..." },
  "blanks": [
    { "id": "ans", "accept": ["stat", "stat -x", "/usr/bin/stat"] }
  ],
  "solutionOutline": { "en": "stat — prints all file attributes", "ro": "stat — afișează toate atributele" }
}
```

- `blanks[].accept`: case-insensitive accepted answers. Include common aliases (with/without flags, absolute path, etc.) where plausible. If the answer is clearly one canonical form, one entry is enough.
- Even one-answer fill-ins MUST include `blanks` — this is required by the schema validator.

### Multiple-choice schema

For `type: "multiple-choice"`, ALSO include:

```json
{
  "id": "q1",
  "type": "multiple-choice",
  "points": 1,
  "prompt": { "en": "...", "ro": "..." },
  "options": [
    { "text": { "en": "option A text", "ro": "option A text RO" } },
    { "text": { "en": "option B text", "ro": "option B text RO" } }
  ],
  "correctIndex": 2,
  "explanation": { "en": "why this is correct", "ro": "..." }
}
```

- `correctIndex`: zero-based index of the correct option. If the PDF does NOT show answers, set `correctIndex: null` and put your best inference in `explanation`.
- MC questions with multiple correct answers (e.g., "bifati TOATE"): set `correctIndex` to an array of indices `[0, 2, 4]` and note `"multi-select"` at the start of `explanation.en`.
- `options` MUST have at least 2 entries. If you can only produce 1 option, the question is NOT multiple-choice — use `open-ended` with a `rubric` instead. Classification/matching questions ("clasificați următoarele SO-uri după...") are `open-ended`, not `multiple-choice`.

## Critical rules

1. Output ONLY the JSON object. No markdown fences, no prose preamble, no trailing text.
2. Preserve the professor's exact notation (function names, filenames, error codes, exit codes, file-hierarchy ASCII trees).
3. Sum of `question.points` should equal `meta.totalPoints`.
4. If barem.pdf is provided separately, fold its grading breakdown into each question's `prompt` under a `**Barem:**` / `**Grading:**` section, and ensure `points` reflects the stated value.
5. Keep Romanian diacritics intact in the RO fields (ă, â, î, ș, ț).
