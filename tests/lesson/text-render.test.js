import { describe, expect, it } from 'vitest';
import formatMarkdown from '../../src/components/blocks/formatMarkdown.js';
import { isLineComment, tokenize, wrapsLines } from '../../src/components/blocks/media/codeTokens.js';

const text = (html) => html.replace(/<span class="katex-mathml">[\s\S]*?<\/span>/g, '').replace(/<[^>]+>/g, '');

describe('formatMarkdown: code spans and dollars', () => {
  it('inline code keeps its runs of spaces (white-space: pre-wrap)', () => {
    const html = formatMarkdown('`Buraga····Sabin` and `SUNDAY   `');
    expect(html).toContain('white-space:pre-wrap');
    expect(text(html)).toBe('Buraga····Sabin and SUNDAY   ');
  });

  it('a run of dollars inside backticks is text, not display math', () => {
    const html = formatMarkdown('five of the form `$$$$$$$450` and eight NULL');
    expect(html).not.toContain('katex');
    expect(text(html)).toBe('five of the form $$$$$$$450 and eight NULL');
  });

  it('a run of three or more dollars in plain text is text', () => {
    const html = formatMarkdown('no row full of $$$$$$$$$$ appears');
    expect(html).not.toContain('katex');
    expect(text(html)).toBe('no row full of $$$$$$$$$$ appears');
  });

  it('shell variables in code spans stay as typed', () => {
    const html = formatMarkdown('`$3` becomes `$2`, etc., and `$#` is updated');
    expect(html).not.toContain('katex');
    expect(text(html)).toBe('$3 becomes $2, etc., and $# is updated');
  });

  it('math outside code still renders, display and inline', () => {
    expect(formatMarkdown('$$x^2$$')).toContain('math-display-wrap');
    expect(formatMarkdown('so $a \\leq b$ holds')).toContain('class="katex"');
  });

  it('a TeX command inside a code span is still math (PA writes `len $\\geq$ 1`)', () => {
    const html = formatMarkdown('no valid `len $\\geq$ 1`');
    expect(html).toContain('class="katex"');
    expect(html).toMatch(/<code[^>]*>len <span class="katex">/);
  });

  it('bold does not reach inside code, and \\$ still reads $', () => {
    expect(text(formatMarkdown('`2 ** 10` is **big**'))).toBe('2 ** 10 is big');
    expect(formatMarkdown('`2 ** 10`')).not.toContain('<strong>');
    expect(text(formatMarkdown('`\\$\\$450`'))).toBe('$$450');
  });
});

describe('code block tokens', () => {
  it('SQL wraps; other languages keep their layout', () => {
    expect(wrapsLines('sql')).toBe(true);
    expect(wrapsLines('text')).toBe(false);
    expect(wrapsLines('cpp')).toBe(false);
  });

  it('`--` is a comment in SQL, at the start of a line or after a statement', () => {
    expect(isLineComment('-- 37', 'sql')).toBe(true);
    expect(isLineComment('  -- rows', 'sql')).toBe(true);
    const toks = tokenize("SELECT COUNT(*) FROM note;  -- 37", 'sql');
    expect(toks.at(-1)).toEqual({ kind: 'comment', text: '-- 37' });
  });

  it('`--` inside an SQL string is part of the string', () => {
    const toks = tokenize("SELECT '--' || nume FROM studenti", 'sql');
    expect(toks.some((x) => x.kind === 'comment')).toBe(false);
    expect(toks.find((x) => x.kind === 'string').text).toBe("'--'");
  });

  it('in C, `--` is still the decrement operator and // still a comment', () => {
    expect(isLineComment('--i;', 'cpp')).toBe(false);
    expect(tokenize('i--; // done', 'cpp').filter((x) => x.kind === 'comment')).toEqual([{ kind: 'comment', text: '// done' }]);
    expect(isLineComment('// note', 'c')).toBe(true);
  });
});
