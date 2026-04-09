# UX/UI Wiki Vault Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a 28-page research-backed UX/UI knowledge base in the wiki with a holistic audit playbook and a cross-domain pedagogy arbiter page.

**Architecture:** Wiki-only content (no code changes). 28 concept pages in `wiki/concepts/` following the pedagogy vault format (What/Evidence/Maps-to + How to Apply + Pitfalls + See Also). Two architecture pages (UX Playbook, Design Principles). One sub-index. All cross-referenced with wikilinks.

**Tech Stack:** Markdown with YAML frontmatter, Obsidian wikilinks.

**Spec:** `docs/superpowers/specs/2026-04-09-uxui-wiki-vault-design.md`

---

### Task 1: Core Usability Concepts (6 pages)

**Files:**
- Create: `wiki/concepts/Nielsen's 10 Heuristics.md`
- Create: `wiki/concepts/Fitts's Law.md`
- Create: `wiki/concepts/Hick's Law.md`
- Create: `wiki/concepts/Recognition Over Recall.md`
- Create: `wiki/concepts/Error Prevention & Recovery.md`
- Create: `wiki/concepts/Jakob's Law.md`

- [ ] **Step 1: Create Nielsen's 10 Heuristics**

```markdown
---
title: Nielsen's 10 Heuristics
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Nielsen's 10 Heuristics

**What:** Ten general principles for interaction design, developed from factor analysis of 249 usability problems across 11 projects. Not strict rules but broad heuristics — violations correlate strongly with user task failure.
**Evidence:** Nielsen & Molich (1990) originally proposed 9 heuristics; refined to 10 in Nielsen (1994). Heuristic evaluation with 3-5 evaluators finds ~75% of usability problems (Nielsen 1992). The 10: (1) Visibility of system status, (2) Match between system and real world, (3) User control and freedom, (4) Consistency and standards, (5) Error prevention, (6) Recognition rather than recall, (7) Flexibility and efficiency of use, (8) Aesthetic and minimalist design, (9) Help users recognize, diagnose, and recover from errors, (10) Help and documentation.
**Maps to:** Every component in the platform. TopBar (H1: status visibility), Sidebar (H6: recognition), Section checkboxes (H3: user control), palette system (H4: consistency), error boundaries (H9: error recovery), CodeChallenge (H5: error prevention).

## How to Apply
- Use as a quick 10-point pass during any component review
- H1 (system status): every user action must have visible feedback within 100ms
- H4 (consistency): use `var(--theme-*)` tokens, never hardcode colors
- H6 (recognition): show available actions, don't require users to remember them
- H8 (minimalist design): every visual element must earn its place — remove anything that doesn't serve comprehension or navigation

## When NOT to Use / Pitfalls
- Heuristic evaluation is a discount method — it catches surface problems, not deep workflow issues
- Don't use heuristic violations as absolute rules; they're signals to investigate, not automatic failures
- H8 (minimalist) can conflict with pedagogical richness — see [[Design Principles]] for resolution

## See Also
[[Fitts's Law]], [[Hick's Law]], [[Recognition Over Recall]], [[Error Prevention & Recovery]], [[Consistency & Design Tokens]], [[Design Principles]]
```

- [ ] **Step 2: Create Fitts's Law**

```markdown
---
title: Fitts's Law
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Fitts's Law

**What:** The time to acquire a target is a function of the distance to and size of the target: T = a + b × log₂(1 + D/W). Larger, closer targets are faster to click/tap.
**Evidence:** Fitts (1954) original study with stylus pointing tasks. Replicated extensively — ISO 9241-9 standardized the methodology. MacKenzie (1992) refined the formula for 2D pointing. Effect holds for mouse, touch, and eye-gaze input.
**Maps to:** Button sizing (CourseNavigation prev/next), sidebar course item click areas, Section checkbox hit area, mobile touch targets, palette picker circles, TopBar controls.

## How to Apply
- Primary action buttons should be the largest clickable element in their context
- Place frequently-used controls near the current focus area (e.g., "next section" near content bottom)
- Increase click target padding rather than visual size — CSS `padding` extends the hit area without visual bloat
- Edge and corner targets on desktop have effectively infinite size — use this for navigation elements
- Group related actions to minimize cursor travel distance

## When NOT to Use / Pitfalls
- Doesn't account for cognitive decision time (see [[Hick's Law]] for that)
- Making everything huge creates visual noise — balance with [[Whitespace & Density]]
- Touch targets have a minimum floor (44px) regardless of Fitts's calculation — see [[Touch Target Sizing]]

## See Also
[[Touch Target Sizing]], [[Hick's Law]], [[Nielsen's 10 Heuristics]], [[Whitespace & Density]]
```

- [ ] **Step 3: Create Hick's Law**

```markdown
---
title: Hick's Law
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Hick's Law

**What:** Decision time increases logarithmically with the number of choices: RT = a + b × log₂(n). More options = slower decisions, not proportionally but still meaningfully.
**Evidence:** Hick (1952) and Hyman (1953) independently demonstrated the relationship. Replicated across menu design (Norman 1991), web navigation (Zaphiris 2000). The logarithmic relationship means going from 2→4 options adds more delay than 8→10.
**Maps to:** Subject picker card count, ContentTypeBar tab count, palette picker (5 options), quiz MultipleChoice option count (3-4), sidebar course list length, TopBar control density.

## How to Apply
- Keep primary navigation choices to 5-7 options per level
- For long lists (sidebar courses), use grouping and visual hierarchy to create sub-decisions
- Quiz options: 3-4 choices optimal — more than 5 adds decision overhead without pedagogical benefit
- When options must be numerous, provide filtering or search to reduce the effective choice set
- Progressive disclosure reduces perceived choices without removing functionality — see [[Progressive Disclosure]]

## When NOT to Use / Pitfalls
- Applies only to unfamiliar choices — expert users who know what they want aren't slowed by option count
- Don't over-reduce: 1-2 options feels restrictive, not simple. The goal is manageable, not minimal
- Can conflict with [[Interleaving]] (pedagogy) which intentionally varies exercise types — see [[Design Principles]]

## See Also
[[Progressive Disclosure]], [[Recognition Over Recall]], [[Nielsen's 10 Heuristics]], [[Chunking]], [[Design Principles]]
```

- [ ] **Step 4: Create Recognition Over Recall**

```markdown
---
title: Recognition Over Recall
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Recognition Over Recall

**What:** Minimize user memory load by making options, actions, and information visible or easily retrievable. Recognition (seeing and identifying) is cognitively easier than recall (generating from memory).
**Evidence:** Nielsen heuristic #6. Rooted in cognitive psychology: recognition memory is fundamentally stronger than recall (Tulving 1985). In UI studies, menu-driven interfaces consistently outperform command-line for novice users (Shneiderman 1987). Recognition requires only a familiarity signal; recall requires full memory reconstruction.
**Maps to:** Sidebar showing all courses (not requiring users to remember course names), breadcrumbs (showing where you are), ContentTypeBar (showing available tabs), search with suggestions, progress rings (showing completion state without checking).

## How to Apply
- Show all available navigation options — don't hide primary paths behind gestures or memory
- Use breadcrumbs to show current location in hierarchy (Home / Year / Subject / Tab / Item)
- Label icons with text — icon-only buttons require recall of what each icon means
- Show recent/in-progress items prominently (resume banner on CourseMap)
- Provide contextual help inline rather than in a separate documentation page

## When NOT to Use / Pitfalls
- Showing everything creates clutter — use [[Progressive Disclosure]] for secondary options
- In pedagogy, recall IS the goal (see [[Retrieval Practice]]) — don't confuse UI recall (bad) with learning recall (good)
- Power users may prefer keyboard shortcuts (recall-based) for speed — support both

## See Also
[[Nielsen's 10 Heuristics]], [[Progressive Disclosure]], [[Hick's Law]], [[Retrieval Practice]]
```

- [ ] **Step 5: Create Error Prevention & Recovery**

```markdown
---
title: Error Prevention & Recovery
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Error Prevention & Recovery

**What:** Design to prevent errors before they occur (constraints, defaults, confirmation). When errors happen, help users recognize and recover from them with clear messages and undo paths.
**Evidence:** Norman (1988) *Design of Everyday Things* — slip errors (wrong action on right goal) vs mistake errors (wrong goal). Nielsen heuristics #5 (prevention) and #9 (recovery). Reason (1990) — errors are inevitable; systems should be error-tolerant. Error messages with specific recovery instructions reduce repeat errors by 50% vs generic messages (Shneiderman 1997).
**Maps to:** CodeEditor (syntax error highlighting), CodeChallenge (compilation error display from Judge0), quiz submission (confirm before submit?), LinuxTerminal (command not found messaging), ErrorBoundary component (crash recovery screen), navigation (no dead-end states).

## How to Apply
- Prevent slips: disable invalid actions, use appropriate input types, provide defaults
- Prevent mistakes: confirm destructive actions, show previews of consequences
- Error messages must say: (1) what went wrong, (2) why, (3) how to fix it
- Always provide a way back — no dead-end screens, always show navigation
- For code execution errors (Judge0): show the exact compiler message, not a generic "error occurred"

## When NOT to Use / Pitfalls
- Over-confirming creates "dialog fatigue" — users click through confirmations without reading
- In learning contexts, errors are valuable ([[Productive Failure]]) — don't prevent learners from making mistakes in exercises
- Don't suppress error details "to be friendly" — developers and students need specific information

## See Also
[[Nielsen's 10 Heuristics]], [[State Visibility]], [[Feedback & Response Time]], [[Productive Failure]], [[Design Principles]]
```

- [ ] **Step 6: Create Jakob's Law**

```markdown
---
title: Jakob's Law
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Jakob's Law

**What:** Users spend most of their time on other sites. They expect your site to work the same way as the sites they already know. Leveraging existing mental models reduces learning curve.
**Evidence:** Coined by Jakob Nielsen from decades of usability studies across hundreds of sites. NNGroup confirmed that navigation patterns matching user expectations improved task completion by 22%. Mental model theory (Johnson-Laird 1983) — users build internal models of how systems work based on prior experience.
**Maps to:** Sidebar behavior (matches VS Code/Notion left panel), tab navigation (matches browser tabs), card grid layout (matches dashboard patterns), breadcrumbs (standard web pattern), search (matches Google/site search conventions), dark mode toggle placement (matches OS/app conventions).

## How to Apply
- Study the platforms your users already use: Canvas, Notion, MDN, W3Schools, VS Code — match their patterns
- Sidebar on the left, content in the center, navigation at the top — don't innovate on layout
- Clicking a logo/brand goes home. Breadcrumbs are clickable. Tabs switch content without page reload.
- When you must break convention, make it self-explanatory — don't rely on users discovering novel interactions
- Test with actual classmates: "where would you click to...?" reveals mental model mismatches

## When NOT to Use / Pitfalls
- Matching conventions doesn't mean copying designs — adapt patterns to your context
- If the conventional pattern is genuinely bad for your use case, break it deliberately with clear affordances
- [[Desirable Difficulties]] in pedagogy intentionally break expectations for learning — this applies to content, not chrome

## See Also
[[Nielsen's 10 Heuristics]], [[Consistency & Design Tokens]], [[Affordances & Signifiers]], [[Design Principles]]
```

- [ ] **Step 7: Commit**

```bash
git add "wiki/concepts/Nielsen's 10 Heuristics.md" "wiki/concepts/Fitts's Law.md" "wiki/concepts/Hick's Law.md" "wiki/concepts/Recognition Over Recall.md" "wiki/concepts/Error Prevention & Recovery.md" "wiki/concepts/Jakob's Law.md"
git commit -m "docs(wiki): add core usability concepts (6 pages)"
```

---

### Task 2: Information Architecture Concepts (5 pages)

**Files:**
- Create: `wiki/concepts/Visual Hierarchy.md`
- Create: `wiki/concepts/Gestalt Principles.md`
- Create: `wiki/concepts/Progressive Disclosure.md`
- Create: `wiki/concepts/Chunking.md`
- Create: `wiki/concepts/F-Pattern & Scanning.md`

- [ ] **Step 1: Create Visual Hierarchy**

```markdown
---
title: Visual Hierarchy
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ui, ux]
---

# Visual Hierarchy

**What:** The arrangement of visual elements to guide the viewer's eye in a predictable order of importance. Achieved through size, color, contrast, spacing, position, and typographic weight.
**Evidence:** Few (2004) *Show Me the Numbers* — hierarchy is the primary tool for directing attention in information displays. Ware (2012) *Information Visualization* — pre-attentive processing detects size, color, and orientation in <200ms before conscious attention engages. Faraday (2000) — visual hierarchy in web pages predicts gaze patterns with 80%+ accuracy.
**Maps to:** Section headings (h2 > h3 > body), Box callout prominence (definition/warning/theorem types use color to signal importance), TopBar vs content area distinction, code block visual weight, progress ring size/color states (green > blue > amber > grey).

## How to Apply
- Establish 3-4 distinct hierarchy levels max — more creates confusion
- Use size as the primary differentiator (most pre-attentive), color as secondary
- Section headings must be visually scannable — users read headings first ([[F-Pattern & Scanning]])
- The most important action on any screen should be the most visually prominent element
- Don't compete for attention — if everything is bold, nothing is bold

## When NOT to Use / Pitfalls
- Over-emphasizing creates "everything is important" noise — restraint is key
- Color-only hierarchy fails for colorblind users (~8% of males) — always pair with size or weight
- [[Von Restorff Effect]] leverages hierarchy intentionally — sometimes breaking hierarchy IS the point for key concepts

## See Also
[[Gestalt Principles]], [[F-Pattern & Scanning]], [[Whitespace & Density]], [[Color & Contrast]], [[Typography & Readability]], [[Serial Position & Von Restorff]]
```

- [ ] **Step 2: Create Gestalt Principles**

```markdown
---
title: Gestalt Principles
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux, ui]
---

# Gestalt Principles

**What:** Laws of perceptual grouping that describe how humans naturally organize visual elements into coherent wholes. The five core principles: proximity (near = related), similarity (alike = related), closure (minds complete incomplete shapes), continuity (eyes follow smooth paths), and figure-ground (foreground separates from background).
**Evidence:** Wertheimer (1923) founded Gestalt psychology with perceptual grouping studies. Koffka (1935) *Principles of Gestalt Psychology* formalized the laws. Palmer (1992) added common region (enclosed = grouped). In UI, Chang et al. (2002) showed that proximity-based grouping reduced task completion time by 20-30% in form design.
**Maps to:** Card grids (SubjectCard proximity = same year/semester grouping), sidebar course list (proximity groups courses, spacing separates sections), progress ring placement near course title (proximity = association), Box callout border creates common region, figure-ground separates content from chrome.

## How to Apply
- **Proximity:** Related elements closer together, unrelated elements further apart. Spacing IS information.
- **Similarity:** Same-type elements should look alike (all quiz options same style, all Section headers same style)
- **Closure:** Borders and backgrounds create containers — use consistently for Section, Box, CourseBlock
- **Continuity:** Align elements on a shared axis — left-align content blocks, top-align card grids
- **Common region:** Use subtle backgrounds or borders to group related controls (TopBar, ContentTypeBar)

## When NOT to Use / Pitfalls
- Proximity grouping breaks if spacing is inconsistent — use a spacing scale (4px increments)
- Similarity can backfire when distinct items should look different — Box callout types SHOULD look different
- Don't rely solely on color similarity (accessibility) — pair with shape or border

## See Also
[[Visual Hierarchy]], [[Whitespace & Density]], [[Chunking]], [[Consistency & Design Tokens]]
```

- [ ] **Step 3: Create Progressive Disclosure**

```markdown
---
title: Progressive Disclosure
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Progressive Disclosure

**What:** Show only the essential information and controls at first; reveal details on demand. Reduces cognitive load by moving complexity behind interaction rather than eliminating it.
**Evidence:** Tidwell (2010) *Designing Interfaces* — progressive disclosure is the primary strategy for managing complexity in interfaces with diverse user expertise. Nielsen (2006) showed that progressive disclosure in web apps reduced user errors by 20% while maintaining feature access. Keller & Staelin (1987) — information overload decreases decision quality; disclosure mitigates this.
**Maps to:** Section collapse/expand, Toggle Q&A (show/hide), CourseBlock expand, sidebar hover-reveal on desktop, Box callouts with expandable details, CodeChallenge hint system (progressive hints), InlineProgress detail expansion.

## How to Apply
- Default state should show the minimum needed for the primary task
- Expand/collapse must be obvious — use clear affordances (chevrons, "Show more" labels, not just clickable text)
- Preserve user's disclosure state within a session — don't re-collapse when navigating back
- Layer information: heading → summary → detail → code → edge cases
- Keep one level of disclosure per interaction — don't nest expand-within-expand-within-expand

## When NOT to Use / Pitfalls
- Critical information must never be hidden — error states, navigation, system status stay visible
- Over-hiding frustrates power users who want information density — offer a "show all" option where appropriate
- In pedagogy, [[Productive Failure]] intentionally withholds answers — progressive disclosure of SOLUTIONS is different from progressive disclosure of CONTENT

## See Also
[[Hick's Law]], [[Chunking]], [[Cognitive Load Theory]], [[Nielsen's 10 Heuristics]], [[Design Principles]]
```

- [ ] **Step 4: Create Chunking**

```markdown
---
title: Chunking
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Chunking

**What:** Grouping individual pieces of information into larger, meaningful units ("chunks") to fit within working memory limits. Reduces perceived complexity without reducing content.
**Evidence:** Miller (1956) — "The Magical Number Seven, Plus or Minus Two" — working memory holds 7±2 items, later revised to ~4 chunks by Cowan (2001). Ericsson et al. (1980) showed experts chunk domain-specific information into larger units. In UI, Lidwell et al. (2010) demonstrated that chunked phone numbers (555-123-4567) are recalled 80% more accurately than unchunked (5551234567).
**Maps to:** Step count per course (target 5-12), section count per step (3-5), quiz options per question (3-4), sidebar grouping, ContentTypeBar tab count, card grid layout (3-4 per row). Cross-reference: [[Cognitive Load Theory]] — chunking is the primary strategy for managing intrinsic cognitive load.

## How to Apply
- Limit to 3-5 chunks per grouping level — steps per course, sections per step, items per list
- Use visual separators (whitespace, borders, headings) to make chunk boundaries explicit — see [[Gestalt Principles]]
- Number or label chunks when sequence matters (Step 1, Step 2...)
- For long content, provide a table of contents or progress indicator showing chunk boundaries
- Re-chunk when users are overwhelmed — if a step has 8 sections, split into 2 steps

## When NOT to Use / Pitfalls
- Arbitrary chunking (grouping unrelated items) adds confusion rather than reducing it
- Expert users can handle larger chunks — don't over-simplify for advanced content
- The number 7±2 is for short-term storage of arbitrary items; meaningful chunks can be much larger

## See Also
[[Cognitive Load Theory]], [[Gestalt Principles]], [[Visual Hierarchy]], [[Progressive Disclosure]], [[Hick's Law]]
```

- [ ] **Step 5: Create F-Pattern & Scanning**

```markdown
---
title: F-Pattern & Scanning
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# F-Pattern & Scanning

**What:** Eye-tracking research shows users scan web pages in predictable patterns. The F-pattern (two horizontal stripes + vertical stem) appears on text-heavy pages without clear structure. When pages have strong headings, users adopt a "layer-cake" pattern — reading headings and skipping body text until they find relevant sections.
**Evidence:** Nielsen (2006) eyetracking study with 232 users across thousands of pages confirmed F-pattern as dominant scanning behavior. NNGroup (2017 update) identified 6 distinct patterns: F-pattern, layer-cake, spotted, marking, pinball, and lawn-mower. Key finding: F-pattern only appears when there are no structural visual cues — strong headings shift behavior to layer-cake.
**Maps to:** Section component headings (primary scanning surface — wording must be self-explanatory), course content layout (left-aligned text, avoid centered body text), sidebar course list (vertical scanning), Box callout positioning (break scanning pattern intentionally for important callouts).

## How to Apply
- Write self-explanatory Section headings — users will read ONLY headings when scanning
- Place the most important information in the first two lines of any content block
- Left-align body text — centered text breaks the vertical scanning stem
- Use bold, callouts, and code blocks to create "spotted" pattern anchors for key concepts
- Don't fight the pattern — work with natural scanning behavior, not against it

## When NOT to Use / Pitfalls
- F-pattern describes untrained scanning of poorly structured pages — good structure eliminates it
- Mobile scanning is more vertical (single column) — F-pattern is primarily desktop
- For data tables and comparison layouts, users adopt a lawn-mower pattern — different rules apply

## See Also
[[Visual Hierarchy]], [[Typography & Readability]], [[Chunking]], [[Gestalt Principles]]
```

- [ ] **Step 6: Commit**

```bash
git add "wiki/concepts/Visual Hierarchy.md" "wiki/concepts/Gestalt Principles.md" "wiki/concepts/Progressive Disclosure.md" "wiki/concepts/Chunking.md" "wiki/concepts/F-Pattern & Scanning.md"
git commit -m "docs(wiki): add information architecture concepts (5 pages)"
```

---

### Task 3: Interaction Design Concepts (4 pages)

**Files:**
- Create: `wiki/concepts/Feedback & Response Time.md`
- Create: `wiki/concepts/Affordances & Signifiers.md`
- Create: `wiki/concepts/Direct Manipulation.md`
- Create: `wiki/concepts/State Visibility.md`

- [ ] **Step 1: Create Feedback & Response Time**

```markdown
---
title: Feedback & Response Time
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Feedback & Response Time

**What:** Every user action must produce visible feedback. Response time thresholds determine perceived responsiveness: <100ms feels instantaneous, <1s maintains flow, <10s maintains attention, >10s loses users.
**Evidence:** Nielsen (1993) *Usability Engineering* codified the three response-time thresholds. Doherty & Thadani (1982, IBM Systems Journal) showed programmer throughput doubled when response time dropped below 400ms (the "Doherty Threshold"). Card et al. (1983) *The Psychology of Human-Computer Interaction* — 100ms is the limit for feeling that the system is reacting directly to input.
**Maps to:** Route transitions (<100ms target), Section expand/collapse animation (150-300ms), Judge0 code execution (show spinner after 400ms), API calls for chat/grade (streaming response), progress ring updates (instant on checkbox), sidebar hover-reveal delay.

## How to Apply
- <100ms: button press visual feedback, checkbox toggle, tab switch — no spinner needed
- 100ms-1s: Section expand animation, sidebar reveal — show the animation, no loading indicator
- 1s-10s: Judge0 code execution, API calls — show a spinner/skeleton after 400ms (Doherty threshold)
- >10s: V86 terminal boot — show a progress bar with percentage, allow cancellation
- Never leave the user without feedback — even if the action is queued, acknowledge it immediately

## When NOT to Use / Pitfalls
- Don't show spinners for <400ms operations — they make fast things feel slow
- Don't fake progress bars — if you can't measure progress, use an indeterminate spinner
- Streaming responses (chat) provide continuous feedback — prefer streaming over batch responses

## See Also
[[State Visibility]], [[Affordances & Signifiers]], [[Direct Manipulation]], [[Nielsen's 10 Heuristics]], [[Motion & Animation]]
```

- [ ] **Step 2: Create Affordances & Signifiers**

```markdown
---
title: Affordances & Signifiers
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Affordances & Signifiers

**What:** An affordance is what an object allows you to do. A signifier is a visual cue that indicates the affordance. Buttons afford clicking — their raised/colored appearance is the signifier. In UI, signifiers matter more than affordances because users can't physically interact with pixels.
**Evidence:** Gibson (1977) coined "affordance" in ecological psychology. Norman (1988, revised 2013) *Design of Everyday Things* distinguished between affordances (physical capabilities) and signifiers (perceptible signals). Norman later argued signifiers are more important than affordances for design — a door handle's shape signals push vs pull. In UI, Hartson (2003) proposed four types: cognitive, physical, sensory, and functional affordances.
**Maps to:** Toggle show/hide (needs visible expand indicator), Section checkboxes (must look checkable), CourseNavigation prev/next (must look like buttons), sidebar items (hover state signals clickability), CodeChallenge Run button (must look actionable), palette picker circles (must signal "click to select").

## How to Apply
- Every clickable element needs a hover state that signals interactivity (cursor: pointer + visual change)
- Use consistent signifier vocabulary: chevrons = expand, checkboxes = toggle, buttons = action
- Don't make non-interactive elements look interactive (no underlined plain text, no button-styled divs)
- Don't make interactive elements look static (flat text links need color/underline signifier)
- Icons without labels are weak signifiers — add tooltip or text label for clarity

## When NOT to Use / Pitfalls
- Over-signifying clutters the interface — not every element needs to scream "click me"
- Flat design trends have weakened signifiers — ensure buttons look distinct from content
- Mobile lacks hover state — signifiers must work without hover (color, shape, position alone)

## See Also
[[Nielsen's 10 Heuristics]], [[Direct Manipulation]], [[Feedback & Response Time]], [[Jakob's Law]]
```

- [ ] **Step 3: Create Direct Manipulation**

```markdown
---
title: Direct Manipulation
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Direct Manipulation

**What:** Users interact directly with visible objects rather than through abstract commands. Characterized by: (1) visible objects, (2) rapid, reversible, incremental actions, (3) immediate feedback replacing complex command syntax.
**Evidence:** Shneiderman (1983) coined the term and identified direct manipulation as the reason GUIs outperform CLIs for novice users. Hutchins et al. (1985) expanded with the concept of "directness" — reducing the gulf between user intention and system action. Frisch et al. (2009) showed direct manipulation reduces error rates 40% vs command-based interfaces for spatial tasks.
**Maps to:** Section checkboxes (direct toggle — click = state change), CodeEditor (live typing with syntax highlighting), LinuxTerminal (immediate command feedback), sidebar lock toggle (direct click to pin/unpin), drag interactions (BottomSheet drag-to-dismiss), progress ring checkboxes.

## How to Apply
- Prefer toggles, checkboxes, and drag over multi-step dialogs for simple state changes
- Show results immediately — don't batch updates behind a "Save" button when possible
- Make actions reversible — clicking a checked Section unchecks it, toggling dark mode toggles back
- Reduce the distance between trigger and result — the thing you click should be near the thing that changes
- For complex operations (code execution), provide inline results rather than modal dialogs

## When NOT to Use / Pitfalls
- Not all operations should be direct — destructive actions need confirmation ([[Error Prevention & Recovery]])
- Direct manipulation requires visible targets — doesn't scale to hundreds of items (use search/filter instead)
- Terminal interactions ARE direct manipulation despite being text-based — the directness is in the immediate response

## See Also
[[Affordances & Signifiers]], [[Feedback & Response Time]], [[Error Prevention & Recovery]], [[State Visibility]]
```

- [ ] **Step 4: Create State Visibility**

```markdown
---
title: State Visibility
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# State Visibility

**What:** The system must always communicate its current state to the user: what's loaded, what's loading, what's empty, what failed, and what succeeded. Every screen has at least 4 states: loading, empty, populated, and error.
**Evidence:** Nielsen heuristic #1 (visibility of system status) — the most frequently violated heuristic in usability audits. Wroblewski (2013) documented "state-driven design" — designing for all states prevents jarring user experiences. Scott (2016) *Designing Connected Products* — empty states are the most neglected and highest-impact design opportunity.
**Maps to:** InlineProgress bar (course completion state), CourseMap empty state (no course selected), API loading spinners (chat, grade, generate-test), test result display (score, passed/failed), ErrorBoundary (crash state with error details), CodeChallenge output states (running, success, compilation error, runtime error, time limit).

## How to Apply
- Design ALL four states for every component: loading, empty, populated, error
- Empty states should guide users to action — "Start Course 1" not just "No content"
- Loading states should appear after 400ms ([[Feedback & Response Time]]) — not before
- Error states must be specific and actionable ([[Error Prevention & Recovery]])
- Show skeleton screens for content-heavy loading states rather than spinners — maintains layout stability

## When NOT to Use / Pitfalls
- Over-communicating state creates noise — don't show "everything is fine" messages, only show exceptions
- Empty states in learning contexts may be intentional ([[Productive Failure]]) — distinguish navigation empty from pedagogical empty
- Don't show intermediate states for <100ms operations — direct transition is cleaner

## See Also
[[Nielsen's 10 Heuristics]], [[Feedback & Response Time]], [[Error Prevention & Recovery]], [[Design Principles]]
```

- [ ] **Step 5: Commit**

```bash
git add "wiki/concepts/Feedback & Response Time.md" "wiki/concepts/Affordances & Signifiers.md" "wiki/concepts/Direct Manipulation.md" "wiki/concepts/State Visibility.md"
git commit -m "docs(wiki): add interaction design concepts (4 pages)"
```

---

### Task 4: Visual Design Concepts (4 pages)

**Files:**
- Create: `wiki/concepts/Color & Contrast.md`
- Create: `wiki/concepts/Typography & Readability.md`
- Create: `wiki/concepts/Whitespace & Density.md`
- Create: `wiki/concepts/Consistency & Design Tokens.md`

- [ ] **Step 1: Create Color & Contrast**

```markdown
---
title: Color & Contrast
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ui]
---

# Color & Contrast

**What:** Color communicates meaning, creates hierarchy, and enables accessibility. Contrast ratios between text and background determine readability. WCAG defines minimum ratios: 4.5:1 for normal text (AA), 3:1 for large text (AA), 7:1 for normal text (AAA).
**Evidence:** W3C WCAG 2.1 — international standard for web accessibility. Szafir (2018) *Modeling Color Difference for Visualization Design* — perceptual color differences vary by context and size. Piepenbrock et al. (2013) — positive polarity (light background) improves visual acuity for reading; dark mode reduces eye strain in low ambient light but doesn't improve reading performance. ~8% of males have color vision deficiency (Birch 2012).
**Maps to:** Palette system (5 palettes × light/dark = 10 combinations to verify), Box callout colors (definition=blue, warning=amber, theorem=purple, formula=green), progress ring states (green/blue/amber/grey), syntax highlighting in CodeEditor, accent color (#3b82f6 blue).

## How to Apply
- Test every palette+mode combination against WCAG AA — use browser devtools Accessibility panel
- Never use color as the ONLY signifier — pair with icons, text labels, or border styles
- Limit the color palette to 5-7 functional colors — each color should have a consistent meaning
- Dark mode requires independent contrast verification — don't just invert light mode colors
- Use `var(--theme-*)` CSS custom properties — never hardcode color values in components

## When NOT to Use / Pitfalls
- High contrast everywhere creates visual fatigue — reserve high contrast for text and primary actions
- Decorative color that carries no meaning adds noise — every color should be functional
- Dark mode on OLED screens can cause "smearing" with thin white text — use slightly heavier font weights in dark mode

## See Also
[[Visual Hierarchy]], [[Accessibility Fundamentals]], [[Consistency & Design Tokens]], [[Typography & Readability]]
```

- [ ] **Step 2: Create Typography & Readability**

```markdown
---
title: Typography & Readability
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ui]
---

# Typography & Readability

**What:** Typography choices directly affect reading speed, comprehension, and fatigue. Key variables: font size, line height (leading), line length (measure), font weight, and typeface.
**Evidence:** Dyson (2004) — optimal line length for screen reading is 50-75 characters (CPL); longer lines increase reading speed but decrease comprehension. Ling & van Schaik (2006) — line spacing of 1.4-1.6× font size optimizes reading speed and satisfaction. Rello & Baeza-Yates (2013) — sans-serif fonts at 18px+ improve reading performance for both typical readers and readers with dyslexia. Bringhurst (2004) *Elements of Typographic Style* — typographic hierarchy requires minimum 3 distinct sizes.
**Maps to:** Course content max-width (limit line length), body text size (≥16px), code block font (monospace, adequate size for readability), Section heading hierarchy (h2/h3/body), mobile text scaling, sidebar font sizing.

## How to Apply
- Body text: minimum 16px, line-height 1.5, max-width that yields 50-75 characters per line
- Headings: establish 3-4 sizes with clear ratio (e.g., 1.25× scale: 16, 20, 25, 31px)
- Code blocks: monospace font, minimum 14px, line-height 1.4-1.6
- Don't use more than 2 typeface families — one for body, one for code
- Test readability on mobile — text that works on desktop may be too small/dense on phones

## When NOT to Use / Pitfalls
- Justified text creates uneven word spacing on the web — always left-align body text
- Very short lines (<40 chars) cause excessive line breaks in code blocks — allow horizontal scroll instead
- Font-weight below 400 (light/thin) in dark mode is hard to read due to halation — use 400+ in dark mode

## See Also
[[Color & Contrast]], [[Visual Hierarchy]], [[F-Pattern & Scanning]], [[Whitespace & Density]], [[Accessibility Fundamentals]]
```

- [ ] **Step 3: Create Whitespace & Density**

```markdown
---
title: Whitespace & Density
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ui]
---

# Whitespace & Density

**What:** Whitespace (negative space) is the empty space between and around elements. It's an active design element, not wasted space. Micro-whitespace (within components) affects readability; macro-whitespace (between components) affects grouping and hierarchy.
**Evidence:** Chaparro et al. (2004) — generous margins and spacing improved reading comprehension by 20% in web content. Wichmann et al. (2000) — whitespace affects reading speed less than comprehension, suggesting it aids processing depth. Li & Suen (2016) — information density has a U-shaped relationship with usability — too sparse wastes screen real estate, too dense overwhelms.
**Maps to:** Section spacing and padding, Box callout margins, card grid gaps (SubjectCard, CourseMap), sidebar item vertical spacing, TopBar padding, course content margins (left/right), spacing between steps in a course.

## How to Apply
- Use a consistent spacing scale (e.g., 4/8/12/16/24/32/48px) — never use arbitrary values
- Macro-whitespace between sections should be larger than micro-whitespace within sections ([[Gestalt Principles]] proximity)
- Content padding on mobile can be reduced (16px) vs desktop (24-48px) — but never zero
- Dense layouts (sidebar course list) need adequate vertical spacing between items for touch targets
- When in doubt, add more whitespace — it's easier to compress than to unclutter

## When NOT to Use / Pitfalls
- Excessive whitespace on content-heavy pages forces unnecessary scrolling — balance with information density
- Mobile screens have limited space — generous desktop whitespace may not translate to mobile
- Whitespace between related elements can break [[Gestalt Principles]] proximity grouping — related items should be close

## See Also
[[Gestalt Principles]], [[Visual Hierarchy]], [[Typography & Readability]], [[Touch Target Sizing]], [[Responsive Design Patterns]]
```

- [ ] **Step 4: Create Consistency & Design Tokens**

```markdown
---
title: Consistency & Design Tokens
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ui]
---

# Consistency & Design Tokens

**What:** Internal consistency (same patterns across the app) and external consistency (matching platform conventions) reduce learning curve and cognitive load. Design tokens — named values for colors, spacing, typography, shadows, radii — are the implementation mechanism for consistency.
**Evidence:** Nielsen heuristic #4 (consistency and standards). Ozcelik et al. (2009) — consistent visual layouts improve learning outcomes in educational interfaces by 15%. Shneiderman (1997) — internal consistency reduces user errors by 25% vs inconsistent interfaces. Design tokens coined by Salesforce Lightning Design System (2015), now industry standard.
**Maps to:** CSS custom properties (`var(--theme-nav-bg)`, `var(--theme-content-bg)`, etc.), component prop naming conventions, spacing scale, border-radius values, shadow depths, animation durations, accent color (#3b82f6).

## How to Apply
- ALL colors must use `var(--theme-*)` CSS custom properties — never hardcode Tailwind color classes
- Establish and document the spacing scale, border-radius values, and shadow depths used
- Same interaction = same pattern everywhere: Section expand works the same in every course
- Prop names must match across similar components (e.g., `title` means the same thing everywhere)
- When adding a new component, check existing components for similar patterns — reuse, don't reinvent

## When NOT to Use / Pitfalls
- Consistency for its own sake can prevent improvement — if a pattern is genuinely better, update it everywhere
- External consistency ([[Jakob's Law]]) sometimes conflicts with internal consistency — prefer internal within the app
- Over-tokenizing (tokens for everything) adds indirection — tokenize values that repeat 3+ times

## See Also
[[Jakob's Law]], [[Nielsen's 10 Heuristics]], [[Color & Contrast]], [[Gestalt Principles]]
```

- [ ] **Step 5: Commit**

```bash
git add "wiki/concepts/Color & Contrast.md" "wiki/concepts/Typography & Readability.md" "wiki/concepts/Whitespace & Density.md" "wiki/concepts/Consistency & Design Tokens.md"
git commit -m "docs(wiki): add visual design concepts (4 pages)"
```

---

### Task 5: Responsive & Accessibility Concepts (4 pages)

**Files:**
- Create: `wiki/concepts/Responsive Design Patterns.md`
- Create: `wiki/concepts/Accessibility Fundamentals.md`
- Create: `wiki/concepts/Touch Target Sizing.md`
- Create: `wiki/concepts/Motion & Animation.md`

- [ ] **Step 1: Create Responsive Design Patterns**

```markdown
---
title: Responsive Design Patterns
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ui, ux]
---

# Responsive Design Patterns

**What:** Designing interfaces that adapt to different screen sizes, orientations, and input methods. Mobile-first approach: design for the smallest screen first, then enhance for larger screens.
**Evidence:** Wroblewski (2011) *Mobile First* — starting with mobile constraints produces cleaner, more focused designs. Google (2016) — 53% of mobile users abandon sites that take >3s to load. Budiu (2015, NNGroup) — mobile users complete tasks 40% slower than desktop users, primarily due to small screens and fat fingers, not connection speed.
**Maps to:** BottomSheet mobile sidebar (replaces hover sidebar on mobile), content reflow (single column on mobile), TopBar collapse behavior, touch-friendly quiz options, code block horizontal scroll on mobile, card grid responsive columns.

## How to Apply
- Define breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px) — match Tailwind defaults
- Mobile-first CSS: base styles for mobile, `@media (min-width:)` for larger screens
- Sidebar: hover-triggered on desktop, BottomSheet on mobile — never squeeze a sidebar into mobile
- Code blocks: allow horizontal scroll on mobile, never shrink font below 13px
- Test on real devices, not just browser DevTools resize — touch behavior differs from mouse

## When NOT to Use / Pitfalls
- "Responsive" doesn't mean "same content squished" — consider what mobile users need and hide the rest
- Don't break desktop layout to make mobile work — each breakpoint can have distinct layouts
- Touch and mouse are different input methods — hover states don't exist on mobile, design accordingly

## See Also
[[Touch Target Sizing]], [[Whitespace & Density]], [[BottomSheet component]], [[Accessibility Fundamentals]]
```

- [ ] **Step 2: Create Accessibility Fundamentals**

```markdown
---
title: Accessibility Fundamentals
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Accessibility Fundamentals

**What:** Designing interfaces usable by people with disabilities: visual (blindness, low vision, color blindness), motor (inability to use mouse), cognitive (learning disabilities, attention disorders), and auditory (deafness). WCAG 2.1 Level AA is the target standard.
**Evidence:** W3C Web Content Accessibility Guidelines (WCAG) 2.1 — international standard, legal requirement in many jurisdictions. WebAIM Million (2024) — 96.3% of home pages have detectable WCAG failures. Petrie & Kheir (2007) — accessibility improvements benefit all users, not just users with disabilities (curb-cut effect). POUR principles: Perceivable, Operable, Understandable, Robust.
**Maps to:** All interactive components (Section, Toggle, MultipleChoice, CodeEditor, LinuxTerminal), route change announcements, focus management in modals/sheets, semantic HTML structure, ARIA roles for custom widgets.

## How to Apply
- Semantic HTML first: `<button>` not `<div onClick>`, `<nav>` not `<div class="nav">`, headings in order (h1→h2→h3)
- Keyboard navigation: every interactive element must be reachable and operable via Tab/Enter/Escape
- Focus management: when content changes (route, modal, expand), move focus appropriately
- ARIA roles: only when semantic HTML isn't sufficient — `role="tablist"` for ContentTypeBar, `role="alert"` for error messages
- Color: never the only signifier ([[Color & Contrast]]), always pair with text/icon/shape
- Test with keyboard-only navigation at minimum; screen reader testing (NVDA/VoiceOver) for major features

## When NOT to Use / Pitfalls
- ARIA misuse is worse than no ARIA — incorrect roles confuse screen readers more than missing roles
- Don't disable focus outlines for aesthetics — style them, don't remove them
- Accessibility is not a separate task — build it in from the start, don't retrofit

## See Also
[[Color & Contrast]], [[Touch Target Sizing]], [[Nielsen's 10 Heuristics]], [[Keyboard navigation patterns]]
```

- [ ] **Step 3: Create Touch Target Sizing**

```markdown
---
title: Touch Target Sizing
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ui, ux]
---

# Touch Target Sizing

**What:** Interactive elements on touch screens must meet minimum size requirements for reliable activation. The average adult fingertip covers 10-14mm (~40-56px at standard density).
**Evidence:** MIT Touch Lab (2003) — average fingertip pad is 10-14mm wide, with the 95th percentile at 16mm. Apple Human Interface Guidelines: 44×44pt minimum. Google Material Design: 48×48dp minimum with 8dp spacing. WCAG 2.5.5 (AAA): 44×44 CSS pixels. Parhi et al. (2006) — error rates increase sharply below 9.2mm targets and asymptote above 11.5mm.
**Maps to:** Section checkboxes (must be 44px+ with padding), sidebar course items (44px min height), MultipleChoice quiz options (full-width touch targets on mobile), TopBar controls, palette picker circles, CourseNavigation prev/next buttons, BottomSheet drag handle.

## How to Apply
- Minimum touch target: 44×44px, with 8px spacing between adjacent targets
- Increase hit area with CSS padding, not visual size — a small icon with large padding works
- On mobile, make entire list items/cards tappable, not just the text within them
- Group closely-spaced controls (TopBar) with adequate separation on mobile
- Thumb zone: primary actions in bottom-center of mobile screens (easy reach), secondary actions at top

## When NOT to Use / Pitfalls
- Oversized targets waste space — 44px is the minimum, not the goal. Don't make everything 64px
- Desktop mouse targets can be smaller (32px minimum) — use responsive sizing
- Inline text links in content are inherently small targets — consider making link text longer or adding padding

## See Also
[[Fitts's Law]], [[Responsive Design Patterns]], [[Accessibility Fundamentals]], [[Whitespace & Density]]
```

- [ ] **Step 4: Create Motion & Animation**

```markdown
---
title: Motion & Animation
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ui, ux]
---

# Motion & Animation

**What:** Purpose-driven motion in UI serves three functions: feedback (confirming actions), transitions (showing state changes), and guidance (directing attention). Motion without purpose is decoration.
**Evidence:** Disney's 12 principles of animation adapted for UI (Head 2016). Material Design motion guidelines — motion should be informative, focused, and expressive. Chevalier et al. (2014) — animated transitions improve user understanding of state changes by 60%. Prefers-reduced-motion media query: ~10% of users have vestibular disorders or motion sensitivity (Lawton 2019). Chang & Ungar (1993) — animation duration 150-500ms optimal for UI; <100ms imperceptible, >1s feels sluggish.
**Maps to:** Section expand/collapse (max-height + opacity transition), InlineProgress celebration (green flash + +1 floater + counter bounce), BottomSheet drag interaction, route transitions, StepPlayer step advance, sidebar hover reveal, dark mode toggle transition.

## How to Apply
- Every animation must answer: "what information does this communicate?" If none, remove it.
- Duration: 150-300ms for micro-interactions (toggle, hover), 300-500ms for layout changes (expand, route)
- Easing: ease-out for elements entering, ease-in for elements leaving, ease-in-out for state changes
- Always implement `@media (prefers-reduced-motion: reduce)` — replace animations with instant state changes
- No auto-playing animations — especially in learning content ([[Active Visualization]] requires manual advance)

## When NOT to Use / Pitfalls
- Animation that delays access to content frustrates users — never use entrance animations on page load
- Looping animations are distracting during reading — limit to user-triggered one-shot animations
- Performance: use `transform` and `opacity` for 60fps — avoid animating `height`, `width`, `top`, `left`
- [[Active Visualization]] (pedagogy) requires prediction-before-reveal — animation must wait for user input

## See Also
[[Feedback & Response Time]], [[Accessibility Fundamentals]], [[Active Visualization]], [[Design Principles]]
```

- [ ] **Step 5: Commit**

```bash
git add "wiki/concepts/Responsive Design Patterns.md" "wiki/concepts/Accessibility Fundamentals.md" "wiki/concepts/Touch Target Sizing.md" "wiki/concepts/Motion & Animation.md"
git commit -m "docs(wiki): add responsive & accessibility concepts (4 pages)"
```

---

### Task 6: Motivation & Engagement Concepts (5 pages)

**Files:**
- Create: `wiki/concepts/Serial Position & Von Restorff.md`
- Create: `wiki/concepts/Peak-End Rule.md`
- Create: `wiki/concepts/Zeigarnik Effect.md`
- Create: `wiki/concepts/Goal Gradient Effect.md`
- Create: `wiki/concepts/Credibility & Trust.md`

- [ ] **Step 1: Create Serial Position & Von Restorff**

```markdown
---
title: Serial Position & Von Restorff
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Serial Position & Von Restorff Effects

**What:** Serial Position Effect: items at the beginning (primacy) and end (recency) of a list are remembered better than items in the middle. Von Restorff Effect (isolation effect): a visually distinct item among similar items is remembered disproportionately well.
**Evidence:** Ebbinghaus (1885) first documented serial position in nonsense syllable recall. Murdock (1962) confirmed the U-shaped recall curve across 30+ experiments. Von Restorff (1933) showed isolated items were recalled 2-3× better than non-isolated items. Kelley & Nairne (2001) confirmed both effects persist in modern UI contexts — menu items at top/bottom of lists get 60% more clicks than middle items.
**Maps to:** Sidebar course ordering (most important courses first or last), Box callout styling (definition/warning/theorem visually distinct from body text — Von Restorff), key concept placement within sections (put critical info at start/end), ContentTypeBar tab ordering.

## How to Apply
- Place the most important navigation items at the start and end of lists — sidebar, tabs, dropdowns
- Use Box callouts (definition, warning, theorem) to make key concepts visually isolated — they'll be remembered better
- In long course content, put critical takeaways at the beginning and end of each section
- Don't bury important actions in the middle of a toolbar or menu
- For quiz options, be aware that first and last options have primacy/recency bias — randomize order to counter this

## When NOT to Use / Pitfalls
- Randomization of quiz options counteracts serial position bias — which is good for assessment accuracy
- Overusing visual distinction (everything is a colored Box) eliminates the Von Restorff effect — be selective
- Serial position is strongest in sequential scanning — less relevant in grid layouts or search results

## See Also
[[Visual Hierarchy]], [[F-Pattern & Scanning]], [[Chunking]], [[Gestalt Principles]]
```

- [ ] **Step 2: Create Peak-End Rule**

```markdown
---
title: Peak-End Rule
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Peak-End Rule

**What:** People judge an experience primarily by its most intense moment (peak) and its final moment (end), rather than by the average of every moment. The duration of the experience has surprisingly little effect on the overall evaluation.
**Evidence:** Kahneman et al. (1993) — cold-water pain study: participants preferred a longer painful experience with a slightly warmer ending over a shorter but uniformly painful one. Fredrickson & Kahneman (1993) confirmed the pattern across multiple modalities. Do et al. (2008) applied peak-end to website evaluation — the final interaction screen disproportionately affected overall satisfaction ratings.
**Maps to:** Course completion celebration (green flash + popup toast — this IS the peak-end), test result display (the end of a test session), session end state (what does the app look like when you close it?), InlineProgress completion merge animation, CourseMap showing completed courses.

## How to Apply
- Design course completion moments deliberately — the current celebration animation is correct
- Ensure the last screen of any flow is positive and clear — never end on an error or ambiguous state
- Test result screens should feel conclusive and encouraging, even for low scores
- The "resume where you left off" banner makes the START of a return visit feel like a positive continuation of the END of the last visit
- If a flow must include frustration (hard exercise, compilation error), follow it with a recovery moment

## When NOT to Use / Pitfalls
- Don't manufacture fake positive endings — users can tell. The peak should be genuine accomplishment.
- A bad peak (crash, data loss) dominates the memory — preventing negative peaks matters more than crafting positive ones
- In pedagogy, [[Productive Failure]] creates intentional difficulty — the resolution AFTER failure is the positive peak

## See Also
[[Goal Gradient Effect]], [[Zeigarnik Effect]], [[Feedback & Response Time]], [[State Visibility]], [[Design Principles]]
```

- [ ] **Step 3: Create Zeigarnik Effect**

```markdown
---
title: Zeigarnik Effect
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Zeigarnik Effect

**What:** Incomplete tasks are remembered better than completed ones and create psychological tension that motivates completion. Open loops in the mind drive return behavior.
**Evidence:** Zeigarnik (1927) — waiters recalled unpaid orders far better than settled ones; subjects interrupted mid-task recalled those tasks 90% better than completed tasks. Masicampo & Baumeister (2011) confirmed in modern context: unfulfilled goals cause intrusive thoughts that persist until the task is completed or a plan is made. Ovsiankina (1928) showed subjects spontaneously return to interrupted tasks when given the opportunity.
**Maps to:** Progress rings (partially filled = open loop), InlineProgress segmented bar (incomplete segments visible), CourseMap showing started-but-unfinished courses, resume banner ("Continue where you left off"), Section checkboxes (unchecked = incomplete).

## How to Apply
- Show partially-completed progress prominently — a course at 60% creates stronger return motivation than 0% or 100%
- Never show a completely empty CourseMap — always show something started (even one checked section) to create the open loop
- The resume banner exploits this directly — "You were on Course 3, Section 5" reminds users of the open loop
- Progress rings in the sidebar create persistent visual tension for incomplete courses
- After completing a course, immediately show progress on the NEXT course to maintain the loop

## When NOT to Use / Pitfalls
- Too many open loops creates anxiety, not motivation — limit visible incomplete items to 3-5
- Don't create artificial incompleteness (fake progress that can't be completed) — users will feel manipulated
- Completed items should feel satisfying ([[Peak-End Rule]]) — don't immediately replace completion with new obligations

## See Also
[[Goal Gradient Effect]], [[Peak-End Rule]], [[Serial Position & Von Restorff]], [[Spaced Retrieval]]
```

- [ ] **Step 4: Create Goal Gradient Effect**

```markdown
---
title: Goal Gradient Effect
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux]
---

# Goal Gradient Effect

**What:** Effort and motivation increase as people approach a goal. The closer to completion, the faster and harder people work. This explains why progress bars are motivating — they make proximity to the goal visible.
**Evidence:** Hull (1932) — rats ran faster as they approached food reward. Kivetz et al. (2006, Journal of Marketing Research) confirmed digitally: coffee shop loyalty card customers visited 20% more frequently as they approached the free coffee. Nunes & Drèze (2006) — "endowed progress" (pre-stamping 2 of 12 stamps vs 0 of 10) increased completion rate by 34%, despite same remaining effort.
**Maps to:** InlineProgress segmented bar (shows proximity to course completion), progress rings (percentage fills), CourseMap tile progress (visual completion state), Section checkboxes (each check = closer to goal), test score display (percentage toward perfect).

## How to Apply
- Show completion percentage, not just raw count — "80% complete" is more motivating than "8 of 10 sections"
- Segment progress visually so users see each increment as closing the gap
- Consider "endowed progress" — starting a new course with some pre-completed steps (e.g., the intro is auto-checked after reading) makes the goal feel closer
- The final 2-3 sections of a course should feel like a sprint — avoid putting the hardest content last
- Pair with [[Peak-End Rule]] — the completion moment should be the most satisfying part

## When NOT to Use / Pitfalls
- Don't gamify reading with extrinsic rewards (badges, points for passive reading) — Deci & Ryan's Self-Determination Theory shows extrinsic rewards crowd out intrinsic motivation
- Progress should reflect genuine learning, not just clicking — checked sections should represent comprehension, not page views
- Avoid manipulative dark patterns: don't inflate effort to make completion feel more rewarding

## See Also
[[Zeigarnik Effect]], [[Peak-End Rule]], [[Serial Position & Von Restorff]], [[Design Principles]]
```

- [ ] **Step 5: Create Credibility & Trust**

```markdown
---
title: Credibility & Trust
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux, ui]
---

# Credibility & Trust

**What:** Users assess a site's trustworthiness and expertise through visual design quality. Poor visual design undermines trust in the content itself, regardless of content accuracy. First impressions form in <50ms and are dominated by visual design.
**Evidence:** Fogg et al. (2002, Stanford Web Credibility Project) — study of 4,500+ users found 46.1% based credibility assessments primarily on visual design (layout, typography, color, spacing). Lindgaard et al. (2006) — visual appeal judgments are made in 50ms and correlate strongly with subsequent trust ratings. Robins & Holmes (2008) — identical content on a well-designed vs poorly-designed site: the well-designed version was rated 50% more credible.
**Maps to:** Overall visual consistency, professional typography, consistent spacing, no broken layouts or unstyled elements, error-free content rendering, responsive design (broken mobile = low trust), palette system consistency across all pages.

## How to Apply
- Visual inconsistencies (misaligned elements, inconsistent spacing, broken dark mode) directly reduce trust in study content
- This matters more for this app because users are classmates — the app must look professional enough to be taken seriously as a study resource
- Fix visual bugs before adding features — a polished incomplete app is more trustworthy than a complete but janky one
- Consistent branding (logo, palette, typography) across all pages signals reliability
- Test every page in every palette and mode — one broken page undermines the entire app's credibility

## When NOT to Use / Pitfalls
- Over-polishing at the expense of content quality — credibility comes from BOTH design and substance
- Don't add unnecessary visual complexity (gradients, shadows, decorative elements) to look "professional" — clean and simple is more trustworthy
- Academic content especially benefits from visual restraint — over-designed study material feels less serious

## See Also
[[Consistency & Design Tokens]], [[Color & Contrast]], [[Typography & Readability]], [[Nielsen's 10 Heuristics]]
```

- [ ] **Step 6: Commit**

```bash
git add "wiki/concepts/Serial Position & Von Restorff.md" "wiki/concepts/Peak-End Rule.md" "wiki/concepts/Zeigarnik Effect.md" "wiki/concepts/Goal Gradient Effect.md" "wiki/concepts/Credibility & Trust.md"
git commit -m "docs(wiki): add motivation & engagement concepts (5 pages)"
```

---

### Task 7: UX Playbook + Design Principles (2 pages)

**Files:**
- Create: `wiki/architecture/UX Playbook.md`
- Create: `wiki/architecture/Design Principles.md`
- Modify: `wiki/architecture/Pedagogy Playbook.md` (add See Also link)
- Modify: `wiki/architecture/UX Redesign.md` (add See Also links)

- [ ] **Step 1: Create UX Playbook**

```markdown
---
title: UX Playbook
type: architecture
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux, ui]
---

# UX Playbook

Operational audit checklist for Claude agents. For any page or component, run through each category, identify which principles are relevant, load those concept pages, then check the Composition section for interactions between principles.

## How to Use

1. Read this page
2. For the target page/component, scan each category below
3. Identify which principles are relevant (not all will be — skip what doesn't apply)
4. Load the concept pages for relevant principles
5. Check the Composition section for interactions between the principles you loaded
6. Load [[Design Principles]] for any UX-pedagogy tensions
7. Report findings with specific, actionable recommendations

## Layout & Structure
- [ ] [[Visual Hierarchy]] — is there a clear reading path? Do heading sizes distinguish importance?
- [ ] [[Gestalt Principles]] — are related elements grouped by proximity? Do borders/backgrounds create clear regions?
- [ ] [[Chunking]] — is content in 3-5 digestible units per level? Are sections too long?
- [ ] [[F-Pattern & Scanning]] — does layout support natural scanning? Are headings self-explanatory?
- [ ] [[Progressive Disclosure]] — are details hidden until needed? Can users expand for depth?
- [ ] [[Whitespace & Density]] — enough breathing room between sections? Consistent spacing scale?

## Interaction & Feedback
- [ ] [[Affordances & Signifiers]] — is it obvious what's clickable? Do interactive elements have hover states?
- [ ] [[Feedback & Response Time]] — does every action get visible feedback? Spinner after 400ms?
- [ ] [[Direct Manipulation]] — can users act on visible objects with immediate results?
- [ ] [[State Visibility]] — are loading, empty, error, and success states all designed?
- [ ] [[Error Prevention & Recovery]] — can users undo mistakes? Are error messages specific and actionable?

## Usability & Cognition
- [ ] [[Nielsen's 10 Heuristics]] — quick 10-point pass (visibility, consistency, error prevention, recognition, aesthetics...)
- [ ] [[Fitts's Law]] — are primary targets large and close to the action focus?
- [ ] [[Hick's Law]] — are choices kept to 5-7 per decision level?
- [ ] [[Recognition Over Recall]] — are options visible rather than requiring memory?
- [ ] [[Jakob's Law]] — does interaction match established patterns from Canvas, Notion, MDN?

## Motivation & Engagement
- [ ] [[Zeigarnik Effect]] — do open loops (incomplete progress) drive return visits?
- [ ] [[Goal Gradient Effect]] — does progress feel accelerating toward completion?
- [ ] [[Peak-End Rule]] — is the completion moment satisfying? Is the last screen positive?
- [ ] [[Serial Position & Von Restorff]] — are key items at start/end of lists? Are critical concepts visually distinct?

## Visual Polish
- [ ] [[Color & Contrast]] — WCAG AA in all palette+mode combinations? Color not the only signifier?
- [ ] [[Typography & Readability]] — line length 50-75 chars? Body ≥16px? Line height 1.5?
- [ ] [[Consistency & Design Tokens]] — using `var(--theme-*)` for all colors? Consistent spacing scale?
- [ ] [[Credibility & Trust]] — does it look professional? Any visual inconsistencies?
- [ ] [[Motion & Animation]] — is motion purposeful? prefers-reduced-motion respected?

## Responsive & Accessible
- [ ] [[Responsive Design Patterns]] — works at mobile, tablet, desktop breakpoints?
- [ ] [[Accessibility Fundamentals]] — keyboard navigable? Semantic HTML? ARIA where needed?
- [ ] [[Touch Target Sizing]] — minimum 44×44px on mobile? Adequate spacing between targets?

## Composing Principles

Principles don't exist in isolation. Here's how common combinations interact:

### Hick's Law × Progressive Disclosure
Fewer visible choices (Hick) + details on demand (PD). Resolution: show primary action prominently, nest secondary options. Both satisfied simultaneously.

### Fitts's Law × Whitespace
Large targets (Fitts) + generous spacing (Whitespace). Resolution: increase target padding rather than target count. More padding satisfies both.

### Visual Hierarchy × Chunking × Cognitive Load Theory
These three reinforce: hierarchy creates landmarks, chunking limits units per level, cognitive load sets capacity. Apply together: 3-5 chunks per section, clear heading hierarchy, one primary action per chunk.

### Consistency × Progressive Disclosure × Jakob's Law
Consistent patterns make disclosure predictable. Users learn "click to expand" once and expect it everywhere. Break consistency only when content type genuinely demands it.

### Goal Gradient × Peak-End Rule
Both govern experience endings. Goal gradient: make final stretch achievable. Peak-end: make it memorable. Apply together: accelerating progress + satisfying completion moment.

### Motion × Accessibility × Feedback
Animation provides feedback but barriers for ~10% of users. Resolution: always implement prefers-reduced-motion that preserves feedback via instant state change.

### Gestalt × Whitespace × Responsive
Proximity grouping depends on spacing, and spacing changes across breakpoints. Verify that groups remain visually grouped at mobile sizes — reduced padding can merge previously-separate groups.

## See Also
[[Design Principles]], [[Pedagogy Playbook]]
```

- [ ] **Step 2: Create Design Principles**

```markdown
---
title: Design Principles
type: architecture
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux, ui, pedagogy]
---

# Design Principles — Cross-Domain Arbiter

When UX and pedagogy principles conflict, this page provides resolution guidelines. Both the [[UX Playbook]] and [[Pedagogy Playbook]] reference this page. An agent must never silently let one domain override the other.

## Priority Model

1. **Try to satisfy both** — most "conflicts" have solutions that serve both domains simultaneously. Look for the overlap before assuming tension.
2. **When genuinely incompatible, compromise** — partial credit on both beats full credit on one. The goal is a complete experience that is visually sound AND effective at teaching.
3. **Never silently override** — flag the tension, explain the trade-off, document the choice in the code or commit message.

## Known Tensions & Resolutions

### Visual Simplicity vs Pedagogical Richness
- UX says: minimize clutter ([[Cognitive Load Theory]], [[Whitespace & Density]])
- Pedagogy says: include elaboration, examples, feedback ([[Elaborated Feedback]], [[Dual Coding]])
- **Resolution:** [[Progressive Disclosure]] — show core content clean, reveal depth on demand. Toggle Q&A, Section collapse, and "show hint" patterns satisfy both. The surface is clean; the depth is one click away.

### Animation Polish vs Learning Effectiveness
- UX says: smooth, delightful transitions ([[Motion & Animation]])
- Pedagogy says: manual-advance, prediction gates ([[Active Visualization]])
- **Resolution:** Motion serves comprehension, not decoration. Animate to show state change. Never auto-advance — always require user action. The animation makes the state change clearer; the manual control ensures the learner is engaged.

### Consistent Layout vs Desirable Difficulties
- UX says: predictable patterns reduce cognitive load ([[Jakob's Law]], [[Consistency & Design Tokens]])
- Pedagogy says: vary formats to prevent pattern-matching ([[Interleaving]], [[Desirable Difficulties]])
- **Resolution:** Consistent chrome/navigation, varied content formats within sections. The structure is stable and predictable; the exercises within that structure are diverse. Users always know WHERE they are; they can't predict WHAT type of exercise comes next.

### Minimal Choices vs Rich Practice
- UX says: reduce options to speed decisions ([[Hick's Law]])
- Pedagogy says: offer varied question types for transfer ([[Interleaving]])
- **Resolution:** Curate exercise selection, don't dump all formats at once. 3-4 exercises per section, mixed types, introduced progressively. Each exercise moment presents 1 exercise — no choice overload.

### Completion Satisfaction vs Spaced Retrieval
- UX says: satisfying completion moments ([[Peak-End Rule]], [[Goal Gradient Effect]])
- Pedagogy says: revisit old material, don't let completion = done ([[Spaced Retrieval]])
- **Resolution:** Celebrate completion AND surface review prompts. "You finished Course 3! Here are 3 questions from Courses 1-2." The completion is real and satisfying; the review keeps learning alive.

### Clean Empty States vs Productive Failure
- UX says: empty states should guide users to action ([[State Visibility]])
- Pedagogy says: let learners struggle before providing support ([[Productive Failure]])
- **Resolution:** Distinguish between navigational empty states (guide immediately — "Start Course 1") and learning empty states (challenge first, then reveal). The app never leaves users lost; but exercises can leave learners productively struggling.

### Scannability vs Deep Processing
- UX says: support skimming with clear headings and short text ([[F-Pattern & Scanning]], [[Chunking]])
- Pedagogy says: force deeper processing for retention ([[Elaborative Interrogation]])
- **Resolution:** Scannable structure with embedded "why" questions that interrupt passive reading. Headings enable navigation; inline quiz blocks and think prompts enable learning. The page structure is skimmable; the learning interactions within it are not.

## How Agents Should Use This

1. Load your domain playbook ([[UX Playbook]] or [[Pedagogy Playbook]])
2. Load this page
3. When you spot a tension between UX and pedagogy, check if it's listed above
4. If listed, follow the resolution — it's been validated
5. If not listed, flag it to the user with both sides explained
6. Never ship a design that sacrifices one domain without documenting why
7. When in doubt, the tie-breaker is: "does this help students learn better?" — if UX polish doesn't serve learning, and pedagogy doesn't degrade the interface, pedagogy wins by a hair

## See Also
[[UX Playbook]], [[Pedagogy Playbook]], [[Cognitive Load Theory]]
```

- [ ] **Step 3: Update Pedagogy Playbook — add Design Principles to See Also**

In `wiki/architecture/Pedagogy Playbook.md`, replace the See Also section:

```markdown
## See Also
[[Platform Status]], [[Content Redesign]], [[JSON Pipeline]], [[Design Principles]], [[UX Playbook]]
```

- [ ] **Step 4: Update UX Redesign — add playbook links to See Also**

In `wiki/architecture/UX Redesign.md`, replace the See Also section:

```markdown
## See Also
- [[Content Redesign]]
- [[Platform Status]]
- [[UX Playbook]]
- [[Design Principles]]
```

- [ ] **Step 5: Commit**

```bash
git add "wiki/architecture/UX Playbook.md" "wiki/architecture/Design Principles.md" "wiki/architecture/Pedagogy Playbook.md" "wiki/architecture/UX Redesign.md"
git commit -m "docs(wiki): add UX Playbook and Design Principles arbiter"
```

---

### Task 8: Sub-Index + Router + Log + Memory Update

**Files:**
- Create: `wiki/index-uxui.md`
- Modify: `wiki/index.md`
- Modify: `wiki/log.md`
- Modify: `.claude/projects/C--Users-User-Desktop-SO-os-study-guide/memory/project_wiki_expansion.md`

- [ ] **Step 1: Create index-uxui.md**

```markdown
---
title: UX/UI Index
type: architecture
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux, ui]
---

# UX/UI Index

## Playbook & Principles

- [[UX Playbook]] — Holistic page audit checklist with composition guide (load this first)
- [[Design Principles]] — Cross-domain arbiter for UX vs pedagogy tensions

## Core Usability

- [[Nielsen's 10 Heuristics]] — 10 principles, 75% of usability problems found with 3-5 evaluators (Nielsen 1994)
- [[Fitts's Law]] — Target size × distance = selection time (Fitts 1954, ISO 9241-9)
- [[Hick's Law]] — Decision time increases with choices, log₂(n) (Hick 1952)
- [[Recognition Over Recall]] — Visible options beat memory demands (Nielsen H6, Shneiderman 1987)
- [[Error Prevention & Recovery]] — Prevent slips, enable recovery (Norman 1988)
- [[Jakob's Law]] — Users expect your site to work like sites they know (Nielsen)

## Information Architecture

- [[Visual Hierarchy]] — Size, color, contrast guide attention (Few 2004, Ware 2012)
- [[Gestalt Principles]] — Proximity, similarity, closure, continuity, figure-ground (Wertheimer 1923)
- [[Progressive Disclosure]] — Essentials first, details on demand (Tidwell 2010, Nielsen 2006)
- [[Chunking]] — 3-5 digestible units per level (Miller 1956, Cowan 2001)
- [[F-Pattern & Scanning]] — Eye-tracking reading patterns for layout (Nielsen 2006, NNGroup 2017)

## Interaction Design

- [[Feedback & Response Time]] — 100ms/1s/10s thresholds, 400ms Doherty (Nielsen 1993, IBM 1982)
- [[Affordances & Signifiers]] — Perceived actionability via visual cues (Gibson 1977, Norman 2013)
- [[Direct Manipulation]] — Visible objects, immediate feedback, reversible (Shneiderman 1983)
- [[State Visibility]] — Loading, empty, populated, error states for every component (Nielsen H1)

## Visual Design

- [[Color & Contrast]] — WCAG AA 4.5:1, dark mode, color not sole signifier (W3C, Szafir 2018)
- [[Typography & Readability]] — 50-75 char lines, ≥16px body, 1.5 line-height (Dyson 2004)
- [[Whitespace & Density]] — Active negative space, 20% comprehension boost (Chaparro 2004)
- [[Consistency & Design Tokens]] — CSS vars, internal/external consistency (Nielsen H4)

## Responsive & Accessibility

- [[Responsive Design Patterns]] — Mobile-first, breakpoints, input adaptation (Wroblewski 2011)
- [[Accessibility Fundamentals]] — WCAG 2.1 AA, semantic HTML, keyboard, ARIA (W3C WAI)
- [[Touch Target Sizing]] — 44×44px minimum, 8px spacing (MIT Touch Lab, Apple/Google HIG)
- [[Motion & Animation]] — Purposeful motion, prefers-reduced-motion, 150-500ms (Material Design)

## Motivation & Engagement

- [[Serial Position & Von Restorff]] — First/last remembered best, distinct items stick (Ebbinghaus 1885)
- [[Peak-End Rule]] — Experiences judged by peak + ending (Kahneman 1993)
- [[Zeigarnik Effect]] — Incomplete tasks drive return (Zeigarnik 1927)
- [[Goal Gradient Effect]] — Motivation increases near completion (Hull 1932, Kivetz 2006)
- [[Credibility & Trust]] — 46% judge credibility by visual design (Fogg/Stanford 2002)
```

- [ ] **Step 2: Update router index.md**

Replace the content of `wiki/index.md`:

```markdown
# Wiki Index

## Domains

- [[index-oop]] — OOP: 13 courses, 24 concepts, 1 entity
- [[index-os]] — OS: (pending)
- [[index-pa]] — PA: (pending)
- [[index-pedagogy]] — Pedagogy: 15 techniques, 1 playbook
- [[index-uxui]] — UX/UI: 28 principles, 1 playbook, 1 arbiter
- [[index-platform]] — Architecture, UX, infrastructure: 7 pages

## Quick Stats

- Total pages: 97
- Last updated: 2026-04-09

See [[log]] for recent activity. See [[overview]] for platform context.
```

- [ ] **Step 3: Append to log.md**

Append to `wiki/log.md`:

```markdown

## [2026-04-09] expand | UX/UI wiki vault
- Created 28 UX/UI concept pages from research (Nielsen, Fitts, Hick, Norman, Gestalt, WCAG, Kahneman, etc.)
- Created [[UX Playbook]] holistic audit checklist with composition guide
- Created [[Design Principles]] cross-domain arbiter (UX vs pedagogy tensions)
- Created [[index-uxui]] sub-index
- Updated router [[Wiki Index|index.md]], [[Pedagogy Playbook]], [[UX Redesign]]
- Concepts: Nielsen's Heuristics, Fitts's Law, Hick's Law, Recognition Over Recall, Error Prevention, Jakob's Law, Visual Hierarchy, Gestalt Principles, Progressive Disclosure, Chunking, F-Pattern & Scanning, Feedback & Response Time, Affordances & Signifiers, Direct Manipulation, State Visibility, Color & Contrast, Typography & Readability, Whitespace & Density, Consistency & Design Tokens, Responsive Design, Accessibility, Touch Targets, Motion & Animation, Serial Position & Von Restorff, Peak-End Rule, Zeigarnik Effect, Goal Gradient, Credibility & Trust
```

- [ ] **Step 4: Update log.md summary header**

Replace the summary section at top of `wiki/log.md`:

```markdown
## Summary
- **Total operations:** 9
- **Last operation:** 2026-04-09 — UX/UI wiki vault expansion
- **Domains touched:** OOP (13 courses, 24 concepts), Platform (7 architecture pages), Pedagogy (15 techniques, 1 playbook), UX/UI (28 concepts, 1 playbook, 1 arbiter)
- **Pending domains:** OS, PA
```

- [ ] **Step 5: Update memory file**

In `.claude/projects/C--Users-User-Desktop-SO-os-study-guide/memory/project_wiki_expansion.md`, update to reflect UX/UI vault is done:

```markdown
---
name: Wiki expansion roadmap
description: Wiki sub-index system done, pedagogy done, UX/UI done. Review pipeline is next.
type: project
---
Wiki was restructured on 2026-04-09 into a sub-index system for token efficiency.

## Completed
- **Sub-index system:** Router `index.md` (~50 tokens) links to domain sub-indexes. ~90% startup token reduction at scale.
- **Pedagogy vault:** 15 technique concept pages + Pedagogy Playbook routing page + `index-pedagogy.md`. All evidence-based (Dunlosky, Roediger, Kapur, Mayer, Sweller, Bjork). Playbook maps tasks → required reading so agents load only relevant pages.
- **UX/UI vault:** 28 concept pages + UX Playbook (holistic audit checklist) + Design Principles (cross-domain arbiter) + `index-uxui.md`. Research-backed (Nielsen, Fitts, Hick, Norman, Gestalt, WCAG, Kahneman). Playbook runs category-based page audit with composition section for principle interactions. Arbiter resolves UX vs pedagogy tensions.
- **Existing domains:** OOP (13 courses, 24 concepts, 1 entity), Platform (7 architecture pages)

## Next: Multi-agent review pipeline
Spec a review pipeline with UX audit agent + pedagogy audit agent + inspector agent + retry budget.
See memory file `project_review_pipeline.md` for details.

## Future domains (not started)
- OS subject content (pending OS curation)
- PA subject content (pending PA curation)
```

- [ ] **Step 6: Commit**

```bash
git add "wiki/index-uxui.md" "wiki/index.md" "wiki/log.md"
git commit -m "docs(wiki): add UX/UI sub-index, update router and log"
```
