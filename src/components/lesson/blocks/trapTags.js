// The trap catalogue: every misconception tag an mcq wrong option may carry.
// OUTLINE_TAGS is the catalogue in docs/superpowers/specs/2026-10-24-bd-lessons-content-outline.md (section 2);
// STAGED_TAGS are the extra tags the lesson content uses beyond that table.
// A tag used in a lesson but missing here is a validator error, so a typo cannot slip into the review pile.

export const OUTLINE_TAGS = [
  'empty-str-null', 'null-arith', 'concat-null', 'eq-null', 'not-in-null', 'and-or', 'case-sens',
  'quotes-alias', 'curly-quotes', 'ordering-nulls', 'order-pos-alias', 'distinct-row',
  'setop-rules', 'char-pad', 'char-cmp', 'like-escape', 'implicit-conv', 'substr-neg',
  'pad-truncate', 'replace-translate', 'round-neg-mod', 'int-division', 'dual', 'date-time-part',
  'date-format-yy', 'to-char-pad-lang', 'mm-mi', 'month-sort', 'add-months-eom', 'next-day',
  'decode-null', 'case-no-else', 'null-func', 'cartesian', 'ambiguous-col', 'alias-as',
  'join-no-on', 'natural-join-all', 'row-multiply', 'outer-where', 'plus-side', 'self-pair',
  'all-vs-some', 'minus-key', 'concat-prec', 'between-incl',
];

export const STAGED_TAGS = [
  'age-round', 'commit-automatic', 'constraint-roles', 'date-plus-unit', 'db-dedups', 'delete-all',
  'desc-scope', 'diacritics-in-name', 'dml-no-where', 'false-key', 'fk-wrong-target',
  'least-greatest', 'left-to-right', 'like-wildcard', 'missing-is-null', 'missing-vs-empty',
  'name-is-key', 'nullif', 'number-ignored', 'order-insert', 'order-key', 'page-vs-script',
  'parens-ignored', 'precision-vs-scale', 'scale-forgotten', 'schema-vs-instance',
  'script-appends', 'type-allows-dup', 'value-is-id', 'wrong-account', 'year-365',
];

export const TRAP_TAGS = new Set([...OUTLINE_TAGS, ...STAGED_TAGS]);
