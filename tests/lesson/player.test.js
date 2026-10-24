import { describe, it, expect } from 'vitest';
import { screenFromUrl, nextScreen, canAdvance, isGatingScreen, slideVariants } from '../../src/components/lesson/playerLogic.js';

describe('screenFromUrl', () => {
  it('reads a 1-based screen from the query string', () => {
    expect(screenFromUrl('?s=7', 12)).toBe(7);
    expect(screenFromUrl('s=3', 12)).toBe(3);
  });
  it('clamps out-of-range values', () => {
    expect(screenFromUrl('?s=99', 12)).toBe(12);
    expect(screenFromUrl('?s=0', 12)).toBe(1);
    expect(screenFromUrl('?s=-4', 12)).toBe(1);
  });
  it('falls back to 1 on garbage', () => {
    expect(screenFromUrl('?s=abc', 12)).toBe(1);
    expect(screenFromUrl('', 12)).toBe(1);
    expect(screenFromUrl('?s=', 12)).toBe(1);
    expect(screenFromUrl(undefined, 12)).toBe(1);
  });
});

describe('nextScreen', () => {
  it('moves one step and stays inside the lesson', () => {
    expect(nextScreen(3, 1, 5)).toBe(4);
    expect(nextScreen(3, -1, 5)).toBe(2);
    expect(nextScreen(5, 1, 5)).toBe(5);
    expect(nextScreen(1, -1, 5)).toBe(1);
  });
});

describe('gating', () => {
  const learn = { blocks: [{ type: 'learn' }, { type: 'code' }] };
  it('detects gating blocks', () => {
    expect(isGatingScreen(learn)).toBe(false);
    for (const type of ['reflect', 'mcq', 'sql-exercise']) {
      expect(isGatingScreen({ blocks: [{ type: 'learn' }, { type }] })).toBe(true);
    }
    expect(isGatingScreen({ blocks: [{ type: 'query-machine', predict: true }] })).toBe(true);
    expect(isGatingScreen({ blocks: [{ type: 'viz', predict: true }] })).toBe(true);
    expect(isGatingScreen({ blocks: [{ type: 'query-machine' }] })).toBe(false);
    expect(isGatingScreen({ blocks: [{ type: 'viz', predict: false }] })).toBe(false);
  });
  it('canAdvance is open on non-gating screens', () => {
    expect(canAdvance(learn, { completed: false, skipped: false })).toBe(true);
  });
  it('canAdvance stays closed on a gating screen until complete or skip', () => {
    const q = { blocks: [{ type: 'mcq' }] };
    expect(canAdvance(q, { completed: false, skipped: false })).toBe(false);
    expect(canAdvance(q, undefined)).toBe(false);
    expect(canAdvance(q, { completed: true, skipped: false })).toBe(true);
    expect(canAdvance(q, { completed: false, skipped: true })).toBe(true);
  });
});

describe('slideVariants', () => {
  it('slides in the direction of travel and only fades under reduced motion', () => {
    const v = slideVariants(false);
    expect(v.enter(1).x).toBeGreaterThan(0);
    expect(v.enter(-1).x).toBeLessThan(0);
    expect(v.exit(1).x).toBeLessThan(0);
    const r = slideVariants(true);
    expect(r.enter(1).x).toBe(0);
    expect(r.exit(-1).x).toBe(0);
  });
});

import { mergeGate } from '../../src/components/lesson/playerLogic.js';
describe('mergeGate', () => {
  it('returns the same object when nothing changes', () => {
    const g = { 2: { completed: true } };
    expect(mergeGate(g, 2, { completed: true })).toBe(g);
  });
  it('merges new fields into a fresh object', () => {
    const g = { 2: { completed: true } };
    const n = mergeGate(g, 2, { skipped: true });
    expect(n).not.toBe(g);
    expect(n[2]).toEqual({ completed: true, skipped: true });
    expect(mergeGate({}, 1, { completed: true })).toEqual({ 1: { completed: true } });
  });
});
