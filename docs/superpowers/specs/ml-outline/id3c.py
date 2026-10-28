from math import log2
from fractions import Fraction as F
import random, itertools

def ent(labels):
    n = len(labels)
    if n == 0: return 0.0
    r = 0.0
    for v in set(labels):
        p = labels.count(v)/n; r -= p*log2(p)
    return r

def candidates(rows, attrs, kinds):
    """rows: list of tuples (a0..ak, y). attrs: indices; kinds[i] 'd' or 'c'. returns list of (name, splitfn_key)"""
    out = []
    for i in attrs:
        if kinds[i] == 'd':
            vals = sorted(set(r[i] for r in rows))
            if len(vals) > 1: out.append((i, None))
        else:
            vals = sorted(set(r[i] for r in rows))
            # thresholds: midpoint between neighbouring distinct values whose label sets differ (or mixed)
            for a, b in zip(vals, vals[1:]):
                la = set(r[-1] for r in rows if r[i] == a); lb = set(r[-1] for r in rows if r[i] == b)
                if len(la | lb) > 1 and not (len(la) == 1 and la == lb):
                    out.append((i, (a+b)/2))
    return out

def cond_ent(rows, cand, kinds):
    i, t = cand
    if t is None:
        parts = {}
        for r in rows: parts.setdefault(r[i], []).append(r[-1])
    else:
        parts = {0: [r[-1] for r in rows if r[i] <= t], 1: [r[-1] for r in rows if r[i] > t]}
    n = len(rows)
    return sum(len(v)/n*ent(v) for v in parts.values())

def build(rows, attrs, kinds, order=None):
    ys = [r[-1] for r in rows]
    if len(set(ys)) == 1: return ('leaf', ys[0], len(rows))
    cands = candidates(rows, attrs, kinds)
    # discrete attrs used on path are removed by caller
    if not cands: return ('leaf', max(set(ys), key=ys.count), len(rows))
    h0 = ent(ys)
    scored = [(h0-cond_ent(rows, c, kinds), c) for c in cands]
    m = max(s for s, c in scored)
    best = [c for s, c in scored if abs(s-m) < 1e-9]
    c = best[0]
    ties = len(best) > 1
    i, t = c
    if t is None:
        vals = sorted(set(r[i] for r in rows))
        ch = {v: build([r for r in rows if r[i] == v], [a for a in attrs if a != i], kinds) for v in vals}
        return ('d', i, m, ties, ch)
    return ('c', i, t, m, ties, build([r for r in rows if r[i] <= t], attrs, kinds), build([r for r in rows if r[i] > t], attrs, kinds))

def classify(tree, x):
    while tree[0] != 'leaf':
        if tree[0] == 'd':
            tree = tree[4].get(x[tree[1]], None)
            if tree is None: return None
        else:
            tree = tree[5] if x[tree[1]] <= tree[2] else tree[6]
    return tree[1]

def size(tree):
    if tree[0] == 'leaf': return 0
    if tree[0] == 'd': return 1+sum(size(c) for c in tree[4].values())
    return 1+size(tree[5])+size(tree[6])

def anyties(tree):
    if tree[0] == 'leaf': return False
    if tree[0] == 'd': return tree[3] or any(anyties(c) for c in tree[4].values())
    return tree[4] or anyties(tree[5]) or anyties(tree[6])

def show(tree, ind=0, names=None):
    p = '  '*ind
    if tree[0] == 'leaf': print(p+f"-> {tree[1]} ({tree[2]})"); return
    if tree[0] == 'd':
        print(p+f"{names[tree[1]]} (IG {tree[2]:.4f})")
        for v, c in tree[4].items(): print(p+f" ={v}:"); show(c, ind+2, names)
    else:
        print(p+f"{names[tree[1]]} <= {tree[2]} (IG {tree[3]:.4f})"); show(tree[5], ind+2, names); print(p+" else"); show(tree[6], ind+2, names)
