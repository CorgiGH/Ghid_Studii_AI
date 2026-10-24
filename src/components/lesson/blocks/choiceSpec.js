// Shape of `mcq` and `reflect` blocks, shared by the validator script and the tests (no React).

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isBi = (v) => !!v && typeof v === 'object' && isStr(v.en) && isStr(v.ro);

// Returns a list of problems; empty means the block is well-formed.
export function validateMcq(b) {
  const errs = [];
  const at = (m) => errs.push(`(mcq${b?.id ? ` ${b.id}` : ''}): ${m}`);
  if (!isStr(b?.id)) at('id missing');
  if (!isBi(b?.question)) at('question must have en + ro');
  if (b?.review !== undefined && !(typeof b.review === 'string' && /^bd-l\d{2}[a-c]?$/.test(b.review))) at('review must be a lesson id like "bd-l05"');
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
  if (b?.table !== undefined && !(b.table && isStr(b.table.dataset) && isStr(b.table.sql))) at('table needs dataset and sql');
  return errs;
}
