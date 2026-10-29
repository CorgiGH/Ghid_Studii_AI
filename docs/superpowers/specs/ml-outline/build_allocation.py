#!/usr/bin/env python3
"""Source of truth for allocation.json / allocation.md (ML lessons, weeks 1-5).
Run: python3 -I build_allocation.py   (validates, then writes both files next to this script).
Every check that can fail is in validate(); the script exits non-zero on any violation."""
import json, os, sys, re

HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- master exercise list
# exercise -> parts string ('' = no parts). Ids used below: "0.1" = all parts, "0.1.a" = one part.
MASTER = {
 # chapter 0
 '0.1':'abc','0.2':'ab','0.3':'','0.4':'','0.5':'abc','0.6':'','0.7':'','0.8':'abcd','0.9':'abc','0.10':'','0.11':'',
 '0.12':'ab','0.13':'','0.14':'','0.15':'ab','0.16':'ab','0.19':'ab','0.23':'abcd','0.24':'','0.25':'ab','0.26':'abcdefg',
 '0.27':'','0.28':'','0.42':'ab','0.43':'abcdefghi','0.55':'abc','0.56':'abcd','0.57':'','0.58':'ab','0.59':'','0.60':'',
 '0.61':'','0.62':'','0.63':'ab','0.64':'ab','0.65':'abc','0.78':'ab','0.79':'abc','0.89':'ab','0.90':'ab','0.91':'abc',
 '0.92':'','0.93':'','0.94':'','0.95':'','0.96':'abcd','0.97':'','0.98':'','0.99':'ab','0.100':'','0.101':'abc','0.102':'ab',
 '0.103':'','0.140':'','0.141':'abcd','0.142':'abcde','0.143':'','0.144':'','0.145':'ab','0.146':'ab','0.147':'','0.148':'',
 '0.149':'','0.151':'abc',
 # chapter 2
 '2.1':'abc','2.2':'abc','2.3':'','2.4':'abcd','2.5':'ab','2.6':'abcd','2.7':'abcde','2.8':'abcd','2.9':'','2.11':'',
 '2.24':'abc','2.25':'ab','2.26':'','2.27':'abc','2.28':'','2.29':'abcd','2.30':'','2.31':'','2.33':'abcdef','2.35':'abcde',
 '2.36':'','2.42':'',
 # chapter 3
 '3.11':'b',
 # chapter 4
 '4.1':'','4.2':'abcdef','4.3':'ab','4.4':'ab','4.5':'abc','4.6':'abc','4.7':'ab','4.8':'ab','4.9':'','4.10':'ab','4.11':'ab',
 '4.12':'abc','4.13':'abc','4.14':'abc','4.15':'abc','4.16':'','4.17':'ab','4.18':'ab','4.19':'abcd','4.20':'','4.21':'abcd',
 '4.32':'','4.33':'','4.34':'','4.35':'','4.36':'abcde','4.37':'abc','4.38':'abcde','4.39':'ab','4.40':'abc','4.41':'abc',
 '4.42':'ab','4.43':'abc','4.44':'','4.45':'','4.46':'abcd','4.47':'','4.48':'','4.49':'abc','4.50':'abcd','4.51':'abcd',
 '4.52':'abcde','4.53':'ab','4.54':'abcd','4.55':'ab','4.56':'abcde','4.57':'abc','4.58':'',
}
# bracketed / marked-optional in the checklist or the book
OPTIONAL = {'0.7','0.8','0.27','0.28','0.60','0.61','0.62','0.149','2.25','2.26','2.42','4.17','4.18','4.47','4.53','4.55','4.58','4.35','2.36'}
# 2.36 is optional here because it is not in the checklist (see notes); the rest are bracketed or marked in the book.

# answer status per whole exercise (part overrides in STATUS_PART)
# book = printed solution; slides = companion-slide solution; verified-twice = reader + independent verify script agree;
# ruled = answer depends on a convention/ruling the lesson must state; reasoned = argued, no numeric check possible;
# single-source = one computation only (builder's numeric test must recompute); impl = implementation task, no answer
STATUS = {}
def _s(st, ids):
    for i in ids.split():
        STATUS[i] = st
_s('book', '0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 0.10 0.11 0.12 0.13 0.14 0.15 0.16 0.19 0.23 0.24 0.25 0.26 0.27 0.28 0.42 0.43 0.55 0.56 0.57 0.58 0.59 0.60 0.63 0.64 0.65 0.78 0.79')
_s('verified-twice', '0.89 0.90 0.91 0.92 0.93 0.94 0.95 0.96 0.99 0.100 0.101 0.102 0.103 0.140 0.141 0.142 0.147')
_s('slides', '0.143 0.144 0.145 0.146 0.148')
_s('verified-twice', '0.97')   # E[3X]=3, Var(3X)=9, Var(X+3)=1: reader + verify_extra.py
_s('ruled', '0.61 0.62 0.98 0.149 0.151')   # logic-only one-line identities / not checked numerically; lesson labels them as argued
_s('book', '2.1 2.2 2.3 2.5 2.6 2.7 2.8 2.9 2.11')
_s('verified-twice', '2.27 2.28 2.29 2.30 2.31 2.36')
_s('slides', '2.33')
_s('ruled', '2.4 2.27 2.30')
_s('verified-twice', '2.24 2.25 2.35')   # reader + verify_extra.py (exact fractions)
_s('ruled', '2.26 2.42')   # 2.26: swapped definitions (identity); 2.42: argued, no key
_s('book', '3.11')
_s('book', '4.1 4.2 4.3 4.4 4.5 4.6 4.7 4.8 4.9 4.10 4.11 4.12 4.13 4.14 4.15 4.16 4.17 4.18 4.19 4.20 4.21')
_s('slides', '4.34 4.36 4.48')
_s('verified-twice', '4.32 4.33 4.37 4.38 4.39 4.40 4.41 4.43 4.46 4.49 4.50 4.52 4.56')
_s('ruled', '4.42 4.44 4.45 4.51')
_s('ruled', '4.47 4.53 4.54 4.57')   # no printed key; argued from the book's own statements; lesson labels the answer as argued
_s('verified-twice', '4.55')   # reader + verify_extra.py (chi2 4.863 / 0.686 / 2.236)
_s('impl', '4.35 4.58')
# part-level overrides
STATUS_PART = {
 '4.42.b':'ruled',      # not determinable from the marginals; lesson asks only (a) and shows why (b) cannot be decided
 '4.54.a':'verified-twice', '4.54.b':'verified-twice', '4.54.c':'ruled', '4.54.d':'ruled',
 '2.4.a':'ruled',       # CVLOO 1/5 only under the book's tie rule (tied leaf -> class 0); other choice gives 3/5
 '2.4.c':'verified-twice','2.4.d':'verified-twice','2.4.b':'verified-twice',
 '2.27.b':'ruled',      # 13 / 71 free parameters under the free-parameter convention
 '2.35.a':'verified-twice','2.35.b':'verified-twice',
 '4.51.a':'ruled',      # 6 thresholds if a value carrying both labels counts as a boundary, 5 otherwise
 '4.57.a':'ruled',
 '4.2.f':'book',
 '2.33.a':'slides','2.33.b':'slides','2.33.c':'slides','2.33.d':'slides','2.33.e':'slides','2.33.f':'slides',
 '2.29.c':'verified-twice',
}
# Constructed exercises added 2026-10-29 for the teacher's list of the Friday test (D-069): they have no book number, so the
# key is the outline's id "L<n>.c<k>"; each one was computed twice (formula.js evaluate + exact fractions in Python).
CONSTRUCTED = {'L4.c1': 4, 'L4.c2': 4, 'L5.c1': 5, 'L15.c1': 15}

# ---------------------------------------------------------------- concepts (cap: 4 headline concepts per lesson)
# (cid, Romanian name, requires)
CONCEPTS = {
 1: [('C1.1','Spațiul de probabilitate: Ω, eveniment, spațiul de evenimente, funcția de probabilitate, aditivitate numărabilă, cazul uniform',[]),
     ('C1.2','Probabilitatea condiționată P(A|B)',['C1.1']),
     ('C1.3','Regula de înmulțire și regula de înlănțuire (inclusiv varianta condiționată)',['C1.2'])],
 2: [('C2.1','Partiție și formula probabilității totale',['C1.3']),
     ('C2.2','Formula lui Bayes: a priori, verosimilitate, evidență, a posteriori',['C2.1'])],
 3: [('C3.1','Independența evenimentelor (forma produs și forma P(A|B)=P(A); nu se confundă cu evenimente disjuncte)',['C1.3']),
     ('C3.2','Independența condiționată a evenimentelor (ambele forme)',['C3.1']),
     ('C3.3','Cele două presupuneri implicite: echiprobabilitate și independență',['C3.1','C1.1'])],
 4: [('C4.1','Variabila aleatoare discretă: Val(X), p.m.f., c.d.f., funcție de v.a. (se aplică valorilor, nu probabilităților)',['C1.1']),
     ('C4.2','Media E[X] și liniaritatea ei',['C4.1']),
     ('C4.3','Varianța și abaterea standard; Var(aX+b); Var(X)=E[X²]−E²[X]',['C4.2']),
     ('C4.4','Distribuțiile Bernoulli, binomială, categorială; variabila indicator',['C4.3','C3.1'])],
 5: [('C5.1','Distribuția comună, marginalele, distribuțiile condiționate; regula de înlănțuire pentru 3 variabile',['C4.1','C1.3']),
     ('C5.2','Independența variabilelor aleatoare (pe toate perechile de valori)',['C5.1','C3.1']),
     ('C5.3','Covarianța, coeficientul de corelație, Var(X+Y)',['C5.1','C4.3'])],
 6: [('C6.1','Independența condiționată a variabilelor aleatoare (pe toate valorile x,y,z); nu decurge din independență și nici invers',['C5.2','C3.2']),
     ('C6.2','Folosirea independenței condiționate: ce probabilități trebuie cunoscute și ce se poate însuma (marginalizare condiționată)',['C6.1','C2.2'])],
 7: [('C7.1','Informația / surpriza unui eveniment, log₂(1/p)',['C4.1']),
     ('C7.2','Entropia H(X); entropia unui set de date H[a+,b−]; convenția 0·log 0 = 0',['C7.1','C4.2']),
     ('C7.3','Entropia Bernoulli H(p): simetrie, maxim în 1/2; regula de verificare 0 ≤ H ≤ log₂k',['C7.2','C4.4'])],
 8: [('C8.1','Entropia condiționată specifică H(Y|X=x)',['C7.2','C5.1']),
     ('C8.2','Entropia condiționată medie H(Y|X) (cu ponderi)',['C8.1']),
     ('C8.3','Entropia comună H(X,Y) și regula de înlănțuire a entropiei',['C8.2']),
     ('C8.4','Câștigul de informație IG(X;Y) = informația mutuală, simetric',['C8.3','C5.2'])],
 9: [('C9.1','Vocabular de învățare automată: instanță, atribut, exemplu, concept, ipoteză, set de date consistent/inconsistent, eroare la antrenare, învățare supervizată/nesupervizată',[]),
     ('C9.2','Arborele de decizie: nod de test, ramură, frunză; clasificarea unei instanțe',['C9.1']),
     ('C9.3','Compasul de decizie (decision stump) cu cutii [a+,b−]',['C9.2','C8.2']),
     ('C9.4','Alegerea rădăcinii: IG(S,A) maxim ⇔ H(Y|A) minim',['C9.3','C8.4'])],
 10: [('C10.1','Raționamente relaționale (calitative): comparație cu ponderi, injecție între valori, monotonia și simetria lui H(p)',['C9.4','C7.3']),
      ('C10.2','Formulele pentru calculator: H[a+,b−] = (1/(a+b))·log₂((a+b)^(a+b)/(a^a b^b)), produsul de comparat, ieșire ternară, depășirea capacității',['C9.4'])],
 11: [('C11.1','Algoritmul ID3: schița (ML3:8), pseudocodul (ML3:9), condiții de oprire, etichetă majoritară, ramură goală',['C9.4']),
      ('C11.2','Egalități la alegere: arborele nu e unic; un atribut apare o dată pe un drum, dar de mai multe ori în arbore',['C11.1']),
      ('C11.3','Arborele ca reguli (calcul propozițional de ordin 0): IF…THEN, reguli exclusive și exhaustive',['C9.2']),
      ('C11.4','Instanțe cu multiplicități (coloana Counts) și duplicate: ponderi în toate entropiile',['C11.1'])],
 12: [('C12.1','Spațiul ipotezelor complet, căutare greedy cu 1-step look-ahead, spațiul de versiuni; bias inductiv (de căutare), Occam',['C11.1']),
      ('C12.2','Expresivitate: orice funcție booleană are un arbore (P0)',['C9.2']),
      ('C12.3','Arborele ID3 nu e neapărat optim și nu e unic; sensibil la atribute superflue (P2, P3, P4)',['C12.1','C11.2'])],
 13: [('C13.1','Date inconsistente: eroarea la antrenare nu poate fi 0; marginea (k−1)/k (P7); acuratețea unui compas față de arborele complet',['C11.1','C9.1']),
      ('C13.2','Atribute duplicate vs. instanțe duplicate (P5)',['C11.4']),
      ('C13.3','Margini de structură: adâncime ≤ numărul de atribute categoriale (P11), frunze ≤ min(R,2^M) (P13), atribut injectiv',['C11.2']),
      ('C13.4','ID3 ca învățare „eager”: completarea unui arbore cu date noi',['C11.1'])],
 14: [('C14.1','Pragurile unui atribut continuu: ordonare, schimbări de etichetă, mijlocul intervalului, numărarea pragurilor',['C11.1']),
      ('C14.2','IG al unui test cu prag, recalculat pe instanțele nodului; același atribut cu alt prag; rădăcina se alege între toate atributele și pragurile',['C14.1']),
      ('C14.3','Zone de decizie și granițe axial-paralele (P8, P9)',['C14.2'])],
 15: [('C15.1','Eroarea și acuratețea la antrenare / validare / test; Acc, P, R, F, Sp',['C9.1']),
      ('C15.2','Protocoale de validare: set de validare, n-fold, leave-one-out (CVLOO) și cum se calculează de mână pentru ID3',['C15.1','C11.1']),
      ('C15.3','Overfitting (definiția ML3:26) și underfitting; eroare mică la antrenare ≠ calitate',['C15.2']),
      ('C15.4','Erori așteptate într-o frunză: aproximarea polinomială a lui H(p)',['C15.1','C7.3'])],
 16: [('C16.1','Evitarea overfitting-ului: oprire timpurie vs. post-pruning; reduced-error pruning; rule post-pruning',['C15.3']),
      ('C16.2','Pruning cu prag pe IG (ε): top-down vs. bottom-up',['C16.1','C8.4']),
      ('C16.3','Testul χ² al lui Pearson pentru independență, aplicat la pruning',['C16.2','C5.2'])],
 17: [('C17.1','Raportul câștigului de informație: SplitInfo și GainRatio (C4.5); preferința ID3 pentru atribute cu multe valori (P6)',['C11.1','C7.2']),
      ('C17.2','Alte măsuri de impuritate: Gini, clasificare greșită, diminuarea impurității',['C9.4','C7.3']),
      ('C17.3','Costul atributelor: Gain²/Cost; valori lipsă (menționat)',['C17.1'])],
 18: [('C18.1','Verosimilitatea unui set de date ca funcție de parametru; log-verosimilitatea',['C4.4']),
      ('C18.2','Estimarea în sensul verosimilității maxime (MLE): n₁/(n₁+n₀), n_i/N, estimări condiționate din numărători; maximizare prin derivată',['C18.1'])],
 19: [('C19.1','Teorema lui Bayes pentru ipoteze: P(h|D), prior, verosimilitate',['C2.2']),
      ('C19.2','Ipotezele h_ML și h_MAP; egalitatea lor pentru priori egali; argmax vs. max',['C19.1']),
      ('C19.3','Estimarea MAP a unui parametru cu prior Beta; log-odds',['C19.2','C18.2']),
      ('C19.4','MAP „brute-force” și clasificatorul Bayes optimal prin vot (ML6:9–10), cu avertisment de nume',['C19.2'])],
 20: [('C20.1','Regula v_MAP = argmax P(a₁..aₙ|v)P(v) pentru clasificare',['C19.2']),
      ('C20.2','Bayes Comun (Optimal, Joint Bayes): estimarea lui P(a₁..aₙ,v)',['C20.1','C18.2']),
      ('C20.3','Bayes Naiv: independența condiționată a atributelor față de ieșire; antrenarea = MLE pe fiecare factor',['C20.1','C6.1','C18.2']),
      ('C20.4','Numărul de parametri liberi: NB 2n+1, Bayes Comun 2^(n+1)−1; complexitate',['C20.3','C20.2'])],
 21: [('C21.1','Problema probabilităților zero: produs 0, scoruri toate 0, posterior 0/0',['C20.3']),
      ('C21.2','Regula add-one a lui Laplace (count+1)/(N+|Val(A)|) și estimarea m',['C21.1'])],
 22: [('C22.1','Rata medie a erorii calculată față de distribuția adevărată; cele două surse de eroare (P3)',['C20.2','C4.2']),
      ('C22.2','Bayes Naiv pe xor; ID3 vs. Bayes Naiv (P4, P5, P7)',['C22.1','C11.1']),
      ('C22.3','Atribute duplicate / adăugate: acuratețea Bayes Naiv scade, Bayes Comun nu (P6)',['C22.1']),
      ('C22.4','Clasificator între NB și Bayes Comun (New-Bayes): o singură pereche dependentă',['C22.1','C6.2','C1.3'])],
 23: [('C23.1','Mulțimi și funcții convexe: definiții',[]),
      ('C23.2','Inegalitatea lui Jensen și consecințe (AM-GM, E[f(X)])',['C23.1','C4.2'])],
 24: [('C24.1','Entropia încrucișată CH(p,q)',['C7.2','C23.2']),
      ('C24.2','Inegalitatea lui Gibbs',['C24.1','C23.2']),
      ('C24.3','Entropia relativă / divergența Kullback-Leibler; IG ca KL',['C24.2','C8.4']),
      ('C24.4','Selecția modelelor prin entropie încrucișată; legătura cu verosimilitatea',['C24.1','C18.2'])],
}

# cross-lesson needs of exercises (besides the concepts of their own lesson)
EXTRA_NEEDS = {
 '0.26':['C4.4','C2.2'], '2.1':['C4.2','C2.2'], '2.4':['C15.2','C11.1'], '0.58':['C9.1'], '4.46':['C11.3','C15.1'],
 '4.14':['C14.1'], '4.49':['C14.2'], '2.9':['C6.2'], '2.35':['C20.4'], '4.54':['C11.3','C16.1'], '4.55':['C16.3'],
 '4.2':['C10.1'], '4.37':['C10.1'], '4.41':['C10.1'], '4.38':['C9.4'], '0.141':['C5.2'], '0.57':['C5.1'],
 '0.142':['C5.1'], '4.12':['C14.1'], '4.51':['C14.1'], '2.30':['C20.3'], '2.33':['C22.1'], '2.11':['C22.1'],
 '0.43':['C4.4'], '4.52':['C17.1'], '4.13':['C17.1'], '0.147':['C24.1'], '0.148':['C24.3'], '0.145':['C8.3'],
 '0.59':['C8.3'], '4.57':['C15.3'], '4.21':['C15.3'], '4.10':['C14.1'], '4.44':['C7.3'],
 '3.11':['C14.3'], '4.19':['C16.2'], '4.20':['C16.3'], '2.3':['C4.4'], '2.5':['C18.2'], '2.8':['C21.2'],
 '4.16':['C11.1'], '4.6':['C9.4'], '4.7':['C9.1'], '4.56':['C12.3','C13.3'], '0.102':['C2.2'], '0.103':['C5.1'],
 '0.16':['C5.2'], '0.101':['C5.2'], '0.13':['C1.3'], '0.15':['C3.2'], '0.12':['C4.3'], '4.35':['C9.3'],
}

# ---------------------------------------------------------------- lessons
L = []
def lesson(n, title_ro, **kw):
    d = dict(n=n, id='ml-l%02d' % n, title_ro=title_ro)
    d.update(kw); L.append(d)

lesson(1, 'Probabilitate: spațiu de probabilitate, probabilitate condiționată, regula de înmulțire',
 priority='A', definitions=['Experiment aleator','Evenimentul sigur Ω, evenimentul imposibil ∅, eveniment elementar','Funcția de probabilitate P: F → [0,1] cu P(Ω)=1','Evenimente incompatibile (P(A∩B)=0)','Formula clasică #favorabile/#posibile','Notația de mulțimi: A∩B, A∪B, „A sau B, dar nu amândouă”'],
 properties=['P(∅)=0','P(Ā)=1−P(A)','A⊆B ⇒ P(A)≤P(B)','P(A∪B)=P(A)+P(B)−P(A∩B)','Inegalitatea lui Bonferroni P(A∩B) ≥ P(A)+P(B)−1','P(A|B)P(B)=P(B|A)P(A)','Regula de înlănțuire P(A₁∩…∩Aₙ)=P(A₁)P(A₂|A₁)…','Varianta condiționată P(A,B|C)=P(A|C)P(B|A,C)'],
 proofs=['0.1.a (P(A∩B̄)=P(A)−P(A∩B), din aditivitate)','0.1.b (Bonferroni)','0.14 (regula de înmulțire condiționată; același enunț ca T21P 1 și T20b 1.2)','Proprietățile derivate din definiția funcției de probabilitate (WYSK:1; T20a 1.1)','0.8.a–d (adevărat/fals, cu demonstrație sau contraexemplu)'],
 worked_example='Cn-s1:3: Ω={a,b,c}, F=2^Ω și patru funcții parțiale f1–f4: care sunt deja contradictorii, care se pot completa cu cele 2 axiome (f1 consistentă; f2: P(∅)=1/2 greșit; f3: {a,c} cu 1/3 < {c} cu 2/3; f4: 1,5>1)',
 data_tables=['Cn-s1:3 funcțiile f1–f4 pe Ω={a,b,c}','0.2 două zaruri, S=suma (36 cazuri)','0.3 trei cărți (roșu-roșu, verde-verde, roșu-verde)','0.1 P(A)=1/3, P(B)=5/6'],
 exercises=['0.1','0.2','0.3','0.8','0.14'],
 notes='0.14 e scris în caiet cu notația P(X=x,Y=y|Z=z); aici se arată pentru evenimentele {X=x}, {Y=y}, {Z=z} (aceeași demonstrație, notația v.a. se explică într-o linie, tratarea completă e în L4). Se folosește același enunț ca T21P 1 și T20b 1.2.',
 slides=['FND #4 (spațiu de probabilitate, caz uniform)','FND #5 (condiționată, înmulțire, înlănțuire; „a posteriory” sic)'],
 visuals=['Diagramă Ω cu evenimente (mulțimi) și restrângerea la B'],
 misconceptions=['P(A|B)=P(B|A) (0.2: P(S=11|S prim)=2/15 față de P(S=11)=1/18 — probabilitatea crește când afli ceva legat)','Spațiul de probabilitate sunt cărțile, nu fețele (0.3: 2/3, nu 1/2)','P(B|A)+P(B|Ā)=1 (0.8.d fals)','Inegalitatea inversată: P(A∪B)≤P(A)+P(B), nu ≥ (0.8, 0.96.a în L2)'])

lesson(2, 'Probabilitatea totală și formula lui Bayes',
 priority='A', definitions=['Partiție B₁..B_k a lui Ω','A priori / verosimilitate / evidență / a posteriori','Frecvențe naturale (din 1000 de persoane…)'],
 properties=['P(A)=P(A|B)P(B)+P(A|B̄)P(B̄)','P(A)=Σ P(A|Bᵢ)P(Bᵢ) pentru Bᵢ disjuncte cu A⊆∪Bᵢ','P(B|A)=P(A|B)P(B)/P(A), cu P(A) din formula totală','Varianta condiționată a formulei totale și a lui Bayes (0.96.b–d)'],
 proofs=['Formula probabilității totale (T20a 1.2: P(A)=P(A|B)P(B)+P(A|¬B)P(¬B))','Formula lui Bayes din definiția condiționatei','0.93 (partiție: P(B₁|A)<P(B₁) ⇒ există i cu P(Bᵢ|A)>P(Bᵢ))','0.96.b–d (Bayes și probabilitatea totală condiționate sunt adevărate)'],
 worked_example='Screening cu frecvențe naturale: prevalență 1%, test cu detecție 90% și 9% fals pozitive; din 1000 de persoane → P(boală|pozitiv) ≈ 0,0917 (construit; valoarea 0,0917 verificată în seminar-and-errors B3; cifrele quizului vor fi altele)',
 data_tables=['Exemplul de screening (arbore cu frecvențe naturale)','0.90 urna cu w albe, b negre și d bile adăugate','0.94 creșă: culoarea ochilor / selecție (procente)','0.95 două urne (11A4R, 8A5R)','0.6 informațiile (a)–(d) despre P(A|B)','0.7 elevul care știe sau ghicește'],
 exercises=['0.6','0.7','0.90','0.93','0.94','0.95','0.96'],
 slides=['FND #6 (probabilitatea totală, Bayes)','ML6 #4 (formula totală, doar partea de probabilități; ipotezele sunt în L19)'],
 visuals=['Arbore de probabilități cu frecvențe naturale, apoi formula (viz 1 din design §6)'],
 misconceptions=['Neglijarea frecvenței de bază (boala 1%, test 90%/9% ⇒ ≈9%, nu 90%)','Uitarea numitorului: P(A) din formula totală, nu P(A|B)','P(A|B)=P(B|A) (0.95: 143/263≈0,54 față de 11/15≈0,73)','0.6: P(A)=4/9 e superfluu (decurge din celelalte trei)'])

lesson(3, 'Independența evenimentelor și independența condiționată',
 priority='B', definitions=['Independența, forma produs: P(A∩B)=P(A)P(B)','Independența, forma P(A|B)=P(A), pentru P(B)≠0','Independența condiționată, forma produs: P(A,B|C)=P(A|C)P(B|C)','Independența condiționată, forma P(A|B,C)=P(A|C), pentru P(B,C)≠0','Presupunerea 1: echiprobabilitate; presupunerea 2: independență (Cn-s1:4,8)'],
 properties=['Cele două forme sunt echivalente pentru P(B)≠0; forma produs acoperă și P(B)=0 (C-6)','Independente cu probabilități >0 nu pot fi disjuncte','P(A∪B)=P(A)+P(B)−P(A)P(B) pentru A,B independente (T21S 4a)','A⊥B ⇒ A⊥B̄ și Ā⊥B̄; A independent de sine ⇒ P(A)∈{0,1} (0.4)'],
 proofs=['0.4 (A⊥B ⇒ A⊥B̄, Ā⊥B̄; independent de sine ⇒ P(A)∈{0,1}) — Seminarul Special sapt. 2','0.91.a–c (P(A|A,B)=1; P(A)=0 ⇒ independente; P(B)=1 ⇒ P(A|B)=P(A))','0.92 (din P(A|B,C)=P(A|C) rezultă forma produs condiționată, doar din definiție)','0.5.a–c (Robert și Alina: serie geometrică, aditivitate numărabilă)'],
 worked_example='Cn-s1:7: X obține 6 puncte cu 0,5, Y cu 0,2; ambele? (0,1); cu P(ambele)=0,11 sunt independente? (nu: 0,5·0,2=0,1≠0,11)',
 data_tables=['Cn-s1:7 (0,5; 0,2; 0,11)','0.89 doi soldați (rateu 1/5, 1/2, ambele 1/10)','0.5 monedă aruncată pe rând (P(cap)=p)'],
 exercises=['0.4','0.5','0.89','0.91','0.92'],
 slides=['FND #7 (independența evenimentelor, independența condiționată)'],
 visuals=['Verificare de independență pe un tabel 2×2 de evenimente (celulă cu celulă)'],
 misconceptions=['Mutual exclusiv înseamnă independent (P(A)=0,5, P(B)=0,4, A∩B=∅ ⇒ nu)','„Aproximativ independente” (0,5·0,2 vs 0,11)','P(A)=0 înseamnă A=∅ (0.4)','Uitarea inclusiv-excluderii în 0.89','„tare”/„slabă”: cartea și seminarul le folosesc invers, deci formele se numesc prin formulă'])

lesson(4, 'Variabile aleatoare discrete: distribuție, medie, varianță; Bernoulli și binomială',
 priority='B', definitions=['Variabila aleatoare X:Ω→R, Val(X)','Funcția masă de probabilitate p(x)=P(X=x); verificarea unei p.m.f. (p≥0, Σp=1)','Funcția de distribuție cumulativă F(x)=P(X≤x), F:R→[0,1] (C-1)','Media E[X]=Σx p(x); varianța; abaterea standard σ','Bernoulli b(r;1,p), binomială b(r;n,p), categorială; variabila indicator','p.d.f. vs p.m.f. (o propoziție: pentru continuă P(X=x)=0)'],
 properties=['E[aX]=aE[X], E[X+Y]=E[X]+E[Y] (liniaritatea mediei)','Var(aX)=a²Var(X), Var(X+a)=Var(X), Var(aX+b)=a²Var(X)','Var(X)=E[X²]−E²[X]','E[g(X)]≠g(E[X]) pentru g neliniară; E[X(X−1)]=σ²+µ²−µ','Binomiala: media np, varianța np(1−p) (suma a n Bernoulli independente)','Bernoulli: media p, varianța p(1−p); E[indicator(A)]=P(A)','Pentru continuă, P(X=x)=0 (0.23.a)'],
 proofs=['0.9.a (liniaritatea mediei E[W+Z]=E[W]+E[Z], E[aX]=aE[X]; cazul discret, demonstrația scurtă PS:3)','0.9.b (Var(X)=E[X²]−E²[X]; Var(aX)=a²Var(X)) — demonstrația cerută și în T21P 2 (Var[X+10]=Var[X]) și T21S 4','0.98 (E[indicator A]=P(A))','0.25.a–b (binomiala e p.m.f.; media np și varianța np(1−p))'],
 worked_example='Cn-s2:4–5: X∈{−1,0,1,2} cu 1/6,1/6,1/6,1/2: p.m.f., c.d.f., E=1, Var=4/3',
 data_tables=['Cn-s2:2 trei monede: R=nr. de steme (1/8,3/8,3/8,1/8), M=indicator','Cn-s2:4–5 X∈{−1,0,1,2}','0.24 iepurele care sare ±1','0.12 X cu E=µ și Var=σ²','0.97 E[X]=1, Var(X)=1'],
 exercises=['0.9.a','0.9.b','0.12','0.23.a','0.24','0.25','0.27','0.28','0.97','0.98'],
 slides=['FND #8 (v.a., c.d.f.)','FND #9 (p.m.f., E, Var; Cov este în L5)','FND #10 (Bernoulli, binomială)','FND #14 (proprietățile lui E și Var)'],
 visuals=['Bare p.m.f./c.d.f. cu mărimea mediei marcată'],
 misconceptions=['Se aplică f probabilităților, nu valorilor (2X, X² — Cn-s2:3)','Media trebuie să fie o valoare a lui X ({10,20} ⇒ 15)','Densitatea e o probabilitate (0.23.a: P(X=x)=0 pentru continuă)','E[g(X)]=g(E[X]) pentru orice g','X+Y nu se calculează din marginale (Cn-s2:3)'],
 notes='Opționale (marcate ◦ / între paranteze în caiet): 0.27 (Poisson, medie λ, varianță λ) și 0.28 (geometrică, E=6) apar ca enunț propriu, fără concept nou predat: distribuțiile sunt definite în enunț (design §3: distribuțiile neuzuale primesc cel mult un ecran „există, nu e pe test”).')

lesson(5, 'Distribuții comune, marginale, condiționate; independența variabilelor; covarianță',
 priority='A', definitions=['Distribuția comună p(x,y)','Marginalele p_X(x)=Σ_y p(x,y)','Distribuția condiționată p_{X|Y}(x|y)=p(x,y)/p_Y(y)','Independența v.a.: p(x,y)=p_X(x)p_Y(y) pentru toate perechile','Covarianța Cov(X,Y)=E[(X−EX)(Y−EY)]','Coeficientul de corelație ρ=Cov/(σ_Xσ_Y)'],
 properties=['Cov(X,Y)=E[XY]−E[X]E[Y]','Var(X+Y)=Var X+Var Y+2Cov','X,Y independente ⇒ E[XY]=E[X]E[Y] și Cov=0','Cov=0 nu implică independența; pentru variabile {0,1}, Cov=0 ⇔ independente','−1 ≤ ρ ≤ 1; |ρ|=1 ⇔ Y liniară în X','Pentru independente: Var(X+Y)=Var X+Var Y','0.13: șapte numere libere pentru 3 booleene; o listă specifică joint-ul dacă determină lanțul P(Z)P(X|Z)P(Y|X,Z)','Pentru binare cu parametrii α,β,γ,δ: independente ⇔ αδ=βγ (0.99)'],
 proofs=['0.9.c (Cov=E[XY]−E[X]E[Y])','0.10 (independente ⇒ E[XY]=E[X]E[Y], Cov=0; Special sapt. 2; PS:4)','0.11 (Cov=0 ⇏ independență; pentru {0,1} echivalent; Special sapt. 2)','0.19.a–b (|ρ|≤1 și |ρ|=1 ⇔ liniar; Special sapt. 4; PS:12–13)','0.23.b–d (E[X+Y], Var[X+Y] fals pentru Y=−X, E[XY] fals; Special sapt. 2)','0.99.b (independente ⇔ αδ=βγ; Special sapt. 2)','0.100 (Cov=0 dar dependente; Special sapt. 4)'],
 worked_example='Cn-s2:6–7: tabel comun al lui (X,Y) cu marginale (P(X=0)=0,1+0,3=0,4), verificarea independenței pe toate celulele, E/Var/Cov din tabel (cifrele complete se citesc din notes-s2.pdf p.6 la redactarea schiței; dacă coincid cu 0.99/0.100/T16 se înlocuiește cu un tabel construit)',
 data_tables=['Cn-s2:6–7 tabelul exemplu','0.99 tabel binar cu α,β,γ,δ','0.11 tabelul cu celule 1/3 (Cov=0, dependente)','0.100 tabelul 0,1/0,4/0,1 · 0/0,4/0 (=T16 (2))','0.13 listele A–D de probabilități','0.23.c–d contraexemple (Y=−X)'],
 exercises=['0.9.c','0.10','0.11','0.13','0.19','0.23.b','0.23.c','0.23.d','0.99','0.100'],
 slides=['FND #15 (comună, marginale, condiționate)','FND #16 (independența v.a.; independența condiționată e în L6)','FND #17 (Var(X+Y), Cov)'],
 visuals=['Tabel comun cu marginale care se completează și verificare de independență celulă cu celulă (viz 2 din design §6)'],
 misconceptions=['O singură ecuație ajunge pentru independența variabilelor (trebuie toate celulele)','Cov=0 ⇒ independente (X uniformă pe {−1,0,1}, Y=X²)','Var[X+Y]=Var X+Var Y mereu (Y=X ⇒ 4Var X)','Var(X)=0 ⇔ X constantă (0.19.b)'])

lesson(6, 'Independența condiționată a variabilelor aleatoare',
 priority='B', definitions=['X⊥Y | Z: p(x,y|z)=p(x|z)p(y|z) pentru toate x,y,z','Forma echivalentă p(x|y,z)=p(x|z) când p(y,z)≠0','Marginalizare condiționată'],
 properties=['Independență nu implică independență condiționată și nici invers (0.16 față de 0.101)','(X,Y)⊥W | Z ⇒ X⊥W | Z (se însumează după y)','Pentru Bayes cu două dovezi E₁,E₂ date H: P(H|E₁,E₂) se află din P(E₁,E₂|H), P(H) (sau cu independență condiționată din P(E₁|H),P(E₂|H),P(H)) (0.102)'],
 proofs=['0.103 (însumare după y)','0.16.b și 0.101.b (verificare cu definiția, pe toate celulele)'],
 worked_example='Z bit corect; X și Y sunt copii zgomotoase ale lui Z (cu 0,8), independente date Z: X și Y sunt dependente, dar independente condiționat de Z (construit; cifrele se recalculează cu scriptul)',
 data_tables=['Exemplul construit X,Y zgomotoase date Z','0.16 tabel 3 variabile cu p,q','0.101 tabel 3 variabile (PS:5–8)','0.15 uniformă pe 8 rânduri','0.102 probabilitățile (i)–(iii) pentru P(H|E₁,E₂)'],
 exercises=['0.15','0.16','0.101','0.102','0.103'],
 slides=[],
 visuals=['Același widget de tabel comun, cu opțiunea „condiționează pe Z” (fiecare felie Z=z se testează separat)'],
 misconceptions=['Independente ⇒ independente condiționat (0.16 contra 0.101)','Dependente ⇒ nu pot fi independente condiționat (0.101: X,Y dependente, dar independente date Z)','„Presupunem că sunt independente” înainte de marginalizare (marginalizarea nu cere independență)'])

lesson(7, 'Entropia',
 priority='A', definitions=['Informația (surpriza) log₂(1/p), în biți','H(X)=−Σp(x)log₂p(x)=E[−log₂p(X)]; convenția 0·log 0=0; log=log₂','H[a+,b−] pentru un set de date (frecvențe relative ca probabilități)','Interpretări: surpriza medie, incertitudine, dezordine/impuritate a unui set','log₂x=ln x/ln 2 la calculator'],
 properties=['H(X) ≥ 0, =0 ⇔ X constantă','0 ≤ H(X) ≤ log₂k (k=|Val(X)|); maxim la distribuția uniformă (enunț; demonstrația e în L23)','H(p)=H(1−p); H[n+,n−]=1; H[0+,n−]=0','Regula de verificare: o entropie negativă sau peste limită = calcul greșit (Cn-s3:5)'],
 proofs=['0.55.a (H(X)≥0; =0 ⇔ constantă) — demonstrația 1 din DEM:1 (Seminarul Special)'],
 worked_example='Cn-s3:7: setul 0,0,0,1,1,0 → P̂=(4/6,2/6) → H=0,9182; H[0+,6−]=0, H[3+,3−]=1',
 data_tables=['Cn-s3:7 setul 0,0,0,1,1,0','0.56 suma a două zaruri (p.m.f. a lui S)','0.140 distribuția [0,0625; 0,0625; 0,125; 0,25; 0,5]'],
 exercises=['0.55.a','0.56.a','0.56.b','0.56.c','0.140'],
 slides=['FND #34 (graficul entropiei Bernoulli)','ML3 #12 (entropia unui set, graficul H(p))'],
 visuals=['Bară de entropie: împărțire [a+,b−], H și curba H(p); învățăcelul prezice care împărțire are entropie mai mare (viz 3)'],
 misconceptions=['Entropia e mărginită de 1 (variabilă cu 8 valori: maxim 3 biți)','Greșeli de bază a logaritmului (ln sau log₁₀ numiți biți); log₂0,125=−3','Entropie negativă sau peste log₂k (0.140: ≈5,6 din log greșit; răspuns corect 1,875)','H[5+,3−] ≠ H[3+,5−] (sunt egale)'])

lesson(8, 'Entropia condiționată și câștigul de informație',
 priority='A', definitions=['Entropia condiționată specifică H(Y|X=x)','Entropia condiționată medie H(Y|X)=Σp(x)H(Y|X=x)','Entropia comună H(X,Y)','Câștigul de informație (informația mutuală) IG(X;Y)=H(X)−H(X|Y)=H(Y)−H(Y|X)','Notația seminarului IG_{0/A}=H₀−H_{0/A}','„H(Y|X) nu e entropia unei variabile Y|X”'],
 properties=['H(X,Y)=H(X)+H(Y|X)=H(Y)+H(X|Y); regula de înlănțuire pe n variabile','IG(X;Y)=IG(Y;X)=H(X,Y)−H(X|Y)−H(Y|X)','IG ≥ 0, =0 ⇔ independente (enunț; demonstrația directă e în L23)','IG(X;X)=H(X); IG ≤ min(H(X),H(Y))','H(X|Y) ≤ H(X), cu egalitate ⇔ independente','H(X,Y) ≤ H(X)+H(Y), cu egalitate ⇔ independente (enunț; 0.144/0.59 în L23)','Două independente față de Z pot avea împreună informație despre Z (0.141.d, perechi independente ≠ independență comună)'],
 proofs=['0.141.a (lanțul de egalități pentru IG; demonstrația 2 din DEM:1, Seminarul Special)','0.141.b (X⊥Y ⇒ IG=0)','0.141.c (IG(X;X)=H(X))','0.55.b (forma cu dublă sumă a lui H(Y|X))','0.55.c (H(X,Y)=H(X)+H(Y|X); regula de înlănțuire)'],
 worked_example='Tabel comun 2×2 construit (stil „apartamente”): H(X), H(Y), H(Y|X), H(X,Y), IG pe același tabel, cu cele trei egalități verificate (construit; cifrele se recalculează cu scriptul)',
 data_tables=['Tabelul construit pentru exemplul lucrat','0.57 răceală/vreme (P(C)=(0,6;0,4), H(C|T)=0,82740, nu 0,82715 cum tipărește cartea)','0.142 accidentat/vreme (Superbowl)','0.141.d zgomotos-XOR cu Z','0.56.d zarurile după primul zar =4'],
 exercises=['0.55.b','0.55.c','0.56.d','0.57','0.141','0.142'],
 notes='0.56.d continuă 0.56.a–c din L7 (aceiași doi zaruri): ecranul pornește de la rezultatele din L7 fără să le repete. H(C|T) din 0.57: cartea tipărește 0,82715, valoarea corectă este 0,82740 (formula din carte dă 0,82740).',
 slides=['FND #33 (definițiile H, H(Y|X), IG; tabelul vizează #32–33 dar FND #32 e Posterior Mean Estimator, vezi C-3)','FND #35 (proprietățile)'],
 visuals=['Bare de entropie: H(Y), H(Y|X) și IG ca diferență; comună în diagramă Venn'],
 misconceptions=['Se amestecă H(Y|A) cu IG (candidați H₀|A=0,8 și H₀|B=0,7: rădăcina e B)','IG negativ sau mai mare decât H (verificare: IG ≤ min(H(X),H(Y)))','H(Play|Weather)=0,6 vs IG=0,4 (etichete încurcate în Tema3)','IG(X;Y)=0 ⇒ atributul nu folosește niciodată (0.141.d)'])

lesson(9, 'Arbori de decizie: compasul de decizie și alegerea rădăcinii',
 priority='A', definitions=['Instanță, atribut de intrare, atribut de ieșire, exemplu, concept, ipoteză, spațiu de ipoteze (ML0:10)','Set de date consistent / inconsistent (două rânduri egale pe intrări, diferite pe ieșire)','Eroarea la antrenare = rânduri etichetate greșit / total; acuratețea = 1 − eroare','Învățare supervizată (clasificare) vs. nesupervizată (clustering)','Arbore de decizie: nod de test, ramură, frunză','Compas de decizie (decision stump) și cutiile [a+,b−]'],
 properties=['IG(S,A)=H(S)−Σ_v |S_v|/|S|·H(S_v)','Atributul ales = IG maxim ⇔ entropia condiționată medie minimă (H₀ comun; C-11)','Un set consistent poate fi clasificat fără erori la antrenare'],
 proofs=['0.58 (selecția de trăsături cu informația mutuală: MI(X₁,Y)=0, dar X₁ e necesar împreună cu altele; Special sapt. 3)'],
 worked_example='P21 1(b.i) (partial 2021–22, RO): 128 exemple [64+,64−], atribute Home-Owner, In-Debt, Rich cu numerele de cazuri adevărate: cele trei cioturi desenate, cele trei H(Y|A) scrise fără evaluare, apoi evaluate (H(Y|Home-Owner)=0,8112; H(Y|In-Debt)=1; H(Y|Rich)=0,9377), rădăcina Home-Owner',
 data_tables=['P21 1b 128 exemple (Home-Owner, In-Debt, Rich)','4.34 Timmy: [5+,4−] → S,A','4.38 vampiri (27 instanțe, G,T)','0.58 opt rânduri, X1..X5'],
 exercises=['0.58','4.34','4.35','4.38'],
 slides=['ML0 #10 (lista de termeni)','ML3 #13 (IG)','DTs #2–4 (4.34)'],
 visuals=['Constructorul ID3, pasul 1: toate cioturile pentru un tabel; învățăcelul prezice cel mai bun atribut (viz 4)'],
 misconceptions=['O ramură pură e automat mai bună (se compară entropii ponderate)','Ponderi greșite pe ciot (0/10 în loc de 6/10, Tema3)','„Mi se pare că acest nod dă IG maxim” nu se punctează (Cn-s4:7)','Un set consistent garantează predicții corecte pe date noi (4.2.f, în L11)'],
 notes='4.35 (implementare) e opțională; în site se oferă ca exercițiu de calcul pe cifrele 4.34, nu ca cod.')

lesson(10, 'Rădăcina fără calculator: raționamente relaționale și formule de buzunar',
 priority='A', definitions=['Raționament de tip relațional / „calitativ” (B:497, B:593)','Aplicație injectivă între valorile a două atribute pentru compararea H(S|A) cu H(S|A′)','Formula H[a+,b−] cu putere (a+b)^(a+b)/(a^a b^b)','Ieșire ternară H[a+,b−,c*]'],
 properties=['Dacă ∃ injecție v↦v′ cu P(A=v)H(S|A=v) ≤ P(A′=v′)H(S|A′=v′) atunci H(S|A) ≤ H(S|A′) (relațiile 288–289)','H(p) crescătoare pe [0,1/2], simetrică; minimum la ponderi egale: compară min(a,b)/(a+b)','Pentru ciotul cu copii [c+,d−],[e+,f−]: se compară produsul ((c+d)^(c+d)/(c^c d^d))·((e+f)^(e+f)/(e^e f^f)) și câștigă minimul','Depășirea capacității calculatorului de buzunar (56^56 da, 57^57 nu) ⇒ forma logaritmică'],
 proofs=['4.36.a–e (formulele pentru calculator: H[a+,b−], ternar, H(nod|atribut), caz cu 0, IG) — soluție DTs #5–11'],
 worked_example='Cn-s4:5–7: [3−,4+] cu A→[2−,0+],[1−,4+] față de B→[1−,1+],[2−,3+] (A mai bun: 5/7·H[1−,4+] < 5/7·H[2−,3+] pentru că 1/5<2/5); H[5−,3+] vs H[2−,9+] prin min/(a+b)=3/8>2/11',
 data_tables=['Cn-s4:5–7 comparațiile de ciote','4.36 ciotul simbolic [a+,b−]→[c+,d−],[e+,f−]','4.5 șase date, trei clase (X1,X2,Y)','4.42 întârzieri de zbor (marginale)'],
 exercises=['4.36','4.5','4.42'],
 slides=['DTs #5–11 (4.36)'],
 visuals=['Comparator de ciote: două ciote alăturate cu entropii ponderate și simbolurile <, =, > (viz 4, mod calitativ)'],
 misconceptions=['Se compară entropii nepondere (4.48 nota 3: H[2+,2−]>H[3+,2−], dar (4/6)H[2+,2−] < (5/6)H[3+,2−])','H[5−,3+] vs H[2−,9+] după numărul brut, nu după min/(a+b)','Uitarea că log₂ lipsește de pe calculator'],
 notes='4.42.b nu se poate decide riguros din marginale (hotărât: lecția cere doar (a) și arată de ce (b) nu se poate decide).')

lesson(11, 'ID3 complet, de mână',
 priority='A', definitions=['Schița ID3 (ML3:8) și pseudocodul (ML3:9, nu e citat în tabel, dar apare în teste)','Condiții de oprire: toate pozitive / toate negative / fără atribute rămase / ramură goală (eticheta majoritară a părintelui)','Regula de egalitate dată în enunț (ordinea din tabel)','Arborele ca reguli IF…THEN (calcul propozițional de ordin 0)','Coloana Counts = multiplicități'],
 properties=['(P1) arbore consistent cu datele de antrenament dacă ele sunt consistente ⇒ eroare la antrenare 0','Un atribut apare cel mult o dată pe un drum, dar poate apărea de mai multe ori în arbore (C-10)','Un atribut repetat pe un drum are IG=0 (4.43)','Proceduri de răspuns: desenează cioturile, scrie H(Y|A) în formă generală, substituie, alege minimul, recursează pe nodurile impure'],
 proofs=['4.43.a–c (de ce restricția „o dată pe drum” nu pierde nimic: al doilea test al lui A are IG=0)'],
 worked_example='T20b 2.1: șase rânduri (running nose, coughing, reddened skin, fever → ill): rădăcina running nose (H=0,459), arborele, consistent, clasificarea (coughing=+, fever=+, reddened=−, running=−), regulile',
 data_tables=['T20b 2.1 șase rânduri','4.2 ciuperci A–H (+ U,V,W)','4.37 zece zile (Weather, Temperature, Humidity, Wind, Play)','4.41 card de credit cu Counts'],
 exercises=['4.2','4.37','4.41','4.43'],
 slides=['ML3 #8–9 (schița și pseudocodul ID3)','ML3 #16 (arbore → reguli)','DTs #12–22 (4.2)'],
 visuals=['Constructorul ID3 complet: tabelul se partiționează la fiecare split, regula la frunze (viz 4)'],
 misconceptions=['Arborele ID3 e unic (4.37: egalitate Humidity/Temperature sub Sunny)','Un atribut apare o singură dată în tot arborele (fals; o dată pe drum)','Duplicatele nu contează (Counts = ponderi)','Un set consistent ⇒ predicții corecte pe date noi (4.2.f)'],
 notes='Cele opt rânduri ale lui 4.2 sunt aceleași date ca în demonstrația 5 din DEM:1 și în BS:90–93 (L20): declarat în declared_reuse.')

lesson(12, 'Proprietăți ID3 (1): căutare greedy, optimalitate, expresivitate, bias inductiv',
 priority='B', definitions=['Spațiul ipotezelor (toți arborii) și spațiul de versiuni','Căutare greedy, 1-step look-ahead, „Iterative Dichotomizer”, divide-et-impera','Bias inductiv: ierarhic, consistent cu datele, puține niveluri/noduri, atribute cu IG mare aproape de rădăcină (bias de căutare, ML3:17)','Briciul lui Occam (pro și contra, ML3:18)','Învățare inductivă (ML0:11–12; conectorul bias-ului inductiv nedecis, C-12)'],
 properties=['(P0) orice funcție booleană se reprezintă cu un arbore complet (adâncime n, 2^n frunze)','(P2) arborele ID3 nu e neapărat unic (egalități)','(P3) nu e neapărat optim ca noduri/niveluri','(P4) sensibil la atribute superflue','Complexitate: timp O(d·m·log m) la antrenare, O(d) la testare (B:487)'],
 proofs=['4.33 (orice funcție booleană are arbore: construcția completă)','4.1 / 4.32 (căutare exhaustivă a arborelui minim, pe cofactori)'],
 worked_example='T20C 2: patru puncte xor în {0,1}² (+,+,−,−): există un arbore perfect, dar varianta ID3 care se oprește când nu există IG>0 rămâne cu o singură frunză',
 data_tables=['T20C 2 xor în patru puncte','4.1 tabelul de adevăr (¬A∨B)∧¬(C∧A)','4.32 (A xor B)∧C','4.3 A∨(B∧C)','4.4 patru rânduri (A,B,C,Y)','4.39 (A∧B)∨(C∧D)','4.40 marțieni vs. oameni (10 rânduri)','4.17 număr de apeluri IG (A atribute)','4.18 opt rânduri Y=X1 xor X2'],
 exercises=['4.1','4.3','4.4','4.17','4.18','4.32','4.33','4.39','4.40'],
 slides=['ML3 #10–11 (spațiul ipotezelor e complet; căutare)','ML3 #17–19 (bias, Occam, timp)','ML0 #11–12 (ipoteza de învățare inductivă, bias inductiv)','ML0 #15 (eager vs. lazy: ID3 și Bayes Naiv sunt eager)'],
 visuals=['Vizualizare de arbori alternativi pentru aceeași funcție booleană (static, fără animație)'],
 misconceptions=['ID3 găsește cel mai mic arbore (Cn-s3:10: „doar încearcă”)','IG=0 la rădăcină ⇒ atributul nu apare niciodată (4.40: Height cu IG=0 la rădăcină, dar în arborele optim)','C pare informativ, dar nu e în conceptul real (4.4, xor)'],
 notes='4.17 și 4.18 sunt între paranteze în listă (opționale). Sursele nu spun dacă (P0)–(P4) se cer cu demonstrații la test; le sunt asociate exercițiile din caiet.')

lesson(13, 'Proprietăți ID3 (2): date reale — inconsistență, duplicate, adâncime, completare',
 priority='B', definitions=['Date de antrenament inconsistente','Atribut injectiv pe exemple','Învățare „eager” (ID3 construiește modelul înainte de test)'],
 properties=['(P1) cu date consistente eroarea la antrenare e 0','(P5) ID3 e insensibil la atribute duplicate, dar sensibil la instanțe duplicate','(P7) eroarea la antrenare ≤ (k−1)/k pentru k valori de ieșire','(P11) adâncimea ≤ numărul atributelor categoriale','(P13) numărul de frunze ≤ min(R,2^M) (4.9)','Atribut injectiv ⇒ adâncime 0 sau 1 (4.56.e)'],
 proofs=['4.9 (nr. maxim de frunze: min(R,2^M); atinsă cu o instanță)','4.56.a–e (adevărat/fals cu contraexemple: a,b fals; c adevărat; d fals; e adevărat)','4.16 (completarea unui arbore cu date noi, T₂ consistent cu D∪D′, dar poate fi mai slab decât T₁)'],
 worked_example='T21T2 1: opt rânduri (A,B,C,Y) cu toate combinațiile o dată ⇒ set consistent ⇒ eroare 0; adăugând (0,0,0,1) și (0,0,1,0) ⇒ eroare 2/10',
 data_tables=['T21T2 1 opt + două rânduri','4.6 Titanic (2201 persoane)','4.7 douăsprezece rânduri (A,B,C,Z)','4.8 atribute / instanțe duplicate','4.9 R instanțe, M atribute','4.16 D și D′','4.45 setul cu eroare ≥ 50% pe orice submulțime proprie','4.56 exemple pentru (d)'],
 exercises=['4.6','4.7','4.8','4.9','4.16','4.45','4.56'],
 slides=[],
 visuals=['Tabel cu rânduri duplicate/contradictorii marcate; contorul erorii minime'],
 misconceptions=['Un set consistent ⇒ predicții corecte pe date noi','Eliminarea unei instanțe duplicate nu schimbă arborele (poate schimba, 4.8.b)','Adâncimea ≤ 1+log₂R (fals, 4.56.d)'],
 notes='4.45: răspunsul (paritate) ține doar cu regula „clasa majoritară pe ramura nevăzută”, presupunere a verificatorului (ruled).')

lesson(14, 'Atribute continue: praguri, zone de decizie',
 priority='A', definitions=['Prag de separare la mijlocul intervalului dintre valori consecutive cu etichete diferite','Test „X ≤ prag” ca atribut discret','Zone de decizie, granițe de separare / decizie','Regula de numărare a pragurilor (o valoare cu ambele etichete contează ca graniță)'],
 properties=['(P8) granițele sunt axial-paralele','(P9) zonele nu sunt unice; ordinea testelor nu contează pentru zone (B:512)','(P12) adâncimea arborilor cu intrări continue: 1+⌈log₂n⌉ (separabil), 2⌈log₂n⌉ (neseparabil) — 4.11','Pragurile se recalculează pe instanțele nodului; același atribut poate apărea iar cu alt prag (4.12.b, 3.11.b obs. 4)','Rădăcina se alege între toate atributele discrete și toate pragurile (T21T2 4b)'],
 proofs=['4.47 (puncte cu aceeași etichetă pe ambele părți nu dau IG maxim, Fayyad–Irani; optional)','4.11.a–b (limite de adâncime; Special: nu e în tabel, cerut de lista prozei)'],
 worked_example='ML3:21: temperaturi 40, 48, 60, 72, 80, 90 cu No,No,Yes,Yes,Yes,No → pragurile 54 și 85',
 data_tables=['ML3:21 temperaturi și etichete','4.12 exoplanete (800) și 9 cu temperatura','4.48 nouă puncte în R² (B:549, DTs #48–52)','4.51 start-up-uri (12 rânduri)','4.50 trei dreptunghiuri (C1,C2,C3)','3.11.b zece puncte (B:465–467)'],
 exercises=['4.11','4.12','4.47','4.48','4.50','4.51','3.11.b'],
 slides=['ML3 #21 (atribute continue)','DTs #30–38 (4.12)','DTs #48–52 (4.48)'],
 visuals=['Selector de prag: valori sortate, praguri doar la schimbarea etichetei, IG pe prag (viz 5); zone de decizie în plan'],
 misconceptions=['Se testează fiecare valoare / fiecare mijloc (doar la schimbarea etichetei)','Pragurile se iau din tot setul, nu din instanțele nodului','Comparație nepondere la nodurile cu egalitate','Numărarea pragurilor: 6 sau 5 în 4.51.a depinde de regula pentru valoarea cu ambele etichete (hotărât: ambele etichete = graniță)'],
 notes='3.11.b: cartea tipărește șase noduri de test (0–5) în ordinea x<4,5, x<1,5, y<2, y<4, x<3,5, y<4 (B:467); 3.11.a (1-NN, Voronoi) nu e în tabel și nu e alocat.')

lesson(15, 'Eroarea la antrenare, validare, CVLOO; overfitting',
 priority='A', definitions=['Eroarea / acuratețea la antrenare, validare, test','Acc=(tp+tn)/(tp+tn+fp+fn); P=tp/(tp+fp); R=tp/(tp+fn); F=2PR/(P+R); Sp=tn/(tn+fp)','Set de validare; n-fold cross-validation; leave-one-out (CVLOO / LOOCV)','Overfitting (ML3:26): h∈H face overfit dacă există h′ cu error_train(h)<error_train(h′) și error_D(h)>error_D(h′)','Underfitting','Aproximația polinomială a lui H(p) pentru erori așteptate într-o frunză'],
 properties=['Protocol corect: împarte 900/100, 810/90 sau k-fold pe cele 900, reantrenează pe toate 900, raportează o singură dată pe cele 100 (Cn-s4:1–4)','CVLOO la ID3: pragurile se mută când scoți un punct (4,5; 5,5; 7,75; 9,25 în 4.10)','CVLOO = k-fold cu k=numărul de rânduri','Eroare la antrenare 0 nu e dovadă de calitate; diferența mare antrenare/validare = overfitting','Erori așteptate într-o frunză cu M instanțe și entropie H ≈ M(1−√(1−H))/2 (4.44, cu aproximația parabolică)'],
 proofs=['Aproximația 4.44 (H(p)≈4p(1−p) ⇒ p=(1−√(1−H))/2; ipoteza intenționată nu e în carte, ruled)'],
 worked_example='T21T2 5: trei rânduri (0,0,0),(1,0,1),(1,1,1) în A,B,Y: CVLOO al lui ID3 = 1/3 (rândul 1 scos ⇒ eroare; rândurile 2,3 ⇒ 0), cu regula de egalitate „tabelul în ordine, A înainte de B”',
 data_tables=['T21T2 5 trei rânduri','4.10 zece puncte (X,Y) cu DT* și DT2','4.46 flori Iris (11 rânduri + 3 de validare)','4.49 16 puncte (OVERFIT / UNDERFIT)','4.44 frunză cu M instanțe','4.21 enunțuri adevărat/fals','4.57 imagini cu cancer: 900/100 și acuratețe'],
 exercises=['4.10','4.21','4.44','4.46','4.49','4.57'],
 slides=['ML3 #26–27 (overfitting)','ML0 #14 (măsuri de evaluare)'],
 visuals=['Widget CVLOO: scoate un rând pe rând, predicția arborelui și contorul de erori (viz 6)'],
 misconceptions=['Overfitting = eroare mare la antrenare (invers)','LOOCV = test pe datele de antrenament (scoate un rând de fiecare dată)','Alegi cel mai bun algoritm după acuratețea pe test și o raportezi (optimism: maximul din 15)','Acuratețe 85% e bună (900/100: „mereu fără cancer” are 90%, 4.57.b)'],
 notes='4.57.a: fără cheie în carte; argumentul uzual (regresia logistică dă direct probabilitatea) e „reasoned”. Regresia logistică nu e predată (design §3).')

lesson(16, 'Pruning: IG sub prag, top-down vs. bottom-up, testul χ²',
 priority='B', definitions=['Evitarea overfitting-ului: oprire timpurie vs. post-pruning','Reduced-error pruning (set de validare)','Rule post-pruning (arbore → reguli, fiecare regulă tăiată separat)','Pruning cu prag ε pe IG: top-down (taie orice nod cu IG<ε) vs. bottom-up (taie doar dacă nici un descendent nu are IG≥ε)','Testul χ² al lui Pearson, ipoteza nulă, gradele de libertate (r−1)(c−1), p-valoare'],
 properties=['Top-down și bottom-up pot da arbori diferiți (4.19: V are IG=0, descendenții IG=1)','Aproape de frunze mulțimile sunt mici ⇒ IG≥ε nu e semnificativ ⇒ testul χ²','Aceeași IG (0,4591) la nodurile X4 și X1, dar doar X1 se elimină (4.20)','Doar ideile contează la 4.19 (săpt. 3–4, „completare ex. 4.19–20”)'],
 proofs=['4.53.a–b (deficiențe: top-down se oprește pe xor consistent; bottom-up cu atribute aleatoare; optional, [reasoned])','4.55.a–b (χ² la rădăcină 4,863>3,841; sub X1: 0,686; optional, [computed])'],
 worked_example='T21T2 10: arbore B (IG 0,3) → A (0,01) / A (0,02) → C (0,9): top-down cu ε=0,03 ⇒ B cu două frunze goale; bottom-up ⇒ al doilea A rămâne (descendentul C are IG≥ε)',
 data_tables=['T21T2 10 arborele cu IG-uri','ML3:5 / 4.54 PlayTennis (14 zile, Temperature Hot/Mild/Cool) și arborele ID3 dat','4.19 cinci rânduri (V,W,X,Y)','4.20 douăsprezece rânduri (X1..X4, clasă)','4.53 xor consistent, copiat de K ori','4.55 douăzeci și unu de instanțe (X1,X2)'],
 exercises=['4.19','4.20','4.53','4.54','4.55','4.58'],
 slides=['ML3 #28–31 (evitarea overfitting-ului, reduced-error, rule post-pruning)'],
 visuals=['Arbore cu IG pe fiecare nod și un prag ε reglabil care taie în direcția aleasă (reutilizează arborele din constructorul ID3)'],
 misconceptions=['Top-down și bottom-up dau același arbore','IG pe un eșantion mic la frunze este semnificativ','Pruning-ul îmbunătățește mereu eroarea la antrenare (o crește; ținta e eroarea de validare)'],
 notes='Tabelul PlayTennis (ML3:5 = 4.54) are aici proprietarul; 2.27 din L20 și 4.52 din L17 îl reiau (declared_reuse). 4.54.a–b repetă ID3 pe acest tabel doar ca verificare a arborelui dat. MDL ca alternativă la pruning (ML3:28, ML6:25–28) are o notă în L19.')

lesson(17, 'Raportul câștigului, atribute cu multe valori, alte criterii de impuritate',
 priority='B', definitions=['SplitInfo(S,A)=−Σ(|S_i|/|S|)log₂(|S_i|/|S|) („informația la separare”)','GainRatio=Gain/SplitInfo (C4.5, „raportul câștigului de informație”)','Impuritate Gini 1−ΣP²; impuritate de clasificare greșită 1−max P; „diminuarea impurității” Δi(n)','Gain²/Cost; valori lipsă (ML3:24, doar menționat)'],
 properties=['(P6) ID3 favorizează atributele cu multe valori; la părți egale SplitInfo=log₂|V|; SplitInfo=0 ⇒ atributul e sărit','Entropia ≥ Gini; clasificarea greșită are maxim 0,5 și nu vede împărțiri care nu schimbă majoritatea','EKG câștigă la Gain²/Cost în ciuda costului 5 (4.14.b)'],
 proofs=['4.15.c (există set cu Δ clasificare-greșită = 0, dar Gini și entropie ≠ 0)'],
 worked_example='Atribut „ID unic” vs. atribut real pe un tabel de 6 rânduri: IG(ID)=H(Y) (maxim), SplitInfo=log₂6, GainRatio mic (construit; cifrele se recalculează cu scriptul)',
 data_tables=['Tabelul construit cu atribut ID unic','4.13 doisprezece rânduri (X1 binar, X2 cu 6 valori)','4.52 PlayTennis cu Temperature numerică 19–26 ca atribut discret cu 7 valori','4.14 doisprezece pacienți (Sex, Peste60, Diabetic, Puls, EKG)','4.14.c vârste (17 valori)','4.15 setul a1/a2 și C c1/c2'],
 exercises=['4.13','4.14','4.15','4.52'],
 slides=['ML3 #20 (impurități)','ML3 #22 (gain ratio)','ML3 #23 (costuri)','ML3 #24 (valori lipsă)','DTs #53–59 (4.15)'],
 visuals=['Cele trei curbe de impuritate în funcție de P(c₁) (entropie, Gini, clasificare greșită)'],
 misconceptions=['Atributul cu ID unic e cea mai bună împărțire (IG maxim, dar inutil)','Raportul câștigului rezolvă tot (SplitInfo→0 îl strică)','Misclassification impurity e o măsură bună pentru ID3 (e oarbă la împărțiri fără schimbare de majoritate)'],
 notes='Tabelul 4.52 e o variantă a familiei PlayTennis (C-20); 4.14.a (H(AreAritmie|Sex=F)=1) rămâne aici împreună cu tabelul său, nu în L8, ca tabelul să apară o singură dată.')

lesson(18, 'Estimarea parametrilor: verosimilitate maximă (MLE)',
 priority='B', definitions=['Verosimilitatea L(θ) a unui set de date ca funcție de parametru („nu e o distribuție de probabilitate”, FND:30)','Log-verosimilitatea ℓ=ln L','Estimare în sensul verosimilității maxime (MLE): θ̂=argmax L(θ)','Estimarea din numărători: P̂(x)=n_x/N; P̂(A=a|Y=y)=#(A=a,Y=y)/#(Y=y)'],
 properties=['Bernoulli: θ̂_MLE=n₁/(n₁+n₀); categorial: θ̂_i=n_i/N','Verosimilitatea nu depinde de ordinea datelor','Concavitatea lui ℓ (ℓ″<0) garantează că ℓ′=0 dă maximul pentru Bernoulli','MLE nu e probabilitatea adevărată (zar cu date 1,2,3,4,5,6,1,1,1,1 ⇒ P̂(1)=1/2)'],
 proofs=['0.43.c (θ_MLE=n₁/(n₁+n₀) pentru Bernoulli) — demonstrația 3 din DEM:1; soluția rezolvată B:94–99'],
 worked_example='Cn-s5:1 „Remember 2”: patru rânduri (A,B,Y)=(0,0,0),(0,1,1),(1,0,1),(1,1,0): P̂(A=0,B=0)=1/4; P̂(A=0|Y=1)=1/2',
 data_tables=['Cn-s5:1 patru rânduri (A,B,Y)','0.42 două monede (θ și 2θ)','0.43 Bernoulli n=10 (șase de 1, patru de 0) + variantele n=5, n=100'],
 exercises=['0.42','0.43.a','0.43.b','0.43.c','0.43.d','0.43.e'],
 slides=['FND #28 (θ_i^ML=n_i/N)','FND #30 (verosimilitatea nu e distribuție)'],
 visuals=['Curba L(θ) pentru n₁,n₀ variabile; maximul apare la n₁/(n₁+n₀)'],
 misconceptions=['MLE e probabilitatea adevărată (zar)','Verosimilitatea e o distribuție în θ (nu: nu se însumează la 1)','Problema zero-urilor apare aici doar ca remarcă; tratarea ei e în L21'],
 notes='Zero-count și Laplace au un singur proprietar: L21 (T4 din hartă punea o previzualizare aici; scoasă, ca să nu se predea de două ori).')

lesson(19, 'Ipoteze ML și MAP; Bayes pentru ipoteze',
 priority='A', definitions=['P(h|D)=P(D|h)P(h)/P(D); numele corecte: P(D|h)=verosimilitate, P(h|D)=a posteriori (C-2: slide-ul numește greșit P(D|h) „a posteriori”)','Ipoteza de verosimilitate maximă h_ML=argmax P(D|h)','Ipoteza MAP h_MAP=argmax P(D|h)P(h) (P(D) nu depinde de h)','Estimarea MAP a unui parametru cu prior Beta(3,3): θ_MAP=(n₁+2)/(n+4)','Odds și log-odds','MAP „brute-force” (ML6:8) și clasificatorul Bayes optimal prin vot (ML6:9–10), nu e Bayes Comun din L20 (C-5)'],
 one_screen_notes=['Clasificatorul Gibbs (ML6:11): există, nu e cerut în teste (design §3)','MDL ca alternativă la pruning (ML3:28, ML6:25–28): „arbore mic + erori puține”, citit ca MAP; nu e cerut în teste'],
 properties=['Dacă P(hᵢ)=P(hⱼ) pentru toate i,j atunci h_MAP=h_ML (ML6:6)','argmax ≠ max (Cn-s5:1 „Remember 1”)','În 2.3, chiar cu priori egali FD câștigă (1,654e-8 vs 1,25e-8)','Coeficientul multinomial se simplifică în P(D|h)','Votul ponderat ne poate da o clasă diferită de cea a lui h_MAP (ML6:10: 0,4/0,3/0,3 ⇒ −)'],
 proofs=['h_MAP = argmax P(D|h)P(h) (împărțirea la P(D) nu schimbă argmax)','2.26 (definițiile ML și MAP sunt inversate: fals)'],
 worked_example='ML6:7: test de cancer: P(cancer)=0,008, P(+|cancer)=0,98, P(+|¬cancer)=0,03 ⇒ 0,0078 vs 0,0298, h_MAP=¬cancer, P(cancer|+)≈21%',
 data_tables=['ML6:7 cancerul','2.1 boala 1/500 (testul de 100 $, cel de 10.000 $)','2.2 casa bântuită (trei uși)','2.3 zarul lui Mickey (10 aruncări)','2.4 date 1-D cu frunze probabiliste (DT2, DT*)','2.24 trei cutii','2.25 trei prizonieri','0.26 zarul nou al lui Mickey (n aruncări)','0.43.f–i prior Beta(3,3)'],
 exercises=['0.26','0.43.f','0.43.g','0.43.h','0.43.i','2.1','2.2','2.3','2.4','2.24','2.25','2.26'],
 slides=['ML6 #5–6 (Bayes pentru ipoteze; ML și MAP)','ML6 #7 (exemplul cu cancer)','ML6 #8–11 (brute-force MAP, Bayes optimal prin vot, Gibbs)','ML6 #25–28 (MDL, notă)','BS #19–23 (soluțiile 2.3, 2.4)'],
 visuals=['Bare de posterior: prior × verosimilitate normalizat, cu comutator „priori egali”'],
 misconceptions=['Se confundă MAP cu ML (care folosește prior-ul? MAP)','Priori egali nu mai contează (MAP=ML)','În 2.3 prior-ul nu decide cazul','MAP e probabilitatea posterioară (e argmax-ul, nu valoarea)','Bayes optimal (vot) = Bayes Comun (nume identic, obiecte diferite)'],
 notes='2.4: a, b din carte; CVLOO al lui DT2 = 1/5 doar cu regula cărții (frunza cu egalitate → clasa 0), altfel 3/5 (ruled). P(T0|D) = 108/3125 = 0,03456, nu 0,0336 cum tipărește cartea.')

lesson(20, 'Bayes Naiv și Bayes Comun (Optimal); numărul de parametri',
 priority='A', definitions=['v_MAP=argmax P(a₁..aₙ|v)P(v)','Bayes Comun / Optimal / Joint Bayes: v_JB=argmax P(a₁..aₙ,v); „Comun” (distribuția comună), „Optimal” (nici o altă distribuție nu dă eroare medie mai mică, B:370–371)','Bayes Naiv: v_NB=argmax P(v)ΠP(aᵢ|v), cu independența condiționată a atributelor față de ieșire','Antrenarea = estimarea (MLE) a P(v) și a fiecărui P(aᵢ|v); fără căutare în spațiul ipotezelor (ML6:15)','Parametri liberi (complementele nu se numără)','Probabilitatea deciziei = produsul normalizat (posteriorul)'],
 properties=['(P0, cap. 2) cu independență condițională NB și Bayes Comun coincid; altfel pot diferi (decizia poate coincide, probabilitățile nu: 2.7, 2.29)','(P1, cap. 2) pentru n intrări Bernoulli și ieșire Bernoulli: NB 2n+1, Bayes Comun 2^(n+1)−1 parametri liberi','(P2, cap. 2) NB: spațiu O(dK), antrenare O(dn), testare O(dK)','Cu un singur atribut NB = Bayes Comun','NB nu cere atribute independente, ci independente condiționat de ieșire','Numărul de parametri 13 / 71 (EnjoyTennis, 2.27.b) e convenție: se numără doar parametrii liberi'],
 proofs=['Concavitatea log-verosimilității pentru datele ciupercilor din 4.2 (Hessiană negativ definită; demonstrația 5 din DEM:1; BS:91–92, Hessiana BS:98)','Derivarea MLE pentru NB cu 9 parametri: ∂ℓ/∂θ_y=3/θ_y−5/(1−θ_y)=0 ⇒ θ̂_y=3/8 (BS:91–92)'],
 worked_example='P20 2 / R18 3A: șapte rânduri (x,y,z,U), fără regula Laplace: Bayes Naiv P(U=0|x=0,y=1,z=0)=8/35 ≈ 0,229 ⇒ U=1, Bayes Comun 0 ⇒ U=1; cu un singur atribut P(U=0|x=0)=1/2 la ambii',
 data_tables=['P20 2 / R18 3A șapte rânduri (x,y,z,U)','2.27 EnjoyTennis = ML6:16 (tabel reluat din L16, reutilizare declarată)','2.5 opt rânduri cu trei booleene','2.6 tabel comun cu probabilități (0,15; 0,25; …)','2.7 tabele de numărători (X1,X2,Y)','2.28 șapte rânduri','2.29 numărători pentru (A,B,C)','BS:88–93 ciupercile A–H cu U,V,W (aceleași date ca 4.2; reutilizare declarată)'],
 exercises=['2.5','2.6','2.7','2.27','2.28','2.29'],
 slides=['ML6 #12–14 (v_MAP, NB, Bayes Comun)','ML6 #15–16 (fără căutare; exemplul PlayTennis)','BS #25–36 (2.7)','BS #42–48 (2.6)','BS #88–89 (NB cu 9 parametri)','BS #90 (ciupercile A–H: P(Y=1)=3/8)','BS #93 (U,V,W: 0,162; 0,255; 0,507)','BS #91–98 (derivarea MLE și concavitatea)'],
 visuals=['Calculator Bayes Naiv: numărători → probabilități → produsul pe clasă → decizia; numărul de parametri 2n+1 vs 2^(n+1)−1 (viz 7)'],
 misconceptions=['NB cere atribute independente (e independență condiționată)','NB și Bayes Comun diferă mereu (un atribut ⇒ egale; decizii egale cu probabilități diferite)','Parametri: uitat „liberi” (3 booleene ⇒ NB 7, Comun 15)','Se confundă „Bayes optimal” din ML6:9–10 cu Bayes Comun','Valorile instanței de antrenament în loc de cele ale instanței de test'],
 notes='2.27.a este exemplul din curs ML6:16 (yes 0,0053 vs no 0,0206 ⇒ No, normalizat 486/611=0,795); ecranul lui 2.27 arată tabelul din L16 compact și cere decizia, parametrii și erorile. 2.27 e rezolvat de doi calculatori independenți (verified-twice), dar numărul de parametri e convenție (ruled). Demonstrația 4 din DEM:1 (regula NB față de separator liniar, 2.38–2.39) e din săpt. 6+ și nu e alocată (out_of_scope).')

lesson(21, 'Probabilități zero și regula add-one (Laplace)',
 priority='B', definitions=['Problema probabilităților zero: un factor 0 anulează produsul; dacă toate scorurile sunt 0, posteriorul 0/(0+0+0) e nedefinit','Regula add-one: (count+1)/(N+|Val(A)|); „+2” pentru atribute Bernoulli','Estimarea m: (n_c+mp)/(n+m); add-one e cazul m=|Val|, p=1/|Val| (C-14)','Factorii pentru cuvinte absente: 1−P(cuvânt|clasă)'],
 properties=['Add-one pune +1 la numărător și |Val(A)| la numitor (nu doar +1 la numărător)','Cuvintele absente contribuie cu P(cuvânt absent|clasă)','Cu 0/0, regula lui Laplace e remediul (T21T2 7c)'],
 proofs=[],
 worked_example='T21T2 7: cinci rânduri cu A,Y cu trei valori: P(Y)=(1/5,2/5,2/5); pentru (A=0,B=0) toate scorurile sunt 0 ⇒ 0/(0+0+0) ⇒ nevoie de Laplace',
 data_tables=['T21T2 7 cinci rânduri','2.8 filtru de spam (cuvintele study, free, money…)','2.30 sport / politică, bag of words','2.31 șapte atribute binare'],
 exercises=['2.8','2.30','2.31'],
 slides=['ML6 #18 (problema datelor nevăzute, estimarea m)'],
 visuals=['Calculatorul NB din L20, cu comutatorul „add-one” și avertismentul de 0/0'],
 misconceptions=['Zero numărat ⇒ imposibil (study=1 niciodată în spam: scorul 0)','Add-one: +1 doar la numărător (P(A=0|Y=1) cu |Val|=3: (1+1)/(3+3)=1/3, nu 2/3)','Se uită factorii cuvintelor absente (2.8, 2.30)'],
 notes='2.30: convenția priorilor (numărători / egali) și a netezirii trebuie declarată în lecție (C-16: 0,8306 / 0,7586 / 0,8512).')

lesson(22, 'Bayes Naiv în practică: rata erorii, xor, atribute duplicate, New-Bayes',
 priority='B', definitions=['Rata medie a erorii E_P[I(v_NB/JB≠V)] calculată față de distribuția adevărată P, nu față de P_NB','Clasificatorul „New-Bayes”: perechea dependentă rămâne în același factor, argmax P(X₁|y)P(X₂|y)P(X₃,X₄|y)P(y) (2.9)','Cele două surse de eroare ale lui NB: majoritatea (comună cu Bayes Comun) și presupunerea de independență'],
 properties=['(P3, cap. 2) Bayes Comun greșește doar prin vot majoritar; NB și din cauza independenței','(P4, cap. 2) NB nu garantează eroare 0 pe date consistente (xor: 50%)','(P5, cap. 2) NB poate avea eroare 0 chiar când independența condiționată nu ține (y=A∧B cu biți corecți independenți)','(P6, cap. 2) NB suferă la atribute duplicate; Bayes Comun nu; ambele la instanțe duplicate','(P7, cap. 2) Bayes Comun are eroare 0 la antrenare pe orice funcție booleană (date consistente)','Prin 2.9 / 2.35.e: New-Bayes are mai puțini parametri decât Bayes Comun și aceeași eroare (11 față de 15; NB 7)','2.11: din 16 funcții booleene de două variabile Bernoulli(0,5) NB are eroare 0 la 14 și 50% la xor/¬xor'],
 proofs=['2.9 (justificarea regulii New-Bayes cu regula de înlănțuire condiționată: P(A₁,A₂,A₃|B)=P(A₃|B)P(A₂|A₃,B)P(A₁|A₂,A₃,B), plus independențele date)','2.35.e (A⊥C | B,Y din tabelul de adevăr)'],
 worked_example='T20C 3 (=2.32): P(Y)=(0,8; 0,2), P(X1|Y) cu 0,7/0,3: tabelul P(X1,Y), decizia NB, rata așteptată a erorii; apoi X2 = copie a lui X1: deciziile se pot inversa (construit pe cifrele testului; 2.32 e din săpt. 6 și nu e exercițiu alocat)',
 data_tables=['T20C 3 / 2.32 P(Y) și P(X1|Y)','2.11 cele 16 funcții booleene','2.33 drumeție (Rainy, Sunny, Windy, Hike)','2.9 variabilele X₁..X₄','2.35 Y=(A∧B)∨¬(B∨C) cu A,B,C biți corecți independenți','2.36 Y=A∧B','2.42 patru enunțuri NB vs. ID3'],
 exercises=['2.9','2.11','2.33','2.35','2.36','2.42'],
 slides=['ML6 #17 (presupunerea e deseori încălcată, dar NB merge surprinzător de bine)','BS #49–54 (2.33)','BS #64–72 (2.35)','Cn-s6:2–4 (rata medie a erorii; două surse de eroare)'],
 visuals=['Calculatorul NB cu doi indicatori: eroarea față de P adevărat și față de P_NB (două numere diferite pe același tabel)'],
 misconceptions=['Se numără doar greșelile pe rândurile de test în loc de așteptarea față de P adevărat','„Adăugarea unui atribut nu dăunează niciodată lui NB” (2.33: 0,435 → 0,45)','NB are eroare 0 pe date consistente (xor)','NB e inutil când atributele depind (nu mereu; ML6:17)'],
 notes='2.36 nu e în tabel și nici în lista proză; e inclus doar ca singurul exemplu al proprietății (P5) din rândul săpt. 5 (verified-twice). 2.10, 2.12, 2.32, 2.34, 2.44 sunt în out_of_scope (săpt. 6).')

lesson(23, 'Funcții convexe, inegalitatea lui Jensen și demonstrațiile despre entropie',
 priority='C', definitions=['Mulțime convexă, funcție convexă / strict convexă / concavă (0.78, doar definițiile în săpt. 3; demonstrațiile complete în Special sapt. 5)','Jensen: f(Σaᵢxᵢ)≤Σaᵢf(xᵢ) pentru aᵢ≥0, Σaᵢ=1','Varianta probabilistică f(E X)≤E f(X)'],
 properties=['Pentru f strict convexă egalitatea are loc ⇔ toți xᵢ sunt egali','Pentru f concavă inegalitățile se inversează','AM-GM: (x₁+…+xₙ)/n ≥ (x₁⋯xₙ)^{1/n}','H(X) ≤ log₂n, cu egalitate ⇔ distribuția uniformă','IG(X;Y) ≥ 0 direct, din definiție, și IG=0 ⇔ independente','H(X,Y)=H(X)+H(Y) ⇔ X,Y independente','H(X,Y|A)=H(Y|A)+H(X|Y,A) (înlănțuire condiționată)'],
 proofs=['0.78.a–b (caracterizările convexității; Special sapt. 5; în sapt. 3 doar definițiile)','0.79.a–c (Jensen prin inducție; AM-GM; varianta probabilistică; Special sapt. 3)','0.143 (H(X)≤log₂n în trei moduri: ln x≤x−1, Jensen, Lagrange; PS:157–165; Special sapt. 4)','0.144 (X⊥Y ⇒ H(X,Y)=H(X)+H(Y); PS:166–168; Special sapt. 3)','0.145.a–b (înlănțuire condiționată, cu intuiția de o propoziție de la (a); PS:169–173; Special sapt. 3)','0.146.a–b (IG≥0 din Jensen; IG=0 ⇔ independente; PS:150–156; Special sapt. 5)','0.59 (H(X,Y)=H(X)+H(Y) ⇔ independente)','0.62 (caracterizarea axiomatică a entropiei, optional)'],
 worked_example='Verificare numerică a lui Jensen pentru f(x)=x² cu ponderi (1/2,1/2) și valorile 1 și 3 (construit; 2 ≤ 5), apoi aplicată la log₂ pentru distribuția (1/2,1/4,1/4) (construit)',
 data_tables=['Exemplul numeric Jensen (1 și 3)','0.151 enunțuri adevărat/fals pe entropie','0.62 cerințele A1–A3'],
 exercises=['0.59','0.62','0.78','0.79','0.143','0.144','0.145','0.146','0.151'],
 slides=['PS #150–173 (IG ≥ 0, H ≤ log n, înlănțuire)','PS #232–240 (Jensen)'],
 visuals=['Grafic al unei funcții convexe cu coarda deasupra graficului; punct de egalitate'],
 misconceptions=['Sensul inegalității Jensen se inversează pentru concavă (log₂ e concavă)','Egalitatea în Jensen strict convexă cere toate punctele egale','Se demonstrează H≤log n doar pentru n=2 (trebuie general)'],
 notes='Oprite aici de design: teorie fără întrebări în T1 de pe hartă (apare în S1/S2 și în lista Seminarului Special). Proprietățile enunțate în L7–L8 sunt demonstrate aici.')

lesson(24, 'Entropia încrucișată, inegalitatea lui Gibbs, divergența Kullback–Leibler',
 priority='C', definitions=['Entropia încrucișată CH(p,q)=−Σp(x)log₂q(x)','Inegalitatea lui Gibbs: H(P) ≤ CH(P,Q)','Entropia relativă / divergența KL: KL(p‖q)=−Σp log(q/p)=CH(p,q)−H(p), „numărul de biți adiționali”','IG(X,Y)=KL(p_{X,Y}‖p_X p_Y)','Varianta condiționată a KL; regula de înlănțuire a KL','Selecția modelelor probabiliste după entropia încrucișată față de distribuția empirică'],
 properties=['CH ≥ 0, nemărginită superior, nesimetrică (0.63)','CH(P,Q)=H(P) ⇔ P=Q (0.64)','KL ≥ 0, =0 ⇔ p=q; KL nu e distanță (nesimetrică, fără inegalitatea triunghiului)','Minimizarea KL față de distribuția uniformă pe date = maximizarea Σ ln P_θ(x⁽ⁱ⁾) (0.149)','IG=E_Y[KL(p_{X|Y}‖p_X)]; a doua demonstrație a lui IG≥0 e un corolar de o linie (prima, directă, e în L23: 0.146)'],
 proofs=['0.63.a (CH nenegativă)','0.64.a–b (Gibbs prin Jensen cu variabila q/p; egalitate ⇔ P=Q)','0.65.a–c (KL≥0; IG ca KL; corolar IG≥0 și IG=0 ⇔ independente)','0.148 (varianta condiționată și regula de înlănțuire pentru KL; PS:210–214)','0.149 (argmin KL(P̂‖P_θ)=argmax Σ ln P_θ; optional)'],
 worked_example='Două monede: p=(1/2,1/2) și q=(1/4,3/4): H(p)=1; CH(p,q)=1,2075; KL=0,2075 biți; CH(q,p)≠CH(p,q) (construit; cifrele se recalculează cu scriptul)',
 data_tables=['Exemplul construit p,q','0.63.b distribuția empirică p și modelele q₁, q₂ cu 7 valori','0.147 P_A, P_B față de P_t','0.60 [a,b] uniformă / gaussiană (optional)','0.61 exponențială / Gamma (optional)'],
 exercises=['0.60','0.61','0.63','0.64','0.65','0.147','0.148','0.149'],
 slides=['FND #36–39 (cross-entropie și KL; intervalul din tabel e #32–35, vezi C-3 și C-7)','PS #196–214 (Gibbs, KL, KL condiționat)'],
 visuals=['Două distribuții alăturate cu CH, H și KL ca bare (KL = diferența)'],
 misconceptions=['KL e distanță (nesimetrică)','CH e mărginită de log n (nu are limită superioară, B:150)','CH(model,adevărat) în loc de CH(adevărat,model) (0.147)','Cross-entropia mică garantează modelul adevărat (0.63.b: nu garantează)'],
 notes='Numerotarea: caietul 2026 are KL la 0.65.a/b; fișa IT:2 și lista proză (WYSK:4) folosesc numerele vechi 0.63.a/b (C-7). 0.60 și 0.61 (entropia diferențială) cer densități continue și sunt opționale: un ecran de enunț și soluția din carte (0.60 are soluție în carte; 0.61 nu a fost verificată).')

# ---------------------------------------------------------------- 2026-10-29: additions for the teacher's list (D-069)
# The teacher's list of what the Friday test needs, checked item by item against the outline; the missing pieces were added to
# the lesson that owns the topic (outline sections marked "added 2026-10-29"). Additions only: no owner, id or item changes.
CONCEPTS[5].append(('C5.4', 'Variabile construite din două variabile: distribuția lui g(X,Y) din tabelul comun (X+Y, X−Y, produsul XY); funcții de variabile independente', ['C5.1', 'C5.2']))
CONCEPTS[12].append(('C12.4', 'Obiectivul ID3 (date explicate, model compact, generalizare) și modelul construit: arborele, ierarhie de partiționări', ['C11.1']))
CONCEPTS[21].append(('C21.3', 'Seturi de date nebalansate: priori predefiniți în locul frecvențelor relative, factorii învățați rămân', ['C20.1']))

ADDITIONS = {
 4: dict(
  proofs=['Var(X+a)=Var(X) din definiția varianței și liniaritatea mediei (L4.c1, construit; aceeași demonstrație o cere T21P 2)'],
  data_tables=['L4.c1: X∈{1,4} cu 2/3, 1/3, a=5 (construit)', 'L4.c2: trei p.m.f. candidate pe {1,2,3} și p(x)=c·x (construit)'],
  exercises=['L4.c1', 'L4.c2'],
  misconceptions=['Media nu se mută la X+a (Var(X+a) calculat cu E[X] în loc de E[X+a])', 'O p.m.f. cere doar suma 1 (se uită p(x)≥0)']),
 5: dict(
  definitions=['Distribuția lui g(X,Y) din tabelul comun: se adună celulele cu aceeași valoare a lui g (X+Y, X−Y, produsul XY)'],
  properties=['X, Y independente ⇒ f(X), g(Y) independente; E[f(X)g(Y)]=E[f(X)]E[g(Y)], de ex. E[XY²]=E[X]E[Y²]; Var(X+2Y²)=Var X+4Var(Y²)',
              'Pe hârtie, independența se arată pe toate celulele (definiția; scurtătura binară doar ca verificare); lipsa ei, cu o singură celulă'],
  data_tables=['L5.c1: X∈{1,2} (0,4; 0,6) și Y∈{0,1,2} (0,5; 0,3; 0,2), independente (construit)'],
  exercises=['L5.c1'],
  misconceptions=['E[XY²]=E[X](E[Y])² (pătratul aplicat după medie)', 'O valoare a lui g(X,Y) care vine din mai multe celule ia doar o celulă']),
 12: dict(
  definitions=['Obiectivul ID3 (B:486-487): un arbore care explică datele (consistent dacă datele sunt consistente), cât mai compact și cu putere de generalizare; urmărit local, prin IG maxim la fiecare nod; modelul = arbore de decizie, ierarhie de partiționări (notele 490-491)'],
  misconceptions=['ID3 minimizează direct eroarea la antrenare / maximizează IG pe tot arborele']),
 14: dict(
  definitions=['Zona unei frunze = conjuncția testelor de pe drum, dreptunghi cu laturi paralele cu axele; zona unei clase = reuniunea frunzelor ei (B:466-467)'],
  misconceptions=['Zona unei frunze scrisă fără testele de mai sus de pe drum']),
 15: dict(
  definitions=['Good fit: erori mici și apropiate la antrenare și la validare (față de overfitting și underfitting)'],
  data_tables=['L15.c1: 600 de rânduri, 100 test, 5-fold pe 500 (acurateți 0,80; 0,90; 0,70; 0,85; 0,75) (construit)'],
  exercises=['L15.c1'],
  misconceptions=['Erori apropiate înseamnă underfitting și când sunt mici', 'Se raportează estimarea de validare a modelului ales']),
 20: dict(
  definitions=['Justificarea regulii (B:355 și nota 415): argmax P(v|a₁..aₙ) = argmax P(a₁..aₙ|v)P(v)/P(a₁..aₙ) (formula lui Bayes) = argmax P(a₁..aₙ|v)P(v) (numitorul pozitiv nu depinde de v); apoi independența condiționată (NB) sau regula de înmulțire, argmax P(a₁..aₙ,v) (Bayes Comun); forma soluției T21T2 7.c.i'],
  properties=['Numărarea generală (atribute categoriale, K clase): NB (K−1)+KΣ(|Val(Aᵢ)|−1), Bayes Comun (K−1)+K(Π|Val(Aᵢ)|−1); pentru NB coincide cu soluția oficială T21T2 7.b (11 pentru A cu 3 valori, B cu 2, Y cu 3)']),
 21: dict(
  definitions=['Set de date nebalansat; priori predefiniți (P(v) fixat după proporțiile reale, egal sau după costul erorilor; factorii învățați rămân)'],
  properties=['Priorul la care decizia NB se schimbă: pA/(pA+(1−p)B)=1/2 (2.8.d)',
              'Pe rândurile T21T2 7 (A cu 3 valori, B cu 2, Y cu 3) NB estimează 11 parametri liberi (T21T2 7.b; numărarea din L20.s11, a doua predicție din L21.s02)'],
  data_tables=['L21.q5: 5 pozitive / 95 negative, P(A=1|+)=0,8, P(A=1|−)=0,1 (construit)'],
  misconceptions=['La priori predefiniți trebuie reestimați și factorii', 'Priorii trebuie să rămână frecvențele din antrenament']),
 22: dict(
  properties=['(P8) complexitatea de eșantionare: logaritmică pentru Bayes Naiv, exponențială pentru Bayes Comun (enunțată, fără demonstrație; 2.13 rămâne în afara programei)'],
  definitions=['Avantajele și dezavantajele lui Bayes Naiv față de Bayes Comun (P0-P8), adunate într-un tabel: L22.s10a (lista profesorului, item 22)'],
  misconceptions=['Bayes Optimal nu greșește niciodată (optimal luat drept eroare 0)']),
}
for _n, _add in ADDITIONS.items():
    _d = [d for d in L if d['n'] == _n][0]
    for _f, _items in _add.items():
        _d[_f] = list(_d.get(_f, [])) + _items

# ---------------------------------------------------------------- tests
TESTS = [
 dict(id='ml-test-mock-t1', title_ro='Test de probă T1 (6 p, 100 min, mod hârtie)', after_lesson=24, kind='mock',
  design='o problemă pe ecran; scrii pe hârtie → Predă → vezi soluția și te notezi după barem; cifre noi la fiecare problemă (variante generate și verificate cu script), nu textul original; hint-urile H(p) se tipăresc corect (T20C are hint-ul inversat)',
  total_points=6.0, minimum=1.5,
  problems=[
   dict(n=1, title='Probabilități: totală, Bayes, independență, demonstrație', points=0.9, rank_basis='tip 1 (egal) 9/15 hârtii; demonstrații 7/15',
        parts=[('a','0.3','Bayes cu probabilitate totală pe un enunț de tip aeroport'),('b','0.2','independența a două evenimente din cifre (P(A∪B)=P(A)+P(B)−P(A)P(B))'),('c','0.2','demonstrează P(A,B|C)=P(A|C)P(B|A,C)'),('d','0.2','adevărat/fals cu contraexemplu')],
        adapts=['T20b 3.1 (aeroport, 0,5 p)','T16 (1) (uniune și independență)','T21S 4a (independente ⇒ P(A∪B))','T21S 4 (adevărat/fals, contraexemplu)','T20b 1.2 (demonstrație de tip P(C|A,B))','T20a 1.2 (demonstrează probabilitatea totală)'],
        lessons=[1,2,3]),
   dict(n=2, title='Tabel comun: independență, independență condiționată, E/Var/Cov', points=1.1, rank_basis='tip 8 (egal) 6/15',
        parts=[('a','0.5','p și q din independență, verificată pe toate celulele'),('b','0.2','independență condiționată cu definiția'),('c','0.4','E, Var, Cov din tabel'),],
        adapts=['T21S 1 (1,8 p, p și q necunoscute)','T20a 1.5 (1 p)','T20b 1.4–1.5','T16 (2)'],
        lessons=[4,5,6]),
   dict(n=3, title='Entropie și câștig: ciot, definiția întâi, substituție', points=0.8, rank_basis='tip 1 (egal) 9/15; numeric H/IG 6/15',
        parts=[('a','0.2','scrie definiția IG, apoi substituie fără să termini'),('b','0.3','desenează cele două cioturi, scrie H(Y|A) în formă generală, alege rădăcina'),('c','0.3','aceeași alegere calitativ, prin monotonia lui H(p) (fără calculator)')],
        adapts=['R18 1a (IG: definiția întâi, 4 cioturi)','T16 (3) (Gain(X1) vs Gain(X3), 6 instanțe binare)','T20a 1.5 d–f (H(X), H(X|Y=0), IG: doar substituție)','T21T2 2–3 (comparații calitative)'],
        lessons=[7,8,9,10]),
   dict(n=4, title='ID3 de mână cu un atribut continuu', points=1.3, rank_basis='tip 5 (egal) 7/15 + continue 6–7/15',
        parts=[('a','0.2','numără pragurile distincte ale atributului continuu'),('b','0.6','arborele ID3 cu regula de egalitate dată în enunț'),('c','0.2','clasifică o instanță și scrie arborele ca reguli'),('d','0.3','eroarea la antrenare; este setul consistent?')],
        adapts=['T20a 2.2 (2,5 p)','T20b 2.2 (Câte praguri… Height)','T21S 2 (2,2 p, credit card cu Varsta continuu)','T21T2 4 (praguri: C 2, D 3)','T20C 1 (duplicate, 10 rânduri; hint-ul inversat se corectează)'],
        lessons=[9,11,14]),
   dict(n=5, title='Eroare la antrenare, CVLOO, overfitting; adevărat/fals pe ID3', points=1.0, rank_basis='tip 3 (egal) 8/15; adevărat/fals ID3 3/15',
        parts=[('a','0.3','eroarea la antrenare și CVLOO pe o figură cu puncte'),('b','0.2','este overfitting? definiția riguroasă (ML3:26)'),('c','0.3','adevărat/fals cu argumentare (optimalitate, atribut repetat, adâncime ≤ m)'),('d','0.2','alegerea modelului din erori de antrenare/validare (NB 5/6, ID3 5/40: overfit)')],
        adapts=['T21S 3 (1,2 p)','T21C 1 (CVLOO, overfitting, definiția din Mitchell)','T20a 2.1 (XOR: antrenare 0, CVLOO 1)','T20b 2.3 și T21S 4c (adevărat/fals pe ID3)','T21T2 8 (modele NB, ID3, ID3-Gini)'],
        lessons=[12,13,15]),
   dict(n=6, title='Bayes Naiv vs. Bayes Comun pe un tabel', points=0.9, rank_basis='tip 3 (egal) 8/15; parametri 6/15; Laplace 4/15',
        parts=[('a','0.3','decizia și probabilitatea ei pentru Bayes Naiv'),('b','0.2','același lucru pentru Bayes Comun și de ce diferă'),('c','0.2','numărul de parametri liberi'),('d','0.2','ce probleme apar la zero numărat și remediul (add-one)')],
        adapts=['T20a 3.1–3.2 (1 p)','T20b 3.2–3.4 (3,5 p)','P21 3 c.iii–iv (parametri 7 / 15 / 11)'],
        lessons=[20,21,22]),
  ],
  rule='nici o problemă nu reia datele unei lecții: P21 1b, P20 2 (= R18 3A), T20b 2.1, T20C 2, T20C 3, T21T2 1, 5, 7, 10 sunt exemple lucrate (L9, L20, L11, L12, L22, L13, L15, L21, L16), iar problemele identice cu un exercițiu din caiet (T21C 2 = 4.37, P18 2 = 4.46, P20 1 = 4.52, P18 1A = 2.3, P18 1B = 2.29, P20 5 = 2.25, T0 = 0.141/0.90) nu se adaptează deloc',
  not_in_mock=['pruning / gain ratio / χ² (3/15, în L16–L17)','rata erorii NB, xor, atribute duplicate (4/15, în L22)','demonstrații Jensen / KL (S1, S2, în L23–L24)','bonus P20 5 (trei prizonieri) — în L19']),
 dict(id='ml-test-t21p', title_ro='Probabilități și statistică + ID3 (1), 2021–22, ca la examen', after_lesson=24, kind='past-paper',
  source='tests/2021-2022-t1-seminar-ro/subiect.pdf (seria RO, 17 itemi, 6 p, 1 h 30, minimum 1,5 p); seria EN adaugă 1,0 p de ieșiri Python (Practica) care nu sunt în seria RO și nu se folosesc',
  total_points=6.0, minimum=1.5,
  item_to_lessons={'1':[1],'2':[4],'3':[4],'4':[1],'5':[4],'6':[1],'7':[3],'8':[18],'9':[2],'10':[9],'11':[5,7,8],'12':[9],'13':[6],'14':[9,10],'15':[8],'16':[1,3,5,7,8],'17':[11,12,13]},
  note='Hint-urile H(p) tipărite în lucrare sunt cele din original; itemii 4–6 (spațiu de eșantionare, p.m.f. validă, notație de mulțimi) au enunț propriu în L1/L4. Nici unul dintre tabelele ei nu coincide cu un tabel deținut de o lecție în această alocare (de reconfirmat la schiță).'),
]

OUT_OF_SCOPE = [
 dict(item='Variabile continue din foundations (densitate, uniformă, normală, 1-D/multivariată) și exercițiile 0.17, 0.18, 0.20, 0.30–0.38, 0.40, 0.50–0.51, 0.104–0.112, 0.115–0.117, 0.122, 0.135–0.136',
      reason='Blocurile „Advanced issues” din WYSK:2–3 nu sunt în tabelul 1–5 și nu apar ca tip de problemă în harta §3; D-037 le lasă ca decizie deschisă a lui Alex (content-map 6.6). Singura propoziție necesară (P(X=x)=0, 0.23.a) e în L4. Prima propunere din design §7 (lecția 4: densitate, uniformă, normală) este deci eliminată.'),
 dict(item='0.110, 0.111, 0.112 (adevărat/fals pe v.a., aplicații binomiale/categoriale)', reason='Nu sunt în tabel și nici în enumerarea de exerciții a săptămânilor 1–5; hartă 6.6: de decis de Alex.'),
 dict(item='Demonstrația 4 din DEM:1 (regula NB față de separator liniar, 2.38–2.39) și regresia logistică (2.38, 2.39, 2.14 etc.)', reason='Săptămâna 6+ (WYSK:8) și non-goal din design §3.'),
 dict(item='2.10, 2.12, 2.13 (complexitatea eșantionării NB), 2.32 (ca exercițiu), 2.34, 2.44', reason='Săptămâna 6 (WYSK:8); tipul cerut în teste (rata erorii NB, duplicate, xor) e acoperit de 2.11, 2.33, 2.35 și de exemplul lucrat T20C 3 = 2.32 (L22). R18 3B (=2.44) nu se adaptează.'),
 dict(item='k-NN / IBL (cap. 3: 3.9, 3.11.a, 3.23 etc.; P20 3–4; T20b 4; P21 2)', reason='În afara săptămânilor 1–5 (design §3); 3.11.b e alocat (L14) fiindcă e în tabel.'),
 dict(item='AdaBoost, ansambluri (ML3 #32–36; P18 3; R18 2; DTs ex. 22–29, 72), SVM, clustering, EM, HMM, regresie', reason='Săptămâna 6+ (design §3 non-goals).'),
 dict(item='Gaussian Naive Bayes (P18 3b)', reason='În afara săptămânilor 1–5; hartă §3.'),
 dict(item='Slide FND #32 (Posterior Mean Estimator)', reason='Tabelul citează „#32–33, 35”, dar #32 e estimatorul mediei a posteriori; se folosesc #33–35 (C-3).'),
 dict(item='Exerciții de implementare 4.58 și ale CMU din WYSK:5–7 (C/Matlab)', reason='Non-goal: programarea algoritmilor (design §3). 4.58 e alocat ca opțional în L16 numai pentru acoperire a listei, fără ecran de cod; celelalte nu au număr în caiet.'),
 dict(item='Python/Colab (seria EN: random.sample, tfd.Bernoulli, DecisionTreeClassifier, BernoulliNB, predict_proba)', reason='Non-goal: nu rulăm Python în browser (design §3); seria RO nu are aceste itemi. Singurul item EN cu echivalent manual (Bernoulli: medie, varianță, entropie) e acoperit de L4/L7.'),
]

DECLARED_REUSE = [
 dict(table='ML3:5 PlayTennis (14 zile, Temperature Hot/Mild/Cool)', owner=16, also_in=['L20: 2.27 = ML6:16 (Bayes Naiv pe aceleași 14 rânduri)','L17: 4.52 (aceleași 14 zile cu Temperature numerică, C-20)'],
      reason='Caietul și cursul folosesc acest set canonic pentru trei întrebări diferite (pruning pe un arbore dat, NB, gain ratio). Ecranele reîntrebă ceva nou și nu repetă explicația; tabelul apare compact, cu trimitere „vezi Lecția 9”. Fără această reutilizare ar trebui inventate date pe care profesorul nu le-a pus.'),
 dict(table='4.52 PlayTennis cu Temperature numerică ca atribut discret (variantă a familiei de mai sus, C-20)', owner=17, also_in=[],
      reason='Altă coloană Temperature; tabel separat, deținut doar de L17.'),
 dict(table='4.2 ciuperci A–H', owner=11, also_in=['L20: demonstrația 5 din DEM:1 și BS:88–93 (Bayes Naiv, aceleași opt rânduri)'],
      reason='Demonstrația cere exact acest set („setul de date din ex. 4.2”) și BS:90, 93 (din tabel, săpt. 4) îl folosesc; lecția L20 nu reprezintă datele de la început, doar le leagă înapoi.'),
]

# ---------------------------------------------------------------- order changes
ORDER_CHANGES = [
 ('Prov. 1 (evenimente, condiționată, înmulțire, totală, Bayes) → L1 + L2','Prea multe concepte într-o lecție (5+ față de maxim 4): se separă „spațiu + condiționare + înmulțire” de „totală + Bayes”.'),
 ('Prov. 2 (independență) = L3','Neschimbată; adaug cele două presupuneri implicite din seminar (Cn-s1:4,8).'),
 ('Prov. 3 (v.a. discrete, comună, marginale, independență, medie/varianță/Cov, distribuții uzuale) → L4 + L5 + L6','Un singur bloc ar fi avut peste 10 concepte. Se taie după dependențe: v.a. + medie/varianță + Bernoulli/binomială; distribuții comune + covarianță; independență condiționată (cu exercițiile 0.16/0.101 care au nevoie de ea).'),
 ('Prov. 4 (variabile continue: densitate, uniformă, normală) eliminată','Nu e în tabelul 1–5 (doar 0.23.a), nu apare printre tipurile de probleme ale hărții (secțiunea 3) și e un non-goal din design §3 (distribuții neuzuale). Rămâne o propoziție în L4 (P(X=x)=0, p.d.f. ≠ probabilitate). Decizia rămâne a lui Alex (content-map 6.6).'),
 ('Prov. 5–6 (entropie; condiționată, comună, IG) = L7, L8','Neschimbate.'),
 ('Prov. 7 (entropie încrucișată, KL, Gibbs) mutată la sfârșit (L23, L24) și împărțită în două','În hartă apare doar în Seminarul Special și în S1/S2 (nu ca tip de problemă T1); nimic de după nu depinde de ea; ID3 (tipul 1 pe frecvență) și Bayes (8/15) trebuie să vină înainte. Conține și Jensen, de care depind demonstrațiile 0.143/0.146 ale unor proprietăți enunțate în L7–L8: acestea se predau cu Jensen. Divizare: L23 (convexitate, Jensen, demonstrațiile de entropie) / L24 (CH, Gibbs, KL) pentru plafonul de concepte.'),
 ('Prov. 8 (arbori, cioturi, rădăcina) = L9; lecție nouă L10','Metoda fără calculator (hartă T9: 4.36, raționamente relaționale) are propriile concepte și cele mai multe puncte în bareme (P21 1b.ii); intercalată între rădăcină și ID3 complet.'),
 ('Prov. 9 (ID3 complet + proprietăți P0–P11) → L11 + L12 + L13','ID3 complet (11) separat de proprietăți: P0, P2–P4 și bias (12); P1, P5, P7, P11, P13 (13). P6 e în L17, P8–P9 în L14, P10 în L15.'),
 ('Prov. 10 (atribute continue) = L14','Neschimbată.'),
 ('Prov. 11 (eroare, overfitting, validare, CVLOO, pruning, bias) → L15 + L16 + L17','Eroarea și overfitting-ul în L15; pruning (ideea 4.19–4.20, reduced-error, rule post-pruning) în L16; gain ratio, impurități, costuri (4.13–4.15, 4.52) în L17; bias inductiv în L12.'),
 ('Nou: L18 MLE','Prov. nu avea MLE; trebuie înainte de L19–L21 și e demonstrația 3 din DEM:1.'),
 ('Prov. 12 (MAP, ML, Bayes Comun/Optimal, numărul de parametri) → L19 + L20','MAP/ML pentru ipoteze, în sine; Bayes Naiv/Comun cu parametrii în L20.'),
 ('Prov. 13 (Naive Bayes: antrenare, clasificare, zero-uri, Laplace, erori NB vs. Joint) → L20 (antrenare) + L21 (Laplace) + L22 (erori, xor, duplicate, New-Bayes)','Plafon de concepte; zero-urile și Laplace au un singur proprietar (L21).'),
 ('Prov. 14 (test de probă T1) → intrare în tabloul `tests`','Nu e lecție în player (mod hârtie); apare în filtrul Teste. Al doilea test e T21P ca la examen.'),
]

# ================================================================ derived data + validation
SLIDES_REQUIRED = {
 'FND': list(range(4,11)) + list(range(14,18)) + [33,34,35],
 'ML0': [10],
 'ML3': [8] + list(range(10,14)) + list(range(20,25)) + list(range(26,32)),
 'ML6': [4,5,6,12,13,14],
 'BS': [90,93],
 'DTs': list(range(2,5)) + list(range(12,23)),
}

def expand(ex):
    """whole id -> list of atoms"""
    base = ex.split('.')
    if len(base) == 3:                 # '0.9.a'
        return [ex]
    parts = MASTER.get(ex)
    if parts is None:
        raise KeyError('unknown exercise ' + ex)
    return [ex + '.' + p for p in parts] if parts else [ex]

def atoms_of(ex_id):
    if ex_id in CONSTRUCTED:
        return [ex_id]
    if re.match(r'^\d+\.\d+\.[a-z]$', ex_id):
        return [ex_id]
    return expand(ex_id)

def master_atoms():
    out = []
    for k, parts in MASTER.items():
        out += [k + '.' + p for p in parts] if parts else [k]
    return out

def whole_of(atom):
    if atom in CONSTRUCTED:
        return atom
    m = re.match(r'^(\d+\.\d+)(\.[a-z])?$', atom)
    return m.group(1)

def status_of(atom):
    if atom in CONSTRUCTED:
        return 'verified-twice'
    if atom in STATUS_PART:
        return STATUS_PART[atom]
    return STATUS[whole_of(atom)]

def expand_slides(entries):
    got = []
    for e in entries:
        m = re.match(r'^(FND|ML0|ML3|ML6|BS|PS|DTs|Cn-s\d) #?(\d+)(?:–(\d+))?', e)
        if not m:
            continue
        deck, a, b = m.group(1), int(m.group(2)), m.group(3)
        for n in range(a, int(b) + 1 if b else a + 1):
            got.append((deck, n))
    return got

def validate():
    err = []
    # concepts: cap, ids, lesson numbers
    cid_lesson = {}
    for n, cs in CONCEPTS.items():
        if not 2 <= len(cs) <= 4:
            err.append('lesson %d has %d concepts' % (n, len(cs)))
        for cid, name, req in cs:
            if cid in cid_lesson:
                err.append('duplicate concept id ' + cid)
            cid_lesson[cid] = n
    for n, cs in CONCEPTS.items():
        order = [c[0] for c in cs]
        for cid, name, req in cs:
            for r in req:
                if r not in cid_lesson:
                    err.append('%s requires unknown %s' % (cid, r))
                elif cid_lesson[r] > n or (cid_lesson[r] == n and order.index(r) >= order.index(cid)):
                    err.append('FORWARD USE: %s (L%d) requires %s (L%d)' % (cid, n, r, cid_lesson[r]))
    lessons = {d['n']: d for d in L}
    if sorted(lessons) != list(range(1, 25)):
        err.append('lesson numbering')
    # exercises: each atom exactly once
    owner = {}
    for d in L:
        for e in d['exercises']:
            for a in atoms_of(e):
                if a in owner:
                    err.append('exercise %s owned by L%d and L%d' % (a, owner[a], d['n']))
                owner[a] = d['n']
    for a in master_atoms():
        if a not in owner:
            err.append('UNALLOCATED exercise atom ' + a)
    for a, n in CONSTRUCTED.items():
        if owner.get(a) != n:
            err.append('constructed exercise %s must be owned by L%d' % (a, n))
    for a in owner:
        if a not in set(master_atoms()) and a not in CONSTRUCTED:
            err.append('unknown atom ' + a)
        try:
            status_of(a)
        except KeyError:
            err.append('no status for ' + a)
    # forward-use for exercises
    for a, n in owner.items():
        w = whole_of(a)
        for cid in EXTRA_NEEDS.get(w, []):
            if cid_lesson[cid] > n:
                err.append('FORWARD USE: exercise %s (L%d) needs %s (L%d)' % (a, n, cid, cid_lesson[cid]))
    # status vocabulary + rule: no printed answer => verified-twice or ruled
    allowed = {'book', 'slides', 'verified-twice', 'ruled', 'impl'}
    for a in owner:
        if status_of(a) not in allowed:
            err.append('status %s for %s not allowed' % (status_of(a), a))
    # optional ids must exist
    for o in OPTIONAL:
        if o not in MASTER:
            err.append('optional unknown ' + o)
    # text items unique across lessons
    for field in ('properties', 'definitions', 'proofs', 'data_tables', 'misconceptions'):
        seen = {}
        for d in L:
            for it in d.get(field, []):
                if it in seen:
                    err.append('%s duplicated in L%d and L%d: %s' % (field, seen[it], d['n'], it[:70]))
                seen[it] = d['n']
    we = [d['worked_example'] for d in L]
    if len(set(we)) != 24:
        err.append('worked examples not unique')
    # a worked example may not be (the lead of) an exercise or another lesson's data table
    # proofs whose lead is an exercise id: each lead id at most once, except documented part splits
    lead = {}
    for d in L:
        for p in d.get('proofs', []):
            m = re.match(r'^(\d+\.\d+)', p)
            if m and d['n'] not in lead.setdefault(m.group(1), []):
                lead[m.group(1)].append(d['n'])
    split_ok = {'0.9', '0.23', '0.43', '0.55', '0.56'}
    for k, v in lead.items():
        if len(v) > 1 and k not in split_ok:
            err.append('proof lead %s in lessons %s' % (k, v))
    # slides
    sl = {}
    for d in L:
        for k in expand_slides(d.get('slides', [])):
            if k in sl and sl[k] != d['n'] and k[0] in SLIDES_REQUIRED:
                err.append('slide %s in L%d and L%d' % (k, sl[k], d['n']))
            sl[k] = d['n']
    for deck, nums in SLIDES_REQUIRED.items():
        for n in nums:
            if (deck, n) not in sl:
                err.append('slide not allocated: %s #%d' % (deck, n))
    # tests
    mock = [t for t in TESTS if t['kind'] == 'mock'][0]
    tot = round(sum(p['points'] for p in mock['problems']), 2)
    if tot != 6.0:
        err.append('mock total %s' % tot)
    for p in mock['problems']:
        pts = round(sum(float(x[1]) for x in p['parts']), 2)
        if pts != p['points']:
            err.append('mock problem %d parts sum %s != %s' % (p['n'], pts, p['points']))
        for ln in p['lessons']:
            if ln > 24:
                err.append('mock lesson ref')
    # declared reuse owners
    for r in DECLARED_REUSE:
        if r['owner'] not in lessons:
            err.append('reuse owner')
    return err, cid_lesson, owner

def build():
    err, cid_lesson, owner = validate()
    if err:
        print('VALIDATION FAILED'); [print(' -', e) for e in err]; sys.exit(1)
    lessons_json = []
    for d in L:
        n = d['n']
        cs = CONCEPTS[n]
        prereq = set()
        for cid, name, req in cs:
            for r in req:
                if cid_lesson[r] < n:
                    prereq.add(cid_lesson[r])
        exs = []
        for e in d['exercises']:
            exs.append(e)
        # per-exercise needs
        for e in d['exercises']:
            for cid in EXTRA_NEEDS.get(whole_of(e if re.match(r'^\d+\.\d+', e) else e), []):
                if cid_lesson[cid] < n:
                    prereq.add(cid_lesson[cid])
        opt = sorted({e for e in d['exercises'] if whole_of(e) in OPTIONAL}, key=lambda x: [int(t) if t.isdigit() else t for t in re.split(r'[.]', x)])
        lessons_json.append(dict(
            n=n, id=d['id'], title_ro=d['title_ro'], priority=d['priority'],
            concepts=[dict(id=c[0], name_ro=c[1], requires=c[2]) for c in cs],
            definitions=d.get('definitions', []), properties=d.get('properties', []),
            proofs=d.get('proofs', []), worked_example=d['worked_example'],
            data_tables=d.get('data_tables', []),
            exercises=d['exercises'], optional_exercises=opt,
            visuals=d.get('visuals', []), misconceptions=d.get('misconceptions', []),
            slides=d.get('slides', []), one_screen_notes=d.get('one_screen_notes', []),
            notes=d.get('notes', ''), prereq_lessons=sorted(prereq)))
    ex_index = {}
    def _key(x):
        if x in CONSTRUCTED:   # constructed ones after the book numbers, by lesson
            return (1, CONSTRUCTED[x], x)
        return (0, [int(t) if t.isdigit() else t for t in x.split('.')], '')
    for a in sorted(owner, key=_key):
        ex_index[a] = dict(lesson=owner[a], answer_status=status_of(a), optional=whole_of(a) in OPTIONAL)
    out = dict(
        what='Allocation of every concept, definition, property, proof, worked example, data table and exercise (part level) of the ML weeks 1-5 scope to exactly one lesson',
        date='2026-10-28', status='active',
        lessons=lessons_json, tests=TESTS, unallocated=[],
        out_of_scope=OUT_OF_SCOPE, declared_reuse=DECLARED_REUSE,
        order_changes=[dict(change=a, reason=b) for a, b in ORDER_CHANGES],
        exercise_index=ex_index,
        answer_status_legend=dict(book='printed solution in the 24 Sept 2026 book', slides='solved on the companion slides',
            **{'verified-twice': 'reader computation plus an independent recomputation agree (verified-answers.md or verify_extra.py)',
               'ruled': 'no printed key or the answer depends on a convention: the lesson states the ruling and labels the answer as argued / convention-dependent',
               'impl': 'implementation exercise, no answer to grade'}),
        checks=dict(exercise_atoms=len(owner), exercises_in_master=len(MASTER), constructed_exercises=len(CONSTRUCTED), lessons=len(L), concept_cap='2..4 per lesson (checked)',
                    forward_use='none (concept requires and exercise needs checked against lesson order)'))
    json.dump(out, open(os.path.join(HERE, 'allocation.json'), 'w'), ensure_ascii=False, indent=1)
    write_md(out)
    print('OK: %d lessons, %d exercise atoms, %d whole exercises' % (len(L), len(owner), len(MASTER)))

def write_md(o):
    m = []
    A = m.append
    A('**What:** Allocation of the ML lessons (weeks 1-5): final lesson list in dependency order and, for every concept, definition, property, proof, worked example, data table and exercise (part level), the one lesson that owns it · **When:** 2026-10-28 · **Status:** active')
    A('')
    A('# Allocation: who owns what')
    A('')
    A('Source of truth: `allocation.json` (generated by `build_allocation.py`, which also runs the checks below). Exercise numbers are the 2026 book numbers (`source/2026/ex-book/ex-book.24sept2026.pdf`, book page = PDF page). Concepts of the map are cited as in `reports/content-map.md`; this file changes the design order of section 7 only where `order_changes` says so.')
    A('')
    A('## 1. Checks that pass')
    A('')
    c = o['checks']
    A('- Every one of the %d exercise atoms (%d exercise numbers, split into parts where parts go to different lessons) has exactly one owner lesson; `unallocated` is empty. Items left out on purpose are in `out_of_scope` with a reason.' % (c['exercise_atoms'] - c['constructed_exercises'], c['exercises_in_master']))
    A('- Added 2026-10-29 for the teacher\'s list of the Friday test (D-069): %d constructed exercises with no book number, keyed by their outline id (%s), each owned by one lesson and computed twice; they are in `exercise_index` with status verified-twice. The coverage map is `2026-10-29-teacher-list-coverage.md`.' % (c['constructed_exercises'], ', '.join(CONSTRUCTED)))
    A('- 24 lessons, 2 to 4 headline concepts each (a headline concept bundles its definitions; properties and proofs are listed separately).')
    A('- No forward use: each concept lists what it requires and each exercise what it needs besides its own lesson\'s concepts; all of it points to the same or an earlier lesson.')
    A('- Each worked example is used by one lesson only, and no property, definition, proof or data table repeats across lessons. Three data families are shared by the book itself and are listed in `declared_reuse`.')
    A('- Every table slide group (FND, ML0, ML3, ML6, BS, DTs) is assigned to one lesson.')
    A('- Every exercise has an `answer_status`: book, slides, verified-twice, ruled (convention or argued, no key), impl (implementation task).')
    A('')
    A('## 2. The lesson list (dependency order)')
    A('')
    A('Priority A = the problem types that appear most in the past T1 papers (map section 3), B = appears in 3 to 8 of 15, C = proof-only (Seminarul Special / extra exams). Priority does not change the order; it says what to cut last if time runs out.')
    A('')
    A('| # | Id | Title | Pri | Concepts | Props | Proofs | Exercise parts (opt.) | Needs lessons |')
    A('|---|---|---|---|---|---|---|---|---|')
    for l in o['lessons']:
        ne = sum(len(__import__('builtins').list(atoms_of(e))) for e in l['exercises'])
        A('| %d | %s | %s | %s | %d | %d | %d | %d (%d) | %s |' % (l['n'], l['id'], l['title_ro'], l['priority'], len(l['concepts']), len(l['properties']), len(l['proofs']), ne, len([1 for e in l['optional_exercises'] for _ in atoms_of(e)]), ', '.join(str(x) for x in l['prereq_lessons']) or 'none'))
    A('')
    A('Tests (Teste tab, paper mode, not lessons in the player): the mock T1 and the 2021 paper, both after lesson 24 in the list but usable earlier for the lessons they cite.')
    A('')
    A('## 3. Changes to the design order (section 7)')
    A('')
    for ch in o['order_changes']:
        A('- **%s.** %s' % (ch['change'], ch['reason']))
    A('')
    A('## 4. Per lesson: what it owns')
    A('')
    for l in o['lessons']:
        A('### L%d. %s (`%s`, priority %s)' % (l['n'], l['title_ro'], l['id'], l['priority']))
        A('')
        A('**Concepts:** ' + '; '.join('%s %s' % (c['id'], c['name_ro']) for c in l['concepts']) + '.')
        A('')
        if l['definitions']:
            A('**Definitions / notation:** ' + '; '.join(l['definitions']) + '.')
            A('')
        if l['properties']:
            A('**Properties:** ' + '; '.join(l['properties']) + '.')
            A('')
        if l['proofs']:
            A('**Proofs:** ' + '; '.join(l['proofs']) + '.')
            A('')
        A('**Worked example (concrete phase, used nowhere else):** ' + l['worked_example'] + '.')
        A('')
        A('**Data tables owned:** ' + '; '.join(l['data_tables']) + '.')
        A('')
        if l['exercises']:
            A('**Exercises:** ' + ', '.join(('%s (optional)' % e) if e in l['optional_exercises'] else e for e in l['exercises']) + '.')
            A('')
        if l['slides']:
            A('**Slides:** ' + '; '.join(l['slides']) + '.')
            A('')
        A('**Visuals:** ' + '; '.join(l['visuals']) + '.')
        A('')
        A('**Misconceptions (named distractors):** ' + '; '.join(l['misconceptions']) + '.')
        A('')
        if l['one_screen_notes']:
            A('**One-screen notes (exist, not on the test):** ' + '; '.join(l['one_screen_notes']) + '.')
            A('')
        if l['notes']:
            A('**Notes:** ' + l['notes'])
            A('')
        A('**Needs lessons:** ' + (', '.join('L%d' % x for x in l['prereq_lessons']) or 'none') + '.')
        A('')
    A('## 5. Exercises that need a ruling or have no printed key')
    A('')
    A('| Exercise | Owner | Status | What the lesson must say |')
    A('|---|---|---|---|')
    why = {
     '2.4.a':'DT2 CVLOO is 1/5 under the book\'s tie rule (tied leaf goes to class 0); the other choice gives 3/5. Also: book prints P(T0|D)=0.0336, correct 108/3125=0.03456.',
     '2.27.b':'13 (NB) and 71 (Joint) are free parameters; the book states formulas only for Bernoulli attributes, so the count is a convention.',
     '2.30':'priors and smoothing are not stated: 0.8306 (count priors, no smoothing), 0.7586 (add-one), 0.8512 (equal priors); the lesson names the convention.',
     '4.42.b':'not determinable from the marginals; the lesson asks only (a) and shows why (b) cannot be decided.',
     '4.44':'the book gives no answer; the polynomial approximation H(p)~4p(1-p) is the reader\'s reading, so the result M(1-sqrt(1-H))/2 is argued.',
     '4.45':'parity data supports the claim only with a majority-class fallback on unseen branches (the verifier\'s assumption).',
     '4.51.a':'6 thresholds if a value carrying both labels counts as a boundary, 5 otherwise; the lesson fixes the first rule.',
     '4.47':'no key in the book (Fayyad-Irani); argued.', '4.53':'no key; argued from the xor example.', '4.54.c':'no key; argued (tree = exclusive, exhaustive rules).',
     '4.54.d':'no key; argued (reduced-error vs rule post-pruning).', '4.57':'no key for (a); (b),(c) argued.', '2.26':'identity: the definitions are swapped.',
     '2.42':'no key; argued (none of the statements holds for both).', '0.98':'one-line identity E[1_A]=P(A).', '0.149':'one-line algebra, no numeric content.',
     '0.151':'logic only; (b) is false with X=Y a fair bit.', '0.61':'statement read, solution not checked.', '0.62':'axiomatic characterisation, not checked numerically.'}
    for k, v in why.items():
        w = whole_of(k)
        if k in o['exercise_index']:
            ow = o['exercise_index'][k]
        else:
            ow = o['exercise_index'][[a for a in o['exercise_index'] if whole_of(a) == w][0]]
        A('| %s | L%d | %s | %s |' % (k, ow['lesson'], ow['answer_status'], v))
    A('')
    A('Verified twice with an independent recomputation (reader + `verified-answers.md`, or `verify_extra.py` for the ones added here): 0.89-0.96, 0.99-0.103, 0.140-0.142, 0.147, 0.97, 2.24, 2.25, 2.27-2.31, 2.35, 2.36, 4.32, 4.33, 4.37-4.41, 4.43, 4.46, 4.49, 4.50, 4.52, 4.54.a-b, 4.55, 4.56. Three printed defects to show corrected: 0.57 (book 0.82715, correct 0.82740), 2.4 (book 0.0336, correct 0.03456), T20C hint (H(1/5) and H(2/5) swapped). One trap: in T21S 2 Gen and Venit tie at IG 0.00598, but the root is a Varsta threshold (IG 0.1281), so no lesson may present Gen or Venit as the root. Not verified anywhere: the proofs 0.91-0.93, 0.103, 0.141.a-c, 4.47 (logic only) and the R18 data rows (from the report\'s transcription of a photo). P18 1A (Mickey) is the same problem as 2.3 with face 2 favoured (value 0.0383), so it is not adapted anywhere.')
    A('')
    A('## 6. Shared data (declared reuse)')
    A('')
    for r in o['declared_reuse']:
        A('- **%s** owned by L%d; also: %s. %s' % (r['table'], r['owner'], '; '.join(r['also_in']) or 'none', r['reason']))
    A('')
    A('## 7. Tests')
    A('')
    mk = [t for t in o['tests'] if t['kind'] == 'mock'][0]
    A('### Mock T1: %s' % mk['title_ro'])
    A('')
    A(mk['design'] + '.')
    A('')
    A('| # | Problem | Points | Why this share | Parts (id, points, item) | Adapts (past problems) | Lessons |')
    A('|---|---|---|---|---|---|---|')
    for p in mk['problems']:
        A('| %d | %s | %.1f | %s | %s | %s | %s |' % (p['n'], p['title'], p['points'], p['rank_basis'], '; '.join('%s %s: %s' % (a, b, c) for a, b, c in p['parts']), '; '.join(p['adapts']), ', '.join('L%d' % x for x in p['lessons'])))
    A('')
    A('Total %.1f points; minimum %.1f.' % (mk['total_points'], mk['minimum']))
    A('')
    A('Rule: ' + mk['rule'] + '.')
    A('')
    A('Not in the mock (6 p is too short for all types): ' + '; '.join(mk['not_in_mock']) + '.')
    A('')
    t2 = [t for t in o['tests'] if t['kind'] == 'past-paper'][0]
    A('### Second test: %s' % t2['title_ro'])
    A('')
    A('Source: %s. Total %.1f points, minimum %.1f.' % (t2['source'], t2['total_points'], t2['minimum']))
    A('')
    A('Item to lessons (what each RO item tests): ' + '; '.join('item %s: %s' % (k, ', '.join('L%d' % x for x in v)) for k, v in t2['item_to_lessons'].items()) + '.')
    A('')
    A(t2['note'])
    A('')
    A('## 8. Left out on purpose (out_of_scope)')
    A('')
    for r in o['out_of_scope']:
        A('- **%s.** %s' % (r['item'], r['reason']))
    A('')
    A('## 9. Not settled by the sources')
    A('')
    A('- Whether the Friday 2026-10-30 test covers Naive Bayes (content-map section 1.3 and section 5). The allocation covers weeks 1-5 as D-034 says; lessons 19-22 are the Bayes block, 23-24 the proof layer.')
    A('- Slides ML3 #11, #27 and #30 and the Cn-s2 joint table of lesson 5 were not read by the map; their owner lesson is assigned by the neighbouring slides and must be confirmed when the content outline is written.')
    A('- Which of the two copies of the exercise book is the newer (`ex-book.24sept2026.pdf` is cited; `ex-book_260924.pdf` was not compared).')
    out = '\n'.join(m) + '\n'
    open(os.path.join(HERE, 'allocation.md'), 'w').write(out)

if __name__ == '__main__':
    build()
