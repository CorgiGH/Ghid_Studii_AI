// Eager glob import of all JSON content files so Vite includes them in the build.
// Raw course material is left out. import.meta.glob takes literal patterns only, so
// these negations must match RAW_MATERIAL_DIRS / RAW_MATERIAL_FILES in rawMaterial.js
// (tests/ml/raw-material.test.js checks that they do).
const modules = import.meta.glob(
  [
    './**/*.json',
    '!./**/source/**',
    '!./**/refs/**',
    '!./**/students/**',
    '!./**/_text/**',
    '!./*/materials.json',
  ],
  { eager: true },
);

// Test hook: the module keys the loader actually holds.
export function __keys() {
  return Object.keys(modules);
}

export function loadJson(src) {
  // src comes as e.g. "pa/courses/course-01.json"
  const key = `./${src}`;
  const mod = modules[key];
  if (!mod) {
    throw new Error(`JSON content not found: ${src}`);
  }
  return mod.default;
}
