// Second, independent recomputation of the 2026-10-29 additions with the site's own formula language.
// Run from the worktree root:
//   node docs/superpowers/specs/ml-outline/verify_teacher_list.mjs
import { evaluate, toNumber } from '../../../../src/ml/calc/formula.js';
const P311 = { columns: ['x', 'y', 'C'], rows: [[1,3,'+'],[2,3,'+'],[2,1,'+'],[3,2,'+'],[4,5,'+'],[1,5,'-'],[1,1,'-'],[4,3,'-'],[5,4,'-'],[5,2,'-']] };
const P448 = { columns: ['X1', 'X2', 'y'], rows: [[1,2,'+'],[2,3,'+'],[3,4,'-'],[3,2,'-'],[3,1,'-'],[4,4,'-'],[5,4,'-'],[5,2,'+'],[5,1,'+']] };
const scope = { P311, P448 };
const checks = [
  ['L4.c1 E[X]', 'E([1,4],[2/3,1/3])', 2], ['L4.c1 Var(X)', 'Var([1,4],[2/3,1/3])', 2],
  ['L4.c1 E[X+5]', 'E([1+5,4+5],[2/3,1/3])', 7], ['L4.c1 Var(X+5)', 'Var([1+5,4+5],[2/3,1/3])', 2],
  ['L4.c1 det mean not shifted', 'E([(1+5-2)^2,(4+5-2)^2],[2/3,1/3])', 27], ['L4.c1 det E[(X+5)^2]', 'E([(1+5)^2,(4+5)^2],[2/3,1/3])', 51],
  ['L4.c1 det Var+5', 'Var([1,4],[2/3,1/3])+5', 7],
  ['L4.c2 (i) sum', '0.5+0.3+0.3', 1.1], ['L4.c2 (ii) sum', '0.6+(-0.1)+0.5', 1], ['L4.c2 (ii) min', 'min(0.6,-0.1,0.5)', -0.1],
  ['L4.c2 (iii) sum', '0.2+0.5+0.3', 1], ['L4.c2 (iii) min', 'min(0.2,0.5,0.3)', 0.2],
  ['L4.c2 c', '1/(1+2+3)', 1/6], ['L4.c2 P(X=3)', '3/(1+2+3)', 0.5],
  ['L5.s06a P(D=0)', '0.1+0.4', 0.5], ['L5.s06a P(D=-1)', '0.3', 0.3], ['L5.s06a P(D=1)', '0.2', 0.2],
  ['L5.s06a E[D]', 'E([-1,0,1],[0.3,0.1+0.4,0.2])', -0.1], ['L5.s06a E[X]-E[Y]', '(0.2+0.4)-(0.3+0.4)', -0.1],
  ['L5.c1 P(X=2,Y=1)', '0.6*0.3', 0.18], ['L5.c1 P(X=1,Y=2)', '0.4*0.2', 0.08],
  ['L5.c1 P(Z=0)', '0.4*0.5+0.6*0.5', 0.5], ['L5.c1 P(Z=1)', '0.4*0.3', 0.12], ['L5.c1 P(Z=2)', '0.4*0.2+0.6*0.3', 0.26], ['L5.c1 P(Z=4)', '0.6*0.2', 0.12],
  ['L5.c1 E[Z]', 'E([0,1,2,4],[0.4*0.5+0.6*0.5,0.4*0.3,0.4*0.2+0.6*0.3,0.6*0.2])', 1.12],
  ['L5.c1 E[X]E[Y]', 'E([1,2],[0.4,0.6])*E([0,1,2],[0.5,0.3,0.2])', 1.12],
  ['L5.c1 E[XY^2]=E[X]E[Y^2]', 'E([1,2],[0.4,0.6])*E([0,1,4],[0.5,0.3,0.2])', 1.76],
  ['L5.c1 E[XY^2] direct', 'E([0,0,1,2,4,8],[0.4*0.5,0.6*0.5,0.4*0.3,0.6*0.3,0.4*0.2,0.6*0.2])', 1.76],
  ['L5.c1 det E[X]E[Y]^2', 'E([1,2],[0.4,0.6])*E([0,1,2],[0.5,0.3,0.2])^2', 0.784],
  // completeness pass (same day): Var(Z) of L5.c1 and its detectors; NB free parameters on the T21T2 7 rows (L21.s02)
  ['L5.c1 Var(Z)', 'Var([0,1,2,4],[0.4*0.5+0.6*0.5,0.4*0.3,0.4*0.2+0.6*0.3,0.6*0.2])', 1141/625],
  ['L5.c1 Var(Z) via E[X^2]E[Y^2]', 'E([1,4],[0.4,0.6])*E([0,1,4],[0.5,0.3,0.2])-(E([1,2],[0.4,0.6])*E([0,1,2],[0.5,0.3,0.2]))^2', 1141/625],
  ['L5.c1 det Var(X)Var(Y)', 'Var([1,2],[0.4,0.6])*Var([0,1,2],[0.5,0.3,0.2])', 0.1464],
  ['L5.c1 det E[Z^2]', 'E([0,1,4,16],[0.4*0.5+0.6*0.5,0.4*0.3,0.4*0.2+0.6*0.3,0.6*0.2])', 3.08],
  ['L21.s02 NB free params', '(3-1)+3*((3-1)+(2-1))', 11], ['L21.s02 Bayes Comun free params', '(3-1)+3*(3*2-1)', 17],
  ['L21.s02 det 18 / 9 / 15', '[3+3*(3+2), 3*((3-1)+(2-1)), 3*(3+2)]', null],
  ['L15.Q5 gaps', '[5-4, 31-2, 38-37]', null],
  ['L15.c1 5-fold mean', '(0.80+0.90+0.70+0.85+0.75)/5', 0.8], ['L15.c1 best estimate', 'max((0.80+0.90+0.70+0.85+0.75)/5, 0.78, 0.83)', 0.83],
  ['L15.c1 retrain rows', '600-100', 500], ['L15.c1 CVLOO trainings', '600-100', 500],
  ['L21.q5 count P(+|A=1)', '0.05*0.8/(0.05*0.8+0.95*0.1)', 8/27], ['L21.q5 equal P(+|A=1)', '0.5*0.8/(0.5*0.8+0.5*0.1)', 8/9],
  ['L21.q5 count scores', '[0.05*0.8, 0.95*0.1]', null], ['L21.q5 equal scores', '[0.5*0.8, 0.5*0.1]', null],
  ['2.8 e count prior', '2/3*(1/10*1/10*1/2)/(2/3*(1/10*1/10*1/2)+1/3*(2/3*2/3*1/3))', 27/427],
  ['2.8 c book prior (unchanged)', '1/10*(1/10*1/10*1/2)/(1/10*(1/10*1/10*1/2)+9/10*(2/3*2/3*1/3))', 3/803],
  ['3.11.b root', "id3Root(P311,'C',{continuous:['x','y']})", null], ['3.11.b tests', "id3Tests(P311,'C',{continuous:['x','y']})", 6],
  ['3.11.b train err', "trainErrId3(P311,'C',{continuous:['x','y']})", 0],
  ['4.48 root', "id3Root(P448,'y',{continuous:['X1','X2']})", null], ['4.48 tests', "id3Tests(P448,'y',{continuous:['X1','X2']})", 3],
  // probes, read off the zones of the finished tree (each comparison evaluated)
  ['3.11.b (1,2.5): x<=4.5, x<1.5, y>=2, y<4', '[1<=4.5, 1<1.5, 2.5>=2, 2.5<4]', null],
  ['3.11.b (3,5): x<=4.5, x>=1.5, x<3.5', '[3<=4.5, 3>=1.5, 3<3.5]', null],
  ['3.11.b (4.2,3): x<=4.5, x>=3.5, y<4', '[4.2<=4.5, 4.2>=3.5, 3<4]', null],
  ['3.11.b (6,1): x>4.5', '[6>4.5]', null],
  ['4.48 (2,2): X2<3.5, X1<2.5', '[2<3.5, 2<2.5]', null], ['4.48 (3,3): X2<3.5, 2.5<=X1<4', '[3<3.5, 3>=2.5, 3<4]', null],
  ['4.48 (4.2,1.5): X2<3.5, X1>=4 (and X1<4.5: the 4.5 slip gives -)', '[1.5<3.5, 4.2>=4, 4.2<4.5]', null], ['4.48 (2,5): X2>=3.5', '[5>=3.5]', null],
];
let bad = 0;
for (const [name, f, want] of checks) {
  const v = evaluate(f, scope);
  let shown;
  try { shown = Array.isArray(v) ? JSON.stringify(v.map((x) => (typeof x === 'boolean' || typeof x === 'string' ? x : toNumber(x)))) : (typeof v === 'object' ? JSON.stringify(v) : toNumber(v)); } catch { shown = String(v); }
  const ok = want === null || Math.abs(toNumber(v) - want) < 1e-9;
  if (!ok) bad++;
  console.log(`${ok ? 'ok ' : 'BAD'} ${name.padEnd(42)} ${f.padEnd(70).slice(0, 70)} = ${shown}`);
}
console.log(bad ? `${bad} mismatch(es)` : 'all agree');
process.exit(bad ? 1 : 0);
