// Scoring of the `sql` test questions (no React). A query earns its points only when it is right on the lab data and on the
// altered twin of that data, so a query that hard-codes the visible rows scores 0.

// The two datasets a question on `base` is graded on.
export const SQL_DATASETS = (base) => [base, `${base}-hidden`];

// verdicts: one Verdict per dataset (null where the run produced none). Full points when all are ok, else 0.
export function scoreSqlQuestion(points, verdicts) {
  if (!Array.isArray(verdicts) || verdicts.length === 0) return 0;
  return verdicts.every((v) => v && v.ok === true) ? points : 0;
}

// scores: { [questionId]: points earned }; unanswered questions count 0.
export function scoreMock(questions, scores) {
  return questions.reduce((sum, q) => sum + (scores?.[q.id] ?? 0), 0);
}
