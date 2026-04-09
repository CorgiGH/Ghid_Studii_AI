# UX/UI Wiki Vault — Design Spec

## Goal

Create a research-backed UX/UI knowledge base in the wiki following the same pattern as the pedagogy vault. 28 concept pages with empirical citations, a holistic UX Playbook for page audits, a cross-domain Design Principles arbiter page, and an `index-uxui.md` sub-index.

## Why

UX knowledge is currently scattered across CLAUDE.md rules, memory feedback files, and the `UX Redesign` architecture page (which is just a feature list). Agents doing frontend work have no structured, loadable UX context. The pedagogy vault proved this pattern works — targeted concept pages with a playbook router.

## Non-Goals

- No code changes to the app itself
- No refactoring of existing components
- No site-wide audit (that's the separate multi-agent review pipeline)
- Don't duplicate pedagogy concepts already in the wiki (Cognitive Load Theory, Dual Coding, etc.) — cross-reference them instead

## Architecture

### Files Created

```
wiki/index-uxui.md                          # Sub-index (added to router)
wiki/architecture/UX Playbook.md            # Holistic audit checklist + composition
wiki/architecture/Design Principles.md      # Cross-domain arbiter (UX vs pedagogy)
wiki/concepts/<28 concept pages>.md         # Research-backed concept pages
```

### index-uxui.md

Sub-index linked from `wiki/index.md` router. Lists all 28 concept pages grouped by cluster, plus links to UX Playbook and Design Principles. Same format as `index-pedagogy.md`.

### Router Update

Add to `wiki/index.md`:
```
- [[index-uxui]] — UX/UI: 28 principles, 1 playbook, 1 arbiter
```

## Concept Pages (28)

Each page follows the pedagogy vault format:

```markdown
---
title: <Principle Name>
type: concept
created: 2026-04-09
updated: 2026-04-09
sources: []
tags: [ux] or [ui] or [ux, ui]
---

# <Principle Name>

**What:** <Definition — 1-2 sentences>
**Evidence:** <Key study, author, year, effect size or finding>
**Maps to:** <Which platform components this affects>

## How to Apply
- <Actionable rules for agents, 3-5 bullets>

## When NOT to Use / Pitfalls
- <Guardrails, 2-3 bullets>

## See Also
<Wikilinks to related concepts, both UX and pedagogy where relevant>
```

### Cluster 1: Core Usability (6)

1. **Nielsen's 10 Heuristics** — Visibility, feedback, consistency, error prevention, flexibility, efficiency, aesthetics, help users recognize/recover, documentation. (Nielsen & Molich 1990, Nielsen 1994). Maps to: all components, especially navigation and error states.

2. **Fitts's Law** — Time to acquire a target is a function of distance to and size of the target. (Fitts 1954, ISO 9241-9). Maps to: button sizing, sidebar click targets, mobile touch areas, CourseNavigation prev/next buttons.

3. **Hick's Law** — Decision time increases logarithmically with the number of choices. (Hick 1952, Hyman 1953). Maps to: subject picker, palette picker, content type bar tab count, quiz option count.

4. **Recognition Over Recall** — Minimize memory load by making options visible. (Nielsen heuristic #6; Shneiderman 1987). Maps to: sidebar course list, breadcrumbs, content type bar, search functionality.

5. **Error Prevention & Recovery** — Design to prevent errors; when they occur, offer clear recovery. (Norman 1988, *Design of Everyday Things*). Maps to: form inputs, quiz submission, code editor, terminal challenges, navigation dead-ends.

6. **Jakob's Law** — Users expect your site to work like sites they already know. (Nielsen usability corpus, NNGroup). Maps to: sidebar behavior, tab patterns, card layouts — expectations set by Canvas, Notion, MDN, W3Schools.

### Cluster 2: Information Architecture (5)

7. **Visual Hierarchy** — Size, color, contrast, and spacing guide attention in predictable order. (Few 2004, Ware 2012 *Information Visualization*). Maps to: Section headings, Box callout types, code block prominence, TopBar vs content distinction.

8. **Gestalt Principles** — Proximity, similarity, closure, continuity, figure-ground — how humans perceive grouped elements. (Wertheimer 1923, Koffka 1935). Maps to: card grids (SubjectCard, CourseMap tiles), sidebar grouping, progress ring placement near course titles.

9. **Progressive Disclosure** — Show essentials first, details on demand. (Tidwell 2010 *Designing Interfaces*, Nielsen 2006). Maps to: Section collapse, Toggle Q&A, CourseBlock expand, sidebar hover-reveal, progressive hint system.

10. **Chunking** — Group information into 3-5 digestible units. (Miller 1956 "magical number seven"). Maps to: step count per course, section count per step, quiz options per question. Cross-ref: [[Cognitive Load Theory]].

11. **F-Pattern & Scanning** — Eyes scan in F-shape for text-heavy pages; layer-cake pattern when headings are strong. (Nielsen 2006 eyetracking, NNGroup 2017 update). Maps to: Section heading wording (must be self-explanatory), content layout, sidebar scan order.

### Cluster 3: Interaction Design (4)

12. **Feedback & Response Time** — 100ms = instantaneous, 1s = flow maintained, 10s = attention lost. 400ms Doherty threshold for productivity. (Nielsen 1993, Doherty & Thadani 1982 IBM). Maps to: route transitions, Judge0 code execution, sidebar animations, progress ring updates, API responses.

13. **Affordances & Signifiers** — Objects should suggest how they can be used; visual cues indicate actionability. (Gibson 1977, Norman 2013 *Design of Everyday Things* revised). Maps to: clickable elements need hover states, Toggle show/hide cues, Section checkbox visibility, CodeChallenge run button.

14. **Direct Manipulation** — Users act on visible objects with immediate, reversible feedback. (Shneiderman 1983). Maps to: Section checkboxes (direct toggle), code editor (live typing), terminal (immediate command feedback), sidebar lock toggle.

15. **State Visibility** — System status must be visible at all times: loading, empty, error, success states. (Nielsen heuristic #1). Maps to: InlineProgress bar, empty course map, API loading spinners, build/deploy status, test score display.

### Cluster 4: Visual Design (4)

16. **Color & Contrast** — WCAG AA minimum 4.5:1 for text, 3:1 for large text. Color should not be the only signifier. Dark mode requires independent contrast verification. (W3C WCAG 2.1, Szafir 2018). Maps to: palette system (5 palettes × 2 modes = 10 contrast checks), Box callout colors, progress ring color states, code syntax highlighting.

17. **Typography & Readability** — Optimal line length 50-75 characters, line height 1.4-1.6×, minimum 16px body text. (Dyson 2004, Ling & van Schaik 2006). Maps to: course content max-width, code block font size, mobile text scaling, Section heading hierarchy.

18. **Whitespace & Density** — Generous whitespace improves comprehension by 20% but reduces content per screen. (Chaparro et al. 2004, Wichmann et al. 2000). Maps to: spacing between Sections, Box margin/padding, card grid gaps, sidebar item spacing.

19. **Consistency & Design Tokens** — Internal consistency (same patterns across app) and external consistency (matching platform conventions). CSS custom properties as single source of truth. (Nielsen heuristic #4). Maps to: `var(--theme-*)` CSS variables, component prop naming, spacing scale, border radius, shadow depth.

### Cluster 5: Responsive & Accessibility (4)

20. **Responsive Design Patterns** — Mobile-first, breakpoint strategy, fluid vs adaptive layouts. (Wroblewski 2011 *Mobile First*, Google Material guidelines). Maps to: BottomSheet mobile sidebar, content reflow, TopBar collapse behavior, touch-friendly quiz options.

21. **Accessibility Fundamentals** — WCAG 2.1 Level AA: semantic HTML, keyboard navigation, screen reader support, focus management, ARIA roles. (W3C WAI). Maps to: all interactive components (Section, Toggle, CodeEditor, MultipleChoice), route change announcements, focus trapping in modals.

22. **Touch Target Sizing** — Minimum 44×44px (WCAG), 48×48dp (Google), 44pt (Apple). Adequate spacing between targets. (MIT Touch Lab 2003, Apple HIG, Material Design). Maps to: Section checkboxes, sidebar course items, quiz options, mobile navigation buttons, palette picker circles.

23. **Motion & Animation** — Purpose-driven motion: guide attention, show relationships, provide feedback. Respect `prefers-reduced-motion`. Duration 150-500ms for UI, ease-out for enter, ease-in for exit. (Disney 12 principles adapted for UI, Material Design motion guidelines). Maps to: Section expand/collapse, InlineProgress celebration, BottomSheet drag, route transitions, StepPlayer advance.

### Cluster 6: Motivation & Engagement (5)

24. **Serial Position & Von Restorff Effects** — First and last items in a list are remembered best; visually distinct items are remembered disproportionately. (Ebbinghaus 1885, Von Restorff 1933). Maps to: sidebar course ordering, Box callout styling (definition/warning/theorem stand out), key concept placement within sections.

25. **Peak-End Rule** — Experiences are judged by their most intense moment and their ending, not the average. (Kahneman & Fredrickson 1993). Maps to: course completion celebration (green flash + toast), test result display, final section of each course, session end state.

26. **Zeigarnik Effect** — Incomplete tasks are remembered better than completed ones; open loops drive return visits. (Zeigarnik 1927). Maps to: progress rings (partially filled), InlineProgress segmented bar, CourseMap showing started-but-unfinished courses, resume banner.

27. **Goal Gradient Effect** — Motivation and effort increase as people approach a goal. (Hull 1932, Kivetz et al. 2006). Maps to: progress percentage display, "almost there" UI cues, section completion acceleration. Caution: don't gamify reading with extrinsic rewards (Deci & Ryan SDT — extrinsic can crowd out intrinsic).

28. **Credibility & Trust** — Users judge content trustworthiness by visual design quality. 46.1% base credibility on layout, typography, color. (Fogg et al. 2002, Stanford Web Credibility Project). Maps to: overall polish, consistent spacing, professional typography, no broken layouts or unstyled elements. Particularly important because this app is shared with classmates as a study resource.

## UX Playbook

Lives at `wiki/architecture/UX Playbook.md`. Type: `architecture`. Tags: `[ux, ui]`.

### Purpose

Holistic page/component audit checklist. An agent reads this, evaluates a page against all categories, identifies which principles are relevant, loads those concept pages, then uses the Composition section to understand how they interact.

### Structure

```
# UX Playbook

## How to Use
For any page/component, run through each category below.
Identify which principles are relevant, load those concept pages,
then check the Composition section for interactions.

## Layout & Structure
- [ ] Visual Hierarchy — clear reading path?
- [ ] Gestalt Principles — related elements grouped?
- [ ] Chunking — digestible units?
- [ ] F-Pattern & Scanning — layout matches scan behavior?
- [ ] Progressive Disclosure — details hidden until needed?
- [ ] Whitespace & Density — enough breathing room?

## Interaction & Feedback
- [ ] Affordances & Signifiers — obvious what's clickable?
- [ ] Feedback & Response Time — every action gets a response?
- [ ] Direct Manipulation — users act on visible objects?
- [ ] State Visibility — loading/empty/error states covered?
- [ ] Error Prevention & Recovery — users can undo mistakes?

## Usability & Cognition
- [ ] Nielsen's Heuristics — quick 10-point pass
- [ ] Fitts's Law — targets sized/placed well?
- [ ] Hick's Law — choices manageable?
- [ ] Recognition Over Recall — options visible?
- [ ] Jakob's Law — matches user expectations?

## Motivation & Engagement
- [ ] Zeigarnik Effect — open loops drive return?
- [ ] Goal Gradient — progress feels accelerating?
- [ ] Peak-End Rule — ending is satisfying?
- [ ] Serial Position & Von Restorff — key items placed/styled for memory?

## Visual Polish
- [ ] Color & Contrast — WCAG compliant, dark mode checked
- [ ] Typography & Readability — line length, size, height
- [ ] Consistency & Design Tokens — CSS vars, not hardcoded
- [ ] Credibility & Trust — looks professional
- [ ] Motion & Animation — purposeful, reduced-motion safe

## Responsive & Accessible
- [ ] Responsive Design — all breakpoints work
- [ ] Accessibility — keyboard, screen reader, semantic HTML
- [ ] Touch Targets — minimum sizes met

## Composing Principles
How principles interact and common resolution patterns:

### Hick's Law × Progressive Disclosure
Tension: fewer choices (Hick) vs hiding things (Progressive Disclosure).
Resolution: show the primary action prominently, nest secondary options.
Both are satisfied — fewer visible choices AND full functionality available.

### Fitts's Law × Whitespace
Tension: large targets (Fitts) vs generous spacing (Whitespace).
Resolution: increase target padding rather than target count.
A button with more padding satisfies both.

### Visual Hierarchy × Chunking × Cognitive Load Theory
These three reinforce each other: hierarchy creates scanning landmarks,
chunking limits units per level, cognitive load sets the capacity ceiling.
Apply together: 3-5 chunks per section, clear heading hierarchy, one
primary action per chunk.

### Consistency × Progressive Disclosure × Jakob's Law
Consistent interaction patterns make progressive disclosure predictable.
Users learn "click to expand" once and expect it everywhere.
Break consistency only when the content type genuinely demands it.

### Goal Gradient × Peak-End Rule
Both govern the end of an experience. Goal gradient says make the
final stretch feel achievable. Peak-end says make it memorable.
Apply together: accelerating progress indicators + satisfying completion moment.

### Motion × Accessibility × Feedback
Animation provides feedback but can be an accessibility barrier.
Resolution: always implement prefers-reduced-motion alternative that
preserves the feedback (e.g., instant state change instead of transition).

## See Also
[[Design Principles]], [[Pedagogy Playbook]]
```

## Design Principles (Cross-Domain Arbiter)

Lives at `wiki/architecture/Design Principles.md`. Type: `architecture`. Tags: `[ux, ui, pedagogy]`.

### Purpose

Resolution guidelines for when UX and pedagogy principles conflict. Referenced by both the UX Playbook and Pedagogy Playbook. An agent must never silently let one domain override the other.

### Content

```
# Design Principles — Cross-Domain Arbiter

## Purpose
When UX and pedagogy principles conflict, this page provides resolution
guidelines. Both playbooks reference this page. An agent must never
silently let one domain override the other.

## Priority Model
1. Try to satisfy both — most "conflicts" have solutions that serve
   both domains simultaneously
2. When genuinely incompatible, compromise — partial credit on both
   beats full credit on one
3. Never silently override — flag the tension, explain the trade-off,
   document the choice

## Known Tensions & Resolutions

### Visual Simplicity vs Pedagogical Richness
UX says: minimize clutter (Cognitive Load, Whitespace)
Pedagogy says: include elaboration, examples, feedback (Elaborated Feedback, Dual Coding)
Resolution: Progressive Disclosure — show core content clean, reveal depth on demand.
Toggle Q&A, Section collapse, and "show hint" patterns satisfy both.

### Animation Polish vs Learning Effectiveness
UX says: smooth, delightful transitions (Motion & Animation)
Pedagogy says: manual-advance, prediction gates (Active Visualization)
Resolution: motion serves comprehension, not decoration. Animate to show
state change. Never auto-advance — always require user action.

### Consistent Layout vs Desirable Difficulties
UX says: predictable patterns reduce cognitive load (Jakob's Law, Consistency)
Pedagogy says: vary formats to prevent pattern-matching (Interleaving, Desirable Difficulties)
Resolution: consistent chrome/navigation, varied content formats within sections.
Structure is stable, exercises are diverse.

### Minimal Choices vs Rich Practice
UX says: reduce options to speed decisions (Hick's Law)
Pedagogy says: offer varied question types for transfer (Interleaving)
Resolution: curate exercise selection, don't dump all formats at once.
3-4 exercises per section, mixed types, introduced progressively.

### Completion Satisfaction vs Spaced Retrieval
UX says: satisfying completion moments (Peak-End Rule, Goal Gradient)
Pedagogy says: revisit old material, don't let completion = done (Spaced Retrieval)
Resolution: celebrate completion AND surface review prompts.
"You finished Course 3! Here are 3 questions from Courses 1-2."

### Clean Empty States vs Productive Failure
UX says: empty states should guide users to action (State Visibility)
Pedagogy says: let learners struggle before providing support (Productive Failure)
Resolution: distinguish between navigational empty states (guide immediately)
and learning empty states (challenge first, then reveal).

### Scannability vs Deep Processing
UX says: support skimming with clear headings and short text (F-Pattern, Chunking)
Pedagogy says: force deeper processing for retention (Elaborative Interrogation)
Resolution: scannable structure with embedded "why" questions that interrupt
passive reading. Headings enable navigation; inline questions enable learning.

## How Agents Should Use This
1. Load your domain playbook (UX or Pedagogy)
2. Load this page
3. When you spot a tension, check if it's listed above
4. If listed, follow the resolution
5. If not listed, flag it to the user with both sides explained
6. Never ship a design that sacrifices one domain without documenting why
```

## Update Existing Pages

### Pedagogy Playbook
Add to See Also: `[[Design Principles]]`

### UX Redesign (architecture page)
Add to See Also: `[[UX Playbook]]`, `[[Design Principles]]`

### wiki/log.md
Append entry for the vault creation.

## Summary

| Item | Count |
|------|-------|
| Concept pages | 28 |
| Architecture pages | 2 (UX Playbook, Design Principles) |
| Sub-index | 1 (index-uxui.md) |
| Router update | 1 line in index.md |
| Existing page updates | 3 (Pedagogy Playbook, UX Redesign, log.md) |
| **Total new files** | **31** |
| Code changes | 0 |
