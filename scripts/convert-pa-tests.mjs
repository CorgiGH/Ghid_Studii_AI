// Convert PA testData.js to individual JSON test files for TestRenderer
import { tests } from '../src/content/pa/tests/testData.js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'src', 'content', 'pa', 'tests');

for (const test of tests) {
  const questions = [];
  let qIdx = 1;

  for (const problem of test.problems) {
    for (const part of problem.parts) {
      const hasCode = part.code && !part.answer;
      const qType = hasCode ? 'code-writing' : 'open-ended';

      const promptEn = (problem.statement
        ? `**Problem ${problem.number}: ${problem.title?.en || ''}**\n${problem.statement}\n\n**${part.label})** ${part.question}`
        : `**Problem ${problem.number}: ${problem.title?.en || ''}**\n\n**${part.label})** ${part.question}`
      );
      const promptRo = promptEn; // Questions are already in Romanian

      // Build rubric from answer + code
      const rubricParts = [];
      if (part.answer) rubricParts.push(part.answer);
      if (part.code) rubricParts.push('Expected code/algorithm:\n' + part.code);
      const rubric = rubricParts.join('\n\n');

      const q = {
        id: `q${qIdx}`,
        type: qType,
        points: part.points,
        prompt: { en: promptEn, ro: promptRo },
        rubric: { en: rubric, ro: rubric },
      };

      if (hasCode) {
        q.language = 'pseudocode';
      }

      questions.push(q);
      qIdx++;
    }
  }

  const json = {
    meta: {
      id: test.id,
      title: test.title,
      year: test.year,
      type: test.type,
      duration: 60,
      totalPoints: test.totalPoints,
    },
    questions,
  };

  const filename = `${test.id}.json`;
  const filepath = join(outDir, filename);
  writeFileSync(filepath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`Written: ${filename} (${questions.length} questions, ${test.totalPoints} pts)`);
}

console.log(`\nDone: ${tests.length} test files generated.`);
