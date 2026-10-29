# Partea 1a: Probabilitatea totală, formula lui Bayes, independența evenimentelor

## Probabilitatea condiționată și regula de înmulțire
<!-- studied -->

**Când vezi asta:** Enunțul spune „știind că..." sau „dacă s-a întâmplat B". Sau ți se dă o probabilitate care depinde de un alt eveniment și ți se cere probabilitatea ca ambele să aibă loc.

**Simboluri:**
- $P(A)$ = probabilitatea evenimentului $A$, un număr între 0 și 1.
- $A \cap B$ = „$A$ și $B$ se întâmplă amândouă".
- $P(A \,|\, B)$ = probabilitatea lui $A$, **după ce am aflat** că $B$ s-a întâmplat. Bara $\,|\,$ se citește „știind".

**Exemplu:** Zar corect. $B$ = „număr par" = {2, 4, 6}. $A$ = „iese 6". Cât este $P(A \,|\, B)$?

1. Știm că $B$ s-a întâmplat, deci rămân 3 rezultate posibile: 2, 4, 6.
2. Din ele, 1 este favorabil lui $A$: șase. Deci $1/3$.
3. Același lucru cu formula: $A \cap B$ = {6}, fiindcă 6 e și par. Deci $P(A \cap B) = 1/6$, iar $P(B) = 3/6 = 1/2$.
4. $P(A \,|\, B) = \dfrac{1/6}{1/2} = \dfrac{1}{6} \cdot \dfrac{2}{1} = \dfrac{2}{6} = \dfrac{1}{3}$.

Acum regula de înmulțire. Fie $S_1$ = „soldatul 1 ratează", cu $P(S_1) = 1/3$, și $S_2$ = „soldatul 2 ratează". Știind că soldatul 1 a ratat, soldatul 2 ratează cu probabilitatea $1/10$; cât e probabilitatea ca ambii să rateze?

1. Numărul $1/10$ este deja o probabilitate condiționată, $P(S_2 \,|\, S_1)$.
2. $P(S_1 \cap S_2) = P(S_2 \,|\, S_1) \cdot P(S_1) = \dfrac{1}{10} \cdot \dfrac{1}{3} = \dfrac{1}{30}$.

**Regula:** Probabilitatea condiționată este partea din $B$ în care se întâmplă și $A$; iar „și" se obține înmulțind.

$$P(A \,|\, B) = \frac{P(A \cap B)}{P(B)}$$

(cu $P(B) \neq 0$, altfel nu poți împărți)

$$\begin{aligned} P(A \cap B) &= P(A \,|\, B)\,P(B) \\ &= P(B \,|\, A)\,P(A) \end{aligned}$$

**Capcana:** $P(A \,|\, B)$ și $P(B \,|\, A)$ sunt, în general, numere diferite. Citește cu atenție care eveniment e „știut" (după bară).

**Încearcă tu:**

Zar corect. $A$ = „iese cel puțin 5" = {5, 6}, $B$ = „număr par". Calculează $P(A \,|\, B)$ și $P(B \,|\, A)$.

<details><summary>Răspuns</summary>

1. $A \cap B$ = {6}, deci $P(A \cap B) = 1/6$. $P(A) = 2/6 = 1/3$, $P(B) = 1/2$.
2. $P(A \,|\, B) = \dfrac{1/6}{1/2} = \dfrac{1}{3}$.
3. $P(B \,|\, A) = \dfrac{1/6}{1/3} = \dfrac{1}{2}$.

Cele două numere diferă: $1/3 \neq 1/2$.
</details>

O urnă are 2 bile roșii și 3 albe. Scoți două bile pe rând, fără să pui prima bilă înapoi. Care este probabilitatea ca ambele să fie roșii?

<details><summary>Răspuns</summary>

$R_1$ = „prima bilă e roșie", $R_2$ = „a doua bilă e roșie".
1. $P(R_1) = 2/5$ (2 roșii din 5 bile).
2. După prima roșie rămân 4 bile, din care 1 roșie: $P(R_2 \,|\, R_1) = 1/4$.
3. $P(R_1 \cap R_2) = \dfrac{1}{4} \cdot \dfrac{2}{5} = \dfrac{2}{20} = \dfrac{1}{10}$.
</details>

## Probabilitatea totală

**Când vezi asta:** Ți se dau probabilități pe „cazuri" (două mașini, trei fabrici, două urne) și o probabilitate pentru fiecare caz. Ți se cere probabilitatea unui eveniment **în general**, fără să știi în ce caz ești.

**Simboluri:**
- $\bar B$ = „$B$ **nu** se întâmplă" (complementul lui $B$). $P(\bar B) = 1 - P(B)$.
- Cazurile trebuie să fie o **partiție**: se exclud între ele (nu se pot întâmpla două deodată) și acoperă toate posibilitățile (măcar unul se întâmplă). $B$ și $\bar B$ sunt mereu o partiție.
- $B_1, B_2, B_3, \dots$ = cazurile, când sunt mai mult de două. $\sum_i$ înseamnă „adună termenul de după el pentru fiecare caz $B_i$".

**Exemplu:** Mașina 1 face 60% din piese, iar 2% dintre piesele ei sunt defecte. Mașina 2 face 40% din piese, iar 5% dintre ale ei sunt defecte. Care este probabilitatea ca o piesă luată la întâmplare să fie defectă?

Mai întâi cu frecvențe, pe 1000 de piese:
1. Mașina 1: $1000 \cdot 0{,}6 = 600$ piese, din care defecte $600 \cdot 0{,}02 = 12$.
2. Mașina 2: $1000 \cdot 0{,}4 = 400$ piese, din care defecte $400 \cdot 0{,}05 = 20$.
3. În total defecte: $12 + 20 = 32$ din 1000, adică $0{,}032$.

Același calcul cu probabilități ($M_1$ = „piesa vine de la mașina 1", $M_2$ = „vine de la mașina 2"):
1. Ramura mașinii 1: $P(\text{defect} \,|\, M_1)\,P(M_1) = 0{,}02 \cdot 0{,}6 = 0{,}012$.
2. Ramura mașinii 2: $P(\text{defect} \,|\, M_2)\,P(M_2) = 0{,}05 \cdot 0{,}4 = 0{,}02$.
3. $P(\text{defect}) = 0{,}012 + 0{,}02 = 0{,}032$.

**Regula:** Probabilitatea totală se obține adunând, pentru fiecare caz, probabilitatea cazului înmulțită cu probabilitatea evenimentului în acel caz.

$$\begin{aligned} P(A) &= P(A \,|\, B)\,P(B) \\ &\quad + P(A \,|\, \bar B)\,P(\bar B) \end{aligned}$$

În general, cu cazurile $B_1, B_2, B_3, \dots$:

$$P(A) = \sum_i P(A \,|\, B_i)\,P(B_i)$$

**Capcana:** Nu face media simplă a probabilităților din cazuri. Fiecare se înmulțește cu probabilitatea cazului ei, iar cazurile nu sunt la fel de probabile.

**Încearcă tu:**

$P(A \,|\, B) = 0{,}3$, $P(A \,|\, \bar B) = 0{,}5$ și $P(B) = 0{,}25$. Cât este $P(A)$?

<details><summary>Răspuns</summary>

1. $P(\bar B) = 1 - 0{,}25 = 0{,}75$.
2. Ramura $B$: $0{,}3 \cdot 0{,}25 = 0{,}075$.
3. Ramura $\bar B$: $0{,}5 \cdot 0{,}75 = 0{,}375$.
4. $P(A) = 0{,}075 + 0{,}375 = 0{,}45$.

Media simplă ar da $(0{,}3 + 0{,}5)/2 = 0{,}4$, care este greșit.
</details>

Trei fabrici produc becuri. Fabrica 1 face 50% din becuri, cu 1% defecte. Fabrica 2 face 30%, cu 2% defecte. Fabrica 3 face 20%, cu 5% defecte. Care este probabilitatea ca un bec ales la întâmplare să fie defect?

<details><summary>Răspuns</summary>

Trei cazuri, deci trei ramuri (50% + 30% + 20% = 100%, deci partiția acoperă tot).
1. Fabrica 1: $0{,}01 \cdot 0{,}5 = 0{,}005$.
2. Fabrica 2: $0{,}02 \cdot 0{,}3 = 0{,}006$.
3. Fabrica 3: $0{,}05 \cdot 0{,}2 = 0{,}01$.
4. $P(\text{defect}) = 0{,}005 + 0{,}006 + 0{,}01 = 0{,}021$.
</details>

## Formula lui Bayes

**Când vezi asta:** Ți se dă un rezultat observat (test pozitiv, piesă defectă, bilă albă) și ți se cere probabilitatea **cauzei**: „care este probabilitatea ca să fie bolnav / să vină de la mașina 1 / să fie din urna 1?". Adică condiționarea e inversată față de ce ți s-a dat.

**Simboluri:**
- $P(B)$ = probabilitatea **a priori**: cât credeai despre $B$ **înainte** de observație.
- $P(A \,|\, B)$ = **verosimilitatea**: cât de probabilă e observația $A$ dacă $B$ este adevărat.
- $P(B \,|\, A)$ = probabilitatea **a posteriori**: cât crezi despre $B$ **după** ce ai văzut $A$. Asta cauți.
- $P(\bar A \,|\, B) = 1 - P(A \,|\, B)$: dacă testul iese pozitiv la 90% dintre bolnavi, iese negativ la $1 - 0{,}9 = 0{,}1$, adică 10% dintre ei.

**Exemplu:** O boală afectează 1% din populație. Testul iese pozitiv la 90% dintre bolnavi și la 9% dintre cei sănătoși. Ai ieșit pozitiv. Care este probabilitatea să fii bolnav? Aici $B$ = „bolnav" (cauza) și $A$ = „test pozitiv" (observația).

Arborele cu frecvențe, pe 10 000 de persoane:
1. Bolnavi: $10\,000 \cdot 0{,}01 = 100$. Sănătoși: $10\,000 - 100 = 9900$.
2. Bolnavi cu test pozitiv: $100 \cdot 0{,}9 = 90$.
3. Sănătoși cu test pozitiv: $9900 \cdot 0{,}09 = 891$.
4. Total pozitivi: $90 + 891 = 981$.
5. Dintre pozitivi, bolnavi sunt $90$ din $981$: $\dfrac{90}{981} \approx 0{,}0917$, adică aproximativ 9%, nu 90%.

Aceeași cu formula: sus este ramura „bolnav și pozitiv", jos toate ramurile pozitive.
1. Sus: $0{,}9 \cdot 0{,}01 = 0{,}009$.
2. Jos: $0{,}009 + 0{,}09 \cdot 0{,}99 = 0{,}009 + 0{,}0891 = 0{,}0981$.
3. $P(\text{bolnav} \,|\, \text{pozitiv}) = \dfrac{0{,}009}{0{,}0981} \approx 0{,}0917$, același rezultat.

**Regula:** Posteriorul este ramura căutată (verosimilitate înmulțită cu prior) împărțită la suma tuturor ramurilor care dau observația; suma de jos este chiar probabilitatea totală.

$$P(B \,|\, A) = \frac{P(A \,|\, B)\,P(B)}{P(A)}$$

Jos, $P(A)$ se calculează cu probabilitatea totală:

$$\begin{aligned} P(A) &= P(A \,|\, B)\,P(B) \\ &\quad + P(A \,|\, \bar B)\,P(\bar B) \end{aligned}$$

Cu mai multe cauze $B_1, B_2, B_3, \dots$, jos aduni toate ramurile:

$$P(B_i \,|\, A) = \frac{P(A \,|\, B_i)\,P(B_i)}{\sum_j P(A \,|\, B_j)\,P(B_j)}$$

Dacă întrebarea e doar „care cauză e mai probabilă?", ajunge să compari numărătorii, fiindcă numitorul e același pentru toate cauzele. Pe lucrare, scrie întâi formula cu litere, apoi înlocuiește numerele.

**Capcana:** Nu confunda $P(A \,|\, B)$ (90%, cât de bun e testul) cu $P(B \,|\, A)$ (9%, ce vrei). Nu uita nici numitorul: fără împărțirea la $P(A)$ ai doar numărătorul.

**Încearcă tu:**

Mașina 1 face 70% din piese, cu 1% defecte. Mașina 2 face 30%, cu 4% defecte. O piesă luată la întâmplare e defectă. Cât este probabilitatea să vină de la mașina 1? Dar de la mașina 2? Care e mai probabilă?

<details><summary>Răspuns</summary>

1. Ramura mașinii 1: $0{,}01 \cdot 0{,}7 = 0{,}007$.
2. Ramura mașinii 2: $0{,}04 \cdot 0{,}3 = 0{,}012$.
3. $P(\text{defect}) = 0{,}007 + 0{,}012 = 0{,}019$.
4. $P(M_1 \,|\, \text{defect}) = \dfrac{0{,}007}{0{,}019} = \dfrac{7}{19} \approx 0{,}368$.
5. $P(M_2 \,|\, \text{defect}) = \dfrac{0{,}012}{0{,}019} = \dfrac{12}{19} \approx 0{,}632$.

Câștigă mașina 2, deși face mai puține piese: are mult mai multe defecte pe piesă. Verificare: $7/19 + 12/19 = 1$.
</details>

Urna 1 are 11 bile albe și 4 roșii. Urna 2 are 8 albe și 5 roșii. Alegi o urnă la întâmplare (șanse egale), apoi scoți o bilă din ea. Bila e albă. Care este probabilitatea să vină din urna 1?

<details><summary>Răspuns</summary>

1. $P(\text{albă} \,|\, U_1) = 11/15$, $P(\text{albă} \,|\, U_2) = 8/13$, $P(U_1) = P(U_2) = 1/2$.
2. Ramura urnei 1: $\dfrac{11}{15} \cdot \dfrac{1}{2}$. Ramura urnei 2: $\dfrac{8}{13} \cdot \dfrac{1}{2}$.
3. Factorul $1/2$ apare în toate ramurile, sus și jos, deci se simplifică: $P(U_1 \,|\, \text{albă}) = \dfrac{11/15}{11/15 + 8/13}$.
4. Aducem la numitor comun $195$: $\dfrac{11}{15} = \dfrac{143}{195}$ și $\dfrac{8}{13} = \dfrac{120}{195}$.
5. $P(U_1 \,|\, \text{albă}) = \dfrac{143}{143 + 120} = \dfrac{143}{263} \approx 0{,}5437$.

Aici câștigă urna 1, dar doar cu puțin peste jumătate.
</details>

## Independența a două evenimente

**Când vezi asta:** Enunțul întreabă „sunt $A$ și $B$ independente?" sau „arătați că...", sau dă $P(A)$, $P(B)$ și $P(A \cap B)$ și vrei să știi dacă se influențează.

**Simboluri:**
- $A$ și $B$ sunt **independente** dacă aflarea lui $B$ nu schimbă probabilitatea lui $A$.
- $A \cup B$ = „$A$ sau $B$ (sau amândouă)".
- Disjunct = nu se pot întâmpla împreună, deci $P(A \cap B) = 0$.

**Exemplu:** $X$ = „studentul X ia 6 puncte", cu $P(X) = 0{,}5$. $Y$ = „studentul Y ia 6 puncte", cu $P(Y) = 0{,}2$. Amândoi iau 6 cu $P(X \cap Y) = 0{,}11$. Sunt independente?

1. Dacă ar fi independente, am avea $P(X)\,P(Y) = 0{,}5 \cdot 0{,}2 = 0{,}1$.
2. În realitate $P(X \cap Y) = 0{,}11$. Și $0{,}11 \neq 0{,}1$: **nu** sunt independente.
3. Verificare cu forma condiționată: $P(Y \,|\, X) = \dfrac{0{,}11}{0{,}5} = 0{,}22$, iar $P(Y) = 0{,}2$. Aflând că X a luat 6, șansa lui Y crește de la $0{,}2$ la $0{,}22$.

Egalitatea trebuie să fie exactă: $0{,}11$ nu este „aproape" $0{,}1$.

Independent nu înseamnă disjunct. Fie $P(A) = 0{,}3$ și $P(B) = 0{,}5$, disjuncte:
1. $P(A \cap B) = 0$, dar $P(A)\,P(B) = 0{,}3 \cdot 0{,}5 = 0{,}15$.
2. $0 \neq 0{,}15$, deci sunt dependente. Într-adevăr, aflând $A$, probabilitatea lui $B$ devine $0$.

**Regula:** Două evenimente sunt independente exact când probabilitatea intersecției este produsul probabilităților (sau, echivalent, când $P(A \,|\, B) = P(A)$).

$$P(A \cap B) = P(A)\,P(B)$$

Echivalent (când $P(B) \neq 0$):

$$P(A \,|\, B) = P(A)$$

De ce sunt echivalente cele două forme: $P(A \,|\, B) = \dfrac{P(A \cap B)}{P(B)} = \dfrac{P(A)\,P(B)}{P(B)} = P(A)$, și invers, înmulțind cu $P(B)$.

La independente, reuniunea se scrie $P(A \cup B) = P(A) + P(B) - P(A)\,P(B)$.

Pe lucrare: pentru „sunt independente" scrii egalitatea cu numerele pe ambele părți; pentru „nu sunt" ajunge o singură inegalitate. La variabile (tabele), aceeași verificare se face pentru fiecare celulă: vezi Partea 1b.

**Capcana:** „Independent" nu înseamnă „disjunct" și nu înseamnă „fără elemente comune". Două evenimente disjuncte cu probabilități pozitive sunt cât se poate de dependente.

**Încearcă tu:**

$P(A) = 0{,}4$, $P(B) = 0{,}3$ și $P(A \cap B) = 0{,}12$. Sunt $A$ și $B$ independente?

<details><summary>Răspuns</summary>

1. Produsul: $P(A)\,P(B) = 0{,}4 \cdot 0{,}3 = 0{,}12$.
2. $P(A \cap B) = 0{,}12$, egal cu produsul: **sunt independente**.
3. Verificare: $P(A \,|\, B) = \dfrac{0{,}12}{0{,}3} = 0{,}4 = P(A)$.
4. Bonus, reuniunea: $P(A \cup B) = 0{,}4 + 0{,}3 - 0{,}12 = 0{,}58$.
</details>

$P(A) = 0{,}5$ și $P(B) = 0{,}25$, iar $A$ și $B$ sunt disjuncte. Sunt independente?

<details><summary>Răspuns</summary>

1. Disjuncte: $P(A \cap B) = 0$.
2. Produsul: $0{,}5 \cdot 0{,}25 = 0{,}125$.
3. $0 \neq 0{,}125$, deci **nu** sunt independente.
4. Verificare: $P(B \,|\, A) = \dfrac{0}{0{,}5} = 0 \neq 0{,}25 = P(B)$.
</details>

## Independența condiționată a evenimentelor

**Când vezi asta:** Enunțul spune „independente **dat $C$**" sau „condiționat de $C$". Adică verifici independența în „lumea" în care $C$ s-a întâmplat deja.

**Simboluri:**
- $P(A, B \,|\, C)$ = probabilitatea ca $A$ **și** $B$ să se întâmple, știind $C$ (virgula înseamnă „și").
- $A \perp B \,|\, C$ = „$A$ și $B$ sunt independente dat $C$".
- $P(A \,|\, B, C)$ = probabilitatea lui $A$, știind că s-au întâmplat și $B$, și $C$.
- Totul se calculează ca la independența obișnuită, dar fiecare probabilitate poartă în continuare condiția $C$.

**Exemplu:** $C$ = „testul a fost ușor". Dat $C$: $P(X \,|\, C) = 0{,}8$, $P(Y \,|\, C) = 0{,}5$ și $P(X, Y \,|\, C) = 0{,}4$. Sunt $X$ și $Y$ independente dat $C$?

1. Produsul condiționat: $P(X \,|\, C)\,P(Y \,|\, C) = 0{,}8 \cdot 0{,}5 = 0{,}4$.
2. $P(X, Y \,|\, C) = 0{,}4$, egal cu produsul: **sunt independente dat $C$**.
3. Verificare cu forma a doua, folosind regula de înmulțire cu condiția $C$ păstrată: $P(X, Y \,|\, C) = P(X \,|\, Y, C)\,P(Y \,|\, C)$, deci $P(X \,|\, Y, C) = \dfrac{0{,}4}{0{,}5} = 0{,}8 = P(X \,|\, C)$.

**Regula:** Două evenimente sunt independente dat $C$ când produsul funcționează în lumea lui $C$; cele două forme sunt echivalente.

$$P(A, B \,|\, C) = P(A \,|\, C)\,P(B \,|\, C)$$

Echivalent (când $P(B \,|\, C) \neq 0$):

$$P(A \,|\, B, C) = P(A \,|\, C)$$

Demonstrația echivalenței, dacă ți se cere. Întâi regula de înmulțire, cu $C$ păstrat peste tot ($P(A, B, C)$ = toate trei se întâmplă):

$$\begin{aligned} & P(A, B \,|\, C) = \frac{P(A, B, C)}{P(C)} \\ &= \frac{P(A, B, C)}{P(B, C)} \cdot \frac{P(B, C)}{P(C)} \\ &= P(A \,|\, B, C)\,P(B \,|\, C) \end{aligned}$$

1. Dacă $P(A \,|\, B, C) = P(A \,|\, C)$, înlocuiești în ultima linie și obții $P(A, B \,|\, C) = P(A \,|\, C)\,P(B \,|\, C)$.
2. Invers: dacă $P(A, B \,|\, C) = P(A \,|\, C)\,P(B \,|\, C)$, o pui egală cu ultima linie și împarți la $P(B \,|\, C)$: rămâne $P(A \,|\, B, C) = P(A \,|\, C)$.

**Capcana:** Nu scăpa condiția $C$ dintr-un factor: $P(A, B \,|\, C) = P(A \,|\, B)\,P(B \,|\, C)$ este greșit. Independența dat $C$ și independența fără condiție sunt întrebări diferite, iar una nu o garantează pe cealaltă, deci verifici exact ce ți se cere.

**Încearcă tu:**

Dat $C$: $P(A \,|\, C) = 0{,}6$, $P(B \,|\, C) = 0{,}5$ și $P(A, B \,|\, C) = 0{,}3$. Sunt $A$ și $B$ independente dat $C$?

<details><summary>Răspuns</summary>

1. Produsul: $0{,}6 \cdot 0{,}5 = 0{,}3$.
2. $P(A, B \,|\, C) = 0{,}3$, egal cu produsul: **sunt independente dat $C$**.
3. Verificare: $P(A \,|\, B, C) = \dfrac{0{,}3}{0{,}5} = 0{,}6 = P(A \,|\, C)$.
</details>

Dat $C$: $P(A \,|\, C) = 0{,}7$, $P(B \,|\, C) = 0{,}4$ și $P(A, B \,|\, C) = 0{,}3$. Sunt $A$ și $B$ independente dat $C$?

<details><summary>Răspuns</summary>

1. Produsul: $0{,}7 \cdot 0{,}4 = 0{,}28$.
2. $P(A, B \,|\, C) = 0{,}3 \neq 0{,}28$: **nu** sunt independente dat $C$.
3. Verificare: $P(A \,|\, B, C) = \dfrac{0{,}3}{0{,}4} = 0{,}75 \neq 0{,}7 = P(A \,|\, C)$.
</details>
