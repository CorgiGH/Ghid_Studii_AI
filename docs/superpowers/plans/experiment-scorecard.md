# Workflow Comparison Scorecard

## Scoring Key
- **Correctness (C):** 10 minus number of errors (floor 1)
- **Completeness (K):** 10 x percentage of deliverables met
- **Tokens (T):** Normalized — lowest = 10, others proportional
- **Interventions (I):** 10 minus number of human interventions (floor 1)

## Run Log

| Run | System | Task | C | K | Tokens (raw) | I | Notes |
|-----|--------|------|:-:|:-:|:------------:|:-:|-------|
| 1 | Control | Curate | 1 | 8 | 56K | 10 | 12 code blocks use `content` instead of `code` field — would render empty |
| 2 | Control | Review | 9 | 10 | 53K | 10 | 28 issues found across all 5 categories |
| 3 | Control | Extract | 10 | 9 | 28K | 10 | 4 questions, valid JSON. Duration guessed (not in PDF) |
| 4 | Control | Develop | 10 | 10 | 27K | 10 | CodeTracingQuestion created, build passes |
| 5 | Enhanced | Curate | 10 | 10 | 60K | 10 | 0 errors — validation scripts caught field naming during creation |
| 6 | Enhanced | Review | 9 | 10 | 59K | 10 | 22 issues found across all 5 categories |
| 7 | Enhanced | Extract | 10 | 9 | 35K | 10 | 4 questions, valid JSON, validations pass. Duration guessed |
| 8 | Enhanced | Develop | 10 | 10 | 34K | 10 | CodeTracingQuestion created, validations pass, build passes |
| 9 | Ruflo | Curate | 1 | 8 | 58K | 10 | 10 code blocks use `content` instead of `code` — same bug as Control |
| 10 | Ruflo | Review | 9 | 10 | 57K | 10 | 23 issues found across all 5 categories |
| 11 | Ruflo | Extract | 10 | 9 | 30K | 10 | 4 questions, valid JSON. Duration guessed |
| 12 | Ruflo | Develop | 10 | 10 | 31K | 10 | CodeTracingQuestion created, build passes. No ruflo features used |

## Normalized Token Scores

Per-task normalization (lowest = 10, others proportional):

| Task | Control (raw) | Control (norm) | Enhanced (raw) | Enhanced (norm) | Ruflo (raw) | Ruflo (norm) |
|------|:------------:|:--------------:|:--------------:|:---------------:|:-----------:|:------------:|
| Curate | 56K | **10.0** | 60K | 9.3 | 58K | 9.7 |
| Review | 53K | **10.0** | 59K | 9.0 | 57K | 9.3 |
| Extract | 28K | **10.0** | 35K | 8.0 | 30K | 9.3 |
| Develop | 27K | **10.0** | 34K | 7.9 | 31K | 8.7 |

## Aggregate Scores

| System | Curate | Review | Extract | Develop | Total | Avg |
|--------|:------:|:------:|:-------:|:-------:|:-----:|:---:|
| Control | 29.0 | 39.0 | 39.0 | 40.0 | **147.0** | 36.8 |
| Enhanced | 39.3 | 38.0 | 37.0 | 37.9 | **152.2** | 38.1 |
| Ruflo | 28.7 | 38.3 | 38.3 | 38.7 | **144.0** | 36.0 |

### Per-Task Breakdown (C + K + T + I)

| System | Curate | Review | Extract | Develop |
|--------|--------|--------|---------|---------|
| Control | 1+8+10+10=29 | 9+10+10+10=39 | 10+9+10+10=39 | 10+10+10+10=40 |
| Enhanced | 10+10+9.3+10=39.3 | 9+10+9+10=38 | 10+9+8+10=37 | 10+10+7.9+10=37.9 |
| Ruflo | 1+8+9.7+10=28.7 | 9+10+9.3+10=38.3 | 10+9+9.3+10=38.3 | 10+10+8.7+10=38.7 |

## Qualitative Observations

### Control
- Fastest token usage across all 4 tasks (lowest overhead)
- Critical flaw: code blocks used wrong field name (`content` instead of `code`) in Curate — would cause 12 empty code blocks at render time
- Without validation, this bug would only be caught during manual testing
- Review and Extract outputs were solid with no structural issues
- Develop task was clean — correct component architecture, build passes

### Enhanced
- **Only system with zero validation errors** across all outputs
- Validation scripts caught the `code` field naming issue that both Control and Ruflo missed
- ~20% higher token usage due to validation overhead (reading CLAUDE.md rules, running scripts, self-review)
- The token cost pays for itself: catching 12 broken code blocks before commit saves significant debugging time
- Review found fewer issues (22 vs 28) but all were well-categorized and actionable

### Ruflo
- **No ruflo features were used in any of the 4 runs** — all agents reported the tasks were "straightforward enough to complete directly"
- Performed identically to Control in terms of quality (same code block bug in Curate)
- Slightly higher token usage than Control due to reading ruflo's extended CLAUDE.md
- The 98 agents, 30 skills, and MCP server added no value for these task types
- Ruflo's value proposition (multi-agent orchestration, Q-learning routing) never activated

## Abort Log
- No aborts. Ruflo installed successfully on Windows and doctor passed (9/14, 5 non-critical warnings).
- However, ruflo's features were functionally unused — the subagents treated it as a vanilla worktree.

## Decision

**Winner: Enhanced Pipeline (152.2/160)**

The Enhanced Pipeline wins primarily because of **correctness on the Curate task** — its validation scripts caught a critical field-naming bug that both Control and Ruflo missed. This single bug would have broken 12 code blocks at render time.

**Recommendation:**
- **Adopt Enhanced Pipeline** — merge validation scripts and CLAUDE.md rules into main
- **Reject Ruflo** — adds complexity (115 files, 98 agents) with zero measurable benefit for this project's task types. No ruflo feature was actually used in any run.
- **Control remains viable** for quick/simple tasks where validation overhead isn't justified

**Outputs to merge:** Enhanced worktree's course-01.json and tp1-2023-2024-v1.json (both validated, zero errors).
