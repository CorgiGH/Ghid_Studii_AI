// Split learn/callout blocks containing code fences into separate
// learn/callout + code + learn/callout block runs. Targeted fix for the 3
// known cases flagged by lint-site R6.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}
function save(rel, data) {
  fs.writeFileSync(path.join(root, rel), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// === Case 1: alo/course-07.json step 1 block 9 (callout/info) ===
{
  const rel = 'src/content/alo/courses/course-07.json';
  const d = load(rel);
  const blocks = d.steps[1].blocks;
  const before = {
    type: 'callout',
    variant: 'info',
    content: {
      en: "**The key operation.** Iterative methods don't need random access $A_{ij}$. They need **matrix–vector products** $y = A x$, which CSR computes in one sweep:",
      ro: "**Operația cheie.** Metodele iterative nu au nevoie de acces aleator $A_{ij}$. Au nevoie de **produse matrice–vector** $y = A x$, pe care CSR le calculează într-o singură trecere:",
    },
  };
  const code = {
    type: 'code',
    language: 'text',
    code: 'for i = 1 to n:\n    y[i] = 0\n    for k = inceput_linii[i] to inceput_linii[i+1]-1:\n        y[i] += valori[k] * x[ind_col[k]]',
  };
  const after = {
    type: 'callout',
    variant: 'info',
    content: {
      en: "Cost: $\\Theta(NN)$, linear in the number of nonzeros. This is why CSR is the dominant sparse format in LAPACK's sparse siblings and in every finite-element code.",
      ro: "Cost: $\\Theta(NN)$, liniar în numărul de intrări nenule. De aceea CSR este formatul dominant de rărime în echivalenții rari ai LAPACK și în orice cod de elemente finite.",
    },
  };
  blocks.splice(9, 1, before, code, after);
  save(rel, d);
  console.log('fixed', rel);
}

// === Case 2: oop/course-02.json step 2 block 3 (callout/warning) ===
{
  const rel = 'src/content/oop/courses/course-02.json';
  const d = load(rel);
  const blocks = d.steps[2].blocks;
  const text = {
    type: 'callout',
    variant: 'warning',
    content: {
      en: "**Invalid overloading:** Functions with the same name and same parameter types but different return types are NOT valid overloads. Default parameter values do NOT change the signature either.",
      ro: "**Supraincarcare invalida:** Functiile cu acelasi nume si aceleasi tipuri de parametri dar tipuri de retur diferite NU sunt supraincarcari valide. Valorile implicite ale parametrilor NU schimba semnatura.",
    },
  };
  const code = {
    type: 'code',
    language: 'cpp',
    code: 'int  Add(int v1, int v2);\nlong Add(int v1, int v2);     // ERROR: duplicate signature!\nlong Add(int v1, int v2 = 0); // ERROR: still same signature!',
  };
  blocks.splice(3, 1, text, code);
  save(rel, d);
  console.log('fixed', rel);
}

// === Case 3: pa/course-07.json step 5 block 2 (learn) ===
{
  const rel = 'src/content/pa/courses/course-07.json';
  const d = load(rel);
  const blocks = d.steps[5].blocks;
  const before = {
    type: 'learn',
    content: {
      en: "Every problem in P is also in NP, because a deterministic algorithm is a special case of a nondeterministic algorithm (a deterministic algorithm is a nondeterministic algorithm with exactly one execution). So $P \\subseteq NP$.\n\nIn addition (most probably), NP contains other interesting problems:\n\n**SAT** is in NP. A nondeterministic algorithm:",
      ro: "Orice problemă din P este și în NP, deoarece un algoritm determinist este un caz particular de algoritm nedeterminist (un algoritm determinist este un algoritm nedeterminist cu exact o execuție). Deci $P \\subseteq NP$.\n\nÎn plus (cel mai probabil), clasa NP conține și alte probleme interesante:\n\n**SAT** face parte din NP. Un algoritm nedeterminist:",
    },
  };
  const codeEn = 'AlgSAT(phi) {\n  for (i = 0; i < n; ++i) {     // phase 1: guess an assignment\n    choose sigma[i] from { 0, 1 };  // n = number of propositional variables\n  }\n  if (eval(phi, sigma) == 1) {   // phase 2: verification\n    success;\n  } else {\n    failure;\n  }\n}';
  const code = {
    type: 'code',
    language: 'text',
    code: codeEn,
  };
  const after = {
    type: 'learn',
    content: {
      en: "**3-COL** (is graph G 3-colorable?) is also in NP by a similar two-phase algorithm.\n\nThe open question: is $P = NP$? Most computer scientists believe $P \\subsetneq NP$ (strict inclusion), but no proof exists yet.",
      ro: "**3-COL** (este graful G 3-colorabil?) este de asemenea în NP printr-un algoritm similar în două faze.\n\nÎntrebarea deschisă: este $P = NP$? Cei mai mulți informaticieni cred că $P \\subsetneq NP$ (incluziune strictă), dar nu avem încă o demonstrație a acestui fapt.",
    },
  };
  blocks.splice(2, 1, before, code, after);
  save(rel, d);
  console.log('fixed', rel);
}
