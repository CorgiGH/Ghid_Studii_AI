import { DATA, evalWhere } from './common.js';

export function allVsSome({ studentsFrom, condition, showMinusByName }) {
  const students = (DATA[studentsFrom] || []).map(s => {
    const grades = DATA.note.filter(n => n.nr_matricol === s.nr_matricol).map(n => n.valoare);
    const passes = grades.map(g => evalWhere(condition, { valoare: g }) === true);
    return { student: s, grades, passes, some: passes.some(Boolean), all: passes.every(Boolean) };
  });
  // "all grades pass" written as: every name MINUS the names that have a failing grade.
  const everyName = [...new Set(students.map(s => s.student.nume))].sort();
  const failing = new Set(students.filter(s => s.passes.some(p => !p)).map(s => s.student.nume));
  const byName = everyName.filter(n => !failing.has(n));
  const byKey = students.filter(s => s.all).map(s => s.student.nr_matricol);
  return { students, minus: showMinusByName ? { byName, byKey, failing: [...failing].sort() } : null, count: showMinusByName ? 5 : 4 };
}
