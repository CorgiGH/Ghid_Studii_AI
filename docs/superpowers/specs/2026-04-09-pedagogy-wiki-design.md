# Pedagogy Wiki Expansion Design

**Date:** 2026-04-09
**Goal:** Create a structured, agent-consumable pedagogy knowledge base in the wiki — 15 technique concept pages + 1 operational playbook, accessible via a new `index-pedagogy.md` sub-index.

## Problem

Pedagogy knowledge is trapped inside the curate skill (~200 lines, ~2,000 tokens loaded monolithically every curation). No other agents can access it. No way to load only the relevant subset.

## Solution

Extract existing pedagogy rules from the curate skill into standalone wiki concept pages. Expand with 4 new research-backed techniques. Create an operational playbook that maps tasks to required reading so Claude loads only what it needs.

## Page Format

Every concept page follows this structure (optimized for Claude, not humans):

```markdown
---
title: [Technique Name]
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# [Technique Name]

**What:** [2-3 sentences]
**Evidence:** [Key citation, effect size]
**Maps to:** [Study guide components that implement this]

## How to Apply
[3-5 actionable bullet points for Claude during curation]

## When NOT to Use
[2-3 bullet points — limitations and failure conditions]

## See Also
[[Related Technique 1]], [[Related Technique 2]]
```

Target: ~30-40 lines per page, ~250 tokens each.

## Page Inventory

### Extracted from curate skill (11 pages)

1. **Retrieval Practice** — Dunlosky HIGH utility, Roediger & Karpicke 2006, d~0.70. Maps to: quiz blocks, Toggle Q&A, CodeChallenge, Section checkboxes. ~40% of content time should be testing.

2. **Productive Failure** — Kapur 2014, d=0.37-0.71. Maps to: pretest think blocks before teaching. Problem must be within "productive" range — not too easy, not impossibly hard.

3. **Cognitive Load Theory** — Sweller 1988, Cowan's ~4 chunks. Maps to: max 3-4 new concepts per step, ≤5 min reading per step, interaction every 5-8 min. Expertise reversal effect for advanced students.

4. **Concrete Before Abstract** — Alfieri et al 2013, d=0.67. Maps to: 2-3 concrete examples FIRST, then general principle. Concreteness fading (Goldstone & Son 2005) is optimal.

5. **Elaborative Interrogation** — Dunlosky MODERATE, d=0.32-0.87. Maps to: think blocks asking "why does this work?" not "what is X?". Requires sufficient prior knowledge — better mid-course than introduction.

6. **Subgoal Labeling** — Margulieux & Guzdial 2015, 15-20% improvement on novel problem solving. Maps to: bold generic labels in worked examples ("Initialize", "Process", "Check termination"). Don't over-label trivial steps.

7. **Trace Before Write** — Lopez/Lister ICER 2008. Hierarchy: trace → explain → write. Maps to: predict-output exercises before write-code exercises. Must pair with explanation tasks to avoid mechanical tracing.

8. **Active Visualization** — Hundhausen et al 2002. Engagement > visual quality. Maps to: manual-advance animations with prediction prompts before each step. Never auto-play. Poorly designed visualizations increase extraneous load.

9. **Misconception-Targeted Distractors** — Little 2012, Porter SIGCSE. Maps to: every wrong quiz option = specific named misconception + elaborated feedback. Requires knowing actual misconceptions from CS education research.

10. **Elaborated Feedback** — Van der Kleij et al 2015, d=0.49 vs verification-only d=0.05. Maps to: 1-3 sentence explanations per quiz option + reviewStep link. Don't overwhelm with feedback on every micro-step.

11. **Spaced Retrieval** — Cepeda et al 2006, Bjork 1994, d=0.42-0.67. Optimal interval = 10-20% of retention interval. Maps to: ~30% of quiz questions reference prior steps (not current). Students prefer massed practice but it's worse.

### New techniques (4 pages)

12. **Interleaving** — Rohrer & Taylor 2007/2010, d=0.60. Dunlosky MODERATE. Mixing problem types forces discrimination. Maps to: mixed practice sets drawing from multiple courses. Use AFTER initial learning — blocking is better for acquisition, interleaving for retention.

13. **Dual Coding** — Paivio 1971, Mayer 2009 multimedia principle d=1.39, contiguity d=1.12. Two retrieval paths (verbal + visual). Maps to: pair code with diagrams, pseudocode with animations. Redundancy principle: visual and verbal must be complementary, not duplicative. No decorative images.

14. **Desirable Difficulties** — Bjork 1994 umbrella framework. Making learning harder improves storage strength. Maps to: spacing, interleaving, testing, generating are all instances. Vary surface features across exercises. Difficulty must be "germane" not "extraneous" (confusing UI is not a desirable difficulty).

15. **Learning Rhythm** — The 5-phase pattern: pretest(think) → concrete(learn+code) → abstraction(learn+definition) → elaboration(think) → retrieval(quiz). This is the operational sequence that ties techniques 1-5 together into a course section structure.

### Operational page (1 page in architecture/)

16. **Pedagogy Playbook** — Task-to-reading routing page. ~50 lines, ~350 tokens.

Sections:
- **When Curating a New Course:** Load [[Learning Rhythm]], [[Cognitive Load Theory]], [[Concrete Before Abstract]]
- **When Writing Quiz Questions:** Load [[Retrieval Practice]], [[Misconception-Targeted Distractors]], [[Elaborated Feedback]], [[Interleaving]]
- **When Designing Code Exercises:** Load [[Trace Before Write]], [[Subgoal Labeling]], [[Productive Failure]]
- **When Adding Visualizations/Animations:** Load [[Active Visualization]], [[Dual Coding]], [[Cognitive Load Theory]]
- **When Reviewing Existing Content:** Load [[Desirable Difficulties]], [[Spaced Retrieval]], [[Elaborative Interrogation]]
- **Quick Reference: Effect Sizes:** Table of all techniques with effect sizes for fast comparison

## Index Integration

Create `wiki/index-pedagogy.md` sub-index. Add to router `wiki/index.md`:
```
- [[index-pedagogy]] — Pedagogy: 15 techniques, 1 playbook
```

## Token Budget

| Scenario | Pages Loaded | Tokens |
|----------|-------------|--------|
| Playbook only (routing) | 1 | ~350 |
| Curating a course | playbook + 3 concepts | ~1,100 |
| Writing quizzes | playbook + 4 concepts | ~1,350 |
| Full pedagogy load (lint/review) | all 16 pages | ~4,350 |
| Current monolithic (curate skill) | embedded block | ~2,000 |

Typical curation saves ~650 tokens while providing deeper, more targeted knowledge.

## What Does NOT Change

- Curate skill keeps its embedded rules for now (they're execution instructions; wiki pages are the knowledge base). A future task may refactor the skill to reference wiki pages instead, but that's out of scope here.
- No wiki pages move or get renamed
- No code changes
- Existing wikilinks unaffected
