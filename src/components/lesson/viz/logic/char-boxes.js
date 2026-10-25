import { likeMatch } from './common.js';

export function charBoxes(value, width) {
  const chars = [...value];
  const boxes = Array.from({ length: Math.max(width, chars.length) }, (_, i) => (i < chars.length ? { ch: chars[i], blank: false } : { ch: ' ', blank: true }));
  return { boxes, length: boxes.length, trimmedLength: chars.length, blanks: boxes.length - chars.length };
}

export function charOps({ value, width, ops, likePattern }) {
  const padded = value.padEnd(width, ' ');
  return ops.map(op => {
    if (op === 'LENGTH') return { op, sql: `LENGTH(col)`, result: padded.length, note: 'padded' };
    if (op === 'TRIM') return { op, sql: 'TRIM(col)', result: padded.trim(), length: padded.trim().length };
    if (op === 'LIKE') return { op, sql: `col LIKE '${likePattern}'`, result: likeMatch(likePattern, padded), trimmedResult: likeMatch(likePattern, value) };
    throw new Error(`op ${op}`);
  });
}
