// What the steps card, the rule card and a reflect answer have in common: the parts (paragraph, formula, condition line,
// list, table) and the numbered steps with their result line. Shapes in guideSpec.js.
import React from 'react';
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

export function Parts({ parts }) {
  const { t } = useApp();
  const tr = (v) => t(v.en, v.ro);
  return groupParts(parts).map((p, i) => {
    if (p.math) {
      return (
        <div key={i} className="ch-math">
          {p.parts.map((q, j) => ('tex' in q
            ? <div key={j} className="ch-math-tex" dangerouslySetInnerHTML={html(`$$${q.tex}$$`)} />
            : <p key={j} className="ch-math-note" dangerouslySetInnerHTML={html(tr(q.note))} />))}
        </div>
      );
    }
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
