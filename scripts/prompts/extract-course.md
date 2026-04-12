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
          "text": "Full paragraph text. Use LaTeX inline math delimiters for any formula that contains more than a single Unicode letter (see Math rules below)."
        },
        {
          "type": "definition",
          "term": "Term being defined",
          "text": "Definition text with LaTeX math where needed."
        },
        {
          "type": "equation",
          "tex": "Ax = \\lambda x",
          "label": { "en": "(1)", "ro": "(1)" }
        },
        {
          "type": "code",
          "language": "c",
          "code": "Exact code as in PDF, preserving formatting"
        },
        {
          "type": "table",
          "headers": ["Col1", "Col2"],
          "rows": [["val1", "val2"]]
        },
        {
          "type": "list",
          "ordered": false,
          "items": ["item1 with $inline$ math", "item2"]
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
2. Preserve ALL content — do not summarize or skip sections. Every paragraph, every formula.
3. For code blocks, preserve exact formatting including indentation.
4. For diagrams you cannot extract as text, describe them in detail so they can be reproduced.
5. Output ONLY valid JSON. No markdown wrapping, no explanation text.

## Math notation (LaTeX required for math-heavy courses)

Whenever the source PDF contains mathematical notation, encode it in **LaTeX** using the delimiters below. This applies inside `paragraph.text`, `definition.text`, `list.items[]`, `table.rows[][]`, and `warning.text`.

- **Inline math:** wrap in single dollars: `$x_i$`, `$\lambda > 0$`, `$A \in \mathbb{R}^{m \times n}$`.
- **Display math (standalone centered equations, theorems, key formulas):** use the `equation` block type with a `tex` field. Do **not** wrap the tex value in `$$...$$` — the renderer handles that.
- **Multiple equations in a row** (derivation steps): emit one `equation` block per line, or use `\begin{aligned}…\end{aligned}` inside a single `equation` block.

### Commands you should use

| Notation | LaTeX |
|---|---|
| Greek letters | `\alpha, \beta, \lambda, \sigma, \mu, \Gamma, \Sigma, \Omega` |
| Subscripts / superscripts | `x_i`, `x^2`, `x_{i,j}`, `A^{\top}`, `A^T` |
| Fractions | `\frac{a}{b}`, `\frac{n_{st}(v)}{n_{st}}` |
| Summation / product | `\sum_{i=1}^{n} x_i`, `\prod_{i=1}^n` |
| Integral | `\int_a^b f(x)\,dx` |
| Matrices (bracket-style) | `\begin{bmatrix} a & b \\ c & d \end{bmatrix}` |
| Matrices (parenthesis) | `\begin{pmatrix} … \end{pmatrix}` |
| Determinant | `\det(A)`, `\begin{vmatrix} … \end{vmatrix}` |
| Norm | `\|x\|`, `\|x\|_2` |
| Inner product | `\langle x, y \rangle` |
| Sets | `\mathbb{R}`, `\mathbb{Z}`, `\mathbb{N}`, `\mathbb{C}` |
| Set membership | `\in`, `\notin`, `\subset`, `\subseteq` |
| Comparison / logic | `\leq`, `\geq`, `\neq`, `\approx`, `\Rightarrow`, `\iff`, `\forall`, `\exists` |
| Arrows | `\to`, `\mapsto`, `\Rightarrow` |
| Vector / overline / hat | `\vec{x}`, `\overline{x}`, `\hat{x}` |
| Aligned derivation | `\begin{aligned} x &= \tfrac{1}{\lambda} A x \\ \lambda x &= A x \end{aligned}` |

### Rules

1. If the PDF shows a formula as an image (rendered LaTeX or handwritten), transcribe it into LaTeX faithfully — do not describe it in prose.
2. Preserve the professor's variable names exactly (case-sensitive).
3. Do not mix Unicode math symbols with LaTeX — pick LaTeX for anything inside `$…$` or `equation.tex`.
4. Outside math delimiters, plain Romanian prose (with diacritics ă, â, î, ș, ț) is fine.
5. In JSON strings, **double-escape backslashes**: write `"$\\lambda$"`, `"\\sum_{i=1}^n"`, `"\\frac{a}{b}"`.
6. A standalone matrix table whose entries are data values (e.g., pixel values) is a `table` block, not an `equation` block. Use `equation` only for equations with operators/relations.
