import { likeMatch } from './common.js';

export function charBoxes(value, width) {
  const chars = [...value];
  const boxes = Array.from({ length: Math.max(width, chars.length) }, (_, i) => (i < chars.length ? { ch: chars[i], blank: false } : { ch: ' ', blank: true }));
  return { boxes, length: boxes.length, trimmedLength: chars.length, blanks: boxes.length - chars.length };
}

// `column` names the CHAR column the value sits in (prenume), so the calls read as real SQL: LENGTH(prenume).
export function charOps({ value, width, ops, likePattern, column = 'col' }) {
  const padded = value.padEnd(width, ' ');
  return ops.map(op => {
    if (op === 'LENGTH') return { op, sql: `LENGTH(${column})`, result: padded.length, note: 'padded' };
    if (op === 'TRIM') return { op, sql: `TRIM(${column})`, result: padded.trim(), length: padded.trim().length };
    if (op === 'LIKE') return { op, sql: `${column} LIKE '${likePattern}'`, result: likeMatch(likePattern, padded), trimmedResult: likeMatch(likePattern, value) };
    throw new Error(`op ${op}`);
  });
}

// Steps of the CHAR boxes: step 0 sets the scene and asks about the first operation; then each operation shows its
// result, and every later operation is first only named (asked), so the learner can guess before its result appears.
// 2 * ops steps in all: 0 intro, 1 result 0, 2 ask 1, 3 result 1, 4 ask 2, 5 result 2.
export const charBoxCount = (nOps) => Math.max(1, 2 * nOps);
export function charBoxStep(k) {
  if (k <= 0) return { kind: 'intro', index: 0 };
  return k % 2 === 1 ? { kind: 'result', index: (k - 1) / 2 } : { kind: 'ask', index: k / 2 };
}

const QUESTION = {
  LENGTH: { en: 'what number does it give?', ro: 'ce număr dă?' },
  TRIM: { en: 'how many boxes are left?', ro: 'câte căsuțe rămân?' },
  LIKE: { en: 'does it match or not?', ro: 'se potrivește sau nu?' },
};

export function charBoxCaption({ value, width, likePattern }, b, ops, k) {
  const st = charBoxStep(k);
  const op = ops[st.index];
  if (st.kind === 'intro') {
    const q = op ? { en: ` And ${op.sql}: ${QUESTION[op.op].en}`, ro: ` Și ${op.sql}: ${QUESTION[op.op].ro}` } : { en: '', ro: '' };
    return {
      en: `A CHAR(${width}) column always has ${width} boxes. ${value} fills the first ${b.trimmedLength}. What is in the other ${b.blanks}?${q.en}`,
      ro: `O coloană CHAR(${width}) are mereu ${width} căsuțe. ${value} umple primele ${b.trimmedLength}. Ce e în celelalte ${b.blanks}?${q.ro}`,
    };
  }
  if (st.kind === 'ask') {
    return {
      en: `Next: ${op.sql}. ${QUESTION[op.op].en[0].toUpperCase()}${QUESTION[op.op].en.slice(1)} Think, then press Next.`,
      ro: `Urmează ${op.sql}. ${QUESTION[op.op].ro[0].toUpperCase()}${QUESTION[op.op].ro.slice(1)} Gândește-te, apoi apasă «Mai departe».`,
    };
  }
  if (op.op === 'LENGTH') {
    return {
      en: `The other ${b.blanks} boxes hold blanks. LENGTH counts them too: ${op.result}.`,
      ro: `Celelalte ${b.blanks} căsuțe conțin spații. LENGTH le numără și pe ele: ${op.result}.`,
    };
  }
  if (op.op === 'TRIM') {
    return {
      en: `TRIM removes the blanks at both ends: ${op.length} boxes are left, «${op.result}».`,
      ro: `TRIM scoate spațiile de la capete: rămân ${op.length} căsuțe, «${op.result}».`,
    };
  }
  const lit = likePattern.replace(/[%_]/g, '');
  if (op.result) return { en: `${op.sql} matches.`, ro: `${op.sql} se potrivește.` };
  return {
    en: `The last box holds a blank, not «${lit}», so LIKE '${likePattern}' does not match.${op.trimmedResult ? ' After TRIM it would.' : ''}`,
    ro: `Ultima căsuță conține un spațiu, nu «${lit}», deci LIKE '${likePattern}' nu se potrivește.${op.trimmedResult ? ' După TRIM s-ar potrivi.' : ''}`,
  };
}
