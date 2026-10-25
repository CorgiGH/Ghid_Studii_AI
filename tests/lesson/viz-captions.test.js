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

import { guessLegend } from '../../src/components/lesson/viz/logic/number-line.js';
import { formatDate, maskStep, maskStepCount, maskCaption, hasPadding } from '../../src/components/lesson/viz/logic/date-mask.js';
import { ageArcCalls, ageCaptions, ageLabels, ageParts, monthsBetween } from '../../src/components/lesson/viz/logic/age-timeline.js';
import { pipeCaption } from '../../src/components/lesson/viz/logic/type-pipes.js';
import { decodeSieve, decodeCall, decodeCaption } from '../../src/components/lesson/viz/logic/decode-sieve.js';

describe('number-line: the marks after a guess have a legend', () => {
  it('explains the struck red mark after a wrong guess', () => {
    expect(guessLegend([true, false]).ro).toBe('Roșu tăiat = ghicirea ta; verde = rezultatul.');
    expect(guessLegend([true]).ro).toBe('Verde = rezultatul, exact unde ai ghicit.');
    expect(guessLegend([])).toBeNull();
  });
});

describe('date-mask: each mask is asked, then shown, with its own caption', () => {
  it('two steps per mask after the intro', () => {
    expect(maskStepCount(6)).toBe(13);
    expect([0, 1, 2, 3, 12].map(maskStep)).toEqual([
      { kind: 'intro', index: -1 }, { kind: 'ask', index: 0 }, { kind: 'show', index: 0 }, { kind: 'ask', index: 1 }, { kind: 'show', index: 5 },
    ]);
  });
  it('Day counts its padding in the dotted boxes; fm says it only stops the padding', () => {
    const day = formatDate('1995-02-17', 'Day');
    expect(maskCaption(day, 'show').ro).toBe("TO_CHAR(data, 'Day') scrie numele zilei și îl completează cu spații până la 9 caractere. Fiecare pătrățel punctat este un spațiu: Friday are 6 litere, deci primește 3 spații.");
    expect(maskCaption(formatDate('1995-02-17', 'fmDay'), 'show').ro).toBe('fm nu scrie nimic din dată: doar oprește completarea cu spații, deci iese Friday fără cele 3 spații de la sfârșit.');
    expect(maskCaption(formatDate('1995-02-17', 'Month'), 'show').ro).toContain('February are 8 litere, deci primește 1 spațiu.');
    expect(maskCaption(formatDate('1995-02-17', 'DD-MON-YY'), 'show').ro).toBe("TO_CHAR(data, 'DD-MON-YY'): DD → 17, MON → FEB, YY → 95; celelalte caractere (-) rămân cum sunt.");
    expect(maskCaption(day, 'ask').ro).toBe("TO_CHAR(data, 'Day'): ce iese? Gândește-te, apoi apasă «Mai departe».");
    expect(hasPadding(day.text)).toBe(true);
    expect(hasPadding('Friday')).toBe(false);
  });
});

describe('age-timeline: real SQL over the boxes, Romanian counts', () => {
  const props = { birth: '1995-02-17', today: '2026-10-26 14:30' };
  const months = monthsBetween(props.today, props.birth);
  const parts = ageParts(props, months);
  it('the box calls carry the whole months once they are known', () => {
    expect(ageArcCalls(parts, false).y.ro).toBe('TRUNC(luni / 12)');
    const c = ageArcCalls(parts, true);
    expect([c.y.ro, c.m.ro, c.d.ro]).toEqual(['TRUNC(380 / 12)', 'MOD(380, 12)', 'TRUNC(SYSDATE) - ADD_MONTHS(data_nastere, 380)']);
    expect(JSON.stringify(c)).not.toMatch(/today|…/);
  });
  it('says 380 de luni and 31 de ani', () => {
    const caps = ageCaptions(ageLabels(props, parts), parts, months);
    expect(caps[2].ro).toBe('Prima casetă: 380 de luni fac 31 de ani împliniți (372 de luni). O zi de naștere care nu a venit încă nu se numără.');
    expect(caps[4].ro).toBe('A treia casetă: ADD_MONTHS(data_nastere, 380) este 17-OCT-26. De acolo până azi sunt 9 zile. Vârsta: 31 de ani, 8 luni, 9 zile.');
  });
});

describe('type-pipes: each pipe says what it converts', () => {
  it('uses the lesson sentence, and falls back to the plain fact', () => {
    const c = { from: 'VARCHAR2', to: 'NUMBER', value: "'12'", fn: "'12' * 2", say: { en: "'12' becomes the number 12, then 12 * 2 = 24.", ro: "'12' devine numărul 12, apoi 12 * 2 = 24." } };
    expect(pipeCaption(c).ro).toBe("'12' devine numărul 12, apoi 12 * 2 = 24. Nu ai scris nicio conversie; a făcut-o Oracle.");
    expect(pipeCaption({ ...c, say: undefined }).ro).toBe("VARCHAR2 devine NUMBER în '12' * 2. Nu ai scris nicio conversie; a făcut-o Oracle.");
  });
});

describe('decode-sieve: a NULL drawer and no default', () => {
  const props = { expr: 'bursa', pairs: [[450, 'premiul 1'], [350, 'premiul 2'], [250, 'premiul 3'], [null, 'mentiune']], values: [450, 350, 250, 300, null] };
  const D = decodeSieve(props);
  it('300 falls through to NULL, NULL is caught by the NULL drawer', () => {
    expect(D.routes.map(r => r.result)).toEqual(['premiul 1', 'premiul 2', 'premiul 3', null, 'mentiune']);
    expect(decodeCall(props)).toBe("DECODE(bursa, 450, 'premiul 1', 350, 'premiul 2', 250, 'premiul 3', NULL, 'mentiune')");
  });
  it('captions speak of drawers (sertare), never layers', () => {
    expect(decodeCaption(props, D.routes[3], null).ro).toBe('300 nu e egal cu niciun sertar, deci cade jos și iese NULL, fiindcă nu s-a dat o valoare implicită.');
    expect(decodeCaption(props, D.routes[4], 'mentiune').ro).toBe('NULL e oprit de sertarul 4 (NULL): mentiune. În DECODE, NULL e egal cu NULL, spre deosebire de =.');
    expect(decodeCaption(props, null, null).ro).not.toMatch(/strat/);
  });
});

import { cartesianGrid, cartesianAxes, cartesianCaption } from '../../src/components/lesson/viz/logic/cartesian-grid.js';
import { joinRows, joinCaption, joinHeader, whereParts, cardLabel } from '../../src/components/lesson/viz/logic/join-wires.js';
import { selfPairs, rowName, axisLegend } from '../../src/components/lesson/viz/logic/self-pairs.js';
import { allVsSome, firstHitHeader, avsCaptions } from '../../src/components/lesson/viz/logic/all-vs-some.js';

describe('cartesian-grid: the keys are labelled and the empty rows named', () => {
  const props = { left: 'studenti', right: 'note', on: 'studenti.nr_matricol = note.nr_matricol' };
  const G = cartesianGrid(props);
  const A = cartesianAxes(G, props);
  it('labels rows 111…123 and groups the 42 grades by student', () => {
    expect(A.rowKeys).toEqual(['111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123']);
    expect(A.groups.map(g => `${g.key}x${g.span}`)).toEqual(['111x6', '112x6', '113x6', '114x6', '115x6', '116x3', '117x3', '118x3', '119x3']);
    expect(A.empty).toEqual(['120', '121', '122', '123']);
  });
  it('says join-ul, Romanian counts, and why 120–123 stay empty', () => {
    expect(cartesianCaption(G, A, props, 1, 546, 42).ro).toBe('Fără condiție, join-ul păstrează toate perechile: 13 × 42 = 546 de rânduri.');
    expect(cartesianCaption(G, A, props, 2, 546, 42).ro).toContain('Rândurile 120–123 rămân goale: acești studenți nu au nicio notă.');
    expect(JSON.stringify([0, 1, 2].map(k => cartesianCaption(G, A, props, k, 546, 42)))).not.toMatch(/Joncțiunea|joncțiunea/);
  });
});

describe('join-wires', () => {
  const base = { left: 'studenti', right: 'note', on: 'studenti.nr_matricol = note.nr_matricol', kind: 'left' };
  it('an inner join prints plain JOIN', () => {
    expect(joinHeader({ left: 'cursuri', right: 'didactic', on: 'cursuri.id_curs = didactic.id_curs', kind: 'inner' })).toBe('cursuri JOIN didactic ON cursuri.id_curs = didactic.id_curs');
    expect(joinHeader({ ...base, filterIn: 'where', filter: 'note.valoare = 10' })).toBe('studenti LEFT JOIN note ON studenti.nr_matricol = note.nr_matricol WHERE note.valoare = 10');
  });
  it('the ON filter ends with the whole result: 8 grades of 10 and 8 NULL rows', () => {
    const p = { ...base, filterIn: 'on', filter: 'note.valoare = 10' };
    const J = joinRows(p);
    expect(J.stages.at(-1)).toEqual({ kind: 'result' });
    expect(J.pairs.filter(x => x.right).length).toBe(8);
    expect(J.pairs.filter(x => !x.right).length).toBe(8);
    expect(joinCaption(J, p, J.count - 1, 16).ro).toBe('Rezultatul: 16 rânduri. 8 au în dreapta un rând din note care trece de note.valoare = 10, iar 8 au NULL în dreapta. Niciun rând din studenti nu s-a pierdut.');
    // Prelipcean: no 10, six candidates refused, all counted in the caption
    const k = J.stages.findIndex(st => st.kind === 'left' && J.groups[st.index].left.nr_matricol === '112');
    expect(J.groups[J.stages[k].index].refused).toHaveLength(6);
    expect(joinCaption(J, p, k, 16).ro).toBe('Niciun partener. 6 candidați (tăiați) au picat filtrul din ON. Join-ul păstrează totuși rândul și completează cealaltă parte cu NULL.');
  });
  it('the WHERE step lists what stays and the NULL rows that go', () => {
    const p = { ...base, filterIn: 'where', filter: 'note.valoare = 10' };
    const J = joinRows(p);
    const W = whereParts(J);
    expect(W.kept).toHaveLength(8);
    expect(W.droppedNull.map(x => cardLabel('studenti', x.left))).toEqual(['120 · Pintescu', '121 · Arhire', '122 · Cobzaru', '123 · Bucur']);
    expect(W.droppedOther).toBe(34);
    expect(joinCaption(J, p, J.count - 1, 8).ro).toBe('Filtrul din WHERE rulează după join și păstrează doar rândurile pentru care note.valoare = 10 e adevărat: 8 rânduri. Dispar cele 4 rânduri cu NULL și celelalte 34.');
  });
});

describe('self-pairs: real keys and names', () => {
  const P = selfPairs({ table: 'studenti', pairOn: "TO_CHAR(data_nastere, 'D')", order: '<>' });
  it('the legend maps each full key to its name', () => {
    const L = axisLegend(P.rows, P.key);
    expect(L[0]).toEqual({ key: '111', name: 'Popescu' });
    expect(L).toHaveLength(13);
  });
  it('two students with the same name carry their key', () => {
    const bodnars = P.rows.filter(r => r.nume === 'Bodnar');
    expect(bodnars.length).toBe(2);
    expect(rowName(bodnars[0], P.rows)).toBe(`Bodnar (${bodnars[0].nr_matricol})`);
    expect(rowName(P.rows[0], P.rows)).toBe('Popescu');
  });
});

describe('all-vs-some: no English keywords on screen', () => {
  it('the column header and captions are Romanian', () => {
    expect(firstHitHeader('valoare < 7').ro).toBe('prima notă < 7');
    const A = allVsSome({ studentsFrom: 'studenti', condition: 'valoare < 7', showMinusByName: true });
    const caps = avsCaptions(A, 'valoare < 7', true);
    expect(caps[2].ro).toBe('Ajunge un singur contraexemplu ca să elimine studentul. Coloana arată primul găsit.');
    expect(caps.map(c => c.ro).join(' ')).not.toMatch(/\bSOME\b|\bALL\b/);
  });
});
