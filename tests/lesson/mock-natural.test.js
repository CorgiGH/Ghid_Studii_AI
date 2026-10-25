// Natural answers to the mock problems (what the prompt asks for, without extras) must be graded correct on both datasets.
import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, describe, expect, it } from 'vitest';
import { createEngine } from '../../src/sql/engine/core.js';
import { checkResult } from '../../src/sql/check.js';
import { DEFAULT_CLOCK, datasetText } from '../../scripts/sql/freeze-lib.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const mock = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/bd/tests/mock-l1.json'), 'utf8'));
const part = (id) => mock.questions.flatMap((q) => [q, ...(q.moreParts ?? [])]).find((p) => p.id === id);
const expectedOf = (id, ds) => JSON.parse(fs.readFileSync(path.join(ROOT, `public/sql/expected/${id}.${ds}.json`), 'utf8'));

const NATURAL = {
  'bd-mock-l1-p6': 'SELECT c.nume, ca.titlu, a.nume, i.apreciere FROM cititori c JOIN imprumuturi i ON c.id_cititor = i.id_cititor JOIN carti ca ON ca.id_carte = i.id_carte JOIN scris s ON s.id_carte = ca.id_carte JOIN autori a ON a.id_autor = s.id_autor WHERE i.apreciere >= 9',
  'bd-mock-l1-p7': 'SELECT a.nume, a.prenume, c.titlu FROM autori a LEFT JOIN scris s ON a.id_autor = s.id_autor LEFT JOIN carti c ON c.id_carte = s.id_carte',
};

describe('natural answers are graded correct', () => {
  const engines = {};
  beforeAll(async () => {
    for (const name of ['biblioteca', 'biblioteca-hidden']) {
      engines[name] = await createEngine(new PGlite(), { clock: DEFAULT_CLOCK, datasets: { [name]: datasetText(name) } });
    }
  }, 120000);
  for (const [id, sql] of Object.entries(NATURAL)) {
    for (const ds of ['biblioteca', 'biblioteca-hidden']) {
      it(`${id} on ${ds}`, async () => {
        const p = part(id);
        const result = await engines[ds].run(sql, { dataset: ds });
        expect(result.error).toBeUndefined();
        const v = checkResult(result, expectedOf(id, ds), { order: 'any', mode: 'bag', ...p.check, kind: 'query' });
        expect(v.kind).toBe('correct');
      });
    }
  }
  it('the prompt of P6 names the rating', () => {
    expect(part('bd-mock-l1-p6').prompt.en).toMatch(/rating/);
    expect(part('bd-mock-l1-p6').prompt.ro).toMatch(/apreciere/);
  });
});
