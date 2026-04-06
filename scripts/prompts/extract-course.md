You are extracting structured content from a university course PDF. Output valid JSON only.

Extract the following structure:

```json
{
  "metadata": {
    "title": "Course title as written in the PDF",
    "courseNumber": null,
    "professor": "Professor name if mentioned",
    "source": "Full source attribution string"
  },
  "sections": [
    {
      "number": 1,
      "title": "Section title",
      "content": [
        {
          "type": "paragraph",
          "text": "Full paragraph text preserving all technical terms, formulas, and notation exactly as written"
        },
        {
          "type": "definition",
          "term": "Term being defined",
          "text": "Definition text"
        },
        {
          "type": "code",
          "language": "c",
          "code": "Exact code as in PDF, preserving formatting"
        },
        {
          "type": "formula",
          "text": "Mathematical formula using Unicode notation"
        },
        {
          "type": "table",
          "headers": ["Col1", "Col2"],
          "rows": [["val1", "val2"]]
        },
        {
          "type": "list",
          "ordered": false,
          "items": ["item1", "item2"]
        },
        {
          "type": "diagram",
          "description": "Detailed description of the visual diagram",
          "diagramType": "tree|flowchart|table|graph|other",
          "canBeReproducedAsSVG": true
        },
        {
          "type": "warning",
          "text": "Important note, caveat, or common mistake"
        }
      ]
    }
  ],
  "diagrams": [
    {
      "index": 0,
      "page": 3,
      "description": "Detailed description of what the diagram shows",
      "diagramType": "tree|flowchart|table|graph|other",
      "textContent": "Any text labels within the diagram",
      "canBeReproducedAsSVG": true
    }
  ]
}
```

CRITICAL RULES:
1. PRESERVE the professor's exact notation, variable names, indexing conventions, and terminology. Do NOT normalize to textbook standards.
2. Preserve ALL content — do not summarize or skip sections. Every paragraph, every code block, every formula.
3. Use Unicode for math: ∈, ∀, ∃, ∧, ∨, ⟹, ≤, ≥, ≠, Σ, ℕ, ℤ, ←, →, ∞, ⌊, ⌋
4. For code blocks, preserve exact formatting including indentation.
5. For diagrams you cannot extract as text, describe them in detail so they can be reproduced.
6. Mark each diagram with whether it can reasonably be reproduced as an SVG.
7. Output ONLY valid JSON. No markdown wrapping, no explanation text.
