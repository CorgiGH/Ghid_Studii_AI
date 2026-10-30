# Partea 1b: Variabile aleatoare, operații, independența variabilelor

## Variabilă aleatoare și distribuția ei

**Când vezi asta:** Ți se dă o listă de valori cu probabilități și ți se cere să arăți că e o distribuție, sau să afli o constantă necunoscută $c$. Sau ți se cere $P(X\le 2)$.

**Simboluri:**

- $X$ = variabilă aleatoare: un număr care depinde de rezultatul experimentului (de exemplu, câte steme ies la 3 monede).
- $\mathrm{Val}(X)$ = lista valorilor pe care le poate lua $X$.
- $p(x)=P(X=x)$ = p.m.f. (funcția de masă, adică distribuția): probabilitatea ca $X$ să ia exact valoarea $x$. Pe scurt, tabelul „valoare → probabilitate".
- $F(x)=P(X\le x)$ = c.d.f. (funcția de repartiție): suma probabilităților tuturor valorilor mai mici sau egale cu $x$.
- $\sum_x$ = suma peste toate valorile posibile $x$.
- $c$ = o constantă necunoscută pe care o afli din condiția că suma face 1.

**Exemplu:**

Aruncăm 3 monede corecte (H = stemă, T = pajură). $R$ = numărul de steme. Cele $2^3=8$ rezultate au fiecare probabilitatea $\frac18$.

1. $R(\text{HTH})=2$, pentru că HTH are 2 steme.
2. $R=1$ în 3 rezultate (HTT, THT, TTH), deci $P(R=1)=3\cdot\frac18=\frac{3}{8}$.
3. La fel: $R=0$ doar la TTT, $R=2$ la HHT, HTH, THH, $R=3$ doar la HHH. Distribuția lui $R$: valorile 0, 1, 2, 3 au probabilitățile $\frac18,\frac38,\frac38,\frac18$.
4. $F(2)=P(R\le2)=\frac18+\frac38+\frac38=\frac78$.

Acum două verificări de p.m.f. Fie $X$ cu valorile 1, 2, 3.

1. Cazul $p(1)=0{,}5$; $p(2)=0{,}3$; $p(3)=0{,}3$. Toate sunt $\ge 0$. Suma: $0{,}5+0{,}3+0{,}3=1{,}1$. Suma nu e 1, deci **nu** e p.m.f.
2. Cazul $p(x)=c\cdot x$. Suma: $c\cdot1+c\cdot2+c\cdot3=6c$. Punem $6c=1$, deci $c=\frac16$.
3. Valorile $\frac16,\frac26,\frac36$ sunt toate $\ge 0$, deci $c=\frac16$ e bun. Atunci $P(X=3)=\frac36=\frac12$.

**Regula:** Un tabel de valori și probabilități e o p.m.f. dacă fiecare probabilitate e $\ge 0$ și toate se adună la 1. Pentru o constantă necunoscută, scrii suma egală cu 1, rezolvi, apoi verifici că nicio valoare nu iese negativă.

$$p(x)\ge 0\ \text{pentru fiecare } x$$

$$\sum_x p(x)=1$$

$$F(x)=P(X\le x)$$

**Capcana:** Verifici doar suma. Valorile $0{,}6$; $-0{,}1$; $0{,}5$ se adună tot la 1, dar $-0{,}1$ nu e probabilitate, deci nu e p.m.f. Verifică ambele condiții.

**Încearcă tu:**

Problema 1. $X$ ia valorile 0, 1, 2 cu $p(0)=0{,}2$; $p(1)=0{,}5$; $p(2)=0{,}3$. Este o p.m.f.? Cât este $F(1)$?

<details><summary>Răspuns</summary>

1. Toate probabilitățile sunt $\ge 0$.
2. Suma: $0{,}2+0{,}5+0{,}3=1$.
3. Ambele condiții sunt îndeplinite, deci **este** p.m.f.
4. $F(1)=P(X\le1)=p(0)+p(1)=0{,}2+0{,}5=0{,}7$.

</details>

Problema 2. $X$ ia valorile 1, 2, 3 cu $p(x)=c\cdot x^2$. Află $c$, apoi $P(X=3)$ și $F(2)$.

<details><summary>Răspuns</summary>

1. Suma: $c\cdot1^2+c\cdot2^2+c\cdot3^2=c+4c+9c=14c$.
2. $14c=1$, deci $c=\frac{1}{14}$. Valorile $\frac1{14},\frac4{14},\frac9{14}$ sunt toate $\ge0$.
3. $P(X=3)=\frac{1}{14}\cdot9=\frac{9}{14}$.
4. $F(2)=p(1)+p(2)=\frac{1}{14}+\frac4{14}=\frac{5}{14}$.

</details>

Problema 3. $X$ ia valorile 0, 1, 2, 3 cu $p(x)=c\cdot(2-x)$. Există un $c$ pentru care asta e p.m.f.?

<details><summary>Răspuns</summary>

1. Suma: $c\cdot2+c\cdot1+c\cdot0+c\cdot(-1)=2c$.
2. $2c=1$, deci $c=\frac12$. E singurul $c$ care dă suma 1.
3. Verificăm semnul: $p(3)=\frac12\cdot(2-3)=-\frac12$, negativ.
4. O probabilitate nu poate fi negativă, deci **nu** există $c$: nu e p.m.f.

</details>

## Media și varianța

**Când vezi asta:** Ți se cere „media", „valoarea medie", „varianța" sau „abaterea standard" unei variabile, sau media și varianța lui $aX+b$. Sau ți se cere să demonstrezi că $\mathrm{Var}(X+a)=\mathrm{Var}(X)$.

**Simboluri:**

- $E[X]$ = media: fiecare valoare înmulțită cu probabilitatea ei, apoi adunate.
- $\mu$ („miu") = altă notație pentru media $E[X]$.
- $E[X^2]$ = media pătratelor: întâi ridici **valorile** la pătrat, probabilitățile rămân la fel.
- $\mathrm{Var}(X)=E[(X-\mu)^2]$ = varianța: media pătratului distanței de la medie. Arată cât de împrăștiate sunt valorile.
- $\sigma=\sqrt{\mathrm{Var}(X)}$ = abaterea standard.
- $a,b$ = constante (numere fixe).

**Exemplu:**

$X$ ia valorile $-1,0,1,2$ cu probabilitățile $\frac16,\frac16,\frac16,\frac12$.

1. $E[X]=(-1)\cdot\frac16+0\cdot\frac16+1\cdot\frac16+2\cdot\frac12=-\frac16+0+\frac16+1=1$.
2. $E[X^2]=(-1)^2\cdot\frac16+0^2\cdot\frac16+1^2\cdot\frac16+2^2\cdot\frac12=\frac16+0+\frac16+2=\frac73$.
3. $\mathrm{Var}(X)=E[X^2]-(E[X])^2=\frac73-1^2=\frac73-\frac33=\frac43$.
4. Verificare din definiție: abaterile $X-1$ sunt $-2,-1,0,1$, pătratele lor $4,1,0,1$. $4\cdot\frac16+1\cdot\frac16+0\cdot\frac16+1\cdot\frac12=\frac46+\frac16+\frac36=\frac86=\frac43$. Iese la fel.
5. Fie $Y=3X+2$. $E[Y]=3\cdot1+2=5$.
6. $\mathrm{Var}(Y)=3^2\cdot\frac43=9\cdot\frac43=12$. Constanta $+2$ nu schimbă varianța.

Acum demonstrația cerută la test: $\mathrm{Var}(X+a)=\mathrm{Var}(X)$, cu $a$ o constantă și $\mu=E[X]$.

1. Media: $E[X+a]=E[X]+a=\mu+a$ (media unei sume e suma mediilor).
2. Abaterea de la medie: $(X+a)-(\mu+a)=X-\mu$. Constanta $a$ se reduce.
3. Din definiție: $\mathrm{Var}(X+a)=E[((X+a)-(\mu+a))^2]=E[(X-\mu)^2]=\mathrm{Var}(X)$.
4. La fel pentru $aX$: abaterea e $aX-a\mu=a(X-\mu)$, pătratul ei e $a^2(X-\mu)^2$, deci $\mathrm{Var}(aX)=a^2\,\mathrm{Var}(X)$.

**Regula:** Media respectă $aX+b$ întocmai. Varianța ignoră $b$ și îl pune pe $a$ la pătrat.

$$E[aX+b]=aE[X]+b$$

$$\mathrm{Var}(X)=E[(X-\mu)^2]$$

$$\mathrm{Var}(X)=E[X^2]-(E[X])^2$$

$$\mathrm{Var}(aX+b)=a^2\,\mathrm{Var}(X)$$

**Capcana:** Scrii $E[X^2]=(E[X])^2$. Nu e adevărat: aici $E[X^2]=\frac73$, iar $(E[X])^2=1$. Diferența e chiar varianța.

**Încearcă tu:**

Problema 1. $X$ ia valorile 1 și 3 cu probabilitățile $\frac14$ și $\frac34$. Află $E[X]$, $\mathrm{Var}(X)$, apoi $E[2X-5]$ și $\mathrm{Var}(2X-5)$.

<details><summary>Răspuns</summary>

1. $E[X]=1\cdot\frac14+3\cdot\frac34=\frac14+\frac94=\frac{10}{4}=2{,}5$.
2. $E[X^2]=1\cdot\frac14+9\cdot\frac34=\frac14+\frac{27}4=\frac{28}{4}=7$.
3. $\mathrm{Var}(X)=7-2{,}5^2=7-6{,}25=0{,}75$.
4. $E[2X-5]=2\cdot2{,}5-5=0$.
5. $\mathrm{Var}(2X-5)=2^2\cdot0{,}75=4\cdot0{,}75=3$. Constanta $-5$ dispare.

</details>

Problema 2. $R$ = numărul de steme la 3 monede corecte (distribuția: $\frac18,\frac38,\frac38,\frac18$ pe 0, 1, 2, 3). Află $E[R]$ și $\mathrm{Var}(R)$, apoi $E[-4R+1]$ și $\mathrm{Var}(-4R+1)$.

<details><summary>Răspuns</summary>

1. $E[R]=0\cdot\frac18+1\cdot\frac38+2\cdot\frac38+3\cdot\frac18=\frac{0+3+6+3}{8}=\frac{12}8=\frac32$. Media nu e o valoare pe care $R$ o poate lua, și e normal.
2. $E[R^2]=0\cdot\frac18+1\cdot\frac38+4\cdot\frac38+9\cdot\frac18=\frac{0+3+12+9}{8}=\frac{24}8=3$.
3. $\mathrm{Var}(R)=3-\left(\frac32\right)^2=3-2{,}25=0{,}75$.
4. $E[-4R+1]=-4\cdot1{,}5+1=-6+1=-5$.
5. $\mathrm{Var}(-4R+1)=(-4)^2\cdot0{,}75=16\cdot0{,}75=12$. Semnul minus dispare, pentru că $a$ e la pătrat.

</details>

Problema 3. Demonstrează că $\mathrm{Var}(X)=E[X^2]-(E[X])^2$, pornind de la definiția $\mathrm{Var}(X)=E[(X-\mu)^2]$, cu $\mu=E[X]$.

<details><summary>Răspuns</summary>

1. Desfaci pătratul: $(X-\mu)^2=X^2-2\mu X+\mu^2$.
2. Iei media termen cu termen ($\mu$ e un număr fix, deci iese în față): $E[(X-\mu)^2]=E[X^2]-2\mu\,E[X]+\mu^2$.
3. Pui $E[X]=\mu$: $E[X^2]-2\mu^2+\mu^2=E[X^2]-\mu^2$.
4. Deci $\mathrm{Var}(X)=E[X^2]-(E[X])^2$.

</details>

## Bernoulli și binomiala

**Când vezi asta:** Repetăm de $n$ ori același experiment independent (moneda, un test, o piesă bună sau defectă) și numărăm succesele. Sau apare „probabilitatea de succes $p$".

**Simboluri:**

- Bernoulli($p$) = o singură încercare: $X=1$ (succes) cu probabilitatea $p$, $X=0$ (eșec) cu $1-p$.
- $n$ = numărul de încercări independente.
- $p$ = probabilitatea de succes la o încercare.
- $r$ = numărul de succese pe care îl numărăm.
- $C_n^r=\frac{n!}{r!\,(n-r)!}$ = în câte moduri alegi care $r$ din cele $n$ încercări sunt succese (combinări).
- Variabila indicator a unui eveniment $A$: $1$ dacă $A$ are loc, $0$ dacă nu. E o Bernoulli cu $p=P(A)$.

**Exemplu:**

O monedă cu $P(\text{stemă})=0{,}3$ se aruncă de $n=4$ ori. $X$ = numărul de steme. Cât e $P(X=2)$?

1. $C_4^2=\frac{4!}{2!\,2!}=\frac{4\cdot3}{2\cdot1}=6$ (moduri de a alege care 2 aruncări dau stemă).
2. $0{,}3^2=0{,}09$ pentru cele 2 steme, $0{,}7^2=0{,}49$ pentru cele 2 pajuri.
3. $P(X=2)=6\cdot0{,}09\cdot0{,}49=6\cdot0{,}0441=0{,}2646$.
4. $E[X]=np=4\cdot0{,}3=1{,}2$.
5. $\mathrm{Var}(X)=np(1-p)=4\cdot0{,}3\cdot0{,}7=0{,}84$.
6. O singură încercare ($n=1$) dă Bernoulli: $E=p=0{,}3$ și $\mathrm{Var}=p(1-p)=0{,}3\cdot0{,}7=0{,}21$.

**Regula:** Numărul de succese în $n$ încercări independente cu aceeași probabilitate $p$ e binomial.

$$P(X=r)=C_n^r\,p^r(1-p)^{n-r}$$

$$E[X]=np$$

$$\mathrm{Var}(X)=np(1-p)$$

**Capcana:** Folosești $p(1-p)$ ca varianță pentru tot $X$. Asta e varianța unei singure încercări; pentru $n$ încercări se înmulțește cu $n$.

**Încearcă tu:**

Problema 1. $X$ = numărul de steme la $n=20$ aruncări, cu $P(\text{stemă})=0{,}25$. Află $E[X]$ și $\mathrm{Var}(X)$.

<details><summary>Răspuns</summary>

1. $E[X]=np=20\cdot0{,}25=5$.
2. $\mathrm{Var}(X)=np(1-p)=20\cdot0{,}25\cdot0{,}75=5\cdot0{,}75=3{,}75$.

</details>

Problema 2. Un test are $n=5$ întrebări, fiecare nimerită independent cu probabilitatea $p=0{,}6$. $X$ = câte nimerești. Află $P(X\ge4)$, $E[X]$ și $\mathrm{Var}(X)$.

<details><summary>Răspuns</summary>

1. $X\ge4$ înseamnă $X=4$ sau $X=5$; le calculezi separat și le aduni.
2. $C_5^4=\frac{5!}{4!\,1!}=5$ și $0{,}6^4=0{,}6\cdot0{,}6\cdot0{,}6\cdot0{,}6=0{,}1296$. $P(X=4)=5\cdot0{,}1296\cdot0{,}4=0{,}2592$.
3. $C_5^5=1$, deci $P(X=5)=1\cdot0{,}6^5\cdot0{,}4^0=0{,}07776$.
4. $P(X\ge4)=0{,}2592+0{,}07776=0{,}33696$.
5. $E[X]=5\cdot0{,}6=3$.
6. $\mathrm{Var}(X)=5\cdot0{,}6\cdot0{,}4=1{,}2$.

</details>

## Tabelul comun: marginale și condiționate

**Când vezi asta:** Ți se dă un tabel cu două variabile, $X$ și $Y$, și celule cu probabilități. Ți se cere $P(X=0)$ („marginala") sau $P(X=0\mid Y=1)$ („condiționata").

**Simboluri:**

- $p(x,y)=P(X=x,Y=y)$ = probabilitatea comună: o celulă a tabelului.
- $p_X(x)$ = marginala lui $X$: suma celulelor din rândul lui $x$.
- $p_Y(y)$ = marginala lui $Y$: suma celulelor din coloana lui $y$.
- $P(X=x\mid Y=y)$ = probabilitatea lui $x$ **dacă știm** că $Y=y$. Ne uităm doar la coloana $y$.
- Numele „marginală": sumele se scriu în marginea tabelului.

**Exemplu:**

| | $Y=0$ | $Y=1$ |
|---|---|---|
| $X=0$ | 0,1 | 0,3 |
| $X=1$ | 0,2 | 0,4 |

1. Rândul $X=0$: $P(X=0)=0{,}1+0{,}3=0{,}4$.
2. Rândul $X=1$: $P(X=1)=0{,}2+0{,}4=0{,}6$.
3. Coloana $Y=0$: $P(Y=0)=0{,}1+0{,}2=0{,}3$.
4. Coloana $Y=1$: $P(Y=1)=0{,}3+0{,}4=0{,}7$.
5. Verificare: $0{,}4+0{,}6=1$ și $0{,}3+0{,}7=1$.
6. $P(X=0\mid Y=1)$: ne uităm doar la coloana $Y=1$. Celula $(0,1)$ e $0{,}3$, suma coloanei e $0{,}7$. Deci $\frac{0{,}3}{0{,}7}=\frac37$.

**Regula:** Marginala se obține adunând celulele pe rând sau pe coloană. Condiționata e celula împărțită la marginala condiției.

$$p_X(x)=\sum_y p(x,y)$$

$$P(X=x\mid Y=y)=\frac{p(x,y)}{p_Y(y)}$$

**Capcana:** Împarți la marginala greșită. În $P(X=0\mid Y=1)$ condiția e $Y=1$, deci împarți la $P(Y=1)$. Dacă împarți la $P(X=0)$, ai calculat $P(Y=1\mid X=0)$.

**Încearcă tu:**

Problema 1. Tabelul comun:

| | $Y=0$ | $Y=1$ |
|---|---|---|
| $X=0$ | 0,2 | 0,2 |
| $X=1$ | 0,1 | 0,5 |

Află $P(X=1)$ și $P(Y=1\mid X=1)$.

<details><summary>Răspuns</summary>

1. $P(X=1)=0{,}1+0{,}5=0{,}6$ (rândul $X=1$).
2. Condiția e $X=1$, deci împărțim la $0{,}6$.
3. $P(Y=1\mid X=1)=\frac{0{,}5}{0{,}6}=\frac56$.

</details>

Problema 2. Tabelul comun ($X$ ia 0, 1, 2 și $Y$ ia 0, 1):

| | $Y=0$ | $Y=1$ |
|---|---|---|
| $X=0$ | $\frac14$ | $\frac14$ |
| $X=1$ | $\frac14$ | 0 |
| $X=2$ | 0 | $\frac14$ |

Află $P(Y=1)$ și distribuția lui $X$ dată fiind $Y=1$.

<details><summary>Răspuns</summary>

1. Coloana $Y=1$: $P(Y=1)=\frac14+0+\frac14=\frac12$.
2. $P(X=0\mid Y=1)=\frac{1/4}{1/2}=\frac12$.
3. $P(X=1\mid Y=1)=\frac{0}{1/2}=0$.
4. $P(X=2\mid Y=1)=\frac{1/4}{1/2}=\frac12$.
5. Verificare: $\frac12+0+\frac12=1$. O condiționată poate fi 0.

</details>

## Operații: distribuția lui X+Y, X·Y și g(X,Y)

**Când vezi asta:** Ți se dă tabelul comun și ți se cere distribuția lui $X+Y$, $X-Y$ sau a produsului $X\cdot Y$. Sau a unei funcții de o singură variabilă, ca $X^2$ sau $2X$.

**Simboluri:**

- $Z=g(X,Y)$ = o variabilă nouă, calculată din $X$ și $Y$ (de exemplu $Z=X+Y$ sau $Z=XY$).
- „Valoarea lui $Z$ într-o celulă" = ce iese când pui în $g$ valorile $x$ și $y$ ale celulei.

**Exemplu:**

Tabelul de la cardul precedent:

| | $Y=0$ | $Y=1$ |
|---|---|---|
| $X=0$ | 0,1 | 0,3 |
| $X=1$ | 0,2 | 0,4 |

1. Scrie valoarea lui $X+Y$ în fiecare celulă: $(0,0)\to0$, $(0,1)\to1$, $(1,0)\to1$, $(1,1)\to2$.
2. Adună celulele cu aceeași valoare. $X+Y=0$ vine dintr-o celulă: $0{,}1$.
3. $X+Y=1$ vine din două celule: $0{,}3+0{,}2=0{,}5$.
4. $X+Y=2$ vine dintr-o celulă: $0{,}4$.
5. Verificare: $0{,}1+0{,}5+0{,}4=1$.
6. Produsul $XY$: valorile în celule sunt $0,0,0,1$. Deci $XY=1$ cu probabilitatea $0{,}4$ și $XY=0$ cu $0{,}1+0{,}3+0{,}2=0{,}6$.
7. $D=X-Y$: valorile în celule sunt $0,-1,1,0$. Deci $D=-1$ cu $0{,}3$, $D=0$ cu $0{,}1+0{,}4=0{,}5$, $D=1$ cu $0{,}2$.

Pentru o singură variabilă e la fel. $X$ ia $-1,0,1,2$ cu $\frac16,\frac16,\frac16,\frac12$.

1. Valorile lui $X^2$: $1,0,1,4$. Valoarea 1 vine de două ori: $P(X^2=1)=\frac16+\frac16=\frac13$. Apoi $P(X^2=0)=\frac16$ și $P(X^2=4)=\frac12$.
2. Verificare: $\frac13+\frac16+\frac12=\frac26+\frac16+\frac36=1$.
3. Valorile lui $2X$: $-2,0,2,4$, toate diferite, deci probabilitățile rămân $\frac16,\frac16,\frac16,\frac12$.

**Regula:** Calculezi $g$ în fiecare celulă, apoi aduni probabilitățile celulelor care dau aceeași valoare. Marginalele singure nu ajung.

$$P(Z=z)=\sum_{(x,y):\ g(x,y)=z} p(x,y)$$

**Capcana:** Uiți să aduni celulele care dau aceeași valoare. Dacă lași $X+Y=1$ cu $0{,}3$ și cu $0{,}2$ separat, distribuția are valori repetate și e greșită.

**Încearcă tu:**

Problema 1. Tabelul comun:

| | $Y=0$ | $Y=1$ |
|---|---|---|
| $X=0$ | 0,2 | 0,2 |
| $X=1$ | 0,1 | 0,5 |

Află distribuția lui $D=X-Y$.

<details><summary>Răspuns</summary>

1. Valorile în celule: $(0,0)\to0$, $(0,1)\to-1$, $(1,0)\to1$, $(1,1)\to0$.
2. $D=-1$ cu $0{,}2$.
3. $D=0$ cu $0{,}2+0{,}5=0{,}7$.
4. $D=1$ cu $0{,}1$.
5. Verificare: $0{,}2+0{,}7+0{,}1=1$.

</details>

Problema 2. Tabelul comun:

| | $Y=0$ | $Y=1$ |
|---|---|---|
| $X=0$ | $\frac14$ | $\frac14$ |
| $X=1$ | $\frac14$ | 0 |
| $X=2$ | 0 | $\frac14$ |

Află distribuția lui $X+Y$ și a lui $XY$.

<details><summary>Răspuns</summary>

1. Valorile lui $X+Y$: $(0,0)\to0$, $(0,1)\to1$, $(1,0)\to1$, $(1,1)\to2$, $(2,0)\to2$, $(2,1)\to3$.
2. $X+Y=0$: $\frac14$. $X+Y=1$: $\frac14+\frac14=\frac12$.
3. $X+Y=2$: $0+0=0$ (ambele celule au probabilitate 0). $X+Y=3$: $\frac14$.
4. Verificare: $\frac14+\frac12+0+\frac14=1$.
5. Valorile lui $XY$: $(0,0)\to0$, $(0,1)\to0$, $(1,0)\to0$, $(1,1)\to1$, $(2,0)\to0$, $(2,1)\to2$.
6. $XY=0$ cu $\frac14+\frac14+\frac14+0=\frac34$; $XY=1$ cu $0$; $XY=2$ cu $\frac14$.

</details>

## E[XY], covarianța și independența

**Când vezi asta:** Ți se cere $E[XY]$, covarianța, $\mathrm{Var}(X+Y)$ sau $\mathrm{Var}(XY)$. Sau „ce se schimbă dacă $X$ și $Y$ sunt independente", ori să demonstrezi că atunci $E[XY]=E[X]E[Y]$.

**Simboluri:**

- $E[XY]$ = media produsului: aduni $x\cdot y\cdot p(x,y)$ peste celule. Celulele cu $x=0$ sau $y=0$ dau 0.
- $\mathrm{Cov}(X,Y)$ = covarianța: arată dacă $X$ și $Y$ cresc împreună (pozitivă) sau în sens opus (negativă).
- „Independente" = tabelul comun e produsul marginalelor (cardul următor arată cum se verifică).
- $f(X)$, $g(Y)$ = orice funcție doar de $X$, respectiv doar de $Y$ (de exemplu $Y^2$).

**Exemplu:**

Același tabel:

| | $Y=0$ | $Y=1$ |
|---|---|---|
| $X=0$ | 0,1 | 0,3 |
| $X=1$ | 0,2 | 0,4 |

1. Pentru valorile 0 și 1, $E[X]=0\cdot P(X=0)+1\cdot P(X=1)=P(X=1)=0{,}2+0{,}4=0{,}6$. La fel $E[Y]=P(Y=1)=0{,}3+0{,}4=0{,}7$.
2. $E[XY]$: doar celula $(1,1)$ are produsul nenul. $E[XY]=1\cdot1\cdot0{,}4=0{,}4$.
3. $\mathrm{Cov}(X,Y)=E[XY]-E[X]E[Y]=0{,}4-0{,}6\cdot0{,}7=0{,}4-0{,}42=-0{,}02$.
4. Pentru valori 0 și 1, $X^2=X$, deci $E[X^2]=0{,}6$. $\mathrm{Var}(X)=0{,}6-0{,}6^2=0{,}6-0{,}36=0{,}24$. La fel $\mathrm{Var}(Y)=0{,}7-0{,}49=0{,}21$.
5. $\mathrm{Var}(X+Y)=0{,}24+0{,}21+2\cdot(-0{,}02)=0{,}45-0{,}04=0{,}41$.
6. Verificare directă: $X+Y$ are distribuția $0{,}1;\,0{,}5;\,0{,}4$ pe $0,1,2$ (cardul precedent). $E[X+Y]=0{,}5+2\cdot0{,}4=1{,}3$ și $E[(X+Y)^2]=0{,}5+4\cdot0{,}4=2{,}1$.
7. $\mathrm{Var}(X+Y)=2{,}1-1{,}3^2=2{,}1-1{,}69=0{,}41$. Iese la fel.
8. Media sumei nu cere independență: $E[3X-Y+1]=3\cdot0{,}6-0{,}7+1=1{,}8-0{,}7+1=2{,}1$.

Acum demonstrația cerută la test: dacă $X$ și $Y$ sunt independente, atunci $E[XY]=E[X]E[Y]$.

1. Din definiție: $E[XY]=\sum_x\sum_y x\,y\,p(x,y)$.
2. Independente înseamnă $p(x,y)=p_X(x)\,p_Y(y)$, deci $E[XY]=\sum_x\sum_y x\,p_X(x)\cdot y\,p_Y(y)$.
3. Partea cu $x$ nu depinde de $y$, deci iese din suma după $y$: $E[XY]=\sum_x x\,p_X(x)\cdot\sum_y y\,p_Y(y)=E[X]\,E[Y]$.
4. Același calcul cu $f(x)$ și $g(y)$ în loc de $x$ și $y$ dă $E[f(X)\,g(Y)]=E[f(X)]\,E[g(Y)]$. De exemplu, $E[XY^2]=E[X]\,E[Y^2]$.

**Regula:** Media unei sume e suma mediilor, mereu. Dacă $X$ și $Y$ sunt independente, media produsului e produsul mediilor, covarianța e 0 și varianțele se adună simplu.

$$\begin{aligned}\mathrm{Cov}(X,Y)={}&E[XY]\\&-E[X]\,E[Y]\end{aligned}$$

$$\begin{aligned}\mathrm{Var}(X+Y)={}&\mathrm{Var}(X)\\&+\mathrm{Var}(Y)\\&+2\,\mathrm{Cov}(X,Y)\end{aligned}$$

Dacă $X$ și $Y$ sunt independente:

$$E[XY]=E[X]\,E[Y]$$

$$\mathrm{Cov}(X,Y)=0$$

$$\begin{aligned}\mathrm{Var}(X+Y)={}&\mathrm{Var}(X)\\&+\mathrm{Var}(Y)\end{aligned}$$

$$\begin{aligned}E[f(X)\,g(Y)]={}&E[f(X)]\\&\cdot E[g(Y)]\end{aligned}$$

Varianța produsului nu se desface în $\mathrm{Var}(X)\,\mathrm{Var}(Y)$, nici la independente. Pentru $X$, $Y$ independente:

$$\begin{aligned}\mathrm{Var}(XY)={}&E[X^2]\,E[Y^2]\\&-(E[X]\,E[Y])^2\end{aligned}$$

**Capcana:** La independente scrii $E[XY^2]=E[X]\,(E[Y])^2$. Corect e $E[X]\,E[Y^2]$: pătratul se aplică lui $Y$ **înainte** de medie. Tot așa, $\mathrm{Var}(XY)$ nu e $\mathrm{Var}(X)\,\mathrm{Var}(Y)$; Problema 3 le arată pe amândouă cu numere.

**Încearcă tu:**

Problema 1. Tabelul comun:

| | $Y=0$ | $Y=1$ |
|---|---|---|
| $X=0$ | 0,2 | 0,2 |
| $X=1$ | 0,1 | 0,5 |

Află $E[XY]$, $\mathrm{Cov}(X,Y)$ și $\mathrm{Var}(X+Y)$.

<details><summary>Răspuns</summary>

1. $E[X]=P(X=1)=0{,}1+0{,}5=0{,}6$ și $E[Y]=P(Y=1)=0{,}2+0{,}5=0{,}7$.
2. $E[XY]=1\cdot1\cdot p(1,1)=0{,}5$.
3. $\mathrm{Cov}=0{,}5-0{,}6\cdot0{,}7=0{,}5-0{,}42=0{,}08$ (pozitivă, deci $X$ și $Y$ cresc împreună).
4. $\mathrm{Var}(X)=0{,}6-0{,}36=0{,}24$ și $\mathrm{Var}(Y)=0{,}7-0{,}49=0{,}21$.
5. $\mathrm{Var}(X+Y)=0{,}24+0{,}21+2\cdot0{,}08=0{,}45+0{,}16=0{,}61$.

</details>

Problema 2. $X$ și $Y$ sunt **independente**, cu:

- $X$ ia 1 și 2 cu probabilitățile $0{,}5$ și $0{,}5$;
- $Y$ ia 0 și 1 cu probabilitățile $0{,}6$ și $0{,}4$.

Află tabelul comun, distribuția lui $XY$, $E[XY]$, $\mathrm{Cov}$ și $\mathrm{Var}(X+Y)$.

<details><summary>Răspuns</summary>

1. Fiecare celulă e produsul marginalelor: $p(1,0)=0{,}5\cdot0{,}6=0{,}3$; $p(1,1)=0{,}5\cdot0{,}4=0{,}2$; $p(2,0)=0{,}5\cdot0{,}6=0{,}3$; $p(2,1)=0{,}5\cdot0{,}4=0{,}2$.
2. Valorile lui $XY$: $(1,0)\to0$, $(1,1)\to1$, $(2,0)\to0$, $(2,1)\to2$. Deci $XY=0$ cu $0{,}3+0{,}3=0{,}6$, $XY=1$ cu $0{,}2$, $XY=2$ cu $0{,}2$.
3. $E[XY]=0\cdot0{,}6+1\cdot0{,}2+2\cdot0{,}2=0{,}2+0{,}4=0{,}6$.
4. $E[X]=1\cdot0{,}5+2\cdot0{,}5=1{,}5$ și $E[Y]=0{,}4$, iar $1{,}5\cdot0{,}4=0{,}6$. Se potrivește, așa cum spune regula.
5. $\mathrm{Cov}=0{,}6-0{,}6=0$.
6. $E[X^2]=1\cdot0{,}5+4\cdot0{,}5=2{,}5$, deci $\mathrm{Var}(X)=2{,}5-1{,}5^2=2{,}5-2{,}25=0{,}25$. $\mathrm{Var}(Y)=0{,}4-0{,}4^2=0{,}4-0{,}16=0{,}24$.
7. Covarianța e 0, deci $\mathrm{Var}(X+Y)=0{,}25+0{,}24=0{,}49$.

</details>

Problema 3. $X$ și $Y$ sunt **independente**, cu:

- $X$ ia 1 și 2 cu probabilitățile $0{,}4$ și $0{,}6$;
- $Y$ ia 0, 1 și 2 cu probabilitățile $0{,}5$, $0{,}3$ și $0{,}2$.

Fie $Z=XY$ (produsul). Află distribuția lui $Z$, $E[Z]$, $\mathrm{Var}(Z)$ și $E[XY^2]$.

<details><summary>Răspuns</summary>

1. Tabelul comun (produsul marginalelor): $p(1,0)=0{,}4\cdot0{,}5=0{,}2$; $p(1,1)=0{,}4\cdot0{,}3=0{,}12$; $p(1,2)=0{,}4\cdot0{,}2=0{,}08$; $p(2,0)=0{,}6\cdot0{,}5=0{,}3$; $p(2,1)=0{,}6\cdot0{,}3=0{,}18$; $p(2,2)=0{,}6\cdot0{,}2=0{,}12$.
2. Valorile lui $Z=XY$ în aceste celule, în aceeași ordine: $0,1,2,0,2,4$.
3. Aduni celulele cu aceeași valoare: $Z=0$ cu $0{,}2+0{,}3=0{,}5$; $Z=1$ cu $0{,}12$; $Z=2$ cu $0{,}08+0{,}18=0{,}26$; $Z=4$ cu $0{,}12$. Verificare: $0{,}5+0{,}12+0{,}26+0{,}12=1$.
4. $E[Z]=0\cdot0{,}5+1\cdot0{,}12+2\cdot0{,}26+4\cdot0{,}12=0{,}12+0{,}52+0{,}48=1{,}12$.
5. Verificare cu regula: $E[X]=1\cdot0{,}4+2\cdot0{,}6=1{,}6$ și $E[Y]=1\cdot0{,}3+2\cdot0{,}2=0{,}7$, iar $1{,}6\cdot0{,}7=1{,}12$.
6. $E[Z^2]=1\cdot0{,}12+4\cdot0{,}26+16\cdot0{,}12=0{,}12+1{,}04+1{,}92=3{,}08$.
7. $\mathrm{Var}(Z)=E[Z^2]-(E[Z])^2=3{,}08-1{,}12^2=3{,}08-1{,}2544=1{,}8256$.
8. Capcana: $\mathrm{Var}(X)=E[X^2]-1{,}6^2=2{,}8-2{,}56=0{,}24$ și $\mathrm{Var}(Y)=E[Y^2]-0{,}7^2=1{,}1-0{,}49=0{,}61$. Produsul lor e $0{,}24\cdot0{,}61=0{,}1464$, nu $1{,}8256$.
9. $E[Y^2]=1\cdot0{,}3+4\cdot0{,}2=1{,}1$, deci $E[XY^2]=E[X]\,E[Y^2]=1{,}6\cdot1{,}1=1{,}76$. Varianta greșită $1{,}6\cdot0{,}7^2=0{,}784$ dă alt număr.

</details>

## Cum demonstrezi că două variabile sunt independente

**Când vezi asta:** „Arătați că $X$ și $Y$ sunt (sau nu sunt) independente", cu un tabel comun.

**Simboluri:**

- $p(x,y)$ = celula din tabel.
- $p_X(x)\cdot p_Y(y)$ = produsul marginalelor pentru acea celulă.
- „Independente" = **fiecare** celulă e egală cu produsul marginalelor ei.

**Exemplu:**

Pe hârtie, în trei pași: marginalele, o egalitate pentru fiecare celulă, concluzia.

| | $Y=0$ | $Y=1$ | $Y=2$ |
|---|---|---|---|
| $X=1$ | 0,2 | 0,12 | 0,08 |
| $X=2$ | 0,3 | 0,18 | 0,12 |

1. Marginalele lui $X$: $P(X=1)=0{,}2+0{,}12+0{,}08=0{,}4$ și $P(X=2)=0{,}3+0{,}18+0{,}12=0{,}6$.
2. Marginalele lui $Y$: $P(Y=0)=0{,}2+0{,}3=0{,}5$; $P(Y=1)=0{,}12+0{,}18=0{,}3$; $P(Y=2)=0{,}08+0{,}12=0{,}2$.
3. $(1,0)$: $0{,}4\cdot0{,}5=0{,}2=p(1,0)$.
4. $(1,1)$: $0{,}4\cdot0{,}3=0{,}12=p(1,1)$.
5. $(1,2)$: $0{,}4\cdot0{,}2=0{,}08=p(1,2)$.
6. $(2,0)$: $0{,}6\cdot0{,}5=0{,}3=p(2,0)$.
7. $(2,1)$: $0{,}6\cdot0{,}3=0{,}18=p(2,1)$.
8. $(2,2)$: $0{,}6\cdot0{,}2=0{,}12=p(2,2)$.
9. Toate cele 6 egalități sunt adevărate, deci $X$ și $Y$ sunt independente.

Cazul „nu sunt": tabelul de la cardul tabelului comun, cu $p(0,0)=0{,}1$; $p(0,1)=0{,}3$; $p(1,0)=0{,}2$; $p(1,1)=0{,}4$.

1. Marginalele: $P(X=0)=0{,}1+0{,}3=0{,}4$ și $P(Y=0)=0{,}1+0{,}2=0{,}3$.
2. Celula $(0,0)$: $P(X=0)\cdot P(Y=0)=0{,}4\cdot0{,}3=0{,}12$, dar $p(0,0)=0{,}1$.
3. Egalitatea pică, deci $X$ și $Y$ **nu** sunt independente. Te oprești aici.

**Regula:** Pentru „sunt independente" verifici toate celulele. Pentru „nu sunt" ajunge o celulă care nu se potrivește.

$X$ și $Y$ sunt independente dacă și numai dacă, pentru toate perechile $(x,y)$:

$$p(x,y)=p_X(x)\,p_Y(y)$$

La variabile cu valorile 0 și 1, o scurtătură e $p(0,0)\,p(1,1)=p(0,1)\,p(1,0)$. Pe hârtie scrie totuși toate cele 4 celule; scurtătura folosește-o ca verificare.

**Capcana:** Verifici o singură celulă care iese bine și declari „independente". O celulă bună nu ajunge. Nici $\mathrm{Cov}=0$ nu dovedește independența.

**Încearcă tu:**

Problema 1. Tabelul comun:

| | $Y=0$ | $Y=1$ |
|---|---|---|
| $X=0$ | 0,12 | 0,28 |
| $X=1$ | 0,18 | 0,42 |

Sunt $X$ și $Y$ independente? Scrie-o ca pe hârtie.

<details><summary>Răspuns</summary>

1. $P(X=0)=0{,}12+0{,}28=0{,}4$ și $P(X=1)=0{,}18+0{,}42=0{,}6$.
2. $P(Y=0)=0{,}12+0{,}18=0{,}3$ și $P(Y=1)=0{,}28+0{,}42=0{,}7$.
3. $(0,0)$: $0{,}4\cdot0{,}3=0{,}12$. Se potrivește.
4. $(0,1)$: $0{,}4\cdot0{,}7=0{,}28$. Se potrivește.
5. $(1,0)$: $0{,}6\cdot0{,}3=0{,}18$. Se potrivește.
6. $(1,1)$: $0{,}6\cdot0{,}7=0{,}42$. Se potrivește.
7. Toate 4 celulele se potrivesc, deci **sunt** independente. Verificare cu scurtătura: $0{,}12\cdot0{,}42=0{,}0504$ și $0{,}28\cdot0{,}18=0{,}0504$.

</details>

Problema 2. Tabelul comun ($X$ ia 0, 1 și $Y$ ia $-1$, 0, 1):

| | $Y=-1$ | $Y=0$ | $Y=1$ |
|---|---|---|---|
| $X=0$ | 0,1 | 0,4 | 0,1 |
| $X=1$ | 0 | 0,4 | 0 |

Calculează $\mathrm{Cov}(X,Y)$. Sunt independente?

<details><summary>Răspuns</summary>

1. $E[X]=P(X=1)=0+0{,}4+0=0{,}4$.
2. $P(Y=-1)=0{,}1$, $P(Y=0)=0{,}8$, $P(Y=1)=0{,}1$, deci $E[Y]=(-1)\cdot0{,}1+0\cdot0{,}8+1\cdot0{,}1=0$.
3. $E[XY]$: celulele cu $X=1$ și $Y\ne0$ au probabilitate 0, iar restul au produsul $xy=0$. Deci $E[XY]=0$.
4. $\mathrm{Cov}=0-0{,}4\cdot0=0$.
5. Totuși celula $(1,-1)$: $P(X=1)\cdot P(Y=-1)=0{,}4\cdot0{,}1=0{,}04$, dar $p(1,-1)=0$.
6. Egalitatea pică, deci **nu** sunt independente. Covarianța 0 nu implică independența.

</details>

## Independența condiționată a variabilelor

**Când vezi asta:** „Sunt $X$ și $Y$ independente condiționat de $Z$?" Ți se dă un tabel cu trei variabile sau probabilități în felii după $Z$.

**Simboluri:**

- $Z$ = a treia variabilă, cea pe care o „fixăm".
- $(x,y,z)$ = o celulă din tabelul cu trei variabile: $X=x$, $Y=y$, $Z=z$.
- „Felia $Z=z$" = doar celulele cu acel $z$, împărțite la $P(Z=z)$ ca să adune 1.
- $P(x,y\mid z)$ = probabilitatea comună în felie.
- $X\perp Y\mid Z$ = $X$ și $Y$ sunt independente **în fiecare felie** (condiționat de $Z$).

**Exemplu:**

$Z$ e un bit corect: $P(Z=0)=P(Z=1)=0{,}5$. $X$ ia aceeași valoare ca $Z$ cu probabilitatea $0{,}8$ (și valoarea opusă cu $0{,}2$), iar $Y$ la fel, separat de $X$. Atunci $P(x,y,z)=P(z)\,P(x\mid z)\,P(y\mid z)$.

1. Celula $(0,0,0)$: $P(Z=0)\cdot P(X=0\mid Z=0)\cdot P(Y=0\mid Z=0)=0{,}5\cdot0{,}8\cdot0{,}8=0{,}32$.
2. Restul feliei $Z=0$: $(0,1)\to0{,}5\cdot0{,}8\cdot0{,}2=0{,}08$; $(1,0)\to0{,}5\cdot0{,}2\cdot0{,}8=0{,}08$; $(1,1)\to0{,}5\cdot0{,}2\cdot0{,}2=0{,}02$. Suma feliei: $0{,}32+0{,}08+0{,}08+0{,}02=0{,}5$.
3. Împărțim felia la $P(Z=0)=0{,}5$: $0{,}64;\,0{,}16;\,0{,}16;\,0{,}04$.
4. Marginalele feliei: $P(X=0\mid Z=0)=0{,}64+0{,}16=0{,}8$ și $P(Y=0\mid Z=0)=0{,}64+0{,}16=0{,}8$. Pentru valoarea 1 rămâne $0{,}2$.
5. Produsele: $0{,}8\cdot0{,}8=0{,}64$; $0{,}8\cdot0{,}2=0{,}16$; $0{,}2\cdot0{,}8=0{,}16$; $0{,}2\cdot0{,}2=0{,}04$. Toate cele 4 celule se potrivesc.
6. Felia $Z=1$: $(0,0)\to0{,}5\cdot0{,}2\cdot0{,}2=0{,}02$; $(0,1)\to0{,}08$; $(1,0)\to0{,}08$; $(1,1)\to0{,}5\cdot0{,}8\cdot0{,}8=0{,}32$. Împărțită la $0{,}5$: $0{,}04;\,0{,}16;\,0{,}16;\,0{,}64$.
7. Marginalele ei: $P(X=0\mid Z=1)=0{,}04+0{,}16=0{,}2$ și $P(Y=0\mid Z=1)=0{,}2$. Produsele $0{,}2\cdot0{,}2=0{,}04$; $0{,}2\cdot0{,}8=0{,}16$; $0{,}8\cdot0{,}2=0{,}16$; $0{,}8\cdot0{,}8=0{,}64$ se potrivesc.
8. Concluzie: toate cele 8 egalități ($4$ pe felie, $2$ felii) sunt adevărate, deci $X\perp Y\mid Z$.
9. Fără $Z$ (adunăm feliile): $p(0,0)=0{,}32+0{,}02=0{,}34$. $P(X=0)=0{,}5\cdot0{,}8+0{,}5\cdot0{,}2=0{,}5$ și la fel $P(Y=0)=0{,}5$. $0{,}5\cdot0{,}5=0{,}25\ne0{,}34$, deci $X$ și $Y$ sunt **dependente**.

**Regula:** Verifici independența separat în fiecare felie $Z=z$, cu toate celulele ei. Dacă o egalitate pică, răspunsul e „nu".

$X\perp Y\mid Z$ dacă și numai dacă, pentru toate $x,y,z$:

$$P(x,y\mid z)=P(x\mid z)\,P(y\mid z)$$

Pentru variabile binare sunt $2\cdot2\cdot2=8$ egalități. Într-o felie binară, una singură plus marginalele feliei ajunge ca verificare, dar pe hârtie le scrii pe toate.

**Capcana:** Verifici o singură felie, sau confunzi cu independența simplă. Cele două nu se implică una pe alta: în exemplu $X$ și $Y$ sunt dependente, dar independente condiționat de $Z$.

**Încearcă tu:**

Problema 1. Variabile binare, date pe felii:

Felia $Z=0$:

- $P(X=1\mid Z=0)=0{,}5$
- $P(Y=1\mid Z=0)=0{,}4$
- $P(X=1,Y=1\mid Z=0)=0{,}2$

Felia $Z=1$:

- $P(X=1\mid Z=1)=0{,}9$
- $P(Y=1\mid Z=1)=0{,}5$
- $P(X=1,Y=1\mid Z=1)=0{,}5$

Este $X\perp Y\mid Z$?

<details><summary>Răspuns</summary>

1. Felia $Z=0$: $0{,}5\cdot0{,}4=0{,}2$ și celula e $0{,}2$. Se potrivește.
2. Felia $Z=1$: $0{,}9\cdot0{,}5=0{,}45$, dar celula e $0{,}5$. Nu se potrivește.
3. Una dintre egalități pică, deci **nu** sunt independente condiționat de $Z$. Felia care iese bine nu salvează răspunsul.

</details>

Problema 2. Tabelul comun al variabilelor binare $X$, $Y$, $Z$ (fiecare rând e o celulă):

| $x$ | $y$ | $z$ | $P(x,y,z)$ |
|---|---|---|---|
| 0 | 0 | 0 | 0,315 |
| 0 | 1 | 0 | 0,135 |
| 1 | 0 | 0 | 0,035 |
| 1 | 1 | 0 | 0,015 |
| 0 | 0 | 1 | 0,015 |
| 0 | 1 | 1 | 0,035 |
| 1 | 0 | 1 | 0,135 |
| 1 | 1 | 1 | 0,315 |

Sunt $X$ și $Y$ independente? Sunt independente condiționat de $Z$?

<details><summary>Răspuns</summary>

1. Fără $Z$ adunăm cele două felii: $p(0,0)=0{,}315+0{,}015=0{,}33$.
2. $P(X=0)=0{,}315+0{,}135+0{,}015+0{,}035=0{,}5$ și $P(Y=0)=0{,}315+0{,}035+0{,}015+0{,}135=0{,}5$.
3. $0{,}5\cdot0{,}5=0{,}25\ne0{,}33$, deci $X$ și $Y$ **nu** sunt independente.
4. $P(Z=0)=0{,}315+0{,}135+0{,}035+0{,}015=0{,}5$, deci și $P(Z=1)=0{,}5$.
5. Felia $Z=0$ împărțită la $0{,}5$: $(0,0)\to0{,}63$; $(0,1)\to0{,}27$; $(1,0)\to0{,}07$; $(1,1)\to0{,}03$.
6. Marginalele ei: $P(X=0\mid Z=0)=0{,}63+0{,}27=0{,}9$ și $P(Y=0\mid Z=0)=0{,}63+0{,}07=0{,}7$. Pentru valoarea 1 rămân $0{,}1$ și $0{,}3$.
7. Produsele: $0{,}9\cdot0{,}7=0{,}63$; $0{,}9\cdot0{,}3=0{,}27$; $0{,}1\cdot0{,}7=0{,}07$; $0{,}1\cdot0{,}3=0{,}03$. Se potrivesc toate 4.
8. Felia $Z=1$ împărțită la $0{,}5$: $(0,0)\to0{,}03$; $(0,1)\to0{,}07$; $(1,0)\to0{,}27$; $(1,1)\to0{,}63$.
9. Marginalele ei: $P(X=0\mid Z=1)=0{,}03+0{,}07=0{,}1$ și $P(Y=0\mid Z=1)=0{,}03+0{,}27=0{,}3$. Pentru valoarea 1 rămân $0{,}9$ și $0{,}7$.
10. Produsele: $0{,}1\cdot0{,}3=0{,}03$; $0{,}1\cdot0{,}7=0{,}07$; $0{,}9\cdot0{,}3=0{,}27$; $0{,}9\cdot0{,}7=0{,}63$. Se potrivesc toate 4.
11. Toate 8 egalitățile sunt adevărate, deci $X\perp Y\mid Z$: dependente fără $Z$, dar independente condiționat de $Z$.

</details>
