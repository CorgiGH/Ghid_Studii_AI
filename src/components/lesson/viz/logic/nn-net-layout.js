// nn-net: where the drawing puts every neuron, plate and label (viewBox units). Pure; the widget and its overlap test read it.
// Drawing in viewBox units. On a 390 px phone the drawing is about 330 px wide, so one unit is about one pixel.
export const NN_GEOM = { W: 340, R: 24, FS: 14, FS_IN: 15, LH: 16 };
const { W, R, FS, LH } = NN_GEOM;

// Where everything sits (layers numbered from 1; layer 1 at the bottom). Under each neuron of layers 2..L a stack of
// z, δ (and b); the target t sits above the output neurons. The band between two layers holds the weight labels.
export const nnLayout = (P) => {
  const { layers, L, hasBias } = P;
  const lines = hasBias ? 3 : 2;
  const stack = 6 + lines * LH;
  const ROW = 2 * (R + stack + 18);
  const top = 8 + FS + 8 + R;
  const H = top + (L - 1) * ROW + R + 30;
  const gapOf = (n) => (n >= 3 ? 116 : 150);
  const pos = (l, i) => {
    const n = layers[l - 1];
    return { x: W / 2 + (i - (n - 1) / 2) * gapOf(n), y: top + (L - l) * ROW };
  };
  // the k-th line under neuron p (k = 0: z, 1: δ, 2: b), on a plate that hangs from the neuron and hides the edges behind it
  const under = (p, k) => ({ x: p.x, y: p.y + R + 4 + (k + 1) * LH - 3 });
  const plate = (p) => ({ x: p.x - 37, y: p.y + R - 8, w: 74, h: lines * LH + 18 });
  // a weight label: a vertical edge gets it beside the line at half height, a slanted edge on the line
  // (at a quarter of the way up when the two layers' edges cross, so the two crossing labels sit far apart)
  const edgeLabel = (l, i, j) => {
    const a = pos(l - 1, i);
    const b = pos(l, j);
    if (Math.abs(a.x - b.x) < 1) {
      const left = a.x <= W / 2 && layers[l - 1] > 1;
      return { x: left ? a.x - 7 : a.x + 7, y: (a.y + b.y) / 2 + FS * 0.35, anchor: left ? 'end' : 'start' };
    }
    const tt = layers[l - 2] >= 2 && layers[l - 1] >= 2 ? 0.25 : 0.5;
    return { x: a.x + (b.x - a.x) * tt, y: a.y + (b.y - a.y) * tt + FS * 0.35, anchor: 'middle' };
  };
  return { H, ROW, pos, under, plate, edgeLabel, lines };
};
