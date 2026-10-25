// Shape of `mcq` and `reflect` blocks, shared by the validator script and the tests (no React).

import { TRAP_TAGS } from './trapTags.js';

const LESSON_ID = /^bd-l(\d{2})([a-c]?)$/;

// Place of a lesson id such as "bd-l05" or "bd-l01b" in the course order (01 < 01a < 01b < 02), or null.
export function lessonOrder(id) {
  const m = typeof id === 'string' ? id.match(LESSON_ID) : null;
  return m ? Number(m[1]) * 4 + (m[2] ? m[2].charCodeAt(0) - 96 : 0) : null;
}

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isBi = (v) => !!v && typeof v === 'object' && isStr(v.en) && isStr(v.ro);

// Returns a list of problems; empty means the block is well-formed. `ctx.lessonId` (the id of the
// lesson file the block sits in) lets it check that `review` names an earlier lesson.
export function validateMcq(b, ctx = {}) {
  const errs = [];
  const at = (m) => errs.push(`(mcq${b?.id ? ` ${b.id}` : ''}): ${m}`);
  if (!isStr(b?.id)) at('id missing');
  if (!isBi(b?.question)) at('question must have en + ro');
  if (b?.review !== undefined) {
    if (lessonOrder(b.review) === null) at('review must be a lesson id like "bd-l05"');
    else if (ctx.lessonId && lessonOrder(ctx.lessonId) !== null && lessonOrder(b.review) >= lessonOrder(ctx.lessonId)) {
      at(`review "${b.review}" must name a lesson earlier than ${ctx.lessonId}`);
    }
  }
  const opts = b?.options;
  if (!Array.isArray(opts) || opts.length < 2) { at('needs at least 2 options'); return errs; }
  const correct = opts.filter(o => o && o.correct === true).length;
  if (correct !== 1) at(`needs exactly one correct option (found ${correct})`);
  opts.forEach((o, i) => {
    if (!o || typeof o !== 'object') { at(`options[${i}] is not an object`); return; }
    if (typeof o.correct !== 'boolean') at(`options[${i}].correct must be true or false`);
    if (!isBi(o.text)) at(`options[${i}].text must have en + ro`);
    if (!isBi(o.explain)) at(`options[${i}].explain must have en + ro`);
    if (o.correct === false && !isStr(o.misconception)) at(`options[${i}] is wrong but has no misconception tag`);
    if (isStr(o.misconception) && !TRAP_TAGS.has(o.misconception)) at(`options[${i}].misconception "${o.misconception}" is not in the trap catalogue (trapTags.js)`);
  });
  return errs;
}

export function validateReflect(b) {
  const errs = [];
  const at = (m) => errs.push(`(reflect${b?.id ? ` ${b.id}` : ''}): ${m}`);
  if (!isStr(b?.id)) at('id missing');
  if (!isBi(b?.prompt)) at('prompt must have en + ro');
  if (!isBi(b?.answer)) at('answer must have en + ro');
  if (b?.placeholder !== undefined && !isBi(b.placeholder)) at('placeholder must have en + ro');
  // table: one { dataset, sql } or a list of them, each with an optional bilingual caption (e.g. two sheets side by side)
  if (b?.table !== undefined) {
    const list = Array.isArray(b.table) ? b.table : [b.table];
    if (!list.length || !list.every(tb => tb && isStr(tb.dataset) && isStr(tb.sql) && (tb.caption === undefined || isBi(tb.caption)))) at('table needs dataset and sql (and a caption with en + ro if it has one)');
  }
  return errs;
}
