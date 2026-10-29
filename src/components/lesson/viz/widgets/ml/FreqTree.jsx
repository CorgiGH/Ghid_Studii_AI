import React from 'react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { freqTree } from '../../logic/ml/freqTree.js';
import { group, loc } from '../../logic/ml/probFormat.js';
import { Stat } from './probWidgets.jsx';
import './probWidgets.css';
import './freqTree.css';

function Node({ nd, label, lang }) {
  const d = (x) => loc(x, lang);
  const mark = nd.id === 'root' ? 'population' : `node-${nd.id}`;
  return (
    <div className={`mlf-node${nd.shown ? '' : ' hidden'}${nd.hl ? ' hl' : ''}`} data-node={nd.id}>
      {nd.edge !== null && <span className="mlf-edge" data-mark={`edge-${nd.id}`} data-value={nd.edge}>× {d(nd.edge)}</span>}
      <span className="mlf-label">{label}</span>
      {nd.shown
        ? <b className="mlf-count" data-mark={mark} data-value={nd.count}>{group(nd.count)}</b>
        : <b className="mlf-count q" aria-label="?">?</b>}
      {nd.product !== null && <span className="mlf-prod" data-mark={`prod-${nd.id}`} data-value={nd.product}>= {d(nd.product)}</span>}
    </div>
  );
}

// The picture and the caption of one frame, from the logic module only.
export function FreqTreeBody({ props, stepper }) {
  const { t, lang } = useApp();
  const l = lang === 'en' ? 'en' : 'ro';
  const L = freqTree(props);
  const f = L.frame(stepper.step);
  const by = Object.fromEntries(f.nodes.map((nd) => [nd.id, nd]));
  const lab = (k) => props.labels[k][l];
  const m = Object.fromEntries(f.marks.map((x) => [x.id, x.value]));
  return (
    <VizFrame widget="ml-freq-tree" stepper={stepper} caption={t(f.caption.en, f.caption.ro)} label={t('A probability tree with counts of people', 'Un arbore de probabilități cu numere de persoane')}>
      <div className="mlw mlf" data-step={f.step} data-kind={f.kind}>
        <div className="mlw-stats">
          <Stat id="given-prior" value={m['given-prior']} shown={loc(m['given-prior'], l)} label={t(`share ${lab('sick')}`, `ponderea celor ${lab('sick')}`)} />
          <Stat id="given-sens" value={m['given-sens']} shown={loc(m['given-sens'], l)} label={t(`${lab('pos')} among ${lab('sick')}`, `${lab('pos')} dintre ${lab('sick')}`)} />
          <Stat id="given-fpr" value={m['given-fpr']} shown={loc(m['given-fpr'], l)} label={t(`${lab('pos')} among ${lab('healthy')}`, `${lab('pos')} dintre ${lab('healthy')}`)} />
        </div>
        <div className="mlw-scroll">
          <div className="mlf-tree">
            <Node nd={by.root} label={lab('people')} lang={l} />
            <div className="mlf-branches">
              <div className="mlf-branch">
                <Node nd={by.sick} label={lab('sick')} lang={l} />
                <div className="mlf-leaves">
                  <Node nd={by.sickPos} label={lab('pos')} lang={l} />
                  <Node nd={by.sickNeg} label={lab('neg')} lang={l} />
                </div>
              </div>
              <div className="mlf-branch">
                <Node nd={by.healthy} label={lab('healthy')} lang={l} />
                <div className="mlf-leaves">
                  <Node nd={by.healthyPos} label={lab('pos')} lang={l} />
                  <Node nd={by.healthyNeg} label={lab('neg')} lang={l} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {f.step >= 7 && (
          <div className="mlw-stats">
            <Stat id="positives" value={m.positives} shown={group(m.positives)} label={lab('pos')} />
            {m['positive-prob'] !== undefined && <Stat id="positive-prob" value={m['positive-prob']} shown={loc(m['positive-prob'], l)} label={t(`share ${lab('pos')}`, `ponderea celor ${lab('pos')}`)} />}
            <Stat id="fraction" value={m.fraction} shown={m.fraction.split('/').map(group).join('/')} label={t('fraction', 'fracția')} />
            <Stat id="posterior" value={m.posterior} shown={loc(m.posterior, l)} label={`${t('result', 'rezultat')}`} keyed />
          </div>
        )}
      </div>
    </VizFrame>
  );
}

export default function FreqTree({ props, predict }) {
  const L = freqTree(props);
  const s = useStepper(L.n, { predict });
  return <FreqTreeBody props={props} stepper={s} />;
}
