// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from '../../scripts/ml/build-guide.mjs';

const fixture = path.resolve(__dirname, 'fixtures/guide-part.md');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mlguide-'));
let html;

beforeAll(() => {
  const src = tmp(), out = tmp();
  fs.copyFileSync(fixture, path.join(src, 'part-1a.md'));
  html = build({ src, out, copyKatex: false }).html;
});

describe('Ghid rapid ML builder', () => {
  it('renders math with KaTeX', () => {
    expect(html).toContain('class="katex"');
    expect(html).toContain('katex-display');
  });
  it('leaves no raw $ or ** in the text', () => {
    const body = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<annotation[\s\S]*?<\/annotation>/g, '');
    const text = body.replace(/<[^>]+>/g, '');
    expect(text).not.toContain('$');
    expect(text).not.toContain('**');
  });
  it('makes cards, sections, details and the studied flag', () => {
    expect((html.match(/<section class="card"/g) || []).length).toBe(2);
    for (const s of ['cand', 'simboluri', 'exemplu', 'regula', 'capcana', 'incearca']) expect(html).toContain(`data-sec="${s}"`);
    expect(html).toContain('<details><summary>Răspuns</summary>');
    expect(html).toMatch(/data-id="c-1a-1" data-studied="1"/);
    expect(html).toMatch(/data-id="c-1a-2" data-studied="0"/);
    expect(html).toContain('<table>');
    expect(html).toContain('0 din 2 carduri bifate');
    expect(html).toContain('<title>Ghid rapid ML</title>');
  });
  it('builds a valid page with no parts', () => {
    const r = build({ src: tmp(), out: tmp(), copyKatex: false });
    expect(r.html).toContain('vin în curând');
  });
  it('fails on a malformed formula, naming file and line', () => {
    const src = tmp();
    fs.writeFileSync(path.join(src, 'part-2.md'), '# Partea 2: x\n\n## Card\n\n**Regula:** ok\n\nAici e rău: $\\frac{1$\n');
    expect(() => build({ src, out: tmp(), copyKatex: false })).toThrow(/part-2\.md:7/);
  });
});
