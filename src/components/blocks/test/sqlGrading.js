// Grading of the `sql` test questions without React: the pure part of SqlQuestion.jsx, tested in node with a stub runner.
import { checkResult, runWithProbe } from '../../../sql/check.js';
import { detectMistake } from '../../../sql/mistakes.js';
import { checkSpecOf, runOptions } from '../../lesson/blocks/sqlExerciseSpec.js';
import { SQL_DATASETS } from './sqlScoring.js';

// The parts of a question: the question itself and its `moreParts` (7a and 7b), each with the dataset, kind and clock it inherits.
export const partsOf = (q) => [q, ...(q.moreParts ?? [])].map((p) => ({
  ...p, dataset: p.dataset ?? q.dataset, kind: p.kind ?? q.kind ?? 'query', clock: p.clock ?? q.clock,
}));

// What a failure of the engine means for a hand-in.
//   'silent'      CANCELLED: something else took the engine (a dataset change). Nothing to tell the learner; press Hand in again.
//   'unavailable' ENGINE_UNAVAILABLE: the engine cannot run here; the question falls back to paper mode.
//   'timeout'     TIMEOUT: a query ran over the limit. Tell the learner and offer a retry.
//   'engine'      anything else (ENGINE_ERROR, a thrown grader): tell the learner and offer a retry.
export function classifyFailure(e) {
  switch (e?.code) {
    case 'CANCELLED': return 'silent';
    case 'ENGINE_UNAVAILABLE': return 'unavailable';
    case 'TIMEOUT': return 'timeout';
    default: return 'engine';
  }
}

const PRIORITY = { engine: 4, timeout: 3, silent: 2, expected: 1 };

// Grades every part on the lab data and on its hidden twin. `texts` maps part id -> the learner's SQL. An empty part is not run:
// its entries are `empty: true` with no verdict and earn nothing. Resolves to
//   { status: 'unavailable' }                      the engine cannot run here
//   { status: 'ungraded', issue, out }             something kept an entry from getting a verdict: `issue.kind` is
//                                                  'silent' | 'timeout' | 'engine' | 'expected' (missing answer key);
//                                                  nothing is scored and the learner may hand in again. A timeout, an engine
//                                                  fault or a cancel ends the hand-in at once (the question is ungraded anyway,
//                                                  and every further run could take another minute); a missing answer key
//                                                  lets the other entries run, so a later timeout still gets its own message
//   { status: 'graded', out, flat }                out: part id -> [{ dataset, result, verdict, mistake, expected, empty? }];
//                                                  flat: the verdicts in order (null where there is none)
export async function gradeParts({ client, parts, base, texts, loadExpected }) {
  const out = {};
  const flat = [];
  let issue = null;
  const raise = (kind, failure) => { if (!issue || PRIORITY[kind] > PRIORITY[issue.kind]) issue = { kind, failure }; };
  for (const part of parts) {
    const sql = texts[part.id] ?? '';
    out[part.id] = [];
    for (const dataset of SQL_DATASETS(base)) {
      let entry;
      if (!sql.trim()) {
        entry = { dataset, result: null, verdict: null, mistake: null, expected: null, empty: true };
      } else {
        try {
          let expected = null;
          try { expected = await loadExpected(part.id, dataset); } catch { expected = null; }
          await client.reset({ dataset });
          const result = await runWithProbe(client, sql, runOptions({ ...part, dataset: base }, { hidden: dataset !== base }));
          const spec = checkSpecOf(part);
          const verdict = expected ? checkResult(result, expected, spec) : null;
          if (!verdict) raise('expected');
          const mistake = verdict && !verdict.ok ? detectMistake({ sql, actual: result, expected, spec }) : null;
          entry = { dataset, result, verdict, mistake, expected };
        } catch (e) {
          const kind = classifyFailure(e);
          if (kind === 'unavailable') return { status: 'unavailable' };
          raise(kind, e);
          out[part.id].push({ dataset, result: null, verdict: null, mistake: null, expected: null, failure: e });
          return { status: 'ungraded', issue, out };
        }
      }
      out[part.id].push(entry);
      flat.push(entry.verdict);
    }
  }
  return issue ? { status: 'ungraded', issue, out } : { status: 'graded', out, flat };
}

// The text under the editor after a hand-in that could not be graded; null when there is nothing to say (CANCELLED).
export function issueText(issue) {
  switch (issue?.kind) {
    case 'timeout':
      return {
        en: 'A query ran for over a minute and was stopped, so nothing was scored. Check for a join without a condition, then try again.',
        ro: 'O interogare a rulat peste un minut și a fost oprită, deci nu s-a notat nimic. Verifică dacă ai o joncțiune fără condiție, apoi încearcă din nou.',
      };
    case 'engine': {
      const why = issue.failure?.message ? ` (${issue.failure.message})` : '';
      return {
        en: `The SQL engine reported a problem${why}, so nothing was scored. Try again.`,
        ro: `Motorul SQL a raportat o problemă${why}, deci nu s-a notat nimic. Încearcă din nou.`,
      };
    }
    case 'expected':
      return {
        en: 'The answer could not be checked this time. Nothing was scored; press Hand in to try again.',
        ro: 'Răspunsul nu a putut fi verificat de data aceasta. Nu s-a notat nimic; apasă Predă ca să încerci din nou.',
      };
    default:
      return null;
  }
}

// Only a timeout or an engine fault gets its own Try again button; a cancel just leaves Hand in available.
export const offersRetry = (issue) => issue?.kind === 'timeout' || issue?.kind === 'engine';

// Paper mode after hand-in: the learner may run their paper answer when the app runs the engine in paper mode (not when the engine
// failed: then the answer cannot be run on this device).
export const paperCheckable = ({ mode, status, handedIn, hasClient }) => mode === 'paper' && !!hasClient && status !== 'failed' && !!handedIn;

// Runs and checks one part on the lab data against its expected table (paper mode after hand-in). Throws what the client throws.
export async function checkPartOnce({ client, part, base, sql, expected }) {
  await client.reset({ dataset: base });
  const result = await runWithProbe(client, sql, runOptions(part));
  const spec = checkSpecOf(part);
  const verdict = checkResult(result, expected, spec);
  const mistake = verdict.ok ? null : detectMistake({ sql, actual: result, expected, spec });
  return { result, verdict, mistake };
}
