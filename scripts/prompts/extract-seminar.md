You are extracting structured content from a university seminar exercise sheet. Output valid JSON only.

Extract the following structure:

```json
{
  "metadata": {
    "title": "Seminar title",
    "weekNumber": null,
    "topic": "Main topic",
    "source": "Full source attribution"
  },
  "problems": [
    {
      "number": 1,
      "title": "Problem title",
      "statement": "Full problem statement",
      "type": "formalization|algorithm|proof|conceptual|mixed",
      "parts": [
        {
          "label": "a",
          "question": "Sub-question text",
          "answer": "Expected answer if provided",
          "code": "Algorithm/pseudocode if provided"
        }
      ],
      "diagrams": []
    }
  ],
  "diagrams": []
}
```

CRITICAL RULES:
1. PRESERVE exact notation, especially I/O formalizations and algorithm pseudocode.
2. Extract ALL problems and sub-parts.
3. Classify each problem's type accurately.
4. For algorithms, preserve the exact pseudocode format from the PDF.
5. Output ONLY valid JSON.
