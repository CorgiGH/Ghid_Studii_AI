// Pure rules of TestRenderer (no React), so they can be tested in node.
import { scoreMock } from './sqlScoring.js';

// The minutes a learner may choose for an optional timer (meta.timerChoices), or null when the test has none.
export function timerChoices(meta) {
  const list = meta?.timerChoices;
  if (!Array.isArray(list)) return null;
  const mins = list.filter((n) => Number.isInteger(n) && n > 0);
  return mins.length ? mins : null;
}

// How long the countdown runs, in seconds, or null for no countdown. `timed` mode uses the test's duration (two minutes a question
// when it has none); otherwise the minutes the learner picked at the start (0 or null = no timer).
export function timerSeconds({ meta, questionCount, mode, chosen }) {
  if (mode === 'timed') return ((meta?.duration || questionCount * 2)) * 60;
  return Number.isInteger(chosen) && chosen > 0 ? chosen * 60 : null;
}

export const formatClock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// Does the group stem go above question `i`? One question per screen: the stem of the question on show, and only that one. Otherwise
// once, above the first question of a run of questions in the same group.
export function showGroupStem({ perScreen, i, current, group, prevGroup, hasText }) {
  if (!group || !hasText) return false;
  return perScreen ? i === current : group !== prevGroup;
}

// The points of a test: the same sum for the results page, tested here. `answers` is { [questionId]: { score } }.
export function totalScore(questions, answers) {
  const scores = {};
  for (const [id, a] of Object.entries(answers ?? {})) scores[id] = a?.score || 0;
  return scoreMock(questions, scores);
}
