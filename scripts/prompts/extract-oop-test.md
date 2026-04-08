You are extracting structured content from a university OOP (Object-Oriented Programming in C++) exam.
The input may be a PDF, or multiple photos/screenshots of an exam paper. Combine all pages into one coherent extraction.

Output valid JSON only. No markdown fences, no commentary.

```json
{
  "metadata": {
    "originalTitle": "Title exactly as written on the exam",
    "year": "2023-2024",
    "session": "sesiune|restanta|marire|model|lab-test",
    "testPart": "T1|T2|null",
    "problemNumber": "P1|P2|P3|null",
    "duration": "16:00-17:00 or 60min or null",
    "totalPoints": 30
  },
  "problem": {
    "className": "CircularString",
    "description": "Brief description of what the class does (bilingual)",
    "descriptionRo": "Descriere scurta a clasei",
    "constraints": ["No STL allowed", "No string.h functions"],
    "constraintsRo": ["Nu aveti voie sa folositi STL", "Nu aveti voie sa folositi string.h"],
    "observations": ["The constructor receives size and initial char"],
    "observationsRo": ["Constructorul primeste dimensiunea si un caracter initial"],
    "mainCode": "int main() {\n  // exact code from the exam\n}",
    "expectedOutput": "*****\ncba**\n...",
    "umlDiagram": "Text description of UML diagram if present, null otherwise",
    "includes": ["MyVector.h", "Suma.h"]
  },
  "grading": [
    {
      "id": "G1",
      "description": "Circular string destructor",
      "descriptionRo": "Destructorul clasei CircularString",
      "points": 1
    }
  ],
  "solution": "Full solution code if provided (e.g. from a main.cpp file), null otherwise"
}
```

CRITICAL RULES:
1. PRESERVE the professor's exact code, formatting, and terminology.
2. Extract the COMPLETE main() function with all operations.
3. Extract the COMPLETE expected output.
4. Extract ALL grading criteria with exact point values.
5. Keep constraints and observations in BOTH languages (translate if only one is given).
6. For UML diagrams, describe the classes, relationships, and methods textually.
7. The mainCode must be syntactically complete and copy-pasteable.
8. If multiple pages show the same content (e.g. duplicate rendering), merge into one.
9. Sum of grading points should equal totalPoints.
10. Output ONLY valid JSON — no markdown fences, no extra text.
