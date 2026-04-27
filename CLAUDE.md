# CLAUDE.md — Study Guide Platform

## What this is
A multi-subject university study guide web app (React 19 + Vite 8 + Tailwind CSS v4). Deployed on GitHub Pages at https://corgigh.github.io/Ghid_Studii_AI/

## Tech stack
- **React 19** with `react-router-dom` v7 (BrowserRouter; GitHub Pages SPA fallback via `public/404.html` shim — see Routing)
- **Vite 8** with `@tailwindcss/vite`
- **Tailwind CSS v4** (CSS-first config, dark mode via `@custom-variant`)
- No other dependencies. No state management library — uses React Context.

## Architecture

### Routing
BrowserRouter with `basename={import.meta.env.BASE_URL}` (see `src/main.jsx`). URLs are real paths, no `#/`:
- `/` (or `/Ghid_Studii_AI/` in production) — Home
- `/y1s2/os` — Subject page, Courses tab
- `/y1s2/os/practice` — Subject page, Practice tab

GitHub Pages doesn't natively support SPA deep-link refresh. `public/404.html` (rafgraf SPA shim) catches unknown paths and rewrites them into `/?/<path>` query strings; a decode block in `index.html` runs before BrowserRouter mounts and `replaceState`s the URL back to the real path. A second block in `index.html` handles legacy `/#/<path>` bookmarks (HashRouter holdovers from before 2026-04-27) and rewrites them to the BrowserRouter form.

### Key files
- `src/main.jsx` — Entry: HashRouter + AppProvider wrapping
- `src/App.jsx` — Routes shell (~20 lines)
- `src/contexts/AppContext.jsx` — All shared state: `dark`, `lang`, `palette`, `search`, `checked`, plus `t(en, ro)` helper, `toggleCheck()`, `highlight()`
- `src/hooks/useLocalStorage.js` — Persist state to localStorage
- `src/content/registry.js` — Master index of all subjects and year/semesters
- `src/theme/palettes.js` — 5 color palette definitions + `applyPalette()` function

### Adding a new subject
1. Create `src/content/<slug>/index.js` with metadata + lazy course imports
2. Create `src/content/<slug>/practice/Practice.jsx`
3. Add import + entry in `src/content/registry.js` (subjects array + yearSemesters)
4. Each course entry must include `sectionCount` (number of `<Section>` components in that course file)

### Adding a course to an existing subject
1. **New courses are JSON.** Create `src/content/<slug>/courses/course-NN.json` matching the canonical course shape (see Content shapes below).
2. Add an entry to `src/content/<slug>/index.js` with `id`, `src` (relative path), `metaId`, `title`, `shortTitle`, `sectionCount`. Loaded via `loadJson(src)` in `CourseRenderer`.
3. Run `npm run validate` to confirm schema + bilingual gaps are clean.

### Content shapes (canonical — freeze unless explicitly migrating)

**Why this section exists:** as of 2026-04-27 the corpus has 3 coexisting shapes (legacy JSX, JSON courses, ALO-style JSON seminars). New content uses JSON; JSX is acceptable maintenance state but no new JSX should be added.

| Type | Canonical shape | Path | Example |
|---|---|---|---|
| Course | JSON `{ meta, steps[].blocks[] }` | `src/content/<slug>/courses/course-NN.json` | `os/courses/course-01.json` |
| Test | JSON `{ meta, questions[] }` | `src/content/<slug>/tests/<slug>.json` | `pa/tests/partial-2025-a.json` |
| Seminar (ALO style) | JSON `{ id, title, problems[] }` | `src/content/<slug>/seminars/seminar-NN.json` | `alo/seminars/seminar-01.json` |
| Lab | **JSX** (legacy — no JSON migration scheduled) | `src/content/<slug>/labs/LabNN.jsx` | `os/labs/Lab01.jsx` |
| Seminar (OS / PA style, legacy) | **JSX** | `src/content/<slug>/seminars/SeminarNN.jsx` | `os/seminars/Seminar01.jsx` |
| Practice tab | JSX | `src/content/<slug>/practice/Practice.jsx` | `os/practice/Practice.jsx` |

**Course block types** (consumed by `CourseRenderer`): `learn`, `callout`, `info`, `tip`, `warning`, `danger`, `example`, `definition`, `quiz`, `code`, `think`, `table`, `list`, `figure`, `image`, `equation`, `video`. Every new block type needs a registered renderer in `src/components/blocks/`.

**Test question types** (consumed by `TestRenderer`): `multiple-choice`, `fill-in`, `code-writing`, `bash-scripting`, `open-ended`. Open-ended/code-writing should include a `commonErrors` field (lint rule R5).

**Bilingual rule:** every user-facing string is `{ en, ro }`. Code/commands stay in English. Validators (`scripts/validate-bilingual.mjs`) flag any one-sided object.

**Parked work** (do not extend, do not delete; revisit when subject reaches priority):
- prob-stat: placeholder. Empty `courses: []` in registry. Adding it follows the canonical course-JSON shape above.
- PA KaTeX rewrite (courses 2-6): partial — see `project_pa_full_review_2026_04_14` memory.

**Mechanical gates** (run via `npm run validate` — wired into `.github/workflows/deploy.yml`):
- `scripts/validate-bilingual.mjs` — `{en, ro}` completeness
- `scripts/validate-course-json.mjs` — course schema (meta + steps + blocks)
- `scripts/validate-test-json.mjs` — test schema (meta + questions)
- `scripts/lint-site.mjs` — 8 cross-file rules (advisory, see header for rule list)
- `scripts/smoke-test.mjs` — Puppeteer route walker, blocks deploy on ErrorBoundary / pageerror / console.error / empty content / stuck-Suspense

**Manual gate** (no CI hook):
- `scripts/content-truth-check.mjs` — LLM second-grader for MC answer keys, comparing against an out-of-band Gemini call. Run locally for audits (`node scripts/content-truth-check.mjs --all`). Was wired to CI as advisory then pulled per council 1777313729 (advisory + same-model-family + silently-skipped-without-secret laundered confidence).

### Bilingual system
- `t(en, ro)` helper returns Romanian when `lang === 'ro'`, English otherwise
- Every text string in content uses `t('English text', 'Romanian text')`
- Code blocks stay in English (they're actual commands/syntax)
- Default language is Romanian

### Theme system
- 5 color palettes: Slate, Warm Stone, Ocean Blue, Zinc, Forest Green
- Each palette defines light + dark mode colors for: nav, content, sidebar, breadcrumbs, cards, borders, text
- Colors applied via CSS custom properties (`--theme-nav-bg`, `--theme-content-bg`, etc.) set on `:root`
- `applyPalette(paletteId, isDark)` in `src/theme/palettes.js` sets all CSS vars
- Palette preference stored in localStorage via `palette` state in AppContext
- **All new/modified components must use `var(--theme-*)` for colors, not hardcoded Tailwind `dark:` classes**
- Accent color (blue) remains hardcoded `#3b82f6` across palettes

### Navigation layout
- **TopBar** (`src/components/layout/TopBar.jsx`) — Persistent header with: brand, subject switcher dropdown (pill chips), language toggle, palette picker (🎨), dark mode toggle
- **ContentTypeBar** (`src/components/ui/ContentTypeBar.jsx`) — Secondary nav row below TopBar. Data-driven: only shows content types the subject actually has
- **Breadcrumbs** (`src/components/layout/Breadcrumbs.jsx`) — Clickable trail: Home / Year Sem / Subject / Tab / Item
- **Sidebar** (`src/components/layout/Sidebar.jsx`) — Course list with inline progress rings, hover-zone triggered on desktop, lockable. No auto-peek on completion.

### Progress feedback
- **ProgressRing** (`src/components/ui/ProgressRing.jsx`) — Reusable SVG ring. Props: `size`, `completed`, `total`, `isActive`. Color states: green=complete, blue=active, amber=started, grey=not-started
- **InlineProgress** (`src/components/ui/InlineProgress.jsx`) — Sticky segmented progress bar below TopBar. Left-to-right fill by count (not section-specific). Includes celebration animations: green flash, +1 floater, counter bounce, completion merge. Shows a center popup toast on course completion (auto-dismisses after 1.2s). Uses ProgressRing for the counter.
- **CourseMap** (`src/components/ui/CourseMap.jsx`) — Bird's-eye grid of course tiles with progress rings. Shows on Courses tab when no course is selected
- **CourseNavigation** (`src/components/ui/CourseNavigation.jsx`) — Prev/next course links at bottom of course content

### Component library (src/components/ui/)
- `Box` — Colored callout (types: definition, theorem, warning, formula, code)
- `Code` — Monospace code block
- `Toggle` — Show/hide Q&A (props: question, answer, hideLabel, showLabel)
- `Section` — Collapsible section with checkbox (props: title, id, checked, onCheck)
- `CourseBlock` — Course-level collapsible container (themed with CSS vars)
- `MultipleChoice` — Multiple choice quiz with answer checking
- `CodeEditor` — CodeMirror 6 wrapper with C syntax highlighting and dark mode
- `CodeChallenge` — Interactive coding problem: editor + Judge0 API execution + answer checking
- `V86Terminal` — Real Linux terminal via v86 x86 emulator (boots Buildroot Linux in browser, ~7MB)
- `TerminalChallenge` — Unified terminal exercise component: v86 for practice, serial-exec for auto-check
- `SubjectCard` — Home page subject card (themed with CSS vars)
- `PalettePicker` — Popover with 5 flat color circles for theme switching

### Math rendering + PDF-to-image pipeline
- **KaTeX** is installed for math rendering. Inline `$...$` and display `$$...$$` syntax works inside `learn`, `callout`, `definition`, and `think` blocks (routed through `formatMarkdown`)
- **`equation` block type** — standalone centered equation block; takes a TeX string, renders via KaTeX display mode
- **`scripts/extract-pdf-pages.mjs`** — rasterizes lecture PDFs into `public/course-media/<subject>/<course>/page-NN.png` (uses pdfjs + canvas). Run once per lecture PDF; delete unreferenced pages before commit
- **Image references in JSON** — use relative path `course-media/<subject>/<course>/page-NN.png` inside `image`/`figure` blocks
- **`ImageBlock`** — resolves paths against Vite's `BASE_URL` so they work both locally and under the GitHub Pages subpath

### Code execution (Judge0 CE)
- API: `POST https://ce.judge0.com/submissions?wait=true`
- No API key needed. C language_id = 50.
- Used by `CodeChallenge` component for "Run" button
- Status codes: 3=Accepted, 6=Compilation Error, 11=Runtime Error, 5=Time Limit

## Current subjects (Year 1, Semester 2)
- **os** — Operating Systems (11 courses, fully populated with bilingual content + practice problems)
- **prob-stat** — Probabilities & Statistics (placeholder)
- **alo** — Linear Algebra & Optimization (placeholder)
- **pa** — Algorithm Design / Proiectarea Algoritmilor (placeholder)

## Build & deploy
```bash
npm run dev          # Local dev server
npm run build        # Production build
git push             # Auto-deploys via GitHub Actions to Pages
```

## GitHub
- Repo: https://github.com/CorgiGH/Ghid_Studii_AI
- Deploys via `.github/workflows/deploy.yml` on push to main
- Uses `base: '/Ghid_Studii_AI/'` in vite.config.js for GitHub Pages subpath

## LLM Wiki

A persistent knowledge base at `wiki/` (Obsidian vault, gitignored). Claude maintains all wiki pages; the user curates raw sources and directs analysis.

### Three Layers
1. **Raw sources** (`wiki/raw/`) — Immutable. PDFs, web clips, notes, images. Claude reads but never modifies.
2. **Wiki pages** (`wiki/` subdirs) — LLM-owned. Summaries, entities, concepts, architecture, comparisons. Claude creates/updates/maintains.
3. **Schema** (this section) — Loaded every session. Defines conventions and workflows.

### Directory Layout
- `wiki/raw/{assets,pdfs,articles,notes,other}/` — user drops sources here
- `wiki/sources/` — one summary page per ingested source
- `wiki/entities/` — specific things (components, tools, subjects)
- `wiki/concepts/` — ideas (pedagogy techniques, design patterns)
- `wiki/architecture/` — platform architecture, infra, decisions
- `wiki/comparisons/` — side-by-side analyses filed from queries
- `wiki/index.md` — router index (links to domain sub-indexes)
- `wiki/index-oop.md` — OOP sources, entities, concepts
- `wiki/index-os.md` — OS sources, concepts
- `wiki/index-pa.md` — PA sources, concepts
- `wiki/index-platform.md` — architecture, UX, infrastructure, pedagogy
- `wiki/log.md` — chronological operation record (summary header + entries)
- `wiki/overview.md` — high-level synthesis front page

### Page Format
Every wiki page MUST have YAML frontmatter with: `title`, `type` (source|entity|concept|architecture|comparison), `created`, `updated`, `sources` (list of raw filenames), `tags` (from curated set).
- Use `[[wikilinks]]` for all cross-references (Obsidian-native)
- Cross-references must be bidirectional (if A links B, B links A)
- Update `updated:` date on every page edit
- Trace every claim to raw sources via `sources:` field

### Tag Set
`os`, `oop`, `pa`, `prob-stat`, `alo`, `pedagogy`, `ui`, `ux`, `architecture`, `infrastructure`, `components`, `deployment`, `testing`, `design-decisions`

### Operations

**Ingest** — user drops source in `raw/`, tells Claude to process it:
- *Collaborative:* Claude reads source, discusses takeaways, user guides emphasis, Claude updates wiki
- *Autonomous:* Claude processes end-to-end, gives short summary of changes
- For PDFs: run `node scripts/wiki-ingest.mjs <path>` (calls Gemini 3 Flash Preview), then integrate output
- For text/markdown: Claude reads directly
- Always: write/update summary page in `sources/`, update entity/concept pages, update the relevant domain sub-index (e.g., `index-oop.md`), append to `log.md`

**Query** — user asks a question:
- Read `index.md` (router) to identify the domain, then read the relevant sub-index, then drill into pages
- Synthesize answer with `[[wikilink]]` citations
- If answer is substantial/reusable, offer to file as new wiki page

**Lint** — health check (user-triggered or Claude-suggested):
- Orphan pages (no inbound links)
- Mentioned concepts without own page
- Stale pages (old `updated`, newer sources exist)
- Contradictions between pages
- Missing cross-references
- Report findings, fix with user approval

### Maintenance Rules
- Update the relevant domain sub-index after every page creation or modification. Update the router `index.md` only when adding a new domain. Quick stats (page count) are best-effort, updated during lint operations.
- Append to `log.md` after every operation (format: `## [YYYY-MM-DD] type | Title`)
- Keep cross-references bidirectional
- When new info contradicts existing pages, flag contradiction explicitly in both pages
- `raw/` is read-only — never modify source documents

### Startup
When wiki work is expected, read `wiki/index.md` (router). Based on the query domain, read the relevant sub-index (e.g., `index-oop.md` for OOP questions). Read the `## Summary` header of `wiki/log.md` for recent activity context.

## Enhanced Pipeline Rules

### Model Routing
- Use haiku agents for: JSON validation, formatting checks, file listing, simple searches
- Use opus for: content creation, architectural decisions, review analysis

### Validation Gates
After creating or modifying any JSON file, ALWAYS run:
- `node scripts/validate-course-json.mjs <file>` for course JSONs
- `node scripts/validate-test-json.mjs <file>` for test JSONs
- `node scripts/validate-bilingual.mjs <file>` for any JSON with bilingual content

Fix all errors before proceeding.

### Self-Review Checklist
After completing each task, verify:
1. All JSON files pass validation scripts
2. `npm run build` succeeds with no errors
3. No hardcoded English-only text (all user-facing strings use {en, ro})
4. Section IDs are descriptive (e.g., os-c1-intro, not os-c1-0)
5. Block types match component expectations (learn content=string, code code=string, quiz questions=array)
