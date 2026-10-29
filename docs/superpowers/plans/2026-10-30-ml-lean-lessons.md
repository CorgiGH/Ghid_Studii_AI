**What:** Plan for readable, test-ready ML lessons within Alex's remaining weekly usage (18% on 2026-10-30) · **When:** 2026-10-30 · **Status:** active

# ML lean lessons plan

Approved by Alex 2026-10-30 ("the rest is fine i guess"), with his correction: "don't pick to match JUST those exercises, I need the lessons to be generalized, not like trained on like 1 specific version of the test." Supersedes the screen lists of the content outline where they conflict; the outline, `allocation.json`, `verified-answers.md` and the teacher-list coverage map stay the sources of content and answers. The clarity standard in the main plan's Global Constraints and in `CLAUDE.md` ("Lesson clarity") applies to every lesson.

## Lessons, in this order (teacher-list items in brackets)
L1 conditional probability (3) · L2 total probability, Bayes (3) · L3 independence of events (4) · L4 random variables: distribution, mean, variance (1, 2) · L5 joint tables, operations, product XY, proving independence of variables (2, 4) · L6 conditional independence (4) · L7 entropy (5) · L8 conditional entropies, information gain (5) · L9 decision stumps, choosing the root (6, 7) · L10 comparisons without a calculator, the quick formulas (7) · L11 the full ID3 tree, classifying new cases (8) · L12 ID3 properties 1 (6, 16) · L13 ID3 properties 2 (16) · L14 continuous thresholds, decision zones (9, 10) · L15 over/underfitting and good fit, train/validation/test, k-fold, CVLOO, CV to detect overfitting (11-14) · L16 pruning (15) · L17 core only: ID3 is sensitive to attributes with many values (16) · L18 likelihood, only what L19 needs · L19 MAP and its derivation (17) · L20 Naive Bayes, joint (optimal) Bayes, the parameter counts (18, 19, 21) · L21 Laplace smoothing, unbalanced data and predefined priors (20, 23) · L22 advantages and disadvantages of optimal and naive Bayes (22) · then the practice tests: the real 2021 paper (T21P), the 2020 mock seminar test and Anca Vitcu's test from the students' Notion archive (`hub/docs/2026-10-28-research-ml/notion-tests/`), with model answers checked by script.
Deferred until after the test: L23, L24, and book exercises no teacher item needs (moved to `allocation.json` `deferred`, never deleted).

## How every lesson reads
1. A first question answerable by common sense.
2. Per idea (1-3 per lesson): a worked example with small real numbers and every step; the rule in one plain Romanian sentence; the formula with each symbol named in words; one quick check.
3. Core exercises, 2-4, that look like test questions.
Limits: one idea per screen, at most 80 words of learner text outside tables and exercise data, no symbol before words introduce it, at most 2 `reflect` screens.

## Generalized, not trained on one test (Alex's rule)
- Each lesson teaches the method for a type of exercise, so it works on any numbers and any wording of that type.
- Every skill is practised on at least two different examples (different data, size or form, including a case where the answer comes out the other way), and the review variants give new numbers.
- The past tests (Notion archive, T1, T21P, T20a/b, T21T2) only tell which types exist. No lesson uses one past test's numbers as its only example, and no lesson's core is a copy of one test.

## Checks before anything goes live
1. Automatic: validator; content gate (numbers re-evaluated, data on screen, repetition, quiz quality, text sweep, structure, KaTeX, en/ro); the clarity check (lessons with `meta.clarity: 1`); the real-Chrome walk at 390 and 1280, light and dark.
2. One Opus reviewer reads every walk screenshot in order as a beginner with the test in hours, recomputes every number, checks Alex can do the lesson's teacher items and that each skill is practised on two different examples, and fixes everything; then step 1 again.
3. `.scratch/ship.sh`: validate, all tests, build, smoke, walk, push, deploy, live screenshot.

## Usage control
A planner (Opus, once) picks each lesson's core and defers the rest. Per lesson: a Sonnet writer that reuses checked exercise blocks, one Opus reviewer, uploads by script through a Sonnet runner. At most one lesson being written and one being reviewed. No watchers. After lesson 2 is live, Alex reports his weekly %, and the per-lesson cost decides how many lessons fit; if not all fit, cut from the end of the order (L18-L22, then L17, then the tests), never the checks.

## Failures
A lesson that still fails after its review is held back and the next one goes up. Usage cutoffs and network drops resume from the last finished step. Live lessons 1-5 are replaced in order; ids of surviving blocks are kept.
