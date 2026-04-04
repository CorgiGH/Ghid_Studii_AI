# PA Practice Tab — Topic-Based Multiple Choice

## Goal
Replace the PA Practice placeholder with ~150-200 multiple-choice questions organized by topic, derived from the 16 previous-year exams already in testData.js.

## Architecture

**Modified files:**
- `src/content/pa/practice/Practice.jsx` — replace placeholder with full MC practice page

**No new files needed.** Uses existing `MultipleChoice` component from `src/components/ui/MultipleChoice`.

## Topic Sections (6)

### 1. Algorithm Design & Analysis (~25 questions)
Source: Q1 from most tests (ISINC, P35, M35, D1M, ST, INM, pentagonal/hexagonal/octagonal/star numbers, cube decomposition)

Question types:
- Input/output formalization: "Which is the correct (input, output) for problem X?"
- Algorithm correctness: "What is the invariant of this loop?"
- Worst-case identification: "Which input causes worst-case behavior?"
- Complexity calculation: "What is the worst-case time complexity?"
- Algorithm tracing: "What does this algorithm return for input X?"

### 2. Nondeterministic Algorithms (~15 questions)
Source: 2019 A/B Q2 (oddSum, prod3cons), 2016 Q1d-e (p35nedet)

Question types:
- "Which algorithm correctly uses choose to solve problem X?"
- "Which execution trace ends in success?"
- "What is the time complexity of a nondeterministic algorithm?"
- "What characterizes a nondeterministic algorithm?"

### 3. Probabilistic Algorithms & Average Complexity (~30 questions)
Source: Q2 from 2017-2025 tests (unulDinTrei, minim, eqTest, modm, alg2, ransearch, firstpos)

Question types:
- "What is P(Xⱼ = 1)?"
- "What is the expected value E[T]?"
- "How many recursive calls on average?"
- "Is the probabilistic method valid for computing average-case of the deterministic version?"
- Algorithm identification: "What problem does this algorithm solve?"

### 4. String Searching (~25 questions)
Source: 2019 A Q4-Q5 (KMP), 2019 B Q4-Q5 (Boyer-Moore), 2014 Exam A Q1 (Boyer-Moore), 2014 Exam B Q1 (regex)

Question types:
- "What is the failure function value for position j?"
- "What is salt[C] for character C?"
- "What is goodSuff(j)?"
- "How many comparisons does KMP make on this input?"
- "Which automaton corresponds to regex X?"
- "What are the first 6 shortest words in L(e)?"
- "When is the good suffix rule not efficient?"

### 5. Computational Geometry (~25 questions)
Source: 2015 Q2 (Graham), 2016 Q2-Q3 (point localization, diameter), 2017 A Q3 (cmp/sort), 2017 B Q3 (CHLPS), 2014 Exam C Q2-Q3 (Voronoi)

Question types:
- "What is ccw(P, Q, R) for these points?"
- "Which point is eliminated during Graham scan?"
- "What is the convex hull of this point set?"
- "Is point P inside or outside polygon L?"
- "Which pair has the maximum distance (diameter)?"
- "What is the complexity of Voronoi diagram construction?"

### 6. NP-Completeness (~30 questions)
Source: Q3 from 2022-2025 tests, 2014 Exam A Q3 (Subset Sum), 2014 Exam B Q3 (Set Cover), 2022 example Q2 (VERTEX COVER)

Question types:
- "If P ≠ NP, which statement is true?"
- "Which is the correct definition of CLIQUE?"
- "Which reduction direction proves NP-hardness of X?"
- "What does this nondeterministic algorithm verify?"
- "Which is a valid Karp reduction from X to Y?"
- "What is the approximation ratio of this greedy algorithm?"
- "Is problem X decidable if...?"

## Question Format

Each question uses the existing `MultipleChoice` component:

```js
{
  question: { en: 'English text', ro: 'Romanian text' },
  options: [
    { text: { en: '...', ro: '...' }, correct: false },
    { text: { en: '...', ro: '...' }, correct: true },
    { text: { en: '...', ro: '...' }, correct: false },
    { text: { en: '...', ro: '...' }, correct: false },
  ],
  explanation: { en: '...', ro: '...' },
}
```

## Practice.jsx Structure

```jsx
export default function Practice() {
  const { t } = useApp();
  return (
    <div>
      <h2>1. {t('Algorithm Design & Analysis', 'Proiectare și analiză')}</h2>
      <MultipleChoice questions={designQuestions} />

      <h2>2. {t('Nondeterministic Algorithms', 'Algoritmi nedeterminiști')}</h2>
      <MultipleChoice questions={nondeterministicQuestions} />

      // ... 4 more sections
    </div>
  );
}
```

## Bilingual
All questions, options, and explanations are bilingual using `{en, ro}` objects, consistent with the rest of the app.

## Implementation Approach
Since this is ~150-200 questions, the Practice.jsx file will be large. Questions are generated from the exam content already in context. Each question must have 4 plausible options with exactly 1 correct answer and an explanation.
