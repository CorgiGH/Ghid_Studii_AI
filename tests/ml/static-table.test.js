import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { isStaticTable, tableError, validateMcq, validateReflect } from '../../src/components/lesson/blocks/choiceSpec.js';

// A static table must never reach the SQL engine: any call to the runner fails the test.
vi.mock('../../src/components/lesson/viz/useSqlRunner.js', () => ({
  useSqlRunner: () => { throw new Error('useSqlRunner must not be called for a static table'); },
}));
// renderToStaticMarkup has no browser store to subscribe to; the real store logic runs on a memory storage.
vi.mock('../../src/lesson/useLessonStore', async () => {
  const { createLessonStore } = await import('../../src/lesson/store.js');
  const m = new Map();
  const store = createLessonStore({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } });
  return { useLessonStore: () => store, getLessonStore: () => store };
});
vi.mock('../../src/contexts/AppContext', () => ({
  useApp: () => ({ t: (en, ro) => ro }),
}));

const { default: McqBlock } = await import('../../src/components/lesson/blocks/McqBlock.jsx');
const { default: ReflectBlock } = await import('../../src/components/lesson/blocks/ReflectBlock.jsx');

const bi = (s) => ({ en: s, ro: s });
const opt = (correct, misconception) => ({ text: bi(correct ? 'da' : 'nu'), correct, explain: bi('e'), ...(correct ? {} : { misconception }) });
const rows = (n) => Array.from({ length: n }, (_, i) => [i, i % 2]);

describe('static table shape', () => {
  it('accepts a plain table', () => {
    expect(tableError({ columns: ['X', 'Y'], rows: [[1, 0]] })).toBeNull();
  });

  it('accepts a caption, bilingual columns, KaTeX cells and a highlight', () => {
    const t = {
      caption: bi('Datele'),
      columns: [bi('Vreme'), '$\\bar A$'],
      rows: [['Soare', '$0{,}5$'], ['Ploaie', 3]],
      highlight: { rows: [1], cols: [0] },
    };
    expect(tableError(t)).toBeNull();
  });

  it('still accepts the BD dataset form, alone or in a list', () => {
    expect(tableError({ dataset: 'facultate', sql: 'SELECT 1 FROM dual' })).toBeNull();
    expect(tableError([{ dataset: 'facultate', sql: 'SELECT 1 FROM dual' }, { columns: ['X'], rows: [[1]] }])).toBeNull();
  });

  it('rejects a ragged row', () => {
    expect(tableError({ columns: ['X', 'Y'], rows: [[1, 0], [1]] })).toMatch(/row 2/);
    expect(tableError({ columns: ['X', 'Y'], rows: [[1, 0, 2]] })).toMatch(/row 1/);
  });

  it('rejects more than 45 rows and accepts exactly 45', () => {
    expect(tableError({ columns: ['X', 'Y'], rows: rows(46) })).toMatch(/45/);
    expect(tableError({ columns: ['X', 'Y'], rows: rows(45) })).toBeNull();
  });

  it('rejects no rows, no columns, odd cells, a half caption, an entry that is both forms', () => {
    expect(tableError({ columns: ['X'], rows: [] })).not.toBeNull();
    expect(tableError({ columns: [], rows: [[]] })).not.toBeNull();
    expect(tableError({ columns: ['X'], rows: [[null]] })).not.toBeNull();
    expect(tableError({ columns: ['X'], rows: [[{}]] })).not.toBeNull();
    expect(tableError({ columns: ['X'], rows: [[1]], caption: { en: 'x' } })).not.toBeNull();
    expect(tableError({ columns: ['X'], rows: [[1]], dataset: 'facultate', sql: 'SELECT 1 FROM dual' })).not.toBeNull();
    expect(tableError({ columns: ['X'], rows: 'nope' })).not.toBeNull();
  });

  it('rejects a highlight that points outside the table', () => {
    expect(tableError({ columns: ['X', 'Y'], rows: [[1, 0]], highlight: { rows: [1] } })).toMatch(/highlight/);
    expect(tableError({ columns: ['X', 'Y'], rows: [[1, 0]], highlight: { cols: [2] } })).toMatch(/highlight/);
    expect(tableError({ columns: ['X', 'Y'], rows: [[1, 0]], highlight: { rows: [0], cols: [1] } })).toBeNull();
  });

  it('is told apart from the dataset form', () => {
    expect(isStaticTable({ columns: ['X'], rows: [[1]] })).toBe(true);
    expect(isStaticTable({ dataset: 'a', sql: 'b' })).toBe(false);
  });

  it('lets mcq and reflect validators take a static table', () => {
    const table = { columns: ['X', 'Y'], rows: [[1, 0]] };
    const mcq = { id: 'q', question: bi('q'), table, options: [opt(true), opt(false, 'not-in-null')] };
    expect(validateMcq(mcq)).toEqual([]);
    expect(validateReflect({ id: 'r', prompt: bi('p'), answer: bi('a'), table })).toEqual([]);
    expect(validateReflect({ id: 'r', prompt: bi('p'), answer: bi('a'), table: { columns: ['X'], rows: [[1], [1, 2]] } }).join(' ')).toMatch(/row 2/);
  });
});

describe('wide static tables', () => {
  it('scroll inside their own box, never the page', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync(new URL('../../src/index.css', import.meta.url), 'utf8');
    const box = css.match(/\.sx-table-scroll \{([^}]*)\}/)[1];
    expect(box).toMatch(/overflow:\s*auto/);
    expect(box).toMatch(/border:/);
    // the figure inside .ch-table may shrink below its content, so the box (not the page) takes the overflow
    expect(css).toMatch(/\.sx-table \{[^}]*min-width:\s*0/);
  });

  it('a typeset cell does not get the wrapping class', async () => {
    const { cellClass } = await import('../../src/components/lesson/tableText.js');
    expect(cellClass({ type: 'span' })).toBeUndefined();
    expect(cellClass('două cuvinte')).toBe('words');
  });
});

describe('static table rendering', () => {
  const table = {
    caption: bi('Tabelul de date'),
    columns: ['X', 'Y'],
    rows: [['Soare', 1], ['Ploaie', 0], ['$\\bar A$', 2]],
    highlight: { rows: [1], cols: [1] },
  };

  it('an mcq shows the rows and enables its options without an engine', () => {
    const html = renderToStaticMarkup(React.createElement(McqBlock, {
      id: 'q', question: bi('Care?'), table, options: [opt(true), opt(false, 'not-in-null')],
    }));
    expect(html).toContain('Soare');
    expect(html).toContain('Ploaie');
    expect(html).toContain('Tabelul de date');
    expect(html).toContain('katex'); // the $\bar A$ cell is typeset
    expect(html).not.toContain('Se încarcă tabelul');
    const buttons = html.match(/<button[^>]*data-testid="mcq-option-\d"[^>]*>/g);
    expect(buttons).toHaveLength(2);
    for (const b of buttons) expect(b).not.toMatch(/\sdisabled/);
  });

  it('marks the highlighted row and column', () => {
    const html = renderToStaticMarkup(React.createElement(McqBlock, {
      id: 'q', question: bi('Care?'), table, options: [opt(true), opt(false, 'not-in-null')],
    }));
    expect(html).toMatch(/<tr class="is-hl">/);
    expect((html.match(/is-hl/g) || []).length).toBeGreaterThanOrEqual(4);
  });

  it('a reflect block shows a static table too', () => {
    const html = renderToStaticMarkup(React.createElement(ReflectBlock, { id: 'r', prompt: bi('Ce?'), answer: bi('Asta'), table }));
    expect(html).toContain('Soare');
  });
});
