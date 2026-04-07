// Eager glob import of all JSON content files so Vite includes them in the build
const modules = import.meta.glob('./**/*.json', { eager: true });

export function loadJson(src) {
  // src comes as e.g. "pa/courses/course-01.json"
  const key = `./${src}`;
  const mod = modules[key];
  if (!mod) {
    throw new Error(`JSON content not found: ${src}`);
  }
  return mod.default;
}
