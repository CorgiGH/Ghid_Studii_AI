You are extracting structured content from a university lab exercise sheet. Output valid JSON only.

Extract the following structure:

```json
{
  "metadata": {
    "title": "Lab title",
    "weekNumber": null,
    "topic": "Main topic",
    "source": "Full source attribution"
  },
  "exercises": [
    {
      "number": 1,
      "title": "Exercise title or first sentence",
      "statement": "Full problem statement preserving exact wording",
      "hints": ["Any hints provided"],
      "solution": {
        "explanation": "Solution explanation text if provided",
        "code": "Solution code if provided, exact formatting preserved",
        "language": "c|bash|text"
      },
      "diagrams": []
    }
  ],
  "diagrams": []
}
```

CRITICAL RULES:
1. PRESERVE the professor's exact wording, variable names, and conventions.
2. Extract ALL exercises — do not skip any.
3. If an exercise has sub-parts (a, b, c), include them as separate items in the exercise's content.
4. Preserve code formatting exactly.
5. Output ONLY valid JSON.
