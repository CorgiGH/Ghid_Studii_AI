// Numbers for ML widget captions. A "fact" is one number the widget shows: it has a canonical text (dot decimal, what a
// mark carries in data-value) and the text a learner reads in each language (Romanian uses the decimal comma).
// A caption is built only from facts, so a test can strip every fact from it and find no digit left over.

const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
export const sup = (n) => [...String(n)].map((c) => SUP[c]).join('');
const trim = (s) => (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s);

// 4 significant digits, no trailing zeros; below 1e-4 as mantissa and power of ten.
export function canon(x, sig = 4) {
  if (x === 0) return '0';
  if (!Number.isFinite(x)) return x > 0 ? 'inf' : '-inf';
  if (Math.abs(x) >= 1e-4) {
    const s = trim(x.toPrecision(sig));
    return /e/.test(s) ? String(Number(s)) : s;
  }
  const [m, e] = x.toExponential(sig - 1).split('e');
  return `${trim(m)}e${Number(e)}`;
}

const MINUS = '−';
function textOf(c, lang) {
  if (c === 'inf') return '∞';
  if (c === '-inf') return `${MINUS}∞`;
  let s = c;
  if (/e/.test(c)) {
    const [m, e] = c.split('e');
    s = `${m}·10${sup(e)}`;
  }
  if (s.startsWith('-')) s = MINUS + s.slice(1);
  return lang === 'ro' ? s.replace('.', ',') : s;
}

// kind: 'num' (a measured value), 'count' (a whole number of items), 'pct', 'text' (shown as given, e.g. 1/30).
export function fact(value, o = {}) {
  const kind = o.kind || 'num';
  let c;
  let text;
  if (kind === 'text') {
    c = String(o.canon ?? value);
    text = { en: c, ro: c };
  } else if (kind === 'pct') {
    c = String(Math.round(value * 100));
    text = { en: `${c}%`, ro: `${c}%` };
  } else if (kind === 'count') {
    c = String(value);
    text = { en: c, ro: c };
  } else if (o.dec !== undefined) {
    c = trim(value.toFixed(o.dec));
    text = { en: textOf(c, 'en'), ro: textOf(c, 'ro') };
  } else {
    c = canon(value, o.sig || 4);
    text = { en: textOf(c, 'en'), ro: textOf(c, 'ro') };
  }
  return { value, canon: c, kind, text, label: o.label };
}

// Every text a fact can print as, longest first, for stripping.
export function allTexts(facts) {
  return [...new Set(facts.flatMap((f) => [f.text.en, f.text.ro]))].sort((a, b) => b.length - a.length);
}

// The caption with each fact's text removed; a digit left means a number that is not a fact.
export function stripFacts(caption, facts) {
  let s = caption;
  for (const t of allTexts(facts)) s = s.split(t).join('');
  return s;
}

// Collects the facts a caption uses: const u = used(); u.n(f, lang) -> text, u.list -> [fact]
export function used() {
  const list = [];
  return {
    list,
    n(f, lang) {
      if (!list.includes(f)) list.push(f);
      return f.text[lang];
    },
  };
}

// Builds {en, ro} from a template function (lang, n) -> string, recording the facts it used.
export function caption(build) {
  const u = used();
  return { caption: { en: build('en', (f) => u.n(f, 'en')), ro: build('ro', (f) => u.n(f, 'ro')) }, used: u.list };
}

export const isPlainFact = (f) => f && typeof f.canon === 'string' && f.text;
