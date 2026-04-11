# Continue OOP Test Extraction

Read memory file `reference_oop_test_pipeline.md` and `feedback_oop_test_extraction.md` first. They contain the full guide, remaining work list, and mistakes to avoid.

## What to do

Continue extracting OOP tests. 3 of 39 are done (T1 P1-P3). Start with the easy PDF ones next.

## Exact steps per test (do NOT deviate)

1. Run: `cd C:/Users/User/Desktop/SO/os-study-guide && node scripts/extract-oop-tests.mjs --folder "<filter>"`
2. Edit the output JSON at `src/content/oop/tests/<slug>.json` — fix ONLY the metadata block (lines 3-15): set title, year, type, session, testPart, problemNumber based on the folder name. Use offset+limit to read only those lines.
3. Add one line to `src/content/oop/index.js` in the `tests` array (before the `],`)
4. Run: `npm run build` — must pass with no errors
5. Commit: `git add src/content/oop/tests/<slug>.json src/content/oop/index.js && git commit -m "feat: add OOP test <Part> — <ClassName> (<year>)"`
6. Push: `git push`
7. Repeat for next test.

## Suggested order (easy first)

Start with T2 2024 (have solutions):
- `--folder "T2/P1 2024"` → slug: examen2023-2024-t2-p1-2024
- `--folder "T2/P2 2024"` → slug: examen2023-2024-t2-p2-2024
- `--folder "T2/P3 2024"` → slug: examen2023-2024-t2-p3-2024

Then model tests 2020-2021:
- `--folder "model/Model test 1 lab OOP (1)"` → slug: examen2020-2021-model-model-test-1-lab-oop-1
- (repeat for (2), (3), then test 2 (1), (2), (3))

Then ALTI ANI problems (12 single PDFs):
- `--folder "ALTI ANI/Prob Biblioteca"` etc.

## DO NOT

- Re-read extract-oop-tests.mjs, providers.mjs, TestRenderer.jsx, CodeWritingQuestion.jsx, or PA test JSONs
- Explore codebase structure — everything needed is in memory
- Run --dry-run unless you forgot a folder name
- Use agents for simple tasks — direct tool calls only
- Read full JSON files — use offset/limit to read just metadata (lines 1-15)
