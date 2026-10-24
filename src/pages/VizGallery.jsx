import React from 'react';
import VizBlock from '../components/lesson/blocks/VizBlock.jsx';
import { validateViz } from '../components/lesson/viz/vizSpec.js';
import SAMPLES from './vizGalleryData.js';

// Dev-only (App.jsx loads it only when import.meta.env.DEV): every visual widget on one page.
// /?viz-gallery shows all, /?viz-gallery=join-wires one widget, add &predict=0 to skip the gate.
export default function VizGallery() {
  const q = new URLSearchParams(window.location.search);
  const only = q.get('viz-gallery');
  const skipPredict = q.get('predict') === '0';
  const list = SAMPLES.filter(s => !only || s.widget === only || s.id === only);
  return (
    <div className="lp-root" style={{ maxWidth: 760, margin: '0 auto', padding: '16px 16px 80px' }} data-testid="viz-gallery">
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>Visual widgets ({list.length})</h1>
      {list.map(s => {
        const problems = validateViz({ type: 'viz', ...s });
        return (
          <section key={s.id} id={s.id} data-sample={s.id} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, margin: '0 0 6px', color: 'var(--theme-muted-text)' }}>{s.widget} / {s.id}{s.predict && !skipPredict ? ' / predict' : ''}</h2>
            {problems.length > 0 && <pre style={{ color: '#ef4444', fontSize: 12 }}>{problems.join('\n')}</pre>}
            <div className="lp-card" style={{ flex: 'none' }}>
              <VizBlock widget={s.widget} props={s.props} predict={skipPredict ? false : s.predict} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
