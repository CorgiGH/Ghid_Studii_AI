import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { padEval } from '../../../ml/calc/answer.js';

// The keys: [label shown, text inserted]. log2(x), ln(x), x^2, sqrt(x) and fractions write the formula language the
// answers are checked with, so what is on the display is what is evaluated.
const KEYS = [
  ['log₂', 'log2('], ['ln', 'ln('], ['x²', '^2'], ['√', 'sqrt('], ['(', '('], [')', ')'],
  ['7', '7'], ['8', '8'], ['9', '9'], ['÷', '/'], ['a/b', '/'], ['C', null],
  ['4', '4'], ['5', '5'], ['6', '6'], ['×', '*'], ['−', '-'], ['⌫', 'back'],
  ['1', '1'], ['2', '2'], ['3', '3'], ['+', '+'], ['0', '0'], [',', '.'],
];

// One calculator state per screen, kept while the learner moves between exercises of the screen (and reopens the panel).
const memory = new Map();

export default function LogCalculator({ scopeKey }) {
  const { t } = useApp();
  const saved = memory.get(scopeKey);
  const [expr, setExpr] = useState(saved?.expr ?? '');
  const [out, setOut] = useState(saved?.out ?? '');

  const keep = (e, o) => { setExpr(e); setOut(o); memory.set(scopeKey, { expr: e, out: o }); };
  const press = (ins) => {
    if (ins === null) keep('', '');
    else if (ins === 'back') keep(expr.slice(0, -1), '');
    else keep(expr + ins, '');
  };
  const equals = () => {
    const r = padEval(expr);
    keep(expr, r.ok ? `= ${r.text.replace('.', ',')}` : t('Cannot compute that', 'Nu se poate calcula'));
  };

  return (
    <div className="ch-calc-pad" data-testid="calc-pad" role="group" aria-label={t('Calculator', 'Calculator')}>
      <input
        className="ch-calc-pad-in"
        value={expr}
        onChange={(e) => keep(e.target.value, '')}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); equals(); } }}
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        aria-label={t('Expression', 'Expresie')}
        data-testid="calc-pad-input"
      />
      <output className="ch-calc-pad-out" data-testid="calc-pad-out" aria-live="polite">{out}</output>
      <div className="ch-calc-keys">
        {KEYS.map(([label, ins], i) => (
          <button key={i} type="button" className="ch-calc-key" onClick={() => press(ins)} aria-label={label === 'a/b' ? t('fraction bar', 'linie de fracție') : undefined}>{label}</button>
        ))}
        <button type="button" className="ch-calc-key eq" onClick={equals} data-testid="calc-pad-eq">=</button>
      </div>
    </div>
  );
}
