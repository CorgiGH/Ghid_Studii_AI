import React, { useRef, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper } from '../kit.js';
import { VizFrame, MiniTable, Wires } from '../ui.jsx';
import { mapWire, tableMap } from '../logic/table-map.js';
import { tr } from '../logic/common.js';

export default function TableMap({ props, predict }) {
  const { t, lang } = useApp();
  const m = tableMap(props);
  const s = useStepper(3, { predict });
  const box = useRef(null);
  const [fired, setFired] = useState(null); // row whose key the learner clicked
  const fromCols = Object.keys(m.fromRows[0] || {});
  const toCols = ['nr_matricol', 'nume', 'prenume'];
  const showPick = s.step >= 1;
  const showWire = s.step >= 2;
  const wire = showWire ? mapWire(m, fired) : null;
  const pairs = wire ? [wire] : [];
  const srcRow = wire ? wire.row : m.pick;
  // Clicking a key cell fires the arrow: it unlocks a predict frame and jumps to the arrow step.
  const fire = (i) => { setFired(i); if (s.predicting) s.reveal(); s.goto(2); };
  const keyButton = (i, c) => (c === m.fromCol && !showWire
    ? { label: t(`Follow ${m.fromCol} ${props.answerKey} into ${m.toTable}`, `Urmărește ${m.fromCol} ${props.answerKey} în ${m.toTable}`), onClick: () => fire(i) }
    : null);
  const caption = [
    <>{tr(props.question, lang)} <span className="viz-dim">{t(`Rows of ${m.fromTable} with the same key: ${m.fromRows.length}. Click a ${m.fromCol} to follow it.`, `Rânduri din ${m.fromTable} cu aceeași cheie: ${m.fromRows.length}. Apasă pe un ${m.fromCol} ca să-l urmărești.`)}</span></>,
    t(`This is the row. Its ${m.fromCol} is ${props.answerKey}: a value that points into ${m.toTable}.`, `Acesta este rândul. ${m.fromCol} este ${props.answerKey}: o valoare care trimite în ${m.toTable}.`),
    t(`${m.toTable} holds the same value in ${m.toCol}. That row is the answer: ${m.target ? `${m.target.nume} ${m.target.prenume}` : ''}.`, `${m.toTable} are aceeași valoare în ${m.toCol}. Rândul acela este răspunsul: ${m.target ? `${m.target.nume} ${m.target.prenume}` : ''}.`),
  ][s.step];
  return (
    <VizFrame widget="table-map" stepper={{ ...s, reset: () => { setFired(null); s.reset(); } }} caption={caption} label={t('Following a key from one table to another', 'Urmărim o cheie dintr-un tabel în altul')}>
      <div className="viz-split viz-wirebox" ref={box}>
        <MiniTable
          caption={<><b>{m.fromTable}</b> <span className="viz-dim">({t('rows of this student', 'rândurile acestui student')})</span></>}
          columns={fromCols} rows={m.fromRows} wirePrefix="from" highlightCols={[m.fromCol]}
          rowClass={(i) => (showPick && i === srcRow ? 'pick' : showPick ? 'dim' : '')}
          cellButton={keyButton}
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
