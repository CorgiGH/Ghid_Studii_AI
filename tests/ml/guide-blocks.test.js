import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { validateSteps, validateRule, answerStepsError } from '../../src/components/lesson/blocks/guideSpec.js';
import { validateReflect } from '../../src/components/lesson/blocks/choiceSpec.js';
import { groupsOf, exampleScreens, parseItems, convert } from '../../scripts/ml/guide-to-lessons.mjs';

// A guide table is static: it must never reach the SQL engine.
vi.mock('../../src/components/lesson/viz/useSqlRunner.js', () => ({
  useSqlRunner: () => { throw new Error('useSqlRunner must not be called for a static table'); },
}));
vi.mock('../../src/contexts/AppContext', () => ({
  useApp: () => ({ t: (en, ro) => ro }),
}));

const { default: StepsBlock } = await import('../../src/components/lesson/blocks/StepsBlock.jsx');
const { default: RuleBlock } = await import('../../src/components/lesson/blocks/RuleBlock.jsx');
const { StepsBody } = await import('../../src/components/lesson/blocks/GuideParts.jsx');
const { blockLoaders } = await import('../../src/components/blocks/registry.js');

const bi = (s) => ({ en: s, ro: s });
const ROOT = path.resolve(__dirname, '../..');
const guideFiles = fs.readdirSync(path.join(ROOT, 'src/content/ml/courses')).filter((f) => /^guide-/.test(f));
const lessons = guideFiles.map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/ml/courses', f), 'utf8')));

describe('steps and rule block shapes', () => {
  it('accepts a full steps card, an intro-only card and a steps-only card', () => {
    expect(validateSteps({ intro: [{ text: bi('Zar corect.') }, { table: { columns: ['X', 'Y'], rows: [['0', '1']] } }], items: [bi('a'), bi('b')], start: 4, result: bi('Deci 1/3.') })).toEqual([]);
    expect(validateSteps({ intro: [{ points: [bi('a')] }] })).toEqual([]);
    expect(validateSteps({ items: [bi('a')] })).toEqual([]);
  });
  it('rejects an empty card, a bad start, a result with no steps and a part with two kinds', () => {
    expect(validateSteps({})).not.toEqual([]);
    expect(validateSteps({ items: [bi('a')], start: 0 })).not.toEqual([]);
    expect(validateSteps({ intro: [{ text: bi('a') }], result: bi('r') })).not.toEqual([]);
    expect(validateSteps({ intro: [{ text: bi('a'), tex: 'x' }] })).not.toEqual([]);
    expect(validateSteps({ intro: [{ table: { columns: ['X'], rows: [] } }] })).not.toEqual([]);
  });
  it('checks a rule and its variant', () => {
    expect(validateRule({ label: bi('Regula'), text: bi('t'), body: [{ tex: 'a=b' }, { note: bi('(cu b ≠ 0)') }] })).toEqual([]);
    expect(validateRule({ variant: 'when', text: bi('t') })).toEqual([]);
    expect(validateRule({ body: [{ tex: 'a' }] })).not.toEqual([]);
    expect(validateRule({ variant: 'loud', text: bi('t') })).not.toEqual([]);
  });
  it('checks a reflect answer drawn as steps', () => {
    expect(answerStepsError([{ items: [bi('a')], result: bi('r') }])).toBeNull();
    expect(answerStepsError([])).not.toBeNull();
    const reflect = { id: 'r1', prompt: bi('p'), answer: bi('a'), answerSteps: [{}] };
    expect(validateReflect(reflect).join(' ')).toMatch(/answerSteps/);
  });
  it('registers both blocks', () => {
    expect(typeof blockLoaders.steps).toBe('function');
    expect(typeof blockLoaders.rule).toBe('function');
  });
});

describe('steps and rule blocks render', () => {
  it('draws one card: intro, numbered steps from start, the result line', () => {
    const html = renderToStaticMarkup(React.createElement(StepsBlock, {
      intro: [{ text: bi('Zar corect.') }, { table: { columns: ['$X$', 'P'], rows: [['1', '0,5']] } }],
      items: [bi('Știm că $B$ s-a întâmplat.'), bi('Deci **1/3**.')], start: 5, result: bi('Gata.'),
    }));
    expect((html.match(/data-testid="steps-block"/g) || [])).toHaveLength(1);
    expect(html).toContain('Zar corect.');
    expect(html).toContain('data-testid="question-table"');
    expect(html).toMatch(/class="ch-step-n"[^>]*>5<.*class="ch-step-n"[^>]*>6</s);
    expect(html).toContain('class="katex"');
    expect(html).toContain('<strong>1/3</strong>');
    expect(html).toContain('data-testid="steps-result"');
    expect(html).not.toContain('**');
  });
  it('stacks a rule\'s formulas and its condition line in one panel', () => {
    const html = renderToStaticMarkup(React.createElement(RuleBlock, {
      label: bi('Regula'), text: bi('Probabilitatea condiționată.'),
      body: [{ tex: 'P(A|B)=\\frac{P(A\\cap B)}{P(B)}' }, { note: bi('(cu $P(B) \\neq 0$)') }, { tex: 'P(A\\cap B)=P(A|B)P(B)' }, { points: [bi('unu')] }],
    }));
    expect((html.match(/class="ch-math"/g) || [])).toHaveLength(1);
    expect((html.match(/class="ch-math-tex"/g) || [])).toHaveLength(2);
    expect(html).toContain('class="ch-math-note"');
    expect(html).toContain('katex-display');
    expect(html).toContain('Regula');
    expect(html).toContain('<ul class="ch-points">');
  });
  it('draws the "when" variant as a plain card', () => {
    const html = renderToStaticMarkup(React.createElement(RuleBlock, { variant: 'when', label: bi('Când vezi asta'), text: bi('t') }));
    expect(html).toContain('ch-rule-when');
  });
  it('draws a worked answer as numbered lines (what ReflectBlock shows for answerSteps)', () => {
    const html = renderToStaticMarkup(React.createElement(StepsBody, { intro: [{ text: bi('$R_1$ = prima roșie.') }], items: [bi('a'), bi('b')], result: bi('c') }));
    expect((html.match(/class="ch-step"/g) || [])).toHaveLength(2);
    expect(html).toContain('steps-result');
  });
});

describe('guide converter: screens look designed, not converted', () => {
  it('splits paragraphs between lists: a closing line ends the list above, the last paragraph opens the next', () => {
    const g = groupsOf(parseItems('Intro.\n\n1. a\n2. b\n\nAșa e.\n\nAcum altul:\n\n1. c\n\nFinal.\n'));
    expect(g).toHaveLength(2);
    expect(g[0].intro.map((i) => i.text)).toEqual(['Intro.']);
    expect(g[0].result.map((i) => i.text)).toEqual(['Așa e.']);
    expect(g[1].intro.map((i) => i.text)).toEqual(['Acum altul:']);
    expect(g[1].result.map((i) => i.text)).toEqual(['Final.']);
  });
  it('cuts 7 steps into 4 + 3, numbers carrying on', () => {
    const md = 'Setul are 6 exemple.\n\n' + Array.from({ length: 7 }, (_, i) => `${i + 1}. pasul ${i + 1}`).join('\n') + '\n';
    const screens = exampleScreens(groupsOf(parseItems(md)));
    expect(screens).toHaveLength(2);
    expect(screens[0][0].items).toHaveLength(4);
    expect(screens[0][0].intro[0].text.ro).toBe('Setul are 6 exemple.');
    expect(screens[1][0].start).toBe(5);
    expect(screens[1][0].items).toHaveLength(3);
  });
  it('writes the ten lessons with no learn boxes, no "**1.**" lines, at most 5 steps a screen', () => {
    expect(lessons).toHaveLength(10);
    for (const l of lessons) {
      for (const s of l.steps) {
        expect(s.blocks.some((b) => b.type === 'learn')).toBe(false);
        // the plain `answer` (shown only without answerSteps) may keep bold numbers; nothing drawn on a screen does
        expect(JSON.stringify(s, (k, v) => (k === 'answer' ? undefined : v))).not.toMatch(/\*\*\d+\.\*\*/);
        for (const b of s.blocks) if (b.type === 'reflect') expect(b.answerSteps, b.id).toBeTruthy();
        const n = s.blocks.filter((b) => b.type === 'steps' && !/^Ce vei putea face/.test(b.intro?.[0]?.heading?.ro ?? '')).reduce((k, b) => k + (b.items?.length || 0), 0);
        expect(n, `${s.id} ${s.title.ro}`).toBeLessThanOrEqual(5);
        for (const b of s.blocks) {
          const errs = b.type === 'steps' ? validateSteps(b) : b.type === 'rule' ? validateRule(b) : b.type === 'reflect' ? validateReflect(b) : [];
          expect(errs, `${s.id}`).toEqual([]);
        }
      }
    }
  });
  it('opens each Ghid lesson with its cards and names screens "Card · Exemplu", "· Regula", "· Încearcă tu 1/2"', () => {
    const md = fs.readFileSync(path.join(ROOT, 'src/guides/ml/part-1a.md'), 'utf8');
    const [g, b] = convert(md);
    const first = g.steps[0].blocks[0];
    expect(first.intro[0].heading.ro).toBe('Ce vei putea face');
    expect(first.items[0].ro).toBe('Probabilitatea condiționată și regula de înmulțire');
    const titles = g.steps.map((s) => s.title.ro);
    expect(titles).toContain('Probabilitatea condiționată și regula de înmulțire · Exemplu');
    expect(titles).toContain('Probabilitatea condiționată și regula de înmulțire · Exemplu (continuare)');
    expect(titles).toContain('Probabilitatea condiționată și regula de înmulțire · Regula');
    expect(titles).toContain('Probabilitatea condiționată și regula de înmulțire · Încearcă tu 1/2');
    expect(titles.some((t) => /: (Regula|Exemplu)/.test(t))).toBe(false);
    expect(b.steps[0].blocks.map((x) => x.type)).toEqual(['rule', 'rule']);
    expect(b.steps[0].blocks[0].variant).toBe('when');
  });
});
