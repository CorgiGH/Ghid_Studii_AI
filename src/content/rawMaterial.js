// Folders and files under src/content that hold source material (slides, PDFs
// as text, student repos, the materials index). They are never learner content,
// so the bundle, the validators and the linter all skip them.
// jsonLoader.js needs literal glob patterns; the list there must match these two
// constants (tests/ml/raw-material.test.js checks it).
export const RAW_MATERIAL_DIRS = ['source', 'refs', 'students', '_text'];
export const RAW_MATERIAL_FILES = ['materials.json'];

// relPath is relative to src/content, e.g. "ml/tests/source/a.json".
export function isRawMaterial(relPath) {
  const parts = String(relPath).split(/[\\/]/).filter(Boolean);
  if (parts.slice(0, -1).some((p) => RAW_MATERIAL_DIRS.includes(p))) return true;
  // a materials index only counts at a subject root: <subject>/materials.json
  return parts.length === 2 && RAW_MATERIAL_FILES.includes(parts[1]);
}
