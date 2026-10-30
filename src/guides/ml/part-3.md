# Partea 3: Antrenare, validare, test; overfitting; cross-validare; pruning

## Date de antrenare, validare și test

**Când vezi asta:** Enunțul spune „ai $N$ rânduri etichetate, cum le împarți?”, „pe ce set alegi modelul?”, „ce număr raportezi?” sau „pe câte rânduri reantrenezi?”. Întrebarea nu cere calcule grele. Cere să știi ce face fiecare set.

**Simboluri:**

- Un *rând* este un exemplu, cu eticheta lui corectă.
- *Setul de antrenare* sunt rândurile din care modelul învață.
- *Setul de validare* (numit și set de dezvoltare) sunt rânduri ținute deoparte ca să compari modelele între ele și să alegi unul.
- *Setul de test* sunt rânduri neatinse, folosite o singură dată, la final.
- $e$ este eroarea: proporția rândurilor prezise greșit. $acc$ este acuratețea: proporția celor prezise corect, deci $acc = 1 - e$.

**Exemplu:** Ai 1000 de rânduri și trei algoritmi: A, B și C.

1. Pui 100 de rânduri deoparte pentru test și nu te mai uiți la ele. Rămân $1000 - 100 = 900$ de rânduri.
2. Împarți cele 900: 800 pentru antrenare și 100 pentru validare, deci $800 + 100 = 900$.
3. Antrenezi A, B și C pe cele 800. Măsori acuratețea pe cele 100 de validare: A are 0,82, B are 0,88, C are 0,85.
4. Alegi B, fiindcă 0,88 este cea mai mare acuratețe de validare.
5. Reantrenezi B pe toate cele 900 de rânduri (antrenare plus validare), nu doar pe 800. Mai multe date dau un model mai bun.
6. Rulezi B o singură dată pe cele 100 de test. Dacă ghicește 86 din 100, raportezi $acc = 86/100 = 0{,}86$, adică $e = 1 - 0{,}86 = 0{,}14$.

**Regula:** Alegi modelul pe validare, reantrenezi pe tot ce nu e test, apoi raportezi o singură dată pe test.

$$acc = 1 - e, \qquad N_{\text{reantrenare}} = N_{\text{antrenare}} + N_{\text{validare}}$$

Dacă în loc de un set de validare fix faci $k$-fold (cardul „k-fold” de mai jos) pe rândurile care nu sunt test, pașii rămân aceiași. Alegi după media $k$-fold, reantrenezi pe toate rândurile care nu sunt test, raportezi o dată pe test.

**Capcana:** Să alegi modelul după setul de test sau să raportezi acuratețea de validare ca rezultat final. Dacă alegi pe test, raportezi cel mai norocos număr dintre mai multe, deci o estimare prea bună. Dacă alegi după acuratețea la antrenare, alegi modelul care a învățat pe de rost.

**Încearcă tu:**

1. Ai 1500 de rânduri. Păstrezi 300 pentru test, iar din restul faci 1000 de antrenare și 200 de validare. Modelele P, Q și R au la validare erorile 18%, 12% și 15%. Ce model alegi, pe câte rânduri îl reantrenezi și pe câte îl raportezi?

<details><summary>Răspuns</summary>

1. Rămân $1500 - 300 = 1200$ de rânduri, iar $1000 + 200 = 1200$ se potrivește.
2. Eroarea cea mai mică la validare este 12%, deci alegi Q.
3. Reantrenezi Q pe toate cele 1200 de rânduri.
4. Raportezi o singură dată, pe cele 300 de test.

</details>

2. Ai 1000 de rânduri: 200 pentru test, apoi 600 de antrenare și 200 de validare. Modelul X are acuratețea 0,99 la antrenare și 0,80 la validare. Modelul Y are 0,90 la antrenare și 0,88 la validare. Pe care îl alegi, și pe câte rânduri îl reantrenezi?

<details><summary>Răspuns</summary>

1. Rămân $1000 - 200 = 800$ de rânduri, iar $600 + 200 = 800$ se potrivește.
2. X câștigă la antrenare (0,99 față de 0,90), dar contează validarea: $0{,}88 > 0{,}80$. Alegi Y, deci aici câștigă modelul cu acuratețea mai mică la antrenare.
3. Reantrenezi Y pe toate cele 800 de rânduri.
4. Raportezi o singură dată, pe cele 200 de test.

</details>

## Overfitting, underfitting, good fit (diagnostic după erori)

**Când vezi asta:** Ți se dau, pentru unul sau mai multe modele, eroarea la antrenare și eroarea pe date noi (validare). Ți se cere „ce se întâmplă cu modelul?” sau „pe care îl alegi?”.

**Simboluri:**

- $e_{antr}$ este eroarea la antrenare: cât greșește modelul pe rândurile din care a învățat.
- $e_{val}$ este eroarea la validare: cât greșește pe rânduri pe care nu le-a văzut.
- *Overfitting* înseamnă că modelul a învățat pe de rost antrenarea, cu tot cu zgomot. *Underfitting* înseamnă că modelul e prea simplu și nu a prins nici antrenarea.
- *Good fit* înseamnă că modelul a prins regula din date, fără zgomot: greșește puțin și la antrenare, și pe date noi.
- „Puncte” înseamnă puncte procentuale: de la 3% la 4% e o diferență de 1 punct.

**Exemplu:** Trei modele, cu $e_{antr}$ și $e_{val}$: M1 are 3% și 4%, M2 are 1% și 27%, M3 are 35% și 36%.

1. Pentru fiecare model calculezi diferența $e_{val} - e_{antr}$. M1: $4 - 3 = 1$ punct. M2: $27 - 1 = 26$ de puncte. M3: $36 - 35 = 1$ punct.
2. M2 are eroare mică la antrenare (1%) și mult mai mare la validare. Este **overfitting**.
3. M3 are erori mari pe ambele seturi, apropiate între ele. Este **underfitting**.
4. M1 are erori mici pe ambele seturi, apropiate între ele. Este **good fit**, deci modelul de ales.
5. Verifici cu definiția formală (o găsești la Regula) pentru M2 față de M1: $1 < 3$ (M2 e mai bun la antrenare) și $27 > 4$ (M2 e mai slab pe date noi). Ambele sunt adevărate, deci M2 face overfitting.

**Regula:** Compari cele două erori. Semnul overfitting-ului este diferența mare dintre ele, nu o eroare mare la antrenare.

$$\text{overfitting: } e_{antr} \text{ mică},\ e_{val} \gg e_{antr} \qquad \text{underfitting: ambele mari} \qquad \text{good fit: ambele mici}$$

Definiția formală: $h$ face overfit dacă există $h'$ cu $e_{antr}(h) < e_{antr}(h')$ și $e_{val}(h) > e_{val}(h')$. Aici $h$ și $h'$ sunt două modele (de exemplu doi arbori).

Când arborele crește (mai multe noduri), eroarea la antrenare tot scade. Eroarea pe date noi scade întâi, apoi începe să crească. Din punctul în care începe să crească, arborele face overfitting.

**Capcana:** Să crezi că overfitting înseamnă eroare mare la antrenare. E invers: eroarea la antrenare e mică, iar cea pe date noi e mare. Modelul cu cea mai mică eroare la antrenare nu e automat cel mai bun.

**Încearcă tu:**

1. Modelele D, E și F au (eroare la antrenare, eroare la validare): D (6%, 7%), E (0%, 22%), F (44%, 46%). Ce diagnostic are fiecare?

<details><summary>Răspuns</summary>

1. Diferențele $e_{val} - e_{antr}$: D: $7 - 6 = 1$ punct. E: $22 - 0 = 22$ de puncte. F: $46 - 44 = 2$ puncte.
2. D are erori mici și apropiate: **good fit**.
3. E are 0% la antrenare și mult mai mult la validare: **overfitting**.
4. F are erori mari și apropiate: **underfitting**.

</details>

2. Modelul G are 2% eroare la antrenare și 19% la validare. Modelul H are 10% la antrenare și 11% la validare. Ce diagnostic are fiecare și pe care îl alegi?

<details><summary>Răspuns</summary>

1. Diferențele: G: $19 - 2 = 17$ puncte. H: $11 - 10 = 1$ punct.
2. G are eroarea cea mai mică la antrenare, dar mult mai mare la validare: **overfitting**.
3. H are erori apropiate (10% și 11%): **good fit**.
4. Alegi H, fiindcă $11\% < 19\%$ pe date noi, deși are eroare mai mare la antrenare.

</details>

## k-fold: media a k estimări

**Când vezi asta:** „Validare încrucișată cu $k$ pliuri”, „$k$-fold”, „acuratețile pe cele $k$ pliuri sunt...”, „de câte ori antrenezi și pe câte rânduri?”.

**Simboluri:**

- $k$ este numărul de pliuri: părți egale în care tai datele.
- Un *pliu* este una dintre aceste părți.
- $acc_i$ este acuratețea măsurată pe pliul $i$, când pliul $i$ este setul de validare.
- $acc_{CV}$ este estimarea finală, adică media acuratețelor $acc_i$.

**Exemplu:** Ai 400 de rânduri și faci validare încrucișată cu $k = 4$. Compari algoritmii A și B.

1. Tai datele în 4 pliuri de câte $400 / 4 = 100$ de rânduri.
2. Faci 4 antrenări. De fiecare dată validezi pe un pliu și antrenezi pe celelalte 3, adică $400 - 100 = 300$ de rânduri.
3. A are acuratețile pe pliuri 0,70; 0,80; 0,90; 0,60. Media: $(0{,}70 + 0{,}80 + 0{,}90 + 0{,}60)/4 = 3{,}00/4 = 0{,}75$.
4. B are 0,80; 0,76; 0,78; 0,74. Media: $(0{,}80 + 0{,}76 + 0{,}78 + 0{,}74)/4 = 3{,}08/4 = 0{,}77$.
5. $0{,}77 > 0{,}75$, deci alegi B. A are cel mai bun pliu singur (0,90), dar nu contează pliul cel mai bun.

**Regula:** Estimarea $k$-fold este media celor $k$ acurateți. Faci $k$ antrenări, fiecare pe $(k-1)/k$ din date. **CVLOO** este $k$-fold cu $k$ egal cu numărul de rânduri $N$: faci $N$ antrenări, fiecare pe $N - 1$ rânduri.

$$acc_{CV} = \frac{1}{k}\sum_{i=1}^{k} acc_i$$

**Capcana:** Să iei cel mai bun pliu sau ultimul pliu în loc de medie. Încă o greșeală: să crezi că antrenezi pe un singur pliu. Antrenezi pe celelalte $k-1$ pliuri.

**Încearcă tu:**

1. Ai 600 de rânduri. Pui 100 deoparte pentru test și faci 5-fold ($k = 5$) pe celelalte. Algoritmul C are acuratețile 0,88; 0,84; 0,90; 0,86; 0,92. Algoritmul D are 0,95; 0,80; 0,85; 0,82; 0,86. Care câștigă? De câte ori antrenezi și pe câte rânduri? Pe câte rânduri reantrenezi câștigătorul și unde raportezi?

<details><summary>Răspuns</summary>

1. Pentru 5-fold rămân $600 - 100 = 500$ de rânduri.
2. C: $(0{,}88 + 0{,}84 + 0{,}90 + 0{,}86 + 0{,}92)/5 = 4{,}40/5 = 0{,}88$.
3. D: $(0{,}95 + 0{,}80 + 0{,}85 + 0{,}82 + 0{,}86)/5 = 4{,}28/5 = 0{,}856$.
4. $0{,}88 > 0{,}856$, deci C câștigă, deși D are cel mai bun pliu (0,95).
5. Pliurile au $500/5 = 100$ de rânduri, deci antrenezi de 5 ori, pe câte $500 - 100 = 400$ de rânduri.
6. Reantrenezi C pe toate cele 500 de rânduri și raportezi o singură dată, pe cele 100 de test.

</details>

2. Ai 90 de rânduri și $k = 3$. Algoritmul E are 0,60; 0,70; 0,80. Algoritmul F are 0,65; 0,75; 0,85. Care câștigă? Cât ar costa CVLOO pe aceleași 90 de rânduri?

<details><summary>Răspuns</summary>

1. E: $(0{,}60 + 0{,}70 + 0{,}80)/3 = 2{,}10/3 = 0{,}70$.
2. F: $(0{,}65 + 0{,}75 + 0{,}85)/3 = 2{,}25/3 = 0{,}75$. Câștigă F, iar aici F are și cel mai bun pliu.
3. La $k = 3$ antrenezi de 3 ori, pe câte $90 - 30 = 60$ de rânduri.
4. CVLOO ar însemna $k = 90$: 90 de antrenări, pe câte 89 de rânduri.

</details>

## CVLOO calculat de mână (la ID3)

**Când vezi asta:** „Calculează eroarea ID3 la CVLOO (leave-one-out)”, „eroarea la validare încrucișată cu un singur rând scos”. Ți se dă un tabel mic cu rânduri.

**Simboluri:**

- CVLOO este validarea încrucișată în care scoți pe rând câte un singur rând.
- $N$ este numărul de rânduri din tabel.
- $\text{greșite}$ este numărul de rânduri prezise greșit când sunt scoase.
- $e_{CVLOO}$ este $\text{greșite} / N$.
- Rândurile sunt de forma $(A, B \to Y)$: valorile atributelor $A$ și $B$, apoi clasa $Y$.

**Exemplu:** Rândurile $(A, B \to Y)$ sunt R1 $(0,0 \to 1)$, R2 $(1,0 \to 1)$, R3 $(0,0 \to 1)$, R4 $(0,1 \to 0)$, R5 $(0,0 \to 1)$. $N = 5$.

1. Pe tot setul, ID3 pune $B$ în rădăcină, fiindcă $B$ separă perfect clasele: $B = 0 \to 1$ și $B = 1 \to 0$. $A$ nu separă ($A = 0$ are și clasa 1, și clasa 0). Eroarea la antrenare este 0.
2. Scoți R4 $(0,1 \to 0)$. Restul au toate clasa 1, deci ID3 face o frunză „1”. Pentru $(0,1)$ prezice 1, adevărul e 0: **greșit**.
3. Scoți R1. Rămân R2, R3, R4, R5. $B$ separă perfect (B=0 dă 1, B=1 dă 0), iar $A$ nu (când $A=0$ apar ambele clase). Prezici $(0,0)$ cu $B = 0 \to 1$: **corect**.
4. La fel pentru R2, R3 și R5: după scoatere, $B$ tot separă perfect, iar predicția e corectă.
5. $\text{greșite} = 1$ (doar R4), deci $e_{CVLOO} = 1/5$, deși eroarea la antrenare e 0.

**Regula:** Scoți un rând, refaci arborele ID3 pe restul, prezici rândul scos și numeri greșelile. Un rând repetat se scoate separat de fiecare dată. Dacă ID3 are o egalitate, aplici regula de egalitate din enunț.

$$e_{CVLOO} = \frac{\text{rânduri prezise greșit când sunt scoase}}{N}$$

**Capcana:** Să raportezi eroarea la antrenare (0) în loc de CVLOO. CVLOO scoate rândul înainte să-l prezică, deci un rând „izolat” (singurul din clasa lui) este mereu greșit.

**Încearcă tu:**

1. Rândurile $(A, B \to Y)$ sunt R1 $(1,1 \to 1)$, R2 $(1,0 \to 1)$, R3 $(0,1 \to 0)$, R4 $(1,1 \to 1)$, R5 $(1,0 \to 1)$. Calculează $e_{CVLOO}$.

<details><summary>Răspuns</summary>

1. R3 este singurul cu clasa 0. Dacă îl scoți, restul au toate clasa 1, ID3 face frunza „1” și prezice 1 pentru $(0,1)$: **greșit**.
2. Scoți oricare alt rând: $A$ separă perfect restul ($A=1 \to 1$, $A=0 \to 0$), iar $B$ nu. Predicția pentru rândul scos e corectă.
3. $\text{greșite} = 1$, deci $e_{CVLOO} = 1/5$.

</details>

2. Rândurile $(A, B \to Y)$ sunt R1 $(1,1 \to 0)$, R2 $(0,0 \to 1)$, R3 $(0,1 \to 0)$, R4 $(0,1 \to 0)$, R5 $(0,1 \to 0)$, R6 $(1,0 \to 1)$. Calculează $e_{CVLOO}$.

<details><summary>Răspuns</summary>

1. Clasa este $Y = 1$ exact când $B = 0$. Fiecare valoare a lui $B$ apare în cel puțin două rânduri ($B=0$ în R2 și R6, $B=1$ în R1, R3, R4, R5).
2. Scoți oricare rând: $B$ separă tot perfect restul, iar $A$ nu (la $A=1$ apar ambele clase). Predicția pentru rândul scos e corectă.
3. $\text{greșite} = 0$, deci $e_{CVLOO} = 0/6 = 0$. Aici CVLOO este 0 pentru că nu există rând izolat.

</details>

## Cross-validarea ca să depistezi overfitting

**Când vezi asta:** Ți se dau doi arbori (unul complet, unul tăiat) cu eroarea la antrenare și eroarea CVLOO sau $k$-fold, și ți se cere care face overfitting sau pe care îl alegi.

**Simboluri:**

- $DT^*$ este arborele ID3 complet, fără pruning (fără tăieri).
- $DT_2$ este același arbore tăiat la o singură împărțire, adică un compas de decizie (rădăcina plus două frunze).
- $e_{antr}$ este eroarea la antrenare, iar $e_{CVLOO}$ este eroarea la CVLOO (sau $k$-fold).
- Un punct $(X \to Y)$ are valoarea $X$ (un număr) și clasa $Y$.

**Exemplu:** Zece puncte $(X \to Y)$: $(1 \to 0)$, $(2 \to 0)$, $(3 \to 0)$, $(4 \to 0)$, $(6 \to 1)$, $(7 \to 1)$, $(8 \to 1)$, $(8{,}5 \to 0)$, $(9 \to 1)$, $(10 \to 1)$. Punctul $8{,}5$ este un zgomot printre unu-uri.

1. ID3 pune praguri doar la mijlocul dintre două puncte vecine cu clase diferite: $(4 + 6)/2 = 5$, $(8 + 8{,}5)/2 = 8{,}25$ și $(8{,}5 + 9)/2 = 8{,}75$. Rădăcina este pragul 5 (cel mai mare IG, vezi Partea 2, „Praguri pe atribute continue”).
2. $DT_2$ este: $X < 5 \to 0$, altfel 1. Doar $8{,}5$ este greșit, deci $e_{antr}(DT_2) = 1/10$.
3. $DT^*$ mai taie la $8{,}25$ și $8{,}75$ ca să izoleze $8{,}5$. Toate cele 10 puncte sunt corecte, deci $e_{antr}(DT^*) = 0$.
4. CVLOO pentru $DT_2$: oricare punct scoți, pragul rămâne între blocul de 0 și blocul de 1 (se mută la $4{,}5$ când scoți 4 și la $5{,}5$ când scoți 6). Punctul scos e prezis corect, cu excepția lui $8{,}5$: $e_{CVLOO}(DT_2) = 1/10$.
5. CVLOO pentru $DT^*$, cu scurtătura de la Regula: punctul scos primește clasa vecinului lui cel mai apropiat. Problemele apar doar lângă zgomot.
6. Scoți 8: vecinii sunt 7 (clasa 1, la distanța 1) și 8,5 (clasa 0, la distanța 0,5). Mai aproape e 8,5, deci prezice 0, iar adevărul e 1: **greșit**.
7. Scoți 8,5: vecinii 8 și 9 au amândoi clasa 1, deci prezice 1, iar adevărul e 0: **greșit**.
8. Scoți 9: vecinii sunt 8,5 (clasa 0, la 0,5) și 10 (clasa 1, la 1). Prezice 0, adevărul e 1: **greșit**.
9. Orice alt punct are cel mai apropiat vecin din clasa lui (de exemplu 6: vecinii 4, la distanța 2, și 7, la distanța 1, deci clasa 1): corect. Deci $e_{CVLOO}(DT^*) = 3/10$.
10. Compari: la antrenare $0 < 1/10$ pentru $DT^*$, dar la CVLOO $3/10 > 1/10$. Ordinea se inversează, deci $DT^*$ face **overfitting**.

**Regula:** Compară CVLOO (sau $k$-fold) cu eroarea la antrenare. Modelul mai bun la antrenare dar mai slab la CVLOO face overfitting. Alegi modelul cu CVLOO cel mai mic.

$$e_{antr}(h) < e_{antr}(h') \ \text{ și } \ e_{CVLOO}(h) > e_{CVLOO}(h') \ \Rightarrow\ h \text{ face overfitting}$$

Scurtătura pentru arborele complet pe un singur atribut continuu: când scoți un punct, pragul dintre vecinii lui stă la mijloc. Deci punctul primește clasa vecinului mai apropiat. Dacă ambii vecini au aceeași clasă, primește clasa lor.

**Capcana:** Să alegi arborele cu eroarea la antrenare 0. Pe date consistente (nu există două rânduri identice cu clase diferite) ID3 are mereu eroare 0 la antrenare. Deci acea cifră nu spune nimic despre calitate.

**Încearcă tu:**

1. Opt puncte $(X \to Y)$: $(1 \to 0)$, $(2 \to 0)$, $(3 \to 0)$, $(5 \to 1)$, $(6 \to 1)$, $(6{,}5 \to 0)$, $(7 \to 1)$, $(8 \to 1)$. Calculează $e_{antr}$ și $e_{CVLOO}$ pentru arborele complet $DT^*$ și pentru compasul $DT_2$. Care face overfitting?

<details><summary>Răspuns</summary>

1. Pragurile posibile (mijloace între vecini cu clase diferite): $(3 + 5)/2 = 4$, $(6 + 6{,}5)/2 = 6{,}25$, $(6{,}5 + 7)/2 = 6{,}75$.
2. Entropia medie după fiecare prag (cu $H[a{+}, b{-}]$ din Partea 2). Pragul 4: stânga trei de 0 (entropia 0), dreapta $[4{+}, 1{-}]$, deci $\tfrac{5}{8} \cdot 0{,}722 = 0{,}451$. Pragul 6,25: $\tfrac{5}{8} \cdot H[2{+}, 3{-}] + \tfrac{3}{8} \cdot H[2{+}, 1{-}] = \tfrac{5}{8} \cdot 0{,}971 + \tfrac{3}{8} \cdot 0{,}918 = 0{,}607 + 0{,}344 = 0{,}951$. Pragul 6,75: $\tfrac{6}{8} \cdot H[2{+}, 4{-}] + \tfrac{2}{8} \cdot 0 = 0{,}75 \cdot 0{,}918 = 0{,}689$.
3. Cea mai mică entropie medie (deci cel mai mare IG) este la pragul 4. $DT_2$: $X < 4 \to 0$, altfel 1. Greșește doar 6,5: $e_{antr}(DT_2) = 1/8$.
4. $DT^*$ mai taie la 6,25 și 6,75 ca să izoleze 6,5: $e_{antr}(DT^*) = 0$.
5. CVLOO pentru $DT_2$: oricare punct scoți, pragul rămâne între blocul de 0 și blocul de 1 (3,5 când scoți 3, 4,5 când scoți 5, altfel 4). Greșește doar 6,5: $e_{CVLOO}(DT_2) = 1/8$.
6. CVLOO pentru $DT^*$, cu scurtătura vecinului mai apropiat. Scoți 6: vecinii 5 (clasa 1, la 1) și 6,5 (clasa 0, la 0,5), prezice 0: **greșit**. Scoți 6,5: vecinii 6 și 7 au clasa 1, prezice 1: **greșit**.
7. Scoți 7: vecinii 6,5 (clasa 0, la 0,5) și 8 (clasa 1, la 1), prezice 0: **greșit**. Restul sunt corecte (de exemplu 5: vecinii 3, la 2, și 6, la 1, deci clasa 1). Deci $e_{CVLOO}(DT^*) = 3/8$.
8. La antrenare $0 < 1/8$, dar la CVLOO $3/8 > 1/8$. Ordinea se inversează: $DT^*$ face **overfitting**. Alegi $DT_2$.

</details>

2. Pe 10 rânduri, arborele complet $U$ are $e_{antr} = 0/10$ și $e_{CVLOO} = 1/10$. Arborele cu un singur nod $V$ are $e_{antr} = 4/10$ și $e_{CVLOO} = 4/10$. Care are probleme și pe care îl alegi?

<details><summary>Răspuns</summary>

1. $V$ are erori mari și egale la ambele: **underfitting**.
2. $U$ are $1/10 < 4/10$ la CVLOO, deci e și mai bun la CVLOO. Nu face overfitting, fiindcă ordinea nu se inversează.
3. Alegi $U$.

</details>

## Prevenirea overfitting-ului la ID3: oprire timpurie și post-pruning

**Când vezi asta:** „Cum previi overfitting-ul la ID3?”, „oprire timpurie față de post-pruning”, „când te oprești din crescut arborele?”.

**Simboluri:**

- *Oprire timpurie* înseamnă că oprești creșterea arborelui înainte să fie complet.
- *Post-pruning* înseamnă că crești arborele complet și apoi tai ramuri.
- $IG$ este câștigul de informație al celui mai bun atribut din nod. $\varepsilon$ este un prag mic, ales de tine, de exemplu 0,01.
- *Pruning* (tăiere) înseamnă că înlocuiești un subarbore cu o frunză.

**Exemplu:** Rândurile $(A, B \to Y)$ sunt $(0,0 \to 0)$, $(0,1 \to 1)$, $(1,0 \to 1)$, $(1,1 \to 0)$ (xor). Pragul este $\varepsilon = 0{,}01$.

1. Entropia clasei: 2 de „1” și 2 de „0”, adică jumătate-jumătate, deci $H(Y) = H[2{+}, 2{-}] = 1$.
2. Dacă desparți după $A$: ramura $A = 0$ are un rând de clasă 0 și unul de clasă 1, deci entropia 1. La fel ramura $A = 1$. Entropia medie este $\tfrac{2}{4} \cdot 1 + \tfrac{2}{4} \cdot 1 = 1$, deci $IG(A) = 1 - 1 = 0$.
3. La fel pentru $B$: fiecare ramură are un 0 și un 1, deci $IG(B) = 0$.
4. Cu oprire timpurie, $IG < \varepsilon$ la rădăcină, deci te oprești imediat: un singur nod frunză, cu clasa 0 (egalitate 2 la 2, alegi 0 prin convenție). Greșește 2 din 4 rânduri, adică $2/4 = 0{,}5$, deși datele sunt consistente.
5. Cu post-pruning crești arborele complet: $A$ în rădăcină, apoi $B$ în ambele ramuri. Sub $A$, fiecare ramură are $IG(B) = 1$, iar fiecare rând e corect: eroarea la antrenare este 0.
6. Apoi decizi ce tai folosind un set de validare, nu un prag. Dacă și datele de validare urmează xor, arborele complet le prezice corect, deci nu tai nimic.

**Regula:** Oprire timpurie: nu mai împarți când împărțirea nu mai e semnificativ bună (IG sub prag). Post-pruning: crești complet, apoi tai. Post-pruning e mai sigur, fiindcă un IG mic într-un nod nu înseamnă că nu mai urmează ceva folositor sub el.

$$\text{oprire timpurie: nu împarți dacă } IG < \varepsilon \qquad \text{post-pruning: crești tot, tai după validare}$$

Dacă ți se cere să enumeri strategiile:

- oprire timpurie: prag pe IG, testul $\chi^2$, un număr minim de rânduri în nod, o adâncime maximă;
- post-pruning: reduced-error pruning, rule post-pruning, tăierea nodurilor cu IG sub prag (top-down sau bottom-up) sau cu $\chi^2$ mic;
- arborele final îl alegi după validare sau cross-validare.

Scurtătură: dacă fiecare ramură are același amestec de clase ca nodul întreg (de exemplu 1 la 2 peste tot), atunci $IG = 0$, fără niciun logaritm.

**Capcana:** Să crezi că IG mic înseamnă „atributul e inutil”. La xor, IG este 0 la rădăcină, dar sub ea IG este 1.

**Încearcă tu:**

1. Rândurile $(A, B \to Y)$ sunt $(0,0 \to 0)$, $(0,0 \to 0)$, $(0,1 \to 1)$, $(1,0 \to 1)$, $(1,1 \to 0)$, $(1,1 \to 0)$. Cu oprire timpurie la $\varepsilon = 0{,}01$, ce faci la rădăcină și câte rânduri greșesc?

<details><summary>Răspuns</summary>

1. Clasa are 2 de „1” și 4 de „0”: $H(Y) = H[2{+}, 4{-}] \approx 0{,}918$.
2. $A=0$ are trei rânduri: 1 de „1” și 2 de „0”, deci $H[1{+}, 2{-}] \approx 0{,}918$. $A=1$ la fel. Entropia medie: $\tfrac{3}{6} \cdot 0{,}918 + \tfrac{3}{6} \cdot 0{,}918 = 0{,}918$, deci $IG(A) = 0{,}918 - 0{,}918 = 0$.
3. La fel $IG(B)$: $B=0$ și $B=1$ dau câte trei rânduri cu 1 de „1” și 2 de „0”, deci $IG(B) = 0$. Ambele $IG < \varepsilon$, deci te oprești: frunza cu clasa majoritară 0.
4. Greșesc cele 2 rânduri cu $Y = 1$, deci $2/6 = 1/3$.

</details>

2. Rândurile $(A, B \to Y)$ sunt $(0,0 \to 0)$, $(0,1 \to 0)$, $(1,0 \to 0)$, $(1,1 \to 1)$ (ȘI logic). Cu $\varepsilon = 0{,}01$, te oprești la rădăcină?

<details><summary>Răspuns</summary>

1. Clasa are un 1 și trei 0: $H(Y) = H[1{+}, 3{-}] \approx 0{,}811$.
2. $A=0$ are rândurile $(0,0 \to 0)$ și $(0,1 \to 0)$: doi 0, entropia 0. $A=1$ are un 0 și un 1, entropia 1. Entropia medie: $\tfrac{2}{4} \cdot 0 + \tfrac{2}{4} \cdot 1 = 0{,}5$.
3. $IG(A) = 0{,}811 - 0{,}5 = 0{,}311 > 0{,}01$, deci **nu** te oprești: împarți și continui.

</details>

## Reduced-error pruning

**Când vezi asta:** „Reduced-error pruning”, „taie arborele folosind un set de validare”, „care nod se taie primul?”. Ți se dă un arbore, câte rânduri de antrenare ajung în fiecare nod și un set de validare.

**Simboluri:**

- Un *nod de test* este un nod în care arborele întreabă despre un atribut.
- *A tăia un nod* înseamnă să înlocuiești nodul și tot ce e sub el cu o frunză. Frunza primește clasa majoritară a rândurilor de antrenare care ajung în nod.
- $acc_{val}$ este acuratețea arborelui pe setul de validare.
- Un nod cu $[a{+}, b{-}]$ are $a$ rânduri de antrenare de clasă 1 și $b$ de clasă 0.

**Exemplu:** Arborele și datele:

- rădăcina testează $X$; dacă $X = 0$, testează $V$ ($V=0 \to 0$, $V=1 \to 1$); dacă $X = 1$, testează $W$ ($W=0 \to 1$, $W=1 \to 0$);
- rânduri de antrenare: nodul $V$ are $[1{+}, 4{-}]$, nodul $W$ are $[5{+}, 1{-}]$, rădăcina are $[6{+}, 5{-}]$;
- validare, 10 rânduri $(X, V, W \to Y)$: $(0,0,0 \to 0)$, $(0,1,1 \to 0)$, $(0,1,0 \to 0)$, $(0,1,1 \to 1)$, $(0,0,1 \to 0)$, $(1,0,0 \to 1)$, $(1,1,1 \to 0)$, $(1,0,1 \to 0)$, $(1,1,0 \to 1)$, $(1,0,0 \to 0)$.

Tabelele de mai jos arată ce prezice arborele pe fiecare rând de validare (✓ corect, ✗ greșit). Tăierea lui $V$ schimbă doar rândurile cu $X = 0$, iar tăierea lui $W$ doar pe cele cu $X = 1$. De aceea fiecare ramură are tabelul ei.

Ramura $X = 0$ (rândurile 1–5): arborele complet prezice valoarea lui $V$, iar după tăierea lui $V$ prezice 0.

| # | V | Y | complet | tai V |
|---|---|---|---|---|
| 1 | 0 | 0 | 0✓ | 0✓ |
| 2 | 1 | 0 | 1✗ | 0✓ |
| 3 | 1 | 0 | 1✗ | 0✓ |
| 4 | 1 | 1 | 1✓ | 0✗ |
| 5 | 0 | 0 | 0✓ | 0✓ |
| corecte | | | 3 | 4 |

Ramura $X = 1$ (rândurile 6–10): arborele complet prezice 1 când $W = 0$ și 0 când $W = 1$, iar după tăierea lui $W$ prezice 1.

| # | W | Y | complet | tai W |
|---|---|---|---|---|
| 6 | 0 | 1 | 1✓ | 1✓ |
| 7 | 1 | 0 | 0✓ | 1✗ |
| 8 | 1 | 0 | 0✓ | 1✗ |
| 9 | 0 | 1 | 1✓ | 1✓ |
| 10 | 0 | 0 | 1✗ | 1✗ |
| corecte | | | 4 | 2 |

1. Arborele complet: corect pe $3 + 4 = 7$ din 10 rânduri (greșit pe rândurile 2, 3 și 10). $acc_{val} = 7/10$.
2. Tai $V$: frunza are clasa majoritară 0 (4 de „−” față de 1 de „+”). Rândurile 2 și 3 devin corecte, dar rândul 4 devine greșit. Acum $acc_{val} = 4 + 4 = 8$ din 10 (sau $7 + 2 - 1 = 8$).
3. Tai $W$: frunza are clasa majoritară 1 (5 față de 1). Rândurile 7 și 8 devin greșite: $3 + 2 = 5$ din 10 (sau $7 - 2 = 5$).
4. Tai rădăcina: o singură frunză cu clasa 1 (6 față de 5). Greșește pe cele 7 rânduri cu $Y = 0$, deci corect doar $10 - 7 = 3$ din 10.
5. Cea mai bună tăiere este $V$ (8/10 față de 7/10 acum), deci o faci.
6. Reiei cu arborele nou. Tăierea lui $W$ dă $8 - 2 = 6$, iar a rădăcinii dă 3, deci amândouă scad acuratețea. Te oprești la 8/10.

**Regula:** Repeți: evaluezi pe validare tăierea fiecărui nod și o faci pe cea mai bună, dacă nu scade $acc_{val}$. La egalitate tai, fiindcă arborele mai mic e preferat. Te oprești când orice tăiere ar scădea $acc_{val}$.

$$\text{tai nodul cu cea mai mare } acc_{val}(\text{după tăiere}), \text{ dacă } acc_{val}(\text{după tăiere}) \ge acc_{val}(\text{acum})$$

Variantă: *rule post-pruning* (folosit în C4.5) transformă arborele în reguli, una pe frunză, și taie fiecare regulă separat, scoțând precondiții. La final ordonezi regulile după acuratețea pe validare. Exemplu pe validarea din tabel:

1. Frunza $X = 0$, $V = 1$ dă regula „dacă $X = 0$ și $V = 1$ atunci 1”. Ea acoperă rândurile 2, 3, 4, cu $Y$ = 0, 0, 1: acuratețea $1/3$.
2. Scoți $X = 0$: „dacă $V = 1$ atunci 1” acoperă rândurile 2, 3, 4, 7, 9, cu $Y$ = 0, 0, 1, 0, 1: acuratețea $2/5$. Scoți în schimb $V = 1$: „dacă $X = 0$ atunci 1” acoperă rândurile 1–5, cu un singur 1: $1/5$.
3. $2/5 = 0{,}4 > 1/3 \approx 0{,}33$, deci scoți precondiția $X = 0$. Fără nicio precondiție, regula ar acoperi toate cele 10 rânduri, cu 3 de „1”: $3/10 < 2/5$. Deci $V = 1$ rămâne.

Diferența față de reduced-error: acolo tai un nod cu tot subarborele. La rule post-pruning poți scoate orice precondiție, chiar testul din rădăcină, iar regulile nu mai formează un arbore.

**Capcana:** Să alegi tăierea după eroarea la antrenare. La antrenare o tăiere nu poate ajuta. Criteriul este mereu acuratețea pe validare.

**Încearcă tu:**

1. Arbore: rădăcina testează $A$. $A=1 \to 1$. Dacă $A=0$, testează $B$ ($B=0 \to 0$, $B=1 \to 1$). Nodul $B$ are $[1{+}, 3{-}]$, iar rădăcina are $[5{+}, 3{-}]$. Validare $(A, B \to Y)$: $(0,0 \to 0)$, $(0,1 \to 0)$, $(0,1 \to 0)$, $(0,1 \to 1)$, $(0,0 \to 0)$, $(1,0 \to 1)$, $(1,1 \to 1)$, $(1,0 \to 1)$. Ce tai?

<details><summary>Răspuns</summary>

1. Arborele complet greșește rândurile 2 și 3 (prezice 1 pentru $(0,1)$, dar adevărul e 0). Corect: 6 din 8.
2. Tai $B$: frunza are clasa 0 (3 față de 1). Rândurile 2 și 3 devin corecte, rândul 4 devine greșit: $6 + 2 - 1 = 7$ din 8. Mai bun.
3. Tai rădăcina: frunză cu clasa 1 (5 față de 3). Corect pe rândurile cu $Y = 1$ (4 rânduri): 4 din 8. Mai slab.
4. Faci tăierea lui $B$ (7/8). Apoi tăierea rădăcinii dă 4/8, deci nu mai ajută. Te oprești.

</details>

2. Același arbore și aceleași numere de antrenare. Validare: $(0,0 \to 0)$, $(0,1 \to 1)$, $(0,1 \to 1)$, $(0,0 \to 0)$, $(1,0 \to 1)$, $(1,1 \to 1)$, $(1,0 \to 0)$. Ce tai?

<details><summary>Răspuns</summary>

1. Arborele complet greșește doar ultimul rând (prezice 1, adevărul e 0). Corect: 6 din 7.
2. Tai $B$: frunză 0. Rândurile 2 și 3 devin greșite: $6 - 2 = 4$ din 7. Mai slab.
3. Tai rădăcina: frunză 1. Rândurile cu $Y = 1$ sunt 4, deci 4 din 7. Mai slab.
4. Orice tăiere scade acuratețea pe validare ($4/7 < 6/7$), deci **nu tai nimic**.

</details>

## Prag pe IG la pruning: top-down față de bottom-up

**Când vezi asta:** „Pruning cu pragul $\varepsilon$ pe IG”, „top-down” sau „bottom-up”, „ce arbore rămâne?”. Ți se dă un arbore cu IG scris pe fiecare nod de test.

**Simboluri:**

- $IG$ pe un nod este câștigul de informație al testului din acel nod, scris în figură.
- $\varepsilon$ este pragul: un nod cu $IG < \varepsilon$ este candidat la tăiere.
- *Top-down*: parcurgi de sus în jos. *Bottom-up*: pornești de la părinții frunzelor și urci.
- Un *descendent* al unui nod este orice nod de test aflat sub el.

**Exemplu:** Arborele, cu pragul $\varepsilon = 0{,}05$:

- rădăcina $R$ are $IG = 0{,}40$;
- $R=0$ duce la nodul $S$ ($IG = 0{,}02$), cu două frunze;
- $R=1$ duce la nodul $T$ ($IG = 0{,}01$);
- $T=0$ duce la nodul $U$ ($IG = 0{,}80$), cu două frunze, iar $T=1$ la o frunză.

1. **Top-down.** $R$: $0{,}40 \ge 0{,}05$, rămâne.
2. $S$: $0{,}02 < 0{,}05$, se înlocuiește cu o frunză.
3. $T$: $0{,}01 < 0{,}05$, se înlocuiește cu o frunză, cu tot cu $U$. Rămâne $R$ cu două frunze: **1 nod de test**.
4. **Bottom-up.** Pornești de la părinții frunzelor: $S$ și $U$. $S$ are $0{,}02 < 0{,}05$ și niciun descendent cu IG mare, deci se elimină.
5. $U$ are $0{,}80 \ge 0{,}05$, rămâne.
6. $T$ are $0{,}01 < 0{,}05$, dar are un descendent ($U$) cu $0{,}80 \ge 0{,}05$, deci **rămâne**. $R$ rămâne. Rezultat: $R$, $T$, $U$, adică **3 noduri de test**.

**Regula:** Top-down taie orice nod cu $IG < \varepsilon$, cu tot subarborele. Bottom-up taie un nod cu $IG < \varepsilon$ doar dacă nu are niciun descendent cu $IG \ge \varepsilon$. De aceea cele două pot da arbori diferiți.

$$\text{top-down: tai dacă } IG < \varepsilon \qquad \text{bottom-up: tai dacă } IG < \varepsilon \text{ și toți descendenții au } IG < \varepsilon$$

**Capcana:** Să tai cu top-down și să uiți că sub un nod cu IG mic poate sta unul cu IG mare, ca la xor.

**Încearcă tu:**

1. Rădăcina $P$ ($IG = 0{,}00$) are doi copii: $Q$ ($IG = 1{,}0$) la $P=0$ și $R$ ($IG = 1{,}0$) la $P=1$, ambii cu frunze. Pragul este $\varepsilon = 0{,}01$. Câte noduri de test rămân cu top-down și câte cu bottom-up?

<details><summary>Răspuns</summary>

1. **Top-down.** $P$ are $0{,}00 < 0{,}01$, deci se înlocuiește cu o frunză, cu tot subarborele. Rămân **0** noduri de test.
2. **Bottom-up.** $Q$ și $R$ au $1{,}0 \ge 0{,}01$, rămân. $P$ are $0{,}00 < 0{,}01$, dar descendenții lui au IG mare, deci rămâne. Rămân **3** noduri de test.

</details>

2. Rădăcina $A$ ($IG = 0{,}50$). $A=0$ duce la nodul $B$ ($IG = 0{,}03$), cu frunze. $A=1$ duce la nodul $C$ ($IG = 0{,}60$), cu frunze. Pragul este $\varepsilon = 0{,}10$. Ce rămâne cu top-down și ce cu bottom-up?

<details><summary>Răspuns</summary>

1. **Top-down.** $A$ rămâne ($0{,}50 \ge 0{,}10$). $B$ are $0{,}03 < 0{,}10$, se înlocuiește cu o frunză. $C$ rămâne. Rezultat: $A$ și $C$, **2** noduri de test.
2. **Bottom-up.** $B$ ($0{,}03 < 0{,}10$) nu are descendenți cu IG mare, deci se elimină. $C$ și $A$ rămân. Rezultat: tot $A$ și $C$, **2** noduri de test. Aici cele două metode dau același arbore.

</details>

## Testul χ² la pruning (când IG singur nu ajunge)

**Când vezi asta:** „Testul $\chi^2$”, „ipoteza nulă”, „atributul e independent de clasă?”, „$\alpha = 0{,}05$”. Ți se dă un tabel de numere cu valorile atributului pe rânduri și clasele pe coloane.

**Simboluri:**

- $\chi^2$ (citit „hi pătrat”) este un număr care măsoară cât de departe sunt numerele observate de cele așteptate la independență.
- $O_{ij}$ este numărul observat de rânduri cu valoarea $i$ a atributului și clasa $j$.
- $E_{ij}$ este numărul așteptat în aceeași celulă dacă atributul și clasa ar fi independente.
- $N$ este totalul rândurilor din nod (doar rândurile care ajung în nodul acela).
- *Gradele de libertate* sunt $(r-1)(c-1)$, cu $r$ rânduri și $c$ coloane în tabel.
- Ipoteza nulă $H_0$ spune că atributul și clasa sunt independente la nodul respectiv.
- $\alpha$ este nivelul de semnificație: riscul acceptat să declari dependență din întâmplare. $\alpha = 0{,}05$ înseamnă 5%.
- *Valoarea critică* este pragul din tabelul $\chi^2$, dat în enunț sau ținut minte: $3{,}841$ la 1 grad de libertate, $5{,}991$ la 2.

**Exemplu:** Tabelul $O$ al unui nod, cu rândurile valorile lui $A$ (două) și coloanele clasele (două): $A = 0$: 9 din clasa 0 și 3 din clasa 1. $A = 1$: 3 din clasa 0 și 9 din clasa 1. Nivel $\alpha = 0{,}05$.

1. $N = 9 + 3 + 3 + 9 = 24$. Totalurile pe rânduri: 12 și 12. Pe coloane: 12 și 12.
2. $E_{ij} = (\text{total rând}) \cdot (\text{total coloană}) / N = 12 \cdot 12 / 24 = 6$, pentru fiecare celulă.
3. $\chi^2 = (9-6)^2/6 + (3-6)^2/6 + (3-6)^2/6 + (9-6)^2/6 = 4 \cdot 9/6 = 36/6 = 6$.
4. Grade de libertate: $(2-1)(2-1) = 1$. Valoarea critică la $\alpha = 0{,}05$ este $3{,}841$.
5. $6 > 3{,}841$, deci $H_0$ se respinge: atributul și clasa sunt dependente. Nodul **rămâne**.

**Regula:** Calculezi $\chi^2$ pe rândurile nodului. Dacă $\chi^2$ depășește valoarea critică (pentru $\alpha = 0{,}05$: $3{,}841$ la 1 grad de libertate, $5{,}991$ la 2), nodul rămâne. Altfel, subarborele se înlocuiește cu o frunză.

$$E_{ij} = \frac{(\text{total rând } i)(\text{total coloană } j)}{N}, \qquad \chi^2 = \sum_{i,j} \frac{(O_{ij} - E_{ij})^2}{E_{ij}}$$

**Capcana:** Să iei $O$ la numitor în loc de $E$, sau să tai când $\chi^2$ e mare. Un $\chi^2$ mare înseamnă dependență, deci nodul **rămâne**. Un $\chi^2$ mic înseamnă că nodul se taie.

**Încearcă tu:**

1. Tabelul unui nod: $A = 0$: 3 din clasa 0 și 2 din clasa 1. $A = 1$: 2 din clasa 0 și 3 din clasa 1. Nivel $\alpha = 0{,}05$. Nodul rămâne sau se taie?

<details><summary>Răspuns</summary>

1. $N = 3 + 2 + 2 + 3 = 10$. Totalurile: rânduri 5 și 5, coloane 5 și 5.
2. $E_{ij} = 5 \cdot 5 / 10 = 2{,}5$ pentru fiecare celulă.
3. În fiecare celulă, $O - E$ este $3 - 2{,}5 = 0{,}5$ sau $2 - 2{,}5 = -0{,}5$, deci $(O-E)^2 = 0{,}25$. $\chi^2 = 4 \cdot 0{,}25 / 2{,}5 = 1/2{,}5 = 0{,}4$.
4. 1 grad de libertate, valoarea critică $3{,}841$. $0{,}4 < 3{,}841$, deci $H_0$ nu se respinge: nodul se **taie** (frunză).

</details>

2. Tabelul unui nod cu trei valori ale atributului. Rândul 1: 8 din clasa 0 și 0 din clasa 1. Rândul 2: 2 din clasa 0 și 5 din clasa 1. Rândul 3: 0 din clasa 0 și 5 din clasa 1. Nivel $\alpha = 0{,}05$. Nodul rămâne sau se taie?

<details><summary>Răspuns</summary>

1. $N = 8 + 0 + 2 + 5 + 0 + 5 = 20$. Totalurile pe rânduri: 8, 7, 5. Pe coloane: 10 și 10.
2. Valori așteptate: rândul 1: $8 \cdot 10/20 = 4$ și 4. Rândul 2: $7 \cdot 10/20 = 3{,}5$ și 3,5. Rândul 3: $5 \cdot 10/20 = 2{,}5$ și 2,5.
3. Rândul 1: $(8-4)^2/4 + (0-4)^2/4 = 4 + 4 = 8$. Rândul 2: $(2-3{,}5)^2/3{,}5 + (5-3{,}5)^2/3{,}5 = 2 \cdot 2{,}25/3{,}5 = 4{,}5/3{,}5 = 9/7 \approx 1{,}29$. Rândul 3: $(0-2{,}5)^2/2{,}5 + (5-2{,}5)^2/2{,}5 = 2{,}5 + 2{,}5 = 5$.
4. $\chi^2 = 8 + 9/7 + 5 = 100/7 \approx 14{,}29$.
5. Grade de libertate: $(3-1)(2-1) = 2$, valoarea critică $5{,}991$. $14{,}29 > 5{,}991$, deci $H_0$ se respinge: nodul **rămâne**.

</details>
