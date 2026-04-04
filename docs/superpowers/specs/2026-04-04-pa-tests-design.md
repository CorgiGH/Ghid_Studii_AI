# PA Tests Tab — Design Spec

## Goal
Add a Tests tab to the PA (Algorithm Design) subject with 16 unique previous-year exam papers, organized by type (Midterm first, Final second), then by year within each type.

## Architecture: Data-Driven Renderer

### New files
1. **`src/content/pa/tests/TestRenderer.jsx`** — Single reusable component that renders any test from a data object
2. **`src/content/pa/tests/testData.js`** — All 16 tests as structured data objects
3. **`src/content/pa/tests/PATests.jsx`** — Top-level component that groups tests by type/year and renders them using TestRenderer

### Modified files
- **`src/content/pa/index.js`** — Add `tests` array with single entry pointing to PATests

## Data Schema

```js
// testData.js exports an array of test objects:
{
  id: 'partial-2019-a',           // unique ID
  type: 'partial',                // 'partial' | 'exam'
  year: 2019,
  variant: 'A',                   // 'A' | 'B' | 'A\'' | 'sim' | 'ex' | 'I' | 'II' | null
  series: 'A + E',                // original series label if any
  title: {
    en: 'Partial 2019 — Variant A',
    ro: 'Partial 2019 — Varianta A'
  },
  duration: '1 hour',
  totalPoints: 36,                // sum of problem points
  problems: [
    {
      number: 1,
      points: 12,
      title: {
        en: 'Design and Analysis, Basics',
        ro: 'Proiectare și analiză, baza'
      },
      statement: 'Full problem statement text in Romanian (original language)',
      parts: [
        {
          label: 'a',
          points: 2,
          question: 'Să se formuleze M35 ca pereche (input, output)...',
          answer: 'Input: N, N ∈ ℕ ∧ N % 10 == 0...\nOutput: S = Σ{x | 1 ≤ x < N, x % 3 == 0 ∨ x % 5 == 0}',
          code: null  // optional: Alk code block if answer includes algorithm
        },
        {
          label: 'b',
          points: 4,
          question: 'Să se scrie un algoritm determinist care rezolvă M35.',
          answer: null,
          code: 'M35(N) {\n  S = 0;\n  for (x = 3; x < N; ++x)\n    if (x % 3 == 0 || x % 5 == 0)\n      S = S + x;\n  return S;\n}'
        }
        // ... more parts
      ]
    }
    // ... more problems (typically 3 per test, some have 5)
  ]
}
```

## TestRenderer Component

Uses existing UI components:
- **`CourseBlock`** — wraps each problem (collapsible, themed)
- **`Box type="definition"`** — problem statement
- **`Toggle`** — solution reveal per sub-question
- **`Code`** — Alk algorithm solutions
- **`Section`** — groups sub-questions within a problem

### Rendering logic
```
For each problem in test:
  <CourseBlock title="Problem {number} ({points}p) — {title}">
    <Box type="definition">{statement}</Box>
    For each part:
      <Toggle
        question="({label}) ({points}p) {question}"
        answer={<>{answer text}{code && <Code>{code}</Code>}</>}
      />
  </CourseBlock>
```

## PATests Component

Groups tests into two sections with headers:

```
<h2>Partial (Midterm)</h2>
  — sorted by year ascending, then variant
  For each year group:
    <h3>2019</h3>
    <TestRenderer test={partial2019A} />
    <TestRenderer test={partial2019B} />

<h2>Examen (Final)</h2>
  — sorted by year ascending
  For each:
    <TestRenderer test={exam2014A} />
```

## Test Inventory (16 unique, after dedup)

### Midterm (13 tests)
| ID | Year | Var | Topics |
|----|------|-----|--------|
| partial-2015-a | 2015 | A | ISINC + Graham scan + reductions |
| partial-2016-a | 2016 | A | P35 + point localization + diameter |
| partial-2017-a | 2017 | A | Set testing + probabilistic unulDinTrei + comp. geometry |
| partial-2017-b | 2017 | B | Multiset INM + probabilistic minim + convex hull |
| partial-2019-a | 2019 | A | M35 + nondeterministic + probabilistic + KMP + regex |
| partial-2019-b | 2019 | B | D1M + nondeterministic + probabilistic + BM + regex |
| partial-2022-a | 2022 | A | Pentagonal + probabilistic alg2 + NP VERTEX-COVER |
| partial-2022-b | 2022 | B | Hexagonal + probabilistic minimum + NP CLIQUE |
| partial-2022-ex | ~2022 | ex | Probabilistic eqTest + NP INDEPENDENT-SET (example) |
| partial-2022-i | ~2022 | I | Cube D(m) + probabilistic ransearch + NP CLIQUE |
| partial-2022-ii | ~2022 | II | Odd cube D(m) + probabilistic search + NP CLIQUE |
| partial-2025-a | 2025 | A | Octagonal + probabilistic firstpos + NP PARTITION |
| partial-2025-b | 2025 | B | Star numbers + probabilistic + NP SAT→3-SAT |

### Final Exam (3 tests)
| ID | Year | Var | Topics |
|----|------|-----|--------|
| exam-2014-a | 2014 | A | Boyer-Moore + Huffman + Subset Sum NP |
| exam-2014-b | 2014 | B | Regex + DP knapsack + Set Covering NP |
| exam-2014-c | 2014 | A' | DIV + Voronoi + Voronoi construction |

### Excluded
- `Subiect partial 2021.pdf` — Google Forms screenshot, not a standard test format
- `Simulare Partial PA.pdf` — Google Forms simulation, same issue

## Integration with PA Subject

In `src/content/pa/index.js`:
```js
tests: [
  {
    id: 'pa-tests',
    title: { en: 'Tests', ro: 'Teste' },
    shortTitle: { en: 'Tests', ro: 'Teste' },
    component: lazy(() => import('./tests/PATests.jsx'))
  }
],
```

The ContentTypeBar already handles `subject.tests?.length > 0` to show the Tests tab.

## Skill for Efficient Implementation

A new skill `creating-pa-tests` will be created with:
1. The data schema above
2. Rules for extracting from Romanian PDFs
3. A complete example data object (from Partial 2019 A which is fully in context)
4. Instructions to keep Romanian text as-is for questions/answers, add English translations only for titles

This lets future sessions process any remaining tests by: read PDF → follow skill → output data object.

## Implementation Order

1. Create `TestRenderer.jsx` component
2. Create `testData.js` with all 16 tests (data extraction from PDFs already read in this conversation)
3. Create `PATests.jsx` top-level component
4. Update `pa/index.js` to register tests
5. Create the skill file for future test additions
6. Commit and push
