import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { isRawMaterial, RAW_MATERIAL_DIRS, RAW_MATERIAL_FILES } from '../../src/content/rawMaterial.js';
import { __keys } from '../../src/content/jsonLoader.js';

describe('isRawMaterial', () => {
  it('flags source material', () => {
    expect(isRawMaterial('ml/materials.json')).toBe(true);
    expect(isRawMaterial('ml/students/x/tslint.json')).toBe(true);
    expect(isRawMaterial('ml/tests/source/a.json')).toBe(true);
    expect(isRawMaterial('ml/refs/files/b.json')).toBe(true);
    expect(isRawMaterial('ml/_text/c.json')).toBe(true);
    expect(isRawMaterial('ml/source/d.json')).toBe(true);
  });
  it('keeps real content', () => {
    expect(isRawMaterial('ml/courses/lesson-01.json')).toBe(false);
    expect(isRawMaterial('bd/tests/mock-l1.json')).toBe(false);
    expect(isRawMaterial('ml/tests/mock-t1.json')).toBe(false);
  });
  it('accepts backslash paths', () => {
    expect(isRawMaterial('ml\\students\\x.json')).toBe(true);
  });
  it('only treats materials.json at a subject root as raw', () => {
    expect(isRawMaterial('ml/courses/materials.json')).toBe(false);
  });
  it('exports the lists', () => {
    expect(RAW_MATERIAL_DIRS).toEqual(['source', 'refs', 'students', '_text']);
    expect(RAW_MATERIAL_FILES).toEqual(['materials.json']);
  });
});

describe('jsonLoader glob', () => {
  // The raw material is not committed, so on a fresh clone the key comparison below has nothing raw to skip; this reads the
  // literal negations themselves and holds them to RAW_MATERIAL_DIRS / RAW_MATERIAL_FILES.
  it('negates exactly the raw folders and files, as literals', () => {
    const src = readFileSync(new URL('../../src/content/jsonLoader.js', import.meta.url), 'utf8');
    const negations = [...src.matchAll(/'!([^']+)'/g)].map((m) => m[1]).sort();
    const want = [...RAW_MATERIAL_DIRS.map((d) => `./**/${d}/**`), ...RAW_MATERIAL_FILES.map((f) => `./*/${f}`)].sort();
    expect(negations).toEqual(want);
  });

  it('loads exactly the non-raw JSON files under src/content', () => {
    const all = Object.keys(import.meta.glob('../../src/content/**/*.json'))
      .map((k) => k.replace('../../src/content/', ''))
      .filter((rel) => !isRawMaterial(rel))
      .sort();
    const loaded = __keys().map((k) => k.replace(/^\.\//, '')).sort();
    expect(loaded.length).toBe(all.length);
    expect(loaded).toEqual(all);
  });
  it('raw files are never in the loader', () => {
    expect(__keys().some((k) => isRawMaterial(k.replace(/^\.\//, '')))).toBe(false);
  });
});
