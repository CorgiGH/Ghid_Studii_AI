# Pedagogy Wiki Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 15 evidence-based pedagogy concept pages + 1 operational playbook in the wiki, accessible via a new `index-pedagogy.md` sub-index.

**Architecture:** Each concept page follows the agent-optimized format (frontmatter + What/Evidence/Maps to + How to Apply + When NOT to Use + See Also). A Pedagogy Playbook routes agents to the right subset of pages by task type. All files go in the existing `wiki/` directory (gitignored). Only the plan doc itself is committed.

**Tech Stack:** Markdown files only.

---

### Task 1: Create core retrieval/testing concept pages (3 pages)

**Files:**
- Create: `wiki/concepts/Retrieval Practice.md`
- Create: `wiki/concepts/Spaced Retrieval.md`
- Create: `wiki/concepts/Desirable Difficulties.md`

- [ ] **Step 1: Create Retrieval Practice page**

Write `wiki/concepts/Retrieval Practice.md`:

```markdown
---
title: Retrieval Practice
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Retrieval Practice

**What:** Actively recalling information from memory rather than passively re-reading. The act of retrieval itself strengthens memory traces and creates additional retrieval routes. Dunlosky et al. (2013) rated it HIGH utility across all learning conditions.
**Evidence:** Roediger & Karpicke (2006) — students who took practice tests retained 80% after one week vs 36% for re-readers (d ~ 0.70). Karpicke et al. (2009) — 84% of students prefer re-reading despite testing being 2-3x more effective (fluency illusion).
**Maps to:** quiz blocks, Toggle Q&A, CodeChallenge, Section checkboxes, MultipleChoice components.

## How to Apply
- Target ~40% of content time as testing/retrieval, not passive reading
- Aim for 3 successful retrievals per key concept across a course
- Section checkboxes should reflect retrieval practice completed, not content viewed
- Use varied question formats (MC, code trace, code write, terminal) to prevent pattern-matching
- Include questions at all Bloom levels: Remember, Understand, Apply, Analyze — not just recall

## When NOT to Use
- Pure fact-recall questions miss higher-order thinking — vary question types
- Low utility for transfer to novel problem formats unless practice includes varied formats
- Don't test concepts that haven't been taught yet (that's [[Productive Failure]], a different technique)

## See Also
[[Spaced Retrieval]], [[Desirable Difficulties]], [[Misconception-Targeted Distractors]], [[Elaborated Feedback]]
```

- [ ] **Step 2: Create Spaced Retrieval page**

Write `wiki/concepts/Spaced Retrieval.md`:

```markdown
---
title: Spaced Retrieval
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Spaced Retrieval

**What:** Distributing practice over time rather than massing it. Optimal inter-study interval is 10-20% of the desired retention interval (for a semester exam, space study sessions days apart). Students strongly prefer massed practice but it produces worse outcomes.
**Evidence:** Cepeda et al. (2006) mega-analysis of 254 studies, d = 0.42-0.67. Bjork (1994) framed this within desirable difficulties. Koriat & Bjork (2005) — students predict massed items will be remembered better, but score worse.
**Maps to:** Cross-step quiz questions (~30% should reference prior steps), progress ring revisit encouragement, course ordering across weeks.

## How to Apply
- When writing step N quizzes, include 1-2 questions revisiting concepts from steps N-2 or N-3
- ~30% of quiz questions in any step should reference prior steps, not just the current one
- The final step of every course MUST be a comprehensive self-test (8-12 questions) covering all major concepts
- Space similar concept introductions across steps when possible (don't cluster all pointer topics together)

## When NOT to Use
- During initial acquisition of a brand-new concept — some massed practice is needed first
- When concepts have no meaningful relationship to space between (spacing OS with probability theory shows minimal benefit)
- Students will resist spaced practice because it feels harder — this is expected and correct

## See Also
[[Retrieval Practice]], [[Interleaving]], [[Desirable Difficulties]]
```

- [ ] **Step 3: Create Desirable Difficulties page**

Write `wiki/concepts/Desirable Difficulties.md`:

```markdown
---
title: Desirable Difficulties
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Desirable Difficulties

**What:** Robert Bjork's umbrella framework: conditions that make learning more effortful during encoding lead to better long-term retention and transfer, even though they reduce apparent performance during learning. Retrieval strength (current accessibility) and storage strength (durability) are dissociated — easy learning maximizes retrieval strength but not storage strength.
**Evidence:** Bjork & Bjork (2011) "new theory of disuse." Specific instances: spacing > massing, interleaving > blocking, testing > re-reading, generating > reading, varying conditions > constant.
**Maps to:** Pretesting ([[Productive Failure]]), retrieval practice, spaced retrieval, interleaving, varied exercise formats (code trace → MC → CodeChallenge → TerminalChallenge for same concept).

## How to Apply
- Vary surface features across exercises — present the same fork() concept as a code trace, then MC, then CodeChallenge, then TerminalChallenge
- Introduce "transfer challenges" requiring applying a concept from one course to a different context (scheduling concepts applied to disk I/O scheduling)
- Delay feedback by one attempt where appropriate — show "incorrect, try again" before revealing the answer
- Normalize difficulty with messaging — struggle is expected and productive, not a sign of failure

## When NOT to Use
- When difficulty is "extraneous" not "germane" — confusing UI, ambiguous instructions, poor formatting are NOT desirable difficulties
- For complete novices with zero prior knowledge — they need direct instruction first, then desirable difficulties
- For low-confidence learners who may interpret productive struggle as evidence of inability without growth mindset support

## See Also
[[Productive Failure]], [[Retrieval Practice]], [[Spaced Retrieval]], [[Interleaving]]
```

---

### Task 2: Create learning sequence concept pages (3 pages)

**Files:**
- Create: `wiki/concepts/Productive Failure.md`
- Create: `wiki/concepts/Concrete Before Abstract.md`
- Create: `wiki/concepts/Learning Rhythm.md`

- [ ] **Step 1: Create Productive Failure page**

Write `wiki/concepts/Productive Failure.md`:

```markdown
---
title: Productive Failure
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Productive Failure

**What:** Presenting a problem before instruction so learners struggle, generate incorrect solutions, then receive the canonical explanation. Even failed attempts prime knowledge structures via the "generation effect." Also called pretesting.
**Evidence:** Kapur (2014) meta-analysis: d = 0.37-0.71 depending on domain. The effect is stronger when the problem is within "productive" range — not trivially easy, not impossibly hard.
**Maps to:** Pretest think blocks placed BEFORE teaching. CodeChallenge problems before the explanatory Section. Toggle components with "Try to answer before revealing."

## How to Apply
- Start each major concept with a think block posing a challenge the student can't yet answer
- Example: "How would you prevent two processes from corrupting shared memory?" before teaching mutexes
- The problem must connect to upcoming content — random hard questions don't help
- Correct instruction MUST follow the struggle — productive failure without resolution is just failure

## When NOT to Use
- When the gap between prior knowledge and problem is too large (learners disengage rather than productively struggle)
- When correct instruction never follows — the failure is only productive if the explanation comes after
- For purely procedural skills where there's nothing to "discover" (e.g., syntax rules)

## See Also
[[Learning Rhythm]], [[Desirable Difficulties]], [[Elaborative Interrogation]]
```

- [ ] **Step 2: Create Concrete Before Abstract page**

Write `wiki/concepts/Concrete Before Abstract.md`:

```markdown
---
title: Concrete Before Abstract
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Concrete Before Abstract

**What:** Teaching with specific examples before introducing general principles. Learners build mental models from instances, then abstract the pattern. The optimal approach is "concreteness fading" — start concrete, gradually abstract.
**Evidence:** Alfieri et al. (2013) meta-analysis: d = 0.67 when concrete examples precede formal rules. Goldstone & Son (2005) confirmed concreteness fading as optimal.
**Maps to:** learn + code blocks showing real examples FIRST, then learn + definition blocks for formal terms. LinuxTerminal exercises grounding abstractions in executable reality.

## How to Apply
- Show 2-3 varied concrete examples FIRST, then state the general principle
- Never lead with a pure abstract definition — always anchor to a specific instance
- Vary surface features across examples but keep the same deep structure
- For OS: show a real terminal command/output first, then explain the underlying concept
- For OOP: show a concrete class example before discussing inheritance rules

## When NOT to Use
- If only concrete examples are given without explicit abstraction, transfer is poor — always follow up with the general principle
- For expert audiences who already have the abstract framework and need specifics
- When the concrete example requires more domain knowledge than the abstraction itself

## See Also
[[Learning Rhythm]], [[Cognitive Load Theory]], [[Dual Coding]]
```

- [ ] **Step 3: Create Learning Rhythm page**

Write `wiki/concepts/Learning Rhythm.md`:

```markdown
---
title: Learning Rhythm
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Learning Rhythm

**What:** The 5-phase pattern that structures every course section. Ties together multiple pedagogy techniques into a repeatable sequence that maximizes retention and understanding.
**Evidence:** Synthesized from Kapur 2014, Alfieri 2013, Dunlosky 2013, Roediger & Karpicke 2006. Each phase maps to a specific research-backed technique.
**Maps to:** The overall structure of every course section in the study guide. Defines which block types appear in what order.

## The 5 Phases

**Phase 1 — Pretest (productive failure, Kapur 2014):**
Start with a `think` block posing a challenge the student can't yet answer. Primes the brain for the upcoming explanation.

**Phase 2 — Concrete first (Alfieri 2013):**
Show 2-3 concrete examples via `learn` + `code` blocks. Vary surface features, keep same deep structure. Include traced execution for algorithms (Lopez/Lister ICER). Use `callout variant="trap"` to flag 2-3 common misconceptions.

**Phase 3 — Abstraction:**
State the general principle in a `learn` block, followed by `definition` blocks for formal terms. Student already has concrete anchors from Phase 2.

**Phase 4 — Elaboration (Dunlosky MODERATE):**
Insert a `think` block with a causal/comparative question: "Why does X work here but not Y?", "What would break if we removed Z?", "How does this connect to [earlier concept]?"

**Phase 5 — Retrieval practice (Dunlosky HIGH):**
End with a `quiz` block. Target 60-80% success rate (Bjork 1994). Misconception-based distractors. Each option gets 1-3 sentence elaborated feedback + reviewStep link. ~30% of questions should revisit prior steps ([[Spaced Retrieval]]).

## How to Apply
- Every course section follows this 5-phase sequence
- Phases can repeat within a section if multiple concepts are covered (nest mini-rhythms)
- The final step of every course is a comprehensive retrieval quiz (8-12 questions across all concepts)

## When NOT to Use
- For purely reference content (API docs, command references) — these are lookup, not learning
- When the concept is simple enough that Phase 1 pretest would be trivial

## See Also
[[Productive Failure]], [[Concrete Before Abstract]], [[Elaborative Interrogation]], [[Retrieval Practice]]
```

---

### Task 3: Create cognitive design concept pages (3 pages)

**Files:**
- Create: `wiki/concepts/Cognitive Load Theory.md`
- Create: `wiki/concepts/Dual Coding.md`
- Create: `wiki/concepts/Subgoal Labeling.md`

- [ ] **Step 1: Create Cognitive Load Theory page**

Write `wiki/concepts/Cognitive Load Theory.md`:

```markdown
---
title: Cognitive Load Theory
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Cognitive Load Theory

**What:** Working memory holds ~4 chunks (Cowan 2001). Three load types: intrinsic (inherent complexity), extraneous (poor design), and germane (schema building). Learning fails when total load exceeds capacity. Design should minimize extraneous load and optimize germane load.
**Evidence:** Sweller (1988) foundational theory. Kalyuga et al. (2003) expertise reversal effect — scaffolding that helps novices becomes redundant overhead for experts.
**Maps to:** Max 3-4 new concepts per step. Each step ≤5 min reading. Interaction every 5-8 min of content. Collapsible Section/CourseBlock structure. Box components chunking information by type.

## How to Apply
- Limit each step to 3-4 new concepts maximum
- Each step should take ≤5 minutes to read
- Insert an interactive element (quiz, think, code challenge) every 5-8 minutes of content
- Use Box components (definition, formula, warning) to chunk related information
- Place code + explanation side-by-side to reduce split-attention effect
- Hide non-current content with collapsible sections to reduce visual noise

## When NOT to Use
- The expertise reversal effect: scaffolding that helps beginners hurts experts
- Don't over-scaffold advanced topics for advanced students — it adds extraneous load
- The redundancy effect: presenting identical information in two formats (e.g., narrating the exact text on screen) increases load

## See Also
[[Dual Coding]], [[Subgoal Labeling]], [[Active Visualization]]
```

- [ ] **Step 2: Create Dual Coding page**

Write `wiki/concepts/Dual Coding.md`:

```markdown
---
title: Dual Coding
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Dual Coding

**What:** Presenting information in both verbal (text/code) and visual (diagrams/animations) channels simultaneously. Memory has separate verbal and imaginal systems; encoding in both creates two retrieval paths. Visual and verbal must be complementary, not duplicative.
**Evidence:** Paivio (1971) dual coding theory. Mayer (2009) — multimedia principle d = 1.39 (words + pictures > words alone), contiguity principle d = 1.12 (integrated > separated), redundancy principle (don't duplicate across channels).
**Maps to:** Code blocks paired with diagrams. Pseudocode alongside step-by-step animations. Memory management courses pairing page table code with visual memory maps.

## How to Apply
- Pair every major code block with a corresponding diagram where the concept has spatial structure
- For OS process scheduling: code showing the process struct alongside a Gantt chart
- For OOP inheritance: class definition alongside UML diagram
- For algorithms: pseudocode alongside animation of data structure state
- Visual and verbal must be COMPLEMENTARY — show different aspects of the same concept, not identical information in two formats

## When NOT to Use
- When the visual is purely decorative (stock photos, irrelevant icons) — "seductive details" effect (Harp & Mayer 1998) hurts learning
- When content is simple enough that a single channel suffices ("variables are named storage locations" needs no diagram)
- When the visual requires its own learning curve to interpret (complex UML before students know UML notation)
- The redundancy principle: reading aloud the exact same text shown on screen increases load

## See Also
[[Cognitive Load Theory]], [[Active Visualization]], [[Concrete Before Abstract]]
```

- [ ] **Step 3: Create Subgoal Labeling page**

Write `wiki/concepts/Subgoal Labeling.md`:

```markdown
---
title: Subgoal Labeling
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Subgoal Labeling

**What:** Explicitly labeling the purpose of each step in a worked example with bold generic labels ("Initialize", "Process", "Check termination") that transfer to related problems. Helps learners see the problem-solving structure, not just the specific code.
**Evidence:** Margulieux & Guzdial (2015, SIGCSE) — 15-20% improvement on novel problem solving for CS learners. Catrambone (1998) foundational work on subgoal learning.
**Maps to:** Code block inline comments marking subgoals. Section component titles as subgoal labels for course structure. CodeChallenge solutions with labeled steps.

## How to Apply
- Every worked example must have bold generic labels as code comments
- Labels must be generic enough to transfer: "// Initialize data structure" not "// Create array of size n"
- Use consistent labeling vocabulary across courses — same subgoal gets the same label
- Labels correspond to meaningful conceptual chunks, not individual lines of code

## When NOT to Use
- Don't over-label trivial steps — "// Declare variable" adds extraneous load without benefit
- Don't use domain-specific labels that won't transfer to other problems
- For expert audiences who already recognize the problem-solving structure

## See Also
[[Trace Before Write]], [[Cognitive Load Theory]], [[Concrete Before Abstract]]
```

---

### Task 4: Create exercise design concept pages (3 pages)

**Files:**
- Create: `wiki/concepts/Trace Before Write.md`
- Create: `wiki/concepts/Active Visualization.md`
- Create: `wiki/concepts/Elaborative Interrogation.md`

- [ ] **Step 1: Create Trace Before Write page**

Write `wiki/concepts/Trace Before Write.md`:

```markdown
---
title: Trace Before Write
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Trace Before Write

**What:** Having students trace through existing code execution before writing their own. The reading hierarchy is: trace → explain → write. Students who cannot trace cannot write correct code. Tracing builds the mental execution model that writing requires.
**Evidence:** Lopez & Lister (ICER 2008) established the hierarchy. Replicated across multiple CS education studies. The "explain" step (articulating why code works) bridges trace and write.
**Maps to:** Predict-output exercises before write-code exercises. LinuxTerminal "what will this command output?" before "write a command that does X." CodeChallenge trace-mode questions preceding write-mode.

## How to Apply
- For code/algorithms: show full traced execution on a concrete input before asking students to write
- Sequence within a section: trace exercise → explain exercise → write exercise
- Use concrete inputs with specific values, not abstract variables
- Include the full execution trace (every loop iteration, every recursive call) for complex algorithms

## When NOT to Use
- Can become mechanical if students memorize trace patterns without understanding the model
- Must pair with explanation tasks ("why does this loop terminate?") to prevent rote tracing
- For very simple code where tracing is trivially obvious

## See Also
[[Subgoal Labeling]], [[Concrete Before Abstract]], [[Active Visualization]]
```

- [ ] **Step 2: Create Active Visualization page**

Write `wiki/concepts/Active Visualization.md`:

```markdown
---
title: Active Visualization
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Active Visualization

**What:** Learner-engaged visualizations where the student predicts, constructs, or modifies visual representations rather than passively watching. Engagement quality matters more than visual quality. Watching without predicting is passive and ineffective.
**Evidence:** Hundhausen et al. (2002) meta-analysis of algorithm visualization — engagement is the key variable, not visual sophistication. Students who predict outcomes before each step learn significantly more.
**Maps to:** Manual-advance animation components with prediction prompts. StepPlayer with prediction gates. V86Terminal where students execute and observe. Interactive CodeChallenge with live output.

## How to Apply
- Animations MUST be manual-advance (step-by-step), never auto-play
- Insert a prediction prompt BEFORE each animation step: "What will the next state be?"
- The visualization must be integral to the learning task, not decorative
- For sorting algorithms: student predicts which elements swap next
- For process scheduling: student predicts which process runs next in the Gantt chart

## When NOT to Use
- Poorly designed visualizations increase extraneous load — keep visual design clean and focused
- Decorative animations that don't relate to the learning objective are harmful
- When the concept has no meaningful spatial/temporal structure to visualize

## See Also
[[Dual Coding]], [[Cognitive Load Theory]], [[Trace Before Write]]
```

- [ ] **Step 3: Create Elaborative Interrogation page**

Write `wiki/concepts/Elaborative Interrogation.md`:

```markdown
---
title: Elaborative Interrogation
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Elaborative Interrogation

**What:** Prompting learners to explain "why" a fact or concept is true. Forces deeper processing by connecting new information to existing knowledge. The key is causal/comparative questions, not definitional recall.
**Evidence:** Dunlosky (2013) rated MODERATE utility, d = 0.32-0.87 depending on domain and prior knowledge. Effect is stronger when learners have sufficient background to generate explanations.
**Maps to:** think blocks asking "why does this work?" or "how does this differ from X?" — never "what is X?" (that's recall, not elaboration).

## How to Apply
- Think blocks must ask causal or comparative questions:
  - "Why does round-robin use a time quantum rather than running to completion?"
  - "What would break if we removed the virtual keyword?"
  - "How does this connect to [earlier concept]?"
- Place AFTER teaching (Phase 4 of [[Learning Rhythm]]), not before
- The question must require connecting the new concept to prior knowledge

## When NOT to Use
- Requires sufficient prior knowledge — novices with no background cannot elaborate meaningfully
- Better mid-course than at introduction of a brand new topic
- Don't confuse with recall questions — "What is a mutex?" is recall, "Why is a mutex needed instead of just disabling interrupts?" is elaboration

## See Also
[[Learning Rhythm]], [[Productive Failure]], [[Retrieval Practice]]
```

---

### Task 5: Create assessment concept pages (3 pages)

**Files:**
- Create: `wiki/concepts/Misconception-Targeted Distractors.md`
- Create: `wiki/concepts/Elaborated Feedback.md`
- Create: `wiki/concepts/Interleaving.md`

- [ ] **Step 1: Create Misconception-Targeted Distractors page**

Write `wiki/concepts/Misconception-Targeted Distractors.md`:

```markdown
---
title: Misconception-Targeted Distractors
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Misconception-Targeted Distractors

**What:** Multiple-choice distractors based on documented student misconceptions rather than random wrong answers. Each wrong option represents a specific, named error that real students make. Triggers retrieval and correction of the misconception.
**Evidence:** Little et al. (2012) — plausible distractors trigger active misconception correction. Porter et al. (SIGCSE) developed peer-instruction concept inventories for CS with empirically validated distractors.
**Maps to:** MultipleChoice quiz components where every wrong option = specific named misconception + elaborated feedback explaining the error.

## How to Apply
- Every wrong quiz option must represent a specific, named student misconception
- Common CS misconceptions to target: off-by-one errors, pointer/value confusion, fork() return value misunderstanding, pass-by-reference vs pass-by-value, scope/lifetime confusion
- Each distractor gets its own explanation field (2-3 sentences) addressing WHY that specific error is wrong
- Use 3-4 options per quiz (not 5), targeting 60-80% success rate (Bjork 1994)
- Draw from published CS concept inventories where available

## When NOT to Use
- When you don't know the actual misconceptions — generic wrong answers provide no diagnostic value
- For open-ended questions where misconceptions don't map to discrete options
- When the concept is too simple to have meaningful misconceptions

## See Also
[[Elaborated Feedback]], [[Retrieval Practice]], [[Interleaving]]
```

- [ ] **Step 2: Create Elaborated Feedback page**

Write `wiki/concepts/Elaborated Feedback.md`:

```markdown
---
title: Elaborated Feedback
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Elaborated Feedback

**What:** Feedback that explains why an answer is correct or incorrect, not just "right/wrong." The explanation bridges the gap between current and target understanding. Immediate, elaborated feedback massively outperforms verification-only feedback.
**Evidence:** Van der Kleij et al. (2015) meta-analysis: elaborated feedback d = 0.49 vs verification-only d = 0.05. The 10x difference in effect size makes this one of the highest-leverage design decisions.
**Maps to:** Quiz option explanation fields (1-3 sentences per option), CodeChallenge result displays showing expected vs actual output + conceptual error explanation, Toggle answer reveals, reviewStep links.

## How to Apply
- Every quiz option MUST have an explanation field (2-3 sentences)
- Wrong-answer explanations address the specific misconception: "This would be correct if fork() returned the child's PID to both processes, but it returns 0 to the child."
- Correct-answer explanations reinforce WHY it's right, not just confirm it
- Include a reviewStep link to the step ID where the concept is taught
- For CodeChallenge: show expected vs actual output AND explain the conceptual error

## When NOT to Use
- Overwhelming feedback on every micro-step causes cognitive overload — reserve for checkpoints
- Slightly delayed feedback can be more effective than instant (lets student self-correct first)
- For expert practice where the learner should develop their own error-detection skills

## See Also
[[Misconception-Targeted Distractors]], [[Retrieval Practice]], [[Cognitive Load Theory]]
```

- [ ] **Step 3: Create Interleaving page**

Write `wiki/concepts/Interleaving.md`:

```markdown
---
title: Interleaving
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Interleaving

**What:** Mixing different problem types within a single practice session rather than practicing one type at a time ("blocking"). Forces learners to discriminate between problem types and select appropriate strategies — a critical skill that blocking never develops.
**Evidence:** Rohrer & Taylor (2007) — interleaved math practice: 43% correct on delayed test vs 20% for blocked. Taylor & Rohrer (2010) replicated, d = 0.60. Dunlosky (2013) rated MODERATE utility.
**Maps to:** Mixed practice sets drawing from multiple courses. Practice tab questions mixing topics. CodeChallenge sets mixing fork() with pipe() with signal() problems.

## How to Apply
- Create "Mixed Practice" question sets that draw from multiple courses or topics
- Students must first identify WHICH concept applies before solving: "Is this a scheduling or memory management problem?"
- For algorithms (PA): interleave sorting with graph problems — student must identify which algorithm applies
- ~30% of practice questions in later courses should reference earlier course material
- Interleaving is for PRACTICE, not initial instruction — teach each concept separately first

## When NOT to Use
- During initial learning of a new concept — blocking is better for acquisition, interleaving for retention/discrimination
- If a student has never seen semaphores, don't interleave semaphore questions with mutex questions yet
- When problem types are too dissimilar (interleaving OS with probability theory shows minimal benefit — no useful discrimination to learn)

## See Also
[[Spaced Retrieval]], [[Desirable Difficulties]], [[Retrieval Practice]]
```

---

### Task 6: Create the Pedagogy Playbook

**Files:**
- Create: `wiki/architecture/Pedagogy Playbook.md`

- [ ] **Step 1: Create the playbook**

Write `wiki/architecture/Pedagogy Playbook.md`:

```markdown
---
title: Pedagogy Playbook
type: architecture
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Pedagogy Playbook

Operational routing page for Claude agents. Read this first, then load only the pages relevant to your current task.

## When Curating a New Course
Load: [[Learning Rhythm]], [[Cognitive Load Theory]], [[Concrete Before Abstract]]
- Follow the 5-phase rhythm for every section
- Keep steps to 3-4 concepts, ≤5 min reading each
- Lead with concrete examples, abstract after

## When Writing Quiz Questions
Load: [[Retrieval Practice]], [[Misconception-Targeted Distractors]], [[Elaborated Feedback]], [[Interleaving]]
- Every option needs elaborated feedback (2-3 sentences)
- Every distractor = a named misconception
- 3-4 options, target 60-80% success rate
- ~30% of questions should revisit prior steps

## When Designing Code Exercises
Load: [[Trace Before Write]], [[Subgoal Labeling]], [[Productive Failure]]
- Sequence: trace → explain → write
- Label subgoals with generic transferable labels
- Place challenge before explanation for productive failure

## When Adding Visualizations or Animations
Load: [[Active Visualization]], [[Dual Coding]], [[Cognitive Load Theory]]
- Manual-advance only, never auto-play
- Prediction prompt before each step
- Pair code with complementary (not duplicative) visuals

## When Reviewing Existing Content
Load: [[Desirable Difficulties]], [[Spaced Retrieval]], [[Elaborative Interrogation]]
- Check: does content vary exercise formats across the course?
- Check: do quizzes reference prior steps (~30%)?
- Check: are think blocks asking "why/how" not "what"?

## Quick Reference: Effect Sizes

| Technique | d | Source |
|---|---|---|
| Dual Coding (multimedia) | 1.39 | Mayer 2009 |
| Contiguity (integrated layout) | 1.12 | Mayer 2009 |
| Retrieval Practice | 0.70 | Roediger & Karpicke 2006 |
| Concrete Before Abstract | 0.67 | Alfieri et al. 2013 |
| Interleaving | 0.60 | Taylor & Rohrer 2010 |
| Elaborated Feedback | 0.49 | Van der Kleij 2015 |
| Spacing Effect | 0.42-0.67 | Cepeda et al. 2006 |
| Productive Failure | 0.37-0.71 | Kapur 2014 |
| Elaborative Interrogation | 0.32-0.87 | Dunlosky 2013 |

## See Also
[[Platform Status]], [[Content Redesign]], [[JSON Pipeline]]
```

---

### Task 7: Create index-pedagogy.md and update router

**Files:**
- Create: `wiki/index-pedagogy.md`
- Modify: `wiki/index.md`
- Modify: `wiki/log.md`

- [ ] **Step 1: Create the pedagogy sub-index**

Write `wiki/index-pedagogy.md`:

```markdown
---
title: Pedagogy Index
type: architecture
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [pedagogy]
---

# Pedagogy Index

## Playbook

- [[Pedagogy Playbook]] — Task-to-reading routing page for agents (load this first)

## Techniques

- [[Retrieval Practice]] — Testing > re-reading, d~0.70 (Dunlosky HIGH)
- [[Spaced Retrieval]] — Distribute practice over time, d=0.42-0.67 (Cepeda 2006)
- [[Desirable Difficulties]] — Harder encoding = stronger retention (Bjork umbrella)
- [[Productive Failure]] — Challenge before instruction, d=0.37-0.71 (Kapur 2014)
- [[Concrete Before Abstract]] — Examples first, then principles, d=0.67 (Alfieri 2013)
- [[Learning Rhythm]] — 5-phase pattern: pretest → concrete → abstract → elaborate → retrieve
- [[Cognitive Load Theory]] — ~4 chunks in working memory, minimize extraneous load (Sweller 1988)
- [[Dual Coding]] — Verbal + visual = two retrieval paths, d=1.39 (Mayer 2009)
- [[Subgoal Labeling]] — Generic step labels in worked examples, +15-20% transfer (Margulieux 2015)
- [[Trace Before Write]] — Trace → explain → write hierarchy (Lopez/Lister ICER 2008)
- [[Active Visualization]] — Predict-then-see, manual-advance only (Hundhausen 2002)
- [[Elaborative Interrogation]] — "Why" questions, d=0.32-0.87 (Dunlosky MODERATE)
- [[Misconception-Targeted Distractors]] — Named errors as quiz options (Little 2012, Porter SIGCSE)
- [[Elaborated Feedback]] — Explain why right/wrong, d=0.49 vs 0.05 verification-only (Van der Kleij 2015)
- [[Interleaving]] — Mix problem types for discrimination, d=0.60 (Rohrer & Taylor 2010)
```

- [ ] **Step 2: Update router index.md**

In `wiki/index.md`, add the pedagogy line to the Domains section:

```markdown
- [[index-pedagogy]] — Pedagogy: 15 techniques, 1 playbook
```

Update Quick Stats total pages from 49 to 66 (49 + 15 concepts + 1 playbook + 1 sub-index).

- [ ] **Step 3: Update log.md**

Update the Summary header in `wiki/log.md`:
- Change total operations to 8
- Change last operation to: `2026-04-09 — Pedagogy wiki expansion`
- Add `Pedagogy (15 techniques, 1 playbook)` to domains touched

Append new entry at bottom:

```markdown
## [2026-04-09] expand | Pedagogy wiki expansion
- Created 15 pedagogy concept pages from research (Dunlosky, Roediger, Kapur, Mayer, Sweller, Bjork, etc.)
- Created [[Pedagogy Playbook]] operational routing page in architecture/
- Created [[index-pedagogy]] sub-index
- Updated router [[Wiki Index|index.md]]
- Techniques: Retrieval Practice, Spaced Retrieval, Desirable Difficulties, Productive Failure, Concrete Before Abstract, Learning Rhythm, Cognitive Load Theory, Dual Coding, Subgoal Labeling, Trace Before Write, Active Visualization, Elaborative Interrogation, Misconception-Targeted Distractors, Elaborated Feedback, Interleaving
```

- [ ] **Step 4: Verify**

```bash
ls wiki/concepts/Retrieval\ Practice.md wiki/concepts/Interleaving.md wiki/concepts/Learning\ Rhythm.md wiki/architecture/Pedagogy\ Playbook.md wiki/index-pedagogy.md
```

Expected: all 5 files exist (spot check — full 15 concepts were created in Tasks 1-5).

```bash
grep -c '^\- \[\[' wiki/index-pedagogy.md
```

Expected: 16 (1 playbook + 15 techniques).
