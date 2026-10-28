#!/usr/bin/env python3
"""Recomputes every number in outline-bayes.md (L19-L22 and the two tests).
Run: python3 -I verify_bayes.py   (prints sections; asserts where a source value exists)
Sources named in comments. Uses exact fractions, log2 / ln only for display."""
from fractions import Fraction as F
from math import log, log2, comb, exp
import itertools

def H(*ps):
    return -sum(float(p)*log2(float(p)) for p in ps if p > 0)

def show(label, val):
    if isinstance(val, F):
        print(f"{label}: {val} = {float(val):.6f}")
    else:
        print(f"{label}: {val}")

print("##### L19 #####")
# ML6:7 cancer
pc, pnc = F(8, 1000), F(992, 1000)
a1 = F(98, 100)*pc; a2 = F(3, 100)*pnc
show("cancer P(+|c)P(c)", a1); show("cancer P(+|nc)P(nc)", a2)
show("P(cancer|+)", a1/(a1+a2))
# equal priors
e1 = F(98, 100)*F(1, 2); e2 = F(3, 100)*F(1, 2)
show("cancer equal priors c", e1); show("cancer equal priors nc", e2)
show("P(cancer|+) equal priors", e1/(e1+e2))
# natural frequencies out of 100000
show("100000: cancer", 100000*pc); show("pos among cancer", 100000*pc*F(98, 100))
show("pos among healthy", 100000*pnc*F(3, 100))

# pretest coins [nou]: A fair (0.5), B biased (0.9 head); prior 1/2 each; data = 1 head
print("-- pretest L19 coins")
pA, pB = F(1, 2), F(9, 10)
show("prior 1/2: A", pA*F(1, 2)); show("prior 1/2: B", pB*F(1, 2)); show("P(B|head)", (pB*F(1, 2))/(pA*F(1, 2)+pB*F(1, 2)))
show("prior B=1/10: A", pA*F(9, 10)); show("prior B=1/10: B", pB*F(1, 10)); show("P(B|head) prior 1/10", (pB*F(1, 10))/(pA*F(9, 10)+pB*F(1, 10)))

# quiz Q1: P(D|A)=.5 P(D|B)=.6 priors .8/.2
print("-- quiz L19")
show("Q1 A", F(5, 10)*F(8, 10)); show("Q1 B", F(6, 10)*F(2, 10)); show("Q1 P(A|D)", F(40, 100)/(F(40, 100)+F(12, 100)))
# Q3 vote .45 .35 .20
show("Q3 +", F(45, 100)); show("Q3 -", F(35, 100)+F(20, 100))
# Q4 n1=2 n0=0 MAP
show("Q4 MLE", F(2, 2)); show("Q4 MAP", F(2+2, 2+4))
# MAP Beta
print("-- 0.43")
n1, n0 = 6, 4
show("MLE 6/4", F(n1, n1+n0)); show("MAP 6/4", F(n1+2, n1+n0+4))
for (a, b) in [(60, 40), (600, 400)]:
    show(f"MAP {a}/{b}", F(a+2, a+b+4)); show(f"MLE {a}/{b}", F(a, a+b))
show("MAP 3/2", F(5, 9)); show("MAP 5/5", F(7, 14))
show("0.43.h diff", F(6, 10)-F(8, 14))
# check numerically the argmax of L*p
best = max((i/10000 for i in range(1, 10000)), key=lambda t: t**(n1+2)*(1-t)**(n0+2))
print("grid argmax L*p", best)
best = max((i/10000 for i in range(1, 10000)), key=lambda t: t**(n1)*(1-t)**(n0))
print("grid argmax L", best)
# values of L(theta) for 6/4: at 0.6
print("L(0.6) 6/4", 0.6**6*0.4**4, "L(0.5)", 0.5**10)

# 0.26 Mickey new die
print("-- 0.26")
def pM(n, a, f):
    f = F(f)
    num = 3**n*f
    return num/(num+F(5)**(n-a)*(1-f))
show("n=10 a=4 f=5%", pM(10, 4, F(5, 100)))
show("n=10 a=6 f=5%", pM(10, 6, F(5, 100)))
# check formula against direct binomial
n, a, f = 10, 4, F(5, 100)
direct = comb(n, a)*F(1, 2)**n*f/(comb(n, a)*F(1, 2)**n*f+comb(n, a)*F(1, 6)**a*F(5, 6)**(n-a)*(1-f))
assert direct == pM(n, a, f)
for fv in (0.05, 0.01):
    for p in (0.5, 0.95, 0.99):
        lg = log((1-fv)/fv)+log(p/(1-p))
        nmin = lg/log(3); nmed = lg/log(3/5**0.5)
        print(f"f={fv} p={p} nmin={nmin:.2f} nmed={nmed:.2f}")
show("E[S|M] n=10", F(10, 2)); show("E[S|~M] n=10", F(10, 6))
show("P(S=4|M) n=10", comb(10, 4)*F(1, 2)**10); show("P(S=4|~M) n=10", comb(10, 4)*F(1, 6)**4*F(5, 6)**6)
print("float P(S=4|M),P(S=4|~M)", float(comb(10, 4)*F(1, 2)**10), float(comb(10, 4)*F(1, 6)**4*F(5, 6)**6))
# threshold a for n=10,f=.05,p=.95: smallest a with P(M|S=a)>=.95
for a in range(0, 11):
    if pM(10, a, F(5, 100)) >= F(95, 100):
        print("min a n=10 f=.05 p=.95:", a, float(pM(10, a, F(5, 100)))); break
for a in range(0, 11):
    if pM(10, a, F(5, 100)) >= F(50, 100):
        print("min a n=10 f=.05 p=.5:", a, float(pM(10, a, F(5, 100)))); break

# 2.1 disease
print("-- 2.1")
pB_ = F(1, 500); pT = F(1)*pB_+F(1, 100)*(1-pB_)
show("P(T1=+)", pT); show("P(B|+)", pB_/pT); show("E[C]", 100+10000*pT)
show("c_n", F(100)/(1-pT)); print("c_n float", float(F(100)/(1-pT)))
show("wrong 100+10000*0.01", 100+10000*F(1, 100)); show("wrong 100+10000/500", 100+10000*F(1, 500))
# 2.2 ghost
print("-- 2.2")
for name, (g1, g3) in {"a": (F(1, 2), F(1)), "b": (F(1), F(1)), "c": (F(0), F(1))}.items():
    # P(G=2|O=1)=g1 ; P(G=2|O=3)=g3 ; P(G=2|O=2)=0
    z = g1+g3
    print("2.2", name, "P(O=1|G=2)=", g1/z, "P(O=3|G=2)=", g3/z)
# 2.3
print("-- 2.3")
faces = [1, 3, 4, 2, 3, 3, 2, 5, 1, 6]
pfd = F(1, 6)**10; pld = F(1, 10)**7*F(1, 2)**3
show("P(D|FD)", pfd); print(float(pfd), float(pld))
sFD, sLD = pfd*F(95, 100), pld*F(5, 100)
print("sFD", float(sFD), "sLD", float(sLD), "P(D)", float(sFD+sLD))
print("ln odds", log(float(sLD/sFD)), "P(FD|D)", float(sFD/(sFD+sLD)), "P(LD|D)", float(sLD/(sFD+sLD)))
print("ln equal priors", log(float(pld/pfd)), "ln19", log(19), "ln3", log(3), "ln5", log(5))
print("19/3^10 vs 1/5^7", 19/3**10, 1/5**7, "ln:", log(19)-10*log(3), -7*log(5))
# P18 1A: face 2 favoured, rolls 1,2,4,3,2,2,3,5,1,6: counts of 2 = 3
c2 = [1, 2, 4, 3, 2, 2, 3, 5, 1, 6].count(2)
pf = F(1, 6)**10; pl = F(1, 10)**(10-c2)*F(1, 2)**c2
print("P18 face2 count", c2, "P(unfair|D)", float(pl*F(5, 100)/(pl*F(5, 100)+pf*F(95, 100))), "ratio", float(pl/pf))
# 2.4
print("-- 2.4")
pts = [(1.5, 1), (2, 1), (3, 0), (3.5, 0), (3.75, 1)]
def Hs(ys):
    n = len(ys)
    if n == 0: return 0
    p = sum(ys)/n
    return H(p, 1-p) if 0 < p < 1 else 0.0
def IG(t, data):
    L = [y for x, y in data if x <= t]; R = [y for x, y in data if x > t]
    n = len(data)
    return Hs([y for x, y in data])-(len(L)/n*Hs(L)+len(R)/n*Hs(R))
for t in (1.75, 2.25, 2.5, 2.75, 3.25, 3.625, 3.75):
    print("IG t=", t, round(IG(t, pts), 4))
print("H(3/5)", H(3/5, 2/5))
print("P(T0|D)", F(3, 5)**3*F(2, 5)**2, float(F(3, 5)**3*F(2, 5)**2))
print("P(T1|D)", F(1)**2*F(1, 3)*F(2, 3)**2*F(1, 4), float(F(1, 3)*F(2, 3)**2*F(1, 4)))
print("P(T2|D)", F(1, 4)**4, float(F(1, 4)**4))
print("1-split lik", F(4, 27), "vs split at 3.625: left [1,1,0,0]:", "lik",  (F(1, 2)**2)*(F(1, 2)**2)*0+0)
# best single split likelihood
def lik1(t):
    L = [y for x, y in pts if x <= t]; R = [y for x, y in pts if x > t]
    r = F(1)
    for part in (L, R):
        if part:
            p = F(sum(part), len(part))
            for y in part: r *= p if y else 1-p
    return r
for t in (1.75, 2.25, 2.5, 2.75, 3.25, 3.625):
    print("lik split", t, lik1(t), float(lik1(t)))
# CVLOO DT2 (book tie rule) computed by hand per book: decisions; just record
# DT*: ID3 leave-one-out
def best_threshold(data, tie='left'):
    xs = sorted(set(x for x, y in data))
    cands = [(xs[i]+xs[i+1])/2 for i in range(len(xs)-1)]
    scored = [(IG(t, data), t) for t in cands]
    if not scored: return None
    m = max(s for s, t in scored)
    for s, t in scored:
        if abs(s-m) < 1e-12: return t, s
def grow(data, depth=None, maxsplits=None):
    ys = [y for x, y in data]
    if len(set(ys)) <= 1: return ('leaf', ys[0] if ys else 0)
    bt = best_threshold(data)
    if bt is None or bt[1] <= 1e-12:
        return ('leaf', 1 if sum(ys)*2 > len(ys) else 0)
    t = bt[0]
    return ('node', t, grow([d for d in data if d[0] <= t]), grow([d for d in data if d[0] > t]))
def classify(tree, x):
    while tree[0] == 'node':
        tree = tree[2] if x <= tree[1] else tree[3]
    return tree[1]
errs = []
for i, (x, y) in enumerate(pts):
    tr = grow([d for j, d in enumerate(pts) if j != i])
    if classify(tr, x) != y: errs.append(x)
print("DT* CVLOO errors at", errs, "=", F(len(errs), 5))
print("DT* train err", sum(classify(grow(pts), x) != y for x, y in pts))
# 2.24
print("-- 2.24")
# boxes A,B,C prize uniform; observation: Y=B opened and empty; X=A
likA = {"a": F(1, 2), "b": F(1, 2), "c": F(1, 2)}
likB = {"a": F(0), "b": F(0), "c": F(0)}  # prize in B contradicts 'B empty'
likC = {"a": F(1), "b": F(1, 2), "c": F(1, 2)}
for k in "abc":
    z = likA[k]+likC[k]
    print("2.24", k, "P(A)=", likA[k]/z, "P(C)=", likC[k]/z)
# 2.25 prisoners
print("-- 2.25")
pYb = {"a": F(1, 2), "b": F(0), "c": F(1)}
z = sum(pYb.values())*F(1, 3)
print({k: v*F(1, 3)/z for k, v in pYb.items()})

print("\n##### L20 #####")
from collections import Counter

def nb_train(rows, nvals):
    """rows: list of (tuple attrs, y). nvals: list of |Val(A_i)| for add-one (None = MLE)."""
    pass

def counts_model(rows, ncls_vals=None):
    ys = Counter(y for _, y in rows)
    return ys

def nb_scores(rows, x, laplace=False, vals=None, prior_laplace=False):
    """rows: list of (attrs tuple, y); x: attrs tuple. vals: list of value sets per attribute (default: seen)."""
    N = len(rows)
    ys = sorted(set(y for _, y in rows))
    if vals is None:
        vals = [sorted(set(r[0][i] for r in rows)) for i in range(len(x))]
    out = {}
    for y in ys:
        ny = sum(1 for r in rows if r[1] == y)
        s = F(ny, N)
        for i, xi in enumerate(x):
            c = sum(1 for r in rows if r[1] == y and r[0][i] == xi)
            s *= F(c+1, ny+len(vals[i])) if laplace else F(c, ny)
        out[y] = s
    return out

def jb_scores(rows, x, laplace=False, nvals_total=None):
    N = len(rows); ys = sorted(set(y for _, y in rows))
    out = {}
    for y in ys:
        c = sum(1 for r in rows if r[1] == y and r[0] == x)
        out[y] = F(c, N)
    return out

def post(sc):
    z = sum(sc.values())
    return {k: (v/z if z else None) for k, v in sc.items()}

# P20 2 / R18 3A : (x,y,z,U)
P20 = [((1, 0, 0), 0), ((0, 1, 1), 0), ((0, 0, 1), 0), ((1, 0, 0), 1), ((0, 0, 1), 1), ((0, 1, 0), 1), ((1, 1, 0), 1)]
sc = nb_scores(P20, (0, 1, 0)); print("P20 NB scores", sc, post(sc))
assert post(sc)[0] == F(8, 35)
sj = jb_scores(P20, (0, 1, 0)); print("P20 JB scores", sj, post(sj))
P20x = [((r[0][0],), r[1]) for r in P20]
print("P20 NB x=0", post(nb_scores(P20x, (0,))), "JB", post(jb_scores(P20x, (0,))))
print("P20 float NB P(U=0|...)", float(post(sc)[0]), "scores", {k: float(v) for k, v in sc.items()})
# per-factor
print("P20 factors U=0:", F(2, 3), F(1, 3), F(1, 3), " U=1:", F(2, 4), F(2, 4), F(3, 4))

# pretest L20 [nou]: 6 rows (A,B,Y); instance (A=1,B=1) absent
PT20 = [((0, 0), 0), ((0, 1), 0), ((1, 0), 0), ((1, 0), 1), ((0, 1), 1), ((1, 0), 1)]
print("pretest L20 NB", nb_scores(PT20, (1, 1)), post(nb_scores(PT20, (1, 1))), "JB", jb_scores(PT20, (1, 1)))

# 2.5
R25 = [((1, 0, 1), 1), ((1, 1, 1), 1), ((0, 1, 1), 0), ((1, 1, 0), 0), ((1, 0, 1), 0), ((0, 0, 0), 1), ((0, 0, 0), 1), ((0, 0, 1), 0)]
# MLE P(K=1|a=1,b=1) and with c=0
m = [r for r in R25 if r[0][0] == 1 and r[0][1] == 1]; print("2.5a", sum(r[1] for r in m), len(m))
m = [r for r in R25 if r[0] == (1, 1, 0)]; print("2.5a c=0", sum(r[1] for r in m), len(m))
R25ab = [((r[0][0], r[0][1]), r[1]) for r in R25]
sc = nb_scores(R25ab, (1, 1)); print("2.5b (1,1)", sc, post(sc))
sc = nb_scores(R25, (1, 1, 0)); print("2.5b (1,1,0)", sc, post(sc))
# NB posterior for K=1 vs MLE
# 2.6
J26 = {(0, 0, 0): F(15, 100), (0, 0, 1): F(25, 100), (0, 1, 0): F(5, 100), (0, 1, 1): F(8, 100), (1, 0, 0): F(10, 100), (1, 0, 1): F(2, 100), (1, 1, 0): F(20, 100), (1, 1, 1): F(15, 100)}
assert sum(J26.values()) == 1
py = {y: sum(v for k, v in J26.items() if k[2] == y) for y in (0, 1)}
print("2.6 P(y)", py)
px1 = {(a, y): sum(v for k, v in J26.items() if k[0] == a and k[2] == y)/py[y] for a in (0, 1) for y in (0, 1)}
px2 = {(a, y): sum(v for k, v in J26.items() if k[1] == a and k[2] == y)/py[y] for a in (0, 1) for y in (0, 1)}
print("2.6 P(x1|y)", {k: float(v) for k, v in px1.items()}); print("2.6 P(x2|y)", {k: float(v) for k, v in px2.items()})
s0 = py[0]*px1[(1, 0)]*px2[(0, 0)]; s1 = py[1]*px1[(1, 1)]*px2[(0, 1)]
print("2.6c NB scores", float(s0), float(s1), "P(y=1|1,0)=", float(s1/(s0+s1)), s1/(s0+s1))
print("2.6d JB", J26[(1, 0, 1)]/(J26[(1, 0, 1)]+J26[(1, 0, 0)]), float(J26[(1, 0, 1)]/(J26[(1, 0, 1)]+J26[(1, 0, 0)])))
print("2.6e P(x1=1,x2=0|y=1)=", J26[(1, 0, 1)]/py[1], "product", px1[(1, 1)]*px2[(0, 1)], float(px1[(1, 1)]*px2[(0, 1)]))
print("2.6 BS48 witness: P(x1=0,x2=0|y=0)", J26[(0, 0, 0)]/py[0], "product", px1[(0, 0)]*px2[(0, 0)])
# 2.7
C27 = {(0, 0, 0): 2, (0, 0, 1): 18, (1, 0, 0): 4, (1, 0, 1): 1, (0, 1, 0): 4, (0, 1, 1): 1, (1, 1, 0): 2, (1, 1, 1): 18}
R27 = [((a, b), y) for (a, b, y), c in C27.items() for _ in range(c)]
sc = nb_scores(R27, (0, 0)); print("2.7a NB", sc, post(sc)); sj = jb_scores(R27, (0, 0)); print("2.7b JB", sj, post(sj))
print("2.7 totals", Counter(r[1] for r in R27))
C27b = {(a, b, y): (3 if y == 0 else 9) for a in (0, 1) for b in (0, 1) for y in (0, 1)}
R27b = [((a, b), y) for (a, b, y), c in C27b.items() for _ in range(c)]
print("2.7d NB", post(nb_scores(R27b, (0, 0))), "JB", post(jb_scores(R27b, (0, 0))))
print("2.7 P(X1=0,X2=0|Y=0)", F(2, 12), "product", F(6, 12)*F(6, 12))
for n in (1, 2, 3, 4, 5, 10):
    print(f"params n={n}: NB {2*n+1}  JB {2**(n+1)-1}")

# 2.27 EnjoyTennis
D = [("Sunny", "Hot", "High", "Weak", "No"), ("Sunny", "Hot", "High", "Strong", "No"), ("Overcast", "Hot", "High", "Weak", "Yes"),
     ("Rain", "Mild", "High", "Weak", "Yes"), ("Rain", "Cool", "Normal", "Weak", "Yes"), ("Rain", "Cool", "Normal", "Strong", "No"),
     ("Overcast", "Cool", "Normal", "Strong", "Yes"), ("Sunny", "Mild", "High", "Weak", "No"), ("Sunny", "Cool", "Normal", "Weak", "Yes"),
     ("Rain", "Mild", "Normal", "Weak", "Yes"), ("Sunny", "Mild", "Normal", "Strong", "Yes"), ("Overcast", "Mild", "High", "Strong", "Yes"),
     ("Overcast", "Hot", "Normal", "Weak", "Yes"), ("Rain", "Mild", "High", "Strong", "No")]
R27t = [(r[:4], r[4]) for r in D]
vals_full = [sorted(set(r[0][i] for r in R27t)) for i in range(4)]
sc = nb_scores(R27t, ("Sunny", "Cool", "High", "Strong")); print("2.27a", sc, {k: float(v) for k, v in sc.items()}, post(sc), float(post(sc)["No"]))
assert post(sc)["No"] == F(486, 611)
print("2.27 factors Yes:", F(2, 9), F(3, 9), F(3, 9), F(3, 9), " No:", F(3, 5), F(1, 5), F(4, 5), F(3, 5))
print("2.27b NB free params", 1+2*(2+2+1+1), " JB", 3*3*2*2-1, 2*(3*3*2*2-1)+1)
# training error and LOO
def predict(rows, x, vals):
    sc = nb_scores(rows, x, vals=vals)
    m = max(sc.values()); ws = [k for k, v in sc.items() if v == m]
    return ws, sc
terr = []
for r in R27t:
    ws, sc = predict(R27t, r[0], vals_full)
    if r[1] not in ws or len(ws) > 1: terr.append((r, ws))
print("2.27c train errors", [(t[0][1], t[1]) for t in terr])
looerr = []
rows_table = []
for i, r in enumerate(R27t):
    tr = [q for j, q in enumerate(R27t) if j != i]
    ws, sc = predict(tr, r[0], vals_full)
    rows_table.append((f"D{i+1}", r[1], {k: float(v) for k, v in sc.items()}, ws))
    if ws != [r[1]]: looerr.append(f"D{i+1}")
print("2.27c LOO errors", looerr, len(looerr))
for t in rows_table: print("  ", t[0], t[1], {k: round(v, 5) for k, v in t[2].items()}, t[3])
# 2.28
R28 = [((0, 0, 1), 0), ((0, 1, 0), 0), ((1, 1, 0), 0), ((0, 0, 1), 1), ((1, 1, 1), 1), ((1, 0, 0), 1), ((1, 1, 0), 1)]
sc = nb_scores(R28, (0, 0, 1)); print("2.28", sc, {k: float(v) for k, v in sc.items()}, post(sc), float(post(sc)[1]))
print("2.28 JB", jb_scores(R28, (0, 0, 1)), post(jb_scores(R28, (0, 0, 1))))
# 2.29
C29 = {(0, 0, 1): 3, (0, 1, 0): 1, (0, 1, 1): 4, (1, 0, 0): 5, (1, 1, 0): 2, (1, 1, 1): 1}
R29 = [((a, b), c) for (a, b, c), n in C29.items() for _ in range(n)]
sc = nb_scores(R29, (0, 1)); print("2.29c NB", sc, post(sc), float(post(sc)[1])); sj = jb_scores(R29, (0, 1)); print("2.29d JB", sj, post(sj))
print("2.29 N", len(R29), Counter(r[1] for r in R29))
print("2.29e C=0: P(A=0,B=1|C=0)=", F(1, 8), " product", F(1, 8)*F(3, 8), "; C=1:", F(4, 8), F(7, 8)*F(5, 8))
# mushrooms BS90
M = [((1, 0, 0, 0), 1), ((1, 0, 1, 0), 1), ((0, 1, 0, 1), 1), ((0, 0, 0, 1), 0), ((1, 1, 1, 0), 0), ((1, 0, 1, 1), 0), ((1, 0, 0, 1), 0), ((0, 1, 0, 0), 0)]
print("mushroom P(Y=1)", F(3, 8))
for i in range(4):
    for y in (1, 0):
        n = sum(1 for r in M if r[1] == y); c = sum(1 for r in M if r[1] == y and r[0][i] == 1)
        print(f"  P(X{i+1}=1|Y={y}) = {c}/{n}")
for nm, x in {"U": (0, 1, 1, 1), "V": (1, 1, 0, 1), "W": (1, 1, 0, 0)}.items():
    sc = nb_scores(M, x, vals=[[0, 1]]*4); print(" mushroom", nm, {k: v for k, v in sc.items()}, post(sc), float(post(sc)[1]))
# exponent counts in L(theta): per parameter (a,b) = count of 1 and 0 for its group
print("mushroom L counts: θy 3/5; θ11 2/1; θ10 3/2; θ21 1/2; θ20 2/3; θ31 1/2; θ30 2/3; θ41 1/2; θ40 3/2")

print("\n##### L21 #####")
# T21T2 7: rows (A,B,Y)
T7 = [((1, 0), 0), ((1, 1), 1), ((0, 1), 1), ((1, 1), 2), ((2, 1), 2)]
vals7 = [[0, 1, 2], [0, 1]]
sc = nb_scores(T7, (0, 0), vals=vals7); print("T21T2 7 NB MLE (0,0)", sc, post(sc))
print("P(Y)", {y: F(sum(1 for r in T7 if r[1] == y), 5) for y in (0, 1, 2)})
for y in (0, 1, 2):
    ny = sum(1 for r in T7 if r[1] == y)
    pa = [F(sum(1 for r in T7 if r[1] == y and r[0][0] == a), ny) for a in (0, 1, 2)]
    pb = [F(sum(1 for r in T7 if r[1] == y and r[0][1] == b), ny) for b in (0, 1)]
    print(f" Y={y} n={ny} P(A=0,1,2|y)={pa} P(B=0,1|y)={pb}")
sc = nb_scores(T7, (0, 0), laplace=True, vals=vals7); print("add-one (0,0)", sc, {k: float(v) for k, v in sc.items()}, post(sc))
for y in (0, 1, 2):
    ny = sum(1 for r in T7 if r[1] == y)
    print(f" Y={y} add-one P(A=0|y)={F(sum(1 for r in T7 if r[1]==y and r[0][0]==0)+1, ny+3)} P(B=0|y)={F(sum(1 for r in T7 if r[1]==y and r[0][1]==0)+1, ny+2)}")
print("T21T2 7 params", 2+3*2+3*1)
# sum of add-one probs = 1
print("check sum add-one P(A|Y=1):", sum(F(sum(1 for r in T7 if r[1]==1 and r[0][0]==a)+1, 2+3) for a in (0,1,2)))
print("check numerator-only sum:", sum(F(sum(1 for r in T7 if r[1]==1 and r[0][0]==a)+1, 2) for a in (0,1,2)))
# m-estimate equals add-one
n, nc, k = 8, 3, 3
print("m-estimate m=k,p=1/k:", F(nc*1+0, 1)*0 + (F(nc)+k*F(1, k))/(n+k), "add-one:", F(nc+1, n+k))
# T21T2 6
print("T21T2 6 MLE", F(1, 3), "add-one", F(1+1, 3+3), "numerator only", F(2, 3))

# pretest L21 [nou]: spam: 10 spam emails, 0 contain 'bonus'; regular 30, 6 contain
print("-- pretest L21")
# 2.8
S28 = [((1, 0, 0), "R", 1), ((0, 0, 1), "R", 1), ((1, 0, 0), "R", 1), ((1, 1, 0), "R", 1), ((0, 1, 0), "S", 4), ((0, 1, 1), "S", 4)]
rows = [(a, y) for a, y, c in S28 for _ in range(c)]
print("2.8 N", Counter(r[1] for r in rows))
names = ["study", "free", "money"]
for i, nm in enumerate(names):
    for y in ("S", "R"):
        ny = sum(1 for r in rows if r[1] == y); c = sum(1 for r in rows if r[1] == y and r[0][i] == 1)
        print(f"  {nm}|{y}: MLE {F(c, ny)}  add-one {F(c+1, ny+2)}")
pS = F(1, 10)
def score(y, x, prior):
    s = prior
    for i, xi in enumerate(x):
        ny = sum(1 for r in rows if r[1] == y); c = sum(1 for r in rows if r[1] == y and r[0][i] == 1)
        p = F(c+1, ny+2)
        s *= p if xi == 1 else 1-p
    return s
sS = score("S", (1, 0, 1), pS); sR = score("R", (1, 0, 1), 1-pS)
print("2.8c", sS, sR, sS/(sS+sR), float(sS/(sS+sR)))
p = F(800, 827); sS = score("S", (1, 0, 1), p); sR = score("R", (1, 0, 1), 1-p); print("2.8d check", sS/(sS+sR))
sS = score("S", (1, 0, 1), F(2, 3)); sR = score("R", (1, 0, 1), F(1, 3)); print("2.8 with MLE prior 2/3:", float(sS/(sS+sR)))
# without Laplace: study|spam = 0
print("2.8 no-Laplace score spam = 0 (study|spam = 0/8)")
# 2.30
xP = [[1,0,1,1,1,0,1,1],[0,0,0,1,0,0,1,1],[1,0,0,1,1,0,1,0],[0,1,0,0,1,1,0,1],[0,0,0,1,1,0,1,1],[0,0,0,1,1,0,0,1]]
xS = [[1,1,0,0,0,0,0,0],[0,0,1,0,0,0,0,0],[1,1,0,1,0,0,0,0],[1,1,0,1,0,0,0,1],[1,1,0,1,1,0,0,0],[0,0,0,1,0,1,0,0],[1,1,1,1,1,0,1,0]]
x = [1,0,0,1,1,1,1,0]
def nbtext(laplace, prior_eq):
    res = {}
    for nm, X in (("pol", xP), ("sp", xS)):
        n = len(X); s = F(1, 2) if prior_eq else F(n, 13)
        for i in range(8):
            c = sum(r[i] for r in X)
            p = F(c+1, n+2) if laplace else F(c, n)
            s *= p if x[i] == 1 else 1-p
        res[nm] = s
    return res
for lap in (False, True):
    for eq in (False, True):
        r = nbtext(lap, eq); print("2.30 laplace", lap, "equal priors", eq, float(r["pol"]/(r["pol"]+r["sp"])), r["pol"]/(r["pol"]+r["sp"]))
r = nbtext(False, False); print("2.30 scores", float(r["pol"]), float(r["sp"]))
print("2.30 per-word politica:", [F(sum(rr[i] for rr in xP), 6) for i in range(8)]); print("   sport:", [F(sum(rr[i] for rr in xS), 7) for i in range(8)])
# "present words only" wrong reading
def present_only():
    res = {}
    for nm, X in (("pol", xP), ("sp", xS)):
        n = len(X); s = F(n, 13)
        for i in range(8):
            if x[i] == 1:
                s *= F(sum(r[i] for r in X), n)
        res[nm] = s
    return res
r = present_only(); print("2.30 present-only wrong", float(r["pol"]/(r["pol"]+r["sp"])))
# 2.31
Z = [((0,0,0,1,0,0,1), 1), ((0,0,1,1,0,0,0), 1), ((1,1,0,0,0,1,0), -1), ((1,0,0,0,1,1,0), -1)]
z1 = (1,0,0,0,0,1,0); z2 = (0,1,1,0,0,1,1)
for nm, z in (("z1", z1), ("z2", z2)):
    sc = nb_scores(Z, z, vals=[[0,1]]*7); print("2.31 raw", nm, sc, post(sc))
    sc = nb_scores(Z, z, laplace=True, vals=[[0,1]]*7); print("2.31 add-one", nm, sc, post(sc))
for y in (1, -1):
    print("  P(Ai=1|y=%d) raw:"%y, [F(sum(r[0][i] for r in Z if r[1]==y), 2) for i in range(7)], " add-one:", [F(sum(r[0][i] for r in Z if r[1]==y)+1, 4) for i in range(7)])

print("\n##### L22 #####")
def expected_error(pj, decide):
    """pj: dict {(x tuple, y): prob} true joint; decide: fn x -> label (ties -> list)"""
    err = F(0)
    for (x, y), p in pj.items():
        d = decide(x)
        if isinstance(d, list):  # tie: wrong with prob (len-1)/len
            err += p*(F(len(d)-1, len(d)) if y in d else 1)
        else:
            err += p if d != y else 0
    return err
# T20C 3 = 2.32
PY = {0: F(8, 10), 1: F(2, 10)}
PX1 = {(0, 0): F(7, 10), (0, 1): F(3, 10), (1, 0): F(3, 10), (1, 1): F(7, 10)}  # P(X1=x|Y=y)
true1 = {((x,), y): PY[y]*PX1[(x, y)] for x in (0, 1) for y in (0, 1)}
print("T20C3 table", {k: float(v) for k, v in true1.items()})
def nbdec1(x):
    s = {y: PY[y]*PX1[(x[0], y)] for y in (0, 1)}
    m = max(s.values()); w = [y for y in s if s[y] == m]; return w if len(w) > 1 else w[0]
print("T20C3 decisions", {x: nbdec1((x,)) for x in (0, 1)}, "error", expected_error(true1, nbdec1), float(expected_error(true1, nbdec1)))
# duplicate
true2 = {((x, x), y): PY[y]*PX1[(x, y)] for x in (0, 1) for y in (0, 1)}
def nbdec2(x):
    s = {y: PY[y]*PX1[(x[0], y)]*PX1[(x[1], y)] for y in (0, 1)}
    m = max(s.values()); w = [y for y in s if s[y] == m]; return w if len(w) > 1 else w[0]
for x in [(0, 0), (0, 1), (1, 0), (1, 1)]:
    print(" dup scores", x, {y: float(PY[y]*PX1[(x[0], y)]*PX1[(x[1], y)]) for y in (0, 1)})
print("T20C3 dup error", expected_error(true2, nbdec2), float(expected_error(true2, nbdec2)))
print(" per-cell wrong mass:", {k: float(v) for k, v in true2.items()})
# JB on dup = error: majority per x
def jbdec(pj):
    def d(x):
        s = {y: pj.get((x, y), F(0)) for y in (0, 1)}
        m = max(s.values()); w = [y for y in s if s[y] == m]; return w if len(w) > 1 else w[0]
    return d
print("T20C3 JB error single", float(expected_error(true1, jbdec(true1))), "dup", float(expected_error(true2, jbdec(true2))))
# NB's own distribution P_NB(Y=1|x) for the single attribute: equals true P(Y|x)
print("P(Y=1|X1=0) true", true1[((0,), 1)]/(true1[((0,), 1)]+true1[((0,), 0)]), "P(Y=1|X1=1)", true1[((1,), 1)]/(true1[((1,), 1)]+true1[((1,), 0)]))
# P_NB for dup (1,1): 
s0 = PY[0]*F(3, 10)**2; s1 = PY[1]*F(7, 10)**2
print("P_NB(Y=1|1,1) dup", s1/(s0+s1), float(s1/(s0+s1)), " true P(Y=1|X1=1)", F(14, 38))

# pretest L22 [nou]: P(Y)=(0.7,0.3), P(X1=0|Y): 0.6 (Y=0), 0.1 (Y=1)
print("-- pretest L22")
PY2 = {0: F(7, 10), 1: F(3, 10)}; P1 = {(0, 0): F(6, 10), (1, 0): F(4, 10), (0, 1): F(1, 10), (1, 1): F(9, 10)}
tr = {((x,), y): PY2[y]*P1[(x, y)] for x in (0, 1) for y in (0, 1)}
print({k: float(v) for k, v in tr.items()})
def nbd(x):
    s = {y: PY2[y]*P1[(x[0], y)] for y in (0, 1)}; m = max(s.values()); w = [y for y in s if s[y] == m]; return w if len(w) > 1 else w[0]
print("decisions", {x: nbd((x,)) for x in (0, 1)}, "error", float(expected_error(tr, nbd)))

# 2.9 parameter counts, X1..X4 Bernoulli, Y Bernoulli
print("-- 2.9 params: NB", 1+2*4, " New-Bayes(X1|y)(X2|y)(X3,X4|y)", 1+2*1+2*1+2*3, " JB", 2**5-1)
# 2.11: all 16 functions
cells = [(0, 0), (0, 1), (1, 0), (1, 1)]
res = {}
for ys in itertools.product((1, 2), repeat=4):
    f = dict(zip(cells, ys))
    pj = {((a, b), f[(a, b)]): F(1, 4) for (a, b) in cells}
    py = {y: sum(v for (x, yy), v in pj.items() if yy == y) for y in (1, 2)}
    def cond(i, v, y):
        return sum(v2 for (x, yy), v2 in pj.items() if yy == y and x[i] == v)/py[y] if py[y] else F(0)
    def dec(x):
        s = {y: py[y]*cond(0, x[0], y)*cond(1, x[1], y) for y in (1, 2)}
        m = max(s.values()); w = [y for y in s if s[y] == m]; return w if len(w) > 1 else w[0]
    res[ys] = expected_error(pj, dec)
print("2.11 errors:", {k: float(v) for k, v in res.items()})
print("2.11 #zero", sum(1 for v in res.values() if v == 0), "#half", sum(1 for v in res.values() if v == F(1, 2)))
# xor scores in cell (0,0)
print("xor cell (0,0): P(Y=1)=1/2, P(X1=0|Y=1)=1/2, P(X2=0|Y=1)=1/2 ->", F(1, 2)**3, "; same for Y=2")
# case 2 (Y=1 on 00,01,10 ; Y=2 on 11)
f = {(0, 0): 1, (0, 1): 1, (1, 0): 1, (1, 1): 2}
print("case2: P(Y=1)=3/4 P(X1=0|1)=2/3 P(X2=0|1)=2/3 ; Y=2: P(X1=0|2)=0")
for (a, b) in cells:
    p1 = F(3, 4)*(F(2, 3) if a == 0 else F(1, 3))*(F(2, 3) if b == 0 else F(1, 3))
    p2 = F(1, 4)*(1 if a == 1 else 0)*(1 if b == 1 else 0)
    print("  cell", (a, b), p1, p2)
# 2.33
print("-- 2.33")
P_h = F(1, 2); Ps = {1: F(8, 10), 0: F(7, 10)}; Pw = {1: F(4, 10), 0: F(5, 10)}  # Sunny|Hike=T ,Sunny|Hike=F ; Windy
def sP(sun, y):  # P(Sunny=sun|Hike=y)
    p = F(8, 10) if y == 1 else F(7, 10); return p if sun else 1-p
def wP(w, y):
    p = F(4, 10) if y == 1 else F(5, 10); return p if w else 1-p
true33 = {}
for sun in (0, 1):
    for w in (0, 1):
        for y in (0, 1):
            true33[((sun, w), y)] = F(1, 2)*sP(sun, y)*wP(w, y)
print("2.33 a P(S=T,W=T,H=T)", true33[((1, 1), 1)])
def nb33(x):
    s = {y: F(1, 2)*sP(x[0], y)*wP(x[1], y) for y in (0, 1)}; m = max(s.values()); w = [y for y in s if s[y] == m]
    return w if len(w) > 1 else w[0]
for x in [(0, 0), (0, 1), (1, 0), (1, 1)]:
    s = {y: F(1, 2)*sP(x[0], y)*wP(x[1], y) for y in (0, 1)}
    print("  x", x, "decision", nb33(x), "P_NB(T)", float(s[1]/(s[0]+s[1])), {y: float(v) for y, v in s.items()})
print("2.33 c", expected_error(true33, nb33), float(expected_error(true33, nb33)))
# with Rainy = not Sunny
true33b = {}
for (x, y), p in true33.items():
    true33b[((x[0], x[1], 1-x[0]), y)] = p
def nb33b(x):
    s = {y: F(1, 2)*sP(x[0], y)*wP(x[1], y)*(F(2, 10) if (y == 1 and x[2] == 1) else (F(8, 10) if y == 1 else (F(3, 10) if x[2] == 1 else F(7, 10)))) for y in (0, 1)}
    # P(Rainy|Hike) = P(not Sunny|Hike)
    s = {}
    for y in (0, 1):
        pr = (1-sP(1, y)) if x[2] == 1 else sP(1, y)
        s[y] = F(1, 2)*sP(x[0], y)*wP(x[1], y)*pr
    m = max(s.values()); w = [y for y in s if s[y] == m]; return w if len(w) > 1 else w[0]
print("2.33 e P(S=T,W=T,R=F,H=T)", true33b[((1, 1, 0), 1)])
print("2.33 f", expected_error(true33b, nb33b), float(expected_error(true33b, nb33b)))
for x in [(0, 0, 1), (0, 1, 1), (1, 0, 0), (1, 1, 0)]:
    print("  3attr decision", x, nb33b(x))
# per-row error contributions
print("2.33 error rows (2 attrs):", [(k, float(v)) for k, v in true33.items() if nb33(k[0]) != k[1]])
print("2.33 error rows (3 attrs):", [(k, float(v)) for k, v in true33b.items() if nb33b(k[0]) != k[1]])
# 2.35
print("-- 2.35")
rows35 = []
for A, B, C in itertools.product((0, 1), repeat=3):
    Y = int((A and B) or (not (B or C)))
    rows35.append(((A, B, C), Y))
print(rows35)
py = {y: F(sum(1 for r in rows35 if r[1] == y), 8) for y in (0, 1)}; print("P(Y)", py)
for i, nm in enumerate("ABC"):
    for y in (0, 1):
        ny = sum(1 for r in rows35 if r[1] == y); c = sum(1 for r in rows35 if r[1] == y and r[0][i] == 1)
        print(f"  P({nm}=1|Y={y}) = {F(c, ny)}")
errs = []
for r in rows35:
    x, y = r
    s = {yy: py[yy]*F(sum(1 for q in rows35 if q[1] == yy and q[0][0] == x[0]), 4)*F(sum(1 for q in rows35 if q[1] == yy and q[0][1] == x[1]), 4)*F(sum(1 for q in rows35 if q[1] == yy and q[0][2] == x[2]), 4) for yy in (0, 1)}
    d = 1 if s[1] >= s[0] else 0
    print("  ", x, "Y", y, {k: float(v) for k, v in s.items()}, "NB", d, "tie" if s[1] == s[0] else "", "ERR" if d != y else "")
    errs.append(d != y)
print("2.35 NB error", F(sum(errs), 8))
# slices
for b in (0, 1):
    for y in (0, 1):
        sl = [r[0] for r in rows35 if r[0][1] == b and r[1] == y]; print("  slice B=%d Y=%d" % (b, y), sl)
# 11 params for in-between; JB params
print("2.35 params NB 7, JB 15, new", 1+2+4+4)
# 2.36 y=A and B
rows36 = [((A, B), int(A and B)) for A in (0, 1) for B in (0, 1)]
py = {y: F(sum(1 for r in rows36 if r[1] == y), 4) for y in (0, 1)}
for x in [(0, 0), (0, 1), (1, 0), (1, 1)]:
    s = {y: py[y]*F(sum(1 for q in rows36 if q[1] == y and q[0][0] == x[0]), sum(1 for q in rows36 if q[1] == y))*F(sum(1 for q in rows36 if q[1] == y and q[0][1] == x[1]), sum(1 for q in rows36 if q[1] == y)) for y in (0, 1)}
    print("2.36", x, {k: str(v) for k, v in s.items()}, "label", int(x[0] and x[1]))
print("2.36 P(A=1,B=1|y=0)=0 vs P(A=1|y=0)P(B=1|y=0)=", F(1, 3)*F(1, 3))

print("\n##### extra L22 (error wrt P_NB) #####")
# T20C 3 duplicate: NB's own (unnormalised-over-cells) joint
tot = F(0); errNB = F(0)
for x in [(0, 0), (0, 1), (1, 0), (1, 1)]:
    s = {y: PY[y]*PX1[(x[0], y)]*PX1[(x[1], y)] for y in (0, 1)}
    tot += sum(s.values()); d = 0 if s[0] >= s[1] else 1
    errNB += s[1-d]
print("P_NB total mass", tot, " error wrt P_NB", errNB, float(errNB))
# pretest L22 [nou]: P(Y)=(0.6,0.4), P(X1=0|Y)=0.8 / 0.3
PYp = {0: F(6, 10), 1: F(4, 10)}; P1p = {(0, 0): F(8, 10), (1, 0): F(2, 10), (0, 1): F(3, 10), (1, 1): F(7, 10)}
trp = {((x,), y): PYp[y]*P1p[(x, y)] for x in (0, 1) for y in (0, 1)}
print("pretest L22 table", {k: float(v) for k, v in trp.items()})
def nbp(x):
    s = {y: PYp[y]*P1p[(x[0], y)] for y in (0, 1)}; m = max(s.values()); w = [y for y in s if s[y] == m]; return w if len(w) > 1 else w[0]
print("pretest L22 decisions", {x: nbp((x,)) for x in (0, 1)}, "error", expected_error(trp, nbp), float(expected_error(trp, nbp)))
# quiz L22 numbers [nou]: duplicated attribute with weaker evidence: P(Y)=(0.5,0.5), P(X=1|Y)=(0.4,0.6): single attr; with copy
# adding a feature never hurts? use 2.33: 0.435 -> 0.45 (book)

print("\n##### MOCK T1 #####")
# P1a
pd_, rj_d, rj_g = F(4, 1000), F(95, 100), F(8, 100)
s1 = rj_d*pd_; s2 = rj_g*(1-pd_)
print("P1a", s1, s2, s1/(s1+s2), float(s1/(s1+s2)), "P(respinsa)", float(s1+s2))
# P1b
pA, pB, pU = F(4, 10), F(25, 100), F(6, 10)
print("P1b P(A∩B)=", pA+pB-pU, " product", pA*pB)
# P2 tables
t = {(0, 0): F(20, 100), (0, 1): F(12, 100), (0, 2): F(8, 100), (1, 0): F(30, 100), (1, 1): F(18, 100), (1, 2): F(12, 100)}
assert sum(t.values()) == 1
pX = {x: sum(v for (a, b), v in t.items() if a == x) for x in (0, 1)}; pY = {y: sum(v for (a, b), v in t.items() if b == y) for y in (0, 1, 2)}
print("P2 marginals", pX, pY, "indep all cells", all(t[(x, y)] == pX[x]*pY[y] for x in (0, 1) for y in (0, 1, 2)))
EX = sum(x*pX[x] for x in pX); EY = sum(y*pY[y] for y in pY); EY2 = sum(y*y*pY[y] for y in pY); EXY = sum(x*y*v for (x, y), v in t.items())
print("P2 E[X]", EX, "E[Y]", EY, "E[Y^2]", EY2, "Var[Y]", EY2-EY**2, "E[XY]", EXY, "Cov", EXY-EX*EY, "Var[X]", sum(x*x*pX[x] for x in pX)-EX**2)
# p,q solve: given 0.20,p,0.08,0.30,0.18,q ; independence P(0,0)/P(1,0)=P(0,*)/P(1,*)
ratio = F(20, 30)   # P(X=0)/P(X=1)
p_ = ratio*F(18, 100); q_ = F(8, 100)/ratio
print("P2 p,q", p_, q_, "sum", F(20, 100)+p_+F(8, 100)+F(30, 100)+F(18, 100)+q_)
# P2b three-variable table
J = {(0, 0, 0): F(10, 100), (0, 1, 0): F(10, 100), (1, 0, 0): F(15, 100), (1, 1, 0): F(15, 100),
     (0, 0, 1): F(3, 100), (0, 1, 1): F(7, 100), (1, 0, 1): F(12, 100), (1, 1, 1): F(28, 100)}
assert sum(J.values()) == 1
for z in (0, 1):
    pz = sum(v for (x, y, zz), v in J.items() if zz == z)
    for x in (0, 1):
        for y in (0, 1):
            pxy = J[(x, y, z)]/pz
            px = sum(v for (a, b, zz), v in J.items() if zz == z and a == x)/pz; py = sum(v for (a, b, zz), v in J.items() if zz == z and b == y)/pz
            print(f"P2b z={z} x={x} y={y} P(x,y|z)={pxy} P(x|z)P(y|z)={px*py} {'OK' if pxy==px*py else 'DIFF'}")
pXm = sum(v for (a, b, zz), v in J.items() if a == 0); pYm = sum(v for (a, b, zz), v in J.items() if b == 0); pXY = sum(v for (a, b, zz), v in J.items() if a == 0 and b == 0)
print("P2b unconditional: P(X=0)", pXm, "P(Y=0)", pYm, "product", pXm*pYm, "P(X=0,Y=0)", pXY)
# P3
def hb(p): return H(p, 1-p)
print("P3 H(1/6)", hb(F(1, 6)), "H(1/3)", hb(F(1, 3)), "H(1/2)", 1.0, "IG(A)", 1-hb(F(1, 6)), "IG(B)", 1-hb(F(1, 3)))
rows3 = [(0, 0, 1)]*3+[(0, 0, 0)]+[(0, 1, 1)]*2+[(1, 0, 1), (1, 0, 0)]+[(1, 1, 0)]*4
print("P3 rows", len(rows3), "A=0", [r[2] for r in rows3 if r[0] == 0], "A=1", [r[2] for r in rows3 if r[0] == 1], "B=0", [r[2] for r in rows3 if r[1] == 0], "B=1", [r[2] for r in rows3 if r[1] == 1])
# P3a joint table for IG substitution: not used (A used)
# P3 the IG of A numerically: H(Y)=H(1/2)=1; H(Y|A)=1/2 H(1/6)+1/2 H(1/6)
# P4 ID3 with continuous attribute (see mock design): rows (A,B,C,Y)
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
print("\n--- P4 (ID3 dataset) ---")
rows4 = [(0, 1, 2, 1), (0, 1, 3, 1), (0, 1, 3, 1), (1, 0, 5, 0), (1, 1, 6, 0), (0, 1, 8, 1), (1, 1, 8, 1), (1, 1, 10, 0)]
def ent_l(ls):
    n = len(ls)
    if n == 0: return 0.0
    return -sum((ls.count(v)/n)*log2(ls.count(v)/n) for v in set(ls))
ys4 = [r[3] for r in rows4]
print("H(Y)", ent_l(ys4), "[5+,3-]")
def cond(rows, keyfn):
    parts = {}
    for r in rows: parts.setdefault(keyfn(r), []).append(r[3])
    return sum(len(v)/len(rows)*ent_l(v) for v in parts.values()), {k: (v.count(1), v.count(0)) for k, v in parts.items()}
for nm, fn in [("A", lambda r: r[0]), ("B", lambda r: r[1]), ("C<=4", lambda r: r[2] <= 4), ("C<=7", lambda r: r[2] <= 7), ("C<=9", lambda r: r[2] <= 9)]:
    c, parts = cond(rows4, fn); print(f" root {nm}: H(Y|.)={c:.4f} IG={ent_l(ys4)-c:.4f} parts {parts}")
sub = [r for r in rows4 if r[0] == 1]; print(" A=1 subset", sub, ent_l([r[3] for r in sub]))
for nm, fn in [("B", lambda r: r[1]), ("C<=7", lambda r: r[2] <= 7), ("C<=9", lambda r: r[2] <= 9), ("C<=4", lambda r: r[2] <= 4)]:
    c, parts = cond(sub, fn); print(f"  A=1 {nm}: H={c:.4f} IG={ent_l([r[3] for r in sub])-c:.4f} parts {parts}")
sub2 = [r for r in sub if r[2] > 7]; print(" A=1,C>7", sub2)
for nm, fn in [("B", lambda r: r[1]), ("C<=9", lambda r: r[2] <= 9)]:
    c, parts = cond(sub2, fn); print(f"  A=1,C>7 {nm}: H={c:.4f} IG={ent_l([r[3] for r in sub2])-c:.4f} parts {parts}")
# thresholds count: distinct values, label changes
srt = sorted(set(r[2] for r in rows4)); print("distinct C", srt, "midpoints of all distinct neighbours", [(a+b)/2 for a, b in zip(srt, srt[1:])])
lab = {}
for r in rows4: lab.setdefault(r[2], set()).add(r[3])
print("label sets", lab)
# P4 tree check with own implementation
from id3c import build, show as showt, anyties, size, classify
t4 = build(rows4, [0, 1, 2], ['d', 'd', 'c']); showt(t4, 0, ['A', 'B', 'C']); print("ties", anyties(t4), "size", size(t4), "train err", sum(classify(t4, r[:3]) != r[3] for r in rows4))
print("classify (A=1,B=0,C=8.5):", classify(t4, (1, 0, 8.5)))
print("H hints: H(1/4)", hb(F(1, 4)), "H(3/8)", hb(F(3, 8)), "H(1/3)", hb(F(1, 3)), "H(1/2)", 1, "H(2/3)", hb(F(2, 3)), "H(1/5)", hb(F(1, 5)), "H(2/5)", hb(F(2, 5)), "H(3/7)", hb(F(3, 7)))
print("H(2/7)", hb(F(2, 7)))
print("\n--- P5 (CVLOO figure) ---")
rows5 = [(1, 2, 1), (2, 2, 1), (3, 2, 1), (4, 2, 1), (1, 1, 0), (2, 1, 1), (3, 1, 0), (4, 1, 0)]   # (x1,x2,label) 1='+', 0='-'
from id3c import candidates, cond_ent, ent as ent_g
def preds5(rows, x):
    ys = [r[-1] for r in rows]
    if len(set(ys)) == 1: return {ys[0]}
    cands = candidates(rows, [0, 1], ['c', 'c'])
    if not cands: return {max(set(ys), key=ys.count)}
    h0 = ent_g(ys); scored = [(h0-cond_ent(rows, c, ['c', 'c']), c) for c in cands]; m = max(s for s, c in scored)
    out = set()
    for s, c in scored:
        if abs(s-m) < 1e-9:
            i, t = c
            sub = [r for r in rows if r[i] <= t] if x[i] <= t else [r for r in rows if r[i] > t]
            out |= preds5(sub, x)
    return out
t5 = build(rows5, [0, 1], ['c', 'c']); showt(t5, 0, ['X1', 'X2']); print("train err", sum(classify(t5, r[:2]) != r[2] for r in rows5))
e5 = []
for i, r in enumerate(rows5):
    p = preds5(rows5[:i]+rows5[i+1:], r[:2])
    print(" leave out", r[:2], "label", r[2], "pred", p)
    if p != {r[2]}: e5.append(r[:2])
print("CVLOO DT*", e5, F(len(e5), 8))
# DT2 = one test; root X1<=1.5 on full data
print("root IGs", [(c, round(ent_g([r[2] for r in rows5])-cond_ent(rows5, c, ['c','c']), 4)) for c in candidates(rows5, [0, 1], ['c', 'c'])])
# DT2 train error and CVLOO were computed in the search: train 1/8 (the + at (2,1)), CVLOO 1/8 (the + at (2,1))
def dt2_pred(tr, x):
    cands = candidates(tr, [0, 1], ['c', 'c']); h0 = ent_g([r[2] for r in tr])
    sc = [(h0-cond_ent(tr, c, ['c', 'c']), c) for c in cands]; m = max(s for s, c in sc); best = [c for s, c in sc if abs(s-m) < 1e-9]
    assert len(best) == 1, best
    i, t = best[0]; side = [r[2] for r in tr if (r[i] <= t) == (x[i] <= t)]
    assert side.count(0) != side.count(1)
    return int(side.count(1) > side.count(0)), best[0]
print("DT2 train errs", [r[:2] for r in rows5 if dt2_pred(rows5, r[:2])[0] != r[2]])
e5b = []
for i, r in enumerate(rows5):
    p, c = dt2_pred(rows5[:i]+rows5[i+1:], r[:2]); print(" DT2 leave out", r[:2], "root", c, "pred", p)
    if p != r[2]: e5b.append(r[:2])
print("DT2 CVLOO", e5b)

print("\n--- P6 (NB vs JB counts) ---")
C6 = {(0, 0, 0): 4, (1, 0, 0): 4, (0, 1, 0): 0, (1, 1, 0): 0, (0, 0, 1): 5, (0, 1, 1): 1, (1, 0, 1): 1, (1, 1, 1): 5}
R6 = [((a, b), y) for (a, b, y), c in C6.items() for _ in range(c)]
print("N", len(R6), Counter(r[1] for r in R6))
for x in [(0, 0), (1, 0), (1, 1), (0, 1)]:
    sn = nb_scores(R6, x, vals=[[0, 1], [0, 1]]); sj = jb_scores(R6, x)
    print("x", x, "NB", {k: str(v) for k, v in sn.items()}, post(sn), "JB", {k: str(v) for k, v in sj.items()}, post(sj))
print("P6 factors: P(Y=0)=", F(8, 20), "P(A=1|0)=", F(4, 8), "P(B=0|0)=", F(8, 8), "; P(Y=1)=", F(12, 20), "P(A=1|1)=", F(6, 12), "P(B=0|1)=", F(6, 12))
print("P6 add-one P(B=1|Y=0)=", F(0+1, 8+2), "MLE", F(0, 8))
sn = nb_scores(R6, (0, 1), laplace=True, vals=[[0, 1], [0, 1]]); print("P6 add-one x=(0,1)", sn, post(sn)); 
sn = nb_scores(R6, (0, 1), vals=[[0, 1], [0, 1]]); print("P6 MLE x=(0,1)", sn, post(sn))
print("P6 cond indep check Y=1: P(A=0,B=0|1)=", F(5, 12), "product", F(6, 12)*F(6, 12))
print("P6 params NB", 5, "JB", 7)

print("\n##### T21P #####")
print("item 10 H(Y|A)=3/8 H(1/3)+5/8 H(1/5) =", F(3, 8)*hb(F(1, 3))+F(5, 8)*hb(F(1, 5)), " expression terms", hb(F(1, 3)), hb(F(1, 5)))
print("   H(3/8 total)", hb(F(3, 8)), "IG", hb(F(3, 8))-(3/8*hb(F(1, 3))+5/8*hb(F(1, 5))))
t11 = {(1, 0): F(4, 10), (2, 0): F(2, 10), (1, 1): F(1, 10), (2, 1): F(1, 10), (1, 2): F(1, 10), (2, 2): F(1, 10)}
assert sum(t11.values()) == 1
pX = {x: sum(v for (a, b), v in t11.items() if a == x) for x in (1, 2)}; pY = {y: sum(v for (a, b), v in t11.items() if b == y) for y in (0, 1, 2)}
EX = sum(x*p for x, p in pX.items()); EY = sum(y*p for y, p in pY.items()); EXY = sum(x*y*v for (x, y), v in t11.items()); EY2 = sum(y*y*p for y, p in pY.items())
print("T21P 11: P(X)", pX, "P(Y)", pY, "E[X]", EX, "E[Y]", EY, "E[Y^2]", EY2, "Var[Y]", EY2-EY**2, "E[XY]", EXY, "Cov", EXY-EX*EY)
print("   indep? P(X=1,Y=0)=", t11[(1, 0)], "P(X=1)P(Y=0)=", pX[1]*pY[0])
print("   H[X] subst terms", pX, "value", H(*pX.values()))
HYX = sum(pX[x]*H(*[t11[(x, y)]/pX[x] for y in (0, 1, 2)]) for x in (1, 2)); print("   H[Y|X]=", HYX, " X=1 dist", [t11[(1, y)]/pX[1] for y in (0, 1, 2)], " X=2 dist", [t11[(2, y)]/pX[2] for y in (0, 1, 2)])
j13 = {(0, 0, 0): F(1, 10), (1, 0, 0): F(2, 10), (0, 1, 0): F(1, 10), (1, 1, 0): F(1, 10), (0, 0, 1): F(1, 10), (1, 0, 1): F(2, 10), (0, 1, 1): F(1, 10), (1, 1, 1): F(1, 10)}
assert sum(j13.values()) == 1
pz0 = sum(v for (x, y, z), v in j13.items() if z == 0)
print("T21P 13: P(X=0,Y=0,Z=0)", j13[(0, 0, 0)], "P(Z=0)", pz0, "P(X=0,Y=0|Z=0)", j13[(0, 0, 0)]/pz0)
for x in (0, 1):
    for y in (0, 1):
        pxy = j13[(x, y, 0)]/pz0; px = sum(j13[(x, yy, 0)] for yy in (0, 1))/pz0; py = sum(j13[(xx, y, 0)] for xx in (0, 1))/pz0
        print(f"   z=0 x={x} y={y}: {pxy} vs {px*py}")
# item 9: sets
pk = F(1, 2)*F(9, 10)+F(1, 2)*F(4, 5); print("T21P 9a", pk, float(pk), "9b", F(1, 2)*F(9, 10)/pk, float(F(1, 2)*F(9, 10)/pk))
# item 3
print("T21P 3: 20*0.1+20*0.7 =", 20*F(1, 10)+20*F(7, 10))
# item 8
print("T21P 8 MLE die:", {f: F([1,2,3,4,5,6,1,1,1,1].count(f), 10) for f in range(1, 7)})
# item 14 stumps
r14 = [(0, 0, 0), (0, 1, 1), (1, 0, 1), (1, 1, 1), (1, 0, 0), (0, 1, 0)]
for nm, i in (("A", 0), ("B", 1)):
    print("item 14 stump", nm, {v: ([r[2] for r in r14 if r[i] == v].count(1), [r[2] for r in r14 if r[i] == v].count(0)) for v in (0, 1)})
print("item 14 actual H(Y|A)=", cond([(a, b, 0, y) for a, b, y in r14], lambda r: r[0])[0], "H(Y|B)=", cond([(a, b, 0, y) for a, b, y in r14], lambda r: r[1])[0])
print("item 14a inconsistent pairs: (1,0)->{1,0}, (0,1)->{1,0}")
# item 15 stumps
r15 = [(0, 0), (1, 1), (0, 2), (1, 0), (0, 1), (1, 2)]
print("item 15a X->Y:", {x: [y for xx, y in r15 if xx == x] for x in (0, 1)}, " 15b Y->X:", {y: [x for x, yy in r15 if yy == y] for y in (0, 1, 2)})

print("\n##### quiz numbers L20-L22 [nou] #####")
# L20 q3: counts (A=0,Y=0):3,(A=0,Y=1):1,(A=1,Y=0):1,(A=1,Y=1):3
R = [((0,), 0)]*3+[((0,), 1)]*1+[((1,), 0)]*1+[((1,), 1)]*3
print("L20 q3 NB", post(nb_scores(R, (0,))), "JB", post(jb_scores(R, (0,))))
# L20 q4
pr = {1: F(1, 2), 0: F(1, 2)}; pa = {1: F(1, 2), 0: F(1, 2)}; pb = {1: F(8, 10), 0: F(3, 10)}
good = {y: pr[y]*pa[y]*(1-pb[y]) for y in (0, 1)}; bad = {y: pr[y]*pa[y]*pb[y] for y in (0, 1)}
print("L20 q4 correct", {k: float(v) for k, v in good.items()}, float(good[0]/(good[0]+good[1])), "wrong", {k: float(v) for k, v in bad.items()})
# L21 q1
print("L21 q1", F(0+1, 4+3), "num-only", F(1, 4), "denom+1", F(1, 5))
# L21 q3 absent word
print("L21 q3 spam absent factor", 1-F(4, 5), "regular", 1-F(1, 4))
# L22 q2
PYq = {0: F(9, 10), 1: F(1, 10)}; Pq = {(1, 0): F(2, 10), (1, 1): F(7, 10)}
def pxq(x, y): return Pq[(1, y)] if x == 1 else 1-Pq[(1, y)]
t1 = {((x,), y): PYq[y]*pxq(x, y) for x in (0, 1) for y in (0, 1)}
def d1(x):
    s = {y: PYq[y]*pxq(x[0], y) for y in (0, 1)}; m = max(s.values()); w = [y for y in s if s[y] == m]; return w if len(w) > 1 else w[0]
t2 = {((x, x), y): PYq[y]*pxq(x, y) for x in (0, 1) for y in (0, 1)}
def d2(x):
    s = {y: PYq[y]*pxq(x[0], y)*pxq(x[1], y) for y in (0, 1)}; m = max(s.values()); w = [y for y in s if s[y] == m]; return w if len(w) > 1 else w[0]
print("L22 q2 single err", expected_error(t1, d1), "dup err", expected_error(t2, d2), {x: d1((x,)) for x in (0, 1)}, {x: d2((x, x)) for x in (0, 1)})
for x in (0, 1): print("   dup scores", x, {y: float(PYq[y]*pxq(x, y)**2) for y in (0, 1)})
# L22 q3 OR
cells = [(0, 0), (0, 1), (1, 0), (1, 1)]
f = {(0, 0): 0, (0, 1): 1, (1, 0): 1, (1, 1): 1}
pj = {((a, b), f[(a, b)]): F(1, 4) for (a, b) in cells}
py = {y: sum(v for (x, yy), v in pj.items() if yy == y) for y in (0, 1)}
def cond(i, v, y): return sum(v2 for (x, yy), v2 in pj.items() if yy == y and x[i] == v)/py[y]
def decOR(x):
    s = {y: py[y]*cond(0, x[0], y)*cond(1, x[1], y) for y in (0, 1)}
    for yy in (0, 1): pass
    m = max(s.values()); w = [y for y in s if s[y] == m]; return w if len(w) > 1 else w[0]
print("L22 q3 OR NB error", expected_error(pj, decOR), {c: {y: float(py[y]*cond(0, c[0], y)*cond(1, c[1], y)) for y in (0, 1)} for c in cells})
# 2.11 case 1 and 3 score tables
for nm, f in {"case1 (Y=1 everywhere)": {c: 1 for c in cells}, "case3 (Y=1 on X2=0)": {(0, 0): 1, (0, 1): 2, (1, 0): 1, (1, 1): 2}}.items():
    pj = {((a, b), f[(a, b)]): F(1, 4) for (a, b) in cells}; py = {y: sum(v for (x, yy), v in pj.items() if yy == y) for y in (1, 2)}
    def cnd(i, v, y): return sum(v2 for (x, yy), v2 in pj.items() if yy == y and x[i] == v)/py[y] if py[y] else F(0)
    print("2.11", nm)
    for c in cells:
        print("   cell", c, {y: str(py[y]*cnd(0, c[0], y)*cnd(1, c[1], y)) for y in (1, 2)}, "label", f[c])
# 2.36: which of the 16 functions have A dependent of B given y AND NB error 0
good_funcs = []
for ys in itertools.product((0, 1), repeat=4):
    f = dict(zip(cells, ys)); pj = {((a, b), f[(a, b)]): F(1, 4) for (a, b) in cells}
    py = {y: sum(v for (x, yy), v in pj.items() if yy == y) for y in (0, 1)}
    dep = False
    for y in (0, 1):
        if py[y] == 0: continue
        for a in (0, 1):
            for b in (0, 1):
                pab = pj.get(((a, b), y), F(0))/py[y]
                pa_ = sum(pj.get(((a, bb), y), F(0)) for bb in (0, 1))/py[y]; pb_ = sum(pj.get(((aa, b), y), F(0)) for aa in (0, 1))/py[y]
                if pab != pa_*pb_: dep = True
    def cnd(i, v, y): return sum(v2 for (x, yy), v2 in pj.items() if yy == y and x[i] == v)/py[y] if py[y] else F(0)
    def dec(x):
        s = {y: py[y]*cnd(0, x[0], y)*cnd(1, x[1], y) for y in (0, 1)}; m = max(s.values()); w = [y for y in s if s[y] == m]; return w if len(w) > 1 else w[0]
    err = expected_error(pj, dec)
    if dep and err == 0: good_funcs.append(ys)
print("2.36 functions (y on 00,01,10,11) with A not cond. indep. of B given y and NB error 0:", good_funcs)
# mock P6: verify nothing else; L19 quiz Q numbers done
