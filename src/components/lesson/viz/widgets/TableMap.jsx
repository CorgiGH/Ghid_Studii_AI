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
  const about = m.about.map(([c, v]) => `${c} ${v}`).join(', ');
  const whereText = Object.entries(props.where || {}).map(([c, v]) => `${c} = ${v}`).join(', ');
  const name = (r) => (r ? `${r.nume} ${r.prenume}` : '');
  // Clicking a key cell fires the arrow from that row: it unlocks a predict frame and jumps to the arrow step.
  // After a wrong row the keys stay clickable, so the learner can follow the asked row next.
  const fire = (i) => { setFired(i); if (s.predicting) s.reveal(); s.goto(2); };
  const keyButton = (i, c) => (c === m.fromCol && (!showWire || (wire && !wire.hit))
    ? { label: t(`Follow ${m.fromCol} ${m.fromRows[i][m.fromCol]} into ${m.toTable}`, `Urmărește ${m.fromCol} ${m.fromRows[i][m.fromCol]} în ${m.toTable}`), onClick: () => fire(i) }
    : null);
  const key = wire ? m.fromRows[wire.row][m.fromCol] : '';
  const caption = [
    <>{tr(props.question, lang)} <span className="viz-dim">{t(`Each row carries the ${m.fromCol} of one student. Click the ${m.fromCol} of the row the question is about (${about}).`, `Fiecare rând poartă ${m.fromCol} al unui student. Apasă pe ${m.fromCol} din rândul despre care întreabă (${about}).`)}</span></>,
    t(`This is the row: ${about}. Its ${m.fromCol} is ${props.answerKey}: a value that points into ${m.toTable}.`, `Acesta este rândul: ${about}. ${m.fromCol} este ${props.answerKey}: o valoare care trimite în ${m.toTable}.`),
    wire && !wire.hit
      ? t(`This row has ${m.fromCol} ${key}, which leads to ${name(wire.student)}. The question is about the row with ${about}: click its ${m.fromCol}.`, `Rândul acesta are ${m.fromCol} ${key} și duce la ${name(wire.student)}. Întrebarea e despre rândul cu ${about}: apasă pe ${m.fromCol}-ul lui.`)
      : t(`${m.toTable} holds the same ${props.answerKey} in ${m.toCol}. That row is the answer: ${name(m.target)}.`, `${m.toTable} are același ${props.answerKey} în ${m.toCol}. Rândul acela este răspunsul: ${name(m.target)}.`),
  ][s.step];
  const fromCaption = props.fromCaption ? tr(props.fromCaption, lang) : whereText;
  return (
    <VizFrame widget="table-map" stepper={{ ...s, reset: () => { setFired(null); s.reset(); } }} caption={caption} label={t('Following a key from one table to another', 'Urmărim o cheie dintr-un tabel în altul')}>
      <div className="viz-split viz-wirebox" ref={box}>
        <MiniTable
          caption={<><b>{m.fromTable}</b>{fromCaption && <> <span className="viz-dim">({fromCaption})</span></>}</>}
          columns={fromCols} rows={m.fromRows} wirePrefix="from" highlightCols={[m.fromCol]}
          rowClass={(i) => (showPick && i === srcRow ? 'pick' : showPick ? 'dim' : '')}
          cellButton={keyButton}
        />
        <MiniTable
          caption={<b>{m.toTable}</b>}
          columns={toCols} rows={m.toRows} wirePrefix="to" highlightCols={[m.toCol]}
          rowClass={(i, r) => (wire && r === wire.student ? 'pick' : showWire ? 'dim' : '')}
        />
        <Wires boxRef={box} pairs={pairs} />
      </div>
    </VizFrame>
  );
}
