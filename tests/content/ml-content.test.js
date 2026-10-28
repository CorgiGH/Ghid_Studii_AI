// The ML lesson content as a whole. This file starts with the registration block;
// the content gate (numbers, data on screen, repetition, text sweep) is added to it later.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import ml from '../../src/content/ml/index.js';
import { yearSemesters, getSubject } from '../../src/content/registry.js';
import { loadJson } from '../../src/content/jsonLoader.js';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const COURSES = path.join(ROOT, 'src/content/ml/courses');
const files = fs.existsSync(COURSES) ? fs.readdirSync(COURSES).filter((f) => /^lesson-\d\d\.json$/.test(f)).sort() : [];

describe('ml registration', () => {
  it('is a lesson-player subject in year 2 semester 1, after bd', () => {
    expect(ml.slug).toBe('ml');
    expect(ml.player).toBe('lesson');
    expect(ml.yearSemester).toBe('y2s1');
    expect(ml.title).toEqual({ en: 'Machine learning', ro: 'Învățare automată' });
    expect(ml.shortTitle).toEqual({ en: 'ML', ro: 'ML' });
    expect(getSubject('ml')).toBe(ml);
    expect(yearSemesters.find((y) => y.id === 'y2s1').subjects).toEqual(['bd', 'ml']);
  });
  it('has a bilingual description', () => {
    expect(ml.description.en).toMatch(/weeks 1–5/);
    expect(ml.description.ro).toMatch(/săptămânile 1–5/);
  });
  it('registers one course per lesson file, in ml-l01… order with no gaps', () => {
    expect(ml.courses.map((c) => c.id)).toEqual(files.map((_, i) => `ml-l${String(i + 1).padStart(2, '0')}`));
    expect(ml.courses).toHaveLength(files.length);
  });
  it('gives each course its file, meta id, section count and unique step ids', () => {
    for (const [i, c] of ml.courses.entries()) {
      const nn = String(i + 1).padStart(2, '0');
      expect(c.src).toBe(`ml/courses/lesson-${nn}.json`);
      expect(c.metaId).toBe(c.id);
      const json = loadJson(c.src);
      expect(json.meta.id).toBe(c.metaId);
      expect(c.sectionCount).toBe(json.steps.length);
      const ids = json.steps.map((s) => s.id);
      for (const id of ids) expect(id.startsWith(`${c.metaId}-`)).toBe(true);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
