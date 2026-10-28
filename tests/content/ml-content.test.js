// The ML lesson content as a whole. This file starts with the registration block;
// the content gate (numbers, data on screen, repetition, text sweep) is added to it later.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import ml from '../../src/content/ml/index.js';
import { yearSemesters, getSubject } from '../../src/content/registry.js';
import { loadJson } from '../../src/content/jsonLoader.js';
import { isRawMaterial } from '../../src/content/rawMaterial.js';

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

// BD and ML share one progress store, keyed by step and block id (attempts, the review pile). An ML id that equals a BD id or
// another ML lesson's would mix their progress, so every step and block id starts with its lesson id and is used once in the
// subject (BD's content test holds its own lessons to the same rule).
function idProblems(lessons) {
  const out = [];
  const seen = new Set();
  for (const { metaId, json } of lessons) {
    for (const s of json.steps || []) {
      for (const id of [s.id, ...(s.blocks || []).map((b) => b.id).filter((v) => v !== undefined)]) {
        if (typeof id !== 'string' || !id.startsWith(`${metaId}-`)) out.push(`${id} does not start with ${metaId}-`);
        else if (seen.has(id)) out.push(`${id} is used twice`);
        seen.add(id);
      }
    }
  }
  return out;
}

describe('ids in the shared progress store', () => {
  it('flags an id without its lesson prefix and an id used twice', () => {
    const bad = [
      { metaId: 'ml-l01', json: { steps: [{ id: 'ml-l01-s1', blocks: [{ type: 'mcq', id: 'q1' }, { type: 'learn' }] }] } },
      { metaId: 'ml-l02', json: { steps: [{ id: 'ml-l02-s1', blocks: [{ type: 'mcq', id: 'ml-l02-q1' }, { type: 'reflect', id: 'ml-l02-q1' }] }] } },
    ];
    expect(idProblems(bad)).toEqual(['q1 does not start with ml-l01-', 'ml-l02-q1 is used twice']);
  });

  it('every ML step and block id starts with its lesson id and is unique in the subject', () => {
    expect(idProblems(ml.courses.map((c) => ({ metaId: c.metaId, json: loadJson(c.src) })))).toEqual([]);
  });
});

describe('the ML subject shell', () => {
  it('colours text only through theme tokens: no colour literal, no opacity class', () => {
    const files = [];
    const walk = (dir) => {
      for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        if (isRawMaterial(path.relative(path.join(ROOT, 'src/content'), p))) continue;
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (/\.(jsx?|css)$/.test(name)) files.push(p);
      }
    };
    walk(path.join(ROOT, 'src/content/ml'));
    expect(files.length).toBeGreaterThan(1);
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      expect(src, f).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?)\(/);
      expect(src, f).not.toMatch(/\bopacity-\d/);
    }
  });
});
