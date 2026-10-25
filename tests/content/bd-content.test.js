// The BD lesson content as a whole: registration order, official-exercise coverage, the text sweep, and the query-machine ask rule.
import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { createEngine } from '../../src/sql/engine/core.js';
import { datasetText } from '../../scripts/sql/freeze-lib.mjs';
import bd from '../../src/content/bd/index.js';
import { coverage } from '../../scripts/sql/coverage.mjs';
import { sweepDir, sweepNode } from '../../scripts/sql/text-sweep.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const COURSES = path.join(ROOT, 'src/content/bd/courses');
const TESTS = path.join(ROOT, 'src/content/bd/tests');
const lessons = fs.readdirSync(COURSES).filter((f) => /^lesson-.*\.json$/.test(f)).sort().map((f) => ({ file: f, json: JSON.parse(fs.readFileSync(path.join(COURSES, f), 'utf8')) }));

describe('registration', () => {
  it('lists every lesson file once, in id order: L1, D1-D3, L2 ... L25', () => {
    expect(lessons).toHaveLength(28);
    const ids = lessons.map((l) => l.json.meta.id);
    expect(bd.courses.map((c) => c.id)).toEqual(ids);
    expect(bd.courses.map((c) => c.id)).toEqual([...ids].sort());
    expect(ids.slice(0, 5)).toEqual(['bd-l01', 'bd-l01a', 'bd-l01b', 'bd-l01c', 'bd-l02']);
    expect(ids[27]).toBe('bd-l25');
  });
  it('gives each entry its file, a metaId, a bilingual title and sectionCount = steps.length', () => {
    for (const [i, c] of bd.courses.entries()) {
      const { file, json } = lessons[i];
      expect(c.src).toBe(`bd/courses/${file}`);
      expect(c.metaId).toBe(json.meta.id);
      expect(c.sectionCount).toBe(json.steps.length);
      for (const k of ['title', 'shortTitle']) {
        expect(c[k].en, `${c.id} ${k}`).toBeTruthy();
        expect(c[k].ro, `${c.id} ${k}`).toBeTruthy();
      }
    }
  });
  it('uses unique step and block ids across the whole subject', () => {
    const seen = new Set();
    for (const { json } of lessons) {
      for (const s of json.steps) {
        expect(seen.has(s.id), s.id).toBe(false);
        seen.add(s.id);
        for (const b of s.blocks) {
          if (!b.id) continue;
          expect(seen.has(b.id), b.id).toBe(false);
          seen.add(b.id);
        }
      }
    }
  });
});

describe('official exercises', () => {
  it('lab 1 ex 1-3, lab 2 inline-1, inline-2 and ex 1-15, lab 3 ex 1-13 and lab 4 ex 1-14 appear exactly once', () => {
    const c = coverage(COURSES);
    expect(c.missing).toEqual([]);
    expect(c.repeated).toEqual([]);
    expect(c.unknown).toEqual([]);
    expect(c.found).toHaveLength(47);
  });
});

describe('text sweep', () => {
  it('finds nothing in the lessons or the mock test', () => {
    expect(sweepDir([COURSES, TESTS])).toEqual([]);
  });
  it('catches phase names and pedagogy labels in either language', () => {
    const rules = (en, ro) => sweepNode({ title: { en: en ?? 'x', ro: ro ?? 'x' } }, 't').map((f) => f.rule);
    expect(rules('Pretest', null).join()).toMatch(/pretest/);
    expect(rules(null, 'Faza 2').join()).toMatch(/faza/);
    expect(rules('Kapur says', null).join()).toMatch(/Kapur/);
    expect(rules('Dunlosky', null).join()).toMatch(/Dunlosky/);
    expect(rules('Productive failure', null).join()).toMatch(/productive failure/);
    expect(rules('Retrieval practice', null).join()).toMatch(/retrieval/);
    expect(rules('Regula', 'Regula').join()).toMatch(/Regula/);
    expect(rules('Why?', 'De ce?').join()).toMatch(/De ce/);
    expect(rules(null, 'Scrie singur: SELECT').join()).toMatch(/Scrie singur/);
    expect(rules(null, 'Încearcă: scrie interogarea').join()).toMatch(/Încearcă/);
    expect(sweepNode({ blocks: [{ type: 'learn', content: { en: 'Regula is in the text', ro: 'Regula se aplică' } }] }, 't')).toEqual([]);
  });
  it('catches English words in a Romanian string but not in code or in the English side', () => {
    const node = (en, ro) => ({ content: { en, ro } });
    expect(sweepNode(node('The rows and the columns', 'The rows și coloanele'), 't').map((f) => f.rule).join()).toMatch(/English word/);
    expect(sweepNode(node('x', 'Rândurile cu `the and with` rămân'), 't')).toEqual([]);
    expect(sweepNode(node('The rows and the columns', 'Rândurile și coloanele'), 't')).toEqual([]);
  });
  it('catches the mistakes of the official pages when they are repeated as true', () => {
    const bad = (text, key = 'en') => sweepNode({ content: { [key]: text } }, 't').map((f) => f.rule).join();
    expect(bad('NULL = NULL returns FALSE')).toMatch(/4\.1\.1/);
    expect(bad('NULL = NULL does not return FALSE, it is UNKNOWN')).toBe('');
    expect(bad('To match a real % you prefix it with \\ and nothing else')).toMatch(/4\.1\.5/);
    expect(bad('To match a real % you prefix it with \\ and write ESCAPE')).toBe('');
    expect(bad('NOT IN is equivalent to != ANY')).toMatch(/4\.1\.7/);
    expect(bad('INTERSECT ALL keeps duplicates')).toMatch(/4\.1\.8/);
    expect(bad('Oracle 11g has no INTERSECT ALL')).toBe('');
    const sql = (code) => sweepNode({ solution: code }, 't').map((f) => f.rule).join();
    expect(sql('CREATE TABLE cursuri (id_curs CHAR(4), titlu_curs VARCHAR2(10))')).toMatch(/4\.1\.2/);
    expect(sql('SELECT nume FROM studenţi')).toMatch(/4\.1\.6/);
    expect(sql("SELECT TO_CHAR(SYSDATE, 'DD-MM-YYYY HH:MI') FROM dual")).toMatch(/4\.1\.13/);
    expect(sql("SELECT TO_CHAR(SYSDATE, 'DD-MM-YYYY HH24:MI') FROM dual")).toBe('');
    expect(sql("SELECT NEXT_DAY('13-OCT-15', 'TUESDAY') FROM dual")).toMatch(/4\.1\.14/);
    expect(sql("SELECT NEXT_DAY(TO_DATE('13-10-2015', 'DD-MM-YYYY'), 'TUESDAY') FROM dual")).toBe('');
  });
  it('catches a phase name that ends in a Romanian letter ("fază")', () => {
    const ro = (text) => sweepNode({ content: { en: 'x', ro: text } }, 't').map((f) => f.rule).join();
    expect(ro('În această fază scrii singur interogarea.')).toMatch(/faza/);
    expect(ro('Faza 2')).toMatch(/faza/);
    expect(ro('Fazele lunii nu au legătură cu SQL.')).toMatch(/faza/);
    expect(ro('Frazele de mai jos sunt corecte.')).toBe('');
  });
  it('catches a capitalised English word in a Romanian string, but not an SQL keyword in capitals', () => {
    const ro = (text) => sweepNode({ content: { en: 'x', ro: text } }, 't').map((f) => f.rule).join();
    expect(ro('Show numele studenților.')).toMatch(/English word in Romanian text: "Show"/);
    expect(ro('The numele studenților.')).toMatch(/English word/);
    expect(ro('Folosește IS NULL, nu = NULL, și leagă condițiile cu AND sau OR; NOT schimbă rezultatul.')).toBe('');
    expect(ro('Comanda CREATE TABLE creează tabelul.')).toBe('');
  });
  it('catches a bare "Încearcă singur" used as a label', () => {
    const ro = (text) => sweepNode({ content: { en: 'x', ro: text } }, 't').map((f) => f.rule).join();
    expect(ro('Încearcă singur')).toMatch(/Încearcă/);
    expect(ro('**Încearcă singur**\nScrie interogarea pentru anul 2.')).toMatch(/Încearcă/);
    expect(ro('Rezolvă exercițiul de mai jos.\nÎncearcă singur')).toMatch(/Încearcă/);
    expect(ro('Încearcă singur. Scrie interogarea pentru anul 2.')).toMatch(/Încearcă/);
    expect(ro('Încearcă singur Scrie interogarea pentru anul 2.')).toMatch(/Încearcă/);
    expect(ro('Încearcă singur să scrii interogarea, apoi compară.')).toBe('');
    expect(ro('Încearcă să scrii interogarea înainte de indiciu.')).toBe('');
  });
  it('catches a text literal followed by TO_CHAR with no || (outline 4.1.12)', () => {
    const sql = (code) => sweepNode({ solution: code }, 't').map((f) => f.rule).join();
    expect(sql("SELECT 'Este o zi frumoasa de ' TO_CHAR(SYSDATE, 'Day') FROM dual")).toMatch(/4\.1\.12/);
    expect(sql("SELECT 'Azi este '\n       TO_CHAR(SYSDATE, 'DD.MM.YYYY') FROM dual")).toMatch(/4\.1\.12/);
    expect(sql("SELECT 'Este o zi frumoasa de ' || TO_CHAR(SYSDATE, 'Day') FROM dual")).toBe('');
    expect(sql("SELECT TO_CHAR(SYSDATE, 'DD') AS zi, TO_CHAR(SYSDATE, 'MM') FROM dual")).toBe('');
    expect(sql("SELECT CASE WHEN bursa IS NULL THEN 'fara' ELSE TO_CHAR(bursa) END FROM studenti")).toBe('');
  });
});

describe('query machines', () => {
  const machines = lessons.flatMap(({ file, json }) => json.steps.flatMap((s) => s.blocks.filter((b) => b.type === 'query-machine').map((b) => ({ file, b }))));
  it('there are query machines to check', () => {
    expect(machines.length).toBeGreaterThanOrEqual(27);
  });
  it('an `ask` text exists only for a predicted stage', () => {
    for (const { file, b } of machines) {
      for (const clause of Object.keys(b.ask ?? {})) {
        expect(b.stages.find((s) => s.clause === clause)?.predict, `${file} ${b.id} ask.${clause}`).toBe(true);
        expect(b.ask[clause].en && b.ask[clause].ro, `${b.id} ask.${clause} needs both languages`).toBeTruthy();
      }
    }
  });
  it('the `say` of a predicted stage is shown after the answer, so it states a result and asks nothing', () => {
    for (const { file, b } of machines) {
      for (const st of b.stages.filter((s) => s.predict)) {
        const say = b.say[st.clause];
        expect(say, `${file} ${b.id} say.${st.clause}`).toBeTruthy();
        for (const lang of ['en', 'ro']) {
          expect(say[lang], `${b.id} say.${st.clause}.${lang} reads as a prompt`).not.toMatch(/^\s*(predict|prezice|guess|ghice[sș]te)\b|\?\s*$/i);
        }
      }
    }
  });
});

// A question about data shows that data: an mcq or reflect whose text names a table or column of the lab
// dataset (in backticks) carries a `table` showing it, unless another block on the same screen already shows
// rows (a query machine, a widget, or another question with a table).
const FACULTATE = fs.readFileSync(path.join(ROOT, 'public/sql/datasets/facultate.sql'), 'utf8');
const LAB_TABLES = [...FACULTATE.matchAll(/CREATE TABLE (\w+)\s*\(([\s\S]*?)\n\s*\)\s*;/g)].map((m) => ({ name: m[1].toLowerCase(), cols: [...m[2].matchAll(/^\s*(\w+)\s+\w/gm)].map((c) => c[1].toLowerCase()).filter((c) => !['constraint', 'primary', 'foreign', 'unique', 'check'].includes(c)) }));
const LAB_WORDS = new Set(LAB_TABLES.flatMap((t) => [t.name, ...t.cols]));
const textOf = (b) => JSON.stringify([b.question, b.prompt, b.answer, (b.options || []).map((o) => [o.text, o.explain])]);
const namedData = (b) => [...new Set([...textOf(b).matchAll(/`([a-z_]+)`/gi)].map((m) => m[1].toLowerCase()).filter((w) => LAB_WORDS.has(w)))];
const showsRows = (b) => b.type === 'query-machine' || b.type === 'viz' || ((b.type === 'mcq' || b.type === 'reflect') && b.table);

export function questionsWithoutData(list = lessons) {
  const out = [];
  for (const { json } of list) {
    for (const step of json.steps) {
      for (const b of step.blocks) {
        if ((b.type !== 'mcq' && b.type !== 'reflect') || b.table) continue;
        const named = namedData(b);
        if (named.length && !step.blocks.some((o) => o !== b && showsRows(o))) out.push(`${step.id} ${b.id}: names ${named.join(', ')} but shows no table`);
      }
    }
  }
  return out;
}

describe('questions show the data they ask about', () => {
  it('every mcq or reflect that names a lab table or column shows that data on its screen', () => {
    expect(questionsWithoutData()).toEqual([]);
  });
});

// Every table a question shows runs on the engine and shows a short, non-empty result (the learner reads it on a phone).
describe('question tables run', () => {
  let engine;
  beforeAll(async () => {
    engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate: datasetText('facultate') } });
  });
  it('every question table runs, returns rows, and stays short enough to scroll (at most 45 rows)', async () => {
    const bad = [];
    for (const { json } of lessons) {
      for (const step of json.steps) {
        for (const b of step.blocks) {
          if (!b.table) continue;
          for (const tb of Array.isArray(b.table) ? b.table : [b.table]) {
            const r = await engine.run(tb.sql, { dataset: tb.dataset, maxRows: 50 });
            if (r.error) bad.push(`${step.id} ${b.id}: ${r.error.code} for ${tb.sql}`);
            else if (!r.rows.length) bad.push(`${step.id} ${b.id}: no rows for ${tb.sql}`);
            else if (r.rowCount > 45) bad.push(`${step.id} ${b.id}: ${r.rowCount} rows (keep it to 45) for ${tb.sql}`);
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
