# Partea 4: Clasificatori bayesieni

## Ipotezele ML și MAP

**Când vezi asta:** Ți se cere „ipoteza MAP", „ipoteza ML", „ce ipoteză e cea mai probabilă după ce vedem datele" sau „derivează forma folosită în calcule".

**Simboluri:**

- $h$ este o ipoteză, adică o explicație posibilă (de exemplu „moneda e măsluită").
- $D$ sunt datele pe care le-am văzut.
- $P(h)$ este priorul: cât de mult crezi în $h$ înainte să vezi datele.
- $P(D|h)$ este verosimilitatea: cât de probabile sunt datele dacă $h$ ar fi adevărată.
- $P(h|D)$ este posteriorul: cât crezi în $h$ după ce ai văzut datele.
- $\arg\max_h f(h)$ este ipoteza $h$ pentru care $f$ are cea mai mare valoare. Răspunsul este o ipoteză, nu un număr.
- Scorul unei ipoteze este $P(D|h)\cdot P(h)$, adică verosimilitatea înmulțită cu priorul.

**Exemplu:** Un sac are monede corecte (cap cu probabilitatea $0{,}5$) și măsluite (cap cu probabilitatea $0{,}9$). Scoți o monedă, o arunci o dată și pică cap. Ce fel de monedă e?

1. Ipotezele sunt C (corectă) și M (măsluită). Verosimilitățile: $P(\text{cap}|C)=0{,}5$ și $P(\text{cap}|M)=0{,}9$.
2. Cazul a: jumătate din monede sunt măsluite, deci $P(C)=0{,}5$ și $P(M)=0{,}5$.
3. Scorul lui C este $0{,}5\cdot0{,}5=0{,}25$. Scorul lui M este $0{,}9\cdot0{,}5=0{,}45$. Câștigă M.
4. Probabilitatea ca moneda să fie măsluită, știind că a picat cap, este scorul lui M împărțit la suma scorurilor: $P(M|\text{cap})=\frac{0{,}45}{0{,}45+0{,}25}=\frac{0{,}45}{0{,}70}=\frac{9}{14}\approx0{,}64$.
5. Cazul b: doar 1 monedă din 10 e măsluită, deci $P(M)=0{,}1$ și $P(C)=0{,}9$.
6. Scorul lui C este $0{,}5\cdot0{,}9=0{,}45$. Scorul lui M este $0{,}9\cdot0{,}1=0{,}09$. Acum câștigă C.
7. $P(M|\text{cap})=\frac{0{,}09}{0{,}09+0{,}45}=\frac{0{,}09}{0{,}54}=\frac{1}{6}$.
8. Ipoteza ML ignoră priorul și compară doar $P(\text{cap}|h)$: $0{,}9>0{,}5$, deci ML alege M în ambele cazuri. În cazul b, MAP și ML nu coincid.

**Regula:** Ipoteza MAP este cea cu produsul „verosimilitate înmulțită cu prior" cel mai mare, iar ipoteza ML ține cont doar de verosimilitate.

$$h_{MAP}=\arg\max_{h}P(h|D)$$

$$h_{MAP}=\arg\max_{h}P(D|h)\,P(h)$$

$$h_{ML}=\arg\max_{h}P(D|h)$$

Dacă toți priorii sunt egali, $h_{MAP}=h_{ML}$. Derivarea formei din calcule are trei pași:

1. Formula lui Bayes: $P(h|D)=\frac{P(D|h)\,P(h)}{P(D)}$.
2. $P(D)$ este același număr pozitiv pentru toate ipotezele, deoarece nu depinde de $h$.
3. Împărțirea tuturor valorilor la același număr pozitiv nu schimbă care valoare e cea mai mare, deci $\arg\max_h\frac{P(D|h)P(h)}{P(D)}=\arg\max_h P(D|h)P(h)$.

La clasificare derivarea e aceeași: clasa $v$ ține locul lui $h$, iar instanța $a_1,\dots,a_n$ ține locul lui $D$. Pe lucrare scrii lanțul de mai jos și notezi sub numitor „nu depinde de $v$, e pozitiv".

$$v_{MAP}=\arg\max_{v}P(v|a_1,\dots,a_n)$$

$$=\arg\max_{v}\frac{P(a_1,\dots,a_n|v)\,P(v)}{P(a_1,\dots,a_n)}$$

$$=\arg\max_{v}P(a_1,\dots,a_n|v)\,P(v)$$

Dacă datele sunt mai multe observații independente, $P(D|h)$ este produsul probabilităților lor. De exemplu, la moneda M și aruncările cap, cap, pajură: $0{,}9\cdot0{,}9\cdot0{,}1=0{,}081$.

**Capcana:** Pentru a alege ipoteza nu ai nevoie de $P(D)$, dar pentru a spune cât de probabilă e (cei $\frac{9}{14}$ de mai sus) ai nevoie: împarți scorul la suma scorurilor.

**Încearcă tu:**

Un test de cancer dă rezultat pozitiv în $98\%$ din cazurile cu cancer și în $3\%$ din cazurile fără cancer. Doar $0{,}8\%$ dintre oameni au cancer, iar un om are testul pozitiv. Care este $h_{MAP}$, care este $h_{ML}$ și cât este $P(\text{cancer}|+)$?

<details><summary>Răspuns</summary>

1. Scor cancer: $0{,}98\cdot0{,}008=0{,}00784$.
2. Scor fără cancer: $0{,}03\cdot0{,}992=0{,}02976$.
3. $h_{MAP}$ este „fără cancer", fiindcă $0{,}02976>0{,}00784$.
4. $h_{ML}$ este „cancer", fiindcă $0{,}98>0{,}03$. Aici MAP și ML dau răspunsuri diferite, pentru că priorul e foarte mic.
5. $P(\text{cancer}|+)=\frac{0{,}00784}{0{,}00784+0{,}02976}=\frac{0{,}00784}{0{,}0376}=\frac{49}{235}\approx0{,}21$.

</details>

O urnă are două feluri de zaruri, $h_1$ și $h_2$, la fel de multe din fiecare. Datele $D$ au $P(D|h_1)=0{,}3$ și $P(D|h_2)=0{,}1$. Care este $h_{MAP}$ și cât este $P(h_1|D)$?

<details><summary>Răspuns</summary>

1. Priorii sunt egali ($0{,}5$ și $0{,}5$), deci $h_{MAP}=h_{ML}$.
2. Scor $h_1$: $0{,}3\cdot0{,}5=0{,}15$. Scor $h_2$: $0{,}1\cdot0{,}5=0{,}05$.
3. $h_{MAP}=h_1$.
4. $P(h_1|D)=\frac{0{,}15}{0{,}15+0{,}05}=\frac{0{,}15}{0{,}20}=\frac{3}{4}$.

</details>

## Bayes Naiv: ipoteza de independență condiționată

**Când vezi asta:** Ți se cere „definește ipoteza de independență condiționată din Bayes Naiv", „scrie formula Bayes Naiv" sau „ce presupune Bayes Naiv".

**Simboluri:**

- $a_1,\dots,a_n$ sunt valorile atributelor unei instanțe (de exemplu $x=0,\ y=1,\ z=0$).
- $v$ este clasa (eticheta) pe care vrem s-o prezicem.
- $P(a_i|v)$ este probabilitatea ca atributul $i$ să aibă valoarea $a_i$ când clasa e $v$. Se estimează prin numărare: câte rânduri ale clasei $v$ au acea valoare, împărțit la câte rânduri are clasa.
- $\prod_i$ înseamnă „înmulțește toți factorii, pentru $i=1,\dots,n$".
- Independente condiționat de clasă: dacă știi clasa, valoarea unui atribut nu-ți mai spune nimic despre valoarea altuia. În formulă: $P(a_1,a_2|v)=P(a_1|v)\,P(a_2|v)$.

**Exemplu:** Șapte rânduri cu atributele $x,y,z$ și clasa $U$. Instanța de clasificat este $(x=0,\ y=1,\ z=0)$.

| x | y | z | U |
|---|---|---|---|
| 1 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 0 | 0 | 1 | 0 |
| 1 | 0 | 0 | 1 |
| 0 | 0 | 1 | 1 |
| 0 | 1 | 0 | 1 |
| 1 | 1 | 0 | 1 |

1. Fără presupunere ar trebui $P(x{=}0,y{=}1,z{=}0\,|\,U)$, adică rânduri identice cu instanța. Există un singur astfel de rând (al șaselea), cu $U=1$. Bayes Comun ar da $P(x{=}0,y{=}1,z{=}0|U{=}0)=\frac{0}{3}=0$ și $P(x{=}0,y{=}1,z{=}0|U{=}1)=\frac{1}{4}$, adică ar decide pe baza unui singur rând.
2. Bayes Naiv presupune că atributele sunt independente când știm clasa, deci desparte probabilitatea în factori: $P(x,y,z|U)=P(x|U)\,P(y|U)\,P(z|U)$.
3. Priorii: 3 rânduri au $U=0$ și 4 au $U=1$, deci $P(U{=}0)=\frac{3}{7}$ și $P(U{=}1)=\frac{4}{7}$.
4. Clasa $U=0$ are 3 rânduri. Factorii: $P(x{=}0|U{=}0)=\frac{2}{3}$, $P(y{=}1|U{=}0)=\frac{1}{3}$, $P(z{=}0|U{=}0)=\frac{1}{3}$.
5. Clasa $U=1$ are 4 rânduri. Factorii: $P(x{=}0|U{=}1)=\frac{2}{4}$, $P(y{=}1|U{=}1)=\frac{2}{4}$, $P(z{=}0|U{=}1)=\frac{3}{4}$.
6. Scorul clasei $U=0$: $\frac{3}{7}\cdot\frac{2}{3}\cdot\frac{1}{3}\cdot\frac{1}{3}=\frac{6}{189}=\frac{2}{63}$.
7. Fiecare factor se sprijină acum pe toate rândurile clasei (3 sau 4), nu pe un singur rând. Scorul lui $U=1$ și decizia sunt la cardul următor.

**Regula:** Bayes Naiv presupune că atributele sunt independente între ele doar după ce știm clasa, iar asta transformă probabilitatea comună într-un produs de probabilități mici.

$$P(a_1,\dots,a_n|v)=\prod_i P(a_i|v)$$

$$v_{NB}=\arg\max_{v}\;P(v)\prod_i P(a_i|v)$$

**Capcana:** Nu spune „atributele sunt independente între ele". Ipoteza este independența **condiționată de clasă**: independente când clasa e cunoscută, nu în general.

**Încearcă tu:**

Printre rândurile unei clase, perechile $(A,B)$ sunt $(0,0),(0,1),(1,0),(1,1)$. Sunt $A$ și $B$ independente condiționat de această clasă? Verifică cu $P(A{=}1,B{=}1)$.

<details><summary>Răspuns</summary>

1. $P(A{=}1,B{=}1)=\frac{1}{4}$ (un rând din patru).
2. $P(A{=}1)=\frac{2}{4}=\frac{1}{2}$ și $P(B{=}1)=\frac{2}{4}=\frac{1}{2}$.
3. Produsul: $\frac{1}{2}\cdot\frac{1}{2}=\frac{1}{4}$.
4. $\frac{1}{4}=\frac{1}{4}$, deci sunt independente. Bayes Naiv estimează corect aici.

</details>

Printre rândurile unei alte clase, perechile $(A,B)$ sunt $(0,0),(0,0),(1,1),(1,1)$. Sunt $A$ și $B$ independente condiționat de clasă? Ce ar estima Bayes Naiv pentru $P(A{=}1,B{=}1)$?

<details><summary>Răspuns</summary>

1. $P(A{=}1,B{=}1)=\frac{2}{4}=\frac{1}{2}$ (două rânduri din patru).
2. $P(A{=}1)=\frac{2}{4}=\frac{1}{2}$ și $P(B{=}1)=\frac{2}{4}=\frac{1}{2}$, deci produsul este $\frac{1}{4}$.
3. $\frac{1}{2}\neq\frac{1}{4}$, deci **nu** sunt independente: $A$ și $B$ sunt mereu egale.
4. Bayes Naiv ar estima $\frac{1}{4}$ în loc de adevăratul $\frac{1}{2}$. Presupunerea e încălcată.

</details>

## Eticheta prezisă și probabilitatea ei

**Când vezi asta:** „Ce clasă prezice Bayes Naiv pentru instanța...?" sau „cât este $P(\text{clasa}\,|\,\text{instanță})$?". Vezi un tabel de antrenare și o instanță de test.

**Simboluri:**

- Scorul unei clase este $P(v)\prod_i P(a_i|v)$. Nu este o probabilitate, deoarece scorurile claselor nu însumează 1.
- Eticheta prezisă este clasa cu scorul cel mai mare.
- Probabilitatea clasei este scorul ei împărțit la suma scorurilor tuturor claselor (asta se numește normalizare).
- $\sum_k$ înseamnă „adună termenul pentru fiecare clasă $k$".

**Exemplu:** Tabelul cu 7 rânduri și instanța $(x=0,\ y=1,\ z=0)$ de la cardul anterior. Acolo am numărat: $U=0$ are 3 rânduri, cu factorii $\frac{2}{3},\frac{1}{3},\frac{1}{3}$; $U=1$ are 4 rânduri, cu factorii $\frac{2}{4},\frac{2}{4},\frac{3}{4}$.

1. Scorul lui $U=0$: $\frac{3}{7}\cdot\frac{2}{3}\cdot\frac{1}{3}\cdot\frac{1}{3}=\frac{2}{63}$. Scorul lui $U=1$: $\frac{4}{7}\cdot\frac{2}{4}\cdot\frac{2}{4}\cdot\frac{3}{4}=\frac{48}{448}=\frac{3}{28}$.
2. Comparăm: $\frac{2}{63}\approx0{,}0317$ și $\frac{3}{28}\approx0{,}1071$. Scorul clasei $U=1$ este mai mare, deci eticheta prezisă este $U=1$.
3. Suma scorurilor, cu numitor comun 252: $\frac{2}{63}+\frac{3}{28}=\frac{8}{252}+\frac{27}{252}=\frac{35}{252}$.
4. $P(U{=}0|\text{instanță})=\frac{8/252}{35/252}=\frac{8}{35}\approx0{,}229$.
5. $P(U{=}1|\text{instanță})=\frac{27}{35}\approx0{,}771$. Cele două probabilități însumează 1, ca la orice normalizare.
6. Dacă enunțul cere Bayes Comun, numeri rândurile identice cu instanța. Scorul lui $U=0$: $\frac{3}{7}\cdot\frac{0}{3}=0$. Scorul lui $U=1$: $\frac{4}{7}\cdot\frac{1}{4}=\frac{1}{7}$. Bayes Comun prezice tot $U=1$, cu probabilitatea $\frac{1/7}{0+1/7}=1$.

**Regula:** Prezici clasa cu scorul cel mai mare, iar probabilitatea ei este scorul ei împărțit la suma scorurilor tuturor claselor.

$$\text{scor}(v)=P(v)\prod_i P(a_i|v)$$

$$P(v_j|a_1,\dots,a_n)=\frac{\text{scor}(v_j)}{\sum_{k}\text{scor}(v_k)}$$

**Capcana:** Scorul $\frac{3}{28}$ nu este probabilitatea ($\frac{27}{35}$). Probabilitatea cere împărțirea la suma scorurilor. Nici priorul $\frac{4}{7}$ nu este răspunsul.

**Încearcă tu:**

Șase rânduri $(A,B,Y)$: $(0,0,0)$, $(0,1,0)$, $(1,0,0)$, $(1,0,1)$, $(0,1,1)$, $(1,0,1)$. Clasifică instanța $(A{=}1,B{=}1)$ cu Bayes Naiv și spune cât este $P(Y{=}1|A{=}1,B{=}1)$.

<details><summary>Răspuns</summary>

1. Fiecare clasă are 3 rânduri, deci $P(Y{=}0)=P(Y{=}1)=\frac{1}{2}$.
2. Clasa 0: $P(A{=}1|0)=\frac{1}{3}$ (doar rândul $(1,0,0)$) și $P(B{=}1|0)=\frac{1}{3}$ (doar $(0,1,0)$). Scor: $\frac{1}{2}\cdot\frac{1}{3}\cdot\frac{1}{3}=\frac{1}{18}$.
3. Clasa 1: $P(A{=}1|1)=\frac{2}{3}$ și $P(B{=}1|1)=\frac{1}{3}$. Scor: $\frac{1}{2}\cdot\frac{2}{3}\cdot\frac{1}{3}=\frac{1}{9}$.
4. Eticheta prezisă este $Y=1$, deoarece $\frac{1}{9}>\frac{1}{18}$.
5. Suma: $\frac{1}{18}+\frac{1}{9}=\frac{1}{18}+\frac{2}{18}=\frac{3}{18}=\frac{1}{6}$.
6. $P(Y{=}1|A{=}1,B{=}1)=\frac{1/9}{1/6}=\frac{2}{3}$.

</details>

Șase rânduri $(X,Z,C)$: $(1,1,0)$, $(1,0,0)$, $(0,1,0)$, $(1,1,1)$, $(0,0,1)$, $(1,0,1)$. Clasifică instanța $(X{=}1,Z{=}1)$ cu Bayes Naiv și spune cât este $P(C{=}0|X{=}1,Z{=}1)$. Ce prezice Bayes Comun?

<details><summary>Răspuns</summary>

1. Fiecare clasă are 3 rânduri, deci priorii sunt $\frac{1}{2}$ și $\frac{1}{2}$.
2. Clasa 0: $P(X{=}1|0)=\frac{2}{3}$ și $P(Z{=}1|0)=\frac{2}{3}$. Scor: $\frac{1}{2}\cdot\frac{2}{3}\cdot\frac{2}{3}=\frac{2}{9}$.
3. Clasa 1: $P(X{=}1|1)=\frac{2}{3}$ și $P(Z{=}1|1)=\frac{1}{3}$. Scor: $\frac{1}{2}\cdot\frac{2}{3}\cdot\frac{1}{3}=\frac{1}{9}$.
4. De data aceasta câștigă clasa 0, deoarece $\frac{2}{9}>\frac{1}{9}$.
5. Suma: $\frac{2}{9}+\frac{1}{9}=\frac{3}{9}=\frac{1}{3}$.
6. $P(C{=}0|X{=}1,Z{=}1)=\frac{2/9}{1/3}=\frac{2}{3}$.
7. Bayes Comun: rândul $(1,1)$ apare o dată în clasa 0 și o dată în clasa 1. Scorurile sunt $\frac{1}{2}\cdot\frac{1}{3}=\frac{1}{6}$ și $\frac{1}{2}\cdot\frac{1}{3}=\frac{1}{6}$, egale, deci fiecare clasă are probabilitatea $\frac{1}{2}$. Cei doi algoritmi pot da răspunsuri diferite.

</details>

## Probabilitate 0 și netezirea Laplace

**Când vezi asta:** O valoare de atribut nu apare niciodată împreună cu o clasă în datele de antrenare, scorurile ies 0, probabilitatea ar fi $\frac{0}{0}$, sau enunțul cere „aplică regula add-one / netezirea Laplace".

**Simboluri:**

- $\#(\dots)$ înseamnă „câte rânduri au...".
- $|Val(A)|$ este numărul de valori posibile ale atributului $A$ (nu câte au apărut, ci câte există).
- Netezire: ca și cum am fi adăugat câte un rând „virtual" pentru fiecare valoare posibilă.
- $\hat P$ („P cu căciulă") este o probabilitate estimată din date. Regula add-one și netezirea Laplace sunt același lucru.

**Exemplu:** Cinci rânduri $(A,B,Y)$, cu $A\in\{0,1,2\}$, $B\in\{0,1\}$, $Y\in\{0,1,2\}$: $(1,0,0)$, $(1,1,1)$, $(0,1,1)$, $(1,1,2)$, $(2,1,2)$. Instanța este $(A{=}0,\ B{=}0)$.

1. Fără netezire, clasa 0 are un singur rând, cu $A=1,\ B=0$, deci $P(A{=}0|Y{=}0)=\frac{0}{1}=0$. Clasa 1 are $P(B{=}0|Y{=}1)=0$, iar clasa 2 are $P(A{=}0|Y{=}2)=0$.
2. Toate cele trei scoruri sunt 0, deci $P(Y{=}1|\dots)=\frac{0}{0+0+0}$ este nedefinită. Nu putem nici decide, nici da probabilitatea.
3. Priorii rămân frecvențe: $P(Y{=}0)=\frac{1}{5}$, $P(Y{=}1)=\frac{2}{5}$, $P(Y{=}2)=\frac{2}{5}$.
4. Cu netezire, la numitor aduni $+3$ pentru $A$ (are 3 valori posibile) și $+2$ pentru $B$ (are 2). Clasa 0 (1 rând): $P(A{=}0|0)=\frac{0+1}{1+3}=\frac{1}{4}$ și $P(B{=}0|0)=\frac{1+1}{1+2}=\frac{2}{3}$.
5. Clasa 1 (2 rânduri): $P(A{=}0|1)=\frac{1+1}{2+3}=\frac{2}{5}$ și $P(B{=}0|1)=\frac{0+1}{2+2}=\frac{1}{4}$.
6. Clasa 2 (2 rânduri): $P(A{=}0|2)=\frac{0+1}{2+3}=\frac{1}{5}$ și $P(B{=}0|2)=\frac{0+1}{2+2}=\frac{1}{4}$.
7. Scoruri: $\frac{1}{5}\cdot\frac{1}{4}\cdot\frac{2}{3}=\frac{1}{30}$, apoi $\frac{2}{5}\cdot\frac{2}{5}\cdot\frac{1}{4}=\frac{1}{25}$, apoi $\frac{2}{5}\cdot\frac{1}{5}\cdot\frac{1}{4}=\frac{1}{50}$.
8. Cu numitor comun 150 sunt $\frac{5}{150}$, $\frac{6}{150}$, $\frac{3}{150}$, cu suma $\frac{14}{150}$. Câștigă $Y=1$, cu $P(Y{=}1|\dots)=\frac{6}{14}=\frac{3}{7}\approx0{,}43$.

**Regula:** La numărător adaugi 1, iar la numitor adaugi numărul de valori posibile ale atributului, ca probabilitățile tuturor valorilor să însumeze tot 1.

$$\hat P(A{=}a\,|\,v)=\frac{\#(A{=}a,\ v)+1}{\#(v)+|Val(A)|}$$

Pentru atribute binare numitorul primește $+2$. Priorii $P(v)$ rămân frecvențe relative, dacă enunțul nu spune altfel. Un atribut „prezent/absent" contribuie mereu: dacă cuvântul lipsește din email, factorul este $1-P(\text{prezent}|v)$.

**Capcana:** La numitor nu aduni 1, ci numărul de valori posibile $|Val(A)|$: cu 4 rânduri și 3 valori, corect este $\frac{0+1}{4+3}=\frac{1}{7}$, nu $\frac{0+1}{4+1}$ și nici $\frac{0+1}{4}$. Netezești doar factorii $P(a_i|v)$, nu priorii.

**Încearcă tu:**

Clasa $Y=1$ are 4 rânduri, iar $A$ are 3 valori posibile. Valoarea $A=2$ nu apare niciodată cu $Y=1$. Cât este $\hat P(A{=}2|Y{=}1)$ cu regula add-one?

<details><summary>Răspuns</summary>

1. $\#(A{=}2,Y{=}1)=0$ și $\#(Y{=}1)=4$, iar $|Val(A)|=3$.
2. $\hat P=\frac{0+1}{4+3}=\frac{1}{7}$.

</details>

Un filtru de spam folosește ca atribute doar cuvintele `bonus` și `free` și a învățat din 10 emailuri spam și 10 normale (priori $\frac{1}{2}$ și $\frac{1}{2}$). Cuvântul `bonus` apare în 0 emailuri spam și în 2 normale, iar `free` în 8 spam și în 1 normal. Un email conține ambele cuvinte: ce clasă prezice filtrul fără netezire, ce clasă cu add-one și cât este $P(\text{spam}|\text{email})$ cu netezire?

<details><summary>Răspuns</summary>

1. Fără netezire, spam: $P(\text{bonus}|\text{spam})=0$, deci scorul este $0$.
2. Fără netezire, normal: $\frac{1}{2}\cdot\frac{2}{10}\cdot\frac{1}{10}=\frac{1}{100}$. Filtrul prezice „normal".
3. Cu netezire (atribut binar, deci $+2$), spam: $P(\text{bonus}|\text{spam})=\frac{0+1}{10+2}=\frac{1}{12}$ și $P(\text{free}|\text{spam})=\frac{8+1}{10+2}=\frac{9}{12}$. Scor: $\frac{1}{2}\cdot\frac{1}{12}\cdot\frac{9}{12}=\frac{9}{288}=\frac{1}{32}$.
4. Cu netezire, normal: $P(\text{bonus}|\text{normal})=\frac{2+1}{10+2}=\frac{3}{12}$ și $P(\text{free}|\text{normal})=\frac{1+1}{10+2}=\frac{2}{12}$. Scor: $\frac{1}{2}\cdot\frac{3}{12}\cdot\frac{2}{12}=\frac{6}{288}=\frac{1}{48}$.
5. Acum câștigă „spam", deoarece $\frac{1}{32}>\frac{1}{48}$: netezirea a schimbat decizia.
6. Suma: $\frac{1}{32}+\frac{1}{48}=\frac{3}{96}+\frac{2}{96}=\frac{5}{96}$. $P(\text{spam}|\text{email})=\frac{3/96}{5/96}=\frac{3}{5}$.

</details>

## Câte probabilități trebuie estimate: Bayes Naiv și Bayes Comun

**Când vezi asta:** „Ce probabilități trebuie calculate ca să aplici algoritmul?" sau „câți parametri/probabilități are Bayes Naiv, respectiv Bayes Comun (Optimal), pentru $n$ atribute?".

**Simboluri:**

- Bayes Comun (numit și Bayes Optimal sau Joint Bayes) estimează direct $P(a_1,\dots,a_n|v)$, adică probabilitatea fiecărei combinații de valori, pentru fiecare clasă. Nu presupune nimic.
- Parametru liber: o probabilitate care nu se poate deduce din celelalte. Dacă ai $P(x)$, atunci $P(\neg x)=1-P(x)$ nu se mai numără.
- $K$ este numărul de clase, iar $n$ este numărul de atribute.
- $|Val(A_i)|$ este numărul de valori posibile ale atributului $A_i$ (2 pentru un atribut binar).

**Exemplu:** Cazul $n=4$ atribute binare și o clasă binară.

1. Ce estimează Bayes Naiv: priorul $P(v)$ și câte un $P(a_i|v)$ pentru fiecare atribut și fiecare clasă.
2. Priorul: o singură valoare liberă, $P(v{=}1)$, deoarece cealaltă este $1-P(v{=}1)$.
3. Pentru fiecare dintre cele 2 clase, câte un $P(a_i{=}1|v)$ pentru fiecare dintre cele 4 atribute: $2\cdot4=8$.
4. Total Bayes Naiv: $8+1=9=2n+1$.
5. Bayes Comun, pentru fiecare clasă: $2^4=16$ combinații de valori, din care $16-1=15$ sunt libere (ultima se deduce din suma 1).
6. Două clase dau $2\cdot15=30$, plus priorul, deci $30+1=31=2^{n+1}-1$.

Când atributele au mai multe valori: atributul $A$ cu 3 valori, $B$ cu 2 valori, clasa $Y$ cu 3 valori.

1. Priorul: $3-1=2$.
2. Bayes Naiv, pe clasă: $A$ dă $3-1=2$ și $B$ dă $2-1=1$, deci 3 pe clasă. Pentru 3 clase: $3\cdot3=9$. Total: $2+9=11$.
3. Bayes Comun, pe clasă: $3\cdot2=6$ combinații, deci $6-1=5$ libere. Pentru 3 clase: $3\cdot5=15$. Total: $2+15=17$.

Ce calculezi efectiv pentru o instanță: datele cu 5 rânduri de la cardul cu netezirea ($Y$ cu 3 clase) și instanța $(A{=}0,\ B{=}0)$.

1. Bayes Naiv: cei 3 priori $P(Y{=}k)$, cele 3 valori $P(A{=}0|Y{=}k)$ și cele 3 valori $P(B{=}0|Y{=}k)$, pentru $k=0,1,2$. În total $3+3+3=9$ numere.
2. Bayes Comun: cei 3 priori și cele 3 valori $P(A{=}0,B{=}0|Y{=}k)$. În total $3+3=6$ numere, dar fiecare stă doar pe rândurile identice cu instanța.

**Regula:** Bayes Naiv numără câte o probabilitate pe atribut și pe clasă (creștere liniară), iar Bayes Comun numără câte una pe fiecare combinație de valori și pe clasă (creștere exponențială).

Pentru $n$ atribute binare și clasă binară:

$$\text{NB}=2n+1\qquad \text{BC}=2^{n+1}-1$$

În general, cu $K$ clase și atribute cu oricâte valori, notăm $V_i=|Val(A_i)|$:

$$\text{NB}=(K-1)+K\sum_i(V_i-1)$$

$$\text{BC}=(K-1)+K\Big(\prod_i V_i-1\Big)$$

Ca să aplici Bayes Naiv pe o instanță ai nevoie de priorii $P(v)$ și de factorii $P(a_i|v)$, unde $a_i$ sunt valorile din instanță.

**Capcana:** Răspunsul standard este numărul de parametri liberi: nu număra probabilitățile care se deduc din suma 1 și nu uita priorul. Numeri și complementele doar dacă enunțul cere explicit „toate probabilitățile": la exemplul cu $A$, $B$, $Y$ ar ieși $3+3\cdot(3+2)=18$ în loc de 11.

**Încearcă tu:**

Câți parametri liberi au Bayes Naiv și Bayes Comun pentru $n=5$ atribute binare și clasă binară?

<details><summary>Răspuns</summary>

1. Bayes Naiv: $2\cdot5+1=11$.
2. Bayes Comun: $2^{5+1}-1=64-1=63$.
3. Verificare pe clasă: $2^5-1=31$, deci $2\cdot31+1=63$.

</details>

Atributul $A$ are 4 valori, $B$ are 3 valori, $C$ are 2 valori, iar clasa are $K=2$ valori. Câți parametri liberi are fiecare algoritm?

<details><summary>Răspuns</summary>

1. Priorul: $K-1=1$.
2. Bayes Naiv, pe clasă: $(4-1)+(3-1)+(2-1)=3+2+1=6$. Pentru 2 clase: $2\cdot6=12$. Total: $1+12=13$.
3. Bayes Comun, pe clasă: $4\cdot3\cdot2=24$ combinații, deci $24-1=23$ libere. Pentru 2 clase: $2\cdot23=46$. Total: $1+46=47$.
4. Bayes Comun cere de peste 3 ori mai mult decât Bayes Naiv ($47$ față de $13$), iar diferența crește exponențial cu numărul de atribute.

</details>

## Avantaje și dezavantaje: Bayes Naiv și Bayes Comun (Optimal)

**Când vezi asta:** „Care sunt avantajele și dezavantajele lui Bayes Optimal / Bayes Naiv?", „de ce nu folosim mereu Bayes Comun?" sau „ce se întâmplă cu Bayes Naiv pe xor / cu atribute duplicate?".

**Simboluri:**

- Date consistente: nicio instanță nu apare cu două clase diferite.
- Eroare la antrenare: procentul de rânduri de antrenare clasificate greșit.
- Eroarea votului majoritar: când aceeași instanță apare cu clase diferite, orice clasificator alege una singură, deci greșește la celelalte rânduri.
- xor: $Y=X_1\oplus X_2$, adică $Y=1$ exact când $X_1$ și $X_2$ sunt diferite.

**Exemplu:** Date xor: patru rânduri $(X_1,X_2,Y)$: $(0,0,0)$, $(0,1,1)$, $(1,0,1)$, $(1,1,0)$. Clasificăm $(X_1{=}1,X_2{=}1)$.

1. Bayes Naiv: priorii $P(Y{=}0)=P(Y{=}1)=\frac{2}{4}=\frac{1}{2}$.
2. Clasa 0 are rândurile $(0,0)$ și $(1,1)$, deci $P(X_1{=}1|0)=\frac{1}{2}$ și $P(X_2{=}1|0)=\frac{1}{2}$. Scor: $\frac{1}{2}\cdot\frac{1}{2}\cdot\frac{1}{2}=\frac{1}{8}$.
3. Clasa 1 are rândurile $(0,1)$ și $(1,0)$, deci $P(X_1{=}1|1)=\frac{1}{2}$ și $P(X_2{=}1|1)=\frac{1}{2}$. Scor: $\frac{1}{8}$.
4. Scorurile sunt egale, la orice instanță. Oricare clasă ar alege mereu, Bayes Naiv greșește la 2 din 4 rânduri, adică $50\%$.
5. Bayes Comun caută rândul exact $(1,1)$ și găsește clasa 0, deci clasifică corect toate cele 4 rânduri: eroare $0$.

**Regula:** Bayes Comun (Optimal) are cea mai mică eroare posibilă, dar cere exponențial de mulți parametri și exemple, iar Bayes Naiv e ieftin, dar plătește cu presupunerea de independență condiționată.

**Bayes Naiv.** Avantaje:

- puțini parametri: $2n+1$, liniar în $n$;
- antrenarea e o singură trecere de numărare, fără căutare;
- cere puține exemple (cresc logaritmic cu $n$), fiindcă fiecare factor se sprijină pe toate rândurile clasei;
- dă un scor și pentru o combinație de valori nevăzută la antrenare.

Dezavantaje:

- erori din două surse: votul majoritar și presupunerea de independență condiționată;
- pe date consistente nu garantează eroarea 0 (xor: $50\%$);
- un atribut duplicat îi poate scădea acuratețea, fiindcă socotește aceeași dovadă de două ori;
- e sensibil la exemple duplicate.

**Bayes Comun (Optimal).** Avantaje:

- nu presupune nimic, deci singura sursă de eroare e votul majoritar;
- pe date consistente are eroarea 0;
- nu e afectat de atribute duplicate.

Dezavantaje:

- $2^{n+1}-1$ parametri, exponențial în $n$, și la fel de multe exemple necesare;
- la o combinație nevăzută la antrenare toate scorurile sunt 0 și nu poate decide;
- e sensibil la exemple duplicate.

Când independența condiționată e adevărată, cei doi iau aceleași decizii.

Pe scurt: fiecare număr al lui Bayes Naiv se sprijină pe toate rândurile clasei, dar probabilitățile lui pot ieși greșite chiar când decizia e corectă. Bayes Naiv merge adesea bine chiar când presupunerea e încălcată, atâta timp cât $\arg\max$ iese la fel.

**Capcana:** „Optimal" nu înseamnă „cel mai bun în practică". Bayes Comun are eroare minimă doar dacă are destule exemple pentru fiecare combinație, iar altfel cade pe combinații nevăzute.

**Încearcă tu:**

Date: $P(Y{=}1)=0{,}7$, $P(X{=}1|Y{=}1)=0{,}4$, $P(X{=}1|Y{=}0)=0{,}7$, iar instanța are $X=1$. Ce clasă prezice Bayes Naiv, și ce prezice dacă atributul $X$ este adăugat a doua oară (o copie $X'$ cu aceeași valoare)? Ce prezice Bayes Comun în cele două cazuri?

<details><summary>Răspuns</summary>

1. Cu un atribut: clasa 1 are $0{,}7\cdot0{,}4=0{,}28$, iar clasa 0 are $0{,}3\cdot0{,}7=0{,}21$. Bayes Naiv prezice clasa 1.
2. Cu copia, clasa 1 are $0{,}7\cdot0{,}4\cdot0{,}4=0{,}112$, iar clasa 0 are $0{,}3\cdot0{,}7\cdot0{,}7=0{,}147$. Bayes Naiv prezice acum clasa 0: duplicarea l-a făcut să socotească dovada de două ori și a schimbat decizia.
3. Bayes Comun folosește $P(X,X'|Y)$, care nu se schimbă prin copiere, deci prezice clasa 1 în ambele cazuri.

</details>

Un Bayes Naiv a fost antrenat pe date infinite din distribuția: $P(Y{=}0)=0{,}6$, $P(Y{=}1)=0{,}4$, $P(X_1{=}0|Y{=}0)=0{,}8$, $P(X_1{=}0|Y{=}1)=0{,}3$. Există un singur atribut. Care este rata medie a erorii lui și cea a lui Bayes Comun?

<details><summary>Răspuns</summary>

1. Celulele comune $P(X_1,Y)$: $(0,0)$: $0{,}6\cdot0{,}8=0{,}48$. $(0,1)$: $0{,}4\cdot0{,}3=0{,}12$. $(1,0)$: $0{,}6\cdot0{,}2=0{,}12$. $(1,1)$: $0{,}4\cdot0{,}7=0{,}28$.
2. Pentru $X_1=0$ alege $Y=0$ ($0{,}48>0{,}12$), iar pentru $X_1=1$ alege $Y=1$ ($0{,}28>0{,}12$).
3. Greșește în celulele $(0,1)$ și $(1,0)$: $0{,}12+0{,}12=0{,}24$.
4. Cu un singur atribut nu există nimic de factorizat, deci Bayes Comun face aceleași alegeri și are aceeași eroare, $0{,}24$. Aici Bayes Naiv nu pierde nimic.

</details>

## Date nebalansate și priori predefiniți

**Când vezi asta:** O clasă e mult mai rară decât alta în datele de antrenare, sau proporțiile din date nu sunt cele reale, sau erorile costă diferit. Enunțul spune „priori predefiniți" ori cere „ce prior schimbă decizia".

**Simboluri:**

- Set nebalansat: o clasă are mult mai puține rânduri decât cealaltă (de exemplu 5 din 100).
- Prior învățat: frecvența relativă a clasei în datele de antrenare.
- Prior predefinit: o valoare $P(v)$ aleasă de tine (proporțiile reale, egali sau după cost), în locul celei din date.

**Exemplu:** 5 exemple pozitive și 95 negative. Bayes Naiv a învățat $P(A{=}1|+)=0{,}8$ și $P(A{=}1|-)=0{,}1$. Instanța are $A=1$.

1. Priorii învățați: $P(+)=\frac{5}{100}=0{,}05$ și $P(-)=\frac{95}{100}=0{,}95$.
2. Scorurile: $+$: $0{,}05\cdot0{,}8=0{,}04$. $-$: $0{,}95\cdot0{,}1=0{,}095$. Prezice $-$.
3. $P(+|A{=}1)=\frac{0{,}04}{0{,}04+0{,}095}=\frac{8}{27}\approx0{,}30$.
4. În realitate clasele sunt la fel de frecvente, deci fixăm priorii $0{,}5$ și $0{,}5$ și păstrăm factorii învățați.
5. Scorurile: $+$: $0{,}5\cdot0{,}8=0{,}4$. $-$: $0{,}5\cdot0{,}1=0{,}05$. Acum prezice $+$.
6. $P(+|A{=}1)=\frac{0{,}4}{0{,}4+0{,}05}=\frac{8}{9}\approx0{,}89$.
7. Priorul $p=P(+)$ la care decizia se schimbă: $p\cdot0{,}8=(1-p)\cdot0{,}1$, adică $0{,}8\,p=0{,}1-0{,}1\,p$, deci $0{,}9\,p=0{,}1$ și $p=\frac{1}{9}\approx0{,}11$. Sub $\frac{1}{9}$ prezice $-$, peste $\frac{1}{9}$ prezice $+$.

**Regula:** Priorul învățat trage decizia spre clasa frecventă, deci când setul e nebalansat înlocuiești doar priorii cu unii aleși de tine și păstrezi factorii învățați.

$$v=\arg\max_{v}\;P_{\text{ales}}(v)\prod_i\hat P(a_i|v)$$

$$p^{*}=\frac{F_2}{F_1+F_2}$$

Aici $F_1$ este produsul factorilor clasei pentru care cauți priorul, iar $F_2$ al celeilalte clase. Scorurile sunt egale când $p\cdot F_1=(1-p)\cdot F_2$, de unde $p^{*}$; acolo probabilitatea fiecărei clase este $\frac{1}{2}$.

**Capcana:** Nu recalcula factorii $P(a_i|v)$ când schimbi priorii: ei rămân cei din date. Se schimbă doar $P(v)$.

**Încearcă tu:**

Un filtru de spam are, pentru un email, produsul factorilor $0{,}12$ pentru spam și $0{,}04$ pentru normal, iar priorii învățați sunt $0{,}2$ (spam) și $0{,}8$ (normal). Ce clasă prezice și cât este $P(\text{spam}|\text{email})$? Ce prezice cu priorii $0{,}5$ și $0{,}5$, și la ce prior al lui spam se schimbă decizia?

<details><summary>Răspuns</summary>

1. Cu priorii învățați: spam $0{,}2\cdot0{,}12=0{,}024$, normal $0{,}8\cdot0{,}04=0{,}032$. Prezice „normal".
2. $P(\text{spam})=\frac{0{,}024}{0{,}024+0{,}032}=\frac{0{,}024}{0{,}056}=\frac{3}{7}$.
3. Cu priori $0{,}5$: spam $0{,}5\cdot0{,}12=0{,}06$, normal $0{,}5\cdot0{,}04=0{,}02$. Prezice „spam", cu $P(\text{spam})=\frac{0{,}06}{0{,}08}=\frac{3}{4}$.
4. Pragul, cu $F_1=0{,}12$ (spam) și $F_2=0{,}04$ (normal): $p^{*}=\frac{F_2}{F_1+F_2}=\frac{0{,}04}{0{,}12+0{,}04}=\frac{0{,}04}{0{,}16}=\frac{1}{4}$. Verificare: $\frac{1}{4}\cdot0{,}12=0{,}03$ și $\frac{3}{4}\cdot0{,}04=0{,}03$.

</details>

Un set de antrenare are 90 de emailuri spam și 10 normale (priori învățați $0{,}9$ și $0{,}1$), iar pentru un email produsul factorilor este $0{,}02$ pentru spam și $0{,}1$ pentru normal. În realitate doar $10\%$ dintre emailuri sunt spam. Ce prezice cu priorii învățați și ce prezice cu priorul real?

<details><summary>Răspuns</summary>

1. Priorii învățați: spam $0{,}9\cdot0{,}02=0{,}018$, normal $0{,}1\cdot0{,}1=0{,}01$. Prezice „spam", cu $P(\text{spam})=\frac{0{,}018}{0{,}028}=\frac{9}{14}$.
2. Priorii reali: $P(\text{spam})=0{,}1$ și $P(\text{normal})=0{,}9$. Spam: $0{,}1\cdot0{,}02=0{,}002$. Normal: $0{,}9\cdot0{,}1=0{,}09$.
3. Acum prezice „normal", iar $P(\text{spam})=\frac{0{,}002}{0{,}092}=\frac{1}{46}$.
4. Aici decizia se schimbă în sens invers față de problema anterioară: setul avea prea mult spam, iar priorul real l-a corectat.

</details>
