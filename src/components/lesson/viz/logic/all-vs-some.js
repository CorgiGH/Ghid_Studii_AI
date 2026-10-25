import { DATA, evalWhere } from './common.js';

// The row `SELECT nume, prenume` gives for a student, as one label.
export const personName = (s) => `${s.nume} ${s.prenume}`;

// `condition` is the COUNTEREXAMPLE test (lesson 23: "a grade below 7 removes the student").
// Left list = students who have grades. A grade that meets the condition is a counterexample;
// a student with any counterexample is out (SOME), a student with none qualifies (ALL passing).
export function allVsSome({ studentsFrom, condition, showMinusByName }, data = DATA) {
  const students = (data[studentsFrom] || [])
    .map(s => {
      const grades = data.note.filter(n => n.nr_matricol === s.nr_matricol).map(n => n.valoare);
      const bad = grades.map(g => evalWhere(condition, { valoare: g }) === true);
      const some = bad.some(Boolean);
      // the grade the SOME column shows: the first one that meets the condition, or null when there is none
      const counterexample = some ? grades[bad.indexOf(true)] : null;
      return { student: s, grades, bad, some, counterexample, all: !some };
    })
    .filter(r => r.grades.length > 0);
  // "no grade breaks the condition" as MINUS on (nume, prenume): the names of students with
  // grades, minus the names of students that have a counterexample. Two students with the
  // same nume and prenume are the same row to MINUS.
  const leftNames = [...new Set(students.map(s => personName(s.student)))].sort();
  const failing = new Set(students.filter(s => s.some).map(s => personName(s.student)));
  const byName = leftNames.filter(n => !failing.has(n));
  const byKey = students.filter(s => s.all).map(s => s.student.nr_matricol);
  return {
    students,
    qualifying: byKey,
    minus: showMinusByName ? { leftNames, byName, byKey, failing: [...failing].sort() } : null,
    count: showMinusByName ? 5 : 4,
  };
}

// The header of the counterexample column, from the condition: 'valoare < 7' -> "prima notă < 7".
export function firstHitHeader(condition) {
  const rest = condition.trim().replace(/^valoare\s*/i, '');
  return rest === condition.trim()
    ? { en: `first: ${condition}`, ro: `prima: ${condition}` }
    : { en: `first grade ${rest}`, ro: `prima notă ${rest}` };
}

// What each step says; Romanian only (no SOME / ALL keywords, which the lessons never introduce).
export function avsCaptions(A, condition, predict) {
  const n = A.qualifying.length;
  return [
    { en: `Students who have grades, each with their grades. A grade that meets ${condition} removes the student.${predict ? ' Click the students you think stay.' : ''}`, ro: `Studenții care au note, fiecare cu notele lui. O notă care îndeplinește ${condition} elimină studentul.${predict ? ' Apasă pe studenții care crezi că rămân.' : ''}` },
    { en: `The condition ${condition} is tested on each grade: red is a counterexample, green is fine.`, ro: `Condiția ${condition} se testează pe fiecare notă: roșu e contraexemplu, verde e în regulă.` },
    { en: 'One counterexample is enough to remove the student. The column shows the first one found.', ro: 'Ajunge un singur contraexemplu ca să elimine studentul. Coloana arată primul găsit.' },
    { en: `All grades fine: no counterexample, the student stays. ${n === 1 ? '1 student stays' : `${n} students stay`}.`, ro: `Toate notele în regulă: niciun contraexemplu, studentul rămâne. ${n === 1 ? 'Rămâne 1 student' : `Rămân ${n} studenți`}.` },
    A.minus ? { en: `Written with MINUS on nume and prenume only, ${A.minus.byName.length} names come out for ${A.minus.byKey.length} students: the two with the same nume and prenume merge. Use the switch to compare.`, ro: `Scris cu MINUS doar pe nume și prenume, ies ${A.minus.byName.length} nume pentru ${A.minus.byKey.length} studenți: cei doi cu același nume și prenume se contopesc. Folosește comutatorul ca să compari.` } : { en: '', ro: '' },
  ];
}
