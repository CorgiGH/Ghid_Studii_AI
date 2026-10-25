import { describe, expect, it } from 'vitest';
import { QM_ALL_ROWS, TRUTH_LABEL, endKind, gridTemplate, leadKind, markTone, setPanelRows, textWidth } from '../../src/components/lesson/blocks/qmLayout.js';
import { ALL_ROWS, cellClass, headerParts, spacedColumns, tableFitsWhole } from '../../src/components/lesson/tableText.js';
import { hiddenRowsBelow } from '../../src/components/lesson/useScrollCues.js';
import { changedRows, describeRows, sortRows, usesDatasetTables } from '../../src/components/lesson/blocks/sqlExerciseSpec.js';

const row = (key, cells, extra = {}) => ({ key, cells, status: 'plain', ...extra });
const tracks = (tpl) => tpl.split(/ (?![^(]*\))/);
const minCh = (track) => Number(/minmax\(([\d.]+)ch/.exec(track)[1]);
const share = (track) => Number(/, ([\d.]+)fr\)/.exec(track)[1]);

describe('query machine grid', () => {
  const students = [
    row('1', { nume: 'Prelipcean', bursa: null, 'ROUND(BURSA/100)': null }),
    row('2', { nume: 'Antonie', bursa: '450', 'ROUND(BURSA/100)': '5' }),
  ];

  it('a long computed header does not widen its column: it wraps, the values decide the width', () => {
    const { template } = gridTemplate({ columns: ['nume', 'bursa', 'ROUND(BURSA/100)'], labels: { 'ROUND(BURSA/100)': 'ROUND(bursa / 100)' }, rows: students });
    const [nume, , round] = tracks(template);
    expect(minCh(round)).toBeLessThan(minCh(nume));
    expect(share(round)).toBeLessThan(textWidth('ROUND(bursa / 100)') + 1);
  });

  it('no side slots on a plain step; a slot appears only for what the step shows', () => {
    expect(gridTemplate({ columns: ['nume'], rows: students }).template.startsWith('minmax(')).toBe(true);
    expect(leadKind([row('a', {}, { status: 'pickable' })])).toBe('pick');
    expect(leadKind([row('a', {}, { pos: 1 })])).toBe('pos');
    expect(leadKind([row('a', {}, { truth: 'U' })])).toBe('tri');
    expect(endKind([row('a', {}, { mark: true })])).toBe('mark');
    expect(endKind([row('a', {}, { count: 3 })])).toBe('count');
    expect(endKind([row('a', {})])).toBe('none');
  });

  it('the tri-state slot fits the Romanian word NECUNOSCUT', () => {
    const ro = gridTemplate({ columns: ['nume'], rows: [row('a', { nume: 'x' }, { truth: 'U' })], lang: 'ro' }).template;
    const en = gridTemplate({ columns: ['nume'], rows: [row('a', { nume: 'x' }, { truth: 'U' })], lang: 'en' }).template;
    expect(parseFloat(ro)).toBeGreaterThan(parseFloat(en));
    expect(TRUTH_LABEL.U.ro).toBe('NECUNOSCUT');
    expect(TRUTH_LABEL.T.ro).toBe('ADEVĂRAT');
  });

  it('the four columns of a 13-student WHERE fit a 390 px phone box (296 px, 8 px per ch)', () => {
    const rows = [
      row('1', { nume: 'Prelipcean', prenume: 'Radu', an: 3, bursa: null }, { mark: true, status: 'gone' }),
      row('2', { nume: 'Ciobotariu', prenume: 'Alexandra', an: 2, bursa: '350' }, { mark: false, status: 'kept' }),
    ];
    const { template } = gridTemplate({ columns: ['nume', 'prenume', 'an', 'bursa'], rows });
    const cols = tracks(template).filter((x) => x.startsWith('minmax'));
    const px = cols.reduce((s, x) => s + minCh(x) * 8, 0) + 1.6 * 16 + 4 * 4 + 14;
    expect(px).toBeLessThanOrEqual(296);
  });

  it('a checked mark: green when kept, quiet when rightly left out, red when wrong', () => {
    expect(markTone({ mark: true, status: 'kept' })).toBe('ok');
    expect(markTone({ mark: true, status: 'gone' })).toBe('ok-out');
    expect(markTone({ mark: false, status: 'gone' })).toBe('bad');
    expect(markTone({ status: 'kept' })).toBeNull();
  });

  it('set lists: plain before Combine, every row kept in place after it', () => {
    const left = [row('116', {}, { status: 'kept', moved: true }), row('117', {}, { status: 'gone' })];
    const right = [row('117', {}, { status: 'plain' })];
    const lists = setPanelRows({ phase: 'lists', panels: { left, right, result: [] } });
    expect(lists.left.map((r) => r.status)).toEqual(['plain', 'plain']);
    const shown = setPanelRows({ phase: 'show', panels: { left, right, result: [left[0]] } });
    expect(shown.left.map((r) => [r.key, r.status, r.moved])).toEqual([['116', 'kept', false], ['117', 'gone', false]]);
    expect(shown.result).toHaveLength(1);
  });

  it('shows every row up to 16, scrolls past that', () => {
    expect(QM_ALL_ROWS).toBe(16);
    expect(ALL_ROWS).toBe(16);
    expect(tableFitsWhole(16)).toBe(true);
    expect(tableFitsWhole(17)).toBe(false);
  });
});

describe('table text', () => {
  it('a header breaks after _ , ( / and spaces', () => {
    expect(headerParts('NR_MATRICOL')).toEqual(['NR_', 'MATRICOL']);
    expect(headerParts("LPAD(RPAD('*',BURSA/50,'*'),9)").join('')).toBe("LPAD(RPAD('*',BURSA/50,'*'),9)");
    expect(headerParts("LPAD(RPAD('*',BURSA/50,'*'),9)").length).toBeGreaterThan(4);
    expect(headerParts('NUME')).toEqual(['NUME']);
  });

  it('counts the rows wholly below the visible part of a box', () => {
    expect(hiddenRowsBelow(300, [{ top: 10 }, { top: 290 }, { top: 299 }, { top: 330 }])).toBe(2);
  });
});

describe('a script\'s tables', () => {
  it('rows sort by the first column, numbers by value, NULL last', () => {
    const rows = [['120', 'Pintescu'], ['119', 'Bodnar'], ['9', 'x'], [null, 'n'], ['111', 'Popescu']];
    expect(sortRows(rows).map((r) => r[0])).toEqual(['9', '111', '119', '120', null]);
  });

  it('marks the rows a script added or changed', () => {
    const before = { rows: [['118', 'Ciobotariu', 'A1', null], ['119', 'Bodnar', 'B2', null]] };
    const after = sortRows([['118', 'Ciobotariu', 'A1', null], ['124', 'Nou', 'A1', null], ['119', 'Bodnar', 'A1', '250']]);
    expect(changedRows(after, before)).toEqual([false, true, true]);
    expect(changedRows(after, null)).toBeUndefined();
    expect(changedRows(after, { error: { code: 'ORA-00942' } })).toBeUndefined();
  });

  it('DESCRIBE rows: name, type, NOT NULL', () => {
    expect(describeRows([{ name: 'NR_MATRICOL', type: 'CHAR(6)', nullable: false }, { name: 'NUME', type: 'VARCHAR2(10)', nullable: true }]))
      .toEqual([['NR_MATRICOL', 'CHAR(6)', 'NOT NULL'], ['NUME', 'VARCHAR2(10)', '']]);
  });

  it('a DUAL-only exercise has no Tables drawer', () => {
    expect(usesDatasetTables({ dataset: 'facultate', solution: 'SELECT CEIL(51.3) FROM DUAL' })).toBe(false);
    expect(usesDatasetTables({ dataset: 'facultate', solution: 'SELECT nume FROM studenti' })).toBe(true);
    expect(usesDatasetTables({ dataset: 'facultate-hidden', solution: 'select * from NOTE' })).toBe(true);
    expect(usesDatasetTables({ dataset: 'facultate' })).toBe(true);
  });
});

describe('result cells', () => {
  it('only a value with words in it may wrap; NULL is marked', () => {
    expect(cellClass('Popescu Bogdan este inmatriculat in anul 3.')).toBe('words');
    expect(cellClass('17-FEB-95')).toBeUndefined();
    expect(cellClass('  *******')).toBeUndefined();
    expect(cellClass('111   ')).toBeUndefined();
    expect(cellClass(null)).toBe('nul');
  });
});

describe('fixed-width columns', () => {
  it('a column with leading spaces or a run of padding inside a value is fixed-width; trailing CHAR padding alone is not', () => {
    const rows = [['Antonie', '*********', '111   '], ['Archip', '  *******', '117   '], ['Buraga', 'x', 'Buraga    Sabin     ']];
    expect(spacedColumns(rows, 3)).toEqual([false, true, true]);
    expect(spacedColumns([['111   ', null]], 2)).toEqual([false, false]);
  });
});
