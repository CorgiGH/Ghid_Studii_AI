// graph-walk: one pure module per mode. graphModel(props) returns the frames of the mode with its pick specs, captions and scenes.
import { readGraph } from './common.js';
import { cspFc } from './csp-fc.js';
import { ac3 } from './ac3.js';
import { dijkstra } from './dijkstra.js';
import { kruskal } from './kruskal.js';
import { prim } from './prim.js';
import { bfm } from './bfm.js';
import { cut } from './cut.js';
import { colour } from './colour.js';

export const MODES = { 'csp-fc': cspFc, ac3, dijkstra, kruskal, prim, bfm, cut, colour };
export const ALL_MODES = ['csp-fc', 'ac3', 'dijkstra', 'kruskal', 'prim', 'bfm', 'cut', 'colour'];

export function graphModel(props) {
  const f = MODES[props.mode];
  if (!f) throw new RangeError(`graph-walk: mode "${props.mode}" is not available`);
  const model = f(props);
  // the nodes with their label side chosen, so the picture's box leaves room for the labels
  model.nodes = readGraph(props).nodes;
  return model;
}

// problems for the validator: an empty list means the block builds
export function graphProblems(props) {
  const errs = [];
  if (!Array.isArray(props.nodes) || props.nodes.length === 0 || !props.nodes.every((n) => n && typeof n.id === 'string' && Number.isFinite(n.x) && Number.isFinite(n.y))) errs.push('viz (graph-walk): props.nodes needs { id, x, y } for every node');
  if (!Array.isArray(props.edges) || !props.edges.every((e) => e && typeof e.u === 'string' && typeof e.v === 'string')) errs.push('viz (graph-walk): props.edges needs { u, v } for every edge');
  if (errs.length) return errs;
  try { graphModel(props); } catch (e) { errs.push(`viz (graph-walk): ${e.message}`); }
  return errs;
}
