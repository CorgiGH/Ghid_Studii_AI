// Widget captions and counters say only what the widget draws at that step (screen-audit fixes).
import { describe, it, expect } from 'vitest';
import { rows, roCount, numberRanges, listRo } from '../../src/components/lesson/viz/logic/words.js';
import { rowInsert, rowInsertCaption } from '../../src/components/lesson/viz/logic/row-insert.js';
import { deleteSweep, sweepBadges, sweepCaption } from '../../src/components/lesson/viz/logic/delete-sweep.js';
import { charBoxes, charOps, charBoxCount, charBoxStep, charBoxCaption } from '../../src/components/lesson/viz/logic/char-boxes.js';
import { swapCalls, stageChanges } from '../../src/components/lesson/viz/logic/char-strips.js';

describe('words: Romanian counted nouns', () => {
  it('says 1 rând, 5 rânduri, 20 de rânduri, 42 de rânduri, 101 rânduri', () => {
    expect(rows(1).ro).toBe('1 rând');
    expect(rows(5).ro).toBe('5 rânduri');
    expect(rows(19).ro).toBe('19 rânduri');
    expect(rows(20).ro).toBe('20 de rânduri');
    expect(rows(42).ro).toBe('42 de rânduri');
    expect(rows(101).ro).toBe('101 rânduri');
    expect(rows(0).ro).toBe('0 rânduri');
    expect(rows(1).en).toBe('1 row');
    expect(roCount(3, 'notă', 'note')).toBe('3 note');
  });
  it('writes runs of numbers as ranges and lists with «și»', () => {
    expect(numberRanges([120, 121, 122, 123])).toBe('120–123');
    expect(numberRanges([111, 113])).toBe('111, 113');
    expect(listRo(['a', 'b', 'c'])).toBe('a, b și c');
  });
});

describe('row-insert captions', () => {
  const props = {
    table: 'studenti',
    row: { nr_matricol: '126', nume: 'Vasile', prenume: 'Mihai', an: 2, grupa: 'B2', bursa: null, data_nastere: null },
    errorCase: { row: { nr_matricol: null, nume: 'Vasile', prenume: 'Mihai', an: 2, grupa: 'B2', bursa: null, data_nastere: null }, code: 'ORA-01400' },
  };
  const r = rowInsert(props);
  it('never calls the table empty (the screen before shows its rows)', () => {
    const c = rowInsertCaption(r, 0, 'studenti');
    expect(c.ro).not.toMatch(/(tabelul|studenti) (este|e) gol/);
    expect(c.ro).toContain('locul gol al rândului nou');
  });
  it('names the NULL columns as NULL because NULL was written for them', () => {
    const c = rowInsertCaption(r, 1, 'studenti');
    expect(c.ro).toContain("'126' în nr_matricol");
    expect(c.ro).toContain('Coloanele bursa și data_nastere sunt NULL pentru că am scris NULL pe locul lor.');
    expect(c.en).toContain('Columns bursa and data_nastere are NULL because we wrote NULL in their place.');
    expect(c.ro).not.toContain('fără valoare');
  });
  it('the error step speaks of the row above and the red row below', () => {
    const c = rowInsertCaption(r, 2, 'studenti');
    expect(c.ro).toBe("Nu s-a adăugat nimic. Rândul de sus, cu '126', a intrat la pasul trecut. Rândul roșu are NULL în nr_matricol, iar nr_matricol e NOT NULL, deci e respins.");
  });
});

describe('delete-sweep badges add up to the table', () => {
  it('shows only the table size before anything is marked', () => {
    const d = deleteSweep({ table: 'note', where: 'valoare < 5' });
    expect(sweepBadges(d, 0)).toEqual([{ kind: 'total', n: 42 }]);
  });
  it('once marked: 5 go and 37 stay, never 42 stay', () => {
    const d = deleteSweep({ table: 'note', where: 'valoare < 5' });
    for (const k of [1, 2]) {
      const b = sweepBadges(d, k);
      expect(b).toEqual([{ kind: 'go', n: 5 }, { kind: 'stay', n: 37 }]);
      expect(b[0].n + b[1].n).toBe(42);
    }
    expect(sweepCaption(d, 0, { table: 'note', where: 'valoare < 5' }).ro).toBe('note are 42 de rânduri. WHERE hotărăște care pleacă.');
    expect(sweepCaption(d, 2, { table: 'note', where: 'valoare < 5' }).ro).toBe('5 rânduri șterse, rămân 37.');
  });
  it('without WHERE: 42 go and 0 stay', () => {
    const d = deleteSweep({ table: 'note' });
    expect(sweepBadges(d, 1)).toEqual([{ kind: 'go', n: 42 }, { kind: 'stay', n: 0 }]);
  });
});

describe('char-boxes: every operation is asked before its result', () => {
  const props = { value: 'Cosmin', width: 10, ops: ['LENGTH', 'TRIM', 'LIKE'], likePattern: '%n', column: 'prenume' };
  const b = charBoxes(props.value, props.width);
  const ops = charOps(props);
  it('names the column in the calls', () => {
    expect(ops.map(o => o.sql)).toEqual(['LENGTH(prenume)', 'TRIM(prenume)', "prenume LIKE '%n'"]);
  });
  it('has an intro, then result / ask pairs', () => {
    expect(charBoxCount(3)).toBe(6);
    expect([0, 1, 2, 3, 4, 5].map(charBoxStep)).toEqual([
      { kind: 'intro', index: 0 }, { kind: 'result', index: 0 }, { kind: 'ask', index: 1 },
      { kind: 'result', index: 1 }, { kind: 'ask', index: 2 }, { kind: 'result', index: 2 },
    ]);
    expect(charBoxCount(1)).toBe(2);
  });
  it('the intro asks and does not yet say the blanks are spaces', () => {
    const c = charBoxCaption(props, b, ops, 0);
    expect(c.ro).toBe('O coloană CHAR(10) are mereu 10 căsuțe. Cosmin umple primele 6. Ce e în celelalte 4? Și LENGTH(prenume): ce număr dă?');
    expect(c.ro).not.toContain('spații');
  });
  it('an ask step names the next call and no result', () => {
    const c = charBoxCaption(props, b, ops, 2);
    expect(c.ro).toContain('Urmează TRIM(prenume).');
    expect(c.ro).not.toMatch(/rămân \d/);
  });
  it('the LIKE result quotes the pattern as SQL', () => {
    expect(charBoxCaption(props, b, ops, 5).ro).toBe("Ultima căsuță conține un spațiu, nu «n», deci LIKE '%n' nu se potrivește. După TRIM s-ar potrivi.");
  });
});

describe('char-strips swap: the calls are real SQL', () => {
  it('writes the nested REPLACE and the TRANSLATE in full', () => {
    expect(swapCalls({ input: 'Ciobotariu', from: 'ia', to: 'ai' })).toEqual({
      replace: "REPLACE(REPLACE('Ciobotariu', 'i', 'a'), 'a', 'i')",
      translate: "TRANSLATE('Ciobotariu', 'ia', 'ai')",
    });
  });
  it('marks the cells a REPLACE changed, including the ones the first REPLACE made', () => {
    expect(stageChanges('Ciobotariu', 'Caobotarau').map((x, i) => (x ? i : -1)).filter(i => i >= 0)).toEqual([1, 8]);
    expect(stageChanges('Caobotarau', 'Ciobotiriu').map((x, i) => (x ? i : -1)).filter(i => i >= 0)).toEqual([1, 6, 8]);
  });
});
