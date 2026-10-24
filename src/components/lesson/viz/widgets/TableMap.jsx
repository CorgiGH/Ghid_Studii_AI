import React, { useRef } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper } from '../kit.js';
import { VizFrame, MiniTable, Wires } from '../ui.jsx';
import { tableMap } from '../logic/table-map.js';
import { tr } from '../logic/common.js';

export default function TableMap({ props, predict }) {
  const { t, lang } = useApp();
  const m = tableMap(props);
  const s = useStepper(3, { predict });
  const box = useRef(null);
  const fromCols = Object.keys(m.fromRows[0] || {});
  const toCols = ['nr_matricol', 'nume', 'prenume'];
  const showPick = s.step >= 1;
  const showWire = s.step >= 2;
  const pairs = showWire && m.target
    ? [{ id: 'k', from: `from:${m.pick}:${fromCols[fromCols.length - 1]}`, to: `to:${m.toRows.indexOf(m.target)}:${m.toCol}`, cls: 'keep' }]
    : [];
  const caption = [
    <>{tr(props.question, lang)} <span className="viz-dim">{t(`Rows of ${m.fromTable} with the same key: ${m.fromRows.length}.`, `Rânduri din ${m.fromTable} cu aceeași cheie: ${m.fromRows.length}.`)}</span></>,
    t(`This is the row. Its ${m.fromCol} is ${props.answerKey}: a value that points into ${m.toTable}.`, `Acesta este rândul. ${m.fromCol} este ${props.answerKey}: o valoare care trimite în ${m.toTable}.`),
    t(`${m.toTable} holds the same value in ${m.toCol}. That row is the answer: ${m.target ? `${m.target.nume} ${m.target.prenume}` : ''}.`, `${m.toTable} are aceeași valoare în ${m.toCol}. Rândul acela este răspunsul: ${m.target ? `${m.target.nume} ${m.target.prenume}` : ''}.`),
  ][s.step];
  return (
    <VizFrame widget="table-map" stepper={s} caption={caption} label={t('Following a key from one table to another', 'Urmărim o cheie dintr-un tabel în altul')}>
      <div className="viz-split viz-wirebox" ref={box}>
        <MiniTable
          caption={<><b>{m.fromTable}</b> <span className="viz-dim">({t('rows of this student', 'rândurile acestui student')})</span></>}
          columns={fromCols} rows={m.fromRows} wirePrefix="from" highlightCols={[m.fromCol]}
          rowClass={(i) => (showPick && i === m.pick ? 'pick' : showPick ? 'dim' : '')}
        />
        <MiniTable
          caption={<b>{m.toTable}</b>}
          columns={toCols} rows={m.toRows} wirePrefix="to" highlightCols={[m.toCol]}
          rowClass={(i, r) => (showWire && r === m.target ? 'pick' : showWire ? 'dim' : '')}
        />
        <Wires boxRef={box} pairs={pairs} />
      </div>
    </VizFrame>
  );
}
