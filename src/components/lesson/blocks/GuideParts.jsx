// What the steps card, the rule card and a reflect answer have in common: the parts (paragraph, formula, condition line,
// list, table) and the numbered steps with their result line. Shapes in guideSpec.js.
import React, { useLayoutEffect, useRef } from 'react';
import katex from 'katex';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../../blocks/formatMarkdown';
import QuestionTables from './QuestionTables.jsx';

const html = (s) => ({ __html: formatMarkdown(s) });

// Numbered steps, each number in a small accent circle; `start` keeps the numbers of an example split over two screens.
export function StepList({ items, start = 1 }) {
  const { t } = useApp();
  return (
    <ol className="ch-steps-list" start={start}>
      {items.map((it, i) => (
        <li key={i} className="ch-step">
          <span className="ch-step-n" aria-hidden="true">{start + i}</span>
          <span className="ch-step-text" dangerouslySetInnerHTML={html(t(it.en, it.ro))} />
        </li>
      ))}
    </ol>
  );
}

export function ResultLine({ result }) {
  const { t } = useApp();
  return <p className="ch-steps-result" data-testid="steps-result" dangerouslySetInnerHTML={html(t(result.en, result.ro))} />;
}

// One card's worth of steps: intro parts, the numbered steps, the result line.
export function StepsBody({ intro, items, start, result }) {
  return (
    <>
      {intro && <Parts parts={intro} />}
      {items && <StepList items={items} start={start} />}
      {result && <ResultLine result={result} />}
    </>
  );
}

// Consecutive formulas and the condition lines between them share one panel, so a rule's formulas read as one stack.
function groupParts(parts) {
  const out = [];
  for (const p of parts) {
    const mathy = 'tex' in p || 'note' in p;
    const last = out[out.length - 1];
    if (mathy && last?.math) last.parts.push(p);
    else out.push(mathy ? { math: true, parts: [p] } : p);
  }
  return out;
}

// A panel formula is set in display style but as inline math, so a formula wider than a phone breaks after a relation or an
// operator (=, <, ⇒, +) onto a second centred line instead of scrolling sideways. One that still does not fit (an aligned block,
// a long \text) is set smaller until it does, down to 70%; past that it scrolls. Only a width change refits.
const inlineTex = (tex) => katex.renderToString(`\\displaystyle ${tex}`, { displayMode: false, throwOnError: false, output: 'htmlAndMathml' });
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// A formula that is mostly a phrase ("\text{tai nodul cu cea mai mare } acc_{val}...") cannot break inside its \text, so its
// top-level \text groups are set as words in KaTeX's own font, which wrap like a sentence; the math between them stays math.
// Returns null when no \text group holds a phrase of three words or more, or a group holds anything but plain words.
export function phraseParts(tex) {
  const out = [];
  let i = 0, from = 0, depth = 0;
  while (i < tex.length) {
    if (depth === 0 && tex.startsWith('\\text{', i)) {
      let j = i + 6, d = 1;
      while (j < tex.length && d) { if (tex[j] === '{') d++; else if (tex[j] === '}') d--; j++; }
      const words = tex.slice(i + 6, j - 1);
      if (/[\\$^_{}]/.test(words)) return null;
      if (from < i) out.push({ math: tex.slice(from, i) });
      out.push({ text: words });
      i = j; from = j; continue;
    }
    if (tex[i] === '\\') { i += 2; continue; }
    // a \text inside braces or brackets ("acc_{val}(\text{după tăiere})") belongs to the math around it
    if ('{(['.includes(tex[i])) depth++; else if ('})]'.includes(tex[i])) depth--;
    i++;
  }
  if (from < tex.length) out.push({ math: tex.slice(from) });
  return out.some((p) => p.text && p.text.trim().split(/\s+/).length >= 3) ? out : null;
}

const panelTex = (tex) => {
  const parts = phraseParts(tex);
  if (!parts) return { __html: inlineTex(tex) };
  return { __html: parts.map((p) => (p.text !== undefined ? `<span class="ch-math-words">${esc(p.text)}</span>`
    : /^(\s|\\[ ,;:!]|\\q?quad)*$/.test(p.math) ? ' ' : inlineTex(p.math))).join('') };
};

function useFitFormulas(ref) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let width = -1;
    const fit = () => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      for (const wrap of el.querySelectorAll('.ch-math-tex')) {
        const k = wrap.querySelector('.katex');
        if (!k) continue;
        k.style.fontSize = '';
        const over = wrap.scrollWidth / wrap.clientWidth;
        if (over > 1.01) k.style.fontSize = `${(parseFloat(getComputedStyle(k).fontSize) * Math.max(0.7, 0.98 / over)).toFixed(1)}px`;
      }
    };
    fit();
    // KaTeX's fonts may still be loading at the first fit: measure again once they are in
    let live = true;
    document.fonts?.ready.then(() => { if (live) { width = -1; fit(); } });
    if (typeof ResizeObserver === 'undefined') return () => { live = false; };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => { live = false; ro.disconnect(); };
  }, [ref]);
}

function MathPanel({ parts }) {
  const { t } = useApp();
  const ref = useRef(null);
  useFitFormulas(ref);
  return (
    <div className="ch-math" ref={ref}>
      {parts.map((q, j) => ('tex' in q
        ? <div key={j} className="ch-math-tex" dangerouslySetInnerHTML={panelTex(q.tex)} />
        : <p key={j} className="ch-math-note" dangerouslySetInnerHTML={html(t(q.note.en, q.note.ro))} />))}
    </div>
  );
}

export function Parts({ parts }) {
  const { t } = useApp();
  const tr = (v) => t(v.en, v.ro);
  return groupParts(parts).map((p, i) => {
    if (p.math) return <MathPanel key={i} parts={p.parts} />;
    if ('text' in p) return <p key={i} className="ch-part-text" dangerouslySetInnerHTML={html(tr(p.text))} />;
    if ('heading' in p) return <p key={i} className="ch-part-heading" dangerouslySetInnerHTML={html(tr(p.heading))} />;
    if ('points' in p) {
      return (
        <ul key={i} className="ch-points">
          {p.points.map((q, j) => <li key={j} dangerouslySetInnerHTML={html(tr(q))} />)}
        </ul>
      );
    }
    if ('steps' in p) return <StepList key={i} items={p.steps} />;
    if ('table' in p) return <div key={i} className="ch-part-table"><QuestionTables table={p.table} /></div>;
    return null;
  });
}
