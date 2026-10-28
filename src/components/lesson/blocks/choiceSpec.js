// Shape of `mcq` and `reflect` blocks, shared by the validator script and the tests (no React).

import { TRAP_TAGS } from './trapTags.js';

// A lesson id of a lesson-player subject: "bd-l05", "bd-l01b", "ml-l14".
const LESSON_ID = /^(bd|ml)-l(\d{2})([a-c]?)$/;

// Place of a lesson id such as "bd-l05" or "bd-l01b" in its subject's course order (01 < 01a < 01b < 02), or null.
export function lessonOrder(id) {
  const m = typeof id === 'string' ? id.match(LESSON_ID) : null;
  return m ? Number(m[2]) * 4 + (m[3] ? m[3].charCodeAt(0) - 96 : 0) : null;
}

// The subject slug a lesson id belongs to ("bd", "ml"), or null.
const lessonSubject = (id) => (typeof id === 'string' ? id.match(LESSON_ID)?.[1] ?? null : null);

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isBi = (v) => !!v && typeof v === 'object' && isStr(v.en) && isStr(v.ro);

// A data table cannot hold more rows than a question can show beside its options (BD's engine tables share the cap).
export const MAX_TABLE_ROWS = 45;

// A static table is typed into the JSON (probabilities, a training set); a SQL table is run by the engine.
export const isStaticTable = (tb) => !!tb && typeof tb === 'object' && Array.isArray(tb.columns);

// True when every table of a question is on screen at once (static), so its options need not wait for an engine.
export const tablesAtOnce = (table) => {
  if (!table) return true;
  return (Array.isArray(table) ? table : [table]).every(isStaticTable);
};

const isIndex = (v, n) => Number.isInteger(v) && v >= 0 && v < n;

// Problem with one static table, or null. columns: string | {en, ro}; cells: string (may hold $KaTeX$) or a finite number;
// highlight: row and column indexes to tint.
function staticTableError(tb) {
  if (tb.dataset !== undefined || tb.sql !== undefined) return 'table is either static (columns + rows) or a dataset + sql, not both';
  if (!tb.columns.length || !tb.columns.every(c => isStr(c) || isBi(c))) return 'table columns must be non-empty strings or { en, ro }';
  if (!Array.isArray(tb.rows) || !tb.rows.length) return 'table needs at least one row';
  if (tb.rows.length > MAX_TABLE_ROWS) return `table has ${tb.rows.length} rows, more than the ${MAX_TABLE_ROWS} a question can show`;
  for (let i = 0; i < tb.rows.length; i++) {
    const r = tb.rows[i];
    if (!Array.isArray(r) || r.length !== tb.columns.length) return `table row ${i + 1} must have ${tb.columns.length} cells`;
    if (!r.every(c => (typeof c === 'string' && c !== '') || (typeof c === 'number' && Number.isFinite(c)))) return `table row ${i + 1} holds a cell that is not a non-empty string or a number`;
  }
  if (tb.caption !== undefined && !isBi(tb.caption)) return 'table caption must have en + ro';
  // the caption is drawn as plain text (and read out as the table's label), so a $ in it would show raw
  if (tb.caption !== undefined && /\$/.test(tb.caption.en + tb.caption.ro)) return 'table caption is plain text: a formula goes in a cell or the question, not the caption';
  const h = tb.highlight;
  if (h !== undefined) {
    const okList = (l, n) => l === undefined || (Array.isArray(l) && l.every(v => isIndex(v, n)));
    if (!h || typeof h !== 'object' || !okList(h.rows, tb.rows.length) || !okList(h.cols, tb.columns.length)) {
      return 'table highlight must list row and column indexes that exist';
    }
  }
  return null;
}

// Returns a list of problems; empty means the block is well-formed. `ctx.lessonId` (the id of the
// lesson file the block sits in) lets it check that `review` names an earlier lesson.
// table (reflect, mcq, calc-exercise, proof-steps): one table or a list of them. A table is either
//   { dataset, sql, caption? }  (BD: run by the SQL engine)  or
//   { columns, rows, caption?, highlight?: { rows?, cols? } }  (static: drawn at once, no engine).
export function tableError(table) {
  if (table === undefined) return null;
  const list = Array.isArray(table) ? table : [table];
  if (!list.length) return 'table needs dataset and sql, or columns and rows';
  for (const tb of list) {
    if (!tb || typeof tb !== 'object') return 'table needs dataset and sql, or columns and rows';
    if (isStaticTable(tb)) {
      const e = staticTableError(tb);
      if (e) return e;
    } else if (!(isStr(tb.dataset) && isStr(tb.sql) && (tb.caption === undefined || isBi(tb.caption)))) {
      return 'table needs dataset and sql (and a caption with en + ro if it has one), or columns and rows';
    }
  }
  return null;
}

export function validateMcq(b, ctx = {}) {
  const errs = [];
  const at = (m) => errs.push(`(mcq${b?.id ? ` ${b.id}` : ''}): ${m}`);
  if (!isStr(b?.id)) at('id missing');
  if (!isBi(b?.question)) at('question must have en + ro');
  const te = tableError(b?.table);
  if (te) at(te);
  if (b?.review !== undefined) {
    if (lessonOrder(b.review) === null) at('review must be a lesson id like "bd-l05"');
    else if (ctx.lessonId && lessonOrder(ctx.lessonId) !== null && lessonSubject(b.review) !== lessonSubject(ctx.lessonId)) {
      at(`review "${b.review}" must name a lesson of the same subject as ${ctx.lessonId}`);
    } else if (ctx.lessonId && lessonOrder(ctx.lessonId) !== null && lessonOrder(b.review) >= lessonOrder(ctx.lessonId)) {
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
  const te = tableError(b?.table);
  if (te) at(te);
  return errs;
}
