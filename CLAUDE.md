# CLAUDE.md — Study Guide Platform

## What this is
A multi-subject university study guide web app (React 19 + Vite 8 + Tailwind CSS v4). Deployed on GitHub Pages at https://corgigh.github.io/Ghid_Studii_AI/

## Tech stack
- **React 19** with `react-router-dom` v7 (HashRouter for GitHub Pages)
- **Vite 8** with `@tailwindcss/vite`
- **Tailwind CSS v4** (CSS-first config, dark mode via `@custom-variant`)
- No other dependencies. No state management library — uses React Context.

## Architecture

### Routing
- `/#/` — Home (subject picker cards by year/semester)
- `/#/y1s2/os` — Subject page, Courses tab
- `/#/y1s2/os/practice` — Subject page, Practice tab

### Key files
- `src/main.jsx` — Entry: HashRouter + AppProvider wrapping
- `src/App.jsx` — Routes shell (~20 lines)
- `src/contexts/AppContext.jsx` — All shared state: `dark`, `lang`, `search`, `checked`, plus `t(en, ro)` helper, `toggleCheck()`, `highlight()`
- `src/hooks/useLocalStorage.js` — Persist state to localStorage
- `src/content/registry.js` — Master index of all subjects and year/semesters

### Adding a new subject
1. Create `src/content/<slug>/index.js` with metadata + lazy course imports
2. Create `src/content/<slug>/practice/Practice.jsx`
3. Add import + entry in `src/content/registry.js` (subjects array + yearSemesters)

### Adding a course to an existing subject
1. Create `src/content/<slug>/courses/CourseNN.jsx` — React component using `useApp()` for `t`, `checked`, `toggleCheck`
2. Add lazy import entry to `src/content/<slug>/index.js` courses array

### Bilingual system
- `t(en, ro)` helper returns Romanian when `lang === 'ro'`, English otherwise
- Every text string in content uses `t('English text', 'Romanian text')`
- Code blocks stay in English (they're actual commands/syntax)
- Default language is Romanian

### Component library (src/components/ui/)
- `Box` — Colored callout (types: definition, theorem, warning, formula, code)
- `Code` — Monospace code block
- `Toggle` — Show/hide Q&A (props: question, answer, hideLabel, showLabel)
- `Section` — Collapsible section with checkbox (props: title, id, checked, onCheck)
- `CourseBlock` — Course-level collapsible container
- `MultipleChoice` — Multiple choice quiz with answer checking
- `SubjectCard` — Home page subject card
- `TabBar` — Courses/Practice tab switcher

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
