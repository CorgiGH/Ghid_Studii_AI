# OOP Subject Design Spec

## Overview

Add Object-Oriented Programming (OOP / Programare Orientata pe Obiecte) as a new subject to the study guide platform under Year 1, Semester 2. Content sourced from https://gdt050579.github.io/poo_course_fii/home.html.

## Subject Metadata

- **Slug**: `oop`
- **Year/semester**: `y1s2`
- **Title**: EN "Object-Oriented Programming", RO "Programare Orientata pe Obiecte"
- **Short title**: EN "OOP", RO "POO"
- **Route**: `/#/y1s2/oop`

## File Structure

```
src/content/oop/
  index.js                    — metadata + lazy imports
  courses/
    Course01.jsx              — Introduction
    Course02.jsx              — C++ Language Specifiers
    Course03.jsx              — Creating an Object
    Course04.jsx              — Operators
    Course05.jsx              — Inheritance
    Course06.jsx              — Templates
    Course07.jsx              — STL (1)
  labs/
    Lab01.jsx                 — Git, C file I/O, string sorting, prime checker
    Lab01Extra.jsx
    Lab02.jsx
    Lab02Extra.jsx
    Lab03.jsx                 — Math class, Canvas class
    Lab03Extra.jsx
    Lab04.jsx
    Lab05.jsx                 — Number class with operator overloading
    Lab05Extra.jsx
    Lab06.jsx
    Lab06Extra.jsx
    Lab07.jsx
    Lab07Extra.jsx
  practice/
    Practice.jsx              — MC questions grouped by course
```

## Content Tabs

| Tab | Content | Count |
|-----|---------|-------|
| Courses | Bilingual lecture pages from 7 PDFs | 7 |
| Labs | Lab pages with MultiFileEditor | 13 (7 regular + 6 extra) |
| Practice | Multiple-choice questions by course | 1 page (~70-100 questions) |

No seminars or tests tabs (source site has none).

## New Component: MultiFileEditor

### Location

`src/components/ui/MultiFileEditor.jsx`

### Purpose

A reusable tabbed multi-file code editor with compilation and execution via Judge0. Designed for C++ lab exercises that require multiple source files (.h, .cpp).

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `files` | `Array<{ name: string, content: string, language: string }>` | Yes | Starter files to populate the editor with |
| `expectedOutput` | `string` | No | Expected stdout for validation ("Check" button) |

### UI Layout

```
+--------------------------------------------------+
| [file1.h] [file2.cpp] [main.cpp]  [+]           |
+--------------------------------------------------+
|                                                  |
|  CodeMirror 6 editor                             |
|  (shows active file)                             |
|                                                  |
+--------------------------------------------------+
| [Run]  [Check (if expectedOutput)]               |
+--------------------------------------------------+
| > Output panel (collapsible)                     |
| stdout / stderr / compilation errors             |
+--------------------------------------------------+
```

### File Management

- **Add file**: "+" button, prompts for filename
- **Rename file**: Double-click tab label
- **Delete file**: X button on tab, with confirmation
- **Switch file**: Click tab to switch CodeMirror content
- All file contents stored in React component state
- No localStorage persistence — resets on page reload

### Compilation Strategy

Submit to Judge0 CE using Bash (language_id 46). The "source code" is a generated shell script:

```bash
cat > 'Math.h' << '__MFE_EOF__'
// contents of Math.h from editor state
__MFE_EOF__

cat > 'Math.cpp' << '__MFE_EOF__'
// contents of Math.cpp from editor state
__MFE_EOF__

cat > 'main.cpp' << '__MFE_EOF__'
// contents of main.cpp from editor state
__MFE_EOF__

g++ *.cpp -o out 2>&1 && ./out
```

For C-only exercises (e.g., Lab 01 exercises 1-3), use `gcc *.c -o out` instead. The component detects this from file extensions.

### Execution Details

- **API endpoint**: `POST https://ce.judge0.com/submissions?wait=true`
- **Language ID**: 46 (Bash)
- **Timeout**: 10 seconds (cpu_time_limit)
- **Memory limit**: 128MB (memory_limit: 131072)
- Stdin passed through if exercise needs user input
- Output panel shows: stdout on success, stderr + compilation errors on failure
- "Check" button compares trimmed stdout against `expectedOutput`

### Theming

- Uses `var(--theme-*)` CSS custom properties for all colors
- CodeMirror dark/light mode synced with site theme (same approach as existing `CodeEditor`)
- Tab bar, buttons, output panel all themed consistently

## Course Pages (7 total)

Each course is a React component following the established pattern (same as OS and PA courses).

### Components Used

- `Section` — collapsible sections with progress checkboxes
- `Box` — callouts for definitions, theorems, warnings, formulas, code
- `Code` — monospace code blocks for C++ snippets
- `Toggle` — show/hide Q&A self-checks

### Bilingual

All text uses `t('English text', 'Romanian text')`. Code blocks stay in English.

### Section IDs

Descriptive, prefix-matched: `oop-c1-intro`, `oop-c1-compilers`, `oop-c2-pointers`, etc.

### Course Content Map

| ID | Component | Title (EN) | Title (RO) | Key Topics |
|----|-----------|-----------|-----------|------------|
| oop-c1 | Course01 | Introduction | Introducere | Compilers, OS architecture, C++ history, from C to C++, classes basics |
| oop-c2 | Course02 | C++ Language Specifiers | Specificatori ai limbajului C++ | Pointers & references, method overloading, NULL, const, friend |
| oop-c3 | Course03 | Creating an Object | Crearea unui obiect | Init lists, constructors, copy/move, delegating constructors, value types |
| oop-c4 | Course04 | Operators | Operatori | Destructor, C++ operators, operator overloading for classes |
| oop-c5 | Course05 | Inheritance | Mostenire | Virtual methods, vtables, covariance, abstract classes, memory alignment |
| oop-c6 | Course06 | Templates | Sabloane | Casts, macros, literals, function/class templates, specialization |
| oop-c7 | Course07 | STL (1) | STL (1) | Sequence containers, adaptors, I/O streams, strings |

## Lab Pages (13 total)

Each lab is its own page with:

1. Bilingual exercise instructions (translated from source site)
2. One `MultiFileEditor` instance per independent exercise
3. Starter files exactly as provided by the original lab (no extra scaffolding)

### Lab Content Map

| ID | Component | Title (EN) | Exercises | Editors |
|----|-----------|-----------|-----------|---------|
| oop-l1 | Lab01 | Lab 01: Introduction | 4 (Git setup, C file I/O, string sort, prime checker) | 3 (exercises 2-4, ex 1 is Git setup) |
| oop-l1e | Lab01Extra | Lab 01 Extra | TBD (fetch needed) | TBD |
| oop-l2 | Lab02 | Lab 02 | TBD (fetch needed) | TBD |
| oop-l2e | Lab02Extra | Lab 02 Extra | TBD (fetch needed) | TBD |
| oop-l3 | Lab03 | Lab 03: Classes | 2 (Math class, Canvas class) | 2 |
| oop-l3e | Lab03Extra | Lab 03 Extra | TBD (fetch needed) | TBD |
| oop-l4 | Lab04 | Lab 04 | TBD (fetch needed) | TBD |
| oop-l5 | Lab05 | Lab 05: Number Class | 1 (Number class with operators) | 1 |
| oop-l5e | Lab05Extra | Lab 05 Extra | TBD (fetch needed) | TBD |
| oop-l6 | Lab06 | Lab 06 | TBD (fetch needed) | TBD |
| oop-l6e | Lab06Extra | Lab 06 Extra | TBD (fetch needed) | TBD |
| oop-l7 | Lab07 | Lab 07 | TBD (fetch needed) | TBD |
| oop-l7e | Lab07Extra | Lab 07 Extra | TBD (fetch needed) | TBD |

Note: "TBD (fetch needed)" entries will be resolved during implementation by fetching each lab page from the source site. The structure (instructions + MultiFileEditor per exercise) is the same for all.

## Practice Tab

### Structure

- Questions grouped by course in collapsible `CourseBlock` components
- Each group: "Course N: [Title]" header
- Uses existing `MultipleChoice` component
- ~10-15 questions per course, ~70-100 total

### Question Style

Questions are derived from the specific course content, not generic OOP trivia:
- Conceptual understanding ("What does the `friend` specifier allow?")
- Code output prediction ("What does this code print?")
- Error identification ("What's wrong with this code?")
- Behavior questions ("What happens when a delegating constructor throws?")

## Registry Integration

Add to `src/content/registry.js`:
- Import `oop` from `./oop/index.js`
- Add to `subjects` array
- Add `'oop'` to the `y1s2` yearSemesters entry

## No New Dependencies

- `MultiFileEditor` reuses CodeMirror 6 (already installed for `CodeEditor`)
- Judge0 API (already used by `CodeChallenge`)
- No new npm packages needed
