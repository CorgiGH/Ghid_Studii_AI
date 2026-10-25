// The L1 mock test: sql questions in the test validator, the scoring rule, and the shape of mock-l1.json.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { scoreSqlQuestion, scoreMock, SQL_DATASETS } from '../../src/components/blocks/test/sqlScoring.js';
import { checkResult } from '../../src/sql/check.js';
import bd from '../../src/content/bd/index.js';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const MOCK = path.join(ROOT, 'src/content/bd/tests/mock-l1.json');

function validate(json) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mock-'));
  const f = path.join(dir, 'case.json');
  fs.writeFileSync(f, JSON.stringify(json));
  const r = spawnSync('node', ['scripts/validate-test-json.mjs', f], { cwd: ROOT, encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  return { code: r.status, out: r.stdout + r.stderr };
}

const bi = (s) => ({ en: s, ro: s });
const sqlQ = (over = {}) => ({
  id: 'q1', type: 'sql', prompt: bi('Show all.'), points: 3, dataset: 'biblioteca', kind: 'query',
  solution: 'SELECT 1 FROM dual', check: { order: 'any', mode: 'bag' }, ...over,
});
const wrap = (q) => ({ meta: { id: 't', title: bi('T'), totalPoints: 3 }, questions: [q] });

describe('validate-test-json: sql questions', () => {
  it('accepts a complete sql question', () => {
    expect(validate(wrap(sqlQ())).code).toBe(0);
  });
  for (const field of ['solution', 'dataset', 'check']) {
    it(`requires ${field}`, () => {
      const q = sqlQ();
      delete q[field];
      const r = validate(wrap(q));
      expect(r.code).toBe(1);
      expect(r.out).toContain(field);
    });
  }
  it('rejects an unknown dataset', () => {
    expect(validate(wrap(sqlQ({ dataset: 'nope' }))).code).toBe(1);
  });
});

describe('sql scoring', () => {
  const ok = { ok: true, kind: 'correct', missing: [], extra: [] };
  const bad = { ok: false, kind: 'rows', missing: [['x']], extra: [] };
  it('gives full points only when the answer is right on both datasets', () => {
    expect(scoreSqlQuestion(3, [ok, ok])).toBe(3);
    expect(scoreSqlQuestion(3, [ok, bad])).toBe(0);
    expect(scoreSqlQuestion(3, [bad, ok])).toBe(0);
    expect(scoreSqlQuestion(3, [])).toBe(0);
    expect(scoreSqlQuestion(3, [ok, null])).toBe(0);
  });
  it('runs on the lab data and its hidden twin', () => {
    expect(SQL_DATASETS('biblioteca')).toEqual(['biblioteca', 'biblioteca-hidden']);
  });
  it('grades through the real checker', () => {
    const expected = { columns: ['A'], rows: [['1']] };
    const spec = { order: 'any', mode: 'bag', kind: 'query' };
    const right = checkResult({ kind: 'rows', columns: ['A'], rows: [['1']], rowCount: 1 }, expected, spec);
    const wrong = checkResult({ kind: 'rows', columns: ['A'], rows: [['2']], rowCount: 1 }, expected, spec);
    expect(scoreSqlQuestion(4, [right, right])).toBe(4);
    expect(scoreSqlQuestion(4, [right, wrong])).toBe(0);
  });
});

describe('mock-l1.json', () => {
  const json = JSON.parse(fs.readFileSync(MOCK, 'utf8'));
  it('is a valid 25 point test of 8 sql problems with the pinned meta', () => {
    expect(validate(json).code).toBe(0);
    expect(json.meta).toMatchObject({ id: 'bd-mock-l1', year: 2026, type: 'mock', duration: 0, totalPoints: 25, oneQuestionPerScreen: true, modes: ['paper', 'practice'] });
    expect(json.questions).toHaveLength(8);
    expect(json.questions.map((q) => q.points)).toEqual([3, 3, 3, 3, 3, 3, 3, 4]);
    expect(json.questions.every((q) => q.type === 'sql' && q.dataset === 'biblioteca')).toBe(true);
    expect(json.questions.reduce((s, q) => s + q.points, 0)).toBe(25);
  });
  it('gives 25 when every problem is right on both datasets and 0 for a wrong one', () => {
    const right = [{ ok: true }, { ok: true }];
    const all = json.questions.map((q) => scoreSqlQuestion(q.points, right));
    expect(scoreMock(json.questions, Object.fromEntries(json.questions.map((q, i) => [q.id, all[i]])))).toBe(25);
    expect(scoreSqlQuestion(json.questions[0].points, [{ ok: true }, { ok: false }])).toBe(0);
  });
  it('carries grading notes and an English translation for every problem', () => {
    for (const q of json.questions) {
      expect(q.gradingNotes.en.length, q.id).toBeGreaterThan(10);
      expect(q.gradingNotes.ro.length, q.id).toBeGreaterThan(10);
      expect(q.prompt.en, q.id).not.toBe(q.prompt.ro);
    }
  });
});

describe('bd registers the mock', () => {
  it('lists it under tests', () => {
    expect(bd.tests.map((t) => t.id)).toContain('bd-mock-l1');
    expect(bd.tests.find((t) => t.id === 'bd-mock-l1').src).toBe('bd/tests/mock-l1.json');
  });
});
