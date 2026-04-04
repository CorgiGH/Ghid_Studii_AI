import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import MultipleChoice from '../../../components/ui/MultipleChoice';
import CourseBlock from '../../../components/ui/CourseBlock';

/* ═══════════════════════════════════════════════════════════
   Course 1: Introduction, OS Architecture, C++ History, Classes
   ═══════════════════════════════════════════════════════════ */
const course1Questions = [
  {
    question: { en: '1. What does a compiler do?', ro: '1. Ce face un compilator?' },
    options: [
      { text: { en: 'Merges object files into an executable', ro: 'Unește fișierele obiect într-un executabil' }, correct: false },
      { text: { en: 'Translates source code into machine code', ro: 'Traduce codul sursă în cod mașină' }, correct: true },
      { text: { en: 'Loads libraries at runtime', ro: 'Încarcă bibliotecile la runtime' }, correct: false },
      { text: { en: 'Provides a graphical user interface', ro: 'Oferă o interfață grafică utilizator' }, correct: false },
    ],
    explanation: { en: 'A compiler translates source code (readable code) into machine code (binary code for a specific architecture). The linker is the one that merges object files into an executable.', ro: 'Un compilator traduce codul sursă (cod lizibil) în cod mașină (cod binar pentru o arhitectură specifică). Linker-ul este cel care unește fișierele obiect într-un executabil.' },
  },
  {
    question: { en: '2. In a C++ process memory layout, which region is NOT initialized by default?', ro: '2. În layout-ul memoriei unui proces C++, care regiune NU este inițializată implicit?' },
    options: [
      { text: { en: 'Global variables', ro: 'Variabile globale' }, correct: false },
      { text: { en: 'Constants', ro: 'Constante' }, correct: false },
      { text: { en: 'Stack (local variables)', ro: 'Stack (variabile locale)' }, correct: true },
      { text: { en: 'Executable code', ro: 'Codul executabil' }, correct: false },
    ],
    explanation: { en: 'Local variables on the stack are NOT initialized — they contain undefined/garbage values. Global variables ARE initialized to 0 by default.', ro: 'Variabilele locale pe stack NU sunt inițializate — conțin valori nedefinite/gunoi. Variabilele globale SUNT inițializate cu 0 implicit.' },
  },
  {
    question: { en: '3. What is sizeof(Test) for: struct Test { char x; char y; int z; };?', ro: '3. Care este sizeof(Test) pentru: struct Test { char x; char y; int z; };?' },
    options: [
      { text: '6', correct: false },
      { text: '7', correct: false },
      { text: '8', correct: true },
      { text: '12', correct: false },
    ],
    explanation: { en: 'x is at offset 0 (1 byte), y at offset 1 (1 byte), then 2 bytes of padding so z aligns to offset 4 (int needs 4-byte alignment). Total = 8. With #pragma pack(1), it would be 6.', ro: 'x este la offset 0 (1 byte), y la offset 1 (1 byte), apoi 2 bytes padding ca z să se alinieze la offset 4 (int necesită aliniere la 4). Total = 8. Cu #pragma pack(1), ar fi 6.' },
  },
  {
    question: { en: '4. Who created C++ and what was its original name?', ro: '4. Cine a creat C++ și care a fost numele său original?' },
    options: [
      { text: { en: 'Dennis Ritchie — "C with Objects"', ro: 'Dennis Ritchie — "C with Objects"' }, correct: false },
      { text: { en: 'Bjarne Stroustrup — "C with Classes"', ro: 'Bjarne Stroustrup — "C with Classes"' }, correct: true },
      { text: { en: 'Bjarne Stroustrup — "Advanced C"', ro: 'Bjarne Stroustrup — "Advanced C"' }, correct: false },
      { text: { en: 'Linus Torvalds — "C with Classes"', ro: 'Linus Torvalds — "C with Classes"' }, correct: false },
    ],
    explanation: { en: 'Bjarne Stroustrup started working on it in 1979 under the name "C with Classes". It was renamed to C++ in 1983.', ro: 'Bjarne Stroustrup a început să lucreze la el în 1979 sub numele "C with Classes". A fost redenumit C++ în 1983.' },
  },
  {
    question: { en: '5. In C++, what is the difference between class and struct regarding default access?', ro: '5. În C++, care este diferența între class și struct privind accesul implicit?' },
    options: [
      { text: { en: 'class members are public by default; struct members are private', ro: 'membrii class sunt public implicit; membrii struct sunt private' }, correct: false },
      { text: { en: 'class members are private by default; struct members are public', ro: 'membrii class sunt private implicit; membrii struct sunt public' }, correct: true },
      { text: { en: 'struct cannot have methods', ro: 'struct nu poate avea metode' }, correct: false },
      { text: { en: 'There is no difference', ro: 'Nu există nicio diferență' }, correct: false },
    ],
    explanation: { en: 'The only difference is the default access modifier: class members are private by default, struct members are public by default. Both support all access modifiers.', ro: 'Singura diferență este modificatorul de acces implicit: membrii class sunt private implicit, membrii struct sunt public implicit. Ambele suportă toți modificatorii de acces.' },
  },
  {
    question: { en: '6. What is sizeof of a class with only static data members (e.g., class C { static int X; };)?', ro: '6. Care este sizeof al unei clase cu doar membri date statici (ex: class C { static int X; };)?' },
    options: [
      { text: '0', correct: false },
      { text: '1', correct: true },
      { text: '4', correct: false },
      { text: '8', correct: false },
    ],
    explanation: { en: 'Static data members belong to the class, not to instances — they do NOT contribute to sizeof. A class with only static members (or no members at all) has sizeof = 1.', ro: 'Membrii date statici aparțin clasei, nu instanțelor — NU contribuie la sizeof. O clasă cu doar membri statici (sau fără membri) are sizeof = 1.' },
  },
  {
    question: { en: '7. Can a static method access the "this" pointer?', ro: '7. Poate o metodă statică să acceseze pointerul "this"?' },
    options: [
      { text: { en: 'Yes, always', ro: 'Da, întotdeauna' }, correct: false },
      { text: { en: 'Yes, but only for static members', ro: 'Da, dar doar pentru membrii statici' }, correct: false },
      { text: { en: 'No — static methods have no "this" pointer', ro: 'Nu — metodele statice nu au pointer "this"' }, correct: true },
      { text: { en: 'Only if the method is also const', ro: 'Doar dacă metoda este și const' }, correct: false },
    ],
    explanation: { en: 'A static method has no "this" pointer because it belongs to the class, not to an instance. It can only access static members and other static methods.', ro: 'O metodă statică nu are pointer "this" deoarece aparține clasei, nu unei instanțe. Poate accesa doar membri statici și alte metode statice.' },
  },
  {
    question: { en: '8. Can a method access private members of ANOTHER instance of the same class?', ro: '8. Poate o metodă accesa membrii privați ai ALTEI instanțe ale aceleiași clase?' },
    options: [
      { text: { en: 'No — private means only the same instance can access', ro: 'Nu — private înseamnă că doar aceeași instanță poate accesa' }, correct: false },
      { text: { en: 'Yes — access control is per-class, not per-instance', ro: 'Da — controlul accesului este per-clasă, nu per-instanță' }, correct: true },
      { text: { en: 'Only if the method is static', ro: 'Doar dacă metoda este statică' }, correct: false },
      { text: { en: 'Only through friend functions', ro: 'Doar prin funcții friend' }, correct: false },
    ],
    explanation: { en: 'A method can access private members of OTHER instances of the same class. Access control in C++ is per-class, not per-instance. For example: void Person::SetAge(Person *p, int v) { p->Age = v; } is valid.', ro: 'O metodă poate accesa membrii privați ai ALTOR instanțe ale aceleiași clase. Controlul accesului în C++ este per-clasă, nu per-instanță.' },
  },
  {
    question: { en: '9. What is sizeof(Test) for: struct Test { char x; double y; int z; };?', ro: '9. Care este sizeof(Test) pentru: struct Test { char x; double y; int z; };?' },
    options: [
      { text: '13', correct: false },
      { text: '16', correct: false },
      { text: '20', correct: false },
      { text: '24', correct: true },
    ],
    explanation: { en: 'x at offset 0 (1 byte) + 7 padding = y at offset 8 (8 bytes) = 16. z at offset 16 (4 bytes) = 20. Struct size must be multiple of largest member (double = 8), so padded to 24.', ro: 'x la offset 0 (1 byte) + 7 padding = y la offset 8 (8 bytes) = 16. z la offset 16 (4 bytes) = 20. Dimensiunea structurii trebuie să fie multiplu al celui mai mare membru (double = 8), deci completată la 24.' },
  },
  {
    question: { en: '10. Which linking type embeds library code directly into the executable?', ro: '10. Ce tip de legare include codul bibliotecii direct în executabil?' },
    options: [
      { text: { en: 'Dynamic linking', ro: 'Legare dinamică' }, correct: false },
      { text: { en: 'Static linking', ro: 'Legare statică' }, correct: true },
      { text: { en: 'Delayed linking', ro: 'Legare întârziată' }, correct: false },
      { text: { en: 'JIT linking', ro: 'Legare JIT' }, correct: false },
    ],
    explanation: { en: 'Static linking includes library code in the executable (larger but portable). Dynamic linking resolves library references at runtime (smaller executable but requires libraries on the system).', ro: 'Legarea statică include codul bibliotecii în executabil (mai mare dar portabil). Legarea dinamică rezolvă referințele la runtime (executabil mai mic dar necesită bibliotecile pe sistem).' },
  },
];

/* ═══════════════════════════════════════════════════════════
   Course 2: Pointers, References, Overloading, NULL/nullptr, const, friend
   ═══════════════════════════════════════════════════════════ */
const course2Questions = [
  {
    question: { en: '1. Which of the following is TRUE about references in C++?', ro: '1. Care dintre următoarele este ADEVĂRAT despre referințe în C++?' },
    options: [
      { text: { en: 'References can be NULL', ro: 'Referințele pot fi NULL' }, correct: false },
      { text: { en: 'References can be reassigned after initialization', ro: 'Referințele pot fi reasignate după inițializare' }, correct: false },
      { text: { en: 'References must be initialized when declared', ro: 'Referințele trebuie inițializate la declarare' }, correct: true },
      { text: { en: 'You can create an array of references', ro: 'Puteți crea un tablou de referințe' }, correct: false },
    ],
    explanation: { en: 'References must be initialized when declared. They cannot be NULL, cannot be reassigned, do not support arithmetic, and arrays of references are not allowed.', ro: 'Referințele trebuie inițializate la declarare. Nu pot fi NULL, nu pot fi reasignate, nu suportă aritmetică și tablourile de referințe nu sunt permise.' },
  },
  {
    question: { en: '2. What is part of a function\'s signature for overload resolution?', ro: '2. Ce face parte din semnătura unei funcții pentru rezoluția supraîncărcării?' },
    options: [
      { text: { en: 'Function name + return type', ro: 'Numele funcției + tipul de retur' }, correct: false },
      { text: { en: 'Function name + parameter types', ro: 'Numele funcției + tipurile parametrilor' }, correct: true },
      { text: { en: 'Return type + parameter types', ro: 'Tipul de retur + tipurile parametrilor' }, correct: false },
      { text: { en: 'Function name + parameter types + default values', ro: 'Numele funcției + tipurile parametrilor + valorile implicite' }, correct: false },
    ],
    explanation: { en: 'A function signature consists of the function name and parameter types. The return type is NOT part of the signature. Default parameter values do NOT change the signature either.', ro: 'Semnătura unei funcții constă din numele funcției și tipurile parametrilor. Tipul de retur NU face parte din semnătură. Valorile implicite ale parametrilor NU schimbă nici ele semnătura.' },
  },
  {
    question: { en: '3. Given: void Print(int v); void Print(const char* t); — what does Print(NULL) call?', ro: '3. Dat: void Print(int v); void Print(const char* t); — ce apelează Print(NULL)?' },
    options: [
      { text: 'Print(const char*)', correct: false },
      { text: 'Print(int)', correct: true },
      { text: { en: 'Compilation error — ambiguous', ro: 'Eroare de compilare — ambiguu' }, correct: false },
      { text: { en: 'Runtime error', ro: 'Eroare la runtime' }, correct: false },
    ],
    explanation: { en: 'In C++, NULL is defined as 0 (an integer), not a pointer. So Print(NULL) calls Print(int) with value 0. Use nullptr instead to get Print(const char*).', ro: 'În C++, NULL este definit ca 0 (un întreg), nu un pointer. Deci Print(NULL) apelează Print(int) cu valoarea 0. Folosiți nullptr în schimb pentru a obține Print(const char*).' },
  },
  {
    question: { en: '4. Which assignment is INVALID with nullptr?', ro: '4. Care atribuire este INVALIDĂ cu nullptr?' },
    options: [
      { text: 'bool b = nullptr;', correct: false },
      { text: 'const char* p = nullptr;', correct: false },
      { text: 'int x = nullptr;', correct: true },
      { text: 'int* i = nullptr;', correct: false },
    ],
    explanation: { en: 'nullptr can only be assigned to pointers and bool. Assigning it to int, char, or float produces a compilation error. This is the key advantage over NULL (which is just 0).', ro: 'nullptr poate fi atribuit doar pointerilor și bool. Atribuirea la int, char sau float produce eroare de compilare. Acesta este avantajul cheie față de NULL (care este doar 0).' },
  },
  {
    question: { en: '5. What does the overload resolution do when calling m.Inc(\'a\') given Inc(int) and Inc(float)?', ro: '5. Ce face rezoluția supraîncărcării la apelul m.Inc(\'a\') dat Inc(int) și Inc(float)?' },
    options: [
      { text: { en: 'Calls Inc(float) — char is closer to float', ro: 'Apelează Inc(float) — char este mai aproape de float' }, correct: false },
      { text: { en: 'Calls Inc(int) — char is promoted to int', ro: 'Apelează Inc(int) — char este promovat la int' }, correct: true },
      { text: { en: 'Compilation error — ambiguous', ro: 'Eroare de compilare — ambiguu' }, correct: false },
      { text: { en: 'Calls Inc(float) — promotion to float has priority', ro: 'Apelează Inc(float) — promovarea la float are prioritate' }, correct: false },
    ],
    explanation: { en: 'Numerical promotion converts char to int (not float). Since Inc(int) exists, it matches via promotion. Promotion: bool/char/short -> int, float -> double.', ro: 'Promovarea numerică convertește char la int (nu float). Deoarece Inc(int) există, se potrivește prin promovare. Promovare: bool/char/short -> int, float -> double.' },
  },
  {
    question: { en: '6. For value types (e.g., int), is Inc(int x) a different signature from Inc(const int x)?', ro: '6. Pentru tipuri valoare (ex: int), este Inc(int x) o semnătură diferită de Inc(const int x)?' },
    options: [
      { text: { en: 'Yes — const always creates a different signature', ro: 'Da — const creează întotdeauna o semnătură diferită' }, correct: false },
      { text: { en: 'No — for value types, const is ignored in the signature', ro: 'Nu — pentru tipuri valoare, const este ignorat din semnătură' }, correct: true },
      { text: { en: 'Only if the method is static', ro: 'Doar dacă metoda este statică' }, correct: false },
      { text: { en: 'Yes — but only in C++11 and later', ro: 'Da — dar doar în C++11 și ulterior' }, correct: false },
    ],
    explanation: { en: 'For value types, const is ignored in the signature (they are duplicates). For pointers and references, const IS part of the signature: Inc(int*) and Inc(const int*) are different.', ro: 'Pentru tipuri valoare, const este ignorat din semnătură (sunt duplicate). Pentru pointeri și referințe, const FACE parte din semnătură: Inc(int*) și Inc(const int*) sunt diferite.' },
  },
  {
    question: { en: '7. Why does m.Inc(100) compile when Inc(const int&) exists but fail when only Inc(int&) exists?', ro: '7. De ce compilează m.Inc(100) când există Inc(const int&) dar eșuează când există doar Inc(int&)?' },
    options: [
      { text: { en: 'The literal 100 cannot bind to a non-const reference', ro: 'Literalul 100 nu poate fi legat de o referință non-const' }, correct: true },
      { text: { en: '100 is a double, not an int', ro: '100 este un double, nu un int' }, correct: false },
      { text: { en: 'Inc(int&) does not accept rvalues by design', ro: 'Inc(int&) nu acceptă rvalues prin design' }, correct: false },
      { text: { en: 'It is a bug in MSVC', ro: 'Este un bug în MSVC' }, correct: false },
    ],
    explanation: { en: 'The literal 100 is a constant (rvalue). It cannot bind to a non-const reference (int&) because that would allow modifying a literal. It CAN bind to a const reference (const int&).', ro: 'Literalul 100 este o constantă (rvalue). Nu poate fi legat de o referință non-const (int&) deoarece ar permite modificarea unui literal. POATE fi legat de o referință const (const int&).' },
  },
  {
    question: { en: '8. What does the "friend" specifier allow?', ro: '8. Ce permite specificatorul "friend"?' },
    options: [
      { text: { en: 'Makes a member public', ro: 'Face un membru public' }, correct: false },
      { text: { en: 'Allows an external function or class to access private members', ro: 'Permite unei funcții sau clase externe să acceseze membrii privați' }, correct: true },
      { text: { en: 'Prevents inheritance', ro: 'Împiedică moștenirea' }, correct: false },
      { text: { en: 'Makes a method virtual', ro: 'Face o metodă virtuală' }, correct: false },
    ],
    explanation: { en: 'The friend specifier grants an external function, method, or class access to the private and protected members of the class that declares it as friend.', ro: 'Specificatorul friend acordă unei funcții, metode sau clase externe acces la membrii privați și protejați ai clasei care o declară ca friend.' },
  },
  {
    question: { en: '9. What is the assembly difference between passing by pointer and by reference?', ro: '9. Care este diferența la nivel de assembler între transmiterea prin pointer și prin referință?' },
    options: [
      { text: { en: 'Pointers produce faster code', ro: 'Pointerii produc cod mai rapid' }, correct: false },
      { text: { en: 'References produce an extra indirection', ro: 'Referințele produc o indirectare suplimentară' }, correct: false },
      { text: { en: 'The resulting assembly code is identical', ro: 'Codul assembler rezultat este identic' }, correct: true },
      { text: { en: 'References use registers while pointers use the stack', ro: 'Referințele folosesc registre iar pointerii folosesc stack-ul' }, correct: false },
    ],
    explanation: { en: 'The resulting assembly code is identical for both pointer and reference versions. Both translate to the same machine instructions (push, mov, pop, ret).', ro: 'Codul assembler rezultat este identic pentru ambele versiuni — pointer și referință. Ambele se traduc în aceleași instrucțiuni mașină.' },
  },
  {
    question: { en: '10. What happens when calling m.Inc(1.0) with overloads Inc(int) and Inc(float)?', ro: '10. Ce se întâmplă la apelul m.Inc(1.0) cu supraîncărcările Inc(int) și Inc(float)?' },
    options: [
      { text: { en: 'Calls Inc(float) — double promotes to float', ro: 'Apelează Inc(float) — double se promovează la float' }, correct: false },
      { text: { en: 'Calls Inc(int) — double converts to int', ro: 'Apelează Inc(int) — double se convertește la int' }, correct: false },
      { text: { en: 'Compilation error — ambiguous call', ro: 'Eroare de compilare — apel ambiguu' }, correct: true },
      { text: { en: 'Calls Inc(float) — nearest type', ro: 'Apelează Inc(float) — tipul cel mai apropiat' }, correct: false },
    ],
    explanation: { en: '1.0 is a double. Promotion only works for float->double (not double->float). Since there is no Inc(double), and two overloads exist, the compiler reports ambiguity.', ro: '1.0 este un double. Promovarea funcționează doar pentru float->double (nu double->float). Deoarece nu există Inc(double), și există două supraîncărcări, compilatorul raportează ambiguitate.' },
  },
];

/* ═══════════════════════════════════════════════════════════
   Course 3: Constructors, Init lists, Copy/Move, Value types
   ═══════════════════════════════════════════════════════════ */
const course3Questions = [
  {
    question: { en: '1. What does int arr[5] = { 1 }; produce?', ro: '1. Ce produce int arr[5] = { 1 };?' },
    options: [
      { text: '[1, 1, 1, 1, 1]', correct: false },
      { text: '[1, 0, 0, 0, 0]', correct: true },
      { text: { en: '[1, garbage, garbage, garbage, garbage]', ro: '[1, gunoi, gunoi, gunoi, gunoi]' }, correct: false },
      { text: { en: 'Compilation error', ro: 'Eroare de compilare' }, correct: false },
    ],
    explanation: { en: 'If the initialization list is smaller than the array, remaining elements are filled with the default value (0 for int). Result: [1, 0, 0, 0, 0].', ro: 'Dacă lista de inițializare este mai mică decât tabloul, elementele rămase sunt completate cu valoarea implicită (0 pentru int). Rezultat: [1, 0, 0, 0, 0].' },
  },
  {
    question: { en: '2. When are global object constructors called?', ro: '2. Când sunt apelați constructorii obiectelor globale?' },
    options: [
      { text: { en: 'When the object is first used', ro: 'Când obiectul este folosit prima dată' }, correct: false },
      { text: { en: 'At the beginning of main()', ro: 'La începutul main()' }, correct: false },
      { text: { en: 'Before main() begins execution', ro: 'Înainte ca main() să înceapă execuția' }, correct: true },
      { text: { en: 'After all local variables are initialized', ro: 'După ce toate variabilele locale sunt inițializate' }, correct: false },
    ],
    explanation: { en: 'Global variables have their constructors called before main() begins. The output order is: global ctors, then "Entering main", then local ctors.', ro: 'Variabilele globale au constructorii apelați înainte ca main() să înceapă. Ordinea de afișare este: ctori globali, apoi "Entering main", apoi ctori locali.' },
  },
  {
    question: { en: '3. In which order are data members initialized in a constructor?', ro: '3. În ce ordine sunt inițializați membrii date într-un constructor?' },
    options: [
      { text: { en: 'In the order they appear in the initializer list', ro: 'În ordinea în care apar în lista de inițializare' }, correct: false },
      { text: { en: 'In the order they are declared in the class', ro: 'În ordinea în care sunt declarați în clasă' }, correct: true },
      { text: { en: 'Alphabetical order', ro: 'Ordine alfabetică' }, correct: false },
      { text: { en: 'Random order (implementation-defined)', ro: 'Ordine aleatorie (definită de implementare)' }, correct: false },
    ],
    explanation: { en: 'Data members are initialized in declaration order in the class, NOT in the order they appear in the initializer list. This can cause undefined behavior if one member depends on another.', ro: 'Membrii date sunt inițializați în ordinea declarării în clasă, NU în ordinea din lista de inițializare. Aceasta poate cauza comportament nedefinit dacă un membru depinde de altul.' },
  },
  {
    question: { en: '4. Where must const and reference data members be initialized?', ro: '4. Unde trebuie inițializați membrii date const și referință?' },
    options: [
      { text: { en: 'In the constructor body', ro: 'În corpul constructorului' }, correct: false },
      { text: { en: 'In the constructor initializer list', ro: 'În lista de inițializare a constructorului' }, correct: true },
      { text: { en: 'Either in the body or the initializer list', ro: 'Fie în corp fie în lista de inițializare' }, correct: false },
      { text: { en: 'They cannot be class members', ro: 'Nu pot fi membri ai clasei' }, correct: false },
    ],
    explanation: { en: 'Const and reference members MUST be initialized in the constructor initializer list, not in the body. Assignment in the body (y = 123) is not initialization — it is reassignment, which is illegal for const/references.', ro: 'Membrii const și referință TREBUIE inițializați în lista de inițializare a constructorului, nu în corp. Atribuirea în corp (y = 123) nu este inițializare — este reasignare, ilegală pentru const/referințe.' },
  },
  {
    question: { en: '5. Can a delegating constructor mix delegation with other member initializations?', ro: '5. Poate un constructor delegat combina delegarea cu alte inițializări de membri?' },
    options: [
      { text: { en: 'Yes — all initializations are combined', ro: 'Da — toate inițializările sunt combinate' }, correct: false },
      { text: { en: 'No — the delegating call must be the only item in the initializer list', ro: 'Nu — apelul delegat trebuie să fie singurul element din lista de inițializare' }, correct: true },
      { text: { en: 'Only for non-const members', ro: 'Doar pentru membrii non-const' }, correct: false },
      { text: { en: 'Only if the class has no virtual methods', ro: 'Doar dacă clasa nu are metode virtuale' }, correct: false },
    ],
    explanation: { en: 'When calling a delegating constructor, no other member initializations are allowed in the same initializer list. However, you CAN modify members in the constructor body after delegation.', ro: 'Când se apelează un constructor delegat, nu sunt permise alte inițializări în aceeași listă de inițializare. Totuși, PUTEȚI modifica membrii în corpul constructorului după delegare.' },
  },
  {
    question: { en: '6. Is the expression "a++" an lvalue or a prvalue?', ro: '6. Expresia "a++" este un lvalue sau un prvalue?' },
    options: [
      { text: 'lvalue', correct: false },
      { text: 'prvalue', correct: true },
      { text: 'xvalue', correct: false },
      { text: 'glvalue', correct: false },
    ],
    explanation: { en: 'a++ (post-increment) is a prvalue — it returns the old value (a copy), not a reference to the variable. In contrast, ++a (pre-increment) is a glvalue/lvalue because it returns a reference to the modified variable.', ro: 'a++ (post-incrementare) este un prvalue — returnează valoarea veche (o copie), nu o referință la variabilă. În contrast, ++a (pre-incrementare) este un glvalue/lvalue deoarece returnează o referință la variabila modificată.' },
  },
  {
    question: { en: '7. What is the advantage of a move constructor over a copy constructor?', ro: '7. Care este avantajul constructorului de mutare față de cel de copiere?' },
    options: [
      { text: { en: 'It is thread-safe', ro: 'Este thread-safe' }, correct: false },
      { text: { en: 'It reuses allocated memory instead of duplicating it', ro: 'Reutilizează memoria alocată în loc să o duplice' }, correct: true },
      { text: { en: 'It works with const objects', ro: 'Funcționează cu obiecte const' }, correct: false },
      { text: { en: 'It can initialize references', ro: 'Poate inițializa referințe' }, correct: false },
    ],
    explanation: { en: 'The move constructor "steals" the resources (e.g., pointers) from a temporary object instead of duplicating them. This avoids expensive memory allocations and copies.', ro: 'Constructorul de mutare "fură" resursele (ex: pointerii) de la un obiect temporar în loc să le duplice. Aceasta evită alocările de memorie și copierile costisitoare.' },
  },
  {
    question: { en: '8. What happens with circular constructor delegation?', ro: '8. Ce se întâmplă cu delegarea circulară de constructori?' },
    options: [
      { text: { en: 'Compilation error', ro: 'Eroare de compilare' }, correct: false },
      { text: { en: 'The code compiles but crashes at runtime (stack overflow)', ro: 'Codul compilează dar se blochează la runtime (stack overflow)' }, correct: true },
      { text: { en: 'The compiler detects and breaks the cycle', ro: 'Compilatorul detectează și oprește ciclul' }, correct: false },
      { text: { en: 'Nothing — the default constructor is used', ro: 'Nimic — se folosește constructorul implicit' }, correct: false },
    ],
    explanation: { en: 'Circular delegation (A calls B which calls A) compiles but causes infinite recursion at runtime, resulting in a stack overflow crash.', ro: 'Delegarea circulară (A apelează B care apelează A) compilează dar cauzează recursie infinită la runtime, rezultând un crash de stack overflow.' },
  },
  {
    question: { en: '9. Given class Object { int x, y, z; Object(int v) : y(v), z(v/2), x(y*z) {} }; — what is x after Object o(10)?', ro: '9. Dat class Object { int x, y, z; Object(int v) : y(v), z(v/2), x(y*z) {} }; — care este x după Object o(10)?' },
    options: [
      { text: '50 (10 * 5)', correct: false },
      { text: { en: 'Undefined — x is initialized before y and z', ro: 'Nedefinit — x este inițializat înainte de y și z' }, correct: true },
      { text: '0', correct: false },
      { text: '10', correct: false },
    ],
    explanation: { en: 'Members are initialized in declaration order (x, y, z), not initializer list order. x is initialized first using y*z, but y and z are not yet initialized at that point — x gets an undefined value.', ro: 'Membrii sunt inițializați în ordinea declarării (x, y, z), nu a listei de inițializare. x este inițializat primul folosind y*z, dar y și z nu sunt încă inițializați — x primește o valoare nedefinită.' },
  },
  {
    question: { en: '10. When is the copy constructor called?', ro: '10. Când este apelat constructorul de copiere?' },
    options: [
      { text: { en: 'Only with operator= (d2 = d)', ro: 'Doar cu operator= (d2 = d)' }, correct: false },
      { text: { en: 'When passing an object by value to a function', ro: 'La transmiterea unui obiect prin valoare unei funcții' }, correct: true },
      { text: { en: 'Only when using new', ro: 'Doar la folosirea new' }, correct: false },
      { text: { en: 'When deleting an object', ro: 'La ștergerea unui obiect' }, correct: false },
    ],
    explanation: { en: 'The copy constructor is called when: (1) creating an object from another (Date d2 = d), (2) passing by value to a function, (3) returning by value from a function. Assignment (d2 = d on existing objects) calls operator=, not the copy constructor.', ro: 'Constructorul de copiere este apelat la: (1) crearea unui obiect din altul (Date d2 = d), (2) transmiterea prin valoare, (3) returnarea prin valoare. Atribuirea (d2 = d pe obiecte existente) apelează operator=, nu constructorul de copiere.' },
  },
];

/* ═══════════════════════════════════════════════════════════
   Course 4: Destructor, Operators, Overloading, Assignment
   ═══════════════════════════════════════════════════════════ */
const course4Questions = [
  {
    question: { en: '1. What happens when you use delete instead of delete[] on an array of objects?', ro: '1. Ce se întâmplă când folosești delete în loc de delete[] pe un vector de obiecte?' },
    options: [
      { text: { en: 'All destructors are called normally', ro: 'Toți destructorii sunt apelați normal' }, correct: false },
      { text: { en: 'Only the first element\'s destructor is called (likely crash)', ro: 'Doar destructorul primului element este apelat (probabil crash)' }, correct: true },
      { text: { en: 'Compilation error', ro: 'Eroare de compilare' }, correct: false },
      { text: { en: 'Memory leak but no crash', ro: 'Memory leak dar fără crash' }, correct: false },
    ],
    explanation: { en: 'Using delete instead of delete[] on an array only destroys the first element and may crash. delete[] calls the destructor for every element in reverse order.', ro: 'Folosirea delete în loc de delete[] pe un vector distruge doar primul element și poate cauza crash. delete[] apelează destructorul pentru fiecare element în ordine inversă.' },
  },
  {
    question: { en: '2. In what order are objects destroyed?', ro: '2. În ce ordine sunt distruse obiectele?' },
    options: [
      { text: { en: 'Same order as creation', ro: 'Aceeași ordine ca la creare' }, correct: false },
      { text: { en: 'Reverse order of creation', ro: 'Ordinea inversă a creării' }, correct: true },
      { text: { en: 'Random order', ro: 'Ordine aleatorie' }, correct: false },
      { text: { en: 'Alphabetical by variable name', ro: 'Alfabetică după numele variabilei' }, correct: false },
    ],
    explanation: { en: 'Objects are destroyed in reverse order of creation (like a stack — LIFO). For classes with member objects, the class destructor runs first, then member destructors in reverse declaration order.', ro: 'Obiectele sunt distruse în ordinea inversă a creării (ca un stack — LIFO). Pentru clase cu obiecte membre, destructorul clasei se execută primul, apoi destructorii membrilor în ordinea inversă.' },
  },
  {
    question: { en: '3. Which operators CANNOT be overloaded in C++?', ro: '3. Care operatori NU pot fi supraîncărcați în C++?' },
    options: [
      { text: '+ - * /', correct: false },
      { text: 'new delete [] ()', correct: false },
      { text: 'sizeof :: . ?:', correct: true },
      { text: '<< >> == !=', correct: false },
    ],
    explanation: { en: 'Operators sizeof, :: (scope), . (member access), and ?: (ternary) cannot be overloaded. Most other operators can be overloaded.', ro: 'Operatorii sizeof, :: (scop), . (acces membru) și ?: (ternar) nu pot fi supraîncărcați. Majoritatea celorlalți operatori pot fi supraîncărcați.' },
  },
  {
    question: { en: '4. Why does "1.2f + n1" fail when operator+ is a member function of Integer?', ro: '4. De ce eșuează "1.2f + n1" când operator+ este funcție membru a lui Integer?' },
    options: [
      { text: { en: 'float cannot be added to objects', ro: 'float nu poate fi adunat la obiecte' }, correct: false },
      { text: { en: 'Member operator+ requires the object on the left side', ro: 'operator+ membru necesită obiectul în partea stângă' }, correct: true },
      { text: { en: 'Missing cast operator', ro: 'Lipsește operatorul de cast' }, correct: false },
      { text: { en: 'It works fine', ro: 'Funcționează corect' }, correct: false },
    ],
    explanation: { en: '"n1+float" works because it calls n1.operator+(float). But "float+n1" fails because float has no operator+(Integer). Solution: use friend functions to handle both orders.', ro: '"n1+float" funcționează deoarece apelează n1.operator+(float). Dar "float+n1" eșuează deoarece float nu are operator+(Integer). Soluția: funcții friend.' },
  },
  {
    question: { en: '5. How does the compiler distinguish prefix ++ from postfix ++?', ro: '5. Cum distinge compilatorul prefix ++ de postfix ++?' },
    options: [
      { text: { en: 'By the return type', ro: 'Prin tipul de retur' }, correct: false },
      { text: { en: 'Postfix has a dummy int parameter', ro: 'Postfix are un parametru int fictiv' }, correct: true },
      { text: { en: 'Prefix is a friend function', ro: 'Prefix este funcție friend' }, correct: false },
      { text: { en: 'They cannot both be defined', ro: 'Nu pot fi definite amândouă' }, correct: false },
    ],
    explanation: { en: 'Prefix operator++() has no parameter. Postfix operator++(int) has a dummy int parameter (always 0). Prefix returns a reference, postfix returns a copy of the old value.', ro: 'Prefix operator++() nu are parametru. Postfix operator++(int) are un parametru int fictiv (întotdeauna 0). Prefix returnează referință, postfix returnează copie a valorii vechi.' },
  },
  {
    question: { en: '6. What happens when overloading operator|| for a class?', ro: '6. Ce se întâmplă la supraîncărcarea operator|| pentru o clasă?' },
    options: [
      { text: { en: 'Short-circuit (lazy) evaluation is preserved', ro: 'Evaluarea cu scurtcircuit (leneșă) este păstrată' }, correct: false },
      { text: { en: 'Short-circuit evaluation is lost — all operands are always evaluated', ro: 'Evaluarea cu scurtcircuit se pierde — toți operanzii sunt întotdeauna evaluați' }, correct: true },
      { text: { en: 'It cannot be overloaded', ro: 'Nu poate fi supraîncărcat' }, correct: false },
      { text: { en: 'It only works with bool types', ro: 'Funcționează doar cu tipuri bool' }, correct: false },
    ],
    explanation: { en: 'An overloaded operator becomes a regular function call, and all arguments must be evaluated before the call. The compiler cannot short-circuit because it does not know the custom semantics.', ro: 'Un operator supraîncărcat devine un apel de funcție obișnuit, și toate argumentele trebuie evaluate înainte de apel. Compilatorul nu poate face scurtcircuit deoarece nu cunoaște semantica personalizată.' },
  },
  {
    question: { en: '7. Which operators CANNOT be implemented as friend functions?', ro: '7. Care operatori NU pot fi implementați ca funcții friend?' },
    options: [
      { text: '+ - * /', correct: false },
      { text: '+= -= *= /=', correct: false },
      { text: '= [] () ->', correct: true },
      { text: '<< >> == !=', correct: false },
    ],
    explanation: { en: 'operator=, operator[], operator(), operator-> must be non-static member functions — they cannot be friend functions. Compound operators (+=, -=, etc.) CAN be friend functions.', ro: 'operator=, operator[], operator(), operator-> trebuie să fie funcții membru non-statice — nu pot fi funcții friend. Operatorii compuși (+=, -=, etc.) POT fi funcții friend.' },
  },
  {
    question: { en: '8. What happens if a class has a private destructor and you try to create a stack-allocated object?', ro: '8. Ce se întâmplă dacă o clasă are destructor privat și încerci să creezi un obiect pe stack?' },
    options: [
      { text: { en: 'Works normally', ro: 'Funcționează normal' }, correct: false },
      { text: { en: 'Compilation error — destructor would be called at scope exit', ro: 'Eroare de compilare — destructorul ar fi apelat la ieșirea din scop' }, correct: true },
      { text: { en: 'Runtime error', ro: 'Eroare la runtime' }, correct: false },
      { text: { en: 'Memory leak', ro: 'Memory leak' }, correct: false },
    ],
    explanation: { en: 'If the destructor is private, the compiler won\'t allow stack-allocated objects because the destructor would need to be called at scope exit. Heap-allocated objects (new) compile if never deleted.', ro: 'Dacă destructorul este privat, compilatorul nu permite obiecte pe stack deoarece destructorul ar trebui apelat la ieșirea din scop. Obiectele pe heap (new) compilează dacă nu sunt șterse niciodată.' },
  },
  {
    question: { en: '9. Given operator float() and operator+(float) both defined, what takes priority for n1 + 0.2f?', ro: '9. Dat operator float() și operator+(float) ambele definite, ce are prioritate pentru n1 + 0.2f?' },
    options: [
      { text: { en: 'Cast operator — n1 is cast to float first', ro: 'Operatorul de cast — n1 este convertit la float mai întâi' }, correct: false },
      { text: { en: 'operator+(float) takes priority', ro: 'operator+(float) are prioritate' }, correct: true },
      { text: { en: 'Compilation error — ambiguous', ro: 'Eroare de compilare — ambiguu' }, correct: false },
      { text: { en: 'They cannot coexist', ro: 'Nu pot coexista' }, correct: false },
    ],
    explanation: { en: 'If both operator float() and operator+(float) exist, the operator+ takes priority over implicit cast. The cast is only used when no direct operator match exists.', ro: 'Dacă există atât operator float() cât și operator+(float), operator+ are prioritate față de cast-ul implicit. Cast-ul este folosit doar când nu există o potrivire directă de operator.' },
  },
  {
    question: { en: '10. What does the comma operator return by default (without overloading)?', ro: '10. Ce returnează operatorul virgulă implicit (fără supraîncărcare)?' },
    options: [
      { text: { en: 'The first value', ro: 'Prima valoare' }, correct: false },
      { text: { en: 'The last value in the expression', ro: 'Ultima valoare din expresie' }, correct: true },
      { text: { en: 'The sum of all values', ro: 'Suma tuturor valorilor' }, correct: false },
      { text: { en: 'A tuple of all values', ro: 'Un tuplu cu toate valorile' }, correct: false },
    ],
    explanation: { en: 'Without overloading, the comma operator evaluates left to right and returns the last value. For example: int x = (10,20,30,40) gives x = 40.', ro: 'Fără supraîncărcare, operatorul virgulă evaluează de la stânga la dreapta și returnează ultima valoare. De exemplu: int x = (10,20,30,40) dă x = 40.' },
  },
];

/* ═══════════════════════════════════════════════════════════
   Course 5: Inheritance, Virtual, Vtables, Abstract, Diamond
   ═══════════════════════════════════════════════════════════ */
const course5Questions = [
  {
    question: { en: '1. What is the constructor call order for class D : public B, public A { C c; };?', ro: '1. Care este ordinea apelării constructorilor pentru class D : public B, public A { C c; };?' },
    options: [
      { text: 'A, B, C, D', correct: false },
      { text: 'B, A, C, D', correct: true },
      { text: 'D, C, B, A', correct: false },
      { text: 'D, B, A, C', correct: false },
    ],
    explanation: { en: 'Base class constructors first, in inheritance declaration order (B then A). Then data member constructors (C). Finally the class body (D). The initializer list order does NOT matter.', ro: 'Constructorii claselor de bază mai întâi, în ordinea declarării moștenirii (B apoi A). Apoi constructorii membrilor date (C). În final corpul clasei (D). Ordinea listei de inițializare NU contează.' },
  },
  {
    question: { en: '2. What does a->Set() print if A has non-virtual Set() printing "A", B overrides it printing "B", and a is A* pointing to a B object?', ro: '2. Ce afișează a->Set() dacă A are Set() non-virtual afișând "A", B o suprascrie afișând "B", și a este A* spre un obiect B?' },
    options: [
      { text: '"B"', correct: false },
      { text: '"A"', correct: true },
      { text: { en: 'Compilation error', ro: 'Eroare de compilare' }, correct: false },
      { text: '"AB"', correct: false },
    ],
    explanation: { en: 'Without the virtual keyword, method resolution is based on the pointer type (A*), not the actual object type (B). So A::Set() is called. With virtual, B::Set() would be called.', ro: 'Fără cuvântul cheie virtual, rezoluția metodei se face pe baza tipului pointerului (A*), nu a tipului real al obiectului (B). Deci se apelează A::Set(). Cu virtual, s-ar apela B::Set().' },
  },
  {
    question: { en: '3. What is sizeof(A) on x86 if: class A { int a1, a2, a3; virtual void Set(); };?', ro: '3. Care este sizeof(A) pe x86 dacă: class A { int a1, a2, a3; virtual void Set(); };?' },
    options: [
      { text: '12', correct: false },
      { text: '16', correct: true },
      { text: '20', correct: false },
      { text: '24', correct: false },
    ],
    explanation: { en: 'The virtual keyword adds a hidden vfptr pointer (4 bytes on x86) as the first field. Layout: vfptr(4) + a1(4) + a2(4) + a3(4) = 16 bytes.', ro: 'Cuvântul cheie virtual adaugă un pointer vfptr ascuns (4 bytes pe x86) ca prim câmp. Layout: vfptr(4) + a1(4) + a2(4) + a3(4) = 16 bytes.' },
  },
  {
    question: { en: '4. What happens when deleting a derived object through a base pointer without a virtual destructor?', ro: '4. Ce se întâmplă la ștergerea unui obiect derivat printr-un pointer de bază fără destructor virtual?' },
    options: [
      { text: { en: 'Both destructors are called correctly', ro: 'Ambii destructori sunt apelați corect' }, correct: false },
      { text: { en: 'Only the base class destructor is called (memory leak)', ro: 'Doar destructorul clasei de bază este apelat (memory leak)' }, correct: true },
      { text: { en: 'Only the derived class destructor is called', ro: 'Doar destructorul clasei derivate este apelat' }, correct: false },
      { text: { en: 'Compilation error', ro: 'Eroare de compilare' }, correct: false },
    ],
    explanation: { en: 'Without a virtual destructor, deleting through a base pointer only calls the base destructor. If the derived class allocates memory, this causes memory leaks.', ro: 'Fără destructor virtual, ștergerea prin pointer de bază apelează doar destructorul de bază. Dacă clasa derivată alocă memorie, aceasta cauzează memory leak-uri.' },
  },
  {
    question: { en: '5. What does the "override" specifier do?', ro: '5. Ce face specificatorul "override"?' },
    options: [
      { text: { en: 'Makes a method virtual', ro: 'Face o metodă virtuală' }, correct: false },
      { text: { en: 'Verifies at compile time that the method actually overrides a base virtual method', ro: 'Verifică la compilare că metoda suprascrie efectiv o metodă virtuală de bază' }, correct: true },
      { text: { en: 'Prevents further overriding', ro: 'Împiedică suprascrierea ulterioară' }, correct: false },
      { text: { en: 'Makes the class abstract', ro: 'Face clasa abstractă' }, correct: false },
    ],
    explanation: { en: 'override tells the compiler this method must override a base virtual method. If signatures don\'t match, compilation fails. "final" is the one that prevents further overriding.', ro: 'override spune compilatorului că metoda trebuie să suprascrie o metodă virtuală de bază. Dacă semnăturile nu corespund, compilarea eșuează. "final" este cel care împiedică suprascrierea ulterioară.' },
  },
  {
    question: { en: '6. Can you instantiate an abstract class (one with a pure virtual method)?', ro: '6. Poți instanția o clasă abstractă (una cu o metodă pur virtuală)?' },
    options: [
      { text: { en: 'Yes, but only on the heap', ro: 'Da, dar doar pe heap' }, correct: false },
      { text: { en: 'No, but you can create pointers to it', ro: 'Nu, dar poți crea pointeri către ea' }, correct: true },
      { text: { en: 'Yes, the pure virtual methods are just empty', ro: 'Da, metodele pur virtuale sunt doar goale' }, correct: false },
      { text: { en: 'Only if all pure virtual methods have default implementations', ro: 'Doar dacă toate metodele pur virtuale au implementări implicite' }, correct: false },
    ],
    explanation: { en: 'An abstract class cannot be instantiated. However, pointers to abstract classes are allowed and recommended for polymorphism. Derived classes must implement all pure virtual methods.', ro: 'O clasă abstractă nu poate fi instanțiată. Totuși, pointerii la clase abstracte sunt permiși și recomandați pentru polimorfism. Clasele derivate trebuie să implementeze toate metodele pur virtuale.' },
  },
  {
    question: { en: '7. What happens when a virtual method is called directly on an object (not through a pointer)?', ro: '7. Ce se întâmplă când o metodă virtuală este apelată direct pe un obiect (nu prin pointer)?' },
    options: [
      { text: { en: 'The vtable is used for dispatch', ro: 'Se folosește vtable-ul pentru dispatch' }, correct: false },
      { text: { en: 'The compiler calls the method directly (no vtable lookup)', ro: 'Compilatorul apelează metoda direct (fără căutare în vtable)' }, correct: true },
      { text: { en: 'Compilation error', ro: 'Eroare de compilare' }, correct: false },
      { text: { en: 'Undefined behavior', ro: 'Comportament nedefinit' }, correct: false },
    ],
    explanation: { en: 'Virtual dispatch via vfptr occurs ONLY through pointers. When called directly on an object (a.Method()), the compiler uses the exact address without vtable lookup.', ro: 'Dispatch-ul virtual prin vfptr are loc DOAR prin pointeri. Când este apelat direct pe un obiect (a.Method()), compilatorul folosește adresa exactă fără căutare în vtable.' },
  },
  {
    question: { en: '8. If a public member of Base becomes inherited with "private" inheritance, what access level does it have in Derived?', ro: '8. Dacă un membru public al clasei Base este moștenit cu moștenire "private", ce nivel de acces are în Derived?' },
    options: [
      { text: 'public', correct: false },
      { text: 'protected', correct: false },
      { text: 'private', correct: true },
      { text: { en: 'It is not inherited', ro: 'Nu este moștenit' }, correct: false },
    ],
    explanation: { en: 'With private inheritance, all inherited members become private in the derived class. The rule: the resulting access is the more restrictive of the member\'s access and the inheritance access.', ro: 'Cu moștenire privată, toți membrii moșteniți devin private în clasa derivată. Regula: accesul rezultat este cel mai restrictiv dintre accesul membrului și accesul moștenirii.' },
  },
  {
    question: { en: '9. What is "object slicing"?', ro: '9. Ce este "object slicing"?' },
    options: [
      { text: { en: 'Dividing an object into smaller parts', ro: 'Împărțirea unui obiect în părți mai mici' }, correct: false },
      { text: { en: 'When passing a derived object by value to a base-type parameter, only base fields are copied', ro: 'Când un obiect derivat este transmis prin valoare unui parametru de tip bază, doar câmpurile de bază sunt copiate' }, correct: true },
      { text: { en: 'Deleting parts of an object\'s memory', ro: 'Ștergerea părților memoriei unui obiect' }, correct: false },
      { text: { en: 'Using reinterpret_cast on a polymorphic object', ro: 'Folosirea reinterpret_cast pe un obiect polimorfic' }, correct: false },
    ],
    explanation: { en: 'Object slicing occurs when a derived object is passed by value to a function expecting the base type. Only base-class fields are copied; derived-class fields are "sliced off".', ro: 'Object slicing apare când un obiect derivat este transmis prin valoare unei funcții care așteaptă tipul de bază. Doar câmpurile clasei de bază sunt copiate; câmpurile derivate sunt "tăiate".' },
  },
  {
    question: { en: '10. Does operator= copy the vfptr (vtable pointer)?', ro: '10. Copiază operator= vfptr-ul (pointerul la vtable)?' },
    options: [
      { text: { en: 'Yes — the entire object is copied including vfptr', ro: 'Da — întregul obiect este copiat inclusiv vfptr' }, correct: false },
      { text: { en: 'No — the compiler does NOT add vfptr initialization to operator=', ro: 'Nu — compilatorul NU adaugă inițializarea vfptr la operator=' }, correct: true },
      { text: { en: 'Only if the operator= is virtual', ro: 'Doar dacă operator= este virtual' }, correct: false },
      { text: { en: 'Only during move assignment', ro: 'Doar la atribuirea prin mutare' }, correct: false },
    ],
    explanation: { en: 'The vfptr initialization code is added to constructors (default, copy, parameterized) but NOT to the assignment operator. This prevents changing the type of an object via assignment.', ro: 'Codul de inițializare vfptr este adăugat la constructori (implicit, copiere, parametrizat) dar NU la operatorul de atribuire. Aceasta previne schimbarea tipului unui obiect prin atribuire.' },
  },
];

/* ═══════════════════════════════════════════════════════════
   Course 6: Casts, Macros, Templates, Specialization
   ═══════════════════════════════════════════════════════════ */
const course6Questions = [
  {
    question: { en: '1. What does reinterpret_cast do when casting between inherited classes?', ro: '1. Ce face reinterpret_cast la cast-ul între clase moștenite?' },
    options: [
      { text: { en: 'Adjusts the pointer for correct memory layout', ro: 'Ajustează pointerul pentru layout-ul corect de memorie' }, correct: false },
      { text: { en: 'Keeps the same address (no pointer adjustment)', ro: 'Păstrează aceeași adresă (fără ajustare de pointer)' }, correct: true },
      { text: { en: 'Checks RTTI at runtime', ro: 'Verifică RTTI la runtime' }, correct: false },
      { text: { en: 'Removes const qualifier', ro: 'Elimină calificatorul const' }, correct: false },
    ],
    explanation: { en: 'reinterpret_cast keeps the same address without any pointer adjustment. static_cast adjusts the pointer for multiple inheritance. This means reinterpret_cast can point to the wrong subobject.', ro: 'reinterpret_cast păstrează aceeași adresă fără ajustare. static_cast ajustează pointerul pentru moștenire multiplă. Aceasta înseamnă că reinterpret_cast poate indica subobiectul greșit.' },
  },
  {
    question: { en: '2. What does dynamic_cast return when the cast is invalid (for pointers)?', ro: '2. Ce returnează dynamic_cast când cast-ul este invalid (pentru pointeri)?' },
    options: [
      { text: { en: 'Throws an exception', ro: 'Aruncă o excepție' }, correct: false },
      { text: 'nullptr', correct: true },
      { text: { en: 'The original pointer unchanged', ro: 'Pointerul original neschimbat' }, correct: false },
      { text: { en: 'Compilation error', ro: 'Eroare de compilare' }, correct: false },
    ],
    explanation: { en: 'dynamic_cast returns nullptr if the cast is invalid (for pointers). It requires at least one virtual method (polymorphic type). For references, it throws std::bad_cast.', ro: 'dynamic_cast returnează nullptr dacă cast-ul este invalid (pentru pointeri). Necesită cel puțin o metodă virtuală (tip polimorfic). Pentru referințe, aruncă std::bad_cast.' },
  },
  {
    question: { en: '3. What happens when using const_cast on a const variable and modifying it?', ro: '3. Ce se întâmplă la folosirea const_cast pe o variabilă const și modificarea ei?' },
    options: [
      { text: { en: 'The value is changed as expected', ro: 'Valoarea este schimbată conform așteptărilor' }, correct: false },
      { text: { en: 'Compilation error', ro: 'Eroare de compilare' }, correct: false },
      { text: { en: 'Undefined behavior — compiler may still use the original constant value', ro: 'Comportament nedefinit — compilatorul poate folosi în continuare valoarea constantă originală' }, correct: true },
      { text: { en: 'Runtime exception', ro: 'Excepție la runtime' }, correct: false },
    ],
    explanation: { en: 'The compiler assumes const variables never change, so it may replace reads with the compile-time constant. Even after const_cast modification, printf may still print the original value.', ro: 'Compilatorul presupune că variabilele const nu se schimbă niciodată, deci poate înlocui citirile cu constanta de la compilare. Chiar și după modificare cu const_cast, printf poate afișa valoarea originală.' },
  },
  {
    question: { en: '4. What is wrong with: #define DIV(x,y) x/y when called as DIV(10+10, 5+5)?', ro: '4. Ce este greșit cu: #define DIV(x,y) x/y când este apelat ca DIV(10+10, 5+5)?' },
    options: [
      { text: { en: 'Nothing — returns 2', ro: 'Nimic — returnează 2' }, correct: false },
      { text: { en: 'Expands to 10+10/5+5 = 17 (missing parentheses)', ro: 'Se expandează la 10+10/5+5 = 17 (lipsesc parantezele)' }, correct: true },
      { text: { en: 'Division by zero', ro: 'Împărțire la zero' }, correct: false },
      { text: { en: 'Preprocessor error', ro: 'Eroare de preprocesor' }, correct: false },
    ],
    explanation: { en: 'Macros do text substitution without analyzing expressions. DIV(10+10, 5+5) becomes 10+10/5+5 = 10+2+5 = 17. The correct form is #define DIV(x,y) ((x)/(y)).', ro: 'Macro-urile fac substituție de text fără a analiza expresiile. DIV(10+10, 5+5) devine 10+10/5+5 = 10+2+5 = 17. Forma corectă este #define DIV(x,y) ((x)/(y)).' },
  },
  {
    question: { en: '5. Why does template<class T> T Sum(T v1, T v2) fail for Sum(1, 2.5)?', ro: '5. De ce eșuează template<class T> T Sum(T v1, T v2) pentru Sum(1, 2.5)?' },
    options: [
      { text: { en: 'Templates cannot have two parameters', ro: 'Șabloanele nu pot avea doi parametri' }, correct: false },
      { text: { en: 'T is deduced as int from 1 and double from 2.5 — ambiguous', ro: 'T este dedus ca int din 1 și double din 2.5 — ambiguu' }, correct: true },
      { text: { en: 'Templates only work with classes', ro: 'Șabloanele funcționează doar cu clase' }, correct: false },
      { text: { en: 'Missing explicit type', ro: 'Lipsește tipul explicit' }, correct: false },
    ],
    explanation: { en: '1 is int and 2.5 is double. Both must be the same type T, creating ambiguity. Fix with Sum<double>(1, 2.5) or use two template types.', ro: '1 este int și 2.5 este double. Ambii trebuie să fie același tip T, creând ambiguitate. Se rezolvă cu Sum<double>(1, 2.5) sau cu două tipuri de șablon.' },
  },
  {
    question: { en: '6. Why must templates be stored in header files (.h)?', ro: '6. De ce trebuie stocate șabloanele în fișiere header (.h)?' },
    options: [
      { text: { en: 'Because the compiler needs them for substitution during precompilation', ro: 'Deoarece compilatorul le necesită pentru substituție în timpul precompilării' }, correct: true },
      { text: { en: 'It is just a convention', ro: 'Este doar o convenție' }, correct: false },
      { text: { en: 'They compile faster in headers', ro: 'Compilează mai rapid în headere' }, correct: false },
      { text: { en: 'Linker limitation', ro: 'Limitare a linker-ului' }, correct: false },
    ],
    explanation: { en: 'Templates generate code at precompilation via substitution. If a template is in a .cpp file, other translation units will not be able to use it since the compiler needs the full definition.', ro: 'Șabloanele generează cod la precompilare prin substituție. Dacă un șablon este într-un fișier .cpp, alte unități de traducere nu vor putea să-l folosească deoarece compilatorul necesită definiția completă.' },
  },
  {
    question: { en: '7. What is true about static members in template classes?', ro: '7. Ce este adevărat despre membrii statici în clasele șablon?' },
    options: [
      { text: { en: 'All instantiations share the same static member', ro: 'Toate instanțierile împărtășesc același membru static' }, correct: false },
      { text: { en: 'Each template instantiation has its OWN static member', ro: 'Fiecare instanțiere de șablon are propriul membru static' }, correct: true },
      { text: { en: 'Template classes cannot have static members', ro: 'Clasele șablon nu pot avea membri statici' }, correct: false },
      { text: { en: 'Static members are ignored in templates', ro: 'Membrii statici sunt ignorați în șabloane' }, correct: false },
    ],
    explanation: { en: 'Each instantiation (e.g., Number<int>, Number<char>) has its own separate static member. They must be defined separately: int Number<int>::Count = 10; int Number<char>::Count = 20;', ro: 'Fiecare instanțiere (ex: Number<int>, Number<char>) are propriul membru static separat. Trebuie definiți separat: int Number<int>::Count = 10; int Number<char>::Count = 20;' },
  },
  {
    question: { en: '8. Given template<class T = int> class Stack, is "Stack s;" valid?', ro: '8. Dat template<class T = int> class Stack, este "Stack s;" valid?' },
    options: [
      { text: { en: 'Yes — uses the default type', ro: 'Da — folosește tipul implicit' }, correct: false },
      { text: { en: 'No — must use Stack<> s; (empty angle brackets required)', ro: 'Nu — trebuie Stack<> s; (paranteze unghiulare goale necesare)' }, correct: true },
      { text: { en: 'Yes — but only in C++17', ro: 'Da — dar doar în C++17' }, correct: false },
      { text: { en: 'No — default types are not allowed', ro: 'Nu — tipurile implicite nu sunt permise' }, correct: false },
    ],
    explanation: { en: 'Even with a default type parameter, angle brackets (<>) are required to indicate template instantiation. Stack<> s; is correct, Stack s; is an error.', ro: 'Chiar și cu un parametru de tip implicit, parantezele unghiulare (<>) sunt necesare. Stack<> s; este corect, Stack s; este o eroare.' },
  },
  {
    question: { en: '9. What is the difference between inline functions and macros?', ro: '9. Care este diferența între funcțiile inline și macro-uri?' },
    options: [
      { text: { en: 'Macros guarantee inline expansion; inline is just a suggestion', ro: 'Macro-urile garantează expandarea inline; inline este doar o sugestie' }, correct: true },
      { text: { en: 'Inline guarantees expansion; macros are just suggestions', ro: 'Inline garantează expandarea; macro-urile sunt doar sugestii' }, correct: false },
      { text: { en: 'They are identical in behavior', ro: 'Sunt identice ca comportament' }, correct: false },
      { text: { en: 'Macros support overloading', ro: 'Macro-urile suportă supraîncărcarea' }, correct: false },
    ],
    explanation: { en: 'Macros GUARANTEE inline replacement but debugging is tricky. The inline keyword is just a suggestion to the compiler — it may ignore it. Macros do not support overloading.', ro: 'Macro-urile GARANTEAZĂ înlocuirea inline dar debugging-ul este dificil. inline este doar o sugestie — compilatorul o poate ignora. Macro-urile nu suportă supraîncărcarea.' },
  },
  {
    question: { en: '10. Which C++ cast requires the class to have at least one virtual method?', ro: '10. Care cast C++ necesită ca clasa să aibă cel puțin o metodă virtuală?' },
    options: [
      { text: 'reinterpret_cast', correct: false },
      { text: 'static_cast', correct: false },
      { text: 'dynamic_cast', correct: true },
      { text: 'const_cast', correct: false },
    ],
    explanation: { en: 'dynamic_cast uses RTTI from the vfptr to safely validate casts at runtime. Without at least one virtual method, there is no vtable/RTTI, so dynamic_cast cannot be used.', ro: 'dynamic_cast folosește RTTI din vfptr pentru a valida cast-urile la runtime. Fără cel puțin o metodă virtuală, nu există vtable/RTTI, deci dynamic_cast nu poate fi folosit.' },
  },
];

/* ═══════════════════════════════════════════════════════════
   Course 7: STL Containers, Adaptors, Streams, Strings, Iterators
   ═══════════════════════════════════════════════════════════ */
const course7Questions = [
  {
    question: { en: '1. What is the difference between push_back and emplace_back for vectors?', ro: '1. Care este diferența între push_back și emplace_back pentru vectori?' },
    options: [
      { text: { en: 'They are identical', ro: 'Sunt identice' }, correct: false },
      { text: { en: 'emplace_back constructs the object directly in the vector (no copy)', ro: 'emplace_back construiește obiectul direct în vector (fără copiere)' }, correct: true },
      { text: { en: 'push_back is faster', ro: 'push_back este mai rapid' }, correct: false },
      { text: { en: 'emplace_back only works with basic types', ro: 'emplace_back funcționează doar cu tipuri de bază' }, correct: false },
    ],
    explanation: { en: 'emplace_back constructs the object in-place in vector memory. push_back first constructs then copies/moves. emplace_back avoids the copy constructor call.', ro: 'emplace_back construiește obiectul direct în memoria vectorului. push_back mai întâi construiește apoi copiază/mută. emplace_back evită apelul constructorului de copiere.' },
  },
  {
    question: { en: '2. Why is vector without reserve() much slower than deque for many insertions?', ro: '2. De ce este vectorul fără reserve() mult mai lent decât deque pentru multe inserări?' },
    options: [
      { text: { en: 'Deque uses faster algorithms', ro: 'Deque folosește algoritmi mai rapizi' }, correct: false },
      { text: { en: 'Vector must reallocate and copy ALL elements when full', ro: 'Vectorul trebuie să realoce și copieze TOATE elementele când este plin' }, correct: true },
      { text: { en: 'Vector has slower random access', ro: 'Vectorul are acces aleator mai lent' }, correct: false },
      { text: { en: 'Deque elements are smaller', ro: 'Elementele deque sunt mai mici' }, correct: false },
    ],
    explanation: { en: 'Vector stores elements contiguously. When full, it allocates new space and copies ALL existing elements. Deque uses non-contiguous blocks, so only a new block is allocated. With reserve(), vector pre-allocates.', ro: 'Vectorul stochează elementele contiguu. Când este plin, alocă spațiu nou și copiază TOATE elementele. Deque folosește blocuri necontigue. Cu reserve(), vectorul pre-alocă.' },
  },
  {
    question: { en: '3. What is the difference between operator[] and at() for containers?', ro: '3. Care este diferența între operator[] și at() pentru containere?' },
    options: [
      { text: { en: 'They are identical', ro: 'Sunt identice' }, correct: false },
      { text: { en: 'at() always checks bounds; [] only checks in Debug mode', ro: 'at() verifică întotdeauna limitele; [] doar în modul Debug' }, correct: true },
      { text: { en: '[] is safer than at()', ro: '[] este mai sigur decât at()' }, correct: false },
      { text: { en: 'at() returns a copy; [] returns a reference', ro: 'at() returnează o copie; [] returnează o referință' }, correct: false },
    ],
    explanation: { en: 'at() always checks bounds and throws std::out_of_range. operator[] checks bounds only in Debug mode; in Release, no check — accessing out-of-bounds is undefined behavior.', ro: 'at() verifică întotdeauna limitele și aruncă std::out_of_range. operator[] verifică doar în modul Debug; în Release, fără verificare — accesul în afara limitelor este comportament nedefinit.' },
  },
  {
    question: { en: '4. Why can\'t vector be used as the underlying container for queue?', ro: '4. De ce nu poate fi folosit vector ca și container de bază pentru queue?' },
    options: [
      { text: { en: 'Vector has no iterators', ro: 'Vectorul nu are iteratori' }, correct: false },
      { text: { en: 'Vector does not implement pop_front', ro: 'Vectorul nu implementează pop_front' }, correct: true },
      { text: { en: 'Vector is too slow', ro: 'Vectorul este prea lent' }, correct: false },
      { text: { en: 'Queue only works with list', ro: 'Queue funcționează doar cu list' }, correct: false },
    ],
    explanation: { en: 'Queue requires pop_front (to remove the first element — FIFO). Vector does not implement pop_front. Only deque and list have pop_front.', ro: 'Queue necesită pop_front (pentru a elimina primul element — FIFO). Vectorul nu implementează pop_front. Doar deque și list au pop_front.' },
  },
  {
    question: { en: '5. What does the list iterator support that differs from vector iterator?', ro: '5. Ce suportă iteratorul listei diferit de iteratorul vectorului?' },
    options: [
      { text: { en: 'List iterator supports <, >, + and -', ro: 'Iteratorul listei suportă <, >, + și -' }, correct: false },
      { text: { en: 'List iterator only supports ==, !=, ++, -- (no <, >, +, -)', ro: 'Iteratorul listei suportă doar ==, !=, ++, -- (fără <, >, +, -)' }, correct: true },
      { text: { en: 'List iterator supports random access', ro: 'Iteratorul listei suportă acces aleator' }, correct: false },
      { text: { en: 'They are identical', ro: 'Sunt identice' }, correct: false },
    ],
    explanation: { en: 'List is a doubly-linked list with non-contiguous memory. Its iterator only supports ==, != and ++, --. No <, >, + or - operators. Use it != v.end() instead of it < v.end().', ro: 'List este o listă dublu înlănțuită cu memorie necontiguă. Iteratorul suportă doar ==, != și ++, --. Fără operatorii <, >, + sau -.' },
  },
  {
    question: { en: '6. What is the default internal container for std::stack?', ro: '6. Care este containerul intern implicit pentru std::stack?' },
    options: [
      { text: 'vector', correct: false },
      { text: 'deque', correct: true },
      { text: 'list', correct: false },
      { text: 'array', correct: false },
    ],
    explanation: { en: 'The default container for stack is deque. Stack can also use vector or list. You specify it as: stack<int, vector<int>>.', ro: 'Containerul implicit pentru stack este deque. Stack poate folosi și vector sau list. Se specifică ca: stack<int, vector<int>>.' },
  },
  {
    question: { en: '7. What is the output order of priority_queue after pushing 10, 5, 20, 15?', ro: '7. Care este ordinea de extragere din priority_queue după inserarea 10, 5, 20, 15?' },
    options: [
      { text: '10, 5, 20, 15', correct: false },
      { text: '5, 10, 15, 20', correct: false },
      { text: '20, 15, 10, 5', correct: true },
      { text: '15, 20, 5, 10', correct: false },
    ],
    explanation: { en: 'priority_queue extracts elements by highest priority first (max-heap by default). So the extraction order is: 20, 15, 10, 5.', ro: 'priority_queue extrage elementele cu cea mai mare prioritate mai întâi (max-heap implicit). Deci ordinea de extragere este: 20, 15, 10, 5.' },
  },
  {
    question: { en: '8. What is the danger of using string_view.data() with printf("%s")?', ro: '8. Care este pericolul folosirii string_view.data() cu printf("%s")?' },
    options: [
      { text: { en: 'No danger — it works like std::string', ro: 'Niciun pericol — funcționează ca std::string' }, correct: false },
      { text: { en: 'data() may not be null-terminated — printf reads past the string', ro: 'data() poate să nu fie terminat cu null — printf citește dincolo de string' }, correct: true },
      { text: { en: 'Compilation error', ro: 'Eroare de compilare' }, correct: false },
      { text: { en: 'data() returns nullptr for string_view', ro: 'data() returnează nullptr pentru string_view' }, correct: false },
    ],
    explanation: { en: 'string_view does not guarantee null-termination. Using data() with printf("%s") can read past the view\'s boundaries until hitting a \\0 in memory — undefined behavior.', ro: 'string_view nu garantează terminarea cu null. Folosirea data() cu printf("%s") poate citi dincolo de limitele view-ului până la întâlnirea unui \\0 — comportament nedefinit.' },
  },
  {
    question: { en: '9. Which manipulator changes number output to hexadecimal?', ro: '9. Care manipulator schimbă afișarea numerelor în hexazecimal?' },
    options: [
      { text: 'std::dec', correct: false },
      { text: 'std::hex', correct: true },
      { text: 'std::setbase(2)', correct: false },
      { text: 'std::showpoint', correct: false },
    ],
    explanation: { en: 'std::hex changes numeric output to base 16. std::dec for base 10, std::oct for base 8. setbase(b) also works but hex is the common manipulator.', ro: 'std::hex schimbă ieșirea numerică în baza 16. std::dec pentru baza 10, std::oct pentru baza 8. setbase(b) funcționează de asemenea dar hex este manipulatorul comun.' },
  },
  {
    question: { en: '10. What does forward_list support that list does not, and vice versa?', ro: '10. Ce suportă forward_list ce list nu suportă, și invers?' },
    options: [
      { text: { en: 'forward_list has push_back; list does not', ro: 'forward_list are push_back; list nu are' }, correct: false },
      { text: { en: 'forward_list only has push_front and insert_after; list has push_back/push_front', ro: 'forward_list are doar push_front și insert_after; list are push_back/push_front' }, correct: true },
      { text: { en: 'forward_list supports bidirectional iteration', ro: 'forward_list suportă iterare bidirecțională' }, correct: false },
      { text: { en: 'They are identical', ro: 'Sunt identice' }, correct: false },
    ],
    explanation: { en: 'forward_list is a singly-linked list: only push_front, insert_after, erase_after, and forward-only iterator (++, no --). list is doubly-linked with push_back, push_front, and bidirectional iterators.', ro: 'forward_list este o listă simplu înlănțuită: doar push_front, insert_after, erase_after, și iterator unidirecțional (++, fără --). list este dublu înlănțuită cu push_back, push_front și iteratori bidirecționali.' },
  },
];

export default function Practice() {
  const { t } = useApp();
  return (
    <div className="space-y-4">
      <CourseBlock title={t('Course 1: Introduction & Classes', 'Cursul 1: Introducere & Clase')} id="oop-practice-c1">
        <MultipleChoice questions={course1Questions} />
      </CourseBlock>
      <CourseBlock title={t('Course 2: Pointers, References & Overloading', 'Cursul 2: Pointeri, Referințe & Supraîncărcare')} id="oop-practice-c2">
        <MultipleChoice questions={course2Questions} />
      </CourseBlock>
      <CourseBlock title={t('Course 3: Constructors & Value Types', 'Cursul 3: Constructori & Tipuri de Valori')} id="oop-practice-c3">
        <MultipleChoice questions={course3Questions} />
      </CourseBlock>
      <CourseBlock title={t('Course 4: Destructors & Operators', 'Cursul 4: Destructori & Operatori')} id="oop-practice-c4">
        <MultipleChoice questions={course4Questions} />
      </CourseBlock>
      <CourseBlock title={t('Course 5: Inheritance & Polymorphism', 'Cursul 5: Moștenire & Polimorfism')} id="oop-practice-c5">
        <MultipleChoice questions={course5Questions} />
      </CourseBlock>
      <CourseBlock title={t('Course 6: Casts, Macros & Templates', 'Cursul 6: Cast-uri, Macro-uri & Șabloane')} id="oop-practice-c6">
        <MultipleChoice questions={course6Questions} />
      </CourseBlock>
      <CourseBlock title={t('Course 7: STL, Streams & Strings', 'Cursul 7: STL, Fluxuri & Șiruri')} id="oop-practice-c7">
        <MultipleChoice questions={course7Questions} />
      </CourseBlock>
    </div>
  );
}
