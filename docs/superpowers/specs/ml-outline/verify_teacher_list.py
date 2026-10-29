# Independent recomputation (exact fractions) of every new number added to the outline on 2026-10-29 for the
# teacher's list (2026-10-29-teacher-list-coverage.md). Run: python3 -I verify_teacher_list.py
from fractions import Fraction as F
from math import log2
from itertools import product

def E(vals, ps): return sum(F(v)*F(p) for v, p in zip(vals, ps))
def Var(vals, ps):
    m = E(vals, ps); return E([F(v)**2 for v in vals], ps) - m*m
out = {}
def rec(k, v): out[k] = v; print(f"{k:28s} {v}  ({float(v):.6f})" if isinstance(v, F) else f"{k:28s} {v}")

# ---- L4.c1: Var(X+a) = Var(X), X in {1,4} with 2/3, 1/3, a = 5
xs, ps = [1, 4], [F(2,3), F(1,3)]
rec('L4.c1 E[X]', E(xs, ps)); rec('L4.c1 Var(X)', Var(xs, ps))
rec('L4.c1 E[X+5]', E([x+5 for x in xs], ps)); rec('L4.c1 Var(X+5)', Var([x+5 for x in xs], ps))
rec('L4.c1 det old-mean', E([(x+5-E(xs,ps))**2 for x in xs], ps))      # mean not shifted
rec('L4.c1 det E[(X+5)^2]', E([(x+5)**2 for x in xs], ps))
rec('L4.c1 det Var+5', Var(xs, ps)+5)

# ---- L4.c2: is p a pmf; p(x)=c*x on {1,2,3}
for name, p in [('i', [F('0.5'), F('0.3'), F('0.3')]), ('ii', [F('0.6'), F('-0.1'), F('0.5')]), ('iii', [F('0.2'), F('0.5'), F('0.3')])]:
    rec(f'L4.c2 ({name}) sum', sum(p)); rec(f'L4.c2 ({name}) min', min(p)); rec(f'L4.c2 ({name}) valid', sum(p) == 1 and min(p) >= 0)
c = F(1, sum([1, 2, 3])); rec('L4.c2 c', c); rec('L4.c2 P(X=3)', 3*c); rec('L4.c2 det inverted c', F(6))

# ---- L5.s06a: D = X - Y on the L5.s02 table (X,Y): (0,0)=.1 (1,0)=.2 (0,1)=.3 (1,1)=.4
J = {(0,0): F('0.1'), (1,0): F('0.2'), (0,1): F('0.3'), (1,1): F('0.4')}
D = {}
for (x, y), p in J.items(): D[x-y] = D.get(x-y, 0) + p
for d in sorted(D): rec(f'L5.s06a P(D={d})', D[d])
rec('L5.s06a E[D]', sum(d*p for d, p in D.items()))
rec('L5.s06a E[X]-E[Y]', sum(x*p for (x,y),p in J.items()) - sum(y*p for (x,y),p in J.items()))

# ---- L5.c1: X in {1,2} (0.4,0.6), Y in {0,1,2} (0.5,0.3,0.2), independent; Z = XY
PX = {1: F('0.4'), 2: F('0.6')}; PY = {0: F('0.5'), 1: F('0.3'), 2: F('0.2')}
J2 = {(x, y): PX[x]*PY[y] for x in PX for y in PY}
rec('L5.c1 P(X=2,Y=1)', J2[(2,1)]); rec('L5.c1 P(X=1,Y=2)', J2[(1,2)])
Z = {}
for (x, y), p in J2.items(): Z[x*y] = Z.get(x*y, 0) + p
for z in sorted(Z): rec(f'L5.c1 P(Z={z})', Z[z])
rec('L5.c1 sum P(Z)', sum(Z.values()))
EZ = sum(z*p for z, p in Z.items()); rec('L5.c1 E[Z]', EZ)
EX = sum(x*p for x, p in PX.items()); EY = sum(y*p for y, p in PY.items()); EY2 = sum(y*y*p for y, p in PY.items())
rec('L5.c1 E[X]', EX); rec('L5.c1 E[Y]', EY); rec('L5.c1 E[X]E[Y]', EX*EY)
EXY2 = sum(x*y*y*p for (x, y), p in J2.items()); rec('L5.c1 E[XY^2] direct', EXY2); rec('L5.c1 E[X]E[Y^2]', EX*EY2)
rec('L5.c1 det E[X]E[Y]^2', EX*EY*EY)
rec('L5.c1 det P(Z=2) one cell (1,2)', J2[(1,2)]); rec('L5.c1 det P(Z=2) one cell (2,1)', J2[(2,1)])
rec('L5.c1 det P(Z=0) one cell', J2[(1,0)])
# completeness pass: Var(Z), from Z's distribution and as E[X^2]E[Y^2]-(E[XY])^2; detectors Var(X)Var(Y) and E[Z^2]
EZ2 = sum(z*z*p for z, p in Z.items()); rec('L5.c1 E[Z^2]', EZ2)
EX2 = sum(x*x*p for x, p in PX.items()); rec('L5.c1 E[X^2]E[Y^2]', EX2*EY2)
rec('L5.c1 Var(Z)', EZ2 - EZ*EZ); rec('L5.c1 Var(Z) via independence', EX2*EY2 - (EX*EY)**2)
rec('L5.c1 det Var(X)Var(Y)', (EX2 - EX*EX)*(EY2 - EY*EY))

# ---- L15.Q5 labels, L15.c1 protocol
folds = [F('0.80'), F('0.90'), F('0.70'), F('0.85'), F('0.75')]
rec('L15.c1 5-fold mean A', sum(folds)/5)
rec('L15.c1 best of A,B,C', max([('A', sum(folds)/5), ('B', F('0.78')), ('C', F('0.83'))], key=lambda t: t[1])[0])
rec('L15.c1 retrain rows', 600-100); rec('L15.c1 CVLOO trainings', 600-100); rec('L15.c1 5-fold trainings', 5)
for m, (tr, va) in {'A': (4, 5), 'B': (2, 31), 'C': (37, 38)}.items(): rec(f'L15.Q5 {m} gap', va-tr)

# ---- L21.q5: 5 positive, 95 negative; P(A=1|+)=0.8, P(A=1|-)=0.1; instance A=1
for tag, pp in [('count', F(5, 100)), ('equal', F(1, 2))]:
    sp, sn = pp*F('0.8'), (1-pp)*F('0.1')
    rec(f'L21.q5 {tag} score+', sp); rec(f'L21.q5 {tag} score-', sn); rec(f'L21.q5 {tag} P(+|A=1)', sp/(sp+sn))
# ---- L21.e1 (2.8) new part e: count prior 2/3 with the smoothed factors
fs = F(1,10)*F(1,10)*F(1,2); fr = F(2,3)*F(2,3)*F(1,3)
rec('2.8 factors spam', fs); rec('2.8 factors regular', fr)
for tag, p in [('book p=0.1', F(1,10)), ('count p=2/3', F(2,3)), ('flip p=800/827', F(800,827))]:
    rec(f'2.8 P(spam|s) {tag}', p*fs/(p*fs+(1-p)*fr))

# ---- completeness pass, L21.s02 second prediction: free parameters of NB / Bayes Comun on the T21T2 7 rows
# (A 3 values, B 2, Y 3): count every free value of the prior and of each class's distributions
K, vals = 3, [3, 2]
rec('L21.s02 NB free params', (K-1) + K*sum(v-1 for v in vals))
rec('L21.s02 Bayes Comun free params', (K-1) + K*(vals[0]*vals[1]-1))
rec('L21.s02 det all probabilities', K + K*sum(vals)); rec('L21.s02 det no prior', K*sum(v-1 for v in vals))
rec('L21.s02 det all values, no prior', K*sum(vals))
# the same count on 2.27.b (L20.e4) and on the binary formulas of L20.s11
rec('2.27.b NB (4 attrs 3,3,2,2; K=2)', (2-1) + 2*sum(v-1 for v in [3,3,2,2]))
rec('2.27.b Bayes Comun', (2-1) + 2*(3*3*2*2-1))
rec('L20.s11 n=3 binary NB / JB', ((2-1)+2*3, (2-1)+2*(2**3-1)))

# ---- L14: ID3 with continuous thresholds, every tie enumerated; classify probe points
def H(c):
    n = sum(c); return 0.0 if n == 0 else -sum(F(k, n)*log2(F(k, n)) for k in c if k)
def splits(pts):
    out = []
    for ax in (0, 1):
        vals = sorted({p[ax] for p in pts})
        for a, b in zip(vals, vals[1:]):
            la = {p[2] for p in pts if p[ax] == a}; lb = {p[2] for p in pts if p[ax] == b}
            if la != lb or len(la) > 1:  # a value with both labels counts as a boundary (outline rule)
                out.append((ax, F(a+b, 2)))
    return out
def hc(pts, s):
    ax, t = s; L = [p for p in pts if p[ax] < t]; R = [p for p in pts if p[ax] >= t]
    cnt = lambda q: [sum(1 for p in q if p[2] == '+'), sum(1 for p in q if p[2] == '-')]
    n = len(pts); return F(len(L), n)*H(cnt(L)) + F(len(R), n)*H(cnt(R))
def trees(pts):
    labs = {p[2] for p in pts}
    if len(labs) == 1: return [labs.pop()]
    ss = splits(pts)
    best = min(hc(pts, s) for s in ss)
    res = []
    for s in ss:
        if abs(hc(pts, s) - best) < 1e-12:
            ax, t = s
            for l in trees([p for p in pts if p[ax] < t]):
                for r in trees([p for p in pts if p[ax] >= t]):
                    res.append((s, l, r))
    return res
def cls(tr, q):
    while not isinstance(tr, str):
        (ax, t), l, r = tr; tr = l if q[ax] < t else r
    return tr
def ntests(tr): return 0 if isinstance(tr, str) else 1 + ntests(tr[1]) + ntests(tr[2])

P311 = [(1,3,'+'), (2,3,'+'), (2,1,'+'), (3,2,'+'), (4,5,'+'), (1,5,'-'), (1,1,'-'), (4,3,'-'), (5,4,'-'), (5,2,'-')]
T311 = trees(P311)
rec('3.11.b trees (tie variants)', len(T311)); rec('3.11.b tests per tree', sorted({ntests(t) for t in T311}))
for q in [(1, 2.5), (3, 5), (4.2, 3), (6, 1)]:
    rec(f'3.11.b probe {q}', sorted({cls(t, q) for t in T311}))
P448 = [(1,2,'+'), (2,3,'+'), (3,4,'-'), (3,2,'-'), (3,1,'-'), (4,4,'-'), (5,4,'-'), (5,2,'+'), (5,1,'+')]
T448 = trees(P448)
rec('4.48 trees (tie variants)', len(T448)); rec('4.48 tests per tree', sorted({ntests(t) for t in T448}))
for q in [(2, 2), (3, 3), (4.2, 1.5), (2, 5)]:
    rec(f'4.48 probe {q}', sorted({cls(t, q) for t in T448}))
# the zone listing of the outline for 4.48, checked against every tree on a grid
grid = [(x/4, y/4) for x in range(0, 25) for y in range(0, 25)]
def zone448(q):
    x1, x2 = q
    return '+' if (x2 < 3.5 and x1 < 2.5) or (x2 < 3.5 and x1 >= 4) else '-'
rec('4.48 zones match every tree on grid', all(cls(t, q) == zone448(q) for t in T448 for q in grid))
def zone311(q):
    x, y = q
    pos = (x < 1.5 and 2 <= y < 4) or (1.5 <= x < 3.5) or (3.5 <= x < 4.5 and y >= 4)
    return '+' if pos else '-'
rec('3.11.b zones match every tree on grid', all(cls(t, q) == zone311(q) for t in T311 for q in grid))
