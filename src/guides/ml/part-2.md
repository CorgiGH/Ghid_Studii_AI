# Partea 2: Entropie, câștig de informație, ID3

## Entropia: H(X) și H[a+,b−]

**Când vezi asta:** ți se cere „entropia" unui set de date, de exemplu $[2+,4-]$, sau a unei distribuții de probabilități. Sau trebuie să spui cât de „amestecat" este un grup de exemple.

**Simboluri:**

- $X$: variabila despre care vorbim, de obicei eticheta unui exemplu.
- $P(x)$: probabilitatea valorii $x$. Într-un set de date este frecvența ei: câte exemple au valoarea $x$, împărțit la total.
- $\log_2$: logaritm în baza 2. De exemplu $\log_2 8=3$, fiindcă $2^3=8$. Pe calculator: $\log_2 x=\ln x/\ln 2$.
- $[a+,b-]$: un set cu $a$ exemple pozitive și $b$ exemple negative.
- $H$: entropia, măsurată în biți. Este nesiguranța ta despre etichetă: $0$ înseamnă că știi sigur, o valoare mare înseamnă amestec.
- $0\log_2 0=0$: convenție. O clasă care lipsește nu adaugă nimic.
- $\sum_x$: „adună pentru fiecare valoare $x$". Scrii termenul o dată pentru fiecare valoare și aduni.

**Exemplu:** setul $[2+,4-]$ are 6 exemple.

1. Frecvențele: $P(+)=\frac26=\frac13$ și $P(-)=\frac46=\frac23$.
2. „Surpriza" unei valori este $\log_2\frac{1}{P}$. Pentru $+$: $\log_2 3=1{,}5850$ biți. Pentru $-$: $\log_2\frac32=0{,}5850$ biți.
3. Fiecare surpriză se înmulțește cu cât de des apare: $\frac13\cdot1{,}5850=0{,}5283$ și $\frac23\cdot0{,}5850=0{,}3900$.
4. Le aduni: $H[2+,4-]=0{,}5283+0{,}3900=0{,}9183$ biți.
5. Aceeași formulă pe o distribuție: valorile $a,b,c$ cu $P=\frac12,\frac14,\frac14$ au surprizele $1,2,2$ biți.
6. $H=\frac12\cdot1+\frac14\cdot2+\frac14\cdot2=0{,}5+0{,}5+0{,}5=1{,}5$ biți.
7. Verificare: $1{,}5$ este între $0$ și $\log_2 3=1{,}5850$, deci e posibil.

**Regula:** entropia este surpriza medie, adică fiecare valoare își aduce surpriza înmulțită cu probabilitatea ei.

$$H(X)=-\sum_x P(x)\log_2 P(x)$$

$$H[a+,b-]=-\frac{a}{a+b}\log_2\frac{a}{a+b}-\frac{b}{a+b}\log_2\frac{b}{a+b}$$

Verificare: $0\le H\le\log_2 k$, unde $k$ este numărul de valori. La două clase maximul este $1$, iar $H[n+,n-]=1$ și $H[0+,n-]=0$.

**Capcana:** folosești $\ln$ în loc de $\log_2$ (rezultatul iese înmulțit cu $0{,}6931$, deci prea mic) sau crezi că entropia depinde de care clasă e majoritară. De fapt $H[5+,3-]=H[3+,5-]$, iar un rezultat negativ sau peste $\log_2 k$ înseamnă că ai greșit.

**Încearcă tu:**

Problema 1: calculează $H[1+,3-]$.

<details><summary>Răspuns</summary>

1. $P(+)=\frac14$, $P(-)=\frac34$.
2. Surprize: $\log_2 4=2$ și $\log_2\frac43=0{,}4150$.
3. $H=\frac14\cdot2+\frac34\cdot0{,}4150=0{,}5000+0{,}3113=0{,}8113$ biți.

</details>

Problema 2: calculează $H[4+,0-]$ și $H[3+,3-]$.

<details><summary>Răspuns</summary>

1. $[4+,0-]$: $P(+)=1$, $P(-)=0$. Cu $0\log_2 0=0$: $H=1\cdot\log_2 1=0$. Nu ai nicio nesiguranță.
2. $[3+,3-]$: $P(+)=P(-)=\frac12$, surprizele sunt $1$ și $1$. $H=\frac12+\frac12=1$ bit, maximul pentru două clase.

</details>

## Entropia condiționată specifică: H(Y|X=x)

**Când vezi asta:** ți se cere entropia etichetei „doar pentru cei la care atributul are o anumită valoare". Întrebarea sună ca $H(Y|X=x)$ sau „entropia condițională specifică".

**Simboluri:**

- $Y$: ce vrem să prezicem (eticheta).
- $X$: atributul pe care îl întrebăm.
- $x$: o valoare anume a lui $X$.
- $H(Y|X=x)$: entropia lui $Y$ calculată doar în grupul de exemple unde $X=x$. Se citește „entropia lui $Y$ știind că $X=x$".
- $P(y|x)$: frecvența etichetei $y$ în acel grup (câte exemple din grup au eticheta $y$, împărțit la mărimea grupului).

**Exemplu:** 10 apartamente. $X$ este zona, $Y$ este chiria ($+$ scumpă, $-$ ieftină).

| Zona | $+$ | $-$ | total |
|---|---|---|---|
| Centru | 3 | 1 | 4 |
| Periferie | 2 | 4 | 6 |
| total | 5 | 5 | 10 |

1. Pentru $X=$ Centru iei doar primul rând: grupul $[3+,1-]$, cu 4 apartamente.
2. Frecvențele în grup: $P(+)=\frac34$ și $P(-)=\frac14$. Surprizele: $\log_2\frac43=0{,}4150$ și $\log_2 4=2$.
3. $H(Y|X=\text{Centru})=\frac34\cdot0{,}4150+\frac14\cdot2=0{,}3113+0{,}5000=0{,}8113$.
4. Pentru $X=$ Periferie iei al doilea rând: grupul $[2+,4-]$.
5. $H(Y|X=\text{Periferie})=0{,}9183$ (calculat în cardul despre entropie).
6. Fiecare valoare a lui $X$ are propriul ei număr.

**Regula:** entropia condiționată specifică este pur și simplu entropia grupului în care $X=x$.

$$H(Y|X=x)=-\sum_y P(y|x)\log_2 P(y|x)$$

**Capcana:** calculezi entropia cu totalurile întregului tabel în loc să iei doar rândul valorii cerute.

**Încearcă tu:**

Problema 1: grupul $X=a$ este $[2+,6-]$, iar grupul $X=b$ este $[5+,0-]$. Calculează $H(Y|X=a)$ și $H(Y|X=b)$.

<details><summary>Răspuns</summary>

1. $X=a$: $P(+)=\frac14$, $P(-)=\frac34$. $H=\frac14\cdot2+\frac34\cdot0{,}4150=0{,}5000+0{,}3113=0{,}8113$.
2. $X=b$: grupul e pur, $H=0$.

</details>

Problema 2: grupul $X=u$ este $[4+,4-]$, iar grupul $X=v$ este $[1+,2-]$. Calculează $H(Y|X=u)$ și $H(Y|X=v)$.

<details><summary>Răspuns</summary>

1. $X=u$: jumătate-jumătate, deci $H=1$.
2. $X=v$: $P(+)=\frac13$, $P(-)=\frac23$. $H=\frac13\cdot1{,}5850+\frac23\cdot0{,}5850=0{,}5283+0{,}3900=0{,}9183$.

</details>

## Entropia condiționată medie: H(Y|X)

**Când vezi asta:** ți se cere „entropia condițională medie" $H(Y|X)$. Aici atributul are mai multe valori și vrei un singur număr pentru tot atributul.

**Simboluri:**

- $H(Y|X)$: media entropiilor grupurilor, fiecare grup cântărit după cât de mare e.
- $P(X=x)$: ponderea grupului $x$, adică numărul de exemple din grup împărțit la total.
- Nu este entropia unei variabile „$Y|X$". Este o medie ponderată.

**Exemplu:** același tabel cu apartamente. Din cardul anterior: $H(Y|X=\text{Centru})=0{,}8113$ și $H(Y|X=\text{Periferie})=0{,}9183$.

1. Ponderile: Centru are 4 din 10, adică $0{,}4$. Periferie are 6 din 10, adică $0{,}6$.
2. Contribuțiile: $0{,}4\cdot0{,}8113=0{,}3245$ și $0{,}6\cdot0{,}9183=0{,}5510$.
3. $H(Y|X)=0{,}3245+0{,}5510=0{,}8755$.
4. Media simplă $\frac{0{,}8113+0{,}9183}{2}=0{,}8648$ este greșită, fiindcă ignoră ponderile.
5. Verificare: $H(Y)=H[5+,5-]=1$ și $0{,}8755\le1$. Aflând $X$, nesiguranța nu crește niciodată.

**Regula:** entropia condiționată medie este media entropiilor specifice, cântărite cu mărimea grupurilor.

$$H(Y|X)=\sum_x P(X=x)\,H(Y|X=x)$$

**Capcana:** faci media simplă a entropiilor grupurilor în loc de media ponderată.

**Încearcă tu:**

Problema 1: setul are 8 exemple, $[6+,2-]$. Atributul $X$ are grupurile $X=a$: $[1+,1-]$ și $X=b$: $[5+,1-]$. Calculează $H(Y|X)$.

<details><summary>Răspuns</summary>

1. Ponderile: $a$ are 2 din 8, adică $0{,}25$. $b$ are 6 din 8, adică $0{,}75$.
2. $H(Y|X=a)=1$. $H(Y|X=b)=H[5+,1-]=0{,}6500$.
3. $H(Y|X)=0{,}25\cdot1+0{,}75\cdot0{,}6500=0{,}2500+0{,}4875=0{,}7375$.
4. Verificare: $H(Y)=H[6+,2-]=0{,}8113$ și $0{,}7375\le0{,}8113$.

</details>

Problema 2: setul are 10 exemple, $[5+,5-]$. Grupurile sunt $X=u$: $[2+,2-]$ și $X=v$: $[3+,3-]$. Calculează $H(Y|X)$ și compară cu $H(Y)$.

<details><summary>Răspuns</summary>

1. Ponderile: $u$ are 4 din 10, adică $0{,}4$. $v$ are $0{,}6$.
2. Ambele grupuri sunt jumătate-jumătate: $H(Y|X=u)=H(Y|X=v)=1$.
3. $H(Y|X)=0{,}4\cdot1+0{,}6\cdot1=1$.
4. $H(Y)=H[5+,5-]=1$. Rezultatul iese egal: atributul $X$ nu te ajută deloc.

</details>

## Câștigul de informație: IG

**Când vezi asta:** ți se cere „câștigul de informație" $IG(Y;X)$, sau care atribut „dă cel mai mare câștig". În ID3 acesta este numărul după care alegi atributul.

**Simboluri:**

- $IG(Y;X)$: cât din nesiguranța lui $Y$ dispare după ce afli $X$.
- $H(Y)$: entropia etichetei, înainte să știi $X$.
- $H(Y|X)$: entropia condiționată medie, adică nesiguranța rămasă după ce afli $X$.

**Exemplu:** apartamentele din cardurile anterioare.

1. $H(Y)=H[5+,5-]=1$.
2. $H(Y|X)=0{,}8755$ (cardul precedent).
3. $IG=1-0{,}8755=0{,}1245$ biți.
4. Zona ne spune puțin despre chirie: din $1$ bit de nesiguranță dispar doar $0{,}1245$.
5. Verificare: $0\le IG\le\min(H(X),H(Y))$, iar $0{,}1245$ trece.

**Regula:** câștigul este nesiguranța de la început minus nesiguranța care rămâne.

$$IG(Y;X)=H(Y)-H(Y|X)$$

Dacă $X$ și $Y$ sunt independente, $IG=0$, iar dacă $X$ determină complet $Y$, $IG=H(Y)$. Câștigul este simetric: $IG(Y;X)=IG(X;Y)$.

**Capcana:** dai $H(Y|X)$ drept câștig, sau scazi invers. Câștigul nu poate fi negativ; dacă ți-a ieșit negativ, ai greșit un calcul.

**Încearcă tu:**

Problema 1: setul este $[4+,4-]$. Atributul $X$ are grupurile $X=a$: $[3+,1-]$ și $X=b$: $[1+,3-]$. Calculează $IG(Y;X)$.

<details><summary>Răspuns</summary>

1. $H(Y)=H[4+,4-]=1$.
2. Ponderile sunt $\frac48=\frac12$ pentru fiecare grup. $H[3+,1-]=H[1+,3-]=0{,}8113$.
3. $H(Y|X)=0{,}5\cdot0{,}8113+0{,}5\cdot0{,}8113=0{,}8113$.
4. $IG=1-0{,}8113=0{,}1887$ biți.

</details>

Problema 2: setul este $[3+,3-]$. Grupurile sunt $X=a$: $[3+,0-]$ și $X=b$: $[0+,3-]$. Calculează $IG(Y;X)$.

<details><summary>Răspuns</summary>

1. $H(Y)=H[3+,3-]=1$.
2. Ambele grupuri sunt pure: $H(Y|X=a)=H(Y|X=b)=0$.
3. $H(Y|X)=0{,}5\cdot0+0{,}5\cdot0=0$.
4. $IG=1-0=1$. Câștigul este maxim și egal cu $H(Y)$: $X$ spune tot despre $Y$.

</details>

## Formulele rapide și comparațiile fără calculator

**Când vezi asta:** enunțul zice „fără calculator", „compară", „fără să calculezi logaritmi" sau dă produse de forma $n^n$. La examen, comparația cu raționament valorează puncte.

**Simboluri:**

- $a^a$: $a$ ridicat la puterea $a$. De exemplu $3^3=27$.
- „Cota minoritară" a unui grup $[a+,b-]$: partea clasei mai mici, $\frac{\min(a,b)}{a+b}$.
- „Ciot" (compas de decizie): un arbore cu un singur test, cu grupurile $[a+,b-]$ scrise sub el.
- $P_A$: produsul de buzunar al ciotului $A$. Pentru fiecare grup $[a+,b-]$ cu $n=a+b$ exemple calculezi factorul $\frac{n^n}{a^a\,b^b}$, apoi înmulțești factorii tuturor grupurilor. Un grup pur are factorul $1$.

**Exemplu:** trei lucruri de făcut fără calculator.

*Partea A, formula de buzunar pentru $H[3+,4-]$:*

1. Formula este $H=\frac{1}{n}\left(n\log_2 n-a\log_2 a-b\log_2 b\right)$ cu $n=a+b=7$.
2. $7\log_2 7=7\cdot2{,}8074=19{,}6515$. $3\log_2 3=3\cdot1{,}5850=4{,}7549$. $4\log_2 4=4\cdot2=8$.
3. $H=\frac17(19{,}6515-4{,}7549-8)=\frac{6{,}8966}{7}=0{,}9852$.

*Partea B, comparație cu cota minoritară: care e mai mare, $H[5+,3-]$ sau $H[2+,9-]$?*

4. Cotele minoritare: $\frac38=\frac{33}{88}$ și $\frac{2}{11}=\frac{16}{88}$. Ambele sunt sub $\frac12$.
5. Pe intervalul $[0,\frac12]$ entropia crește odată cu cota, deci $H[5+,3-]>H[2+,9-]$. Valorile (le afli abia la final): $0{,}9544>0{,}6840$.

*Partea C, comparația a doi cioturi: rădăcina este $[7+,5-]$.*

6. Ciotul $A$: $[1+,4-]$ și $[6+,1-]$. Ciotul $B$: $[2+,3-]$ și $[5+,2-]$.
7. Ponderile coincid: $\frac{5}{12}$ și $\frac{7}{12}$ în ambele cioturi.
8. Pe perechi: $\frac15<\frac25$ și $\frac17<\frac27$, toate sub $\frac12$. Fiecare grup al lui $A$ are entropie mai mică, deci $H(Y|A)<H(Y|B)$ și $A$ are câștig mai mare.
9. Același lucru cu produsul de buzunar (merge și când ponderile diferă). Ciotul $A$: $\frac{5^5}{1^1\cdot4^4}=\frac{3125}{256}=12{,}207$ și $\frac{7^7}{6^6\cdot1^1}=\frac{823543}{46656}=17{,}651$, deci $P_A=12{,}207\cdot17{,}651=215{,}47$.
10. Ciotul $B$: $\frac{5^5}{2^2\cdot3^3}=\frac{3125}{108}=28{,}935$ și $\frac{7^7}{5^5\cdot2^2}=\frac{823543}{12500}=65{,}883$, deci $P_B=28{,}935\cdot65{,}883=1906{,}3$.
11. $P_A<P_B$, deci câștigă tot $A$.
12. Verificare cu numere: $H(Y|A)=\frac{\log_2 215{,}47}{12}=0{,}6459<H(Y|B)=\frac{\log_2 1906{,}3}{12}=0{,}9080$.

**Regula:** compari cioturile fără logaritmi prin cota minoritară (la ponderi egale) sau prin produsul de buzunar, și câștigă produsul mai mic.

$$H[a+,b-]=\frac{1}{a+b}\log_2\frac{(a+b)^{a+b}}{a^a\,b^b}$$

$$H(Y|A)=\frac{1}{N}\log_2 P_A$$

Aici $N$ este numărul total de exemple, iar $P_A$ este produsul factorilor $\frac{n^n}{a^a b^b}$ ai grupurilor ciotului ($n$ este mărimea grupului; un grup pur adaugă factorul $1$). Prima formulă este aceeași cu cea din Partea A, scrisă cu puteri în loc de logaritmi.

**Capcana:** la produse câștigă cel mai MIC, fiindcă produsul mic înseamnă $H(Y|A)$ mic, adică câștig mare. Și numărul de exemple nu contează în $H$, ci doar proporția.

**Încearcă tu:**

Problema 1: care este mai mare, $H[4+,5-]$ sau $H[5+,6-]$? Răspunde fără calculator, apoi verifică.

<details><summary>Răspuns</summary>

1. Cotele minoritare: $\frac49=\frac{44}{99}$ și $\frac{5}{11}=\frac{45}{99}$. Ambele sunt sub $\frac12$.
2. A doua cotă e mai aproape de $\frac12$, deci $H[5+,6-]$ este mai mare.
3. Verificare: $H[4+,5-]=0{,}9911<H[5+,6-]=0{,}9940$.

</details>

Problema 2: rădăcina este $[3+,3-]$, ciotul $A$ dă $[2+,1-]$ și $[1+,2-]$, iar ciotul $B$ dă $[3+,2-]$ și $[0+,1-]$. Care ciot câștigă? Folosește produsul de buzunar.

<details><summary>Răspuns</summary>

1. Ponderile diferă ($\frac36,\frac36$ la $A$, dar $\frac56,\frac16$ la $B$), deci cota minoritară nu ajunge. Folosești produsul.
2. $P_A$: ambele grupuri au $n=3$, iar factorul fiecăruia este $\frac{3^3}{2^2\cdot1^1}=\frac{27}{4}=6{,}75$. Deci $P_A=6{,}75\cdot6{,}75=45{,}5625$.
3. $P_B$: grupul $[3+,2-]$ are $n=5$ și factorul $\frac{5^5}{3^3\cdot2^2}=\frac{3125}{108}=28{,}935$. Grupul $[0+,1-]$ e pur, factorul $1$. Deci $P_B=28{,}935$.
4. $P_B<P_A$, deci câștigă $B$ (aici câștigă ciotul cu frunza pură).
5. Verificare: $H(Y|A)=\frac{\log_2 45{,}5625}{6}=0{,}9183$ și $H(Y|B)=\frac{\log_2 28{,}935}{6}=0{,}8091$.

</details>

## ID3: modelul (arborele) și obiectivul

**Când vezi asta:** întrebarea este „ce model construiește ID3 și ce optimizează?", sau ți se dă un arbore și trebuie să clasifici o instanță, sau apar cuvinte ca „consistent" și „eroare la antrenare".

**Simboluri:**

- Instanță: un rând din tabel, fără etichetă. Atribut de intrare: o coloană de întrebat. Atribut de ieșire: eticheta.
- Arbore de decizie: noduri de test (un atribut de intrare), ramuri (valorile lui) și frunze (o etichetă).
- Set consistent: nu există două rânduri cu aceleași intrări și etichete diferite.
- Eroare la antrenare: câte exemple din setul de antrenament sunt clasificate greșit de arbore.
- $IG(S,A)$: câștigul atributului $A$ calculat doar pe exemplele $S$ din nod. Este același $IG(Y;A)$ din cardul despre câștig.
- $\arg\max_A$: „atributul $A$ pentru care" valoarea e cea mai mare. Răspunsul este atributul, nu numărul. $\arg\min_A$ la fel, pentru cea mai mică.

**Exemplu:** arborele are rădăcina $A$: dacă $A=1$, frunza este $+$, iar dacă $A=0$, testezi $B$ ($B=0$ dă $-$, $B=1$ dă $+$). Clasifică instanța $(A=0,B=1)$.

1. Pornești de la rădăcină. Testul este $A$, iar $A=0$, deci mergi pe ramura $A=0$.
2. Ajungi la nodul $B$. Aici $B=1$, deci mergi pe ramura $B=1$.
3. Ramura duce la o frunză cu eticheta $+$. Răspuns: $+$.

Modelul: fiecare test împarte exemplele nodului în grupuri, deci arborele este o ierarhie de partiții ale setului de antrenare. Obiectivul: arborele trebuie să explice datele (consistent, dacă datele sunt consistente), să fie compact (puține niveluri) și să generalizeze bine.

**Regula:** ID3 construiește un arbore de decizie alegând, la fiecare nod, atributul cu câștig de informație maxim, deci cu $H(Y|A)$ minim.

$$A^*=\arg\max_A IG(S,A)=\arg\min_A H(Y|A)$$

Alegerea e locală: un pas înainte, fără întoarcere. De aceea ID3 urmărește obiectivul, dar nu îl garantează.

**Capcana:** crezi că ID3 minimizează direct eroarea la antrenare, că găsește cel mai mic arbore sau că maximizează câștigul pe tot arborele. Nu: alege greedy, nod cu nod.

**Încearcă tu:**

Problema 1: arborele are rădăcina $C$: dacă $C=1$, frunza este $-$, iar dacă $C=0$, testezi $D$ ($D=0$ dă $+$, $D=1$ dă $-$). Clasifică instanța $(C=0,D=1)$.

<details><summary>Răspuns</summary>

1. Rădăcina $C$: $C=0$, mergi pe ramura $C=0$.
2. Nodul $D$: $D=1$, mergi pe ramura $D=1$.
3. Frunza este $-$. Răspuns: $-$.

</details>

Problema 2: adevărat sau fals? „ID3 întoarce mereu cel mai mic arbore consistent cu datele." Justifică.

<details><summary>Răspuns</summary>

1. Fals.
2. ID3 alege la fiecare nod atributul cu câștig maxim, dar nu se uită mai departe și nu se întoarce să corecteze (greedy, un pas înainte).
3. Un arbore mai mic poate exista, deci compactitatea este un obiectiv, nu o garanție.
4. Ce optimizează de fapt: în fiecare nod, câștigul de informație al testului ales (local, nu pe tot arborele).

</details>

## Compasul de decizie și alegerea rădăcinii

**Când vezi asta:** „ce atribut pui în rădăcină?", „desenează compașii de decizie" sau „care atribut are câștigul maxim?".

**Simboluri:**

- Compas de decizie (ciot, „decision stump"): un arbore cu un singur test. Sub test scrii grupurile $[a+,b-]$.
- $S$: setul de exemple din nod. $S_v$: exemplele din $S$ pentru care atributul are valoarea $v$.
- $|S|$ și $|S_v|$: numărul de exemple din cele două mulțimi.
- $A$: atributul testat.
- $H(S)$: entropia etichetelor din $S$, adică $H[a+,b-]$ al nodului. $H(S_v)$: entropia grupului $v$.
- $\sum_v$: aduni termenul pentru fiecare valoare $v$ a atributului.

**Exemplu:** rădăcina este $[4+,4-]$, atributul $A$ dă grupurile $[3+,1-]$ și $[1+,3-]$, iar atributul $B$ dă $[4+,2-]$ și $[0+,2-]$. Care merge în rădăcină?

1. $H(Y)=H[4+,4-]=1$.
2. Pentru $A$ grupurile au 4 și 4 exemple, ponderi $\frac12$ și $\frac12$. $H(Y|A)=0{,}5\cdot0{,}8113+0{,}5\cdot0{,}8113=0{,}8113$.
3. Pentru $B$ grupurile au 6 și 2 exemple, ponderi $\frac34$ și $\frac14$. $H[4+,2-]=0{,}9183$ și $H[0+,2-]=0$.
4. $H(Y|B)=0{,}75\cdot0{,}9183+0{,}25\cdot0=0{,}6887$.
5. Alegi entropia condiționată mai mică: $0{,}6887<0{,}8113$, deci $B$.
6. Câștigurile: $IG(B)=1-0{,}6887=0{,}3113$ și $IG(A)=1-0{,}8113=0{,}1887$.

**Regula:** desenezi cioturile, scrii $H(Y|A)$ în formă generală, înlocuiești numerele și alegi atributul cu $H(Y|A)$ cel mai mic (adică câștig maxim).

$$IG(S,A)=H(S)-\sum_v\frac{|S_v|}{|S|}H(S_v)$$

**Capcana:** alegi „după ochi" (o frunză pură mică nu câștigă automat) sau alegi entropia condiționată cea mai mare. „Mi se pare că" nu se punctează, iar cifra bună este cea mai mică $H(Y|A)$.

**Încearcă tu:**

Problema 1: rădăcina este $[8+,8-]$. Care atribut merge în rădăcină?

- $U$ dă $[7+,8-]$ și $[1+,0-]$ (are o frunză pură).
- $V$ dă $[6+,2-]$ și $[2+,6-]$.
- $W$ dă $[5+,1-]$ și $[3+,7-]$.

<details><summary>Răspuns</summary>

1. $H(Y)=H[8+,8-]=1$.
2. $U$: ponderi $\frac{15}{16}$ și $\frac{1}{16}$. $H[7+,8-]=0{,}9968$ și $H[1+,0-]=0$. $H(Y|U)=\frac{15}{16}\cdot0{,}9968=0{,}9345$, deci $IG(U)=0{,}0655$. Frunza pură e prea mică să ajute.
3. $V$: ponderi $\frac12,\frac12$ și $H[6+,2-]=H[2+,6-]=0{,}8113$, deci $H(Y|V)=0{,}8113$.
4. $W$: ponderi $\frac{6}{16}$ și $\frac{10}{16}$. $H[5+,1-]=0{,}6500$ și $H[3+,7-]=0{,}8813$.
5. $H(Y|W)=\frac{6}{16}\cdot0{,}6500+\frac{10}{16}\cdot0{,}8813=0{,}2438+0{,}5508=0{,}7946$.
6. Cel mai mic este $H(Y|W)$ ($0{,}7946<0{,}8113<0{,}9345$), deci $W$ merge în rădăcină. $IG(W)=1-0{,}7946=0{,}2054$.

</details>

Problema 2: rădăcina este $[5+,4-]$. Atributul $C$ dă $[3+,2-]$ și $[2+,2-]$, iar atributul $A$ dă $[5+,1-]$ și $[0+,3-]$. Care merge în rădăcină și cât e câștigul lui?

<details><summary>Răspuns</summary>

Aici folosim 5 zecimale, ca rotunjirile să nu se adune.

1. $H(Y)=H[5+,4-]=0{,}99108$.
2. $C$: ponderi $\frac59$ și $\frac49$. $H[3+,2-]=0{,}97095$ și $H[2+,2-]=1$. $H(Y|C)=\frac59\cdot0{,}97095+\frac49\cdot1=0{,}53942+0{,}44444=0{,}98386$.
3. $A$: ponderi $\frac69$ și $\frac39$. $H[5+,1-]=0{,}65002$ și $H[0+,3-]=0$ (convenția $0\log_2 0=0$).
4. $H(Y|A)=\frac69\cdot0{,}65002+\frac39\cdot0=0{,}43335$.
5. Alegi $A$ ($0{,}43335<0{,}98386$). $IG(A)=0{,}99108-0{,}43335=0{,}55773$.

</details>

## Construirea arborelui complet și clasificarea unei instanțe noi

**Când vezi asta:** „aplică ID3", „construiește arborele", „desenează arborele ID3" sau „clasifică instanța nouă cu arborele".

**Simboluri:**

- Nod pur: toate exemplele din nod au aceeași etichetă. Devine frunză.
- „Etichetă majoritară": eticheta cea mai frecventă în nod.
- „Counts": dacă tabelul are o coloană cu numărul de apariții, fiecare rând cântărește cât acel număr.

**Exemplu:** 6 pacienți. Atributele sunt nas care curge (N), febră (F) și tuse (T); eticheta este bolnav ($+$) sau sănătos ($-$).

| # | N | F | T | Bolnav |
|---|---|---|---|---|
| 1 | da | da | da | $+$ |
| 2 | da | nu | nu | $+$ |
| 3 | da | nu | da | $+$ |
| 4 | nu | da | da | $+$ |
| 5 | nu | nu | da | $-$ |
| 6 | nu | nu | nu | $-$ |

1. Rădăcina este $[4+,2-]$, $H=0{,}9183$.
2. Cioturile: $N$ dă da $[3+,0-]$ și nu $[1+,2-]$. $F$ dă da $[2+,0-]$ și nu $[2+,2-]$. $T$ dă da $[3+,1-]$ și nu $[1+,1-]$.
3. $H(Y|N)=\frac36\cdot0+\frac36\cdot0{,}9183=0{,}4591$. $H(Y|F)=\frac46\cdot1=0{,}6667$. $H(Y|T)=\frac46\cdot0{,}8113+\frac26\cdot1=0{,}5409+0{,}3333=0{,}8742$.
4. Cel mai mic este $H(Y|N)$, deci rădăcina este $N$ ($IG=0{,}4591$).
5. $N=$ da este pur ($[3+,0-]$): frunză $+$.
6. $N=$ nu are rândurile 4, 5, 6: $[1+,2-]$, $H=0{,}9183$. Acum calculezi doar pe aceste 3 rânduri. $F$ dă da $[1+,0-]$ și nu $[0+,2-]$, adică $H(Y|F)=0$. $T$ dă da $[1+,1-]$ și nu $[0+,1-]$, adică $H(Y|T)=\frac23\cdot1=0{,}6667$.
7. Alegi $F$ (câștig $0{,}9183$). Ambele ramuri sunt pure, deci arborele s-a terminat: $N=$ da dă $+$; $N=$ nu și $F=$ da dă $+$; $N=$ nu și $F=$ nu dă $-$.
8. Pacient nou: $N=$ nu, $F=$ da, $T=$ nu. La $N=$ nu mergi la $F$, iar $F=$ da dă $+$: bolnav. Tuse nu a fost folosită.

**Regula:** repeți alegerea atributului cu $IG$ maxim pe fiecare nod impur, doar cu exemplele lui, până când nodurile sunt pure.

Opriri: nod pur înseamnă frunză cu eticheta lui. Dacă nu mai ai atribute, frunză cu eticheta majoritară. Dacă o ramură n-are exemple, frunză cu eticheta majoritară a părintelui.

$$H(Y|A)=\sum_v\frac{|S_v|}{|S|}H(S_v)\quad\text{(pe exemplele nodului)}$$

Un atribut apare cel mult o dată pe un drum. La egalitate de câștig decide enunțul (de obicei primul din tabel).

**Capcana:** la al doilea nivel calculezi câștigul pe tot setul în loc de doar pe exemplele nodului, sau continui să împarți un nod care e deja pur.

**Încearcă tu:**

Problema 1: construiește arborele ID3 pentru tabelul de mai jos și clasifică instanța $(A=0,B=1,C=1,D=0)$.

| # | A | B | C | D | y |
|---|---|---|---|---|---|
| 1 | 1 | 0 | 1 | 0 | $+$ |
| 2 | 1 | 0 | 1 | 1 | $+$ |
| 3 | 0 | 0 | 1 | 0 | $+$ |
| 4 | 1 | 1 | 0 | 1 | $-$ |
| 5 | 0 | 1 | 0 | 1 | $+$ |
| 6 | 1 | 1 | 0 | 0 | $-$ |
| 7 | 0 | 1 | 1 | 1 | $-$ |

<details><summary>Răspuns</summary>

1. Rădăcina este $[4+,3-]$, $H=0{,}9852$.
2. Cioturile pe rădăcină: $A$ dă $1$: $[2+,2-]$ și $0$: $[2+,1-]$. $B$ dă $0$: $[3+,0-]$ și $1$: $[1+,3-]$. $C$ dă $1$: $[3+,1-]$ și $0$: $[1+,2-]$. $D$ dă $0$: $[2+,1-]$ și $1$: $[2+,2-]$.
3. $H(Y|B)=\frac37\cdot0+\frac47\cdot0{,}8113=0{,}4636$, deci $IG(B)=0{,}9852-0{,}4636=0{,}5216$.
4. La fel: $IG(C)=0{,}1281$, iar $IG(A)=IG(D)=0{,}0202$. Cel mai mare este $IG(B)$, deci rădăcina este $B$.
5. $B=0$: rândurile 1, 2, 3 sunt toate $+$, deci frunză $+$.
6. $B=1$: rândurile 4, 5, 6, 7, adică $[1+,3-]$, $H=0{,}8113$. Calculezi doar pe aceste 4 rânduri.
7. $A$ dă $1$: $[0+,2-]$ (rândurile 4, 6) și $0$: $[1+,1-]$ (rândurile 5, 7). $H(Y|A)=\frac24\cdot0+\frac24\cdot1=0{,}5$, $IG(A)=0{,}8113-0{,}5=0{,}3113$.
8. $C$ dă $0$: $[1+,2-]$ și $1$: $[0+,1-]$. $H(Y|C)=\frac34\cdot0{,}9183=0{,}6887$, $IG(C)=0{,}1226$. $D$ dă $1$: $[1+,2-]$ și $0$: $[0+,1-]$, tot $IG(D)=0{,}1226$. Alegi $A$.
9. $A=1$: rândurile 4 și 6 sunt $-$, frunză $-$.
10. $A=0$: rândurile 5 ($+$) și 7 ($-$). $C$ le desparte perfect (câștig $1$), iar $D$ nu ajută (ambele au $D=1$, câștig $0$). Alegi $C$: $C=0$ dă $+$, $C=1$ dă $-$.
11. Instanța: $B=1$, apoi $A=0$, apoi $C=1$, deci $-$.

</details>

Problema 2: un nod are $[3+,1-]$, iar toate atributele au fost deja testate pe drumul până la el. Ce frunză pune ID3 și câte exemple rămân greșit clasificate? Ce spune asta despre date?

<details><summary>Răspuns</summary>

1. Atributele sunt epuizate, deci nodul nu mai poate fi împărțit. ID3 pune o frunză cu eticheta majoritară: $+$.
2. Un exemplu din nod ($-$) rămâne clasificat greșit: 1 din 4.
3. Asta se întâmplă doar când datele sunt inconsistente: există rânduri cu aceleași intrări și etichete diferite.

</details>

## Praguri pe atribute continue

**Când vezi asta:** un atribut are valori numerice (temperatură, vârstă) și ți se cere „pragurile" sau „testul $X\le v$" pentru ID3.

**Simboluri:**

- Prag $v$: o valoare care împarte nodul în două: exemplele cu $X\le v$ și cele cu $X>v$.
- „Mijlocul": pragul se pune la jumătatea dintre două valori vecine, $\frac{u+w}{2}$.
- După ce are un prag, testul $X\le v$ este un atribut binar obișnuit.

**Exemplu:** șase măsurători, temperatură și etichetă: $40(-)$, $48(-)$, $60(+)$, $72(+)$, $80(+)$, $90(-)$.

1. Valorile sunt ordonate. Eticheta se schimbă doar între 48 și 60, și între 80 și 90.
2. Pragurile sunt mijloacele: $\frac{48+60}{2}=54$ și $\frac{80+90}{2}=85$. Doar 2 praguri, nu 5.
3. Rădăcina este $[3+,3-]$, $H=1$.
4. $T\le54$: stânga $[0+,2-]$, dreapta $[3+,1-]$. $H(Y|T\le54)=\frac46\cdot0{,}8113=0{,}5409$ și $IG=1-0{,}5409=0{,}4591$.
5. $T\le85$: stânga $[3+,2-]$, dreapta $[0+,1-]$. $H(Y|T\le85)=\frac56\cdot0{,}9710=0{,}8091$ și $IG=1-0{,}8091=0{,}1909$.
6. Câștigă $54$ ($0{,}4591>0{,}1909$).
7. Nodul din dreapta are 60, 72, 80, 90 ($[3+,1-]$). Pragurile se recalculează doar din aceste 4 valori: rămâne $85$, cu $[3+,0-]$ și $[0+,1-]$, ambele pure.
8. Arborele: $T\le54$ dă $-$; altfel $T\le85$ dă $+$; altfel $-$.

**Regula:** pragurile candidate sunt mijloacele dintre valorile vecine cu etichete diferite, iar la fiecare nod le recalculezi din exemplele nodului și alegi pragul cu câștig maxim.

$$v=\frac{u+w}{2}\quad\text{când eticheta se schimbă între }u\text{ și }w$$

Dacă o valoare apare cu ambele etichete, ea este graniță: pui prag între ea și vecinii ei. Același atribut continuu poate fi testat din nou mai jos, cu alt prag.

**Capcana:** pui prag la toate mijloacele (între valori cu aceeași etichetă nu se pune prag) sau, în nodurile de jos, folosești pragurile calculate pe tot setul.

**Încearcă tu:**

Problema 1: valorile $1(-)$, $2(+)$, $3(+)$, $4(+)$, $5(-)$, $6(-)$. Care sunt pragurile și care câștigă?

<details><summary>Răspuns</summary>

1. Eticheta se schimbă între 1 și 2, și între 4 și 5. Pragurile sunt $1{,}5$ și $4{,}5$.
2. Rădăcina este $[3+,3-]$, $H=1$.
3. $X\le1{,}5$: $[0+,1-]$ și $[3+,2-]$. $H=\frac56\cdot0{,}9710=0{,}8091$, $IG=0{,}1909$.
4. $X\le4{,}5$: $[3+,1-]$ și $[0+,2-]$. $H=\frac46\cdot0{,}8113=0{,}5409$, $IG=0{,}4591$.
5. Câștigă $4{,}5$.

</details>

Problema 2: valorile $1(-)$, $2(-)$, $3(-)$, $4(-)$, $5(+)$, $6(+)$, $7(+)$, $8(-)$. Alege pragul din rădăcină, apoi spune ce prag rămâne în nodul din dreapta și cât câștigă acolo.

<details><summary>Răspuns</summary>

1. Eticheta se schimbă între 4 și 5, și între 7 și 8. Pragurile sunt $4{,}5$ și $7{,}5$. Rădăcina este $[3+,5-]$, $H=0{,}9544$.
2. $X\le4{,}5$: $[0+,4-]$ și $[3+,1-]$. $H=\frac48\cdot0{,}8113=0{,}4056$, $IG=0{,}9544-0{,}4056=0{,}5488$.
3. $X\le7{,}5$: $[3+,4-]$ și $[0+,1-]$. $H=\frac78\cdot0{,}9852=0{,}8621$, $IG=0{,}9544-0{,}8621\approx0{,}092$.
4. Câștigă $4{,}5$.
5. Nodul din dreapta are valorile 5, 6, 7, 8: $[3+,1-]$, $H=0{,}8113$. Rămâne pragul $7{,}5$, cu $[3+,0-]$ și $[0+,1-]$, ambele pure. $IG=0{,}8113-0=0{,}8113$.

</details>

## Zone (suprafețe) de decizie

**Când vezi asta:** „desenează suprafețele de decizie", „în ce zonă cade punctul" sau „ce etichetă primește punctul nou". Atributele sunt de obicei două numere, $X_1$ și $X_2$.

**Simboluri:**

- $X_1,X_2$: cele două coordonate ale unui punct din plan.
- Frunză: un capăt al arborelui, cu o etichetă.
- Zonă (suprafață) de decizie: partea din plan care primește o anumită etichetă.
- Axe: dreptele $X_1$ și $X_2$. „Paralel cu axele" înseamnă drepte verticale sau orizontale.

**Exemplu:** 7 puncte $(X_1,X_2)$: $(1,1)-$, $(1,2)-$, $(2,1)-$, $(2,3)+$, $(3,4)+$, $(4,5)+$, $(6,5)-$.

1. Rădăcina este $[3+,4-]$, $H=0{,}9852$. Pragurile candidate le cauți pe fiecare axă, ca în cardul despre praguri.
2. Pe $X_1$ valorile sunt 1, 2, 3, 4, 6. Valoarea 2 are ambele etichete, deci pui prag de ambele părți ($1{,}5$ și $2{,}5$), iar între 4 ($+$) și 6 ($-$) pui $5$.
3. Pe $X_2$ valorile sunt 1, 2, 3, 4, 5. Eticheta se schimbă între 2 și 3 ($2{,}5$), iar valoarea 5 are ambele etichete ($4{,}5$).
4. Câștigul fiecărui prag, de exemplu $X_2\le2{,}5$: $H=\frac47\cdot0{,}8113=0{,}4636$, $IG=0{,}9852-0{,}4636=0{,}5216$. În tabel, „Da" sunt punctele cu testul adevărat ($\le$), iar „Nu" restul ($>$).

| Test | IG | Da | Nu |
|---|---|---|---|
| $X_1\le1{,}5$ | $0{,}2917$ | $[0+,2-]$ | $[3+,2-]$ |
| $X_1\le2{,}5$ | $0{,}1281$ | $[1+,3-]$ | $[2+,1-]$ |
| $X_1\le5$ | $0{,}1281$ | $[3+,3-]$ | $[0+,1-]$ |
| $X_2\le2{,}5$ | $0{,}5216$ | $[0+,3-]$ | $[3+,1-]$ |
| $X_2\le4{,}5$ | $0{,}0060$ | $[2+,3-]$ | $[1+,1-]$ |

5. Câștigă $X_2\le2{,}5$: stânga $[0+,3-]$ e pură, dreapta $[3+,1-]$.
6. Nodul din dreapta are punctele $(2,3),(3,4),(4,5),(6,5)$. Candidații se recalculează doar din ele: $X_1\le5$ dă $[3+,0-]$ și $[0+,1-]$ ($IG=0{,}8113$), iar $X_2\le4{,}5$ dă $[2+,0-]$ și $[1+,1-]$ ($IG=0{,}3113$). Alegi $X_1\le5$, ambele părți pure.
7. Arborele: $X_2\le2{,}5$ dă $-$; altfel $X_1\le5$ dă $+$; altfel $-$.
8. Zona fiecărei frunze este condiția de pe drum: frunza 1 este $\{X_2\le2{,}5\}$ cu eticheta $-$. Frunza 2 este $\{X_2>2{,}5,\ X_1\le5\}$ cu eticheta $+$. Frunza 3 este $\{X_2>2{,}5,\ X_1>5\}$ cu eticheta $-$.
9. Zona clasei $+$ este frunza 2. Zona clasei $-$ este reuniunea frunzelor 1 și 3.
10. Desenul: tragi dreapta orizontală $X_2=2{,}5$ pe toată lățimea, iar sub ea totul este $-$. Deasupra ei tragi dreapta verticală $X_1=5$, doar până sus: la stânga $+$, la dreapta $-$.
11. Punct nou $(4,1)$: $X_2=1\le2{,}5$, deci $-$. Punct $(2,4)$: $X_2>2{,}5$ și $X_1\le5$, deci $+$. Punct $(6,4)$: $X_2>2{,}5$ și $X_1>5$, deci $-$.

**Regula:** fiecare frunză are ca zonă un dreptunghi cu laturile paralele cu axele, dat de testele de pe drumul ei, iar zona unei clase este reuniunea frunzelor clasei.

$$\text{zona unei frunze}=\{\text{test}_1\ \wedge\ \text{test}_2\ \wedge\cdots\}$$

Granițele sunt paralele cu axele, fiindcă fiecare test compară un singur atribut cu un prag. Zonele nu sunt unice, deoarece arborele ID3 nu este unic.

**Capcana:** desenezi o graniță oblică (de exemplu $X_1+X_2=5$), ceea ce ID3 nu poate face, sau uiți testele de mai sus de pe drum când scrii zona unei frunze de jos.

**Încearcă tu:**

Problema 1: punctele sunt $(1,4)+$, $(2,2)+$, $(3,5)-$, $(4,2)+$, $(5,1)-$, $(5,3)+$, $(6,5)-$. Construiește arborele ID3 cu praguri, scrie zonele claselor și clasifică punctele $(3,3)$ și $(2,1)$.

<details><summary>Răspuns</summary>

1. Rădăcina este $[4+,3-]$, $H=0{,}9852$.
2. Pe $X_1$ (valori 1, 2, 3, 4, 5, 6, iar 5 are ambele etichete) pragurile sunt $2{,}5$, $3{,}5$, $4{,}5$, $5{,}5$. Pe $X_2$ (valori 1, 2, 3, 4, 5) pragurile sunt $1{,}5$ și $4{,}5$.

| Test | IG | Da | Nu |
|---|---|---|---|
| $X_1\le2{,}5$ | $0{,}2917$ | $[2+,0-]$ | $[2+,3-]$ |
| $X_1\le3{,}5$ | $0{,}0202$ | $[2+,1-]$ | $[2+,2-]$ |
| $X_1\le4{,}5$ | $0{,}1281$ | $[3+,1-]$ | $[1+,2-]$ |
| $X_1\le5{,}5$ | $0{,}1981$ | $[4+,2-]$ | $[0+,1-]$ |
| $X_2\le1{,}5$ | $0{,}1981$ | $[0+,1-]$ | $[4+,2-]$ |
| $X_2\le4{,}5$ | $0{,}4696$ | $[4+,1-]$ | $[0+,2-]$ |

3. Câștigă $X_2\le4{,}5$. Dreapta $[0+,2-]$ e pură: frunză $-$.
4. Stânga are $(1,4)+$, $(2,2)+$, $(4,2)+$, $(5,1)-$, $(5,3)+$, adică $[4+,1-]$, $H=0{,}7219$. Candidații din aceste puncte: $X_2\le1{,}5$ dă $[0+,1-]$ și $[4+,0-]$ ($IG=0{,}7219$), iar $X_1\le4{,}5$ dă $[3+,0-]$ și $[1+,1-]$ ($IG=0{,}3219$). Alegi $X_2\le1{,}5$.
5. Arborele: dacă $X_2\le4{,}5$, testezi $X_2\le1{,}5$ (da dă $-$, nu dă $+$); altfel $-$.
6. Frunzele: $\{X_2\le4{,}5,\ X_2\le1{,}5\}=\{X_2\le1{,}5\}$ cu $-$. $\{X_2\le4{,}5,\ X_2>1{,}5\}=\{1{,}5<X_2\le4{,}5\}$ cu $+$. $\{X_2>4{,}5\}$ cu $-$.
7. Zona lui $+$: banda orizontală $1{,}5<X_2\le4{,}5$. Zona lui $-$: $X_2\le1{,}5$ sau $X_2>4{,}5$.
8. $(3,3)$: $X_2=3$ e în bandă, deci $+$. $(2,1)$: $X_2=1\le1{,}5$, deci $-$.
9. Toate granițele sunt orizontale, iar atributul $X_2$ apare de două ori pe drum, cu praguri diferite.

</details>

Problema 2: punctele sunt $(1,4)+$, $(3,1)+$, $(4,2)+$, $(4,5)-$, $(5,2)-$, $(5,3)-$, $(6,3)-$. Construiește arborele ID3 cu praguri, scrie zonele claselor și clasifică $(2,6)$, $(5,1)$ și $(3,2)$.

<details><summary>Răspuns</summary>

1. Rădăcina este $[3+,4-]$, $H=0{,}9852$.
2. Pe $X_1$ (valori 1, 3, 4, 5, 6, iar 4 are ambele etichete) pragurile sunt $3{,}5$ și $4{,}5$. Pe $X_2$ (valori 1, 2, 3, 4, 5, iar 2 are ambele etichete) pragurile sunt $1{,}5$, $2{,}5$, $3{,}5$, $4{,}5$.

| Test | IG | Da | Nu |
|---|---|---|---|
| $X_1\le3{,}5$ | $0{,}4696$ | $[2+,0-]$ | $[1+,4-]$ |
| $X_1\le4{,}5$ | $0{,}5216$ | $[3+,1-]$ | $[0+,3-]$ |
| $X_2\le1{,}5$ | $0{,}1981$ | $[1+,0-]$ | $[2+,4-]$ |
| $X_2\le2{,}5$ | $0{,}1281$ | $[2+,1-]$ | $[1+,3-]$ |
| $X_2\le3{,}5$ | $0{,}0060$ | $[2+,3-]$ | $[1+,1-]$ |
| $X_2\le4{,}5$ | $0{,}1281$ | $[3+,3-]$ | $[0+,1-]$ |

3. Câștigă $X_1\le4{,}5$. Dreapta $[0+,3-]$ e pură: frunză $-$.
4. Stânga are $(1,4)+$, $(3,1)+$, $(4,2)+$, $(4,5)-$, adică $[3+,1-]$, $H=0{,}8113$. Candidații: $X_2\le4{,}5$ dă $[3+,0-]$ și $[0+,1-]$ ($IG=0{,}8113$), iar $X_1\le3{,}5$ dă $[2+,0-]$ și $[1+,1-]$ ($IG=0{,}3113$). Alegi $X_2\le4{,}5$.
5. Arborele: dacă $X_1\le4{,}5$, testezi $X_2\le4{,}5$ (da dă $+$, nu dă $-$); altfel $-$.
6. Frunzele: $\{X_1\le4{,}5,\ X_2\le4{,}5\}$ cu $+$. $\{X_1\le4{,}5,\ X_2>4{,}5\}$ cu $-$. $\{X_1>4{,}5\}$ cu $-$.
7. Zona lui $+$: dreptunghiul $X_1\le4{,}5$ și $X_2\le4{,}5$. Zona lui $-$: restul planului. Aici granițele sunt una verticală și una orizontală.
8. $(2,6)$: $X_1\le4{,}5$ dar $X_2=6>4{,}5$, deci $-$. $(5,1)$: $X_1=5>4{,}5$, deci $-$. $(3,2)$: ambele condiții, deci $+$.

</details>

## Proprietățile algoritmului ID3

**Când vezi asta:** enunț de tip adevărat/fals despre ID3 („ID3 e optimal?", „e sensibil la...?"), sau o întrebare numerică despre eroare, adâncime sau numărul de frunze.

**Simboluri:**

- Greedy: la fiecare pas alege ce pare cel mai bun acum, fără să se întoarcă.
- Bias inductiv: preferința algoritmului între ipotezele posibile.
- Eager: construiește modelul înainte de test, o singură dată.
- $R$: numărul de exemple. $M$: numărul de atribute.
- $SplitInfo(A)$: entropia mărimilor grupurilor lui $A$, adică cât de mărunt taie $A$ setul. Raportul câștigului este $\frac{IG(A)}{SplitInfo(A)}$ și pedepsește atributele care taie în multe bucăți.

**Exemplu:** ID3 favorizează atributele cu multe valori. 6 exemple, $[3+,3-]$. Atributul $Q$ (binar) dă $[3+,1-]$ și $[0+,2-]$. Atributul $\text{Id}$ (număr unic pe fiecare rând) dă 6 grupuri cu câte 1 exemplu.

1. $H(Y)=H[3+,3-]=1$.
2. $Q$: $H(Y|Q)=\frac46\cdot0{,}8113+\frac26\cdot0=0{,}5409$ și $IG(Q)=1-0{,}5409=0{,}4591$.
3. $\text{Id}$: fiecare grup are 1 exemplu, deci este pur și $H=0$. $H(Y|\text{Id})=0$ și $IG(\text{Id})=1-0=1$.
4. Câștigă $\text{Id}$ ($1>0{,}4591$), deși nu spune nimic util pentru un exemplu nou.
5. Remediu (raportul câștigului): $SplitInfo(\text{Id})=\log_2 6=2{,}5850$, deci $\frac{1}{2{,}5850}=0{,}3869$. $SplitInfo(Q)=H\left(\frac46,\frac26\right)=0{,}9183$ (grupurile lui $Q$ au 4 și 2 exemple), deci $\frac{0{,}4591}{0{,}9183}=0{,}5000$. Acum câștigă $Q$.

**Regula:** proprietățile de reținut sunt:

- Date consistente dau un arbore consistent, cu eroare $0$ la antrenare.
- Arborele nu este unic: egalitățile de câștig dau mai mulți arbori ID3 valizi.
- Nu este optimal: căutarea este greedy (un pas înainte, fără întoarcere), deci poate ieși un arbore mai mare decât cel minim, și întoarce o singură ipoteză.
- Este sensibil la atribute superflue (un atribut inutil poate fi ales primul) și la atribute cu foarte multe valori.
- Nu este sensibil la duplicarea atributelor, dar este sensibil la duplicarea instanțelor.
- Cu $k$ clase eroarea la antrenare este cel mult $\frac{k-1}{k}$ (la două clase cel mult $\frac12$).
- Adâncimea este cel mult $M$ (un atribut o dată pe drum). Frunzele sunt cel mult $\min(R,V)$, unde $V$ este produsul numerelor de valori ale atributelor.
- Orice funcție booleană se poate reprezenta (spațiul ipotezelor este complet), iar biasul este de căutare: arbori scurți, câștig mare lângă rădăcină.
- Este „eager": arborele se construiește o dată, apoi clasificarea doar parcurge un drum.

**Capcana:** spui „ID3 e optimal" sau „ID3 e sensibil la atribute duplicate" (ambele false) sau accepți o eroare la antrenare de $55\%$ pe două clase (imposibil, maximul este $50\%$).

**Încearcă tu:**

Problema 1: 100 de exemple și trei atribute categoriale cu $3$, $2$ și $2$ valori. Câte frunze are cel mult arborele ID3 și ce adâncime maximă?

<details><summary>Răspuns</summary>

1. Un atribut apare o dată pe drum, deci un drum are cel mult 3 teste: adâncimea este cel mult $3$.
2. Numărul de combinații de valori: $3\cdot2\cdot2=12$. Fiecare frunză are cel puțin un exemplu, deci frunze $\le\min(100,12)=12$.

</details>

Problema 2: 5 exemple și aceleași trei atribute, cu $3$, $2$ și $2$ valori. Câte frunze are cel mult arborele?

<details><summary>Răspuns</summary>

1. Combinațiile posibile sunt tot $3\cdot2\cdot2=12$.
2. Dar fiecare frunză are cel puțin un exemplu și sunt doar 5 exemple, deci frunze $\le\min(5,12)=5$.
3. Aici limita este numărul de exemple, nu combinațiile.

</details>

Problema 3: adevărat sau fals?

- (a) Dacă dublezi o coloană (același atribut de două ori), arborele ID3 se schimbă.
- (b) Pe două clase, ID3 poate avea eroare la antrenare de $30\%$.
- (c) ID3 poate trasa o graniță oblică în plan.

<details><summary>Răspuns</summary>

1. (a) Fals. Copia are exact același câștig ca originalul, iar la egalitate alegi primul din tabel, deci arborele rămâne același (ID3 nu e sensibil la duplicarea atributelor).
2. (b) Adevărat, dacă datele sunt inconsistente. De exemplu 10 rânduri cu aceleași intrări, 7 cu $+$ și 3 cu $-$: frunza este $+$ și greșește 3 din 10. Limita este $50\%$, iar $30\%\le50\%$.
3. (c) Fals. Fiecare test compară un singur atribut cu un prag, deci granițele sunt doar verticale sau orizontale.

</details>
