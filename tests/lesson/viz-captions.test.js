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

import { likeTrace } from '../../src/components/lesson/viz/logic/common.js';
import { likeIntro, likeCaption, likeTally } from '../../src/components/lesson/viz/logic/like-slider.js';
import { inBetween, inCondition, inCaption } from '../../src/components/lesson/viz/logic/in-between.js';

describe('like-slider: % stands for any beginning', () => {
  it('lines «escu» up with the end of the name, so a failed name shows its ending', () => {
    const b = likeTrace('%escu', 'Bodnar');
    expect(b.match).toBe(false);
    expect(b.steps).toEqual([{ tok: 0, from: 0, to: 2, ok: true }, { tok: 1, from: 2, to: 2, ok: false }]);
    expect(likeTrace('%escu', 'Prelipcean').steps[0]).toEqual({ tok: 0, from: 0, to: 6, ok: true });
    expect(likeTrace('%escu', 'Popescu').match).toBe(true);
  });
  it('the verdicts do not change', () => {
    const names = ['Popescu', 'Prelipcean', 'Antonie', 'Arhire', 'Panaite', 'Bodnar', 'Archip', 'Ciobotariu', 'Pintescu', 'Cobzaru', 'Bucur'];
    expect(names.filter(n => likeTrace('%escu', n).match)).toEqual(['Popescu', 'Pintescu']);
    expect(names.filter(n => likeTrace('_r%', n).match)).toEqual(['Prelipcean', 'Arhire', 'Archip']);
  });
  it('the intro explains only the signs in the pattern', () => {
    expect(likeIntro('%escu').ro).toBe('Șablonul %escu se așază peste fiecare nume. % ia oricâte litere, chiar niciuna; «escu» trebuie să fie exact la sfârșit.');
    expect(likeIntro('%escu').ro).not.toContain('_');
    expect(likeIntro('_r%').ro).toBe('Șablonul _r% se așază peste fiecare nume. _ ia exact o literă; «r» trebuie să fie a doua literă; % ia oricâte litere, chiar niciuna.');
  });
  it('the failure caption names what differs', () => {
    expect(likeCaption('%escu', 'Bodnar', likeTrace('%escu', 'Bodnar')).ro).toBe('Bodnar: % poate lua orice început, dar la sfârșit șablonul cere «escu», iar aici e «dnar». Nu se potrivește.');
    expect(likeCaption('_r%', 'Popescu', likeTrace('_r%', 'Popescu')).ro).toBe('Popescu: litera «o» nu este «r», cum cere șablonul. Nu se potrivește.');
    expect(likeCaption('Bucur_', 'Bucur', likeTrace('Bucur_', 'Bucur')).ro).toBe('Bucur: numele s-a terminat înainte ca șablonul să-și găsească toate literele. Nu se potrivește.');
    expect(likeTally(1, 13).ro).toBe('1 din 13 nume se potrivește.');
  });
});

describe('in-between: the condition is printed as valid SQL', () => {
  const inProps = { list: ['Andrei', 'Radu', 'Marius'] };
  it('IN, BETWEEN and ANY', () => {
    expect(inCondition('in', inProps, 'Bogdan')).toBe("'Bogdan' IN ('Andrei', 'Radu', 'Marius')");
    expect(inCondition('between', { low: 250, high: 350 }, 450)).toBe('450 >= 250 AND 450 <= 350');
    expect(inCondition('between', { low: 250, high: 350 }, null)).toBe('NULL >= 250 AND NULL <= 350');
    expect(inCondition('any', { list: [5, 7], op: '>' }, 6)).toBe('6 > ANY (5, 7)');
  });
  it('captions say which comparison decided', () => {
    expect(inCaption('in', inProps, 'Radu', inBetween('in', inProps, 'Radu')).ro).toBe("'Radu' = 'Radu': ajunge o valoare egală. Adevărat, rândul e ales.");
    expect(inCaption('in', inProps, 'Bogdan', inBetween('in', inProps, 'Bogdan')).ro).toBe("'Bogdan' nu e egal cu niciuna dintre cele 3 valori: fals, rândul nu e ales.");
    const bp = { low: 250, high: 350 };
    expect(inCaption('between', bp, 450, inBetween('between', bp, 450)).ro).toBe('450 e peste 350: fals, rândul nu e ales.');
    expect(inCaption('between', bp, 250, inBetween('between', bp, 250)).ro).toBe('250 e între 250 și 350 (capetele contează): adevărat, rândul e ales.');
  });
});
