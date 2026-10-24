// Pure helpers for the lesson player (no React), so they can be tested in node.

const GATING_TYPES = new Set(['reflect', 'mcq', 'sql-exercise']);

export function screenFromUrl(search, total) {
  const max = Math.max(1, total | 0);
  let raw = null;
  try { raw = new URLSearchParams(search || '').get('s'); } catch { raw = null; }
  if (raw === null || !/^-?\d+$/.test(raw.trim())) return 1;
  return Math.min(max, Math.max(1, parseInt(raw, 10)));
}

export function nextScreen(current, dir, total) {
  return Math.min(Math.max(1, total), Math.max(1, current + (dir < 0 ? -1 : 1)));
}

export function isGatingBlock(block) {
  if (!block) return false;
  if (GATING_TYPES.has(block.type)) return true;
  return (block.type === 'query-machine' || block.type === 'viz') && block.predict === true;
}

export function isGatingScreen(step) {
  return Array.isArray(step?.blocks) && step.blocks.some(isGatingBlock);
}

export function gatingKind(step) {
  const b = (step?.blocks || []).find(isGatingBlock);
  if (!b) return 'reflect';
  if (b.type === 'mcq') return 'mcq';
  if (b.type === 'sql-exercise') return 'sql';
  if (b.type === 'reflect') return 'reflect';
  return 'predict';
}

export function canAdvance(step, gate) {
  if (!isGatingScreen(step)) return true;
  return !!(gate && (gate.completed || gate.skipped));
}

// Direction-aware slide + fade. `dir` is +1 going forward, -1 going back.
export function slideVariants(reduced) {
  const dist = reduced ? 0 : 36;
  return {
    enter: dir => ({ x: dir * dist, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: dir => ({ x: -dir * dist, opacity: 0 }),
  };
}

// Gate-state reducer: returns the previous object when the patch changes nothing,
// so repeated complete()/skip() calls cause no re-render.
export function mergeGate(gates, idx, patch) {
  const prev = gates[idx] || {};
  if (Object.keys(patch).every(k => prev[k] === patch[k])) return gates;
  return { ...gates, [idx]: { ...prev, ...patch } };
}
