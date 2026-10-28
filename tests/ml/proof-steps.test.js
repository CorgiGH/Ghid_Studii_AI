import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createLessonStore } from '../../src/lesson/store.js';
import { validateProof, restoredProof, pickOption, canReveal, reveal, proofDone, proofDoneFromAttempts } from '../../src/components/lesson/blocks/proofSpec.js';
import { gatingKind, isGatingScreen, seedGate } from '../../src/components/lesson/playerLogic.js';
import { blockLoaders } from '../../src/components/blocks/registry.js';

// One real store on a memory storage, shared by the block under test (renderToStaticMarkup has no browser store to subscribe to).
const memStorage = () => { const m = {}; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; };
let current = null;
vi.mock('../../src/lesson/useLessonStore', () => ({ useLessonStore: () => current }));
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro }) }));

const { default: ProofStepsBlock } = await import('../../src/components/lesson/blocks/ProofStepsBlock.jsx');
const { default: ScreenGate } = await import('../../src/components/lesson/ScreenGate.jsx');

const bi = (s) => ({ en: `${s} (en)`, ro: s });
const opt = (text, correct, tag) => ({ text: bi(text), correct, explain: bi(`explicatie ${text}`), ...(correct ? {} : { misconception: tag }) });
const TAG = 'int-division'; // any tag of the trap catalogue

const block = () => ({
  type: 'proof-steps',
  id: 'ml-l05-proof',
  claim: bi('Ipoteza H1 este corecta'),
  given: bi('Se da $P(A)=0{,}5$'),
  steps: [
    { shown: bi('PRIMUL-PAS'), why: bi('DE-CE-UNU') },
    {
      shown: bi('AL-DOILEA-PAS'),
      why: bi('DE-CE-DOI'),
      predict: { question: bi('Ce regula se aplica?'), options: [opt('REGULA-BUNA', true), opt('REGULA-RAU', false, TAG)] },
    },
    { shown: bi('AL-TREILEA-PAS') },
  ],
  end: bi('GATA-DEMONSTRATIA'),
});

const NO_REF = { src: 'ml/courses/lesson-05.json', screen: 3 };

function render(b, store, gate = {}) {
  current = store;
  const patchGate = gate.patchGate || (() => {});
  return renderToStaticMarkup(
    React.createElement(ScreenGate, { src: NO_REF.src, screen: NO_REF.screen, state: gate.state, patchGate, onSkip: () => {} },
      React.createElement(ProofStepsBlock, b)),
  );
}

// What the block does on a pick or a reveal, through its own state functions and the store the block writes to.
function play(b, store, actions) {
  let st = restoredProof(store.attemptsAt(NO_REF.src, NO_REF.screen), b);
  for (const a of actions) {
    const next = a.pick ? pickOption(st, b, a.k, a.pick.i) : reveal(st, b);
    if (next === st) continue;
    st = next;
    if (a.pick) {
      const o = b.steps[a.k].predict.options[a.pick.i];
      store.recordAttempt(`${b.id}#${a.k}`, { ok: !!o.correct, hints: 0, kind: 'mcq', item: `${b.id}#${a.k}`, option: a.pick.i, misconception: o.misconception || null, ref: NO_REF, at: 1 });
    } else {
      store.recordAttempt(b.id, { ok: true, hints: 0, kind: 'proof', item: b.id, shown: st.shown, ref: NO_REF, at: 1 });
    }
  }
  return st;
}

describe('validateProof', () => {
  it('accepts a well-formed block', () => {
    expect(validateProof(block(), { lessonId: 'ml-l05' })).toEqual([]);
  });

  it('rejects two correct options in one predict', () => {
    const b = block();
    b.steps[1].predict.options[1] = opt('ALTA-BUNA', true);
    expect(validateProof(b).join('\n')).toMatch(/exactly one correct/);
  });

  it('rejects a wrong option without a misconception or explain, and a tag outside the catalogue', () => {
    let b = block();
    delete b.steps[1].predict.options[1].misconception;
    expect(validateProof(b).join('\n')).toMatch(/misconception/);
    b = block();
    delete b.steps[1].predict.options[1].explain;
    expect(validateProof(b).join('\n')).toMatch(/explain/);
    b = block();
    b.steps[1].predict.options[1].misconception = 'not-a-tag';
    expect(validateProof(b).join('\n')).toMatch(/trap catalogue/);
  });

  it('rejects missing id, claim, end, steps and half-translated strings', () => {
    expect(validateProof({ ...block(), id: '' }).join('\n')).toMatch(/id missing/);
    expect(validateProof({ ...block(), claim: { en: 'x' } }).join('\n')).toMatch(/claim/);
    expect(validateProof({ ...block(), end: undefined }).join('\n')).toMatch(/end/);
    expect(validateProof({ ...block(), steps: [] }).join('\n')).toMatch(/steps/);
    const b = block();
    b.steps[0].shown = { en: 'x', ro: '' };
    expect(validateProof(b).join('\n')).toMatch(/steps\[0\]\.shown/);
    const c = block();
    c.steps[0].why = { en: 'x' };
    expect(validateProof(c).join('\n')).toMatch(/steps\[0\]\.why/);
  });

  it('rejects a bad table, a bad exercise and a predict without options', () => {
    expect(validateProof({ ...block(), table: { columns: ['X'], rows: [] } }).join('\n')).toMatch(/table/);
    expect(validateProof({ ...block(), exercise: 5 }).join('\n')).toMatch(/exercise/);
    const b = block();
    b.steps[1].predict.options = [opt('SINGURA', true)];
    expect(validateProof(b).join('\n')).toMatch(/at least 2 options/);
  });

  it('accepts a static table, a list of tables and exercise as a string or a list', () => {
    expect(validateProof({ ...block(), table: { columns: ['X'], rows: [[1]] }, exercise: ['4.1', '4.2'] })).toEqual([]);
    expect(validateProof({ ...block(), exercise: '4.1' })).toEqual([]);
  });
});

describe('proof state', () => {
  it('starts at step 1 and a step with a predict waits for a pick', () => {
    const b = block();
    let st = restoredProof([], b);
    expect(st).toEqual({ shown: 1, picks: {} });
    expect(canReveal(st, b)).toBe(true); // step 1 has no predict
    st = reveal(st, b);
    expect(st.shown).toBe(2);
    expect(canReveal(st, b)).toBe(false); // step 2 has a predict nobody answered
    expect(reveal(st, b)).toBe(st);
    expect(proofDone(st, b)).toBe(false);
  });

  it('a pick is final and only counts on a visible step with a predict', () => {
    const b = block();
    let st = reveal(restoredProof([], b), b);
    st = pickOption(st, b, 1, 1);
    expect(st.picks).toEqual({ 1: 1 });
    expect(pickOption(st, b, 1, 0)).toBe(st);
    expect(pickOption(restoredProof([], b), b, 1, 0).picks).toEqual({}); // step 2 is not shown yet
    expect(pickOption(st, b, 0, 0)).toBe(st); // step 1 has no predict
    expect(pickOption(st, b, 1, 9)).toBe(st);
  });

  it('is done when the last step is shown and its predict, if any, is answered', () => {
    const b = block();
    const st = play(b, createLessonStore(memStorage()), [{ k: 0 }, { k: 1, pick: { i: 0 } }, { k: 1 }]);
    expect(st.shown).toBe(3);
    expect(proofDone(st, b)).toBe(true);
    const last = block();
    last.steps[2].predict = { question: bi('Ultima?'), options: [opt('A', true), opt('B', false, TAG)] };
    expect(proofDone(st, last)).toBe(false);
    expect(proofDone(pickOption(st, last, 2, 0), last)).toBe(true);
  });
});

describe('ProofStepsBlock render', () => {
  it('shows step 1 first, with no later step and no end', () => {
    const html = render(block(), createLessonStore(memStorage()));
    expect(html).toContain('PRIMUL-PAS');
    expect(html).toContain('DE-CE-UNU');
    expect(html).not.toContain('AL-DOILEA-PAS');
    expect(html).not.toContain('GATA-DEMONSTRATIA');
    expect(html).toContain('Ipoteza H1 este corecta'); // claim
    expect(html).toContain('data-testid="proof-next"');
  });

  it('a wrong pick shows its explanation and the right answer; Next then shows step 2 and keeps step 1', () => {
    const b = block();
    const store = createLessonStore(memStorage());
    play(b, store, [{ k: 0 }]);
    let html = render(b, store);
    expect(html).toContain('AL-DOILEA-PAS');
    expect(html).toContain('PRIMUL-PAS');
    expect(html).toContain('Ce regula se aplica?');
    expect(html).not.toContain('DE-CE-DOI'); // the reason waits for the pick
    expect(html).not.toContain('data-testid="proof-next"'); // blocked until a pick
    play(b, store, [{ k: 1, pick: { i: 1 } }]);
    html = render(b, store);
    expect(html).toContain('Nu chiar');
    expect(html).toContain('explicatie REGULA-RAU');
    expect(html).toContain('Răspunsul corect');
    expect(html).toContain('explicatie REGULA-BUNA');
    expect(html).toContain('DE-CE-DOI');
    expect(html).toContain('data-testid="proof-next"');
    play(b, store, [{ k: 1 }]);
    html = render(b, store);
    expect(html).toContain('AL-TREILEA-PAS');
    expect(html).toContain('PRIMUL-PAS');
    expect(html).toContain('AL-DOILEA-PAS');
  });

  it('the wrong pick joins the review pile; a right pick does not', () => {
    const b = block();
    const wrong = createLessonStore(memStorage());
    play(b, wrong, [{ k: 0 }, { k: 1, pick: { i: 1 } }]);
    expect(wrong.pendingReview(2).map(i => i.itemId)).toEqual(['ml-l05-proof#1']);
    const right = createLessonStore(memStorage());
    play(b, right, [{ k: 0 }, { k: 1, pick: { i: 0 } }]);
    expect(right.pendingCount()).toBe(0);
  });

  it('completes the gate only on the last step, and the end line appears then', () => {
    const b = block();
    const store = createLessonStore(memStorage());
    play(b, store, [{ k: 0 }, { k: 1, pick: { i: 0 } }]);
    expect(render(b, store)).not.toContain('GATA-DEMONSTRATIA');
    expect(proofDoneFromAttempts(b, store.attemptsAt(NO_REF.src, NO_REF.screen))).toBe(false);
    play(b, store, [{ k: 1 }]);
    const html = render(b, store);
    expect(html).toContain('GATA-DEMONSTRATIA');
    expect(html).not.toContain('data-testid="proof-next"');
    expect(proofDoneFromAttempts(b, store.attemptsAt(NO_REF.src, NO_REF.screen))).toBe(true);
  });

  it('a fresh render from the same store restores the revealed count, the picks and their verdicts', () => {
    const b = block();
    const store = createLessonStore(memStorage());
    play(b, store, [{ k: 0 }, { k: 1, pick: { i: 1 } }]);
    const again = render(b, store); // a new mount: only the store carries state
    expect(again).toContain('AL-DOILEA-PAS');
    expect(again).not.toContain('AL-TREILEA-PAS');
    expect(again).toContain('Nu chiar');
    expect(again).toContain('explicatie REGULA-RAU');
    expect(restoredProof(store.attemptsAt(NO_REF.src, NO_REF.screen), b)).toEqual({ shown: 2, picks: { 1: 1 } });
  });

  it('a pick on a step restores that step even if no reveal was stored', () => {
    const b = block();
    const attempts = [{ item: 'ml-l05-proof#1', kind: 'mcq', option: 0, ref: NO_REF }];
    expect(restoredProof(attempts, b)).toEqual({ shown: 2, picks: { 1: 0 } });
  });
});

describe('wiring', () => {
  it('registers the block, gates the screen and reports an mcq gate', () => {
    expect(typeof blockLoaders['proof-steps']).toBe('function');
    const step = { blocks: [block()] };
    expect(isGatingScreen(step)).toBe(true);
    expect(gatingKind(step)).toBe('mcq');
  });

  it('a reload mid-proof does not open the gate; a finished proof does; a skip does', () => {
    const b = block();
    const step = { blocks: [b] };
    const store = createLessonStore(memStorage());
    play(b, store, [{ k: 0 }, { k: 1, pick: { i: 1 } }]);
    expect(seedGate(step, store.attemptsAt(NO_REF.src, NO_REF.screen))).toBeUndefined();
    play(b, store, [{ k: 1 }]);
    expect(seedGate(step, store.attemptsAt(NO_REF.src, NO_REF.screen))).toEqual({ completed: true });
    expect(seedGate(step, [{ skipped: true, ref: NO_REF }])).toEqual({ skipped: true });
  });

  it('a one-step proof with no predict is done at once', () => {
    const b = { ...block(), steps: [{ shown: bi('SINGUR') }] };
    expect(proofDone(restoredProof([], b), b)).toBe(true);
  });
});
