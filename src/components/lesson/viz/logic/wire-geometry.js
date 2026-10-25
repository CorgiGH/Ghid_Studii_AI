// Geometry for a wire that leaves a table row along its bottom gridline (pure, so it can be tested in node).

// Where the run along the gridline ends: the row's far edge, but never past the edge of the source table's
// visible box (`wrap`), which can be narrower than the row when the table scrolls sideways. Past that edge the
// wire would overshoot into the neighbouring table.
export function underRunEnd({ rowLeft, rowRight, wrapLeft, wrapRight, leftToRight }) {
  return leftToRight ? Math.min(rowRight, wrapRight) : Math.max(rowLeft, wrapLeft);
}

// Horizontal reach of the curve's control points: generous when there is room, never longer than the gap
// to the target, so a short gap cannot make the curve swing past it.
export function curveReach(gap) {
  const g = Math.abs(gap);
  return Math.max(Math.min(24, g), g * 0.45);
}
