// The named wrong answers of scripts/sql/named-mistakes.json, graded the way the app grades them.
// Shared by scripts/sql/wrong-answers.mjs (for the lesson walk) and tests/sql/named-mistakes.test.js.
//
//   named-mistakes.json = { [exerciseId]: [{ name, sql, trap? }] }
//   name  the classic mistake in words (taken from the exercise's hints, explain or the outline's trap)
//   trap  true = a mistake only the hidden dataset can catch (the lab data happens to give the same answer); it is graded on
//         the hidden dataset only, and the walk (which works on the lab data) does not type it
import fs from 'node:fs'
import path from 'node:path'
import { checkResult, runWithProbe } from '../../src/sql/check.js'
import { ROOT, clockFor, datasetPair, engineCache, expectedFile, DEFAULT_EXPECTED_DIR, specOf } from './freeze-lib.mjs'

export const NAMED_MISTAKES_FILE = path.join(ROOT, 'scripts', 'sql', 'named-mistakes.json')
export const loadNamedMistakes = () => JSON.parse(fs.readFileSync(NAMED_MISTAKES_FILE, 'utf8'))

// One mistake of one exercise on one dataset: the checker's verdict kind ('correct', 'rows', 'rowcount', 'contents', 'error' ...)
export async function gradeOn(item, sql, dataset, engineFor = engineCache()) {
  const clock = clockFor(item, dataset)
  const expected = JSON.parse(fs.readFileSync(expectedFile(DEFAULT_EXPECTED_DIR, item.id, dataset), 'utf8'))
  // a fresh engine for a state exercise: it changes the dataset
  const engine = await (item.kind === 'state' ? engineCache() : engineFor)(dataset, clock)
  try {
    let actual
    if (item.kind === 'state') {
      const r = await engine.run(sql, { dataset, script: true })
      const failed = (r.statements ?? []).find((s) => s.error)
      actual = failed ? { error: failed.error } : await engine.snapshot({ dataset, tables: item.check.tables })
    } else {
      actual = await runWithProbe(engine, sql, { dataset })
    }
    if (actual.error) return 'error'
    return checkResult(actual, expected, specOf(item)).kind
  } catch {
    return 'error'
  }
}

// { visible, hidden } verdict kinds of a mistake
export async function gradeMistake(item, mistake, engineFor) {
  const [lab, hidden] = datasetPair(item.dataset)
  return { visible: await gradeOn(item, mistake.sql, lab, engineFor), hidden: await gradeOn(item, mistake.sql, hidden, engineFor) }
}
