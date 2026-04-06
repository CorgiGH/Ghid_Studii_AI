You are extracting structured content from a university exam/test PDF. Output valid JSON only.

Extract the following structure:

```json
{
  "metadata": {
    "title": "Test title as written",
    "type": "partial|exam",
    "year": 2026,
    "variant": "A|B|null",
    "series": "Seria I|Seria II|null",
    "duration": "Duration as written",
    "totalPoints": 0
  },
  "problems": [
    {
      "number": 1,
      "points": 10,
      "title": "Problem title/topic",
      "statement": "Full problem statement text",
      "parts": [
        {
          "label": "a",
          "points": 3,
          "question": "Sub-question text exactly as written",
          "answer": "Solution if provided, null otherwise",
          "code": "Algorithm/code if provided, null otherwise"
        }
      ]
    }
  ]
}
```

CRITICAL RULES:
1. PRESERVE the professor's exact notation, indexing, and terminology.
2. Extract ALL problems and ALL sub-parts with their point values.
3. Keep all text in the original language (usually Romanian).
4. For code/algorithms, preserve exact formatting.
5. Sum of all problem points should equal totalPoints.
6. Output ONLY valid JSON.
