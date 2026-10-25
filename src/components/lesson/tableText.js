// Small rules shared by the lesson's tables (plain functions, tested in node).

// Up to this many rows a table shows them all; a longer one scrolls inside its box and says what is below.
export const ALL_ROWS = 16;
export const tableFitsWhole = (n) => n <= ALL_ROWS;

// A header split where it may break: after _ , ( / and spaces, so NR_MATRICOL or LPAD(RPAD('*',BURSA/50,'*'),9) wraps
// inside its column instead of widening it.
export function headerParts(text) {
  return String(text ?? '').split(/(?<=[_,(/ ])/).filter((p) => p !== '');
}

// A value keeps every space it has (an LPAD result, CHAR padding) and stays on one line, so a date never breaks at its
// hyphens; only a value with words in it (a sentence built with ||) may wrap, at its spaces.
export function cellClass(v) {
  if (v === null || v === undefined) return 'nul';
  return /\S\s+\S/.test(String(v)) ? 'words' : undefined;
}

// Columns whose spaces carry meaning (leading spaces of an LPAD, a run of padding inside a value) are set in a fixed-width
// font, so the stars of LPAD(RPAD('*', n, '*'), 9) line up on the right the way SQL*Plus shows them.
export function spacedColumns(rows, width) {
  return Array.from({ length: width }, (_, ci) => rows.some((r) => typeof r[ci] === 'string' && /^ | {2,}\S/.test(r[ci])));
}
