// The `figure` part, the block-level figure and the `cardlinks` part: the sanitiser and validator (figureSvg.js), the shapes in
// guideSpec / choiceSpec / calcSpec / proofSpec, the render of both parts, and the real figure on ag-cp-1c with the menu on ag-cp-order.
// Expected values come from the course's own worked trace: the arcs of the Dijkstra example on ag-cp-1a (s->a 7, s->b 2, b->a 3,
// b->c 8, a->c 1, a->d 4, c->d 2) and its run on ag-cp-1c (u = a 5, b 2, c 6, d 8; path s, b, a, c, d).
import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  COLOR_NAMES, FIGURE_CLASSES, FIGURE_TAGS, MAX_VIEWBOX_WIDTH, PHONE_FIGURE_WIDTH, figureError, parseSvg, sanitizeSvg, svgErrors, svgOf,
  transformScale,
} from '../../src/components/lesson/blocks/figureSvg.js';
import { partError, validateRule, validateSteps, answerStepsError } from '../../src/components/lesson/blocks/guideSpec.js';
import { validateMcq, validateReflect } from '../../src/components/lesson/blocks/choiceSpec.js';
import { validateCalc, withVariant } from '../../src/components/lesson/blocks/calcSpec.js';
import { figureAt, openSteps, validateProof } from '../../src/components/lesson/blocks/proofSpec.js';
import { screenOfStep } from '../../src/components/lesson/playerLogic.js';
import { collectProofPool } from '../../src/lesson/review.js';

vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro, lang: 'ro' }) }));
// the nav the player provides, set per test (null outside the player)
vi.mock('../../src/components/lesson/LessonNav.js', () => ({ default: null, useLessonNav: () => globalThis.__lessonNav ?? null }));
const { Figure, CardLinks } = await import('../../src/components/lesson/blocks/FigureParts.jsx');

const ROOT = new URL('../../', import.meta.url).pathname;
const h = React.createElement;
const bi = (s) => ({ en: s, ro: s });
const loadJson = (rel) => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));

const SVG = '<svg viewBox="0 0 200 100"><circle class="accent" cx="50" cy="50" r="20"/><text class="fg" x="50" y="55" text-anchor="middle">s</text></svg>';
const fig = (svg = SVG) => ({ svg, alt: bi('un nod'), caption: bi('Nodul s') });

describe('svgErrors: what an SVG may hold', () => {
  it('accepts a small picture with shapes, text, a marker and theme classes', () => {
    const ok = '<svg viewBox="0 0 360 200"><defs><marker id="ah" viewBox="0 0 10 10" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path class="fill-muted" stroke="none" d="M0 1L9 5L0 9z"/></marker></defs>'
      + '<g><title>s&#8594;b: 2</title><line class="ok" stroke-width="3" x1="50" y1="100" x2="130" y2="150" marker-end="url(#ah)"/></g>'
      + '<rect class="fill-soft fg" x="10" y="10" width="40" height="30" rx="6"/><polygon class="warn" points="5,5 20,5 12,18"/>'
      + '<text class="muted" font-size="15" x="5" y="90" transform="rotate(-10 5 90)"><tspan font-weight="700">a</tspan> &amp; b</text></svg>';
    expect(svgErrors(ok)).toEqual([]);
  });

  it.each([
    ['a script element', '<svg viewBox="0 0 100 100"><script>alert(1)</script></svg>', /script/],
    ['a foreignObject', '<svg viewBox="0 0 100 100"><foreignObject><div>x</div></foreignObject></svg>', /foreignObject/],
    ['a style element', '<svg viewBox="0 0 100 100"><style>*{fill:red}</style></svg>', /style/],
    ['an image', '<svg viewBox="0 0 100 100"><image x="0" y="0" width="5" height="5"/></svg>', /image/],
    ['use', '<svg viewBox="0 0 100 100"><use/></svg>', /use/],
    ['a link', '<svg viewBox="0 0 100 100"><a><circle cx="5" cy="5" r="2"/></a></svg>', /<a>/],
    ['an event attribute', '<svg viewBox="0 0 100 100"><circle cx="5" cy="5" r="2" onclick="x()"/></svg>', /event attribute/],
    ['onload on the root', '<svg viewBox="0 0 100 100" onload="x()"></svg>', /event attribute/],
    ['an external href', '<svg viewBox="0 0 100 100"><circle cx="5" cy="5" r="2" href="https://evil"/></svg>', /href/],
    ['xlink:href', '<svg viewBox="0 0 100 100"><circle cx="5" cy="5" r="2" xlink:href="#a"/></svg>', /xlink:href/],
    ['a style attribute', '<svg viewBox="0 0 100 100"><circle cx="5" cy="5" r="2" style="fill:red"/></svg>', /style/],
    ['a colour value in fill', '<svg viewBox="0 0 100 100"><circle cx="5" cy="5" r="2" fill="red"/></svg>', /fill/],
    ['a hex colour in stroke', '<svg viewBox="0 0 100 100"><circle cx="5" cy="5" r="2" stroke="#fff"/></svg>', /stroke/],
    ['a url() fill', '<svg viewBox="0 0 100 100"><circle cx="5" cy="5" r="2" fill="url(#g)"/></svg>', /fill/],
    ['a class outside the theme set', '<svg viewBox="0 0 100 100"><circle class="red" cx="5" cy="5" r="2"/></svg>', /class "red"/],
    ['a javascript: path', '<svg viewBox="0 0 100 100"><path d="javascript:alert(1)"/></svg>', /d="/],
    ['a comment', '<svg viewBox="0 0 100 100"><!-- x --></svg>', /comments/],
    ['a doctype', '<!DOCTYPE svg><svg viewBox="0 0 100 100"></svg>', /doctype/],
    ['CDATA', '<svg viewBox="0 0 100 100"><text x="1" y="1"><![CDATA[x]]></text></svg>', /CDATA/],
    ['a bare ampersand in text', '<svg viewBox="0 0 100 100"><text x="1" y="14">a & b</text></svg>', /&/],
    ['an unknown entity', '<svg viewBox="0 0 100 100"><text x="1" y="14">&nbsp;</text></svg>', /&/],
    ['text outside a text element', '<svg viewBox="0 0 100 100">hello</svg>', /outside/],
    ['no viewBox', '<svg><circle cx="5" cy="5" r="2"/></svg>', /viewBox/],
    ['a viewBox wider than 400', '<svg viewBox="0 0 401 100"></svg>', /over 400/],
    ['a zero-size viewBox', '<svg viewBox="0 0 0 100"></svg>', /positive/],
    ['text under 13 units', '<svg viewBox="0 0 100 100"><text font-size="12" x="1" y="14">a</text></svg>', /under 13/],
    ['text that inherits a small size from a group', '<svg viewBox="0 0 100 100"><g font-size="10"><text x="1" y="14">a</text></g></svg>', /under 13/],
    ['a tspan under 13 units', '<svg viewBox="0 0 100 100"><text x="1" y="14"><tspan font-size="9">a</tspan></text></svg>', /under 13/],
    ['text shrunk by a scale on a group', '<svg viewBox="0 0 100 100"><g transform="scale(0.4)"><text font-size="14" x="1" y="14">a</text></g></svg>', /scale 0.4 \(5.6\).*under 13/],
    ['text shrunk by its own scale', '<svg viewBox="0 0 100 100"><text transform="scale(0.5)" x="1" y="14">a</text></svg>', /scale 0.5/],
    ['text shrunk by two scales in a row', '<svg viewBox="0 0 100 100"><g transform="scale(0.9)"><g transform="translate(5 5) scale(0.9)"><text x="1" y="14">a</text></g></g></svg>', /scale 0.81/],
    ['text squashed on one axis', '<svg viewBox="0 0 100 100"><g transform="scale(1, 0.5)"><text font-size="20" x="1" y="14">a</text></g></svg>', /scale 0.5/],
    ['text inside a marker', '<svg viewBox="0 0 100 100"><defs><marker id="m" viewBox="0 0 100 100" markerWidth="5" markerHeight="5"><text font-size="60" x="1" y="60">a</text></marker></defs></svg>', /inside a <marker>/],
    ['14-unit text in a 376-wide picture (12.1 px on a phone)', '<svg viewBox="0 0 376 100"><text x="1" y="14">a</text></svg>', /under 13 px on a phone.*376-wide viewBox needs at least 15.09/],
    ['a marker that is not defined', '<svg viewBox="0 0 100 100"><line x1="0" y1="0" x2="5" y2="5" marker-end="url(#nope)"/></svg>', /not defined/],
    ['an external marker', '<svg viewBox="0 0 100 100"><line x1="0" y1="0" x2="5" y2="5" marker-end="url(https://x/y#a)"/></svg>', /marker-end/],
    ['a repeated id', '<svg viewBox="0 0 100 100"><g id="a"/><g id="a"/></svg>', /twice/],
    ['two roots', '<svg viewBox="0 0 100 100"></svg><svg viewBox="0 0 100 100"></svg>', /more than one root/],
    ['an element that is not closed', '<svg viewBox="0 0 100 100"><g>', /not closed/],
    ['a mismatched closing tag', '<svg viewBox="0 0 100 100"><g></text></svg>', /does not close/],
    ['a root that is not svg', '<g></g>', /root element/],
    ['svg inside svg', '<svg viewBox="0 0 100 100"><svg viewBox="0 0 10 10"/></svg>', /svg inside svg/],
    ['an attribute without quotes', '<svg viewBox="0 0 100 100"><circle cx=5 cy="5" r="2"/></svg>', /name="value"/],
    ['an empty string', '', /non-empty/],
    ['markup that is not a string', null, /non-empty/],
  ])('rejects %s', (_name, svg, why) => {
    const errs = svgErrors(svg);
    expect(errs.length).toBeGreaterThan(0);
    expect(errs.join('\n')).toMatch(why);
  });

  it('takes the 14 the page gives as the size of a text with no font-size, and a size of exactly 13 or more', () => {
    expect(svgErrors('<svg viewBox="0 0 100 100"><text x="1" y="14">a</text></svg>')).toEqual([]);
    expect(svgErrors('<svg viewBox="0 0 100 100"><text font-size="13" x="1" y="14">a</text></svg>')).toEqual([]);
    expect(svgErrors('<svg viewBox="0 0 100 100"><g font-size="16"><text x="1" y="14">a</text></g></svg>')).toEqual([]);
  });

  it('checks text where a phone shows it: size × 324 / viewBox width >= 13 px, on top of the 13-unit floor', () => {
    expect(PHONE_FIGURE_WIDTH).toBe(390 - 2 * 16 - 2 * 17); // page gutter, then the card's padding and border: the figure reaches the card's edges
    const at = (w, size) => svgErrors(`<svg viewBox="0 0 ${w} 100"><text font-size="${size}" x="1" y="20">a</text></svg>`);
    // a 376-wide figure (ag-cp-1c) needs 13 × 376 / 324 = 15.09 units
    expect(at(376, 15).join()).toMatch(/under 13 px on a phone/);
    expect(at(376, 15.1)).toEqual([]);
    expect(at(376, 16)).toEqual([]);
    // 400 wide: 16.05
    expect(at(400, 16).join()).toMatch(/under 13 px/);
    expect(at(400, 16.1)).toEqual([]);
    // at or under 324 wide the picture is drawn at least at its own size: the 13-unit floor is the rule
    expect(at(324, 13)).toEqual([]);
    expect(at(200, 13)).toEqual([]);
    expect(at(200, 12.9).join()).toMatch(/under 13 viewBox units/);
  });

  it('multiplies every scale() on the text and its ancestors into its size; translate and rotate keep it', () => {
    expect(transformScale('scale(0.4)')).toBeCloseTo(0.4);
    expect(transformScale('translate(5 5) scale(2) rotate(30) scale(0.5, 0.25)')).toBeCloseTo(0.5);
    expect(transformScale('rotate(45 10 10) translate(3)')).toBe(1);
    expect(transformScale(undefined)).toBe(1);
    expect(svgErrors('<svg viewBox="0 0 100 100"><g transform="scale(2)"><text font-size="7" x="1" y="14">a</text></g></svg>')).toEqual([]);
    expect(svgErrors('<svg viewBox="0 0 100 100"><g transform="scale(2)"><g transform="scale(0.5)"><text font-size="13" x="1" y="14">a</text></g></g></svg>')).toEqual([]);
    expect(svgErrors('<svg viewBox="0 0 100 100" transform="scale(0.5)"><text font-size="20" x="1" y="14">a</text></svg>').join()).toMatch(/scale 0.5/);
  });

  it('holds the width limit exactly at 400', () => {
    expect(MAX_VIEWBOX_WIDTH).toBe(400);
    expect(svgErrors('<svg viewBox="0 0 400 100"></svg>')).toEqual([]);
    expect(svgErrors('<svg viewBox="0 0 400.5 100"></svg>')).not.toEqual([]);
  });

  it('allows only the listed tags', () => {
    expect(FIGURE_TAGS).toEqual(['svg', 'g', 'path', 'line', 'polyline', 'polygon', 'circle', 'ellipse', 'rect', 'text', 'tspan', 'defs', 'marker', 'title']);
  });
});

describe('sanitizeSvg: what reaches the page', () => {
  it('writes the tree back with role="img", the alt text as its label, no xmlns, and the same shapes', () => {
    const out = sanitizeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">${SVG.slice(SVG.indexOf('<circle'), -6)}</svg>`, 'un "nod" <s>');
    expect(out.startsWith('<svg viewBox="0 0 200 100" role="img" focusable="false" aria-label="un &quot;nod&quot; &lt;s>">')).toBe(true);
    expect(out).toContain('<circle class="accent" cx="50" cy="50" r="20"></circle>');
    expect(out).toContain('<text class="fg" x="50" y="55" text-anchor="middle">s</text>');
    expect(out).not.toContain('xmlns');
  });

  it('returns nothing for a figure that fails the checks: it never half-renders', () => {
    expect(sanitizeSvg('<svg viewBox="0 0 100 100"><script>x</script></svg>', 'a')).toBe('');
    expect(sanitizeSvg('<svg viewBox="0 0 500 100"></svg>', 'a')).toBe('');
    expect(sanitizeSvg('<svg viewBox="0 0 100 100"><text font-size="9" x="1" y="14">a</text></svg>', 'a')).toBe('');
  });

  it('gives the same markup for the same picture however its quotes and spaces are written', () => {
    const a = sanitizeSvg(SVG, 'un nod');
    const b = sanitizeSvg(SVG.replace(/"/g, "'").replace('<circle ', '<circle  \n '), 'un nod');
    expect(a).not.toBe('');
    expect(b).toBe(a);
  });

  it('gives every id and every marker url(#id) the figure\'s prefix, so two figures never share one', () => {
    const src = '<svg viewBox="0 0 100 100"><defs><marker id="ah" viewBox="0 0 10 10" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="fill-muted" stroke="none" d="M0 1L9 5L0 9z"/></marker></defs>'
      + '<line x1="0" y1="0" x2="50" y2="50" marker-start="url(#ah)" marker-end="url(#ah)"/><g id="root"/></svg>';
    const a = sanitizeSvg(src, 'a', 'figA');
    const b = sanitizeSvg(src, 'b', 'figB');
    expect(a).toContain('<marker id="figA-ah"');
    expect(a).toContain('marker-start="url(#figA-ah)" marker-end="url(#figA-ah)"');
    expect(b).toContain('<marker id="figB-ah"');
    expect(b).toContain('marker-end="url(#figB-ah)"');
    // an id that would match the page's own (the app mounts in #root) never reaches the page bare
    expect(a).toContain('<g id="figA-root">');
    const ids = (html) => [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids(a).filter((x) => ids(b).includes(x))).toEqual([]);
    expect(ids(sanitizeSvg(src, 'x'))).toEqual(['fig-ah', 'fig-root']); // without a prefix: "fig"
    // React's useId gives ":r1:", "«r1»" or "_r_1_": the prefix keeps only id characters, and starts with a letter
    expect(sanitizeSvg(src, 'x', 'fig:r1:')).toContain('id="figr1-ah"');
    expect(sanitizeSvg(src, 'x', '«r1»')).toContain('id="r1-ah"');
    expect(sanitizeSvg(src, 'x', '_r_1_')).toContain('id="fig_r_1_-ah"');
  });

  it('keeps entities in text and escapes the rest', () => {
    const out = sanitizeSvg('<svg viewBox="0 0 100 100"><text x="1" y="14">a &amp; b &lt; c</text></svg>', '');
    expect(out).toContain('>a &amp; b &lt; c</text>');
  });

  it('never lets a markup-looking string through as markup', () => {
    for (const evil of ['<svg viewBox="0 0 10 10"><text x="1" y="14">&lt;script&gt;alert(1)&lt;/script&gt;</text></svg>']) {
      const out = sanitizeSvg(evil, 'a');
      expect(out).toContain('&lt;script&gt;');
      expect(out).not.toContain('<script');
    }
  });
});

describe('figureError: the { svg, alt, caption } object', () => {
  it('accepts a figure with a string svg or one per language', () => {
    expect(figureError(fig())).toBeNull();
    expect(figureError({ svg: { en: SVG, ro: SVG }, alt: bi('x') })).toBeNull();
    expect(svgOf({ svg: { en: 'EN', ro: 'RO' } }, 'ro')).toBe('RO');
    expect(svgOf({ svg: 'ONE' }, 'en')).toBe('ONE');
  });
  it('asks for alt with both languages, an optional two-language caption, and nothing else', () => {
    expect(figureError({ svg: SVG })).toMatch(/alt/);
    expect(figureError({ svg: SVG, alt: { en: 'x' } })).toMatch(/alt/);
    expect(figureError({ svg: SVG, alt: bi('x'), caption: { en: 'x' } })).toMatch(/caption/);
    expect(figureError({ svg: SVG, alt: bi('x'), width: 5 })).toMatch(/width/);
    expect(figureError([])).toMatch(/object/);
    expect(figureError(null)).toMatch(/object/);
    expect(figureError({ svg: 5, alt: bi('x') })).toMatch(/svg/);
  });
  it('names the first problem of the svg and how many more there are', () => {
    const e = figureError({ svg: '<svg viewBox="0 0 500 100"><script/></svg>', alt: bi('x') });
    expect(e).toMatch(/^figure svg: /);
  });
});

describe('the figure part and the cardlinks part', () => {
  it('a figure is one part of a steps or a rule card, checked like the others', () => {
    expect(partError({ figure: fig() })).toBeNull();
    expect(partError({ figure: { svg: SVG } })).toMatch(/alt/);
    expect(partError({ figure: fig(), text: bi('x') })).toMatch(/exactly one/);
    expect(validateSteps({ intro: [{ figure: fig() }, { text: bi('x') }], items: [bi('a')] })).toEqual([]);
    expect(validateRule({ text: bi('r'), body: [{ figure: fig() }] })).toEqual([]);
    expect(validateRule({ text: bi('r'), body: [{ figure: { svg: '<svg viewBox="0 0 900 9"/>', alt: bi('x') } }] }).join()).toMatch(/over 400/);
    expect(answerStepsError([{ intro: [{ figure: fig() }], items: [bi('a')] }])).toBeNull();
  });

  const links = [{ text: bi('Dijkstra'), step: 'ag-cp-1a' }, { text: bi('Kruskal'), step: 'ag-cp-2a' }];
  it('cardlinks is a non-empty list of { text, step }', () => {
    expect(partError({ cardlinks: links })).toBeNull();
    expect(partError({ cardlinks: [] })).toMatch(/non-empty/);
    expect(partError({ cardlinks: [{ text: bi('x') }] })).toMatch(/step id/);
    expect(partError({ cardlinks: [{ text: { en: 'x' }, step: 'a' }] })).toMatch(/en \+ ro/);
    expect(partError({ cardlinks: [{ text: bi('x'), step: 'a', extra: 1 }] })).toMatch(/text and step only/);
  });
  it('checks every step id against the lesson when the lesson is known, and skips that check when it is not', () => {
    expect(partError({ cardlinks: links }, { stepIds: ['ag-cp-1a', 'ag-cp-2a', 'x'] })).toBeNull();
    expect(partError({ cardlinks: links }, { stepIds: new Set(['ag-cp-1a', 'ag-cp-2a']) })).toBeNull();
    expect(partError({ cardlinks: links }, { stepIds: ['ag-cp-1a'] })).toMatch(/"ag-cp-2a" is not a step of this lesson/);
    expect(validateSteps({ intro: [{ cardlinks: links }], items: [bi('a')] }, { stepIds: ['ag-cp-1a'] }).join()).toMatch(/ag-cp-2a/);
    expect(validateSteps({ intro: [{ cardlinks: links }], items: [bi('a')] })).toEqual([]);
  });
  it('a screen is found by its step id, not by its place', () => {
    const steps = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(screenOfStep(steps, 'c')).toBe(3);
    expect(screenOfStep([{ id: 'new' }, ...steps], 'c')).toBe(4); // a screen inserted before it moves the number, not the link
    expect(screenOfStep(steps, 'zzz')).toBeNull();
    expect(screenOfStep(undefined, 'a')).toBeNull();
  });
});

describe('a figure on a question block', () => {
  const calc = () => ({
    id: 'c1', statement: bi('s'), fields: [{ id: 'f', label: bi('l'), kind: 'num', formula: '1+1', expected: 2 }],
    hints: [bi('1'), bi('2'), bi('3')], solution: bi('sol'), status: 'book',
    variants: [{ statement: bi('v'), fields: [{ id: 'f', formula: '2+2', expected: 4 }], solution: bi('vs') }],
  });
  const mcq = () => ({ id: 'q1', question: bi('q?'), options: [{ text: bi('a'), correct: true, explain: bi('e') }, { text: bi('b'), correct: false, explain: bi('e'), misconception: 'cartesian' }] });
  const reflect = () => ({ id: 'r1', prompt: bi('p'), answer: bi('a') });
  const proof = () => ({ type: 'proof-steps', id: 'p1', claim: bi('c'), end: bi('e'), steps: [{ shown: bi('s1') }, { shown: bi('s2') }, { shown: bi('s3') }] });

  it('is allowed on calc-exercise, mcq, reflect and proof-steps, and checked there', () => {
    expect(validateCalc({ ...calc(), figure: fig() })).toEqual([]);
    expect(validateMcq({ ...mcq(), figure: fig() })).toEqual([]);
    expect(validateReflect({ ...reflect(), figure: fig() })).toEqual([]);
    expect(validateProof({ ...proof(), figure: fig() })).toEqual([]);
    const bad = { svg: '<svg viewBox="0 0 100 100"><script/></svg>', alt: bi('x') };
    for (const e of [validateCalc({ ...calc(), figure: bad }), validateMcq({ ...mcq(), figure: bad }), validateReflect({ ...reflect(), figure: bad }), validateProof({ ...proof(), figure: bad })]) {
      expect(e.join()).toMatch(/script/);
    }
  });

  it('a proof step may carry its own figure; a bad one is named by step', () => {
    const p = proof();
    p.steps[1].figure = fig();
    expect(validateProof(p)).toEqual([]);
    p.steps[2].figure = { svg: SVG };
    expect(validateProof(p).join()).toMatch(/steps\[2\] .*alt/);
  });

  it('figureAt: the latest step on screen that has a figure replaces the block\'s, which comes back when none has', () => {
    const own = fig(SVG.replace('r="20"', 'r="21"'));
    const s1 = fig(SVG.replace('r="20"', 'r="22"'));
    const s3 = fig(SVG.replace('r="20"', 'r="23"'));
    const p = { ...proof(), figure: own };
    p.steps[1].figure = s1;
    p.steps[2].figure = s3;
    expect(figureAt(p, 1)).toBe(own);
    expect(figureAt(p, 2)).toBe(s1);
    expect(figureAt(p, 3)).toBe(s3);
    expect(figureAt(proof(), 3)).toBeNull();
    expect(figureAt({ ...proof(), figure: own }, 99)).toBe(own);
  });

  it('a step with a predict shows its picture only once the pick is made', () => {
    const p = proof();
    p.steps[1].predict = { question: bi('?'), options: mcq().options };
    p.steps[1].figure = fig();
    expect(openSteps({ shown: 2, picks: {} }, p)).toBe(1);
    expect(figureAt(p, openSteps({ shown: 2, picks: {} }, p))).toBeNull();
    expect(openSteps({ shown: 2, picks: { 1: 0 } }, p)).toBe(2);
    expect(figureAt(p, openSteps({ shown: 2, picks: { 1: 0 } }, p))).toBe(p.steps[1].figure);
    expect(openSteps({ shown: 3, picks: {} }, p)).toBe(3);
  });

  it('a review question keeps the proof\'s picture as it stood at that step, and a calc variant never inherits the block\'s picture', () => {
    const p = proof();
    p.figure = fig();
    p.steps[0].predict = { question: bi('?'), options: mcq().options };
    p.steps[2].figure = fig(SVG.replace('r="20"', 'r="25"'));
    p.steps[2].predict = { question: bi('?'), options: mcq().options };
    const pool = collectProofPool([{ src: 'x.json', course: { steps: [{ blocks: [p] }] }, index: 0 }]);
    expect(pool.map((e) => e.id)).toEqual(['p1#0', 'p1#2']);
    expect(pool[0].block.figure).toBe(p.figure);
    expect(pool[1].block.figure).toBe(p.figure); // the question stands in step 2's place: the picture is the one before it
    const c = { ...calc(), figure: fig() };
    expect(withVariant(c, c.variants[0]).figure).toBeUndefined();
    const own = fig(SVG.replace('r="20"', 'r="26"'));
    expect(withVariant(c, { ...c.variants[0], figure: own }).figure).toBe(own);
    expect(validateCalc({ ...c, variants: [{ ...c.variants[0], figure: { svg: SVG } }] }).join()).toMatch(/variants\[0\]: .*alt/);
  });
});

describe('the render', () => {
  it('draws a figure as a figure with the sanitised svg, its label and its caption', () => {
    const html = renderToStaticMarkup(h(Figure, { figure: fig() }));
    expect(html).toContain('class="lf-fig"');
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="un nod"');
    expect(html).toContain('<figcaption class="lf-fig-caption">Nodul s</figcaption>');
  });
  it('two figures in one tree get different ids, each marker pointing at its own', () => {
    const src = '<svg viewBox="0 0 100 100"><defs><marker id="ah" viewBox="0 0 10 10" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="fill-muted" stroke="none" d="M0 1L9 5L0 9z"/></marker></defs><line x1="0" y1="0" x2="50" y2="50" marker-end="url(#ah)"/></svg>';
    const one = { svg: src, alt: bi('x') };
    const html = renderToStaticMarkup(h('div', null, h(Figure, { figure: one }), h(Figure, { figure: one })));
    const ids = [...html.matchAll(/<marker id="([^"]+)"/g)].map((m) => m[1]);
    const refs = [...html.matchAll(/marker-end="url\(#([^)]+)\)"/g)].map((m) => m[1]);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    expect(refs).toEqual(ids);
  });
  it('draws nothing for a figure that fails the checks, and no caption when there is none', () => {
    expect(renderToStaticMarkup(h(Figure, { figure: { svg: '<svg viewBox="0 0 100 100"><script/></svg>', alt: bi('x') } }))).toBe('');
    expect(renderToStaticMarkup(h(Figure, { figure: { svg: SVG, alt: bi('x') } }))).not.toContain('figcaption');
  });
  const links = [{ text: bi('Dijkstra'), step: 'ag-cp-1a' }, { text: bi('Kruskal'), step: 'ag-cp-2a' }];
  it('cardlinks draw one button per line inside the player, each naming its step, and plain lines outside it', () => {
    globalThis.__lessonNav = { stepIds: ['ag-cp-1a', 'ag-cp-2a'], goToStep: () => {} };
    const inPlayer = renderToStaticMarkup(h(CardLinks, { links }));
    expect(inPlayer.match(/data-testid="cardlink"/g)).toHaveLength(2);
    expect(inPlayer).toContain('data-step="ag-cp-1a"');
    expect(inPlayer).toContain('data-step="ag-cp-2a"');
    expect(inPlayer).toContain('type="button"');
    globalThis.__lessonNav = null;
    const outside = renderToStaticMarkup(h(CardLinks, { links }));
    expect(outside).not.toContain('<button');
    expect(outside).toContain('Dijkstra');
  });
  it('a tap opens the screen of that line\'s step id, and nothing opens before a tap', () => {
    const calls = [];
    globalThis.__lessonNav = { goToStep: (id) => calls.push(id) };
    const list = CardLinks({ links }); // the component is a plain function of its props and the nav: read its buttons
    const buttons = [];
    const walk = (el) => {
      if (!el || typeof el !== 'object') return;
      if (el.type === 'button') buttons.push(el);
      React.Children.forEach(el.props?.children, walk);
    };
    walk(list);
    globalThis.__lessonNav = null;
    expect(buttons).toHaveLength(2);
    expect(calls).toEqual([]);
    buttons[1].props.onClick();
    buttons[0].props.onClick();
    expect(calls).toEqual(['ag-cp-2a', 'ag-cp-1a']);
  });
});

describe('the theme: colours only through classes mapped to tokens', () => {
  const css = readFileSync(join(ROOT, 'src/index.css'), 'utf8');
  const figRules = css.split('\n').filter((l) => l.trimStart().startsWith('.lf-fig'));
  it('every allowed class has a rule under .lf-fig', () => {
    for (const c of FIGURE_CLASSES) expect(figRules.some((l) => l.includes(`.${c} `) || l.includes(`.${c},`)), c).toBe(true);
    expect(COLOR_NAMES).toEqual(['fg', 'muted', 'accent', 'ok', 'bad', 'warn']);
  });
  const rule = (sel) => { const i = css.indexOf(`${sel} {`); return i < 0 ? '' : css.slice(i, css.indexOf('}', i)); };
  it('gives text its 14 through the svg (inherited), so a text\'s own font-size attribute is the one that applies', () => {
    expect(rule('.lf-fig text, .lf-fig tspan')).not.toMatch(/font-size/);
    expect(rule('.lf-fig-svg svg')).toMatch(/font-size: 14px/);
  });
  it('keeps a wide screen\'s figure at most 520 px wide, and on a phone draws it 324 px wide in every box it can sit in', () => {
    expect(rule('.lf-fig-svg svg')).toMatch(/max-width: 520px/);
    const phone = css.slice(css.indexOf('@media (max-width: 480px) {\n  .lf-fig {'));
    const block = phone.slice(0, phone.indexOf('\n}'));
    expect(block).toContain('.lf-fig { padding: 6px 0; border: 0; border-radius: 0; background: none; }');
    // a question block (.ch) has no padding: 324 as it is. A card and an answer box have 14 px padding + 1 px border; a proof step
    // 44 px on the left (its number) and 14 on the right, + 1 px border: the figure goes over them.
    expect(block).toContain('.ch-gcard .lf-fig, .ch-explain .lf-fig { margin-inline: -15px; }');
    expect(block).toContain('.ch-proof-step .lf-fig { margin-inline: -45px -15px; }');
    expect(block).toContain('.ch-rule:not(.ch-rule-when) .lf-fig { margin-left: -17px; }'); // a rule card's 3 px accent bar
  });
  it('no .lf-fig rule holds a literal colour: every one is a var(--...) token', () => {
    expect(figRules.length).toBeGreaterThan(20);
    for (const l of figRules) expect(l, l).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
  });
});

// ---- the real screens --------------------------------------------------------------------------------------------------------

const ag1 = loadJson('src/content/ag/courses/ag-crash-partial.json');
const stepOf = (course, id) => course.steps.find((s) => s.id === id);

describe('ag-cp-1c: the digraph is drawn from the screen\'s own arc list', () => {
  const arcsOf1a = stepOf(ag1, 'ag-cp-1a').blocks[0].body[0].table.rows.map(([a, c]) => {
    const m = /^\$(\w)\\to (\w)\$$/.exec(a);
    return `${m[1]}→${m[2]}: ${c}`;
  });
  const part = stepOf(ag1, 'ag-cp-1c').blocks[0].intro[0];
  const { root } = parseSvg(part.figure.svg);
  const walk = (n, f) => { f(n); (n.children || []).forEach((c) => c.tag && walk(c, f)); };
  const collect = (tag) => { const out = []; walk(root, (n) => { if (n.tag === tag) out.push(n); }); return out; };
  const textOf = (n) => n.children.map((c) => c.text ?? textOf(c)).join('');

  it('is the first part of the card, in place of the one-cell arc table, and is a valid figure', () => {
    expect(part.figure).toBeTruthy();
    expect(figureError(part.figure)).toBeNull();
    expect(partError(part, { stepIds: ag1.steps.map((s) => s.id) })).toBeNull();
    expect(JSON.stringify(stepOf(ag1, 'ag-cp-1c'))).not.toContain('Arcs of the example, with cost');
  });
  it('has one arc per row of the ag-cp-1a list (7 arcs, costs 7, 2, 3, 8, 1, 4, 2) and one node per name (s, a, b, c, d)', () => {
    expect(arcsOf1a).toEqual(['s→a: 7', 's→b: 2', 'b→a: 3', 'b→c: 8', 'a→c: 1', 'a→d: 4', 'c→d: 2']);
    const titles = collect('title').map(textOf);
    expect(titles).toEqual(arcsOf1a);
    // six straight arcs and the curved a→d arc (a path), so its label does not sit on the a→c arc
    expect(collect('line')).toHaveLength(6);
    expect(collect('path').filter((p) => p.attrs['marker-end'])).toHaveLength(1);
    const nodes = collect('circle');
    expect(nodes).toHaveLength(5);
    const names = collect('text').map(textOf).filter((s) => /^[a-z]$/.test(s)).sort();
    expect(names).toEqual(['a', 'b', 'c', 'd', 's']);
  });
  it('writes each cost on its arc, and marks exactly the run\'s path s, b, a, c, d (costs 2, 3, 1, 2, total 8) in green', () => {
    const costs = collect('text').map(textOf).filter((s) => /^\d+$/.test(s));
    expect(costs).toEqual(['7', '2', '3', '8', '1', '4', '2']);
    const green = collect('line').filter((l) => l.attrs.class === 'ok');
    expect(green).toHaveLength(4);
    const greenArcs = collect('g').filter((g) => g.children.some((c) => c.tag === 'line' && c.attrs.class === 'ok')).map((g) => textOf(g.children.find((c) => c.tag === 'title')));
    expect(greenArcs).toEqual(['s→b: 2', 'b→a: 3', 'a→c: 1', 'c→d: 2']);
    const total = greenArcs.reduce((k, a) => k + Number(a.split(': ')[1]), 0);
    expect(total).toBe(8);
  });
  it('keeps the rounds table next to it, with the final u_a = 5, u_b = 2, u_c = 6, u_d = 8', () => {
    const rounds = stepOf(ag1, 'ag-cp-1c').blocks[0].intro[1].table;
    expect(rounds.rows.at(-1)).toEqual([4, 'd', '5 (b)', '2 (s)', '6 (a)', '8 (c) ✓']);
  });
  it('renders at 100% width inside a figure with its label', () => {
    const html = renderToStaticMarkup(h(Figure, { figure: part.figure }));
    expect(html).toContain('aria-label="Digraful exemplului');
    // each marker url points at this figure's own, prefixed, arrowhead
    const ids = [...html.matchAll(/<marker id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toHaveLength(2);
    expect(ids.every((x) => /^fig.+-(ah|ahok)$/.test(x))).toBe(true);
    const refs = [...html.matchAll(/marker-end="url\(#([^)]+)\)"/g)].map((m) => m[1]);
    expect(refs).toHaveLength(7);
    expect(refs.every((r) => ids.includes(r))).toBe(true);
    expect(html).toContain('Verde: drumul pe care îl găsește Dijkstra până la d.');
    // the caption names the blue ring on s, with s drawn as math (not "$s$")
    expect(html).toContain('(cerc albastru) e startul.');
    expect(html).not.toContain('$s$');
    expect(html).toContain('class="katex"');
  });
  it('every label shows at 13 px or more on a phone: costs and names at 16 units in a 376-wide picture', () => {
    expect(root.attrs.viewBox).toBe('0 0 376 200');
    const sizes = collect('text').map((tx) => Number(tx.attrs['font-size']));
    expect(sizes).toHaveLength(12);
    expect(sizes.every((x) => x === 16)).toBe(true);
    expect((16 * PHONE_FIGURE_WIDTH) / 376).toBeGreaterThanOrEqual(13);
  });
  it('marks the start s with the accent ring that the caption names, and only s', () => {
    const rings = collect('circle').filter((c) => c.attrs.class.split(' ').includes('accent'));
    expect(rings).toHaveLength(1);
    expect(rings[0].attrs.cx).toBe('36');
    const sText = collect('text').find((tx) => textOf(tx) === 's');
    expect(sText.attrs.x).toBe('36');
    expect(part.figure.caption.en).toMatch(/\$s\$ \(blue ring\) is the start\./);
  });
});

describe('ag-cp-order: the card menu', () => {
  const order = stepOf(ag1, 'ag-cp-order');
  const part = order.blocks[0].intro[0];
  it('lists cards 1 to 6 of this lesson, each opening the first screen of its card', () => {
    expect(part.cardlinks.map((l) => l.step)).toEqual(['ag-cp-1a', 'ag-cp-2a', 'ag-cp-3a', 'ag-cp-4a', 'ag-cp-5a', 'ag-cp-6a']);
    expect(partError(part, { stepIds: ag1.steps.map((s) => s.id) })).toBeNull();
    // each target screen's kicker says it is that card
    part.cardlinks.forEach((l, i) => {
      expect(stepOf(ag1, l.step).kicker.ro).toMatch(new RegExp(`^Cardul ${i + 1} din 10`));
      expect(l.text.ro).toMatch(new RegExp(`^${i + 1} · `));
    });
  });
  it('drops the effort words', () => {
    expect(JSON.stringify(order)).not.toMatch(/ușor|ușoare|easy/);
  });
  it('the last screen of each of cards 1 to 6 links back to it (browser Back leaves the lesson after a jump)', () => {
    const lastOf = (n) => ag1.steps.filter((s) => s.kicker?.ro?.startsWith(`Cardul ${n} din 10`)).at(-1);
    const lasts = [1, 2, 3, 4, 5, 6].map(lastOf);
    expect(lasts.map((s) => s.id)).toEqual(['ag-cp-1f', 'ag-cp-2f', 'ag-cp-3e', 'ag-cp-4f', 'ag-cp-5e', 'ag-cp-6e']);
    for (const s of lasts) {
      const back = s.blocks.flatMap((b) => b.intro || []).find((p) => p.cardlinks);
      expect(back, s.id).toBeTruthy();
      expect(back.cardlinks).toEqual([{ text: { en: 'Back to the card list', ro: 'Înapoi la lista cardurilor' }, step: 'ag-cp-order' }]);
      expect(partError(back, { stepIds: ag1.steps.map((x) => x.id) })).toBeNull();
    }
  });
});

describe('ag-cp-6c: the tree path on card 1\'s digraph', () => {
  const arcs = Object.fromEntries(stepOf(ag1, 'ag-cp-1a').blocks[0].body[0].table.rows.map(([a, c]) => {
    const m = /^\$(\w)\\to (\w)\$$/.exec(a);
    return [`${m[1]}${m[2]}`, c];
  }));
  const tab = stepOf(ag1, 'ag-cp-6c').blocks[0].intro[0].table;
  it('has two columns, path and cost, so the cost fits a phone', () => {
    expect(tab.columns.map((c) => c.ro)).toEqual(['Drum de la $s$ la $c$', 'Cost']);
    expect(tab.rows.every((r) => r.length === 2)).toBe(true);
    expect(tab.highlight).toEqual({ rows: [0] });
  });
  it('each cost is the sum of the path\'s arcs from the ag-cp-1a list, and the tree path (s, b, a, c) is the cheapest', () => {
    const totals = tab.rows.map(([path, cost]) => {
      const nodes = /^\$([a-z](?:,[a-z])*)\$/.exec(path.ro)[1].split(',');
      const parts = nodes.slice(1).map((v, i) => arcs[`${nodes[i]}${v}`]);
      const sum = parts.reduce((a, b) => a + b, 0);
      expect(cost).toBe(`$${parts.join('+')}=${sum}$`);
      return sum;
    });
    expect(totals).toEqual([6, 8, 10]);
    expect(Math.min(...totals)).toBe(totals[0]);
  });
  it('writes before as a word, never as $before$ (spaced italic letters)', () => {
    expect(JSON.stringify(stepOf(ag1, 'ag-cp-6c'))).not.toContain('$before$');
    expect(tab.rows[0][0].ro).toBe('$s,b,a,c$ (arborele din before)');
  });
});

describe('AG Tema 1 guard (D-089): the Tema\'s own objects stay with the team', () => {
  it('ag-cp-4e asks which set the rule goes on instead of naming X = {x1, x2}', () => {
    const texts = stepOf(ag1, 'ag-cp-4e').blocks[0].body.filter((p) => p.text).map((p) => p.text.ro);
    expect(texts.join(' ')).not.toContain('x_1,x_2');
    expect(texts.join(' ')).toContain('pe ce mulțime de noduri aplici regula');
  });
  it('ag-cp-6d keeps the single crossing as a supposition the team proves, in a whole Romanian sentence', () => {
    expect(stepOf(ag1, 'ag-cp-6d').blocks[0].text.ro.startsWith(
      'Presupune că drumul de înlocuire trece o singură dată între cele două bucăți (Tema 1, problema 2 cere să arăți că se poate: asta e demonstrația echipei).',
    )).toBe(true);
  });
});

describe('every figure and cardlinks in the shipped lessons', () => {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.json') && p.includes('/courses/')) files.push(p);
    }
  };
  walk(join(ROOT, 'src/content'));
  it('passes the same checks the validator script runs', () => {
    let figures = 0;
    let menus = 0;
    for (const f of files) {
      const course = JSON.parse(readFileSync(f, 'utf8'));
      if (!Array.isArray(course.steps)) continue;
      const ctx = { stepIds: course.steps.map((s) => s.id) };
      const visit = (o) => {
        if (Array.isArray(o)) o.forEach(visit);
        else if (o && typeof o === 'object') {
          if (o.figure && typeof o.figure === 'object') { figures++; expect(figureError(o.figure), f).toBeNull(); }
          if (o.cardlinks) { menus++; expect(partError({ cardlinks: o.cardlinks }, ctx), f).toBeNull(); }
          Object.values(o).forEach(visit);
        }
      };
      visit(course.steps);
    }
    expect(figures).toBeGreaterThanOrEqual(1);
    expect(menus).toBeGreaterThanOrEqual(1);
  });
});
