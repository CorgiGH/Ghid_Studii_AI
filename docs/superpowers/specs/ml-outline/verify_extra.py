from fractions import Fraction as F
from itertools import product
import math
# 2.24
def post(lik):
    pri=F(1,3); t=sum(pri*lik[k] for k in lik); return {k:pri*lik[k]/t for k in lik}
print('2.24a',post({'A':F(1,2),'B':F(0),'C':F(1)}))
print('2.24b',post({'A':F(1,2),'B':F(0),'C':F(1,2)}))
print('2.24c',post({'A':F(1,2),'B':F(0),'C':F(1,2)}))
# 2.25: prisoners: guard says b executed
lik={'a':F(1,2),'b':F(0),'c':F(1)}
print('2.25',post(lik))
# 2.35 NB error: Y=(A&B)|~(B|C)
rows=list(product([0,1],repeat=3))
Y={r:int((r[0] and r[1]) or (not (r[1] or r[2]))) for r in rows}
py1=F(sum(Y.values()),8)
def pcond(i,v,y):
    num=sum(1 for r in rows if Y[r]==y and r[i]==v); den=sum(1 for r in rows if Y[r]==y)
    return F(num,den)
err=F(0); wrong=[]
for r in rows:
    s1=py1; s0=1-py1
    for i in range(3):
        s1*=pcond(i,r[i],1); s0*=pcond(i,r[i],0)
    dec=1 if s1>=s0 else 0  # tie -> 1
    if dec!=Y[r]: err+=F(1,8); wrong.append(r)
print('2.35 P(Y=1)',py1,'NB error',err,wrong)
# free params NB: P(Y)=1 + 3*2 = 7 ; JB 15
# A indep C | B,Y ?
ok=True
for b,y in product([0,1],repeat=2):
    sub=[r for r in rows if r[1]==b and Y[r]==y]
    if not sub: continue
    for a,c in product([0,1],repeat=2):
        pac=F(sum(1 for r in sub if r[0]==a and r[2]==c),len(sub))
        pa=F(sum(1 for r in sub if r[0]==a),len(sub)); pc=F(sum(1 for r in sub if r[2]==c),len(sub))
        if pac!=pa*pc: ok=False
print('A indep C | B,Y',ok)
# 4.55 chi2
import math
data={'+':{'TT':3,'TF':4,'FT':4,'FF':1},'-':{'TT':0,'TF':1,'FT':3,'FF':5}}
inst=[]
for y,d in data.items():
    for k,n in d.items(): inst+= [(y,k[0]=='T',k[1]=='T')]*n
N=len(inst);print('N',N)
def H(p):
    return 0 if p in(0,1) else -p*math.log2(p)-(1-p)*math.log2(1-p)
def hcond(S,idx):
    t=0
    for v in (True,False):
        sub=[s for s in S if s[idx]==v]
        if sub: t+=len(sub)/len(S)*H(sum(1 for s in sub if s[0]=='+')/len(sub))
    return t
print('H(Y|X1),H(Y|X2)',hcond(inst,1),hcond(inst,2))
def chi2(S,idx):
    # contingency 2x2
    n=len(S); tot=0
    for v in (True,False):
        for y in '+-':
            O=sum(1 for s in S if s[idx]==v and s[0]==y)
            r=sum(1 for s in S if s[idx]==v); c=sum(1 for s in S if s[0]==y)
            E=r*c/n
            if E>0: tot+=(O-E)**2/E
    return tot
print('root chi2',chi2(inst,1))
for v in (True,False):
    sub=[s for s in inst if s[1]==v]
    print('X1=',v,[sum(1 for s in sub if s[0]=='+'),sum(1 for s in sub if s[0]=='-')],'chi2 X2',chi2(sub,2))
# 0.97
EX=1;VX=1
print('0.97',3*EX,9*VX,VX)
