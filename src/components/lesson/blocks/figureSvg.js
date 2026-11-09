// The `figure` of the lesson player: a small inline SVG picture, typed into the lesson JSON, checked and re-written here before it
// reaches the page (no React, no DOM: a plain tokenizer, so the validator script, the tests and the browser all run the same code).
//
//   figure: { svg: string | { en, ro }, alt: { en, ro }, caption?: { en, ro } }
//     as a part of a steps or rule card ({ figure: {...} }), as a block field on calc-exercise, mcq, reflect and proof-steps, and on
//     a proof-steps step (steps[k].figure replaces the block's picture while step k is the latest one shown).
//
// What the SVG may hold (anything else is an error, and the sanitiser drops it as well):
//   tags        svg g path line polyline polygon circle ellipse rect text tspan defs marker title
//   attributes  geometry (x y x1 y1 x2 y2 cx cy r rx ry width height dx dy d points transform viewBox), text-anchor, dominant-baseline,
//               font-size, font-weight, stroke-width, stroke-dasharray, stroke-linecap, stroke-linejoin, opacity, id, class,
//               marker-start / marker-end ("url(#id)" of a marker inside the same SVG), marker geometry, fill="none", stroke="none"
//   no          script, style, foreignObject, image, use, a, on* attributes, external references, colour values, comments
//   viewBox     "0 0 W H" style, width at most 400, so a phone shows it at about its own size
//   text        every text has an effective font-size (its own, a parent's, or the 14 the page gives, times every scale() on it and
//               its ancestors) of at least 13 viewBox units, and of at least 13 px on a 390 px phone, where the picture is 324 px
//               wide (index.css lets .lf-fig reach the card's edges there): size × 324 / viewBox width >= 13. No text inside a marker.
//   ids         rewritten with a prefix per figure on the page (sanitizeSvg), so two figures never share an id or a marker
//   colours     only through classes, mapped to the theme in index.css (.lf-fig): fg muted accent ok bad warn (stroke of a shape, colour
//               of a text) and fill-fg fill-muted fill-accent fill-ok fill-bad fill-warn fill-bg fill-soft (fill of a shape or text)

export const FIGURE_TAGS = ['svg', 'g', 'path', 'line', 'polyline', 'polygon', 'circle', 'ellipse', 'rect', 'text', 'tspan', 'defs', 'marker', 'title'];
const TAGS = new Set(FIGURE_TAGS);
export const COLOR_NAMES = ['fg', 'muted', 'accent', 'ok', 'bad', 'warn'];
export const FIGURE_CLASSES = [...COLOR_NAMES, ...COLOR_NAMES.map((c) => `fill-${c}`), 'fill-bg', 'fill-soft'];
const CLASSES = new Set(FIGURE_CLASSES);
export const MAX_VIEWBOX_WIDTH = 400;
export const MIN_FONT_SIZE = 13;
export const DEFAULT_FONT_SIZE = 14; // what index.css gives a text with no font-size
// The picture's width in px on a 390 px phone: 390 - 2 × 16 (page) - 2 × 17 (card), the figure reaching the card's edges.
export const PHONE_FIGURE_WIDTH = 324;
export const MIN_FONT_PX = 13;
const MAX_SVG_LENGTH = 24000;
const MAX_NODES = 400;

const NUM = '-?(?:\\d+\\.?\\d*|\\.\\d+)';
const NUMBER = new RegExp(`^${NUM}$`);
const NUMBER_LIST = new RegExp(`^${NUM}(?:[\\s,]+${NUM})*$`);
const URL_REF = /^url\(#([A-Za-z][\w-]*)\)$/;

const numeric = (v) => NUMBER.test(v);
const numberList = (v) => NUMBER_LIST.test(v);
const oneOf = (...list) => (v) => list.includes(v);

// How much a transform shrinks or grows text: the product of its scale() factors (the smaller one of a two-factor scale).
// translate and rotate keep the size.
export function transformScale(v) {
  let k = 1;
  if (typeof v !== 'string') return k;
  for (const m of v.matchAll(/scale\(([^)]*)\)/g)) {
    const f = m[1].trim().split(/[\s,]+/).map((x) => Math.abs(Number(x))).filter(Number.isFinite);
    if (f.length) k *= Math.min(...f);
  }
  return k;
}

const ATTR = {
  x: numberList, y: numberList, dx: numberList, dy: numberList, x1: numeric, y1: numeric, x2: numeric, y2: numeric, cx: numeric, cy: numeric,
  r: numeric, rx: numeric, ry: numeric, width: numeric, height: numeric, refX: numeric, refY: numeric,
  markerWidth: numeric, markerHeight: numeric, 'stroke-width': numeric, opacity: numeric, 'font-size': numeric,
  d: (v) => /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s-]+$/.test(v),
  points: numberList,
  transform: (v) => new RegExp(`^(?:(?:translate|rotate|scale)\\(\\s*${NUM}(?:[\\s,]+${NUM}){0,2}\\s*\\)\\s*)+$`).test(v),
  'text-anchor': oneOf('start', 'middle', 'end'),
  'dominant-baseline': oneOf('middle', 'central', 'hanging', 'auto'),
  'font-weight': oneOf('400', '500', '600', '700', 'normal', 'bold'),
  'stroke-dasharray': numberList,
  'stroke-linecap': oneOf('round', 'butt', 'square'),
  'stroke-linejoin': oneOf('round', 'miter', 'bevel'),
  fill: oneOf('none'),
  stroke: oneOf('none'),
  id: (v) => /^[A-Za-z][\w-]*$/.test(v),
  orient: (v) => v === 'auto' || v === 'auto-start-reverse' || numeric(v),
  markerUnits: oneOf('strokeWidth', 'userSpaceOnUse'),
  'marker-start': (v) => URL_REF.test(v),
  'marker-end': (v) => URL_REF.test(v),
};
// viewBox only on svg and marker; class everywhere; xmlns only on svg (dropped on output: inline SVG needs none)
const EXTRA = { svg: ['viewBox', 'xmlns', 'class'], marker: ['viewBox', 'class'] };
const XMLNS = 'http://www.w3.org/2000/svg';
const TEXTY = new Set(['text', 'tspan', 'title']);

const ENTITY = /&(?:amp|lt|gt|quot|apos|#\d{1,5});/y;

// ---- the tokenizer ------------------------------------------------------------------------------------------------------------

// Parses the SVG text into { root, errors }. Every problem is collected; a node that cannot be read ends the parse.
export function parseSvg(src) {
  const errors = [];
  const fail = (m) => { errors.push(m); return { root: null, errors }; };
  if (typeof src !== 'string' || !src.trim()) return fail('svg must be a non-empty string');
  if (src.length > MAX_SVG_LENGTH) return fail(`svg is longer than ${MAX_SVG_LENGTH} characters`);
  let i = 0;
  let nodes = 0;
  const stack = [];
  let root = null;
  const n = src.length;

  const ws = () => { while (i < n && /\s/.test(src[i])) i++; };
  const addChild = (node) => {
    if (++nodes > MAX_NODES) return false;
    if (stack.length) stack[stack.length - 1].children.push(node);
    else if (!root && node.tag) root = node;
    else return false;
    return true;
  };

  while (i < n) {
    if (src[i] !== '<') {
      // text: only inside text, tspan and title; whitespace between other tags is dropped
      let j = src.indexOf('<', i);
      if (j < 0) j = n;
      const raw = src.slice(i, j);
      const top = stack[stack.length - 1];
      if (raw.trim()) {
        if (!top || !TEXTY.has(top.tag)) return fail(`text "${raw.trim().slice(0, 20)}" outside a text, tspan or title element`);
        for (let k = 0; k < raw.length; k++) {
          if (raw[k] === '>') return fail('a ">" inside text must be written &gt;');
          if (raw[k] === '&') {
            ENTITY.lastIndex = k;
            if (!ENTITY.test(raw)) return fail('an & inside text must be one of &amp; &lt; &gt; &quot; &apos; or &#N;');
          }
        }
        top.children.push({ text: raw });
      } else if (top && TEXTY.has(top.tag) && raw) top.children.push({ text: raw });
      i = j;
      continue;
    }
    if (src.startsWith('<!', i) || src.startsWith('<?', i)) return fail('comments, CDATA, doctype and processing instructions are not allowed');
    if (src[i + 1] === '/') {
      const m = /^<\/([A-Za-z][\w-]*)\s*>/.exec(src.slice(i, i + 64));
      if (!m) return fail('a closing tag is malformed');
      const top = stack.pop();
      if (!top || top.tag !== m[1]) return fail(`</${m[1]}> does not close ${top ? `<${top.tag}>` : 'anything'}`);
      i += m[0].length;
      continue;
    }
    // an opening tag
    i++;
    const nm = /^[A-Za-z][\w:-]*/.exec(src.slice(i, i + 40));
    if (!nm) return fail('a tag has no name');
    const tag = nm[0];
    i += tag.length;
    if (!TAGS.has(tag)) return fail(`<${tag}> is not allowed (allowed: ${FIGURE_TAGS.join(', ')})`);
    const attrs = {};
    let self = false;
    for (;;) {
      ws();
      if (i >= n) return fail(`<${tag}> is not closed`);
      if (src[i] === '>') { i++; break; }
      if (src.startsWith('/>', i)) { self = true; i += 2; break; }
      const am = /^([A-Za-z][\w:-]*)\s*=\s*("([^"<>]*)"|'([^'<>]*)')/.exec(src.slice(i, i + 4000));
      if (!am) return fail(`<${tag}> has an attribute that is not name="value"`);
      const name = am[1];
      const value = am[3] !== undefined ? am[3] : am[4];
      if (/^on/i.test(name)) return fail(`<${tag}> has an event attribute ${name}`);
      if (name in attrs) return fail(`<${tag}> repeats ${name}`);
      attrs[name] = value;
      i += am[0].length;
    }
    const node = { tag, attrs, children: [] };
    if (!addChild(node)) return fail(root && !stack.length ? 'the svg has more than one root element' : `the svg has more than ${MAX_NODES} elements`);
    if (!self) stack.push(node);
  }
  if (stack.length) return fail(`<${stack[stack.length - 1].tag}> is not closed`);
  if (!root) return fail('svg has no element');
  if (root.tag !== 'svg') return fail('the root element must be <svg>');
  return { root, errors };
}

// ---- checking ------------------------------------------------------------------------------------------------------------------

function attrErrors(node, push) {
  const { tag, attrs } = node;
  for (const [name, value] of Object.entries(attrs)) {
    const at = `<${tag}> ${name}`;
    if (name === 'class') {
      const bad = value.split(/\s+/).filter((c) => c && !CLASSES.has(c));
      if (bad.length) push(`${at}: class "${bad.join(' ')}" is not one of ${FIGURE_CLASSES.join(' ')}`);
    } else if (name === 'viewBox') {
      if (!EXTRA[tag]?.includes('viewBox')) push(`${at} belongs to svg or marker`);
      else if (!/^\s*-?[\d.]+(?:[\s,]+-?[\d.]+){3}\s*$/.test(value)) push(`${at}: needs four numbers`);
    } else if (name === 'xmlns') {
      if (tag !== 'svg' || value !== XMLNS) push(`${at}: only xmlns="${XMLNS}" on the svg`);
    } else if (!(name in ATTR)) {
      push(`${at} is not an allowed attribute`);
    } else if (!ATTR[name](value)) {
      push(`${at}="${value.slice(0, 30)}" is not an allowed value`);
    }
  }
}

// Every problem of one SVG string; empty means it is safe and follows the rules above.
export function svgErrors(src) {
  const { root, errors: parseErrs } = parseSvg(src);
  if (!root) return parseErrs;
  const errs = [];
  const push = (m) => { if (errs.length < 12) errs.push(m); };
  const ids = new Set();
  const refs = [];
  const vb = root.attrs.viewBox;
  let vbWidth = null;
  if (vb === undefined) push('<svg> needs a viewBox');
  else {
    const p = vb.trim().split(/[\s,]+/).map(Number);
    if (p.length === 4 && p.every(Number.isFinite)) {
      if (p[2] <= 0 || p[3] <= 0) push('viewBox width and height must be positive');
      else vbWidth = p[2];
      if (p[2] > MAX_VIEWBOX_WIDTH) push(`viewBox width ${p[2]} is over ${MAX_VIEWBOX_WIDTH}`);
    }
  }
  // the smallest size a text may have in viewBox units: 13, and more for a wide viewBox so it still shows at 13 px on a phone
  const minSize = vbWidth ? Math.max(MIN_FONT_SIZE, (MIN_FONT_PX * vbWidth) / PHONE_FIGURE_WIDTH) : MIN_FONT_SIZE;
  const round = (x) => Math.round(x * 100) / 100;
  const walk = (node, fontSize, scale, inMarker) => {
    if (node.tag === 'svg' && node !== root) push('svg inside svg is not allowed');
    attrErrors(node, push);
    const own = node.attrs['font-size'];
    const size = own !== undefined && numeric(own) ? Number(own) : fontSize;
    const k = scale * transformScale(node.attrs.transform);
    if (node.tag === 'text' || node.tag === 'tspan') {
      if (inMarker) push(`<${node.tag}> inside a <marker> is not allowed (a marker resizes what it holds)`);
      const eff = size * k;
      if (eff < minSize) {
        const how = k === 1 ? `font-size ${size}` : `font-size ${size} at scale ${round(k)} (${round(eff)})`;
        push(eff < MIN_FONT_SIZE
          ? `<${node.tag}> ${how} is under ${MIN_FONT_SIZE} viewBox units`
          : `<${node.tag}> ${how} shows under ${MIN_FONT_PX} px on a phone: a ${vbWidth}-wide viewBox needs at least ${round(minSize)}`);
      }
    }
    if (node.attrs.id) { if (ids.has(node.attrs.id)) push(`id "${node.attrs.id}" is used twice`); ids.add(node.attrs.id); }
    for (const a of ['marker-start', 'marker-end']) {
      const m = node.attrs[a] && URL_REF.exec(node.attrs[a]);
      if (m) refs.push(m[1]);
    }
    if (node.tag === 'marker' && !node.attrs.id) push('<marker> needs an id');
    for (const c of node.children) {
      if (c.tag) {
        if (['text', 'tspan'].includes(node.tag) && c.tag !== 'tspan') push(`<${c.tag}> inside <${node.tag}>`);
        walk(c, size, k, inMarker || node.tag === 'marker');
      }
    }
  };
  walk(root, DEFAULT_FONT_SIZE, 1, false);
  for (const r of refs) if (!ids.has(r)) push(`marker "#${r}" is not defined in this svg`);
  return errs;
}

const isStr = (v) => typeof v === 'string' && v.trim() !== '';
const isBi = (v) => !!v && typeof v === 'object' && isStr(v.en) && isStr(v.ro);

// The svg of a figure in one language (a string serves both).
export const svgOf = (fig, lang) => (typeof fig.svg === 'string' ? fig.svg : (lang === 'ro' ? fig.svg.ro : fig.svg.en));

// The problem with one figure object, or null.
export function figureError(fig) {
  if (!fig || typeof fig !== 'object' || Array.isArray(fig)) return 'a figure must be an object { svg, alt, caption? }';
  const extra = Object.keys(fig).filter((k) => !['svg', 'alt', 'caption'].includes(k));
  if (extra.length) return `a figure has svg, alt and caption only (found ${extra.join(', ')})`;
  if (!isBi(fig.alt)) return 'a figure needs alt with en + ro (what the picture shows, in words)';
  if (fig.caption !== undefined && !isBi(fig.caption)) return 'figure caption must have en + ro';
  const variants = typeof fig.svg === 'string' ? [fig.svg] : (isBi(fig.svg) ? [fig.svg.en, fig.svg.ro] : null);
  if (!variants) return 'figure svg must be a string or { en, ro }';
  for (const s of variants) {
    const e = svgErrors(s);
    if (e.length) return `figure svg: ${e[0]}${e.length > 1 ? ` (+${e.length - 1} more)` : ''}`;
  }
  return null;
}

// ---- writing it back --------------------------------------------------------------------------------------------------------------

const esc = (s) => s.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d{1,5});)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function emit(node, root, label, prefix) {
  const parts = [];
  for (const [name, value] of Object.entries(node.attrs)) {
    if (name === 'xmlns') continue;
    if (name === 'class') {
      const keep = value.split(/\s+/).filter((c) => CLASSES.has(c));
      if (keep.length) parts.push(`class="${keep.join(' ')}"`);
    } else if (name === 'viewBox' ? EXTRA[node.tag]?.includes('viewBox') : (name in ATTR && ATTR[name](value))) {
      // ids live in the whole page: each one, and each url(#id) pointing at it, gets this figure's prefix
      const v = name === 'id' ? `${prefix}-${value}`
        : (name === 'marker-start' || name === 'marker-end') ? `url(#${prefix}-${URL_REF.exec(value)[1]})` : value;
      parts.push(`${name}="${escAttr(v)}"`);
    }
  }
  if (root) parts.push('role="img"', 'focusable="false"', `aria-label="${escAttr(label || '')}"`);
  const inner = node.children.map((c) => (c.tag ? emit(c, false, '', prefix) : esc(c.text))).join('');
  return `<${node.tag}${parts.length ? ` ${parts.join(' ')}` : ''}>${inner}</${node.tag}>`;
}

// A prefix that is a valid start of an id: letters, digits, _ and - only, starting with a letter.
const idPrefix = (p) => {
  const clean = String(p ?? '').replace(/[^A-Za-z0-9_-]/g, '');
  return /^[A-Za-z]/.test(clean) ? clean : `fig${clean}`;
};

// The safe markup for one SVG string: '' when it does not pass svgErrors (a figure never half-renders), otherwise the tree
// written back from the parse with only allowed tags, attributes and classes, role="img" and the alt text as aria-label.
// prefix: unique per figure on the page (Figure passes one from useId); every id becomes "<prefix>-<id>" and every marker
// url(#id) follows it, so two figures on one screen, or the leaving and the entering screen, never resolve each other's ids,
// and no figure id can match an id of the page (an id "root" becomes "<prefix>-root").
export function sanitizeSvg(src, alt = '', prefix = 'fig') {
  if (svgErrors(src).length) return '';
  const { root } = parseSvg(src);
  return emit(root, true, alt, idPrefix(prefix));
}
