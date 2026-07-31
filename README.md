# Ghid Universitar de Studiu

Live: https://corgigh.github.io/Ghid_Studii_AI/

Study guide for year 1, semester 2 of the Artificial Intelligence programme at the Faculty of Computer Science, Alexandru Ioan Cuza University of Iasi. Five subjects, 59 courses, each with course material, worked exercises, practice and tests.

## Contents

- Sisteme de operare si retele de calculatoare, 15 courses, 183 sections
- Probabilitati si statistica, 13 courses
- Programare orientata pe obiecte, 12 courses
- Algebra liniara si optimizari, 11 courses
- Proiectarea algoritmilor, 8 courses

Every subject has five modes:

- Cursuri: course material
- Exercitii rezolvate: worked solutions
- Exercitii: practice problems
- Practica: interactive practice
- Teste: test material

## Features

- Romanian and English interface toggle
- Light and dark theme
- Client side routing with per lesson progress tracking
- Mathematical notation rendered with KaTeX
- In browser C++ editor built on CodeMirror 6
- 3D visualisations built on three.js through react-three-fiber
- Data visualisations built on d3
- x86 emulation in the browser through v86

## Stack

React 19, React Router 7, Vite 8, Tailwind CSS 4, KaTeX, CodeMirror 6 with lang-cpp, three.js with react-three-fiber and drei, d3, ml-matrix, fraction.js, motion, react-markdown, pdf-to-img, v86, ESLint, Puppeteer.

## Running locally

```bash
npm install
npm run dev
```

Other scripts:

- npm run build: production build
- npm run lint: ESLint
- npm run preview: serve the production build
- npm run smoke: smoke tests
- npm run validate: content validation
- npm run content-truth: content accuracy checks

## Deployment

GitHub Pages, served from this repository.

## Notes

Developed with heavy use of AI tooling.
