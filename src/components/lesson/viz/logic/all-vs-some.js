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
